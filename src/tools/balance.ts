/**
 * Headless balance harness. ARCHITECTURE.md §7.2.
 * Plays whole rounds with scripted policies, dealing real hands, and renders
 * nothing. Run: npm run balance   (N=500 npm run balance to change sample size)
 *
 * DELIBERATELY PINE-HOLLOW-FIXED (SCHEDULE-PLAN.md §4): this is the per-hole
 * microscope. Per-course scoring is coursecheck's job; the schedule rotation
 * is modelled by the economy tools (cutcheck, moneycheck, shopcheck,
 * pursecheck, rewardcheck, seasoncheck).
 */
import { PINE_HOLLOW, COURSE_PAR } from '../content/courses/pinehollow'
import { HAND_SIZE, PUNCH_OUT, REDRAW_COST, STARTING_DECK, CARD } from '../content/cards'
import { buildCone, focusRegen } from '../sim/effects'
import { chooseShot, type Policy } from './policy'
import { resolveShot, dropPoint } from '../sim/resolve/shot'
import { resolvePutting, sinkCost, baseputts } from '../sim/resolve/putt'
import { surfaceAt, toPin } from '../sim/geometry'
import { seedBank, type RngBank } from '../sim/rng'
import { draw } from '../sim/deck'
import type { HoleSpec, Point, Surface } from '../sim/types'

interface RoundCtx { bank: RngBank; deck: string[]; discard: string[]; focus: number }

function playHole(hole: HoleSpec, policy: Policy, ctx: RoundCtx) {
  const res = draw(HAND_SIZE, ctx.deck, ctx.discard, ctx.bank.draw)
  ctx.deck = res.deck; ctx.discard = res.discard
  ctx.bank = { ...ctx.bank, draw: res.rng }
  let hand = res.hand

  let ball: Point = { down: 0, side: 0 }
  let lie: Surface = 'tee'
  let strokes = 0
  let punchOuts = 0
  let redraws = 0
  let redrawnThisHole = false

  for (let i = 0; i < 14; i++) {
    if (lie === 'green') {
      const feet = Math.max(1, Math.round(toPin(hole, ball) * 3))
      const cost = sinkCost(feet)
      // buy the birdie when it is affordable and actually saves a stroke
      const worth = cost !== null && cost > 0 && cost <= ctx.focus
        && baseputts(feet) > 1 && strokes + 1 <= hole.par - 1
      if (worth && cost) ctx.focus -= cost
      strokes += resolvePutting(feet, worth).strokes
      break
    }
    // A hand that cannot meaningfully advance the ball is worth two focus to
    // throw back. Mirrors what a player does with "Check the bag".
    if (!redrawnThisHole && ctx.focus >= REDRAW_COST) {
      const reach = Math.max(...hand
        .map(id => CARD[id])
        .filter((c): c is { carry: number; kind: string } & never => !!c && c.kind === 'shot')
        .map(c => (c as { carry: number }).carry), PUNCH_OUT.carry)
      // "dead" means you cannot reach in regulation even with a technique
      // helping — not merely that the hand is awkward.
      if (reach * Math.max(1, hole.par - 2) < toPin(hole, ball) * 0.85) {
        ctx.focus -= REDRAW_COST
        ctx.discard.push(...hand)
        const rr = draw(HAND_SIZE, ctx.deck, ctx.discard, ctx.bank.draw)
        ctx.deck = rr.deck; ctx.discard = rr.discard
        ctx.bank = { ...ctx.bank, draw: rr.rng }
        hand = rr.hand
        redrawnThisHole = true
        redraws++
      }
    }
    const { shot, techs, aim } = chooseShot(hole, ball, lie, hand, policy, ctx.focus)
    if (shot.id === PUNCH_OUT.id) punchOuts++
    ctx.focus -= techs.reduce((n, t) => n + t.focus, 0)
    const { cone, c2 } = (() => {
      const b = buildCone({ shot, techniques: techs, aim }, lie, toPin(hole, ball))
      return { cone: b.cone, c2: b.ctx }
    })()
    const [out, nb] = resolveShot(hole, ball, cone, c2, ctx.bank.shot)
    ctx.bank = { ...ctx.bank, shot: nb }
    strokes += 1 + out.penalty
    if (out.penalty > 0) { ball = dropPoint(out.landing); lie = surfaceAt(hole, ball) }
    else { ball = out.landing; lie = out.surface }

    // cards are NOT consumed within a hole — see reducer.ts commit()
    if (strokes >= 10) { strokes = 10; break }
  }
  ctx.discard.push(...hand)
  ctx.focus = Math.min(5, ctx.focus + focusRegen([], strokes - hole.par))
  return { strokes, punchOuts, redraws }
}

function playRound(seed: number, policy: Policy) {
  const ctx: RoundCtx = {
    bank: seedBank(seed), deck: [...STARTING_DECK], discard: [], focus: 5,
  }
  const per: number[] = []
  let punch = 0, redraws = 0
  for (const hole of PINE_HOLLOW) {
    const r = playHole(hole, policy, ctx)
    per.push(r.strokes); punch += r.punchOuts; redraws += r.redraws
  }
  return { per, punch, redraws }
}

const N = Number(process.env.N ?? 400)
const pct = (v: number[], p: number) => [...v].sort((a, b) => a - b)[Math.floor(v.length * p)]!

console.log(`\nPINE HOLLOW · par ${COURSE_PAR} · deck ${STARTING_DECK.length} · hand ${HAND_SIZE} · ${N} rounds\n`)
console.log('policy      median   p10   p90   avg vs par   sub-par   blowups   punch/rd   redraws/rd')
console.log('-'.repeat(84))

const holeTot: Record<Policy, number[]> = {
  safe: PINE_HOLLOW.map(() => 0), mixed: PINE_HOLLOW.map(() => 0), aggressive: PINE_HOLLOW.map(() => 0),
}

for (const policy of ['safe', 'mixed', 'aggressive'] as Policy[]) {
  const tot: number[] = []
  let blow = 0, punch = 0, rd = 0
  for (let i = 0; i < N; i++) {
    const { per, punch: pu, redraws: rr } = playRound(1000 + i, policy)
    per.forEach((s, h) => { holeTot[policy][h]! += s; if (s >= 10) blow++ })
    tot.push(per.reduce((a, b) => a + b, 0)); punch += pu; rd += rr
  }
  const avg = tot.reduce((a, b) => a + b, 0) / tot.length - COURSE_PAR
  const sub = tot.filter(t => t < COURSE_PAR).length / tot.length * 100
  console.log(
    `${policy.padEnd(11)} ${String(pct(tot, .5)).padStart(4)}  ${String(pct(tot, .1)).padStart(4)}  ` +
    `${String(pct(tot, .9)).padStart(4)}   ${((avg >= 0 ? '+' : '') + avg.toFixed(2)).padEnd(11)}` +
    `  ${sub.toFixed(1)}%`.padEnd(10) + `  ${String(blow).padEnd(8)}  ` +
    `${(punch / N).toFixed(2).padEnd(9)}  ${(rd / N).toFixed(2)}`,
  )
}

console.log('\nPER-HOLE AVERAGES (vs par)')
console.log('hole  par  yds   name             safe    mixed   aggro')
console.log('-'.repeat(66))
PINE_HOLLOW.forEach((h, i) => {
  const f = (x: number) => `${x >= 0 ? '+' : ''}${x.toFixed(2)}`.padStart(6)
  console.log(
    `  ${h.num}    ${h.par}  ${String(h.length).padStart(3)}   ${h.name.padEnd(16)}` +
    `${f(holeTot.safe[i]! / N - h.par)}  ${f(holeTot.mixed[i]! / N - h.par)}  ${f(holeTot.aggressive[i]! / N - h.par)}`,
  )
})

console.log('\nDECK — how often is each card the one you play?')
const usage: Record<string, number> = {}
for (let i = 0; i < 150; i++) {
  const ctx: RoundCtx = { bank: seedBank(9000 + i), deck: [...STARTING_DECK], discard: [], focus: 5 }
  for (const hole of PINE_HOLLOW) {
    const before = [...ctx.discard]
    playHole(hole, 'mixed', ctx)
    for (const id of ctx.discard.slice(before.length)) usage[id] = (usage[id] ?? 0) + 1
  }
}
const rows = Object.entries(usage).sort((a, b) => b[1] - a[1])
for (const [id, n] of rows) {
  const c = CARD[id] as { name: string } | undefined
  console.log(`  ${(c?.name ?? id).padEnd(24)} ${(n / 150).toFixed(2)} per round`)
}
console.log()
