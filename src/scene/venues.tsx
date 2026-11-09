import { useLayoutEffect, useRef, type ReactNode } from 'react'
import type * as THREE from 'three'
import type { Space } from './venue'

/**
 * The set's three venues. Only the one the camera is in (or travelling
 * between) is drawn, with its lights: three.js shades every pixel against
 * every visible light, so lights far away cost as much as near ones. The
 * camera rig flips visibility; nothing is created or destroyed.
 */
export type VenueName = 'technopark' | 'foifi' | 'airport'
export const VENUES: readonly VenueName[] = ['technopark', 'foifi', 'airport']

export const VENUE_OF: Readonly<Record<Space, VenueName>> = {
  hall: 'technopark', booth: 'technopark', foyer: 'technopark', atrium: 'technopark', map: 'technopark',
  foifi: 'foifi', plane: 'airport', gate: 'airport', city: 'technopark',
}

const groups: Partial<Record<VenueName, THREE.Object3D>> = {}

/** Show exactly these venues (no allocation: three flags). */
export function showVenues(technopark: boolean, foifi: boolean, airport: boolean) {
  if (groups.technopark) groups.technopark.visible = technopark
  if (groups.foifi) groups.foifi.visible = foifi
  if (groups.airport) groups.airport.visible = airport
}

/** Show the venues of these spaces (and nothing else). */
export function showSpaces(a: Space, b: Space = a) {
  const va = VENUE_OF[a]
  const vb = VENUE_OF[b]
  // The city view sees Technopark and the airport at once.
  const city = a === 'city' || b === 'city'
  showVenues(va === 'technopark' || vb === 'technopark', va === 'foifi' || vb === 'foifi', city || va === 'airport' || vb === 'airport')
}

export function Venue({ name, children }: { name: VenueName; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  useLayoutEffect(() => {
    groups[name] = ref.current!
    return () => { delete groups[name] }
  }, [name])
  return <group ref={ref}>{children}</group>
}
