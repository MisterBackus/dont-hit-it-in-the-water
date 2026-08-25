import type { HoleSpec, Point } from '../sim/types'

/**
 * THE ONLY place yards become drawing units. ARCHITECTURE.md §4.2.
 *
 * The SVG viewBox is expressed IN YARDS, so the cone and the hole cannot
 * possibly drift out of scale with each other — there is no second code
 * path that could disagree.
 */
export const HALF_WIDTH = 66          // yards visible either side of centre
export const RUNOUT = 46              // yards of ground drawn beyond the green

export function viewBox(hole: HoleSpec): string {
  const h = hole.length + RUNOUT + 30
  return `${-HALF_WIDTH} 0 ${HALF_WIDTH * 2} ${h}`
}

export function totalDepth(hole: HoleSpec): number {
  return hole.length + RUNOUT + 30
}

/** Yard-space point → SVG coordinates (y grows downward, so it is flipped). */
export function project(p: Point, hole: HoleSpec): { x: number; y: number } {
  return { x: p.side, y: totalDepth(hole) - RUNOUT - p.down }
}
