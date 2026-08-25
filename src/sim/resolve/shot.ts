import type { Cone, HoleSpec, Point, Surface } from '../types'
import type { RngState } from '../rng'
import { range, triangular } from '../rng'
import { greenCentre, surfaceAt, toPin } from '../geometry'
import type { ConeContext } from '../effects'

export interface ShotOutcome {
  readonly landing: Point
  /** where it first hit the ground, BEFORE any run-out */
  readonly pitch: Point
  readonly surface: Surface
  readonly penalty: number
  readonly carried: number
  readonly rolled: number
  readonly toPin: number
}

/** Unit vector from the ball toward the pin, plus its perpendicular. */
export function aimFrame(hole: HoleSpec, from: Point) {
  const g = greenCentre(hole)
  const dd = g.down - from.down
  const ds = g.side - from.side
  const len = Math.sqrt(dd * dd + ds * ds) || 1
  const dir = { down: dd / len, side: ds / len }
  // rotate 90°: perpendicular, used for lateral scatter and aim
  const perp = { down: -dir.side, side: dir.down }
  return { dir, perp, len }
}

/**
 * Roll a shot INSIDE the cone, travelling TOWARD THE PIN.
 *
 * Pillar P8: the ball can never finish outside the shape the player was shown.
 * Lateral scatter is triangular (bounded, peaked at centre); carry varies
 * within a few percent. No Gaussian, no tails, no Math.cos.
 */
export function resolveShot(
  hole: HoleSpec,
  from: Point,
  cone: Cone,
  ctx: ConeContext,
  rng: RngState,
): readonly [ShotOutcome, RngState] {
  const [tri, r1] = triangular(rng)
  const [carryJitter, r2] = range(r1, -0.05, 0.05)

  const { dir, perp } = aimFrame(hole, from)
  const carried = cone.carry * (1 + carryJitter)
  const lateral = cone.aimOffset + tri * cone.spread

  // Where it PITCHES — a low shot that pitches in water is wet even if it
  // would have run past. That is what makes lowFlight a real drawback.
  const pitch: Point = {
    down: from.down + dir.down * carried + perp.down * lateral,
    side: from.side + dir.side * carried + perp.side * lateral,
  }
  const pitchSurface = surfaceAt(hole, pitch)

  const rolled = pitchSurface === 'green' ? Math.round(cone.roll * 0.3)
    : pitchSurface === 'rough' || pitchSurface === 'deep' ? Math.round(cone.roll * 0.4)
    : cone.roll
  const landing: Point = rolled === 0 ? pitch : {
    down: pitch.down + dir.down * rolled,
    side: pitch.side + dir.side * rolled,
  }

  let surface = surfaceAt(hole, landing)

  // A low runner cannot carry trouble — if it pitches wet, it is wet.
  if (ctx.lowFlight && (pitchSurface === 'water' || pitchSurface === 'ob')) {
    surface = pitchSurface
  }

  // "Just Get It On The Green" — hazards ignored, you land in rough instead.
  if (ctx.ignoreHazards && (surface === 'water' || surface === 'ob')) {
    surface = 'rough'
  }

  const penalty = surface === 'water' ? 1 : surface === 'ob' ? 2 : 0

  return [{
    landing,
    pitch,
    surface,
    penalty,
    carried: Math.round(carried),
    rolled,
    toPin: Math.round(toPin(hole, landing)),
  }, r2] as const
}

/**
 * Where you drop after finding water: back toward the tee, in the fairway.
 *
 * Takes the PITCH point, not the final resting place. A low runner can pitch in
 * the water and then roll well past it — dropping from where it stopped could
 * put you on the green with a penalty stroke, which softlocked the hole.
 */
export function dropPoint(pitch: Point): Point {
  return { down: Math.max(20, pitch.down - 25), side: 0 }
}
