import { useLayoutEffect, useRef, type ReactNode } from 'react'
import type * as THREE from 'three'

/**
 * Render layers for the set. The camera picks which layers it sees per cue,
 * by mutating its mask (no allocation on navigation):
 *   set      always visible
 *   cutaway  roofs, ceilings, rig: hidden in the `map` cue so you see inside
 *   map      labels that exist only in the `map` cue
 */
export const LAYER = { set: 0, cutaway: 1, map: 2 } as const

export const MASK = {
  normal: (1 << LAYER.set) | (1 << LAYER.cutaway),
  map: (1 << LAYER.set) | (1 << LAYER.map),
  /** Flying to or from the map: no roofs, no labels yet. */
  travel: 1 << LAYER.set,
} as const

/** Put every descendant on one layer (lights excluded: they must stay on `set`). */
function OnLayer({ layer, children }: { layer: number; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  useLayoutEffect(() => {
    ref.current?.traverse((o) => {
      if (!(o as THREE.Light).isLight) o.layers.set(layer)
    })
  })
  return <group ref={ref}>{children}</group>
}

/** Roofs, ceilings and overhead clutter: hidden in the map cutaway. */
export const Cutaway = ({ children }: { children: ReactNode }) => <OnLayer layer={LAYER.cutaway}>{children}</OnLayer>

/** Only visible in the map cue. */
export const MapOnly = ({ children }: { children: ReactNode }) => <OnLayer layer={LAYER.map}>{children}</OnLayer>
