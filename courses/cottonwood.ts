import type { HoleSpec } from '../../sim/types' // same path as pinehollow.reference — adjust on integration

/**
 * COTTONWOOD — eight played holes, par 32. Home of the Cottonwood Invitational.
 *
 * One-sentence identity: THE STRAIGHT LINE IS A LIE. Every green but one sits
 * off the tee line (greenSide from −35 to +30), so the direct line runs
 * diagonally across the corridor and whatever stands on that diagonal is
 * unavoidable — the engine's only dogleg, per COURSE-BRIEF §6. Pine Hollow asks
 * "do you own the number?"; Cottonwood asks "do you trust the line?"
 *
 * ORDER: front four (par 15, no par 5) carries the cut spread — an EV split on
 * 2, a hold-the-right-card birdie on 3, an aggressive/safe fork on 4. The back
 * four (par 17) is the scoring stretch: two reachable fives and a tempter.
 *
 * All subtraction in the notes uses the FINISHING ladder from COURSE-BRIEF §2:
 * 277 / 255 / 208 / 170 / 133 / 105 / 94 / 70 / 58 / 55 / 35.
 * Diagonal length correction is ≤ 2 yards everywhere (S²/2L) and is ignored.
 */
export const COTTONWOOD: readonly HoleSpec[] = [
  {
    // v2 (COURSE-REVIEW: was flat 0.15). Lengthened 390 → 415 so the two tee
    // shots leave DIFFERENT qualities of number: Bomb leaves 139 (owned 133,
    // 6 short) but its right band (+25..+47) lives in the corner bunker;
    // Stinger is safe off the tee and leaves 161 — the 170/133 gap. Aggression
    // buys the clean second; safety buys an awkward one. Still the opener, but
    // now the lesson has a bill.
    num: 1, par: 4, length: 415, name: 'The Lean',
    corridor: [{ at: 0, half: 26 }, { at: 255, half: 23 }, { at: 415, half: 19 }],
    greenRadius: 15, greenSide: 22,
    hazards: [
      { surface: 'bunker', at: { down: 270, side: 34 }, rDown: 16, rSide: 9 },
    ],
    note: 'The green sits twenty-two yards right of where you are pointed. First of eight lessons.',
  },
  {
    // v4 — the fork moved to the tee, per REVIEW-3: at 460 both realistic
    // approaches reached, so no hazard could save it (0.07 → 0.13 → 0.12
    // across three tries). Lengthened to the par-4 limit: Bomb leaves 194,
    // which the Long Iron reaches (14 past, wobbling) and LI−15 fits at a
    // tight 193 if held; Stinger leaves 216, which NOTHING reaches — the
    // safe drive now buys a lay-up and a wedge, a stroke by structure. The
    // ditch stays where it was, pricing the stretched approach's left band.
    // Honest flag for the harness: the LI−15 fit softens the aggressive
    // line's risk — if the fork underperforms, that technique's focus price
    // is what's carrying it.
    num: 2, par: 4, length: 470, name: 'Wrong Number',
    corridor: [{ at: 0, half: 24 }, { at: 255, half: 20 }, { at: 360, half: 20 }, { at: 470, half: 19 }],
    greenRadius: 15, greenSide: -30,
    hazards: [
      { surface: 'water', at: { down: 400, side: -45 }, rDown: 70, rSide: 7 },
      { surface: 'bunker', at: { down: 252, side: 26 }, rDown: 17, rSide: 10 },
    ],
    note: 'Bomb leaves 194, which might reach. Stinger leaves 216, which will not. The ditch has no preference.',
  },
  {
    // v5 — REVIEW-4's instructive pair: same 205, same par, Ballwasher 0.88
    // and Postcard 0.21, because Ballwasher's ditch prices the stretch card's
    // cone and Postcard's guards sat 25 off the line and 30 short — trying
    // cost nothing. Now the price is at the green, inside the aim band, on
    // both of the Long Iron's edges: water right (harsh), sand left (soft).
    // Flag-hunt with the ±20 card and both bands are live; bail into the
    // lay-up and chip dry forever. Reach in doubt + priced stretch +
    // (post-focus-fix) a player who can afford it: all three conditions, on
    // purpose, for the first time.
    num: 3, par: 3, length: 205, name: 'Postcard',
    corridor: [{ at: 0, half: 15 }, { at: 205, half: 16 }],
    greenRadius: 14, greenSide: 18,
    hazards: [
      { surface: 'water', at: { down: 198, side: 34 }, rDown: 25, rSide: 8 },
      { surface: 'bunker', at: { down: 192, side: 1 }, rDown: 14, rSide: 9 },
    ],
    note: 'The Long Iron reaches. So does the pond. Laying up to a chip has never once been embarrassing.',
  },
  {
    // The signature. A copse of cottonwoods stands ON the direct line at the
    // corner (line passes side −23 at down 228; copse spans −43..−13). Bomb
    // clears it and leaves 73 (Pitch). Mid Iron stops short of it and leaves
    // ~181 — the gap again, so the safe route still contains a decision. The
    // trap: Stinger's 255 finish is INSIDE the copse. The obvious safe card is
    // the wrong one, and the note warns exactly once.
    num: 4, par: 4, length: 350, name: 'The Cottonwoods',
    corridor: [{ at: 0, half: 25 }, { at: 200, half: 22 }, { at: 280, half: 19 }, { at: 350, half: 17 }],
    greenRadius: 15, greenSide: -35,
    hazards: [
      { surface: 'trees', at: { down: 228, side: -28 }, rDown: 42, rSide: 15 },
    ],
    note: 'The cottonwoods stand on the straight line, because the straight line is wrong. Old trees know things.',
  },
  {
    // Scoring stretch opens. Genuinely reachable: Bomb + Stinger = 532, two
    // past the centre, eagle putt — but the pond is set just right of the bent
    // line (starts +22 where the line runs +19) so only the pushed second
    // drowns. The sensible three (255+170, wedge from 105) is a clean birdie
    // look. Reward scales with commitment, not luck.
    num: 5, par: 5, length: 530, name: 'Green Light',
    corridor: [{ at: 0, half: 25 }, { at: 270, half: 21 }, { at: 430, half: 17 }, { at: 530, half: 18 }],
    greenRadius: 16, greenSide: 20,
    hazards: [
      { surface: 'water', at: { down: 492, side: 38 }, rDown: 24, rSide: 16 },
      { surface: 'bunker', at: { down: 268, side: -30 }, rDown: 18, rSide: 11 },
    ],
    note: 'Two good swings get home. The pond collects the ones that were only half-good.',
  },
  {
    // The tempter. Bomb leaves a 38-yard flop over the shoulder bunkers that
    // pinch the diagonal; Bomb+40 drives the green with a doubled cone, which
    // is a coin the player can choose to flip. The "safe" 170 leaves 145 —
    // which is not owned either. Nothing here is free; everything is close.
    num: 6, par: 4, length: 315, name: 'Go On Then',
    corridor: [{ at: 0, half: 23 }, { at: 200, half: 20 }, { at: 315, half: 18 }],
    greenRadius: 15, greenSide: -16,
    hazards: [
      { surface: 'bunker', at: { down: 284, side: -22 }, rDown: 14, rSide: 9 },
      { surface: 'bunker', at: { down: 293, side: -2 }, rDown: 12, rSide: 8 },
    ],
    note: 'Drivable, with a bunker where your bravery finishes. The lay-up leaves 145 and a think.',
  },
  {
    // The punchline: after six leaning holes, the only straight one. 205 with
    // an owned 208 — a pure execution test, and psychologically the hardest
    // club to trust on the course. Deliberately no water: the twin bunkers are
    // recoverable, because this hole is about belief, not punishment.
    num: 7, par: 3, length: 205, name: 'Dead Straight',
    corridor: [{ at: 0, half: 15 }, { at: 205, half: 17 }],
    greenRadius: 15, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 182, side: -26 }, rDown: 16, rSide: 10 },
      { surface: 'bunker', at: { down: 182, side: 26 }, rDown: 16, rSide: 10 },
    ],
    note: 'No lean. No pond. You own 208. The only trap on this hole is disbelief.',
  },
  {
    // The finisher. A creek crosses the bent line at 496–514, and it prices
    // every route differently: Bomb+Long Iron stops at 485 and wedges over
    // (Pitch shortens to 60, carries); Bomb+Bomb flies it all, 9 past, eagle
    // try with a wide cone; Stinger twice finishes IN the creek and cannot
    // carry water anyway — the boring play, played twice, is the one that
    // drowns. Whatever you need, the creek asks first.
    num: 8, par: 5, length: 545, name: 'The Walk In',
    corridor: [{ at: 0, half: 24 }, { at: 280, half: 20 }, { at: 450, half: 16 }, { at: 545, half: 18 }],
    greenRadius: 16, greenSide: 30,
    hazards: [
      { surface: 'water', at: { down: 505, side: 26 }, rDown: 9, rSide: 30 },
      { surface: 'bunker', at: { down: 522, side: -2 }, rDown: 15, rSide: 10 },
    ],
    note: 'Three shots you own, one creek that owns you back.',
  },
]

export const COTTONWOOD_PAR = COTTONWOOD.reduce((n, h) => n + h.par, 0) // 32
