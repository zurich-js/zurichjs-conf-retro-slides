# Presentation domain

Canonical vocabulary for this repo. Use these words, in this sense, in code,
comments, commits and conversation. If a new concept appears, add it here
before it appears in code.

## Slide
The only navigable unit. One arrow press enters exactly one slide. A slide is
plain data in `src/content/slides.ts`: `id`, `steps`, optional `beat`,
`camera`, `effect`, `notes`.

## Step
One visual within a slide, advanced with **Enter** (Backspace undoes). Arriving
at a slide always starts at step 0, from either direction. Steps let a slide
build (title first, then the plot) without spending an arrow press.

## Beat
Narrative metadata grouping slides (`open`, `evidence`, `close`…). No input,
no index, no runtime behaviour.

## Visual
A frozen `{ kind, ...data }` entry in the catalog (`src/content/visuals.ts`),
addressed by id. The data lives here once; every renderer reads it.

## Kind
The closed set of visual forms: `title`, `section`, `statement`, `stat`,
`bars`, `quote`, `image`, `code`, `numbers` (2–6 number tiles), `journey`
(the road-to-Zurich globe: one leg per step, or with `play` every leg in
one autoplaying draw-in). Each kind has exactly one painter. Adding a kind is a
deliberate act (type + painter + doc), never a one-off.

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
AG Grid), `map` (the whole venue as a labelled cutaway). Cues describe destinations, never timelines. `?cue=<name>`
previews one.

## Space
Which room a camera cue is in: `hall`, `booth`, `foyer`, `atrium`, or `map`
(the overview).

## Portal
A doorway between two spaces (booth window, back door, hallway, the map's
crane path): waypoints the camera walks through. Every cue change walks the
portal chain; there are no cuts.

## Journey
Trips on the globe: legs (from, to, when, what, team), periods for the
kicker, totals, and the travellers' photos. A leg from home to home is an
event at home: a pulse, no flight.

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
