import { type Roles, TYPE } from '../brand/tokens'
import type { Visual } from '../engine/types'
import { type Ctx, enter, font, label, SAFE, text, window01, wrap } from './kit'

/**
 * The `questions` painter: an inbox filling up. A kicker and a title, then
 * one card per incoming request, subject line only (never a sender). The
 * first card lands alone and holds for a beat; the rest arrive faster and
 * faster, each sliding in from the right with an unread dot, until the
 * screen is a pile of small asks. Deterministic: a card's slight tilt comes
 * from its index. `p` is linear (see drawTiming); at 1 every card has landed.
 */

type QuestionsVisual = Extract<Visual, { kind: 'questions' }>

export const QUESTIONS_SECS = 7

const noise = (n: number) => { const x = Math.sin(n * 57.3 + 7.1) * 43758.5453; return x - Math.floor(x) }

/** When card i lands (share of the draw-in): one alone, then an accelerating stream. */
function landing(i: number, n: number) {
  if (i === 0) return 0.14
  const k = (i - 1) / Math.max(1, n - 2)
  return 0.34 + 0.5 * Math.pow(k, 0.75)
}

export function paintQuestions(ctx: Ctx, v: QuestionsVisual, p: number, r: Roles) {
  const D = TYPE.tracking.display
  const tsize = TYPE.size.h2 * 0.75
  let y = SAFE.top + 40
  ctx.save(); enter(ctx, window01(p, 0, 0.1))
  if (v.kicker) { label(ctx, v.kicker, SAFE.left, y, r.accent); y += 60 }
  const titleLines = wrap(ctx, v.title, SAFE.width, tsize, TYPE.weight.black)
  titleLines.forEach((l, i) => text(ctx, l, SAFE.left, y + tsize * 0.8 + i * tsize * TYPE.lineHeight, { size: tsize, weight: TYPE.weight.black, tracking: D, color: r.text }))
  y += tsize * TYPE.lineHeight * titleLines.length + 50
  ctx.restore()

  // Two staggered columns of cards, filling the space down to the wordmark.
  const n = v.messages.length
  const rows = Math.ceil(n / 2)
  const gap = 50
  const shift = 60
  const colW = (SAFE.width - gap - shift) / 2
  const pitch = Math.min(220, (SAFE.bottom - 70 - y) / rows)
  const cardH = pitch * 0.8
  // One text size for every card: the largest at which the longest subject fits.
  const room = colW - 140
  ctx.save()
  ctx.font = font(TYPE.size.body, TYPE.weight.bold)
  const widest = Math.max(...v.messages.map((m) => ctx.measureText(m).width))
  ctx.restore()
  const size = Math.min(TYPE.size.body, cardH * 0.4, (TYPE.size.body * room) / widest)

  v.messages.forEach((m, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = SAFE.left + col * (colW + gap) + (row % 2) * shift
    const cy = y + row * pitch + (col ? pitch * 0.35 : 0)
    const t = landing(i, n)
    const a = window01(p, t - 0.06, t)
    if (a <= 0) return
    const e = 1 - Math.pow(1 - a, 3)
    const tilt = (noise(i) - 0.5) * 0.035
    ctx.save()
    ctx.globalAlpha *= a
    ctx.translate(x + colW / 2 + (1 - e) * 420, cy + cardH / 2)
    ctx.rotate(tilt * e)
    // The card.
    ctx.fillStyle = r.card
    ctx.beginPath(); ctx.roundRect(-colW / 2, -cardH / 2, colW, cardH, 26); ctx.fill()
    ctx.strokeStyle = r.rule
    ctx.lineWidth = 3
    ctx.stroke()
    // Unread dot, fading to read once the next card lands.
    const read = i < n - 1 ? window01(p, landing(i + 1, n), landing(i + 1, n) + 0.08) : 0
    ctx.fillStyle = r.accent
    ctx.globalAlpha *= 1 - read * 0.65
    ctx.beginPath(); ctx.arc(-colW / 2 + 56, 0, 16, 0, Math.PI * 2); ctx.fill()
    ctx.restore()

    // The subject line.
    const s = size
    ctx.save()
    ctx.globalAlpha *= a
    ctx.translate(x + colW / 2 + (1 - e) * 420, cy + cardH / 2)
    ctx.rotate(tilt * e)
    text(ctx, m, -colW / 2 + 100, s * 0.36, { size: s, weight: TYPE.weight.bold, color: r.text })
    ctx.restore()
  })

  if (v.note) label(ctx, v.note, SAFE.right, SAFE.bottom - 10, r.textMuted, { align: 'right', alpha: window01(p, 0.9, 1) })
}
