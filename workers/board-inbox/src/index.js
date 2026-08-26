/**
 * THE BOARD INBOX — a mailbox slot for the clubhouse board.
 *
 * The site is a public static page, so this Worker accepts UNAUTHENTICATED
 * posts on purpose. That is safe because the inbox proves nothing: every run
 * that lands here is replayed through the real reducer by src/tools/board.ts
 * before a single pixel of it reaches the board. A forged score simply fails
 * to replay. This Worker's only jobs are to be small, to be free, and to keep
 * abuse boring — size cap, shape check, name sanitizing, a per-IP rate limit,
 * and a 60-day shelf life on everything it holds.
 *
 * Routes:
 *   POST /   body: {name, version, seed, actions[]} ≤ 200KB   → 202 stored
 *   GET  /   Authorization: Bearer <READ_TOKEN>               → {runs:[...]}
 *
 * Bindings (see wrangler.toml + SETUP-SHARING.md):
 *   RUNS        KV namespace holding pending runs
 *   READ_TOKEN  secret; the deploy job presents it to collect the mail
 */

const MAX_BYTES = 200 * 1024 // a full season's action log is far under this
const RUN_TTL_SECONDS = 60 * 60 * 24 * 60 // runs expire after 60 days
const RATE_PER_MINUTE = 6 // posts per IP per minute — a human finishes seasons slower than this

const CORS = {
  'access-control-allow-origin': '*', // the game page lives on github.io
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'content-type, authorization',
}

function reply(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...CORS },
  })
}

/** The same rule the client uses: lowercase, [a-z0-9-], at most 24. */
function cleanName(raw) {
  const s = String(raw ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24)
  return s || 'player'
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })

    // ---- GET: the deploy job collecting the mail (token required) ----
    if (request.method === 'GET') {
      const auth = request.headers.get('authorization') ?? ''
      if (!env.READ_TOKEN || auth !== `Bearer ${env.READ_TOKEN}`) {
        return reply(401, { error: 'read token required' })
      }
      const list = await env.RUNS.list({ prefix: 'run:' })
      const runs = []
      for (const key of list.keys) {
        const value = await env.RUNS.get(key.name, 'json')
        if (value) runs.push(value)
      }
      return reply(200, { runs })
    }

    if (request.method !== 'POST') return reply(405, { error: 'POST a run, or GET with the read token' })

    // ---- POST: a finished season, sent by an explicit click in the game ----
    const ip = request.headers.get('cf-connecting-ip') ?? 'unknown'
    const minute = Math.floor(Date.now() / 60_000)
    const rlKey = `rl:${ip}:${minute}`
    const count = Number((await env.RUNS.get(rlKey)) ?? 0)
    if (count >= RATE_PER_MINUTE) return reply(429, { error: 'easy — one season at a time' })
    await env.RUNS.put(rlKey, String(count + 1), { expirationTtl: 120 })

    const length = Number(request.headers.get('content-length') ?? 0)
    if (length > MAX_BYTES) return reply(413, { error: 'run too large' })
    const text = await request.text()
    if (text.length > MAX_BYTES) return reply(413, { error: 'run too large' })

    let run
    try { run = JSON.parse(text) } catch { return reply(400, { error: 'not JSON' }) }
    if (
      typeof run !== 'object' || run === null ||
      typeof run.version !== 'number' ||
      typeof run.seed !== 'number' ||
      !Array.isArray(run.actions)
    ) {
      return reply(400, { error: 'expected {name, version, seed, actions[]}' })
    }

    const stored = {
      name: cleanName(run.name),
      version: run.version,
      seed: run.seed,
      actions: run.actions,
    }
    // Timestamped key: sorts chronologically, never collides thanks to the suffix.
    const key = `run:${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
    await env.RUNS.put(key, JSON.stringify(stored), { expirationTtl: RUN_TTL_SECONDS })
    return reply(202, { ok: true })
  },
}
