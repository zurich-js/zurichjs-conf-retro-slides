import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useDeck } from '../engine/store'
import { STILL } from '../engine/params'
import { revealedAt } from '../engine/frame'
import { slides } from '../content/slides'
import { VISUALS } from '../content/visuals'
import type { Visual } from '../engine/types'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { useSponsorLogos } from './useSponsorLogos'
import { Cutaway } from './layers'
import { StandingAvatar } from './Avatar'
import { PALETTE } from '../brand/tokens'
import {
  BACKDROP, CHECKIN, DOORS, FLOOR, FOYER, LANYARD_RIG, LIGHTS, M, MERCH, SURFACES as S,
} from './venue'
import {
  BADGE_SIZE, backdropFace, badgeBack, badgeFace, type BadgeRole, checkinSign, cupEngraving, hash, concreteTile, entranceSheet, floorTile, totePrint, wallLettering,
} from './textures'

export const FOYER_ASSETS = { skyline: '/brand/skyline.svg' } as const

/**
 * The foyer: the concrete hallway through the hall's two back doors, set up
 * for registration as on the day — backdrop by the left doors, check-in
 * counter with the live slide projected on the wall above it, queue posts and
 * signs, balloons, and the volunteer merch table. Cut to, never flown to.
 * Authored in metres inside the Set's scaled group.
 */

const HALF = FOYER.width / 2
const Z0 = FOYER.start
const H = FOYER.height
const MID = Z0 + FOYER.depth / 2

function Room() {
  const floor = useMemo(() => floorTile([FOYER.width, FOYER.depth]), [])
  const concrete = useMemo(() => concreteTile([1 / 2.5, 1 / 1.25]), [])
  const wall = useMemo(() => new THREE.MeshStandardMaterial({ map: concrete, roughness: 0.92 }), [concrete])
  const plain = useMemo(() => new THREE.MeshStandardMaterial({ color: S.concrete, roughness: 0.92 }), [])
  // The hall-side wall, notched for both doors, up to the hallway ceiling.
  const doorWall = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-HALF, FLOOR)
    for (const cx of [-DOORS.x, DOORS.x]) {
      s.lineTo(cx - DOORS.width / 2, FLOOR)
      s.lineTo(cx - DOORS.width / 2, FLOOR + DOORS.height)
      s.lineTo(cx + DOORS.width / 2, FLOOR + DOORS.height)
      s.lineTo(cx + DOORS.width / 2, FLOOR)
    }
    s.lineTo(HALF, FLOOR)
    s.lineTo(HALF, FLOOR + H)
    s.lineTo(-HALF, FLOOR + H)
    s.closePath()
    return new THREE.ShapeGeometry(s)
  }, [])
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, FLOOR, MID]}>
        <planeGeometry args={[FOYER.width, FOYER.depth]} />
        <meshStandardMaterial map={floor} roughness={0.4} />
      </mesh>
      <Cutaway>
        <mesh rotation-x={Math.PI / 2} position={[0, FLOOR + H, MID]} material={plain}>
          <planeGeometry args={[FOYER.width, FOYER.depth]} />
        </mesh>
        {/* Deep soffit beams under the booth slab. */}
        {[-7.2, -3.6, 0, 3.6, 7.2].map((x) => (
          <mesh key={x} position={[x, FLOOR + H - 0.2, Z0 + 0.8 + (FOYER.depth - 0.8) / 2]} material={plain}>
            <boxGeometry args={[0.3, 0.4, FOYER.depth - 0.8]} />
          </mesh>
        ))}
      </Cutaway>
      <mesh geometry={doorWall} position-z={Z0 + 0.01} material={wall} />
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * HALF, FLOOR + H / 2, MID]} rotation-y={-side * Math.PI / 2} material={wall}>
          <planeGeometry args={[FOYER.depth, H]} />
        </mesh>
      ))}
      {/* The far side is open: the atrium (Atrium.tsx) closes the space. */}
    </group>
  )
}

/** Wood leaf in a light-grey frame, with an ENTRANCE sheet on both faces. */
function Leaf({ sheet }: { sheet: THREE.Texture }) {
  const w = DOORS.width / 2
  const h = DOORS.height - 0.02
  return (
    <group>
      <mesh position={[w / 2, h / 2, 0]}>
        <boxGeometry args={[w, h, 0.05]} />
        <meshStandardMaterial color={S.doorFrame} roughness={0.6} />
      </mesh>
      {[1, -1].map((s) => (
        <group key={s} position={[w / 2, h / 2, s * 0.027]} rotation-y={s > 0 ? 0 : Math.PI}>
          <mesh>
            <planeGeometry args={[w - 0.2, h - 0.3]} />
            <meshStandardMaterial color={S.doorWood} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.25, 0.002]}>
            <planeGeometry args={[0.3, 0.21]} />
            <meshStandardMaterial map={sheet} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Both double doors, propped open into the hallway, with lettering above. */
function Doors() {
  const sheet = useMemo(entranceSheet, [])
  const sign = useMemo(() => wallLettering('Auditorium / Foyer'), [])
  const open = 1.75 // radians, a little past square
  const frame = <meshStandardMaterial color={S.doorFrame} roughness={0.6} />
  return (
    <>
      {[-DOORS.x, DOORS.x].map((cx) => (
        <group key={cx}>
          {/* Frame: two jambs and a head, proud of the wall. */}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[cx + s * (DOORS.width / 2 + 0.05), FLOOR + DOORS.height / 2, Z0 + 0.03]}>
              <boxGeometry args={[0.1, DOORS.height, 0.06]} />
              {frame}
            </mesh>
          ))}
          <mesh position={[cx, FLOOR + DOORS.height + 0.05, Z0 + 0.03]}>
            <boxGeometry args={[DOORS.width + 0.2, 0.1, 0.06]} />
            {frame}
          </mesh>
          {/* Leaves hinge on the outer jambs and swing into the hallway. */}
          <group position={[cx - DOORS.width / 2, FLOOR, Z0 + 0.05]} rotation-y={-open}>
            <Leaf sheet={sheet} />
          </group>
          <group position={[cx + DOORS.width / 2, FLOOR, Z0 + 0.05]} rotation-y={Math.PI + open}>
            <Leaf sheet={sheet} />
          </group>
          {/* Little speaker over the door, lettering above-left. */}
          <mesh position={[cx + 0.3, FLOOR + DOORS.height + 0.25, Z0 + 0.1]}>
            <boxGeometry args={[0.16, 0.24, 0.16]} />
            <meshStandardMaterial color={S.plastic} roughness={0.5} />
          </mesh>
          <mesh position={[cx - 0.6, FLOOR + DOORS.height + 0.38, Z0 + 0.02]}>
            <planeGeometry args={[1.9, 0.24]} />
            <meshBasicMaterial map={sign} transparent toneMapped={false} />
          </mesh>
        </group>
      ))}
    </>
  )
}

/** The curved pop-up: printed fabric on the concave side, dark fabric behind. */
function Backdrop() {
  const skyline = useTexture(FOYER_ASSETS.skyline)
  const logos = useSponsorLogos()
  const { arc, height: BH, radius: R, x, z, yaw } = BACKDROP
  const theta = arc / R
  const face = useMemo(() => {
    const t = backdropFace(skyline.image as HTMLImageElement, logos, arc, BH)
    // Seen from inside the cylinder, u runs right-to-left: mirror it back.
    t.wrapS = THREE.RepeatWrapping
    t.repeat.x = -1
    return t
  }, [skyline, logos, arc, BH])
  const lift = 0.04
  // Centre of curvature sits R in front of the fabric's middle, along the facing.
  const cx = x + R * Math.sin(yaw)
  const cz = z + R * Math.cos(yaw)
  return (
    <group position={[cx, FLOOR + lift + BH / 2, cz]} rotation-y={yaw}>
      <mesh>
        <cylinderGeometry args={[R, R, BH, 64, 1, true, Math.PI - theta / 2, theta]} />
        <meshStandardMaterial map={face} side={THREE.BackSide} alphaTest={0.5} roughness={0.85} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[R + 0.03, R + 0.03, BH - 0.06, 64, 1, true, Math.PI - theta / 2, theta]} />
        <meshStandardMaterial color={S.fabricBack} roughness={0.95} />
      </mesh>
    </group>
  )
}

/** White check-in counter, a side return, and the live slide projected on the wall. */
function CheckIn({ frame }: { frame: THREE.Material }) {
  const length = CHECKIN.x1 - CHECKIN.x0
  const white = <meshStandardMaterial color={S.paper} roughness={0.45} />
  return (
    <group>
      <mesh position={[(CHECKIN.x0 + CHECKIN.x1) / 2, FLOOR + CHECKIN.height / 2, CHECKIN.z]}>
        <boxGeometry args={[length, CHECKIN.height, CHECKIN.depth]} />
        {white}
      </mesh>
      <mesh position={[CHECKIN.x0 - 0.5, FLOOR + 0.42, CHECKIN.z + 0.7]} rotation-y={0.12}>
        <boxGeometry args={[0.6, 0.84, 1.1]} />
        {white}
      </mesh>
      {/* Lanyard trays and a couple of tablets on the counter. */}
      {[-0.6, 0.4, 1.2, 1.9].map((x, i) => (
        <mesh key={x} position={[x, FLOOR + CHECKIN.height + 0.01, CHECKIN.z + 0.05]} rotation-y={(i % 2 ? 1 : -1) * 0.15}>
          <boxGeometry args={i % 2 ? [0.26, 0.012, 0.19] : [0.4, 0.02, 0.28]} />
          <meshStandardMaterial color={i % 2 ? S.plastic : S.paper} roughness={0.5} />
        </mesh>
      ))}
      {/* Projection: the same live frame as the main screen, on concrete. */}
      <mesh position={[0.9, FLOOR + 2.1, Z0 + 0.03]} material={frame}>
        <planeGeometry args={[3.6, 3.6 * (9 / 16)]} />
      </mesh>
    </group>
  )
}

function Stanchion({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, FLOOR, z]}>
      <mesh position-y={0.01}>
        <cylinderGeometry args={[0.17, 0.17, 0.02, 24]} />
        <meshStandardMaterial color={S.plastic} roughness={0.4} />
      </mesh>
      <mesh position-y={0.48}>
        <cylinderGeometry args={[0.025, 0.025, 0.95, 12]} />
        <meshStandardMaterial color={S.plastic} roughness={0.4} metalness={0.3} />
      </mesh>
    </group>
  )
}

const BADGE_ROLES: readonly BadgeRole[] = [
  'attendee', 'vip', 'speaker', 'mc', 'panelist', 'instructor', 'sponsor', 'volunteer', 'organizer',
]

/** Every badge face, plus the shared back, painted once. */
function useBadgeFaces() {
  const skyline = useTexture(FOYER_ASSETS.skyline)
  const logos = useSponsorLogos()
  return useMemo(() => {
    const img = skyline.image as HTMLImageElement
    const faces = Object.fromEntries(BADGE_ROLES.map((r) => [r, badgeFace(r, img, logos)])) as unknown as Record<BadgeRole, THREE.CanvasTexture>
    return { faces, back: badgeBack(img, logos) }
  }, [skyline, logos])
}

/** One badge of each kind laid out along the counter, one turned over, lanyards beside. */
function Badges({ faces, back }: ReturnType<typeof useBadgeFaces>) {
  const top = FLOOR + CHECKIN.height + 0.003
  const step = BADGE_SIZE.w + 0.04
  const x0 = -3.45
  return (
    <group>
      {[...BADGE_ROLES.map((r) => faces[r]), back].map((map, i) => (
        <mesh
          key={i}
          position={[x0 + i * step, top + (i % 2) * 0.001, CHECKIN.z + 0.1 + (hash(i + 90) - 0.5) * 0.06]}
          rotation={[-Math.PI / 2, 0, (hash(i + 40) - 0.5) * 0.25]}
        >
          <planeGeometry args={[BADGE_SIZE.w, BADGE_SIZE.h]} />
          <meshStandardMaterial map={map} roughness={0.5} />
        </mesh>
      ))}
      {[-1.85, -1.65, -1.45].map((x, i) => (
        <mesh key={x} position={[x, top + 0.006, CHECKIN.z + 0.02 + (i % 2) * 0.08]} rotation-x={-Math.PI / 2}>
          <torusGeometry args={[0.07, 0.008, 6, 24]} />
          <meshStandardMaterial color={S.paper} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

/** Which test-stand state each slide shows: its own `rig`, else before the test 'one-hole', after it 'held'. */
const RIG = (() => {
  const own = slides.map((sl) => {
    const v = (VISUALS as Record<string, Visual>)[sl.steps[0]!]
    return v?.kind === 'badgetest' ? v.rig : null
  })
  const first = own.findIndex(Boolean)
  let last: (typeof own)[number] = null
  return own.map((r, i) => (r ? (last = r) : first < 0 || i < first ? 'one-hole' : last ?? 'held'))
})()

const G = 9.81

/**
 * The badge-hole test stand at the right end of the counter: three hooks on a
 * steel bar. Left, one centre hole (flips round on its lanyard); middle, two
 * holes (hangs flat); right, two holes with a weight on (holds). Under
 * 'stress' the left one gets a weight too, its single hole tears, and it drops
 * to the counter. Driven by the slide's `rig`, timed from its reveal.
 */
function BadgeLab({ faces, back }: ReturnType<typeof useBadgeFaces>) {
  const top = FLOOR + CHECKIN.height
  const barY = top + LANYARD_RIG.bar
  const z = CHECKIN.z + 0.02
  const { w, h } = BADGE_SIZE
  const drop = 0.2 // bar to badge top
  const xs = [LANYARD_RIG.x0 + 0.17, (LANYARD_RIG.x0 + LANYARD_RIG.x1) / 2, LANYARD_RIG.x1 - 0.17]
  const mats = useMemo(() => ({
    steel: new THREE.MeshStandardMaterial({ color: S.chrome, metalness: 0.85, roughness: 0.3 }),
    strap: new THREE.MeshStandardMaterial({ color: S.ink, roughness: 0.8 }),
    hole: new THREE.MeshBasicMaterial({ color: S.ink }),
    weight: new THREE.MeshStandardMaterial({ color: S.steel, metalness: 0.7, roughness: 0.35 }),
    front: new THREE.MeshStandardMaterial({ map: faces.attendee, roughness: 0.5 }),
    back: new THREE.MeshStandardMaterial({ map: back, roughness: 0.5 }),
  }), [faces, back])
  const card = useMemo(() => new THREE.PlaneGeometry(w, h), [w, h])
  const holeGeo = useMemo(() => new THREE.CircleGeometry(0.0045, 16), [])
  const clipGeo = useMemo(() => new THREE.TorusGeometry(0.006, 0.0014, 6, 16), [])
  const strap = (len: number) => new THREE.BoxGeometry(0.012, len, 0.0012).translate(0, -len / 2, 0)
  const one = useMemo(() => strap(drop + 0.012), [])
  const vLen = Math.hypot(0.03, drop + 0.012)
  const vStrap = useMemo(() => strap(vLen), [vLen])
  const cord = useMemo(() => new THREE.CylinderGeometry(0.0015, 0.0015, 0.09, 6).translate(0, -0.045, 0), [])
  const weightGeo = useMemo(() => new THREE.CylinderGeometry(0.025, 0.025, 0.06, 20).translate(0, -0.09 - 0.03, 0), [])

  const A = useRef<THREE.Group>(null) // swing pivot at the bar
  const Aflip = useRef<THREE.Group>(null) // the card, turning about its hole
  const Aweight = useRef<THREE.Group>(null)
  const Atab = useRef<THREE.Mesh>(null)
  const B = useRef<THREE.Group>(null)
  const C = useRef<THREE.Group>(null)
  const Cweight = useRef<THREE.Group>(null)

  useFrame(() => {
    const index = useDeck.getState().index
    const rig = RIG[index] ?? 'one-hole'
    const t = STILL ? 99 : (performance.now() - revealedAt()) / 1000
    const clock = performance.now() / 1000
    // Left: one hole. Flips and swings unless it has torn off.
    const snapAt = 1.6
    const torn = rig === 'held' || (rig === 'stress' && t > snapAt)
    if (A.current && Aflip.current) {
      if (!torn) {
        const loaded = rig === 'stress'
        A.current.position.set(xs[0]!, barY, z)
        A.current.rotation.set(0, 0, STILL ? 0.12 : Math.sin(clock * 1.7) * (loaded ? 0.04 : 0.18))
        Aflip.current.rotation.y = STILL ? 2.4 : loaded ? Math.sin(clock * 9) * 0.05 : Math.sin(clock * 1.1) * 2.6
        Aflip.current.position.y = loaded ? -Math.min(1, t / snapAt) * 0.006 : 0 // the hole stretching
      } else {
        // Torn: fall to the counter, then lie there.
        const ft = rig === 'stress' ? t - snapAt : 99
        const fall = Math.min(barY - drop - top - 0.004, 0.5 * G * ft * ft)
        A.current.position.set(xs[0]! + Math.min(ft, 0.4) * 0.15, barY - fall, z + Math.min(ft, 0.4) * 0.25)
        A.current.rotation.set(-Math.PI / 2 * Math.min(1, ft / 0.35), 0, 0.3 * Math.min(1, ft / 0.35))
        Aflip.current.rotation.y = 0
        Aflip.current.position.y = drop
      }
    }
    if (Aweight.current) Aweight.current.visible = rig === 'stress' && !torn
    if (Atab.current) Atab.current.visible = torn
    if (B.current) B.current.rotation.z = STILL ? 0 : Math.sin(clock * 1.3 + 1) * 0.012
    // Right: two holes, loaded under 'stress' and after; a little bounce as the weight goes on.
    const loadedC = rig === 'stress' || rig === 'held'
    if (Cweight.current) Cweight.current.visible = loadedC
    if (C.current) C.current.position.y = barY - (loadedC ? (rig === 'stress' && !STILL ? Math.exp(-t * 4) * Math.sin(t * 25) * 0.004 : 0) + 0.002 : 0)
  })

  /** A card (front and back) hanging from its holes, origin at the card's top centre. */
  const Card = ({ holes }: { holes: readonly number[] }) => (
    <group>
      <mesh geometry={card} material={mats.front} position={[0, -h / 2, 0.0006]} />
      <mesh geometry={card} material={mats.back} position={[0, -h / 2, -0.0006]} rotation-y={Math.PI} />
      {holes.flatMap((hx) => [
        <mesh key={`f${hx}`} geometry={holeGeo} material={mats.hole} position={[hx, -0.012, 0.0012]} />,
        <mesh key={`b${hx}`} geometry={holeGeo} material={mats.hole} position={[hx, -0.012, -0.0012]} rotation-y={Math.PI} />,
        <mesh key={`c${hx}`} geometry={clipGeo} material={mats.steel} position={[hx, -0.009, 0]} rotation-y={Math.PI / 2} />,
      ])}
    </group>
  )

  return (
    <group>
      {/* The stand: two uprights and the bar. */}
      {[LANYARD_RIG.x0, LANYARD_RIG.x1].map((x) => (
        <mesh key={x} position={[x, top + LANYARD_RIG.bar / 2, z]} material={mats.steel}>
          <cylinderGeometry args={[0.008, 0.008, LANYARD_RIG.bar, 10]} />
        </mesh>
      ))}
      <mesh position={[(LANYARD_RIG.x0 + LANYARD_RIG.x1) / 2, barY, z]} rotation-z={Math.PI / 2} material={mats.steel}>
        <cylinderGeometry args={[0.007, 0.007, LANYARD_RIG.x1 - LANYARD_RIG.x0 + 0.04, 10]} />
      </mesh>
      {/* Left: one hole. */}
      <group ref={A} position={[xs[0]!, barY, z]}>
        <mesh geometry={one} material={mats.strap} />
        <group ref={Aflip} position-y={0}>
          <group position-y={-drop}>
            <Card holes={[0]} />
            <group ref={Aweight} position-y={-h}>
              <mesh geometry={cord} material={mats.strap} />
              <mesh geometry={weightGeo} material={mats.weight} />
            </group>
          </group>
        </group>
      </group>
      {/* What stays on the lanyard when the single hole tears: a torn tab. */}
      <mesh ref={Atab} position={[xs[0]!, barY - drop - 0.012, z]} visible={false}>
        <planeGeometry args={[0.022, 0.016]} />
        <meshStandardMaterial map={faces.attendee} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* Middle: two holes, a V of strap. */}
      <group ref={B} position={[xs[1]!, barY, z]}>
        {[-0.03, 0.03].map((hx) => <mesh key={hx} geometry={vStrap} material={mats.strap} rotation-z={Math.atan2(hx, drop + 0.012)} />)}
        <group position-y={-drop}><Card holes={[-0.03, 0.03]} /></group>
      </group>
      {/* Right: two holes, a weight on. */}
      <group ref={C} position={[xs[2]!, barY, z]}>
        {[-0.03, 0.03].map((hx) => <mesh key={hx} geometry={vStrap} material={mats.strap} rotation-z={Math.atan2(hx, drop + 0.012)} />)}
        <group position-y={-drop}>
          <Card holes={[-0.03, 0.03]} />
          <group ref={Cweight} position-y={-h} visible={false}>
            <mesh geometry={cord} material={mats.strap} />
            <mesh geometry={weightGeo} material={mats.weight} />
          </group>
        </group>
      </group>
    </group>
  )
}

/** Volunteers in team shirts wearing their badges: three at check-in, one organizer at merch. */
function Volunteers({ faces }: ReturnType<typeof useBadgeFaces>) {
  return (
    <>
      {/* All on the left of the counter: the lanyards cue and the projection are on the right. */}
      <StandingAvatar x={-3.4} y={FLOOR} z={Z0 + 0.42} badge={faces.volunteer} />
      <StandingAvatar x={-2.3} y={FLOOR} z={Z0 + 0.42} yaw={0.15} badge={faces.volunteer} />
      <StandingAvatar x={-1.25} y={FLOOR} z={Z0 + 0.42} yaw={-0.2} badge={faces.organizer} />
      {/* Beside the merch table, out of the merch cue's sightline. */}
      <StandingAvatar x={MERCH.x + 0.75} y={FLOOR} z={MERCH.z - 1.4} yaw={-Math.PI / 2} badge={faces.organizer} />
    </>
  )
}

/** Two rows of queue posts with black belts, and the A–K / L–S / T–Z signs. */
function Queue() {
  const signs = useMemo(() => ['A–K', 'L–S', 'T–Z'].map(checkinSign), [])
  const xs = [-3.6, -2.1, -0.6, 0.9, 2.4]
  const rows = [Z0 + 2.4, Z0 + 3.8]
  return (
    <group>
      {rows.map((z) => (
        <group key={z}>
          {xs.map((x) => <Stanchion key={x} x={x} z={z} />)}
          {xs.slice(1).map((x, i) => (
            <mesh key={x} position={[(x + xs[i]!) / 2, FLOOR + 0.9, z]}>
              <boxGeometry args={[x - xs[i]!, 0.05, 0.004]} />
              <meshStandardMaterial color={S.belt} roughness={0.7} />
            </mesh>
          ))}
        </group>
      ))}
      {signs.map((t, i) => {
        const x = -2.8 + i * 2.2
        return (
          <group key={i} position={[x, FLOOR, Z0 + 4.6]} rotation-y={-0.1}>
            <mesh position-y={0.01}>
              <boxGeometry args={[0.3, 0.02, 0.3]} />
              <meshStandardMaterial color={S.plastic} />
            </mesh>
            <mesh position-y={0.6}>
              <boxGeometry args={[0.04, 1.2, 0.04]} />
              <meshStandardMaterial color={S.paper} roughness={0.5} />
            </mesh>
            <mesh position={[0, 1.42, 0.025]}>
              <planeGeometry args={[0.36, 0.48]} />
              <meshStandardMaterial map={t} roughness={0.6} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

/** A bunch of yellow, blue and white balloons tied by the counter. */
function Balloons() {
  const x = CHECKIN.x0 - 0.3
  const z = CHECKIN.z + 0.3
  const bunch = [
    { c: PALETTE.yellow, p: [-0.22, 2.05, 0.05] },
    { c: PALETTE.blue, p: [0.05, 2.35, -0.05] },
    { c: PALETTE.blue, p: [-0.12, 2.5, 0.12] },
    { c: PALETTE.white, p: [0.25, 2.25, 0.1] },
    { c: PALETTE.yellow, p: [0.12, 2.0, -0.15] },
    { c: PALETTE.white, p: [-0.3, 2.3, -0.12] },
  ] as const
  return (
    <group position={[x, FLOOR, z]}>
      <mesh position-y={0.05}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color={S.plastic} />
      </mesh>
      {bunch.map(({ c, p }, i) => {
        const end = new THREE.Vector3(p[0], p[1] - 0.2, p[2])
        const len = end.length()
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().normalize())
        return (
          <group key={i}>
            <mesh position={end.clone().multiplyScalar(0.5)} quaternion={q}>
              <cylinderGeometry args={[0.002, 0.002, len, 3]} />
              <meshStandardMaterial color={S.paper} />
            </mesh>
            <mesh position={[p[0], p[1], p[2]]} scale={[1, 1.15, 1]}>
              <sphereGeometry args={[0.19, 24, 16]} />
              <meshStandardMaterial color={c} roughness={0.25} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

/** The ZurichJS cup: lathed profile, two-tone dipped glaze via vertex colours. */
type Glaze = { body: string; dip: string; dipY: number; inside: string }
const PROFILE = [
  [0, 0], [0.026, 0], [0.028, 0.008], [0.032, 0.01], [0.04, 0.025], [0.044, 0.05], [0.045, 0.072],
  [0.041, 0.072], [0.039, 0.045], [0.03, 0.02], [0, 0.016],
] as const
const OUTSIDE = 7 // profile points 0..6 are the outside wall
function mugGeometry(g: Glaze) {
  const geo = new THREE.LatheGeometry(PROFILE.map(([r, y]) => new THREE.Vector2(r, y)), 40)
  const colors: number[] = []
  const c = new THREE.Color()
  const per = PROFILE.length
  const pos = geo.attributes.position!
  for (let i = 0; i < pos.count; i++) {
    const j = i % per
    const y = PROFILE[j]![1]
    c.set(j < OUTSIDE ? (y < g.dipY ? g.dip : g.body) : g.inside).convertSRGBToLinear()
    colors.push(c.r, c.g, c.b)
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  return geo
}

/** The volunteer merch table: yellow cloth, blue runner, cups and totes. */
function Merch() {
  const glazes = useMemo<Glaze[]>(() => [
    { body: S.paper, dip: S.mugBlue, dipY: 0.02, inside: S.paper },
    { body: S.paper, dip: S.mugBlue, dipY: 0.056, inside: S.paper },
    { body: S.mugBlack, dip: S.mugBlack, dipY: 0, inside: S.mugBlack },
    { body: S.mugYellow, dip: S.mugYellow, dipY: 0, inside: S.mugBlack },
  ], [])
  const mugs = useMemo(() => glazes.map(mugGeometry), [glazes])
  // Glaze with the logo debossed into the wall: bump for the recess, colour map shading it.
  const glaze = useMemo(() => {
    const { map, bump } = cupEngraving()
    return new THREE.MeshStandardMaterial({ vertexColors: true, map, bumpMap: bump, bumpScale: 3, roughness: 0.6 })
  }, [])
  const print = useMemo(totePrint, [])
  const top = FLOOR + MERCH.height
  const L = MERCH.length
  const D = MERCH.depth
  return (
    <group position={[MERCH.x, 0, MERCH.z]}>
      <mesh position-y={FLOOR + MERCH.height / 2}>
        <boxGeometry args={[D, MERCH.height, L]} />
        <meshStandardMaterial color={S.paper} roughness={0.5} />
      </mesh>
      {/* Yellow cloth: a skin over the top, hanging to the floor at the front. */}
      <mesh position={[0, top + 0.004, 0]}>
        <boxGeometry args={[D + 0.04, 0.008, L + 0.04]} />
        <meshStandardMaterial color={S.cloth} roughness={0.95} />
      </mesh>
      <mesh position={[-D / 2 - 0.021, FLOOR + MERCH.height / 2 + 0.06, 0]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[L + 0.04, MERCH.height - 0.1]} />
        <meshStandardMaterial color={S.cloth} roughness={0.95} />
      </mesh>
      {/* Blue runner across, draping over the front edge. */}
      <mesh position={[0, top + 0.01, -0.35]}>
        <boxGeometry args={[D + 0.05, 0.006, 0.45]} />
        <meshStandardMaterial color={S.runner} roughness={0.9} />
      </mesh>
      <mesh position={[-D / 2 - 0.03, top - 0.25, -0.35]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[0.45, 0.5]} />
        <meshStandardMaterial color={S.runner} roughness={0.9} />
      </mesh>
      {/* Cups in two loose rows. */}
      {Array.from({ length: 9 }, (_, i) => {
        const row = i % 2
        const z = -0.75 + i * 0.17
        const x = -0.18 + row * 0.16
        // Logo (lathe u = 0.5, the cup's −z side) turned to face the room (−x), give or take.
        return (
          <mesh key={i} geometry={mugs[i % mugs.length]} material={glaze} position={[x, top + 0.012, z]} rotation-y={Math.PI / 2 + (hash(i + 70) - 0.5) * 0.6} />
        )
      })}
      {/* Two totes standing at the back of the table. */}
      {[0.55, 0.85].map((z, i) => (
        <group key={z} position={[0.22, top + 0.22, z]} rotation-y={-Math.PI / 2 + (i ? 0.25 : -0.1)}>
          <mesh>
            <boxGeometry args={[0.38, 0.42, 0.02]} />
            <meshStandardMaterial color={S.plastic} roughness={0.95} />
          </mesh>
          <mesh position-z={0.011}>
            <planeGeometry args={[0.36, 0.42]} />
            <meshStandardMaterial map={print} roughness={0.95} />
          </mesh>
          {[-0.09, 0.09].map((hx) => (
            <mesh key={hx} position={[hx, 0.21, 0]} rotation-z={0}>
              <torusGeometry args={[0.06, 0.008, 6, 16, Math.PI]} />
              <meshStandardMaterial color={S.plastic} roughness={0.95} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/** Industrial aluminium bell pendants. */
function Pendants() {
  const spots = [[-6, 5.5], [-1.5, 6.5], [3, 7.5], [-4, 9.8], [6, 9.5]] as const
  return (
    <>
      {spots.map(([x, dz]) => (
        <group key={`${x}:${dz}`} position={[x, FLOOR + H - 0.75, Z0 + dz]}>
          <mesh position-y={0.4}>
            <cylinderGeometry args={[0.006, 0.006, 0.7, 4]} />
            <meshStandardMaterial color={S.steel} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.08, 0.26, 0.32, 24, 1, true]} />
            <meshStandardMaterial color={S.chrome} metalness={0.8} roughness={0.3} side={THREE.DoubleSide} />
          </mesh>
          <mesh position-y={-0.15} rotation-x={Math.PI / 2}>
            <circleGeometry args={[0.24, 24]} />
            <meshBasicMaterial color={S.lamp} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </>
  )
}

/** Hallway light: even daylight-ish fill; ranges kept short of the hall. */
function Lights() {
  const target = useMemo(() => {
    const o = new THREE.Object3D()
    o.position.set(-2, FLOOR + 1.2, Z0 + 1.5)
    return o
  }, [])
  return (
    <>
      <primitive object={target} />
      <pointLight position={[-2, FLOOR + 2.9, Z0 + 4.5]} color={LIGHTS.foyer} intensity={1.5} decay={0} distance={6 * M} />
      <pointLight position={[4.5, FLOOR + 2.9, Z0 + 5.0]} color={LIGHTS.foyer} intensity={1.3} decay={0} distance={6 * M} />
      <pointLight position={[0, FLOOR + 2.9, Z0 + 9.5]} color={LIGHTS.foyer} intensity={1.0} decay={0} distance={6 * M} />
      <spotLight
        position={[1, FLOOR + 3.0, Z0 + 7]}
        target={target}
        color={LIGHTS.wash}
        intensity={1.4}
        angle={0.7}
        penumbra={0.9}
        decay={0}
      />
    </>
  )
}

export function Foyer({ frame }: { frame: THREE.Material }) {
  const badges = useBadgeFaces()
  return (
    <group>
      <Room />
      <Doors />
      <Backdrop />
      <CheckIn frame={frame} />
      <Badges {...badges} />
      <BadgeLab {...badges} />
      <Volunteers {...badges} />
      <Queue />
      <Balloons />
      <Merch />
      <Cutaway>
        <Pendants />
      </Cutaway>
      <Lights />
    </group>
  )
}
