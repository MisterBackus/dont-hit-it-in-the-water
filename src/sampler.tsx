/**
 * THE PALETTE SAMPLER — a dev-only page, not part of the game.
 *
 * Served at /sampler.html. It renders the REAL HoleView against real course
 * holes so a palette can be judged on the actual renderer instead of on a
 * mock-up — the mock-up lies, as the first attempt at these palettes proved.
 * Nothing imports this; the game bundle never sees it.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { COURSES } from './content/courses'
import type { CourseId } from './content/courses'
import type { Cone } from './sim/types'
import { HoleView } from './ui/HoleView'
import './ui/styles.css'

/** a plain driver's cone — real numbers, so the drawn shape is the real shape */
const CONE: Cone = {
  carry: 248, spread: 26, aimOffset: 0, roll: 14,
  pitchNear: 234, pitchFar: 262, restNear: 248, restFar: 276,
}

const SHOW: readonly (readonly [CourseId, number])[] = [
  ['pinehollow', 0], ['cottonwood', 0], ['rockdale', 0], ['saltflats', 0], ['palmetto', 1],
  ['meadowlark', 0], ['driftwood', 0], ['foxglove', 0], ['brackenridge', 0], ['rivermouth', 0],
]

function Sampler() {
  return (
    <div style={{ padding: 14, background: 'var(--paper)', minHeight: '100vh' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12,
      }}>
        {SHOW.map(([id, i]) => {
          const c = COURSES[id]
          const hole = c.holes[i]!
          return (
            <div key={`${id}-${i}`}>
              <div style={{
                fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: '.12em',
                textTransform: 'uppercase', color: 'var(--faint)', paddingBottom: 6,
              }}>{c.label} · {hole.num}</div>
              <HoleView hole={hole} course={id}
                ball={{ down: 0, side: 0 }} showCone={true}
                cone={CONE} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><Sampler /></StrictMode>,
)
