import { useEffect, useRef } from 'react'
import { slides } from '../content/slides'
import { getVisual } from '../content/visuals'
import { paintVisual } from '../painters'
import type { Slide } from '../engine/types'

/** `?index` — every slide at its final step, settled. Click to open. */
function Card({ slide, n }: { slide: Slide; n: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const ctx = ref.current?.getContext('2d')
    const last = slide.steps[slide.steps.length - 1]
    if (!ctx || !last) return
    let raf = 0
    let tries = 0
    // Repaint a few frames so late-decoding images land.
    const paint = () => {
      paintVisual(ctx, getVisual(last), 1)
      if (++tries < 30) raf = requestAnimationFrame(paint)
    }
    paint()
    return () => cancelAnimationFrame(raf)
  }, [slide])
  return (
    <a className="card" href={`?slide=${slide.id}`}>
      <canvas ref={ref} width={2560} height={1440} />
      <span>{n}. {slide.id}{slide.beat ? ` · ${slide.beat}` : ''}</span>
    </a>
  )
}

export function SlideIndex() {
  return (
    <main className="index">
      {slides.map((s, i) => <Card key={s.id} slide={s} n={i} />)}
    </main>
  )
}
