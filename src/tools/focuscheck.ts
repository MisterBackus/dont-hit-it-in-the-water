/**
 * IS FOCUS THE CORRECT PURCHASE EVERY TIME?
 *
 * PLAYTEST-NOTES-1 note 12, and the one instrument the shelf did not have.
 * shopcheck and rewardcheck both price an item IN ISOLATION — one boost, an
 * otherwise empty bag, a whole season, what did it earn — and that is exactly
 * the measurement that produced every sticker in content/shop.ts. It is also
 * exactly the measurement that CANNOT answer note 12, because the question is
 * not "what is this worth" but "what is this worth GIVEN WHAT IS ALREADY IN
 * THE BAG", and the answer to the second question is the only thing that makes
 * a six-purchase allowance a choice rather than a countdown.
 *
 * So: marginal value, on two currencies the price table does not read.
 *
 *   SURVIVAL — the share of seasons that clear all three MONEY_CHECKS. This
 *   is the currency the player is actually spending in; a boost that adds
 *   $2M to a season that was already going to clear every bar has added
 *   nothing to the only number that ends runs.
 *
 *   LATE WIN RATE — win% across events 10-14, the weekends the marquee ramp
 *   contests. The other half of "did this purchase matter".
 *
 * Measured by GREEDY MARGINAL BUILD: rank every SKU by its delta on an empty
 * bag (slot 1), take the winner, re-rank all survivors on top of it (slot 2),
 * and so on to slot 6 — the live season allowance (shop.ts SHOP_BUDGET). Then
 * run the same build again with every focus SKU banned, which prices the lane
 * as a lane rather than as ten separate items.
 *
 * WHAT WOULD MAKE THE ALLOWANCE A FORMALITY: focus items holding the top of
 * the ranking at slot 1 AND at slot 6. What would make it a real choice: the
 * lane saturating, so the sixth purchase is bought somewhere else.
 *
 * INSTRUMENT NOTES, so the numbers are read honestly.
 *  - The kit is CARRIED ALL SEASON and costs nothing, which is the same
 *    convention every price in the shop was measured under (shopcheck's
 *    seasonEarnings). The purchase's real cost is the slot, and the slot is
 *    what the greedy build prices.
 *  - Drops OFF and shopping OFF. A free major-cut boost would contaminate the
 *    kit under test; the point here is a kit held fixed.
 *  - Same seeds for every kit at every slot, so every delta is PAIRED. The
 *    noise on a difference is far below the noise on either rate.
 *  - Everything else is the shipped world: stars in the field, 36-hole weeks
 *    with the full tie split, the real pool rotation, live prices and checks.
 *    playHole and settleWeek are shopcheck's, mirrored, unchanged.
 *
 * NOTHING IN HERE WRITES. No price, no threshold, no dial. This tool exists to
 * answer a question the owner asked to be answered before anybody touches P1.
 *
 * Run: npx tsx src/tools/focuscheck.ts
 *   N=250          seasons per kit (paired seeds)
 *   POLICY=mixed   safe | mixed | aggressive
 *   SLOTS=6        how deep to build (the live allowance is 6)
 *   SECTION=all    all | build | nofocus | lane | mix (any other value: none)
 *   SEED0=600000   first seed
 *   FULL=1,6       which slots print their FULL ranking (default 1 and SLOTS)
 *   KITS=a+b;c+d   price hand-written bags (section F, runs on any SECTION)
 *
 * The full run is ~40 minutes; the sections are independent, so the way this
 * was actually measured was three of them in parallel and `SECTION=mix` after.
 */
import { COURSES } from '../content/courses'
import { scheduleFor } from '../sim/schedule'
import { HAND_SIZE, PUNCH_OUT, REDRAW_COST, STARTING_DECK, CARD } from '../content/cards'
import { SEASON, MONEY_CHECKS, tiePayout, payout, money } from '../content/season'
import { BOOSTS } from '../content/boosts'
import { SHOP_BUDGET } from '../content/shop'
import { ENCOUNTER_BOOSTS } from '../content/encounters'
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
import { seedBank, type RngBank } from '../sim/rng'
import { draw } from '../sim/deck'
import type { Boost, HoleSpec, Point, Surface } from '../sim/types'

/* ------------------------------------------------------------------ *
 * WHAT COUNTS AS A FOCUS ITEM — read off the DATA, never off the name.
 *
 * Focus is the only resource that buys three things (DESIGN.md P1): the
 * accuracy on every technique, the birdie on every green, and the redraw.
 * A SKU is in the lane if it touches the size of the well, the rate it
 * refills, or the price of anything focus buys.
 * ------------------------------------------------------------------ */
export function touchesFocus(b: Boost): boolean {
  return b.maxFocusBonus !== undefined      // the size of the well
    || b.focusRegenBonus !== undefined      // the rate it refills
    || b.momentumSlack !== undefined        // the CONDITION on refilling
    || b.sinkDiscount !== undefined         // the price of a birdie
    || b.freeSinks !== undefined            // birdies for nothing
    || b.gimmeFeet !== undefined            // birdies that stop being purchases
    || b.redrawDiscount !== undefined       // the price of card selection
}

interface Ctx { bank: RngBank; deck: string[]; discard: string[]; focus: number; freeSinks: number }

/** shopcheck's playHole, mirrored — the modern rulebook, every axis carried. */
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

/** THE FULL SCORECARD — shopcheck's EXT, same default (a 36-hole week). */
const EXT = Number(process.env.EXT ?? FULL_HOLES - 8)

/** The cheque and place for a made cut, exactly as reducer.ts settle pays it. */
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

/** THE MARQUEE RAMP — shopcheck's dials, unchanged. */
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

interface SeasonOut {
  /** cumulative GROSS earnings after each event — what the Money List reads */
  readonly running: number[]
  /** finishing place per event, 0 for a missed cut */
  readonly places: number[]
}

/**
 * One season carrying a FIXED kit all year. No shop, no drops — the kit under
 * test is the kit, start to finish, so the delta belongs to the kit.
 */
function fixedKitSeason(seed: number, policy: Policy, kit: readonly Boost[]): SeasonOut {
  const ctx: Ctx = { bank: seedBank(seed), deck: [...STARTING_DECK], discard: [], focus: 5, freeSinks: 0 }
  const cutBonus = kit.reduce((n, b) => n + (b.cutBonus ?? 0), 0)
  let earned = 0
  const running: number[] = []
  const places: number[] = []
  const recent: number[] = []
  const rota = scheduleFor(seed)

  for (const ev of SEASON) {
    const course = COURSES[rota[ev.num - 1]!]
    const boosts: Boost[] = [
      { id: '_s', name: '', icon: '', blurb: '', price: 0, tier: 'rack' as const, spreadScale: ev.sharpness },
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
    if (!cut.made) { running.push(earned); places.push(0); continue }
    earned += cutBonus
    field = cut.field
    course.holes.slice(4).forEach(hole => {
      holes.push(playHole(hole, ctx, boosts, policy))
      const [f2, r2] = advanceField(field, hole.par, ctx.bank.field, course.fieldShift)
      field = f2; ctx.bank = { ...ctx.bank, field: r2 }
    })
    const rel = holes.reduce((a, b) => a + b, 0) - course.par
    recent.push(rel)
    if (recent.length > 3) recent.shift()
    const settled = settleWeek(field, rel, seed, ev.num, ev.purse,
      course.holes.map(h => h.par), course.fieldShift)
    earned += settled.cheque
    running.push(earned)
    places.push(settled.place)
  }
  return { running, places }
}

const N = Number(process.env.N ?? 250)
const POLICY = (process.env.POLICY ?? 'mixed') as Policy
const SEED0 = Number(process.env.SEED0 ?? 600_000)
const SLOTS = Number(process.env.SLOTS ?? SHOP_BUDGET)
const SECTION = process.env.SECTION ?? 'all'
const IDX = MONEY_CHECKS.map(c => c.after - 1)
const FULL_AT = new Set((process.env.FULL ?? `1,${SLOTS}`).split(',').map(Number))

interface Metrics {
  /** % of seasons clearing ALL THREE Money List checks — the headline */
  readonly survival: number
  /**
   * MEAN CHECKS CLEARED, 0-3, sequential (a season that fails check 1 is
   * over and scores 0). The same question as survival with three times the
   * resolution, and the reason it is here is a measured one: a FIXED
   * one-item kit clears all three checks in 0-4% of seasons, so at slot 1
   * the survival column cannot tell twenty SKUs apart. This can, it is
   * monotone in the same thing, and it is what the greedy build ranks on.
   */
  readonly checkpoints: number
  /** % of ALL seasons that reach past each check */
  readonly cleared: number[]
  /** win% across events 10-14, of weekends actually played */
  readonly lateWin: number
  /** how many late weekends that rate is computed from */
  readonly lateN: number
  /** median season gross */
  readonly median: number
}

/** Every kit is measured on the SAME seeds — deltas are paired. */
function measure(kit: readonly Boost[]): Metrics {
  const seasons = Array.from({ length: N }, (_, i) => fixedKitSeason(SEED0 + i, POLICY, kit))
  let alive = seasons
  const cleared: number[] = []
  let points = 0
  MONEY_CHECKS.forEach((c, k) => {
    alive = alive.filter(s => s.running[IDX[k]!]! >= c.need)
    cleared.push(alive.length / N * 100)
    points += alive.length
  })
  const late = seasons.flatMap(s => s.places.slice(9, 14)).filter(p => p > 0)
  const totals = seasons.map(s => s.running[s.running.length - 1]!).sort((a, b) => a - b)
  return {
    survival: alive.length / N * 100,
    checkpoints: points / N,
    cleared,
    lateWin: late.length ? late.filter(p => p === 1).length / late.length * 100 : NaN,
    lateN: late.length,
    median: totals[Math.floor(totals.length / 2)]!,
  }
}

/** the sellable shelf — `found` never reaches one, and encounter SKUs are not sold */
const SHELF = BOOSTS.filter(b => b.tier !== 'found' && !ENCOUNTER_BOOSTS.has(b.id))
const FOCUS = SHELF.filter(touchesFocus)
const OTHER = SHELF.filter(b => !touchesFocus(b))

const tag = (b: Boost) => (touchesFocus(b) ? '◆' : ' ')
const pct = (n: number) => (Number.isFinite(n) ? n.toFixed(1) : '--').padStart(5)
const dpct = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(1)
/** money() is unsigned — a marginal number is signed by nature. */
const dmoney = (n: number) => (n < 0 ? '-' : '+') + money(Math.abs(Math.round(n)))

console.log(`\nDOES A FOCUS ITEM STAY THE CORRECT PURCHASE? · ${N} paired seasons per kit` +
  ` · ${POLICY} play · seeds ${SEED0}+ · EXT ${EXT} · stars ${STARS_ON ? STAR_K : 'OFF'}`)
console.log(`  shelf ${SHELF.length} SKUs · focus lane ${FOCUS.length} (${FOCUS.map(b => b.id).join(' ')})`)
console.log(`  the other lane ${OTHER.length} (${OTHER.map(b => b.id).join(' ')})`)
console.log(`  checks ${MONEY_CHECKS.map(c => money(c.need)).join(' / ')}` +
  ` after events ${MONEY_CHECKS.map(c => c.after).join('/')}\n`)

/**
 * THE GREEDY MARGINAL BUILD. At each slot, every unowned SKU is measured ON
 * TOP OF what the build already holds, and the best SURVIVAL delta is taken.
 * That is the strongest possible focus-first argument: if focus items are the
 * correct purchase every time, a greedy survival optimiser takes nothing else.
 */
function line(m: Metrics, label: string): string {
  return `${label}  ckpt ${m.checkpoints.toFixed(2)}/3` +
    `  cleared ${m.cleared.map(c => `${c.toFixed(0)}%`.padStart(4)).join('')}` +
    `  survive ${pct(m.survival)}%  late win ${pct(m.lateWin)}%  median ${money(m.median)}`
}

function build(pool: readonly Boost[], label: string, printFull: boolean): Boost[] {
  const bare = measure([])
  console.log(`  ${label}`)
  console.log('    ' + line(bare, 'bag empty                    '))
  const kit: Boost[] = []
  let prev = bare
  for (let slot = 1; slot <= SLOTS; slot++) {
    const rows = pool
      .filter(b => !kit.some(k => k.id === b.id))
      .map(b => ({ b, m: measure([...kit, b]) }))
      // ranked on CHECKPOINTS (see Metrics) — survival alone has no
      // resolution at the shallow slots. Ties go to the richer season.
      .sort((a, c) => (c.m.checkpoints - a.m.checkpoints) || (c.m.median - a.m.median))
    const show = printFull && FULL_AT.has(slot) ? rows : rows.slice(0, 5)
    console.log(`\n    SLOT ${slot} — on top of [${kit.map(k => k.id).join(' + ') || 'nothing'}]` +
      `   base ckpt ${prev.checkpoints.toFixed(2)}  survive ${prev.survival.toFixed(1)}%`)
    console.log('      item                              price    Δckpt   Δsurv    Δlate   Δmedian')
    console.log('      ' + '-'.repeat(76))
    for (const r of show) {
      console.log(
        `      ${tag(r.b)}${r.b.name.slice(0, 31).padEnd(32)} ${money(r.b.price).padStart(7)} ` +
        `${(r.m.checkpoints - prev.checkpoints >= 0 ? '+' : '') +
          (r.m.checkpoints - prev.checkpoints).toFixed(3)}  ` +
        `${dpct(r.m.survival - prev.survival).padStart(6)}  ` +
        `${dpct(r.m.lateWin - prev.lateWin).padStart(6)}  ` +
        `${dmoney(r.m.median - prev.median).padStart(9)}`,
      )
    }
    if (!printFull || !FULL_AT.has(slot)) console.log(`      ... ${rows.length - show.length} more`)
    const pick = rows[0]!
    kit.push(pick.b)
    prev = pick.m
    const focusN = kit.filter(touchesFocus).length
    console.log(`      TAKE ${tag(pick.b)}${pick.b.name} → kit is ${focusN}/${kit.length} focus`)
    console.log('      ' + line(prev, 'kit now                      '))
  }
  console.log(`\n    FINAL KIT: ${kit.map(k => `${tag(k)}${k.id}`).join(' ')}`)
  console.log('    ' + line(prev, '                             '))
  console.log(`    focus share of the allowance: ${kit.filter(touchesFocus).length}/${SLOTS}\n`)
  return kit
}

if (SECTION === 'all' || SECTION === 'build') {
  build(SHELF, 'A. THE OPEN BUILD — every SKU eligible at every slot', true)
}

if (SECTION === 'all' || SECTION === 'nofocus') {
  build(OTHER, 'B. THE BANNED-LANE BUILD — no focus SKU may be bought at all', true)
}

/**
 * THE LANE CURVE. The build above answers "what does a greedy optimiser
 * take"; this answers the narrower thing note 12 actually asks — what is the
 * SECOND focus item worth once you own the first, and the third once you own
 * two. Focus items are stacked in their own slot-1 survival order and the
 * curve is printed against the same stack of non-focus items, so the two
 * lanes are compared as lanes rather than as items.
 */
if (SECTION === 'all' || SECTION === 'lane') {
  console.log('  C. THE LANE CURVE — what the Nth item in a lane is worth')
  const bare = measure([])
  const rank = (pool: readonly Boost[]) => pool
    .map(b => ({ b, m: measure([b]) }))
    .sort((a, c) => (c.m.checkpoints - a.m.checkpoints) || (c.m.median - a.m.median))
    .map(r => r.b)
  const lanes: [string, Boost[]][] = [
    ['focus only  ◆', rank(FOCUS)],
    ['no focus     ', rank(OTHER)],
  ]
  for (const [name, order] of lanes) {
    const kit: Boost[] = []
    let prev = bare
    const dck: string[] = []
    const ckpt: string[] = []
    const surv: string[] = []
    const win: string[] = []
    for (let i = 0; i < SLOTS && i < order.length; i++) {
      kit.push(order[i]!)
      const m = measure(kit)
      dck.push(((m.checkpoints - prev.checkpoints >= 0 ? '+' : '') +
        (m.checkpoints - prev.checkpoints).toFixed(3)).padStart(6))
      ckpt.push(m.checkpoints.toFixed(2).padStart(6))
      surv.push(m.survival.toFixed(1).padStart(6))
      win.push(m.lateWin.toFixed(1).padStart(6))
      prev = m
    }
    console.log(`    ${name}  order: ${order.slice(0, SLOTS).map(b => b.id).join(' → ')}`)
    console.log(`      ckpt      ${ckpt.join(' ')}`)
    console.log(`      MARGINAL  ${dck.join(' ')}`)
    console.log(`      survive   ${surv.join(' ')}`)
    console.log(`      late win  ${win.join(' ')}`)
  }
  console.log()

  /**
   * THE STRUCTURAL ZERO, stated as a measurement: gimmeRange takes the MAX,
   * so The Circle of Friendship cannot add a foot to a bag that holds Inside
   * the Leather. If this row is not ~0, the instrument is lying.
   */
  const leather = SHELF.find(b => b.id === 'leather')
  const circle = SHELF.find(b => b.id === 'circle')
  if (leather && circle) {
    const a = measure([leather])
    const b = measure([leather, circle])
    console.log('  D. THE INSTRUMENT CHECKS ITSELF')
    console.log(`    Circle of Friendship on top of Inside the Leather:` +
      ` ${(b.checkpoints - a.checkpoints).toFixed(3)} ckpt,` +
      ` ${dpct(b.survival - a.survival)} survival, ${dmoney(b.median - a.median)} median`)
    console.log('    (gimmeRange takes the MAX — this must read ~0)\n')
  }
}

/* ------------------------------------------------------------------ *
 * E. THE COMPOSITION SWEEP — the note's question, asked directly.
 *
 * The greedy build answers "what would an optimiser take"; the lane curve
 * answers "what is the Nth item in a lane worth". Neither of them prices the
 * thing the owner actually asked about, which is THE SHAPE OF A FULL
 * ALLOWANCE. So: hold the allowance at its live size (SHOP_BUDGET) and vary
 * only how many of those slots go to the focus lane, 0 through 6.
 *
 * Both lanes are filled in the SAME order — each lane's own slot-1 ranking,
 * best first — so the only thing changing across the rows is composition.
 * This is a fixed-order sweep, not a greedy: it is not looking for the best
 * kit, it is looking for the shape of the curve. A curve that rises to 6/6
 * says the allowance is a formality. A curve with an interior peak says it
 * is a decision, and says where the decision is.
 * ------------------------------------------------------------------ */
if (SECTION === 'all' || SECTION === 'mix') {
  console.log('  E. THE COMPOSITION SWEEP — six purchases, f of them in the focus lane')
  const rank = (pool: readonly Boost[]) => pool
    .map(b => ({ b, m: measure([b]) }))
    .sort((a, c) => (c.m.checkpoints - a.m.checkpoints) || (c.m.median - a.m.median))
    .map(r => r.b)
  const f = rank(FOCUS)
  const o = rank(OTHER)
  console.log(`    focus order   ${f.map(b => b.id).join(' → ')}`)
  console.log(`    other order   ${o.map(b => b.id).join(' → ')}\n`)
  console.log('      focus/6   kit                                    ckpt  survive  late win   of n   median')
  console.log('      ' + '-'.repeat(92))
  for (let k = 0; k <= SLOTS; k++) {
    const kit = [...f.slice(0, k), ...o.slice(0, SLOTS - k)]
    const m = measure(kit)
    console.log(
      `        ${k}/${SLOTS}     ${kit.map(b => b.id).join(' ').slice(0, 38).padEnd(39)}` +
      `${m.checkpoints.toFixed(2)}  ${pct(m.survival)}%   ${pct(m.lateWin)}%  ${String(m.lateN).padStart(5)}` +
      `  ${money(m.median)}`,
    )
  }
  console.log('\n    ("of n" is the late weekends the win rate is computed from — the' +
    ' denominator, so a thin difference can be seen for what it is)\n')
}

/* ------------------------------------------------------------------ *
 * F. NAMED KITS — price a hand-written bag.
 *
 * The sweep above fills each lane in its own slot-1 order, which is a fair
 * rule but not always a flattering one: it reaches for the fourth-best focus
 * SKU before it reaches for the sixth, even where the greedy build says the
 * sixth is stronger in company. This section exists so that objection can be
 * answered with a measurement instead of an argument.
 *
 *   KITS="marlene+leather+goldenputter+grips+superball+tees;superball+tees"
 * ------------------------------------------------------------------ */
if (process.env.KITS) {
  console.log('  F. NAMED KITS')
  console.log('      focus/n  kit                                          ckpt  survive  late win   median')
  console.log('      ' + '-'.repeat(92))
  for (const spec of process.env.KITS.split(';').filter(Boolean)) {
    const ids = spec.split('+').filter(Boolean)
    const kit = ids.map(id => SHELF.find(b => b.id === id))
    const missing = ids.filter((_, i) => !kit[i])
    if (missing.length) { console.log(`      ! unknown SKU: ${missing.join(' ')}`); continue }
    const k = kit as Boost[]
    const m = measure(k)
    console.log(
      `        ${k.filter(touchesFocus).length}/${k.length}    ${spec.slice(0, 44).padEnd(45)}` +
      `${m.checkpoints.toFixed(2)}  ${pct(m.survival)}%   ${pct(m.lateWin)}%  ${money(m.median)}`,
    )
  }
  console.log()
}
