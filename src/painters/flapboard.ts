import { type Roles, TYPE } from '../brand/tokens'
import type { Visual } from '../engine/types'
import { type Ctx, enter, font, label, SAFE, text, window01 } from './kit'

/**
 * The `flapboard` painter: an airport split-flap departures board. A yellow
 * title with a plane glyph, yellow column headings, then rows of characters,
 * each on its own flap. On entry every flap spins through letters and lands,
 * row by row, left to right. `p` is linear (see drawTiming); at 1 all landed.
 *
 * Cell colour: a highlighted row is accent; YES is the good tone; NO and the
 * dash are muted; everything else is text.
 */

type FlapVisual = Extract<Visual, { kind: 'flapboard' }>

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
/** Seconds for the whole board to land, by number of rows. */
export const flapSeconds = (v: FlapVisual) => 1.4 + v.rows.length * 0.18 + 0.8

/** Largest mono label size (≤ max) at which `value` fits `width`. */
function fitLabel(ctx: Ctx, value: string, width: number, max: number) {
  ctx.save()
  ctx.font = font(max, TYPE.weight.medium, TYPE.mono)
  ctx.letterSpacing = `${TYPE.tracking.label * max}px`
  const w = ctx.measureText(value.toUpperCase()).width
  ctx.restore()
  return w > width ? (max * width) / w : max
}

/** Deterministic 0..1 noise. */
const noise = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) }

/**
 * A plane seen from above, nose up-right, centred on (x, y), `s` across.
 * Outline on a 24-unit grid (the common "flight" icon shape): fuselage,
 * swept wings, tailplane.
 */
const PLANE = new Path2D('M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z')
function plane(ctx: Ctx, x: number, y: number, s: number, color: string, alpha: number) {
  ctx.save()
  ctx.globalAlpha *= alpha
  ctx.translate(x, y)
  ctx.rotate(Math.PI / 4)
  ctx.scale(s / 24, s / 24)
  ctx.translate(-11.5, -12)
  ctx.fillStyle = color
  ctx.fill(PLANE)
  ctx.restore()
}

export function paintFlapboard(ctx: Ctx, v: FlapVisual, p: number, r: Roles) {
  const D = TYPE.tracking.display
  const tsize = TYPE.size.h2 * 0.78
  let y = SAFE.top + 20

  // ── Title: plane glyph + title in accent, source under it ──
  const ta = window01(p, 0, 0.12)
  ctx.save(); enter(ctx, ta)
  plane(ctx, SAFE.left + tsize * 0.45, y + tsize * 0.5, tsize * 0.95, r.accent, 1)
  text(ctx, v.title, SAFE.left + tsize * 1.1, y + tsize * 0.82, { size: tsize, weight: TYPE.weight.black, tracking: D, color: r.accent })
  ctx.restore()
  y += tsize + 30
  if (v.source) { label(ctx, v.source, SAFE.left, y + 30, r.textMuted, { alpha: ta, size: fitLabel(ctx, v.source, SAFE.width, TYPE.size.label) }); y += 60 }

  // ── Grid: columns in cells, one cell gap between columns ──
  const cols = v.columns
  const totalCells = cols.reduce((a, c) => a + c.width, 0) + (cols.length - 1)
  const headH = cols.some((c) => c.label) ? 90 : 20
  const avail = SAFE.bottom - 40 - (y + headH)
  // Cell pitch: fill the width, but rows must fit; tiles are 1.45× as tall as wide.
  const TALL = 1.6
  const pitchW = Math.min(SAFE.width / totalCells, avail / v.rows.length / TALL / 1.1 / 0.92)
  const tileW = pitchW * 0.92
  const tileH = tileW * TALL
  const rowPitch = tileH * 1.1
  const fontSize = tileH * 0.74
  const startX = SAFE.left
  const colX: number[] = []
  let cx = startX
  for (const c of cols) { colX.push(cx); cx += (c.width + 1) * pitchW }

  // Column headings in accent mono.
  if (headH > 20) {
    cols.forEach((c, i) => {
      if (c.label) label(ctx, c.label, colX[i]!, y + 50, r.accent, { alpha: ta, size: fitLabel(ctx, c.label, (c.width + 0.6) * pitchW, TYPE.size.label) })
    })
  }
  const gy = y + headH

  v.rows.forEach((row, ri) => {
    const ry = gy + ri * rowPitch
    let gi = 0 // global char index along the row, for the left-to-right sweep
    cols.forEach((c, ci) => {
      const raw = (row.cells[ci] ?? '').toUpperCase()
      // Right-align numbers when the column asks for it.
      const padded = c.align === 'right' ? raw.padStart(c.width).slice(-c.width) : raw.padEnd(c.width).slice(0, c.width)
      const tone = row.highlight ? r.accent
        : raw === 'YES' ? r.tone('good')
          : raw === 'NO' || raw === '-' || raw === '—' ? r.textMuted
            : r.text
      for (let k = 0; k < c.width; k++, gi++) {
        const ch = padded[k]!
        const x = colX[ci]! + k * pitchW
        // Each flap lands at its own time: rows in turn, left to right, with a little jitter.
        const land = 0.12 + (ri / Math.max(1, v.rows.length)) * 0.55 + (gi / 60) * 0.18 + noise(ri * 131 + gi) * 0.06
        const start = land - 0.16
        const tile = window01(p, 0.02 + ri * 0.02, 0.1 + ri * 0.02)
        // The tile.
        ctx.save()
        ctx.globalAlpha *= tile
        ctx.fillStyle = r.card
        ctx.beginPath(); ctx.roundRect(x, ry, tileW, tileH, tileW * 0.12); ctx.fill()
        ctx.restore()
        // The split across the middle of the flap, behind the letter so it never cuts it.
        ctx.save()
        ctx.globalAlpha *= tile
        ctx.fillStyle = r.bg
        ctx.fillRect(x, ry + tileH / 2 - 1.5, tileW, 3)
        ctx.restore()
        let shown = ch
        let flipping = false
        if (p < land && ch !== ' ') {
          if (p < start) shown = ' '
          else {
            flipping = true
            shown = GLYPHS[Math.floor(noise(ri * 977 + gi * 61 + Math.floor(p * 70)) * GLYPHS.length)]!
          }
        }
        if (shown !== ' ') {
          text(ctx, shown, x + tileW / 2, ry + tileH / 2 + fontSize * 0.36, {
            size: fontSize, weight: TYPE.weight.bold, family: TYPE.mono, color: flipping ? r.textSoft : tone, align: 'center', alpha: tile,
          })
        }
      }
    })
  })
}
