import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useLoader } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { Atrium } from './Atrium'
import { Booth } from './Booth'
import { FOYER_ASSETS, Foyer } from './Foyer'
import { Hall } from './Hall'
import { PROP_ASSETS, Props } from './Props'
import { Seats } from './Seats'
import { SPONSOR_ASSETS } from './sponsors'
import { ATRIUM, ATRIUM_TOP, CUES, FLOOR, FOYER, HALL_BACK, LIGHTS, M, STAGE_FRONT, STAGE_TOP } from './venue'
import { MapOnly } from './layers'
import { mapLabel } from './textures'

// Load set assets with the module, not on first navigation to a set cue.
useLoader.preload(SVGLoader, PROP_ASSETS.wordmark)
useTexture.preload(PROP_ASSETS.technopark)
useTexture.preload(PROP_ASSETS.rollup)
useTexture.preload(FOYER_ASSETS.skyline)
useTexture.preload(SPONSOR_ASSETS as string[])

/**
 * The physical set around the screen: Technopark Zürich Auditorium, ZurichJS
 * Conf 2026. Authored in metres (see venue.ts) and scaled by M into world
 * units, so the frame plane stays 16 units wide at the origin.
 *
 * `frame` is the medium material: one instance shared by every surface that
 * shows the live slide (side screens, confidence monitor, booth program).
 */
export function Set({ frame }: { frame: THREE.Material }) {
  return (
    <group scale={M}>
      <Lights />
      <MapLabels />
      <Hall frame={frame} />
      <Seats />
      <Suspense fallback={null}>
        <Booth frame={frame} />
        <Props frame={frame} />
        <Foyer frame={frame} />
        <Atrium />
      </Suspense>
    </group>
  )
}

/** Show lighting: house down and warm, a wash on the stage, a pin on the podium. */
function Lights() {
  const washTarget = useMemo(() => {
    const o = new THREE.Object3D()
    o.position.set(0, STAGE_TOP, STAGE_FRONT - 1.8)
    return o
  }, [])
  const pinTarget = useMemo(() => {
    const o = new THREE.Object3D()
    o.position.set(-4.35, STAGE_TOP + 1.0, STAGE_FRONT - 0.7)
    return o
  }, [])
  return (
    <>
      <ambientLight intensity={0.22} color={LIGHTS.houseSky} />
      <hemisphereLight args={[LIGHTS.houseSky, LIGHTS.houseGround, 0.4]} />
      <primitive object={washTarget} />
      <primitive object={pinTarget} />
      <spotLight
        position={[0, FLOOR + 6.4, 8.5]}
        target={washTarget}
        color={LIGHTS.wash}
        intensity={2.4}
        angle={0.5}
        penumbra={0.7}
        decay={0}
      />
      <spotLight
        position={[-2.0, FLOOR + 6.4, 9.0]}
        target={pinTarget}
        color={LIGHTS.wash}
        intensity={1.4}
        angle={0.12}
        penumbra={0.6}
        decay={0}
      />
    </>
  )
}

/** One label per space, facing the map camera. Visible only in the `map` cue. */
const LABELS = [
  { text: 'Auditorium', pos: [0, FLOOR + 12.5, 8] },
  { text: 'Control booth', pos: [-5.5, FLOOR + 9.5, HALL_BACK + 1.5] },
  { text: 'Foyer · Check-in', pos: [4.5, FLOOR + 5, FOYER.start + 7] },
  { text: 'Atrium · Sponsors', pos: [0, ATRIUM_TOP + 2.5, ATRIUM.start + 16] },
] as const

function MapLabel({ text, pos }: { text: string; pos: readonly [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null)
  const map = useMemo(() => mapLabel(text), [text])
  useLayoutEffect(() => {
    const [x, y, z] = CUES.map.pos
    ref.current?.lookAt(x * M, y * M, z * M)
  }, [])
  return (
    <mesh ref={ref} position={pos as unknown as [number, number, number]}>
      <planeGeometry args={[7, 7 * (160 / 1024)]} />
      <meshBasicMaterial map={map} transparent toneMapped={false} depthTest={false} />
    </mesh>
  )
}

function MapLabels() {
  return (
    <MapOnly>
      {LABELS.map((l) => <MapLabel key={l.text} text={l.text} pos={l.pos} />)}
    </MapOnly>
  )
}
