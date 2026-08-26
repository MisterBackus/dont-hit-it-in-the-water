/**
 * All persistence lives here — sim/ never touches storage (ARCHITECTURE §0).
 *
 * A save is the seed plus the action log, NOT a state snapshot (§9): loading
 * replays the log through the reducer, and the determinism test is what
 * guarantees the replay IS the run. That buys three things at once — saves a
 * few kilobytes big, runs that can be shared as a seed and a list of moves,
 * and bug reports that reproduce exactly.
 *
 * SAVE_VERSION must be bumped whenever the reducer's observable behaviour
 * changes: an old log replayed through a new reducer is a different run. A
 * mismatched or unreadable save is discarded, not migrated — prototype-era
 * policy (§9); migrations come before release, or a frozen reducer does.
 */
import type { Action } from '../sim/reducer'

export const SAVE_VERSION = 7 // v7: the weeks redesign — the draw is biased early, silent at majors and from event 10, and a sponsor expires after three events, so a v6 log replays as a different run // v6: encounters after the cut — a v5 log has no ENGAGE/WALK_ON and one made cut in three now stops at the fifth tee // v5: ten-course pool + new pins reshuffle every seed's schedule // v4: the schedule rotation — events draw courses from the pool, so a v3 log replays as a different run
const KEY = 'dont-hit-it-in-the-water/save'

export interface SaveFile {
  readonly version: number
  readonly seed: number
  readonly actions: readonly Action[]
}

export function loadSave(): SaveFile | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SaveFile
    if (parsed.version !== SAVE_VERSION) return null
    if (typeof parsed.seed !== 'number' || !Array.isArray(parsed.actions)) return null
    return parsed
  } catch {
    return null // private mode, quota, corrupt JSON — all read as "no save"
  }
}

export function persistSave(seed: number, actions: readonly Action[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: SAVE_VERSION, seed, actions }))
  } catch {
    // storage full or unavailable — the game plays on, it just won't survive a refresh
  }
}

export function clearSave(): void {
  try { localStorage.removeItem(KEY) } catch { /* as above */ }
}

/**
 * THE ARCHIVE — no season is ever destroyed by starting another.
 *
 * Learned the hard way in the first playtest: friends played whole seasons
 * and restarted, and every restart overwrote the only record. Now RESTART
 * files the outgoing run here first. Local-only like everything else — the
 * game never phones home — but one "Copy all my seasons" carries the whole
 * archive in a single paste. Capped to the newest 40 runs for quota sanity.
 */
const ARCHIVE_KEY = 'dont-hit-it-in-the-water/archive'
const ARCHIVE_CAP = 40

export function archiveRun(seed: number, actions: readonly Action[]): void {
  if (actions.length < 5) return // an untouched season is not a season
  try {
    const arch = loadArchive()
    arch.push({ version: SAVE_VERSION, seed, actions })
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(arch.slice(-ARCHIVE_CAP)))
  } catch { /* quota or unavailable — the live save still stands */ }
}

export function loadArchive(): SaveFile[] {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
