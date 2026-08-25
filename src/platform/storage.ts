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

export const SAVE_VERSION = 1
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
