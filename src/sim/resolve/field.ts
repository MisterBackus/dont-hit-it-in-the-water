import type { RngState } from '../rng'
import { next } from '../rng'
import { FIRST, LAST, FIELD_SIZE } from '../../content/players'

export interface FieldPlayer {
  readonly name: string
  /** how good they are, 0..1 — fixed for the event */
  readonly skill: number
  /** strokes vs par so far */
  readonly total: number
  /** holes completed */
  readonly thru: number
  readonly cut: boolean
}

export interface Standing {
  readonly place: number
  readonly name: string
  readonly total: number
  readonly thru: number
  readonly you: boolean
  /** true when tied with the player above */
  readonly tied: boolean
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
    const bias = 0.20 + p.skill * 0.42 + (par === 5 ? 0.08 : 0) - courseShift
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
    ...field.filter(p => !p.cut).map(p => ({ name: p.name, total: p.total, thru: p.thru, you: false })),
    ...(youCut ? [] : [{ name: YOU, total: yourTotal, thru: yourThru, you: true }]),
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
