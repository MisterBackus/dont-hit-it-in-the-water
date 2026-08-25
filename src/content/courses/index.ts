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
 *
 * BATCH 2 ladder (CHANGES-7, depth engine, N=400 — note the whole ladder
 * re-based when the planners learned to read depth; the four numbers above
 * are the plan-era anchors their fieldShifts still target):
 *   Rockdale −1.94 · Palmetto −1.64 · Meadowlark −0.60 · Driftwood −0.59 ·
 *   Foxglove −0.27 · Bracken Ridge +0.29 · Cottonwood +0.46 ·
 *   Rivermouth +0.67 · Pine Hollow +0.81 · Salt Flats +1.19
 */
import type { HoleSpec } from '../../sim/types'
import { PINE_HOLLOW } from './pinehollow'
import { COTTONWOOD } from './cottonwood'
import { ROCKDALE_MUNI } from './rockdale'
import { SALT_FLATS } from './saltflats'
import { PALMETTO } from './palmetto'
import { MEADOWLARK } from './meadowlark'
import { DRIFTWOOD } from './driftwood'
import { FOXGLOVE } from './foxglove'
import { BRACKEN_RIDGE } from './brackenridge'
import { RIVERMOUTH } from './rivermouth'

export type CourseId =
  | 'pinehollow' | 'cottonwood' | 'rockdale' | 'saltflats'
  | 'palmetto' | 'meadowlark' | 'driftwood' | 'foxglove'
  | 'brackenridge' | 'rivermouth'

/**
 * Slot tiers, as data (SCHEDULE-PLAN.md §2 shape):
 * - the season OPENER draws from the 'gentle' tier — the forgiving spring the
 *   intro screen promises;
 * - Money List CHECK weeks avoid the 'brutal' tier — a check should be about
 *   conversion, not survival of a gauntlet.
 *
 * The tier is SLOT DATA, not a difficulty grade. 'brutal' means exactly one
 * thing to the schedule — "check weeks avoid me" — which is why Foxglove
 * (mid difficulty, but its identity is the focus economy and a check week
 * should never be decided by an experiment in technique pricing) registers
 * as 'brutal' alongside the genuinely cruel Bracken Ridge and Salt Flats.
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
  /**
   * BATCH 2 (COURSE-SLATE.md, built under the depth engine — CHANGES-7).
   * fieldShift values are MEASURED, not linearized: coursecheck (N=400,
   * mixed) gives each course's player delta vs Pine Hollow, and
   * tools/fieldcheck.ts sweeps the offset until the FIELD moves the same
   * amount (±0.1). The slate's Δ/8/1.9 starting guesses are recorded in
   * CHANGES-7 next to what the sweep actually chose.
   */
  palmetto: course('palmetto', 'Palmetto', PALMETTO, -0.182, 'gentle', false, false),
  meadowlark: course('meadowlark', 'Meadowlark', MEADOWLARK, -0.114, 'gentle', false, false),
  driftwood: course('driftwood', 'Driftwood', DRIFTWOOD, -0.099, 'standard', false, false),
  foxglove: course('foxglove', 'Foxglove', FOXGLOVE, -0.078, 'brutal', false, false),
  brackenridge: course('brackenridge', 'Bracken Ridge', BRACKEN_RIDGE, -0.034, 'brutal', true, false),
  rivermouth: course('rivermouth', 'Rivermouth', RIVERMOUTH, -0.009, 'standard', false, false),
}

/**
 * The pool, in a FIXED order — the schedule draw indexes into this, so the
 * order is part of determinism. Append new courses at the end; never reorder.
 * Batch 2 appended in the slate's build order.
 */
export const COURSE_POOL: readonly CourseId[] = [
  'pinehollow', 'cottonwood', 'rockdale', 'saltflats',
  'palmetto', 'meadowlark', 'driftwood', 'foxglove', 'brackenridge', 'rivermouth',
]
