/**
 * BOUNDARY CONFORMANCE — GRAPHICS-PROPOSAL.md §3.5.
 *
 * "A small shot.test.ts-style test that walks the drawn boundary paths and
 * asserts surfaceAt agrees on both sides."
 *
 * This is the mechanical version of the promise the whole graphics work is
 * fenced by: ANY BOUNDARY THAT DECIDES A SHOT IS DRAWN WHERE surfaceAt PUTS
 * IT. The green-radius bug (`ry = greenRadius * 0.85`, a green drawn two
 * yards smaller than it played) is fixed; this file is what stops its
 * cousins. A future restyle is free to change how an edge LOOKS. If it
 * changes where an edge IS, these tests fail.
 *
 * Four families, run over every hole of every shipped course:
 *
 *   1. CRISP EDGES ARE EXACT. The green and every hazard are stroked and
 *      clipped to `trueEllipse`/`trueGreen`. Probe half a yard either side
 *      of the drawn edge and demand surfaceAt agree. Half a yard is far
 *      finer than any lie the eye could excuse — the old 0.85 squash moved
 *      the green edge by four.
 *   2. WOBBLED EDGES STAY UNDER THE DECLARED CAP. Corridor and lie-band
 *      outlines carry hand-drawn character, capped at WOBBLE (1.5 yd, well
 *      under the 8–25 yd scale a cone decides at). Every drawn vertex is
 *      checked against the true offset, and surfaceAt is probed outside the
 *      wobble envelope on both sides.
 *   3. THE OB LINE IS NEVER WOBBLED AT ALL. Crossing it costs two strokes.
 *   4. DECORATION NEVER STANDS WHERE THE SIM DISAGREES. Every tree, every
 *      metre of cart path and both tee markers are put back to surfaceAt.
 *      A tree may stand in a trees region or out past OB; it may not stand
 *      on the fairway looking like it could block a shot.
 *
 * Plus determinism: the picture must be identical every mount.
 */
import { describe, expect, test } from 'vitest'
import { COURSES, COURSE_POOL } from '../content/courses'
import { corridorHalf, greenCentre, surfaceAt } from '../sim/geometry'
import type { HoleSpec, Point, Surface } from '../sim/types'
import {
  CART_OFFSET, CART_WANDER, DEEP_BAND, DEEP_BEYOND, ROUGH_BAND, TREES_BAND, WOBBLE,
  bandEdge, cartPathPoints, corridorEdge, holeSeed, teeMarkers, treeline,
  treesInEllipse, trueEllipse, trueGreen, unproject,
} from './holeArt'

const HOLES: { course: string; hole: HoleSpec }[] = COURSE_POOL.flatMap(id =>
  COURSES[id]!.holes.map(hole => ({ course: COURSES[id]!.label, hole })))

/** Every point of the drawn ellipse, at a radial scale. 1 = the drawn edge. */
function ringPoints(at: Point, rDown: number, rSide: number, scale: number, n = 48): Point[] {
  const out: Point[] = []
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2
    out.push({
      down: at.down + Math.cos(t) * rDown * scale,
      side: at.side + Math.sin(t) * rSide * scale,
    })
  }
  return out
}

/** Does the sim place this point inside hazard k's ellipse? */
function inHazard(hole: HoleSpec, k: number, p: Point): boolean {
  const h = hole.hazards[k]!
  const dd = (p.down - h.at.down) / h.rDown
  const ds = (p.side - h.at.side) / h.rSide
  return dd * dd + ds * ds <= 1
}

function inGreen(hole: HoleSpec, p: Point): boolean {
  const g = greenCentre(hole)
  const dd = p.down - g.down, ds = p.side - g.side
  return dd * dd + ds * ds <= hole.greenRadius * hole.greenRadius
}

describe('the drawn crisp edges are the sim\'s edges (GRAPHICS-PROPOSAL §3.5)', () => {
  test('the green is drawn as the exact circle surfaceAt tests', () => {
    for (const { course, hole } of HOLES) {
      const drawn = trueGreen(hole)
      const g = greenCentre(hole)
      const gp = { x: drawn.cx, y: drawn.cy }
      const where = `${course} ${hole.num}`

      // the drawn centre and radii ARE the sim's centre and radius —
      // no perspective squash, no fringe fudge, in either axis
      expect(unproject(gp, hole).down, `${where} green centre down`).toBeCloseTo(g.down, 6)
      expect(unproject(gp, hole).side, `${where} green centre side`).toBeCloseTo(g.side, 6)
      expect(drawn.rx, `${where} green rx`).toBe(hole.greenRadius)
      expect(drawn.ry, `${where} green ry`).toBe(hole.greenRadius)

      // walk the drawn edge and ask surfaceAt on both sides of it
      const eps = 0.5 / hole.greenRadius
      for (const p of ringPoints(g, hole.greenRadius, hole.greenRadius, 1 - eps)) {
        expect(surfaceAt(hole, p), `${where} inside the drawn green edge`).toBe('green')
      }
      for (const p of ringPoints(g, hole.greenRadius, hole.greenRadius, 1 + eps)) {
        expect(surfaceAt(hole, p), `${where} outside the drawn green edge`).not.toBe('green')
        expect(inGreen(hole, p), `${where} outside the drawn green edge`).toBe(false)
      }
    }
  })

  test('every hazard is drawn as the exact ellipse surfaceAt tests', () => {
    for (const { course, hole } of HOLES) {
      hole.hazards.forEach((h, k) => {
        const drawn = trueEllipse(hole, h.at, h.rDown, h.rSide)
        const where = `${course} ${hole.num} hazard ${k} (${h.surface})`
        const c = unproject({ x: drawn.cx, y: drawn.cy }, hole)
        expect(c.down, `${where} centre down`).toBeCloseTo(h.at.down, 6)
        expect(c.side, `${where} centre side`).toBeCloseTo(h.at.side, 6)
        // rx tracks the SIDE radius and ry the DOWN radius — the axes are
        // swapped by the projection, and swapping them back is the exact
        // shape of mistake this file exists to catch
        expect(drawn.rx, `${where} rx`).toBe(h.rSide)
        expect(drawn.ry, `${where} ry`).toBe(h.rDown)

        const eps = 0.5 / Math.min(h.rDown, h.rSide)
        for (const p of ringPoints(h.at, h.rDown, h.rSide, 1 - eps)) {
          expect(inHazard(hole, k, p), `${where}: inside the drawn edge`).toBe(true)
          // surfaceAt returns THIS hazard unless something legitimately wins
          // first: the green, or a hazard earlier in the list
          const winner = surfaceAt(hole, p)
          if (winner !== h.surface) {
            const overridden = inGreen(hole, p)
              || hole.hazards.some((_, j) => j < k && inHazard(hole, j, p))
            expect(overridden, `${where}: surfaceAt said ${winner} inside the drawn edge`)
              .toBe(true)
          }
        }
        for (const p of ringPoints(h.at, h.rDown, h.rSide, 1 + eps)) {
          expect(inHazard(hole, k, p), `${where}: outside the drawn edge`).toBe(false)
        }
      })
    }
  })
})

describe('wobbled edges are texture, never new geometry', () => {
  test('every drawn corridor vertex is within the declared wobble of the truth', () => {
    for (const { course, hole } of HOLES) {
      for (const sign of [-1, 1] as const) {
        for (const v of corridorEdge(hole, sign)) {
          const truth = corridorHalf(hole, v.down)
          const drift = Math.abs(Math.abs(v.side) - truth)
          expect(drift, `${course} ${hole.num} corridor edge at ${v.down}`)
            .toBeLessThanOrEqual(WOBBLE + 1e-9)
          expect(Math.sign(v.side) === sign || v.side === 0).toBe(true)
        }
      }
    }
  })

  test('surfaceAt agrees on both sides of the drawn corridor edge', () => {
    // Probed OUTSIDE the wobble envelope, which is what makes this a claim
    // about gameplay rather than about pixels: whatever character the line
    // has, fairway is still inside it and rough is still outside it.
    const clear = WOBBLE + 0.5
    for (const { course, hole } of HOLES) {
      for (const sign of [-1, 1] as const) {
        for (const v of corridorEdge(hole, sign)) {
          if (v.down <= 0 || v.down > hole.length + DEEP_BEYOND) continue
          const half = corridorHalf(hole, v.down)
          const at = (off: number): Point => ({ down: v.down, side: sign * off })
          const inside = at(Math.max(half - clear, 0))
          const outside = at(half + clear)
          const where = `${course} ${hole.num} at ${v.down}`
          if (surfaceAt(hole, inside) !== 'fairway') {
            expect(inGreen(hole, inside)
              || hole.hazards.some((_, j) => inHazard(hole, j, inside)),
            `${where}: inside the drawn fairway edge`).toBe(true)
          }
          if (surfaceAt(hole, outside) !== 'rough') {
            expect(inGreen(hole, outside)
              || hole.hazards.some((_, j) => inHazard(hole, j, outside)),
            `${where}: outside the drawn fairway edge`).toBe(true)
          }
        }
      }
    }
  })

  test('every lie band is drawn at the offset surfaceAt bands at', () => {
    for (const { course, hole } of HOLES) {
      for (const sign of [-1, 1] as const) {
        for (const off of [ROUGH_BAND, DEEP_BAND, TREES_BAND]) {
          for (const v of bandEdge(hole, sign, off)) {
            const truth = corridorHalf(hole, v.down) + off
            const cap = off === TREES_BAND ? 0 : WOBBLE
            expect(Math.abs(Math.abs(v.side) - truth),
              `${course} ${hole.num} band ${off} at ${v.down}`).toBeLessThanOrEqual(cap + 1e-9)
          }
        }
      }
    }
  })

  test('the OB line is drawn EXACTLY at corridor+40 — no wobble, ever', () => {
    // Two strokes. This boundary gets no character at all.
    for (const { course, hole } of HOLES) {
      for (const sign of [-1, 1] as const) {
        for (const v of bandEdge(hole, sign, TREES_BAND)) {
          expect(Math.abs(v.side), `${course} ${hole.num} OB line at ${v.down}`)
            .toBeCloseTo(corridorHalf(hole, v.down) + TREES_BAND, 9)
          if (v.down <= 0 || v.down > hole.length + DEEP_BEYOND) continue
          const at = (off: number): Point => ({ down: v.down, side: sign * off })
          const half = corridorHalf(hole, v.down)
          const out = at(half + TREES_BAND + 0.5)
          const inn = at(half + TREES_BAND - 0.5)
          const hazarded = (p: Point) => hole.hazards.some((_, j) => inHazard(hole, j, p))
          if (!hazarded(out)) expect(surfaceAt(hole, out), 'just outside OB').toBe('ob')
          if (!hazarded(inn)) expect(surfaceAt(hole, inn), 'just inside OB').toBe('trees')
        }
      }
    }
  })
})

describe('decoration never stands where the sim disagrees (§2b)', () => {
  const LEGAL: readonly Surface[] = ['trees', 'ob']

  test('every tree in every treeline stands on trees or OB ground', () => {
    let planted = 0
    for (const { course, hole } of HOLES) {
      for (const t of treeline(hole)) {
        planted++
        const s = surfaceAt(hole, t.at)
        expect(LEGAL, `${course} ${hole.num}: a tree at ${JSON.stringify(t.at)} stands on ${s}`)
          .toContain(s)
        // and specifically NOT where a player would read it as an obstacle
        expect(s).not.toBe('fairway')
        expect(s).not.toBe('green')
      }
    }
    // if placement ever silently produced nothing, the check above is vacuous
    expect(planted).toBeGreaterThan(1000)
  })

  test('every canopy inside a trees hazard stands on trees ground', () => {
    let planted = 0
    for (const { course, hole } of HOLES) {
      hole.hazards.forEach((h, i) => {
        if (h.surface !== 'trees') return
        for (const t of treesInEllipse(hole, 220 + i, h.at, h.rDown, h.rSide)) {
          planted++
          expect(surfaceAt(hole, t.at), `${course} ${hole.num} trees hazard ${i}`).toBe('trees')
          expect(inHazard(hole, i, t.at)).toBe(true)
        }
      })
    }
    expect(planted).toBeGreaterThan(20)
  })

  test('the cart path stays inside the deep band, clear of both its edges', () => {
    for (const { course, hole } of HOLES) {
      const pts = cartPathPoints(hole)
      expect(pts.length).toBeGreaterThan(4)
      for (const p of pts) {
        const half = corridorHalf(hole, Math.max(p.down, 0))
        const off = Math.abs(p.side) - half
        const where = `${course} ${hole.num} cart path at ${p.down.toFixed(0)}`
        // inside the deep band (12…26) with clearance for the ribbon's width
        expect(off, `${where}: too near the rough edge`)
          .toBeGreaterThanOrEqual(ROUGH_BAND + 1.5)
        expect(off, `${where}: too near the trees edge`)
          .toBeLessThanOrEqual(DEEP_BAND - 1.5)
        expect(off).toBeCloseTo(CART_OFFSET, -1)
        expect(Math.abs(off - CART_OFFSET)).toBeLessThanOrEqual(CART_WANDER + 1e-9)
        // and it never runs past the ground the band is drawn on
        expect(p.down).toBeLessThanOrEqual(hole.length + DEEP_BEYOND)
        // surfaceAt: deep rough, OB behind the tee, or under a hazard that
        // is drawn on top of it — never fairway, never green
        const s = surfaceAt(hole, p)
        const covered = hole.hazards.some((_, j) => inHazard(hole, j, p))
        if (!covered) {
          expect(p.down < 0 ? 'ob' : 'deep', `${where}: surfaceAt said ${s}`).toBe(s)
        }
      }
    }
  })

  test('the tee markers sit on the teeing ground, either side of the ball', () => {
    for (const { course, hole } of HOLES) {
      const m = teeMarkers(hole)
      expect(m).toHaveLength(2)
      expect(m[0]!.down).toBe(0)
      expect(m[1]!.down).toBe(0)
      expect(m[0]!.side).toBe(-m[1]!.side)
      expect(Math.abs(m[0]!.side), `${course} ${hole.num}`)
        .toBeLessThan(corridorHalf(hole, 0))
      for (const p of m) {
        expect(surfaceAt(hole, p), `${course} ${hole.num} tee marker`).toBe('fairway')
      }
    }
  })
})

describe('the picture is identical every mount (GRAPHICS-PROPOSAL §3.3)', () => {
  test('every generator is a pure function of the hole', () => {
    // Not a replay rule — a trust rule. A shoreline that reshuffles on
    // re-render looks broken and makes the player doubt the boundary.
    for (const { hole } of HOLES.slice(0, 12)) {
      expect(treeline(hole)).toEqual(treeline(hole))
      expect(cartPathPoints(hole)).toEqual(cartPathPoints(hole))
      expect(corridorEdge(hole, 1)).toEqual(corridorEdge(hole, 1))
      expect(holeSeed(hole)).toBe(holeSeed(hole))
    }
  })

  test('the seed carries the course, not just the hole number', () => {
    // Before this, Pine Hollow 3 and Rockdale 3 drew the identical shoreline.
    const seeds = new Map<number, string>()
    let collisions = 0
    for (const { course, hole } of HOLES) {
      const s = holeSeed(hole)
      if (seeds.has(s)) collisions++
      seeds.set(s, `${course} ${hole.num}`)
    }
    expect(collisions).toBe(0)
    // and two holes with the same NUMBER on different courses differ
    const third = COURSE_POOL
      .map(id => COURSES[id]!.holes.find(h => h.num === 3))
      .filter((h): h is HoleSpec => !!h)
    expect(new Set(third.map(holeSeed)).size).toBe(third.length)
  })
})
