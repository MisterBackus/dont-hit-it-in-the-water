/**
 * TEMPORARY consultant harness — measures reward-pool cards and proposed items.
 * Mirrors shopcheck.ts's seasonEarnings exactly. Delete after use.
 *
 * Run: npx tsx src/tools/_itemcheck.tmp.ts
 */
import { PINE_HOLLOW, COURSE_PAR } from '../content/courses/pinehollow'
import { HAND_SIZE, PUNCH_OUT, REDRAW_COST, STARTING_DECK, CARD } from '../content/cards'
import { SEASON, payout, money } from '../content/season'
import { buildCone, maxFocus, focusRegen } from '../sim/effects'
import { chooseShot, type Policy } from './policy'
import { resolveShot, dropPoint } from '../sim/resolve/shot'
import { resolvePutting, sinkCost, baseputts } from '../sim/resolve/putt'
import { makeField, advanceField, rankCut, standings, yourPlace } from '../sim/resolve/field'
import { surfaceAt, toPin } from '../sim/geometry'
import { seedBank, type RngBank } from '../sim/rng'
import { draw } from '../sim/deck'
import type { Boost, Card, HoleSpec, Point, Surface } from '../sim/types'

// ---- proposed cards, injected into the runtime card table (no source edits) ----
const PROPOSED: readonly Card[] = [
  { id: 'threequarter', kind: 'technique', name: 'Three-Quarter It', focus: 1,
    blurb: 'Eighty percent of everything.',
    effects: [{ op: 'scaleCarry', value: 0.80 }, { op: 'scaleSpread', value: 0.75 }] },
  { id: 'highdraw', kind: 'shot', name: 'High Draw', carry: 235, spread: 16,
    blurb: 'Turns over and carries everything.',
    rules: { from: ['tee', 'fairway'], roll: 10 } },
  { id: 'pickclean', kind: 'shot', name: 'Pick It Clean', carry: 140, spread: 14,
    blurb: 'Ball first, then sand. Say it again.',
    rules: { from: ['tee', 'fairway', 'bunker'], roll: 5 } },
  { id: 'middle', kind: 'technique', name: 'Middle of the Green', focus: 0,
    blurb: 'Aim at nothing. Hit it there.',
    effects: [{ op: 'addCarry', value: -5 }, { op: 'scaleSpread', value: 0.85 }] },
]
for (const c of PROPOSED) (CARD as Record<string, Card>)[c.id] = c

// ---- copied verbatim from shopcheck.ts (not exported there) ----
interface Ctx { bank: RngBank; deck: string[]; discard: string[]; focus: number; freeSinks: number }

function playHole(hole: HoleSpec, ctx: Ctx, boosts: readonly Boost[], policy: Policy) {
  const res = draw(HAND_SIZE, ctx.deck, ctx.discard, ctx.bank.draw)
  ctx.deck = res.deck; ctx.discard = res.discard
  ctx.bank = { ...ctx.bank, draw: res.rng }
  let hand = res.hand
  let ball: Point = { down: 0, side: 0 }
  let lie: Surface = 'tee'
  let strokes = 0
  let redrawn = false
  const discount = boosts.reduce((n, b) => n + (b.sinkDiscount ?? 0), 0)

  for (let i = 0; i < 14; i++) {
    if (lie === 'green') {
      const feet = Math.max(1, Math.round(toPin(hole, ball) * 3))
      const raw = sinkCost(feet)
      const free = raw !== null && ctx.freeSinks > 0
      const cost = raw === null ? null : Math.max(0, raw - discount)
      const worth = cost !== null && baseputts(feet) > 1 && strokes + 1 <= hole.par - 1
        && (free || cost <= ctx.focus)
      if (worth) {
        if (free) ctx.freeSinks -= 1
        else ctx.focus -= cost!
      }
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
  ctx.focus = Math.min(maxFocus(5, boosts), ctx.focus + focusRegen(boosts, strokes - hole.par))
  return strokes
}

function seasonEarningsWithDeck(
  seed: number, policy: Policy, kit: readonly Boost[], startDeck: readonly string[],
): number {
  const ctx: Ctx = { bank: seedBank(seed), deck: [...startDeck], discard: [], focus: 5, freeSinks: 0 }
  let earned = 0
  for (const ev of SEASON) {
    const boosts: Boost[] = [
      { id: '_s', name: '', icon: '', blurb: '', price: 0, spreadScale: ev.sharpness },
      ...kit,
    ]
    ctx.focus = maxFocus(5, boosts)
    ctx.freeSinks = kit.reduce((n, b) => n + (b.freeSinks ?? 0), 0)
    let [field, fr] = makeField(ctx.bank.field, ev.fieldStrength)
    ctx.bank = { ...ctx.bank, field: fr }

    const holes: number[] = []
    PINE_HOLLOW.slice(0, 4).forEach((hole, i) => {
      holes.push(playHole(hole, ctx, boosts, policy))
      const [f2, r2] = advanceField(field, i, ctx.bank.field)
      field = f2; ctx.bank = { ...ctx.bank, field: r2 }
    })
    const thru4 = holes.reduce((a, b) => a + b, 0)
      - PINE_HOLLOW.slice(0, 4).reduce((a, h) => a + h.par, 0)
    const cut = rankCut(field, thru4, ev.advance)
    if (!cut.made) continue
    field = cut.field
    PINE_HOLLOW.slice(4).forEach((hole, i) => {
      holes.push(playHole(hole, ctx, boosts, policy))
      const [f2, r2] = advanceField(field, i + 4, ctx.bank.field)
      field = f2; ctx.bank = { ...ctx.bank, field: r2 }
    })
    const rel = holes.reduce((a, b) => a + b, 0) - COURSE_PAR
    earned += payout(ev.purse, yourPlace(standings(field, rel, 8, false)))
  }
  return earned
}
// ---- end copy ----

const N = Number(process.env.N ?? 200)
const POLICY = (process.env.POLICY ?? 'mixed') as Policy
const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length
const run = (deck: readonly string[], kit: readonly Boost[] = []) =>
  mean(Array.from({ length: N }, (_, i) => seasonEarningsWithDeck(600_000 + i, POLICY, kit, deck)))

const base = run(STARTING_DECK)
console.log(`\nITEMCHECK · ${N} seasons each · ${POLICY} play`)
console.log(`  bare season earns ${money(Math.round(base))}\n`)

// 1. ADD each reward-pool card (and proposed cards) to the starting deck.
const ADDS = [
  'fullsend', 'knockdown', 'rescue', 'cutit', 'feathered', 'texas', 'scrape',
  'committed', 'routine', 'nothing', 'onemore',
  'midiron', 'shortiron', 'stinger', 'smooth', 'extra',
  'threequarter', 'highdraw', 'pickclean', 'middle',
]
console.log('  ADD ONE CARD (season value vs bare deck)')
const addRows = ADDS.map(id => {
  const got = run([...STARTING_DECK, id])
  return { id, gain: got - base }
}).sort((a, b) => b.gain - a.gain)
for (const r of addRows) {
  console.log(`    +${(CARD[r.id]?.name ?? r.id).padEnd(24)} ${money(Math.round(r.gain)).padStart(10)}`)
}

// 2. SWAP: reward card in, weak card out (deck size constant).
const SWAPS: readonly (readonly [string, string])[] = [
  ['knockdown', 'bumpandrun'], ['knockdown', 'splash'],
  ['feathered', 'splash'], ['cutit', 'bumpandrun'],
  ['highdraw', 'bomb'], ['knockdown', 'rip'],
]
console.log('\n  SWAP (in / out, deck stays 20)')
for (const [inId, outId] of SWAPS) {
  const deck = [...STARTING_DECK]
  deck.splice(deck.indexOf(outId), 1)
  deck.push(inId)
  const got = run(deck)
  console.log(`    ${(CARD[inId]!.name + ' for ' + CARD[outId]!.name).padEnd(36)} ${money(Math.round(got - base)).padStart(10)}`)
}

// 3. Proposed boost on existing axes.
const stiff: Boost = {
  id: 'stiffshafts', name: 'Stiff Shafts', icon: '|', blurb: '',
  carryAdd: 15, appliesTo: 'long', price: 0,
}
console.log(`\n  BOOST Stiff Shafts (+15 carry, long clubs)  ${money(Math.round(run(STARTING_DECK, [stiff]) - base)).padStart(10)}`)
console.log()
