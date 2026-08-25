import { describe, expect, test } from 'vitest'
import { chooseShot } from './policy'
import type { HoleSpec } from '../sim/types'

/**
 * The appetites can finally DISAGREE about a naked carry (DEPTH-DECISION.md).
 *
 * A synthetic crossing built on the Stinger sneak from COURSE-REVIEW-6 §5.4:
 * a low runner over a water belt whose far edge sits between the shot's
 * short die and its centre. The deterministic pitch clears; the short end
 * of the pitch band does not — and a low ball that pitches wet IS wet
 * (resolve/shot.ts). A depth-blind planner scored this always-dry and every
 * appetite took it; a depth-aware one sees the short die dunk, and which
 * end of the pitch band an appetite optimises becomes the decision.
 */
const CROSSING: HoleSpec = {
  num: 1, par: 4, length: 350, name: 'Test Crossing',
  corridor: [{ at: 0, half: 40 }, { at: 350, half: 40 }],
  greenRadius: 14, greenSide: 0,
  // belt spans down 160..220 at full width. Stinger (carry 225, lowFlight):
  // centre pitch 225 clears, short die 225 × 0.95 = 213.75 pitches wet.
  // Short Iron (130 + 3 roll) stops 27 short of the belt and cannot dunk.
  hazards: [{ surface: 'water', at: { down: 190, side: 0 }, rDown: 30, rSide: 300 }],
  note: 'synthetic — the naked-carry gamble, distilled',
}

describe('depth-aware appetites fork on a naked carry', () => {
  const tee = { down: 0, side: 0 }
  const hand = ['stinger', 'shortiron']

  test('aggressive takes the carry; safe lays up short of the belt', () => {
    const aggro = chooseShot(CROSSING, tee, 'tee', hand, 'aggressive', 0)
    const safe = chooseShot(CROSSING, tee, 'tee', hand, 'safe', 0)
    // the long die pays and the 25th percentile chases it
    expect(aggro.shot.id).toBe('stinger')
    // the short die dunks and the 80th percentile refuses to swallow it
    expect(safe.shot.id).toBe('shortiron')
  })
})
