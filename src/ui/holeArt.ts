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
import { corridorHalf, greenCentre, surfaceAt } from '../sim/geometry'
import { RUNOUT, project, totalDepth } from './scale'

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

/**
 * THE ART SEED — a hash of (course, hole number, hole length).
 *
 * GRAPHICS-PROPOSAL.md §3.3 asks every decorative position to derive from a
 * hash of (course id, hole number, feature index). `HoleSpec` carries no
 * course id and this slice may not touch sim/ or App.tsx, so the course
 * arrives via the one field that is unique per course-and-hole: the hole's
 * NAME. (Before this, Pine Hollow 3 and Rockdale 3 drew the identical
 * shoreline, because the seed was the hole number alone.)
 *
 * The point is not replay purity — pixels don't replay. It is that the
 * picture must be byte-identical every frame, every mount and every remount:
 * a shoreline that reshuffles makes the player doubt the boundary.
 */
export function holeSeed(hole: HoleSpec): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < hole.name.length; i++) {
    h = Math.imul(h ^ hole.name.charCodeAt(i), 16777619) >>> 0
  }
  h = Math.imul(h ^ hole.num, 16777619) >>> 0
  h = Math.imul(h ^ hole.length, 16777619) >>> 0
  return h >>> 0
}

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
  const seed = holeSeed(hole)
  const pts: Px[] = []
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2
    const w = wob(seed, feature, i, WOBBLE)
    pts.push(project({
      down: at.down + Math.cos(t) * (rDown + w),
      side: at.side + Math.sin(t) * (rSide + w),
    }, hole))
  }
  return smoothClosed(pts)
}

const EDGE_STEP = 12

/**
 * THE DRAWN VERTICES of one lateral edge, in YARD space — the single source
 * of every corridor and band outline in the picture.
 *
 * Exported because the conformance test (holeArt.test.ts) walks exactly these
 * points and asks surfaceAt whether it agrees. If a future restyle bends an
 * edge, it bends here, and the test sees it.
 */
export function edgeVertices(
  hole: HoleSpec, sideSign: 1 | -1, offset: number, feature: number, end: number, amp: number,
): Point[] {
  const n = Math.ceil(end / EDGE_STEP)
  const seed = holeSeed(hole)
  const out: Point[] = []
  for (let i = 0; i <= n; i++) {
    const d = Math.min(i * EDGE_STEP, end)
    out.push({
      down: d,
      side: sideSign * (corridorHalf(hole, d) + offset + wob(seed, feature, i, amp)),
    })
  }
  return out
}

/** The drawn corridor edge on one side. Feature 1 = left, 2 = right. */
export function corridorEdge(hole: HoleSpec, sideSign: 1 | -1): Point[] {
  return edgeVertices(hole, sideSign, 0, sideSign === -1 ? 1 : 2, hole.length + 20, WOBBLE)
}

/**
 * The drawn edge of a lie band at a lateral offset. A shared edge seeds its
 * wobble from the offset alone, so adjacent bands trace the IDENTICAL
 * polyline — no slivers of base ground between deep and trees. The trees/OB
 * edge (offset 40) is drawn unwobbled: crossing it costs two strokes, so it
 * sits exactly where surfaceAt puts it.
 */
export function bandEdge(hole: HoleSpec, sideSign: 1 | -1, offset: number): Point[] {
  return edgeVertices(
    hole, sideSign, offset, (sideSign === 1 ? 300 : 500) + offset,
    hole.length + DEEP_BEYOND, offset === TREES_BAND ? 0 : WOBBLE,
  )
}

/** The fairway corridor with wobbled edges — same sampling as corridorPath. */
export function holeEdgeCorridor(hole: HoleSpec): string {
  const l = corridorEdge(hole, -1).map(p => project(p, hole))
  const r = corridorEdge(hole, 1).map(p => project(p, hole)).reverse()
  return smoothClosed([...l, ...r])
}

/** The ring of ground between two lateral offsets, one side of the hole. */
export function holeEdgeBand(hole: HoleSpec, sideSign: 1 | -1, inner: number, outer: number): string {
  const a = bandEdge(hole, sideSign, inner).map(p => project(p, hole))
  const b = bandEdge(hole, sideSign, outer).map(p => project(p, hole)).reverse()
  return smoothClosed([...a, ...b])
}

/** The OB boundary polyline, exact — no wobble, ever (two-stroke penalty). */
export function obEdge(hole: HoleSpec, sideSign: 1 | -1): string {
  return 'M ' + bandEdge(hole, sideSign, TREES_BAND)
    .map(p => fmt(project(p, hole))).join(' L ')
}

/**
 * A CRISP EDGE — the exact ellipse surfaceAt tests, in drawing units.
 *
 * Every gameplay boundary HoleView strokes or clips to goes through this one
 * function, so there is a single place a fudge factor could ever be typed and
 * a single place the conformance test has to watch. (The old green ry × 0.85
 * "perspective" squash is exactly what this shape of code prevents.)
 */
export interface CrispEllipse {
  readonly cx: number; readonly cy: number; readonly rx: number; readonly ry: number
}

export function trueEllipse(hole: HoleSpec, at: Point, rDown: number, rSide: number): CrispEllipse {
  const c = project(at, hole)
  return { cx: c.x, cy: c.y, rx: rSide, ry: rDown }
}

/** The green: a full CIRCLE of greenRadius, because surfaceAt tests one. */
export function trueGreen(hole: HoleSpec): CrispEllipse {
  return trueEllipse(hole, greenCentre(hole), hole.greenRadius, hole.greenRadius)
}

/** Drawing units → yard space. The inverse of scale.ts `project`. */
export function unproject(p: Px, hole: HoleSpec): Point {
  return { down: totalDepth(hole) - RUNOUT - p.y, side: p.x }
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
  const seed = holeSeed(hole)
  const out: Speck[] = []
  for (let k = 0; k < count; k++) {
    const ang = hash01(seed, feature, k * 3) * Math.PI * 2
    const rad = Math.sqrt(hash01(seed, feature, k * 3 + 1)) * margin
    const p = project({
      down: at.down + Math.cos(ang) * rDown * rad,
      side: at.side + Math.sin(ang) * rSide * rad,
    }, hole)
    out.push({ x: p.x, y: p.y, r: rMin + hash01(seed, feature, k * 3 + 2) * (rMax - rMin) })
  }
  return out
}

/* ============================================================
   THE DECORATION LAYER — GRAPHICS-PROPOSAL.md §2(b)
   ------------------------------------------------------------
   Things that are NOT terrain: trees, a cart path, tee markers,
   the shadows they throw. Three rules bind everything below.

   1. DECORATION NEVER LIES ABOUT A SURFACE. Every sprite's
      position is checked against surfaceAt HERE, at generation
      time, and dropped if it would stand somewhere the sim
      disagrees with. A tree may stand in a trees region or out
      past OB; it may NOT stand on the fairway looking like it
      could block a shot, because the sim says it won't — and an
      obstacle that visibly isn't one is the same lie in the
      other direction. HoleView adds a clip on top of this, so
      the honesty is belt AND braces.
   2. NOTHING HERE COMPETES WITH THE CONE. Decoration draws
      under the cone, at low contrast, out at the margins of the
      frame. The picture reads BECAUSE it is plain; every sprite
      has to pay rent.
   3. DETERMINISTIC, always — holeSeed above, never Math.random.
   ============================================================ */

/**
 * One sun, low and over the player's left shoulder, for the whole game.
 * A unit-ish yard-space vector pointing the way shadows fall. Long shadows
 * are the cheapest depth cue there is and they cost one extra path.
 */
export const SUN = { side: 0.58, down: -0.81 } as const

export interface TreeSprite {
  readonly at: Point
  /** canopy radius in yards */
  readonly r: number
  readonly seed: number
}

/** Lateral offsets from the corridor at which treeline rows are planted. */
const TREE_ROWS = [29.5, 35.5, 45.5]
const TREE_SPACING = 13

/** Is this point inside any hazard the hole DECLARES (as opposed to the
 * outfield OB that geometry derives)? The treeline's gate needs the
 * distinction; a declared region is a place, and places are drawn as
 * themselves. */
function inAnyHazard(hole: HoleSpec, p: Point): boolean {
  return hole.hazards.some(h => {
    const dd = (p.down - h.at.down) / h.rDown
    const ds = (p.side - h.at.side) / h.rSide
    return dd * dd + ds * ds <= 1
  })
}

/**
 * OB STAKES — what actually marks out of bounds on a golf course.
 *
 * A declared OB region used to fall through HoleView's hazard switch onto a
 * generic branch and get painted `var(--rough)`: the picture coloured a
 * TWO-STROKE penalty the same green as safe grass, which is the one thing
 * the picture is never allowed to do. It has its own vocabulary now, and the
 * vocabulary is the sport's: a line of white stakes around the edge, spaced
 * along the true ellipse so they sit exactly where the penalty starts.
 */
export function obStakes(
  hole: HoleSpec, at: Point, rDown: number, rSide: number, feat: number,
): Point[] {
  const seed = holeSeed(hole)
  // perimeter of an ellipse, near enough for spacing purposes
  const per = Math.PI * (3 * (rDown + rSide)
    - Math.sqrt((3 * rDown + rSide) * (rDown + 3 * rSide)))
  const n = Math.max(6, Math.min(28, Math.round(per / 13)))
  const out: Point[] = []
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2
    out.push({
      down: at.down + Math.cos(t) * rDown + wob(seed, feat, i, 0.8),
      side: at.side + Math.sin(t) * rSide + wob(seed, feat + 1, i, 0.5),
    })
  }
  return out
}

/**
 * THE TREELINE — the stand of trees that frames the hole.
 *
 * Rows sit in the lateral TREES band (corridor + 26…40, where surfaceAt says
 * 'trees') and one row out in the OB field beyond it. Every candidate is put
 * to surfaceAt and dropped unless it answers 'trees' or 'ob', so the treeline
 * cannot creep onto ground that plays as grass — including the everything-is-
 * deep zone past length + 35, which surfaceAt rejects for us.
 */
export function treeline(hole: HoleSpec): TreeSprite[] {
  const seed = holeSeed(hole)
  const out: TreeSprite[] = []
  const from = -RUNOUT + 6
  const to = hole.length + DEEP_BEYOND
  let k = 0
  for (const sideSign of [-1, 1] as const) {
    for (let row = 0; row < TREE_ROWS.length; row++) {
      const off = TREE_ROWS[row]!
      const feat = 700 + row * 11 + (sideSign === 1 ? 5 : 0)
      for (let d = from; d <= to; d += TREE_SPACING) {
        k++
        if (hash01(seed, feat + 1, k) < 0.24) continue        // gaps, not a hedge
        const down = d + wob(seed, feat + 2, k, TREE_SPACING * 0.42)
        const side = sideSign * (corridorHalf(hole, Math.max(down, 0)) + off
          + wob(seed, feat + 3, k, 3.2))
        const at = { down, side }
        // THE HONESTY GATE — ask the sim, not the picture
        const s = surfaceAt(hole, at)
        if (s !== 'trees' && s !== 'ob') continue
        // ...and a NARROWER gate than the one first written here. 'ob' was
        // allowed because OB is normally the outfield BEYOND the treeline,
        // where a row of trees is exactly right. But a hole may declare OB as
        // an interior hazard — Rockdale 1's range fence is a 7-yard sliver
        // between the fairway and the cart path — and the old rule dutifully
        // planted a wood inside it. That is the picture naming the wrong
        // surface: trees cost 70% carry and 2.4x scatter, OB costs TWO
        // STROKES, and the owner correctly read the result as a green blob
        // that did not belong. Trees never grow inside a declared hazard.
        if (s === 'ob' && inAnyHazard(hole, at)) continue
        out.push({ at, r: 2.5 + hash01(seed, feat + 4, k) * 2.7, seed: seed ^ (k * 2654435761) })
      }
    }
  }
  return out
}

/**
 * The trees that fill a trees HAZARD — the sim's own region, drawn as what it
 * plays as. Same honesty gate; HoleView also clips these to the true ellipse.
 */
export function treesInEllipse(
  hole: HoleSpec, feature: number, at: Point, rDown: number, rSide: number,
): TreeSprite[] {
  const seed = holeSeed(hole)
  const count = Math.max(7, Math.min(34, Math.round((rDown * rSide) / 13)))
  const out: TreeSprite[] = []
  for (let k = 0; k < count; k++) {
    const ang = hash01(seed, feature, k * 3) * Math.PI * 2
    const rad = Math.sqrt(hash01(seed, feature, k * 3 + 1)) * 0.82
    const p = {
      down: at.down + Math.cos(ang) * rDown * rad,
      side: at.side + Math.sin(ang) * rSide * rad,
    }
    if (surfaceAt(hole, p) !== 'trees') continue
    out.push({
      at: p,
      r: 2.2 + hash01(seed, feature, k * 3 + 2) * 2.2,
      seed: seed ^ (feature * 40503) ^ (k * 2654435761),
    })
  }
  return out
}

/** A small irregular closed blob in yard space, projected. Deterministic. */
function blob(hole: HoleSpec, at: Point, r: number, seed: number, n = 7): string {
  const pts: Px[] = []
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2
    const rr = r * (0.76 + hash01(seed, i, 11) * 0.38)
    pts.push(project({
      down: at.down + Math.cos(t) * rr, side: at.side + Math.sin(t) * rr,
    }, hole))
  }
  return 'M ' + pts.map(fmt).join(' L ') + ' Z'
}

export interface TreeArt {
  /** every canopy's shadow, merged into ONE path */
  readonly shadow: string
  /** every canopy, merged into ONE path */
  readonly canopy: string
  /** the sunlit crown of every canopy, merged into ONE path */
  readonly light: string
}

/**
 * A whole forest in three path elements.
 *
 * PERFORMANCE, deliberately: two hundred trees as two hundred <circle>s is
 * two hundred DOM nodes on a phone. Merged as subpaths of one `d` string it
 * is three, and the rasteriser fills them in one go. Path DATA is cheap; SVG
 * NODES are not (GRAPHICS-PROPOSAL.md's ask: find a cheaper expression).
 */
export function treeArt(hole: HoleSpec, trees: readonly TreeSprite[]): TreeArt {
  const shadow: string[] = []
  const canopy: string[] = []
  const light: string[] = []
  for (const t of trees) {
    const off = t.r * 1.25
    shadow.push(blob(hole, {
      down: t.at.down + SUN.down * off, side: t.at.side + SUN.side * off,
    }, t.r * 0.94, t.seed ^ 0x9e37, 6))
    canopy.push(blob(hole, t.at, t.r, t.seed))
    light.push(blob(hole, {
      down: t.at.down - SUN.down * t.r * 0.34, side: t.at.side - SUN.side * t.r * 0.34,
    }, t.r * 0.46, t.seed ^ 0x51ed, 5))
  }
  return { shadow: shadow.join(' '), canopy: canopy.join(' '), light: light.join(' ') }
}

/**
 * THE CART PATH. It runs down one side of the hole, inside the DEEP band and
 * nowhere near a boundary that decides anything: at corridor + 19 ± 3.2, with
 * the band running from + 12 to + 26, the ribbon and its stroke stay clear of
 * both edges by four yards. Behind the tee it carries on into the OB field,
 * which is where a cart path comes from.
 *
 * It is furniture, not an obstacle — the sim has no cart path and no golfer
 * expects one to stop a ball. It is here because a hole with a path down the
 * side reads as a golf course and a hole without one reads as a diagram.
 */
export const CART_OFFSET = 19
export const CART_WANDER = 3.2
const CART_STEP = 22

/**
 * Which side the path runs down. When the green sits off centre it runs down
 * the OTHER side — which is what a course does, and which keeps the ribbon
 * away from the one surface it must never be drawn across.
 */
export function cartPathSide(hole: HoleSpec): 1 | -1 {
  if (hole.greenSide > 2) return -1
  if (hole.greenSide < -2) return 1
  return hash01(holeSeed(hole), 610, 0) < 0.5 ? -1 : 1
}

/**
 * The path's centreline, in yard space — walked by the conformance test.
 *
 * It STOPS short of the green. A cart path that crossed a putting surface
 * would be decoration painting over a boundary that decides shots, and on a
 * hole with a hard-offset green (Cottonwood 4, found by the test) the deep
 * band runs straight through it. Ending beside the green is also just what a
 * cart path does.
 */
export function cartPathPoints(hole: HoleSpec): Point[] {
  const seed = holeSeed(hole)
  const sideSign = cartPathSide(hole)
  const g = greenCentre(hole)
  const clear = hole.greenRadius + 4
  const from = -RUNOUT + 4
  const to = hole.length + 20
  const out: Point[] = []
  for (let i = 0, d = from; d <= to + CART_STEP; i++, d += CART_STEP) {
    const down = Math.min(d, to)
    const p = {
      down,
      side: sideSign * (corridorHalf(hole, Math.max(down, 0)) + CART_OFFSET
        + wob(seed, 620, i, CART_WANDER)),
    }
    const dd = p.down - g.down, ds = p.side - g.side
    if (dd * dd + ds * ds <= clear * clear) break     // the path ends here
    out.push(p)
    if (down >= to) break
  }
  return out
}

/** Open smoothed polyline — the same quadratic-through-midpoints trick. */
function smoothOpen(pts: readonly Px[]): string {
  if (pts.length < 2) return ''
  let d = `M ${fmt(pts[0]!)}`
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i]!, b = pts[i + 1]!
    d += ` Q ${fmt(a)} ${fmt({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })}`
  }
  return d + ` L ${fmt(pts[pts.length - 1]!)}`
}

export function cartPathD(hole: HoleSpec): string {
  return smoothOpen(cartPathPoints(hole).map(p => project(p, hole)))
}

/**
 * TEE MARKERS. Two blocks on the teeing ground, drawn at the exact depth the
 * ball starts from. They decide nothing; they say "this is where you stand",
 * which is the one thing the picture never said out loud.
 */
export function teeMarkers(hole: HoleSpec): Point[] {
  const off = Math.min(5.5, Math.max(2.5, corridorHalf(hole, 0) * 0.42))
  return [{ down: 0, side: -off }, { down: 0, side: off }]
}

export function teeMarkerD(hole: HoleSpec, r: number): string {
  return teeMarkers(hole).map(m => {
    const p = project(m, hole)
    return `M ${fmt({ x: p.x - r, y: p.y - r })} h ${(r * 2).toFixed(1)} `
      + `v ${(r * 2).toFixed(1)} h ${(-r * 2).toFixed(1)} Z`
  }).join(' ')
}
