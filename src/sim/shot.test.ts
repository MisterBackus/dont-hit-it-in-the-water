import { describe, expect, test } from 'vitest'
import { PINE_HOLLOW } from '../content/courses/pinehollow'
import { CARD } from '../content/cards'
import { MAX_CONE_TANGENT, whyNotPlayable, buildCone } from './effects'
import { CARRY_JITTER, resolveShot } from './resolve/shot'
import { makeRng, next, seedBank } from './rng'
import { greenCentre, toPin } from './geometry'
import type { Point } from './types'

const hole = PINE_HOLLOW.find(h => h.name === 'Two Ways Home')!  // par 5, 520 yds
const g = greenCentre(hole)

describe('shots travel toward the pin, not away from the tee', () => {
  test('past the green, a shot comes BACK — regression, found in playtest', () => {
    // Ball 22 yards beyond the pin. Before the fix, every club added to `down`
    // and the ball could never return: "i hit it past the hole and its still
    // hitting it past the hole".
    const from: Point = { down: g.down + 22, side: g.side }
    expect(toPin(hole, from)).toBeCloseTo(22, 0)

    const shot = CARD['pitch'] as never
    const { cone, ctx } = buildCone(
      { shot, techniques: [], aim: 'pin' }, 'fairway', toPin(hole, from),
    )
    // the cone must be capped at the pin, not the club's full 55
    expect(cone.carry).toBeLessThanOrEqual(23)

    let rng = makeRng(1)
    for (let i = 0; i < 60; i++) {
      const [out, r] = resolveShot(hole, from, cone, ctx, rng)
      rng = r
      // it must end up closer than it started, every single time
      expect(out.toPin).toBeLessThan(22)
      // and it must travel back down the hole, not further away
      expect(out.landing.down).toBeLessThan(from.down)
    }
  })

  test('short shots cut down to the target; full shots fly their number', () => {
    for (const id of ['fullwedge', 'pitch', 'flop']) {
      const { cone } = buildCone(
        { shot: CARD[id] as never, techniques: [], aim: 'pin' }, 'fairway', 30,
      )
      expect(cone.carry, `${id} should cut down`).toBeLessThanOrEqual(31)
    }
    // The gap puzzle depends on these NOT capping — a 200 shot from 171 must
    // fly 200 and leave you past the hole, or there is no decision to make.
    for (const id of ['bomb', 'stinger', 'longiron', 'midiron']) {
      const c = CARD[id] as { carry: number }
      const { cone } = buildCone(
        { shot: CARD[id] as never, techniques: [], aim: 'pin' }, 'fairway', 30,
      )
      expect(cone.carry, `${id} should fly full`).toBe(c.carry)
    }
  })

  test('a Long Iron from 171 flies past the pin — the gap must stay real', () => {
    const { cone } = buildCone(
      { shot: CARD['longiron'] as never, techniques: [], aim: 'pin' }, 'fairway', 171,
    )
    expect(cone.carry).toBe(200)
    expect(cone.carry).toBeGreaterThan(171)
  })

  test('cutting a short shot down widens its ANGLE, not its yardage', () => {
    // This used to assert the spread grew in YARDS while the shot got shorter,
    // which is how the cone came to fan 45° on a 21-yard pitch and 75° on a
    // chip — a shape wider than it was long. The penalty is angular: take
    // everything off a card and your error multiplies, but a short shot is
    // still a short shot.
    const cone = (d: number) =>
      buildCone({ shot: CARD['fullwedge'] as never, techniques: [], aim: 'pin' }, 'fairway', d).cone
    const full = cone(999)
    const cut = cone(25)
    const angle = (c: { spread: number; carry: number; roll: number }) =>
      c.spread / (c.carry + c.roll)
    expect(cut.carry).toBeLessThan(full.carry)
    expect(angle(cut)).toBeGreaterThan(angle(full) * 1.8)
    expect(cut.spread).toBeLessThanOrEqual(full.spread)
  })

  test('no cone ever fans wider than it reaches', () => {
    // The picture has to stay readable at every distance, including the ones
    // nobody thought about. Scan every card from every plausible remaining
    // yardage and from every lie.
    for (const id of Object.keys(CARD)) {
      const card = CARD[id]!
      if (card.kind !== 'shot') continue
      for (const lie of ['tee', 'fairway', 'rough', 'deep', 'bunker', 'trees'] as const) {
        if (whyNotPlayable(card, lie)) continue
        for (const dist of [8, 15, 21, 30, 45, 70, 120, 200, 300]) {
          const { cone } = buildCone({ shot: card, techniques: [], aim: 'pin' }, lie, dist)
          const reach = cone.carry + cone.roll
          expect(cone.spread).toBeLessThanOrEqual(Math.max(2, reach * MAX_CONE_TANGENT) + 1)
        }
      }
    }
  })
})

describe('the cone is the whole truth (P8)', () => {
  test('the ball never finishes outside the drawn cone', () => {
    const from: Point = { down: 0, side: 0 }
    const { cone, ctx } = buildCone(
      { shot: CARD['bomb'] as never, techniques: [], aim: 'pin' }, 'tee', 520,
    )
    let rng = makeRng(99)
    for (let i = 0; i < 2000; i++) {
      const [out, r] = resolveShot(hole, from, cone, ctx, rng)
      rng = r
      // lateral offset can never exceed the cone's half-width
      expect(Math.abs(out.landing.side)).toBeLessThanOrEqual(cone.spread + 0.001)
    }
  })
})

describe('depth in the picture (DEPTH-DECISION.md)', () => {
  test('the pitch band is carry ± the exact jitter resolution rolls', () => {
    const { cone } = buildCone(
      { shot: CARD['bomb'] as never, techniques: [], aim: 'pin' }, 'tee', 520,
    )
    // derived from the SAME constant — rounded outward, never inward
    expect(cone.pitchNear).toBe(Math.floor(cone.carry * (1 - CARRY_JITTER)))
    expect(cone.pitchFar).toBe(Math.ceil(cone.carry * (1 + CARRY_JITTER)))
    // the tail is the pitch band displaced by the roll
    expect(cone.restNear).toBe(cone.pitchNear + cone.roll)
    expect(cone.restFar).toBe(cone.pitchFar + cone.roll)
  })

  test('no roll, no tail — a wedge is the wedge with a thick far edge', () => {
    const { cone } = buildCone(
      { shot: CARD['fullwedge'] as never, techniques: [], aim: 'pin' }, 'fairway', 999,
    )
    expect(cone.roll).toBe(0)
    expect(cone.restNear).toBe(cone.pitchNear)
    expect(cone.restFar).toBe(cone.pitchFar)
  })

  test('Let It Chase stretches the tail; Dead Ball deletes it', () => {
    const stinger = { shot: CARD['stinger'] as never, aim: 'pin' as const }
    const bare = buildCone({ ...stinger, techniques: [] }, 'tee', 999).cone
    expect(bare.restFar - bare.pitchFar).toBe(30)  // the Stinger's long skid
    const chased = buildCone(
      { ...stinger, techniques: [CARD['chase'] as never] }, 'tee', 999,
    ).cone
    expect(chased.restFar - chased.pitchFar).toBe(55)
    const dead = buildCone({ ...stinger, techniques: [] }, 'tee', 999,
      [{ id: 'db', name: '', icon: '', blurb: '', price: 0, killRoll: true }]).cone
    expect(dead.roll).toBe(0)
    expect(dead.restFar).toBe(dead.pitchFar)
  })

  test('the ball always pitches inside the band and rests inside the tail', () => {
    for (const id of ['bomb', 'stinger', 'fullwedge']) {
      const { cone, ctx } = buildCone(
        { shot: CARD[id] as never, techniques: [], aim: 'pin' }, 'tee', 520,
      )
      let rng = makeRng(7)
      for (let i = 0; i < 2000; i++) {
        const [out, r] = resolveShot(hole, { down: 0, side: 0 }, cone, ctx, rng)
        rng = r
        // pitch depth: never outside the solid band the player was shown
        expect(out.carried).toBeGreaterThanOrEqual(cone.pitchNear)
        expect(out.carried).toBeLessThanOrEqual(cone.pitchFar)
        // rest depth: never past the tail (roll only ever attenuates)
        expect(out.carried + out.rolled).toBeGreaterThanOrEqual(cone.restNear - cone.roll)
        expect(out.carried + out.rolled).toBeLessThanOrEqual(cone.restFar)
      }
    }
  })
})

describe('determinism', () => {
  test('the same seed produces the same sequence', () => {
    const draw = (seed: number) => {
      let r = seedBank(seed).shot
      return Array.from({ length: 8 }, () => { const [v, n] = next(r); r = n; return v })
    }
    expect(draw(42)).toEqual(draw(42))
    expect(draw(42)).not.toEqual(draw(43))
  })
})
