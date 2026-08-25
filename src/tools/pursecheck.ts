/**
 * Where does a season's money actually come from?
 *
 * moneycheck.ts reported cumulative earnings and hid a structural problem: the
 * mixed-policy median earned $1.41M across events 1-5 and only $170k across
 * events 11-14. The back half of the season is economically dead, because the
 * cut tightens while purses stay flat, so fewer cuts made means less money
 * every single week. The season gets harder AND cheaper at the same time.
 *
 * This sweeps two knobs against that:
 *   PAYOUT SHAPE — exponential (steep, top-heavy) vs power-law (flatter tail),
 *                  which decides whether making the cut is worth anything at
 *                  all when you finish 35th.
 *   PURSE CURVE  — flat vs escalating, which decides whether a late event can
 *                  pay for its own difficulty.
 *
 * Run: npx tsx src/tools/pursecheck.ts
 */
import { PINE_HOLLOW, COURSE_PAR } from '../content/courses/pinehollow'
import { HAND_SIZE, PUNCH_OUT, REDRAW_COST, STARTING_DECK, CARD } from '../content/cards'
import { SEASON, money } from '../content/season'
import { buildCone, focusRegen } from '../sim/effects'
import { chooseShot, type Policy } from './policy'
import { resolveShot, dropPoint } from '../sim/resolve/shot'
import { resolvePutting, sinkCost, baseputts } from '../sim/resolve/putt'
import { makeField, advanceField, rankCut, standings, yourPlace } from '../sim/resolve/field'
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

type Payout = (purse: number, place: number) => number
type Purses = (evNum: number, major: boolean) => number

/** Power law: a flatter tail, so a made cut is always worth something. */
function power(share: number, tail: number): Payout {
  return (purse, place) =>
    place > 65 ? 0 : Math.round(purse * share / Math.pow(place, tail))
}

const FLAT: Purses = (_n, major) => (major ? 20_000_000 : 9_000_000)

/** Per-event earnings for one whole season. */
function playSeason(seed: number, policy: Policy, pay: Payout, purses: Purses): number[] {
  const ctx: Ctx = { bank: seedBank(seed), deck: [...STARTING_DECK], discard: [], focus: 5 }
  const per: number[] = []

  for (const ev of SEASON) {
    const boosts: Boost[] = [{
      id: '_s', name: '', icon: '', blurb: '', price: 0, spreadScale: ev.sharpness,
    }]
    ctx.focus = 5
    let [field, fr] = makeField(ctx.bank.field)
    ctx.bank = { ...ctx.bank, field: fr }

    const holes: number[] = []
    // FOUR holes, then the cut — top N and ties, judged on the board.
    PINE_HOLLOW.slice(0, 4).forEach((hole, i) => {
      holes.push(playHole(hole, ctx, boosts, policy))
      const [f2, r2] = advanceField(field, i, ctx.bank.field)
      field = f2; ctx.bank = { ...ctx.bank, field: r2 }
    })
    const thru4 = holes.reduce((a, b) => a + b, 0)
      - PINE_HOLLOW.slice(0, 4).reduce((a, h) => a + h.par, 0)
    const cut = rankCut(field, thru4, ev.advance)
    if (!cut.made) { per.push(0); continue }
    field = cut.field
    PINE_HOLLOW.slice(4).forEach((hole, i) => {
      holes.push(playHole(hole, ctx, boosts, policy))
      const [f2, r2] = advanceField(field, i + 4, ctx.bank.field)
      field = f2; ctx.bank = { ...ctx.bank, field: r2 }
    })
    const rel = holes.reduce((a, b) => a + b, 0) - COURSE_PAR
    per.push(pay(purses(ev.num, ev.major), yourPlace(standings(field, rel, 8, false))))
  }
  return per
}

const N = Number(process.env.N ?? 300)
const med = (v: number[]) => [...v].sort((a, b) => a - b)[Math.floor(v.length / 2)]!
const sum = (v: number[]) => v.reduce((a, b) => a + b, 0)

const MODELS: { label: string; pay: Payout; purses: Purses }[] = [
  { label: 'current · power 0.17 / p^0.75 · flat', pay: power(0.17, 0.75), purses: FLAT },
  { label: 'G · power 0.12 / p^0.55       · flat', pay: power(0.12, 0.55), purses: FLAT },
  { label: 'H · power 0.10 / p^0.45       · flat', pay: power(0.10, 0.45), purses: FLAT },
]

console.log(`\nWHERE THE SEASON'S MONEY COMES FROM · ${N} seasons, mixed policy\n`)
console.log('  model                                     ev1-5    ev6-9   ev10-12  ev13-14    total')
console.log('  ' + '-'.repeat(88))

for (const m of MODELS) {
  const seasons = Array.from({ length: N }, (_, i) => playSeason(90_000 + i, 'mixed', m.pay, m.purses))
  const block = (a: number, b: number) => med(seasons.map(s => sum(s.slice(a, b))))
  console.log(
    `  ${m.label.padEnd(40)} ${money(block(0, 5)).padStart(8)} ` +
    `${money(block(5, 9)).padStart(8)} ${money(block(9, 12)).padStart(8)} ` +
    `${money(block(12, 14)).padStart(8)} ${money(med(seasons.map(sum))).padStart(8)}`,
  )
}

console.log('\n  A SINGLE WIN vs A WHOLE SEASON — the finale must not be a lottery ticket')
console.log('  model                                     win ev14   median season   win as %')
console.log('  ' + '-'.repeat(88))
for (const m of MODELS) {
  const seasons = Array.from({ length: N }, (_, i) => playSeason(90_000 + i, 'mixed', m.pay, m.purses))
  const total = med(seasons.map(sum))
  const win = m.pay(m.purses(14, true), 1)
  console.log(
    `  ${m.label.padEnd(40)} ${money(win).padStart(8)} ${money(total).padStart(15)} ` +
    `${(win / total * 100).toFixed(0).padStart(10)}%`,
  )
}

console.log('\n  WHAT A MADE CUT IS WORTH (event 8, non-major)')
console.log('  model                                        1st      5th     15th     30th     50th')
console.log('  ' + '-'.repeat(88))
for (const m of MODELS) {
  const p = m.purses(8, false)
  const row = [1, 5, 15, 30, 50].map(pl => money(m.pay(p, pl)).padStart(8)).join(' ')
  console.log(`  ${m.label.padEnd(40)} ${row}`)
}
console.log()
