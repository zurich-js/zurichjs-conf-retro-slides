import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { Cutaway } from './layers'
import {
  AIRPORT, AISLES, BRIDGE, FLOOR, GATE_IMAGE, GATE_LEVEL as L, HERO, LIGHTS, LOUNGE, M, PLANE as P, rowZ, SEAT_SCREEN, seatX, SURFACES as S,
} from './venue'
import { cabinCarpet, cabinWindow, departuresHeader, gateSign, hash, ifeWelcome, loungeTiles, terminalWindows } from './textures'

/**
 * Zurich Airport at night: a gate lounge on the airside level, a SWISS
 * 777-300ER parked nose-in outside the glass, and the jet bridge between them.
 * The road photos play on a seat-back screen inside the cabin; the pricing
 * slides play on the departures board in the lounge.
 *
 * Local frame (metres): origin on the apron at the foot of the glass wall,
 * x along the wall, z into the lounge (apron and plane at z < 0), y up.
 * Everything here is built once; nothing changes on navigation.
 */

const YC = L + P.centre // fuselage centreline height
const TAIL_START = P.nose - P.noseLen - P.body
type V3 = readonly [number, number, number]

/** Merge parts into one geometry and free the parts. */
function merge(parts: THREE.BufferGeometry[]) {
  const g = mergeGeometries(parts)!
  parts.forEach((q) => q.dispose())
  return g
}

/** A fuselage ring section from z0 to z1 (z0 > z1), optionally only between angles (θ: 0 bottom, π/2 left/+x, π top). */
function ring(r: number, z0: number, z1: number, theta0 = 0, theta = Math.PI * 2) {
  const g = new THREE.CylinderGeometry(r, r, z0 - z1, 72, 1, true, theta0, theta)
  // Cylinder axis y → z; angle 0 to the bottom.
  g.rotateX(Math.PI / 2)
  g.translate(0, 0, (z0 + z1) / 2)
  return g
}

/** Door openings: angles where the cabin wall is cut from the floor up to door height, both sides. */
const DOOR_TOP = 1.95
function doorAngles(r: number) {
  const lo = Math.acos(Math.min(1, P.centre / r)) // floor level (y = −centre)
  const hi = Math.acos(Math.max(-1, -(DOOR_TOP - P.centre) / r)) // door head
  return { lo, hi }
}

/** The fuselage skin (outer, white) or cabin lining (inner, pale): open at both front doors. */
function shell(r: number) {
  const z0 = P.nose - P.noseLen
  const d0 = P.door.z + P.door.width / 2
  const d1 = P.door.z - P.door.width / 2
  const { lo, hi } = doorAngles(r)
  return merge([
    ring(r, z0, d0),
    // Door zone: the top arc between the two doors' heads, and the bottom arc between their floors.
    ring(r, d0, d1, hi, Math.PI * 2 - 2 * hi),
    ring(r, d0, d1, -lo, 2 * lo),
    ring(r, d1, TAIL_START),
  ])
}

/** A flat wing or stabiliser from a planform (x, z) polygon, `t` thick. */
function planform(pts: readonly (readonly [number, number])[], t: number) {
  const shape = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)))
  const g = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false })
  // Shape in x/y → lay it flat in x/z, centred on its thickness.
  g.rotateX(-Math.PI / 2)
  g.translate(0, -t / 2, 0)
  return g
}

function PlaneExterior() {
  const white = useMemo(() => new THREE.MeshStandardMaterial({ color: S.fuselage, roughness: 0.35, metalness: 0.1 }), [])
  const grey = useMemo(() => new THREE.MeshStandardMaterial({ color: S.engineGrey, roughness: 0.4, metalness: 0.3 }), [])
  const dark = useMemo(() => new THREE.MeshStandardMaterial({ color: S.intake, roughness: 0.6 }), [])
  const red = useMemo(() => new THREE.MeshStandardMaterial({ color: S.swissRed, roughness: 0.45 }), [])
  const glass = useMemo(() => new THREE.MeshStandardMaterial({ color: S.cockpit, roughness: 0.1, metalness: 0.5 }), [])

  const skin = useMemo(() => shell(P.r), [])
  const nose = useMemo(() => {
    const g = new THREE.SphereGeometry(P.r, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2)
    g.rotateX(Math.PI / 2) // dome toward +z
    g.scale(1, 1, P.noseLen / P.r)
    g.translate(0, 0, P.nose - P.noseLen)
    return g
  }, [])
  const tail = useMemo(() => {
    const g = new THREE.SphereGeometry(P.r, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2)
    g.rotateX(-Math.PI / 2) // dome toward −z
    g.scale(1, 1, P.tailLen / P.r)
    g.translate(0, 0, TAIL_START)
    return g
  }, [])
  // Long swept wing (span ~65 m), root low on the fuselage: (x, z) planform, mirrored.
  const wings = useMemo(() => {
    const half: [number, number][] = [[0, -26], [0, -39], [31.5, -50.5], [31.5, -47.8]]
    return merge([
      planform(half, 0.6),
      planform(half.map(([x, z]) => [-x, z] as [number, number]).reverse(), 0.6),
    ]).translate(0, -1.9, 0)
  }, [])
  const stabs = useMemo(() => {
    const half: [number, number][] = [[0, -66], [0, -73.5], [10.6, -77.4], [10.6, -75]]
    return merge([planform(half, 0.3), planform(half.map(([x, z]) => [-x, z] as [number, number]).reverse(), 0.3)]).translate(0, 0.8, 0)
  }, [])
  // Vertical fin in (z, y) above the tail, extruded thin in x.
  const fin = useMemo(() => {
    const top = P.r - 0.25
    const shape = new THREE.Shape([
      new THREE.Vector2(-61.5, top), new THREE.Vector2(-74.5, top), new THREE.Vector2(-78, top + 9.2), new THREE.Vector2(-72.6, top + 9.2),
    ])
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.6, bevelEnabled: false })
    g.rotateY(-Math.PI / 2) // shape x (world z) → z; extrusion → −x
    g.translate(0.3, 0, 0)
    return g
  }, [])
  // The Swiss cross on both sides of the fin.
  const cross = useMemo(() => {
    const cz = -72.2
    const cy = P.r + 4.6
    const parts: THREE.BufferGeometry[] = []
    for (const side of [-1, 1]) {
      const x = side * 0.32
      parts.push(new THREE.BoxGeometry(0.03, 3.4, 1.0).translate(x, cy, cz))
      parts.push(new THREE.BoxGeometry(0.03, 1.0, 3.4).translate(x, cy, cz))
    }
    return merge(parts)
  }, [])
  // GE90-size engines under the wings: nacelle, pylon, dark intake.
  const EX = 9.6
  const EY = -3.75
  const EZ = -31
  const engines = useMemo(() => {
    const parts: THREE.BufferGeometry[] = []
    for (const x of [-EX, EX]) {
      const n = new THREE.CylinderGeometry(1.9, 1.5, 7, 40, 1, false)
      n.rotateX(Math.PI / 2)
      parts.push(n.translate(x, EY, EZ))
      parts.push(new THREE.BoxGeometry(0.5, 1.6, 5).translate(x, -2.3, EZ - 2.2))
    }
    return merge(parts)
  }, [])
  const intakes = useMemo(() => merge([-EX, EX].map((x) => new THREE.CircleGeometry(1.75, 40).translate(x, EY, EZ + 3.51))), [])
  // Passenger windows: rounded, lit warm from the cabin, a row each side, one per seat row.
  const windows = useMemo(() => {
    const parts: THREE.BufferGeometry[] = []
    for (let r = 0; r < P.rows.count; r++) {
      for (const side of [-1, 1]) {
        const g = new THREE.CylinderGeometry(0.14, 0.14, 0.04, 16)
        g.scale(1, 1, 1.45) // taller than wide once turned
        g.rotateX(Math.PI / 2)
        g.rotateZ(Math.PI / 2)
        // The disc's long axis is now y: round-cornered tall window on the skin.
        parts.push(g.translate(side * (P.r + 0.005), 0, rowZ(r) + 0.3))
      }
    }
    return merge(parts)
  }, [])
  const lit = useMemo(() => new THREE.MeshBasicMaterial({ color: LIGHTS.cabin, toneMapped: false }), [])
  // Cockpit: six windscreen panes on the upper front of the nose, each square to the surface.
  // Direction on the unit sphere (azimuth a from dead ahead, elevation e), stretched onto the nose ellipsoid.
  const cockpit = useMemo(() => {
    const parts: THREE.BufferGeometry[] = []
    const z0 = P.nose - P.noseLen
    const m = new THREE.Matrix4()
    const up = new THREE.Vector3(0, 1, 0)
    for (const [deg, w, h] of [[-11, 0.9, 0.6], [11, 0.9, 0.6], [-33, 0.85, 0.56], [33, 0.85, 0.56], [-55, 0.7, 0.48], [55, 0.7, 0.48]] as const) {
      const az = (deg * Math.PI) / 180
      const el = (30 * Math.PI) / 180
      const d = new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az))
      const p = new THREE.Vector3(P.r * d.x, P.r * d.y, z0 + P.noseLen * d.z)
      const n = new THREE.Vector3(d.x / P.r, d.y / P.r, d.z / P.noseLen).normalize()
      const g = new THREE.BoxGeometry(w, h, 0.05)
      m.lookAt(new THREE.Vector3(0, 0, 0), n.clone().negate(), up)
      g.applyMatrix4(m)
      parts.push(g.translate(p.x + n.x * 0.015, p.y + n.y * 0.015, p.z + n.z * 0.015))
    }
    return merge(parts)
  }, [])
  // Door outlines on both sides (doors 1–4), and the lights: red left tip, green right tip, red beacons.
  const outlines = useMemo(() => {
    const parts: THREE.BufferGeometry[] = []
    for (const z of [P.door.z, -27, -44, -58]) for (const side of [-1, 1]) {
      if (z === P.door.z) continue // door 1 is open
      const x = side * (P.r + 0.008)
      for (const [dy, dz, hh, ww] of [[DOOR_TOP - P.centre, 0, 0.03, 1.1], [-P.centre + 0.02, 0, 0.03, 1.1], [(DOOR_TOP / 2) - P.centre, 0.55, DOOR_TOP, 0.03], [(DOOR_TOP / 2) - P.centre, -0.55, DOOR_TOP, 0.03]] as const) {
        parts.push(new THREE.BoxGeometry(0.01, hh, ww).translate(x, dy, z + dz))
      }
    }
    return merge(parts)
  }, [])
  const navRed = useMemo(() => new THREE.MeshBasicMaterial({ color: S.uiRed, toneMapped: false }), [])
  const navGreen = useMemo(() => new THREE.MeshBasicMaterial({ color: S.uiGreen, toneMapped: false }), [])
  // Gear: nose leg and two six-wheel mains, on the apron.
  const gear = useMemo(() => {
    const parts: THREE.BufferGeometry[] = []
    const ground = -YC
    const leg = (x: number, z: number, top: number) => parts.push(new THREE.CylinderGeometry(0.16, 0.16, top - ground - 0.6, 10).translate(x, (top + ground + 0.6) / 2, z))
    const wheel = (x: number, z: number, r: number) => {
      const w = new THREE.CylinderGeometry(r, r, 0.45, 20)
      w.rotateZ(Math.PI / 2)
      parts.push(w.translate(x, ground + r, z))
    }
    leg(0, P.nose - 5, -P.r + 0.4)
    wheel(-0.3, P.nose - 5, 0.55); wheel(0.3, P.nose - 5, 0.55)
    for (const x of [-5.5, 5.5]) {
      leg(x, -40, -2.0)
      for (const dz of [-1.5, 0, 1.5]) { wheel(x - 0.35, -40 + dz, 0.65); wheel(x + 0.35, -40 + dz, 0.65) }
    }
    return merge(parts)
  }, [])
  // Door 1 right, open: swung forward against the skin.
  const rightDoor = useMemo(() => new THREE.BoxGeometry(0.14, DOOR_TOP, P.door.width - 0.1).translate(-P.r - 0.14, DOOR_TOP / 2 - P.centre, P.door.z + P.door.width + 0.15), [])

  return (
    <group position={[P.x, YC, 0]}>
      <mesh geometry={skin} material={white} />
      <mesh geometry={nose} material={white} />
      <mesh geometry={tail} material={white} />
      <mesh geometry={wings} material={grey} />
      <mesh geometry={stabs} material={white} />
      <mesh geometry={fin} material={red} />
      <mesh geometry={cross} material={white} />
      <mesh geometry={engines} material={grey} />
      <mesh geometry={intakes} material={dark} />
      <mesh geometry={windows} material={lit} />
      <mesh geometry={cockpit} material={glass} />
      <mesh geometry={outlines} material={dark} />
      <mesh position={[31.5, -1.9, -49.2]} material={navRed}><sphereGeometry args={[0.16, 10, 8]} /></mesh>
      <mesh position={[-31.5, -1.9, -49.2]} material={navGreen}><sphereGeometry args={[0.16, 10, 8]} /></mesh>
      <mesh position={[0, P.r + 0.1, -30]} material={navRed}><sphereGeometry args={[0.14, 10, 8]} /></mesh>
      <mesh position={[0, -P.r - 0.1, -34]} material={navRed}><sphereGeometry args={[0.14, 10, 8]} /></mesh>
      <mesh geometry={gear} material={dark} />
      <mesh geometry={rightDoor} material={white} />
    </group>
  )
}

/**
 * One SWISS 777 economy seat, facing +z; origin on the floor at the back plane.
 * Parts by material, so each is one instanced mesh: taupe check fabric (back,
 * cushion, pocket), brown leather headrest, white headrest cover, beige back
 * shell with a hood round the screen, light grey armrests and latch, black
 * screen bezel and card slot, legs.
 */
const SW = P.seat.width - 0.02
const SEAT = {
  fabric: () => merge([
    new THREE.BoxGeometry(SW - 0.02, 0.66, 0.08).translate(0, 0.83, 0.03), // backrest front
    new THREE.BoxGeometry(SW - 0.02, 0.12, 0.46).translate(0, 0.46, 0.29), // cushion
    new THREE.BoxGeometry(0.36, 0.13, 0.03).translate(0, 0.52, -0.095), // literature pocket on the back
  ]),
  leather: () => merge([
    new THREE.BoxGeometry(SW - 0.06, 0.24, 0.13).translate(0, 1.25, 0.02), // headrest pad
    new THREE.BoxGeometry(SW, 0.06, 0.12).translate(0, 1.135, 0.0), // leather top of the backrest
  ]),
  cover: () => new THREE.BoxGeometry(0.27, 0.3, 0.012).translate(0, 1.2, 0.092),
  shell: () => merge([
    new THREE.BoxGeometry(SW, 0.7, 0.07).translate(0, 0.77, -0.04), // back shell
    new THREE.BoxGeometry(SW - 0.04, 0.05, 0.05).translate(0, 1.11, -0.06), // hood over the screen
  ]),
  grey: () => merge([
    new THREE.BoxGeometry(0.05, 0.05, 0.46).translate(SW / 2 + 0.005, 0.66, 0.24),
    new THREE.BoxGeometry(0.05, 0.05, 0.46).translate(-SW / 2 - 0.005, 0.66, 0.24),
    new THREE.BoxGeometry(0.05, 0.05, 0.03).translate(0, 0.69, -0.085), // tray latch
    new THREE.BoxGeometry(0.06, 0.4, 0.06).translate(0, 0.2, 0.3), // leg
  ]),
  bezel: () => merge([
    new THREE.BoxGeometry(SEAT_SCREEN.width + 0.05, (SEAT_SCREEN.width * 9) / 16 + 0.065, 0.016).translate(0, SEAT_SCREEN.y - 0.008, -0.083),
    new THREE.BoxGeometry(0.28, 0.025, 0.02).translate(0, 0.83, -0.08), // safety-card slot
  ]),
}

function Instanced({ geometry, material, at }: { geometry: THREE.BufferGeometry; material: THREE.Material; at: readonly V3[] }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    at.forEach((p, i) => ref.current!.setMatrixAt(i, m.makeTranslation(p[0], p[1], p[2])))
    ref.current!.instanceMatrix.needsUpdate = true
    ref.current!.computeBoundingSphere()
  }, [at])
  return <instancedMesh ref={ref} args={[geometry, material, at.length]} />
}

function Cabin({ frame }: { frame: THREE.Material }) {
  const lining = useMemo(() => new THREE.MeshStandardMaterial({ color: S.cabinShell, roughness: 0.8, side: THREE.BackSide }), [])
  const mats = useMemo(() => ({
    fabric: new THREE.MeshStandardMaterial({ color: S.seatFabric, roughness: 0.95 }),
    leather: new THREE.MeshStandardMaterial({ color: S.seatLeather, roughness: 0.55 }),
    cover: new THREE.MeshStandardMaterial({ color: S.headCover, roughness: 0.9 }),
    shell: new THREE.MeshStandardMaterial({ color: S.seatShell, roughness: 0.5 }),
    grey: new THREE.MeshStandardMaterial({ color: S.armGrey, roughness: 0.5 }),
    bezel: new THREE.MeshStandardMaterial({ color: S.bezel, roughness: 0.25, metalness: 0.3 }),
    bin: new THREE.MeshStandardMaterial({ color: S.cabinBin, roughness: 0.6 }),
    mauve: new THREE.MeshBasicMaterial({ color: S.aisleMauve }),
    glow: new THREE.MeshBasicMaterial({ color: LIGHTS.cabin, toneMapped: false }),
  }), [])
  const parts = useMemo(() => ({
    fabric: SEAT.fabric(), leather: SEAT.leather(), cover: SEAT.cover(), shell: SEAT.shell(), grey: SEAT.grey(), bezel: SEAT.bezel(),
  }), [])
  const carpet = useMemo(cabinCarpet, [])
  const win = useMemo(cabinWindow, [])
  const welcome = useMemo(ifeWelcome, [])
  const welcomeMat = useMemo(() => new THREE.MeshBasicMaterial({ map: welcome, toneMapped: false }), [welcome])

  const lin = useMemo(() => shell(P.ri), [])
  const sh = (SEAT_SCREEN.width * 9) / 16
  // Screens sit 8 mm proud of their bezel: never coplanar, so they cannot fight for depth.
  const screen = useMemo(() => new THREE.PlaneGeometry(SEAT_SCREEN.width, sh).rotateY(Math.PI).translate(0, SEAT_SCREEN.y, SEAT_SCREEN.z), [sh])
  const z0 = P.nose - P.noseLen - 0.15
  const z1 = TAIL_START + 0.3
  const half = Math.sqrt(P.ri * P.ri - P.centre * P.centre)

  const seats = useMemo(() => {
    const out: V3[] = []
    for (let r = 0; r < P.rows.count; r++) for (let k = 0; k < 10; k++) out.push([seatX(k) - P.x, -P.centre, rowZ(r)])
    return out
  }, [])
  // Every seat back has a screen on the welcome page; the one in front of us shows the live frame.
  const hero = seats.findIndex(([x, , z]) => Math.abs(x - (seatX(HERO.seat) - P.x)) < 1e-6 && Math.abs(z - rowZ(HERO.row - 1)) < 1e-6)
  const screens = useMemo(() => seats.filter((_, i) => i !== hero), [seats, hero])
  // Big rounded window reveals, one per row each side, at the seated eye line.
  const winGeo = useMemo(() => {
    const out: THREE.BufferGeometry[] = []
    const y = 0.05
    const x = Math.sqrt(P.ri * P.ri - y * y) - 0.03
    for (let r = 0; r < P.rows.count; r++) for (const side of [-1, 1]) {
      out.push(new THREE.PlaneGeometry(0.44, 0.7).rotateY(-side * Math.PI / 2).translate(side * x, y, rowZ(r) + 0.3))
    }
    return merge(out)
  }, [])
  const L2 = z0 - z1 - 3
  const zc = (z0 + z1) / 2 - 1.5
  // Side bins over the windows, centre bins over the middle block; light strips under the side bins.
  const bins = useMemo(() => merge([
    ...[-1, 1].map((side) => new THREE.BoxGeometry(0.72, 0.5, L2).rotateZ(side * 0.28).translate(side * (P.ri - 0.62), 1.15, zc)),
    ...[-1, 1].map((side) => new THREE.BoxGeometry(0.85, 0.42, L2).translate(side * 0.55 + (seatX(4.5) - P.x), 1.32, zc)),
  ]), [L2, zc])
  const strips = useMemo(() => merge([-1, 1].map((side) => new THREE.BoxGeometry(0.03, 0.03, L2).translate(side * (P.ri - 1.0), 0.88, zc))), [L2, zc])
  const ceiling = useMemo(() => merge([-1, 1].map((side) => new THREE.BoxGeometry(0.75, 0.04, z0 - z1).translate(side * 1.12, 1.68, (z0 + z1) / 2))), [z0, z1])
  const aisleLines = useMemo(() => merge(
    [AISLES.left, AISLES.right].flatMap((ax) => [-1, 1].map((e) => new THREE.PlaneGeometry(0.03, z0 - z1 - 1).rotateX(-Math.PI / 2).translate(ax - P.x + e * 0.24, -P.centre + 0.008, (z0 + z1) / 2))),
  ), [z0, z1])

  return (
    <group position={[P.x, YC, 0]}>
      <mesh geometry={lin} material={lining} />
      <mesh rotation-x={-Math.PI / 2} position={[0, -P.centre + 0.004, (z0 + z1) / 2]}>
        <planeGeometry args={[half * 2, z0 - z1]} />
        <meshStandardMaterial map={carpet} roughness={0.95} />
      </mesh>
      <mesh geometry={aisleLines} material={mats.mauve} />
      {/* Front bulkhead and the aft galley wall. */}
      <mesh position={[0, 0, z0 + 0.1]} rotation-y={Math.PI}>
        <circleGeometry args={[P.ri, 48]} />
        <meshStandardMaterial color={S.cabinShell} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, z1]}>
        <circleGeometry args={[P.ri, 48]} />
        <meshStandardMaterial color={S.cabinShell} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={winGeo}>
        <meshBasicMaterial map={win} />
      </mesh>
      <mesh geometry={bins} material={mats.bin} />
      <mesh geometry={strips} material={mats.glow} />
      <mesh geometry={ceiling} material={mats.glow} />
      {(Object.keys(parts) as (keyof typeof parts)[]).map((k) => (
        <Instanced key={k} geometry={parts[k]} material={mats[k]} at={seats} />
      ))}
      <Instanced geometry={screen} material={welcomeMat} at={screens} />
      {/* Our screen: the live frame. */}
      <mesh geometry={screen} material={frame} position={seats[hero] as unknown as [number, number, number]} />
      {[-20, -28, -36, -44, -52].map((z) => (
        <pointLight key={z} position={[0, 1.4, z]} color={LIGHTS.cabin} intensity={0.7} decay={0} distance={9 * M} />
      ))}
    </group>
  )
}

/** The departures board: black housing hung from the ceiling, header strip, the live frame. */
function Board({ frame }: { frame: THREE.Material }) {
  const header = useMemo(departuresHeader, [])
  const w = GATE_IMAGE.width
  const h = (w * 9) / 16
  const [cx, cy, cz] = GATE_IMAGE.centre
  const local: V3 = [cx - AIRPORT.x, cy - FLOOR, cz - AIRPORT.z]
  const headH = w * (96 / 1024)
  const top = h / 2 + headH + 0.07
  const ceil = L + LOUNGE.height - local[1]
  return (
    <group position={local as unknown as [number, number, number]}>
      {/* Brushed silver bezel round a black face, like a split-flap board. */}
      <mesh position={[0, headH / 2, -0.1]}>
        <boxGeometry args={[w + 0.3, h + headH + 0.3, 0.14]} />
        <meshStandardMaterial color={S.chrome} metalness={0.8} roughness={0.32} />
      </mesh>
      <mesh position={[0, headH / 2, -0.03]}>
        <boxGeometry args={[w + 0.12, h + headH + 0.12, 0.04]} />
        <meshStandardMaterial color={S.ink} roughness={0.5} />
      </mesh>
      {/* Header and screen 1 cm proud of the black face, so they never z-fight with it. */}
      <mesh position={[0, h / 2 + headH / 2, 0.012]}>
        <planeGeometry args={[w, headH]} />
        <meshBasicMaterial map={header} toneMapped={false} />
      </mesh>
      <mesh position-z={0.012} material={frame}>
        <planeGeometry args={[w, h]} />
      </mesh>
      {/* Two hanging rods to the ceiling. */}
      {[-w / 3, w / 3].map((x) => (
        <mesh key={x} position={[x, (ceil + top) / 2 + 0.08, -0.1]}>
          <cylinderGeometry args={[0.02, 0.02, ceil - top, 8]} />
          <meshStandardMaterial color={S.chrome} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

/** Rows of linked black gate seats, leaving a walkway from the jet bridge door. */
function GateSeats() {
  const geo = useMemo(() => merge([
    new THREE.BoxGeometry(0.5, 0.06, 0.48).translate(0, 0.45, 0),
    new THREE.BoxGeometry(0.5, 0.48, 0.05).translate(0, 0.72, 0.22).rotateX(0),
    new THREE.BoxGeometry(0.04, 0.42, 0.04).translate(0, 0.21, 0),
  ]), [])
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: S.gateSeat, roughness: 0.45, metalness: 0.2 }), [])
  const at = useMemo(() => {
    const out: V3[] = []
    for (const z of [6.5, 9.0, 11.5]) {
      for (let x = -15; x <= 1.2; x += 0.55) out.push([x, L, z])
      for (let x = 6.6; x <= 16; x += 0.55) out.push([x, L, z])
    }
    return out
  }, [])
  return <Instanced geometry={geo} material={mat} at={at} />
}

function Lounge({ frame }: { frame: THREE.Material }) {
  const tiles = useMemo(loungeTiles, [])
  const sign = useMemo(gateSign, [])
  const W = LOUNGE.x1 - LOUNGE.x0
  const H = LOUNGE.height
  const D = LOUNGE.depth
  const midX = (LOUNGE.x0 + LOUNGE.x1) / 2
  // Glass wall: mullions every 2.5 m, transoms at sill, door head and top; a gap for the bridge door.
  const mullions = useMemo(() => {
    const parts: THREE.BufferGeometry[] = []
    for (let x = LOUNGE.x0; x <= LOUNGE.x1 + 1e-6; x += 2.5) parts.push(new THREE.BoxGeometry(0.08, H, 0.12).translate(x, L + H / 2, 0))
    for (const y of [0.1, BRIDGE.height + 0.05, H - 0.05]) parts.push(new THREE.BoxGeometry(W, 0.08, 0.12).translate(midX, L + y, 0))
    return merge(parts)
  }, [W, H, midX])
  const glassL = BRIDGE.x - BRIDGE.width / 2 - LOUNGE.x0
  const glassR = LOUNGE.x1 - (BRIDGE.x + BRIDGE.width / 2)
  const lights = useMemo(() => merge(
    [3, 7, 11, 15].map((z) => new THREE.BoxGeometry(W - 4, 0.04, 0.18).translate(midX, L + H - 0.04, z)),
  ), [W, H, midX])
  const glassMat = useMemo(() => new THREE.MeshStandardMaterial({ color: S.glass, transparent: true, opacity: 0.14, roughness: 0.05, metalness: 0.3, depthWrite: false, side: THREE.DoubleSide }), [])
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[midX, L, D / 2]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial map={tiles} roughness={0.35} />
      </mesh>
      {/* Back and end walls. */}
      <mesh position={[midX, L + H / 2, D]} rotation-y={Math.PI}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color={S.loungeWall} roughness={0.85} />
      </mesh>
      {[LOUNGE.x0, LOUNGE.x1].map((x) => (
        <mesh key={x} position={[x, L + H / 2, D / 2]} rotation-y={x < 0 ? Math.PI / 2 : -Math.PI / 2}>
          <planeGeometry args={[D, H]} />
          <meshStandardMaterial color={S.loungeWall} roughness={0.85} />
        </mesh>
      ))}
      {/* Glass, either side of the bridge door, and above it. */}
      <mesh position={[LOUNGE.x0 + glassL / 2, L + H / 2, 0]} material={glassMat}><planeGeometry args={[glassL, H]} /></mesh>
      <mesh position={[LOUNGE.x1 - glassR / 2, L + H / 2, 0]} material={glassMat}><planeGeometry args={[glassR, H]} /></mesh>
      <mesh position={[BRIDGE.x, L + (BRIDGE.height + H) / 2, 0]} material={glassMat}><planeGeometry args={[BRIDGE.width, H - BRIDGE.height]} /></mesh>
      <mesh geometry={mullions}>
        <meshStandardMaterial color={S.glassMullion} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* The terminal below the lounge, down to the apron. */}
      <mesh position={[midX, L / 2, 0.2]}>
        <boxGeometry args={[W + 0.4, L, 0.4]} />
        <meshStandardMaterial color={S.terminal} roughness={0.8} />
      </mesh>
      <Cutaway>
        <mesh position={[midX, L + H, D / 2]} rotation-x={Math.PI / 2}>
          <planeGeometry args={[W, D]} />
          <meshStandardMaterial color={S.loungeWall} emissive={S.loungeWall} emissiveIntensity={0.35} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
        <mesh geometry={lights}>
          <meshBasicMaterial color={LIGHTS.lounge} toneMapped={false} />
        </mesh>
        <mesh position={[midX, L + H + 0.56, D / 2 - 0.2]}>
          <boxGeometry args={[W + 1.2, 1.0, D + 1.2]} />
          <meshStandardMaterial color={S.terminal} roughness={0.8} />
        </mesh>
      </Cutaway>
      {/* Gate desk and its sign by the glass. */}
      <group position={[-9, L, 2.6]}>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[2.6, 1.1, 0.8]} />
          <meshStandardMaterial color={S.desk} roughness={0.5} />
        </mesh>
        <mesh position={[0, 2.5, -0.3]}>
          <boxGeometry args={[1.4, 0.55, 0.08]} />
          <meshStandardMaterial color={S.ink} roughness={0.5} />
        </mesh>
        <mesh position={[0, 2.5, -0.255]}>
          <planeGeometry args={[1.32, 0.495]} />
          <meshBasicMaterial map={sign} toneMapped={false} />
        </mesh>
      </group>
      <GateSeats />
      <Board frame={frame} />
      <pointLight position={[-6, L + 4, 8]} color={LIGHTS.lounge} intensity={0.8} decay={0} distance={14 * M} />
      <pointLight position={[8, L + 4, 8]} color={LIGHTS.lounge} intensity={0.8} decay={0} distance={14 * M} />
    </group>
  )
}

/** The jet bridge: a glazed tunnel out of the lounge, then across to the plane's front-left door. */
function JetBridge() {
  const door = P.x + P.r + 0.05
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: S.bridgeGrey, roughness: 0.6, metalness: 0.3, side: THREE.DoubleSide }), [])
  const floor = useMemo(() => new THREE.MeshStandardMaterial({ color: S.cabinCarpet, roughness: 0.9 }), [])
  const geo = useMemo(() => {
    const { width: w, height: h, x } = BRIDGE
    const zDoor = P.door.z
    const parts: THREE.BufferGeometry[] = []
    // Leg A: along −z from the glass to the door's z.
    const lenA = -zDoor + w / 2
    parts.push(new THREE.PlaneGeometry(lenA, h).rotateY(Math.PI / 2).translate(x - w / 2, L + h / 2, -lenA / 2))
    parts.push(new THREE.PlaneGeometry(lenA - w, h).rotateY(Math.PI / 2).translate(x + w / 2, L + h / 2, -(lenA - w) / 2))
    parts.push(new THREE.PlaneGeometry(w, lenA).rotateX(Math.PI / 2).translate(x, L + h, -lenA / 2))
    // Leg B: along −x from the corner to the plane.
    const lenB = x - door
    parts.push(new THREE.PlaneGeometry(lenB, h).translate(door + lenB / 2, L + h / 2, zDoor - w / 2))
    parts.push(new THREE.PlaneGeometry(lenB - w, h).translate(door + (lenB - w) / 2, L + h / 2, zDoor + w / 2))
    parts.push(new THREE.PlaneGeometry(lenB, w).rotateX(Math.PI / 2).translate(door + lenB / 2, L + h, zDoor))
    // Rotunda leg and wheels under the corner.
    parts.push(new THREE.CylinderGeometry(0.25, 0.25, L, 12).translate(x, L / 2, zDoor * 0.55))
    parts.push(new THREE.BoxGeometry(1.6, 0.5, 0.8).translate(x, 0.25, zDoor * 0.55))
    return merge(parts)
  }, [door])
  const floorGeo = useMemo(() => {
    const { width: w, x } = BRIDGE
    const zDoor = P.door.z
    const lenA = -zDoor + w / 2
    const lenB = x - door
    return merge([
      new THREE.PlaneGeometry(w, lenA).rotateX(-Math.PI / 2).translate(x, L + 0.01, -lenA / 2),
      new THREE.PlaneGeometry(lenB, w).rotateX(-Math.PI / 2).translate(door + lenB / 2, L + 0.01, zDoor),
    ])
  }, [door])
  return (
    <group>
      <mesh geometry={geo} material={mat} />
      <mesh geometry={floorGeo} material={floor} />
      <pointLight position={[BRIDGE.x, L + 2.1, P.door.z / 2]} color={LIGHTS.lounge} intensity={0.5} decay={0} distance={7 * M} />
    </group>
  )
}

/** The apron: asphalt, the stand's lead-in line, floodlight masts, distant terminals and taxiway lights. */
function Apron() {
  const asphalt = useMemo(() => new THREE.MeshStandardMaterial({ color: S.asphalt, roughness: 0.95 }), [])
  const yellow = useMemo(() => new THREE.MeshBasicMaterial({ color: S.apronYellow }), [])
  const lamp = useMemo(() => new THREE.MeshBasicMaterial({ color: LIGHTS.apron, toneMapped: false }), [])
  const windows = useMemo(terminalWindows, [])
  const taxi = useMemo(() => {
    const parts: THREE.BufferGeometry[] = []
    for (let i = 0; i < 40; i++) {
      for (const z of [-95, -103]) parts.push(new THREE.SphereGeometry(0.18, 6, 4).translate(-120 + i * 6 + hash(i) * 0.5, 0.2, z))
    }
    return merge(parts)
  }, [])
  const lines = useMemo(() => merge([
    new THREE.PlaneGeometry(0.2, 44).rotateX(-Math.PI / 2).translate(P.x, 0.02, -26),
    new THREE.PlaneGeometry(4, 0.25).rotateX(-Math.PI / 2).translate(P.x, 0.02, P.nose - 2.6),
  ]), [])
  const masts = [[-46, -16], [26, -64]] as const
  // Kept east of local x = −40 (world 110) so it stays clear of Technopark and its streets.
  const ground = useMemo(() => new THREE.PlaneGeometry(180, 210).rotateX(-Math.PI / 2).translate(50, 0, -65), [])
  return (
    <group>
      <mesh geometry={ground} material={asphalt} />
      <mesh geometry={lines} material={yellow} />
      {masts.map(([x, z]) => (
        <group key={x} position={[x, 0, z]}>
          <mesh position-y={12.5}>
            <cylinderGeometry args={[0.25, 0.35, 25, 10]} />
            <meshStandardMaterial color={S.terminal} roughness={0.6} />
          </mesh>
          <mesh position-y={25.2} material={lamp}>
            <boxGeometry args={[3.2, 0.5, 1.0]} />
          </mesh>
          <pointLight position={[0, 24, 0]} color={LIGHTS.apron} intensity={1.6} decay={0} distance={55 * M} />
        </group>
      ))}
      {/* Other piers across the apron: long low blocks with lit windows. */}
      {[[-60, -120, 0.0], [70, -125, 0.15]].map(([x, z, yaw]) => (
        <group key={x} position={[x!, 0, z!]} rotation-y={yaw!}>
          <mesh position-y={6}>
            <boxGeometry args={[90, 12, 18]} />
            <meshStandardMaterial color={S.terminal} roughness={0.8} />
          </mesh>
          <mesh position={[0, 7, 9.02]}>
            <planeGeometry args={[88, 5]} />
            <meshBasicMaterial map={windows} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh geometry={taxi}>
        <meshBasicMaterial color={S.uiBlue} toneMapped={false} />
      </mesh>
    </group>
  )
}

export function Airport({ frame }: { frame: THREE.Material }) {
  return (
    <group position={[AIRPORT.x, FLOOR, AIRPORT.z]}>
      <Apron />
      <Lounge frame={frame} />
      <JetBridge />
      <PlaneExterior />
      <Cabin frame={frame} />
    </group>
  )
}
