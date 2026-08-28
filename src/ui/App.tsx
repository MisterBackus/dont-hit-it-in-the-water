/**
 * THE APP — boot, the save log, and the door to each room.
 *
 * This file used to be 1,091 lines holding every screen in the game, which is
 * why the screens had stopped resembling each other: nothing shared a part,
 * because sharing a part inside one enormous function looks like more mess
 * rather than less. Each phase is now its own file under src/ui/, and the
 * furniture they have in common lives in parts.tsx. What is left here is the
 * three things that are genuinely about the whole app: replaying the save,
 * appending every dispatch to the log, and routing a phase to a room.
 *
 * The rule that has always governed this router still governs it: WHEN THE
 * REDUCER GAINS A PHASE, THE UI MUST GAIN A ROOM. A phase with no room is a
 * softlock that no test can see.
 */
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { reduce, type Action } from '../sim/reducer'
import { initialState, toPar, type GameState } from '../sim/state'
import { standings } from '../sim/resolve/field'
import { SAVE_VERSION, archiveRun, loadArchive, loadSave, persistSave } from '../platform/storage'
import { newRunId, reportRun } from '../platform/share'
import { useGameAudio } from './sound'
import { Intro } from './Intro'
import { Schedule } from './Schedule'
import { Shop, RemoveScreen, PrizeScreen } from './Shop'
import { CutScreen, PayoutScreen, MoneyCheckScreen, EncounterScreen } from './Results'
import { Epilogue } from './Epilogue'
import { Play } from './Play'

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

export function App() {
  const boot = useMemo(bootstrap, [])
  // runId is minted per run and travels on REPORTS only, never in the action
  // log — replay is untouched by it. See newRunId in platform/share.
  const logRef = useRef({ seed: boot.seed, actions: boot.actions, runId: newRunId() })
  const [s, rawDispatch] = useReducer(
    (st: GameState, a: Action) => reduce(st, a),
    boot.state,
  )
  /**
   * Every dispatch is also a save: append to the log and write it out.
   * RESTART rebuilds from its own seed, so the history before it is dead
   * weight and the log starts over at that action.
   *
   * A RESTART carries `keep`, and it is the difference between finishing a
   * season and abandoning one. Finishing archives the run, because that is a
   * season somebody might post. Quitting does NOT — the owner's ruling, and
   * it is the right one: "i dont see anyone sharing a shitty run." Keeping
   * abandoned runs was collection nobody would ever read, and quit should
   * mean quit.
   */
  const dispatch = (a: Action) => {
    rawDispatch(a)
    const log = logRef.current
    if (a.type === 'RESTART') {
      if (a.keep !== false) archiveRun(log.seed, log.actions)
      log.seed = a.seed; log.actions = [a]; log.runId = newRunId()
    }
    else log.actions.push(a)
    persistSave(log.seed, log.actions)
  }
  useGameAudio(s)

  /**
   * THE TWO AUTOMATIC REPORTS (platform/share.ts) — anonymous, never ranked,
   * and the only reason the instruments can answer "where does the game lose
   * somebody". Both are deduped by reportRun, so a season is sent once.
   *
   * 1. The season ended. The finale screen's Share button is the BOARD, which
   *    is named and opt-in and stays that way; this is the instrument copy,
   *    and it fires whether or not anybody presses anything.
   */
  useEffect(() => {
    if (s.phase !== 'over') return
    const log = logRef.current
    reportRun({ version: SAVE_VERSION, seed: log.seed, actions: [...log.actions] },
      'finished', log.runId)
  }, [s.phase])

  /**
   * 2. The tab went away. This is the one that matters: nobody who bounces
   *    three minutes in clicks "Give up the season", they close the window,
   *    and until now that player left no trace at all. pagehide is the event
   *    that actually fires on close (and on iOS, where unload does not), and
   *    sendBeacon is what survives it. visibilitychange covers backgrounding
   *    on mobile, where a hidden tab is often never resumed.
   */
  useEffect(() => {
    const send = () => {
      const log = logRef.current
      reportRun({ version: SAVE_VERSION, seed: log.seed, actions: [...log.actions] },
        'left', log.runId)
    }
    const onHide = () => { if (document.visibilityState === 'hidden') send() }
    window.addEventListener('pagehide', send)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      window.removeEventListener('pagehide', send)
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [])

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

  switch (s.phase) {
    case 'intro':
      return <Intro dispatch={dispatch} />
    case 'schedule':
      return <Schedule s={s} dispatch={dispatch} copyRun={copyRun} copied={copied}
        log={logRef.current} />
    case 'payout':
      return <PayoutScreen s={s} dispatch={dispatch} />
    case 'moneylist':
      return <MoneyCheckScreen s={s} dispatch={dispatch} />
    case 'shop':
      return <Shop s={s} dispatch={dispatch} />
    case 'remove':
      return <RemoveScreen s={s} dispatch={dispatch} />
    case 'cut':
      return <CutScreen s={s} dispatch={dispatch}
        board={standings(s.field, toPar(s), s.scores.length, s.madeCut === false)} />
    case 'boost':
      return <PrizeScreen s={s} dispatch={dispatch} />
    case 'encounter':
      return <EncounterScreen s={s} dispatch={dispatch} />
    case 'over':
      return <Epilogue s={s} dispatch={dispatch} copyRun={copyRun} copied={copied}
        log={logRef.current} />
    default:
      // 'playing', 'shot', 'holed' — the hole itself
      return <Play s={s} dispatch={dispatch} copyRun={copyRun} copied={copied}
        log={logRef.current} />
  }
}
