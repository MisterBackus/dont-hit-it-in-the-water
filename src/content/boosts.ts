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
 * PRICES ARE MEASURED, NOT CHOSEN. tools/shopcheck.ts runs 200 seasons carrying
 * each boost all year and reports what it earned. The first pass found every
 * one of them underpriced by between three and twenty times — Marlene alone was
 * worth $4.40M for $220k — which made the pro shop a formality rather than a
 * decision. A boost should return between 1.4x and 2.5x its price over the part
 * of a season you will actually own it for.
 */
export const BOOSTS: readonly Boost[] = [
  {
    id: 'superball', name: 'Super Ball', icon: '◉',
    blurb: 'Everything goes 10% further. Everything.',
    carryScale: 1.10, price: 350_000,
  },
  {
    id: 'deadball', name: 'Dead Ball', icon: '◍',
    blurb: 'No run-out at all — but a third less scatter.',
    killRoll: true, spreadScale: 0.68, price: 110_000,
  },
  {
    id: 'goldenputter', name: 'Golden Putter', icon: '⌖',
    blurb: 'Every putt costs one less focus to hole.',
    sinkDiscount: 1, price: 390_000,
  },
  {
    id: 'goldendriver', name: 'Golden Driver', icon: '⌁',
    blurb: 'Shots over 200 yards fly a third straighter.',
    spreadScale: 0.66, appliesTo: 'long', price: 240_000,
  },
  {
    id: 'forged', name: 'Forged Wedges', icon: '◢',
    blurb: 'Short shots land where you meant them to.',
    spreadScale: 0.55, appliesTo: 'short', price: 155_000,
  },
  {
    id: 'grips', name: 'Fresh Grips', icon: '❖',
    blurb: 'Two more focus to spend.',
    maxFocusBonus: 2, price: 260_000,
  },
  {
    id: 'marlene', name: 'Marlene, Thirty Years Here', icon: '☂',
    blurb: 'Your caddie. One extra focus back every hole.',
    focusRegenBonus: 1, price: 500_000,
  },
  {
    id: 'marker', name: 'Lucky Ball Marker', icon: '✦',
    blurb: 'The first putt you hole each round is free.',
    freeSinks: 1, price: 340_000,
  },
  {
    id: 'tees', name: 'Long Tees', icon: '⌃',
    blurb: 'Twenty more yards off the tee.',
    carryAdd: 20, appliesTo: 'tee', price: 165_000,
  },
  {
    id: 'spikes', name: 'Soft Spikes', icon: '⌇',
    blurb: 'The rough stops being a problem.',
    roughRelief: true, price: 85_000,
  },
  {
    id: 'headcover', name: 'Sponsor: Deiter’s Heating & Cooling', icon: '▣',
    blurb: 'A decal on your bag, and a steadier swing. 15% less scatter.',
    spreadScale: 0.85, price: 165_000,
  },
  {
    id: 'yardagebook', name: 'A Good Yardage Book', icon: '▤',
    // Was "aim further off line", which measured at MINUS $128k a season: the
    // safe-aim option is not what is scarce here, so widening it bought
    // nothing and cost a shot. Same object, useful effect.
    blurb: 'You know where the trouble is. Every cone a shade tighter.',
    spreadScale: 0.92, price: 165_000,
  },
]

export const BOOST: Readonly<Record<string, Boost>> =
  Object.fromEntries(BOOSTS.map(b => [b.id, b]))
