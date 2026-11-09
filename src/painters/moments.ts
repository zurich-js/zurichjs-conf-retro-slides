import { FRAME, type Roles, TYPE } from '../brand/tokens'
import type { Moment, Visual } from '../engine/types'
import { type Ctx, image, label, SAFE, text, window01 } from './kit'

/**
 * The `moments` painter: the road in pictures. One autoplaying draw-in:
 *
 * 1. Flow: photos arrive one by one from the right onto a conveyor. The
 *    current one is big and straight; earlier ones shrink, tilt and drift
 *    left like a pile of prints. Top left: the month, the city and the event.
 *    Bottom: a timeline of the months, each photo a dot, a playhead on today.
 * 2. Wall: every photo flies from the conveyor into a 10-column wall, a scrim
 *    falls over it, and the totals land on top.
 *
 * `p` is linear (see drawTiming); at 1 it is the wall with the totals.
 */

type MomentsVisual = Extract<Visual, { kind: 'moments' }>

/** Seconds per photo, and for the wall at the end. */
const PACE = { photo: 0.62, wall: 4.2 } as const
export const momentsSeconds = (v: MomentsVisual) => (v.hold ?? 0) + v.moments.length * PACE.photo + PACE.wall

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

const ymd = (iso: string) => iso.split('-').map(Number) as [number, number, number]
/** Months since year 0, with the day as a fraction: a continuous time axis. */
const monthPos = (iso: string) => { const [y, m, d] = ymd(iso); return y * 12 + (m - 1) + (Math.min(d, 30) - 1) / 30 }

const smooth = (x: number) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t) }
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Deterministic small tilt per photo, in radians (−3° … 3°). */
const tilt = (i: number) => ((((i * 37) % 7) - 3) * Math.PI) / 180

// Layout on the frame.
const STAGE = { cx: FRAME.width / 2 + 220, cy: 700, h: 600 }
const AXIS = { y: SAFE.bottom - 120 }
const WALL = { cols: 10, gap: 10 }
const BORDER = 12

interface Rect { x: number; y: number; w: number; h: number; rot: number }

/** Where photo i sits on the conveyor when the conveyor is at c (float index). */
function conveyor(i: number, c: number, aspect: number): Rect & { alpha: number } {
  const d = i - c
  const ad = Math.abs(d)
  const scale = d >= 0 ? 1 : lerp(1, 0.46, Math.min(1, ad))
  const h = STAGE.h * scale
  const w = h * aspect
  // Behind: one big step to the first, then a tight pile. Ahead: comes in from the right.
  const x = d >= 0
    ? STAGE.cx + d * 1500
    : STAGE.cx - (Math.min(ad, 1) * 620 + Math.max(ad - 1, 0) * 95)
  const y = STAGE.cy + (d < 0 ? Math.min(ad, 1) * 80 : 0)
  // The pile keeps the last five; older prints fade before they leave the safe area.
  const alpha = d > 0 ? 1 - Math.min(1, d) : 1 - smooth((ad - 4) / 1.5)
  return { x: x - w / 2, y: y - h / 2, w, h, rot: d < 0 ? tilt(i) * Math.min(1, ad) : 0, alpha }
}

/** Photo i's cell in the wall. */
function wallCell(i: number, n: number): Rect {
  const rows = Math.ceil(n / WALL.cols)
  const w = (SAFE.width - WALL.gap * (WALL.cols - 1)) / WALL.cols
  const h = (SAFE.bottom - SAFE.top - WALL.gap * (rows - 1)) / rows
  const col = i % WALL.cols
  const row = Math.floor(i / WALL.cols)
  return { x: SAFE.left + col * (w + WALL.gap), y: SAFE.top + row * (h + WALL.gap), w, h, rot: 0 }
}

/** A print: a light border round the photo, cropped to fill (cover). */
function print(ctx: Ctx, m: Moment, rect: Rect, r: Roles, border: number, alpha: number) {
  if (alpha <= 0) return
  const img = image(m.src)
  ctx.save()
  ctx.globalAlpha *= alpha
  ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2)
  ctx.rotate(rect.rot)
  const x = -rect.w / 2
  const y = -rect.h / 2
  if (border > 0) {
    ctx.fillStyle = r.text
    ctx.fillRect(x - border, y - border, rect.w + border * 2, rect.h + border * 2)
  }
  ctx.fillStyle = r.card
  ctx.fillRect(x, y, rect.w, rect.h)
  if (img) {
    const ia = img.naturalWidth / img.naturalHeight
    const ra = rect.w / rect.h
    let sw = img.naturalWidth
    let sh = img.naturalHeight
    if (ia > ra) sw = sh * ra
    else sh = sw / ra
    ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, x, y, rect.w, rect.h)
  }
  ctx.restore()
}

const aspectOf = (m: Moment) => {
  const img = image(m.src)
  // Prints keep their orientation, clamped so a panorama or a tall phone shot stays a print.
  const a = img ? img.naturalWidth / img.naturalHeight : 0.75
  return Math.min(1.5, Math.max(0.72, a))
}

export function paintMoments(ctx: Ctx, v: MomentsVisual, p: number, r: Roles) {
  const ms = v.moments
  const n = ms.length
  const total = momentsSeconds(v)
  // Hold first (the camera may still be travelling), then play.
  const t = Math.max(0, p * total - (v.hold ?? 0))
  const flowEnd = n * PACE.photo
  // Conveyor position: photo k glides in (c from k − 1 to k) over the first 70% of its slot, then holds.
  const k = Math.min(n - 1, Math.floor(t / PACE.photo))
  const c = k - 1 + smooth((t - k * PACE.photo) / (PACE.photo * 0.7))
  const wq = smooth((t - flowEnd) / (PACE.wall * 0.55)) // conveyor → wall
  const sq = smooth((t - flowEnd - PACE.wall * 0.45) / (PACE.wall * 0.35)) // scrim + totals
  const cur = ms[Math.round(Math.max(0, c))]!

  // ── Timeline (fades out as the wall forms) ──
  const ta = window01(p, 0, 0.03) * (1 - wq)
  if (ta > 0) {
    const a0 = monthPos(`${v.from}-01`)
    const a1 = monthPos(`${v.to}-01`) + 1
    const X = (pos: number) => SAFE.left + ((pos - a0) / (a1 - a0)) * SAFE.width
    ctx.save()
    ctx.globalAlpha = ta
    ctx.fillStyle = r.rule
    ctx.fillRect(SAFE.left, AXIS.y, SAFE.width, 3)
    for (let mo = Math.ceil(a0); mo < a1; mo++) {
      const yr = Math.floor(mo / 12)
      const mi = mo % 12
      ctx.fillRect(X(mo), AXIS.y - 10, 3, 23)
      // Every other month labelled, plus January with its year.
      if ((mo - Math.ceil(a0)) % 2 === 0 || mi === 0) {
        label(ctx, mi === 0 ? `${SHORT[mi]} ${yr}` : SHORT[mi]!, X(mo) + 10, AXIS.y + 64, r.textMuted, { alpha: 1 })
      }
    }
    // A dot per photo shown so far; the playhead on the current one.
    for (let i = 0; i <= Math.round(c); i++) {
      ctx.fillStyle = r.accent
      ctx.beginPath(); ctx.arc(X(monthPos(ms[i]!.date)), AXIS.y + 1, 9, 0, Math.PI * 2); ctx.fill()
    }
    const fc = Math.max(0, Math.floor(c))
    const hx = X(lerp(monthPos(ms[fc]!.date), monthPos(ms[Math.min(n - 1, fc + 1)]!.date), Math.max(0, c - fc)))
    ctx.fillStyle = r.text
    ctx.beginPath(); ctx.arc(hx, AXIS.y + 1, 18, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }

  // ── Caption: kicker, month, city · event (fades out as the wall forms) ──
  const ca = window01(p, 0, 0.03) * (1 - wq)
  if (ca > 0) {
    const [y, mo] = ymd(cur.date)
    label(ctx, v.kicker, SAFE.left, SAFE.top + 40, r.accent, { alpha: ca })
    text(ctx, `${MONTHS[mo - 1]} ${y}`, SAFE.left, SAFE.top + 40 + TYPE.size.h2 * 1.05, {
      size: TYPE.size.h2, weight: TYPE.weight.black, tracking: TYPE.tracking.display, color: r.text, alpha: ca,
    })
    const where = [cur.place, cur.what].filter(Boolean).join(' · ')
    if (where) {
      text(ctx, where, SAFE.left, SAFE.top + 40 + TYPE.size.h2 * 1.05 + 90, {
        size: TYPE.size.body, weight: TYPE.weight.bold, color: r.textSoft, alpha: ca,
      })
    }
  }

  // ── Prints: conveyor, then the wall. Far ones first, the current one last. ──
  const order = ms.map((_, i) => i).sort((a, b) => Math.abs(b - c) - Math.abs(a - c))
  for (const i of order) {
    const m = ms[i]!
    const from = conveyor(i, c, aspectOf(m))
    if (wq <= 0) {
      if (i > c + 1) continue
      print(ctx, m, from, r, BORDER, from.alpha)
      continue
    }
    // Staggered flight to the wall: earlier photos leave first.
    const q = smooth((wq * 1.6) - (i / n) * 0.6)
    const to = wallCell(i, n)
    const rect: Rect = {
      x: lerp(from.x, to.x, q), y: lerp(from.y, to.y, q),
      w: lerp(from.w, to.w, q), h: lerp(from.h, to.h, q), rot: lerp(from.rot, 0, q),
    }
    print(ctx, m, rect, r, BORDER * (1 - q), lerp(Math.max(from.alpha, 0), 1, q))
  }

  // ── Scrim and totals over the wall ──
  if (sq > 0) {
    ctx.save()
    ctx.globalAlpha = sq * 0.78
    ctx.fillStyle = r.bg
    ctx.fillRect(0, 0, FRAME.width, FRAME.height)
    ctx.restore()
    const cols = v.totals.length
    const w = SAFE.width / cols
    v.totals.forEach((tot, i) => {
      const a = smooth((sq - i * 0.12) / 0.6)
      const x = SAFE.left + w * i + w / 2
      text(ctx, tot.value, x, 760 + (1 - a) * 40, {
        size: TYPE.size.stat * 0.7, weight: TYPE.weight.black, tracking: TYPE.tracking.display, color: r.accent, align: 'center', alpha: a,
      })
      label(ctx, tot.label, x, 860 + (1 - a) * 40, r.text, { align: 'center', alpha: a, size: TYPE.size.label * 1.2 })
    })
  }
}
