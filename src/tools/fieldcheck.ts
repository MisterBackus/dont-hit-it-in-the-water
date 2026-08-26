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
  FIELD_EXT_SALT, FULL_HOLES, PLAYER_EXT_SALT, makeField, advanceField,
  extendFieldWith, extendPlayerRelWith, overlayStars, rankCut, starTarget,
  type StarDials,
} from '../sim/resolve/field'
import { SEASON, payout } from '../content/season'
import { hash, makeRng, type RngState } from '../sim/rng'
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
 * record (N=400, mixed, depth engine), as of CALIBRATION-2.md:
 * PH +0.81 · CW +0.46 · RD −1.94 · SF +1.26 · PAL −1.15 · MEA −0.60 ·
 * DRI −0.59 · FOX −0.27 · BR +0.55 · RIV +0.67. Three rows moved since the
 * CHANGES-7 §10 record this table was first typed from: BR and SF at the
 * COURSE-REVIEW-7 re-baseline (+0.29 → +0.55, +1.19 → +1.26 — the registry
 * header had them, this table had gone stale), and PAL at the hole-2 rebuild
 * (COURSE-CHANGES-8 §3.1: −1.64 → −1.15, so target Δ −2.45 → −1.96).
 */
const TARGET: Record<string, number> = {
  pinehollow: 0, cottonwood: -0.35, rockdale: -2.75, saltflats: 0.45,
  palmetto: -1.96, meadowlark: -1.41, driftwood: -1.40,
  foxglove: -1.08, brackenridge: -0.26, rivermouth: -0.14,
}

// WINNERGAP=only skips the coupling table and its sweep — sweep A's loop
// only needs the winner-gap section below. TIES=only skips everything but
// the ties probe (sweep C's loop).
if (process.env.WINNERGAP !== 'only' && process.env.TIES !== 'only') {

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
if (process.env.TIES !== 'only') {
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

/* ------------------------------------------------------------------ *
 * THE TIES PROBE (FIELD-SPREAD.md §3, promoted — house law: no number
 * ships from a scratchpad). Group structure, distinct totals, the
 * solo|win grid and the purse subsidy of THE FULL SCORECARD, at EXT
 * extension holes beyond the real 8 (0 = the pre-spread world; the
 * default is the shipped 28 — a 36-hole week). Methodology exactly as
 * registered there: live makeField/overlayStars/advanceField, Pine
 * Hollow pars, no courseShift, seed 13371337; star targets from the
 * live starTarget; the extension rolls per trial through the SHIPPED
 * functions (extendFieldWith / extendPlayerRelWith — the fitted-bias
 * remainder, never a scaled one; §6's trap stays fenced).
 *
 * Knobs: EXT holes beyond 8 · TN fields per stage (default 2000) ·
 * TIES=only runs just this section (sweep C's loop).
 * ------------------------------------------------------------------ */
{
  const EXT = Number(process.env.EXT ?? FULL_HOLES - 8)
  const TN = Number(process.env.TN ?? 2000)
  const pars = parsOf('pinehollow')
  const to = pars.length + EXT
  const PURSE = 9_000_000

  interface Stage {
    readonly label: string
    readonly F: number
    readonly k: number
    readonly target: number
    readonly adv: number
    /** the solo|win grid's rel-8 paces, when this stage prints one */
    readonly paces: readonly number[]
  }
  const stages: Stage[] = [
    {
      label: 'ev1   F=0    no stars ', F: SEASON[0]!.fieldStrength, k: 0,
      target: 0, adv: SEASON[0]!.advance, paces: [-1, -2, -3, -4],
    },
    {
      label: `ev8   F=.16  stars@${starTarget(8, 0).toFixed(2)}`,
      F: SEASON[7]!.fieldStrength, k: STAR_COUNT,
      target: starTarget(8, 0), adv: SEASON[7]!.advance, paces: [],
    },
    {
      label: `ev14  F=.30  stars@${starTarget(14, 0).toFixed(2)}`,
      F: SEASON[13]!.fieldStrength, k: STAR_COUNT,
      target: starTarget(14, 0), adv: SEASON[13]!.advance,
      paces: [-4, -5, -6, -7, -8],
    },
  ]

  console.log(`\nTHE TIES PROBE · EXT ${EXT} (${to}-hole week) · ${TN} fields per stage` +
    ' · Pine Hollow pars · seed 13371337')
  console.log('  stage                        winner group        distinct  med-fin      thru-4        purse')
  console.log('                               med  mean  solo%     totals   grp  max    line   adv     subsidy')
  console.log('  ' + '-'.repeat(100))

  for (const st of stages) {
    let rng: RngState = makeRng(13371337)
    const names = STARS.slice(0, st.k).map(s => s.name)
    const winGroup: number[] = []
    let winSolo = 0
    const distinct: number[] = []
    const medGroup: number[] = []
    let maxGroup = 0
    let lineSum = 0
    let advSum = 0
    let liveCost = 0    // the top-only rule's total payout
    let uniqueCost = 0  // unique places (= the full split, which conserves)
    const wins = st.paces.map(() => 0)
    const solos = st.paces.map(() => 0)

    for (let t = 0; t < TN; t++) {
      let [field, r] = makeField(rng, st.F)
      rng = r
      if (st.k > 0) field = overlayStars(field, names, st.target)
      for (let h = 0; h < 4; h++) {
        const [f2, r2] = advanceField(field, pars[h]!, rng, 0)
        field = f2; rng = r2
      }
      // the cut, exactly as the game judges it (you parked far below it)
      const cut = rankCut(field, 999, st.adv)
      field = cut.field
      lineSum += cut.line
      advSum += cut.advanced       // your +999 never advances
      for (let h = 4; h < pars.length; h++) {
        const [f2, r2] = advanceField(field, pars[h]!, rng, 0)
        field = f2; rng = r2
      }
      if (EXT > 0) {
        // one-shot derived stream per trial, exactly the game's construction
        // (salt 10) — the main stream's consumption is EXT-invariant, so the
        // thru-4 line and overflow print IDENTICAL DIGITS in every EXT row
        const [f2] = extendFieldWith(field, pars,
          makeRng(hash(t + 1, FIELD_EXT_SALT)), 0, to)
        field = f2
      }
      const totals = field.filter(p => !p.cut).map(p => p.total).sort((a, b) => a - b)
      // group structure of the final board
      const groups = new Map<number, number>()
      for (const v of totals) groups.set(v, (groups.get(v) ?? 0) + 1)
      const best = totals[0]!
      const wg = groups.get(best)!
      winGroup.push(wg)
      if (wg === 1) winSolo++
      distinct.push(groups.size)
      medGroup.push(groups.get(totals[Math.floor(totals.length / 2)]!)!)
      maxGroup = Math.max(maxGroup, ...groups.values())
      // the purse, under the top-only rule vs unique places (the full
      // split pays exactly the unique total, by construction of the mean)
      let place = 1
      for (const [, k] of [...groups.entries()].sort((a, b) => a[0] - b[0])) {
        if (place === 1) {
          // a tied win pools the covered cheques: total cost = their sum
          for (let i = 0; i < k; i++) liveCost += payout(PURSE, 1 + i)
        } else {
          // every other tied group takes the best place's FULL cheque, each
          liveCost += k * payout(PURSE, place)
        }
        place += k
      }
      for (let n = 0; n < totals.length; n++) uniqueCost += payout(PURSE, n + 1)
      // solo|win grid — the shipped fitted-bias remainder, rolled per
      // trial from its own derived stream (salt 11), main stream untouched
      st.paces.forEach((p, i) => {
        let me = p
        if (EXT > 0) {
          me = extendPlayerRelWith(p, pars.length, pars,
            makeRng(hash(t * 16 + i + 1, PLAYER_EXT_SALT)), 0, to)[0]
        }
        if (me <= best) {
          wins[i]!++
          if (me < best) solos[i]!++
        }
      })
    }

    const med = (v: number[]) => [...v].sort((a, b) => a - b)[Math.floor(v.length / 2)]!
    const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length
    console.log(
      `  ${st.label.padEnd(26)}  ${String(med(winGroup)).padStart(3)}` +
      ` ${mean(winGroup).toFixed(2).padStart(5)} ${(winSolo / TN * 100).toFixed(0).padStart(4)}%` +
      `  ${med(distinct).toString().padStart(7)}   ${String(med(medGroup)).padStart(4)} ${String(maxGroup).padStart(4)}` +
      `  ${(lineSum / TN).toFixed(2).padStart(6)} ${(advSum / TN).toFixed(1).padStart(6)}` +
      `  ${((liveCost / uniqueCost - 1) * 100).toFixed(0).padStart(5)}%`,
    )
    if (st.paces.length > 0) {
      console.log(
        '        solo|win by rel-8: ' +
        st.paces.map((p, i) => `${p}: ${wins[i]! > 0
          ? (solos[i]! / wins[i]! * 100).toFixed(0) : '--'}%`).join('  ') +
        '   (win%: ' + st.paces.map((_, i) =>
          `${(wins[i]! / TN * 100).toFixed(0)}%`).join(' ') + ')',
      )
    }
  }
  console.log()
}
