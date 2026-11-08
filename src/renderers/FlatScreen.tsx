import { useEffect, useRef } from 'react'
import { paintCurrent } from '../engine/frame'
import { useDeck } from '../engine/store'

/**
 * `?flat` — the slide canvas painted straight to the page. No WebGL.
 * What you see here is exactly what lands on the 3D screen, minus the medium.
 */
export function FlatScreen() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const ctx = ref.current?.getContext('2d')
    if (!ctx) return
    let raf = 0
    let animating = true
    const loop = (now: number) => {
      if (animating) animating = paintCurrent(ctx, now)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    const unsub = useDeck.subscribe(() => { animating = true })
    return () => { cancelAnimationFrame(raf); unsub() }
  }, [])
  return <canvas ref={ref} width={2560} height={1440} className="flat" />
}
