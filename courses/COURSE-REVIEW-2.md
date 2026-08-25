# COURSE REVIEW v2 — the four revisions, measured

**25 Aug 2026** · `npx tsx src/tools/coursecheck.ts`, 300 rounds per skill level.

**Read this first: the engine changed under you.** Between v1 and now, two fixes
landed — a guaranteed short shot inside 60 yards, and a correction to a cone
that fanned wider as the shot got shorter (a 21-yard pitch was drawing a 45°
cone; the wildest driver in the bag is 7°). Short shots are meaningfully more
accurate than when you designed v2. Pine Hollow's own mixed round went **+2.09 →
+1.64** over the same period, so compare everything to that column, not to the
v1 numbers.

---

## 1. Your four predictions against the measurement

You made them falsifiable on purpose, so here they are straight.

| | predicted | measured | |
|---|---|---|---|
| **Cottonwood 1** The Lean | mean → E, gap ≥ 0.30 | mean −0.46, **gap 0.24** | partial |
| **Cottonwood 2** Wrong Number | mean → +0.7/0.9, gap appears | mean **+1.03**, **gap 0.13** | miss |
| **Cottonwood 3** Postcard | mean +0.2, gap ≥ 0.40 | mean −0.06, **gap 0.12** | miss |
| **Rockdale 2** The Ballwasher | gap 0.30+, mean +0.1/0.2 | mean −0.03, **gap 0.09** | miss |

Means moved a little; **decision gaps did not move at all.** Cottonwood 2 came
down from the hardest hole in the game (+1.27 → +1.03) and stayed flat while
doing it, which is the clearest possible statement that its difficulty and its
flatness were never the same problem.

Zero for four is not a craft failure. All four revisions used the same move —
*put a hazard where the obvious club lands* — and that move cannot produce a
decision. It relocates the obvious club. §3 is why.

---

## 2. A better instrument: split × gap

I added a second column. **`split`** is how often the three risk appetites
choose a different *plan* — card, technique and aim — from the same position.
**`choice?`** is how much that changed the score. Together they separate three
things that used to look alike.

```
                          split   gap
Cart Path Only  (R3)       93%   0.82    ← a DECISION
Church Pew      (PH2)      83%   0.55
The Long One    (PH7)      65%   0.55
The Cottonwoods (C4)       67%   0.44
Dead Straight   (C7)       66%   0.43
--------------------------------------------------
Green Light     (C5)       69%   0.04    ← a COIN FLIP
Go On Then      (C6)       69%   0.14
The Walk In     (C8)       71%   0.08
--------------------------------------------------
Postcard        (C3)       42%   0.12    ← a LOOKUP
The Ballwasher  (R2)       24%   0.09
Handshake       (PH1)      50%   0.02
```

- **Low split, low gap → a lookup.** One line dominates; every appetite finds
  it. Hard is not the same as interesting.
- **High split, low gap → a coin flip.** The options genuinely differ and are
  worth the same. The player chooses and it does not matter.
- **High split, high gap → a decision.** This is the target, and there are five
  of them in twenty-four holes.

Postcard is the instructive one. Two ways to hit 185 — a loose 170+15 and a
tight 208−25 — so the appetites split 42% of the time and it changes nothing,
because **both ways are equally good**. A gap puzzle with two solutions is not a
dilemma; it is a lookup with two entries.

---

## 3. Why "a bunker where the obvious club lands" cannot work

Putting sand at 133 on a 150-yard hole does not make the 133 shot a gamble. It
makes the 133 shot **wrong**, and every appetite then plays the 145 instead. You
have moved the answer, not created a question. The Ballwasher's split actually
*fell* to 24% — the most one-dimensional hole on either course.

A decision needs two lines that are **both defensible and differently shaped**:
one with the better average, one with the better worst case. Then risk appetite
has something to disagree about.

### Generator A — the reach-or-lay fork (The Long One, 0.55)

```
  210-yard par 3, green r15, twin bunkers at 186, ±27 side
```
You own 208 with a **±20** cone and 170 with a **±12** one. The long card
reaches and might find sand; the short card is safe and leaves 40 yards. Safe
lays up, aggressive goes. Nothing is mispriced — the two lines just have
different shapes.

The requirement is a distance that **only a wide-cone card reaches**. If a
technique converts some tight card into a perfect fit, the fork closes. This is
what happened to Postcard.

### Generator B — the aim fork (Cart Path Only, 0.82 — the best hole in the game)

```
  { surface: 'rough', at: { down: 250, side: 20 }, rDown: 55, rSide: 6 }
```

A **110-yard-long, 12-yard-wide strip of rough running parallel to the fairway**,
sitting 20 yards right of the line, with the green offset 12 right so the
aggressive line runs straight down it. Every appetite reaches for the same card
and they disagree, 93% of the time, about **whether to aim away from it**.

Nobody else has used aim. Here is why it works, and it is a number: the aim
options are only **±14 yards**. Almost every hazard on all three courses sits
25–45 yards off the line, which is outside the band aim can reach — so aim
changes nothing and the only lever left is the club. A hazard **12 to 25 yards
off the line, long and thin, parallel to it** is the one shape where ±14 yards
of aim is the difference between dry and wet, and the safe aim costs you
something real in position.

That band is almost entirely unexplored. I would build the next course out of it.

---

## 4. Where the two courses stand now

```
                    full round (mixed)   front four   spread (sd)   REAL holes
Pine Hollow               +1.64            +0.73         1.13          3
Cottonwood                +2.65            +1.37         1.37          2
Rockdale Muni             -0.02            -0.58         0.90          1
```

**Cottonwood** keeps the best score spread of the three and is still the most
distinctive world. Its front four remains 1 REAL / 1 some / 2 flat against Pine
Hollow's 2 REAL. Wrong Number is no longer punishing, but it is still a hole
where nothing you choose matters — I would rebuild it on Generator B rather than
adjust it again: the pond is already off the diagonal, so make its right-hand
edge a long thin strip inside the aim band instead of a blob outside it.

**Rockdale went the wrong way.** Front-four spread fell to **0.90**, the lowest
of any course, and mixed play is now **−0.58 through four**. For a place-based
cut that is the dangerous end: everybody bunched under par means the cut is
decided by tie-breaking rather than by golf. The identity is right and Cart Path
Only is the best hole anyone has built — but the course needs one or two more
holes that can go wrong, not just holes that can go right. Its own third hole is
the template.

---

## 5. What I would do next

1. **Rebuild Cottonwood 2 and Rockdale 2 on Generator B.** Both are par-3 or
   approach situations where a thin parallel hazard inside the aim band would
   turn a lookup into a fork. Predict a split above 60% and a gap above 0.35.
2. **Then the unfair major**, designed to split × gap from the first line. The
   bar: at least five of eight holes above 60% split *and* 0.35 gap. Nothing in
   the game currently manages more than three.
3. Leave the back-four flats alone for now. Rockdale 8 being a green light home
   is a good instinct and I agree with it.

The instrument is in `tools/coursecheck.ts` and both columns are printed for
every hole, so the next round can be checked against the same numbers I am
quoting here.
