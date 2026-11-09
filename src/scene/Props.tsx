import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useLoader } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { BENCH, FLOOR, HALL, M, PODIUM, PODIUM_TILT, podiumTop, ROLLUP, STAGE, STAGE_FRONT, STAGE_TOP, SURFACES as S } from './venue'
import { keepAwake } from '../engine/activity'
import { currentAction, sinceReveal, smoothstep } from './beats'
import { WalkOn } from './WalkOn'
import { StagePieces } from './StagePieces'
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

/** The Technopark lectern: white, tall front, sloped reading top. The speaker's laptop and dock sit on it. */
function Podium({ frame }: { frame: THREE.Material }) {
  const logo = useTexture(PROP_ASSETS.technopark)
  logo.colorSpace = THREE.SRGBColorSpace
  logo.anisotropy = 8
  const { depth: D, width: W, front: FRONT_H, drop } = PODIUM
  const geometry = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-D / 2, 0)
    s.lineTo(D / 2, 0)
    s.lineTo(D / 2, FRONT_H)
    s.lineTo(-D / 2, FRONT_H - drop)
    s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth: W, bevelEnabled: false })
    g.translate(0, 0, -W / 2)
    return g
  }, [D, W, FRONT_H, drop])
  const logoH = 0.46 * (218 / 1181)
  return (
    <group position={[PODIUM.x, STAGE_TOP, PODIUM.z]} rotation-y={PODIUM.yaw}>
      <mesh geometry={geometry} rotation-y={-Math.PI / 2}>
        <meshStandardMaterial color={S.podium} roughness={0.5} />
      </mesh>
      <mesh position={[0, FRONT_H - 0.32, D / 2 + 0.002]}>
        <planeGeometry args={[0.46, logoH]} />
        <meshStandardMaterial map={logo} transparent roughness={0.5} />
      </mesh>
      <Laptop frame={frame} />
    </group>
  )
}

/**
 * The speaker's laptop on the podium, the AV dock beside it and the cables:
 * one USB-C from laptop to dock; HDMI (to the projector), RJ45 (wired
 * internet) and power from the dock, over the back edge and along the stage
 * floor to the floor box. Technopark's dock gave speakers screen, sound and
 * a cable connection through one USB-C port (provider's email, Aug 2026).
 * On a slide with `action: 'plug-in'` each cable runs in, one after another.
 * Podium-local metres.
 */
const LAPTOP = { w: 0.31, d: 0.215, base: 0.016 } as const
const DOCK = { x: 0.235, z: 0.03, w: 0.11, d: 0.06, h: 0.022 } as const
/** The floor box (world [-0.4, STAGE_FRONT - 0.45]) in podium-local x/z. */
const FLOOR_BOX = (() => {
  const dx = -0.4 - PODIUM.x
  const dz = STAGE_FRONT - 0.45 - PODIUM.z
  const c = Math.cos(PODIUM.yaw)
  const s = Math.sin(PODIUM.yaw)
  return { x: dx * c - dz * s, z: dx * s + dz * c }
})()
/** A point on the reading top (podium-local), lifted by `up` along its normal. */
const onTop = (x: number, z: number, up = 0) => new THREE.Vector3(x, podiumTop(z) + up, z)

const CABLES = (() => {
  const back = -PODIUM.depth / 2 - 0.012
  const toFloor = (dx: number, dz: number) => [
    new THREE.Vector3(FLOOR_BOX.x - 0.1 + dx, 0.012, FLOOR_BOX.z - 0.05 + dz),
    new THREE.Vector3(1.6 + dx, 0.012, -0.55 + dz),
    new THREE.Vector3(0.35 + dx, 0.012, back - 0.12 + dz),
    new THREE.Vector3(0.3 + dx, 0.35, back - 0.01),
    new THREE.Vector3(0.28 + dx, PODIUM.front - PODIUM.drop - 0.04, back),
    onTop(0.27 + dx, -0.2, 0.03),
    onTop(DOCK.x + dx * 0.5, DOCK.z - DOCK.d / 2 - 0.01, DOCK.h / 2),
  ]
  return [
    // USB-C: dock to the laptop's right-hand port. The first to go in.
    { pts: [onTop(DOCK.x - DOCK.w / 2, DOCK.z + 0.01, DOCK.h / 2), onTop(0.2, 0.06, 0.012), onTop(LAPTOP.w / 2 + 0.004, 0.06, LAPTOP.base / 2)], r: 0.0032, color: S.plastic, at: 0.4 },
    { pts: toFloor(-0.03, 0), r: 0.0052, color: S.plastic, at: 1.6 }, // HDMI
    { pts: toFloor(0, 0.02), r: 0.0032, color: S.uiBlue, at: 2.6 }, // RJ45
    { pts: toFloor(0.03, 0.04), r: 0.0042, color: S.paper, at: 3.6 }, // power
  ]
})()
const PLUG_SECS = 1.0

function Laptop({ frame }: { frame: THREE.Material }) {
  const cables = useMemo(() => CABLES.map((c) => {
    const curve = new THREE.CatmullRomCurve3(c.pts, false, 'centripetal', 0.3)
    const geo = new THREE.TubeGeometry(curve, 160, c.r, 6, false)
    const end = curve.getPointAt(1)
    const dir = curve.getTangentAt(1)
    return { ...c, geo, end, dir, count: geo.index!.count }
  }), [])
  const plugs = useRef<(THREE.Mesh | null)[]>([])
  const led = useRef<THREE.MeshBasicMaterial>(null)
  const st = useRef({ shown: -1 })
  useFrame(() => {
    const t = currentAction() === 'plug-in' ? sinceReveal() : 99
    const key = Math.round(Math.min(t, 6) * 60)
    if (key === st.current.shown) return
    st.current.shown = key
    cables.forEach((c, i) => {
      const k = smoothstep(c.at, c.at + PLUG_SECS, t)
      c.geo.setDrawRange(0, Math.floor((k * c.count) / 6) * 6)
      const plug = plugs.current[i]
      if (plug) plug.visible = k > 0.97
    })
    if (led.current) led.current.color.set(t > CABLES[0]!.at + PLUG_SECS ? S.uiGreen : S.plastic)
    if (t < 6) keepAwake(120)
  })
  const tilt = PODIUM_TILT
  return (
    <group>
      {/* Laptop: base on the sloped top, lid open toward the speaker, the live slide on its screen. */}
      <group position={[0, podiumTop(0) + 0.002, 0]} rotation-x={tilt}>
        <mesh position-y={LAPTOP.base / 2}>
          <boxGeometry args={[LAPTOP.w, LAPTOP.base, LAPTOP.d]} />
          <meshStandardMaterial color={S.chrome} metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, LAPTOP.base + 0.001, -0.03]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[LAPTOP.w * 0.86, LAPTOP.d * 0.5]} />
          <meshStandardMaterial color={S.bezel} roughness={0.7} />
        </mesh>
        <group position={[0, LAPTOP.base, LAPTOP.d / 2]} rotation-x={0.42}>
          <mesh position-y={0.1}>
            <boxGeometry args={[LAPTOP.w, 0.2, 0.007]} />
            <meshStandardMaterial color={S.chrome} metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.1, -0.004]} rotation-y={Math.PI} material={frame}>
            <planeGeometry args={[LAPTOP.w * 0.94, LAPTOP.w * 0.94 * (9 / 16)]} />
          </mesh>
        </group>
      </group>
      {/* The dock: a small black box with a status light. */}
      <group position={[DOCK.x, podiumTop(DOCK.z) + DOCK.h / 2, DOCK.z]} rotation-x={tilt}>
        <mesh>
          <boxGeometry args={[DOCK.w, DOCK.h, DOCK.d]} />
          <meshStandardMaterial color={S.plastic} roughness={0.5} />
        </mesh>
        <mesh position={[DOCK.w / 2 - 0.012, DOCK.h / 2 + 0.0005, -DOCK.d / 2 + 0.01]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.003, 10]} />
          <meshBasicMaterial ref={led} color={S.uiGreen} toneMapped={false} />
        </mesh>
      </group>
      {cables.map((c, i) => (
        <group key={i}>
          <mesh geometry={c.geo}>
            <meshStandardMaterial color={c.color} roughness={0.55} />
          </mesh>
          {/* The connector head, seated once its cable is in. */}
          <mesh
            ref={(m) => { plugs.current[i] = m }}
            position={c.end.clone().addScaledVector(c.dir, -0.008)}
            quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), c.dir)}
          >
            <boxGeometry args={[c.r * 3.4, c.r * 2.2, 0.02]} />
            <meshStandardMaterial color={i === 0 ? S.chrome : c.color} metalness={i === 0 ? 0.6 : 0} roughness={0.4} />
          </mesh>
        </group>
      ))}
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
    g.computeBoundingBox()
    return g
  }, [svg, s])
  const flag = useMemo(flagFace, [])
  // The cut: everything right of the wire is clipped away (world units; the set is scaled by M).
  const cut = useMemo(() => new THREE.Plane(new THREE.Vector3(-1, 0, 0), 1e6), [])
  const foam = useMemo(() => new THREE.MeshStandardMaterial({ color: S.foam, roughness: 0.92, clippingPlanes: [cut] }), [cut])
  const face = useMemo(() => new THREE.MeshStandardMaterial({ map: flag, roughness: 0.92, clippingPlanes: [cut] }), [flag, cut])
  const x0 = -0.75 // left edge of the "Z"
  const z0 = HALL.front + BENCH.depth + 0.12
  const gx = x0 - 31 * s
  const xStart = x0 - 0.45 - 0.36
  const xEnd = gx + geometry.boundingBox!.max.x * s + 0.04
  // In the group photo the letters are held up at the front of the stage.
  const held = useRef<THREE.Group>(null)
  useFrame(() => {
    const g = held.current
    if (!g) return
    const up = currentAction() === 'group-photo'
    g.position.set(0, up ? 0.75 : 0, up ? STAGE_FRONT - 0.55 - z0 : 0)
  })
  return (
    <group ref={held}>
      {/* Negative y scale flips SVG (y-down) to world (y-up); three fixes winding. */}
      <mesh geometry={geometry} material={foam} position={[gx, STAGE_TOP + 23 * s, z0]} scale={[s, -s, s]} />
      <mesh position={[x0 - 0.45, STAGE_TOP + 0.36, z0 + 0.15]} rotation-y={0.08} material={[foam, foam, foam, foam, face, foam]}>
        <boxGeometry args={[0.66, 0.72, 0.3]} />
      </mesh>
      <HotWire plane={cut} x0={xStart} x1={xEnd} z0={z0} />
    </group>
  )
}

/**
 * Cutting the letters by hand, three days before the conference (Nadja): on a
 * slide with `action: 'cut-letters'`, a hot-wire bow runs left to right
 * through a foam block, and the letters are left behind it.
 */
const CUT_SECS = 7
function HotWire({ plane, x0, x1, z0 }: { plane: THREE.Plane; x0: number; x1: number; z0: number }) {
  const block = useRef<THREE.Mesh>(null)
  const bow = useRef<THREE.Group>(null)
  const st = useRef({ shown: -1 })
  const zc = z0 + 0.13
  useFrame(() => {
    const cutting = currentAction() === 'cut-letters'
    const t = cutting ? sinceReveal() : 99
    const key = cutting ? Math.round(Math.min(t, CUT_SECS + 1) * 60) : -2
    if (key === st.current.shown) return
    st.current.shown = key
    const k = smoothstep(0, CUT_SECS, t)
    const x = THREE.MathUtils.lerp(x0, x1, k)
    plane.constant = cutting ? x * M : 1e6
    if (block.current) {
      block.current.visible = cutting && k < 1
      block.current.scale.x = Math.max(0.001, x1 + 0.03 - x)
      block.current.position.x = (x + x1 + 0.03) / 2
    }
    if (bow.current) {
      bow.current.visible = cutting
      // The wire traces the letters' outline: up and down as it advances.
      const y = k < 1 ? 0.33 + 0.24 * Math.sin(t * 5.3) : 0.12
      bow.current.position.set(k < 1 ? x : x1 + 0.25, STAGE_TOP + y, zc)
    }
    if (cutting && t < CUT_SECS + 1) keepAwake(120)
  })
  return (
    <group>
      {/* What is left of the foam block, right of the wire. */}
      <mesh ref={block} position={[x1, STAGE_TOP + 0.37, z0 + 0.14]} visible={false}>
        <boxGeometry args={[1, 0.74, 0.32]} />
        <meshStandardMaterial color={S.foam} roughness={0.95} />
      </mesh>
      <group ref={bow} visible={false}>
        {/* The hot wire runs through the foam's depth; the bow holds it from above. */}
        <mesh rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.0022, 0.0022, 0.52, 6]} />
          <meshBasicMaterial color={S.flame} toneMapped={false} />
        </mesh>
        {[-1, 1].map((k) => (
          <mesh key={k} position={[0, 0.2, k * 0.26]}>
            <boxGeometry args={[0.018, 0.4, 0.018]} />
            <meshStandardMaterial color={S.steel} metalness={0.5} roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.03, 0.03, 0.56]} />
          <meshStandardMaterial color={S.woodDark} roughness={0.6} />
        </mesh>
      </group>
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
      <Podium frame={frame} />
      <Letters />
      <ConfidenceMonitor frame={frame} />
      <FloorBox />
      <RollUp />
      <WalkOn />
      <StagePieces />
    </group>
  )
}
