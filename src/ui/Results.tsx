/**
 * THE VERDICT SCREENS — the cut, the payout, the Money List check, and the
 * person waiting on the walk to the fifth tee.
 *
 * WHAT WAS WRONG. Two of these were three lines of prose and a button. The
 * PAYOUT buried the cheque — the number the whole week was for — in the middle
 * of a subordinate clause. The MONEY LIST check, the most consequential screen
 * in the game, was a headline, a sentence and a button: no bar, no ladder, no
 * sense of a season having led here. The ENCOUNTER dressed its offer and its
 * decline identically, so the safe door and the gamble looked the same.
 *
 * All three keep their voice — the tie-split prose especially, which is the
 * best writing on any screen — but the numbers come out of the sentences and
 * are set as numbers.
 */
import type { Action } from '../sim/reducer'
import {
  CUT_AFTER_HOLE, currentEvent, grossEarnings, holeCount, parThrough, toPar, type GameState,
} from '../sim/state'
import { EVENT_COUNT, checkAfter, money, moneyListRank } from '../content/season'
import { ENCOUNTER } from '../content/encounters'
import { FULL_HOLES, standings, type Standing } from '../sim/resolve/field'
import { Leaderboard } from './Leaderboard'
import { Eyebrow, Facts, Label, MoneyList, SeasonLadder } from './parts'
import { ordinal, relStr, waysWord } from './format'

/* ------------------------------------------------------------------- cut */

export function CutScreen({ s, dispatch, board }: {
  s: GameState; dispatch: (a: Action) => void; board: readonly Standing[]
}) {
  const front = s.scores.slice(0, CUT_AFTER_HOLE).reduce((a, b) => a + b, 0)
    - parThrough(s, CUT_AFTER_HOLE)
  const ev = currentEvent(s)
  return (
    <div className="shell intro">
      <Eyebrow>{ev.name} · after {CUT_AFTER_HOLE} holes</Eyebrow>
      <h1 className={s.madeCut ? 'good' : 'bad'}>{s.madeCut ? 'Made the cut' : 'Missed the cut'}</h1>
      <Facts items={[
        { v: relStr(front), k: `through ${CUT_AFTER_HOLE}`, tone: front < 0 ? 'good' : undefined },
        ...(s.cutLine !== null
          ? [{ v: relStr(s.cutLine), k: 'the cut line' } as const] : []),
        ...(s.cutAdvanced !== null
          ? [{ v: String(s.cutAdvanced), k: 'played on' } as const] : []),
      ]} />
      <p className="tagline">
        Top {ev.advance} and ties played on
        {s.cutLine !== null && <> — it took {relStr(s.cutLine)} or better</>}.
      </p>
      <button className="big" onClick={() => dispatch({ type: 'NEXT' })}>
        {s.madeCut ? (ev.major ? 'Pick up your prize' : 'Play the weekend') : 'Pack up'}
      </button>
      <Leaderboard rows={board} window={6} thruTotal={holeCount(s)} />
    </div>
  )
}

/* ---------------------------------------------------------------- payout */

/**
 * THE WEEK, SHOWN. Your 36-hole number used to arrive from nowhere: eight of
 * its holes are yours and twenty-eight are rolled at settle (FIELD-SPREAD §8),
 * fitted to the pace your eight set. A total the player cannot trace is the one
 * thing P8 exists to forbid — the cone's whole promise is that every disaster
 * is traceable to something you saw — so the arithmetic goes on the screen, and
 * the last line NAMES THE LUCK: whether the week you did not play ran hot or
 * cold against the pace you did. Variance you can read is a golf story ("I had
 * a bad Saturday"); variance you cannot read is a slot machine.
 */
function WeekBreakdown({ rel, rel36, played }: {
  rel: number; rel36: number; played: number
}) {
  const rest = FULL_HOLES - played
  if (rest <= 0) return null
  const remainder = rel36 - rel
  // the same fit the sim used: the expected remainder IS your pace over the rest
  const expected = (rel / Math.max(1, played)) * rest
  const delta = remainder - expected
  const n = Math.abs(Math.round(delta))
  const story = delta <= -1.5
    ? `The rest of the week ran ${n} better than the pace you set.`
    : delta >= 1.5
      ? `The rest of the week gave ${n} back on the pace you set.`
      : 'The rest of the week held the pace you set.'
  return (
    <div className="weekscore">
      <div className="ws-line">
        <span>the {played} you played</span><b>{relStr(rel)}</b>
      </div>
      <div className="ws-line">
        <span>the other {rest}</span><b>{relStr(remainder)}</b>
      </div>
      <div className="ws-line is-total">
        <span>36 holes</span><b>{relStr(rel36)}</b>
      </div>
      <p className="ws-note">{story}</p>
    </div>
  )
}

export function PayoutScreen({ s, dispatch }: { s: GameState; dispatch: (a: Action) => void }) {
  const rel = toPar(s)
  const made = s.madeCut !== false
  // THE FULL SCORECARD (FIELD-SPREAD.md §8): settle finished the week — the
  // field's totals are 36-hole numbers now, and finalRel is yours (played 8
  // plus the rolled remainder). The final board lives in that space; the
  // tagline says so, or the totals read inflated.
  const rel36 = s.finalRel ?? rel
  const finalBoard = standings(s.field, rel36, FULL_HOLES, !made)
  // the event just settled is the last line of the season record — the tie
  // count lives there. Every tied group splits its cheque now (the full
  // real-tour rule), so any tied finish gets the line.
  const rec = s.seasonRecord[s.seasonRecord.length - 1]
  const tied = made && rec && rec.event === s.event ? rec.tied : 1
  const splitWin = made && s.lastPlace === 1 && tied > 1
  const splitPlace = made && s.lastPlace > 1 && tied > 1
  const way = waysWord(tied)

  return (
    <div className="shell intro">
      <Eyebrow>{currentEvent(s).name} · the week is settled</Eyebrow>
      <h1 className={`small ${made ? 'good' : 'bad'}`}>
        {made
          ? splitWin ? 'Tied 1st'
            : splitPlace ? `Tied ${ordinal(s.lastPlace)}`
              : `${ordinal(s.lastPlace)} place`
          : 'Missed the cut'}
      </h1>

      {/* THE CHEQUE. It used to live inside a subordinate clause. */}
      <div className={`cheque ${made && s.lastPaid > 0 ? '' : 'is-nil'}`}>
        <b>{made ? money(s.lastPaid) : 'No cheque'}</b>
        <span>this week</span>
      </div>

      {/* An ordinary finish says nothing here: the breakdown below now shows
          the same arithmetic properly. The tie prose stays — it is explaining
          a rule, not restating a number. */}
      {(!made || splitWin || splitPlace) && (
        <p className="tagline">
          {!made
            ? `${relStr(rel)} through ${s.scores.length}. Missed cuts do not pay.`
            : splitWin
              ? `A ${way}-way tie at the top. It still counts as a win; the cheque splits ${way} ways, and ${money(s.lastPaid)} of it is yours.`
              : `A ${way}-way tie. The cheque pools the ${way} places it covers and splits; ${money(s.lastPaid)} of it is yours.`}
        </p>
      )}

      {made && <WeekBreakdown rel={rel} rel36={rel36} played={s.scores.length} />}

      <Facts items={[
        { v: money(grossEarnings(s)), k: 'season earnings' },
        { v: `${s.event}/${EVENT_COUNT}`, k: 'events played' },
        // a missed cut has no 36-hole number — it has the four holes you played
        made
          ? { v: relStr(rel36), k: '36-hole total', tone: rel36 < 0 ? 'good' : undefined }
          : { v: relStr(rel), k: `through ${s.scores.length}` },
      ]} />

      <button className="big" onClick={() => dispatch({ type: 'NEXT' })}>
        {s.event >= EVENT_COUNT ? 'How the year went' : made ? 'To the bag' : 'On to the next one'}
      </button>
      <Leaderboard rows={finalBoard} window={8} thruTotal={FULL_HOLES}
        title="Final leaderboard · 36 holes" />
    </div>
  )
}

/* ------------------------------------------------------------ money check */

export function MoneyCheckScreen({ s, dispatch }: { s: GameState; dispatch: (a: Action) => void }) {
  const check = checkAfter(s.event)!
  const gross = grossEarnings(s)
  const rank = moneyListRank(gross, check.after)
  return (
    <div className="shell intro">
      <Eyebrow>The Money List · after event {check.after}</Eyebrow>
      <h1 className={`small ${s.keptJob ? 'good' : 'bad'}`}>
        {s.keptJob ? 'You keep your card' : 'You lose your card'}
      </h1>
      <p className="tagline">
        {s.keptJob
          ? `${money(gross)} won against the ${money(check.need)} this bar asked for. ${ordinal(rank)} on the list, and the season goes on.`
          : `${money(gross)} won against the ${money(check.need)} this bar asked for — ${money(check.need - gross)} short, with nothing left to play.`}
      </p>
      {/* the bar itself, and the season that walked into it */}
      <MoneyList earned={gross} event={check.after} rank={rank} />
      <Label>The season to here</Label>
      <SeasonLadder seed={s.seed} event={s.event} caption />
      <button className="big" onClick={() => dispatch({ type: 'NEXT' })}>
        {s.keptJob ? (s.event >= EVENT_COUNT ? 'Sign the card' : 'Keep going') : 'See the season'}
      </button>
    </div>
  )
}

/* ------------------------------------------------------------- encounter */

/* Somebody on the walk to the fifth tee (content/encounters.ts). Two buttons,
   and only two: theirs, and WALK ON — which is always safe, always available,
   and never explained further. Where the offer is a gamble the odds are in the
   small text, said plainly (P8 extends to people). Same room shape as the week
   cards, on purpose: this is the same kind of decision, just wearing a bib or
   a windbreaker. What is new is that the two doors no longer look identical —
   the offer carries the accent edge and its stakes; walking on is quiet. */
export function EncounterScreen({ s, dispatch }: { s: GameState; dispatch: (a: Action) => void }) {
  const enc = ENCOUNTER[s.encounterOffer ?? '']
  if (!enc) {
    // an offer the content no longer knows must still have a door out —
    // "when the reducer gains a phase, the UI must gain a room", and a room
    // must never lose its exit
    return (
      <div className="shell intro">
        <Eyebrow>{currentEvent(s).name} · the cut is made</Eyebrow>
        <h1 className="small">Nobody there</h1>
        <p className="tagline">Whoever it was, they have gone.</p>
        <button className="big" onClick={() => dispatch({ type: 'WALK_ON' })}>Walk on</button>
      </div>
    )
  }
  return (
    <div className="shell intro">
      <Eyebrow>{currentEvent(s).name} · the cut is made</Eyebrow>
      <span className="enc-icon">{enc.icon}</span>
      <h1 className="small">{enc.name}</h1>
      <p className="tagline">{enc.blurb}</p>
      <Label note="one of them costs you nothing">Two doors</Label>
      <div className="weeks enc-choices">
        <button className="weekcard enc-take" onClick={() => dispatch({ type: 'ENGAGE' })}>
          <span className="week-top"><span className="week-name">{enc.accept}</span></span>
          <span className="week-blurb">{enc.stakes}</span>
        </button>
        <button className="weekcard enc-walk" onClick={() => dispatch({ type: 'WALK_ON' })}>
          <span className="week-top"><span className="week-name">Walk on</span></span>
          <span className="week-cost">{enc.walk}</span>
        </button>
      </div>
    </div>
  )
}
