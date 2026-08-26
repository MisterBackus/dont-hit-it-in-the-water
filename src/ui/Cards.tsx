import type { ShotCard, TechniqueCard } from '../sim/types'
import { CARD as CARDS } from '../content/cards'

/**
 * The cone on the card face. DESIGN.md §7.0 — the player reads the SHAPE,
 * never a spread number. Every card uses the same scale (0–300 yards deep,
 * ±48 wide) so comparing two cards is honest.
 */
const BOX_W = 130, BOX_H = 74, MAX_Y = 300, MAX_SIDE = 48

export function CardCone({ carry, spread, roll, dim }: {
  carry: number; spread: number; roll?: number; dim?: boolean
}) {
  const len = Math.min(BOX_H - 8, (carry / MAX_Y) * (BOX_H - 10))
  const half = Math.min(BOX_W / 2 - 2, (spread / MAX_SIDE) * (BOX_W / 2))
  const rollLen = Math.min(14, ((roll ?? 0) / MAX_Y) * (BOX_H - 10))
  const y0 = BOX_H - 6, y1 = y0 - len, cx = BOX_W / 2
  return (
    <svg className="cardcone" viewBox={`0 0 ${BOX_W} ${BOX_H}`} aria-hidden="true">
      <line x1="8" y1={y0} x2={BOX_W - 8} y2={y0} stroke="var(--line)" strokeWidth="1" />
      <polygon points={`${cx},${y0} ${cx - half},${y1} ${cx + half},${y1}`}
        fill="var(--cone)" fillOpacity={dim ? 0.1 : 0.3}
        stroke="var(--cone)" strokeWidth="1.3" strokeOpacity={dim ? 0.35 : 1} />
      {rollLen > 1 && (
        <line x1={cx} y1={y1} x2={cx} y2={y1 - rollLen} stroke="var(--cone)"
          strokeWidth="1.6" strokeDasharray="2 2" opacity={dim ? .3 : .85} />
      )}
      <circle cx={cx} cy={y0} r="2.3" fill="var(--ink)" opacity={dim ? .35 : 1} />
    </svg>
  )
}

/**
 * A SHOT CARD. The anatomy is locked (ART-BRIEF): name at the top, the cone in
 * the middle, the yardage below it, one line of flavour under that. All four
 * are still here in that order, and the "leaves 40" verdict line still sits
 * between the yardage and the flavour where it was.
 *
 * What the design pass changed is only WEIGHT. The yardage is now the biggest
 * thing on the face after the picture, because it is what the player is
 * actually comparing; the blocked reason no longer shares a typeface and a
 * grey with the flavour it replaces (a card you cannot play should not look
 * like a card with a sad blurb); and being selected is a filled state rather
 * than a one-pixel ring you had to hunt for among six.
 */
export function ShotButton({
  shot, selected, blocked, carry, spread, roll, dist, greenRadius, always, onClick,
}: {
  shot: ShotCard; selected: boolean; blocked: string | null
  carry: number; spread: number; roll: number
  dist: number; greenRadius: number; always?: boolean; onClick(): void
}) {
  // WHERE THIS LEAVES YOU. Without it the player cannot see that a combination
  // reaches and a plain shot doesn't — the line to par exists but is invisible,
  // which is how a solvable hole reads as a broken one.
  const total = carry + roll
  const gap = dist - total
  const onGreen = Math.abs(gap) <= greenRadius
  const leave =
    onGreen ? 'on the green'
    : gap > 0 ? `leaves ${Math.round(gap)}`
    : `${Math.round(-gap)} past`

  return (
    <button className={`shot ${selected ? 'sel' : ''} ${blocked ? 'off' : ''} ${always ? 'always' : ''}`}
      onClick={onClick} disabled={!!blocked} aria-pressed={selected}
      title={blocked ?? shot.blurb}>
      <span className="shot-name">{shot.name}</span>
      <CardCone carry={carry} spread={spread} roll={roll} dim={!!blocked} />
      <span className="shot-num">{carry}{roll > 2 && <i>+{roll}</i>}<em>yds</em></span>
      {blocked
        ? <span className="shot-block">{blocked}</span>
        : <>
          <span className={`shot-leave ${onGreen ? 'hot' : ''}`}>{leave}</span>
          <span className="shot-blurb">{shot.blurb}</span>
        </>}
      {always && <span className="shot-tag">always</span>}
    </button>
  )
}

/**
 * A TECHNIQUE. Same three-part read as a shot — what it is, what it does, what
 * it costs — but the cost is focus, so the cost is drawn in focus's colour and
 * armed is a filled state rather than an outline.
 */
export function TechButton({ tech, selected, disabled, onClick }: {
  tech: TechniqueCard; selected: boolean; disabled: boolean; onClick(): void
}) {
  return (
    <button className={`tech ${selected ? 'sel' : ''} ${disabled ? 'off' : ''}`}
      onClick={onClick} disabled={disabled} aria-pressed={selected}
      title={tech.blurb}>
      <span className="tech-name">{tech.name}</span>
      <span className="tech-blurb">{tech.blurb}</span>
      <span className="tech-cost">{tech.focus === 0 ? 'free' : '◆'.repeat(tech.focus)}</span>
    </button>
  )
}

/** A card on offer in the shop. Kept for reference; the shop renders its own. */
export function OfferCard({ card, onClick }: {
  card: ShotCard | TechniqueCard; onClick(): void
}) {
  const isShot = card.kind === 'shot'
  return (
    <button className={`offercard ${isShot ? 'is-shot' : 'is-tech'}`} onClick={onClick}>
      <span className="offer-kind">{isShot ? 'Shot · costs a stroke' : 'Technique · costs focus'}</span>
      <span className="offer-name">{card.name}</span>
      {isShot
        ? <CardCone carry={card.carry} spread={card.spread} roll={card.rules.roll} />
        : <span className="offer-focus">{card.focus === 0 ? 'free' : '◆'.repeat(card.focus)}</span>}
      {isShot && <span className="offer-num">{card.carry}</span>}
      <span className="offer-blurb">{card.blurb}</span>
    </button>
  )
}

/**
 * A compact read-out of everything currently in the bag. Shots carry their
 * yardage and techniques their focus cost, so the bag can be read as a bag
 * rather than as a list of names you have to remember the meaning of.
 */
export function DeckPanel({ ids }: { ids: readonly string[] }) {
  const counts = new Map<string, number>()
  for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1)
  const rows = [...counts.entries()]
  return (
    <div className="deckpanel">
      {rows.map(([id, n]) => {
        const c = CARDS[id]
        const tech = c?.kind === 'technique'
        return (
          <span key={id} className={`chip ${tech ? 'tech' : ''}`} title={c?.blurb}>
            {c?.name ?? id}
            {c && <i>{tech
              ? (c.focus === 0 ? 'free' : '◆'.repeat(c.focus))
              : `${c.carry}y`}</i>}
            {n > 1 && <b>×{n}</b>}
          </span>
        )
      })}
    </div>
  )
}
