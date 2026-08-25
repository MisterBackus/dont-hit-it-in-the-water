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

/**
 * The camera never zooms past this window depth (yards). Keeps the view
 * roughly as tall as it is wide, so `meet` stays filled and a 20-yard chip
 * doesn't render at absurd magnification.
 */
export const MIN_WINDOW = 120

/**
 * Where the camera window starts, clamped. `fromDown` is a yard distance
 * down the hole (usually ball.down - 15); the window always runs from there
 * to the far end of the drawn ground, so nothing the ball can still reach
 * is ever cropped. Default is the full hole — today's view, unchanged.
 */
export function windowFrom(hole: HoleSpec, fromDown: number = -RUNOUT): number {
  return Math.max(-RUNOUT, Math.min(fromDown, hole.length + 30 - MIN_WINDOW))
}

/**
 * MOBILE-PROPOSAL.md §2.3: the camera follows the ball, and it does so HERE,
 * by cropping this one viewBox — never via a second yards→pixels conversion.
 * A uniform crop cannot make the picture lie: cone and hazards still share
 * the projection, so they scale together by construction.
 */
export function viewBox(hole: HoleSpec, fromDown?: number): string {
  const lo = windowFrom(hole, fromDown)
  return `${-HALF_WIDTH} 0 ${HALF_WIDTH * 2} ${hole.length + 30 - lo}`
}

export function totalDepth(hole: HoleSpec): number {
  return hole.length + RUNOUT + 30
}

/** Yard-space point → SVG coordinates (y grows downward, so it is flipped). */
export function project(p: Point, hole: HoleSpec): { x: number; y: number } {
  return { x: p.side, y: totalDepth(hole) - RUNOUT - p.down }
}
