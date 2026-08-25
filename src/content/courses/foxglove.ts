import type { HoleSpec } from '../../sim/types'

/**
 * FOXGLOVE — eight played holes, par 32. Host venue for mid-season
 * invitationals (The Founders Cup, whenever the calendar grows the slot).
 * Never a check week.
 *
 * One-sentence identity: WHAT WILL YOU PAY FOR THE RIGHT NUMBER? Every fork
 * asks a number in the ladder's seams — 148, 153, 187, 193, 209, 214 — where
 * naked cards putt from the fringe and the fits all cost something: nothing
 * but width (Extra Club, free, ×1.35), a focus for tightness (Smooth, Choke),
 * or a stroke for patience (the lay-up). Pine Hollow asks whether you own the
 * number; Foxglove asks what you'll pay to rent it.
 *
 * THIS COURSE IS ALSO AN INSTRUMENT (COURSE-SLATE.md §4, pre-registered):
 * REVIEW-6 §8.3 raised the escalation nobody has tested — the 1-focus tight
 * fits may be priced so low that "stretch" is never actually refused. If the
 * harness shows every Foxglove fork resolving into the same Extra-Club lookup
 * — high split nowhere, everyone buying the free loose fit — the finding is
 * that TECHNIQUE PRICING, not course geometry, caps the game's decision
 * count, and the dialogue formally escalates from course design to card
 * design. Either result is worth having.
 *
 * The world: old money, walled grounds, a club that has never once been in a
 * hurry. Fescue kept exactly long enough to disapprove. Victorian pits, deep,
 * faces revetted — recoverable, expensive. One ornamental pond that has
 * drowned more members than balls. Notes in the voice of a steward who has
 * seen your kind before.
 *
 * Tier: never-check-weeks (registered 'brutal' — the tier is SLOT DATA, not a
 * difficulty claim; the schedule's only reading of 'brutal' is "check weeks
 * avoid it", which is precisely this course's doctrine). Not major-capable.
 * ORDER: funds at 2, 3, 6 — deliberately two consecutive funds before the
 * 464, because the ask at 4 is the thesis and arrives fully funded or the
 * experiment is compromised.
 */
export const FOXGLOVE: readonly HoleSpec[] = [
  {
    // The first bill, presented at the one tee where everyone is rich (the
    // Rockdale-1 principle: hole 1's shadow starves nothing). Bomb leaves 153:
    // SI+15 five short and loose (free), Smooth MI two past and tight (a
    // focus). Stinger leaves 175: Mid Iron five short — on, free — and the
    // pond flanks exactly that line inside the aim band.
    num: 1, par: 4, length: 430, name: 'The Gates',
    corridor: [{ at: 0, half: 24 }, { at: 260, half: 21 }, { at: 430, half: 19 }],
    greenRadius: 15, greenSide: 0,
    hazards: [
      { surface: 'water', at: { down: 415, side: -20 }, rDown: 20, rSide: 8 },
    ],
    note: 'The gates are older than your country. The pond by the green has considered many arguments like yours.',
  },
  {
    // Funding round. Bomb leaves 71 (the Pitch, one short); Stinger leaves 93.
    num: 2, par: 4, length: 348, name: 'The Avenue',
    corridor: [{ at: 0, half: 25 }, { at: 230, half: 23 }, { at: 348, half: 21 }],
    greenRadius: 15, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 330, side: 24 }, rDown: 10, rSide: 6 },
    ],
    note: 'An avenue of oaks planted for a queen. Drive between them and try to look like you were invited.',
  },
  {
    // Second fund — the club pours you a sherry before the interrogation.
    num: 3, par: 3, length: 155, name: 'The Sherry',
    corridor: [{ at: 0, half: 16 }, { at: 155, half: 17 }],
    greenRadius: 14, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 140, side: -22 }, rDown: 9, rSide: 6 },
    ],
    note: 'A short one before the hard question. The club considers this good manners.',
  },
  {
    // THE THESIS, and the purest test of the pre-registration. Bomb leaves
    // 187: Mid Iron 17 short (off the front), MI+15 two short and loose
    // (free — and both Victorian pits are live on its bands, or the free
    // lookup would kill the hole, the Postcard lesson twice measured),
    // Smooth LI six past and tight (a focus). Stinger leaves 209: Long Iron
    // free and on — the Grind-precedent safe road, its own edges brushing
    // the same pits. Free-loose, paid-tight, or patient. REAL candidate.
    num: 4, par: 4, length: 464, name: 'The Ledger',
    corridor: [{ at: 0, half: 23 }, { at: 260, half: 20 }, { at: 464, half: 18 }],
    greenRadius: 14, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 448, side: -17 }, rDown: 12, rSide: 6 },
      { surface: 'bunker', at: { down: 448, side: 17 }, rDown: 12, rSide: 6 },
    ],
    note: 'Four-sixty-four, and nothing in your bag says 187. The club keeps a ledger of what people paid instead.',
  },
  {
    // The menu at par-5 stakes; aims at "some" honestly (fives are gap-poor).
    // Bomb leaves 235: the Stinger runs 20 past into the collar (free, dull);
    // LI+15 lands 12 short, chipping for eagle (free, loose).
    num: 5, par: 5, length: 512, name: 'The Trust',
    corridor: [{ at: 0, half: 24 }, { at: 270, half: 21 }, { at: 430, half: 19 }, { at: 512, half: 18 }],
    greenRadius: 15, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 495, side: 20 }, rDown: 10, rSide: 6 },
    ],
    note: 'Reachable, the steward concedes, in the way that most inheritances are: eventually, and not by force.',
  },
  {
    // Fund for the last three. Bomb leaves 45.
    num: 6, par: 4, length: 322, name: 'The Lawn',
    corridor: [{ at: 0, half: 26 }, { at: 210, half: 24 }, { at: 322, half: 22 }],
    greenRadius: 15, greenSide: 0,
    hazards: [],
    note: 'The lawn has been mown twice a day since 1907. Take your birdie and wipe your feet.',
  },
  {
    // Reach-or-lay with the price sheet attached. Long Iron six short of the
    // number and two past at rest — on, free. LI+15 nine past, loose, into
    // pits priced 10–18 off the line. Or lay to 44 and chip. The slot,
    // rationed, at 214 — spaced against 205/212/218 across the pool.
    // REAL candidate.
    num: 7, par: 3, length: 214, name: 'The Steward',
    corridor: [{ at: 0, half: 15 }, { at: 214, half: 16 }],
    greenRadius: 13, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 200, side: -14 }, rDown: 10, rSide: 4 },
      { surface: 'bunker', at: { down: 200, side: 14 }, rDown: 10, rSide: 4 },
    ],
    note: 'The steward has watched this tee for forty years. He can tell from your practice swing which pit you will visit.',
  },
  {
    // Spend what's left. The honest three: Bomb, Mid Iron, 81 left, the
    // wedge cuts — a free birdie look. The gamble: Bomb leaves 251, and the
    // Ripped Long Iron is 248, three short, at double width, for a focus.
    // The closer reads your wallet back to you.
    num: 8, par: 5, length: 528, name: 'The Bill',
    corridor: [{ at: 0, half: 24 }, { at: 280, half: 21 }, { at: 450, half: 19 }, { at: 528, half: 18 }],
    greenRadius: 15, greenSide: 0,
    hazards: [
      { surface: 'bunker', at: { down: 505, side: -20 }, rDown: 12, rSide: 7 },
      { surface: 'bunker', at: { down: 512, side: 22 }, rDown: 10, rSide: 6 },
    ],
    note: 'The bill arrives on a silver tray. It always did. Pay in focus, pay in strokes, or pay in dignity.',
  },
]

export const FOXGLOVE_PAR = FOXGLOVE.reduce((n, h) => n + h.par, 0) // 32
