import { FRAME, MOTION } from '../brand/tokens'
import { STILL } from './params'
import { getVisual } from '../content/visuals'
import { slides } from '../content/slides'
import { drawTiming, paintVisual } from '../painters'
import { useDeck } from './store'

/** cubic-bezier easing solved numerically — matches the site's --easing-smooth. */
function bezier([x1, y1, x2, y2]: readonly [number, number, number, number]) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by
  const x = (t: number) => ((ax * t + bx) * t + cx) * t
  const y = (t: number) => ((ay * t + by) * t + cy) * t
  return (p: number) => {
    let t = p
    for (let i = 0; i < 6; i++) {
      const dx = 3 * ax * t * t + 2 * bx * t + cx
      if (Math.abs(dx) < 1e-6) break
      t -= (x(t) - p) / dx
    }
    return y(Math.min(1, Math.max(0, t)))
  }
}
export const ease = bezier(MOTION.ease)

export function createFrameCanvas(): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = FRAME.width
  c.height = FRAME.height
  return c
}

/**
 * Paint the current deck state. Returns true while still animating, so
 * callers can stop repainting (and stop re-uploading a texture) once settled.
 */
export function paintCurrent(ctx: CanvasRenderingContext2D, now: number): boolean {
  const { index, step, stepAt } = useDeck.getState()
  const id = slides[index]?.steps[step]
  const visual = id ? getVisual(id) : undefined
  const timing = drawTiming(visual)
  const raw = STILL ? 1 : Math.min(1, (now - stepAt) / 1000 / timing.secs)
  paintVisual(ctx, visual, timing.linear ? raw : ease(raw))
  return raw < 1
}
