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
 * THE CANON LADDER (ruling, slice 4, 25 Aug 2026: the live post-depth
 * coursecheck ladder is canon — the newest honest measurement wins; the
 * plan-era four-course ladder is history). coursecheck, N=400, mixed policy,
 * full round vs par, depth engine (COURSE-REVIEW-7 re-baseline — Bracken
 * Ridge v4 and Salt Flats 6 v9 — plus Palmetto's hole-2 rebuild, the one
 * mover since: COURSE-CHANGES-8 §2, −1.64 → −1.15):
 *   Rockdale −1.94 · Palmetto −1.15 · Meadowlark −0.60 · Driftwood −0.59 ·
 *   Foxglove −0.27 · Cottonwood +0.46 · Bracken Ridge +0.55 ·
 *   Rivermouth +0.67 · Pine Hollow +0.81 · Salt Flats +1.26
 * Deltas vs Pine Hollow, the anchor: RD −2.75 · PAL −1.96 · MEA −1.41 ·
 * DRI −1.40 · FOX −1.08 · CW −0.35 · BR −0.26 · RIV −0.14 · SF +0.45.
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
   * scores worse here, exactly as the player does. Starting values are
   * linearizations (offset = targetΔ / 8 holes / 1.9); per house law the
   * shipped numbers are MEASURED, by tools/fieldcheck.ts (2000 fields/cell,
   * floorLift 0.15), against the CANON ladder's player deltas (header above).
   * RETARGETED at slice 4 when the canon-ladder ruling landed — the original
   * four had still been coupling to the plan-era ladder:
   *   Cottonwood  0.070 → −0.023  (field Δ −0.33, target −0.35)
   *   Rockdale   −0.186 → −0.212  (field Δ −2.76, target −2.75)
   *   Salt Flats  0.145 →  0.025  (field Δ +0.36, target +0.38)
   * All ten courses measure within ±0.1 of their target under the ruling.
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
  cottonwood: course('cottonwood', 'Cottonwood', COTTONWOOD, -0.023, 'standard', true, false),
  rockdale: course('rockdale', 'Rockdale Muni', ROCKDALE_MUNI, -0.212, 'gentle', false, false),
  saltflats: course('saltflats', 'Salt Flats', SALT_FLATS, 0.025, 'brutal', true, true),
  /**
   * BATCH 2 (COURSE-SLATE.md, built under the depth engine — CHANGES-7).
   * fieldShift values are MEASURED, not linearized: coursecheck (N=400,
   * mixed) gives each course's player delta vs Pine Hollow, and
   * tools/fieldcheck.ts sweeps the offset until the FIELD moves the same
   * amount (±0.1). The slate's Δ/8/1.9 starting guesses are recorded in
   * CHANGES-7 next to what the sweep actually chose.
   *
   * Palmetto RE-DERIVED at the calibration pass (CALIBRATION-2.md §4): the
   * hole-2 rebuild (COURSE-CHANGES-8) moved the course −1.64 → −1.15, so
   * the old −0.182 (coupled to target Δ −2.45) was making the FIELD half a
   * stroke tougher there than the course now is. fieldcheck sweep against
   * the live target Δ −1.96: −0.145 measures field Δ −1.99. The other nine
   * confirmed within ±0.1 untouched, as FIELD-CEILING §7.4 predicted (the
   * star tier is course-blind and never moved the median).
   */
  palmetto: course('palmetto', 'Palmetto', PALMETTO, -0.145, 'gentle', false, false),
  meadowlark: course('meadowlark', 'Meadowlark', MEADOWLARK, -0.114, 'gentle', false, false),
  driftwood: course('driftwood', 'Driftwood', DRIFTWOOD, -0.099, 'standard', false, false),
  foxglove: course('foxglove', 'Foxglove', FOXGLOVE, -0.078, 'brutal', false, false),
  /**
   * REVIEW-7 RULING: ruled UNDER-WEIGHT for this flag; the strip is
   * blocked by the world. The docket's bar was "clearly harder than
   * Cottonwood (+0.46)"; after two REVIEW-7 hardening passes (fern
   * promoted to the aim band on 1/4/8 — the slate's fallback, fully spent
   * — plus the Stand lengthened) Bracken measures +0.55 at N=400, +0.51
   * at N=800, a 0.05 separation. Four passes across two designers agree
   * corridor pricing cannot charge the mean-optimizer. The structure IS
   * major-grade (4 REAL, the pool's largest timidity tax); the strokes
   * are not. The review ordered the flag stripped — and schedule.test
   * pins "majors draw major-capable courses" across every season while
   * THE PGA (event 11) pins here, so clearing this bit breaks a sim
   * invariant in files outside course-data fences. The bit therefore
   * stays SET on the pin's credit, not the course's. Owner decision
   * named in COURSE-REVIEW-7 §3.3; earn-back pre-registered there:
   * ≥ +0.75 at N=800 with ≥ 3 REAL and the front-four bar, by a
   * mechanism that is not more corridor. fieldShift re-measured for the
   * new mean (fieldcheck sweep, target −0.26): −0.034 → −0.018.
   */
  // major-capable STRIPPED per COURSE-REVIEW-7 and the owner's ruling
  // (26 Aug 2026): +0.51 at N=800 after two hardening passes, against a
  // +0.75 earn-back bar. THE PGA un-pinned and hosted by real major weight;
  // the Bracken Ridge Classic (event 8) still plays here. The flag returns
  // when a designer clears the bar — it is something to earn, not to keep.
  brackenridge: course('brackenridge', 'Bracken Ridge', BRACKEN_RIDGE, -0.018, 'brutal', false, false),
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
