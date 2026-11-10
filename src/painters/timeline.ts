import { type Roles, FRAME, TYPE } from '../brand/tokens'
import type { Visual } from '../engine/types'
import { type Ctx, enter, label, labelLines, SAFE, text, window01, wrap } from './kit'

/**
 * The `timeline` painter: a horizontal line with dated marks (when above,
 * what below), drawn left to right. An optional `span` shades a stretch of
 * the line (e.g. the months committed but not yet viable), its label inside.
 * Each mark's date and description sit at the end of an arrow from its dot,
 * alternating above and below the line so neighbours never crowd.
 * Positions (`at`) are 0–1 along the line, so the drawing is schematic: it
 * shows order and rough distance, not a measured scale.
 */
type TimelineVisual = Extract<Visual, { kind: 'timeline' }>

export const TIMELINE_SECS = 2.6

export function paintTimeline(ctx: Ctx, v: TimelineVisual, p: number, r: Roles) {
  const D = TYPE.tracking.display
  const tsize = TYPE.size.h2 * 0.75
  let y = SAFE.top + 40
  ctx.save(); enter(ctx, window01(p, 0, 0.4))
  if (v.kicker) { label(ctx, v.kicker, SAFE.left, y, r.accent); y += 60 }
  const titleLines = wrap(ctx, v.title, SAFE.width, tsize, TYPE.weight.black)
  titleLines.forEach((l, i) => text(ctx, l, SAFE.left, y + tsize * 0.8 + i * tsize * TYPE.lineHeight, { size: tsize, weight: TYPE.weight.black, tracking: D, color: r.text }))
  y += tsize * TYPE.lineHeight * titleLines.length
  // The source sits under the title, clear of the descriptions below the line.
  if (v.source) { label(ctx, v.source, SAFE.left, y + 50, r.textMuted); y += 70 }
  ctx.restore()

  const x0 = SAFE.left + 60
  const x1 = SAFE.left + SAFE.width - 60
  // The line sits midway between the title and the wordmark; labels alternate above and below it.
  const lineY = Math.round((y + FRAME.height - 220) / 2) + 40
  const draw = window01(p, 0.1, 0.75)
  const at = (t: number) => x0 + (x1 - x0) * t

  ctx.save()
  ctx.strokeStyle = r.textMuted
  ctx.lineWidth = 6
  ctx.beginPath(); ctx.moveTo(x0, lineY); ctx.lineTo(x0 + (x1 - x0) * draw, lineY); ctx.stroke()
  ctx.restore()

  if (v.span) {
    // A tinted band between two marks, its label inside it (clear of the marks' labels).
    const a = window01(p, 0.55, 0.9)
    const color = r.tone(v.span.tone ?? 'warn')
    const sx = at(v.span.from) + 50
    const sw = at(v.span.to) - 50 - sx
    const lines = labelLines(ctx, v.span.label, sw - 60, TYPE.size.label)
    const h = lines.length * TYPE.size.label * 1.3 + 50
    ctx.save()
    ctx.globalAlpha *= a
    ctx.fillStyle = r.bg
    ctx.beginPath(); ctx.roundRect(sx, lineY - h / 2, sw, h, 24); ctx.fill()
    ctx.globalAlpha *= 0.22
    ctx.fillStyle = color
    ctx.fill()
    ctx.restore()
    ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = color; ctx.lineWidth = 4
    ctx.beginPath(); ctx.roundRect(sx, lineY - h / 2, sw, h, 24); ctx.stroke(); ctx.restore()
    lines.forEach((l, k) => label(ctx, l, sx + sw / 2, lineY - h / 2 + 25 + TYPE.size.label * 0.95 + k * TYPE.size.label * 1.3, color, { align: 'center', alpha: a }))
  }

  const n = v.marks.length
  // Labels on one side are two marks apart, so each may take most of that gap.
  const gap = (x1 - x0) / Math.max(1, n - 1)
  const maxW = Math.min(n > 2 ? gap * 1.6 : gap * 0.45, 760)
  const whenSize = TYPE.size.body * 0.85
  const whatSize = TYPE.size.body * 0.85
  const ARM = 90
  v.marks.forEach((m, i) => {
    const mx = at(m.at)
    const a = window01(p, 0.15 + (m.at * 0.6), 0.35 + (m.at * 0.6))
    const color = r.tone(m.tone ?? 'hero')
    const up = i % 2 === 0
    const dir = up ? -1 : 1
    ctx.save()
    ctx.globalAlpha *= a
    ctx.fillStyle = color
    ctx.beginPath(); ctx.arc(mx, lineY, 22, 0, Math.PI * 2); ctx.fill()
    // The arrow: from the dot out to its label.
    const y0 = lineY + dir * 40
    const tip = lineY + dir * (40 + ARM)
    ctx.strokeStyle = color; ctx.lineWidth = 6; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(mx, y0); ctx.lineTo(mx, tip - dir * 14); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(mx, tip); ctx.lineTo(mx - 16, tip - dir * 26); ctx.lineTo(mx + 16, tip - dir * 26); ctx.closePath(); ctx.fill()
    ctx.restore()
    // Ends align outward so their text stays inside the safe area.
    const align: CanvasTextAlign = i === 0 ? 'left' : i === n - 1 ? 'right' : 'center'
    const tx = i === 0 ? mx - 22 : i === n - 1 ? mx + 22 : mx
    const whenLines = wrap(ctx, m.when, maxW, whenSize, TYPE.weight.black)
    const whatLines = wrap(ctx, m.what, maxW, whatSize, TYPE.weight.bold)
    const rows = [
      ...whenLines.map((l) => ({ l, size: whenSize, weight: TYPE.weight.black, color, lh: TYPE.lineHeight })),
      ...whatLines.map((l) => ({ l, size: whatSize, weight: TYPE.weight.bold, color: r.text, lh: TYPE.bodyLineHeight })),
    ]
    const heights = rows.map((row) => row.size * row.lh)
    const total = heights.reduce((s2, h) => s2 + h, 0)
    let ty = up ? tip - 24 - total : tip + 24
    rows.forEach((row, k) => {
      text(ctx, row.l, tx, ty + row.size * 0.85, { size: row.size, weight: row.weight, tracking: k < whenLines.length ? D : 0, color: row.color, align, alpha: a })
      ty += heights[k]!
    })
  })
}
