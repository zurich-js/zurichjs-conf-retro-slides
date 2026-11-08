import { FRAME, type Roles, TYPE } from '../brand/tokens'
import type { Visual } from '../engine/types'
import { type Ctx, label, text, window01 } from './kit'

/**
 * The `calendar` painter: a split-flap desk calendar that rolls month by month
 * from one date to another. Each flip: the top flap falls on its hinge, then
 * the next page's bottom flap settles. Flips speed up through the middle and
 * slow down to land. `p` is linear (see drawTiming); at 1 it shows `to`.
 */

type CalendarVisual = Extract<Visual, { kind: 'calendar' }>

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

/** Seconds for the whole roll, including the landing. */
export const CALENDAR_SECS = 4.2

interface Page { year: number; month: number; day: number }
const parse = (iso: string): Page => {
  const [y, m, d] = iso.split('-').map(Number)
  return { year: y!, month: m! - 1, day: d! }
}
const pageAt = (from: Page, k: number, dir: number): Page => {
  const n = from.year * 12 + from.month + k * dir
  return { year: Math.floor(n / 12), month: ((n % 12) + 12) % 12, day: from.day }
}
const weekday = (p: Page) => DAYS[new Date(Date.UTC(p.year, p.month, p.day)).getUTCDay()]!

const CARD = { w: 760, h: 860, header: 210, r: 40 }
const CX = FRAME.width / 2
const TOP = 250
const HINGE = TOP + CARD.h / 2

function drawPage(ctx: Ctx, p: Page, r: Roles) {
  const x = CX - CARD.w / 2
  ctx.fillStyle = r.card
  ctx.beginPath(); ctx.roundRect(x, TOP, CARD.w, CARD.h, CARD.r); ctx.fill()
  ctx.save()
  ctx.beginPath(); ctx.roundRect(x, TOP, CARD.w, CARD.h, CARD.r); ctx.clip()
  ctx.fillStyle = r.accent
  ctx.fillRect(x, TOP, CARD.w, CARD.header)
  ctx.restore()
  text(ctx, `${MONTHS[p.month]} ${p.year}`, CX, TOP + CARD.header / 2 + TYPE.size.h2 * 0.36, {
    size: TYPE.size.h2 * 0.9, weight: TYPE.weight.black, family: TYPE.mono, color: r.bg, align: 'center', tracking: TYPE.tracking.label,
  })
  text(ctx, String(p.day), CX, TOP + CARD.header + 420, {
    size: 440, weight: TYPE.weight.black, color: r.text, align: 'center', tracking: TYPE.tracking.display,
  })
  label(ctx, weekday(p), CX, TOP + CARD.h - 70, r.textMuted, { align: 'center', size: TYPE.size.label * 1.2 })
}

/** One half of a page, optionally folded about the hinge (s = 1 flat, 0 edge-on). */
function half(ctx: Ctx, p: Page, r: Roles, which: 'top' | 'bottom', s = 1) {
  ctx.save()
  ctx.translate(0, HINGE)
  ctx.scale(1, Math.max(0.001, s))
  ctx.translate(0, -HINGE)
  ctx.beginPath()
  if (which === 'top') ctx.rect(0, 0, FRAME.width, HINGE)
  else ctx.rect(0, HINGE, FRAME.width, FRAME.height)
  ctx.clip()
  drawPage(ctx, p, r)
  // Shade as the flap turns away from us.
  if (s < 1) {
    ctx.globalAlpha = (1 - s) * 0.55
    ctx.fillStyle = r.bg
    ctx.fillRect(CX - CARD.w / 2, which === 'top' ? TOP : HINGE, CARD.w, CARD.h / 2)
  }
  ctx.restore()
}

export function paintCalendar(ctx: Ctx, v: CalendarVisual, p: number, r: Roles) {
  const from = parse(v.from)
  const to = parse(v.to)
  const span = to.year * 12 + to.month - (from.year * 12 + from.month)
  const dir = Math.sign(span) || 1
  const flips = Math.abs(span)

  if (v.kicker) label(ctx, v.kicker, CX, TOP - 70, r.accent, { align: 'center', alpha: window01(p, 0, 0.12) })

  // Flip position along a smoothstep: slow start, fast middle, slow landing.
  const roll = window01(p, 0.08, 0.86)
  const pos = flips * roll * roll * (3 - 2 * roll)
  const k = Math.min(flips, Math.floor(pos))
  const f = k >= flips ? 0 : pos - k
  const cur = pageAt(from, k, dir)
  const next = pageAt(from, Math.min(flips, k + 1), dir)

  // Card shadow, then: next page's top behind, current page's bottom, then the moving flap.
  ctx.save()
  ctx.globalAlpha = 0.35
  ctx.fillStyle = r.bg
  ctx.beginPath(); ctx.roundRect(CX - CARD.w / 2 + 14, TOP + 22, CARD.w, CARD.h, CARD.r); ctx.fill()
  ctx.restore()
  if (f === 0) drawPage(ctx, cur, r)
  else {
    half(ctx, next, r, 'top')
    half(ctx, cur, r, 'bottom')
    if (f < 0.5) half(ctx, cur, r, 'top', 1 - f * 2)
    else half(ctx, next, r, 'bottom', f * 2 - 1)
  }
  // The hinge.
  ctx.fillStyle = r.rule
  ctx.fillRect(CX - CARD.w / 2, HINGE - 2, CARD.w, 4)
  for (const dx of [-CARD.w / 4, CARD.w / 4]) {
    ctx.fillStyle = r.textMuted
    ctx.beginPath(); ctx.roundRect(CX + dx - 40, TOP - 26, 80, 52, 14); ctx.fill()
  }

  if (v.caption) {
    text(ctx, v.caption, CX, TOP + CARD.h + 120, {
      size: TYPE.size.body, weight: TYPE.weight.bold, color: r.text, align: 'center', alpha: window01(p, 0.86, 1),
    })
  }
}
