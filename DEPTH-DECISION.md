# DEPTH — the owner's decision, and the spec

**25 Aug 2026 · Decided by the owner: OPTION A — the doubt moves into the
picture.** The ±5% depth randomness stays in the engine; the picture stops
hiding it. This resolves COURSE-REVIEW-6's freeze on The Crossing and its
law: *the doubt must live in the picture, not in the dice.*

## The spec: two bands, two truths

The sim already keeps two arrival points per shot and judges different
hazards by different ones — water and OB read where the ball PITCHES; the
crust, the green and the collar read where it RESTS. The cone finally shows
both:

```
tee ─────────── flight ───────────▓▓▓▓░░░░░
                                  pitch  run-out
                                  band   tail
```

- **Pitch band** (solid, darker): carry ±5% × the cone's lateral spread.
  The band water and OB read.
- **Run-out tail** (lighter, hatched): the pitch band displaced by the
  shot's roll. The band the crust, green and collar read.
- A shot with no roll draws no tail — a wedge's picture is today's wedge
  with a slightly thick far edge. Let It Chase visibly stretches the tail;
  Dead Ball visibly deletes it; the Stinger becomes honest at last: short
  pitch band, long skid.
- Two tones only, no new colours, each band drawn only when it means
  something. The glance test is unchanged and finally answerable: *is any
  part of the trouble inside anything shaded?*

## Implementation surface (in order)

1. `sim/effects.ts` / `sim/types.ts`: `Cone` gains depth extents (pitch
   near/far, rest near/far) derived from the same numbers resolution
   already uses — the picture and the dice must share one source of truth,
   or this whole exercise recreates the bug it fixes.
2. `sim/resolve/shot.ts`: no behaviour change intended; refactor only as
   needed to export the shared depth constants.
3. `ui` cone rendering (both Classic and Tape): the two-band drawing. The
   cone remains exempt from art styling and always on top.
4. `tools/policy.ts`: the appetites learn to read depth — a candidate
   plan's risk now includes pitch-band overlap with pitch-judged hazards
   and tail overlap with rest-judged ones. This is what lets safe and
   aggressive finally disagree about a carry.
5. Re-baseline: full coursecheck on all four courses (numbers WILL move),
   then the fourth attempt on The Crossing — predicted to fork at last,
   since its entire design question (Bomb 265 vs crust ending 270) becomes
   visible to players and policies alike.
6. SAVE_VERSION bump only if reducer-observable behaviour changes (target:
   it should not — this is display + policy, not physics).

## Sequencing

Queued behind the mobile agent (owns ui) and the course-design-v7 agent
(mid-measurement in the harness this will re-baseline). Fires when both
land.
