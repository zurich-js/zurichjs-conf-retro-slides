import { type Roles, SERIES, TYPE } from '../brand/tokens'
import type { Visual } from '../engine/types'
import { type Ctx, enter, label, SAFE, text, window01, wrap } from './kit'

/**
 * The `split` painter: one 100% bar divided into shares (survey answers, a
 * budget by category), each share's percentage and label in a legend row
 * underneath in the same order, each with a colour chip. Shares are given as raw
 * values and normalised, so they always fill the bar exactly; the printed
 * percentages are rounded with the largest-remainder method so they add to 100.
 */
type SplitVisual = Extract<Visual, { kind: 'split' }>

export const SPLIT_SECS = 2.2

/** Whole percentages that add up to exactly 100 (largest remainder). */
function percents(values: readonly number[]): number[] {
  const total = values.reduce((a, b) => a + b, 0) || 1
  const raw = values.map((v) => (v / total) * 100)
  const out = raw.map(Math.floor)
  let left = 100 - out.reduce((a, b) => a + b, 0)
  raw.map((x, i) => ({ i, f: x - Math.floor(x) })).sort((a, b) => b.f - a.f).forEach(({ i }) => { if (left-- > 0) out[i]! += 1 })
  return out
}

export function paintSplit(ctx: Ctx, v: SplitVisual, p: number, r: Roles) {
  const D = TYPE.tracking.display
  const tsize = TYPE.size.h2 * 0.75
  let y = SAFE.top + 40
  ctx.save(); enter(ctx, window01(p, 0, 0.4))
  if (v.kicker) { label(ctx, v.kicker, SAFE.left, y, r.accent); y += 60 }
  const titleLines = wrap(ctx, v.title, SAFE.width, tsize, TYPE.weight.black)
  titleLines.forEach((l, i) => text(ctx, l, SAFE.left, y + tsize * 0.8 + i * tsize * TYPE.lineHeight, { size: tsize, weight: TYPE.weight.black, tracking: D, color: r.text }))
  y += tsize * TYPE.lineHeight * titleLines.length + 10
  if (v.source) { label(ctx, v.source, SAFE.left, y + 50, r.textMuted); y += 70 }
  ctx.restore()

  const total = v.segments.reduce((a, s) => a + s.value, 0) || 1
  const pct = percents(v.segments.map((s) => s.value))
  const barY = y + 110
  const barH = 150
  const grow = window01(p, 0.12, 0.7)
  // The bar.
  let x = SAFE.left
  const xs: number[] = []
  v.segments.forEach((s, i) => {
    const w = (s.value / total) * SAFE.width
    xs.push(x)
    ctx.fillStyle = r.tone(s.tone ?? SERIES[i % SERIES.length] ?? 'hero')
    const ww = Math.max(0, Math.min(w, SAFE.left + SAFE.width * grow - x))
    if (ww > 0) ctx.fillRect(x, barY, Math.max(0, ww - (i < v.segments.length - 1 ? 6 : 0)), barH)
    x += w
  })
  // The legend: one column per segment, evenly spaced, each tied to its segment by a tick.
  const n = v.segments.length
  const colW = SAFE.width / n
  const legendY = barY + barH + 200
  const vsize = Math.min(TYPE.size.h2, colW * 0.42)
  v.segments.forEach((s, i) => {
    const a = window01(p, 0.45 + i * 0.06, 0.85 + i * 0.06)
    const cx = SAFE.left + colW * i
    const color = r.tone(s.tone ?? SERIES[i % SERIES.length] ?? 'hero')
    // A colour chip ties the column to its segment (same order, left to right).
    ctx.save()
    ctx.globalAlpha *= a
    ctx.fillStyle = color
    ctx.fillRect(cx, legendY - vsize - 40, 90, 16)
    ctx.restore()
    text(ctx, `${pct[i]}%`, cx, legendY, { size: vsize, weight: TYPE.weight.black, tracking: D, color, alpha: a })
    wrap(ctx, s.label, colW - 40, TYPE.size.body * 0.8, TYPE.weight.medium).forEach((l, k) =>
      text(ctx, l, cx, legendY + 80 + k * TYPE.size.body * 0.8 * TYPE.bodyLineHeight, { size: TYPE.size.body * 0.8, weight: TYPE.weight.medium, color: r.textSoft, alpha: a }))
  })
  if (v.note) {
    const lines = wrap(ctx, v.note, SAFE.width, TYPE.size.body * 0.8, TYPE.weight.medium)
    lines.forEach((l, k) => text(ctx, l, SAFE.left, SAFE.bottom - 90 - (lines.length - 1 - k) * TYPE.size.body * 0.8 * TYPE.bodyLineHeight, {
      size: TYPE.size.body * 0.8, weight: TYPE.weight.bold, color: r.text, alpha: window01(p, 0.8, 1),
    }))
  }
}
