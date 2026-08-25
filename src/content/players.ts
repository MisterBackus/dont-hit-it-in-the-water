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
