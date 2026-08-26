import { useMemo, useReducer, useRef, useState } from 'react'
import {
  reduce, previewCone, redrawPrice, scoreName, handShots, handTechs, boostsOf, sinkPrice,
  type Action,
} from '../sim/reducer'
import {
  CUT_AFTER_HOLE, MAX_FOCUS,
  courseFor, courseOf, currentEvent, currentHole, deckList, grossEarnings,
  holeCount, initialState, parThrough, toPar,
  type GameState,
} from '../sim/state'
import {
  SEASON, EVENT_COUNT, checkAfter, money, MONEY_CHECKS, moneyListRank, TOUR_SIZE,
} from '../content/season'
import { PUNCH_OUT, CHIP_OUT, HAND_SIZE, CARD } from '../content/cards'
import { BOOST } from '../content/boosts'
import { CUT_PRICE, REROLL_PRICE } from '../content/shop'
import { WEEK, LESSON_FEE } from '../content/weeks'
import { ENCOUNTER } from '../content/encounters'
import { buildCone, focusCost, gimmeRange, maxFocus, whyNotPlayable } from '../sim/effects'
import { SURFACE_LABEL, toPin } from '../sim/geometry'
import { baseputts } from '../sim/resolve/putt'
import { HoleView } from './HoleView'
import { Leaderboard } from './Leaderboard'
import { standings } from '../sim/resolve/field'
import { ShotButton, TechButton, DeckPanel } from './Cards'
import { SAVE_VERSION, archiveRun, loadArchive, loadSave, persistSave } from '../platform/storage'
import { useGameAudio } from './sound'

const START_SEED = 20260824

/** Resume the saved run by replaying its log through the reducer (§9);
 * fresh season if there is no save or the current reducer can't replay it. */
function bootstrap(): { state: GameState; seed: number; actions: Action[] } {
  const saved = loadSave()
  if (saved) {
    try {
      let st = initialState(saved.seed)
      for (const a of saved.actions) st = reduce(st, a)
      return { state: st, seed: saved.seed, actions: [...saved.actions] }
    } catch {
      // a log the reducer can no longer replay is not a save, it is a relic
    }
  }
  return { state: initialState(START_SEED), seed: START_SEED, actions: [] }
}

function relStr(n: number): string {
  return n === 0 ? 'E' : n > 0 ? `+${n}` : `${n}`
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]!)
}

/** "Eight holes at Salt Flats" reads better than "8 holes at Salt Flats". */
function countWord(n: number): string {
  const words = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six',
    'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve']
  return words[n] ?? String(n)
}

export function App() {
  const [showDeck, setShowDeck] = useState(false)
  const boot = useMemo(bootstrap, [])
  const logRef = useRef({ seed: boot.seed, actions: boot.actions })
  const [s, rawDispatch] = useReducer(
    (st: GameState, a: Action) => reduce(st, a),
    boot.state,
  )
  // every dispatch is also a save: append to the log and write it out.
  // RESTART rebuilds from its own seed, so the history before it is dead
  // weight and the log starts over at that action.
  const dispatch = (a: Action) => {
    rawDispatch(a)
    const log = logRef.current
    if (a.type === 'RESTART') {
      // no season is destroyed by starting the next one (storage.ts ARCHIVE)
      archiveRun(log.seed, log.actions)
      log.seed = a.seed; log.actions = [a]
    }
    else log.actions.push(a)
    persistSave(log.seed, log.actions)
  }
  useGameAudio(s)
  // THE CLUBHOUSE BOARD (tools/board.ts): a run is shared as its replayable
  // action log — the board verifies by replaying, so this IS the submission.
  const [copied, setCopied] = useState(false)
  const copyRun = () => {
    const log = logRef.current
    const current = { version: SAVE_VERSION, seed: log.seed, actions: log.actions }
    const arch = loadArchive()
    // one paste carries EVERYTHING this browser ever played — the current
    // run plus every archived season. The board and runstats read bundles.
    const blob = JSON.stringify(
      arch.length ? { version: SAVE_VERSION, runs: [...arch, current] } : current,
    )
    navigator.clipboard.writeText(blob).then(
      () => { setCopied(true); setTimeout(() => setCopied(false), 2500) },
      () => {},
    )
  }
  const hole = currentHole(s)
  const pv = previewCone(s)
  const techs = handTechs(s).filter(t => s.selectedTechs.includes(t.id))
  const spent = focusCost(techs)
  const dist = Math.round(toPin(hole, s.hole.ball))
  const rel = toPar(s)
  const board = standings(s.field, rel, s.scores.length, s.madeCut === false)
  const me = board.find(r => r.you)

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

  if (s.phase === 'intro') {
    return (
      <div className="shell intro">
        <h1>Don't Hit It<br />In The Water</h1>
        <p className="tagline">
          Fourteen events. One job to keep.
        </p>
        <ul className="rules">
          <li>You draw <strong>{HAND_SIZE} cards at every tee</strong> and play the hole with
            them — reuse any as often as you like. Shots cost a stroke; techniques cost focus.</li>
          <li>The <strong>cone</strong> is where the ball can finish. It never lies — if the
            water isn't inside it, you cannot find the water.</li>
          <li>Par is free. <strong>A birdie is something you buy</strong> with focus on the green.</li>
          <li>You start the season a <strong>worse golfer than you will end it</strong> — your
            cones tighten as you pick up equipment. The cut line tightens faster.</li>
          <li>Four holes, then the <strong>cut</strong> — only the top of the board plays on,
            and the number who do shrinks all season.</li>
          <li>Miss the Money List after event 5, 9 or 12 and you lose your job. Events 13
            and 14 cannot end you — they decide how well you finish.</li>
        </ul>
        <button className="big" onClick={() => dispatch({ type: 'START' })}>Start the season</button>
      </div>
    )
  }

  if (s.phase === 'schedule') {
    const ev = currentEvent(s)
    // There is NO next check at events 13-14 — "they cannot end you" (intro).
    // The old non-null assertion here black-screened the first player who
    // ever survived to 13. Found live, the hard way, 25 Aug 2026.
    const next = MONEY_CHECKS.find(c => c.after >= s.event)
    const short = next ? next.need - grossEarnings(s) : 0
    return (
      <div className="shell intro">
        <div className="mini-eyebrow">
          Event {s.event} of {EVENT_COUNT} · {money(grossEarnings(s))} earned
        </div>
        <h1 className={`small ${ev.major ? 'major' : ''}`}>{ev.name}</h1>
        <div className="evfacts">
          <div><b>{ev.advance}</b><span>make the cut</span></div>
          <div><b>{money(ev.purse)}</b><span>purse</span></div>
          <div>
            <b>×{(ev.sharpness * s.practice).toFixed(2)}</b>
            <span>your cones{s.practice < 1 ? ' · practised' : ''}</span>
          </div>
        </div>
        <p className="tagline">
          {ev.major
            ? `A major, at ${courseOf(s).label}. Survive the cut and you pick up equipment.`
            : `${countWord(holeCount(s))} holes at ${courseOf(s).label}. Top ${ev.advance} and ties play the weekend.`}
        </p>
        <div className="ladder">
          {SEASON.map(e => (
            <span key={e.num}
              className={`rung ${e.num === s.event ? 'now' : ''} ${e.num < s.event ? 'done' : ''} ${e.major ? 'maj' : ''}`}
              title={`${e.name} · ${courseFor(s.seed, e.num).label}`}>{e.num}</span>
          ))}
        </div>
        <p className="moneynote">
          {next
            ? <>Money List after event {next.after}: {money(next.need)}
              {short > 0 ? ` — ${money(short)} short` : ' — clear'}</>
            : <>The Money List is done with you — nothing left can end this season,
              only decide where it lands</>}
          {' · '}you are {ordinal(moneyListRank(grossEarnings(s), Math.max(1, s.event - 1)))}
          {' of '}{TOUR_SIZE}
          {s.skipped > 0 && ` · ${s.skipped} week${s.skipped > 1 ? 's' : ''} sat out`}
        </p>
        <button className="big" onClick={() => dispatch({ type: 'NEXT' })}>Tee off</button>
        <p className="note" style={{ textAlign: 'center' }}>
          <button className="ghost" onClick={copyRun}>
            {copied ? 'Copied — paste it in the chat' : 'Copy this run for the board'}
          </button>
          {' '}<a href="board.html">the clubhouse board →</a>
        </p>

        {s.weekOptions.length > 0 && (
          <>
            <div className="lbl" style={{ marginTop: 18 }}>
              Take the week off <em>— no prize money, and the Money List does not wait</em>
            </div>
            <div className="weeks">
              {s.weekOptions.map(id => {
                const w = WEEK[id]!
                const broke = id === 'lesson' && s.earnings < LESSON_FEE
                const picked = s.pendingWeek === id
                return (
                  <button key={id} className={`weekcard ${broke ? 'off' : ''} ${picked ? 'picked' : ''}`}
                    disabled={broke}
                    onClick={() => dispatch({ type: 'PICK_WEEK', id: picked ? null : id })}>
                    <span className="week-icon">{w.icon}</span>
                    <span className="week-name">{w.name}</span>
                    <span className="week-blurb">{w.blurb}</span>
                    <span className="week-cost">{w.cost}</span>
                  </button>
                )
              })}
            </div>

            {/* CONFIRM. These are the most irreversible buttons in the game and
                they used to fire on a single click, sitting next to Tee off. */}
            {s.pendingWeek && (() => {
              const w = WEEK[s.pendingWeek]!
              return (
                <div className="confirm">
                  <div className="confirm-q">
                    Withdraw from {ev.name} to {w.name.toLowerCase()}?
                  </div>
                  <div className="confirm-why">
                    {w.cost} You will not play this week, and event {s.event} still
                    counts against the Money List.
                  </div>
                  <div className="confirm-row">
                    <button className="big danger"
                      onClick={() => dispatch({ type: 'TAKE_WEEK', id: s.pendingWeek! })}>
                      Yes — withdraw
                    </button>
                    <button className="ghost"
                      onClick={() => dispatch({ type: 'PICK_WEEK', id: null })}>
                      No, I'll play
                    </button>
                  </div>
                </div>
              )
            })()}
          </>
        )}
        <DeckPanel ids={deckList(s)} />
      </div>
    )
  }

  if (s.phase === 'payout') {
    const total = s.scores.reduce((a, b) => a + b, 0)
    const rel = total - parThrough(s, s.scores.length)
    const made = s.madeCut !== false
    return (
      <div className="shell intro">
        <div className="mini-eyebrow">{currentEvent(s).name}</div>
        <h1 className={`small ${made ? 'good' : 'bad'}`}>
          {made ? `${ordinal(s.lastPlace)} place` : 'Missed the cut'}
        </h1>
        <p className="tagline">
          {made
            ? `${total} strokes, ${relStr(rel)}. That is ${money(s.lastPaid)}.`
            : `${relStr(rel)} through ${s.scores.length}. No cheque this week.`}
        </p>
        <div className="evfacts">
          <div><b>{money(grossEarnings(s))}</b><span>season earnings</span></div>
          <div><b>{s.event}/{EVENT_COUNT}</b><span>events played</span></div>
        </div>
        <button className="big" onClick={() => dispatch({ type: 'NEXT' })}>
          {made ? 'To the bag' : 'On to the next one'}
        </button>
        <Leaderboard rows={board} window={8} thruTotal={holeCount(s)}
          title="Final leaderboard" />
      </div>
    )
  }

  if (s.phase === 'moneylist') {
    const check = checkAfter(s.event)!
    return (
      <div className="shell intro">
        <div className="mini-eyebrow">The Money List · after event {check.after}</div>
        <h1 className={`small ${s.keptJob ? 'good' : 'bad'}`}>
          {s.keptJob ? 'You keep your card' : 'You lose your card'}
        </h1>
        <p className="tagline">
          {money(grossEarnings(s))} earned, {ordinal(moneyListRank(grossEarnings(s), check.after))} on the list.
          {' '}You needed {money(check.need)}.
        </p>
        <button className="big" onClick={() => dispatch({ type: 'NEXT' })}>
          {s.keptJob ? (s.event >= EVENT_COUNT ? 'Sign the card' : 'Keep going') : 'See the season'}
        </button>
      </div>
    )
  }

  if (s.phase === 'shop') {
    // undefined past event 12 — see the schedule screen's note on the same line
    const next = MONEY_CHECKS.find(c => c.after >= s.event)
    const short = next ? next.need - grossEarnings(s) : 0
    return (
      <div className="shell intro">
        <div className="mini-eyebrow">
          The pro shop · after {currentEvent(s).name}
        </div>
        <h1 className="small">{money(s.earnings)}</h1>
        <p className="tagline">
          The Money List counts what you win, not what you keep — spending here cannot touch it.
          {!next
            ? ' The list is closed for the year. Whatever you buy now, you keep the card either way.'
            : short > 0
              ? ` You have earned ${money(grossEarnings(s))} of the ${money(next.need)} event ${next.after} demands.`
              : ` You are clear of event ${next.after}'s line — the rest is investment.`}
        </p>
        <div className="offer">
          {s.offer.map((item, i) => {
            const afford = item.price <= s.earnings
            if (item.kind === 'boost') {
              const b = BOOST[item.id]!
              return (
                <button key={item.id} className={`offercard is-boost ${afford ? '' : 'off'}`}
                  disabled={!afford} onClick={() => dispatch({ type: 'BUY', index: i })}>
                  <span className="offer-kind">Equipment · always on</span>
                  <span className="boost-icon">{b.icon}</span>
                  <span className="offer-name">{b.name}</span>
                  <span className="offer-blurb">{b.blurb}</span>
                  <span className="offer-price">{money(item.price)}</span>
                </button>
              )
            }
            const c = CARD[item.id]!
            return (
              <button key={item.id + i} className={`offercard ${afford ? '' : 'off'}`}
                disabled={!afford} onClick={() => dispatch({ type: 'BUY', index: i })}>
                <span className="offer-kind">
                  {c.kind === 'shot' ? 'Shot · costs a stroke' : 'Technique · costs focus'}
                </span>
                <span className="offer-name">{c.name}</span>
                {c.kind === 'shot'
                  ? <span className="offer-num">{c.carry}</span>
                  : <span className="offer-focus">{c.focus === 0 ? 'free' : '\u25c6'.repeat(c.focus)}</span>}
                <span className="offer-blurb">{c.blurb}</span>
                <span className="offer-price">{money(item.price)}</span>
              </button>
            )
          })}
        </div>
        <div className="shoprow">
          <button className="ghost" disabled={CUT_PRICE > s.earnings}
            onClick={() => dispatch({ type: 'BUY_CUT' })}>
            Cut a card from the bag <b>{money(CUT_PRICE)}</b>
          </button>
          <button className="ghost" disabled={REROLL_PRICE > s.earnings}
            onClick={() => dispatch({ type: 'REROLL' })}>
            Different stock <b>{money(REROLL_PRICE)}</b>
          </button>
        </div>
        <button className="big" onClick={() => dispatch({ type: 'LEAVE_SHOP' })}>
          {s.offer.length ? 'Bank the rest' : 'On to the next week'}
        </button>
        <DeckPanel ids={deckList(s)} />
        {s.boosts.length > 0 && (
          <div className="deckpanel" style={{ marginTop: 8 }}>
            {s.boosts.map(id => (
              <span key={id} className="chip boost" title={BOOST[id]!.blurb}>{BOOST[id]!.icon} {BOOST[id]!.name}</span>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (s.phase === 'remove') {
    return (
      <div className="shell intro">
        <div className="mini-eyebrow">
          {s.mustSwap ? 'The pro shop · the bag is full'
            : s.cutIsPaid ? 'The pro shop · fitting' : 'A week getting fitted'}
        </div>
        <h1 className="small">{s.mustSwap ? 'Something has to come out' : 'Cut a card'}</h1>
        <p className="tagline">
          {s.mustSwap
            ? 'The bag holds twenty and you just bought the twenty-first. Pick what goes.'
            : 'Fewer cards means you draw the good ones more often. Pick one to go.'}
        </p>
        <div className="removelist">
          {deckList(s).map((id, i) => (
            <button key={id + i} className="removeone"
              onClick={() => dispatch({ type: 'REMOVE_CARD', id })}>
              <b>{CARD[id]!.name}</b>
              <span>{CARD[id]!.kind === 'shot'
                ? `${(CARD[id] as { carry: number }).carry} yds`
                : `${(CARD[id] as { focus: number }).focus} focus`}</span>
            </button>
          ))}
        </div>
        {!s.mustSwap && (
          <button className="ghost" onClick={() => dispatch({ type: 'REMOVE_CARD', id: null })}>
            Changed my mind — refund it
          </button>
        )}
      </div>
    )
  }

  if (s.phase === 'cut') {
    const front = s.scores.slice(0, CUT_AFTER_HOLE).reduce((a, b) => a + b, 0) - parThrough(s, CUT_AFTER_HOLE)
    const ev = currentEvent(s)
    return (
      <div className="shell intro">
        <h1 className={s.madeCut ? 'good' : 'bad'}>{s.madeCut ? 'Made the cut' : 'Missed the cut'}</h1>
        <p className="tagline">
          {relStr(front)} through {CUT_AFTER_HOLE}.
          {' '}Top {ev.advance} and ties played on
          {s.cutLine !== null && <> — it took {s.cutLine <= 0 ? relStr(s.cutLine) : relStr(s.cutLine)} or better</>}
          {s.cutAdvanced !== null && <>, and {s.cutAdvanced} made it</>}.
        </p>
        <button className="big" onClick={() => dispatch({ type: 'NEXT' })}>
          {s.madeCut
            ? (ev.major ? 'Pick up your prize' : 'Play the weekend')
            : 'Pack up'}
        </button>
        <Leaderboard rows={board} window={6} thruTotal={holeCount(s)} />
      </div>
    )
  }

  if (s.phase === 'boost') {
    /*
     * UI REACHABILITY — this screen was missing for the game's ENTIRE life.
     * The reducer has had the 'boost' phase since majors began handing out
     * equipment, and every harness bot takes its boost through the reducer,
     * so every test stayed green — while a real player who made a major's cut
     * pressed "Pick up your prize", landed in a phase with no screen, and the
     * app fell through to the playing shell with nothing actionable in it.
     * A permanent softlock only a human at the actual UI could ever meet.
     * When the reducer gains a phase, the UI must gain a room.
     */
    return (
      <div className="shell intro">
        <div className="mini-eyebrow">{currentEvent(s).name} · the cut is made</div>
        <h1 className="small good">Pick up your prize</h1>
        <p className="tagline">
          A major pays its survivors in equipment. Take one — it is yours for
          the rest of the season, and the weekend starts the moment you lift it.
        </p>
        <div className="offer">
          {s.boostOffer.map(id => {
            const b = BOOST[id]!
            return (
              <button key={id} className="offercard is-boost"
                onClick={() => dispatch({ type: 'TAKE_BOOST', id })}>
                <span className="offer-kind">Equipment · always on</span>
                <span className="boost-icon">{b.icon}</span>
                <span className="offer-name">{b.name}</span>
                <span className="offer-blurb">{b.blurb}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (s.phase === 'encounter') {
    /* Somebody on the walk to the fifth tee (content/encounters.ts). Two
       buttons, and only two: theirs, and WALK ON — which is always safe,
       always available, and never explained further. Where the offer is a
       gamble the odds are in the small text, said plainly (P8 extends to
       people). Same room shape as the week cards, on purpose: this is the
       same kind of decision, just wearing a bib or a windbreaker. */
    const enc = ENCOUNTER[s.encounterOffer ?? '']
    if (!enc) {
      // an offer the content no longer knows must still have a door out —
      // "when the reducer gains a phase, the UI must gain a room", and a
      // room must never lose its exit
      return (
        <div className="shell intro">
          <div className="mini-eyebrow">{currentEvent(s).name} · the cut is made</div>
          <h1 className="small">Nobody there</h1>
          <p className="tagline">Whoever it was, they have gone.</p>
          <button className="big" onClick={() => dispatch({ type: 'WALK_ON' })}>Walk on</button>
        </div>
      )
    }
    return (
      <div className="shell intro">
        <div className="mini-eyebrow">{currentEvent(s).name} · the cut is made</div>
        <span className="enc-icon">{enc.icon}</span>
        <h1 className="small">{enc.name}</h1>
        <p className="tagline">{enc.blurb}</p>
        <div className="weeks enc-choices">
          <button className="weekcard" onClick={() => dispatch({ type: 'ENGAGE' })}>
            <span className="week-name">{enc.accept}</span>
            <span className="week-blurb">{enc.stakes}</span>
          </button>
          <button className="weekcard enc-walk" onClick={() => dispatch({ type: 'WALK_ON' })}>
            <span className="week-name">Walk on</span>
            <span className="week-cost">{enc.walk}</span>
          </button>
        </div>
      </div>
    )
  }

  if (s.phase === 'over') {
    const finished = s.event >= EVENT_COUNT && s.keptJob !== false
    const played = finished ? EVENT_COUNT : s.event
    const rank = moneyListRank(grossEarnings(s), played)
    const failed = MONEY_CHECKS.find(c => c.after === s.event && s.keptJob === false)
    const grade = !finished ? null
      : rank === 1 ? 'You won the Money List. Nobody earned more.'
        : rank <= 5 ? 'Top five. You are exempt for two years.'
          : rank <= 15 ? 'A career year. Nothing to explain to anybody.'
            : rank <= 28 ? 'Card renewed, comfortably.'
              : 'You kept your card. Same time next year.'
    return (
      <div className="shell intro">
        <div className="mini-eyebrow">
          {finished ? 'Season complete' : `Your season ended at event ${s.event}`}
        </div>
        <h1 className={finished ? 'good' : ''}>{money(grossEarnings(s))}</h1>
        <p className="tagline">
          {ordinal(rank)} on the Money List. {finished ? grade : 'Back to Qualifying. Everyone goes back eventually.'}
        </p>

        {/* THE ACCOUNTING. "Not close enough" told you nothing you could act on. */}
        <div className="evfacts">
          <div><b>{s.cutsMade}/{s.cutsMade + s.cutsMissed}</b><span>cuts made</span></div>
          <div><b>{money(s.spent)}</b><span>spent in the shop</span></div>
          <div><b>{s.skipped}</b><span>weeks sat out</span></div>
        </div>
        {failed && (
          <p className="moneynote">
            You needed {money(failed.need)} by event {failed.after} and won {money(grossEarnings(s))}
            {' '}— {money(failed.need - grossEarnings(s))} short.
            {s.cutsMissed > 0 && ` You missed ${s.cutsMissed} cut${s.cutsMissed > 1 ? 's' : ''}.`}
            {s.skipped > 0 && ` You sat out ${s.skipped} week${s.skipped > 1 ? 's' : ''}.`}
          </p>
        )}

        <div className="ladder big-ladder">
          {SEASON.map(e => (
            <span key={e.num}
              className={`rung ${e.num < s.event ? 'done' : ''} ${e.num === s.event ? 'now' : ''} ${e.major ? 'maj' : ''}`}
              title={`${e.name} · ${courseFor(s.seed, e.num).label}`}>{e.num}</span>
          ))}
        </div>
        {s.boosts.length > 0 && (
          <>
            <div className="lbl">What you were carrying</div>
            <div className="deckpanel">
              {s.boosts.map(id => (
                <span key={id} className="chip boost" title={BOOST[id]!.blurb}>{BOOST[id]!.icon} {BOOST[id]!.name}</span>
              ))}
            </div>
          </>
        )}
        <p className="note" style={{ textAlign: 'center' }}>
          <button className="ghost" onClick={copyRun}>
            {copied ? 'Copied — paste it in the chat' : 'Copy this season for the board'}
          </button>
          {' '}<a href="board.html">the clubhouse board →</a>
        </p>
        <button className="big" onClick={() => dispatch({ type: 'RESTART', seed: (Date.now() % 100000) + 7 })}>
          New season
        </button>
      </div>
    )
  }

  const holed = s.phase === 'holed'

  return (
    <div className="shell play">
      <header className="topbar">
        <div className="hz">
          <span className="hnum">{hole.num}</span>
          <div>
            <div className="hname">{hole.name}</div>
            <div className="hmeta">
              Par {hole.par} · {hole.length} yds · ev {s.event}/{EVENT_COUNT} ·
              top {currentEvent(s).advance} advance
            </div>
          </div>
        </div>
        <div className="stats">
          <div className="stat"><b>{relStr(rel)}</b><span>score</span></div>
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
          <button className="stat deckbtn" onClick={() => setShowDeck(v => !v)}>
            <b>{s.deck.length}<i>/{deckList(s).length}</i></b>
            <span>deck ▾</span>
          </button>
          <div className="stat focus">
            <b>{'◆'.repeat(Math.max(0, s.focus - spent))}<i>{'◆'.repeat(spent)}</i>
              {'◇'.repeat(Math.max(0, maxFocus(MAX_FOCUS, boostsOf(s)) - s.focus))}</b>
            <span>focus</span>
          </div>
        </div>
      </header>

      {showDeck && (
        <div className="deckdrawer">
          <div className="lbl">Your bag — {deckList(s).length} cards
            <em> · {s.deck.length} left to draw · {s.discard.length} used</em></div>
          <DeckPanel ids={deckList(s)} />
          {s.boosts.length > 0 && (
            <>
              <div className="lbl" style={{ marginTop: 12 }}>Carrying</div>
              {/* owner playtest note: equipment must SAY what it is doing —
                  a boost you can't read is a boost you forget you own */}
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
        </div>
      )}

      {s.justShuffled && s.hole.strokes === 0 && (
        <div className="shuffled">Bag reshuffled — everything you have used is back in.</div>
      )}

      {/* what just happened on the walk here — an encounter's result gets its
          moment on the tee it was dealt onto, then gets out of the way */}
      {s.lastEncounter && s.lastEncounter.holeIndex === s.hole.index && s.hole.strokes === 0 && (
        <div className={`encounterline ${s.lastEncounter.tone}`}>{s.lastEncounter.text}</div>
      )}

      <div className="board">
        <div className="figure">
          <HoleView hole={hole} ball={s.hole.ball} cone={pv?.cone ?? null}
            showCone={!!pv && !pv.blocked && s.phase === 'playing'} />
          <div className="note">{hole.note}</div>
        </div>

        {/* Region B, lower half (MOBILE-PROPOSAL.md §2.1): the situation and
            the aim never scroll away from the diagram they describe. On
            desktop this renders exactly where the panel's first rows sat. */}
        <div className="cockpit">
          <div className="situation">
            <b>{dist}</b> yards to the pin — from {SURFACE_LABEL[s.hole.lie]}
            <i className="sit-strokes"> · stroke {s.hole.strokes}</i>
          </div>

          {/* a bet rides this hole and only this hole — it settles (and this
              line leaves) the moment the ball drops (settleBet, reducer.ts) */}
          {s.pendingBet && <div className="note betnote">{s.pendingBet.reminder}</div>}

          {s.lastShot && <div className={`shotline ${holed ? 'big-news' : ''}`}>{s.lastShot}</div>}

          {s.phase === 'playing' && s.hole.puttFeet === null && (
            <>
              <div className="lbl">Aim</div>
              <div className="aims">
                {(['left', 'pin', 'right'] as const).map(a => (
                  <button key={a} className={`aim ${s.aim === a ? 'sel' : ''}`}
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

          {s.phase === 'shot' && (
            <button className="big flowact" onClick={() => dispatch({ type: 'NEXT' })}>Next shot</button>
          )}

          {holed && (
            <>
              <Leaderboard rows={board} window={5} thruTotal={holeCount(s)} />
              <div className="holed">
                {scoreName(s.hole.strokes - hole.par)} · {s.hole.strokes} on a par {hole.par}
              </div>
              {s.log.some(l => l.hole === hole.num && l.text.startsWith('Momentum')) && (
                <div className="momentum">◆◆ Momentum — focus comes back faster after a good hole</div>
              )}
              {/* the bet pays up in headline type, per the owner's note */}
              {s.log.filter(l => l.hole === hole.num && l.text.startsWith('The bet settles')).map((l, i) => (
                <div key={i} className={`betline ${l.tone}`}>{l.text}</div>
              ))}
              <button className="big flowact" onClick={() => dispatch({ type: 'NEXT' })}>
                {s.scores.length === holeCount(s) ? 'Sign your card' : 'Next hole'}
              </button>
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
                <div className="lbl">On the green — <em>{feet} feet</em></div>
                <div className="putts">
                  <button className="putt lag" onClick={() => dispatch({ type: 'PUTT', sink: false })}>
                    <span className="putt-name">{gimmed ? 'Pick it up' : free === 1 ? 'Tap in' : `${free} putts`}</span>
                    <span className="putt-make">{scoreName(afterFree)}</span>
                    <span className="putt-sub">{gimmed ? 'inside the leather' : 'free'}</span>
                  </button>
                  {cost !== null && cost > 0 && (
                    <button className={`putt charge ${canSink ? '' : 'off'}`}
                      disabled={!canSink}
                      onClick={() => dispatch({ type: 'PUTT', sink: true })}>
                      <span className="putt-name">Hole it</span>
                      <span className="putt-make">{scoreName(afterSink)}</span>
                      <span className="putt-sub">{markered ? 'free \u00b7 lucky marker' : `${'\u25c6'.repeat(cost)} focus`}</span>
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
                  <div className="lbl">Technique <em>costs focus, not strokes</em></div>
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

              <div className="lbl">
                Your hand <em>reuse any of these as often as you like — the
                STROKE is what costs you, not the card</em>
              </div>
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
                <span>Check the bag — six new cards</span>
                <b>{redrawPrice(s) === 0 ? 'free' : '\u25c6'.repeat(redrawPrice(s))}</b>
              </button>

              <button className="big commit flowact" disabled={!pv || !!pv.blocked}
                onClick={() => dispatch({ type: 'COMMIT' })}>
                {pv?.blocked ? pv.blocked : pv ? 'Hit it' : 'Pick a shot'}
              </button>
            </>
          )}

          <div className="scorecard">
            {courseOf(s).holes.map((h, i) => {
              const sc = s.scores[i]
              const d = sc === undefined ? null : sc - h.par
              return (
                <div key={i} className={`sq ${i === s.hole.index && !holed ? 'now' : ''} ${
                  d === null ? '' : d < 0 ? 'good' : d > 0 ? 'bad' : 'level'}`}>
                  <span>{h.num}</span><b>{sc ?? '·'}</b>
                </div>
              )
            })}
          </div>
        </div>

        {/* Region D (MOBILE-PROPOSAL.md §2.1): on a phone the primary action
            lives in ONE fixed slot at the thumb, next to the focus it spends.
            Hidden on desktop; the in-flow .flowact buttons are hidden on
            mobile — same dispatches, one visible at a time. */}
        <div className="actionbar">
          <div className="ab-focus">
            <b>{'◆'.repeat(Math.max(0, s.focus - spent))}<i>{'◆'.repeat(spent)}</i>
              {'◇'.repeat(Math.max(0, maxFocus(MAX_FOCUS, boostsOf(s)) - s.focus))}</b>
            <span>focus</span>
          </div>
          {s.phase === 'shot' && (
            <button className="big" onClick={() => dispatch({ type: 'NEXT' })}>Next shot</button>
          )}
          {holed && (
            <button className="big" onClick={() => dispatch({ type: 'NEXT' })}>
              {s.scores.length === holeCount(s) ? 'Sign your card' : 'Next hole'}
            </button>
          )}
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
