/**
 * Is the rough punishing enough? — the junk-lie pricing instrument.
 *
 * THE SUSPICION, registered before measurement (house law: predict, then
 * look): GREENSIDE junk is nearly free. The LIE table (sim/geometry.ts)
 * prices a bad lie by MULTIPLYING the club's spread — rough ×1.7, deep ×2.6,
 * sand ×1.6, trees ×2.4 — and a wedge's spread is 4–6 yards, so 1.7 × tiny
 * is still tiny. The same table that turns a long iron wild may barely move
 * a chip, which would mean the lie table fails its P7 job (hazards price
 * decisions — DESIGN.md) exactly where most junk visits happen: beside the
 * green, where missing a green is supposed to cost something.
 *   PREDICTION: greenside rough < 0.15 strokes/visit;
 *               approach-range deep > 0.60 strokes/visit.
 *
 * WHAT IT MEASURES — strokes lost per visit. Put the ball at a fixed
 * distance from the pin on a real hole from the pool, FORCE the lie, and
 * play to holing out with the standard policy (mixed) and the standard
 * shuffled deck; subtract what the SAME spot / seed / hand costs from
 * FAIRWAY. This is a controlled sweep in the harness idiom rather than a
 * wait-for-the-policy-to-visit census, for two reasons: forcing the lie is
 * the only way to fill every (lie, band) cell with MATCHED pairs (the
 * policy visits greenside trees a handful of times per thousand rounds, and
 * never from the same spot it visits fairway), and pairing on seed cancels
 * the hand, the green and the putting out of the difference — what is left
 * is the price of the lie itself. Real geometry, so recoveries pay real
 * prices: an approach from Church Pew's rough can still find Church Pew's
 * water. Deliberately excluded, identically from both arms so it cancels:
 * the focus-bought putt (a birdie-market decision priced by par context,
 * not by the lie) and the redraw (a whole-hole economy). Focus starts at 5
 * for techniques, as at a fresh tee.
 *
 * THE SPREAD-FLOOR COUNTERFACTUAL — the same table if junk imposed a
 * MINIMUM ABSOLUTE SCATTER: spread = max(club × lieScale, FLOOR yards),
 * swept over three candidate floors so a future fix can be read straight
 * off the table. SHIPPED since JUNK-VERDICT's SHIPPED section: buildCone now
 * carries JUNK_SPREAD_FLOOR = 12 (sim/geometry.ts), so the floor-0 arm below
 * IS the live game with that floor in it, and the swept arms only add
 * whatever their floor exceeds 12 by (the floor-12 column now measures the
 * same world as floor 0). The sweep is applied by handing the chooser and
 * the cone pre-floored
 * copies of the shot cards, so cut-down, techniques and the P8 cone cap all
 * flow exactly as the game would flow them. The chooser itself is policy.ts
 * mirrored line for line (floor 0 reduces to the live chooser) rather than
 * imported, for one reason: the floored world's planner must SEE the floor —
 * the Super Ball lesson in policy.ts, a blind planner mismeasures a rule —
 * and the game's chooser reads CARD by id, which a read-only instrument
 * must not rewrite.
 *
 * Determinism: seeded streams only (sim/rng.ts), no Math.random, no Date.
 *
 * Run: npx tsx src/tools/junkcheck.ts
 *   SEEDS=24   paired seeds per (hole, distance)  (default 12)
 *   HOLES=10   holes sampled per distance          (default 8)
 *   SHARP=1.4  cone sharpness multiplier           (default 1.0 — the card numbers)
 */
import { COURSE_POOL, COURSES } from '../content/courses'
import { CARD, HAND_SIZE, STARTING_DECK, freeShot } from '../content/cards'
import { buildCone, whyNotPlayable } from '../sim/effects'
import { LIE, greenCentre, surfaceAt, toPin } from '../sim/geometry'
import {
  CARRY_JITTER, aimFrame, dropPoint, resolveShot, rollAfterPitch,
} from '../sim/resolve/shot'
import { baseputts } from '../sim/resolve/putt'
import { seedBank } from '../sim/rng'
import { draw, shuffle } from '../sim/deck'
import type { Choice, Policy } from './policy'
import type {
  AimChoice, Boost, HoleSpec, Point, ShotCard, Surface, TechniqueCard,
} from '../sim/types'

const SEEDS = Number(process.env.SEEDS ?? 12)
const HOLES = Number(process.env.HOLES ?? 8)
const SHARP = Number(process.env.SHARP ?? 1)
const POLICY: Policy = 'mixed'

/**
 * Candidate floors, in yards of half-width at the lie-penalty stage.
 * Chosen to bracket where the wedges live: rough leaves a Flop at 6.8 and a
 * Pitch at 8.5, deep at 10.4 / 13, while the approach irons already sit at
 * 20+ from rough — so these floors bite the short game and leave the
 * already-priced approach game alone, which is the shape of the suspected
 * hole in the table.
 */
const FLOORS = [8, 12, 16] as const

type Junk = 'rough' | 'deep' | 'bunker' | 'trees'
const JUNK: readonly Junk[] = ['rough', 'deep', 'bunker', 'trees']

interface Band { readonly label: string; readonly dists: readonly number[] }
const BANDS: readonly Band[] = [
  { label: 'greenside ≤35', dists: [18, 27, 35] },
  { label: 'short 36–90', dists: [45, 65, 85] },
  { label: 'approach 91–170', dists: [100, 130, 160] },
  { label: 'long 171+', dists: [185, 215, 245] },
]

const ALL_HOLES: readonly HoleSpec[] = COURSE_POOL.flatMap(id => COURSES[id].holes)

const BOOSTS: readonly Boost[] = [
  { id: '_s', name: '', icon: '', blurb: '', price: 0, tier: 'rack' as const, spreadScale: SHARP },
]

/** The measured spot: d yards from the pin, on the tee-to-green line. */
function stance(hole: HoleSpec, d: number): Point {
  const g = greenCentre(hole)
  const len = Math.sqrt(g.down * g.down + g.side * g.side) || 1
  return { down: g.down - (g.down / len) * d, side: g.side - (g.side / len) * d }
}

/** Holes long enough that the spot is a mid-hole position, sampled evenly. */
function pickHoles(d: number, cap: number): HoleSpec[] {
  const el = ALL_HOLES.filter(h => h.length >= d + 60)
  if (el.length <= cap) return [...el]
  return Array.from({ length: cap }, (_, i) => el[Math.floor((i * el.length) / cap)]!)
}

/**
 * The counterfactual, as a card transform: buildCone will multiply by the
 * lie's spreadScale, so pre-lifting the card's spread to FLOOR ÷ scale makes
 * the post-lie base spread exactly max(club × scale, FLOOR) — and then
 * cut-down, techniques and the cone cap apply to it precisely as shipped.
 * ignoreLie shots play their fairway numbers from grass junk and are left
 * alone, as buildCone leaves them alone.
 */
function flooredShot(shot: ShotCard, lie: Surface, floor: number): ShotCard {
  if (floor <= 0) return shot
  if (lie !== 'rough' && lie !== 'deep' && lie !== 'trees' && lie !== 'bunker') return shot
  if (shot.rules.ignoreLie === true && lie !== 'bunker') return shot
  const min = floor / LIE[lie].spreadScale
  return shot.spread >= min ? shot : { ...shot, spread: min }
}

/* ------------------------------------------------------------------ *
 * The policy sampler, mirrored from tools/policy.ts (see header for
 * why it is mirrored, not imported). Floor 0 is the live chooser.
 * ------------------------------------------------------------------ */
const AIMS: readonly AimChoice[] = ['pin', 'left', 'right']
const AIM_DX = { pin: 0, left: -14, right: 14 } as const
const SAMPLES = 11
const DEPTHS = [-CARRY_JITTER, 0, CARRY_JITTER] as const

function putts(feet: number): number {
  const make = feet <= 3 ? 0.95 : feet <= 8 ? 0.52 : feet <= 15 ? 0.26
    : feet <= 25 ? 0.13 : feet <= 40 ? 0.055 : 0.02
  return 2 - make + (feet > 30 ? 0.2 : 0)
}

function evalPos(hole: HoleSpec, p: Point, surface: Surface): number {
  const pen = LIE[surface].penaltyStrokes ?? 0
  if (pen > 0) return pen + 3.1
  const d = toPin(hole, p)
  if (surface === 'green') return putts(d * 3)
  const lieCost = surface === 'rough' ? 0.25 : surface === 'deep' ? 0.6
    : surface === 'trees' ? 0.95 : surface === 'bunker' ? 0.5 : 0
  const shotsToGreen = d <= 230 ? 1 : d <= 420 ? 2 : 3
  const proximity = d <= 230 ? Math.max(3, d * 0.07) : 14
  return lieCost + shotsToGreen + putts(proximity * 3)
}

function percentile(v: number[], p: number): number {
  const s = [...v].sort((a, b) => a - b)
  return s[Math.min(s.length - 1, Math.floor(s.length * p))]!
}

function chooseFloored(
  hole: HoleSpec, ball: Point, lie: Surface, hand: readonly string[],
  policy: Policy, focus: number, boosts: readonly Boost[], floor: number,
): Choice {
  const free = freeShot(toPin(hole, ball))
  const shots: ShotCard[] = [
    ...hand.map(id => CARD[id]).filter((c): c is ShotCard => !!c && c.kind === 'shot'),
    free,
  ].map(s => flooredShot(s, lie, floor))
  const availTechs = hand.map(id => CARD[id])
    .filter((c): c is TechniqueCard => !!c && c.kind === 'technique')

  const combos: TechniqueCard[][] = [[]]
  for (const t of availTechs) {
    if (t.focus <= focus) combos.push([t])
    if (policy !== 'safe') {
      for (const u of availTechs) {
        if (u.id !== t.id && t.focus + u.focus <= focus) combos.push([t, u])
      }
    }
  }

  let best: Choice = { shot: flooredShot(free, lie, floor), techs: [], aim: 'pin' }
  let bestScore = Infinity
  const dist = toPin(hole, ball)
  const fr = aimFrame(hole, ball)

  for (const shot of shots) {
    if (whyNotPlayable(shot, lie)) continue
    for (const techs of combos) {
      for (const aim of AIMS) {
        const { cone, ctx } = buildCone({ shot, techniques: techs, aim }, lie, dist, boosts)
        const outcomes: number[] = []
        for (let i = 0; i < SAMPLES; i++) {
          const t = (i / (SAMPLES - 1)) * 2 - 1
          const lat = AIM_DX[aim] + t * cone.spread
          const w = 1 - Math.abs(t)
          for (const jit of DEPTHS) {
            const fwd = cone.carry * (1 + jit)
            const pitch: Point = {
              down: ball.down + fr.dir.down * fwd + fr.perp.down * lat,
              side: ball.side + fr.dir.side * fwd + fr.perp.side * lat,
            }
            const pitchSf = surfaceAt(hole, pitch)
            const rolled = rollAfterPitch(pitchSf, cone.roll)
            const p: Point = rolled === 0 ? pitch : {
              down: pitch.down + fr.dir.down * rolled,
              side: pitch.side + fr.dir.side * rolled,
            }
            let sf = surfaceAt(hole, p)
            if (ctx.lowFlight && (pitchSf === 'water' || pitchSf === 'ob')) sf = pitchSf
            if (ctx.ignoreHazards && (sf === 'water' || sf === 'ob')) sf = 'rough'
            const score = evalPos(hole, p, sf)
            for (let k = 0; k < Math.max(1, Math.round(w * 3)); k++) outcomes.push(score)
          }
        }
        const score = policy === 'safe' ? percentile(outcomes, 0.80)
          : policy === 'aggressive' ? percentile(outcomes, 0.25)
          : outcomes.reduce((a, b) => a + b, 0) / outcomes.length
        if (score < bestScore) { bestScore = score; best = { shot, techs, aim } }
      }
    }
  }
  return best
}

/* ------------------------------------------------------------------ *
 * One playout: from a forced lie at a fixed spot, hole out.
 * ------------------------------------------------------------------ */
function playOut(
  hole: HoleSpec, start: Point, lie0: Surface, seed: number, floor: number,
): number {
  let bank = seedBank(seed)
  const [deck0, r0] = shuffle(STARTING_DECK, bank.draw)
  const hand = draw(HAND_SIZE, deck0, [], r0).hand
  let ball = start
  let lie: Surface = lie0
  let strokes = 0
  let focus = 5

  for (let i = 0; i < 12; i++) {
    if (lie === 'green') {
      return strokes + baseputts(Math.max(1, Math.round(toPin(hole, ball) * 3)))
    }
    const { shot, techs, aim } = chooseFloored(hole, ball, lie, hand, POLICY, focus, BOOSTS, floor)
    focus -= techs.reduce((n, t) => n + t.focus, 0)
    const b = buildCone({ shot, techniques: techs, aim }, lie, toPin(hole, ball), BOOSTS)
    const [out, ns] = resolveShot(hole, ball, b.cone, b.ctx, bank.shot)
    bank = { ...bank, shot: ns }
    strokes += 1 + out.penalty
    if (out.penalty > 0) { ball = dropPoint(out.landing); lie = surfaceAt(hole, ball) }
    else { ball = out.landing; lie = out.surface }
    if (strokes >= 10) return 10
  }
  return strokes
}

/* ------------------------------------------------------------------ *
 * The sweep. Every cell is built from PAIRED differences: same hole,
 * same spot, same seed (same shuffle, same hand, same dice) — only the
 * starting lie differs.
 * ------------------------------------------------------------------ */
interface Acc { n: number; sum: number; sq: number }
const cells = new Map<string, Acc>()
function note(key: string, v: number) {
  const a = cells.get(key) ?? { n: 0, sum: 0, sq: 0 }
  a.n += 1; a.sum += v; a.sq += v * v
  cells.set(key, a)
}
function mean(key: string): number {
  const a = cells.get(key)
  return a && a.n ? a.sum / a.n : NaN
}
function stderr(key: string): number {
  const a = cells.get(key)
  if (!a || a.n < 2) return NaN
  const m = a.sum / a.n
  return Math.sqrt(Math.max(0, a.sq / a.n - m * m) / (a.n - 1))
}

let setId = 0
BANDS.forEach((band, bi) => {
  for (const d of band.dists) {
    for (const hole of pickHoles(d, HOLES)) {
      const start = stance(hole, d)
      for (let s = 0; s < SEEDS; s++) {
        const seed = 910_000 + setId
        setId += 1
        const fair = playOut(hole, start, 'fairway', seed, 0)
        note(`${bi}|fair`, fair)
        for (const lie of JUNK) {
          note(`${bi}|${lie}|0`, playOut(hole, start, lie, seed, 0) - fair)
          for (const f of FLOORS) {
            note(`${bi}|${lie}|${f}`, playOut(hole, start, lie, seed, f) - fair)
          }
        }
      }
    }
  }
})

/* ------------------------------------------------------------------ *
 * Report.
 * ------------------------------------------------------------------ */
const f2 = (v: number) => (Number.isNaN(v) ? '   —' : (v >= 0 ? '+' : '') + v.toFixed(2))

function table(title: string, floor: number) {
  console.log(`\n  ${title}`)
  console.log('  lie      ' + BANDS.map(b => b.label.padStart(17)).join(''))
  console.log('  ' + '-'.repeat(10 + 17 * BANDS.length))
  for (const lie of JUNK) {
    const row = BANDS.map((_, bi) => f2(mean(`${bi}|${lie}|${floor}`)).padStart(17)).join('')
    console.log(`  ${lie.padEnd(8)} ${row}`)
  }
}

const n0 = cells.get('0|rough|0')?.n ?? 0
console.log('='.repeat(78))
console.log('JUNKCHECK · strokes lost per visit, junk lie vs fairway from the same spot')
console.log(`  ${POLICY} policy · sharpness ×${SHARP.toFixed(2)} · course pool (${COURSE_POOL.length} courses)`)
console.log(`  ${HOLES} holes × ${SEEDS} paired seeds per distance · ${n0} pairs per cell`)
console.log('='.repeat(78))
console.log('\n  PREDICTION (registered): greenside rough < 0.15 · approach deep > 0.60')

table('MEASURED — the LIE table as shipped (spread × multiplier)', 0)
console.log('  fairway  ' + BANDS.map((_, bi) =>
  `(${mean(`${bi}|fair`).toFixed(2)} to finish)`.padStart(17)).join(''))

for (const f of FLOORS) {
  table(`COUNTERFACTUAL — junk spread floored: max(spread × lie, ${f} yd)`, f)
}

// The verdict: greenside junk cells against approach junk cells, per the
// design's intent that a hazard prices the decision that risked it.
const gsRough = mean('0|rough|0')
const appDeep = mean('2|deep|0')
const avgBand = (bi: number, floor: number) =>
  JUNK.reduce((a, l) => a + mean(`${bi}|${l}|${floor}`), 0) / JUNK.length
const gsAvg = avgBand(0, 0)
const appAvg = avgBand(2, 0)

console.log('\n' + '-'.repeat(78))
console.log(`  greenside rough ${f2(gsRough)} ± ${stderr('0|rough|0').toFixed(2)}` +
  `  (predicted < 0.15: ${gsRough < 0.15 ? 'CONFIRMED' : 'NOT confirmed'})`)
console.log(`  approach deep   ${f2(appDeep)} ± ${stderr('2|deep|0').toFixed(2)}` +
  `  (predicted > 0.60: ${appDeep > 0.60 ? 'CONFIRMED' : 'NOT confirmed'})`)
console.log(`  all-junk average: greenside ${f2(gsAvg)} vs approach ${f2(appAvg)}` +
  ` — greenside junk costs ${(gsAvg / appAvg * 100).toFixed(0)}% of approach junk`)
for (const f of FLOORS) {
  console.log(`  floor ${String(f).padStart(2)} moves greenside junk ${f2(gsAvg)} → ${f2(avgBand(0, f))}` +
    ` (rough ${f2(mean('0|rough|0'))} → ${f2(mean(`0|rough|${f}`))})` +
    `, approach ${f2(appAvg)} → ${f2(avgBand(2, f))}`)
}
console.log('\nVERDICT: ' + (gsAvg < 0.5 * appAvg
  ? `greenside junk is measurably UNDER-PRICED — a visit beside the green costs ` +
    `${f2(gsAvg)} strokes against ${f2(appAvg)} at approach range. The multiplier ` +
    `table prices the long game and waves the short game through; a spread floor ` +
    `is the dial (read it off the counterfactual above).`
  : `greenside junk holds its price — ${f2(gsAvg)} per visit against ${f2(appAvg)} ` +
    `at approach range. The multiplier table is doing its P7 job; no floor needed.`))
console.log()
