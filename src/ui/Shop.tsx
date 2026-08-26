/**
 * THE PRO SHOP, THE FITTING ROOM, AND THE MAJOR'S PRIZE.
 *
 * WHAT WAS WRONG WITH THE SHOP. Three things it had grown this week were all
 * being said in body copy and none of them read:
 *
 *  - the season allowance was a sentence with six glyphs in the middle of it;
 *  - the three rarity tiers were a 10px caps line and a 3px left border, which
 *    is not enough for TOUR ISSUE to feel like the truck came;
 *  - and "you can't have this" had exactly one appearance — opacity 0.4 —
 *    whether the reason was that you are broke, or that your six changes are
 *    gone. Two different facts wearing the same grey.
 *
 * Now: the allowance is a row of actual pips, the tier is a stamped badge that
 * colours the whole card's top edge, and an unaffordable card SAYS how short
 * you are while an out-of-allowance one says the bag is set. The information
 * was always derivable; none of it was ever printed.
 */
import type { Action } from '../sim/reducer'
import { deckList, currentEvent, grossEarnings, type GameState } from '../sim/state'
import { money, MONEY_CHECKS } from '../content/season'
import { CARD } from '../content/cards'
import { BOOST } from '../content/boosts'
import { CUT_PRICE, REROLL_PRICE, SHOP_BUDGET, TIER_LABEL, tierOf } from '../content/shop'
import { DeckPanel } from './Cards'
import { Badge, Eyebrow, Label } from './parts'

/* ------------------------------------------------------------------- shop */

export function Shop({ s, dispatch }: { s: GameState; dispatch: (a: Action) => void }) {
  // undefined past event 12 — see the schedule screen's note on the same line
  const next = MONEY_CHECKS.find(c => c.after >= s.event)
  const short = next ? next.need - grossEarnings(s) : 0

  return (
    <div className="shell intro">
      <Eyebrow>The pro shop · after {currentEvent(s).name}</Eyebrow>
      <div className="wallet">
        <b>{money(s.earnings)}</b>
        <span>in the wallet</span>
      </div>
      <p className="tagline">
        The Money List counts what you win, not what you keep — spending here cannot touch it.
        {!next
          ? ' The list is closed for the year. Whatever you buy now, you keep the card either way.'
          : short > 0
            ? ` You have earned ${money(grossEarnings(s))} of the ${money(next.need)} event ${next.after} demands.`
            : ` You are clear of event ${next.after}'s line — the rest is investment.`}
      </p>

      {/* THE SEASON ALLOWANCE (SHOP-SUPPLY.md): six equipment changes a
          year, cards exempt. Filled pips are what is left. */}
      <div className={`allowance ${s.buysLeft === 0 ? 'is-spent' : ''}`}>
        <span className="allow-pips" aria-hidden="true">
          {Array.from({ length: SHOP_BUDGET }, (_, i) => (
            <i key={i} className={i < s.buysLeft ? 'pip' : 'pip gone'} />
          ))}
        </span>
        <span className="allow-text">
          <b>{s.buysLeft} of {SHOP_BUDGET}</b> equipment changes left this season
          <em>{s.buysLeft > 0
            ? ' — nobody re-learns a bag in October. Cards are exempt.'
            : ' — the bag is set for the year. Cards are still exempt.'}</em>
        </span>
      </div>

      <Label note="what the truck brought this week">On the rack</Label>
      <div className="offer">
        {s.offer.map((item, i) => {
          const afford = item.price <= s.earnings
          if (item.kind === 'boost') {
            const b = BOOST[item.id]!
            const tier = tierOf(item.price)
            // past the allowance, a boost is as unbuyable as an unaffordable one
            const canBuy = afford && s.buysLeft > 0
            const why = !afford ? `${money(item.price - s.earnings)} short`
              : s.buysLeft === 0 ? 'no changes left' : null
            return (
              <button key={item.id} className={`offercard is-boost tier-${tier} ${canBuy ? '' : 'off'}`}
                disabled={!canBuy} onClick={() => dispatch({ type: 'BUY', index: i })}>
                <span className={`offer-kind tier-${tier}`}>
                  <Badge tone={`tier-${tier}`}>{TIER_LABEL[tier]}</Badge>
                  <em>always on</em>
                </span>
                <span className="boost-icon">{b.icon}</span>
                <span className="offer-name">{b.name}</span>
                <span className="offer-blurb">{b.blurb}</span>
                <span className="offer-price">
                  {money(item.price)}
                  {why && <i className="offer-why">{why}</i>}
                </span>
              </button>
            )
          }
          const c = CARD[item.id]!
          return (
            <button key={item.id + i} className={`offercard is-card ${afford ? '' : 'off'}`}
              disabled={!afford} onClick={() => dispatch({ type: 'BUY', index: i })}>
              <span className="offer-kind">
                <Badge tone={c.kind === 'shot' ? 'shot' : 'tech'}>
                  {c.kind === 'shot' ? 'shot' : 'technique'}
                </Badge>
                <em>{c.kind === 'shot' ? 'costs a stroke' : 'costs focus'}</em>
              </span>
              <span className="offer-name">{c.name}</span>
              {c.kind === 'shot'
                ? <span className="offer-num">{c.carry}<i>yds</i></span>
                : <span className="offer-focus">{c.focus === 0 ? 'free' : '◆'.repeat(c.focus)}</span>}
              <span className="offer-blurb">{c.blurb}</span>
              <span className="offer-price">
                {money(item.price)}
                {!afford && <i className="offer-why">{money(item.price - s.earnings)} short</i>}
              </span>
            </button>
          )
        })}
      </div>

      <div className="shoprow">
        <button className="ghost" disabled={CUT_PRICE > s.earnings}
          onClick={() => dispatch({ type: 'BUY_CUT' })}>
          <span>Cut a card from the bag<em>fewer cards, better draws</em></span>
          <b>{money(CUT_PRICE)}</b>
        </button>
        <button className="ghost" disabled={REROLL_PRICE > s.earnings}
          onClick={() => dispatch({ type: 'REROLL' })}>
          <span>Different stock<em>same tiers, new items</em></span>
          <b>{money(REROLL_PRICE)}</b>
        </button>
      </div>

      <button className="big" onClick={() => dispatch({ type: 'LEAVE_SHOP' })}>
        {s.offer.length ? 'Bank the rest' : 'On to the next week'}
      </button>

      <footer className="screenfoot">
        <Label note={`· ${deckList(s).length} cards`}>In the bag</Label>
        <DeckPanel ids={deckList(s)} />
        {s.boosts.length > 0 && (
          <>
            <Label>Carrying</Label>
            <div className="deckpanel">
              {s.boosts.map(id => (
                <span key={id} className="chip boost" title={BOOST[id]!.blurb}>
                  {BOOST[id]!.icon} {BOOST[id]!.name}
                </span>
              ))}
            </div>
          </>
        )}
      </footer>
    </div>
  )
}

/* ---------------------------------------------------------------- fitting */

export function RemoveScreen({ s, dispatch }: { s: GameState; dispatch: (a: Action) => void }) {
  return (
    <div className="shell intro">
      <Eyebrow>
        {s.mustSwap ? 'The pro shop · the bag is full'
          : s.cutIsPaid ? 'The pro shop · fitting' : 'A week getting fitted'}
      </Eyebrow>
      <h1 className="small">{s.mustSwap ? 'Something has to come out' : 'Cut a card'}</h1>
      <p className="tagline">
        {s.mustSwap
          ? 'The bag holds twenty and you just bought the twenty-first. Pick what goes.'
          : 'Fewer cards means you draw the good ones more often. Pick one to go.'}
      </p>
      <Label note="this cannot be undone">Tap the card that leaves</Label>
      <div className="removelist">
        {deckList(s).map((id, i) => {
          const c = CARD[id]!
          return (
            <button key={id + i} className="removeone"
              onClick={() => dispatch({ type: 'REMOVE_CARD', id })}>
              <b>{c.name}</b>
              <span>{c.kind === 'shot'
                ? `${c.carry} yds`
                : c.focus === 0 ? 'free' : '◆'.repeat(c.focus)}</span>
            </button>
          )
        })}
      </div>
      {!s.mustSwap && (
        <button className="ghost" onClick={() => dispatch({ type: 'REMOVE_CARD', id: null })}>
          Changed my mind — refund it
        </button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------ major prize */

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
export function PrizeScreen({ s, dispatch }: { s: GameState; dispatch: (a: Action) => void }) {
  return (
    <div className="shell intro">
      <Eyebrow>{currentEvent(s).name} · the cut is made</Eyebrow>
      <h1 className="small major">Pick up your prize<Badge tone="gold">major</Badge></h1>
      <p className="tagline">
        A major pays its survivors in equipment. Take one — it is yours for
        the rest of the season, and the weekend starts the moment you lift it.
      </p>
      <Label note="no money changes hands, and it does not touch your allowance">
        Choose one
      </Label>
      <div className="offer">
        {s.boostOffer.map(id => {
          const b = BOOST[id]!
          return (
            <button key={id} className="offercard is-boost tier-tour"
              onClick={() => dispatch({ type: 'TAKE_BOOST', id })}>
              <span className="offer-kind tier-tour">
                <Badge tone="tier-tour">free</Badge><em>always on</em>
              </span>
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
