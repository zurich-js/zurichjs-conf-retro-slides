import { type Roles, TYPE } from '../brand/tokens'
import type { Visual } from '../engine/types'
import { type Ctx, enter, label, SAFE, text, window01 } from './kit'

/**
 * The `heatmap` painter: rows of cells (e.g. one row per year, one cell per
 * month), each cell's fill strength showing its value, the number inside, and
 * the row total at the end. `show` limits the rows drawn and `from` is the
 * first row that animates in, so a step can add a row under the last one.
 * The highest cell overall is outlined.
 */

type HeatmapVisual = Extract<Visual, { kind: 'heatmap' }>
const fmt = (n: number) => Math.round(n).toLocaleString('en-US')

export function paintHeatmap(ctx: Ctx, v: HeatmapVisual, p: number, r: Roles) {
  const D = TYPE.tracking.display
  const tsize = TYPE.size.h2 * 0.75
  let y = SAFE.top + 40
  ctx.save(); enter(ctx, window01(p, 0, 0.4))
  if (v.kicker) { label(ctx, v.kicker, SAFE.left, y, r.accent); y += 60 }
  text(ctx, v.title, SAFE.left, y + tsize * 0.8, { size: tsize, weight: TYPE.weight.black, tracking: D, color: r.text })
  y += tsize + 30
  if (v.source) { label(ctx, v.source, SAFE.left, y + 30, r.textMuted); y += 50 }
  ctx.restore()

  const shown = Math.min(v.rows.length, v.show ?? v.rows.length)
  const from = Math.min(shown - 1, v.from ?? 0)
  const max = Math.max(...v.rows.flatMap((row) => row.values))
  const labelW = 340
  const totalW = 250
  const n = v.columns.length
  const gap = 14
  const cell = Math.min(220, (SAFE.width - labelW - totalW - gap * (n - 1)) / n)
  const rowGap = 40
  // Rows shrink to fit above the wordmark when there are more than two.
  const avail = SAFE.bottom - 40 - (y + 100)
  const rowH = Math.min(250, (avail - (v.rows.length - 1) * rowGap) / v.rows.length)
  const num = Math.min(TYPE.size.body, cell * 0.42)
  const gridW = cell * n + gap * (n - 1)
  const x0 = SAFE.left + labelW
  // Centre the full grid (every row, shown or not) so adding a row never moves the others.
  const blockH = 70 + v.rows.length * rowH + (v.rows.length - 1) * rowGap
  const top = y + 100 + Math.max(0, (SAFE.bottom - (y + 100) - blockH) / 2)

  // Column headers.
  const ha = window01(p, 0.05, 0.35)
  v.columns.forEach((c, i) => label(ctx, c, x0 + i * (cell + gap) + cell / 2, top - 30, r.textMuted, { align: 'center', alpha: ha }))
  label(ctx, 'Total', x0 + gridW + totalW - 20, top - 30, r.textMuted, { align: 'right', alpha: ha })

  for (let ri = 0; ri < shown; ri++) {
    const row = v.rows[ri]!
    const ry = top + ri * (rowH + rowGap)
    const animated = ri >= from
    const ra = animated ? window01(p, 0.1, 0.4) : 1
    text(ctx, row.label, SAFE.left, ry + rowH / 2 + TYPE.size.body * 0.36, { size: TYPE.size.body, weight: TYPE.weight.bold, color: r.text, alpha: ra })
    row.values.forEach((val, i) => {
      // Cells fill in left to right.
      const ca = animated ? window01(p, 0.2 + (i / n) * 0.55, 0.35 + (i / n) * 0.55) : 1
      const cx = x0 + i * (cell + gap)
      const strength = 0.12 + 0.88 * (val / max)
      ctx.save()
      ctx.globalAlpha = ca
      ctx.fillStyle = r.card
      ctx.beginPath(); ctx.roundRect(cx, ry, cell, rowH, 18); ctx.fill()
      ctx.globalAlpha = ca * strength
      ctx.fillStyle = r.tone(row.tone ?? 'hero')
      ctx.beginPath(); ctx.roundRect(cx, ry, cell, rowH, 18); ctx.fill()
      if (val === max) {
        ctx.globalAlpha = ca
        ctx.strokeStyle = r.text
        ctx.lineWidth = 6
        ctx.beginPath(); ctx.roundRect(cx + 3, ry + 3, cell - 6, rowH - 6, 16); ctx.stroke()
      }
      ctx.restore()
      text(ctx, fmt(val), cx + cell / 2, ry + rowH / 2 + num * 0.36, {
        size: num, weight: TYPE.weight.black, color: strength > 0.55 ? r.bg : r.text, align: 'center', alpha: ca,
      })
    })
    const total = row.values.reduce((a, b) => a + b, 0)
    text(ctx, fmt(total), x0 + gridW + totalW - 20, ry + rowH / 2 + TYPE.size.h2 * 0.3, {
      size: TYPE.size.h2 * 0.8, weight: TYPE.weight.black, tracking: D, color: r.tone(row.tone ?? 'hero'), align: 'right',
      alpha: animated ? window01(p, 0.8, 1) : 1,
    })
  }
}
