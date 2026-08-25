/**
 * Given a hand and a hole, is there a line to par?
 *
 * The question that matters for a deckbuilder: a bad hand should make par
 * HARDER TO FIND, not impossible. A hand with no line at all is a dead hand,
 * and dead hands feel like theft rather than difficulty.
 *
 * Run: npx tsx src/tools/solve.ts
 */
import { PINE_HOLLOW } from '../content/courses/pinehollow'
import { CARD, PUNCH_OUT } from '../content/cards'
import { buildCone } from '../sim/effects'
import { toPin } from '../sim/geometry'
import type { ShotCard, TechniqueCard } from '../sim/types'

const hole = PINE_HOLLOW[2]!            // Church Pew, par 4, 442
const HAND = ['fullwedge', 'longiron']  // + Punch Out, as in the screenshot
const TECHS = ['smooth', 'extra', 'rip', 'green']
const FOCUS = 5

const shots: ShotCard[] = [
  ...HAND.map(id => CARD[id] as ShotCard), PUNCH_OUT,
]
const techs: TechniqueCard[] = TECHS.map(id => CARD[id] as TechniqueCard)

interface Play { label: string; carry: number; spread: number; focus: number }

/** Every legal shot+technique combination from a given distance. */
function plays(dist: number, focusLeft: number): Play[] {
  const out: Play[] = []
  const combos: TechniqueCard[][] = [[]]
  for (const t of techs) {
    if (t.focus <= focusLeft) combos.push([t])
    for (const u of techs) {
      if (u.id !== t.id && t.focus + u.focus <= focusLeft) combos.push([t, u])
    }
  }
  for (const shot of shots) {
    for (const c of combos) {
      const { cone } = buildCone({ shot, techniques: c, aim: 'pin' }, 'fairway', dist)
      const label = c.length ? `${shot.name} + ${c.map(t => t.name).join(' + ')}` : shot.name
      out.push({
        label, carry: cone.carry + cone.roll, spread: cone.spread,
        focus: c.reduce((n, t) => n + t.focus, 0),
      })
    }
  }
  return out
}

const total = toPin(hole, { down: 0, side: 0 })
console.log(`\n${hole.name} — par ${hole.par}, ${Math.round(total)} yards`)
console.log(`hand: ${shots.map(s => s.name).join(', ')}`)
console.log(`focus: ${FOCUS}\n`)
console.log('Par needs the green in 2. Searching every two-shot line...\n')

interface Line { a: Play; b: Play; leaves: number; risk: number; focus: number }
const lines: Line[] = []

for (const a of plays(total, FOCUS)) {
  const after = total - a.carry
  if (after <= 0) continue                       // flew the green off the tee
  for (const b of plays(after, FOCUS - a.focus)) {
    const leaves = Math.abs(after - b.carry)
    if (leaves > hole.greenRadius) continue      // not on the green
    lines.push({ a, b, leaves, risk: a.spread + b.spread, focus: a.focus + b.focus })
  }
}

if (lines.length === 0) {
  console.log('  ✗ NO LINE TO PAR. This is a dead hand.\n')
} else {
  lines.sort((x, y) => x.risk - y.risk)
  console.log(`  ✓ ${lines.length} lines reach the green in two. The tightest:\n`)
  for (const l of lines.slice(0, 6)) {
    console.log(`   1. ${l.a.label}`)
    console.log(`      → ${l.a.carry} yds, cone ±${l.a.spread}, leaves ${Math.round(total - l.a.carry)}`)
    console.log(`   2. ${l.b.label}`)
    console.log(`      → ${l.b.carry} yds, cone ±${l.b.spread}, ${l.leaves} from the pin`)
    console.log(`      total scatter ±${l.risk} · ${l.focus} focus\n`)
  }
}

// And the naive line, for comparison
const naive = plays(total, FOCUS).find(p => p.label === 'Long Iron')!
console.log(`For comparison — plain Long Iron off the tee:`)
console.log(`   ${naive.carry} yds, leaves ${Math.round(total - naive.carry)} — needs another full shot AND a wedge.`)
console.log(`   That is a bogey at best.\n`)
