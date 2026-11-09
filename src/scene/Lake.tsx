import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { hashSeed, lake, LAKE, FLOOR, M, SURFACES as S } from './venue'

/**
 * The VIP after-party (aftermovie): a lakeside bath on Lake Zurich at dusk.
 * A wooden deck around a pool, a flat pavilion roof along the shore, long
 * white tables with candle lamps, string lights out over the deck to light
 * poles, people at the tables and on the deck, a swimming raft out on the lake
 * with one person mid-jump. Reconstructed from the film; not to scale and not
 * a survey of the real bath. Local frame in venue.ts (`lake()`).
 */
const DECK = { x0: -12, x1: 12, z0: 0, z1: 15, y: 0.45 } as const
const POOL = { x0: -3.5, x1: 4.5, z0: 5, z1: 11 } as const

const at = (x: number, y: number, z: number) => new THREE.Vector3(...lake(x, y, z))

/** The sky at dusk: deep blue overhead to an orange glow over the far shore. */
function duskSky() {
  const c = document.createElement('canvas')
  c.width = 8
  c.height = 256
  const ctx = c.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, 0, 256)
  g.addColorStop(0, '#141a30')
  g.addColorStop(0.3, '#2c3260')
  g.addColorStop(0.44, '#5a5a86')
  g.addColorStop(0.5, '#e09a66')
  g.addColorStop(0.53, '#1a3550')
  g.addColorStop(1, '#0f2233')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 8, 256)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function Lake() {
  const sky = useMemo(duskSky, [])
  return (
    <group>
      {/* Lake water, and the sky beyond the far shore. */}
      <mesh position={[LAKE.x, FLOOR - 0.05, LAKE.z - 60]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[520, 260]} />
        <meshBasicMaterial color={S.lakeWater} toneMapped={false} />
      </mesh>
      {/* A sky dome around the deck (inside the camera's far plane): deep blue overhead, an orange glow at the horizon. */}
      <mesh position={lake(0, 0, 10)}>
        <sphereGeometry args={[220, 32, 16]} />
        <meshBasicMaterial map={sky} toneMapped={false} side={THREE.BackSide} />
      </mesh>
      {/* The far shore: a low dark band of hills. */}
      <mesh position={lake(0, 3, 115)}>
        <boxGeometry args={[440, 6, 4]} />
        <meshStandardMaterial color={'#1d2622'} roughness={1} />
      </mesh>
      <Shore />
      <Deck />
      <Pavilion />
      <Tables />
      <StringLights />
      <People />
      <Raft />
      <hemisphereLight args={[S.dusk, S.lakeWater, 0.7]} />
      {[[-8, 6], [0, 3], [8, 6], [-4, 12], [6, 12]].map(([x, z]) => (
        <pointLight key={`${x}${z}`} position={lake(x!, 3.2, z!)} color={S.lamp} intensity={1.1} decay={0} distance={10 * M} />
      ))}
    </group>
  )
}

function Shore() {
  return (
    <group>
      <mesh position={lake(0, 0.2, -10)}>
        <boxGeometry args={[60, 0.5, 20]} />
        <meshStandardMaterial color={'#24301f'} roughness={1} />
      </mesh>
      {/* Shore trees at either end of the deck, clear of the camera's view of it. */}
      {[-34, -30, 18, 22, 27, 32].map((x, i) => (
        <mesh key={i} position={lake(x, 4, -2 + hashSeed(i) * 6)}>
          <sphereGeometry args={[2.6 + hashSeed(i + 9) * 1.4, 12, 10]} />
          <meshStandardMaterial color={S.leafDark} roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

/** Deck boards around the pool: four slabs, plank seams drawn as thin dark strips. */
function Deck() {
  const slabs = [
    [DECK.x0, DECK.x1, DECK.z0, POOL.z0], [DECK.x0, DECK.x1, POOL.z1, DECK.z1],
    [DECK.x0, POOL.x0, POOL.z0, POOL.z1], [POOL.x1, DECK.x1, POOL.z0, POOL.z1],
  ] as const
  return (
    <group>
      {slabs.map(([x0, x1, z0, z1], i) => {
        const [cx, cy, cz] = lake((x0 + x1) / 2, DECK.y / 2, (z0 + z1) / 2)
        return (
          <mesh key={i} position={[cx, cy, cz]}>
            <boxGeometry args={[x1 - x0, DECK.y, z1 - z0]} />
            <meshStandardMaterial color={S.deckWood} roughness={0.8} />
          </mesh>
        )
      })}
      {Array.from({ length: 24 }, (_, i) => (
        <mesh key={i} position={lake(DECK.x0 + 0.5 + i, DECK.y + 0.002, (DECK.z0 + DECK.z1) / 2)} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[0.03, DECK.z1 - DECK.z0]} />
          <meshStandardMaterial color={S.woodSeam} roughness={0.9} />
        </mesh>
      ))}
      {/* The pool: lighter water a step down, a white edge. */}
      <mesh position={lake((POOL.x0 + POOL.x1) / 2, 0.15, (POOL.z0 + POOL.z1) / 2)} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[POOL.x1 - POOL.x0, POOL.z1 - POOL.z0]} />
        <meshStandardMaterial color={S.poolWater} roughness={0.1} metalness={0.2} emissive={S.poolWater} emissiveIntensity={0.25} />
      </mesh>
    </group>
  )
}

function Pavilion() {
  return (
    <group>
      <mesh position={lake(0, 3.4, 1.6)}>
        <boxGeometry args={[DECK.x1 - DECK.x0, 0.2, 3.4]} />
        <meshStandardMaterial color={S.paper} roughness={0.7} />
      </mesh>
      {[-11.5, -6, 0, 6, 11.5].map((x) => (
        <mesh key={x} position={lake(x, 1.9, 3.1)}>
          <cylinderGeometry args={[0.07, 0.07, 3, 10]} />
          <meshStandardMaterial color={S.paper} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

/** Long white tables along the left of the deck, candle lamps down the middle. */
function Tables() {
  const tables = [[-9.5, 7.5], [-6.8, 7.5]] as const
  return (
    <group>
      {tables.map(([x, z]) => (
        <group key={x}>
          <mesh position={lake(x, DECK.y + 0.38, z)}>
            <boxGeometry args={[0.9, 0.76, 7]} />
            <meshStandardMaterial color={S.paper} roughness={0.85} />
          </mesh>
          {Array.from({ length: 6 }, (_, i) => (
            <mesh key={i} position={lake(x, DECK.y + 0.84, z - 3 + i * 1.2)}>
              <cylinderGeometry args={[0.05, 0.06, 0.16, 12]} />
              <meshBasicMaterial color={S.flame} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/** Strands of bulbs from the pavilion roof out to poles at the water's edge. */
function StringLights() {
  const { bulbs, wires } = useMemo(() => {
    const bulbs: THREE.Vector3[] = []
    const wires: THREE.BufferGeometry[] = []
    for (const x of [-10, -5, 0, 5, 10]) {
      const a = at(x, 3.4, 3.2)
      const b = at(x * 1.1, 3.8, DECK.z1 - 0.3)
      const mid = a.clone().lerp(b, 0.5)
      mid.y -= 0.7
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b)
      wires.push(new THREE.TubeGeometry(curve, 24, 0.01, 4, false))
      for (let k = 1; k < 14; k++) bulbs.push(curve.getPoint(k / 14).add(new THREE.Vector3(0, -0.06, 0)))
    }
    return { bulbs, wires }
  }, [])
  const ref = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    bulbs.forEach((p, i) => { m.makeTranslation(p.x, p.y, p.z); ref.current!.setMatrixAt(i, m) })
    ref.current!.instanceMatrix.needsUpdate = true
    ref.current!.computeBoundingSphere()
  }, [bulbs])
  return (
    <group>
      {wires.map((g, i) => <mesh key={i} geometry={g}><meshStandardMaterial color={S.steel} /></mesh>)}
      <instancedMesh ref={ref} args={[undefined, undefined, bulbs.length]}>
        <sphereGeometry args={[0.07, 8, 6]} />
        <meshBasicMaterial color={S.lamp} toneMapped={false} />
      </instancedMesh>
      {[-11, -5.5, 0, 5.5, 11].map((x) => (
        <mesh key={x} position={lake(x * 1.1, 2.1, DECK.z1 - 0.3)}>
          <cylinderGeometry args={[0.04, 0.04, 3.4, 8]} />
          <meshStandardMaterial color={S.steel} />
        </mesh>
      ))}
    </group>
  )
}

/** People: seated at the tables, standing on the deck in groups. Instanced. */
function People() {
  const people = useMemo(() => {
    const out: { x: number; y: number; z: number; yaw: number; s: number }[] = []
    for (const tx of [-9.5, -6.8]) {
      for (let i = 0; i < 6; i++) {
        for (const side of [-1, 1]) out.push({ x: tx + side * 0.75, y: DECK.y, z: 4.6 + i * 1.2, yaw: side * Math.PI / 2, s: 0.78 })
      }
    }
    const groups = [[-1, 2.5], [2.5, 2.2], [7, 3.5], [8.5, 8], [-1, 13], [3, 13.2], [8, 12.5]] as const
    groups.forEach(([gx, gz], g) => {
      const n = 3 + Math.floor(hashSeed(g + 5) * 3)
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + hashSeed(g * 7 + i)
        out.push({ x: gx + Math.cos(a) * 0.6, y: DECK.y, z: gz + Math.sin(a) * 0.6, yaw: Math.atan2(-Math.cos(a), -Math.sin(a)), s: 1 })
      }
    })
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
    const up = new THREE.Vector3(0, 1, 0)
    const c = new THREE.Color()
    const shirts = [S.paper, S.avatarTeeA, S.avatarTeeB, S.chairRed, S.toteBlue, S.cushionPink, S.leafDark]
    people.forEach((p, i) => {
      // Local +z runs to world −z (lake()), so mirror the yaw.
      q.setFromAxisAngle(up, Math.PI - p.yaw)
      m.compose(at(p.x, p.y, p.z), q, new THREE.Vector3(1, p.s, 1))
      for (const r of Object.values(refs)) r.current!.setMatrixAt(i, m)
      refs.torso.current!.setColorAt(i, c.set(shirts[Math.floor(hashSeed(i + 11) * shirts.length)]!))
      refs.head.current!.setColorAt(i, c.set(S.attendeeSkin).offsetHSL(0, 0, (hashSeed(i + 23) - 0.5) * 0.3))
    })
    for (const r of Object.values(refs)) { r.current!.instanceMatrix.needsUpdate = true; r.current!.computeBoundingSphere() }
    refs.torso.current!.instanceColor!.needsUpdate = true
    refs.head.current!.instanceColor!.needsUpdate = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [people])
  return (
    <group>
      <instancedMesh ref={refs.legs} args={[geo.legs, undefined, people.length]}><meshStandardMaterial color={S.avatarPants} roughness={0.9} /></instancedMesh>
      <instancedMesh ref={refs.torso} args={[geo.torso, undefined, people.length]}><meshStandardMaterial roughness={0.9} /></instancedMesh>
      <instancedMesh ref={refs.head} args={[geo.head, undefined, people.length]}><meshStandardMaterial roughness={0.8} /></instancedMesh>
    </group>
  )
}

/** The swimming raft out on the lake, swimmers on it, one mid-backflip above the water. */
function Raft() {
  return (
    <group>
      <mesh position={lake(1, 0.15, 24)}>
        <boxGeometry args={[4, 0.4, 4]} />
        <meshStandardMaterial color={S.deckWood} roughness={0.8} />
      </mesh>
      {[-0.8, 0.2, 1.2, 2.2].map((x, i) => (
        <group key={x} position={lake(x, 0.35, 23.2 + (i % 2) * 0.6)}>
          <mesh position-y={0.5}><cylinderGeometry args={[0.12, 0.11, 1.0, 8]} /><meshStandardMaterial color={S.attendeeSkin} roughness={0.8} /></mesh>
          <mesh position-y={1.12}><sphereGeometry args={[0.1, 10, 8]} /><meshStandardMaterial color={S.attendeeSkin} roughness={0.8} /></mesh>
          <mesh position-y={0.45}><cylinderGeometry args={[0.125, 0.125, 0.18, 8]} /><meshStandardMaterial color={i % 2 ? S.toteBlue : S.ink} roughness={0.8} /></mesh>
        </group>
      ))}
      {/* Mid-air, tucked, upside down. */}
      <group position={lake(-1.8, 2.6, 25.5)} rotation={[0, 0, 2.4]}>
        <mesh><capsuleGeometry args={[0.13, 0.5, 4, 8]} /><meshStandardMaterial color={S.attendeeSkin} roughness={0.8} /></mesh>
        <mesh position-y={0.42}><sphereGeometry args={[0.1, 10, 8]} /><meshStandardMaterial color={S.attendeeSkin} roughness={0.8} /></mesh>
        <mesh position-y={-0.2}><cylinderGeometry args={[0.14, 0.14, 0.18, 8]} /><meshStandardMaterial color={S.ink} roughness={0.8} /></mesh>
      </group>
    </group>
  )
}
