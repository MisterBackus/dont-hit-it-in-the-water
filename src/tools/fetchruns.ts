/**
 * COLLECTING THE MAIL — pull pending runs from the board inbox into runs/.
 *
 * The deploy job runs this just before board.ts: it asks the inbox Worker
 * (workers/board-inbox) for everything players have posted, writes each run
 * into runs/ as <name>-<n>.json, and lets the existing board flow do what it
 * always does — replay every file through the real reducer and believe only
 * what verifies. This tool trusts nothing; it is a courier, not a judge.
 *
 * Config comes from the environment (GitHub Actions secrets in CI):
 *   INBOX_URL         the Worker's URL
 *   INBOX_READ_TOKEN  the shared read token (Bearer)
 * When either is absent it no-ops with exit 0, so the board still builds on
 * forks and local checkouts that never set up sharing.
 *
 * Run: npx tsx src/tools/fetchruns.ts
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

interface InboxRun {
  readonly name: string
  readonly version: number
  readonly seed: number
  readonly actions: unknown[]
}

const ROOT = join(import.meta.dirname ?? __dirname, '..', '..')
const RUNS = join(ROOT, 'runs')

function isRun(x: unknown): x is InboxRun {
  const r = x as InboxRun
  return typeof r === 'object' && r !== null &&
    typeof r.version === 'number' && typeof r.seed === 'number' && Array.isArray(r.actions)
}

/** A run's identity for duplicate-skipping: same seed, same number of moves. */
const fingerprint = (r: { seed: number; actions: unknown[] }) => `${r.seed}:${r.actions.length}`

async function main(): Promise<void> {
  const url = process.env.INBOX_URL
  const token = process.env.INBOX_READ_TOKEN
  if (!url || !token) {
    console.log('fetchruns: no inbox configured (INBOX_URL / INBOX_READ_TOKEN unset) — nothing to collect, board builds from runs/ as-is')
    return
  }

  let inbox: { runs?: unknown[] }
  try {
    const res = await fetch(url, { headers: { authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error(`inbox answered ${res.status}`)
    inbox = (await res.json()) as { runs?: unknown[] }
  } catch (e) {
    // A dead inbox must not take the site down with it — warn and build from what we have.
    console.log(`fetchruns: could not reach the inbox (${e instanceof Error ? e.message : e}) — board builds from runs/ as-is`)
    return
  }
  const pending = (inbox.runs ?? []).filter(isRun)

  // What's already on file, so re-fetched mail doesn't pile up as copies.
  // A file is either one run or a bundle {runs:[...]} — same reading as board.ts.
  const seen = new Set<string>()
  const nextIndex = new Map<string, number>()
  if (existsSync(RUNS)) {
    for (const f of readdirSync(RUNS).filter(f => f.endsWith('.json') && f !== 'verified.json')) {
      const m = /^(.*?)(?:-(\d+))?\.json$/.exec(f)
      if (m) {
        const [, base, n] = m
        nextIndex.set(base, Math.max(nextIndex.get(base) ?? 1, (n ? Number(n) : 1) + 1))
      }
      try {
        const parsed: unknown = JSON.parse(readFileSync(join(RUNS, f), 'utf8'))
        const bundle = (parsed as { runs?: unknown[] }).runs
        for (const run of Array.isArray(bundle) ? bundle : [parsed]) {
          if (isRun(run)) seen.add(fingerprint(run))
        }
      } catch { /* unreadable file — board.ts will report it; not our job */ }
    }
  }

  let fetched = 0
  let skipped = 0
  mkdirSync(RUNS, { recursive: true })
  for (const run of pending) {
    if (seen.has(fingerprint(run))) { skipped++; continue }
    seen.add(fingerprint(run))
    const name = /^[a-z0-9-]{1,24}$/.test(run.name) ? run.name : 'player'
    const n = nextIndex.get(name) ?? 1
    nextIndex.set(name, n + 1)
    const file = `${name}-${n}.json`
    // postedAt: the day the mail was collected — the board's date column.
    // Replay ignores the extra field; only display reads it.
    writeFileSync(join(RUNS, file), JSON.stringify(
      { version: run.version, seed: run.seed, postedAt: new Date().toISOString().slice(0, 10), actions: run.actions },
    ))
    console.log(`fetchruns: ${file} (seed ${run.seed}, ${run.actions.length} actions)`)
    fetched++
  }
  console.log(`fetchruns: ${fetched} new run(s) collected, ${skipped} duplicate(s) skipped, ${pending.length} in the inbox`)
}

main()
