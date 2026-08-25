/**
 * Put a course through the harness.
 *
 * Two questions, and the second one is new. The old one: does it play to par,
 * and is any hole broken or unplayable? The new one, since the cut became a
 * PLACE rather than a score: does the front four SPREAD the field? A course
 * whose first four holes hand everybody the same number turns a top-N cut into
 * a coin flip between tied scores, and the player's skill stops deciding it.
 *
 * Run: npx tsx src/tools/coursecheck.ts
 */
import { PINE_HOLLOW } from '../content/courses/pinehollow'
import { COTTONWOOD } from '../content/courses/cottonwood'
import { ROCKDALE_MUNI } from '../content/courses/rockdale'
import { SALT_FLATS } from '../content/courses/saltflats'
import { HAND_SIZE, PUNCH_OUT, REDRAW_COST, STARTING_DECK, CARD, freeShot } from '../content/cards'
import { SEASON } from '../content/season'
import { buildCone, focusRegen, whyNotPlayable } from '../sim/effects'
import { chooseShot, type Policy } from './policy'
import { resolveShot, dropPoint } from '../sim/resolve/shot'
import { resolvePutting, sinkCost, baseputts } from '../sim/resolve/putt'
import { surfaceAt, toPin } from '../sim/geometry'
import { seedBank, type RngBank } from '../sim/rng'
import { draw } from '../sim/deck'
import type { Boost, HoleSpec, Point, Surface } from '../sim/types'

interface Ctx { bank: RngBank; deck: string[]; discard: string[]; focus: number }

/**
 * DOES THE POSITION CONTAIN A DECISION?
 *
 * The policy-gap column says whether risk appetite changed the SCORE. This says
 * whether it changed the SHOT — at every position, ask all three appetites what
 * they would play and count how often they disagree. A hole can be hard, or
 * clever, or require exactly the right club, and still be a lookup rather than
 * a choice: if one line dominates, all three take it and nothing was decided.
 */
const disagree: Record<number, { n: number; diff: number }> = {}
function noteDecision(
  holeIndex: number, hole: HoleSpec, ball: Point, lie: Surface,
  hand: readonly string[], focus: number, boosts: Boost[],
) {
  // The whole PLAN, not just the club. Rockdale's best hole — a 0.82 score
  // gap, the largest measured anywhere — has every appetite reaching for the
  // same card and disagreeing only about whether to aim away from the fence.
  // Comparing shot ids alone scored it 0% and called it a lookup.
  const picks = (['safe', 'mixed', 'aggressive'] as Policy[]).map(p => {
    const c = chooseShot(hole, ball, lie, hand, p, focus, boosts)
    return `${c.shot.id}|${c.aim}|${c.techs.map(t => t.id).sort().join(',')}`
  })
  const d = disagree[holeIndex] ?? { n: 0, diff: 0 }
  d.n += 1
  if (new Set(picks).size > 1) d.diff += 1
  disagree[holeIndex] = d
}

function playHole(hole: HoleSpec, ctx: Ctx, boosts: Boost[], policy: Policy) {
  const res = draw(HAND_SIZE, ctx.deck, ctx.discard, ctx.bank.draw)
  ctx.deck = res.deck; ctx.discard = res.discard; ctx.bank = { ...ctx.bank, draw: res.rng }
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
      const reach = Math.max(...hand.map(id => CARD[id]).filter(c => !!c && c.kind === 'shot')
        .map(c => (c as { carry: number }).carry), PUNCH_OUT.carry)
      if (reach * Math.max(1, hole.par - 2) < toPin(hole, ball) * 0.85) {
        ctx.focus -= REDRAW_COST; ctx.discard.push(...hand)
        const rr = draw(HAND_SIZE, ctx.deck, ctx.discard, ctx.bank.draw)
        ctx.deck = rr.deck; ctx.discard = rr.discard; ctx.bank = { ...ctx.bank, draw: rr.rng }
        hand = rr.hand; redrawn = true
      }
    }
    if (policy === 'mixed' && MEASURE_DECISIONS) {
      noteDecision(MEASURE_HOLE, hole, ball, lie, hand, ctx.focus, boosts)
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

let MEASURE_DECISIONS = false
let MEASURE_HOLE = 0

const N = Number(process.env.N ?? 500)
const SHARP = SEASON[0]!.sharpness

function sd(v: number[]): number {
  const m = v.reduce((a, b) => a + b, 0) / v.length
  return Math.sqrt(v.reduce((a, b) => a + (b - m) * (b - m), 0) / v.length)
}
function pct(v: number[], p: number) { return [...v].sort((a, b) => a - b)[Math.floor(v.length * p)]! }

/** Every lie on a grid: is there a legal shot from here? */
function softlockScan(course: readonly HoleSpec[]) {
  let dead = 0, checked = 0
  const worst: string[] = []
  for (const hole of course) {
    for (let d = 0; d <= hole.length + 30; d += 10) {
      for (let s = -60; s <= 60; s += 10) {
        const p = { down: d, side: s }
        const lie = surfaceAt(hole, p)
        if (lie === 'green' || lie === 'water' || lie === 'ob') continue
        checked++
        const dist = toPin(hole, p)
        const legal = [...STARTING_DECK.map(id => CARD[id]), freeShot(dist)]
          .filter(c => !!c && c.kind === 'shot')
          .some(c => !whyNotPlayable(c as never, lie))
        if (!legal) { dead++; if (worst.length < 3) worst.push(`${hole.name} ${d}/${s} (${lie})`) }
      }
    }
  }
  console.log(`  softlock scan: ${checked} positions, ${dead} with no legal shot` +
    (dead ? `  ← ${worst.join(', ')}` : '  ✓'))
}

function report(course: readonly HoleSpec[], label: string) {
  const par = course.reduce((n, h) => n + h.par, 0)
  const front = course.slice(0, 4).reduce((n, h) => n + h.par, 0)
  console.log(`\n${'='.repeat(74)}\n${label} · par ${par} (front ${front} / back ${par - front})\n${'='.repeat(74)}`)

  for (const k of Object.keys(disagree)) delete disagree[Number(k)]
  const four: Record<string, number[]> = {}
  const full: Record<string, number[]> = {}
  const perHole: Record<string, number[][]> = {}
  const focusAtTee: number[][] = course.map(() => [])

  for (const policy of ['safe', 'mixed', 'aggressive'] as Policy[]) {
    four[policy] = []; full[policy] = []; perHole[policy] = course.map(() => [])
    for (let i = 0; i < N; i++) {
      const ctx: Ctx = { bank: seedBank(800_000 + i), deck: [...STARTING_DECK], discard: [], focus: 5 }
      const boosts: Boost[] = [{ id: '_s', name: '', icon: '', blurb: '', price: 0, spreadScale: SHARP }]
      const holes = course.map((h, k) => {
        MEASURE_HOLE = k
        MEASURE_DECISIONS = policy === 'mixed'
        if (policy === 'mixed') focusAtTee[k]!.push(ctx.focus)
        const v = playHole(h, ctx, boosts, policy)
        MEASURE_DECISIONS = false
        perHole[policy]![k]!.push(v - h.par)
        return v
      })
      four[policy]!.push(holes.slice(0, 4).reduce((a, b) => a + b, 0) - front)
      full[policy]!.push(holes.reduce((a, b) => a + b, 0) - par)
    }
  }

  console.log('\n  policy      full round (vs par)         FRONT FOUR (what the cut sees)')
  console.log('              median   p10   p90   avg    median   avg    SPREAD (sd)   distinct')
  console.log('  ' + '-'.repeat(84))
  for (const p of ['safe', 'mixed', 'aggressive'] as Policy[]) {
    const f = four[p]!, r = full[p]!
    const avg = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length
    const spanCount = new Set(f).size
    console.log(
      `  ${p.padEnd(11)} ${String(pct(r, .5)).padStart(5)} ${String(pct(r, .1)).padStart(6)} ` +
      `${String(pct(r, .9)).padStart(5)} ${avg(r).toFixed(2).padStart(6)}    ` +
      `${String(pct(f, .5)).padStart(5)} ${avg(f).toFixed(2).padStart(6)}   ` +
      `${sd(f).toFixed(2).padStart(6)}        ${String(spanCount).padStart(3)}`,
    )
  }

  // DECISION, not just difficulty. A hole where all three risk appetites score
  // the same is a tax, however hard it is — nothing the player chooses changes
  // the outcome. The gap between them is the only evidence a choice exists.
  console.log('\n  hole  par  yds   name                 safe   mixed   aggro   choice?   split')
  console.log('  ' + '-'.repeat(82))
  course.forEach((h, k) => {
    const mean = (p: string) => {
      const v = perHole[p]![k]!
      return v.reduce((x, y) => x + y, 0) / v.length
    }
    const ms = ['safe', 'mixed', 'aggressive'].map(mean)
    const gap = Math.max(...ms) - Math.min(...ms)
    const f = (m: number) => `${m >= 0 ? '+' : ''}${m.toFixed(2)}`.padStart(6)
    const verdict = gap >= 0.40 ? 'REAL' : gap >= 0.22 ? 'some' : 'flat'
    const d = disagree[k]
    const pctDiff = d && d.n ? (d.diff / d.n * 100) : 0
    console.log(`  ${String(h.num).padStart(3)}   ${h.par}  ${String(h.length).padStart(3)}   ` +
      `${h.name.padEnd(20)}${f(ms[0]!)}  ${f(ms[1]!)}  ${f(ms[2]!)}   ${gap.toFixed(2)} ${verdict}` +
      `   ${pctDiff.toFixed(0).padStart(3)}%`)
  })
  // THE FOCUS SHADOW. A fork is only a fork for a player who can afford both
  // branches. This is what the player has in hand at each tee (mixed play) —
  // a starving tee reads "close but not forking" whatever the hazards say.
  const focusRow = focusAtTee
    .map(v => (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1))
  console.log(`\n  focus at tee (mixed):  ${focusRow.join('   ')}`)
  softlockScan(course)
}

report(PINE_HOLLOW, 'PINE HOLLOW  (the incumbent, for comparison)')
report(COTTONWOOD, 'COTTONWOOD  — "the straight line is a lie"')
report(ROCKDALE_MUNI, 'ROCKDALE MUNICIPAL  — "par is easy; the cut does not care about par"')
report(SALT_FLATS, 'SALT FLATS  — "every honest answer is half a club short"')
console.log()
