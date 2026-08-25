import type { HoleSpec } from '../../sim/types' // same path as pinehollow.reference — adjust on integration

/**
 * ROCKDALE MUNICIPAL — eight played holes, par 31. Home of THE MUNI CHAMPIONSHIP.
 *
 * One-sentence identity: PAR IS EASY; THE CUT DOES NOT CARE ABOUT PAR. The
 * short course from COURSE-BRIEF §6 — every hole is reachable with owned
 * numbers, par is protected by small greens (13–14) and hazards parked exactly
 * where the good cards finish. The field goes low, so a place-based cut is
 * decided from the TOP: the spread is between birdie and tap-in birdie, and
 * between greed that pays and greed that hits the range fence. This course
 * exists to prove the cut-by-place system works at the low-scoring end.
 *
 * ORDER: front four (par 15, no par 5) splits the field on conversion — fence
 * risk on 1, hold-the-right-card on 2, fly-the-oak-or-not on 4. Back four
 * (par 16) is where a hot round becomes money: an eagleable five and two
 * green-light birdie holes around the pond.
 *
 * Tone: this is the course from the art pitch's "slightly sad, deeply loved"
 * file. The sadness is in the notes, never in the playability.
 *
 * Subtraction uses the FINISHING ladder (COURSE-BRIEF §2):
 * 277 / 255 / 208 / 170 / 133 / 105 / 94 / 70 / 58 / 55 / 35.
 */
export const ROCKDALE_MUNI: readonly HoleSpec[] = [
  {
    // Opening tee by the driving range. The corridor is wide enough that the
    // fence should be irrelevant; it is placed at +42 (inside the free OB
    // band) precisely so a pushed Bomb finds it anyway. Bomb leaves 28 and a
    // tap-in look; Long Iron + Full Wedge (shortens to 97) is the same birdie
    // putt with no story. Two roads to 3, one of them passes a fence.
    // v5 (REVIEW-4: Rockdale −1.66, needs difficulty not forks): fence in 3
    // more yards, now +22..+36 — the pin-aimed Bomb's right edge sits deeper
    // in it. Still only wrong by choice; Long Iron + Full Wedge stays dry.
    // Difficulty placed HERE because hole 1 starts fully funded (5.0) — its
    // focus shadow cannot starve anything.
    num: 1, par: 4, length: 305, name: 'Dew Sweepers',
    corridor: [{ at: 0, half: 26 }, { at: 200, half: 24 }, { at: 305, half: 21 }],
    greenRadius: 14, greenSide: 0,
    hazards: [
      { surface: 'ob', at: { down: 215, side: 29 }, rDown: 105, rSide: 7 },
    ],
    note: 'The range fence has eaten a thousand pushed drives. The fairway is wide enough to ignore it. Nobody does.',
  },
  {
    // v4 — one line changed, per REVIEW-3's own measurement: 150 → 205 tested
    // at gap 0.86, the best hole in the game. At 150 everything reached and
    // the ditch priced nothing; at 205 the only card that gets there is a
    // Long Iron at ±20 with its left band over the ditch — safe play refuses
    // the number and eats a shot, aggressive takes it and doesn't. Hazards,
    // green, name, note untouched. The muni's long one; every muni has one.
    num: 2, par: 3, length: 205, name: 'The Ballwasher',
    corridor: [{ at: 0, half: 16 }, { at: 150, half: 17 }],
    greenRadius: 13, greenSide: -10,
    hazards: [
      { surface: 'water', at: { down: 125, side: -26 }, rDown: 45, rSide: 6 },
    ],
    note: 'A ditch runs the left, and the pin sits ditch-side, because of course it does. The dry line putts from the fringe.',
  },
  {
    // The cart path runs the right side as an island of 'rough' inside the
    // corridor (§3: the one legitimate use of a placed rough hazard) — paved,
    // per the local rule, grass. Bomb drifting right finishes on it and pays
    // the rough tax from 53 out; Stinger leaves 75 for a Pitch or a shortened
    // Full Wedge. Gentle, but the path decides a stroke a week.
    num: 3, par: 4, length: 330, name: 'Cart Path Only',
    corridor: [{ at: 0, half: 25 }, { at: 210, half: 22 }, { at: 330, half: 20 }],
    greenRadius: 14, greenSide: 12,
    hazards: [
      { surface: 'rough', at: { down: 250, side: 20 }, rDown: 55, rSide: 6 },
    ],
    note: 'A cart path runs the right side. The local rules sheet says it is grass. Your ankles disagree.',
  },
  {
    // One oak, dead on the diagonal, 48 short of the green (line passes +15 at
    // down 252; oak spans +4..+28). Bomb flies it and leaves a 24-yard flop —
    // but a Bomb that comes out 14 short is IN the tree. Or play the two shots
    // everyone's uncle plays: 170 short of the oak, then an owned 133 flown
    // over it. Tap-in-with-a-story versus stress-free ten-footer — this is the
    // whole course in one hole.
    num: 4, par: 4, length: 300, name: 'The Oak',
    corridor: [{ at: 0, half: 24 }, { at: 190, half: 21 }, { at: 300, half: 18 }],
    greenRadius: 13, greenSide: 18,
    hazards: [
      { surface: 'trees', at: { down: 252, side: 16 }, rDown: 16, rSide: 12 },
    ],
    note: 'One oak, planted 1961, dead on the line. Fly it, or play the two shots everybody’s uncle plays.',
  },
  {
    // The only par 5, and it is eagleable: Bomb + Long Iron = 485, five short
    // of the centre, putting. The creek at 438–454 exists for the second shot
    // that was almost good, and for lay-ups that got brave (the classic
    // 255+170 stops 13 short of it). Stinger twice runs 20 past into the
    // collar. Everyone leaves with a four; the field sorts by who left with
    // a three.
    num: 5, par: 5, length: 490, name: 'The Only Five',
    corridor: [{ at: 0, half: 25 }, { at: 260, half: 22 }, { at: 400, half: 20 }, { at: 490, half: 19 }],
    greenRadius: 14, greenSide: 0,
    hazards: [
      { surface: 'water', at: { down: 446, side: 0 }, rDown: 8, rSide: 26 },
      { surface: 'bunker', at: { down: 470, side: 24 }, rDown: 13, rSide: 9 },
    ],
    note: 'Reachable with anything resembling your best. The creek is where second-best finishes.',
  },
  {
    // The pond is fully left of the direct line (spans −16..−44 where the line
    // runs −12) — it never punishes the aimed shot, only the left third of a
    // wide cone. Bomb leaves 48 (Splash shortens); Mid Iron leaves 155 — the
    // exact number Mid Iron −15 plays, at half cone, if the technique is in
    // hand. Stinger's shape is wrong here on purpose: its finish
    // line skirts the pond's edge and it cannot carry water.
    // v5 (REVIEW-4 hardening): the finger grows — 240–330, ten yards longer
    // through the landing zone. Difficulty lands on 6 and 7 deliberately:
    // their focus shadow falls on flat-by-design holes (7, 8), never on the
    // fork cluster at 2–5. Same fork as v3, more of the cone lives over it.
    num: 6, par: 4, length: 325, name: 'Retention Pond',
    corridor: [{ at: 0, half: 24 }, { at: 210, half: 21 }, { at: 325, half: 19 }],
    greenRadius: 13, greenSide: -14,
    hazards: [
      { surface: 'water', at: { down: 285, side: -30 }, rDown: 45, rSide: 7 },
    ],
    note: 'The pond grew a finger down the left of the landing zone. Aim away from it and the right rough has opinions.',
  },
  {
    // v5: second bunker left, 6 off the line, catching the mid irons' left
    // band — a bogey tail for the hardening pass, placed here because 7's
    // focus shadow lands on the flat-by-design 8th. Everything the player
    // owns is still almost right: 170 is
    // 10 past (chip from the collar), 133 is 27 short, and Mid Iron −15 is a
    // 155 that stops 5 short, putting. One bunker right, hollow behind for
    // free. The hole
    // never hurts anyone; it just refuses to give twos to the wrong club.
    num: 7, par: 3, length: 160, name: 'Winter Rules',
    corridor: [{ at: 0, half: 16 }, { at: 160, half: 17 }],
    greenRadius: 13, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 146, side: 12 }, rDown: 11, rSide: 9 },
      { surface: 'bunker', at: { down: 150, side: -14 }, rDown: 10, rSide: 8 },
    ],
    note: 'A green the size of a good rumour. Everything you own is almost the right number.',
  },
  {
    // The widest corridor on either course, a green light home. Bomb leaves
    // 43 (Splash shortens), Stinger leaves 65 (Pitch shortens): either way a
    // real birdie look to finish, which a scoring course owes the player. The
    // parking lot OB left is the only way to ruin it, and it takes a genuine
    // hook. End on a handshake, like Pine Hollow starts with one.
    num: 8, par: 4, length: 320, name: 'Last Call',
    corridor: [{ at: 0, half: 26 }, { at: 200, half: 24 }, { at: 320, half: 22 }],
    greenRadius: 14, greenSide: 0,
    hazards: [
      { surface: 'ob', at: { down: 250, side: -46 }, rDown: 90, rSide: 8 },
    ],
    note: 'Wide open, green light. The parking lot on the left maintains a windshield fund.',
  },
]

export const ROCKDALE_MUNI_PAR = ROCKDALE_MUNI.reduce((n, h) => n + h.par, 0) // 31
