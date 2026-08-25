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
 * stays below the line: the first Money List check is $1.4M, and a $2.4M
 * sticker at event 2 is noise an early wallet cannot act on. It also keeps
 * the big cone-touching equipment arriving as the sharpness curve flattens,
 * which is the progression spine (DESIGN.md §3.4a).
 */
export const PREMIUM_BOOST = 1_000_000
export const EARLY_SHOP_UNTIL = 3
