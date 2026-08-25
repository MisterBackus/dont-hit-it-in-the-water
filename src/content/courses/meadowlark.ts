import type { HoleSpec } from '../../sim/types'

/**
 * MEADOWLARK — eight played holes, par 31. Home of The Fall Series.
 *
 * One-sentence identity: IS CLOSER ACTUALLY BETTER? The tee shots are free —
 * wide corridors, almost nothing to hit — and every decision lives in what the
 * tee shot LEAVES. Built on the one engine rule nobody had designed with:
 * shortening widens the angle (effects.ts, takeOff × TAKEOFF_PENALTY). A Full
 * Wedge cut to 85 is wider than a full one; so the leaves are engineered in
 * pairs — the longer club leaves the widened partial, the modest club leaves
 * the exact number — and "hit it as far as you can" is here simply wrong on
 * the arithmetic. Sometimes. That's the game.
 *
 * Pine Hollow adjacency, acknowledged (COURSE-SLATE.md §2): both are
 * ladder-arithmetic courses. Pine Hollow asks which card reaches the number;
 * Meadowlark asks what the number you reach leaves, one shot deeper.
 *
 * The world: a course mown out of hay meadows an hour from anywhere. Fairway
 * is cut meadow, generous. Rough is the hay itself — they baled in June, it
 * is August. Water is a creek that wanders through twice, in thin strips.
 * Three bunkers, old, blown in at the edges. Deep is the unmown far banks.
 * No OB anywhere; the worst thing that happens at Meadowlark is a lie.
 *
 * Tier: gentle. Check-week-safe (event 9 wants conversion, not survival).
 * ORDER: funds at 2 and 7; asks at 4 and 6 each one hole downstream of cheap
 * holes; mercy at 7. The 205 par-3 slot sits at offset −8 and doubles as the
 * open offset diagnostic (Ballwasher forked at −10, Postcard didn't at +18).
 */
export const MEADOWLARK: readonly HoleSpec[] = [
  {
    // The opener states the whole thesis. Bomb leaves 85 — a Full Wedge cut
    // down a fifth, widening as it shortens. Stinger leaves 107 — the wedge
    // full, two short, a dart. The greedy drive leaves the worse wedge, and
    // the flank bunkers 9–19 off the green line price exactly the width the
    // greed bought.
    // v2 (measured 0.32/65 — one gap-hundredth-times-three off the bar). The
    // slate's own registered first fix, verbatim: the flank bunkers move two
    // yards toward the line (7–19 off), and the green tightens 14 → 13 so
    // the widened wedge's extra yards of fan actually miss something.
    num: 1, par: 4, length: 362, name: 'First Cut',
    corridor: [{ at: 0, half: 26 }, { at: 240, half: 24 }, { at: 362, half: 21 }],
    greenRadius: 13, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 352, side: -13 }, rDown: 12, rSide: 6 },
      { surface: 'bunker', at: { down: 352, side: 13 }, rDown: 12, rSide: 6 },
    ],
    note: 'The big drive leaves the wedge you have to baby. The easy one leaves the wedge you own. The hay finds this funny.',
  },
  {
    // Funding round. Everything reaches; the old bunker blew in at the edge
    // years ago and mostly catches conversation.
    num: 2, par: 3, length: 160, name: 'The Bales',
    corridor: [{ at: 0, half: 16 }, { at: 160, half: 17 }],
    greenRadius: 15, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 148, side: -24 }, rDown: 10, rSide: 8 },
    ],
    note: 'They stack the bales along the right in August. Nobody has ever hit one. There is a pool about it.',
  },
  {
    // For once the driver is the CAREFUL play: Bomb leaves 170 — exact,
    // owned, tight. Stinger leaves 192 — nothing naked fits; the Smooth Long
    // Iron plays 193 for a focus. Mild fork on purpose — the course refuses
    // to let "lay back" become a rule of thumb.
    num: 3, par: 4, length: 447, name: 'Long Meadow',
    corridor: [{ at: 0, half: 25 }, { at: 250, half: 23 }, { at: 447, half: 20 }],
    greenRadius: 14, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 430, side: 20 }, rDown: 10, rSide: 7 },
    ],
    note: 'Four-forty-seven straight down the valley. Today the brave club is the correct club. Do not get used to it.',
  },
  {
    // "Which miss do you want," in one hole. Bomb leaves 60 up a priced line —
    // the creek runs parallel on the left of the landing zone, near edge ~20
    // off the line (the Cart Path generator with water). Stinger leaves 82,
    // the widened band, off a free line — bail right and the creek never
    // exists. Good leave off a risky line, or bad leave off a safe one.
    // REAL candidate.
    // v2 (measured 0.10/58 — a miss with a clean diagnosis: the green offset
    // +8 bent the line AWAY from the creek, so the "brave" side was twenty
    // off the line and free, and both leaves were wedges — the eval between
    // a 60 and an 82 is pocket change unless the water is in one of them).
    // Green back to centre, creek nearer (near edge 12 off the line) and
    // longer (down 230–310): the pin line pays, the bail-right doesn't.
    num: 4, par: 4, length: 337, name: 'Millrace',
    corridor: [{ at: 0, half: 25 }, { at: 220, half: 23 }, { at: 337, half: 20 }],
    greenRadius: 14, greenSide: 0,
    hazards: [
      { surface: 'water', at: { down: 270, side: -18 }, rDown: 40, rSide: 6 },
    ],
    note: 'The creek used to turn a mill. Now it turns drives into lay-ups. Sixty from the brave line, eighty-two from the dry one.',
  },
  {
    // The second shot chooses the third's cone width — a par 5 with a leave
    // menu instead of a carry gamble. Bomb then LI: 485, leaves 13, chipping
    // for eagle. Bomb then MI: 447, leaves 51 — Splash, four under its full.
    // Bomb then SI: 410, leaves 88 — the widest partial on the course. Fives
    // are structurally gap-poor (no five has cleared 0.48); this one aims at
    // "some" honestly.
    num: 5, par: 5, length: 498, name: 'The Long Field',
    corridor: [{ at: 0, half: 25 }, { at: 270, half: 22 }, { at: 420, half: 20 }, { at: 498, half: 19 }],
    greenRadius: 15, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 478, side: -19 }, rDown: 10, rSide: 7 },
    ],
    note: 'Everyone gets home in three. The question is what your second shot did to your third.',
  },
  {
    // The slot fork, rationed one per course — the Ballwasher's structure at
    // the offset that measured (R2 forked at −10; Postcard didn't at +18;
    // this copy sits at −8 and is a data point for that open diagnostic).
    // Long Iron three past, ±20, its left band over the creek strip; Mid Iron
    // lays to 42 and chips from the mown side. The far bank is unmown, which
    // is all the course ever needs to say.
    num: 6, par: 3, length: 205, name: 'The Unmown',
    corridor: [{ at: 0, half: 16 }, { at: 150, half: 17 }],
    greenRadius: 13, greenSide: -8,
    hazards: [
      { surface: 'water', at: { down: 128, side: -24 }, rDown: 45, rSide: 6 },
    ],
    note: 'The creek again, closer this time, and the pin leans toward it. The mown side putts from the fringe. Forever.',
  },
  {
    // Funding round for the closer, and the mercy. Bomb leaves 45.
    num: 7, par: 4, length: 322, name: 'The Gate',
    corridor: [{ at: 0, half: 26 }, { at: 210, half: 24 }, { at: 322, half: 22 }],
    greenRadius: 15, greenSide: 0,
    hazards: [],
    note: 'Through the gate, down the slope, wide as a promise. Take the birdie look; the last one has questions.',
  },
  {
    // The closer re-asks the opener with four hours of evidence. Bomb leaves
    // 89 — the bad band. Stinger leaves 111 — six short of a full wedge,
    // fine. The flank bunkers price the widened wedge's edges, same as the
    // 1st, two yards closer.
    num: 8, par: 4, length: 366, name: 'Bragging Rights',
    corridor: [{ at: 0, half: 25 }, { at: 240, half: 23 }, { at: 366, half: 21 }],
    greenRadius: 14, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 356, side: -13 }, rDown: 11, rSide: 5 },
      { surface: 'bunker', at: { down: 356, side: 13 }, rDown: 11, rSide: 5 },
    ],
    note: 'The card that brags leaves 89. The card that doesn\'t leaves 111. Sit with that.',
  },
]

export const MEADOWLARK_PAR = MEADOWLARK.reduce((n, h) => n + h.par, 0) // 31
