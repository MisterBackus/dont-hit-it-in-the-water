# Art direction brief — *Don't Hit It In The Water*

**For an artist or AI working independently of the codebase.** You do not need to
read any code, and you should not change any. Everything you need is here.

---

## What the game is

A golf roguelike deckbuilder. You are one professional golfer with fourteen
events to earn enough money to keep your job. Each hole is a turn: you draw a
hand of shot cards, pick one, and watch where it finishes. Miss the Money List
and the run is over.

Think Slay the Spire's structure with a golf tour's fiction. Played on a laptop,
in sittings of about ninety minutes.

---

## The two rules the whole game is built on

**1. Recognition, not absurdity.** Nothing supernatural. Everything in this game
has actually happened to someone on a golf course. It's funny because it's
*true* — the corporate day with four men from a paper company, the sponsor decal
on your bag, the lesson with someone good. No talking animals, no magic, no
cryptids. If a golfer would say *"oh no"*, it's right. If they'd say *"what?"*,
it's wrong.

**2. The art teaches the mechanic; words are flavour.** A player must never need
to know a golf word to understand what something does. The picture explains it,
the number sizes it, and the golf term arrives last as a small reward. A player
should finish their first run knowing more golf than when they started and never
once have felt quizzed.

---

## The hard constraint — read this twice

The game's central object is **the cone**: a wedge drawn on a plan view of the
hole showing every place the ball could finish. Wide cone, wild shot. Narrow
cone, reliable shot. The player compares that shape against the width of the
fairway and the position of the water, and decides.

**The cone and the hole plan must stay instantly legible.** They are drawn to a
shared scale, and that honesty is the game's core promise — the ball can never
finish outside the drawn cone.

This means the current spare, technical look is not placeholder. It is a working
system, and its plainness is *why* it reads. A lusher, more illustrated cone is a
worse cone.

> **Your brief is: make this feel like something, without making the hole
> diagram harder to read.** If a direction would force the cone to become
> decorative, it is the wrong direction.

---

## What is locked (do not redesign)

- **The cone** — a wedge from the ball, drawn to hole scale.
- **The hole plan view** — overhead, tee at the bottom, green at the top,
  yardage gridlines, hazards as shapes.
- **Card anatomy** — name at the top, a diagram in the middle, the yardage
  below, one line of flavour under that.
- **The leaderboard** — position, name, score to par, holes through.

You may restyle every one of these. You may not remove the information or bury it.

## What is wanted

Three **distinct** visual worlds, far enough apart that choosing between them is
a real decision. For each:

1. **A mood board or reference set** — what world this belongs to.
2. **A palette** — 5–7 named colours, with the semantic ones called out:
   fairway, rough, sand, water, the pin, and "the cone".
3. **Typography** — a display face and a face for numbers. Yardages, scores and
   money all need to line up in columns, so the numerals must be tabular.
4. **One mocked screen** — the hole view with a cone drawn on it. This is the
   test. If it doesn't read at a glance, the direction fails regardless of how
   handsome it is.
5. **A wordmark** for the title.

## What is NOT wanted yet

- **Individual card illustrations.** The card list has changed twice this week.
  Anything drawn now is likely waste.
- **Hole illustrations.** Course content isn't final.
- **Character art.** There is no character on screen.
- **Animation.** Later, and only where it earns its place.

---

## Some texture to work from

The current look borrows a caddie's yardage book: cool paper, ink linework,
tabular numerals, course colours taken from an aerial photograph. That is *one*
answer and a deliberately safe one. It is not the only answer.

Directions worth considering, none of them mandatory:

- **Tour broadcast, 1978.** Faded film, heavy condensed type, the green of a
  television that has been on too long.
- **The clubhouse noticeboard.** Pinned cards, rubber stamps, handwritten
  starting times, a laminated local rules sheet.
- **Course architecture drawings.** Alister MacKenzie plans — ink on vellum,
  hachures, hand-lettered annotations.
- **The pro shop.** Waxed cotton, brass, leather grips, the specific green of a
  golf glove box.
- **Municipal.** Cracked cart paths, chain-link, a hand-painted sign for the
  driving range. Unpretentious and slightly sad.

Whatever the world, the numbers must stay crisp and the cone must stay obvious.

---

## Naming, if it comes up

The working title is *Don't Hit It In The Water*. It was chosen because it needs
no golf knowledge, it states a third of the game's logic, and it is funny in the
right register. Alternatives are welcome but must clear the same bar: **a person
who has never watched a golf tournament should understand it cold.**

Invented tour names in the game so far: The Sunbelt Open, Pine Hollow Classic,
Cottonwood Invitational, THE MASTERS OF PINE HOLLOW, The Muni Championship,
THE OPEN AT SALT FLATS, The Tour Championship. Players are invented too — Ike
Pike, Sung-ho Thackeray, Marcus Nakamura. No real people, no real tours, no real
courses, ever.
