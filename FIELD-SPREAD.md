# FIELD SPREAD — the pile, named and measured

**26 Aug 2026 · proposal, probe run before the options were written**

## 1. The pile, in one sentence

**Every score in this game is a sum of eight draws from a four-value integer
table, so 71 players land on about nine distinct numbers, and everything
downstream of the leaderboard is a fight over ties.** The receipts are
already on file, from three independent directions:

1. **The tie measurement** (season.ts tiePayout provenance, DESIGN.md §3.4b
   "and ties overflow hard here"): a typical finish shares its place with a
   median of ~20 players — 100% of finishes are tied — and the blanket
   real-tour tie split measured 35% → 17% survival, unshippable, so the
   owner settled for top-only and wrote "the deeper fix — spread the field —
   is §3.4b's, and stays on the ledger."
2. **Solo wins barely exist**: the median T1 group is 2–3 all season; a star
   co-leads 44% of spring wins, 87% at event 9, 100% at the finale. The
   marquee band converges the stars onto winning totals BY DESIGN
   (FIELD-CEILING.md SHIPPED, β = 0.8 chases the player's pace) — and then
   the integer lattice makes "converged" mean "equal". Winning ALONE
   requires beating the field's best by a full stroke, and the probe below
   prices that: a typical finale winner posting −5 wins solo **27%** of the
   time; a spring winner at −2, **3%**.
3. **The board is stacks**: any FINAL LEADERBOARD reads −4 shared six ways,
   because eight holes of integer golf put the median finisher in a group
   of ~20 (§2 measures 18–23, every stage).

§3.4b said it about the cut and it is the mandate for this file: *"the
honest fix is to spread the field out rather than to reword the label."*
This document is that fix, priced.

## 2. Where the mass comes from, in the code

`advanceField` (sim/resolve/field.ts) scores each hole from one roll against
four thresholds: −1 / 0 / +1 / +2. Eight holes of that is an integer with a
standard deviation near two strokes. Then three separate design decisions —
each correct on its own — pile the mass higher:

- **FIELD RESPONSE** (floorLift 0.30) narrows the skill range, so late
  fields share a mean as well as a lattice.
- **THE MARQUEE RAMP** puts the four best totals on a shared target: the
  stars all play at `max(draw, target)`, so their expected paces are nearly
  identical, and integers make nearly identical into equal.
- **Eight holes** is the whole event. The real tour spreads 71 players over
  72 holes and still stacks its mid-pack eight deep; we ask 8 holes to do
  the same job and get 20 deep.

Note what is NOT broken: the field's own winner is already solo in 51–66%
of events (the tail is thin even on a lattice). The tie problem lives in
the middle of the board, and at the exact totals the player wins with —
because the band aims the stars there.

## 3. The probe — tie structure measured, and the unit of spread that works

Scratchpad probe against the live `makeField`/`overlayStars` plus a local
advance loop validated DIGIT-IDENTICAL to `advanceField` before any knob
turned (spreadprobe.mts / spreadprobe2.mts / spreadprobe3.mts; Pine Hollow
pars, seed 13371337, N = 2000–4000 fields per row; star targets from the
live `starTarget`). The structure of today, and of each candidate spread:

```
                                    winner group         distinct  med-finisher  thru-4      line4
config                             med  mean  solo%       totals    group  max   adv (N)     mean
ev1   F=0    no stars   N=44        1   2.19    51           9        18    19   57.2 (44)   +0.92
ev8   F=.16  stars@1.07 N=26        1   1.86    56           8        21    21   44.9 (26)    0.00
ev14  F=.30  stars@1.40 N=10        1   1.46    66           9        23    23   17.2 (10)   −0.99

ev14  form variance ±2 strokes      1   1.46    66          10        19    20   18.2        −1.02
ev14  form variance ±4 strokes      1   1.45    70          12        15    16   18.2        −1.24
ev14  field plays 18 holes          1   1.27    77          13        13    15   17.2        −0.99
ev14  field plays 36 holes          1   1.19    84          18         9    11   17.2        −0.99
ev14  sub-stroke, displayed round.  2   1.83    47           8        22    22   16.8        −0.99*
```

*(sub-stroke also moved the displayed field mean −0.23 → −0.04 per 8 — a
+0.19 shift, double the ±0.1 coupling tolerance; see §4.)*

And the number that decides everything — **P(solo | win)**: the player
posts rel r over their eight, the win is solo iff the field min is strictly
worse (4000 fields, star band at the live dials, H > 8 compared at
pace-scaled r):

```
                                  solo share of wins, by the rel-8 the player posts
FINALE, ordinary (target 1.40)      −4      −5      −6      −7      −8
  baseline H=8                       7%     27%     59%     87%     98%
  form ±4 strokes                    4%     16%     40%     65%     87%      ← variance makes it WORSE
  field plays 18                    22%     51%     86%    100%    100%
  field plays 36                    29%     73%     99%    100%    100%
SPRING (event 1)                    −1      −2      −3      −4
  baseline H=8                       0%      3%     40%     86%
  field plays 36                    10%     89%    100%    100%
```

**The answer to "how much spread, in what unit": the unit is HOLES THE
FIELD ACTUALLY PLAYS, and the number is 36.** Eighteen holes gets the
median winning group to 1 (68% of a −5 shopper's finale wins are solo,
probe 3); thirty-six makes solo the norm at every stage (73–100%), thins
the median mid-board stack from 23 to 9, and roughly doubles the distinct
totals on the final board — while the thru-4 cut line and its overflow are
IDENTICAL TO THE DIGIT in every H row, because the real eight holes and
the field stream are untouched by construction. Variance cannot buy any of
this at any loudness (§5), and sub-stroke display buys the opposite (§4).

Two more measurements the options below need:

- **The tie subsidy.** The live payout rule (T1 splits, every other tied
  group takes the best place's FULL cheque) pays out 22–29% more purse per
  event than unique places would ($14.8M vs $12.1M at the finale, $15.6M
  at event 1, $9M nominal purse). That subsidy is what the blanket split
  removed all at once — the 35% → 17% crater had a mechanism, and this is
  it. Under 36 holes the group structure thins until the same full split
  costs 8% (13.1M → 12.1M): **the split stops being a crater when the
  groups stop being twenty deep.**
- **The player's cheque, by rule and world** (probe 3, modeled player, $9M
  purse, per event): a −5-pace finale shopper earns $1.042M today (live
  rule), $1.248M under 36 holes WITH the full real-tour split — the
  extension moves a pace-holding player up the board more than the split
  taxes them. A −2 mid-pack finale week: $0.402M today → $0.426M under
  extension + split. Nobody probed comes out behind today's rule.

## 4. Option 1 — FINER SCORE SPACE: rejected, the minimal intervention isn't

**Mechanism.** Field totals gain sub-stroke resolution internally (each
hole's roll keeps its position within its scoring band as a fraction),
displayed rounded.

**Measured, and it fails everything it was supposed to preserve.** Rounding
a continuous total is a re-binning, not a pass-through: the displayed
winner group got WORSE (solo 66% → 47% at the finale — half-integer
boundaries merge totals the integer world kept apart), and the displayed
field mean moved +0.19 strokes per 8, double the ±0.1 fieldShift coupling
tolerance, which invalidates all ten per-course deltas at a stroke. The
continuous cut line sits 0.15 strokes above the integer line, so the cut
either moves (recalibration) or reads a different number than it enforces
(a lie on the header, again).

The salvageable variant — fractions used ONLY to order ties, never
displayed, never cut on — is not a score space at all; it is option 4
wearing arithmetic, and dies with it (§7). **Rejected.**

## 5. Option 2 — WIDER SKILL/VARIANCE DRAWS: rejected by the lattice

**Mechanism.** Per-event form: each player's skill jittered by a
per-player, per-event triangular draw (from a salted derived stream — no
bank stream perturbed; probe implements exactly this). The
honest-simulation spread — "everyone has weeks."

**Measured, at loudness no one would ship.** ±4 strokes of expected pace —
a wobble as large as a whole player's identity, weeks where a star posts
+8 — buys distinct totals 9 → 12 and the median stack 23 → 15, and
meanwhile: solo|win at a winning −5 FALLS 27% → 16% (widening the field
spread deepens the field's best score — more field mass lands AT and BELOW
the player's total, which is more ties and more losses, not fewer); the
thru-4 line moves −0.99 → −1.24, which at §3.4b's measured slope (~20
make-cut points per stroke) is a ~5-point cut change that would force a
full re-anchor; and the stars blur (a star tops the board in 99% of fields
today, 87% under ±4 — the names the ramp just bought get noisier exactly
where their legibility is the product).

The lattice eats variance: spreading a distribution across the same nine
integers rearranges the stacks without unstacking them. Determinism was
never the problem here — the mechanism fails on arithmetic before fiction
or replay get a vote. **Rejected.**

## 6. Option 3 — MORE HOLES COUNTED: the mechanism that works, and its one trap

**Mechanism.** The field plays a fuller event than the human's 8 scored
holes. The score space widens naturally — over 36 holes the field spans
~18 distinct totals instead of 9, the median stack is 9, and the winner is
solo 84% of the time before the player even enters the comparison.

**This is not even a new fiction — it is DESIGN.md §3.3's own tournament,
finally simulated.** §3.3: two rounds, 18 holes each, *"Round 1 — 4 played
holes. The other 14 holes of the round are simmed from your stats and
shown as a running score."* The played holes are the holes that mattered.
The design document has claimed a 36-hole event since the beginning; the
build compares 8-hole totals because the sim of the other 28 was never
built. The field playing 36 is the world catching up to its own fiction.

**The trap, measured so nobody walks into it: the human's remainder must
carry real variance.** The cheap comparability fix — scale the player's
8-hole rel by 36/8 = 4.5 ("their pace held") — is deterministic, adds no
rolls, and QUIETLY UNDOES THE MARQUEE RAMP: pace differences amplify ×4.5
while the field's luck grows only ×√4.5, so over 36 holes pace dominates
luck and the contest FIELD-CEILING just calibrated collapses back into a
parade (a −9 player's margin over the best star goes from ~2 strokes to
~16; probe 3's noisy-remainder model already shows the pressure — a −5
shopper's finale win rate drifts 50% → 69% at H=36 even WITH honest noise,
and would hit ~100% without it). The remainder must be rolled, not scaled.
The cost of that is §8's whole calibration bill; the alternative costs the
project its boss fight.

**Cut arithmetic: untouched by construction, and the probe holds the
receipt.** The cut is judged thru 4, player-vs-field, in real played
holes; the extension exists only between the 8th hole and the payout
screen. Every H row in §3's table prints the identical thru-4 line
(−0.99) and identical overflow (17.2 advance at N=10) — same digits, same
stream, same everything. The cut's own "and ties" overflow is therefore
NOT fixed by this proposal — top 10 will still advance ~17 — and §3.4b's
honestly-labelled imperfection keeps its label. One tie problem at a time;
the finish is the one that owns cheques, wins, and the board.

## 7. Option 4 — TIEBREAK-ONLY COUNTBACK: the false cheap option

**Mechanism.** Totals stay; a deterministic countback (back-four score,
then last hole, then a salted hash) orders every tied group; places become
unique without moving anyone's score.

**Why it looks free, and the two numbers that say it isn't:**

1. **It re-runs the FIELD-CEILING fight, downward, with no dial.** Today a
   T1 is a win (lastPlace 1, the board says T1 — reducer.ts settle). Under
   countback the player tops their T1 group roughly 1/k of the time: at
   the measured T1 sizes (median 2, mean ~2.5 with the star convergence)
   the late win rate falls from the calibrated 51% to roughly 30–35% — a
   silent re-nerf of exactly the number two documents just spent sweeps
   landing, decided by a hash instead of a dial.
2. **Its cheque arithmetic IS the blanket split.** Unique places pay
   payout(p), payout(p+1), … across a former group — the group's expected
   cheque equals the split-pool mean, which is the rule that measured
   35% → 17% survival. Probe 3, the mid-pack case: a −2 finale week earns
   $0.402M under the live rule, $0.301M under countback — the full −25%
   crater, arriving through the back door. The "cheap" option carries the
   entire MONEY_CHECKS re-anchor bill of the real fix.

And after paying all of that it fixes nothing visible: the board still
reads −4 six ways (texture untouched), and the epilogue's wins column gets
THINNER, not truer. Countback is an honest component (§8 uses one as the
last-resort orderer WITHIN a residual tie) but as the fix it is the most
expensive option per unit of problem solved. **Rejected as a standalone.**

## 8. The recommendation — THE FULL SCORECARD (option 3 + the split it unlocks)

One mechanism, four commitments:

```
1. The field finishes its week: after your 8th hole, survivors play their
   remaining 28 holes (pars cycling the course's own sequence, fieldShift
   applying per hole, eliteEdge as the week set it) from a ONE-SHOT
   derived stream — hash(seed, salt 10, event) — consumed at settle.
2. You finish yours: your other 28 are rolled the same way from
   hash(seed, salt 11, event), two rolls a hole, at a bias fitted so your
   expected pace equals the pace you actually played this week (rel8 —
   pure function of logged state). Your played holes steer the mean; the
   noise is the same noise the field breathes.
3. The cut does not move: judged thru 4, real holes, exactly today's
   digits. The final board, places, and cheques live in 36-hole space.
4. THE FULL REAL-TOUR SPLIT SHIPS WITH IT: settle pays
   tiePayout(purse, place, tied) at every rank — one line. In the spread
   world the subsidy this removes is 8%, not 22–29%, and the probe shows
   every modeled pace earning MORE per event than under today's rule.
```

**Determinism plan, stream by stream.** Salt 10 (field remainder) and salt
11 (your remainder) are one-shot derived streams in the family of the
schedule's 5 and the roster's 7 — pure functions of (seed, event), no bank
stream consumed, no draw count changed anywhere in the played game.
Replay: a v9 log replays byte-identically through every action; only the
settle-time derived values differ from what v9 displayed — which is money
and standings, so **SAVE_VERSION → 10**, stated plainly: old logs replay
as different runs (different cheques from event 1), exactly as v7, v8 and
v9 before it. The frozen ledger (runs/verified.json) keeps its rows —
ledger-safe by design, the board replays nothing it has already verified.

**Spring digit-identity — can it survive? Yes, in the letter; no, in the
spirit; say both.** stars.test.ts locks the PLAYED-hole digits of events
1–4 against the pre-stars capture, and those digits do not move: the field
stream, makeField, advanceField, and all eight real holes are untouched,
so the suite passes with no test edited. But the spring BOARD the player
sees changes (a 36-hole total has 28 new holes in it), and spring cheques
change with the split. The spring rule was "the stars are names only in
spring" — that survives whole (eliteEdge 0 applies to extension holes
too). The pre-stars spring SCOREBOARD does not survive, and no honest
version of spreading the field could keep it.

**Predicted effects, registered:**

- *(a) Solo-win rate:* the median winning group is 1 at every stage.
  Typical winners win solo — 73%+ at the finale's −5, 89% at spring's −2
  — and the finale's "a star shares your winning total," today 100%,
  falls below 15%. The epilogue's wins column starts telling the truth.
- *(b) Cut line / squeeze:* zero movement, by construction, receipt in
  every probe row (line −0.99, advance 17.2, all H). cutcheck must print
  digit-identical make-cut tables with the extension on and off; if it
  doesn't, the build leaked the extension into the cut and that is a bug,
  not a tuning problem. The cut's header overflow remains (~17 at top 10)
  and remains honestly labelled.
- *(c) The tie split:* ships, in full, the real tour's rule. The crater
  mechanism is measured gone (8% subsidy, not 29%; every probed pace
  earns more than today). MONEY_CHECKS re-anchors once, under the same
  roof (§9).
- *(d) Leaderboard texture:* the final board spans ~18 distinct totals
  with a deepest stack of ~11 (was 9 and ~23): real-tour texture, T-groups
  of 3 and 5 instead of walls of 20. Costs named: totals read −11, not
  −4 (a 36-hole number — this is the fiction working, but the screen must
  sell "36 holes" or the number reads inflated), and the in-play board
  (real-hole space) and final board (36-hole space) are two scales — the
  settle screen should show the field "finishing" (the §3.3 running-score
  promise, at last) so the jump reads as golf, not arithmetic.
- *The win contest (the interaction that must be re-swept):* the extension
  rewards pace — probe 3 has the ordinary shopper's finale win rate
  drifting 50% → 69% at the live R = 1.4 — so FIELD-CEILING's sweep B
  re-runs under the extension. Predict R lands at **1.55 ± 0.05** (star
  pace −5.0 to −5.4, matching the shopper's) to restore ~50%; hot weeks
  (player ≤ −8) stay won at 100% in every cell — β < 1 and the CAP are
  untouched, so the anti-rubber-band guarantee survives by the same
  construction that bought it.

## 9. Parameter derivation and the calibration bill, in order

1. **Promote the probe** (house law: no number ships from a scratchpad):
   fieldcheck gains a TIES section — group structure, distinct totals,
   solo|win grid, purse subsidy — and an `EXT` env knob (holes beyond 8;
   0 = today) lands in fieldcheck, cutcheck, shopcheck, weekcheck beside
   STARS/K/RAMP/BETA/CAP.
2. **Sweep C — H itself** (fieldcheck TIES; H ∈ {18, 27, 36}). Target:
   median winning group 1 at every stage with solo|win ≥ 70% at the stage's
   typical winning pace. 36 is the registered pick (and §3.3's own number);
   18 is the fallback if §8's win-contest re-sweep fails (below).
3. **cutcheck confirm** — digit-identity with EXT on/off, all policies,
   all curves. Not a sweep; a receipt.
4. **Sweep B re-run** (shopcheck WINS=1, EXT on): re-derive R (predict
   1.55 ± 0.05), β/CAP confirmed untouched. Targets: late win rate 45–55%,
   hot weeks kept at ~100%, finale ~1-in-3 for a median survivor.
5. **THE ONE RE-DERIVATION, last, one shopcheck session** (the CALIBRATION-2
   discipline — every number reads the same earnings distribution):
   - **MONEY_CHECKS** under extension + full split. Predict all three bars
     move UP — the first upward world re-anchor since the drops — because
     the extension pays pace and the split's 8% is smaller than the
     pace reward (probe 3: spring −2 weeks earn ~1.5× today). Register:
     check 1 $2.1M → $2.6–3.2M; kills land near the 44/33/≤8 intent;
     survival mixed 33–39%; the ordering law (mixed > aggressive,
     mixed ≫ hoarder) holds.
   - **The invariant re-prices UP, honestly**: with solo wins the norm,
     the expected win cheque returns from tiePayout(purse,1,2) ≈ $2.71M
     to nearly the solo $3.4M, so the win-pays-the-final-leg cap RISES
     and check 3 gets ceiling headroom for free. No kill promised — the
     standing verdict (supply is check 3's dial) stands — but the leg
     stops being priced on the tie tax.
   - **SHARE/LADDER re-measure**: predict the anchor rises $15.05M →
     $17–19M and SHARE tilts a few points late (the extension pays the
     equipped back half). Frozen board rows untouched, as always.
   - **weekcheck EVENT_YIELDS + STAGE_YIELD re-measure** (printed yields
     change with every settle cheque).
   - **fieldcheck coupling confirm**: the ten fieldShifts are NOT
     re-derived — the real 8 holes are untouched and the extension
     inherits each course's shift linearly (per-hole, same slope) — but
     the confirm prints the 36-hole deltas once so the ×4.5 scaling is a
     receipt instead of an assumption.
   - Provenance: season.ts, DESIGN.md §3.3 (the sim exists now) and
     §3.4b/§3.4c, SHOP-SUPPLY.md's expected-win-cheque note, this file.

## 10. Predictions registered, and the escape clause

1. Median winning group **1 at every event**; finale star-co-lead on the
   winning total 100% → **≤ 15%**; the epilogue's wins are ≥ 70% solo.
2. Final boards: **≥ 15 distinct totals, deepest stack ≤ 13** (from ~9
   and ~23). The cut's advance overflow does NOT change (~17 at top 10) —
   if it moves, the extension leaked into the cut.
3. cutcheck digit-identical with EXT on/off; stars.test.ts passes with no
   test edited; spring boards change and spring played-digits do not.
4. Sweep B lands **R = 1.55 ± 0.05** with hot weeks kept at 100%; if no R
   ≤ 1.7 holds the late win rate under ~55% without breaking the −8-tail
   texture (winner p10 must stay ≥ −8-ish, not −11), the escape clause
   governs: **fall back to H = 18** — same mechanism at half the pace
   amplification (solo|win 68% at −5, stacks of 13) — and never variance,
   never countback-alone, never a scaled (unrolled) remainder.
5. MONEY_CHECKS re-anchor UP with the full split IN and survival mixed
   33–39%: the split ships without a crater. If survival reads < 30% at
   every candidate triple, the extension's pace reward was overestimated —
   re-measure the player model (the probe's fitted-bias remainder vs the
   shipped one) before touching a bar, because that disagreement is a
   modeling bug, not a difficulty setting.
6. **SAVE_VERSION 10**, and the honest sentence for the changelog: a v9
   log replays as a different season — same shots, different money from
   the first settle — and the frozen ledger keeps every verified row.

The thing this buys, said once without numbers: the first time the player
wins a tournament ALONE — their name, one line, nobody sharing it — is
currently a 3%-of-spring-wins event. Under the full scorecard it is the
normal shape of winning, the stars are still the ones to beat, the cut
still squeezes on the same digits, and the cheque that lands is the real
tour's rule with no asterisk. The board finally reads like the game the
intro screen has been promising: one tour, spread out, you somewhere on it.

## SHIPPED — 26 Aug 2026, the full scorecard built, swept, and measured

The recommendation is in, whole: the field finishes its 36-hole week at
settle from a one-shot derived stream (salt 10), the player's other 28
holes roll from their own stream (salt 11) at a bias fitted to the pace
they actually played, the final board and every cheque live in 36-hole
space, and **the full real-tour tie split ships with it** — settle pays
`tiePayout(purse, place, tied)` at every rank, one line, exactly as §8
wrote it. The win-still-counts rule survives whole (a shared lead is
place 1; only the money divides), and the payout screen's split line now
covers any tied finish, house voice, with the header selling the 36.

**Where it lives.** `sim/resolve/field.ts` — `FULL_HOLES` (36),
`FIELD_EXT_SALT` 10 / `PLAYER_EXT_SALT` 11, `extendField`/`extendFieldWith`
(advanceField itself rolls the extension holes, pars cycling, fieldShift
and eliteEdge as the week set them) and `extendPlayerRel`/`…With` (the
fitted-bias remainder — bisection on advanceField's own expected-shot
curve, never a scaled pace; §6's trap stays fenced, and the fit receipt
reads exact: mean rolled rel36 = rel8 × 4.5 to the second decimal at
every probed pace). `sim/reducer.ts` settle extends both, then pays the
full split; `recentCutRels` still records REAL played rel — the band
chases the golf you played, not the simmed weekend. `GameState.finalRel`
carries your 36-hole number to the payout screen (null on a missed cut —
no weekend, no number). Salt registry after this: bank 1–4 · schedule 5
· encounters 6 · stars 7 · shop 8 · **9 free** · field extension 10 ·
player remainder 11 (the spec's named numbers were free and are used as
registered).

**SAVE_VERSION 10 → 11** — the floor work took 10 earlier this session,
so the honest changelog sentence lands one number later than §10-6
registered it: a v10 log replays as a different season — same shots,
different money from the first settle — and the frozen ledger
(runs/verified.json) keeps every verified row, untouched.

### Sweep C — H (fieldcheck TIES, promoted probe; TN=2000, seed 13371337)

The probe is a permanent fieldcheck section now (TIES — group structure,
distinct totals, solo|win grid, purse subsidy) and the `EXT` knob (holes
beyond 8; 0 = the pre-spread world) lives in fieldcheck, cutcheck,
shopcheck and weekcheck beside STARS/K/RAMP/BETA/CAP. Instruments
outlive their questions. Final-board structure (post-cut survivors),
thru-4 line/overflow DIGIT-IDENTICAL across every EXT row by the same
one-shot-derived-stream construction the game uses:

```
                       winner group        distinct  med-fin       solo|win at the stage's
EXT (H)                med  mean  solo%     totals   grp  max      typical winning pace
 0  (8, today)  ev1     2   2.26   49%        7      18   30       spring −2:  4%
                ev14    1   1.43   67%        6       6   24       finale −5: 24%
10  (18)        ev1     1   1.66   61%       12       9   22       spring −2: 62%
                ev14    1   1.26   78%        9       3   16       finale −5: 69%
19  (27)        ev1     1   1.49   68%       16       6   16       spring −2: 77%
                ev14    1   1.20   82%       10       3   13       finale −5: 76%
28  (36)        ev1     1   1.36   74%       20       5   13       spring −2: 87%
                ev14    1   1.17   85%       11       2   11       finale −5: 84%
```

**Chosen: H = 36 (EXT 28)** — the registered pick and §3.3's own number.
Median winning group 1 at every stage from H=18 up, but only 36 clears
solo|win ≥ 70% at BOTH stages' typical winning paces and thins the
top-only subsidy to 9% / 6% / 3% (ev1/ev8/ev14; was 29/27/13) — the
crater mechanism measured gone, so the full split ships with no
asterisk. The full split itself conserves the purse exactly (a mean of
covered places, by construction).

### The cut receipt (prediction b — zero movement, to the digit)

cutcheck N=400, all three policies, all four candidate curves, stars on:
`EXT=0` and `EXT=28` outputs **diff-identical** end to end (every
make-cut table, every place distribution, every curve row; only the
header's knob value differs). Inside the TIES probe the thru-4 line and
overflow also print identical digits in every EXT row: ev1 +0.93/57.3 ·
ev8 0.00/44.9 · ev14 −1.00/17.1. The overflow at top 10 remains ~17 and
remains honestly labelled — one tie problem at a time, as §6 said.
**Tripwire 1 (overflow moves = leak into the cut): not tripped.**

### Sweep B re-run — R under the extension (shopcheck WINS=1, mixed shopper)

The extension rewards pace: at the old R=1.4 the late win rate had
drifted 51% → 58% (the §8 prediction said it would). Re-swept at 250
seasons per cell, then confirmed at 400:

```
R        late (ev 10–14)   finale   hot(≤−8)   winner tail (8-hole space)
1.40          58%            68%      100%      p10 −7,  1.7% ≤ −8
1.50          53%            61%      100%      p10 −7,  5.9% ≤ −8
1.55          49%            55%      100%      p10 −7,  9.3% ≤ −8   ← chosen
1.60          45%            51%      100%      p10 −8, 13.8% ≤ −8
```

**Chosen: R = 1.55** (`players.ts STAR_RAMP_END`), dead centre of the
registered 1.55 ± 0.05. Hot weeks stay 100% the player's in every cell —
β = 0.8 and CAP = 0.3 untouched, the anti-rubber-band guarantee survives
by the same construction that bought it. No escape clause needed; H=18
stays the fallback nobody used.

### §10 predictions, scored (400-season confirm at R=1.55, EXT=28)

| § | registered | measured | verdict |
|---|---|---|---|
| 1 | median winning group 1 at every event; finale star-co-lead on the winning total 100% → ≤15%; wins ≥70% solo | med group 1 at every stage; a star shares the player's finale winning total **5%** of wins (was 100%); **91%** of 2,065 wins are solo | **hit** |
| 2 | boards ≥15 distinct totals, deepest ≤13; cut overflow unchanged (~17) | fullest board (spring, ~57 survivors): **20 distinct, deepest 13**; finale's 17-man board spans 11; overflow **17.1**, identical every EXT row | **hit** |
| 3 | cutcheck digit-identical EXT on/off; stars.test.ts passes unedited; spring boards change, spring played digits do not | diff-identical at N=400 all policies/curves; suite green with **no test edited** (146 tests, was 144); spring cheques/boards move, played digits locked | **hit** |
| 4 | sweep B lands R = 1.55 ± 0.05, hot weeks 100%, tail not −11 | **R = 1.55 exactly**, late 49%, hot 100%, winner p10 −7 | **hit** |
| 5 | MONEY_CHECKS re-anchor UP, survival mixed 33–39% with the split in | at LIVE bars survival reads **50%** mixed (kills 36/21/0) — the world got richer, the bars must rise; ≥30% at every candidate triple, so **tripwire 2 not tripped** (and the fit receipt clears the player model) | **direction confirmed — the re-anchor is the calibration agent's** |
| 6 | SAVE_VERSION 10, honest changelog sentence | ships as **11** (the floor took 10 first); sentence recorded above and in storage.ts | **hit, renumbered** |

Also measured for the record: all-season win rate 44% (~5.2 wins a
season), finale 58%; the finale's win% drifts high of the 45–55 band by
three points — a texture the calibration agent may meet again through
the invariant, not a dial this build owns. §3's registered probe rows
reproduce at EXT=0 within noise (ev1 med 2 / mean 2.26 / solo 49; the
TIES section reads post-cut boards, so mid-board numbers are the honest
final-board versions of §3's full-field ones).

### HANDOFF — the calibration agent's list (§9.5, ONE session, in order)

State of the world it inherits: live triple $2.1M/$8.1M/$11.1M kills
36/21/0 (mixed, 400 seasons, shop), survival mixed 50% / aggressive 46%
/ safe 2% / mixed non-shopper 19% — ordering law holding, everything
UP-shifted by the extension's pace reward, exactly as §9 predicted.

1. **MONEY_CHECKS re-anchor UP** per the registered ranges (check 1
   $2.1M → $2.6–3.2M; kills near 44/33/≤8; survival mixed 33–39%;
   ordering law holds). All three bars move up for the first time since
   the drops.
2. **The invariant re-prices UP to the solo cheque** (deck.test.ts):
   with 91% of wins solo, the expected win returns from
   tiePayout(purse,1,2) ≈ $2.71M toward the solo $3.4M — the
   win-pays-the-final-leg cap RISES and check 3 gets ceiling headroom
   for free. No kill promised; supply stays check 3's dial.
3. **SHARE/LADDER re-measure**: this run's 400-season medians —
   $121k $420k $1.16M $2.34M $3.22M $3.96M $6.52M $7.56M $8.77M $9.78M
   $12.40M $13.32M $14.41M **$16.97M** (anchor $15.05M → $16.97M, at the
   floor of the predicted $17–19M; SHARE tilts late: …0.58 0.73 0.78
   0.85 1.00 — the extension pays the equipped back half). Frozen board
   rows untouched, as always.
4. **weekcheck EVENT_YIELDS + STAGE_YIELD**: first reading under the
   extension (N=250, R=1.55): stage means early $586k · mid $1.16M ·
   late $1.53M; majors $1.16M/$1.97M/$2.36M/$2.27M. weeks.ts quotes
   need the re-run at the anchored bars.
5. **fieldcheck coupling confirm**: the ten fieldShifts are NOT
   re-derived — print the 36-hole deltas once so the ×4.5 linear
   inheritance is a receipt instead of an assumption.
6. **From SHOP-SUPPLY's SHIPPED**: the three boosts flagged at
   1.36–1.37× need in-band repricing (measure at N≥250 — this session's
   boost table ran at N=1 for speed and prices nothing).

Instrument knobs, for the record: `EXT` (holes beyond 8; 0 = pre-spread)
in fieldcheck/cutcheck/shopcheck/weekcheck; fieldcheck `TIES=only`
runs sweep C's section alone (`TN` trials); shopcheck's WINS section now
prints solo-win share and the finale star-co-lead read beside the win
rates. The probe scratchpads (spreadprobe*.mts) are retired — the TIES
section is their permanent home.
