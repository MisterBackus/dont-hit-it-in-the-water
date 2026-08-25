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
  const leave =
    Math.abs(gap) <= greenRadius ? 'on the green'
    : gap > 0 ? `leaves ${Math.round(gap)}`
    : `${Math.round(-gap)} past`
  const onGreen = Math.abs(gap) <= greenRadius

  return (
    <button className={`shot ${selected ? 'sel' : ''} ${blocked ? 'off' : ''} ${always ? 'always' : ''}`}
      onClick={onClick} disabled={!!blocked} title={blocked ?? shot.blurb}>
      <span className="shot-name">{shot.name}</span>
      <CardCone carry={carry} spread={spread} roll={roll} dim={!!blocked} />
      <span className="shot-num">{carry}{roll > 2 && <i>+{roll}</i>}</span>
      {!blocked && <span className={`shot-leave ${onGreen ? 'hot' : ''}`}>{leave}</span>}
      <span className="shot-blurb">{blocked ?? shot.blurb}</span>
      {always && <span className="shot-tag">always</span>}
    </button>
  )
}

export function TechButton({ tech, selected, disabled, onClick }: {
  tech: TechniqueCard; selected: boolean; disabled: boolean; onClick(): void
}) {
  return (
    <button className={`tech ${selected ? 'sel' : ''} ${disabled ? 'off' : ''}`}
      onClick={onClick} disabled={disabled}>
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

/** A compact read-out of everything currently in the bag. */
export function DeckPanel({ ids }: { ids: readonly string[] }) {
  const counts = new Map<string, number>()
  for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1)
  const rows = [...counts.entries()]
  return (
    <div className="deckpanel">
      {rows.map(([id, n]) => (
        <span key={id} className={`chip ${CARDS[id]?.kind === 'technique' ? 'tech' : ''}`}>
          {CARDS[id]?.name ?? id}{n > 1 && <b>×{n}</b>}
        </span>
      ))}
    </div>
  )
}
