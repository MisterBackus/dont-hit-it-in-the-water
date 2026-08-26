# The week system: measured at last

**25 Aug 2026** · `npx tsx src/tools/weekcheck.ts` · 1,000 seasons per row, mixed
play, shopper baseline (major-cut drops modeled), seeds 800000+, real pool
rotation, modern rulebook. Deltas are paired by seed; ±1 s.e. quoted.

The question: the owner — 12/12 cuts, nine wins, the game's best player — has
never taken a single off-week (runstats: WEEKS taken: none). weeks.ts promises
"everything here has to be worth roughly what an event pays, or nobody would
ever sit one out." Nobody had ever checked. Are weeks EV-negative traps,
correctly niche, or good deals nobody can see?

**The answer: three of the five are good deals — but only in a narrow early
window nobody can see, on a screen that styles taking them as a mistake. One is
a trap at every timing. And the whole system is half of a trade whose other
half (fatigue, DESIGN.md §8.2) never shipped.**

---

## 1. What a week costs — the opportunity cost is savagely backloaded

Baseline shopper season: **$18.11M gross, 34% survival** across the three Money
List checks. Mean gross added by each played event:

| Stage | Mean yield per event | Detail |
|---|---|---|
| Early (events 1–5) | **$570k** | events 1–3 pay only $301k–$345k each |
| Mid (events 6–9) | **$1.36M** | |
| Late (events 10–14) | **$1.97M** | event 14 alone pays $3.07M |
| The majors | $1.14M / $2.36M / $2.84M / $3.07M | **plus the free premium drop**, which is not in the money column |

A week off at event 2 forfeits about $300k. The same week at event 13 forfeits
$1.35M. Skipping THE OPEN AT SALT FLATS (event 7) measures **−$3.59M gross and
−25pp survival** — the schedule screen offers that withdrawal exactly as
cheerfully as any other.

This asymmetry is the entire system, and nothing in the game says it out loud.

## 2. Each option, taken once, vs never

Gross delta (what the Money List reads) and survival delta, per timing:

| Option | Early (ev 2) | Mid (ev 8) | Late (ev 13) | Verdict |
|---|---|---|---|---|
| A week on the range | **+$720k ±$214k · +5pp** | −$1.01M · −11pp | −$1.37M | **Good deal early**, trap after |
| Get properly fitted | **+$1.12M ±$212k · +9pp** | −$846k · −10pp | −$1.29M | **Good deal early** — the best in the system, trap after |
| A lesson with someone good | **+$854k ±$176k · +6pp** ¹ | −$896k · −11pp | −$1.34M | **Good deal early**, wallet-gated, trap after |
| Corporate day | +$141k ±$218k (a wash) | −$971k · −10pp | −$1.20M | **Niche at best** — $180k roughly refunds an early event and nothing more |
| Sign with a sponsor | −$2.42M · −12pp | −$1.60M · −9pp | −$1.20M | **TRAP at every timing** |

¹ At event 2 the shopper cannot pay the $120k fee in 29% of seasons (plays
instead, which dilutes the measured mean — conditional on actually affording
the lesson, the early delta is nearer **+$1.2M**).

The compounding effects decomposed (same dial, no event skipped):

- lesson's ×0.90 tighten from event 2 is worth **+$2.02M and +17pp survival**;
  from event 8 only +$409k. It compounds through twelve remaining events or
  fizzles through six — timing is nearly everything.
- range's ×0.94 from event 2: **+$1.33M, +11pp**.
- the sponsor's −1 focus from event 2 costs **−$2.88M and −13pp**; even started
  at event 8 it costs −$848k. $300k up front never comes close to covering it;
  the "trade" is roughly 10:1 against at the timing where the cash would
  matter most. It is the only option that is a trap by arithmetic rather than
  by timing.

Note what the survival columns say: an early range/fitting/lesson week
*improves* survival (+5 to +9pp) despite forfeiting a cheque — check 1 ($2.3M
after 5) is cheap, and the compounded tightening pays it back before checks 2
and 3. A mid-season week costs ~10pp survival every time. No human could be
expected to intuit either fact.

## 3. Why the best player never touched it

1. **The good window is invisible.** The value of every skip-based option is
   (effect) − (event forfeited), and both terms are hidden: nothing tells you
   early events pay $300k while late ones pay $2M, and nothing tells you the
   tighten compounds. weeks.ts itself promises options "worth roughly what an
   event pays" — i.e. designed as a *wash* — and a perceived wash correctly
   loses to the certain path, because playing golf is also the fun path.
2. **The UI styles weeks as a mistake.** "Tee off" is the lone big button; the
   options sit below it under a label that leads with the downside ("no prize
   money, and the Money List does not wait"); taking one requires arming a card
   and then pressing a `big danger` button labeled "Yes — withdraw." That
   danger styling was added deliberately after a playtester signed a sponsor by
   accident (DESIGN.md §8.1) — a fix for the trap option that now teaches the
   player *every* option is a trap. The screen's one genuinely dangerous
   withdrawal (a major: −$3.59M, −25pp) gets the same confirm as the screen's
   best purchase (an early fitting: +$1.12M, +9pp).
3. **The lesson is gated shut exactly when it is good.** It is only a good
   deal at events 1–3, which is when 29% of shoppers can't pay the fee — and a
   real player who just spent in the shop is disabled even more often. The
   button greys out during its own window.
4. **The system's pressure valve never shipped.** DESIGN.md §8.2: fatigue "is
   what stops 'just play every event' from being the dominant strategy."
   Fatigue is not in the game. Weeks shipped as the *reward* half of a
   trade whose *cost* half doesn't exist, so "play every event" is in fact
   dominant from event 4 onward — the owner's behavior is the correct reading
   of the shipped game, one narrow early window excepted.

So: not "EV-negative traps" wholesale, and not "correctly niche" either. The
honest verdict is **good deals nobody can see, sold from a screen designed to
warn people off them, next to one real trap (the sponsor) that poisons trust
in the menu.**

## 4. Design options (recommendations, not implementations)

**A. Make the calendar legible on the schedule screen.** Print the trade the
instrument measured: an average event's pay at this point in the season next to
the week cards ("an event here typically pays ~$300k; by the finale, ~$2M"),
and let the week cards say their season value compounds. Reserve the red
danger confirm for withdrawals that measure dangerous — any major, and
anything from event ~6 on — and give the early window a neutral confirm.
Predicted effect: range/fitting/lesson start getting taken in events 1–3,
where they are already +$720k / +$1.12M / +$854k with survival *gains*; no
balance change required at all. Cheapest fix, biggest expected behavior shift.

**B. Fix or delete the sponsor.** It is the game's only permanent debuff and
it underpays by ~$2.6M at the timing its cash would matter. Two repairs, either
sufficient: (1) duration-cap the tax ("−1 focus for the next three events") so
the price is ~$300–500k of measured earnings instead of $848k–$2.88M, making
late-season signing a real cash-now-vs-earnings-later loan; or (2) make
signing not cost the week (you sign during a played event — the money already
counts as gross, like Pontoon's cut bonus) so the trade is pure cash-vs-tax
and can be priced honestly. If neither, delete it: a menu with one known trap
teaches players to distrust the other four cards.

**C. Decide what the week node is for, given fatigue never shipped.** Two
coherent directions: (1) ship the missing cost — fatigue (or a focusPenalty
that accrues from play) that a rest week heals, which retroactively justifies
the whole node across the season; or (2) accept that weeks are an
early-season-only system and shape the offer to match — bias the 2-of-5 draw
toward practice/fitting/lesson in events 1–4 (and stop offering skip-based
options at majors, which are −$3.59M mistakes waiting for a misclick), letting
the node quietly stop appearing late rather than selling −$1.3M cards. Option
(2) is honest about what the measurement found; option (1) is the bigger game.

Not recommended: deleting the system outright. It contains the two best
unpurchasable effects in the game (fitting +$1.12M, lesson's tighten worth
+$2.02M/+17pp if freed from the skip) — the failure is signposting and the
sponsor, not the idea.

---

*Instrument: `src/tools/weekcheck.ts` (N, POLICY, SHOP, VICTIM, SEED0
overridable). Caveats it carries: shopper harness with mixed policy; one week
per season measured (range's stacking untested); the lesson's early mean is
diluted by unaffordable seasons; the fitting cuts rewardcheck's best victim
(Smooth It). None of these move any verdict's sign except possibly Corporate
day's, which is within noise of zero exactly as a "niche" option should be.*
