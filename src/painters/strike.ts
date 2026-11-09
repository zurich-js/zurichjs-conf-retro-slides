import { type Roles, TYPE } from '../brand/tokens'
import type { Visual } from '../engine/types'
import { type Ctx, enter, font, label, SAFE, text, window01, wrap } from './kit'

/**
 * The `strike` painter: one name, and what happened to it.
 *   `to`     a line strikes through the old name, it greys out, and the new
 *            name rises in below it in accent (a rename).
 *   `stamp`  a rubber stamp slams onto the name, in the warn tone (a last
 *            edition, a cancellation).
 * A kicker above and a note below. Centred.
 */

type StrikeVisual = Extract<Visual, { kind: 'strike' }>

export const STRIKE_SECS = 2.2

const ease = (x: number) => 1 - (1 - Math.min(1, Math.max(0, x))) ** 3

export function paintStrike(ctx: Ctx, v: StrikeVisual, p: number, r: Roles) {
  const cx = (SAFE.left + SAFE.right) / 2
  const D = TYPE.tracking.display
  const size = TYPE.size.h1
  // Fit the name to the safe width.
  ctx.save(); ctx.font = font(size, TYPE.weight.black); ctx.letterSpacing = `${D * size}px`
  const raw = ctx.measureText(v.name).width
  ctx.restore()
  const ns = Math.min(size, (size * SAFE.width * 0.92) / raw)
  const nw = (raw * ns) / size
  const ny = v.to ? 640 : 760

  if (v.kicker) label(ctx, v.kicker, cx, SAFE.top + 60, r.accent, { align: 'center', alpha: window01(p, 0, 0.2) })

  // The name: full colour, then muted once struck or stamped.
  const hit = v.to ? window01(p, 0.2, 0.45) : window01(p, 0.42, 0.5)
  ctx.save(); enter(ctx, window01(p, 0, 0.25))
  text(ctx, v.name, cx, ny, { size: ns, weight: TYPE.weight.black, tracking: D, color: hit > 0.5 ? r.textMuted : r.text, align: 'center' })
  ctx.restore()

  if (v.to) {
    // The strike, drawn left to right through the middle of the x-height.
    const sw = nw * ease(hit)
    ctx.save()
    ctx.fillStyle = r.text
    ctx.fillRect(cx - nw / 2, ny - ns * 0.3, sw, Math.max(8, ns * 0.07))
    ctx.restore()
    // The new name rises in below.
    const a = window01(p, 0.5, 0.85)
    ctx.save()
    ctx.font = font(size, TYPE.weight.black); ctx.letterSpacing = `${D * size}px`
    const tw = ctx.measureText(v.to).width
    ctx.restore()
    const ts = Math.min(size, (size * SAFE.width * 0.92) / tw)
    label(ctx, 'Now', cx, ny + 150, r.textMuted, { align: 'center', alpha: a })
    text(ctx, v.to, cx, ny + 150 + ts * 1.05 + (1 - ease(a)) * 40, { size: ts, weight: TYPE.weight.black, tracking: D, color: r.accent, align: 'center', alpha: a })
  }

  if (v.stamp) {
    // Slams in across the lower right of the name: big and faint, then down to size, a little tilted.
    const s = window01(p, 0.4, 0.52)
    if (s > 0) {
      const colour = r.tone('warn')
      const ss = TYPE.size.h2 * 0.8
      const k = 1 + (1 - ease(s)) * 0.9
      ctx.save()
      ctx.translate(cx + nw * 0.2, ny + ns * 0.5)
      ctx.rotate(-0.12)
      ctx.scale(k, k)
      ctx.globalAlpha *= ease(s)
      ctx.font = font(ss, TYPE.weight.black, TYPE.mono)
      ctx.letterSpacing = `${TYPE.tracking.label * ss}px`
      const label = v.stamp.toUpperCase()
      const tw = ctx.measureText(label).width
      const w = tw + 100
      const h = ss * 1.6
      // Ink on a dark backing, so the stamp and the name under it both stay legible.
      ctx.fillStyle = r.bg
      ctx.globalAlpha *= 0.85
      ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 18); ctx.fill()
      ctx.globalAlpha /= 0.85
      ctx.strokeStyle = colour
      ctx.lineWidth = 12
      ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 18); ctx.stroke()
      ctx.lineWidth = 4
      ctx.beginPath(); ctx.roundRect(-w / 2 + 18, -h / 2 + 18, w - 36, h - 36, 10); ctx.stroke()
      ctx.fillStyle = colour
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      // Trailing letter-spacing: start at the left of the measured run so it sits centred.
      ctx.fillText(label, -tw / 2 + (TYPE.tracking.label * ss) / 2, ss * 0.04)
      ctx.restore()
    }
  }

  if (v.note) {
    const y = v.to ? ny + 480 : ny + 400
    const ns = TYPE.size.body
    // Wrapped to the safe area, centred line by line.
    wrap(ctx, v.note, SAFE.width * 0.8, ns, TYPE.weight.bold).forEach((l, i) =>
      text(ctx, l, cx, y + i * ns * TYPE.bodyLineHeight, { size: ns, weight: TYPE.weight.bold, color: r.textSoft, align: 'center', alpha: window01(p, 0.6, 0.95) }))
  }
}
