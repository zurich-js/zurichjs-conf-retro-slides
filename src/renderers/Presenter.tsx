import { useEffect, useRef, useState } from 'react'
import { slides } from '../content/slides'
import { getVisual } from '../content/visuals'
import { paintCurrent } from '../engine/frame'
import { useDeck } from '../engine/store'
import { paintVisual } from '../painters'

/**
 * `?presenter` — open in a second window on the laptop screen. Shows the live
 * frame, what Enter/→ will show next, notes and a timer. Navigation here drives
 * the audience window (and vice versa) over BroadcastChannel.
 */
function Live() {
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
  return <canvas ref={ref} width={2560} height={1440} />
}

/** What the next arrow press shows: the next slide. */
function Next({ index }: { index: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const id = slides[index + 1]?.steps[0]
  useEffect(() => {
    const ctx = ref.current?.getContext('2d')
    if (!ctx) return
    let raf = 0
    let n = 0
    const paint = () => {
      paintVisual(ctx, id ? getVisual(id) : undefined, 1)
      if (++n < 20) raf = requestAnimationFrame(paint) // let late images land
    }
    paint()
    return () => cancelAnimationFrame(raf)
  }, [id])
  return (
    <figure>
      <figcaption>{id ? 'Next slide · →' : 'End of deck'}</figcaption>
      <canvas ref={ref} width={2560} height={1440} />
    </figure>
  )
}

function Timer() {
  const [start, setStart] = useState(() => performance.now())
  const [now, setNow] = useState(start)
  useEffect(() => {
    const t = setInterval(() => setNow(performance.now()), 250)
    return () => clearInterval(t)
  }, [])
  const s = Math.max(0, Math.floor((now - start) / 1000))
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return (
    <button type="button" className="timer" onClick={() => setStart(performance.now())} title="Click to reset">
      {mm}:{ss}
    </button>
  )
}

export function Presenter() {
  const index = useDeck((s) => s.index)
  const slide = slides[index]
  return (
    <main className="presenter">
      <section className="live">
        <Live />
        <p className="meta">
          {index + 1} / {slides.length} · <b>{slide?.id}</b>
          {slide?.beat ? ` · ${slide.beat}` : ''}
        </p>
      </section>
      <aside>
        <Timer />
        <Next index={index} />
        <div className="notes">{slide?.notes ?? 'No notes.'}</div>
      </aside>
    </main>
  )
}
