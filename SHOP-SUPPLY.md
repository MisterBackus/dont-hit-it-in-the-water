# SHOP SUPPLY — the residual, measured, and the shelf that has to stop being infinite

**26 Aug 2026 · proposal with predictions registered before measurement ·
the owner's brief, verbatim: "its pretty easy to win right now... maybe we
need to reduce the number of items you buy in a shop and maybe add more items
with rarities... once you get the items the game is just too easy."**

Instruments: a supply-knobbed derivative of shopcheck's shopper harness
(scratchpad-only, per the read-only brief — it imports the live sim untouched
and dies with this document, the `_itemcheck.tmp` custom). Validated before
anything else was believed: at the calibrated knobs it reproduces
CALIBRATION-2's authoritative 400-season digits **exactly** — kills 44/35/5,
survival mixed 35 / aggressive 34 / safe 5, mixed hoarder 10 — and the
marquee-ramp handoff's late win rate of **51%**. Seeds 700000+, stars on,
live triple, final prices, same population as every number the economy
stands on. All claims below inherit CALIBRATION-2's caveat: kill rates are
honest to ±2 and no finer.

---

## 0. The finding that reframes the brief

The owner is right that it's too easy, and the measurement says something
sharper: **the game we calibrated and the game we shipped are two different
games, and the difference is the supply rule.**

Every Money List bar, every survival number, every boost price since slice 4
was derived from shopcheck's shopper — and that shopper lives under a
**four-purchase season budget** (`if (bought >= 4) break`, tools/shopcheck.ts,
plus one buy per week). The live reducer has no such rule. `stock()` offers
two boosts and two cards, `buy()` checks only your wallet, and REROLL at $70k
reprints the shelf as many times as you can pay — so a player with money can
buy **everything**, and the best player did:

- **runs/andrew-3.json** (replayed tonight): 13 of 13 cuts, **10 wins**,
  −10.5 average at Palmetto — and **16 items bought** (14 boosts, 2 cards)
  plus 3 premium major drops. Conversion on offered boosts: **100%**. Every
  single piece of equipment the shop ever showed him, he bought. The two
  cheap cards he bought are the only cards that converted at all.
- The harness agrees with the human. Modeling the live rule (unlimited
  buying, full shelf) the mixed shopper assembles a **15.9-boost kit** by the
  finale, spends $13.3M, and the late-season win rate the marquee ramp
  bought down to 51% climbs back to **71%** — the human's own 77% of
  weekends, reproduced. Check 2's kill halves (35 → 19) and check 3's goes
  to **zero**. Survival runs 46% against the 36% intent, and the
  mixed-over-aggressive ordering compresses to a tie (46/46).

So "RAW EQUIPMENT OVER-SUPPLY" (CALIBRATION-2, standing verdict 1) is not a
metaphor. It is a missing rule: **the entire August calibration assumed a
scarcity that was never shipped.** Supply, not price, is the binding
constraint on the human power curve — the FIELD-CEILING band is capped at
0.8× by design, hot weeks stay yours, and the residual power above the
51% target is the kit, bought at 100% conversion from an infinite shelf.

One more piece of arithmetic that decides the shape of the fix, the way
FIELD-CEILING §2 decided that one: **the shelf's value is concentrated.**
The top 8 of 17 SKUs carry 71% of the shelf's measured value ($15.85M of
$22.35M in sticker terms, and prices are value over two). Whatever
mechanism we pick, if a rich player can still END UP holding the top
shelf by October, the parade continues. Kit **value** is the dial, not kit
count — three of the measured nulls below fall straight out of this.

---

## 1. Everything measured, one table

Mixed shopper, drops modeled, stars on, live triple, seeds 700000+.
Win rates at 250 seasons; kill/survival lines at 400 where marked ◆, else
250. "kit@14" = boosts held at the finale; A's 4.0 buys + ~3.3 drops is the
kit every calibrated number assumes.

| supply rule | late win (10–14) | finale | late rel8 | kit@14 | buys | kills 1/2/3 | survival m/a/s | hoarder |
|---|---|---|---|---|---|---|---|---|
| **A — the calibrated harness** (4-buy budget) | **51%** | 66% | −5.5 | 7.3 | 4.0 | ◆ 44/35/5 | ◆ 35/34/5 | 10% |
| **B — the LIVE game** (unlimited buys) | **71%** | 72% | −7.0 | 15.9 | 13.0 | ◆ 44/19/0 | ◆ 46/46/7 | 10% |
| C — owner's cap as stated: 1 per shop stop | 71% | 72% | −7.0 | 14.6 | 11.2 | ◆ 44/20/0 | ◆ 45/44/8 | 10% |
| equipment slots: own ≤ 6, swap upward | 65% | 66% | −6.6 | 6.0 | 8.6 | 40/21/2 | 47 (m) | 10% |
| season budget 6, full shelf | 59% | 67% | −6.1 | 9.4 | 6.0 | 40/21/1 | 47 (m) | 10% |
| season budget 8, full shelf | 69% | 73% | −6.8 | 11.3 | 7.9 | 40/20/0 | 48 (m) | 10% |
| season budget 4, played PATIENT (buys ≥$1.6M only) | 65% | 66% | −6.5 | 7.0 | 3.7 | 53/19/0 | 38 (m) | 10% |
| E — rarity tiers alone (2-offer stock, weights 6/3/1) | 66% | 71% | −6.5 | 14.5 | 11.7 | ◆ 50/25/1 | ◆ 38/36/1 | 10% |
| G — honest rentals (≥$1M rental-only, 3 events @ 0.4×) | 68% | 72% | −6.9 | 7.3 act. | 11.8 | ◆ 35/9/1 | ◆ 58/53/7 | 10% |
| H — budget 6 + rarity, no early gate | 51% | 65% | −5.6 | 9.0 | 5.9 | ◆ 51/29/2 | ◆ 35/35/1 | 10% |
| **H+ — budget 6 + rarity + early gate (RECOMMENDED)** | **53%** | 60% | −5.8 | 9.1 | 5.9 | ◆ 49/26/4 | ◆ 37/32/2 | 10% |
| H+ played PATIENT (the counter-play) | 46% | 62% | −5.1 | 4.3 | 1.4 | 64/61/11 | **12%** | 10% |

The mixed-beats-hoarder law (10% vs mid-30s-and-up) survives every row —
no option makes not-shopping correct. The mixed-over-aggressive point
survives everywhere supply is tight and **erodes to a tie wherever supply
is loose** (B, C: 46/46, 45/44) — over-supply doesn't just make the game
easy, it dissolves the economy's ordering at the top. The recommended
hybrid runs the other way: mixed beats aggressive by **five points**
(37/32), the widest that gap has measured since the stars landed — scarce
supply is worth most to the player who converts it into balanced golf.

---

## 2. Option 1 — the per-shop buy cap (the owner's first idea)

**Mechanism.** `buy()` refuses after N purchases in one shop phase; reroll
keeps its price.

**Fiction.** "One fitting a week" — fine, nobody would blink.

**Measured: a null result, and worth having.** One purchase per stop is
thirteen purchases a season, and money binds before the cap does (the
unlimited shopper only manages 13.0 buys anyway). Late win 71%, kit 14.6,
check 3 at 0% — digit-for-digit the uncapped game. **The shop's scarcity
has to be counted in a season, not in a stop: thirteen stops of one is
thirteen.**

The real version of this idea is a **season-wide equipment budget**, which
is exactly the rule the calibration has silently assumed since slice 4. The
budget curve, measured: 4 buys → 51% late (the calibrated world), 6 → 59%,
8 → 69%, ∞ → 71%. The dial works and it is steep between 4 and 8.

**But a pure budget is exploitable, and the exploit is measured.** The
harness shopper spends its budget naively (best affordable each week —
$2.9M total). A patient human banks the slots and buys only the top shelf:
same 4-buy budget, buys restricted to ≥$1.6M stickers, and the late win
rate reads **65%**, not 51 — the budget bought the same top-8-value kit,
later. A purchase budget alone converts "can I afford it" into "is it worth
a slot," and with a full shelf always in stock the answer is known in
advance: save everything for Inside the Leather and Marlene. Fourteen
points of the calibration are sitting on the bot's naivety.

**The gross-list interaction, said out loud** (the brief asked): since the
Money List went gross, spending has zero survival cost — the shop's only
constraint has been the wallet, and the wallet stops constraining anything
by mid-season. A budget is therefore the first real scarcity the shop
would ever have, and it changes what the shop IS: the decision stops being
"whether" (it never was, conversion is 100%) and becomes **"which."** That
is the Balatro-shaped decision the shop.ts header always claimed to want.

- (a) power curve: measured above, steep and real, but see the exploit;
- (b) ordering: holds at budget 4 (35/34, the calibrated row); the
  budget-6/8 rows were measured mixed-only — sweep A owes the full
  three-policy lines;
- (c) variety: none added — the full shelf makes the optimal "which six"
  a solved puzzle, the same six every run;
- (d) cost: one GameState counter, one guard in `buy()`, budget pips in the
  shop UI, SAVE_VERSION bump. Smallest footprint of any option.

**Verdict: half the fix.** Right dial, wrong alone — it needs the shelf to
stop being a catalogue, or patience re-opens the parade.

## 3. Option 2 — rarity tiers and a deeper pool (the owner's second idea)

**Mechanism.** The weekly stock's two boost slots draw from the unowned
pool with tier weights instead of uniformly; commons plentiful, rares
gated, premiums rarer still. Measured here at weights 6/3/1 with two
offers a week and no full-shelf fallback — the current pool tiered by its
own measured prices (price = value over two, so the price bands ARE the
value tiers):

| tier | draw weight | today's members (17 SKUs) |
|---|---|---|
| **OFF THE RACK** (<$1M) | 6 | Pontoon $600k · Yardage Book $600k · Organized Bag $550k · Soft Spikes $200k · Short Memory $200k |
| **SPECIAL ORDER** ($1M–$1.55M) | 3 | Fresh Grips $1.45M · Forged Wedges $1.2M · Dead Ball $1.1M · Deiter's $1.05M · Stiff Shafts $1.0M |
| **TOUR ISSUE** (≥$1.6M) | 1 | Inside the Leather $2.45M · Super Ball $2.4M · Marlene $2.4M · Golden Putter $2.1M · Long Tees $1.8M · Golden Driver $1.65M · Lucky Ball Marker $1.6M |

**Fiction.** The tier names are the fiction, and they're golf's own: off
the rack, special order, tour issue. "Tour issue" is exactly the kind of
jargon P6 wants — a label on a thing the badge and the price already
taught. A tour-issue week at the shop is an event: the truck came.

**Measured, alone: slows the assembly, doesn't cap the ceiling.** With ~26
weekly offer slots a season against a 17-SKU pool, even weighted draws let
the season end at kit 14.5 — late win 66%, check 3 at 1%. Rarity alone is
a speed bump on the road to the same shelf. And it has a cost at the wrong
end: scarce stock starves the SPRING (check-1 kill 50% vs 44 calibrated) —
the early game gets harder, which is the one place the difficulty was
never supposed to go (the spring rule, three instruments deep).

- (a) power curve: 71 → 66, insufficient alone;
- (b) ordering: survives (38/36; safe collapses to 1% — watch it);
- (c) variety: **the real prize.** Under the full shelf every season's buy
  sequence is the same greedy walk — andrew-3 owns literally the whole
  shelf, and every strong run converges on the same kit. Under a weighted
  2-offer stream the season kit is a draft: at 6/3/1 a season surfaces
  ~3.4 tour-issue sightings (13% of 26 slots), and which three decides the
  run's shape. This is "more items with rarities" doing the thing the
  owner wants it for;
- (d) cost: weighted draw in `stock()` (rng stream changes → save bump),
  tier badges, and the pool needs deepening — see §7 content.

**Verdict: the other half of the fix.** It cannot carry supply reduction
alone, but it is the only option that closes the budget's patience exploit
(you cannot save slots for what the truck doesn't bring) and the only one
that buys run-to-run variety.

## 4. Option 3 — honest rentals (the calibration's named dial): measured, and it points backwards

CALIBRATION-2's standing verdict named this dial: consumable SKUs that say
they expire, priced on their window, never sticker decay. The sponsor
contract that shipped in the weeks redesign is the prototype — B-1 capped
the sponsor's tax at three events, and the addendum's re-measure priced the
window honestly ($366k of tax from mid-season, $797k early, against $300k
cash).

**Mechanism as measured.** Every SKU ≥ $1M becomes rental-only: a 3-event
contract at 0.4× sticker (which IS window pricing inside the band — a
3-event slice of a season's value, priced at ~1.25× its measured worth).
Permanent copies gone; the major drops stay permanent — earned permanence
as the premium. The shopper may re-rent freely.

**Measured: rentals INCREASE supply.** Late win 68%, survival **58%**
(intent 36), kills 35/9/1 — check 1's kill fell nine points and check 2's
collapsed to 9%. The mechanism is easy to see once it's in numbers: a
window is a **loan**, and loans help the borrower. $840k Golden Putter
rentals are affordable in April when the $2.1M sticker is not, so the
spring gets STRONGER; and by autumn the wallet runs 3–4 concurrent
contracts continuously (active kit 7.3 — the same size as the calibrated
world's, all top-shelf, permanently refreshed). Affordability was never
the constraint — conversion was already 100%. Rentals fix cash flow, and
cash flow was not the disease.

Could rentals bind if priced punitively? Only by leaving the 1.4–2.5×
band — the sticker becomes a lie the player can measure, which is the
exact argument that killed boost decay in FIELD-CEILING §4. And the
sponsor prototype had already said this quietly: capping the contract made
the sponsor **better for the player**, not worse. That was the finding.

- (a) power curve: wrong direction; (b) ordering: survives but inflated
  everywhere (58/53/7); (c) variety: some (contract timing), not worth the
  price; (d) cost: the largest of any option — contract state per boost,
  countdown UI, expiry moments, a shop that sells windows, and a full
  repricing derivation.

**Verdict: rejected, with receipts — a measured rejection of my own
brief's named dial.** The standing verdict reserved "honest rentals" for
this residual before anyone priced one. Priced honestly, they're a subsidy;
priced to bind, they're decay wearing a receipt. The verdict's *diagnosis*
(raw equipment over-supply) was right; its named prescription doesn't
survive its own measurement, and this document is where that gets said
plainly rather than built expensively. (Rental SKUs may still someday earn
a place as *content* — a demo week, a loaner driver — but as flavor, not
as the supply dial.)

Also measured and rejected on the way, for the record: **equipment slots**
(own ≤ K, swap upward — the swap shopper assembles the top-K shelf and
K=6 still reads 65%; value concentration defeats any count-shaped cap),
and **per-shop caps** (§2's null).

## 5. The hybrid — a season budget the tiers make honest (RECOMMENDED)

Both of the owner's instincts, each covering the other's measured hole:

```
SHOP_BUDGET   6 purchases a season (boosts only; the counter is printed as pips)
TIER WEIGHTS  off the rack 6 · special order 3 · tour issue 1, two boost slots weekly
EARLY GATE    events 1–3 stock below the premium line, as today (shop.ts EARLY_SHOP_UNTIL)
REROLL        $70k, but a reroll redraws items WITHIN the week's drawn tiers —
              you can re-ask what the truck brought, not summon a different truck
```

The budget makes the count finite (the calibrated game, at last shipped);
the tiers make patience unplayable (you cannot bank slots against a shelf
that isn't there); the early gate keeps the spring rule; the reroll rule
closes the $70k hole that would otherwise void the tiers (at ~13% premium
odds per slot, fishing for tour issue at $70k a cast is a solved slot
machine — reroll must respect the week's draw or rarity is decoration).

**Measured at the center (budget 6, 6/3/1, gate on):**

- Late win **53%** (target band 45–60; the calibrated world reads 51),
  finale 60%, late rel −5.8. Hot weeks (≤−8) stay won at **100%** — the
  anti-rubber-band guarantee is untouched, a week you go low is still
  your week; 98% of late losses are to a star, the ramp's story intact.
- Kills **49/26/4 at 400 seasons** (47/24/4 at the 250 bracket), survival
  mixed **37** / aggressive 32 / safe 2 against the 36/45/3 intent — and
  check 3 reads 4%, back from the live game's zero to within noise of the
  printed 5%. The early gate recovered most of rarity's spring tax
  (53 → 49 against 44 calibrated; the remaining ~5 points are sweep A's
  first tuning target — more early commons, or a guaranteed affordable
  slot through event 5 — and never a reason to move a bar).
- **The exploit is closed by the draw, not by a rule:** the patient
  counter-play (hold slots, buy tour-issue only) collapses to **12%
  survival** — under scarce stock, waiting for the top shelf is how you
  die at check 2 with $2.77M spent and a 4-boost kit. Patience stops
  being the optimal line and becomes a gamble the Money List punishes,
  which is the difference between a rule and a game.
- Buys 5.9 of ~26 offered slots — **conversion by offer falls from 100%
  to ~23%** for the bot; a human choosier than a greedy bot lands lower.
  Declining a boost becomes a thing that happens every week, which is
  what "the shop is a decision" has meant all along.
- Variety: the season kit is 9-ish boosts drafted from a weighted stream
  with ~3 tour-issue sightings — which three is the run's identity.

**What it does to check-3's kill, without touching a bar.** Supply-side
change was the reserved lever, and this is what it buys: 0% (live) → ~4%
at the standing $12.2M — the printed number becomes true again. It does
NOT reach 14%, and no supply dial in this document does while the spring
rule and the win-pays-the-final-leg invariant both hold (the only 11%
sighting in the table belongs to a strategy with 12% survival). The 14%
intent is three worlds stale — it predates the drops, the rotation, and
the stars — and CALIBRATION-2 asked whoever designed this dial to
re-argue it, so: **the intent triple's product is already delivered.**
41/29/14 was chosen as a season-shaped death curve; its survival product
is 36%, and the shipped 44/35/5 delivers 35% — the same total pressure,
distributed where the invariant allows. The honest re-set is
**44 / 33 / 5-with-an-8-ceiling**: check 3 is a pace check whose real
teeth are the last leg's demand for a major win, its kill is structurally
small, and the difficulty owner for "too easy" is this supply dial —
never a fifth re-anchoring. DESIGN.md §3.2's intent table should say so.

---

## 6. Parameter derivation plan — sweeps, targets, one session

1. **Promote the instrument.** The scratchpad knobs move into shopcheck
   itself (BUDGET, tier weights, EGATE, and the MINBUY patient policy as a
   permanent counter-policy) — no number ships from a scratchpad, house
   law. The shopper model changes from full-shelf-greedy to offer-stream;
   that is a real instrument change and gets its own validation row
   (budget 4 + full shelf must still reproduce 44/35/5 before anything
   else is believed).
2. **Content first** (§7): the new SKUs change the pool arithmetic the
   weights are swept against, so they get measured and priced before the
   sweep, not after.
3. **Sweep A — budget × weights** (250 seasons/cell): BUDGET ∈ {4, 5, 6, 8},
   weights ∈ {6/3/1, 8/3/1, 6/2/1}, gate on. Targets, in priority order:
   late win **45–55** for the mixed shopper (the strong human lands above
   the bot; 51 is the calibrated reference); check-1 kill within **±4 of
   44** (the spring rule, now a shop constraint too); mixed survival
   33–38; mixed ≥ aggressive; safe ≥ 2%.
4. **Sweep B — the exploit stays closed**: the MINBUY policy at chosen
   dials must measure ≥ 10 survival points WORSE than the naive shopper.
   This is an acceptance test, not a hope — if patience ever beats
   shopping, the weights are too generous. (Measured at the center: 12 vs
   37 — a 25-point penalty for playing the shop like a catalogue.)
5. **THE ONE RE-DERIVATION** (400 seasons, the authoritative run): kills
   and survival at the **standing** $2.3M/$8.5M/$12.2M — the bars do not
   move (survival outside 33–39 sends us back to step 3's dials, never to
   the triple); the WINS section; the boost band check (the 1.4–2.5× law
   is measured on ownership windows and is supply-blind, but conversion
   below 100% is new territory for it — confirm no repricing is needed,
   budget ≤ 2 if the tails slip); cutcheck shape guard (supply touches no
   field, predict digit-identical make-cut); weekcheck EVENT_YIELDS
   re-measure (a smaller late kit means smaller late yields — the
   schedule screen's printed trade must follow). fieldcheck: untouched by
   construction, no run needed.
6. **Live acceptance, from the only population that matters**: the next
   runstats bundle shows boost conversion below 60% and at least one
   tour-issue offer declined; seasons stop ending with the whole shelf.

## 7. The content work

The pool is 5/5/7 across the tiers and the weighted stream leans hardest
on the thinnest tier: five commons exhaust by midsummer (the owned filter
empties the tier, and offers silt up with rares). The deeper pool needs
roughly **seven new SKUs — four off the rack, three special order** —
bringing the tiers to 9/8/7. Premiums need nothing: seven is plenty for a
tier whose whole job is being rare.

Who writes them: the items pass owns this (ITEMS-PROPOSAL's rewardcheck
custom — every SKU measured over 250 seasons, priced at value over two,
verified on independent seeds; one session shipped six boosts last time).
Axes the shelf hasn't spent, from that document's own ledger: wind/
conditions relief, a second paying sponsor (Pontoon's $150k-per-cut shape
at a different price point), momentum insurance variants, redraw economy,
putting-distance bands below Leather's. New Grooves stays culled ($3k
measured — a dead SKU does not become alive by being common). Cards are
untouched by all of this: they are not the power curve (andrew-3 converted
0% of every card priced over $1M), the bag cap already makes them
swap-limited, and the budget counts **boosts only**.

## 8. Save and UI footprint

- **SAVE_VERSION bump**, twice earned: `stock()`'s draw changes shape
  (weighted, tier-slotted — the rng stream's consumption differs) and a
  logged run with seven purchases is illegal under the budget. (Mid-way
  through this pass another session shipped split-purse ties and took v8,
  so this proposal's bump is **v9** — or rides the same bump if built in
  the same window.) The frozen ledger in runs/verified.json keeps the
  board's rows, as always; andrew-3 joins it as an artifact of the
  infinite-shelf era — the before picture.
- **GameState**: one counter (`buysLeft`), the week's drawn tier layout
  (or re-derive it from the bank, cheaper). Reducer: a guard in `buy()`,
  the weighted draw in `stock()`, reroll drawing within tiers.
- **UI**: budget pips on the shop header ("changes left ▮▮▮▮▯▯" — the
  fiction is golf's own: you don't re-learn a bag in October); tier
  badges on the two boost cards; nothing else moves. The danger-confirm
  precedent from the weeks redesign applies to nothing here — declining
  to buy is not a withdrawal.
- **Tests**: deck.test rows for budget legality and refusal; a stock
  determinism test (same seed, same truck); the spring-rule test
  (stars.test.ts) is untouched by construction.

## 9. Predictions registered

1. **The owner's next real season lands 5–8 wins of ~13 played**, not 10,
   with at least one late weekend lost holding a kit he'd have completed
   under the old shop. If he still wins 10+, the weights are too generous
   and sweep A's 8/3/1 column gets the seat.
2. **Boost conversion in the next runstats bundle reads 30–60%** (from
   100%), with at least two tour-issue offers passed unbought.
3. **The bars do not move.** Kills at the standing triple land 44±4 /
   30±5 / 4±2 with mixed survival 33–39% — the first difficulty
   correction in this project's history that holds every dollar threshold
   still.
4. **Ordering law intact**: mixed ≥ aggressive by 0–3 points, both ≥ 3×
   the hoarder's 10%; safe lands 2–6%.
5. **The patient counter-play stays ≥ 10 survival points under naive** at
   shipped dials — measured at 25 points at the center (12 vs 37).
6. **Run identity becomes visible in the ledger**: any ten finished
   seasons show at least six distinct kits (today: one kit, the shelf).
7. **Check 3 prints 4–6% and the re-set intent table (44/33/≤8) is
   adopted** — or, if the owner re-asserts 14%, this document predicts no
   supply dial reaches it inside the spring rule and the invariant, and
   the argument moves to the intent, not the mechanism.

*Postscript, for the ledger: the tree moved while this pass measured — a
concurrent session shipped split-purse ties (season.ts `tiePayout`,
SAVE_VERSION → 8) between this document's first run and its last. Every
number here was measured against `payout()` semantics, the same instrument
CALIBRATION-2 used; that session's own note says the tie-split drifts
shopcheck small-and-negative inside the ±2 honesty band, so nothing above
turns on it — but the build session's step-1 validation run should be taken
against the tied purse, and will absorb the drift before the sweeps start.*

*Files this proposal would touch when built: reducer.ts (stock/buy/reroll),
content/shop.ts (budget, tiers, weights), content/boosts.ts (+7 SKUs via
rewardcheck), platform/storage.ts (v9), shopcheck.ts (offer-stream shopper
+ knobs promoted), DESIGN.md §3.2 (intent re-set) and §6.3, deck.test.ts,
and the shop screen. Nothing in sim/resolve, nothing in the field, nothing
in the stars — the supply fix is economy-side by construction, which is
what keeps every FIELD-CEILING number standing.*

---

# SHIPPED — 26 Aug 2026, the build session

**Owner-approved hybrid, built as specified above; every number below is
from the promoted instrument (no scratchpad survives this pass), seeds
700000+, stars on, split purse in, 400 seasons where it counts.**

## What shipped, and at what dials

```
SHOP_BUDGET        6 boost purchases a season (cards exempt; a major's free
                   drop arrives on top) — reducer-enforced, buysLeft pips
                   on the shop header ("nobody re-learns a bag in October")
TIER WEIGHTS       off the rack 6 · special order 3 · tour issue 1
                   (swept against 8/3/1 and 6/2/1 — the weights are nearly
                   flat at every budget; 6/3/1 kept, 8/3/1 stays the named
                   fallback if the owner still wins 10+)
TIER BANDS         <$1M / $1M–$1.55M / ≥$1.6M — the measured price bands,
                   shop.ts tierOf(); labels + colours on the offer cards
EARLY GATE         kept (events 1–3 stock the rack only)
SPRING SLOT (new)  through event 5 the FIRST slot always carries the rack
                   (shop.ts SPRING_RACK_UNTIL — see the spring story below)
REROLL             $70k, redraws items WITHIN the week's drawn tiers
                   (state.shopTiers; the truck does not change)
RNG                all shop draws on a new bank stream, salt 8 (rng.ts)
SAVE_VERSION       8 → 9 (budget legality + new draw stream); runs/ frozen
MONEY_CHECKS       $2.3M/$8.5M/$12.2M → **$2.1M / $8.1M / $11.1M**
CONTENT            +7 SKUs (below), pool 9/8/7 across the tiers; 2 band
                   repricings; Flushing It culled (priced itself tour-issue)
INVARIANT          win-pays-the-final-leg now priced on the EXPECTED win
                   cheque: tiePayout(purse,1,2) ≈ $2.71M (modal winning
                   group is 2–3), capping the leg at ~$3.0M (deck.test.ts)
```

**Step-1 validation, before anything was believed:** the legacy full-shelf
budget-4 shopper on the 17-SKU shelf (EXCLUDE knob) at 400 seasons read
kills **48/44/2**, survival mixed **28%** — CALIBRATION-2's 44/35/5 @ 35%
plus the split purse, digit-for-digit the drift the tie session's own note
predicted small and this pass measured honestly: the tie split taxes even
the spring (+4 on check 1; winning groups tie constantly in this score
space). The instrument lineage holds; the "small-and-negative" caveat in
this document's postscript understated it, and 28% at the old bars is the
number the re-derivation was pointed at.

## The seven new SKUs (rewardcheck N=250, seeds 600000+, verified 900000+)

| SKU | tier | mechanic | measured | price |
|---|---|---|---|---|
| Clean Slate | rack | momentumSlack 2 | $434k/$778k, band $332k | **$150k** |
| New Glove | rack | maxFocusBonus 1 | $977k/$1.68M, band $743k | **$350k** |
| Sponsor: Shorty's Bait & Tackle | rack | cutBonus $100k | $921k/$927k | **$450k** |
| A Three Wood You Trust | rack | tee spread ×0.75 | $1.48M/$2.09M | **$900k** |
| A Baby Fade | special | long spread ×0.80 | $2.19M/$2.38M | **$1.15M** |
| The Circle of Friendship | special | gimmeFeet 6 (no stack past Leather) | $2.59M/$2.51M | **$1.30M** |
| Sponsor: Tri-County Concrete | special | cutBonus $300k | $2.76M/$2.78M | **$1.40M** |

An eighth candidate, **Flushing It** (carryAdd 10, any swing), measured
$3.89M — value over two prices it at $1.95M, the tour-issue shelf, and
premiums need no deepening (§7): culled for landing in the one tier whose
whole job is being rare. **The band check** (shopcheck top section, stars +
ties — the instrument of record) found the split purse had compressed the
whole shelf ~8% (bare season $5.96M → $5.48M): five SKUs under the 1.4
floor, the two deepest from this batch (rewardcheck is tie-blind and the
cheap end has no cushion). New Glove and Clean Slate repriced to
band-instrument value over two — exactly the ≤2 budget — and Fresh Grips /
Three Wood / Circle sit at 1.36–1.37, inside the instrument's noise of the
floor: a standing verdict, not a third reprice.

## Sweep A — budget × weights (250 seasons/cell, standing bars, mixed)

```
            late win (10–14)      kills at 2.3/8.5/12.2      survival
budget 4      43  43  43            54/41/4                    26
budget 5      46  44  44            54/34/5                    29
budget 6      48  47  47            54/34/5                    29–30
budget 8      50  50  50            54/33/1                    31
              (weights 6/3/1 · 8/3/1 · 6/2/1 — flat to ±1 everywhere)
```

Budget is the dial, weights are texture — exactly the shape §2's curve
promised. **Budget 6 at 6/3/1** takes the seat: late win 48 in the 45–55
band, kit@14 9.2, buys 6.0, conversion by offer 23%.

**The spring story, told straight:** check-1 kill read 54 at $2.3M in
every cell — +6 over the tie-world's calibrated 48. Attribution measured:
the early gate is ~1 point (EGATE=0 reads 53), the deepened commons bought
~nothing, the offer stream itself is the tax (two dealt items against the
legacy model's pick-of-seventeen catalogue). The doc's named lever — a
guaranteed affordable slot through event 5 — shipped as the SPRING SLOT
and bought 2 points (54 → 52); the rest was absorbed where it belongs, in
the one re-derivation ($2.3M → $2.1M), alongside the split purse's own +4.
And then the band check's two rack repricings handed the spring the rest
back: cheaper commons are spring power, and the final world prints **44**.

## Sweep B — the exploit stays closed (400 seasons, shipped dials)

Patient counter-play (MINBUY $1.6M, tour-issue only): survival **11%**
against the naive shopper's **38%** — a 27-point penalty (the doc demanded
≥10, measured 25 at its center). Waiting for the top shelf is still how
you die at check 2.

## THE ONE RE-DERIVATION (400 seasons/policy, final shelf, shipped dials)

```
MONEY_CHECKS  $2.1M / $8.1M / $11.1M   (leg $3.0M, under the re-priced cap)
kills         44 / 31 / 1     of arrivals   (intent 44 / 33 / ≤8)
survival      mixed 38 · aggressive 30 · safe 1 · mixed hoarder 7
WINS          late win 48% · finale 58% · hot weeks (≤−8) 100% · 97% of
              late losses to a star · buys 6.0 · kit@14 9.2 · conv. 23%
```

- The 33–38 band is restored (38, from the tie world's 28); the
  anti-rubber-band guarantee and the ramp's story are untouched.
- Check 1 prints the intent digit itself. Check 2 sits two points under.
  Check 3 prints 1% under its 8 ceiling: with the leg priced on the
  expected (2-way) win cheque, the third check is a pace check whose teeth
  are the major win the leg demands — §5's argument, now arithmetic.
- Sensitivity, recorded twice now: the two rack repricings moved check-1's
  kill 48 → 44 and survival 34 → 38 on identical seeds. These bars are
  honest to ±2 ONLY at the exact live shelf (CALIBRATION-2 verdict 4).
- SHARE/LADDER: the 400-season median moved $15.80M → **$15.05M** — beyond
  the $100k grid, so both re-anchored at old ratios (season.ts). SHARE's
  middle eases (the budget slows the midsummer kit); both ends hold.
- weekcheck EVENT_YIELDS re-measured (N=1000, offer-stream shopper): late
  yields ROSE ~9% (event 11 $2.25M → $2.42M) — the honest budget-6 shopper
  carries a 9-boost kit where the old harness modeled 4 buys — while the
  early-mid eased (event 5 $710k → $610k). weeks.ts updated; the schedule
  screen tells the truth again.
- cutcheck: models kit as a synthetic sharpness ramp (KIT knob), touches no
  shop — digit-identical by construction, no run spent.

## The seven registered predictions, scored

1. **Owner's next season lands 5–8 wins** — OPEN (live population only).
   The bot analogue reads 48% of late weekends at budget 6; 8/3/1 remains
   the named fallback if he still wins 10+.
2. **Conversion 30–60% in the next runstats bundle** — OPEN; the naive bot
   reads 23% by offer, and a human choosier than a greedy bot lands lower
   than the bot's ceiling, so the band looks right from here.
3. **"The bars do not move"** — MISS on the letter, and the mover was
   named before it was excused: the SPLIT PURSE moved the world first
   (28% survival at the standing bars before any supply change), and this
   pass was explicitly chartered to absorb both changes in one
   derivation. On the RE-DERIVED bars the clause's numbers land: 44 (in
   44±4), 31 (in 30±5), survival 38 (in 33–39); check 3's 1% misses 4±2
   low, see prediction 7.
4. **Ordering law** — direction HIT, magnitude MISS: mixed ≥ aggressive
   holds but by 8 points (predicted 0–3; scarcity is worth even more to
   balanced golf than measured pre-tie), both ≥ 3× the hoarder's 7%; safe
   lands **1%** against the predicted 2–6 — the tiers starve a policy
   that never banks mid-shelf money. Flagged with the aggressive-intent
   residual for the dialogue.
5. **Patience ≥10 points under naive** — HIT: 27 points (11 vs 38).
6. **Run identity: ten seasons show ≥6 distinct kits** — HIT, measured
   now (shopcheck KITS=1): **10 of 10 distinct** finale kits.
7. **Check 3 prints 4–6% and the re-set intent is adopted** — HALF: the
   intent table 44/33/≤8 is adopted (DESIGN.md §3.2) and the ceiling
   holds, but the printed value is **1%**, not 4–6 — the prediction was
   priced against the solo-win invariant's $3.7M leg, and the tie split's
   expected-win re-price (this session's charter) capped the leg at
   $3.0M. The teeth moved INTO the leg: 10th at the finale pays $605k
   against a $3.0M leg, so the last leg demands a major win more starkly
   than before, and the kill stays structurally small. Anyone who wants
   check 3 to kill again must re-argue the INVARIANT, not the bar.

## Standing verdicts for the next session

1. **The difficulty owner for "too easy" is now the supply dial** —
   shop.ts SHOP_BUDGET and TIER_WEIGHTS — never a sixth re-anchoring,
   never a price chase. The live acceptance (§6-6) stays open: the next
   runstats bundle should show conversion under 60% and a tour-issue
   offer declined.
2. **Three SKUs sit a whisker under the band** (Fresh Grips 1.37, A Three
   Wood You Trust 1.36, The Circle of Friendship 1.36, stars+ties
   instrument): inside noise of the 1.4 floor, left standing under the
   ≤2 budget. The next calibration owns them if they stay out.
3. **Safe survival reads 1%** against the old 3% intent — the weighted
   stream starves the policy that never banks enough for the mid shelf.
   An intent question for the owner, not a bar question.
4. **The tie-split drift was NOT small**: −7 survival points at the old
   bars, +4 on check-1's kill. Any document quoting pre-tie digits is
   quoting a different game; this pass's numbers are the tie-world
   baseline from here on.
5. **Instrument hygiene**: the offer-stream shopper is the calibration
   shopper now (shopcheck AND weekcheck carry it; FULLSHELF=1 preserves
   the legacy model for archaeology, EXCLUDE= subsets the shelf, KITS=1
   prints run identity, MINBUY= is the permanent counter-policy). No
   number above came from a scratchpad.
