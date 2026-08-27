/**
 * THE MARKS ARE COMPLETE, AND THEY ARE DRAWINGS.
 *
 * The failure this guards is quiet: add an item, forget its mark, and it
 * renders as the old glyph fallback — which is exactly the unreadable state
 * the marks were drawn to replace, except now it happens to one item and
 * nobody notices. So: every purchasable thing has a drawing, no drawing is
 * orphaned, and each path is real path data rather than an empty string that
 * would render as nothing at all.
 */
import { describe, expect, test } from 'vitest'
import { ITEM_ART } from './ItemMark'
import { BOOSTS } from '../content/boosts'

describe('the item marks', () => {
  test('every boost has one, and none is orphaned', () => {
    const ids = BOOSTS.map(b => b.id).sort()
    expect(Object.keys(ITEM_ART).sort()).toEqual(ids)
  })

  test('every mark is real path data', () => {
    for (const [id, m] of Object.entries(ITEM_ART)) {
      // starts with a move, carries at least one closed subpath, and is not
      // a stub — the shortest real mark here is well over a hundred chars
      expect(m.d.startsWith('M'), id).toBe(true)
      expect(m.d.includes('Z'), id).toBe(true)
      expect(m.d.length, id).toBeGreaterThan(80)
      // no NaN or undefined leaked in from a helper
      expect(/NaN|undefined/.test(m.d), id).toBe(false)
    }
  })

  test('the tilts are gentle — things lean, they do not fall over', () => {
    for (const [id, m] of Object.entries(ITEM_ART)) {
      if (m.rot === undefined) continue
      expect(Math.abs(m.rot), id).toBeLessThanOrEqual(16)
    }
  })

  test('every mark stays inside its 32-yard box', () => {
    for (const [id, m] of Object.entries(ITEM_ART)) {
      const nums = (m.d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number)
      // arc flags and radii live in the same stream, so this is a loose
      // sanity bound: nothing should be wildly outside the drawing box
      expect(Math.max(...nums), id).toBeLessThanOrEqual(32)
      expect(Math.min(...nums), id).toBeGreaterThanOrEqual(-32)
    }
  })
})
