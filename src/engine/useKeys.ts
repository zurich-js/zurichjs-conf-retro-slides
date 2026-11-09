import { useEffect } from 'react'
import { useDeck } from './store'
import { INDEX, PRESENTER } from './params'

/**
 *   → / PageDown     next slide        ← / PageUp   previous slide
 *   0–9              jump to slide     f            fullscreen
 *
 * Space is deliberately unbound: clickers often map it to "next", and a
 * presenter who thinks they changed slide but ran a step has a bad afternoon.
 *
 * Touch (phones, tablets): swipe left for next, right for previous; or tap
 * the right two thirds for next, the left third for previous. Not on the
 * index (it scrolls) or the presenter view (it has its own controls).
 */
export function useKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      const d = useDeck.getState()
      if (e.key === 'ArrowRight' || e.key === 'PageDown') d.next()
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') d.prev()
      else if (/^[0-9]$/.test(e.key)) d.goto(Number(e.key))
      else if (e.key === 'f') void document.documentElement.requestFullscreen?.()
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)

    const touch = !INDEX && !PRESENTER
    let x0 = 0, y0 = 0, t0 = 0, tracking = false
    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) { tracking = false; return }
      tracking = true
      x0 = e.touches[0]!.clientX; y0 = e.touches[0]!.clientY; t0 = performance.now()
    }
    const onEnd = (e: TouchEvent) => {
      if (!tracking) return
      tracking = false
      const p = e.changedTouches[0]!
      const dx = p.clientX - x0, dy = p.clientY - y0
      const d = useDeck.getState()
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        if (dx < 0) d.next(); else d.prev()
      } else if (Math.hypot(dx, dy) < 12 && performance.now() - t0 < 400) {
        if (p.clientX > window.innerWidth / 3) d.next(); else d.prev()
      } else return
      e.preventDefault()
    }
    if (touch) {
      window.addEventListener('touchstart', onStart, { passive: true })
      window.addEventListener('touchend', onEnd, { passive: false })
      document.documentElement.classList.add('deck-touch')
    }
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchend', onEnd)
    }
  }, [])
}
