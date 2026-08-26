import type { AimChoice, HoleSpec, Point, Surface } from './types'
import type { RngBank } from './rng'
import type { FieldPlayer } from './resolve/field'
import type { ShopItem } from '../content/shop'
import type { Course } from '../content/courses'
import type { PendingBet } from '../content/encounters'
import { seedBank } from './rng'
import { shuffle } from './deck'
import { courseForEvent } from './schedule'
import { STARTING_DECK } from '../content/cards'
import { SEASON } from '../content/season'

export const MAX_FOCUS = 5
export const CUT_AFTER_HOLE = 4

export interface ShotLogEntry {
  readonly hole: number
  readonly text: string
  readonly tone: 'good' | 'bad' | 'flat'
}

export interface HoleState {
  readonly index: number
  readonly ball: Point
  readonly lie: Surface
  readonly strokes: number
  readonly puttFeet: number | null
}

export type Phase =
  | 'intro'
  | 'schedule'    // the season ahead — next event, what it demands
  | 'playing' | 'shot' | 'holed'
  | 'cut'         // did you survive four holes
  | 'boost'       // equipment, at a major
  | 'encounter'   // somebody on the walk to the fifth tee (content/encounters.ts)
  | 'shop'        // the pro shop — spend your winnings, or bank them
  | 'remove'      // choose which card to cut
  | 'payout'      // where you finished and what it paid
  | 'moneylist'   // the death check
  | 'over'

export interface GameState {
  readonly seed: number
  readonly rng: RngBank
  readonly phase: Phase
  /** 1..14 */
  readonly event: number
  readonly earnings: number
  /** what the last event paid, for the payout screen */
  readonly lastPlace: number
  readonly lastPaid: number
  /** null until a Money List check has been faced */
  readonly keptJob: boolean | null
  readonly focus: number
  readonly hole: HoleState
  readonly scores: readonly number[]
  /** the deck, drawn from the top */
  readonly deck: readonly string[]
  /** what you hold for THIS hole */
  readonly hand: readonly string[]
  readonly discard: readonly string[]
  readonly selectedShot: string | null
  readonly selectedTechs: readonly string[]
  readonly aim: AimChoice
  readonly log: readonly ShotLogEntry[]
  readonly lastShot: string | null
  readonly madeCut: boolean | null
  /** what the pro shop has in this week */
  readonly offer: readonly ShopItem[]
  /** true when a purchase sent you to the cut-a-card screen */
  readonly cutIsPaid: boolean
  /**
   * True when a card was bought with the bag already full (BAG_CAP): the
   * remove screen is showing and REFUSES null — something has to come out.
   * This is the swap-not-add rule that fixed dilution; see ITEMS-PROPOSAL.md.
   */
  readonly mustSwap: boolean
  /** the two alternatives to playing, offered this week */
  readonly weekOptions: readonly string[]
  /**
   * An off-week option that has been clicked but not confirmed.
   *
   * These are the most irreversible buttons in the game — a sponsor costs a
   * focus every hole for your next three events — and they sat one click
   * away from a mis-aimed cursor, next to the button you press every week.
   * Found in playtest, the hard way.
   */
  readonly pendingWeek: string | null
  /** compounded cone tightening from range weeks and lessons */
  readonly practice: number
  /**
   * Sponsor contracts still running — one entry per focus point owed, the
   * value being how many events that contract has left. Signing pushes
   * `effect.events` (currently 3) per focus point; every completed event —
   * played or sat out, the calendar does not care — decrements each entry,
   * and a spent contract disappears. The old field here was a permanent
   * `focusPenalty`, which measured as the game's only arithmetic trap
   * (WEEKS-VERDICT.md option B-1: −$848k..−$2.88M against $300k of cash).
   */
  readonly sponsorContracts: readonly number[]
  /** weeks sat out — shown on the schedule so the cost is visible */
  readonly skipped: number
  /** equipment and superstitions — always on, never in the deck */
  readonly boosts: readonly string[]
  /** three boosts on offer after making the cut */
  readonly boostOffer: readonly string[]
  /** who is waiting on the walk to the fifth tee, when somebody is */
  readonly encounterOffer: string | null
  /** a side bet riding on the next holed-out — one at a time, then cleared */
  readonly pendingBet: PendingBet | null
  /**
   * The last encounter's immediate outcome, shown as a banner on the tee it
   * was dealt onto (owner playtest: a gamble's result must get its moment,
   * not vanish into the log). Keyed by holeIndex so it shows exactly once.
   */
  readonly lastEncounter: { readonly text: string; readonly tone: 'good' | 'bad' | 'flat'; readonly holeIndex: number } | null
  /** free putt-holes remaining this round (Lucky Ball Marker) */
  readonly freeSinks: number
  /** the week's field, advancing hole by hole alongside you */
  readonly field: readonly FieldPlayer[]
  /** true when the discard was just shuffled back in — shown to the player */
  readonly justShuffled: boolean
  /** the score that survived the cut, and how many did — for the cut screen */
  readonly cutLine: number | null
  readonly cutAdvanced: number | null
  /** running season tally, for the post-mortem on the ending screen */
  readonly cutsMade: number
  readonly cutsMissed: number
  readonly spent: number
  /**
   * Final rel (strokes vs par, full event) of the last three MADE cuts,
   * newest last — the trailing pace the marquee ramp's band reads
   * (FIELD-CEILING.md §6, sim/resolve/field.ts starTarget). Lagged by
   * construction: written at settle, read at the NEXT startEvent, so the
   * stars follow form rather than mirror it. A missed cut writes nothing —
   * the band relaxes only as made-cut pace actually cools.
   */
  readonly recentCutRels: readonly number[]
}

export function freshHole(index: number): HoleState {
  return { index, ball: { down: 0, side: 0 }, lie: 'tee', strokes: 0, puttFeet: null }
}

export function initialState(seed: number): GameState {
  const rng = seedBank(seed)
  // SHUFFLE THE STARTING DECK. Without this the deck is dealt in the order the
  // cards were authored — all ten shots first, all six techniques last — so
  // every run opened with the identical six shots and no technique could appear
  // before hole 3. Found in playtest: "i never start with technique in my hand".
  const [deck, drawRng] = shuffle(STARTING_DECK, rng.draw)
  return {
    seed,
    rng: { ...rng, draw: drawRng },
    phase: 'intro',
    event: 1,
    earnings: 0,
    lastPlace: 0,
    lastPaid: 0,
    keptJob: null,
    focus: MAX_FOCUS,
    hole: freshHole(0),
    scores: [],
    deck,
    hand: [],
    discard: [],
    selectedShot: null,
    selectedTechs: [],
    aim: 'pin',
    log: [],
    lastShot: null,
    madeCut: null,
    offer: [],
    cutIsPaid: false,
    mustSwap: false,
    weekOptions: [],
    pendingWeek: null,
    practice: 1,
    sponsorContracts: [],
    skipped: 0,
    boosts: [],
    boostOffer: [],
    encounterOffer: null,
    pendingBet: null,
    lastEncounter: null,
    freeSinks: 0,
    field: [],
    justShuffled: false,
    cutLine: null,
    cutAdvanced: null,
    cutsMade: 0,
    cutsMissed: 0,
    spent: 0,
    recentCutRels: [],
  }
}

/**
 * The trailing pace the marquee band chases: mean rel over the last three
 * made cuts, 0 until one exists. Pure in the state — replay-safe.
 */
export function trailingPace(s: Pick<GameState, 'recentCutRels'>): number {
  const r = s.recentCutRels
  return r.length === 0 ? 0 : r.reduce((a, b) => a + b, 0) / r.length
}

/** The sponsor tax active right now: −1 focus per running contract. */
export function focusPenaltyOf(s: Pick<GameState, 'sponsorContracts'>): number {
  return s.sponsorContracts.length
}

/** Deck composition, for the deck viewer. */
export function deckList(s: GameState): string[] {
  return [...s.deck, ...s.hand, ...s.discard].sort()
}

/**
 * THE COURSE IS A FACT ABOUT THE EVENT (SCHEDULE-PLAN.md §1). Nothing below
 * reads a course constant any more: which holes you are playing, what par is,
 * and how many holes there are all flow from (seed, event) through the
 * schedule. `CUT_AFTER_HOLE` stays a global — the cut is a season rule, not a
 * course rule — and nothing may assume eight holes except via holeCount.
 */
export function courseFor(seed: number, event: number): Course {
  return courseForEvent(seed, event)
}
export function courseOf(s: Pick<GameState, 'seed' | 'event'>): Course {
  return courseForEvent(s.seed, s.event)
}
export function holeCount(s: Pick<GameState, 'seed' | 'event'>): number {
  return courseOf(s).holes.length
}
export function currentHole(s: GameState): HoleSpec {
  // Between events the index can sit past the last hole for a render or two.
  const holes = courseOf(s).holes
  return holes[Math.min(s.hole.index, holes.length - 1)]!
}
export function currentEvent(s: GameState) { return SEASON[s.event - 1]! }
/** Par through the first n holes OF THE COURSE THE EVENT IS PLAYED ON. */
export function parThrough(s: Pick<GameState, 'seed' | 'event'>, n: number): number {
  return courseOf(s).holes.slice(0, n).reduce((a, h) => a + h.par, 0)
}
export function toPar(s: GameState): number {
  return s.scores.reduce((a, b) => a + b, 0) - parThrough(s, s.scores.length)
}

/**
 * What the season has actually WON, before shopping. The Money List — the
 * check, the rank, every "earned" the player reads — runs on this. `earnings`
 * alone is the wallet: what the shop can still take.
 */
export function grossEarnings(s: Pick<GameState, 'earnings' | 'spent'>): number {
  return s.earnings + s.spent
}
