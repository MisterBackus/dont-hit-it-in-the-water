# COURSE REVIEW v4 — the courses were never the problem

**25 Aug 2026** · `coursecheck.ts`, 350–400 rounds per skill level.

Salt Flats arrived, the three fixes measured, and then a diagnostic column added
along the way found something none of us were looking for. **The flatness we have
been chasing across three rounds of course revisions was a bug in the focus
economy, not in the courses.**

---

## 1. First, your three fixes

| | predicted | measured |
|---|---|---|
| **Rockdale 2 · The Ballwasher → 205** | 0.86 | **0.88 REAL, split 90%** |
| **Cottonwood 3 · Postcard → 205** | like Dead Straight (~0.46) | 0.21 flat |
| **Cottonwood 2 · Wrong Number → 470** | fork moves to the tee | 0.22 → some, split 62% |

The Ballwasher landed on the nose and is now the second-best hole in the game.
Postcard did not, at the same length and the same par — which was the first clue
that length alone was not the whole rule.

**Salt Flats** came in hard and flat: mixed +4.56, and **zero** holes clearing the
bar. Six fork candidates, none of them forking. The distances-first method was
followed correctly and it still did not work.

---

## 2. The column that found it

I added *"what does the player arrive at this tee with"* — focus in hand, and the
longest card in hand. Every course, every round:

```
  hole      1     2     3     4     5     6     7     8
  focus   5.0   3.5   1.1   1.1   1.5   1.7   1.5   1.7
```

**The player is broke from the third tee to the last one, on every course we
have ever measured.** A putt costs 2 to 4 focus. A technique costs 0 to 2. From
hole 3 onward there is 1.5 in the pocket, so nobody can afford a technique or buy
a birdie, all three risk appetites play the same naked card, and the hole cannot
contain a decision no matter what is built on it.

That is why the REAL holes in every course cluster at holes 2, 4 and 7 — the ones
that follow a cheap hole. It is why lengthening Rockdale's 2nd from 150 to 205
moved the **third** hole from 0.82 to 0.20 without a character of that hole
changing: the harder par 3 spent the focus that hole 3's decision was funded by.

### The cause

`DESIGN.md` §6.2 has always read: *"Regen: +1 per hole completed, **+1 additional
on par or better**."* The momentum rule — playing well funds playing well.

**It was never implemented.** `focusRegen()` returned a flat 1.

---

## 3. What happened when it was

One line. Nothing else changed — same courses, same cards, same hazards.

```
                     before        after
decision holes        3 of 32     10 of 32
Pine Hollow · The Long One    0.53  →  0.72
Rockdale · Cart Path Only     0.19  →  0.41
Rockdale · The Oak            0.32  →  0.65
Rockdale · The Only Five      0.23  →  0.43
Salt Flats                  0 REAL  →  1 REAL + 5 some
```

**Rockdale now has four REAL holes** — more than Pine Hollow — and the focus
column reads 5.0 / 4.3 / 3.0 / 2.4 / 3.0 / 3.0 / 2.8 / 3.2 instead of bottoming
out at 1.1.

The design offered an alternative — flat +2, no momentum — and it was measured
too: **7 decision holes against momentum's 10**, and an easier round besides.
Momentum wins on both counts, so the coupling stays.

---

## 4. Which means your courses need re-reading, not re-cutting

Every measurement in reviews 2 and 3 was taken on a starved player. Some of the
holes I called flat were never flat; they were unaffordable. **Do not revise
anything on the strength of the old numbers.** The current table is what to
design against.

Standing after the fix:

```
                    full round (mixed)   front four   spread (sd)   REAL / some / flat
Pine Hollow               +0.76            +0.45         1.15         3 / 3 / 2
Cottonwood                +1.60            +0.93         1.38         2 / 2 / 4
Rockdale Muni             -1.66            -1.12         0.94         4 / 2 / 2
Salt Flats                +3.89            +2.29         1.68         1 / 5 / 2
```

- **Rockdale is the best-built course in the game on the decision metric**, and it
  is now far too easy at −1.66. It needs difficulty, not forks. That is the
  opposite of the note I gave you last time and it is a nicer problem.
- **Salt Flats** went from 0 forks to 6 candidates that are all *close* (0.26,
  0.30, 0.27, 0.23, 0.34, 0.41). It is the right shape starved; it deserves a
  re-read before any revision. The one hole I would look at is **The Crossing**
  (0.12, and it opens the course) — an opener with no fork is fine, but Salt
  Flats' whole promise is that nothing is comfortable.
- **Cottonwood** still has four flats. Postcard at 205 measuring 0.21 while The
  Ballwasher at 205 measures 0.88 is the interesting pair: same length, same par,
  and the difference is that the Ballwasher's stretch card is punished — a ditch
  in the aim band — where Postcard's guard bunkers sit 25 off the line and 30
  yards short, so trying costs nothing and the fork never opens.

**The rule, now complete:** a decision needs **reach in doubt** *and* **a real
price on the stretch card's cone** *and* **a player who can still afford the
choice.** Three conditions. We have spent three rounds discovering them one at a
time, and the third one was ours, not yours.

---

## 5. What this cost on our side

Implementing one line of the original design doubled the player's effective
resources from the third hole on. Season survival went **36% → 82%**, and the
Money List thresholds had to go $420k / $1.30M / $2.70M → **$1.35M / $3.80M /
$6.50M** to bring it back to 37%.

That is the third threshold rise in a day, and the Money List ladder has now been
re-anchored twice. **That churn is itself a finding: the player keeps getting
stronger and the field does not.** The field is the next real job on our side —
it is also what the tie-overflow on the cut traces back to, and what has to land
before any of these courses can safely enter the schedule.
