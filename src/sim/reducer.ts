import { produce, type Draft } from 'immer'
import type { AimChoice, Boost, Cone, HoleSpec, Point, ShotCard, Surface, TechniqueCard } from './types'
import type { GameState } from './state'
import {
  COURSE, CUT_AFTER_HOLE, MAX_FOCUS, currentEvent, currentHole, freshHole,
  initialState, parThrough,
} from './state'
import { EVENT_COUNT, SEASON, checkAfter, payout } from '../content/season'
import { BOOSTS } from '../content/boosts'
import { advanceField, makeField, rankCut, standings, yourPlace } from './resolve/field'
import { BAG_CAP, CARD, HAND_SIZE, freeShot, REDRAW_COST, REWARD_POOL } from '../content/cards'
import { CARD_PRICE, CUT_PRICE, REROLL_PRICE, type ShopItem } from '../content/shop'
import { WEEK, WEEKS, LESSON_FEE } from '../content/weeks'
import { BOOST } from '../content/boosts'
import { buildCone, focusCost, focusRegen, maxFocus, whyNotPlayable } from './effects'
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
  if (!s.selectedShot || !COURSE[s.hole.index]) return null
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
    case 'REDRAW':   return redraw(state)
    case 'TEE_OFF':  return startEvent(state)
    case 'PICK_WEEK':
      return produce(state, d => { d.pendingWeek = action.id })
    case 'TAKE_WEEK': return takeWeek(state, action.id)
  }
}

/**
 * Stock the shop: two pieces of equipment you do not own, two shots.
 * Everything is priced, and every price comes out of the same pot the Money
 * List reads from.
 */
function stock(state: GameState): GameState {
  return produce(state, d => {
    const owned = new Set(d.boosts)
    const [bs, r1] = shuffle(BOOSTS.filter(b => !owned.has(b.id)).map(b => b.id), d.rng.draw)
    const [cs, r2] = shuffle(REWARD_POOL, r1)
    d.rng = { ...d.rng, draw: r2 }
    d.offer = [
      ...bs.slice(0, 2).map((id): ShopItem => ({ kind: 'boost', id, price: BOOST[id]!.price })),
      ...cs.slice(0, 2).map((id): ShopItem => ({ kind: 'card', id, price: CARD_PRICE })),
    ]
    d.cutIsPaid = false
    d.phase = 'shop'
  })
}

function buy(state: GameState, index: number): GameState {
  const item = state.offer[index]
  if (!item || item.price > state.earnings) return state
  return produce(state, d => {
    d.earnings -= item.price
    d.spent += item.price
    d.offer = d.offer.filter((_, i) => i !== index)
    if (item.kind === 'boost') {
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
  return stock(paid)
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
      - state.focusPenalty)
    d.freeSinks = state.boosts.reduce((n, id) => n + (BOOST[id]!.freeSinks ?? 0), 0)
    d.log = []
    const [field, r] = makeField(d.rng.field, SEASON[d.event - 1]!.fieldStrength)
    d.field = field
    d.rng = { ...d.rng, field: r }
  })
  return dealHole(withReset, 0)
}

/** Throw the hand back mid-hole and draw six new ones, for focus. */
function redraw(state: GameState): GameState {
  if (state.focus < REDRAW_COST || state.hole.puttFeet !== null) return state
  return produce(state, d => {
    d.focus -= REDRAW_COST
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
  if (sink && (cost === null || cost > state.focus)) return state

  return produce(state, d => {
    if (sink && cost !== null) {
      if (d.freeSinks > 0 && cost > 0) d.freeSinks -= 1
      else d.focus -= cost
    }
    const res = resolvePutting(feet, sink)
    d.hole.strokes += res.strokes
    d.lastShot = res.text
    finishHole(d)
  })
}

/** What holing this putt actually costs, after equipment. */
export function sinkPrice(s: GameState, feet: number): number | null {
  const base = sinkCost(feet)
  if (base === null) return null
  if (base === 0) return 0
  if (s.freeSinks > 0) return 0
  const discount = boostsOf(s).reduce((n, b) => n + (b.sinkDiscount ?? 0), 0)
  return Math.max(1, base - discount)
}

/** The cut is where you earn equipment. */
function offerBoosts(state: GameState): GameState {
  return produce(state, d => {
    const owned = new Set(d.boosts)
    const pool = BOOSTS.filter(b => !owned.has(b.id)).map(b => b.id)
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

function finishHole(draft: Draft<GameState>): void {
  const hole = COURSE[draft.hole.index]!
  const rel = draft.hole.strokes - hole.par
  draft.scores.push(draft.hole.strokes)
  draft.phase = 'holed'
  // everyone else plays the hole too
  const [field, r] = advanceField(draft.field, draft.hole.index, draft.rng.field)
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
    Math.max(1, maxFocus(MAX_FOCUS, bs) - draft.focusPenalty),
    draft.focus + focusRegen(bs, rel),
  )
  // momentum is a rule the player is meant to play around, so it has to be
  // visible the moment it pays — not discovered by staring at the meter
  if (rel <= 0 && draft.focus - before > 1) {
    draft.log.push({ hole: hole.num, text: 'Momentum — focus comes back faster after a good hole.', tone: 'good' })
  }
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

/** Settle the event: where you finished, and what it paid. */
function settle(state: GameState, madeCut: boolean): GameState {
  const ev = currentEvent(state)
  return produce(state, d => {
    if (!madeCut) {
      d.lastPlace = 0
      d.lastPaid = 0
    } else {
      const rel = d.scores.reduce((a, b) => a + b, 0) - parThrough(d.scores.length)
      const place = yourPlace(standings(d.field, rel, d.scores.length, false))
      const paid = payout(ev.purse, place)
      d.lastPlace = place
      d.lastPaid = paid
      d.earnings += paid
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

/** Two things you could do instead of teeing it up. */
function offerWeek(state: GameState): GameState {
  return produce(state, d => {
    const [ws, r] = shuffle(WEEKS.map(w => w.id), d.rng.draw)
    d.rng = { ...d.rng, draw: r }
    d.weekOptions = ws.slice(0, 2)
    d.pendingWeek = null
    d.phase = 'schedule'
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
    switch (w.effect.kind) {
      case 'practice':
        if (id === 'lesson') { d.earnings -= LESSON_FEE; d.spent += LESSON_FEE }
        d.practice *= w.effect.tighten
        break
      case 'cash':
        d.earnings += w.effect.amount
        break
      case 'sponsor':
        d.earnings += w.effect.amount
        d.focusPenalty += w.effect.focusCost
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
        const rel = d.scores.reduce((a, b) => a + b, 0) - parThrough(CUT_AFTER_HOLE)
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
    if (played >= COURSE.length) return settle(state, true)
    return dealHole(state, played)
  }

  if (state.phase === 'cut') {
    if (state.madeCut === false) return settle(state, false)
    // a major hands you equipment for surviving it
    if (currentEvent(state).major) return offerBoosts(state)
    return dealHole(state, state.scores.length)
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

