/**
 * Does the field feel the course the way the player does?
 *
 * SCHEDULE-PLAN.md §3.3: each course's fieldShift must move the FIELD's
 * per-round mean by the same amount the course moves the PLAYER, or relative
 * standing is not preserved and the course is a fine, not difficulty. The
 * targets are the CANON (live, post-depth) player ladder — see TARGET below
 * for the ruling. The registry's numbers started as linearizations
 * (offset = targetΔ/8/1.9); per house law they are confirmed here by
 * instrument: this prints the measured field delta per course and a sweep
 * around each offset so the registry can be corrected within ±0.1 strokes.
 *
 * Run: npx tsx src/tools/fieldcheck.ts     (N=2000, F=0.15 by default)
 */
import { COURSES, COURSE_POOL } from '../content/courses'
import { makeField, advanceField } from '../sim/resolve/field'
import { makeRng, type RngState } from '../sim/rng'

const N = Number(process.env.N ?? 2000)
/** field response floor lift — 0 spring, 0.30 finale; default mid-season */
const F = Number(process.env.F ?? 0.15)

/** Mean eight-hole field total (vs par) at a course under a given offset. */
function fieldMean(pars: readonly number[], offset: number): number {
  let rng: RngState = makeRng(987654321)
  let sum = 0
  let count = 0
  for (let k = 0; k < N; k++) {
    let [field, r] = makeField(rng, F)
    rng = r
    for (const par of pars) {
      const [f2, r2] = advanceField(field, par, rng, offset)
      field = f2
      rng = r2
    }
    for (const p of field) { sum += p.total; count++ }
  }
  return sum / count
}

const parsOf = (id: keyof typeof COURSES) => COURSES[id].holes.map(h => h.par)
/**
 * CANON LADDER RULING (slice 4, 25 Aug 2026): the live post-depth coursecheck
 * ladder is canon — the newest honest measurement wins. The plan-era targets
 * the original four carried (CW +1.1, RD −2.4, SF +2.3, REVIEW-5/6 era) were
 * measured against courses and planners that no longer exist; the standing
 * caveat that used to live here is settled. ALL targets below are the live
 * measured player deltas vs Pine Hollow from the ten-course coursecheck
 * record (N=400, mixed, depth engine — CHANGES-7 §10, re-measured verbatim
 * for the ruling): PH +0.81 · CW +0.46 · RD −1.94 · SF +1.19 · PAL −1.64 ·
 * MEA −0.60 · DRI −0.59 · FOX −0.27 · BR +0.29 · RIV +0.67.
 */
const TARGET: Record<string, number> = {
  pinehollow: 0, cottonwood: -0.35, rockdale: -2.75, saltflats: 0.38,
  palmetto: -2.45, meadowlark: -1.41, driftwood: -1.40,
  foxglove: -1.08, brackenridge: -0.52, rivermouth: -0.14,
}

const base = fieldMean(parsOf('pinehollow'), 0)
console.log(`\nFIELD COUPLING · ${N} fields per cell · floorLift ${F}`)
console.log(`  Pine Hollow baseline: field mean ${base.toFixed(2)} over 8 holes\n`)
console.log('  course        offset    field mean   Δ vs PH   target    miss')
console.log('  ' + '-'.repeat(64))
for (const id of COURSE_POOL) {
  const c = COURSES[id]
  const m = fieldMean(parsOf(id), c.fieldShift)
  const d = m - base
  const t = TARGET[id]!
  console.log(
    `  ${c.label.padEnd(13)} ${c.fieldShift.toFixed(3).padStart(6)}   ` +
    `${m.toFixed(2).padStart(9)} ${d.toFixed(2).padStart(9)} ${t.toFixed(1).padStart(8)}` +
    `   ${Math.abs(d - t) <= 0.1 ? 'ok' : (d - t).toFixed(2)}`,
  )
}

console.log('\n  SWEEP · offset → Δ vs Pine Hollow (pick the row nearest the target)')
for (const id of COURSE_POOL) {
  if (id === 'pinehollow') continue
  const c = COURSES[id]
  const rows: string[] = []
  for (let k = -3; k <= 3; k++) {
    const off = Math.round((c.fieldShift + k * 0.007) * 1000) / 1000
    const d = fieldMean(parsOf(id), off) - base
    rows.push(`${off.toFixed(3)}→${d.toFixed(2)}${k === 0 ? '*' : ''}`)
  }
  console.log(`  ${c.label.padEnd(13)} target ${TARGET[id]!.toFixed(1).padStart(5)}   ${rows.join('  ')}`)
}
console.log()
