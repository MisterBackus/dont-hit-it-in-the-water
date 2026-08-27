/**
 * THE PRO SHOP — where money finally does something.
 *
 * SUPERSEDED, 25 Aug 2026: the paragraph that used to live here — "every
 * dollar spent is a dollar off the Money List, that tension is the point" —
 * lost its argument to a playtester's first question ("it feels like you
 * can't buy anything, so how do you get better?"). The list now checks GROSS
 * season earnings: it records what you won, the way an actual money list
 * does, and buying wedges cannot demote you on it. The tension the old rule
 * was after lives where Balatro actually keeps it: prices high enough that
 * choosing between boosts is the decision, and thresholds high enough that
 * you must get better to live. Wallet and winnings are still one number on
 * screen apart — `earnings` is the wallet, `earnings + spent` is the list.
 *
 * PRICES ARE MEASURED, not guessed — and the first measurement was taken with
 * a broken instrument. A synthetic "equipment tightens cones 12%" stand-in said
 * shopping lost to hoarding at every price, so prices were driven down chasing
 * a crossover that did not exist. Running the REAL boosts through the real cone
 * builder (tools/shopcheck.ts) found the opposite: every one of them returned
 * between three and twenty times its price, and cutting the best card out of
 * the starting deck was worth $878k against a $60k sticker.
 *
 * The old harness was also planning blind — it built candidate cones with no
 * boosts and then played the shot with them, so Super Ball, which adds ten
 * percent to every carry, measured at MINUS $1.32M a season purely from
 * overshooting. A human sees the cone move and clubs down.
 *
 * Prices now target a 1.4x-2.5x return over the part of a season you will own
 * the thing for. Re-derive with `npx tsx src/tools/shopcheck.ts`.
 */
export type ShopKind = 'boost' | 'card' | 'cut'

export interface ShopItem {
  readonly kind: ShopKind
  /** boost id or card id; unused for 'cut' */
  readonly id: string
  readonly price: number
}

/**
 * CARDS ARE PRICED ONE BY ONE, like the boosts, because a flat sticker was a
 * lie in both directions: the pool sold +$2.3M cards and −$2.6M cards at the
 * same $120k. Under the bag cap a purchase IS a swap — the card comes in and
 * something goes out — so the price is the measured BEST-SWAP value over two,
 * same rule as the equipment. Note what that means: a swap bundles a removal
 * with the card, so even a modest card carries the cut value of its victim,
 * and the numbers below sit closer to CUT_PRICE than to the old sticker.
 *
 * Provenance: tools/rewardcheck.ts, 25 Aug 2026 — SECTION=cards N=250
 * VICTIM=smooth, mixed play, seeds 600000+i (run split in two via CARDS=).
 * Bare season $6.26M; best victim Smooth It, whose absence measured $1.80M.
 * Swap values ran from $4.32M (One More Club) down to $755k (Gouge It Out);
 * every entry below is its swap value over two, rounded to $50k.
 * Re-derive with `npx tsx src/tools/rewardcheck.ts`.
 */
export const CARD_PRICES: Readonly<Record<string, number>> = {
  onemore: 2_150_000,
  fullsend: 1_850_000,
  stinger: 1_750_000,
  highdraw: 1_650_000,
  cutit: 1_600_000,
  rescue: 1_350_000,
  midiron: 1_200_000,
  nothing: 1_150_000,
  extra: 900_000,
  knockdown: 850_000,
  feathered: 750_000,
  scrape: 700_000,
  threequarter: 500_000,
  pickclean: 450_000,
  texas: 450_000,
  gouge: 400_000,
}

/** A card the table has never measured falls back to the floor price. */
export const CARD_PRICE_FLOOR = 60_000
export function cardPrice(id: string): number {
  return CARD_PRICES[id] ?? CARD_PRICE_FLOOR
}

/**
 * Adding a shot is no longer cheap (see CARD_PRICES). Cutting one is priced
 * the same way it always was — thinning measured at $1.91M a season for the
 * best single cut under momentum: measured value over two.
 */
export const CUT_PRICE = 950_000
export const REROLL_PRICE = 70_000

/**
 * THE DROPS ARE TIERED, on the bands the measured prices already draw.
 *
 * A major's free pick comes from at or above this line — the season's biggest
 * earned moment should not offer the discount rack. The weekly shop stocks
 * anything, EXCEPT in the opening weeks (through EARLY_SHOP_UNTIL), when it
 * stays below the line: the first Money List check is $2.3M, and a $2.45M
 * sticker at event 2 is noise an early wallet cannot act on. It also keeps
 * the big cone-touching equipment arriving as the sharpness curve flattens,
 * which is the progression spine (DESIGN.md §3.4a).
 *
 * SLICE 4: these free picks turned out to be absent from every prior Money
 * List threshold derivation — the owner found them live. Modeled now in
 * shopcheck's shopper season (mirroring reducer.ts offerBoosts): up to four
 * premium boosts a season, free, and worth roughly 21 points of mixed
 * survival at the re-derived checks (37% with them, 16% without). The
 * thresholds in season.ts carry the drops' measured weight.
 */
export const PREMIUM_BOOST = 1_000_000
export const EARLY_SHOP_UNTIL = 3

/**
 * THE SEASON ALLOWANCE — SHOP-SUPPLY.md, 26 Aug 2026 (owner-approved hybrid).
 *
 * Every Money List bar since slice 4 was derived under a four-purchase season
 * budget that lived only in the harness (`if (bought >= 4) break`) — the live
 * game had no such rule, and the best player bought the entire shelf (16
 * items, 100% conversion, 10 wins). The budget is that missing rule, shipped:
 * SIX boost purchases a season, counted by the reducer, rendered as pips.
 * Cards are exempt — they are not the power curve (0% conversion above $1M
 * live), and the bag cap already makes every card a swap.
 *
 * Six, not four: the harness's four assumed a naive spender; measured at the
 * hybrid's center (budget 6 × weights 6/3/1 × early gate) the mixed shopper's
 * late win rate reads ~53% against the 51% calibrated reference, and the
 * patient counter-play (bank the slots, buy tour-issue only) collapses to
 * ~12% survival — the tiers are what make the budget honest. Swept in the
 * SHIPPED section of SHOP-SUPPLY.md.
 */
export const SHOP_BUDGET = 6

/**
 * RARITY TIERS, on the bands the measured prices already draw (price is
 * value over two, so the price bands ARE the value tiers — same rule that
 * tiered the major drops). The names are golf's own: off the rack, special
 * order, tour issue. A tour-issue week at the shop is an event: the truck
 * came.
 *
 * The weekly stock's two boost slots each draw a TIER first (weights below,
 * among tiers with unowned stock), then an item uniformly within it; the
 * early weeks (through EARLY_SHOP_UNTIL) still stock below the premium
 * line, which under the tiers means: the truck only carries the rack.
 * REROLL redraws items WITHIN the week's drawn tiers — you can re-ask what
 * the truck brought, not summon a different truck (at ~13% premium odds per
 * slot, $70k tier-fishing would be a solved slot machine).
 */
import type { BoostTier, ShopTier } from '../sim/types'
export type { BoostTier, ShopTier }
/** the three that reach a shelf — `found` never does, so it is not here */
export const BOOST_TIERS: readonly ShopTier[] = ['rack', 'special', 'tour']
export const TIER_LABEL: Readonly<Record<BoostTier, string>> = {
  rack: 'Off the Rack', special: 'Special Order', tour: 'Tour Issue',
  found: 'Found',
}
/** draw weights 6/3/1 — swept against 8/3/1 and 6/2/1 (SHOP-SUPPLY SHIPPED) */
export const TIER_WEIGHTS: Readonly<Record<ShopTier, number>> = {
  rack: 6, special: 3, tour: 1,
}
/**
 * THE SPRING SLOT. Rarity alone taxed the spring — the one place difficulty
 * must never go (the spring rule, four instruments deep): at the hybrid's
 * center the check-1 kill read 54% against the tie-world's calibrated 48
 * (SHOP-SUPPLY SHIPPED — the early gate itself measured only ~1 point of
 * that, and deepening the commons to nine bought nothing; the tax is the
 * weighted draw showing a spring wallet stickers it cannot act on). The
 * fix is the doc's own named lever: through the first Money List check,
 * the truck's FIRST slot always carries the rack — the shop knows what a
 * rookie can spend. Slot two draws weighted as ever. Measured worth two
 * points of spring kill (54 → 52 at $2.3M); the remainder of the spring
 * tax is the offer stream itself — two dealt items against the legacy
 * instrument's pick-of-seventeen catalogue — and was absorbed where the
 * re-derivation moved check 1 (season.ts, SHOP-SUPPLY SHIPPED).
 */
export const SPRING_RACK_UNTIL = 5

/**
 * The tour-issue line. This band ONCE decided rarity; now it only records
 * where the bands sat when every item's stored tier was seeded from them
 * (boosts.ts `tier`), which a test still pins. Rarity is data — see the
 * Boost type — so an item may deliberately cost less than its shelf implies.
 */
export const TOUR_ISSUE = 1_600_000
/** What the price bands imply. Kept for the seeding test, not for gameplay. */
export function tierOfPrice(price: number): ShopTier {
  if (price >= TOUR_ISSUE) return 'tour'
  if (price >= PREMIUM_BOOST) return 'special'
  return 'rack'
}
/** An item's rarity, as stored. */
export function tierOf(b: { readonly tier: BoostTier }): BoostTier {
  return b.tier
}
