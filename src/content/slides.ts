import { defineSlides } from '../engine/defineSlides'
import { VISUALS } from './visuals'

/**
 * THE RUNNING ORDER — the only file you edit to arrange the talk.
 *
 *   steps   visual ids; arriving shows the first, Enter reveals each next one
 *   camera  'screen' (fills the projector) | a set cue: stage, room, letters,
 *           podium, booth, rig, wall, foyer, badges, merch, atrium, booths, map
 *           (see src/scene/venue.ts; preview with ?cue=)
 *   effect  0 = clean passthrough … 1 = full medium effect
 *   notes   shown in ?presenter only
 *
 * Rule: → / ← move slides and nothing else. Enter performs steps.
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
  { id: 'venue-map', beat: 'venue', steps: ['venue-map'], camera: 'map', notes: 'Ten months later. Crane shot from Foifi over to the Technopark cutaway. OPTIONAL flyover (5 slides): auditorium, booth, foyer, atrium.' },
  { id: 'venue-atrium', beat: 'venue', steps: ['venue-atrium'], camera: 'atrium', notes: 'OPTIONAL. The atrium: tables, pendants, lift tower.' },
  { id: 'venue-booths', beat: 'venue', steps: ['venue-booths'], camera: 'booths', notes: 'OPTIONAL. AG Grid booth, ZurichJS roll-up, namespace wall beyond.' },
  { id: 'venue-badges', beat: 'venue', steps: ['venue-badges'], camera: 'badges', notes: 'OPTIONAL. All nine badge kinds on the check-in counter.' },
  { id: 'venue-merch', beat: 'venue', steps: ['venue-merch'], camera: 'merch', notes: 'OPTIONAL. Volunteer merch desk: cups and totes.' },
  { id: 'people-359', beat: 'open', steps: ['people-359'], camera: 'room', effect: 1, notes: '330 ticket holders, plus 19 speakers and MCs without a ticket, plus 10 staff without a ticket.' },
  { id: 'people-split', beat: 'open', steps: ['people-split'], notes: '21 people on stage, 2 of whom also held a ticket. 13 door staff, 3 of whom held a ticket.' },
  { id: 'year-numbers', beat: 'open', steps: ['year-numbers'] },
  { id: 'chapters', beat: 'open', steps: ['chapters'], notes: 'Each problem in chapter 2 gets its answer later.' },

  // ── 1 · Why on earth ───────────────────────────────────────────────────
  { id: 'ch1', beat: 'why', steps: ['ch1'], camera: 'letters', effect: 1 },
  { id: 'meetup-itch', beat: 'why', steps: ['meetup-itch'], notes: 'DATA GAP W1: Faris writes this.' },
  { id: 'front-cancel', beat: 'why', steps: ['front-cancel'], notes: 'Needs front-cancel.png (in the old deck repo). Zurich’s front-end conference for 10+ years. Front 26 was planned for 27 Feb 2026 at Alte Papierfabrik. Ticket demand was "way off, both via B2C and B2B channels", even after scaling to one day. Per Faris: two revival attempts (Q4 2025, Q1 2026) did not happen.' },
  { id: 'front-book', beat: 'why', steps: ['front-book'], notes: 'Needs front-book.png. Their notice lists conf.zurichjs.com first. Front Conference Zurich also bought 6 tickets by company invoice.' },
  { id: 'dying', beat: 'why', steps: ['dying'] },
  { id: 'first-commit', beat: 'why', steps: ['first-commit'], notes: 'First ticket 13 Nov 2025. FARIS: replace with the date you decided, if different.' },

  // ── 2 · A hard year ────────────────────────────────────────────────────
  { id: 'ch2', beat: 'hard-year', steps: ['ch2'], camera: 'wall', effect: 1 },
  { id: 'hardest-year', beat: 'hard-year', steps: ['hardest-year'] },
  { id: 'react-advanced', beat: 'hard-year', steps: ['react-advanced'], notes: 'UNVERIFIED (per Faris).' },
  { id: 'react-alicante', beat: 'hard-year', steps: ['react-alicante'], notes: 'UNVERIFIED.' },
  { id: 'renamed', beat: 'hard-year', steps: ['renamed'], notes: 'UNVERIFIED.' },
  { id: 'last-editions', beat: 'hard-year', steps: ['last-editions'], notes: 'UNVERIFIED except Front 26 (sourced from the frontconference.com screenshot).' },
  { id: 'layoffs', beat: 'hard-year', steps: ['layoffs'], notes: 'Netflix, Google, Microsoft, Canva, Smallpdf. Smallpdf was our Gold sponsor: decide whether to name companies.' },
  { id: 'sponsor-tiers', beat: 'hard-year', steps: ['sponsor-tiers'], notes: 'Platinum alone brought about CHF 27k.' },
  { id: 'no-diamond', beat: 'hard-year', steps: ['no-diamond'] },
  { id: 'money-late', beat: 'hard-year', steps: ['money-late'], notes: '15 of 24 were paid in the last three months.' },
  { id: 'price-sensitive', beat: 'hard-year', steps: ['price-sensitive'], notes: 'FARIS: add what you saw.' },
  { id: 'expensive', beat: 'hard-year', steps: ['expensive'] },
  { id: 'ai-changed', beat: 'hard-year', steps: ['ai-changed'], notes: 'FARIS: opinion to add.' },
  { id: 'ai-share', beat: 'hard-year', steps: ['ai-share'], notes: 'Keyword-based.' },
  { id: 'three-problems', beat: 'hard-year', steps: ['three-problems'], notes: 'FARIS to confirm the links: sponsor budgets → ch3 (tiny team, one app); AI submissions → ch4 (programme picks); price-sensitive buyers → ch5 (discounts, partner codes, invoices, currencies).' },

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
  {
    id: 'road', beat: 'room',
    steps: ['road'],
    notes: 'NEW (not in the handoff). Plays by itself, about 35 s: starts at React Summit US, New York, then flies every trip in date order (19 stops) and lands on the totals. No keys needed; → moves on. From faziz-dev.com/events, Nov 2025 to Aug 2026. Blue = team trips: React Vienna, ReactJS Milano and jsday, CityJS London, JSHeroes; Voxxed Days Zurich is at home. ASSUMED: return trips from Zurich except Milan → Bologna and Warsaw → Cluj; km is great-circle.',
  },
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
  { id: 'add-up', beat: 'final', steps: ['add-up-q', 'add-up-a'], notes: 'Enter reveals the answer.' },
  { id: 'rating', beat: 'final', steps: ['rating'] },
  { id: 'come-back', beat: 'final', steps: ['come-back'], notes: '61 Absolutely, 38 "I’ll try".' },
  { id: 'thanks', beat: 'final', steps: ['thanks'], camera: 'stage', effect: 1, notes: 'CHECK: 13 door staff vs 14 volunteers on the dashboard.' },
  { id: 'come-2028', beat: 'final', steps: ['come-2028'], camera: 'room', effect: 1, notes: 'DATA GAP O5: next edition date. Optional movie.' },
])
