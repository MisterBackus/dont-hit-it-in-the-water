/**
 * Does "start worse, then tighten" actually produce a difficulty curve?
 *
 * The proposal: cones start wide and tighten as you acquire equipment, while
 * the cut line falls. The trap is that if the two curves move at the same rate
 * they cancel, and the player feels themselves improving while the scoreboard
 * never moves — a treadmill, not a squeeze (DESIGN.md §3.4).
 *
 * This measures the gap. Run: npx tsx src/tools/seasoncheck.ts
 */
import { COURSES, type Course } from '../content/courses'
import { scheduleFor } from '../sim/schedule'
import { HAND_SIZE, PUNCH_OUT, REDRAW_COST, STARTING_DECK, CARD } from '../content/cards'
import { buildCone, focusRegen } from '../sim/effects'
import { chooseShot } from './policy'
import { resolveShot, dropPoint } from '../sim/resolve/shot'
import { resolvePutting, sinkCost, baseputts } from '../sim/resolve/putt'
import { surfaceAt, toPin } from '../sim/geometry'
import { seedBank, type RngBank } from '../sim/rng'
import { draw } from '../sim/deck'
import type { Boost, HoleSpec, Point, Surface } from '../sim/types'

interface Ctx { bank: RngBank; deck: string[]; discard: string[]; focus: number }

/** Sharpness is modelled as a single global spread multiplier. */
function sharpnessBoost(mult: number): Boost {
  return { id: 'sharp', name: 'sharpness', icon: '', blurb: '', price: 0, spreadScale: mult }
}

function playHole(hole: HoleSpec, ctx: Ctx, boosts: Boost[]) {
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
    const { shot, techs, aim } = chooseShot(hole, ball, lie, hand, 'mixed', ctx.focus, boosts)
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

function playRound(seed: number, sharpness: number, course: Course) {
  const ctx: Ctx = { bank: seedBank(seed), deck: [...STARTING_DECK], discard: [], focus: 5 }
  const boosts = [sharpnessBoost(sharpness)]
  const per: number[] = []
  for (const hole of course.holes) per.push(playHole(hole, ctx, boosts))
  const front4 = per.slice(0, 4).reduce((a, b) => a + b, 0)
    - course.holes.slice(0, 4).reduce((a, h) => a + h.par, 0)
  return { front4, full: per.reduce((a, b) => a + b, 0) - course.par }
}

const N = Number(process.env.N ?? 300)
const EVENTS = 14
/** DESIGN.md §3.4 — the cut line the season is supposed to demand. */
const CUT = [0, 0, 0, 0, 0, 0, 0, -1, -1, -2, -2, -3, -3, -4]

function run(label: string, sharpnessAt: (ev: number) => number, cut: readonly number[] = CUT) {
  console.log(`\n${label}`)
  console.log('  ev   cone×   cut   median thru4   makes the cut')
  console.log('  ' + '-'.repeat(46))
  const rates: number[] = []
  for (let ev = 1; ev <= EVENTS; ev++) {
    const sh = sharpnessAt(ev)
    // each simulated round plays the course its seed's schedule deals event
    // `ev` — the same pool draw the game makes (SCHEDULE-PLAN.md §4)
    const rounds = Array.from({ length: N }, (_, i) => {
      const seed = ev * 7919 + i
      return playRound(seed, sh, COURSES[scheduleFor(seed)[ev - 1]!])
    })
    const scores = rounds.map(r => r.front4).sort((a, b) => a - b)
    const med = scores[Math.floor(scores.length / 2)]!
    // THE CUT IS JUDGED ON FOUR HOLES — measure what the game actually does
    const made = rounds.filter(r => r.front4 <= cut[ev - 1]!).length / rounds.length * 100
    rates.push(made)
    console.log(
      `  ${String(ev).padStart(2)}   ${sh.toFixed(2)}   ` +
      `${(cut[ev - 1]! === 0 ? 'E' : String(cut[ev - 1])).padStart(3)}    ` +
      `${((med >= 0 ? '+' : '') + med).padStart(9)}      ${made.toFixed(0).padStart(3)}%`,
    )
  }
  const drop = rates[0]! - rates[rates.length - 1]!
  console.log(`  → make-cut goes ${rates[0]!.toFixed(0)}% → ${rates[rates.length - 1]!.toFixed(0)}%  (drop ${drop.toFixed(0)} pts)`)
  return { drop, first: rates[0]!, last: rates[rates.length - 1]! }
}

console.log(`\nMATCHING THE CUT TO WHAT THE PLAYER CAN ACTUALLY DO  ${N}/event`)

const NARROW = (ev: number) => 1.40 - (ev - 1) / (EVENTS - 1) * 0.60
const WIDE   = (ev: number) => 1.60 - (ev - 1) / (EVENTS - 1) * 0.85
const CURVE_A = [1, 1, 1, 1, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1]
const CURVE_B = [2, 2, 1, 1, 1, 0, 0, 0, 0, -1, -1, -1, -2, -2]

run('A · sharpness 1.40→0.80, cut +1…-1', NARROW, CURVE_A)
run('B · sharpness 1.60→0.75, cut +1…-1', WIDE, CURVE_A)
run('C · sharpness 1.60→0.75, cut +2…-2', WIDE, CURVE_B)
console.log('\n  Target: opens near 65-70%, ends near 25-30%.\n')
