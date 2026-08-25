/**
 * THE COURSE REGISTRY — data only, no logic (ARCHITECTURE §6).
 *
 * The four course files stay exactly as they are: they are the measured
 * artifacts the review docs refer to (REVIEW-1 through 6 are digit-for-digit
 * comparable against them). This file only gathers them and prices them for
 * the schedule (SCHEDULE-PLAN.md).
 *
 * The schedule is a POOL MECHANISM, not a fixed table (owner decision,
 * SCHEDULE-PLAN.md header): every course registered here is in the pool, and
 * events draw from it under the slot constraints carried below as data. A
 * future course ships with its measured difficulty tier and fieldShift and
 * simply registers — nothing else changes.
 *
 * The measured ladder (coursecheck, mixed policy, full round vs par):
 *   Rockdale Muni  −1.65 · Pine Hollow +0.71 · Cottonwood +1.77 ·
 *   Salt Flats +3.02
 * Deltas vs Pine Hollow, the anchor: Rockdale −2.4, Cottonwood +1.1,
 * Salt Flats +2.3 strokes per round.
 */
import type { HoleSpec } from '../../sim/types'
import { PINE_HOLLOW } from './pinehollow'
import { COTTONWOOD } from './cottonwood'
import { ROCKDALE_MUNI } from './rockdale'
import { SALT_FLATS } from './saltflats'

export type CourseId = 'pinehollow' | 'cottonwood' | 'rockdale' | 'saltflats'

/**
 * Slot tiers, as data (SCHEDULE-PLAN.md §2 shape):
 * - the season OPENER draws from the 'gentle' tier — the forgiving spring the
 *   intro screen promises;
 * - Money List CHECK weeks avoid the 'brutal' tier — a check should be about
 *   conversion, not survival of a gauntlet.
 */
export type CourseTier = 'gentle' | 'standard' | 'brutal'

export interface Course {
  readonly id: CourseId
  /** what the UI prints — "Pine Hollow" */
  readonly label: string
  readonly holes: readonly HoleSpec[]
  /** reduce over holes, computed once here */
  readonly par: number
  /**
   * Strokes per round the FIELD's scoring moves at this course — the bias
   * offset advanceField subtracts (SCHEDULE-PLAN.md §3). Positive = the field
   * scores worse here, exactly as the player does. The plan's starting values
   * were linearizations (offset = targetΔ / 8 holes / 1.9); per house law the
   * shipped numbers are MEASURED, by tools/fieldcheck.ts (2000 fields/cell,
   * floorLift 0.15): the field's per-round delta vs Pine Hollow matches the
   * player's measured delta within ±0.1 strokes —
   *   Rockdale  −0.186 → −2.40 measured (target −2.4; plan's −0.155 gave −1.99)
   *   Cottonwood 0.070 → +1.04 measured (target +1.1)
   *   Salt Flats 0.145 → +2.31 measured (target +2.3; plan's 0.152 gave +2.45)
   * Without this a hard course is a relative FINE on the player, not
   * difficulty.
   */
  readonly fieldShift: number
  readonly tier: CourseTier
  /** may host a major */
  readonly majorCapable: boolean
  /** ONLY majors may draw it — Salt Flats's "majors only" doctrine, its own header */
  readonly majorsOnly: boolean
}

function course(
  id: CourseId, label: string, holes: readonly HoleSpec[], fieldShift: number,
  tier: CourseTier, majorCapable: boolean, majorsOnly: boolean,
): Course {
  return {
    id, label, holes, par: holes.reduce((a, h) => a + h.par, 0),
    fieldShift, tier, majorCapable, majorsOnly,
  }
}

export const COURSES: Record<CourseId, Course> = {
  pinehollow: course('pinehollow', 'Pine Hollow', PINE_HOLLOW, 0, 'standard', true, false),
  cottonwood: course('cottonwood', 'Cottonwood', COTTONWOOD, 0.070, 'standard', true, false),
  rockdale: course('rockdale', 'Rockdale Muni', ROCKDALE_MUNI, -0.186, 'gentle', false, false),
  saltflats: course('saltflats', 'Salt Flats', SALT_FLATS, 0.145, 'brutal', true, true),
}

/**
 * The pool, in a FIXED order — the schedule draw indexes into this, so the
 * order is part of determinism. Append new courses at the end; never reorder.
 */
export const COURSE_POOL: readonly CourseId[] =
  ['pinehollow', 'cottonwood', 'rockdale', 'saltflats']
