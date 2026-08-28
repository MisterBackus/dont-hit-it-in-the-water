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
  /** The day the season was posted or verified — display only, never replayed. */
  readonly date: string | null
}

function replay(name: string, raw: string): Row | string {
  let parsed: {
    version?: number; seed?: number; actions?: Action[]; postedAt?: string
    abandoned?: boolean
  }
  try { parsed = JSON.parse(raw) } catch { return `${name}: not JSON` }
  if (parsed.version !== SAVE_VERSION) {
    return `${name}: save version ${parsed.version} (board is v${SAVE_VERSION}) — from an older build, skipped`
  }
  if (typeof parsed.seed !== 'number' || !Array.isArray(parsed.actions)) return `${name}: malformed`
  // The board ranks finished golf. A season somebody gave up on is data for
  // runstats, not a line on a leaderboard.
  if (parsed.abandoned) return `${name}: abandoned — kept for runstats, not ranked`
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
    date: typeof parsed.postedAt === 'string' ? parsed.postedAt : null,
  }
}

const ROOT = join(import.meta.dirname ?? __dirname, '..', '..')
const RUNS = join(ROOT, 'runs')
const OUT = join(ROOT, 'public')

const rows: Row[] = []
const notes: string[] = []

// THE FROZEN LEDGER (runs/verified.json): rows verified by replay at the
// version they were PLAYED, then frozen. A save-version bump must never
// erase history the engine already vouched for — files listed here are
// trusted from the ledger and not re-replayed.
const frozen = new Set<string>()
const ledgerPath = join(RUNS, 'verified.json')
if (existsSync(ledgerPath)) {
  try {
    const ledger = JSON.parse(readFileSync(ledgerPath, 'utf8')) as {
      rows?: (Row & { file: string; verifiedAtVersion: number })[]
    }
    for (const r of ledger.rows ?? []) {
      frozen.add(r.file)
      rows.push({ name: r.name, gross: r.gross, wins: r.wins, played: r.played,
        firedAt: r.firedAt, rank: r.rank, finished: r.finished, date: r.date ?? null })
    }
  } catch { notes.push('verified.json unreadable — frozen rows skipped') }
}

if (existsSync(RUNS)) {
  for (const f of readdirSync(RUNS).filter(f => f.endsWith('.json') && f !== 'verified.json' && !frozen.has(f))) {
    const name = basename(f, '.json')
    const raw = readFileSync(join(RUNS, f), 'utf8')
    // a file is either one run or a bundle {runs:[...]} — the archive export
    let parsed: unknown
    try { parsed = JSON.parse(raw) } catch { notes.push(`${name}: not JSON`); continue }
    const bundle = (parsed as { runs?: unknown[] }).runs
    const each = Array.isArray(bundle) ? bundle : [parsed]
    each.forEach((run, i) => {
      const r = replay(i ? `${name}-${i + 1}` : name, JSON.stringify(run))
      if (typeof r === 'string') notes.push(r)
      else rows.push(r)
    })
  }
}

// Every verified season is its own line (owner ruling, 26 Aug 2026 — the
// board is a season log, not best-per-name). The file suffix (-2, -3…)
// folds into the player's name so ANDREW's four years all read ANDREW.
const board = rows
  .map(r => ({ ...r, name: r.name.replace(/-\d+$/, '') }))
  .sort((a, b) => b.gross - a.gross || b.wins - a.wins)

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
    <td class="when">${r.date ?? '·'}</td>
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
  .good{color:#7BA860}.bad{color:#D4574C}.when{color:#6C7D74;font-size:12px}
  .empty{color:#6C7D74;padding:40px 0;font-size:13px}
  .notes{color:#6C7D74;font-size:11px;margin-top:24px;max-width:640px}
  a{color:#9AD8F5;text-decoration:none;font-size:12px;margin-top:28px}
</style></head><body>
<h1>The Clubhouse Board</h1>
<div class="sub">every line verified by replay — a score that didn't happen won't post<br>
season gross earnings · playtest, ${new Date().toISOString().slice(0, 10)}</div>
${board.length ? `<table><tr><th></th><th>player</th><th>earned</th><th>wins</th><th>events</th><th>status</th><th>when</th></tr>${rowsHtml}</table>`
    : `<div class="empty">No seasons yet. Play one to the end, then press <b>Post this season to the board</b> on the last screen — it takes a name and a click.</div>`}
${notes.length ? `<div class="notes">${notes.map(n => `· ${n}`).join('<br>')}</div>` : ''}
<a href="./">← back to the course</a>
</body></html>`

mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, 'board.html'), html)
console.log(`board: ${board.length} player(s), ${rows.length} run(s) verified, ${notes.length} skipped → public/board.html`)
