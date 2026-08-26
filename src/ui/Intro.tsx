/**
 * THE INTRO — the rules, and the only screen a player reads cold.
 *
 * It was one <ul> of six long bullets in a single grey column: six paragraphs
 * of equal weight, which is the same as no weight. The six rules are all still
 * here (nothing is buried), but each now leads with two or three words set in
 * the display face, so the column can be SCANNED in five seconds (P3) and read
 * in thirty. The numbers down the left give the set a rhythm and tell you how
 * much is left.
 */
import type { ReactNode } from 'react'
import type { Action } from '../sim/reducer'
import { HAND_SIZE } from '../content/cards'

interface Rule { readonly head: string; readonly body: ReactNode }

const RULES: readonly Rule[] = [
  {
    head: 'A hand at every tee',
    body: <>You draw <b>{HAND_SIZE} cards</b> and play the hole with them — reuse any as
      often as you like. Shots cost a stroke; techniques cost focus.</>,
  },
  {
    head: 'The cone never lies',
    body: <>It is every place the ball can finish. If the water isn't inside it,
      you cannot find the water.</>,
  },
  {
    head: 'Par is free',
    body: <>A birdie is something you <b>buy</b>, with focus, on the green.</>,
  },
  {
    head: 'You get better',
    body: <>You start the season a worse golfer than you will end it — your cones
      tighten as you pick up equipment. The cut line tightens faster.</>,
  },
  {
    head: 'Four holes, then the cut',
    body: <>Only the top of the board plays on, and the number who do shrinks
      all season.</>,
  },
  {
    head: 'The Money List can end you',
    body: <>Miss it after event 5, 9 or 12 and you lose your job. Events 13 and 14
      cannot end you — they decide how well you finish.</>,
  },
]

export function Intro({ dispatch }: { dispatch: (a: Action) => void }) {
  return (
    <div className="shell intro introscreen">
      <div className="wordmark">
        <h1>Don't Hit It<br />In The Water</h1>
        <p className="tagline">Fourteen events. One job to keep.</p>
      </div>
      <ol className="rules">
        {RULES.map((r, i) => (
          <li key={i}>
            <span className="rule-n">{i + 1}</span>
            <span className="rule-t">
              <b>{r.head}</b>
              <span>{r.body}</span>
            </span>
          </li>
        ))}
      </ol>
      <button className="big" onClick={() => dispatch({ type: 'START' })}>
        Start the season
      </button>
    </div>
  )
}
