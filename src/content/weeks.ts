/**
 * THE WEEK — what you do instead of playing.
 *
 * Every week you may enter the tournament or do something else. Skipping costs
 * you a week's prize money while the Money List clock keeps running, which is
 * the entire trade: everything here has to be worth roughly what an event pays,
 * or nobody would ever sit one out.
 *
 * Slay the Spire's map does the same job — a path is only interesting because
 * taking it means not taking the other one.
 */
export type WeekEffect =
  | { readonly kind: 'practice'; readonly tighten: number }
  | { readonly kind: 'cash'; readonly amount: number }
  | { readonly kind: 'cut' }
  /** cash now, −focusCost for the next `events` events — then the contract runs out */
  | { readonly kind: 'sponsor'; readonly amount: number; readonly focusCost: number; readonly events: number }

export interface WeekOption {
  readonly id: string
  readonly name: string
  readonly icon: string
  readonly blurb: string
  /** the honest downside, said out loud */
  readonly cost: string
  readonly effect: WeekEffect
}

export const WEEKS: readonly WeekOption[] = [
  {
    id: 'range', name: 'A week on the range', icon: '⌗',
    blurb: 'Every cone tightens 6% for the rest of the season. It stacks.',
    cost: 'No prize money this week.',
    effect: { kind: 'practice', tighten: 0.94 },
  },
  {
    id: 'exhibition', name: 'Corporate day', icon: '❑',
    blurb: 'Eighteen holes with four men from a paper company. $180k, guaranteed.',
    cost: 'No ranking, no equipment, and you will hear about their swings.',
    effect: { kind: 'cash', amount: 180_000 },
  },
  {
    id: 'fitting', name: 'Get properly fitted', icon: '◫',
    blurb: 'Cut a card from the bag, free. A tighter bag draws better.',
    cost: 'No prize money this week.',
    effect: { kind: 'cut' },
  },
  {
    id: 'sponsor', name: 'Sign with a sponsor', icon: '▤',
    blurb: 'Three hundred thousand, up front, today.',
    cost: 'One less focus, every hole, for your next three events — then the contract runs out.',
    // WEEKS-VERDICT.md option B-1: the permanent −1 measured −$848k..−$2.88M
    // against $300k of cash — a trap by arithmetic. Capped at three events it
    // is a loan: cash now against ~$300-500k of measured earnings.
    effect: { kind: 'sponsor', amount: 300_000, focusCost: 1, events: 3 },
  },
  {
    id: 'lesson', name: 'A lesson with someone good', icon: '✎',
    blurb: 'Cones tighten 10% for the rest of the season.',
    cost: 'Costs $120k as well as the week.',
    effect: { kind: 'practice', tighten: 0.90 },
  },
]

export const WEEK: Readonly<Record<string, WeekOption>> =
  Object.fromEntries(WEEKS.map(w => [w.id, w]))

/** A lesson is the only week option you also pay for. */
export const LESSON_FEE = 120_000

/* ------------------------------------------------------------------ *
 * THE SHAPE OF THE OFFER — set by measurement, not feel.
 *
 * WEEKS-VERDICT.md (weekcheck, 1,000 seasons): the value of every
 * skip-based option is (effect) − (event forfeited), and the forfeit is
 * savagely backloaded — ~$300k at event 2, ~$2M at event 13, −$3.59M
 * and −25pp survival at THE major. So the draw follows the measurement:
 * practice options are guaranteed a slot while they are good deals, and
 * skip-based cards stop being sold once every one of them is a trap.
 * ------------------------------------------------------------------ */

/** The three options that measured as good deals in the early window. */
export const PRACTICE_WEEK_IDS: readonly string[] = ['range', 'fitting', 'lesson']

/** Through this event, the draw guarantees a practice option a slot. */
export const PRACTICE_BIAS_UNTIL = 4

/**
 * From this event on, no skip-based option is offered — which today means
 * no week node at all, since every current option costs the week. From
 * event 10 the cheapest skip measured about −$1.2M; a menu of nothing but
 * known losses teaches distrust, so the node goes quiet instead. If an
 * option that does NOT skip the event ever ships, it belongs here.
 */
export const WEEKS_END_AT = 10

/**
 * What each played event typically ADDS to the season — measured, not the
 * purse: mean gross added per event across 1,000 baseline shopper seasons
 * (weekcheck §1, rounded to $10k). The schedule screen prints this so the
 * price of a withdrawal is visible before it is paid. Re-derive with
 * `npx tsx src/tools/weekcheck.ts` whenever the economy moves.
 *
 * RE-MEASURED at the calibration pass (CALIBRATION-2.md §5, 26 Aug 2026,
 * stars on — the 26 Aug morning numbers were taken before the marquee ramp
 * landed, and the schedule screen was overstating what a late event pays by
 * ~22–26%: the stars now convert the shopper's late wins into 2nd/3rd
 * cheques exactly where wins were the yield). Events 1–4 held within noise —
 * the spring rule, visible in a third instrument. Same harness, N=1000,
 * mixed shopper, seeds 800000+, weekcheck now carrying the same
 * STARS/K/RAMP/BETA/CAP knobs as shopcheck.
 */
export const EVENT_YIELDS: readonly number[] = [
  300_000, 320_000, 360_000, 1_240_000, 710_000,        // events 1–5
  720_000, 2_060_000, 920_000, 900_000,                 // events 6–9
  860_000, 2_250_000, 1_000_000, 950_000, 2_360_000,    // events 10–14
]

/** The same measurement by stage — the late mean is the UI's "by the fall". */
export const STAGE_YIELD: Readonly<Record<'early' | 'mid' | 'late', number>> = {
  early: 590_000, mid: 1_150_000, late: 1_490_000,
}

export function eventStage(num: number): 'early' | 'mid' | 'late' {
  return num <= 5 ? 'early' : num <= 9 ? 'mid' : 'late'
}
