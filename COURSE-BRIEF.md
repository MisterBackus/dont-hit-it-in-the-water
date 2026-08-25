# COURSE BRIEF — new courses for *Don't Hit It In The Water*

**For:** the second AI working in `C:\Users\backu\Unnamed`
**From:** the engineering/design side
**Date:** 24 Aug 2026
**Status of the game:** playable, 48 tests passing, one course, fourteen events

You do not need to have seen this project before. Everything you need is in
this document. Do not read the source to get started — read this, and ask if
something here is ambiguous.

---

## 0. The one-paragraph version

It is a golf **season** roguelike deckbuilder. You are one player. A run is
fourteen tournaments. You draw six cards at every tee and play the hole with
them. Cards are **shots**, not clubs — each has a distance and a scatter. The
scatter is drawn on screen as a **cone**, and the ball can never finish outside
it. Survive the cut, win prize money, keep your tour card at three checkpoints,
or the run ends. Right now all fourteen events are played on the same eight
holes, which is the biggest content gap in the game. That is your job.

---

## 1. The constraint that decides everything

**The player cannot aim at a spot. Every shot aims at the centre of the green,
plus or minus about fourteen yards.**

Read that again, because it is the whole of course design here.

There is no "aim at the bunker and draw it back". There is no target selection.
The line from ball to pin is fixed, and the only real decision the player makes
is **how far to hit it** — which card to spend, and whether to add a technique
that lengthens or shortens it.

So a hole is not a shape. **A hole is a function from distance to consequence
along one line.** For every yardage the player could land on, what happens?
Everything else — bunkers out wide, trees down the sides — only exists to punish
the cone's edges, which is to say, to punish shots the player was already
gambling on.

If you design a hole that would be interesting because of *where* you aim it,
it will be flat in this game. Design holes that are interesting because of *what
numbers you own*.

---

## 2. What the player owns

The starting deck is twenty cards. These are the distances in it. "Lands" is
carry; "finishes" adds run-out.

| Shot | Carry | Run | Finishes | Scatter (half-width, yards) | Notes |
|---|---:|---:|---:|---:|---|
| Bomb It | 265 | 12 | **277** | ±32 | tee/fairway only |
| Stinger | 225 | 30 | **255** | ±13 | **cannot carry water or OB** |
| Long Iron | 200 | 8 | **208** | ±20 | |
| Mid Iron | 165 | 5 | **170** | ±12 | |
| Short Iron | 130 | 3 | **133** | ±8 | |
| Full Wedge | 105 | 0 | **105** | ±6 | shortens to the pin |
| Punch Out | 80 | 14 | **94** | ±16 | always in hand, never good |
| Pitch | 70 | 0 | **70** | ±5 | shortens to the pin |
| Splash Out | 55 | 0 | **55** | ±9 | shortens to the pin |
| Bump and Run | 40 | 18 | **58** | ±4 | short grass only, cannot carry water |
| Flop | 35 | 0 | **35** | ±4 | shortens to the pin |

Techniques modify a shot: **+40 and double scatter**, **+15 and looser**, **−15
at half scatter**, **−25 and tighter**, **+25 run-out**, and one that ignores
hazards entirely but leaves you nowhere near the hole. A hand of six is drawn
per hole from the deck, so **the player usually does not hold the number they
want.**

### The gaps are the game

Look at the ladder of finishing distances: **277 · 255 · 208 · 170 · 133 · 105 ·
94 · 70 · 58 · 55 · 35.**

The interesting gaps: **255→208** (47 yards), **208→170** (38), **170→133** (37),
**133→105** (28).

A hole is good when the number it asks for falls in a gap. Pine Hollow's 442-yard
par 4 is the reference: a 265-yard drive leaves **177**, and the player owns 170
and 208. Neither is right. That hole is the design document made playable.

**When you design a hole, do the subtraction.** Write down what the tee shot
leaves, and check whether that number is owned or awkward. A hole where the
approach is exactly 170 is a hole with no decision in it.

---

## 3. The schema you are writing to

A course is an array of eight hole objects. This is the exact type — do not
invent fields, they will not be read.

```ts
{
  num: 1,                    // 1..8, in play order
  par: 4,                    // 3 | 4 | 5 only
  length: 380,               // yards, tee to centre of green
  name: 'Handshake',         // invented — see §7
  corridor: [                // fairway half-width, interpolated between points
    { at: 0,   half: 24 },   // at = yards from tee, half = yards either side
    { at: 260, half: 22 },
    { at: 380, half: 20 },
  ],
  greenRadius: 15,           // a circle, in yards
  greenSide: 0,              // lateral offset of the green from the tee line
  hazards: [
    { surface: 'bunker', at: { down: 352, side: 30 }, rDown: 16, rSide: 11 },
  ],
  note: 'Driver leaves a wedge. Nothing to think about — that is the point.',
}
```

**Coordinates.** `down` is yards from the tee toward the green. `side` is yards
left (negative) or right (positive) of the tee-to-green line. Everything is in
yards; there are no pixels anywhere in your work.

**Hazard surfaces available:** `'bunker'`, `'water'`, `'trees'`, `'rough'`,
`'deep'`, `'ob'`. Each hazard is an **ellipse** — `rDown` is its half-length
along the hole, `rSide` its half-width across it. That is the only shape
available. A long strip of water down the right is one very elongated ellipse
(see Pine Hollow's 8th: `rDown: 130, rSide: 24`).

### How the game decides what a ball is sitting on

This order is fixed and you must design against it:

1. Behind the tee (`down < 0`) → **out of bounds**
2. Inside the green circle → **green** (the green beats every hazard)
3. Inside any hazard ellipse → that hazard, **first match in your array wins**
   — so if two overlap, order matters
4. More than 35 yards past the green → **deep rough**, automatically
5. Within the corridor half-width → **fairway**
6. Within half + 12 → **rough**
7. Within half + 26 → **deep rough**
8. Within half + 40 → **trees**
9. Beyond that → **out of bounds**

So: you get rough, deep rough, trees and OB *for free* as bands outside the
fairway. Only place a `'rough'` or `'deep'` hazard when you want it somewhere
those bands would not put it — an island of junk in the middle of the fairway,
for instance.

### What each lie costs

| Lie | Distance | Scatter | Penalty |
|---|---:|---:|---:|
| tee / fairway | ×1.00 | ×1.0 | — |
| rough | ×0.90 | ×1.7 | — |
| bunker | ×0.85 | ×1.6 | — |
| deep rough | ×0.76 | ×2.6 | — |
| trees | ×0.70 | ×2.4 | — |
| water | — | — | **+1 stroke** |
| out of bounds | — | — | **+2 strokes** |

Note how brutal deep rough and trees are: they nearly double or triple the cone.
A hole lined with trees is not "narrow", it is "one miss and the hole is over".
Use it deliberately, and rarely.

---

## 4. The rules a course must obey

These are not style preferences. Breaking them breaks the game.

**1. Eight holes.** Not nine, not eighteen. A round is eight holes and the
whole economy is calibrated on it.

**2. The cut is judged after FOUR holes — so the front four are a different
job from the back four.** This is the single most-violated rule and it has
already cost us one rebuild. See §5.

**3. Par between 31 and 33.** Pine Hollow is 32 (front 15, back 17). Stay in
that band or the scoring model needs re-deriving.

**4. No par 5 in the front four.** A par 5 before the cut is a free birdie
chance and it flattens the thing the cut is measuring.

**5. Every hole must be finishable from any lie.** Punch Out is always in hand
so this is nearly automatic, but a hole where a 94-yard Punch Out cannot make
progress — a forced 150-yard carry over water from a spot the player can be
stuck in — is a softlock. We have shipped one of those before. Do not ship
another.

**6. Nothing under 55 yards may be unplayable.** Early on, holes had no way to
handle a short approach and the game dead-ended. Check the last 60 yards of
every hole.

**7. Green radius 13–17 yards.** Smaller is unfair against a ±32 cone; larger
stops the approach mattering.

**8. Length bounds.** Par 3: 150–220. Par 4: 300–470. Par 5: 490–560. Outside
that, the distance ladder stops meaning anything.

---

## 5. The front four: what the cut now measures

**This changed today.** It used to be that the cut was a score — "level par or
better survives". That could not make a difficulty curve, because a four-hole
score is an integer piled on about four values, so moving the line one stroke
moved the survival rate by more than twenty points. The season was two cliffs
wearing a curve's clothes.

**The cut is now a place: top N and ties, where N falls from 44 to 10 across the
season, out of a field of 71.**

That changes what a front four has to do. It is no longer enough for it to be
hard. **It has to SPREAD people out.** If every player in the field shoots the
same number over your first four holes, a place-based cut becomes a coin flip
between tied scores, and the player's skill stops mattering.

So the front four needs holes where **a good decision and a bad decision produce
different numbers.** Concretely, that means:

- At least two holes where the aggressive line and the safe line have genuinely
  different expected outcomes — not just different variance.
- At least one hole where the *right* answer depends on which cards you hold.
- Not four grinding par 4s in a row. A grind compresses scores toward bogey and
  compresses the field with it.

Pine Hollow's front four is `380 par 4 · 442 par 4 · 175 par 3 · 465 par 4` —
par 15, no par 5, two long fours and a mid three. It works, but it is on the
compressed side, and a course that spreads better in the first four holes would
be a real improvement, not just variety.

The back four is the **scoring stretch**: this is where birdies live, where the
player who survived gets to make money, and where a round finds a shape. Pine
Hollow's is `520 par 5 · 310 par 4 · 210 par 3 · 545 par 5` — par 17, two fives
and a drivable four.

---

## 6. What to actually build

**Deliver two courses.** Each needs an identity you could state in one sentence,
and the two must not be the same idea in different clothes. Pine Hollow's
sentence is *"the number you need is never the number you have."*

Directions worth considering — pick from these or beat them:

**The offset green.** `greenSide` is almost unused in the game so far (Pine
Hollow's eighth uses −4, and that is all). Because every shot aims at the green
centre, a green pushed 30 yards off the tee line makes the *direct line*
diagonal, and whatever you place along that diagonal becomes unavoidable rather
than avoidable. This is the closest thing the engine has to a dogleg and nobody
has explored it. It might be the most interesting unexplored space in the whole
design.

**The short course.** Eight holes that are all reachable, where par is
protected by green size and hazards rather than by length. Scoring is low,
everyone makes birdies, and the cut is decided by who makes *more* — spread from
the top instead of from the bottom. This is a genuinely different test from Pine
Hollow and would prove the cut-by-place system works at both ends.

**The exposed course.** Wide corridors, few trees, but hazards placed exactly at
the finishing distances of the good cards. Nothing punishes a miss laterally —
everything punishes a miss in *distance*. The purest expression of §1.

**The one that is unfair on purpose.** A championship layout for majors only,
where the honest read is "survive it". Be careful: this is the easiest to do
badly, and a hole that removes the decision is not hard, it is boring.

Do not build "Pine Hollow but longer".

---

## 7. Naming — a hard rule

**No real players, no real tours, no real courses, ever.** Everything in this
game is invented, and that is not a legal precaution, it is the tone. The tour
has The Sunbelt Open and THE MASTERS OF PINE HOLLOW. The field contains people
named Ike Pike and Sung-ho Thackeray.

Hole names carry the game's humour, which is **recognition, not absurdity**. The
test: if a golfer would say *"oh no"*, it is right; if they would say *"what?"*,
it is wrong. Pine Hollow's holes are called Handshake, Church Pew, The Pond, The
Grind, Two Ways Home, Have a Go, The Long One, and Home. None of them is a joke.
All of them are a feeling.

The `note` field is one line, shown to the player, and it should tell them
something true about the hole in the voice of somebody who has played it a lot.
*"You own 185 and 160. The hole is 175. Work it out."*

---

## 8. What you must NOT do

- **Do not touch `src/`.** Two of us are working in this folder. Everything you
  write goes in `courses/`, which is yours alone.
- **Do not modify the shot cards or techniques to make a hole work.** If a hole
  needs a new card, the hole is wrong. Say so instead.
- **Do not invent new hazard surfaces or hole fields.** The schema in §3 is
  complete.
- **Do not use the word "dispersion" anywhere a player could see it.** It is
  `spread` in code and a drawn cone on screen. Never a number.
- **Do not tune by feel.** If you want to claim a hole plays to a number, say
  what you assumed and let me measure it. Every number in this game was derived
  by simulation, and about a third of my confident guesses have been wrong.

---

## 9. Deliverable

Write to `C:\Users\backu\Unnamed\courses\`:

1. **`<coursename>.ts`** — the hole array, in the exact schema of §3, with the
   same comment discipline as Pine Hollow: say *why* a hole is the way it is,
   not what the numbers are.
2. **`COURSE-NOTES.md`** — for each course: its one-sentence identity; for each
   hole, what the tee shot leaves and which card the player is expected to reach
   for; which holes carry the spread in the front four; and anything you were
   unsure about.

I will run the new courses through the balance harness and tell you what they
actually play like. Expect the numbers to disagree with your intentions on at
least a third of the holes — that is normal, and it is why the notes matter more
than the polish.

### A self-check you can run without the code

For every hole, write out this table before you consider it finished:

| From | Distance left | Cards that reach | Is that a decision? |
|---|---|---|---|

- Tee shot, best case and typical case
- What each of those leaves
- Which card covers it, and whether a technique is needed
- What happens to a shot that finishes 20 yards short, 20 long, and at each
  edge of the cone

If any row reads "Mid Iron, obviously", the hole has no decision in it. If every
row reads "nothing reaches", the hole is unfair. You are looking for **two
plausible answers with different risk**, on most holes, most of the time.

---

## 10. The pillars, for reference

Everything above descends from these. When in doubt, they are the tiebreak.

- **P1** — The economy is the sport. Money is survival.
- **P2** — Fewer cards wins. Adding to a deck dilutes it.
- **P3** — Hit ball far, hit ball short, don't hit into things. If a mechanic
  cannot be explained in one sentence to someone who has played mini golf, it
  is wrong.
- **P4** — Recognition, not absurdity. Silly is allowed; extreme crazy is not.
- **P5** — Simulation serves decisions. Detail that does not change a choice is
  not worth having.
- **P6** — Art teaches, words flavour.
- **P7** — Par is not good enough, *gradually*.
- **P8** — The cone is the whole truth. The ball can never finish outside it.
