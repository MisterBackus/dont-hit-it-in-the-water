import type { Boost } from '../sim/types'

/**
 * BOOSTS — equipment and superstitions. Always on, never drawn, never in the deck.
 *
 * This is the progression axis that actually works. Balance kept showing that
 * ADDING cards is worse than adding nothing, because every card you take is one
 * you draw less often — dilution beats any single card. A boost sidesteps that
 * entirely: it is permanently active and costs you no deck space.
 *
 * So the two rewards do different jobs. Cards are small, frequent, situational.
 * Boosts are rare and unconditional — earned by surviving a major, or bought
 * from the pro shop with money you would otherwise be banking to keep your job.
 *
 * PRICES ARE MEASURED, NOT CHOSEN. tools/shopcheck.ts runs 250 seasons carrying
 * each boost all year and reports what it earned. The first pass found every
 * one of them underpriced by between three and twenty times — Marlene alone was
 * worth $4.40M for $220k — which made the pro shop a formality rather than a
 * decision. A boost should return between 1.4x and 2.5x its price over the part
 * of a season you will actually own it for.
 *
 * Repriced 25 Aug 2026, twice over: momentum regen made every season richer
 * (the multiples had drifted back to 7x-20x), and the Money List moving to
 * GROSS earnings means a purchase no longer bets your card — so the price is
 * the entire cost of the thing, and it has to be a real one. Each price is the
 * measured full-season value over two, which lands mid-band at ~2.0x.
 */
export const BOOSTS: readonly Boost[] = [
  {
    id: 'superball', name: 'Super Ball', icon: '◉',
    blurb: 'Everything goes 10% further. Everything.',
    carryScale: 1.10, price: 2_400_000,
  },
  {
    id: 'deadball', name: 'Dead Ball', icon: '◍',
    blurb: 'No run-out at all — but a third less scatter.',
    killRoll: true, spreadScale: 0.68, price: 1_100_000,
  },
  {
    id: 'goldenputter', name: 'Golden Putter', icon: '⌖',
    blurb: 'Every putt costs one less focus to hole.',
    sinkDiscount: 1, price: 2_100_000,
  },
  {
    id: 'goldendriver', name: 'Golden Driver', icon: '⌁',
    blurb: 'Shots over 200 yards fly a third straighter.',
    spreadScale: 0.66, appliesTo: 'long', price: 1_650_000,
  },
  {
    id: 'forged', name: 'Forged Wedges', icon: '◢',
    blurb: 'Short shots land where you meant them to.',
    spreadScale: 0.55, appliesTo: 'short', price: 850_000,
  },
  {
    id: 'grips', name: 'Fresh Grips', icon: '❖',
    blurb: 'Two more focus to spend.',
    maxFocusBonus: 2, price: 1_450_000,
  },
  {
    id: 'marlene', name: 'Marlene, Thirty Years Here', icon: '☂',
    blurb: 'Your caddie. One extra focus back every hole.',
    focusRegenBonus: 1, price: 2_400_000,
  },
  {
    id: 'marker', name: 'Lucky Ball Marker', icon: '✦',
    blurb: 'The first putt you hole each round is free.',
    freeSinks: 1, price: 1_250_000,
  },
  {
    id: 'tees', name: 'Long Tees', icon: '⌃',
    blurb: 'Twenty more yards off the tee.',
    carryAdd: 20, appliesTo: 'tee', price: 1_000_000,
  },
  {
    id: 'spikes', name: 'Soft Spikes', icon: '⌇',
    blurb: 'The rough stops being a problem.',
    roughRelief: true, price: 300_000,
  },
  {
    id: 'headcover', name: 'Sponsor: Deiter’s Heating & Cooling', icon: '▣',
    blurb: 'A decal on your bag, and a steadier swing. 15% less scatter.',
    spreadScale: 0.85, price: 1_050_000,
  },
  {
    id: 'yardagebook', name: 'A Good Yardage Book', icon: '▤',
    // Was "aim further off line", which measured at MINUS $128k a season: the
    // safe-aim option is not what is scarce here, so widening it bought
    // nothing and cost a shot. Same object, useful effect.
    blurb: 'You know where the trouble is. Every cone a shade tighter.',
    spreadScale: 0.92, price: 600_000,
  },

  // ---- added 25 Aug 2026, each gated on a rewardcheck measurement ----
  // (tools/rewardcheck.ts SECTION=boosts, 250 seasons each, mixed play,
  //  seeds 600000+; every price is that run's measured value over two)
  {
    id: 'stiffshafts', name: 'Stiff Shafts', icon: '∥',
    // No boost added carry anywhere but the tee. Reach measured as the
    // deck's one scarce axis, so this is reach for the long irons, any lie.
    // Measured $1.92M a season.
    blurb: 'Fifteen more yards from anything long. Nobody asks how.',
    carryAdd: 15, appliesTo: 'long', price: 1_000_000,
  },
  {
    id: 'leather', name: 'Inside the Leather', icon: '◌',
    // The first boost to touch putting DISTANCE: the deterministic bands
    // were untouched by every piece of equipment until this one.
    // Measured $3.84M a season — every ≤8ft birdie stops costing two focus.
    blurb: 'Anything inside eight feet is good. Pick it up.',
    gimmeFeet: 8, price: 1_900_000,
  },
  {
    id: 'shortmemory', name: 'Short Memory', icon: '≈',
    // The first boost to touch momentum — and the first counterplay purchase
    // against the focus-shadow holes the course designers price with.
    // The swingiest measurement in the shop, on purpose: $980k / $502k /
    // $901k across three independent seed sets (the cheap run was also the
    // richest one — bogey insurance pays least in the seasons that go well).
    // Priced on the spread: two of three runs land in band at $500k.
    blurb: 'A bogey is not a story. Momentum survives one.',
    momentumSlack: 1, price: 500_000,
  },
  {
    id: 'pontoon', name: 'Sponsor: Lakeview Pontoon Rentals', icon: '▥',
    // The sponsor that PAYS — per made cut, into the same gross number the
    // Money List reads. A pontoon-rental decal, in this game, on purpose.
    // Measured $1.17M a season, which is ~7.8 made cuts: the analytic and
    // the simulated number agree to within noise.
    blurb: 'A patch on your sleeve. $150k every cut you make.',
    cutBonus: 150_000, price: 600_000,
  },
  {
    id: 'organized', name: 'An Organized Bag', icon: '▦',
    // The only boost that touches the redraw economy. Predicted small and
    // measured $1.11M — a cheaper redraw fires far more often than the
    // dead-hand model suggested. Priced accordingly.
    blurb: 'Everything where you left it. Checking the bag costs half.',
    redrawDiscount: 1, price: 550_000,
  },

  // NOT here, and measured out rather than talked out: NEW GROOVES
  // (sandRelief — bunkers play as fairway) measured $3k a season, dead zero.
  // Bunker visits are rare, mostly short splash-outs where the spread
  // penalty barely prices, and the over-90 sand refusal still does the real
  // damage. The sandRelief mechanism stays in the sim (types.ts/effects.ts,
  // one clause, same pattern as roughRelief) for content that can earn it;
  // the boost is culled. A measured rejection is a good outcome.
]

export const BOOST: Readonly<Record<string, Boost>> =
  Object.fromEntries(BOOSTS.map(b => [b.id, b]))
