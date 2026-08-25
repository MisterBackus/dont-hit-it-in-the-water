import type { HoleSpec } from '../../sim/types'

/**
 * PINE HOLLOW — eight played holes, par 32.
 *
 * Every hole is built around a gap in the starting bag (DESIGN.md §7.1).
 * The bag goes 265 / 235 / 185 / 160 / 135 / 120 / 85 / 55, so the 50-yard
 * hole between the 3-wood and the 5-iron is the course's main weapon.
 */
/**
 * PINE HOLLOW — eight played holes, par 32.
 *
 * ORDER MATTERS. The cut is judged after four holes, so the front four have to
 * be a real test or the cut never bites: with the easy holes first the player's
 * median through four sat at −1 all season and 92% of rounds survived event 1.
 *
 * So the front is two long par 4s and a mid par 3 — accuracy, where cone width
 * decides things. The back is the scoring stretch: two par 5s and a drivable
 * par 4, which is also a better finish to a round.
 *
 * Every hole is built around a gap in the starting distances (265 / 225 / 200 /
 * 165 / 130 / 105 / 70 / 40), so you rarely hold the number you actually want.
 */
export const PINE_HOLLOW: readonly HoleSpec[] = [
  {
    num: 1, par: 4, length: 380, name: 'Handshake',
    corridor: [{ at: 0, half: 24 }, { at: 260, half: 22 }, { at: 380, half: 20 }],
    greenRadius: 15, greenSide: 0,
    hazards: [{ surface: 'bunker', at: { down: 352, side: 30 }, rDown: 16, rSide: 11 }],
    note: 'Driver leaves a wedge. Nothing to think about — that is the point.',
  },
  {
    num: 2, par: 4, length: 442, name: 'Church Pew',
    corridor: [{ at: 0, half: 23 }, { at: 240, half: 17 }, { at: 340, half: 19 }, { at: 442, half: 20 }],
    greenRadius: 15, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 258, side: -32 }, rDown: 20, rSide: 11 },
      { surface: 'bunker', at: { down: 258, side: 32 }, rDown: 20, rSide: 11 },
      { surface: 'water', at: { down: 408, side: 33 }, rDown: 26, rSide: 17 },
    ],
    note: 'Driver leaves 177. Water short-right. This is the hole the design doc was written about.',
  },
  {
    num: 3, par: 3, length: 175, name: 'The Pond',
    corridor: [{ at: 0, half: 14 }, { at: 175, half: 16 }],
    greenRadius: 14, greenSide: 0,
    hazards: [
      { surface: 'water', at: { down: 168, side: -34 }, rDown: 36, rSide: 20 },
      { surface: 'bunker', at: { down: 150, side: 26 }, rDown: 14, rSide: 10 },
    ],
    note: 'You own 185 and 160. The hole is 175. Work it out.',
  },
  {
    num: 4, par: 4, length: 465, name: 'The Grind',
    corridor: [{ at: 0, half: 20 }, { at: 250, half: 14 }, { at: 380, half: 14 }, { at: 465, half: 17 }],
    greenRadius: 14, greenSide: 0,
    hazards: [
      { surface: 'trees', at: { down: 300, side: -44 }, rDown: 90, rSide: 18 },
      { surface: 'trees', at: { down: 300, side: 44 }, rDown: 90, rSide: 18 },
      { surface: 'bunker', at: { down: 440, side: -28 }, rDown: 16, rSide: 10 },
    ],
    note: 'Driver leaves 200, and you do not own 200. Long, narrow, unglamorous.',
  },
  {
    num: 5, par: 5, length: 520, name: 'Two Ways Home',
    corridor: [{ at: 0, half: 24 }, { at: 270, half: 20 }, { at: 430, half: 15 }, { at: 520, half: 18 }],
    greenRadius: 16, greenSide: 0,
    hazards: [
      { surface: 'water', at: { down: 486, side: -6 }, rDown: 17, rSide: 30 },
      { surface: 'bunker', at: { down: 300, side: 34 }, rDown: 18, rSide: 11 },
    ],
    note: 'Reachable in two if you are brave. Water across the front says otherwise.',
  },
  {
    num: 6, par: 4, length: 310, name: 'Have a Go',
    corridor: [{ at: 0, half: 22 }, { at: 190, half: 20 }, { at: 310, half: 19 }],
    greenRadius: 16, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 292, side: -34 }, rDown: 15, rSide: 9 },
      { surface: 'bunker', at: { down: 292, side: 34 }, rDown: 15, rSide: 9 },
      { surface: 'trees', at: { down: 235, side: -54 }, rDown: 40, rSide: 14 },
    ],
    note: 'Drivable. Also very much not drivable. Ripping one is 305 yards with fifty of scatter.',
  },
  {
    num: 7, par: 3, length: 210, name: 'The Long One',
    corridor: [{ at: 0, half: 15 }, { at: 210, half: 17 }],
    greenRadius: 15, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 186, side: -27 }, rDown: 18, rSide: 11 },
      { surface: 'bunker', at: { down: 186, side: 27 }, rDown: 18, rSide: 11 },
    ],
    note: '235 is too much, 185 is not enough. There is no good answer, only a least bad one.',
  },
  {
    num: 8, par: 5, length: 545, name: 'Home',
    corridor: [{ at: 0, half: 23 }, { at: 280, half: 18 }, { at: 450, half: 16 }, { at: 545, half: 19 }],
    greenRadius: 16, greenSide: -4,
    hazards: [
      { surface: 'water', at: { down: 430, side: 42 }, rDown: 130, rSide: 24 },
      { surface: 'bunker', at: { down: 520, side: -30 }, rDown: 17, rSide: 11 },
    ],
    note: 'Water the whole way down the right. Whatever you need, you need it now.',
  },
]

export const COURSE_PAR = PINE_HOLLOW.reduce((n, h) => n + h.par, 0)
