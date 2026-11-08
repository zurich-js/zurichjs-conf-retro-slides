import { DEFAULT_GROUND, type Visual, type VisualKind } from '../engine/types'
import { FRAME, GROUNDS, MOTION, type Roles, SERIES, TYPE } from '../brand/tokens'
import { type Ctx, chrome, clear, enter, image, label, SAFE, text, window01, wrap } from './kit'
import { journeySeconds, paintJourney } from './journey'
import { CALENDAR_SECS, paintCalendar } from './calendar'
import { paintGrowth } from './growth'
import { paintHeatmap } from './heatmap'
import { paintMatrix } from './matrix'

type Painter<K extends VisualKind> = (ctx: Ctx, v: Extract<Visual, { kind: K }>, p: number, r: Roles) => void

const D = TYPE.tracking.display

/** Vertically centre a block of `n` lines of `size` with line height `lh`; returns first baseline. */
const centredBaseline = (n: number, size: number, lh: number) =>
  FRAME.height / 2 - ((n - 1) * lh) / 2 + size * 0.36

const title: Painter<'title'> = (ctx, v, p, r) => {
  const size = TYPE.size.h1
  const lh = size * TYPE.lineHeight
  const lines = wrap(ctx, v.title, SAFE.width * 0.85, size, TYPE.weight.black)
  let y = centredBaseline(lines.length, size, lh)
  if (v.kicker) {
    ctx.save(); enter(ctx, window01(p, 0, 0.6))
    label(ctx, v.kicker, SAFE.left, y - size - 40, r.textSoft)
    ctx.restore()
  }
  lines.forEach((line, i) => {
    ctx.save(); enter(ctx, window01(p, 0.08 + i * 0.08, 0.7 + i * 0.08), 60)
    text(ctx, line, SAFE.left, y, { size, weight: TYPE.weight.black, tracking: D, color: r.text })
    ctx.restore()
    y += lh
  })
  if (v.subtitle) {
    ctx.save(); enter(ctx, window01(p, 0.35, 1))
    text(ctx, v.subtitle, SAFE.left, y + 40, { size: TYPE.size.body, weight: TYPE.weight.medium, color: r.textMuted })
    ctx.restore()
  }
}

const section: Painter<'section'> = (ctx, v, p, r) => {
  const size = TYPE.size.section
  const lh = size * TYPE.lineHeight
  const lines = wrap(ctx, v.title, SAFE.width * 0.85, size, TYPE.weight.black)
  let y = centredBaseline(lines.length, size, lh) + 60
  ctx.save(); enter(ctx, window01(p, 0, 0.6))
  label(ctx, v.number, SAFE.left, y - size - 40, r.textMuted, { size: TYPE.size.label * 1.4 })
  ctx.restore()
  lines.forEach((line, i) => {
    ctx.save(); enter(ctx, window01(p, 0.1 + i * 0.08, 0.75 + i * 0.08), 60)
    text(ctx, line, SAFE.left, y, { size, weight: TYPE.weight.black, tracking: D, color: r.text })
    ctx.restore()
    y += lh
  })
}

const statement: Painter<'statement'> = (ctx, v, p, r) => {
  const size = TYPE.size.h2
  const lh = size * TYPE.lineHeight
  const lines = wrap(ctx, v.text, SAFE.width * 0.9, size, TYPE.weight.black)
  let y = centredBaseline(lines.length, size, lh)
  if (v.kicker) {
    ctx.save(); enter(ctx, window01(p, 0, 0.6))
    label(ctx, v.kicker, SAFE.left, y - size - 30, r.accent)
    ctx.restore()
  }
  // Emphasis may span a line break: colour by character range across lines.
  const full = lines.join(' ')
  const from = v.emphasis ? full.indexOf(v.emphasis) : -1
  const to = from === -1 ? -1 : from + (v.emphasis?.length ?? 0)
  let offset = 0
  ctx.font = `${TYPE.weight.black} ${size}px ${TYPE.sans}`
  ctx.letterSpacing = `${D * size}px`
  lines.forEach((line, i) => {
    ctx.save(); enter(ctx, window01(p, 0.08 + i * 0.08, 0.7 + i * 0.08))
    const o = { size, weight: TYPE.weight.black, tracking: D }
    text(ctx, line, SAFE.left, y, { ...o, color: r.text })
    const a = Math.max(from, offset) - offset
    const b = Math.min(to, offset + line.length) - offset
    if (from !== -1 && b > a) {
      ctx.font = `${TYPE.weight.black} ${size}px ${TYPE.sans}`
      ctx.letterSpacing = `${D * size}px`
      const x = SAFE.left + ctx.measureText(line.slice(0, a)).width
      text(ctx, line.slice(a, b), x, y, { ...o, color: r.emphasis })
      // On yellow, emphasis is black-on-black: mark it with an underline instead.
      if (r.emphasis === r.text) {
        ctx.fillStyle = r.text
        ctx.fillRect(x, y + size * 0.14, ctx.measureText(line.slice(a, b)).width, size * 0.07)
      }
    }
    ctx.restore()
    offset += line.length + 1
    y += lh
  })
}

const stat: Painter<'stat'> = (ctx, v, p, r) => {
  const base = FRAME.height / 2 + TYPE.size.stat * 0.2
  ctx.save(); enter(ctx, window01(p, 0, 0.7), 80)
  text(ctx, v.value, SAFE.left - TYPE.size.stat * 0.04, base, {
    size: TYPE.size.stat, weight: TYPE.weight.black, tracking: D, color: r.tone(v.tone ?? 'hero'),
  })
  ctx.restore()
  ctx.save(); enter(ctx, window01(p, 0.3, 1))
  wrap(ctx, v.label, SAFE.width * 0.7, TYPE.size.body, TYPE.weight.medium).forEach((l, i) =>
    text(ctx, l, SAFE.left, base + 130 + i * TYPE.size.body * TYPE.bodyLineHeight, {
      size: TYPE.size.body, weight: TYPE.weight.medium, color: r.textSoft,
    }),
  )
  if (v.source) label(ctx, v.source, SAFE.right, SAFE.bottom + FRAME.safe.y / 2 - 30, r.textMuted, { align: 'right' })
  ctx.restore()
}

/** Thousands separators for chart values (fixed locale: deterministic). */
const fmt = (n: number) => n.toLocaleString('en-US')

const bars: Painter<'bars'> = (ctx, v, p, r) => {
  const tsize = TYPE.size.h2 * 0.75
  const titleY = SAFE.top + tsize * 0.8
  ctx.save(); enter(ctx, window01(p, 0, 0.5))
  text(ctx, v.title, SAFE.left, titleY, { size: tsize, weight: TYPE.weight.black, tracking: D, color: r.text })
  // Source sits under the title, never down by the wordmark; shrinks to fit the width.
  if (v.source) {
    ctx.save()
    ctx.font = `${TYPE.weight.medium} ${TYPE.size.label}px ${TYPE.mono}`
    ctx.letterSpacing = `${TYPE.tracking.label * TYPE.size.label}px`
    const sw = ctx.measureText(v.source.toUpperCase()).width
    ctx.restore()
    label(ctx, v.source, SAFE.left, titleY + 80, r.textMuted, { size: Math.min(TYPE.size.label, (TYPE.size.label * SAFE.width) / sw) })
  }
  ctx.restore()
  if (v.bars.length === 0) return
  const top = titleY + (v.source ? 180 : 120)
  const avail = SAFE.bottom - 50 - top
  const max = Math.max(...v.bars.map((b) => b.value))
  const pitch = Math.min(150, avail / v.bars.length)
  const gap = pitch * 0.28
  const rowH = pitch - gap
  let ls = Math.max(TYPE.size.label, Math.min(TYPE.size.label * 1.25, pitch * 0.85))
  // Label column fits the longest label (up to 40% of the width); labels shrink to fit it.
  ctx.save()
  ctx.font = `${TYPE.weight.medium} ${ls}px ${TYPE.mono}`
  ctx.letterSpacing = `${TYPE.tracking.label * ls}px`
  const longest = Math.max(...v.bars.map((b) => ctx.measureText(b.label.toUpperCase()).width))
  ctx.restore()
  const labelW = Math.min(SAFE.width * 0.4, Math.max(420, longest + 60))
  if (longest + 60 > labelW) ls *= (labelW - 60) / longest
  const barMax = SAFE.width - labelW - 320
  const y0 = top + (avail - pitch * v.bars.length + gap) / 2
  v.bars.forEach((b, i) => {
    const y = y0 + i * pitch
    // Stagger shrinks with the bar count so the last bar still lands by p = 1.
    const s = Math.min(0.07, 0.25 / Math.max(1, v.bars.length - 1))
    const grow = window01(p, 0.15 + i * s, 0.75 + i * s)
    const color = r.tone(b.tone ?? SERIES[i % SERIES.length] ?? 'hero')
    const w = Math.max(2, (b.value / max) * barMax * grow)
    label(ctx, b.label, SAFE.left, y + rowH / 2 + ls * 0.36, r.textSoft, { alpha: window01(p, 0.1, 0.5), size: ls })
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.roundRect(SAFE.left + labelW, y, w, rowH, rowH / 2)
    ctx.fill()
    label(ctx, `${fmt(Math.round(b.value * grow))}${v.unit ?? ''}`, SAFE.left + labelW + w + 32, y + rowH / 2 + ls * 0.36, r.text, {
      alpha: grow, size: ls,
    })
  })
}

const quote: Painter<'quote'> = (ctx, v, p, r) => {
  const size = TYPE.size.quote
  const lh = size * 1.2
  const lines = wrap(ctx, `“${v.text}”`, SAFE.width * 0.82, size, TYPE.weight.bold)
  let y = centredBaseline(lines.length, size, lh) - 60
  const x = SAFE.left + 72
  ctx.save(); enter(ctx, window01(p, 0, 0.7))
  ctx.fillStyle = r.accent
  ctx.fillRect(SAFE.left, y - size * 0.82, 12, (lines.length - 1) * lh + size)
  for (const l of lines) { text(ctx, l, x, y, { size, weight: TYPE.weight.bold, tracking: D, color: r.text }); y += lh }
  ctx.restore()
  ctx.save(); enter(ctx, window01(p, 0.35, 1))
  label(ctx, v.author, x, y + 50, r.accent, { size: TYPE.size.label * 1.2 })
  if (v.role) label(ctx, v.role, x, y + 50 + TYPE.size.label * 1.8, r.textMuted)
  ctx.restore()
}

const img: Painter<'image'> = (ctx, v, p, r) => {
  const el = image(v.src)
  const box = { x: SAFE.left, y: SAFE.top, w: SAFE.width, h: SAFE.height - (v.caption ? 120 : 0) }
  ctx.save(); enter(ctx, window01(p, 0, 0.8), 30)
  if (el) {
    const ratio = el.naturalWidth / el.naturalHeight
    const cover = (v.fit ?? 'contain') === 'cover'
    let w = box.w
    let h = w / ratio
    if (cover ? h < box.h : h > box.h) { h = box.h; w = h * ratio }
    ctx.beginPath(); ctx.roundRect(box.x, box.y, box.w, box.h, FRAME.radius); ctx.clip()
    ctx.drawImage(el, box.x + (box.w - w) / 2, box.y + (box.h - h) / 2, w, h)
  }
  ctx.restore()
  if (v.caption) label(ctx, v.caption, SAFE.left, SAFE.bottom, r.textMuted, { alpha: p })
}

const code: Painter<'code'> = (ctx, v, p, r) => {
  const size = TYPE.size.code
  const lh = size * 1.6
  const h = v.lines.length * lh + 120
  const y0 = (FRAME.height - h) / 2
  ctx.save(); enter(ctx, window01(p, 0, 0.6))
  ctx.fillStyle = r.surface
  ctx.beginPath(); ctx.roundRect(SAFE.left, y0, SAFE.width, h, FRAME.radius); ctx.fill()
  if (v.title) label(ctx, v.title, SAFE.left, y0 - 40, r.accent)
  ctx.restore()
  v.lines.forEach((line, i) => {
    const hot = v.highlight?.includes(i + 1) ?? false
    text(ctx, line, SAFE.left + 80, y0 + 60 + (i + 0.75) * lh, {
      size, family: TYPE.mono, color: hot ? r.accent : r.textSoft,
      alpha: window01(p, 0.1 + i * 0.03, 0.5 + i * 0.03),
    })
  })
}

/** 2–6 number tiles: value big (tone, default hero), label below. Up to 3 per row; 4 → 2 × 2. */
const numbers: Painter<'numbers'> = (ctx, v, p, r) => {
  const n = v.items.length
  const cols = n <= 3 ? n : n === 4 ? 2 : 3
  const rows = Math.ceil(n / cols)
  let top = SAFE.top + 60
  if (v.kicker) {
    ctx.save(); enter(ctx, window01(p, 0, 0.5))
    label(ctx, v.kicker, SAFE.left, SAFE.top + 40, r.accent)
    ctx.restore()
    top += 60
  }
  if (v.title) {
    const tsize = TYPE.size.h2 * 0.75
    ctx.save(); enter(ctx, window01(p, 0.02, 0.5))
    text(ctx, v.title, SAFE.left, top + tsize * 0.8, { size: tsize, weight: TYPE.weight.black, tracking: D, color: r.text })
    ctx.restore()
    top += tsize + 80
  }
  const colW = SAFE.width / cols
  const avail = SAFE.bottom - top
  const lh = TYPE.size.body * TYPE.bodyLineHeight
  // One value size for every tile: as big as fits, shrunk so the widest value fits its column.
  let vsize = Math.min(TYPE.size.stat * 0.6, (avail / rows) * 0.5)
  ctx.save()
  ctx.font = `${TYPE.weight.black} ${vsize}px ${TYPE.sans}`
  const widest = Math.max(...v.items.map((it) => ctx.measureText(it.value).width))
  ctx.restore()
  if (widest > colW * 0.9) vsize *= (colW * 0.9) / widest
  // Row heights from their tallest label; the whole grid centres vertically.
  const lines = v.items.map((it) => wrap(ctx, it.label, colW * 0.86, TYPE.size.body, TYPE.weight.medium))
  const rowH = Array.from({ length: rows }, (_, k) =>
    vsize + 70 + Math.max(...lines.slice(k * cols, k * cols + cols).map((l) => l.length)) * lh + 70)
  const total = rowH.reduce((a, b) => a + b, 0) - 70
  let ry = top + Math.max(0, (avail - total) / 2)
  const rowTop = rowH.map((h) => { const y = ry; ry += h; return y })
  v.items.forEach((it, i) => {
    const x = SAFE.left + (i % cols) * colW
    const y = rowTop[Math.floor(i / cols)]! + vsize * 0.85
    const s = Math.min(0.07, 0.28 / Math.max(1, n - 1))
    ctx.save(); enter(ctx, window01(p, 0.12 + i * s, 0.7 + i * s), 50)
    text(ctx, it.value, x - vsize * 0.03, y, { size: vsize, weight: TYPE.weight.black, tracking: D, color: r.tone(it.tone ?? 'hero') })
    lines[i]!.forEach((l, k) =>
      text(ctx, l, x, y + 90 + k * lh, { size: TYPE.size.body, weight: TYPE.weight.medium, color: r.textSoft }),
    )
    ctx.restore()
  })
}

const journey: Painter<'journey'> = paintJourney
const calendar: Painter<'calendar'> = paintCalendar
const growth: Painter<'growth'> = paintGrowth
const heatmap: Painter<'heatmap'> = paintHeatmap
const matrix: Painter<'matrix'> = paintMatrix

const PAINTERS: { [K in VisualKind]: Painter<K> } = { title, section, statement, stat, bars, quote, image: img, code, numbers, journey, calendar, growth, heatmap, matrix }

/**
 * How long a visual's draw-in lasts, and whether its painter wants raw linear
 * progress (it eases its own sub-timelines). Everything else: MOTION, eased.
 */
export function drawTiming(visual: Visual | undefined): { secs: number; linear: boolean } {
  if (visual?.kind === 'journey') return { secs: journeySeconds(visual), linear: true }
  if (visual?.kind === 'calendar') return { secs: CALENDAR_SECS, linear: true }
  if (visual?.kind === 'growth') return { secs: 2.6, linear: false }
  if (visual?.kind === 'heatmap') return { secs: 2.4, linear: false }
  if (visual?.kind === 'matrix') return { secs: 1.8, linear: false }
  return { secs: MOTION.drawSecs, linear: false }
}

/** Paint one visual at draw progress p (0 → 1; eased unless drawTiming says linear). */
export function paintVisual(ctx: Ctx, visual: Visual | undefined, p: number) {
  const r = GROUNDS[visual ? (visual.ground ?? DEFAULT_GROUND[visual.kind]) : 'dark']
  clear(ctx, r)
  if (visual) {
    ctx.save()
    ;(PAINTERS[visual.kind] as Painter<VisualKind>)(ctx, visual as never, p, r)
    ctx.restore()
  }
  chrome(ctx, r)
}
