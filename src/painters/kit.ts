import { FRAME, MOTION, type Roles, TYPE } from '../brand/tokens'
import { INDEX, PRESENTER, STILL } from '../engine/params'

const MUTED = PRESENTER || STILL || INDEX

/** Shared drawing primitives. Painters compose these; nothing here knows about slides. */

export type Ctx = CanvasRenderingContext2D

export const SAFE = {
  left: FRAME.safe.x,
  right: FRAME.width - FRAME.safe.x,
  top: FRAME.safe.y,
  bottom: FRAME.height - FRAME.safe.y,
  width: FRAME.width - FRAME.safe.x * 2,
  height: FRAME.height - FRAME.safe.y * 2,
}

export const font = (size: number, weight: number = TYPE.weight.regular, family: string = TYPE.sans) =>
  `${weight} ${size}px ${family}`

export function clear(ctx: Ctx, r: Roles) {
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.globalAlpha = 1
  ctx.fillStyle = r.bg
  ctx.fillRect(0, 0, FRAME.width, FRAME.height)
  ctx.restore()
}

export function text(
  ctx: Ctx,
  value: string,
  x: number,
  y: number,
  o: { size: number; weight?: number; color: string; align?: CanvasTextAlign; tracking?: number; family?: string; alpha?: number },
) {
  ctx.save()
  ctx.font = font(o.size, o.weight, o.family)
  ctx.fillStyle = o.color
  ctx.textAlign = o.align ?? 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.globalAlpha *= o.alpha ?? 1
  ctx.letterSpacing = `${(o.tracking ?? 0) * o.size}px`
  ctx.fillText(value, x, y)
  ctx.restore()
}

/** Greedy word wrap with the real font metrics. Cached: painters run every frame. */
const wrapCache = new Map<string, string[]>()
export function wrap(ctx: Ctx, value: string, maxWidth: number, size: number, weight: number): string[] {
  const key = `${size}|${weight}|${maxWidth}|${value}`
  const hit = wrapCache.get(key)
  if (hit) return hit
  ctx.save()
  ctx.font = font(size, weight)
  const lines: string[] = []
  for (const para of value.split('\n')) {
    let line = ''
    for (const word of para.split(/\s+/)) {
      const test = line ? `${line} ${word}` : word
      if (line && ctx.measureText(test).width > maxWidth) {
        lines.push(line)
        line = word
      } else line = test
    }
    lines.push(line)
  }
  ctx.restore()
  wrapCache.set(key, lines)
  return lines
}
export const clearWrapCache = () => wrapCache.clear()

/** Mono uppercase label: kickers, chart labels, sources. */
export function label(ctx: Ctx, value: string, x: number, y: number, color: string, o: { alpha?: number; align?: CanvasTextAlign; size?: number } = {}) {
  text(ctx, value.toUpperCase(), x, y, {
    size: o.size ?? TYPE.size.label,
    weight: TYPE.weight.medium,
    family: TYPE.mono,
    color,
    tracking: TYPE.tracking.label,
    alpha: o.alpha,
    align: o.align,
  })
}

/** Fade + rise: the deck's one entrance motion. Call inside save/restore. */
export function enter(ctx: Ctx, p: number, rise: number = MOTION.rise) {
  ctx.globalAlpha *= p
  ctx.translate(0, (1 - p) * rise)
}

/** Remaps a 0..1 progress to a sub-window, for staggering elements. */
export const window01 = (p: number, from: number, to: number) =>
  Math.min(1, Math.max(0, (p - from) / (to - from)))

const images = new Map<string, HTMLImageElement>()
/** Returns the image once decoded, else null (the frame loop repaints until it lands). */
export function image(src: string): HTMLImageElement | null {
  let img = images.get(src)
  if (!img) {
    img = new Image()
    img.src = src
    images.set(src, img)
  }
  return img.complete && img.naturalWidth > 0 ? img : null
}
export function preloadImages(srcs: Iterable<string>): Promise<unknown> {
  return Promise.all([...srcs].map((s) => { const i = new Image(); i.src = s; images.set(s, i); return i.decode().catch(() => {}) }))
}

const videos = new Map<string, HTMLVideoElement>()
/**
 * One <video> per clip, never in the DOM: the `video` painter draws its
 * current frame onto the frame canvas. Muted in ?presenter and ?still (the
 * audience window carries the sound).
 */
export function video(src: string): HTMLVideoElement {
  let el = videos.get(src)
  if (!el) {
    el = document.createElement('video')
    el.src = src
    el.preload = 'auto'
    el.playsInline = true
    el.muted = MUTED
    videos.set(src, el)
  }
  return el
}
let videoBusy = false
/** A painter drew a clip that has no frame yet (loading or seeking): keep repainting. */
export const markVideoBusy = (busy: boolean) => { videoBusy = busy }
export const videoPending = () => videoBusy

/** Pause every clip except `keep` (navigation away from a video slide stops it). */
export function pauseVideos(keep?: string) {
  for (const [src, el] of videos) if (src !== keep && !el.paused) el.pause()
}
export function preloadVideos(srcs: Iterable<string>) {
  for (const s of srcs) video(s).load()
}

/** Persistent chrome: the conf wordmark bottom-left, matched to the ground. Nothing else. */
export function chrome(ctx: Ctx, r: Roles) {
  const mark = image(r.wordmark)
  if (!mark) return
  const h = 48
  const w = (mark.naturalWidth / mark.naturalHeight) * h
  ctx.save()
  // Bottom edge 96px clear of the frame edge: projectors and the medium eat edges.
  ctx.drawImage(mark, SAFE.left, FRAME.height - 96 - h, w, h)
  ctx.restore()
}
