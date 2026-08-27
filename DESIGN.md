# DON'T HIT IT IN THE WATER
### A golf season roguelike deckbuilder — design document

**Version 0.5 · Status: playable, 56 tests, one course shipped and two in review · 25 Aug 2026**

*Title held — see §15.1 and the naming round in `TITLE-DEFENSE.html`.*

> Sections marked **SUPERSEDED** are kept deliberately. This document is also the
> record of what we believed and why we stopped believing it, and about a third
> of the confident numbers in the first draft turned out to be wrong.

---

## 1. Pitch

You are a professional golfer with a tour card and one season to keep it.

Each run is a season. Each tournament is an encounter. Each hole is a turn. Your bag is your deck — clubs are the shots you play, techniques are how you play them, and composure is the state you play them in. Every card you play costs a stroke, and strokes are your score, so unlike every other deckbuilder you are trying to play *fewer* cards, not more.

Miss too many cuts, earn too little, and you lose your card. That's the run.

---

## 2. Design pillars

These are the load-bearing decisions. Everything else is negotiable; changing one of these means we are making a different game.

**P1 — The economy is the sport.** Strokes are both your card cost and your score. Focus is your energy. Fourteen clubs is your deck cap. Every core system is lifted from real golf rather than invented and reskinned. If we ever need a new resource, we look for it in the sport first.

**P2 — Playing fewer cards is winning.** This inverts the genre default and it is the game's signature. We never add a mechanic that rewards volume for its own sake. The deck is a toolkit, not an engine. A bloated bag is bad because you need the *right* answer, not more answers.

**P3 — Hit ball far, hit ball short, don't hit into things.** That is the entire game of golf, and it is the entire game of *this*. You are 171 yards out, your clubs go specific distances, and there is water short-right. The decision must be legible in five seconds without a wiki. If a mechanic can't be explained in one sentence to someone who has never watched a golf tournament, it's wrong.

> This is **not** a mandate to simplify the game to mini golf. The systems underneath can be as deep as they need to be. It's a mandate that the *surface* — the thing the player reads while deciding — stays as simple as the sport actually is.

**P6 — Art teaches the mechanic. Words are flavor.** A player must never need to know a golf word to understand what a card does. Obscure golf vocabulary is *welcome* — it's most of the charm — but only ever as a label on something the player already understood from the picture and the number.

The teaching order is fixed, and it is always this order:

1. **The art** shows the shape. A draw curves left. A flop goes up and stops. A stinger stays low and runs.
2. **The number** shows the magnitude. 160 yards. 15 yards shorter.
3. **The word** arrives last, and it is a reward. You learn what a "draw" is *because* you played it and watched the ball bend.

A player should finish their first run knowing more golf than when they started, and should never once have felt quizzed on it.

**P4 — Recognition, not absurdity.** Nothing supernatural. Everything in this game has actually happened to someone on a golf course. It is funny because it is true. See §4.

**P7 — Par is not good enough — eventually.** Every safe decision produces par: lay up, take the extra club, aim at the fat of the green. Par is *fine* in the early season and stops being fine by the end. The bar rises gradually until safe play cannot clear it, and the skill of the game is knowing **which holes to attack, and when to start.**

This is the difficulty. Not variance — variance is a tax, not a test. The cone is not the punishment, it is **the price of the score you need.** Full curve and calibration in §3.4.

**P8 — The cone is the whole truth.** The ball can never finish outside the cone the card showed you. Dispersion is bounded, not a bell curve with tails — if water is not inside your drawn cone, you cannot find water.

This costs realism (real golfers do hit genuine snap hooks) and buys something worth more: **every disaster is traceable to a choice the player could see before they made it.** It also makes the cone a planning instrument rather than a mood. A player who loses a stroke should always be able to point at the moment they accepted that risk.

**P5 — Simulation serves decisions.** We model golf exactly as deeply as it takes to make the next choice interesting, and not one yard deeper. There is no ball flight physics. There is no swing plane. There are distances, dispersion, lies, and consequences.

---

## 3. The shape of a run

| Layer | Maps to | Notes |
|---|---|---|
| **Season** | The run | ~14 tournaments, target 75–90 minutes |
| **Tournament** | An encounter | 8 played holes across two rounds, with a cut between |
| **Hole** | A turn | Play cards until the ball is holed |
| **Majors** | Elites / bosses | 4 per season, at events 4, 7, 11, 14 |
| **The Money List** | Death check | After events 5, 9, and 12 — never after the last event |
| **Losing your job** | Death | Run over. Back to Qualifying. |

### 3.1 Season flow

```
QUALIFYING (tutorial run only)
   ↓
EVENT 1 → 2 → 3 → [MAJOR 4] → 5 → ◆ MONEY LIST ◆
   ↓
6 → [MAJOR 7] → 8 → 9 → ◆ MONEY LIST ◆
   ↓
10 → [MAJOR 11] → 12 → ◆ MONEY LIST — the last one ◆
   ↓
13 → [MAJOR 14 — SEASON FINALE] → where you finished
```

Between every event you get a **week**, which is a choice node (§8).

### 3.2 The Money List

Cumulative season earnings must clear a threshold or the run ends immediately.
This is the Balatro blind requirement, wearing a visor.

> **RE-ANCHORED 25 Aug 2026 — three changes, one playtest question.** The list
> now checks **GROSS earnings** (`earnings + spent`): it records what you won,
> the way a money list does, and shopping cannot demote you on it. The first
> playtester's first question — "it feels like you can't buy anything, so how
> do you get better?" — was the net check reading as a mugging, and the
> measured truth was worse: under momentum regen every boost had drifted to
> 7–20× its price and the old thresholds killed almost nobody. Boosts are
> repriced to ~2.0× measured value, and the thresholds below are superseded by
> **$1.4M / $4.8M / $8.4M** — re-derived a second time the same night once
> FIELD RESPONSE landed (`FIELD-RESPONSE.md`: the field's skill floor now
> rises through the season, so the late checks finally answer their dial).
> They send home 42% / 28% / 8% of arrivals; survival is mixed 38%,
> aggressive 46%, safe ~4% against the 36/45/3 intent, and a mixed hoarder
> survives 10% against the shopper's 38%, so the shop is the difference
> between living and not. The one residual — check 3 at 8% vs 14% intent —
> is equipment snowball, and its dial is boost decay, not these numbers.
> Provenance in `content/season.ts`; re-derive with
> `npx tsx src/tools/shopcheck.ts`.

> **RE-ANCHORED AGAIN at slice 4 (25 Aug 2026, the calibration pass against
> the finished world): $2.3M / $10.0M / $13.3M.** Two things no prior
> derivation modeled: the **free major-cut boost drops** (up to four premium
> boosts a season, found live by the owner) and the **ten-course rotation**
> under canon-ladder field coupling. Together they had decayed the triple
> above to kills 28/6/1. The new bars send home 44% / 32% / 1% of arrivals;
> survival mixed 37%, aggressive 36%, safe 2% (intent 36/45/3). Check 3's
> residual DEEPENED (1% vs 14% intent — the drops feed the same equipment
> snowball; the dial remains boost decay), and aggressive now sits a point
> under mixed, flagged as an economy property no bar can reorder. Full
> provenance in `content/season.ts`; the drop model is in
> `tools/shopcheck.ts`.

> **RE-ANCHORED A FOURTH TIME — and DOWN for the first time
> (CALIBRATION-2.md, 26 Aug 2026): $2.3M / $8.5M / $12.2M.** The MARQUEE
> RAMP (`FIELD-CEILING.md`) put four named stars in the field who eat the
> late season's cheques (the shopper's late win rate went 86% → 51%), and
> at the old triple check 2's kill had run to 49% against its 29% intent
> while check 1 sat untouched — the spring rule, visible in the books. The
> new bars send home 44% / 35% / 5% of arrivals; survival mixed 35%,
> aggressive 34%, safe 5% (hoarder 10%), against the 36/45/3 intent.
> Check 3's bar moved DOWN exactly as FIELD-CEILING §8-2 registered — but
> its kill topped out at 5% at every bar the win-pays-the-final-leg
> invariant permits, so the 14% intent is formally unmet and the escape
> clause governs: the residual is equipment over-supply, the named next
> dial is honest rentals (consumable SKUs), and no fifth re-anchoring is
> allowed to chase it. Provenance in `content/season.ts`.

> **RE-ANCHORED A FIFTH TIME (SHOP-SUPPLY.md SHIPPED, 26 Aug 2026):
> $2.1M / $8.1M / $11.1M — and the intent table below is RE-SET.** Two
> worlds landed at once: the split purse (a tied win pays the mean of the
> covered cheques — and in this score space winning groups tie
> constantly, so the split taxed even the spring), and the shop-supply
> hybrid (a six-purchase season budget with tiered stock — the scarcity
> every prior calibration silently assumed, finally shipped). The new
> bars send home **44% / 31% / 1%** of arrivals; survival mixed 38%,
> aggressive 30%, safe 1% (hoarder 7%). The old 41/29/14 intent triple
> is retired with receipts: its product (36% survival) is delivered, but
> 14% at check 3 is unreachable inside the spring rule and the
> win-pays-the-final-leg invariant — which now prices the leg on the
> EXPECTED win cheque (the modal winning group is 2–3, so a win is worth
> `tiePayout(purse,1,2)` ≈ $2.71M, capping the leg at ~$3.0M). Check 3
> is a pace check whose real teeth are the leg's demand for a major win;
> its kill is structurally small. The difficulty owner for "too easy" is
> the supply dial (`shop.ts` SHOP_BUDGET and the tier weights), never a
> sixth re-anchoring. Provenance in `content/season.ts`.

> **RE-ANCHORED A SIXTH TIME (CALIBRATION-3.md, 26 Aug 2026):
> $2.6M / $10.1M / $13.8M — the first anchoring in the project's history
> to move bars UP.** THE FULL SCORECARD (FIELD-SPREAD.md) spread the
> field over 36-hole weeks and shipped the full tie split at every rank;
> the extension pays a pace-holding player up the spread board more than
> the split taxes them, so at the old triple survival read 50%. The new
> bars send home **44% / 37% / 2%** of arrivals; survival mixed 35%,
> aggressive 27%, safe 1% (hoarder 6%). Check 2 is the season's whole
> wall now; check 3 sits at the invariant's ceiling — which ROSE with
> the spread: 91% of wins are solo, so the win-pays-the-final-leg
> invariant prices the leg on the SOLO cheque again (payout(purse,1) =
> $3.4M at a major, leg cap ~$3.78M, was ~$3.0M under the tie-world's
> expected 2-way cheque). Provenance in `content/season.ts`.

**The intent table (re-set at SHOP-SUPPLY, was 41/29/14):**

| Check | After event | Threshold | Kill intent, of arrivals | Measured |
|---|---|---|---|---|
| First | 5 | **$2,600,000** | 44% — the spring rule's number | 43% |
| Second | 9 | **$10,100,000** | 33% — the season's real wall | 37% |
| Last | 12 | **$13,800,000** | ≤ 8% ceiling — a pace check; its teeth are the win the leg demands | 1% |

> **Measured column re-read at SHARPNESS.md (27 Aug 2026), bars unmoved.**
> The seventh re-derivation is the first that moved nothing: the flattened
> sharpness ramp holds events 1–9 within a hundredth of the old line, and
> the checks read events 5, 9 and 12. Survival mixed 36% (target), aggressive
> 27%, safe 1%, mixed hoarder 5%.

**The last check is not after the last event, and that matters.** It used to be,
and a check after the final tournament is not a checkpoint — it is a verdict on
a season already played. Worse, it made the finale a lottery ticket: winning the
season-ending major paid $3.60M against a $3.08M requirement, so thirteen weeks
of careful accumulation could be matched by one Sunday. Ending survival at event
12 leaves two weeks that decide **how well you finish** rather than whether you
live, and lets the finale be a trophy.

Failing early is *good design*, not a punishment — it ends a doomed run at
minute 25 instead of minute 80.

> **Calibrated, not guessed.** Set by CONDITIONAL kill rate, not by percentile
> of the population: everyone facing check 2 has already survived check 1, so
> the pool that arrives is richer than the spread suggests. Survival across all
> three: **mixed 36%, aggressive 45%, safe ~3%**. A hoarder who never visits the
> pro shop gets 24% where a shopper gets 36% — that crossover is the only reason
> the shop exists. Re-derive with `npx tsx src/tools/shopcheck.ts`.
>
> **They are raised whenever the game gets fairer.** Twice in one day: once for
> the guaranteed short shot (§7.1), once for the cone-angle fix (§5.2). Neither
> was a difficulty decision — one was a missing floor, one was a modelling
> artefact — so the difficulty they removed by accident is taken back here,
> deliberately, on the dial that exists for it.

**The list itself.** The Money List is the **72 players you tee it up against
every week** — the same population as the leaderboard, counted twice. A mixed
shopper's median season banks $16.97M under the finished world
(CALIBRATION-3: drops modeled, stars in the field, 36-hole weeks, full tie
split) and sits **20th**; the checks demand a pace worth roughly 28th, 17th,
then 19th — the last one tighter in pace terms than it kills, because check
3's kill is the standing residual. The squeeze is visible in your own
position without the game ever having to state a demand in places.

### 3.4 The squeeze — where difficulty actually comes from

> **SUPERSEDED by §3.4a–d, kept as the record of how we got here.** Every number
> in this section is wrong now: the bag does not improve (§3.4a), the cut is a
> place rather than a stroke line (§3.4b), and the "holes you must attack" model
> was never something the simulation could reproduce. The *pillar* below still
> holds, and it is the only part that survived.

Per **P7**, difficulty is not variance. It is the widening gap between what safe play produces and what the cut demands.

**The cut line is derived, not invented.** We decided first how many of the 8 played holes the player should be *forced* to attack at each point in the season — 0 at the start, climbing to 7 by the finale — and then simulated what that many attacks actually scores, and set the cut there. The line is whatever produces the intended pressure.

| Event | Bag quality | Holes you must attack | Cut line | **Safe play makes the cut** |
|---|---|---|---|---|
| 1–2 | 0.00–0.09 | 0 of 8 | E | **57%** |
| 3–5 | 0.18–0.36 | 1–2 of 8 | E | **56%** |
| 6–7 | 0.45–0.55 | 3 of 8 | E | **56%** |
| 8–9 | 0.64–0.73 | 4 of 8 | −1 | **18%** |
| 10–11 | 0.82–0.91 | 5 of 8 | −2 | **3%** |
| 12–13 | 1.00 | 6 of 8 | −3 | **0.4%** |
| 14 (finale) | 1.00 | 7 of 8 | −4 | **0.0%** |

**Cut line curve (strokes vs par over 8 played holes):** `0 0 0 0 0 0 0 −1 −1 −2 −2 −3 −3 −4`

That last column is the whole design. Par is genuinely fine for half the season — a coin flip, enough to survive on. Then it degrades, and by the finale it is worthless. **It's not a switch, it's a collapse**, and the player feels it as *"the thing I've been doing has stopped working."* Mid-run strategy death is exactly what a roguelike wants, and here it arrives around **event 8**.

### 3.4a Sharpness — you start bad and get good

**Superseding part of §3.4.** That section assumed your *bag* improves over the
season and that this is the race against the cut line. `deckcheck` disproved it:
adding cards is not better than adding nothing, because dilution beats any
individual card. The thing the curve depended on did not exist.

**The replacement, from playtest:** *"i want to start off worse. like maybe a
wider cone. then increase cuts."* Cone width starts wide and tightens as you
acquire equipment. Unlike cards this costs no deck space, so it is a real and
guaranteed improvement axis — and it makes equipment the *spine* of progression
rather than a bonus on top of an already-competent player.

**Sharpness** is a single global multiplier on every cone: **×1.40 at event 1,
falling to ×0.80 by event 14.**

> **MEASURED AND RESHAPED (SHARPNESS.md, 27 Aug 2026 — PLAYTEST-NOTES-1 note
> 11).** That line was written, never measured, and it was the largest lever
> in the game: 43% of free cone across a season, on every club, beating
> anything purchasable (Forged Wedges ×0.55 short only; the Golden Driver
> ×0.66 past 200 yards). A large share of "getting better" was time passing,
> which is P7's opposite. Two shapes were swept against the live world;
> what ships is **×1.40 falling five hundredths a week to ×0.95 at event 10,
> then FLAT to the finale** — the free gains all land early, the last five
> events hand out nothing, and late-season power is something you bought.
> Measured: the strong player's late-season win rate 49% → **48%** (inside
> FIELD-CEILING's 45–60 band; at ×1.00 it falls out of it, which is what
> set the floor), mixed make-cut finale 49% → **42%** with events 1–6
> digit-identical, and the economy unmoved — the closing calibration
> re-derived MONEY_CHECKS and moved nothing.

### 3.4b The cut is a PLACE, not a score

**This replaces the stroke-based cut line entirely.**

A stroke line cannot make a difficulty curve out of a four-hole score. Four holes
of golf produce an integer piled on about four values, so moving the line by one
stroke moves the survival rate by more than twenty points. Measured across a live
season, make-cut ran:

```
72 57 60 60 · 36 38 44 42 42 · 19 18 18 15 24
```

That is not three phases of a squeeze. It is **two cliffs wearing a curve's
clothes** — one at event 5 where the line moved to level par, one at event 10
where it moved to −1. Everything between them is flat.

**The fix is the one real golf already uses: cut to a number of players.**

```
TOP N AND TIES, N =
44 41 39 36 34 31 28 26 23 21 18 15 13 10
```

A place is continuous where a stroke line is not — N can step by two or three a
week and the squeeze is smooth. It puts the decision on the leaderboard that is
already on screen. And it retires `fieldEdge`, the fudge that used to drag the
field's median onto the line every week so that a stroke cut would remove anybody
at all.

**Derived, not chosen.** Measured against 400 seasons per skill level with a
player who shops: make-cut runs **75% → 28%** for mixed play, 63% → 23% for safe,
64% → 31% for aggressive. Re-derive with `npx tsx src/tools/cutcheck.ts`.

**A known imperfection, honestly labelled.** "And ties" overflows hard here,
because 72 players finish inside about two strokes of each other over four holes.
The cut says top 44 and roughly 57 advance; late in the season it says top 10 and
roughly 29 advance. What gates *you* is the line score, so the difficulty curve is
real — but the number on the header is aspirational, and the honest fix is to
spread the field out rather than to reword the label.

**What a front four must now do (§9).** Under a place-based cut it is no longer
enough for the opening holes to be hard. They have to **spread the field**, and
specifically they have to spread it by *decision* rather than by variance — a
wider distribution fed by cone luck makes a place-based cut more of a lottery,
not less.

### 3.4c The field — and the sign error that hid inside it

For most of development **the field's skill was inverted.** `bias` is built so
that a *larger* value buys birdies and buys off bogeys, and skill was being
subtracted from it. Measured over eight holes:

| skill | scored |
|---|---|
| 0.25 (the worst player in the field) | **+0.21** |
| 0.85 (the best) | **+4.60** |

The best player on tour was the worst player on tour. This is why you could shoot
level par and stand 11th of 72, why the cut never removed anyone without a fudge
factor propping it up, and why the whole field finished inside a couple of
strokes of itself. Corrected, the range runs −0.89 to +2.93 and the board reads
like a leaderboard.

**The field no longer improves across the season, and does not need to.** With a
place-based cut, N is the difficulty dial and the field can stay honest. Your own
median finishing position now moves from **28th to 17th** across a season as
sharpness tightens and equipment arrives — you can see yourself getting better,
on the same board, against the same people.

> **Qualified twice since, each time by measurement.** FIELD RESPONSE
> (`FIELD-RESPONSE.md`) found the sentence false about the CUT — the floor
> now rises through the season (`fieldStrength`) — and FIELD-CEILING found
> it false about the WIN: the frozen 0.85 ceiling made the finale a parade
> for a strong player (83% of weekends won), so the MARQUEE RAMP ships four
> named stars who find form from event 5 (`content/players.ts`,
> `sim/resolve/field.ts`). The sentence survives only as it was originally
> meant: the OTHER sixty-seven never improve, and the field median never
> moves — the stars are surgery, not a transfusion. Calibrated consequences
> in CALIBRATION-2.md.

**Do not adjust any of this by feel.** `npx tsx src/tools/cutcheck.ts` re-derives
the place distribution and the N curve against the live simulation.

**Two properties worth protecting:**

- **Attacking early is punished.** The bag isn't good enough yet. A player who
  learns aggression too early gets taught otherwise, cheaply.
- **The finale is reachable but not comfortable.**

**The real race** is equipment quality versus the falling N. Every purchase,
every lesson, every removed card is the player buying the ability to attack more
holes safely. That is what the between-event layer (§8) is *for*, and it's why
skipping events has to cost real money.

> **Consequence for aim:** if attacking is compulsory late, the player needs a way
> to shape risk rather than merely accept it. Aim is three discrete choices — at
> the pin, safe left, safe right — free to use, because the cost is already paid
> elsewhere: aiming safe leaves you further out, which costs the birdie, which
> costs the cut. **Aim moves the ball ±14 yards**, and that number turns out to be
> a course-design constant (§9).

### 3.4d How a season ends

The run always reaches an ending. Either a Money List check ends it at event 5, 9
or 12, or you play all fourteen and the season closes with **where you finished**:
your position on the Money List, and a grade for it — top five is a two-year
exemption, top fifteen is a career year, and anything inside the line renews your
card.

**A failed check owes the player an accounting, not a verdict.** "Not close
enough" tells you nothing you could have acted on. The ending screen reports cuts
made, money spent in the pro shop, and weeks sat out, then the arithmetic: *you
needed $1.30M by event 9 and had $960k — $340k short, you missed four cuts and
spent $520k on the way.* That turns a wall into a post-mortem, which is the thing
that makes somebody press restart.

### 3.3 A tournament

1. **Course reveal.** Archetype, yardage, conditions, purse, field strength, and the projected cut line.
2. **Round 1 — 4 played holes.** The other 14 holes of the round are simmed from your stats and shown as a running score.
3. **The cut.** Your R1 total vs. the cut line. Miss it and the tournament ends, you earn nothing, and you carry the fatigue anyway.
4. **Round 2 — 4 played holes.** Same structure. This determines your finish.
5. **Payout.** Finish position against a generated field → prize money → sponsor bonuses.

Eight played holes per event is the number to hold onto. Fourteen events × 8 = **112 played holes per run.**

| Seconds per hole | Hole play | Total run (with between-event layer) |
|---|---|---|
| 30s | 56 min | ~71 min |
| 40s | 75 min | ~90 min |
| 50s | 93 min | ~108 min — **too long** |

So the design target is **30–40 seconds per hole**, and that is a hard constraint on UI: if a hole routinely takes 50 seconds because of animation, confirmation clicks, or reading, we cut to 6 played holes per event rather than let runs run past 90 minutes.

> **Why sim the other 14 holes:** because a full 72-hole tournament is 1,296 holes per run, which is a ten-hour run and a dead game. The played holes are framed in-fiction as *the holes that mattered* — the ones that decided your week.

---

## 4. Tone rules

**The rule: recognition, not absurdity.** The humor comes from things every golfer has lived through. No magic, no cryptids, no talking animals, no supernatural weather. A card is funny because you know that guy.

**Clubs stay straight-faced.** A 7-iron is a 7-iron. This is deliberate and structural — the core puzzle must stay legible, so all the voice lives in the techniques, composure cards, and entourage. (Balatro does exactly this: the playing cards are plain, the jokers carry the personality.)

**Where the voice lives:**
- Technique names that are things people actually say — *Take the Extra Club*, *Bail Out*, *Aim Left of Everything*
- Entourage who are specific people — *Marlene, thirty years at this club*, not "Caddie Lv. 2"
- Sponsors who are regional businesses with a decal on your bag
- Superstitions treated as real mechanics, because to a golfer they are
- Course conditions that are annoying rather than dramatic — aerated greens, cart path only, a slow group ahead and a ranger who has said nothing

**The tone test:** if a card would make a golfer say *"oh no,"* it's right. If it would make them say *"what?"*, cut it.

### 4.1 The jargon audit

Per **P6**, there are two kinds of golf jargon and they get opposite treatment.

**Jargon that gates understanding must go.** These are words a player has to already know in order to make a decision or read their own progress. There is no art that fixes them, because they name *systems*, not objects.

**Jargon that decorates an understood thing can stay** — in fact it should, because learning it is part of the pleasure. These name *cards and places*, which have art.

| Name | Verdict | Resolution |
|---|---|---|
| Q-School | ❌ Gates | → **Qualifying**. Everyone understands qualifying for something. |
| "Card Status check" | ❌ Gates — and collides with *cards* | → screen is **The Money List** (it is a list, it has money on it). Failure is **losing your job**. |
| Pro-am | ❌ Gates | → **Exhibition** |
| **Dispersion** | ❌ Gates — worst offender | Never appears as a word anywhere in the UI. It is **the cone** (§7.1). Keep the term in code only. |
| Cut / cut line | ✅ Passes | Common idiom outside golf. "Made the cut" already means this in English. |
| Majors | ✅ Passes | Taught by structure — bigger trophy, bigger purse, later on the path. Player needs no definition. |
| The Yips | ✅ Passes with art | Shaking hands over a putter. The mechanic teaches the word — this is the model case. |
| Draw / Fade | ✅ Passes with art | Arc bending left or right. Unmissable. |
| Flop / Stinger / Punch | ✅ Passes with art | Trajectory silhouette: high-and-stop, low-and-run, low-under. |
| Links / Parkland / Muni | ✅ Passes with art | Course silhouette on the event card — dunes, trees, a flat public track. |
| Lay up | ✅ Passes with art | Arrow that stops short of the hazard on purpose. |

**The rule this produces:** *a word may be obscure only if the thing it labels is already obvious.* Systems get plain names. Objects get golf's names.

**Test for any future name:** could someone who has never watched a golf tournament make the right decision with the art and numbers alone, having never read the word? If yes, use whatever golf calls it. If no, rename the system.

**The Yips is the north star card.** Funny, mechanically nasty, curable at a cost, and universally understood. Every content pass should ask: what else is already sitting there in the sport?

---

## 5. The hole loop

### 5.1 Anatomy of a hole

```
TEE
 │  Distance to pin, par, hazards, wind, lie
 ▼
Draw hand → choose club (± techniques) → resolve → new distance & lie
 │
 │  repeat
 ▼
GREEN → putting resolution → hole out
 │
 ▼
Score vs. par → focus regen → next hole
```

### 5.2 Resolving a shot

A shot is a **cone**: a distance, and a half-width of scatter at that distance.
The ball lands somewhere inside it, always — never outside (**P8**). Lateral
scatter is triangular and bounded; depth varies by **±5% of carry**. There is no
Gaussian and no tail, because a tail would break the promise the picture makes.

Run-out then applies, and it depends on what the ball pitched into: **×0.30** if
it pitches on the green, **×0.40** in rough or deep rough, full otherwise. A
low-flight shot is judged for water and out of bounds at the **pitch point**,
before it runs — which is what makes "will not carry water" a real drawback
rather than a label.

| Lie | Distance | Scatter | Penalty |
|---|---|---|---|
| Tee / fairway | ×1.00 | ×1.0 | — |
| Rough | ×0.90 | ×1.7 | — |
| Bunker | ×0.85 | ×1.6 | — |
| Deep rough | ×0.76 | ×2.6 | — |
| Trees | ×0.70 | ×2.4 | — |
| Water | — | — | **+1 stroke** |
| Out of bounds | — | — | **+2 strokes** |

#### Taking something off a card widens the ANGLE, not the yardage

Short shots shorten to the pin; full shots fly their number. Taking distance off
a card costs accuracy — but for a long time that penalty multiplied the scatter
**in yards** while the shot got shorter, so the cone's *angle* exploded as the
distance fell. Measured from 21 yards in the rough:

| card | cone | as an angle |
|---|---|---|
| Pitch | ±21 | **45° either side** |
| Splash Out | ±35 | **59°** |
| the free chip | ±48 | **75°** |
| Bomb It, played full — the wildest card in the bag | ±32 | **7°** |

A 21-yard chip could finish 48 yards offline, drawing a shape 96 yards across.
Spotted in playtest from the picture alone, which is the cone doing its job while
being wrong.

The penalty is now **angular**: scale by `played / full` as well, and the
multiplier becomes exactly the factor your aim error grows by. Take everything
off a card and it can treble how offline you go — while a short shot stays a
short shot. A hard ceiling backs it up: **no cone may fan wider than about 29°**,
which only ever binds on a shot that has had nearly everything taken off it.

It was not free. The broken model was supplying real difficulty by accident —
correcting it took a mixed round from +0.62 to +0.17 vs par. The penalty constant
was chosen on the **picture** first (a short shot's cone must never be wider than
the green it is aimed at), then the difficulty it removed was taken back on the
Money List, which is the dial that exists for it.

Scatter is the whole game. A card that goes exactly the right distance with ±25
yards of scatter is a liability next to water and fine in the middle of a wide
fairway. **Course design is therefore difficulty design** (§9).

### 5.3 Putting — deterministic, and a birdie is something you buy

**There is no roll on the green.** Distance alone decides what par costs you.

| Distance | Putts, free |
|---|---|
| ≤ 4 ft | 1 — tap in |
| 5–45 ft | 2 |
| 45 ft+ | 3 |

And you may **buy the putt** with focus instead:

| Distance | Focus to hole it |
|---|---|
| ≤ 10 ft | ◆◆ |
| 11–25 ft | ◆◆◆ |
| 26–40 ft | ◆◆◆◆ |
| 40 ft+ | not available |

**Why this replaced a probability roll.** Putting was originally a make-chance
table, then a Lag/Charge choice with the odds shown. Both failed the same
playtest, twice: *"blamed it on putting RNG"* → *"missing 75%ers with only RNG
to blame."* Showing the odds made it **worse**, not better — being told 75% and
then missing is a promise broken.

The rule this restores is the one Slay the Spire never breaks: **cards do what
they say.** Randomness belongs in what you are *dealt*, not in whether your play
*works*. The cone survives that test because a missed shot still lands somewhere
and where it lands has texture — rough, sand, water, all different. In-or-out
has no texture at all, so a missed putt is a pure loss with nothing to read.

**Three things this buys:**

1. **Proximity becomes exactly valuable.** 8 feet is a ◆◆ birdie; 30 feet is
   ◆◆◆◆ or a two-putt. The approach shot now has a precise payoff, which is
   what makes the shot decision sharp.
2. **Focus gets the second sink it badly needed.** It was spent on techniques
   only, and playtesting showed techniques going entirely unused — so focus
   accumulated and did nothing.
3. **It implements P7 directly.** Par is free. Birdies cost. Since the cut line
   eventually demands birdies, focus becomes the currency of scoring, and every
   green asks: spend it here, or save it for the hard hole coming?

**Calibration (250 rounds):** safe +1.57, mixed +0.75, aggressive +0.96 vs par.
Aggressive beats safe, blowups happen, and nothing on the green is luck.

## 6. Economy

Three currencies, all native to golf.

### 6.1 Strokes — your score, and your card cost
Every club card played costs one stroke. Your score on a hole equals the number of club cards you played. A par 4 played with 4 cards is a par; 3 cards is a birdie. This is the cleanest thing in the design and we should protect it.

### 6.2 Focus — your energy
Spent on technique cards. Not spent on clubs.

- **Starting max:** 5
- **Regen:** +1 per hole completed, +1 additional on par or better
- **Fatigue reduces max focus** (§8.2)
- Carries between holes within a round; resets to max at the start of each round

The par-or-better bonus creates momentum: playing well funds playing well. We must watch this for death-spiral feel — if it reads as punishing rather than tense, drop the bonus and flatten regen to +2.

### 6.3 Money — the meta-resource
Prize money is both your score *and* your shop currency, which creates the
central tension: spending on your game costs you progress toward keeping your
card. Sponsors offset this, at the cost of conditions.

**Prices are measured, and the first measurement was taken with a broken
instrument.** A synthetic "equipment tightens every cone 12%" stand-in said
shopping lost to hoarding at every price, so prices were driven downward chasing
a crossover that did not exist. Run against the *real* boosts through the real
cone builder, every one of them returned between **three and twenty times** its
price — Marlene was worth $4.40M for $220k — and cutting the best card out of the
starting deck was worth **$878k** against a $60k sticker.

The old harness was also planning blind: it built candidate cones with no boosts
and then played the shot with them, so Super Ball — "everything goes 10% further"
— measured at **minus $1.32M a season**, purely from overshooting greens. A human
sees the cone move and clubs down.

Prices now target a **1.4×–2.5× return** over the part of a season you will
actually own the thing for. Re-derive with `npx tsx src/tools/shopcheck.ts`.

> **THE SUPPLY RULE (SHOP-SUPPLY.md SHIPPED, 26 Aug 2026).** Price was
> never the binding constraint — conversion on offered boosts measured
> **100%** (the best live run bought all sixteen items the shop ever
> showed it), and every Money List bar since slice 4 had been derived
> under a four-purchase harness budget the live game didn't have. The
> shop now ships the scarcity the calibration always assumed: a **season
> allowance of six boost purchases** (cards exempt, rendered as pips),
> **rarity tiers** on the measured price bands — off the rack (<$1M,
> weight 6) / special order ($1M–$1.55M, weight 3) / tour issue (≥$1.6M,
> weight 1) — drawn per weekly slot from the unowned pool, a **spring
> slot** (through the first check the first slot always carries the
> rack), and a reroll that redraws **within** the week's drawn tiers.
> The decision stops being *whether* (it never was) and becomes
> *which* — measured conversion falls to ~23%, the season kit becomes a
> 9-boost draft with ~3 tour-issue sightings, and the patient
> counter-play (bank the slots, buy tour-issue only) dies at 11%
> survival against the naive shopper's 38. Difficulty tuning for "too
> easy" belongs to `SHOP_BUDGET` and the tier weights now, not to
> thresholds or prices.

### 6.4 The bag — your deck cap

> **SUPERSEDED by §7.0b.** Cards are shots, not clubs, and the deck is 20 cards
> rather than a 14-club bag. Kept for the reasoning about deck caps.

**14 clubs, exactly as in the rules of golf.**

Critically, **you do not start with 14.** A starting bag has 9 clubs and real distance gaps. Filling those gaps is the primary loot loop, and upgrading a club's dispersion is the secondary one. If the player started with a complete bag, acquiring clubs could never be exciting.

---

## 7. Cards

### 7.0 Card anatomy — the cone

**This is the most important UI decision in the game.** Per **P6**, the player must understand a club before reading a single word on it.

Every club card carries a **cone**: a wedge shape showing where the ball can end up. Narrow cone, reliable club. Wide cone, wild club. The player never sees the word "dispersion" and never does arithmetic on a ± figure — they *look at the shape and know.*

```
 ┌──────────────┐      ┌──────────────┐
 │    DRIVER    │      │    7-IRON    │
 │              │      │              │
 │   \      /   │      │     \  /     │
 │    \    /    │      │      \/      │
 │     \  /     │      │      ||      │
 │      \/      │      │      ||      │
 │      ||      │      │      ||      │
 │              │      │              │
 │     265      │      │     160      │
 └──────────────┘      └──────────────┘
   far, sprays          shorter, precise
```

Two cards, side by side, and the entire tradeoff of golf is communicated with zero text and zero golf knowledge. **Hit ball far, hit ball short.** The cone is where "don't hit into things" lives, because you can visually compare the cone against the width of the fairway and the position of the water.

Rules this locks in:

- **The cone is bounded and complete (P8).** The ball's landing point is drawn from a uniform or triangular distribution *within* the cone, never a Gaussian with tails. What you see is the full set of outcomes. This is also why `sim/` bans `Math.sin`/`Math.cos` — a Box-Muller Gaussian would be both unbounded and non-deterministic across engines.
- **The cone is drawn to the same scale as the hole diagram.** If they aren't the same scale, the comparison is a lie and the whole system collapses. This is a hard technical requirement, not a stylistic one.
- **Techniques visibly deform the cone.** Play *Smooth It* and the cone narrows on screen before you commit. Play *Grip It and Rip It* and it flares. The player sees the consequence of the modifier *while choosing it*.
- **Trajectory silhouette teaches shot shape.** A small side-view arc on technique cards: high-and-stops for a flop, low-and-runs for a stinger, bending left for a draw.
- **Numbers are secondary, not absent.** The yardage is on the card for players who want precision. It is never the primary read.

If we get the cone right, the tutorial is nearly unnecessary. If we get it wrong, no amount of tutorial saves the game.

### 7.0b Cards are SHOTS, not clubs — v0.3 pivot

The original model made each club a card. **That was wrong, and playtesting killed it.**

A club can only ever vary on two numbers — how far, and how wide. That is not
enough design space to build a deckbuilder on: you author fourteen of them and
then spend forever making slightly-tighter versions of the same fourteen. There
is no room for a card that *does* something.

A **shot** can carry rules. *Stinger* runs thirty yards but cannot carry water.
*Bump and Run* only works from short grass. *Splash Out* gets you out of sand and
nowhere else. And the distance-gap puzzle survives untouched, because every shot
card still has a number on it.

**The cost:** we lose "fourteen clubs is your deck cap", which was an elegant
constraint lifted from the rules of golf. Worth it. That was a constraint; this
is a game.

**Consequences that follow:**

- **You draw a hand of 8 at every tee and play the hole with it.** The hand lasts
  the hole, not the shot, so a hole is a route-planning puzzle: *I hold Bomb It,
  a Short Iron and a Pitch — can I make 4 from 442?*
- **The putter is not a card.** It is simply there when you are on the green.
- **Punch Out is always in hand** — 80 yards, wide, playable from anywhere. A bad
  draw must be a problem, never a dead end.
- **Shots and techniques share one deck.** Load up on techniques and you cannot
  advance the ball; load up on shots and you cannot fix a bad number. That is the
  deckbuilding decision.

**Why this was the fix.** The first playtest produced: *"always grabbed the club
that would get me closest… never once used a technique… didn't think about how to
get better."* All three are the same bug — every club was permanently available,
so nothing was ever scarce, so nothing was ever a decision. Techniques had no
problem to solve because the player never lacked the right club.

Balance confirms the mechanic has teeth: adding the hand moved safe play from
**−2 vs par (trivially easy) to +2.4**, real double bogeys started happening, and
**aggressive play overtook safe play** for the first time — with a constrained
hand, hoarding your good cards loses.

### 7.1 Shots — "the attacks"
Cost 1 stroke. Move the ball.

> The club ladder that used to live here is superseded by §7.0b. The live one is
> in `src/content/cards.ts`; what matters in this document is the shape of it.

**The ladder of finishing distances** — carry plus run-out, which is what the
player is actually choosing between:

```
277 · 255 · 208 · 170 · 133 · 105 · 94 · 70 · 58 · 55 · 35
```

The gaps are the puzzle: **255→208** (47 yards), **208→170** (38), **170→133**
(37). A hole is good when the number it asks for falls in a gap. Pine Hollow's
442-yard par 4 is the reference — a 265-yard drive leaves **177**, and you own
170 and 208. Neither is right.

**Upgrade axis:** cards get *tighter*, not longer. Distance upgrades exist and
usually carry a scatter cost.

#### The free shot, at both ends of the bag

One shot is always available, so that a bad draw is a problem and never a dead
end. For a long time that was **Punch Out** alone — 80 yards, wide, playable from
anywhere — which is a floor for being stuck *long*, and no floor at all for being
stuck *short*.

A hand with no wedge in it happens on **7.7% of holes**, which is about half of
all rounds. From 36 yards the best available play was Punch Out with Choke Down,
finishing **33 yards past the pin**. That is not a hard decision; it is the
absence of one — nothing to weigh, no line to find, just a stroke being taken
off you. Found in playtest, three holes running.

So the free card reads the yardage. **Inside 60 yards it is a chip** — *"Always
available. Rarely close."* — and outside it is the punch out it always was. It is
deliberately the worst short shot in the game, so it never makes a real wedge
redundant: from 36 yards its cone is ±22 against a Full Wedge's ±15, a Pitch's
±10 and a Flop's ±4.

Measured: it takes about a third of a stroke off a round and cuts catastrophic
holes from **18 per 400 rounds to 1**, while sub-par rounds barely move (25.0% →
25.8%). It raises the floor without touching the ceiling, which is exactly what a
floor should do.

### 7.2 Techniques — "how you swing"
Cost focus, **not strokes** — they modify a club you are already playing. This cost distinction is what makes the type split meaningful rather than cosmetic.

| Card | Cost | Effect |
|---|---|---|
| Smooth It | 1 | −15 yards, dispersion halved |
| Take the Extra Club | 0 | +12 yards, +4 dispersion |
| Bail Out | 2 | Water and OB count as rough. A quarter looser. *(shipped as "Just Get It On The Green" until 26 Aug 2026 — playtesters couldn't parse it and never armed it)* |
| Punch | 1 | Ignores wind, −20 yards, playable from trees |
| Aim Left of Everything | 1 | Shifts the dispersion window 15 yards right |
| Flop | 2 | Wedges only. Stops dead. High risk of a duff. |
| Stinger | 2 | Driver/long irons. +20 roll, tiny dispersion, no carry over hazards. |
| Grip It and Rip It | 1 | +40 yards, dispersion doubled |

### 7.3 Composure — "the state you're in"
Persistent for a hole or a round. The Powers slot.

| Card | Duration | Effect |
|---|---|---|
| Pre-Shot Routine | Round | +1 focus regen per hole |
| Nothing to Lose | Round | While over par, +20 yards on all clubs |
| Playing Loose | 3 holes | After a birdie: dispersion −20% |
| Tunnel Vision | Hole | Ignore all course conditions this hole |
| Grinding | Round | Bogeys cost 1 less focus to recover from |

### 7.4 Statuses and curses
Shuffled in, not chosen. Cured at a cost.

- **The Yips** — shuffles *Flinch* into your bag. Cure: an expensive lesson.
- **Sore Back** — −8% distance on every club. Cure: a rest week.
- **Slump** — max focus −2. Cure: make a cut.
- **Hot Hand** *(positive)* — +1 focus regen until you make a bogey.

---

## 8. Between events

### 8.1 The week node — the off week

You may tee it up, or **take the week off**. Two of five options are offered each
week, shuffled — and since the weeks redesign (WEEKS-VERDICT.md, 26 Aug 2026)
the draw follows the measurement: events 1–4 guarantee a practice option a
slot, majors offer nothing at all, and from event 10 the node goes quiet
(every current option costs the week, and every late skip measured −$1.2M or
worse).

| Off week | Effect | Cost |
|---|---|---|
| A week on the range | Every cone tightens 6% for the rest of the season, and it stacks | No prize money this week |
| A lesson with someone good | Cones tighten 10% for the rest of the season | $120k as well as the week |
| Get properly fitted | Cut a card from the bag, free | No prize money this week |
| Corporate day | $180k, guaranteed | No ranking, no equipment |
| Sign with a sponsor | $300k up front, today | **One less focus, every hole, for the next three events — then the contract runs out** |

Sitting out is money you don't earn while the Money List clock keeps running,
which is the entire trade: everything here has to be worth roughly what an event
pays, or nobody would ever take one. The schedule screen now prints that trade —
what an event typically adds at this point in the season — instead of hiding it.

**Off weeks are confirmed, not clicked.** The sponsor's button used to fire on a
single click, sitting directly underneath the one you press every single week. A
playtester hit it by accident. Picking an off week now only *arms* it — the card
highlights and a confirmation panel names the event you are withdrawing from and
the price — and **pressing Tee off clears a half-made choice rather than
honouring it.** The danger-red confirm is reserved for withdrawals that measure
dangerous (the sponsor, and any skip from mid-season on); an early practice week
gets a neutral one, because it is a purchase, not a mistake.

### 8.2 Fatigue
A season-long resource that only goes up during play. Each event adds fatigue; majors add more; pro-ams add the most. High fatigue reduces max focus. Only Rest clears it.

This is what stops "just play every event" from being the dominant strategy, and it's why the schedule is a real decision.

### 8.3 Entourage
Persistent slots, acquired between events. This is the Joker layer and it is where most of the game's personality and most of its build variety live.

| Slot | Examples |
|---|---|
| Caddie | *Marlene, thirty years at this club* — shows exact hazard distances before every tee shot |
| Coach | Converts money into permanent stat gains between events |
| Sponsor | *Deiter's Heating & Cooling* — +$800 per made cut. Decal on the bag. |
| Superstition | *Lucky Ball Marker* — replay your first putt each round. Stops working if you post worse than 78. |
| Wildcard | *Your buddy Dave, who has opinions* — +2 focus per round; 15% chance per hole he says something and you play a random technique you didn't choose. |

Sponsors should generally carry a **condition**, not just a bonus — an obligation to play certain events, a demand for a specific finish, a clause that voids on a missed cut. That's where sponsor decisions get teeth.

---

## 9. Courses as encounters

Course archetype is the primary difficulty and counterplay lever. Each one
punishes a different build.

| Archetype | Character | Punishes |
|---|---|---|
| **Links** | Firm ground, +roll, wider cones | High ball flight |
| **Parkland** | Tree-lined, narrow corridors | Wide cones. Bombers suffer. |
| **Desert / target** | Forced carries, penalty everywhere offline | Any big miss |
| **Muni** | Short, soft, low scoring | Precision-without-distance builds |
| **Championship** | Long, thick rough, small greens | Everything. This is a major. |

**Design rule:** a build that trivializes one archetype should struggle on at
least one other.

### 9.1 The constraint that decides everything

**The player cannot aim at a spot.** Every shot aims at the centre of the green,
plus or minus about **fourteen yards**. There is no target selection and no
"aim at the bunker and draw it back". The line from ball to pin is fixed, and
the only real decision is *how far to hit it*.

So a hole is not a shape. **A hole is a function from distance to consequence
along one line.** A hole that would be interesting because of *where* you aim
plays flat here. Design for the numbers the player owns.

### 9.2 A hole must contain a decision, not just a difficulty

Two numbers, printed for every hole by `tools/coursecheck.ts`:

- **`split`** — how often the safe, mixed and aggressive players choose a
  different *plan* (card, technique and aim) from the same position.
- **`gap`** — how much that choice changes the score.

|  | meaning |
|---|---|
| low split, low gap | a **lookup** — one line dominates, everyone finds it |
| high split, low gap | a **coin flip** — the options differ and are worth the same |
| high split, high gap | a **decision** — the target |

Target: **split above 60% and gap above 0.35.** Three holes out of twenty-four
currently clear both.

**The move that does not work:** putting a hazard where the obvious club lands.
It does not make that club a gamble, it makes it *wrong*, and every risk appetite
plays the next club up. It relocates the answer instead of creating a question.
Four separate revisions were built on it and all four measured flat.

**Two generators that do work:**

- **The reach-or-lay fork.** A distance only a wide-cone card reaches, with a
  tight card that falls comfortably short, and trouble that punishes the wide
  cone's edge. Pine Hollow's 210-yard par 3: you own 208 at ±20 and 170 at ±12.
  Safe lays up, aggressive goes. *(gap 0.55)*
- **The aim fork.** A hazard **12–25 yards off the line, long and thin, running
  parallel to it.** Almost every hazard ever built for this game sits 25–45 yards
  off line, outside the band ±14 yards of aim can reach — so aim changes nothing
  and club is the only lever. Inside that band, aiming safe is the difference
  between dry and wet *and* costs real position. *(gap 0.82 — the best hole in
  the game, and the only one built this way.)*

### 9.3 Hole order is load-bearing

The cut is judged after four holes, so the front four are a different job from
the back four. They must **spread the field by decision rather than by variance**
— a wider distribution fed by cone luck makes a place-based cut more of a
lottery, not less. No par 5 before the cut. Pine Hollow's front four is par 15;
its back four is the scoring stretch at par 17, which is also a better finish.

## 10. Meta-progression

Between runs, permanently:

- **New starting archetypes** — the Bomber, the Grinder, the Short Game Wizard, the Reformed Long-Drive Guy. Each is a different starting bag and a different set of holes in it.
- **Card pool expansion** — new techniques, composure, and entourage enter the pool as you hit milestones.
- **Tour tiers** — the difficulty ladder, and it's diegetic: Qualifying → Mini Tour → Main Tour → the elite schedule. Winning promotes you. This is Slay the Spire's Ascension without the abstraction.

---

## 11. First-pass numbers to validate

Everything here is a guess to be tested, not a decision:

| Quantity | Target |
|---|---|
| Run length | 75–90 min |
| Played holes per run | 112 (14 events × 8) |
| Seconds per hole | ~40 |
| First Card Check kill rate | ~33% of runs at baseline |
| Full-season win rate | ~20% at baseline, ~5% at top tier |
| Starting bag | 9 clubs |
| Max bag | 14 clubs |
| Starting max focus | 5 |
| Cut line, typical | Even par to −2 for a 4-hole played segment |

### 11.1 What the simulation has actually found

> The pre-code projections that used to fill this section were about a 14-club
> bag and are superseded by §7.0b. What follows is what the live harness found,
> in the order it found it. Every item cost a number that had been stated
> confidently and was wrong.

**Things the simulation caught before a player could:**

- Money List thresholds of $180k / $620k / $1.15M killed **73%** of average runs
  at the *first* check.
- The first cut-line curve was **literally impossible from event 3** — it
  demanded −6 over eight holes.
- A 16-card deck dealt 6 a hole produced nearly **ten Punch Outs a round**.
- The pro shop at $420k made buying **strictly a mistake** (hoard 29%, shop 21%).
- The cut curve was derived on eight-hole totals and applied after four:
  **92% survived event 1.**
- The field was static while the cut tightened, so **all 71 players missed the
  cut at event 14.**

**Things the simulation was confidently wrong about, until the instrument was
fixed:**

- **The field's skill was inverted.** The best player in it averaged **+4.60**
  over eight holes and the worst **+0.21** — a sign error that made every
  downstream conclusion about cuts and leaderboards meaningless (§3.4c).
- **The balance policy planned without its own equipment on**, so Super Ball —
  "everything goes 10% further" — measured at **minus $1.32M a season** purely
  from overshooting greens. Every shop price derived from that harness was wrong
  in the same direction (§6.3).
- **Equipment was modelled as a flat "cones 12% tighter" stand-in**, which said
  shopping lost to hoarding at every price. Run against the real boosts, every
  one returned 3–20× its price.

**Things the simulation could never have found, all of them from playtest:**

- Shots had no direction — the ball flew past the pin and kept flying past it.
- The starting deck was never shuffled, so no technique could appear before
  hole 3.
- A softlock after a ball in the water, which the harness happily "played"
  because the numbers looked reasonable.
- The cone fanning **45° to 75°** on a 21-yard chip (§5.2) — visible in the
  picture, invisible in every aggregate.
- Signing a sponsor by accident, one click from the button you press every week.

**The lesson, stated plainly:** simulation finds numbers that are wrong. It does
not find *models* that are wrong, because it is the model. Every model error in
this list was found by a human looking at the screen.

**Current calibration:** 56 tests. Make-cut 75% → 28% across the season. Season
survival: mixed 36%, aggressive 45%, safe ~3%; hoarding 24% against shopping 36%.

## 12. v0.1 — the vertical slice

**The only question v0.1 answers: is the hole-level decision fun?**

Everything else in this document is worthless if the answer is no, so we build the smallest thing that can answer it and nothing more.

**In scope:**
- One course archetype (Parkland — it's the most legible)
- 9 clubs, 6 techniques, 3 composure cards, 2 entourage
- One tournament: 8 played holes, a cut after 4, a payout
- Focus economy, dispersion, lies, putting
- Seeded RNG, so a run can be replayed exactly
- Text/HTML UI. Ugly on purpose. No art, no animation, no sound.
- Playable start to finish in ~10 minutes

**Explicitly NOT in v0.1:** the season layer, Card Status checks, fatigue, the week node, sponsors, statuses, meta-progression, multiple archetypes, art.

**Success looks like:** you play it four times in a row without being asked to.

**Failure looks like:** you play it once, correctly identify that it works, and feel no pull to play again. That's a signal the arithmetic is solvable rather than tense, and it means the dispersion and gap numbers need work before we build anything on top.

---

## 13. Out of scope for v1 entirely

Real player or tour licensing. Real course names. 3D or shot animation. Multiplayer. A course editor. Mobile. Story mode. Any form of monetization.

---

## 14. Open questions

Things I don't want to decide until we've played something:

0. **Does the squeeze in §3.4 land at the right moment?** Event 8 is where safe play dies. That's a guess dressed in arithmetic — the model of what "attacking a hole" yields is invented, and only play will confirm it. Re-derive the curve once real shot resolution exists.
1. **Does the focus par-bonus feel like momentum or like a death spiral?** Flatten it if it's the latter.
2. **Should the player choose which 8 holes they play, or does the game choose?** Player choice is more agency but risks becoming an optimization chore.
3. **Is the cut a hard fail or a soft one?** Missing a cut currently earns nothing. That may be too swingy for a mid-run event.
4. **How random should dispersion be?** Full random is realistic and infuriating. A visible dispersion *band* the player can reason about may be better than a hidden roll.
5. **Does putting want its own cards,** or does it stay a clean probability resolution? Cards risk bloating the turn; no cards risks the green feeling like a cutscene.
6. **Do we want a visible field leaderboard during play,** or only at round's end? Live leaderboards create pressure but also noise.

---

## 15. Working notes

### 15.1 Title

**A title is the one place P6 gets no help.** Cards have art. Course types have silhouettes. A title on a store page has nothing teaching it — so a title must need *zero* golf knowledge, on its own, cold.

That kills two of the three originals outright:

- ❌ **Q-School** — pure insider jargon. A non-golfer cannot even guess what it means.
- ❌ **Tour Card** — and not only for being dry. **It contains the word "card" in a card game.** Every player will parse "card" as *playing card* and mis-read the title. That's a genuine collision and it's disqualifying on its own.

Surviving candidates, scored against "does someone who has never watched golf understand this?":

| Title | Needs golf knowledge? | Notes |
|---|---|---|
| **Don't Hit It In The Water** | None | Literally states one third of P3. Funny in exactly the game's register — recognition, not absurdity. Most distinctive. Risk: reads arcade-y, may undersell the season stakes. |
| **Made the Cut** | None | "Made the cut" is standard English for *survived the selection*. Names the per-event stake, sounds professional, ages well. Risk: bland, and not unique to golf. |
| **Good Miss** | Yes ❌ | Thematically the best fit in the whole list — a game about dispersion should be named for the concept of missing in the right place. But it fails the cold test. Hold it for a subtitle or an achievement. |
| **The Back Nine** | Mild ❌ | Evocative and pressure-flavored, but you have to know a round is eighteen holes. |

**Recommendation: _Don't Hit It In The Water._** It is the only candidate that both passes the cold test and *carries the tone* — someone reading it on a store page already knows what kind of game they're getting and has already smiled once. *Made the Cut* is the safe pick if the goal is a straighter, more evergreen shelf presence.

Decide before the repo is scaffolded, since the title becomes the package name.

- **Architecture:** see `ARCHITECTURE.md`. The one non-negotiable is that the simulation is pure TypeScript with zero rendering dependencies, so the game can be ported without a rewrite.
- **Ownership:** design and architecture in this doc are the contract. Cursor should treat this file as authoritative context and should not invent mechanics that contradict §2.
