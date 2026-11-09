import { type Roles, TYPE } from '../brand/tokens'
import type { Visual } from '../engine/types'
import { type Ctx, enter, font, label, SAFE, text, window01 } from './kit'
import { CX, CY, drawGlobe, dot, type LonLat, plane, projection, R, route, strokeRoute } from './journey'

/**
 * The `arrivals` painter: who came to Zurich from abroad, on the road-to-
 * Zurich globe, zoomed in close so the short European hops read. One flight
 * per origin lands in Zurich, staggered; as each lands, its row joins the
 * tally on the left and the running total. Attendee origins use the hero
 * tone, speaker-only origins neutral. `p` is linear (see drawTiming).
 */

type ArrivalsVisual = Extract<Visual, { kind: 'arrivals' }>

export const ARRIVALS_SECS = 11
const FLY = 0.22
/** The zoomed globe: much bigger than the journey's, its centre off to the right. */
const ZOOM = { scale: 2300, x: 1760, y: 760 }
/** The globe stays right of the tally; it fades in over this band. */
const MAP_LEFT = 1060

export function paintArrivals(ctx: Ctx, v: ArrivalsVisual, p: number, r: Roles) {
  const D = TYPE.tracking.display
  const centre: LonLat = v.centre
  const n = v.origins.length
  const start = (i: number) => 0.06 + (i / n) * 0.62
  const ca = window01(p, 0.02, 0.08)

  // The map: zoom the shared projection, draw, and put it back for the journey painter.
  projection.scale(ZOOM.scale).translate([ZOOM.x, ZOOM.y])
  ctx.save()
  ctx.beginPath(); ctx.rect(MAP_LEFT, 0, 2560 - MAP_LEFT, 1440); ctx.clip()
  drawGlobe(ctx, r, centre)
  const xy = (pl: { lat: number; lon: number }) => projection([pl.lon, pl.lat]) ?? [ZOOM.x, ZOOM.y]

  let people = 0
  v.origins.forEach((o, i) => {
    const t = (p - start(i)) / FLY
    if (t <= 0) return
    const s = Math.min(1, t)
    const e = s * s * (3 - 2 * s)
    const colour = o.attendees ? r.tone('hero') : r.tone('neutral')
    const pts = route({ from: o.place, to: v.home }, e, centre)
    ctx.save()
    ctx.strokeStyle = colour
    ctx.globalAlpha = 0.9
    ctx.lineWidth = 7
    ctx.lineCap = 'round'
    strokeRoute(ctx, pts)
    ctx.restore()
    dot(ctx, o.place, centre, 14, colour)
    if (s < 1) {
      const a = pts[pts.length - 1]!
      const b = pts[Math.max(0, pts.length - 4)]!
      if (a.vis) plane(ctx, a.x, a.y, Math.atan2(a.y - b.y, a.x - b.x), 40, colour, r.bg)
    } else {
      people += (o.attendees ?? 0) + (o.speakers ?? 0)
    }
  })
  dot(ctx, v.home, centre, 20, r.text)

  // Labels: Zurich first, then each origin that has taken off, skipping any that would collide.
  const boxes: { l: number; t: number; r: number; b: number }[] = []
  const place = (name: string, x: number, y: number, color: string, alpha: number) => {
    ctx.save(); ctx.font = font(TYPE.size.label, TYPE.weight.medium, TYPE.mono)
    const w = ctx.measureText(name.toUpperCase()).width * (1 + TYPE.tracking.label)
    ctx.restore()
    for (const [dx, dy, align] of [[24, -20, 'left'], [24, 52, 'left'], [-24, -20, 'right'], [-24, 52, 'right']] as const) {
      const lx = align === 'left' ? x + dx : x + dx - w
      const box = { l: lx - 8, t: y + dy - 44, r: lx + w + 8, b: y + dy + 8 }
      if (box.l < MAP_LEFT || box.r > SAFE.right || box.t < SAFE.top) continue
      if (boxes.some((q) => box.l < q.r && box.r > q.l && box.t < q.b && box.b > q.t)) continue
      boxes.push(box)
      label(ctx, name, x + dx, y + dy, color, { alpha, align })
      return
    }
  }
  // Zurich below its dot, where no flight comes in from.
  const [hx, hy] = xy(v.home)
  {
    ctx.save(); ctx.font = font(TYPE.size.label, TYPE.weight.medium, TYPE.mono)
    const w = ctx.measureText(v.home.name.toUpperCase()).width * (1 + TYPE.tracking.label)
    ctx.restore()
    boxes.push({ l: hx - w / 2 - 8, t: hy + 40, r: hx + w / 2 + 8, b: hy + 100 })
    label(ctx, v.home.name, hx, hy + 88, r.text, { alpha: ca, align: 'center' })
  }
  v.origins.forEach((o, i) => {
    const t = (p - start(i)) / FLY
    if (t <= 0) return
    const [x, y] = xy(o.place)
    place(o.place.name, x, y, r.textSoft, Math.min(1, t * 2))
  })
  ctx.restore()
  // Soften the map's left edge into the tally.
  ctx.save()
  const fade = ctx.createLinearGradient(MAP_LEFT, 0, MAP_LEFT + 160, 0)
  fade.addColorStop(0, r.bg)
  fade.addColorStop(1, 'transparent')
  ctx.fillStyle = fade
  ctx.fillRect(MAP_LEFT, 0, 160, 1440)
  ctx.restore()
  projection.scale(R).translate([CX, CY])

  // Left: title, the running total, then the tally by origin as they land.
  ctx.save(); enter(ctx, window01(p, 0, 0.06))
  if (v.kicker) label(ctx, v.kicker, SAFE.left, SAFE.top + 30, r.accent)
  text(ctx, v.title, SAFE.left, SAFE.top + 140, { size: TYPE.size.h2 * 0.75, weight: TYPE.weight.black, tracking: D, color: r.text })
  ctx.restore()
  const total = people.toLocaleString('en-US')
  text(ctx, total, SAFE.left, 540, { size: TYPE.size.h1, weight: TYPE.weight.black, tracking: D, color: r.accent, alpha: ca })
  ctx.save(); ctx.font = font(TYPE.size.h1, TYPE.weight.black)
  const tw = ctx.measureText(total).width
  ctx.restore()
  label(ctx, v.unit, SAFE.left + tw + 36, 540, r.textSoft, { alpha: ca })
  // The tally: country, then attending and speaking in two number columns.
  const COL = { attending: 660, speaking: 1000 }
  const top = 660
  label(ctx, 'Attending', COL.attending, top, r.textMuted, { alpha: ca, align: 'right' })
  label(ctx, 'Speaking', COL.speaking, top, r.textMuted, { alpha: ca, align: 'right' })
  const rowH = Math.min(60, (1240 - top - 20) / n)
  v.origins.forEach((o, i) => {
    const a = window01(p, start(i) + FLY * 0.9, start(i) + FLY * 1.1)
    if (a <= 0) return
    const y = top + 20 + (i + 0.9) * rowH
    text(ctx, o.place.name, SAFE.left, y, { size: TYPE.size.label, weight: TYPE.weight.bold, color: r.text, alpha: a })
    if (o.attendees) label(ctx, String(o.attendees), COL.attending, y, r.accent, { alpha: a, align: 'right' })
    if (o.speakers) label(ctx, String(o.speakers), COL.speaking, y, r.tone('neutral'), { alpha: a, align: 'right' })
  })
  if (v.note) label(ctx, v.note, SAFE.right, SAFE.bottom, r.textMuted, { align: 'right', alpha: window01(p, 0.85, 1) })
}
