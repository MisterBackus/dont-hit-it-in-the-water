/**
 * POSTING A SEASON TO THE CLUBHOUSE BOARD.
 *
 * The contract for the finale screen: call postRun with the finished save.
 * Nothing is ever sent silently — the UI must show the consent note
 * (SHARE_NOTE) beside the button that triggers this, and the call is only
 * made on an explicit click. Returns 'off' while no endpoint is configured,
 * so the button can hide itself in local/unconfigured builds.
 *
 * The endpoint is the board inbox (workers/board-inbox): a tiny Cloudflare
 * Worker that holds posted runs until the next deploy collects them
 * (src/tools/fetchruns.ts) and replays every one through the real reducer
 * (src/tools/board.ts). The POST is unauthenticated by design — replay
 * verification, not a secret, is what keeps the board honest, and a public
 * static page couldn't keep a secret anyway. Deploy walkthrough:
 * SETUP-SHARING.md; SHARE_ENDPOINT stays '' until the Worker exists.
 */
export const SHARE_ENDPOINT = 'https://board-inbox.backus13.workers.dev'

export const SHARE_NOTE =
  'Sends this season’s replay (seed + your moves — no personal data) to the clubhouse board.'

export type ShareResult = 'ok' | 'off' | 'fail'

/** The inbox refuses anything larger; refuse locally rather than waste the trip. */
const MAX_BYTES = 200 * 1024

/** Same rule the inbox enforces: lowercase, [a-z0-9-], at most 24 characters. */
function cleanName(raw: string): string {
  const s = raw
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24)
  return s || 'player'
}

export async function postRun(
  save: { version: number; seed: number; actions: unknown[] },
  name: string,
  opts: { abandoned?: boolean } = {},
): Promise<ShareResult> {
  if (!SHARE_ENDPOINT) return 'off'
  const body = JSON.stringify({
    name: cleanName(name),
    version: save.version,
    seed: save.seed,
    actions: save.actions,
    // an abandoned run feeds the instruments and never the board
    ...(opts.abandoned ? { abandoned: true } : {}),
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
