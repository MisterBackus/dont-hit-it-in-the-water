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
 *      so early should beat late; the sponsor's -1 focus is a tax on every
 *      remaining hole, so late should beat early. Measured, not assumed.
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
import { SEASON, MONEY_CHECKS, payout, money } from '../content/season'
import { BOOSTS } from '../content/boosts'
import { PREMIUM_BOOST } from '../content/shop'
import { WEEK, WEEKS, LESSON_FEE } from '../content/weeks'
import { buildCone, gimmeRange, maxFocus, focusRegen } from '../sim/effects'
import { chooseShot, type Policy } from './policy'
import { resolveShot, dropPoint } from '../sim/resolve/shot'
import { resolvePutting, sinkCost, baseputts } from '../sim/resolve/putt'
import { makeField, advanceField, rankCut, standings, yourPlace } from '../sim/resolve/field'
import { surfaceAt, toPin } from '../sim/geometry'
import { seedBank, type RngBank } from '../sim/rng'
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

/** best-affordable-first, one a week — shopcheck's shopper */
const ORDER = [...BOOSTS].sort((a, b) => b.price - a.price)

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

  for (const ev of SEASON) {
    if (plan.penaltyFrom === ev.num) ctx.penalty += 1
    if (plan.practiceFrom?.event === ev.num) practice *= plan.practiceFrom.tighten

    let weekId = plan.weeks?.[ev.num]

    // The shop after LAST week's event — one buy, the best thing affordable
    // (shopcheck's shopper, purchase cap 4; drops arrive on top). No shop
    // opens after a week off (reducer: stock() only follows a payout), and a
    // player planning this week's lesson keeps the wallet shut for the fee.
    if (SHOP && ev.num > 1 && prevPlayed && weekId !== 'lesson') {
      for (const b of ORDER) {
        if (kit.some(k => k.id === b.id)) continue
        if (b.price > banked) continue
        if (bought >= 4) break
        banked -= b.price; kit.push(b); bought += 1; break
      }
    }

    // takeWeek refuses a lesson the wallet cannot pay — the player tees off
    if (weekId === 'lesson' && banked < LESSON_FEE) {
      lessonRefused = true
      weekId = undefined
    }

    if (weekId) {
      const w = WEEK[weekId]!
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
          ctx.penalty += w.effect.focusCost
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
    // reducer startEvent: MAX_FOCUS + bonuses − focusPenalty, floored at 1
    ctx.focus = Math.max(1, maxFocus(5, boosts) - ctx.penalty)
    ctx.freeSinks = kit.reduce((n, b) => n + (b.freeSinks ?? 0), 0)
    let [field, fr] = makeField(ctx.bank.field, ev.fieldStrength)
    ctx.bank = { ...ctx.bank, field: fr }

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
      const cheque = payout(ev.purse,
        yourPlace(standings(field, holes.reduce((a, b) => a + b, 0) - course.par, 8, false)))
      banked += cheque
      earned += cheque
    }
    running.push(earned)
    prevPlayed = true
  }
  return { earned, running, lessonRefused }
}

/* ------------------------------------------------------------------ */

const N = Number(process.env.N ?? 250)
const POLICY = (process.env.POLICY ?? 'mixed') as Policy
const SEED0 = Number(process.env.SEED0 ?? 800_000)
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
  ` · ${SHOP ? 'shopper' : 'non-shopper'} · seeds ${SEED0}+`)

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

/* ------------------------------------------------------------------ *
 * 2 · EACH OPTION AT EACH TIMING vs never. Early sits before check 1
 * ($2.3M after 5), mid between checks 1 and 2, late after check 3 has
 * already passed — so a late week can no longer kill you, only cost
 * money. The extra row prices skipping THE major (event 7, $20M purse
 * plus the drop), because the schedule screen happily offers it.
 * ------------------------------------------------------------------ */
const TIMINGS: readonly (readonly [string, number])[] = [['early', 2], ['mid', 8], ['late', 13]]
console.log('  EACH WEEK OPTION, TAKEN ONCE, vs NEVER  (Δ paired by seed, ±1 s.e.)')
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
    const note = w.id === 'lesson' && r.refused > 0
      ? `  (unaffordable, played instead, in ${Math.round(r.refused * 100)}%)` : ''
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
    '  (range shown; the forfeit dominates)')
}
console.log()

/* ------------------------------------------------------------------ *
 * 3 · THE EFFECT ALONE — the same dial turned WITHOUT skipping the
 * event. (effect value) − (event forfeited) ≈ the option's delta, and
 * the decomposition is the design space: it prices "sell the lesson
 * without the week" and "how heavy is the sponsor's tax, really".
 * ------------------------------------------------------------------ */
console.log('  THE EFFECT ALONE (no event skipped — the designer\'s counterfactual)')
for (const [label, plan] of [
  ['lesson tighten ×0.90 from ev 2 ', { practiceFrom: { event: 2, tighten: 0.90 } }],
  ['lesson tighten ×0.90 from ev 8 ', { practiceFrom: { event: 8, tighten: 0.90 } }],
  ['range tighten ×0.94 from ev 2  ', { practiceFrom: { event: 2, tighten: 0.94 } }],
  ['sponsor -1 focus from ev 2     ', { penaltyFrom: 2 }],
  ['sponsor -1 focus from ev 8     ', { penaltyFrom: 8 }],
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
