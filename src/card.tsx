/**
 * THE SOCIAL CARD — dev-only, served at /card.html, screenshotted to
 * public/og.png. Nothing imports it; the game bundle never sees it.
 *
 * It draws the REAL hole renderer rather than mocked-up marketing art, for the
 * same reason the palette samples did: a picture of the actual game is the
 * only picture that cannot promise something the game does not do. Two courses
 * side by side, because "every course is its own place" is the thing worth
 * showing in one glance — and because one course alone would be a fair
 * complaint that the card flattered the game.
 *
 * Regenerate: run the dev server, then screenshot .card at 1200x630.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { COURSES } from './content/courses'
import type { CourseId } from './content/courses'
import type { Cone } from './sim/types'
import { HoleView } from './ui/HoleView'
import './ui/styles.css'

const CONE: Cone = {
  carry: 248, spread: 26, aimOffset: 0, roll: 14,
  pitchNear: 234, pitchFar: 262, restNear: 248, restFar: 276,
}

function Hole({ id, i }: { id: CourseId; i: number }) {
  const c = COURSES[id]
  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex' }}>
      <HoleView hole={c.holes[i]!} course={id} ball={{ down: 0, side: 0 }}
        cone={CONE} showCone />
    </div>
  )
}

function Card() {
  return (
    <>
    {/* The hole view is dressed for a game screen, not a still. Its 74vh cap
        letterboxes it here, and the art toggle and broadcast bug are controls
        and telemetry — furniture that means nothing to somebody who has not
        played yet. Scoped to .card, so the game is untouched. */}
    <style>{`
      .card .holeview{max-height:none;height:100%}
      .card .holewrap{height:100%}
      .card .figure,.card .artbtn,.card .tapebug{display:none}
      .card .artbtn{display:none}
    `}</style>
    <div className="card" style={{
      width: 1200, height: 630, display: 'flex', alignItems: 'stretch',
      background: '#0B0F0C', overflow: 'hidden',
    }}>
      <div style={{
        flex: '0 0 660px', padding: '64px 34px 64px 62px', display: 'flex',
        flexDirection: 'column', justifyContent: 'center', gap: 22,
      }}>
        <div style={{
          fontFamily: 'var(--fm)', fontSize: 15, letterSpacing: '.22em',
          color: '#82E39B', textTransform: 'uppercase',
        }}>A golf roguelike deckbuilder</div>
        <h1 style={{
          fontFamily: 'var(--fd)', fontWeight: 900, fontSize: 66, lineHeight: .98,
          margin: 0, color: '#F5F8EE', letterSpacing: '-.01em', whiteSpace: 'nowrap',
        }}>DON’T HIT IT<br />IN THE WATER</h1>
        <div style={{
          fontFamily: 'var(--fs)', fontSize: 31, lineHeight: 1.32, color: '#C4CFC2',
          maxWidth: 560,
        }}>Fourteen events. One job to keep.<br />Can you make the cut?</div>
        <div style={{
          fontFamily: 'var(--fm)', fontSize: 15, letterSpacing: '.14em',
          color: '#6C7D74', textTransform: 'uppercase', paddingTop: 4,
        }}>Free · in your browser · no install</div>
      </div>
      <div style={{ flex: 1, display: 'flex', gap: 14, padding: '26px 26px 26px 0' }}>
        <Hole id="palmetto" i={1} />
        <Hole id="saltflats" i={0} />
      </div>
    </div>
    </>
  )
}

createRoot(document.getElementById('root')!).render(<StrictMode><Card /></StrictMode>)
