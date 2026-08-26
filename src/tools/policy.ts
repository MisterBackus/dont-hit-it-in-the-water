/**
 * Scripted policies for the balance harness.
 *
 * A policy evaluates a candidate shot by SAMPLING ITS CONE against the real
 * hole geometry — the same thing a human does by looking at the picture.
 * Risk appetite is which percentile of the outcome distribution it optimises:
 *   safe → the 80th (avoid the disaster)
 *   mixed → the mean
 *   aggressive → the 25th (chase the good one)
 */
import { CARD, freeShot } from '../content/cards'
import { buildCone } from '../sim/effects'
import { whyNotPlayable } from '../sim/effects'
import { LIE, surfaceAt, toPin } from '../sim/geometry'
import { CARRY_JITTER, aimFrame, rollAfterPitch } from '../sim/resolve/shot'
import type { AimChoice, Boost, HoleSpec, Point, ShotCard, Surface, TechniqueCard } from '../sim/types'

export type Policy = 'safe' | 'mixed' | 'aggressive'

const AIMS: readonly AimChoice[] = ['pin', 'left', 'right']
const AIM_DX = { pin: 0, left: -14, right: 14 } as const
const SAMPLES = 11

/**
 * DEPTH IN THE PICTURE (DEPTH-DECISION.md): the appetites read the cone's
 * depth band, not just its width. Each lateral sample is taken at three
 * depths — the short edge, the centre and the long edge of the pitch band,
 * the same ± CARRY_JITTER resolution rolls (uniformly, so the edges are as
 * real as the middle). Water and OB are then judged where the sample
 * PITCHES, the crust / green / collar where it RESTS — exactly the two
 * arrival points resolveShot keeps. Which end of that spread of outcomes a
 * policy optimises is already its appetite (safe 80th, aggressive 25th):
 * safe now sees the dunk on the short die, aggressive sees the carry on the
 * long one, and a naked carry is finally something they can disagree about.
 */
const DEPTHS = [-CARRY_JITTER, 0, CARRY_JITTER] as const

function putts(feet: number): number {
  const make = feet <= 3 ? 0.95 : feet <= 8 ? 0.52 : feet <= 15 ? 0.26
    : feet <= 25 ? 0.13 : feet <= 40 ? 0.055 : 0.02
  return 2 - make + (feet > 30 ? 0.2 : 0)
}

function evalPos(hole: HoleSpec, p: Point, surface: Surface): number {
  const pen = LIE[surface].penaltyStrokes ?? 0
  if (pen > 0) return pen + 3.1
  const d = toPin(hole, p)
  if (surface === 'green') return putts(d * 3)
  const lieCost = surface === 'rough' ? 0.25 : surface === 'deep' ? 0.6
    : surface === 'trees' ? 0.95 : surface === 'bunker' ? 0.5 : 0
  const shotsToGreen = d <= 230 ? 1 : d <= 420 ? 2 : 3
  const proximity = d <= 230 ? Math.max(3, d * 0.07) : 14
  return lieCost + shotsToGreen + putts(proximity * 3)
}

function percentile(v: number[], p: number): number {
  const s = [...v].sort((a, b) => a - b)
  return s[Math.min(s.length - 1, Math.floor(s.length * p))]!
}

export interface Choice {
  shot: ShotCard
  techs: TechniqueCard[]
  aim: AimChoice
}

/** Choose from the HAND — this is the whole point of the deck layer. */
export function chooseShot(
  hole: HoleSpec, ball: Point, lie: Surface, hand: readonly string[],
  policy: Policy, focus: number, boosts: readonly Boost[] = [],
): Choice {
  // THE POLICY MUST PLAN WITH ITS EQUIPMENT ON.
  //
  // It used to build candidate cones with no boosts and then play the shot
  // with them, so every yard of extra carry became an overshoot it had not
  // chosen. Measured, that made Super Ball — "everything goes 10% further" —
  // cost $1.32M a season, and Long Tees $541k. Those were not bad boosts.
  // They were a blind planner. A human sees the cone move and clubs down.
  //
  // The same lesson covers the JUNK SPREAD FLOOR (JUNK-VERDICT.md SHIPPED):
  // every candidate below is priced through buildCone, the one place the
  // floor lives, so this planner sees a wedge from the rough fan to 12 yards
  // exactly as the player's cone does. If spread arithmetic ever grows a
  // second home here, the floor must move into it too — a blind planner
  // mismeasures a rule.
  const free = freeShot(toPin(hole, ball))
  const shots: ShotCard[] = [
    ...hand.map(id => CARD[id]).filter((c): c is ShotCard => !!c && c.kind === 'shot'),
    free,
  ]
  const availTechs = hand.map(id => CARD[id])
    .filter((c): c is TechniqueCard => !!c && c.kind === 'technique')

  const combos: TechniqueCard[][] = [[]]
  for (const t of availTechs) {
    if (t.focus <= focus) combos.push([t])
    if (policy !== 'safe') {
      for (const u of availTechs) {
        if (u.id !== t.id && t.focus + u.focus <= focus) combos.push([t, u])
      }
    }
  }

  let best: Choice = { shot: free, techs: [], aim: 'pin' }
  let bestScore = Infinity
  const dist = toPin(hole, ball)
  const fr = aimFrame(hole, ball)

  for (const shot of shots) {
    if (whyNotPlayable(shot, lie)) continue
    for (const techs of combos) {
      for (const aim of AIMS) {
        const { cone, ctx } = buildCone({ shot, techniques: techs, aim }, lie, dist, boosts)
        const outcomes: number[] = []
        for (let i = 0; i < SAMPLES; i++) {
          const t = (i / (SAMPLES - 1)) * 2 - 1
          const lat = AIM_DX[aim] + t * cone.spread
          const w = 1 - Math.abs(t)
          for (const jit of DEPTHS) {
            // mirror resolveShot exactly: pitch at the jittered carry, roll
            // attenuated by the pitch surface, hazards judged per arrival
            // point — pitch for a low ball's water/OB, rest for everything
            const fwd = cone.carry * (1 + jit)
            const pitch: Point = {
              down: ball.down + fr.dir.down * fwd + fr.perp.down * lat,
              side: ball.side + fr.dir.side * fwd + fr.perp.side * lat,
            }
            const pitchSf = surfaceAt(hole, pitch)
            const rolled = rollAfterPitch(pitchSf, cone.roll)
            const p: Point = rolled === 0 ? pitch : {
              down: pitch.down + fr.dir.down * rolled,
              side: pitch.side + fr.dir.side * rolled,
            }
            let sf = surfaceAt(hole, p)
            if (ctx.lowFlight && (pitchSf === 'water' || pitchSf === 'ob')) sf = pitchSf
            if (ctx.ignoreHazards && (sf === 'water' || sf === 'ob')) sf = 'rough'
            const score = evalPos(hole, p, sf)
            for (let k = 0; k < Math.max(1, Math.round(w * 3)); k++) outcomes.push(score)
          }
        }
        const score = policy === 'safe' ? percentile(outcomes, 0.80)
          : policy === 'aggressive' ? percentile(outcomes, 0.25)
          : outcomes.reduce((a, b) => a + b, 0) / outcomes.length
        if (score < bestScore) { bestScore = score; best = { shot, techs, aim } }
      }
    }
  }
  return best
}
