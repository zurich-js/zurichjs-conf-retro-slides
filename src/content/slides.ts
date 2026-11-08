import { defineSlides } from '../engine/defineSlides'
import { VISUALS } from './visuals'

/**
 * THE RUNNING ORDER — the only file you edit to arrange the talk.
 *
 *   steps   exactly one visual id (one visual per slide; builds are separate slides)
 *   camera  'screen' (fills the projector) | a set cue: stage, room, letters,
 *           podium, booth, rig, wall, foyer, badges, merch, atrium, booths, map
 *           (see src/scene/venue.ts; preview with ?cue=)
 *   effect  0 = clean passthrough … 1 = full medium effect
 *   notes   shown in ?presenter only
 *
 * Rule: → / ← move slides and nothing else. No Enter steps: every beat is an arrow press.
 *
 * DRAFT (2026-11-08): ZurichJS Conf retrospective, scaffolded 1:1 from the
 * handoff's 87 slides, plus the road-to-Zurich globe and an optional venue
 * flyover. About 24 minutes at 15 s a step, for a 40-minute talk: room to
 * expand the story in review.
 * Chapter openers sit on venue cues where the screen stays readable.
 */
export const slides = defineSlides(VISUALS, [
  // ── Opening ────────────────────────────────────────────────────────────
  // ── Where it started: Pause im Foifi, 14 Nov 2025 ───────────────────────
  { id: 'cover', beat: 'start', steps: ['cover'], camera: 'projector', notes: 'Full screen: we are looking into the lens of the projector at Pause im Foifi. The next slide backs out of the projector eye and flips round to the screen. We open where it started: Pause im Foifi, the ZurichJS 1st anniversary. Option: show the movie here or at the close.' },
  { id: 'anniversary', beat: 'start', steps: ['anniversary'], camera: 'foifi', effect: 1, notes: 'Pause im Foifi, thanks to Digitec Galaxus. CHECK the date: Faris says 14 Nov 2025; the events page lists the 1st Anniversary Special on 13 Nov and the handoff has the first ticket sold on 13 Nov.' },
  { id: 'go-live', beat: 'start', steps: ['go-live'], camera: 'deploy', effect: 1, notes: 'We deployed conf.zurichjs.com and opened ticket sales five minutes before the meetup started. The slide is on the laptop that shipped it.' },
  { id: 'first-ticket', beat: 'start', steps: ['first-ticket'], camera: 'foifi-screen', effect: 1, notes: 'Jonny Burger bought the first ticket.' },
  { id: 'tshirt-bug', beat: 'start', steps: ['tshirt-bug'], camera: 'foifi-screen', effect: 1, notes: 'Someone tried to buy a t-shirt; the same webhook endpoint as tickets intercepted it and issued a ticket.' },
  { id: 'one-year', beat: 'start', steps: ['one-year'], camera: 'cake', notes: 'The birthday cake on the "new Date()" flyer. Next slide flies from Foifi across Zurich to Technopark.' },
  // ── Rolling back a year: the meetup's first year ───────────────────────
  { id: 'rollback', beat: 'start', steps: ['rollback'], camera: 'foifi-full', notes: 'The camera dives into the Foifi screen; the calendar flips back from 14 Nov 2025 to the meetup relaunch on 14 Nov 2024 (relaunch date from faziz-dev.com/events).' },
  { id: 'meetup-year', beat: 'start', steps: ['meetup-year'], camera: 'foifi-full', notes: 'Meetup.com group stats export, 8 Nov 2026, cumulative from the relaunch. Members counted from 0 (the 257 from before the relaunch treated as inactive, per Faris). Year one: 409 members, 634 RSVPs, 427 joined.' },
  { id: 'meetup-2026', beat: 'start', steps: ['meetup-year-2'], camera: 'foifi-full', notes: 'The same lines continue into 2026, to 8 Nov 2026 (just before the 2nd anniversary on 12 Nov): 844 members, 1,435 RSVPs, 939 joined. Year two alone: +435 members, +801 RSVPs, +512 joined.' },
  { id: 'meetup-rsvps', beat: 'start', steps: ['meetup-rsvps'], camera: 'foifi-full', notes: 'RSVPs per whole month, Nov to Oct (totals 636 and 810 differ slightly from anniversary-to-anniversary 634 and 801). Year one peaked in spring: 96 in March, 114 in April 2025 (outlined: the busiest month of both years). CHECK which meetups those were.' },
  { id: 'meetup-rsvps-2026', beat: 'start', steps: ['meetup-rsvps-2'], camera: 'foifi-full', notes: 'Year two slides in under year one: busier in 8 of 12 months, 810 vs 636. Peaks: Jan 2026 (104), Apr (94), May (90). CHECK which meetups those were.' },
  { id: 'chapters', beat: 'open', steps: ['chapters'], camera: 'foifi-full', notes: 'The agenda, right after the meetup numbers. Each problem in chapter 2 gets its answer later.' },
  // ── 1 · Why on earth (still at Foifi) ──────────────────────────────────
  { id: 'ch1', beat: 'why', steps: ['ch1'], camera: 'foifi', effect: 1 },
  { id: 'meetup-itch', beat: 'why', steps: ['meetup-itch'], camera: 'foifi-full', notes: 'DATA GAP W1: Faris writes this.' },
  { id: 'front-cancel', beat: 'why', steps: ['front-cancel'], camera: 'foifi-full', notes: 'Needs front-cancel.png (in the old deck repo). Zurich’s front-end conference for 10+ years. Front 26 was planned for 27 Feb 2026 at Alte Papierfabrik. Ticket demand was "way off, both via B2C and B2B channels", even after scaling to one day. Per Faris: two revival attempts (Q4 2025, Q1 2026) did not happen.' },
  { id: 'front-book', beat: 'why', steps: ['front-book'], camera: 'foifi-full', notes: 'Needs front-book.png. Their notice lists conf.zurichjs.com first. Front Conference Zurich also bought 6 tickets by company invoice.' },
  { id: 'dying', beat: 'why', steps: ['dying'], camera: 'foifi-full' },
  { id: 'stakes-100k', beat: 'why', steps: ['stakes-100k'], camera: 'foifi-full', notes: 'The stakes. We needed at least 100k to run it. CHECK: CHF assumed.' },
  { id: 'stakes-no-cancel', beat: 'why', steps: ['stakes-no-cancel'], camera: 'foifi-full', notes: 'You sign the bookings with no cancellation. Once signed, the money is committed whether tickets sell or not.' },
  { id: 'stakes-split', beat: 'why', steps: ['stakes-split'], camera: 'foifi-full', notes: 'If we did not make it, the three of us would take the hit, split between us, on our personal finances. (Not stated per person on purpose: worst case would be about a third of 100k each. Say it if you want to.)' },
  { id: 'affordable-idea', beat: 'why', steps: ['affordable-idea'], camera: 'foifi-full', notes: 'And we wanted it affordable, in the most expensive city in Europe. Zurich ranks first in Numbeo\'s 2025 mid-year cost of living index (112.5, New York = 100); every other European city scored under 100. Our site promised community pricing, up to 50% lower than other European web dev conferences.' },
  { id: 'price-compare', beat: 'why', steps: ['price-compare'], camera: 'foifi-full', notes: 'Regular (first-batch) in-person ticket, 2026, from the official ticket pages, converted at the ECB rate for 11 Sep 2026 (1 CHF = 1.0581 EUR, 0.908 GBP). React Advanced £540 (range £450 to £730). React Summit €600 (€490 to €910). React Day Berlin €545 (€420 to €785; JSNation left out, it prices like React Summit). Voxxed Days Zurich CHF 360 standard (CHF 252 to 360). React Paris €650 regular two-day in-person (€450 early to €850 late; react.paris via web.archive.org, Dec 2025 to Mar 2026; VAT status not stated). JSWorld Amsterdam (7 to 8 May 2026, RAI) left off: its prices were only in the Ticket Tailor checkout, now closed and not archived; prices excl. VAT per its T&Cs. JSHeroes €210 (€170 to €260; Cluj, far cheaper city). ZurichJS Conf CHF 295 standard (CHF 230 blind bird to CHF 395). GitNation tickets are hybrid: one in-person day plus a remote day. CHECK: CHF 295 as our general-admission price.' },
  { id: 'value-grid', beat: 'why', steps: ['value-grid'], camera: 'foifi-full', notes: 'Same calibre of speakers, at about half the price, and more in the bag. Ours: lunch, T-shirt (222 handed out), goodie bag (204), designed badges, recordings, the warm-up meetup, student tickets. GitNation (React Day Berlin, React Summit): lunch, light breakfast, all-day coffee, after-party and a remote day; PRO workshops extra; Berlin lists a student ticket. React Paris (€650, about CHF 614): food and drinks, recordings emailed after, pre-conf meetups, treats and party, a D&I scholarship (not a student ticket), workshops €250 extra. JSWorld Amsterdam: after-party (karaoke, arcades, DJ) is the only inclusion on its official pages; its price is no longer published. A dash means the official pages do not list it, not that they do not have it. Our after-party was VIP only; we had no remote day. CHECK: JSWorld 2026 regular price, if you have it.' },
  { id: 'workshop-compare', beat: 'why', steps: ['workshop-compare'], camera: 'foifi-full', notes: 'Workshops were extra everywhere. React Paris 2026: Dominik Dorfmeister, "React Query: beyond the basics", 25 Mar, 14:00 to 18:00, €250 (about CHF 236). Ours: CHF 250 for 4 hours, CHF 150 for 2 hours, and VIPs got 20% off (CHF 200 for 4 hours). Same price as Paris, in Zurich.' },
  { id: 'vip-vs-standard', beat: 'why', steps: ['vip-vs-standard'], camera: 'foifi-full', notes: 'VIP was a controversial option. CHF 200 more bought the after-party, limited-edition goodies and 20% off any workshop. VIP cap moved from 15 to 25 (13 Jun) to 52 (1 Aug).' },
  { id: 'vip-business-class', beat: 'why', steps: ['vip-business-class'], camera: 'foifi-full', notes: 'Like business class funding economy on a plane. Once someone has put their money into a VIP ticket, the 20% off makes a workshop the obvious next step, then maybe merch: they come for more. That extra spend paid for the people who wanted the minimum viable experience, and for the student tickets, some of which we sold at a loss.' },
  { id: 'vip-funds', beat: 'why', steps: ['vip-funds'], camera: 'foifi-full', notes: 'The after-party was expensive, so the VIP premium itself roughly broke even. What helped a lot was the workshops VIPs bought afterwards. 46 VIP = 28 of 81 international paid tickets + 18 of 169 Swiss (country known for 250 paid). Workshops about CHF 14.4k after about CHF 2.1k of discounts; 80 seats across 6 workshops. Students and unemployed paid CHF 175. DATA GAP: how many VIPs bought a workshop, and the after-party cost; pull from the admin to prove the point.' },
  { id: 'first-commit', beat: 'why', steps: ['first-commit'], camera: 'foifi-full', notes: 'First ticket 13 Nov 2025. FARIS: replace with the date you decided, if different.' },

  // ── 2 · A hard year: the market and our three problems (still at Foifi) ──
  { id: 'ch2', beat: 'hard-year', steps: ['ch2'], camera: 'foifi-screen', effect: 1 },
  { id: 'hardest-year', beat: 'hard-year', steps: ['hardest-year'], camera: 'foifi-full' },
  { id: 'react-advanced', beat: 'hard-year', steps: ['react-advanced'], camera: 'foifi-full', notes: 'UNVERIFIED (per Faris).' },
  { id: 'react-alicante', beat: 'hard-year', steps: ['react-alicante'], camera: 'foifi-full', notes: 'UNVERIFIED.' },
  { id: 'renamed', beat: 'hard-year', steps: ['renamed'], camera: 'foifi-full', notes: 'UNVERIFIED.' },
  { id: 'last-editions', beat: 'hard-year', steps: ['last-editions'], camera: 'foifi-full', notes: 'UNVERIFIED except Front 26 (sourced from the frontconference.com screenshot).' },
  { id: 'layoffs', beat: 'hard-year', steps: ['layoffs'], camera: 'foifi-full', notes: 'Netflix, Google, Microsoft, Canva, Smallpdf. Smallpdf was our Gold sponsor: decide whether to name companies.' },
  { id: 'sponsor-tiers', beat: 'hard-year', steps: ['sponsor-tiers'], camera: 'foifi-full', notes: 'Platinum alone brought about CHF 27k.' },
  { id: 'no-diamond', beat: 'hard-year', steps: ['no-diamond'], camera: 'foifi-full' },
  { id: 'money-late', beat: 'hard-year', steps: ['money-late'], camera: 'foifi-full', notes: '15 of 24 were paid in the last three months.' },
  { id: 'price-sensitive', beat: 'hard-year', steps: ['price-sensitive'], camera: 'foifi-full', notes: 'FARIS: add what you saw.' },
  { id: 'expensive', beat: 'hard-year', steps: ['expensive'], camera: 'foifi-full' },
  { id: 'ai-changed', beat: 'hard-year', steps: ['ai-changed'], camera: 'foifi-full', notes: 'FARIS: opinion to add.' },
  { id: 'ai-share', beat: 'hard-year', steps: ['ai-share'], camera: 'foifi-full', notes: 'Keyword-based.' },
  { id: 'three-problems', beat: 'hard-year', steps: ['three-problems'], camera: 'foifi-full', notes: 'FARIS to confirm the links: sponsor budgets → ch3 (tiny team, one app); AI submissions → ch4 (programme picks); price-sensitive buyers → ch5 (discounts, partner codes, invoices, currencies).' },

  // ── ZurichJS on the road: the trips between the anniversary and the conference ──
  {
    id: 'road', beat: 'start', camera: 'foifi-full',
    steps: ['road'],
    notes: 'ZurichJS on the road: our answer to the hard year. Between the anniversary and the conference we took ZurichJS to meetups and conferences abroad to market the conf, meet speakers and close sponsor deals. Still on the Foifi screen; the next slide flies to Technopark. Plays by itself, about 35 s: starts at React Summit US, New York, then flies every trip in date order (19 stops) and lands on the totals. No keys needed; → moves on. From faziz-dev.com/events, Nov 2025 to Aug 2026. Blue = team trips: React Vienna, ReactJS Milano and jsday, CityJS London, JSHeroes; Voxxed Days Zurich is at home. ASSUMED: return trips from Zurich except Milan → Bologna and Warsaw → Cluj; km is great-circle.',
  },
  { id: 'venue-map', beat: 'venue', steps: ['venue-map'], camera: 'map', notes: 'Ten months later. Crane shot from Foifi over to the Technopark cutaway. OPTIONAL flyover (5 slides): auditorium, booth, foyer, atrium.' },
  { id: 'venue-atrium', beat: 'venue', steps: ['venue-atrium'], camera: 'atrium', notes: 'OPTIONAL. The atrium: tables, pendants, lift tower.' },
  { id: 'venue-booths', beat: 'venue', steps: ['venue-booths'], camera: 'booths', notes: 'OPTIONAL. AG Grid booth, ZurichJS roll-up, namespace wall beyond.' },
  { id: 'venue-badges', beat: 'venue', steps: ['venue-badges'], camera: 'badges', notes: 'OPTIONAL. All nine badge kinds on the check-in counter.' },
  { id: 'venue-merch', beat: 'venue', steps: ['venue-merch'], camera: 'merch', notes: 'OPTIONAL. Volunteer merch desk: cups and totes.' },
  { id: 'people-359', beat: 'open', steps: ['people-359'], camera: 'room', effect: 1, notes: '330 ticket holders, plus 19 speakers and MCs without a ticket, plus 10 staff without a ticket.' },
  { id: 'people-split', beat: 'open', steps: ['people-split'], notes: '21 people on stage, 2 of whom also held a ticket. 13 door staff, 3 of whom held a ticket.' },
  { id: 'year-numbers', beat: 'open', steps: ['year-numbers'] },



  // ── 3 · The machine ────────────────────────────────────────────────────
  { id: 'ch3', beat: 'machine', steps: ['ch3'], camera: 'booth', effect: 1, notes: 'Camera in the control booth: the crew behind the glass.' },
  { id: 'small-team', beat: 'machine', steps: ['small-team'], notes: 'Admin areas: tickets, workshops, CFP and reviewers, speaker travel, sponsorships, partnerships, company invoices, VIP perks, apparel, door check-in. CONFIRM organisers: Faris, Bogdan, Nadja, Colin.' },
  { id: 'slack-people', beat: 'machine', steps: ['slack-people'], notes: 'About 129 messages a day.' },
  { id: 'slack-share', beat: 'machine', steps: ['slack-share'], notes: '88% were in private channels.' },
  { id: 'slack-days-off', beat: 'machine', steps: ['slack-days-off'], notes: '15% of messages were sent on weekends.' },
  { id: 'slack-peak', beat: 'machine', steps: ['slack-peak'], notes: 'August was the busiest month at 8,265. Top days: 3 Sep 836, 1 Sep 744, 4 Aug 705.' },
  { id: 'brand', beat: 'machine', steps: ['brand'], notes: 'DATA GAP M1: Faris writes this.' },
  { id: 'timeline', beat: 'machine', steps: ['timeline'], notes: 'Old deck revealed these one per click; one slide in this draft.' },
  { id: 'commits', beat: 'machine', steps: ['commits'] },
  { id: 'agent-prs', beat: 'machine', steps: ['agent-prs'], notes: 'The first PR (5 Nov 2025) was already from a claude/ branch.' },
  { id: 'agent-share', beat: 'machine', steps: ['agent-share'] },
  { id: 'my-job', beat: 'machine', steps: ['my-job'] },
  { id: 'app-grew', beat: 'machine', steps: ['app-grew'] },

  // ── 4 · Building the programme ─────────────────────────────────────────
  { id: 'ch4', beat: 'programme', steps: ['ch4'], camera: 'stage', effect: 1, notes: '3 of the 6 workshops were AI topics.' },
  { id: 'submissions', beat: 'programme', steps: ['submissions'] },
  { id: 'final-week', beat: 'programme', steps: ['final-week'], notes: '121 of 434 (28%).' },
  { id: 'reviews', beat: 'programme', steps: ['reviews'], notes: '267 speakers applied, about 1.6 submissions each.' },
  { id: 'accepted', beat: 'programme', steps: ['accepted'], notes: 'About 2%. The rest of the programme was invited.' },
  { id: 'fundamentals', beat: 'programme', steps: ['fundamentals'], notes: 'Case studies 71, performance 66.' },
  { id: 'speakers-flew', beat: 'programme', steps: ['speakers-flew'], notes: 'Departure airport country, not home country.' },
  { id: 'workshops', beat: 'programme', steps: ['workshops'], notes: 'Registrations: 17, 10, 9, 16, 22, 6. CONFIRM workshop day was 10 Sep.' },

  // ── 5 · Filling the room ───────────────────────────────────────────────
  { id: 'ch5', beat: 'room', steps: ['ch5'], camera: 'foyer', effect: 1, notes: 'Camera in the foyer: this slide is projected on the wall above check-in.' },
  { id: 'price-stages', beat: 'room', steps: ['price-stages'] },
  { id: 'when-bought', beat: 'room', steps: ['when-bought'] },
  { id: 'last-100-days', beat: 'room', steps: ['last-100-days'], notes: 'FARIS: add the deadline lesson.' },
  { id: 'ways-in', beat: 'room', steps: ['ways-in'] },
  { id: 'invoices', beat: 'room', steps: ['invoices'], notes: 'About a tenth of ticket revenue.' },
  { id: 'currencies', beat: 'room', steps: ['currencies'] },
  { id: 'heard-from', beat: 'room', steps: ['heard-from'] },
  { id: 'partners', beat: 'room', steps: ['partners'], notes: '62 communities, 13 companies, 5 individuals. Top: WarsawJS 5, ReactJS Barcelona 4.' },
  { id: 'august-traffic', beat: 'room', steps: ['august-traffic'], notes: 'Retitled per handoff Part E: August is 18× December, and about 7,500 of August’s visitors came from ads.' },
  { id: 'newsletter', beat: 'room', steps: ['newsletter'] },
  { id: 'ads', beat: 'room', steps: ['ads'], notes: 'Reddit ads: 919 visitors, 0 checkouts.' },
  { id: 'cart', beat: 'room', steps: ['cart'], notes: '631 viewed the cart, 162 entered an email, 156 completed checkout.' },
  { id: 'countries', beat: 'room', steps: ['countries'] },
  { id: 'abroad', beat: 'room', steps: ['abroad'] },
  { id: 'swiss-early', beat: 'room', steps: ['swiss-early'], notes: 'Inference: locals trust the meetup; travellers wait for the lineup.' },
  { id: 'vip-travel', beat: 'room', steps: ['vip-travel'] },
  { id: 'company-types', beat: 'room', steps: ['company-types'], notes: 'CHECK the company-type classification.' },
  { id: 'agencies-local', beat: 'room', steps: ['agencies-local'] },

  // ── 6 · The rollercoaster ──────────────────────────────────────────────
  { id: 'ch6', beat: 'rollercoaster', steps: ['ch6'], camera: 'rig', effect: 1 },
  { id: 'hi-final-week', beat: 'rollercoaster', steps: ['hi-final-week'] },
  { id: 'lo-1000-rows', beat: 'rollercoaster', steps: ['lo-1000-rows'] },
  { id: 'lo-178', beat: 'rollercoaster', steps: ['lo-178'] },
  { id: 'hi-july', beat: 'rollercoaster', steps: ['hi-july'] },
  { id: 'door-prs', beat: 'rollercoaster', steps: ['door-prs'], camera: 'foyer', effect: 1, notes: 'Camera at the door: this is where check-in ran.' },
  { id: 'arrivals', beat: 'rollercoaster', steps: ['arrivals'] },
  { id: 'busiest-day', beat: 'rollercoaster', steps: ['busiest-day'] },
  { id: 'badges', beat: 'rollercoaster', steps: ['badges'], camera: 'foyer', effect: 1, notes: 'CHECK: badges (253) or door scans (156) as the attendance number.' },
  { id: 'not-in-data', beat: 'rollercoaster', steps: ['not-in-data'], notes: 'DATA GAP R1: personal highs and lows.' },

  // ── 7 · What we learned ────────────────────────────────────────────────
  { id: 'ch7', beat: 'learned', steps: ['ch7'], camera: 'room', effect: 1 },
  { id: 'execution', beat: 'learned', steps: ['execution'], notes: 'Best-rated: organisation and logistics, 3.7 of 4. Weakest: food and drinks, 3.2 of 4.' },
  { id: 'distribution', beat: 'learned', steps: ['distribution'] },
  { id: 'pragmatism', beat: 'learned', steps: ['pragmatism'] },

  // ── 8 · The final numbers ──────────────────────────────────────────────
  { id: 'ch8', beat: 'final', steps: ['ch8'], camera: 'stage', effect: 1 },
  { id: 'income', beat: 'final', steps: ['income'], notes: 'Admin income may be off by up to about 5%. Costs are not in the admin.' },
  { id: 'add-up', beat: 'final', steps: ['add-up-q'], notes: 'Pause. The next slide is the answer.' },
  { id: 'add-up-answer', beat: 'final', steps: ['add-up-a'] },
  { id: 'stakes-covered', beat: 'final', steps: ['stakes-covered'], notes: 'Pays off the stakes from chapter 1 (the CHF 100k, no cancellation, split three ways). CHECK: just over break even means no one paid personally.' },
  { id: 'rating', beat: 'final', steps: ['rating'] },
  { id: 'come-back', beat: 'final', steps: ['come-back'], notes: '61 Absolutely, 38 "I’ll try".' },
  { id: 'thanks', beat: 'final', steps: ['thanks'], camera: 'stage', effect: 1, notes: 'CHECK: 13 door staff vs 14 volunteers on the dashboard.' },
  { id: 'come-2028', beat: 'final', steps: ['come-2028'], camera: 'room', effect: 1, notes: 'DATA GAP O5: next edition date. Optional movie.' },
])
