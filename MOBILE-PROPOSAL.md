# MOBILE PROPOSAL

### Don't Hit It In The Water — the touch pass, specified

**Written 25 Aug 2026 · static audit, no code changed · companion to ARCHITECTURE.md §10**

Target: portrait phone, 375×812 first. Landscape second. Capacitor shell per
§10 — the sim needs nothing, so everything below is `index.html`, `styles.css`,
and JSX re-arrangement in `src/ui/`. One change touches `src/ui/scale.ts`, and
it is designed to keep that file the only place yards become drawing units.

A note on the numbers used throughout: at 375px wide, `.shell` padding
(styles.css:23, 18px each side) leaves **339px of content width**. The SVG
viewBox is 132 yards wide (`HALF_WIDTH` 66, scale.ts:10) and up to **621 yards
deep** (545-yard hole + `RUNOUT` 46 + 30, scale.ts:14). Those two facts decide
most of what follows.

---

## 1. What breaks at 375px — the inventory

### 1.1 The hole diagram starves on long holes

- **styles.css:55** — `.holeview{width:100%;height:auto;max-height:74vh}` with
  `preserveAspectRatio="xMidYMin meet"` (HoleView.tsx:66). The viewBox aspect
  is 132 wide : depth deep. On any hole longer than ~370 yards the 74vh cap
  (~600px at 812) is the binding constraint, so `meet` letterboxes: on the
  545-yard holes (Home, The Verdict, The Walk In) the entire diagram renders as
  a **~128px-wide strip** centred in a 339px box, with ~105px of dead paper
  either side. Scale is ~0.97 px/yard; on a 42vh mobile figure it would drop to
  ~0.55 px/yard. A driver cone 25 yards half-wide is then ~27px across — the
  water-vs-cone read, the entire point of the game, is at the edge of legible.
- **styles.css:54** — `.figure{position:sticky;top:12px}`. Under the existing
  `@media(max-width:860px)` stack (styles.css:53) the figure is its own grid
  row, so sticky does nothing: **you scroll to the hand and the cone scrolls
  off screen.** Choosing a shot while seeing its cone is not possible on a
  phone today. This is the single biggest break.
- **HoleView.tsx:101-108** — pin (26 yard-units tall) and ball (r=5 yard-units)
  are drawn in yard space without `non-scaling-stroke` compensation on their
  fills, so at 0.55 px/yard the ball is a 5px dot and the flag ~14px. The cone
  outline survives (vectorEffect on strokes, HoleView.tsx:47-51); the markers
  don't.
- **styles.css:57 / HoleView.tsx:80** — `.gridlabel{font-size:9px}` on SVG text
  is 9 *yard-units*, not 9 CSS px, so label size varies with hole length: ~23px
  on a width-bound par 3, ~9px on a 545-yard hole. Already true on desktop;
  merely more visible when small.

### 1.2 Layouts that assume side-by-side space

- **styles.css:52** — `.board` wants `minmax(230px,.78fr) minmax(360px,1fr)`.
  The 860px query stacks it, which is correct, but nothing was designed for
  the stacked case — it is desktop content in a single column, ~1600px tall
  on the playing screen, commit button far below the fold.
- **styles.css:39-48 / App.tsx:446-479** — the topbar. `.stats` has `gap:22px`
  and up to six items (score, position, strokes, bag, deck, focus); at 339px it
  wraps to two or three ragged lines under the 38px `.hnum` block, eating
  ~110-140px of the most valuable vertical space before the hole appears.
- **styles.css:218** — `.shoprow` two `ghost` buttons side by side: 13.5px text
  plus a price in ~162px each. Cramped; wraps badly with longer labels.
- **App.tsx:481-499** — the deck drawer renders in-flow and pushes the whole
  board down. Fine on desktop; on a phone with a fixed header it needs to
  become an overlay or it shoves the diagram off screen.

### 1.3 Touch targets under 44px

- **styles.css:74-77 / App.tsx:582-589** — aim buttons: `padding:9px 4px`,
  12px text → **~35px tall**. This is a three-state control the player hits on
  every shot; it must be ≥44px.
- **styles.css:160-161 / App.tsx:469-471** — `.deckbtn`: `padding:0`, a 20px
  number over 9.5px caps. Roughly 34×40px, and it sits next to the focus
  meter, inviting mis-taps.
- **styles.css:179-183 / App.tsx:619-623** — `.redraw`: ~40px tall. Borderline;
  one padding bump fixes it.
- Fine as-is: `.big` / `.big.commit` (~48px), `.putt` (~90px), `.shot` cards
  (~109×130px at 3-up), `.weekcard`, `.offercard`, `.removeone` (~40px tall but
  full/half width — acceptable), scorecard squares and ladder rungs
  (styles.css:99, 190 — 26-38px but **not interactive**, no requirement).

### 1.4 Hover-dependent affordances

None of these are load-bearing for information — the game already prints its
reasons inline (e.g. Cards.tsx:58 shows the blocked reason in the blurb slot,
so the `title` on Cards.tsx:53 is redundant on touch, not a loss). But every
`:hover` rule becomes a *sticky* hover on iOS (the style applies on first tap
and stays), which reads as broken selection state:

- styles.css:111 `.putt:hover`
- styles.css:137 `.ghost:hover`
- styles.css:142, 175 `.offercard:hover`
- styles.css:156 `.removeone:hover` (turns red — the "this is deletion" warning
  is hover-only; on touch the first hint of danger is the deletion itself)
- styles.css:182 `.redraw:hover`
- styles.css:224 `.weekcard:hover`

All should be wrapped in `@media(hover:hover)`, and the removal screen should
carry its danger colour statically on mobile.

One genuine information loss: **App.tsx:144, 422** — ladder rungs name their
event only via `title`. Invisible on touch. Minor (the current event is named
in the h1), but worth one line of text.

### 1.5 Type below the mobile floor

Sizes under ~10px CSS on a phone at arm's length, worst first:

- styles.css:130 `.shot-tag` 7.5px
- styles.css:97, 106 `.club-why` / `.club-cut` 8.5px
- styles.css:144 `.offer-kind` 8.5px
- styles.css:129 `.shot-blurb` 9px, styles.css:114 `.putt-sub` 9px,
  styles.css:102 `.sq span` 9px
- styles.css:48, 188, 201, 86 — the 9.5px mono caps family
- styles.css:171 `.shot-leave` 10px — **this one is load-bearing** (it is how
  the player sees a line to par exists, per the comment at Cards.tsx:40-42)
  and should be the first bumped.

Recommendation: a 10px floor everywhere, 11px for anything the player must
read to make a decision (`shot-leave`, `tech-cost`, `putt-sub`).

### 1.6 The shell itself

- **index.html:5** — viewport meta is present and correct
  (`width=device-width,initial-scale=1`) but lacks `viewport-fit=cover`; in a
  Capacitor shell the layout will not extend under the notch and, worse, the
  bottom button rows will sit behind the home indicator without
  `env(safe-area-inset-*)` padding. No element uses safe-area insets today.
- No `touch-action:manipulation` on buttons → 300ms-class double-tap-zoom
  ambiguity on fast repeated taps (relevant: tapping techniques on and off).
- No `-webkit-tap-highlight-color` control → grey flash rectangles over the
  carefully flat design.
- `100vh`-family sizing (`74vh` figure, `44vh` removelist at styles.css:153,
  `9vh` intro padding at styles.css:24) should become `dvh` units — in webviews
  `vh` includes collapsed browser chrome and causes overflow.
- No `overscroll-behavior` → rubber-banding the whole shell when the inner
  hand region scrolls.

### 1.7 Playing screen, thumb reach

With today's stacked order (diagram → note → situation → aim → techs → hand →
redraw → commit → scorecard), the commit button lives ~1400px down a scrolling
column: **the most important button in the game is the hardest to reach.** The
putt buttons are similarly below a 600px diagram. Everything the thumb hits
repeatedly — aim, techniques, shots, commit — needs to live in the bottom
two-thirds, and commit needs to be fixed.

---

## 2. The playing screen, portrait

### 2.1 The frame

Four regions in a `100dvh` column. Only region C scrolls, ever.

```
┌─────────────────────────────────┐
│ A  topbar — one 52px line        │  fixed
├─────────────────────────────────┤
│ B  hole diagram  ~300px          │  fixed — the cone never scrolls away
│    (windowed camera, §2.3)       │
│    situation + aim row  ~96px    │
├─────────────────────────────────┤
│ C  techniques / hand / redraw /  │  scrolls
│    scorecard / leaderboard       │
├─────────────────────────────────┤
│ D  commit bar  64px + safe-area  │  fixed — focus meter + primary action
└─────────────────────────────────┘
```

Budget at 375×812 with safe areas (~59 top, ~34 bottom under
`viewport-fit=cover`): A 52 + B 396 + D 98 ≈ 546, leaving **~265px for C** —
the technique row and the first row of shot cards visible without scrolling,
the second row one thumb-flick away. Tight but honest; the alternative is a
smaller diagram, and the diagram is the game.

**What must never scroll:** the diagram with its cone, the aim state, the
focus meter, and the primary action. These four are one decision — deforming
the cone with a technique while watching it against the water, then
committing. Splitting any of them across a scroll boundary breaks the loop.

**What scrolls:** techniques, the six shot cards, redraw, scorecard,
leaderboard, the shot-log line's history. All reference material or
one-of-six choices; scrolling them costs a flick, not comprehension.

Region by region:

- **A — topbar.** One line: `3 · Par 4 · 465y` left (drop `.hnum` at 38px to
  ~20px; fold the hole name into the tee-shot situation line or the note);
  right side keeps score, position, and the deck button at 44px. **Strokes
  moves into the situation line** ("stroke 2 — 180 yards to the pin from the
  rough") and **focus moves to region D** — it is the currency the bottom half
  spends, it belongs next to the spend buttons. Bag icons fold into the deck
  drawer. The deck drawer becomes a full-screen overlay sheet, not in-flow.
- **B — diagram + aim.** Figure gets a fixed CSS height (~300px, tuned once)
  instead of `max-height:74vh`. Camera per §2.3. Below it, the situation line
  and the three aim buttons at 44px in the existing 3-column grid. During the
  `shot` phase the aim row's slot shows the `.shotline` result text instead —
  same vertical space, no reflow. During putting, region C's content is
  replaced by the two putt buttons (they fit without scrolling) and D's action
  is hidden — the putts *are* the commit.
- **C — the hand.** Keep the 3-column shot grid (styles.css:119): at 339px a
  card is ~109px wide, which holds name, cone, carry+roll, and the leave line.
  Six cards in 2×3, all comparable at a glance — see the owner question in §5
  before considering a bottom sheet. Techniques stay 2-up. `hole.note` moves
  to the tee only (strokes 0), above the techniques, where it sets the scene
  once and then scrolls away.
- **D — commit bar.** Fixed to the bottom, `padding-bottom:
  env(safe-area-inset-bottom)`. Left: the focus meter (the ◆ glyphs from
  App.tsx:473-477, including the "staged spend" dimming). Right, filling the
  rest: **one slot that always holds the primary action** — "Hit it", "Next
  shot", "Next hole", "Sign your card", per phase. The thumb learns one place.
  The redraw button stays in C (it is a deliberate act, not a reflex; putting
  it next to commit invites focus-burning mis-taps).

### 2.2 The cone at small sizes

Three things keep the preview legible at ~1px/yard and below:

1. The windowed camera (§2.3) — the structural fix; it roughly triples
   px-per-yard for every shot after the drive.
2. Ball and pin get `non-scaling` treatment like the cone's strokes already
   have — draw them at fixed screen size (a `<g>` with
   `transform: scale(1/k)` around the projected point, or screen-space
   overlay), so the "you are here" marker stops shrinking with the hole.
3. `.gridlabel` moves from yard-units to a fixed screen size the same way, so
   yardage numbers stop varying by hole length.

None of this touches the cone geometry itself — the polygon still goes through
the same projection as the ground it is judged against.

### 2.3 The camera, and the one-Scale rule

The current code is actually *stronger* than ARCHITECTURE §4.2 describes: the
viewBox is expressed **in yards** (scale.ts:13-16), so there is no
px-per-yard number anywhere — the browser derives it from the CSS box, and
cone/hole cannot drift because they share the viewBox. Any responsive change
must preserve that.

**Proposal: the Scale stays "viewBox in yards"; responsiveness is (a) the CSS
box and (b) a windowed viewBox — both owned by scale.ts.**

```ts
// scale.ts — still the only place yards become drawing units
export function viewBox(hole: HoleSpec, fromDown?: number): string
```

- `fromDown` is a yard distance; the box becomes
  `[-HALF_WIDTH, depthOf(fromDown)] → [HALF_WIDTH, totalDepth]` — i.e. the
  view is cropped to start just behind the ball. `project()` is untouched;
  every element still projects identically; a uniform crop cannot make the
  picture lie, because cone and hazards scale together by construction.
- HoleView passes `Math.max(0, ball.down - 15)` — **the camera follows the
  ball, never the staged cone**, so toggling a technique never moves the
  ground under the preview. It also never *ends* early: the window always runs
  to `totalDepth`, so nothing the ball could reach is ever cropped off the top.
  On the tee this degenerates to today's full-hole view — the drive decision
  deserves the whole picture (the title of the game is a hazard brief).
- Effect at 339×300px figure: tee on Home (545y) is unchanged (~0.48 px/yard,
  the price of honesty, mitigated by §2.2's fixed-size markers); after a
  265-yard drive the window is ~370 yards deep → ~0.8 px/yard; a 150-yard
  approach → ~1.3; a chip → width-bound at 2.57. The scale grows exactly as
  the decisions get finer, which is the correct direction.
- **Optionally**, a minimap: a second `<svg>` strip (~40px wide) in the
  letterbox gutter showing the *full* hole with a bracket marking the current
  window. It calls the same `viewBox(hole)` and `project()` — one code path,
  two windows. It draws no cone, so it cannot violate the shared-scale
  contract (the contract binds the cone to the ground *it is drawn on*).
  Recommended, but it is a garnish; ship the window first.

Rejected alternatives, for the record: shrinking `HALF_WIDTH` on mobile (the
view is height-bound on every hole that matters, so it only trims letterbox —
the gutters are better spent on the minimap); `preserveAspectRatio: slice`
(crops depth — hides hazards the cone can reach; forbidden by P8's spirit); a
second px-per-yard conversion for a "zoomed" cone layer (forbidden by §4.2's
letter).

### 2.4 Landscape (second priority)

At ~812×375 the desktop two-column board is nearly right already: figure left
at full height (the 74vh cap works again), panel right as the scroll column,
commit bar fixed to the bottom of the *panel column only*. One media query on
orientation + height. Do it after portrait ships; consider locking portrait in
the Capacitor config until then (owner question, §5).

---

## 3. The between-event screens

They are vertical single-column already (`.shell.intro`, 620px max) and mostly
survive. Per screen, in play order:

- **intro** — fine. `padding-top:9vh` → `5dvh` so the button clears the fold.
- **schedule** — fine structurally; weeks grid is 2-up at ~163px each, good
  targets. The confirm block (App.tsx:181-204) already does the right thing.
  Needs: weekcard sticky-hover guard; one line naming the current rung
  (§1.4); `dvh` padding.
- **playing / cut / payout / moneylist / over** — cut, payout, moneylist, over
  are headline + button + leaderboard/ladder and need nothing but the global
  passes (safe-area bottom padding so the button clears the home indicator,
  hover guards, type floor). The `evfacts` row (styles.css:186) fits three
  cells at 339px.
- **shop** — `.offer` auto-fits to 2-up at ~165px, fine. `.shoprow`
  (styles.css:218) stacks to one column under ~420px. Offer cards are already
  big targets; sticky-hover guard needed. The long tagline paragraph is worth
  keeping — it is the economy tutorial.
- **remove** — `.removelist` 2-up is fine; `44vh → 44dvh`; give `.removeone`
  its danger colour statically on touch (§1.4) and 2-3px more padding to clear
  44px.

Total between-event work is one CSS pass plus two one-line JSX additions. The
playing screen is 90% of the job, which is the right shape — it is also 90% of
the minutes played.

---

## 4. Implementation plan — small slices, each verifiable at 375×812

Estimates are working-session sized; "check" means Vite dev server + device
emulation at 375×812, plus one long hole (Home) and one short (The Pond).

1. **Shell hygiene.** `viewport-fit=cover` in index.html:5; safe-area padding
   on `.shell` and every bottom button; `vh → dvh` (styles.css:24, 55, 153);
   `touch-action:manipulation` + tap-highlight on `button`;
   `overscroll-behavior:none` on the shell; wrap all seven `:hover` rules in
   `@media(hover:hover)` with the removeone danger colour made static on
   touch. *~1 line HTML + ~35 lines CSS.* Check: no horizontal scroll on any
   phase; no sticky hover after tapping a putt or week card; buttons clear the
   home indicator.
2. **Type and target floor.** Bump §1.5's list to the 10/11px floor; aim
   buttons, deckbtn, redraw to ≥44px (styles.css:74, 160, 179). *~15 line
   edits.* Check: every interactive element passes a 44px overlay audit;
   shot-leave readable at arm's length.
3. **Compact topbar.** Sub-480px rules: shrink `.hnum`, move strokes into the
   situation line, fold bag icons away, tighten `.stats` gaps. Deck drawer
   becomes a fixed overlay under the topbar instead of in-flow
   (App.tsx:481-499). *~40 lines CSS, small JSX.* Check: topbar is one ≤56px
   line in playing, shot, holed, and putting states.
4. **The frame.** Restructure the playing return (App.tsx:444-647) into the
   A/B/C/D regions: fixed figure block, scrollable middle, fixed commit bar
   hosting focus + the phase's primary action (Hit it / Next shot / Next hole /
   Sign your card); putt buttons render in C unscrolled; scorecard and
   leaderboard into C. *The big one — ~80 lines CSS + meaningful JSX
   re-arrangement, no sim contact.* Check: cone visible while scrolling the
   hand; commit reachable one-handed in every phase; putting fits without
   scrolling; the 'holed' leaderboard scrolls in C while Next stays fixed.
5. **The camera.** `fromDown` parameter in scale.ts `viewBox`/`totalDepth`
   companions; HoleView passes ball-follow; fixed-screen-size ball, pin, and
   grid labels (§2.2). *~40 lines across scale.ts + HoleView.tsx.* Check: on
   Home, tee view unchanged; after the drive px-per-yard visibly increases;
   toggle Grip It & Rip It and confirm the ground does not move; confirm a
   hazard at the window's near edge still renders.
6. **Minimap strip** (optional, after 5 proves out). *~30 lines.* Check: long
   holes only, bracket tracks the window, no cone drawn on it.
7. **Between-event pass.** §3's list. *~40 lines CSS + 2 small JSX.* Check:
   every non-playing screen tapped through at 375×812, buttons above the home
   indicator, shoprow stacked.
8. **Landscape.** Orientation query restoring the two-column board with a
   panel-scoped commit bar. *~30 lines.* Check at 812×375: figure fully
   visible, hand scrolls beside it, commit fixed.
9. **Capacitor wiring** (separate from the touch pass, listed for
   completeness): filesystem `storage` implementation per §9/§10, status-bar
   style, orientation lock per the §5 decision.

Slices 1-3 are shippable-safe on desktop too (they are pure improvements).
Slice 4 is where desktop regressions could hide — keep the ≥861px layout
untouched behind the existing 860px breakpoint and verify desktop after.

---

## 5. Owner decisions — questions, each with a recommendation

1. **Hand: 3×2 grid vs bottom-sheet / horizontal carousel?** Recommend the
   grid. This is a planning game — the player reads six cones *against each
   other* to find the line to par, and a carousel hides four of them. 109px
   cards are small but every load-bearing element (name, cone shape, carry,
   leave) fits. Revisit only if slice 4 playtests cramped.
2. **Camera: ball-follow window vs always the whole hole?** Recommend the
   window. The whole-hole view at 300px tall is ~0.5 px/yard on the long holes
   — the cone-vs-water read degrades exactly when the stakes are highest. The
   window never hides anything reachable and never moves during staging. If
   "always see the whole hole" feels like a design principle rather than a
   preference, the minimap is the compromise.
3. **Aim: keep the three buttons, or tap/drag on the diagram?** Recommend the
   buttons. Aim is a three-state choice in the sim (`AimChoice`); a drag
   control implies precision the game deliberately doesn't have, and thumbs on
   a 128px-wide strip are not precise anyway.
4. **Focus meter: commit bar or topbar?** Recommend the commit bar (spend
   lives next to the spend buttons and the "staged" dimming animates right
   where the thumb is). Costs one habit change for existing players.
5. **Orientation for v1: lock portrait, or ship both?** Recommend locking
   portrait in Capacitor until slice 8 lands. A half-working landscape is
   worse than none, and rotation mid-hole with a fixed-frame layout is a bug
   farm.
6. **Microtype: bump to the 10/11px floor (denser cards, slightly less air) or
   keep the miniature aesthetic and accept arm's-length squinting?** Recommend
   the bump; the flat-mono look survives 10px fine.
7. **The hole note (`hole.note` flavor text): tee-only in the scroll region
   (recommended), always visible, or behind a tap on the diagram?** It is
   flavor plus a strategy hint; tee-only keeps the hint where the plan is made
   without spending fixed-region pixels on it for every shot.
