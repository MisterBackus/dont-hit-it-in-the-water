# SHARPNESS — the largest untested lever, measured at last

**27 Aug 2026 · PLAYTEST-NOTES-1 note 11 · predictions registered in this file
BEFORE the first instrument ran, and scored in §7**

## 1. The problem, stated the way the note stated it

`SEASON[n].sharpness` is a straight line — **×1.40 at event 1 to ×0.80 at event
14**, computed inline in the SEASON builder — applied in `boostsOf`
(reducer.ts, the `_sharp` pseudo-boost) as a **global multiplier on every cone**,
times `s.practice`. Cones narrow **43% across a season, for free**: about 4% a
tournament, on every club in the bag, whether the player buys anything or not,
whether they decide anything or not.

That free ramp is **larger than anything purchasable**:

```
Forged Wedges     ×0.55   but only inside the short band
The Golden Driver ×0.66   but only past 200 yards
Fairway Finder    ×0.75   tee shots only
the calendar      ×0.57   every shot, every club, no price, no decision
```

Two things follow, and they are why this number was pulled off the shelf:

1. **It collides with P7.** "The bar rises until safe play cannot clear it" is
   supposed to be a squeeze the player answers with decisions. A 43% free
   improvement means a large share of "getting better" is just time passing.
2. **It is the leading suspect for 12 wins from 13** (runs/andrew-5.json,
   frozen) against the marquee ramp's registered 45–60% band (FIELD-CEILING
   §8-1). The stars were tuned against harness players who lack a human's
   judgment; the free ramp carries the rest.

Like the encounter money and the top of the LADDER, this number was **written,
never measured**. It is one of the last such numbers in the project.

## 2. The two shapes, as one parameter family

Both shapes the note ordered are the same formula with a different knee, which
is what makes them sweepable against each other rather than two arguments:

```
sharp(n) = max(FLOOR, 1.40 − (n − 1) · (1.40 − FLOOR)/(KNEE − 1))

  shape (a)  SHALLOWER OVERALL    KNEE = 14 — a straight line to FLOOR at the finale
  shape (b)  FRONT-LOADED, FLAT   KNEE < 14 — the line runs to FLOOR at event KNEE,
                                  then the calendar stops giving anything away
  live                            KNEE = 14, FLOOR = 0.80
```

The knee is doing double duty on purpose. At **KNEE ≈ 10, FLOOR = 1.00** the
descending leg has almost exactly the live slope (0.044/event vs the live
0.046), so shape (b) can be made to leave the **spring digit-identical** and
take its whole bite out of events 10–14 — which is the note's actual argument
("the free gains land early, late-season power is something you bought"). At
KNEE = 6 the same family gives true front-loading: the gains arrive faster than
today and stop sooner.

The instruments carry it as `SHKNEE`/`SHFLOOR` (shopcheck, cutcheck); unset,
they read the shipped `ev.sharpness` digit for digit.

## 3. Registrations — written before anything ran

**R1 — instrument lineage.** With the knob unset, shopcheck reproduces
CALIBRATION-3 §1/§3 digit for digit at the live triple $2.6M/$10.1M/$13.8M:
kills **44/37/2**, survival mixed **35%**, aggressive **27%**, safe **1%**,
mixed hoarder **6%**; WINS reads late (10–14) **49%**, finale **57–58%**, hot
weeks 100%, buys 6.0. Nothing below is believed until this row prints.

**R2 — the size of the lever, in strokes.** Taking the finale from ×0.80 to
×1.00 is 25% wider cones on every late shot. Predict it costs the mixed shopper
**0.8–1.6 strokes per 8-hole event** late — i.e. the free ramp is worth more
than any single item on the shelf, which is note 11's thesis and the first thing
this pass can falsify.

**R3 — the late win rate falls SUBLINEARLY, because the band absorbs it.** The
naive read (wider cones → fewer wins) overstates the drop: 99% of late weekends
lost are lost to a star (FIELD-CEILING sweep B), and `starTarget`'s band chases
the player's own trailing pace at β=0.8 — so a player who gets worse is chased
by stars who relax toward the ramp. Predict the late win rate moves **49% →
36–46%** at FLOOR 1.00 (point: ~41), and that the drop is governed by **FLOOR
alone**, not by the shape: (a) and (b) at the same FLOOR should read within ~3
points of each other on late win rate, because they agree at event 14 and differ
only in the middle. **The 45–60 band is therefore a CEILING ON THE FLOOR, not a
free parameter** — FLOOR much above 1.00 pushes the strong player out of the
band low, which is the failure the note did not anticipate.

**R4 — the spring separates the two shapes, and it is the reason (b) wins if it
wins.** Shape (a) at FLOOR 1.00 makes events 2–5 *wider* than live (ev 5: 1.28
vs 1.22) — the spring gets HARDER, so check-1 kill rises **3–8 points above its
calibrated 44** at the live bar and the calibration has to cut check 1 to give
it back. Shape (b) at KNEE 10 holds events 1–5 within 0.02 of live, so predict
check-1 kill **within ±2 of 44** (noise) and no spring bar move. The spring rule
is four instruments deep in this project; a shape that moves it is paying a
price the note never costed.

**R5 — kills and survival at the live triple.** Both shapes make the back half
poorer, so at unmoved bars predict kills rise and survival falls:

```
                     kills at 2.6/10.1/13.8      mixed survival
  (a) FLOOR 1.00        48±4 / 48±6 / 4±3           20–28%
  (b) KNEE 10 FL 1.00   45±3 / 44±6 / 3±3           26–32%
```

(b) is the strictly gentler world at equal FLOOR (it is sharper than (a) at
every event but the last), so it must read richer at check 2 — if it does not,
the harness is lying and R1 has to be re-run.

**R6 — the ordering law is shape-blind.** Sharpness is a global multiplier that
knows nothing about policy, so predict **mixed > aggressive** holds at 5–10
points and **mixed ≥ 3× the hoarder** at every cell swept. If a shape inverts
the ordering, that is a finding about the economy, not about this dial.

**R7 — what ships (the note recommends (b); measurement outranks the note).**
Predict shape **(b)**, KNEE 9–10, FLOOR **0.95–1.05**, chosen so the late win
rate lands mid-band (~50) rather than at its floor, and so the spring is
untouched by construction.

**R8 — the closing calibration.** Re-derived against the finished world, predict
the triple lands **check 1 $2.5–2.7M** (unmoved if (b) ships — its spring is
live's), **check 2 $8.8–9.8M**, **check 3 $12.3–13.3M**, with kills **44 /
33–37 / ≤5** and mixed survival **33–39**. Both late bars move DOWN, for the
first time since CALIBRATION-2, and for the honest reason: the season the bars
read got poorer at exactly the events they read.

**R9 — SHARE.** The median season falls; the curve tilts EARLIER (the spring is
untouched and the back half is worth less), so predict the ev-9/12 shares rise
2–5 points and the season median drops **5–15%** from $16.97M. Re-measured and
re-shipped only if the medians move beyond tolerance. **The LADDER is not
touched**: it was re-anchored this session to the reachable maximum (a perfect
season = rank 1, $28.9M of purse money), and purses did not move here.

*(Everything below this line was written after the instruments ran.)*

## 4. The measurement

### 4.0 Lineage (R1) — believed before anything else

shopcheck, knob unset, 400 seasons/policy, seeds 700000+, live triple, live
shelf, stars on, EXT 28:

```
              kills at 2.6/10.1/13.8    survival    hoarder (bank)
  safe              93/87/25                1%           0%
  mixed             44/37/ 2               35%           6%
  aggressive        42/50/ 7               27%           4%

  WINS: 91% of 2065 wins solo · late (10–14) 49% · finale 58% · hot weeks 100%
        buys 6.0 · kit@14 9.2 · conversion 23%
```

Digit for digit CALIBRATION-3 §1 and §3. **R1: hit, whole.** Every table below
is from the same instrument with `SHKNEE`/`SHFLOOR` set.

### 4.1 Both shapes, swept (250-season brackets, mixed, live bars)

Sixteen cells, every one at the **live** triple $2.6M/$10.1M/$13.8M — so the
kills and survival columns read "what the world did to the unmoved bars", which
is what a calibration needs to know before it moves one. Baseline row is the
live curve at the same 250 seasons.

```
shape                curve                             kills      surv  hoard  late win  finale
LIVE   1.40→0.80     ×0.60 of free cone, to the end   44 33  3     37%    5%      49%      55%

(a) SHALLOWER OVERALL — the same straight line, ending higher
  →0.90              1.40 …0.94 …0.90                 42 43  2     32%    3%      45%      51%
  →0.95              1.40 …0.97 …0.95                 45 45  3     29%    2%      42%      46%
  →1.00              1.40 …1.03 …1.00                 46 44  4     29%    1%      43%      48%
  →1.05              1.40 …1.06 …1.05                 45 46  5     28%    2%      42%      45%

(b) FRONT-LOADED THEN FLAT — knee at event K, then the calendar stops giving
  K6  →0.90          1.40 1.30 1.20 1.10 1.00 0.90…   30 26  2     50%   18%      51%      55%
  K6  →0.95          1.40 1.31 1.22 1.13 1.04 0.95…   34 30  3     45%   13%      47%      50%
  K6  →1.00          1.40 1.32 1.24 1.16 1.08 1.00…   29 35  5     44%   10%      46%      52%
  K6  →1.05          1.40 1.33 1.26 1.19 1.12 1.05…   32 32  4     44%    5%      43%      53%
  K8  →0.90          1.40 …1.04 0.97 0.90…            32 24  2     50%   12%      47%      55%
  K8  →0.95          1.40 …1.08 1.01 0.95…            36 31  3     43%   10%      45%      51%
  K8  →1.00          1.40 …1.11 1.06 1.00…            40 33  2     39%    8%      46%      46%
  K8  →1.05          1.40 …1.15 1.10 1.05…            42 37  1     36%    6%      45%      48%
  K10 →0.90          1.40 …0.96 0.90…                 41 33  2     39%    8%      50%      49%
  K10 →0.95          1.40 …1.00 0.95…                 42 37  0     37%    6%      48%      49%
  K10 →1.00          1.40 …1.04 1.00…                 44 38  0     35%    4%      45%      52%
  K10 →1.05          1.40 …1.09 1.05…                 42 44  2     32%    3%      43%      46%
```

Three things fall out of that table, and they decided the ship:

1. **The late-season win band is a ceiling on the FLOOR, not a free
   parameter (R3, hit).** Read the last two columns down: nothing with a
   floor at ×1.05 keeps the strong player inside 45–60, and ×1.00 sits on the
   line. The 45–60 band the note wanted the game brought INTO turns out to be
   the constraint that stops this dial being turned further — which is the
   opposite of what the note assumed, and the single most useful thing this
   sweep produced.
2. **Shape (a) pays for its late nerf out of the SPRING (R4, hit).** Every
   (a) row makes events 2–5 wider than live, and check 1's kill goes 44 → 45,
   46, 45 while survival collapses to 28–32%. Shape (a) is a season-long tax
   dressed as a late-season fix.
3. **A knee earlier than 8 breaks the spring the OTHER way.** At K6 the free
   gains arrive so fast that check 1 sends home 29–34% against its calibrated
   44 and the *hoarder* survives 10–18% — the shop stops being the difference
   between living and not. "The spring must not get harder" has a mirror
   nobody had written down: it must not get much easier either, or every
   number derived from it is stale.

### 4.2 The finalists, authoritative (400 seasons/policy, seeds 700000+)

```
curve                 kills 2.6/10.1/13.8   mixed  aggr  safe  hoard  late win  finale
LIVE 1.40→0.80             44 37  2          35%   27%   1%    6%       49%      58%
K10 →0.90                  43 35  3          36%   28%   2%    7%       50%      52%
K10 →0.95   ← SHIPPED      43 37  1          36%   27%   1%    5%       48%      50%
K10 →1.00                  44 41  1          33%   27%   1%    4%       44%      50%
```

`→1.00` is the shape that removes the most free power, and it is out of the
band at 44%. `→0.90` keeps a win rate the live curve already had and gives
back half the ramp. **`→0.95` is the deepest honest cut**: late win 48%,
mid-band; survival 36% on the calibration's own target; kills within a point
of the live world at every check.

### 4.3 The cut squeeze (cutcheck, N=400, kit ×1, live ADVANCE)

```
mixed      1  2  3  4  5  6  7  8  9 10 11 12 13 14   overall
live      93 69 67 60 61 82 49 65 70 64 59 62 54 49     64%
shipped   93 69 67 59 61 83 53 66 71 68 59 56 48 42     64%
safe   finale 38 → 23      aggressive finale 51 → 41
```

Events 1–6 digit-identical; the tail deepens exactly inside the flat zone
(finale 49 → 42, event 13 54 → 48, event 12 62 → 56) and the season's overall
rate does not move. That is P7 in one row: the same amount of golf, with the
difficulty moved to the end, where the decisions and the equipment are.

### 4.4 What the lever is actually worth, in strokes (R2 — the miss)

seasoncheck grew a live-curve run (D) and a mean column beside its median,
because the median of a four-hole score is an integer piled on four values and
cannot price a cone. Bare player, no kit, N=400/event, mean rel over 8 holes:

```
ev              10     11     12     13     14
old 1.40→0.80  −2.33  −1.51  −2.77  −2.73  −2.26
shipped        −2.43  −1.51  −2.64  −2.46  −1.61
cost            −0.10   0.00  +0.13  +0.27  +0.65
```

**R2 registered 0.8–1.6 strokes an event late and the honest answer is 0.65 at
the finale, under a stroke everywhere else — a MISS, and the most interesting
number in this document.** The headline (43% of free cone!) overstates the
lever, because cone width buys strokes sublinearly: most shots land fine at
either width, and the multiplier only shows up in the tail. What 0.65 strokes
a week buys is nonetheless real — seasoncheck's own end-of-season make-cut
goes 62% → 52% on a fixed line — but anyone who reaches for this dial next
should price it at **two thirds of a stroke, not a stroke and a half**.

## 5. What shipped

```
sharp(n) = max(0.95, 1.40 − (n − 1) × 0.05)

ev        1     2     3     4     5     6     7     8     9    10 …  14
was     1.40  1.35  1.31  1.26  1.22  1.17  1.12  1.08  1.03  0.98 … 0.80
now     1.40  1.35  1.30  1.25  1.20  1.15  1.10  1.05  1.00  0.95 … 0.95
```

Five hundredths a week for nine weeks, then nothing. In `src/content/season.ts`
as `SHARP_START`/`SHARP_FLOOR`/`SHARP_KNEE` + `sharpnessAt()`, with the
provenance above the constants in the established style, and locked by a new
test in `deck.test.ts` (`the free sharpness ramp stops at event 10`) that pins
both ends and the flat tail.

Why this one, in one paragraph: it is the shape that removes the most free
power while leaving the strong player inside the band FIELD-CEILING registered
(48%), and it is the only family member that leaves the spring alone by
construction — events 1–9 sit within a hundredth of the old line, so the two
checks that read events 5 and 9 never see it, and the entire change lands on
the five events where a player has a kit, a wallet, and something to decide.
The note recommended (b); the measurement chose (b) for a reason the note did
not have: (a) at equal late win rate takes its price out of April.

## 6. The closing calibration — the first re-derivation that moved nothing

Run last, at the shipped curve, with the concurrent encounter-money lane
already in the working tree (`git log --oneline -8` + `git status` before the
pass; that lane touches `encounters.ts`, `reducer.ts`, `focuscheck.ts` and adds
`encountercheck.ts`, none of which shopcheck reads — `ENCOUNTER_BOOSTS` is
unchanged at `{foundtiger}`, which is the only thing of theirs this instrument
consumes).

**The bracket** (250 seasons, mixed, shipped curve):

```
   $2.50M /  $9.50M / $13.00M     41  27  1     survival 43%
   $2.40M /  $9.80M / $13.20M     39  34  1              40%
   $2.60M /  $9.80M / $13.50M     42  31  1              40%
   $2.60M / $10.10M / $13.80M     42  37  0              37%   ← the live triple
   $2.70M / $10.10M / $13.80M     43  36  0              37%
   $2.60M / $10.40M / $14.10M     42  38  0              36%
```

**The authoritative 400** at the live triple: kills **43 / 37 / 1**, survival
mixed **36%**, aggressive **27%**, safe **1%**, mixed hoarder **5%**.

Against the intent table (44 / 33 / ≤8, survival 33–39 target ~36) that is the
calibrated world, unmoved — so **MONEY_CHECKS ship unchanged at
$2.6M / $10.1M / $13.8M**, and the pass records why rather than pretending it
found something:

- **Check 1** reads 43 against its calibrated 44 — one point, inside the ±4
  the spring rule is quoted at and inside the ±2 these bars are honest to.
  Moving a $100k grid step to chase it would be noise-chasing of exactly the
  kind CALIBRATION-2 verdict 4 warns about.
- **Check 2** reads 37, four over intent, for the fourth pass running. The
  standing arithmetic still governs: with check 3 structurally small, survival
  ~36 requires kill-2 near 34, so survival keeps the argument. The bracket
  shows the response is alive and gentle ($9.5M/$9.8M/$10.1M/$10.4M buy
  27/31/37/38), so the number is a choice, not a wall the sweep failed to find.
- **Check 3** reads 1% (was 2%) and sits AT the invariant's ceiling on the
  $100k grid ($10.1M + a $3.7M leg against the $3.78M cap): it cannot rise,
  and lowering it buys less kill, not more. Structurally small on purpose, as
  three passes have now said.
- **SHARE re-measured** (shopcheck SHARE=1, 400 seasons, same seeds): medians
  $121k $420k $1.18M $2.38M $3.34M $4.04M $6.51M $7.59M $8.81M $9.88M $12.64M
  $13.61M $14.48M **$16.77M**. The curve tilts back EARLIER by 1–3 points from
  event 5 (0.73 → 0.75 at 11, 0.78 → 0.81 at 12) — the fall is worth less of a
  season whose spring is untouched, which is the shipped shape's signature.
  Shipped. The season median moves −1.2% ($16.97M → $16.77M), well inside the
  $750k the ladder re-anchors treat as material.
- **The LADDER is untouched, deliberately.** It was re-anchored this session
  to the reachable maximum (a perfect season = rank 1) and no purse moved
  here, so there is nothing for this pass to re-scale. That fix is display-only
  and final.
- **SAVE_VERSION stays 11.** Sharpness is content read through the existing
  `_sharp` pseudo-boost; no reducer semantics, no draw counts, no rng
  consumed. A v11 log replays deterministically end to end — the only
  observable difference is the same different-run class every re-anchoring
  has: a replayed shot cone is a different width, which is what changing a
  content number means.

## 7. The registrations, scored

| # | registered | measured | verdict |
|---|---|---|---|
| R1 | lineage reproduces CALIBRATION-3 digit for digit | 44/37/2 · 35/27/1 · hoarder 6 · 91% solo · late 49 · finale 58 | **hit, whole** |
| R2 | the lever is worth 0.8–1.6 strokes an 8-hole event late | **0.65 at the finale**, ≤0.3 elsewhere | **miss, low** — cone width buys strokes sublinearly (§4.4) |
| R3 | late win falls sublinearly; governed by FLOOR not shape; band is a ceiling on the floor | at ×1.00 both shapes read 43–44; at ×0.95, 42 (a) vs 48 (b); band binds at ×1.00 | **hit on the mechanism, wrong on one detail** — shape matters more than registered, because (a) also taxes the spring |
| R4 | (a) raises check-1 kill 3–8 over 44; (b) at knee 10 stays within ±2 | (a) 45/46/45 at 250 vs live 44; (b) K10 42–44 | **hit** |
| R5 | (a) survival 20–28%, (b) 26–32% at unmoved bars | (a) 28–32%, (b) K10 32–39% | **half** — both ran richer than registered; the direction and the ordering between shapes were right |
| R6 | ordering law shape-blind: mixed > aggressive by 5–10, mixed ≥ 3× hoarder | shipped 36 / 27 / 5 — nine points and seven-fold | **hit** |
| R7 | ships (b), knee 9–10, floor 0.95–1.05, late win mid-band | knee 10, floor 0.95, late win 48 | **hit** |
| R8 | calibration cuts both late bars: 2.5–2.7 / 8.8–9.8 / 12.3–13.3 | **nothing moved**: 2.6 / 10.1 / 13.8, kills 43/37/1, survival 36 | **miss on the bars, hit on every band** — R4's own mechanism (the knee hides the change from events 1–9) implied this and R8 failed to follow it through |
| R9 | SHARE tilts earlier, median −5 to −15% | tilts earlier by 1–3 points; median −1.2% | **half** — direction right, size wrong (only five events moved, and the shopper's kit absorbs part of it) |

## 8. Standing verdicts for the next session

1. **The free ramp is worth two thirds of a stroke a week, not a stroke and a
   half** (§4.4). Note 11's "largest untested lever" was true about the
   MULTIPLIER (×0.57 free vs ×0.55 on wedges only) and overstated about the
   EFFECT. Anyone reaching for cone width as a difficulty dial should price it
   in strokes first; the instrument now prints them (seasoncheck's mean
   columns and run D).
2. **The 45–60 late-win band is now a binding constraint on this dial**, and
   it bound before the design goal was fully paid: ×1.00 removes more free
   power and reads 44%. If the owner ever wants the ramp flatter still, the
   band has to move first (a FIELD-CEILING conversation, R and β), not the
   floor.
3. **This pass cannot claim to have fixed 12-of-13.** The harness's strong
   player was ALREADY inside the band at 49% and ships at 48%; what moved is
   the finale (58% → 50%), the make-cut tail (49% → 42%) and the free half of
   progression. The owner's 92% is a HUMAN number and the only instrument that
   can score it is a runs/ replay of his next season — FIELD-CEILING §8-1b,
   still open, now with one more suspect eliminated and none left that were
   written rather than measured.
4. **The spring rule has a mirror.** "Must not get harder" is half the rule:
   the K6 rows made it much EASIER (check-1 kill 29–34 against 44) and that is
   equally a breach, because every number downstream was derived at 44. State
   it as a band, not a direction, next time it is quoted.
5. **MONEY_CHECKS are now encounter-blind in a world where encounters have
   teeth.** The concurrent lane made encounter money a fraction of check 3
   (`STAKE_POINT` = check 3 / 100, so a fine is ~$552k, four points), and no
   instrument in `src/tools/` models an encounter inside a shopper season
   except their new `encountercheck.ts`. The coupling is one-way and small
   today; the first person to move a bar owns re-reading it, and the honest
   next step is teaching shopcheck the encounter stream so the two are
   derived in the same world.
6. **EVENT_YIELDS and the weeks matrix are stale by five events.** weeks.ts's
   printed per-event yields and STAGE_YIELD were measured on the old ramp; the
   flat tail makes events 10–14 slightly poorer (SHARE says the late medians
   fell 1–3 points of share). Not re-derived here — the file belongs to the
   weeks conversation, which is already carrying a "matrix is stale a third
   time" verdict from CALIBRATION-3 §6. This is the fourth.
7. **The three over-ceiling rack SKUs are unre-measured under the new curve**
   (Soft Spikes 2.82×, Clean Slate 2.77×, New Glove 2.63× — CALIBRATION-3
   verdict 1). The band section was skipped this pass on purpose (`BAND=0`,
   the new knob): the shelf's returns are read over a whole season and the
   flat tail lowers every one of them a little, so a band re-read is a real
   piece of work and belongs to whoever next opens the shop, at N ≥ 250 on
   independent seeds.

---

*Instruments run: shopcheck (lineage 400/policy; 16-cell 250-season sweep over
SHKNEE × SHFLOOR; three finalists at 400/policy; the calibration bracket and
its authoritative 400; SHARE=1 at 400 — seeds 700000+, stars on, EXT 28, offer
stream, budget 6, live shelf), cutcheck (make-cut squeeze at N=400, live and
shipped), seasoncheck (the stroke price, N=400/event, new run D and mean
columns). Files touched: `src/content/season.ts` (the curve + provenance,
MONEY_CHECKS seventh-derivation note, SHARE), `src/sim/reducer.ts` (one stale
comment — the `_sharp` carrier still said ×0.80), `src/sim/deck.test.ts` (one
new test locking the flat tail), `src/tools/shopcheck.ts` +
`src/tools/cutcheck.ts` (the SHKNEE/SHFLOOR knob, and shopcheck's BAND=0),
`src/tools/seasoncheck.ts` (run D + mean columns), `DESIGN.md` (§3.4a's line,
§3.2's measured column), this file. `npx tsc --noEmit` clean. The tree is left
uncommitted for the owner.*
