import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useDeck } from '../engine/store'
import { STILL } from '../engine/params'
import { keepAwake } from '../engine/activity'
import { currentAction, sinceReveal, smoothstep } from './beats'
import { FLOOR, PODIUM, podium, STAGE_TOP, SURFACES as S } from './venue'
import { useTeamPrint } from './Avatar'
import { useTexture } from '@react-three/drei'
import { namedPortrait } from './textures'

/** Nadja miked up every speaker (Faris): her face over the organiser in the wings. Crop as in content/travel.ts. */
export const MIC_HANDLER = { name: 'Nadja', src: '/team/nadja.png', crop: { x: 0.47, y: 0.43, r: 0.27 } } as const

/**
 * Stage transitions (Nadja): a speaker is fitted with a headset mic by an
 * organiser in the wings, checked, then walks up the side steps to the
 * podium. `action: 'mic-up'` plays the fitting (timed from the reveal);
 * `action: 'walk-on'` walks the speaker (timed from the key press, so it
 * moves with the camera's choreographed entrance on the `walk-on` cue).
 * The figures exist only on those slides (the speaker also stands beside
 * the podium for `plug-in`). Metres, hall frame.
 */
const WINGS = { speaker: [-7.1, 1.0] as const, handler: [-7.1, 1.68] as const }
/** The speaker's route: wings, the two side steps, across the stage, behind the podium. */
const SPOT = podium(0, 0, -0.55)
const ROUTE: readonly (readonly [number, number, number])[] = [
  [WINGS.speaker[0], FLOOR, WINGS.speaker[1]],
  [-6.35, FLOOR, 1.2],
  [-6.05, FLOOR + 0.15, 1.2],
  [-5.5, FLOOR + 0.3, 1.25],
  [-5.0, STAGE_TOP, 1.5],
  [SPOT[0] - 0.15, STAGE_TOP, SPOT[2] - 0.25],
  [SPOT[0], STAGE_TOP, SPOT[2]],
]
/** Matches the camera's choreographed entrance (Stage.tsx moveDuration, reveal). */
const WALK_SECS = 4.6
const sine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2

/** A simple figure in the deck's avatar language, with arms and legs that can move. */
function Figure({ tee, refs }: { tee: string; refs: { arm: React.RefObject<THREE.Group | null>; legs: React.RefObject<(THREE.Group | null)[]> } }) {
  const print = useTeamPrint()
  return (
    <group>
      {tee === S.teamShirt && (
        <mesh position={[0, 1.27, -0.183]} rotation-y={Math.PI}>
          <planeGeometry args={[0.26, 0.16]} />
          <meshStandardMaterial map={print} transparent roughness={0.9} />
        </mesh>
      )}
      {[-1, 1].map((s, i) => (
        <group key={s} position={[s * 0.1, 0.84, 0]} ref={(g) => { refs.legs.current[i] = g }}>
          <mesh position-y={-0.42}>
            <capsuleGeometry args={[0.07, 0.74, 4, 10]} />
            <meshStandardMaterial color={S.avatarPants} roughness={0.9} />
          </mesh>
        </group>
      ))}
      <mesh position-y={1.2}>
        <capsuleGeometry args={[0.18, 0.4, 6, 14]} />
        <meshStandardMaterial color={tee} roughness={0.9} />
      </mesh>
      {/* Left arm hangs; the right arm is jointed at the shoulder. */}
      <mesh position={[-0.25, 1.12, 0.02]} rotation-z={-0.08}>
        <capsuleGeometry args={[0.05, 0.5, 4, 10]} />
        <meshStandardMaterial color={tee} roughness={0.9} />
      </mesh>
      <group position={[0.25, 1.4, 0.02]} ref={refs.arm}>
        <mesh position-y={-0.28} rotation-z={0.08}>
          <capsuleGeometry args={[0.05, 0.5, 4, 10]} />
          <meshStandardMaterial color={tee} roughness={0.9} />
        </mesh>
      </group>
      <mesh position-y={1.6}>
        <sphereGeometry args={[0.11, 20, 14]} />
        <meshStandardMaterial color={S.avatarSkin} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.63, -0.015]} scale={[1.04, 0.85, 1.04]}>
        <sphereGeometry args={[0.112, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={S.avatarHair} roughness={0.9} />
      </mesh>
    </group>
  )
}

/** A green tick in a circle, drawn once. */
function tick(): THREE.CanvasTexture {
  const N = 128
  const c = document.createElement('canvas')
  c.width = c.height = N
  const ctx = c.getContext('2d')!
  ctx.fillStyle = S.uiGreen
  ctx.beginPath(); ctx.arc(N / 2, N / 2, N / 2 - 2, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = S.paper
  ctx.lineWidth = 14
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath(); ctx.moveTo(34, 66); ctx.lineTo(55, 87); ctx.lineTo(95, 42); ctx.stroke()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function WalkOn() {
  const speaker = useRef<THREE.Group>(null)
  const handler = useRef<THREE.Group>(null)
  const sp = { arm: useRef<THREE.Group>(null), legs: useRef<(THREE.Group | null)[]>([]) }
  const hd = { arm: useRef<THREE.Group>(null), legs: useRef<(THREE.Group | null)[]>([]) }
  const boom = useRef<THREE.Group>(null)
  const pack = useRef<THREE.Mesh>(null)
  const led = useRef<THREE.MeshBasicMaterial>(null)
  const check = useRef<THREE.Sprite>(null)
  const checkMat = useMemo(() => new THREE.SpriteMaterial({ map: tick(), depthTest: false, toneMapped: false }), [])
  const nadjaPhoto = useTexture(MIC_HANDLER.src)
  const nadjaMat = useMemo(() => new THREE.SpriteMaterial({ map: namedPortrait(nadjaPhoto.image as HTMLImageElement, MIC_HANDLER.crop, MIC_HANDLER.name), depthTest: false, toneMapped: false }), [nadjaPhoto])
  const nadja = useRef<THREE.Sprite>(null)
  const route = useMemo(() => new THREE.CatmullRomCurve3(ROUTE.map(([x, y, z]) => new THREE.Vector3(x, y, z)), false, 'centripetal', 0.2), [])
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), t: new THREE.Vector3() }), [])
  useFrame(() => {
    const action = currentAction()
    const on = action === 'mic-up' || action === 'walk-on' || action === 'plug-in'
    if (speaker.current) speaker.current.visible = on
    if (handler.current) handler.current.visible = action === 'mic-up' || action === 'walk-on'
    if (nadja.current) nadja.current.visible = action === 'mic-up'
    if (!on) return
    const s = speaker.current!
    // The organiser stands in front of the speaker for the fitting, then steps back against the wall.
    if (action === 'mic-up') handler.current?.position.set(WINGS.handler[0], FLOOR, WINGS.handler[1])
    else handler.current?.position.set(-7.5, FLOOR, -0.15)
    if (action === 'plug-in') {
      // Beside the podium while the cables go in (the camera looks over this shoulder).
      const [x, , z] = podium(-0.66, 0, -0.42)
      s.position.set(x, STAGE_TOP, z)
      s.rotation.y = PODIUM.yaw + 0.5
      sp.legs.current.forEach((l) => l && (l.rotation.x = 0))
      return
    }
    if (action === 'mic-up') {
      const t = sinceReveal()
      s.position.set(WINGS.speaker[0], FLOOR, WINGS.speaker[1])
      s.rotation.y = 0
      // The organiser reaches up to the speaker's ear, then steps back.
      const reach = smoothstep(0.3, 1.2, t) * (1 - smoothstep(2.2, 2.9, t))
      if (hd.arm.current) hd.arm.current.rotation.set(-reach * 1.9, 0, -reach * 0.5)
      if (pack.current) pack.current.visible = t > 0.9
      if (boom.current) boom.current.scale.setScalar(Math.max(0.001, smoothstep(1.2, 1.9, t)))
      if (led.current) led.current.color.set(t > 2.7 ? S.uiGreen : S.uiRed)
      if (check.current) {
        const k = smoothstep(3.0, 3.4, t)
        check.current.visible = k > 0
        check.current.scale.setScalar(0.32 * k)
      }
      sp.legs.current.forEach((l) => l && (l.rotation.x = 0))
      if (t < 4) keepAwake(120)
    } else {
      // Walk with the camera: from the key press, eased like its entrance.
      // The speaker leads: arrives at 75% of the camera's move, so the camera always follows behind.
      const t = STILL ? 1 : Math.min(1, (performance.now() - useDeck.getState().stepAt) / 1000 / (WALK_SECS * 0.75))
      const e = sine(t)
      route.getPointAt(e, tmp.p)
      s.position.copy(tmp.p)
      route.getTangentAt(Math.min(e, 0.98), tmp.t)
      const heading = Math.atan2(tmp.t.x, tmp.t.z)
      // Turn to face the room for the last steps.
      s.rotation.y = THREE.MathUtils.lerp(heading, PODIUM.yaw, smoothstep(0.85, 1, e))
      const stride = t < 1 ? Math.sin(t * WALK_SECS * 7) * 0.45 * (1 - smoothstep(0.85, 1, e)) : 0
      sp.legs.current.forEach((l, i) => l && (l.rotation.x = i ? stride : -stride))
      if (hd.arm.current) hd.arm.current.rotation.set(0, 0, 0)
      if (boom.current) boom.current.scale.setScalar(1)
      if (pack.current) pack.current.visible = true
      if (led.current) led.current.color.set(S.uiGreen)
      if (check.current) check.current.visible = false
      if (t < 1) keepAwake(120)
    }
  })
  return (
    <group>
      <group ref={speaker} visible={false}>
        <Figure tee={S.avatarTeeB} refs={sp} />
        {/* Headset: an ear piece and the boom to the mouth. */}
        <group ref={boom} position={[0.105, 1.6, 0]}>
          <mesh>
            <sphereGeometry args={[0.022, 10, 8]} />
            <meshStandardMaterial color={S.desk} roughness={0.5} />
          </mesh>
          <mesh position={[-0.01, -0.035, 0.06]} rotation={[0.45, -0.5, 0]}>
            <boxGeometry args={[0.008, 0.008, 0.13]} />
            <meshStandardMaterial color={S.desk} roughness={0.5} />
          </mesh>
        </group>
        {/* Belt pack at the back of the waist, its light red until the check passes. */}
        <mesh ref={pack} position={[0.06, 0.98, -0.19]} visible={false}>
          <boxGeometry args={[0.07, 0.1, 0.03]} />
          <meshStandardMaterial color={S.plastic} roughness={0.5} />
          <mesh position={[0.02, 0.04, -0.016]}>
            <circleGeometry args={[0.008, 8]} />
            <meshBasicMaterial ref={led} color={S.uiRed} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        </mesh>
        <sprite ref={check} material={checkMat} position={[0.2, 2.0, 0]} visible={false} renderOrder={10} />
      </group>
      {/* The organiser who runs the stage door: team shirt. */}
      <group ref={handler} visible={false} position={[WINGS.handler[0], FLOOR, WINGS.handler[1]]} rotation-y={Math.PI}>
        <Figure tee={S.teamShirt} refs={hd} />
        {/* Who it is: Nadja's face and name over her head (mic-up only). */}
        <sprite ref={nadja} material={nadjaMat} position={[0, 1.98, 0]} scale={[0.32, 0.4, 1]} renderOrder={10} visible={false} />
      </group>
    </group>
  )
}
