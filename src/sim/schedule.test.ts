/**
 * THE SCHEDULE IS A POOL MECHANISM (SCHEDULE-PLAN.md, owner decision).
 *
 * These tests pin the CONSTRAINT SHAPE, not a rotation table: any table these
 * constraints admit is a legal season, and the shape must hold across every
 * seed. Determinism gets its own suite — the schedule comes off a derived RNG
 * stream (salt 5) precisely so it can never perturb shot/putt/draw/field.
 */
import { describe, expect, test } from 'vitest'
import { assignCourses, scheduleFor } from './schedule'
import { COURSES, COURSE_POOL } from '../content/courses'
import { SEASON, MONEY_CHECKS } from '../content/season'
import { initialState, courseOf, currentHole } from './state'
import { reduce, handShots } from './reducer'
import { advanceField, makeField } from './resolve/field'
import { seedBank } from './rng'
import { toPin } from './geometry'
import { whyNotPlayable } from './effects'

const SEEDS = Array.from({ length: 400 }, (_, i) => 1000 + i * 7919)
const START_SEED = 20260824   // the game's boot seed (ui/App.tsx)

describe('the pool assignment honours its slot constraints, every seed', () => {
  test('every event plays a registered course, all fourteen assigned', () => {
    for (const seed of SEEDS) {
      const rota = assignCourses(seed)
      expect(rota.length).toBe(SEASON.length)
      for (const id of rota) expect(COURSE_POOL).toContain(id)
    }
  })

  test('named events pin to their venue — 2, 3, 4, 6, 7 never move', () => {
    for (const seed of [...SEEDS, START_SEED]) {
      const rota = assignCourses(seed)
      expect(rota[1]).toBe('pinehollow')   // Pine Hollow Classic
      expect(rota[2]).toBe('cottonwood')   // Cottonwood Invitational
      expect(rota[3]).toBe('pinehollow')   // THE MASTERS OF PINE HOLLOW
      expect(rota[5]).toBe('rockdale')     // The Muni Championship
      expect(rota[6]).toBe('saltflats')    // THE OPEN AT SALT FLATS
    }
  })

  test('the opener draws the gentle tier — the forgiving spring', () => {
    for (const seed of SEEDS) {
      expect(COURSES[assignCourses(seed)[0]!].tier).toBe('gentle')
    }
  })

  test('majors draw major-capable courses; only majors get a majors-only one', () => {
    for (const seed of SEEDS) {
      const rota = assignCourses(seed)
      SEASON.forEach((ev, i) => {
        const c = COURSES[rota[i]!]
        if (ev.major) expect(c.majorCapable, `event ${ev.num} (${seed})`).toBe(true)
        else expect(c.majorsOnly, `event ${ev.num} (${seed})`).toBe(false)
      })
    }
  })

  test('check weeks avoid the brutal tier — a check is about conversion', () => {
    for (const seed of SEEDS) {
      const rota = assignCourses(seed)
      for (const { after } of MONEY_CHECKS) {
        expect(COURSES[rota[after - 1]!].tier, `check after ${after} (${seed})`)
          .not.toBe('brutal')
      }
    }
  })

  test('a shared venue name means the same course — Bracken Ridge, 8 and 11', () => {
    for (const seed of SEEDS) {
      const rota = assignCourses(seed)
      expect(rota[7]).toBe(rota[10])
      // and the shared course satisfies BOTH wearers: 11 is a major, 8 is not
      const c = COURSES[rota[7]!]
      expect(c.majorCapable).toBe(true)
      expect(c.majorsOnly).toBe(false)
    }
  })

  test('the free slots actually rotate — this is a pool, not a table', () => {
    // Across many seeds the unpinned slots must not all collapse to one
    // course. The free list DERIVES from the pins so this test cannot rot
    // when a venue-named event gains a home (it did, when event 5 got its
    // Rivermouth) — and the season must always keep at least two free slots,
    // or the pool has quietly become a table again.
    const free = SEASON.filter(e => !e.pin && !e.venue).map(e => e.num - 1)
    expect(free.length, 'the pool has become a table').toBeGreaterThanOrEqual(2)
    for (const slot of free) {
      const seen = new Set(SEEDS.map(seed => assignCourses(seed)[slot]!))
      expect(seen.size, `slot ${slot + 1} never varies`).toBeGreaterThan(1)
    }
  })

  test('the opener rotates across the WHOLE gentle tier — batch 2 gap', () => {
    // With one gentle course the opener was a constant; the old test pinned
    // that fact and would have silently hidden a draw bug once the tier grew.
    // Now it must (a) stay inside the tier and (b) actually visit all of it.
    const gentle = new Set(COURSE_POOL.filter(id => COURSES[id].tier === 'gentle'))
    const seen = new Set(SEEDS.map(seed => assignCourses(seed)[0]!))
    for (const id of seen) expect(gentle).toContain(id)
    expect(seen, 'some gentle course never opens a season').toEqual(gentle)
  })
})

describe('the schedule is deterministic and self-contained', () => {
  test('same seed, same schedule — every time', () => {
    for (const seed of [1, 17, 404, 9001, START_SEED]) {
      expect(assignCourses(seed)).toEqual(assignCourses(seed))
      expect(scheduleFor(seed)).toEqual([...assignCourses(seed)])
    }
  })

  test('different seeds produce different rotations', () => {
    const distinct = new Set(SEEDS.slice(0, 60).map(s => assignCourses(s).join('|')))
    expect(distinct.size).toBeGreaterThan(10)
  })

  test('the draw comes off its own stream — bank streams are untouched', () => {
    // seedBank owns salts 1-4; the schedule derives salt 5. Assigning courses
    // must not involve the bank at all: the bank for a seed is identical
    // whether or not a schedule was ever drawn, so a run that consults its
    // schedule twice deals the same cards as one that never looks.
    const before = seedBank(123456)
    assignCourses(123456)
    expect(seedBank(123456)).toEqual(before)
  })
})

describe('the field feels the course too — fieldShift (SCHEDULE-PLAN §3)', () => {
  /** Mean field total over one simulated 8-hole round at a course. */
  function fieldMean(courseId: keyof typeof COURSES, rounds: number): number {
    const holes = COURSES[courseId].holes
    const shift = COURSES[courseId].fieldShift
    let rng = seedBank(4242).field
    let sum = 0, n = 0
    for (let k = 0; k < rounds; k++) {
      let [field, r] = makeField(rng, 0.15)
      rng = r
      for (const hole of holes) {
        const [f2, r2] = advanceField(field, hole.par, rng, shift)
        field = f2; rng = r2
      }
      for (const p of field) { sum += p.total; n++ }
    }
    return sum / n
  }

  test('a positive shift moves the whole field the way it moves you', () => {
    const ph = fieldMean('pinehollow', 40)
    expect(fieldMean('saltflats', 40)).toBeGreaterThan(ph + 1.0)   // ≈ +2.3
    expect(fieldMean('rockdale', 40)).toBeLessThan(ph - 1.0)       // ≈ −2.4
    expect(fieldMean('cottonwood', 40)).toBeGreaterThan(ph + 0.3)  // ≈ +1.1
  })

  test('the shift never changes the call count — two rolls per player per hole', () => {
    const [field] = makeField(seedBank(7).field, 0)
    const r0 = seedBank(7).field
    const [, rA] = advanceField(field, 4, r0, 0)
    const [, rB] = advanceField(field, 4, r0, 0.152)
    expect(rA).toEqual(rB)   // identical end state = identical draw count
  })
})

describe('a run replays byte-identically — different courses are different runs', () => {
  /** The deterministic season bot from deck.test, condensed. */
  function playSeason(seed: number) {
    let s = reduce(initialState(seed), { type: 'START' })
    const visited: string[] = []
    for (let i = 0; i < 20_000 && s.phase !== 'over'; i++) {
      if (s.phase === 'schedule') visited.push(courseOf(s).id)
      switch (s.phase) {
        case 'playing': {
          if (s.hole.puttFeet !== null) { s = reduce(s, { type: 'PUTT', sink: false }); break }
          const dist = toPin(currentHole(s), s.hole.ball)
          const pick = handShots(s)
            .filter(c => !whyNotPlayable(c, s.hole.lie))
            .sort((a, b) => Math.abs(a.carry - dist) - Math.abs(b.carry - dist))[0]!
          s = reduce(s, { type: 'SELECT_SHOT', id: pick.id })
          s = reduce(s, { type: 'COMMIT' })
          break
        }
        case 'shop': s = reduce(s, { type: 'LEAVE_SHOP' }); break
        case 'remove': s = reduce(s, { type: 'REMOVE_CARD', id: s.deck[0] ?? null }); break
        case 'boost': s = reduce(s, { type: 'TAKE_BOOST', id: s.boostOffer[0]! }); break
        default: s = reduce(s, { type: 'NEXT' })
      }
    }
    return { state: s, visited }
  }

  test('same seed, same actions, byte-identical final state', () => {
    const a = playSeason(START_SEED)
    const b = playSeason(START_SEED)
    expect(JSON.stringify(a.state)).toBe(JSON.stringify(b.state))
    expect(a.visited).toEqual(b.visited)
  })

  test('the season the bot walks matches the assigned schedule', () => {
    const { visited } = playSeason(17)
    const rota = assignCourses(17)
    visited.forEach((id, i) => expect(id).toBe(rota[i]))
  })
})
