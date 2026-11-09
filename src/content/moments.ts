/**
 * The road in pictures: Faris's photos from September 2025 to the conference,
 * in date order. Plain data, read by the `moments` painter.
 *
 * Date: the photo's capture time (EXIF). Place: from the photo's GPS when it
 * had one; otherwise inferred from the date and the trips in travel.ts
 * (marked `// by date`). What: the event of that trip (travel.ts), or what
 * the photo plainly shows. No place = unknown, shown with the date only.
 * Files are 720px, re-encoded with all metadata (GPS included) stripped.
 * One photo (12 May, a joke gesture) is left out on purpose.
 */

import type { Moment } from '../engine/types'

const m = (n: string, date: string, place?: string, what?: string): Moment =>
  ({ src: `/moments/${n}.jpg`, date, place, what })

export const MOMENTS: readonly Moment[] = [
  // September 2025. CHECK: where and what (no GPS).
  m('01', '2025-09-19'),
  m('02', '2025-09-19'),
  m('03', '2025-09-20'),
  // November to December 2025
  m('04', '2025-11-17', 'New York', 'React Summit US'), // by date
  m('05', '2025-11-17', 'New York', 'React Summit US'),
  m('06', '2025-11-18', 'New York', 'ZurichJS on the big screen'), // by date
  m('07', '2025-12-18', 'Lisbon', 'LisboaJS'),
  // January to March 2026
  m('08', '2026-01-18', 'Berlin'),
  m('09', '2026-01-31', 'Singapore', 'CityJS Singapore'),
  m('10', '2026-02-02', 'Singapore', 'CityJS Singapore'),
  m('11', '2026-02-03', 'Singapore', 'CityJS Singapore'),
  m('12', '2026-02-18', 'Vienna', 'React Vienna'),
  m('13', '2026-02-18', 'Vienna', 'React Vienna'), // by date
  m('14', '2026-02-19', 'Vienna', 'React Vienna'),
  m('15', '2026-02-24', 'Zurich', 'First look at Technopark'),
  m('16', '2026-02-24', 'Zurich', 'First look at Technopark'),
  m('17', '2026-03-05', 'Prague', 'React Prague'),
  m('18', '2026-03-23', 'Zurich'),
  m('19', '2026-03-26', 'Paris', 'React Paris'),
  m('20', '2026-03-26', 'Paris', 'React Paris'), // by date
  m('21', '2026-03-27', 'Paris', 'React Paris'),
  m('22', '2026-03-27', 'Paris', 'React Paris'),
  // April 2026
  m('23', '2026-04-07', 'Milan', 'ReactJS Milano'),
  m('24', '2026-04-07', 'Milan', 'ReactJS Milano'),
  m('25', '2026-04-15', 'London', 'CityJS London'), // by date
  m('26', '2026-04-17', 'London', 'CityJS London'), // by date
  m('27', '2026-04-19', undefined, 'On a call'),
  m('28', '2026-04-21', 'Zurich'),
  m('29', '2026-04-24', 'Athens', 'Devoxx Greece'),
  m('30', '2026-04-25', 'Athens', 'Devoxx Greece'),
  m('31', '2026-04-27', 'San Francisco', 'Stripe Sessions'),
  m('32', '2026-04-28', 'San Francisco', 'Stripe Sessions'), // by date
  m('33', '2026-04-29', 'San Francisco', 'Stripe Sessions'), // by date
  m('34', '2026-04-29', 'San Francisco', 'Stripe Sessions'), // by date
  m('35', '2026-04-30', 'San Francisco', 'Stripe Sessions'),
  m('36', '2026-04-30', 'San Francisco', 'Stripe Sessions'),
  m('37', '2026-04-30', 'San Francisco', 'Stripe Sessions'), // by date (1 May UTC)
  // May to June 2026
  m('38', '2026-05-02'),
  m('40', '2026-05-12', 'Warsaw', 'WarsawJS'),
  m('41', '2026-05-13', 'Warsaw', 'On to Cluj'),
  m('42', '2026-05-15', 'Cluj-Napoca', 'JSHeroes'),
  m('43', '2026-05-15', 'Cluj-Napoca', 'JSHeroes'), // by date
  m('44', '2026-05-15', 'Cluj-Napoca', 'JSHeroes'), // by date
  m('45', '2026-05-17', 'Cluj-Napoca', 'JSHeroes'), // by date
  m('46', '2026-05-24', 'Coimbra', 'JNation'),
  m('47', '2026-05-24', 'Coimbra', 'JNation'),
  m('48', '2026-05-26', 'Coimbra', 'JNation'), // by date
  m('49', '2026-06-05', 'Amsterdam', 'JSNation'), // by date
  m('50', '2026-06-05', 'Amsterdam', 'JSNation'), // by date
  m('51', '2026-06-11', 'Amsterdam', 'React Summit'),
  m('52', '2026-06-11', 'Amsterdam', 'React Summit'), // by date
  // July to September 2026
  m('53', '2026-07-14', 'Barcelona', 'ReactJS Barcelona'),
  m('54', '2026-07-23', 'Zurich', 'At Smallpdf'),
  m('55', '2026-07-24', 'Zurich'),
  m('56', '2026-08-11', 'Atlanta', 'RenderATL'),
  m('57', '2026-08-11', 'Atlanta', 'RenderATL'),
  m('58', '2026-08-12', 'Atlanta', 'The Commits Awards'), // by date
  m('59', '2026-08-12', 'Atlanta', 'RenderATL'),
  m('60', '2026-08-13', 'Atlanta', 'RenderATL'),
  m('61', '2026-08-29', 'Geneva'),
  m('62', '2026-09-06', 'Zurich', 'Cutting the foam letters'),
  m('63', '2026-09-06', 'Zurich', 'Cutting the foam letters'),
  m('64', '2026-09-08', 'Zurich', 'Moving in at Technopark'),
  m('65', '2026-09-08', 'Zurich', 'Moving in at Technopark'),
  m('66', '2026-09-08', 'Zurich', 'Moving in at Technopark'),
  m('67', '2026-09-08', 'Zurich', 'Moving in at Technopark'),
  m('68', '2026-09-08', 'Zurich', 'Three days to go'),
  m('69', '2026-09-08', 'Zurich', 'Three days to go'),
  m('70', '2026-09-10', 'Zurich', 'Workshop day'),
  m('71', '2026-09-11', 'Zurich', 'ZurichJS Conf'),
]

/** Counted from MOMENTS (cities with a known place; London is by date). */
export const MOMENT_TOTALS = [
  { value: '70', label: 'Moments' },
  { value: '19', label: 'Cities' },
  { value: '15', label: 'Countries in the photos' },
  { value: '12', label: 'Months with photos' },
] as const
