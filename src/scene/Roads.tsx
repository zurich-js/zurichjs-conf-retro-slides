import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { useDeck } from '../engine/store'
import { STILL } from '../engine/params'
import { keepAwake } from '../engine/activity'
import { slides } from '../content/slides'
import { TYPE } from '../brand/tokens'
import { AIRPORT, FLOOR, ROAD, SURFACES as S } from './venue'
import { currentAction, sinceReveal, smoothstep } from './beats'

/**
 * Airport runs (Nadja): organisers driving speakers between Technopark and
 * the airport, again and again, as flights moved. A road from Technopark's
 * entrance to the landside kerb, street lights, cars shuttling both ways
 * (right-hand traffic) with a speaker's portrait over each, and delayed
 * planes stacked in a holding pattern over the airport. Everything moves
 * only while the `shuttle` cue is on screen. Metres, world frame.
 *
 * The portraits are illustrative (speakers who flew in), not a record of who
 * rode in which car. Car 0 is Arnau Gómez Farell: on a slide with
 * `action: 'rush'` it races from the airport to Technopark (landed 06:00,
 * workshop at 09:00).
 */
export const SPEAKER_PHOTOS = [
  '/speakers/arnau-gomez-farell.jpg', '/speakers/scott-tolinski.jpg', '/speakers/tracy-lee.jpg', '/speakers/mark-erikson.jpg',
  '/speakers/atila-fassina.jpg', '/speakers/debbie-obrien.jpg', '/speakers/daniel-afonso.jpg', '/speakers/daniel-noel-davies.jpg',
] as const

const ROAD_W = 9
const LANE = 2.4
/** Cars: where on the loop each starts (0–2: out and back) and how fast (loops per second). */
const CARS = SPEAKER_PHOTOS.map((_, i) => ({ o: (i * 0.257 + 0.05) % 2, v: 0.05 + (i % 3) * 0.009 }))
/** Portrait height above the road (metres) and its size. */
const PIN = { y: 10, size: 7.5 }
const RUSH_SECS = 5.5

/** Planes in the hold over the airport: radius, height, phase, angular speed, the tag they carry. */
const HOLD = { x: AIRPORT.x - 30, z: AIRPORT.z - 12 }
const PLANES = [
  { r: 30, y: 34, a: 0.4, w: 0.22, tag: 'DELAYED' },
  { r: 36, y: 40, a: 2.5, w: 0.19, tag: 'HOLDING' },
  { r: 24, y: 46, a: 4.3, w: 0.25, tag: 'DELAYED' },
  { r: 40, y: 28, a: 3.4, w: 0.17, tag: 'MISSED CONNECTION' },
] as const

/** A speaker's photo cropped to a circle in a yellow ring, on a transparent canvas. */
function portrait(img: HTMLImageElement): THREE.CanvasTexture {
  const N = 256
  const c = document.createElement('canvas')
  c.width = c.height = N
  const ctx = c.getContext('2d')!
  ctx.fillStyle = S.foifiYellow
  ctx.beginPath(); ctx.arc(N / 2, N / 2, N / 2, 0, Math.PI * 2); ctx.fill()
  ctx.save()
  ctx.beginPath(); ctx.arc(N / 2, N / 2, N / 2 - 14, 0, Math.PI * 2); ctx.clip()
  const s = Math.max(N / img.naturalWidth, N / img.naturalHeight)
  ctx.drawImage(img, (N - img.naturalWidth * s) / 2, (N - img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s)
  ctx.restore()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** A flight-status tag: mono caps on an amber plate, like a departures board. */
function statusTag(text: string): { map: THREE.CanvasTexture; aspect: number } {
  const H = 96
  const c = document.createElement('canvas')
  const ctx = c.getContext('2d')!
  ctx.font = `${TYPE.weight.bold} 64px ${TYPE.mono}`
  c.width = Math.ceil(ctx.measureText(text).width + 64)
  c.height = H
  ctx.fillStyle = S.uiAmber
  ctx.fillRect(0, 0, c.width, H)
  ctx.font = `${TYPE.weight.bold} 64px ${TYPE.mono}`
  ctx.fillStyle = S.ink
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 32, H / 2 + 4)
  const map = new THREE.CanvasTexture(c)
  map.colorSpace = THREE.SRGBColorSpace
  return { map, aspect: c.width / H }
}

const onShuttle = () => !STILL && slides[useDeck.getState().index]?.camera === 'shuttle'

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
  const photos = useTexture(SPEAKER_PHOTOS as unknown as string[])
  const pins = useMemo(() => photos.map((t) => new THREE.SpriteMaterial({ map: portrait(t.image as HTMLImageElement), depthTest: false, toneMapped: false })), [photos])
  const cars = useRef<(THREE.Group | null)[]>([])
  const pinRefs = useRef<(THREE.Sprite | null)[]>([])
  const st = useRef({ shown: -1 })
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), t: new THREE.Vector3() }), [])
  const overlay = useRef<THREE.Group>(null)
  useFrame(() => {
    // Portraits and tags draw on top of everything: only in the city view, never through a wall.
    if (overlay.current) overlay.current.visible = slides[useDeck.getState().index]?.camera === 'shuttle'
    const driving = onShuttle()
    const now = driving ? performance.now() / 1000 : 0
    const rush = currentAction() === 'rush'
    if (!driving && !rush && st.current.shown === 0) return
    st.current.shown = driving ? now : rush ? -2 : 0
    const rt = rush ? sinceReveal() : 0
    CARS.forEach((c, i) => {
      const g = cars.current[i]
      if (!g) return
      let u: number
      let out: boolean
      if (rush && i === 0) {
        // Airport → Technopark, flat out.
        u = 1 - smoothstep(0.4, 0.4 + RUSH_SECS, rt)
        out = false
      } else {
        const loop = (c.o + now * c.v) % 2
        out = loop < 1
        u = out ? loop : 2 - loop
      }
      curve.getPointAt(u, tmp.p)
      curve.getTangentAt(u, tmp.t)
      if (!out) tmp.t.negate()
      // Keep right: offset across the road from the direction of travel.
      g.position.set(tmp.p.x - tmp.t.z * LANE, FLOOR + 0.06, tmp.p.z + tmp.t.x * LANE)
      g.rotation.y = Math.atan2(tmp.t.x, tmp.t.z)
      const pin = pinRefs.current[i]
      if (pin) {
        const big = rush && i === 0 ? 1.7 : 1
        pin.position.set(g.position.x, FLOOR + PIN.y * big, g.position.z)
        pin.scale.setScalar(PIN.size * big)
        // In the rush, the other speakers fade back so Arnau's car is the one to follow.
        pin.material.opacity = rush && i !== 0 ? 0.35 : 1
      }
    })
    if (driving || (rush && rt < RUSH_SECS + 1)) keepAwake(200)
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
      {/* The speaker riding in each car, floating above it (always on top, never hidden by a roof). */}
      <group ref={overlay}>
        {pins.map((m, i) => (
          <sprite key={i} ref={(s) => { pinRefs.current[i] = s }} material={m} renderOrder={10} />
        ))}
        <Holding />
      </group>
    </group>
  )
}

/** Delayed flights stacked over the airport: circling, banked, nav lights blinking, a status tag on each. */
function Holding() {
  const planes = useRef<(THREE.Group | null)[]>([])
  const strobes = useRef<(THREE.Mesh | null)[]>([])
  const tags = useMemo(() => PLANES.map((p) => statusTag(p.tag)), [])
  const tagMats = useMemo(() => tags.map((t) => new THREE.SpriteMaterial({ map: t.map, depthTest: false, toneMapped: false })), [tags])
  const st = useRef({ shown: -1 })
  useFrame(() => {
    const flying = onShuttle()
    const now = flying ? performance.now() / 1000 : 0
    if (!flying && st.current.shown === 0) return
    st.current.shown = flying ? now : 0
    PLANES.forEach((p, i) => {
      const g = planes.current[i]
      if (!g) return
      const a = p.a + now * p.w
      g.position.set(HOLD.x + Math.cos(a) * p.r, FLOOR + p.y, HOLD.z + Math.sin(a) * p.r)
      // Flying counter-clockwise seen from above: heading along the tangent, banked into the turn.
      g.rotation.set(0, Math.atan2(-Math.sin(a), Math.cos(a)) + Math.PI, 0)
      g.rotateZ(-0.35)
      const s = strobes.current[i]
      if (s) s.visible = Math.floor(now * 1.6 + i * 0.37) % 2 === 0
    })
    if (flying) keepAwake(200)
  })
  return (
    <group>
      {PLANES.map((_, i) => (
        <group key={i} ref={(g) => { planes.current[i] = g }}>
          {/* A twin-jet, 1.5× life size, nose toward +z. */}
          <group scale={1.5}>
            <mesh rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[1.0, 0.7, 14, 10]} />
              <meshStandardMaterial color={S.fuselage} roughness={0.5} />
            </mesh>
            <mesh position-z={0.5}>
              <boxGeometry args={[15, 0.25, 2.6]} />
              <meshStandardMaterial color={S.engineGrey} roughness={0.5} />
            </mesh>
            <mesh position={[0, 1.6, -6.2]}>
              <boxGeometry args={[0.25, 3, 2]} />
              <meshStandardMaterial color={S.swissRed} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.2, -6.4]}>
              <boxGeometry args={[5.5, 0.2, 1.4]} />
              <meshStandardMaterial color={S.engineGrey} roughness={0.5} />
            </mesh>
            <mesh position={[-7.5, 0, 0.5]}>
              <sphereGeometry args={[0.35, 8, 6]} />
              <meshBasicMaterial color={S.taillight} toneMapped={false} />
            </mesh>
            <mesh position={[7.5, 0, 0.5]}>
              <sphereGeometry args={[0.35, 8, 6]} />
              <meshBasicMaterial color={S.navGreen} toneMapped={false} />
            </mesh>
            <mesh ref={(m) => { strobes.current[i] = m }} position={[0, 1.2, 0]}>
              <sphereGeometry args={[0.45, 8, 6]} />
              <meshBasicMaterial color={S.strobe} toneMapped={false} />
            </mesh>
          </group>
          <sprite material={tagMats[i]} position-y={9} scale={[3.2 * tags[i]!.aspect, 3.2, 1]} renderOrder={10} />
        </group>
      ))}
    </group>
  )
}
