import { slides } from '../content/slides'
import { revealedAt } from '../engine/frame'
import { useDeck } from '../engine/store'
import { STILL } from '../engine/params'

/**
 * Per-slide set state derived once from the deck: how dressed the venue is
 * (carried forward, starts at 1) and which choreographed action plays.
 * Set pieces read these in their frame loop; nothing is allocated on navigation.
 */
export const DRESSED: readonly number[] = (() => {
  let d = 1
  return slides.map((s) => (d = s.dressed ?? d))
})()

/** Seconds since the current slide revealed (after the camera hand-off); large under ?still. */
export const sinceReveal = () => (STILL ? 99 : (performance.now() - revealedAt()) / 1000)

/** The current slide's action, if any. */
export const currentAction = () => slides[useDeck.getState().index]?.action

export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
