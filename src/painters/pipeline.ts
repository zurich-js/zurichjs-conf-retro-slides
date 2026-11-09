import { type Roles, TYPE } from '../brand/tokens'
import type { Visual } from '../engine/types'
import { type Ctx, enter, font, label, SAFE, text, window01 } from './kit'

/**
 * The `pipeline` painter: a year of commits through a CI/CD pipeline. Commits
 * stream in at each month's real rate and run commit → build → test → deploy;
 * each stage lights as they pass. Below, the months fill with their commit
 * counts, and features pop out as "deployed" when their month passes.
 * `p` is linear (see drawTiming).
 */

type PipelineVisual = Extract<Visual, { kind: 'pipeline' }>

export const PIPELINE_SECS = 13
const FLOW = { start: 0.05, end: 0.86 }
const RUN = 0.06 // one commit's trip through the pipeline, as a share of the draw-in

const noise = (n: number) => { const x = Math.sin(n * 57.3 + 7.1) * 43758.5453; return x - Math.floor(x) }

const LANE = { y: 500, x0: SAFE.left + 60, x1: SAFE.right - 60 }
const AXIS = { y: 1200, x0: SAFE.left, x1: SAFE.right }
const BAR_H = 200
/** Feature pill rows, between the stage labels and the month bars. */
const ROWS = [730, 815, 900]
const PILL_H = 66

const cache = new WeakMap<PipelineVisual, number[]>()
/** Every commit's entry time (share of the draw-in), spread through its month. */
function entries(v: PipelineVisual) {
  let e = cache.get(v)
  if (e) return e
  e = []
  const n = v.months.length
  let k = 0
  v.months.forEach((m, i) => {
    for (let c = 0; c < m.commits; c++, k++) e!.push(FLOW.start + ((i + noise(k)) / n) * (FLOW.end - FLOW.start))
  })
  e.sort((a, b) => a - b)
  cache.set(v, e)
  return e
}

export function paintPipeline(ctx: Ctx, v: PipelineVisual, p: number, r: Roles) {
  const D = TYPE.tracking.display
  const n = v.months.length
  const f = Math.min(1, Math.max(0, (p - FLOW.start) / (FLOW.end - FLOW.start)))
  const all = entries(v)
  const done = all.reduce((c, t) => c + (t + RUN <= p ? 1 : 0), 0)
  const monthsDone = f * n
  const prs = v.months.reduce((c, m, i) => c + m.prs * Math.min(1, Math.max(0, monthsDone - i)), 0)

  ctx.save(); enter(ctx, window01(p, 0, 0.06))
  if (v.kicker) label(ctx, v.kicker, SAFE.left, SAFE.top + 30, r.accent)
  text(ctx, v.title, SAFE.left, SAFE.top + 140, { size: TYPE.size.h2 * 0.75, weight: TYPE.weight.black, tracking: D, color: r.text })
  ctx.restore()
  // Counters, top right.
  const ca = window01(p, 0.02, 0.08)
  text(ctx, done.toLocaleString('en-US'), SAFE.right - 520, SAFE.top + 150, { size: TYPE.size.h1 * 0.9, weight: TYPE.weight.black, tracking: D, color: r.accent, align: 'right', alpha: ca })
  label(ctx, 'Commits', SAFE.right - 520, SAFE.top + 210, r.textSoft, { align: 'right', alpha: ca })
  text(ctx, Math.round(prs).toLocaleString('en-US'), SAFE.right, SAFE.top + 150, { size: TYPE.size.h1 * 0.9, weight: TYPE.weight.black, tracking: D, color: r.tone('good'), align: 'right', alpha: ca })
  label(ctx, 'PRs merged', SAFE.right, SAFE.top + 210, r.textSoft, { align: 'right', alpha: ca })

  // The pipeline: stage nodes on a lane.
  const stages = v.stages
  const sx = (i: number) => LANE.x0 + (i / (stages.length - 1)) * (LANE.x1 - LANE.x0)
  ctx.save(); ctx.globalAlpha = ca
  ctx.fillStyle = r.rule
  ctx.fillRect(LANE.x0, LANE.y - 3, LANE.x1 - LANE.x0, 6)
  ctx.restore()
  // Commits in flight along the lane.
  for (let k = 0; k < all.length; k++) {
    const s = (p - all[k]!) / RUN
    if (s <= 0 || s >= 1) continue
    const x = LANE.x0 + s * (LANE.x1 - LANE.x0)
    const y = LANE.y + (noise(k + 3) - 0.5) * 44
    ctx.fillStyle = s > 0.98 ? r.tone('good') : r.accent
    ctx.globalAlpha = 0.85
    ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill()
    ctx.globalAlpha = 1
  }
  stages.forEach((st, i) => {
    const x = sx(i)
    // A stage glows while commits pass it.
    const near = all.some((t) => { const s = (p - t) / RUN; return s > 0 && s < 1 && Math.abs(LANE.x0 + s * (LANE.x1 - LANE.x0) - x) < 40 })
    ctx.save(); ctx.globalAlpha = ca
    ctx.fillStyle = r.card
    ctx.beginPath(); ctx.arc(x, LANE.y, 54, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = near ? r.tone('good') : r.rule
    ctx.lineWidth = near ? 8 : 4
    ctx.stroke()
    // A tick inside.
    ctx.strokeStyle = r.tone('good')
    ctx.lineWidth = 8
    ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(x - 20, LANE.y + 2); ctx.lineTo(x - 5, LANE.y + 18); ctx.lineTo(x + 22, LANE.y - 16); ctx.stroke()
    ctx.restore()
    label(ctx, st, Math.min(Math.max(x, SAFE.left + 120), SAFE.right - 140), LANE.y + 120, r.textSoft, { align: 'center', alpha: ca })
  })

  // Months: commit bars filling as the months pass, features above them.
  const mw = (AXIS.x1 - AXIS.x0) / n
  const peak = Math.max(...v.months.map((m) => m.commits))
  v.months.forEach((m, i) => {
    const fill = Math.min(1, Math.max(0, monthsDone - i))
    const x = AXIS.x0 + i * mw
    const h = (m.commits / peak) * BAR_H * fill
    ctx.save(); ctx.globalAlpha = ca
    ctx.fillStyle = r.card
    ctx.beginPath(); ctx.roundRect(x + 10, AXIS.y - BAR_H, mw - 20, BAR_H, 10); ctx.fill()
    ctx.fillStyle = m.commits === peak ? r.accent : r.tone('neutral')
    if (h > 0) { ctx.beginPath(); ctx.roundRect(x + 10, AXIS.y - h, mw - 20, h, 10); ctx.fill() }
    ctx.restore()
    label(ctx, m.label, x + mw / 2, AXIS.y + 56, r.textMuted, { align: 'center', alpha: ca })
    if (fill > 0) label(ctx, String(Math.round(m.commits * fill)), x + mw / 2, AXIS.y - h - 16, r.text, { align: 'center', alpha: ca, size: TYPE.size.label * 0.9 })
  })
  // Feature callouts: a pill per feature, popping in as its month passes. Each takes the
  // first row where it clears every pill placed before it, so none ever overlap.
  const ls = TYPE.size.label
  const placed: { row: number; l: number; r: number }[] = []
  const pills = v.features.map((ft) => {
    ctx.save(); ctx.font = font(ls, TYPE.weight.bold)
    const w = ctx.measureText(ft.label).width + 100
    ctx.restore()
    const x = AXIS.x0 + (ft.month + 0.5) * mw
    const left = Math.min(Math.max(SAFE.left, x - w / 2), SAFE.right - w)
    let row = ROWS.findIndex((_, k) => placed.every((q) => q.row !== k || left > q.r + 24 || left + w < q.l - 24))
    if (row < 0) row = ROWS.length - 1
    placed.push({ row, l: left, r: left + w })
    return { ft, x, w, left, y: ROWS[row]!, a: window01(monthsDone, ft.month, ft.month + 0.35) }
  })
  // Leader lines first, so pills sit on top of them.
  for (const q of pills) {
    if (q.a <= 0) continue
    ctx.save()
    ctx.globalAlpha *= q.a
    ctx.strokeStyle = r.rule
    ctx.lineWidth = 3
    ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(q.x, AXIS.y - BAR_H - 70); ctx.stroke()
    ctx.restore()
  }
  for (const q of pills) {
    if (q.a <= 0) continue
    ctx.save()
    ctx.globalAlpha *= q.a
    ctx.translate(0, (1 - q.a) * 30)
    ctx.fillStyle = r.card
    ctx.beginPath(); ctx.roundRect(q.left, q.y - PILL_H / 2, q.w, PILL_H, PILL_H / 2); ctx.fill()
    ctx.strokeStyle = r.rule
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = r.tone('good')
    ctx.beginPath(); ctx.arc(q.left + 38, q.y, 14, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
    text(ctx, q.ft.label, q.left + 66, q.y + 17, { size: ls, weight: TYPE.weight.bold, color: r.text, alpha: q.a })
  }
}
