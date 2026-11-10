import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { slides } from '../content/slides'
import { useDeck } from '../engine/store'
import { STILL } from '../engine/params'
import { keepAwake } from '../engine/activity'
import { FRAME } from '../brand/tokens'
import { CALLER, foifi, FLOOR, PHONE_TURN_SECS, SURFACES as S } from './venue'
import { smoothstep } from './beats'
import { Figure } from './WalkOn'
import { namedPortrait } from './textures'

/** Faris's face and name over the avatar. Crop as in content/travel.ts. */
const FARIS = { name: 'Faris', src: '/team/faris.png', crop: { x: 0.61, y: 0.38, r: 0.33 } } as const
const ON = new Set(['phone', 'phone-full'])
/** Slides where Faris stands in Foifi: on a phone cue, and the slide after (so the camera can leave the phone). */
const SHOWN = slides.map((s, i) => ON.has(s.camera ?? '') || ON.has(slides[i - 1]?.camera ?? ''))

/**
 * Faris in Foifi, booking the first flight on his phone (`phone`), then the
 * road on it (`phone-full`): the deck's avatar in a team shirt, the phone in
 * his right hand. Held portrait, its screen shows the 9:16 column of the frame
 * the `booking` painter draws the app in; as the camera closes in for the
 * road it turns landscape and shows the whole frame. World metres, Foifi.
 */
export function Caller({ frame }: { frame: THREE.Material }) {
  const root = useRef<THREE.Group>(null)
  const pin = useRef<THREE.Sprite>(null)
  const turn = useRef<THREE.Group>(null)
  const tall = useRef<THREE.Mesh>(null)
  const wide = useRef<THREE.Mesh>(null)
  const refs = { arm: useRef<THREE.Group>(null), legs: useRef<(THREE.Group | null)[]>([]) }
  const photo = useTexture(FARIS.src)
  const pinMat = useMemo(() => new THREE.SpriteMaterial({ map: namedPortrait(photo.image as HTMLImageElement, FARIS.crop, FARIS.name), depthTest: false, toneMapped: false }), [photo])
  const [x, , z] = foifi(CALLER.x, 0, CALLER.z)
  const [px, py, pz] = foifi(CALLER.phone.x, CALLER.phone.y, CALLER.phone.z)
  const L = CALLER.phone.long
  const s = (L * 9) / 16
  // Portrait: the 9:16 middle column of the frame, upright.
  const tallGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(s, L)
    const u0 = (FRAME.width - (FRAME.height * 9) / 16) / 2 / FRAME.width
    const uv = g.attributes.uv as THREE.BufferAttribute
    for (let k = 0; k < uv.count; k++) uv.setX(k, u0 + uv.getX(k) * (1 - 2 * u0))
    return g
  }, [L, s])
  // The arm reaches from the shoulder to the bottom of the phone (Figure's arm hangs along −y).
  const armQ = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), new THREE.Vector3(-0.08, -0.15, 0.32).normalize()), [])
  useFrame(() => {
    const st = useDeck.getState()
    const i = st.index
    const cam = slides[i]?.camera
    if (root.current) root.current.visible = !!SHOWN[i]
    if (pin.current) pin.current.visible = cam === 'phone'
    if (refs.arm.current) { refs.arm.current.quaternion.copy(armQ); refs.arm.current.scale.set(1, 0.62, 1) }
    // Turned landscape on the road, in the first half of the camera's move (before the slide changes).
    const since = (performance.now() - st.stepAt) / 1000
    const k = cam !== 'phone-full' ? 0 : STILL || slides[i - 1]?.camera !== 'phone' ? 1 : smoothstep(0.15, PHONE_TURN_SECS * 0.45, since)
    if (turn.current) turn.current.rotation.z = -k * Math.PI / 2
    if (tall.current) tall.current.visible = k < 1
    if (wide.current) wide.current.visible = k >= 1
    if (k > 0 && k < 1) keepAwake(120)
  })
  return (
    <group ref={root} visible={false}>
      <group position={[x, FLOOR, z]} rotation-y={Math.PI}>
        <Figure tee={S.teamShirt} refs={refs} />
        <sprite ref={pin} material={pinMat} position={[0, 2.02, 0]} scale={[0.32, 0.4, 1]} renderOrder={10} />
      </group>
      <group position={[px, py, pz]}>
        {/* The phone body and its portrait screen turn together; the landscape screen takes over once it has turned. */}
        <group ref={turn}>
          <mesh position-z={-0.005}>
            <boxGeometry args={[s + 0.01, L + 0.016, 0.008]} />
            <meshStandardMaterial color={S.ink} roughness={0.35} metalness={0.4} />
          </mesh>
          <mesh ref={tall} geometry={tallGeo} position-z={0.0005} material={frame} />
        </group>
        <mesh ref={wide} position-z={0.0005} material={frame} visible={false}>
          <planeGeometry args={[L, s]} />
        </mesh>
      </group>
    </group>
  )
}
