/**
 * THE SEASON — fourteen events, one job to keep.
 *
 * Both curves in here were derived against the live simulation, not by feel.
 * See DESIGN.md §3.4a / §3.4b and src/tools/seasoncheck.ts.
 *
 * WHERE each event is played is NOT in this file: the schedule is a pool
 * mechanism (SCHEDULE-PLAN.md, owner decision) — sim/schedule.ts draws each
 * run's rotation from the course registry, seeded from the run's seed, under
 * the slot constraints the registry carries. This file only contributes the
 * per-event pins below: an event named after a venue plays that venue.
 */
import type { CourseId } from './courses'

export interface EventSpec {
  readonly num: number
  readonly name: string
  readonly major: boolean
  /** how many players play on after four holes — top N and ties */
  readonly advance: number
  /** global multiplier on every cone — you start loose and tighten */
  readonly sharpness: number
  /**
   * FIELD RESPONSE: how far the field's skill floor has risen this week
   * (see FIELD-RESPONSE.md and makeField). 0 in the spring; by the finale
   * the bottom of the tour has gone home and stayed there. (The course's
   * dial turned out to be a SECOND number, not this one: fieldStrength can
   * only lift the floor, so the course carries fieldShift on the registry
   * instead — SCHEDULE-PLAN.md §3.2.)
   */
  readonly fieldStrength: number
  readonly purse: number
  /**
   * NAMED EVENTS PIN TO THEIR VENUE while the venue is in the pool: the
   * Pine Hollow Classic cannot be played somewhere else without the fiction
   * breaking. Unpinned events draw from the pool under slot constraints.
   */
  readonly pin?: CourseId
  /**
   * HOSTING FICTION: events sharing a venue name (Bracken Ridge, events 8
   * and 11) must draw the SAME course — a name must mean the same course
   * every time it appears (SCHEDULE-PLAN.md §2). The venue itself has no
   * course file yet; it is the strongest candidate for a fifth one.
   */
  readonly venue?: string
}

const NAMES = [
  'The Sunbelt Open', 'Pine Hollow Classic', 'Cottonwood Invitational',
  'THE MASTERS OF PINE HOLLOW', 'Rivermouth Open', 'The Muni Championship',
  'THE OPEN AT SALT FLATS', 'Bracken Ridge Classic', 'The Fall Series',
  'Highwater Open', 'THE PGA AT BRACKEN RIDGE', 'The Autumn Invitational',
  'Coastal Classic', 'THE TOUR CHAMPIONSHIP',
]

const MAJORS = new Set([4, 7, 11, 14])

/** The named-event pins — an event wearing a venue's name plays that venue. */
const PINS: Readonly<Record<number, CourseId>> = {
  2: 'pinehollow',   // Pine Hollow Classic
  3: 'cottonwood',   // Cottonwood Invitational
  4: 'pinehollow',   // THE MASTERS OF PINE HOLLOW
  6: 'rockdale',     // The Muni Championship
  7: 'saltflats',    // THE OPEN AT SALT FLATS
}

/** Shared hosting-fiction venues — same name, same drawn course. */
const VENUES: Readonly<Record<number, string>> = {
  8: 'brackenridge',   // Bracken Ridge Classic
  11: 'brackenridge',  // THE PGA AT BRACKEN RIDGE
}

/**
 * THE CUT IS A PLACE, NOT A SCORE.
 *
 * The stroke line it replaces could not make a curve out of a four-hole score:
 * one stroke of movement swung make-cut by more than twenty points, so the
 * season was two cliffs (72 57 60 60 · 36 38 44 42 42 · 19 18 18 15 24) rather
 * than a squeeze. Cutting to a NUMBER OF PLAYERS is continuous — N can step by
 * two or three a week — and it is what the leaderboard on screen already
 * shows. See sim/resolve/field.ts rankCut and tools/cutcheck.ts.
 *
 * Derived, not chosen: measured against 400 seasons per skill level with a
 * player who shops. Make-cut runs 75% → 28% for mixed play, 63% → 23% for safe
 * play, 64% → 31% for aggressive. Safe stays the worst way to keep your card.
 */
const ADVANCE_CURVE = [44, 41, 39, 36, 34, 31, 28, 26, 23, 21, 18, 15, 13, 10] as const

/**
 * How far the field's skill floor rises by the finale. Derived by cutcheck
 * sweep (FIELD-RESPONSE.md §5,§6) over F ∈ {0.10..0.30}: before field
 * response, make-cut at a fixed line CLIMBED ~75% → ~91% across the season;
 * at 0.30 the live advance curve measures 87 71 70 69 52 56 59 54 56 46 38
 * 43 39 31 (mixed, kit ×1) — the squeeze the intro screen always promised,
 * ending a hair over the 28% ambition with equipment still to be earned on
 * top of it.
 */
const FIELD_LIFT = 0.30

export const SEASON: readonly EventSpec[] = NAMES.map((name, i) => {
  const num = i + 1
  const major = MAJORS.has(num)
  return {
    num, name, major,
    advance: ADVANCE_CURVE[i]!,
    // ×1.40 at event 1 → ×0.80 at event 14
    sharpness: Math.round((1.40 - (num - 1) / (NAMES.length - 1) * 0.60) * 100) / 100,
    fieldStrength: Math.round(FIELD_LIFT * (num - 1) / (NAMES.length - 1) * 1000) / 1000,
    purse: major ? 20_000_000 : 9_000_000,
    pin: PINS[num],
    venue: VENUES[num],
  }
})

export const EVENT_COUNT = SEASON.length

/**
 * Where the Money List is checked, and what it demands.
 *
 * AFTER 5, 9 AND 12 — never after the final event. A check at 14 is not a
 * checkpoint, it is a verdict on a season already played, and it made the
 * finale a lottery ticket. Ending survival at 12 leaves two weeks that decide
 * how well you finish rather than whether you live.
 *
 * The numbers are set by CONDITIONAL kill rate, not by percentile of the
 * population: everyone facing check 2 already survived check 1, so the pool is
 * richer than the spread suggests. The kill-profile intent is 41% / 29% / 14%
 * of the players who actually arrive at each — see the re-anchoring note
 * below for how close the current numbers get and why the tail cannot.
 *
 * Raised twice in one day, both times to pay for the short game getting fairer:
 * first the free chip inside 60 yards (cards.ts, CHIP_OUT), then the cone-angle
 * fix (effects.ts, TAKEOFF_PENALTY) which stopped a cut-down wedge fanning
 * wider than it flew. Together they took about 0.7 strokes off a round and
 * pushed survival from 35% to 50%. Neither was a difficulty decision — one was
 * a missing floor and the other was a modelling artefact — so the difficulty
 * they removed by accident is taken back here, deliberately, where the dial
 * for it lives.
 *
 * Calibrated against a player who SHOPS, using the only harness with the real
 * boosts in it. Safe play is not merely worse, it is hopeless, because a cut
 * to a PLACE punishes the timid in a way a cut to a score never did: par no
 * longer keeps up with a field that is trying to beat you. That is P7
 * arriving in full. Re-derive with `npx tsx src/tools/shopcheck.ts`.
 *
 * RE-ANCHORED 25 Aug 2026, twice in one night. First for three changes at
 * once — momentum regen made every season richer, the list moved to GROSS
 * earnings (spending no longer lowers the number the check reads), and the
 * shop was repriced to ~2.0x. Then again when FIELD RESPONSE landed
 * (FIELD-RESPONSE.md): with the field's skill floor rising through the
 * season, the late checks finally answer their dial — under the static
 * field, check 2's kill was pinned near 20% no matter the number; under the
 * responding field it tracked its bar 20% -> 28% -> 32%.
 *
 * These send home 42% / 28% / 8% of the players who arrive at them.
 * Survival: mixed 38%, aggressive 46%, safe ~4% — against the 36/45/3
 * intent, which the first two hit within noise. A mixed hoarder who never
 * shops survives 10% where the shopper gets 38%: the shop is not a
 * crossover argument any more, it is the difference between living and not.
 *
 * The one residual: check 3 kills 8% against a 14% intent, and raising its
 * bar past $8.4M starts starving the win-pays-the-final-leg invariant
 * (deck.test.ts) before it buys much kill. What snowballs past the last
 * check is EQUIPMENT scaling, not field statics — if 14% ever matters, the
 * next dial is boost effect decay, not this number.
 */
export const MONEY_CHECKS: readonly { readonly after: number; readonly need: number }[] = [
  { after: 5, need: 1_400_000 },
  { after: 9, need: 4_800_000 },
  { after: 12, need: 8_400_000 },
]

export function checkAfter(event: number) {
  return MONEY_CHECKS.find(c => c.after === event) ?? null
}

/**
 * Prize money for a finishing position.
 *
 * A power law, not the exponential it replaces. The old curve decayed 14% a
 * place, which paid 30th $20k out of a $9M purse — the game spent the whole
 * season telling you to make the cut and then paid nothing for making it.
 * Under this curve 30th is $119k and 15th is $201k, while a win is still
 * $1.53M, a 13:1 spread that keeps first place worth chasing.
 *
 * Derived in tools/pursecheck.ts against 300 seasons.
 */
export function payout(purse: number, place: number): number {
  if (place < 1 || place > 65) return 0
  return Math.round(purse * 0.17 / Math.pow(place, 0.75))
}

export function money(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1000)}k`
  return `$${n}`
}

/**
 * THE MONEY LIST ITSELF.
 *
 * The checks were always a bare number — "$1.65M needed" — with nothing behind
 * it. Nobody has ever kept a tour card by clearing a number; they keep it by
 * finishing above other people. This is the list those people are on: what each
 * position earns over a full season. Invented, like every name in the game, but
 * shaped like the real thing — top-heavy, with a long tail that earns almost
 * nothing.
 *
 * SHARE says how much of a season's money is normally in the bank by a given
 * event, measured across 400 simulated seasons (median cumulative earnings at
 * events 5, 9, 12 and 14). It lets a mid-season total be read as a position on
 * a list that is not finished yet, which is the only way "you are 46th" means
 * anything in June.
 */
const LADDER: readonly (readonly [number, number])[] = [
  [1, 8_500_000], [3, 5_600_000], [5, 4_700_000], [10, 4_200_000],
  [20, 2_900_000], [30, 2_200_000], [40, 1_600_000], [50, 1_100_000],
  [60, 650_000], [72, 150_000],
]

/**
 * Median share of a season's money banked by the end of each event, measured
 * across 400 seasons: $561k / $1.22M / $2.11M / $2.93M at events 5, 9, 12, 14.
 */
const SHARE = [0.05, 0.09, 0.13, 0.16, 0.19, 0.25, 0.31, 0.37, 0.42, 0.50, 0.61, 0.72, 0.86, 1.00]

/**
 * THE LIST IS THE FIELD YOU ALREADY SEE.
 *
 * It used to be 156 players and an invented ladder anchored to nothing, which
 * put the median player 21st and made the checks demand places that read like
 * nonsense. Seventy-two is the number of people who tee it up beside you every
 * week, so the Money List is now the same population as the leaderboard —
 * one tour, counted twice.
 *
 * The ladder is placed against measured earnings: a mixed-play season banks
 * $2.93M, which sits 20th. Below that is a long tail of players who miss cuts.
 */
export const TOUR_SIZE = 72

/**
 * Where a running total puts you on the list, read as a full-season pace.
 *
 * Only ever used to tell the player where THEY stand. The checks themselves are
 * quoted in money: expressing them as places came out as "you need to be 12th
 * to keep your job", which is arithmetically true and reads like a typo.
 */
export function moneyListRank(earnings: number, afterEvent: number): number {
  const share = SHARE[Math.min(afterEvent, SHARE.length) - 1] ?? 1
  const pace = earnings / Math.max(0.05, share)
  if (pace >= LADDER[0]![1]) return 1
  for (let i = 1; i < LADDER.length; i++) {
    const [p0, e0] = LADDER[i - 1]!
    const [p1, e1] = LADDER[i]!
    if (pace >= e1) {
      const t = (e0 - pace) / Math.max(1, e0 - e1)
      return Math.round(p0 + (p1 - p0) * t)
    }
  }
  return TOUR_SIZE
}
