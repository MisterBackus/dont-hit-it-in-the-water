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
import {
  makeField, advanceField, overlayStars, starTarget, type StarDials,
} from '../sim/resolve/field'
import { makeRng, type RngState } from '../sim/rng'
import {
  STARS, STAR_BAND_BETA, STAR_BAND_CAP, STAR_COUNT, STAR_RAMP_END,
} from '../content/players'

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

// WINNERGAP=only skips the coupling table and its sweep — sweep A's loop
// only needs the winner-gap section below.
if (process.env.WINNERGAP !== 'only') {

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

}

/* ------------------------------------------------------------------ *
 * THE WINNER-GAP PROBE — the §2 table of FIELD-CEILING.md, promoted to a
 * permanent section (house law: no number ships from a scratchpad).
 * Methodology exactly as registered there: real makeField/advanceField,
 * Pine Hollow's par sequence, no courseShift, N = 3000 fields, seed
 * 13371337. The star rows overlay the top K draws at the marquee ramp's
 * effective-skill target (FIELD-CEILING.md §6) — call counts untouched.
 *
 * Knobs: WGN fields per row · K stars · RAMP finale ramp-equivalent ·
 * BETA/CAP band dials · PACE trailing player rel the band chases (0 =
 * ordinary player, band asleep) · GRID=1 prints the sweep-A K×RAMP grid ·
 * WINNERGAP=only skips the coupling sections above.
 * ------------------------------------------------------------------ */
{
  const WGN = Number(process.env.WGN ?? 3000)
  const K = Number(process.env.K ?? STAR_COUNT)
  const DIALS: StarDials = {
    ramp: Number(process.env.RAMP ?? STAR_RAMP_END),
    beta: Number(process.env.BETA ?? STAR_BAND_BETA),
    cap: Number(process.env.CAP ?? STAR_BAND_CAP),
  }
  const PACE = Number(process.env.PACE ?? 0)
  const pars = parsOf('pinehollow')

  function probe(F: number, k: number, target: number) {
    let rng: RngState = makeRng(13371337)
    const names = STARS.slice(0, k).map(s => s.name)
    const winners: number[] = []
    const medians: number[] = []
    for (let i = 0; i < WGN; i++) {
      let [field, r] = makeField(rng, F)
      rng = r
      if (k > 0) field = overlayStars(field, names, target)
      for (const par of pars) {
        const [f2, r2] = advanceField(field, par, rng, 0)
        field = f2
        rng = r2
      }
      const totals = field.map(p => p.total).sort((a, b) => a - b)
      winners.push(totals[0]!)
      medians.push(totals[Math.floor(totals.length / 2)]!)
    }
    const sorted = [...winners].sort((a, b) => a - b)
    const mean = winners.reduce((a, b) => a + b, 0) / WGN
    const at = (p: number) => sorted[Math.floor(WGN * p)]!
    const le = (v: number) => winners.filter(w => w <= v).length / WGN * 100
    const med = medians.reduce((a, b) => a + b, 0) / WGN
    return `${mean.toFixed(2).padStart(6)} ${String(at(.1)).padStart(5)} ` +
      `${String(at(.5)).padStart(5)} ${le(-6).toFixed(1).padStart(6)} ` +
      `${le(-8).toFixed(1).padStart(6)}   ${med.toFixed(2).padStart(7)}`
  }

  console.log(`\nWINNER GAP · ${WGN} fields per row · Pine Hollow pars · seed 13371337`)
  console.log('  winner of the 71 over 8 holes                 mean   p10   p50   %≤-6   %≤-8    field med')
  console.log('  ' + '-'.repeat(92))
  console.log(`  spring  F=0     no stars                    ${probe(0, 0, 0)}`)
  console.log(`  finale  F=.30   no stars                    ${probe(0.30, 0, 0)}`)
  const target = starTarget(14, PACE, DIALS)
  console.log(
    `  finale  F=.30   ${K} stars @${target.toFixed(2)} ` +
    `(R=${DIALS.ramp}, pace ${PACE})`.padEnd(28) +
    probe(0.30, K, target),
  )
  if (process.env.GRID === '1') {
    console.log('\n  SWEEP A GRID · ramp only (band asleep, pace 0)')
    for (const k of [3, 4]) {
      for (const ramp of [1.2, 1.4, 1.6]) {
        const t = starTarget(14, 0, { ...DIALS, ramp })
        console.log(`  finale  F=.30   ${k} stars @${t.toFixed(2)}              ${probe(0.30, k, t)}`)
      }
    }
  }
  console.log()
}
