import { type Roles, TYPE } from '../brand/tokens'
import type { Visual } from '../engine/types'
import { type Ctx, enter, font, label, SAFE, text, window01, wrap } from './kit'

/**
 * The `diff` painter: a pull request's change to one file, as a code review
 * shows it. It plays in four beats:
 *   1. the file as it was: plain, nothing marked;
 *   2. the `hidden` line scrolls right: a run of whitespace counts up past
 *      the edge of the view;
 *   3. the code behind it appears, drawn as redacted blocks (never as text:
 *      the deck does not carry the payload);
 *   4. the diff marks land: removed lines red, the added line green, and the
 *      note underneath.
 * Linear progress; each beat eases its own window.
 */

type DiffVisual = Extract<Visual, { kind: 'diff' }>

export const DIFF_SECS = 6

const ease = (x: number) => 1 - (1 - Math.min(1, Math.max(0, x))) ** 3
const fmt = (n: number) => Math.round(n).toLocaleString('en-US')

export function paintDiff(ctx: Ctx, v: DiffVisual, p: number, r: Roles) {
  const D = TYPE.tracking.display
  const tsize = TYPE.size.h2 * 0.75
  const bad = r.tone('bad')
  const good = r.tone('good')

  // Kicker and title.
  let y = SAFE.top + 40
  ctx.save(); enter(ctx, window01(p, 0, 0.08))
  if (v.kicker) { label(ctx, v.kicker, SAFE.left, y, r.accent); y += 60 }
  text(ctx, v.title, SAFE.left, y + tsize * 0.8, { size: tsize, weight: TYPE.weight.black, tracking: D, color: r.text })
  ctx.restore()
  y += tsize + 50

  // The review panel: PR header, then the file.
  const size = TYPE.size.code
  const lh = size * 1.32
  const head = 150
  const panel = { l: SAFE.left, r: SAFE.right, t: y, h: head + v.lines.length * lh + 40 }
  const a0 = window01(p, 0.02, 0.12)
  ctx.save(); enter(ctx, a0)
  ctx.fillStyle = r.surface
  ctx.beginPath(); ctx.roundRect(panel.l, panel.t, panel.r - panel.l, panel.h, 28); ctx.fill()
  ctx.fillStyle = r.rule
  ctx.fillRect(panel.l, panel.t + head - 2, panel.r - panel.l, 2)
  text(ctx, v.summary, panel.l + 50, panel.t + 72, { size: TYPE.size.body * 0.85, weight: TYPE.weight.bold, color: r.text })
  label(ctx, `PR ${v.pr}`, panel.r - 50, panel.t + 72, r.accent, { align: 'right' })
  label(ctx, v.file, panel.l + 50, panel.t + 124, r.textMuted, { size: TYPE.size.label * 0.8 })
  ctx.restore()

  // Beat 4: the diff marks.
  const marks = ease(window01(p, 0.74, 0.86))
  const gutter = panel.l + 50
  const codeX = panel.l + 120
  const right = panel.r - 50
  v.lines.forEach((line, i) => {
    const top = panel.t + head + 20 + i * lh
    const base = top + lh * 0.72
    // The added line only exists once the diff lands.
    const alpha = line.op === '+' ? marks : window01(p, 0.04 + i * 0.012, 0.14 + i * 0.012)
    if (alpha <= 0) return
    if (line.op !== ' ' && marks > 0) {
      ctx.save()
      ctx.globalAlpha *= 0.16 * marks
      ctx.fillStyle = line.op === '-' ? bad : good
      ctx.fillRect(panel.l, top, panel.r - panel.l, lh)
      ctx.restore()
      text(ctx, line.op === '-' ? '−' : '+', gutter, base, { size, family: TYPE.mono, color: line.op === '-' ? bad : good, alpha: marks })
    }
    text(ctx, line.text, codeX, base, { size, family: TYPE.mono, color: r.textSoft, alpha })
    if (line.hidden) paintHidden(ctx, line.hidden, line.text, codeX, right, top, base, lh, size, p, r, bad)
  })

  // The note: what the hidden code did.
  if (v.note) {
    const ns = TYPE.size.body * 0.85
    const ny = panel.t + panel.h + 90
    wrap(ctx, v.note, SAFE.width, ns, TYPE.weight.bold).slice(0, 1).forEach((l) =>
      text(ctx, l, SAFE.left, ny, { size: ns, weight: TYPE.weight.bold, color: r.text, alpha: window01(p, 0.84, 0.96) }))
  }
}

/** Beats 2 and 3: whitespace scrolling past, then the redacted code. */
function paintHidden(
  ctx: Ctx, h: { spaces: number; chars: number }, lead: string,
  codeX: number, right: number, top: number, base: number, lh: number, size: number,
  p: number, r: Roles, bad: string,
) {
  ctx.save()
  ctx.font = font(size, TYPE.weight.regular, TYPE.mono)
  const x0 = codeX + ctx.measureText(lead).width + 30
  ctx.restore()
  const scroll = window01(p, 0.2, 0.52)
  const code = ease(window01(p, 0.52, 0.7))
  if (scroll <= 0) return
  // Where the code starts once revealed: whitespace fills the rest.
  const split = x0 + (right - x0) * 0.42
  const dotsEnd = code > 0 ? split : right
  const step = 30
  // While scrolling, the dots slide left as if the view were moving along the line.
  const shift = code > 0 ? 0 : (scroll * h.spaces * 4) % step
  ctx.save()
  ctx.fillStyle = r.textMuted
  ctx.globalAlpha *= Math.min(1, scroll * 6) * 0.7
  for (let x = x0 + step - shift; x < dotsEnd - 6; x += step) {
    ctx.beginPath(); ctx.arc(x, base - size * 0.3, 4, 0, Math.PI * 2); ctx.fill()
  }
  ctx.restore()

  // The code itself, as blocks of deterministic widths: shape, never content.
  if (code > 0) {
    const bh = size * 0.62
    let x = split
    let i = 0
    ctx.save()
    ctx.fillStyle = bad
    while (x < right) {
      const w = Math.min(right - x, 22 + ((i * 37 + 11) % 7) * 16)
      const a = Math.min(1, Math.max(0, code * 1.6 - ((x - split) / (right - split)) * 0.6))
      ctx.globalAlpha = 0.9 * a
      ctx.beginPath(); ctx.roundRect(x, base - size * 0.3 - bh / 2, w, bh, 8); ctx.fill()
      x += w + 14
      i++
    }
    ctx.restore()
  }

  // The tag in the row above: counting spaces, then naming what follows.
  const count = Math.min(h.spaces, Math.round(h.spaces * Math.min(1, scroll / 0.85)))
  const tag = code > 0
    ? `${fmt(h.spaces)} spaces, then ${fmt(h.chars)} characters of obfuscated code`
    : `→ ${fmt(count)} spaces`
  const ty = top - lh * 0.28
  ctx.save()
  ctx.font = font(TYPE.size.label, TYPE.weight.medium, TYPE.mono)
  ctx.letterSpacing = `${TYPE.tracking.label * TYPE.size.label}px`
  const tw = ctx.measureText(tag.toUpperCase()).width
  ctx.restore()
  const tx = Math.max(codeX, right - tw - 40)
  ctx.save()
  ctx.globalAlpha *= Math.min(1, scroll * 6)
  ctx.fillStyle = r.bg
  ctx.beginPath(); ctx.roundRect(tx - 20, ty - 52, tw + 40, 70, 14); ctx.fill()
  ctx.restore()
  label(ctx, tag, tx, ty, code > 0 ? bad : r.textSoft, { alpha: Math.min(1, scroll * 6) })
}
