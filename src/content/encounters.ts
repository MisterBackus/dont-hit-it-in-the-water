/**
 * THE ENCOUNTERS — the people who are also at the golf course.
 *
 * Recognition, not absurdity (DESIGN.md P4): everything here has actually
 * happened to someone on a golf course. On roughly one made cut in three at
 * an ordinary event, somebody is waiting on the walk to the fifth tee. They
 * have an offer. You can always walk on — walking on is free, forever, and
 * the season does not notice.
 *
 * Spice, not economy: focus swings of one or two, money inside $300k net,
 * against seasons that gross $15–20M. Nothing here saves a season and
 * nothing here ends one. What it does is get remembered.
 *
 * Where an offer is a gamble, the odds are SAID (P8 extends to people).
 * All rolls come from the bank's 'events' stream — the schedule, the shots
 * and the deck never feel these people, and a replayed run meets exactly
 * the same ones and loses to them in exactly the same ways.
 *
 * The interpreter is one switch in sim/reducer.ts. Adding an encounter is
 * a data row here, not code there.
 */

/** One resolved consequence. Everything an encounter can do to you. */
export interface Outcome {
  /** the log line — what actually happened, in the voice */
  readonly line: string
  readonly tone: 'good' | 'bad' | 'flat'
  /** focus delta, clamped to [1, maxFocus] in the interpreter */
  readonly focus?: number
  /** money delta — gains land in earnings (gross-consistent, like the
   * sponsor week); losses clamp at an empty wallet */
  readonly money?: number
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
      readonly stake: number
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
          line: 'You will never tell anyone what he had back there. $200k.',
          tone: 'good', money: 200_000,
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
    accept: 'Take the bet — $200k down',
    stakes: 'Birdie or better on the next hole pays $500k. Anything else and '
      + 'the stake is his.',
    walk: 'You have met this man on every course you have ever played',
    minWallet: 200_000,
    engage: {
      kind: 'bet', condition: 'birdie-or-better', stake: 200_000,
      win: {
        line: 'Birdie. He pays like he putts — slowly, and in the end.',
        tone: 'good', money: 500_000,
      },
      lose: {
        line: 'No birdie. He does not gloat. That is the worst part.',
        tone: 'bad',
      },
      reminder: 'the bet: birdie or better, $500k',
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
        line: 'It rides in your bag now. You check over your shoulder for four holes.',
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
      + 'you it is a $150k donation to the junior programme.',
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
          line: '$150k to the junior programme. The juniors send a card.',
          tone: 'bad', money: -150_000,
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
      kind: 'bet', condition: 'par-or-better', stake: 0,
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
    stakes: '$150k now — the sponsor loves the photo. The stopping costs you '
      + 'a focus. Always this trade, always honest.',
    walk: 'After the round — and this time, mean it',
    engage: {
      kind: 'sure',
      outcome: {
        line: 'Signed. The marker gave out halfway through your surname. The photo runs everywhere.',
        tone: 'flat', money: 150_000, focus: -1,
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
