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
  journey: 'dark',
}

/**
 * Named camera destinations. `screen` is solved in src/renderers/Stage.tsx;
 * the rest are measured poses in src/scene/venue.ts (CUES).
 */
export const CAMERA_CUES = ['screen', 'stage', 'room', 'letters', 'podium', 'booth', 'rig', 'wall', 'foyer', 'merch', 'atrium', 'booths', 'badges', 'map'] as const
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
