# ITEMS — the pool as it stands, and what to do about it
### Consulting pass on reward/shop content · 25 Aug 2026

**Instruments used, all run today against the live sim:**

- `npx tsx src/tools/deckcheck.ts` — 500 rounds per policy, round-level scoring.
- `npx tsx src/tools/shopcheck.ts` — 250 seasons per boost, mixed play; boost values, card-cut values, Money List survival.
- A temporary season harness (same `playHole`/`seasonEarnings` as shopcheck, 200 seasons per row, mixed play, seeds `600000+i`) measuring **every reward-pool card added to the starting deck**, six **swaps** (card in, card out, deck stays 20), and one proposed boost. Recipe in the appendix; the numbers below marked *measured* come from these runs. Paired seeds make the comparisons tight, but treat anything inside about **±$200k as noise**.

Baseline: a bare mixed season earns **$6.2M**. Every boost currently prices between 1.73× and 2.14× — the shop is calibrated. The card pool is not, and that is most of what follows.

---

## 1. Fixing dilution structurally

*This section first, per the owner: "adding cards is usually worse than adding nothing — we need to fix this."*

### 1.1 What the instruments actually say today

Two measurements, and they disagree in an instructive way.

**deckcheck (round level):** every deckbuilding policy lands in noise. Greedy −0.11, thin −0.16, greedy+thin −0.16 strokes against "take nothing," all inside the ±0.3 bar the tool itself prints. By the file's own closing line, the deckbuilding decisions are **decoration**, and the season layer has nothing to stand on.

**The season harness (money level):** adding one card to the starting deck and carrying it all year is *not* uniformly bad — it is **violently bimodal**:

| add to starting deck | season value |
|---|---|
| Full Send | **+$2.25M** |
| One More Club | **+$2.12M** |
| Cut It | **+$1.78M** |
| Stinger (dupe) | **+$1.66M** |
| Rescue | **+$1.14M** |
| Nothing to Lose | +$793k |
| Mid Iron (dupe) | +$384k |
| Take the Extra Club (dupe) | +$31k *(noise)* |
| Feathered Wedge | −$80k *(noise)* |
| Knockdown | −$92k *(noise)* |
| Short Iron (dupe) | **−$630k** |
| Scrape It Out | **−$679k** |
| Smooth It (dupe) | **−$966k** |
| Texas Wedge | **−$1.04M** |
| Pre-Shot Routine | **−$1.59M** |
| Fully Committed | **−$2.64M** |

The refined law, replacing "adding is worse than nothing": **the deck has one scarce axis, and it is reach.** Distance shots clear the dilution bar because they raise the average hand's reach, cut dead hands, and buy the birdies a place-based cut demands. Everything else — tighteners, short-game specialists, technique dupes — is a mine, because the starting deck is already saturated there and every copy crowds a shot out of a six-card hand. The cut table agrees from the other side: the best cuts are *Smooth It* (+$1.80M), *Just Get It On The Green* (+$1.67M), *Let It Chase* (+$1.42M) — techniques — while cutting *Stinger* costs **$2.55M**.

So the trap is real, and it is worst exactly where it looks safest: *Knockdown* and *Feathered Wedge*, the two most prize-shaped cards in the pool, measure at or below zero as adds. The pool currently sells −$2.6M items and +$2.3M items **at the same $120k sticker**. A random card from the pool averages +$152k against that sticker — a lottery, not a shop.

### 1.2 Option: swap-not-add — the bag is full

**The fiction is already golf's.** Fourteen clubs is the rule of the sport; the bag is full; something has to come out. The design doc mourned losing "fourteen clubs is your deck cap" in §7.0b — this restores the constraint one level up, where it works.

**The rule.** Taking a card — shop purchase or reward — forces one out. The deck never grows. Cutting a card (the $950k shop item, the fitting week) is the only thing that changes deck size, and it only shrinks it. Cap = current size, always; a cut permanently lowers the cap, which keeps thinning the strictly stronger, strictly pricier play it already is.

**Sim/reducer terms.** Minimal. `buy` (card branch) and any future card-reward route into the existing `remove` machinery: push the card, set a `mustRemove` flag, enter `phase: 'remove'` with the new card excluded from the removal list (or allow removing it — that is "changed my mind," symmetric with the paid-cut refund path). `REMOVE_CARD` already searches deck/hand/discard and already has the phase. No new screen: the removal screen *is* the swap screen with one extra card on it. `deckcheck`/`shopcheck` policies swap via the same `splice`/`push` my harness used.

**What it does to the cut economy.** Nothing but good. Swap and cut become orthogonal: a swap improves *quality* at constant size, a cut improves *frequency* of everything. The $950k cut keeps its measured $1.80M value. And the flat $120k card price becomes defensible for the first time, because a swap's downside is bounded — you can never be forced below the card you gave up.

**Measured evidence that this is the fix** (same harness, deck stays 20):

| swap | season value | same card as a bare add |
|---|---|---|
| Cut It in, Bump and Run out | **+$2.57M** | +$1.78M |
| Knockdown in, Bump and Run out | **+$1.16M** | −$92k |
| Knockdown in, Splash Out out | +$989k | −$92k |
| Feathered Wedge in, Splash Out out | +$884k | −$80k |
| High Draw in, Bomb It out | +$777k | +$1.67M |
| Knockdown in, Grip It and Rip It out | +$177k | −$92k |

The sign flips on exactly the cards that were traps. Knockdown-for-Bump-and-Run is a $1.16M decision where Knockdown-alone was a mine. Swap value ≈ add value + cut value of the victim, to within noise (Knockdown: −0.09 + 1.10 = 1.01 vs 1.16 measured), which means the two existing measurement columns already predict any swap. Note also the last row: swaps can still be *bad* (High Draw for Bomb It throws away $900k of Bomb It) — the decision has teeth in both directions, which is what a decision is.

**The measurement that proves the fix.** Extend deckcheck with a `swap` policy: at each offer, evaluate every (offered card, current card) pair by `cardValue` delta and take the best pair only if positive. The correct question stops being "is card X better than nothing" and becomes **"is card X better than the card it replaces."** Add a swap-matrix mode — each reward card × the five worst starting cards, season delta per pair (my six rows above are the prototype). Success bar: the swap policy beats "nothing" by more than the ±0.3 noise bar where greedy-add could not, and no card in the pool has a negative *best*-swap value (no mines left).

### 1.3 Option: hand/draw scaling with deck size — rejected

The shape would be `handSize = 6 + floor((deckSize − 20) / 4)` or similar, threaded through `dealHole` and all seven tools. Treat it with the skepticism it earns: **HAND_SIZE = 6 is a documented cliff, not a dial.** cards.ts records both walls — at five the hand cannot cover the distance ladder and scoring collapsed from +1.9 to +6.5; at eight the hand "was never a constraint — the same permanent menu of clubs with better names." Scaling the hand walks the game into one wall or the other, and worse, it *rewards volume for its own sake* — take cards to grow your hand — which is a direct P2 violation. It also doesn't remove dilution; it hides it: a 24-card deck at hand 7 has the same per-card scarcity and a mushier gap puzzle. The measurement (a deckSize × handSize sweep on score and Punch Out frequency) is cheap to run, but the two endpoints are already measured and both are failures. Reject.

### 1.4 Option: collection + loadout — not yet

Own every card you earn; pack a fixed 20 before each event. Dilution disappears because carrying is optional.

Costs, in order: **(1) UI weight** — a bag-editor screen inside a game budgeted at 30–40 seconds a hole and 75–90 minutes a run, and §14 already flags "player choice becomes an optimization chore" as a live fear. **(2) It kills the cut economy** — removal becomes "don't pack it," deleting a shop item measured at $1.80M and the fitting week with it. **(3) It kills commitment** — every reward becomes "yes," because taking a card costs nothing; the roguelike muscle (picks are permanent, picks matter) goes slack. Reducer terms: `GameState.collection`, loadout-edit actions and phase at the week node, deck built at `TEE_OFF` — all straightforward, which is the trap; the code is easy and the game gets worse.

The one future in which this earns its weight: **course-archetype counterplay** (§9 — links punishes high flight, parkland punishes bombers). Repacking the bag *per course* is a real decision only when courses genuinely demand different bags, and right now every event is played at Pine Hollow. Measurement, when the schedule lands: an oracle loadout policy (best 20 from collection per course) vs a fixed bag in deckcheck — if the oracle's gain doesn't beat the swap policy's gain, the UI bought nothing. Shelve until Salt Flats and the schedule work are in.

### 1.5 Recommendation

**Swap-not-add, now.** It is the sport's own rule (P1), it reuses the existing remove screen and `REMOVE_CARD` machinery, it preserves — strengthens — the cut economy, and it is the only option with a measured sign-flip already in hand: the same cards that are mines as adds are $0.9–1.2M decisions as swaps. Alongside it, **price cards the way boosts are priced** (§4.3), because the flat sticker is the other half of the trap. Re-run the extended deckcheck after; the acceptance bar is written in §1.2.

---

## 2. The existing reward pool — verdicts

Season value = *measured*, card added to the starting deck for a full mixed season. "As a swap" cites the measured swap rows or the add+cut arithmetic that predicts them. Under the current add-only economy, **take** means the card beats dilution; under swap-not-add most verdicts soften, and the swap column says into what.

| card | numbers | season value (add) | verdict, add economy | notes |
|---|---|---|---|---|
| **Full Send** | 300/±46, tee, roll 15 | **+$2.25M** | take | The measured best add in the pool. It is pure reach on a harness that prices reach. Flag for playtest: a human may fear ±46 more than the mean does — this is the one number here I'd want a person to confirm. |
| **One More Club** | 0◆, +30, +10 roll, ×1.45 | **+$2.12M** | take | Zero-focus distance. The 0-cost techniques are the only techniques that clear the bar, because they don't compete with buying putts. |
| **Cut It** | 190/±9, roll 4 | **+$1.78M** | take | Fills the 165→200 gap with the best carry/spread ratio in the long bag. Best measured swap in the game: in for Bump and Run, **+$2.57M**. |
| **Stinger (dupe)** | 225/±13, roll 30 | **+$1.66M** | take | Cutting the original costs $2.55M — the deck's most load-bearing card, and a second copy still pays. |
| **Rescue** | 175/±15, roll 8 | **+$1.14M** | take, but see §3.10 | The value is generic reach. The blurb — "works from the junk" — is a lie: it has no lie relief and eats deep-rough ×2.6 spread like everything else. Fix in §3.10. |
| **Nothing to Lose** | 0◆, +25, ×1.7 | +$793k | take | More zero-focus distance. Redundant in spirit with Extra Club; fine. |
| **Mid Iron (dupe)** | 165/±12 | +$384k | marginal | The workhorse dupe thesis holds here and only here. |
| **Take the Extra Club (dupe)** | 0◆, +15, ×1.35 | +$31k | noise | Harmless, pointless. |
| **Feathered Wedge** | 95/±3 | −$80k | **trap** (noise-negative) | The short game is saturated; a fourth wedge crowds a shot out of the hand. As a swap for Splash Out: **+$884k** — a real prize under §1.5. |
| **Knockdown** | 145/±5, roll 6 | −$92k | **trap** (noise-negative) | The most prize-shaped card in the pool, and it measures at zero. As a swap for Bump and Run: **+$1.16M**. The single best argument for swap-not-add. |
| **Short Iron (dupe)** | 130/±8 | **−$630k** | **trap** | The "duplicates of good basics are legitimate rewards" comment in cards.ts is half wrong: mid/stinger dupes pay, short-game dupes are mines. |
| **Scrape It Out** | 110/±12, cuts down | **−$679k** | **trap** | Also mechanically dishonest: "works from anywhere," but carry 110 > 90 trips the bunker block in `whyNotPlayable` — it does *not* work from sand. Fix the blurb or drop the carry to 90. |
| **Smooth It (dupe)** | 1◆, −15, ×0.5 | **−$966k** | **trap** | The original is the best cut in the game (+$1.80M). Offering a second copy as a *reward* is upside down. Remove from pool. |
| **Texas Wedge** | 30/±2, fairway only, roll 22 | **−$1.04M** | **trap** | `from: ['fairway','green']` — the 'green' entry is dead code, putting pre-empts it. A 30-yard fairway-only specialist can't survive six-card-hand economics at any tightness. |
| **Pre-Shot Routine** | 1◆, −8, ×0.6 | **−$1.59M** | **trap** | A worse Smooth It (−8 vs −15 for the same focus and near the same tighten), in a deck that already wants Smooth It gone. Redundant twice over. Remove. |
| **Fully Committed** | 2◆, ×0.33 | **−$2.64M** | **trap — the worst item in the game** | Two focus is a 10-foot birdie. Every time this card is played, a putt goes unbought; every time it's drawn, a shot wasn't. The strongest-looking technique in the pool is a −$2.6M mine. |

**The shape of it:** eight of sixteen pool entries are measured-negative, and the negative half skews to exactly the cards a player will reach for. Until §1.5 or §4.3 lands, the pool is selling mines at $120k.

---

## 3. New items

Eleven designs: six boosts, five cards (one of which is a fix to an existing card). Boosts remain the axis that works — always on, never drawn — so they carry the genuinely new mechanics; cards stay inside the existing op vocabulary except where one new rule is justified and shared. Every item states its measurement and predicted band. Two are already measured.

### Boosts

#### 3.1 Stiff Shafts — *measured*
> **∥ Stiff Shafts** — *"Fifteen more yards from anything long. Nobody asks how."*

```ts
{ id: 'stiffshafts', name: 'Stiff Shafts', icon: '∥',
  blurb: 'Fifteen more yards from anything long. Nobody asks how.',
  carryAdd: 15, appliesTo: 'long', price: 1_000_000 },
```

**Hole filled:** no boost adds carry anywhere but the tee (Long Tees) or by scale everywhere (Super Ball). §2 proved reach is the scarce axis; this is reach for the long irons, off any lie. Existing fields, zero logic. **Measured: +$2.01M a season** → priced at value-over-two, **$1.0M**, landing mid-band at 2.01×. Re-derive: add the row to `BOOSTS`, run shopcheck.

#### 3.2 Inside the Leather
> **◌ Inside the Leather** — *"Anything inside eight feet is good. Pick it up."*

```ts
{ id: 'leather', name: 'Inside the Leather', icon: '◌',
  blurb: 'Anything inside eight feet is good. Pick it up.',
  gimmeFeet: 8, price: 1_500_000 },   // NEW field: extends the 4ft tap-in band
```

**Hole filled:** nothing touches putting *distance* — Golden Putter discounts the price of a sink, the Marker gives one free, but the deterministic bands themselves (4/45 ft, the 2◆/3◆/4◆ ladder) are untouched by every boost. This is the gimme, which is golf (P4), and it is legible in one sentence. **New mechanic, justified:** one optional field, threaded as a parameter into `baseputts`/`sinkCost` (two call sites in putt.ts plus `sinkPrice`). It converts every ≤8ft birdie from 2◆ to free, which brackets between the Marker (one free sink/round, $2.58M value) and Golden Putter (1◆ off every sink, $4.05M). **Predicted $2.6–3.6M; price ~$1.5M.** Measurement: implement the field, add to BOOSTS, shopcheck row.

#### 3.3 Short Memory
> **≈ Short Memory** — *"A bogey is not a story. Momentum survives one."*

```ts
{ id: 'shortmemory', name: 'Short Memory', icon: '≈',
  blurb: 'A bogey is not a story. Momentum survives one.',
  momentumSlack: 1, price: 1_100_000 },   // NEW field: regen condition rel<=0 becomes rel<=1
```

**Hole filled:** the brief's own example — nothing interacts with momentum regen, the newest system in the game. One-line change in `focusRegen`: `rel <= boosts.reduce(slack)`. It is Marlene's +1, paid only on bogey holes, and it reads as the course designers' "focus shadow" being bought off — which makes it a *counterplay* purchase against shadow-heavy courses, the first boost with a course-shaped reason to buy it. Bogey holes run roughly a third of a mixed round, so **predicted at ~35–50% of Marlene's $4.92M: $1.7–2.5M; price ~$1.1M.** Measurement: field + one line, shopcheck row; also worth a coursecheck pass to confirm it doesn't flatten the focus-shadow holes The Canteen work just earned.

#### 3.4 Sponsor: Lakeview Pontoon Rentals
> **▥ Sponsor: Lakeview Pontoon Rentals** — *"A patch on your sleeve. $150k every cut you make."*

```ts
{ id: 'pontoon', name: 'Sponsor: Lakeview Pontoon Rentals', icon: '▥',
  blurb: 'A patch on your sleeve. $150k every cut you make.',
  cutBonus: 150_000, price: 600_000 },   // NEW field: added to the cheque on a made cut
```

**Hole filled:** no boost touches money itself, and DESIGN §8.3 has wanted per-cut sponsor money since the entourage table was written (Deiter's is currently a decal that tightens cones — this is the sponsor that *pays*). A pontoon-rental sponsor in a game called Don't Hit It In The Water is the tone test passing itself. **Predicted analytically:** the live make-cut curve (87 71 70 69 52 56 59 54 56 46 38 43 39 31) sums to ~7.7 made cuts a season → **~$1.16M face value; price $600k** for ~1.9×. Measurement: one line in the payout branch, shopcheck row — and note the interaction to watch: money-for-money compounds with the gross Money List, so confirm the check kill rates (42/21/5) hold.

#### 3.5 New Grooves
> **◣ New Grooves** — *"The sand stops being a problem."*

```ts
{ id: 'grooves', name: 'New Grooves', icon: '◣',
  blurb: 'The sand stops being a problem.',
  sandRelief: true, price: 150_000 },   // NEW field: bunker plays as fairway, mirror of roughRelief
```

**Hole filled:** `roughRelief` exists; sand has no equivalent, and bunkers carry the harsher spread penalty (×1.6) plus the >90-carry block. Mirrors Soft Spikes exactly — the blurb deliberately echoes it — and implements as one more clause on the same `pen` line in `buildCone` (decide explicitly whether relief also lifts the carry>90 sand block; recommend yes, that *is* the fantasy). Bunkers are rarer than rough, so **predicted $200–450k — below Spikes' $643k; price ~$150k.** If it measures under ~$120k, it's decoration: cut it rather than ship a boost that can't matter. Measurement: field + clause, shopcheck row.

#### 3.6 An Organized Bag
> **▦ An Organized Bag** — *"Everything where you left it. The first fresh hand each round is free."*

```ts
{ id: 'organized', name: 'An Organized Bag', icon: '▦',
  blurb: 'Everything where you left it. The first fresh hand each round is free.',
  freeRedraws: 1, price: 150_000 },   // NEW field: per-round, mirror of freeSinks
```

**Hole filled:** nothing touches the redraw economy — REDRAW_COST is priced at a birdie and dead hands are a designed event. Pattern-copies `freeSinks` (a counter reset per round, decremented in `redraw`). Honest prediction: the harness redraws rarely, so this will measure small — **$200–500k, price ~$150k** — but its real value is felt, not simulated: the moment it fires is precisely the worst moment of a round. If it measures under $120k, either make it *every* redraw costs 1 less (`redrawDiscount`) or drop it. Measurement: field + counter, shopcheck row.

### Cards

*All card predictions below are stated for both economies. Under add-only, most new cards cannot be honest rewards — that is §1's point, not a design failure to route around quietly.*

#### 3.7 High Draw — *measured*
> **High Draw** — *"Turns over, carries everything, sits down."*

```ts
{ id: 'highdraw', kind: 'shot', name: 'High Draw', carry: 235, spread: 16,
  blurb: 'Turns over, carries everything, sits down.',
  rules: { from: ['tee', 'fairway'], roll: 10 } },
```

**Hole filled:** the finishing ladder's widest gap is 255→208, and the only card in it is Stinger — which cannot carry water. This is the 245-finisher that flies: the water-carrying alternative on exactly the holes this game is named after. **Measured: +$1.67M as a season-long add**; as a swap for Bomb It, +$777k (a real choice — you pay $900k of Bomb It's value for the tighter cone). Price under §4.3, not at $120k.

#### 3.8 Three-Quarter It
> **Three-Quarter It** — *"An eighty percent swing. Eighty percent of everything."*

```ts
{ id: 'threequarter', kind: 'technique', name: 'Three-Quarter It', focus: 1,
  blurb: 'An eighty percent swing. Eighty percent of everything.',
  effects: [{ op: 'scaleCarry', value: 0.80 }, { op: 'scaleSpread', value: 0.75 }] },
```

**Hole filled:** `scaleCarry` is in the op vocabulary and **no card in the game uses it** — this is the op's showcase. Proportional shortening is genuinely different from Smooth It's flat −15: it turns a 265 into a 212 and a 165 into a 132 — the whole ladder shifts down a rung, which is gap-puzzle material, not a tightener. **Measured as an add: −$188k — a trap in the current economy,** like every technique. Propose only under swap-not-add, where its bar is "better than the technique it replaces" (candidate victims: Let It Chase or the second Extra Club, both measured cuttable). Measurement: swap-matrix row vs each starting technique.

#### 3.9 Pick It Clean
> **Pick It Clean** — *"Ball first, then sand. Say it again."*

```ts
{ id: 'pickclean', kind: 'shot', name: 'Pick It Clean', carry: 140, spread: 14,
  blurb: 'Ball first, then sand. Say it again.',
  rules: { from: ['tee', 'fairway', 'bunker'], roll: 5 } },
```

**Hole filled:** from a fairway bunker 200 out, the best card in the game is Punch Out. The >90-carry sand block means *nothing* in the bag advances the ball properly from sand — a guaranteed dropped stroke with no decision in it, the same shape as the missing-wedge problem that produced Chip It. **Measured as an add: −$242k** — the specialist tax, exactly as the ground rules predicted. Honest disposition: this card is only shippable under swap-not-add (predicted best-swap ≈ +$400–800k vs Splash Out, by the add+cut arithmetic), or as New Grooves' cheaper, deck-cost cousin — and it should never be offered at the same price as High Draw. It exists because the situation it answers is otherwise a non-decision, which is the one thing this game has never tolerated.

#### 3.10 Rescue, made honest — a fix, not a new card
> **Rescue** — *"Long, and it works from the junk."* (unchanged — that's the point)

```ts
// NEW rule, shared with 3.11:  ignoreLie?: boolean  — lie penalties read as fairway
// (rough/deep/trees only; sand and the green are excluded)
{ id: 'rescue', kind: 'shot', name: 'Rescue', carry: 175, spread: 15,
  blurb: 'Long, and it works from the junk.',
  rules: { roll: 8, ignoreLie: true } },
```

**Hole filled:** the brief asked for a card that rewards a specific lie; the pool already *claims* one and doesn't deliver — Rescue takes deep rough ×2.6 spread like every other iron, and its $1.14M measured value is generic reach wearing a costume. `ignoreLie` is the justified new rule: one optional field, one clause on the `pen` line in `buildCone` (beside `roughRelief`, which proves the pattern), and it creates the game's first *lie-conditional* card value — Rescue becomes the card you keep because of where your Bomb It cone tends to finish. **Predicted +$1.7–2.3M as an add** (it gains most exactly where it was weakest). Measurement: re-run the add and swap rows against the current Rescue's +$1.14M; the delta is the mechanic's price tag.

#### 3.11 Gouge It Out
> **Gouge It Out** — *"Thrives in the thick stuff. Refuses short grass."*

```ts
{ id: 'gouge', kind: 'shot', name: 'Gouge It Out', carry: 150, spread: 18,
  blurb: 'Thrives in the thick stuff. Refuses short grass.',
  rules: { from: ['rough', 'deep', 'trees'], ignoreLie: true, roll: 10 } },
```

**Hole filled:** the inverse specialist — a card that is *only* playable from bad lies, using the same `ignoreLie` rule as 3.10 (no second mechanic). From deep rough it is the best iron you own; on the tee it is a blank. That is a texture no current card has: its value depends entirely on how wild the rest of your bag is, so it pairs with Full Send and fights with Knockdown — build-defining in a pool that mostly isn't. **Predicted as an add: negative** (every `from`-restricted card measured negative); under swap, predicted +$300–700k in a wide-cone bag. Ship only with §1.5, priced at the floor, and measure with the swap matrix under a Full-Send-carrying deck variant — the pairing claim is testable and should be tested.

---

## 4. Pool structure

### 4.1 Tier boosts by event — the structure half-exists; finish it

The reducer already splits the two boost channels: **majors hand you a free pick of 3 for surviving the cut** (`offerBoosts`), and the weekly shop prices 2 at random. What neither channel does is discriminate — event 2's shop can stock Marlene, and a major's free pick can offer Soft Spikes, which makes the season's biggest earned moment feel like the discount rack.

Because prices are measured, **tiers are free — they already exist as price bands.** Proposal: majors' free pick draws only from **≥$1.0M** (Marlene, Super Ball, Golden Putter, Golden Driver, Grips, Marker, Dead Ball, Headcover, Long Tees, Stiff Shafts, Inside the Leather, Short Memory); the weekly shop stocks anything, but events 1–3 stock only **<$1.0M** (Spikes, Yardage Book, Forged, New Grooves, Organized Bag, Pontoon). This does three things: majors *feel* like majors with zero new systems; the early shop sells what an early wallet can buy (first check is $1.4M — a $2.4M sticker at event 2 is noise); and the sharpness spine (§3.4a) keeps its shape, because the big cone-touching boosts arrive when the season's own tightening is slowing down. It also stops the 12-boost pool exhausting by mid-season — with the six new boosts above, the pool is 18, which the two channels can breathe in. **Measurement:** shopcheck's shopping season with gated stocking; the acceptance bar is the check kill rates holding 42/21/5 and the shopper-vs-hoarder gap not narrowing.

### 4.2 Removals-first — yes, and the reducer already believes it

shop.ts says it plainly: "thinning is the stronger play," and the measurement agrees — the best cut is worth $1.80M against the pool's *average* card at +$152k. Yet the shop's layout sells two cards at eye level and hides the cut behind a $950k button. Until swap-not-add lands, **the card slots are the shop's weakest inventory and its only dishonest one** (§2: half the stock is mines). Proposal: lead the shop with the cut — one line, "Something in the bag isn't earning its place" — and stock **one** card slot, not two, drawn only from the measured-positive half of the pool. After swap-not-add, restore both card slots; they become swap offers, which are honest at any stock.

### 4.3 Price cards like boosts, because they are priced like gum

The flat `CARD_PRICE = 120_000` is the last unmeasured price in the game, in a codebase whose loudest principle is that prices are measured. The same harness that prices boosts prices cards — the §2 table *is* the price list. Proposal: per-card prices at measured-add-value-over-two (season-remaining-adjusted, same as boosts: a card bought at event 8 delivers roughly half its season value), floored at ~$60k. High Draw at ~$800k next to Texas Wedge at $60k is itself information — the shop teaching the pool's real shape is better than any tooltip. Under swap-not-add, reprice from the swap matrix instead (best-swap value over two), which will compress the range and is the better long-term home. And in either economy: **remove Smooth It, Pre-Shot Routine, Fully Committed, and the Short Iron dupe from REWARD_POOL** — a mine is not a decision at any sticker.

---

## Appendix — caveats, and how to re-measure

- **All card values are mixed-policy, Pine Hollow, full-season ownership, N=200 seasons, seeds 600000+i.** Paired seeds make comparisons tight; still read ±$200k as noise. The harness policy plans with the cone it will actually roll (the Super Ball lesson), but it optimizes expected strokes and does not feel fear — Full Send's +$2.25M deserves one human evening before anyone acts on it.
- **deckcheck and the season harness disagree on magnitude, not direction.** Round-level stroke deltas are small (inside ±0.3); the season layer amplifies them through a place-based cut and a power-law purse into millions. Both are true. The money number is the one the shop should price from, because money is what the shop takes.
- **The temporary harness** was `src/tools/_itemcheck.tmp.ts`, deleted after this document. Recipe: copy shopcheck's `playHole`/`seasonEarningsWithDeck` (they are not exported — worth exporting), inject candidate cards into the runtime `CARD` table, run adds as `[...STARTING_DECK, id]`, swaps as splice-then-push, and proposed boosts as kit entries using existing fields. Recommend promoting this to a permanent `rewardcheck.ts` beside shopcheck — the card pool needs its prices re-derived every time the economy moves, exactly like the boosts, and today it couldn't be done without writing the tool from scratch.
- **New mechanics proposed, in total:** four boost fields (`gimmeFeet`, `momentumSlack`, `cutBonus`, `sandRelief`, `freeRedraws` — five, counting the small one), one shot rule (`ignoreLie`, shared by two cards and one fix). Each is one optional field and one clause, per ARCHITECTURE §6.2; nothing touches the op switch except `ignoreLie`'s clause on the `pen` line, beside the `roughRelief` clause that establishes the pattern.
