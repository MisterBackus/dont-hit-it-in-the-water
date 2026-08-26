# JUNK-VERDICT — is the rough punishing enough?

**Instrument:** `src/tools/junkcheck.ts` · `SEEDS=24 npx tsx src/tools/junkcheck.ts`
(mixed policy, sharpness ×1.00, all ten pool courses, 576 matched pairs per cell).
Read-only: the game was not touched.

## The suspicion, registered before measurement

The LIE table prices a bad lie by **multiplying** the club's spread (rough ×1.7,
deep ×2.6, sand ×1.6, trees ×2.4), and a wedge's spread is 4–6 yards — so 1.7 ×
tiny is still tiny, and greenside junk should be nearly free while the same
multipliers make approach-range junk expensive.

> **PREDICTION:** greenside rough < 0.15 strokes/visit · approach-range deep > 0.60.

## What was measured

Strokes lost per visit: ball placed at a fixed distance from the pin on a real
hole, the lie **forced**, played to holing out with the standard policy and
deck; minus what the identical spot / seed / hand costs from fairway. Paired on
seed, so the hand, the green and the putting cancel out of the difference.

### Measured — the LIE table as shipped

| lie    | greenside ≤35 | short 36–90 | approach 91–170 | long 171+ |
|--------|--------------|-------------|-----------------|-----------|
| rough  | **+0.22**    | +0.13       | +0.11           | +0.38     |
| deep   | +0.30        | +0.25       | **+0.28**       | +0.66     |
| bunker | +0.32        | +0.22       | +0.64           | +0.74     |
| trees  | +0.32        | +0.25       | +0.37           | +0.68     |

(Fairway strokes-to-finish per band, for scale: 2.51 / 2.78 / 3.04 / 3.31.)

### Counterfactual — junk spread floored at `max(spread × lie, N yd)`

Greenside / short / approach / long, per floor (instrument-only; the planner
sees the floor):

| lie    | floor 8 | floor 12 | floor 16 |
|--------|---------|----------|----------|
| rough  | +0.23 / +0.13 / +0.11 / +0.38 | +0.29 / +0.15 / +0.12 / +0.39 | +0.31 / +0.20 / +0.17 / +0.39 |
| deep   | +0.30 / +0.25 / +0.28 / +0.66 | +0.30 / +0.26 / +0.29 / +0.66 | +0.31 / +0.26 / +0.29 / +0.66 |
| bunker | +0.33 / +0.22 / +0.64 / +0.74 | +0.38 / +0.26 / +0.65 / +0.74 | +0.38 / +0.27 / +0.66 / +0.75 |
| trees  | +0.32 / +0.25 / +0.37 / +0.68 | +0.32 / +0.26 / +0.37 / +0.69 | +0.33 / +0.27 / +0.38 / +0.69 |

## Verdict

**The suspicion does not confirm — on either end.** Greenside rough costs
**+0.22 ± 0.02** strokes a visit, not the predicted under-0.15; approach-range
deep costs **+0.28 ± 0.02**, less than half the predicted over-0.60. Greenside
junk as a whole runs **+0.29** against the approach band's **+0.35** — 83%, not
the giveaway the multiplication argument promised.

The reason the wedge-times-1.7 arithmetic misleads is that the cone a greenside
shot actually plays is not the card's printed spread: a wedge cut down to 25
yards already pays the take-off angle penalty (`TAKEOFF_PENALTY`,
sim/effects.ts), the lie multiplier compounds ON that, and the P8 cone cap
bounds everything near the green. The pricing the LIE table fails to do up
close, the cut-down mechanic is already doing. Multiplication does its stated
job where the clubs are long: deep, trees and sand all escalate by band and the
long game pays +0.66 to +0.74 a visit.

**No dial is recommended.** The floor sweep is on the record for the day the
greens are judged too kind: **floor 12** is the honest candidate — it lifts
greenside rough +0.22 → +0.29 (junk average +0.29 → +0.32) while moving the
approach band a rounding error (+0.35 → +0.36), because 12 yards only bites
cards the multipliers leave under it, which is the wedges. Floor 8 is inert
(cut-down already outruns it); floor 16 starts brushing the short band without
buying much more greenside.

**One cell earned a docket of its own, found rather than predicted:** plain
rough in the scoring bands is the cheapest junk in the game — **+0.11** at
approach range, +0.13 short. A drive into the rough at 130 out costs a tenth of
a stroke; the same miss into deep costs ~0.3 and into sand ~0.6. If any lie is
"nearly free", it is mid-range light rough — the opposite corner of the table
from the one suspected. Whether ×1.7 (or rough's 0.90 carry) should firm up is
a separate question with different side effects (it touches every tee shot in
the game), and this instrument is the tool to price any candidate before it
ships.
