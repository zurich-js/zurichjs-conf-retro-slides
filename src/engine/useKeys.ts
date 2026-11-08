import { useEffect } from 'react'
import { useDeck } from './store'

/**
 *   → / PageDown     next slide        ← / PageUp   previous slide
 *   Enter            next step         Backspace    undo step
 *   0–9              jump to slide     f            fullscreen
 *
 * Space is deliberately unbound: clickers often map it to "next", and a
 * presenter who thinks they changed slide but ran a step has a bad afternoon.
 */
export function useKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      const d = useDeck.getState()
      if (e.key === 'ArrowRight' || e.key === 'PageDown') d.next()
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') d.prev()
      else if (e.key === 'Enter') d.runStep()
      else if (e.key === 'Backspace') d.undoStep()
      else if (/^[0-9]$/.test(e.key)) d.goto(Number(e.key))
      else if (e.key === 'f') void document.documentElement.requestFullscreen?.()
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
