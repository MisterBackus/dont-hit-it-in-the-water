import { produce, type Draft } from 'immer'
import type { AimChoice, Boost, Cone, HoleSpec, Point, ShotCard, Surface, TechniqueCard } from './types'
import type { GameState } from './state'
import {
  CUT_AFTER_HOLE, MAX_FOCUS, courseOf, currentEvent, currentHole, focusPenaltyOf,
  freshHole, holeCount, initialState, parThrough, trailingPace,
} from './state'
import { EVENT_COUNT, SEASON, checkAfter, payout, tiePayout } from '../content/season'
import { BOOSTS } from '../content/boosts'
import {
  advanceField, makeField, overlayStars, rankCut, standings, starNamesFor,
  starTarget, yourPlace,
} from './resolve/field'
import { BAG_CAP, CARD, HAND_SIZE, freeShot, REDRAW_COST, REWARD_POOL } from '../content/cards'
import {
  BOOST_TIERS, cardPrice, CUT_PRICE, EARLY_SHOP_UNTIL, PREMIUM_BOOST,
  REROLL_PRICE, SPRING_RACK_UNTIL, TIER_WEIGHTS, tierOf,
  type BoostTier, type ShopItem,
} from '../content/shop'
import {
  LESSON_FEE, PRACTICE_BIAS_UNTIL, PRACTICE_WEEK_IDS, WEEK, WEEKS, WEEKS_END_AT,
} from '../content/weeks'
import {
  ENCOUNTER, ENCOUNTERS, ENCOUNTER_BOOSTS, ENCOUNTER_CHANCE, type Outcome,
} from '../content/encounters'
import { next as rollEvents, next as rollShop, type RngState } from './rng'
import { BOOST } from '../content/boosts'
import { buildCone, focusCost, focusRegen, gimmeRange, maxFocus, whyNotPlayable } from './effects'
import { dropPoint, resolveShot } from './resolve/shot'
import { resolvePutting, sinkCost } from './resolve/putt'
import { SURFACE_LABEL, surfaceAt, toPin } from './geometry'
import { draw, shuffle } from './deck'

export type Action =
  | { type: 'START' }
  | { type: 'SELECT_SHOT'; id: string }
  | { type: 'TOGGLE_TECH'; id: string }
  | { type: 'SET_AIM'; aim: AimChoice }
  | { type: 'COMMIT' }
  | { type: 'PUTT'; sink: boolean }
  | { type: 'NEXT' }
  | { type: 'BUY'; index: number }
  | { type: 'BUY_CUT' }
  | { type: 'REROLL' }
  | { type: 'LEAVE_SHOP' }
  | { type: 'REMOVE_CARD'; id: string | null }
  | { type: 'TAKE_BOOST'; id: string }
  | { type: 'ENGAGE' }
  | { type: 'WALK_ON' }
  | { type: 'REDRAW' }
  | { type: 'TEE_OFF' }
  | { type: 'PICK_WEEK'; id: string | null }
  | { type: 'TAKE_WEEK'; id: string }
  | { type: 'RESTART'; seed: number }

export function cardOf(id: string) { return CARD[id]! }
export function shotOf(id: string): ShotCard | null {
  const c = CARD[id]
  return c && c.kind === 'shot' ? c : null
}
export function techOf(id: string): TechniqueCard | null {
  const c = CARD[id]
  return c && c.kind === 'technique' ? c : null
}

/**
 * One free shot is always available — a bad draw is a problem, never a dead
 * end. Which one depends on how far you are from the pin: a punch out is no
 * use from 36 yards, where the best it could do was finish 33 past.
 */
export function handShots(s: GameState): ShotCard[] {
  const drawn = s.hand.map(shotOf).filter((c): c is ShotCard => c !== null)
  const hole = currentHole(s)
  return [...drawn, freeShot(toPin(hole, s.hole.ball))]
}
export function handTechs(s: GameState): TechniqueCard[] {
  return s.hand.map(techOf).filter((c): c is TechniqueCard => c !== null)
}

/**
 * Equipment PLUS the season's sharpness, which is a global cone multiplier that
 * starts at ×1.40 and tightens to ×0.80. You begin the season a worse golfer
 * than you end it — that is the progression axis (DESIGN.md §3.4a).
 */
export function boostsOf(s: GameState) {
  const sharp: Boost = {
    id: '_sharp', name: 'Sharpness', icon: '', blurb: '', price: 0,
    // the season's curve, tightened by every range week and lesson you took
    spreadScale: currentEvent(s).sharpness * s.practice,
  }
  return [sharp, ...s.boosts.map(id => BOOST[id]!).filter(Boolean)]
}

export function previewCone(s: GameState): { cone: Cone; blocked: string | null } | null {
  if (!s.selectedShot || !courseOf(s).holes[s.hole.index]) return null
  const shot = shotOf(s.selectedShot)
  if (!shot) return null
  const techs = s.selectedTechs.map(techOf).filter((t): t is TechniqueCard => t !== null)
  const dist = toPin(currentHole(s), s.hole.ball)
  const { cone } = buildCone(
    { shot, techniques: techs, aim: s.aim }, s.hole.lie, dist, boostsOf(s),
  )
  const blocked = whyNotPlayable(shot, s.hole.lie)
  if (focusCost(techs) > s.focus) return { cone, blocked: 'Not enough focus' }
  return { cone, blocked }
}

export function reduce(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START':      return offerWeek(initialState(state.seed))
    case 'RESTART':    return offerWeek(initialState(action.seed))
    case 'SELECT_SHOT':
      return produce(state, d => {
        d.selectedShot = d.selectedShot === action.id ? null : action.id
      })
    case 'TOGGLE_TECH':
      return produce(state, d => {
        const i = d.selectedTechs.indexOf(action.id)
        if (i >= 0) d.selectedTechs.splice(i, 1)
        else d.selectedTechs.push(action.id)
      })
    case 'SET_AIM':  return produce(state, d => { d.aim = action.aim })
    case 'COMMIT':   return commit(state)
    case 'PUTT':     return putt(state, action.sink)
    case 'NEXT':     return advance(state)
    case 'BUY':        return buy(state, action.index)
    case 'BUY_CUT':    return buyCut(state)
    case 'REROLL':     return reroll(state)
    case 'LEAVE_SHOP': return moneyListOrNext(state)
    case 'REMOVE_CARD': return removeCard(state, action.id)
    case 'TAKE_BOOST': return takeBoost(state, action.id)
    case 'ENGAGE':   return engage(state)
    case 'WALK_ON':  return walkOn(state)
    case 'REDRAW':   return redraw(state)
    case 'TEE_OFF':  return startEvent(state)
    case 'PICK_WEEK':
      return produce(state, d => { d.pendingWeek = action.id })
    case 'TAKE_WEEK': return takeWeek(state, action.id)
  }
}

/**
 * The weekly boost pool, split by tier (SHOP-SUPPLY.md). Encounter-only
 * superstitions are never for sale — you cannot buy somebody else's tiger
 * (content/encounters.ts ENCOUNTER_BOOSTS) — and the opening weeks stay
 * below the premium line: the first Money List check is $2.3M, and a $2.4M
 * sticker at event 2 is a price tag the wallet cannot act on. Under the
 * tiers the gate reads simply: the early truck only carries the rack.
 */
function tierShelves(
  owned: ReadonlySet<string>, taken: ReadonlySet<string>, gate: boolean,
): Record<BoostTier, string[]> {
  const shelves: Record<BoostTier, string[]> = { rack: [], special: [], tour: [] }
  for (const b of BOOSTS) {
    if (owned.has(b.id) || taken.has(b.id) || ENCOUNTER_BOOSTS.has(b.id)) continue
    if (gate && b.price >= PREMIUM_BOOST) continue
    shelves[tierOf(b.price)].push(b.id)
  }
  return shelves
}

/** One weighted tier draw among tiers with stock; null when the shelf is bare. */
function drawTier(
  shelves: Record<BoostTier, string[]>, rng: RngState,
): readonly [BoostTier | null, RngState] {
  const avail = BOOST_TIERS.filter(t => shelves[t].length > 0)
  if (avail.length === 0) return [null, rng]
  const total = avail.reduce((n, t) => n + TIER_WEIGHTS[t], 0)
  const [u, r] = rollShop(rng)
  let x = u * total
  for (const t of avail) {
    x -= TIER_WEIGHTS[t]
    if (x < 0) return [t, r]
  }
  return [avail[avail.length - 1]!, r]
}

/** Uniform pick from a shelf. Callers guarantee it is not empty. */
function pickFrom(shelf: readonly string[], rng: RngState): readonly [string, RngState] {
  const [u, r] = rollShop(rng)
  return [shelf[Math.min(shelf.length - 1, Math.floor(u * shelf.length))]!, r]
}

/**
 * Stock the shop: two pieces of equipment you do not own, two shots.
 * Everything is priced, and every price comes out of the same pot the Money
 * List reads from.
 *
 * SHOP-SUPPLY.md: each boost slot draws a TIER first — off the rack 6,
 * special order 3, tour issue 1, among tiers with unowned stock — then an
 * item uniformly within it. The drawn tier layout is recorded on the state
 * so a reroll can redraw items WITHIN the week's tiers (restockShelf); all
 * shop randomness lives on the bank's own `shop` stream (rng.ts salt 8).
 * Cards are priced one by one, from measurement.
 */
function stock(state: GameState): GameState {
  const owned = new Set(state.boosts)
  const gate = state.event <= EARLY_SHOP_UNTIL
  let rng = state.rng.shop
  const tiers: BoostTier[] = []
  const ids: string[] = []
  for (let slot = 0; slot < 2; slot++) {
    const shelves = tierShelves(owned, new Set(ids), gate)
    // THE SPRING SLOT (content/shop.ts SPRING_RACK_UNTIL): through the
    // first Money List check the first slot always carries the rack —
    // rarity must not tax the spring. Weighted draw everywhere else.
    const spring = slot === 0 && state.event <= SPRING_RACK_UNTIL
      && shelves.rack.length > 0
    const [tier, r1] = spring ? [('rack' as BoostTier), rng] as const : drawTier(shelves, rng)
    rng = r1
    if (tier === null) break
    const [id, r2] = pickFrom(shelves[tier], rng)
    rng = r2
    tiers.push(tier)
    ids.push(id)
  }
  return produce(state, d => {
    const [cs, r] = shuffle(REWARD_POOL, rng)
    d.rng = { ...d.rng, shop: r }
    d.shopTiers = tiers
    d.offer = [
      ...ids.map((id): ShopItem => ({ kind: 'boost', id, price: BOOST[id]!.price })),
      ...cs.slice(0, 2).map((id): ShopItem => ({ kind: 'card', id, price: cardPrice(id) })),
    ]
    d.cutIsPaid = false
    d.phase = 'shop'
  })
}

/**
 * Re-ask what the truck brought: redraw items WITHIN the tiers this week's
 * stock drew (state.shopTiers), never the tiers themselves — at ~13%
 * tour-issue odds per slot, $70k tier-fishing would be a solved slot
 * machine and the rarity would be decoration. The same item can come back
 * (a small tier is a small tier); a tier with nothing left unowned drops
 * its slot. Cards reshuffle fully, as ever.
 */
function restockShelf(state: GameState): GameState {
  const owned = new Set(state.boosts)
  let rng = state.rng.shop
  const tiers: BoostTier[] = []
  const ids: string[] = []
  for (const tier of state.shopTiers) {
    const shelves = tierShelves(owned, new Set(ids), false)
    if (shelves[tier].length === 0) continue
    const [id, r] = pickFrom(shelves[tier], rng)
    rng = r
    tiers.push(tier)
    ids.push(id)
  }
  return produce(state, d => {
    const [cs, r] = shuffle(REWARD_POOL, rng)
    d.rng = { ...d.rng, shop: r }
    d.shopTiers = tiers
    d.offer = [
      ...ids.map((id): ShopItem => ({ kind: 'boost', id, price: BOOST[id]!.price })),
      ...cs.slice(0, 2).map((id): ShopItem => ({ kind: 'card', id, price: cardPrice(id) })),
    ]
    d.phase = 'shop'
  })
}

function buy(state: GameState, index: number): GameState {
  const item = state.offer[index]
  if (!item || item.price > state.earnings) return state
  // THE SEASON ALLOWANCE (SHOP-SUPPLY.md): a boost past the budget is as
  // illegal as one past the wallet. Cards are exempt — they are not the
  // power curve, and the bag cap already makes each one a swap.
  if (item.kind === 'boost' && state.buysLeft <= 0) return state
  return produce(state, d => {
    d.earnings -= item.price
    d.spent += item.price
    d.offer = d.offer.filter((_, i) => i !== index)
    if (item.kind === 'boost') {
      d.buysLeft -= 1
      d.boosts.push(item.id)
      const b = BOOST[item.id]!
      if (b.freeSinks) d.freeSinks += b.freeSinks
      if (b.maxFocusBonus) d.focus += b.maxFocusBonus
      d.log.push({ hole: 0, text: `Bought ${b.name}.`, tone: 'good' })
    } else {
      // straight onto the top of the deck, so you draw it at the next tee
      d.deck.unshift(item.id)
      d.log.push({ hole: 0, text: `Bought ${CARD[item.id]!.name}.`, tone: 'good' })
      // SWAP, NOT ADD: with the bag at cap, buying means displacing — the
      // remove screen opens and refuses to close empty-handed (BAG_CAP).
      if (d.deck.length + d.hand.length + d.discard.length > BAG_CAP) {
        d.mustSwap = true
        d.phase = 'remove'
      }
    }
  })
}

/** Paying to cut a card. Thinning is strong, so it is the priciest thing here. */
function buyCut(state: GameState): GameState {
  if (CUT_PRICE > state.earnings) return state
  return produce(state, d => {
    d.earnings -= CUT_PRICE
    d.spent += CUT_PRICE
    d.cutIsPaid = true
    d.phase = 'remove'
  })
}

function reroll(state: GameState): GameState {
  if (REROLL_PRICE > state.earnings) return state
  const paid = produce(state, d => { d.earnings -= REROLL_PRICE; d.spent += REROLL_PRICE })
  // within the week's drawn tiers — see restockShelf
  return restockShelf(paid)
}

function removeCard(state: GameState, id: string | null): GameState {
  const paidCut = state.cutIsPaid
  const swap = state.mustSwap
  // The bag is full and a card was just bought: refusing is not an option.
  // (Removing the card you just bought IS — that is changing your mind, at
  // the price of having paid for it.)
  if (swap && !id) return state
  const next = produce(state, d => {
    if (id) {
      for (const pile of ['deck', 'hand', 'discard'] as const) {
        const i = d[pile].indexOf(id)
        if (i >= 0) { d[pile].splice(i, 1); break }
      }
      d.log.push({ hole: 0, text: `Cut ${CARD[id]!.name} from the bag.`, tone: 'good' })
    } else if (d.cutIsPaid) {
      d.earnings += CUT_PRICE   // changed your mind, have it back
      d.spent -= CUT_PRICE
    }
    d.cutIsPaid = false
    d.mustSwap = false
  })
  // A paid cut or a forced swap came from the shop — go back to it. A free
  // cut came from a fitting week, and that week is spent: the season moves
  // on without you.
  return paidCut || swap
    ? produce(next, d => { d.phase = 'shop' })
    : weekPassed(next)
}

/** Begin an event: fresh scorecard, fresh focus, same deck and equipment. */
function startEvent(state: GameState): GameState {
  const withReset = produce(state, d => {
    d.scores = []
    d.madeCut = null
    d.focus = Math.max(1,
      MAX_FOCUS + boostsOf(state).reduce((n, b) => n + (b.maxFocusBonus ?? 0), 0)
      - focusPenaltyOf(state))
    d.freeSinks = state.boosts.reduce((n, id) => n + (BOOST[id]!.freeSinks ?? 0), 0)
    d.log = []
    const [field, r] = makeField(d.rng.field, SEASON[d.event - 1]!.fieldStrength)
    // THE MARQUEE RAMP (FIELD-CEILING.md §6): the run's stars take the top
    // skill draws — names only through event 4, real October form later.
    // Overlay after the full draw, so the field stream never feels it.
    d.field = overlayStars(field, starNamesFor(state.seed),
      starTarget(state.event, trailingPace(state)))
    d.rng = { ...d.rng, field: r }
  })
  return dealHole(withReset, 0)
}

/** What a redraw actually costs, after equipment (An Organized Bag). */
export function redrawPrice(s: GameState): number {
  const discount = s.boosts.reduce((n, id) => n + (BOOST[id]!.redrawDiscount ?? 0), 0)
  return Math.max(0, REDRAW_COST - discount)
}

/** Throw the hand back mid-hole and draw six new ones, for focus. */
function redraw(state: GameState): GameState {
  const cost = redrawPrice(state)
  if (state.focus < cost || state.hole.puttFeet !== null) return state
  return produce(state, d => {
    d.focus -= cost
    d.discard.push(...d.hand)
    const res = draw(HAND_SIZE, d.deck, d.discard, d.rng.draw)
    d.hand = res.hand
    d.deck = res.deck
    d.discard = res.discard
    d.rng = { ...d.rng, draw: res.rng }
    d.justShuffled = res.reshuffled
    d.selectedShot = null
    d.selectedTechs = []
    d.lastShot = 'Checked the bag. Six new ones.'
  })
}

/** Deal a fresh hand for a hole. The hand lasts the whole hole. */
function dealHole(state: GameState, index: number): GameState {
  return produce(state, d => {
    d.discard.push(...d.hand)
    const res = draw(HAND_SIZE, d.deck, d.discard, d.rng.draw)
    d.hand = res.hand
    d.deck = res.deck
    d.discard = res.discard
    d.rng = { ...d.rng, draw: res.rng }
    d.justShuffled = res.reshuffled
    d.hole = freshHole(index)
    d.phase = 'playing'
    d.selectedShot = null
    d.selectedTechs = []
    d.aim = 'pin'
    d.lastShot = null
  })
}

/**
 * Put the ball somewhere and keep the lie and the putt distance in step.
 *
 * These MUST move together. When only the lie was set — as happened on the
 * water-penalty path — a drop onto the green left `puttFeet` null: every shot
 * refused with "you are putting" while the putting controls never appeared.
 */
function placeBall(d: Draft<GameState>, hole: HoleSpec, at: Point, lie: Surface): void {
  d.hole.ball = at
  d.hole.lie = lie
  d.hole.puttFeet = lie === 'green'
    ? Math.max(1, Math.round(toPin(hole, at) * 3))
    : null
}

function commit(state: GameState): GameState {
  const pv = previewCone(state)
  if (!pv || pv.blocked) return state
  const hole = currentHole(state)
  const shot = shotOf(state.selectedShot!)!
  const techs = state.selectedTechs.map(techOf).filter((t): t is TechniqueCard => t !== null)

  return produce(state, d => {
    d.focus -= focusCost(techs)
    const { cone, ctx } = buildCone(
      { shot, techniques: techs, aim: d.aim }, d.hole.lie, toPin(hole, d.hole.ball),
      boostsOf(d as unknown as GameState),
    )
    const [out, r] = resolveShot(hole, d.hole.ball, cone, ctx, d.rng.shot)
    d.rng = { ...d.rng, shot: r }
    d.hole.strokes += 1 + out.penalty

    if (out.penalty > 0) {
      // Drop from where it PITCHED. A low runner can enter the water and roll
      // on past the green; dropping from the resting place put the ball on the
      // green with no putt registered, and the hole could not be continued.
      const dp = dropPoint(out.pitch)
      placeBall(d, hole, dp, surfaceAt(hole, dp))
      d.lastShot = out.surface === 'water'
        ? `In the water. One stroke, drop, ${Math.round(toPin(hole, dp))} yards left.`
        : 'Out of bounds. Two strokes.'
      d.log.push({ hole: hole.num, text: d.lastShot, tone: 'bad' })
    } else {
      placeBall(d, hole, out.landing, out.surface)
      const rolled = out.rolled > 2 ? ` (${out.rolled} of run)` : ''
      d.lastShot = out.surface === 'green'
        ? `${out.carried}${rolled} — on the green, ${d.hole.puttFeet} feet.`
        : `${out.carried}${rolled}, ${SURFACE_LABEL[out.surface]}. ${out.toPin} to the pin.`
    }

    // Cards are NOT consumed within a hole — the hand is the set of shots you
    // have TODAY, not ammunition. You do not lose the ability to hit a mid iron
    // by hitting one.
    //
    // Balance proved the alternative unplayable: spending cards as you played
    // them starved a five-card hand into 13.5 Punch Outs per round. The real
    // limiter is already correct and already in the sport — every shot costs a
    // STROKE, and strokes are your score (P2). Scarcity is about which
    // distances you hold, not how many swings you get.
    //
    // The whole hand goes to the discard when the hole ends (see dealHole).

    d.selectedShot = null
    d.selectedTechs = []
    d.aim = 'pin'
    d.phase = 'shot'
    if (d.hole.strokes >= 10) { d.hole.strokes = 10; finishHole(d) }
  })
}

function putt(state: GameState, sink: boolean): GameState {
  if (state.hole.puttFeet === null) return state
  const feet = state.hole.puttFeet
  const cost = sinkPrice(state, feet)
  // a charged Lucky Ball Marker covers the price, so it must also open the
  // gate — a broke player with a free sink in pocket can still hole it
  if (sink && (cost === null || (state.freeSinks <= 0 && cost > state.focus))) return state

  return produce(state, d => {
    if (sink && cost !== null) {
      if (d.freeSinks > 0 && cost > 0) d.freeSinks -= 1
      else d.focus -= cost
    }
    const res = resolvePutting(feet, sink, gimmeRange(boostsOf(state)))
    d.hole.strokes += res.strokes
    d.lastShot = res.text
    finishHole(d)
  })
}

/**
 * What holing this putt costs in FOCUS, after equipment discounts. The Lucky
 * Ball Marker's free sink is deliberately NOT applied here: this function
 * used to zero the price while a free sink was charged, the UI hides the
 * hole-it button at price zero (that rule exists for tap-ins), and putt()
 * then skipped consuming the charge because the price it saw was already
 * zero — three correct-looking pieces composing into a boost no human could
 * ever use. Found by the owner going par-par-par-par into a missed cut the
 * event after buying it. The price is the price; whether the marker PAYS it
 * is putt()'s business, and the UI says "free" when a charge will cover it.
 */
export function sinkPrice(s: GameState, feet: number): number | null {
  const base = sinkCost(feet, gimmeRange(boostsOf(s)))
  if (base === null) return null
  if (base === 0) return 0
  const discount = boostsOf(s).reduce((n, b) => n + (b.sinkDiscount ?? 0), 0)
  return Math.max(1, base - discount)
}

/**
 * The cut is where you earn equipment — and a major's pick comes from the
 * premium shelf (content/shop.ts): the season's biggest earned moment must
 * not offer the discount rack. If the premium shelf is bare it falls back to
 * anything unowned, and if EVERYTHING is owned the pick is skipped entirely
 * rather than presenting an empty offer (which used to be a latent softlock).
 */
function offerBoosts(state: GameState): GameState {
  const owned = new Set(state.boosts)
  // ENCOUNTER_BOOSTS are excluded from a major's drop as from the shop: an
  // encounter-only superstition (price 0) must never ride the `any` fallback.
  const premium = BOOSTS.filter(b =>
    !owned.has(b.id) && !ENCOUNTER_BOOSTS.has(b.id) && b.price >= PREMIUM_BOOST)
  const any = BOOSTS.filter(b => !owned.has(b.id) && !ENCOUNTER_BOOSTS.has(b.id))
  const pool = (premium.length > 0 ? premium : any).map(b => b.id)
  if (pool.length === 0) return dealHole(state, state.scores.length)
  return produce(state, d => {
    const [shuffled, r] = shuffle(pool, d.rng.draw)
    d.rng = { ...d.rng, draw: r }
    d.boostOffer = shuffled.slice(0, 3)
    d.phase = 'boost'
  })
}

function takeBoost(state: GameState, id: string): GameState {
  const next = produce(state, d => {
    d.boosts.push(id)
    d.boostOffer = []
    const b = BOOST[id]!
    if (b.freeSinks) d.freeSinks += b.freeSinks
    if (b.maxFocusBonus) d.focus += b.maxFocusBonus
    d.log.push({ hole: 0, text: `Picked up ${b.name}.`, tone: 'good' })
  })
  return dealHole(next, next.scores.length)
}

/**
 * THE ENCOUNTERS (content/encounters.ts) — decided here, on the walk off the
 * cut, from the bank's own 'events' stream: roughly one made cut in three at
 * a non-major, at most one per event. Majors keep their prize moment. All
 * rolls — whether anyone shows, who, and how a gamble lands — come through
 * the bank, so a replayed run meets the same people with the same luck.
 */
function maybeEncounter(state: GameState): GameState {
  const [show, r1] = rollEvents(state.rng.events)
  const [pick, r2] = rollEvents(r1)
  const spent = produce(state, d => { d.rng = { ...d.rng, events: r2 } })
  const eligible = ENCOUNTERS.filter(e =>
    (e.minWallet ?? 0) <= state.earnings &&
    // no second tiger: an already-granted encounter boost retires its encounter
    !(e.engage.kind === 'sure' && e.engage.outcome.grantBoost !== undefined
      && state.boosts.includes(e.engage.outcome.grantBoost)))
  const chosen = eligible[Math.floor(pick * eligible.length)]
  if (show >= ENCOUNTER_CHANCE || !chosen) {
    return dealHole(spent, spent.scores.length)
  }
  return produce(spent, d => {
    d.encounterOffer = chosen.id
    d.phase = 'encounter'
  })
}

/**
 * THE ONE INTERPRETER. Every encounter consequence — and both ends of a
 * settled bet — comes through here. The vocabulary is deliberately exactly
 * four words: focus (clamped to [1, maxFocus] like everywhere else), money
 * (gains land in earnings, gross-consistent like the sponsor week; losses
 * clamp at an empty wallet), grantBoost (encounter-only superstitions), and
 * the log line that says what happened.
 */
function applyOutcome(d: Draft<GameState>, o: Outcome, hole: number): void {
  if (o.money !== undefined) {
    d.earnings = Math.max(0, d.earnings + o.money)
  }
  if (o.grantBoost !== undefined && !d.boosts.includes(o.grantBoost)) {
    d.boosts.push(o.grantBoost)
  }
  if (o.focus !== undefined) {
    const bs = d.boosts.map(id => BOOST[id]!)
    const cap = Math.max(1, maxFocus(MAX_FOCUS, bs) - focusPenaltyOf(d))
    d.focus = Math.min(cap, Math.max(1, d.focus + o.focus))
  }
  d.log.push({ hole, text: o.line, tone: o.tone })
}

/** Say yes. A gamble rolls now, from the events stream; a bet arms one. */
function engage(state: GameState): GameState {
  const enc = state.encounterOffer !== null ? ENCOUNTER[state.encounterOffer] : undefined
  if (state.phase !== 'encounter' || !enc) return state
  const done = produce(state, d => {
    d.encounterOffer = null
    const e = enc.engage
    switch (e.kind) {
      case 'sure':
        applyOutcome(d, e.outcome, 0)
        // the result gets its moment on the next tee, not a line in a log
        d.lastEncounter = { text: `${enc.name} — ${e.outcome.line}`, tone: e.outcome.tone, holeIndex: d.scores.length }
        break
      case 'gamble': {
        const [r, r1] = rollEvents(d.rng.events)
        const [which, r2] = rollEvents(r1)
        d.rng = { ...d.rng, events: r2 }
        const pool = r < e.odds ? e.win : e.lose
        const o = pool[Math.floor(which * pool.length)]!
        applyOutcome(d, o, 0)
        d.lastEncounter = { text: `${enc.name} — ${o.line}`, tone: o.tone, holeIndex: d.scores.length }
        break
      }
      case 'bet':
        // the stake leaves now; the verdict waits for the next holed-out
        d.earnings = Math.max(0, d.earnings - e.stake)
        d.pendingBet = {
          condition: e.condition, win: e.win, lose: e.lose,
          push: e.push, reminder: e.reminder,
        }
        d.log.push({ hole: 0, text: `${enc.name} — ${e.reminder}.`, tone: 'flat' })
        break
    }
  })
  return dealHole(done, done.scores.length)
}

/** Walk on. Always available, always free, changes nothing but the view. */
function walkOn(state: GameState): GameState {
  if (state.phase !== 'encounter') return state
  const done = produce(state, d => { d.encounterOffer = null })
  return dealHole(done, done.scores.length)
}

/**
 * Settle a pending bet against the hole just finished. Judged on rel
 * (strokes − par): 'birdie-or-better' wins at −1 or better, else loses;
 * 'par-or-better' wins at par or better and loses ONLY at double or worse —
 * a bogey is a push (the junior has seen golf before); 'no-double' wins
 * anywhere short of a double. One bet at a time, cleared no matter what.
 */
function settleBet(draft: Draft<GameState>, rel: number, hole: number): void {
  const bet = draft.pendingBet
  if (!bet) return
  const verdict =
    bet.condition === 'birdie-or-better' ? (rel <= -1 ? 'win' : 'lose')
      : bet.condition === 'par-or-better' ? (rel <= 0 ? 'win' : rel >= 2 ? 'lose' : 'push')
        : (rel < 2 ? 'win' : 'lose')   // no-double
  const outcome = verdict === 'win' ? bet.win : verdict === 'lose' ? bet.lose : bet.push
  if (outcome) {
    applyOutcome(draft, outcome, hole)
    // owner playtest: "after i win the bet with the kid, give me a prompt
    // that he pays up" — the settlement is a headline on the holed screen
    // (the marker prefix is what the UI looks for), not a whisper in a log
    const last = draft.log[draft.log.length - 1]
    if (last) last.text = `The bet settles — ${last.text}`
    draft.lastShot = draft.lastShot ? `${draft.lastShot} ${outcome.line}` : outcome.line
  } else {
    draft.log.push({ hole, text: 'The bet settles — a push. Nobody pays, nobody crows.', tone: 'flat' })
  }
  draft.pendingBet = null
}

function finishHole(draft: Draft<GameState>): void {
  const course = courseOf(draft)
  const hole = course.holes[draft.hole.index]!
  const rel = draft.hole.strokes - hole.par
  draft.scores.push(draft.hole.strokes)
  draft.phase = 'holed'
  // everyone else plays the hole too — and the course moves them as it moves
  // you (fieldShift, SCHEDULE-PLAN.md §3)
  const [field, r] = advanceField(draft.field, hole.par, draft.rng.field, course.fieldShift)
  draft.field = field
  draft.rng = { ...draft.rng, field: r }
  draft.log.push({
    hole: hole.num,
    text: `${scoreName(rel)} — ${draft.hole.strokes} on a par ${hole.par}.`,
    tone: rel < 0 ? 'good' : rel > 0 ? 'bad' : 'flat',
  })
  const bs = draft.boosts.map(id => BOOST[id]!)
  const before = draft.focus
  draft.focus = Math.min(
    Math.max(1, maxFocus(MAX_FOCUS, bs) - focusPenaltyOf(draft)),
    draft.focus + focusRegen(bs, rel),
  )
  // momentum is a rule the player is meant to play around, so it has to be
  // visible the moment it pays — not discovered by staring at the meter
  if (rel <= 0 && draft.focus - before > 1) {
    draft.log.push({ hole: hole.num, text: 'Momentum — focus comes back faster after a good hole.', tone: 'good' })
  }
  // a bet placed on the walk to this tee settles the moment the ball drops —
  // after momentum, so its focus swing clamps against the refilled meter
  settleBet(draft, rel, hole.num)
}

export function scoreName(rel: number): string {
  if (rel <= -3) return 'Albatross'
  if (rel === -2) return 'Eagle'
  if (rel === -1) return 'Birdie'
  if (rel === 0) return 'Par'
  if (rel === 1) return 'Bogey'
  if (rel === 2) return 'Double bogey'
  return `${rel} over`
}

/**
 * An event has concluded — played or sat out, the calendar does not care —
 * so every running sponsor contract burns one of its events. Called from
 * settle (a played event ending, cut made or missed) and from takeWeek (a
 * week sat out, BEFORE the new option's effect lands, so a contract signed
 * this week starts at its full length). Signed at event N, a three-event
 * contract taxes events N+1, N+2 and N+3, and is gone at N+4.
 */
function tickSponsors(d: Draft<GameState>): void {
  d.sponsorContracts = d.sponsorContracts.map(n => n - 1).filter(n => n > 0)
}

/** Settle the event: where you finished, and what it paid. */
function settle(state: GameState, madeCut: boolean): GameState {
  const ev = currentEvent(state)
  return produce(state, d => {
    tickSponsors(d)
    if (!madeCut) {
      d.lastPlace = 0
      d.lastPaid = 0
      // the record still gets its line: stars who played the weekend
      // finished ahead of you; a star cut alongside you is a wash
      d.seasonRecord.push({
        event: ev.num, madeCut: false, place: 0, tied: 1, paid: 0,
        aheadOf: [],
        behind: d.field.filter(p => !p.cut && p.star === true).map(p => p.name),
      })
    } else {
      const rel = d.scores.reduce((a, b) => a + b, 0) - parThrough(d, d.scores.length)
      // the trailing window the marquee band reads — last three made cuts,
      // written here so it is only ever visible to the NEXT event's field
      d.recentCutRels = [...d.recentCutRels, rel].slice(-3)
      const rows = standings(d.field, rel, d.scores.length, false)
      const place = yourPlace(rows)
      // SPLIT AT THE TOP ONLY (season.ts tiePayout, owner ruling 26 Aug
      // 2026): a tie for FIRST pools the covered cheques and divides them —
      // a T1 is still a win, lastPlace is still 1, only the money splits.
      // Every other tied rank keeps the pre-existing rule: the whole group
      // takes the best place's full cheque. The blanket split measured
      // 35% → 17% survival, because everything here ties (see season.ts).
      const tied = rows.filter(r => r.place === place).length
      const paid = place === 1 ? tiePayout(ev.purse, 1, tied) : payout(ev.purse, place)
      d.lastPlace = place
      d.lastPaid = paid
      d.earnings += paid
      // the season's own ledger, for the epilogue: a star out-placed is
      // beaten; one who missed the cut you made is beaten too; a star who
      // out-placed you (they all made this cut — the field's cut flag says
      // so) finished ahead. A dead tie with one counts as neither.
      d.seasonRecord.push({
        event: ev.num, madeCut: true, place, tied, paid,
        aheadOf: [
          ...rows.filter(r => r.star && r.place > place).map(r => r.name),
          ...d.field.filter(p => p.cut && p.star === true).map(p => p.name),
        ],
        behind: rows.filter(r => r.star && r.place < place).map(r => r.name),
      })
      // sponsor money for the made cut (Boost.cutBonus) — paid into the same
      // gross number the Money List reads, like any other winnings
      for (const id of d.boosts) {
        const b = BOOST[id]!
        if (b.cutBonus) {
          d.earnings += b.cutBonus
          d.log.push({ hole: 0, text: `${b.name} pays out for the made cut.`, tone: 'good' })
        }
      }
    }
    d.phase = 'payout'
  })
}

/** The death check, or on to the next week. */
function moneyListOrNext(state: GameState): GameState {
  // The last survival check is after event 12, not 14.
  //
  // A check after the final event is not a checkpoint, it is the verdict on a
  // season already played — and it made the finale a lottery ticket: winning
  // the Tour Championship paid $3.60M against a $3.08M requirement, so
  // thirteen weeks of accumulation could be matched by one Sunday. Ending
  // survival at 12 leaves two weeks that decide how WELL you finish rather
  // than whether you survive, and lets the finale be a trophy.
  if (state.event >= EVENT_COUNT) return produce(state, d => { d.phase = 'over' })
  const check = checkAfter(state.event)
  if (check) {
    return produce(state, d => {
      // The Money List records what you WON, not what is in your wallet — a
      // real money list does not demote you for buying wedges. Spending is an
      // investment decision, never a bet against your own job.
      d.keptJob = d.earnings + d.spent >= check.need
      d.phase = 'moneylist'
    })
  }
  return offerWeek(produce(state, d => { d.event += 1 }))
}

/**
 * Two things you could do instead of teeing it up — where the measurement
 * allows it (WEEKS-VERDICT.md, owner decision C-2):
 *
 *   - A MAJOR offers nothing: every option costs the week, and skipping THE
 *     major measured −$3.59M and −25pp survival. That is a misclick waiting
 *     to happen, not a choice worth selling.
 *   - From WEEKS_END_AT (event 10) the node goes quiet: no current option
 *     avoids skipping the event, and every late skip measured −$1.2M or
 *     worse. A menu of known losses teaches distrust of the whole system.
 *   - Through PRACTICE_BIAS_UNTIL (events 1–4) the first slot is guaranteed
 *     to be a practice option (range / fitting / lesson) — the early window
 *     is where they measured +$720k..+$1.12M WITH survival gains.
 *
 * Same named draw stream as ever: deterministic, replayable.
 */
function offerWeek(state: GameState): GameState {
  const ev = currentEvent(state)
  return produce(state, d => {
    d.pendingWeek = null
    d.phase = 'schedule'
    if (ev.major || ev.num >= WEEKS_END_AT) {
      d.weekOptions = []
      return
    }
    if (ev.num <= PRACTICE_BIAS_UNTIL) {
      const [ps, r1] = shuffle([...PRACTICE_WEEK_IDS], d.rng.draw)
      const first = ps[0]!
      const [rest, r2] = shuffle(WEEKS.map(w => w.id).filter(id => id !== first), r1)
      d.rng = { ...d.rng, draw: r2 }
      d.weekOptions = [first, rest[0]!]
      return
    }
    const [ws, r] = shuffle(WEEKS.map(w => w.id), d.rng.draw)
    d.rng = { ...d.rng, draw: r }
    d.weekOptions = ws.slice(0, 2)
  })
}

/**
 * Sit the week out. You forfeit the prize money and the Money List does not
 * wait for you — that is the whole price, and it is why these have to be good.
 */
function takeWeek(state: GameState, id: string): GameState {
  const w = WEEK[id]
  if (!w || !state.weekOptions.includes(id)) return state
  if (id === 'lesson' && state.earnings < LESSON_FEE) return state

  const next = produce(state, d => {
    d.skipped += 1
    d.weekOptions = []
    d.pendingWeek = null
    // this week's event concludes without you — running contracts burn an
    // event BEFORE a newly signed one lands at its full three
    tickSponsors(d)
    switch (w.effect.kind) {
      case 'practice':
        if (id === 'lesson') { d.earnings -= LESSON_FEE; d.spent += LESSON_FEE }
        d.practice *= w.effect.tighten
        break
      case 'cash':
        d.earnings += w.effect.amount
        break
      case 'sponsor':
        // one contract entry per focus point owed, each `events` events long
        for (let i = 0; i < w.effect.focusCost; i++) {
          d.sponsorContracts.push(w.effect.events)
        }
        d.earnings += w.effect.amount
        break
      case 'cut':
        break
    }
    d.log.push({ hole: 0, text: `${w.name}.`, tone: 'good' })
  })

  // a fitting sends you to the cut screen; everything else just passes the week
  if (w.effect.kind === 'cut') {
    return produce(next, d => { d.cutIsPaid = false; d.phase = 'remove' })
  }
  return weekPassed(next)
}

/** A week has gone by without you playing. */
function weekPassed(state: GameState): GameState {
  return moneyListOrNext(state)
}

function advance(state: GameState): GameState {
  if (state.phase === 'shot') return produce(state, d => { d.phase = 'playing' })

  if (state.phase === 'schedule') return startEvent(produce(state, d => { d.pendingWeek = null }))

  if (state.phase === 'holed') {
    const played = state.scores.length
    // the cut is judged after four holes
    if (played === CUT_AFTER_HOLE) {
      return produce(state, d => {
        const rel = d.scores.reduce((a, b) => a + b, 0) - parThrough(state, CUT_AFTER_HOLE)
        // TOP N AND TIES — a place, not a score. See content/season.ts.
        const res = rankCut(d.field, rel, currentEvent(state).advance)
        d.madeCut = res.made
        if (res.made) d.cutsMade += 1
        else d.cutsMissed += 1
        d.field = res.field
        d.cutLine = res.line
        d.cutAdvanced = res.advanced
        d.phase = 'cut'
      })
    }
    if (played >= holeCount(state)) return settle(state, true)
    return dealHole(state, played)
  }

  if (state.phase === 'cut') {
    if (state.madeCut === false) return settle(state, false)
    // a major hands you equipment for surviving it
    if (currentEvent(state).major) return offerBoosts(state)
    // an ordinary made cut sometimes hands you a person instead
    return maybeEncounter(state)
  }

  if (state.phase === 'payout') {
    // the shop is open whether or not you made the cut — you may have nothing
    // to spend, which is its own kind of pressure
    return stock(state)
  }

  if (state.phase === 'moneylist') {
    if (state.keptJob === false) return produce(state, d => { d.phase = 'over' })
    return offerWeek(produce(state, d => { d.event += 1 }))
  }

  return state
}

