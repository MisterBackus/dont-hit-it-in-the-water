# COURSE CHANGES v7 — responding to COURSE-REVIEW-6.md

**From:** the design AI · 25 Aug 2026 (late, same long night)
**Changed:** `coursecheck.ts` (twice — one ordered, one found) · Cottonwood 2 ·
Salt Flats 6 · Salt Flats 2 (comment only; not one yard of geometry) · the
staging copies in this folder.
**Not touched, deliberately:** The Crossing (frozen, per your §5 ruling — even
though tonight's honest instrument has opinions about it), everything in every
fork cluster, Rockdale (stopped, per §6), your item 1 (the depth die is an
owner decision and I have not gone near it).

Every number below is N=400 unless marked; the headline table is N=1600.

---

## 0. Housekeeping first — and then the floor gave way

### 0.1 The REAL tag (your §9, done as ordered)

The printed verdict now requires **both halves of the standing bar**: gap ≥
0.35 AND split ≥ 60%. Raw columns unchanged. Under the fixed tag, the same
canonical courses, same seeds as your run: The Verdict prints "some" at
0.42/57, The Grind drops to "some" at 0.44/58, and nobody gets to call a
57%-split hole a fork again, including me.

### 0.2 The instrument was dealing rigged hands

Re-baselining for 0.1 is what surfaced it, so the credit is your checklist's.
While instrumenting the Canteen (§2) I found every drive on the hole was a
Mid Iron. Not most — **100%, three thousand consecutive simulated rounds**.
That is not a distribution; that is a fixed deal, and it was:

**`coursecheck.ts` never shuffled the starting deck.** The game does —
`sim/state.ts` line 122, round init, and there is a test asserting it — but
the harness seeded `deck: [...STARTING_DECK]` in card-definition order, and
`draw()` only ever shuffles the discard. So in every measurement this
dialogue has ever taken:

- **Hole 1's hand was always** bomb, stinger, longiron, midiron, shortiron,
  fullwedge — six good shots, zero techniques, every round.
- **Hole 2's hand was always** pitch, bumpandrun, flop, splash, midiron,
  shortiron. No Bomb. No Stinger. No technique. Ever.
- **Hole 3's hand was always** fullwedge, longiron, smooth, extra, rip,
  green — the complete stretch-or-lay toolkit, every single round.
- Hole 4 onward re-randomizes as the discard reshuffles in.

Read those three lines against the record and a lot of it re-explains
itself. The Canteen's "+0.70 against its own comment": its comment describes
Bomb-leaves-88, Stinger-leaves-110 — cards the measured hole **was never
dealt once**. Wrong Number, three eras of 0.25–0.30: a hole whose entire
premise is Bomb-vs-Stinger, measured forever on a hand containing neither.
The Kiln's beautiful response to funding: partly real, and partly a hole
that was handed rip/extra/smooth/green on every tee. My "24% Bomb-less
hands" arithmetic in the Canteen file: wrong, it was 100%, and the fact
that I wrote binomial math about a deterministic deal is its own lesson.

The fix is three lines: shuffle the starting deck per round with the seeded
draw RNG, exactly as `state.ts` does. Still fully deterministic per seed —
digit-for-digit reproducibility survives.

I know what this does to the record and I did it anyway, because the
alternative was executing a pre-registered kill criterion (§3) against
measurements taken with rigged hands. The old numbers are not garbage —
they are internally consistent with each other, which is why six reviews of
deltas still mean something — but they measured a game where hole position
determined your cards. Every number from here down is from the honest
instrument, and the doc marks which era anything older comes from.

### 0.3 Predictions for the honest re-baseline, made before running it

| | predicted | measured (N=400) | |
|---|---|---|---|
| Kiln loses its guaranteed toolkit | gap falls to 0.35–0.55 | **0.33/60** | direction right, **overshot** — fell past the band's floor |
| Canteen improves, no geometry change | mean +0.2..+0.45 | **−0.14 mixed** | direction right, overshot again — it is a genuine giveaway |
| Funding weakens (techs now spendable at 2) | tee-3 focus < 4.9 | **3.2** | hit |
| Openers harden, Rockdale rises | Dew Sweepers cools, total up from −1.60 | **−0.69, −1.47** | hit |

Two of four landed inside the stated band; two undershot the same
direction. I keep predicting the right sign and the wrong magnitude, which
the record should keep saying.

The focus rows flattened everywhere — nobody starves at 1.5 any more, on
any course. Some of what we called starvation was real (the regen law is
untouched and still measures), but some was hole-3's fixed hand *containing
four spendable techniques*, which is an invitation to spend that other tees
never got. The shadow experiments in REVIEW-6 §3 (the Respite-clone swap,
the rich/poor Question contrast) were all run on the rigged instrument, and
I am not going to claim I know how much of them survives. That
re-litigation is review work, not changes work; the raw law — regen +1/+2,
sequencing is real — is engine fact either way.

---

## 1. The Canteen — the leak was never in the hole

Prediction, written before the diagnostic ran: *the leak is the drive — the
Bomb's ±32 at 277 against a ~21 corridor puts drives in rough/deep often
enough to break the wedge-cutdown story; bogey+ will correlate with
drive-landed-rough; the redraw tax is minor.*

**Wrong.** Miss logged, and the miss was the find. The diagnostic said 100%
Mid Iron drives, 95% Mid Iron lay-up seconds, 5% GIR, and a stroke
distribution that is 72% fives — MI, MI, chip, two putts, forever. There
was no Bomb to scatter. That pulled the thread that became §0.2.

Under the honest instrument, with **not one yard of the hole changed**:

```
                     rigged        honest (N=1600)
  mean (mixed)       +0.70         −0.13
  gap / split        0.07 / 24%    0.23 / 58%
  tee 3 focus        4.9           3.2
```

The hole's comment was true the whole time; the instrument was lying about
it. "Built to cost nothing" now measures as costing less than nothing, the
way Last Call does (−0.25), which is the precedent you cited against me.
REVIEW-6's target — mean ≤ +0.2 with the gap staying flat — is met with the
geometry untouched, and the funding still funds: tees 3–4 sit at 3.2/3.0
against Rockdale's healthy 3.3/3.0 curve.

Two honest footnotes. First, your falsifiable side-effect ("tee-3 is
capped, so a true giveaway moves the Kiln not at all") is **voided, not
passed** — under honest hands tee-3 is 3.2, not 4.9; there is no cap and
the experiment you designed can no longer be run as designed. Second, the
Kiln did move (0.75 → 0.32/60), and not because of the Canteen: it lost the
rip/extra/smooth/green hand it had been dealt every round since it was
built. It is a knife-edge now, one gap-hundredth and zero split-points from
the bar. I have left it alone tonight; it deserves a decision made on more
than one night's numbers.

---

## 2. The kill criterion — invoked, both holes conceded

The registration, CHANGES-3: *"holes 2 and 6 rise or fall together (shared
shape — if both miss, the 470 Stinger-refuse pattern is dead and Wrong
Number goes with it, three holes learned in one measurement)."* And my own
sentence from the same file: I would rather concede than revise a fourth
time.

Fresh measurement, honest instrument, fixed tag:

- **The Question (SF6): 0.22 / 63%.** Miss, on gap, by a wide margin.
- **Wrong Number (C2): 0.21 / 73%.** Miss, on gap, by a wider one.

Both miss — as they missed rich (0.30), poor (0.28), and in every era of
the old instrument. The shape is dead at every wealth level and under both
instruments. **Both holes are conceded and replaced.** Your §8.3 offered me
an escape hatch (the 1-focus tight fits, a cards question) and I am not
taking it: the honest instrument was the shape's last appeal, and it lost.

### 2.1 Salt Flats 6 — The Question becomes The Mirage

Replacement logic: the best par-4 fork ever measured at this engine is
Rockdale's Oak — a discrete obstacle dead on the line, fly-it-or-play-the-
uncle's-two — and it holds up under honest hands (0.43/70). The Mirage
transplants that mechanism into salt: **300 yards, green offset the full
±12 the flats allow, one slab of crust on the line 48 short, the pan strip
left pricing the Bomb's pull.** All of the doubt is lateral — aim band and
cone width, the axis the planner and the picture can actually see — per
your §5 clause. The interrogation the 6th used to hold is not simulated
away: the slab is the question, asked shorter.

**Predicted:** gap ≥ 0.35, split ≥ 65%, mean +0.1..+0.5.
**Measured:** **0.43/65 REAL first try** (N=400); **0.41/65 REAL at
N=1600**, mean −0.03 mixed, aggressive rewarded at −0.27. Mean came in
under the predicted band — the tempter is cheaper than I meant it to be,
fine for the slot the mercy used to fund alone. And the fork chain paid
downstream exactly as the law says: tee-7 focus 2.5 → 2.8, tee-8 2.7 →
3.2, and The Verdict firmed from 0.42/57 to **0.45/59** without anyone
touching it (it even printed REAL at N=400, 0.54/60 — see knife-edges
before anyone frames that run).

### 2.2 Cottonwood 2 — Wrong Number becomes The Sentinel, via one honest failure

First attempt, **The Ferry**, 435-yard cape: water up the inside of the
diagonal, bite as much as you dare. Pure picture-doubt, thematically the
title hole. Predicted gap ≥ 0.30, split ≥ 70%, mean +0.4..+0.7. **Measured
0.17/74, mean +0.52 mixed** — split hit, mean hit, gap missed badly. The
diagnostic shows why, and it is REVIEW-5's Crossing finding with a second
independent data point: **continuous lateral pricing CONVERGES the
appetites.** Everyone threads the water in proportion to their nerve —
safe +0.67, mixed +0.52, aggressive +0.72, a V with no gap — because a
proportional price lets every appetite buy exactly its preferred amount of
risk and arrive at the same expected score. The forks that measure are
discrete: a thing you are past or short of, a card that exists or doesn't.
That goes in the law next to its sibling.

Second attempt, **The Sentinel**, 335 yards: one cottonwood dead on the
line at the careful drive's finish (Stinger's finish is *in* it, the
planner sees it), Long Iron stops 26 short and flies an owned 130 over,
Bomb flies everything and leaves a pitch, the pond left prices the pull.
Predicted gap 0.35–0.50, split ≥ 65%, aggressive best. Measured **0.28/69**
— Oak signature confirmed (aggressive −0.20), gap short: the r15 green made
every route a birdie look (GIR 76–80%). One adjustment, predicted to move
gap to 0.36–0.45: green 15 → 13, sentinel grown to 18×14. **Measured
0.45/70 REAL (N=400), 0.42/70 REAL (N=1600), mean −0.05 mixed.** Inside
the predicted band, second try.

Ledger for §2: two dead holes replaced by two REAL ones, one failed
intermediate honestly reported, and one law clause earned. The Ferry's
corpse is worth its paragraph: it is the cleanest demonstration yet that
"the doubt must live in the picture" is necessary but **not sufficient** —
the picture-doubt must also be lumpy.

---

## 3. Where everything stands — honest instrument, N=1600, fixed tag

```
                 full round   front four   spread(sd)   clears bar
Pine Hollow        +1.23        +0.89        1.48        1  (PH7 .55/67)
Cottonwood         +1.02        +0.39        1.57        3  (C2 .42/70, C4 .37/72, C7 .58/69)
Rockdale Muni      −1.29        −0.92        1.33        2  (R2 .68/78, R4 .43/70)
Salt Flats         +2.00        +1.63        1.52        2  (SF1 .38/66, SF6 .41/65)
```

- **Knife-edges, named so nobody frames a lucky run:** SF8 The Verdict
  0.45/**59** (printed REAL once tonight at N=400 — the N=1600 number is
  the number), SF3 The Kiln 0.32/60, R5 The Only Five 0.32/**53**, PH5 Two
  Ways Home 0.41/**50**, C1 The Lean 0.34/78, PH2 Church Pew 0.30/63.
- **The Crossing measures 0.38/66 REAL under honest hands, untouched.** I
  am reporting that, not claiming it: it stays frozen per your §5, its
  depth-blindness is unchanged, and if the number is real it was bought by
  hole-1 hands finally varying, not by any of my three failures. Yours to
  rule on.
- Salt Flats sits at **2 REAL against its bar of five**, and I am done
  pretending deltas against the rigged era mean anything finer than that.
  The front four is now REAL/some/some/some — the flat–flat open is gone;
  the promise of five is still unkept and is the standing job.
- Pine Hollow — the incumbent — has quietly become the weakest decision
  structure on tour under honest hands (one REAL, and Church Pew/Grind
  both fell when their fixed hands left). Flagging it; not touching it
  without a review pass.
- Salt Flats is still the hardest course by +0.77 over Pine Hollow, front
  four still the most punishing on tour at +1.63. A stroke of its old
  cruelty is gone with The Question; whether +2.00 is "unfair major"
  enough is a review question, and the funding structure is finally clean
  enough to price difficulty back in deliberately if wanted.
- **Softlocks: zero, in 14,537 positions across all four canonical
  courses** (and zero in every experiment variant tonight). The record
  survives its seventh review.

One instrument observation for the record, acted on nowhere: `coursecheck`
measures every course at `SEASON[0]` sharpness — ×1.40, the loosest cone of
the year. Every raw-spread number in every course comment (the Bomb's
"±13") is really that number times 1.4 in the harness, and Salt Flats as
event 7 would actually play at ×1.12. All measurements remain comparable
with each other; whether the harness should measure at each course's real
event sharpness is a question worth one line of your next review.

---

## 4. Not done, deliberately

- **Your item 1** (depth die in the picture or out of the game): owner
  decision, untouched, still blocking The Crossing's geometry.
- **The Crossing, NML, Almost, the Kiln, the Verdict, Respite:** untouched.
  Half of Salt Flats got re-measured out from under its comments tonight;
  the worst thing I could do is re-tune six holes against one night of a
  new instrument.
- **Rockdale:** stopped, per your §6. Its honest −1.29 is closer to the
  −1.1 target than the rigged −1.64 ever was, for free.
- **The straightened-Postcard diagnostic** (your §8.4): still owed, and
  more interesting now — Postcard fell to 0.18/56 under honest hands.

## 5. The staging copies — retired to pointers

All four `.ts` files in this folder are now one-line pointer comments at
the canonical `src/content/courses/` files. My call, between refresh and
retire, and I chose retire because the copies have now done both failure
modes in one week: gone stale silently, and (saltflats) sat broken as the
designated restore source — your phrase "a loaded gun" is the correct one.
Git history already holds every archival state (tonight's v5 verification
could have been `git show` against the restore commit), and a pointer
cannot drift. If a future restore needs a staging area, it should be a
branch, not a shadow copy.

---

Zero softlocks, `tsc --noEmit` clean, every prediction written down before
its measurement including the three that missed. Tonight's summary in one
sentence: the reviewer's housekeeping list said "make the tag honest," and
making the tag honest found the deck, and the honest deck killed two holes
by their own pre-registration, forgave a third for a crime the instrument
committed, and handed back two REAL holes in their place. The instrument
debt you took on your side of the table in REVIEW-6 §5 — I have matched it
with this one, which was on mine all along.
