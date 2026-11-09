import { type Roles, TYPE } from '../brand/tokens'
import type { Visual } from '../engine/types'
import { type Ctx, enter, label, SAFE, text, window01, wrap } from './kit'

/**
 * The `badgetest` painter: the caption for one step of the badge-hole test
 * on the check-in counter (the test itself plays in the set: its `rig`
 * drives the stand). A kicker, a big line, a note. Left-aligned, upper half,
 * so it reads on the projection above the counter.
 */

type BadgeTestVisual = Extract<Visual, { kind: 'badgetest' }>

export function paintBadgeTest(ctx: Ctx, v: BadgeTestVisual, p: number, r: Roles) {
  let y = SAFE.top + 60
  ctx.save(); enter(ctx, window01(p, 0, 0.5))
  if (v.kicker) { label(ctx, v.kicker, SAFE.left, y, r.accent); y += 60 }
  const size = TYPE.size.h1
  const lines = wrap(ctx, v.title, SAFE.width, size, TYPE.weight.black)
  lines.forEach((l, i) => text(ctx, l, SAFE.left, y + size * 0.85 + i * size * TYPE.lineHeight, {
    size, weight: TYPE.weight.black, tracking: TYPE.tracking.display, color: r.text,
  }))
  y += size * TYPE.lineHeight * lines.length + 30
  ctx.restore()
  if (v.note) {
    const ns = TYPE.size.body
    wrap(ctx, v.note, SAFE.width * 0.8, ns, TYPE.weight.medium).forEach((l, i) =>
      text(ctx, l, SAFE.left, y + ns + i * ns * TYPE.bodyLineHeight, { size: ns, weight: TYPE.weight.medium, color: r.textSoft, alpha: window01(p, 0.35, 0.9) }))
  }
}
