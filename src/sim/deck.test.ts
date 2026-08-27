import { describe, expect, test } from 'vitest'
import { CARD, HAND_SIZE, REWARD_POOL, STARTING_DECK } from '../content/cards'
import { initialState } from './state'
import { draw } from './deck'
import { reduce, boostsOf, handShots, sinkPrice } from './reducer'
import { PUNCH_OUT, freeShot } from '../content/cards'
import { SEASON, MONEY_CHECKS, EVENT_COUNT, payout, tiePayout } from '../content/season'
import {
  CARD_PRICES, CUT_PRICE, PREMIUM_BOOST, SHOP_BUDGET, TOUR_ISSUE, cardPrice,
  tierOfPrice, type ShopTier,
} from '../content/shop'
import { BOOST, BOOSTS } from '../content/boosts'
import { baseputts, resolvePutting, sinkCost } from './resolve/putt'
import { LESSON_FEE } from '../content/weeks'
import { PINE_HOLLOW } from '../content/courses/pinehollow'
import { dropPoint } from './resolve/shot'
import {
  FULL_HOLES, extendField, extendPlayerRel, rankCut, standings, yourPlace,
  type FieldPlayer,
} from './resolve/field'
import { MAX_FOCUS, courseOf, currentHole } from './state'
import { toPin, greenCentre } from './geometry'
import { buildCone, focusRegen, whyNotPlayable } from './effects'
import { ENCOUNTERS, ENCOUNTER_BOOSTS } from '../content/encounters'
import { SAVE_VERSION } from '../platform/storage'

/** The opening hand across many seeds. */
function openingHands(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const s = initialState(1000 + i * 7919)
    return draw(HAND_SIZE, s.deck, s.discard, s.rng.draw).hand
  })
}

describe('the starting deck is shuffled', () => {
  test('different seeds give different opening hands', () => {
    const hands = openingHands(40).map(h => [...h].sort().join('|'))
    // regression: before the fix every single one of these was identical
    expect(new Set(hands).size).toBeGreaterThan(20)
  })

  test('techniques actually reach the opening hand', () => {
    const withTech = openingHands(200).filter(h =>
      h.some(id => CARD[id]!.kind === 'technique'))
    // 6 techniques in a 20-card deck, 6 drawn → most hands should hold one
    expect(withTech.length).toBeGreaterThan(120)
  })

  test('shuffling preserves the deck exactly — no cards lost or duplicated', () => {
    const s = initialState(42)
    expect([...s.deck].sort()).toEqual([...STARTING_DECK].sort())
  })

  test('the same seed still reproduces the same deck', () => {
    expect(initialState(7).deck).toEqual(initialState(7).deck)
    expect(initialState(7).deck).not.toEqual(initialState(8).deck)
  })
})

describe('the pro shop — money finally does something', () => {
  const shop = (seed: number, cash: number) => {
    const teed = reduce(reduce(initialState(seed), { type: 'START' }), { type: 'NEXT' })
    return reduce({ ...teed, phase: 'payout', earnings: cash, madeCut: true }, { type: 'NEXT' })
  }

  test('the shop stocks equipment and cards, all priced', () => {
    const s = shop(11, 5_000_000)
    expect(s.phase).toBe('shop')
    expect(s.offer.length).toBe(4)
    expect(s.offer.filter(i => i.kind === 'boost').length).toBe(2)
    expect(s.offer.every(i => i.price > 0)).toBe(true)
  })

  test('buying comes straight out of the Money List pot', () => {
    const s = shop(11, 5_000_000)
    const item = s.offer[0]!
    const after = reduce(s, { type: 'BUY', index: 0 })
    expect(after.earnings).toBe(5_000_000 - item.price)
    expect(after.offer.length).toBe(3)
  })

  test('you cannot buy what you cannot afford', () => {
    const s = shop(11, 1_000)
    expect(reduce(s, { type: 'BUY', index: 0 })).toBe(s)
    expect(reduce(s, { type: 'BUY_CUT' })).toBe(s)
    expect(reduce(s, { type: 'REROLL' })).toBe(s)
  })

  test('a bought card is on top of the deck for the next tee', () => {
    const s = shop(11, 5_000_000)
    const i = s.offer.findIndex(x => x.kind === 'card')
    const after = reduce(s, { type: 'BUY', index: i })
    expect(after.deck[0]).toBe(s.offer[i]!.id)
  })

  describe('the bag holds twenty — swap, not add', () => {
    // Measured (ITEMS-PROPOSAL.md): the same card is worth −$92k added and
    // +$1.16M swapped in. A prize that dilutes the bag is a trap; the cap is
    // what makes every card offer an honest question.
    const buyCard = (s: ReturnType<typeof shop>) => {
      const i = s.offer.findIndex(x => x.kind === 'card')
      return { after: reduce(s, { type: 'BUY', index: i }), bought: s.offer[i]!.id }
    }
    const size = (s: ReturnType<typeof shop>) =>
      s.deck.length + s.hand.length + s.discard.length

    test('buying at the cap opens the remove screen', () => {
      const s = shop(11, 5_000_000)
      expect(size(s)).toBe(20)
      const { after } = buyCard(s)
      expect(after.phase).toBe('remove')
      expect(after.mustSwap).toBe(true)
    })

    /**
     * SUPERSEDES "will not close empty" (26 Aug 2026, PLAYTEST-NOTES-1 note 3).
     * Backing out used to be refused, so the only escape was removing the card
     * you had just bought — the same change of mind, charged for — while a
     * paid cut was refunded in full. The owner found it the obvious way and
     * asked for the back arrow. Nothing has happened at this point: the card
     * is still on top of the deck where buy() put it, so putting it back is
     * exact rather than an approximation.
     */
    test('backing out of a swap refunds the card and returns to the shop', () => {
      const s = shop(11, 5_000_000)
      const { after, bought } = buyCard(s)
      const spentOn = s.earnings - after.earnings
      expect(spentOn).toBeGreaterThan(0)
      const back = reduce(after, { type: 'REMOVE_CARD', id: null })
      expect(back.phase).toBe('shop')
      expect(back.mustSwap).toBe(false)
      expect(back.earnings).toBe(s.earnings)          // every penny back
      expect(back.spent).toBe(s.spent)                // and off the gross too
      expect(size(back)).toBe(20)                     // the bag is as it was
      expect(back.deck.filter(id => id === bought).length)
        .toBe(s.deck.filter(id => id === bought).length)
    })

    test('the swap completes back to the shop at twenty cards', () => {
      const s = shop(11, 5_000_000)
      const { after } = buyCard(s)
      const victim = after.deck.find(id => id !== after.deck[0])!
      const done = reduce(after, { type: 'REMOVE_CARD', id: victim })
      expect(done.phase).toBe('shop')
      expect(done.mustSwap).toBe(false)
      expect(size(done)).toBe(20)
    })

    test('a cut below the cap opens a slot, and the next buy just fits', () => {
      const s = shop(11, 5_000_000)
      const paid = reduce(s, { type: 'BUY_CUT' })
      const thinned = reduce(paid, { type: 'REMOVE_CARD', id: paid.deck[1]! })
      expect(size(thinned)).toBe(19)
      const { after } = buyCard(thinned)
      expect(after.phase).toBe('shop')   // no forced swap — the slot was bought
      expect(after.mustSwap).toBe(false)
      expect(size(after)).toBe(20)
    })
  })

  describe('the lucky ball marker actually works', () => {
    // The owner bought it for $1.6M, went par-par-par-par, and missed the
    // cut: sinkPrice zeroed the price while a charge was held, the UI hides
    // price-zero buttons (that rule exists for tap-ins), and putt() then
    // skipped consuming a charge the price said was already free — three
    // correct-looking pieces composing into equipment no human could use.
    const onGreen = (focus: number, freeSinks: number) => {
      const teed = reduce(reduce(initialState(31), { type: 'START' }), { type: 'NEXT' })
      return { ...teed, focus, freeSinks, hole: { ...teed.hole, lie: 'green' as const, puttFeet: 16, strokes: 2 } }
    }

    test('a charged marker holes a putt a broke player could not buy', () => {
      const s = onGreen(1, 1)
      expect(sinkPrice(s, 16)).toBeGreaterThan(0)   // the price is the price
      const done = reduce(s, { type: 'PUTT', sink: true })
      expect(done.scores[0]).toBe(3)                // holed it — the birdie is real
      expect(done.freeSinks).toBe(0)                // and the charge was spent
    })

    test('without a charge, an unaffordable sink stays refused', () => {
      const s = onGreen(1, 0)
      expect(reduce(s, { type: 'PUTT', sink: true })).toBe(s)
    })
  })

  test('a bought boost is carried and never enters the deck', () => {
    const s = shop(11, 5_000_000)
    const i = s.offer.findIndex(x => x.kind === 'boost')
    const after = reduce(s, { type: 'BUY', index: i })
    expect(after.boosts).toContain(s.offer[i]!.id)
    expect(after.deck).not.toContain(s.offer[i]!.id)
  })

  test('paying to cut, then backing out, refunds you', () => {
    const s = shop(11, 5_000_000)
    const paid = reduce(s, { type: 'BUY_CUT' })
    expect(paid.phase).toBe('remove')
    expect(paid.earnings).toBe(5_000_000 - CUT_PRICE)
    const backedOut = reduce(paid, { type: 'REMOVE_CARD', id: null })
    expect(backedOut.earnings).toBe(5_000_000)
    expect(backedOut.phase).toBe('shop')
  })

  test('cutting a card shrinks the bag and does not refund', () => {
    const s = shop(11, 5_000_000)
    const paid = reduce(s, { type: 'BUY_CUT' })
    const size = paid.deck.length + paid.hand.length + paid.discard.length
    const done = reduce(paid, { type: 'REMOVE_CARD', id: paid.deck[0]! })
    expect(done.deck.length + done.hand.length + done.discard.length).toBe(size - 1)
    expect(done.earnings).toBe(5_000_000 - CUT_PRICE)
  })

  test('leaving the shop carries on to the next week', () => {
    const s = shop(11, 5_000_000)
    const after = reduce(s, { type: 'LEAVE_SHOP' })
    expect(['schedule', 'moneylist', 'over']).toContain(after.phase)
  })

  test('the shop opens even after a missed cut, with nothing to spend', () => {
    const teed = reduce(reduce(initialState(3), { type: 'START' }), { type: 'NEXT' })
    const s = reduce({ ...teed, phase: 'payout', earnings: 0, madeCut: false }, { type: 'NEXT' })
    expect(s.phase).toBe('shop')
    expect(s.offer.every(i => i.price > s.earnings)).toBe(true)
  })
})

/**
 * THE SEASON ALLOWANCE (SHOP-SUPPLY.md, 26 Aug 2026) — six boost purchases
 * a season, cards exempt. Every Money List bar since slice 4 was derived
 * under a season budget that lived only in the harness; the live game had
 * none, and the best player bought the entire shelf. This is that missing
 * rule, and these tests are what keep it from going missing again.
 */
describe('the season allowance — the budget the calibration always assumed', () => {
  const shop = (seed: number, cash: number) => {
    const teed = reduce(reduce(initialState(seed), { type: 'START' }), { type: 'NEXT' })
    return reduce({ ...teed, phase: 'payout' as const, earnings: cash, madeCut: true }, { type: 'NEXT' })
  }

  test('a fresh season carries the full allowance', () => {
    expect(initialState(1).buysLeft).toBe(SHOP_BUDGET)
  })

  test('buying a boost spends a pip; buying a card does not', () => {
    const s = shop(11, 50_000_000)
    const bi = s.offer.findIndex(i => i.kind === 'boost')
    const afterBoost = reduce(s, { type: 'BUY', index: bi })
    expect(afterBoost.buysLeft).toBe(s.buysLeft - 1)
    const ci = s.offer.findIndex(i => i.kind === 'card')
    const afterCard = reduce(s, { type: 'BUY', index: ci })
    expect(afterCard.buysLeft).toBe(s.buysLeft)
  })

  test('a boost past the budget is as illegal as one past the wallet', () => {
    const s = { ...shop(11, 50_000_000), buysLeft: 0 }
    const bi = s.offer.findIndex(i => i.kind === 'boost')
    expect(reduce(s, { type: 'BUY', index: bi })).toBe(s)
    // cards are exempt — they are not the power curve
    const ci = s.offer.findIndex(i => i.kind === 'card')
    expect(reduce(s, { type: 'BUY', index: ci })).not.toBe(s)
    // and the cut and the reroll never touch the allowance
    expect(reduce(s, { type: 'BUY_CUT' }).buysLeft).toBe(0)
  })

  test('a major\'s free drop arrives on top of the budget', () => {
    const teed = reduce(reduce(initialState(17), { type: 'START' }), { type: 'NEXT' })
    const atMajorCut = { ...teed, event: 4, phase: 'cut' as const, madeCut: true,
      scores: [4, 4, 4, 4], buysLeft: 0 }
    const offered = reduce(atMajorCut, { type: 'NEXT' })
    expect(offered.phase).toBe('boost')
    const took = reduce(offered, { type: 'TAKE_BOOST', id: offered.boostOffer[0]! })
    expect(took.boosts).toContain(offered.boostOffer[0]!)
    expect(took.buysLeft).toBe(0)   // free, and no pip either way
  })
})

/**
 * THE TIERED TRUCK (SHOP-SUPPLY.md) — the weekly stock draws a tier first
 * (off the rack 6 / special order 3 / tour issue 1), then an item within
 * it, all on the bank's own shop stream; a reroll redraws items WITHIN the
 * week's drawn tiers. Rarity that a $70k reroll could re-ask for a
 * different truck would be decoration.
 */
describe('the tiered truck', () => {
  const shop = (seed: number, cash = 5_000_000, event = 5) => {
    const teed = reduce(reduce(initialState(seed), { type: 'START' }), { type: 'NEXT' })
    return reduce(
      { ...teed, event, phase: 'payout' as const, earnings: cash, madeCut: true },
      { type: 'NEXT' })
  }

  test('the tier bands are the measured price bands', () => {
    expect(tierOfPrice(200_000)).toBe('rack')
    expect(tierOfPrice(PREMIUM_BOOST - 50_000)).toBe('rack')
    expect(tierOfPrice(PREMIUM_BOOST)).toBe('special')
    expect(tierOfPrice(TOUR_ISSUE - 50_000)).toBe('special')
    expect(tierOfPrice(TOUR_ISSUE)).toBe('tour')
    expect(tierOfPrice(2_450_000)).toBe('tour')
  })

  test('same seed, same truck — the stock is deterministic', () => {
    const a = shop(23)
    const b = shop(23)
    expect(a.offer).toEqual(b.offer)
    expect(a.shopTiers).toEqual(b.shopTiers)
  })

  test('the offer wears the tiers it drew', () => {
    const s = shop(23)
    const boosts = s.offer.filter(i => i.kind === 'boost')
    expect(s.shopTiers.length).toBe(boosts.length)
    boosts.forEach((item, i) => {
      expect(BOOST[item.id]!.tier).toBe(s.shopTiers[i])
    })
  })

  test('the early truck only carries the rack', () => {
    for (const seed of [7, 8, 9]) {
      const s = shop(seed, 5_000_000, 1)
      expect(s.shopTiers.every(t => t === 'rack')).toBe(true)
      for (const item of s.offer.filter(i => i.kind === 'boost')) {
        expect(BOOST[item.id]!.price).toBeLessThan(PREMIUM_BOOST)
      }
    }
  })

  test('a reroll re-asks the same truck — items change tiers do not', () => {
    // find a seed whose reroll actually draws different items, then hold
    // the tier layout fixed across several rerolls
    const s = shop(31, 5_000_000)
    let cur = s
    for (let i = 0; i < 3; i++) {
      const re = reduce(cur, { type: 'REROLL' })
      expect(re.shopTiers).toEqual(s.shopTiers)
      const boosts = re.offer.filter(x => x.kind === 'boost')
      boosts.forEach((item, k) => {
        expect(BOOST[item.id]!.tier).toBe(s.shopTiers[k])
      })
      cur = re
    }
  })

  /**
   * THE SEEDING RECEIPT. Rarity became stored data (Boost.tier) instead of
   * something inferred from the sticker, so that the shop's badge cannot
   * start lying the day a price band moves. This pins the one-time seeding:
   * every item that a shop can sell still wears exactly the tier its price
   * implied, which is what makes the change provably free — the shelf
   * SHOP-SUPPLY swept is the shelf that still ships. Only `found` is allowed
   * to disagree, because no price can describe a thing nobody sells.
   */
  test('stored rarity still matches the bands it was seeded from', () => {
    for (const b of BOOSTS) {
      if (b.tier === 'found') continue
      expect(b.tier).toBe(tierOfPrice(b.price))
    }
    const found = BOOSTS.filter(b => b.tier === 'found')
    expect(found.map(b => b.id)).toEqual(['foundtiger'])
    // and a found item is never on a shelf, at any event, at any seed
    for (let seed = 200; seed < 240; seed++) {
      for (const item of shop(seed).offer) expect(item.id).not.toBe('foundtiger')
    }
  })

  test('across many seeds the truck is mostly the rack, and the pool splits 9/8/7', () => {
    // the draw weights are 6/3/1 — sanity-check the shape, not the digits:
    // rack must be the modal tier by a wide margin over 40 fresh shops
    const tally: Record<ShopTier, number> = { rack: 0, special: 0, tour: 0 }
    for (let seed = 100; seed < 140; seed++) {
      for (const t of shop(seed).shopTiers) tally[t] += 1
    }
    expect(tally.rack).toBeGreaterThan(tally.special)
    expect(tally.special).toBeGreaterThan(tally.tour)
    // and the deepened pool the weights were swept against (SHOP-SUPPLY §7)
    const forSale = BOOSTS.filter(b => b.price > 0)
    const count = (t: string) => forSale.filter(b => b.tier === t).length
    expect(count('rack')).toBe(9)
    expect(count('special')).toBe(8)
    expect(count('tour')).toBe(7)
  })
})

describe('the season', () => {
  test('cones tighten and the cut tightens with them', () => {
    const first = SEASON[0]!, last = SEASON[SEASON.length - 1]!
    expect(first.sharpness).toBeGreaterThan(last.sharpness)   // you get better
    expect(first.advance).toBeGreaterThan(last.advance)       // fewer play on
  })

  test('the cut tightens by places, and never by a cliff', () => {
    // A stroke line could not make a curve: one stroke of movement swung
    // make-cut by more than twenty points, so the season was two cliffs.
    // A place is continuous, and no single week should lurch.
    for (let i = 1; i < SEASON.length; i++) {
      const step = SEASON[i - 1]!.advance - SEASON[i]!.advance
      expect(step).toBeGreaterThan(0)
      expect(step).toBeLessThanOrEqual(4)
    }
  })

  test('the season opens forgiving and ends demanding', () => {
    expect(SEASON[0]!.advance).toBeGreaterThanOrEqual(40)   // a beginner survives
    expect(SEASON[13]!.advance).toBeLessThanOrEqual(12)     // par is not enough
  })

  test('the last survival check is not the last event', () => {
    // A check after the final event is a verdict, not a checkpoint, and it
    // made the finale a lottery ticket worth more than a whole season.
    const last = MONEY_CHECKS[MONEY_CHECKS.length - 1]!
    expect(last.after).toBeLessThan(EVENT_COUNT)
    expect(EVENT_COUNT - last.after).toBeGreaterThanOrEqual(2)
  })

  test('winning a major buys the final leg — no longer the whole season', () => {
    // The old invariant — one win clears whatever the list is asking — died
    // with the net check. On GROSS earnings with re-anchored bars, money only
    // accumulates, and no single Sunday should equal twelve weeks of work.
    // What a win still is: the entire last leg of the climb in one cheque —
    // everything the list demands between the second check and the third. The
    // doomed-but-alive run keeps its target; it just has to be alive at 9.
    //
    // RE-PRICED at the SHOP-SUPPLY pass (26 Aug 2026), for the split purse:
    // under top-only ties in the 8-hole score space the MODAL winning group
    // was 2-3 players, so the leg was priced on tiePayout's 2-way value
    // (~$2.71M at a $20M purse) — a leg priced on the solo cheque would have
    // demanded a win AND the luck of winning alone, a lottery, not a leg.
    //
    // RE-PRICED BACK UP at CALIBRATION-3.md (26 Aug 2026): THE FULL
    // SCORECARD (FIELD-SPREAD.md SHIPPED) spread the field — 91% of 2,065
    // measured wins are SOLO on the 36-hole board (shopcheck WINS, 400
    // seasons) — so winning alone stopped being luck and became the normal
    // shape of winning. The cheque a win can be EXPECTED to pay is the solo
    // payout(purse, 1) = $3.4M at a $20M major again, and the leg's ceiling
    // rises ~$3.01M -> ~$3.78M at the standing tolerance: check 3 gets
    // ~$770k of headroom back, paid for by the spread, not by a bar move —
    // and the shipped triple spends it (leg $3.7M, CALIBRATION-3.md).
    const expectedWin = Math.max(...SEASON.map(e => payout(e.purse, 1)))
    const c = MONEY_CHECKS
    const lastLeg = c[c.length - 1]!.need - c[c.length - 2]!.need
    // The 0.9 tolerance stays: the leg is the residual of two measured bars
    // and has drifted past the win before (it sat at $3.6M under the
    // field-response triple).
    expect(expectedWin).toBeGreaterThan(lastLeg * 0.9)
    expect(expectedWin).toBeLessThan(c[c.length - 1]!.need)  // one win is not a season
    // and the leg must not be coverable by simply turning up — you have to win
    expect(payout(SEASON[13]!.purse, 10)).toBeLessThan(lastLeg)
  })

  test('making the cut always pays something', () => {
    // The old curve decayed 14% a place and paid 30th $20k out of $9M: the
    // game asked you to make the cut and then paid nothing for making it.
    for (const place of [10, 20, 30, 44]) {
      expect(payout(9_000_000, place)).toBeGreaterThan(75_000)
    }
    // and the spread from first to the back of the weekend stays golf-shaped
    expect(payout(9_000_000, 1) / payout(9_000_000, 30)).toBeGreaterThan(8)
  })

  test('split-purse ties pay the mean of the covered places', () => {
    // Tied at place p with k of you, the cheques for p..p+k-1 pool and split
    // evenly — the real tour's rule. A known purse, three-way tie at 1:
    const purse = 9_000_000
    const expected = Math.round((payout(purse, 1) + payout(purse, 2) + payout(purse, 3)) / 3)
    expect(tiePayout(purse, 1, 3)).toBe(expected)
    // less than a solo win, more than solo 3rd — a mean, not a discount
    expect(tiePayout(purse, 1, 3)).toBeLessThan(payout(purse, 1))
    expect(tiePayout(purse, 1, 3)).toBeGreaterThan(payout(purse, 3))
    // a solo finish is payout() unchanged
    expect(tiePayout(purse, 5, 1)).toBe(payout(purse, 5))
    // a tie hanging off the paid places splits only what the places carry
    expect(tiePayout(purse, 65, 2)).toBe(Math.round(payout(purse, 65) / 2))
  })

  test('settle settles the 36-hole week and pays the full split at every rank', () => {
    // THE FULL SCORECARD (FIELD-SPREAD.md §8): settle finishes the field's
    // week from the salt-10 stream and rolls your remainder from salt 11,
    // then pays tiePayout at whatever place the 36-hole board says. The
    // receipt is an independent recomputation from the exported extension
    // functions — settle's place, tie count and cheque must be exactly
    // that arithmetic, on every seed tried. (A T1 stays a win by the same
    // wiring: standings gives a shared lead place 1, and settle passes
    // the place through untouched.)
    const outcomes: { place: number; tied: number }[] = []
    for (const seed of [9, 10, 11, 12, 13, 14, 15, 16]) {
      const teed = reduce(reduce(initialState(seed), { type: 'START' }), { type: 'NEXT' })
      const course = courseOf(teed)
      const pars = course.holes.map(h => h.par)
      const rival = (name: string, total: number, star = false, cut = false): FieldPlayer =>
        ({ name, skill: 0.5, total, thru: 8, cut, star })
      const field = [
        rival('Cyrus Vail', -3, true),
        rival('Kaz Ito', 2, true, true),          // cut Friday — frozen
        ...Array.from({ length: 12 }, (_, i) => rival(`Filler ${i}`, (i % 5) - 2)),
      ]
      const done = reduce({ ...teed, scores: pars, phase: 'holed' as const,
        madeCut: true, field }, { type: 'NEXT' })
      expect(done.phase).toBe('payout')

      // the independent recomputation, straight from the salts
      const extField = extendField(field, pars, seed, 1, course.fieldShift)
      const rel36 = extendPlayerRel(0, pars.length, pars, seed, 1, course.fieldShift)
      expect(done.finalRel).toBe(rel36)
      expect(done.field.map(p => p.total)).toEqual(extField.map(p => p.total))
      // survivors finished the week; the cut man is frozen where he fell
      expect(done.field.filter(p => !p.cut).every(p => p.thru === FULL_HOLES)).toBe(true)
      expect(done.field.find(p => p.name === 'Kaz Ito')).toMatchObject({ total: 2, thru: 8 })

      const rows = standings(extField, rel36, FULL_HOLES, false)
      const place = yourPlace(rows)
      const tied = rows.filter(r => r.place === place).length
      expect(done.lastPlace).toBe(place)
      expect(done.lastPaid).toBe(tiePayout(9_000_000, place, tied))
      const rec = done.seasonRecord[done.seasonRecord.length - 1]!
      expect(rec).toMatchObject({ event: 1, madeCut: true, place, tied })
      expect(rec.aheadOf).toContain('Kaz Ito')     // you outlasted him
      outcomes.push({ place, tied })
    }
    // across the seeds the split must actually ENGAGE below first place at
    // least once — the cheque the top-only compromise never divided. This
    // is deterministic: fixed seeds, fixed extension streams.
    expect(outcomes.some(o => o.tied > 1 && o.place > 1)).toBe(true)
    // and the spread world spreads: places differ across seeds
    expect(new Set(outcomes.map(o => o.place)).size).toBeGreaterThan(1)
  })

  test('a missed cut still watches the field finish its week', () => {
    const teed = reduce(reduce(initialState(9), { type: 'START' }), { type: 'NEXT' })
    const rival = (name: string, total: number, cut = false): FieldPlayer =>
      ({ name, skill: 0.5, total, thru: 4, cut })
    const field = [
      rival('Wes Hollis', -2), rival('Bo Pike', 0),
      rival('Dead Weight', 6, true),               // cut alongside you
    ]
    const done = reduce({ ...teed, scores: [5, 5, 5, 5], madeCut: false,
      phase: 'cut' as const, field }, { type: 'NEXT' })
    expect(done.phase).toBe('payout')
    expect(done.lastPaid).toBe(0)
    expect(done.finalRel).toBe(null)               // you have no weekend
    // the survivors played to the 36th hole; the cut are frozen thru 4
    expect(done.field.filter(p => !p.cut).every(p => p.thru === FULL_HOLES)).toBe(true)
    expect(done.field.find(p => p.name === 'Dead Weight')).toMatchObject({ total: 6, thru: 4 })
  })

  test('the extension cannot touch the cut, the bank, or a played digit', () => {
    // FIELD-SPREAD.md §8 prediction (b): zero cut movement, by construction
    // — and the construction, verified. The reducer's own rankCut fires at
    // hole 4; settle then finishes the week from one-shot derived streams.
    // The line, the overflow, the membership and every bank stream must
    // read exactly what the cut phase wrote.
    for (const seed of [31, 32, 33]) {
      const teed = reduce(reduce(initialState(seed), { type: 'START' }), { type: 'NEXT' })
      const pars = courseOf(teed).holes.map(h => h.par)
      const rival = (name: string, total: number): FieldPlayer =>
        ({ name, skill: 0.4 + (total + 3) * 0.03, total, thru: 4, cut: false })
      // sixty players spread −3..+8 thru 4, so the rank cut really cuts
      const field = Array.from({ length: 60 }, (_, i) => rival(`P${i}`, (i % 12) - 3))
      const atCut = reduce({ ...teed, field, scores: pars.slice(0, 4),
        phase: 'holed' as const }, { type: 'NEXT' })
      expect(atCut.phase).toBe('cut')
      const line = atCut.cutLine
      const advanced = atCut.cutAdvanced
      const membership = atCut.field.map(p => p.cut)
      const bank = atCut.rng

      // finish the event from the cut field and let settle roll the week
      const done = reduce({ ...atCut, scores: pars, phase: 'holed' as const },
        { type: 'NEXT' })
      expect(done.phase).toBe('payout')
      expect(done.cutLine).toBe(line)                       // the digit receipt
      expect(done.cutAdvanced).toBe(advanced)
      expect(done.field.map(p => p.cut)).toEqual(membership)
      expect(done.rng).toEqual(bank)                        // no bank stream consumed
      // the cut players are frozen at their real-hole totals
      done.field.forEach((p, i) => {
        if (p.cut) expect(p.total).toBe(atCut.field[i]!.total)
      })
    }
  })

  test('the cut is judged on the front four, so they must be a real test', () => {
    // With the easy holes first the median through four sat at -1 all season
    // and 92% of rounds survived event 1 — the cut never bit.
    // Pinned to the course file on purpose: this is a claim about Pine
    // Hollow's DESIGN (hard holes first), not about whichever course the
    // schedule deals — same rule as the water-drop tests below.
    const front = PINE_HOLLOW.slice(0, 4)
    const back = PINE_HOLLOW.slice(4)
    expect(front.reduce((a, h) => a + h.par, 0)).toBeLessThan(
      back.reduce((a, h) => a + h.par, 0))
    // at least two long par 4s up front
    expect(front.filter(h => h.par === 4 && h.length > 430).length).toBeGreaterThanOrEqual(2)
    // and no par 5 to birdie before the cut
    expect(front.some(h => h.par === 5)).toBe(false)
  })

  test('four majors, spaced', () => {
    const majors = SEASON.filter(e => e.major).map(e => e.num)
    expect(majors).toEqual([4, 7, 11, 14])
    for (const e of SEASON) {
      expect(e.purse).toBe(e.major ? 20_000_000 : 9_000_000)
    }
  })

  test('sharpness is applied to every cone', () => {
    const early = { ...initialState(1), event: 1 }
    const late = { ...initialState(1), event: 14 }
    const plan = { shot: CARD['midiron'] as never, techniques: [], aim: 'pin' as const }
    const wide = buildCone(plan, 'fairway', 999, boostsOf(early)).cone
    const tight = buildCone(plan, 'fairway', 999, boostsOf(late)).cone
    expect(tight.spread).toBeLessThan(wide.spread)
  })
})

describe('the season flows end to end', () => {
  test('cutting a card between events never deals a ninth hole', () => {
    // regression: removeCard used to call dealHole(scores.length) with 8 scores,
    // which indexed past the course and crashed the whole app
    let s = reduce(reduce(initialState(9), { type: 'START' }), { type: 'NEXT' })
    s = { ...s, scores: [4, 3, 4, 5, 4, 3, 4, 5], phase: 'remove',
          earnings: 1_000_000, cutIsPaid: true }
    const done = reduce(s, { type: 'REMOVE_CARD', id: s.deck[1]! })
    expect(done.hole.index).toBeLessThan(8)
    expect(done.phase).toBe('shop')
  })

  test('a whole season can be played to its end without crashing', () => {
    let s = reduce(initialState(77), { type: 'START' })
    const phases = new Set<string>()
    for (let i = 0; i < 6000 && s.phase !== 'over'; i++) {
      phases.add(s.phase)
      if (s.phase === 'shop') { s = reduce(s, { type: 'LEAVE_SHOP' }); continue }
      if (s.phase === 'remove') { s = reduce(s, { type: 'REMOVE_CARD', id: s.deck[1]! }); continue }
      // sit out roughly every fourth week, to exercise the week nodes
      if (s.phase === 'schedule' && s.event % 4 === 0 && s.weekOptions.length) {
        s = reduce(s, { type: 'TAKE_WEEK', id: s.weekOptions[0]! }); continue
      }
      if (s.phase === 'boost') { s = reduce(s, { type: 'TAKE_BOOST', id: s.boostOffer[0]! }); continue }
      // say yes to everyone, so the interpreter gets exercised end to end
      if (s.phase === 'encounter') { s = reduce(s, { type: 'ENGAGE' }); continue }
      if (s.phase === 'playing' && s.hole.puttFeet !== null) {
        s = reduce(s, { type: 'PUTT', sink: false }); continue
      }
      if (s.phase === 'playing') {
        // play the shot closest to the number, so the bot actually makes cuts
        const dist = toPin(currentHole(s), s.hole.ball)
        const ranked = [...handShots(s)].sort((a, b) => {
          const ca = a.carry > dist ? (a.carry - dist) * 1.3 : dist - a.carry
          const cb = b.carry > dist ? (b.carry - dist) * 1.3 : dist - b.carry
          return ca - cb
        })
        let moved = false
        for (const shot of ranked) {
          const picked = reduce(s, { type: 'SELECT_SHOT', id: shot.id })
          const hit = reduce(picked, { type: 'COMMIT' })
          if (hit !== picked) { s = hit; moved = true; break }
        }
        if (!moved) s = reduce(s, { type: 'NEXT' })
        continue
      }
      s = reduce(s, { type: 'NEXT' })
    }
    expect(s.phase).toBe('over')
    // it must actually have gone somewhere — not died on event 1
    expect(s.event).toBeGreaterThan(1)
    // and every season screen must have been reachable
    for (const need of ['schedule', 'cut', 'payout', 'shop', 'moneylist']) {
      expect(phases, `never reached "${need}"`).toContain(need)
    }
  })
})

describe('you can always keep playing — no softlocks', () => {
  /** Every position on every hole must offer at least one legal move. */
  const canAct = (s: ReturnType<typeof initialState>) =>
    s.hole.puttFeet !== null ||
    handShots(s).some(sh => !whyNotPlayable(sh, s.hole.lie))

  test('a water drop that lands on the green registers a putt', () => {
    // regression: a low runner pitched in the water and rolled past the green,
    // the drop was computed from where it STOPPED, and the ball ended up on the
    // green with puttFeet null — every shot refused, no putting controls.
    const hole = PINE_HOLLOW.find(h => h.name === 'Two Ways Home')!
    const g = greenCentre(hole)
    let s = reduce(reduce(initialState(4242), { type: 'START' }), { type: 'NEXT' })
    s = { ...s, hole: { ...s.hole, ball: { down: g.down - 8, side: 0 }, lie: 'green', puttFeet: null } }
    // the state above is exactly the broken one; the reducer must never build it
    expect(canAct({ ...s, hole: { ...s.hole, puttFeet: 24 } })).toBe(true)
  })

  test('the drop comes from where it pitched, not where it stopped', () => {
    const pitchedInWater = { down: 495, side: -6 }
    expect(dropPoint(pitchedInWater).down).toBe(470)
    // and never past the green, which is what caused the lock
    expect(dropPoint(pitchedInWater).down)
      .toBeLessThan(PINE_HOLLOW.find(h => h.name === 'Two Ways Home')!.length - 20)
  })

  test('playing ten thousand shots never produces a stuck position', () => {
    let s = reduce(reduce(initialState(2024), { type: 'START' }), { type: 'NEXT' })
    for (let i = 0; i < 4000; i++) {
      if (s.phase === 'shop') { s = reduce(s, { type: 'LEAVE_SHOP' }); continue }
      if (s.phase === 'remove') { s = reduce(s, { type: 'REMOVE_CARD', id: null }); continue }
      if (s.phase === 'boost') { s = reduce(s, { type: 'TAKE_BOOST', id: s.boostOffer[0]! }); continue }
      if (s.phase === 'encounter') { s = reduce(s, { type: 'WALK_ON' }); continue }
      if (s.phase === 'over') break
      if (s.phase !== 'playing') { s = reduce(s, { type: 'NEXT' }); continue }

      expect(canAct(s), `stuck on hole ${s.hole.index + 1} in ${s.hole.lie}`).toBe(true)

      if (s.hole.puttFeet !== null) { s = reduce(s, { type: 'PUTT', sink: false }); continue }
      let moved = false
      for (const shot of handShots(s)) {
        const picked = reduce(s, { type: 'SELECT_SHOT', id: shot.id })
        const hit = reduce(picked, { type: 'COMMIT' })
        if (hit !== picked) { s = hit; moved = true; break }
      }
      if (!moved) s = reduce(s, { type: 'NEXT' })
    }
  })
})

describe('the leaderboard', () => {
  test('a field is dealt at the start of an event and everyone plays along', () => {
    let s = reduce(reduce(initialState(808), { type: 'START' }), { type: 'NEXT' })
    expect(s.field.length).toBeGreaterThan(60)
    expect(s.field.every(p => p.thru === 0)).toBe(true)
    // play the first hole out
    for (let i = 0; i < 40 && s.scores.length === 0; i++) {
      if (s.hole.puttFeet !== null) { s = reduce(s, { type: 'PUTT', sink: false }); continue }
      let moved = false
      for (const sh of handShots(s)) {
        const picked = reduce(s, { type: 'SELECT_SHOT', id: sh.id })
        const hit = reduce(picked, { type: 'COMMIT' })
        if (hit !== picked) { s = hit; moved = true; break }
      }
      if (!moved) s = reduce(s, { type: 'NEXT' })
    }
    expect(s.scores.length).toBe(1)
    expect(s.field.every(p => p.thru === 1)).toBe(true)
  })

  test('ties share a place and are marked, and you are on the board', () => {
    const field = [
      { name: 'A', skill: .5, total: -2, thru: 8, cut: false },
      { name: 'B', skill: .5, total: -1, thru: 8, cut: false },
      { name: 'C', skill: .5, total: -1, thru: 8, cut: false },
    ]
    const rows = standings(field, -1, 8, false)
    expect(rows[0]!.place).toBe(1)
    // three players tied on -1 all share second
    const tiedPlaces = rows.filter(r => r.total === -1).map(r => r.place)
    expect(new Set(tiedPlaces)).toEqual(new Set([2]))
    // every member of a tie group is marked, including the first
    expect(rows.filter(r => r.total === -1).every(r => r.tied)).toBe(true)
    expect(rows.find(r => r.total === -2)!.tied).toBe(false)
    expect(rows.some(r => r.you)).toBe(true)
  })

  test('missing the cut takes you off the board and out of the field', () => {
    const field = [
      { name: 'A', skill: .5, total: -2, thru: 4, cut: false },
      { name: 'B', skill: .5, total: 4, thru: 4, cut: false },
    ]
    // top 2 and ties out of three players (two here plus you at +5)
    const res = rankCut(field, 5, 2)
    expect(res.field[0]!.cut).toBe(false)
    expect(res.field[1]!.cut).toBe(false)
    expect(res.made).toBe(false)
    expect(res.advanced).toBe(2)
    expect(standings(res.field, 5, 4, true).some(r => r.you)).toBe(false)
    expect(standings(res.field, 5, 4, true).length).toBe(2)
  })

  test('the field is deterministic from the seed', () => {
    const a = reduce(reduce(initialState(1234), { type: 'START' }), { type: 'NEXT' })
    const b = reduce(reduce(initialState(1234), { type: 'START' }), { type: 'NEXT' })
    expect(a.field.map(p => p.name)).toEqual(b.field.map(p => p.name))
    const c = reduce(reduce(initialState(5678), { type: 'START' }), { type: 'NEXT' })
    expect(a.field.map(p => p.name)).not.toEqual(c.field.map(p => p.name))
  })
})

describe('sitting a week out', () => {
  const atSchedule = (seed: number, cash = 2_000_000) => {
    const s = reduce(initialState(seed), { type: 'START' })
    return { ...s, earnings: cash }
  }

  test('the schedule always offers two alternatives to playing', () => {
    const s = atSchedule(21)
    expect(s.phase).toBe('schedule')
    expect(s.weekOptions.length).toBe(2)
    expect(new Set(s.weekOptions).size).toBe(2)
  })

  test('a range week tightens every cone for the rest of the season', () => {
    const s = { ...atSchedule(21), weekOptions: ['range', 'exhibition'] }
    const after = reduce(s, { type: 'TAKE_WEEK', id: 'range' })
    expect(after.practice).toBeLessThan(1)
    const plan = { shot: CARD['midiron'] as never, techniques: [], aim: 'pin' as const }
    const before = buildCone(plan, 'fairway', 999, boostsOf(s)).cone.spread
    const now = buildCone(plan, 'fairway', 999, boostsOf(after)).cone.spread
    expect(now).toBeLessThan(before)
  })

  test('practice stacks', () => {
    let s = { ...atSchedule(21), weekOptions: ['range', 'lesson'] }
    const one = reduce(s, { type: 'TAKE_WEEK', id: 'range' })
    s = { ...one, weekOptions: ['range', 'lesson'], phase: 'schedule' }
    const two = reduce(s, { type: 'TAKE_WEEK', id: 'range' })
    expect(two.practice).toBeLessThan(one.practice)
  })

  test('a sponsor pays now and taxes focus for the next three events', () => {
    const s = { ...atSchedule(21), weekOptions: ['sponsor', 'range'] }
    const after = reduce(s, { type: 'TAKE_WEEK', id: 'sponsor' })
    expect(after.earnings).toBe(s.earnings + 300_000)
    expect(after.sponsorContracts).toEqual([3])
  })

  test('the contract runs out — three events later the focus is back', () => {
    // sign at event 1; the tax must hold at the tee of events 2, 3 and 4 and
    // be gone at the tee of event 5. WEEKS-VERDICT option B-1: the permanent
    // −1 was the game's only arithmetic trap; the cap is what makes it a loan.
    const s = { ...atSchedule(21), weekOptions: ['sponsor', 'range'] }
    let at = reduce(s, { type: 'TAKE_WEEK', id: 'sponsor' })
    for (let played = 0; played < 3; played++) {
      expect(at.phase).toBe('schedule')
      const teed = reduce(at, { type: 'NEXT' })
      expect(teed.focus).toBe(MAX_FOCUS - 1)   // the tax, at the tee
      // fabricate a finished event and let it settle
      const scores = courseOf(teed).holes.map(h => h.par)
      const done = reduce(
        { ...teed, scores, madeCut: true, phase: 'holed' as const, earnings: 50_000_000 },
        { type: 'NEXT' })                       // -> settle -> payout
      expect(done.phase).toBe('payout')
      expect(done.sponsorContracts).toEqual(played < 2 ? [2 - played] : [])
      at = reduce(reduce(done, { type: 'NEXT' }), { type: 'LEAVE_SHOP' })
      if (at.phase === 'moneylist') at = reduce(at, { type: 'NEXT' })
    }
    // the fourth event after signing: the contract has expired
    expect(at.sponsorContracts).toEqual([])
    const fourth = reduce(at, { type: 'NEXT' })
    expect(fourth.focus).toBe(MAX_FOCUS)
  })

  test('a lesson is the one week you also pay for, and you cannot go into debt', () => {
    const rich = { ...atSchedule(21, 1_000_000), weekOptions: ['lesson', 'range'] }
    expect(reduce(rich, { type: 'TAKE_WEEK', id: 'lesson' }).earnings)
      .toBe(1_000_000 - LESSON_FEE)
    const broke = { ...atSchedule(21, 1_000), weekOptions: ['lesson', 'range'] }
    expect(reduce(broke, { type: 'TAKE_WEEK', id: 'lesson' })).toBe(broke)
  })

  test('sitting out costs the week — the season moves on without you', () => {
    const s = { ...atSchedule(21), weekOptions: ['exhibition', 'range'] }
    const after = reduce(s, { type: 'TAKE_WEEK', id: 'exhibition' })
    expect(after.skipped).toBe(1)
    expect(after.event).toBeGreaterThan(s.event)
    expect(after.phase).toBe('schedule')
  })

  test('a free fitting spends the week too — no cutting for nothing', () => {
    const s = { ...atSchedule(21), weekOptions: ['fitting', 'range'] }
    const cutting = reduce(s, { type: 'TAKE_WEEK', id: 'fitting' })
    expect(cutting.phase).toBe('remove')
    expect(cutting.cutIsPaid).toBe(false)
    const done = reduce(cutting, { type: 'REMOVE_CARD', id: cutting.deck[0]! })
    expect(done.event).toBeGreaterThan(s.event)   // the week is gone
  })

  test('you cannot take a week that was not offered', () => {
    const s = { ...atSchedule(21), weekOptions: ['range', 'exhibition'] }
    expect(reduce(s, { type: 'TAKE_WEEK', id: 'sponsor' })).toBe(s)
  })

  test('the draw follows the measurement — biased early, silent at majors and late', () => {
    // WEEKS-VERDICT.md option C-2. Events 1–4: a practice option is
    // guaranteed the first slot, because that window is where they pay.
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      const s = reduce(initialState(seed), { type: 'START' })
      expect(['range', 'fitting', 'lesson']).toContain(s.weekOptions[0]!)
      expect(s.weekOptions.length).toBe(2)
      expect(new Set(s.weekOptions).size).toBe(2)
    }
    // a major offers nothing — skipping THE major measured −$3.59M
    const shop3 = { ...atSchedule(21), event: 3, phase: 'shop' as const, offer: [] }
    const at4 = reduce(shop3, { type: 'LEAVE_SHOP' })
    expect(at4.event).toBe(4)
    expect(at4.weekOptions).toEqual([])
    // and from event 10 the node goes quiet: every option skips the event,
    // and every late skip is a known loss
    const shop11 = { ...atSchedule(21), event: 11, phase: 'shop' as const, offer: [] }
    const at12 = reduce(shop11, { type: 'LEAVE_SHOP' })
    expect(at12.event).toBe(12)
    expect(at12.weekOptions).toEqual([])
  })
})

/**
 * A WHOLE SEASON, END TO END.
 *
 * Simulation has never been the thing that finds the breaking bugs — a harness
 * happily "played" a softlocked position because the numbers looked reasonable.
 * This one drives the REDUCER, the same door the UI knocks on, and asserts that
 * every phase it lands in has a legal action out of it. A season that cannot be
 * finished is the only bug that matters more than a balance number.
 */
describe('a season can be played to its end', () => {
  function playSeason(seed: number) {
    let s = reduce(initialState(seed), { type: 'START' })
    let steps = 0
    const seen = new Set<string>()

    while (s.phase !== 'over') {
      if (++steps > 20_000) throw new Error(`stuck in ${s.phase} at event ${s.event}`)
      seen.add(s.phase)
      switch (s.phase) {
        case 'playing': {
          if (s.hole.puttFeet !== null) { s = reduce(s, { type: 'PUTT', sink: false }); break }
          const shots = handShots(s).filter(c => !whyNotPlayable(c, s.hole.lie))
          const pick = shots[0] ?? PUNCH_OUT
          s = reduce(s, { type: 'SELECT_SHOT', id: pick.id })
          s = reduce(s, { type: 'COMMIT' })
          break
        }
        case 'shop': s = reduce(s, { type: 'LEAVE_SHOP' }); break
        case 'remove': s = reduce(s, { type: 'REMOVE_CARD', id: s.deck[0] ?? null }); break
        case 'boost': s = reduce(s, { type: 'TAKE_BOOST', id: s.boostOffer[0]! }); break
        case 'encounter': s = reduce(s, { type: 'ENGAGE' }); break
        default: s = reduce(s, { type: 'NEXT' })
      }
    }
    return { state: s, seen }
  }

  test('every seed reaches an ending, and none of them hangs', () => {
    for (const seed of [1, 2, 3, 17, 404, 9_001]) {
      const { state } = playSeason(seed)
      expect(state.phase).toBe('over')
      // you either ran out of money at a check, or you played all fourteen
      const died = state.keptJob === false
      expect(died || state.event === EVENT_COUNT).toBe(true)
      expect(state.cutsMade + state.cutsMissed).toBeGreaterThan(0)
    }
  })

  test('the last two events cannot end a season', () => {
    // survival stops at event 12; 13 and 14 only decide how well you finish
    for (const seed of [5, 6, 7, 8, 12, 33, 77]) {
      const { state } = playSeason(seed)
      if (state.keptJob === false) expect(state.event).toBeLessThanOrEqual(12)
    }
  })

  test('a season that goes the distance passes through all of its rooms', () => {
    const { seen } = playSeason(17)
    for (const phase of ['schedule', 'playing', 'cut', 'payout', 'shop']) {
      expect(seen.has(phase as never)).toBe(true)
    }
  })
})

/**
 * THE FREE SHOT MUST BE USEFUL AT BOTH ENDS OF THE BAG.
 *
 * Punch Out is a floor for being stuck long. Until a playtest found three
 * holes in a row with no wedge in hand, there was no floor for being stuck
 * short: from 36 yards the best available play finished 33 past the pin,
 * which is not a decision, it is a forfeit.
 */
describe('the free shot', () => {
  test('inside 60 yards it is a chip, outside it is a punch out', () => {
    expect(freeShot(36).id).toBe('chipout')
    expect(freeShot(60).id).toBe('chipout')
    expect(freeShot(61).id).toBe('punchout')
    expect(freeShot(150).id).toBe('punchout')
  })

  test('from anywhere short, something in hand can finish near the pin', () => {
    // the hand that started this: two long irons and a mid iron, nothing else
    for (const dist of [20, 30, 36, 45, 55, 60]) {
      const { cone } = buildCone(
        { shot: freeShot(dist), techniques: [], aim: 'pin' }, 'fairway', dist,
      )
      const past = cone.carry + cone.roll - dist
      expect(Math.abs(past)).toBeLessThanOrEqual(10)
    }
  })

  test('it never makes a real wedge redundant', () => {
    // the free chip must be the WORST way to play a short shot, or the
    // short cards stop being worth deck space (P2 works both ways)
    const dist = 36
    const coneOf = (id: string) => buildCone(
      { shot: CARD[id] as never, techniques: [], aim: 'pin' }, 'fairway', dist,
    ).cone.spread
    for (const id of ['flop', 'pitch', 'fullwedge', 'bumpandrun']) {
      expect(coneOf(id)).toBeLessThan(coneOf('chipout'))
    }
  })
})

/**
 * OFF WEEKS ARE CONFIRMED, NOT CLICKED.
 *
 * Signing with a sponsor costs a focus on every hole for the rest of the
 * season. That button used to fire on one click, sitting directly under the
 * one you press every single week. A playtester hit it by accident.
 */
describe('taking a week off', () => {
  function atSchedule() {
    let s = reduce(initialState(21), { type: 'START' })
    // play through to the first schedule screen that offers week options
    for (let i = 0; i < 4000 && s.weekOptions.length === 0; i++) {
      if (s.phase === 'playing') {
        if (s.hole.puttFeet !== null) { s = reduce(s, { type: 'PUTT', sink: false }); continue }
        const shots = handShots(s)
        s = reduce(s, { type: 'SELECT_SHOT', id: shots[0]!.id })
        s = reduce(s, { type: 'COMMIT' })
      } else if (s.phase === 'shop') s = reduce(s, { type: 'LEAVE_SHOP' })
      else if (s.phase === 'remove') s = reduce(s, { type: 'REMOVE_CARD', id: s.deck[0] ?? null })
      else if (s.phase === 'boost') s = reduce(s, { type: 'TAKE_BOOST', id: s.boostOffer[0]! })
      else if (s.phase === 'encounter') s = reduce(s, { type: 'WALK_ON' })
      else if (s.phase === 'over') break
      else s = reduce(s, { type: 'NEXT' })
    }
    return s
  }

  test('picking one only arms it — nothing has happened yet', () => {
    const s = atSchedule()
    expect(s.weekOptions.length).toBeGreaterThan(0)
    const id = s.weekOptions[0]!
    const armed = reduce(s, { type: 'PICK_WEEK', id })
    expect(armed.pendingWeek).toBe(id)
    expect(armed.skipped).toBe(s.skipped)
    expect(armed.earnings).toBe(s.earnings)
    expect(armed.phase).toBe('schedule')
  })

  test('it can be taken back', () => {
    const s = atSchedule()
    const armed = reduce(s, { type: 'PICK_WEEK', id: s.weekOptions[0]! })
    expect(reduce(armed, { type: 'PICK_WEEK', id: null }).pendingWeek).toBe(null)
  })

  test('teeing off clears a half-made choice instead of honouring it', () => {
    const s = atSchedule()
    const armed = reduce(s, { type: 'PICK_WEEK', id: s.weekOptions[0]! })
    const teed = reduce(armed, { type: 'NEXT' })
    expect(teed.pendingWeek).toBe(null)
    expect(teed.skipped).toBe(s.skipped)
  })

  test('confirming is what actually spends the week', () => {
    const s = atSchedule()
    const id = s.weekOptions.find(w => w !== 'lesson') ?? s.weekOptions[0]!
    const armed = reduce(s, { type: 'PICK_WEEK', id })
    const done = reduce(armed, { type: 'TAKE_WEEK', id })
    expect(done.skipped).toBe(s.skipped + 1)
    expect(done.pendingWeek).toBe(null)
  })
})

/**
 * Momentum was lost in the drive failure and reconstructed from the course
 * reviews (COURSE-CHANGES-5.md §0): the reconstruction reproduced REVIEW-5's
 * focus tables digit for digit, so this is the rule, not a rule like it.
 * These tests exist so it can never be lost silently again.
 */
describe('momentum — focus comes back faster after a good hole', () => {
  test('two back at par or better, one back over par, boosts on top', () => {
    expect(focusRegen([], 0)).toBe(2)
    expect(focusRegen([], -1)).toBe(2)
    expect(focusRegen([], 1)).toBe(1)
    expect(focusRegen([], 3)).toBe(1)
    const caddy = { id: 'x', name: '', icon: '', blurb: '', price: 0, tier: 'rack' as const, focusRegenBonus: 1 }
    expect(focusRegen([caddy], 1)).toBe(2)
  })

  test('Short Memory — momentum survives a bogey, and only a bogey', () => {
    const memory = { id: 'x', name: '', icon: '', blurb: '', price: 0, tier: 'rack' as const, momentumSlack: 1 }
    expect(focusRegen([memory], 0)).toBe(2)   // par is still par
    expect(focusRegen([memory], 1)).toBe(2)   // a bogey is not a story
    expect(focusRegen([memory], 2)).toBe(1)   // a double still is
  })

  // putting is deterministic, so a hole can be finished on a known score:
  // strokes so far + two putts from 8 feet
  const onGreen = (strokes: number, focus: number) => {
    const teed = reduce(reduce(initialState(31), { type: 'START' }), { type: 'NEXT' })
    return { ...teed, focus, hole: { ...teed.hole, lie: 'green' as const, puttFeet: 8, strokes } }
  }

  test('holing out at par pays the momentum, and says so', () => {
    const s = reduce(onGreen(2, 2), { type: 'PUTT', sink: false })   // 2 + 2 putts = par 4
    expect(s.scores[0]).toBe(4)
    expect(s.focus).toBe(4)
    expect(s.log.some(l => l.text.startsWith('Momentum'))).toBe(true)
  })

  test('a double bogey walks to the next tee with only the one', () => {
    const s = reduce(onGreen(4, 2), { type: 'PUTT', sink: false })   // 4 + 2 putts = 6
    expect(s.scores[0]).toBe(6)
    expect(s.focus).toBe(3)
    expect(s.log.some(l => l.text.startsWith('Momentum'))).toBe(false)
  })

  test('the cap still holds — momentum never banks past full', () => {
    const s = reduce(onGreen(2, 5), { type: 'PUTT', sink: false })
    expect(s.focus).toBe(5)
    expect(s.log.some(l => l.text.startsWith('Momentum'))).toBe(false)
  })
})

/**
 * NEW MECHANICS, 25 Aug 2026 — each one field, each measured before it
 * shipped (tools/rewardcheck.ts; verdicts recorded in content/boosts.ts
 * and ITEMS-PROPOSAL.md). These tests pin the mechanisms, not the prices.
 */
describe('the gimme — Inside the Leather', () => {
  test('putting stays exactly as it was without one', () => {
    expect(baseputts(4)).toBe(1)
    expect(baseputts(5)).toBe(2)
    expect(sinkCost(4)).toBe(0)
    expect(sinkCost(8)).toBe(2)
    expect(resolvePutting(8, false).strokes).toBe(2)
  })

  test('inside the gimme it is one putt for nothing', () => {
    expect(baseputts(8, 8)).toBe(1)
    expect(sinkCost(8, 8)).toBe(0)
    expect(resolvePutting(8, false, 8).strokes).toBe(1)
    expect(resolvePutting(8, false, 8).text).toContain('Pick it up')
    // and nine feet is still a real putt
    expect(baseputts(9, 8)).toBe(2)
    expect(sinkCost(9, 8)).toBe(2)
  })

  test('through the reducer: an eight-footer with the boost is a gimme', () => {
    const teed = reduce(reduce(initialState(31), { type: 'START' }), { type: 'NEXT' })
    const green = { ...teed, boosts: ['leather'],
      hole: { ...teed.hole, lie: 'green' as const, puttFeet: 8, strokes: 2 } }
    const s = reduce(green, { type: 'PUTT', sink: false })
    expect(s.scores[0]).toBe(3)                 // 2 + one putt: the gimme
    const bare = reduce({ ...green, boosts: [] }, { type: 'PUTT', sink: false })
    expect(bare.scores[0]).toBe(4)              // 2 + two putts without it
  })
})

describe('lie relief — ignoreLie shots and sand relief', () => {
  const cone = (id: string, lie: 'fairway' | 'deep' | 'bunker', boosts: never[] | { sandRelief: boolean }[] = []) =>
    buildCone(
      { shot: CARD[id] as never, techniques: [], aim: 'pin' }, lie, 999,
      boosts.map(b => ({ id: 'x', name: '', icon: '', blurb: '', price: 0, tier: 'rack' as const, ...b })),
    ).cone

  test('Rescue plays its fairway numbers from the deep stuff', () => {
    const fair = cone('rescue', 'fairway')
    const deep = cone('rescue', 'deep')
    expect(deep.carry).toBe(fair.carry)
    expect(deep.spread).toBe(fair.spread)
    // and a card without the rule still pays the deep-rough price
    expect(cone('longiron', 'deep').spread)
      .toBeGreaterThan(cone('longiron', 'fairway').spread)
  })

  test('ignoreLie does not touch the sand — a bunker is a bunker', () => {
    // Gouge It Out cannot even be played from sand; prove the principle on
    // Rescue: its bunker cone must NOT match its fairway cone.
    expect(cone('rescue', 'bunker').spread)
      .toBeGreaterThan(cone('rescue', 'fairway').spread)
  })

  test('sandRelief makes the bunker play as fairway (mechanism kept, boost culled)', () => {
    const bare = cone('midiron', 'bunker')
    const relieved = cone('midiron', 'bunker', [{ sandRelief: true }])
    const fair = cone('midiron', 'fairway')
    expect(relieved.carry).toBe(fair.carry)
    expect(relieved.spread).toBe(fair.spread)
    expect(bare.spread).toBeGreaterThan(relieved.spread)
  })
})

describe('scaleCarry — Three-Quarter It, the op with its first card', () => {
  test('eighty percent of everything, proportionally', () => {
    const plan = (techs: never[] | object[]) => buildCone(
      { shot: CARD['midiron'] as never, techniques: techs as never, aim: 'pin' },
      'fairway', 999,
    ).cone
    const full = plan([])
    const cut = plan([CARD['threequarter']])
    expect(cut.carry).toBe(Math.round(full.carry * 0.8))
    expect(cut.spread).toBeLessThan(full.spread)
  })
})

describe('the sponsor that pays — cutBonus', () => {
  const settled = (boosts: string[]) => {
    const teed = reduce(reduce(initialState(9), { type: 'START' }), { type: 'NEXT' })
    const done = { ...teed, boosts, scores: [4, 3, 4, 5, 4, 3, 4, 5], phase: 'holed' as const }
    return reduce(done, { type: 'NEXT' })
  }

  test('a made season-ending cut pays the decal money into earnings', () => {
    const bare = settled([])
    const paid = settled(['pontoon'])
    expect(paid.phase).toBe('payout')
    expect(paid.earnings - bare.earnings).toBe(BOOST['pontoon']!.cutBonus)
    expect(paid.log.some(l => l.text.includes('pays out'))).toBe(true)
  })
})

describe('the redraw discount — An Organized Bag', () => {
  test('one focus is not enough to check the bag bare-handed', () => {
    const teed = reduce(reduce(initialState(13), { type: 'START' }), { type: 'NEXT' })
    const broke = { ...teed, focus: 1 }
    expect(reduce(broke, { type: 'REDRAW' })).toBe(broke)
  })

  test('with the bag organized, the same focus buys the redraw', () => {
    const teed = reduce(reduce(initialState(13), { type: 'START' }), { type: 'NEXT' })
    const s = reduce({ ...teed, focus: 1, boosts: ['organized'] }, { type: 'REDRAW' })
    expect(s.focus).toBe(0)                      // cost 2 − 1 = 1
    expect(s.lastShot).toContain('Checked the bag')
  })
})

describe('the reward pool holds no mines', () => {
  test('the four measured-negative entries are culled, definitions intact', () => {
    for (const id of ['committed', 'routine', 'smooth', 'shortiron']) {
      expect(CARD[id], `${id} should still be defined`).toBeTruthy()
    }
    for (const id of ['committed', 'routine']) {
      expect(REWARD_POOL).not.toContain(id)
    }
    // the dupes that measured positive stay
    expect(REWARD_POOL).toContain('midiron')
    expect(REWARD_POOL).toContain('stinger')
    expect(REWARD_POOL.filter(id => id === 'smooth')).toHaveLength(0)
    expect(REWARD_POOL.filter(id => id === 'shortiron')).toHaveLength(0)
  })

  test('every card the pool can offer carries a measured price', () => {
    for (const id of REWARD_POOL) {
      expect(CARD_PRICES[id], `${id} has no measured price`).toBeGreaterThan(0)
    }
    expect(cardPrice('never-measured')).toBeGreaterThan(0)   // the floor holds
  })
})

describe('tiered drops — majors premium, early shop budget', () => {
  const shopAt = (event: number) => {
    const teed = reduce(reduce(initialState(11), { type: 'START' }), { type: 'NEXT' })
    return reduce(
      { ...teed, event, phase: 'payout' as const, earnings: 5_000_000, madeCut: true },
      { type: 'NEXT' })
  }

  test('the opening weeks stock below the premium line', () => {
    for (const seed of [1, 2, 3]) {
      void seed
      const s = shopAt(1)
      for (const item of s.offer.filter(i => i.kind === 'boost')) {
        expect(BOOST[item.id]!.price).toBeLessThan(PREMIUM_BOOST)
      }
    }
  })

  test('after the opening weeks the whole rack is out', () => {
    // premium boosts exist and are reachable: across seeds, event-5 shops
    // must eventually stock one at or above the line
    const teed = reduce(reduce(initialState(11), { type: 'START' }), { type: 'NEXT' })
    const sawPremium = [11, 12, 13, 14, 15].some(seed => {
      const t = reduce(reduce(initialState(seed), { type: 'START' }), { type: 'NEXT' })
      void teed
      const s = reduce(
        { ...t, event: 5, phase: 'payout' as const, earnings: 0, madeCut: true },
        { type: 'NEXT' })
      return s.offer.some(i => i.kind === 'boost' && BOOST[i.id]!.price >= PREMIUM_BOOST)
    })
    expect(sawPremium).toBe(true)
  })

  test('a major hands you the good stuff, never the discount rack', () => {
    const teed = reduce(reduce(initialState(17), { type: 'START' }), { type: 'NEXT' })
    const atMajorCut = { ...teed, event: 4, phase: 'cut' as const, madeCut: true,
      scores: [4, 4, 4, 4] }
    const s = reduce(atMajorCut, { type: 'NEXT' })
    expect(s.phase).toBe('boost')
    expect(s.boostOffer.length).toBeGreaterThan(0)
    for (const id of s.boostOffer) {
      expect(BOOST[id]!.price).toBeGreaterThanOrEqual(PREMIUM_BOOST)
    }
  })

  test('owning everything skips the pick instead of offering nothing', () => {
    const teed = reduce(reduce(initialState(17), { type: 'START' }), { type: 'NEXT' })
    const all = BOOSTS.map(b => b.id)
    const atMajorCut = { ...teed, event: 4, phase: 'cut' as const, madeCut: true,
      scores: [4, 4, 4, 4], boosts: all }
    const s = reduce(atMajorCut, { type: 'NEXT' })
    expect(s.phase).toBe('playing')   // straight to the fifth tee, no empty offer
  })
})

/**
 * THE ENCOUNTERS — somebody on the walk to the fifth tee.
 *
 * Everything below leans on the same guarantees as the rest of the sim: the
 * 'events' stream is the bank's own, so a season with encounters in it is
 * exactly as replayable as one without; walking on is free, forever; and a
 * bet is data riding in state, settled by finishHole and nothing else.
 */
describe('the encounters', () => {
  const teed = (seed: number) =>
    reduce(reduce(initialState(seed), { type: 'START' }), { type: 'NEXT' })

  /** a made cut at an ordinary event, about to walk off the cut screen */
  const atCut = (seed: number, cash = 2_000_000) => ({
    ...teed(seed), phase: 'cut' as const, madeCut: true,
    scores: [4, 4, 4, 4], earnings: cash,
  })

  /** put a specific somebody in the walkway */
  const meeting = (seed: number, id: string, cash = 2_000_000) => ({
    ...teed(seed), phase: 'encounter' as const, encounterOffer: id, earnings: cash,
  })

  test('the save version gate turned for the full scorecard', () => {
    // v9: the season boost budget makes a seventh BUY illegal on replay,
    // and the tiered stock draws from the new shop rng stream
    // (SHOP-SUPPLY.md). v10: the junk spread floor (JUNK-VERDICT.md) —
    // buildCone imposes a 12-yard minimum scatter on the four junk lies.
    // v11: THE FULL SCORECARD (FIELD-SPREAD.md SHIPPED) — settle finishes
    // the 36-hole week (salts 10/11) and pays the full real-tour tie
    // split at every rank, so a v10 log replays with different money
    // from the first settle.
    expect(SAVE_VERSION).toBe(11)
  })

  test('who shows up is decided by the seed, at roughly one cut in three', () => {
    const offers = (seed: number) => {
      const s = reduce(atCut(seed), { type: 'NEXT' })
      return s.phase === 'encounter' ? s.encounterOffer : null
    }
    const once = Array.from({ length: 120 }, (_, i) => offers(500 + i))
    const twice = Array.from({ length: 120 }, (_, i) => offers(500 + i))
    expect(once).toEqual(twice)                       // same seeds, same people
    const met = once.filter(x => x !== null).length
    expect(met).toBeGreaterThan(120 * 0.15)           // they do show up
    expect(met).toBeLessThan(120 * 0.55)              // but not every week
  })

  test('majors keep their prize moment, and a missed cut meets nobody', () => {
    const major = reduce({ ...atCut(17), event: 4 }, { type: 'NEXT' })
    expect(major.phase).toBe('boost')
    const missed = reduce({ ...atCut(17), madeCut: false }, { type: 'NEXT' })
    expect(missed.phase).toBe('payout')
  })

  test('walking on is a pure pass, for every one of them', () => {
    for (const enc of ENCOUNTERS) {
      const s = meeting(7, enc.id)
      const after = reduce(s, { type: 'WALK_ON' })
      expect(after.phase).toBe('playing')             // straight to the tee
      expect(after.focus).toBe(s.focus)
      expect(after.earnings).toBe(s.earnings)
      expect(after.spent).toBe(s.spent)
      expect(after.boosts).toEqual(s.boosts)
      expect(after.pendingBet).toBe(null)
      expect(after.encounterOffer).toBe(null)
    }
  })

  test('engaging outside the phase does nothing', () => {
    const s = teed(7)
    expect(reduce(s, { type: 'ENGAGE' })).toBe(s)
    expect(reduce(s, { type: 'WALK_ON' })).toBe(s)
  })

  test('the cart girl is the mercy encounter, and the meter still has a top', () => {
    const thirsty = reduce({ ...meeting(7, 'cartgirl'), focus: 3 }, { type: 'ENGAGE' })
    expect(thirsty.focus).toBe(4)
    const full = reduce({ ...meeting(7, 'cartgirl'), focus: 5 }, { type: 'ENGAGE' })
    expect(full.focus).toBe(5)                        // clamped at maxFocus
  })

  test('the autograph is always the same honest trade', () => {
    const s = { ...meeting(7, 'autograph'), focus: 3 }
    const after = reduce(s, { type: 'ENGAGE' })
    expect(after.earnings).toBe(s.earnings + 150_000)
    expect(after.focus).toBe(2)
    expect(after.spent).toBe(s.spent)                 // winnings, not un-spending
  })

  test('the porta-potty gamble: seeded, bounded, and floored at one focus', () => {
    const runs = Array.from({ length: 60 }, (_, i) =>
      reduce({ ...meeting(100 + i, 'portapotty'), focus: 1 }, { type: 'ENGAGE' }))
    const lost = runs.filter(s => s.log.some(l => l.text.startsWith('You looked')))
    const won = runs.filter(s => !s.log.some(l => l.text.startsWith('You looked')))
    expect(lost.length).toBeGreaterThan(5)            // it has gone both ways
    expect(won.length).toBeGreaterThan(5)
    for (const s of lost) expect(s.focus).toBe(1)     // the floor holds
    for (const s of won) {
      // the good outcome is one of exactly two: focus, or money into gross
      const paid = s.earnings === 2_200_000
      const steadied = s.focus === 3
      expect(paid || steadied).toBe(true)
    }
    // and the same seed always finds the same thing behind the unit
    expect(reduce({ ...meeting(104, 'portapotty'), focus: 1 }, { type: 'ENGAGE' }))
      .toEqual(reduce({ ...meeting(104, 'portapotty'), focus: 1 }, { type: 'ENGAGE' }))
  })

  test('the official can fine you, but never into debt', () => {
    const runs = Array.from({ length: 60 }, (_, i) =>
      reduce(meeting(200 + i, 'official', 0), { type: 'ENGAGE' }))
    const fined = runs.filter(s => s.log.some(l => l.text.includes('junior programme')))
    expect(fined.length).toBeGreaterThan(5)
    for (const s of fined) expect(s.earnings).toBe(0) // the wallet floor holds
  })

  test('the sandbagger: stake now, verdict at the next holed-out', () => {
    const armed = reduce(meeting(31, 'sandbagger'), { type: 'ENGAGE' })
    expect(armed.earnings).toBe(1_800_000)            // the stake left already
    expect(armed.pendingBet?.condition).toBe('birdie-or-better')
    expect(armed.phase).toBe('playing')

    const par = currentHole(armed).par
    // a tap-in leaves a birdie: strokes so far + one free putt = par − 1
    const birdie = reduce({ ...armed,
      hole: { ...armed.hole, lie: 'green' as const, puttFeet: 4, strokes: par - 2 } },
      { type: 'PUTT', sink: false })
    expect(birdie.earnings).toBe(2_300_000)           // $500k, into gross
    expect(birdie.pendingBet).toBe(null)
    expect(birdie.log.some(l => l.text.includes('He pays like he putts'))).toBe(true)

    // two putts from eight feet is a par — and a par is not a birdie
    const parred = reduce({ ...armed,
      hole: { ...armed.hole, lie: 'green' as const, puttFeet: 8, strokes: par - 2 } },
      { type: 'PUTT', sink: false })
    expect(parred.earnings).toBe(1_800_000)           // the stake is his
    expect(parred.pendingBet).toBe(null)
    expect(parred.log.some(l => l.text.includes('does not gloat'))).toBe(true)
  })

  test('the sandbagger is not offered to a player who cannot cover the stake', () => {
    const met = (cash: number) => {
      const ids: string[] = []
      for (let i = 0; i < 150; i++) {
        const s = reduce(atCut(3000 + i, cash), { type: 'NEXT' })
        if (s.phase === 'encounter') ids.push(s.encounterOffer!)
      }
      return ids
    }
    const broke = met(0)
    expect(broke.length).toBeGreaterThan(10)
    expect(broke).not.toContain('sandbagger')
    expect(met(2_000_000)).toContain('sandbagger')    // solvency restores him
  })

  test('the junior: par pays two, a double costs one, a bogey is a push', () => {
    const armed = reduce({ ...meeting(31, 'junior'), focus: 1 }, { type: 'ENGAGE' })
    expect(armed.earnings).toBe(2_000_000)            // no stake — he is nine
    const par = currentHole(armed).par
    const holeOut = (s: typeof armed, strokes: number, feet: number) =>
      reduce({ ...s, hole: { ...s.hole, lie: 'green' as const, puttFeet: feet, strokes } },
        { type: 'PUTT', sink: false })
    // each case against the identical hole with no bet riding
    const bare = { ...armed, pendingBet: null }

    const win = holeOut(armed, par - 2, 8)            // two putts, par
    expect(win.focus - holeOut(bare, par - 2, 8).focus).toBe(2)
    expect(win.pendingBet).toBe(null)

    const push = holeOut(armed, par - 1, 8)           // two putts, bogey
    expect(push.focus).toBe(holeOut(bare, par - 1, 8).focus)
    expect(push.pendingBet).toBe(null)
    expect(push.log.some(l => l.text.includes('He understands'))).toBe(true)

    const lose = holeOut(armed, par, 8)               // two putts, double
    expect(lose.focus - holeOut(bare, par, 8).focus).toBe(-1)
    expect(lose.pendingBet).toBe(null)
  })

  test('the found tiger is granted once, calms the cone, and retires its encounter', () => {
    const kept = reduce(meeting(7, 'tiger'), { type: 'ENGAGE' })
    expect(kept.boosts).toContain('foundtiger')
    const plan = { shot: CARD['midiron'] as never, techniques: [], aim: 'pin' as const }
    const bare = buildCone(plan, 'fairway', 999, boostsOf(teed(7))).cone
    const calm = buildCone(plan, 'fairway', 999, boostsOf(kept)).cone
    expect(calm.spread).toBeLessThan(bare.spread)
    // a player already carrying it never meets the headcover again
    for (let i = 0; i < 150; i++) {
      const s = reduce({ ...atCut(4000 + i), boosts: ['foundtiger'] }, { type: 'NEXT' })
      if (s.phase === 'encounter') expect(s.encounterOffer).not.toBe('tiger')
    }
  })

  test('encounter-only boosts are never stocked, never dropped', () => {
    // the shop, across seeds and weeks
    for (const seed of [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]) {
      const t = teed(seed)
      const s = reduce({ ...t, event: 5, phase: 'payout' as const,
        earnings: 5_000_000, madeCut: true }, { type: 'NEXT' })
      for (const item of s.offer) expect(ENCOUNTER_BOOSTS.has(item.id)).toBe(false)
    }
    // a major's drop — including the fallback shelf, which is the leak that
    // a price-0 boost would otherwise ride: own everything BUT the tiger
    const everything = BOOSTS.filter(b => !ENCOUNTER_BOOSTS.has(b.id)).map(b => b.id)
    for (const boosts of [[], everything]) {
      const t = teed(17)
      const s = reduce({ ...t, event: 4, phase: 'cut' as const, madeCut: true,
        scores: [4, 4, 4, 4], boosts }, { type: 'NEXT' })
      for (const id of s.boostOffer) expect(ENCOUNTER_BOOSTS.has(id)).toBe(false)
      if (boosts.length > 0) expect(s.phase).toBe('playing')   // skipped, not leaked
    }
  })

  test('a season with encounters in it replays byte-identical', () => {
    const run = (seed: number) => {
      let s = reduce(initialState(seed), { type: 'START' })
      const trace: string[] = []
      let steps = 0
      while (s.phase !== 'over') {
        if (++steps > 20_000) throw new Error(`stuck in ${s.phase}`)
        switch (s.phase) {
          case 'playing': {
            if (s.hole.puttFeet !== null) { s = reduce(s, { type: 'PUTT', sink: false }); break }
            // the distance-ranked policy from the end-to-end suite — this bot
            // has to actually make cuts, or no encounter ever gets a chance
            const dist = toPin(currentHole(s), s.hole.ball)
            const ranked = [...handShots(s)].sort((a, b) => {
              const ca = a.carry > dist ? (a.carry - dist) * 1.3 : dist - a.carry
              const cb = b.carry > dist ? (b.carry - dist) * 1.3 : dist - b.carry
              return ca - cb
            })
            let moved = false
            for (const shot of ranked) {
              const picked = reduce(s, { type: 'SELECT_SHOT', id: shot.id })
              const hit = reduce(picked, { type: 'COMMIT' })
              if (hit !== picked) { s = hit; moved = true; break }
            }
            if (!moved) s = reduce(s, { type: 'NEXT' })
            break
          }
          case 'shop': s = reduce(s, { type: 'LEAVE_SHOP' }); break
          case 'remove': s = reduce(s, { type: 'REMOVE_CARD', id: s.deck[0] ?? null }); break
          case 'boost': s = reduce(s, { type: 'TAKE_BOOST', id: s.boostOffer[0]! }); break
          case 'encounter':
            trace.push(`met ${s.encounterOffer}`)
            s = reduce(s, { type: 'ENGAGE' })
            break
          default: s = reduce(s, { type: 'NEXT' })
        }
      }
      trace.push(JSON.stringify(s))
      return trace.join('\n')
    }
    // find a seed whose season actually meets somebody — a season the bot
    // busts out of before making an ordinary cut proves nothing
    let met: number | null = null
    for (let seed = 2026; seed < 2056 && met === null; seed++) {
      if (run(seed).includes('met ')) met = seed
    }
    expect(met).not.toBe(null)
    const first = run(met!)
    expect(run(met!)).toBe(first)     // byte-identical, gambles and bets included
    expect(first).toContain('met ')
  })
})
