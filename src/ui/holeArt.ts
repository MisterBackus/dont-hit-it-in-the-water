/**
 * Deterministic edge character for the Sunday Tape hole rendering.
 * See GRAPHICS-PROPOSAL.md §2(a) and §3.
 *
 * Everything here is a pure function of the hole spec: every wobbled vertex
 * is hashed from (hole number, feature seed, vertex index), never rolled at
 * render time. The picture must be identical every frame and every mount —
 * a shoreline that reshuffles on re-render looks broken and makes the player
 * doubt the boundary. Math.sin/Math.cos are fine HERE: the float-determinism
 * ban is a sim/ replay rule (ARCHITECTURE.md §3.3), and pixels don't replay.
 *
 * WOBBLE is capped at 1.5 yards — about 2px at render scale, mean-zero, far
 * below decision scale (cone spreads run 8–25+ yards). The wobble is texture;
 * where a boundary carries a penalty (water, OB) HoleView also draws a crisp
 * stroke at the exact sim edge. That split is the boundary-honesty contract:
 * any line that decides a shot is drawn where surfaceAt believes it is.
 */
import type { HoleSpec, Point } from '../sim/types'
import { corridorHalf } from '../sim/geometry'
import { project } from './scale'

interface Px { readonly x: number; readonly y: number }

/** Hard cap on edge wobble, in yards. Mean-zero uniform; see file header. */
export const WOBBLE = 1.5

/**
 * These mirror the lateral bands in sim/geometry.ts surfaceAt — rough to
 * half+12, deep to half+26, trees to half+40, OB beyond — and the everything-
 * is-deep override past length+35. sim/ doesn't export them, and this slice
 * may not touch sim/. If surfaceAt's bands ever change, change these too or
 * the picture lies.
 */
export const ROUGH_BAND = 12
export const DEEP_BAND = 26
export const TREES_BAND = 40
export const DEEP_BEYOND = 35

/** Integer hash → [0,1). Stable by construction — never Math.random. */
export function hash01(a: number, b: number, c: number): number {
  let h = (Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(c | 0, 2246822519)) >>> 0
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0
  h = (h ^ (h >>> 16)) >>> 0
  return h / 4294967296
}

/** Mean-zero wobble in [-amp, amp]. */
function wob(a: number, b: number, c: number, amp: number): number {
  return (hash01(a, b, c) - 0.5) * 2 * amp
}

function fmt(p: Px): string {
  return `${p.x.toFixed(1)},${p.y.toFixed(1)}`
}

/** Closed path smoothed with quadratics through midpoints — organic, cheap. */
function smoothClosed(pts: readonly Px[]): string {
  const n = pts.length
  const mid = (i: number): Px => {
    const a = pts[i % n]!, b = pts[(i + 1) % n]!
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  }
  let d = `M ${fmt(mid(n - 1))}`
  for (let i = 0; i < n; i++) d += ` Q ${fmt(pts[i]!)} ${fmt(mid(i))}`
  return d + ' Z'
}

/** A hazard/green ellipse with hand-drawn edge character, radially wobbled. */
export function holeEdgeEllipse(
  hole: HoleSpec, feature: number, at: Point, rDown: number, rSide: number,
): string {
  const N = 24
  const pts: Px[] = []
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2
    const w = wob(hole.num, feature, i, WOBBLE)
    pts.push(project({
      down: at.down + Math.cos(t) * (rDown + w),
      side: at.side + Math.sin(t) * (rSide + w),
    }, hole))
  }
  return smoothClosed(pts)
}

/** The fairway corridor with wobbled edges — same sampling as corridorPath. */
export function holeEdgeCorridor(hole: HoleSpec): string {
  const step = 12
  const end = hole.length + 20
  const n = Math.ceil(end / step)
  const pts: Px[] = []
  for (let i = 0; i <= n; i++) {
    const d = Math.min(i * step, end)
    pts.push(project({ down: d, side: -(corridorHalf(hole, d) + wob(hole.num, 1, i, WOBBLE)) }, hole))
  }
  for (let i = n; i >= 0; i--) {
    const d = Math.min(i * step, end)
    pts.push(project({ down: d, side: corridorHalf(hole, d) + wob(hole.num, 2, i, WOBBLE) }, hole))
  }
  return smoothClosed(pts)
}

/**
 * The ring of ground between two lateral offsets from the corridor, one side
 * of the hole. A shared edge seeds its wobble from the offset alone, so
 * adjacent bands trace the IDENTICAL polyline — no slivers of base ground
 * between deep and trees. The trees/OB edge (offset 40) is drawn unwobbled:
 * crossing it costs two strokes, so it sits exactly where surfaceAt puts it.
 */
export function holeEdgeBand(hole: HoleSpec, sideSign: 1 | -1, inner: number, outer: number): string {
  const step = 12
  const end = hole.length + DEEP_BEYOND
  const n = Math.ceil(end / step)
  const edge = (off: number, i: number): number => {
    const amp = off === TREES_BAND ? 0 : WOBBLE
    const d = Math.min(i * step, end)
    return corridorHalf(hole, d) + off + wob(hole.num, (sideSign === 1 ? 300 : 500) + off, i, amp)
  }
  const pts: Px[] = []
  for (let i = 0; i <= n; i++) {
    pts.push(project({ down: Math.min(i * step, end), side: sideSign * edge(inner, i) }, hole))
  }
  for (let i = n; i >= 0; i--) {
    pts.push(project({ down: Math.min(i * step, end), side: sideSign * edge(outer, i) }, hole))
  }
  return smoothClosed(pts)
}

/** The OB boundary polyline, exact — no wobble, ever (two-stroke penalty). */
export function obEdge(hole: HoleSpec, sideSign: 1 | -1): string {
  const step = 12
  const end = hole.length + DEEP_BEYOND
  const n = Math.ceil(end / step)
  const seg: string[] = []
  for (let i = 0; i <= n; i++) {
    const d = Math.min(i * step, end)
    seg.push(fmt(project({ down: d, side: sideSign * (corridorHalf(hole, d) + TREES_BAND) }, hole)))
  }
  return 'M ' + seg.join(' L ')
}

export interface Speck {
  readonly x: number
  readonly y: number
  /** radius in viewBox units, i.e. yards */
  readonly r: number
}

/**
 * Deterministic scatter inside an ellipse — bunker stipple, tree canopies.
 * Decoration only: callers clip it to the TRUE ellipse so it cannot leak
 * across a gameplay boundary.
 */
export function scatterInEllipse(
  hole: HoleSpec, feature: number, at: Point, rDown: number, rSide: number,
  count: number, rMin: number, rMax: number, margin: number,
): Speck[] {
  const out: Speck[] = []
  for (let k = 0; k < count; k++) {
    const ang = hash01(hole.num, feature, k * 3) * Math.PI * 2
    const rad = Math.sqrt(hash01(hole.num, feature, k * 3 + 1)) * margin
    const p = project({
      down: at.down + Math.cos(ang) * rDown * rad,
      side: at.side + Math.sin(ang) * rSide * rad,
    }, hole)
    out.push({ x: p.x, y: p.y, r: rMin + hash01(hole.num, feature, k * 3 + 2) * (rMax - rMin) })
  }
  return out
}
