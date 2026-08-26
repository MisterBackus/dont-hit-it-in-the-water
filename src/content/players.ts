/**
 * The field. Plausible tour names, invented — no real players (P4: recognition,
 * not impersonation). Combined deterministically from the season seed so a run
 * always has the same field, and different runs don't.
 */
export const FIRST = [
  'Cam', 'Brooks', 'Tam', 'Rory', 'Wes', 'Duane', 'Kit', 'Marcus', 'Ollie',
  'Sung-ho', 'Tobias', 'Del', 'Rhys', 'Nico', 'Jarrah', 'Bo', 'Emil', 'Hank',
  'Kenji', 'Lars', 'Pio', 'Quinn', 'Silas', 'Tucker', 'Vance', 'Zeb', 'Arlo',
  'Bram', 'Corey', 'Dez', 'Finn', 'Gus', 'Huw', 'Ike', 'Jonty', 'Kip',
] as const

export const LAST = [
  'Ashworth', 'Ballinger', 'Cadogan', 'Delaney', 'Ekstrom', 'Fairhurst',
  'Gallagher', 'Hollis', 'Ingham', 'Jessop', 'Kowalczyk', 'Lindqvist',
  'Mahoney', 'Nakamura', 'Okonkwo', 'Pemberton', 'Quilty', 'Rasmussen',
  'Sandoval', 'Thackeray', 'Ulvestad', 'Vasquez', 'Whitcombe', 'Yarrow',
  'Zabala', 'Brennan', 'Castellan', 'Doherty', 'Eriksen', 'Falkner',
  'Grimsby', 'Havelock', 'Ipswich', 'Jandali', 'Kirkbride', 'Lowery',
  'Moreau', 'Nystrom', 'Ostrander', 'Pike', 'Renfrew', 'Sturgess',
  'Tremaine', 'Underhill', 'Vandermeer', 'Wrenford',
] as const

export const FIELD_SIZE = 71

/**
 * THE STARS (FIELD-CEILING.md §5–6) — the tour's marquee names. This tour ran
 * fourteen seasons of 71 anonymous re-rolled names before it had one worth
 * beating; these are the names. A run carries STAR_COUNT of them, drawn once
 * per run (sim/resolve/field.ts starNamesFor, salted hash, salt 7), and each
 * week they are painted onto the top skill draws — names only in the spring,
 * and from event 5 they start finding the form the season's marquee ramp
 * says they find (starTarget). Surnames are deliberately NOT in LAST, so a
 * star can never collide with a generated name.
 */
export interface Star {
  readonly name: string
  /** one line of who they are — for any screen that ever wants to say */
  readonly blurb: string
}

export const STARS: readonly Star[] = [
  {
    name: 'Cyrus Vail',
    blurb: 'The metronome. Has not changed his putter, his Sunday shirt, or his expression since turning pro.',
  },
  {
    name: 'Angel Maravilla',
    blurb: 'Plays the shot the hole is daring him to play. The gallery loves him; his caddie has aged forty years.',
  },
  {
    name: 'Harlan Boone',
    blurb: 'Twenty-two seasons, no swing to speak of, and the meanest short game ever issued to one man.',
  },
  {
    name: 'Kaz Ito',
    blurb: 'Peaks in October, every October. Nobody has ever found out what he does all summer.',
  },
] as const

/**
 * THE MARQUEE RAMP's dials (FIELD-CEILING.md §6–7, derived by sweep — see the
 * SHIPPED section there for predicted-vs-measured). All three skill-equivalent
 * numbers speak the probe's language: "effective skill", where the field's
 * hard ceiling is 0.85 and the §2 winner-gap table priced 1.2/1.4/1.6.
 */
/** stars carried per run — sweep A (k) */
export const STAR_COUNT = 4
/**
 * finale ramp-equivalent effective skill — sweep A (R), RE-SWEPT under
 * THE FULL SCORECARD (FIELD-SPREAD.md §8, sweep B re-run): the 36-hole
 * extension rewards pace, so at the old 1.4 the late-season win rate had
 * drifted 51% → 58%. 1.55 restores it to 49% (finale 55%, hot weeks kept
 * at 100% in every cell — β < 1 and the CAP untouched), dead inside the
 * registered 1.55 ± 0.05. Winner tail texture in real-hole space stays
 * honest at this setting: p10 −7, 9.3% of finales ≤ −8.
 */
export const STAR_RAMP_END = 1.55
/** fraction of the player's trailing sub-par pace the band chases — sweep B (β) */
export const STAR_BAND_BETA = 0.8
/** skill-equivalent cap on the band above the ramp — sweep B (CAP) */
export const STAR_BAND_CAP = 0.3
