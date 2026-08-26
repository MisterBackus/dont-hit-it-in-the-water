/**
 * WHAT DID THE HUMANS ACTUALLY DO?
 *
 * The harness plays policies; the playtest plays people. This instrument
 * replays every shared run in runs/ and mines the decisions no single game
 * screen shows: what the shop OFFERED against what got BOUGHT (conversion is
 * the truth about a price), what the swaps displaced, where the runs died,
 * which courses fed on which players, and how the focus economy was really
 * spent. Pure replay — same trust model as the board: nothing self-reported.
 *
 * Run: npx tsx src/tools/runstats.ts   (reads runs/*.json)
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, basename } from 'node:path'
import { reduce, type Action } from '../sim/reducer'
import { initialState, grossEarnings, courseOf } from '../sim/state'
import { SAVE_VERSION } from '../platform/storage'
import { money } from '../content/season'
import { CARD } from '../content/cards'
import { BOOST } from '../content/boosts'

const label = (kind: string, id: string) =>
  kind === 'boost' ? (BOOST[id]?.name ?? id) : (CARD[id]?.name ?? id)

interface Tally { offered: number; bought: number; spent: number }
const items = new Map<string, Tally>()
const drops = new Map<string, number>()
const swapsIn = new Map<string, number>()
const swapsOut = new Map<string, number>()
const weeks = new Map<string, number>()
const courseRel = new Map<string, { n: number; rel: number; cutsMade: number; cutsMissed: number; wins: number }>()
const deaths: string[] = []
let totalRedraws = 0
let totalSinks = 0
let totalRuns = 0

function tally(kind: string, id: string): Tally {
  const k = `${kind}:${id}`
  let t = items.get(k)
  if (!t) { t = { offered: 0, bought: 0, spent: 0 }; items.set(k, t) }
  return t
}
const bump = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1)

function mine(name: string, raw: string): string | null {
  const parsed = JSON.parse(raw) as { version: number; seed: number; actions: Action[] }
  if (parsed.version !== SAVE_VERSION) return `${name}: v${parsed.version} save, skipped`
  let s = initialState(parsed.seed)
  totalRuns++
  for (const a of parsed.actions) {
    const prev = s
    if (a.type === 'BUY') {
      const item = prev.offer[a.index]
      if (item && item.price <= prev.earnings) {
        const t = tally(item.kind, item.id)
        t.bought++; t.spent += item.price
      }
    }
    if (a.type === 'TAKE_BOOST') bump(drops, a.id)
    if (a.type === 'REMOVE_CARD' && a.id) {
      if (prev.mustSwap) { bump(swapsIn, prev.deck[0] ?? '?'); bump(swapsOut, a.id) }
      else bump(swapsOut, a.id)
    }
    if (a.type === 'REDRAW' && prev.focus >= 1) totalRedraws++
    if (a.type === 'PUTT' && a.sink) totalSinks++
    if (a.type === 'TAKE_WEEK') bump(weeks, a.id)
    s = reduce(s, a)
    // a fresh shop stock = these items were SEEN; reroll restocks count too
    if (s.phase === 'shop' && (prev.phase !== 'shop' || a.type === 'REROLL')) {
      for (const it of s.offer) tally(it.kind, it.id).offered++
    }
    if (s.phase === 'payout' && prev.phase !== 'payout') {
      const c = courseOf(s).label
      let e = courseRel.get(c)
      if (!e) { e = { n: 0, rel: 0, cutsMade: 0, cutsMissed: 0, wins: 0 }; courseRel.set(c, e) }
      e.n++
      if (s.madeCut) {
        e.cutsMade++
        e.rel += s.scores.reduce((x, y) => x + y, 0) - courseOf(s).par
        if (s.lastPlace === 1) e.wins++
      } else e.cutsMissed++
    }
  }
  if (s.keptJob === false) deaths.push(`${name} fired at event ${s.event} (${money(grossEarnings(s))})`)
  return null
}

const RUNS = join(import.meta.dirname ?? __dirname, '..', '..', 'runs')
const skipped: string[] = []
if (existsSync(RUNS)) {
  for (const f of readdirSync(RUNS).filter(f => f.endsWith('.json'))) {
    const name = basename(f, '.json')
    const raw = readFileSync(join(RUNS, f), 'utf8')
    // single run or an archive bundle {runs:[...]} — mine every season in it
    let parsed: unknown
    try { parsed = JSON.parse(raw) } catch { skipped.push(`${name}: not JSON`); continue }
    const bundle = (parsed as { runs?: unknown[] }).runs
    const each = Array.isArray(bundle) ? bundle : [parsed]
    each.forEach((run, i) => {
      const note = mine(i ? `${name}-${i + 1}` : name, JSON.stringify(run))
      if (note) skipped.push(note)
    })
  }
}

console.log(`\nWHAT THE HUMANS DID · ${totalRuns} run(s) replayed${skipped.length ? ` · skipped: ${skipped.join(', ')}` : ''}\n`)

console.log('THE SHOP · offered vs bought (conversion is the truth about a price)')
console.log('  item                              offered  bought   conv    spent')
console.log('  ' + '-'.repeat(70))
const rows = [...items.entries()].sort((a, b) => b[1].bought - a[1].bought || b[1].offered - a[1].offered)
for (const [k, t] of rows) {
  const [kind, id] = k.split(':') as [string, string]
  console.log(`  ${(label(kind, id) + (kind === 'boost' ? '' : ' (card)')).padEnd(34)}` +
    `${String(t.offered).padStart(5)} ${String(t.bought).padStart(7)}` +
    `${(t.offered ? Math.round(t.bought / t.offered * 100) + '%' : '—').padStart(7)}` +
    ` ${money(t.spent).padStart(8)}`)
}

console.log('\nMAJOR DROPS taken:', [...drops.entries()].map(([id, n]) => `${label('boost', id)}×${n}`).join(' · ') || 'none')
console.log('SWAPPED IN:', [...swapsIn.entries()].map(([id, n]) => `${label('card', id)}×${n}`).join(' · ') || 'none')
console.log('CUT/SWAPPED OUT:', [...swapsOut.entries()].map(([id, n]) => `${label('card', id)}×${n}`).join(' · ') || 'none')
console.log('WEEKS taken:', [...weeks.entries()].map(([id, n]) => `${id}×${n}`).join(' · ') || 'none')
console.log(`REDRAWS: ${totalRedraws} · BOUGHT SINKS: ${totalSinks}`)

console.log('\nTHE COURSES · what each did to the humans')
console.log('  course             events  cuts made/missed   avg rel (made)   wins')
console.log('  ' + '-'.repeat(68))
for (const [c, e] of [...courseRel.entries()].sort((a, b) => b[1].n - a[1].n)) {
  console.log(`  ${c.padEnd(20)}${String(e.n).padStart(4)}   ${String(e.cutsMade).padStart(6)}/${e.cutsMissed}` +
    `${(e.cutsMade ? ((e.rel / e.cutsMade >= 0 ? '+' : '') + (e.rel / e.cutsMade).toFixed(1)) : '—').padStart(15)}` +
    `${String(e.wins).padStart(9)}`)
}

console.log('\nDEATHS:', deaths.length ? deaths.join(' · ') : 'none in the sample')
console.log()
