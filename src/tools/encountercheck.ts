/**
 * Is a person on the walk to the fifth tee a CONSEQUENCE, or a receipt?
 *
 * Eighteen instruments live in this directory and not one of them has ever
 * modeled an encounter. That is how four written constants (−$150k, +$150k,
 * +$200k, +$500k) survived six economy re-anchorings unchanged until a fine
 * was 1.1% of what the season demands and the owner filed the verdict:
 * "just had to pay a fine i guess? 150k is pennies." This file is the
 * missing instrument. It answers three questions, at the LIVE calibration
 * (stars on, current MONEY_CHECKS, the shop's budget and tiers), through
 * shopcheck's shopper — the player the Money List was calibrated against:
 *
 *   1. HOW OFTEN DO THEY LAND, and who. ENCOUNTER_CHANCE is one in three of
 *      NON-MAJOR made cuts (majors keep their prize moment — reducer.ts
 *      advance(): a major's cut goes to offerBoosts, never to
 *      maybeEncounter), so the season's supply of people is far smaller
 *      than "a third of your cuts" sounds. Printed per stage, per person,
 *      and — the number that decides everything else — how often the fine
 *      ITSELF actually lands.
 *   2. WHAT IS AN ENCOUNTER WORTH against a season: engage-everything vs
 *      walk-on-everything, paired by seed, in gross and in survival, with
 *      the money isolated from the focus.
 *   3. WHAT WOULD A FINE HAVE TO COST to be a DECISION. A sweep of the
 *      stake scale, each row priced against the things a player can
 *      actually spend money on: the cheapest boost, the median rack
 *      sticker, a spring weekend's yield, and each of the three checks.
 *      Plus the sandbagger's break-even birdie against the MEASURED birdie
 *      rate on the hole he bets on, because a bet whose odds are said out
 *      loud (P8) should be honest arithmetic.
 *
 * It also carries the acceptance bars, because it is the only harness that
 * knows encounters exist: ENC=0 must reproduce CALIBRATION-3's calibrated
 * row, and the shipped stakes must leave mixed survival inside 33–39, the
 * ordering law intact, and check-1's kill within ±4 of its calibrated 44.
 *
 * Everything is seeded and deterministic: the encounter rolls come from the
 * bank's own 'events' stream (salt 6), exactly as the reducer draws them —
 * two draws to decide whether anyone shows and who, two more when a gamble
 * is taken — so a row re-run on the same seeds prints the same digits.
 *
 * Run: npx tsx src/tools/encountercheck.ts
 *   (node lives at "C:\Program Files\nodejs" if npx is not on PATH)
 *   N=250          seasons per row (default 250)
 *   POLICY=mixed   safe | mixed | aggressive — the shot policy
 *   SEED0=700000   first seed — offset it for an independent verification
 *   SCALE=1        multiply every encounter stake (the sizing sweep)
 *   LEGACY=1       the four WRITTEN constants — the world this replaced
 *   ENC=0          no encounters at all — the lineage row
 *   SECTION=all    all | freq | worth | sweep | bet | bars
 *   STARS=0        the marquee ramp off; K/RAMP/BETA/CAP as elsewhere
 *   EXT=28         the full scorecard's extension holes (0 = pre-spread)
 */
import { COURSES } from '../content/courses'
import { scheduleFor } from '../sim/schedule'
import { HAND_SIZE, PUNCH_OUT, REDRAW_COST, STARTING_DECK } from '../content/cards'
import { CARD } from '../content/cards'
import { SEASON, MONEY_CHECKS, payout, tiePayout, money } from '../content/season'
import { BOOST, BOOSTS } from '../content/boosts'
import {
  BOOST_TIERS, EARLY_SHOP_UNTIL, PREMIUM_BOOST, SHOP_BUDGET,
  SPRING_RACK_UNTIL, TIER_WEIGHTS, type ShopTier,
} from '../content/shop'
import {
  ENCOUNTERS, ENCOUNTER_BOOSTS, ENCOUNTER_CHANCE, STAKE_POINT,
  type Encounter, type Outcome,
} from '../content/encounters'
import { buildCone, gimmeRange, maxFocus, focusRegen } from '../sim/effects'
import { chooseShot, type Policy } from './policy'
import { resolveShot, dropPoint } from '../sim/resolve/shot'
import { resolvePutting, sinkCost, baseputts } from '../sim/resolve/putt'
import {
  FULL_HOLES, makeField, advanceField, extendField, extendPlayerRel,
  overlayStars, rankCut, standings, starNamesFor, starTarget, yourPlace,
  type FieldPlayer, type StarDials,
} from '../sim/resolve/field'
import {
  STAR_BAND_BETA, STAR_BAND_CAP, STAR_COUNT, STAR_RAMP_END,
} from '../content/players'
import { surfaceAt, toPin } from '../sim/geometry'
import { hash, makeRng, next, seedBank, type RngBank, type RngState } from '../sim/rng'
import { draw, shuffle } from '../sim/deck'
import type { Boost, HoleSpec, Point, Surface } from '../sim/types'

/* ------------------------------------------------------------------ *
 * THE DIALS
 * ------------------------------------------------------------------ */
const N = Number(process.env.N ?? 250)
const POLICY = (process.env.POLICY ?? 'mixed') as Policy
/**
 * The calibration's own seeds by default: at SEED0=700000, N=400, ENC=0
 * this file's shopper prints CALIBRATION-3's authoritative row digit for
 * digit (44/37/2 → 35%, aggressive 42/50/7 → 27%, hoarder 6%), which is
 * the only reason anything else it says is worth reading. 900000+ is the
 * independent verification set.
 */
const SEED0 = Number(process.env.SEED0 ?? 700_000)
const SCALE = Number(process.env.SCALE ?? 1)
const LEGACY = process.env.LEGACY === '1'
const ENC_ON = process.env.ENC !== '0'
const SECTION = process.env.SECTION ?? 'all'
const EXT = Number(process.env.EXT ?? FULL_HOLES - 8)
const STARS_ON = process.env.STARS !== '0'
const STAR_K = Number(process.env.K ?? STAR_COUNT)
const DIALS: StarDials = {
  ramp: Number(process.env.RAMP ?? STAR_RAMP_END),
  beta: Number(process.env.BETA ?? STAR_BAND_BETA),
  cap: Number(process.env.CAP ?? STAR_BAND_CAP),
}

/**
 * THE WRITTEN TABLE, kept so the instrument can measure the world it
 * replaced. Before ENCOUNTER-STAKES.md these five stakes were dollar
 * literals in content/encounters.ts; the point values they became map
 * one-to-one onto them, which is the only reason a lookup by points can
 * reconstruct the old world exactly.
 *
 *   2 pt  the autograph          was $150k
 *   3 pt  behind the porta-potty was $200k   ·  the sandbagger's stake $200k
 *   4 pt  the Rules Official     was $150k
 *   5 pt  the sandbagger's win   was $500k
 */
const LEGACY_DOLLARS: Readonly<Record<number, number>> = {
  2: 150_000, 3: 200_000, 4: 150_000, 5: 500_000,
}

/** The fine, in points, read from the content so this file cannot drift. */
const FINE_POINTS = (() => {
  const g = ENCOUNTERS.find(e => e.id === 'official')!.engage
  return g.kind === 'gamble' ? Math.abs(g.lose[0]!.points ?? 0) : 0
})()

/**
 * The live scale dial. A box rather than a constant because §3 re-prices
 * the world between rows — one number swapped and restored, with no state
 * carried across rows (every season builds its own bank from its seed).
 */
const SCALE_REF = { value: SCALE }

/** A stake in points, as this row's world prices it. */
function cash(points: number): number {
  const sign = points < 0 ? -1 : 1
  const mag = Math.abs(points)
  if (mag === 0) return 0   // the junior plays for nothing, in every world
  if (LEGACY) {
    const legacy = LEGACY_DOLLARS[mag]
    if (legacy === undefined) throw new Error(`LEGACY has no dollar for ${mag} points`)
    return sign * legacy
  }
  return sign * Math.round(mag * STAKE_POINT * SCALE_REF.value)
}

/* ------------------------------------------------------------------ *
 * THE HARNESS — shopcheck's, mirrored, plus the people.
 * ------------------------------------------------------------------ */
interface Ctx { bank: RngBank; deck: string[]; discard: string[]; focus: number; freeSinks: number }

/** shopcheck's playHole, unchanged — the calibration's own hole. */
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

/** the reducer's settle, mirrored (shopcheck settleWeek) */
function settleWeek(
  field: FieldPlayer[], rel8: number, seed: number, evNum: number,
  purse: number, pars: readonly number[], shift: number,
): { cheque: number; place: number } {
  if (EXT > 0) {
    const to = pars.length + EXT
    const f = extendField(field, pars, seed, evNum, shift, to)
    const rel = extendPlayerRel(rel8, pars.length, pars, seed, evNum, shift, to)
    const rows = standings(f, rel, to, false)
    const place = yourPlace(rows)
    const tied = rows.filter(r => r.place === place).length
    return { cheque: tiePayout(purse, place, tied), place }
  }
  const rows = standings(field, rel8, pars.length, false)
  const place = yourPlace(rows)
  const tied = rows.filter(r => r.place === place).length
  return {
    cheque: place === 1 ? tiePayout(purse, 1, tied) : payout(purse, place),
    place,
  }
}

function withStars(
  field: FieldPlayer[], seed: number, evNum: number, recent: readonly number[],
): FieldPlayer[] {
  if (!STARS_ON) return field
  const trailing = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 0
  return overlayStars(field, starNamesFor(seed, STAR_K), starTarget(evNum, trailing, DIALS))
}

/** the reducer's stock(), statistically (shopcheck drawOffers) */
function drawOffers(
  kit: readonly Boost[], gate: boolean, spring: boolean, rng0: RngState,
): readonly [Boost[], RngState] {
  let rng = rng0
  const owned = new Set(kit.map(k => k.id))
  const offers: Boost[] = []
  for (let slot = 0; slot < 2; slot++) {
    const shelves: Record<ShopTier, Boost[]> = { rack: [], special: [], tour: [] }
    for (const b of BOOSTS) {
      if (owned.has(b.id) || ENCOUNTER_BOOSTS.has(b.id)) continue
      if (offers.some(o => o.id === b.id)) continue
      if (gate && b.price >= PREMIUM_BOOST) continue
      if (b.tier === 'found') continue
      shelves[b.tier].push(b)
    }
    const avail = BOOST_TIERS.filter(t => shelves[t].length > 0)
    if (avail.length === 0) break
    let tier: ShopTier
    if (slot === 0 && spring && shelves.rack.length > 0) {
      tier = 'rack'
    } else {
      const total = avail.reduce((n, t) => n + TIER_WEIGHTS[t], 0)
      const [u, r1] = next(rng)
      rng = r1
      let x = u * total
      tier = avail[avail.length - 1]!
      for (const t of avail) { x -= TIER_WEIGHTS[t]; if (x < 0) { tier = t; break } }
    }
    const [v, r2] = next(rng)
    rng = r2
    const shelf = shelves[tier]
    offers.push(shelf[Math.min(shelf.length - 1, Math.floor(v * shelf.length))]!)
  }
  return [offers, rng] as const
}

/** whether an encounter is on the menu, and what it costs to sit down */
function minWalletOf(e: Encounter): number {
  if (e.minWallet === undefined) return 0
  // priced through THIS row's world, so LEGACY gates on the old stake
  return e.engage.kind === 'bet' ? cash(e.engage.stakePoints) : e.minWallet
}

/** the walk-to-the-fifth policy */
type EncMode = 'off' | 'walk' | 'engage'

/** everything the people did to a season, tallied */
interface EncStat {
  seasons: number
  cuts: number            // made cuts at NON-MAJOR events (the only ones that offer)
  met: number             // somebody was there
  byId: Record<string, number>
  byStage: [number, number, number]   // events 1-5, 6-9, 10-14
  moneyIn: number
  moneyOut: number
  fines: number           // the official's 40% branch landed
  springFines: number     // ...before check 1 was read
  /** the sandbagger only — the junior plays for focus and would flatter it */
  bets: number
  betsWon: number
  betsPushed: number
  postCutHoles: number    // first hole after every made cut
  postCutBirdies: number
}

function emptyStat(): EncStat {
  return {
    seasons: 0, cuts: 0, met: 0, byId: {}, byStage: [0, 0, 0],
    moneyIn: 0, moneyOut: 0, fines: 0, springFines: 0,
    bets: 0, betsWon: 0, betsPushed: 0, postCutHoles: 0, postCutBirdies: 0,
  }
}

/**
 * One season of the offer-stream shopper (shopcheck's, mirrored: budget
 * SHOP_BUDGET, weighted tiers, early gate, spring slot, free major-cut
 * drops) with the walk to the fifth tee modeled — the reducer's
 * maybeEncounter, engage and settleBet, in the same order, off the same
 * 'events' stream.
 *
 * Returns cumulative GROSS after each event, the number the Money List
 * reads.
 */
function season(
  seed: number, policy: Policy, shop: boolean, mode: EncMode, st?: EncStat,
): number[] {
  const ctx: Ctx = { bank: seedBank(seed), deck: [...STARTING_DECK], discard: [], focus: 5, freeSinks: 0 }
  const kit: Boost[] = []
  const recent: number[] = []
  let banked = 0
  let earned = 0
  let bought = 0
  const running: number[] = []
  const rota = scheduleFor(seed)
  let shopRng = makeRng(hash(seed, 8))
  if (st) st.seasons += 1

  for (const ev of SEASON) {
    const course = COURSES[rota[ev.num - 1]!]
    if (shop && ev.num > 1) {
      const gate = ev.num - 1 <= EARLY_SHOP_UNTIL
      const spring = ev.num - 1 <= SPRING_RACK_UNTIL
      const [offers, r] = drawOffers(kit, gate, spring, shopRng)
      shopRng = r
      if (bought < SHOP_BUDGET) {
        const pick = offers.filter(b => b.price <= banked).sort((a, b) => b.price - a.price)[0]
        if (pick) { banked -= pick.price; kit.push(pick); bought += 1 }
      }
    }

    const spread = (): Boost => ({
      id: '_s', name: '', icon: '', blurb: '', price: 0,
      tier: 'rack' as const, spreadScale: ev.sharpness,
    })
    let boosts: Boost[] = [spread(), ...kit]
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
    if (!cut.made) { running.push(earned); continue }

    /* ---- THE DROP: a major's cut hands you a premium boost, free ---- */
    if (ev.major) {
      const owned = new Set(kit.map(k => k.id))
      const premium = BOOSTS.filter(b => !owned.has(b.id) && b.price >= PREMIUM_BOOST)
      const any = BOOSTS.filter(b => !owned.has(b.id))
      const pool = premium.length > 0 ? premium : any
      if (pool.length > 0) {
        const [ids, r] = shuffle(pool.map(b => b.id), ctx.bank.draw)
        ctx.bank = { ...ctx.bank, draw: r }
        const pick = ids.slice(0, 3).map(id => pool.find(b => b.id === id)!)
          .sort((a, b) => b.price - a.price)[0]!
        kit.push(pick)
        ctx.freeSinks += pick.freeSinks ?? 0
        ctx.focus += pick.maxFocusBonus ?? 0
        boosts = [spread(), ...kit]
      }
    }
    const cutBonus = kit.reduce((n, b) => n + (b.cutBonus ?? 0), 0)
    banked += cutBonus
    earned += cutBonus
    field = cut.field

    /* ---- SOMEBODY ON THE WALK TO THE FIFTH (reducer.ts maybeEncounter) ---- */
    let pending: Extract<Encounter['engage'], { kind: 'bet' }> | null = null
    const take = (o: Outcome) => {
      if (o.points !== undefined) {
        const m = cash(o.points)
        if (m >= 0) { banked += m; earned += m; if (st) st.moneyIn += m }
        else {
          const paid = Math.min(-m, banked)
          banked -= paid; earned -= paid
          if (st) st.moneyOut += paid
        }
      }
      if (o.grantBoost !== undefined && !kit.some(k => k.id === o.grantBoost)) {
        kit.push(BOOST[o.grantBoost]!)
        boosts = [spread(), ...kit]
      }
      if (o.focus !== undefined) {
        ctx.focus = Math.min(maxFocus(5, boosts), Math.max(1, ctx.focus + o.focus))
      }
    }
    if (mode !== 'off' && !ev.major) {
      if (st) st.cuts += 1
      const [show, r1] = next(ctx.bank.events)
      const [pick, r2] = next(r1)
      ctx.bank = { ...ctx.bank, events: r2 }
      const eligible = ENCOUNTERS.filter(e => {
        if (minWalletOf(e) > banked) return false
        const g = e.engage
        // no second tiger: a granted encounter boost retires its encounter
        if (g.kind === 'sure' && g.outcome.grantBoost !== undefined
          && kit.some(k => k.id === g.outcome.grantBoost)) return false
        return true
      })
      const chosen = eligible[Math.floor(pick * eligible.length)]
      if (show < ENCOUNTER_CHANCE && chosen) {
        if (st) {
          st.met += 1
          st.byId[chosen.id] = (st.byId[chosen.id] ?? 0) + 1
          st.byStage[ev.num <= 5 ? 0 : ev.num <= 9 ? 1 : 2] += 1
        }
        if (mode === 'engage') {
          const e = chosen.engage
          if (e.kind === 'sure') take(e.outcome)
          else if (e.kind === 'gamble') {
            const [r, rr1] = next(ctx.bank.events)
            const [which, rr2] = next(rr1)
            ctx.bank = { ...ctx.bank, events: rr2 }
            const pool = r < e.odds ? e.win : e.lose
            const o = pool[Math.floor(which * pool.length)]!
            if (st && chosen.id === 'official' && r >= e.odds) {
              st.fines += 1
              if (ev.num <= MONEY_CHECKS[0]!.after) st.springFines += 1
            }
            take(o)
          } else {
            const stake = cash(e.stakePoints)
            const paid = Math.min(stake, banked)
            banked -= paid; earned -= paid
            if (st && e.condition === 'birdie-or-better') st.bets += 1
            if (st) st.moneyOut += paid
            pending = e
          }
        }
      }
    }

    /* ---- the weekend ---- */
    course.holes.slice(4).forEach((hole, i) => {
      const strokes = playHole(hole, ctx, boosts, policy)
      holes.push(strokes)
      if (i === 0) {
        const rel = strokes - hole.par
        if (st) { st.postCutHoles += 1; if (rel <= -1) st.postCutBirdies += 1 }
        // the bet settles the moment the ball drops, after momentum
        if (pending) {
          const b: Extract<Encounter['engage'], { kind: 'bet' }> = pending
          const verdict = b.condition === 'birdie-or-better' ? (rel <= -1 ? 'win' : 'lose')
            : b.condition === 'par-or-better' ? (rel <= 0 ? 'win' : rel >= 2 ? 'lose' : 'push')
              : (rel < 2 ? 'win' : 'lose')
          const o = verdict === 'win' ? b.win : verdict === 'lose' ? b.lose : b.push
          if (st && b.condition === 'birdie-or-better') {
            if (verdict === 'win') st.betsWon += 1
            if (verdict === 'push') st.betsPushed += 1
          }
          if (o) take(o)
          pending = null
        }
      }
      const [f2, r2] = advanceField(field, hole.par, ctx.bank.field, course.fieldShift)
      field = f2; ctx.bank = { ...ctx.bank, field: r2 }
    })
    const rel8 = holes.reduce((a, b) => a + b, 0) - course.par
    recent.push(rel8)
    if (recent.length > 3) recent.shift()
    const settled = settleWeek(field, rel8, seed, ev.num, ev.purse,
      course.holes.map(h => h.par), course.fieldShift)
    banked += settled.cheque
    earned += settled.cheque
    running.push(earned)
  }
  return running
}

/* ------------------------------------------------------------------ *
 * MEASUREMENT
 * ------------------------------------------------------------------ */
const IDX = MONEY_CHECKS.map(c => c.after - 1)

interface Row {
  readonly bySeed: readonly number[]
  readonly gross: number
  readonly surv: number
  /** share of ARRIVALS each check sends home */
  readonly kills: readonly number[]
  readonly perEvent: readonly number[]
}

function measure(policy: Policy, shop: boolean, mode: EncMode, st?: EncStat): Row {
  const seasons: number[][] = []
  const perEvent = SEASON.map(() => 0)
  for (let i = 0; i < N; i++) {
    const s = season(SEED0 + i, policy, shop, mode, st)
    seasons.push(s)
    SEASON.forEach((_, e) => { perEvent[e]! += s[e]! - (e > 0 ? s[e - 1]! : 0) })
  }
  let alive = seasons
  const kills: number[] = []
  MONEY_CHECKS.forEach((c, k) => {
    const before = alive.length
    alive = alive.filter(s => s[IDX[k]!]! >= c.need)
    kills.push(100 - alive.length / before * 100)
  })
  const bySeed = seasons.map(s => s[s.length - 1]!)
  return {
    bySeed,
    gross: bySeed.reduce((a, b) => a + b, 0) / N,
    surv: alive.length / N,
    kills,
    perEvent: perEvent.map(v => v / N),
  }
}

/** paired-by-seed delta and its standard error */
function delta(row: Row, ref: Row): { d: number; se: number } {
  const ds = row.bySeed.map((v, i) => v - ref.bySeed[i]!)
  const d = ds.reduce((a, b) => a + b, 0) / N
  const varr = ds.reduce((a, b) => a + (b - d) * (b - d), 0) / Math.max(1, N - 1)
  return { d, se: Math.sqrt(varr / N) }
}

const dm = (n: number) => (n < 0 ? '-' : '+') + money(Math.round(Math.abs(n)))
const pp = (n: number) => (n < 0 ? '-' : '+') + Math.abs(n * 100).toFixed(1) + 'pp'
const pct = (n: number) => `${(n * 100).toFixed(0)}%`

const world = LEGACY ? 'THE WRITTEN CONSTANTS'
  : SCALE === 1 ? `points × ${money(STAKE_POINT)}`
    : `points × ${money(STAKE_POINT)} × ${SCALE}`

console.log(`\nIS AN ENCOUNTER A CONSEQUENCE, OR A RECEIPT?  ${N} seasons per row` +
  ` · ${POLICY} play · seeds ${SEED0}+` +
  ` · stars ${STARS_ON ? `${STAR_K} @R${DIALS.ramp} β${DIALS.beta} cap${DIALS.cap}` : 'OFF'}` +
  ` · EXT ${EXT}`)
console.log(`  stakes: ${world}${ENC_ON ? '' : ' · ENCOUNTERS OFF'}`)
console.log(`  checks: ${MONEY_CHECKS.map(c => money(c.need)).join(' / ')}\n`)

/* ------------------------------------------------------------------ *
 * 0 · LINEAGE — nothing here is believed until the harness reproduces
 * the calibration it descends from (CALIBRATION-3 §1: kills 44/37/2,
 * survival mixed 35 / aggressive 27 / hoarder 6). This row runs with
 * the people switched OFF, which is the world shopcheck measures.
 * ------------------------------------------------------------------ */
if (SECTION === 'all' || SECTION === 'bars') {
  console.log('  LINEAGE · encounters OFF — must reproduce CALIBRATION-3 within ±2')
  for (const p of ['mixed', 'aggressive'] as Policy[]) {
    const r = measure(p, true, 'off')
    console.log(`    ${p.padEnd(11)} kills ${r.kills.map(k => `${k.toFixed(0)}%`.padStart(4)).join(' ')}` +
      `   survival ${pct(r.surv).padStart(4)}`)
  }
  const h = measure('mixed', false, 'off')
  console.log(`    ${'hoarder'.padEnd(11)} kills ${h.kills.map(k => `${k.toFixed(0)}%`.padStart(4)).join(' ')}` +
    `   survival ${pct(h.surv).padStart(4)}`)
  console.log('    (CALIBRATION-3: mixed 44/37/2 → 35% · aggressive 42/50/7 → 27% · hoarder 6%)\n')
}

/* ------------------------------------------------------------------ *
 * 1 · HOW OFTEN DO THEY LAND
 * ------------------------------------------------------------------ */
if (ENC_ON && (SECTION === 'all' || SECTION === 'freq')) {
  const st = emptyStat()
  const r = measure(POLICY, true, 'engage', st)
  const per = (n: number) => (n / st.seasons).toFixed(2)
  console.log('  HOW OFTEN SOMEBODY IS THERE (engaging everything)')
  console.log(`    non-major made cuts per season      ${per(st.cuts).padStart(6)}` +
    `   (only these ever offer — a major keeps its prize)`)
  console.log(`    encounters met per season          ${per(st.met).padStart(6)}` +
    `   = ${(st.met / Math.max(1, st.cuts) * 100).toFixed(0)}% of those cuts` +
    ` (ENCOUNTER_CHANCE ${(ENCOUNTER_CHANCE * 100).toFixed(0)}%)`)
  console.log(`    by stage  early(1-5) ${per(st.byStage[0])} · mid(6-9) ${per(st.byStage[1])}` +
    ` · late(10-14) ${per(st.byStage[2])}`)
  console.log('    who shows up, per season:')
  for (const e of ENCOUNTERS) {
    console.log(`      ${e.name.padEnd(30)} ${per(st.byId[e.id] ?? 0).padStart(5)}`)
  }
  console.log(`    THE FINE ITSELF lands              ${per(st.fines).padStart(6)}` +
    ` times a season — once every ${(st.seasons / Math.max(1, st.fines)).toFixed(1)} seasons`)
  console.log(`      of which before check 1          ${per(st.springFines).padStart(6)}` +
    `   (${(st.springFines / Math.max(1, st.seasons) * 100).toFixed(1)}% of seasons meet one in the spring)`)
  console.log(`    money in ${money(Math.round(st.moneyIn / st.seasons))} a season,` +
    ` out ${money(Math.round(st.moneyOut / st.seasons))} a season,` +
    ` net ${dm((st.moneyIn - st.moneyOut) / st.seasons)}`)
  console.log(`    against a mean season of ${money(Math.round(r.gross))}` +
    ` — the people are ${((st.moneyIn + st.moneyOut) / st.seasons / r.gross * 100).toFixed(2)}% of it\n`)
}

/* ------------------------------------------------------------------ *
 * 2 · WHAT IS AN ENCOUNTER WORTH — engage vs walk on, paired by seed
 * ------------------------------------------------------------------ */
if (ENC_ON && (SECTION === 'all' || SECTION === 'worth')) {
  console.log('  ENGAGE EVERYTHING vs WALK ON EVERYTHING  (Δ paired by seed, ±1 s.e.)')
  console.log('  policy        walk gross    engage gross      gross Δ     ±s.e.   survival')
  console.log('  ' + '-'.repeat(76))
  for (const p of ['mixed', 'aggressive'] as Policy[]) {
    const walk = measure(p, true, 'walk')
    const eng = measure(p, true, 'engage')
    const { d, se } = delta(eng, walk)
    console.log(`  ${p.padEnd(12)} ${money(Math.round(walk.gross)).padStart(9)}` +
      ` ${money(Math.round(eng.gross)).padStart(15)} ${dm(d).padStart(12)}` +
      ` ${money(Math.round(se)).padStart(9)}  ${pct(walk.surv)} → ${pct(eng.surv)}` +
      ` (${pp(eng.surv - walk.surv)})`)
  }
  console.log('\n  A row inside 2×s.e. is a WASH: the people cost nothing and pay')
  console.log('  nothing, which is the definition of a receipt.\n')
}

/* ------------------------------------------------------------------ *
 * 3 · WHAT WOULD A FINE HAVE TO COST TO BE A DECISION
 *
 * The sweep re-prices every stake and asks two different questions of
 * each row. The AGGREGATE question — does the season notice — is
 * answered by survival. The LOCAL question — does the moment land — is
 * answered by comparing the fine to the things a player spends money
 * on, because that is the only currency a decision is made in.
 * ------------------------------------------------------------------ */
if (SECTION === 'all' || SECTION === 'sweep') {
  const rack = BOOSTS.filter(b => b.tier === 'rack').map(b => b.price).sort((a, b) => a - b)
  const cheapest = Math.min(...BOOSTS.filter(b => b.price > 0).map(b => b.price))
  const medRack = rack[Math.floor(rack.length / 2)]!
  const walk = measure(POLICY, true, 'walk')
  const spring = walk.perEvent.slice(0, 5).reduce((a, b) => a + b, 0) / 5

  console.log('  WHAT WOULD A FINE HAVE TO COST?  (the same season, re-priced)')
  console.log(`  the shelf: cheapest boost ${money(cheapest)} · median rack ${money(medRack)}` +
    ` · a spring weekend yields ${money(Math.round(spring))}`)
  console.log('  scale     fine    ×cheapest   ×spring wk   %check1   %season    survival Δ')
  console.log('  ' + '-'.repeat(76))
  const SCALES = (process.env.SCALES ?? '0.25,0.5,0.75,1,1.5,2,3')
    .split(',').map(Number).filter(n => Number.isFinite(n) && n > 0)
  for (const s of SCALES) {
    const fine = Math.round(FINE_POINTS * STAKE_POINT * s)
    const eng = measureAt(s, POLICY)
    console.log(`  ${s.toFixed(2).padStart(5)} ${money(fine).padStart(8)}` +
      ` ${(fine / cheapest).toFixed(1).padStart(11)}` +
      ` ${(fine / spring).toFixed(2).padStart(12)}` +
      ` ${(fine / MONEY_CHECKS[0]!.need * 100).toFixed(1).padStart(9)}%` +
      ` ${(fine / walk.gross * 100).toFixed(2).padStart(8)}%` +
      `  ${pct(walk.surv)} → ${pct(eng.surv)} (${pp(eng.surv - walk.surv)})`)
  }
  console.log('\n  A fine under 1× the cheapest boost cannot change any purchase.')
  console.log('  A fine over one spring weekend is a season-altering punishment for')
  console.log('  a 40% branch of an optional conversation — the band is between.\n')
}

/* ------------------------------------------------------------------ *
 * 4 · THE SANDBAGGER'S ARITHMETIC — the odds are SAID (P8), so they
 * had better be true. Break-even = stake / payout; the measured rate
 * is the birdie rate on the hole he bets on (the first after the cut).
 * ------------------------------------------------------------------ */
if (ENC_ON && (SECTION === 'all' || SECTION === 'bet')) {
  const st = emptyStat()
  measure(POLICY, true, 'engage', st)
  const sand = ENCOUNTERS.find(e => e.id === 'sandbagger')!
  const e = sand.engage as Extract<Encounter['engage'], { kind: 'bet' }>
  const stake = cash(e.stakePoints)
  const payoff = cash(e.win.points ?? 0)
  const breakeven = stake / payoff
  const measured = st.postCutBirdies / Math.max(1, st.postCutHoles)
  console.log('  THE SANDBAGGER, AS ARITHMETIC')
  console.log(`    stake ${money(stake)} to win ${money(payoff)}` +
    ` → break-even birdie ${(breakeven * 100).toFixed(1)}%`)
  console.log(`    measured birdie-or-better on the hole after the cut:` +
    ` ${(measured * 100).toFixed(1)}%  (${st.postCutBirdies} of ${st.postCutHoles})`)
  console.log(`    his bets taken ${st.bets}, won ${st.betsWon}` +
    ` (${(st.betsWon / Math.max(1, st.bets) * 100).toFixed(0)}%)` +
    ' — higher than the baseline because his stake gates on the wallet,' +
    '\n      so he only ever bets a player already having a good season')
  console.log(`    the bet is ${measured >= breakeven ? 'IN THE PLAYER\'S FAVOUR' : 'against you'}` +
    ` by ${Math.abs(measured - breakeven) * 100 < 0.05 ? '~0' : ((measured - breakeven) * 100).toFixed(1)}` +
    ' points — a golf bet should sit a hair against you, never for you.\n')
}

/* ------------------------------------------------------------------ *
 * 5 · THE ACCEPTANCE BARS, with the people in the world
 * ------------------------------------------------------------------ */
if (ENC_ON && (SECTION === 'all' || SECTION === 'bars')) {
  console.log('  THE BARS, WITH ENCOUNTERS MODELED (engaging everything — the worst case')
  console.log('  for the spring, since walking on is always free)')
  console.log('  policy        check kills          survival    band')
  console.log('  ' + '-'.repeat(64))
  for (const [label, p, shop] of [
    ['mixed', 'mixed', true], ['aggressive', 'aggressive', true], ['hoarder', 'mixed', false],
  ] as const) {
    const r = measure(p, shop, 'engage')
    const ok = label === 'mixed'
      ? (r.surv >= 0.33 && r.surv <= 0.39 ? 'survival 33-39 OK' : 'survival OUT OF BAND')
      : ''
    console.log(`  ${label.padEnd(12)} ${r.kills.map(k => `${k.toFixed(0)}%`.padStart(5)).join(' ')}` +
      `        ${pct(r.surv).padStart(5)}    ${ok}`)
  }
  console.log('\n  Bars: mixed survival 33-39 (CALIBRATION-3), mixed > aggressive >')
  console.log('  hoarder, check-1 kill within ±4 of its calibrated 44.\n')
}

/**
 * The sweep re-prices the world between rows, which the module-level
 * `cash` cannot do on its own — this reruns a measurement with the scale
 * dial temporarily moved. Kept honest by being a pure swap of one number
 * and a restore, with no state carried between rows (every season builds
 * its own bank from its seed).
 */
function measureAt(scale: number, policy: Policy): Row {
  const before = SCALE_REF.value
  SCALE_REF.value = scale
  try { return measure(policy, true, 'engage') } finally { SCALE_REF.value = before }
}
