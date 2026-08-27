/**
 * Is a card offer a prize or a mine — and what should the shop charge for it?
 *
 * shopcheck prices the equipment; nothing priced the cards, and the first
 * measurement found out why that mattered: the pool was selling +$2.3M cards
 * and −$2.6M cards at the same flat $120k. This tool settles three arguments:
 *
 *   1. WHAT IS EACH CARD WORTH ADDED — the dilution question. Most tighteners
 *      and short-game dupes measure NEGATIVE added to the starting deck; the
 *      reach cards measure strongly positive. This is the run that culled
 *      Fully Committed (−$2.64M), Pre-Shot Routine, and the Smooth It and
 *      Short Iron dupes from REWARD_POOL.
 *   2. WHAT IS EACH CARD WORTH SWAPPED — the live question under BAG_CAP,
 *      because buying a card now forces one out. Swap value ≈ add value plus
 *      the cut value of the victim, and the sign flips on exactly the cards
 *      that looked like traps (Knockdown: −$92k added, +$1.16M swapped).
 *      CARD_PRICES in content/shop.ts is this column over two.
 *   3. WHAT IS A BOOST WORTH, with the full modern rulebook. shopcheck's
 *      playHole predates gimmeFeet, redrawDiscount and cutBonus, so boosts
 *      built on those axes undercount there; this playHole carries them all.
 *
 * Run: npx tsx src/tools/rewardcheck.ts
 *   N=250            seasons per row (default 250)
 *   POLICY=mixed     safe | mixed | aggressive
 *   SECTION=all      all | cuts | cards | boosts
 *   BOOSTS=new       new (added 25 Aug 2026) | all
 *   CARDS=id,id      limit the cards section to these ids (parallel runs)
 *   VICTIM=smooth    swap victim, when the cut sweep is skipped
 *   SEED0=600000     first seed — offset it for an independent verification run
 */
import { COURSES } from '../content/courses'
import { scheduleFor } from '../sim/schedule'
import { HAND_SIZE, PUNCH_OUT, REDRAW_COST, REWARD_POOL, STARTING_DECK, CARD } from '../content/cards'
import { SEASON, payout, money } from '../content/season'
import { BOOSTS } from '../content/boosts'
import { buildCone, gimmeRange, maxFocus, focusRegen } from '../sim/effects'
import { chooseShot, type Policy } from './policy'
import { resolveShot, dropPoint } from '../sim/resolve/shot'
import { resolvePutting, sinkCost, baseputts } from '../sim/resolve/putt'
import { makeField, advanceField, rankCut, standings, yourPlace } from '../sim/resolve/field'
import { surfaceAt, toPin } from '../sim/geometry'
import { seedBank, type RngBank } from '../sim/rng'
import { draw } from '../sim/deck'
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

/** Prize money across a season: this deck, this kit, all fourteen events. */
function seasonEarnings(
  seed: number, policy: Policy, kit: readonly Boost[], startDeck: readonly string[],
): number {
  const ctx: Ctx = { bank: seedBank(seed), deck: [...startDeck], discard: [], focus: 5, freeSinks: 0 }
  const cutBonus = kit.reduce((n, b) => n + (b.cutBonus ?? 0), 0)
  let earned = 0
  // the real rotation for this seed — the same pool draw the game makes
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
    earned += payout(ev.purse, yourPlace(standings(field, rel, 8, false)))
  }
  return earned
}

const N = Number(process.env.N ?? 250)
const POLICY = (process.env.POLICY ?? 'mixed') as Policy
const SECTION = process.env.SECTION ?? 'all'
const SEED0 = Number(process.env.SEED0 ?? 600_000)
const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length
const run = (deck: readonly string[], kit: readonly Boost[] = []) =>
  mean(Array.from({ length: N }, (_, i) => seasonEarnings(SEED0 + i, POLICY, kit, deck)))
const name = (id: string) => CARD[id]?.name ?? id

const base = run(STARTING_DECK)
console.log(`\nWHAT IS A CARD WORTH?  ${N} seasons per row · ${POLICY} play · seeds ${SEED0}+`)
console.log(`  bare season earns ${money(Math.round(base))}`)
console.log(`  (read anything inside about ±$200k as noise)\n`)

/* ------------------------------------------------------------------ *
 * CUTS — what each starting card is worth GONE. The best cut is the
 * victim the swap column measures against, because under BAG_CAP a
 * purchase is a swap and a rational swap displaces the worst passenger.
 * ------------------------------------------------------------------ */
let victim = process.env.VICTIM ?? 'smooth'
if (SECTION === 'all' || SECTION === 'cuts' || SECTION === 'cards') {
  const uniq = [...new Set(STARTING_DECK)]
  const rows = uniq.map(id => {
    const deck = [...STARTING_DECK]
    deck.splice(deck.indexOf(id), 1)
    return { id, gain: run(deck) - base }
  }).sort((a, b) => b.gain - a.gain)
  console.log('  CUT ONE STARTING CARD (season value of its absence)')
  for (const r of rows) {
    console.log(`    cut ${name(r.id).padEnd(26)} ${money(Math.round(r.gain)).padStart(10)}`)
  }
  if (!process.env.VICTIM) victim = rows[0]!.id
  console.log(`    → best victim for the swap column: ${name(victim)}\n`)
}

/* ------------------------------------------------------------------ *
 * CARDS — added (the dilution question) and swapped in for the best
 * victim (the live question). Suggested price = swap value over two,
 * the same rule the boosts use; that is what CARD_PRICES holds.
 * ------------------------------------------------------------------ */
if (SECTION === 'all' || SECTION === 'cards') {
  const only = process.env.CARDS?.split(',')
  const pool = only ? REWARD_POOL.filter(id => only.includes(id)) : REWARD_POOL
  console.log('  THE REWARD POOL · added vs swapped-for-' + name(victim))
  console.log('  card                          added        swapped    price it')
  console.log('  ' + '-'.repeat(64))
  const rows = pool.map(id => {
    const added = run([...STARTING_DECK, id]) - base
    const deck = [...STARTING_DECK]
    deck.splice(deck.indexOf(victim), 1)
    deck.push(id)
    const swapped = run(deck) - base
    return { id, added, swapped }
  }).sort((a, b) => b.swapped - a.swapped)
  for (const r of rows) {
    const price = Math.max(60_000, Math.round(r.swapped / 2 / 50_000) * 50_000)
    console.log(
      `  ${name(r.id).padEnd(26)} ${money(Math.round(r.added)).padStart(10)}` +
      ` ${money(Math.round(r.swapped)).padStart(10)}   ${money(price).padStart(8)}`,
    )
  }
  console.log('\n  A card whose SWAP column is not clearly positive is a mine —')
  console.log('  it does not belong in REWARD_POOL at any sticker.\n')
}

/* ------------------------------------------------------------------ *
 * BOOSTS — same method as shopcheck, but through THIS playHole, which
 * carries the full modern rulebook (gimmeFeet, redrawDiscount,
 * cutBonus, momentumSlack). Default: the boosts added 25 Aug 2026.
 * ------------------------------------------------------------------ */
if (SECTION === 'all' || SECTION === 'boosts') {
  const NEW = new Set(['stiffshafts', 'leather', 'shortmemory', 'pontoon', 'organized'])
  const which = process.env.BOOSTS ?? 'new'
  const pool = which === 'all' ? BOOSTS
    : which === 'new' ? BOOSTS.filter(b => NEW.has(b.id))
      : BOOSTS.filter(b => which.split(',').includes(b.id))
  console.log(`  BOOSTS through the modern rulebook (${pool.length} of ${BOOSTS.length})`)
  console.log('  boost                              price     season +      ×price   verdict')
  console.log('  ' + '-'.repeat(78))
  const rows = pool.map(b => {
    const gain = run(STARTING_DECK, [b]) - base
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
}
