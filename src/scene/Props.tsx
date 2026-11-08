import { useMemo } from 'react'
import * as THREE from 'three'
import { useLoader } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { BENCH, FLOOR, HALL, ROLLUP, STAGE, STAGE_FRONT, STAGE_TOP, SURFACES as S } from './venue'
import { benchTile, carpetTile, flagFace } from './textures'

export const PROP_ASSETS = {
  wordmark: '/brand/zurichjs-full.svg',
  technopark: '/brand/technopark.png',
  /** ZurichJS community roll-up art, 1000×2000 (Faris, 2026-11-08). */
  rollup: '/brand/rollup.svg',
} as const

/** The riser: carpet top with taped deck seams, black skirt, wood bench, side steps. */
function Riser() {
  const carpet = useMemo(() => carpetTile([STAGE.width / 2, STAGE.depth / 1]), [])
  const bench = useMemo(() => benchTile([BENCH.width / 1.2, 1]), [])
  const skirt = useMemo(() => new THREE.MeshStandardMaterial({ color: S.skirt, roughness: 0.95 }), [])
  const top = useMemo(() => new THREE.MeshStandardMaterial({ map: carpet, roughness: 1 }), [carpet])
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ color: S.wood, roughness: 0.6 }), [])
  const front = useMemo(() => new THREE.MeshStandardMaterial({ map: bench, roughness: 0.6 }), [bench])
  return (
    <group>
      <mesh
        position={[0, STAGE_TOP - STAGE.height / 2, HALL.front + STAGE.depth / 2]}
        material={[skirt, skirt, top, skirt, skirt, skirt]}
      >
        <boxGeometry args={[STAGE.width, STAGE.height, STAGE.depth]} />
      </mesh>
      <mesh
        position={[0, STAGE_TOP + BENCH.height / 2, HALL.front + BENCH.depth / 2]}
        material={[wood, wood, wood, wood, front, wood]}
      >
        <boxGeometry args={[BENCH.width, BENCH.height, BENCH.depth]} />
      </mesh>
      {/* Two side steps, audience-left. */}
      {[
        { h: STAGE.height * (2 / 3), x: -STAGE.width / 2 - 0.3 },
        { h: STAGE.height / 3, x: -STAGE.width / 2 - 0.85 },
      ].map(({ h, x }) => (
        <mesh key={x} position={[x, STAGE_TOP - STAGE.height + h / 2, 1.2]} material={[skirt, skirt, top, skirt, skirt, skirt]}>
          <boxGeometry args={[0.55, h, 1.4]} />
        </mesh>
      ))}
    </group>
  )
}

/** The Technopark lectern: white, tall front, sloped reading top. */
function Podium() {
  const logo = useTexture(PROP_ASSETS.technopark)
  logo.colorSpace = THREE.SRGBColorSpace
  logo.anisotropy = 8
  const D = 0.55
  const W = 0.62
  const FRONT_H = 1.15
  const geometry = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-D / 2, 0)
    s.lineTo(D / 2, 0)
    s.lineTo(D / 2, FRONT_H)
    s.lineTo(-D / 2, FRONT_H - 0.14)
    s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth: W, bevelEnabled: false })
    g.translate(0, 0, -W / 2)
    return g
  }, [])
  const logoH = 0.46 * (218 / 1181)
  return (
    <group position={[-4.35, STAGE_TOP, STAGE_FRONT - 0.7]} rotation-y={0.15}>
      <mesh geometry={geometry} rotation-y={-Math.PI / 2}>
        <meshStandardMaterial color={S.podium} roughness={0.5} />
      </mesh>
      <mesh position={[0, FRONT_H - 0.32, D / 2 + 0.002]}>
        <planeGeometry args={[0.46, logoH]} />
        <meshStandardMaterial map={logo} transparent roughness={0.5} />
      </mesh>
    </group>
  )
}

/** Foam letters "ZurichJS", extruded from the wordmark SVG, plus the flag block. */
function Letters() {
  const svg = useLoader(SVGLoader, PROP_ASSETS.wordmark)
  const CAP = 0.65 // metres, top of Z to baseline
  const s = CAP / 22 // wordmark cap height is 22 svg units
  const geometry = useMemo(() => {
    const parts: THREE.BufferGeometry[] = []
    for (const path of svg.paths) {
      // The square mark lives at x < 29; the foam set replaces it with the flag block.
      const first = path.subPaths[0]?.getPoint(0)
      if (!first || first.x < 29) continue
      for (const shape of path.toShapes()) {
        parts.push(new THREE.ExtrudeGeometry(shape, {
          depth: 0.25 / s,
          bevelEnabled: true,
          bevelThickness: 0.4,
          bevelSize: 0.25,
          bevelSegments: 1,
          curveSegments: 10,
        }))
      }
    }
    const g = mergeGeometries(parts)
    parts.forEach((p) => p.dispose())
    return g
  }, [svg, s])
  const flag = useMemo(flagFace, [])
  const foam = useMemo(() => new THREE.MeshStandardMaterial({ color: S.foam, roughness: 0.92 }), [])
  const face = useMemo(() => new THREE.MeshStandardMaterial({ map: flag, roughness: 0.92 }), [flag])
  const x0 = -0.75 // left edge of the "Z"
  const z0 = HALL.front + BENCH.depth + 0.12
  return (
    <group>
      {/* Negative y scale flips SVG (y-down) to world (y-up); three fixes winding. */}
      <mesh geometry={geometry} material={foam} position={[x0 - 31 * s, STAGE_TOP + 23 * s, z0]} scale={[s, -s, s]} />
      <mesh position={[x0 - 0.45, STAGE_TOP + 0.36, z0 + 0.15]} rotation-y={0.08} material={[foam, foam, foam, foam, face, foam]}>
        <boxGeometry args={[0.66, 0.72, 0.3]} />
      </mesh>
    </group>
  )
}

/** Confidence monitor on a rolling pole stand, screen toward the speaker. */
function ConfidenceMonitor({ frame }: { frame: THREE.Material }) {
  return (
    <group position={[1.3, STAGE_TOP, STAGE_FRONT - 0.65]} rotation-y={-0.12}>
      {[0, Math.PI / 2].map((r) => (
        <mesh key={r} position-y={0.02} rotation-y={r + Math.PI / 4}>
          <boxGeometry args={[0.62, 0.03, 0.07]} />
          <meshStandardMaterial color={S.chrome} metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      <mesh position-y={0.5}>
        <cylinderGeometry args={[0.03, 0.03, 0.96, 12]} />
        <meshStandardMaterial color={S.chrome} metalness={0.8} roughness={0.3} />
      </mesh>
      <group position-y={1.08} rotation-x={0.35}>
        <mesh>
          <boxGeometry args={[0.66, 0.41, 0.05]} />
          <meshStandardMaterial color={S.plastic} roughness={0.5} />
        </mesh>
        <mesh position-z={-0.027} rotation-y={Math.PI} material={frame}>
          <planeGeometry args={[0.62, 0.62 * (9 / 16)]} />
        </mesh>
      </group>
    </group>
  )
}

/** The stage box at the front edge, where the clicker receiver and cables live. */
function FloorBox() {
  return (
    <mesh position={[-0.4, STAGE_TOP + 0.045, STAGE_FRONT - 0.45]} rotation={[-0.25, 0.3, 0]}>
      <boxGeometry args={[0.36, 0.09, 0.2]} />
      <meshStandardMaterial color={S.plastic} roughness={0.6} />
    </mesh>
  )
}

/** A roll-up banner stand: aluminium cassette, printed panel, top rail. */
function RollUp() {
  const art = useTexture(PROP_ASSETS.rollup)
  art.colorSpace = THREE.SRGBColorSpace
  art.anisotropy = 8
  const { width: W, height: H, x, z, yaw } = ROLLUP
  const base = 0.1
  return (
    <group position={[x, FLOOR, z]} rotation-y={yaw}>
      <mesh position-y={base / 2}>
        <boxGeometry args={[W + 0.04, base, 0.2]} />
        <meshStandardMaterial color={S.chrome} metalness={0.7} roughness={0.35} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (W / 2 - 0.05), 0.008, 0]} rotation-y={Math.PI / 2}>
          <boxGeometry args={[0.42, 0.016, 0.05]} />
          <meshStandardMaterial color={S.chrome} metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, base + H / 2, -0.03]}>
        <cylinderGeometry args={[0.008, 0.008, H, 8]} />
        <meshStandardMaterial color={S.chrome} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, base + H / 2, 0]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial map={art} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, base + H + 0.01, 0]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.012, 0.012, W + 0.02, 8]} />
        <meshStandardMaterial color={S.chrome} metalness={0.7} roughness={0.35} />
      </mesh>
    </group>
  )
}

export function Props({ frame }: { frame: THREE.Material }) {
  return (
    <group>
      <Riser />
      <Podium />
      <Letters />
      <ConfidenceMonitor frame={frame} />
      <FloorBox />
      <RollUp />
    </group>
  )
}
