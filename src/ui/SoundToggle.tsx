/**
 * The sound switch. It used to inherit the corner-button look from `.artbtn`
 * — which belongs to the hole picture — and carry an inline style to re-anchor
 * itself, with a note asking for a real rule. It has one now (`.sndbtn` in
 * styles.css), so the inline style is gone and the button no longer depends on
 * a class the art direction is free to change underneath it.
 *
 * It also says which state it is IN rather than which state a tap produces:
 * "SND ◂))" when sound is on, "MUTED" when it is off. A two-state switch
 * labelled with its own action is the oldest ambiguity in interface design.
 */
import { useState } from 'react'
import { isMuted, setMuted } from './sound'

export function SoundToggle() {
  const [muted, setLocal] = useState(isMuted)
  return (
    <button
      className={`sndbtn ${muted ? 'is-muted' : ''}`}
      aria-pressed={!muted}
      aria-label={muted ? 'Sound is off — turn it on' : 'Sound is on — mute it'}
      onClick={() => { setMuted(!muted); setLocal(!muted) }}
    >
      {muted ? 'MUTED' : 'SND ◂))'}
    </button>
  )
}
