/**
 * Is a week off ever worth an event? Nobody has ever taken one.
 *
 * The replay evidence (runstats: WEEKS taken: none — twelve made cuts, nine
 * wins, zero weeks) says the game's best player treats the schedule screen as
 * a Tee Off button with decorations. weeks.ts promises the opposite:
 * "everything here has to be worth roughly what an event pays, or nobody
 * would ever sit one out." This tool measures whether that promise was ever
 * kept. Nobody had checked.
 *
 * Three questions, settled over full seasons on the real pool rotation with
 * the modern rulebook (momentum, gimme, field response, the free major-cut
 * drops — this playHole mirrors rewardcheck's, not the stale shopcheck one),
 * with a shopper carrying real equipment, because that is the player the
 * Money List was calibrated against:
 *
 *   1. WHAT DOES A PLAYED EVENT YIELD at each stage of the season — the
 *      opportunity cost. A week off costs exactly one of these (plus, at a
 *      major, the free premium drop, which the major-skip row prices).
 *   2. WHAT DOES EACH WEEK OPTION RETURN taken early / mid / late vs never —
 *      final gross earnings delta (the number the Money List reads) and
 *      survival delta. The lesson compounds through the practice multiplier,
 *      so early should beat late; the sponsor's -1 focus taxes the NEXT
 *      THREE EVENTS (the weeks redesign — it used to be permanent), so its
 *      price should now be flat-ish across timings. Measured, not assumed.
 *      Since the redesign not every option is offerable at every timing —
 *      nothing at majors, nothing from event 10 — and those rows are printed
 *      as [OFF MENU] counterfactuals rather than faked as purchases.
 *   3. WHAT WOULD THE EFFECTS BE WORTH FREE — the same tighten / focus-tax
 *      applied without skipping the event, to decompose each option into
 *      (effect value) − (event forfeited) and price the design space.
 *
 * The lesson's $120k fee moves wallet money to `spent`, so the Money List
 * (gross = earnings + spent) never sees it — here it only shrinks the
 * shopping budget, exactly as in reducer.ts takeWeek.
 *
 * Run: npx tsx src/tools/weekcheck.ts
 *   (node lives at "C:\Program Files\nodejs" if npx is not on PATH)
 *   N=250            seasons per row (default 250)
 *   POLICY=mixed     safe | mixed | aggressive
 *   SHOP=1           0 to measure the non-shopper (drops still modeled)
 *   VICTIM=smooth    which card a fitting week cuts (rewardcheck's best cut)
 *   SEED0=800000     first seed — offset it for an independent verification
 */
import { COURSES } from '../content/courses'
import { scheduleFor } from '../sim/schedule'
import { HAND_SIZE, PUNCH_OUT, REDRAW_COST, STARTING_DECK, CARD } from '../content/cards'
import { SEASON, MONEY_CHECKS, payout, tiePayout, money } from '../content/season'
import { BOOSTS } from '../content/boosts'
import {
  BOOST_TIERS, EARLY_SHOP_UNTIL, PREMIUM_BOOST, SHOP_BUDGET,
  SPRING_RACK_UNTIL, TIER_WEIGHTS, tierOf, type BoostTier,
} from '../content/shop'
import { ENCOUNTER_BOOSTS } from '../content/encounters'
import { WEEK, WEEKS, LESSON_FEE, WEEKS_END_AT } from '../content/weeks'
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

interface Ctx {
  bank: RngBank; deck: string[]; discard: string[]; focus: number; freeSinks: number
  /** the sponsor's tax — reducer.ts caps focus at maxFocus − focusPenalty */
  penalty: number
}

/** rewardcheck's playHole (full modern rulebook) plus the focusPenalty cap. */
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
  ctx.focus = Math.min(
    Math.max(1, maxFocus(5, boosts) - ctx.penalty),
    ctx.focus + focusRegen(boosts, strokes - hole.par),
  )
  return strokes
}

/**
 * A season plan: which events are spent on a week option, plus two synthetic
 * knobs (used only by the EFFECT ALONE section) that apply a week's effect
 * WITHOUT forfeiting the event — the counterfactual a designer prices against.
 */
interface Plan {
  readonly weeks?: Readonly<Record<number, string>>
  /** the sponsor's tax alone, SHIPPED SEMANTICS: −1 focus for the contract's
   * three events starting AT this event, no event skipped */
  readonly penaltyFrom?: number
  readonly practiceFrom?: { readonly event: number; readonly tighten: number }
}

interface SeasonOut {
  /** GROSS — what the Money List reads. The lesson fee never touches it. */
  readonly earned: number
  /** cumulative gross after each event, weeks included */
  readonly running: readonly number[]
  /** the lesson was scheduled but the wallet could not pay: played instead */
  readonly lessonRefused: boolean
}

/**
 * THE OFFER-STREAM SHOPPER (SHOP-SUPPLY.md) — shopcheck's model, mirrored:
 * the shop after a played event deals two weighted tier slots (rack 6 /
 * special 3 / tour 1, unowned pool, gated below the premium line through
 * EARLY_SHOP_UNTIL), and the shopper takes the best affordable offer, one
 * a week, at most SHOP_BUDGET a season. EVENT_YIELDS is quoted from this
 * harness, so the shopper here must be the calibration's shopper.
 */
function drawOffers(
  kit: readonly Boost[], gate: boolean, spring: boolean, rng0: RngState,
): readonly [Boost[], RngState] {
  let rng = rng0
  const owned = new Set(kit.map(k => k.id))
  const offers: Boost[] = []
  for (let slot = 0; slot < 2; slot++) {
    const shelves: Record<BoostTier, Boost[]> = { rack: [], special: [], tour: [] }
    for (const b of BOOSTS) {
      if (owned.has(b.id) || ENCOUNTER_BOOSTS.has(b.id)) continue
      if (offers.some(o => o.id === b.id)) continue
      if (gate && b.price >= PREMIUM_BOOST) continue
      shelves[tierOf(b.price)].push(b)
    }
    const avail = BOOST_TIERS.filter(t => shelves[t].length > 0)
    if (avail.length === 0) break
    let tier: BoostTier
    if (slot === 0 && spring && shelves.rack.length > 0) {
      tier = 'rack'   // the spring slot — reducer.ts stock()
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

/**
 * THE MARQUEE RAMP (FIELD-CEILING.md §6) — stars on by default, exactly as
 * shopcheck models them, because EVENT_YIELDS is quoted from this harness and
 * the schedule screen prints it: star cheques eat late yields, so a yields
 * number measured star-blind overstates what a late event pays. STARS=0 for
 * the pre-stars counterfactual; K/RAMP/BETA/CAP override the shipped dials.
 */
const STARS_ON = process.env.STARS !== '0'
const STAR_K = Number(process.env.K ?? STAR_COUNT)
const DIALS: StarDials = {
  ramp: Number(process.env.RAMP ?? STAR_RAMP_END),
  beta: Number(process.env.BETA ?? STAR_BAND_BETA),
  cap: Number(process.env.CAP ?? STAR_BAND_CAP),
}
function withStars(
  field: FieldPlayer[], seed: number, evNum: number, recent: readonly number[],
): FieldPlayer[] {
  if (!STARS_ON) return field
  const trailing = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 0
  return overlayStars(field, starNamesFor(seed, STAR_K), starTarget(evNum, trailing, DIALS))
}

/** the sponsor's contract terms, read from content so this cannot drift */
const SPONSOR = WEEK['sponsor']!.effect as
  { kind: 'sponsor'; amount: number; focusCost: number; events: number }

/**
 * One season: shopcheck's shopping season (major-cut drops modeled, gross
 * Money List) threaded through this file's playHole, executing a Plan.
 * Skipped weeks mirror reducer.ts takeWeek exactly: no cut, no cheque, no
 * shop visit afterwards, effect applied, the event number spent.
 */
function season(seed: number, policy: Policy, plan: Plan): SeasonOut {
  const ctx: Ctx = {
    bank: seedBank(seed), deck: [...STARTING_DECK], discard: [],
    focus: 5, freeSinks: 0, penalty: 0,
  }
  const kit: Boost[] = []
  let banked = 0
  let earned = 0
  let bought = 0
  let practice = 1
  let prevPlayed = false
  let lessonRefused = false
  const running: number[] = []
  const rota = scheduleFor(seed)
  // the offer stream's own dice — same salt-8 family as the game's shop
  let shopRng = makeRng(hash(seed, 8))
  // trailing pace for the stars' band — last 3 made-cut rels, as GameState keeps
  const recent: number[] = []

  // sponsor contracts, mirroring reducer.ts: one entry per focus point owed,
  // the value being events remaining; every completed event — played or sat
  // out — burns one, and the tax is the count of live entries
  const contracts: number[] = []
  const tick = () => {
    for (let i = contracts.length - 1; i >= 0; i--) {
      contracts[i]! -= 1
      if (contracts[i]! <= 0) contracts.splice(i, 1)
    }
  }

  for (const ev of SEASON) {
    if (plan.penaltyFrom === ev.num) contracts.push(SPONSOR.events)
    if (plan.practiceFrom?.event === ev.num) practice *= plan.practiceFrom.tighten

    let weekId = plan.weeks?.[ev.num]

    // The shop after LAST week's event — the offer-stream shopper (budget
    // SHOP_BUDGET, weighted tiers; drops arrive on top). No shop opens
    // after a week off (reducer: stock() only follows a payout), and a
    // player planning this week's lesson keeps the wallet shut for the fee.
    if (SHOP && ev.num > 1 && prevPlayed && weekId !== 'lesson') {
      const gate = ev.num - 1 <= EARLY_SHOP_UNTIL
      const spring = ev.num - 1 <= SPRING_RACK_UNTIL
      const [offers, r] = drawOffers(kit, gate, spring, shopRng)
      shopRng = r
      if (bought < SHOP_BUDGET) {
        const pick = offers
          .filter(b => b.price <= banked)
          .sort((a, b) => b.price - a.price)[0]
        if (pick) { banked -= pick.price; kit.push(pick); bought += 1 }
      }
    }

    // takeWeek refuses a lesson the wallet cannot pay — the player tees off
    if (weekId === 'lesson' && banked < LESSON_FEE) {
      lessonRefused = true
      weekId = undefined
    }

    if (weekId) {
      const w = WEEK[weekId]!
      // this week's event concludes without you — running contracts burn an
      // event BEFORE a newly signed one lands at its full length (reducer.ts)
      tick()
      switch (w.effect.kind) {
        case 'practice':
          // the fee is wallet-only: earnings→spent, gross unchanged
          if (weekId === 'lesson') banked -= LESSON_FEE
          practice *= w.effect.tighten
          break
        case 'cash':
          banked += w.effect.amount; earned += w.effect.amount
          break
        case 'sponsor':
          banked += w.effect.amount; earned += w.effect.amount
          for (let i = 0; i < w.effect.focusCost; i++) contracts.push(w.effect.events)
          break
        case 'cut':
          for (const pile of [ctx.deck, ctx.discard]) {
            const i = pile.indexOf(VICTIM)
            if (i >= 0) { pile.splice(i, 1); break }
          }
          break
      }
      running.push(earned)
      prevPlayed = false
      continue
    }

    const course = COURSES[rota[ev.num - 1]!]
    let boosts: Boost[] = [
      // the season's curve, tightened by every range week and lesson taken
      { id: '_s', name: '', icon: '', blurb: '', price: 0, spreadScale: ev.sharpness * practice },
      ...kit,
    ]
    // the sponsor tax active this event — contracts live for the whole event
    ctx.penalty = contracts.length
    // reducer startEvent: MAX_FOCUS + bonuses − focusPenalty, floored at 1
    ctx.focus = Math.max(1, maxFocus(5, boosts) - ctx.penalty)
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
      // THE DROP: surviving a major's cut hands you a premium boost, free —
      // mirror of reducer.ts offerBoosts, best of three by price
      if (ev.major) {
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
          ctx.freeSinks += pick.freeSinks ?? 0
          ctx.focus += pick.maxFocusBonus ?? 0
          boosts = [
            { id: '_s', name: '', icon: '', blurb: '', price: 0, spreadScale: ev.sharpness * practice },
            ...kit,
          ]
        }
      }
      // sponsor money for the made cut (Boost.cutBonus) — gross, like the game
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
      recent.push(rel8)   // the band chases REAL played pace, as GameState does
      if (recent.length > 3) recent.shift()
      // THE FULL SCORECARD settle (FIELD-SPREAD.md §8) at EXT>0, exactly as
      // reducer.ts pays it; EXT=0 keeps this instrument's pre-spread lineage
      let cheque: number
      if (EXT > 0) {
        const pars = course.holes.map(h => h.par)
        const to = pars.length + EXT
        const f = extendField(field, pars, seed, ev.num, course.fieldShift, to)
        const rel = extendPlayerRel(rel8, pars.length, pars, seed, ev.num, course.fieldShift, to)
        const rows = standings(f, rel, to, false)
        const place = yourPlace(rows)
        cheque = tiePayout(ev.purse, place, rows.filter(r => r.place === place).length)
      } else {
        cheque = payout(ev.purse, yourPlace(standings(field, rel8, 8, false)))
      }
      banked += cheque
      earned += cheque
    }
    // the event is over — reducer.ts settle: every contract burns one event
    tick()
    running.push(earned)
    prevPlayed = true
  }
  return { earned, running, lessonRefused }
}

/* ------------------------------------------------------------------ */

const N = Number(process.env.N ?? 250)
const POLICY = (process.env.POLICY ?? 'mixed') as Policy
const SEED0 = Number(process.env.SEED0 ?? 800_000)
/** THE FULL SCORECARD: extension holes beyond the real 8 (0 = pre-spread). */
const EXT = Number(process.env.EXT ?? FULL_HOLES - 8)
const SHOP = process.env.SHOP !== '0'
const VICTIM = process.env.VICTIM ?? 'smooth'
const CHECK_IDX = MONEY_CHECKS.map(c => c.after - 1)

interface Row {
  readonly bySeed: readonly number[]   // final gross, one per seed (paired across rows)
  readonly gross: number               // mean final gross
  readonly surv: number                // fraction passing all three Money List checks
  readonly refused: number             // fraction of seasons where a planned lesson was unaffordable
  readonly perEvent: readonly number[]
}

function measure(plan: Plan): Row {
  let surv = 0, refused = 0
  const bySeed: number[] = []
  const perEvent = SEASON.map(() => 0)
  for (let i = 0; i < N; i++) {
    const s = season(SEED0 + i, POLICY, plan)
    bySeed.push(s.earned)
    if (CHECK_IDX.every((e, k) => s.running[e]! >= MONEY_CHECKS[k]!.need)) surv += 1
    if (s.lessonRefused) refused += 1
    SEASON.forEach((_, e) => {
      perEvent[e]! += s.running[e]! - (e > 0 ? s.running[e - 1]! : 0)
    })
  }
  return {
    bySeed,
    gross: bySeed.reduce((a, b) => a + b, 0) / N,
    surv: surv / N, refused: refused / N,
    perEvent: perEvent.map(v => v / N),
  }
}

/** Paired-by-seed delta vs the baseline: mean and its standard error. */
function delta(row: Row, ref: Row): { d: number; se: number } {
  const ds = row.bySeed.map((v, i) => v - ref.bySeed[i]!)
  const d = ds.reduce((a, b) => a + b, 0) / N
  const varr = ds.reduce((a, b) => a + (b - d) * (b - d), 0) / Math.max(1, N - 1)
  return { d, se: Math.sqrt(varr / N) }
}

const dm = (n: number) => (n < 0 ? '-' : '+') + money(Math.round(Math.abs(n)))
const pp = (n: number) => (n < 0 ? '-' : '+') + Math.abs(Math.round(n * 100)) + 'pp'

console.log(`\nIS A WEEK OFF EVER WORTH AN EVENT?  ${N} seasons per row · ${POLICY} play` +
  ` · ${SHOP ? 'shopper' : 'non-shopper'} · seeds ${SEED0}+` +
  ` · stars ${STARS_ON ? `${STAR_K} @R${DIALS.ramp} β${DIALS.beta} cap${DIALS.cap}` : 'OFF'}` +
  ` · EXT ${EXT}`)

/* ------------------------------------------------------------------ *
 * 1 · OPPORTUNITY COST — what an average played event yields at each
 * stage. This is the sticker price of ANY week option: sit out event
 * N and this is the number you refuse (a major also forfeits its free
 * premium drop, which only the skip rows below can price).
 * ------------------------------------------------------------------ */
const base = measure({})
console.log(`  baseline: gross ${money(Math.round(base.gross))},` +
  ` survival ${(base.surv * 100).toFixed(0)}% across the three checks\n`)
console.log('  WHAT A PLAYED EVENT YIELDS (mean gross added, baseline seasons)')
for (const ev of SEASON) {
  const stage = ev.num <= 5 ? 'early' : ev.num <= 9 ? 'mid  ' : 'late '
  console.log(`    ${String(ev.num).padStart(2)} ${stage} ${(ev.major ? 'MAJOR' : '     ')}` +
    ` ${money(Math.round(base.perEvent[ev.num - 1]!)).padStart(9)}` +
    `${ev.major ? '  (+ the free premium drop, not in this column)' : ''}`)
}
const avg = (a: number, b: number) => base.perEvent.slice(a, b).reduce((x, y) => x + y, 0) / (b - a)
console.log(`    stage means: early(1-5) ${money(Math.round(avg(0, 5)))}` +
  ` · mid(6-9) ${money(Math.round(avg(5, 9)))} · late(10-14) ${money(Math.round(avg(9, 14)))}`)
console.log('    that is what a week COSTS; every option below has to beat it.\n')

// YIELDS=1 stops here: section 1 is all weeks.ts EVENT_YIELDS/STAGE_YIELD
// quote, and re-measuring it at N=1000 should not drag the full 21-row
// option-timing matrix along (CALIBRATION-2.md, work-order item 5).
if (process.env.YIELDS === '1') process.exit(0)

/* ------------------------------------------------------------------ *
 * 2 · EACH OPTION AT EACH TIMING vs never. Early sits before check 1
 * ($2.3M after 5), mid between checks 1 and 2, late after check 3 has
 * already passed — so a late week can no longer kill you, only cost
 * money. The extra row prices skipping THE major (event 7, $20M purse
 * plus the drop), because the schedule screen happily offers it.
 * ------------------------------------------------------------------ */
const TIMINGS: readonly (readonly [string, number])[] = [['early', 2], ['mid', 8], ['late', 13]]

/**
 * Mirrors reducer.ts offerWeek since the weeks redesign: nothing is offered
 * at a major or from WEEKS_END_AT on. Rows past those gates are still
 * measured — they price the door the redesign closed — but the instrument
 * says the card is off the menu rather than pretending it is for sale.
 */
const offerable = (evNum: number) =>
  !SEASON[evNum - 1]!.major && evNum < WEEKS_END_AT

console.log('  EACH WEEK OPTION, TAKEN ONCE, vs NEVER  (Δ paired by seed, ±1 s.e.)')
console.log('  [OFF MENU] = not offerable in-game since the redesign; measured as a counterfactual')
console.log('  option                      timing        gross Δ    ±s.e.   survival Δ')
console.log('  ' + '-'.repeat(72))
const results = new Map<string, { t: string; ev: number; d: number; se: number; ds: number }[]>()
for (const w of WEEKS) {
  const rows: { t: string; ev: number; d: number; se: number; ds: number }[] = []
  for (const [t, ev] of TIMINGS) {
    const r = measure({ weeks: { [ev]: w.id } })
    const { d, se } = delta(r, base)
    const ds = r.surv - base.surv
    rows.push({ t, ev, d, se, ds })
    const note = (w.id === 'lesson' && r.refused > 0
      ? `  (unaffordable, played instead, in ${Math.round(r.refused * 100)}%)` : '')
      + (offerable(ev) ? '' : '  [OFF MENU]')
    console.log(`  ${w.name.padEnd(26)} ${`${t} (ev ${ev})`.padEnd(12)}` +
      ` ${dm(d).padStart(9)} ${money(Math.round(se)).padStart(8)} ${pp(ds).padStart(11)}${note}`)
  }
  results.set(w.id, rows)
}
{
  const r = measure({ weeks: { 7: 'range' } })
  const { d, se } = delta(r, base)
  console.log(`  ${'(any option) at THE major'.padEnd(26)} ${'major (ev 7)'.padEnd(12)}` +
    ` ${dm(d).padStart(9)} ${money(Math.round(se)).padStart(8)} ${pp(r.surv - base.surv).padStart(11)}` +
    '  [OFF MENU] (range shown; the forfeit dominates)')
}
console.log()

/* ------------------------------------------------------------------ *
 * 3 · THE EFFECT ALONE — the same dial turned WITHOUT skipping the
 * event. (effect value) − (event forfeited) ≈ the option's delta, and
 * the decomposition is the design space: it prices "sell the lesson
 * without the week" and "how heavy is the sponsor's tax, really".
 * ------------------------------------------------------------------ */
console.log('  THE EFFECT ALONE (no event skipped — the designer\'s counterfactual)')
console.log(`  (the sponsor tax is now the SHIPPED contract: -1 focus for ${SPONSOR.events} events)`)
for (const [label, plan] of [
  ['lesson tighten ×0.90 from ev 2 ', { practiceFrom: { event: 2, tighten: 0.90 } }],
  ['lesson tighten ×0.90 from ev 8 ', { practiceFrom: { event: 8, tighten: 0.90 } }],
  ['range tighten ×0.94 from ev 2  ', { practiceFrom: { event: 2, tighten: 0.94 } }],
  ['sponsor -1, 3 events, from ev 2', { penaltyFrom: 2 }],
  ['sponsor -1, 3 events, from ev 8', { penaltyFrom: 8 }],
] as const satisfies readonly (readonly [string, Plan])[]) {
  const r = measure(plan)
  const { d, se } = delta(r, base)
  console.log(`    ${label} ${dm(d).padStart(9)} ±${money(Math.round(se))}` +
    `  survival ${pp(r.surv - base.surv)}`)
}
console.log()

/* ------------------------------------------------------------------ *
 * CONCLUSIONS — the argument this file exists to settle, in numbers.
 * A row only earns GOOD DEAL or TRAP when it clears twice its own
 * paired standard error; anything inside that is reported as a wash.
 * ------------------------------------------------------------------ */
console.log('  CONCLUSIONS')
console.log('  ' + '='.repeat(62))
for (const w of WEEKS) {
  const rows = results.get(w.id)!
  const best = rows.reduce((a, b) => (b.d > a.d ? b : a))
  const verdict =
    best.d > 2 * best.se ? `GOOD DEAL (${best.t})`
      : best.d > -2 * best.se ? 'NICHE — a wash at its best timing'
        : 'TRAP — clearly negative at every timing'
  const survNote = Math.min(...rows.map(r => r.ds)) < -0.02
    ? ` · costs survival (worst ${pp(Math.min(...rows.map(r => r.ds)))})` : ''
  console.log(`  ${w.name}`)
  console.log(`    ${verdict} · best ${dm(best.d)}±${money(Math.round(best.se))} at ${best.t},` +
    ` range [${dm(Math.min(...rows.map(r => r.d)))} .. ${dm(best.d)}]${survNote}`)
}
console.log(`\n  Every option pays its way only if its best row beats +$0` +
  ` — the event\n  forfeited is already inside these deltas. The stage means above` +
  `\n  (early ${money(Math.round(avg(0, 5)))} · mid ${money(Math.round(avg(5, 9)))}` +
  ` · late ${money(Math.round(avg(9, 14)))}) are the bar the effects failed or cleared.\n`)
