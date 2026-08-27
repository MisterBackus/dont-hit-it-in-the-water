# FOCUS-VERDICT — is focus the correct purchase every time?

**Note 12 of PLAYTEST-NOTES-1**, answered the way the note asked for it: measured,
not nerfed.

**Instrument:** `src/tools/focuscheck.ts` (new).
`npx tsx src/tools/focuscheck.ts` · `N=400 SECTION=mix npx tsx src/tools/focuscheck.ts`
Mixed play, 250–400 paired seasons per kit, seeds 600000+, EXT 28, four stars in
the field, live prices and live MONEY_CHECKS.
**Read-only: no price, no threshold, no dial and no line of game content was
touched.** The only files written are the instrument and this document.

---

## The question, narrowed

Focus being central is not the question. That is P1 — *"focus is your energy"* —
and focus buying three things where nothing else buys more than one (accuracy on
every technique, the birdie on every green, the redraw) is design working, not
design failing.

The question is the narrow one:

> **Does a focus item become the correct purchase EVERY time — and if so, does
> that quietly make the six-purchase season allowance less of a choice than it
> looks?**

The price table cannot answer it. Prices are *measured value over two*, from
`shopcheck` and `rewardcheck`, and both of those tools measure an item **in
isolation**: one boost, an otherwise empty bag, a whole season, what did it earn.
That measurement is the right one for setting a sticker and it is structurally
incapable of answering note 12, because note 12 is about an item's worth **given
what is already in the bag**. Isolation cannot see an interlock, cannot see
saturation, and cannot see a slot's opportunity cost — which is the entire
content of the word *allowance*.

So this measures marginal value, in two currencies the price table does not read.

**SURVIVAL** — the share of seasons clearing all three Money List checks. The
currency the player actually spends in: a boost that adds $2M to a season that
was going to clear every bar anyway has added nothing to the only number that
ends runs.

**LATE WIN RATE** — win% across events 10–14, the weekends the marquee ramp
contests.

---

## Registered before measuring

Written after reading the content and the two existing instruments, before
`focuscheck.ts` existed. Verbatim, with the verdict on each added afterwards.

The focus lane is defined from **data, not names** — any SKU carrying
`maxFocusBonus`, `focusRegenBonus`, `momentumSlack`, `sinkDiscount`, `freeSinks`,
`gimmeFeet` or `redrawDiscount`. That is **10 of the 24 sellable SKUs**:
Golden Putter, Fresh Grips, Marlene, Lucky Ball Marker, Inside the Leather,
Short Memory, An Organized Bag, New Glove, The Circle of Friendship, Clean Slate.

| # | Prediction | Outcome |
|---|---|---|
| **P1** | Slot 1 ranked by *survival* is not an all-focus top five; at least two of the top five are non-focus. Named call: **Tri-County Concrete finishes top three**, because survival is a money threshold and sponsor money is the only unconditional money on the shelf. | **HALF.** The top-five clause confirms — 2 of 5 are non-focus, and the single best first purchase is Super Ball. The named call **fails badly**: Concrete is 9th. |
| **P2** | Inside the Leather finishes 1st or 2nd at slot 1. | **FAILS.** 3rd on the instrument of record. (It is 1st on the raw all-three-checks column — which is the column that turned out to have no resolution. See below.) |
| **P3** | The best remaining focus item, added to a kit already holding Inside the Leather, measures **under 60%** of its own slot-1 delta. | **FAILS, and in the opposite direction.** Leather's own marginal *grows* from +0.504 alone to +0.860 in company — 171%, not 60%. |
| **P4** | At slot 6, on a focus-loaded kit, the top of the ranking flips to non-focus. | **FAILS.** The top three sixth purchases by late win are all focus. |
| **P5** | Instrument check: The Circle of Friendship measures ~0 on any kit holding Inside the Leather (`gimmeRange` takes the MAX — a structural zero). | **CONFIRMS EXACTLY.** 0.000 checkpoints, +0.0% survival, +$0 median. |
| **P6** | A best-six with the focus lane **banned** lands within 10 survival points of the unrestricted best six. | **CONFIRMS EMPHATICALLY.** Both reach 100%. |
| **P7** | Verdict: dominant but healthy. | **CONFIRMS** — but for almost none of the reasons predicted. |

Three of seven predictions failed outright and one half-failed. The prediction
that failed hardest, P3, was the crux of the whole exercise, and it failed
because it was reasoning about the wrong shape.

---

## What the instrument does

A season carrying a **fixed kit** all year, no shop and no drops, scored on gross
earnings against the live checks. Then a **greedy marginal build**: rank every SKU
by its delta on an empty bag, take the winner, re-rank all survivors on top of it,
and repeat to slot 6 — the live `SHOP_BUDGET`. Then the same build again with the
focus lane banned outright. Every kit is measured on the **same seeds**, so every
delta is paired.

**One instrument correction, made mid-run and worth recording.** The first pass
ranked on survival itself and had to be thrown away: a fixed **one-item** kit
clears all three checks in **0–4.4%** of seasons, so at slot 1 the survival column
could not tell twenty SKUs apart, and the greedy's first pick was being decided by
two seasons out of 250. The ranking column is now **mean checks cleared (0–3,
sequential)** — the same question with three times the resolution, monotone in the
same thing. Survival is still reported; it is no longer what the build ranks on.

**Read the levels with care.** The kit here is free and carried from event 1, so
survival runs far above the live calibrated 35% (CALIBRATION-3) — the best six
reach 100%. **The deltas and the ordering are the product of this tool. The levels
are not comparable to a calibration run and must never be quoted as one.**

---

## Slot 1 — the first purchase, all 24 SKUs

250 paired seasons each. Bare bag: 0.33 checkpoints, 0.0% survival, 5.2% late win,
$5.78M median. ◆ marks the focus lane.

| # | item | price | Δckpt | Δsurv | Δlate | Δmedian |
|---|---|---|---|---|---|---|
| 1 | Super Ball | $2.40M | **+0.588** | +3.6 | +10.8 | +$4.45M |
| 2 | ◆ Marlene, Thirty Years Here | $2.40M | +0.520 | +3.6 | **+14.6** | +$4.61M |
| 3 | ◆ Inside the Leather | $2.45M | +0.504 | +4.4 | +6.2 | +$4.12M |
| 4 | Golden Driver | $1.65M | +0.416 | +1.2 | +5.3 | +$3.12M |
| 5 | ◆ Golden Putter | $2.10M | +0.368 | +2.4 | +13.4 | +$3.83M |
| 6 | Long Tees | $1.80M | +0.364 | +1.2 | +5.5 | +$3.22M |
| 7 | Dead Ball | $1.10M | +0.328 | +0.0 | +0.4 | +$1.88M |
| 8 | Sponsor: Deiter's Heating & Cooling | $1.05M | +0.312 | +0.4 | +2.9 | +$1.83M |
| 9 | Sponsor: Tri-County Concrete | $1.40M | +0.308 | +0.4 | +0.0 | +$2.54M |
| 10 | A Baby Fade | $1.15M | +0.276 | +0.4 | +0.5 | +$1.54M |
| 11 | Stiff Shafts | $1.00M | +0.272 | +0.4 | +4.4 | +$1.50M |
| 12 | A Three Wood You Trust | $900k | +0.248 | +0.8 | +2.9 | +$1.16M |
| 13 | ◆ Lucky Ball Marker | $1.60M | +0.232 | +0.0 | +3.5 | +$2.48M |
| 14 | ◆ The Circle of Friendship | $1.30M | +0.228 | +0.8 | +2.1 | +$1.93M |
| 15 | Forged Wedges | $1.20M | +0.216 | +0.4 | +1.7 | +$1.85M |
| 16 | ◆ Fresh Grips | $1.45M | +0.152 | +1.2 | +5.5 | +$2.38M |
| 17 | A Good Yardage Book | $600k | +0.132 | +0.4 | +0.9 | +$941k |
| 18 | Sponsor: Lakeview Pontoon Rentals | $600k | +0.124 | +0.0 | +0.0 | +$1.27M |
| 19 | Soft Spikes | $200k | +0.124 | +0.0 | +0.8 | +$439k |
| 20 | ◆ New Glove | $350k | +0.080 | +0.0 | +0.4 | +$739k |
| 21 | Sponsor: Shorty's Bait & Tackle | $450k | +0.076 | +0.0 | +0.0 | +$806k |
| 22 | ◆ Clean Slate | $150k | +0.076 | +0.0 | −1.3 | +$310k |
| 23 | ◆ Short Memory | $200k | +0.076 | +0.0 | −1.1 | +$234k |
| 24 | ◆ An Organized Bag | $550k | +0.064 | +0.0 | +1.1 | +$808k |

**The best first purchase in the game is not a focus item.** It is Super Ball, ten
percent on every carry. Focus takes 2nd, 3rd and 5th, and the bottom six of the
whole shelf are five focus SKUs and a sponsor.

Read the **Δlate** column separately and the answer changes: there Marlene (+14.6)
and Golden Putter (+13.4) beat Super Ball (+10.8). That split — focus losing on
survival and winning on wins — is the finding, and it holds all the way down.

---

## Slot 6 — the sixth purchase, on a kit that already holds two focus items

On `superball + marlene + tees + goldenputter + concrete`, which by slot 5 already
survives **100%** of seasons. Every Δckpt in this table is **0.000**: survival is
saturated and has nothing left to say. So this table is ranked on **late win**,
which is the only currency still moving.

| # | item | price | Δlate | Δmedian |
|---|---|---|---|---|
| 1 | ◆ Fresh Grips | $1.45M | **+8.9** | +$1.81M |
| 2 | ◆ New Glove | $350k | **+6.7** | +$1.14M |
| 3 | ◆ Inside the Leather | $2.45M | **+6.5** | +$1.91M |
| 4 | Stiff Shafts | $1.00M | +5.8 | +$721k |
| 5 | A Good Yardage Book | $600k | +5.2 | +$956k |
| 6 | Sponsor: Deiter's Heating & Cooling | $1.05M | +5.2 | +$1.25M |
| 7 | Golden Driver | $1.65M | +5.0 | +$1.08M |
| 8 | ◆ An Organized Bag | $550k | +4.5 | +$781k |
| 9 | Forged Wedges | $1.20M | +4.4 | +$1.27M |
| 10 | ◆ The Circle of Friendship | $1.30M | +4.3 | +$1.08M |
| 11 | A Three Wood You Trust | $900k | +3.9 | +$1.07M |
| 12 | A Baby Fade | $1.15M | +3.3 | +$846k |
| 13 | ◆ Lucky Ball Marker | $1.60M | +2.3 | +$938k |
| 14 | Soft Spikes | $200k | +1.1 | +$526k |
| 15 | ◆ Short Memory | $200k | +0.7 | +$459k |
| 16 | ◆ Clean Slate | $150k | +0.7 | +$459k |
| 17 | Sponsor: Lakeview Pontoon Rentals | $600k | +0.0 | +$2.04M |
| 18 | Sponsor: Shorty's Bait & Tackle | $450k | +0.0 | +$1.36M |
| 19 | Dead Ball | $1.10M | −1.0 | +$435k |

**Slot 1 vs slot 6, side by side.** At slot 1 the shelf's dearest focus item is 3rd
and the cheapest focus items are dead last. At slot 6 the top three are all focus —
and two of them are the crudest items on the shelf, *"two more focus to spend"*
($1.45M) and *"one more focus to spend"* ($350k), which at slot 1 measured 16th and
20th out of 24. **A focus item is worth more the more focus you already have.** That
is the opposite of the diminishing returns the note went looking for, and it is
because focus's three sinks compete: with a small well you cannot afford accuracy
*and* the birdie *and* the redraw, and every extra point relaxes all three at once.

Note also what the sponsors do in this table. Pontoon and Shorty's buy **zero** late
wins and the largest median in the column ($2.04M). Money and winning have come
apart by slot 6, which is what a saturated survival bar looks like from underneath.

---

## The two builds, end to end

A greedy optimiser, 250 paired seasons per candidate kit.

**A — every SKU eligible**

| slot | takes | focus so far | ckpt | survive | late win | median |
|---|---|---|---|---|---|---|
| — | *(empty bag)* | 0/0 | 0.33 | 0.0% | 5.2% | $5.78M |
| 1 | Super Ball | 0/1 | 0.92 | 3.6% | 16.0% | $10.23M |
| 2 | ◆ Marlene | 1/2 | 1.86 | 40.4% | 36.0% | $15.78M |
| 3 | Long Tees | 1/3 | 2.73 | 84.4% | 48.6% | $19.27M |
| 4 | ◆ Golden Putter | 2/4 | 2.96 | 97.6% | 63.1% | $23.05M |
| 5 | Sponsor: Tri-County Concrete | 2/5 | 3.00 | 100.0% | 63.1% | $26.97M |
| 6 | Sponsor: Lakeview Pontoon Rentals | 2/6 | 3.00 | 100.0% | 63.1% | $29.01M |

**B — the focus lane banned outright**

| slot | takes | ckpt | survive | late win | median |
|---|---|---|---|---|---|
| 1 | Super Ball | 0.92 | 3.6% | 16.0% | $10.23M |
| 2 | Long Tees | 1.68 | 29.6% | 25.1% | $14.33M |
| 3 | Sponsor: Tri-County Concrete | 2.56 | 74.4% | 25.1% | $17.89M |
| 4 | Forged Wedges | 2.88 | 92.8% | 33.2% | $20.96M |
| 5 | Golden Driver | 2.96 | 97.6% | 39.2% | $22.60M |
| 6 | Sponsor: Deiter's | 3.00 | 100.0% | 41.5% | $24.02M |

**A survival-greedy optimiser with the entire shelf available spends four of its six
slots outside the focus lane.** And a player forbidden the lane entirely still
clears every Money List check in 100% of seasons — one slot later than the open
build, and that is the whole penalty.

The lane's price is paid in wins, not in survival: **63.1% late win against 41.5%**,
a 21.6-point gap bought by exactly two focus items.

---

## The lane curve — what the Nth item in a lane is worth

Each lane stacked in its own slot-1 order, 250 paired seasons.

| lane | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| **◆ focus** | marlene | leather | goldenputter | marker | circle | grips |
| marginal ckpt | +0.520 | +0.860 | +0.724 | +0.232 | **+0.000** | +0.180 |
| survive | 3.6% | 29.6% | 67.6% | 81.2% | 81.2% | 92.0% |
| late win | 19.8% | 28.8% | 46.7% | 48.7% | 48.7% | 57.2% |
| **no focus** | superball | goldendriver | tees | deadball | headcover | concrete |
| marginal ckpt | +0.588 | +0.576 | +0.772 | +0.028 | +0.312 | +0.336 |
| survive | 3.6% | 20.8% | 58.4% | 58.4% | 74.8% | 96.4% |
| late win | 16.0% | 19.3% | 32.9% | 28.9% | 32.8% | 32.8% |

**Neither lane diminishes early.** Both are hump-shaped, peaking at the second or
third item and collapsing afterwards, and that shape is a property of a **threshold**
metric rather than of either lane: one item cannot reach the bar, so its measured
delta is suppressed by the floor, and marginal value grows as the kit closes on the
bar and then vanishes once it clears. P3 predicted a decay curve and got a hump.

Where the lanes genuinely differ is depth. The non-focus lane keeps paying survival
out to six items across independent axes. **The focus lane is three items deep.**
After Marlene, the Leather and the Golden Putter, its fourth is a single free putt a
round, its fifth is worth **exactly zero** and its sixth is a max-focus bump. Six
focus items are worth *less* survival than six of anything else — 92.0% against
96.4%.

### The instrument checking itself

> The Circle of Friendship on top of Inside the Leather:
> **0.000 checkpoints, +0.0% survival, +$0 median.**

`gimmeRange` takes the MAX, so a six-foot gimme cannot add a foot to a bag that
already holds an eight-foot one. The shop says so in the price and the sim enforces
it absolutely. A tool that reported anything but zero here would be lying, and this
one reports zero to the dollar. **The focus lane has a hard interlock in it, and it
is load-bearing.**

---

## The composition sweep — the note's question, asked directly

Hold the allowance at its live size and vary only **how many of the six slots go to
the focus lane**. Both lanes filled in their own slot-1 order, so composition is the
only thing moving. 400 paired seasons per row; late win rates are over ~1,900 late
weekends, so a standard error is about 1.1 points.

| focus / 6 | ckpt | survive | late win | median |
|---|---|---|---|---|
| 0 / 6 | 2.95 | 96.8% | 31.7% | $21.77M |
| 1 / 6 | 3.00 | 99.8% | 49.4% | $25.04M |
| 2 / 6 | 3.00 | **100.0%** | 55.9% | $23.71M |
| **3 / 6** | 3.00 | **100.0%** | **69.8%** | **$25.41M** |
| 4 / 6 | 3.00 | 99.8% | 61.8% | $24.10M |
| 5 / 6 | 2.96 | 98.0% | 58.8% | $22.90M |
| 6 / 6 | 2.83 | 91.5% | 53.6% | $20.39M |

**The curve has a strict interior peak.** Not at zero and not at six — at three.
Going past the peak costs you on every column at once, and a six-focus allowance
(53.6% late win, 91.5% survival) is worse than a **two**-focus allowance.

The fixed fill order is not flattering to the middle rows: it reaches for the
fourth-best focus SKU (Lucky Ball Marker) before the sixth (Fresh Grips), even
though the greedy build says Grips is stronger in company. So the peak was
re-measured with hand-written bags, 400 seasons each.

| kit | focus | ckpt | survive | late win | median |
|---|---|---|---|---|---|
| marlene · leather · goldenputter · **grips** · superball · tees | 4/6 | 3.00 | 99.8% | **72.9%** | $25.69M |
| marlene · leather · goldenputter · superball · tees · concrete | 3/6 | 3.00 | 100.0% | 66.1% | $28.45M |
| marlene · goldenputter · tees · superball · concrete · pontoon | 2/6 | 3.00 | 99.8% | 62.2% | **$29.00M** |
| marlene · leather · goldenputter · grips · glove · superball | 5/6 | 2.99 | 99.5% | 65.1% | $24.19M |
| marlene · leather · goldenputter · grips · glove · organized | 6/6 | 2.87 | 93.0% | 55.7% | $20.97M |

Choosing the focus items well moves the peak from three to four and no further.
**Five is worse than four, six is worse than two, and the richest bag in the game
holds two.** The optimum is interior under every fill rule tried.

---

## Verdict

### Dominant, and healthy.

The owner's read is correct, and the price table was right to agree with him.
**Focus is the strongest thing in the game** — it is the difference between winning
32% of your late weekends and winning 70% of them, which is more late-season win
rate than every other axis on the shelf combined. Nothing else in the shop moves a
season that far.

**But it is not the correct purchase every time, and the six-purchase allowance is
a real choice.** Five findings, each independently sufficient:

1. **The best first purchase is not a focus item.** Super Ball leads slot 1 on the
   survival ranking, and Golden Driver and Long Tees each sit above seven of the
   ten focus SKUs.
2. **A survival-greedy optimiser handed the whole shelf spends 4 of 6 slots outside
   the lane.** It is not close: slots 1, 3, 5 and 6 all go elsewhere.
3. **The lane is not required.** Ban focus outright and the best six still clears
   every Money List check in 100% of seasons. Focus buys wins, not your job.
4. **The composition curve has a strict interior peak** at three or four of six, and
   the fall past it is steep and symmetric — six focus items measure worse than two
   on late win, on survival and on money simultaneously.
5. **The lane has a real interlock, and it is measured, not asserted.** The Circle
   of Friendship on top of the Leather is worth exactly, to the dollar, nothing.

**The honest shape of the finding, stated plainly:** focus is not dominant *per
item*, it is dominant *per lane*, and the lane is **three items deep**. Marlene, the
Leather and the Golden Putter are close to a solved opening book — they will be
three of the six most seasons that offer them, and the owner's own season landing
three of four major drops on focus items is that, not luck. The other three slots
are a genuine contest between Super Ball, Long Tees, Golden Driver, Forged Wedges
and the paying sponsors, all of which measure competitively at every slot they were
offered. **Half a solved allowance and half an open one is a decision, not a
formality** — and given that all three of the opening book's items are **tour
issue**, the rarest tier at draw weight 1, most seasons never get to execute it
anyway.

### No dial is recommended, and no nerf is warranted.

The note asked whether a nerf was needed and the answer is no, so there is nothing
here to price. The thing that would have justified one — focus items holding the top
of the ranking at slot 1 **and** at slot 6 — is half true at best: they hold slot 6
and lose slot 1, and the composition sweep shows over-committing to them is already
punished by the sim without anybody adding a rule.

Two things are worth **recording rather than acting on**:

- **The focus lane's back half is thin content, not overpowered content.** Lucky
  Ball Marker, Short Memory, Clean Slate, An Organized Bag and New Glove occupy five
  of the bottom eight rows at slot 1. Circle of Friendship is a deliberate structural
  zero next to the Leather and correct as designed. If the lane is ever revisited it
  should be revisited as a **supply** question — the lane is three deep and sells
  ten — and never as a nerf to P1. This is the same shape of finding as SHOP-SUPPLY's
  thin tiers, not a balance problem.
- **The major drop routes focus to the player by construction.** The drop offers
  three premium SKUs and a rational player takes the dearest; focus owns the top of
  the price table (five of the eight dearest SKUs, including the top one); therefore
  drops deliver focus disproportionately. That is the price table doing exactly what
  it was built to do, propagating correctly into a different system. It explains the
  owner's three-of-four without anything being wrong.

### What this measurement does not cover

- **The kit is free and carried from event 1.** That is the convention every sticker
  in the shop was measured under, so this is apples to apples with the price table —
  but it means the survival levels here (96–100% for six items) are far above the
  live calibrated 35%, and **must not be quoted as a calibration result.** Deltas and
  orderings are the product; levels are not.
- **No shop, no offer stream, no drops, no budget pips.** This prices the *choice*,
  not the *supply* that constrains it. The interaction — that the opening book is
  three tour-issue items behind a weight-1 draw — is argued above from the tier data,
  not measured here. If it ever needs measuring, the instrument is `shopcheck`'s
  offer-stream shopper with a lane filter, not this file.
- **Mixed play only.** Safe and aggressive are unmeasured here; the lane's value is
  routed through techniques and bought birdies, both of which mixed play uses most.
- **Late win rate is thin per row** (~1,900 weekends, SE ≈ 1.1 points). Differences
  under about 3 points in these tables should be read as ties. The 31.7 → 69.8 span
  the verdict rests on is thirty-five standard errors wide; the slot-6 ordering
  inside its top seven is not.
