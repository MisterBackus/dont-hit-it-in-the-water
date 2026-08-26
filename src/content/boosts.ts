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
 *
 * SLICE-4 CALIBRATION PASS, same night (shopcheck, N=250, mixed, seeds
 * 600000+, under the finished world: ten-course pool rotation, canon-ladder
 * field coupling, depth planners). Thirteen of seventeen held the 1.4x-2.5x
 * band without touching. Five left it and were repriced, value over two:
 * Long Tees (3.60x), Forged Wedges (2.85x), Inside the Leather (2.57x),
 * Lucky Ball Marker (2.53x) drifted OVER — short-game and reach value grew
 * as the rotation added birdie courses — and Short Memory fell UNDER (see
 * its own comment). Forged Wedges crosses the premium line at its new
 * price, joining the major-drop shelf (shop.ts PREMIUM_BOOST).
 *
 * CALIBRATION-2 (26 Aug 2026 — the once-and-last pass with the MARQUEE RAMP
 * in the field, same instrument and seeds): the star tier trimmed every
 * return roughly proportionally, exactly as FIELD-CEILING §7.4 predicted —
 * the whole shelf compressed toward ~1.6-1.9x and FIFTEEN of seventeen held
 * the band untouched. The two that slipped under were the two cheapest
 * (Soft Spikes 1.37x, Short Memory 1.22x — least cushion above the floor),
 * both repriced to value over two, inside the pass's <= 2 budget. No tier
 * line moved; nothing drifted over.
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
    // Slice 4: $850k measured 2.85x under the finished world ($2.42M a
    // season) — repriced to value over two. Now premium: a major can drop it.
    spreadScale: 0.55, appliesTo: 'short', price: 1_200_000,
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
    // Slice 4: $1.25M measured 2.53x under the finished world ($3.17M a
    // season) — repriced to value over two.
    freeSinks: 1, price: 1_600_000,
  },
  {
    id: 'tees', name: 'Long Tees', icon: '⌃',
    blurb: 'Twenty more yards off the tee.',
    // Slice 4: the biggest drift in the shop — $1.0M measured 3.60x under
    // the finished world ($3.60M a season; the rotation's scoring courses
    // pay for reach off the tee). Repriced to value over two.
    carryAdd: 20, appliesTo: 'tee', price: 1_800_000,
  },
  {
    id: 'spikes', name: 'Soft Spikes', icon: '⌇',
    blurb: 'The rough stops being a problem.',
    // CALIBRATION-2 (stars in the field): $300k measured 1.37x ($412k a
    // season) — the tier trims every return and the cheapest items had the
    // least cushion. Repriced to value over two.
    roughRelief: true, price: 200_000,
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
    // Slice 4: $1.9M measured 2.57x under the finished world ($4.89M a
    // season) — repriced to value over two. Still the dearest thing sold.
    blurb: 'Anything inside eight feet is good. Pick it up.',
    gimmeFeet: 8, price: 2_450_000,
  },
  {
    id: 'shortmemory', name: 'Short Memory', icon: '≈',
    // The first boost to touch momentum — and the first counterplay purchase
    // against the focus-shadow holes the course designers price with.
    // The swingiest measurement in the shop, on purpose: $980k / $502k /
    // $901k across three independent seed sets (the cheap run was also the
    // richest one — bogey insurance pays least in the seasons that go well).
    // Priced on the spread: two of three runs landed in band at $500k.
    // Slice 4: the high side of that spread did not survive the finished
    // world — $508k and $625k on independent seed sets (1.02x / 1.25x at
    // the old sticker; a ten-course rotation full of scoring weeks has
    // fewer bogeys to insure). Repriced to the two-run mean over two.
    // CALIBRATION-2 (stars in the field): $300k measured 1.22x ($366k a
    // season) — its third repricing, every one downward, which is the
    // measurement being swingy AND the world genuinely shrinking bogey
    // insurance. Value over two, on the $50k grid.
    blurb: 'A bogey is not a story. Momentum survives one.',
    momentumSlack: 1, price: 200_000,
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

  // ---- added 26 Aug 2026, the SHOP-SUPPLY pass (§7 content work) ----
  // The tiered shop leans hardest on the thin tiers: five commons exhausted
  // by midsummer and the offer stream silted up with rares. Each SKU below
  // was measured through rewardcheck (SECTION=boosts, N=250, mixed, seeds
  // 600000+, verified on independent seeds 900000+) BEFORE the tier weights
  // were swept — the pool arithmetic the weights answer to includes these.
  // Prices are measured value over two on the $50k grid, as ever. The
  // stars-on band check at the end of the pass (shopcheck top section,
  // split purse in) found the tie split had compressed the WHOLE shelf
  // ~8% (bare season $5.96M -> $5.48M) — five SKUs under the 1.4 floor,
  // the two deepest both from this batch (rewardcheck is star- and
  // tie-blind, and the cheap end has the least cushion). Both repriced
  // to band-instrument value over two, inside the pass's <= 2 budget;
  // Fresh Grips / A Three Wood You Trust / The Circle of Friendship sit
  // at 1.36-1.37, inside the instrument's noise of the floor, and are a
  // standing verdict for the next calibration, not a third reprice. Axes
  // from ITEMS-PROPOSAL's unspent ledger: a second paying sponsor, momentum
  // insurance, a putting band below the Leather's, tee accuracy, long-iron
  // accuracy. An eighth candidate, Flushing It (carryAdd 10, any swing),
  // measured $3.89M — value over two prices it at $1.95M, which is the
  // TOUR ISSUE shelf, and premiums need no deepening (SHOP-SUPPLY §7):
  // culled for landing in the one tier whose whole job is being rare.
  {
    id: 'glove', name: 'New Glove', icon: '◇',
    // Measured $977k / $1.68M a season on independent seed sets — a
    // Short-Memory-grade spread (one focus point pays most in seasons
    // that need it least), first priced on the two-run mean over two.
    // SHOP-SUPPLY band check (stars + split purse, the instrument of
    // record): $743k a season, 1.14x at the $650k sticker — rewardcheck
    // is star-blind and the tie split compressed the whole shelf (bare
    // season $5.96M -> $5.48M), so the cheap end slipped hardest, same
    // shape as CALIBRATION-2's Soft Spikes. Repriced to value over two
    // on the measured $743k, inside the pass's <= 2 budget.
    blurb: 'One more focus to spend.',
    maxFocusBonus: 1, price: 350_000,
  },
  {
    id: 'bait', name: 'Sponsor: Shorty’s Bait & Tackle', icon: '▧',
    // The second sponsor that PAYS — Pontoon's shape at a lower price
    // point, exactly the axis §7 named. Measured $921k / $927k a season
    // on independent seed sets (~9.2 made cuts; the analytic agrees to
    // within noise, and so do the two runs). Value over two.
    blurb: 'A patch on the other sleeve. $100k every cut you make.',
    cutBonus: 100_000, price: 450_000,
  },
  {
    id: 'circle', name: 'The Circle of Friendship', icon: '◎',
    // The putting band below the Leather's: six feet against its eight.
    // gimmeRange takes the MAX, so this never stacks with the Leather —
    // buying up is an upgrade, not an addition, and the shop says so in
    // the price. Measured $2.59M / $2.51M a season on independent seed
    // sets; two-run mean over two.
    blurb: 'Inside six feet is good. Pick it up.',
    gimmeFeet: 6, price: 1_300_000,
  },
  {
    id: 'threewood', name: 'A Three Wood You Trust', icon: '⌐',
    // Tee-only accuracy — the first boost on the appliesTo:'tee' spread
    // axis (Long Tees is carry). Measured $1.48M / $2.09M a season on
    // independent seed sets — swingy like the other cheap SKUs, priced
    // on the two-run mean over two.
    blurb: 'A quarter straighter off the tee.',
    spreadScale: 0.75, appliesTo: 'tee', price: 900_000,
  },
  {
    id: 'concrete', name: 'Sponsor: Tri-County Concrete', icon: '▩',
    // The paying sponsor at special-order money: triple Shorty's rate,
    // triple the sticker. Measured $2.76M / $2.78M a season on
    // independent seed sets — the steadiest measurement in the batch,
    // because made cuts are. Value over two.
    blurb: 'Their name on your bag. $300k every cut you make.',
    cutBonus: 300_000, price: 1_400_000,
  },
  {
    id: 'slate', name: 'Clean Slate', icon: '□',
    // Momentum insurance above Short Memory's: two strokes of slack, so a
    // double keeps the well refilling. Stacks with Short Memory by sum
    // (effects.ts) — three slack between them, priced separately on their
    // own measurements. Measured $434k / $778k a season on independent
    // seed sets — bogey insurance is the swingiest thing this shelf
    // measures (see Short Memory) — first priced on the two-run mean
    // over two. SHOP-SUPPLY band check (stars + split purse): $332k a
    // season, 1.11x at the $300k sticker — repriced to value over two on
    // the measured number, the second of the pass's <= 2 repricings.
    // Still the smallest live value in the batch, and priced like it.
    blurb: 'A double is not a story either. Momentum survives two over.',
    momentumSlack: 2, price: 150_000,
  },
  {
    id: 'fade', name: 'A Baby Fade', icon: '◠',
    // Long-iron accuracy shy of the Golden Driver's (0.80 vs 0.66), at a
    // special-order sticker. Measured $2.19M / $2.38M a season on
    // independent seed sets; two-run mean over two.
    blurb: 'Anything long flies a fifth straighter. It just sits down.',
    spreadScale: 0.80, appliesTo: 'long', price: 1_150_000,
  },

  // ---- encounter-only, 25 Aug 2026 ----
  {
    id: 'foundtiger', name: 'Somebody’s Tiger', icon: '◐',
    // ENCOUNTER-ONLY (content/encounters.ts, The Lost Headcover). Price 0 and
    // never for sale: reducer.ts excludes ENCOUNTER_BOOSTS from the shop's
    // stock() and from a major's offerBoosts(). A superstition, not equipment
    // — a headcover found face down in the rough, kept. A whisker of calm,
    // forever, and the small permanent knowledge that it is not yours.
    blurb: 'A headcover from the rough. Not yours. 3% less scatter, and you know why.',
    spreadScale: 0.97, price: 0,
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
