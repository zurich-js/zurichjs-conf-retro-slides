import { useMemo } from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { BOOTH, HALL_BACK, LIGHTS, M, SURFACES as S } from './venue'
import { darkApp, holdingSlide, keypad, laptopScreen, mixerScreen, mixerSurface, multiview, sponsorLoop } from './textures'
import { useSponsorLogos } from './useSponsorLogos'

export const BOOTH_ASSETS = { skyline: '/brand/skyline.svg' } as const

/**
 * The control booth behind the back wall, as on the day: two operators at a
 * long desk crowded with monitors, laptops, a switcher, a tablet and the
 * digital mixer, cables everywhere, two big posts framing the glass.
 * The program monitor shows the live frame; the big one runs the sponsor loop.
 * Local origin: centre of the booth floor at the back wall's inner face.
 */

const IN = BOOTH.wall // booth interior starts behind the wall
const DESK = { height: 0.75, depth: 0.95, width: 8.6 }
const TOP = DESK.height + 0.025

function Shell() {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: S.booth, roughness: 0.9, side: THREE.BackSide }), [])
  // The face toward the hall (-z) is open: that is the window side.
  const open = useMemo(() => new THREE.MeshBasicMaterial({ visible: false }), [])
  const h = 3.0
  return (
    <mesh position={[0, h / 2, IN + BOOTH.depth / 2]} material={[mat, mat, mat, mat, mat, open]}>
      <boxGeometry args={[BOOTH.width, h, BOOTH.depth]} />
    </mesh>
  )
}

function Glazing() {
  const w = BOOTH.window
  const h = w.top - w.sill
  const mid = (w.top + w.sill) / 2 - BOOTH.floor
  return (
    <group>
      {[-2.6, 2.6].map((x) => (
        <mesh key={x} position={[x, mid, IN / 2]}>
          <boxGeometry args={[0.3, h, IN]} />
          <meshStandardMaterial color={S.mullion} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, mid, 0.04]}>
        <planeGeometry args={[w.width, h]} />
        <meshStandardMaterial color={S.paper} transparent opacity={0.05} roughness={0.05} depthWrite={false} />
      </mesh>
    </group>
  )
}

/** A monitor on a short stand, screen toward the operators (+z), tilted back. */
function Monitor(p: { x: number; z: number; w: number; h: number; yaw?: number; tilt?: number; lift?: number; material: THREE.Material }) {
  const { x, z, w, h, yaw = 0, tilt = -0.12, lift = 0.18, material } = p
  return (
    <group position={[x, TOP, IN + z]} rotation-y={yaw}>
      <mesh position-y={lift / 2}>
        <boxGeometry args={[0.05, lift, 0.05]} />
        <meshStandardMaterial color={S.plastic} />
      </mesh>
      <mesh position-y={0.005}>
        <boxGeometry args={[0.28, 0.01, 0.2]} />
        <meshStandardMaterial color={S.plastic} />
      </mesh>
      <group position-y={lift + h / 2} rotation-x={tilt}>
        <mesh>
          <boxGeometry args={[w + 0.03, h + 0.03, 0.04]} />
          <meshStandardMaterial color={S.plastic} roughness={0.5} />
        </mesh>
        <mesh position-z={0.021} material={material}>
          <planeGeometry args={[w, h]} />
        </mesh>
      </group>
    </group>
  )
}

function Laptop({ x, z, yaw, screen }: { x: number; z: number; yaw: number; screen: THREE.Texture }) {
  return (
    <group position={[x, TOP, IN + z]} rotation-y={yaw}>
      <mesh position-y={0.008}>
        <boxGeometry args={[0.34, 0.016, 0.23]} />
        <meshStandardMaterial color={S.chrome} metalness={0.6} roughness={0.35} />
      </mesh>
      <group position={[0, 0.016, -0.115]} rotation-x={-0.3}>
        <mesh position-y={0.11}>
          <boxGeometry args={[0.34, 0.22, 0.008]} />
          <meshStandardMaterial color={S.chrome} metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.11, 0.005]}>
          <planeGeometry args={[0.32, 0.2]} />
          <meshBasicMaterial map={screen} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

/** The digital mixer: angled surface plus its upright touchscreen. */
function Mixer() {
  const { map, glow } = useMemo(mixerSurface, [])
  const screen = useMemo(mixerScreen, [])
  const w = 1.15
  const d = 0.65
  return (
    <group position={[2.3, TOP, IN + 0.75]} rotation-y={-0.12}>
      <mesh position-y={0.06}>
        <boxGeometry args={[w, 0.12, d]} />
        <meshStandardMaterial color={S.booth} roughness={0.6} />
      </mesh>
      <mesh position-y={0.121} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[w * 0.96, d * 0.92]} />
        <meshStandardMaterial map={map} emissiveMap={glow} emissive={S.paper} emissiveIntensity={1.1} roughness={0.5} />
      </mesh>
      <group position={[0, 0.3, -d / 2 + 0.05]} rotation-x={-0.25}>
        <mesh>
          <boxGeometry args={[0.62, 0.38, 0.05]} />
          <meshStandardMaterial color={S.booth} roughness={0.5} />
        </mesh>
        <mesh position-z={0.026}>
          <planeGeometry args={[0.56, 0.34]} />
          <meshBasicMaterial map={screen} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

/** The switcher box with a card on top and a row of status LEDs. */
function Switcher() {
  return (
    <group position={[0.35, TOP, IN + 0.45]} rotation-y={0.1}>
      <mesh position-y={0.035}>
        <boxGeometry args={[0.36, 0.07, 0.22]} />
        <meshStandardMaterial color={S.plastic} roughness={0.5} />
      </mesh>
      <mesh position={[-0.02, 0.071, 0.01]} rotation={[-Math.PI / 2, 0, 0.2]}>
        <planeGeometry args={[0.2, 0.14]} />
        <meshStandardMaterial color={S.paper} roughness={0.8} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0.15, 0.06 - i * 0.012, 0.111]}>
          <planeGeometry args={[0.01, 0.006]} />
          <meshBasicMaterial color={i === 1 ? S.uiAmber : S.uiGreen} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

/** Black cables draped across the desk, fixed curves (no randomness). */
function Cables() {
  const paths = useMemo(() => {
    const raw: [number, number, number][][] = [
      [[-2.3, 0, 0.4], [-1.6, 0.02, 0.62], [-0.6, 0.01, 0.55], [0.25, 0.02, 0.45]],
      [[0.45, 0, 0.4], [0.9, 0.03, 0.28], [1.5, 0.01, 0.35], [1.9, 0.02, 0.55]],
      [[-0.6, 0, 0.9], [-0.1, 0.02, 0.7], [0.2, 0.01, 0.55]],
      [[0.5, 0, 0.35], [0.7, 0.04, 0.2], [1.1, 0.01, 0.12], [2.0, 0.02, 0.18]],
      [[-3.3, 0, 0.45], [-2.8, 0.01, 0.3], [-2.3, 0.02, 0.32]],
    ]
    return raw.map((pts) => new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => new THREE.Vector3(x, TOP + 0.008 + y, IN + z))),
      40, 0.006, 6, false,
    ))
  }, [])
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: S.plastic, roughness: 0.6 }), [])
  return <>{paths.map((g, i) => <mesh key={i} geometry={g} material={mat} />)}</>
}

/** An operator as a simple seated avatar from behind: chair, torso, head, arms on the desk. */
function Operator({ x, tee, reach }: { x: number; tee: string; reach: readonly [number, number] }) {
  const z = IN + 1.55
  const seat = 0.5
  const arm = (side: number, toX: number) => {
    const from = new THREE.Vector3(side * 0.2, seat + 0.48, 0)
    const to = new THREE.Vector3(toX - x, TOP + 0.05, -0.55)
    const len = from.distanceTo(to)
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize())
    return (
      <mesh key={side} position={from.clone().add(to).multiplyScalar(0.5)} quaternion={q}>
        <capsuleGeometry args={[0.045, len - 0.09, 4, 10]} />
        <meshStandardMaterial color={tee} roughness={0.9} />
      </mesh>
    )
  }
  return (
    <group position={[x, 0, z]}>
      {/* Office chair */}
      <mesh position-y={seat - 0.03}>
        <boxGeometry args={[0.5, 0.07, 0.48]} />
        <meshStandardMaterial color={S.officeChair} roughness={0.8} />
      </mesh>
      <mesh position={[0, seat + 0.32, 0.26]} rotation-x={0.12}>
        <boxGeometry args={[0.46, 0.55, 0.06]} />
        <meshStandardMaterial color={S.officeChair} roughness={0.8} />
      </mesh>
      <mesh position-y={seat / 2}>
        <cylinderGeometry args={[0.03, 0.03, seat, 10]} />
        <meshStandardMaterial color={S.chrome} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Torso, leaning in toward the desk */}
      <group position-y={seat + 0.05} rotation-x={-0.18}>
        <mesh position-y={0.3}>
          <capsuleGeometry args={[0.17, 0.32, 6, 14]} />
          <meshStandardMaterial color={tee} roughness={0.9} />
        </mesh>
        <mesh position-y={0.66}>
          <sphereGeometry args={[0.11, 20, 14]} />
          <meshStandardMaterial color={S.avatarSkin} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.69, 0.015]} scale={[1.04, 0.85, 1.04]}>
          <sphereGeometry args={[0.112, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={S.avatarHair} roughness={0.9} />
        </mesh>
      </group>
      {arm(-1, reach[0])}
      {arm(1, reach[1])}
    </group>
  )
}

export function Booth({ frame }: { frame: THREE.Material }) {
  const skyline = useTexture(BOOTH_ASSETS.skyline)
  const holding = useMemo(
    () => new THREE.MeshBasicMaterial({ map: holdingSlide(skyline.image as HTMLImageElement), toneMapped: false }),
    [skyline],
  )
  const logos = useSponsorLogos()
  const sponsors = useMemo(() => new THREE.MeshBasicMaterial({ map: sponsorLoop(logos), toneMapped: false }), [logos])
  const mv = useMemo(() => new THREE.MeshBasicMaterial({ map: multiview(), toneMapped: false }), [])
  const pad = useMemo(keypad, [])
  const screens = useMemo(() => ({ dark: darkApp(5), light: laptopScreen(7), tablet: darkApp(13) }), [])
  return (
    <group position={[0, BOOTH.floor, HALL_BACK]}>
      <Shell />
      <Glazing />
      {/* Desk */}
      <mesh position={[0, DESK.height, IN + DESK.depth / 2]}>
        <boxGeometry args={[DESK.width, 0.05, DESK.depth]} />
        <meshStandardMaterial color={S.desk} roughness={0.7} />
      </mesh>
      <mesh position={[0, DESK.height / 2, IN + 0.05]}>
        <boxGeometry args={[DESK.width, DESK.height, 0.06]} />
        <meshStandardMaterial color={S.booth} roughness={0.9} />
      </mesh>
      {/* Left: the big sponsor-loop monitor, program (live frame), multiview. */}
      <Monitor x={-1.95} z={0.38} w={0.95} h={0.54} yaw={0.12} tilt={-0.3} lift={0.12} material={sponsors} />
      <Monitor x={-3.15} z={0.4} w={0.62} h={0.35} yaw={0.35} material={frame} />
      <Monitor x={-3.55} z={0.75} w={0.42} h={0.24} yaw={0.6} lift={0.08} material={mv} />
      {/* Centre: laptops, switcher, water, tablet, keypad. */}
      <Laptop x={-1.95} z={0.98} yaw={0.08} screen={screens.dark} />
      <Laptop x={-0.75} z={0.9} yaw={-0.05} screen={screens.light} />
      <Switcher />
      <mesh position={[1.0, TOP + 0.12, IN + 0.42]}>
        <cylinderGeometry args={[0.035, 0.035, 0.24, 16]} />
        <meshStandardMaterial color={S.paper} roughness={0.4} />
      </mesh>
      <mesh position={[1.0, TOP + 0.255, IN + 0.42]}>
        <cylinderGeometry args={[0.02, 0.02, 0.03, 12]} />
        <meshStandardMaterial color={S.bottleCap} roughness={0.5} />
      </mesh>
      <mesh position={[1.25, TOP + 0.05, IN + 0.95]} rotation={[-1.05, -0.15, 0]}>
        <planeGeometry args={[0.3, 0.2]} />
        <meshBasicMaterial map={screens.tablet} toneMapped={false} />
      </mesh>
      <mesh position={[0.6, TOP + 0.03, IN + 0.85]} rotation-x={-1.1}>
        <planeGeometry args={[0.22, 0.14]} />
        <meshBasicMaterial map={pad} toneMapped={false} />
      </mesh>
      {/* Right: the mixer and a small side monitor. */}
      <Mixer />
      <Monitor x={3.45} z={0.5} w={0.4} h={0.25} yaw={-0.4} material={holding} />
      <Cables />
      <Operator x={-1.35} tee={S.avatarTeeA} reach={[-1.85, -1.05]} />
      <Operator x={2.25} tee={S.avatarTeeB} reach={[1.85, 2.6]} />
      <pointLight position={[0, 2.5, IN + 2.2]} color={LIGHTS.booth} intensity={0.6} decay={0} distance={4.5 * M} />
    </group>
  )
}
