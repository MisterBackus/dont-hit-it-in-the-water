# Setting up run sharing — the ten-minute checklist

Right now the clubhouse board only shows runs that were hand-copied into
`runs/`. This checklist turns on the mailbox: players who finish a season see a
**Post to the clubhouse board** button, and — only if they click it — their
replay lands in a tiny inbox that the next deploy collects and verifies.

Nothing is sent silently. The button sits next to a consent note that says
exactly what leaves the machine, and the call only happens on that click.

## The privacy story (read this once, then relax)

A posted run contains exactly three things:

1. **the seed** — a number that names which season was dealt
2. **the action log** — the moves, i.e. which buttons were pressed in the game
3. **the chosen name** — whatever the player typed, squeezed down to
   `a-z`, `0-9`, and `-` (max 24 characters)

No email, no IP stored with the run, no device info, no personal data. The
consent note shown beside the button says as much. And the board never takes a
run's word for its score: `board.ts` replays every submission through the real
game engine, so only runs that actually happened appear — junk simply fails to
verify and is listed in the fine print instead.

## Step 1 — create a free Cloudflare account (~3 min)

1. Go to <https://dash.cloudflare.com/sign-up> and sign up (free plan; no
   credit card).
2. That's it. Workers + KV free tier is far beyond what this needs.

## Step 2 — deploy the inbox Worker (~4 min)

In a terminal, from the repo root:

```bash
cd workers/board-inbox
npx wrangler login                          # opens the browser, click Allow
npx wrangler kv namespace create RUNS      # prints an id = "...."
```

Copy the `id` it prints into `wrangler.toml`, replacing
`PASTE_KV_NAMESPACE_ID_HERE`. Then:

```bash
npx wrangler secret put READ_TOKEN
```

It will prompt for a value: invent a long random password (a password
manager's generator is perfect) and keep it handy — it's needed once more in
step 4. Then deploy:

```bash
npx wrangler deploy
```

It prints the Worker's URL, something like
`https://board-inbox.<your-subdomain>.workers.dev`. **Copy that URL.**

## Step 3 — point the game at it (~1 min)

Open `src/platform/share.ts` and paste the URL into `SHARE_ENDPOINT`:

```ts
export const SHARE_ENDPOINT = 'https://board-inbox.<your-subdomain>.workers.dev'
```

That single line is the on/off switch — while it's `''`, the share button
hides itself and nothing is ever sent.

## Step 4 — give the deploy job the mailbox key (~2 min)

From the repo root (the `gh` CLI is already signed in):

```bash
gh secret set INBOX_URL --body "https://board-inbox.<your-subdomain>.workers.dev"
gh secret set INBOX_READ_TOKEN --body "<the same random string from step 2>"
```

## Step 5 — ship it

Commit the two edited files (`wrangler.toml` with its namespace id,
`share.ts` with its URL) and push. From then on, every deploy:

1. `fetchruns.ts` asks the inbox for pending runs (using the two secrets) and
   writes them into `runs/` as `<name>-<n>.json`, skipping duplicates
2. `board.ts` replays every run through the real reducer and rebuilds
   `public/board.html` — the board only ever shows replay-verified lines

If the secrets are missing (a fork, a local build), the fetch step prints a
friendly line and does nothing — the board still builds from `runs/` as-is.

## How abuse stays boring

The inbox accepts unauthenticated posts on purpose — a public static page
can't hold a secret, so there's no point pretending. Instead:

- **replay verification is the anti-cheat** — a forged score won't replay,
  so it never reaches the board
- runs over **200KB** are refused; each IP gets **6 posts per minute**
- names are squeezed to `[a-z0-9-]{1,24}` before storage
- everything in the inbox **expires after 60 days** — collected runs live on
  in `runs/`; uncollected junk quietly evaporates
- reading the inbox requires the `READ_TOKEN`, so nobody else can enumerate
  what's been posted
