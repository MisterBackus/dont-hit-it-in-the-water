/**
 * Putting is DETERMINISTIC. There is no roll on the green.
 *
 * It was a coin flip with visible odds, and that was worse than hiding them:
 * being told 75% and then missing is a promise broken. Playtest, twice:
 * "blamed it on putting RNG" → "missing 75%ers with only RNG to blame".
 *
 * The rule this restores is the one Slay the Spire never breaks: cards do what
 * they say. Randomness belongs in what you are DEALT, not in whether your play
 * works. The cone survives that test because a missed shot still lands
 * somewhere and where it lands has texture. In-or-out has no texture at all.
 *
 * So distance alone decides how many putts par costs you — and a birdie is
 * something you BUY with focus. Which makes proximity precisely valuable,
 * gives focus the second sink it badly needed, and means every stroke lost on
 * the green is one you chose.
 */

/** Putts to get down from here, if you spend nothing. Distance in FEET. */
export function baseputts(feet: number): number {
  if (feet <= 4) return 1
  if (feet <= 45) return 2
  return 3
}

/** Focus to hole it outright, or null if it is out of range. */
export function sinkCost(feet: number): number | null {
  if (feet <= 4) return 0          // already a tap-in
  if (feet <= 10) return 2
  if (feet <= 25) return 3
  if (feet <= 40) return 4
  return null                       // nobody is holing a 45-footer on purpose
}

export interface PuttResolution {
  readonly strokes: number
  readonly text: string
}

export function resolvePutting(feet: number, sink: boolean): PuttResolution {
  if (feet <= 4) {
    return { strokes: 1, text: 'Tapped in.' }
  }
  if (sink) {
    return { strokes: 1, text: `Holed it from ${feet} feet.` }
  }
  const n = baseputts(feet)
  return {
    strokes: n,
    text: n === 2
      ? `Two putts from ${feet} feet.`
      : `Three putts from ${feet} feet — that is a long way.`,
  }
}
