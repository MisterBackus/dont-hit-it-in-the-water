/**
 * THE FURNITURE — the small parts every screen is built out of.
 *
 * The point of this file is that there is exactly ONE of each of these. Before
 * it, the season ladder was written twice, the focus meter twice, the share
 * affordance three times and the "here are three numbers" row four times, each
 * with its own spacing. Screens that share parts read as one object; screens
 * that re-implement them read as four people's work.
 *
 * Presentation only, with one exception: QuitSeason, which ends a run and is
 * shared precisely BECAUSE it must read identically wherever it appears.
 */
import { useState, type ReactNode } from 'react'
import { SEASON, MONEY_CHECKS, money, TOUR_SIZE } from '../content/season'
import { courseFor } from '../sim/state'
import type { Action } from '../sim/reducer'
import { postRun } from '../platform/share'
import { SAVE_VERSION } from '../platform/storage'
import { ordinal } from './format'

/* ------------------------------------------------------------------ labels */

/** The small tracked line above a headline. Says where you are standing. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="eyebrow">{children}</div>
}

/**
 * A section label. `note` is the quiet half-sentence that so often followed it
 * in an <em> — kept, because it is where this game does its teaching.
 */
export function Label({ children, note, className = '' }: {
  children: ReactNode; note?: ReactNode; className?: string
}) {
  return (
    <div className={`lbl ${className}`}>
      {children}{note && <em> {note}</em>}
    </div>
  )
}

/* ------------------------------------------------------------------- facts */

export interface Fact {
  /** the number — always mono, always tabular */
  readonly v: ReactNode
  /** what the number is */
  readonly k: ReactNode
  readonly tone?: 'good' | 'bad' | 'gold' | 'accent'
}

/**
 * A rule-separated row of numbers with their labels under them. Every screen
 * that used to open with "three facts in a flex row" opens with this instead,
 * so the numbers sit on the same baseline grid from screen to screen.
 */
export function Facts({ items, wide }: { items: readonly Fact[]; wide?: boolean }) {
  return (
    <div className={`facts ${wide ? 'facts-wide' : ''}`}>
      {items.map((f, i) => (
        <div key={i} className={`fact ${f.tone ? 'tone-' + f.tone : ''}`}>
          <b>{f.v}</b><span>{f.k}</span>
        </div>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------- money list */

/**
 * THE MONEY LIST, as one object.
 *
 * The demand used to be a run-on mono sentence sharing a line with your rank
 * and how many weeks you had sat out — the single number the whole game is
 * about, set at 12px in the same grey as everything else. It is now a panel
 * with a bar in it: what you have won against what the next bar asks. The bar
 * is honest — it fills by earned/need and stops filling at full.
 */
export function MoneyList({ earned, event, rank, compact }: {
  earned: number
  /** the event about to be played — the next check is the first at or after it */
  event: number
  /** where the list has you right now */
  rank: number
  compact?: boolean
}) {
  const next = MONEY_CHECKS.find(c => c.after >= event)
  const short = next ? next.need - earned : 0
  const pct = next ? Math.max(0, Math.min(1, earned / next.need)) : 1
  const clear = !next || short <= 0
  return (
    <section className={`moneylist ${clear ? 'is-clear' : ''} ${compact ? 'is-compact' : ''}`}>
      <header>
        <span className="ml-title">The Money List</span>
        <span className="ml-rank">{ordinal(rank)}<i> of {TOUR_SIZE}</i></span>
      </header>
      <div className="ml-bar" role="img"
        aria-label={next
          ? `${money(earned)} won of the ${money(next.need)} demanded after event ${next.after}`
          : `${money(earned)} won; no bar left to clear`}>
        <span className="ml-fill" style={{ width: `${(pct * 100).toFixed(1)}%` }} />
      </div>
      <div className="ml-read">
        <b className="ml-earned">{money(earned)}</b>
        <span className="ml-of">won</span>
        {next
          ? <>
            <b className="ml-need">{money(next.need)}</b>
            <span className="ml-of">needed by event {next.after}</span>
            <span className={`ml-verdict ${clear ? 'ok' : 'no'}`}>
              {clear ? 'clear' : `${money(short)} short`}
            </span>
          </>
          : <span className="ml-verdict ok ml-done">
            no bar left — the list is done with you
          </span>}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------- the ladder */

/**
 * THE SEASON, fourteen rungs.
 *
 * New here: the three Money List bars are drawn ON the ladder, as a gap and a
 * mark after events 5, 9 and 12. The demand and the calendar were two separate
 * readings of the same fact and the player had to hold both in their head.
 * Also new: the rungs name themselves in text, not only in a `title` — a
 * tooltip is invisible on a phone and inaudible to a screen reader that isn't
 * hovering.
 */
export function SeasonLadder({ seed, event, big, caption }: {
  seed: number; event: number; big?: boolean; caption?: boolean
}) {
  const here = SEASON.find(e => e.num === event)
  return (
    <div className="ladderwrap">
      <div className={`ladder ${big ? 'big-ladder' : ''}`}>
        {SEASON.map(e => {
          const check = MONEY_CHECKS.find(c => c.after === e.num)
          return (
            <span key={e.num} className="rungslot">
              <span
                className={`rung ${e.num === event ? 'now' : ''} ${e.num < event ? 'done' : ''} ${e.major ? 'maj' : ''}`}
                title={`${e.name} · ${courseFor(seed, e.num).label}`}>{e.num}</span>
              {check && (
                <span className={`checkmark ${event > check.after ? 'past' : ''}`}
                  title={`Money List check: ${money(check.need)} after event ${check.after}`}>
                  {money(check.need)}
                </span>
              )}
            </span>
          )
        })}
      </div>
      {caption && here && (
        <div className="laddercap">
          <b>{here.num}</b> {here.name} · {courseFor(seed, here.num).label}
          {here.major && <span className="majbadge">major</span>}
        </div>
      )}
    </div>
  )
}

/* --------------------------------------------------------------- the focus */

/**
 * THE FOCUS METER — spent, held, empty, and TAKEN.
 *
 * The old meter drew `maxFocus(MAX_FOCUS, boosts) - focus` hollow pips, which
 * ignores the sponsor penalty the reducer actually applies (reducer.ts:596,
 * `maxFocus(...) - focusPenaltyOf`). A player who signed a decal watched a pip
 * that could never fill and was told nothing about why. The stolen pips are
 * now drawn struck, and the caption says who has them.
 */
export function FocusMeter({ focus, spent, cap, taken, className = '' }: {
  focus: number; spent: number; cap: number; taken: number; className?: string
}) {
  const held = Math.max(0, focus - spent)
  const empty = Math.max(0, cap - focus)
  return (
    <div className={`focusmeter ${className} ${taken > 0 ? 'is-docked' : ''}`}
      title={taken > 0
        ? `${focus} focus of ${cap}; a sponsor is holding ${taken}`
        : `${focus} focus of ${cap}`}>
      <b>
        {'◆'.repeat(held)}
        <i className="staged">{'◆'.repeat(spent)}</i>
        <i className="empty">{'◇'.repeat(empty)}</i>
        <i className="taken">{'✕'.repeat(taken)}</i>
      </b>
      <span>{taken > 0 ? `focus · ${taken} on the decal` : 'focus'}</span>
    </div>
  )
}

/* ---------------------------------------------------------------- the board */

/**
 * THE CLUBHOUSE BOARD affordance. Copying the run and the link to the board
 * were three loose pieces wearing inline styles on three different screens;
 * they are one block now, and it looks the same everywhere it appears.
 */
export function ShareRow({ copyRun, copied, label = 'Copy this run for the board' }: {
  copyRun(): void; copied: boolean; label?: string
}) {
  return (
    <div className="shareline">
      <button className="ghost" onClick={copyRun}>
        {copied ? 'Copied — paste it in the chat' : label}
      </button>
      <a className="boardlink" href="board.html">the clubhouse board →</a>
    </div>
  )
}

/* --------------------------------------------------------------- explain */

/**
 * WHAT THIS THING DOES, ON HOVER AND ON TAP.
 *
 * The game explained a card nowhere that you had to decide about one. The
 * SWAP screen was the worst of it — a name and a number, on a permanent
 * choice the screen itself labels "this cannot be undone" — and the shop and
 * the bag had only native `title` tooltips, which wait a second, vanish if
 * you move, and do nothing whatsoever on a phone. That is why they read as
 * absent: they may as well have been.
 *
 * This is the one surface, and it answers BOTH a pointer and a thumb. No
 * portal, no library: a positioned child that the parent reveals, so it works
 * inside any list without any of them knowing about each other.
 */
export function Explain({ children, label }: { children: ReactNode; label?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <span className={`explain ${open ? 'is-open' : ''}`}>
      <button className="explain-tap" type="button"
        aria-label={label ?? 'What does this do?'} aria-expanded={open}
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}>?</button>
      <span className="explain-body" role="note">{children}</span>
    </span>
  )
}

/* ------------------------------------------------------------------- quit */

/**
 * THE WAY OUT OF A SEASON.
 *
 * There was none: RESTART lived only on the epilogue, so a season you had
 * stopped caring about could be ended only by clearing browser storage. It
 * lives wherever you might decide to stop — the bag drawer mid-round, and the
 * schedule screen between events, which is where the decision actually gets
 * made and where the owner went looking for it first.
 *
 * It arms before it fires, the same two-step as a withdrawal, because it is
 * the one destructive thing you can reach while playing. Quitting does not
 * archive the run (App.tsx `keep`) — nobody posts a season they walked away
 * from — but it DOES send it to the inbox, marked abandoned, where it feeds
 * runstats and never reaches the clubhouse board. That is the only data the
 * instruments have never had: where the game loses people. The intro says so
 * in a line, which is the whole of the disclosure and all it needs to be.
 */
export function QuitSeason({ dispatch, log, className = '' }: {
  dispatch: (a: Action) => void
  log: { seed: number; actions: readonly Action[] }
  className?: string
}) {
  const [armed, setArmed] = useState(false)
  if (!armed) {
    return (
      <button className={`ghost quitseason ${className}`} onClick={() => setArmed(true)}>
        Give up the season
      </button>
    )
  }
  return (
    <div className={`quitseason-arm ${className}`}>
      <p>This season ends here and is not kept. If you want it for the board,
        copy it first. A new one starts from the first tee.</p>
      <div className="quitseason-row">
        <button className="ghost" onClick={() => setArmed(false)}>Keep playing</button>
        <button className="danger" onClick={() => {
          // Fire and forget: the season is ending either way, and a dead inbox
          // must never be able to trap somebody in a run. The floor is the
          // archive's own (storage.ts) — somebody who starts a season and
          // quits on the first tee is not a data point, they are a misclick.
          if (log.actions.length >= 5) {
            void postRun(
              { version: SAVE_VERSION, seed: log.seed, actions: [...log.actions] },
              'abandoned', { abandoned: true },
            )
          }
          setArmed(false)
          dispatch({ type: 'RESTART', seed: (Date.now() % 100000) + 7, keep: false })
        }}>Yes — end the season</button>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------- badges */

/** A small stamped word: MAJOR, TOUR ISSUE, FREE. Never more than two words. */
export function Badge({ children, tone = '' }: { children: ReactNode; tone?: string }) {
  return <span className={`badge ${tone}`}>{children}</span>
}
