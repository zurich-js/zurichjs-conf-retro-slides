# ZurichJS Conf retrospective: storyline for rework

Working document for the team. It captures the storyline **as it is in the deck today** (`src/content/slides.ts` and `visuals.ts`, snapshot 2026-11-08), so we can rework the story together. The reworked version of this file is what the final slides get built from.

> The 3D venue and the slide building blocks are in good shape. **The storyline is not.** Rework the story here; leave the visuals to the deck.

## How to use this document

1. Read the brief and **What isn't working** first.
2. Go through the current storyline chapter by chapter. Fill the **Team decision** column: `keep`, `cut`, `merge with …`, `move to …`, or `rework: …`.
3. Draft the new outline in **The reworked storyline** at the end, one slide per row, in the hand-back format.
4. Resolve the **Open questions** before final build: every flagged number must be confirmed or dropped.

House rules (from the original deck brief): no em dashes, never the word "boundary", never invent facts, no citations on slides (sources live in the notes).

## The brief

| | |
|---|---|
| **Talk** | ZurichJS Conf retrospective, by Faris Aziz |
| **Slot** | 40 minutes, any audience |
| **Goal** | Show how ZurichJS Conf was pulled off: operationally, financially, technically |
| **Format** | No demos. Numbers, charts, and the venue in 3D |
| **The conference** | ZurichJS Conf 2026, 9 to 12 September 2026, Technopark Zürich. Workshops 10 Sep, main day 11 Sep (to confirm) |
| **Data source** | `zurichjs-conf-retro-handoff.md` (all numbers, sources and caveats). This document does not repeat the data appendix |

## What isn't working (starting points for discussion)

- **Length is not the problem, the shape is.** 104 slides, plus a 35-second autoplaying globe: roughly 26 minutes at about 15 seconds a slide, inside a 40-minute talk. There is room to slow down and tell the story; what is missing is a thread, not time.
- **Numbers without a thread.** Long runs of big-number slides in a row (chapter 2 has 15 slides, chapter 5 has 20). Each number is true, but few of them move the story forward. Most could be one chart, or cut.
- **The setup is never paid off.** Chapter 2 promises "three problems, each forced a decision" (sponsor budgets, price-sensitive buyers, AI submissions). Chapters 3 to 5 never say which decision answers which problem, so the structure is invisible to the audience.
- **The human story is missing.** The four places where only Faris (and the team) can speak are empty: W1 the meetup itch, M1 brand and design, R1 the personal highs and lows, O5 the next edition date. Without them it is a data report, not a story.
- **Decided: the story starts at the 1st anniversary** (Pause im Foifi, 14 Nov 2025), where conf.zurichjs.com went live five minutes before the meetup. It then flies to Technopark, "ten months later". What follows the venue flyover still needs a thread: it restarts at "359 people".
- **Venue views were picked for looks, not meaning.** Chapter openers land on views that look good (the rig for "the rollercoaster", the wall for "a hard year") rather than places that mean something for that part of the story.
- **Decided: ZurichJS on the road follows the meetup numbers**, still at Foifi, before the flight to Technopark: the trips that marketed the conference, met speakers and closed sponsor deals.
- **Unverified claims carry a whole chapter.** Chapter 2's industry context (React Advanced -50%, renames, last editions, layoffs) is per Faris and unverified. Either source it or soften it.
- **Two placeholders** for the Front Conference screenshots (`front-cancel.png`, `front-book.png`) are not in this repo yet.

## The 3D venue: what we can show

Every slide is shown either full screen or inside a 3D rebuild of the venues: Pause im Foifi (Digitec Galaxus) on the night of the 1st anniversary, and Technopark Zürich as it was on the day. Moving between slides walks the camera through the venue at eye level (through the booth window, the back doors, the hallway), with no cuts; between Foifi and Technopark it flies over the city. In the hall, the foyer and the booth, the slide itself is visible on a screen (main screen, side screens, the foyer projection, the booth monitors), so story slides can play *inside* the venue.

| View | What the camera sees | Slide readable? | Good for |
|---|---|---|---|
| `projector` | Into the lens of Foifi's ceiling projector: the slide fills the frame | Yes, full size | The opening; backs out of the projector's eye and flips round to the screen |
| `foifi-full` | Foifi's projector screen filling the frame | Yes, full size | Charts at the anniversary (the meetup numbers) |
| `foifi` | Pause im Foifi from the back row: glazing onto the street, canopy of plants, colourful chairs | Yes, smaller | Where it started: the 1st anniversary |
| `foifi-screen` | Close on Foifi's projector under the hanging plants | Yes | Story slides at the anniversary |
| `deploy` | Over the laptop that shipped conf.zurichjs.com | Yes, on the laptop | The launch moment |
| `cake` | The birthday cake on the "new Date()" flyer | No | One year of ZurichJS |
| `screen` | The slide, filling the Technopark projector | Yes, full size | Charts and anything with detail |
| `stage` | Main screen, podium, foam letters, rig, from the seats | Yes | Talks, the programme, the big moments |
| `room` | The whole hall from the back corner, seats empty | Yes, smaller | "359 people", opening and closing |
| `letters` | Low along the foam ZurichJS letters | Partly | Brand, identity, "why we started" |
| `podium` | Behind the lectern, looking out at the seats, doors, booth window | No (screen behind) | A personal moment, the speaker's view |
| `rig` | Up in the lighting rig, looking down at the stage | Yes, at an angle | Behind the scenes, production |
| `wall` | Down the aisle along the warm wood wall | Yes, small | Quiet, reflective beats |
| `booth` | Behind two operators at the tech desk, sponsor loop on a monitor | Yes, through the glass | The team, the machine, operations |
| `foyer` | Registration: backdrop, check-in desks, queue, projection wall | Yes, on the wall | Tickets, check-in, the door |
| `badges` | Close-up of all nine badge types on the counter | No | Who came: roles, numbers |
| `merch` | Cups (engraved logo) and totes on the volunteer desk | No | Volunteers, merch, the details |
| `atrium` | Technopark atrium from above: galleries, pendants, tables | No | Arrival, the community, breaks |
| `booths` | Sponsor booths: AG Grid, namespace, PrimeUI, CopilotKit, ZurichJS | No | Sponsors and money |
| `map` | The whole venue as a labelled cutaway from above | No | Orientation, the "where it happened" overview |

Other assets in the deck: the four organiser photos, all 24 sponsor logos (from conf.zurichjs.com), the nine badge designs, the Zurich skyline, the conference backdrop, the community roll-up.

## Slide building blocks

| Block | What it is | Use for |
|---|---|---|
| Title | Kicker, big title, subtitle | Cover, closing |
| Section | Chapter number + title, yellow | Chapter openers |
| Statement | One sentence with an emphasised phrase, optional kicker | The claim of a chapter, a lesson |
| Big number | One huge number with a line of context | The single number that matters |
| Flip calendar | Split-flap calendar rolling between two dates | Time jumps (rolling back a year) |
| Growth chart | Lines growing from their start; the next slide can continue them | Growth since a starting point |
| Heatmap | Rows of shaded cells with values and totals | Seasonality, year over year |
| Number tiles | 2 to 6 numbers side by side | Breakdowns (where 359 comes from) |
| Bar chart | Horizontal bars, highlight in yellow | Trends and comparisons |
| Quote | A pull quote with author | Survey quotes (12 respondents agreed to be named) |
| Image | A photo or screenshot | Front Conference notice, event photos |
| List | A short mono list | Agendas |
| Globe | Flights on a 3D globe, with faces | The road to Zurich |

Colour has fixed meanings across the talk: yellow = the point, blue = context, green = good, orange = warning, red = errors and failure only. The deck is arrows only: every beat is its own slide (no Enter builds).

## The current storyline

104 slides. "View" is where the camera is for that slide. "Notes" are the speaker notes, including the flags from the handoff (UNVERIFIED, CHECK, DATA GAP, FARIS).

### Where it started (decided) · *ZurichJS 1st anniversary, Pause im Foifi*

| # | Slide | Block | On screen | View | Notes | Team decision |
|---|---|---|---|---|---|---|
| 1 | `cover` | Title (yellow) | The ZurichJS team · ZurichJS Conf retrospective · 9 to 12 September 2026, Zurich | Into the projector's lens, full screen | Full screen. The next slide backs out of the projector's eye and flips round to the screen at Pause im Foifi. | keep |
| 2 | `anniversary` | Statement | 14 November 2025 · Pause im Foifi · ZurichJS turned one. Digitec Galaxus gave us the room. | Foifi, from the back row | CHECK the date: 14 Nov per Faris; events page and handoff say 13 Nov. | keep |
| 3 | `go-live` | List | conf.zurichjs.com · anniversary night · T−5 min conf.zurichjs.com goes live · T−5 min ticket sales open · T−0 the anniversary meetup starts | The laptop that shipped it | Deployed and opened sales five minutes before the meetup started. | keep |
| 4 | `first-ticket` | Big number | #1 · The first ticket: Jonny Burger. | Foifi projector | | keep |
| 5 | `tshirt-bug` | List | Our first funny bug · Someone buys a t-shirt · → the payment hits the same webhook as tickets · → the webhook issues them a ticket | Foifi projector | | keep |
| 6 | `one-year` | Statement (yellow) | One year of ZurichJS. Ten months to the conference. | The birthday cake | Next slide flies from Foifi across Zurich to Technopark. | keep |
| 7 | `rollback` | Flip calendar | One year earlier · 14 Nov 2025 rolls back to Thursday 14 Nov 2024 · The ZurichJS meetup relaunch | Dive into the Foifi screen, full frame | Relaunch date from faziz-dev.com/events. | keep |
| 8 | `meetup-year` | Growth chart | The meetup's first year: 409 members (from 0), 634 RSVPs, 427 joined | Foifi screen, full frame | Meetup.com export 8 Nov 2026. The 257 pre-relaunch members treated as inactive (per Faris). | keep |
| 9 | `meetup-2026` | Growth chart (continues) | Two years of the meetup, to 8 Nov 2026: 844 members, 1,435 RSVPs, 939 joined | Foifi screen, full frame | The lines continue from where year one ended. | keep |
| 10 | `meetup-rsvps` | Heatmap | RSVPs per month: year one peaked in spring (96 Mar, 114 Apr) | Foifi screen, full frame | CHECK which meetups the peaks were. | keep |
| 11 | `meetup-rsvps-2026` | Heatmap (adds a row) | Year two busier in 8 of 12 months: 810 vs 636 (whole months Nov to Oct) | Foifi screen, full frame | | keep |
| 12 | `road` | Globe | Globe: autoplays all 19 trips (Nov 2025 to Aug 2026), then totals: 16 trips · 31 events · 13 countries · ~89k km · 4 team trips | Foifi screen, full frame | NEW (not in the handoff). Plays by itself, about 35 s: starts at React Summit US, New York, then flies every trip in date order (19 stops) and lands on the totals. No keys needed; → moves on. From faziz-dev.com/events, Nov 2025 to Aug 2026. Blue = team trips: React Vienna, ReactJS Milano and jsday, CityJS London, JSHeroes; Voxxed Days Zurich is at home. ASSUMED: return trips from Zurich except Milan → Bologna and Warsaw → Cluj; km is great-circle. | |

### Opening

| # | Slide | Block | On screen | View | Notes | Team decision |
|---|---|---|---|---|---|---|
| 13 | `people-359` | Big number | 359 · People in the room | Hall, back corner | 330 ticket holders, plus 19 speakers and MCs without a ticket, plus 10 staff without a ticket. | |
| 14 | `people-split` | Number tiles | Where 359 comes from · 267 (Paid tickets) · 63 (Complimentary tickets) · 19 (Speakers and MCs without a ticket) · 10 (Staff and volunteers without a ticket) | Screen (full frame) | 21 people on stage, 2 of whom also held a ticket. 13 door staff, 3 of whom held a ticket. | |
| 15 | `year-numbers` | Number tiles | A year in numbers · 434 (Talk submissions) · 1,336 (Commits) · 21 (Countries in the room) · 53,277 (Slack messages) | Screen (full frame) |  | |
| 16 | `chapters` | List | Eight chapters · Why on earth · A hard year · The machine · Building the programme · Filling the room · The rollercoaster · What we learned · The final numbers | Screen (full frame) | Each problem in chapter 2 gets its answer later. | |

### Venue flyover (optional)

| # | Slide | Block | On screen | View | Notes | Team decision |
|---|---|---|---|---|---|---|
| 17 | `venue-map` | Statement | Technopark Zürich · One building, one week, one conference. | Venue map (cutaway) | OPTIONAL flyover (5 slides). Cutaway of Technopark: auditorium, booth, foyer, atrium. | |
| 18 | `venue-atrium` | Statement | The atrium · Sponsors, coffee, and every hallway conversation. | Atrium, from above | OPTIONAL. The atrium: tables, pendants, lift tower. | |
| 19 | `venue-booths` | Statement | Sponsor booths · The people who paid for the room. | Sponsor booths | OPTIONAL. AG Grid booth, ZurichJS roll-up, namespace wall beyond. | |
| 20 | `venue-badges` | Statement | Check-in · Nine kinds of badge. | Badges on the counter | OPTIONAL. All nine badge kinds on the check-in counter. | |
| 21 | `venue-merch` | Statement | Volunteer merch desk · Cups and totes. | Merch table | OPTIONAL. Volunteer merch desk: cups and totes. | |

### 1 · Why on earth · *Where it came from*

| # | Slide | Block | On screen | View | Notes | Team decision |
|---|---|---|---|---|---|---|
| 22 | `ch1` | Section | 01 · Where it came from · Why on earth | Low along the foam letters |  | |
| 23 | `meetup-itch` | Statement | Data gap · W1 · It started at the meetup. Your story: the itch. | Screen (full frame) | DATA GAP W1: Faris writes this. | |
| 24 | `front-cancel` | Statement | Screenshot missing · front-cancel.png · Zurich's Front Conference cancelled Front 26. | Screen (full frame) | Needs front-cancel.png (in the old deck repo). Zurich's front-end conference for 10+ years. Front 26 was planned for 27 Feb 2026 at Alte Papierfabrik. Ticket demand was "way off, both via B2C and B2B channels", even after scaling to one day. Per Faris: two revival attempts (Q4 2025, Q1 2026) did not happen. | |
| 25 | `front-book` | Statement | Screenshot missing · front-book.png · And told everyone to book ZurichJS Conf. | Screen (full frame) | Needs front-book.png. Their notice lists conf.zurichjs.com first. Front Conference Zurich also bought 6 tickets by company invoice. | |
| 26 | `dying` | Statement (yellow) | Everyone said tech events were dying. So we started one. | Screen (full frame) |  | |
| 27 | `first-commit` | Big number | 3 Nov 2025 · First commit. First ticket sold ten days later. | Screen (full frame) | First ticket 13 Nov 2025. FARIS: replace with the date you decided, if different. | |

### 2 · A hard year · *Three problems*

| # | Slide | Block | On screen | View | Notes | Team decision |
|---|---|---|---|---|---|---|
| 28 | `ch2` | Section | 02 · Three problems · A hard year | Along the wood wall |  | |
| 29 | `hardest-year` | Statement | One of the hardest years in a decade to run a JavaScript conference. | Screen (full frame) |  | |
| 30 | `react-advanced` | Big number | −50% · Ticket sales at React Advanced London | Screen (full frame) | UNVERIFIED (per Faris). | |
| 31 | `react-alicante` | Big number | −200 · Seats at React Alicante versus last year | Screen (full frame) | UNVERIFIED. | |
| 32 | `renamed` | Number tiles | Conferences renamed themselves · Web Engineering London (Was React Advanced) · CityAI (Was CityJS) | Screen (full frame) | UNVERIFIED. | |
| 33 | `last-editions` | Number tiles | Or announced their last edition · React India (Last edition this year) · JSWorld (2027 is the last) · Devoxx Belgium (2027 likely the last) · Front Conference (Front 26 cancelled) | Screen (full frame) | UNVERIFIED except Front 26 (sourced from the frontconference.com screenshot). | |
| 34 | `layoffs` | Statement | Layoffs everywhere. Sponsorship budgets cut. | Screen (full frame) | Netflix, Google, Microsoft, Canva, Smallpdf. Smallpdf was our Gold sponsor: decide whether to name companies. | |
| 35 | `sponsor-tiers` | Bar chart | Half our sponsors were the smallest tier · Paid sponsor deals by tier · Platinum 2 · Gold 2 · Silver 3 · Bronze 5 · Supporter 12 | Screen (full frame) | Platinum alone brought about CHF 27k. | |
| 36 | `no-diamond` | Big number | 0 · Diamond sponsors. One cancelled, one never left draft. | Screen (full frame) |  | |
| 37 | `money-late` | Bar chart | And the money came late · Sponsor deals paid per month, 2026 · Feb 1 · Mar 0 · Apr 0 · May 7 · Jun 1 · Jul 5 · Aug 7 · Sep 3 | Screen (full frame) | 15 of 24 were paid in the last three months. | |
| 38 | `price-sensitive` | Statement | Faris adds what he saw · Buyers were price-sensitive. | Screen (full frame) | FARIS: add what you saw. | |
| 39 | `expensive` | Big number | 14 · Of 112 survey respondents found it expensive. 98 said good, excellent or just right. | Screen (full frame) |  | |
| 40 | `ai-changed` | Statement | AI changed what people submitted. | Screen (full frame) | FARIS: opinion to add. | |
| 41 | `ai-share` | Big number | 40% · Of CFP submissions mentioned AI. 171 of 428 analysed. | Screen (full frame) | Keyword-based. | |
| 42 | `three-problems` | Statement (yellow) | Three problems. Each forced a decision. | Screen (full frame) | FARIS to confirm the links: sponsor budgets → ch3 (tiny team, one app); AI submissions → ch4 (programme picks); price-sensitive buyers → ch5 (discounts, partner codes, invoices, currencies). | |

### 3 · The machine · *Four people, day jobs, one app*

| # | Slide | Block | On screen | View | Notes | Team decision |
|---|---|---|---|---|---|---|
| 43 | `ch3` | Section | 03 · Four people, day jobs, one app · The machine | Control booth | Camera in the control booth: the crew behind the glass. | |
| 44 | `small-team` | Number tiles | A small team, and an admin that did the rest · 4 (Organisers) · 15 (CFP reviewers) · 13 (Door staff) | Screen (full frame) | Admin areas: tickets, workshops, CFP and reviewers, speaker travel, sponsorships, partnerships, company invoices, VIP perks, apparel, door check-in. CONFIRM organisers: Faris, Bogdan, Nadja, Colin. | |
| 45 | `slack-people` | Bar chart | Four people, 51,202 messages · Active days: Faris 396 · Bogdan 382 · Nadja 327 · Colin 327 · Faris 20,354 · Bogdan 19,954 · Nadja 6,979 · Colin 3,915 | Screen (full frame) | About 129 messages a day. | |
| 46 | `slack-share` | Big number | 96% · Of all Slack messages came from the four of us. 51,202 of 53,277. | Screen (full frame) | 88% were in private channels. | |
| 47 | `slack-days-off` | Big number | 3 · Days without a single message, out of 397. | Screen (full frame) | 15% of messages were sent on weekends. | |
| 48 | `slack-peak` | Big number | 836 · Messages on 3 September. Our busiest day, a week before doors opened. | Screen (full frame) | August was the busiest month at 8,265. Top days: 3 Sep 836, 1 Sep 744, 4 Aug 705. | |
| 49 | `brand` | Statement | Data gap · M1 · Brand and design. | Screen (full frame) | DATA GAP M1: Faris writes this. | |
| 50 | `timeline` | Number tiles | Ten months from first commit to the door · 3 Nov (2025 · First commit) · 13 Nov (2025 · First ticket sold) · 29 Dec (2025 · CFP opens) · 3 Apr (2026 · CFP closes) · 31 Aug (2026 · Door check-in ships) · 9–12 Sep (2026 · Conference week) | Screen (full frame) | Old deck revealed these one per click; one slide in this draft. | |
| 51 | `commits` | Bar chart | 1,336 commits · Commits per month · busiest week 27 Jul to 2 Aug, 91 commits · Nov 137 · Dec 87 · Jan 96 · Feb 116 · Mar 83 · Apr 158 · May 191 · Jun 92 · Jul 173 · Aug 104 · Sep 99 | Screen (full frame) |  | |
| 52 | `agent-prs` | Big number | 58% · Of 281 PRs came from agent branches. 145 Claude · 11 Cursor · 8 Codex. | Screen (full frame) | The first PR (5 Nov 2025) was already from a claude/ branch. | |
| 53 | `agent-share` | Bar chart | From helper to default · Agent share of merged PRs · Nov 12% · Dec 50% · Jan 0% · Feb 53% · Mar 55% · Apr 47% · May 28% · Jun 68% · Jul 89% · Aug 85% · Sep 71% | Screen (full frame) |  | |
| 54 | `my-job` | Number tiles | My job changed · 56 → 1 (My own commits, May to August) · 119 (Agent commits in July) | Screen (full frame) |  | |
| 55 | `app-grew` | Number tiles | What the app grew into · 1 → 133 (Test files) · 266 (API route files) · 108 (Database migrations) | Screen (full frame) |  | |

### 4 · Building the programme · *434 ideas, 9 picked*

| # | Slide | Block | On screen | View | Notes | Team decision |
|---|---|---|---|---|---|---|
| 56 | `ch4` | Section | 04 · 434 ideas, 9 picked · Building the programme | Stage, from the seats | 3 of the 6 workshops were AI topics. | |
| 57 | `submissions` | Number tiles | 434 talk submissions · 347 (Talks) · 47 (Lightning talks) · 40 (Workshops) | Screen (full frame) |  | |
| 58 | `final-week` | Bar chart | A quarter arrived in the final week · CFP submissions per week, 29 Dec to 3 Apr · Week 1 44 · Week 2 33 · Week 3 30 · Week 4 18 · Week 5 8 · Week 6 23 · Week 7 6 · Week 8 12 · Week 9 14 · Week 10 9 · Week 11 18 · Week 12 38 · Week 13 60 · Week 14 121 | Screen (full frame) | 121 of 434 (28%). | |
| 59 | `reviews` | Big number | 2,489 · Reviews from 15 reviewers. About 166 each. | Screen (full frame) | 267 speakers applied, about 1.6 submissions each. | |
| 60 | `accepted` | Big number | 9 · Accepted from 434. 6 talks, 3 workshops, 5 waitlisted. | Screen (full frame) | About 2%. The rest of the programme was invited. | |
| 61 | `fundamentals` | Number tiles | But attendees asked for fundamentals · 75 (Want more JS and TS deep dives) · 48 (Want more AI) | Screen (full frame) | Case studies 71, performance 66. | |
| 62 | `speakers-flew` | Bar chart | 18 of 21 speakers flew in · 5 from North America · 9 countries · 3 did not fly · USA 3 · Germany 3 · Canada 2 · Netherlands 2 · Austria 2 · UK 2 · Spain 2 · Czechia 1 · Portugal 1 | Screen (full frame) | Departure airport country, not home country. | |
| 63 | `workshops` | Big number | 6 · Workshops, 80 seats. Workshop day, 10 September. | Screen (full frame) | Registrations: 17, 10, 9, 16, 22, 6. CONFIRM workshop day was 10 Sep. | |

### 5 · Filling the room · *Price, channels, people*

| # | Slide | Block | On screen | View | Notes | Team decision |
|---|---|---|---|---|---|---|
| 64 | `ch5` | Section | 05 · Price, channels, people · Filling the room | Foyer, check-in | Camera in the foyer: this slide is projected on the wall above check-in. | |
| 65 | `price-stages` | Bar chart | Five price stages · Paid tickets per stage · Blind bird 20 · Early bird 81 · General 110 · Late bird 37 · Last minute 19 | Screen (full frame) |  | |
| 66 | `when-bought` | Bar chart | When people bought · Paid tickets per month · Nov 3 · Dec 16 · Jan 10 · Feb 22 · Mar 35 · Apr 21 · May 11 · Jun 34 · Jul 50 · Aug 39 · Sep 26 | Screen (full frame) |  | |
| 67 | `last-100-days` | Big number (yellow) | 56% · Of paid tickets sold in the last 100 days. 149 of 267, from 1 June. | Screen (full frame) | FARIS: add the deadline lesson. | |
| 68 | `ways-in` | Number tiles | So we built ways in · 96 (Tickets with a discount code) · 33 (Student and unemployed tickets) · 41 (Via community partner codes) | Screen (full frame) |  | |
| 69 | `invoices` | Big number | 30 · Company tickets, all paid by invoice. 9 invoices, all bank transfer. | Screen (full frame) | About a tenth of ticket revenue. | |
| 70 | `currencies` | Big number | 1 in 5 · Tickets paid in EUR, GBP or USD. 55 EUR · 5 GBP · 4 USD. | Screen (full frame) |  | |
| 71 | `heard-from` | Bar chart | 1 in 3 heard from a friend or colleague · How survey respondents heard about it (106 answered) · Friend or colleague 38 · Meetup 20 · Web search 17 · Social 16 · Speakers 9 | Screen (full frame) |  | |
| 72 | `partners` | Big number | 80 · Community partners. 41 tickets, 24 of them from outside Switzerland. | Screen (full frame) | 62 communities, 13 companies, 5 individuals. Top: WarsawJS 5, ReactJS Barcelona 4. | |
| 73 | `august-traffic` | Bar chart | Ads made August look huge · Visitors per month · about 7,500 of August came from ads · Dec 565 · Jan 1,618 · Feb 862 · Mar 1,048 · Apr 1,072 · May 1,324 · Jun 2,556 · Jul 3,193 · Aug 10,385 · Sep 4,408 | Screen (full frame) | Retitled per handoff Part E: August is 18× December, and about 7,500 of August's visitors came from ads. | |
| 74 | `newsletter` | Big number | 1,215 · Visitors from one newsletter on 28 July. One of the busiest days before the event. | Screen (full frame) |  | |
| 75 | `ads` | Number tiles | Ads brought traffic, not buyers · 0.28% (25 of 8,901 ad visitors bought) · 0.85% (131 of 15,364 everyone else) | Screen (full frame) | Reddit ads: 919 visitors, 0 checkouts. | |
| 76 | `cart` | Big number | 1 in 4 · Cart viewers went on to check out. Most dropped off at the details step. | Screen (full frame) | 631 viewed the cart, 162 entered an email, 156 completed checkout. | |
| 77 | `countries` | Big number | 21 · Countries. 2 in 3 paid tickets from Switzerland. | Screen (full frame) |  | |
| 78 | `abroad` | Bar chart | Germany first, then everyone · Paid tickets from outside Switzerland · Germany 26 · Austria 10 · UK 7 · Spain 7 · USA 7 · Netherlands 5 · Poland 5 · Croatia 4 | Screen (full frame) |  | |
| 79 | `swiss-early` | Bar chart | Swiss bought early, everyone else later · International share of paid tickets by stage · Blind bird 6% · Early bird 22% · General 44% · Late bird 38% · Last minute 26% | Screen (full frame) | Inference: locals trust the meetup; travellers wait for the lineup. | |
| 80 | `vip-travel` | Big number | 3× · More likely to buy VIP if travelling. 35% of international vs 11% of Swiss. | Screen (full frame) |  | |
| 81 | `company-types` | Bar chart | Product companies and agencies · Paid tickets by company type (keyword classification, rough) · Product 94 · Agency 81 · Indie 27 · Enterprise 25 · Finance 21 · Other 16 · Education 3 | Screen (full frame) | CHECK the company-type classification. | |
| 82 | `agencies-local` | Number tiles | Agencies were local, product teams travelled · 74% (Of agency tickets from Switzerland) · 43% (Of product-company tickets from abroad) | Screen (full frame) |  | |

### 6 · The rollercoaster · *Highs and lows*

| # | Slide | Block | On screen | View | Notes | Team decision |
|---|---|---|---|---|---|---|
| 83 | `ch6` | Section | 06 · Highs and lows · The rollercoaster | Up in the lighting rig |  | |
| 84 | `hi-final-week` | Big number | 121 · Submissions in the final week. High · 30 Mar to 3 Apr 2026. | Screen (full frame) |  | |
| 85 | `lo-1000-rows` | Big number | 1,000 · Rows: a silent limit hid CFP reviews. Fixed days before the CFP closed. Low · 31 Mar 2026. | Screen (full frame) |  | |
| 86 | `lo-178` | Big number | #178 · Removed an obfuscated malicious payload hidden in a build config. Low · 25 May 2026. | Screen (full frame) |  | |
| 87 | `hi-july` | Big number | 50 · Tickets sold, our best month. High · July 2026. | Screen (full frame) |  | |
| 88 | `door-prs` | Big number | 14 · Door check-in PRs merged in one day, 9 days before the event. Low and high · 31 Aug. | Foyer, check-in | Camera at the door: this is where check-in ran. | |
| 89 | `arrivals` | Bar chart | Everyone arrives at once · Door scans per 10 minutes from 07:40, 11 Sep · 07:40 5 · 07:50 6 · 08:00 12 · 08:10 24 · 08:20 21 · 08:30 29 · 08:40 20 · 08:50 11 · 09:00 5 · 09:10 8 · 09:20 2 · 09:30 2 | Screen (full frame) |  | |
| 90 | `busiest-day` | Big number | 5,067 · Pageviews: the busiest day of the year. 69% on mobile. /schedule opened 3,729 times over 4 days. | Screen (full frame) |  | |
| 91 | `badges` | Number tiles | On the day · 253 (Badges picked up of 330 tickets) · 222 (T-shirts) · 204 (Goodie bags) | Foyer, check-in | CHECK: badges (253) or door scans (156) as the attendance number. | |
| 92 | `not-in-data` | Statement | Data gap · R1 · The ones not in the data. | Screen (full frame) | DATA GAP R1: personal highs and lows. | |

### 7 · What we learned · *For anyone who wants to organise something*

| # | Slide | Block | On screen | View | Notes | Team decision |
|---|---|---|---|---|---|---|
| 93 | `ch7` | Section | 07 · For anyone who wants to organise something · What we learned | Hall, back corner |  | |
| 94 | `execution` | Statement | Execution · The plan only counts at the door. | Screen (full frame) | Best-rated: organisation and logistics, 3.7 of 4. Weakest: food and drinks, 3.2 of 4. | |
| 95 | `distribution` | Statement | Distribution · Reach people where they buy. | Screen (full frame) |  | |
| 96 | `pragmatism` | Statement | Pragmatism · One app, a boring stack, agents for the grind. | Screen (full frame) |  | |

### 8 · The final numbers · *Did it add up?*

| # | Slide | Block | On screen | View | Notes | Team decision |
|---|---|---|---|---|---|---|
| 97 | `ch8` | Section | 08 · Did it add up? · The final numbers | Stage, from the seats |  | |
| 98 | `income` | Bar chart | Where the money came from · CHF · roughly 170k in · about 2.4k Stripe fees · Sponsorship 81k · Tickets 75k · Workshops 14k · VIP upgrades 1k | Screen (full frame) | Admin income may be off by up to about 5%. Costs are not in the admin. | |
| 99 | `add-up` | Statement | Did it add up? | Screen (full frame) | Pause. The next slide is the answer. | |
| 100 | `add-up-answer` | Statement (yellow) | Just over break even, on roughly CHF 170k of income. | Screen (full frame) |  | |
| 101 | `rating` | Big number | 4.6 · Out of 5 overall. 112 survey responses, 110 rated 4 or 5. | Screen (full frame) |  | |
| 102 | `come-back` | Big number (yellow) | 88% · Of survey respondents want to come back. 99 of 112. | Screen (full frame) | 61 Absolutely, 38 "I'll try". | |
| 103 | `thanks` | Number tiles | Thank you · 24 (Sponsors) · 80 (Community partners) · 21 (Speakers and MCs) · 13 (Door staff and volunteers) | Stage, from the seats | CHECK: 13 door staff vs 14 volunteers on the dashboard. | |
| 104 | `come-2028` | Number tiles | Data gap · O5 · next edition date · Come in 2028 · Come back (As an attendee or speaker) · Volunteer (Help us run the next one) · Start your own (Execution, distribution, pragmatism) | Hall, back corner | DATA GAP O5: next edition date. Optional movie. | |

## Open questions to resolve

- [ ] The anniversary date: 14 Nov 2025 (Faris) vs 13 Nov (events page, and the handoff's first-ticket date). Also fixes the "first ticket ten days after the first commit" line.
- [ ] May we show the Digitec Galaxus logo on the anniversary slide? (Not in the deck yet.)
- [ ] Which meetups drove the RSVP peaks (Mar/Apr 2025, Jan 2026)?
- [ ] Meetup start time on anniversary night, if we want real clock times instead of "T−5 min".
- [ ] W1: the meetup itch. Why did we start? (Faris)
- [ ] M1: brand and design story. (Faris, with whoever led design)
- [ ] R1: personal highs and lows that are not in the data. (the four organisers)
- [ ] O5: next edition date, and whether the closing ask is "come in 2028".
- [ ] Chapter 2 industry context (React Advanced, React Alicante, renames, last editions, layoffs): source it, soften it, or cut it. Decide whether to name Smallpdf (our Gold sponsor) under layoffs.
- [ ] Attendance: 253 badges picked up or 156 door scans? Pick one number and say why.
- [ ] Organisers: confirm the four names (Faris, Bogdan, Nadja, Colin) and the 13 door staff vs 14 volunteers.
- [ ] Workshop day: 10 Sep or another day?
- [ ] Company-type classification is keyword-based and rough: keep with a caveat, or drop.
- [ ] Road to Zurich: confirm the trip list (Nov 2025 to Aug 2026), the team trips, and that km (great-circle, return trips from Zurich) is fair to show.
- [ ] The movie: show it at the open, at the close, or not at all?
- [ ] Front Conference screenshots: add `front-cancel.png` and `front-book.png` to the deck repo.

## The reworked storyline (to fill in)

Target: a 40-minute talk. At about 15 seconds a slide that allows up to about 150 slides; fewer if key slides get time to breathe. One row per slide, in order. This format maps one-to-one onto the deck, so it can be built directly.

- **Block**: one of the building blocks above.
- **On screen**: the exact visible text and numbers (sentence case; every number must exist in the handoff data).
- **View**: one of the venue views above, or `screen`.
- **Says**: what the speaker says (speaker notes).
- **Answers**: which of the three problems (or chapter promise) this slide pays off, if any.

| # | Chapter | Block | On screen | View | Says | Answers |
|---|---|---|---|---|---|---|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |

