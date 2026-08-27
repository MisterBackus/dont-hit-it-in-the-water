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
  /** plays its fairway numbers from rough, deep rough and trees (not sand) */
  readonly ignoreLie?: boolean
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
  /**
   * DEPTH IN THE PICTURE (DEPTH-DECISION.md). Resolution rolls the carried
   * distance in carry ± CARRY_JITTER; these four numbers put that doubt in
   * the drawn shape instead of hiding it in the dice.
   *
   * Pitch band [pitchNear, pitchFar]: every depth the ball can PITCH at —
   * the band water and OB read. Rounded outward so the band always contains
   * the roll (P8: the ball never arrives outside the shape shown).
   */
  readonly pitchNear: number
  readonly pitchFar: number
  /**
   * Run-out tail [restNear, restFar]: the pitch band displaced by the shot's
   * roll — the band the crust, the green and the collar read. Equal to the
   * pitch band when the shot has no roll (no tail is drawn).
   */
  readonly restNear: number
  readonly restFar: number
}

/**
 * A BOOST is equipment or superstition: always active, never in the deck.
 * See content/boosts.ts for why this is a separate axis from cards.
 */
/** the three shelves a shop can draw from, in order of how often it does */
export type ShopTier = 'rack' | 'special' | 'tour'
/**
 * Every tier an item can wear. `found` is the fourth and it never reaches a
 * shelf: some things are not for sale (content/encounters.ts).
 */
export type BoostTier = ShopTier | 'found'

export interface Boost {
  readonly id: string
  readonly name: string
  /** the old single glyph — the fallback when a mark is missing (ui/ItemMark) */
  readonly icon: string
  /**
   * How hard it is to come by. STORED, never inferred from the price: rarity
   * and price agreeing was a coincidence, and deriving one from the other
   * meant the shop's badge would begin lying the day a price band moved —
   * with three SKUs already sitting over the band's ceiling awaiting a
   * repricing (CALIBRATION-3). Storing it also lets rarity and price
   * disagree on purpose, which the game could not express before.
   */
  readonly tier: BoostTier
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
  /** bunkers play like fairway (the over-90 sand refusal still stands) */
  readonly sandRelief?: boolean
  /** the tap-in band reaches this many feet — a gimme, in the sport's word */
  readonly gimmeFeet?: number
  /** momentum survives this many strokes over par (see focusRegen) */
  readonly momentumSlack?: number
  /** sponsor money, paid into earnings for every cut made */
  readonly cutBonus?: number
  /** focus knocked off the cost of throwing a hand back */
  readonly redrawDiscount?: number
  /** extra yards on the safe-left / safe-right aim */
  readonly aimWiden?: number
  /** what the pro shop asks for it */
  readonly price: number
}
