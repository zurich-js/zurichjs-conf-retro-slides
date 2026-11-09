import { type Roles, type Tone, TYPE } from '../brand/tokens'
import type { Visual } from '../engine/types'
import { type Ctx, enter, label, SAFE, text, window01 } from './kit'

/**
 * The `checkout` painter: ticket-shop card payments arriving, like the CFP
 * inbox. One card per payment flies into a payment terminal on the day it was
 * paid, coloured by its currency, and the terminal flashes APPROVED. A live
 * count and the currency tally run on the left; payments per day draw along
 * the bottom as the days pass; on the right, the months fill as their
 * payments land. `p` is linear (see drawTiming).
 */

type CheckoutVisual = Extract<Visual, { kind: 'checkout' }>
type Currency = 'chf' | 'eur' | 'usd' | 'gbp'

export const CHECKOUT_SECS = 12
const FLOW = { start: 0.04, end: 0.84 }
const FLIGHT = 0.07
const CURRENCIES: readonly { key: Currency; code: string; tone: Tone }[] = [
  { key: 'chf', code: 'CHF', tone: 'hero' },
  { key: 'eur', code: 'EUR', tone: 'neutral' },
  { key: 'gbp', code: 'GBP', tone: 'good' },
  { key: 'usd', code: 'USD', tone: 'warn' },
]
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const noise = (n: number) => { const x = Math.sin(n * 91.7 + 13.3) * 43758.5453; return x - Math.floor(x) }
const dayNum = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / 86400000
const monthKey = (iso: string) => iso.slice(0, 7)

const TERMINAL = { x: 1120, y: 620 }
const AXIS = { y: 1150, x0: SAFE.left, x1: 1300 }
const MONTHS_BOX = { x: 1480, bar: 1740, top: 420, bottom: 1170 }

interface Arrival { t: number; seed: number; cur: Currency; month: string }
const cache = new WeakMap<CheckoutVisual, Arrival[]>()
function arrivals(v: CheckoutVisual) {
  let a = cache.get(v)
  if (a) return a
  const d0 = dayNum(v.days[0]!.date)
  const span = dayNum(v.days[v.days.length - 1]!.date) + 1 - d0
  a = []
  let k = 0
  for (const d of v.days) {
    for (const c of CURRENCIES) {
      for (let i = 0; i < (d[c.key] ?? 0); i++, k++) {
        const at = (dayNum(d.date) - d0 + noise(k)) / span
        a.push({ t: FLOW.start + (FLOW.end - FLOW.start) * at, seed: k, cur: c.key, month: monthKey(d.date) })
      }
    }
  }
  a.sort((x, y) => x.t - y.t)
  cache.set(v, a)
  return a
}

/** A payment card seen in perspective, in its currency's colour, the code printed on it. */
function card(ctx: Ctx, x: number, y: number, w: number, tilt: number, spin: number, colour: string, ink: string, code: string, alpha: number) {
  const h = w * 0.63 * Math.max(0.12, Math.cos(tilt * Math.PI * 0.45))
  ctx.save()
  ctx.globalAlpha *= alpha
  ctx.translate(x, y)
  ctx.rotate(spin)
  ctx.fillStyle = colour
  ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, w * 0.08); ctx.fill()
  ctx.fillStyle = ink
  ctx.globalAlpha *= 0.55
  ctx.fillRect(-w * 0.36, -h * 0.12, w * 0.18, h * 0.24) // chip
  ctx.globalAlpha /= 0.55
  if (w > 50 && h > 30) {
    ctx.font = `${TYPE.weight.bold} ${Math.round(w * 0.2)}px ${TYPE.mono}`
    ctx.textAlign = 'right'
    ctx.fillText(code, w * 0.4, h * 0.35)
  }
  ctx.restore()
}

/** The card terminal: body, screen (APPROVED while a card lands), keypad. */
function terminal(ctx: Ctx, r: Roles, approved: boolean) {
  const { x, y } = TERMINAL
  ctx.fillStyle = r.card
  ctx.beginPath(); ctx.roundRect(x - 120, y - 170, 240, 360, 30); ctx.fill()
  ctx.strokeStyle = r.rule
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.fillStyle = approved ? r.tone('good') : r.surface
  ctx.beginPath(); ctx.roundRect(x - 90, y - 140, 180, 110, 12); ctx.fill()
  if (approved) {
    ctx.fillStyle = r.bg
    ctx.font = `${TYPE.weight.bold} 30px ${TYPE.mono}`
    ctx.textAlign = 'center'
    ctx.fillText('APPROVED', x, y - 74)
    ctx.textAlign = 'left'
  }
  for (let rr = 0; rr < 3; rr++) for (let c = 0; c < 3; c++) {
    ctx.fillStyle = r.rule
    ctx.beginPath(); ctx.roundRect(x - 78 + c * 56, y + 2 + rr * 52, 44, 36, 8); ctx.fill()
  }
}

export function paintCheckout(ctx: Ctx, v: CheckoutVisual, p: number, r: Roles) {
  const D = TYPE.tracking.display
  const all = arrivals(v)
  const live = all.filter((a) => a.t <= p)
  const landed = live.length

  ctx.save(); enter(ctx, window01(p, 0, 0.06))
  if (v.kicker) label(ctx, v.kicker, SAFE.left, SAFE.top + 30, r.accent)
  text(ctx, v.title, SAFE.left, SAFE.top + 140, { size: TYPE.size.h2 * 0.75, weight: TYPE.weight.black, tracking: D, color: r.text })
  ctx.restore()
  const ia = window01(p, 0.02, 0.08)
  text(ctx, landed.toLocaleString('en-US'), SAFE.left, 560, { size: TYPE.size.stat * 0.72, weight: TYPE.weight.black, tracking: D, color: r.accent, alpha: ia })
  label(ctx, v.unit, SAFE.left + 8, 630, r.textSoft, { alpha: ia })

  // Today, and the currency tally so far.
  const d0 = dayNum(v.days[0]!.date)
  const d1 = dayNum(v.days[v.days.length - 1]!.date) + 1
  const f = Math.min(1, Math.max(0, (p - FLOW.start) / (FLOW.end - FLOW.start)))
  const today = new Date((d0 + Math.min(f * (d1 - d0), d1 - d0 - 1)) * 86400000)
  label(ctx, `${today.getUTCDate()} ${MONTHS[today.getUTCMonth()]} ${today.getUTCFullYear()}`, SAFE.left + 8, 690, r.textMuted, { alpha: ia })
  // The tally, two by two, clear of the terminal.
  CURRENCIES.forEach((c, i) => {
    const n = live.filter((a) => a.cur === c.key).length
    label(ctx, `${c.code} ${n}`, SAFE.left + 8 + (i % 2) * 300, 770 + Math.floor(i / 2) * 64, r.tone(c.tone), { alpha: ia })
  })

  const approved = all.some((a) => a.t <= p && a.t > p - 0.008)
  terminal(ctx, r, approved && p < 1)
  label(ctx, v.terminal, TERMINAL.x, TERMINAL.y + 240, r.textMuted, { align: 'center', alpha: ia })

  // Cards in flight: from off the left edge, curving into the terminal's slot.
  for (const a of all) {
    const s = (p - (a.t - FLIGHT)) / FLIGHT
    if (s <= 0 || s >= 1) continue
    const sx = -160 + noise(a.seed + 7) * 200
    const sy = 960 + (noise(a.seed + 3) - 0.5) * 80
    const e = s * s * (3 - 2 * s)
    const x = sx + (TERMINAL.x - sx) * e
    const y = sy + (TERMINAL.y - 60 - sy) * e * e - Math.sin(Math.PI * e) * (10 + noise(a.seed + 5) * 30)
    const w = 120 * (1.1 - 0.8 * e)
    const c = CURRENCIES.find((k) => k.key === a.cur)!
    card(ctx, x, y, w, e, (noise(a.seed + 11) - 0.5) * 0.6 * (1 - e), r.tone(c.tone), r.bg, c.code, Math.min(1, s * 5) * (1 - Math.max(0, e - 0.85) / 0.15))
  }

  // Payments per day along the bottom, stacked by currency, drawn as the days pass.
  const perDay = v.days.map((d) => CURRENCIES.reduce((n, c) => n + (d[c.key] ?? 0), 0))
  const peak = Math.max(...perDay)
  ctx.save()
  ctx.globalAlpha = ia
  ctx.fillStyle = r.rule
  ctx.fillRect(AXIS.x0, AXIS.y, AXIS.x1 - AXIS.x0, 2)
  v.days.forEach((d) => {
    const at = (dayNum(d.date) - d0 + 0.5) / (d1 - d0)
    if (at > f) return
    const x = AXIS.x0 + at * (AXIS.x1 - AXIS.x0)
    let y = AXIS.y
    for (const c of CURRENCIES) {
      const h = ((d[c.key] ?? 0) / peak) * 190
      if (!h) continue
      ctx.fillStyle = r.tone(c.tone)
      ctx.fillRect(x - 5, y - h, 10, h)
      y -= h
    }
  })
  ctx.restore()
  // Month ticks under the axis.
  const seen = new Set<string>()
  let lastX = -1e9
  for (const d of v.days) {
    const k = monthKey(d.date)
    if (seen.has(k)) continue
    seen.add(k)
    const first = Date.UTC(+k.slice(0, 4), +k.slice(5, 7) - 1, 1) / 86400000
    const x = AXIS.x0 + ((Math.max(first, d0) - d0) / (d1 - d0)) * (AXIS.x1 - AXIS.x0)
    // A month that starts too close to the last tick (the partial first month) gets no letter.
    if (x - lastX < 60) continue
    lastX = x
    label(ctx, MONTHS[+k.slice(5, 7) - 1]!.slice(0, 1), x, AXIS.y + 56, r.textMuted, { align: 'center', alpha: ia })
  }
  if (v.peak) label(ctx, v.peak, AXIS.x1, AXIS.y - 200, r.accent, { align: 'right', alpha: window01(p, FLOW.end - 0.04, FLOW.end + 0.04) })

  // By month, on the right: each month's bar grows as its payments land; the busiest is highlighted.
  const months = [...seen]
  const totals = months.map((m) => all.filter((a) => a.month === m).length)
  const counts = months.map((m) => live.filter((a) => a.month === m).length)
  const best = Math.max(...totals)
  label(ctx, v.monthsLabel, MONTHS_BOX.x, MONTHS_BOX.top, r.textMuted, { alpha: ia })
  const rowH = (MONTHS_BOX.bottom - MONTHS_BOX.top - 30) / months.length
  const barMax = SAFE.right - MONTHS_BOX.bar - 110
  months.forEach((m, i) => {
    const y = MONTHS_BOX.top + 30 + (i + 0.75) * rowH
    const n = counts[i]!
    const w = Math.max(4, (n / best) * barMax)
    const month = MONTHS[+m.slice(5, 7) - 1]!
    label(ctx, i === 0 || m.endsWith('-01') ? `${month} ${m.slice(2, 4)}` : month, MONTHS_BOX.x, y, r.textSoft, { alpha: ia })
    ctx.save()
    ctx.globalAlpha = ia
    ctx.fillStyle = totals[i] === best && n === best ? r.accent : r.tone('neutral')
    ctx.beginPath(); ctx.roundRect(MONTHS_BOX.bar, y - Math.min(34, rowH * 0.6), w, Math.min(32, rowH * 0.55), 8); ctx.fill()
    ctx.restore()
    label(ctx, String(n), MONTHS_BOX.bar + w + 18, y, r.text, { alpha: ia })
  })
}
