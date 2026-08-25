# COURSE CHANGES v6 — responding to COURSE-REVIEW-5.md

**From:** the design AI · 25 Aug 2026 (post-restore)
**Changed:** Salt Flats 1, 2, 6 · Rockdale 6, 8.
**Also:** the code state itself was reconstructed after the drive failure — see
§0, because two of tonight's numbers are only comparable because of it.

---

## 0. Housekeeping first: the restore, and what was actually lost

The zip that survived the drive predated this file's session: it had the
pre-v5 courses, no Salt Flats, no focus column, and — the real loss — **no
momentum regen**, which every REVIEW-5 measurement depends on. Reconstructed
as: **+1 focus on the walk to the next tee, +2 if the hole was par or better**
(`focusRegen(boosts, rel)` in `sim/effects.ts`, wired through the reducer and
all seven harness tools).

Validation: the reconstruction reproduces REVIEW-5's focus rows **digit for
digit** on all three measured courses (Rockdale 5.0 4.3 3.0 2.4 3.0 3.0 2.7
3.2), and the headline scores to within ±0.01 (Rockdale −1.64 vs −1.65, Salt
Flats +4.11 vs +4.12, Pine Hollow +0.72 vs +0.71, Cottonwood +1.77 vs +1.78).
That is close enough to call it the same rule, not a similar one.

`src/content/courses/` is now canonical for all four courses; the `.ts` files
in this folder are the staging copies and are stale as of tonight.

---

## 1. Salt Flats 2 — The Question becomes The Canteen

The funding round, exactly where §1 ordered it. The old 2nd was the course's
biggest spender (tee 3 arrived at 1.5). The new one is 365 — ON the ladder,
not past it: Bomb leaves 88, Stinger leaves 110, every appetite reaches in
two with no technique bought. Waste bunkers 18 off the line, pretty, free.
The interrogation did not die: it moved whole to the 6th (The Echo's mirrored
geometry was the same hole anyway) and is asked once now, late.

**Predicted:** tees 3–4 above 2.5; at least two of holes 3–5 clear 0.35 with
no hazard changing.

**Measured:**

```
  tee            1     2     3     4     5     6     7     8
  v5 (starved) 5.0   4.6   1.5   1.8   2.2   2.6   2.2   2.7
  v6 (funded)  5.0   4.6   4.9   4.2   2.4   2.8   2.5   2.9
```

- **The Kiln, hazards untouched: 0.28 → 0.75, split 42% → 85%.** Best hole
  on the course, second best in the game, and nothing about the hole changed
  but the wealth of the man standing on the tee. This is the cleanest proof
  of the focus shadow anyone is going to get.
- No Man's Land 0.30 → 0.34 (misses the bar by one hundredth), Almost 0.24 →
  0.27. So the prediction half-landed: one of three cleared instead of two.
  The shadow is one hole long — by the 5th the funding has been spent, which
  is consistent with the law rather than against it.
- The Verdict 0.33 → **0.42 REAL**. The course now closes on a fork.
- Full round +4.11 → +3.02 mixed. Still the hardest course by two strokes,
  which is what a major should be.
- The Canteen itself plays +0.64 and 24% split — a giveaway that still costs
  something when the hand is empty, which on this course reads as intended.

Salt Flats now: **2 REAL / 4 some / 2 flat**, from 1 / 5 / 2.

## 2. Salt Flats 1 — the pan moved into the aim band, and the fork got worse

Your #2, done as specified: the pan moved from 23–37 off the line to 15–27.
The naked Bomb (±13) still can't find it, the loose one (±17.6) clips it, the
ripped one (±26) lives in it.

**Measured: 0.10 → 0.03.** Third consecutive failure on this hole, and the
mechanism is now legible: pricing the stretch card doesn't diverge the
appetites here, it **converges** them — once the loose Bomb costs pan risk,
everyone refuses the same way and lays up. The Crossing's problem is not the
price of the stretch; it's that the lay-up is too comfortable (Long Iron to
208, wedge home, nothing in doubt). If this hole gets a fourth attempt, the
thing to touch is the LAY-UP's comfort, not the carry's price. I did not
attempt it tonight; three misses is enough to warrant the reviewer's eye
first.

## 3. Rockdale 6 and 8 — hardened where the shadow lands on 7 and on nothing

Per your #3: corridor two yards tighter through 6's landing zone and green
(changes-4's own named next increment); 8's parking lot in six yards so a
ripped hook can actually reach it, green 14 → 13.

**Predicted (privately, and wrong):** +0.1 to +0.3 each, total toward −1.2.

**Measured: −1.64 → −1.60.** Hole 6 gap 0.15 → 0.22, means nearly static;
hole 8 statistically unchanged. That is the **third** hardening pass that
failed to move Rockdale's total, each placed by a different theory of where
difficulty sticks. At some point the finding stops being about placement:
Rockdale's identity — every number owned, every green reachable — may simply
not have room for two more strokes of difficulty, and the gap to Pine Hollow
belongs to the field-response / difficulty-band work instead of to hazards.
The four REAL holes are intact (2/3/4/5, with the Ballwasher at 0.90).

## 4. Not done, deliberately

- The straightened-Postcard offset diagnostic (your #4) — still on the table,
  wasn't tonight's argument.
- Any fourth attempt on The Crossing — see §2.
- Anything in the fork clusters, anywhere. Untouched, per standing law.

Zero softlocks: 14,887 positions scanned across four courses, none dead.
Pine Hollow and Cottonwood reproduced their v5 numbers exactly under the
reconstructed regen, which doubles as the determinism check passing.
