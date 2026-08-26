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

/**
 * The named-event pins — an event wearing a VENUE'S name plays that venue,
 * and only those: the Sunbelt Open, the Fall Series, the Coastal Classic
 * and their kin name regions and seasons, not places, so they cycle with
 * the pool (six free slots at ten courses, more with every batch). The
 * full cycling vision — unpinned slots WEARING the name of whatever venue
 * the pool deals — arrives when event names become per-course data (each
 * course already carries a home-event name in COURSE-SLATE.md); a design
 * task for the dialogue, noted so this list reads as a waypoint.
 */
const PINS: Readonly<Record<number, CourseId>> = {
  2: 'pinehollow',   // Pine Hollow Classic
  3: 'cottonwood',   // Cottonwood Invitational
  4: 'pinehollow',   // THE MASTERS OF PINE HOLLOW
  5: 'rivermouth',   // Rivermouth Open
  6: 'rockdale',     // The Muni Championship
  7: 'saltflats',    // THE OPEN AT SALT FLATS
  8: 'brackenridge', // Bracken Ridge Classic
  // 11, THE PGA AT BRACKEN RIDGE, is deliberately NOT pinned: REVIEW-7
  // ruled the venue under major weight and the owner un-pinned the event —
  // Bracken Ridge PRESENTS the PGA, hosted by a course that can carry it,
  // until the venue earns its flag back (+0.75 at N=800). Very real golf.
}

/** Shared hosting-fiction venues — same name, same drawn course. Retired to
 * direct pins now that Bracken Ridge exists; kept for the next homeless name. */
const VENUES: Readonly<Record<number, string>> = {}

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
 *
 * SLICE 4 (25 Aug 2026, corrected instrument — the numbers above are from
 * cutcheck's old eight-hole-total reading and are NOT comparable): under the
 * corrected thru-4 cutcheck, on the real pool rotation with canon-ladder
 * coupling (N=400, kit ×1), make-cut on this curve runs
 *   mixed       94 70 66 58 61 82 50 65 71 62 62 66 60 56   overall 66%
 *   safe        70 31 19 33 33 58 18 35 51 44 32 52 46 43   overall 40%
 *   aggressive  92 68 59 52 51 82 48 70 67 62 61 63 54 52   overall 63%
 * Still a declining squeeze — 94 early to 56 late for mixed — now with the
 * rotation's local structure on top: the dip at 7 is Salt Flats, the bumps
 * at 6 and 9 are the gentle weeks the schedule puts before the checks. The
 * shape held, so the curve was not touched; the LEVEL changed because the
 * instrument was fixed, and an instrument correction is not evidence about
 * the world.
 */
const ADVANCE_CURVE = [44, 41, 39, 36, 34, 31, 28, 26, 23, 21, 18, 15, 13, 10] as const

/**
 * How far the field's skill floor rises by the finale. Derived by cutcheck
 * sweep (FIELD-RESPONSE.md §5,§6) over F ∈ {0.10..0.30}: before field
 * response, make-cut at a fixed line CLIMBED ~75% → ~91% across the season;
 * at 0.30 the live advance curve measures 87 71 70 69 52 56 59 54 56 46 38
 * 43 39 31 (mixed, kit ×1) — the squeeze the intro screen always promised,
 * ending a hair over the 28% ambition with equipment still to be earned on
 * top of it. (That series is from cutcheck's OLD eight-hole-total reading —
 * the corrected thru-4 instrument reads the same world softer; see the
 * ADVANCE_CURVE note above for the comparable modern curve. F itself was
 * re-examined at slice 4 and left at 0.30: the squeeze still points the
 * right way and the dial's job has not changed.)
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
 * RE-ANCHORED A THIRD TIME at slice 4 — the calibration pass against the
 * FINISHED world — for two changes every prior derivation missed:
 *   1. THE FREE MAJOR-CUT DROPS (found live by the owner): surviving a
 *      major's cut hands you a premium boost, up to four a season, and no
 *      threshold had ever been derived with them modeled. At the old triple
 *      they took the mixed shopper from 47% survival to 68%.
 *   2. THE TEN-COURSE WORLD: the pool rotation plus the canon-ladder
 *      coupling retarget (courses/index.ts) — nine of ten courses now sit
 *      AT or BELOW Pine Hollow, so the rotation is a richer season than
 *      the four-course one the $1.4M/$4.8M/$8.4M triple was priced in.
 * Derived by shopcheck threshold sweep (drops modeled, final boost prices,
 * 400 seasons per policy): $1.4M/$4.8M/$8.4M had decayed to kills 28/6/1
 * (intent 41/29/14). The triple below sends home 44% / 32% / 1% of
 * arrivals; survival mixed 37%, aggressive 36%, safe 2% (intent 36/45/3).
 * Checks 1-2 sit within a sigma of intent; mixed survival is on the nose.
 *
 * Two residuals, stated plainly (as of the third anchoring — the fourth
 * re-scores them below):
 *   - Check 3 kills ~1% against 14% intent — WORSE than the 8% it managed
 *     before the drops existed, and no bar inside the win-pays-the-final-leg
 *     invariant's ceiling (deck.test.ts; $13.6M bought 1%, $16.5M bought 3%
 *     for a 72% check-2 overkill) buys real kill. The equipment snowball
 *     that was already the named suspect now has four free premium boosts
 *     feeding it. If 14% ever matters, the dial is boost effect decay —
 *     more certainly than ever, not this number.
 *   - Aggressive survival measures 36%, BELOW mixed's 37%, against a 45%
 *     intent that wants aggression rewarded. That ordering is a property of
 *     the economy (aggressive banks slightly less gross through event 9
 *     under the rotation), not of these bars — no triple can reorder two
 *     policies facing the same numbers. Flagged for the dialogue.
 *
 * RE-ANCHORED A FOURTH TIME — CALIBRATION-2.md, 26 Aug 2026, the once-and-
 * last pass after the MARQUEE RAMP (FIELD-CEILING.md) put four named stars
 * in the field — and the first anchoring in the project's history to move
 * bars DOWN. The stars eat cheques exactly where the win-heavy late season
 * lives (late win rate 86% -> 51%), so at the old triple check 2 had gone to
 * 49% kill against its 29% intent while check 1 sat untouched at 43% — the
 * spring rule (stars are names only through event 4) measured in the
 * economy's own books. Derived by shopcheck sweep under the finished world
 * (stars on, Palmetto's re-derived fieldShift, final boost prices; 400
 * seasons per policy, seeds 700000+): the triple below sends home
 * 44% / 35% / 5% of arrivals; survival mixed 35%, aggressive 34%, safe 5%
 * (intent 41/29/14 and 36/45/3); the mixed hoarder gets 10%, so shopping
 * is still the difference between living and not, and mixed sits the
 * point-or-so above aggressive the ordering law asks for.
 *
 * The residuals, re-scored:
 *   - Check 3: FIELD-CEILING §8-2 predicted the bar moves DOWN and finally
 *     buys >= 10% kill. Half right: it moved down ($13.3M -> $12.2M, pinned
 *     to the invariant's ceiling over the new check 2 — the last leg is
 *     $3.7M against a $3.4M major win), and it buys 5%, up from 1-3% but
 *     nowhere near 14%. The sweep showed 2-5% at EVERY bar the invariant
 *     permits: the escape clause governs. The residual is raw equipment
 *     over-supply, not uncontested wins, and the named next dial is honest
 *     rentals (consumable SKUs priced on their window, FIELD-CEILING §4) —
 *     never sticker decay of owned goods, never a fifth re-anchoring.
 *   - The aggressive-below-mixed inversion SURVIVED the stars (34 vs 35 —
 *     the tier presses win-heavy play hardest, aggressive most of all).
 *     Still an economy property, still no triple can reorder it, still
 *     flagged for the dialogue; the 45% aggressive intent stays unmet.
 *
 * RE-ANCHORED A FIFTH TIME — SHOP-SUPPLY.md SHIPPED, 26 Aug 2026: the one
 * derivation that absorbs BOTH the split purse (v8) and the shop-supply
 * hybrid (v9 — season budget 6, tiered offer stream, spring slot, seven
 * new SKUs). Two worlds moved under the old bars at once: the tie split
 * alone took the calibrated model's survival 35% -> 28% at the standing
 * triple (kills 44/35/5 -> 48/44/2 on the same 400 seeds — early winning
 * groups tie constantly in this score space, so the split taxes even the
 * spring), and the offer-stream shop (the honest model of the game as it
 * NOW is) reads the spring ~4 points hotter still than the legacy
 * pick-of-the-catalogue shopper. Derived by shopcheck sweep under the
 * finished world (offer stream, budget 6, weights 6/3/1, gate + spring
 * slot, 24-SKU shelf at final prices; 400 seasons per policy, seeds
 * 700000+): the triple below sends home 44% / 31% / 1% of arrivals;
 * survival mixed 38%, aggressive 30%, safe 1%, mixed hoarder 7%. Against
 * the RE-SET intent table (44 / 33 / <= 8, DESIGN.md §3.2): check 1
 * prints the intent digit itself — the bar came down $2.3M -> $2.1M to
 * pay the split purse's measured spring tax and the offer stream's, and
 * the spring feel is back to the calibrated 44; check 2 sits two points
 * off intent; check 3 prints 1% against its 8-point ceiling,
 * structurally small ON PURPOSE (see below). Mixed beats aggressive by
 * eight points — scarce supply is worth most to balanced golf — and
 * beats the hoarder ~5x, so the shop is still the difference between
 * living and not. Two sensitivities recorded for the next reader: the
 * pass's two $200-300k rack repricings (band check) moved check 1's kill
 * 48 -> 44 and mixed survival 34 -> 38 on identical seeds — cheap
 * commons are spring power, and these bars stay honest to ±2 ONLY at
 * the exact live shelf (CALIBRATION-2 verdict 4, twice as true now) —
 * and safe survival reads 1% against the old 3% intent, the tiers
 * starving a policy that never banks enough for the mid shelf.
 *
 * CHECK 3 AND THE INVARIANT, re-priced for the split purse: the
 * win-pays-the-final-leg invariant (deck.test.ts) now prices the last leg
 * against the EXPECTED win cheque — the modal winning group under
 * top-only ties is 2-3 players, so a "win" is worth tiePayout(purse,1,2)
 * ≈ $2.71M at a major, not the solo $3.4M. That caps the leg at ~$3.0M
 * (was $3.78M), and at every bar that cap permits, check 3's kill is
 * 0-1%: the third check is a pace check whose real teeth are the leg's
 * demand for a major win, exactly as SHOP-SUPPLY §5 argued when it
 * retired the 14% intent. Nobody should try to buy check-3 kill with a
 * bar move again — the ceiling is the invariant, and the difficulty
 * owner for "too easy" is the supply dial (shop.ts SHOP_BUDGET and the
 * tier weights), never a sixth re-anchoring.
 */
export const MONEY_CHECKS: readonly { readonly after: number; readonly need: number }[] = [
  { after: 5, need: 2_100_000 },
  { after: 9, need: 8_100_000 },
  { after: 12, need: 11_100_000 },
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

/**
 * SPLIT THE PURSE — AT THE TOP ONLY (owner ruling, 26 Aug 2026).
 *
 * A tie for FIRST with k of you pays the MEAN of the cheques for places 1
 * through k: the money those places would have carried, pooled and split
 * evenly. A T1 is still a win everywhere but the cheque — lastPlace stays
 * 1, the board says T1, only the money divides — and a split win still
 * out-earns everyone below it, by construction of the mean.
 *
 * Every OTHER tied rank keeps the pre-existing rule: the whole group takes
 * the best place's full cheque (settle simply calls payout()). The real
 * tour splits every tie, and the first cut of this feature did too — and
 * shopcheck measured survival 35% → 17% and median gross −21%, because in
 * THIS world every finish ties about twenty ways (short events, a tiny
 * integer score space; DESIGN.md §3.4b said "and ties overflows hard here"
 * about the cut and it is just as true of the cheques). The owner ruled
 * top-only rather than re-anchor; the deeper fix — spread the field — is
 * §3.4b's, and stays on the ledger.
 *
 * WHAT A WIN IS WORTH, once this rule exists: the modal winning group is
 * 2-3 players, so the cheque a player can EXPECT a win to pay is the
 * 2-way value — tiePayout(purse, 1, 2), ~$2.71M at a major — not the
 * solo payout(purse, 1). The win-pays-the-final-leg invariant
 * (deck.test.ts) and the MONEY_CHECKS derivation above both price the
 * final leg on that expected cheque (SHOP-SUPPLY SHIPPED): a leg priced
 * on the solo cheque would demand a win AND the luck of winning alone.
 */
export function tiePayout(purse: number, place: number, tied: number): number {
  if (tied <= 1) return payout(purse, place)
  let pool = 0
  for (let i = 0; i < tied; i++) pool += payout(purse, place + i)
  return Math.round(pool / tied)
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
/**
 * RE-ANCHORED at slice 4: the 20th-place rung is the measured median season
 * of the mixed SHOPPER with the major-cut drops modeled — $19.6M gross
 * (shopcheck, 400 seasons, final prices) — and every other rung keeps its
 * old ratio to that anchor (the shape is still invented; only the anchor is
 * measured). The previous ladder was anchored to a $2.93M median from a
 * world with no drops, no rotation, and a pre-momentum economy; under it a
 * player scraping past check 3 read as 1st on the list, which is the "reads
 * like a typo" failure this ladder exists to prevent.
 *
 * RE-ANCHORED at CALIBRATION-2 (26 Aug 2026): same rule, new world — with
 * the marquee ramp's stars eating cheques the same 400-season shopper
 * median is $15.80M, and every rung re-scales to it (ratios unchanged,
 * rounded to $100k). The star money is REAL money the board never sees —
 * it goes to Vail, Maravilla, Boone and Ito, who are not on this ladder;
 * what the ladder models is the rest of the tour, which got poorer the
 * same way you did. Symptom cured by the re-anchor: a finished $23.92M
 * season (the frozen andrew-2 row) read 15th against the fat pre-stars
 * ladder; it now reads 8th, which is what ten wins deserves on a tour
 * where nobody outearns the stars for free. Frozen board rows in
 * runs/verified.json keep their ledgered numbers — the ladder is a lens,
 * not a record.
 *
 * RE-ANCHORED at SHOP-SUPPLY SHIPPED (26 Aug 2026): same rule again — the
 * split purse and the shop-supply hybrid together thin the same shopper's
 * 400-season median to $15.05M (the split takes its bite out of every
 * tied win; the budget caps the kit the late season converts), and every
 * rung re-scales to the new anchor at its old ratio, rounded to $100k.
 * The moved medians were checked against the quoted tolerance before
 * anything moved: -$750k on a $100k-grid ladder is not a rounding.
 */
const LADDER: readonly (readonly [number, number])[] = [
  [1, 43_700_000], [3, 28_800_000], [5, 24_200_000], [10, 21_500_000],
  [20, 15_100_000], [30, 11_300_000], [40, 8_200_000], [50, 5_700_000],
  [60, 3_300_000], [72, 800_000],
]

/**
 * Median share of a season's money banked by the end of each event.
 * Re-measured at slice 4 from the same 400 shopper seasons as the LADDER
 * anchor: medians $175k / $793k / $3.42M / $8.93M / $16.43M / $19.62M at
 * events 1, 3, 6, 9, 12, 14. Flatter early and steeper late than the old
 * array — the majors' purses and the drops they hand out load the earning
 * curve onto the back half (the jump at 7 is Salt Flats's $20M purse).
 *
 * Re-measured again at CALIBRATION-2 from the LADDER re-anchor's own 400
 * seasons (stars on): medians $146k / $813k / $3.52M / $7.63M / $13.46M /
 * $15.80M at 1, 3, 6, 9, 12, 14. The curve tilts a few points EARLIER —
 * the stars take their biggest bites out of the late wins, so the spring
 * (which they leave alone, the spring rule) now carries a larger share of
 * a smaller season. Mid-season paces read slightly richer for it: the
 * denominator got honest.
 *
 * Re-measured at SHOP-SUPPLY SHIPPED from the new anchor's own 400
 * seasons (offer stream, budget 6, split purse, final prices): medians
 * $146k / $746k / $2.98M / $6.99M / $12.65M / $15.05M at 1, 3, 6, 9,
 * 12, 14. The middle eases a few points (the budget slows the midsummer
 * kit, so midsummer earns less of the season) while both ends hold.
 */
const SHARE = [0.01, 0.03, 0.05, 0.12, 0.15, 0.20, 0.33, 0.38, 0.46, 0.54, 0.69, 0.77, 0.84, 1.00]

/**
 * THE LIST IS THE FIELD YOU ALREADY SEE.
 *
 * It used to be 156 players and an invented ladder anchored to nothing, which
 * put the median player 21st and made the checks demand places that read like
 * nonsense. Seventy-two is the number of people who tee it up beside you every
 * week, so the Money List is now the same population as the leaderboard —
 * one tour, counted twice.
 *
 * The ladder is placed against measured earnings: a mixed shopper's median
 * season banks $15.05M under the finished world (drops modeled, stars in
 * the field, split purse, season shop budget — SHOP-SUPPLY SHIPPED),
 * which sits 20th. Below that is a long tail of players who miss cuts.
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
