# CALIBRATION 3 — the first re-anchor that moves the bars UP

**26 Aug 2026 · the once-and-last pass FIELD-SPREAD.md §9.5 ordered, run after
THE FULL SCORECARD shipped (36-hole weeks, full real-tour tie split, R=1.55)
and the junk spread floor landed with zero measured drift · predictions
registered before each measurement**

## 0. The world as it stands

Everything the economy reads shipped before this pass sat down: the junk
spread floor (JUNK-VERDICT.md SHIPPED — zero drift, nothing here re-argues
it), and THE FULL SCORECARD (FIELD-SPREAD.md SHIPPED): the field finishes
its 36-hole week at settle from the salt-10 stream, your remainder rolls
from salt 11 at the pace you actually played, the final board and every
cheque live in 36-hole space, and settle pays `tiePayout(purse, place,
tied)` at every rank — the full split, no asterisk, because the 36-hole
world thinned the top-only subsidy to 3–9% before the split ever engaged.
Sweep B re-landed the marquee ramp at R = 1.55 (dead centre of the
registered band); β = 0.8 and CAP = 0.3 untouched; 91% of 2,065 measured
wins are SOLO now, and a star shares the player's finale winning total 5%
of the time, down from 100%.

The consequence this pass exists to price: **the extension pays pace, so
the world got RICHER.** At the live triple ($2.1M/$8.1M/$11.1M) the
scorecard session measured kills 36/21/0 and mixed survival 50% —
everything up-shifted, exactly as FIELD-SPREAD §9 predicted. Every prior
anchoring in this project's history moved bars DOWN (stars eating cheques,
the tie tax, the supply squeeze). This is the first one where the honest
direction is UP.

SAVE_VERSION stays **11**: this pass touches thresholds, prices, printed
yields, a ladder, and one test's arithmetic — no reducer semantics, no
draw counts (argued per item below, and the suite's construction receipts
stand guard).

Baseline before a number moved: `npx tsc --noEmit` clean, vitest 146/146.

---

## Registrations — written before the instruments ran

**R1 — instrument lineage.** The first sweep row reproduces the scorecard
handoff at the live triple, digit for digit inside the ±2 honesty band:
kills 36/21/0, survival mixed 50 / aggressive 46 / safe 2 / mixed hoarder
19. Nothing else in this pass is believed until this row prints.

**R2 — the boost band (item 5, measured FIRST — the shelf must be final
before the one re-derivation reads it).** The extension pays the equipped
back half, so predict the whole shelf's returns RISE from SHOP-SUPPLY's
compressed readings (bare season climbs from $5.48M toward ~$6M+). The
three SKUs flagged at 1.36–1.37× (SHOP-SUPPLY SHIPPED verdict 2: **Fresh
Grips, A Three Wood You Trust, The Circle of Friendship** — the standing
verdict named these three, not Soft Spikes, which was CALIBRATION-2's
patient and is already repriced) come back INTO the band on the richer
world, and the honest outcome is nearer zero repricings than three.
Budget ≤ 3; anything else that drifts out is reported, never repriced.

**R3 — MONEY_CHECKS re-anchor UP (item 1).** FIELD-SPREAD's registered
range, scored explicitly: check 1 lands in **$2.6–3.2M** (this pass's
point prediction: ~$2.9–3.0M — the new ev-5 median is $3.22M and check 1
has sat just under its median since the spring rule). Check 2 tracks the
new ev-9 median $9.78M: predict **$9.5–9.9M**. Check 3 pins to the
re-priced invariant's ceiling over check 2 (R4) and lands **$12.9–13.4M**,
buying 2–5% against its ≤8 intent. Kills land 44±4 / 33±5 / ≤8; mixed
survival 33–39 (target ~36); ordering law holds: mixed > aggressive,
mixed ≥ 3× the hoarder.

**R4 — the invariant re-prices UP to the solo cheque (item 2).** With 91%
of wins solo, the expected win cheque is the solo `payout(purse, 1)` =
**$3.4M** at a $20M major, not tiePayout(purse,1,2) ≈ $2.71M. At the test's
standing 0.9 tolerance the last leg's ceiling rises ~$3.01M → **~$3.78M**
— about $755k of check-3 headroom, for free. Predict check 3's kill moves
toward intent but stays structurally small (2–5%, not 8): the leg's teeth
are still the major win it demands (10th at the finale pays $605k).

**R5 — SHARE + LADDER (item 3).** The shopper model never reads the bars,
so the 400-season SHARE/anchor run reproduces the handoff digits exactly:
anchor $15.05M → **$16.97M**, SHARE tilting late (…0.58 0.73 0.78 0.85
1.00 — the extension pays the equipped back half). Every LADDER rung
re-scales at its old ratio, rounded to $100k (20th → $17.0M). The four
frozen grosses re-read at display time (rows untouched): predict each
drops 1–3 rungs against the richer ladder — andrew-3's $26.34M stays
top-5; andrew-2's $23.92M reads ~9–11 (was 8); andrew-4's $22.59M reads
~10–12 (was 8).

**R6 — EVENT_YIELDS + STAGE_YIELD (item 4).** weekcheck §1 at N=1000
(star-aware, EXT-aware) lands near the handoff's N=250 first reading:
early ~$590k · mid ~$1.15M · late ~$1.5M. The surprise to confirm at
N=1000: the LATE stage eases a touch from the printed $1.62M even as the
world gets richer — the full split now taxes every tied late finish where
top-only used to hand the whole group the best cheque, and the extension's
pace reward lands mostly at the TOP of the board (the median late week is
not a win). Spring holds within noise, the rule's fifth instrument.

**R7 — the fieldcheck coupling receipt (item 6).** All ten courses confirm
within ±0.1 at 8 holes untouched (nothing in the scorecard session touched
a real hole), and the printed 36-hole deltas read ≈ 4.5× the 8-hole ones
per course (the extension inherits fieldShift per-hole, same slope — a
receipt, not a re-derivation). No shift moves unless a row fails.

---

## 1. Instrument lineage (R1) — believed before anything else

shopcheck, 400 seasons/policy, seeds 700000+, live triple, live shelf:

```
              kills at 2.1/8.1/11.1     survival    hoarder (bank)
safe               91/71/18                 2%          1%
mixed              36/21/ 0                50%         19%
aggressive         36/26/ 4                46%         16%
```

Digit-for-digit the scorecard handoff — kills 36/21/0, survival mixed 50 /
aggressive 46 / safe 2 / hoarder 19. And the same run's WINS and SHARE
sections reproduced the handoff's texture exactly: **91% of 2,065 wins
solo**, finale star-co-lead 5% of 207, late win 49%, finale 58%, hot weeks
100%, buys 6.0, kit@14 9.2, conversion 23% — and the median ladder ending
**$16.97M**. The instrument is the world. **R1: hit, whole.**

## 2. The boost band (item 5) — the standing verdict resolved itself

shopcheck top section, N=250, mixed, seeds 600000+, EXT 28. Bare season
**$5.48M → $5.79M** — the extension pays the equipped back half, as
registered. Twenty-two of twenty-five SKUs hold the 1.4–2.5× band, and
the finding of the section is the three that were flagged:

| flagged at SHOP-SUPPLY | then | now | verdict |
|---|---|---|---|
| Fresh Grips | 1.37× | **1.53×** | back in band, untouched |
| A Three Wood You Trust | 1.36× | **1.70×** | back in band, untouched |
| The Circle of Friendship | 1.36× | **1.58×** | back in band, untouched |

**Zero repricings** — the ≤3 budget went unspent, which is the best
possible outcome for the bars: they were derived at the exact live shelf
and the shelf did not move. (One correction for the record: the work
order's memory said Soft Spikes was among the flagged three; SHOP-SUPPLY
SHIPPED verdict 2 names Grips / Three Wood / Circle. Soft Spikes was
CALIBRATION-2's patient and was already repriced.)

The drift moved to the other end instead: **Soft Spikes 2.82× · Clean
Slate 2.77× · New Glove 2.63×** sit over the 2.5 ceiling — the cheap rack
end swings hardest in every world, and two of the three are the shelf's
historically spread-prone measurements (the Short Memory saga). Per the
work order: reported, not repriced — standing verdict 1. Noted in
passing, in scope for nobody: the best card cut (Smooth It) measures
$1.59M against CUT_PRICE $950k — 1.67×, in band; the cut price stands.

## 3. MONEY_CHECKS (item 1) — the re-anchor UP

The sweep, at the final (unmoved) shelf. Brackets at 250 seasons, mixed:

```
   $2.60M /  $9.00M / $12.40M     44  21   2      survival 44%
   $2.90M /  $9.50M / $12.90M     46  21   4               41%
   $3.00M /  $9.80M / $13.30M     46  25   3               39%
   $3.20M / $10.10M / $13.60M     49  27   3               36%
   $2.60M / $10.40M / $13.90M     44  33   3               36%   ← the intent digits, at 250
   $2.60M / $10.70M / $14.20M     44  40   0               34%
   $2.60M / $11.00M / $14.50M     44  43   1               32%
```

Then the authoritative 400s, where the 250→400 drift CALIBRATION-2
recorded (+4 on check 2, identical seeds) arrived on schedule:

```
   $2.60M / $10.40M / $13.90M     44  38   2      survival 34%
   $2.60M / $10.10M / $13.80M     44  37   2               35%   ← SHIPPED
   $2.60M / $10.25M/ $13.90M      44  37   2               35%
```

The check-2 response is flat across $10.1–10.4M at 400 seasons, so the
gentler bar takes the seat: **$2.6M / $10.1M / $13.8M** — kills
**44 / 37 / 2**, survival mixed **35%** (band 33–39, target ~36),
**aggressive 27%** (42/50/7), **safe 1%** (93/87/25), **mixed hoarder
6%**. The ordering law holds whole: mixed beats aggressive by eight and
the hoarder ~6×.

- **FIELD-SPREAD's registered check-1 range, scored: $2.6–3.2M → landed
  $2.6M. HIT, at the floor of the range.** The spring got richer faster
  than the bar needed to rise: the extension pays a good April that the
  twenty-deep tie stacks used to flatten, so the kill response steepened
  and 44% arrived $300k lower than this pass's own point prediction.
- Check 2 is the season's whole wall now, four points over the 33 intent
  at 400 seasons — and it has the argument: with check 3 structurally
  small (2%), mixed survival ~36 REQUIRES a kill-2 near 34 by arithmetic
  (0.56 × 0.66 × 0.98 = 36%). Survival kept the argument, as it did at
  CALIBRATION-2.
- Check 3 sits AT the re-priced invariant's ceiling on the $100k grid
  (leg $3.7M under the $3.78M cap) and buys 2% — toward intent from the
  live world's 0%, structurally small on purpose, ceiling ≤8 respected.

## 4. The invariant (item 2) — re-priced UP to the solo cheque

deck.test.ts, with the reasoning in the test and in season.ts tiePayout's
provenance. The arithmetic:

```
tie world (SHOP-SUPPLY):  expected win = tiePayout(20M, 1, 2) ≈ $2.71M → leg cap ~$3.01M
spread world (this pass): expected win = payout(20M, 1)        = $3.40M → leg cap ~$3.78M
                                                        headroom: ~$770k, free
```

With 91% of wins solo, winning alone stopped being luck and became the
normal shape of winning — pricing the leg on the 2-way split would now
tax the player for a tie that almost never happens. **The shipped triple
spends the headroom**: the leg is $3.7M, a bar check 3 could not
legally have reached under the old cap (max ~$13.1M over the new check
2, where kill measured ~1%). Check 3's kill moved 0% → 2% — toward
intent, never to it, exactly as registered: the leg's teeth are still
the major win it demands (10th at the finale pays $605k against a $3.7M
leg). Supply stays check 3's dial; no kill was promised and none is
claimed.

## 5. SHARE + LADDER (item 3) — the anchor rises for the first time

The 400-season medians (shopcheck SHARE=1, same run as §1) reproduce the
handoff to the dollar:

```
$121k $420k $1.16M $2.34M $3.22M $3.96M $6.52M $7.56M $8.77M $9.78M $12.40M $13.32M $14.41M $16.97M
SHARE 0.01  0.02  0.07  0.14  0.19  0.23  0.38  0.45  0.52  0.58  0.73   0.78   0.85   1.00
```

- **Anchor $15.05M → $16.97M** (rung $17.0M) — the first upward
  re-anchor; every rung re-scales at its old ratio on the $100k grid
  (1st $49.2M … 20th $17.0M … 72nd $900k).
- SHARE tilts LATE (0.54 → 0.58 at 10, 0.84 → 0.85 at 13): the
  extension pays the equipped back half, the registered direction.
- **The four frozen seasons, re-read through the new lens** (display-time
  only; runs/verified.json untouched, the ladder is a lens, not a
  record): andrew $20.12M thru 12 reads **7th** (old lens 4); andrew-2
  $23.92M reads **10th** (was 6, ledgered 15); andrew-3 $26.34M thru 13
  reads **4th** (was 3, still top-5); andrew-4 $22.59M reads **12th**
  (was 8). Ten wins still reads like ten wins on a tour where the whole
  field just got richer.
- The checks now demand paces worth roughly **28th, 17th, 19th**
  (DESIGN.md §3.2 updated).

## 6. EVENT_YIELDS + STAGE_YIELD (item 4) — the schedule screen keeps telling the truth

weekcheck §1, N=1000, mixed shopper, seeds 800000+, stars on, EXT 28.
Per event, printed → measured (shipped rounded to $10k):

```
ev      1     2     3     4♦     5     6     7♦     8     9    10    11♦    12    13    14♦
was   300k  320k  360k  1.14M  610k  630k  1.95M  990k 1.01M 1.03M 2.42M 1.16M 1.09M 2.41M
now   360k  390k  420k  1.32M  700k  730k  1.99M 1.03M 1.00M 1.01M 2.37M 1.09M 1.01M 2.23M
```

STAGE_YIELD shipped: **early $640k · mid $1.19M · late $1.54M** (was
$550k/$1.15M/$1.62M). The registration was half right: mid and late
landed on the handoff's first reading (late eased ~5%, the full split
taxing every tied late finish where top-only handed the group the best
cheque), but the SPRING ROSE 15–20% — the registered "spring holds
within noise" is a **miss**, and the mechanism is the same one that
moved check 1: the extension pays a pace-holding week everywhere, and
the spring is where the tie stacks used to flatten one. A yields rise is
not a spring-rule breach (the rule is about difficulty); the check-1
re-anchor absorbed the new money. Side-note for the weeks ledger, third
time now: every WEEKS-VERDICT §2 option delta was priced against
forfeits another world ago — early forfeits just got ~15–20% richer, so
the early practice options' GOOD DEAL margins have COMPRESSED, not
improved, for the first time. The next weeks conversation re-runs the
matrix before quoting it.

## 7. fieldcheck coupling receipt (item 6)

N=2000 fields/cell, F=0.15, RECEIPT=1 (the 36-hole column is a permanent
gated section of the instrument now — instruments outlive their
questions):

```
course         offset   Δ8 vs PH  target  miss   Δ36     Δ36/Δ8
Pine Hollow     0.000     0.00      0.0    ok     0.00      --
Cottonwood     -0.023    -0.33     -0.3    ok    -1.46    4.46
Rockdale Muni  -0.212    -2.76     -2.8    ok   -12.47    4.52
Salt Flats      0.025     0.36      0.5    ok     1.63    4.51
Palmetto       -0.145    -1.99     -2.0    ok    -8.92    4.49
Meadowlark     -0.114    -1.44     -1.4    ok    -6.50    4.53
Driftwood      -0.099    -1.37     -1.4    ok    -6.13    4.48
Foxglove       -0.078    -1.08     -1.1    ok    -4.86    4.48
Bracken Ridge  -0.018    -0.26     -0.3    ok    -1.14    4.46
Rivermouth     -0.009    -0.13     -0.1    ok    -0.58    4.47
```

**All ten within ±0.1, untouched; the ×4.5 linear inheritance reads
4.46–4.53 at every shifted course.** The assumption is a receipt now. No
shift moved. (The same run's TIES section reproduced sweep C's structure
at the live R=1.55: med winning group 1 / solo 74–83% / subsidy 9/5/3%.)

---

## 8. The scorecard, scored — this pass's registrations and the handoff's numbers

| # | registered | measured | verdict |
|---|---|---|---|
| R1 | handoff reproduced digit-for-digit | 36/21/0 · 50/46/2 · hoarder 19 · 91% solo · $16.97M | **hit** |
| R2 | shelf rises; flagged three return to band; ~zero repricings | bare $5.79M; 1.53/1.70/1.58; **0 repriced**; 3 NEW over-ceiling, reported | **hit** (the over-drift is §2's report) |
| R3 | check 1 in $2.6–3.2M; kills 44±4/33±5/≤8; survival 33–39 | **$2.6M — range hit at the floor**; 44/37/2 all in band; 35% | **hit on every band** — but all three POINT predictions missed low ($2.9–3.0/$9.5–9.9/$12.9–13.4 vs 2.6/10.1/13.8): the spring's kill response was steeper and the wall higher than priced |
| R4 | leg cap $3.01M→$3.78M; check 3 kill 2–5%, toward intent, no kill promised | cap $3.78M, headroom ~$770k, SPENT by the shipped bar; kill **2%** | **hit** |
| R5 | SHARE/anchor reproduce; frozen reads a-2 ~9–11, a-4 ~10–12, a-3 top-5 | exact reproduction; **10 / 12 / 4** (andrew 7) | **hit** (blanket "drops 1–3 rungs" understated two rows: 4 rungs) |
| R6 | early ~$590k · mid ~$1.15M · late ~$1.5M; spring within noise | $640k / $1.19M / $1.54M; **spring rose 15–20%** | **half** — mid/late hit, spring-holds missed; mechanism named in §6 |
| R7 | ten courses ±0.1; Δ36 ≈ 4.5×Δ8 | all ok; 4.46–4.53 | **hit** |

And the scorecard agent's handoff numbers, scored against this pass's
instruments: kills 36/21/0 at live bars — confirmed; survival 50/46/2/19
— confirmed; SHARE anchor $16.97M — confirmed to the dollar; EVENT_YIELDS
first reading (N=250) early $586k · mid $1.16M · late $1.53M — mid and
late confirmed at N=1000, early revised UP ~9% ($637k; the N=250 first
reading undersold the spring the same way the registration did). The
finale's 58% win rate, flagged in FIELD-SPREAD as "a texture the
calibration agent may meet again through the invariant": met, and left —
the invariant's re-price raised check 3's ceiling rather than taxing the
finale, and the 45–55 band remains the ramp's business, not a bar's.

## 9. Standing verdicts for the next session

1. **Three rack SKUs sit over the 2.5 ceiling** (Soft Spikes 2.82×,
   Clean Slate 2.77×, New Glove 2.63× — band instrument, N=250, EXT 28).
   The cheap end has measured swingy in every world (Short Memory's
   three repricings; Clean Slate and New Glove shipped on two-run means);
   nobody reprices them without N≥250 on independent seeds agreeing, and
   over-ceiling means the PLAYER gets a bargain, so there is no urgency —
   only honesty.
2. **Check 2 is the season's whole wall** (37% at 400 seasons vs 33
   intent; the 250-bracket printed 33 and the drift is now recorded a
   third time). With check 3 pinned structurally small by the invariant,
   survival ~36 forces kill-2 ≈ 34 by arithmetic — anyone who wants the
   intent's 33 printed at 400 seasons must re-argue the intent table or
   the invariant, not sweep the bar again.
3. **The aggressive intent (45%) is now four worlds stale**: aggressive
   measures 27% against mixed's 35% — the wall presses win-heavy play
   hardest exactly where the stars eat. Same verdict as CALIBRATION-2
   and SHOP-SUPPLY, deeper: an intent question for the owner, not a
   sweep question. Safe reads 1%, still starved by the tiers (standing
   from SHOP-SUPPLY, unchanged).
4. **SAVE_VERSION stays 11, argued not assumed**: thresholds, prices (none
   moved), yields, SHARE and LADDER consume no rng and change no reducer
   code path — draw counts are untouched everywhere and a v11 log
   replays deterministically end to end. The one observable difference:
   bars moving UP means a replayed log that banked between $11.1M and
   $13.8M can now end at a check it used to clear — the same
   different-run class as every re-anchor's different money, handled by
   the reducer as any dead season, and the frozen ledger
   (runs/verified.json) keeps every board row without re-replay.
5. **The weeks matrix is stale a third time** (§6): early forfeits rose
   15–20%, so the early practice options' margins compressed for the
   first time. Re-run weekcheck's full matrix before quoting any option
   verdict.
6. **SHOP-SUPPLY's live acceptance stays open**: the next runstats bundle
   should show boost conversion under 60% and a tour-issue offer
   declined — and under the new bars, the owner's next real season is
   the first live test of a triple derived entirely inside the 36-hole
   world.

---

*Instruments run: shopcheck (band N=250 · lineage validation, brackets,
authoritative 400/policy + WINS + SHARE, seeds 700000+), weekcheck (§1
yields, N=1000, seeds 800000+), fieldcheck (coupling + the new RECEIPT=1
36-hole column, N=2000/cell, + winner-gap and TIES reproductions). Files
touched: season.ts (MONEY_CHECKS + sixth-anchoring provenance, tiePayout
win-worth note, SHARE, LADDER), weeks.ts (EVENT_YIELDS, STAGE_YIELD),
boosts.ts (band provenance only — no price moved), deck.test.ts (the
invariant re-priced to the solo cheque, comment carries the reasoning),
fieldcheck.ts (RECEIPT section), DESIGN.md §3.2 (sixth re-anchor note,
intent table, list paragraph), this file. tsc clean; vitest **146/146**
— the only test edited is the invariant, whose new arithmetic is §4. The
tree is left uncommitted for the owner.*
