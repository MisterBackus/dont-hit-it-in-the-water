import type { HoleSpec } from '../../sim/types'

/**
 * RIVERMOUTH — eight played holes, par 32. Home of the Rivermouth Open
 * (event 5) and the Highwater Open (event 10) — the two water-named events
 * that spent a season being faked by parkland.
 *
 * One-sentence identity: HOW MUCH CARRY DO YOU BUY? Every scoring hole
 * crosses water, and every crossing is priced in yards of pitch carry — with
 * the buy always available three ways: NAKED (your card's pitch band clips
 * the far edge, and the two-band cone draws exactly how much), CERTAIN (+15
 * or +40, a wider cone for more carry), or REFUSED (the dry lay, a stroke of
 * patience). Salt Flats asks the question with crust and refusal; Rivermouth
 * asks it with water and purchase.
 *
 * THE GATE IS OPEN. This course was DEPTH-GATED in the slate and built only
 * after DEPTH-DECISION Option A landed — the pitch band is drawn, the
 * policies read it, and The Crossing (0.56/80 under the depth engine) is the
 * proof the design space exists. Every fork below is a carry priced against
 * a drawn band, judged exactly as resolution judges it: water and OB at the
 * PITCH for the low ball, at the REST for the high one — which is why the
 * braids are deep enough front-to-back to catch a skipping rest, not just a
 * pitch.
 *
 * The Stinger is refused all day by the pitch-point rule — the game's
 * namesake card, dead on the course named for water. That is the course's
 * joke and its teeth.
 *
 * The world: a river delta braided through levee turf. The braids are the
 * course's whole voice. Deep is reed bed and mud flat, rest-judged, for the
 * ball that cleared the water and nothing else. Fairways are the levees. OB
 * is the harbor, sparingly. Every crossing is flyable by a wedge from short
 * of it — the softlock law holds by construction, checked hole by hole.
 *
 * Tier: mid-hard (standard slot data; the difficulty lives in the ladder).
 * ORDER: funds at 3 and 7; the expensive asks at 4 and 5 sit immediately
 * downstream of the 3rd; mercy at 7.
 */
export const RIVERMOUTH: readonly HoleSpec[] = [
  {
    // The first braid, 184–230, and the lesson taught early and cheap: the
    // Stinger's pitch band lives in it — refused on the first swing. The
    // Long Iron RESTS in it — the skip-across is caught, not gifted. The
    // Bomb flies it all and leaves 128; the dry Mid-Iron lay leaves a long
    // dull road. Everything decent crosses; the card the course is named
    // against does not.
    num: 1, par: 4, length: 405, name: 'First Braid',
    corridor: [{ at: 0, half: 25 }, { at: 260, half: 22 }, { at: 405, half: 20 }],
    greenRadius: 15, greenSide: 0,
    hazards: [
      { surface: 'water', at: { down: 207, side: 0 }, rDown: 23, rSide: 55 },
    ],
    note: 'The first braid drowns low heroes and lazy long irons alike. Fly it properly or lay up and hear about it.',
  },
  {
    // All-carry: water to the front apron, 158 at its far edge. The Mid
    // Iron's band clears by a yard at its shortest — the drawn kiss — and
    // its long half holds the green. MI+15 buys the carry outright and
    // spends the certainty on the reeds behind. The Short Iron's band is in
    // the water: the club choice IS the purchase. REAL candidate.
    // v2 (measured 0.03/44 — flat, and deservedly: the naked band cleared
    // the water by a yard, so the "gamble" was 6% and every appetite shrugged
    // at the same Mid Iron). The braid comes up the apron four more yards
    // (far edge 160): the naked Mid Iron's pitch band is now genuinely a
    // fifth wet — drawn — while MI+15 buys the whole carry and spends the
    // certainty on the reeds behind. The purchase finally costs something
    // in one direction or the other.
    // v3, and the diagnosis is an engine finding worth its sentence: FRONT
    // WATER CANNOT DUNK A HIGH IRON. Water is rest-judged for the high ball,
    // and a Mid Iron pitching in the braid's last yards rolls out dry — the
    // skip-across. So the front edge kisses the picture and never collects,
    // and both v1 and v2 measured dead flat. The price moves to where rest
    // bands actually live: reed arms flanking the green 12–22 off the line
    // (the loose MI+15's bands), green 14 → 13. The braid still refuses the
    // Short Iron and everything low; the purchase is now naked-and-tight
    // against bought-and-flanked. Last iteration — if it stays flat it goes
    // to the reviewer with the skip-across finding attached.
    num: 2, par: 3, length: 172, name: 'The Toll',
    corridor: [{ at: 0, half: 16 }, { at: 172, half: 17 }],
    greenRadius: 13, greenSide: 0,
    hazards: [
      { surface: 'water', at: { down: 80, side: 0 }, rDown: 80, rSide: 40 },
      { surface: 'deep', at: { down: 172, side: -17 }, rDown: 12, rSide: 5 },
      { surface: 'deep', at: { down: 172, side: 17 }, rDown: 12, rSide: 5 },
      { surface: 'deep', at: { down: 198, side: 0 }, rDown: 10, rSide: 20 },
    ],
    note: 'Water to the apron, reeds past the pin. Pay the toll short and you pay it again from the drop. Nobody pays it long twice.',
  },
  {
    // Dry hole — the bend's inside. Funding round for the two asks behind it.
    num: 3, par: 4, length: 352, name: 'The Levee',
    corridor: [{ at: 0, half: 26 }, { at: 230, half: 24 }, { at: 352, half: 21 }],
    greenRadius: 15, greenSide: 0,
    hazards: [],
    note: 'The one stretch of the delta the river forgot. Walk the levee, take the birdie look, say nothing.',
  },
  {
    // The double-cross: braids at 246–270 and 399–425, and a side channel
    // down the left of the buying zone. The tee buy, three ways: the naked
    // Bomb's rest band ends in the first braid's far yards — a quarter of
    // the tail is wet, drawn; Bomb+15 buys certainty at ×1.35 with the side
    // channel pricing its wider left edge; the Long Iron lay rests dry at
    // 208 and leaves the second crossing still to buy. Over in one: 161 in,
    // Mid Iron flies the green braid. Around in patience: lay, lay, wedge.
    // REAL candidate.
    num: 4, par: 4, length: 438, name: 'Double Cross',
    corridor: [{ at: 0, half: 24 }, { at: 250, half: 21 }, { at: 438, half: 19 }],
    greenRadius: 14, greenSide: 0,
    hazards: [
      { surface: 'water', at: { down: 258, side: 0 }, rDown: 12, rSide: 55 },
      { surface: 'water', at: { down: 300, side: -30 }, rDown: 60, rSide: 8 },
      { surface: 'water', at: { down: 412, side: 0 }, rDown: 13, rSide: 45 },
    ],
    note: 'Two braids, one hole. Buy the first crossing with yards or with width; the second one only takes wedges.',
  },
  {
    // The cape: a braid runs the left the whole way, green offset −25 —
    // every club buys a bigger bite of the diagonal. Cottonwood's question
    // priced in carry, which is why it lives here and not there. Aims at
    // "some" honestly: fives are gap-poor, and the Ferry taught what
    // continuous pricing does to appetites — this one keeps its far segment
    // ON the pin line so the last bite is discrete.
    num: 5, par: 5, length: 520, name: 'The Bite',
    corridor: [{ at: 0, half: 25 }, { at: 270, half: 22 }, { at: 430, half: 20 }, { at: 520, half: 19 }],
    greenRadius: 15, greenSide: -25,
    hazards: [
      { surface: 'water', at: { down: 250, side: -36 }, rDown: 70, rSide: 10 },
      { surface: 'water', at: { down: 430, side: -27 }, rDown: 60, rSide: 9 },
    ],
    note: 'The braid hugs the left the whole way and the green leans toward it. Every club you take bites off a little more.',
  },
  {
    // Dry — the slot fork, rationed, so the course keeps one pure ladder
    // hole and the round isn't eight identical purchases. Long Iron ±20 with
    // reed beds 11–19 off the line; Mid Iron lays to 38 and chips.
    num: 6, par: 3, length: 208, name: 'Dry Land',
    corridor: [{ at: 0, half: 15 }, { at: 208, half: 16 }],
    greenRadius: 13, greenSide: 0,
    hazards: [
      { surface: 'deep', at: { down: 195, side: -15 }, rDown: 10, rSide: 4 },
      { surface: 'deep', at: { down: 195, side: 15 }, rDown: 10, rSide: 4 },
    ],
    note: 'No water. The reeds moved in anyway. The one hole here you can play with your feet dry and your number owned.',
  },
  {
    // Dry, wide, green light. Funding round for the closer. The harbor OB
    // right takes a genuine block only.
    num: 7, par: 4, length: 315, name: 'Harborside',
    corridor: [{ at: 0, half: 26 }, { at: 200, half: 24 }, { at: 315, half: 22 }],
    greenRadius: 15, greenSide: 0,
    hazards: [
      { surface: 'ob', at: { down: 250, side: 49 }, rDown: 70, rSide: 8 },
    ],
    note: 'The harbor charges mooring fees for anything that clears the fence. Aim at the pin and keep your wallet.',
  },
  {
    // The mouth: a tidal flat (deep, rest-judged) at 430–470, then the last
    // braid at 505–523. The third must FLY — the wedge-gate, the Verdict's
    // honest-three shape over water, with the pitch band drawn where
    // everyone can argue with it. Bomb then Short Iron lays 410, short of
    // the flat; the second Short Iron flies everything. Bomb then Long Iron
    // threads BETWEEN flat and braid at 475–495 and leaves the 60-yard
    // wedge. Bomb then Mid Iron rests IN the flat, and the tail says so.
    // Bomb+Bomb flies it all for the eagle look, with the pin-side channel
    // pricing the pull.
    // v2 (0.37/58 — two split-points shy): green 15 → 14, so the four ways
    // home stop agreeing about what happens after the carry.
    num: 8, par: 5, length: 545, name: 'The Mouth',
    corridor: [{ at: 0, half: 24 }, { at: 280, half: 21 }, { at: 450, half: 19 }, { at: 545, half: 18 }],
    greenRadius: 14, greenSide: 0,
    hazards: [
      { surface: 'deep', at: { down: 450, side: 0 }, rDown: 20, rSide: 50 },
      { surface: 'water', at: { down: 514, side: 0 }, rDown: 9, rSide: 45 },
      { surface: 'water', at: { down: 540, side: -28 }, rDown: 25, rSide: 9 },
    ],
    note: 'The river meets the sea sixty short of home, and neither of them takes runners. Fly your third. Everyone flies their third.',
  },
]

export const RIVERMOUTH_PAR = RIVERMOUTH.reduce((n, h) => n + h.par, 0) // 32
