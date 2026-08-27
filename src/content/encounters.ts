/**
 * THE ENCOUNTERS — the people who are also at the golf course.
 *
 * Recognition, not absurdity (DESIGN.md P4): everything here has actually
 * happened to someone on a golf course. On roughly one made cut in three at
 * an ordinary event, somebody is waiting on the walk to the fifth tee. They
 * have an offer. You can always walk on — walking on is free, forever, and
 * the season does not notice.
 *
 * Spice, not economy — but spice you can taste. Nothing here saves a season
 * and nothing here ends one; what it does is get REMEMBERED, and a
 * consequence you cannot feel is not a consequence, it is a receipt. The
 * money below is sized against the season's own demand, not written down
 * once and left (ENCOUNTER-STAKES.md, and THE STAKE POINT).
 *
 * Where an offer is a gamble, the odds are SAID (P8 extends to people).
 * All rolls come from the bank's 'events' stream — the schedule, the shots
 * and the deck never feel these people, and a replayed run meets exactly
 * the same ones and loses to them in exactly the same ways.
 *
 * The interpreter is one switch in sim/reducer.ts. Adding an encounter is
 * a data row here, not code there.
 *
 * NO DOLLAR AMOUNT IS WRITTEN IN THIS FILE. That is a rule now, and the
 * reason it is a rule is directly below.
 */
import { MONEY_CHECKS, money } from './season'

/**
 * THE STAKE POINT — one percent of what the season demands of you.
 *
 * This file used to hold four written constants: −$150k, +$150k, +$200k,
 * +$500k. They were the only numbers in the project that were WRITTEN
 * rather than measured, and six economy re-anchorings moved every bar,
 * price, ladder rung and printed yield around them without once touching
 * them. Check 1 travelled $1.4M → $2.1M → $2.6M and check 3 $8.4M →
 * $13.8M while `-150_000` sat in a data row going quietly stale, until it
 * was 1.1% of the season's demand — the price of the cheapest boost on the
 * shelf — and the owner met one live and filed the verdict: "150k is
 * pennies."
 *
 * So encounter money is no longer money. It is POINTS, and a point is one
 * percent of the FINAL Money List check: the single number that says what
 * a whole season must produce to keep your card. When the economy
 * re-anchors, every stake in this file moves with the checks, in the same
 * direction, by the same ratio, for free. This note can never need writing
 * a second time — which is the actual bug fix, the sizes below merely the
 * first values it carries.
 *
 * Anchored to the LAST check rather than the first, on purpose: it is the
 * season's total demand, so it tracks the size of a SEASON rather than the
 * size of a spring, and a stake sized against it does not put its weight
 * on the one place difficulty must never go (the spring rule). And it
 * resolves against the CHECKS, never against the player's wallet — a fine
 * that scales with your bank account punishes success, which is a
 * different and worse design.
 *
 * Derived in tools/encountercheck.ts; ENCOUNTER-STAKES.md carries the
 * registered predictions, the sweep and what shipped.
 */
const SEASON_DEMAND = MONEY_CHECKS[MONEY_CHECKS.length - 1]!.need
/** one point of the season's demand — $138k at the live $13.8M check */
export const STAKE_POINT = Math.round(SEASON_DEMAND / 100 / 1000) * 1000

/**
 * What a stake in points is worth in this economy, today. Pure, total, and
 * the only place in the game where a point becomes a number of dollars.
 */
export function stakeMoney(points: number): number {
  return Math.round(points * STAKE_POINT)
}

/**
 * THE STAKES TABLE — every consequence in this file, in points.
 *
 * Sized by tools/encountercheck.ts against the live calibration (stars on,
 * the offer-stream shopper, current MONEY_CHECKS, 400 seasons a row, seeds
 * 700000+). Two things were measured and both mattered:
 *
 *  - THE SEASON DOES NOT NOTICE, at any size. The people land 2.7 times a
 *    season (a third of 8.6 non-major made cuts) across eight of them, so
 *    the Rules Official shows up 0.40 times a year and his fine actually
 *    lands 0.17 — once every SIX SEASONS. Swept from ×0.25 to ×3 the whole
 *    system never moved mixed survival more than ~1 point. So the fine is
 *    sized for the MOMENT, not for the aggregate, and the currency of a
 *    moment is what a player can spend: at four points the fine is $552k —
 *    3.7× the cheapest boost, more than the median rack sticker ($450k),
 *    0.8 of a spring weekend's yield, 21% of the first Money List check.
 *    It costs you a purchase. That is the smallest sum that can.
 *  - THE SANDBAGGER WAS GIVING MONEY AWAY. Birdie-or-better on the hole
 *    after the cut measures 59.4%; his old $200k-to-win-$500k broke even at
 *    40%, which made "say yes" free money with the odds printed on the
 *    button (P8, embarrassingly). At 3 down to win 5 the break-even is
 *    60.0% against that 59.4% — a golf bet, in which the man with the cash
 *    on him is very slightly right.
 */
const FINE = 4            // the Rules Official, on the 40% branch
const SPONSOR_PHOTO = 2   // the autograph — always this trade, always honest
const BEHIND_THE_UNIT = 3 // whatever he had back there
const SANDBAG_STAKE = 3
const SANDBAG_WIN = 5     // paid on top of a stake already gone: net +2 / −3

/** One resolved consequence. Everything an encounter can do to you. */
export interface Outcome {
  /** the log line — what actually happened, in the voice */
  readonly line: string
  readonly tone: 'good' | 'bad' | 'flat'
  /** focus delta, clamped to [1, maxFocus] in the interpreter */
  readonly focus?: number
  /**
   * money delta, IN POINTS of the season's demand — never in dollars, so a
   * stake here cannot go stale when the economy re-anchors. Gains land in
   * earnings (gross-consistent, like the sponsor week); losses clamp at an
   * empty wallet. reducer.ts applyOutcome is the only interpreter.
   */
  readonly points?: number
  /** an encounter-only superstition (boosts.ts, ENCOUNTER_BOOSTS) */
  readonly grantBoost?: string
}

/** The deferred conditions a bet can ride on — judged at the next holed-out. */
export type BetCondition = 'birdie-or-better' | 'par-or-better' | 'no-double'

export type Engage =
  /** always the same trade, honest both ways */
  | { readonly kind: 'sure'; readonly outcome: Outcome }
  /** rolled from the events stream the moment you say yes. `odds` is the
   * chance of `win`; a pool with more than one outcome rolls again to pick */
  | {
      readonly kind: 'gamble'; readonly odds: number
      readonly win: readonly Outcome[]; readonly lose: readonly Outcome[]
    }
  /** a stake now, a verdict at the next holed-out (GameState.pendingBet).
   * `push` is what happens when the hole answers neither way — no deltas,
   * just the line. One bet at a time; finishHole clears it. */
  | {
      readonly kind: 'bet'; readonly condition: BetCondition
      /** what leaves the wallet now, in points (STAKE_POINT) */
      readonly stakePoints: number
      readonly win: Outcome; readonly lose: Outcome; readonly push?: Outcome
      /** the one-line reminder shown on the next hole */
      readonly reminder: string
    }

/**
 * A bet in flight, carried in GameState until the next holed-out settles it.
 * Self-contained plain data — the save's replay does not have to look the
 * encounter up again to know what was riding.
 */
export interface PendingBet {
  readonly condition: BetCondition
  readonly win: Outcome
  readonly lose: Outcome
  readonly push?: Outcome
  readonly reminder: string
}

export interface Encounter {
  readonly id: string
  readonly name: string
  readonly icon: string
  /** who they are and what they want — read before any button is pressed */
  readonly blurb: string
  /** the engage button */
  readonly accept: string
  /** the stakes, said out loud under the button — odds included where knowable */
  readonly stakes: string
  /** the flavor on the WALK ON button — always safe, always available */
  readonly walk: string
  readonly engage: Engage
  /** only offered when the wallet covers this (the sandbagger's stake) */
  readonly minWallet?: number
}

/** Roughly one made cut in three at a non-major. Majors keep their prize. */
export const ENCOUNTER_CHANCE = 1 / 3

/**
 * Boosts that only an encounter can grant: price 0, never stocked by the
 * shop, never dropped by a major. reducer.ts filters both pools on this set.
 */
export const ENCOUNTER_BOOSTS: ReadonlySet<string> = new Set(['foundtiger'])

export const ENCOUNTERS: readonly Encounter[] = [
  {
    id: 'portapotty', name: 'The Guy Behind the Porta-Potty', icon: '▯',
    blurb: 'He is waving you over, one hand keeping something steady behind the '
      + 'unit. He is not tournament staff. He knows your name, or a name close '
      + 'enough to yours.',
    accept: 'Go and see what he has',
    stakes: 'Fifty-fifty. It has gone both ways for other players.',
    walk: 'You have a weekend to play',
    engage: {
      kind: 'gamble', odds: 0.5,
      win: [
        {
          line: 'A cooler. In this heat. You walk to the fifth tee a new man.',
          tone: 'good', focus: 2,
        },
        {
          line: 'You will never tell anyone what he had back there. '
            + `${money(stakeMoney(BEHIND_THE_UNIT))}.`,
          tone: 'good', points: BEHIND_THE_UNIT,
        },
      ],
      lose: [
        {
          line: 'You looked. You should not have looked.',
          tone: 'bad', focus: -1,
        },
      ],
    },
  },
  {
    id: 'cartgirl', name: 'The Cart Girl', icon: '◇',
    blurb: 'The cart finds you on the walk to the fifth, the way it always '
      + 'finds you. She has yours poured before you finish raising a hand. '
      + 'The tab remembers, even in the years you would rather it did not.',
    accept: 'The usual',
    stakes: 'One focus back. No catch. Not today.',
    walk: 'Wave her through to the group behind',
    engage: {
      kind: 'sure',
      outcome: {
        line: 'The usual. The tab remembers.',
        tone: 'good', focus: 1,
      },
    },
  },
  {
    id: 'sandbagger', name: 'The Sandbagger', icon: '⚂',
    blurb: 'He says he is a twelve. His practice swing says otherwise. He '
      + 'would like to make your next hole interesting, and he has the cash '
      + 'on him, which tells you most of what you need to know.',
    accept: `Take the bet — ${money(stakeMoney(SANDBAG_STAKE))} down`,
    stakes: `Birdie or better on the next hole pays ${money(stakeMoney(SANDBAG_WIN))}. `
      + 'Anything else and the stake is his.',
    walk: 'You have met this man on every course you have ever played',
    minWallet: stakeMoney(SANDBAG_STAKE),
    engage: {
      kind: 'bet', condition: 'birdie-or-better', stakePoints: SANDBAG_STAKE,
      win: {
        line: 'Birdie. He pays like he putts — slowly, and in the end.',
        tone: 'good', points: SANDBAG_WIN,
      },
      lose: {
        line: 'No birdie. He does not gloat. That is the worst part.',
        tone: 'bad',
      },
      reminder: `the bet: birdie or better, ${money(stakeMoney(SANDBAG_WIN))}`,
    },
  },
  {
    id: 'tiger', name: 'The Lost Headcover', icon: '◐',
    blurb: 'A tiger, face down in the rough off the fourth. Somebody loved it '
      + 'enough to bring it here and not enough to notice it gone.',
    accept: 'Keep it',
    stakes: 'A whisker of calm, for the rest of the season. It is not yours.',
    walk: 'Leave it on a rake, where somebody will see it',
    engage: {
      kind: 'sure',
      outcome: {
        line: 'It rides in your bag now. It is going to ride there all season.',
        tone: 'good', grantBoost: 'foundtiger',
      },
    },
  },
  {
    id: 'official', name: 'The Rules Official', icon: '§',
    blurb: 'Your drop on the last one has been referred to the committee. The '
      + 'committee is one man in a windbreaker, and he is walking towards you '
      + 'holding the book open to the page.',
    accept: 'State your case',
    stakes: 'He waves it off more often than not — 60/40 your way. Against '
      + `you it is a ${money(stakeMoney(FINE))} donation to the junior programme.`,
    walk: 'Agree with everything and keep moving',
    engage: {
      kind: 'gamble', odds: 0.6,
      win: [
        {
          line: '"Play on." You feel briefly immortal.',
          tone: 'good', focus: 1,
        },
      ],
      lose: [
        {
          line: `${money(stakeMoney(FINE))} to the junior programme. `
            + 'The juniors send a card.',
          tone: 'bad', points: -FINE,
        },
      ],
    },
  },
  {
    id: 'junior', name: 'The Junior', icon: '❏',
    blurb: 'Nine years old, marshal bib down to his knees, your name in '
      + 'marker on a visor. His mother says he can watch one hole. He has '
      + 'already decided it will be yours.',
    accept: 'Give him a hole worth watching',
    stakes: 'Par or better and the kid sees it: two focus back. Double or '
      + 'worse, he sees that too.',
    walk: 'Pretend not to see the visor',
    engage: {
      kind: 'bet', condition: 'par-or-better', stakePoints: 0,
      win: {
        line: 'The kid saw it. He will describe this hole to somebody in forty years.',
        tone: 'good', focus: 2,
      },
      lose: {
        line: 'The kid saw all of it. His mother covered the visor.',
        tone: 'bad', focus: -1,
      },
      push: {
        line: 'A bogey. The kid has watched his father play. He understands.',
        tone: 'flat',
      },
      reminder: 'the kid is watching: par or better',
    },
  },
  {
    id: 'autograph', name: 'The Autograph Seeker', icon: '✑',
    blurb: 'He has a flag, a photo of you from an event you do not remember '
      + 'playing, and a marker that is nearly dry. The sponsor photographer '
      + 'is, somehow, already here.',
    accept: 'Sign it',
    stakes: `${money(stakeMoney(SPONSOR_PHOTO))} now — the sponsor loves the photo. `
      + 'The stopping costs you a focus. Always this trade, always honest.',
    walk: 'After the round — and this time, mean it',
    engage: {
      kind: 'sure',
      outcome: {
        line: 'Signed. The marker gave out halfway through your surname. The photo runs everywhere.',
        tone: 'flat', points: SPONSOR_PHOTO, focus: -1,
      },
    },
  },
  {
    id: 'greenskeeper', name: 'The Greenskeeper', icon: '⁙',
    blurb: 'He is idling by the fifth tee with the engine off. He cut the '
      + 'pins this morning and he will cut them again tomorrow, and he '
      + 'believes a man who fixes his ball marks ought to know where the '
      + 'soft ones will be.',
    accept: 'Hear him out',
    stakes: 'One focus back. Knowledge is the only free thing on this course.',
    walk: 'Some things a player is better off not knowing',
    engage: {
      kind: 'sure',
      outcome: {
        line: 'Back-left, front-right, and one he is not proud of. You write it in the book.',
        tone: 'good', focus: 1,
      },
    },
  },
]

export const ENCOUNTER: Readonly<Record<string, Encounter>> =
  Object.fromEntries(ENCOUNTERS.map(e => [e.id, e]))
