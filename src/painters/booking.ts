import { type Roles, FRAME, TYPE } from '../brand/tokens'
import type { Visual } from '../engine/types'
import { type Ctx, enter, label, SAFE, text, window01, wrap } from './kit'

/**
 * The `booking` painter: booking a flight in an airline's mobile app, on a
 * phone held portrait. The app fills a 9:16 column in the middle of the frame
 * (the phone in the set shows only that column): search, the flight, payment,
 * then booked. On the flat slide a kicker and title sit to its left.
 * Progress is linear over BOOKING_SECS; each screen slides in like an app push.
 */
type BookingVisual = Extract<Visual, { kind: 'booking' }>

export const BOOKING_SECS = 12

/** The phone's screen: a 9:16 column, full height, centred. The set crops the frame to it. */
export const PHONE_COLUMN = { width: (FRAME.height * 9) / 16, x: (FRAME.width - (FRAME.height * 9) / 16) / 2 } as const

const ease = (t: number) => 1 - Math.pow(1 - t, 3)

export function paintBooking(ctx: Ctx, v: BookingVisual, p: number, r: Roles) {
  // Beside the phone (flat only; the set shows just the column).
  ctx.save(); enter(ctx, window01(p, 0, 0.06))
  label(ctx, v.kicker, SAFE.left, SAFE.top + 40, r.accent)
  const tw = PHONE_COLUMN.x - SAFE.left - 80
  wrap(ctx, v.title, tw, TYPE.size.h2 * 0.8, TYPE.weight.black).forEach((l, i) =>
    text(ctx, l, SAFE.left, SAFE.top + 200 + i * TYPE.size.h2 * 0.8 * TYPE.lineHeight, { size: TYPE.size.h2 * 0.8, weight: TYPE.weight.black, tracking: TYPE.tracking.display, color: r.text }))
  ctx.restore()

  const X = PHONE_COLUMN.x
  const W = PHONE_COLUMN.width
  const a = r.app
  ctx.save()
  ctx.beginPath(); ctx.rect(X, 0, W, FRAME.height); ctx.clip()
  ctx.fillStyle = a.sheet
  ctx.fillRect(X, 0, W, FRAME.height)

  // Which screen, and how far the next one has pushed in.
  const cuts = [0.32, 0.54, 0.77]
  const PUSH = 0.035
  let screen = 0
  let push = 0
  cuts.forEach((c, i) => {
    if (p >= c + PUSH) screen = i + 1
    else if (p >= c) { screen = i; push = ease((p - c) / PUSH) }
  })
  const draw = (k: number, dx: number) => {
    ctx.save()
    ctx.translate(dx, 0)
    ctx.fillStyle = a.sheet
    ctx.fillRect(X, 0, W, FRAME.height)
    SCREENS[k]!(ctx, v, r, X, W, p)
    ctx.restore()
  }
  draw(screen, -push * W * 0.3)
  if (push > 0) draw(screen + 1, (1 - push) * W)

  // The app's bar stays put: status line and the airline's name.
  ctx.fillStyle = a.bar
  ctx.fillRect(X, 0, W, 210)
  text(ctx, '09:41', X + 50, 66, { size: 40, weight: TYPE.weight.bold, color: a.sheet })
  text(ctx, v.app, X + W / 2, 170, { size: 72, weight: TYPE.weight.black, tracking: 0.06, color: a.sheet, align: 'center' })
  ctx.restore()
}

type Screen = (ctx: Ctx, v: BookingVisual, r: Roles, X: number, W: number, p: number) => void

/** A rounded field: a small label over a big value. */
function field(ctx: Ctx, r: Roles, x: number, y: number, w: number, lab: string, value: string, sub?: string) {
  const a = r.app
  ctx.fillStyle = a.panel
  ctx.beginPath(); ctx.roundRect(x, y, w, 170, 28); ctx.fill()
  text(ctx, lab, x + 40, y + 56, { size: 36, weight: TYPE.weight.medium, color: a.muted })
  text(ctx, value, x + 40, y + 130, { size: 64, weight: TYPE.weight.black, color: a.ink })
  if (sub) text(ctx, sub, x + w - 40, y + 130, { size: 44, weight: TYPE.weight.medium, color: a.muted, align: 'right' })
}

/** The big button at the foot of a screen, darkening while it is tapped. */
function button(ctx: Ctx, r: Roles, X: number, W: number, value: string, tap: number, color?: string) {
  const a = r.app
  const y = FRAME.height - 260
  ctx.fillStyle = color ?? a.bar
  ctx.beginPath(); ctx.roundRect(X + 50, y, W - 100, 150, 75); ctx.fill()
  if (tap > 0 && tap < 1) {
    ctx.save(); ctx.globalAlpha = 0.3 * Math.sin(Math.PI * tap); ctx.fillStyle = a.ink
    ctx.beginPath(); ctx.roundRect(X + 50, y, W - 100, 150, 75); ctx.fill(); ctx.restore()
  }
  text(ctx, value, X + W / 2, y + 98, { size: 58, weight: TYPE.weight.black, color: a.sheet, align: 'center' })
}

function heading(ctx: Ctx, r: Roles, X: number, value: string) {
  text(ctx, value, X + 50, 340, { size: 84, weight: TYPE.weight.black, tracking: TYPE.tracking.display, color: r.app.ink })
}

const SCREENS: readonly Screen[] = [
  // 1. Search.
  (ctx, v, r, X, W, p) => {
    heading(ctx, r, X, 'Book a flight')
    field(ctx, r, X + 50, 420, W - 100, 'From', v.from.code, v.from.city)
    field(ctx, r, X + 50, 620, W - 100, 'To', v.to.code, v.to.city)
    field(ctx, r, X + 50, 820, W - 100, 'Departure', v.when)
    button(ctx, r, X, W, 'Search flights', window01(p, 0.26, 0.31))
  },
  // 2. The flight.
  (ctx, v, r, X, W, p) => {
    const a = r.app
    heading(ctx, r, X, `${v.from.city} to ${v.to.city}`)
    const picked = p >= 0.43
    const y = 440
    ctx.fillStyle = a.panel
    ctx.beginPath(); ctx.roundRect(X + 50, y, W - 100, 330, 28); ctx.fill()
    if (picked) { ctx.strokeStyle = a.bar; ctx.lineWidth = 8; ctx.beginPath(); ctx.roundRect(X + 50, y, W - 100, 330, 28); ctx.stroke() }
    text(ctx, v.from.code, X + 100, y + 150, { size: 96, weight: TYPE.weight.black, color: a.ink })
    text(ctx, v.to.code, X + W - 100, y + 150, { size: 96, weight: TYPE.weight.black, color: a.ink, align: 'right' })
    text(ctx, '✈', X + W / 2, y + 135, { size: 72, color: a.bar, align: 'center' })
    text(ctx, v.fare, X + 100, y + 260, { size: 48, weight: TYPE.weight.medium, color: a.muted })
    text(ctx, v.when, X + W - 100, y + 260, { size: 48, weight: TYPE.weight.medium, color: a.muted, align: 'right' })
    button(ctx, r, X, W, 'Continue', window01(p, 0.48, 0.53))
  },
  // 3. Payment.
  (ctx, v, r, X, W, p) => {
    const a = r.app
    heading(ctx, r, X, 'Payment')
    field(ctx, r, X + 50, 420, W - 100, 'Card', '•••• ••••')
    field(ctx, r, X + 50, 620, W - 100, 'Flight', `${v.from.code} to ${v.to.code}`, v.when)
    const tap = window01(p, 0.62, 0.66)
    const busy = window01(p, 0.66, 0.76)
    button(ctx, r, X, W, busy > 0 ? '' : 'Pay now', tap)
    if (busy > 0 && busy < 1) {
      // A spinner in the button while the payment goes through.
      const cx = X + W / 2
      const cy = FRAME.height - 260 + 75
      ctx.save(); ctx.strokeStyle = a.sheet; ctx.lineWidth = 10; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.arc(cx, cy, 36, busy * 18, busy * 18 + 4.4); ctx.stroke(); ctx.restore()
    }
  },
  // 4. Booked.
  (ctx, v, r, X, W, p) => {
    const a = r.app
    const k = ease(window01(p, 0.8, 0.9))
    const cx = X + W / 2
    ctx.fillStyle = a.done
    ctx.beginPath(); ctx.arc(cx, 520, 150 * k, 0, Math.PI * 2); ctx.fill()
    if (k > 0.6) {
      ctx.save(); ctx.strokeStyle = a.sheet; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
      ctx.beginPath(); ctx.moveTo(cx - 62, 525); ctx.lineTo(cx - 15, 572); ctx.lineTo(cx + 70, 470); ctx.stroke(); ctx.restore()
    }
    const t = window01(p, 0.86, 0.96)
    text(ctx, 'Booked', cx, 820, { size: 120, weight: TYPE.weight.black, tracking: TYPE.tracking.display, color: a.ink, align: 'center', alpha: t })
    text(ctx, `${v.from.code} to ${v.to.code} · ${v.when}`, cx, 930, { size: 56, weight: TYPE.weight.bold, color: a.ink, align: 'center', alpha: t })
    text(ctx, v.what, cx, 1020, { size: 52, weight: TYPE.weight.medium, color: a.muted, align: 'center', alpha: t })
    text(ctx, 'Have a good trip', cx, FRAME.height - 170, { size: 52, weight: TYPE.weight.bold, color: a.bar, align: 'center', alpha: window01(p, 0.92, 1) })
  },
]
