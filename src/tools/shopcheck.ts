/**
 * Is the pro shop a decision, or is it decoration?
 *
 * Measured with a synthetic ×0.88-cones stand-in for equipment, buying LOST to
 * hoarding at every price down to $140k and at every quantity from one piece to
 * four. That makes the shop decoration: money has one job (clear the Money
 * List) and spending it strictly hurts that job.
 *
 * The stand-in was too crude to price against, so this runs the REAL boosts,
 * one at a time, through the real cone builder and the real putting rules, and
 * reports what each is worth in prize money across a season. A boost should
 * return roughly twice its price — enough that buying is correct, not so much
 * that it is free (see content/shop.ts for that calibration).
 *
 * Run: npx tsx src/tools/shopcheck.ts
 */
import { COURSES } from '../content/courses'
import { scheduleFor } from '../sim/schedule'
import { HAND_SIZE, PUNCH_OUT, REDRAW_COST, STARTING_DECK, CARD } from '../content/cards'
import { SEASON, MONEY_CHECKS, payout, money } from '../content/season'
import { BOOSTS } from '../content/boosts'
import { PREMIUM_BOOST } from '../content/shop'
import { buildCone, gimmeRange, maxFocus, focusRegen } from '../sim/effects'
import { chooseShot, type Policy } from './policy'
import { resolveShot, dropPoint } from '../sim/resolve/shot'
import { resolvePutting, sinkCost, baseputts } from '../sim/resolve/putt'
import {
  makeField, advanceField, overlayStars, rankCut, standings, starNamesFor,
  starTarget, yourPlace, type FieldPlayer, type StarDials,
} from '../sim/resolve/field'
import {
  STAR_BAND_BETA, STAR_BAND_CAP, STAR_COUNT, STAR_RAMP_END,
} from '../content/players'
import { surfaceAt, toPin } from '../sim/geometry'
import { seedBank, type RngBank } from '../sim/rng'
import { draw, shuffle } from '../sim/deck'
import type { Boost, HoleSpec, Point, Surface } from '../sim/types'

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
  const gimme = gimmeRange(boosts)
  const redrawCost = Math.max(0, REDRAW_COST - boosts.reduce((n, b) => n + (b.redrawDiscount ?? 0), 0))

  for (let i = 0; i < 14; i++) {
    if (lie === 'green') {
      const feet = Math.max(1, Math.round(toPin(hole, ball) * 3))
      const raw = sinkCost(feet, gimme)
      // a free sink from the Lucky Ball Marker beats paying for it
      const free = raw !== null && raw > 0 && ctx.freeSinks > 0
      const cost = raw === null ? null : Math.max(0, raw - discount)
      const worth = cost !== null && baseputts(feet, gimme) > 1 && strokes + 1 <= hole.par - 1
        && (free || cost <= ctx.focus)
      if (worth) {
        if (free) ctx.freeSinks -= 1
        else ctx.focus -= cost!
      }
      strokes += resolvePutting(feet, worth, gimme).strokes
      break
    }
    if (!redrawn && ctx.focus >= redrawCost) {
      const reach = Math.max(...hand.map(id => CARD[id])
        .filter(c => !!c && c.kind === 'shot')
        .map(c => (c as { carry: number }).carry), PUNCH_OUT.carry)
      if (reach * Math.max(1, hole.par - 2) < toPin(hole, ball) * 0.85) {
        ctx.focus -= redrawCost
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

/** THE MARQUEE RAMP (FIELD-CEILING.md §6): STARS=0 off; K/RAMP/BETA/CAP sweep. */
const STARS_ON = process.env.STARS !== '0'
const STAR_K = Number(process.env.K ?? STAR_COUNT)
const DIALS: StarDials = {
  ramp: Number(process.env.RAMP ?? STAR_RAMP_END),
  beta: Number(process.env.BETA ?? STAR_BAND_BETA),
  cap: Number(process.env.CAP ?? STAR_BAND_CAP),
}
/** the game's overlay, from a tool's running trailing-pace window */
function withStars(
  field: FieldPlayer[], seed: number, evNum: number, recent: readonly number[],
): FieldPlayer[] {
  if (!STARS_ON) return field
  const trailing = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 0
  return overlayStars(field, starNamesFor(seed, STAR_K), starTarget(evNum, trailing, DIALS))
}

/** Total prize money across a whole season, carrying the named boosts all year. */
function seasonEarnings(seed: number, policy: Policy, kit: readonly Boost[]): number {
  return seasonEarningsWithDeck(seed, policy, kit, STARTING_DECK)
}

function seasonEarningsWithDeck(
  seed: number, policy: Policy, kit: readonly Boost[], startDeck: readonly string[],
): number {
  const ctx: Ctx = { bank: seedBank(seed), deck: [...startDeck], discard: [], focus: 5, freeSinks: 0 }
  const cutBonus = kit.reduce((n, b) => n + (b.cutBonus ?? 0), 0)
  let earned = 0
  // trailing pace for the band — last 3 made-cut full-event rels, as the game
  const recent: number[] = []
  // the real rotation for this seed — the same pool draw the game makes
  const rota = scheduleFor(seed)
  for (const ev of SEASON) {
    const course = COURSES[rota[ev.num - 1]!]
    const boosts: Boost[] = [
      { id: '_s', name: '', icon: '', blurb: '', price: 0, spreadScale: ev.sharpness },
      ...kit,
    ]
    ctx.focus = maxFocus(5, boosts)
    ctx.freeSinks = kit.reduce((n, b) => n + (b.freeSinks ?? 0), 0)
    let [field, fr] = makeField(ctx.bank.field, ev.fieldStrength)
    ctx.bank = { ...ctx.bank, field: fr }
    field = withStars(field, seed, ev.num, recent)

    const holes: number[] = []
    course.holes.slice(0, 4).forEach(hole => {
      holes.push(playHole(hole, ctx, boosts, policy))
      const [f2, r2] = advanceField(field, hole.par, ctx.bank.field, course.fieldShift)
      field = f2; ctx.bank = { ...ctx.bank, field: r2 }
    })
    const thru4 = holes.reduce((a, b) => a + b, 0)
      - course.holes.slice(0, 4).reduce((a, h) => a + h.par, 0)
    const cut = rankCut(field, thru4, ev.advance)
    if (!cut.made) continue
    earned += cutBonus   // sponsor money for the made cut (Boost.cutBonus)
    field = cut.field
    course.holes.slice(4).forEach(hole => {
      holes.push(playHole(hole, ctx, boosts, policy))
      const [f2, r2] = advanceField(field, hole.par, ctx.bank.field, course.fieldShift)
      field = f2; ctx.bank = { ...ctx.bank, field: r2 }
    })
    const rel = holes.reduce((a, b) => a + b, 0) - course.par
    recent.push(rel)
    if (recent.length > 3) recent.shift()
    earned += payout(ev.purse, yourPlace(standings(field, rel, 8, false)))
  }
  return earned
}

const N = Number(process.env.N ?? 250)
const POLICY = (process.env.POLICY ?? 'mixed') as Policy
const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length

const base = mean(Array.from({ length: N }, (_, i) => seasonEarnings(600_000 + i, POLICY, [])))
console.log(`\nWHAT EACH BOOST IS WORTH · ${N} seasons each · ${POLICY} play`)
console.log(`  bare season earns ${money(Math.round(base))}\n`)
console.log('  boost                              price     season +      ×price   verdict')
console.log('  ' + '-'.repeat(78))

const rows = BOOSTS.map(b => {
  const withIt = mean(Array.from({ length: N }, (_, i) => seasonEarnings(600_000 + i, POLICY, [b])))
  const gain = withIt - base
  return { b, gain, ratio: gain / b.price }
}).sort((a, b) => b.ratio - a.ratio)

for (const r of rows) {
  const verdict = r.ratio >= 2.5 ? 'too cheap'
    : r.ratio >= 1.4 ? 'buy'
      : r.ratio >= 0.8 ? 'marginal' : 'DECORATION'
  console.log(
    `  ${r.b.name.padEnd(32)} ${money(r.b.price).padStart(7)} ` +
    `${money(Math.round(r.gain)).padStart(11)} ${r.ratio.toFixed(2).padStart(11)}   ${verdict}`,
  )
}
console.log('\n  Target: every boost between 1.4× and 2.5× its price.\n')

/* ------------------------------------------------------------------ *
 * WHAT IS A CARD CUT WORTH?
 *
 * P2 says fewer cards wins — dilution beats any single card — so the pro
 * shop sells the right to remove one. It was priced at $60k out of a season
 * that earns millions, which is not a decision. Measure it the same way the
 * boosts were measured: play the season with that card gone.
 * ------------------------------------------------------------------ */
{
  const uniq = [...new Set(STARTING_DECK)]
  console.log(`  CUTTING ONE CARD · ${N} seasons each · ${POLICY} play`)
  const rows = uniq.map(id => {
    const deck = [...STARTING_DECK]
    deck.splice(deck.indexOf(id), 1)
    const got = mean(Array.from({ length: N }, (_, i) => seasonEarningsWithDeck(600_000 + i, POLICY, [], deck)))
    return { id, gain: got - base }
  }).sort((a, b) => b.gain - a.gain)
  for (const r of rows.slice(0, 5)) {
    console.log(`    cut ${(CARD[r.id]?.name ?? r.id).padEnd(22)} ${money(Math.round(r.gain)).padStart(10)}`)
  }
  console.log(`    ...`)
  for (const r of rows.slice(-2)) {
    console.log(`    cut ${(CARD[r.id]?.name ?? r.id).padEnd(22)} ${money(Math.round(r.gain)).padStart(10)}`)
  }
  console.log(`    best cut is worth ${money(Math.round(rows[0]!.gain))} over a season\n`)
}

/* ------------------------------------------------------------------ *
 * THE MONEY LIST, CALIBRATED AGAINST A PLAYER WHO SHOPS.
 *
 * This is the only harness with the real boosts in it, so this is where
 * the thresholds get set. The shopper buys on PACE — spend down to the
 * straight line running to the next check, never below it — which is what
 * a player does once they can see the number they are chasing.
 *
 * What matters is the share of ARRIVALS each check sends home, not the
 * percentile of the population: everyone facing check 2 already survived
 * check 1, so the pool is richer than the spread suggests.
 * ------------------------------------------------------------------ */
{
  const R = Number(process.env.SEASONS ?? 250)
  // Best thing you can afford, not cheapest — buying Soft Spikes first because
  // it is $150k is a harness artefact, not a player.
  const order = [...BOOSTS].sort((a, b) => b.price - a.price)
  // THE FREE MAJOR-CUT DROPS (DROPS=0 to measure the world without them).
  // Found live by the owner and absent from every prior threshold derivation:
  // surviving a major's cut hands you a premium boost for free
  // (reducer.ts offerBoosts). Modeled below by mirroring that reducer exactly.
  const DROPS = process.env.DROPS !== '0'

  interface EvResult {
    readonly played: boolean
    /** your finishing place when you made the cut, else 0 */
    readonly place: number
    /** your full-event rel when you made the cut, else null */
    readonly rel8: number | null
    /** a star posted (or shared) the field's best total this week */
    readonly starWon: boolean
  }

  function shoppingSeason(
    seed: number, policy: Policy, _needs: readonly number[], shop: boolean,
    perEvent?: EvResult[],
  ): number[] {
    const ctx: Ctx = { bank: seedBank(seed), deck: [...STARTING_DECK], discard: [], focus: 5, freeSinks: 0 }
    const kit: Boost[] = []
    // trailing pace for the band — last 3 made-cut rels, as GameState keeps
    const recent: number[] = []
    // The check runs on GROSS earnings now, so the wallet and the list are
    // separate numbers: `banked` is what the shop can take, `earned` is what
    // the Money List sees, and buying moves only the first. The old
    // pace-protection logic died with the net check — a purchase cannot
    // endanger a check, so the shopper simply buys the best thing they can
    // afford, one a week.
    let banked = 0
    let earned = 0
    let bought = 0
    const running: number[] = []
    const rota = scheduleFor(seed)

    for (const ev of SEASON) {
      const course = COURSES[rota[ev.num - 1]!]
      if (shop && ev.num > 1) {
        for (const b of order) {
          if (kit.some(k => k.id === b.id)) continue
          if (b.price > banked) continue
          // the cap counts PURCHASES: free major-cut drops arrive on top of
          // the four-buy budget, exactly as they do for a live player
          if (bought >= 4) break
          banked -= b.price; kit.push(b); bought += 1; break
        }
      }

      let boosts: Boost[] = [
        { id: '_s', name: '', icon: '', blurb: '', price: 0, spreadScale: ev.sharpness },
        ...kit,
      ]
      ctx.focus = maxFocus(5, boosts)
      ctx.freeSinks = kit.reduce((n, b) => n + (b.freeSinks ?? 0), 0)
      let [field, fr] = makeField(ctx.bank.field, ev.fieldStrength)
      ctx.bank = { ...ctx.bank, field: fr }
      field = withStars(field, seed, ev.num, recent)

      const holes: number[] = []
      course.holes.slice(0, 4).forEach(hole => {
        holes.push(playHole(hole, ctx, boosts, policy))
        const [f2, r2] = advanceField(field, hole.par, ctx.bank.field, course.fieldShift)
        field = f2; ctx.bank = { ...ctx.bank, field: r2 }
      })
      const thru4 = holes.reduce((a, b) => a + b, 0)
        - course.holes.slice(0, 4).reduce((a, h) => a + h.par, 0)
      const cut = rankCut(field, thru4, ev.advance)
      if (cut.made) {
        // THE DROP: surviving a major's cut hands you a boost, free. Mirror
        // of reducer.ts offerBoosts — premium tier (price >= PREMIUM_BOOST),
        // falls back to anything unowned when the shelf is bare, skipped
        // outright when everything is owned; three offered, and the shopper
        // takes the best of them by price (prices are measured value over
        // two, so price order IS value order to within the calibration).
        if (DROPS && ev.major) {
          const owned = new Set(kit.map(k => k.id))
          const premium = BOOSTS.filter(b => !owned.has(b.id) && b.price >= PREMIUM_BOOST)
          const any = BOOSTS.filter(b => !owned.has(b.id))
          const pool = premium.length > 0 ? premium : any
          if (pool.length > 0) {
            const [ids, r] = shuffle(pool.map(b => b.id), ctx.bank.draw)
            ctx.bank = { ...ctx.bank, draw: r }
            const pick = ids.slice(0, 3)
              .map(id => pool.find(b => b.id === id)!)
              .sort((a, b) => b.price - a.price)[0]!
            kit.push(pick)
            // the reducer grants these immediately on pickup
            ctx.freeSinks += pick.freeSinks ?? 0
            ctx.focus += pick.maxFocusBonus ?? 0
            boosts = [
              { id: '_s', name: '', icon: '', blurb: '', price: 0, spreadScale: ev.sharpness },
              ...kit,
            ]
          }
        }
        // sponsor money for the made cut (Boost.cutBonus) — gross earnings,
        // so it lands in the wallet AND on the Money List. Counted AFTER the
        // drop, as the game does: settle reads d.boosts, which by then holds
        // a boost picked at this very cut.
        const cutBonus = kit.reduce((n, b) => n + (b.cutBonus ?? 0), 0)
        banked += cutBonus
        earned += cutBonus
        field = cut.field
        course.holes.slice(4).forEach(hole => {
          holes.push(playHole(hole, ctx, boosts, policy))
          const [f2, r2] = advanceField(field, hole.par, ctx.bank.field, course.fieldShift)
          field = f2; ctx.bank = { ...ctx.bank, field: r2 }
        })
        const rel8 = holes.reduce((a, b) => a + b, 0) - course.par
        recent.push(rel8)
        if (recent.length > 3) recent.shift()
        const place = yourPlace(standings(field, rel8, 8, false))
        const cheque = payout(ev.purse, place)
        banked += cheque
        earned += cheque
        if (perEvent) {
          const live = field.filter(p => !p.cut)
          const best = Math.min(...live.map(p => p.total))
          const starWon = place > 1 && live.some(p => p.total === best && p.star === true)
          perEvent.push({ played: true, place, rel8, starWon })
        }
      } else if (perEvent) {
        perEvent.push({ played: false, place: 0, rel8: null, starWon: false })
      }
      running.push(earned)
    }
    return running
  }

  // SETS="1400000,4800000,8400000;1500000,5600000,9200000" sweeps custom
  // triples; the defaults bracket the live numbers.
  const SETS: number[][] = process.env.SETS
    ? process.env.SETS.split(';').map(s => s.split(',').map(Number))
    : [
      MONEY_CHECKS.map(c => c.need),
      [2_100_000, 9_500_000, 12_800_000],
      [2_500_000, 10_500_000, 13_800_000],
    ]
  const IDX = MONEY_CHECKS.map(c => c.after - 1)

  console.log(`  THE MONEY LIST vs A PLAYER WHO SHOPS · ${R} seasons per policy` +
    `${DROPS ? '' : ' · DROPS OFF'}` +
    ` · stars ${STARS_ON ? `${STAR_K} @R${DIALS.ramp} β${DIALS.beta} cap${DIALS.cap}` : 'OFF'}\n`)

  /* ---------------------------------------------------------------- *
   * WINS=1 — THE MARQUEE RAMP's target dial (FIELD-CEILING.md §6–7,
   * sweep B): does the strong late-season player still win every
   * weekend they play? Mixed shopper, drops modeled — the closest
   * harness to the evidenced 83%-of-weekends player.
   * ---------------------------------------------------------------- */
  if (process.env.WINS === '1') {
    const per: EvResult[][] = []
    for (let i = 0; i < R; i++) {
      const p: EvResult[] = []
      shoppingSeason(700_000 + i, 'mixed', [], true, p)
      per.push(p)
    }
    const rate = (rs: EvResult[]) => {
      const played = rs.filter(r => r.played)
      const wins = played.filter(r => r.place === 1).length
      return { n: played.length, wins, pct: played.length ? wins / played.length * 100 : NaN }
    }
    const slice = (lo: number, hi: number) => per.flatMap(s => s.slice(lo - 1, hi))
    const all = rate(slice(1, 14))
    const late = rate(slice(10, 14))
    const finale = rate(slice(14, 14))
    const hot = slice(10, 14).filter(r => r.played && r.rel8 !== null && r.rel8 <= -8)
    const hotRate = rate(hot)
    const lateLost = slice(10, 14).filter(r => r.played && r.place > 1)
    const starShare = lateLost.length
      ? lateLost.filter(r => r.starWon).length / lateLost.length * 100 : NaN
    console.log(`  WIN RATE · mixed shopper · ${R} seasons`)
    console.log('    win% by event: ' + SEASON.map((_, e) => {
      const r = rate(per.map(s => s[e]!).filter(Boolean))
      return r.pct.toFixed(0).padStart(3)
    }).join(' '))
    console.log(`    weekends played, all season   ${String(all.n).padStart(5)}   won ${all.pct.toFixed(0)}%`)
    console.log(`    weekends played, events 10-14 ${String(late.n).padStart(5)}   won ${late.pct.toFixed(0)}%`)
    console.log(`    the finale                    ${String(finale.n).padStart(5)}   won ${finale.pct.toFixed(0)}%`)
    console.log(`    hot weeks (rel ≤ -8), 10-14   ${String(hotRate.n).padStart(5)}   won ${hotRate.pct.toFixed(0)}%`)
    console.log(`    late weekends lost: a star took ${starShare.toFixed(0)}% of them\n`)
  }
  // SHARE=1: median cumulative gross per event for the mixed shopper — the
  // season.ts SHARE array (median share banked by each event) and the
  // LADDER's 20th-place anchor are re-measured from this line.
  if (process.env.SHARE === '1') {
    const seasons = Array.from({ length: R }, (_, i) => shoppingSeason(700_000 + i, 'mixed', [], true))
    const med = (v: number[]) => [...v].sort((a, b) => a - b)[Math.floor(v.length / 2)]!
    const meds = SEASON.map((_, e) => med(seasons.map(s => s[e]!)))
    const total = meds[meds.length - 1]!
    console.log('  MIXED SHOPPER · median cumulative gross by event')
    console.log('    ' + meds.map(m => money(m)).join(' '))
    console.log('    SHARE: ' + meds.map(m => (m / total).toFixed(2)).join(', ') + '\n')
  }
  const POLICIES = (process.env.POLICIES ?? 'safe,mixed,aggressive').split(',') as Policy[]
  for (const policy of POLICIES) {
    console.log(`  ${policy}`)
    for (const set of SETS) {
      const out: string[] = []
      let killLine = ''
      for (const shop of [false, true]) {
        const seasons = Array.from({ length: R }, (_, i) => shoppingSeason(700_000 + i, policy, set, shop))
        let alive = seasons
        const kills: string[] = []
        set.forEach((need, k) => {
          const before = alive.length
          alive = alive.filter(s => s[IDX[k]!]! >= need)
          kills.push(`${(100 - alive.length / before * 100).toFixed(0)}%`.padStart(4))
        })
        out.push(`${(alive.length / R * 100).toFixed(0)}%`.padStart(4))
        if (shop) killLine = kills.join(' ')
      }
      console.log(
        `    ${set.map(v => money(v).padStart(7)).join(' / ')}` +
        `   shopper sends home ${killLine}   bank ${out[0]}  shop ${out[1]}`,
      )
    }
  }
  console.log()
}
