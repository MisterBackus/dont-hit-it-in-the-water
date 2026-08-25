import type { Boost, Cone, ShotCard, ShotPlan, Surface, TechniqueCard } from './types'
import { LIE } from './geometry'
import { TAP_IN_FEET } from './resolve/putt'

/** Aim shifts the cone's centreline sideways, in yards. */
export const AIM_OFFSET = { pin: 0, left: -14, right: 14 } as const

/** Does this boost touch this particular shot? */
function applies(b: Boost, shot: ShotCard, lie: Surface): boolean {
  switch (b.appliesTo) {
    case undefined:
    case 'all':   return true
    case 'long':  return shot.carry >= 200
    case 'short': return shot.rules.canCutDown === true
    case 'tee':   return lie === 'tee'
  }
}

export function aimOffset(aim: 'pin' | 'left' | 'right', boosts: readonly Boost[]): number {
  const widen = boosts.reduce((n, b) => n + (b.aimWiden ?? 0), 0)
  const base = AIM_OFFSET[aim]
  return base === 0 ? 0 : base + Math.sign(base) * widen
}

export function maxFocus(base: number, boosts: readonly Boost[]): number {
  return base + boosts.reduce((n, b) => n + (b.maxFocusBonus ?? 0), 0)
}

/** How far out a putt is still "good — pick it up", given the equipment. */
export function gimmeRange(boosts: readonly Boost[]): number {
  return boosts.reduce((g, b) => Math.max(g, b.gimmeFeet ?? TAP_IN_FEET), TAP_IN_FEET)
}

/**
 * Focus back on the walk to the next tee: one for showing up, one more for a
 * hole played at par or better — momentum. Pars refill the well; a blow-up
 * hole casts a shadow over the next tee. This is what lets a course designer
 * treat sequencing as a mechanic (see the focus-shadow notes in courses/):
 * cheap holes are funding rounds, and difficulty is priced partly by where
 * it lands.
 */
export function focusRegen(boosts: readonly Boost[], rel = 0): number {
  // momentumSlack (Short Memory) loosens the momentum condition: with one
  // point of slack a bogey still walks to the next tee with the full two.
  const slack = boosts.reduce((n, b) => n + (b.momentumSlack ?? 0), 0)
  return (rel <= slack ? 2 : 1) + boosts.reduce((n, b) => n + (b.focusRegenBonus ?? 0), 0)
}

export interface ConeContext {
  readonly ignoreHazards: boolean
  readonly lowFlight: boolean
}

/**
 * Build the cone from shot + techniques + lie. Pure. Single source of truth
 * for what the player is SHOWN and what is ROLLED — the preview and the
 * resolution cannot disagree, because there is only one function (P8).
 */
export function buildCone(
  plan: ShotPlan, lie: Surface, distToPin: number, boosts: readonly Boost[] = [],
): { cone: Cone; ctx: ConeContext } {
  // Lie relief, from three directions that all resolve the same way: Soft
  // Spikes make rough play as fairway, New Grooves do the same for sand, and
  // a shot built for the junk (rules.ignoreLie — Rescue, Gouge It Out) plays
  // its fairway numbers from rough, deep and trees. Sand stays sand for
  // ignoreLie shots: the ball sits down in a bunker no matter the club.
  const roughRelief = boosts.some(b => b.roughRelief)
  const sandRelief = boosts.some(b => b.sandRelief)
  const junk = lie === 'rough' || lie === 'deep' || lie === 'trees'
  const relieved =
    (roughRelief && lie === 'rough') ||
    (sandRelief && lie === 'bunker') ||
    (plan.shot.rules.ignoreLie === true && junk)
  const pen = relieved ? LIE.fairway : LIE[lie]
  let carry = plan.shot.carry * pen.carryScale
  let spread = plan.shot.spread * pen.spreadScale
  let roll = plan.shot.rules.roll ?? 0
  let ignoreHazards = false

  // Boosts land BEFORE techniques, so a technique's multiplier still reads the
  // way its card says it does relative to whatever the equipment already did.
  for (const b of boosts) {
    if (!applies(b, plan.shot, lie)) continue
    if (b.carryScale) carry *= b.carryScale
    if (b.carryAdd) carry += b.carryAdd
    if (b.spreadScale) spread *= b.spreadScale
    if (b.killRoll) roll = 0
  }

  for (const t of plan.techniques) {
    for (const e of t.effects) {
      switch (e.op) {
        case 'addCarry':    carry += e.value; break
        case 'scaleCarry':  carry *= e.value; break
        case 'scaleSpread': spread *= e.value; break
        case 'addRoll':     roll += e.value; break
        case 'ignoreHazards': ignoreHazards = true; break
      }
    }
  }

  // Short shots cut down to the number; full shots fly their full carry.
  // The gap has to stay real or the bag stops mattering.
  const full = Math.max(5, carry)
  const target = Math.max(0, distToPin - roll)
  const played = plan.shot.rules.canCutDown
    ? Math.max(5, Math.min(full, target))
    : full
  const takeOff = 1 - played / full

  /**
   * TAKING SOMETHING OFF WIDENS THE ANGLE, NOT THE YARDAGE.
   *
   * This used to multiply the spread in YARDS while the shot got shorter, so
   * the cone's angle exploded as the distance fell. Measured from 21 yards in
   * the rough: a Pitch fanned 45° either side, a Splash Out 59°, the free chip
   * 75° — a shape 96 yards across on a 21-yard shot. For comparison, Bomb It,
   * the wildest card in the bag, is 7°. Spotted in playtest, from the picture
   * alone, which is the cone doing its job (P8) even while it was wrong.
   *
   * Scaling by played/full as well makes the ANGLE the thing the penalty acts
   * on: the multiplier below is exactly the factor your angular error grows by,
   * so taking everything off a card can treble how offline it goes — while a
   * short shot still stays a short shot.
   */
  const angleMult = 1 + takeOff * TAKEOFF_PENALTY
  const spreadMult = (played / full) * angleMult

  /**
   * A HARD CEILING ON THE ANGLE, so the picture stays a picture.
   *
   * Cards with a wide base spread — Splash Out, and the free chip — still fan
   * past 45° once they are cut right down, and a shape wider than it is long
   * stops reading as "where the ball can finish" and starts reading as a bug.
   * Nothing played at its full number comes near this (the wildest is Bomb It
   * at 7°), so the cap only ever touches a shot that has had almost everything
   * taken off it.
   */
  const reach = played + roll
  const capped = Math.min(spread * spreadMult, reach * MAX_CONE_TANGENT)

  return {
    cone: {
      carry: Math.round(played),
      spread: Math.max(1, Math.round(capped)),
      aimOffset: aimOffset(plan.aim, boosts),
      roll: Math.round(roll),
    },
    ctx: { ignoreHazards, lowFlight: plan.shot.rules.lowFlight === true },
  }
}

/** No cone may fan wider than this many yards per yard of reach (~29°). */
export const MAX_CONE_TANGENT = 0.55

/**
 * How much taking distance off a card multiplies your angular error.
 *
 * Chosen on the PICTURE first, because the picture is the contract (P8): a
 * short shot's cone must never be wider than the green it is aimed at. From 21
 * yards in the rough a Pitch now fans 26° either side and spans 21 yards
 * against a 30-yard green. The broken version spanned 42, and the free chip 96.
 *
 * Then priced: 2.2 → 4.0 → 6.5 costs a mixed round +0.17 / +0.36 / +0.55 vs
 * par, against +0.62 under the old artefact. 4.0 keeps most of the difficulty
 * and all of the legibility. What is left over is paid for on the Money List,
 * which is the dial that exists for it.
 */
export const TAKEOFF_PENALTY = 4.0

/** Why a shot can't be played from here, or null if it can. */
export function whyNotPlayable(shot: ShotCard, lie: Surface): string | null {
  if (lie === 'green') return 'You are putting'
  const allowed = shot.rules.from
  if (allowed && !allowed.includes(lie)) {
    if (lie === 'bunker') return 'Not from sand'
    if (lie === 'trees') return 'Not from the trees'
    if (lie === 'rough' || lie === 'deep') return 'Needs short grass'
    return 'Not from here'
  }
  const pen = LIE[lie]
  if (pen.onlyFrom && !pen.onlyFrom.includes(lie)) return 'Not from here'
  if (lie === 'bunker' && !allowed?.includes('bunker') && shot.carry > 90) {
    return 'Too much from sand'
  }
  return null
}

export function focusCost(techniques: readonly TechniqueCard[]): number {
  return techniques.reduce((n, t) => n + t.focus, 0)
}
