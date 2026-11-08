import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { Cutaway } from './layers'
import { FLOOR, FOIFI, LIGHTS, M, PROJECTOR, SURFACES as S } from './venue'
import { columnScript, dateFlyer, discoTiles, hash, nightWindow } from './textures'

/**
 * Pause im Foifi (Digitec Galaxus), as it was for the ZurichJS 1st anniversary
 * on 14 Nov 2025: blue ceiling, galvanised steel grids hung with moss baskets
 * and pothos, glass globes and disco balls, LED tubes, orange walls, yellow
 * columns, a pink bar, colourful metal chairs, a projector screen, the laptop
 * that shipped conf.zurichjs.com, and the birthday cake.
 *
 * Local frame (metres): x 0 → width (left window wall → right wall),
 * z 0 → depth (screen wall → bar), y up from the floor.
 */

const W = FOIFI.width
const D = FOIFI.depth
const H = FOIFI.height
type V3 = readonly [number, number, number]

/** A galvanised square-grid glazed wall onto the night street, `len` long, along local x. */
function GlassWall({ len, street }: { len: number; street: THREE.Texture }) {
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: S.steelGalv, metalness: 0.6, roughness: 0.4 }), [])
  const grid = useMemo(() => {
    const parts: THREE.BufferGeometry[] = []
    for (let x = 0; x <= len + 1e-6; x += 1.0) parts.push(new THREE.BoxGeometry(0.06, H, 0.06).translate(x, H / 2, 0.04))
    for (let y = 0.55; y <= H; y += 1.0) parts.push(new THREE.BoxGeometry(len, 0.05, 0.06).translate(len / 2, y, 0.04))
    const g = mergeGeometries(parts)!
    parts.forEach((q) => q.dispose())
    return g
  }, [len])
  return (
    <group>
      <mesh position={[len / 2, H / 2, 0]}>
        <planeGeometry args={[len, H]} />
        <meshBasicMaterial map={street} toneMapped={false} />
      </mesh>
      <mesh geometry={grid} material={steel} />
      {/* Wooden planter ledge along the base, pots on it. */}
      <mesh position={[len / 2, 0.28, 0.35]}>
        <boxGeometry args={[len, 0.56, 0.6]} />
        <meshStandardMaterial color={S.wood} roughness={0.6} />
      </mesh>
      {/* Top shelf of big glass demijohns, green and clear. */}
      <mesh position={[len / 2, 2.55, 0.3]}>
        <boxGeometry args={[len, 0.04, 0.5]} />
        <meshStandardMaterial color={S.steelGalv} metalness={0.6} roughness={0.4} />
      </mesh>
      {Array.from({ length: Math.floor(len / 0.9) }, (_, k) => {
        const green = hash(k + len) > 0.5
        const r = 0.17 + hash(k * 3 + len) * 0.06
        return (
          <group key={k} position={[0.5 + k * 0.9 + (hash(k) - 0.5) * 0.2, 2.57 + r, 0.3]}>
            <mesh>
              <sphereGeometry args={[r, 18, 12]} />
              <meshStandardMaterial color={green ? S.leaf : S.paper} transparent opacity={green ? 0.55 : 0.3} roughness={0.08} depthWrite={false} />
            </mesh>
            <mesh position-y={r + 0.06}>
              <cylinderGeometry args={[0.035, 0.05, 0.14, 10]} />
              <meshStandardMaterial color={green ? S.leaf : S.paper} transparent opacity={0.5} roughness={0.08} depthWrite={false} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function Shell() {
  const street = useMemo(nightWindow, [])
  const wall = useMemo(() => new THREE.MeshStandardMaterial({ color: S.foifiWall, roughness: 0.9 }), [])
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[W / 2, 0, D / 2]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color={S.foifiFloor} roughness={0.45} />
      </mesh>
      {/* Glass on three sides: behind the screen, left and right. */}
      <GlassWall len={W} street={street} />
      <group position={[0, 0, D]} rotation-y={Math.PI / 2}>
        <GlassWall len={D} street={street} />
      </group>
      <group position={[W, 0, 0]} rotation-y={-Math.PI / 2}>
        <GlassWall len={D} street={street} />
      </group>
      {/* Only the bar end is the warm orange wall. */}
      <mesh position={[W / 2, H / 2, D]} rotation-y={Math.PI} material={wall}>
        <planeGeometry args={[W, H]} />
      </mesh>
    </group>
  )
}

/** The overhead garden: grids, baskets, vines, globes, disco balls, LED tubes. Cutaway. */
function Canopy() {
  const GRID_Y = 3.6
  const grids = [
    { x0: 0.8, x1: 7.2, z0: 1.0, z1: 6.2 },
    { x0: 8.8, x1: 15.2, z0: 1.0, z1: 6.2 },
    { x0: 0.8, x1: 15.2, z0: 7.2, z1: 12.0 },
  ]
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: S.steelGalv, metalness: 0.6, roughness: 0.4 }), [])
  const bars = useMemo(() => {
    const parts: THREE.BufferGeometry[] = []
    for (const g of grids) {
      const w = g.x1 - g.x0
      const d = g.z1 - g.z0
      const cx = (g.x0 + g.x1) / 2
      const cz = (g.z0 + g.z1) / 2
      for (let x = g.x0; x <= g.x1 + 1e-6; x += 0.8) parts.push(new THREE.BoxGeometry(0.03, 0.03, d).translate(x, GRID_Y, cz))
      for (let z = g.z0; z <= g.z1 + 1e-6; z += 0.8) parts.push(new THREE.BoxGeometry(w, 0.03, 0.03).translate(cx, GRID_Y, z))
      for (const [x, z] of [[g.x0, g.z0], [g.x1, g.z0], [g.x0, g.z1], [g.x1, g.z1]] as const) {
        parts.push(new THREE.BoxGeometry(0.03, H - GRID_Y, 0.03).translate(x, (H + GRID_Y) / 2, z))
      }
    }
    const merged = mergeGeometries(parts)!
    parts.forEach((p) => p.dispose())
    return merged
    // grids are constant
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Deterministic placements under the grids.
  const spots = useMemo(() => {
    const baskets: V3[] = []
    const globes: V3[] = []
    const strands: { at: V3; len: number }[] = []
    let k = 0
    for (const g of grids) {
      for (let x = g.x0 + 0.6; x < g.x1; x += 1.6) {
        for (let z = g.z0 + 0.6; z < g.z1; z += 1.7) {
          k++
          const jx = x + (hash(k) - 0.5) * 0.5
          const jz = z + (hash(k + 40) - 0.5) * 0.5
          if (hash(k + 80) > 0.45) baskets.push([jx, GRID_Y - 0.28, jz])
          else if (hash(k + 120) > 0.4) globes.push([jx, GRID_Y - 0.55 - hash(k + 7) * 0.4, jz])
          for (let s = 0; s < 3; s++) {
            strands.push({ at: [jx + (hash(k * 3 + s) - 0.5) * 0.7, GRID_Y - 0.05, jz + (hash(k * 5 + s) - 0.5) * 0.7], len: 0.4 + hash(k * 7 + s) * 1.6 })
          }
        }
      }
    }
    return { baskets, globes, strands }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Pothos: heart-shaped leaves instanced down each strand.
  const leaf = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.bezierCurveTo(0.07, 0.03, 0.08, 0.1, 0, 0.14)
    s.bezierCurveTo(-0.08, 0.1, -0.07, 0.03, 0, 0)
    return new THREE.ShapeGeometry(s, 4)
  }, [])
  const leaves = useRef<THREE.InstancedMesh>(null)
  const leafCount = useMemo(() => spots.strands.reduce((n, s) => n + Math.ceil(s.len / 0.11), 0), [spots])
  useLayoutEffect(() => {
    const mesh = leaves.current!
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    const c = new THREE.Color()
    let i = 0
    spots.strands.forEach((st, si) => {
      const n = Math.ceil(st.len / 0.11)
      for (let k = 0; k < n; k++) {
        const h = hash(si * 31 + k)
        e.set(Math.PI + (h - 0.5) * 1.2, h * Math.PI * 2, (hash(si + k * 13) - 0.5) * 1.4)
        q.setFromEuler(e)
        const sc = 0.8 + h * 0.6
        m.compose(new THREE.Vector3(st.at[0] + Math.sin(k * 1.7 + si) * 0.04, st.at[1] - k * 0.11, st.at[2] + Math.cos(k * 1.3 + si) * 0.04), q, new THREE.Vector3(sc, sc, sc))
        mesh.setMatrixAt(i, m)
        mesh.setColorAt(i, c.set(h > 0.55 ? S.leaf : S.leafDark))
        i++
      }
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [spots])

  const disco = useMemo(discoTiles, [])
  const tubes: V3[] = [[4, GRID_Y - 0.12, 3.6], [12, GRID_Y - 0.12, 3.6], [4, GRID_Y - 0.12, 9.4], [8, GRID_Y - 0.12, 9.8], [12, GRID_Y - 0.12, 9.4], [8, GRID_Y - 0.12, 6.8]]
  return (
    <group>
      <mesh rotation-x={Math.PI / 2} position={[W / 2, H, D / 2]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color={S.foifiCeiling} roughness={0.9} />
      </mesh>
      <mesh geometry={bars} material={steel} />
      {spots.baskets.map((p, i) => (
        <group key={`b${i}`} position={p as unknown as [number, number, number]}>
          <mesh rotation-x={Math.PI}>
            <sphereGeometry args={[0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={S.moss} roughness={1} side={THREE.DoubleSide} />
          </mesh>
          <mesh position-y={0.03}>
            <icosahedronGeometry args={[0.26, 1]} />
            <meshStandardMaterial color={S.leaf} roughness={0.9} flatShading />
          </mesh>
        </group>
      ))}
      <instancedMesh ref={leaves} args={[leaf, undefined, leafCount]}>
        <meshStandardMaterial roughness={0.8} side={THREE.DoubleSide} />
      </instancedMesh>
      {spots.globes.map((p, i) => (
        <group key={`g${i}`} position={p as unknown as [number, number, number]}>
          <mesh position-y={(3.55 - p[1]) / 2 + 0.2}>
            <cylinderGeometry args={[0.005, 0.005, 3.55 - p[1], 4]} />
            <meshStandardMaterial color={S.steel} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.24, 24, 16]} />
            <meshStandardMaterial color={S.paper} transparent opacity={0.18} roughness={0.05} depthWrite={false} />
          </mesh>
          {i % 2 === 0 && (
            <mesh>
              <sphereGeometry args={[0.05, 12, 8]} />
              <meshBasicMaterial color={S.lamp} toneMapped={false} />
            </mesh>
          )}
        </group>
      ))}
      {([[6.4, 3.0, 2.2], [9.6, 2.9, 3.4], [3.2, 3.1, 8.6], [12.4, 3.0, 10.2]] as const).map((p, i) => (
        <mesh key={`d${i}`} position={p as unknown as [number, number, number]}>
          <sphereGeometry args={[0.2, 18, 12]} />
          <meshStandardMaterial map={disco} emissiveMap={disco} emissive={S.paper} emissiveIntensity={0.25} metalness={0.5} roughness={0.25} flatShading />
        </mesh>
      ))}
      {tubes.map((p, i) => (
        <mesh key={`t${i}`} position={p as unknown as [number, number, number]}>
          <boxGeometry args={[2.4, 0.04, 0.04]} />
          <meshBasicMaterial color={S.lamp} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

/** Yellow structural columns with hand lettering. */
function Columns() {
  const script = useMemo(columnScript, [])
  return (
    <>
      {([[2.0, 9.8], [13.9, 6.0]] as const).map(([x, z]) => (
        <mesh key={`${x}`} position={[x, H / 2, z]}>
          <cylinderGeometry args={[0.32, 0.32, H, 32]} />
          <meshStandardMaterial map={script} roughness={0.7} />
        </mesh>
      ))}
    </>
  )
}

/** Slatted metal chairs in the venue's mix of colours, instanced. */
function Chairs() {
  const seats = useMemo(() => {
    const out: { x: number; z: number; yaw: number; colour: string }[] = []
    const colours = [S.chairYellow, S.chairLime, S.chairPink, S.chairRed, S.chairMint, S.chairWhite, S.chairTeal, S.chairOrange]
    let k = 0
    for (let z = 4.4; z <= 9.9; z += 0.92) {
      for (const x0 of [2.8, 9.0]) {
        for (let c = 0; c < 6; c++) {
          k++
          out.push({
            x: x0 + c * 0.58 + (hash(k) - 0.5) * 0.06,
            z: z + (hash(k + 300) - 0.5) * 0.12,
            yaw: (hash(k + 600) - 0.5) * 0.25,
            colour: colours[Math.floor(hash(k + 900) * colours.length)]!,
          })
        }
      }
    }
    return out
  }, [])
  const geometry = useMemo(() => {
    const parts = [
      new THREE.BoxGeometry(0.44, 0.03, 0.42).translate(0, 0.45, 0),
      ...[0.58, 0.68, 0.78].map((y) => new THREE.BoxGeometry(0.42, 0.06, 0.02).translate(0, y, 0.21)),
      ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => new THREE.CylinderGeometry(0.012, 0.012, sz > 0 ? 0.86 : 0.45, 6)
        .translate(sx * 0.2, sz > 0 ? 0.43 : 0.225, sz * 0.2))),
    ]
    const merged = mergeGeometries(parts)!
    parts.forEach((p) => p.dispose())
    return merged
  }, [])
  const ref = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const mesh = ref.current!
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const c = new THREE.Color()
    seats.forEach((s, i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), s.yaw)
      m.compose(new THREE.Vector3(s.x, 0, s.z), q, new THREE.Vector3(1, 1, 1))
      mesh.setMatrixAt(i, m)
      mesh.setColorAt(i, c.set(s.colour))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [seats])
  return (
    <instancedMesh ref={ref} args={[geometry, undefined, seats.length]}>
      <meshStandardMaterial roughness={0.55} metalness={0.2} />
    </instancedMesh>
  )
}

/** Big potted plants: monstera and palms, built from flat leaves. */
function Plant({ at, size = 1, palm = false }: { at: readonly [number, number]; size?: number; palm?: boolean }) {
  const leafGeo = useMemo(() => {
    const s = new THREE.Shape()
    if (palm) {
      s.moveTo(0, 0); s.quadraticCurveTo(0.06, 0.5, 0, 1.0); s.quadraticCurveTo(-0.06, 0.5, 0, 0)
    } else {
      // Monstera-ish: broad heart with a notch.
      s.moveTo(0, 0)
      s.bezierCurveTo(0.45, 0.05, 0.5, 0.55, 0.05, 0.7)
      s.lineTo(0.12, 0.45); s.lineTo(0.0, 0.62)
      s.bezierCurveTo(-0.5, 0.55, -0.45, 0.05, 0, 0)
    }
    return new THREE.ShapeGeometry(s, 6)
  }, [palm])
  const n = palm ? 14 : 9
  return (
    <group position={[at[0], 0, at[1]]} scale={size}>
      <mesh position-y={0.25}>
        <cylinderGeometry args={[0.32, 0.24, 0.5, 20]} />
        <meshStandardMaterial color={palm ? S.terracotta : S.plastic} roughness={0.8} />
      </mesh>
      <mesh position-y={0.85}>
        <cylinderGeometry args={[0.025, 0.035, 1.2, 6]} />
        <meshStandardMaterial color={S.woodDark} />
      </mesh>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + hash(i + at[0]) * 0.5
        const y = 0.6 + hash(i + at[1]) * (palm ? 1.0 : 0.9)
        return (
          <mesh key={i} geometry={leafGeo} position={[Math.cos(a) * 0.12, y, Math.sin(a) * 0.12]}
            rotation={[-(0.5 + hash(i * 3) * 0.6), -a + Math.PI / 2, 0]}>
            <meshStandardMaterial color={hash(i * 7) > 0.5 ? S.leaf : S.leafDark} roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
        )
      })}
    </group>
  )
}

/** Pink bar with a white top, back shelves of amber bottles and jars. */
function Bar() {
  const bottles = useRef<THREE.InstancedMesh>(null)
  const count = 46
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    for (let i = 0; i < count; i++) {
      const row = i % 2
      m.makeTranslation(4.4 + (i >> 1) * 0.33, 1.75 + row * 0.55, D - 0.25)
      bottles.current!.setMatrixAt(i, m)
    }
    bottles.current!.instanceMatrix.needsUpdate = true
    bottles.current!.computeBoundingSphere()
  }, [])
  return (
    <group>
      <mesh position={[8.2, 0.55, D - 1.3]}>
        <boxGeometry args={[8.2, 1.1, 0.7]} />
        <meshStandardMaterial color={S.foifiPink} roughness={0.8} />
      </mesh>
      <mesh position={[8.2, 1.12, D - 1.3]}>
        <boxGeometry args={[8.4, 0.05, 0.85]} />
        <meshStandardMaterial color={S.paper} roughness={0.5} />
      </mesh>
      {[1.55, 2.1].map((y) => (
        <mesh key={y} position={[8.2, y, D - 0.25]}>
          <boxGeometry args={[8.2, 0.03, 0.4]} />
          <meshStandardMaterial color={S.steelGalv} metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      <instancedMesh ref={bottles} args={[undefined, undefined, count]}>
        <cylinderGeometry args={[0.045, 0.05, 0.36, 10]} />
        <meshStandardMaterial color={S.amberGlass} roughness={0.15} metalness={0.2} />
      </instancedMesh>
    </group>
  )
}

/** The projector screen on its stand; shows the live frame. */
function ProjectorScreen({ frame }: { frame: THREE.Material }) {
  const img = { w: 3.0, h: 3.0 * (9 / 16) }
  const y = 1.05 + img.h / 2
  return (
    <group position={[W / 2, 0, 0.9]}>
      <mesh position={[0, y, -0.03]}>
        <boxGeometry args={[img.w + 0.4, img.h + 0.4, 0.04]} />
        <meshStandardMaterial color={S.plastic} roughness={0.6} />
      </mesh>
      <mesh position={[0, y, 0]}>
        <planeGeometry args={[img.w + 0.24, img.h + 0.24]} />
        <meshStandardMaterial color={S.screen} roughness={0.95} />
      </mesh>
      <mesh position={[0, y, 0.005]} material={frame}>
        <planeGeometry args={[img.w, img.h]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (img.w / 2 + 0.1), 0.6, -0.05]}>
          <boxGeometry args={[0.04, 1.2, 0.04]} />
          <meshStandardMaterial color={S.plastic} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * The ceiling projector, hung from the steel grid: white body, the lens (its
 * "eye") with the live frame on a panel inside, and a faint beam to the screen.
 */
function Projector({ frame }: { frame: THREE.Material }) {
  const { x, y, z, panel, panelZ } = PROJECTOR
  const img = { w: 3.0, h: 3.0 * (9 / 16), y: 1.05 + (3.0 * (9 / 16)) / 2, z: 0.91 }
  const beam = useMemo(() => {
    // Frustum from the lens rectangle to the projected image: four open sides.
    const a = [panel / 2, (panel * 9) / 32]
    const near = [[-a[0]!, -a[1]!], [a[0]!, -a[1]!], [a[0]!, a[1]!], [-a[0]!, a[1]!]].map(([u, v]) => new THREE.Vector3(x + u!, y + v!, panelZ))
    const far = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([u, v]) => new THREE.Vector3(W / 2 + (u! * img.w) / 2, img.y + (v! * img.h) / 2, img.z))
    const pos: number[] = []
    for (let k = 0; k < 4; k++) {
      const n0 = near[k]!, n1 = near[(k + 1) % 4]!, f0 = far[k]!, f1 = far[(k + 1) % 4]!
      pos.push(...n0.toArray(), ...f0.toArray(), ...f1.toArray(), ...n0.toArray(), ...f1.toArray(), ...n1.toArray())
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    return g
    // constants only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <group>
      <mesh geometry={beam}>
        <meshBasicMaterial color={S.lamp} transparent opacity={0.05} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <group position={[x, y, z]}>
        <mesh position-y={(3.6 - y) / 2 + 0.09}>
          <boxGeometry args={[0.04, 3.6 - y, 0.04]} />
          <meshStandardMaterial color={S.steelGalv} metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.46, 0.18, 0.4]} />
          <meshStandardMaterial color={S.paper} roughness={0.5} />
        </mesh>
        {/* Vent grille on the side. */}
        <mesh position={[0.231, 0, 0.05]} rotation-y={Math.PI / 2}>
          <planeGeometry args={[0.2, 0.1]} />
          <meshStandardMaterial color={S.panelSeam} roughness={0.8} />
        </mesh>
        {/* Lens barrel and rim: the eye. */}
        <mesh position={[0, 0, -0.24]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.075, 0.08, 0.08, 40, 1, true]} />
          <meshStandardMaterial color={S.plastic} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, -0.28]}>
          <ringGeometry args={[0.068, 0.082, 48]} />
          <meshStandardMaterial color={S.chrome} metalness={0.8} roughness={0.25} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, panelZ - z + 0.002]}>
          <circleGeometry args={[0.07, 48]} />
          <meshBasicMaterial color={S.ink} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, panelZ - z]} rotation-y={Math.PI} material={frame}>
          <planeGeometry args={[panel, (panel * 9) / 16]} />
        </mesh>
      </group>
    </group>
  )
}

/** The laptop that shipped conf.zurichjs.com five minutes before doors, showing the live frame. */
function DeployDesk({ frame }: { frame: THREE.Material }) {
  return (
    <group position={[5.4, 0, 2.3]}>
      <mesh position-y={0.73}>
        <boxGeometry args={[1.5, 0.05, 0.75]} />
        <meshStandardMaterial color={S.tableRed} roughness={0.25} />
      </mesh>
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => (
        <mesh key={`${sx}${sz}`} position={[sx * 0.68, 0.36, sz * 0.3]}>
          <boxGeometry args={[0.03, 0.72, 0.03]} />
          <meshStandardMaterial color={S.steel} metalness={0.5} roughness={0.4} />
        </mesh>
      )))}
      <group position={[0, 0.76, 0.05]}>
        <mesh position-y={0.008}>
          <boxGeometry args={[0.34, 0.016, 0.24]} />
          <meshStandardMaterial color={S.chrome} metalness={0.6} roughness={0.35} />
        </mesh>
        <group position={[0, 0.016, -0.12]} rotation-x={-0.28}>
          <mesh position-y={0.11}>
            <boxGeometry args={[0.34, 0.22, 0.008]} />
            <meshStandardMaterial color={S.chrome} metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.11, 0.005]} material={frame}>
            <planeGeometry args={[0.32, 0.18]} />
          </mesh>
        </group>
      </group>
      <mesh position={[0.45, 0.83, 0.1]}>
        <cylinderGeometry args={[0.035, 0.03, 0.14, 16]} />
        <meshStandardMaterial color={S.paper} transparent opacity={0.35} roughness={0.05} />
      </mesh>
    </group>
  )
}

/** The anniversary cake: a chocolate slice with a yellow candle, on the "new Date()" flyer. */
function Cake() {
  const flyer = useMemo(dateFlyer, [])
  const slice = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 0); s.lineTo(0.14, 0.05); s.lineTo(0.14, -0.05); s.closePath()
    return new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: false }).rotateX(-Math.PI / 2)
  }, [])
  return (
    <group position={[10.45, 0, 3.2]}>
      <mesh position-y={0.73}>
        <boxGeometry args={[0.9, 0.05, 0.6]} />
        <meshStandardMaterial color={S.woodDark} roughness={0.5} />
      </mesh>
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => (
        <mesh key={`${sx}${sz}`} position={[sx * 0.4, 0.36, sz * 0.25]}>
          <boxGeometry args={[0.04, 0.72, 0.04]} />
          <meshStandardMaterial color={S.woodDark} />
        </mesh>
      )))}
      <mesh position={[0, 0.758, 0]} rotation={[-Math.PI / 2, 0, 0.12]}>
        <planeGeometry args={[0.42, 0.2]} />
        <meshStandardMaterial map={flyer} roughness={0.6} />
      </mesh>
      <mesh position={[-0.06, 0.765, 0.02]}>
        <boxGeometry args={[0.18, 0.012, 0.11]} />
        <meshStandardMaterial color={S.plastic} roughness={0.3} />
      </mesh>
      <mesh geometry={slice} position={[-0.13, 0.772, 0.02]}>
        <meshStandardMaterial color={S.chocolate} roughness={0.35} />
      </mesh>
      <mesh position={[-0.07, 0.86, 0.02]}>
        <cylinderGeometry args={[0.004, 0.004, 0.11, 8]} />
        <meshStandardMaterial color={S.foifiYellow} roughness={0.5} />
      </mesh>
      {/* Lit: wick, a teardrop flame with a hot core, and a little warm light. */}
      <mesh position={[-0.07, 0.918, 0.02]}>
        <cylinderGeometry args={[0.0008, 0.0008, 0.008, 4]} />
        <meshBasicMaterial color={S.ink} />
      </mesh>
      <mesh position={[-0.07, 0.932, 0.02]} scale={[0.0065, 0.016, 0.0065]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshBasicMaterial color={S.flame} transparent opacity={0.85} toneMapped={false} />
      </mesh>
      <mesh position={[-0.07, 0.928, 0.02]} scale={[0.003, 0.008, 0.003]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshBasicMaterial color={S.lamp} toneMapped={false} />
      </mesh>
      <mesh position={[-0.07, 0.935, 0.02]}>
        <sphereGeometry args={[0.03, 16, 12]} />
        <meshBasicMaterial color={S.flame} transparent opacity={0.12} depthWrite={false} toneMapped={false} />
      </mesh>
      <pointLight position={[-0.07, 0.96, 0.02]} color={S.flame} intensity={0.9} decay={0} distance={0.6 * M} />
    </group>
  )
}

function Lights() {
  const o = (x: number, y: number, z: number) => [x, y, z] as const
  return (
    <>
      <pointLight position={o(5, 3.2, 4)} color={LIGHTS.foifiWarm} intensity={1.3} decay={0} distance={8 * M} />
      <pointLight position={o(11, 3.2, 4)} color={LIGHTS.foifiWarm} intensity={1.2} decay={0} distance={8 * M} />
      <pointLight position={o(8, 3.2, 10)} color={LIGHTS.foifiWarm} intensity={1.2} decay={0} distance={8 * M} />
      <pointLight position={o(8, 4.3, 7)} color={LIGHTS.foifiCool} intensity={0.6} decay={0} distance={9 * M} />
    </>
  )
}

export function Foifi({ frame }: { frame: THREE.Material }) {
  return (
    <group position={[FOIFI.x - W / 2, FLOOR, FOIFI.z]}>
      <Shell />
      <Cutaway>
        <Canopy />
      </Cutaway>
      <Columns />
      <Chairs />
      <Bar />
      <ProjectorScreen frame={frame} />
      <Projector frame={frame} />
      <DeployDesk frame={frame} />
      <Cake />
      <Plant at={[0.9, 0.8]} size={1.4} />
      <Plant at={[15.1, 0.8]} size={1.3} palm />
      <Plant at={[5.6, 0.5]} size={1.1} palm />
      <Plant at={[10.6, 0.5]} size={1.2} />
      <Plant at={[15.0, 12.2]} size={1.3} />
      <Plant at={[1.2, 12.0]} size={1.2} palm />
      <Lights />
    </group>
  )
}
