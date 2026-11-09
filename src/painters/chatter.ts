import { type Roles, TYPE } from '../brand/tokens'
import type { Visual } from '../engine/types'
import { type Ctx, enter, label, SAFE, text, window01 } from './kit'

/**
 * The `chatter` painter: a year of Slack. Message bubbles pour into a
 * channel on the left, faster and faster, coloured by where they were sent;
 * on the right the total runs up, a few team-level figures land, and a bar
 * splits the total into private channels, DMs and public. Never per person:
 * a count by name reads as a ranking of effort. No timeline: the export
 * gives volumes, not when. `p` is linear (see drawTiming).
 */

type ChatterVisual = Extract<Visual, { kind: 'chatter' }>

export const CHATTER_SECS = 10
const FLOW = { start: 0.04, end: 0.8 }
const BUBBLES = 70

const noise = (n: number) => { const x = Math.sin(n * 33.7 + 2.9) * 43758.5453; return x - Math.floor(x) }
const PANE = { x: SAFE.left, y: 390, w: 820, h: 830 }

export function paintChatter(ctx: Ctx, v: ChatterVisual, p: number, r: Roles) {
  const D = TYPE.tracking.display
  const f = Math.min(1, Math.max(0, (p - FLOW.start) / (FLOW.end - FLOW.start)))
  // Accelerating: slow at first, a flood by the end (counters follow the same curve).
  const g = f * f * (3 - 2 * f) * 0.5 + f * f * 0.5
  const ca = window01(p, 0.02, 0.08)

  ctx.save(); enter(ctx, window01(p, 0, 0.06))
  if (v.kicker) label(ctx, v.kicker, SAFE.left, SAFE.top + 30, r.accent)
  text(ctx, v.title, SAFE.left, SAFE.top + 140, { size: TYPE.size.h2 * 0.75, weight: TYPE.weight.black, tracking: D, color: r.text })
  ctx.restore()

  // The channel: bubbles stacking up from the bottom and scrolling, newest at the bottom.
  const all = v.channels.reduce((a, c) => a + c.value, 0)
  const seg = (i: number) => (i === 0 ? r.tone('neutral') : i === 1 ? r.textSoft : r.accent)
  const pick = (k: number) => {
    let x = noise(k + 41) * all
    for (let i = 0; i < v.channels.length; i++) { x -= v.channels[i]!.value; if (x < 0) return i }
    return v.channels.length - 1
  }
  const shown = g * BUBBLES
  const rowH = 96
  ctx.save()
  ctx.beginPath(); ctx.roundRect(PANE.x, PANE.y, PANE.w, PANE.h, 28); ctx.clip()
  ctx.fillStyle = r.card
  ctx.globalAlpha = ca
  ctx.fillRect(PANE.x, PANE.y, PANE.w, PANE.h)
  ctx.globalAlpha = 1
  for (let k = Math.max(0, Math.floor(shown) - 10); k < shown; k++) {
    const age = shown - k - 1 // 0 = newest
    const y = PANE.y + PANE.h - 70 - age * rowH
    if (y < PANE.y - rowH) continue
    const who = pick(k)
    const a = Math.min(1, (shown - k) * 2)
    const x = PANE.x + 40
    ctx.save()
    ctx.globalAlpha *= a * ca
    ctx.fillStyle = seg(who)
    ctx.beginPath(); ctx.arc(x + 28, y, 28, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
    const w = 200 + noise(k + 9) * 460
    ctx.save()
    ctx.globalAlpha *= a * ca
    ctx.fillStyle = r.rule
    ctx.beginPath(); ctx.roundRect(x + 76, y - 30, w, 60, 22); ctx.fill()
    ctx.fillStyle = r.textMuted
    ctx.globalAlpha *= 0.5
    ctx.fillRect(x + 100, y - 6, w * 0.7, 12)
    ctx.restore()
  }
  const fade = ctx.createLinearGradient(0, PANE.y, 0, PANE.y + 90)
  fade.addColorStop(0, r.card)
  fade.addColorStop(1, 'transparent')
  ctx.fillStyle = fade
  ctx.fillRect(PANE.x, PANE.y, PANE.w, 90)
  ctx.restore()

  // The total, then the team-level figures, landing one after another.
  const RX = PANE.x + PANE.w + 120
  text(ctx, Math.round(v.total * g).toLocaleString('en-US'), RX, 530, { size: TYPE.size.stat * 0.6, weight: TYPE.weight.black, tracking: D, color: r.accent, alpha: ca })
  label(ctx, v.unit, RX + 6, 600, r.textSoft, { alpha: ca })
  // One row each: the figure right-aligned in a column, what it means beside it.
  v.stats.forEach((st, i) => {
    const a = window01(p, FLOW.start + 0.15 + i * 0.14, FLOW.start + 0.27 + i * 0.14)
    const y = 730 + i * 105 + (1 - a) * 40
    text(ctx, st.value, RX + 300, y, { size: TYPE.size.label * 2, weight: TYPE.weight.black, tracking: D, color: r.text, align: 'right', alpha: a * ca })
    label(ctx, st.label, RX + 340, y - 6, r.textSoft, { alpha: a * ca })
  })

  // Where they went: one bar split by channel kind, filling with the rest; legend in the same colours.
  const by = 1060
  const W = SAFE.right - RX
  let x = RX
  v.channels.forEach((c, i) => {
    const w = (c.value / all) * W * g
    ctx.save(); ctx.globalAlpha = ca
    ctx.fillStyle = seg(i)
    ctx.fillRect(x, by, Math.max(0, w - 4), 46)
    ctx.restore()
    x += w
  })
  // Legend: each kind over its count, in the segment's colour.
  const n = v.channels.length
  v.channels.forEach((c, i) => {
    const align: CanvasTextAlign = i === 0 ? 'left' : i === n - 1 ? 'right' : 'center'
    const lx = i === 0 ? RX : i === n - 1 ? SAFE.right : RX + W * 0.55
    label(ctx, c.label, lx, by + 104, r.textMuted, { alpha: ca, align })
    label(ctx, Math.round(c.value * g).toLocaleString('en-US'), lx, by + 164, seg(i), { alpha: ca, align })
  })
  if (v.note) label(ctx, v.note, RX, by - 44, r.textMuted, { alpha: window01(p, FLOW.end, 1) })
}
