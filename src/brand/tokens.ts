/**
 * Brand tokens — the ONLY place colour, type and spacing values live.
 *
 * Raw palette source: zurichjs-conf `src/styles/globals.css` (@theme). Values
 * are copied, not imported, so the deck builds offline and never drifts with
 * site changes. Roles below were decided with Faris on 2026-11-08 (AGENTS.md ›
 * Brand decisions). Painters read GROUNDS/TONE/TYPE, never PALETTE.
 */

/** Raw conference palette. Painters do not use this directly. */
export const PALETTE = {
  yellow: '#F1E271',
  yellowSecondary: '#EDC936',
  yellowLight: '#F5EC9A',
  yellowDark: '#E8D54E',
  blue: '#268BCC',
  orange: '#EA561D',
  green: '#31A853',
  red: '#EA1D35',
  vip: '#F26A3C',
  black: '#000000',
  white: '#FFFFFF',
  surfacePage: '#0A0A0A',
  surfaceSection: '#19191B',
  surfaceCard: '#242528',
  surfaceCardHover: '#2A2A2D',
  surfaceElevated: '#2F2F33',
  grayMedium: '#7C7F89',
  grayLight: '#A9AAB1',
  grayLightest: '#EDEDEF',
  textPrimary: '#FFFFFF',
  textSecondary: '#E5E7EB',
  textMuted: '#94A3B8',
} as const

/**
 * A third-party airline app shown inside a slide (`booking`): its own light
 * UI and red bar, never a deck tone. Only the booking painter uses it.
 */
const APP = {
  bar: '#E2001A',
  sheet: '#FFFFFF',
  panel: '#F2F2F4',
  line: '#D9D9DE',
  ink: '#141414',
  muted: '#6B6B73',
  done: PALETTE.green,
} as const

/**
 * Semantic tones. Every colour has ONE fixed meaning across the whole talk so
 * the audience learns it once:
 *   hero    — the point of the slide (yellow)
 *   neutral — comparison / context (blue)
 *   good    — better, after, success (green)
 *   warn    — worse, before, caution (orange)
 *   bad     — errors and failure ONLY (red)
 */
export type Tone = 'hero' | 'neutral' | 'good' | 'warn' | 'bad'
export const TONE: Readonly<Record<Tone, string>> = {
  hero: PALETTE.yellow,
  neutral: PALETTE.blue,
  good: PALETTE.green,
  warn: PALETTE.orange,
  bad: PALETTE.red,
}
/** Default chart series order when bars carry no explicit tone. */
export const SERIES: readonly Tone[] = ['hero', 'neutral', 'warn', 'good']

/**
 * A ground is a full set of roles for one background. Dark is the default;
 * yellow is for MOMENTS — title & closing, section breaks, the one big
 * statement, the key stat. On yellow, everything is black and tones collapse
 * to black (yellow can't carry yellow emphasis).
 */
export interface Roles {
  bg: string
  surface: string
  card: string
  rule: string
  text: string
  textSoft: string
  textMuted: string
  /** Kickers, rules, the emphasised span. */
  accent: string
  /** The one number/word a slide is about. */
  emphasis: string
  /** Resolve a semantic tone on this ground. */
  tone: (t: Tone) => string
  wordmark: string
  /** An airline app's own colours, for the phone in `booking` (the same on every ground). */
  app: typeof APP
}
export type Ground = 'dark' | 'yellow'

export const GROUNDS: Readonly<Record<Ground, Roles>> = {
  dark: {
    bg: PALETTE.surfacePage,
    surface: PALETTE.surfaceSection,
    card: PALETTE.surfaceCard,
    rule: 'rgba(255,255,255,0.12)',
    text: PALETTE.textPrimary,
    textSoft: PALETTE.textSecondary,
    textMuted: PALETTE.textMuted,
    accent: PALETTE.yellow,
    emphasis: PALETTE.yellow,
    tone: (t) => TONE[t],
    wordmark: '/brand/wordmark-conf-white.svg',
    app: APP,
  },
  yellow: {
    bg: PALETTE.yellow,
    surface: PALETTE.yellowSecondary,
    card: 'rgba(0,0,0,0.08)',
    rule: 'rgba(0,0,0,0.2)',
    text: PALETTE.black,
    textSoft: 'rgba(0,0,0,0.82)',
    textMuted: 'rgba(0,0,0,0.6)',
    accent: PALETTE.black,
    emphasis: PALETTE.black,
    tone: () => PALETTE.black,
    wordmark: '/brand/wordmark-conf.svg',
    app: APP,
  },
}

/**
 * Type: Figtree for everything readable; Geist Mono UPPERCASE with wide
 * tracking for kickers, labels, chart values, sources and code.
 * "Big & tight": sentence case, 800 weight, -2% tracking on display sizes.
 * Sizes are canvas px on the 2560×1440 frame (180px ≈ 12.5% of height).
 */
export const TYPE = {
  sans: '"Figtree", ui-sans-serif, system-ui, sans-serif',
  mono: '"Geist Mono Variable", ui-monospace, SFMono-Regular, Menlo, monospace',
  size: {
    label: 48, // mono: kickers, chart labels, sources (≥ 36px on a 1080p projector)
    body: 64,
    quote: 96,
    h2: 120,
    h1: 180,
    section: 220,
    stat: 380,
    code: 52,
  },
  weight: { regular: 400, medium: 500, bold: 700, black: 800 },
  lineHeight: 1.08,
  bodyLineHeight: 1.35,
  tracking: { label: 0.12, display: -0.02, body: 0 }, // em
} as const

/** The canvas every slide is painted on. 16:9 at 1440p; change aspect HERE only. */
export const FRAME = {
  width: 2560,
  height: 1440,
  /** Title-safe inset: content never goes outside this. */
  safe: { x: 200, y: 160 },
  radius: 40, // conf --radius-4xl (2.5rem) scaled to the frame
} as const

/** Subtle rise: fade + 40px rise, conf --easing-smooth, staggered per element. */
export const MOTION = {
  drawSecs: 0.9,
  rise: 40,
  ease: [0.22, 1, 0.36, 1] as const,
} as const

/** Everything preloaded before first paint. */
export const ASSETS = [GROUNDS.dark.wordmark, GROUNDS.yellow.wordmark] as const
