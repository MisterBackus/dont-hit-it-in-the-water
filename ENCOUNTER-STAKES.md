# ENCOUNTER STAKES — the four numbers nobody ever asked to justify themselves

**27 Aug 2026 · PLAYTEST-NOTES-1.md note 10, built · predictions registered
before the instrument was run**

## 0. The problem, stated

Four money values exist in the entire encounter system
(`src/content/encounters.ts`):

```
  -$150k   the Rules Official's donation to the junior programme
  +$150k   the autograph, and the sponsor who loves the photo
  +$200k   whatever was behind the porta-potty  ·  and the sandbagger's stake
  +$500k   the sandbagger, paying like he putts
```

Against `MONEY_CHECKS` of **$2.6M / $10.1M / $13.8M** and a mixed shopper's
median season of **$16.97M**, the fine is **1.1% of what the season demands
of you** and **0.9% of what a season pays**. It is $150k — which is, to the
dollar, the price of the cheapest boost on the shelf (Short Memory, $150k),
and less than a fifth of what one spring weekend yields ($640k, weekcheck's
STAGE_YIELD). The owner met one live and filed the verdict:

> "just had to pay a fine i guess? 150k is pennies."

He is right, and the reason is structural. **These are the only numbers in
the project that were written rather than measured.** Eighteen instruments
live in `src/tools/` and not one of them has ever modeled an encounter. Six
economy re-anchorings have moved every bar, price, ladder rung and yield
around these four constants without touching them: the checks alone have
travelled $1.4M → $2.1M → $2.6M on check 1 and $8.4M → $13.8M on check 3
while `-150_000` sat in a data row, unmoved, going quietly stale.

A constant in a re-anchoring economy is a bug with a slow fuse. The fix the
owner approved is therefore not "make the fine bigger" — it is **stop the
number being a number**: express encounter money as a FRACTION of the live
Money List check, so the next re-anchoring carries it along automatically
and this note can never be written twice.

---

## Registrations — written before `encountercheck` was run once

**P1 — instrument lineage.** `encountercheck` is a new harness; nothing it
says is believed until it reproduces the calibration it descends from. With
encounters switched OFF (`ENC=0`) its shopper must print CALIBRATION-3's
authoritative row inside the ±2 honesty band: kills **44 / 37 / 2**,
survival mixed **35%**, aggressive **27%**, mixed hoarder **6%**.

**P2 — how often they actually land, and the note's own premise.**
PLAYTEST-NOTES-1 §10 argues "encounters land on roughly a third of made
cuts, so a swing big enough to sting is big enough to move survival". I
predict that premise is **FALSE**, and that the arithmetic already says so:
ten non-major events × a ~60% cut rate × ⅓ ≈ **2.0–2.4 encounters a
season**, spread over EIGHT people, so any ONE of them shows up about **0.25
times a season** — and the Rules Official only fines you on the 40% branch,
so **the fine itself lands about once in ten seasons.** Prediction: no
encounter money value inside a sane band moves mixed survival by more than
~1–2 points, because the event is too rare to aggregate. If that holds, the
case for raising the fine is the MOMENT, not the season, and the doc must
say so rather than claim a survival effect it did not measure.

**P3 — what an encounter is worth today.** At the legacy constants,
engage-everything vs walk-on-everything is worth **under $200k of gross a
season** and **±1pp of survival** — inside its own paired standard error.
The system measures as a receipt, which is exactly the owner's complaint,
stated in the economy's own units.

**P4 — the decision bar, and the fraction that clears it.** A fine is a
decision when paying it costs something a player can spend: it must beat the
cheapest thing on the shelf ($150k) by a clear multiple and be visible
against a spring weekend's yield ($640k). I predict the value that lands
there is **3–5 points of the season's demand**, where one point ≡ 1% of the
final Money List check (**$138k** at the live $13.8M) — i.e. a fine of
**$414k–$690k** — and that at 4 points engage-all still moves survival by
**under 2pp** (P2's consequence).

**P5 — the sandbagger's break-even.** The legacy bet risks $200k to win
$500k, which breaks even at a **40% birdie** on the hole after the cut. I
predict the measured birdie rate there is **25–35%**, so the sandbagger is
already an honest-but-losing bet — a golf bet, correctly — and the shipped
scaling should preserve that shape: break-even a few points ABOVE the
measured rate, never below it.

**P6 — the acceptance bars.** With encounters modeled at the shipped scale,
mixed survival stays inside CALIBRATION-3's **33–39** band, the ordering law
(mixed > aggressive > hoarder) holds, and check-1 kill stays within **±4 of
44**. The spring rule is protected by rarity rather than by size: at most
~5% of seasons meet a fine before event 5.

---

## 1. The instrument, and its lineage (P1) — believed twice

`src/tools/encountercheck.ts` is the nineteenth instrument and the first
that knows an encounter exists. It is shopcheck's shopper — offer stream,
budget 6, weighted tiers, early gate, spring slot, free major-cut drops,
stars on, the 36-hole scorecard with the full tie split — with the walk to
the fifth tee modeled off the same `events` stream (salt 6) the reducer
draws from: two rolls for whether anybody shows and who, two more when a
gamble is taken, the bet armed at the cut and settled on the first hole of
the weekend after momentum, exactly as `finishHole` does it.

With the people switched off (`ENC=0`) it must print the calibration it
descends from. **It did, twice, in one night, in two different worlds:**

```
                       kills            survival     source
  mixed              44 / 37 /  2          35%       CALIBRATION-3 §3
  encountercheck     44 / 37 /  2          35%       ENC=0, N=400, seeds 700000+
  aggressive         42 / 50 /  7          27%       CALIBRATION-3 §3
  encountercheck     42 / 50 /  7          27%
  mixed hoarder                             6%       both
```

Mid-session a concurrent lane shipped **SHARPNESS.md** (note 11 — the free
ramp now stops at event 10), which moves every cone in the world these
numbers live in. The instrument was re-run against the new world and
reproduced *that* calibration digit for digit too — `43 / 37 / 1 → 36%`
mixed, `42 / 50 / 7 → 27%` aggressive, hoarder 5% — the exact row
SHARPNESS.md's own re-derivation prints. **P1: hit, and then hit again
against a world that moved underneath it.** Everything below is measured on
the POST-sharpness world, before and after columns alike, so the comparison
is apples to apples.

## 2. How often anybody is there (P2) — the note's premise, scored

400 seasons, mixed shopper, engaging everything:

```
  non-major made cuts per season          8.57   (only these ever offer)
  encounters met per season               2.75   = 32% of them
  by stage      early(1-5) 1.04 · mid(6-9) 0.88 · late(10-14) 0.83
  the Rules Official shows up             0.41 times a season
  THE FINE ITSELF lands                   0.18 times a season
                                                 — once every 5.6 seasons
  of which before check 1                 0.07   (7.5% of seasons)
```

Eight people share 2.75 slots, so any ONE of them is a once-every-three-
years event and the fine — a 40% branch of one of the eight — **lands
about once every six seasons.**

> **PLAYTEST-NOTES-1 §10's premise is FALSE, and this is the finding that
> shaped the fix.** The note argued "encounters land on roughly a third of
> made cuts, so a swing big enough to sting is big enough to move
> survival". A third of made cuts is 2.75 conversations, not 2.75 fines.
> No stake this system can carry moves the season (§4 sweeps it from ×0.25
> to ×3 and survival never budges more than a point). **A fine cannot be
> justified by what it does to a season. It has to be justified by what it
> costs at the moment it lands** — and that is a different, smaller,
> answerable question. **P2: hit.**

## 3. What an encounter was worth (P3) — the receipt, measured

The written constants, on the current world, 400 seasons, paired by seed:

```
  policy        walk gross   engage gross     gross Δ    ±s.e.   survival
  mixed          $16.36M       $16.43M         +$64k     $129k   36% → 36%  (+0.0pp)
  aggressive     $14.32M       $14.58M        +$257k     $133k   27% → 27%  (+0.3pp)
  money in $153k a season · out $67k · net +$85k
  the whole cast is 1.34% of a season
```

Mixed is **inside half a standard error**: engaging every person you meet,
all season, every season, was worth nothing measurable. That is the
owner's "pennies", in the economy's own units, and **P3: hit** — under
$200k of gross and ±1pp, as registered.

## 4. What a fine has to cost (P4) — the sweep

The same season re-priced. `scale` multiplies every stake; the fine is four
points, so ×1 is $552k:

```
 scale     fine   ×cheapest  ×spring wk  %check1  %season   survival Δ
  0.25    $138k       0.9        0.20      5.3%    0.84%    36% → 36% (+0.0pp)
  0.50    $276k       1.8        0.40     10.6%    1.69%    36% → 35% (-0.3pp)
  0.75    $414k       2.8        0.60     15.9%    2.53%    36% → 35% (-0.5pp)
  1.00    $552k       3.7        0.79     21.2%    3.37%    36% → 35% (-0.5pp)
  1.50    $828k       5.5        1.19     31.8%    5.06%    36% → 36% (+0.5pp)
  2.00   $1.10M       7.4        1.59     42.5%    6.75%    36% → 36% (+0.8pp)
  3.00   $1.66M      11.0        2.38     63.7%   10.12%    36% → 37% (+1.8pp)
```

The survival column is flat and — note the sign — faintly POSITIVE: the
cast is net-positive (the cart girl, the greenskeeper, the junior and the
tiger cost nothing at all), so scaling the money up scales the gifts with
it. **There is no size at which the fine hurts the season.** The decision
therefore gets made in the other columns:

- **the floor**: under 1× the cheapest boost ($150k) the fine cannot change
  any purchase, which is exactly where the old $150k sat — it *was* the
  cheapest boost, to the dollar.
- **the ceiling**: over one spring weekend's yield ($695k) a 40% branch of
  an optional conversation becomes a season-altering punishment, and that
  is not what a man in a windbreaker is for.

**Four points — $552k — sits between them**: 3.7× the cheapest boost, more
than the median rack sticker ($450k), 0.79 of a spring weekend, 21% of the
first check, 3.4% of a season. Paying it costs you a piece of equipment.
**P4: hit** — the registered band was 3–5 points ($414k–$690k) and the
landing is 4 points, with survival moving 0.5pp against the registered
"under 2pp".

## 5. The sandbagger (P5) — the registration missed, and the miss mattered

```
                     break-even birdie      measured        verdict
  written           40.0%  ($200k→$500k)     59.0%     19 pts IN YOUR FAVOUR
  shipped           60.0%  ($414k→$690k)     59.4%      0.6 pts against you
```

**P5: MISS, badly, and it is the most useful thing this instrument found.**
I registered a 25–35% birdie rate on the hole after the cut. It is
**59.4%** — this is a game where the calibrated shopper wins half the
weekends he plays, and the hole after the cut is played by a man with a
full meter and momentum behind him. So the old bet was not "an honest
golf bet slightly against you", it was **free money with the odds printed
on the button** (P8 says the odds are SAID; nobody had checked that the
said odds were the true ones). The shipped pair — 3 points down, 5 back —
breaks even at 60.0% against a measured 59.4%: a hair against you, which
is what a bet with a man who says he is a twelve should be.

## 6. What shipped

`STAKE_POINT` = 1% of the FINAL Money List check = **$138k** today. Every
stake is an integer number of points; no dollar amount is written in
`content/encounters.ts` any more, and a test now says so.

| who | was | points | now | what it is |
|---|---|---|---|---|
| The Rules Official, fined | −$150k | **−4** | **−$552k** | a rack boost, gone |
| The Autograph Seeker | +$150k | **+2** | **+$276k** | half a rack boost, for a focus |
| Behind the Porta-Potty | +$200k | **+3** | **+$414k** | on the money branch of the 50/50 |
| The Sandbagger, down | −$200k | **−3** | **−$414k** | `minWallet` moves with it |
| The Sandbagger, paid | +$500k | **+5** | **+$690k** | break-even 60.0% vs measured 59.4% |

What each point resolves to, at each bar of the season — the reason the
anchor is the LAST check and not the first:

```
  a stake of        1 pt      2 pt      3 pt      4 pt      5 pt
  in dollars        $138k     $276k     $414k     $552k     $690k
  vs check 1  $2.6M   5.3%     10.6%     15.9%     21.2%     26.5%
  vs check 2 $10.1M   1.4%      2.7%      4.1%      5.5%      6.8%
  vs check 3 $13.8M   1.0%      2.0%      3.0%      4.0%      5.0%
  vs a median season $16.97M
                      0.8%      1.6%      2.4%      3.3%      4.1%
```

The stakes are **constant across the season by construction** — they
resolve against the checks, never against your wallet, so a fine costs the
same whether you are having the year of your life or clinging on. A stake
that grew with your bank account would punish success, which is a
different and worse design; a stake that grew with the calendar would put
its weight where the spring rule forbids it.

## 7. The acceptance bars (P6)

400 seasons, seeds 700000+, engaging EVERY encounter — the worst case for
the spring, since walking on is always free:

```
                    check kills          survival    calibrated
  mixed             42% / 39% /  1%         35%      44/37/2 → 35%   (CALIBRATION-3)
  aggressive        39% / 49% / 10%         28%      42/50/7 → 27%
  mixed hoarder     54% / 78% / 39%          6%              → 6%
  --- the same seeds with the people switched off ---
  mixed             43% / 37% /  1%         36%
```

| bar | required | measured | verdict |
|---|---|---|---|
| mixed survival | 33–39 | **35%** | **PASS** |
| ordering law | mixed > aggressive > hoarder | **35 > 28 > 6** | **PASS** |
| the spring | check-1 kill within ±4 of 44 | **42%** (−2) | **PASS** |

Nothing was re-anchored, and nothing needed to be: MONEY_CHECKS are
untouched, no price moved, no ladder rung moved. **P6: hit.** The spring
is protected by rarity rather than by size — 7% of seasons meet a fine
before check 1 at all, and the check-1 kill difference between a world
with the people in it and one without is one point.

## 8. SAVE_VERSION 11 → 12, said loudly

`storage.ts` states the rule: bump whenever the reducer's observable
behaviour changes, because an old log replayed through a new reducer is a
different run. This qualifies, in the v8 sense exactly ("a tied WIN now
pays the mean … so a v7 log replays with different money"):

- a v11 log that **took a fine, signed an autograph, looked behind the
  unit or shook the sandbagger's hand replays with different money**;
- the sandbagger's `minWallet` moved with his stake ($200k → $414k), so in
  the narrow window where a wallet sits between the two, a replay draws
  from a seven-person eligible list instead of eight and can **meet a
  different person**.

What did NOT change: **draw counts, everywhere.** The same two `events`
rolls decide whether anybody shows and who; the same two settle a gamble;
no other stream is touched (the encounters have owned salt 6 alone since
v6). No action becomes illegal on replay. It is the same run, paid
differently.

`runs/` was not touched and needs no re-replay: all five rows in
`runs/verified.json` are frozen at the version they were played, which is
what that ledger is for.

**One coordination note for whoever merges the night:** the concurrent
sharpness lane (SHARPNESS.md) changes every cone in a replayed log, which
is the v10 class of change, and left the version at 11. The bump to 12 is
written to cover the whole tree rather than racing it — one version note,
both changes, which is the honest shape.

## 9. Standing verdicts

1. **An encounter can never move a season, and should never be asked to.**
   Eight people over 2.75 slots is a once-every-three-years cast; the
   swept range ×0.25–×3 moves mixed survival by at most a point in either
   direction. Anyone who wants encounters to matter *aggregately* must
   change `ENCOUNTER_CHANCE` or the roster size, not the stakes — and
   should read §2 first, because "roughly a third of made cuts" has now
   fooled two readers, one of them the note that ordered this work.
2. **The cast is net-positive, so engaging is still usually right.** Walk-
   on remains the free door and the odds are said, but nothing here is a
   trap, by design (DESIGN.md P4 — these are people, not mines). If the
   owner ever wants the walk-on door to be genuinely tempting, the dial is
   the RATIO of costly to free encounters, not the size of the costs.
3. **A bet's said odds should be checked against measured play, always.**
   The sandbagger was 19 points in the player's favour for as long as he
   has existed, with his break-even printed under the button. Any future
   `bet` outcome must be priced against `SECTION=bet`'s measured rate
   before it ships.
4. **The stakes are honest only at the live checks.** Re-anchoring
   MONEY_CHECKS now re-prices every encounter automatically — that is the
   fix — but it also re-prices the sandbagger's break-even *relative to a
   birdie rate that did not move*. The break-even is a ratio of points and
   is therefore stable; the fine's ×cheapest-boost and ×spring-weekend
   readings are NOT, since the shelf and the yields anchor separately. Re-
   run `SECTION=sweep` after any re-anchoring that moves the checks by more
   than ~20%, and check the fine has not fallen under the cheapest boost or
   risen over a spring weekend.
5. **`encountercheck` is now the encounter system's calibration receipt.**
   It reproduces the shopper's row with `ENC=0`, so it can be trusted for
   any future question about the people — and it should be re-run, not
   re-derived from a comment, the next time anybody touches this content.

---

*Instruments run: encountercheck (new — lineage ENC=0, frequency, worth,
the scale sweep, the sandbagger's arithmetic and the acceptance bars; 400
seasons a row, seeds 700000+, stars on, EXT 28, live shelf and live
MONEY_CHECKS). Files touched: `src/content/encounters.ts` (points, the
STAKE_POINT derivation, every stake and every line of copy that quotes
one), `src/sim/reducer.ts` (applyOutcome and the bet's stake — the
interpreter is the only place a point becomes a dollar),
`src/tools/encountercheck.ts` (new), `src/sim/deck.test.ts` (the money
assertions now read the content's points rather than pinning dollars, plus
a test that forbids writing a dollar in the content at all),
`src/platform/storage.ts` (SAVE_VERSION 12), this file. `npx tsc --noEmit`
clean; `npx vitest run` **166/166**. Nothing committed; the tree is left
for the owner.*
