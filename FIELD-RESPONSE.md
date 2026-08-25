# FIELD RESPONSE — the wall, named and charged

**25 Aug 2026 · proposal with predictions registered before measurement**

## 1. The wall, in one sentence

**You improve on three axes all season — the sharpness schedule (×1.40→×0.80),
equipment, deck thinning — and the 71 other players improve on none.** The
only seasonal pressure the field exerts is a shrinking survivor count
(`ADVANCE_CURVE`, 44→10), and a head count cannot chase a player whose
scoring distribution is walking away from a static one.

Measured from four independent angles, all tonight, all pointing here:

1. **cutcheck:** at a fixed cut line, mixed make-cut climbs from ~75% early
   to ~91% by event 14 — the squeeze runs backwards.
2. **moneycheck/shopcheck:** no static Money List thresholds reach the
   29%/14% late-check kill intent. Check 3's kill moved 3% → 6% while its
   bar rose $1.4M. Equipped survivors snowball past any number.
3. **Course difficulty bands:** Rockdale cannot be made harder (three
   hardening passes, ~0.00 total effect) because event difficulty lives only
   in the player's sharpness dial — the field never feels a course at all.
4. **REVIEW-5's threshold churn:** every economy re-anchor so far has been
   this wall wearing a different hat.

## 2. Where it lives in the code

`makeField` (sim/resolve/field.ts) draws every player's skill uniform
**0.25–0.85, identically at every event**. `advanceField` converts skill to a
per-hole score with a fixed bias. Nothing in either function knows what week
it is. The intro screen already promises the fix — *"the cut line tightens
faster"* — the mechanism just doesn't exist.

## 3. The proposal: the field the checks already imply

**Raise the skill FLOOR through the season; leave the ceiling alone.**

```
skill ~ uniform(0.25 + lift(event), 0.85)      lift: 0 at event 1 → F at 14
```

This is survivorship, which is the fiction the game already tells: the Money
List sends the bottom of the tour home at events 5, 9 and 12, so the fields
you face late in the year are *the players who kept their cards*. The floor
rising is exactly "the bad players stopped being here." The ceiling staying
put means the tour's best are the tour's best all year — you meet the same
winners, through a thicker crowd.

One parameter (`F`), carried as `fieldStrength` on `EventSpec` so that when
courses enter the schedule, a course can shift the field's scoring the same
way it shifts yours — the coupling the schedule work will need is the same
knob, already installed.

**Rejected alternatives.** *Steeper N / higher thresholds*: tried tonight at
four levels, measured, failed — that is finding #2. *A literal persistent
roster* (same 71 names surviving week to week): the right fiction someday,
but it drags name-continuity, per-player form, and UI along with it; the
floor lift buys the same distribution for one parameter. *Scaling the bias
instead of the floor*: moves everyone including the winners, which reads as
the whole tour secretly improving rather than the weak being culled.

## 4. Predictions, registered now

With `F` derived by cutcheck sweep (expected somewhere near 0.15–0.25):

1. **The squeeze turns around.** Mixed make-cut on the live advance curve
   runs high-60s early → high-20s late (the 75%→28% shape season.ts already
   claims), instead of climbing.
2. **A threshold triple hitting the 41%/29%/14% kill intent EXISTS.** Tonight
   it did not, at any level. The current $1.4M/$4.4M/$7.6M will over-kill
   late once the field responds (late earnings fall), so the triple will be
   re-derived — likely with a LOWER tail than tonight's, which is the wall's
   signature unwinding.
3. **Early season is untouched.** Event 1–4 numbers move by noise only
   (lift ≈ 0 there); the Canteen/Kiln course measurements are unaffected
   (coursecheck has no field in it).
4. **Safe play gets worse, not better** — a rising floor punishes par-pace
   most, which is P7's cut-to-a-place doing its job harder.

If prediction 2 fails — if even a responding field can't make the late checks
bite — the snowball is in equipment scaling, not field statics, and the next
dial is boost effect decay, not this one.

## 5. Procedure

1. `makeField(rng, floorLift)`; `fieldStrength` on `EventSpec`; reducer and
   every tool pass their event's value.
2. cutcheck sweep over F scalings → pick F on the make-cut shape.
3. shopcheck threshold sweep under chosen F → re-derive MONEY_CHECKS.
4. Update season.ts provenance, DESIGN.md §3.2 note, this file's §6 with
   measured-vs-predicted. Tests. The determinism suite must pass untouched —
   the field stream is named, so no other stream may shift.

## 6. Measured, same night

**F = 0.30**, from a cutcheck sweep over {0.10, 0.15, 0.20, 0.25, 0.30}.

1. **The squeeze turns around — CONFIRMED, at every F tested.** Mixed
   make-cut on the live advance curve at 0.30 (kit ×1): 87 71 70 69 52 56 59
   54 56 46 38 43 39 **31** — against the pre-response instrument that
   CLIMBED to ~91%. The tail lands a hair over the 28% ambition with
   equipment still to be earned on top.
2. **A triple hitting the kill intent exists — CONFIRMED for checks 1–2,
   residual at 3.** The dial answers now: check 2's kill tracked its bar
   20% → 28% → 32% where the static field had pinned it. MONEY_CHECKS
   re-anchored to $1.4M/$4.8M/$8.4M → kills 42/28/8, survival mixed 38%,
   aggressive 46%, safe ~4% (intent 36/45/3 — first two within noise).
   Check 3 kills 8% vs 14% intent and pushing its bar starves the
   win-pays-the-final-leg invariant before buying kill: per §4's escape
   clause, that residual is EQUIPMENT snowball, and its dial is boost decay
   if it ever matters.
3. **Early season untouched — CONFIRMED.** Event 1 identical to the digit
   at every F; the courses' numbers unaffected (no field in coursecheck).
4. **Safe play worse — CONFIRMED.** Safe shopper survival ~4%; the rising
   floor punishes par-pace hardest, which is P7's cut-to-a-place working.

One bonus the sweep bought for free: boost prices held 1.73–2.14× under the
responding field with no repricing — mid-band pricing absorbed a field
change whole, which is the argument for pricing to the middle forever.
