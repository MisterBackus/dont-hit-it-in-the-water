import type { HoleSpec } from '../../sim/types'

/**
 * PALMETTO — eight played holes, par 33. Home of The Sunbelt Open.
 *
 * One-sentence identity: HOW MUCH DO YOU WANT IT? Every tee offers a buyout —
 * the big card purchases a whole shot class, not just yards — and every buyout
 * has exactly one string attached, always visible, never fatal. Rockdale sorts
 * on execution; Palmetto sorts on appetite (COURSE-SLATE.md §1, the adjacency
 * acknowledged there).
 *
 * The world: a sunbelt resort that waters the fairways twice a day. Fairway
 * overfed emerald; rough is bermuda tangle; bunkers are white sugar sand raked
 * for the brochure; the water is lagoons, every one photogenic, every one
 * placed by the Retention Pond principle — off the direct line, pricing only
 * the cone edge that chose to live near it. One palm clump is load-bearing.
 * OB is the resort itself, down one side of the last, because somebody always
 * finds the pool deck.
 *
 * Tier: gentle. Check-week-safe; the opener is nearly free because event 1 is
 * the one week the whole field is loose.
 * ORDER (the funding law, REVIEW-5/6): the loose opener funds the 2nd (the
 * cape, the course's front-four ask since CHANGES-8); funds at 3 and 6, each
 * directly upstream of an ask (4, 7); mercy at 8; no fork chains. Safe play
 * pays here — +0.56 a round at ×1.40 (CHANGES-8), most of it on the 2nd —
 * which is the identity question priced, not a tier violation: the timid
 * player is charged for refusing, the loose one is handed the largest
 * appetite gap in the pool (safe +0.56 vs aggressive −1.29, 1.85 strokes).
 *
 * Subtraction uses the FINISHING ladder: 277/255/208/170/133/105/94/70/58/55/35.
 */
export const PALMETTO: readonly HoleSpec[] = [
  {
    // Two roads to a birdie look, taught at ×1.40 cones with nothing sharp
    // nearby: Bomb finishes 277 and leaves 35 — the Flop, exact; Long Iron
    // finishes 208 and leaves 104 — the Full Wedge, one short of full. The
    // opener teaches the menu; the brochure bunker right is outside the aim
    // band and exists for the photograph.
    // v2 (first measurement, N=400: course mean −1.96 against a predicted
    // −0.9 — the resort was comping the whole stay). Green 15 → 14 here and
    // on 6 and 8: the menu stays, the tap-ins want the good swing.
    num: 1, par: 4, length: 312, name: 'Complimentary',
    corridor: [{ at: 0, half: 26 }, { at: 200, half: 25 }, { at: 312, half: 23 }],
    greenRadius: 14, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 290, side: 30 }, rDown: 12, rSide: 8 },
    ],
    note: 'They comp the first one. Big drive leaves a flop, easy drive leaves a wedge. Order whichever you like.',
  },
  {
    // REBUILT (CHANGES-8, paying REVIEW-7 §5's ordered debt: one front-four
    // REAL). Brochure died 0.09/65 across three slate passes because at 336
    // every route left a wedge — finding 1, terminal. The rebuild carries the
    // yards the class ladder needs (407) and turns the lagoon into the cape
    // the owner's favorite pattern asks for (Rivermouth's Bite, made DISCRETE
    // — the Ferry lesson): playing short is a priced POSITION, not a
    // chicken-out.
    //
    // One lagoon, two lobes and a dry seam, cut diagonally across the second
    // fairway. The pin line (green −10) leans over the deep left lobe.
    // Routes by SHOT CLASS:
    //   BUY — naked Bomb at the pin: rest band 264–290 clears the shallow
    //   lobe (ends 216) and skips C's far edge (267); its LEFT band is over
    //   the deep lobe (240–284, rest-judged) — a drawn fraction, no
    //   dice-doubt. Leaves ~130: the owned Short Iron, exact. Bail right
    //   buys dry and pays rough plus the longer diagonal.
    //   POSITION — the tight lay (LI+Choke, 183, leave ~224) keeps the
    //   one-shot argument at its worst proximity; the naked LI must thread
    //   LEFT of the seam or its rest band (198–218) is caught in lobe A —
    //   the lazy long road pays.
    //   CONCEDE — Mid Iron, 170, dry by a mile, leave ~237: past the
    //   two-shot cliff. A whole class, posted.
    //   REFUSED — the Stinger: pitch band into A by the pitch rule, rest
    //   band (244–266) into finger C. The namesake card drowns in the
    //   photograph.
    // Drop-shadow audit (the Toll's lesson, done before measuring): A's
    // side-0 span is 198–214; its own drops (≤191), B's (215–259; B never
    // reaches side 0) and C's (214–242) all land dry.
    //
    // MEASURED (CHANGES-8, pass 1 — no iteration needed): 0.45/78 at N=400
    // AND at N=800, digit-identical — REAL, the front four's first. Safe
    // +0.74, mixed +0.29, aggressive +0.41: safe pays the class for laying
    // (as pre-registered), mixed threads best, aggressive buys the cape and
    // pays B's drawn fraction (prediction said aggressive best — half-miss,
    // recorded). Predicted gap 0.40–0.60 ✓, split 65–78 ✓, mixed +0.00..
    // +0.25 (measured +0.28..+0.29, a hair over).
    num: 2, par: 4, length: 407, name: 'Two-Page Spread',
    corridor: [{ at: 0, half: 25 }, { at: 260, half: 22 }, { at: 407, half: 20 }],
    greenRadius: 14, greenSide: -10,
    hazards: [
      { surface: 'water', at: { down: 212, side: 14 }, rDown: 12, rSide: 22 },
      { surface: 'water', at: { down: 262, side: -34 }, rDown: 22, rSide: 26 },
      { surface: 'water', at: { down: 253, side: 16 }, rDown: 14, rSide: 14 },
    ],
    note: 'The lagoon takes up both pages of the brochure. Carry the deep end at the pin, thread the seam, or lay back and read the caption twice.',
  },
  {
    // Funding round for the 4th, per the sequencing law. Everything reaches —
    // the Mid Iron pitches seven past the pin and stays on. The cabana bar is
    // not a hazard; the bunker is barely one.
    num: 3, par: 3, length: 158, name: 'Cabana',
    corridor: [{ at: 0, half: 16 }, { at: 158, half: 17 }],
    greenRadius: 15, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 150, side: 26 }, rDown: 10, rSide: 8 },
    ],
    note: 'One-fifty-eight, no wind, drinks at the turn. If you are dropping shots here, get out of the sun.',
  },
  {
    // The Oak's shape in resort clothing (the proven position-upside
    // generator). The palm clump sits on the diagonal at 220–244, dead on the
    // line to a green offset +14. Bomb clears its far edge by 20+ at worst
    // (rest band 264–290 — no dice-doubt margins, law 4) and leaves 78. Mid
    // Iron lays 50 short of it and leaves 185 — the gap: MI+15 free and loose
    // at 185 exact, or LI−25 paid and tight at 183. Tap-in with a story, or a
    // technique decision from the fairway. REAL candidate.
    // v2 (measured 0.20/73 — the routes exist, everyone birdies from both).
    // The Sentinel's exact diagnosis and its exact fix: green 14 → 13, palm
    // grown 12×11 → 14×13 (spans 218–246 / −3..+23; Bomb's rest band 264–290
    // still clears by 18 at worst — law 4 margins hold).
    // v3 (0.27/75 — moving, not there). The palm deepens 14 → 16 (216–248,
    // Bomb still clears by 16) and the greenside bunker moves onto the loose
    // MI+15's right band (14–30 off the pin line) so the free fit is priced
    // the way the Postcard lesson demands. Second and last iteration.
    num: 4, par: 4, length: 355, name: 'The Load-Bearing Palm',
    corridor: [{ at: 0, half: 25 }, { at: 230, half: 23 }, { at: 355, half: 20 }],
    greenRadius: 13, greenSide: 14,
    hazards: [
      { surface: 'trees', at: { down: 232, side: 10 }, rDown: 16, rSide: 13 },
      { surface: 'bunker', at: { down: 348, side: 22 }, rDown: 12, rSide: 8 },
    ],
    note: 'The palm clump shades the halfway house, which makes it structural. Fly it, or lay back and do the arithmetic.',
  },
  {
    // The surface-dependent run-out rule as a menu of three honest seconds.
    // Bomb leaves 218. Long Iron second: 485, ten short, chipping for eagle.
    // Mid Iron second: 447, leaves 48 (Splash). The chasing Stinger second
    // pitches at 502 — ON the green, run killed ×0.30, sits by the back pin;
    // its EDGES pitch beside the green and run the full 30 into the collar
    // and the scrub past it. The cone's middle and edges finish twenty yards
    // apart and the whole difference is lateral — picture-doubt (law 4).
    // v2 (0.34–0.36 across three runs, wobbling on the bar with the split
    // already there): green 16 → 14. The chase and the chip keep their
    // upside; the laid-back routes stop converting for free.
    num: 5, par: 5, length: 495, name: 'Turndown Service',
    corridor: [{ at: 0, half: 25 }, { at: 270, half: 22 }, { at: 420, half: 20 }, { at: 495, half: 19 }],
    greenRadius: 14, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 470, side: -26 }, rDown: 12, rSide: 8 },
    ],
    note: 'Three ways home in two, and the chasing one is lovely exactly down the middle. The middle is not where your edges live.',
  },
  {
    // Funding round for the 7th. Bomb leaves 54, wide. The fountain is 48
    // yards off the line and costs nothing, which is the point of fountains.
    // v3: 318 → 331 — part of pulling the course mean up from −1.9 toward
    // the tier's intent; the birdie look survives, the tap-in doesn't.
    num: 6, par: 4, length: 331, name: 'The Fountain',
    corridor: [{ at: 0, half: 26 }, { at: 200, half: 24 }, { at: 318, half: 22 }],
    greenRadius: 14, greenSide: 0,
    hazards: [
      { surface: 'water', at: { down: 250, side: 55 }, rDown: 28, rSide: 7 },
    ],
    note: 'The fountain runs on a timer and has never once been in play. Management is very proud of it.',
  },
  {
    // The literal buyout: how much of the lagoon do you fly? Water fronts the
    // green at 502–530. Bomb+LI stops 475–495 — dry by construction — and the
    // 55-yard third (Splash exact, or the wedge cut down) flies it. Bomb+Bomb
    // pitches 529–555: over, eagle look, with the short edge kissing the far
    // bank in the picture — that yard is the price tag, drawn. The Stinger
    // second is refused by shape (cannot carry) and by arithmetic. Softlock-
    // checked by construction: from anywhere short, a wedge cuts down and
    // carries. REAL candidate.
    // v2 (measured 0.19/58 — the lagoon read as scenery: 60 wide against a
    // 40-yard corridor left slivers of dry land at its corners, and the
    // eagle line never had to argue with the picture). The lagoon fills the
    // whole front: rSide 30 → 42, rDown 14 → 16 (down 500–532), green 15 →
    // 14. The wedge-over from 485 still flies it — pitch band 537–543.
    // v3 (0.22/57 — closer; the remaining leak is that the fronting water
    // cannot price the eagle Bomb at all: a high ball that pitches wet SKIPS
    // ACROSS at rest, so the second Bomb only ever risked a lateral miss
    // into grass). The lagoon grows a pin-side arm past the green's left
    // flank (down 520–548, 20–40 off the line): now the eagle swing's left
    // band and the wedge's pull both live over water, and the lay-and-wedge
    // road is the one that never argues. Second and last iteration.
    num: 7, par: 5, length: 540, name: 'Infinity Edge',
    corridor: [{ at: 0, half: 25 }, { at: 280, half: 22 }, { at: 450, half: 20 }, { at: 540, half: 19 }],
    greenRadius: 14, greenSide: 0,
    hazards: [
      { surface: 'water', at: { down: 516, side: 0 }, rDown: 16, rSide: 42 },
      { surface: 'water', at: { down: 534, side: -30 }, rDown: 14, rSide: 10 },
      { surface: 'bunker', at: { down: 534, side: 34 }, rDown: 10, rSide: 7 },
    ],
    note: 'The lagoon goes right up to the green, because the members asked it to. Buy the whole carry or wedge over the narrow end.',
  },
  {
    // Green light home — the Last Call principle: a scoring course owes the
    // player the handshake. Widest corridor on the course, Bomb leaves 61.
    // The pool deck OB left takes a genuine pull and nothing else.
    // v3: 326 → 338, same reason as the 6th — the handshake stays, it just
    // stops being a gift certificate.
    num: 8, par: 4, length: 338, name: 'Checkout',
    corridor: [{ at: 0, half: 27 }, { at: 200, half: 25 }, { at: 338, half: 23 }],
    greenRadius: 14, greenSide: 0,
    hazards: [
      { surface: 'ob', at: { down: 255, side: -47 }, rDown: 85, rSide: 8 },
    ],
    note: 'Wide open all the way to the clubhouse. The pool deck on the left has a sign about incoming balls. It is not for you. Probably.',
  },
]

export const PALMETTO_PAR = PALMETTO.reduce((n, h) => n + h.par, 0) // 33
