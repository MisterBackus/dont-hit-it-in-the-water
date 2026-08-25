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
 * Tier: hard (registered 'brutal'). MAJOR-CAPABLE. Never the opener, not
 * check-week-safe. Field-response coupling shipped before this course
 * entered the pool, per Salt Flats' schedule caveat.
 * ORDER: ask, fund, ask-ask, breathe, ask, fund, ask — no four-fork chain
 * (the Salt Flats lesson).
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
    num: 1, par: 4, length: 388, name: 'First Growth',
    corridor: [
      { at: 0, half: 26 }, { at: 244, half: 26 }, { at: 262, half: 13 },
      { at: 294, half: 13 }, { at: 312, half: 22 }, { at: 388, half: 18 },
    ],
    greenRadius: 14, greenSide: 0,
    hazards: [],
    note: 'The avenue narrows where the big drive finishes, and the fern does not give balls back so much as archive them.',
  },
  {
    // Funding round for 3 and 4. Width everywhere; Bomb leaves 81, Stinger 103.
    // v2 (course a stroke kinder than a major should be): 344 → 358. Still
    // the fund — the leaves are still wedges — it just stops being charity.
    num: 2, par: 4, length: 358, name: 'The Clearing',
    corridor: [{ at: 0, half: 27 }, { at: 230, half: 26 }, { at: 358, half: 23 }],
    greenRadius: 15, greenSide: 0,
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
    num: 4, par: 4, length: 468, name: 'The Long Quiet',
    corridor: [
      { at: 0, half: 22 }, { at: 238, half: 22 }, { at: 250, half: 14 },
      { at: 290, half: 14 }, { at: 302, half: 18 }, { at: 468, half: 17 },
    ],
    greenRadius: 14, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 452, side: -20 }, rDown: 10, rSide: 6 },
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
    num: 5, par: 5, length: 540, name: 'The Ford',
    corridor: [{ at: 0, half: 24 }, { at: 270, half: 20 }, { at: 430, half: 18 }, { at: 540, half: 17 }],
    greenRadius: 14, greenSide: 0,
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
    num: 6, par: 4, length: 330, name: 'The Stand',
    corridor: [{ at: 0, half: 24 }, { at: 215, half: 22 }, { at: 330, half: 19 }],
    greenRadius: 13, greenSide: 16,
    hazards: [
      { surface: 'trees', at: { down: 248, side: 11 }, rDown: 14, rSide: 14 },
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
    num: 8, par: 5, length: 548, name: 'Cathedral',
    corridor: [
      { at: 0, half: 23 }, { at: 280, half: 20 }, { at: 455, half: 20 },
      { at: 500, half: 13 }, { at: 548, half: 13 },
    ],
    greenRadius: 15, greenSide: 0,
    hazards: [],
    note: 'The trees close in for the finish like a congregation. How much fairway do you need? Answer with the round on it.',
  },
]

export const BRACKEN_RIDGE_PAR = BRACKEN_RIDGE.reduce((n, h) => n + h.par, 0) // 32
