# ZurichJS Deck

A bespoke, code-driven presentation framework for ZurichJS Conf talks.
Every slide is painted onto one 2D canvas (the **frame**), which is shown
either flat or as the screen of an object in a 3D **set**. Architecture is
reverse-engineered from stolinski/zurich-js ("The True Cost of AI Coding"),
rebuilt in TypeScript with ZurichJS Conf branding.

Vocabulary: see `CONTEXT.md`. Use those terms exactly.

## Stack
Vite 8 · React 19 · TypeScript (strict) · three 0.187 · @react-three/fiber 9 ·
@react-three/drei 10 · zustand 5 · pnpm. No CSS framework: the deck is a
canvas, not a webpage.

## Commands
```bash
pnpm dev                      # http://localhost:5180
pnpm build                    # typecheck + production build
pnpm typecheck
pnpm preview --port 5181 &    # then:
pnpm shot "http://localhost:5181/?still&slide=<id>" out.png          # exact 1920×1080
pnpm record "http://localhost:5181/?slide=<id>" out.mp4 --keys "ArrowRight:3000"   # MP4, needs ffmpeg
```

URL params: `?slide=<id|n>` deep link · `?flat` 2D only · `?index` grid of all
slides · `?presenter` notes/next/timer (open in a 2nd window; syncs over
BroadcastChannel) · `?still` no animation + camera snaps (screenshots) ·
`?cue=<name>` force one camera cue on every slide (preview the set) ·
`?step=<n>` open the linked slide at step n.

Keys: `→`/`←` slides · `0–9` jump · `f` fullscreen. Enter and Space are unbound.
Touch: swipe left/right, or tap the right two thirds (next) / left third (previous).
`?debug` exposes the renderer as `window.__deck` (timing, draw calls).
Space is intentionally unbound.

## Layout
```
src/
  brand/tokens.ts     PALETTE (raw) → TONE · GROUNDS (roles) · TYPE · FRAME · MOTION
  brand/fonts.ts      self-hosted Figtree (conf TTF) + Geist Mono; ensureFonts()
  content/visuals.ts  catalog: id → Visual            ← authoring
  content/slides.ts   running order: defineSlides()   ← authoring
  content/travel.ts   road-to-Zurich trips (journey globe data)
  content/moments.ts  the road in pictures (photo, date, city, event) for `moments`
  engine/             types, validation, store, keys, URL params, frame loop
  painters/           kit.ts primitives + one painter per Kind (journey.ts: the globe)
  renderers/          FlatScreen, Stage (R3F + medium shader + camera rig), SlideIndex, Presenter
  scene/venue.ts      Technopark auditorium in METRES: dims, surfaces, lights, CUES
  scene/textures.ts   procedural, deterministic canvas textures (built once)
  scene/Set.tsx       scaled metre group + show lighting; composes:
    Hall.tsx            floor, walls, gable ceiling, trusses, ducts, screen wall, rig
    Props.tsx           riser + bench, Technopark podium, foam ZurichJS letters, confidence monitor,
                        community roll-up banner
    Seats.tsx           instanced chairs (3 draw calls)
    Booth.tsx           raised control booth: two operator avatars, monitors, mixer, cables
    Foyer.tsx           hallway through the back doors: registration, backdrop, merch table
    Atrium.tsx          open hall: galleries, lift tower, bells, cocktail tables, sponsor booths
    Foifi.tsx           Pause im Foifi (Digitec Galaxus): the 1st anniversary, where tickets went live
    Exterior.tsx        Technopark from outside: six fingers, the spine + entrance, Werkhallen, streets (TP in venue.ts)
    Atm.tsx             a cash machine in Foifi: the AI-squeeze screens; card in, cash out (driven by `atm` step)
    Airport.tsx         Zurich Airport: gate lounge + departures board, jet bridge, SWISS 777-300ER (cabin + exterior)
  scene/sponsors.ts     sponsor manifest (slug, tier) → public/sponsors/<slug>[-color].png
  scene/useSponsorLogos.ts  all logos as loaded images (suspends; preloaded in Set.tsx)
  scene/layers.tsx      render layers: set / cutaway (hidden in `map`) / map (labels only)
  scene/Avatar.tsx      standing volunteer avatar (booth operators are seated, in Booth.tsx)
public/brand/         conf logos (copied from zurichjs-conf/public/images/logo),
                      technopark.png (venue logo, technopark-allianz.ch),
                      rollup.svg (ZurichJS community roll-up art, 1000×2000, all vector),
                      skyline.svg (the skyline layers extracted from rollup.svg)
public/sponsors/      sponsor logos from conf.zurichjs.com (white mono + -color)
public/moments/       road photos, 720px, metadata (GPS) stripped
public/team/          organiser photos from conf.zurichjs.com/about (320px), for the journey
public/fonts/         Figtree variable TTFs (copied from zurichjs-conf)
public/models/        .glb files for the set
```

## Rules (non-negotiable)
1. **Arrows only.** One press = one slide, and every beat is a slide: no
   Enter steps (Faris, 2026-11-08). A build (year one, then year two) is two
   slides; the second can continue the first's animation (e.g. `growth`
   `from`, `heatmap` `from`). `defineSlides` rejects a slide with more than
   one visual.
2. **No DOM content.** Everything legible is painted on the frame. If it is
   not on the frame it does not exist in `?flat` or on the 3D screen.
3. **Slides are data.** No JSX, functions, or callbacks in `slides.ts` or
   `visuals.ts`. If a slide needs new behaviour, add a Kind or a Cue.
4. **Closed catalogs.** New Kind = add to `Visual` union in `engine/types.ts`,
   a painter in `painters/index.ts` (the `PAINTERS` map is exhaustively typed),
   and a line in `CONTEXT.md`. Do not build a generic chart grammar.
5. **Painters read the `Roles` they are handed + `TYPE`/`FRAME` only.** Never
   a hex literal, font string or magic size in a painter, and never `PALETTE`.
   If a value is missing, add a token.
6. **Deterministic.** A painter at `progress = 1` is the settled slide, and a
   deep link + `?still` must reproduce it exactly. No `Math.random`, no
   wall-clock in painters (time comes in as progress).
7. **Stay inside the safe area** (`SAFE` in `painters/kit.ts`). Projectors
   and the medium shader eat the edges.
8. **`effect: 0` is a clean passthrough.** The medium shader must never alter
   pixels at 0, so a `screen` slide is indistinguishable from a flat deck.
9. **Navigation allocates nothing.** No new textures, materials, geometry or
   shaders on slide change. Mutate uniforms/refs; preload in `main.tsx`.
   **Draw only what moves** (`engine/activity.ts`): the stage renders on
   demand; anything that animates calls `keepAwake`. **Only the current venue
   is drawn** (`scene/venues.tsx`): Technopark, Foifi or the airport, with its
   lights; crane shots draw all three. A new room goes in a `<Venue>`; its
   lights stay inside it. Shader combinations are prewarmed at load.
12. **Works on phones.** Touch navigation; in portrait, solved cues widen the lens to fit the
   frame from the same spot (never backing into the room) and poses keep their 16:9 horizontal view.
10. **Offline-safe.** Fonts, images, models are local. No CDN at runtime —
    conference Wi-Fi is not real.
11. `defineSlides()` validates at module load; keep it strict. A bad deck
    must fail `pnpm dev`, not fail on stage.

## Pull requests (enforced)
- Branch from `main`; never push to `main` directly.
- Every PR description has **screenshots** (`## Screenshots`) and a **screen
  recording** (`## Recording`) of what it adds or changes. The `PR media`
  workflow fails the PR without both. Before and after for changed slides.
- Keep descriptions short and plain: what changed, why, which slides. Use
  the template (`.github/pull_request_template.md`).
- `CI` must pass (`pnpm install --frozen-lockfile && pnpm build`, the same as
  Netlify).

## Verifying changes
- `pnpm build` must pass (it typechecks).
- For any visual change, screenshot the affected slides with `pnpm shot` at
  1920×1080 in both `?flat&still` and `?still`, and look at them. A build
  passing is not visual approval.
- CLI `--screenshot` with `--virtual-time-budget` renders WebGL blank; use
  `scripts/shot.mjs` (real frame loop over CDP).

## Brand (ZurichJS Conf)
Source of truth: `~/Desktop/zurichjs-conf/src/styles/globals.css` `@theme`.
Copied into `PALETTE`; never import across repos.
- Accent yellow `#F1E271` (secondary `#EDC936`, light `#F5EC9A`, dark `#E8D54E`)
- Surfaces `#0A0A0A` page → `#19191B` → `#242528` → `#2F2F33`
- Brand blue `#268BCC`, orange `#EA561D`, green `#31A853`, red `#EA1D35`, VIP `#F26A3C`
- Text white `#FFFFFF`, secondary `#E5E7EB`, muted `#94A3B8`
- Type: Figtree (variable 300–900); Geist Mono (variable) for labels and code
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` (conf `--easing-smooth`)
- Logos: `public/brand/` — conf wordmark white (dark ground) and black (yellow ground), square mark, full lockup

## Brand decisions (Faris, 2026-11-08)
- **Colour = full palette with fixed meanings** (`TONE`): hero yellow · neutral
  blue · good green · warn orange · bad red (errors/failure only). A colour
  never means two things in one talk. Untoned chart series go
  hero → neutral → warn → good.
- **Grounds**: dark `#0A0A0A` by default. **Yellow ground** for moments only:
  title & closing, section breaks (`section` kind), the one big statement,
  the key stat. On yellow, all text and tones are black; statement emphasis
  becomes an underline.
- **Type: big & tight.** Sentence case, Figtree 800, −2% tracking for display.
  Geist Mono UPPERCASE, +12% tracking for kickers, labels, chart values,
  sources, code. Labels ≥ 48px on the frame.
- **Chrome: conf wordmark bottom-left only.** No slide numbers, no footer.
- **Motion: subtle rise.** Fade + 40px rise, 0.9s, conf smooth easing,
  staggered per element/line/bar.
- **Aspect: 16:9** (frame 2560×1440, single token in `FRAME`).
- **Presenter view: yes** (`?presenter`).
- **Deploy: Netlify** (`netlify.toml`, publishes `dist`). pnpm version is
  pinned in `package.json` (`packageManager`); Node 24.

## Set decisions (Faris, 2026-11-08)
- **Set = Technopark Zürich Auditorium** (318 m²), built procedurally from the
  2026 conference photos. Authored in metres (`scene/venue.ts`), scaled by `M`
  so the frame plane stays 16 units wide at the origin. No .glb files so far.
- **Medium = the main projection screen.** `effect` 1 = projected light: lifted
  blacks, soft hotspot. The one medium material is shared by every surface
  that shows the live slide (side screens, confidence monitor, booth program).
- **Camera = an attendee's POV.** Every cue change is one move: a walk at eye
  height (1.65 m) through the portals between rooms (booth window, back door,
  hallway), eyes level and looking ahead, turning to the subject on arrival;
  or a crane shot to and from the `map`. Height is a separate monotone ramp
  (no bobbing). Roofs hide only while the camera is above them. No cuts,
  with one exception from the 9 Nov 2026 review (to confirm): a slide with
  `transition: 'curtain'` (chapter openers ch3 to ch8) fades to black, cuts,
  and fades up at its cue, instead of flying out and back in.
  Portals live in `PORTALS` (venue.ts); a new room needs a portal.
- **Camera cues**: `screen` (solved) · `stage` · `room` · `letters` · `podium`
  · `booth` · `rig` · `wall` · `foyer` · `badges` · `merch` · `atrium` ·
  `booths` · `map` · `cabin` · `seat` · `gate` · `gate-full` · `apron` · `atm` · `atm-wide` · `aerial` · `seats` · `laptop` · `shuttle` · `wings` · `walk-on`. Poses
  live in `CUES` (venue.ts). Each cue has a `space` (`hall` | `booth` |
  `foyer` | `atrium` | `map`); moves inside a room glide, so a new cue needs
  a clear line to its neighbours in that room.
- **`map` cue** = the whole venue as a labelled cutaway from above. Anything
  overhead (roofs, ceilings, rig, galleries) goes inside `<Cutaway>`; map-only
  labels inside `<MapOnly>`. The camera switches its layer mask per cue.
  New overhead geometry must be wrapped, or it will block the map.
- **Badges** follow the final print PDFs (portrait, one shared layout): Attendee
  yellow, VIP blue, Volunteer orange, Speaker / MC / Panelist / Instructor
  green, Sponsor black with the sponsor's logo, Organizer inverted (orange top,
  white skyline). Shared back: "Let's connect!", a decorative (not scannable)
  QR, Vercel / namespace / AG Grid / Smallpdf. Names are always placeholders:
  real attendee data never goes in the deck.
- **Volunteers**: simple standing avatars in team shirts wearing their badge
  (Volunteer or Organizer), behind check-in and at the merch table.
- **Atrium** beyond the foyer: ground + three gallery levels, glass lift tower
  with the Technopark sign, bell pendants, cocktail tables, sponsor booths
  (namespace wall, AG Grid table + roll-ups, PrimeUI, CopilotKit, ZurichJS).
- **Sponsor logos** come from conf.zurichjs.com, stored locally. The backdrop's
  dark band and the booth's sponsor-loop monitor share one layout
  (`drawSponsorBand`). Third-party logos that are not sponsors (namespace's
  customer grid) are left as blank tiles.
- **Foyer = the hallway through the two back doors** (doors propped open),
  set up for registration: backdrop, check-in counter with the live slide
  projected on the concrete, queue posts, A–K / L–S / T–Z signs, balloons,
  volunteer merch table (cups, totes). The booth sits above it.
- **People** in the booth are simple avatars (seen from behind); attendees
  are not modelled.
- **Show lighting**: house down and warm, stage wash, podium pin. No shadows.
- Group/team photos belong on the frame (`image`), not in the set.

## Opening (decided with Faris, 2026-11-08)
- The talk starts at the **ZurichJS 1st anniversary, Pause im Foifi** (Digitec
  Galaxus), where conf.zurichjs.com went live and ticket sales opened five
  minutes before the meetup. Jonny Burger bought the first ticket; a t-shirt
  order hit the ticket webhook and was issued a ticket. Cover is full screen,
  looking into the lens of Foifi's ceiling projector (`projector`); the next
  slide backs out of the projector's eye and flips round to the screen (a
  choreographed `enter` on the `foifi` cue). After the
  cake, the camera flies over the city to Technopark ("ten months later").
- Foifi (`scene/Foifi.tsx`): square-grid galvanised glazing onto the night
  street on three sides, demijohn shelf, planter ledge, blue ceiling, steel
  grids with moss baskets, pothos, globes, disco balls, LED tubes, yellow
  columns, pink bar against the one orange wall, colourful slatted chairs,
  red presenter table. Date flagged: 14 Nov (Faris) vs 13 Nov (other sources).
- The cover credits the ZurichJS team, not one person.
- **Rolling back a year** (after the cake): the camera dives into Foifi's
  screen (`foifi-full`), a flip calendar rolls 14 Nov 2025 → 14 Nov 2024 (the
  meetup relaunch), then the meetup's numbers from Meetup.com group stats
  (export 8 Nov 2026): a growth chart from 0 at the relaunch, then a 2026 slide that
  continues its lines, and an RSVP heatmap by month, then a 2026 slide that
  adds year two. 2026 gets its own slides so the arrows reach it. The 257
  members from before the relaunch are treated as inactive (per Faris), so
  members count from 0. The candle on the cake is lit.
- **The stakes** sit right after "So we started one": CHF 100k minimum (huge, on dark
  right after the yellow "So we started one"),
  bookings signed with no way to cancel, ÷ 3 (shortfall from three
  organisers' own pockets). Paid off after "Just over break even": "Nobody
  had to pay it out of pocket."
- **The other idea:** affordable in Europe's most expensive city (Numbeo 2025),
  then a price comparison: regular 2026 in-person tickets in CHF from the
  official pages (ECB 11 Sep 2026). Sources and full price ranges live in the
  slide notes.
- **The flight (Faris, 2026-11-09):** after the globe, the camera rises out of
  Foifi and flies to a SWISS 777-300ER at a Zurich Airport gate, boards through the
  open front-right door, and the road photos play on a seat-back screen
  (`seat`; the `moments` slide holds 5.5 s for the trip). The next slide
  walks off through the jet bridge into the gate lounge, where the pricing
  block (the other idea, price comparison, value grid, workshops, VIP) plays
  on the departures board (`gate-full`). Then a crane shot to the Technopark map.
- **The AI squeeze (Faris, 2026-11-09):** `three-problems` sets up AI pressing
  from the top (sponsors wanting talk slots or AI, companies only funding AI
  tickets) and from the bottom (speakers pivoting, attendees wanting less AI,
  no slop). Then a cash machine at Foifi plays it screen by screen (`atm` kind,
  `atm` / `atm-wide` cues): card in, the options, declined, re-pitch, card and
  cash out. Survey and CFP numbers are sourced; the rest is Faris's account.
- After the meetup numbers, still at Foifi: the agenda, chapter 1 (why on
  earth) and chapter 2 (the hard market, our three problems), then **ZurichJS
  on the road** (the globe) as the answer; then the camera flies to Technopark.

## Deck content (draft, 2026-11-08)
- The talk is the **ZurichJS Conf retrospective**, scaffolded 1:1 from
  `zurichjs-conf-retro-handoff.md` (87 slides) plus the road-to-Zurich globe
  and an optional 5-slide venue flyover. About 24 minutes as drafted, for a
  40-minute talk; the story is reworked in `docs/storyline.md`. Notes carry UNVERIFIED / CHECK / DATA GAP flags from the handoff.
- Handoff house rules kept: no em dashes, never "boundary", never invent
  facts. Visible text is sentence case (this deck's brand), not Start Case.
- **Road to Zurich** (`journey` kind, `play: true`): one slide that plays by
  itself (about 35 s), flying every trip in date order from React Summit US
  (Nov 2025) to RenderATL (Aug 2026), then landing on the totals, per Faris. Team trips
  (blue) per Faris: React Vienna, ReactJS Milano + jsday, CityJS London,
  JSHeroes; Voxxed Days Zurich is a home event. Return trips from Zurich are
  assumed; km is great-circle.

## Technopark from outside (Faris, 2026-11-09)
- Built from OpenStreetMap, the 1993 drawings and the official event-room
  plan: a comb of six office fingers across a spine (the atrium), corrugated
  Werkhallen between them; the auditorium sits in the first north Werkhalle.
  `venue-map` arrives on the `aerial` cue (roofs on); the next slide dives in.
- **Seats fill** with the slide's `fill` (0–1, carried forward): empty over
  the auditorium (`empty-seats`, `ch5`), filling to 267 of 330 paid tickets on
  `price-stages`, full on `people-359`.

## The week before (Nadja and Faris, 9 Nov 2026)
- Chapter 6 tells what was underestimated, from Nadja's account: the venue
  still in boxes two weeks out (`dressed` 0, then built back), the stage
  letters cut by hand three days before (`action: 'cut-letters'`), no stage
  videos a week before until Jonny Burger made them with Remotion, the podium
  setup (one USB-C cable to the dock: screen, sound, wired internet;
  `action: 'plug-in'` on the `laptop` cue), Wi-Fi priced by concurrent
  devices (300 quoted, 120 in budget, 250 bought, about CHF 1,000), Bogdan
  in the booth all day, airport runs (`shuttle` cue: cars on a road from
  Technopark to the airport, not to scale), and Nadja's line closing chapter 7.
- **Airport chaos and transitions (Faris, 9 Nov 2026):** speaker portraits
  float over the shuttling cars (illustrative, not a log of who rode when),
  delayed planes hold over the airport with status tags; an arrivals board
  tells Arnau Gómez Farell's night (UK radar disruption, missed connection
  in Düsseldorf, landed 06:00) and his car races to a 09:00 workshop. Every
  transition: an organiser mics up the next speaker in the wings, the
  camera follows them on stage, the laptop is plugged in; near-zero delays
  all day, 3 to 5 minutes at worst.
- **Videos** come from github.com/JonnyBurger/zurichjs-scenes, rendered at
  1280×720 H.264 into `public/video/` (`ConferenceOpening`, one speaker intro).
  ZurichJS owns them; the stock footage inside is licensed to ZurichJS.
- **The repo is public.** Organisers' raw messages, complaints about people,
  vendor contacts, network names and passwords stay out of slides, notes,
  commits and PR descriptions. Say it neutrally or not at all.

## Open decisions
Track here; resolve with Faris, then update code and move the line above.

- [ ] **Booth print files** — namespace wall and AG Grid roll-ups are rebuilt
      from photos (their logos, their copy); swap in the real print files if
      the sponsors share them.
- [ ] **Real dimensions** — the exterior follows OSM and the 1993 drawings; the
      rooms inside are still estimated from photos (`scene/venue.ts`).
