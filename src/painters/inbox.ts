import { type Roles, TYPE } from '../brand/tokens'
import type { Visual } from '../engine/types'
import { type Ctx, enter, label, SAFE, text, window01 } from './kit'

/**
 * The `inbox` painter: the call for papers arriving. One envelope per
 * submission flies in perspective into our server, landing on the day it was
 * submitted, so the stream speeds up exactly when submissions did. Along the
 * bottom, submissions per day are drawn as the days pass; on the right, the
 * topic bars fill as the envelopes land. `p` is linear (see drawTiming).
 */

type InboxVisual = Extract<Visual, { kind: 'inbox' }>

export const INBOX_SECS = 12
const FLOW = { start: 0.04, end: 0.84 } // the share of the draw-in the days take
const FLIGHT = 0.07 // one envelope's flight, as a share of the draw-in

const noise = (n: number) => { const x = Math.sin(n * 91.7 + 13.3) * 43758.5453; return x - Math.floor(x) }
const dayNum = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / 86400000
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Left: count, server, the days along the bottom. Right: the topic bars, one line per topic.
const SERVER = { x: 1120, y: 600 }
const AXIS = { y: 1150, x0: SAFE.left, x1: 1300 }
const TOPICS = { x: 1480, bar: 1860, top: 420, bottom: 1170 }

/** Arrival time (share of the draw-in) of every submission, in order. Built once per visual. */
const cache = new WeakMap<InboxVisual, { t: number; seed: number }[]>()
function arrivals(v: InboxVisual) {
  let a = cache.get(v)
  if (a) return a
  const d0 = dayNum(v.days[0]!.date)
  const span = dayNum(v.days[v.days.length - 1]!.date) + 1 - d0
  a = []
  let k = 0
  for (const d of v.days) {
    for (let i = 0; i < d.n; i++, k++) {
      const at = (dayNum(d.date) - d0 + noise(k)) / span
      a.push({ t: FLOW.start + (FLOW.end - FLOW.start) * at, seed: k })
    }
  }
  a.sort((x, y) => x.t - y.t)
  cache.set(v, a)
  return a
}

/** An envelope seen in perspective: `tilt` 0 flat-on, 1 edge-on (turning away about its horizontal axis). */
function envelope(ctx: Ctx, x: number, y: number, w: number, tilt: number, spin: number, r: Roles, alpha: number) {
  const h = w * 0.62 * Math.max(0.12, Math.cos(tilt * Math.PI * 0.45))
  ctx.save()
  ctx.globalAlpha *= alpha
  ctx.translate(x, y)
  ctx.rotate(spin)
  ctx.fillStyle = r.text
  ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, w * 0.06); ctx.fill()
  ctx.strokeStyle = r.textMuted
  ctx.lineWidth = Math.max(1, w * 0.03)
  ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(0, h * 0.12); ctx.lineTo(w / 2, -h / 2); ctx.stroke()
  ctx.fillStyle = r.accent
  ctx.beginPath(); ctx.arc(0, h * 0.12, w * 0.08, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

function server(ctx: Ctx, r: Roles, glow: number) {
  const { x, y } = SERVER
  for (let i = 0; i < 3; i++) {
    const sy = y - 110 + i * 92
    ctx.fillStyle = r.card
    ctx.beginPath(); ctx.roundRect(x - 120, sy, 240, 76, 14); ctx.fill()
    ctx.strokeStyle = r.rule
    ctx.lineWidth = 3
    ctx.stroke()
    for (let j = 0; j < 3; j++) {
      ctx.fillStyle = j === 0 && glow > 0 ? r.tone('good') : r.textMuted
      ctx.globalAlpha = j === 0 ? 0.5 + 0.5 * glow : 0.5
      ctx.beginPath(); ctx.arc(x - 90 + j * 26, sy + 38, 7, 0, Math.PI * 2); ctx.fill()
      ctx.globalAlpha = 1
    }
    ctx.fillStyle = r.rule
    ctx.fillRect(x - 10, sy + 34, 100, 6)
  }
}

export function paintInbox(ctx: Ctx, v: InboxVisual, p: number, r: Roles) {
  const D = TYPE.tracking.display
  const all = arrivals(v)
  const total = all.length
  const landed = all.reduce((n, a) => n + (a.t <= p ? 1 : 0), 0)

  // Kicker, title and the live count.
  ctx.save(); enter(ctx, window01(p, 0, 0.06))
  if (v.kicker) label(ctx, v.kicker, SAFE.left, SAFE.top + 30, r.accent)
  text(ctx, v.title, SAFE.left, SAFE.top + 140, { size: TYPE.size.h2 * 0.75, weight: TYPE.weight.black, tracking: D, color: r.text })
  ctx.restore()
  text(ctx, landed.toLocaleString('en-US'), SAFE.left, 560, { size: TYPE.size.stat * 0.72, weight: TYPE.weight.black, tracking: D, color: r.accent, alpha: window01(p, 0.02, 0.08) })
  label(ctx, v.unit, SAFE.left + 8, 630, r.textSoft, { alpha: window01(p, 0.02, 0.08) })

  // Today's date on the timeline.
  const d0 = dayNum(v.days[0]!.date)
  const d1 = dayNum(v.days[v.days.length - 1]!.date) + 1
  const f = Math.min(1, Math.max(0, (p - FLOW.start) / (FLOW.end - FLOW.start)))
  const today = new Date((d0 + Math.min(f * (d1 - d0), d1 - d0 - 1)) * 86400000)
  label(ctx, `${today.getUTCDate()} ${MONTHS[today.getUTCMonth()]} ${today.getUTCFullYear()}`, SAFE.left + 8, 690, r.textMuted, { alpha: window01(p, 0.02, 0.08) * (f < 1 ? 1 : 0.6) })

  // The server, its first light flickering while mail lands.
  const busy = all.some((a) => a.t <= p && a.t > p - 0.01)
  server(ctx, r, busy ? 1 : 0)
  label(ctx, v.server, SERVER.x, SERVER.y + 230, r.textMuted, { align: 'center', alpha: window01(p, 0.02, 0.08) })

  // Envelopes in flight: from off the left edge and the top, curving into the server, shrinking as they go in.
  for (const a of all) {
    const s = (p - (a.t - FLIGHT)) / FLIGHT
    if (s <= 0 || s >= 1) continue
    // From off the left edge through the clear band under the date, rising into the server.
    const sx = -160 + noise(a.seed + 7) * 200
    const sy = 840 + (noise(a.seed + 3) - 0.5) * 110
    const e = s * s * (3 - 2 * s)
    const x = sx + (SERVER.x - 120 - sx) * e
    const y = sy + (SERVER.y - sy) * e * e - Math.sin(Math.PI * e) * (10 + noise(a.seed + 5) * 30)
    const w = 100 * (1.1 - 0.8 * e)
    envelope(ctx, x, y, w, e, (noise(a.seed + 11) - 0.5) * 0.6 * (1 - e), r, Math.min(1, s * 5) * (1 - Math.max(0, e - 0.85) / 0.15))
  }

  // Submissions per day along the bottom, drawn as the days pass.
  const peak = Math.max(...v.days.map((d) => d.n))
  ctx.save()
  ctx.globalAlpha = window01(p, 0.02, 0.08)
  ctx.fillStyle = r.rule
  ctx.fillRect(AXIS.x0, AXIS.y, AXIS.x1 - AXIS.x0, 2)
  for (const d of v.days) {
    const at = (dayNum(d.date) - d0 + 0.5) / (d1 - d0)
    if (at > f) continue
    const x = AXIS.x0 + at * (AXIS.x1 - AXIS.x0)
    const h = (d.n / peak) * 190
    ctx.fillStyle = d.n === peak ? r.accent : r.tone('neutral')
    ctx.fillRect(x - 5, AXIS.y - h, 10, h)
  }
  ctx.restore()
  for (let m = 0; m < 12; m++) {
    const first = Date.UTC(new Date(d0 * 86400000).getUTCFullYear(), m, 1) / 86400000
    for (const base of [first, Date.UTC(new Date(d1 * 86400000).getUTCFullYear(), m, 1) / 86400000]) {
      if (base < d0 || base > d1) continue
      const x = AXIS.x0 + ((base - d0) / (d1 - d0)) * (AXIS.x1 - AXIS.x0)
      label(ctx, MONTHS[m]!, x, AXIS.y + 56, r.textMuted, { align: 'center', alpha: window01(p, 0.02, 0.08) })
    }
  }
  if (v.peak) label(ctx, v.peak, AXIS.x1, AXIS.y - 225, r.accent, { align: 'right', alpha: window01(p, FLOW.end - 0.04, FLOW.end + 0.04) })

  // Topics fill as the submissions land: name, bar, count on one line each.
  const share = total ? landed / total : 0
  const max = Math.max(...v.topics.map((t) => t.value))
  const ta = window01(p, 0.02, 0.08)
  label(ctx, v.topicsLabel, TOPICS.x, TOPICS.top, r.textMuted, { alpha: ta })
  const rowH = (TOPICS.bottom - TOPICS.top - 30) / v.topics.length
  const barMax = SAFE.right - TOPICS.bar - 120
  v.topics.forEach((t, i) => {
    const y = TOPICS.top + 30 + (i + 0.75) * rowH
    const val = Math.round(t.value * share)
    const w = Math.max(6, (val / max) * barMax)
    text(ctx, t.label, TOPICS.x, y, { size: TYPE.size.label, weight: TYPE.weight.bold, color: r.textSoft, alpha: ta })
    ctx.save()
    ctx.globalAlpha = ta
    ctx.fillStyle = t.tone ? r.tone(t.tone) : r.tone('neutral')
    ctx.beginPath(); ctx.roundRect(TOPICS.bar, y - 34, w, 32, 8); ctx.fill()
    ctx.restore()
    label(ctx, String(val), TOPICS.bar + w + 18, y, r.text, { alpha: ta })
  })
}
