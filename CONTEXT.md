# Presentation domain

Canonical vocabulary for this repo. Use these words, in this sense, in code,
comments, commits and conversation. If a new concept appears, add it here
before it appears in code.

## Slide
The only navigable unit. One arrow press enters exactly one slide. A slide is
plain data in `src/content/slides.ts`: `id`, `steps`, optional `beat`,
`camera`, `effect`, `notes`.

## Step
The visual a slide shows. Every slide has exactly one: the deck is arrows
only, so a build is a sequence of slides, not Enter presses. (The engine
still models steps; `defineSlides` holds each slide to one.)

## Curtain
A slide's `transition: 'curtain'`: a short fade to black, the camera cuts to
the slide's cue behind it, then fades up. Used on chapter openers; every
other cue change is still one continuous move.

## Dressed
How dressed the venue is on a slide (`dressed`, 0–1): booths, cocktail
tables, backdrop, queue posts, balloons, badges, merch. Carries forward like
fill; the deck starts dressed. Building rises each piece out of the floor;
stripping is instant. Bare, the atrium holds delivery boxes.

## Action
A choreographed set action a slide plays once as it draws in (`action`):
`cut-letters` (a hot wire carves the foam letters out of a block) or
`plug-in` (the speaker's laptop is cabled into the podium dock), `rush`
(Arnau's car races from the airport to Technopark), `mic-up` (an organiser
fits the next speaker's headset in the wings; the check goes green) or
`walk-on` (the speaker walks up the steps to the podium, the camera
following behind), `panel` (the e18e panel seated on stage) or
`group-photo` (everyone on stage, the foam letters held up at the front) or
`carpool` (Colin drives five workshop attendees from Technopark to Livingdocs AG on the `shuttle` cue).
Closed list.

## Fill
How full the auditorium is on a slide (`fill`, 0–1). Carries forward from the
last slide that set it; a change fills or empties the seats in sales order.

## Beat
Narrative metadata grouping slides (`open`, `evidence`, `close`…). No input,
no index, no runtime behaviour.

## Visual
A frozen `{ kind, ...data }` entry in the catalog (`src/content/visuals.ts`),
addressed by id. The data lives here once; every renderer reads it.

## Kind
The closed set of visual forms: `title`, `section`, `statement`, `stat`,
`bars`, `quote`, `image` (optionally titled, with a `mark` outline), `code`, `diff` (a pull request's change to one file; a `hidden` line scrolls through its whitespace to code drawn as redacted blocks),
`numbers` (2–6 number tiles), `calendar` (a split-flap calendar rolling month
by month between two dates), `growth` (lines growing from their start;
`show`/`from` continue it across steps; `marks` flag moments such as a campaign start), `heatmap` (rows of value-shaded
cells, e.g. RSVPs per month per year), `matrix` (a ✓/✗ feature grid, one
column highlighted), `moments` (photos in date order flowing past a month
timeline, then a wall with totals), `flapboard` (an airport split-flap
departures board: columns of flaps that spin and land), `atm` (one screen of
a cash machine: prompt, touch options, a tapped choice; its `step` drives the
machine in the set: card in, cash out), `strike` (one name: struck through and
renamed, or stamped, e.g. Deprecated), `badgetest` (a caption whose `rig`
drives the badge test stand; see Badge test), `inbox` (the call for papers: one envelope per submission flying into a server on the day it came in, a daily histogram and topic bars), `pipeline` (commits running through CI stages month by month, shipped features called out), `chatter` (a year of Slack: a filling channel, team-level figures (never per person), the private / DM / public split), `arrivals` (flights into Zurich on a zoomed globe, one per origin, with a tally), `checkout` (ticket-shop card payments flying into a terminal on the day they were paid, coloured by currency, with payments per day and a by-month histogram), `booking` (booking a flight in an airline's mobile app on a portrait phone: search, the flight, payment, booked; the set shows only its 9:16 column), `split` (one 100% bar divided into shares, with a legend of rounded percentages that add to 100), `timeline` (dated marks along a schematic line, with an optional shaded span), `questions` (an inbox filling up: one card per incoming request, subject lines only, the first alone and then faster and faster), `floorplan` (one room from above in metres: landmarks, booths named on leader lines, an optional zoom out from one booth and optional illustrative walking routes as moving dots that settle into arrows), `video` (a rendered clip, e.g. a Remotion render in `public/video`, played full frame with its sound, then held on its `rest` frame), `journey` (the road-to-Zurich globe:
one leg per step, or with `play` every leg in one autoplaying draw-in). Each
kind has exactly one painter. Adding a kind is a deliberate act (type +
painter + doc), never a one-off.

## Painter
A pure function `(ctx, visual, progress, roles) → void` that draws one kind
onto the frame canvas, reading only the roles of its ground plus `TYPE`/`FRAME`. `progress`
is 0 → 1, already eased; at 1 the visual is settled.

## Frame
The 2560×1440 Canvas 2D every slide is painted on, with a title-safe inset.
It is the single source of pixels for every renderer.

## Renderer
Something that puts the frame in front of the audience:
- **Flat** (`?flat`) — frame straight to the page. Authoring and stage fallback.
- **Stage** (default) — frame as a texture on the screen inside the 3D set.
- **Index** (`?index`) — every slide, settled, as a grid.
- **Presenter** (`?presenter`) — live frame, next step/slide, notes, timer.
  Second window; position syncs with the audience window.

## Medium
The physical object the frame is shown on in 3D, and its shader: the **main
projection screen** at Technopark. One master dial, `effect` (0 = bit-exact
passthrough, 1 = projected light: lifted blacks, soft hotspot). Animating that
dial is a reveal. Every other surface showing the live slide (side screens,
confidence monitor, booth program monitor) shares the same medium material.

## Set
The 3D models and lighting around the screen (`src/scene/`): the Technopark
Zürich Auditorium as it looked at ZurichJS Conf 2026. Authored in metres in
`venue.ts`; built procedurally from reference photos.

## Venue
The measured description of the room the set reproduces (`scene/venue.ts`):
dimensions, surfaces, light colours and camera cue poses, all in metres.

## Camera cue
A named camera destination. `screen` is solved so the frame exactly covers
the viewport at any aspect — the audience cannot tell it is 3D. The others
are poses in the venue: `stage` (from the seats), `room` (back corner, whole
hall), `letters` (low along the foam letters), `podium` (behind the lectern,
looking out), `booth` (behind the operators), `rig` (up in the trusses), `wall`
(down the aisle along the lit wood), `foyer` (registration), `merch` (the
cups and totes), `badges` (the four badge designs on the counter), `atrium`
(from the bridge, down the open hall), `booths` (among the tables, facing
AG Grid), `map` (the whole venue as a labelled cutaway), `projector`
(looking into Foifi's projector lens, the slide filling the frame; solved
like `screen`), `foifi` /
`foifi-screen` (Pause im Foifi), `deploy` (the launch laptop), `cake`, `cabin`
(down the 777's aisle), `seat` (seat 15C, looking straight at the seat-back screen), `seat-full` (that screen filling the frame; solved), `gate` (the Zurich Airport gate lounge, departures board ahead),
`gate-full` (the departures board filling the frame; solved), `apron` (the
plane at the gate, from outside), `atm` (close on the cash machine's screen in
Foifi), `atm-wide` (the whole machine: card slot, keypad, cash), `aerial` (Technopark
at night from above, roofs on), `laptop` (over the speaker's shoulder at the podium: laptop, dock, cables), `shuttle` (high over the city: Technopark, the road and the airport, cars shuttling with speaker portraits, delayed planes holding), `wings` (by the side steps, where speakers are miked up), `walk-on` (behind the speaker at the podium, a full room ahead; arriving from `wings` it follows them up the steps), `signing` (the signing wall in the foyer), `seats` (hovering low over the auditorium's rows), `phone` (over Faris's shoulder in Foifi, his phone in hand), `phone-full` (that phone turned landscape, filling the frame; solved). Cues describe destinations, never timelines. `?cue=<name>`
previews one.

## Space
Which room a camera cue is in: `hall`, `booth`, `foyer`, `atrium`, `foifi`,
`plane` (the 777 cabin), `gate` (the airport lounge and apron), `city`
(Technopark and the airport at once, for the airport runs) or `map`
(the overview).

## Foifi
Pause im Foifi, the Digitec Galaxus event space of the ZurichJS 1st
anniversary, where the story starts. A separate room; reached by flying over
the city.

## Portal
A doorway between two spaces (booth window, back door, hallway, the map's
crane path): waypoints the camera walks through. Every cue change walks the
portal chain; there are no cuts, except a slide's curtain (see Curtain).

## Journey
Trips on the globe: legs (from, to, when, what, team), periods for the
kicker, totals, and the travellers' photos. A leg from home to home is an
event at home: a pulse, no flight.

## Moment
One photo on the road (`content/moments.ts`): date, city, event. Shown by the
`moments` kind. Files in `public/moments/` are 720px with all metadata (GPS) stripped.

## Airport
Zurich Airport at night (`scene/Airport.tsx`): a gate lounge, a SWISS 777-300ER
parked nose-in, and the jet bridge between them. Far east of Technopark. The
camera boards from Foifi through the open front-right door; it leaves through
the jet bridge into the lounge.

## Cutaway
Set geometry that hides in the `map` cue so the overview can see inside:
roofs, ceilings, the rig, the galleries. Done with render layers, never by
adding or removing objects. Roofs hide only while the camera is above them.

## Foyer
The hallway through the hall's two back doors, dressed for registration.

## Atrium
Technopark's open hall beyond the foyer: galleries, lift tower, cocktail
tables and the sponsor booths.

## Sponsor
A company listed on conf.zurichjs.com, with a tier (`headline`, `partner`,
`supporter`) that sets its logo size wherever sponsors are shown.

## Ground
The background a visual sits on, with its full set of roles: `dark` (default)
or `yellow` (moments: title, closing, section, the big statement, the key
stat). Each kind has a default ground; a visual may override it.

## Roles
The semantic colours of one ground (`bg`, `text`, `textMuted`, `accent`,
`emphasis`, …) handed to a painter. Only `tokens.ts` knows raw palette values.

## Tone
A fixed colour meaning used across the whole talk: `hero` (yellow), `neutral`
(blue), `good` (green), `warn` (orange), `bad` (red — errors only). Resolved
through the ground, so on yellow every tone is black.

## Badge test
The `badgetest` kind: the caption for one step of the badge test (one clip,
two attachment points, tested, the takeaway), projected above the check-in
counter. Its `rig` drives the test stand on the counter (`scene/Foyer.tsx`,
`BadgeLab`; the rig ids still say `one-hole` / `two-holes`): the single-clip
badge flips; the two-point badge hangs flat; under stress the single-clip badge
gives way and drops, the two-point one holds. On screen, say clips and
attachment points, never holes. The `lanyards` cue frames
the stand with the projection behind it.
