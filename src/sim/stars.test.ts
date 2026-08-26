/**
 * THE MARQUEE RAMP (FIELD-CEILING.md §5–6) — the stars, locked down.
 *
 * The load-bearing promise is the SPRING RULE: through event 4 the stars are
 * names painted on the top skill draws and nothing else — eliteEdge is 0 by
 * construction, so events 1–4 replay DIGIT-IDENTICAL to the pre-stars world.
 * The snapshot below was captured from the live code BEFORE the overlay
 * existed (26 Aug 2026, seeds 424242 / 13371337): if these digits ever move,
 * either advanceField changed (bump SAVE_VERSION) or the overlay leaked into
 * spring (a bug, full stop).
 */
import { describe, expect, test } from 'vitest'
import { COURSES } from '../content/courses'
import { SEASON } from '../content/season'
import {
  FIELD_SIZE, LAST, STARS, STAR_BAND_CAP, STAR_COUNT, STAR_RAMP_END,
} from '../content/players'
import { scheduleFor } from './schedule'
import { seedBank } from './rng'
import { initialState, trailingPace } from './state'
import { reduce } from './reducer'
import {
  advanceField, makeField, overlayStars, standings, starNamesFor, starTarget,
  type FieldPlayer,
} from './resolve/field'

/** The game's field pipeline for one event: draw, (maybe) overlay, 8 holes. */
function playEvent(
  bank: ReturnType<typeof seedBank>, seed: number, ei: number, stars: boolean,
): { totals: number[]; names: string[]; bank: ReturnType<typeof seedBank> } {
  const ev = SEASON[ei]!
  const course = COURSES[scheduleFor(seed)[ei]!]
  let [field, r] = makeField(bank.field, ev.fieldStrength)
  bank = { ...bank, field: r }
  if (stars) field = overlayStars(field, starNamesFor(seed), starTarget(ev.num, 0))
  for (const hole of course.holes) {
    const [f2, r2] = advanceField(field, hole.par, bank.field, course.fieldShift)
    field = f2; bank = { ...bank, field: r2 }
  }
  return { totals: field.map(p => p.total), names: field.map(p => p.name), bank }
}

/** Captured 26 Aug 2026 from the pre-stars build — see file header. */
const PRE_STARS = {
  424242: [
    { sum: -52, min: -4, max: 2, first8: [-2, -3, 0, 1, 1, 0, -1, -3] },
    { sum: 76, min: -3, max: 7, first8: [-1, 7, -1, 5, 1, 1, 0, 0] },
    { sum: 58, min: -4, max: 5, first8: [3, 3, 0, 1, -1, 3, 0, 0] },
    { sum: 25, min: -3, max: 5, first8: [-2, -1, -2, 2, -1, 0, 0, 2] },
  ],
  13371337: [
    { sum: -161, min: -6, max: 2, first8: [-1, 0, -3, -3, -6, 0, -1, 1] },
    { sum: 78, min: -4, max: 5, first8: [4, 0, 3, 2, 1, 1, 0, -1] },
    { sum: 16, min: -3, max: 6, first8: [-1, 1, 0, -2, 0, 0, 1, -1] },
    { sum: 50, min: -3, max: 5, first8: [3, 1, 2, -2, 2, -2, -2, 5] },
  ],
} as const

describe('the spring rule — events 1–4 are digit-identical with stars present', () => {
  for (const seed of [424242, 13371337] as const) {
    test(`seed ${seed}: scoring digits match the pre-stars capture, stars on`, () => {
      let bank = seedBank(seed)
      for (let ei = 0; ei < 4; ei++) {
        const { totals, names, bank: b2 } = playEvent(bank, seed, ei, true)
        bank = b2
        const snap = PRE_STARS[seed][ei]!
        expect(totals.reduce((a, b) => a + b, 0)).toBe(snap.sum)
        expect(Math.min(...totals)).toBe(snap.min)
        expect(Math.max(...totals)).toBe(snap.max)
        expect(totals.slice(0, 8)).toEqual([...snap.first8])
        // and the names ARE painted — spring is names-only, not stars-off
        const starNames = starNamesFor(seed)
        expect(starNames.every(n => names.includes(n))).toBe(true)
      }
    })
  }

  test('overlaid and bare fields agree stroke for stroke through event 4', () => {
    for (const seed of [11, 909090, 20260826]) {
      let a = seedBank(seed)
      let b = seedBank(seed)
      for (let ei = 0; ei < 4; ei++) {
        const on = playEvent(a, seed, ei, true)
        const off = playEvent(b, seed, ei, false)
        a = on.bank; b = off.bank
        expect(on.totals).toEqual(off.totals)
      }
    }
  })
})

describe('the roster', () => {
  test('one shot per run: same seed same stars, in the same pecking order', () => {
    expect(starNamesFor(4242)).toEqual(starNamesFor(4242))
    expect(starNamesFor(4242).length).toBe(STAR_COUNT)
    const canon = new Set(STARS.map(s => s.name))
    expect(starNamesFor(4242).every(n => canon.has(n))).toBe(true)
  })

  test('star surnames cannot collide with a generated field name', () => {
    const lasts = new Set<string>(LAST)
    for (const s of STARS) {
      expect(lasts.has(s.name.split(' ').pop()!)).toBe(false)
    }
  })

  test('the overlay renames the top draws in place — order untouched', () => {
    const [field] = makeField(seedBank(7).field, 0)
    const names = starNamesFor(7)
    const out = overlayStars(field, names, 1.4)
    expect(out.length).toBe(FIELD_SIZE)
    // non-star entries are the same objects in the same slots
    out.forEach((p, i) => { if (!p.star) expect(p).toBe(field[i]) })
    // the k highest skills wear the star names, best draw first
    const bySkill = [...field].sort((x, y) => y.skill - x.skill)
    names.forEach((n, rank) => {
      const at = out.findIndex(p => p.name === n)
      expect(out[at]!.skill).toBe(bySkill[rank]!.skill)
      expect(out[at]!.star).toBe(true)
    })
    // the edge lifts to the target, floored at the player's own draw
    for (const p of out) {
      if (p.star) expect(p.eliteEdge).toBeCloseTo(Math.max(0, 1.4 - p.skill) * 0.42, 10)
      else expect(p.eliteEdge).toBeUndefined()
    }
  })
})

describe('starTarget — the ramp and the band', () => {
  test('spring is quiet no matter how hot the player is', () => {
    for (const ev of [1, 2, 3, 4]) {
      expect(starTarget(ev, 0)).toBe(0)
      expect(starTarget(ev, -12)).toBe(0)
    }
    expect(starTarget(5, 0)).toBeGreaterThan(0)
  })

  test('the ramp is the season story: rises to R at the finale, pace or none', () => {
    let prev = 0
    for (let ev = 5; ev <= 14; ev++) {
      const t = starTarget(ev, 0)
      expect(t).toBeGreaterThan(prev)
      prev = t
    }
    expect(starTarget(14, 0)).toBeCloseTo(STAR_RAMP_END, 10)
  })

  test('the band is bounded, upward-only, and relaxes for a collapsing player', () => {
    const ramp = starTarget(10, 0)
    // never below the stage baseline, whatever the trailing pace does
    expect(starTarget(10, +6)).toBeCloseTo(ramp, 10)
    expect(starTarget(10, -2)).toBeGreaterThanOrEqual(ramp)
    // monotone in pace, capped at CAP above the ramp
    expect(starTarget(10, -8)).toBeGreaterThanOrEqual(starTarget(10, -4))
    expect(starTarget(10, -40)).toBeCloseTo(ramp + STAR_BAND_CAP, 10)
    // an ordinary player (pace ~0) never wakes the band at all
    expect(starTarget(12, -1)).toBeCloseTo(starTarget(12, 0), 10)
  })
})

describe('the stars in the run itself', () => {
  test('event 1 deals the field with the run’s stars painted on, edge 0', () => {
    const s = reduce(reduce(initialState(808), { type: 'START' }), { type: 'NEXT' })
    const names = starNamesFor(808)
    const painted = s.field.filter(p => p.star === true)
    expect(painted.map(p => p.name).sort()).toEqual([...names].sort())
    expect(painted.every(p => p.eliteEdge === 0)).toBe(true)
    // and the board knows them
    const rows = standings(s.field, 0, 0, false)
    expect(rows.filter(r => r.star).length).toBe(names.length)
  })

  test('the trailing window is lagged and three deep', () => {
    expect(trailingPace({ recentCutRels: [] })).toBe(0)
    expect(trailingPace({ recentCutRels: [-9, -6, -12] })).toBe(-9)
    const s = initialState(1)
    expect(s.recentCutRels).toEqual([])
  })

  test('a field saved before the stars existed still advances (no eliteEdge)', () => {
    const legacy: FieldPlayer[] = [
      { name: 'A', skill: 0.5, total: 0, thru: 0, cut: false },
    ]
    const [out] = advanceField(legacy, 4, seedBank(3).field)
    expect(out[0]!.thru).toBe(1)
  })
})
