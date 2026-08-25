/**
 * Calibrate the Money List against the real season.
 *
 * The thresholds in content/season.ts started as guesses carried over from an
 * abstract model. This plays whole seasons with the live cut curve, the live
 * sharpness curve and the live payout model, then reports what the thresholds
 * SHOULD be for the intended kill rates.
 *
 * Run: npx tsx src/tools/moneycheck.ts
 */
import { PINE_HOLLOW, COURSE_PAR } from '../content/courses/pinehollow'
import { HAND_SIZE, PUNCH_OUT, REDRAW_COST, STARTING_DECK, CARD } from '../content/cards'
import { SEASON, MONEY_CHECKS, payout, money } from '../content/season'
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

/**
 * One full season. Returns cumulative earnings after each event.
 *
 * `spend` models a player who actually uses the pro shop: buy a piece of
 * equipment whenever it is affordable and still leaves a margin over the next
 * Money List check. Equipment bought is approximated as a 12% tightening of
 * every cone, which is about the average of the real boosts.
 */
function playSeason(seed: number, policy: Policy, spend = false): number[] {
  const ctx: Ctx = { bank: seedBank(seed), deck: [...STARTING_DECK], discard: [], focus: 5 }
  const running: number[] = []
  let earned = 0
  let bought = 0

  for (const ev of SEASON) {
    if (spend) {
      const ci = MONEY_CHECKS.findIndex(c => c.after >= ev.num)
      const next = MONEY_CHECKS[ci] ?? MONEY_CHECKS[MONEY_CHECKS.length - 1]!
      const prev = ci > 0 ? MONEY_CHECKS[ci - 1]! : { after: 0, need: 0 }
      const kit = Number(process.env.KIT ?? 420_000)
      // PACE, not surplus. The greedy rule this replaces bought whenever it
      // could, which meant buying in the last week before a check — the one
      // moment the money is worth more in the pocket. Stay on the straight
      // line to the next number and spend whatever is above it.
      const through = (ev.num - 1 - prev.after) / Math.max(1, next.after - prev.after)
      const onPace = prev.need + (next.need - prev.need) * through
      if (bought < Number(process.env.MAXBUY ?? 4) && earned - kit >= onPace) { earned -= kit; bought++ }
    }
    const boosts: Boost[] = [{
      id: '_s', name: '', icon: '', blurb: '', price: 0,
      spreadScale: ev.sharpness * Math.pow(Number(process.env.KITPOW ?? 0.88), bought),
    }]
    ctx.focus = 5
    let [field, fr] = makeField(ctx.bank.field, ev.fieldStrength)
    ctx.bank = { ...ctx.bank, field: fr }

    const per: number[] = []
    PINE_HOLLOW.slice(0, 4).forEach((hole, i) => {
      per.push(playHole(hole, ctx, boosts, policy))
      const [f2, r2] = advanceField(field, i, ctx.bank.field)
      field = f2; ctx.bank = { ...ctx.bank, field: r2 }
    })
    const thru4 = per.reduce((a, b) => a + b, 0)
      - PINE_HOLLOW.slice(0, 4).reduce((a, h) => a + h.par, 0)
    const cut = rankCut(field, thru4, ev.advance)
    if (cut.made) {
      field = cut.field
      PINE_HOLLOW.slice(4).forEach((hole, i) => {
        per.push(playHole(hole, ctx, boosts, policy))
        const [f2, r2] = advanceField(field, i + 4, ctx.bank.field)
        field = f2; ctx.bank = { ...ctx.bank, field: r2 }
      })
      const rel = per.reduce((a, b) => a + b, 0) - COURSE_PAR
      earned += payout(ev.purse, yourPlace(standings(field, rel, 8, false)))
    }
    running.push(earned)
  }
  return running
}

/** Same season, but the four pieces of equipment cost nothing. */
function playSeasonFreeKit(seed: number, policy: Policy): number[] {
  const ctx: Ctx = { bank: seedBank(seed), deck: [...STARTING_DECK], discard: [], focus: 5 }
  const running: number[] = []
  let earned = 0
  for (const ev of SEASON) {
    // pieces arrive on the same rough schedule a shopper would manage
    const bought = Math.min(4, Math.floor((ev.num - 1) / 3))
    const boosts: Boost[] = [{
      id: '_s', name: '', icon: '', blurb: '', price: 0,
      spreadScale: ev.sharpness * Math.pow(Number(process.env.KITPOW ?? 0.88), bought),
    }]
    ctx.focus = 5
    let [field, fr] = makeField(ctx.bank.field, ev.fieldStrength)
    ctx.bank = { ...ctx.bank, field: fr }
    const per: number[] = []
    PINE_HOLLOW.slice(0, 4).forEach((hole, i) => {
      per.push(playHole(hole, ctx, boosts, policy))
      const [f2, r2] = advanceField(field, i, ctx.bank.field)
      field = f2; ctx.bank = { ...ctx.bank, field: r2 }
    })
    const thru4 = per.reduce((a, b) => a + b, 0)
      - PINE_HOLLOW.slice(0, 4).reduce((a, h) => a + h.par, 0)
    const cut = rankCut(field, thru4, ev.advance)
    if (cut.made) {
      field = cut.field
      PINE_HOLLOW.slice(4).forEach((hole, i) => {
        per.push(playHole(hole, ctx, boosts, policy))
        const [f2, r2] = advanceField(field, i + 4, ctx.bank.field)
        field = f2; ctx.bank = { ...ctx.bank, field: r2 }
      })
      earned += payout(ev.purse, yourPlace(standings(field, per.reduce((a, b) => a + b, 0) - COURSE_PAR, 8, false)))
    }
    running.push(earned)
  }
  return running
}

const N = Number(process.env.N ?? 400)
const pct = (v: number[], p: number) => [...v].sort((a, b) => a - b)[Math.floor(v.length * p)]!

console.log(`\nMONEY LIST CALIBRATION · ${N} full seasons per skill level\n`)

for (const policy of ['safe', 'mixed', 'aggressive'] as Policy[]) {
  const seasons = Array.from({ length: N }, (_, i) => playSeason(50_000 + i, policy))
  console.log(`${policy}:`)
  for (const at of [5, 9, 12, 14]) {
    const vals = seasons.map(s => s[at - 1]!)
    console.log(
      `  after ev ${String(at).padStart(2)}  p25 ${money(pct(vals, .25)).padStart(8)}` +
      `  p33 ${money(pct(vals, .33)).padStart(8)}` +
      `  median ${money(pct(vals, .5)).padStart(8)}` +
      `  p75 ${money(pct(vals, .75)).padStart(8)}`,
    )
  }
}

/*
 * The hoard-vs-shop sweep that used to live here has moved to
 * tools/shopcheck.ts, and its answer reversed when it got a working
 * instrument. It modelled equipment as a flat "cones 12% tighter" and
 * concluded that buying lost to banking at every price down to $140k. Run
 * against the REAL boosts through the real cone builder, every one of them
 * returned between three and twenty times its price. The stand-in was wrong,
 * and so was every price derived from it.
 */

/* ------------------------------------------------------------------ *
 * Candidate thresholds, scored by CONDITIONAL kill rate.
 *
 * Setting each threshold at a percentile of the unconditional spread is
 * wrong: everyone who reaches check 2 already survived check 1, so the
 * pool that faces it is richer than the population. What matters is the
 * share of ARRIVALS each check sends home.
 * ------------------------------------------------------------------ */
{
  const R = Number(process.env.N ?? 400)
  const SETS: [number, number, number][] = [
    [350_000, 1_000_000, 1_750_000],
    [330_000, 950_000, 1_650_000],
    [380_000, 1_080_000, 1_900_000],
    [300_000, 880_000, 1_550_000],
  ]
  console.log('\nTHRESHOLD SWEEP · share of ARRIVALS each check sends home')
  for (const policy of ['safe', 'mixed', 'aggressive'] as Policy[]) {
    const seasons = Array.from({ length: R }, (_, i) => playSeason(310_000 + i, policy, true))
    console.log(`  ${policy}`)
    for (const set of SETS) {
      let alive = seasons
      const kills: string[] = []
      const idx = [4, 8, 11]
      set.forEach((need, k) => {
        const before = alive.length
        alive = alive.filter(s => s[idx[k]!]! >= need)
        kills.push(`${(100 - alive.length / before * 100).toFixed(0)}%`.padStart(4))
      })
      console.log(
        `    ${set.map(v => money(v).padStart(7)).join(' / ')}` +
        `   kills ${kills.join(' ')}   survive ${(alive.length / R * 100).toFixed(0)}%`,
      )
    }
  }
  console.log()
}

/* ------------------------------------------------------------------ *
 * WHAT IS EQUIPMENT ACTUALLY WORTH?
 *
 * Price it against the money it earns, not against a feeling. This runs
 * seasons where the kit is FREE, so the gap to a season without it is the
 * gross value of the boost — the most a player could ever rationally pay.
 * ------------------------------------------------------------------ */
{
  const R = Number(process.env.N ?? 400)
  const med = (v: number[]) => [...v].sort((a, b) => a - b)[Math.floor(v.length / 2)]!
  console.log('\nGROSS VALUE OF EQUIPMENT (kit free, 4 pieces, ×0.88 cones each)')
  for (const policy of ['safe', 'mixed', 'aggressive'] as Policy[]) {
    const off = Array.from({ length: R }, (_, i) => playSeason(410_000 + i, policy, false))
    const on = Array.from({ length: R }, (_, i) => playSeasonFreeKit(410_000 + i, policy))
    const d12 = med(on.map(s => s[11]!)) - med(off.map(s => s[11]!))
    const d14 = med(on.map(s => s[13]!)) - med(off.map(s => s[13]!))
    console.log(
      `  ${policy.padEnd(11)} by ev12 ${money(d12).padStart(8)}   by ev14 ${money(d14).padStart(8)}` +
      `   → each of 4 pieces is worth ${money(Math.round(d12 / 4)).padStart(7)}`,
    )
  }
  console.log()
}
