/**
 * Does deckbuilding actually DO anything?
 *
 * The season design (DESIGN.md §3.4) assumes your bag improves as the run goes
 * on — that is the race the whole difficulty curve rests on. Before building a
 * season on that assumption, check it: play the same rounds under different
 * deckbuilding policies and see whether the deck decisions move the score at all.
 *
 * Run: npx tsx src/tools/deckcheck.ts
 */
import { PINE_HOLLOW, COURSE_PAR } from '../content/courses/pinehollow'
import { HAND_SIZE, PUNCH_OUT, REDRAW_COST, STARTING_DECK, REWARD_POOL, CARD } from '../content/cards'
import { buildCone, focusRegen } from '../sim/effects'
import { chooseShot } from './policy'
import { resolveShot, dropPoint } from '../sim/resolve/shot'
import { resolvePutting, sinkCost, baseputts } from '../sim/resolve/putt'
import { surfaceAt, toPin } from '../sim/geometry'
import { seedBank, next, type RngBank } from '../sim/rng'
import { draw, shuffle } from '../sim/deck'
import type { HoleSpec, Point, ShotCard, Surface } from '../sim/types'

type BuildPolicy = 'nothing' | 'random' | 'greedy' | 'thin' | 'greedy+thin' | 'swap'

interface Ctx { bank: RngBank; deck: string[]; discard: string[]; focus: number }

function playHole(hole: HoleSpec, ctx: Ctx) {
  const res = draw(HAND_SIZE, ctx.deck, ctx.discard, ctx.bank.draw)
  ctx.deck = res.deck; ctx.discard = res.discard
  ctx.bank = { ...ctx.bank, draw: res.rng }
  let hand = res.hand

  let ball: Point = { down: 0, side: 0 }
  let lie: Surface = 'tee'
  let strokes = 0
  let redrawnThisHole = false
  let redraws = 0

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
    const { shot, techs, aim } = chooseShot(hole, ball, lie, hand, 'mixed', ctx.focus)
    ctx.focus -= techs.reduce((n, t) => n + t.focus, 0)
    const b = buildCone({ shot, techniques: techs, aim }, lie, toPin(hole, ball))
    const [out, nb] = resolveShot(hole, ball, b.cone, b.ctx, ctx.bank.shot)
    ctx.bank = { ...ctx.bank, shot: nb }
    strokes += 1 + out.penalty
    if (out.penalty > 0) { ball = dropPoint(out.landing); lie = surfaceAt(hole, ball) }
    else { ball = out.landing; lie = out.surface }
    if (strokes >= 10) { strokes = 10; break }
  }
  ctx.discard.push(...hand)
  ctx.focus = Math.min(5, ctx.focus + focusRegen([], strokes - hole.par))
  void redraws
  return strokes
}

/** Crude "is this card good" score — a stand-in for a thinking player. */
function cardValue(id: string): number {
  const c = CARD[id]
  if (!c) return 0
  if (c.kind === 'technique') return 3 - c.focus
  const s = c as ShotCard
  // tight cones and useful distances are worth more; specialists are worth less
  const tightness = s.carry / Math.max(1, s.spread)
  const restricted = s.rules.from ? 0.5 : 1
  return tightness * restricted
}

function makeOffer(ctx: Ctx): string[] {
  const [pool, r] = shuffle(REWARD_POOL, ctx.bank.draw)
  ctx.bank = { ...ctx.bank, draw: r }
  return pool.slice(0, 3)
}

function playRound(seed: number, policy: BuildPolicy) {
  const ctx: Ctx = { bank: seedBank(seed), deck: [...STARTING_DECK], discard: [], focus: 5 }
  let total = 0
  for (let h = 0; h < PINE_HOLLOW.length; h++) {
    total += playHole(PINE_HOLLOW[h]!, ctx)

    // --- the deckbuilding decision, after every hole ---
    const offer = makeOffer(ctx)
    if (policy === 'random') {
      const [v, r] = next(ctx.bank.draw)
      ctx.bank = { ...ctx.bank, draw: r }
      ctx.deck.unshift(offer[Math.floor(v * offer.length)]!)
    } else if (policy === 'greedy' || policy === 'greedy+thin') {
      const best = [...offer].sort((a, b) => cardValue(b) - cardValue(a))[0]!
      ctx.deck.unshift(best)
    } else if (policy === 'swap') {
      // SWAP, NOT ADD — the live economy under BAG_CAP: taking a card means
      // one comes out, so the question stops being "is this better than
      // nothing" and becomes "is this better than the card it replaces".
      const best = [...offer].sort((a, b) => cardValue(b) - cardValue(a))[0]!
      const all = [...ctx.deck, ...ctx.discard]
      const worst = [...all].sort((a, b) => cardValue(a) - cardValue(b))[0]
      if (worst && cardValue(best) > cardValue(worst)) {
        for (const pile of ['deck', 'discard'] as const) {
          const i = ctx[pile].indexOf(worst)
          if (i >= 0) { ctx[pile].splice(i, 1); break }
        }
        ctx.deck.unshift(best)
      }
    }
    // --- the removal, at the cut ---
    if (h === 3 && (policy === 'thin' || policy === 'greedy+thin')) {
      const all = [...ctx.deck, ...ctx.discard]
      const worst = [...all].sort((a, b) => cardValue(a) - cardValue(b))[0]
      if (worst) {
        for (const pile of ['deck', 'discard'] as const) {
          const i = ctx[pile].indexOf(worst)
          if (i >= 0) { ctx[pile].splice(i, 1); break }
        }
      }
    }
  }
  return { total, deckSize: ctx.deck.length + ctx.discard.length }
}

const N = Number(process.env.N ?? 500)
const POLICIES: BuildPolicy[] = ['nothing', 'random', 'greedy', 'thin', 'greedy+thin', 'swap']

console.log(`\nDOES DECKBUILDING MATTER?  ${N} rounds each · par ${COURSE_PAR}\n`)
console.log('policy         final deck   avg score   vs par    vs "take nothing"')
console.log('-'.repeat(72))

const base: Record<string, number> = {}
for (const policy of POLICIES) {
  let sum = 0, deck = 0
  for (let i = 0; i < N; i++) {
    const r = playRound(4000 + i, policy)
    sum += r.total; deck += r.deckSize
  }
  const avg = sum / N
  base[policy] = avg
  const delta = policy === 'nothing' ? 0 : avg - base['nothing']!
  console.log(
    `${policy.padEnd(14)} ${(deck / N).toFixed(1).padStart(6)}      ` +
    `${avg.toFixed(2).padStart(6)}     ${((avg - COURSE_PAR >= 0 ? '+' : '') + (avg - COURSE_PAR).toFixed(2)).padStart(6)}` +
    `    ${policy === 'nothing' ? '—' : (delta >= 0 ? '+' : '') + delta.toFixed(2) + (delta < -0.3 ? '  ← better' : delta > 0.3 ? '  ← worse' : '  (noise)')}`,
  )
}
console.log()
console.log('If every row lands within ±0.3 of "take nothing", the deckbuilding')
console.log('decisions are decoration and the season layer has nothing to stand on.')
console.log()
