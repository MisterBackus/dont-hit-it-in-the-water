import type { HoleSpec } from '../../sim/types' // same path as pinehollow.reference — adjust on integration

/**
 * SALT FLATS — eight played holes, par 32. Home of THE OPEN AT SALT FLATS.
 * The unfair major. Majors only.
 *
 * One-sentence identity: EVERY HONEST ANSWER IS HALF A CLUB SHORT.
 *
 * Designed the way round REVIEW-3 specifies: distances first, hazards second.
 * Every fork hole asks a number that sits just past the tight fits and just
 * under a wide-cone card — reaching is in doubt before a single hazard
 * exists — and then the aim band prices the card the player had to stretch
 * for. Bar: five of eight above 60% split / 0.35 gap. The reach-cost table
 * for every hole is in COURSE-CHANGES-3.md, written before the hazards were.
 *
 * The world: no trees, no water, no shade. Bends of ±12 at most — this is
 * the exposed course, the anti-Cottonwood. Its surfaces are the pan ('ob':
 * hardpan salt, ball gone), the crust ('deep': crystallized scrub that
 * swallows running shots), and blown-out waste bunkers. Low shots obey the
 * pitch-point rule and the crust is rest-judged — every crossing below is
 * built on that distinction, and every crossing is flyable by a wedge from
 * short of it, so the no-softlock record holds by construction.
 *
 * Order: the front four is four forks (par 15, no par 5). The back has the
 * course's one mercy at 7 — flat on purpose, per the Rockdale-8 principle
 * that not every hole must fork — because four hours of interrogation with
 * no glass of water is a tax, not a test.
 */
export const SALT_FLATS: readonly HoleSpec[] = [
    // v5 (REVIEW-4: 0.12 — the one Salt Flats hole worth touching before the
    // funded re-read). Diagnosis: with the crust at 232–258 the naked Bomb
    // carried it with 7 to spare, so every appetite hit the same drive and
    // the "fork" was one line wearing three hats. The belt moved 12 deeper:
    // it now ends at 270 and the Bomb carries 265 ± 13 — the naked carry is
    // genuinely in doubt. Buying certainty costs a technique (+15 loose
    // clears, wider, into the pan's price; +40 clears easily at double
    // width), and the player HAS the focus to buy it — this is hole 1, the
    // one tee where everyone arrives rich. Lay with the Long Iron (208,
    // well short) and pay a stroke instead. Pay in focus, or pay in strokes,
    // or gamble: the first swing of the tournament states the whole course.
    num: 1, par: 4, length: 445, name: 'The Crossing',
    corridor: [{ at: 0, half: 24 }, { at: 230, half: 20 }, { at: 300, half: 18 }, { at: 445, half: 17 }],
    greenRadius: 15, greenSide: 0,
    hazards: [
      { surface: 'deep', at: { down: 257, side: 0 }, rDown: 13, rSide: 55 },
      { surface: 'ob', at: { down: 285, side: 30 }, rDown: 60, rSide: 7 },
    ],
    note: 'The crust ends at two-seventy and the Bomb carries two-sixty-five. Buy the difference or lay up and pay in strokes.',
  },
  {
    // Max-length par 4, the Stinger-refused shape. Bomb leaves 193 — the
    // Long Iron arrives 15 past, wobbling, or LI−15 fits tight if held.
    // Stinger leaves 215 and NOTHING reaches: lay to 45 and wedge, a stroke
    // by structure. The pan runs the right of the stretched approach, 16 off
    // the line — pricing the wide card's push; bailing left putts from the
    // low-side fringe.
    num: 2, par: 4, length: 470, name: 'The Question',
    corridor: [{ at: 0, half: 23 }, { at: 255, half: 19 }, { at: 380, half: 15 }, { at: 470, half: 16 }],
    greenRadius: 15, greenSide: 12,
    hazards: [
      { surface: 'ob', at: { down: 430, side: 27 }, rDown: 50, rSide: 7 },
    ],
    note: 'Two-fifteen in after the safe drive. Count your cards again. Now count them after the Bomb.',
  },
  {
    // 218: past the comfortable Long Iron (10 short, fringe at best), under
    // the loose LI+15 (5 past, wider cone) — reaching is a stretch whichever
    // way it's taken, and laying up to 48 is a real answer. The waste
    // bunkers sit 24 off the line, outside the aim band, priced only into
    // the stretched card's edges. Green 13 — major glass.
    num: 3, par: 3, length: 218, name: 'The Kiln',
    corridor: [{ at: 0, half: 15 }, { at: 218, half: 16 }],
    greenRadius: 13, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 194, side: -24 }, rDown: 16, rSide: 10 },
      { surface: 'bunker', at: { down: 194, side: 24 }, rDown: 16, rSide: 10 },
    ],
    note: 'Two-eighteen through the shimmer. Everything you own is short of it. Almost everything.',
  },
  {
    // The second crossing, moved to 195–225 so it gates MORE: the Long Iron
    // pitches at 200, into it — refused. Stinger's 225 pitch clips the far
    // edge — refused. Only the Bomb carries, and only the Mid Iron (170,
    // finishing 25 short of the belt) lays honestly. Carry: a 163 approach,
    // Mid Iron 7 past, comfortable — the reward is real. Lay: 270 to go,
    // Stinger then a flop. The pan left of the Bomb zone prices the carry's
    // pull. Same question as the 1st with fewer exits — no man's land is
    // wider here.
    num: 4, par: 4, length: 440, name: 'No Man\'s Land',
    corridor: [{ at: 0, half: 23 }, { at: 190, half: 19 }, { at: 300, half: 17 }, { at: 440, half: 17 }],
    greenRadius: 14, greenSide: -10,
    hazards: [
      { surface: 'deep', at: { down: 210, side: -2 }, rDown: 15, rSide: 55 },
      { surface: 'ob', at: { down: 255, side: -28 }, rDown: 55, rSide: 7 },
    ],
    note: 'The crust starts at one-ninety-five and eats everything that lands in it. The Bomb flies it. The rest of the bag lays up and thinks.',
  },
  {
    // The stretch five. After the Bomb, 219 remain: every tight play refuses;
    // the loose Long Iron (+15, 223, wider cone) arrives 4 past — the ONLY
    // second shot that gets home, and the pan flanks its right band at the
    // green. Refuse and it's 170–49–putt, a birdie bought with three good
    // swings instead of one brave one. Stinger–Stinger runs 14 through the
    // back — legal, dull, collar. Not eagleable by design: this major pays
    // the stretch, not the slam.
    num: 5, par: 5, length: 496, name: 'Almost',
    corridor: [{ at: 0, half: 23 }, { at: 270, half: 18 }, { at: 400, half: 16 }, { at: 496, half: 17 }],
    greenRadius: 15, greenSide: 0,
    hazards: [
      { surface: 'ob', at: { down: 460, side: 24 }, rDown: 45, rSide: 7 },
      { surface: 'bunker', at: { down: 470, side: -20 }, rDown: 14, rSide: 10 },
    ],
    note: 'Reachable with your loosest long iron and the nerve to swing it. The pan collects the ones that leaked.',
  },
  {
    // The 2nd again, mirrored and meaner: same max length, bend flipped, pan
    // on the LEFT of the stretched approach, green down to 13, corridor a
    // yard tighter where the Bomb lands. The same question asked louder,
    // late in the round, when the answer costs more. A major is allowed one
    // echo; that is what makes it an interrogation.
    num: 6, par: 4, length: 470, name: 'The Echo',
    corridor: [{ at: 0, half: 23 }, { at: 255, half: 18 }, { at: 380, half: 14 }, { at: 470, half: 15 }],
    greenRadius: 13, greenSide: -12,
    hazards: [
      { surface: 'ob', at: { down: 430, side: -27 }, rDown: 50, rSide: 7 },
    ],
    note: 'You have seen this hole before. It remembers how you played it.',
  },
  {
    // The mercy. 150, everything reaches, bunkers politely wide, and the
    // course gives one hole away — flat on purpose, per the Rockdale-8
    // principle. Deliberate pacing: four hours of interrogation with no
    // water is a tax. This is the sip.
    num: 7, par: 3, length: 150, name: 'Respite',
    corridor: [{ at: 0, half: 16 }, { at: 150, half: 17 }],
    greenRadius: 13, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 135, side: -18 }, rDown: 10, rSide: 8 },
      { surface: 'bunker', at: { down: 135, side: 18 }, rDown: 10, rSide: 8 },
    ],
    note: 'One-fifty and nothing hidden. The only thing this course gives away. Say thank you.',
  },
  {
    // The closer. Crust crosses at 489–515, so the third must FLY — wedges
    // carry it, the Bump and Run is refused (rest-judged), and the honest
    // three is Bomb, Long Iron to 485 (four short of the crust), wedge over.
    // The gamble: Bomb then Stinger — pitches at 502, but the crust judges
    // rest, and 532 is past it: 13 left, putting for the tournament. The
    // corridor narrows to 14 where that Stinger runs. Reach, or arrive the
    // long way and putt for the same number everyone at home thinks is easy.
    num: 8, par: 5, length: 545, name: 'The Verdict',
    corridor: [{ at: 0, half: 23 }, { at: 280, half: 19 }, { at: 450, half: 14 }, { at: 545, half: 17 }],
    greenRadius: 15, greenSide: 8,
    hazards: [
      { surface: 'deep', at: { down: 502, side: 4 }, rDown: 13, rSide: 50 },
      { surface: 'bunker', at: { down: 528, side: -22 }, rDown: 15, rSide: 10 },
    ],
    note: 'The crust crosses one last time, sixty short of home. Fly it or explain yourself.',
  },
]

export const SALT_FLATS_PAR = SALT_FLATS.reduce((n, h) => n + h.par, 0) // 32
