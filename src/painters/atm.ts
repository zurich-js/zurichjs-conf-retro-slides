import { type Roles, TYPE } from '../brand/tokens'
import type { Visual } from '../engine/types'
import { type Ctx, enter, label, SAFE, text, window01, wrap } from './kit'

/**
 * The `atm` painter: one screen of a cash machine. A kicker, the prompt, up
 * to four options laid out like ATM soft keys (two left, two right, each with
 * a notch pointing at its key on the bezel), an optional message, a note.
 * The chosen options light up late in the draw-in, as if their key was just
 * pressed. The machine itself (card in, cash out) is in the set: the slide's
 * `step` drives it.
 */

type AtmVisual = Extract<Visual, { kind: 'atm' }>

export const ATM_SECS = 2.2

export function paintAtm(ctx: Ctx, v: AtmVisual, p: number, r: Roles) {
  const D = TYPE.tracking.display
  let y = SAFE.top + 30

  // Kicker and prompt.
  ctx.save(); enter(ctx, window01(p, 0, 0.3))
  if (v.kicker) { label(ctx, v.kicker, SAFE.left, y + 20, r.accent); y += 70 }
  const size = TYPE.size.h1 * 0.78
  const lines = wrap(ctx, v.title, SAFE.width, size, TYPE.weight.black)
  lines.forEach((l, i) => text(ctx, l, SAFE.left, y + size * 0.85 + i * size * TYPE.lineHeight, { size, weight: TYPE.weight.black, tracking: D, color: r.text }))
  y += size * TYPE.lineHeight * lines.length + 50
  ctx.restore()

  // Options as soft keys: 0 and 2 on the left, 1 and 3 on the right.
  const opts = v.options ?? []
  const chosen = new Set(v.selected ?? [])
  const press = window01(p, 0.62, 0.78)
  const gap = 60
  const colW = (SAFE.width - gap) / 2
  const rowH = 170
  const rowGap = 34
  opts.forEach((o, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = SAFE.left + col * (colW + gap)
    const oy = y + row * (rowH + rowGap)
    const a = window01(p, 0.18 + i * 0.07, 0.42 + i * 0.07)
    const on = chosen.has(i) && press > 0
    ctx.save()
    ctx.globalAlpha *= a
    ctx.fillStyle = on ? (v.selectedTone ? r.tone(v.selectedTone) : r.accent) : r.card
    ctx.beginPath(); ctx.roundRect(x, oy, colW, rowH, 28); ctx.fill()
    ctx.restore()
    const ink = on ? (v.selectedTone === 'bad' || v.selectedTone === 'neutral' ? r.text : r.bg) : r.text
    const ls = TYPE.size.body * 1.1
    text(ctx, o.label, x + 48, oy + rowH / 2 + ls * 0.36, { size: ls, weight: TYPE.weight.bold, color: ink, alpha: a })
    if (o.value) {
      text(ctx, o.value, x + colW - 48, oy + rowH / 2 + ls * 0.36, { size: ls, weight: TYPE.weight.black, family: TYPE.mono, color: on ? r.bg : r.accent, align: 'right', alpha: a })
    }
  })
  if (opts.length) y += Math.ceil(opts.length / 2) * (rowH + rowGap) + 20

  // Message: a big line under the options (or alone), in its tone.
  if (v.message) {
    const ma = window01(p, 0.45, 0.75)
    const ms = opts.length ? TYPE.size.h2 * 0.8 : TYPE.size.h1 * 0.9
    const ml = wrap(ctx, v.message, SAFE.width, ms, TYPE.weight.black)
    const colour = v.tone ? r.tone(v.tone) : r.accent
    ml.forEach((l, i) => text(ctx, l, SAFE.left, y + ms * 0.9 + i * ms * TYPE.lineHeight, {
      size: ms, weight: TYPE.weight.black, tracking: D, color: colour, alpha: ma,
    }))
    y += ms * TYPE.lineHeight * ml.length + 30
    if (v.detail) {
      const ds = TYPE.size.body * 1.1
      wrap(ctx, v.detail, SAFE.width, ds, TYPE.weight.bold).forEach((l, i) => text(ctx, l, SAFE.left, y + ds + i * ds * TYPE.bodyLineHeight, {
        size: ds, weight: TYPE.weight.bold, color: r.textSoft, alpha: window01(p, 0.6, 0.9),
      }))
    }
  }

  // Note: bottom right, clear of the wordmark.
  if (v.note) label(ctx, v.note, SAFE.right, SAFE.bottom - 10, r.textMuted, { align: 'right', alpha: window01(p, 0.6, 1) })
}
