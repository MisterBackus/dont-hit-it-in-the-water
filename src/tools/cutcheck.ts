/**
 * The cut line is a cliff, not a curve.
 *
 * Measured in the live season (tools/pursecheck.ts): make-cut runs
 *   72 57 60 60 · 36 38 44 42 42 · 19 18 18 15 24
 * Those are not three phases of a squeeze, they are two cliffs. The line moves
 * by ONE stroke at event 5 and make-cut drops 24 points; it moves one more at
 * event 10 and drops another 23. A four-hole score is an integer concentrated
 * on about four values, so a stroke-wide step is a probability step, and
 * "gradually par won't be good enough" cannot be built out of it.
 *
 * The fix is the one real golf already uses: cut to a NUMBER OF PLAYERS, not to
 * a score. Top N and ties. N is continuous where a stroke line is not, the
 * leaderboard already on screen becomes the thing deciding your week, and the
 * field no longer needs the fieldEdge fudge that dragged its median onto the
 * line every week.
 *
 * This measures where you actually stand after four holes, per event, so the
 * N curve can be read off the distribution instead of guessed.
 *
 * Run: npx tsx src/tools/cutcheck.ts
 */
import { COURSES } from '../content/courses'
import { scheduleFor } from '../sim/schedule'
import { HAND_SIZE, PUNCH_OUT, REDRAW_COST, STARTING_DECK, CARD } from '../content/cards'
import { SEASON } from '../content/season'
import { buildCone, focusRegen } from '../sim/effects'
import { chooseShot, type Policy } from './policy'
import { resolveShot, dropPoint } from '../sim/resolve/shot'
import { resolvePutting, sinkCost, baseputts } from '../sim/resolve/putt'
import {
  FULL_HOLES, makeField, advanceField, extendField, overlayStars, standings,
  starNamesFor, starTarget, yourPlace, type StarDials,
} from '../sim/resolve/field'
import {
  STAR_BAND_BETA, STAR_BAND_CAP, STAR_COUNT, STAR_RAMP_END,
} from '../content/players'
import { surfaceAt, toPin } from '../sim/geometry'
import { seedBank, type RngBank } from '../sim/rng'
import { draw } from '../sim/deck'
import type { Boost, HoleSpec, Point, Surface } from '../sim/types'

interface Ctx { bank: RngBank; deck: string[]; discard: string[]; focus: number }

function playHole(hole: HoleSpec, ctx: Ctx, boosts: Boost[], policy: Policy) {
  const res = draw(HAND_SIZE, ctx.deck, ctx.discard, ctx.bank.draw)
  ctx.deck = res.deck; ctx.discard = res.discard
  ctx.bank = { ...ctx.bank, draw: res.rng }
  let hand = res.hand
  let ball: Point = { down: 0, side: 0 }
  let lie: Surface = 'tee'
  let strokes = 0
  let redrawn = false

  for (let i = 0; i < 14; i++) {
    if (lie === 'green') {
      const feet = Math.max(1, Math.round(toPin(hole, ball) * 3))
      const cost = sinkCost(feet)
      const worth = cost !== null && cost > 0 && cost <= ctx.focus
        && baseputts(feet) > 1 && strokes + 1 <= hole.par - 1
      if (worth && cost) ctx.focus -= cost
      strokes += resolvePutting(feet, worth).strokes
      break
    }
    if (!redrawn && ctx.focus >= REDRAW_COST) {
      const reach = Math.max(...hand.map(id => CARD[id])
        .filter(c => !!c && c.kind === 'shot')
        .map(c => (c as { carry: number }).carry), PUNCH_OUT.carry)
      if (reach * Math.max(1, hole.par - 2) < toPin(hole, ball) * 0.85) {
        ctx.focus -= REDRAW_COST
        ctx.discard.push(...hand)
        const rr = draw(HAND_SIZE, ctx.deck, ctx.discard, ctx.bank.draw)
        ctx.deck = rr.deck; ctx.discard = rr.discard
        ctx.bank = { ...ctx.bank, draw: rr.rng }
        hand = rr.hand; redrawn = true
      }
    }
    const { shot, techs, aim } = chooseShot(hole, ball, lie, hand, policy, ctx.focus, boosts)
    ctx.focus -= techs.reduce((n, t) => n + t.focus, 0)
    const b = buildCone({ shot, techniques: techs, aim }, lie, toPin(hole, ball), boosts)
    const [out, nb] = resolveShot(hole, ball, b.cone, b.ctx, ctx.bank.shot)
    ctx.bank = { ...ctx.bank, shot: nb }
    strokes += 1 + out.penalty
    if (out.penalty > 0) { ball = dropPoint(out.landing); lie = surfaceAt(hole, ball) }
    else { ball = out.landing; lie = out.surface }
    if (strokes >= 10) { strokes = 10; break }
  }
  ctx.discard.push(...hand)
  ctx.focus = Math.min(5, ctx.focus + focusRegen(boosts, strokes - hole.par))
  return strokes
}

const N = Number(process.env.N ?? 400)
/** Equipment bought over a season, as a cone multiplier. 1.0 = buys nothing. */
const KIT = Number(process.env.KIT ?? 1)
/**
 * THE FULL SCORECARD's knob (FIELD-SPREAD.md §9-1): extension holes beyond
 * the real 8, default the shipped 28; EXT=0 is the pre-spread world. The
 * cut is judged thru 4 in REAL holes, so every number this tool prints
 * must be DIGIT-IDENTICAL at any EXT — the extension physically runs here
 * (below, after the 8th hole, from its one-shot salt-10 stream) precisely
 * so that a leak into the cut would show up as moved digits. That
 * identity is prediction (b)'s receipt, re-runnable forever.
 */
const EXT = Number(process.env.EXT ?? FULL_HOLES - 8)
/** THE MARQUEE RAMP (FIELD-CEILING.md §6): STARS=0 off; K/RAMP/BETA/CAP sweep. */
const STARS_ON = process.env.STARS !== '0'
const K = Number(process.env.K ?? STAR_COUNT)
const DIALS: StarDials = {
  ramp: Number(process.env.RAMP ?? STAR_RAMP_END),
  beta: Number(process.env.BETA ?? STAR_BAND_BETA),
  cap: Number(process.env.CAP ?? STAR_BAND_CAP),
}

/** Your place after four holes, for every event of every season. */
function seasonPlaces(seed: number, policy: Policy): number[] {
  const ctx: Ctx = { bank: seedBank(seed), deck: [...STARTING_DECK], discard: [], focus: 5 }
  const out: number[] = []
  // trailing pace for the band — mean full-event rel of the last 3 made cuts,
  // mirroring GameState.recentCutRels (made = inside the advance line here)
  const recent: number[] = []
  // THE REAL ROTATION: the same pool draw the game makes for this seed
  // (SCHEDULE-PLAN.md §4 — an instrument playing a different schedule than
  // the game is a confidently-wrong harness).
  const rota = scheduleFor(seed)
  SEASON.forEach((ev, ei) => {
    const course = COURSES[rota[ei]!]
    // equipment accumulates through the season
    const kit = Math.pow(KIT, ei / (SEASON.length - 1))
    const boosts: Boost[] = [{
      id: '_s', name: '', icon: '', blurb: '', price: 0, tier: 'rack' as const, spreadScale: ev.sharpness * kit,
    }]
    ctx.focus = 5
    let [field, fr] = makeField(ctx.bank.field, ev.fieldStrength * Number(process.env.FSCALE ?? 1))
    ctx.bank = { ...ctx.bank, field: fr }
    if (STARS_ON) {
      const trailing = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 0
      field = overlayStars(field, starNamesFor(seed, K), starTarget(ev.num, trailing, DIALS))
    }
    let rel = 0
    // FOUR holes — the cut is judged here. No fieldEdge: the field is static.
    course.holes.slice(0, 4).forEach(hole => {
      rel += playHole(hole, ctx, boosts, policy) - hole.par
      const [f2, r2] = advanceField(field, hole.par, ctx.bank.field, course.fieldShift)
      field = f2; ctx.bank = { ...ctx.bank, field: r2 }
    })
    // SNAPSHOT HERE — the game's cut compares your four holes to the field's
    // four (rankCut fires with the field thru 4). This instrument used to
    // read your place against the field's EIGHT-hole totals, which was a
    // harsher-but-course-neutral convention right up until fieldShift landed:
    // an eight-hole total carries a course's FULL shift while your four-hole
    // rel carries about half, so at Salt Flats the old reading flattered you
    // by ~9 places. The confidently-wrong-harness lesson, again.
    const placeAtCut = yourPlace(standings(field, rel, 4, false))
    // play the rest so the deck cycles the way a real event would
    let rel8 = rel
    course.holes.slice(4).forEach(hole => {
      rel8 += playHole(hole, ctx, boosts, policy) - hole.par
      const [f2, r2] = advanceField(field, hole.par, ctx.bank.field, course.fieldShift)
      field = f2; ctx.bank = { ...ctx.bank, field: r2 }
    })
    // THE FULL SCORECARD: the field finishes its week from the salt-10
    // one-shot stream, exactly as settle does. The result is deliberately
    // unread — placeAtCut was snapshotted at hole 4, in real holes — so
    // if any digit above ever moves with EXT, the extension has leaked
    // into the cut and that is a bug, not a tuning problem.
    if (EXT > 0) {
      field = extendField(field, course.holes.map(h => h.par), seed, ev.num,
        course.fieldShift, course.holes.length + EXT)
    }
    // feed the band's lagged window when this week would have made the cut
    if (placeAtCut <= ev.advance) {
      recent.push(rel8)
      if (recent.length > 3) recent.shift()
    }
    out.push(placeAtCut)
  })
  return out
}

const pct = (v: number[], p: number) => [...v].sort((a, b) => a - b)[Math.floor(v.length * p)]!

for (const policy of ['safe', 'mixed', 'aggressive'] as Policy[]) {
  const seasons = Array.from({ length: N }, (_, i) => seasonPlaces(120_000 + i, policy))
  console.log(`\nWHERE YOU STAND AFTER FOUR HOLES · ${policy} · ${N} seasons · kit ×${KIT}` +
    ` · stars ${STARS_ON ? `${K} @R${DIALS.ramp} β${DIALS.beta} cap${DIALS.cap}` : 'OFF'}` +
    ` · EXT ${EXT}`)
  console.log('  ev   p25   median   p75      make-cut if the line is top-…')
  console.log('       ' + '-'.repeat(78))
  for (let ev = 0; ev < SEASON.length; ev++) {
    const places = seasons.map(s => s[ev]!)
    const rate = (n: number) => (places.filter(p => p <= n).length / N * 100).toFixed(0).padStart(3)
    console.log(
      `  ${String(ev + 1).padStart(2)}   ${String(pct(places, .25)).padStart(3)}   ` +
      `${String(pct(places, .5)).padStart(6)}   ${String(pct(places, .75)).padStart(3)}   ` +
      `   45:${rate(45)}%  35:${rate(35)}%  25:${rate(25)}%  18:${rate(18)}%  12:${rate(12)}%  8:${rate(8)}%  5:${rate(5)}%`,
    )
  }
}
console.log()

/* ------------------------------------------------------------------ *
 * Candidate N curves, scored against the measured place distribution.
 * ------------------------------------------------------------------ */
const CURVES: { label: string; n: number[] }[] = [
  { label: 'live ADVANCE', n: SEASON.map(e => e.advance) },
  { label: 'linear 42→14', n: Array.from({ length: 14 }, (_, i) => Math.round(42 - i / 13 * 28)) },
  { label: 'linear 44→10', n: Array.from({ length: 14 }, (_, i) => Math.round(44 - i / 13 * 34)) },
  { label: 'eased  45→12', n: Array.from({ length: 14 }, (_, i) => Math.round(45 - Math.pow(i / 13, 1.35) * 33)) },
]

console.log('\nCANDIDATE CUT CURVES · make-cut per event · kit ×' + KIT +
  ` · stars ${STARS_ON ? `${K} @R${DIALS.ramp}` : 'OFF'} · EXT ${EXT}`)
for (const policy of ['safe', 'mixed', 'aggressive'] as Policy[]) {
  const seasons = Array.from({ length: N }, (_, i) => seasonPlaces(120_000 + i, policy))
  console.log(`\n  ${policy}`)
  for (const c of CURVES) {
    const rates = c.n.map((n, ev) => seasons.filter(s => s[ev]! <= n).length / N * 100)
    console.log(
      `    ${c.label.padEnd(13)} ` +
      rates.map(r => r.toFixed(0).padStart(3)).join(' ') +
      `   overall ${(rates.reduce((a, b) => a + b, 0) / 14).toFixed(0)}%`,
    )
  }
  console.log('    ' + ' '.repeat(13) + ' ' + CURVES[0]!.n.map(n => String(n).padStart(3)).join(' ') + `   ← top-N (${CURVES[0]!.label})`)
}
console.log()
