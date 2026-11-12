import { type Roles, TYPE } from '../brand/tokens'
import type { Visual } from '../engine/types'
import { type Ctx, enter, label, SAFE, text, window01 } from './kit'

/**
 * The `growth` painter: one or more series as lines from their starting
 * value, drawn left to right. Each line ends in its value (and the multiple
 * of its start, when it started above zero). Value axis from 0, faint
 * gridlines, a few x labels. Untoned series go hero → neutral → good.
 *
 * `show` limits the points drawn and `from` is where the draw-in starts, so a
 * chart can continue across steps on fixed axes (step 2 extends step 1).
 */

type GrowthVisual = Extract<Visual, { kind: 'growth' }>
const ORDER = ['hero', 'neutral', 'good'] as const
const fmt = (n: number) => Math.round(n).toLocaleString('en-US')

function niceMax(v: number) {
  const p = 10 ** Math.floor(Math.log10(v))
  for (const m of [1, 2, 2.5, 4, 5, 10]) if (m * p >= v) return m * p
  return 10 * p
}

export function paintGrowth(ctx: Ctx, v: GrowthVisual, p: number, r: Roles) {
  const D = TYPE.tracking.display
  const tsize = TYPE.size.h2 * 0.75
  let y = SAFE.top + 40
  ctx.save(); enter(ctx, window01(p, 0, 0.4))
  if (v.kicker) { label(ctx, v.kicker, SAFE.left, y, r.accent); y += 60 }
  text(ctx, v.title, SAFE.left, y + tsize * 0.8, { size: tsize, weight: TYPE.weight.black, tracking: D, color: r.text })
  y += tsize + 30
  if (v.source) { label(ctx, v.source, SAFE.left, y + 30, r.textMuted); y += 50 }
  ctx.restore()

  const plot = { l: SAFE.left + 170, r: SAFE.right - 520, t: y + 70, b: SAFE.bottom - 90 }
  const n = v.x.length
  // Round gridline steps (…, 250, 400, 500, …) and an axis that ends on one.
  const raw = Math.max(...v.series.flatMap((s) => s.values))
  const tick = niceMax(raw / 4)
  const max = tick * Math.ceil(raw / tick)
  const ticks = Math.round(max / tick)
  const X = (i: number) => plot.l + ((plot.r - plot.l) * i) / (n - 1)
  const Y = (val: number) => plot.b - ((plot.b - plot.t) * val) / max

  // Grid and axes.
  const ga = window01(p, 0.05, 0.35)
  for (let k = 0; k <= ticks; k++) {
    const val = tick * k
    ctx.save(); ctx.globalAlpha = ga
    ctx.fillStyle = r.rule
    ctx.fillRect(plot.l, Y(val) - 1, plot.r - plot.l, 2)
    ctx.restore()
    label(ctx, fmt(val), plot.l - 30, Y(val) + 16, r.textMuted, { align: 'right', alpha: ga })
  }
  v.x.forEach((xl, i) => {
    if (xl === '') return
    label(ctx, xl, X(i), plot.b + 70, r.textMuted, { align: i === 0 ? 'left' : i === n - 1 ? 'right' : 'center', alpha: ga })
  })

  // Markers (e.g. when a campaign started): a dashed rule up the plot, its label at the top.
  for (const m of v.marks ?? []) {
    const mx = X(m.at)
    ctx.save(); ctx.globalAlpha = ga
    ctx.strokeStyle = r.textMuted
    ctx.lineWidth = 4
    ctx.setLineDash([18, 16])
    ctx.beginPath(); ctx.moveTo(mx, plot.t - 10); ctx.lineTo(mx, plot.b); ctx.stroke()
    ctx.restore()
    label(ctx, m.label, mx + 20, plot.t + 20, r.textSoft, { alpha: ga })
  }

  // Lines, drawn left to right from `from` to the last shown point.
  const shown = Math.min(n, v.show ?? n)
  const from = Math.min(shown - 1, v.from ?? 0)
  const q = from + window01(p, 0.15, 0.88) * (shown - 1 - from)
  const ends: { y: number; colour: string; value: string; text: string }[] = []
  v.series.forEach((s, si) => {
    const colour = r.tone(s.tone ?? ORDER[si % ORDER.length]!)
    const last = Math.min(shown - 1, Math.floor(q))
    const frac = q - last
    ctx.save()
    ctx.strokeStyle = colour
    ctx.lineWidth = 10
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(X(0), Y(s.values[0]!))
    for (let i = 1; i <= last; i++) ctx.lineTo(X(i), Y(s.values[i]!))
    let hx = X(last)
    let hy = Y(s.values[last]!)
    if (last < shown - 1 && frac > 0) {
      hx = X(last + frac)
      hy = Y(s.values[last]! + (s.values[last + 1]! - s.values[last]!) * frac)
      ctx.lineTo(hx, hy)
    }
    ctx.stroke()
    ctx.fillStyle = colour
    ctx.beginPath(); ctx.arc(X(0), Y(s.values[0]!), 12, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(hx, hy, 14, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
    // Start value, when the line does not start at zero.
    if (s.values[0]! > 0 && !v.percent) label(ctx, fmt(s.values[0]!), X(0) + 26, Y(s.values[0]!) - 26, colour, { alpha: ga, size: TYPE.size.label * 1.2 })
    const v0 = s.values[0]!
    const v1 = s.values[shown - 1]!
    ends.push({
      y: Y(v1), colour, value: v.percent ? `${fmt(v1)}%` : fmt(v1),
      // Shares have no meaningful growth multiple: just name the series.
      text: v0 > 0 && !v.percent ? `${s.label} · ${(v1 / v0).toFixed(1)}×` : s.label,
    })
  })

  // End labels, nudged apart so they never overlap.
  const ea = window01(p, 0.86, 1)
  const gap = 175
  const sorted = [...ends].sort((a, b) => a.y - b.y)
  for (let k = 1; k < sorted.length; k++) sorted[k]!.y = Math.max(sorted[k]!.y, sorted[k - 1]!.y + gap)
  // The lowest label (value + caption, ~80px tall) must stay above the x axis labels.
  const overflow = sorted.length ? sorted[sorted.length - 1]!.y + 120 - plot.b : 0
  if (overflow > 0) sorted.forEach((e) => { e.y -= overflow })
  const lx = X(shown - 1) + 50
  for (const e of sorted) {
    text(ctx, e.value, lx, e.y + 26, { size: 96, weight: TYPE.weight.black, tracking: D, color: e.colour, alpha: ea })
    label(ctx, e.text, lx + 4, e.y + 80, r.textSoft, { alpha: ea })
  }
}
