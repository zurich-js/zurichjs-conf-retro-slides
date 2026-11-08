import { type Roles, TYPE } from '../brand/tokens'
import type { Visual } from '../engine/types'
import { type Ctx, enter, font, label, SAFE, text, window01, wrap } from './kit'

/**
 * The `matrix` painter: a feature grid. Columns are the things compared (a
 * name and a sub-line, e.g. the price), rows are features. Cell values:
 * 'yes' (✓, good tone), 'no' (✗, muted), '-' (not listed, muted dash), or
 * short text. The `highlight` column sits on a card with a hero outline.
 *
 * Layout: title and source on top (the bottom-left belongs to the wordmark),
 * the label column as wide as its longest label, column names shrunk to fit
 * their column so neighbours never touch.
 */

type MatrixVisual = Extract<Visual, { kind: 'matrix' }>

const GUTTER = 48

export function paintMatrix(ctx: Ctx, v: MatrixVisual, p: number, r: Roles) {
  const D = TYPE.tracking.display
  const tsize = TYPE.size.h2 * 0.75
  let y = SAFE.top
  ctx.save(); enter(ctx, window01(p, 0, 0.4))
  if (v.kicker) { label(ctx, v.kicker, SAFE.left, y + 40, r.accent); y += 80 }
  text(ctx, v.title, SAFE.left, y + tsize * 0.8, { size: tsize, weight: TYPE.weight.black, tracking: D, color: r.text })
  y += tsize + 10
  if (v.source) {
    // Shrink the source to fit the safe width rather than run into the edge.
    const ss = fitMono(ctx, v.source, SAFE.width, TYPE.size.label)
    label(ctx, v.source, SAFE.left, y + 40, r.textMuted, { size: ss })
    y += 60
  }
  ctx.restore()

  // Label column: as wide as the longest row label, at most 40% of the width.
  const ls = TYPE.size.label
  ctx.save(); ctx.font = font(ls, TYPE.weight.medium)
  const longest = Math.max(...v.rows.map((row) => ctx.measureText(row.label).width))
  ctx.restore()
  const labelW = Math.min(SAFE.width * 0.4, longest + GUTTER * 2)
  const n = v.columns.length
  const colW = (SAFE.width - labelW) / n
  const cx = (i: number) => SAFE.left + labelW + colW * i + colW / 2

  const headH = 200
  const top = y + 40
  const headTop = top + 10
  // Stay well clear of the wordmark under SAFE.bottom.
  const bottom = SAFE.bottom - 30
  const rowH = Math.min(110, (bottom - top - headH) / v.rows.length)

  // Highlighted column card.
  if (v.highlight !== undefined) {
    const x = SAFE.left + labelW + colW * v.highlight + 10
    ctx.save()
    ctx.globalAlpha = window01(p, 0.05, 0.4)
    ctx.fillStyle = r.card
    ctx.beginPath(); ctx.roundRect(x, top, colW - 20, headH + rowH * v.rows.length + 10, 28); ctx.fill()
    ctx.strokeStyle = r.accent
    ctx.lineWidth = 4
    ctx.stroke()
    ctx.restore()
  }

  // Column heads: name shrunk to its column, sub-line (price) below.
  const ha = window01(p, 0.05, 0.4)
  const hs = TYPE.size.label * 1.15
  // One size for every name: the largest at which each name fits its column
  // in at most two lines.
  const maxW = colW - GUTTER
  let size = hs
  const fits = (sz: number) => v.columns.every((c) => {
    const lines = wrap(ctx, c.label, maxW, sz, TYPE.weight.bold)
    ctx.save(); ctx.font = font(sz, TYPE.weight.bold)
    const ok = lines.length <= 2 && lines.every((l) => ctx.measureText(l).width <= maxW)
    ctx.restore()
    return ok
  })
  while (size > 24 && !fits(size)) size *= 0.95
  v.columns.forEach((c, i) => {
    const lines = wrap(ctx, c.label, maxW, size, TYPE.weight.bold)
    const lh = size * 1.05
    const base = headTop + 2 * lh - (lines.length - 1) * lh
    lines.forEach((l, k) => text(ctx, l, cx(i), base + k * lh, { size, weight: TYPE.weight.bold, color: r.text, align: 'center', alpha: ha }))
    if (c.sub) label(ctx, c.sub, cx(i), headTop + 2 * lh + 64, i === v.highlight ? r.accent : r.textMuted, { align: 'center', alpha: ha })
  })

  // Rows, staggered in.
  const s = Math.min(0.05, 0.45 / Math.max(1, v.rows.length))
  v.rows.forEach((row, ri) => {
    const ry = top + headH + ri * rowH
    const a = window01(p, 0.15 + ri * s, 0.4 + ri * s)
    ctx.save()
    ctx.globalAlpha = a * 0.6
    ctx.fillStyle = r.rule
    ctx.fillRect(SAFE.left, ry, SAFE.width, 2)
    ctx.restore()
    const mid = ry + rowH / 2 + ls * 0.36
    text(ctx, row.label, SAFE.left, mid, { size: ls, weight: TYPE.weight.medium, color: r.textSoft, alpha: a })
    row.values.forEach((val, ci) => {
      if (val === 'yes') text(ctx, '✓', cx(ci), mid + 4, { size: ls * 1.3, weight: TYPE.weight.black, color: r.tone('good'), align: 'center', alpha: a })
      else if (val === 'no') text(ctx, '✗', cx(ci), mid + 4, { size: ls * 1.2, weight: TYPE.weight.bold, color: r.textMuted, align: 'center', alpha: a })
      else if (val === '-') text(ctx, '–', cx(ci), mid, { size: ls, color: r.textMuted, align: 'center', alpha: a })
      else label(ctx, val, cx(ci), mid, ci === v.highlight ? r.text : r.textSoft, { align: 'center', alpha: a })
    })
  })
}

/** Largest mono label size (≤ max) at which `value` fits `width`. */
function fitMono(ctx: Ctx, value: string, width: number, max: number) {
  ctx.save()
  ctx.font = font(max, TYPE.weight.medium, TYPE.mono)
  ctx.letterSpacing = `${TYPE.tracking.label * max}px`
  const w = ctx.measureText(value.toUpperCase()).width
  ctx.restore()
  return w > width ? (max * width) / w : max
}
