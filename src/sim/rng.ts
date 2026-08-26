/** Seeded, serialisable, deterministic RNG. ARCHITECTURE.md §3. */

export interface RngState { readonly s: number }

export type Stream = 'shot' | 'putt' | 'draw' | 'field' | 'events' | 'shop'

// NB: a mapped type must be a `type`, not an `interface` (TS7061).
export type RngBank = { readonly [K in Stream]: RngState }

export function makeRng(seed: number): RngState {
  return { s: seed >>> 0 }
}

/** mulberry32. Returns the value AND the next state — never mutates. */
export function next(rng: RngState): readonly [number, RngState] {
  const t = (rng.s + 0x6d2b79f5) >>> 0
  let r = t
  r = Math.imul(r ^ (r >>> 15), r | 1)
  r ^= r + Math.imul(r ^ (r >>> 7), r | 61)
  return [((r ^ (r >>> 14)) >>> 0) / 4294967296, { s: t }] as const
}

/** Uniform in [lo, hi). */
export function range(rng: RngState, lo: number, hi: number): readonly [number, RngState] {
  const [v, n] = next(rng)
  return [lo + v * (hi - lo), n] as const
}

/**
 * Triangular in [-1, 1], peaked at 0 — BOUNDED, per design pillar P8.
 * Built from two uniforms, so it is pure arithmetic and deterministic
 * across engines. No Math.log / Math.cos (ARCHITECTURE.md §3.3).
 */
export function triangular(rng: RngState): readonly [number, RngState] {
  const [a, r1] = next(rng)
  const [b, r2] = next(r1)
  return [a - b, r2] as const
}

/**
 * Salted seed derivation — the same mix seedBank uses for its four streams.
 * Exported so one-shot derived streams (the schedule assignment, salt 5) can
 * come from the same family without perturbing any bank stream's sequence.
 */
export function hash(seed: number, salt: number): number {
  let h = (seed ^ (salt * 0x9e3779b9)) >>> 0
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b)
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
  return (h ^ (h >>> 16)) >>> 0
}

/** Independent streams so adding a roll in one system can't perturb another. */
export function seedBank(seed: number): RngBank {
  return {
    shot: makeRng(hash(seed, 1)),
    putt: makeRng(hash(seed, 2)),
    draw: makeRng(hash(seed, 3)),
    field: makeRng(hash(seed, 4)),
    // salt 5 belongs to the schedule (schedule.ts EVENTS_SALT) and salt 7 to
    // the star roster (resolve/field.ts STAR_SALT) — both one-shot derived
    // streams. The encounters own this one — an independent stream, so an
    // encounter roll can never perturb a shot, a draw, or the field.
    events: makeRng(hash(seed, 6)),
    // salt 8: the pro shop (SHOP-SUPPLY.md) — the weekly tier draw, the
    // within-tier stock picks and the card shelf all live here, so a reroll
    // can never perturb what the deck deals on the next tee.
    // Salts 10 and 11 belong to THE FULL SCORECARD (resolve/field.ts,
    // FIELD-SPREAD.md): the field's 36-hole extension and the player's
    // remainder — per-event one-shot derived streams, consumed at settle,
    // never in the bank. 9 remains free.
    shop: makeRng(hash(seed, 8)),
  }
}
