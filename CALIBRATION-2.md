# CALIBRATION 2 — the once-and-last pass, run against the finished world

**26 Aug 2026 · the §7.4 session FIELD-CEILING.md ordered: one re-derivation,
after the marquee ramp froze its dials · predictions registered before each
measurement**

## 0. The world as it stands

Everything the economy reads shipped before this pass sat down, which is the
only reason it was allowed to sit down: the weeks redesign with the printed
trade and the 3-event sponsor cap (WEEKS-VERDICT.md addendum), Palmetto's
hole-2 rebuild (COURSE-CHANGES-8 — Two-Page Spread, REAL, and a named ledger
debt: the fieldShift went stale), and the MARQUEE RAMP (FIELD-CEILING.md
SHIPPED: Vail, Maravilla, Boone, Ito; k=4, R=1.4, β=0.8, CAP=0.3). The stars
eat cheques — the late-season win rate the parade complained about went
86% → 51%, with 99% of the newly lost weekends lost to a name — and every
number below exists because money that used to land in the player's column
now lands in theirs.

Baseline before a number moved: `npx tsc --noEmit` clean, vitest 131/131,
and shopcheck at the live triple reproduced the handoff digit for digit
(kills 43/49/3, mixed shopper survival 28%). SAVE_VERSION stays 7: this pass
touches thresholds, prices, shifts, and printed yields only — no reducer
semantics, no draw counts (confirmed per item below).

---

## 1. MONEY_CHECKS — the re-sweep (work-order item 1)

**Registered before measurement.** At the live $2.3M/$10.0M/$13.3M triple the
sweep reproduces 43/49/3. The re-derived triple: check 1 stays at $2.3M
(spring rule — the stars are names only through event 4, so nothing before
check 1 moved); check 2 comes down to ≈ $8.5–9.0M; check 3 comes DOWN
(FIELD-CEILING §8-2's registered direction) and — the prediction under test —
finally buys ≥ 10% kill at or below $13.3M. Mixed survival returns to ~36%;
mixed beats the hoarder decisively and stays a point or so above aggressive.
One structural fact registered in advance: the win-pays-the-final-leg
invariant (deck.test.ts) caps the last leg at < $3.78M, so LOWERING check 2
also lowers check 3's ceiling — the two bars cannot be swept independently.

**Measured.** The sweep (shopcheck, SETS brackets at 250 then the
authoritative 400 seasons per policy, seeds 700000+, stars on, Palmetto's
new shift, final boost prices):

```
                                   kills (of arrivals)      survival        hoarder
mixed      $2.3M/$10.0M/$13.3M      44  53   2   (live)        26%             4%
mixed      $2.3M/ $9.00M/$12.70M    44  39   1                 33%             8%
mixed      $2.3M/ $8.75M/$12.45M    44  35   2                 35%             9%
mixed      $2.3M/ $8.50M/$12.20M    44  31→35  3→5             37→35%         10%
                                    (250-season bracket → 400-season shipped)
```

**Shipped: $2.3M / $8.5M / $12.2M** — kills **44 / 35 / 5**, survival mixed
**35%** (target ~36), aggressive 34%, safe 5%, mixed hoarder 10%. The
economy ordering law holds verbatim: mixed beats the hoarder 3.5-to-1 and
sits exactly the point-or-so above aggressive. Scored against the
registrations:

- Check 1 untouched at $2.3M, kill 44 — the spring rule in the books
  (predicted, hit; same digit as slice 4).
- Check 2 came down $10.0M → $8.5M. Its 35% kill sits over the 29% intent
  BY DERIVATION, not by accident: with check 3 structurally unable to
  carry its 14 (below), the middle check absorbs the missing load or
  overall survival floats to 39% — the sweep showed 29%-on-intent at this
  same bar costs three survival points. Survival got the argument.
- Check 3 came down $13.3M → $12.2M, pinned to the invariant's ceiling
  over the new check 2 (last leg $3.7M against a $3.4M major win; 10th at
  the finale pays $605k, so the leg still demands a win). Kill 5% — up
  from 1–3%, nowhere near 14%. The full account is in the §8-2 scorecard.
- One sensitivity noted for the next reader: the two $100k boost
  repricings between the bracket run and the authoritative run moved the
  shopper's buy order enough to shift check 2's kill 31 → 35 and survival
  37 → 35 on identical seeds. These bars are honest to ±2 points and no
  finer; nobody should re-litigate a point of drift without 400 fresh
  seasons in hand.

## 2. SHARE + LADDER — re-measured with stars in the field (item 2)

**Registered.** Star cheques thin the shopper's median: predict the 20th-place
anchor falls $19.6M → ~$17–18M, the SHARE curve's late loading eases a touch,
and the symptom season — a finished $23,924,881 gross, which ranks 15 on the
live ladder — reads ~11–12 after re-anchoring. Frozen rows in
runs/verified.json are ledger-safe and are not recomputed.

**Measured (SHARE=1, 400 shopper seasons, the same run as the shipped
triple).** Median cumulative gross by event:

```
$146k $401k $813k $1.95M $2.75M $3.52M $5.86M $6.77M $7.63M $8.45M $11.05M $12.22M $13.46M $15.80M
SHARE 0.01  0.03  0.05  0.12  0.17  0.22  0.37  0.43  0.48  0.54  0.70   0.77   0.85   1.00
```

- **Anchor $19.6M → $15.80M** — deeper than the registered $17–18M: the
  stars taxed the median harder than predicted (the miss is recorded; the
  mechanism read was right, the magnitude wasn't). Every LADDER rung
  re-scales to the anchor at its old ratio, rounded to $100k (1st
  $45.9M … 20th $15.8M … 72nd $800k).
- **SHARE tilts a few points earlier** (0.02→0.03 at 3, 0.09→0.12 at 4,
  0.32→0.37 at 7): the stars leave the spring alone and bite the late
  wins, so the spring carries a larger share of a smaller season —
  registered direction, hit.
- **The symptom, cured and receipted:** `moneyListRank(23_924_881, 14)`
  returns **8** (was 15). Ten wins reads like ten wins. Prediction said
  ~11–12 — right direction, undershot for the same reason the anchor was.
  The checks now demand paces worth roughly 26th, 17th, then 20th
  (DESIGN.md §3.2 updated). runs/verified.json untouched, as ordered —
  the ladder is a lens, not a record.

## 3. Boost band check (item 3)

**Registered.** FIELD-CEILING §7.4 predicts the mid-band absorbs the tier —
win-eating trims every boost's return roughly proportionally. Budget ≤ 2
repricings; if more drift out, report to the band's owner instead.

**Measured (shopcheck top section, N=250, mixed, stars on, Palmetto's new
shift in).** The prediction held with room to spare: the whole shelf
compressed toward ~1.6–1.9× — a bare season now earns $5.96M, and every
return came down roughly proportionally — and **fifteen of seventeen boosts
held the band untouched** (top of shelf: Pontoon 2.25×, Marlene 1.93×,
Super Ball 1.90×; bottom of the survivors: Fresh Grips 1.52×). The two that
slipped OUT both slipped UNDER, and they are the two cheapest items — the
least cushion above the 1.4 floor:

| boost | measured | old price | old × | new price | new × |
|---|---|---|---|---|---|
| Soft Spikes | $412k/season | $300k | 1.37 | **$200k** | 2.06 |
| Short Memory | $366k/season | $300k | 1.22 | **$200k** | 1.83 |

Exactly the ≤ 2 budget — both repriced to measured value over two on the
$50k grid, provenance in boosts.ts. No tier line moved (Forged Wedges stays
premium), nothing drifted over, and the band itself needs no owner
conversation. Noted in passing, not in scope: the best single card cut
(Smooth It) now measures $1.40M against CUT_PRICE $950k — 1.47×,
coincidentally inside the same band, so the cut price stands.

## 4. fieldcheck ten-course confirm (item 4)

**Registered.** Nine of ten within ±0.1 untouched (the tier is course-blind
and the field median never moved). Palmetto is KNOWN stale — CHANGES-8 §3.1
named the debt: the rebuild moved the course −1.64 → −1.15, target Δ
−2.45 → −1.96, linearization ≈ −0.146 from the registered −0.182.

**Measured (N=2000 fields/cell, F=0.15).** The confirm found the fieldcheck
TARGET table itself carried three stale rows — Palmetto (the named debt) plus
Bracken Ridge and Salt Flats, whose REVIEW-7 re-baseline (+0.55 / +1.26) had
reached the registry header but never this table; retyped from the live
canon ladder first. Then:

- **Nine courses confirm within ±0.1, untouched** — including Salt Flats
  (Δ +0.36 vs target +0.45, miss 0.09, inside) and Bracken Ridge (−0.26,
  dead on). Predicted untouched: **hit**.
- **Palmetto re-derived: fieldShift −0.182 → −0.145** (old offset measured
  Δ −2.49 against the new −1.96 target, miss −0.53; the sweep chose −0.145 →
  Δ −1.99, miss 0.03). Prediction −0.146: **hit to the third decimal**. The
  old shift was making the field half a stroke tougher at Palmetto than the
  rebuilt course now is — a relative fine on the player, now repealed.

## 5. weekcheck EVENT_YIELDS (item 5)

**Registered.** The printed yields were measured pre-stars (N=1000, seeds
800000+). With stars on: events 1–4 unchanged within noise (spring rule);
mid season down a few percent (the ramp is young); late season down 10–20%
— the stars convert the shopper's wins to 2nd/3rd cheques exactly where wins
were the yield ($1.53M → $910k at a $9M purse). Predict event 14's $3.01M
lands ~$2.4M, event 11's $2.89M ~$2.3M, and STAGE_YIELD late $1.93M → ~$1.6M.
The weekcheck instrument gets the same STARS/K/RAMP/BETA/CAP knobs shopcheck
carries (it had none — the one instrument still star-blind), plus a YIELDS=1
gate so the N=1000 re-measure doesn't drag the 21-row option matrix along.

**Measured (weekcheck §1, N=1000, mixed shopper, seeds 800000+, stars on).**
Baseline gross $14.94M. Per event, printed → measured (shipped rounded to
$10k):

```
ev      1     2     3     4♦     5     6     7♦     8     9    10    11♦    12    13    14♦
was   280k  330k  360k  1.27M  770k  790k  2.31M 1.14M 1.11M 1.14M 2.89M 1.31M 1.29M 3.01M
now   300k  320k  360k  1.24M  710k  720k  2.06M  920k  900k  860k 2.25M 1.00M  950k 2.36M
```

Events 1–4 held within noise — the spring rule, now visible in a third
instrument. The mid season eased 8–19% (the ramp is young there) and the
late season fell 22–26%, squarely in the registered 10–20%+ direction with
the point predictions landing (event 14 predicted ~$2.4M → $2.36M, event 11
~$2.3M → $2.25M; STAGE_YIELD late predicted ~$1.6M → $1.49M, a hair deeper).
STAGE_YIELD shipped: early $590k · mid $1.15M · late $1.49M (was
$600k/$1.34M/$1.93M). The schedule screen was overstating a late
withdrawal's price by nearly a quarter; it tells the truth again. One
side-note for the weeks ledger: every yield-vs-option comparison in
WEEKS-VERDICT.md §2 was priced against the fatter pre-stars forfeits — the
practice options' GOOD DEAL verdicts can only have improved (the forfeited
event is now worth less), so no verdict flips, but the printed deltas there
are historical numbers now.

---

## §8-2 scorecard — the registered prediction, scored

> *"Check 3 kills ≥ 10% of arrivals at a bar no higher than $13.3M … If the
> sweep tops out at 8–9%, that is within one re-sweep of intent and the
> intent number gets the argument, not the mechanism."* — FIELD-CEILING §8-2

| clause | registered | measured | verdict |
|---|---|---|---|
| the bar moves DOWN if it moves | at or below $13.3M | $13.3M → **$12.2M** | **hit** — the wall's signature unwinding, exactly as called |
| … while buying ≥ 10% kill | ≥ 10% | **5%**, and 2–5% at EVERY bar the invariant permits | **miss** — below even the 8–9% escape line |

**The structural fact the registration did not price:** the invariant
couples the bars. The last leg must stay under $3.78M (a major win must buy
it), so every dollar check 2 gives back toward its own 29% intent comes off
check 3's ceiling. Cheque-eating was real — it bought check 3's kill up
from 1% to 5%, and it moved the bar in the registered direction — but
uncontested wins were only ever a quarter of the residual. **Prediction 2
FAILS, and §8's own escape clause now governs** (see standing verdicts).

The §8 predictions this pass could score, for the record: §8-3 (squeeze
shape, spring rule) had already measured as a hit at the build; this pass
adds a third instrument's confirmation (EVENT_YIELDS events 1–4 unchanged).
§8-1 and §8-4 still await live replay bundles from the only population that
matters.

## Standing verdicts for the next session

1. **The 14% intent for check 3 is dead as a bar-setting problem — by
   escape clause, with receipts.** FIELD-CEILING §8 pre-committed: if star
   cheque-eating could not make check 3 bite inside the invariant, the
   residual is raw equipment over-supply and the next dial is **honest
   rentals** — consumable SKUs that SAY they expire ("Fresh Grips: three
   events"), priced on their window — never sticker decay of owned goods,
   and never another threshold move. This pass measured the ceiling: 2–5%
   at every legal bar. Whoever designs the rentals should re-argue the 14%
   intent number itself in the same document (DESIGN.md §3.2's intent
   table predates the drops, the rotation, and the stars — three worlds
   ago). Until then, 5% is the honest number and it is PRINTED as the
   honest number.
2. **The aggressive-survival intent (45%) is three worlds stale.**
   Aggressive measures 34% against mixed's 35% — the inversion survived
   the stars, which press win-heavy play hardest. No triple can reorder
   two policies facing the same bars; the dial is the economy (what
   aggression banks through event 9), and the intent table needs the
   owner's re-argument, not another sweep.
3. **WEEKS-VERDICT.md §2's option deltas are historical numbers now** —
   every one was priced against pre-stars forfeits that this pass measured
   22–26% fatter than the live world. No verdict flips (the forfeited
   event got cheaper, so the practice options' GOOD DEALs only improved),
   but the next weeks conversation should re-run weekcheck's full matrix
   (the instrument now carries the stars) rather than quote that table.
4. **Instrument hygiene, for whoever measures next:** the fieldcheck
   TARGET table had gone stale in three rows while the registry header
   was current — when a course review re-baselines the canon ladder, BOTH
   copies move or the confirm lies. And the ±2-point sensitivity of kill
   rates to $100k of shop pricing (buy-order effects) means MONEY_CHECKS
   claims finer than that need 400 seasons and the exact live shelf.
5. **SAVE_VERSION stays 7, argued not assumed:** every bar moved DOWN, so
   no logged action becomes illegal on replay; prices/shifts/yields touch
   no draw counts; and both board runs live in runs/verified.json's frozen
   ledger, which board.ts trusts without re-replaying. Nothing this pass
   shipped changes reducer semantics.

---

*Instruments run: shopcheck (band, sweep, SHARE, 400-season confirm),
fieldcheck (ten-course confirm + Palmetto sweep, N=2000/cell), weekcheck
(§1 yields, N=1000, now star-aware via the same STARS/K/RAMP/BETA/CAP knobs
as shopcheck, plus a YIELDS=1 gate). Files touched: season.ts (checks,
LADDER, SHARE, provenance), courses/index.ts (Palmetto fieldShift + canon
header), boosts.ts (two repricings + header), weeks.ts (yields), fieldcheck
(TARGET retype), weekcheck (star knobs), DESIGN.md §3.2/§3.4c,
FIELD-CEILING.md postscript, this file. tsc clean; vitest 131/131 — no test
edited, none needed: the invariant holds at the new triple by arithmetic
($3.7M leg under the $3.778M cap). The tree is left uncommitted for the
owner.*
