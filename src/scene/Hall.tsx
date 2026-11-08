import { useMemo } from 'react'
import * as THREE from 'three'
import {
  BOOTH, DOORS, FLOOR, HALL, HALL_BACK, IMAGE, SIDE_SCREEN, SURFACE, SURFACES as S,
} from './venue'
import { Cutaway } from './layers'
import { clockFace, flapNumber, floorTile, panelTile, slatTile, woodBay, woodPlain } from './textures'

/**
 * The auditorium shell: floor, walls, gabled ceiling, steel, ducts, the
 * screen wall (surface, curtains, side screens) and the lighting rig.
 * Authored in metres inside the Set's scaled group.
 */

const HALF = HALL.width / 2
const MID_Z = HALL.front + HALL.depth / 2

/**
 * Front/back wall outline: rectangle plus gable. With `doors`, the bottom edge
 * is notched for the two double doors (notches, not holes: earcut needs holes
 * strictly inside the outline).
 */
export function gable(doors = false): THREE.Shape {
  const s = new THREE.Shape()
  s.moveTo(-HALF, FLOOR)
  if (doors) {
    for (const cx of [-DOORS.x, DOORS.x]) {
      s.lineTo(cx - DOORS.width / 2, FLOOR)
      s.lineTo(cx - DOORS.width / 2, FLOOR + DOORS.height)
      s.lineTo(cx + DOORS.width / 2, FLOOR + DOORS.height)
      s.lineTo(cx + DOORS.width / 2, FLOOR)
    }
  }
  s.lineTo(HALF, FLOOR)
  s.lineTo(HALF, FLOOR + HALL.eave)
  s.lineTo(0, FLOOR + HALL.ridge)
  s.lineTo(-HALF, FLOOR + HALL.eave)
  s.closePath()
  return s
}

function Floor() {
  const map = useMemo(() => floorTile([HALL.width, HALL.depth]), [])
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, FLOOR, MID_Z]}>
      <planeGeometry args={[HALL.width, HALL.depth]} />
      <meshStandardMaterial map={map} roughness={0.55} />
    </mesh>
  )
}

function FrontWall() {
  const geometry = useMemo(() => new THREE.ShapeGeometry(gable()), [])
  const map = useMemo(() => panelTile([1 / 1.2, 1 / 1.5]), [])
  return (
    <mesh geometry={geometry} position-z={HALL.front}>
      <meshStandardMaterial map={map} roughness={0.9} />
    </mesh>
  )
}

function BackWall() {
  const geometry = useMemo(() => {
    const s = gable(true)
    const w = BOOTH.window
    const hole = new THREE.Path()
    hole.moveTo(-w.width / 2, w.sill)
    hole.lineTo(-w.width / 2, w.top)
    hole.lineTo(w.width / 2, w.top)
    hole.lineTo(w.width / 2, w.sill)
    hole.closePath()
    s.holes.push(hole)
    return new THREE.ExtrudeGeometry(s, { depth: BOOTH.wall, bevelEnabled: false })
  }, [])
  const map = useMemo(() => woodPlain([1 / 1.8, 1 / 2]), [])
  const clock = useMemo(clockFace, [])
  return (
    <group>
      <mesh geometry={geometry} position-z={HALL_BACK}>
        <meshStandardMaterial map={map} roughness={0.7} />
      </mesh>
      <mesh position={[0, BOOTH.window.sill - 0.55, HALL_BACK - 0.03]} rotation-y={Math.PI}>
        <circleGeometry args={[0.32, 48]} />
        <meshStandardMaterial map={clock} roughness={0.6} />
      </mesh>
    </group>
  )
}

function SideWalls() {
  const { map, glow } = useMemo(() => woodBay([HALL.depth / 1.8, 1]), [])
  return (
    <>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * HALF, FLOOR + HALL.eave / 2, MID_Z]}
          rotation-y={-side * Math.PI / 2}
        >
          <planeGeometry args={[HALL.depth, HALL.eave]} />
          <meshStandardMaterial
            map={map}
            emissiveMap={glow}
            emissive={S.glow}
            emissiveIntensity={0.95}
            roughness={0.75}
          />
        </mesh>
      ))}
    </>
  )
}

/** Two sloped slat planes meeting at the ridge. */
function Ceiling() {
  const slope = Math.hypot(HALF, HALL.ridge - HALL.eave)
  const angle = Math.atan2(HALL.ridge - HALL.eave, HALF)
  const map = useMemo(() => slatTile([slope, HALL.depth]), [slope])
  return (
    <>
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * HALF / 2, FLOOR + (HALL.eave + HALL.ridge) / 2, MID_Z]}
          rotation-z={-side * angle}
        >
          <mesh rotation-x={Math.PI / 2}>
            <planeGeometry args={[slope, HALL.depth]} />
            <meshStandardMaterial map={map} roughness={0.85} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </>
  )
}

function Beam({ from, to, size = 0.22 }: { from: readonly [number, number, number]; to: readonly [number, number, number]; size?: number }) {
  const a = new THREE.Vector3(...from)
  const b = new THREE.Vector3(...to)
  const mid = a.clone().add(b).multiplyScalar(0.5)
  const len = a.distanceTo(b)
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), b.clone().sub(a).normalize())
  return (
    <mesh position={mid} quaternion={q}>
      <boxGeometry args={[len, size, size * 0.8]} />
      <meshStandardMaterial color={S.steel} roughness={0.6} metalness={0.4} />
    </mesh>
  )
}

/** Black steel trusses across the hall, following the gable. */
function Trusses() {
  const tie = FLOOR + HALL.eave - 0.1
  const top = FLOOR + HALL.ridge - 0.25
  return (
    <>
      {[1.6, 6.2, 10.8, 15.4].map((z) => (
        <group key={z}>
          <Beam from={[-HALF, tie, z]} to={[HALF, tie, z]} />
          <Beam from={[-HALF, FLOOR + HALL.eave - 0.15, z]} to={[0, top, z]} />
          <Beam from={[HALF, FLOOR + HALL.eave - 0.15, z]} to={[0, top, z]} />
          <Beam from={[0, tie, z]} to={[0, top, z]} size={0.16} />
          <Beam from={[-HALF / 2, tie, z]} to={[0, top, z]} size={0.12} />
          <Beam from={[HALF / 2, tie, z]} to={[0, top, z]} size={0.12} />
        </group>
      ))}
    </>
  )
}

function Ducts() {
  return (
    <>
      {[-6, 6].map((x) => (
        <group key={x}>
          <mesh position={[x, FLOOR + 7.0, MID_Z]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.28, 0.28, HALL.depth, 24, 1, true]} />
            <meshStandardMaterial color={S.duct} roughness={0.35} metalness={0.7} />
          </mesh>
          {[3.5, 8.5, 13.5].map((z) => (
            <mesh key={z} position={[x, FLOOR + 6.62, z]}>
              <cylinderGeometry args={[0.32, 0.32, 0.18, 24]} />
              <meshStandardMaterial color={S.duct} roughness={0.5} metalness={0.6} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  )
}

/** Folded stage curtain: a plane rippled with a fixed sine. */
function Curtain({ x, width }: { x: number; width: number }) {
  const height = HALL.eave
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, height, 48, 1)
    const p = g.attributes.position!
    for (let i = 0; i < p.count; i++) p.setZ(i, 0.06 * Math.sin((p.getX(i) / 0.22) * Math.PI * 2))
    g.computeVertexNormals()
    return g
  }, [width, height])
  return (
    <mesh geometry={geometry} position={[x, FLOOR + height / 2, -0.18]}>
      <meshStandardMaterial color={S.curtain} roughness={0.95} />
    </mesh>
  )
}

/** Everything on the screen wall except the main frame plane itself. */
function ScreenWall({ frame }: { frame: THREE.Material }) {
  const surfaceH = SURFACE.top - SURFACE.bottom
  const curtainW = 1.3
  return (
    <group>
      <mesh position={[0, (SURFACE.top + SURFACE.bottom) / 2, -0.05]}>
        <planeGeometry args={[SURFACE.width, surfaceH]} />
        <meshStandardMaterial color={S.screen} roughness={0.95} />
      </mesh>
      <mesh position={[0, SURFACE.top + 0.12, -0.08]}>
        <boxGeometry args={[SURFACE.width + 0.3, 0.24, 0.2]} />
        <meshStandardMaterial color={S.steel} roughness={0.7} />
      </mesh>
      <Curtain x={-(SURFACE.width / 2 + curtainW / 2)} width={curtainW} />
      <Curtain x={SURFACE.width / 2 + curtainW / 2} width={curtainW} />
      {[-1, 1].map((side) => (
        <group key={side} position={[side * SIDE_SCREEN.x, SIDE_SCREEN.y, HALL.front + 0.03]}>
          <mesh>
            <planeGeometry args={[SIDE_SCREEN.width, SIDE_SCREEN.height]} />
            <meshStandardMaterial color={S.screen} roughness={0.95} />
          </mesh>
          <mesh position-z={0.01} material={frame}>
            <planeGeometry args={[SIDE_SCREEN.image, SIDE_SCREEN.image * (IMAGE.height / IMAGE.width)]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** A profile spot with barn doors, aimed down at the stage. */
function Fixture({ x, z, n, aim = -0.85 }: { x: number; z: number; n: number; aim?: number }) {
  const number = useMemo(() => flapNumber(n), [n])
  const pipe = FLOOR + 6.75
  return (
    <group position={[x, pipe, z]}>
      <mesh position-y={-0.15}>
        <boxGeometry args={[0.05, 0.3, 0.05]} />
        <meshStandardMaterial color={S.steel} />
      </mesh>
      <group position-y={-0.45} rotation-x={aim}>
        <mesh>
          <boxGeometry args={[0.36, 0.36, 0.56]} />
          <meshStandardMaterial color={S.plastic} roughness={0.5} />
        </mesh>
        <mesh position-z={-0.3} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.15, 0.15, 0.06, 24]} />
          <meshStandardMaterial color={S.plastic} roughness={0.3} />
        </mesh>
        {/* Barn doors: top and bottom flaps carry the painted number. */}
        {[1, -1].map((s) => (
          <mesh key={s} position={[0, s * 0.2, -0.46]} rotation-x={s * 0.5}>
            <boxGeometry args={[0.36, 0.008, 0.3]} />
            <meshStandardMaterial color={S.plastic} />
          </mesh>
        ))}
        <mesh position={[0, -0.21, -0.46]} rotation-x={Math.PI / 2 - 0.5}>
          <planeGeometry args={[0.34, 0.28]} />
          <meshStandardMaterial map={number} side={THREE.DoubleSide} roughness={0.6} />
        </mesh>
        {[1, -1].map((s) => (
          <mesh key={s} position={[s * 0.2, 0, -0.44]} rotation-y={-s * 0.45}>
            <boxGeometry args={[0.008, 0.3, 0.24]} />
            <meshStandardMaterial color={S.plastic} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Rig() {
  const pipe = FLOOR + 6.75
  return (
    <group>
      {[3.5, 8.5].map((z) => (
        <mesh key={z} position={[0, pipe, z]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.025, 0.025, 13, 8]} />
          <meshStandardMaterial color={S.steel} metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
      <Fixture x={-3.9} z={3.5} n={3} />
      <Fixture x={-1.3} z={3.5} n={2} />
      <Fixture x={1.3} z={3.5} n={2} />
      <Fixture x={3.9} z={3.5} n={3} />
      <Fixture x={-5.2} z={8.5} n={2} aim={-0.55} />
      <Fixture x={5.2} z={8.5} n={2} aim={-0.55} />
      {/* Ceiling projector, centre, throwing to the main screen. */}
      <group position={[0, FLOOR + 6.9, 7.2]}>
        <mesh position-y={0.6}>
          <boxGeometry args={[0.06, 1.0, 0.06]} />
          <meshStandardMaterial color={S.steel} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.6, 0.28, 0.62]} />
          <meshStandardMaterial color={S.plastic} roughness={0.4} />
        </mesh>
        <mesh position={[0.12, 0, -0.33]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.08, 0.08, 0.06, 20]} />
          <meshStandardMaterial color={S.steel} roughness={0.2} metalness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

export function Hall({ frame }: { frame: THREE.Material }) {
  return (
    <group>
      <Floor />
      <FrontWall />
      <BackWall />
      <SideWalls />
      <Cutaway>
        <Ceiling />
        <Trusses />
        <Ducts />
        <Rig />
      </Cutaway>
      <ScreenWall frame={frame} />
    </group>
  )
}
