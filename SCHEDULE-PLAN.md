# SCHEDULE PLAN — courses enter the season

**25 Aug 2026 · plan, written before any code moves**

The season's fourteen events promise four venues and deliver one.
`src/sim/state.ts` line 170 says `export const COURSE = PINE_HOLLOW` and the
whole game reads that constant — the reducer, the UI, the field model, and
every calibration tool. The wall that gated this work fell tonight:
`EventSpec` carries `fieldStrength` (FIELD-RESPONSE.md), so the machinery for
"an event changes how the field scores" exists and is measured. This plan
makes the course the second thing an event decides.

The measured ladder this plan is built on (coursecheck, mixed policy, full
round vs par — REVIEW-5 §3, REVIEW-6 §2):

```
Rockdale Muni   −1.65        the muni; par is easy, the cut does not care
Pine Hollow     +0.71        the incumbent; everything is calibrated here
Cottonwood      +1.77        the straight line is a lie
Salt Flats      +3.02        the unfair major (was +4.11 before v6's funding round)
```

Deltas vs Pine Hollow, which is the anchor everything else is priced against:
**Rockdale −2.4, Cottonwood +1.1, Salt Flats +2.3** strokes per round.

---

## 1. The mechanism — COURSE becomes a per-event lookup

### 1.1 The registry

One new file, data only, no logic (ARCHITECTURE §6):

```ts
// src/content/courses/index.ts
export type CourseId = 'pinehollow' | 'cottonwood' | 'rockdale' | 'saltflats'

export interface Course {
  readonly id: CourseId
  readonly label: string              // "Pine Hollow" — what the UI prints
  readonly holes: readonly HoleSpec[]
  readonly par: number                // reduce over holes, computed once here
  /** strokes per round the FIELD's scoring moves at this course — §3 */
  readonly fieldShift: number
}

export const COURSES: Record<CourseId, Course>
```

The four existing course files stay exactly as they are — they are the
measured artifacts the review docs refer to. The registry imports them.

### 1.2 EventSpec gains a course id

```ts
export interface EventSpec {
  // ...existing fields...
  readonly course: CourseId
}
```

A course id on the event, not a separate schedule map. The event already
carries every other per-week dial (advance, sharpness, fieldStrength, purse);
a parallel map keyed by event number would be a second copy of the schedule
that can drift from the first.

### 1.3 The selectors, exactly

`state.ts` loses the two constants and gains:

```ts
export function courseFor(event: number): Course           // SEASON[event-1].course → COURSES
export function courseOf(s: Pick<GameState, 'event'>): Course
export function currentHole(s: GameState): HoleSpec        // signature unchanged
export function holeCount(s: Pick<GameState, 'event'>): number
export function parThrough(s: Pick<GameState, 'event'>, n: number): number   // GAINS the state arg
export function toPar(s: GameState): number                // signature unchanged
```

`parThrough` is the one signature that has to change: par-through-N is a
fact about *which course you are standing on*, and today it silently isn't.
Every current usage, and its replacement:

| today | becomes | where |
|---|---|---|
| `COURSE = PINE_HOLLOW`, `PAR = COURSE_PAR` | **deleted** (`PAR` has no consumers outside state.ts — confirm and drop) | state.ts:170–171 |
| `COURSE[s.hole.index]` | `courseOf(s).holes[s.hole.index]` | reducer.ts previewCone |
| `COURSE[draft.hole.index]!` | `courseOf(draft).holes[draft.hole.index]!` | reducer.ts finishHole |
| `played >= COURSE.length` | `played >= holeCount(state)` | reducer.ts advance |
| `parThrough(d.scores.length)` | `parThrough(d, d.scores.length)` | reducer.ts settle |
| `parThrough(CUT_AFTER_HOLE)` | `parThrough(state, CUT_AFTER_HOLE)` | reducer.ts advance (cut) |
| `COURSE[Math.min(...)]` | via `courseOf(s).holes` | state.ts currentHole |
| `COURSE.slice(0,n)` | via `courseOf(s).holes` | state.ts parThrough |
| `COURSE.length` ×3, `COURSE.map(...)` scorecard | `holeCount(s)` / `courseOf(s).holes.map` | App.tsx 234, 382, 553, 561, 651, 679 |
| `import { COURSE } from '../state'` | `advanceField(field, par, rng, shift)` — par passed in | **field.ts:4, 64** |

That last row matters twice over. `sim/resolve/field.ts` importing `COURSE`
from `state.ts` while `state.ts` imports field's types is a value-level
dependency cycle that happens to work; passing the hole's par as a parameter
both fixes the rotation and kills the cycle. New signature:

```ts
export function advanceField(
  field: readonly FieldPlayer[], par: number, rng: RngState, courseShift = 0,
): readonly [FieldPlayer[], RngState]
```

(`courseShift` is §3's knob; it defaults to 0 so slice 1 is a pure refactor.)
Callers — reducer `finishHole` and six tools — pass
`courseOf(s).holes[i].par` or the loop's hole.

### 1.4 How par-dependence generalizes (31 vs 32)

It mostly already has, by accident of good design: **everything downstream of
the round is relative to par.** The player's `rel` is
`scores − parThrough(...)`; the field's `total` is strokes-vs-par by
construction (`advanceField` scores −1/0/+1/+2 against the hole's par). So
`rankCut`, `standings`, `yourPlace`, and `payout` compare two vs-par numbers
and never see the absolute par. Rockdale's 31 against everyone else's 32
costs nothing — *provided* `parThrough` reads the right course, which is the
entire point of giving it the state argument. The only absolute-par consumers
are the tools' `COURSE_PAR` imports (§4) and display strings.

---

## 2. Which events play which course

Five events are pinned by their own names. The rest are decided here, with
the fiction that an event without a home course of its own is *hosted* at
one of the four that exist — which is how real tours work, and leaves the
door open to build Bracken Ridge someday.

| # | event | course | why |
|---|---|---|---|
| 1 | The Sunbelt Open | **Rockdale** (−1.6) | The opener, at cones ×1.40. The easiest course when the player is at their loosest — the forgiving spring the intro screen promises. A sunbelt muni reads fine. |
| 2 | Pine Hollow Classic | **Pine Hollow** | Named. |
| 3 | Cottonwood Invitational | **Cottonwood** (+1.8) | Named. The first real step up, arriving exactly as sharpness starts tightening. |
| 4 | THE MASTERS OF PINE HOLLOW | **Pine Hollow** | Named. First major on the known course — the pressure is the occasion, not the venue. |
| 5 | Rivermouth Open | **Cottonwood** | Cottonwood is the only course with real water in play (the ditch on Wrong Number, the pond), so the river name lands. And it keeps events 1–5 within a quarter stroke of the all-Pine-Hollow total (−2.36 +1.06 +1.06 ≈ −0.2), so the season's deadliest check — check 1 kills 42% — arrives at a stretch calibrated the way it was measured. |
| 6 | The Muni Championship | **Rockdale** | Named. The cut-decided-from-the-top course, at the week the field is starting to matter. |
| 7 | THE OPEN AT SALT FLATS | **Salt Flats** (+3.0) | Named major. The unfair one, mid-season, deliberately *between* checks 1 and 2 — its damage is field-relative (§3), not a Money List execution. |
| 8 | Bracken Ridge Classic | **Cottonwood** | Bracken is ferny woodland; the tree-lined course wears the name. Same venue as 11 — a name must mean the same course every time it appears or the fiction breaks. |
| 9 | The Fall Series | **Rockdale** | Check-2 week. A scoring course before a check makes the check about conversion — did you bank when banking was offered — rather than survival of a gauntlet. |
| 10 | Highwater Open | **Pine Hollow** | Water on half its holes (2, 3, 5, and 8's "water the whole way down the right"). Also Pine Hollow's mid-back anchor. |
| 11 | THE PGA AT BRACKEN RIDGE | **Cottonwood** | Named venue, second visit. The second-hardest course as the fourth-from-last major, with advance 18 and fieldStrength 0.23 — the late-season major that plays like one. |
| 12 | The Autumn Invitational | **Rockdale** | The last event before the final check (kill intent 14%, the gentlest). A sprint, not an execution — same reasoning as 9. |
| 13 | Coastal Classic | **Cottonwood** | The honest answer is that "Coastal" fits Salt Flats better than anything else, but saltflats.ts declares "majors only" and this plan honors that doctrine — see open question 2. Cottonwood keeps the post-check stretch hard so the finish is earned. |
| 14 | THE TOUR CHAMPIONSHIP | **Pine Hollow** | The homecoming — recommendation, see open question 1. |

Counts: Pine Hollow 4 (2, 4, 10, 14) · Cottonwood 5 (3, 5, 8, 11, 13) ·
Rockdale 4 (1, 6, 9, 12) · Salt Flats 1 (7). Majors at Pine Hollow, Salt
Flats, Cottonwood, Pine Hollow — Rockdale never hosts one, which is correct:
a muni doesn't, and its design identity is proving the cut works at the
low-scoring end, not hosting occasions.

**The arc.** Easiest course first; the ladder climbs 3 → 5 → 7 with the
sharpness curve; Salt Flats is the mid-season wall; the back half alternates
grind (Cottonwood ×3) with scoring weeks placed at the check events; the
finale comes home. Season difficulty sum vs all-Pine-Hollow:
4(0) + 5(+1.06) + 4(−2.36) + 1(+2.31) = **−1.8 strokes across 14 rounds** —
about −0.13 per event, within noise of the current calibration, which is
deliberate: the rotation redistributes difficulty rather than adding it, so
§3's re-derivation is a correction, not a re-anchoring.

One refinement worth knowing about and deferring: coursecheck measures every
course under one fixed configuration, but a course's *effective* difficulty
depends on the sharpness of the slot it lands in (Salt Flats at event 7
plays at ×1.12). The ladder ordering is robust to this; the exact deltas are
not. seasoncheck under the rotation (§4) is the instrument that reads the
slot-adjusted truth.

---

## 3. Difficulty coupling — the field must feel the course too

### 3.1 Why it is mandatory, with the number

`advanceField` scores the field against par with no idea what course it is
on (its only course input today is "is this a par 5"). Under the rotation
alone, the player eats Salt Flats' +2.3 strokes while the 71 others eat
nothing. Field eight-hole totals span roughly ten strokes across 72 players
— call it 7–10 places per stroke in the pack — so an uncoupled Salt Flats
costs the player **~15–25 places**, and the front-four gap (+2.49 measured)
against advance=28 makes the named major a near-automatic missed cut. The
five Cottonwood weeks each tax ~6–8 places. Uncoupled, the ladder isn't
difficulty, it's a fine — the player is punished *relatively* for the
course being hard, which is exactly the wall FIELD-RESPONSE just tore down,
rebuilt facing the other way.

### 3.2 The right knob is next to fieldStrength, not inside it

season.ts's provenance comment hoped a course would pull the `fieldStrength`
dial. Having now read `makeField`: **it can't.** fieldStrength is a skill
*floor lift* — it can only make the field better, and it distorts the spread
(that's its job: survivorship culls the weak). To make the field 2.3 strokes
*worse* at Salt Flats the floor would need to fall ~0.72, through zero. The
slot is right — a per-event number — but the mechanism must be a second one:

- **fieldStrength** stays what it is: the seasonal floor lift, the fiction
  of the weak going home. Untouched.
- **fieldShift** (on `Course`, surfaced per-event through the registry): a
  flat bias offset in `advanceField` — the fiction of everyone suffering the
  same course. Moves everyone, winners included, which is precisely what a
  hard course does and precisely what FIELD-RESPONSE rejected for
  *seasonal* difficulty.

```ts
const bias = 0.20 + p.skill * 0.42 + (par === 5 ? 0.08 : 0) - biasOffset
```

### 3.3 The numbers, derived

Target: the field's per-round mean moves by the same amount the player's
does, so relative standing is preserved. Targets are the measured deltas:

| course | player Δ vs Pine Hollow | field target (strokes/round) | starting biasOffset |
|---|---|---|---|
| Pine Hollow | 0 | 0 | 0 |
| Rockdale | −2.36 | **−2.4** | **−0.155** (field goes low too — the cut line at the muni should read −3, −4, which is the course's whole thesis) |
| Cottonwood | +1.06 | **+1.1** | **+0.070** |
| Salt Flats | +2.31 | **+2.3** | **+0.152** |

Where the biasOffset numbers come from: `advanceField`'s expected score is
E = 2 − F(b−.30) − F(b+.28) − F(b+.52) with F the triangular CDF of the
two-roll average, so dE/d(bias) ≈ −1.9 strokes per hole per unit of bias at
mid-skill. Offset = (targetΔ / 8 holes) / 1.9. These are linearizations, not
answers — per house law they get confirmed by instrument: extend cutcheck
(or a twenty-line fieldcheck) to print the field's mean eight-hole total per
course and sweep the offset until it matches the target within ±0.1. No
saturation risk: the worst case (skill 0.85 at Salt Flats) leaves the birdie
window comfortably inside the roll's support.

### 3.4 What the economy does, and roughly how much

With coupling matched, a course moves you and the field *together*, so
places — and therefore money — hold to first order, and the rotation's net
−1.8 season strokes is matched by the field too. What's left is second-order:
Salt Flats' wider player spread (1.56 vs Pine Hollow's 1.17) against a
shifted-but-not-widened field fattens the place distribution's tails, and a
power-law payout pays tails; Rockdale bunches integer scores at the top and
multiplies ties at the cut line; the ±0.1-stroke coupling residual is worth
a place or two a week. **Registered prediction, FIELD-RESPONSE style: median
season gross moves by less than ±10%, so the re-derived MONEY_CHECKS land
within ~$150k / $500k / $800k of today's $1.4M / $4.8M / $8.4M.** If they
move more than that, the coupling missed and the sweep in §3.3 gets redone
before any threshold does.

The instrument that re-derives the thresholds is the one named in
season.ts's own provenance: **shopcheck** (kill rates confirmed by
moneycheck, money provenance by pursecheck) — all three running the real
rotation by then (§4). The same pass re-measures season.ts's `SHARE` array
(median share banked by event — the rotation changes the season's earning
*shape* even if not its total: Rockdale weeks bank fat, Salt Flats banks
thin) and re-anchors `LADDER` against the new median season.

---

## 4. What breaks, tool by tool

**Tests.**
- `deck.test.ts` imports `PINE_HOLLOW` (Two Ways Home water-drop tests) and
  `COURSE` from state (line 15). The pinned-hole tests are *correctly*
  pinned — they test drop geometry on a specific hole — and keep importing
  the course file directly. The `COURSE` import becomes `courseOf`. The
  whole-season and no-softlock suites (lines 264–367, 508+) drive the
  reducer and traverse whatever the schedule says; they assert invariants,
  not scores, and must pass unmodified beyond the `parThrough` signature.
  The "winning a major buys the final leg" invariant is the one to watch in
  slice 4 — it constrains check 3 exactly as before.
- `shot.test.ts` pins Two Ways Home by direct import. Stays.

**Tools that must model the real rotation** — everything that prices the
economy or shapes the season: `cutcheck`, `moneycheck`, `shopcheck`,
`pursecheck`, `rewardcheck`, `seasoncheck`, `deckcheck`. All seven hardcode
`PINE_HOLLOW.slice(0, 4)` / `.slice(4)` inside their `SEASON.forEach` loops
and import `COURSE_PAR`. The change is mechanical and identical: inside the
loop, `const holes = COURSES[ev.course].holes`, par from the registry, and
the event's `fieldShift` passed to `advanceField` alongside its
`fieldStrength`. A calibration instrument that plays a different schedule
than the game is the confidently-wrong harness ARCHITECTURE §7.2 already
paid for once.

**Tools that stay Pine-Hollow-fixed, deliberately.**
- `coursecheck` — measures a course *in isolation*, no field, fixed seed
  bank. Its cross-review comparability (REVIEW-1 through 6 are
  digit-for-digit comparable) is its entire value. Untouched.
- `balance.ts` — the per-hole microscope; per-course scoring is
  coursecheck's job. Add a header comment saying so.
- `solve.ts` — pins Church Pew on purpose.

**UI copy.** One hit: App.tsx:138, `Eight holes at Pine Hollow.` becomes
`Eight holes at ${courseFor(s.event).label}.` (and "Eight" via
`holeCount`, while we're in there). Optional polish: the schedule ladder's
rung tooltips (App.tsx:144) gain the course label, so the season screen
shows *where* each week is played — cheap, and it makes the rotation legible
before the player ever tees off at Cottonwood.

---

## 5. Saves, replay, determinism

**SAVE_VERSION 3 → 4**, bumped at slice 2 (the rotation), not slice 1: a v3
action log replayed under the rotation is a different run, and the version
gate correctly discards it (prototype policy, storage.ts). Slice 1 changes
no observable behavior and needs no bump — proving that is slice 1's
verification.

**Determinism rules for courses**, stated once so they get enforced:
- Course data is inert. A course must never cause an extra RNG call — no
  per-course wind rolls, no course-conditional draws. `fieldShift` moves
  `advanceField`'s *thresholds*, never its call count (still two rolls per
  live player per hole). The draw stream deals the same six cards per hole
  on every course. The shot stream consumes per swing, as ever.
- All four courses are 8 holes today, but nothing may assume it:
  `holeCount(s)` is the only source of truth, and `CUT_AFTER_HOLE = 4`
  stays a global (the cut is a season rule, not a course rule).
- The replay-determinism test (same seed, same actions, byte-identical
  state) passes untouched throughout — different courses produce different
  *runs*, which saves capture as different action logs, exactly as designed.

---

## 6. Slice order

**Slice 1 — the plumbing, zero behavior change.**
Registry, `EventSpec.course` set to `'pinehollow'` for all fourteen events,
all selectors from §1.3, every consumer in reducer/state/field/App migrated,
`COURSE`/`PAR` constants deleted, `advanceField` takes par (shift defaults
0). Tools untouched — they import the course file directly and still
compile.
*Verify:* full suite green with no assertion changes (only the `parThrough`
call-site updates); record a scripted season's final state on main, replay
the same seed+actions on the branch, assert byte-identical. No SAVE_VERSION
bump — that equality is the proof it wasn't needed.

**Slice 2 — the rotation.** The §2 table into season.ts, App.tsx copy,
SAVE_VERSION 4.
*Verify:* whole-season and softlock suites pass; hand-play events 1, 6, 7
and see three different courses; coursecheck output unchanged (it never sees
the schedule). Known-wrong on purpose: the player is relatively punished at
Cottonwood/Salt Flats until slice 3 — **slices 2 and 3 ship together**, even
as separate commits.

**Slice 3 — field coupling.** `fieldShift` in the registry, `courseShift`
through `advanceField`, reducer passes it, tools pass it. Sweep the bias
offsets (§3.3 starting values) until field per-round means match the player
deltas within ±0.1.
*Verify:* the sweep table in the commit message; cutcheck under the rotation
still shows the squeeze (high-80s → ~30, the FIELD-RESPONSE shape) — the
rotation must bend that curve locally (a dip at 7, a bump at the Rockdale
weeks) without breaking its direction.

**Slice 4 — re-derive the economy.** shopcheck threshold sweep under
rotation+coupling → new MONEY_CHECKS; moneycheck confirms kill rates against
the 41/29/14 intent (accepting check 3's known equipment-snowball residual);
pursecheck for provenance; re-measure SHARE and re-anchor LADDER; update
season.ts's provenance comments and DESIGN.md.
*Verify:* the §3.4 prediction — thresholds within ±10% — judged honestly in
the commit message; deck.test's win-pays-the-final-leg invariant green;
survival mixed/aggressive/safe re-measured against the 36/45/3 intent.

---

## Open questions for the owner

1. **The finale: Salt Flats or the Pine Hollow homecoming?**
   Recommendation: **Pine Hollow.** The Tour Championship already runs
   advance=10 and fieldStrength 0.30 — both dials at maximum; stacking the
   +3.0 course on top makes the trophy event the most likely week to
   humiliate. The checks end at 12 *so that the finale is a trophy, not a
   verdict* (season.ts's own words), and Salt Flats is a verdict — its
   closer is literally named one. Pine Hollow at cones ×0.80 is the season's
   thesis made playable: the course that beat you in March, and you finish
   on the hole named Home. Salt Flats' identity as the mid-season wall is
   also worth protecting — a second helping makes it a rotation stop instead
   of an event.

2. **Event 13, "Coastal Classic" — amend Salt Flats' "majors only" doctrine?**
   The name fits Salt Flats better than Cottonwood ever will, and 13 is
   post-checks: the hardest course there is drama with no death attached,
   and it would set up a survive-the-flats → come-home-to-Pine-Hollow
   finish. Recommendation: ship Cottonwood (doctrine intact), and revisit if
   the 13-slot plays flat — the change is one CourseId.

3. **Bracken Ridge appears twice (8, 11) wearing Cottonwood's course.**
   Fine as hosting fiction, but it's the strongest candidate for a fifth
   course later — a named venue with a major and no home. Alternatively
   rename events 8/11 to Cottonwood names and retire "Bracken Ridge."
   Recommendation: leave the names; they're a free roadmap.

4. **Should seasoncheck grow a slot-difficulty readout** (per-event mean
   under that event's sharpness/course), so the ladder is known *as
   scheduled* rather than as measured in isolation? Recommendation: yes, in
   slice 4 — it's one column, and it's the number §2's arc claims to be
   shaping. coursecheck itself stays isolated regardless.

5. **Rockdale never hosts a major.** Believed correct (a muni doesn't, and
   majors are where boosts are earned — the boost pick after a Rockdale cut
   would be earned by a birdie-fest). Flagging it because it is a decision,
   not an accident.
