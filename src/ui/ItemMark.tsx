/**
 * THE ITEM MARKS — twenty-five things you can own, drawn.
 *
 * Every boost used to wear a single Unicode glyph: the Super Ball was ◉, the
 * Dead Ball was ◍, and all four sponsors were differently-shaded squares.
 * Nobody could tell you which was which, which fails the game's own teaching
 * order (P6: the art shows the thing, the number shows the magnitude, the word
 * arrives last as a reward). A glyph nobody can read is the word arriving
 * first and alone.
 *
 * HOW THEY ARE DRAWN. Filled silhouettes with the detail cut OUT of the fill
 * (fill-rule="evenodd"), never drawn on top — line detail turns to mud at bag
 * size, negative space does not. Each mark is one path in a 32×32 yard-free
 * box, most tilted a few degrees: a parts catalogue stands up straight, and
 * things people own lean. They inherit currentColor, so they theme for free.
 *
 * WHAT THE FRAME MEANS. Rarity, and only rarity — the mark itself never
 * changes, because a Three Wood is a Three Wood wherever you found it
 * (SHOP-SUPPLY: Off the Rack / Special Order / Tour Issue, drawn 6/3/1). The
 * frame spends colour the interface already owns: --silver for the keyline,
 * and the --gold that already means "a major, or a piece of equipment". The
 * fourth tier, `found`, is for things no shop sells — a sketched, off-square
 * frame that reads as somebody's, not yours. An earlier attempt grouped the
 * marks by EFFECT instead; the owner killed it in one line — "i dont even
 * know what the groups are, and ive played alot" — because that taxonomy was
 * invented here and taught nowhere. Rarity the game does teach.
 */
import { BOOST } from '../content/boosts'

/** a small filled circle as path data — dimples, eyes, studs, cups */
function c(x: number, y: number, r: number): string {
  return `M${x - r},${y} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z `
}

/** a sew-on sponsor patch: shield, knocked-out border, motif sits inside */
const PATCH =
  'M5,5.6 L27,5.6 L27,19.4 C27,23.6 22.6,26.2 16,27.8 ' +
  'C9.4,26.2 5,23.6 5,19.4 Z ' +
  'M7.4,8 L24.6,8 L24.6,19.4 C24.6,22.2 21.2,24.2 16,25.6 ' +
  'C10.8,24.2 7.4,22.2 7.4,19.4 Z '

interface Mark { readonly d: string; readonly rot?: number }

/** Keyed by boost id. Every id in content/boosts.ts has one (see the test). */
export const ITEM_ART: Readonly<Record<string, Mark>> = {
  // ---- the ball and the clubs
  superball: {
    d: c(16, 16, 10) + c(13, 12.2, 1.5) + c(19.2, 13, 1.5) +
      c(15.4, 17.6, 1.5) + c(20.6, 18.4, 1.5) + c(11.6, 19.4, 1.3),
  },
  deadball: {
    d: c(16, 14, 8.6) +
      'M4.5,25.2 C9,23.4 23,23.4 27.5,25.2 L27.5,27 C23,25.2 9,25.2 4.5,27 Z',
  },
  goldendriver: {
    rot: -8,
    d: 'M10.6,17.4 L13.2,3.6 L15.4,4 L12.9,17.8 Z ' +
      'M8,23.4 C8,18.8 12,15.4 18,15.4 C23.2,15.4 26.6,18.4 26.6,22 ' +
      'C26.6,25.6 22.4,27.8 16.8,27.8 C11.2,27.8 8,26.4 8,23.4 Z ' +
      'M10.6,21.6 L13,21.6 L13,23 L10.6,23 Z ' +
      'M10.9,24 L13.3,24 L13.3,25.4 L10.9,25.4 Z',
  },
  threewood: {
    rot: -8,
    d: 'M11.6,19 L13.8,7.6 L15.8,8 L13.7,19.3 Z ' +
      'M9.6,23.6 C9.6,20 12.6,17.6 16.6,17.6 C20.8,17.6 23.6,19.8 23.6,22.6 ' +
      'C23.6,25.4 20.4,27.2 16.2,27.2 C12.2,27.2 9.6,26 9.6,23.6 Z ' +
      'M11.9,22.4 L14,22.4 L14,23.7 L11.9,23.7 Z',
  },
  forged: {
    rot: 14,
    d: 'M13.2,3.6 L15.6,3.8 L13.8,16.8 L11.4,16.6 Z ' +
      'M11.2,16.2 C7.4,17.6 5.4,20 5.4,22.6 C5.4,25.6 8.2,27.4 12.2,27.4 ' +
      'L20.4,27.4 C23.8,27.4 26,25.6 26,22.9 C26,19 21.4,16 15.6,15 Z ' +
      'M9.6,20.6 L21.6,22.6 L21.4,24.1 L9.4,22.1 Z ' +
      'M9.3,23.4 L20.6,25.2 L20.4,26.7 L9.1,24.9 Z',
  },
  stiffshafts: {
    rot: 8,
    d: 'M9.8,3.6 L11.9,3.6 L11.2,28.4 L10.2,28.4 Z ' +
      'M15,3.6 L17.1,3.6 L16.4,28.4 L15.4,28.4 Z ' +
      'M20.2,3.6 L22.3,3.6 L21.6,28.4 L20.6,28.4 Z',
  },

  // ---- what you wear and carry
  tees: {
    rot: -11,
    d: 'M9.6,5 L22.4,5 L20.6,9.2 C19.2,10.7 18.8,11.8 18.6,13.6 ' +
      'L17.2,26.4 L16,28.6 L14.8,26.4 L13.4,13.6 ' +
      'C13.2,11.8 12.8,10.7 11.4,9.2 Z',
  },
  grips: {
    rot: 9,
    d: 'M12.2,4.4 C12.2,3 13.4,2.2 16,2.2 C18.6,2.2 19.8,3 19.8,4.4 ' +
      'L21.4,23.8 C21.5,27 19,29.4 16,29.4 C13,29.4 10.5,27 10.6,23.8 Z ' +
      'M11.6,10.4 L20.4,10.4 L20.5,12.2 L11.5,12.2 Z ' +
      'M11.9,15.6 L20.7,15.6 L20.8,17.4 L11.8,17.4 Z ' +
      'M12.2,20.8 L21,20.8 L21.1,22.6 L12.1,22.6 Z',
  },
  glove: {
    rot: -6,
    d: 'M10.6,15.4 L10.6,8.6 C10.6,7.3 11.5,6.5 12.6,6.5 C13.7,6.5 14.6,7.3 14.6,8.6 ' +
      'L14.6,13.4 L15.3,13.4 L15.3,6.6 C15.3,5.3 16.2,4.5 17.3,4.5 ' +
      'C18.4,4.5 19.3,5.3 19.3,6.6 L19.3,13.4 L20,13.4 L20,7.6 ' +
      'C20,6.3 20.9,5.5 22,5.5 C23.1,5.5 24,6.3 24,7.6 L24,18.6 ' +
      'C24,24 20.7,27.6 16.2,27.6 C12.2,27.6 9.2,25 8.3,20.8 ' +
      'L7.3,16.4 C7,15 7.8,13.9 8.9,13.7 C9.9,13.5 10.4,14.2 10.6,15.4 Z',
  },
  spikes: {
    rot: -4,
    d: 'M4.6,20.4 C4.6,17.4 5.8,15.2 8,13.6 C10.2,12 12.6,11.4 15.6,11.4 ' +
      'L18.8,11.4 C22,11.4 24.2,13 25.2,15.8 L26.4,19.2 ' +
      'C27,21 26.2,22.6 24,22.6 L6.6,22.6 C5.4,22.6 4.6,21.8 4.6,20.4 Z ' +
      c(10, 15.4, 1.4) + c(16, 14.2, 1.4) + c(21.4, 16.2, 1.4) +
      'M7.2,23.6 L10,23.6 L9,27 Z M13.4,23.6 L16.2,23.6 L15.2,27 Z ' +
      'M19.6,23.6 L22.4,23.6 L21.4,27 Z',
  },
  organized: {
    rot: -5,
    d: 'M11.4,13.6 L20.6,13.6 L21.8,26.4 C22,28.4 20.6,29.6 18.4,29.6 ' +
      'L13.6,29.6 C11.4,29.6 10,28.4 10.2,26.4 Z ' +
      'M12.6,17.6 L19.4,17.6 L19.5,19.2 L12.5,19.2 Z ' +
      'M10.8,4.6 L12.8,4.6 L13,13.6 L10.9,13.6 Z ' +
      'M15,3.2 L17,3.2 L17.1,13.6 L15,13.6 Z ' +
      'M19.2,5.4 L21.2,5.4 L21.1,13.6 L19.1,13.6 Z',
  },
  yardagebook: {
    rot: -7,
    d: 'M8,5.4 L23,5.4 C24.4,5.4 25,6.4 25,7.8 L25,26.6 L10,26.6 ' +
      'C8.6,26.6 8,25.6 8,24.2 Z ' +
      'M11.4,5.4 L11.4,26.6 L10,26.6 C8.6,26.6 8,25.6 8,24.2 L8,7.8 ' +
      'C8,6.4 8.6,5.4 10,5.4 Z ' +
      'M13.6,10.6 L22.4,10.6 L22.4,12.2 L13.6,12.2 Z ' +
      'M13.6,14.6 L22.4,14.6 L22.4,16.2 L13.6,16.2 Z ' +
      'M13.6,18.6 L19.4,18.6 L19.4,20.2 L13.6,20.2 Z',
  },
  marlene: {
    d: 'M3.6,16.2 C3.6,8.4 9.4,3.6 16,3.6 C22.6,3.6 28.4,8.4 28.4,16.2 ' +
      'L23.4,13.4 L19.7,16.2 L16,13.4 L12.3,16.2 L8.6,13.4 Z ' +
      'M15.1,15.4 L16.9,15.4 L16.9,25.4 C16.9,27.6 15.4,29 13.4,29 ' +
      'C11.6,29 10.3,27.9 10.1,26.2 L11.9,25.9 C12,26.8 12.6,27.3 13.4,27.3 ' +
      'C14.4,27.3 15.1,26.5 15.1,25.4 Z',
  },
  foundtiger: {
    d: 'M9.6,14.4 C8.4,12.4 8,9.6 8.6,7 L13.2,10.4 C15,9.8 17,9.8 18.8,10.4 ' +
      'L23.4,7 C24,9.6 23.6,12.4 22.4,14.4 C24,16 24.8,18.2 24.8,20.6 ' +
      'C24.8,25.4 20.8,28.6 16,28.6 C11.2,28.6 7.2,25.4 7.2,20.6 ' +
      'C7.2,18.2 8,16 9.6,14.4 Z ' +
      c(12.8, 18.6, 1.6) + c(19.2, 18.6, 1.6) +
      'M14.2,22.6 L17.8,22.6 L16,24.8 Z',
  },

  // ---- the green
  goldenputter: {
    rot: -6,
    d: 'M19.2,3.4 L21.1,3.6 L19,20.4 L17.1,20.2 Z ' +
      'M6.6,20 L24.6,20 C26.2,20 27,21 27,22.4 C27,23.8 26.2,24.8 24.6,24.8 ' +
      'L6.6,24.8 C5.4,24.8 4.8,23.8 4.8,22.4 C4.8,21 5.4,20 6.6,20 Z ' +
      'M10.6,21.4 L12.3,21.4 L12.3,23.4 L10.6,23.4 Z',
  },
  marker: {
    d: 'M4.4,15.4 a11.6,5.4 0 1,0 23.2,0 a11.6,5.4 0 1,0 -23.2,0 Z ' +
      'M16,11.6 L17.4,14.2 L20.3,14.6 L18.2,16.5 L18.7,19.3 L16,18 ' +
      'L13.3,19.3 L13.8,16.5 L11.7,14.6 L14.6,14.2 Z ' +
      'M4.4,17.4 C4.4,20.4 9.6,22.8 16,22.8 C22.4,22.8 27.6,20.4 27.6,17.4 ' +
      'L27.6,19.4 C27.6,22.4 22.4,24.8 16,24.8 C9.6,24.8 4.4,22.4 4.4,19.4 Z',
  },
  leather: {
    d: 'M6,20.6 a10,4.6 0 1,0 20,0 a10,4.6 0 1,0 -20,0 Z ' +
      'M9.4,20.6 a6.6,3 0 1,0 13.2,0 a6.6,3 0 1,0 -13.2,0 Z ' +
      'M7.2,7 C7.2,5.8 8.2,5 10.6,5 C13,5 14,5.8 14,7 L15.6,14.6 ' +
      'C15.7,16.4 14,17.6 10.6,17.6 C7.2,17.6 5.5,16.4 5.6,14.6 Z ' +
      'M6.9,9.4 L14.2,9.4 L14.3,10.6 L6.8,10.6 Z ' +
      'M7.3,12.6 L14.7,12.6 L14.8,13.8 L7.2,13.8 Z',
  },
  circle: {
    d: 'M11.4,16 a4.6,4.6 0 1,0 9.2,0 a4.6,4.6 0 1,0 -9.2,0 Z ' +
      'M13.6,16 a2.4,2.4 0 1,0 4.8,0 a2.4,2.4 0 1,0 -4.8,0 Z ' +
      c(16, 3.6, 1.5) + c(24.7, 7.3, 1.5) + c(28.4, 16, 1.5) + c(24.7, 24.7, 1.5) +
      c(16, 28.4, 1.5) + c(7.3, 24.7, 1.5) + c(3.6, 16, 1.5) + c(7.3, 7.3, 1.5),
  },

  // ---- shot shapes and states of mind
  fade: {
    d: 'M6.4,28 C7.6,19.4 11.6,12.4 19.4,8.4 L20.4,10.6 C13.8,14.2 10.2,20.2 9,28 Z ' +
      c(23.4, 6.6, 2.8),
  },
  shortmemory: {
    rot: -4,
    d: 'M5.6,8 L26.4,8 L26.4,24 L5.6,24 Z ' +
      'M7.8,10.2 L24.2,10.2 L24.2,21.8 L7.8,21.8 Z ' +
      'M9.8,12.4 L14.6,12.4 L14.6,19.6 L9.8,19.6 Z ' +
      'M10.4,13.2 L14,18.8 L13.2,19.4 L9.6,13.8 Z ' +
      'M16.8,12.4 L22.2,12.4 L22.2,14 L16.8,14 Z ' +
      'M16.8,16 L22.2,16 L22.2,17.6 L16.8,17.6 Z',
  },
  slate: {
    rot: -3,
    d: 'M4.6,6.6 L27.4,6.6 L27.4,22.4 L4.6,22.4 Z ' +
      'M6.8,8.8 L25.2,8.8 L25.2,20.2 L6.8,20.2 Z ' +
      'M9.4,24.4 L22.6,24.4 L22.6,27.4 L9.4,27.4 Z ' +
      'M18.4,11 C20.6,11 22.4,12.6 22.4,14.6 C22.4,16.6 20.6,18.2 18.4,18.2 ' +
      'C17,18.2 15.8,17.6 15,16.6 L17,15.4 C17.3,15.8 17.8,16 18.4,16 ' +
      'C19.4,16 20.2,15.4 20.2,14.6 C20.2,13.8 19.4,13.2 18.4,13.2 Z',
  },

  // ---- the sponsors, all patches, told apart by what is stitched on them
  headcover: {
    rot: 3,
    d: PATCH +
      'M16,10 C18.6,12.8 19.8,15 19.8,17.2 C19.8,19.8 18.1,21.4 16,21.4 ' +
      'C13.9,21.4 12.2,19.8 12.2,17.2 C12.2,15.6 13,14.2 14.2,13 ' +
      'C14.2,15.2 14.8,16 15.4,16 C16,16 16.2,14.6 16,10 Z',
  },
  pontoon: {
    rot: 3,
    d: PATCH +
      'M15.2,10.4 L16.8,10.4 L16.8,15.6 L15.2,15.6 Z ' +
      'M16.8,10.8 L21.4,13.4 L16.8,15 Z ' +
      'M10,16.4 L22,16.4 L20.4,20.4 L11.6,20.4 Z ' +
      'M9.6,21.6 C11.2,20.8 12.4,22 14,21.4 L14,22.8 ' +
      'C12.4,23.4 11.2,22.2 9.6,23 Z ' +
      'M18,21.4 C19.6,22 20.8,20.8 22.4,21.6 L22.4,23 ' +
      'C20.8,22.2 19.6,23.4 18,22.8 Z',
  },
  bait: {
    rot: 3,
    d: PATCH +
      'M9.4,17 C9.4,14.6 12.2,13 15.6,13 C18.2,13 20.3,14 21.4,15.4 ' +
      'L24,13.2 L24,20.8 L21.4,18.6 C20.3,20 18.2,21 15.6,21 ' +
      'C12.2,21 9.4,19.4 9.4,17 Z ' + c(12.6, 16, 0.95),
  },
  concrete: {
    rot: 3,
    d: PATCH +
      'M9.6,12.6 L22.4,12.6 L22.4,20.6 L9.6,20.6 Z ' +
      'M9.6,16 L22.4,16 L22.4,17 L9.6,17 Z ' +
      'M15.4,12.6 L16.4,12.6 L16.4,16 L15.4,16 Z ' +
      'M12.4,17 L13.4,17 L13.4,20.6 L12.4,20.6 Z ' +
      'M18.6,17 L19.6,17 L19.6,20.6 L18.6,20.6 Z',
  },
}

/**
 * One item, at whatever size the screen wants it. `framed` draws the rarity
 * frame around it; leave it off where the tier is already stated in words
 * (the shop stamps its own badge, so the frame there would be saying it
 * twice). Falls back to the old glyph if an id ever arrives without art —
 * a missing drawing should look plain, never blank.
 */
export function ItemMark({ id, size = 22, framed = false, className = '' }: {
  id: string; size?: number; framed?: boolean; className?: string
}) {
  const art = ITEM_ART[id]
  const boost = BOOST[id]
  if (!art) return <span className={`itemmark-fallback ${className}`}>{boost?.icon ?? '·'}</span>
  const mark = (
    <svg className="itemmark" width={size} height={size} viewBox="0 0 32 32"
      aria-hidden="true" focusable="false">
      <path d={art.d} fill="currentColor" fillRule="evenodd"
        transform={art.rot ? `rotate(${art.rot} 16 16)` : undefined} />
    </svg>
  )
  if (!framed) return mark
  return (
    <span className={`itemframe tier-${boost?.tier ?? 'rack'} ${className}`}
      style={{ ['--mk' as string]: `${size}px` }}>{mark}</span>
  )
}
