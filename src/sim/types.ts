/** Core types. Pure — see ARCHITECTURE.md §0. */

/** A point in YARD space. Never pixels. See ARCHITECTURE.md §4.1. */
export interface Point {
  readonly down: number
  readonly side: number
}

export type Surface =
  | 'tee' | 'fairway' | 'rough' | 'deep' | 'bunker' | 'water' | 'trees' | 'green' | 'ob'

export interface LiePenalty {
  readonly carryScale: number
  readonly spreadScale: number
  readonly onlyFrom?: readonly Surface[]
  readonly penaltyStrokes?: number
}

/**
 * Cards are SHOTS, not clubs.
 *
 * A club can only vary on two numbers — how far and how wide — which is not
 * enough design space to build a deckbuilder on. A shot can carry rules: a
 * stinger that runs but can't fly a hazard, a bump-and-run that only works
 * from short grass, a punch that plays from the trees. The distance puzzle
 * survives because every shot still has a number.
 */
export type CardKind = 'shot' | 'technique'

export interface ShotRules {
  /** surfaces this shot can be played from; undefined = anywhere but the green */
  readonly from?: readonly Surface[]
  /** extra yards of run-out after landing */
  readonly roll?: number
  /** cannot carry water or OB — the ball is on the ground too early */
  readonly lowFlight?: boolean
  /** shortens to the pin rather than always flying full (wedges, chips) */
  readonly canCutDown?: boolean
}

export interface ShotCard {
  readonly id: string
  readonly kind: 'shot'
  readonly name: string
  readonly carry: number
  /** HALF-width of the cone in yards. Never shown as a number. */
  readonly spread: number
  readonly blurb: string
  readonly rules: ShotRules
}

export type Effect =
  | { readonly op: 'addCarry'; readonly value: number }
  | { readonly op: 'scaleCarry'; readonly value: number }
  | { readonly op: 'scaleSpread'; readonly value: number }
  | { readonly op: 'ignoreHazards' }
  | { readonly op: 'addRoll'; readonly value: number }

export interface TechniqueCard {
  readonly id: string
  readonly kind: 'technique'
  readonly name: string
  readonly focus: number
  readonly blurb: string
  readonly effects: readonly Effect[]
}

export type Card = ShotCard | TechniqueCard

export interface HazardSpec {
  readonly surface: Surface
  readonly at: Point
  readonly rDown: number
  readonly rSide: number
}

export interface HoleSpec {
  readonly num: number
  readonly par: 3 | 4 | 5
  readonly length: number
  readonly name: string
  readonly corridor: readonly { readonly at: number; readonly half: number }[]
  readonly greenRadius: number
  readonly greenSide: number
  readonly hazards: readonly HazardSpec[]
  readonly note: string
}

export type AimChoice = 'pin' | 'left' | 'right'

export interface ShotPlan {
  readonly shot: ShotCard
  readonly techniques: readonly TechniqueCard[]
  readonly aim: AimChoice
}

export interface Cone {
  readonly carry: number
  readonly spread: number
  readonly aimOffset: number
  readonly roll: number
}

/**
 * A BOOST is equipment or superstition: always active, never in the deck.
 * See content/boosts.ts for why this is a separate axis from cards.
 */
export interface Boost {
  readonly id: string
  readonly name: string
  readonly icon: string
  readonly blurb: string
  /** which shots it touches; undefined = all */
  readonly appliesTo?: 'all' | 'long' | 'short' | 'tee'
  readonly carryScale?: number
  readonly carryAdd?: number
  readonly spreadScale?: number
  readonly killRoll?: boolean
  /** focus knocked off the cost of holing a putt */
  readonly sinkDiscount?: number
  readonly maxFocusBonus?: number
  readonly focusRegenBonus?: number
  /** putts you may hole for nothing each round */
  readonly freeSinks?: number
  /** rough plays like fairway */
  readonly roughRelief?: boolean
  /** extra yards on the safe-left / safe-right aim */
  readonly aimWiden?: number
  /** what the pro shop asks for it */
  readonly price: number
}
