/**
 * THE PLAYING SCREEN — everything around the hole picture.
 *
 * WHAT WAS WRONG. The furniture had no hierarchy: six topbar stats all set at
 * the same size in the same grey, so your score to par (the thing the season is
 * decided on) read exactly as loudly as how many cards were left in the deck.
 * The armed states were all one pixel of inset ring — a selected shot, a
 * selected technique and a hovered offer were indistinguishable at a glance.
 * The scorecard strip printed a number per hole with no par to read it
 * against and no running total. And the focus meter drew a hollow pip for a
 * point a sponsor had taken and would never give back.
 *
 * WHAT IT IS NOW. Three tiers, everywhere:
 *
 *   THE SCORE          display face, large, coloured only when it is under par
 *   THE INSTRUMENTS    mono, medium, tabular, on a rule — position, strokes,
 *                      deck, focus
 *   THE LABELS         mono caps, 10px, --faint, never competing
 *
 * Nothing was removed. The card anatomy is untouched (name, diagram, yardage,
 * flavour) and so is the leaderboard's.
 */
import { useMemo, useState } from 'react'
import {
  previewCone, redrawPrice, scoreName, handShots, handTechs, boostsOf, sinkPrice,
  type Action,
} from '../sim/reducer'
import {
  CUT_AFTER_HOLE, MAX_FOCUS, courseOf, currentEvent, currentHole, deckList,
  focusPenaltyOf, holeCount, toPar, type GameState,
} from '../sim/state'
import { EVENT_COUNT } from '../content/season'
import { PUNCH_OUT, CHIP_OUT, CARD } from '../content/cards'
import { BOOST } from '../content/boosts'
import { buildCone, focusCost, gimmeRange, maxFocus, whyNotPlayable } from '../sim/effects'
import { SURFACE_LABEL, toPin } from '../sim/geometry'
import { baseputts } from '../sim/resolve/putt'
import { standings } from '../sim/resolve/field'
import { HoleView } from './HoleView'
import { Leaderboard } from './Leaderboard'
import { ShotButton, TechButton } from './Cards'
import { FocusMeter, Label } from './parts'
import { relStr } from './format'

export function Play({ s, dispatch, copyRun, copied }: {
  s: GameState
  dispatch: (a: Action) => void
  copyRun(): void
  copied: boolean
}) {
  const [showDeck, setShowDeck] = useState(false)
  const hole = currentHole(s)
  const pv = previewCone(s)
  const techs = handTechs(s).filter(t => s.selectedTechs.includes(t.id))
  const spent = focusCost(techs)
  // Bail Out armed: the shot ignores water and OB (resolve/shot.ts reads them
  // as rough). Display only — the picture is told so it can say so.
  const bailOut = techs.some(t => t.effects.some(e => e.op === 'ignoreHazards'))
  const dist = Math.round(toPin(hole, s.hole.ball))
  const rel = toPar(s)
  const board = standings(s.field, rel, s.scores.length, s.madeCut === false)
  const me = board.find(r => r.you)
  const holed = s.phase === 'holed'
  // the cap the REDUCER uses (reducer.ts:596) — a sponsor's docked points are
  // not empty pips waiting to fill, they are gone until the contract runs out
  const taken = focusPenaltyOf(s)
  const cap = Math.max(1, maxFocus(MAX_FOCUS, boostsOf(s)) - taken)

  const shotRows = useMemo(() => handShots(s).map(shot => {
    const blocked = whyNotPlayable(shot, s.hole.lie)
    const { cone } = buildCone(
      { shot, techniques: techs, aim: s.aim }, s.hole.lie, dist, boostsOf(s),
    )
    return {
      shot, blocked, carry: cone.carry, spread: cone.spread, roll: cone.roll,
      always: shot.id === PUNCH_OUT.id || shot.id === CHIP_OUT.id,
    }
  }), [s.hand, s.hole.lie, s.selectedTechs, s.aim, techs, dist, s.boosts])

  // ONE primary action per phase, named once, rendered in two places (the
  // in-flow button on desktop, the thumb bar on a phone) so they cannot drift.
  const primary =
    s.phase === 'shot' ? { label: 'Next shot', act: () => dispatch({ type: 'NEXT' }) }
    : holed ? {
      label: s.scores.length === holeCount(s) ? 'Sign your card' : 'Next hole',
      act: () => dispatch({ type: 'NEXT' }),
    }
    : null

  return (
    <div className="shell play">
      <header className="topbar">
        <div className="hz">
          <span className="hnum">{hole.num}</span>
          <div className="hid">
            <div className="hname">{hole.name}</div>
            <div className="hmeta">
              <span>Par {hole.par}</span>
              <span>{hole.length} yds</span>
              <span>Ev {s.event}/{EVENT_COUNT}</span>
              <span>Top {currentEvent(s).advance} advance</span>
            </div>
          </div>
        </div>
        <div className="stats">
          {/* THE SCORE is the one number that is allowed to be loud. */}
          <div className={`stat score ${rel < 0 ? 'under' : rel > 0 ? 'over' : ''}`}>
            <b>{relStr(rel)}</b><span>score</span>
          </div>
          {me && (
            <div className="stat"><b>{me.tied ? 'T' : ''}{me.place}</b><span>position</span></div>
          )}
          <div className="stat strokes"><b>{s.hole.strokes}</b><span>on this hole</span></div>
          {s.boosts.length > 0 && (
            <div className="stat bag">
              <b>{s.boosts.map(id => BOOST[id]!.icon).join(' ')}</b>
              <span>carrying</span>
            </div>
          )}
          <button className={`stat deckbtn ${showDeck ? 'open' : ''}`}
            aria-expanded={showDeck}
            onClick={() => setShowDeck(v => !v)}>
            <b>{s.deck.length}<i>/{deckList(s).length}</i></b>
            <span>bag {showDeck ? '▴' : '▾'}</span>
          </button>
          <FocusMeter className="stat focus" focus={s.focus} spent={spent}
            cap={cap} taken={taken} />
        </div>
      </header>

      {showDeck && <BagDrawer s={s} copyRun={copyRun} copied={copied}
        close={() => setShowDeck(false)} />}

      {s.justShuffled && s.hole.strokes === 0 && (
        <div className="banner shuffled">
          Bag reshuffled — everything you have used is back in.
        </div>
      )}

      {/* what just happened on the walk here — an encounter's result gets its
          moment on the tee it was dealt onto, then gets out of the way */}
      {s.lastEncounter && s.lastEncounter.holeIndex === s.hole.index && s.hole.strokes === 0 && (
        <div className={`banner encounterline ${s.lastEncounter.tone}`}>{s.lastEncounter.text}</div>
      )}

      {/* one line of finale weight, on the first tee of event 14 only —
          the same banner idiom as an encounter's moment, then gone */}
      {s.event === EVENT_COUNT && s.hole.index === 0 && s.hole.strokes === 0 && !holed && (
        <div className="banner encounterline finale">
          The last first tee of the year. After this, the season is just arithmetic.
        </div>
      )}

      <div className="board">
        <div className="figure">
          <HoleView hole={hole} ball={s.hole.ball} cone={pv?.cone ?? null}
            showCone={!!pv && !pv.blocked && s.phase === 'playing'}
            ignoreHazards={bailOut} />
          <div className="note">{hole.note}</div>
        </div>

        {/* Region B, lower half (MOBILE-PROPOSAL.md §2.1): the situation and
            the aim never scroll away from the diagram they describe. On
            desktop this renders exactly where the panel's first rows sat. */}
        <div className="cockpit">
          <div className="situation">
            <b>{dist}</b>
            <span className="sit-unit">yards to the pin</span>
            <span className="sit-lie">from {SURFACE_LABEL[s.hole.lie]}</span>
            <i className="sit-strokes">stroke {s.hole.strokes}</i>
          </div>

          {/* a bet rides this hole and only this hole — it settles (and this
              line leaves) the moment the ball drops (settleBet, reducer.ts) */}
          {s.pendingBet && <div className="note betnote">{s.pendingBet.reminder}</div>}

          {s.lastShot && <div className={`shotline ${holed ? 'big-news' : ''}`}>{s.lastShot}</div>}

          {s.phase === 'playing' && s.hole.puttFeet === null && (
            <>
              <Label className="aimlbl">Aim</Label>
              <div className="aims">
                {(['left', 'pin', 'right'] as const).map(a => (
                  <button key={a} className={`aim ${s.aim === a ? 'sel' : ''}`}
                    aria-pressed={s.aim === a}
                    onClick={() => dispatch({ type: 'SET_AIM', aim: a })}>
                    {a === 'pin' ? 'At the pin' : a === 'left' ? '◀ Safe left' : 'Safe right ▶'}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="panel">
          {/* the note reads once, at the tee, then gets out of the way (mobile) */}
          {s.hole.strokes === 0 && !holed && <div className="note m-note">{hole.note}</div>}

          {s.phase === 'shot' && primary && (
            <button className="big flowact" onClick={primary.act}>{primary.label}</button>
          )}

          {holed && (
            <>
              <div className="holed">
                <b>{scoreName(s.hole.strokes - hole.par)}</b>
                <span>{s.hole.strokes} on a par {hole.par}</span>
              </div>
              {/* the bet pays up in headline type, per the owner's note */}
              {s.log.filter(l => l.hole === hole.num && l.text.startsWith('The bet settles')).map((l, i) => (
                <div key={i} className={`betline ${l.tone}`}>{l.text}</div>
              ))}
              {s.log.some(l => l.hole === hole.num && l.text.startsWith('Momentum')) && (
                <div className="momentum">◆◆ Momentum — focus comes back faster after a good hole</div>
              )}
              <Leaderboard rows={board} window={5} thruTotal={holeCount(s)} />
              {/* the news first, then the door out of it */}
              {primary && (
                <button className="big flowact" onClick={primary.act}>{primary.label}</button>
              )}
            </>
          )}

          {s.phase === 'playing' && s.hole.puttFeet !== null && (() => {
            const feet = s.hole.puttFeet
            // The gimme range MUST be in this arithmetic. It wasn't, and a
            // player carrying Inside the Leather watched every close birdie
            // display as a forced two-putt par while the engine quietly holed
            // them for free. The picture must never lie — even kindly.
            const gimme = gimmeRange(boostsOf(s))
            const free = baseputts(feet, gimme)
            const cost = sinkPrice(s, feet)
            const par = hole.par
            const afterFree = s.hole.strokes + free - par
            const afterSink = s.hole.strokes + 1 - par
            // a charged Lucky Ball Marker PAYS the price — it must not hide
            // the button. Price-zero means tap-in (nothing to buy); marker
            // means "buyable, and the marker's got this one."
            const markered = s.freeSinks > 0 && cost !== null && cost > 0
            const canSink = cost !== null && cost > 0 && (markered || cost <= s.focus)
            const gimmed = feet > 4 && feet <= gimme
            return (
              <>
                <Label note={<><b>{feet} feet</b> left</>}>On the green</Label>
                <div className="putts">
                  <button className="putt lag" onClick={() => dispatch({ type: 'PUTT', sink: false })}>
                    <span className="putt-name">{gimmed ? 'Pick it up' : free === 1 ? 'Tap in' : `${free} putts`}</span>
                    <span className={`putt-make ${afterFree < 0 ? 'under' : ''}`}>{scoreName(afterFree)}</span>
                    <span className="putt-sub">{gimmed ? 'inside the leather' : 'free'}</span>
                  </button>
                  {cost !== null && cost > 0 && (
                    <button className={`putt charge ${canSink ? '' : 'off'}`}
                      disabled={!canSink}
                      onClick={() => dispatch({ type: 'PUTT', sink: true })}>
                      <span className="putt-name">Hole it</span>
                      <span className={`putt-make ${afterSink < 0 ? 'under' : ''}`}>{scoreName(afterSink)}</span>
                      <span className="putt-sub">
                        {markered ? 'free · lucky marker'
                          : canSink ? `${'◆'.repeat(cost)} focus`
                            : `${'◆'.repeat(cost)} — you have ${s.focus}`}
                      </span>
                    </button>
                  )}
                  {cost === null && (
                    <div className="putt off">
                      <span className="putt-name">Too far</span>
                      <span className="putt-sub">nobody holes these on purpose</span>
                    </div>
                  )}
                </div>
                <div className="putt-note">
                  No dice on the green. Distance decides what par costs you —
                  a birdie is something you buy.
                </div>
              </>
            )
          })()}

          {s.phase === 'playing' && s.hole.puttFeet === null && (
            <>
              {handTechs(s).length > 0 && (
                <>
                  <Label note="costs focus, not strokes">Technique</Label>
                  <div className="techs">
                    {handTechs(s).map((t, i) => (
                      <TechButton key={t.id + i} tech={t}
                        selected={s.selectedTechs.includes(t.id)}
                        disabled={!s.selectedTechs.includes(t.id) && t.focus > s.focus - spent}
                        onClick={() => dispatch({ type: 'TOGGLE_TECH', id: t.id })} />
                    ))}
                  </div>
                </>
              )}

              <Label note={<>reuse any of these as often as you like — the STROKE
                is what costs you, not the card</>}>Your hand</Label>
              <div className="shots">
                {shotRows.map(({ shot, blocked, carry, spread, roll, always }, i) => (
                  <ShotButton key={shot.id + i} shot={shot}
                    selected={s.selectedShot === shot.id}
                    blocked={blocked} carry={carry} spread={spread} roll={roll}
                    dist={dist} greenRadius={hole.greenRadius} always={always}
                    onClick={() => dispatch({ type: 'SELECT_SHOT', id: shot.id })} />
                ))}
              </div>

              {/* the real price, not the sticker — An Organized Bag halves
                  it, and the button has to say so or the discount is a lie */}
              <button className="redraw" disabled={s.focus < redrawPrice(s)}
                onClick={() => dispatch({ type: 'REDRAW' })}>
                <span>Check the bag<em>six new cards</em></span>
                <b>{redrawPrice(s) === 0 ? 'free' : '◆'.repeat(redrawPrice(s))}</b>
              </button>

              <button className="big commit flowact" disabled={!pv || !!pv.blocked}
                onClick={() => dispatch({ type: 'COMMIT' })}>
                {pv?.blocked ? pv.blocked : pv ? 'Hit it' : 'Pick a shot'}
              </button>
            </>
          )}

          <Scorecard s={s} holed={holed} />
        </div>

        {/* Region D (MOBILE-PROPOSAL.md §2.1): on a phone the primary action
            lives in ONE fixed slot at the thumb, next to the focus it spends.
            Hidden on desktop; the in-flow .flowact buttons are hidden on
            mobile — same dispatches, one visible at a time. */}
        <div className="actionbar">
          <FocusMeter className="ab-focus" focus={s.focus} spent={spent}
            cap={cap} taken={taken} />
          {primary && <button className="big" onClick={primary.act}>{primary.label}</button>}
          {s.phase === 'playing' && s.hole.puttFeet === null && (
            <button className="big commit" disabled={!pv || !!pv.blocked}
              onClick={() => dispatch({ type: 'COMMIT' })}>
              {pv?.blocked ? pv.blocked : pv ? 'Hit it' : 'Pick a shot'}
            </button>
          )}
          {s.phase === 'playing' && s.hole.puttFeet !== null && (
            <div className="ab-note">On the green — {s.hole.puttFeet} feet</div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * THE SCORECARD STRIP.
 *
 * It used to print a hole number and a stroke count. A stroke count with no
 * par beside it is not a score — you cannot tell a 4 that is a birdie from a 4
 * that is a bogey without counting back to the course. Par is on the card now,
 * where it is on every real one, and so is the running total: the cut line is
 * quoted to par, so the number the player is judged on should be readable
 * without arithmetic. Both come straight off state; nothing new is derived.
 */
function Scorecard({ s, holed }: { s: GameState; holed: boolean }) {
  const holes = courseOf(s).holes
  const played = s.scores.length
  const gross = s.scores.reduce((a, b) => a + b, 0)
  const parSoFar = holes.slice(0, played).reduce((a, h) => a + h.par, 0)
  const rel = gross - parSoFar
  return (
    <div className="scorecard" style={{ gridTemplateColumns: `repeat(${holes.length + 1}, 1fr)` }}>
      {holes.map((h, i) => {
        const sc = s.scores[i]
        const d = sc === undefined ? null : sc - h.par
        const cut = i + 1 === CUT_AFTER_HOLE
        return (
          <div key={i} className={`sq ${i === s.hole.index && !holed ? 'now' : ''} ${cut ? 'cutmark' : ''} ${
            d === null ? '' : d < 0 ? 'good' : d > 0 ? 'bad' : 'level'}`}>
            <span className="sq-n">{h.num}</span>
            <b>{sc ?? '·'}</b>
            <span className="sq-par">{h.par}</span>
          </div>
        )
      })}
      <div className="sq total">
        <span className="sq-n">tot</span>
        <b>{played ? gross : '·'}</b>
        <span className={`sq-par ${rel < 0 ? 'good' : rel > 0 ? 'bad' : ''}`}>
          {played ? relStr(rel) : '–'}
        </span>
      </div>
    </div>
  )
}

/**
 * THE BAG DRAWER. Everything you own, in one sheet: the cards grouped by what
 * they cost you (a stroke, or focus) and carrying their yardage, the equipment
 * with its blurb, and the board copy button — because the submission IS the
 * action log, so mid-round is a legal paste.
 */
function BagDrawer({ s, copyRun, copied, close }: {
  s: GameState; copyRun(): void; copied: boolean; close(): void
}) {
  const ids = deckList(s)
  const counts = new Map<string, number>()
  for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1)
  const rows = [...counts.entries()]
    .flatMap(([id, n]) => { const c = CARD[id]; return c ? [{ id, n, c }] : [] })
  const shots = rows.filter(r => r.c.kind === 'shot')
  const techs = rows.filter(r => r.c.kind === 'technique')
  return (
    <div className="deckdrawer" role="region" aria-label="Your bag">
      <div className="drawerhead">
        <Label note={`· ${s.deck.length} left to draw · ${s.discard.length} used`}>
          Your bag — {ids.length} cards
        </Label>
        <button className="drawerx" onClick={close} aria-label="Close the bag">✕</button>
      </div>

      <div className="bagcols">
        <div>
          <Label note="cost a stroke">Shots</Label>
          <div className="deckpanel">
            {shots.map(r => (
              <span key={r.id} className="chip" title={r.c.blurb}>
                {r.c.name}
                <i>{(r.c as { carry: number }).carry}y</i>
                {r.n > 1 && <b>×{r.n}</b>}
              </span>
            ))}
          </div>
        </div>
        <div>
          <Label note="cost focus">Techniques</Label>
          <div className="deckpanel">
            {techs.length === 0 && <span className="chip empty">none in the bag</span>}
            {techs.map(r => (
              <span key={r.id} className="chip tech" title={r.c.blurb}>
                {r.c.name}
                <i>{(r.c as { focus: number }).focus === 0 ? 'free' : '◆'.repeat((r.c as { focus: number }).focus)}</i>
                {r.n > 1 && <b>×{r.n}</b>}
              </span>
            ))}
          </div>
        </div>
      </div>

      {s.boosts.length > 0 && (
        <>
          {/* owner playtest note: equipment must SAY what it is doing —
              a boost you can't read is a boost you forget you own */}
          <Label note="always on">Carrying</Label>
          <div className="boostlist">
            {s.boosts.map(id => {
              const b = BOOST[id]!
              return (
                <div key={id} className="boostrow">
                  <span className="boost-ic">{b.icon}</span>
                  <div>
                    <b>{b.name}</b>
                    <span>{b.blurb}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {focusPenaltyOf(s) > 0 && (
        <div className="decalrow">
          <b>Sponsor decal</b>
          <span>
            {focusPenaltyOf(s)} focus a hole, for {Math.max(...s.sponsorContracts)} more
            {Math.max(...s.sponsorContracts) === 1 ? ' event' : ' events'}.
          </span>
        </div>
      )}

      <button className="ghost drawershare" onClick={copyRun}>
        {copied ? 'Copied — paste it in the chat' : 'Copy this run for the board'}
      </button>
    </div>
  )
}
