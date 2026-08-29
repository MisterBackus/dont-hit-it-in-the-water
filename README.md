# Don't Hit It In The Water — v0.1 prototype

> © 2026 Andrew Backus. **All rights reserved** — see [LICENSE](LICENSE).
> Public so the game can be read and verified, not so it can be reused.
> Play it, stream it, review it. Do not ship it.

A golf season roguelike deckbuilder. This is the vertical slice: **eight holes at
Pine Hollow, one cut, no season layer.** It exists to answer one question —
*is the hole-level decision fun?*

See `DESIGN.md` and `ARCHITECTURE.md` for the full design. `.cursorrules` is the
contract Cursor works under; read it before letting it touch anything.

## Running it

```bash
npm install
npm run dev          # play it at the URL it prints
```

Other commands:

```bash
npm run balance      # headless: 500 rounds per policy, prints the balance tables
npm run typecheck
npm run build
```

`npm run balance` is the important one. Any change to a club distance, a spread,
a technique or a hole shape should be followed by a balance run — the numbers in
DESIGN.md were calibrated by simulation, not by feel.

## What's in and what's out

**In:** nine clubs with real gaps, six techniques, the focus economy, aim, bounded
cone dispersion, lies and hazards, putting, eight holes, a cut after four.

**Out for now:** the season, the Money List, fatigue, entourage, sponsors,
statuses, meta-progression, more than one course. All specified in DESIGN.md,
none of it built.

## The one architectural rule

`src/sim/` and `src/content/` are pure TypeScript — no React, no DOM, no
`Math.random`, no `Date.now`. That is what lets `npm run balance` play thousands
of rounds headlessly, and what makes a Tauri or Capacitor port a UI job rather
than a rewrite. ESLint enforces it. Don't disable the rule.
