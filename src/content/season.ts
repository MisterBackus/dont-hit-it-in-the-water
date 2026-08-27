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

/**
 * SHARPNESS — THE FREE RAMP, MEASURED AT LAST (SHARPNESS.md, 27 Aug 2026,
 * PLAYTEST-NOTES-1 note 11).
 *
 * What this used to be: a straight line ×1.40 → ×0.80 across the fourteen
 * events — cones narrowing 43% a season, about 4% a week, on every club in
 * the bag, for free. It was WRITTEN, never measured, and it was the largest
 * lever in the game: Forged Wedges are ×0.55 but only inside the short band,
 * the Golden Driver ×0.66 only past 200 yards, while the calendar handed out
 * ×0.57 on every shot at no cost and with no decision. A large share of
 * "getting better" was time passing, which is P7's opposite.
 *
 * What it is now: **the line falls five hundredths a week for nine weeks and
 * then stops** — ×1.40 at event 1 down to ×0.95 at event 10, FLAT through the
 * finale. You still start the season a worse golfer (§3.4a's whole point, and
 * the spring is untouched to within a hundredth), the free gains all land
 * early, and the last five events — two majors among them — hand out nothing.
 * Late-season power is something you BOUGHT.
 *
 * Derived by shopcheck sweep against the live world (stars on, offer stream,
 * budget 6, 36-hole scorecard with the full tie split, live MONEY_CHECKS;
 * 250-season brackets over 16 cells, then 400/policy on the finalists; the
 * SHKNEE/SHFLOOR knob shopcheck and cutcheck carry). Two shapes were swept,
 * as note 11 ordered:
 *   (a) shallower overall — the same straight line ending at ×0.90…×1.05
 *   (b) front-loaded then flat — knee at event 6, 8 or 10, then level
 * and the measurement, not the recommendation, chose:
 *   - The 45–60% late-season win band is a CEILING ON THE FLOOR, not a free
 *     parameter: at ×1.00 the strong player reads 44% of weekends won at 400
 *     seasons, just outside the band. ×0.95 reads 48% — mid-band — so ×0.95
 *     is the deepest honest cut to the free ramp.
 *   - A knee EARLIER than 10 wrecks the spring in the other direction: at
 *     knee 6 the free gains land so fast that check 1's kill collapses to
 *     30% against its calibrated 44 (the spring got EASIER, which is still
 *     the spring moving). Knee 10 keeps events 1–9 within a hundredth of the
 *     old line, so checks 1 and 2 — which read events 5 and 9 — never see it.
 *   - Shape (a) buys less for the same price: at equal late win rate (45%)
 *     it removes 7 fewer points of free ramp and takes its bite out of the
 *     spring rather than the fall.
 * Measured at the live triple, 400 seasons: kills 43/37/1, survival mixed
 * 36% · aggressive 27% · safe 1% · mixed hoarder 5% — the calibrated world,
 * unmoved, because the change lands entirely after check 2. The cut squeeze
 * deepens exactly where it should (mixed make-cut finale 49% → 42%, events
 * 1–6 digit-identical; cutcheck N=400).
 */
const SHARP_START = 1.40
const SHARP_FLOOR = 0.95
const SHARP_KNEE = 10
export function sharpnessAt(num: number): number {
  const slope = (SHARP_START - SHARP_FLOOR) / (SHARP_KNEE - 1)
  return Math.round(Math.max(SHARP_FLOOR, SHARP_START - (num - 1) * slope) * 100) / 100
}

export const SEASON: readonly EventSpec[] = NAMES.map((name, i) => {
  const num = i + 1
  const major = MAJORS.has(num)
  return {
    num, name, major,
    advance: ADVANCE_CURVE[i]!,
    // ×1.40 at event 1 → ×0.95 at event 10, then flat (SHARPNESS.md)
    sharpness: sharpnessAt(num),
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
 *
 * RE-ANCHORED A SIXTH TIME — CALIBRATION-3.md, 26 Aug 2026, the pass
 * FIELD-SPREAD.md §9.5 ordered after THE FULL SCORECARD shipped — and the
 * first anchoring in the project's history to move bars UP. (The "never a
 * sixth re-anchoring" above forbade chasing check-3 kill with a bar move;
 * this is not that. The WORLD moved: the field plays 36-hole weeks, the
 * full tie split pays every rank, and the extension pays a pace-holding
 * player up the spread board more than the split taxes them, so at the
 * old triple the mixed shopper read kills 36/21/0 and survival 50%.)
 * Derived by shopcheck sweep under the finished world (offer stream,
 * budget 6, final shelf — the band check repriced NOTHING this pass;
 * 250-season brackets then the authoritative 400/policy, seeds 700000+):
 * the triple below sends home 44% / 37% / 2% of arrivals; survival mixed
 * 35%, aggressive 27%, safe 1%, mixed hoarder 6%. Against the intent
 * table (44 / 33 / <= 8): check 1 prints the intent digit itself, at the
 * FLOOR of FIELD-SPREAD's registered $2.6-3.2M range — the spring got
 * richer (the extension pays a good April that the 8-hole tie stacks
 * used to flatten into the group cheque), so the bar rose only $500k;
 * check 2 became the season's whole wall at $10.1M, four points over
 * intent at 400 seasons (the 250-bracket printed the intent 33 and the
 * 400-run reads 37 — the same bracket-to-authoritative drift
 * CALIBRATION-2 recorded; and with check 3 structurally small, survival
 * ~36 REQUIRES kill-2 near 34 by arithmetic, so survival keeps the
 * argument); check 3 sits at the re-priced invariant's ceiling on the
 * $100k grid (leg $3.7M against the SOLO $3.4M major cheque — 91% of
 * wins are solo now, so the leg is priced on payout(purse,1) again, see
 * the tiePayout note and deck.test.ts) and buys 2%, under its 8-point
 * ceiling, structurally small ON PURPOSE. Mixed beats aggressive by
 * eight points (check 2's wall presses win-heavy play exactly where the
 * stars eat) and the hoarder ~6x: the ordering law holds whole.
 * Sensitivity, third time recorded: these bars are honest to ±2 ONLY at
 * the exact live shelf and 400 fresh seasons (CALIBRATION-2 verdict 4);
 * this pass moved no price, so the shelf IS the calibrated one.
 *
 * RE-DERIVED A SEVENTH TIME — AND IT MOVED NOTHING (SHARPNESS.md, 27 Aug
 * 2026, the closing calibration of the flattened sharpness ramp). The free
 * cone ramp stopped being a straight line to ×0.80 and became ×1.40 ->
 * ×0.95 by event 10, then FLAT; every prior pass in this comment moved
 * bars because the world moved under them, and this one is the first where
 * the sweep ran, the response was measured, and the honest answer was
 * "these are already the numbers." The reason is structural rather than
 * lucky: **the checks read events 5, 9 and 12, and the shipped shape holds
 * events 1-9 within a hundredth of the old line**, so checks 1 and 2 never
 * see the change and check 3's kill is pinned small by the invariant
 * either way. Measured at the shipped curve (shopcheck, 400 seasons per
 * policy, seeds 700000+, same shelf, same supply): kills 43 / 37 / 1
 * (were 44 / 37 / 2), survival mixed 36%, aggressive 27%, safe 1%, mixed
 * hoarder 5% — the ordering law whole, mixed over aggressive by nine and
 * over the hoarder seven-fold, and mixed survival on the 36 target. The
 * 250-season bracket around the triple reads the same response the last
 * three passes recorded (check 2 is the wall: $9.5M/$9.8M/$10.1M/$10.4M
 * buy 27/31/37/38 points of kill and 43/40/37/36 survival), so nothing
 * inside a $100k grid step is worth chasing. The spring-rule instrument
 * scores it: check 1's kill 44 -> 43, one point, well inside the ±4 the
 * rule is quoted at and the ±2 these bars are honest to.
 *
 * ONE COUPLING THE NEXT READER MUST KNOW: encounter money is now derived
 * as a FRACTION of the last check (encounters.ts STAKE_POINT = check 3 /
 * 100), so every stake in that file follows this triple automatically —
 * and shopcheck does not model encounters, so this derivation is blind to
 * them. That was harmless while encounter money was rounding error; it is
 * a real (small) coupling now, and it belongs to whoever next moves a bar.
 */
export const MONEY_CHECKS: readonly { readonly after: number; readonly need: number }[] = [
  { after: 5, need: 2_600_000 },
  { after: 9, need: 10_100_000 },
  { after: 12, need: 13_800_000 },
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
 * WHAT A WIN IS WORTH, under that rule: in the 8-hole score space the
 * modal winning group was 2-3 players, so a win's expected cheque was the
 * 2-way value — tiePayout(purse, 1, 2), ~$2.71M at a major — and the
 * win-pays-the-final-leg invariant priced the leg there (SHOP-SUPPLY
 * SHIPPED): a leg priced on the solo cheque would have demanded a win AND
 * the luck of winning alone.
 *
 * SUPERSEDED BY THE FULL SCORECARD (FIELD-SPREAD.md SHIPPED, 26 Aug
 * 2026): settle now pays tiePayout at EVERY rank — the full real-tour
 * split, shippable because the 36-hole board thinned the winning groups
 * until 91% of measured wins are SOLO (shopcheck WINS, 400 seasons). The
 * top-only compromise above is kept as history; the "what a win is worth"
 * arithmetic flipped with the spread: the expected win cheque is the solo
 * payout(purse, 1) = $3.4M at a major again, and the invariant
 * (deck.test.ts) and the MONEY_CHECKS derivation are re-priced on it
 * (CALIBRATION-3.md).
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
 *
 * RE-ANCHORED at CALIBRATION-3.md (26 Aug 2026): the first anchor to move
 * UP. THE FULL SCORECARD (FIELD-SPREAD.md SHIPPED — 36-hole weeks, full
 * tie split) pays a pace-holding player up the spread board more than the
 * split taxes them, and the same 400-season shopper median rises $15.05M
 * -> $16.97M (shopcheck SHARE=1, seeds 700000+, final shelf — this pass
 * repriced nothing). Every rung re-scales at its old ratio, $100k grid.
 * The rest of the tour got richer the same way you did: the board spreads
 * for everyone.
 */
/**
 * TOPPED OUT, 26 Aug 2026 (PLAYTEST-NOTES-1 note 9).
 *
 * The owner won TWELVE OF THIRTEEN and the list called him sixth, and asked
 * the right question of that. The answer was worse than the number: RANK 1
 * WAS UNREACHABLE. Winning all fourteen events outright pays $28.90M — every
 * dollar of prize money the game can hand one player — and the old top rung
 * wanted $49.2M, so places 1, 2 and 3 could not be occupied by anybody, ever.
 * The rungs had been re-scaled by RATIO through six anchorings and the top
 * was never once checked against what the purses can actually pay.
 *
 * The ladder now hangs off the reachable maximum instead of a ratio: rank 1
 * sits just under a perfect season, so winning everything makes you number
 * one — the only thing it could honestly mean — and the rungs below keep
 * their old SHAPE, rescaled onto the new top. Places 2–5 are now the band a
 * great season lands in rather than a band nothing lands in.
 *
 * DISPLAY ONLY. MONEY_CHECKS are untouched, no survival number moves, and no
 * re-derivation follows: this changes what the game CALLS your season, not
 * what the season is worth. Frozen board rows keep the rank they were
 * verified with (runs/verified.json stores it), which is the point of freezing.
 */
const LADDER: readonly (readonly [number, number])[] = [
  [1, 28_400_000], [3, 24_800_000], [5, 22_100_000], [10, 18_600_000],
  [20, 13_800_000], [30, 10_300_000], [40, 7_500_000], [50, 5_200_000],
  [60, 3_000_000], [72, 700_000],
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
 *
 * Re-measured at CALIBRATION-3.md from the $16.97M anchor's own 400
 * seasons (THE FULL SCORECARD: 36-hole weeks, full split, R=1.55):
 * medians $121k / $420k / $1.16M / $2.34M / $3.22M / $3.96M / $6.52M /
 * $7.56M / $8.77M / $9.78M / $12.40M / $13.32M / $14.41M / $16.97M.
 * The curve tilts LATE (0.54 -> 0.58 at 10, 0.84 -> 0.85 at 13, and the
 * whole spring shrinks as a share): the extension pays the equipped back
 * half of the season hardest, exactly as FIELD-SPREAD §9 predicted, so
 * the fall carries a larger share of a bigger season.
 *
 * Re-measured at SHARPNESS.md (27 Aug 2026) from the same 400 seasons as
 * that pass's calibration (seeds 700000+, the flattened ramp shipped):
 * medians $121k $420k $1.18M $2.38M $3.34M $4.04M $6.51M $7.59M $8.81M
 * $9.88M $12.64M $13.61M $14.48M $16.77M. The curve tilts back EARLIER by
 * one to three points from event 5 on (0.73 -> 0.75 at 11, 0.78 -> 0.81 at
 * 12) for the reason the pass exists: the free ramp now stops at event 10,
 * so the fall is worth slightly less of a season whose spring is
 * untouched. The season median moves $16.97M -> $16.77M, a 1.2% drift
 * INSIDE the $750k tolerance the ladder re-anchors quote — and the LADDER
 * is not re-scaled here anyway: it was re-anchored (PLAYTEST-NOTES-1 note
 * 9) to the reachable maximum, a perfect season's $28.9M of purse money,
 * and no purse moved in this pass.
 */
const SHARE = [0.01, 0.03, 0.07, 0.14, 0.20, 0.24, 0.39, 0.45, 0.53, 0.59, 0.75, 0.81, 0.86, 1.00]

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
 * season banks $16.97M under the finished world (drops modeled, stars in
 * the field, 36-hole weeks with the full tie split, season shop budget —
 * CALIBRATION-3.md), which sits 20th. Below that is a long tail of
 * players who miss cuts.
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
