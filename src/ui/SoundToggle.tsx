/**
 * The sound switch. Inherits the corner-button look from .artbtn
 * (styles.css); the inline style only re-anchors it to the bottom-right of
 * the viewport so it exists on every screen without touching the CSS.
 * If a styles.css rule for .sndbtn lands later, drop the inline style.
 */
import { useState, type CSSProperties } from 'react'
import { isMuted, setMuted } from './sound'

const PIN: CSSProperties = {
  position: 'fixed', top: 'auto', right: 8, bottom: 8, zIndex: 40,
}

export function SoundToggle() {
  const [muted, setLocal] = useState(isMuted)
  return (
    <button
      className="sndbtn artbtn"
      style={PIN}
      aria-pressed={!muted}
      aria-label={muted ? 'Sound is off — turn it on' : 'Sound is on — mute it'}
      onClick={() => { setMuted(!muted); setLocal(!muted) }}
    >
      {muted ? 'MUTE' : 'SND'}
    </button>
  )
}
