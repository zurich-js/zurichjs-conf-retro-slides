/**
 * When the 3D stage needs to draw. The canvas renders on demand: a frame is
 * drawn only while something is moving. Anything that animates calls
 * keepAwake(ms) while it does; `continuous` covers scenes that sway on their
 * own (the badge test stand). Navigation keeps the stage awake long enough
 * for the camera move, the hand-off and the props that follow it.
 */
let until = 0
let continuous = false

export const keepAwake = (ms: number) => {
  const t = performance.now() + ms
  if (t > until) until = t
}
export const setContinuous = (on: boolean) => { continuous = on }
export const isAwake = (now: number) => continuous || now < until
