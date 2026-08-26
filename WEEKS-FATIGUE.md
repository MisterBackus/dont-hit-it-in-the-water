# FATIGUE — the pre-armed decision, priced before the falsifier fires

**26 Aug 2026 · proposal with measurements · instrument: a weekcheck derivative
(`fatigueprobe`, scratchpad-only — no repo file) · N=800 seasons per row, mixed
offer-stream shopper, seeds 800000+, stars on (4 @R1.4 β0.8 cap0.3), paired by
seed, ±1 s.e. quoted · finalist verified independently at seeds 900000+, N=400**

**Tree state the numbers came from:** HEAD `0799edf` ("The board learns what
day it was") **plus** the concurrent junk-floor session's uncommitted edits
(SAVE_VERSION 10, `JUNK_SPREAD_FLOOR` in effects.ts/geometry.ts; modified:
storage.ts, effects.ts, geometry.ts, deck.test.ts, shot.test.ts, junkcheck.ts,
policy.ts). Probes ran against a frozen snapshot of that tree taken 14:10, so
the numbers are internally consistent even though the tree kept moving. The
probe's no-fatigue baseline reproduces weekcheck digit-for-digit at N=50
($14.66M / 36%) and prints **$15.42M gross / 38% survival** at N=800 — the
SHOP-SUPPLY 38, alive in the junk-floor world. This is the first measurement
pass of the v10 world; every delta below is against this baseline, not against
any number printed in an older document.

---

## 0. The trigger, restated

WEEKS-VERDICT.md registered (26 Aug): *"Practice weeks start getting taken in
events 1–3 … If future runstats bundles still show `WEEKS taken: none` in
events 1–3, option A failed and the remaining lever is C-1 (ship fatigue) or
pricing the effects into the shop."*

The scoreboard since, from the frozen ledger and the logs themselves:

| season | version | weeks taken | detail |
|---|---|---|---|
| runs/andrew-3.json | v7 | **one** — a fitting | $26.34M gross, 10 wins, rank 3. Taken at **event 5** — replayed under v10 semantics the log desyncs later, but only two no-op actions precede the fitting, so event 5 is close to certain. Not events 1–3: he declined four straight guaranteed practice offers first, then bought the system's best card on the early window's last day. |
| runs/andrew-4.json | v9 | **zero** | $22.59M, 6 wins, rank 8 (the stars and the budget working — SHOP-SUPPLY prediction 1's 5–8 win band, hit). Replays under v10 with 5 no-ops. **Zero `PICK_WEEK` actions**: he never even armed a card. Fourteen straight Tee offs. |

By the letter (events 1–3) the prediction is 0-for-2 already; by spirit (a
legible early-window purchase) it is 1-for-2, and the second sample is not a
near miss — it is total non-engagement. **One more zero-week verified season
fires the falsifier**, and the named lever is DESIGN.md §8.2:

> *"A season-long resource that only goes up during play. Each event adds
> fatigue; majors add more; pro-ams add the most. High fatigue reduces max
> focus. Only Rest clears it. This is what stops 'just play every event' from
> being the dominant strategy."*

Designed, never shipped. This document is the decision made in advance, so
that if the trigger fires the answer is a build order with derived dials, not
a scramble — and if it doesn't fire, §5 says what standing down looks like.

The design constraints this proposal answers to: **P1** (the mechanic must
exist in the sport — it does; real pros genuinely cannot play every week, and
DESIGN.md §6.2 already commits to the shape: "Fatigue reduces max focus");
**P3/P6** (one sentence, taught by the picture and the number); **P8** (if it
touches the cone, the cone must show it); weeks stay a **choice** — the
failure mode is a scheduled rest chore; and the calibrated world (checks
$2.1M/$8.1M/$11.1M, mixed 38%, late win ~48%) survives or the proposal prices
its own re-derivation.

## 1. What the v10 world says before any fatigue exists

Two facts the probe measured on the way in, both worth having on the record:

- **The early window has thinned.** Range at event 2 measures **+$515k ±$237k,
  survival −2pp** against this baseline — down from the +$706k/+4pp the
  verdict's addendum printed, which was itself down from +$720k/+5pp. Three
  worlds (split purse, budget-6 shop, junk floor) have each shaved the door
  the redesign opened. Sign holds; the survival gain is gone. The practice
  options are still the menu's best cards and they are now roughly washes with
  small upside — which per the verdict's own §3.1 logic loses to the certain
  fun of playing. The measured world is drifting back toward the exact
  psychology that produced zero-week seasons.
- **"Play every event" is not merely psychologically dominant, it is
  structurally dominant**, exactly as the verdict said when it named fatigue
  the missing cost half. Nothing in the game charges the fourteenth straight
  week anything the thirteenth didn't cost.

## 2. The instrument

`fatigueprobe` is weekcheck's season (same offer-stream shopper, same stars
with the lagged three-cut band, same major drops, same paired seeds) with one
addition: a fatigue state the season carries. A counter accrues per played
event; any week taken — practice, fitting, lesson, sponsor signing, or a
synthetic pure `rest` with no other effect — clears it (the heal). Plans are
precommitted per row, so every EV below is a *blind* policy's; a human who
rests when tired and plays when fresh does better than these means, never
worse. Row vocabulary:

- **tax** — fatigue on, zero weeks taken, Δ vs the no-fatigue baseline. The
  price of the owner's exact behavior.
- **rest at N** — fatigue on, one pure skip at event N, Δ vs the *fatigued*
  zero-week season. Positive means resting beats playing through.
- **range at 2** — the existing early practice week under fatigue (it heals
  too), Δ vs the fatigued zero-week season.
- **rest at 5+10** — the chore check: if two scheduled rests measure clearly
  positive, fatigue has become a tax schedule and the shape is wrong.

Rest rows at events 10–13 are `[OFF MENU]` counterfactuals — the node is
silent there since the redesign — and they price whether fatigue should
reopen it.

## 3. Three shapes, measured

### 3.1 Shape A — the long season (max-focus erosion)

**One sentence (the P3 test):** "Too many weeks of golf in a row and you lose
a point of focus — majors count double — until you take a week off."
**The sport:** every pro who ever withdrew citing "a long stretch." It is the
sentence DESIGN.md §6.2 already wrote.
**Mechanism:** a counter of consecutive-played weeks (majors +2); at `t1`
notches the focus cap drops 1, at `t2` it drops 2. Any week off resets it.
Implementation-wise this is a second term in `focusPenaltyOf` — the
`sponsorContracts` pattern, already routed through startEvent, finishHole's
regen clamp and applyOutcome, and already rendered by the focus meter as pips
that never fill. The reducer diff is a counter, a heal in takeWeek, an
increment in settle.
**Where it surfaces:** the focus meter (a greyed pip with a "tired" label —
the picture); one line on the schedule screen: "Seven straight weeks — one
more and it costs you a focus point. A week off resets it" (the number).
**What a rest heals:** everything, immediately. Fresh is fresh.

Play-everything penalty timeline (majors 4/7/11/14 double):

| dials | −1 focus | −2 focus | tax (mixed) | tax (aggr) | surv |
|---|---|---|---|---|---|
| A1 t1=7 t2=13 | events 7–11 | 12–14 | −$2.05M ±$97k | −$1.87M ±$91k | 34% (−5pp) |
| **A2 t1=9 t2=15** | **events 8–12** | **13–14** | **−$1.34M ±$73k** | **−$1.38M ±$73k** | **36% (−2pp)** |
| A3 t1=5 t2=10 | events 5–8 | 9–14 | −$3.04M ±$124k | −$2.81M ±$114k | 28% (−10pp) |

The week rows, at the bracketing dials (mixed, Δ vs fatigued zero-week):

| plan | A1 | A2 | A3 |
|---|---|---|---|
| rest at 8 | +$675k ±$110k · −8pp | +$422k ±$109k · −8pp | +$1.03M ±$115k · −5pp |
| rest at 10 [off menu] | +$433k ±$104k · −1pp | +$211k ±$101k · −2pp | +$888k ±$110k · −1pp |
| rest at 13 [off menu] | −$153k ±$64k · +0pp | −$245k ±$65k · +0pp | −$126k ±$63k · +0pp |
| range at 2 | +$1.13M ±$252k · +2pp | **+$1.12M ±$246k · +1pp** | +$1.04M ±$265k · +5pp |
| rest at 5+10 (chore?) | −$174k ±$174k · −8pp | −$881k ±$174k · −10pp | **+$814k ±$176k · −3pp** |

A3 fails the chore check — two scheduled rests print clearly positive, which
is the mandatory-rest-week failure mode arriving. A1 is playable but its tax
(−5pp survival) sends the calibration bill past the ±2 honesty band. **A2 is
the shape at the right weight**: the zero-week purist pays −$1.34M and two
points; the player who takes the one week the draw already guarantees in
events 1–4 recovers almost all of it (+$1.12M, +1pp — net −$220k/−1pp against
today's world); a mid rest is a real gamble (gross-positive, −8pp against
check 2 — the danger-red confirm already prices it); two rests are dead; and
by construction events 1–7 replay identically for a zero-week log, so **the
spring rule and check 1's 44 stand untouched, digit for digit**.
Independent verification (seeds 900000+, N=400): tax −$1.40M ±$97k / −2pp,
range-at-2 +$1.03M ±$340k / +1pp, rest-13 −$176k, chore negative. Holds.

**Stars interaction:** fatigue lowers late trailing pace, the band (β=0.8)
chases pace, so the stars ease a fraction as the player tires — the tax rows
already contain that cushion. The −2 window (events 13–14) lands after the
last check: it taxes the title, never the card.
**Footprint:** one `GameState` counter + one term in `focusPenaltyOf`;
SAVE_VERSION 11; the focus meter needs one new pip glyph; one schedule-screen
line; one deck.test regression (play 8, lose a pip; rest, get it back) and a
stars-test-style lock on events 1–7 replay identity.

### 3.2 Shape B — the loose swing (cone drift)

**One sentence:** "Every event past your fourth in a row widens every cone
3% — a week off makes you sharp again."
**The sport:** the swing gets loose when you're tired; real. **P8 for free:**
it rides the `_s` sharpness channel (`sharpness × practice × fatigue`), so the
cone the player is shown IS the mechanic, and the schedule screen's
"×1.18 your cones" line updates automatically — this is the most legible
shape on paper.

| dials | drift at ev 8 / 11 / 14 | tax (mixed) | surv |
|---|---|---|---|
| B1 grace=4 ×1.03 | ×1.09 / ×1.19 / ×1.30 | −$1.22M ±$114k | 36% (−3pp) |
| B2 grace=5 ×1.02 | ×1.04 / ×1.10 / ×1.17 | −$546k ±$88k | 37% (−1pp) |
| B3 grace=3 ×1.04 | ×1.17 / ×1.31 / ×1.48 | −$2.19M ±$132k | 32% (−6pp) |

| plan | B1 | B2 | B3 |
|---|---|---|---|
| rest at 8 | +$110k ±$112k · −10pp | −$431k ±$105k · −10pp | +$722k ±$108k · −7pp |
| rest at 10 [off menu] | −$91k ±$102k · −1pp | −$426k ±$96k · −2pp | +$540k ±$106k · −0pp |
| rest at 13 [off menu] | −$674k ±$61k · +0pp | −$852k ±$61k · +0pp | −$371k ±$63k · +0pp |
| range at 2 | +$1.12M ±$246k · +2pp | +$792k ±$241k · −1pp | +$1.59M ±$259k · +3pp |
| rest at 5+10 | −$1.00M ±$168k · −10pp | −$1.68M ±$168k · −12pp | −$33k ±$176k · −6pp |

**The measurement kills this shape's middle.** At the gentle dial (B2) nothing
heals profitably — every rest row is negative — so fatigue degenerates into a
pure tax that creates no decision at all, the worst of both worlds. At B1 only
the early week answers; a rest never pays once the drift has compounded,
because the heal arrives too late to buy back the events already played wider.
And structurally it fights two shipped systems: it double-taxes events 10–14
exactly where the marquee ramp just landed (the late win rate was calibrated
to 48% this morning), and it runs the season's one progression promise —
cones ×1.40 → ×0.80 — backwards in September (×0.80 × 1.30 ≈ ×1.04 reads as
"you got worse all year"). Beautiful surface, wrong bones. Not recommended.

### 3.3 Shape C — heavy legs (momentum stops)

**One sentence:** "Past your Nth straight week, momentum is gone — good holes
stop refunding the extra focus until you rest."
**The sport:** the tired player who can't get anything going. **Mechanism:**
while tired, `focusRegen`'s par-or-better branch never fires.

| dials | tired from | tax (mixed) | surv |
|---|---|---|---|
| C1 streak≥6 | event 7 | −$4.06M ±$118k | 24% (−14pp) |
| C2 streak≥8 | event 9 | −$2.48M ±$84k | 34% (−4pp) |

| plan | C1 | C2 |
|---|---|---|
| rest at 8 | +$2.18M ±$109k · −3pp | +$1.56M ±$104k · −6pp |
| rest at 10 [off menu] | +$1.43M ±$100k · −1pp | +$1.28M ±$98k · −1pp |
| rest at 13 [off menu] | −$95k ±$60k · +0pp | −$194k ±$61k · +0pp |
| range at 2 | +$2.06M ±$259k · +10pp | +$1.07M ±$251k · +2pp |
| rest at 5+10 | **+$1.84M ±$171k · +1pp** | +$255k ±$171k · −9pp |

Momentum is worth vastly more than its one pip per hole suggests — it IS the
focus economy's engine ("momentum regen made every season richer", the 25 Aug
re-anchor). Turning it off is a sledgehammer: C1 is a −$4M catastrophe where
scheduled double-resting prints +$1.84M *with a survival gain* — the
mandatory-chore failure mode, fully arrived. C2 is survivable but still the
heaviest tax per pp of any shape here, and it has two disqualifying
interactions: it silently zeroes two purchased SKUs (Clean Slate and Short
Memory are `momentumSlack` — dead goods while tired, which is sticker decay
of owned equipment by another name, the thing the rentals verdict banned), and
its UI story is the weakest — the mechanic surfaces as an *absence* (a log
line that stops appearing), which fails P6's teach-by-the-picture test. Not
recommended.

## 4. What the measurement teaches, across all shapes

1. **No shape makes rest mandatory, because the Money List already forbids
   it.** Every mid-season rest is a loan against the checks: gross-positive,
   survival-negative (−5 to −10pp — the forfeit lands right before check 2).
   The fear the constraint named — "mandatory rest week" — cannot happen in
   this economy unless the dials are absurd (A3, C1). The checks are the
   chore-repellent, for free.
2. **The early practice window is the natural heal, and fatigue is what makes
   it matter again.** Under every sane config, range-at-2 roughly doubles
   ($515k → $1.0–1.1M) and its survival sign recovers, because the week the
   redesign already sells in events 1–4 quietly becomes the season's fatigue
   answer too. Fatigue does not need a new card to work — it makes the
   existing cards true. The verdict's registered prediction gets a second
   engine.
3. **Fatigue creates a price, not a puzzle.** One well-placed week claws back
   most but not all of the tax (A2: net −$220k vs today). There is no plan
   that beats today's world — fatigue is a cost, honestly — but the *gap*
   between the player who never rests and the player who rests once is
   ~$1.1M and a survival point, which is exactly "the schedule is a real
   decision" priced in this economy's units.
4. **The late node stays quiet, now with a measured reason.** Rest at 13
   (post-check-3, pre-finale — the romantic "freshen up for the Tour
   Championship" week) measures −$126k to −$852k across every config. Even
   dead tired, the finale's cheque beats the freshness. Do not reopen
   WEEKS_END_AT; update its comment to say a rest card was priced and lost.
   (At A1-weight dials rest-at-10 turns real (+$433k/−1pp); if the owner ever
   wants a live late-season rest decision, that is the dial that buys it and
   −5pp of baseline survival is the price.)

## 5. The do-nothing option, honestly

The falsifier has fired once in at most two samples, and the second sample has
a reading the verdict never priced: **the printed trade may simply be false
for the owner.** EVENT_YIELDS are population means over a 38%-survival
shopper. The ledger says the owner wins 6–10 events a season; his forfeit for
any skipped week is a top-3 cheque distribution — a win pays $1.53M solo,
~$1.22M at the modal 2-way split, ~4× the $300k the schedule screen prints at
event 2. The fitting he took at event 5 forfeited *his* event, not the mean
player's, and he went back to playing everything the next season. Zero-week
seasons at his strength may be the correct reading of the game as shipped —
mastery pricing itself out of a subsystem is a thing roguelikes are allowed to
contain, and the weeks system post-redesign is honest about its window in a
way it never was before. Do-nothing costs nothing NOW.

What do-nothing cannot do is make DESIGN §8.2's sentence true — the schedule
never becomes a decision, and the intro's fiction ("the season grinds") stays
unshipped. **Evidence that would settle it, named in advance:**

1. **A third verified season.** Zero weeks again → the falsifier's own terms
   say the lever is fatigue; this document is the lever, pre-priced.
2. **An owner-strength weekcheck row** (KIT/policy dialed to a ~6-win bot):
   if the early practice options measure negative *at his strength*, then his
   behavior is optimal, the falsifier was aimed at the wrong population, and
   fatigue should be argued on fiction and schedule-decision grounds only —
   not as a fix for him.
3. **PICK_WEEK archaeology in future bundles**: armed-then-cancelled cards
   would show the screen tempting him and losing on the merits; zero arms
   (andrew-4's actual reading) shows the system isn't reaching consideration
   at all — which no amount of pricing fixes, and fatigue does.

## 6. Recommendation

**Ship Shape A at the A2 point — if and only if the trigger fires (§7).**
Fatigue as max-focus erosion: majors count double, first pip at 9 notches,
second at 15, any week off resets it. It is the shape DESIGN §6.2 already
promised, the shape with the smallest reducer diff (a counter beside
`sponsorContracts`, one term in `focusPenaltyOf`), the shape whose UI already
half-exists (the meter's never-filling pip), and the only shape that passed
tax-modest / early-window-doubled / chore-dead / ordering-intact simultaneously.

**Parameter derivation plan for the build session** (do not trust this
document's dials blind — the world will have moved again):

1. Promote the model into weekcheck behind knobs (`FAT`, `T1`, `T2`, `MAJX`),
   the way stars were promoted — the scratchpad probe dies with this pass.
2. Sweep t1 ∈ {8, 9, 10} × t2 ∈ {14, 15, 16} × majorExtra ∈ {0, 1} at N=400,
   then the finalist at N=800, seeds 800000+ and a 900000+ confirm.
   **Acceptance bars, registered now:** zero-week tax in −$1.0M to −$1.6M with
   survival −2pp or better; range-at-2 ≥ +$900k with survival ≥ +0pp;
   rest-5+10 negative by ≥ 2 s.e.; mixed ≥ aggressive preserved; events 1–7
   replay-identical for zero-week logs (the spring rule's fatigue edition).
3. **The calibration bill, priced:** MONEY_CHECKS **stand** — −2pp is inside
   the ±2 the bars are honest to, and check 1 is untouched by construction
   (this is most of why A2 gets the seat over A1). EVENT_YIELDS re-measured
   (YIELDS=1, N=1000) since the zero-week baseline moves and the schedule
   screen must keep telling the truth; note in weeks.ts that the yields are
   now fresh-player figures. The full weekcheck option matrix re-run
   (CALIBRATION-2 standing verdict 3 already ordered this). SAVE_VERSION →
   next (fatigue changes replay); runs/verified.json frozen rows untouched.
   shopcheck's zero-week shopper keeps a `FAT=0` escape hatch for
   archaeology.
4. **Menu semantics:** every current week option heals — a week off your feet
   is a week off your feet, including the sponsor's photoshoot. One exception,
   from §8.2's own fiction: **Corporate day does not heal** (pro-ams add the
   most; you played eighteen holes with four men from a paper company). One
   clause on its cost line: "…and it is not a rest." Unmeasured (no bot plan
   takes it as rest) — flagged, low stakes, and it gives the menu's weakest
   card a sharp identity instead of a dead one. No new Rest card anywhere:
   early it would be strictly dominated by range (a menu with a dominated
   card teaches distrust — the sponsor lesson), and late it measured a loser
   at every config (§4.4).
5. **UI:** greyed "tired" pip(s) on both focus meters; one schedule-screen
   line naming the streak and the next threshold, styled like the yields line
   (a number, then the word); the withdrawal confirm gains one clause when
   tired ("…and a week off resets your legs"). The cone is untouched — this
   shape never lies to P8 because it never touches dispersion.

**Registered predictions for the shipped world, specific enough to be wrong:**

1. Post-ship weekcheck: zero-week mixed baseline lands $13.9–14.3M gross,
   36 ±1% survival; kills stay 44/x/y with check 1 at 44 exactly.
2. Range-at-2 prints +$0.9M–$1.4M with survival −1pp to +3pp; the lesson and
   fitting rows keep GOOD DEAL verdicts; the sponsor stays the menu's worst
   card at every timing.
3. Rest-5+10 prints negative; no two-week plan beats the best one-week plan.
4. The owner's next season takes ≥1 week. If he takes zero AND still wins
   6+, prediction 4 fails in the interesting direction: his conditional
   yields beat even a −1/−2 focus late season, §5-2's owner-strength row
   becomes mandatory before any dial is raised, and the dials must NOT be
   raised to chase him — A3 and C1 are the measured pictures of what
   chasing him does to everyone else (28%/24% survival).

## 7. The decision, pre-armed

**IF** the next verified season posts `WEEKS taken: none` (the falsifier's
own terms) **THEN** the build order is §6 as written — Shape A, A2-derived
dials, acceptance bars registered above, expected cost one session.
**IF** it posts one week or more, nothing ships: §5 governs, the falsifier
re-arms for the season after, and the only follow-up is the owner-strength
weekcheck row, so that the next version of this argument is about the right
player. Either way, nobody scrambles.

---

*Caveats the numbers carry: precommitted plans (a human who rests on state
beats every mean above); the probe's shopper skips the shop visit after any
sat-out week, mirroring reducer stock(); rest rows at 10–13 are off-menu
counterfactuals; the A2 chore row's −$881k and A1's −$174k differ mostly in
where the −1 window lands relative to the two rests — the chore verdict is
about sign, not magnitude. The v10 world these numbers describe was one
uncommitted session old at measurement time; the build session must re-run,
not quote.*
