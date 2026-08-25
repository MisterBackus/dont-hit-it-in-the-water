import type { AimChoice, Point, Surface } from './types'
import type { RngBank } from './rng'
import type { FieldPlayer } from './resolve/field'
import type { ShopItem } from '../content/shop'
import { seedBank } from './rng'
import { shuffle } from './deck'
import { PINE_HOLLOW, COURSE_PAR } from '../content/courses/pinehollow'
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
  /** the two alternatives to playing, offered this week */
  readonly weekOptions: readonly string[]
  /**
   * An off-week option that has been clicked but not confirmed.
   *
   * These are the most irreversible buttons in the game — a sponsor costs a
   * focus every hole for the whole rest of the season — and they sat one click
   * away from a mis-aimed cursor, next to the button you press every week.
   * Found in playtest, the hard way.
   */
  readonly pendingWeek: string | null
  /** compounded cone tightening from range weeks and lessons */
  readonly practice: number
  /** focus given up to sponsors, permanently */
  readonly focusPenalty: number
  /** weeks sat out — shown on the schedule so the cost is visible */
  readonly skipped: number
  /** equipment and superstitions — always on, never in the deck */
  readonly boosts: readonly string[]
  /** three boosts on offer after making the cut */
  readonly boostOffer: readonly string[]
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
    weekOptions: [],
    pendingWeek: null,
    practice: 1,
    focusPenalty: 0,
    skipped: 0,
    boosts: [],
    boostOffer: [],
    freeSinks: 0,
    field: [],
    justShuffled: false,
    cutLine: null,
    cutAdvanced: null,
    cutsMade: 0,
    cutsMissed: 0,
    spent: 0,
  }
}

/** Deck composition, for the deck viewer. */
export function deckList(s: GameState): string[] {
  return [...s.deck, ...s.hand, ...s.discard].sort()
}

export const COURSE = PINE_HOLLOW
export const PAR = COURSE_PAR

export function currentHole(s: GameState) {
  // Between events the index can sit past the last hole for a render or two.
  return COURSE[Math.min(s.hole.index, COURSE.length - 1)]!
}
export function currentEvent(s: GameState) { return SEASON[s.event - 1]! }
export function parThrough(n: number): number {
  return COURSE.slice(0, n).reduce((a, h) => a + h.par, 0)
}
export function toPar(s: GameState): number {
  return s.scores.reduce((a, b) => a + b, 0) - parThrough(s.scores.length)
}

/**
 * What the season has actually WON, before shopping. The Money List — the
 * check, the rank, every "earned" the player reads — runs on this. `earnings`
 * alone is the wallet: what the shop can still take.
 */
export function grossEarnings(s: Pick<GameState, 'earnings' | 'spent'>): number {
  return s.earnings + s.spent
}
