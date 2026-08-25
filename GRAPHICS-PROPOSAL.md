# Graphics proposal — better-looking holes

**Answering: "maybe updating the graphics that the courses use, or is that not
gonna happen because the math uses straight lines and circles?"**

**August 2026 · Companion to ART-BRIEF.md and ART-DIRECTIONS.html · No code changed by this document**

---

## 1. The answer first

**The math does not block better graphics. It's not even in the way.**

The confusion is natural, so here is the untangling. The sim stores a hole as a
corridor of half-widths, a circular green, and elliptical hazards
(`src/sim/types.ts`, `HoleSpec`). Those primitives are the *truth* — where
`surfaceAt` in `src/sim/geometry.ts` says the water is, the water is. But
nothing anywhere says the *drawing* has to look like a geometry homework
problem. Rendering lives entirely in `src/ui/`, the sim doesn't know a screen
exists (ARCHITECTURE.md §0), and the UI is free to dress those shapes in
texture, linework, trees, shadows, and shoreline character — as long as one
rule holds:

> **Any boundary that decides a shot must be drawn where the sim believes it
> is.** Water, OB, the green edge, the lip of a bunker. This is the terrain
> half of "the cone never lies" (DESIGN.md §7.0, P8). The player compares the
> cone against the fairway and the water; if the drawn pond is three yards
> bigger than the real one, the picture is lying exactly the way a mis-scaled
> cone would.

So the constraint is **boundary honesty, not literal shapes**. A pond can have
a hand-drawn shoreline, ripple lines, and a dark centre. What it can't have is
a gameplay edge in a different place than `inEllipse` puts it.

One more reassurance: the ellipses are less crude than they sound. The
corridor already narrows and widens along the hole (`corridorHalf`
interpolates), hazards overlap and stack, and the art-direction mocks in
ART-DIRECTIONS.html — which everyone agreed looked like real golf holes — were
built from shapes no richer than what the sim already has. The current screens
look plain because the *rendering* is plain, not because the geometry is.

And the pleasant surprise: `ui/scale.ts` puts the SVG viewBox **in yards**.
Every new visual layer just emits yard-space coordinates and inherits the
one-scale guarantee for free. The plumbing for better graphics already exists;
it has simply never been asked to carry anything but flat fills.

---

## 2. Three approaches, in increasing ambition

### (a) Styled rendering of the true geometry — *recommended*

Draw exactly the shapes the sim believes in, but draw them well. This is what
ART-DIRECTIONS.html already prototyped: the same hole 7 symbol, restyled three
ways (Sunday Tape, Ink on Vellum, The Muni), and each one reads as a world.
This approach is that document made real inside `HoleView.tsx`.

Concretely, per surface:

- **Edges get character, not new positions.** Generate a wobbled path along
  each true boundary — small-amplitude noise, mean displacement zero, seeded
  from the hole number and feature index (never `Math.random` at render time,
  see §3). At the game's scale a yard is roughly 1.5 px, so ±1.5 yards of
  wobble reads as hand-drawn linework, not as different geometry. Cone spreads
  run 8–25+ yards; a boundary that breathes by a yard is far below
  decision scale. For the two penalty surfaces — **water and OB** — also
  stroke a crisp line at the exact true edge, the way a yardage book inks a
  hazard line. Texture is the wobble; truth is the ink.
- **Interiors get texture, clipped to the true shape.** Ripple arcs inside
  water, stipple and an inner shadow inside bunkers, mow-line banding on the
  fairway corridor, hachures or grain on rough — all inside an SVG `clipPath`
  built from the exact projected geometry, so decoration physically cannot
  leak across a boundary.
- **Trees regions become canopies.** A trees ellipse renders as a
  deterministic cluster of overlapping canopy blobs filling the true ellipse,
  with the ellipse itself as the clip. Reads as a stand of trees; plays as the
  exact same region.
- **Palette and type come from the chosen art direction.** The CSS variables
  in `styles.css` (`--fairway`, `--water`, `--sand`…) are already the only
  colour source; a direction is mostly a token swap plus the direction's
  furniture (scanlines and chyron, vellum grain and title block, or Muni
  two-ink flatness).

**Cost:** days, not weeks. One new path-generation helper in `ui/`, new layers
in `HoleView.tsx`, CSS tokens. No art budget.
**Risk:** low. Worst case is visual clutter, and the art brief's own test
applies: if the cone stops reading at a glance, back the texture off.
**Boundary honesty:** preserved by construction — fills and clips are the
projected true geometry; penalty edges carry a crisp true-line stroke.
**Touches `sim/`:** **no.** Not one line.

### (b) Decoration layers — things that aren't terrain

A second pass on top of (a): individual tree sprites scattered outside the
corridor, a cart path, tee markers, a fluttering flag, long shadows, birds.
Placement is deterministic (seeded from hole id) and the rule is absolute:
**decoration never paints a surface colour where that surface isn't, and never
sits on top of a boundary or the cone.** A decorative tree may stand in a
trees region or out past OB; it may not stand on the fairway looking like it
might block a shot, because the sim says it won't — and an obstacle that
visibly isn't one is the same lie in the other direction.

**Cost:** open-ended — this is the layer you can polish forever. Budget it in
small fixed bites.
**Risk:** medium, and it's the risk the art brief names: clutter competing
with the cone. The current look's plainness is *why* it reads; every sprite
has to pay rent.
**Boundary honesty:** preserved by the placement rule plus z-order (terrain,
then decoration, then cone, then pin and ball).
**Touches `sim/`:** **no.**

### (c) Authored art per hole, traced over the real boundaries

An artist (or a long generation session) paints each hole as a full
illustration, working over an exported SVG of the true geometry, and the game
draws the artwork with the cone on top. This is the ceiling — and it is
explicitly what ART-BRIEF.md says not to buy yet ("Hole illustrations. Course
content isn't final."). Courses are still moving (saltflats isn't even
integrated); per-hole art bought now is likely waste.

If it ever happens, it needs a conformance tool: a `tools/artcheck.ts` in the
existing harness style that samples a grid of yard-space points, asks
`surfaceAt` for the truth, reads the artwork's colour at the same projected
point, and fails the build on disagreement beyond tolerance. Boundary honesty
by mechanical check, not by trust — the same philosophy as the lint rules in
ARCHITECTURE.md §8.

**Cost:** real money or serious time, times every hole, times every course
revision.
**Risk:** drift between art and spec as courses get rebalanced; the checker is
mandatory, not optional.
**Touches `sim/`:** **no.**

**A note on the road not taken:** none of these require enriching the sim's
geometry vocabulary. If someday a *design* reason wants kidney-shaped ponds as
gameplay truth — not a graphics reason — that's a `sim/geometry.ts` feature
with balance-harness and test costs, decided on its own merits. Graphics never
forces it. The right answer for this proposal is that `sim/` is never touched,
and all three approaches above keep it that way.

---

## 3. Technical seams (the parts that can silently go wrong)

1. **Everything projects through the one Scale.** `ui/scale.ts` is the only
   place yards become drawing units (ARCHITECTURE.md §4.2), and because the
   viewBox is yard-space, new layers just emit yard coordinates. Any texture
   generator that computes its own pixel positions is the drift bug §4.2 was
   written to prevent.
2. **SVG stays the medium.** ARCHITECTURE.md §13.2 already settled this: SVG
   first, Canvas only if profiling demands it. Everything in (a) is native
   SVG — `clipPath`, `pattern`, strokes, and `feTurbulence` for grain (which
   takes an explicit `seed` attribute, so even the filter noise is stable).
3. **Edge wobble must be deterministic and stable.** Derive every displaced
   vertex from a hash of (hole number, feature index, vertex index) — a tiny
   mulberry32-style hash in `ui/` is fine; the `Math.random` and `Math.sin`
   bans are sim-purity rules and don't bind the UI. The reason isn't replay
   determinism, it's that the picture must be identical every frame and every
   mount. A shoreline that reshuffles on re-render looks broken and, worse,
   makes the player doubt the boundary. `Math.random` in a render path fails
   this even though it's legal there.
4. **The cone is exempt from all styling.** ART-BRIEF.md: "a lusher, more
   illustrated cone is a worse cone." The cone keeps its current flat wedge
   (per-direction colour token aside) and always draws above terrain and
   decoration.
5. **One existing honesty bug to fix while we're in there.** `HoleView.tsx`
   draws the green as an ellipse squashed to `ry = greenRadius * 0.85`, but
   `surfaceAt` tests a *circle* of radius `greenRadius`. A ball inside the
   sim's green near its far or near edge is currently drawn on the fringe.
   It's small — a couple of yards — but it's precisely the class of lie this
   document exists to forbid, and it's proof the honesty rule wants a
   mechanical check: a small `shot.test.ts`-style test that walks the drawn
   boundary paths and asserts `surfaceAt` agrees on both sides.

---

## 4. Recommendation and first slice

**Start with (a).** It delivers most of the visible improvement, costs days,
risks nothing the art brief hasn't already fenced, and leaves `sim/` alone.
(b) follows once (a) proves the cone still reads; (c) waits for course content
to freeze, exactly as ART-BRIEF.md says.

Which of the three worlds to build in is the real decision, and
ART-DIRECTIONS.html has already framed it (its closing read: Muni if the jokes
are the soul, Sunday Tape if the leaderboard is, Vellum if the yardage book
already feels right). The slice below works for any of them; Ink on Vellum is
the least rework because it's the current look's own bloodline.

**The first slice — one hole, one world, side by side:**

1. Pick **Pine Hollow hole 2, "Church Pew"** — the design doc's own poster
   hole: pinched corridor, pew bunkers both sides, water short-right of the
   green. If a restyle survives this hole's information density, it survives
   anywhere.
2. Add a `holeEdge()` helper in `ui/` — deterministic wobbled path along a
   true boundary, amplitude capped at ~1.5 yards, seeded per §3.3.
3. Restyle the layers in `HoleView.tsx` behind a dev toggle: textured rough,
   mow-banded corridor, wobble-plus-ink water, stippled bunkers, canopy
   trees, and the chosen direction's palette tokens in `styles.css`.
4. Fix the green-radius discrepancy (§3.5) and add the boundary-agreement
   test.
5. Evaluate with the toggle, old next to new, asking the art brief's one
   question: **does the cone against the fairway and the water still read at
   a glance?** If yes, roll it across the course. If no, remove texture until
   it does — the plainness was never the problem to solve, only the charm to
   keep.
