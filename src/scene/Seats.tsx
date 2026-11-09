import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useDeck } from '../engine/store'
import { STILL } from '../engine/params'
import { revealedAt } from '../engine/frame'
import { slides } from '../content/slides'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { FLOOR, SURFACES as S } from './venue'
import { hash } from './textures'

/**
 * Rows of wooden shell chairs (grey seat pad, chrome legs), drawn as three
 * InstancedMeshes, and the people in them. How full the rows are follows the
 * slide's `fill` (carried forward from the last slide that set one): when it
 * changes, seats fill (or empty) one by one in a fixed sales order, front
 * rows a little first, over a few seconds from the slide's reveal.
 */

/** Seat centres in x for one row: left block, aisle, centre block, aisle, right block. */
const BLOCKS = [
  { start: -8.0, count: 6 },
  { start: -3.5, count: 12 },
  { start: 4.15, count: 8 },
] as const
const PITCH = 0.52
const ROWS = 12
const FIRST_ROW = 6.0
const ROW_PITCH = 0.9

const SEATS = (() => {
  const out: { x: number; z: number; yaw: number }[] = []
  for (let r = 0; r < ROWS; r++) {
    for (const b of BLOCKS) {
      for (let i = 0; i < b.count; i++) {
        const k = out.length
        out.push({
          x: b.start + i * PITCH + (hash(k) - 0.5) * 0.03,
          z: FIRST_ROW + r * ROW_PITCH + (hash(k + 999) - 0.5) * 0.04,
          yaw: (hash(k + 4242) - 0.5) * 0.08,
        })
      }
    }
  }
  return out
})()

function chairGeometries() {
  const seat = new THREE.BoxGeometry(0.44, 0.02, 0.42).translate(0, 0.45, 0)
  const back = new THREE.BoxGeometry(0.44, 0.42, 0.015).rotateX(0.2).translate(0, 0.69, 0.23)
  const shell = mergeGeometries([seat, back])!
  const cushion = new THREE.BoxGeometry(0.41, 0.035, 0.39).translate(0, 0.477, -0.005)
  const legParts = [-1, 1].flatMap((sx) =>
    [-1, 1].map((sz) => new THREE.CylinderGeometry(0.01, 0.01, 0.45, 6).translate(sx * 0.2, 0.225, sz * 0.19)),
  )
  const legs = mergeGeometries(legParts)!
  ;[seat, back, ...legParts].forEach((g) => g.dispose())
  return { shell, cushion, legs }
}

/** Per slide: how full the room is (0–1), carried forward from the last slide that set it. */
const FILL = (() => {
  let f = 0
  return slides.map((s) => (f = s.fill ?? f))
})()

/** Sales order: a stable shuffle, front rows a little more likely early. */
const ORDER = SEATS.map((s, i) => ({ i, k: (s.z - FIRST_ROW) / (ROWS * ROW_PITCH) * 0.35 + hash(i + 7777) * 0.65 }))
  .sort((a, b) => a.k - b.k).map((o) => o.i)
/** Each seat's place in the sales order. */
const RANK = (() => { const r: number[] = []; ORDER.forEach((seat, k) => { r[seat] = k }); return r })()

const SHIRTS = [S.teamShirt, S.avatarTeeA, S.avatarTeeB, S.toteBlue, S.mugBlue, S.chairRed, S.leafDark, S.paper, S.badgeOrange, S.cushion]

/** People in the seats: torso and head, one instance per seat, hidden until their seat is sold. */
function Occupants() {
  const torso = useRef<THREE.InstancedMesh>(null)
  const head = useRef<THREE.InstancedMesh>(null)
  const geo = useMemo(() => ({
    torso: new THREE.CylinderGeometry(0.16, 0.2, 0.62, 10).translate(0, 0.78, 0.05),
    head: new THREE.SphereGeometry(0.11, 14, 10).translate(0, 1.22, 0.03),
  }), [])
  const st = useRef({ index: -1, from: 0, shown: -1 })
  useLayoutEffect(() => {
    const c = new THREE.Color()
    SEATS.forEach((_, i) => {
      torso.current!.setColorAt(i, c.set(SHIRTS[Math.floor(hash(i + 31) * SHIRTS.length)]!))
      head.current!.setColorAt(i, c.set(S.attendeeSkin).offsetHSL(0, 0, (hash(i + 99) - 0.5) * 0.3))
    })
    torso.current!.instanceColor!.needsUpdate = true
    head.current!.instanceColor!.needsUpdate = true
  }, [])
  const m = useMemo(() => new THREE.Matrix4(), [])
  const q = useMemo(() => new THREE.Quaternion(), [])
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const p = useMemo(() => new THREE.Vector3(), [])
  const one = useMemo(() => new THREE.Vector3(1, 1, 1), [])
  const zero = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  useFrame(() => {
    const index = useDeck.getState().index
    const s = st.current
    const to = FILL[index] ?? 0
    if (index !== s.index) {
      // Start from whatever is showing now (mid-fill included).
      s.from = s.shown < 0 ? to : s.shown / SEATS.length
      s.index = index
    }
    const t = STILL ? 99 : (performance.now() - revealedAt()) / 1000
    const k = Math.min(1, Math.max(0, (t - 0.3) / 3.8))
    const e = k * k * (3 - 2 * k)
    const n = Math.round((s.from + (to - s.from) * e) * SEATS.length)
    if (n === s.shown) return
    s.shown = n
    SEATS.forEach((seat, i) => {
      q.setFromAxisAngle(up, seat.yaw)
      m.compose(p.set(seat.x, FLOOR, seat.z), q, RANK[i]! < n ? one : zero)
      torso.current!.setMatrixAt(i, m)
      head.current!.setMatrixAt(i, m)
    })
    torso.current!.instanceMatrix.needsUpdate = true
    head.current!.instanceMatrix.needsUpdate = true
    torso.current!.computeBoundingSphere()
    head.current!.computeBoundingSphere()
  })
  return (
    <>
      <instancedMesh ref={torso} args={[geo.torso, undefined, SEATS.length]}>
        <meshStandardMaterial roughness={0.85} />
      </instancedMesh>
      <instancedMesh ref={head} args={[geo.head, undefined, SEATS.length]}>
        <meshStandardMaterial roughness={0.7} />
      </instancedMesh>
    </>
  )
}

export function Seats() {
  const geo = useMemo(chairGeometries, [])
  const refs = [useRef<THREE.InstancedMesh>(null), useRef<THREE.InstancedMesh>(null), useRef<THREE.InstancedMesh>(null)]

  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const up = new THREE.Vector3(0, 1, 0)
    const one = new THREE.Vector3(1, 1, 1)
    for (const ref of refs) {
      const mesh = ref.current
      if (!mesh) continue
      SEATS.forEach((s, i) => {
        q.setFromAxisAngle(up, s.yaw)
        m.compose(new THREE.Vector3(s.x, FLOOR, s.z), q, one)
        mesh.setMatrixAt(i, m)
      })
      mesh.instanceMatrix.needsUpdate = true
      mesh.computeBoundingSphere()
    }
    // refs are stable; run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <group>
      <Occupants />
      <instancedMesh ref={refs[0]} args={[geo.shell, undefined, SEATS.length]}>
        <meshStandardMaterial color={S.wood} roughness={0.55} />
      </instancedMesh>
      <instancedMesh ref={refs[1]} args={[geo.cushion, undefined, SEATS.length]}>
        <meshStandardMaterial color={S.cushion} roughness={0.95} />
      </instancedMesh>
      <instancedMesh ref={refs[2]} args={[geo.legs, undefined, SEATS.length]}>
        <meshStandardMaterial color={S.chrome} roughness={0.25} metalness={0.9} />
      </instancedMesh>
    </group>
  )
}
