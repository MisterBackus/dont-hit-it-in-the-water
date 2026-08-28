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
  /** a season somebody walked away from — instruments yes, board no */
  readonly abandoned?: boolean
  /** the player pressed Share under a name they chose; the rest is instruments */
  readonly board?: boolean
  /** 'finished' | 'abandoned' | 'left' — 'left' is a closed tab */
  readonly reason?: string
  /** the git sha of the build that produced it, so cohorts can be separated */
  readonly build?: string
  /** per-run token; the seed is NOT unique across players (see below) */
  readonly runId?: string
  /** what the player typed in the box on the finale screen */
  readonly note?: string
}

const ROOT = join(import.meta.dirname ?? __dirname, '..', '..')
const RUNS = join(ROOT, 'runs')
const FEEDBACK = join(ROOT, 'feedback')

function isRun(x: unknown): x is InboxRun {
  const r = x as InboxRun
  return typeof r === 'object' && r !== null &&
    typeof r.version === 'number' && typeof r.seed === 'number' && Array.isArray(r.actions)
}

/** A run's identity for duplicate-skipping: same seed, same number of moves. */
const fingerprint = (r: { seed: number; actions: unknown[] }) => `${r.seed}:${r.actions.length}`

/**
 * COLLAPSING PARTIAL REPORTS. A report now fires every time the tab is hidden,
 * so one season can arrive several times over — each copy a prefix of the next.
 * Only the longest is worth keeping.
 *
 * Grouping by SEED would be wrong and quietly destructive: START_SEED is a
 * constant, so every player's first season in a fresh browser carries the same
 * seed, and collapsing on it would fold thousands of different strangers'
 * opening seasons into one. runId is the per-run token that makes this safe.
 * Reports without one (a board submission, or anything from an older build)
 * are left alone.
 */
function longestPerRun(runs: readonly InboxRun[]): InboxRun[] {
  const best = new Map<string, InboxRun>()
  const loose: InboxRun[] = []
  for (const r of runs) {
    if (!r.runId) { loose.push(r); continue }
    const prev = best.get(r.runId)
    if (!prev || r.actions.length > prev.actions.length) best.set(r.runId, r)
  }
  return [...loose, ...best.values()]
}

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
  const pending = longestPerRun((inbox.runs ?? []).filter(isRun))

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
  const notes: { file: string; reason: string; build?: string; note: string }[] = []
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
      {
        version: run.version, seed: run.seed,
        postedAt: new Date().toISOString().slice(0, 10),
        // Only a deliberate board submission is rankable. Everything else —
        // including a season that simply ended — carries the flag board.ts
        // already filters on, so the board still ranks only what players chose
        // to publish under a name.
        ...(run.board ? {} : { abandoned: true }),
        ...(run.reason ? { reason: run.reason } : {}),
        ...(run.build ? { build: run.build } : {}),
        actions: run.actions,
      },
    ))
    console.log(`fetchruns: ${file} (seed ${run.seed}, ${run.actions.length} actions, ${run.reason ?? 'finished'})`)
    fetched++
    if (run.note) notes.push({ file, reason: run.reason ?? 'finished', build: run.build, note: run.note })
  }

  /**
   * PLAYER MAIL. Notes are prose a person typed, not data to replay, so they
   * do not belong in runs/ where every file is fed to the reducer. They land
   * in feedback/ next to the file the note came with, newest last, and nobody
   * has to go digging in a KV store to read them.
   */
  if (notes.length) {
    mkdirSync(FEEDBACK, { recursive: true })
    const out = join(FEEDBACK, 'notes.json')
    let prior: unknown[] = []
    try { prior = JSON.parse(readFileSync(out, 'utf8')) as unknown[] } catch { prior = [] }
    const seenNotes = new Set(prior.map(n => JSON.stringify(n)))
    const fresh = notes.filter(n => !seenNotes.has(JSON.stringify(n)))
    writeFileSync(out, JSON.stringify([...prior, ...fresh], null, 2))
    console.log(`fetchruns: ${fresh.length} new note(s) -> feedback/notes.json`)
  }

  console.log(`fetchruns: ${fetched} new run(s) collected, ${skipped} duplicate(s) skipped, ${pending.length} in the inbox`)
}

main()
