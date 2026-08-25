# COURSE REVIEW v3 — and the thing we were all wrong about

**25 Aug 2026** · `coursecheck.ts`, 400 rounds per skill level, plus two
controlled experiments.

**Short version: your `split` predictions landed and your `gap` predictions
missed, and chasing that told us what actually makes a hole a decision. It is
not the hazard. My last brief sent you after the wrong variable and I am sorry
for the round trip — but the round trip is what found it.**

---

## 1. The scoreboard

| hole | predicted | measured | |
|---|---|---|---|
| Cottonwood 2 · Wrong Number | split >60, gap >0.35 | **57 / 0.12** | miss |
| Cottonwood 3 · Postcard | split >55, gap >0.30 | **59 / 0.20** | half |
| Rockdale 1 · Dew Sweepers | split >60 | **50 / 0.22** | half |
| Rockdale 2 · The Ballwasher | split >60 | **80 / 0.27** | split smashed |
| Rockdale 6 · Retention Pond | split >60 | **66 / 0.03** | split hit, gap fell |

The aim band does exactly what you said it does. The Ballwasher went from the
most one-dimensional hole on either course to **80% disagreement** — the second
highest anywhere. Postcard went 42 → 59. You made the appetites disagree.

**Disagreement without stakes is a coin flip, and that is what all five became.**

---

## 2. I tested my own advice and it was wrong

My review said Cart Path Only works because it sits in the aim band. It also
happens to use `rough` where your new hazards use `water` and `ob`, so the
obvious hypothesis was that a soft penalty keeps the aggressive line worth
taking while a stroke penalty kills it.

I swapped the surface on all four new aim-band hazards and re-ran:

| | as built (water/ob) | as `rough` | as `bunker` |
|---|---|---|---|
| Wrong Number | 0.12 | 0.17 | 0.17 |
| Dew Sweepers | 0.22 | **0.07** | 0.08 |
| The Ballwasher | 0.27 | 0.29 | 0.28 |
| Retention Pond | 0.03 | 0.07 | 0.06 |

**Nothing.** Hazard severity is not the variable. Dew Sweepers got *worse* with a
softer hazard. Whatever Cart Path Only is doing, the surface is not it.

---

## 3. What the variable actually is

Second experiment. The Ballwasher, **hazards untouched, only the length changed**:

| length | safe | mixed | aggro | gap | split |
|---:|---:|---:|---:|---:|---:|
| 150 (as built) | +0.73 | +0.76 | +0.48 | **0.28** | 80% |
| 185 | +0.52 | +0.88 | +0.39 | **0.49** | 58% |
| **205** | **+0.93** | **+0.08** | **+0.07** | **0.86** | 90% |

Same ditch. Same green. Same everything. **0.28 → 0.86** — which would make it
the best hole in the game, ahead of Cart Path Only.

### The rule

**A hole contains a decision when reaching is in doubt.**

At 150 everybody gets there, so no hazard anywhere can create a fork — the
options differ and arrive at the same place. At 205 the only card that reaches is
a Long Iron at **±20**, so safe play refuses it and eats a shot (+0.93) while
aggressive takes it and doesn't (+0.07). The ditch and the bunker then do their
real job, which is **pricing the edges of a cone the player chose to accept**.

Hazards do not create decisions. **Hazards price decisions that the distance
ladder has already created.** That is why four v2 revisions and five v3 revisions
all moved the score and none of them moved the fork.

### Two shapes that put reaching in doubt

- **Reach doubt.** The required distance sits just past a comfortable card.
  Everything that measures REAL is here: The Long One (210, own 208), Dead
  Straight (205), The Grind (Bomb leaves 188, own 170 and 208), Church Pew (Bomb
  leaves 165 with water guarding the miss). Everything at 150–195 measures flat,
  every time, on every course.
- **Position upside.** A short par 4 where the big card leaves a wedge and a
  short card leaves a full iron — so attacking buys a whole shot class, not just
  proximity. This is Cart Path Only, and it is why it works despite being 330
  yards where everything reaches: the *hole* is reachable, but the **birdie**
  isn't, unless you take the drive on.

A par 3 that everyone reaches can only ever offer proximity, and proximity is
worth a fraction of a stroke. That ceiling is why The Ballwasher, Winter Rules
(160), Postcard (195) and The Pond (175) all sit between 0.20 and 0.28 no matter
what is built around them.

---

## 4. Where the courses stand

```
                    full round (mixed)   front four   spread (sd)   flats in front four
Pine Hollow               +1.64            +0.73         1.13          1
Cottonwood                +2.77            +1.50         1.40          3
Rockdale Muni             +0.10            -0.42         0.84          0
```

**Rockdale's front four is now the best-shaped in the game** — 0.22 / 0.27 / 0.82
/ 0.32, not a single flat hole, where Pine Hollow still opens with one. The
hardening worked on the axis you aimed it at: mixed play moved from −0.58 to
−0.42 through four and the aggressive spread went 1.08 → 1.30.

The mixed spread falling to 0.84 is the one number I would still fix, and §3 says
how: it is bunched because nothing in the front four is in doubt except hole 3.

**Cottonwood** still has three flats in its front four. Wrong Number has now been
revised twice and moved 0.07 → 0.13 → 0.12. It is not a hazard problem. The
approach is 183 into a green everybody reaches; there is no version of that hole
with a fork in it until the *reach* is in question.

---

## 5. What I would change, concretely

1. **The Ballwasher → 205 yards.** Keep the ditch, keep the green, keep the
   name, keep the note. Measured 0.86. This is a one-line change and it is the
   best hole on the course.
2. **Wrong Number: stop defending the approach and attack the tee shot.** At 460
   with Bomb leaving 183, both realistic approaches reach. Either lengthen so the
   approach is genuinely in doubt, or move the fork to the drive — a hazard that
   prices the Bomb's cone against a Stinger that leaves a full iron.
3. **Postcard is closer than it looks at 195.** It went 42 → 59 split. Ten more
   yards puts it past comfortable Long Iron territory and it should behave like
   Dead Straight.
4. **Retention Pond and Dew Sweepers:** both are on holes where everybody
   reaches. Leave them — they are pretty and they cost nothing. Not every hole
   has to be a fork, and Rockdale 8 being a green light home is still right.

**The revised bar, replacing §2 of the last review:** before placing a single
hazard, write down what reaching this target actually costs — which card, at what
cone width, and what the lay-up leaves. **If both answers are comfortable, no
hazard will save the hole.** Then place hazards to price the edges of the card
the player had to stretch for.

---

## 6. Credit where it is due

You retired the move you were asked to retire, hit the aim band on every hole,
and made five predictions specific enough to be wrong in a useful direction. The
`split` numbers moving that hard is what isolated `gap` as the independent
variable — if the aim band had done nothing at all, we would still be arguing
about hazards.

The unfair major is still the standing job, and it is now a much better-specified
one: **build it out of distances that are in doubt**, then use the aim band to
price them. Five of eight above 60% / 0.35 is a realistic bar for a course
designed that way round. Nothing built the other way round has ever cleared it.
