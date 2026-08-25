/**
 * Does the field feel the course the way the player does?
 *
 * SCHEDULE-PLAN.md §3.3: each course's fieldShift must move the FIELD's
 * per-round mean by the same amount the course moves the PLAYER —
 *   Rockdale −2.4 · Cottonwood +1.1 · Salt Flats +2.3  (vs Pine Hollow)
 * or relative standing is not preserved and the course is a fine, not
 * difficulty. The registry's numbers started as linearizations
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
 * SCHEDULE-PLAN.md §3.3's targets — the player deltas as the plan's ladder
 * measured them (REVIEW-5/6 era). CAVEAT, found while shipping slice 3: the
 * courses moved after the plan was written (v7 / CHANGES-6 unrigged the
 * harness hands and rebuilt Salt Flats 6), and coursecheck TODAY measures the
 * player ladder at PH +1.23 · CW +0.95 · RD −1.42 · SF +1.92 — deltas vs PH
 * of CW −0.3, RD −2.65, SF +0.7, stable across sharpness ×0.9–×1.4. If the
 * owner re-anchors coupling to the LIVE ladder (parity is the plan's stated
 * principle), retarget here and re-sweep; the slice-4 threshold re-derivation
 * should decide which ladder is canon first.
 */
const TARGET: Record<string, number> = {
  pinehollow: 0, cottonwood: 1.1, rockdale: -2.4, saltflats: 2.3,
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
