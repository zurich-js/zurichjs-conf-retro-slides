import type { Ground, Tone } from '../brand/tokens'

/** Every visual may override its ground; each kind has a default (see DEFAULT_GROUND). */
interface Base {
  ground?: Ground
}

/**
 * The closed set of things a slide can show. Adding a kind means adding a
 * painter in src/painters — there is no escape hatch for arbitrary JSX.
 */
export type Visual = Base &
  (
    | { kind: 'title'; title: string; subtitle?: string; kicker?: string }
    | { kind: 'section'; number: string; title: string }
    | { kind: 'statement'; text: string; emphasis?: string; kicker?: string }
    | { kind: 'stat'; value: string; label: string; source?: string; tone?: Tone }
    | {
        kind: 'bars'
        title: string
        unit?: string
        source?: string
        /** No tone → series order (hero, neutral, warn, good). */
        bars: readonly { label: string; value: number; tone?: Tone }[]
      }
    | { kind: 'quote'; text: string; author: string; role?: string }
    | { kind: 'image'; src: string; caption?: string; fit?: 'contain' | 'cover' }
    | { kind: 'code'; title?: string; lines: readonly string[]; highlight?: readonly number[] }
    | {
        kind: 'growth'
        title: string
        kicker?: string
        source?: string
        /** One label per point; '' hides it. */
        x: readonly string[]
        /** Every series has one value per point. No tone → hero, neutral, good. */
        series: readonly { label: string; values: readonly number[]; tone?: Tone }[]
        /** Points drawn (default all). */
        show?: number
        /** Point index where the draw-in starts; earlier points are already drawn. */
        from?: number
      }
    | {
        kind: 'heatmap'
        title: string
        kicker?: string
        source?: string
        columns: readonly string[]
        /** One value per column. No tone → hero. */
        rows: readonly { label: string; values: readonly number[]; tone?: Tone }[]
        /** Rows drawn (default all). */
        show?: number
        /** First row that animates in; earlier rows are already drawn. */
        from?: number
      }
    | {
        kind: 'calendar'
        /** ISO dates. The flip calendar rolls month by month from `from` to `to` (either direction). */
        from: string
        to: string
        kicker?: string
        /** Shown under the calendar once it lands. */
        caption?: string
      }
    | {
        kind: 'matrix'
        title: string
        kicker?: string
        source?: string
        /** What is compared: a name and a sub-line (e.g. the price). */
        columns: readonly { label: string; sub?: string }[]
        /** One value per column: 'yes' ✓, 'no' ✗, '-' not listed, or short text. */
        rows: readonly { label: string; values: readonly string[] }[]
        /** Column on a card with a hero outline (usually ours). */
        highlight?: number
      }
    | {
        kind: 'numbers'
        title?: string
        kicker?: string
        /** 2–6 tiles: a big value and what it counts. No tone → hero. */
        items: readonly { value: string; label: string; tone?: Tone }[]
      }
    | {
        kind: 'journey'
        title: string
        journey: Journey
        /** Leg to fly (0-based, date order). `journey.legs.length` = the whole map with totals. */
        step: number
        /** Autoplay: fly every leg from `step` in date order, then land on the totals, in one draw-in. */
        play?: boolean
      }
  )

/** A great-circle route on the `journey` globe. Data lives in src/content/travel.ts. */
export interface Place { name: string; lat: number; lon: number }
export interface Leg {
  from: Place
  to: Place
  when: string
  what: string
  /** Organisers who travelled together on this trip (team trips are drawn in the neutral tone). */
  team?: readonly string[]
}
/** A leg with from === to is an event at home: no flight, a pulse on the map. */
export interface Journey {
  home: Place
  legs: readonly Leg[]
  /** Periods for the kicker: legs [previous end, end) fall in this period. */
  batches: readonly { label: string; end: number }[]
  stats: readonly { value: string; label: string }[]
  /** Who flew solo legs (a name in `people`). */
  solo: string
  /** Name → photo plus the head's crop circle (x, y as fractions of width / height; r of width). */
  people: Readonly<Record<string, { src: string; x: number; y: number; r: number }>>
}

export type VisualKind = Visual['kind']

/** Yellow moments: title & closing and section breaks are yellow unless overridden. */
export const DEFAULT_GROUND: Readonly<Record<VisualKind, Ground>> = {
  title: 'yellow',
  section: 'yellow',
  statement: 'dark',
  stat: 'dark',
  bars: 'dark',
  quote: 'dark',
  image: 'dark',
  code: 'dark',
  numbers: 'dark',
  calendar: 'dark',
  growth: 'dark',
  heatmap: 'dark',
  matrix: 'dark',
  journey: 'dark',
}

/**
 * Named camera destinations. `screen` is solved in src/renderers/Stage.tsx;
 * the rest are measured poses in src/scene/venue.ts (CUES).
 */
export const CAMERA_CUES = ['screen', 'stage', 'room', 'letters', 'podium', 'booth', 'rig', 'wall', 'foyer', 'merch', 'atrium', 'booths', 'badges', 'map', 'projector', 'foifi-full', 'foifi', 'foifi-screen', 'deploy', 'cake'] as const
export type CameraCue = (typeof CAMERA_CUES)[number]

export interface Slide {
  /** Stable, kebab-case. Used for ?slide= deep links. */
  id: string
  /** Narrative grouping; metadata only. */
  beat?: string
  /** Visual ids from the catalog. Arriving shows steps[0]; Enter reveals the next. */
  steps: readonly string[]
  /** Where the camera sits (3D only). Defaults to 'screen'. */
  camera?: CameraCue
  /** Medium effect dial, 0 = clean passthrough, 1 = full effect. Defaults to 0. */
  effect?: number
  /** Speaker notes. Shown in ?presenter, never painted on the frame. */
  notes?: string
}
