# COURSE CHANGES v8 — BATCH 2: six courses, one retune, and the ladder that moved

**From:** the course-design side · 25 Aug 2026 (the long night keeps going)
**Built:** `palmetto.ts` · `meadowlark.ts` · `driftwood.ts` · `foxglove.ts` ·
`brackenridge.ts` · `rivermouth.ts` — the whole COURSE-SLATE.md batch, owner-
approved, built in slate order under the depth engine (DEPTH-DECISION Option A,
shipped; Rivermouth's gate is open). Plus: the registry (`content/courses/
index.ts`, six new entries with measured fieldShifts), `coursecheck.ts` wiring
(all ten courses reported; an `ONLY=` env filter for iteration), `fieldcheck.ts`
targets for the six, one Salt Flats hole (The Mirage, the ordered retune), and
`schedule.test.ts` (the opener test had pinned "only one gentle course exists"
as if it were a law — pool growth exposed it; it now requires the opener to
visit the whole gentle tier).
**Not touched:** MONEY_CHECKS / ADVANCE_CURVE / prices (the calibration pass
owns them), everything in `src/sim/` and `src/ui/`, and every existing hole on
the original four courses except Salt Flats 6.

Every number is N=400, mixed policy, sharpness ×1.40, fixed seed bank, unless
marked. Every prediction below was written before its measurement; the
scratch predictions file is reproduced faithfully, including the wrong ones.

---

## 0. The ladder moved before the batch was measured, and every mean below

The depth engine re-based everything: planners that read the pitch band and
the tail play better golf. Same seeds, same courses, CHANGES-6's N=1600 era
vs tonight:

```
              CHANGES-6     tonight     drift
Pine Hollow     +1.23        +0.81      −0.4
Cottonwood      +1.02        +0.46      −0.6
Rockdale        −1.29        −1.94      −0.65
Salt Flats      +2.00        +1.19      −0.8
```

The slate's predicted means were written against the pre-depth ladder. Every
one of the six missed LOW, by more than the re-base alone explains — the
re-base is worth 0.4–0.8 and my misses run 0.2–2.0 — so the record should say
both things: the ruler shrank, and I also over-predicted difficulty on the
harder half of the slate, again. Right sign, wrong magnitude, third
consecutive batch. The per-hole architecture is where the night went well;
the means are where it didn't.

---

## 1. PALMETTO — the tempter · measured −1.64 (predicted −0.9)

**Predicted:** mean −0.9; REAL at 2 and 4; front four 2 REAL, one flat.
**Measured, final (v3):** mean −1.64 · REAL at **5** (Turndown Service,
0.38/64) · front four some/flat/some/some — **zero REAL in the cut window.
The course misses its front-four bar and I am not dressing that up.**

The iteration history, honestly:

- **v1 −1.96.** Gentler than Rockdale (−1.94), which the slate explicitly
  forbade. H2 Brochure 0.14/65, H4 Palm 0.20/73, H7 Infinity Edge 0.19/58 —
  all three REAL candidates under bar with splits mostly fine. The players
  disagree about the route and then birdie from both ends of it.
- **v2** (strip 3 closer on 2, Sentinel fix on 4, lagoon widened on 7, three
  greens 15→14): **−1.88, nothing moved.** Predicted 0.30–0.50 gaps; got
  0.14 / 0.27 / 0.22.
- **v3** (lagoon to the green's flank on 2, palm deepened + bunker onto the
  loose fit on 4, a pin-side water arm on 7, +25 total yards on the two
  giveaway fours): −1.68 → final −1.64, H2 **0.09** (worse), H4 0.25/75,
  H7 0.26/58. Iteration budget spent; all three recorded as misses.
- The one hole I hadn't touched — Turndown Service, the run-shear five —
  wobbled 0.34–0.36 across three runs with the split already there, and one
  green tightening (16→14) put it at **0.38/64 REAL**. A par 5, over the
  bar, on a gentle course. More on what that means in §7.

**The diagnosis that survived three failed fixes, and then explained two
other courses' misses too (the batch's first finding):** **two wedge leaves
never gap.** Brochure's fork is a 59 against an 81; the Palm's is a 78
against a rented 185 — and post-depth planners convert all of them at rates
too similar for a 0.35 gap, no matter what the drive had to argue with. The
Oak works at Rockdale because its brave leave is a 24-yard flop against a
133 approach — a whole birdie-probability class, not a better angle. Every
REAL hole in this batch has its two routes leaving different SHOT CLASSES.
Every miss has them leaving the same class off different stories.

**What Palmetto has instead of per-hole forks, measured:** the largest
full-round appetite gap in the ten-course pool — safe −0.30, mixed −1.64,
aggressive −2.04. Wanting it is worth 1.74 strokes here, the identity
question answered at course scale, with the per-hole gaps compounding in one
direction instead of forking. Whether that redeems a temptation course with
one printed REAL is the reviewer's call, not mine to grade for myself.

Also for the record: opener-safe confirmed (safe −0.30 at ×1.40), softlocks
zero, focus row never below 2.5.

---

## 2. MEADOWLARK — the second-shot course · measured −0.60 (predicted −0.4)

**Predicted:** mean −0.4 (band −0.8..0.0 — hit); REAL at 4 and 6; front four
1 REAL, disclosed in the slate as the gentle tier's price.
**Measured, final (v2):** mean −0.60 · REAL at **1** (First Cut, 0.35/64)
and **6** (The Unmown, **0.56/75**) · front four REAL/some/some/flat.

- **The Unmown, 0.56/75 first try, untouched.** The Ballwasher's structure
  at green offset −8, third data point for the open offset diagnostic:
  −10 forks (0.72/80 tonight), **−8 forks**, +18 doesn't (Postcard's old
  failure). The offset-interacts-with-aim-band question now has a bracket.
- **First Cut** measured 0.32/65 and the slate's pre-registered first fix
  ("flank bunkers two yards toward the line") plus green 13 carried it to
  0.35/64. The widening thesis does measure — barely, exactly as the slate
  registered the risk.
- **Millrace: the miss.** Predicted REAL; measured 0.10/58, then **0.07/63
  after the fix** (creek to 12 off the line, offset removed). Two
  iterations, recorded, done. Same disease as Brochure: a 60-leave against
  an 82-leave is wedge-vs-wedge, and the creek only prices the drive, which
  both wedges survive identically. If Millrace is ever revisited it needs
  its routes to leave different shot classes, not a wetter creek.
- Long Meadow (0.31/68) does its job: the one hole where the driver is the
  careful play — safe +0.67 taking the Stinger pays a third of a stroke
  over mixed's Bomb. The course refuses the lay-back rule of thumb, some-
  tier, as designed.

Check-week fitness (the Fall Series is check 2): conversion-shaped spread —
sd 1.37, no disasters (worst hole +0.36), softlocks zero. Registered.

---

## 3. DRIFTWOOD — the links · measured −0.59 (predicted +1.1)

**Predicted:** mean +1.1; REAL at 3, 4, 6; front four 2 REAL.
**Measured, final (v3):** mean −0.59 (the worst mean miss on the slate next
to Bracken's, see §0) · **four REAL: 3, 5, 6, 8** · front four 1 REAL + two
knife-edges.

- **The Burn (3): 0.29 → 0.35/65 REAL across two iterations,** and it is
  the batch's proof that the depth engine opened the design space the slate
  said it would. The naked Bomb's drawn tail is 38–46% inside a dry burn;
  safe reads the tail and plays the Stinger short of it; aggressive reads
  the leave and swings; Let It Chase threads the third way through. This
  fork **could not have measured before Option A** — it is The Crossing's
  mechanism on a course built to embrace it, and it sits beside SF1
  (0.56/80) as the second depth-native REAL hole in the game.
- **The Apron (5): 0.36/62 REAL untouched** — the Stinger-second's middle
  pitching ON the green while its edges run to the gorse line, priced apart
  by the two-band picture. **The Slough (8): 0.36/63 REAL untouched** — the
  wedge-gate five, no advertised sneak. **The Wee One (6): 0.51/73 REAL
  untouched** — the slot fork, pots at 10–18.
- **The Throat (4): the miss.** 0.23 → 0.34 → 0.33/68 across two fixes
  (pots in, pots long, green 13). Cart Path Only's own honest range is
  0.39–0.44 wobbling, and my copy sits just under it with the same shape:
  sand-wedge-vs-turf-wedge is *almost* a class difference. Recorded;
  knife-edge, front-four adjacent.
- Running Ground (1): 0.33/65, knife-edge, left alone — opener grade was
  the design.

The run-shear generator is hereby claimed and proven (D in the slate's
generator table gets its second citation). Mean miss goes to §0's account.

---

## 4. FOXGLOVE — the instrument that answered · measured −0.27 (predicted +1.4)

**Predicted:** REAL at 4 and 7; front four accepted at 1 REAL + funds; and
the pre-registration: *if every fork resolves into the same Extra-Club
lookup — high split nowhere — technique pricing, not geometry, caps the
game's decision count, and we escalate to card design.*

**Measured, v1, not one yard touched: four REAL — The Gates 0.37/65, The
Ledger 0.48/62, The Trust 0.35/61, The Steward 0.56/70 — front four 2 REAL,
zero iterations.** The only course in the batch that shipped as drawn.

**The pre-registered escalation DOES NOT FIRE.** The splits are 61–70% at
the priced holes: the appetites genuinely buy different fits — the free
loose Extra, the paid tight Smooth/Choke, and the patient lay all get
picked, and they score apart (the Ledger's safe pays +0.97 for patience
against mixed's +0.48). REVIEW-6 §8.3's worry — that the 1-focus tight fits
are priced too low to ever be refused — is answered by instrument: **when
both flanks of the free loose fit are live, geometry still forks.** The
finding is conditional and the condition is the Postcard lesson: the Gates/
Ledger/Steward all keep both bands of the ×1.35 stretch priced. Card
pricing stays un-escalated, with this course standing as the measured
reason.

The mean missed by the full §0 amount (+1.4 predicted, −0.27 measured) and
the steward would like it noted that safe play still pays +2.18 here — the
focus economy collects from the timid, which is what it was built to do.

---

## 5. BRACKEN RIDGE — the forest · measured +0.29 (predicted +2.3)

**Predicted:** mean +2.3 ("between Cottonwood and Salt Flats, where a second
major belongs"); REAL at 3, 4, 6; the slate's own registered risk that
corridor pricing — the least-proven generator — collects without deciding.
**Measured, final (v3):** mean +0.29 · **four REAL: The Keyhole 0.56/70,
The Long Quiet 0.49/63, The Spring 0.43/61, Cathedral 0.56/65** · front
four 2 REAL ✓.

- **The width bet half-paid, and the honest split is worth recording: the
  corridor forks the LONG holes and cannot fork the short ones.** Keyhole
  (a 13-yard neck against a ±28 stretch card) and Long Quiet (the Grind
  behind a 14-yard pinch) cleared first try. Cathedral — a par 5 closing
  through a 13-yard gauntlet — cleared at 0.51–0.56 across three runs,
  which no five had ever done (§7). But The Stand (0.14 → 0.18 → 0.23/73,
  miss, recorded) and First Growth (0.27 → 0.35/58, split two short,
  recorded) show the limit: where the leaves are short and the green is
  reachable from everywhere, width priced into fern (0.6 of a stroke of
  eval, no penalty) converges the same way Cottonwood's symmetric corridors
  always did.
- **The Spring became REAL by accident** (0.03 flat → 0.43/62 when the
  mercy's green went 14→13 in the hardening pass) — a 168 into a 13-yard
  green forks safe's lay-up-shaped caution against everyone else's mid
  iron. I kept it: the focus row at the 8th tee is unchanged (3.1), so it
  still funds the closer; it just stopped being free for the timid. The
  course now runs ask/fund/ask-ask/breathe/ask/ASK/ask, which bends the
  slate's rhythm — flagged for the reviewer rather than smoothed over.
- **The mean is the problem I could not fix inside the fences.** Two
  hardening passes (pinch 15→14→13, nave narrowed, fund lengthened 344→358,
  three greens tightened) bought +0.25 total, because corridor pricing
  falls almost entirely on SAFE (+2.92 → +3.28 across the passes) while
  depth-reading mixed planners thread 13-yard necks with 11-lateral-sample
  ease. A major venue measuring below Pine Hollow (+0.29 vs +0.81) is
  wrong, and more geometry is not the dial: the fork structure is finally
  good (4 REAL) and I decline to wreck it chasing a mean. Options that
  belong to other owners: event sharpness (majors play tighter late-season,
  which cuts BOTH ways), the calibration pass, or a future hardening round
  with fern promoted to aim-band strips (the slate's named fallback,
  unspent). **Bracken Ridge ships major-capable in structure and
  under-weight in strokes, and the doc says so in bold.**

---

## 6. RIVERMOUTH — the carry course, gate open · measured +0.67 (predicted +2.0)

**Predicted:** REAL at 2 and 4; front four 2 REAL; error bars widest on the
slate ("nobody has ever measured a carry-priced course because nobody
could").
**Measured, final (v3):** mean +0.67 — **the hardest non-major in the pool
tonight, and only the second course above par** · **three REAL: First Braid
0.60/70, Double Cross 0.68/70, Dry Land 0.55/66** · front four 2 REAL ✓
(1 and 4, not the predicted 2 and 4).

- **Double Cross is the best new hole in the batch (0.68/70, untouched
  after design-stage rework):** the naked Bomb's tail ends a drawn quarter
  inside the first braid, +15 buys the carry and hands its wider left edge
  to the side channel, the lay buys a stroke and keeps the second crossing
  unbought. Three purchases, three prices, exactly the slate's sentence.
  First Braid (0.60/70) overshot its "some" prediction — the taught lesson
  turned out to be a fork about HOW to cross, not just whether.
- **The Toll: the batch's most instructive corpse.** Predicted REAL;
  measured 0.03/44, then 0.03/44 after four more yards of water, then
  0.16/49 with the price moved to flank reeds. Two iterations, miss,
  recorded — with the engine finding attached, because the second attempt
  is what found it: **front water cannot dunk a high iron.** Water is
  rest-judged for the high ball, so a Mid Iron pitching in a braid's last
  yards ROLLS OUT DRY — the skip-across. A front edge can kiss the drawn
  pitch band all day and never once collect. Every yard of "the band clips
  the far edge" design on this course works because the braids are 20+
  yards deep front-to-back and catch the REST band; The Toll's apron edge
  was 5 yards from a green that takes priority, and nothing behind it could
  ever be wet. The law gains a clause candidate for REVIEW-7: *a carry
  price for a high shot is its rest band against the far edge, not its
  pitch band against the near one.* (The Stinger refusals are exempt —
  lowFlight is pitch-judged, which is why every braid still eats it.)
- The Bite (0.24–0.26 at **81% split** — the highest split in the pool
  attached to one of its smallest gaps) is the Ferry's lesson measured a
  third time: a cape lets every appetite buy its exact preferred bite and
  arrive at the same score. It was designed to "some" on purpose and did.
  The Mouth: 0.35–0.37/58–59 across three runs, one split point shy,
  knife-edge, recorded.

Softlocks zero in every scan — the wedge-flies-every-crossing construction
held (and the softlock scan's grid landed 371 positions inside braids and
found a legal shot from all of them).

---

## 7. Found in the batch, bigger than any one course

1. **Two wedge leaves never gap.** Brochure, Millrace, The Throat, The
   Stand — four misses, one shape: routes that leave the same shot class
   convert too similarly post-depth for gap ≥ 0.35, whatever the tee shot
   risked. The REAL holes all pay in shot CLASS (flop vs approach, owned
   number vs rented fit, on-green vs gauntlet chip). This should go next to
   "the forks that measure are discrete" in the law list — it is the same
   truth one shot deeper.
2. **The depth engine opened the space the slate predicted.** The Burn,
   Double Cross, First Braid, The Slough's honest gate — carries priced
   against drawn bands, measuring 0.35–0.68 with splits 63–70. Generator H
   (carry pricing) is claimed and proven; D (run/rest gating) has its
   embrace-side citation.
3. **The skip-across clause** (§6): front edges of water are decoration
   against high irons; depth of hazard is the real variable. Fifteen
   minutes with this clause would have saved The Toll both its iterations.
4. **The par-5 ceiling is dead.** "No five has cleared 0.48" predates
   tonight; the batch shipped Cathedral 0.56/65, Turndown Service 0.38/64,
   The Apron 0.36/62, The Slough 0.36/63, The Trust 0.35/61 — five REAL
   fives across four courses, plus the Verdict's 0.54/64 on the incumbent
   ladder. What changed is the second shot's menu being drawn: fives fork
   when the SECOND shot picks a rest band, and the tail made rest bands
   visible.
5. **Corridor pricing forks long and converges short** (§5) — Generator F
   is half-proven, with the boundary mapped: it needs the stretch card's
   cone against the neck at distances where laying up costs a class.
6. **Foxglove's pre-registration: geometry still forks when both flanks of
   the free stretch are live.** No card-design escalation. The technique
   cluster (145/148/155, 183/185/193) priced three REAL holes tonight.

---

## 8. THE MIRAGE — the ordered retune, and the miss

**The brief:** SF6 slipped 0.43/65 → 0.29/69 when depth landed. One
attempt, same loop.

**Prediction, written first:** the slab at 236–268 sits entirely short of
the Bomb's drawn rest band (264–290), so depth-aware appetites all read the
fly as safe and converge on it. Move the slab to 240–270 — the tail
honestly a quarter shaded, The Crossing's own post-depth mechanism — and
gap returns to 0.35–0.50 at split ≥ 65.

**Measured: 0.30/69, mean −0.11. The retune moved nothing** (0.29 → 0.30 is
noise; split unchanged). The mechanism diagnosis may even be right and
still not matter: at 300 yards both routes end in short-game class leaves
(a chip over the slab, an owned 133), so finding 1 applies — the Oak
transplant kept the Oak's obstacle and lost the Oak's tap-in-vs-approach
class difference when the depth engine taught everyone to convert. The
attempt is spent; the change stays (the drawn overlap is more honest than
the old margin either way), and The Mirage goes to REVIEW-7 as a **some**
hole at 0.30/69 with this diagnosis attached. Salt Flats stands at 3 REAL
(Crossing 0.56/80, Kiln 0.45/69, Verdict 0.54/64) — and NML fell to
0.24/72 in the same re-base, which is the reviewer's to rule on, not mine
to chase tonight.

---

## 9. The registry, the field, and the schedule

- **fieldShifts, measured per house law** (fieldcheck, 2000 fields/cell,
  sweep to ±0.1). Targets are the live measured player deltas vs Pine
  Hollow — the six new courses have never had any other ladder. Slate
  guess → linearization of measured → swept final:

  | course | slate guess | linearized | **shipped (swept)** | field Δ vs PH (target) |
  |---|---:|---:|---:|---|
  | Palmetto | −0.105 | −0.161 | **−0.182** | −2.49 (−2.45) |
  | Meadowlark | −0.073 | −0.093 | **−0.114** | −1.44 (−1.41) |
  | Driftwood | +0.026 | −0.092 | **−0.099** | −1.37 (−1.40) |
  | Foxglove | +0.046 | −0.071 | **−0.078** | −1.08 (−1.08) |
  | Bracken Ridge | +0.105 | −0.034 | **−0.034** | −0.48 (−0.52) |
  | Rivermouth | +0.085 | −0.009 | **−0.009** | −0.13 (−0.14) |

  Yes, every slate guess had the wrong SIGN on the hard half — the guesses
  were made against a ladder that no longer exists (§0). The original four
  keep their plan-era targets untouched pending the canon-ladder ruling
  (fieldcheck's standing caveat); the mixed state is called out in the
  TARGET table's comment rather than papered over.
- **Tiers as slot data:** Palmetto and Meadowlark register 'gentle' (the
  tier's membership goes 1 → 3, which the slate called the scarcest design
  space; the opener and both late check weeks now rotate). Foxglove
  registers 'brutal' — the tier means exactly "check weeks avoid me," which
  is its doctrine, not a difficulty claim; the registry comment says so.
  Bracken Ridge: 'brutal', **major-capable**, not majors-only — events 8
  and 11's shared venue draw can finally land on the course wearing its
  name. Driftwood and Rivermouth: 'standard'.
- **Two notes for the owner, outside my fences:**
  1. `season.ts` pins — the Rivermouth Open (5), Highwater Open (10),
     Sunbelt Open (1), Fall Series (9) and Coastal Classic (13) could now
     pin to their home venues the way Pine Hollow's events do (Rivermouth
     at event 5 also needs its tier kept 'standard', since event 5 is a
     check week and 'brutal' would bar the venue from its own Open). Left
     undone: season.ts is sim-adjacent content I chose not to touch.
  2. **Pool growth reshuffles every seed's schedule.** assignCourses draws
     from the pool by index, so the same run seed now deals a different
     season than it did with four courses. Determinism per seed holds and
     all constraint tests pass at 400 seeds, but a LIVE mid-season save
     that replays its action log will walk a different remaining schedule.
     That was inherent in "a future course simply registers" — saying it
     out loud is cheaper than a bug report.

---

## 10. Where all ten courses stand — the honest instrument, depth engine, N=400

Mixed policy, full round vs par. Bar: gap ≥ 0.35 AND split ≥ 60%.

```
                 full round   front four   spread(sd)   clears bar
Rockdale Muni      −1.94        −1.28        1.25        2  (R2 .72/80, R4 .35/74)
Palmetto           −1.64        −1.15        1.23        1  (P5 .38/64)
Meadowlark         −0.60        −0.29        1.37        2  (M1 .35/64, M6 .56/75)
Driftwood          −0.59        −0.20        1.23        4  (D3 .35/65, D5 .36/62, D6 .51/73, D8 .36/63)
Foxglove           −0.27        +0.17        1.39        4  (F1 .37/65, F4 .48/62, F5 .35/61, F7 .56/70)
Bracken Ridge      +0.29        +0.37        1.34        4  (B3 .56/70, B4 .49/63, B7 .43/61, B8 .56/65)
Cottonwood         +0.46        +0.20        1.47        5  (C1 .47/81, C2 .38/75, C3 .56/77, C4 .57/74, C7 .66/77)
Rivermouth         +0.67        +0.46        1.47        3  (V1 .60/70, V4 .68/70, V6 .55/66)
Pine Hollow        +0.81        +0.70        1.31        3  (PH4 .40/61, PH7 .59/73, PH8 .44/63)
Salt Flats         +1.19        +1.21        1.43        3  (SF1 .56/80, SF3 .45/69, SF8 .54/64)
```

Thirty-one holes over the two-axis bar across the pool, seventeen of them
in a front four. The pool's gentle tier has three members; every schedule slot
constraint has at least two courses to draw from; the opener rotates for
the first time.

- **Knife-edges, named so nobody frames a lucky run:** Palmetto 5 (wobbled
  0.34–0.38 tonight, counted only because its last two runs cleared),
  Driftwood 1 (0.33/65) and 4 (0.33/68), Bracken 1 (0.35/**58**) and 5
  (0.38/**58**), Rivermouth 8 (0.35/**59**), Meadowlark 1 (0.35/64),
  Foxglove 5 (0.35/61), Rockdale 4 (0.35/74). The N=1600 confirmation run
  belongs to the next review; these are the holes it will re-grade.
- **Recorded misses, all iterations spent:** Palmetto 2 (0.09/65) and 4
  (0.25/75) and 7 (0.26/58) · Meadowlark 4 Millrace (0.07/63) · Driftwood
  4 (0.33/68, also a knife-edge — both true) · Bracken 6 The Stand
  (0.23/73) · Rivermouth 2 The Toll (0.16/49) · The Mirage (0.30/69).
  Every one carries its diagnosis in its file's comments; five of the
  eight are finding-1 shapes.
- **Softlocks: ZERO — 37,605 positions across the ten canonical courses in
  the final run,** and zero in every iteration variant measured tonight
  (~20 configurations). The record survives its biggest batch.
- Focus rows: no tee below 2.5 anywhere; the funding structures behaved
  (Foxglove's double-fund delivers its thesis hole at 3.3).
- Definition-of-done: `tsc --noEmit` clean · vitest 100/100 (one new test:
  the opener must visit the whole gentle tier) · full ten-course
  coursecheck clean · this document.

One sentence for the tape, because the record likes them: the slate asked
for six places somebody could love, the harness agreed to eighteen REAL
holes' worth of them, and the ones it refused all refused for the same
reason — which is the only kind of failure worth writing down.
