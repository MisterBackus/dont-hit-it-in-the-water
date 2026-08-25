/**
 * THE CLUBHOUSE BOARD — the playtest leaderboard.
 *
 * Runs arrive as pasted save files (seed + action log) dropped into runs/
 * as <name>.json. Nothing on this board is a claim: every entry is REPLAYED
 * through the real reducer and the money is computed, not read — a score
 * that didn't happen won't replay. That is the save format's whole promise
 * (ARCHITECTURE §9) cashed as an anti-cheat.
 *
 * Ranks by season gross earnings — the game's own language — with wins
 * alongside, best run per name. Emits public/board.html, which Vite copies
 * into the deploy, so the board lives at <site>/board.html and rebuilds on
 * every push. Run: npx tsx src/tools/board.ts
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, basename } from 'node:path'
import { reduce, type Action } from '../sim/reducer'
import { initialState, grossEarnings } from '../sim/state'
import { SAVE_VERSION } from '../platform/storage'
import { EVENT_COUNT, money, moneyListRank } from '../content/season'

interface Row {
  readonly name: string
  readonly gross: number
  readonly wins: number
  readonly played: number
  readonly firedAt: number | null
  readonly rank: number
  readonly finished: boolean
}

function replay(name: string, raw: string): Row | string {
  let parsed: { version?: number; seed?: number; actions?: Action[] }
  try { parsed = JSON.parse(raw) } catch { return `${name}: not JSON` }
  if (parsed.version !== SAVE_VERSION) {
    return `${name}: save version ${parsed.version} (board is v${SAVE_VERSION}) — from an older build, skipped`
  }
  if (typeof parsed.seed !== 'number' || !Array.isArray(parsed.actions)) return `${name}: malformed`
  let s = initialState(parsed.seed)
  let wins = 0
  let played = 0
  try {
    for (const a of parsed.actions) {
      const prev = s
      s = reduce(s, a)
      if (s.phase === 'payout' && prev.phase !== 'payout') {
        played++
        if (s.madeCut && s.lastPlace === 1) wins++
      }
    }
  } catch (e) {
    return `${name}: replay failed (${e instanceof Error ? e.message : e}) — hand-edited or corrupt`
  }
  const gross = grossEarnings(s)
  return {
    name, gross, wins, played,
    firedAt: s.keptJob === false ? s.event : null,
    rank: moneyListRank(gross, Math.max(1, played)),
    finished: s.phase === 'over' && s.keptJob !== false,
  }
}

const ROOT = join(import.meta.dirname ?? __dirname, '..', '..')
const RUNS = join(ROOT, 'runs')
const OUT = join(ROOT, 'public')

const rows: Row[] = []
const notes: string[] = []
if (existsSync(RUNS)) {
  for (const f of readdirSync(RUNS).filter(f => f.endsWith('.json'))) {
    const r = replay(basename(f, '.json'), readFileSync(join(RUNS, f), 'utf8'))
    if (typeof r === 'string') notes.push(r)
    else rows.push(r)
  }
}

// best run per name, by verified money
const best = new Map<string, Row>()
for (const r of rows) {
  const prev = best.get(r.name.replace(/-\d+$/, ''))
  const key = r.name.replace(/-\d+$/, '')
  if (!prev || r.gross > prev.gross) best.set(key, { ...r, name: key })
}
const board = [...best.values()].sort((a, b) => b.gross - a.gross || b.wins - a.wins)

const rowsHtml = board.map((r, i) => `
  <tr>
    <td class="pos">${i + 1}</td>
    <td class="name">${r.name.toUpperCase()}</td>
    <td class="money">${money(r.gross)}</td>
    <td>${r.wins || '·'}</td>
    <td>${r.played}/${EVENT_COUNT}</td>
    <td class="${r.firedAt ? 'bad' : 'good'}">${
      r.firedAt ? `fired at ${r.firedAt}` : r.finished ? 'kept the card' : `thru ${r.played}`
    }</td>
  </tr>`).join('')

const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Clubhouse Board</title>
<style>
  body{background:#0E1613;color:#E5EAE2;font-family:"IBM Plex Mono",ui-monospace,monospace;
    margin:0;padding:32px 16px;display:flex;flex-direction:column;align-items:center}
  h1{font-size:22px;letter-spacing:.12em;text-transform:uppercase;color:#F5F8EE;margin:0 0 4px}
  .sub{color:#6C7D74;font-size:12px;margin-bottom:28px;text-align:center}
  table{border-collapse:collapse;min-width:min(640px,95vw)}
  td,th{padding:9px 14px;border-bottom:1px solid #2A3A33;font-size:14px;text-align:left}
  th{color:#6C7D74;font-size:10px;letter-spacing:.14em;text-transform:uppercase}
  .pos{color:#6C7D74}.name{font-weight:700}.money{color:#9AD8F5;font-variant-numeric:tabular-nums}
  .good{color:#7BA860}.bad{color:#D4574C}
  .empty{color:#6C7D74;padding:40px 0;font-size:13px}
  .notes{color:#6C7D74;font-size:11px;margin-top:24px;max-width:640px}
  a{color:#9AD8F5;text-decoration:none;font-size:12px;margin-top:28px}
</style></head><body>
<h1>The Clubhouse Board</h1>
<div class="sub">every line verified by replay — a score that didn't happen won't post<br>
season gross earnings · playtest, ${new Date().toISOString().slice(0, 10)}</div>
${board.length ? `<table><tr><th></th><th>player</th><th>earned</th><th>wins</th><th>events</th><th>status</th></tr>${rowsHtml}</table>`
    : `<div class="empty">Nobody has posted a round yet. In the game: Copy this run, and send it in.</div>`}
${notes.length ? `<div class="notes">${notes.map(n => `· ${n}`).join('<br>')}</div>` : ''}
<a href="./">← back to the course</a>
</body></html>`

mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, 'board.html'), html)
console.log(`board: ${board.length} player(s), ${rows.length} run(s) verified, ${notes.length} skipped → public/board.html`)
