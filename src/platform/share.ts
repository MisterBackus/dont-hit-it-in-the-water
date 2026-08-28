/**
 * SENDING A SEASON — to the clubhouse board, and to the instruments.
 *
 * These are two different things and this file keeps them apart:
 *
 *   postRun    the BOARD. Named, explicit, one click on the finale screen.
 *              The owner's ruling stands — "i dont see anyone sharing a
 *              shitty run" — so nothing reaches the public board that a
 *              player did not put there on purpose, under a name they chose.
 *
 *   reportRun  the INSTRUMENTS. Anonymous, automatic, and flagged so the
 *              board never ranks it. This is the half the intro has always
 *              promised ("seasons you finish or give up on are sent
 *              anonymously") and the half the code did not do: the finale
 *              post was wired to the board button, so a player who finished
 *              and closed the tab sent nothing, and a player who bounced in
 *              the first five minutes — the single most important thing to
 *              measure — sent nothing either.
 *
 * WHY A BEACON. The question the instruments cannot ask is "where does the
 * game lose somebody", and the answer is almost never "at the button marked
 * Give up the season". It is a closed tab. navigator.sendBeacon exists for
 * exactly this: the browser takes the payload and delivers it after the page
 * is gone. A fetch() at pagehide is cancelled with the document.
 *
 * The endpoint is the board inbox (workers/board-inbox): a tiny Cloudflare
 * Worker that holds posts until the next deploy collects them
 * (src/tools/fetchruns.ts) and replays every one through the real reducer
 * (src/tools/board.ts). The POST is unauthenticated by design — replay
 * verification, not a secret, is what keeps the board honest, and a public
 * static page couldn't keep a secret anyway. Deploy walkthrough:
 * SETUP-SHARING.md; SHARE_ENDPOINT stays '' until the Worker exists.
 */

/** injected by vite.config.ts from the git sha — 'dev' in a bare dev server */
declare const __BUILD__: string

export const SHARE_ENDPOINT = 'https://board-inbox.backus13.workers.dev'

export const SHARE_NOTE =
  'Sends this season’s replay (seed + your moves — no personal data) to the clubhouse board.'

export type ShareResult = 'ok' | 'off' | 'fail'

/**
 * Which build produced this run. Balance moves between deploys, and a
 * thousand runs spanning four different games support no conclusion at all —
 * this is what lets runstats separate the cohorts instead of blending them.
 */
export const BUILD: string = typeof __BUILD__ === 'string' ? __BUILD__ : 'dev'

/** Why the run ended. 'left' is the tab-closer — the one we could never see. */
export type EndReason = 'finished' | 'abandoned' | 'left'

/** The inbox refuses anything larger; refuse locally rather than waste the trip. */
const MAX_BYTES = 200 * 1024

/** At most this much player prose per report; the inbox enforces it too. */
export const MAX_NOTE = 1000

/**
 * The archive's own floor (storage.ts): somebody who opens the page and
 * closes it is not a data point, they are a bounce with no season in it.
 */
const MIN_ACTIONS = 5

/** Same rule the inbox enforces: lowercase, [a-z0-9-], at most 24 characters. */
function cleanName(raw: string): string {
  const s = raw
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24)
  return s || 'player'
}

interface Save { version: number; seed: number; actions: unknown[] }

/**
 * A RUN'S IDENTITY. Not the seed: START_SEED is a constant, so every player's
 * first season in a fresh browser has the SAME seed, and collapsing reports by
 * seed would fold thousands of strangers' opening seasons into one. This is a
 * random token minted per run, carried on the report envelope only — never in
 * the action log, so replay is untouched — and it is what lets the courier
 * keep the longest report of a run and throw the prefixes away.
 */
export function newRunId(): string {
  try {
    return crypto.randomUUID().slice(0, 12)
  } catch {
    return Math.floor(Math.random() * 1e12).toString(36)
  }
}

function envelope(
  save: Save,
  extra: Record<string, unknown>,
): string {
  return JSON.stringify({
    version: save.version, seed: save.seed, actions: save.actions,
    build: BUILD, ...extra,
  })
}

/**
 * THE BOARD. Named and deliberate: only ever called from a click.
 * `board: true` is what tells the courier this one is allowed to be ranked.
 */
export async function postRun(
  save: Save,
  name: string,
  opts: { note?: string } = {},
): Promise<ShareResult> {
  if (!SHARE_ENDPOINT) return 'off'
  const body = envelope(save, {
    name: cleanName(name), board: true, reason: 'finished' satisfies EndReason,
    ...(opts.note ? { note: opts.note.slice(0, MAX_NOTE) } : {}),
  })
  if (body.length > MAX_BYTES) return 'fail'
  try {
    const res = await fetch(SHARE_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      signal: AbortSignal.timeout(10_000),
    })
    return res.ok ? 'ok' : 'fail'
  } catch {
    return 'fail'
  }
}

/**
 * Reports already sent, as `runId:actionCount`. A page can be hidden many
 * times in one season — every tab switch on desktop, every app switch on a
 * phone — and a season that has not moved since the last report is the same
 * season. Without this, one player tabbing back and forth would spend the
 * inbox's whole rate limit re-sending an identical log.
 */
const reported = new Set<string>()

/**
 * THE INSTRUMENTS. Anonymous, unnamed, never ranked, and safe to call from a
 * pagehide handler. Returns false when there was nothing worth sending.
 */
export function reportRun(
  save: Save, reason: EndReason, runId: string, note?: string,
): boolean {
  if (!SHARE_ENDPOINT) return false
  if (save.actions.length < MIN_ACTIONS) return false
  const fingerprint = `${runId}:${save.actions.length}`
  if (reported.has(fingerprint)) return false

  const body = envelope(save, {
    reason, runId,
    ...(note ? { note: note.slice(0, MAX_NOTE) } : {}),
  })
  if (body.length > MAX_BYTES) return false
  reported.add(fingerprint)

  // sendBeacon survives the page going away; fetch does not. Fall back to a
  // keepalive fetch where it is missing or refuses (it can, when the browser's
  // background transfer budget is already spent).
  try {
    const blob = new Blob([body], { type: 'application/json' })
    if (navigator.sendBeacon?.(SHARE_ENDPOINT, blob)) return true
  } catch { /* fall through */ }
  try {
    void fetch(SHARE_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {})
    return true
  } catch {
    return false
  }
}
