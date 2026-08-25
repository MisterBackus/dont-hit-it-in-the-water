import type { RngState } from './rng'
import { next } from './rng'

/** Fisher–Yates with the seeded RNG. Pure: returns the shuffled list AND the new rng. */
export function shuffle(cards: readonly string[], rng: RngState): readonly [string[], RngState] {
  const out = [...cards]
  let r = rng
  for (let i = out.length - 1; i > 0; i--) {
    const [v, r2] = next(r)
    r = r2
    const j = Math.floor(v * (i + 1))
    const tmp = out[i]!
    out[i] = out[j]!
    out[j] = tmp
  }
  return [out, r] as const
}

export interface DrawResult {
  readonly hand: string[]
  readonly deck: string[]
  readonly discard: string[]
  readonly rng: RngState
  /** true if the discard had to be reshuffled to fill the hand */
  readonly reshuffled: boolean
}

/**
 * Draw a hand for the hole. When the deck runs dry the discard is shuffled
 * back in — so a 16-card deck cycles roughly every three holes, and thinning
 * it means seeing your good cards more often.
 */
export function draw(
  n: number, deck: readonly string[], discard: readonly string[], rng: RngState,
): DrawResult {
  let d = [...deck]
  let disc = [...discard]
  let r = rng
  let reshuffled = false
  const hand: string[] = []

  for (let i = 0; i < n; i++) {
    if (d.length === 0) {
      if (disc.length === 0) break
      const [s, r2] = shuffle(disc, r)
      d = s; disc = []; r = r2; reshuffled = true
    }
    hand.push(d.shift()!)
  }
  return { hand, deck: d, discard: disc, rng: r, reshuffled }
}
