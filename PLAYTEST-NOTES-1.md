# The night the owner played and wrote everything down

**26 Aug 2026** · Twelve notes, taken live across two seasons on v9–v11,
batched here rather than acted on mid-round (the standing rule). Each carries
a recommendation, not a menu — the owner asked for calls.

Worth stating what the shape of this list says. **Not one note is "the golf
feels wrong."** Every single one is either the interface saying something the
simulation does not back, or a number that was written rather than measured.
The game underneath is in good shape; what it says about itself is not.

---

## A. Free fixes — no risk, no measurement, do them first

### 1. The carrying marks stack vertically *(my bug, tonight)*
The topbar's equipment row wraps one mark per line. I made that row a flex
container with `flex-wrap: wrap` when the drawings replaced the glyphs, and
the topbar squeezes that column narrow, so it wraps. Text glyphs flowed inline
and never had the problem.
**→ `flex-wrap: nowrap` on `.bagmarks`, and stop that column being
compressed.** Two lines of CSS.

### 2. Encounter banners haunt you all season
`lastEncounter` is stamped with the hole index it happened on and **never
cleared**, so an encounter from event 2 hole 5 replays on hole 5 of every
event afterwards. The owner watched the Rules Official bill him again at event
14. `startEvent` already wipes scores, cut, focus and the log; this was missed
from the list.
**→ Clear it at `startEvent`, AND stamp it with the event so a hole index
alone can never resurrect it.** Belt and braces; the same mistake is easy to
make twice.

### 3. No way back from the swap screen
Buy a card, face "something has to come out", change your mind — refused. The
escape is to remove the card you just bought, which the code comment names and
the screen never does, and which charges you for the privilege. Meanwhile a
**paid cut** that you back out of is refunded in full, three lines away.
**→ Add the back arrow, refunding the purchase, exactly like the paid-cut
path.** Nothing has happened at that point: no card in the bag, no hole
played. The only argument for the current behaviour is punishing a misclick.

### 4. The headcover promises a timer it does not have
"It rides in your bag now. You check over your shoulder for four holes." It is
permanent equipment — the *stakes* line says so ("a whisker of calm, for the
rest of the season") — but the outcome line is where every other encounter
states a real effect, so "four holes" reads as a duration.
**→ Rewrite so the permanence is the joke: "It rides in your bag now. It is
going to ride there all season."** And sweep the other outcome lines for the
same failure while in there.

---

## B. The interface will not explain itself — one pass, four notes

These are one problem wearing four hats, and they should be built as one
thing. Ranked by stakes, because that is the order that matters.

### 5. Nothing explains a card where you decide about it
Worst on the **swap screen**: no blurb, no tooltip, no diagram — a name and a
number, on a permanent choice the screen itself labels *"this cannot be
undone."* Then the **shop** (buying), then **schedule and bag** (reference),
which at least have native `title` tooltips — slow, easy to miss, invisible on
touch, which is why they read as absent.
**→ One explanation surface: hover AND tap, instant, styled. Show the card's
own diagram — which already exists on the play screen and cannot lie — plus
its line of text, everywhere a card is listed.** A card face that teaches
during a hole should not go silent at the moment you choose whether to keep it.

### 6. "The bag" is two different things
The topbar drawer (free, shows cards and equipment) and the redraw button
(2 focus, labelled *"Check the bag · six new cards"*). The owner assumed the
expensive one was the price of looking, and played several events without
consulting his own equipment.
**→ Rename the redraw, not the drawer** — the drawer genuinely is your bag.
Lead with what it does: **"New hand · six cards."** The old fiction is not
worth the collision.

### 7. Equipment is unreachable where you need it
Absent entirely from the schedule screen; present in the shop and the play
drawer; the topbar marks answer neither hover nor tap.
**→ Equipment appears wherever the bag appears** (reuse the shop's Carrying
block on the schedule), **and the marks answer a tap**, so a phone works.

### 8. Remove the icons from techniques
Owner's call, needs one clarification: the **cone diagrams** added tonight, or
the **◆ focus pips**?
**→ If it is the diagrams: remove them from the hand, keep them in the shop
and swap screens.** In the hand you already know your own techniques and the
space is tight; in the shop you are evaluating a card you have never played,
which is exactly note 5's problem. If it is the pips, they stay — the focus
cost is the price, and a price cannot be implicit.

---

## C. Three numbers that were never asked to justify themselves

Everything in this game is measured — eighteen instruments, six anchorings —
**except these.** They were written.

### 9. The Money List cannot be topped
Win **all fourteen events outright** and you earn **$28.90M**, which the
ladder ranks **4th**. Rank 1 wants $50M. Places 1–3 are unreachable by
arithmetic. The owner won 12 of 13 and finished 6th, which is how this
surfaced. The rungs were scaled from simulated seasons and extended upward by
ratio, and nobody checked the extension against what the game's own purses can
pay one player.
**→ Re-anchor the ladder's top so a perfect season is rank 1** — first rung
just under $28.9M, rungs beneath rescaled. **Display only: MONEY_CHECKS are
untouched, so no economy re-derivation.** Cheapest high-value fix on the list,
and the one that currently tells a direct lie about the player's best result.

### 10. Encounter money is rounding error
Four values in the whole system: −$150k, +$150k, +$200k, +$500k. Against
$2.6M/$10.1M/$13.8M checks and $16–26M seasons, a fine costs **under one
percent of a season** — less than the cheapest item in the shop. It cannot
change a decision, so it is not a consequence, it is a receipt. Six
re-anchorings happened around these numbers without touching them.
**→ Express them as a FRACTION of the live Money List check, not as
constants** — then they can never drift again, which is the actual bug.
Build `encountercheck` first: encounters land on roughly a third of made cuts,
so a swing big enough to sting is big enough to move survival.

### 11. The sharpness ramp is the largest untested lever in the game
Cones narrow **43% across a season for free** — ×1.40 at event 1 to ×0.80 at
event 14, about 4% every tournament, whether you buy anything or not. That
free ramp is larger than anything purchasable: Forged Wedges are ×0.55 but
only on short shots, the Golden Driver ×0.66 only past 200 yards. The calendar
hands you 43% **on every shot in the bag**, no cost, no decision.
This collides with P7 — the bar is supposed to rise until safe play cannot
clear it — because a large share of "getting better" is just time passing. It
is also the most likely explanation for **12 wins from 13** against the
marquee ramp's registered 45–60%: the stars were tuned against harness players
who do not have the owner's judgment, and the free ramp carries the rest.
**→ Sweep two shapes: (a) shallower overall, ×1.40 → ×1.00; (b) front-loaded
then flat, so the free gains land early and late-season power is something you
bought. Recommend (b)** — it keeps "you start the season a worse golfer" while
making the late season lean on purchases, which is where the decisions are.
This one forces a calibration pass. It is worth it.

---

## D. Measure before touching

### 12. Focus is the strongest thing in the game
The owner's read, and **the price table already agreed** — five of the eight
most expensive items touch the focus economy, including the priciest thing in
the game (Inside the Leather, $2.45M, ≈$4.9M measured season value, from one
sentence about eight-foot putts). Focus buys accuracy (every technique),
birdies (the whole scoring engine), and card selection (the redraw). Nothing
else in the game does more than one of those. His own season: three of four
major drops were focus items, 76 bought sinks, 18 redraws.
**→ Do NOT nerf it. Measure it.** Focus being central is P1, by design; the
question is only whether a focus item is the *correct purchase every time*,
which would quietly make the six-purchase allowance less of a choice than it
looks. Rank items by survival contribution rather than raw value and find out.
A nerf before that measurement would be exactly the kind of guess this project
does not make.

---

## The order I would take them

1. **Section A** tonight — four fixes, no risk, no measurement.
2. **Section B** as one UI pass — the swap screen first, since it is an
   irreversible decision made blind.
3. **Note 9** (the ladder) on its own — display-only, high value, cheap.
4. **Note 11** (sharpness) as a proper measured proposal, since it forces a
   calibration and it is the biggest thing on this list.
5. **Notes 10 and 12** behind their instruments, in that order.
