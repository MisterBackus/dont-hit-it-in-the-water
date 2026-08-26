/** Yard space. ARCHITECTURE.md §4.1. */
import type { HoleSpec, LiePenalty, Point, Surface } from './types'

export const LIE: Record<Surface, LiePenalty> = {
  tee:      { carryScale: 1.00, spreadScale: 1.0 },
  fairway:  { carryScale: 1.00, spreadScale: 1.0 },
  green:    { carryScale: 1.00, spreadScale: 1.0 },
  rough:    { carryScale: 0.90, spreadScale: 1.7 },
  deep:     { carryScale: 0.76, spreadScale: 2.6 },
  trees:    { carryScale: 0.70, spreadScale: 2.4 },
  bunker:   { carryScale: 0.85, spreadScale: 1.6 },
  water:    { carryScale: 1.00, spreadScale: 1.0, penaltyStrokes: 1 },
  ob:       { carryScale: 1.00, spreadScale: 1.0, penaltyStrokes: 2 },
}

/**
 * THE JUNK SPREAD FLOOR (JUNK-VERDICT.md, shipped from the swept
 * counterfactual): on the four junk lies — rough, deep, bunker, trees — the
 * post-lie base spread is max(club.spread × spreadScale, this) yards. The
 * multipliers above price the long game honestly but wave a wedge through
 * (1.7 × tiny is still tiny — greenside rough measured +0.22 a visit, and
 * mid-range light rough +0.11, the cheapest junk in the game); an absolute
 * floor bites exactly the cards the multipliers leave under it. Floor 12 was
 * chosen off the sweep: it lifts greenside rough toward +0.29 while moving
 * the approach band a rounding error (floor 8 is inert, 16 brushes the short
 * band). Applied in buildCone (sim/effects.ts) — the ONE place resolution,
 * the drawn cone and every harness planner get their spread — and bypassed
 * by relief exactly as the table is: a relieved lie IS fairway.
 */
export const JUNK_SPREAD_FLOOR = 12

/** The lies the floor (and lie relief) call junk. Sand keeps its own rules. */
export function isJunk(lie: Surface): boolean {
  return lie === 'rough' || lie === 'deep' || lie === 'trees' || lie === 'bunker'
}

export const SURFACE_LABEL: Record<Surface, string> = {
  tee: 'the tee', fairway: 'the fairway', green: 'the green',
  rough: 'the rough', deep: 'deep rough', trees: 'the trees',
  bunker: 'a bunker', water: 'the water', ob: 'out of bounds',
}

/** Fairway half-width at a given distance, linearly interpolated. */
export function corridorHalf(hole: HoleSpec, down: number): number {
  const c = hole.corridor
  if (down <= c[0]!.at) return c[0]!.half
  for (let i = 1; i < c.length; i++) {
    const a = c[i - 1]!, b = c[i]!
    if (down <= b.at) {
      const t = (down - a.at) / (b.at - a.at)
      return a.half + t * (b.half - a.half)
    }
  }
  return c[c.length - 1]!.half
}

export function greenCentre(hole: HoleSpec): Point {
  return { down: hole.length, side: hole.greenSide }
}

function inEllipse(p: Point, c: Point, rDown: number, rSide: number): boolean {
  const dd = (p.down - c.down) / rDown
  const ds = (p.side - c.side) / rSide
  return dd * dd + ds * ds <= 1
}

/**
 * Surface lookup. Order matters: green wins, then hazards, then the
 * corridor, then rough, and anything wildly offline is out of bounds.
 */
export function surfaceAt(hole: HoleSpec, p: Point): Surface {
  if (p.down < 0) return 'ob'
  if (inEllipse(p, greenCentre(hole), hole.greenRadius, hole.greenRadius)) return 'green'
  for (const h of hole.hazards) {
    if (inEllipse(p, h.at, h.rDown, h.rSide)) return h.surface
  }
  const half = corridorHalf(hole, p.down)
  const off = Math.abs(p.side)
  if (p.down > hole.length + 35) return 'deep'
  if (off <= half) return 'fairway'
  if (off <= half + 12) return 'rough'
  if (off <= half + 26) return 'deep'
  if (off <= half + 40) return 'trees'
  return 'ob'
}

export function distance(a: Point, b: Point): number {
  const dd = a.down - b.down
  const ds = a.side - b.side
  return Math.sqrt(dd * dd + ds * ds)
}

/** Yards from a point to the pin. */
export function toPin(hole: HoleSpec, p: Point): number {
  return distance(p, greenCentre(hole))
}
