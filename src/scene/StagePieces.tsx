import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { currentAction } from './beats'
import { FLOOR, hashSeed, STAGE, STAGE_FRONT, STAGE_TOP, SURFACES as S } from './venue'

/**
 * Stage set pieces from the aftermovie:
 * - the tall round table with an iPad used for the live-drawing talk, always
 *   on stage right;
 * - the e18e panel (`action: 'panel'`): five chairs and a low table centre
 *   stage, five panellists seated;
 * - the group photo (`action: 'group-photo'`): everyone on and in front of
 *   the stage. The foam letters are lifted to the front by Props.
 * Metres, hall frame.
 */
export function StagePieces() {
  return (
    <group>
      <DrawingTable />
      <Panel />
      <GroupPhoto />
    </group>
  )
}

function DrawingTable() {
  return (
    <group position={[3.4, STAGE_TOP, STAGE_FRONT - 1.2]}>
      <mesh position-y={0.55}><cylinderGeometry args={[0.025, 0.025, 1.1, 10]} /><meshStandardMaterial color={S.steel} metalness={0.5} roughness={0.4} /></mesh>
      <mesh position-y={0.01}><cylinderGeometry args={[0.25, 0.25, 0.02, 20]} /><meshStandardMaterial color={S.steel} metalness={0.5} roughness={0.4} /></mesh>
      <mesh position-y={1.1}><cylinderGeometry args={[0.32, 0.32, 0.03, 28]} /><meshStandardMaterial color={S.woodDark} roughness={0.5} /></mesh>
      <mesh position={[0, 1.125, 0.02]} rotation-x={-Math.PI / 2} rotation-z={0.3}>
        <planeGeometry args={[0.25, 0.18]} />
        <meshStandardMaterial color={S.bezel} roughness={0.3} />
      </mesh>
    </group>
  )
}

/** One seated person: thighs, torso, head; facing +z. */
function Seated({ x, z, yaw, shirt }: { x: number; z: number; yaw: number; shirt: string }) {
  return (
    <group position={[x, STAGE_TOP, z]} rotation-y={yaw}>
      <mesh position={[0, 0.47, 0.12]} rotation-x={Math.PI / 2}><capsuleGeometry args={[0.13, 0.25, 4, 8]} /><meshStandardMaterial color={S.avatarPants} roughness={0.9} /></mesh>
      <mesh position={[0, 0.25, 0.3]}><capsuleGeometry args={[0.07, 0.35, 4, 8]} /><meshStandardMaterial color={S.avatarPants} roughness={0.9} /></mesh>
      <mesh position-y={0.82}><capsuleGeometry args={[0.17, 0.36, 6, 12]} /><meshStandardMaterial color={shirt} roughness={0.9} /></mesh>
      <mesh position-y={1.22}><sphereGeometry args={[0.11, 16, 12]} /><meshStandardMaterial color={S.avatarSkin} roughness={0.8} /></mesh>
    </group>
  )
}

function Panel() {
  const ref = useRef<THREE.Group>(null)
  useFrame(() => { if (ref.current) ref.current.visible = currentAction() === 'panel' })
  const seats = [-2.4, -1.2, 0, 1.2, 2.4]
  const shirts = [S.avatarTeeA, S.chairRed, S.avatarTeeB, S.toteBlue, S.leafDark]
  return (
    <group ref={ref} visible={false}>
      {seats.map((x, i) => {
        const z = STAGE_FRONT - 2.1 + Math.abs(x) * 0.18
        const yaw = -x * 0.12
        return (
          <group key={x}>
            <group position={[x, STAGE_TOP, z]} rotation-y={yaw}>
              <mesh position-y={0.44}><boxGeometry args={[0.5, 0.06, 0.48]} /><meshStandardMaterial color={S.clothBlack} roughness={0.8} /></mesh>
              <mesh position={[0, 0.72, -0.22]}><boxGeometry args={[0.5, 0.5, 0.05]} /><meshStandardMaterial color={S.clothBlack} roughness={0.8} /></mesh>
              {[-0.2, 0.2].flatMap((sx) => [-0.2, 0.2].map((sz) => <mesh key={`${sx}${sz}`} position={[sx, 0.21, sz]}><boxGeometry args={[0.03, 0.42, 0.03]} /><meshStandardMaterial color={S.steel} /></mesh>))}
            </group>
            <Seated x={x} z={z} yaw={yaw} shirt={shirts[i]!} />
          </group>
        )
      })}
      <mesh position={[0, STAGE_TOP + 0.22, STAGE_FRONT - 1.2]}><cylinderGeometry args={[0.45, 0.45, 0.44, 24]} /><meshStandardMaterial color={S.paper} roughness={0.5} /></mesh>
    </group>
  )
}

/** Rows of people on the stage, and a crouching row in front of it. */
function GroupPhoto() {
  const ref = useRef<THREE.Group>(null)
  useFrame(() => { if (ref.current) ref.current.visible = currentAction() === 'group-photo' })
  const people = useMemo(() => {
    const out: { x: number; y: number; z: number; s: number }[] = []
    const half = STAGE.width / 2 - 0.5
    const rows = [0.75, 1.45, 2.15, 2.85]
    rows.forEach((z, r) => {
      const n = 15 - (r % 2)
      for (let i = 0; i < n; i++) out.push({ x: -half + (i + (r % 2) * 0.5) * (2 * half / 14) + (hashSeed(r * 31 + i) - 0.5) * 0.15, y: STAGE_TOP, z: -0.35 + z, s: 1 })
    })
    for (let i = 0; i < 16; i++) out.push({ x: -5.4 + i * 0.72, y: FLOOR, z: STAGE_FRONT + 0.6, s: 0.62 })
    return out
  }, [])
  const geo = useMemo(() => ({
    legs: new THREE.CylinderGeometry(0.15, 0.13, 0.85, 8).translate(0, 0.43, 0),
    torso: new THREE.CylinderGeometry(0.17, 0.2, 0.62, 10).translate(0, 1.15, 0),
    head: new THREE.SphereGeometry(0.11, 12, 8).translate(0, 1.6, 0),
  }), [])
  const refs = { legs: useRef<THREE.InstancedMesh>(null), torso: useRef<THREE.InstancedMesh>(null), head: useRef<THREE.InstancedMesh>(null) }
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const c = new THREE.Color()
    const shirts = [S.teamShirt, S.avatarTeeA, S.avatarTeeB, S.toteBlue, S.paper, S.chairRed, S.leafDark, S.mugBlue]
    people.forEach((p, i) => {
      m.compose(new THREE.Vector3(p.x, p.y, p.z), q, new THREE.Vector3(1, p.s, 1))
      for (const r of Object.values(refs)) r.current!.setMatrixAt(i, m)
      refs.torso.current!.setColorAt(i, c.set(shirts[Math.floor(hashSeed(i + 3) * shirts.length)]!))
      refs.head.current!.setColorAt(i, c.set(S.attendeeSkin).offsetHSL(0, 0, (hashSeed(i + 41) - 0.5) * 0.3))
    })
    for (const r of Object.values(refs)) { r.current!.instanceMatrix.needsUpdate = true; r.current!.computeBoundingSphere() }
    refs.torso.current!.instanceColor!.needsUpdate = true
    refs.head.current!.instanceColor!.needsUpdate = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [people])
  return (
    <group ref={ref} visible={false}>
      <instancedMesh ref={refs.legs} args={[geo.legs, undefined, people.length]}><meshStandardMaterial color={S.avatarPants} roughness={0.9} /></instancedMesh>
      <instancedMesh ref={refs.torso} args={[geo.torso, undefined, people.length]}><meshStandardMaterial roughness={0.9} /></instancedMesh>
      <instancedMesh ref={refs.head} args={[geo.head, undefined, people.length]}><meshStandardMaterial roughness={0.8} /></instancedMesh>
    </group>
  )
}
