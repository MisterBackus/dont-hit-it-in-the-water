import type { Standing } from '../sim/resolve/field'

function rel(n: number): string {
  return n === 0 ? 'E' : n > 0 ? `+${n}` : `${n}`
}

/**
 * The board. Ties share a place and are marked T, the way a real one does.
 * Around you it always shows a window, so you can see exactly who you have to
 * catch and who is breathing on you.
 *
 * THE COLUMNS ARE LOCKED (ART-BRIEF): position, name, score to par, holes
 * through. All four are still here, in that order, and the header now names
 * them — POS / PLAYER / TOTAL / THRU — instead of leaving the last two columns
 * as unlabelled numbers the player had to infer. The design pass is weight and
 * alignment only: the totals are tabular and right-aligned so a column of
 * scores reads as a column, your row is a filled band rather than a faint tint,
 * and the gap marker looks like a break in the field instead of an ellipsis
 * someone forgot to delete.
 */
export function Leaderboard({
  rows, window: win = 5, title, thruTotal,
}: { rows: readonly Standing[]; window?: number; title?: string; thruTotal?: number }) {
  const youAt = rows.findIndex(r => r.you)
  const top = rows.slice(0, win)
  const near = youAt > win
    ? rows.slice(Math.max(win, youAt - 2), Math.min(rows.length, youAt + 3))
    : []
  const gap = near.length > 0 && near[0]!.place > top[top.length - 1]!.place + 1

  const Row = ({ r }: { r: Standing }) => (
    <div className={`lbrow ${r.you ? 'you' : ''}`}>
      <span className="lbpos">{r.tied ? 'T' : ''}{r.place}</span>
      <span className="lbname">
        {r.star && <span className="lbstar" title="one of the tour's marquee names">★</span>}
        {r.name}
      </span>
      <span className={`lbtot ${r.total < 0 ? 'under' : r.total > 0 ? 'over' : ''}`}>{rel(r.total)}</span>
      <span className="lbthru">{thruTotal && r.thru >= thruTotal ? 'F' : r.thru}</span>
    </div>
  )

  return (
    <div className="leaderboard">
      <div className="lbtitle">
        <span>{title ?? 'Leaderboard'}</span>
        <span className="lbcount">{rows.length} playing</span>
      </div>
      <div className="lbhead">
        <span className="lbpos">pos</span>
        <span className="lbname">player</span>
        <span className="lbtot">total</span>
        <span className="lbthru">thru</span>
      </div>
      {top.map(r => <Row key={r.name} r={r} />)}
      {gap && <div className="lbgap"><i /></div>}
      {near.map(r => <Row key={r.name} r={r} />)}
    </div>
  )
}
