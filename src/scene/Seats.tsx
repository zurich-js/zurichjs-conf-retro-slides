import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { FLOOR, SURFACES as S } from './venue'
import { hash } from './textures'

/**
 * Rows of wooden shell chairs (grey seat pad, chrome legs), drawn as three
 * InstancedMeshes. Empty: the hall before doors open.
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
