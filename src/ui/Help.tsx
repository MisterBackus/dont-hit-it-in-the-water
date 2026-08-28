/**
 * HOW TO PLAY — the reference the intro cannot be.
 *
 * The intro is six rules read cold in thirty seconds, and it has to stay that
 * short. This is the other thing: what a player wants at hole four of event
 * two, when they have forgotten whether focus refills, or what the dashed red
 * line means, or why the cut moved. It is reachable from every screen and it
 * closes on Escape, because the one thing help must never do is trap you.
 *
 * EVERY NUMBER HERE IS IMPORTED. A help screen that quietly disagrees with the
 * game is worse than no help screen — it teaches a rule the player then loses
 * strokes to. Nothing below is typed as a literal if the game owns it.
 */
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { HAND_SIZE } from '../content/cards'
import { EVENT_COUNT } from '../content/season'
import { CUT_AFTER_HOLE, MAX_FOCUS } from '../sim/state'

interface Topic { readonly head: string; readonly body: ReactNode }

const TOPICS: readonly Topic[] = [
  {
    head: 'The cone is the whole truth',
    body: <>The shape on the picture is <b>every place the ball can finish</b> —
      not a guess, not an average. If the water is not inside it, you cannot find
      the water. If it is, you can. The solid band is where the ball can come
      down; the hatched tail is how far it can then run out.</>,
  },
  {
    head: 'Shots cost strokes, techniques cost focus',
    body: <>You draw <b>{HAND_SIZE} cards</b> at every tee and may reuse any of
      them as often as you like. A shot card is the swing and costs you a stroke.
      Techniques stack on top of it and are paid for in focus — they move the
      cone, tighten it, or widen it for distance.</>,
  },
  {
    head: 'Focus does not refill',
    body: <>It comes back a little between holes, up to <b>{MAX_FOCUS}</b>, and it
      comes back <b>faster after a good hole</b>. So a birdie pays twice. Running
      dry is not a soft failure — it means the rest of the round is played naked.</>,
  },
  {
    head: 'Par is free. Birdies are bought',
    body: <>Two putts from anywhere on the green is the default and it costs you
      nothing. Holing the first one costs focus, and the price goes up with the
      length of the putt. Every red number on your card was paid for.</>,
  },
  {
    head: 'Water is one stroke, out of bounds is two',
    body: <>Water costs a stroke and a drop. The dashed red line and the white
      stakes are out of bounds — two strokes, and the ball is gone. Everything
      else is a lie you can play from: fairway, rough, the deep stuff, sand, and
      the trees, each worse than the last.</>,
  },
  {
    head: `You play eight holes, the event is thirty-six`,
    body: <>The eight you play are the ones that decide it. The rest of your card
      is rolled at the pace you have been playing at, and so is every other
      player's — which is why the leaderboard keeps moving between your shots.</>,
  },
  {
    head: `The cut falls after hole ${CUT_AFTER_HOLE}`,
    body: <>Only the top of the board plays the weekend, and fewer survive it as
      the season goes on. Missing the cut is not the end of anything — it is a
      week you earned nothing, which is a different problem.</>,
  },
  {
    head: 'Between events, you go shopping',
    body: <>Prize money buys cards and equipment. Cards go in the bag and can be
      drawn; <b>equipment is always on</b> and never takes a slot. The three
      shelves are rack, special order and tour issue, and the deeper shelves are
      where the cone really tightens.</>,
  },
  {
    head: 'You get better. The field gets better faster',
    body: <>Your cones tighten all season as you pick up equipment — and the cut
      line tightens faster, and the names at the top of the money list start
      showing up in the spring. Standing still is falling behind.</>,
  },
  {
    head: `Keep your card, or the season ends`,
    body: <>There are money checks through the {EVENT_COUNT}-event year. Fall
      short of one and you lose your card and the season stops there. Clear them
      all and where you finish on the money list is the only thing anybody
      remembers.</>,
  },
]

export function HelpPanel({ close }: { close: () => void }) {
  // Escape closes it. Help that you cannot dismiss is a trap, not help.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  return (
    <div className="helpwrap" role="dialog" aria-modal="true" aria-label="How to play"
      onClick={close}>
      <div className="helppanel" onClick={e => e.stopPropagation()}>
        <div className="helphead">
          <h2>How to play</h2>
          <button className="ghost helpclose" onClick={close} aria-label="Close help">
            Close
          </button>
        </div>
        <ol className="helplist">
          {TOPICS.map(t => (
            <li key={t.head}>
              <b>{t.head}</b>
              <p>{t.body}</p>
            </li>
          ))}
        </ol>
        <p className="quietnote">
          The picture never lies about what decides a shot. If an edge is drawn,
          the ball is judged against exactly that edge.
        </p>
      </div>
    </div>
  )
}

/**
 * The always-there door. It sits above the sound switch on a desktop and just
 * clear of the thumb bar on a phone — the one screen furniture that must be
 * reachable from inside a hole, because that is where the question gets asked.
 */
export function HelpButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="helpbtn" onClick={() => setOpen(true)}
        aria-label="How to play">HOW TO PLAY</button>
      {open && <HelpPanel close={() => setOpen(false)} />}
    </>
  )
}
