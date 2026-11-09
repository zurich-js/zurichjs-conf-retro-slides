import { type Roles, TYPE } from '../brand/tokens'
import type { Visual } from '../engine/types'
import { type Ctx, enter, label, SAFE, text, window01, wrap } from './kit'

/**
 * The `timeline` painter: a horizontal line with dated marks (when above,
 * what below), drawn left to right. An optional `span` shades a stretch of
 * the line (e.g. the months committed but not yet viable) with its own label.
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
  const lineY = Math.max(y + 330, (SAFE.top + SAFE.bottom) / 2 + 90)
  const draw = window01(p, 0.1, 0.75)
  const at = (t: number) => x0 + (x1 - x0) * t

  if (v.span) {
    const a = window01(p, 0.55, 0.9)
    const sx = at(v.span.from)
    const sw = at(v.span.to) - sx
    ctx.save()
    ctx.globalAlpha *= a * 0.28
    ctx.fillStyle = r.tone(v.span.tone ?? 'warn')
    ctx.fillRect(sx, lineY - 30, sw, 60)
    ctx.restore()
    label(ctx, v.span.label, sx + sw / 2, lineY + 100, r.tone(v.span.tone ?? 'warn'), { align: 'center', alpha: a })
  }
  ctx.save()
  ctx.strokeStyle = r.textMuted
  ctx.lineWidth = 6
  ctx.beginPath(); ctx.moveTo(x0, lineY); ctx.lineTo(x0 + (x1 - x0) * draw, lineY); ctx.stroke()
  ctx.restore()

  const n = v.marks.length
  const colW = (x1 - x0) / Math.max(1, n - 1)
  v.marks.forEach((m, i) => {
    const mx = at(m.at)
    const a = window01(p, 0.15 + (m.at * 0.6), 0.35 + (m.at * 0.6))
    const color = r.tone(m.tone ?? 'hero')
    ctx.save()
    ctx.globalAlpha *= a
    ctx.fillStyle = color
    ctx.beginPath(); ctx.arc(mx, lineY, 22, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
    // Ends align outward so their text stays inside the safe area.
    const align: CanvasTextAlign = i === 0 ? 'left' : i === n - 1 ? 'right' : 'center'
    const tx = i === 0 ? mx - 22 : i === n - 1 ? mx + 22 : mx
    // Ends grow inward from the edge, middles are centred: each gets a width that cannot reach a neighbour.
    const maxW = Math.min(n > 2 ? colW * (i === 0 || i === n - 1 ? 0.6 : 0.85) : colW * 0.45, 640)
    const whenSize = TYPE.size.body * 0.8
    const whenLines = wrap(ctx, m.when, maxW, whenSize, TYPE.weight.black)
    whenLines.forEach((l, k) => text(ctx, l, tx, lineY - 70 - (whenLines.length - 1 - k) * whenSize * TYPE.lineHeight, { size: whenSize, weight: TYPE.weight.black, tracking: D, color, align, alpha: a }))
    const wl = wrap(ctx, m.what, maxW, TYPE.size.body * 0.8, TYPE.weight.medium)
    wl.forEach((l, k) => text(ctx, l, tx, lineY + (v.span ? 190 : 110) + k * TYPE.size.body * 0.8 * TYPE.bodyLineHeight, {
      size: TYPE.size.body * 0.8, weight: TYPE.weight.medium, color: r.textSoft, align, alpha: a,
    }))
  })
}
