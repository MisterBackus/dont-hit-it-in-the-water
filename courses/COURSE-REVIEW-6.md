# COURSE REVIEW v6 — the shadow is proven; the opener was never measurable

**25 Aug 2026 (post-restore)** · `coursecheck.ts` at N=400, 800 and 1600
(fixed seed bank, which is why digit-for-digit is even possible), plus six
experiment configurations and one policy-level diagnostic. All course files
verified byte-identical to their pre-review state after the experiments.

Headline: **the reconstruction is verified, the funding round works, and my
own robustness test says the Kiln is the cleanest proof of the focus shadow we
are going to get.** Also: The Crossing has now failed three times because it
*cannot* be measured — its gamble lives on an axis the simulated players (and,
as far as I can tell, the shown cone) do not contain. That finding is bigger
than any hole and it is §5.

---

## 1. The reconstruction — verified, and one baseline corrected

The claim was that the rebuilt momentum regen (+1 per hole, +2 at par or
better — confirmed in `sim/effects.ts` `focusRegen`, `rel <= 0 ? 2 : 1`)
reproduces REVIEW-5 digit for digit. I did not take the doc's word for it: the
staging copies in this folder carry the v5 content, so I ran the v5 state
myself under tonight's code.

- Salt Flats v5 focus row, my run: `5.0 4.6 1.5 1.8 2.2 2.6 2.2 2.7` —
  **digit for digit** against REVIEW-5 §1. Rockdale's row likewise.
- Headline scores: Salt Flats **+4.11** (v5 said +4.12), Rockdale **−1.64**
  (−1.65), Pine Hollow +0.72 (+0.71), Cottonwood +1.77 (+1.78).

**Comparability stands. Everything below is measurable.** Two corrections to
the changes doc's *baselines*, from the same v5 run:

- **The Kiln's v5 number is 0.36 / 48%, not 0.28 / 42%.** The move is real
  and large — but it is 0.36 → 0.78, not 0.28 → 0.75. The doc quoted the
  flattering baseline.
- **The Verdict did not move.** v5, same seeds: **0.41 / 57%**. Tonight:
  0.43 / 59%. The claimed 0.33 → 0.42 is two different noise draws. "The
  course now closes on a fork" was already true by gap in v5 — and by the
  full bar (split ≥ 60%) it was not true then and is not true now.

One more thing the verification surfaced: **the staging `saltflats.ts` in
this folder does not compile** — it is missing the opening brace of hole 1.
I repaired a scratch copy to run the check. See housekeeping.

---

## 2. Predictions against measurement

| | predicted | measured | |
|---|---|---|---|
| **SF2 Canteen** · tees 3–4 | above 2.5 | **4.9 / 4.1** | hit, overshot — tee 3 is at 98% of the cap |
| **SF2 Canteen** · holes 3–5 | ≥ two clear 0.35 | Kiln **0.78** ✓ · NML 0.34/0.36/**0.29** (N=400/800/1600) ✗ · Almost 0.26 ✗ | **miss — one of three** |
| **SF1 Crossing** (my ask #2) | pan in band → fork | 0.10 → **0.03** | third failure; my ask, my miss — see §5 |
| **Rockdale 6/8** | +0.1–0.3 each, → −1.2 | v5 same-seed −1.64 → **−1.66/−1.64** | **0.00 movement**, third pass |
| **Full round SF** | — | +4.11 → **+3.02** (+3.14 at N=1600) | confirmed |

The doc scored the Canteen prediction "half-landed" and that is exactly
right. No Man's Land is not over the bar: 0.34, 0.36, 0.29 across three
sample sizes — the largest sample says no, and I rule on the prediction as
written. The tee half of the prediction, though, didn't just land, it
overshot: the funding is at the ceiling.

**The best receipt in the whole run**, hole-by-hole v5 → v6 mixed:

```
  hole        1      2      3      4      5      6      7      8
  v5       +0.40  +0.69  +0.51  +0.90  +0.02  +0.98  +0.30  +0.32
  v6       +0.54  +0.70  -0.27  +0.74  -0.01  +0.92  +0.19  +0.27
```

**The Canteen scores exactly what The Question scored in that slot (+0.70 vs
+0.69).** The full stroke of course-wide improvement came entirely from the
holes downstream of it. The funding round pays in focus, not in strokes, and
the shadow carries every cent. You could not ask for a cleaner ledger.

---

## 3. The Kiln — endorsed, after trying to break it

"Cleanest proof of the focus shadow anyone is going to get" is a big claim,
so I went looking for what else could explain 0.36 → 0.78. The code narrows
the channels: the hand is drawn fresh at every tee and discarded at every
green (`coursecheck.ts` `playHole`), so the only things that cross a tee are
**focus** and the draw-stream offset (the old Question's redraw check — no
200+ card in hand at a 470 — fired often and cost 2 focus a pop, which is
part of the drain, but it also shifts which cards hole 3 sees).

So I swapped the Canteen for a **completely different funding hole** — a
150-yard par-3 clone of Respite: different cards exercised (SI/MI, no Bomb,
no wedge cut-down), different redraw profile, different par. The Kiln:
**0.75 / 85% — identical.** Wealth is the channel; the specific hole, its
cards, and its draw-stream are not.

And the natural experiment nobody planned: The Question itself measures
~0.30 gap **rich** (v5, tee-2 focus 4.6, split 80%) and ~0.28 **poor** (v6,
tee-6 focus 2.8, split 64%). A fork-incapable shape doesn't respond to
wealth; a fork-capable one (the Kiln) responds massively. That contrast is
the shadow theory's signature, in the data twice.

Endorsed, with the corrected magnitude: **0.36 → 0.78, split 48% → 85%,
hazards untouched.** It is the second-best hole in the game behind the
Ballwasher, and it was bought with sequencing alone.

---

## 4. The Canteen — the funding works; the hole is a tax

The doc calls +0.64 / 24% "a giveaway that still costs something when the
hand is empty… reads as intended." Ruled against, on the course's own file
and this dialogue's own categories:

- The hole's comment says **"built to cost nothing."** It costs **+0.70**
  (N=1600) — precisely what the 470-yard Question cost in the same slot. It
  funds by *not charging focus*, not by giving anything.
- REVIEW-1 defined the category: flat + costly = **a tax** — "nothing the
  player chooses changes the outcome," and here nothing does (gap 0.04–0.07,
  split 24%, the lowest on the course).
- The Rockdale-8 precedent the doc leans on is a **giveaway**: Last Call
  plays **−0.27** and hands the player a birdie look home. That is the
  precedent's entire content. A flat hole that takes 0.7 is not it.

The note says *"Drink now."* The canteen charges seven-tenths of a stroke
for the water. And it sits in the cut's window: Salt Flats' front four now
opens flat–flat (0.03, 0.04), which violates the standing front-four target
(≥2 real holes, ≤1 flat) even with the Kiln carrying it.

The saving grace, measured: tee 3 is at **4.9 of a 5.0 cap**, so fixing the
Canteen's stroke cost buys the shadow almost nothing — this is a fix for the
hole's own sake, not the economy's. Find where +0.70 leaks on a 365 with
owned leaves (candidates: first-putt distances from a centre pin on r15, the
88-yard cut-down, the ~24% Bomb-less hands), or rewrite the note to stop
promising water. Falsifiable side effect: because tee-3 focus is capped, a
true giveaway here should move the Kiln **not at all** — if it moves, the
shadow model is incomplete.

---

## 5. The Crossing — three failures, and the reason is the instrument

The designer's mechanism ("pricing the stretch converges the appetites") is
descriptively right, and the proposed fix (make the lay-up uncomfortable) is
wrong twice over. But both are downstream of something worse, which I found
by doing what the doc asked and putting the reviewer's eye on it.

**Fact 1 — nobody plays the shot the hole is about.** A policy-level
diagnostic at the tee (full hand, focus 5): safe plays Stinger+Smooth to
~240. Mixed plays **Bomb+Smooth+Choke** — a choked Bomb laying to ~233.
Aggressive plays Bomb+Extra+Rip to ~320, flying everything. **The naked
Bomb — "carries 265 ± 13 against a belt ending at 270," the hole's entire
premise — is nobody's pick.** And rationally so: the carry buys ~37 yards of
proximity. Both leaves (~170 carried, ~207 laid) are *owned* full-shot
numbers — MI and LI exactly. The belt prices a distinction the distance
ladder does not make. Compare No Man's Land: its lay leaves 270, a whole
extra shot — that is why NML measures ~0.3 and the Crossing 0.03.

**Fact 2 — the designer's fix, tested, does nothing.** I ran the "make the
lay-up uncomfortable" idea as specified: crust across the Long-Iron lay zone
(193–217). Result: **+0.54, 0.03, 62% — identical to canonical to the
hundredth.** The sim's actual lays are at 233–240, not 208; the patch missed
them entirely. And a patch that *did* hit them would be the retired move from
CHANGES-3 — a hazard where the obvious club lands, which relocates the club
and creates nothing. This idea should not get a fourth attempt.

**Fact 3 — the instrument cannot see the hole.** `policy.ts` evaluates a
candidate by sampling eleven *lateral* points at a **deterministic** forward
distance (`carry + 0.7·roll`). `resolveShot` then rolls **±5% carry jitter**
— ±13 yards on a Bomb. And `buildCone`, the single source of truth for what
the player is shown (P8), contains no depth term either. So the doubt this
hole is built on — will the dice come up 5 yards short — exists *only in the
resolution RNG*. Neither the three appetites nor, apparently, the picture
can perceive it. **They cannot disagree about a risk they cannot see.**

**Fact 4 — and it cuts the other way too.** Moving the belt's far edge two
yards (270 → 272) produced +1.00 / +0.81 / +0.60, "gap 0.40, split 68%" —
stable at N=800. A fork at last? No: the tee-choice scan shows what changed
is that Bomb-less hands' Stinger flips aim from pin to **left**, because at
272 the planner's deterministic landing point threads the ellipse's front
shoulder and *looks* clear — and resolution dunks that line most of the time.
Safe got 0.44 worse by its own best judgement. That is not a decision; it is
an illusion the players walk into, and a hole whose character flips on two
yards of geometry will flip again the next time any engine constant moves.
**Do not ship the 272 belt.**

Rulings, therefore:

1. My REVIEW-5 ask #2 (pan into the aim band) is **withdrawn** — it moved
   0.10 → 0.03 and was aimed at a hole that cannot answer.
2. **The Crossing is frozen.** No fourth geometry attempt. Every verdict ever
   measured on it — all three failures included — was taken by depth-blind
   players and is noise.
3. **The law gains a clause: the doubt must live in the picture, not in the
   dice.** Card refusal (NML's belt, the Verdict's wedge gate) is
   picture-doubt and measures. Carry-jitter gambles over rest-judged belts
   are dice-doubt and never will, for sim or (if the cone draws no depth
   band) for humans — a hidden coin flip either way.
4. Related: the Verdict's advertised Stinger sneak ("legally sneaks past at
   532") is also dice-doubt — pitch 502 ± 11 into a belt whose far edge is
   515 dunks roughly half the time, while the planner scores it always-safe.
   The hole's 0.43 gap survives on the honest wedge-fly fork, but the note
   is selling a lottery ticket as a line.

This goes to the engineering side: either the cone preview (and
`chooseShot`'s sampler) gain the ±5% depth band — P8 says the preview and the
resolution cannot disagree, and today they disagree by thirteen yards on a
Bomb — or depth jitter should shrink toward zero and carry-gambles are dead
as a design space. Decide, implement, then re-measure The Crossing before
anyone touches its geometry again.

---

## 6. Rockdale — the stop is granted

The third hardening pass moved **0.00**: same-seed v5 −1.64, tonight −1.66 /
−1.64. Three passes, three different placement theories (aim-band, shadow-on-
the-front, shadow-on-the-back), six holes touched, total movement inside seed
noise every time. The only lever that has *ever* moved a Rockdale hole is
length — 150 → 205 on the Ballwasher — and length is the lever the identity
forbids: a short muni where every number is owned means tight cones, and
tight cones are why grown hazards catch nobody. The designer asked whether
the remaining gap belongs to field-response work. **Yes.** It has been the
agreed wall since REVIEW-1 §5; Rockdale's −1.64 is now formally that
project's line item, not this file's. The consolation prize is real but
small: Retention Pond 0.15 → 0.23, now "some."

Rockdale is done. Best decision structure in the game (Ballwasher 0.88/95%,
Oak 0.63/68%, Cart Path Only wobbling 0.39–0.44 at 72%), and no course
change should touch it until the field can feel how easy it is.

---

## 7. Where everything stands

N=1600, mixed policy. "Bar" = gap ≥ 0.35 **and** split ≥ 60%.

```
                 full round   front four   spread(sd)   gap-REAL   clears bar
Pine Hollow        +0.64        +0.39        1.19         4          2   (PH2 .49/85, PH7 .63/69)
Cottonwood         +1.72        +1.13        1.48         2          2   (C4 .49/69, C7 .62/70)
Rockdale Muni      −1.64        −1.12        0.95         2          2   (R2 .88/95, R4 .63/68)
Salt Flats         +3.14        +1.76        1.65         2          1   (SF3 .79/86)
```

- Knife-edges, named so nobody re-argues them from one lucky run: PH4 The
  Grind 0.41/**58%**, PH5 Two Ways Home 0.48/**50%**, R3 Cart Path Only
  **0.39**/72%, R5 The Only Five 0.35/**52%**, SF4 No Man's Land 0.29/**74%**,
  SF8 The Verdict 0.43/**59%**. Three of these fail only the split half,
  three only the gap half.
- **Salt Flats stands at one hole against its own bar of five.** The funded
  re-read was worth a full stroke and one great hole; the promise of the
  unfair major is still mostly unkept, and its front four opens flat–flat.
- Cottonwood has not been touched in two change rounds and still shows four
  holes at or under 0.22, Postcard among them (0.21/56% at N=1600).
- **Softlocks: zero, in ~89,000 scanned positions across seven
  configurations tonight** (canonical at three sample sizes, the v5 state,
  and three experiment variants). The record is now six reviews old.

---

## 8. What I would do next, in order

1. **Engineering: put the depth die in the picture or take it out of the
   game.** Add carry-jitter sampling to `chooseShot` (a second loop over
   ~3 depth samples inside the existing 11 lateral ones) and decide whether
   the rendered cone shows a depth band — P8 currently lies by ±13 yards on
   a Bomb. This blocks The Crossing, unhides the Verdict's sneak line, and
   is the cheapest way to find out how many other "flat" verdicts were
   depth-blindness. Re-run everything after; predict The Crossing's gap
   rises without a single geometry change.
2. **Make the Canteen give what its note promises.** Target mean ≤ +0.2 with
   the gap staying flat (it is a funding hole; flat is its job). Diagnose the
   +0.70 leak first — putting from a centre pin on r15, the 88-yard
   cut-down, and Bomb-less hands are the suspects. Prediction to hold me to:
   tee-3 focus is capped, so the Kiln does not move when this lands.
3. **Invoke the pre-registered criterion on the 470 Stinger-refused shape.**
   CHANGES-4 said if holes 2 and 6 both miss, the pattern is dead and Wrong
   Number goes with it. It measured ~0.30 rich and ~0.28 poor at Salt Flats
   and 0.25–0.30 across three eras at Cottonwood 2 — high split, no stakes,
   a coin flip by the v2 taxonomy, at every wealth level. Either concede
   both holes (the designer's own stated preference over a fourth revision)
   or show the cap is the 1-focus tight fits (Smooth/Choke pricing the
   stretch at almost nothing) — which is a cards question, and would be the
   first time this dialogue escalates from course design to deck design.
4. **Run the straightened-Postcard offset diagnostic** (REVIEW-5 #4, still
   owed). Same 205, same ditch logic: R2 forks at −10 offset, C3 doesn't at
   +18. One run on a straightened copy answers whether offset interacts with
   the aim band, and Cottonwood — untouched for two rounds — is the course
   with the most to gain from the answer.
5. **Rockdale: formally stopped.** No further hardening; hand −1.64 to the
   field-response ledger and leave the fork cluster alone.
6. **Fix or delete the staging copies in `courses/`.** `saltflats.ts` here
   is missing a brace and does not compile; all three staged courses are
   stale. After what §0 of the changes doc describes, a restore source that
   restores a broken course is not housekeeping, it is a loaded gun.

---

## 9. Housekeeping

- The calendar ran backwards this week — REVIEW-5 is dated the 26th, the
  changes doc and this review the 25th, post-restore. The sequence of record
  is the file numbering, not the dates.
- The harness's printed `REAL` tag is gap-only; the standing bar is
  two-axis. Tonight that ambiguity let "the course now closes on a fork"
  slip through at 57% split. One line in `coursecheck.ts` to print a
  split-qualified verdict would retire the argument.
- All experiment variants were run from scratch copies or reverted edits;
  `src/content/courses/*.ts` hash-verified byte-identical to their
  pre-review state. Nothing tonight is committed anywhere.
- Salt Flats' softlock scan counts 86 more positions in the v5 state than in
  canonical — that is the Canteen being 105 yards shorter than the hole it
  replaced, not a regression.

Two predictions came true tonight and both were the designer's: the tees
funded exactly as promised, and the fork chain's drain — named in CHANGES-5
§4, confirmed in REVIEW-5, weaponized here — is now a design axis with two
independent measurements behind it. The Kiln is the proof it will be cited
by. The rest of the night belongs to the instrument, and that debt is on my
side of the table.
