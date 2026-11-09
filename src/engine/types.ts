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
    | {
        kind: 'image'
        src: string
        caption?: string
        fit?: 'contain' | 'cover'
        /** A line above the image (e.g. what a screenshot shows). */
        title?: string
        /** Outline part of the image in accent: x, y, w, h as fractions of the image. */
        mark?: { x: number; y: number; w: number; h: number }
      }
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
        kind: 'moments'
        kicker: string
        /** Timeline months, 'YYYY-MM', inclusive. */
        from: string
        to: string
        /** In date order. Plays one by one, then settles into a wall with the totals. */
        moments: readonly Moment[]
        totals: readonly { value: string; label: string }[]
        /** Seconds to hold on the opening before the first photo moves (e.g. while the camera travels). */
        hold?: number
      }
    | {
        kind: 'flapboard'
        /** In accent beside a plane glyph, like "Departures". */
        title: string
        source?: string
        /** Widths in characters; one blank cell between columns. */
        columns: readonly { label?: string; width: number; align?: 'left' | 'right' }[]
        /** One string per column. YES is good, NO and '-' are muted; a highlighted row is accent. */
        rows: readonly { cells: readonly string[]; highlight?: boolean }[]
      }
    | {
        kind: 'atm'
        /** The prompt on the cash machine's screen. */
        title: string
        kicker?: string
        /** Up to four soft-key options (0, 2 left; 1, 3 right); value is right-aligned (a count, a price). */
        options?: readonly { label: string; value?: string }[]
        /** Options lit as pressed. */
        selected?: readonly number[]
        message?: string
        /** Message tone (default accent). */
        tone?: Tone
        /** Small, bottom right: a source or a footnote. */
        note?: string
        /** What the machine does in the set: take the card, or hand it back and pay out. */
        step?: 'insert' | 'dispense'
      }
    | {
        kind: 'strike'
        /** The name as it was. */
        name: string
        /** A rename: the old name is struck through and this rises in below. */
        to?: string
        /** A stamp slammed onto the name, e.g. "Deprecated". */
        stamp?: string
        kicker?: string
        note?: string
      }
    | {
        kind: 'badgetest'
        title: string
        kicker?: string
        note?: string
        /** What the test stand on the check-in counter shows. */
        rig: 'one-hole' | 'two-holes' | 'stress' | 'held'
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
/** One photo on the road: when (ISO date), where (city), and what (event). */
export interface Moment { src: string; date: string; place?: string; what?: string }
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
  moments: 'dark',
  flapboard: 'dark',
  atm: 'dark',
  strike: 'dark',
  badgetest: 'dark',
  matrix: 'dark',
  journey: 'dark',
}

/**
 * Named camera destinations. `screen` is solved in src/renderers/Stage.tsx;
 * the rest are measured poses in src/scene/venue.ts (CUES).
 */
export const CAMERA_CUES = ['screen', 'stage', 'room', 'letters', 'podium', 'booth', 'rig', 'wall', 'foyer', 'merch', 'atrium', 'booths', 'badges', 'map', 'projector', 'foifi-full', 'foifi', 'foifi-screen', 'deploy', 'cake', 'cabin', 'seat', 'gate', 'gate-full', 'apron', 'atm', 'atm-wide', 'lanyards'] as const
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
