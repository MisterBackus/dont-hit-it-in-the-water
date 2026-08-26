# FIELD CEILING — the parade, named and priced

**26 Aug 2026 · proposal with predictions registered before measurement**

## 1. The parade, in one sentence

**The field's skill ceiling is pinned at 0.85 from the first tee shot of spring
to the last putt of the finale, and by event 8 the only human who has ever
finished a season is lapping it.** FIELD RESPONSE raised the floor
(FIELD-RESPONSE.md, F = 0.30) and the squeeze turned around — the CUT works
now. The WIN does not. The player improves all season on four axes —
sharpness ×1.40→×0.80, equipment including four free premium drops, deck
thinning and swaps, and their own hands — and the best player on tour is
frozen at spring form forever (`makeField`, sim/resolve/field.ts: skill
uniform on [0.25 + lift, **0.85**], the 0.85 never moves).

Evidence, from the only population that matters:

1. **runstats replay** (runs/andrew-2.json; andrew.json is a v5 save the
   current replayer skips): 12 cuts made of 14, **10 wins** — the player wins
   **83% of the weekends they play**. Average rel on made cuts: −8.0 at
   Rockdale, −9.0 at Bracken Ridge and Meadowlark, −11.0 at Cottonwood,
   −12.0 at Palmetto. Late season is −8 to −12 over eight holes.
2. **The winner-gap probe** (§2, run tonight against the live
   `makeField`/`advanceField`, Pine Hollow pars, N = 3000 fields): at the
   finale (F = 0.30) the field's winner averages **−3.21**, tenth percentile
   −4, and posts −8 or better **0.0%** of the time. A −10 player does not
   win the finale; they attend it.
3. **Check 3 cannot bite** (season.ts provenance, FIELD-RESPONSE §7): kill
   ~1% against 14% intent, and no bar inside the win-pays-the-final-leg
   invariant buys more, because the equipped survivor's late cheques are
   uncontested. The escape clause has been pointing at equipment decay; §4
   below prices that dial honestly and finds it worse than its reputation.

So: wins stop meaning anything around event 8, the finale is a parade, and
the Money List's last check is a formality. P7 says par stops being enough.
It worked. Now **−6 has to stop being enough**, and there is no dial for
that yet.

## 2. The arithmetic that disqualifies half the options before fiction starts

The probe (reproduce as a fieldcheck section, §7 step 1 — methodology: real
`makeField`/`advanceField`, Pine Hollow's par sequence, no courseShift,
N = 3000 fields, seed 13371337; "ceil c" linearly remaps the finale band
[0.55, 0.85] onto [0.55, c]; "k elites @e" promotes the k highest drawn
skills to e after the draw, call count untouched):

```
winner of the 71 over 8 holes                 mean   p10   p50  %≤−6  %≤−8   field median
spring  F=0     ceil .85                     −2.84    −4    −3   0.2   0.0    +0.85
finale  F=.30   ceil .85   (live)            −3.21    −4    −3   0.3   0.0    −0.01
finale  F=.30   ceil .95                     −3.71    −5    −4   1.4   0.0    −0.15
finale  F=.30   ceil 1.05                    −4.24    −5    −4   5.1   0.0    −0.63
finale  F=.30   ceil 1.15                    −4.75    −6    −5  14.3   0.0    −0.94
finale  F=.30   4 elites @1.0                −3.54    −5    −3   1.2   0.0    −0.01
finale  F=.30   4 elites @1.2                −4.38    −6    −4  11.4   0.0    −0.01
finale  F=.30   4 elites @1.4                −5.51    −7    −5  49.6   1.7    −0.01
finale  F=.30   4 elites @1.6                −6.62    −8    −7  91.5  13.8    −0.01
```

Two facts fall out, and they decide the shape of the fix:

1. **A ceiling rise cannot chase this player.** Even at ceil 1.15 — a value
   the `skill: 0..1` contract does not even permit — the winner's mean is
   −4.75 and −8 is never posted. The bias mapping is the wall behind the
   wall: `bias = 0.20 + skill·0.42`, birdie needs `roll < bias − 0.30`, and
   the triangular roll caps the birdie rate near 20% at skill 1.0
   (expected −1.74 per 8 holes; even skill 1.6 expects only −5.34). The
   whole distribution can be inflated and it still loses to a human
   averaging a birdie a hole.
2. **A small promoted tier reaches the player without moving the field.**
   Four elites at an effective 1.4–1.6 put the winner at −5.5 to −6.6 with a
   real −8 tail — competitive with a strong human's ordinary week — while
   the **field median does not move at all** (−0.01 in every elite row).
   The median is what the cut, the fieldShift coupling (fieldcheck's
   per-course deltas), and every calibrated number downstream actually
   read. A tier is surgery; a ceiling rise is a transfusion.

Effective skills above 1.0 are the probe's shorthand. Shipping this does not
mean breaking the 0..1 contract: the elite carries its own bias term in
`advanceField` (a per-player `eliteEdge` added where courseShift is
subtracted), and skill keeps meaning what it means for the other 67.

## 3. Option 1 — CEILING RISE: the mirror of the floor

**Mechanism.** `skill ~ uniform(0.25 + lift, 0.85 + rise(event))`, `rise`
carried next to `fieldStrength` on EventSpec, derived by cutcheck sweep the
way F was.

**Fiction.** "The contenders peak for the playoffs." Real, and it is the
symmetric twin of the floor story, which is its charm.

**Predicted effects.**
- *(a) Late-season win rate, strong player:* barely moves. §2 is the whole
  argument: at any rise the mapping permits, the winner cannot post −8, so
  the −9-to−12 human keeps ~80% of their weekends. **The option fails at
  the exact thing it exists for.**
- *(b) Check-3 kill:* 1% → maybe 2–3%. Mid-pack finishes get a few places
  worse (the block between you and the winner thickens), shaving perhaps
  $1M off a late season — noise against a $3M median cushion over the bar.
- *(c) Make-cut squeeze:* deepens honestly — the whole band above the floor
  lifts, so late mixed make-cut drops several points (predict 56 → mid-40s
  at rise ≈ 0.20 by the finale) with the early season protected by ramping
  rise like fieldStrength. Shape stays a declining squeeze.
- *Instrument:* cutcheck sweep over rise (a CEIL env alongside FSCALE),
  then the full shopcheck re-derivation, then — the hidden bill — a
  fieldcheck re-baseline, because the F = 0.15 coupling baseline the ten
  fieldShift values were measured against changes when the distribution
  does.

**The texture interaction the floor already bought.** Floor 0.55 plus a
rising ceiling makes the finale field uniform-elite: nobody worse than a
scratch tour pro, everybody a plausible winner. The probe shows the board
stretching downward as a block (median −0.63 at ceil 1.05, −0.94 at 1.15).
Seventy-one plausible winners is zero memorable ones — the leaderboard
becomes anonymous noise separated by luck, the exact opposite of "you meet
the same winners, through a thicker crowd," which is the fiction
FIELD-RESPONSE §3 committed to and the intro screen sells. And your −2,
which read 15th in June, reads 40th in October *against nameless clones*,
which feels like the game cheating rather than the tour being good.

**Verdict: rejected.** It cannot reach the player (arithmetic), it wrecks
the board's texture (design), and it forces a ten-course recoupling
(economy of effort). Kept honest here so nobody proposes it again without
new arithmetic.

## 4. Option 2 — BOOST DECAY: the named dial, finally priced

**Mechanism.** Two variants. *(i) Per-event decay:* every owned boost's
effect drifts toward null by λ per event owned. *(ii) Worn grips:* effects
lose a visible step at fixed season stages (say events 6 and 10), two pips
a season, printed on the item.

**Fiction.** Grips wear, balls scuff, the yardage book goes stale. True to
golf, and it is the dial FIELD-RESPONSE §4 and §7 explicitly reserved for
exactly this residual.

**Predicted effects.**
- *(a) Late-season win rate, strong player:* falls, but by nerfing the
  player, not raising anybody. At the λ that matters (below), the late kit
  is ~60% of its sticker; the player's pace decays from −9 toward −5
  against the same −3.2 field winner. Win rate maybe 80% → 45%. The finale
  gets closer because *you got worse*, which every playtest of every game
  with this dial reports as the worst feeling in games.
- *(b) Check-3 kill:* this is the one thing decay genuinely buys.
  Equipment is most of a late season's gross (the drops alone are worth 21
  points of survival — shop.ts; median shopper $19.6M vs a bare season in
  the single millions), so shopcheck's sweep (a DECAY env) will find a λ
  hitting 14%. **Predict λ ≈ 5%/event — a spring purchase down ~40% by the
  finale — is what 14% costs**, because the arrivals sit ~$3M over the bar
  and the bar cannot rise (the invariant caps it), so the distribution has
  to come down to the bar.
- *(c) Make-cut squeeze:* deepens from the player's side (late mixed
  predict 56 → high-40s); shape preserved; early season untouched (nothing
  owned yet to decay).
- *Instrument:* shopcheck sweep over λ, kill-rate target. But note what
  else it drags: **every boost price is derived as 1.4–2.5× return over
  the ownership window** (shop.ts), and decay makes value a function of
  purchase date — the whole shelf reprices, the premium-drop tier line
  moves, and the mid-band-absorbs-everything bonus (FIELD-RESPONSE §6) is
  spent for good.

**The honest cost, quantified.** The decay a player forgives and the decay
check 3 needs are different numbers by roughly 3×. One visible worn pip —
call it 10–15% of an effect, announced on the card, telegraphed a week
ahead — reads as texture. Forty percent of an $8M kit evaporating reads as
theft, and it is theft *by the game's own bookkeeping*: these prices are
advertised as measured value, and the sticker becomes a lie the player can
measure. Variant (ii) softens the reading, not the arithmetic — two pips
that matter enough to buy 14% kill are two thefts on a schedule.

**Verdict: hold, in reserve, reframed.** If equipment compression is ever
needed *on top of* the recommendation, do it as honest rentals — new
consumable SKUs that SAY they expire ("Fresh Grips: three events") priced
on their window — rather than decay of owned goods. Decay of owned goods is
the correct dial only in the world where §5 fails, and §8 registers that
escape hatch explicitly.

## 5. Option 3 — THE ELITE TIER: three names that keep pace

**Mechanism.** The run carries 3–4 **named stars** drawn once per run from
a small hand-written canon roster (content/players.ts gains a `STARS` list;
per-run subset by `hash(seed, salt 7)`, a one-shot derived stream like the
schedule's — no bank stream perturbed). Each week, after `makeField` draws
its 71 exactly as today, the k highest-skill draws are **overlaid**: they
take the star names, and they take an `eliteEdge` bias bonus in
`advanceField`. Draw count and roll count are untouched — still three
draws per accepted player in `makeField`, still exactly two rolls per live
player per hole — so the determinism suite and the clubhouse board's
replayed proofs pass without knowing anything happened.

`eliteEdge` is where the rubber band lives: it tracks the **player's
measured pace** — trailing mean rel over their last three made cuts, a
pure function of run state, deterministic under replay — mapped so the
stars run at roughly 0.8× the player's sub-par pace, never more, floored
at ordinary top-of-field form and capped (§6). A player at −10 sees stars
expecting ~−8; a player grinding at −2 sees the same stars at spring form.

**Fiction.** Every tour has its stars, and this game's tour has never had
one — 71 anonymous names re-rolled weekly. Three persistent names that sit
at the top of the board all season ARE the "same winners, thicker crowd"
story FIELD-RESPONSE told; this makes it literally true on screen. It also
seeds rivalry content for free: a name that beats you at the PGA and shows
up at the Tour Championship is a rival the moment the UI does nothing but
keep printing it.

**Predicted effects.**
- *(a) Late-season win rate, strong player:* the target dial. At elite
  effective ~1.4–1.6 (probe rows), the best of 3–4 stars posts −7/−8
  regularly; a −9-pace player wins the weeks they are hot and loses the −6
  weeks. **Predict 83% of weekends → 45–60%, concentrated late; roughly 4–6
  wins a season instead of 10.** Wins become the story of beating a name.
- *(b) Check-3 kill:* the stars eat cheques. Payout is `purse·0.17/place^0.75`:
  a $9M win is $1.53M against $910k for 2nd and $672k for 3rd; a $20M major
  win is $3.4M against $2.02M. Losing half of events 10–12's wins to the
  stars takes ~$1.5–2.5M off the marginal survivor's gross by the check —
  and unlike option 1's thin haircut this lands **exactly on the win-heavy
  players check 3 is supposed to test**. Predict the re-derived bar reaches
  **8–14% kill inside the invariant**, and note the bar itself may come
  DOWN (win-eating thins the top of the distribution — the wall's
  signature unwinding, third appearance).
- *(c) Make-cut squeeze:* the median is untouched (probe), so the shape
  survives whole; the stars reliably occupy 3–4 of the top places, so the
  effective N tightens by ~3 exactly where N is smallest. Predict the
  declining mixed curve keeps its shape with the tail deepening ~4–6 points
  (finale 56 → ~50), events 1–4 **digit-identical in scoring** — see the
  spring rule in §6.
- *Instrument:* cutcheck (shape guard) and shopcheck (win rate, kill) grow
  an ELITE env the way they grew FSCALE and KIT; the §2 winner-gap table
  becomes a permanent fieldcheck section. §7 has the sweep order.

**The risks, named.** *Rubber-banding punishes improvement* — the classic
failure. Guards: the band only ever pulls stars UP from a stage baseline
(never down below it, never the other 67 players at all), it is capped, it
follows with a lag (trailing three made cuts), and it targets 0.8× — the
stars chase, they do not match. A collapsing player sees the stars relax
toward baseline, never dip below spring form, so there is no death spiral.
*Visibility* — a rubber band the player catches feels like an insult.
Here the fiction covers it: form is what golf stars visibly have, the lag
makes it read as "he's peaking too," and the floor/cap mean the number is
never absurd. *Honesty* — FIELD-RESPONSE rejected bias scaling as "the
whole tour secretly improving." Three named players finding form is not
the whole tour, and it is the most true-to-sport sentence in this
document: the best players peak for the biggest weeks.

## 6. Option 4 — THE MARQUEE RAMP: option 3 with its spine straightened (recommended)

Pure rubber-banding makes the stars a mirror; pure scheduling makes them a
wall that cannot chase an outlier $8M kit — and the outlier kit is the
evidenced problem. The recommendation is the hybrid, one mechanism with
two terms:

```
eliteEdge(event) = ramp(stage) + band
  ramp: 0 through event 4, then rising to R by event 14   (same for every run — the honest part)
  band: clamp(0, β · excessPace, CAP)                     (the chase — bounded, lagged, upward-only)
```

- **Spring is names only.** Through event 4, `eliteEdge = 0`: the stars are
  just names painted on the week's top skill draws. Scoring digits are
  identical to today at events 1–4 — the early season is untouched by
  construction, not by hope — and the player meets the names while the
  names are merely good, which is what makes their October form legible.
- **The ramp is the season's story**, derived once by sweep and identical
  for every run: the tour's best peak for the playoffs whether you are
  great or struggling. It carries the finale on its own for an ordinary
  player (winner mean ~−5.5 at ramp-equivalent 1.4 — "reachable but not
  comfortable," §3.4c's own words).
- **The band is for andrew**: the measured −8-to−12 player gets chased at
  0.8× pace up to CAP. Bounded, deterministic, replay-safe, invisible for
  ordinary players (for whom excessPace ≈ 0 and the ramp is everything).

Everything in option 3's mechanism, fiction, determinism story, and risk
guards carries over unchanged; predictions (a)–(c) are option 3's, with
the addition that a *median* player's finale win chance lands near 1-in-3
from the ramp alone.

## 7. Parameter derivation plan — the sweeps, in order, ending in ONE re-derivation

1. **Promote the probe.** The §2 winner-gap table becomes a section of
   fieldcheck (it owns "does the field behave"); ELITE env knobs land in
   cutcheck and shopcheck beside FSCALE/KIT. No number ships from a
   scratchpad — house law.
2. **Sweep A — the ramp and k** (cutcheck + fieldcheck winner-gap; k ∈
   {3, 4}, finale ramp-equivalent ∈ {1.2, 1.4, 1.6}). Targets: finale
   winner mean −5.5 ± 0.5 at kit ×1; mixed make-cut curve still declines
   with finale ≥ ~48%; events 1–4 scoring digit-identical (spring rule).
3. **Sweep B — the band** (shopcheck with the shopper + drops modeled;
   β ∈ {0, 0.4, 0.8}, CAP ∈ {+0.2, +0.3} in skill-equivalent). Targets:
   median shopper's late-season (events 10–14) win rate ≤ 40% from ~80%;
   a −9-pace season keeps ~half its hot weeks; no configuration where the
   stars outrun the player's own trailing pace.
4. **THE ONE FINAL RE-DERIVATION — runs once, last, after k/ramp/β/CAP are
   frozen.** A single shopcheck session, because every number below reads
   the same earnings distribution and re-deriving them piecemeal is how
   thresholds churned all August:
   - **MONEY_CHECKS sweep** toward the 41% / 29% / 14% intent. Predict
     checks 1–2 bars within noise of $2.3M/$10.0M and **check 3's bar at
     or below $13.3M finally buying ≥ 10% kill** — if the third number
     moves, it moves DOWN, which is how we will know the wall unwound
     rather than relocated.
   - **SHARE=1 re-measure** of the SHARE array and the LADDER's
     20th-place anchor (star cheques shift the late medians down).
   - **Boost band check** against 1.4–2.5×. Predict mid-band pricing
     absorbs the tier (win-eating trims every boost's return roughly
     proportionally); budget for ≤ 2 repricings if the tails slip out.
   - **fieldcheck confirm**: all ten per-course deltas still within ±0.1
     — predicted untouched, since the tier is course-blind and the median
     never moved, but the coupling is load-bearing and gets its receipt.
   Then provenance: season.ts, DESIGN.md §3.2 and §3.4c (whose "the field
   no longer improves across the season, and does not need to" was true
   about the CUT and is now measured false about the WIN), and this
   file's §8 with measured-vs-predicted.

Determinism throughout: the field stream's call sequence is untouched, the
star roster is a one-shot salted hash, `eliteEdge` is a pure function of
event number and replayable state — the determinism suite and the board's
replay verification must pass with no test edited.

## 8. Predictions registered, and the escape clause

1. Late-season win rate for the evidenced strong player: **83% → 45–60%**
   of weekends played; seasons land at 4–6 wins, and at least one loss a
   season is to a star posting −8 or better.
2. Check 3 kills **≥ 10%** of arrivals at a bar no higher than $13.3M —
   the first time in the project's history that sentence has been
   writable. If the sweep tops out at 8–9%, that is within one re-sweep of
   intent and the intent number gets the argument, not the mechanism.
3. The make-cut squeeze keeps its declining shape; finale mixed lands
   48–52%; events 1–4 are digit-identical.
4. The finale: a median surviving player wins ~1 in 3, and the winner's
   name is a star's often enough that beating them is the run's boss
   fight. The board reads: three names you know, a crowd you don't, you.

**If prediction 2 fails** — if even star cheque-eating cannot make check 3
bite inside the invariant — then the residual truly is raw equipment
over-supply, not uncontested wins, and the next dial is the honest-rental
reframe of §4 (consumable SKUs priced on their window), never sticker
decay of owned goods, and never a fourth threshold raise: three
re-anchorings in two days is the wall telling us bars were the wrong tool,
and this file exists so we stop reaching for them.

## SHIPPED — 26 Aug 2026, the marquee ramp built, swept, and measured

Option 4 is in. `content/players.ts` carries the canon roster (Cyrus Vail,
Angel Maravilla, Harlan Boone, Kaz Ito) and the four dials;
`sim/resolve/field.ts` carries the mechanism (`starNamesFor` salt 7,
`starTarget`, `overlayStars`, `eliteEdge` in `advanceField`'s bias exactly
where courseShift is subtracted); `GameState.recentCutRels` is the band's
lagged three-cut window. The spring rule is locked by test
(`sim/stars.test.ts`): events 1–4 replay digit-identical against a field
snapshot captured from the pre-stars build, stars painted on. SAVE_VERSION
stays 7 — nothing v7 had shipped when this landed. The §2 probe is now a
permanent fieldcheck section (WINNER GAP), and cutcheck/shopcheck grew
STARS/K/RAMP/BETA/CAP knobs beside FSCALE/KIT, per §7 step 1.

`starTarget` is the probe's own language — an effective-skill target, a
star plays at max(own draw, target): ramp = 0.85 → R linearly over events
5–14, identical every run; band = clamp(0, skillForPace(β·pace) − ramp,
CAP), pace = trailing mean rel over the player's last three made cuts,
converted at the probe's measured six strokes per skill unit. β < 1 means
the chase can never outrun the player's own trailing pace by construction;
the CAP bounds it; the ramp is the floor it relaxes to.

### Sweep A — k and R (registered BEFORE running, 26 Aug 2026)

Predictions: the promoted probe reproduces §2's elite rows within noise —
4 stars @1.4 puts the finale winner mean at **−5.5 ± 0.2** (the −5.5 ± 0.5
target lands at k=4, R=1.4, with k=3 @1.4 a quarter-stroke shallower and
R=1.2/1.6 bracketing at roughly −4.6/−6.6); the field median stays within
0.05 of the no-stars row in every cell. cutcheck at kit ×1: events 1–4
make-cut DIGIT-IDENTICAL to the stars-off run; the mixed curve keeps its
declining shape with the finale easing from 56 to **~50** (inside the
48–52 guard) and mid-season within ~2 points of today.

### Sweep A — measured (fieldcheck WINNERGAP=only GRID=1 · cutcheck N=400 kit ×1)

The promoted probe reproduces §2 EXACTLY — the overlay is the probe's
semantics, digit for digit (4@1.4 → −5.51/49.6/1.7, 4@1.6 → −6.62/91.5/13.8,
spring −2.84, finale-no-stars −3.21), and the field median reads −0.01 in
every star cell, unmoved to the second decimal:

```
winner of the 71 over 8 holes                 mean   p10   p50  %≤−6  %≤−8   field med
finale  F=.30   3 stars @1.20                −4.20    −5    −4   9.0   0.0    −0.01
finale  F=.30   3 stars @1.40                −5.28    −7    −5  40.7   1.2    −0.01
finale  F=.30   3 stars @1.60                −6.39    −8    −6  83.9  10.5    −0.01
finale  F=.30   4 stars @1.20                −4.38    −6    −4  11.4   0.0    −0.01
finale  F=.30   4 stars @1.40                −5.51    −7    −5  49.6   1.7    −0.01
finale  F=.30   4 stars @1.60                −6.62    −8    −7  91.5  13.8    −0.01
```

**Chosen: k = 4, R = 1.4** — winner mean −5.51, dead on the −5.5 ± 0.5
target, with a real −8 tail (p10 −7, 1.7% ≤ −8 before the band wakes).
cutcheck mixed, live ADVANCE, stars off → on:

```
off  90 70 66 59 61 82 50 64 71 64 62 63 57 52   overall 65%
on   90 70 66 59 61 82 50 64 70 63 60 61 54 49   overall 64%
```

Events 1–4 digit-identical (90 70 66 59, across all three policies and all
four candidate curves) — the spring rule, measured as well as tested. Declining shape intact; the tail deepens exactly where N is small
(−2 to −3 points over events 9–13), finale 52 → **49**, at the floor of the
48–52 guard. Prediction said 56 → ~50 from the stale slice-4 series; the
current stars-off instrument reads 52, so the DELTA (−3) is the honest
measurement and it landed as predicted. Safe (39→38%) and aggressive
(62→61%) keep their shapes.

### Sweep B — β and CAP (registered BEFORE running, 26 Aug 2026)

Instrument: shopcheck WINS=1 — mixed shopper, drops modeled, the closest
harness to the evidenced 83%-of-weekends player. Predictions: stars OFF
the late-season (events 10–14) win rate measures **~75–85%** (the parade,
§1); at k=4 R=1.4 the ramp ALONE (β=0) drops it to **~45–55%**; β=0.8
CAP=0.3 lands it **≤ 45%**, with β=0.4 within a few points of β=0 (the
shopper's trailing pace only clears the ramp's own pace by a little, so
the band is a tail-insurance dial here, not the workhorse — it exists for
the −9-to−12 outlier the harness's median cannot reproduce). Hot weeks
(rel8 ≤ −8, events 10–14) stay won at **≥ ~50%** in every configuration;
the finale's win rate among players who make its cut lands near **1-in-3**
(0.25–0.45); and in no cell do the stars outrun the player's own trailing
pace (β < 1 and the CAP guarantee it by construction — the measure is the
receipt). Chosen dials expected: **β=0.8, CAP=0.3** unless β=0.8 drags
the hot-week retention under ~half, in which case β=0.4 gets the seat.

### Sweep B — measured (shopcheck WINS=1 · mixed shopper, drops modeled, 250 seasons)

```
                              all-season   ev 10–14   finale   hot(≤−8) 10–14   late losses to a star
stars OFF                        60%          86%       96%        100%              0%
k4 R1.4  β=0    (ramp alone)     47%          62%       70%        100%             98%
k4 R1.4  β=0.4  cap 0.3          47%          62%       70%        100%             98%
k4 R1.4  β=0.8  cap 0.2          41%          53%       58%        100%             99%
k4 R1.4  β=0.8  cap 0.3          40%          51%       57%        100%             99%
```

**Chosen: β = 0.8, CAP = 0.3.** As registered: β=0.4 is indistinguishable
from the ramp alone for this harness (its trailing pace barely clears the
ramp's own), so β is confirmed as the outlier dial and gets the strong
setting; hot weeks stayed won at 100% — a week the player posts −8 is
still THEIR week in every cell, which is the anti-rubber-band guarantee
measured (nothing outran the player's pace anywhere; β < 1 and the CAP
made it so by construction). Late-season win rate 86% → **51%**: inside
§8's registered 45–60 band, shy of §7's ≤ 40 stretch target — the stretch
assumed the band could press a shopper the way it presses a −9-to−12
outlier, and it cannot, because the shopper's trailing pace is ~−5, not
−10. The number that answers §1's parade is 86 → 51 with 99% of the
newly-lost weekends lost TO A NAME, which is the entire point: the wins
that disappeared did not evaporate, they moved to Vail, Maravilla, Boone
and Ito. All-season wins land at ~4.8 per season (40% of ~12 played) —
inside the registered 4–6.

Also observed for the calibration agent (NOT re-derived here, per §7.4):
at the live $2.3M/$10.0M/$13.3M triple the shopper's kills move
43/30/2 (stars off) → **43/49/3** — check 1 untouched (spring rule at
work), check 2 now far over its 29% intent, check 3 at 3% (up from ~1%,
still short of 14). The distribution thinned exactly where §5(b) said:
mid-to-late cheques. The MONEY_CHECKS re-sweep has real room to move load
from check 2's bar down onto check 3's — and the §8-2 prediction (the bar
moves DOWN if it moves) is now the calibration agent's to score.

### Shipped parameters

```
STARS       Cyrus Vail · Angel Maravilla · Harlan Boone · Kaz Ito   (content/players.ts)
STAR_COUNT  4        stars per run (whole canon; the salt-7 hash sets each run's pecking order)
STAR_RAMP_END 1.4    finale ramp-equivalent effective skill
STAR_BAND_BETA 0.8   fraction of trailing sub-par pace the band chases
STAR_BAND_CAP  0.3   skill-equivalent bound on the band above the ramp
quiet through event 4 · ramp linear 0.85→R over events 5–14 ·
pace↔skill at 6 strokes per skill unit (probe) · trailing = mean rel, last 3 made cuts
```

### §8 predictions — scored today where this instrument can score them

| § | registered | measured today | verdict |
|---|---|---|---|
| 1 | strong player 83% → 45–60% of weekends, 4–6 wins | closest harness (mixed shopper): late weekends 86% → 51%, ~4.8 wins/season; 99% of newly-lost weeks lost to a star | **in band** (the true −9-to−12 human's number arrives with the next runs/ replay) |
| 1b | ≥1 loss a season to a star posting −8 or better | not directly instrumented; at target 1.4–1.7 a star's ≤−8 tail is 1.7–13.8% per late event | open — score from live runs |
| 2 | check 3 ≥10% kill at bar ≤ $13.3M, bar moves DOWN if it moves | at live bars: 2% → 3%, check 2 30% → 49% (overkill = headroom) | **calibration agent's** — the re-sweep is §7.4, not this build |
| 3 | squeeze keeps declining shape, finale mixed 48–52, events 1–4 digit-identical | shape intact, finale 49, events 1–4 identical to the digit (and locked by test) | **hit** |
| 4 | finale ~1-in-3 for a median survivor, stars' names on the board | shopper wins 57% of finales (a strong proxy, not median); ramp-alone winner mean −5.51 says an ordinary kit meets "reachable, not comfortable" | **directionally hit** — re-measure post-calibration with a median-kit harness |

### HANDOFF — the calibration agent's list (§7.4, ONE session, in this order)

1. **MONEY_CHECKS sweep** toward 41/29/14 intent, stars on (they are on by
   default now in shopcheck). Today's reading at the live triple:
   43/49/3, survival mixed 28% (intent 36%) — check 2 must come down
   and/or check 3 catch its load. §8-2 says the third bar lands AT OR
   BELOW $13.3M; if the sweep tops out at 8–9% kill, §8's escape clause
   governs (re-argue the intent number, do NOT reach for boost decay).
2. **SHARE=1 re-measure** of season.ts SHARE and the LADDER's 20th-place
   anchor — star cheques shifted the late medians down (a finished $23.9M
   season currently ranks 15 on the ladder; the frozen board rows in
   runs/verified.json are ledger-safe and must NOT be recomputed).
3. **Boost band check** against 1.4–2.5× (shopcheck top section, stars
   on). Predict mid-band absorbs the tier; budget ≤ 2 repricings.
4. **fieldcheck confirm**: ten per-course deltas within ±0.1 (tier is
   course-blind, median unmoved — predicted untouched, receipt required).
   While there: **Palmetto's fieldShift is stale** (−0.182 measured
   against the pre-rebuild hole 2; the course was rebuilt after) — the
   coupling recheck should re-derive it against the live TARGET ladder.
5. **weekcheck EVENT_YIELDS** — measured pre-stars; late-event expected
   yields fell (the stars eat cheques), so the week-option pricing
   comparisons need a re-run before anyone trusts them.

Instrument knobs, for the record: `STARS=0` turns the tier off in
cutcheck/shopcheck; `K/RAMP/BETA/CAP` override the shipped dials;
fieldcheck `WINNERGAP=only [GRID=1] [PACE=…]` runs the promoted probe by
itself; shopcheck `WINS=1` prints the win-rate section this sweep used.

### POSTSCRIPT — the calibration pass ran (CALIBRATION-2.md, 26 Aug 2026)

The §7.4 session is done; full receipts live in CALIBRATION-2.md. What it
settles for THIS file's ledger:

- **§8-2, scored: half right, and the wrong half is the informative one.**
  The bar moved DOWN — $13.3M → **$12.2M**, with check 2 at $8.5M — exactly
  the registered direction. But the kill topped out at **5%**, not ≥10%:
  the sweep read 2–5% at every bar the win-pays-the-final-leg invariant
  permits, and lowering check 2 toward its own intent LOWERS check 3's
  ceiling with it (the invariant couples the bars — a fact §7.4 didn't
  price). Below even the 8–9% "one more re-sweep" line, so **the escape
  clause governs**: the residual is raw equipment over-supply, the next
  dial is the honest-rental reframe of §4 — consumable SKUs that say they
  expire — never sticker decay of owned goods, never another threshold
  move. That conversation now has a measured floor under it: cheque-eating
  was worth +2–4 points of check-3 kill and no more.
- **The rest of §7.4's predictions hit.** Shipped triple $2.3M/$8.5M/$12.2M
  kills 44/35/5 (checks 1–2 within their bands; check 1 digit-stable at
  the spring rule); the mid-band absorbed the tier (15/17 boosts in band,
  the two cheapest repriced, inside the ≤2 budget); all ten fieldShifts
  confirmed ±0.1 with Palmetto re-derived for its rebuild (−0.182 →
  −0.145, a CHANGES-8 debt, not a star effect); EVENT_YIELDS re-measured
  (late yields fell 22–26% — the schedule screen now prices a withdrawal
  honestly).
- The economy's other star-shadow numbers: shopper median season
  $19.6M → **$15.8M** (LADDER re-anchored; a finished $23.92M season reads
  8th, was 15th), and the aggressive-below-mixed inversion survived the
  tier (34 vs 35 — the stars press win-heavy play hardest), still flagged
  for the dialogue.
