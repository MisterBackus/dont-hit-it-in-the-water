import type { ShotCard, TechniqueCard } from '../sim/types'

/**
 * The starting deck. Cards are SHOTS, not clubs — see types.ts.
 *
 * Distances still have real gaps (240 / 200 / 165 / 130 / 105), because the
 * gap puzzle is the thing that makes a hand of six interesting: you rarely
 * hold the number you actually want.
 */
export const SHOTS: readonly ShotCard[] = [
  {
    id: 'bomb', kind: 'shot', name: 'Bomb It', carry: 265, spread: 32,
    blurb: 'As far as you can go. Wherever it wants.',
    rules: { from: ['tee', 'fairway'], roll: 12 },
  },
  {
    id: 'stinger', kind: 'shot', name: 'Stinger', carry: 225, spread: 13,
    blurb: 'Low and running. Will not carry water.',
    rules: { from: ['tee', 'fairway'], roll: 30, lowFlight: true },
  },
  {
    id: 'longiron', kind: 'shot', name: 'Long Iron', carry: 200, spread: 20,
    blurb: 'A long way, and not a precise way.',
    rules: { roll: 8 },
  },
  {
    id: 'midiron', kind: 'shot', name: 'Mid Iron', carry: 165, spread: 12,
    blurb: 'The shot you actually trust.',
    rules: { roll: 5 },
  },
  {
    id: 'shortiron', kind: 'shot', name: 'Short Iron', carry: 130, spread: 8,
    blurb: 'Close, and close to where you aimed.',
    rules: { roll: 3 },
  },
  {
    id: 'fullwedge', kind: 'shot', name: 'Full Wedge', carry: 105, spread: 6,
    blurb: 'All of it, at the flag.',
    rules: { canCutDown: true },
  },
  {
    id: 'pitch', kind: 'shot', name: 'Pitch', carry: 70, spread: 5,
    blurb: 'Soft, short, and it stops.',
    rules: { canCutDown: true },
  },
  {
    id: 'bumpandrun', kind: 'shot', name: 'Bump and Run', carry: 40, spread: 4,
    blurb: 'Along the ground. Short grass only.',
    rules: { from: ['fairway', 'tee'], roll: 18, lowFlight: true, canCutDown: true },
  },
  {
    id: 'flop', kind: 'shot', name: 'Flop', carry: 35, spread: 4,
    blurb: 'Straight up. Stops dead. Works from sand.',
    rules: { canCutDown: true },
  },
  {
    id: 'splash', kind: 'shot', name: 'Splash Out', carry: 55, spread: 9,
    blurb: 'Gets you out of the sand and not much else.',
    rules: { canCutDown: true },
  },
]

/**
 * ALWAYS in hand. A bad draw must be a problem, never a dead end —
 * you can always advance the ball, just not well.
 *
 * THERE ARE TWO OF THESE, and there has to be. Punch Out is a floor for being
 * stuck LONG; for years there was no floor for being stuck SHORT. A hand with
 * no wedge in it happens on 7.7% of holes — about half of all rounds contain
 * one — and from 36 yards the best play available was Punch Out with Choke
 * Down, which finishes 33 yards past the pin. That is not a bad option, it is
 * the absence of options: nothing to weigh, no line to find, just a number
 * being taken off you. Found in playtest, three holes in a row.
 *
 * So the free card reads the yardage. Inside 60 to the pin it is a chip, and
 * a poor one — wider than every wedge in the bag, so it never makes a real
 * short card redundant. Outside 60 it is the punch out it always was.
 */
export const PUNCH_OUT: ShotCard = {
  id: 'punchout', kind: 'shot', name: 'Punch Out', carry: 80, spread: 16,
  blurb: 'Always available. Never good.',
  rules: { lowFlight: true, roll: 14 },
}

export const CHIP_OUT: ShotCard = {
  id: 'chipout', kind: 'shot', name: 'Chip It', carry: 50, spread: 11,
  blurb: 'Always available. Rarely close.',
  rules: { roll: 8, canCutDown: true },
}

/** Inside 60 yards the free shot is a chip, not a punch. */
export const CHIP_RANGE = 60
export function freeShot(distToPin: number): ShotCard {
  return distToPin <= CHIP_RANGE ? CHIP_OUT : PUNCH_OUT
}

export const TECHNIQUES: readonly TechniqueCard[] = [
  {
    id: 'smooth', kind: 'technique', name: 'Smooth It', focus: 1,
    blurb: '15 shorter. Half the scatter.',
    effects: [{ op: 'addCarry', value: -15 }, { op: 'scaleSpread', value: 0.5 }],
  },
  {
    id: 'extra', kind: 'technique', name: 'Take the Extra Club', focus: 0,
    blurb: '+15, and a bit looser.',
    effects: [{ op: 'addCarry', value: 15 }, { op: 'scaleSpread', value: 1.35 }],
  },
  {
    id: 'rip', kind: 'technique', name: 'Grip It and Rip It', focus: 1,
    blurb: '+40 yards. Twice the scatter.',
    effects: [{ op: 'addCarry', value: 40 }, { op: 'scaleSpread', value: 2.0 }],
  },
  {
    id: 'green', kind: 'technique', name: 'Just Get It On The Green', focus: 2,
    blurb: 'Ignores every hazard. You will not be close.',
    effects: [{ op: 'ignoreHazards' }, { op: 'scaleSpread', value: 1.25 }],
  },
  {
    id: 'chase', kind: 'technique', name: 'Let It Chase', focus: 1,
    blurb: '+25 yards of run-out.',
    effects: [{ op: 'addRoll', value: 25 }],
  },
  {
    id: 'choke', kind: 'technique', name: 'Choke Down', focus: 1,
    blurb: '25 shorter, noticeably tighter.',
    effects: [{ op: 'addCarry', value: -25 }, { op: 'scaleSpread', value: 0.65 }],
  },
]

/**
 * The starting deck: every shot once, plus a second copy of the four
 * workhorses — the same shape as a starting deck full of Strikes. 20 cards.
 *
 * Balance found the first version starving: a 16-card deck dealt 6 to a hole
 * produced nearly ten Punch Outs a round, because specialist shots (Bump and
 * Run, Splash Out) are dead weight from most lies. Duplicates of the reliable
 * shots fix that without removing the gap problem.
 */
export const STARTING_DECK: readonly string[] = [
  ...SHOTS.map(s => s.id),
  'midiron', 'shortiron', 'fullwedge', 'longiron',
  ...TECHNIQUES.map(t => t.id),
]

/** Cards that are NOT in the starting deck — you only get these by earning them. */
export const REWARD_SHOTS: readonly ShotCard[] = [
  {
    id: 'fullsend', kind: 'shot', name: 'Full Send', carry: 300, spread: 46,
    blurb: 'Absurd distance. Absurd everything else.',
    rules: { from: ['tee'], roll: 15 },
  },
  {
    id: 'knockdown', kind: 'shot', name: 'Knockdown', carry: 145, spread: 5,
    blurb: 'Dead straight. Boringly reliable.',
    rules: { roll: 6 },
  },
  {
    id: 'rescue', kind: 'shot', name: 'Rescue', carry: 175, spread: 15,
    blurb: 'Long, and it works from the junk.',
    rules: { roll: 8 },
  },
  {
    id: 'cutit', kind: 'shot', name: 'Cut It', carry: 190, spread: 9,
    blurb: 'Holds its line. Nothing fancy.',
    rules: { roll: 4 },
  },
  {
    id: 'feathered', kind: 'shot', name: 'Feathered Wedge', carry: 95, spread: 3,
    blurb: 'The tightest shot you own.',
    rules: { canCutDown: true },
  },
  {
    id: 'texas', kind: 'shot', name: 'Texas Wedge', carry: 30, spread: 2,
    blurb: 'Putt it from off the green. Short grass only.',
    rules: { from: ['fairway', 'green'], roll: 22, lowFlight: true, canCutDown: true },
  },
  {
    id: 'scrape', kind: 'shot', name: 'Scrape It Out', carry: 110, spread: 12,
    blurb: 'Ugly, but it works from anywhere.',
    rules: { canCutDown: true },
  },
]

export const REWARD_TECHS: readonly TechniqueCard[] = [
  {
    id: 'committed', kind: 'technique', name: 'Fully Committed', focus: 2,
    blurb: 'Cuts the scatter to a third.',
    effects: [{ op: 'scaleSpread', value: 0.33 }],
  },
  {
    id: 'routine', kind: 'technique', name: 'Pre-Shot Routine', focus: 1,
    blurb: 'A bit shorter, a lot tighter.',
    effects: [{ op: 'addCarry', value: -8 }, { op: 'scaleSpread', value: 0.6 }],
  },
  {
    id: 'nothing', kind: 'technique', name: 'Nothing to Lose', focus: 0,
    blurb: '+25 yards. You know the cost.',
    effects: [{ op: 'addCarry', value: 25 }, { op: 'scaleSpread', value: 1.7 }],
  },
  {
    id: 'onemore', kind: 'technique', name: 'One More Club', focus: 0,
    blurb: '+30, and it runs.',
    effects: [{ op: 'addCarry', value: 30 }, { op: 'addRoll', value: 10 },
              { op: 'scaleSpread', value: 1.45 }],
  },
]

export const REWARD_POOL: readonly string[] = [
  ...REWARD_SHOTS.map(c => c.id), ...REWARD_TECHS.map(c => c.id),
  // duplicates of good basics are legitimate rewards too
  'midiron', 'shortiron', 'stinger', 'smooth', 'extra',
]

export const CARD: Readonly<Record<string, ShotCard | TechniqueCard>> = Object.fromEntries(
  [...SHOTS, ...TECHNIQUES, ...REWARD_SHOTS, ...REWARD_TECHS, PUNCH_OUT, CHIP_OUT].map(c => [c.id, c]),
)

/**
 * SIX. Not eight, and not five.
 *
 * At eight the hand was never a constraint — it read as the same permanent
 * menu of clubs with better names. Below six there is a cliff: a five-card
 * hand averages 3.5 shots, which is not enough to cover the distance ladder,
 * and scoring collapses from +1.9 to +6.5 with Punch Out carrying the round.
 *
 * At six you hold roughly four shots and two techniques, and you regularly do
 * NOT have the number you want — which is the entire point of drawing a hand.
 */
export const HAND_SIZE = 6

/**
 * THE BAG HOLDS TWENTY. A real bag legally holds fourteen clubs; ours holds
 * twenty shots, and for the same reason the rule exists in golf — the
 * question "what do you carry" only means something when you cannot carry
 * everything.
 *
 * This is the fix for dilution (ITEMS-PROPOSAL.md): measured season-long,
 * ADDING a card was worse than nothing more often than not (Knockdown: −$92k
 * added, +$1.16M swapped in for Bump and Run — the same card, sign-flipped
 * by what it displaced). Buying a card with the bag full sends you to the
 * remove screen, and something has to come out. Cutting below the cap stays
 * a paid luxury; the cap only stops the bag from silently poisoning itself.
 */
export const BAG_CAP = 20

/**
 * Focus to throw the hand back and draw a fresh six.
 *
 * Deliberately the same price as holing a ten-footer, so the trade is legible:
 * a redraw costs you a birdie later. Dead hands do exist — 80 yards of reach on
 * a 442-yard hole is not a puzzle — and this is the way out of one, at a price
 * you feel for the rest of the round.
 */
export const REDRAW_COST = 2
