import type { Visual } from '../engine/types'
import { MOMENTS, MOMENT_TOTALS } from './moments'
import { ROAD_TO_ZURICH } from './travel'

/**
 * The content catalog: id → visual. Data is defined ONCE here; every renderer
 * (flat, 3D, index, presenter) reads it.
 *
 * DRAFT: ZurichJS Conf retrospective, scaffolded from
 * zurichjs-conf-retro-handoff.md (snapshot 2026-11-08). Numbers are the
 * handoff's; anything unverified is flagged in the slide notes. "Data gap"
 * visuals are placeholders only Faris can fill. Sentence case per this deck's
 * brand rules (the handoff's old deck used Start Case).
 */
/** Meetup.com group stats (export 8 Nov 2026), cumulative from the relaunch on 14 Nov 2024.
 *  Points: 14 Nov 2024, month ends to Oct 2025, 14 Nov 2025, month ends to Oct 2026, 8 Nov 2026.
 *  Members = total minus the 257 members from before the relaunch (treated as inactive, per Faris). */
const MEETUP_X = ['14 Nov 2024', '', '', '', '', '', '', '', '', '', '', '', '', '14 Nov 2025', '', '', '', '', '', '', '', '', '', '', '', '', '8 Nov 2026'] as const
const MEETUP_SERIES = [
  { label: 'Members', values: [0, 14, 34, 63, 94, 157, 223, 258, 267, 297, 330, 356, 389, 409, 413, 424, 489, 514, 536, 606, 653, 682, 728, 762, 804, 830, 844] },
  { label: 'RSVPs', values: [0, 4, 24, 73, 104, 200, 314, 368, 388, 441, 489, 543, 609, 634, 644, 683, 787, 866, 939, 1033, 1123, 1163, 1248, 1286, 1374, 1419, 1435], tone: 'neutral' },
  { label: 'People joined', values: [0, 15, 35, 68, 100, 163, 229, 264, 275, 308, 349, 376, 413, 427, 430, 442, 512, 546, 574, 649, 699, 730, 808, 848, 897, 925, 939], tone: 'good' },
] as const

/** Meetup.com RSVPs per whole month, Nov to Oct (export 8 Nov 2026). */
const RSVP_MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'] as const
const RSVP_ROWS = [
  { label: '2024/25', values: [31, 20, 49, 31, 96, 114, 54, 20, 53, 48, 54, 66] },
  { label: '2025/26', values: [35, 39, 104, 79, 73, 94, 90, 40, 85, 38, 88, 45], tone: 'neutral' },
] as const

export const VISUALS = {
  // ── Opening ────────────────────────────────────────────────────────────
  cover: { kind: 'title', kicker: 'The ZurichJS team', title: 'ZurichJS Conf retrospective', subtitle: '9 to 12 September 2026, Zurich' },
  // ── Where it started: the 1st anniversary at Pause im Foifi ─────────────
  'anniversary': { kind: 'statement', kicker: '14 November 2025 · Pause im Foifi', text: 'ZurichJS turned one. Digitec Galaxus gave us the room.', emphasis: 'turned one.' },
  'go-live': {
    kind: 'code', title: 'conf.zurichjs.com · anniversary night',
    lines: ['T−5 min   conf.zurichjs.com goes live', 'T−5 min   ticket sales open', 'T−0       the anniversary meetup starts'],
    highlight: [1, 2],
  },
  'first-ticket': { kind: 'stat', value: '#1', label: 'The first ticket: Jonny Burger.' },
  'tshirt-bug': {
    kind: 'code', title: 'Our first funny bug',
    lines: ['Someone buys a t-shirt', '→ the payment hits the same webhook as tickets', '→ the webhook issues them a ticket'],
    highlight: [3],
  },
  // ── Rolling back a year: the meetup's first year (Meetup.com group stats, 8 Nov 2026) ──
  'rollback': { kind: 'calendar', from: '2025-11-14', to: '2024-11-14', kicker: 'One year earlier', caption: 'The ZurichJS meetup relaunch' },
  'meetup-year': {
    kind: 'growth', kicker: 'From the relaunch, 14 Nov 2024', title: "The meetup's first year", source: 'Meetup.com · cumulative · members counted from 0 at the relaunch',
    x: MEETUP_X, series: MEETUP_SERIES, show: 14,
  },
  'meetup-year-2': {
    kind: 'growth', kicker: 'And into 2026, to 8 Nov 2026', title: 'Two years of the meetup', source: 'Meetup.com · cumulative · members counted from 0 at the relaunch',
    x: MEETUP_X, series: MEETUP_SERIES, show: 27, from: 13,
  },
  'meetup-rsvps': {
    kind: 'heatmap', kicker: 'RSVPs per month', title: 'Year one: RSVPs peaked in spring', source: 'Meetup.com · whole months, Nov to Oct',
    columns: RSVP_MONTHS, rows: RSVP_ROWS, show: 1,
  },
  'meetup-rsvps-2': {
    kind: 'heatmap', kicker: 'RSVPs per month', title: 'Year two: busier in 8 of 12 months', source: 'Meetup.com · whole months, Nov to Oct',
    columns: RSVP_MONTHS, rows: RSVP_ROWS, show: 2, from: 1,
  },
  'one-year': { kind: 'statement', ground: 'yellow', text: 'One year of ZurichJS. Ten months to the conference.', emphasis: 'Ten months' },
  'venue-map': { kind: 'statement', kicker: 'Ten months later · Technopark Zürich', text: 'One building, one week, one conference.', emphasis: 'one conference.' },
  'venue-atrium': { kind: 'statement', kicker: 'The atrium', text: 'Sponsors, coffee, and every hallway conversation.', emphasis: 'hallway' },
  'venue-booths': { kind: 'statement', kicker: 'Sponsor booths', text: 'The people who paid for the room.', emphasis: 'paid for the room.' },
  'venue-badges': { kind: 'statement', kicker: 'Check-in', text: 'Nine kinds of badge.', emphasis: 'Nine' },
  'venue-merch': { kind: 'statement', kicker: 'Volunteer merch desk', text: 'Cups and totes.', emphasis: 'totes.' },
  'people-359': { kind: 'stat', value: '359', label: 'People in the room' },
  'people-split': {
    kind: 'numbers', title: 'Where 359 comes from',
    items: [
      { value: '267', label: 'Paid tickets' },
      { value: '63', label: 'Complimentary tickets', tone: 'neutral' },
      { value: '19', label: 'Speakers and MCs without a ticket', tone: 'neutral' },
      { value: '10', label: 'Staff and volunteers without a ticket', tone: 'neutral' },
    ],
  },
  'year-numbers': {
    kind: 'numbers', title: 'A year in numbers',
    items: [
      { value: '434', label: 'Talk submissions' },
      { value: '1,336', label: 'Commits' },
      { value: '21', label: 'Countries in the room' },
      { value: '53,277', label: 'Slack messages' },
    ],
  },
  chapters: {
    kind: 'code', title: 'Eight chapters',
    lines: ['1  Why on earth', '2  A hard year', '3  The machine', '4  Building the programme', '5  Filling the room', '6  The rollercoaster', '7  What we learned', '8  The final numbers'],
  },

  // ── 1 · Why on earth ───────────────────────────────────────────────────
  'ch1': { kind: 'section', number: '01 · Where it came from', title: 'Why on earth' },
  'meetup-itch': { kind: 'statement', kicker: 'Data gap · W1', text: 'It started at the meetup. Your story: the itch.', emphasis: 'Your story: the itch.' },
  'front-cancel': { kind: 'statement', kicker: 'Screenshot missing · front-cancel.png', text: 'Zurich’s Front Conference cancelled Front 26.', emphasis: 'cancelled' },
  'front-book': { kind: 'statement', kicker: 'Screenshot missing · front-book.png', text: 'And told everyone to book ZurichJS Conf.', emphasis: 'book ZurichJS Conf.' },
  'dying': { kind: 'statement', ground: 'yellow', text: 'Everyone said tech events were dying. So we started one.', emphasis: 'So we started one.' },
  // The stakes: what starting one actually meant.
  'stakes-100k': { kind: 'stat', value: 'CHF 100k', label: 'The minimum it would cost to run ZurichJS Conf.' },
  'stakes-no-cancel': { kind: 'statement', kicker: 'The bookings', text: 'Signed with no way to cancel.', emphasis: 'no way to cancel.' },
  'stakes-split': { kind: 'stat', value: '÷ 3', tone: 'warn', label: 'If we fell short, three of us would cover the gap from our own pockets.' },
  'stakes-covered': { kind: 'statement', text: 'Nobody had to pay it out of pocket.', emphasis: 'Nobody' },
  // The other idea: affordable, in Europe's most expensive city.
  // ── The gate: the pricing story as split-flap departure boards ──
  'affordable-idea': {
    kind: 'flapboard', title: 'The other idea',
    columns: [{ width: 28 }],
    rows: [
      { cells: ['ONE OF THE MOST AFFORDABLE'], highlight: true },
      { cells: ['CONFERENCES IN EUROPE,'] },
      { cells: ['IN ITS MOST EXPENSIVE CITY.'] },
    ],
  },
  'price-compare': {
    kind: 'flapboard', title: 'Half the price of London',
    source: 'Regular ticket, 2026 (JSWorld: 2027) · official pages · ECB, 11 Sep 2026',
    columns: [{ label: 'Destination', width: 22 }, { label: 'Ticket', width: 7, align: 'right' }],
    rows: [
      { cells: ['REACT PARIS', 'CHF 614'] },
      { cells: ['REACT ADVANCED LONDON', 'CHF 595'] },
      { cells: ['REACT SUMMIT AMSTERDAM', 'CHF 567'] },
      { cells: ['REACT DAY BERLIN', 'CHF 515'] },
      { cells: ['JSWORLD AMSTERDAM', 'CHF 377'] },
      { cells: ['VOXXED DAYS ZURICH', 'CHF 360'] },
      { cells: ['ZURICHJS CONF', 'CHF 295'], highlight: true },
      { cells: ['JSHEROES CLUJ', 'CHF 198'] },
    ],
  },
  'value-grid': {
    kind: 'flapboard', title: 'What the ticket gets you',
    source: 'Official sites and ticket pages, 2026 (JSWorld price: 2027) · dash: not listed',
    columns: [
      { label: 'Included', width: 18 }, { label: 'ZurichJS', width: 5 }, { label: 'Berlin', width: 5 },
      { label: 'Summit', width: 5 }, { label: 'Paris', width: 5 }, { label: 'JSWorld', width: 5 },
    ],
    rows: [
      { cells: ['TICKET, CHF', '295', '515', '567', '614', '377'], highlight: true },
      { cells: ['LUNCH AND COFFEE', 'YES', 'YES', 'YES', 'YES', '-'] },
      { cells: ['SAME-CALIBRE TALKS', 'YES', 'YES', 'YES', 'YES', 'YES'] },
      { cells: ['T-SHIRT', 'YES', '-', '-', '-', '-'] },
      { cells: ['GOODIE BAG, MERCH', 'YES', '-', '-', '-', '-'] },
      { cells: ['TALK RECORDINGS', 'YES', '-', '-', 'YES', '-'] },
      { cells: ['WARM-UP MEETUP', 'YES', '-', '-', 'YES', '-'] },
      { cells: ['STUDENT TICKETS', 'YES', 'YES', '-', '-', '-'] },
      { cells: ['AFTER-PARTY', 'VIP', 'YES', 'YES', 'YES', 'YES'] },
      { cells: ['REMOTE DAY', 'NO', 'YES', 'YES', '-', '-'] },
      { cells: ['WORKSHOPS', 'EXTRA', 'EXTRA', 'EXTRA', 'EXTRA', '-'] },
    ],
  },
  'workshop-compare': {
    kind: 'flapboard', title: 'Workshops at Paris prices, in Zurich',
    source: 'List price · React Paris official site · ECB rate 11 Sep 2026',
    columns: [{ label: 'Workshop', width: 18 }, { label: 'Length', width: 6 }, { label: 'Price', width: 7, align: 'right' }],
    rows: [
      { cells: ['ZURICHJS CONF', '4H', 'CHF 250'], highlight: true },
      { cells: ['REACT PARIS', '4H', 'CHF 236'] },
      { cells: ['ZURICHJS CONF, VIP', '4H', 'CHF 200'] },
      { cells: ['ZURICHJS CONF', '2H', 'CHF 150'] },
    ],
  },
  'vip-vs-standard': {
    kind: 'flapboard', title: 'Standard or VIP',
    columns: [{ label: 'Two tickets', width: 23 }, { label: 'Standard', width: 8 }, { label: 'VIP', width: 8 }],
    rows: [
      { cells: ['TICKET', 'CHF 295', 'CHF 495'], highlight: true },
      { cells: ['DAY, LUNCH, SHIRT, BAG', 'YES', 'YES'] },
      { cells: ['WARM-UP MEETUP', 'YES', 'YES'] },
      { cells: ['AFTER-PARTY', 'NO', 'YES'] },
      { cells: ['LIMITED-EDITION GOODIES', 'NO', 'YES'] },
      { cells: ['20% OFF WORKSHOPS', 'NO', 'YES'] },
    ],
  },
  'vip-business-class': {
    kind: 'flapboard', title: 'Why VIP',
    columns: [{ width: 18 }],
    rows: [
      { cells: ['BUSINESS CLASS'] },
      { cells: ['PAYS FOR ECONOMY.'], highlight: true },
    ],
  },
  'vip-funds': {
    kind: 'flapboard', title: 'Business class funds economy',
    columns: [{ label: 'The extra spend', width: 20 }, { label: 'Total', width: 9, align: 'right' }],
    rows: [
      { cells: ['VIP TICKETS', '46'] },
      { cells: ['WORKSHOP SALES', 'CHF 14.4K'], highlight: true },
      { cells: ['STUDENT, UNEMPLOYED', '33'] },
    ],
  },
  'first-commit': { kind: 'stat', value: '3 Nov 2025', label: 'First commit. First ticket sold ten days later.' },

  // ── 2 · A hard year ────────────────────────────────────────────────────
  'ch2': { kind: 'section', number: '02 · Three problems', title: 'A hard year' },
  'hardest-year': { kind: 'statement', text: 'One of the hardest years in a decade to run a JavaScript conference.', emphasis: 'hardest years in a decade' },
  'react-advanced': { kind: 'stat', value: '−50%', label: 'Ticket sales at React Advanced London', tone: 'bad' },
  'react-alicante': { kind: 'stat', value: '−200', label: 'Seats at React Alicante versus last year', tone: 'bad' },
  'renamed': {
    kind: 'numbers', title: 'Conferences renamed themselves',
    items: [
      { value: 'Web Engineering London', label: 'Was React Advanced', tone: 'neutral' },
      { value: 'CityAI', label: 'Was CityJS', tone: 'neutral' },
    ],
  },
  'last-editions': {
    kind: 'numbers', title: 'Or announced their last edition',
    items: [
      { value: 'React India', label: 'Last edition this year', tone: 'warn' },
      { value: 'JSWorld', label: '2027 is the last', tone: 'warn' },
      { value: 'Devoxx Belgium', label: '2027 likely the last', tone: 'warn' },
      { value: 'Front Conference', label: 'Front 26 cancelled', tone: 'bad' },
    ],
  },
  'layoffs': { kind: 'statement', text: 'Layoffs everywhere. Sponsorship budgets cut.', emphasis: 'budgets cut.' },
  'sponsor-tiers': {
    kind: 'bars', title: 'Half our sponsors were the smallest tier', source: 'Paid sponsor deals by tier',
    bars: [
      { label: 'Platinum', value: 2, tone: 'neutral' },
      { label: 'Gold', value: 2, tone: 'neutral' },
      { label: 'Silver', value: 3, tone: 'neutral' },
      { label: 'Bronze', value: 5, tone: 'neutral' },
      { label: 'Supporter', value: 12, tone: 'hero' },
    ],
  },
  'no-diamond': { kind: 'stat', value: '0', label: 'Diamond sponsors. One cancelled, one never left draft.', tone: 'warn' },
  'money-late': {
    kind: 'bars', title: 'And the money came late', source: 'Sponsor deals paid per month, 2026',
    bars: [
      { label: 'Feb', value: 1, tone: 'neutral' }, { label: 'Mar', value: 0, tone: 'neutral' }, { label: 'Apr', value: 0, tone: 'neutral' },
      { label: 'May', value: 7, tone: 'neutral' }, { label: 'Jun', value: 1, tone: 'hero' }, { label: 'Jul', value: 5, tone: 'hero' },
      { label: 'Aug', value: 7, tone: 'hero' }, { label: 'Sep', value: 3, tone: 'hero' },
    ],
  },
  'price-sensitive': { kind: 'statement', kicker: 'Faris adds what he saw', text: 'Buyers were price-sensitive.', emphasis: 'price-sensitive.' },
  'expensive': { kind: 'stat', value: '14', label: 'Of 112 survey respondents found it expensive. 98 said good, excellent or just right.', tone: 'neutral' },
  'ai-changed': { kind: 'statement', text: 'AI changed what people submitted.', emphasis: 'AI' },
  'ai-share': { kind: 'stat', value: '40%', label: 'Of CFP submissions mentioned AI. 171 of 428 analysed.' },
  'three-problems': { kind: 'statement', ground: 'yellow', text: 'Three problems, and AI pressed on every one: from the top and from the bottom.', emphasis: 'from the top and from the bottom.' },
  // ── The AI squeeze, as a cash machine: who would pay, and for what ──
  'atm-insert': { kind: 'atm', kicker: 'Funding ZurichJS Conf', title: 'Please insert your card.', step: 'insert' },
  'atm-sponsors': {
    kind: 'atm', kicker: 'From the top · Sponsors', title: 'What would you like to fund?',
    options: [{ label: 'A booth' }, { label: 'A sponsored talk slot' }, { label: 'Your logo' }, { label: 'Only AI on the agenda' }],
    selected: [1, 3],
  },
  'atm-declined': {
    kind: 'atm', kicker: 'From the top · Sponsors', title: 'Sponsored talk slot',
    message: 'Declined. Talks are not for sale.', tone: 'bad', note: 'It broke against our values',
  },
  'atm-companies': {
    kind: 'atm', kicker: 'From the top · Companies', title: 'Fund a ticket for your team?',
    options: [{ label: 'An AI conference', value: 'YES' }, { label: 'Anything else', value: 'NO BUDGET' }],
    selected: [0],
  },
  'atm-speakers': {
    kind: 'atm', kicker: 'From the bottom · Speakers', title: 'Which talk will get picked?',
    options: [{ label: 'The one about AI' }, { label: 'The one you know best' }],
    selected: [0], note: 'CFP: 171 of 428 analysed submissions mentioned AI',
  },
  'atm-attendees': {
    kind: 'atm', kicker: 'From the bottom · Attendees', title: 'What do you want next year?',
    options: [
      { label: 'JS and TS deep dives', value: '75' }, { label: 'Real-world case studies', value: '71' },
      { label: 'Performance', value: '66' }, { label: 'AI', value: '48' },
    ],
    selected: [0], note: 'Survey, topics wanted next year · 112 responses · pick several',
  },
  'atm-taste': {
    kind: 'atm', kicker: 'From the bottom · Attendees', title: 'And if it is AI?',
    options: [{ label: 'AI slop', value: 'NO' }, { label: 'Grounded engineering', value: 'YES' }],
    selected: [1], message: 'Mature and tasteful, blended with the fundamentals.',
  },
  'atm-repitch': {
    kind: 'atm', kicker: 'So we changed how we asked', title: 'New language for every stream.',
    options: [{ label: 'Sponsors' }, { label: 'Companies' }, { label: 'Speakers' }, { label: 'Attendees' }],
    selected: [0, 1, 2, 3],
  },
  'atm-dispense': { kind: 'atm', kicker: 'Funding ZurichJS Conf', title: 'Please take your card and your cash.', step: 'dispense' },

  // ── 3 · The machine ────────────────────────────────────────────────────
  'ch3': { kind: 'section', number: '03 · Four people, day jobs, one app', title: 'The machine' },
  'small-team': {
    kind: 'numbers', title: 'A small team, and an admin that did the rest',
    items: [
      { value: '4', label: 'Organisers' },
      { value: '15', label: 'CFP reviewers', tone: 'neutral' },
      { value: '13', label: 'Door staff', tone: 'neutral' },
    ],
  },
  'slack-people': {
    kind: 'bars', title: 'Four people, 51,202 messages', source: 'Active days: Faris 396 · Bogdan 382 · Nadja 327 · Colin 327',
    bars: [
      { label: 'Faris', value: 20354, tone: 'hero' },
      { label: 'Bogdan', value: 19954, tone: 'neutral' },
      { label: 'Nadja', value: 6979, tone: 'neutral' },
      { label: 'Colin', value: 3915, tone: 'neutral' },
    ],
  },
  'slack-share': { kind: 'stat', value: '96%', label: 'Of all Slack messages came from the four of us. 51,202 of 53,277.' },
  'slack-days-off': { kind: 'stat', value: '3', label: 'Days without a single message, out of 397.', tone: 'neutral' },
  'slack-peak': { kind: 'stat', value: '836', label: 'Messages on 3 September. Our busiest day, a week before doors opened.' },
  'brand': { kind: 'statement', kicker: 'Data gap · M1', text: 'Brand and design.', emphasis: 'design.' },
  'timeline': {
    kind: 'numbers', title: 'Ten months from first commit to the door',
    items: [
      { value: '3 Nov', label: '2025 · First commit', tone: 'neutral' },
      { value: '13 Nov', label: '2025 · First ticket sold', tone: 'neutral' },
      { value: '29 Dec', label: '2025 · CFP opens', tone: 'neutral' },
      { value: '3 Apr', label: '2026 · CFP closes', tone: 'neutral' },
      { value: '31 Aug', label: '2026 · Door check-in ships', tone: 'neutral' },
      { value: '9–12 Sep', label: '2026 · Conference week' },
    ],
  },
  'commits': {
    kind: 'bars', title: '1,336 commits', source: 'Commits per month · busiest week 27 Jul to 2 Aug, 91 commits',
    bars: [
      { label: 'Nov', value: 137, tone: 'neutral' }, { label: 'Dec', value: 87, tone: 'neutral' }, { label: 'Jan', value: 96, tone: 'neutral' },
      { label: 'Feb', value: 116, tone: 'neutral' }, { label: 'Mar', value: 83, tone: 'neutral' }, { label: 'Apr', value: 158, tone: 'neutral' },
      { label: 'May', value: 191, tone: 'hero' }, { label: 'Jun', value: 92, tone: 'neutral' }, { label: 'Jul', value: 173, tone: 'neutral' },
      { label: 'Aug', value: 104, tone: 'neutral' }, { label: 'Sep', value: 99, tone: 'neutral' },
    ],
  },
  'agent-prs': { kind: 'stat', value: '58%', label: 'Of 281 PRs came from agent branches. 145 Claude · 11 Cursor · 8 Codex.' },
  'agent-share': {
    kind: 'bars', title: 'From helper to default', unit: '%', source: 'Agent share of merged PRs',
    bars: [
      { label: 'Nov', value: 12, tone: 'neutral' }, { label: 'Dec', value: 50, tone: 'neutral' }, { label: 'Jan', value: 0, tone: 'neutral' },
      { label: 'Feb', value: 53, tone: 'neutral' }, { label: 'Mar', value: 55, tone: 'neutral' }, { label: 'Apr', value: 47, tone: 'neutral' },
      { label: 'May', value: 28, tone: 'neutral' }, { label: 'Jun', value: 68, tone: 'neutral' }, { label: 'Jul', value: 89, tone: 'hero' },
      { label: 'Aug', value: 85, tone: 'neutral' }, { label: 'Sep', value: 71, tone: 'neutral' },
    ],
  },
  'my-job': {
    kind: 'numbers', title: 'My job changed',
    items: [
      { value: '56 → 1', label: 'My own commits, May to August', tone: 'neutral' },
      { value: '119', label: 'Agent commits in July' },
    ],
  },
  'app-grew': {
    kind: 'numbers', title: 'What the app grew into',
    items: [
      { value: '1 → 133', label: 'Test files' },
      { value: '266', label: 'API route files', tone: 'neutral' },
      { value: '108', label: 'Database migrations', tone: 'neutral' },
    ],
  },

  // ── 4 · Building the programme ─────────────────────────────────────────
  'ch4': { kind: 'section', number: '04 · 434 ideas, 9 picked', title: 'Building the programme' },
  'submissions': {
    kind: 'numbers', title: '434 talk submissions',
    items: [
      { value: '347', label: 'Talks' },
      { value: '47', label: 'Lightning talks', tone: 'neutral' },
      { value: '40', label: 'Workshops', tone: 'neutral' },
    ],
  },
  'final-week': {
    kind: 'bars', title: 'A quarter arrived in the final week', source: 'CFP submissions per week, 29 Dec to 3 Apr',
    bars: [
      { label: 'Week 1', value: 44, tone: 'neutral' }, { label: 'Week 2', value: 33, tone: 'neutral' }, { label: 'Week 3', value: 30, tone: 'neutral' },
      { label: 'Week 4', value: 18, tone: 'neutral' }, { label: 'Week 5', value: 8, tone: 'neutral' }, { label: 'Week 6', value: 23, tone: 'neutral' },
      { label: 'Week 7', value: 6, tone: 'neutral' }, { label: 'Week 8', value: 12, tone: 'neutral' }, { label: 'Week 9', value: 14, tone: 'neutral' },
      { label: 'Week 10', value: 9, tone: 'neutral' }, { label: 'Week 11', value: 18, tone: 'neutral' }, { label: 'Week 12', value: 38, tone: 'neutral' },
      { label: 'Week 13', value: 60, tone: 'neutral' }, { label: 'Week 14', value: 121, tone: 'hero' },
    ],
  },
  'reviews': { kind: 'stat', value: '2,489', label: 'Reviews from 15 reviewers. About 166 each.' },
  'accepted': { kind: 'stat', value: '9', label: 'Accepted from 434. 6 talks, 3 workshops, 5 waitlisted.' },
  'fundamentals': {
    kind: 'numbers', title: 'But attendees asked for fundamentals',
    items: [
      { value: '75', label: 'Want more JS and TS deep dives' },
      { value: '48', label: 'Want more AI', tone: 'neutral' },
    ],
  },
  'speakers-flew': {
    kind: 'bars', title: '18 of 21 speakers flew in', source: '5 from North America · 9 countries · 3 did not fly',
    bars: [
      { label: 'USA', value: 3, tone: 'hero' }, { label: 'Germany', value: 3, tone: 'neutral' }, { label: 'Canada', value: 2, tone: 'hero' },
      { label: 'Netherlands', value: 2, tone: 'neutral' }, { label: 'Austria', value: 2, tone: 'neutral' }, { label: 'UK', value: 2, tone: 'neutral' },
      { label: 'Spain', value: 2, tone: 'neutral' }, { label: 'Czechia', value: 1, tone: 'neutral' }, { label: 'Portugal', value: 1, tone: 'neutral' },
    ],
  },
  'workshops': { kind: 'stat', value: '6', label: 'Workshops, 80 seats. Workshop day, 10 September.' },

  // ── 5 · Filling the room ───────────────────────────────────────────────
  'ch5': { kind: 'section', number: '05 · Price, channels, people', title: 'Filling the room' },
  // The road: one globe that flies every trip in date order by itself, then lands on the totals.
  'road-moments': { kind: 'moments', kicker: 'On the road, in pictures', from: '2025-09', to: '2026-09', moments: MOMENTS, totals: MOMENT_TOTALS, hold: 3 },
  'road': { kind: 'journey', title: 'Taking ZurichJS on the road', journey: ROAD_TO_ZURICH, step: 0, play: true },
  'price-stages': {
    kind: 'bars', title: 'Five price stages', source: 'Paid tickets per stage',
    bars: [
      { label: 'Blind bird', value: 20, tone: 'neutral' }, { label: 'Early bird', value: 81, tone: 'neutral' },
      { label: 'General', value: 110, tone: 'hero' }, { label: 'Late bird', value: 37, tone: 'neutral' },
      { label: 'Last minute', value: 19, tone: 'neutral' },
    ],
  },
  'when-bought': {
    kind: 'bars', title: 'When people bought', source: 'Paid tickets per month',
    bars: [
      { label: 'Nov', value: 3, tone: 'neutral' }, { label: 'Dec', value: 16, tone: 'neutral' }, { label: 'Jan', value: 10, tone: 'neutral' },
      { label: 'Feb', value: 22, tone: 'neutral' }, { label: 'Mar', value: 35, tone: 'neutral' }, { label: 'Apr', value: 21, tone: 'neutral' },
      { label: 'May', value: 11, tone: 'neutral' }, { label: 'Jun', value: 34, tone: 'hero' }, { label: 'Jul', value: 50, tone: 'hero' },
      { label: 'Aug', value: 39, tone: 'hero' }, { label: 'Sep', value: 26, tone: 'hero' },
    ],
  },
  'last-100-days': { kind: 'stat', ground: 'yellow', value: '56%', label: 'Of paid tickets sold in the last 100 days. 149 of 267, from 1 June.' },
  'ways-in': {
    kind: 'numbers', title: 'So we built ways in',
    items: [
      { value: '96', label: 'Tickets with a discount code' },
      { value: '33', label: 'Student and unemployed tickets', tone: 'neutral' },
      { value: '41', label: 'Via community partner codes', tone: 'neutral' },
    ],
  },
  'invoices': { kind: 'stat', value: '30', label: 'Company tickets, all paid by invoice. 9 invoices, all bank transfer.', tone: 'neutral' },
  'currencies': { kind: 'stat', value: '1 in 5', label: 'Tickets paid in EUR, GBP or USD. 55 EUR · 5 GBP · 4 USD.' },
  'heard-from': {
    kind: 'bars', title: '1 in 3 heard from a friend or colleague', source: 'How survey respondents heard about it (106 answered)',
    bars: [
      { label: 'Friend or colleague', value: 38, tone: 'hero' }, { label: 'Meetup', value: 20, tone: 'neutral' },
      { label: 'Web search', value: 17, tone: 'neutral' }, { label: 'Social', value: 16, tone: 'neutral' },
      { label: 'Speakers', value: 9, tone: 'neutral' },
    ],
  },
  'partners': { kind: 'stat', value: '80', label: 'Community partners. 41 tickets, 24 of them from outside Switzerland.' },
  'august-traffic': {
    kind: 'bars', title: 'Ads made August look huge', source: 'Visitors per month · about 7,500 of August came from ads',
    bars: [
      { label: 'Dec', value: 565, tone: 'neutral' }, { label: 'Jan', value: 1618, tone: 'neutral' }, { label: 'Feb', value: 862, tone: 'neutral' },
      { label: 'Mar', value: 1048, tone: 'neutral' }, { label: 'Apr', value: 1072, tone: 'neutral' }, { label: 'May', value: 1324, tone: 'neutral' },
      { label: 'Jun', value: 2556, tone: 'neutral' }, { label: 'Jul', value: 3193, tone: 'neutral' }, { label: 'Aug', value: 10385, tone: 'warn' },
      { label: 'Sep', value: 4408, tone: 'neutral' },
    ],
  },
  'newsletter': { kind: 'stat', value: '1,215', label: 'Visitors from one newsletter on 28 July. One of the busiest days before the event.' },
  'ads': {
    kind: 'numbers', title: 'Ads brought traffic, not buyers',
    items: [
      { value: '0.28%', label: '25 of 8,901 ad visitors bought', tone: 'warn' },
      { value: '0.85%', label: '131 of 15,364 everyone else', tone: 'good' },
    ],
  },
  'cart': { kind: 'stat', value: '1 in 4', label: 'Cart viewers went on to check out. Most dropped off at the details step.', tone: 'warn' },
  'countries': { kind: 'stat', value: '21', label: 'Countries. 2 in 3 paid tickets from Switzerland.' },
  'abroad': {
    kind: 'bars', title: 'Germany first, then everyone', source: 'Paid tickets from outside Switzerland',
    bars: [
      { label: 'Germany', value: 26, tone: 'hero' }, { label: 'Austria', value: 10, tone: 'neutral' }, { label: 'UK', value: 7, tone: 'neutral' },
      { label: 'Spain', value: 7, tone: 'neutral' }, { label: 'USA', value: 7, tone: 'neutral' }, { label: 'Netherlands', value: 5, tone: 'neutral' },
      { label: 'Poland', value: 5, tone: 'neutral' }, { label: 'Croatia', value: 4, tone: 'neutral' },
    ],
  },
  'swiss-early': {
    kind: 'bars', title: 'Swiss bought early, everyone else later', unit: '%', source: 'International share of paid tickets by stage',
    bars: [
      { label: 'Blind bird', value: 6, tone: 'neutral' }, { label: 'Early bird', value: 22, tone: 'neutral' },
      { label: 'General', value: 44, tone: 'hero' }, { label: 'Late bird', value: 38, tone: 'neutral' },
      { label: 'Last minute', value: 26, tone: 'neutral' },
    ],
  },
  'vip-travel': { kind: 'stat', value: '3×', label: 'More likely to buy VIP if travelling. 35% of international vs 11% of Swiss.' },
  'company-types': {
    kind: 'bars', title: 'Product companies and agencies', source: 'Paid tickets by company type (keyword classification, rough)',
    bars: [
      { label: 'Product', value: 94, tone: 'hero' }, { label: 'Agency', value: 81, tone: 'hero' }, { label: 'Indie', value: 27, tone: 'neutral' },
      { label: 'Enterprise', value: 25, tone: 'neutral' }, { label: 'Finance', value: 21, tone: 'neutral' }, { label: 'Other', value: 16, tone: 'neutral' },
      { label: 'Education', value: 3, tone: 'neutral' },
    ],
  },
  'agencies-local': {
    kind: 'numbers', title: 'Agencies were local, product teams travelled',
    items: [
      { value: '74%', label: 'Of agency tickets from Switzerland', tone: 'neutral' },
      { value: '43%', label: 'Of product-company tickets from abroad' },
    ],
  },

  // ── 6 · The rollercoaster ──────────────────────────────────────────────
  'ch6': { kind: 'section', number: '06 · Highs and lows', title: 'The rollercoaster' },
  'hi-final-week': { kind: 'stat', value: '121', label: 'Submissions in the final week. High · 30 Mar to 3 Apr 2026.', tone: 'good' },
  'lo-1000-rows': { kind: 'stat', value: '1,000', label: 'Rows: a silent limit hid CFP reviews. Fixed days before the CFP closed. Low · 31 Mar 2026.', tone: 'bad' },
  'lo-178': { kind: 'stat', value: '#178', label: 'Removed an obfuscated malicious payload hidden in a build config. Low · 25 May 2026.', tone: 'bad' },
  'hi-july': { kind: 'stat', value: '50', label: 'Tickets sold, our best month. High · July 2026.', tone: 'good' },
  'door-prs': { kind: 'stat', value: '14', label: 'Door check-in PRs merged in one day, 9 days before the event. Low and high · 31 Aug.', tone: 'warn' },
  'arrivals': {
    kind: 'bars', title: 'Everyone arrives at once', source: 'Door scans per 10 minutes from 07:40, 11 Sep',
    bars: [
      { label: '07:40', value: 5, tone: 'neutral' }, { label: '07:50', value: 6, tone: 'neutral' }, { label: '08:00', value: 12, tone: 'neutral' },
      { label: '08:10', value: 24, tone: 'neutral' }, { label: '08:20', value: 21, tone: 'neutral' }, { label: '08:30', value: 29, tone: 'hero' },
      { label: '08:40', value: 20, tone: 'neutral' }, { label: '08:50', value: 11, tone: 'neutral' }, { label: '09:00', value: 5, tone: 'neutral' },
      { label: '09:10', value: 8, tone: 'neutral' }, { label: '09:20', value: 2, tone: 'neutral' }, { label: '09:30', value: 2, tone: 'neutral' },
    ],
  },
  'busiest-day': { kind: 'stat', value: '5,067', label: 'Pageviews: the busiest day of the year. 69% on mobile. /schedule opened 3,729 times over 4 days.' },
  'badges': {
    kind: 'numbers', title: 'On the day',
    items: [
      { value: '253', label: 'Badges picked up of 330 tickets' },
      { value: '222', label: 'T-shirts', tone: 'neutral' },
      { value: '204', label: 'Goodie bags', tone: 'neutral' },
    ],
  },
  'not-in-data': { kind: 'statement', kicker: 'Data gap · R1', text: 'The ones not in the data.', emphasis: 'not in the data.' },

  // ── 7 · What we learned ────────────────────────────────────────────────
  'ch7': { kind: 'section', number: '07 · For anyone who wants to organise something', title: 'What we learned' },
  'execution': { kind: 'statement', kicker: 'Execution', text: 'The plan only counts at the door.', emphasis: 'at the door.' },
  'distribution': { kind: 'statement', kicker: 'Distribution', text: 'Reach people where they buy.', emphasis: 'where they buy.' },
  'pragmatism': { kind: 'statement', kicker: 'Pragmatism', text: 'One app, a boring stack, agents for the grind.', emphasis: 'agents for the grind.' },

  // ── 8 · The final numbers ──────────────────────────────────────────────
  'ch8': { kind: 'section', number: '08 · Did it add up?', title: 'The final numbers' },
  'income': {
    kind: 'bars', title: 'Where the money came from', unit: 'k', source: 'CHF · roughly 170k in · about 2.4k Stripe fees',
    bars: [
      { label: 'Sponsorship', value: 81, tone: 'hero' }, { label: 'Tickets', value: 75, tone: 'neutral' },
      { label: 'Workshops', value: 14, tone: 'neutral' }, { label: 'VIP upgrades', value: 1, tone: 'neutral' },
    ],
  },
  'add-up-q': { kind: 'statement', text: 'Did it add up?', emphasis: 'add up?' },
  'add-up-a': { kind: 'statement', ground: 'yellow', text: 'Just over break even, on roughly CHF 170k of income.', emphasis: 'Just over break even' },
  'rating': { kind: 'stat', value: '4.6', label: 'Out of 5 overall. 112 survey responses, 110 rated 4 or 5.', tone: 'good' },
  'come-back': { kind: 'stat', ground: 'yellow', value: '88%', label: 'Of survey respondents want to come back. 99 of 112.' },
  'thanks': {
    kind: 'numbers', title: 'Thank you',
    items: [
      { value: '24', label: 'Sponsors' },
      { value: '80', label: 'Community partners' },
      { value: '21', label: 'Speakers and MCs' },
      { value: '13', label: 'Door staff and volunteers' },
    ],
  },
  'come-2028': {
    kind: 'numbers', kicker: 'Data gap · O5 · next edition date', title: 'Come in 2028',
    items: [
      { value: 'Come back', label: 'As an attendee or speaker' },
      { value: 'Volunteer', label: 'Help us run the next one', tone: 'neutral' },
      { value: 'Start your own', label: 'Execution, distribution, pragmatism', tone: 'good' },
    ],
  },
} as const satisfies Record<string, Visual>

export type VisualId = keyof typeof VISUALS

const BY_ID: Readonly<Record<string, Visual>> = VISUALS
export const getVisual = (id: string): Visual | undefined => BY_ID[id]
