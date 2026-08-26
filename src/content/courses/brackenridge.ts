import type { HoleSpec } from '../../sim/types'

/**
 * BRACKEN RIDGE — eight played holes, par 32. Home of THE PGA AT BRACKEN
 * RIDGE (event 11) and the Bracken Ridge Classic (event 8) — the named venue
 * that wore Cottonwood's course all season, finally given its own ground.
 *
 * One-sentence identity: HOW MUCH FAIRWAY DO YOU NEED? The width course.
 * Every other course prices decisions with hazard ellipses; Bracken Ridge
 * prices them with the corridor itself — pinches at the stretch card's
 * landing zone, width at the lay-up's, and the free surface bands (rough at
 * +12, deep at +26, trees at +40; geometry.ts) doing the collecting. The
 * question on every tee is your cone width against the corridor width AT THE
 * DISTANCE YOU CHOSE.
 *
 * The Cottonwood lesson, applied (COURSE-SLATE.md §5): corridor pricing is
 * symmetric, and symmetric punishment produced Cottonwood's variance-without-
 * decisions problem. So the pinches sit only at CHOSEN landing zones (the
 * stretch card's finish, never the whole hole), every pinch has a wide
 * alternative at a different distance, and the fern is the price band, not
 * the trees. Placed tree ellipses appear once, on a diagonal, cleared by
 * rest margin at every jitter (law 4: no dice-doubt margins).
 *
 * REGISTERED RISK, named plainly: corridor pricing is this slate's least-
 * proven generator. If Bracken measures like Cottonwood (spread without
 * decisions), the diagnosis is that pinches punish unchosen edges after all,
 * and the fix is wider pinches with fern promoted to the aim band as
 * parallel strips — Generator B wearing bark.
 *
 * The world: old growth and fern. Needle-carpet avenues, quick and quiet.
 * The deep is the bracken itself — the course is named after its hazard, and
 * the notes let the player work that out. The stands are walls. One creek,
 * crossing once. No OB — the forest does not need it.
 *
 * Tier: hard (registered 'brutal'). Never the opener, not check-week-safe.
 * Field-response coupling shipped before this course entered the pool, per
 * Salt Flats' schedule caveat.
 * ORDER: ask, fund, ask-ask, breathe, ask, fund, ask — no four-fork chain
 * (the Salt Flats lesson).
 *
 * REVIEW-7: ruled UNDER-WEIGHT for the major-capable flag it carries; the
 * strip itself is blocked by the world (schedule.test's majors-invariant
 * plus THE PGA's pin — see the registry comment and REVIEW-7 §3.3, where
 * the owner decision and the earn-back criterion live). v4 spent the
 * slate's fern-to-aim-band fallback in full across 1/4/8 plus a lengthened
 * Stand: +0.29 → +0.55 (N=400) / +0.51 (N=800) against Cottonwood's +0.46
 * — four REAL holds, the mean does not clear "clearly harder." Four
 * hardening passes across two designers now agree: the corridor prices the
 * timid (safe +3.5, the pool's largest timidity tax) and cannot charge a
 * depth-reading mean-optimizer. The next stroke of difficulty here must
 * come from a different generator — the ladder, not the corridor.
 */
export const BRACKEN_RIDGE: readonly HoleSpec[] = [
  {
    // The thesis at survivable stakes, fully funded by arrival. Corridor 26
    // wide to 244, pinched to 15 at 262–294. The Bomb rests inside the pinch
    // with its ±32 edges in fern; leaves 111 (wedge). The Stinger rests 255,
    // short of the pinch in full width — leaves 133, owned. Wedge from the
    // gauntlet, or short iron from the meadow.
    // v2 (course measured +0.04 mixed against a predicted +2.3 — the honest
    // ladder moved under the depth engine, and the corridor priced softer
    // than the bet; CHANGES-7 carries the full accounting). The pinch
    // tightens 15 → 14 and the approach half 20 → 18: hardening placed at
    // the front, where hole 1 arrives fully funded and shadows nothing.
    // v3 (0.27/57): pinch 14 → 13, green 15 → 14. Last iteration; if the
    // opener stays "some" it stays — the thesis is stated either way.
    // v4 (REVIEW-7, the major-weight pass): the slate's named fallback,
    // spent at last — fern promoted to the aim band. Measured at 0.35/58
    // with mixed paying −0.20: the pinch's price was the ROUGH band (0.25
    // of a stroke of eval), which a mean-planner threads for free. The two
    // strips below turn the neck's flanks from rough into bracken proper —
    // same geometry, deeper price, the fern finally doing what the note
    // always claimed. Stinger still lays 255, short of everything.
    // Predicted before measurement: gap 0.35–0.45, split 60–66, mixed
    // −0.10 ± 0.05. Measured 0.33/61, mixed −0.17 — split arrived, gap a
    // knife-edge under. Pass 2: the strips grow into the aim band proper
    // (side 11..25 — the neck now effectively 11 through the fern), the
    // full version of the slate's fallback. Predicted: gap 0.35–0.45,
    // split 60–66, mixed −0.12..−0.02. Measured 0.34/61 (N=400), 0.35/64
    // (N=800) — a knife-edge that clears at the larger sample; mixed
    // −0.16/−0.12. Recorded as the knife-edge it is.
    num: 1, par: 4, length: 388, name: 'First Growth',
    corridor: [
      { at: 0, half: 26 }, { at: 244, half: 26 }, { at: 262, half: 13 },
      { at: 294, half: 13 }, { at: 312, half: 22 }, { at: 388, half: 18 },
    ],
    greenRadius: 14, greenSide: 0,
    hazards: [
      { surface: 'deep', at: { down: 278, side: -18 }, rDown: 16, rSide: 7 },
      { surface: 'deep', at: { down: 278, side: 18 }, rDown: 16, rSide: 7 },
    ],
    note: 'The avenue narrows where the big drive finishes, and the fern does not give balls back so much as archive them.',
  },
  {
    // Funding round for 3 and 4. Width everywhere; Bomb leaves 81, Stinger 103.
    // v2 (course a stroke kinder than a major should be): 344 → 358. Still
    // the fund — the leaves are still wedges — it just stops being charity.
    // v3 (REVIEW-7): green 15 → 14. Still the fund — the wedges still hit
    // it — a major's charity should still want the wedge struck properly.
    // Predicted before measurement: mixed −0.28 → −0.22..−0.16, stays flat.
    num: 2, par: 4, length: 358, name: 'The Clearing',
    corridor: [{ at: 0, half: 27 }, { at: 230, half: 26 }, { at: 358, half: 23 }],
    greenRadius: 14, greenSide: 0,
    hazards: [],
    note: 'A clearing wide enough to forgive most opinions. The forest is letting you breathe on purpose.',
  },
  {
    // Reach-or-lay where the price is width itself, not sand. Long Iron four
    // short at pitch, past at rest, ±20 — and the corridor closes to 13
    // through the last 30 yards, so the stretch card's edges hang in fern
    // both sides. Mid Iron lays to 42 and chips from width. REAL candidate.
    num: 3, par: 3, length: 212, name: 'The Keyhole',
    corridor: [{ at: 0, half: 15 }, { at: 178, half: 15 }, { at: 185, half: 13 }, { at: 212, half: 13 }],
    greenRadius: 13, greenSide: 0,
    hazards: [],
    note: 'Two-twelve through a gap the trees agreed on. Your long iron is wider than their agreement.',
  },
  {
    // The Grind's structure with the corridor doing the pricing. The pinch
    // sits at the Bomb zone, 14 wide at 250–290. Bomb leaves 191: Mid Iron
    // 21 short, Long Iron 17 past — neither on; the Smooth Long Iron fits at
    // 193 for a focus. Stinger leaves 213: Long Iron free and on — the shape
    // still forks when the tee shot is priced (Grind precedent).
    // REAL candidate.
    // v2 (REVIEW-7, the major-weight pass): fern promoted to the pinch's
    // flanks — the strips turn the neck's rough band (0.25 of eval, the
    // price a mean-planner shrugs at) into bracken. The fork is untouched;
    // the thread just costs what the note says it costs. Predicted before
    // measurement: mixed +0.58 → +0.65..+0.80, gap 0.42–0.55, split ≥ 62.
    // Measured +0.59, 0.50/64 — the strips bought ONE hundredth: the
    // depth-reading planner threads a 14-yard neck without touching the
    // flanks. The fork holds; the fallback's mean claim is dead (REVIEW-7).
    num: 4, par: 4, length: 468, name: 'The Long Quiet',
    corridor: [
      { at: 0, half: 22 }, { at: 238, half: 22 }, { at: 250, half: 14 },
      { at: 290, half: 14 }, { at: 302, half: 18 }, { at: 468, half: 17 },
    ],
    greenRadius: 14, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 452, side: -20 }, rDown: 10, rSide: 6 },
      { surface: 'deep', at: { down: 270, side: -19 }, rDown: 20, rSide: 5 },
      { surface: 'deep', at: { down: 270, side: 19 }, rDown: 20, rSide: 5 },
    ],
    note: 'Four-sixty-eight and nobody talking. The needle carpet is quick, the neck is fourteen yards, and your driver is not.',
  },
  {
    // Cathedral golf: the nave is wide, the crossing is priced, every route
    // is legal and none is free. The creek crosses 498–512. Bomb+LI stops
    // 475–495 — dry — and the wedge cuts to 55 and flies. Bomb+Bomb pitches
    // past the far bank, dry. Stinger+Stinger rests in the creek (the Walk
    // In precedent: the boring play played twice drowns, and the tail is
    // drawn saying so). Stinger+MI leaves 115, the long safe road.
    // v2 (0.22/56 and a course a stroke too kind for a major): the nave
    // narrows — 25/22/20/19 → 24/20/18/17 — so the width question is asked
    // on the way to the ford, not just at it.
    // v3 (0.40/57 — gap arrived with the narrower nave, split three shy):
    // the creek widens a yard each way (497–513) and the green tightens
    // 15 → 14, so the four seconds stop agreeing. Last iteration either way.
    // v4 (REVIEW-7): green 14 → 13 — the Spring precedent (a green
    // tightening turned the mercy into a fork). The creek is untouched:
    // the Bomb+LI road's dry margin is a designed fact, not a dice-doubt
    // dial. Predicted before measurement: mixed +0.18 → +0.25..+0.35,
    // gap 0.38 → 0.40 ± 0.05, split 58 → 60 ± 3.
    num: 5, par: 5, length: 540, name: 'The Ford',
    corridor: [{ at: 0, half: 24 }, { at: 270, half: 20 }, { at: 430, half: 18 }, { at: 540, half: 17 }],
    greenRadius: 13, greenSide: 0,
    hazards: [
      { surface: 'water', at: { down: 505, side: 0 }, rDown: 8, rSide: 45 },
    ],
    note: 'The one creek on the property, crossed exactly where your second wants to finish. The forest planned this.',
  },
  {
    // The Oak transplanted to the forest it always belonged in. A stand of
    // pines at 234–262 on the diagonal (green offset +16). The Bomb clears
    // it at every jitter — pitch through the canopy line still runs out past
    // the far edge, rest margin by construction — and leaves 53. Mid Iron
    // lays 64 short of it, leaves 160, and flies an owned mid-iron over the
    // top (trees judge rest, not flight). REAL candidate.
    // v2 (measured 0.14/73 — the Sentinel's exact failure: split high, gap
    // gone, because an r14 green made every route a birdie look). The
    // Sentinel's exact fix: green 14 → 13, the stand grown wider (side
    // −3..+25) so "around" genuinely means around. Depth margin untouched —
    // the Bomb still clears the far edge at every jitter.
    // v3 (REVIEW-7): 330 → 348. The v2 miss (0.23/73) was CHANGES-7's own
    // finding 1 — at 330 the around-route's leave was an owned 160-class
    // iron, so both routes ended in the same convert-it shot class. At 348
    // the lay leaves 179: nothing owned fits (MI 14 short, LI 29 past) and
    // the approach becomes a paid or loose fit — MI+Extra at 185, Choke LI
    // at 183, Smooth LI at 193 — while the Bomb's fly-over still leaves an
    // owned 71-yard cut-down wedge. Different shot CLASSES, the batch's own
    // law. The stand itself does not move; the Bomb clears its far edge at
    // every jitter exactly as before. Predicted before measurement: gap
    // 0.32–0.48, split ≥ 65, mixed −0.16 → 0.00..+0.15. Measured 0.27/70,
    // mixed −0.03 — moved, still short. Pass 2: the stand grows toward the
    // pull side (rSide 14 → 17, side −6..28) so the fly-over's left edge
    // is finally in the canopy; the rest margin at the far edge holds by
    // the same construction (pitch + full tree roll clears 262 at every
    // jitter). Predicted: gap 0.30–0.42, split ≥ 66, mixed −0.02..+0.10.
    // Measured 0.26/70 (N=400), 0.25/70 (N=800), mixed −0.02..−0.01: the
    // lengthening moved the hole (0.23 → 0.26, mixed −0.16 → −0.02) and
    // the class-gap fix stalled short of the bar, twice. Recorded miss;
    // iteration budget spent. If Palmetto 4 gets the same medicine, cite
    // this corpse first.
    num: 6, par: 4, length: 348, name: 'The Stand',
    corridor: [{ at: 0, half: 24 }, { at: 215, half: 22 }, { at: 348, half: 19 }],
    greenRadius: 13, greenSide: 16,
    hazards: [
      { surface: 'trees', at: { down: 248, side: 11 }, rDown: 14, rSide: 17 },
    ],
    note: 'The stand was here first and intends to be here last. Over it is a chip. Around it is a mid-iron and some humility.',
  },
  {
    // The mercy, funding the closer — four hours of trees and the course
    // pours one drink. Everything reaches; the fern waits politely behind.
    // v2: green 14 → 13 — still the mercy, still funds the closer; a major's
    // gift should still want a mid-iron actually struck.
    num: 7, par: 3, length: 168, name: 'The Spring',
    corridor: [{ at: 0, half: 16 }, { at: 168, half: 17 }],
    greenRadius: 13, greenSide: 0,
    hazards: [],
    note: 'A spring, a bench, a hole with no opinions. Drink. The last one has several.',
  },
  {
    // The last question is the first question, with the tournament on it.
    // The corridor narrows to 13 from 500 in. Bomb+Stinger: 532, sixteen
    // short, chip from the gauntlet mouth. Bomb+MI: leaves 101, wedge from
    // width. Bomb+Bomb: threading ±32 through the neck for the eagle look.
    // v2 (REVIEW-7): green 15 → 14. The fork was already the best five in
    // the game (0.56/65); the green was the only r15 target left on a
    // course calling itself a major. Predicted before measurement: mixed
    // −0.04 → +0.02..+0.12, gap 0.45–0.58, split ≥ 62 — REAL holds.
    // Measured 0.51/65, mixed 0.00. Pass 2: fern to the gauntlet's flanks
    // (side 14..24 along 500–544) — the eagle thread and the runner both
    // pay bracken for a leaked edge; the Bomb+MI wedge road flies over all
    // of it. Predicted: mixed +0.05..+0.18, gap 0.42–0.55, split ≥ 62.
    // Measured mixed +0.01, 0.53/65 (N=400) · +0.00, 0.44/66 (N=800) —
    // REAL holds, the mean claim missed like H4's. Same lesson.
    num: 8, par: 5, length: 548, name: 'Cathedral',
    corridor: [
      { at: 0, half: 23 }, { at: 280, half: 20 }, { at: 455, half: 20 },
      { at: 500, half: 13 }, { at: 548, half: 13 },
    ],
    greenRadius: 14, greenSide: 0,
    hazards: [
      { surface: 'deep', at: { down: 522, side: -19 }, rDown: 22, rSide: 5 },
      { surface: 'deep', at: { down: 522, side: 19 }, rDown: 22, rSide: 5 },
    ],
    note: 'The trees close in for the finish like a congregation. How much fairway do you need? Answer with the round on it.',
  },
]

export const BRACKEN_RIDGE_PAR = BRACKEN_RIDGE.reduce((n, h) => n + h.par, 0) // 32
