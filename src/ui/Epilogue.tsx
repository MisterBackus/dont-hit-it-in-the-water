/**
 * THE EPILOGUE — the season in review (phase 'over').
 *
 * The old screen was a number and a restart button, which meant a player
 * could finish a whole season without noticing they had finished a whole
 * season. This one is the payoff: the card ceremony, the ladder the Money
 * List made you walk, the record against the four names that ate your
 * cheques all autumn, and the two doors out — post the season to the
 * clubhouse board, or copy it for the chat. Everything shown here derives
 * from state (seasonRecord is written at settle); nothing is rolled.
 *
 * THE DESIGN PASS, 26 Aug 2026. It had all the information and none of the
 * shape: five statistics in a flex row that ragged into three lines at 620px,
 * three bars that read as three more grey rows rather than as bars, and the
 * board affordance scattered across an input, a ghost button, a paragraph and
 * a link, each with its own margin. It is now four titled movements —
 * THE VERDICT, THE ACCOUNTING, THE SEASON, THE BOARD — and the bars are bars.
 */
import { useState } from 'react'
import type { Action } from '../sim/reducer'
import { grossEarnings, type GameState } from '../sim/state'
import { EVENT_COUNT, MONEY_CHECKS, money, moneyListRank } from '../content/season'
import { BOOST } from '../content/boosts'
import { ItemMark } from './ItemMark'
import { STARS } from '../content/players'
import { starNamesFor } from '../sim/resolve/field'
import { SAVE_VERSION } from '../platform/storage'
import { SHARE_ENDPOINT, SHARE_NOTE, postRun } from '../platform/share'
import { Eyebrow, Facts, Label, SeasonLadder, ShareRow } from './parts'
import { ordinal, plural } from './format'

/** Where the typed board name lives between seasons — a convenience, not a save. */
const NAME_KEY = 'dont-hit-it-in-the-water/name'

export function Epilogue({ s, dispatch, copyRun, copied, log }: {
  s: GameState
  dispatch: (a: Action) => void
  copyRun: () => void
  copied: boolean
  log: { seed: number; actions: Action[] }
}) {
  const [name, setName] = useState<string>(() => {
    try { return localStorage.getItem(NAME_KEY) ?? '' } catch { return '' }
  })
  // 'off' straight away when no endpoint is configured (platform/share.ts) —
  // the button greys rather than promising a post that cannot land
  const [share, setShare] = useState<'idle' | 'sending' | 'ok' | 'off' | 'fail'>(
    SHARE_ENDPOINT ? 'idle' : 'off')
  const post = () => {
    if (share === 'sending' || share === 'off') return
    setShare('sending')
    postRun({ version: SAVE_VERSION, seed: log.seed, actions: [...log.actions] }, name.trim())
      .then(r => setShare(r === 'ok' ? 'ok' : r))
  }
  const typeName = (v: string) => {
    setName(v)
    try { localStorage.setItem(NAME_KEY, v) } catch { /* private mode — fine */ }
  }

  const finished = s.event >= EVENT_COUNT && s.keptJob !== false
  const played = finished ? EVENT_COUNT : s.event
  const gross = grossEarnings(s)
  const rank = moneyListRank(gross, played)
  const failed = MONEY_CHECKS.find(c => c.after === s.event && s.keptJob === false)
  const grade = !finished ? null
    : rank === 1 ? 'You won the Money List. Nobody earned more.'
      : rank <= 5 ? 'Top five. You are exempt for two years.'
        : rank <= 15 ? 'A career year. Nothing to explain to anybody.'
          : rank <= 28 ? 'Card renewed, comfortably.'
            : 'You kept your card. Same time next year.'

  const wins = s.seasonRecord.filter(r => r.place === 1).length
  // the record against the run's stars, event by event, from settle's ledger
  const vsStars = starNamesFor(s.seed).map(n => ({
    name: n,
    blurb: STARS.find(st => st.name === n)?.blurb ?? '',
    ahead: s.seasonRecord.filter(r => r.aheadOf.includes(n)).length,
    behind: s.seasonRecord.filter(r => r.behind.includes(n)).length,
  }))

  return (
    <div className="shell intro epilogue">
      <Eyebrow>
        {finished ? 'Season complete · fourteen events, start to finish'
          : `Your season ended at event ${s.event}`}
      </Eyebrow>
      <h1 className={finished ? 'good' : 'bad'}>
        {finished ? 'You kept the card' : 'You lost the card'}
      </h1>
      <p className="tagline">
        {money(gross)} won · {ordinal(rank)} on the Money List
        {finished ? `. ${grade}` : ' when it ended.'}
      </p>

      {/* THE CARD CEREMONY — the quiet line, or the honest one. */}
      <p className="ceremony">
        {finished
          ? 'In the scorer’s trailer they slide next year’s card across the desk without a word — the word would have ruined it. Same locker in the spring.'
          : 'Nobody takes the card off you at a podium. An envelope, a handshake, a parking lot. Back to Qualifying — everyone goes back eventually, and now you know exactly what staying costs.'}
      </p>

      {/* THE ACCOUNTING. "Not close enough" told you nothing you could act on. */}
      <Label>The accounting</Label>
      <Facts wide items={[
        { v: String(s.seasonRecord.length), k: 'events played' },
        { v: String(wins), k: wins === 1 ? 'win' : 'wins', tone: wins > 0 ? 'gold' : undefined },
        { v: `${s.cutsMade}/${s.cutsMade + s.cutsMissed}`, k: 'cuts made' },
        { v: money(s.spent), k: 'spent in the shop' },
        { v: String(s.skipped), k: 'weeks sat out' },
      ]} />
      {failed && (
        <p className="quietnote">
          You needed {money(failed.need)} by event {failed.after} and won {money(gross)}
          {' '}— {money(failed.need - gross)} short.
          {s.cutsMissed > 0 && ` You missed ${plural(s.cutsMissed, 'cut')}.`}
          {s.skipped > 0 && ` You sat out ${plural(s.skipped, 'week')}.`}
        </p>
      )}

      {/* THE LADDER WALKED — the season's gross against the three bars. */}
      <Label note="the three bars, and what you had when you reached them">
        The Money List
      </Label>
      <div className="checkbars">
        {MONEY_CHECKS.map(c => {
          const isTheFailure = failed && failed.after === c.after
          const cleared = !isTheFailure && (finished || s.event >= c.after)
          const pct = Math.max(0, Math.min(1, gross / c.need))
          return (
            <div key={c.after}
              className={`checkbar ${isTheFailure ? 'is-no' : cleared ? 'is-ok' : 'is-na'}`}>
              <span className="cb-fill" style={{ width: `${(pct * 100).toFixed(1)}%` }} />
              <span className="cb-label">{money(c.need)}<i> after event {c.after}</i></span>
              <span className="cb-verdict">
                {isTheFailure ? `${money(c.need - gross)} short — the season ended here`
                  : cleared ? 'cleared' : 'never faced'}
              </span>
            </div>
          )
        })}
      </div>

      {/* THE RECORD AGAINST THE STARS — settle keeps score every week. */}
      {s.seasonRecord.length > 0 && vsStars.length > 0 && (
        <>
          <Label note="weeks you finished ahead of them, and weeks they finished ahead of you">
            Your record against the stars
          </Label>
          <div className="starrows">
            {vsStars.map(v => (
              <div key={v.name} className="starrow" title={v.blurb}>
                <b><span className="lbstar">★</span>{v.name}</b>
                <span className="rec">
                  <i className="w">{v.ahead}</i><em>ahead</em>
                  <i className="l">{v.behind}</i><em>behind</em>
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <Label>The season</Label>
      <SeasonLadder seed={s.seed} event={s.event} big />

      {s.boosts.length > 0 && (
        <>
          <Label>What you were carrying</Label>
          <div className="deckpanel">
            {s.boosts.map(id => (
              <span key={id} className="chip boost" title={BOOST[id]!.blurb}>
                <ItemMark id={id} size={15} framed /> {BOOST[id]!.name}
              </span>
            ))}
          </div>
        </>
      )}

      {/* THE CLUBHOUSE BOARD — nothing is ever sent silently (share.ts):
          the consent note sits beside the button, and the button greys
          when no board inbox is configured rather than pretending. */}
      <section className="boardblock">
        <Label note="one paste carries every season this browser has played">
          The clubhouse board
        </Label>
        <div className="sharerow">
          <input className="namefield" maxLength={24} placeholder="Name for the board"
            value={name} onChange={e => typeName(e.target.value)}
            aria-label="Name for the clubhouse board" />
          <button className="ghost postbtn"
            disabled={share === 'off' || share === 'sending' || name.trim() === ''}
            onClick={post}>
            {share === 'ok' ? 'Posted — it’s on the board'
              : share === 'sending' ? 'Posting…'
                : share === 'fail' ? 'It didn’t go — try again'
                  : share === 'off' ? 'Post to the board'
                    : 'Post this season to the board'}
          </button>
        </div>
        <p className="quietnote sharenote">
          {SHARE_NOTE}
          {share === 'off' && ' The board inbox isn’t connected in this build — copy the run below instead.'}
        </p>
        <ShareRow copyRun={copyRun} copied={copied} label="Copy this season for the board" />
      </section>

      <button className="big" onClick={() => dispatch({ type: 'RESTART', seed: (Date.now() % 100000) + 7 })}>
        New season
      </button>
    </div>
  )
}
