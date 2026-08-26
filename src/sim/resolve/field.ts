import type { RngState } from '../rng'
import { hash, makeRng, next } from '../rng'
import {
  FIRST, LAST, FIELD_SIZE, STARS,
  STAR_BAND_BETA, STAR_BAND_CAP, STAR_COUNT, STAR_RAMP_END,
} from '../../content/players'

export interface FieldPlayer {
  readonly name: string
  /** how good they are, 0..1 — fixed for the event */
  readonly skill: number
  /** strokes vs par so far */
  readonly total: number
  /** holes completed */
  readonly thru: number
  readonly cut: boolean
  /** one of the run's marquee names (FIELD-CEILING.md §5–6) */
  readonly star?: boolean
  /**
   * THE MARQUEE RAMP's bias term — added in advanceField exactly where
   * courseShift is subtracted, so a star scores like a better player without
   * the 0..1 skill contract moving and without any extra roll. 0 (or absent,
   * on fields from older saves) for the other 67 and for every spring week.
   */
  readonly eliteEdge?: number
}

export interface Standing {
  readonly place: number
  readonly name: string
  readonly total: number
  readonly thru: number
  readonly you: boolean
  /** true when tied with the player above */
  readonly tied: boolean
  /** a marquee name — the board marks them (FIELD-CEILING.md §5) */
  readonly star: boolean
}

export const YOU = 'You'

/**
 * Build the week's field. Deterministic from the field RNG stream.
 *
 * `floorLift` is FIELD RESPONSE (FIELD-RESPONSE.md): the skill floor rises
 * through the season while the ceiling stays put. This is survivorship — the
 * Money List sends the bottom of the tour home at 5, 9 and 12, so a late
 * field is the players who kept their cards. The tour's best are the tour's
 * best all year; what changes is how thick the crowd between you and them is.
 * Without it, the player improves on three axes against a field that
 * improves on none, and every seasonal difficulty dial measured as a fake.
 */
export function makeField(rng: RngState, floorLift = 0): readonly [FieldPlayer[], RngState] {
  let r = rng
  const lo = 0.25 + floorLift
  const used = new Set<string>()
  const out: FieldPlayer[] = []
  while (out.length < FIELD_SIZE) {
    const [a, r1] = next(r); const [b, r2] = next(r1); const [c, r3] = next(r2)
    r = r3
    const name = `${FIRST[Math.floor(a * FIRST.length)]} ${LAST[Math.floor(b * LAST.length)]}`
    if (used.has(name)) continue
    used.add(name)
    // most of the field is decent; a few are hot and a few are not
    out.push({ name, skill: lo + c * (0.85 - lo), total: 0, thru: 0, cut: false })
  }
  return [out, r] as const
}

/* ------------------------------------------------------------------ *
 * THE MARQUEE RAMP (FIELD-CEILING.md §5–6). Three or four persistent
 * names overlay each week's top skill draws; from event 5 they carry an
 * eliteEdge bias that ramps to the finale plus a bounded, lagged,
 * upward-only band that chases an outlier player. Determinism: the
 * roster is a one-shot salted hash (salt 7 — the bank owns 1–4, the
 * schedule 5, the encounters 6), the edge is a pure function of (event,
 * trailing pace), and neither adds a draw nor a roll anywhere.
 * ------------------------------------------------------------------ */

/** The roster hash's salt — one-shot derived stream, like the schedule's 5. */
const STAR_SALT = 7

/**
 * Which stars this run carries, in pecking order: index 0 takes the week's
 * highest skill draw. A one-shot Fisher–Yates on the canon roster, from a
 * derived stream that no bank stream ever sees — same seed, same names.
 * NB: the shuffle depends on roster size, so growing the canon reshuffles
 * every seed's subset — a save-version event like any reducer-visible change.
 */
export function starNamesFor(seed: number, k = STAR_COUNT): readonly string[] {
  let r = makeRng(hash(seed, STAR_SALT))
  const names = STARS.map(s => s.name)
  for (let i = names.length - 1; i > 0; i--) {
    const [v, r2] = next(r)
    r = r2
    const j = Math.floor(v * (i + 1))
    const t = names[i]!; names[i] = names[j]!; names[j] = t
  }
  return names.slice(0, Math.min(k, names.length))
}

/**
 * The pace model behind the band, in the probe's own currency: the §2
 * winner-gap table measured a star at effective skill 1.0 expecting −1.74
 * over eight holes and 1.6 expecting −5.34 — six strokes per skill unit.
 * Linear is honest here; the sweeps price the endpoints, not the middle.
 */
const PACE_AT_1 = 1.74
const PACE_PER_SKILL = 6.0
/** effective skill whose expected eight-hole pace is `p` strokes under par */
const skillForPace = (p: number) => 1 + (p - PACE_AT_1) / PACE_PER_SKILL

/** eliteEdge = 0 through here — spring is names only, by construction */
const STAR_QUIET_THROUGH = 4
/** ordinary top-of-field form — the draw ceiling, where the ramp starts */
const RAMP_BASE = 0.85
/** the season is 14 events; literal here so resolve/ keeps zero content
 *  value-imports beyond the name lists (locked by test) */
const FINALE = 14

export interface StarDials {
  readonly ramp: number
  readonly beta: number
  readonly cap: number
}
export const STAR_DIALS: StarDials = {
  ramp: STAR_RAMP_END, beta: STAR_BAND_BETA, cap: STAR_BAND_CAP,
}

/**
 * The week's star form, as an effective-skill TARGET (the probe's "k elites
 * @e"): a star plays at max(own draw, target), so the floor is ordinary
 * top-of-field form and nobody is ever pulled DOWN.
 *
 *   ramp — 0 through event 4, then RAMP_BASE rising to `ramp` at the finale.
 *          Identical every run: the honest part, the season's story.
 *   band — clamp(0, chase − ramp, cap): the stars run at `beta`× the
 *          player's trailing sub-par pace (mean rel over the last three
 *          made cuts — lagged, so it follows form rather than mirroring
 *          it), never more, capped. A collapsing player's band relaxes
 *          toward zero and the ramp remains — never below the stage
 *          baseline, never a death spiral.
 */
export function starTarget(
  event: number, trailingRel: number, dials: StarDials = STAR_DIALS,
): number {
  if (event <= STAR_QUIET_THROUGH) return 0
  const ramp = RAMP_BASE
    + (dials.ramp - RAMP_BASE) * (event - STAR_QUIET_THROUGH) / (FINALE - STAR_QUIET_THROUGH)
  const pace = Math.max(0, -trailingRel)
  const chase = skillForPace(dials.beta * pace)
  const band = Math.min(Math.max(0, chase - ramp), dials.cap)
  return ramp + band
}

/**
 * Paint the run's stars onto the week's field: the k highest skill draws
 * take the star names (pecking order — the best draw is star number one)
 * and the week's eliteEdge. IN PLACE, order preserved, draw count
 * untouched: the field stream cannot tell this ever happened, which is
 * what keeps events 1–4 digit-identical and every replay honest.
 */
export function overlayStars(
  field: readonly FieldPlayer[], names: readonly string[], target: number,
): FieldPlayer[] {
  const top = field.map((p, i) => ({ skill: p.skill, i }))
    .sort((a, b) => b.skill - a.skill)
    .slice(0, names.length)
    .map(t => t.i)
  const starAt = new Map<number, string>()
  top.forEach((fi, rank) => starAt.set(fi, names[rank]!))
  return field.map((p, i) => {
    const name = starAt.get(i)
    if (name === undefined) return p
    // ×0.42 converts effective skill to bias — the same factor the roll uses
    return { ...p, name, star: true, eliteEdge: Math.max(0, target - p.skill) * 0.42 }
  })
}

/**
 * Play one hole for everyone still in. Better players make more birdies and
 * fewer messes; nobody is immune to a par 5.
 *
 * `par` is the hole being played — passed in, so the field has no idea which
 * course file it is on (this also killed a state↔field value-level import
 * cycle, SCHEDULE-PLAN.md §1.3).
 *
 * `courseShift` is the course's fieldShift (SCHEDULE-PLAN.md §3): a flat bias
 * offset — the fiction of everyone suffering the same course. It moves
 * everyone, winners included, which is what a hard course does; it is NOT
 * fieldStrength, which is a skill floor lift and can only make the field
 * better. DETERMINISM: it moves the scoring thresholds only, never the call
 * count — still exactly two rolls per live player per hole on every course.
 */
export function advanceField(
  field: readonly FieldPlayer[], par: number, rng: RngState, courseShift = 0,
): readonly [FieldPlayer[], RngState] {
  let r = rng
  const out = field.map(p => {
    if (p.cut) return p
    const [a, r1] = next(r); const [b, r2] = next(r1)
    r = r2
    // Triangular-ish roll, shifted by skill; par 5s score a shade better.
    //
    // A LARGER bias is a BETTER player: birdie needs roll < bias-0.30, bogey
    // needs roll >= bias+0.28, so raising bias buys birdies and buys off
    // bogeys. Skill therefore has to be ADDED. It used to be subtracted, and
    // par 5s subtracted too, which inverted the entire field: the best player
    // in it averaged +4.60 over eight holes and the worst +0.21. That is why
    // the cut never removed anyone on its own and had to be propped up by
    // fieldEdge, and why you could stand 11th of 72 while shooting level par.
    const roll = (a + b) / 2
    // eliteEdge is the marquee ramp (overlayStars): a pure bias term, no
    // extra draw — the call count is untouched on every course, star or not
    const bias = 0.20 + p.skill * 0.42 + (par === 5 ? 0.08 : 0) + (p.eliteEdge ?? 0) - courseShift
    const shot = roll < bias - 0.30 ? -1
      : roll < bias + 0.28 ? 0
      : roll < bias + 0.52 ? 1
      : 2
    return { ...p, total: p.total + shot, thru: p.thru + 1 }
  })
  return [out, r] as const
}

export interface CutResult {
  readonly field: FieldPlayer[]
  readonly made: boolean
  /** the score that got in — for display, not for the decision */
  readonly line: number
  /** how many advanced once ties were honoured */
  readonly advanced: number
}

/**
 * TOP N AND TIES — the cut is a place, not a score.
 *
 * A stroke line cannot make a difficulty curve. Four-hole scores are integers
 * piled on about four values, so moving the line one stroke moved make-cut by
 * more than twenty points: the season measured 72 57 60 60 · 36 38 44 42 42 ·
 * 19 18 18 15 24, which is two cliffs wearing a curve's clothes. A place is
 * continuous. N can step by one player a week and the squeeze is smooth.
 *
 * It also puts the decision on the leaderboard that is already on screen, and
 * retires fieldEdge — the fudge that dragged the field's median onto the line
 * every week so that a stroke cut would remove anybody at all.
 */
export function rankCut(
  field: readonly FieldPlayer[], yourTotal: number, n: number,
): CutResult {
  const live = field.filter(p => !p.cut)
  const totals = [...live.map(p => p.total), yourTotal].sort((a, b) => a - b)
  const line = totals[Math.min(n, totals.length) - 1]!
  const cut = field.map(p => (!p.cut && p.total > line ? { ...p, cut: true } : p))
  return {
    field: cut,
    made: yourTotal <= line,
    line,
    advanced: totals.filter(t => t <= line).length,
  }
}

/** The board, with you slotted in. Ties share a place. */
export function standings(
  field: readonly FieldPlayer[], yourTotal: number, yourThru: number, youCut: boolean,
): Standing[] {
  const rows = [
    ...field.filter(p => !p.cut).map(p => ({
      name: p.name, total: p.total, thru: p.thru, you: false, star: p.star === true,
    })),
    ...(youCut ? [] : [{ name: YOU, total: yourTotal, thru: yourThru, you: true, star: false }]),
  ].sort((a, b) => a.total - b.total || (a.you ? -1 : b.you ? 1 : 0))

  // First pass: assign places, ties sharing the lowest number.
  let place = 0
  let lastTotal: number | null = null
  const placed = rows.map((row, i) => {
    if (lastTotal !== row.total) place = i + 1
    lastTotal = row.total
    return { ...row, place }
  })
  // Second pass: a real board marks EVERY player in a tie group with T,
  // including the first one. Counting per place is the only way to know.
  const size = new Map<number, number>()
  for (const r of placed) size.set(r.place, (size.get(r.place) ?? 0) + 1)
  return placed.map(r => ({ ...r, tied: (size.get(r.place) ?? 1) > 1 }))
}

/** Where you finished — used for prize money. */
export function yourPlace(rows: readonly Standing[]): number {
  return rows.find(r => r.you)?.place ?? 0
}
