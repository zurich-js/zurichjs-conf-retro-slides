import { type Roles, TYPE } from '../brand/tokens'
import type { Visual } from '../engine/types'
import { type Ctx, enter, font, label, SAFE, text, window01, wrap } from './kit'

/**
 * The `floorplan` painter: one room from above, entrance on the left, depth
 * running right. Landmarks (the lift, the tables) are muted outlines; booths
 * are tone squares whose names sit outside the room on leader lines (left-side
 * booths above, right-side below), spread so they never collide.
 *
 * `focus` starts the draw-in zoomed in on one booth and pulls back to the
 * whole room. `flows` are illustrative walking routes: dots travel along
 * them, then each settles as a dashed arrow. `p` is linear (see drawTiming);
 * at 1 the plan is still and complete.
 */

type PlanVisual = Extract<Visual, { kind: 'floorplan' }>

export const FLOORPLAN_SECS = (v: PlanVisual) => (v.flows?.length ? 7 : v.focus !== undefined ? 4.5 : 2)

const ease = (t: number) => 1 - Math.pow(1 - t, 3)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Width of a mono label as `label` draws it. */
function labelWidth(ctx: Ctx, value: string, size: number) {
  ctx.save()
  ctx.font = font(size, TYPE.weight.medium, TYPE.mono)
  ctx.letterSpacing = `${TYPE.tracking.label * size}px`
  const w = ctx.measureText(value.toUpperCase()).width
  ctx.restore()
  return w
}

/** Spread label centres apart (min gap between edges), inside [lo, hi]. */
function spread(items: { x: number; w: number }[], lo: number, hi: number, gap: number) {
  items.sort((a, b) => a.x - b.x)
  for (let k = 1; k < items.length; k++) {
    const need = items[k - 1]!.x + items[k - 1]!.w / 2 + gap + items[k]!.w / 2
    if (items[k]!.x < need) items[k]!.x = need
  }
  const last = items[items.length - 1]
  if (last && last.x + last.w / 2 > hi) {
    let over = last.x + last.w / 2 - hi
    for (let k = items.length - 1; k >= 0 && over > 0; k--) {
      items[k]!.x -= over
      const prev = items[k - 1]
      over = prev ? Math.max(0, prev.x + prev.w / 2 + gap - (items[k]!.x - items[k]!.w / 2)) : 0
    }
  }
  const first = items[0]
  if (first && first.x - first.w / 2 < lo) { const d = lo - (first.x - first.w / 2); items.forEach((it) => { it.x += d }) }
}

export function paintFloorplan(ctx: Ctx, v: PlanVisual, p: number, r: Roles) {
  const D = TYPE.tracking.display
  const tsize = TYPE.size.h2 * 0.75
  const L = TYPE.size.label
  let y = SAFE.top + 40
  ctx.save(); enter(ctx, window01(p, 0, 0.12))
  if (v.kicker) { label(ctx, v.kicker, SAFE.left, y, r.accent); y += 60 }
  const titleLines = wrap(ctx, v.title, SAFE.width, tsize, TYPE.weight.black)
  titleLines.forEach((l, i) => text(ctx, l, SAFE.left, y + tsize * 0.8 + i * tsize * TYPE.lineHeight, { size: tsize, weight: TYPE.weight.black, tracking: D, color: r.text }))
  y += tsize * TYPE.lineHeight * titleLines.length
  ctx.restore()

  // The room: as large as fits between the label rows, entrance label to its left.
  const topRow = y + 62
  const roomTop = topRow + 42
  const roomBottom = SAFE.bottom - 92
  const entranceW = labelWidth(ctx, v.entrance, L) + 110
  const s = Math.min((SAFE.width - entranceW) / v.depth, (roomBottom - roomTop) / v.width)
  const roomW = v.depth * s
  const roomH = v.width * s
  const ox = SAFE.left + entranceW + (SAFE.width - entranceW - roomW) / 2
  const oy = roomTop + (roomBottom - roomTop - roomH) / 2
  const N = (x: number, z: number): [number, number] => [ox + z * s, oy + (x + v.width / 2) * s]

  // Zoom: from k× on the focus booth, back to the whole room.
  const focus = v.focus !== undefined ? v.booths[v.focus] : undefined
  const u = focus ? ease(window01(p, 0.12, 0.62)) : 1
  const k = Math.pow(3, 1 - u)
  const [fx, fy] = focus ? N(focus.x, focus.z) : [0, 0]
  const ax = lerp(ox + roomW / 2, fx, u)
  const ay = lerp(oy + roomH / 2, fy, u)
  const M = (x: number, z: number): [number, number] => {
    if (!focus) return N(x, z)
    const [nx, ny] = N(x, z)
    return [ax + k * (nx - fx), ay + k * (ny - fy)]
  }
  const sk = s * k
  const settled = window01(p, 0.55, 0.75)
  // A flow slide continues the plan before it: the room, booths and names are already there.
  const cont = Boolean(v.flows)

  // Clip the zoomed plan to the room's final box (plus margin) so it never spills into the title.
  ctx.save()
  ctx.beginPath(); ctx.rect(SAFE.left, roomTop - 20, SAFE.width, roomBottom - roomTop + 40); ctx.clip()
  const plan = cont ? 1 : window01(p, 0, 0.12)
  ctx.globalAlpha *= plan

  // Room outline.
  const [rx, ry] = M(-v.width / 2, 0)
  ctx.fillStyle = r.card
  ctx.beginPath(); ctx.roundRect(rx, ry, v.depth * sk, v.width * sk, 18); ctx.fill()
  ctx.strokeStyle = r.rule; ctx.lineWidth = 4; ctx.stroke()

  // Landmarks: muted outlines with their name inside.
  for (const lm of v.landmarks) {
    const [lx, ly] = M(lm.x - lm.w / 2, lm.z - lm.d / 2)
    ctx.save()
    ctx.strokeStyle = r.textMuted; ctx.lineWidth = 3; ctx.setLineDash([14, 12])
    ctx.beginPath(); ctx.roundRect(lx, ly, lm.d * sk, lm.w * sk, 14); ctx.stroke()
    ctx.restore()
    const [cx, cy] = M(lm.x, lm.z)
    const ls = Math.min(L, (lm.d * sk - 30) / Math.max(1, labelWidth(ctx, lm.label, L) / L))
    if (ls >= L * 0.6) label(ctx, lm.label, cx, cy + ls * 0.36, r.textMuted, { align: 'center', size: ls, alpha: cont ? 1 : settled })
  }

  // Booths: tone squares.
  const B = 2.1
  v.booths.forEach((b, i) => {
    const [bx, by] = M(b.x, b.z)
    const isFocus = i === v.focus
    const a = isFocus || cont ? 1 : window01(p, 0.3 + i * 0.04, 0.5 + i * 0.04)
    ctx.save()
    ctx.globalAlpha *= a
    ctx.fillStyle = r.tone(b.tone ?? 'neutral')
    ctx.beginPath(); ctx.roundRect(bx - (B * sk) / 2, by - (B * sk) / 2, B * sk, B * sk, 10); ctx.fill()
    ctx.restore()
  })

  // Flows: dots walking the routes, then dashed arrows once they settle.
  if (v.flows) {
    const walk = window01(p, 0.08, 0.86)
    const rest = window01(p, 0.72, 0.95)
    v.flows.forEach((route, fi) => {
      const pts = route.map(([x, z]) => M(x, z))
      const segs: number[] = []
      let total = 0
      for (let j = 1; j < pts.length; j++) { const d = Math.hypot(pts[j]![0] - pts[j - 1]![0], pts[j]![1] - pts[j - 1]![1]); segs.push(d); total += d }
      const at = (t: number): [number, number] => {
        let d = t * total
        for (let j = 0; j < segs.length; j++) {
          if (d <= segs[j]! || j === segs.length - 1) {
            const f = segs[j]! ? Math.min(1, d / segs[j]!) : 0
            return [lerp(pts[j]![0], pts[j + 1]![0], f), lerp(pts[j]![1], pts[j + 1]![1], f)]
          }
          d -= segs[j]!
        }
        return pts[pts.length - 1]!
      }
      // The route, faint while people walk it, then a dashed arrow.
      ctx.save()
      ctx.strokeStyle = r.accent
      ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
      ctx.setLineDash([4, 22])
      ctx.globalAlpha *= 0.25 + 0.6 * rest
      ctx.beginPath(); pts.forEach(([x, z], j) => (j ? ctx.lineTo(x, z) : ctx.moveTo(x, z))); ctx.stroke()
      ctx.restore()
      // Dots: evenly spaced, each looping along the route at a pace set by its length.
      const dots = 5
      const fade = 1 - rest
      if (fade > 0) {
        for (let j = 0; j < dots; j++) {
          const t = (walk * (2.4 + (fi % 3) * 0.4) + j / dots) % 1
          const [dx, dy] = at(t)
          const edge = Math.min(1, t * 8, (1 - t) * 8)
          ctx.save()
          ctx.globalAlpha *= fade * edge * window01(p, 0.05 + fi * 0.03, 0.15 + fi * 0.03)
          ctx.fillStyle = r.accent
          ctx.beginPath(); ctx.arc(dx, dy, 13, 0, Math.PI * 2); ctx.fill()
          ctx.restore()
        }
      }
      // Arrowhead at the end of the route.
      if (rest > 0 && pts.length > 1) {
        const [ex, ey] = pts[pts.length - 1]!
        const [px, py] = pts[pts.length - 2]!
        const ang = Math.atan2(ey - py, ex - px)
        ctx.save()
        ctx.globalAlpha *= rest
        ctx.translate(ex, ey); ctx.rotate(ang)
        ctx.fillStyle = r.accent
        ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-30, -20); ctx.lineTo(-30, 20); ctx.closePath(); ctx.fill()
        ctx.restore()
      }
    })
  }
  ctx.restore()

  // Entrance: an arrow into the room's left edge, its name beside it.
  const ea = cont ? 1 : Math.max(settled, focus ? 0 : window01(p, 0, 0.2))
  const [ex0, ey0] = N(0, 0)
  ctx.save()
  ctx.globalAlpha *= ea
  ctx.fillStyle = r.textSoft
  ctx.beginPath(); ctx.moveTo(ex0 - 8, ey0); ctx.lineTo(ex0 - 50, ey0 - 26); ctx.lineTo(ex0 - 50, ey0 + 26); ctx.closePath(); ctx.fill()
  ctx.restore()
  label(ctx, v.entrance, ex0 - 74, ey0 + L * 0.36, r.textSoft, { align: 'right', alpha: ea })

  // Booth names: the focus booth's beside it while zoomed, then all of them on leader lines.
  if (focus && settled < 1) {
    const [bx, by] = M(focus.x, focus.z)
    label(ctx, focus.label, bx + (B * sk) / 2 + 30, by + L * 0.36, r.text, { alpha: 1 - settled, size: L * 1.2 })
  }
  const la = focus ? settled : cont ? 1 : window01(p, 0.2, 0.45)
  for (const side of [-1, 1] as const) {
    const items = v.booths
      .map((b, i) => ({ b, i, x: N(b.x, b.z)[0], w: labelWidth(ctx, b.label, L) }))
      .filter(({ b }) => (side < 0 ? b.x <= 0 : b.x > 0))
    spread(items, SAFE.left, SAFE.right, 50)
    const ly = side < 0 ? topRow : roomBottom + 68
    for (const it of items) {
      const [bx, by] = N(it.b.x, it.b.z)
      ctx.save()
      ctx.globalAlpha *= la
      ctx.strokeStyle = r.textMuted; ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(bx, by + side * (B * s) / 2)
      ctx.lineTo(bx, side < 0 ? ly + 18 : ly - L - 6)
      ctx.lineTo(it.x, side < 0 ? ly + 18 : ly - L - 6)
      ctx.stroke()
      ctx.restore()
      label(ctx, it.b.label, it.x, ly, it.i === v.focus ? r.accent : r.text, { align: 'center', alpha: la })
    }
  }

  // The note sits top right, on the kicker's line, clear of the label rows.
  if (v.note) label(ctx, v.note, SAFE.right, SAFE.top + 40, r.textMuted, { align: 'right', alpha: window01(p, 0, 0.12) })
}
