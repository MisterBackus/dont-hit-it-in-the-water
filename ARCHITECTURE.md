# ARCHITECTURE

### Don't Hit It In The Water — technical foundation

**Updated 25 Aug 2026 · as built, 56 tests passing**

**Version 0.1 · Companion to `DESIGN.md` · Authoritative for Cursor**

---

## 0. The one rule

> **`src/sim/` is pure TypeScript. It does not know that React, the DOM, or a screen exist.**

Everything else in this document is a consequence of that sentence. It is worth stating why, because it will feel like pointless ceremony the first time it makes something inconvenient:

- **Porting becomes a UI rewrite instead of a game rewrite.** Tauri for desktop and Steam, Capacitor for mobile — both are wrappers around the same simulation. If game rules leak into components, every port is a from-scratch reimplementation and the answer to "can this be ported later" quietly becomes no.
- **The balance harness (§7.2) needs to play 8,000 seasons headlessly.** It cannot render anything. The numbers in `DESIGN.md` came out of exactly this, and they will need re-running every time a card changes.
- **Pure functions are trivially testable.** No mounting, no mocking, no test renderer.

The boundary is enforced by lint, not by good intentions — see §8.

---

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| Language | **TypeScript**, `strict: true` | The types are the spec Cursor works against. Non-negotiable. |
| Build | **Vite** | Instant hot reload. The 30–40s-per-hole target in `DESIGN.md` is a UI budget — you need to feel changes immediately. |
| UI | **React 18** | Widest AI training coverage, which materially improves generated-code quality. |
| Sim state | **Immer** | Lets reducers be written in mutating style while producing immutable results. Kills an entire class of "I forgot to copy the array" bugs. Pure JS, no DOM — safe inside `sim/`. |
| Tests | **Vitest** | Same config as Vite, no extra setup. |
| Lint | **ESLint** + `no-restricted-imports` | This is what actually enforces §0. |
| Styling | **CSS Modules** | No runtime, no build magic, no dependency that a port has to carry. |

**Deliberately not used:** any game engine, any state library (Redux/Zustand/Jotai — the reducer *is* the store), any animation framework until we have proven we need one, any CSS framework.

**Single package, not a monorepo.** Folder boundaries plus lint rules give the isolation without the tooling overhead. If `sim/` ever needs to ship separately, it gets promoted to a real package then, and the import graph is already correct.

---

## 2. Folder layout

As shipped. (The speculative version of this section is gone — several files it
predicted, `actions.ts`, `selectors.ts`, `hole.ts`, `tournament.ts`, were never
needed, and several it did not predict became load-bearing.)

```
src/
  sim/                 ← PURE. no react, no DOM, no I/O, no Math.random, no Math.sin
    types.ts             core interfaces — cards, cones, holes, boosts
    rng.ts               seeded PRNG + named streams
    deck.ts              shuffle and draw
    state.ts             GameState, Phase, initial state, course selectors
    reducer.ts           (State, Action) => State — the whole game
    effects.ts           the card-effect interpreter and buildCone
    geometry.ts          yard-space: surfaces, corridor, distance
    resolve/
      shot.ts            cone + lie + aim → pitch, run-out, landing
      putt.ts            feet → strokes, and the price of holing one
      field.ts           the 71 other players, the board, and the cut
    deck.test.ts         49 tests — rules, economy, season, a full scripted run
    shot.test.ts         7 tests — geometry, the cone contract (P8)
  content/             ← DATA ONLY. no logic. this is where volume work happens.
    cards.ts             shots, techniques, rewards, the free shot
    boosts.ts            equipment and superstitions
    shop.ts              prices
    weeks.ts             the five off weeks
    season.ts            fourteen events, the cut curve, payouts, the Money List
    players.ts           invented names for the field
    courses/
      pinehollow.ts      cottonwood.ts  rockdale.ts
  ui/                  ← React. reads state, dispatches actions. knows NO rules.
    App.tsx  HoleView.tsx  Cards.tsx  Leaderboard.tsx
    scale.ts             the single yards→pixels conversion (§4.2)
    styles.css
  tools/               ← headless, node-only. one instrument per argument.
    policy.ts            scripted players at three risk appetites
    balance.ts           scoring, per hole and per policy
    deckcheck.ts         does deckbuilding change anything
    seasoncheck.ts       do the difficulty curves cross correctly
    cutcheck.ts          where you stand after four holes, and the N curve
    moneycheck.ts        Money List thresholds by conditional kill rate
    pursecheck.ts        where a season's money comes from
    shopcheck.ts         what every boost and every card cut is worth
    coursecheck.ts       a course's scoring, spread, decisions and softlocks
    solve.ts             does this hand have a line to par
  main.tsx
```

**Reading the layout as a dependency rule:** `ui/` may import from `sim/` and `content/`. `sim/` may import from `content/` and other `sim/` files. **`sim/` may never import from `ui/`, `platform/`, or `main.tsx`.** Arrows point one way only.

---

## 3. Determinism

A roguelike that can't reproduce a run can't be debugged, can't offer daily challenges, and can't accept a useful bug report. Determinism is a feature, not hygiene.

### 3.1 Seeded PRNG

`Math.random()` is banned in `sim/` — lint-enforced. All randomness comes from an RNG value carried *inside* state, so it serializes with the save.

```ts
// sim/rng.ts
export interface RngState { readonly s: number }

export function makeRng(seed: number): RngState {
  return { s: seed >>> 0 }
}

/** mulberry32 — small, fast, good enough, and trivially serializable. */
export function next(rng: RngState): [number, RngState] {
  let t = (rng.s + 0x6D2B79F5) >>> 0
  let r = t
  r = Math.imul(r ^ (r >>> 15), r | 1)
  r ^= r + Math.imul(r ^ (r >>> 7), r | 61)
  const value = ((r ^ (r >>> 14)) >>> 0) / 4294967296
  return [value, { s: t }]
}
```

Note the signature: `next` returns the value **and the new RNG state**. It never mutates. This is deliberately slightly annoying to call, because that annoyance is what stops randomness from leaking into places it shouldn't.

### 3.2 Named streams — the non-obvious part

With a single global RNG, adding one new random call anywhere shifts every subsequent roll. A seed that produced a good run yesterday produces a different run today, replays break, and the balance harness stops being comparable across builds.

**Fix: independent streams, one per concern.**

```ts
export type Stream = 'shot' | 'putt' | 'draw' | 'field' | 'events' | 'loot'

// NB: a mapped type must be a `type`, not an `interface` — TS7061 otherwise.
export type RngBank = { readonly [K in Stream]: RngState }

export function seedBank(seed: number): RngBank {
  // hash the seed with a per-stream salt so streams are uncorrelated
  return {
    shot:   makeRng(hash(seed, 1)),
    putt:   makeRng(hash(seed, 2)),
    draw:   makeRng(hash(seed, 3)),
    field:  makeRng(hash(seed, 4)),
    events: makeRng(hash(seed, 5)),
    loot:   makeRng(hash(seed, 6)),
  }
}
```

Now adding a new card-draw roll cannot perturb shot outcomes. Streams drift independently, and a change to one system stays contained to that system.

### 3.3 Float determinism

Replays must reproduce across browsers and inside Tauri. IEEE-754 arithmetic is consistent, but **`Math.sin`, `Math.cos`, `Math.pow` and friends are not guaranteed identical across JS engines.**

**Rule:** no transcendental functions in `sim/`. Shot dispersion uses a uniform or triangular distribution, not a Gaussian built from `Math.log`/`Math.cos`. If we ever genuinely need a bell curve, use a sum-of-uniforms approximation, which is pure arithmetic and deterministic everywhere.

---

## 4. Yard space

### 4.1 The sim thinks in yards, always

Ball position is a 2D point in yards:

```ts
export interface Point {
  /** yards from the tee, along the hole's centerline */
  down: number
  /** yards left (−) or right (+) of the centerline */
  side: number
}
```

A hole is a length, a par, and a list of regions — polygons in that same yard space:

```ts
export type Surface = 'fairway' | 'rough' | 'deep' | 'bunker' | 'water' | 'trees' | 'green' | 'ob'

export interface Region {
  surface: Surface
  /** polygon in yard space, ordered */
  poly: Point[]
}

export interface Hole {
  id: string
  par: 3 | 4 | 5
  length: number
  pin: Point
  regions: Region[]   // later regions win on overlap
  wind?: { speed: number; dir: number }
}
```

Surface lookup is a point-in-polygon test over `regions`, last match wins. That's the whole geometry engine, and it's about forty lines.

### 4.2 One conversion function, and only one

`DESIGN.md` §7.0 states a hard requirement: **cones and hole diagrams must share a scale, or the picture is lying to the player.**

Architecturally that is guaranteed by making it impossible to do otherwise. There is exactly one yards→pixels conversion in the codebase:

```ts
// ui/scale.ts — the ONLY place yards become pixels
export interface Scale { pxPerYardDown: number; pxPerYardSide: number; originX: number; originY: number }

export function project(p: Point, s: Scale): { x: number; y: number } {
  return {
    x: s.originX + p.side * s.pxPerYardSide,
    y: s.originY - p.down * s.pxPerYardDown,
  }
}
```

The hole diagram projects its regions through `project`. The cone overlay projects its polygon through `project`. **They cannot drift, because there is no second code path that could drift.** Any component computing its own pixel positions from yardages is a bug, and it's the kind of bug that silently makes the game unfair rather than making it crash — so it gets called out here.

> Lateral scale may legitimately differ from downrange scale (a 450-yard hole is not 450 yards wide on screen). That's fine and normal for a plan view. What matters is that *every* drawn element uses the same `Scale` object.

---

## 5. State and actions

### 5.1 Shape

**Flat, not nested.** The design predicted `season / tournament / round / hole`
sub-objects with null-guards and asserting selectors. In practice one flat
object with a phase tag was simpler to reason about and made the reducer
readable, and the null-guard selectors never had to be written.

```ts
export interface GameState {
  seed: number; rng: RngBank; phase: Phase
  event: number                     // 1..14
  earnings: number; spent: number
  lastPlace: number; lastPaid: number
  keptJob: boolean | null
  focus: number
  hole: HoleState                   // index, ball, lie, strokes, puttFeet
  scores: readonly number[]
  deck: readonly string[]           // drawn from the top
  hand: readonly string[]
  discard: readonly string[]
  selectedShot: string | null
  selectedTechs: readonly string[]
  aim: AimChoice
  madeCut: boolean | null
  cutLine: number | null            // what it took, for the cut screen
  cutAdvanced: number | null        // how many made it, once ties are honoured
  cutsMade: number; cutsMissed: number
  offer: readonly ShopItem[]        // the pro shop this week
  cutIsPaid: boolean
  weekOptions: readonly string[]
  pendingWeek: string | null        // armed, not confirmed
  practice: number; focusPenalty: number; skipped: number
  boosts: readonly string[]; boostOffer: readonly string[]
  freeSinks: number
  field: readonly FieldPlayer[]
  log: readonly ShotLogEntry[]
  lastShot: string | null
  justShuffled: boolean
}

export type Phase =
  | 'intro' | 'schedule'
  | 'playing' | 'shot' | 'holed'
  | 'cut' | 'boost' | 'shop' | 'remove'
  | 'payout' | 'moneylist' | 'over'
```

`pendingWeek` is worth calling out as an architecture note rather than a UI one.
An off week is the most irreversible action in the game, and "armed but not
confirmed" is *state*, not a component's local flag — because the reducer has to
be the thing that clears it when the player tees off instead.

### 5.2 Actions are the complete API

```ts
export type Action =
  | { type: 'START' }
  | { type: 'SELECT_SHOT'; id: string }
  | { type: 'TOGGLE_TECH'; id: string }
  | { type: 'SET_AIM'; aim: AimChoice }
  | { type: 'COMMIT' }
  | { type: 'PUTT'; sink: boolean }
  | { type: 'NEXT' }
  | { type: 'REDRAW' }
  | { type: 'TEE_OFF' }
  | { type: 'BUY'; index: number }
  | { type: 'BUY_CUT' }
  | { type: 'REROLL' }
  | { type: 'LEAVE_SHOP' }
  | { type: 'REMOVE_CARD'; id: string | null }
  | { type: 'TAKE_BOOST'; id: string }
  | { type: 'PICK_WEEK'; id: string | null }
  | { type: 'TAKE_WEEK'; id: string }
  | { type: 'RESTART'; seed: number }
```

**Every state change in the game goes through this union.** If the UI needs to
change state and there's no action for it, the answer is to add an action —
never to mutate state from a component.

`SELECT_SHOT` / `TOGGLE_TECH` / `SET_AIM` are separate from `COMMIT` because
techniques deform the cone *on screen, before the player commits*. The UI needs a
state where a plan is staged and its cone is previewable but nothing has been
rolled.

`PICK_WEEK` / `TAKE_WEEK` are separate for the same class of reason, arrived at
the hard way: arming and confirming are different events, and a playtester
signing a season-long debuff by mis-click is what proved it.

### 5.3 The reducer

```ts
// sim/reducer.ts
import { produce } from 'immer'

export function reduce(state: GameState, action: Action): GameState {
  return produce(state, draft => {
    switch (action.type) {
      case 'COMMIT_SHOT': commitShot(draft); break
      // ...
    }
  })
}
```

Immer means `commitShot` can write `draft.hole.ball = landing` and still get an immutable result. **Rule: reducers and their helpers must be synchronous and side-effect free.** No `fetch`, no timers, no logging to console, no storage writes. If something needs to happen outside, the reducer records it in `state.log` and the UI reacts.

---

## 6. Content is data

### 6.1 Why this is an architecture decision, not a style preference

The plan in `DESIGN.md` needs dozens of clubs, techniques, composure cards and entourage members. That is exactly the bulk pattern work Cursor is good at — **but only if adding a card means adding a data row, not writing a class.**

```ts
// content/clubs.ts
export const CLUBS: ClubCard[] = [
  { id: 'driver',  name: 'Driver',  kind: 'club', carry: 265, spread: 25,
    lies: ['tee'] },
  { id: 'iron_7',  name: '7-Iron',  kind: 'club', carry: 160, spread: 8,
    lies: ['tee','fairway','rough'] },
]
```

`spread` is the half-width of the cone in yards. **It is never called `dispersion` in anything the player sees** (`DESIGN.md` §4.1) — but the code name should stay honest, so `spread` it is, and the UI renders it as a shape rather than a number.

### 6.2 Effects as tagged data

Card effects are the one place where "data not code" gets hard. Solution: a small fixed vocabulary of operations, interpreted at runtime.

```ts
export type Effect =
  | { op: 'addCarry';    value: number }
  | { op: 'scaleCarry';  value: number }
  | { op: 'scaleSpread'; value: number }
  | { op: 'shiftAim';    value: number }
  | { op: 'ignoreWind' }
  | { op: 'ignoreHazards' }
  | { op: 'restrictLies'; lies: Lie[] }
  | { op: 'addFocus';    value: number }

// content/techniques.ts
{ id: 'smooth_it', name: 'Smooth It', kind: 'technique', cost: { focus: 1 },
  effects: [{ op: 'addCarry', value: -15 }, { op: 'scaleSpread', value: 0.5 }] }

{ id: 'rip_it', name: 'Grip It & Rip It', kind: 'technique', cost: { focus: 1 },
  effects: [{ op: 'addCarry', value: 40 }, { op: 'scaleSpread', value: 2.0 }] }
```

`sim/effects.ts` holds one `switch` over `op`. **Adding a card that uses existing ops is a data edit and touches zero logic.** A genuinely new mechanic adds one `op` and one `case`, and the type system lists every site that needs updating.

This is the single most important thing for making the Cursor workflow productive, and it's also what makes balance tuning a matter of editing numbers rather than reading code.

---

## 7. Testing

### 7.1 Unit tests

Everything in `sim/` is a pure function, so tests need no scaffolding:

```ts
test('smooth it narrows the cone and shortens the shot', () => {
  const base = { carry: 160, spread: 8 }
  const out = applyEffects(base, TECHNIQUES.smooth_it.effects)
  expect(out).toEqual({ carry: 145, spread: 4 })
})

test('a seeded run is byte-identical when replayed', () => {
  const a = replay(42, ACTIONS)
  const b = replay(42, ACTIONS)
  expect(a).toEqual(b)
})
```

That second test is the one that protects determinism. It should exist from the first commit.

### 7.2 The balance harness — now ten of them

`DESIGN.md` §3.2 says: *"Do not adjust these by feel — re-run the simulation."*
That instruction is only real if re-running is one command.

```
npx tsx src/tools/shopcheck.ts        # the Money List, and what equipment is worth
npx tsx src/tools/coursecheck.ts      # a course: scoring, spread, decisions, softlocks
npx tsx src/tools/cutcheck.ts         # the cut curve
```

Every tool imports `sim/` directly, plays whole seasons with a scripted policy,
renders nothing, and prints the table that settles one argument. **One instrument
per argument** turned out to matter more than one general harness: when the
answer is wrong you need to know which instrument lied.

**Three things learned about harnesses, all expensively:**

1. **A harness can be confidently wrong.** `policy.ts` built candidate cones
   *without the player's own equipment*, then played the shot with it — so Super
   Ball, which adds 10% to every carry, measured at minus $1.32M a season purely
   from overshooting. Every shop price derived from that number was wrong.
2. **A stand-in is not the thing.** Equipment modelled as a flat "cones 12%
   tighter" said shopping lost to hoarding at every price. The real boosts said
   the opposite by a factor of three to twenty.
3. **A harness cannot find a model error**, because it *is* the model. It happily
   "played" a softlocked position, and it never noticed a cone fanning 45° on a
   21-yard chip. Both were found by a human looking at the screen.

**This is a permanent tool, not a one-off script.** Every content or number
change should be followed by the relevant run, and its output belongs in the
commit message when calibrated numbers move.

## 8. Enforcing the boundary

Good intentions do not survive a long session of AI-assisted coding. The rule is mechanical:

This exact config was run against a deliberately non-compliant file before being written down. It catches all eight violations, passes a compliant `sim/` file, and correctly leaves `ui/` alone:

```js
// eslint.config.js  (ESLint 9+ flat config — verified working)
import tsParser from '@typescript-eslint/parser'

const purity = {
  'no-restricted-imports': ['error', {
    patterns: [
      { group: ['react', 'react-*', '**/ui/**', '**/platform/**'],
        message: 'sim/ and content/ must stay pure — no UI, no I/O. See ARCHITECTURE.md §0.' },
    ],
  }],
  'no-restricted-globals': ['error',
    { name: 'window',       message: 'No DOM in sim/. See ARCHITECTURE.md §0.' },
    { name: 'document',     message: 'No DOM in sim/. See ARCHITECTURE.md §0.' },
    { name: 'localStorage', message: 'Persistence belongs in platform/storage.ts.' },
  ],
  'no-restricted-properties': ['error',
    { object: 'Math', property: 'random',
      message: 'Use the seeded RNG from state. See ARCHITECTURE.md §3.1.' },
    { object: 'Date', property: 'now',
      message: 'Wall-clock time breaks replay determinism. §3.1' },
    { object: 'Math', property: 'sin', message: 'Not float-deterministic across engines. §3.3' },
    { object: 'Math', property: 'cos', message: 'Not float-deterministic across engines. §3.3' },
  ],
}

export default [
  // the parser block is required — without languageOptions the config throws on .ts files
  { files: ['**/*.ts', '**/*.tsx'],
    languageOptions: { parser: tsParser, ecmaVersion: 2022, sourceType: 'module' } },
  { files: ['src/sim/**/*.ts', 'src/content/**/*.ts'], rules: purity },
]
```

Verified output against a file importing React, importing from `ui/`, and calling `Math.random`, `Date.now`, `Math.sin`, `Math.cos`, `window` and `localStorage`:

```
✖ 8 problems (8 errors, 0 warnings)
```

...with a compliant `sim/` file and a `ui/` file using `Math.random` both exiting clean, confirming the rules are correctly scoped.

CI runs `lint`, `typecheck`, and `test` on every push. A violation is a failed build, not a code-review conversation.

---

## 9. Save, replay, and bug reports

A save is **the seed plus the action log** — not a state snapshot.

```ts
export interface SaveFile {
  version: number
  seed: number
  actions: Action[]
}
```

Loading replays the actions through the reducer. This gives three things for free:

1. **Tiny saves.** A full season is a few kilobytes of JSON.
2. **Replays and shareable runs.** A seed plus an action log is a complete recording.
3. **Real bug reports.** "It crashed" becomes a file that reproduces the crash exactly on my machine. For a project where the person finding the bugs isn't the person fixing them, this is worth a lot.

**The cost:** action-log saves break when the reducer's behaviour changes. Hence `version`. During prototyping, bumping the version and invalidating old saves is fine and expected. Before release we either freeze the reducer or write migrations.

**All persistence goes through `platform/storage.ts`**, an interface with a `localStorage` implementation for web and a filesystem implementation for Tauri. `sim/` never touches it.

---

## 10. Ports

Because `sim/` is pure and `ui/` is React, both target platforms are wrappers rather than rewrites:

| Target | Path | Notes |
|---|---|---|
| **Web** | Vite build → any static host | The development target. itch.io takes the folder directly. |
| **Desktop / Steam** | **Tauri** | Rust shell around the web build. Small binary, real native window, Steam-shippable. Swap in the filesystem `storage` implementation. |
| **Mobile** | **Capacitor** | Same bundle in a native shell. UI needs a touch pass; the sim needs nothing. |

The port work is: a `storage` implementation, a build config, and input/layout adjustments. **No game logic moves.** That is the entire return on §0, and it's why the inconvenient rule is worth keeping on the days it's inconvenient.

---

## 11. Build order for v0.1

Matching the vertical slice in `DESIGN.md` §12 — *is the hole-level decision fun?* — in dependency order:

1. `sim/types.ts`, `sim/rng.ts` + the replay-determinism test
2. `sim/geometry.ts` — yard space, point-in-polygon, surface lookup
3. `content/clubs.ts` — nine clubs
4. `sim/effects.ts` + `content/techniques.ts` — six techniques
5. `sim/resolve/shot.ts` — the core roll
6. `sim/resolve/putt.ts` — the probability table
7. `sim/reducer.ts` — hole lifecycle only
8. `tools/balance.ts` — sanity-check scoring distributions **before building any UI**
9. `ui/scale.ts` + the hole diagram
10. The card hand and the cone preview
11. Wire eight holes, a cut, a payout

**Step 8 sits before the UI on purpose.** If the hole produces nonsense scoring distributions, that's much cheaper to find in a terminal than through a half-built interface.

---

## 12. Conventions

- **Files:** `camelCase.ts` for modules, `PascalCase.tsx` for components.
- **No default exports** anywhere except React components. Named exports survive renaming and refactoring far better, and they're clearer in AI-generated diffs.
- **`readonly` on every interface field in `sim/`.** Immer handles the writes; everything else should be prevented from trying.
- **No `any`.** `unknown` plus narrowing where a type is genuinely open.
- **Comments explain *why*, never *what*.** The types already say what.
- **Yardages are numbers in yards.** No unit-suffixed variable names, no unit conversions outside `ui/scale.ts`.

---

## 13. Open technical questions

1. **Aim as a player input.** `PLAY_CLUB` currently carries an `aim` offset. Is aiming a dial the player sets, or does the game always aim at the sensible target? A dial adds depth and a lot of UI; auto-aim is simpler and might be enough given the cone already carries the risk decision.
2. **Cone rendering.** SVG polygons are simplest and animate acceptably. Canvas is faster and worse to debug. Start SVG; revisit only if profiling says so.
3. **Does the simmed portion of a round need to be deterministic per-hole,** or can it be a single roll for the fourteen unplayed holes? A single roll is far cheaper and probably indistinguishable to the player.
4. **Action-log saves vs. snapshot saves** once the reducer stabilises. Snapshots are more robust to change; logs are better for debugging. We may want both.
