import * as THREE from 'three'
import { PALETTE, TYPE } from '../brand/tokens'
import { SURFACES as S } from './venue'

/**
 * Procedural surface textures for the set. All deterministic (a fixed hash,
 * never Math.random), all built ONCE at mount — navigation never creates one.
 */

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void

/** Fixed pseudo-random in [0, 1). Same input, same output, every run. */
export const hash = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

export function canvasTexture(w: number, h: number, draw: Draw, repeat?: readonly [number, number]) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d')!, w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(repeat[0], repeat[1])
  }
  return t
}

function speckle(ctx: CanvasRenderingContext2D, w: number, h: number, n: number, seed: number, light: string, dark: string) {
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = hash(seed + i * 3) > 0.5 ? light : dark
    ctx.globalAlpha = 0.05 + hash(seed + i * 5) * 0.08
    ctx.fillRect(hash(seed + i) * w, hash(seed + i * 7) * h, 2, 2)
  }
  ctx.globalAlpha = 1
}

/** Stone floor tiles, 1 m per tile. */
export const floorTile = (repeat: readonly [number, number]) =>
  canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = S.floor
    ctx.fillRect(0, 0, w, h)
    speckle(ctx, w, h, 900, 11, '#ffffff', '#000000')
    ctx.strokeStyle = S.floorJoint
    ctx.lineWidth = 3
    ctx.strokeRect(0, 0, w, h)
    ctx.beginPath()
    ctx.moveTo(w / 2, 0)
    ctx.lineTo(w / 2, h)
    ctx.stroke()
  }, repeat)

/** One 2 m × 1 m stage deck panel: grey carpet, white tape on the seams. */
export const carpetTile = (repeat: readonly [number, number]) =>
  canvasTexture(512, 256, (ctx, w, h) => {
    ctx.fillStyle = S.carpet
    ctx.fillRect(0, 0, w, h)
    speckle(ctx, w, h, 4000, 23, '#ffffff', '#000000')
    ctx.strokeStyle = S.tape
    ctx.globalAlpha = 0.75
    ctx.lineWidth = 5
    ctx.strokeRect(0, 0, w, h)
    ctx.globalAlpha = 1
  }, repeat)

/** Grey acoustic wall panels, 1.2 m × 1.5 m. */
export const panelTile = (repeat: readonly [number, number]) =>
  canvasTexture(192, 240, (ctx, w, h) => {
    ctx.fillStyle = S.panel
    ctx.fillRect(0, 0, w, h)
    speckle(ctx, w, h, 300, 41, '#ffffff', '#000000')
    ctx.strokeStyle = S.panelSeam
    ctx.lineWidth = 3
    ctx.strokeRect(0, 0, w, h)
  }, repeat)

const BAY = { width: 1.8, height: 6.6, px: 96 }

function woodGrain(ctx: CanvasRenderingContext2D, x: number, w: number, h: number, seed: number) {
  ctx.fillStyle = S.wood
  ctx.fillRect(x, 0, w, h)
  for (let i = 0; i < 40; i++) {
    ctx.strokeStyle = hash(seed + i) > 0.5 ? S.woodDark : '#d0a46a'
    ctx.globalAlpha = 0.08 + hash(seed + i * 2) * 0.1
    ctx.lineWidth = 1 + hash(seed + i * 3) * 2
    const gx = x + hash(seed + i * 5) * w
    ctx.beginPath()
    ctx.moveTo(gx, 0)
    ctx.bezierCurveTo(gx + 6, h * 0.3, gx - 6, h * 0.7, gx + 3, h)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

/**
 * One bay of the wood side walls: a dark post, two panels, a seam. The
 * matching emissive map is the warm uplight cone at the top of the lower panel.
 */
export function woodBay(repeat: readonly [number, number]) {
  const w = BAY.width * BAY.px
  const h = BAY.height * BAY.px
  const post = 0.2 * BAY.px
  const seamY = h - 3.0 * BAY.px
  const map = canvasTexture(w, h, (ctx) => {
    woodGrain(ctx, 0, w, h, 61)
    ctx.fillStyle = S.woodSeam
    ctx.fillRect(post, seamY, w - post, 4)
    ctx.fillRect(post, h - 4.9 * BAY.px, w - post, 3)
    ctx.fillStyle = S.post
    ctx.fillRect(0, 0, post, h)
  }, repeat)
  const glow = canvasTexture(w, h, (ctx) => {
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, w, h)
    const cx = post + (w - post) / 2
    const cy = h - 4.45 * BAY.px
    const g = ctx.createRadialGradient(cx, cy, 2, cx, cy + 0.4 * BAY.px, 1.9 * BAY.px)
    g.addColorStop(0, '#ffffff')
    g.addColorStop(0.3, 'rgba(255,255,255,0.7)')
    g.addColorStop(0.7, 'rgba(255,255,255,0.18)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.save()
    ctx.translate(cx, cy)
    ctx.scale(1, 1.25)
    ctx.translate(-cx, -cy)
    ctx.fillStyle = g
    ctx.fillRect(post, 0, w - post, h)
    ctx.restore()
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(cx - 0.35 * BAY.px, cy - 6, 0.7 * BAY.px, 5)
  }, repeat)
  return { map, glow }
}

/** Plain wood for the back wall: same grain, a post every 1.8 m, no lights. */
export const woodPlain = (repeat: readonly [number, number]) =>
  canvasTexture(BAY.width * BAY.px, 2 * BAY.px, (ctx, w, h) => {
    woodGrain(ctx, 0, w, h, 71)
    ctx.fillStyle = S.woodSeam
    ctx.fillRect(0, 0, 3, h)
  }, repeat)

/** Ceiling slats, 1 m tile, running down the slope. */
export const slatTile = (repeat: readonly [number, number]) =>
  canvasTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = S.ceiling
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#2a1d10'
    for (let i = 0; i < 8; i++) ctx.fillRect(0, i * 16, w, 3)
  }, repeat)

/** The stage-back bench: wood drawer fronts, 1.2 m each. */
export const benchTile = (repeat: readonly [number, number]) =>
  canvasTexture(192, 72, (ctx, w, h) => {
    woodGrain(ctx, 0, w, h, 83)
    ctx.strokeStyle = S.woodSeam
    ctx.lineWidth = 4
    ctx.strokeRect(2, 2, w - 4, h - 4)
  }, repeat)

/** Front of the foam flag block: white, blue triangle lower-left. */
export const flagFace = () =>
  canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = S.foam
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = PALETTE.blue
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, h)
    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fill()
    speckle(ctx, w, h, 600, 97, '#ffffff', '#000000')
  })

/** A barn-door flap with its painted fixture number. */
export const flapNumber = (n: number) =>
  canvasTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = S.plastic
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#ffffff'
    ctx.font = `${TYPE.weight.bold} 96px ${TYPE.mono}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(n), w / 2, h / 2 + 4)
  })

/** The hall clock under the booth window, stopped at a fixed time. */
export const clockFace = () =>
  canvasTexture(256, 256, (ctx, w) => {
    const r = w / 2
    ctx.fillStyle = S.paper
    ctx.beginPath()
    ctx.arc(r, r, r - 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = S.ink
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2
      const inner = i % 5 === 0 ? r - 30 : r - 16
      ctx.lineWidth = i % 5 === 0 ? 8 : 3
      ctx.beginPath()
      ctx.moveTo(r + Math.sin(a) * inner, r - Math.cos(a) * inner)
      ctx.lineTo(r + Math.sin(a) * (r - 8), r - Math.cos(a) * (r - 8))
      ctx.stroke()
    }
    const hand = (turn: number, len: number, width: number) => {
      const a = turn * Math.PI * 2
      ctx.lineWidth = width
      ctx.beginPath()
      ctx.moveTo(r, r)
      ctx.lineTo(r + Math.sin(a) * len, r - Math.cos(a) * len)
      ctx.stroke()
    }
    hand(9.75 / 12, r * 0.5, 12) // 09:45 — doors open
    hand(45 / 60, r * 0.78, 8)
  })

/** Booth multiview: four dark tiles with tally borders. */
export const multiview = () =>
  canvasTexture(512, 288, (ctx, w, h) => {
    ctx.fillStyle = S.ui
    ctx.fillRect(0, 0, w, h)
    const tiles = [S.uiRed, S.uiGreen, '#3a3f48', '#3a3f48'] as const
    tiles.forEach((tally, i) => {
      const x = (i % 2) * (w / 2) + 8
      const y = Math.floor(i / 2) * (h / 2) + 8
      ctx.fillStyle = '#1b2029'
      ctx.fillRect(x, y, w / 2 - 16, h / 2 - 16)
      ctx.strokeStyle = tally
      ctx.lineWidth = 4
      ctx.strokeRect(x, y, w / 2 - 16, h / 2 - 16)
      ctx.fillStyle = '#6b7380'
      ctx.fillRect(x + 12, y + h / 2 - 40, 80, 10)
    })
  })

/** A laptop running a run-of-show spreadsheet. */
export const laptopScreen = (seed: number) =>
  canvasTexture(320, 208, (ctx, w, h) => {
    ctx.fillStyle = '#e9ecf1'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#2a3140'
    ctx.fillRect(0, 0, w, 18)
    for (let r = 0; r < 14; r++) {
      for (let c = 0; c < 4; c++) {
        ctx.fillStyle = hash(seed + r * 7 + c) > 0.82 ? S.uiBlue : '#9aa3b2'
        ctx.fillRect(10 + c * 76, 28 + r * 12, 20 + hash(seed + r + c * 11) * 40, 5)
      }
    }
  })

/**
 * The digital mixer surface: touchscreen, channel strips, lit keys. Returns
 * the colour map and an emissive map (only the screen and keys glow).
 */
export function mixerSurface() {
  const W = 640
  const H = 384
  const strips = 16
  const paint = (ctx: CanvasRenderingContext2D, lit: boolean) => {
    ctx.fillStyle = lit ? '#000000' : '#26282c'
    ctx.fillRect(0, 0, W, H)
    // Touchscreen, top-centre.
    const sx = 170, sy = 18, sw = 300, sh = 150
    ctx.fillStyle = S.ui
    ctx.fillRect(sx, sy, sw, sh)
    ctx.strokeStyle = S.uiGreen
    ctx.lineWidth = 3
    ctx.strokeRect(sx + 40, sy + 40, sw - 80, sh - 70)
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = i % 3 === 0 ? S.uiAmber : S.uiBlue
      ctx.fillRect(sx + 14 + i * 28, sy + sh - 22, 18, 12)
    }
    // Channel strips: keys and faders.
    for (let i = 0; i < strips; i++) {
      const x = 22 + i * ((W - 44) / strips)
      ctx.fillStyle = hash(i + 5) > 0.6 ? S.uiRed : hash(i + 9) > 0.5 ? S.uiAmber : lit ? '#000000' : '#4a4d52'
      ctx.fillRect(x, 200, 22, 12)
      ctx.fillStyle = lit ? '#000000' : '#0d0d0e'
      ctx.fillRect(x + 9, 232, 4, 120)
      if (!lit) {
        ctx.fillStyle = '#b5b8bd'
        ctx.fillRect(x + 2, 240 + hash(i + 31) * 90, 18, 14)
      }
    }
  }
  return {
    map: canvasTexture(W, H, (ctx) => paint(ctx, false)),
    glow: canvasTexture(W, H, (ctx) => paint(ctx, true)),
  }
}

/** A small control tablet: a grid of lit blue keys. */
export const keypad = () =>
  canvasTexture(256, 160, (ctx, w, h) => {
    ctx.fillStyle = S.ui
    ctx.fillRect(0, 0, w, h)
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 5; c++) {
        ctx.fillStyle = hash(r * 5 + c + 50) > 0.7 ? S.uiGreen : S.uiBlue
        ctx.fillRect(14 + c * 48, 16 + r * 48, 36, 36)
      }
    }
  })

/** Sponsor logo images by slug (white mono) and `<slug>-color`. */
export type Logos = Readonly<Record<string, HTMLImageElement>>

/** Fit a logo into a box, aligned left / right / centre, vertically centred. */
export function drawLogo(
  ctx: CanvasRenderingContext2D, img: HTMLImageElement | undefined,
  x: number, y: number, w: number, h: number, align: 'left' | 'right' | 'center' = 'center',
) {
  if (!img || !img.naturalWidth) return
  const k = Math.min(w / img.naturalWidth, h / img.naturalHeight)
  const dw = img.naturalWidth * k
  const dh = img.naturalHeight * k
  const dx = align === 'left' ? x : align === 'right' ? x + w - dw : x + (w - dw) / 2
  ctx.drawImage(img, dx, y + (h - dh) / 2, dw, dh)
}

/**
 * The sponsor band as printed on the backdrop: headline logos big in two
 * side columns, partners along the bottom, supporters clustered in the middle.
 */
export function drawSponsorBand(ctx: CanvasRenderingContext2D, logos: Logos, x: number, y: number, w: number, h: number) {
  const side = 0.3 * w
  const rowH = 0.27 * h
  const left = ['namespace', 'vercel', 'tiptap']
  const right = ['ag-grid', 'smallpdf', 'proton']
  left.forEach((slug, i) => drawLogo(ctx, logos[slug], x, y + i * rowH + rowH * 0.15, side, rowH * 0.62, 'left'))
  right.forEach((slug, i) => drawLogo(ctx, logos[slug], x + w - side, y + i * rowH + rowH * 0.15, side, rowH * 0.62, 'right'))
  const py = y + 0.84 * h
  const ph = 0.11 * h
  drawLogo(ctx, logos.primeui, x, py, side * 0.46, ph, 'left')
  drawLogo(ctx, logos.copilotkit, x + side * 0.52, py, side * 0.46, ph, 'left')
  drawLogo(ctx, logos.typesense, x + w - side, py, side * 0.55, ph, 'right')
  drawLogo(ctx, logos.sae, x + w - side * 0.35, py, side * 0.35, ph * 1.3, 'right')
  const supporters = [
    'cloudflare', 'coderabbit', 'mittwald', 'sentry', 'stickermule', 'peaq', 'livingdocs',
    '7druck', 'stormkit', 'fin', 'juranosaurus', 'six', 'remotion', 'novu',
  ]
  const mx = x + 0.34 * w
  const mw = 0.32 * w
  const cols = 4
  const cw = mw / cols
  const ch = (0.9 * h) / 4
  supporters.forEach((slug, i) => {
    const r = Math.floor(i / cols)
    const inRow = Math.min(cols, supporters.length - r * cols)
    const ox = mx + ((cols - inRow) * cw) / 2
    drawLogo(ctx, logos[slug], ox + (i % cols) * cw + cw * 0.08, y + 0.08 * h + r * ch, cw * 0.84, ch * 0.5)
  })
}

/**
 * The conference pop-up backdrop, painted once from the vector skyline
 * (extracted from the ZurichJS roll-up art) and the sponsor logos.
 * 800 px per metre. Corners are cut transparent; the material uses alphaTest.
 */
export function backdropFace(skyline: HTMLImageElement, logos: Logos, widthM: number, heightM: number) {
  const PX = 800
  const w = Math.round(widthM * PX)
  const h = Math.round(heightM * PX)
  return canvasTexture(w, h, (ctx) => {
    ctx.beginPath()
    ctx.roundRect(0, 0, w, h, 0.1 * PX)
    ctx.clip()
    ctx.fillStyle = PALETTE.yellow
    ctx.fillRect(0, 0, w, h)

    // Skyline: full width, compressed vertically like the print, so the
    // dark band below has room for the sponsors. Source viewBox is
    // 1000 × 850 from y = 1150; tallest spire ≈ y 1256, solid ground ≈ y 1680.
    const k = w / 1000
    const sq = 0.68
    const top = 0.33 * h - (1256 - 1150) * k * sq
    ctx.drawImage(skyline, 0, top, w, 850 * k * sq)
    ctx.fillStyle = PALETTE.black
    ctx.fillRect(0, top + 850 * k * sq - 2, w, h)

    // Header: flag mark + "Zurich JS Conf 2026", centred.
    ctx.textBaseline = 'alphabetic'
    const titleSize = 0.2 * PX
    ctx.font = `${TYPE.weight.black} ${titleSize}px ${TYPE.sans}`
    const title = 'Zurich JS Conf 2026'
    const mark = titleSize * 0.82
    const gap = titleSize * 0.3
    const tw = ctx.measureText(title).width
    const x0 = (w - (mark + gap + tw)) / 2
    const base = 0.075 * h + titleSize * 0.5
    const my = base - mark
    ctx.fillStyle = S.foam
    ctx.fillRect(x0, my, mark, mark)
    ctx.fillStyle = PALETTE.blue
    ctx.beginPath()
    ctx.moveTo(x0, my)
    ctx.lineTo(x0, my + mark)
    ctx.lineTo(x0 + mark, my + mark)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = PALETTE.black
    ctx.fillText(title, x0 + mark + gap, base)

    // Sub-line: tagline left, date + place right, under the title.
    ctx.font = `${TYPE.weight.medium} ${0.045 * PX}px ${TYPE.sans}`
    const sub = base + 0.085 * PX
    ctx.textAlign = 'left'
    ctx.fillText('JS Conference by humans, for humans', x0, sub)
    ctx.textAlign = 'right'
    ctx.fillText('September 11, 2026 • Technopark, Zurich', x0 + mark + gap + tw, sub)

    // The line.
    ctx.textAlign = 'center'
    ctx.font = `${TYPE.weight.bold} ${0.12 * PX}px ${TYPE.sans}`
    ctx.fillText('Learn. Share. Build.', w / 2, 0.275 * h)

    // Sponsors in the dark band.
    drawSponsorBand(ctx, logos, 0.035 * w, 0.69 * h, 0.93 * w, 0.28 * h)
  })
}

/** The sponsor loop slide on a booth monitor: dark ground, white logos. */
export const sponsorLoop = (logos: Logos) =>
  canvasTexture(1280, 720, (ctx, w, h) => {
    ctx.fillStyle = PALETTE.surfacePage
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = PALETTE.textMuted
    ctx.font = `${TYPE.weight.medium} 30px ${TYPE.mono}`
    ctx.fillText('THANK YOU TO OUR SPONSORS', 70, 80)
    drawSponsorBand(ctx, logos, 70, 130, w - 140, h - 190)
  })

/** Board-formed concrete: 2.5 m × 1.25 m pours with soft blotches. */
export const concreteTile = (repeat: readonly [number, number]) =>
  canvasTexture(320, 160, (ctx, w, h) => {
    ctx.fillStyle = S.concrete
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 26; i++) {
      const g = ctx.createRadialGradient(hash(i + 300) * w, hash(i + 400) * h, 0, hash(i + 300) * w, hash(i + 400) * h, 20 + hash(i + 500) * 50)
      const dark = hash(i + 600) > 0.5
      g.addColorStop(0, dark ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.08)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    }
    speckle(ctx, w, h, 800, 701, '#ffffff', '#000000')
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, w, h)
  }, repeat)

/** Wall lettering on transparent: "Auditorium / Foyer". */
export const wallLettering = (text: string) =>
  canvasTexture(1024, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = S.ink
    ctx.font = `${TYPE.weight.medium} 96px ${TYPE.sans}`
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 8, h / 2 + 4)
  })

/** An A4 "ENTRANCE" sheet taped to a door. */
export const entranceSheet = () =>
  canvasTexture(256, 180, (ctx, w, h) => {
    ctx.fillStyle = S.paper
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = S.ink
    ctx.font = `${TYPE.weight.bold} 34px ${TYPE.sans}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('ENTRANCE', w / 2, h / 2 + 6)
  })

/** Check-in queue sign: "Check in / First name / A–K", ZurichJS mark at the foot. */
export const checkinSign = (range: string) =>
  canvasTexture(300, 400, (ctx, w, h) => {
    ctx.fillStyle = S.paper
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = S.ink
    ctx.textAlign = 'center'
    ctx.font = `${TYPE.weight.medium} 30px ${TYPE.sans}`
    ctx.fillText('Check in', w / 2, 56)
    ctx.font = `${TYPE.weight.medium} 26px ${TYPE.sans}`
    ctx.fillText('First name', w / 2, 150)
    ctx.font = `${TYPE.weight.black} 104px ${TYPE.sans}`
    ctx.fillText(range, w / 2, 255)
    ctx.fillStyle = PALETTE.blue
    ctx.beginPath()
    ctx.moveTo(78, 340)
    ctx.lineTo(78, 366)
    ctx.lineTo(104, 366)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = S.ink
    ctx.font = `${TYPE.weight.bold} 30px ${TYPE.sans}`
    ctx.textAlign = 'left'
    ctx.fillText('ZurichJS', 112, 366)
  })

/** Black tote print: the JS square (white / blue / yellow) and "ZurichJS Conf 2026". */
export const totePrint = () =>
  canvasTexture(256, 300, (ctx, w, h) => {
    ctx.fillStyle = S.plastic
    ctx.fillRect(0, 0, w, h)
    const x = 68, y = 50, s = 120
    ctx.fillStyle = PALETTE.yellow
    ctx.fillRect(x, y, s, s)
    ctx.fillStyle = PALETTE.white
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s, y); ctx.lineTo(x + s / 2, y + s / 2); ctx.closePath(); ctx.fill()
    ctx.fillStyle = PALETTE.blue
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s / 2, y + s / 2); ctx.lineTo(x, y + s); ctx.closePath(); ctx.fill()
    ctx.fillStyle = PALETTE.black
    ctx.font = `${TYPE.weight.black} 40px ${TYPE.sans}`
    ctx.textAlign = 'right'
    ctx.fillText('JS', x + s - 8, y + s - 10)
    ctx.fillStyle = PALETTE.white
    ctx.textAlign = 'left'
    ctx.font = `${TYPE.weight.black} 30px ${TYPE.sans}`
    ctx.fillText('ZurichJS', x, y + s + 38)
    ctx.fillText('Conf 2026', x, y + s + 72)
  })

/** The conference holding slide (skyline, wordmark) for a booth monitor. */
export const holdingSlide = (skyline: HTMLImageElement) =>
  canvasTexture(640, 360, (ctx, w, h) => {
    ctx.fillStyle = PALETTE.black
    ctx.fillRect(0, 0, w, h)
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55)
    sky.addColorStop(0, PALETTE.yellowLight)
    sky.addColorStop(1, PALETTE.yellowDark)
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, w, h * 0.55)
    const k = w / 1000
    ctx.drawImage(skyline, 0, h * 0.55 - (1680 - 1150) * k, w, 850 * k)
    const s = 28
    const y = h * 0.8
    ctx.font = `${TYPE.weight.black} 34px ${TYPE.sans}`
    const t = 'Zurich JS Conf 2026'
    const tw = ctx.measureText(t).width
    const x = (w - (s + 12 + tw)) / 2
    ctx.fillStyle = PALETTE.white
    ctx.fillRect(x, y - s, s, s)
    ctx.fillStyle = PALETTE.blue
    ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x, y); ctx.lineTo(x + s, y); ctx.closePath(); ctx.fill()
    ctx.fillStyle = PALETTE.white
    ctx.fillText(t, x + s + 12, y)
  })

/** A dark-theme app window (run-of-show, chat) for the booth laptops. */
export const darkApp = (seed: number) =>
  canvasTexture(320, 208, (ctx, w, h) => {
    ctx.fillStyle = '#10141c'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#1d4ed8'
    ctx.fillRect(0, 0, w, 14)
    ctx.fillStyle = '#18202c'
    ctx.fillRect(0, 14, 70, h)
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 3; c++) {
        ctx.fillStyle = hash(seed + r * 5 + c) > 0.8 ? S.uiBlue : '#4b5565'
        ctx.fillRect(80 + c * 78, 22 + r * 12, 18 + hash(seed + r * 3 + c) * 50, 5)
      }
      ctx.fillStyle = '#334155'
      ctx.fillRect(8, 22 + r * 12, 40 + hash(seed + r) * 18, 5)
    }
  })

/** The mixer's upright touchscreen: routing view, green bus lines, channel tiles. */
export const mixerScreen = () =>
  canvasTexture(480, 300, (ctx, w, h) => {
    ctx.fillStyle = '#0b1a2b'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = hash(i + 80) > 0.5 ? '#1f6feb' : '#14365c'
      ctx.fillRect(14 + i * 38, 14, 30, 34)
      ctx.fillRect(14 + i * 38, h - 52, 30, 38)
    }
    ctx.strokeStyle = S.uiGreen
    ctx.lineWidth = 5
    ctx.strokeRect(90, 80, w - 180, h - 160)
    ctx.beginPath()
    ctx.moveTo(90, h - 80); ctx.lineTo(160, 120); ctx.lineTo(w - 90, 120)
    ctx.stroke()
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 ? S.uiAmber : '#e5e7eb'
      ctx.beginPath()
      ctx.arc(130 + i * 45, 150 + (i % 3) * 18, 8, 0, Math.PI * 2)
      ctx.fill()
    }
  })

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number) {
  const words = text.split(' ')
  let line = ''
  let yy = y
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, yy)
      line = word
      yy += lineH
    } else line = test
  }
  if (line) ctx.fillText(line, x, yy)
  return yy
}

/** Orange-wood gallery walls: 3.2 m bays, one office door per bay, a glass panel. */
export const galleryWall = (repeat: readonly [number, number]) =>
  canvasTexture(320, 420, (ctx, w, h) => {
    ctx.fillStyle = S.woodOrange
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'
    ctx.lineWidth = 2
    for (let x = 0; x < w; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
    ctx.strokeStyle = 'rgba(0,0,0,0.45)'
    ctx.lineWidth = 4
    ctx.strokeRect(40, 160, 90, 230) // door
    ctx.fillStyle = 'rgba(30,38,48,0.85)'
    ctx.fillRect(180, 120, 110, 150) // glass panel
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.fillRect(0, 0, w, 6)
  }, repeat)

/** namespace's booth wall, as on the day: logo, headline, customer tile grid. */
export const namespaceWall = (logos: Logos) =>
  canvasTexture(1440, 1000, (ctx, w, h) => {
    ctx.fillStyle = S.namespaceBlue
    ctx.fillRect(0, 0, w, h)
    drawLogo(ctx, logos.namespace, 60, 60, 420, 110, 'left')
    ctx.fillStyle = PALETTE.white
    ctx.font = `${TYPE.weight.bold} 68px ${TYPE.sans}`
    const end = wrapText(ctx, 'Join 1000+ of the world’s most ambitious companies', 60, 300, 760, 76)
    ctx.font = `${TYPE.weight.regular} 34px ${TYPE.sans}`
    wrapText(ctx, 'Fast coding, build, and test environments across Mac, Windows, and Linux', 64, end + 100, 640, 44)
    // Customer tile grid (left blank: we do not reproduce third-party logos).
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 3; c++) {
        ctx.fillStyle = S.namespaceTile
        ctx.fillRect(900 + c * 160, 140 + r * 130, 150, 120)
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'
        ctx.strokeRect(900 + c * 160, 140 + r * 130, 150, 120)
      }
    }
  })

/** AG Grid's blue roll-ups: the AG Studio banner and the "Think out loud" one. */
export const agRollup = (logos: Logos, variant: 'studio' | 'talk') =>
  canvasTexture(400, 800, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, S.agBlue)
    g.addColorStop(1, S.agBlueDeep)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = PALETTE.white
    ctx.textAlign = 'center'
    if (variant === 'studio') {
      ctx.font = `${TYPE.weight.bold} 54px ${TYPE.sans}`
      ctx.fillText('AG Studio', w / 2 - 20, 90)
      drawLogo(ctx, logos['ag-grid'], w / 2 - 70, 104, 140, 26)
      ctx.font = `${TYPE.weight.regular} 22px ${TYPE.sans}`
      wrapText(ctx, 'Self-service dashboards built on the grid and charts you already love', w / 2, 180, 300, 30)
      // Product screenshot stand-in: a white panel with a small bar chart.
      ctx.fillStyle = '#f2f4f8'
      ctx.fillRect(50, 270, 300, 190)
      ctx.fillStyle = S.agBlue
      ;[60, 110, 40, 140, 90].forEach((v, i) => ctx.fillRect(80 + i * 50, 440 - v, 26, v))
      ctx.fillStyle = PALETTE.white
      ctx.textAlign = 'left'
      ctx.font = `${TYPE.weight.regular} 17px ${TYPE.sans}`
      ;['Native to your app, not bolted on', 'One less stack for engineering', 'Data never leaves your infrastructure', 'Your AI, your rules']
        .forEach((t, i) => ctx.fillText(`• ${t}`, 50, 505 + i * 28))
      ctx.font = `${TYPE.weight.bold} 40px ${TYPE.sans}`
      ctx.fillText('45-day', 50, 670)
      ctx.fillText('free trial', 50, 712)
      ctx.fillStyle = PALETTE.white
      ctx.fillRect(270, 640, 80, 80)
      ctx.font = `${TYPE.weight.medium} 20px ${TYPE.sans}`
      ctx.fillText('ag-grid.com/studio', 50, 765)
    } else {
      ctx.font = `${TYPE.weight.black} 46px ${TYPE.sans}`
      ctx.fillText('Think out loud', w / 2, 110)
      ctx.fillText('with us.', w / 2, 162)
      ctx.font = `${TYPE.weight.bold} 26px ${TYPE.sans}`
      ctx.fillText('Chat with the team.', w / 2, 220)
      const pills = [['High Performance', '#3b82f6'], ['Great DX', '#2563eb'], ['Seamless Integration', '#7c3aed'], ['Infinitely Configurable', '#f97316']] as const
      pills.forEach(([t, c], i) => {
        ctx.fillStyle = c
        ctx.beginPath()
        ctx.roundRect(70 + (i % 2) * 40, 300 + i * 56, 260, 38, 19)
        ctx.fill()
        ctx.fillStyle = PALETTE.white
        ctx.font = `${TYPE.weight.medium} 18px ${TYPE.sans}`
        ctx.fillText(t, 200 + (i % 2) * 40, 325 + i * 56)
      })
      drawLogo(ctx, logos['ag-grid'], 90, 690, 220, 50)
    }
  })

/** A plain sponsor roll-up: one colour, the logo in the top third. */
export const logoRollup = (logo: HTMLImageElement | undefined, bg: string) =>
  canvasTexture(400, 800, (ctx, w, h) => {
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
    drawLogo(ctx, logo, 50, 140, w - 100, 120)
  })

/** The lift tower sign: the Technopark logo recoloured white on transparent. */
export const towerSign = (logo: HTMLImageElement) =>
  canvasTexture(1181, 218, (ctx, w, h) => {
    ctx.drawImage(logo, 0, 0, w, h)
    ctx.globalCompositeOperation = 'source-in'
    ctx.fillStyle = PALETTE.white
    ctx.fillRect(0, 0, w, h)
  })

/** The skyline silhouette recoloured to one flat colour, on transparent. */
function tintedSkyline(skyline: HTMLImageElement, color: string, w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  ctx.drawImage(skyline, 0, 0, w, h)
  ctx.globalCompositeOperation = 'source-in'
  ctx.fillStyle = color
  ctx.fillRect(0, 0, w, h)
  return c
}

export type BadgeRole =
  | 'attendee' | 'vip' | 'volunteer' | 'organizer'
  | 'speaker' | 'mc' | 'panelist' | 'instructor' | 'sponsor'

/**
 * Badge print layout, from the final 2026 PDFs (portrait, 883 × 1372 at
 * print size; drawn here at half that). Every role shares one layout; the
 * role sets the skyline/band colour and the label. Names are placeholders:
 * the deck never carries real attendee data.
 */
const BADGE = { w: 442, h: 686 } as const
const BADGE_LOOK: Readonly<Record<BadgeRole, { band: string; label: string; text: string }>> = {
  attendee: { band: PALETTE.yellow, label: PALETTE.black, text: 'Attendee' },
  vip: { band: PALETTE.blue, label: PALETTE.white, text: 'VIP' },
  volunteer: { band: PALETTE.orange, label: PALETTE.white, text: 'Volunteer' },
  organizer: { band: PALETTE.white, label: PALETTE.black, text: 'Organizer' },
  speaker: { band: PALETTE.green, label: PALETTE.white, text: 'Speaker' },
  mc: { band: PALETTE.green, label: PALETTE.white, text: 'MC' },
  panelist: { band: PALETTE.green, label: PALETTE.white, text: 'Panelist' },
  instructor: { band: PALETTE.green, label: PALETTE.white, text: 'Instructor' },
  sponsor: { band: PALETTE.black, label: PALETTE.white, text: 'Sponsor' },
}

/** Mark + "Zurich JS Conf 2026", centred, as on every badge face and back. */
function badgeHeader(ctx: CanvasRenderingContext2D, w: number, ink: string, flag: boolean) {
  ctx.font = `${TYPE.weight.bold} 23px ${TYPE.sans}`
  const t = 'Zurich JS Conf 2026'
  const m = 18
  const tw = ctx.measureText(t).width
  const x = (w - (m + 8 + tw)) / 2
  const y = 56
  if (flag) {
    ctx.fillStyle = PALETTE.white
    ctx.fillRect(x, y - m, m, m)
  }
  ctx.fillStyle = PALETTE.blue
  ctx.beginPath(); ctx.moveTo(x, y - m); ctx.lineTo(x, y); ctx.lineTo(x + m, y); ctx.closePath(); ctx.fill()
  ctx.fillStyle = ink
  ctx.textAlign = 'left'
  ctx.fillText(t, x + m + 8, y)
}

/** The badge skyline: full width, compressed like the print, solid to the bottom. */
function badgeSkyline(ctx: CanvasRenderingContext2D, skyline: HTMLImageElement, color: string, w: number, h: number) {
  const k = w / 1000
  const sq = 0.5
  const top = 0.605 * h - 106 * k * sq
  const sh = Math.round(850 * k * sq)
  ctx.drawImage(tintedSkyline(skyline, color, w, sh), 0, top)
  ctx.fillStyle = color
  ctx.fillRect(0, top + sh - 2, w, h)
}

export function badgeFace(role: BadgeRole, skyline: HTMLImageElement, logos: Logos, sponsor = 'copilotkit') {
  const { w, h } = BADGE
  const look = BADGE_LOOK[role]
  const org = role === 'organizer'
  const ink = org ? PALETTE.white : PALETTE.black
  return canvasTexture(w, h, (ctx) => {
    ctx.fillStyle = org ? PALETTE.orange : PALETTE.white
    ctx.fillRect(0, 0, w, h)
    badgeSkyline(ctx, skyline, look.band, w, h)
    badgeHeader(ctx, w, ink, org)
    ctx.fillStyle = ink
    ctx.textAlign = 'center'
    ctx.font = `${TYPE.weight.bold} 48px ${TYPE.sans}`
    ctx.fillText('Firstname', w / 2, org ? 216 : 152)
    ctx.font = `${TYPE.weight.bold} 30px ${TYPE.sans}`
    ctx.fillText('Lastname', w / 2, org ? 276 : 208)
    ctx.font = `${TYPE.weight.regular} 20px ${TYPE.sans}`
    ctx.fillText(org ? 'ZurichJS Core Team' : 'Job Title', w / 2, org ? 340 : 282)
    if (!org) {
      ctx.font = `${TYPE.weight.regular} 16px ${TYPE.sans}`
      ctx.fillText('Company', w / 2, 357)
    }
    if (role === 'sponsor') drawLogo(ctx, logos[sponsor], w / 2 - 90, 536, 180, 40)
    ctx.fillStyle = look.label
    ctx.font = `${TYPE.weight.bold} 44px ${TYPE.sans}`
    ctx.fillText(look.text, w / 2, 643)
  })
}

/** The shared badge back: "Let's connect!", a QR code, the headline sponsors. */
export function badgeBack(skyline: HTMLImageElement, logos: Logos) {
  const { w, h } = BADGE
  return canvasTexture(w, h, (ctx) => {
    ctx.fillStyle = PALETTE.white
    ctx.fillRect(0, 0, w, h)
    badgeSkyline(ctx, skyline, PALETTE.black, w, h)
    badgeHeader(ctx, w, PALETTE.black, false)
    ctx.fillStyle = PALETTE.black
    ctx.textAlign = 'center'
    ctx.font = `${TYPE.weight.bold} 36px ${TYPE.sans}`
    ctx.fillText('Let’s connect!', w / 2, 178)
    // A decorative QR-like code (deterministic, not scannable).
    const n = 25
    const cell = 5.4
    const qx = (w - n * cell) / 2
    const qy = 310
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const finder = (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7)
        const on = finder
          ? (() => { const rr = r % (n - 7) === r ? r : r - (n - 7); const cc = c < 7 ? c : c - (n - 7); const d = Math.max(Math.abs(rr - 3), Math.abs(cc - 3)); return d !== 2 })()
          : hash(r * 31 + c * 7 + 3) > 0.5
        if (on) ctx.fillRect(qx + c * cell, qy + r * cell, cell, cell)
      }
    }
    drawLogo(ctx, logos.namespace, w / 2 - 100, 545, 200, 50)
    drawLogo(ctx, logos['ag-grid'], w / 2 - 100, 605, 200, 36)
    for (const [slug, x, a] of [['vercel', 46, Math.PI / 2], ['smallpdf', w - 46, -Math.PI / 2]] as const) {
      ctx.save()
      ctx.translate(x, 600)
      ctx.rotate(a)
      drawLogo(ctx, logos[slug], -50, -14, 100, 28)
      ctx.restore()
    }
  })
}

/** Physical badge size in metres (print aspect). */
export const BADGE_SIZE = { w: 0.1, h: 0.1 * (BADGE.h / BADGE.w) } as const

/** A map label: yellow pill, black Geist Mono uppercase. */
export const mapLabel = (text: string) =>
  canvasTexture(1024, 160, (ctx, w, h) => {
    ctx.font = `${TYPE.weight.bold} 72px ${TYPE.mono}`
    const label = text.toUpperCase()
    const tw = ctx.measureText(label).width + 80
    ctx.fillStyle = PALETTE.yellow
    ctx.beginPath()
    ctx.roundRect((w - tw) / 2, 20, tw, h - 40, 60)
    ctx.fill()
    ctx.fillStyle = PALETTE.black
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, w / 2, h / 2 + 4)
  })

/**
 * The cup engraving, in the cup's own lathe UV space (u around, v along the
 * profile). The logo (ZurichJS mark + wordmark) is debossed: a bump map where
 * the logo is a soft-edged recess, plus a colour map that shades the recess.
 * Placement: centred at u = 0.5 (the cup's −z side), about 9 mm tall at
 * mid-wall (v ≈ 0.46 for the profile in Foyer.tsx).
 */
export function cupEngraving() {
  const N = 2048
  const draw = (ctx: CanvasRenderingContext2D, ground: string, ink: string, blur: number) => {
    ctx.fillStyle = ground
    ctx.fillRect(0, 0, N, N)
    const h = 0.036 * N
    const cy = (1 - 0.46) * N // canvas y runs opposite to v
    const s = h * 0.9
    ctx.font = `${TYPE.weight.bold} ${h}px ${TYPE.sans}`
    const tw = ctx.measureText('ZurichJS').width
    const x0 = N / 2 - (s + h * 0.25 + tw) / 2
    ctx.filter = `blur(${blur}px)`
    ctx.strokeStyle = ink
    ctx.fillStyle = ink
    ctx.lineWidth = h * 0.09
    ctx.strokeRect(x0, cy - s / 2, s, s)
    ctx.beginPath(); ctx.moveTo(x0, cy - s / 2); ctx.lineTo(x0, cy + s / 2); ctx.lineTo(x0 + s, cy + s / 2); ctx.closePath(); ctx.fill()
    ctx.textBaseline = 'middle'
    ctx.fillText('ZurichJS', x0 + s + h * 0.25, cy + h * 0.04)
    ctx.filter = 'none'
  }
  const map = canvasTexture(N, N, (ctx) => draw(ctx, '#ffffff', '#c8c8c8', 0))
  const bump = canvasTexture(N, N, (ctx) => draw(ctx, '#ffffff', '#000000', 2.5))
  bump.colorSpace = THREE.NoColorSpace
  return { map, bump }
}

/** Foifi's yellow column: chalk-white hand-drawn swirls (no invented words). */
export const columnScript = () =>
  canvasTexture(512, 1024, (ctx, w, h) => {
    ctx.fillStyle = S.foifiYellow
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'
    ctx.lineCap = 'round'
    for (let i = 0; i < 14; i++) {
      const y = 60 + i * 70
      const x = 40 + hash(i + 900) * 200
      ctx.lineWidth = 4 + hash(i + 910) * 5
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.bezierCurveTo(x + 80, y - 60, x + 160, y + 60, x + 240 + hash(i + 920) * 120, y - 10)
      if (hash(i + 930) > 0.5) ctx.arc(x + 300, y + 10, 18 + hash(i) * 14, 0, Math.PI * 1.6)
      ctx.stroke()
    }
  }, [2, 1])

/** Disco-ball mosaic: tiles of varying brightness (deterministic). */
export const discoTiles = () =>
  canvasTexture(256, 128, (ctx, w, h) => {
    const n = 32
    for (let r = 0; r < n / 2; r++) {
      for (let c = 0; c < n; c++) {
        const v = 110 + Math.round(hash(r * 97 + c * 13 + 5) * 145)
        ctx.fillStyle = `rgb(${v},${v},${Math.min(255, v + 10)})`
        ctx.fillRect(c * (w / n), r * (h / (n / 2)), w / n - 1, h / (n / 2) - 1)
      }
    }
  })

/** Night street through Foifi's glazing: sodium-lit road, trees, bokeh. */
export const nightWindow = () =>
  canvasTexture(1024, 512, (ctx, w, h) => {
    const sky = ctx.createLinearGradient(0, 0, 0, h)
    sky.addColorStop(0, '#0b0f1c')
    sky.addColorStop(0.55, '#2a1c10')
    sky.addColorStop(1, '#5a3a18')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, w, h)
    // Road glow under the street lamps.
    const road = ctx.createLinearGradient(0, h * 0.62, 0, h)
    road.addColorStop(0, 'rgba(255,170,70,0.25)')
    road.addColorStop(1, 'rgba(255,150,50,0.6)')
    ctx.fillStyle = road
    ctx.fillRect(0, h * 0.62, w, h * 0.38)
    // Tree silhouettes.
    ctx.fillStyle = 'rgba(8,10,8,0.85)'
    for (let i = 0; i < 9; i++) {
      const x = hash(i + 700) * w
      const r = 40 + hash(i + 710) * 60
      ctx.beginPath(); ctx.arc(x, h * 0.42, r, 0, Math.PI * 2); ctx.fill()
      ctx.fillRect(x - 4, h * 0.42, 8, h * 0.25)
    }
    // Street lamps and bokeh.
    for (let i = 0; i < 60; i++) {
      const x = hash(i + 300) * w
      const y = h * (0.3 + hash(i + 400) * 0.45)
      const r = 2 + hash(i + 500) * 8
      ctx.fillStyle = hash(i + 600) > 0.25 ? 'rgba(255,180,90,0.85)' : 'rgba(150,220,170,0.7)'
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
    }
  })

/** Night ground between the venues: dark asphalt with faint street-light pools. */
export const nightGround = () =>
  canvasTexture(1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = '#0d0e10'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 80; i++) {
      const x = hash(i + 1300) * w
      const y = hash(i + 1400) * h
      const g = ctx.createRadialGradient(x, y, 0, x, y, 18 + hash(i + 1500) * 24)
      g.addColorStop(0, 'rgba(255,170,80,0.35)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(x - 50, y - 50, 100, 100)
    }
  })

/** The yellow "new Date()" flyer under the cake (text as seen in the photo). */
export const dateFlyer = () =>
  canvasTexture(640, 300, (ctx, w, h) => {
    ctx.fillStyle = PALETTE.yellowSecondary
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(0,0,0,0.75)'
    ctx.font = `${TYPE.weight.medium} 74px ${TYPE.sans}`
    ctx.fillText('new Date()', 34, 92)
    ctx.font = `${TYPE.weight.regular} 22px ${TYPE.sans}`
    ctx.fillText('Help support ZurichJS', 250, 238)
    ctx.fillText('Buy us a coffee or grab a T-Shirt', 250, 266)
    // Three decorative QR-like squares (not scannable).
    for (const [qx, qy] of [[40, 180], [190, 150], [470, 130]] as const) {
      ctx.fillStyle = PALETTE.white
      ctx.fillRect(qx, qy, 74, 74)
      ctx.fillStyle = PALETTE.black
      for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
        if (hash(qx + r * 9 + c) > 0.5) ctx.fillRect(qx + 5 + c * 7, qy + 5 + r * 7, 7, 7)
      }
    }
  })

// ── Zurich Airport ──────────────────────────────────────────────────────────

/** The departures board's header strip: "Abflug · Departures", ZRH yellow on black. */
export const departuresHeader = () =>
  canvasTexture(1024, 96, (ctx, w, h) => {
    ctx.fillStyle = '#0b0c0e'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#f5d000'
    ctx.font = `${TYPE.weight.bold} 52px ${TYPE.sans}`
    ctx.textBaseline = 'middle'
    // A small departing-plane glyph.
    ctx.save()
    ctx.translate(58, h / 2)
    ctx.rotate(-0.35)
    ctx.beginPath()
    ctx.moveTo(-26, 4); ctx.lineTo(26, 4); ctx.lineTo(30, 0); ctx.lineTo(26, -4); ctx.lineTo(-26, -4); ctx.closePath()
    ctx.moveTo(-2, -4); ctx.lineTo(10, -24); ctx.lineTo(16, -24); ctx.lineTo(10, -4); ctx.closePath()
    ctx.moveTo(-2, 4); ctx.lineTo(10, 24); ctx.lineTo(16, 24); ctx.lineTo(10, 4); ctx.closePath()
    ctx.moveTo(-26, -4); ctx.lineTo(-30, -14); ctx.lineTo(-24, -14); ctx.lineTo(-18, -4); ctx.closePath()
    ctx.fill()
    ctx.restore()
    ctx.fillText('Abflug', 110, h / 2 + 2)
    ctx.fillStyle = '#f2f2f2'
    ctx.fillText('Departures', 300, h / 2 + 2)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#f5d000'
    ctx.font = `${TYPE.weight.bold} 46px ${TYPE.mono}`
    ctx.fillText('A 52', w - 40, h / 2 + 2)
  })

/** The gate sign over the desk: black panel, yellow gate number. */
export const gateSign = () =>
  canvasTexture(512, 192, (ctx, w, h) => {
    ctx.fillStyle = '#0b0c0e'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#f5d000'
    ctx.font = `${TYPE.weight.black} 128px ${TYPE.sans}`
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.fillText('A 52', w / 2, h / 2 + 6)
  })

/** One cabin window from inside at night: rounded pane, pale bezel, a few apron lights. */
export const cabinWindow = () =>
  canvasTexture(128, 160, (ctx, w, h) => {
    ctx.fillStyle = '#e8e6e1'
    ctx.fillRect(0, 0, w, h)
    const pane = (x: number, y: number, pw: number, ph: number, r: number) => {
      ctx.beginPath(); ctx.roundRect(x, y, pw, ph, r)
    }
    ctx.fillStyle = '#c9c6bf'
    pane(14, 14, w - 28, h - 28, 40); ctx.fill()
    const g = ctx.createLinearGradient(0, 24, 0, h - 24)
    g.addColorStop(0, '#0c1220')
    g.addColorStop(0.7, '#1a1a22')
    g.addColorStop(1, '#3a2a18')
    ctx.fillStyle = g
    pane(24, 24, w - 48, h - 48, 32); ctx.fill()
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i % 2 ? '#ffd28a' : '#9fc0ff'
      ctx.beginPath(); ctx.arc(36 + hash(i + 900) * (w - 72), h * 0.62 + hash(i + 910) * 18, 2.2, 0, Math.PI * 2); ctx.fill()
    }
  })

/** Cabin carpet: dark grey with a faint fleck. */
export const cabinCarpet = () =>
  canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#3b3e44'
    ctx.fillRect(0, 0, w, h)
    speckle(ctx, w, h, 2400, 41, 'rgba(255,255,255,0.05)', 'rgba(0,0,0,0.12)')
  }, [2, 12])

/** Terminal floor: large pale stone tiles. */
export const loungeTiles = () =>
  canvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#c8c4bb'
    ctx.fillRect(0, 0, w, h)
    speckle(ctx, w, h, 3000, 57, 'rgba(255,255,255,0.08)', 'rgba(0,0,0,0.06)')
    ctx.strokeStyle = 'rgba(0,0,0,0.16)'
    ctx.lineWidth = 2
    for (let i = 0; i <= 4; i++) {
      ctx.beginPath(); ctx.moveTo(i * w / 4, 0); ctx.lineTo(i * w / 4, h); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, i * h / 4); ctx.lineTo(w, i * h / 4); ctx.stroke()
    }
  }, [10, 4.5])

/** Distant terminal windows: rows of warm and cool lit panes on a dark facade. */
export const terminalWindows = () =>
  canvasTexture(1024, 128, (ctx, w, h) => {
    ctx.fillStyle = '#16181c'
    ctx.fillRect(0, 0, w, h)
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 64; i++) {
        const lit = hash(i * 7 + row * 131 + 500) > 0.3
        if (!lit) continue
        ctx.fillStyle = hash(i + row * 50 + 600) > 0.5 ? 'rgba(255,214,150,0.9)' : 'rgba(200,220,255,0.75)'
        ctx.fillRect(i * 16 + 2, 18 + row * 52, 12, 34)
      }
    }
  })
