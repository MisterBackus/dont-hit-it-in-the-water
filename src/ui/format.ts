/**
 * Words and numbers, shared by every screen.
 *
 * These lived at the top of App.tsx when App.tsx was every screen. They are
 * presentation only — nothing here reads or writes game state.
 */

/** Score to par, the way a board prints it: E, +3, −2. */
export function relStr(n: number): string {
  return n === 0 ? 'E' : n > 0 ? `+${n}` : `${n}`
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]!)
}

/** "Eight holes at Salt Flats" reads better than "8 holes at Salt Flats". */
export function countWord(n: number): string {
  const words = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six',
    'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve']
  return words[n] ?? String(n)
}

/** "two", "three" … for the tie-split lines. */
export function waysWord(n: number): string {
  const ways = ['', '', 'two', 'three', 'four', 'five', 'six', 'seven',
    'eight', 'nine', 'ten']
  return ways[n] ?? String(n)
}

/** "3 weeks" / "1 week" — the pluralisation the season screens keep needing. */
export function plural(n: number, one: string, many = one + 's'): string {
  return `${n} ${n === 1 ? one : many}`
}
