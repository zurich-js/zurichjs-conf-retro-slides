import { geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath, type GeoPermissibleObjects } from 'd3-geo'
import { feature } from 'topojson-client'
import land110 from 'world-atlas/land-110m.json'
import { FRAME, type Roles, TYPE } from '../brand/tokens'
import type { Leg, Place, Visual } from '../engine/types'
import { type Ctx, image, label, SAFE, text, window01, wrap } from './kit'

/**
 * The `journey` painter: a Flighty-style globe painted on the frame. An
 * orthographic globe (land from Natural Earth 110m, bundled), great-circle
 * routes lifted off the surface, a plane flying each new leg. Each step flies
 * one batch of legs and turns the globe to frame them; the last step shows
 * the whole map with totals. Solo legs use the hero tone, team legs neutral.
 */

type Topo = Parameters<typeof feature>[0]
const topo = land110 as unknown as Topo
const LAND = feature(topo, topo.objects.land as Parameters<typeof feature>[1]) as GeoPermissibleObjects
const GRATICULE = geoGraticule10()

const R = 500
const CX = SAFE.right - R
const CY = FRAME.height / 2 + 30
const projection = geoOrthographic().scale(R).translate([CX, CY]).clipAngle(90).precision(0.5)
const path = geoPath(projection)

type LonLat = [number, number]
const ll = (p: Place): LonLat => [p.lon, p.lat]

/** Spherical mean of points: where to point the globe so they all show. */
function centreOf(points: readonly Place[]): LonLat {
  let x = 0, y = 0, z = 0
  for (const p of points) {
    const la = (p.lat * Math.PI) / 180
    const lo = (p.lon * Math.PI) / 180
    x += Math.cos(la) * Math.cos(lo); y += Math.cos(la) * Math.sin(lo); z += Math.sin(la)
  }
  return [(Math.atan2(y, x) * 180) / Math.PI, (Math.atan2(z, Math.hypot(x, y)) * 180) / Math.PI]
}

/** Where to point the globe for leg k: between its ends (home before the first, a wide view at the end). */
const legCentre = (v: JourneyVisual, k: number): LonLat => {
  const j = v.journey
  if (k < 0) return ll(j.home)
  if (k >= j.legs.length) return [j.home.lon, j.home.lat - 12]
  const l = j.legs[k]!
  return centreOf([l.from, l.to])
}

/** Points along a leg, lifted off the globe; `vis` = in front of, or outside, the disc. */
function route(leg: Leg, t: number, centre: LonLat) {
  const a = ll(leg.from)
  const b = ll(leg.to)
  const interp = geoInterpolate(a, b)
  const lift = Math.min(0.42, 0.06 + geoDistance(a, b) * 0.28)
  const n = 72
  const pts: { x: number; y: number; vis: boolean }[] = []
  for (let i = 0; i <= n; i++) {
    const s = (i / n) * t
    const g = interp(s)
    const [px, py] = projection(g) ?? [CX, CY]
    const h = 1 + lift * Math.sin(Math.PI * s)
    const vx = px - CX
    const vy = py - CY
    const vis = geoDistance(g, centre) <= Math.PI / 2 || Math.hypot(vx, vy) * h > R
    pts.push({ x: CX + vx * h, y: CY + vy * h, vis })
  }
  return pts
}

function strokeRoute(ctx: Ctx, pts: ReturnType<typeof route>) {
  ctx.beginPath()
  let pen = false
  for (const q of pts) {
    if (!q.vis) { pen = false; continue }
    if (pen) ctx.lineTo(q.x, q.y)
    else ctx.moveTo(q.x, q.y)
    pen = true
  }
  ctx.stroke()
}

/** A small plane silhouette pointing along +x. */
function plane(ctx: Ctx, x: number, y: number, angle: number, size: number, fill: string, edge: string) {
  const s = [
    [1, 0], [0.72, 0.09], [0.12, 0.1], [-0.12, 0.7], [-0.3, 0.7], [-0.14, 0.1], [-0.62, 0.1], [-0.78, 0.34], [-0.92, 0.34], [-0.84, 0],
  ] as const
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.beginPath()
  s.forEach(([px, py], i) => (i ? ctx.lineTo(px * size, py * size) : ctx.moveTo(px * size, py * size)))
  for (let i = s.length - 2; i > 0; i--) ctx.lineTo(s[i]![0] * size, -s[i]![1] * size)
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.strokeStyle = edge
  ctx.lineWidth = 3
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}

function drawGlobe(ctx: Ctx, r: Roles, centre: LonLat) {
  projection.rotate([-centre[0], -centre[1]])
  path.context(ctx)
  // Atmosphere.
  ctx.save()
  const glow = ctx.createRadialGradient(CX, CY, R * 0.96, CX, CY, R * 1.16)
  glow.addColorStop(0, r.tone('neutral'))
  glow.addColorStop(1, 'transparent')
  ctx.globalAlpha = 0.32
  ctx.fillStyle = glow
  ctx.beginPath(); ctx.arc(CX, CY, R * 1.16, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
  // Ocean, graticule, land.
  ctx.fillStyle = r.surface
  ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = r.rule
  ctx.lineWidth = 1.5
  ctx.beginPath(); path(GRATICULE); ctx.stroke()
  ctx.save()
  ctx.globalAlpha = 0.3
  ctx.fillStyle = r.textMuted
  ctx.beginPath(); path(LAND); ctx.fill()
  ctx.restore()
  // Limb shading, so it reads as a sphere.
  ctx.save()
  const shade = ctx.createRadialGradient(CX - R * 0.35, CY - R * 0.4, R * 0.2, CX, CY, R)
  shade.addColorStop(0, 'transparent')
  shade.addColorStop(1, r.bg)
  ctx.globalAlpha = 0.7
  ctx.fillStyle = shade
  ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
  ctx.strokeStyle = r.rule
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.stroke()
}

function dot(ctx: Ctx, p: Place, centre: LonLat, radius: number, color: string, alpha = 1) {
  if (geoDistance(ll(p), centre) > Math.PI / 2) return
  const [x, y] = projection(ll(p)) ?? [CX, CY]
  ctx.save()
  ctx.globalAlpha *= alpha
  ctx.fillStyle = color
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

type JourneyVisual = Extract<Visual, { kind: 'journey' }>

const sine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2
const isHome = (l: Leg) => l.from.lat === l.to.lat && l.from.lon === l.to.lon

/** Seconds for one step: turn the globe, then fly (or pulse, at home). */
export function journeySeconds(v: JourneyVisual) {
  const j = v.journey
  if (v.play) return playSegments(v).reduce((a, s) => a + s.secs, 0)
  if (v.step >= j.legs.length) return 2.2
  return isHome(j.legs[v.step]!) ? 2.4 : 3.4
}

/** Autoplay timeline: one quick segment per leg from `step`, then the totals. */
const PLAY = { flight: 1.8, home: 1.2, totals: 2.6 } as const
function playSegments(v: JourneyVisual) {
  const legs = v.journey.legs
  const segs: { step: number; secs: number }[] = []
  for (let k = v.step; k < legs.length; k++) segs.push({ step: k, secs: isHome(legs[k]!) ? PLAY.home : PLAY.flight })
  segs.push({ step: legs.length, secs: PLAY.totals })
  return segs
}

/** A traveller's face in a ring, cropped to the head per the person's crop circle. */
function face(ctx: Ctx, v: JourneyVisual, name: string, x: number, y: number, rad: number, ring: string, r: Roles) {
  const who = v.journey.people[name]
  const img = who ? image(who.src) : null
  ctx.save()
  ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.closePath()
  ctx.fillStyle = r.card
  ctx.fill()
  if (img && who) {
    ctx.save()
    ctx.clip()
    const w = img.naturalWidth
    const cr = who.r * w
    ctx.drawImage(img, who.x * w - cr, who.y * img.naturalHeight - cr, cr * 2, cr * 2, x - rad, y - rad, rad * 2, rad * 2)
    ctx.restore()
  }
  ctx.lineWidth = Math.max(4, rad * 0.08)
  ctx.strokeStyle = ring
  ctx.stroke()
  ctx.restore()
}

const travellers = (v: JourneyVisual, l: Leg) => l.team ?? [v.journey.solo]

export function paintJourney(ctx: Ctx, v: JourneyVisual, p: number, r: Roles) {
  if (v.play) {
    // Map overall progress to (leg, progress within that leg) and paint that frame.
    const segs = playSegments(v)
    const total = segs.reduce((a, s) => a + s.secs, 0)
    let t = p * total
    for (const [k, s] of segs.entries()) {
      if (t <= s.secs || k === segs.length - 1) {
        // After the first stop the header holds steady; only the stop details swap.
        paintStep(ctx, { ...v, play: false, step: s.step }, Math.min(1, t / s.secs), r, k > 0)
        return
      }
      t -= s.secs
    }
  }
  paintStep(ctx, v, p, r, false)
}

function paintStep(ctx: Ctx, v: JourneyVisual, p: number, r: Roles, steady: boolean) {
  const j = v.journey
  const final = v.step >= j.legs.length
  const leg = final ? undefined : j.legs[v.step]
  // p is linear: turn the globe to this leg, then fly it.
  const T = final ? 0.7 : 0.3
  const turn = sine(window01(p, 0, T))
  const fly = final ? 1 : sine(window01(p, T, 0.96))
  const centre = geoInterpolate(legCentre(v, v.step - 1), legCentre(v, v.step))(turn) as LonLat
  drawGlobe(ctx, r, centre)

  const colour = (l: Leg) => (l.team ? r.tone('neutral') : r.tone('hero'))
  ctx.lineCap = 'round'
  // The trail so far: settled, quieter.
  j.legs.slice(0, Math.min(v.step, j.legs.length)).forEach((l) => {
    if (isHome(l)) return
    ctx.save()
    ctx.globalAlpha = final ? 0.8 : 0.4
    ctx.strokeStyle = colour(l)
    ctx.lineWidth = final ? 5 : 4
    strokeRoute(ctx, route(l, 1, centre))
    ctx.restore()
    dot(ctx, l.to, centre, 7, colour(l), 0.7)
  })
  dot(ctx, j.home, centre, 13, r.text)
  const homeXY = projection(ll(j.home)) ?? [CX, CY]
  const homeVisible = geoDistance(ll(j.home), centre) <= Math.PI / 2

  // This leg: the plane and its crew, or a pulse at home.
  if (leg && fly > 0) {
    if (isHome(leg)) {
      if (homeVisible && fly < 1) {
        ctx.save()
        ctx.globalAlpha = 1 - fly
        ctx.strokeStyle = colour(leg)
        ctx.lineWidth = 6
        ctx.beginPath(); ctx.arc(homeXY[0], homeXY[1], 16 + fly * 80, 0, Math.PI * 2); ctx.stroke()
        ctx.restore()
      }
    } else {
      const pts = route(leg, fly, centre)
      ctx.save()
      ctx.strokeStyle = colour(leg)
      ctx.lineWidth = 8
      ctx.shadowColor = colour(leg)
      ctx.shadowBlur = 26
      strokeRoute(ctx, pts)
      ctx.restore()
      const q0 = pts[pts.length - 2]!
      const q1 = pts[pts.length - 1]!
      if (fly >= 1) dot(ctx, leg.to, centre, 13, colour(leg))
      else if (q1.vis) {
        plane(ctx, q1.x, q1.y, Math.atan2(q1.y - q0.y, q1.x - q0.x), 40, colour(leg), r.bg)
        // Crew rides above the plane.
        const crew = travellers(v, leg)
        const rad = 40
        const gap = 72
        const x0 = q1.x - ((crew.length - 1) * gap) / 2
        ctx.save()
        ctx.globalAlpha = Math.min(1, fly * 8)
        crew.forEach((name, k) => face(ctx, v, name, x0 + k * gap, q1.y - 92, rad, colour(leg), r))
        ctx.restore()
      }
    }
  }
  if (homeVisible) label(ctx, j.home.name, homeXY[0] + 28, homeXY[1] - 20, r.text)

  // Left column.
  const x = SAFE.left
  const colW = CX - R - x - 100
  const head = steady ? 1 : window01(p, 0, 0.2)
  const period = final
    ? `${j.batches[0]!.label.split(' ').pop()} to ${j.batches[j.batches.length - 1]!.label.split(' ').pop()}`
    : j.batches.find((b) => v.step < b.end)?.label ?? ''
  const counter = final ? '' : ` · ${String(v.step + 1).padStart(2, '0')} / ${j.legs.length}`
  label(ctx, period + counter, x, SAFE.top + 40, r.accent, { alpha: head })
  const tsize = TYPE.size.h2 * 0.6
  text(ctx, v.title, x, SAFE.top + 70 + tsize, { size: tsize, weight: TYPE.weight.black, tracking: TYPE.tracking.display, color: r.textSoft, alpha: head })

  if (final) {
    const y = SAFE.top + 300
    j.stats.forEach((st, k) => {
      const sx = x + (k % 2) * 560
      const sy = y + Math.floor(k / 2) * 250
      const a = window01(p, 0.3 + k * 0.08, 0.6 + k * 0.08)
      text(ctx, st.value, sx, sy + 130, { size: 150, weight: TYPE.weight.black, tracking: TYPE.tracking.display, color: r.emphasis, alpha: a })
      label(ctx, st.label, sx, sy + 200, r.textMuted, { alpha: a })
    })
  } else if (leg) {
    // The stop, big: city, date, event, and who went. Exact spacing, measured
    // first, then centred between the title and the wordmark.
    const a = steady ? window01(p, 0, 0.12) : window01(p, 0.05, 0.3)
    const csize = 130
    const clh = csize * TYPE.lineHeight
    const lh = TYPE.size.body * TYPE.bodyLineHeight
    const rad = 56
    const cityLines = wrap(ctx, leg.to.name, colW, csize, TYPE.weight.black)
    const whatLines = wrap(ctx, leg.what, colW, TYPE.size.body, TYPE.weight.medium)
    const G = { date: 96, what: 100, kind: 104, faces: 54, names: 62 }
    const blockH = csize * 0.8 + (cityLines.length - 1) * clh + G.date + G.what + (whatLines.length - 1) * lh
      + G.kind + G.faces + rad * 2 + G.names
    const areaTop = SAFE.top + 200
    const areaBottom = SAFE.bottom - 20
    let y = areaTop + Math.max(0, (areaBottom - areaTop - blockH) / 2) + csize * 0.8
    cityLines.forEach((line, k) => {
      text(ctx, line, x, y, { size: csize, weight: TYPE.weight.black, tracking: TYPE.tracking.display, color: r.text, alpha: a })
      if (k < cityLines.length - 1) y += clh
    })
    y += G.date
    label(ctx, isHome(leg) ? `${leg.when} · at home, no flight` : leg.when, x, y, colour(leg), { alpha: a })
    y += G.what
    whatLines.forEach((line, k) => {
      text(ctx, line, x, y, { size: TYPE.size.body, weight: TYPE.weight.medium, color: r.textSoft, alpha: a })
      if (k < whatLines.length - 1) y += lh
    })
    y += G.kind
    const crew = travellers(v, leg)
    label(ctx, leg.team ? 'Team trip' : 'Solo', x, y, colour(leg), { alpha: a })
    y += G.faces
    // Each face gets a column wide enough for its name in mono caps.
    const pitch = Math.min(240, colW / Math.max(1, crew.length))
    crew.forEach((name, k) => {
      const fx = x + rad + 20 + k * pitch
      const fa = steady ? window01(p, 0.04 + k * 0.03, 0.16 + k * 0.03) : window01(p, 0.12 + k * 0.05, 0.4 + k * 0.05)
      ctx.save()
      ctx.globalAlpha = fa
      face(ctx, v, name, fx, y + rad, rad, colour(leg), r)
      ctx.restore()
      label(ctx, name, fx, y + rad * 2 + G.names, r.textSoft, { alpha: fa, align: 'center' })
    })
  }
  // Legend, top right above the globe.
  for (const [k, [name, tone]] of ([['Solo', 'hero'], ['Team', 'neutral']] as const).entries()) {
    const lx = SAFE.right - 420 + k * 230
    ctx.save(); ctx.globalAlpha = head; ctx.fillStyle = r.tone(tone)
    ctx.fillRect(lx, SAFE.top + 22, 56, 8)
    ctx.restore()
    label(ctx, name, lx + 72, SAFE.top + 40, r.textSoft, { alpha: head })
  }
}
