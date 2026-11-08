import { create } from 'zustand'
import { slides } from '../content/slides'

/**
 * Which slide and which step. Shared across the R3F <Canvas> boundary.
 *
 *   arrows → slides, and only slides (one press = one slide)
 *   Enter  → next step within the slide; Backspace undoes
 *
 * Arriving at a slide always resets to step 0 so a beat looks the same from
 * either direction. `stepAt` timestamps the step for draw-in animation.
 */
const THROTTLE_MS = 160
const clamp = (i: number) => Math.max(0, Math.min(i, slides.length - 1))

function indexFromUrl(): number {
  const raw = new URLSearchParams(window.location.search).get('slide')
  if (!raw) return 0
  const byId = slides.findIndex((s) => s.id === raw)
  if (byId !== -1) return byId
  const n = Number(raw)
  return Number.isInteger(n) ? clamp(n) : 0
}

function syncUrl(index: number) {
  const url = new URL(window.location.href)
  url.searchParams.set('slide', slides[index]?.id ?? String(index))
  window.history.replaceState(null, '', url)
}

interface DeckState {
  index: number
  step: number
  stepAt: number
  lastNavAt: number
  next: () => void
  prev: () => void
  goto: (i: number) => void
  runStep: () => void
  undoStep: () => void
}

/**
 * Every window of the deck (audience + ?presenter) shares position over a
 * BroadcastChannel — same origin, no server, works offline. A window that
 * navigates broadcasts; receivers apply without re-broadcasting.
 */
const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('zurichjs-deck')
type Sync = { index: number; step: number }

export const useDeck = create<DeckState>()((set, get) => {
  const arrive = (i: number) => {
    const t = performance.now()
    if (t - get().lastNavAt < THROTTLE_MS) return
    const index = clamp(i)
    syncUrl(index)
    set({ index, step: 0, stepAt: t, lastNavAt: t })
    channel?.postMessage({ index, step: 0 } satisfies Sync)
  }
  channel?.addEventListener('message', (e: MessageEvent<Sync>) => {
    const { index, step } = e.data
    if (index === get().index && step === get().step) return
    syncUrl(index)
    set({ index, step, stepAt: performance.now(), lastNavAt: performance.now() })
  })
  const setStep = (step: number, stepAt: number) => {
    set({ step, stepAt })
    channel?.postMessage({ index: get().index, step } satisfies Sync)
  }
  // ?step=<n> deep-links to a step of the linked slide (screenshots, review).
  const index0 = indexFromUrl()
  const step0 = Math.max(0, Math.min(Number(new URLSearchParams(window.location.search).get('step') ?? 0) || 0, (slides[index0]?.steps.length ?? 1) - 1))
  return {
    index: index0,
    step: step0,
    stepAt: performance.now(),
    lastNavAt: 0,
    next: () => arrive(get().index + 1),
    prev: () => arrive(get().index - 1),
    goto: (i) => arrive(i),
    runStep: () => {
      const { index, step } = get()
      const max = (slides[index]?.steps.length ?? 1) - 1
      if (step < max) setStep(step + 1, performance.now())
    },
    undoStep: () => {
      const { step } = get()
      if (step > 0) setStep(step - 1, performance.now() - 1e6) // land settled
    },
  }
})
