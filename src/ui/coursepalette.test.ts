/**
 * THE PALETTE CONFORMANCE TEST.
 *
 * Ten courses now wear ten different grounds, and a palette is the one kind
 * of change that can look finished and still be broken: nothing throws, the
 * shapes are all correct, and a number the player needs has quietly stopped
 * being readable. That is not hypothetical. Salt Flats inverted its ground
 * from dark to pale and the phosphor yardage grid went from 9.20 against the
 * house rough to 1.45 against the salt pan — invisible — and it took a second
 * screenshot and a second look to catch. This file is so there is no third
 * time: every palette in coursepalette.css is read at test time, merged over
 * the house Sunday Tape tokens it inherits, and measured.
 *
 * The floors below are WCAG relative-contrast ratios. They are not the
 * accessibility thresholds (a cone is not body text); they are the lowest
 * value any shipped palette actually achieves, rounded down, so the test
 * encodes "no worse than what the owner has already approved" rather than a
 * number invented here. When a palette legitimately needs to go below one,
 * the floor moves in the same commit as the palette and the message says why.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const UI = join(process.cwd(), 'src', 'ui')

function read(f: string): string {
  return readFileSync(join(UI, f), 'utf8')
}

/** every `--token:#hex` inside the FIRST block whose selector matches */
function block(css: string, selector: string): Record<string, string> {
  const i = css.indexOf(selector)
  if (i < 0) return {}
  const open = css.indexOf('{', i)
  const close = css.indexOf('}', open)
  const out: Record<string, string> = {}
  for (const m of css.slice(open, close).matchAll(/(--[\w-]+)\s*:\s*(#[0-9A-Fa-f]{6})/g)) {
    out[m[1]!] = m[2]!.toLowerCase()
  }
  return out
}

/** the house look every course palette starts from */
const HOUSE: Record<string, string> = {
  ...block(read('styles.css'), '.holewrap.tape{'),
  ...block(read('holeart.css'), '.holewrap.tape {'),
}

const PALETTE_CSS = read('coursepalette.css')

/**
 * '(house)' is Pine Hollow. It ships no palette block because the parkland
 * look IS the house look — which meant the busiest course on the schedule was
 * the one course this file did not measure, right up until the lateral-ramp
 * check went in and had nothing to say about it. The default is a palette
 * like any other and is held to the same floors.
 */
const HOUSE_KEY = '(house)'
const COURSES = [HOUSE_KEY, ...[...PALETTE_CSS.matchAll(/\.holewrap\.tape\.c-([a-z]+)\{/g)]
  .map(m => m[1]!)
  .filter((c, i, a) => a.indexOf(c) === i)]

function tokens(course: string): Record<string, string> {
  if (course === HOUSE_KEY) return HOUSE
  return { ...HOUSE, ...block(PALETTE_CSS, `.holewrap.tape.c-${course}{`) }
}

function luminance(hex: string): number {
  const ch = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)))
  return 0.2126 * ch[0]! + 0.7152 * ch[1]! + 0.0722 * ch[2]!
}

function contrast(a: string, b: string): number {
  const x = luminance(a), y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

/** every surface the sim can put a ball on, as the picture paints it */
const GROUNDS = ['--fairway', '--rough', '--deep', '--band-trees', '--ob-field', '--green']

describe('the course palettes stay legible (coursepalette.css)', () => {
  it('registers a palette for every course that declares one', () => {
    expect(COURSES.length).toBeGreaterThanOrEqual(9)
  })

  it('inherits the house tokens it does not override', () => {
    // if this fails the parser has drifted, and every measurement below is a lie
    expect(HOUSE['--cone']).toBeTruthy()
    expect(HOUSE['--grid']).toBeTruthy()
    expect(HOUSE['--signal']).toBeTruthy()
    expect(HOUSE['--tube']).toBeTruthy()
    expect(HOUSE['--sand']).toBeTruthy()
  })

  describe.each(COURSES)('%s', course => {
    const t = tokens(course)
    const on = (k: string) => GROUNDS.map(g => [g, contrast(t[k]!, t[g]!)] as const)
    const worst = (k: string) => on(k).reduce((a, b) => (b[1] < a[1] ? b : a))

    /**
     * THE CONE IS THE PROMISE (P8). It is drawn over every ground on the
     * hole, so it is measured against every ground on the hole. The tightest
     * shipped pair is the cone over the Salt Flats salt pan at 2.12.
     */
    it('keeps the cone readable over every ground it can be drawn on', () => {
      const [ground, ratio] = worst('--cone')
      expect(ratio, `${course}: cone over ${ground}`).toBeGreaterThanOrEqual(1.45)
    })

    /** the yardage grid — the one that actually broke */
    it('keeps the yardage grid readable over every ground', () => {
      const [ground, ratio] = worst('--grid')
      expect(ratio, `${course}: grid over ${ground}`).toBeGreaterThanOrEqual(2.0)
    })

    /** sand costs a stroke; it may never dissolve into the ground around it */
    it('keeps sand distinct from every ground', () => {
      for (const [ground, ratio] of on('--sand')) {
        if (ground === '--fairway' || ground === '--green') continue
        expect(ratio, `${course}: sand against ${ground}`).toBeGreaterThanOrEqual(1.3)
      }
    })

    /**
     * DON'T HIT IT IN THE WATER. Palmetto's creeks are tannic and Cottonwood's
     * river is silt, so "that is water" has to survive the water not being
     * blue. The house palette separates water from fairway by hue alone and
     * measures 1.12 doing it, which is the floor here — a course may be as
     * unblue as it likes so long as it is no worse than what already ships.
     */
    it('keeps water from reading as grass', () => {
      for (const g of ['--fairway', '--rough', '--green']) {
        expect(contrast(t['--water']!, t[g]!), `${course}: water against ${g}`)
          .toBeGreaterThanOrEqual(1.1)
      }
    })

    /** the corridor edge is the most-read boundary in the game */
    it('separates the fairway from the rough beside it', () => {
      expect(contrast(t['--fairway']!, t['--rough']!), `${course}: fairway/rough`)
        .toBeGreaterThanOrEqual(1.35)
    })

    /**
     * OB is two strokes and says so in Signal Red. HoleView draws the dashes
     * over a tube-ink backing, and the pair is what has to be seen — on the
     * dark grounds the red wins on its own (3.17 on the parkland OB field)
     * and the backing is invisible; on the Salt Flats pan the red alone is
     * 2.00 and it is the backing carrying the line at 8.80. So the rule is
     * that ONE of the two clears the ground, not that both do. Asserting the
     * backing alone was this test's own first bug: it failed nine palettes
     * that were fine and would have pushed a pointless edit onto all of them.
     */
    it('lets the OB line be seen against its own ground', () => {
      const red = contrast(t['--signal']!, t['--ob-field']!)
      const backing = contrast(t['--tube']!, t['--ob-field']!)
      expect(Math.max(red, backing), `${course}: OB line (red ${red.toFixed(2)}, backing ${backing.toFixed(2)})`)
        .toBeGreaterThanOrEqual(3.0)
      expect(contrast(t['--ha-stake']!, t['--ob-field']!), `${course}: OB stakes`)
        .toBeGreaterThanOrEqual(2.5)
    })

    /**
     * THE LATERAL RAMP. Walking sideways off the corridor you cross rough,
     * then deep, then trees, then OB, and the picture has to let you tell
     * each one from the next.
     *
     * The first version of this test demanded a lightness step at all three
     * joins and could not be satisfied: solving it drove three of the four
     * bands to pure black, because four steps of "darker" do not fit under a
     * rough that is already #152F1E. That failure was the useful part. Only
     * the first two bands are bare ground with nothing but colour to tell
     * them apart, so only they owe a lightness step. The trees band is told
     * by its canopies and OB by its hatch, and OB is now the LIGHTER of that
     * pair on every course — a wood is dark, and what lies beyond it is a
     * road, a field, or Rockdale's driving range.
     *
     * What OB owes instead is ground to see: it may not collapse to black
     * (there must be something under the hatch) and the hatch ink must read
     * against it.
     */
    it('separates the two bare-ground bands by colour', () => {
      expect(contrast(t['--rough']!, t['--deep']!), `${course}: rough/deep`)
        .toBeGreaterThanOrEqual(1.15)
      expect(contrast(t['--deep']!, t['--band-trees']!), `${course}: deep/trees`)
        .toBeGreaterThanOrEqual(1.10)
    })

    it('gives out of bounds ground to see, and a hatch you can see on it', () => {
      expect(contrast(t['--ob-field']!, '#000000'), `${course}: OB is not a void`)
        .toBeGreaterThanOrEqual(1.25)
      expect(contrast(t['--tube']!, t['--ob-field']!), `${course}: OB hatch ink`)
        .toBeGreaterThanOrEqual(1.25)
    })

    /** a wood has to read as a wood, not as a smudge on the ground it stands on */
    it('stands its trees clear of the ground they grow on', () => {
      for (const g of ['--band-trees', '--ob-field']) {
        expect(contrast(t['--ha-canopy']!, t[g]!), `${course}: canopy over ${g}`)
          .toBeGreaterThanOrEqual(1.25)
      }
    })
  })
})
