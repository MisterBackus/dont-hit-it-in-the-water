# COURSE REVIEW — Cottonwood & Rockdale Municipal

**Measured 25 Aug 2026** · `npx tsx src/tools/coursecheck.ts`, 400 rounds per
skill level per course, event-1 cone width (×1.40), starting deck, no equipment.

Both courses are **structurally sound and integrable**. Nothing here is a
rejection. Read §3 first — it is a mistake in my brief, not in your work.

---

## 1. Headline numbers

| | full round (mixed) | front four | **spread (sd)** | distinct 4-hole scores |
|---|---:|---:|---:|---:|
| Pine Hollow | +2.09 | +0.97 | 1.20 | 8 |
| **Cottonwood** | +3.33 | +1.74 | **1.76** | 11 |
| **Rockdale Muni** | +0.68 | −0.21 | 1.25 | 9 |

**Softlock scan: 0 dead positions out of 7,097 checked across both courses.**
Pine Hollow needed two rebuilds to reach that. You hit it first time.

Cottonwood produces **47% more score spread through four holes than Pine
Hollow** — the largest of the three, and exactly what §5 asked for. Rockdale
lands where its identity said it would: par is easy, the median player is under
par through four.

---

## 2. Every hole, and whether it contains a decision

The `choice?` column is the gap between how a **safe**, a **mixed** and an
**aggressive** scripted player score on that hole. A hole where all three score
the same is a **tax**, however hard it is: nothing the player chooses changes
the outcome. `REAL` is a gap of 0.40 strokes or more.

### Cottonwood — par 32
```
  1  4  390  The Lean          -0.46  -0.53  -0.38   0.15 flat
  2  4  460  Wrong Number      +1.30  +1.27  +1.34   0.07 flat   ← hardest hole in the game
  3  3  185  Postcard          +0.60  +0.46  +0.57   0.15 flat
  4  4  350  The Cottonwoods   +0.87  +0.54  +0.47   0.40 REAL
  5  5  530  Green Light       +0.47  +0.44  +0.42   0.05 flat
  6  4  315  Go On Then        +0.12  +0.06  +0.09   0.06 flat
  7  3  205  Dead Straight     +0.84  +0.43  +0.46   0.41 REAL
  8  5  545  The Walk In       +0.73  +0.67  +0.72   0.07 flat
```

### Rockdale Municipal — par 31
```
  1  4  305  Dew Sweepers      -0.89  -0.88  -0.59   0.30 some
  2  3  150  The Ballwasher    +0.58  +0.58  +0.56   0.02 flat
  3  4  330  Cart Path Only    +0.40  -0.18  -0.43   0.83 REAL   ← best hole in the game
  4  4  300  The Oak           +0.46  +0.27  +0.20   0.27 some
  5  5  490  The Only Five     +0.37  +0.20  +0.04   0.33 some
  6  4  325  Retention Pond    +0.20  +0.23  +0.31   0.11 flat
  7  3  160  Winter Rules      +0.64  +0.35  +0.42   0.29 some
  8  4  320  Last Call         +0.16  +0.10  +0.04   0.13 flat
```

### Pine Hollow, for calibration
```
  1  4  380  Handshake         -0.80  -0.80  -0.83   0.03 flat
  2  4  442  Church Pew        +1.02  +0.47  +0.89   0.55 REAL
  3  3  175  The Pond          +0.48  +0.27  +0.25   0.23 some
  4  4  465  The Grind         +1.32  +1.03  +0.90   0.41 REAL
  5  5  520  Two Ways Home     +0.69  +0.44  +0.37   0.32 some
  6  4  310  Have a Go         +0.02  -0.11  -0.14   0.16 flat
  7  3  210  The Long One      +0.89  +0.38  +0.39   0.51 REAL
  8  5  545  Home              +0.57  +0.40  +0.29   0.28 some
```

**Rockdale's third hole is the best hole anyone has built for this game.** Safe
play makes bogey, aggressive play makes birdie, and 0.83 strokes separate them.
Nothing on Pine Hollow comes close. Whatever you did there, do it again.

---

## 3. My brief was wrong, and it cost Cottonwood

§5 asked the front four to "spread people out". Cottonwood does that better than
anything else in the game. But **spread from variance is not the same as spread
from decisions**, and I did not distinguish them.

Cottonwood's spread comes from the diagonal punishing the edges of cones the
player did not choose. Six of its eight holes are flat: safe, mixed and
aggressive all score the same, so the number that comes out is the cone's
opinion, not the player's. That is a wider distribution feeding a place-based
cut — which makes the cut *more* of a lottery, not less, which is the opposite
of what the change to top-N was for.

Rockdale, with lower total spread, has more of it under the player's control.

**Revised target, replacing §5:** the front four should contain **at least two
holes with a `choice?` gap of 0.40 or more**, and no more than one flat hole.
Total spread is a means; decision spread is the end.

- Cottonwood front four: 1 REAL, 3 flat. → needs work on holes 1, 2 and 3.
- Rockdale front four: 1 REAL, 2 some, 1 flat. → close; hole 2 is the weak one.
- Pine Hollow front four: 2 REAL, 1 some, 1 flat. → the bar to beat.

---

## 4. Answers to your assumptions, in your numbering

1. **You were right to design on finishes** — the ball's resting place is
   carry + run-out, and §2's "265 leaves 177" was my sloppiness, not the
   engine's. **But run-out is surface-dependent and you were not told:**
   `×0.30` if it pitches on the green, `×0.40` in rough or deep rough, full
   otherwise. So Stinger finishes 255 only when it pitches on short grass; in
   rough it finishes ~237. Re-check any leave where the pitch lands off the
   fairway.
2. **Correct.** `length` is the along-axis coordinate of the green centre and
   `greenSide` is perpendicular to it. True tee-to-centre is the hypotenuse.
3. **Correct, with one addition.** Surface is judged where the ball comes to
   rest — *except* for low-flight shots (Stinger, Bump and Run, Punch Out),
   where **water and OB are judged at the pitch point**, before run-out. Trees
   are not. So Cottonwood 4 works exactly as you designed it: Bomb finishes at
   277, past the copse's 270 limit, and is clear; Stinger pitches at 225 and
   finishes 255, both inside the copse, and is in the trees. The trap is real.
4. **Correct.** Shortening also widens the cone — `spread × (1 + takeOff × 2.2)`
   where takeOff is the fraction of the card's distance not used. A Full Wedge
   from 36 yards has a ±15 cone, not ±6. Rockdale's birdie economy survives
   this, but it is why its short holes did not score lower than they did.
5. **Wrong, and it matters most for you.** Lateral scatter is the cone.
   **Depth error is ±5% of carry**, independent of the aim jitter — ±13 yards
   on a Bomb, ±5 on a Full Wedge. Rockdale's 13-yard greens are being missed
   long and short more than your model expected, which is where several of the
   birdies you priced in went.
6. **Correct.** Lie multipliers apply before shortening, so a Pitch from rough
   is 70 × 0.9 = 63 and then plays to the pin.

---

## 5. Two specific notes

**Cottonwood 2, "Wrong Number", is the hardest hole in the game** (+1.27 for
everyone) and one of the flattest. Its bend puts the pond where every approach
cone leans, so the punishment arrives regardless of the card played — which
means the hole is a bogey tax rather than the "right answer depends on your
hand" hole the comment describes. Either widen the corridor at 360 or move the
pond further off the diagonal so the *chosen* line can miss it.

**Cottonwood is 1.2 strokes harder than Pine Hollow** and Rockdale is 1.4
strokes easier. That is a wide band and it is not your problem to fix — but it
is an integration problem on my side, because the simulated field currently
scores the same regardless of which course it is standing on. Until the field
responds to course difficulty, putting Cottonwood in the schedule would quietly
make its cut brutal and Rockdale's trivial. That work is mine.

---

## 6. Verdict

Both integrate. Rockdale is the stronger course and the more useful one, because
it proves the low-scoring end of the cut-by-place system works and it contains
the single best decision hole yet built. Cottonwood is the more distinctive
world and the better piece of writing; it needs three of its flat holes to grow
a decision before it earns a spot in the rotation.

If you want a third: the direction still open is **the unfair major**, and the
number to aim at now is not difficulty. It is `choice?` — a course where every
hole is a fork and none of them is comfortable.
