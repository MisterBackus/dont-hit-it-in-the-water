/**
 * THE SCHEDULE — the week before the week.
 *
 * WHAT WAS WRONG. The screen had grown five features and kept adding them to
 * the bottom, so the reading order had become: what the event is, the primary
 * action, a share button, the argument for NOT playing, the week cards, and
 * then — below the button that skips past all of it — the irreversible
 * confirm. The Money List demand, which is the one number the season is about,
 * was a 12px mono run-on sharing its line with your rank and how many weeks
 * you had sat out.
 *
 * WHAT IT IS NOW. One reading order, top to bottom, and it is the order the
 * decision is actually made in:
 *
 *   where you are  →  what this event pays  →  what the list demands  →
 *   the alternative to playing it  →  tee off
 *
 * The primary action moved to the END, after the choice it forecloses. The
 * Money List got a panel and a bar. The season ladder now draws the three bars
 * on itself, so the calendar and the demand are one picture.
 */
import type { Action } from '../sim/reducer'
import { deckList, courseOf, currentEvent, grossEarnings, holeCount, type GameState } from '../sim/state'
import { EVENT_COUNT, money, moneyListRank } from '../content/season'
import { WEEK, LESSON_FEE, EVENT_YIELDS, STAGE_YIELD, eventStage } from '../content/weeks'
import { DeckPanel } from './Cards'
import { ItemMark } from './ItemMark'
import { BOOST } from '../content/boosts'
import {
  Badge, Explain, Eyebrow, Facts, Label, MoneyList, QuitSeason, SeasonLadder, ShareRow,
} from './parts'
import { countWord, ordinal, plural } from './format'

export function Schedule({ s, dispatch, copyRun, copied, log }: {
  s: GameState
  dispatch: (a: Action) => void
  copyRun(): void
  copied: boolean
  log: { seed: number; actions: readonly Action[] }
}) {
  const ev = currentEvent(s)
  const gross = grossEarnings(s)
  // THE FINALE knows it is the finale. By construction the Money List is done
  // by now (last check after 12) — if a bar ever did still stand, the
  // MoneyList panel prints the demand — so the framing here is about the only
  // thing event 14 can still decide: the title.
  const finale = s.event === EVENT_COUNT
  const rank = moneyListRank(gross, Math.max(1, s.event - 1))
  const cones = (ev.sharpness * s.practice)

  return (
    <div className="shell intro">
      <Eyebrow>
        {finale ? `The season finale · event ${EVENT_COUNT} of ${EVENT_COUNT}`
          : `Event ${s.event} of ${EVENT_COUNT}`}
      </Eyebrow>
      <h1 className={`small ${ev.major ? 'major' : ''}`}>
        {ev.name}{ev.major && <Badge tone="gold">major</Badge>}
      </h1>
      <p className="tagline">
        {finale
          ? `The last one. A major, at ${courseOf(s).label} — thirteen weeks got you here, and this is the week they were for.`
          : ev.major
            ? `A major, at ${courseOf(s).label}. Survive the cut and you pick up equipment.`
            : `${countWord(holeCount(s))} holes at ${courseOf(s).label}. Top ${ev.advance} and ties play the weekend.`}
      </p>
      <Facts items={[
        { v: money(ev.purse), k: 'purse' },
        { v: `top ${ev.advance}`, k: 'make the cut' },
        {
          v: `×${cones.toFixed(2)}`,
          k: s.practice < 1 ? 'your cones · practised' : 'your cones',
          tone: s.practice < 1 ? 'accent' : undefined,
        },
      ]} />

      <MoneyList earned={gross} event={s.event} rank={rank} />
      {finale && (
        <p className="weeknote finalenote">
          {rank === 1
            ? 'You arrive first on the Money List. Nothing left can end this season — the only question is whether anybody catches you.'
            : rank <= 5
              ? `You arrive ${ordinal(rank)} on the list, playing for the title — and the top five leave with a two-year exemption.`
              : `You arrive ${ordinal(rank)} on the list. One more cheque decides what kind of year this was.`}
        </p>
      )}

      <Label note={<>fourteen events, and the three bars the list checks you at</>}>
        The season
      </Label>
      <SeasonLadder seed={s.seed} event={s.event} caption />
      {s.skipped > 0 && (
        <p className="quietnote">{plural(s.skipped, 'week')} sat out so far.</p>
      )}

      {/* THE WEEK NODE — silent at majors and from event 10 (offerWeek), and
          it says why: a system that measured as good-deals-nobody-can-see
          (WEEKS-VERDICT.md) now prints the trade instead of hiding it. */}
      {s.weekOptions.length === 0 && s.event > 1 && (
        <p className="quietnote">
          {ev.major
            ? 'No withdrawing this week. Nobody sits out a major.'
            : `No off-week offers this late — an event out here typically adds
               about ${money(STAGE_YIELD.late)}, and nothing a week off buys is worth that.`}
        </p>
      )}

      {s.weekOptions.length > 0 && (
        <section className="weeknode">
          <Label note={<>no prize money, and the Money List does not wait</>}>
            Or take the week off
          </Label>
          <p className="weeknote">
            {eventStage(s.event) === 'early'
              ? <>An event out here typically adds about {money(EVENT_YIELDS[s.event - 1]!)}
                {' '}to a season; by the fall, nearer {money(STAGE_YIELD.late)}. A week
                spent on your game is cheapest right now — and what it buys compounds
                through every event left.</>
              : <>An event out here typically adds about {money(EVENT_YIELDS[s.event - 1]!)},
                and the number keeps climbing. The cheap weeks to sit out are gone.</>}
          </p>
          <div className="weeks">
            {s.weekOptions.map(id => {
              const w = WEEK[id]!
              const broke = id === 'lesson' && s.earnings < LESSON_FEE
              const picked = s.pendingWeek === id
              // Danger-red is reserved for withdrawals that MEASURE dangerous
              // (WEEKS-VERDICT.md option A): the sponsor always, and any skip
              // from the mid season on. An early practice week is a purchase,
              // not a mistake, and its confirm no longer dresses like one.
              const risky = w.effect.kind === 'sponsor' || ev.major
                || eventStage(s.event) !== 'early'
              return (
                <button key={id}
                  className={`weekcard ${broke ? 'off' : ''} ${picked ? 'picked' : ''} ${risky ? 'risk' : ''}`}
                  disabled={broke}
                  aria-pressed={picked}
                  onClick={() => dispatch({ type: 'PICK_WEEK', id: picked ? null : id })}>
                  <span className="week-top">
                    <span className="week-icon">{w.icon}</span>
                    <span className="week-name">{w.name}</span>
                    {picked && <span className="week-armed">armed</span>}
                  </span>
                  <span className="week-blurb">{w.blurb}</span>
                  <span className="week-cost">{broke ? `You cannot afford it — ${money(LESSON_FEE)}` : w.cost}</span>
                </button>
              )
            })}
          </div>

          {/* CONFIRM. These are the most irreversible buttons in the game and
              they used to fire on a single click, sitting next to Tee off. */}
          {s.pendingWeek && (() => {
            const w = WEEK[s.pendingWeek]!
            const risky = w.effect.kind === 'sponsor' || ev.major
              || eventStage(s.event) !== 'early'
            return (
              <div className={`confirm ${risky ? 'is-risk' : 'calm'}`}>
                <div className="confirm-q">
                  Withdraw from {ev.name} to {w.name.toLowerCase()}?
                </div>
                <div className="confirm-why">
                  {w.cost} You will not play this week, and event {s.event} still
                  counts against the Money List.
                </div>
                <div className="confirm-row">
                  <button className={risky ? 'big danger' : 'big'}
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
        </section>
      )}

      {/* The primary action comes AFTER the alternative it forecloses. */}
      <button className="big teeoff" onClick={() => dispatch({ type: 'NEXT' })}>
        Tee off
      </button>

      <footer className="screenfoot">
        <Label note={`· ${deckList(s).length} cards`}>In the bag</Label>
        <DeckPanel ids={deckList(s)} />
        {/* Equipment was absent from this screen entirely, which is where you
            stand when an encounter has just handed you something and you want
            to know what it does (PLAYTEST-NOTES-1 note 7). */}
        {s.boosts.length > 0 && (
          <>
            <Label note="always on">Carrying</Label>
            <div className="deckpanel">
              {s.boosts.map(id => (
                <span key={id} className="chip boost">
                  <ItemMark id={id} size={15} framed /> {BOOST[id]!.name}
                  <Explain label={`What ${BOOST[id]!.name} does`}>{BOOST[id]!.blurb}</Explain>
                </span>
              ))}
            </div>
          </>
        )}
        <ShareRow copyRun={copyRun} copied={copied} />
        <QuitSeason dispatch={dispatch} log={log} />
      </footer>
    </div>
  )
}
