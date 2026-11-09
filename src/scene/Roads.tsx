import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useDeck } from '../engine/store'
import { STILL } from '../engine/params'
import { keepAwake } from '../engine/activity'
import { slides } from '../content/slides'
import { FLOOR, ROAD, SURFACES as S } from './venue'

/**
 * Airport runs (Nadja): organisers driving speakers between Technopark and
 * the airport, again and again, as flights moved. A road from Technopark's
 * entrance to the landside kerb, street lights along it, and cars shuttling
 * both ways (right-hand traffic). The cars only drive while the `shuttle` cue
 * is on screen; anywhere else they hold still. Metres, world frame.
 */
const ROAD_W = 9
const LANE = 2.4
/** Cars: where on the loop each starts (0–2: out and back) and how fast (loops per second). */
const CARS = [0.05, 0.42, 0.81, 1.15, 1.52, 1.86].map((o, i) => ({ o, v: 0.055 + (i % 3) * 0.008 }))

export function Roads() {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(ROAD.map(([x, z]) => new THREE.Vector3(x, FLOOR + 0.06, z)), false, 'centripetal'), [])
  const ribbon = useMemo(() => {
    const n = 160
    const pos: number[] = []
    const idx: number[] = []
    const p = new THREE.Vector3()
    const t = new THREE.Vector3()
    for (let i = 0; i <= n; i++) {
      curve.getPointAt(i / n, p)
      curve.getTangentAt(i / n, t)
      const nx = -t.z, nz = t.x
      const l = Math.hypot(nx, nz) || 1
      pos.push(p.x + (nx / l) * ROAD_W / 2, p.y, p.z + (nz / l) * ROAD_W / 2, p.x - (nx / l) * ROAD_W / 2, p.y, p.z - (nz / l) * ROAD_W / 2)
      if (i < n) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3) }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setIndex(idx)
    g.computeVertexNormals()
    return g
  }, [curve])
  const lamps = useMemo(() => {
    const out: [number, number, number][] = []
    const len = curve.getLength()
    const p = new THREE.Vector3()
    const t = new THREE.Vector3()
    for (let d = 6; d < len; d += 14) {
      curve.getPointAt(d / len, p)
      curve.getTangentAt(d / len, t)
      const side = (Math.round(d / 14) % 2) * 2 - 1
      out.push([p.x - t.z * side * (ROAD_W / 2 + 1), FLOOR + 0.6, p.z + t.x * side * (ROAD_W / 2 + 1)])
    }
    return out
  }, [curve])
  const cars = useRef<(THREE.Group | null)[]>([])
  const st = useRef({ shown: -1 })
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), t: new THREE.Vector3() }), [])
  useFrame(() => {
    const driving = !STILL && slides[useDeck.getState().index]?.camera === 'shuttle'
    const now = driving ? performance.now() / 1000 : 0
    if (!driving && st.current.shown === 0) return
    st.current.shown = driving ? now : 0
    CARS.forEach((c, i) => {
      const g = cars.current[i]
      if (!g) return
      const loop = (c.o + now * c.v) % 2
      const out = loop < 1
      const u = out ? loop : 2 - loop
      curve.getPointAt(u, tmp.p)
      curve.getTangentAt(u, tmp.t)
      if (!out) tmp.t.negate()
      // Keep right: offset across the road from the direction of travel.
      g.position.set(tmp.p.x - tmp.t.z * LANE, FLOOR + 0.06, tmp.p.z + tmp.t.x * LANE)
      g.rotation.y = Math.atan2(tmp.t.x, tmp.t.z)
    })
    if (driving) keepAwake(200)
  })
  const glow = useMemo(() => new THREE.MeshBasicMaterial({ color: S.headlight, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), [])
  return (
    <group>
      <mesh geometry={ribbon}>
        <meshStandardMaterial color={S.asphalt} roughness={0.95} />
      </mesh>
      {lamps.map((p, i) => (
        <group key={i} position={p}>
          <mesh position-y={2.6}>
            <sphereGeometry args={[0.35, 8, 6]} />
            <meshBasicMaterial color={S.lamp} toneMapped={false} />
          </mesh>
          <mesh position-y={2.4} rotation-x={-Math.PI / 2} material={glow}>
            <circleGeometry args={[2.2, 16]} />
          </mesh>
        </group>
      ))}
      {CARS.map((_, i) => (
        // Drawn 1.6× life size so they read from the city view.
        <group key={i} ref={(g) => { cars.current[i] = g }} scale={1.6}>
          {/* +z is forward. */}
          <mesh position-y={0.55}>
            <boxGeometry args={[1.8, 0.7, 4.4]} />
            <meshStandardMaterial color={i % 3 === 0 ? S.paper : S.carBody} roughness={0.4} metalness={0.3} />
          </mesh>
          <mesh position={[0, 1.1, -0.3]}>
            <boxGeometry args={[1.6, 0.5, 2.2]} />
            <meshStandardMaterial color={S.glassDark} roughness={0.2} metalness={0.4} />
          </mesh>
          {[-0.6, 0.6].map((x) => (
            <group key={x}>
              <mesh position={[x, 0.6, 2.21]}>
                <boxGeometry args={[0.4, 0.18, 0.02]} />
                <meshBasicMaterial color={S.headlight} toneMapped={false} />
              </mesh>
              <mesh position={[x, 0.65, -2.21]}>
                <boxGeometry args={[0.4, 0.14, 0.02]} />
                <meshBasicMaterial color={S.taillight} toneMapped={false} />
              </mesh>
            </group>
          ))}
          {/* Headlight beam on the road, so the cars read from high above. */}
          <mesh position={[0, 0.08, 5.2]} rotation-x={-Math.PI / 2} material={glow}>
            <planeGeometry args={[2.6, 6]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
