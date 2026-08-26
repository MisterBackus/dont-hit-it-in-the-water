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
import { useMemo, useReducer, useRef, useState } from 'react'
import { reduce, type Action } from '../sim/reducer'
import { initialState, toPar, type GameState } from '../sim/state'
import { standings } from '../sim/resolve/field'
import { SAVE_VERSION, archiveRun, loadArchive, loadSave, persistSave } from '../platform/storage'
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

  switch (s.phase) {
    case 'intro':
      return <Intro dispatch={dispatch} />
    case 'schedule':
      return <Schedule s={s} dispatch={dispatch} copyRun={copyRun} copied={copied} />
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
      return <Play s={s} dispatch={dispatch} copyRun={copyRun} copied={copied} />
  }
}
