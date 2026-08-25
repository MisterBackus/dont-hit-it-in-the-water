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
  | { readonly kind: 'sponsor'; readonly amount: number; readonly focusCost: number }

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
    cost: 'One less focus, every hole, for the rest of the season.',
    effect: { kind: 'sponsor', amount: 300_000, focusCost: 1 },
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
