/**
 * Faris's road to ZurichJS Conf 2026: every in-person event outside Zurich
 * from React Summit US in New York (Nov 2025) to the conference, per Faris.
 * Source: faziz-dev.com/events, read 2026-11-08. Online events left out.
 *
 * Plain data, read by the `journey` painter. Assumptions (flag in review):
 * every trip is a return from Zurich, except Milan → Bologna and
 * Warsaw → Cluj-Napoca, which were back-to-back. Team trips (`team`) per
 * Faris: React Vienna, jsday and CityJS London
 * 2026 (Faris, Nadja, Bogdan); ReactJS Milano and JSHeroes (Faris, Bogdan).
 * Voxxed Days Zurich (Faris, Bogdan) is at home: no flight, a pulse.
 * jsday is drawn as the Milan → Bologna leg.
 */

import type { Journey, Place } from '../engine/types'

const P = {
  zurich: { name: 'Zurich', lat: 47.37, lon: 8.54 },
  newYork: { name: 'New York', lat: 40.71, lon: -74.01 },
  lisbon: { name: 'Lisbon', lat: 38.72, lon: -9.14 },
  singapore: { name: 'Singapore', lat: 1.35, lon: 103.82 },
  vienna: { name: 'Vienna', lat: 48.21, lon: 16.37 },
  prague: { name: 'Prague', lat: 50.08, lon: 14.44 },
  paris: { name: 'Paris', lat: 48.86, lon: 2.35 },
  amsterdam: { name: 'Amsterdam', lat: 52.37, lon: 4.9 },
  milan: { name: 'Milan', lat: 45.46, lon: 9.19 },
  bologna: { name: 'Bologna', lat: 44.49, lon: 11.34 },
  london: { name: 'London', lat: 51.51, lon: -0.13 },
  athens: { name: 'Athens', lat: 37.98, lon: 23.73 },
  sanFrancisco: { name: 'San Francisco', lat: 37.77, lon: -122.42 },
  warsaw: { name: 'Warsaw', lat: 52.23, lon: 21.01 },
  cluj: { name: 'Cluj-Napoca', lat: 46.77, lon: 23.59 },
  coimbra: { name: 'Coimbra', lat: 40.21, lon: -8.43 },
  barcelona: { name: 'Barcelona', lat: 41.39, lon: 2.17 },
  atlanta: { name: 'Atlanta', lat: 33.75, lon: -84.39 },
} as const satisfies Record<string, Place>

const Z = P.zurich

export const ROAD_TO_ZURICH: Journey = {
  home: Z,
  legs: [
    // Nov to Dec 2025
    { from: Z, to: P.newYork, when: 'Nov 2025', what: 'React Summit US · Software Social NYC' },
    { from: Z, to: P.lisbon, when: 'Dec 2025', what: 'LisboaJS' },
    // Jan to Mar 2026
    { from: Z, to: P.singapore, when: 'Feb 2026', what: 'CityJS Singapore' },
    { from: Z, to: P.vienna, when: 'Feb 2026', what: 'React Vienna', team: ['Faris', 'Nadja', 'Bogdan'] },
    { from: Z, to: P.prague, when: 'Mar 2026', what: 'React Prague' },
    { from: Z, to: Z, when: 'Mar 2026', what: 'Voxxed Days Zurich', team: ['Faris', 'Bogdan'] },
    { from: Z, to: P.paris, when: 'Mar 2026', what: 'React Paris' },
    // April 2026
    { from: Z, to: P.amsterdam, when: 'Apr 2026', what: 'Voxxed Days Amsterdam' },
    { from: Z, to: P.milan, when: 'Apr 2026', what: 'ReactJS Milano', team: ['Faris', 'Bogdan'] },
    { from: P.milan, to: P.bologna, when: 'Apr 2026', what: 'jsday', team: ['Faris', 'Nadja', 'Bogdan'] },
    { from: Z, to: P.london, when: 'Apr 2026', what: 'CityJS London · React Advanced Meetup', team: ['Faris', 'Nadja', 'Bogdan'] },
    { from: Z, to: P.athens, when: 'Apr 2026', what: 'Devoxx Greece · React Athens' },
    { from: Z, to: P.sanFrancisco, when: 'Apr 2026', what: 'Stripe Sessions' },
    // May to Jun 2026
    { from: Z, to: P.warsaw, when: 'May 2026', what: 'WarsawJS' },
    { from: P.warsaw, to: P.cluj, when: 'May 2026', what: 'JSHeroes', team: ['Faris', 'Bogdan'] },
    { from: Z, to: P.coimbra, when: 'May 2026', what: 'JNation' },
    { from: Z, to: P.amsterdam, when: 'Jun 2026', what: 'JSNation · React Summit · Next.js Night' },
    // Jul to Aug 2026
    { from: Z, to: P.barcelona, when: 'Jul 2026', what: 'ReactJS Barcelona' },
    { from: Z, to: P.atlanta, when: 'Aug 2026', what: 'RenderATL · The Commits Awards' },
  ],
  solo: 'Faris',
  // Team photos from conf.zurichjs.com/about, resized to 320px.
  people: {
    Faris: { src: '/team/faris.png', x: 0.61, y: 0.38, r: 0.33 },
    Nadja: { src: '/team/nadja.png', x: 0.47, y: 0.43, r: 0.27 },
    Bogdan: { src: '/team/bogdan.png', x: 0.52, y: 0.37, r: 0.27 },
    Colin: { src: '/team/colin.png', x: 0.47, y: 0.37, r: 0.28 },
  },
  batches: [
    { label: 'November to December 2025', end: 2 },
    { label: 'January to March 2026', end: 7 },
    { label: 'April 2026', end: 13 },
    { label: 'May to June 2026', end: 17 },
    { label: 'July to August 2026', end: 19 },
  ],
  // Derived from the legs above, except km: about 110k per Faris (2026-11-09; great-circle legs alone give ~89k).
  stats: [
    { value: '16', label: 'Trips' },
    { value: '31', label: 'Events' },
    { value: '13', label: 'Countries visited' },
    { value: '~110k', label: 'Km travelled' },
    { value: '4', label: 'Team trips' },
  ],
}
