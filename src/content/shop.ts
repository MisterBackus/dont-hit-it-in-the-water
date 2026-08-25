/**
 * THE PRO SHOP — where money finally does something.
 *
 * Prize money is your survival AND your shopping. Every dollar spent here is a
 * dollar off the Money List, so buying the Golden Putter in March might be what
 * costs you your card in September. That tension is the point (DESIGN.md §6.3),
 * and it is why there is only one pot rather than a tidy second currency.
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
 * Adding a shot is cheap. Cutting one is not — thinning is the stronger play,
 * measured at $878k a season for the best single cut, so it is priced like one.
 */
export const CARD_PRICE = 120_000
export const CUT_PRICE = 350_000
export const REROLL_PRICE = 70_000
