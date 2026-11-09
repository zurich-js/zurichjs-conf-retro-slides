import { useRef, type ReactNode } from 'react'
import type * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useDeck } from '../engine/store'
import { keepAwake } from '../engine/activity'
import { DRESSED, sinceReveal, smoothstep } from './beats'

/** How far a piece sinks below the floor when the venue is bare (metres). */
const SINK = 3.2

/**
 * One piece of the event dressing (booths, backdrop, balloons, signs, merch).
 * Follows the slide's `dressed` (carried forward): building it rises each
 * piece out of the floor in `order`; stripping it is instant, so a bare venue
 * is already bare when the camera arrives. `invert` is for what only exists
 * while the venue is bare (the delivery boxes).
 */
export function Dressing({ order, invert = false, children }: { order: number; invert?: boolean; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  const st = useRef({ index: -1, from: 1, level: -1 })
  useFrame(() => {
    const index = useDeck.getState().index
    const to = DRESSED[index] ?? 1
    const s = st.current
    if (index !== s.index) {
      s.from = s.level < 0 || to < s.level ? to : s.level
      s.index = index
    }
    const t = sinceReveal()
    const start = 0.5 + order * 0.32
    const e = smoothstep(start, start + 1.3, t)
    const level = s.from + (to - s.from) * e
    if (level !== s.level) {
      s.level = level
      const g = ref.current
      if (g) {
        const l = invert ? 1 - level : level
        g.visible = l > 0.001
        g.position.y = (l - 1) * SINK
      }
    }
    if (e < 1 && s.from !== to) keepAwake(120)
  })
  return <group ref={ref}>{children}</group>
}
