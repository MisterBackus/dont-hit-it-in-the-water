/**
 * SOUND — synthesized, no assets, no dependencies.
 *
 * The sim never knows this file exists (ARCHITECTURE.md §0). `useGameAudio`
 * observes GameState transitions in the UI — it keeps a ref to the previous
 * state and diffs — so a resumed save is silent on mount and only transitions
 * that happen AFTER mount speak. Taste target: broadcast golf. Muted, dry,
 * never arcade. Master gain sits low and everything but the tee-off murmur
 * is done inside ~400ms.
 *
 * Autoplay rules: the AudioContext is created/resumed lazily on the first
 * user gesture (one-time window listeners installed by the hook).
 *
 * Determinism etiquette: pitch variation is hashed from stroke/hole/event,
 * never Math.random — a replayed run sounds the same. Even the noise buffer
 * is filled from a seeded PRNG.
 */
import { useEffect, useRef } from 'react'
import type { GameState } from '../sim/state'
import { courseOf } from '../sim/state'

const STORE_KEY = 'water-sound'
const MASTER_GAIN = 0.25
const MAX_VOICES = 12
const DEBOUNCE_MS = 100

/* ------------------------------------------------------------------ engine */

let ctx: AudioContext | null = null
let master: GainNode | null = null
let noiseBuf: AudioBuffer | null = null
let voices = 0
const lastPlayed = new Map<string, number>()

let muted: boolean = (() => {
  try { return localStorage.getItem(STORE_KEY) === 'off' } catch { return false }
})()

export function isMuted(): boolean { return muted }
export function setMuted(m: boolean): void {
  muted = m
  try { localStorage.setItem(STORE_KEY, m ? 'off' : 'on') } catch { /* private mode — fine */ }
}

/** Create/resume the context. Only ever reached from a user gesture. */
function wake(): void {
  if (typeof window === 'undefined' || typeof AudioContext === 'undefined') return
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = MASTER_GAIN
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
}

let gestureArmed = false
function armGesture(): void {
  if (gestureArmed || typeof window === 'undefined') return
  gestureArmed = true
  const on = (): void => {
    wake()
    window.removeEventListener('pointerdown', on)
    window.removeEventListener('keydown', on)
  }
  window.addEventListener('pointerdown', on)
  window.addEventListener('keydown', on)
}

/** Mute gate + spam gate: debounce identical triggers, cap concurrent voices. */
function gate(name: string): AudioContext | null {
  if (muted || !ctx || !master || ctx.state !== 'running') return null
  const now = performance.now()
  const last = lastPlayed.get(name)
  if (last !== undefined && now - last < DEBOUNCE_MS) return null
  if (voices >= MAX_VOICES) return null
  lastPlayed.set(name, now)
  return ctx
}

/* --------------------------------------------------------------- plumbing */

function begin(node: AudioScheduledSourceNode, t0: number, dur: number): void {
  voices += 1
  node.onended = () => { voices = Math.max(0, voices - 1) }
  node.start(t0)
  node.stop(t0 + dur + 0.05)
}

function envGain(c: AudioContext, t0: number, peak: number, attack: number, dur: number): GainNode {
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.linearRampToValueAtTime(peak, t0 + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  g.connect(master!)
  return g
}

function tone(
  c: AudioContext, t0: number, freq: number, dur: number, peak: number,
  type: OscillatorType = 'sine', glideTo?: number,
): void {
  const o = c.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(freq, t0)
  if (glideTo !== undefined) o.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur)
  o.connect(envGain(c, t0, peak, 0.004, dur))
  begin(o, t0, dur)
}

/** One second of seeded white noise, built once. Deterministic on purpose. */
function getNoise(c: AudioContext): AudioBuffer {
  if (noiseBuf) return noiseBuf
  const buf = c.createBuffer(1, c.sampleRate, c.sampleRate)
  const data = buf.getChannelData(0)
  let seed = 0x9d2c5680 // fixed — a replayed run sounds the same
  for (let i = 0; i < data.length; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0
    data[i] = (seed / 0xffffffff) * 2 - 1
  }
  noiseBuf = buf
  return buf
}

function noise(
  c: AudioContext, t0: number, dur: number, peak: number, attack: number,
  filter?: { type: BiquadFilterType; f0: number; f1?: number; q?: number },
): void {
  const src = c.createBufferSource()
  src.buffer = getNoise(c)
  src.loop = true
  let head: AudioNode = src
  if (filter) {
    const f = c.createBiquadFilter()
    f.type = filter.type
    f.frequency.setValueAtTime(filter.f0, t0)
    if (filter.f1 !== undefined) f.frequency.exponentialRampToValueAtTime(filter.f1, t0 + dur)
    if (filter.q !== undefined) f.Q.value = filter.q
    src.connect(f)
    head = f
  }
  head.connect(envGain(c, t0, peak, attack, dur))
  begin(src, t0, dur)
}

/* ---------------------------------------------------------------- palette */

/** Club contact: a short filtered thock. `vary` shifts pitch a few percent. */
function sndContact(vary: number): void {
  const c = gate('contact'); if (!c) return
  const t = c.currentTime
  noise(c, t, 0.03, 0.5, 0.002, { type: 'bandpass', f0: 2500, q: 1.2 })
  tone(c, t, 175 * vary, 0.09, 0.7, 'triangle', 90)
}

/** Ball in the water: noise burst under a falling lowpass, plus a plunk. */
function sndSplash(): void {
  const c = gate('splash'); if (!c) return
  const t = c.currentTime + 0.1
  noise(c, t, 0.35, 0.55, 0.02, { type: 'lowpass', f0: 2800, f1: 250 })
  tone(c, t, 220, 0.15, 0.3, 'sine', 70)
}

/** Sand: a dead thump. */
function sndSand(): void {
  const c = gate('sand'); if (!c) return
  const t = c.currentTime + 0.08
  noise(c, t, 0.12, 0.5, 0.01, { type: 'lowpass', f0: 420 })
  tone(c, t, 85, 0.1, 0.5, 'sine', 60)
}

/** Out of bounds: a dry double-knock, off a tree somewhere. */
function sndOB(): void {
  const c = gate('ob'); if (!c) return
  const t = c.currentTime + 0.1
  tone(c, t, 620, 0.05, 0.55, 'triangle', 480)
  tone(c, t + 0.15, 560, 0.05, 0.45, 'triangle', 440)
}

/** Birdie or better: a short polite shimmer, not a stadium. */
function sndApplause(): void {
  const c = gate('applause'); if (!c) return
  const t = c.currentTime + 0.35
  noise(c, t, 0.07, 0.16, 0.02, { type: 'highpass', f0: 3800 })
  noise(c, t + 0.08, 0.07, 0.2, 0.02, { type: 'highpass', f0: 3600 })
  noise(c, t + 0.18, 0.09, 0.14, 0.02, { type: 'highpass', f0: 4000 })
}

/** Double bogey or worse: two flat notes, downhill. */
function sndDouble(): void {
  const c = gate('double'); if (!c) return
  const t = c.currentTime + 0.35
  tone(c, t, 311, 0.14, 0.18)
  tone(c, t + 0.13, 233, 0.2, 0.18)
}

/** Momentum: two rising sines, quiet — the meter refilling. */
function sndMomentum(): void {
  const c = gate('momentum'); if (!c) return
  const t = c.currentTime + 0.15
  tone(c, t, 523, 0.09, 0.12)
  tone(c, t + 0.11, 784, 0.12, 0.12)
}

/** Putt: a tick off the face, then the drop rattling in the cup. */
function sndPutt(holedRattle: boolean): void {
  const c = gate('putt'); if (!c) return
  const t = c.currentTime
  noise(c, t, 0.02, 0.35, 0.002, { type: 'bandpass', f0: 3000, q: 2 })
  tone(c, t, 1100, 0.03, 0.18)
  if (holedRattle) {
    tone(c, t + 0.16, 640, 0.035, 0.3, 'triangle', 520)
    tone(c, t + 0.24, 520, 0.035, 0.26, 'triangle', 430)
    tone(c, t + 0.31, 470, 0.05, 0.2, 'triangle', 380)
  }
}

/** Money changed hands: a subtle register blip. */
function sndCash(): void {
  const c = gate('cash'); if (!c) return
  const t = c.currentTime
  tone(c, t, 1245, 0.05, 0.13)
  tone(c, t + 0.06, 1661, 0.07, 0.13)
}

/** The cut: rising if you live, falling if you pack up. */
function sndCut(made: boolean): void {
  const c = gate('cut'); if (!c) return
  const t = c.currentTime + 0.2
  const notes = made ? [392, 523, 659] : [466, 370, 294]
  notes.forEach((f, i) => tone(c, t + i * 0.11, f, i === 2 ? 0.16 : 0.11, 0.22, 'triangle'))
}

/** The Money List: the death check. Pass climbs, fail settles low and stays. */
function sndMoneyList(kept: boolean): void {
  const c = gate('moneylist'); if (!c) return
  const t = c.currentTime + 0.2
  const notes = kept ? [523, 659, 784] : [440, 330, 247]
  notes.forEach((f, i) => tone(c, t + i * 0.13, f, i === 2 ? 0.24 : 0.12, 0.22))
}

/** First tee: the gallery murmurs, very quietly. The one long sound. */
function sndMurmur(): void {
  const c = gate('murmur'); if (!c) return
  const t = c.currentTime
  noise(c, t, 1.4, 0.07, 0.5, { type: 'lowpass', f0: 700 })
}

/* ------------------------------------------------------------------- diff */

/** A few percent of pitch drift, hashed from state — never Math.random. */
function vary(s: GameState): number {
  const h = (s.hole.strokes * 131 + s.hole.index * 37 + s.event * 17) % 7
  return 1 + (h - 3) * 0.03
}

function relOfFinishedHole(s: GameState): number | null {
  const strokes = s.scores[s.scores.length - 1]
  const holes = courseOf(s).holes
  const hole = holes[Math.min(s.hole.index, holes.length - 1)]
  return strokes === undefined || hole === undefined ? null : strokes - hole.par
}

function diff(p: GameState, s: GameState): void {
  if (p.phase !== s.phase) {
    // A full swing happened.
    if (p.phase === 'playing' && s.phase === 'shot') {
      const text = s.lastShot ?? ''
      sndContact(vary(s))
      if (text.includes('water') || text.includes('drop')) sndSplash()
      else if (text.includes('Out of bounds')) sndOB()
      else if (s.hole.lie === 'bunker') sndSand()
    }

    // The hole finished — by a putt, or by the 10-stroke cap mid-swing.
    if (s.phase === 'holed') {
      if (p.hole.puttFeet !== null) sndPutt(true)
      else if (p.phase === 'playing') sndContact(vary(s)) // capped swing
      const rel = relOfFinishedHole(s)
      if (rel !== null && rel <= -1) sndApplause()
      else if (rel !== null && rel >= 2) sndDouble()
    }

    if (s.phase === 'cut') sndCut(s.madeCut === true)
    if (s.phase === 'moneylist') sndMoneyList(s.keptJob === true)
    if (s.phase === 'payout' && s.lastPaid > 0) sndCash()

    // Tee off: schedule → playing is the walk to the first tee.
    if (p.phase === 'schedule' && s.phase === 'playing') sndMurmur()
  }

  // New log entries (a RESTART shrinks the log; the length check covers it).
  if (s.log.length > p.log.length) {
    for (const line of s.log.slice(p.log.length)) {
      if (line.text.startsWith('Momentum')) sndMomentum()
      else if (line.text.startsWith('Bought') || line.text.startsWith('Picked up')) sndCash()
    }
  }
}

/* ------------------------------------------------------------------- hook */

/**
 * Watch the game and speak on transitions. Call once, at the top of App,
 * with the current GameState. The initial mount — including a resumed save
 * replaying to state — is silent: only what changes after mount is heard.
 */
export function useGameAudio(s: GameState): void {
  const prev = useRef<GameState | null>(null)
  useEffect(() => {
    armGesture()
    const p = prev.current
    prev.current = s
    if (p === null || p === s) return // mount, or StrictMode re-run
    diff(p, s)
  }, [s])
}
