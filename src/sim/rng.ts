/** Seeded, serialisable, deterministic RNG. ARCHITECTURE.md §3. */

export interface RngState { readonly s: number }

export type Stream = 'shot' | 'putt' | 'draw' | 'field'

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

function hash(seed: number, salt: number): number {
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
  }
}
