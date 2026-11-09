# ZurichJS Conf retrospective: storyline for rework

Working document for the team. It captures the storyline **as it is in the deck today** (`src/content/slides.ts` and `visuals.ts`, snapshot 2026-11-08), so we can rework the story together. The reworked version of this file is what the final slides get built from.

> The 3D venue and the slide building blocks are in good shape. **The storyline is not.** Rework the story here; leave the visuals to the deck.

## Cuts, merges and the chapter 6 split, 9 Nov 2026

- **Cut (pure repeats):** `year-numbers`, `submissions`, `final-week`, `hi-final-week`, `countries`, `abroad`, `speakers-flew`, `hi-july`, `last-100-days`, `badges`, `timeline`, `fundamentals`, `last-front`, `stakes-covered`, `lo-1000-rows`.
- **Merged:** `meetup-rsvps` into `meetup-rsvps-2026` (both rows draw in); `slack-share` into `year-slack`; `agent-prs` into `agent-share`; `ads-when` into `august-without-ads`; `buyers-from` into `ads`; `atm-companies` into `pressure-top`; `value-room` into `atm-value` (its line is now the ATM message); `dying` into `why-missing` (now yellow: "Zurich deserved another international web conference. So we started one.").
- **Chapter 6 split:** 6 · The rollercoaster (the year's highs and lows, the inbox) and a new 7 · The week and the day (the space, the stage videos, the letters, Wi-Fi, the airport, the doors, the booth, transitions). What we learned is now 8, The final numbers 9.
- **Last slide:** "Start your own" became "Bring your team"; the data-gap kicker is off the screen.

## Revision batches 1 and 2, 9 Nov 2026

Shares and counts only on slides; the only CHF amounts are the minimums and public list prices.

| Slide | Change |
|---|---|
| `anniversary` | Digitec Galaxus offered their venue, where Bogdan and Faris first met. |
| `go-live` | Camera closer to the laptop; larger code type. |
| `tshirt-bug` | Same steps, larger type. |
| `meetup-year` | More space between the end labels and the date axis. |
| `meetup-rsvps-2026` | "Year two beat year one in 8 of 12 months" (Nov to Oct, completed months). |
| `chapters`, `no-diamond`, `price-sensitive`, `meetup-itch`, `lesson-diamond`, `atm-repitch`, `ai-changed` | **Cut** or replaced. |
| `why-fresh`, `why-home`, `why-missing` | **New**: why a conference; Front passed the baton (`front-book` retitled). |
| `stakes-100k` | CHF 100k* with the bare-minimum footnote. |
| `spend` | **New**: share of spend by line (organisers' estimate). Venue hire missing from the estimate. |
| `stakes-no-cancel` | Timeline: committed 12 months out, exits expire, viability 1 to 3 months out, conference day. |
| `stakes-split` | CHF 33k each, at least. |
| `stakes-worst` | **New**: fees, refunds, lost payment fees, penalties; worst case about double the minimum. |
| `first-commit` | Timeline: 3 Nov 2025 first commit, 13 Nov first ticket. |
| `sponsor-tiers` | "Your first conference is a hard sell"; 12 of 24 at the smallest tier. |
| `sponsor-pipeline`, `deal-fails` | **New**: hundreds of conversations, 24 signed; withdrew, laid off, pivoted, +20% penalty (GDPR in notes). |
| `sponsor-prices` | Source line removed (kept in notes). |
| `sponsor-get` | Verified against 2026 packages: lead capture, workshop, talk rows corrected. |
| `sponsor-talks`, `refuse-talks` | CHF conversions; speaking slots not for sale; the CHF 15k offer. |
| `money-late` | 12 months committed; 15 of 24 sponsor deals paid in the last three months; 56% of tickets in the last 100 days. |
| `expensive` | Survey split: too expensive 3, slightly 11, just right 27, good 41, excellent 30 (n = 112). |
| ATM run | `atm-ask` (empty), `atm-sponsors` (options), `atm-talk` (red), `atm-declined` (TRANSACTION DECLINED), `pitch-time`, `atm-ai` (request received), `pressure-top`, `atm-companies`, `atm-value`, `value-room`, `pressure-bottom`, `atm-speakers`, `ai-share`, `atm-attendees`, `atm-taste`, `substance`, `value-props`. |

## Review pass, 9 Nov 2026

From the retrospective review. Not a redesign: the journey stays (Foifi, a year earlier, funding and travel, Technopark, the day, outcomes). Where the review said "maybe" or "we need to decide", it is listed under decisions, not built.

### Change log, slide by slide

| Slide | Change |
|---|---|
| `meetup-year`, `meetup-2026`, `meetup-rsvps`, `meetup-rsvps-2026` | Grey source lines removed from the slides (sources stay in the notes). |
| `stakes-split` | Unchanged on screen. Notes: the CHF 33k-each proposal, held until approved. |
| `renamed-react-advanced` | Kicker now "Even the meetups renamed themselves": only the meetup series became Web Engineering London. |
| `renamed-cityjs` | **Cut.** CityAI is a new event from the CityJS team, not a rename. |
| `last-jsworld` | **Cut.** Contradicted: their site calls 2027 the 10th edition, not the last. |
| `last-react-india` | Now sourced (reactindia.io: 2026 is the 7th and final edition). |
| `react-advanced`, `react-alicante`, `last-devoxx-be` | Unchanged; notes say no public source was found. See decisions. |
| `sponsor-get` | A muted **?** now means "not listed on their pages"; **✗** (now in white) means "known not included". |
| `value-grid` | Same: **?** means not listed (muted), **NO** means not included (white). Recordings for Berlin and Summit, and lunch for JSWorld, changed from ? to YES (from their official pages). |
| `vip-invested` | Title "Once in, people went further" became "VIP buyers took more workshops". The notes no longer state sunk cost as the cause. |
| `affordable-idea` | Notes fixed: Geneva, Basel, Lausanne, Lugano and Bern are also over 100 in Numbeo, so the line is now "every European city outside Switzerland". |
| `road-moments` | Photos bigger on the seat-back screen (the current photo is about 45% larger). Totals now read "Countries in the photos" and "Months with photos"; the globe reads "Countries visited". |
| `venue-map` → `empty-seats` | The crane now comes down near-vertically over the auditorium instead of cutting past the office finger. |
| `people-split`, `price-stages` | "Complimentary" became **"Subsidised tickets"** (63). |
| `year-cfp` | Unchanged on screen. The bars grow together and show no shift in topics. Notes flag 106 AI and ML tags vs the 40% keyword count. |
| `year-slack` | **No names, no count per person.** The per-person bars became team figures: busiest day 836 (3 Sep), 3 days without a message, 15% on weekends. |
| `slack-people` | **Cut** (messages per organiser, by name). |
| `slack-days-off`, `slack-peak` | **Cut** (repeated on `year-slack`). |
| `commits` | **Cut** (the same monthly numbers as `year-commits`). |
| `story-volunteers`, `story-comms`, `story-workshops`, `story-space`, `story-control-room` | **New slots** for organiser stories (see below). |
| `ch3` to `ch8` | **Curtain**: a short fade to black into each chapter opener, then the next slide moves from that view to the screen. Replaces the fly-out and fly-in. |
| `when-bought` | Moved from the seats view to the full screen (the months were unreadable). |
| `ads` | Labels now separate "of site visitors" (40%) from "of ticket buyers" (4%, 8 of 180). New tile: 0.09% of Google Ads visitors bought, against 3.7% from our own channels. |
| `arrivals` (door scans) | Redesigned: one row of 12 cells, left to right in time, with only a few time labels. Title: "Busiest at 08:30: 29 people in 10 minutes". Kept on the venue screen. |
| `badge-frontload` | Percentages with their denominators: 19% (49 of all 253 badges), 68% (139 of the 204 picked up on the day). |
| `badges`, `badge-frontload`, `door-rhythm` | Moved from the foyer wall to the full screen (unreadable on the wall). |
| `income` | Shares only (47 / 44 / 8 / 1%); the amounts are in the notes. |
| `add-up-answer` | "Just over break even." (dropped the income total). |
| `stakes-covered` | "No shortfall to cover from our own pockets." The old line implied there were no costs. |
| `income` to `come-back` | The final numbers stay in the crowd (`stage` view) instead of flying to the screen. |
| `feedback-heard`, `next-edition` | **New slots** near the end (see below). |
| `mail-inbox`, `mail-sponsors`, `mail-after-yes`, `mail-speed` | **New**, ch 6 after `hi-july`: the email audit (6,857 messages, 1,449 sent; sponsors 3 days to a reply, 21 to sign, 55 the longest; much of the work after the yes; attendees answered in a median 87 min, speaker expenses in minutes, paid in up to 25 days). Sponsors and people stay unnamed. |
| `lo-last-payment` | **New**, ch 6 after `door-prs`: a sponsor payment and video ad arrived one day before the conference. |
| `space-empty`, `space-dressed` | **New**, ch 6 (Nadja): the atrium bare with delivery boxes two weeks out, then the dressing builds back, just in time. Replaces the `story-space` slot. |
| `videos-late`, `opening-video`, `speaker-intro`, `thanks-jonny` | **New**, ch 6: a week before there were no stage videos; the Remotion opener plays on the main screen (60 s, sound), a speaker walk-on video plays from the booth (20 s), then "Thank you, Jonny Burger." |
| `letters-cut` | **New**, ch 6 (Nadja): a hot wire cuts the foam stage letters out of a block, three days before. A reconstruction; no photos exist. |
| `podium-plug`, `wifi` | **New**, ch 6: the podium close-up, laptop to dock with one USB-C cable (screen, sound, wired internet), cables plugging in; Wi-Fi priced by concurrent devices: 300 quoted, 120 in budget, 250 bought. |
| `control-room` | **New**, ch 6 (Nadja): Bogdan in the booth all day with the technician. Replaces the `story-control-room` slot. |
| `airport-runs` | **New**, ch 6 (Nadja): cars shuttling between Technopark and the airport. |
| `speaker-runner`, `merch-guess` | **New**, ch 6 (Nadja): one person to bring every speaker to the stage on time; merch sizes for people we had not met (222 T-shirts, 33 hoodies on the day, 48 owed). |
| `story-volunteers` | Filled (Nadja): "We started recruiting volunteers far too late." |
| `plan-people` | **New**, ch 7: Nadja's quote, "You can plan every tiny logistical detail, but you can't plan people." |
| `airport-runs` | Speaker portraits over the cars (illustrative); delayed planes holding over the airport with DELAYED / HOLDING / MISSED CONNECTION tags. |
| `arrivals-board`, `arnau-rush`, `six-to-nine` | **New**, ch 6: Arnau's night on the airport board, his car racing to Technopark, landed 06:00 and teaching at 09:00. |
| `mic-up`, `walk-on`, `precision` | **New**, ch 6: an organiser mics up the next speaker in the wings, the camera follows them on stage to the podium, `podium-plug` plugs the laptop in, then "Seconds of precision kept the day on time" (about 0 minutes behind, 3 to 5 at worst). |
| Ch 6 order | Workshop day (airport, Arnau) now comes before conference day (doors, booth, transitions). |
| Notes | HANDOFF markers on `cover`, `ch3`, `brand`, `ch5` and `come-2028` (all to confirm). |

### Slots for organiser material (do not fill with drafted prose)

Nadja and Bogdan send voice notes or written points; Faris turns them into the story. Each slot is a placeholder slide, marked "Slot" on screen.

| Slot | Slide | Where |
|---|---|---|
| Finding and coordinating volunteers (filled from Nadja's notes; add more if wanted) | `story-volunteers` | Ch 3, after `small-team` |
| Communications with sponsors, speakers and attendees; recurring problems from the correspondence analysis | `story-comms` | Ch 3 |
| Workshops: the work of running them (one day or two? see decisions) | `story-workshops` | Ch 4, after `workshops` |
| Attendee feedback we actually received (kept apart from ideas for next time) | `feedback-heard` | Ch 8, after `come-back` |
| What comes next: the proposed two-day format, its community and technical angles. No name ("TBDConf" was floated, not chosen) | `next-edition` | Ch 8, after `thanks` |

The opening note on burnout and the workload stays off the slides: it is said outside them.

### Presenter handoffs (proposed, not assigned)

- **Open:** Dominic, with the duck (`cover`).
- **Brand and friendly design:** Bogdan (`brand`).
- **Logistics, the space, comms, workshops:** Nadja (`ch5` and the story slots).
- **Close:** Faris speaks last (`come-2028`).
- **Ch 3:** who tells it is open.

### Runtime

171 slides (152, the five email slides, Nadja's week-before run, the airport chaos and the transitions). At about 15 s a slide, plus the globe (35 s), the photos (48 s), the two videos (80 s) and the curtains, that is about 41 minutes with four slots still empty. It needs trimming to fit 40. Places that repeat or run long:

- Chapter 5 traffic run, six slides (`august-traffic` to `buyers-from`): could be two.
- The CFP is told three times: `year-cfp`, `final-week`, `hi-final-week`.
- Countries are told three times: `year-flights`, `countries`, `abroad`.
- `year-numbers` plus the four motion slides repeat each other; the tiles could go.
- Chapter 2's strike run, now 5 slides.

What to say while things animate: `year-cfp` (12 s), the globe (35 s) and `road-moments` (48 s) all play by themselves. Talk over them; the notes say what each one shows.

### Unverified figures and claims

| Claim | Slide | Status, source |
|---|---|---|
| React Advanced London ticket sales −50% | `react-advanced` | No public source (audit 9 Nov). Faris's account. |
| React Alicante −200 seats | `react-alicante` | No public source; listings say 600 attendees in both 2025 and 2026. |
| Devoxx Belgium 2027 likely the last | `last-devoxx-be` | No public source; their FAQ plans 2027 normally. |
| CHF 100k minimum; three organisers liable (about 33k each) | `stakes-100k`, `stakes-split` | Faris's account. Currency to confirm. "Three of us" vs four organisers in ch 3. |
| "Just over break even", no shortfall | `add-up-answer`, `stakes-covered` | Cost total not in the data. Confirm before saying it. |
| Income shares 47 / 44 / 8 / 1% | `income` | From the rounded admin income totals (amounts kept out of the repo), which may be off by up to 5%. |
| Workshop revenue allocation | not shown | No verified breakdown; the split mentioned in the review was only an illustration. |
| 63 "subsidised" tickets | `people-split` | Check that the word fits all 63 (sponsor allocations, speakers, volunteers). |
| React Summit regular ticket €600 (2026) | `price-compare`, `value-grid` | The live page shows 2027 tiers (€600 is the 2027 2nd batch). Needs a 2026 source. |
| React Paris €650 regular | `price-compare` | Wayback only; Ticket Tailor did not load in the audit. |
| Voxxed Days Zurich CHF 360 | `price-compare` | A search snippet only; check voxxeddays.com/zurich. |
| JSWorld 2027 €399 excl. VAT | `price-compare`, `value-grid` | Ticket Tailor did not load in the audit. |
| Berlin student ticket YES | `value-grid` | Not found on reactday.berlin in the audit. |
| CHF 295 as our comparison price | `price-compare` | Open (general admission). |
| VIP: 19% vs 5% took a workshop; 3× VIP if travelling | `vip-invested`, `vip-travel` | Correlation, from tracked checkouts only (32 of 46 VIP). |
| AI share: 40% (keyword) vs 106 AI and ML tags | `ai-share`, `year-cfp` | Two methods; do not quote them as one number. |
| Topic mix stable over the CFP | `year-cfp` | Not checked; the slide does not claim a shift. |
| Ad attribution 40% / 4% / 0.09%; Reddit 11 to 19 June; Google 1 Aug to 6 Sep | `ads`, `ads-when` | PostHog first touch; ad blockers undercount. Check the campaign dates. |
| 19% and 68% badge shares | `badge-frontload` | From the door export; recheck. |
| Door scans: 145 from 07:40 | `arrivals` | Vs 156 door scans and 158 check-ins elsewhere; pick one definition. |
| Feature months on the pipeline (VIP in Jul, travel in Aug) | `year-commits` | Check. |
| Email timings: 3 / 21 / 55 days (sponsors), 87 min (attendees), 3 to 9 min and up to 25 days (expenses) | `mail-sponsors`, `mail-speed` | From selected, traceable threads (7 sponsors, 10 attendee threads, 3 expense threads), not mailbox-wide rates. Personal Gmail holds more ZurichJS mail, so 6,857 undercounts. |
| Sponsor payment one day before the conference | `lo-last-payment` | From the audit; check the date. |
| Wi-Fi: 300 / 120 / 250 concurrent devices | `wifi` | Provider emails (Aug 2026). |
| Hoodies: 33 handed out, 48 owed | `merch-guess` | Door system export; check before saying it. |
| Airport runs | `airport-runs` | No count yet: how many runs, who drove. |
| Arnau: UK radar disruption, missed connection in Düsseldorf, landed 06:00, workshop at 09:00 on time | `arrivals-board`, `six-to-nine` | Faris's account; check the order and the origin of the 06:00 flight. |
| Delays: about 0 min, 3 to 5 min at worst | `precision` | Faris's account. |
| Travel totals: 16 trips, 13 countries visited (globe); 70 photos, 19 cities, 15 countries, 12 months (photos) | `road`, `road-moments` | Different scopes, now labelled. km about 110k per Faris (great-circle gives about 89k). |

### Decisions needed before Thursday

1. **Market claims with no source** (React Advanced −50%, React Alicante −200, Devoxx last): say "we heard", or cut them?
2. **Stakes:** show about CHF 33k per organiser? Is it three or four organisers on the hook?
3. **Budget:** shares only, or absolute amounts? Any cost line at all?
4. **"Subsidised tickets":** is the word right for all 63, or should we cut `people-split`?
5. **Curtain on chapter openers:** keep it? It breaks the "no cuts" rule from 8 Nov.
6. **Final numbers in the crowd** (`stage` view): keep, or back to the full screen?
7. **Presenter assignments:** Dominic to open, Bogdan on brand, Nadja on logistics, Faris to close?
8. **Next edition:** two days? Which date for "Come in 2028"? (No name until one is chosen.)
9. **Feedback slot:** which quotes, from the 12 respondents who agreed to be named?
10. **Workshops:** one day (10 Sep) or two?
11. ~~**Spelling:** Nadja or Nadia?~~ Nadja (her own message, 9 Nov).
12. **Trims to get under 40 minutes** (see Runtime).
13. **Email slides:** keep all five, or fold them into `story-comms` (ch 3), which asks for exactly this? Keep sponsors unnamed?

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

- **Length is not the problem, the shape is.** 145 slides, plus a 35-second autoplaying globe: roughly 26 minutes at about 15 seconds a slide, inside a 40-minute talk. There is room to slow down and tell the story; what is missing is a thread, not time.
- **Numbers without a thread.** Long runs of big-number slides in a row (chapter 2 has 145 slides, chapter 5 has 20). Each number is true, but few of them move the story forward. Most could be one chart, or cut.
- **The setup is never paid off.** Chapter 2 promises "three problems, each forced a decision" (sponsor budgets, price-sensitive buyers, AI submissions). Chapters 3 to 5 never say which decision answers which problem, so the structure is invisible to the audience.
- **The human story is missing.** The four places where only Faris (and the team) can speak are empty: W1 the meetup itch, M1 brand and design, R1 the personal highs and lows, O5 the next edition date. Without them it is a data report, not a story.
- **Decided: the story starts at the 1st anniversary** (Pause im Foifi, 14 Nov 2025), where conf.zurichjs.com went live five minutes before the meetup. It then flies to Technopark, "ten months later". What follows the venue flyover still needs a thread: it restarts at "359 people".
- **Venue views were picked for looks, not meaning.** Chapter openers land on views that look good (the rig for "the rollercoaster", the wall for "a hard year") rather than places that mean something for that part of the story.
- **Decided: the motivation comes before the road.** After the meetup numbers, still at Foifi: the agenda, chapter 1 (why on earth) and chapter 2 (the hard market and our three problems), then ZurichJS on the road as the answer, then the flight to Technopark. The Technopark opening ("359 people") follows the venue flyover.
- **Unverified claims carry a whole chapter.** Chapter 2's industry context (React Advanced -50%, renames, last editions, layoffs) is per Faris and unverified. Either source it or soften it.
- The Front Conference screenshots are in `public/front/` (taken from frontconference.com, 9 Nov 2026).

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

125 slides. "View" is where the camera is for that slide. "Notes" are the speaker notes, including the flags from the handoff (UNVERIFIED, CHECK, DATA GAP, FARIS).

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

### 1 · Why on earth (at Foifi, after the meetup numbers) · *Where it came from*

| # | Slide | Block | On screen | View | Notes | Team decision |
|---|---|---|---|---|---|---|
| 12 | `chapters` | List | Eight chapters · Why on earth · A hard year · The machine · Building the programme · Filling the room · The rollercoaster · What we learned · The final numbers | Foifi screen, full frame | Each problem in chapter 2 gets its answer later. | |
| 13 | `ch1` | Section | 01 · Where it came from · Why on earth | Foifi, from the back row |  | |
| 14 | `meetup-itch` | Statement | Data gap · W1 · It started at the meetup. Your story: the itch. | Foifi screen, full frame | DATA GAP W1: Faris writes this. | |
| 15 | `front-cancel` | Screenshot | Zurich's Front Conference cancelled Front 26. (frontconference.com notice) | Foifi screen, full frame | Needs front-cancel.png (in the old deck repo). Zurich's front-end conference for 10+ years. Front 26 was planned for 27 Feb 2026 at Alte Papierfabrik. Ticket demand was "way off, both via B2C and B2B channels", even after scaling to one day. Per Faris: two revival attempts (Q4 2025, Q1 2026) did not happen. | |
| 16 | `front-book` | Screenshot | And told everyone to book ZurichJS Conf. (their list, conf.zurichjs.com first, highlighted) | Foifi screen, full frame | Needs front-book.png. Their notice lists conf.zurichjs.com first. Front Conference Zurich also bought 6 tickets by company invoice. | |
| 17 | `dying` | Statement (yellow) | Everyone said tech events were dying. So we started one. | Foifi screen, full frame |  | |
| 18 | `stakes-100k` | Big number | CHF 100k · The minimum it would cost to run ZurichJS Conf. | Foifi screen, full frame | CHECK: CHF assumed. | keep |
| 19 | `stakes-no-cancel` | Statement | The bookings · Signed with no way to cancel. | Foifi screen, full frame | | keep |
| 20 | `stakes-split` | Big number (orange) | ÷ 3 · If we fell short, three of us would cover the gap from our own pockets. | Foifi screen, full frame | Per-person worst case (~a third of 100k) deliberately not shown. | keep |
| 21 | `first-commit` | Big number | 3 Nov 2025 · First commit. First ticket sold ten days later. | Foifi screen, full frame | First ticket 13 Nov 2025. FARIS: replace with the date you decided, if different. | |

### 2 · A hard year (at Foifi) · *Three problems*

| # | Slide | Block | On screen | View | Notes | Team decision |
|---|---|---|---|---|---|---|
| 22 | `ch2` | Section | 02 · Three problems · A hard year | Foifi projector |  | |
| 23 | `hardest-year` | Statement | One of the hardest years in a decade to run a JavaScript conference. | Foifi screen, full frame |  | |
| 24 | `react-advanced` | Big number | −50% · Ticket sales at React Advanced London | Foifi screen, full frame | UNVERIFIED (per Faris). | |
| 25 | `react-alicante` | Big number | −200 · Seats at React Alicante versus last year | Foifi screen, full frame | UNVERIFIED. | |
| 26 | `renamed-react-advanced` | Strike | Conferences renamed themselves · React Advanced London struck through · now Web Engineering London | Foifi screen, full frame | UNVERIFIED. | new |
| 27 | `renamed-cityjs` | Strike | CityJS struck through · now CityAI | Foifi screen, full frame | UNVERIFIED. | cut (review 9 Nov) |
| 28 | `last-react-india` | Strike | React India · DEPRECATED stamp · Last edition this year | Foifi screen, full frame | UNVERIFIED. | new |
| 29 | `last-jsworld` | Strike | JSWorld · DEPRECATED · 2027 is the last | Foifi screen, full frame | UNVERIFIED. | cut (review 9 Nov) |
| 30 | `last-devoxx-be` | Strike | Devoxx Belgium · DEPRECATED · 2027 likely the last | Foifi screen, full frame | UNVERIFIED. | new |
| 31 | `last-front` | Strike | Front Conference · DEPRECATED · Front 26 cancelled | Foifi screen, full frame | Sourced: frontconference.com. | new |
| 32 | `layoffs` | Statement | Layoffs everywhere. Sponsorship budgets cut. | Foifi screen, full frame | Netflix, Google, Microsoft, Canva, Smallpdf. Smallpdf was our Gold sponsor: decide whether to name companies. | |
| 33 | `sponsor-tiers` | Bar chart | Half our sponsors were the smallest tier · Paid sponsor deals by tier · Platinum 2 · Gold 2 · Silver 3 · Bronze 5 · Supporter 12 | Foifi screen, full frame | Half the deals at the smallest tier. | |
| 34 | `sponsor-prices` | Bar chart | Our top tier: about half of React Summit's · React Summit 20,792 · React Advanced / Day Berlin 15,121 · React Norway 13,231 · ZurichJS 11,000 · DevOpsDays Zurich 8,000 (CHF) | Foifi screen, full frame | Official sponsor pages; per-head figures in the notes. | new |
| 35 | `sponsor-get` | ✓/✗ grid | What a sponsor gets for the top tier: tickets, booth, leads, workshops, video, pitch time on stage, a technical talk | Foifi screen, full frame | | new |
| 36 | `sponsor-talks` | Statement | Elsewhere · A 20-minute sponsor talk costs €7,000. Our technical talks were not for sale. | Foifi screen, full frame | React Summit add-on. | new |
| 37 | `no-diamond` | Big number | 0 · Diamond sponsors. One cancelled, one never left draft. | Foifi screen, full frame |  | |
| 38 | `lesson-diamond` | Strike | A weird lesson: sponsors are people · Diamond sponsor · LAID OFF · A week of research and pitching, then the contact was laid off or bailed. | Foifi screen, full frame | Faris's account. | new |
| 39 | `money-late` | Bar chart | And the money came late · Sponsor deals paid per month, 2026 · Feb 1 · Mar 0 · Apr 0 · May 7 · Jun 1 · Jul 5 · Aug 7 · Sep 3 | Foifi screen, full frame | 15 of 24 were paid in the last three months. | |
| 40 | `price-sensitive` | Statement | Faris adds what he saw · Buyers were price-sensitive. | Foifi screen, full frame | FARIS: add what you saw. | |
| 41 | `expensive` | Big number | 14 · Of 112 survey respondents found it expensive. 98 said good, excellent or just right. | Foifi screen, full frame |  | |
| 42 | `ai-changed` | Statement | AI changed what people submitted. | Foifi screen, full frame | FARIS: opinion to add. | |
| 43 | `ai-share` | Big number | 40% · Of CFP submissions mentioned AI. 171 of 428 analysed. | Foifi screen, full frame | Keyword-based. | |
| 44 | `three-problems` | Statement (yellow) | Three problems, and AI pressed on every one: from the top and from the bottom. | Foifi screen, full frame | FARIS to confirm the links: sponsor budgets → ch3 (tiny team, one app); AI submissions → ch4 (programme picks); price-sensitive buyers → ch5 (discounts, partner codes, invoices, currencies). | |
| 45 | `atm-insert` | ATM screen | Funding ZurichJS Conf · Please insert your card. (the card goes in) | Cash machine at Foifi, wide | | new |
| 46 | `atm-sponsors` | ATM screen | From the top · Sponsors: what would you like to fund? Talk slot and AI-only lit | Cash machine, close | | new |
| 47 | `atm-declined` | ATM screen | A technical talk slot · Declined. Technical talks are not for sale. (The compromise: two minutes of pitch time on stage.) | Cash machine, close | | new |
| 48 | `atm-companies` | ATM screen | From the top · Companies: fund a ticket? AI conference yes, anything else no budget | Cash machine, close | | new |
| 49 | `atm-speakers` | ATM screen | From the bottom · Speakers: which talk will get picked? The one about AI | Cash machine, close | | new |
| 50 | `atm-attendees` | ATM screen | From the bottom · Attendees: deep dives 75, case studies 71, performance 66, AI 48 | Cash machine, close | | new |
| 51 | `atm-taste` | ATM screen | And if it is AI? Slop no, grounded engineering yes | Cash machine, close | | new |
| 52 | `atm-repitch` | ATM screen | New language for every stream: sponsors, companies, speakers, attendees | Cash machine, close | | new |
| 53 | `atm-dispense` | ATM screen | Please take your card and your cash. (card out, then cash) | Cash machine, wide | | new |

### ZurichJS on the road (decided) · *our answer to the hard year*

| # | Slide | Block | On screen | View | Notes | Team decision |
|---|---|---|---|---|---|---|
| 54 | `road` | Globe | Globe: autoplays all 19 trips (Nov 2025 to Aug 2026), then totals: 16 trips · 31 events · 13 countries · ~110k km · 4 team trips | Foifi screen, full frame | NEW (not in the handoff). Plays by itself, about 35 s: starts at React Summit US, New York, then flies every trip in date order (19 stops) and lands on the totals. No keys needed; → moves on. From faziz-dev.com/events, Nov 2025 to Aug 2026. Blue = team trips: React Vienna, ReactJS Milano and jsday, CityJS London, JSHeroes; Voxxed Days Zurich is at home. ASSUMED: return trips from Zurich except Milan → Bologna and Warsaw → Cluj; km is great-circle. | |
| 55 | `road-moments` | Photo flow | On the road, in pictures: 70 photos (Sep 2025 to the conference) flow past a month timeline, then settle into a wall: 70 moments · 19 cities · 15 countries · 12 months | Seat-back screen, from seat 15C of the 777 | Autoplays ~48 s. Place from photo GPS, else by date. CHECK: the Sep 2025 photos; Berlin and Geneva are not on the globe. | new |
| 56 | `affordable-idea` | Flap board | The other idea · One of the most affordable conferences in Europe, in its most expensive city. | Departures board at the gate, full frame | Zurich #1 in Numbeo's 2025 mid-year cost of living index. | keep |
| 57 | `price-compare` | Flap board | Half the price of London · regular 2026 ticket in CHF: React Paris 614, React Advanced 595, React Summit 567, React Day Berlin 515, Voxxed Days Zurich 360, ZurichJS Conf 295, JSHeroes Cluj 198 | Departures board at the gate, full frame | Official pages (React Paris via web.archive.org); ECB rate 11 Sep 2026. JSNation left out (prices like React Summit). JSWorld left out: price no longer published. CHECK CHF 295. | keep |
| 58 | `value-grid` | Flap board | What the ticket gets you · ZurichJS Conf vs React Day Berlin, React Summit, React Paris, JSWorld Amsterdam | Departures board at the gate, full frame | Dash = not listed on their official pages. CHECK: JSWorld 2026 price. | new |
| 59 | `workshop-compare` | Flap board | Workshops at Paris prices, in Zurich · ZurichJS 4h 250, React Paris 4h 236, ZurichJS 4h VIP 200, ZurichJS 2h 150 | Departures board at the gate, full frame | React Paris: Dominik Dorfmeister, €250, 4h. | new |
| 60 | `vip-vs-standard` | Flap board | Standard CHF 295 or VIP CHF 495: after-party, limited-edition goodies, 20% off workshops | Departures board at the gate, full frame | | new |
| 61 | `vip-tiers` | Flap board | Tiers, not barriers: a tier for every budget, so the floor stays low. | Departures board at the gate, full frame |  | new |
| 62 | `vip-invested` | Flap board | Once in, people went further: took a workshop: standard 5% (of 171), student 10% (of 20), VIP 19% (of 32); 8 upgraded to VIP | Departures board at the gate, full frame | PostHog, tracked checkouts only; correlation, not proof. | new |
| 63 | `vip-funds` | Flap board | Spend more if you can, so everyone can come: VIP tickets 46, workshop seats 80, student and unemployed 33 | Departures board at the gate, full frame | DATA GAP: VIPs who bought a workshop; after-party cost. | new |

### Venue flyover (optional)

| # | Slide | Block | On screen | View | Notes | Team decision |
|---|---|---|---|---|---|---|
| 64 | `venue-map` | Statement | Technopark Zürich · One building, one week, one conference. | Birds-eye of Technopark at night (aerial) | OPTIONAL flyover (5 slides). Cutaway of Technopark: auditorium, booth, foyer, atrium. | |
| 65 | `empty-seats` | Statement | The auditorium, ten months out · Every one of these seats had to be sold. | Hovering over the empty rows (seats) | Dive through the roof. fill 0. | new |
| 66 | `venue-atrium` | Statement | The atrium · Sponsors, coffee, and every hallway conversation. | Atrium, from above | OPTIONAL. The atrium: tables, pendants, lift tower. | |
| 67 | `venue-booths` | Statement | Sponsor booths · The people who paid for the room. | Sponsor booths | OPTIONAL. AG Grid booth, ZurichJS roll-up, namespace wall beyond. | |
| 68 | `venue-badges` | Statement | Check-in · Nine kinds of badge. | Badges on the counter | OPTIONAL. All nine badge kinds on the check-in counter. | |
| 69 | `badge-one-hole` | Badge test | One hole, and the badge flips. (the badge spins on the stand) | Test stand on the check-in counter (lanyards) | Qualitative: no test figures. | new |
| 70 | `badge-two-holes` | Badge test | Two holes, and it stays put. | Test stand on the check-in counter (lanyards) | Qualitative: no test figures. | new |
| 71 | `badge-stress` | Badge test | Would they snap? Weight on: the single hole tears and drops; two holes hold. | Test stand on the check-in counter (lanyards) | Qualitative: no test figures. | new |
| 72 | `badge-held` | Badge test | Two holes. Tested. Held. | Test stand on the check-in counter (lanyards) | Qualitative: no test figures. | new |
| 73 | `venue-merch` | Statement | Volunteer merch desk · Cups and totes. | Merch table | OPTIONAL. Volunteer merch desk: cups and totes. | |

### Opening

| # | Slide | Block | On screen | View | Notes | Team decision |
|---|---|---|---|---|---|---|
| 74 | `people-359` | Big number | 359 · People in the room | Hall, back corner | 330 ticket holders, plus 19 speakers and MCs without a ticket, plus 10 staff without a ticket. | |
| 75 | `people-split` | Number tiles | Where 359 comes from · 267 (Paid tickets) · 63 (Complimentary tickets) · 19 (Speakers and MCs without a ticket) · 10 (Staff and volunteers without a ticket) | Screen (full frame) | 21 people on stage, 2 of whom also held a ticket. 13 door staff, 3 of whom held a ticket. | |
| 76 | `year-numbers` | Number tiles | A year in numbers · 434 (Talk submissions) · 1,336 (Commits) · 21 (Countries in the room) · 53,277 (Slack messages) | Screen (full frame) |  | |
| 77 | `year-cfp` | Inbox | Call for papers · every submission flies into our server on the day it came in · 428 dated, 40 on 31 March · top 10 topics fill | Screen (full frame) |  | |
| 78 | `year-commits` | Pipeline | Every commit, shipped · 1,336 commits and 281 PRs through commit, build, test, deploy · features called out by month | Screen (full frame) |  | |
| 79 | `year-slack` | Chatter | A year of Slack · 53,277 messages · per organiser · private 46,893, DMs 5,910, public 474 | Screen (full frame) |  | |
| 80 | `year-flights` | Arrivals | Who came to Zurich · flights in from the top origins · attending and speaking per country | Screen (full frame) |  | |

### 3 · The machine · *Four people, day jobs, one app*

| # | Slide | Block | On screen | View | Notes | Team decision |
|---|---|---|---|---|---|---|
| 81 | `ch3` | Section | 03 · Four people, day jobs, one app · The machine | Control booth | Camera in the control booth: the crew behind the glass. | |
| 82 | `small-team` | Number tiles | A small team, and an admin that did the rest · 4 (Organisers) · 15 (CFP reviewers) · 13 (Door staff) | Screen (full frame) | Admin areas: tickets, workshops, CFP and reviewers, speaker travel, sponsorships, partnerships, company invoices, VIP perks, apparel, door check-in. CONFIRM organisers: Faris, Bogdan, Nadja, Colin. | |
| 83 | `slack-people` | Bar chart | Four people, 51,202 messages · Active days: Faris 396 · Bogdan 382 · Nadja 327 · Colin 327 · Faris 20,354 · Bogdan 19,954 · Nadja 6,979 · Colin 3,915 | Screen (full frame) | About 129 messages a day. | cut (review 9 Nov) |
| 84 | `slack-share` | Big number | 96% · Of all Slack messages came from the four of us. 51,202 of 53,277. | Screen (full frame) | 88% were in private channels. | |
| 85 | `slack-days-off` | Big number | 3 · Days without a single message, out of 397. | Screen (full frame) | 15% of messages were sent on weekends. | cut (review 9 Nov) |
| 86 | `slack-peak` | Big number | 836 · Messages on 3 September. Our busiest day, a week before doors opened. | Screen (full frame) | August was the busiest month at 8,265. Top days: 3 Sep 836, 1 Sep 744, 4 Aug 705. | cut (review 9 Nov) |
| 87 | `brand` | Statement | Data gap · M1 · Brand and design. | Screen (full frame) | DATA GAP M1: Faris writes this. | |
| 88 | `timeline` | Number tiles | Ten months from first commit to the door · 3 Nov (2025 · First commit) · 13 Nov (2025 · First ticket sold) · 29 Dec (2025 · CFP opens) · 3 Apr (2026 · CFP closes) · 31 Aug (2026 · Door check-in ships) · 9–12 Sep (2026 · Conference week) | Screen (full frame) | Old deck revealed these one per click; one slide in this draft. | |
| 89 | `commits` | Bar chart | 1,336 commits · Commits per month · busiest week 27 Jul to 2 Aug, 91 commits · Nov 137 · Dec 87 · Jan 96 · Feb 116 · Mar 83 · Apr 158 · May 191 · Jun 92 · Jul 173 · Aug 104 · Sep 99 | Screen (full frame) |  | cut (review 9 Nov) |
| 90 | `agent-prs` | Big number | 58% · Of 281 PRs came from agent branches. 145 Claude · 11 Cursor · 8 Codex. | Screen (full frame) | The first PR (5 Nov 2025) was already from a claude/ branch. | |
| 91 | `agent-share` | Bar chart | From helper to default · Agent share of merged PRs · Nov 12% · Dec 50% · Jan 0% · Feb 53% · Mar 55% · Apr 47% · May 28% · Jun 68% · Jul 89% · Aug 85% · Sep 71% | Screen (full frame) |  | |
| 92 | `my-job` | Number tiles | My job changed · 56 → 1 (My own commits, May to August) · 119 (Agent commits in July) | Screen (full frame) |  | |
| 93 | `app-grew` | Number tiles | What the app grew into · 1 → 133 (Test files) · 266 (API route files) · 108 (Database migrations) | Screen (full frame) |  | |

### 4 · Building the programme · *434 ideas, 9 picked*

| # | Slide | Block | On screen | View | Notes | Team decision |
|---|---|---|---|---|---|---|
| 94 | `ch4` | Section | 04 · 434 ideas, 9 picked · Building the programme | Stage, from the seats | 3 of the 6 workshops were AI topics. | |
| 95 | `submissions` | Number tiles | 434 talk submissions · 347 (Talks) · 47 (Lightning talks) · 40 (Workshops) | Screen (full frame) |  | |
| 96 | `final-week` | Bar chart | A quarter arrived in the final week · CFP submissions per week, 29 Dec to 3 Apr · Week 1 44 · Week 2 33 · Week 3 30 · Week 4 18 · Week 5 8 · Week 6 23 · Week 7 6 · Week 8 12 · Week 9 14 · Week 10 9 · Week 11 18 · Week 12 38 · Week 13 60 · Week 14 121 | Screen (full frame) | 121 of 434 (28%). | |
| 97 | `reviews` | Big number | 2,489 · Reviews from 15 reviewers. About 166 each. | Screen (full frame) | 267 speakers applied, about 1.6 submissions each. | |
| 98 | `accepted` | Big number | 9 · Accepted from 434. 6 talks, 3 workshops, 5 waitlisted. | Screen (full frame) | About 2%. The rest of the programme was invited. | |
| 99 | `lesson-email` | Strike | A weird lesson: ask for a personal email · speaker@yourcompany.com struck through · now speaker@gmail.com · some had changed or lost jobs by the time we answered; ticket holders too | Screen | Faris's account; placeholder addresses. | new |
| 100 | `fundamentals` | Number tiles | But attendees asked for fundamentals · 75 (Want more JS and TS deep dives) · 48 (Want more AI) | Screen (full frame) | Case studies 71, performance 66. | |
| 101 | `speakers-flew` | Bar chart | 18 of 21 speakers flew in · 5 from North America · 9 countries · 3 did not fly · USA 3 · Germany 3 · Canada 2 · Netherlands 2 · Austria 2 · UK 2 · Spain 2 · Czechia 1 · Portugal 1 | Screen (full frame) | Departure airport country, not home country. | |
| 102 | `workshops` | Big number | 6 · Workshops, 80 seats. Workshop day, 10 September. | Screen (full frame) | Registrations: 17, 10, 9, 16, 22, 6. CONFIRM workshop day was 10 Sep. | |

### 5 · Filling the room · *Price, channels, people*

| # | Slide | Block | On screen | View | Notes | Team decision |
|---|---|---|---|---|---|---|
| 103 | `ch5` | Section | 05 · Price, channels, people · Filling the room | Hovering over the empty rows (seats), check-in | Camera in the foyer: this slide is projected on the wall above check-in. | |
| 104 | `price-stages` | Bar chart | Five price stages · Paid tickets per stage · Blind bird 20 · Early bird 81 · General 110 · Late bird 37 · Last minute 19 | Screen (full frame) |  | |
| 105 | `when-bought` | Bar chart | When people bought · Paid tickets per month · Nov 3 · Dec 16 · Jan 10 · Feb 22 · Mar 35 · Apr 21 · May 11 · Jun 34 · Jul 50 · Aug 39 · Sep 26 | Screen (full frame) |  | |
| 106 | `last-100-days` | Big number (yellow) | 56% · Of paid tickets sold in the last 100 days. 149 of 267, from 1 June. | Screen (full frame) | FARIS: add the deadline lesson. | |
| 107 | `ways-in` | Number tiles | So we built ways in · 96 (Tickets with a discount code) · 33 (Student and unemployed tickets) · 41 (Via community partner codes) | Screen (full frame) |  | |
| 108 | `invoices` | Big number | 30 · Company tickets, all paid by invoice. 9 invoices, all bank transfer. | Screen (full frame) | About a tenth of ticket revenue. | |
| 109 | `currencies` | Big number | 1 in 5 · Tickets paid in EUR, GBP or USD. 55 EUR · 5 GBP · 4 USD. | Screen (full frame) |  | |
| 110 | `heard-from` | Bar chart | 1 in 3 heard from a friend or colleague · How survey respondents heard about it (106 answered) · Friend or colleague 38 · Meetup 20 · Web search 17 · Social 16 · Speakers 9 | Screen (full frame) |  | |
| 111 | `partners` | Big number | 80 · Community partners. 41 tickets, 24 of them from outside Switzerland. | Screen (full frame) | 62 communities, 13 companies, 5 individuals. Top: WarsawJS 5, ReactJS Barcelona 4. | |
| 112 | `august-traffic` | Bar chart | One month looked huge · visitors per month, August 10,385 | Screen | PostHog. | changed |
| 113 | `ads-when` | Number tiles | We barely ran ads · none before June · Reddit 9 days (919 visitors, 0 tickets) · Google Ads 1 Aug to 6 Sep | Screen | PostHog, entry click ids. | changed |
| 114 | `august-without-ads` | Number tiles | Take the ads out, and August looks like July · 7,531 from Google Ads (72%) · 2,854 without · July 3,193 | Screen | PostHog. | changed |
| 115 | `newsletter` | Big number | 1,215 · visitors in one day from Kevin Powell's newsletter. A friend, not an ad. | Screen | Unpaid; newsletters brought reach, not buyers either. | changed |
| 116 | `ads` | Number tiles | Ads brought traffic, not buyers · 40% of visitors · 4% of buyers (8 of 180) | Screen | PostHog first touch. | changed |
| 117 | `buyers-from` | Bar chart | Buyers came from people who already knew us · direct 72, own channels 38, search 27 … Google Ads 8, newsletters 1, Reddit 0 | Screen | PostHog first touch, 180 buyers with a web visit. | changed |
| 118 | `cart` | Big number | 1 in 4 · Cart viewers went on to check out. Most dropped off at the details step. | Screen (full frame) | 631 viewed the cart, 162 entered an email, 156 completed checkout. | |
| 119 | `countries` | Big number | 21 · Countries. 2 in 3 paid tickets from Switzerland. | Screen (full frame) |  | |
| 120 | `abroad` | Bar chart | Germany first, then everyone · Paid tickets from outside Switzerland · Germany 26 · Austria 10 · UK 7 · Spain 7 · USA 7 · Netherlands 5 · Poland 5 · Croatia 4 | Screen (full frame) |  | |
| 121 | `swiss-early` | Bar chart | Swiss bought early, everyone else later · International share of paid tickets by stage · Blind bird 6% · Early bird 22% · General 44% · Late bird 38% · Last minute 26% | Screen (full frame) | Inference: locals trust the meetup; travellers wait for the lineup. | |
| 122 | `vip-travel` | Big number | 3× · More likely to buy VIP if travelling. 35% of international vs 11% of Swiss. | Screen (full frame) |  | |
| 123 | `company-types` | Bar chart | Product companies and agencies · Paid tickets by company type (keyword classification, rough) · Product 94 · Agency 81 · Indie 27 · Enterprise 25 · Finance 21 · Other 16 · Education 3 | Screen (full frame) | CHECK the company-type classification. | |
| 124 | `agencies-local` | Number tiles | Agencies were local, product teams travelled · 74% (Of agency tickets from Switzerland) · 43% (Of product-company tickets from abroad) | Screen (full frame) |  | |

### 6 · The rollercoaster · *Highs and lows*

| # | Slide | Block | On screen | View | Notes | Team decision |
|---|---|---|---|---|---|---|
| 125 | `ch6` | Section | 06 · Highs and lows · The rollercoaster | Up in the lighting rig |  | |
| 126 | `hi-final-week` | Big number | 121 · Submissions in the final week. High · 30 Mar to 3 Apr 2026. | Screen (full frame) |  | |
| 127 | `lo-1000-rows` | Big number | 1,000 · Rows: a silent limit hid CFP reviews. Fixed days before the CFP closed. Low · 31 Mar 2026. | Screen (full frame) |  | |
| 128 | `lo-178` | Big number | #178 · Removed an obfuscated malicious payload hidden in a build config. Low · 25 May 2026. | Screen (full frame) |  | |
| 129 | `hi-july` | Big number | 50 · Tickets sold, our best month. High · July 2026. | Screen (full frame) |  | |
| 130 | `door-prs` | Big number | 14 · Door check-in PRs merged in one day, 9 days before the event. Low and high · 31 Aug. | Foyer, check-in | Camera at the door: this is where check-in ran. | |
| 131 | `arrivals` | Bar chart | Everyone arrives at once · Door scans per 10 minutes from 07:40, 11 Sep · 07:40 5 · 07:50 6 · 08:00 12 · 08:10 24 · 08:20 21 · 08:30 29 · 08:40 20 · 08:50 11 · 09:00 5 · 09:10 8 · 09:20 2 · 09:30 2 | Screen (full frame) |  | |
| 132 | `busiest-day` | Big number | 5,067 · Pageviews: the busiest day of the year. 69% on mobile. /schedule opened 3,729 times over 4 days. | Screen (full frame) |  | |
| 133 | `badges` | Number tiles | On the day · 253 (Badges picked up of 330 tickets) · 222 (T-shirts) · 204 (Goodie bags) | Foyer, check-in | CHECK: badges (253) or door scans (156) as the attendance number. | |
| 134 | `badge-frontload` | Number tiles | We handed out badges the night before · 49 at the warm-up meetup (1 in 5) · 48 of them never needed the desk on the day · 139 in the busiest hour | Foyer, projected | Door system export. | new |
| 135 | `door-rhythm` | Heatmap | Doors first, goodies later · check-ins per hour (118 at 08:00) vs goodie bags (from 10:30, waves at the breaks) | Foyer, projected | Door system event log, 11 Sep. No pickups logged on 9 or 10 Sep. | new |
| new | `mail-inbox` | Number tiles | The inbox · A year of email · 6,857 (Messages in the ZurichJS mailbox) · 1,449 (Sent by us, about 1 in 5) | Screen (full frame) | Email audit, 21 Jul 2025 to 8 Nov 2026. | new |
| new | `mail-sponsors` | Number tiles | A quick hello, a slow yes · 3 days (To a first reply) · 21 days (From first email to a signature) · 55 days (The longest) | Screen (full frame) | Seven cash sponsors, medians. | new |
| new | `mail-after-yes` | Statement | Much of the work came after the yes. | Screen (full frame) | Unnamed examples in the notes. | new |
| new | `mail-speed` | Number tiles | Answered in minutes, paid in weeks · 87 min · 9 min · 25 days | Screen (full frame) | Selected threads only. | new |
| new | `lo-last-payment` | Big number | 1 day · Before the conference: a sponsor payment and video ad finally arrived. Low · Sep 2026. | Screen (full frame) | Check the date. | new |
| 136 | `not-in-data` | Statement | Data gap · R1 · The ones not in the data. | Screen (full frame) | DATA GAP R1: personal highs and lows. | |

### 7 · What we learned · *For anyone who wants to organise something*

| # | Slide | Block | On screen | View | Notes | Team decision |
|---|---|---|---|---|---|---|
| 137 | `ch7` | Section | 07 · For anyone who wants to organise something · What we learned | Hall, back corner |  | |
| 138 | `execution` | Statement | Execution · The plan only counts at the door. | Screen (full frame) | Best-rated: organisation and logistics, 3.7 of 4. Weakest: food and drinks, 3.2 of 4. | |
| 139 | `distribution` | Statement | Distribution · Reach people where they buy. | Screen (full frame) |  | |
| 140 | `pragmatism` | Statement | Pragmatism · One app, a boring stack, agents for the grind. | Screen (full frame) |  | |

### 8 · The final numbers · *Did it add up?*

| # | Slide | Block | On screen | View | Notes | Team decision |
|---|---|---|---|---|---|---|
| 141 | `ch8` | Section | 08 · Did it add up? · The final numbers | Stage, from the seats |  | |
| 142 | `income` | Bar chart | Where the money came from · share of income · Sponsorship 47% · Tickets 44% · Workshops 8% · VIP upgrades 1% | Screen (full frame) | Admin income may be off by up to about 5%. Costs are not in the admin. | |
| 143 | `add-up` | Statement | Did it add up? | Screen (full frame) | Pause. The next slide is the answer. | |
| 144 | `add-up-answer` | Statement (yellow) | Just over break even. | Screen (full frame) |  | |
| 145 | `stakes-covered` | Statement | Nobody had to pay it out of pocket. | Screen (full frame) | Pays off the stakes in chapter 1. CHECK. | keep |
| 146 | `rating` | Big number | 4.6 · Out of 5 overall. 112 survey responses, 110 rated 4 or 5. | Screen (full frame) |  | |
| 147 | `come-back` | Big number (yellow) | 88% · Of survey respondents want to come back. 99 of 112. | Screen (full frame) | 61 Absolutely, 38 "I'll try". | |
| 148 | `thanks` | Number tiles | Thank you · 24 (Sponsors) · 80 (Community partners) · 21 (Speakers and MCs) · 13 (Door staff and volunteers) | Stage, from the seats | CHECK: 13 door staff vs 14 volunteers on the dashboard. | |
| 149 | `come-2028` | Number tiles | Data gap · O5 · next edition date · Come in 2028 · Come back (As an attendee or speaker) · Volunteer (Help us run the next one) · Start your own (Execution, distribution, pragmatism) | Hall, back corner | DATA GAP O5: next edition date. Optional movie. | |

## Open questions to resolve

- [ ] The anniversary date: 14 Nov 2025 (Faris) vs 13 Nov (events page, and the handoff's first-ticket date). Also fixes the "first ticket ten days after the first commit" line.
- [ ] May we show the Digitec Galaxus logo on the anniversary slide? (Not in the deck yet.)
- [ ] The stakes: CHF 100k minimum (currency?), and whether to say the per-person worst case out loud.
- [ ] Our comparison price: CHF 295 standard (general admission), CHF 230 blind bird, CHF 395 full. Confirm 295 is the right one to compare.
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
- [x] Front Conference screenshots: in `public/front/`.

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

