import type { HoleSpec } from '../../sim/types'

/**
 * DRIFTWOOD — eight played holes, par 32. Home of the Coastal Classic.
 *
 * One-sentence identity: DO YOU FLY IT OR RUN IT? The wind-implied course,
 * without wind mechanics. The engine contains an entire ground game nobody
 * had built a course on — run-out is full on short grass, ×0.40 in rough,
 * ×0.30 on the green; the Stinger finishes 255 only when it pitches on
 * fairway. Salt Flats uses the crust to REFUSE the runner. Driftwood is the
 * inversion: here the runner is a first-class citizen and the question is
 * whether today's hole, and today's lie, is a running day.
 *
 * The named generator (COURSE-SLATE.md §3): the RUN-SHEAR FORK — a running
 * shot's rest point depends on its pitch surface, so lateral scatter converts
 * into depth scatter of the finish. Under the two-band cone (DEPTH-DECISION,
 * shipped) the tail is drawn and the policies read it, so the burn gamble at
 * the 3rd is picture-doubt in both axes, not a hidden coin flip.
 *
 * The world: hardpan links turf that runs like a cart path. Rough is marram
 * grass — the grass that ends the running game. Deep is gorse, which keeps
 * whatever reaches it. Bunkers are pots, small enough to be personal, placed
 * 10–19 off the line where aim is a real answer. OB is the beach. Water is a
 * single tidal slough at the last. Greens are open in front — the front door
 * is always unlocked; the trouble flanks.
 *
 * GATED footnote, unchanged from the slate: true crosswind would be this
 * course's second axis and needs an engine axis that does not exist. Nothing
 * below assumes it.
 *
 * Tier: mid (standard). ORDER: funds at 2 and 7; forks at 3, 4, 6 each one
 * hole downstream of cheap; mercy at 7.
 */
export const DRIFTWOOD: readonly HoleSpec[] = [
  {
    // Opener-grade fork. Bomb leaves 123 (Short Iron, on). Stinger leaves 145
    // — the gap: Rip the wedge for 145 free and doubled, SI+15 at 148 free
    // and loose, Smooth Mid Iron paid and tight. The pots at 10–18 off the
    // line in the Bomb zone price the wide card; the safe card buys the
    // awkward number.
    num: 1, par: 4, length: 400, name: 'Running Ground',
    corridor: [{ at: 0, half: 25 }, { at: 260, half: 22 }, { at: 400, half: 20 }],
    greenRadius: 15, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 270, side: -14 }, rDown: 12, rSide: 4 },
      { surface: 'bunker', at: { down: 270, side: 14 }, rDown: 12, rSide: 4 },
    ],
    note: 'The ground runs. Everything out here runs. The only question the first tee asks is whether you trust it yet.',
  },
  {
    // Funding round. Front door open, everything reaches, the pot on the
    // right is for people who aim at it.
    num: 2, par: 3, length: 165, name: 'The Short Hop',
    corridor: [{ at: 0, half: 16 }, { at: 165, half: 17 }],
    greenRadius: 15, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 150, side: 22 }, rDown: 8, rSide: 5 },
    ],
    note: 'One-sixty-five with the front door open. The links gives you this one and remembers that it did.',
  },
  {
    // The run-shear fork, stated as plainly as the engine allows. A dry burn
    // (deep, rest-judged) crosses at 280–296. The Stinger rests 255, dry by
    // fourteen at worst — leaves 170, owned. The naked Bomb's rest band is
    // 264–290: its far third finishes IN the burn, and the two-band cone
    // draws exactly that — safe reads the tail and lays, aggressive reads
    // the leave (148: SI+15 exact and loose, Smooth MI paid and tight) and
    // swings. Let It Chase runs the band to 289–315 — mostly THROUGH the
    // burn to ~110, the rest in it. Three plans, three rest points, all of
    // the doubt drawn. REAL candidate.
    // v2 (measured 0.29/64 — the fork exists and the stakes were shy: both
    // routes hit an r15 green from their leaves). The burn deepens one yard
    // (280–297; the naked Bomb's tail is 38% in it, drawn) and the green
    // tightens 15 → 13, so owning 170 against renting 148 is finally a
    // different conversion, not a different anecdote.
    num: 3, par: 4, length: 425, name: 'The Burn',
    corridor: [{ at: 0, half: 24 }, { at: 250, half: 21 }, { at: 425, half: 19 }],
    greenRadius: 13, greenSide: 0,
    // v3 (0.35/65 — printed "some" by a rounding hair). The burn deepens one
    // more yard (278–298): the naked Bomb's tail is now 46% shaded, the
    // Stinger's still bone dry, and the argument between them is the hole.
    // Last iteration either way.
    hazards: [
      { surface: 'deep', at: { down: 288, side: 0 }, rDown: 10, rSide: 60 },
      { surface: 'bunker', at: { down: 262, side: -17 }, rDown: 10, rSide: 4 },
    ],
    note: 'The burn has been dry since the war. It still collects. Short of it is a shot; through it is a story.',
  },
  {
    // Cart Path Only's shape in links clothing: the hole is reachable by
    // everyone, the birdie is not, unless you take the drive through the pot
    // gauntlet. Bomb leaves 63 with both pots live on its edges; Stinger
    // leaves 85 short of them; Mid Iron lays to 170, owned. Open throat, no
    // front hazard — the ground route is a real answer on the approach.
    // v2 (measured 0.23/65 — tonight's recurring lesson: a 63 and an 85 are
    // both wedges, and wedge-vs-wedge never gaps on its own). The pots move
    // in (8–18 off the line) and the green tightens 15 → 13: a wedge from
    // sugar-soft pot sand against a wedge from turf is now the difference
    // the drive was buying.
    num: 4, par: 4, length: 340, name: 'The Throat',
    corridor: [{ at: 0, half: 24 }, { at: 230, half: 22 }, { at: 340, half: 19 }],
    greenRadius: 13, greenSide: 0,
    // v3 (0.34/67 — one hundredth shy): the pots lengthen to cover the whole
    // of the Bomb's rest band (268–296), so the drive that buys the 63 has
    // no dry yardage to sneak through. Last iteration either way.
    hazards: [
      { surface: 'bunker', at: { down: 282, side: -13 }, rDown: 14, rSide: 5 },
      { surface: 'bunker', at: { down: 282, side: 13 }, rDown: 14, rSide: 5 },
    ],
    note: 'Two pots, dug by a man who knew exactly where your good drive finishes. He is buried elsewhere. Allegedly.',
  },
  {
    // Run past and chip back, lay and bump, or buy the fly: three prices for
    // the same birdie. Bomb leaves 223 — LI+15 arrives at the pin with a
    // ×1.35 cone into the greenside pots; the Stinger second pitches ON the
    // green and sits, while its edges pitch beside it and run to the gorse
    // line; LI naked stops 15 short and Bump and Run covers the rest.
    num: 5, par: 5, length: 500, name: 'The Apron',
    corridor: [{ at: 0, half: 24 }, { at: 270, half: 21 }, { at: 430, half: 19 }, { at: 500, half: 18 }],
    greenRadius: 15, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 492, side: -18 }, rDown: 8, rSide: 5 },
      { surface: 'bunker', at: { down: 492, side: 18 }, rDown: 8, rSide: 5 },
    ],
    note: 'The apron in front is the widest door on the course. Every way through it is honest and none of them is free.',
  },
  {
    // The slot fork, rationed one per course. Long Iron three past, ±20, and
    // the pots sit both sides at 182–200, 10–18 off the line — closer than
    // the Kiln's, because the links prices tighter. Mid Iron lays to 35 and
    // chips.
    num: 6, par: 3, length: 205, name: 'The Wee One',
    corridor: [{ at: 0, half: 15 }, { at: 205, half: 16 }],
    greenRadius: 13, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 191, side: -14 }, rDown: 9, rSide: 4 },
      { surface: 'bunker', at: { down: 191, side: 14 }, rDown: 9, rSide: 4 },
    ],
    note: 'Two hundred and five yards, two pots, no dunes to hide behind. The wee one is not on your side.',
  },
  {
    // Green light, funding the closer. Bomb leaves 33; the beach OB far left
    // takes a genuine hook only.
    num: 7, par: 4, length: 310, name: 'The Beach',
    corridor: [{ at: 0, half: 26 }, { at: 200, half: 24 }, { at: 310, half: 22 }],
    greenRadius: 15, greenSide: 0,
    hazards: [
      { surface: 'ob', at: { down: 240, side: -50 }, rDown: 70, rSide: 8 },
    ],
    note: 'The beach is out of bounds and out of reach of anything except the swing you brought on holiday.',
  },
  {
    // The one hole where the course says: today you fly. The slough crosses
    // 498–514. Bomb+LI stops 475–495 — dry — and the wedge cuts to 65 and
    // flies it. Bomb+Bomb pitches past the far bank, on the green, eagle
    // look. The ground route is refused: the Stinger's pitch band is in the
    // water from everywhere useful, and the note does not sell a sneak
    // (REVIEW-6 §5.4 — no lottery tickets advertised).
    num: 8, par: 5, length: 550, name: 'The Slough',
    corridor: [{ at: 0, half: 24 }, { at: 280, half: 21 }, { at: 450, half: 19 }, { at: 550, half: 18 }],
    greenRadius: 15, greenSide: 0,
    hazards: [
      { surface: 'water', at: { down: 506, side: 0 }, rDown: 8, rSide: 40 },
      { surface: 'bunker', at: { down: 522, side: -28 }, rDown: 10, rSide: 7 },
    ],
    note: 'The tide is in. It is always in when you get here. Every runner drowns; fly your third and be done with it.',
  },
]

export const DRIFTWOOD_PAR = DRIFTWOOD.reduce((n, h) => n + h.par, 0) // 32
