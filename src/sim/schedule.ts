/**
 * WHERE EACH EVENT IS PLAYED — the pool assignment (SCHEDULE-PLAN.md).
 *
 * THE SCHEDULE IS A POOL MECHANISM, NOT A FIXED TABLE (owner decision, plan
 * header): events draw courses from the registered pool, per run, under slot
 * constraints carried as data —
 *   · named events PIN to their venue while the venue is in the pool
 *     (EventSpec.pin);
 *   · events sharing a hosting-fiction venue draw ONE course between them
 *     (EventSpec.venue — Bracken Ridge, events 8 and 11);
 *   · majors draw major-capable courses, and only majors may draw a
 *     majors-only course (Salt Flats's doctrine);
 *   · the season opener draws the gentle tier;
 *   · Money List check weeks avoid the brutal tier.
 * With today's four courses the result closely resembles the §2 table that
 * was the plan's validation target; with twenty courses it is a rotation.
 *
 * DETERMINISM. The draw is seeded from the run's seed through the same salted
 * hash the RNG bank uses, on its own salt (5) — a one-shot derived stream, so
 * assigning courses can never perturb the shot/putt/draw/field sequences.
 * Same seed, same schedule, always: saves and replays hold. Course data is
 * inert — no course may ever cause an extra RNG call in play (plan §5).
 */
import { COURSES, COURSE_POOL, type CourseId } from '../content/courses'
import { SEASON, checkAfter, type EventSpec } from '../content/season'
import { hash, makeRng, next, type RngState } from './rng'

/** The events stream's salt — seedBank owns 1–4 (shot/putt/draw/field). */
const EVENTS_SALT = 5

/** Slot constraints for one event, applied to the registered pool. */
function eligibleFor(ev: EventSpec, pool: readonly CourseId[]): CourseId[] {
  let ids = pool.filter(id =>
    ev.major ? COURSES[id].majorCapable : !COURSES[id].majorsOnly)
  if (ev.num === 1) ids = ids.filter(id => COURSES[id].tier === 'gentle')
  if (checkAfter(ev.num)) ids = ids.filter(id => COURSES[id].tier !== 'brutal')
  return ids
}

/** The per-run schedule: which course each of the season's events plays. */
export function assignCourses(seed: number): readonly CourseId[] {
  let r: RngState = makeRng(hash(seed, EVENTS_SALT))
  const pool = COURSE_POOL
  const out: CourseId[] = []
  /** one draw per hosting-fiction venue, shared by every event wearing it */
  const venuePick = new Map<string, CourseId>()

  const drawFrom = (elig: readonly CourseId[]): CourseId => {
    const [v, r2] = next(r)
    r = r2
    return elig[Math.floor(v * elig.length)] ?? 'pinehollow'
  }

  for (const ev of SEASON) {
    // 1 — a named event plays its venue while the venue is in the pool
    if (ev.pin && pool.includes(ev.pin)) { out.push(ev.pin); continue }

    // 2 — a shared venue was already drawn: same name, same course
    const shared = ev.venue ? venuePick.get(ev.venue) : undefined
    if (shared) { out.push(shared); continue }

    // 3 — the constraint set; a shared venue intersects EVERY wearer's
    //     constraints so the one course satisfies them all (the major at
    //     Bracken Ridge keeps the Classic off a majors-only course)
    let elig = eligibleFor(ev, pool)
    if (ev.venue) {
      const wearers = SEASON.filter(e => e.venue === ev.venue)
      const both = elig.filter(id =>
        wearers.every(e => eligibleFor(e, pool).includes(id)))
      if (both.length > 0) elig = both
    }
    // defensive ladders for thin future pools — never for today's four
    if (elig.length === 0) elig = pool.filter(id => !COURSES[id].majorsOnly)
    if (elig.length === 0) elig = [...pool]

    const pick = drawFrom(elig)
    out.push(pick)
    if (ev.venue) venuePick.set(ev.venue, pick)
  }
  return out
}

// The schedule is pure in the seed and read on every render — cache the last.
let cachedSeed: number | null = null
let cached: readonly CourseId[] = []

export function scheduleFor(seed: number): readonly CourseId[] {
  if (cachedSeed !== seed) {
    cached = assignCourses(seed)
    cachedSeed = seed
  }
  return cached
}

export function courseIdFor(seed: number, event: number): CourseId {
  return scheduleFor(seed)[event - 1] ?? 'pinehollow'
}

export function courseForEvent(seed: number, event: number) {
  return COURSES[courseIdFor(seed, event)]
}
