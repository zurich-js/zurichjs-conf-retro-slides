import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { ATRIUM, ATRIUM_HALF, ATRIUM_TOP, FLOOR, FOYER, LIGHTS, M, SURFACES as S } from './venue'
import { agRollup, concreteTile, floorTile, galleryWall, hash, logoRollup, namespaceWall, towerSign } from './textures'
import { useSponsorLogos } from './useSponsorLogos'
import { Cutaway } from './layers'
import { Dressing } from './Dressing'

export const ATRIUM_ASSETS = { technopark: '/brand/technopark.png', rollup: '/brand/rollup.svg' } as const

/**
 * The atrium: Technopark's open hall beyond the foyer. Ground floor and three
 * gallery levels around a central void, concrete columns, orange-wood office
 * walls, a glass lift tower with the Technopark sign, bell pendants over a
 * field of white cocktail tables, and the sponsor booths.
 * Authored in metres inside the Set's scaled group.
 */

const Z0 = ATRIUM.start
const L = ATRIUM.length
const MID = Z0 + L / 2
const VOID = ATRIUM.void / 2
const TOP = ATRIUM_TOP

function Shell() {
  const floor = useMemo(() => floorTile([ATRIUM_HALF * 2, L]), [])
  const concrete = useMemo(() => concreteTile([1 / 2.5, 1 / 1.25]), [])
  const wall = useMemo(() => new THREE.MeshStandardMaterial({ map: concrete, roughness: 0.92 }), [concrete])
  const orange = useMemo(() => galleryWall([L / 3.2, ATRIUM.levels + 1]), [])
  // Near wall, notched where the foyer opens in.
  const nearWall = useMemo(() => {
    const s = new THREE.Shape()
    const fw = FOYER.width / 2
    s.moveTo(-ATRIUM_HALF, FLOOR)
    s.lineTo(-fw, FLOOR)
    s.lineTo(-fw, FLOOR + FOYER.height)
    s.lineTo(fw, FLOOR + FOYER.height)
    s.lineTo(fw, FLOOR)
    s.lineTo(ATRIUM_HALF, FLOOR)
    s.lineTo(ATRIUM_HALF, TOP)
    s.lineTo(-ATRIUM_HALF, TOP)
    s.closePath()
    return new THREE.ShapeGeometry(s)
  }, [])
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, FLOOR, MID]}>
        <planeGeometry args={[ATRIUM_HALF * 2, L]} />
        <meshStandardMaterial map={floor} roughness={0.5} />
      </mesh>
      {/* Skylight roof: the daylight that fills the void. */}
      <Cutaway>
        <mesh rotation-x={Math.PI / 2} position={[0, TOP, MID]}>
          <planeGeometry args={[ATRIUM_HALF * 2, L]} />
          <meshBasicMaterial color={S.daylight} toneMapped={false} />
        </mesh>
      </Cutaway>
      <mesh geometry={nearWall} position-z={Z0} material={wall} />
      <mesh position={[0, (FLOOR + TOP) / 2, Z0 + L]} rotation-y={Math.PI} material={wall}>
        <planeGeometry args={[ATRIUM_HALF * 2, TOP - FLOOR]} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * ATRIUM_HALF, (FLOOR + TOP) / 2, MID]} rotation-y={-side * Math.PI / 2}>
          <planeGeometry args={[L, TOP - FLOOR]} />
          <meshStandardMaterial map={orange} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

/** Gallery slabs, their railings (balusters instanced), ceiling lights below. */
function Galleries() {
  const levels = Array.from({ length: ATRIUM.levels }, (_, i) => FLOOR + (i + 1) * ATRIUM.storey)
  const balusters = useRef<THREE.InstancedMesh>(null)
  const lights = useRef<THREE.InstancedMesh>(null)
  const pitch = 0.14
  const perRail = Math.floor(L / pitch)
  const railCount = levels.length * 2 * perRail
  const lightSpots = useMemo(() => {
    const out: [number, number, number][] = []
    for (const y of [FLOOR, ...levels].map((l) => l + ATRIUM.storey - 0.46)) {
      for (const side of [-1, 1]) for (let z = Z0 + 2; z < Z0 + L; z += 4) out.push([side * (VOID + 2.25), y, z])
    }
    return out
    // levels is derived from constants
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    let k = 0
    for (const y of levels) {
      for (const side of [-1, 1]) {
        for (let i = 0; i < perRail; i++) {
          m.makeTranslation(side * VOID, y + 0.5, Z0 + 0.1 + i * pitch)
          balusters.current!.setMatrixAt(k++, m)
        }
      }
    }
    balusters.current!.instanceMatrix.needsUpdate = true
    balusters.current!.computeBoundingSphere()
    lightSpots.forEach((p, i) => {
      m.makeRotationX(Math.PI / 2).setPosition(...p)
      lights.current!.setMatrixAt(i, m)
    })
    lights.current!.instanceMatrix.needsUpdate = true
    lights.current!.computeBoundingSphere()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const slab = <meshStandardMaterial color={S.concrete} roughness={0.9} />
  return (
    <group>
      {levels.map((y) => (
        <group key={y}>
          {[-1, 1].map((side) => (
            <group key={side}>
              <mesh position={[side * (VOID + ATRIUM.gallery / 2), y - 0.22, MID]}>
                <boxGeometry args={[ATRIUM.gallery, 0.45, L]} />
                {slab}
              </mesh>
              {/* Handrail with a wood cap, and a bottom rail. */}
              <mesh position={[side * VOID, y + 1.02, MID]}>
                <boxGeometry args={[0.07, 0.05, L]} />
                <meshStandardMaterial color={S.wood} roughness={0.5} />
              </mesh>
              <mesh position={[side * VOID, y + 0.08, MID]}>
                <boxGeometry args={[0.04, 0.04, L]} />
                <meshStandardMaterial color={S.steel} roughness={0.5} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      <instancedMesh ref={balusters} args={[undefined, undefined, railCount]}>
        <boxGeometry args={[0.018, 0.95, 0.018]} />
        <meshStandardMaterial color={S.steel} roughness={0.5} metalness={0.4} />
      </instancedMesh>
      <instancedMesh ref={lights} args={[undefined, undefined, lightSpots.length]}>
        <circleGeometry args={[0.3, 24]} />
        <meshBasicMaterial color={S.lamp} toneMapped={false} side={THREE.DoubleSide} />
      </instancedMesh>
      {/* Columns along the void edge, full height. */}
      {[-1, 1].flatMap((side) =>
        Array.from({ length: 5 }, (_, i) => (
          <mesh key={`${side}:${i}`} position={[side * (VOID + 0.3), (FLOOR + TOP) / 2, Z0 + 3 + i * 6.6]}>
            <boxGeometry args={[0.55, TOP - FLOOR, 0.55]} />
            <meshStandardMaterial color={S.concrete} roughness={0.9} />
          </mesh>
        )),
      )}
    </group>
  )
}

/** The glass lift tower at the far end, steel bands, Technopark sign. */
function Tower() {
  const logo = useTexture(ATRIUM_ASSETS.technopark)
  const sign = useMemo(() => towerSign(logo.image as HTMLImageElement), [logo])
  const w = 4.6
  const z = Z0 + L - 3.2
  const h = TOP - FLOOR - 0.2
  return (
    <group position={[0, FLOOR, z]}>
      <mesh position-y={h / 2}>
        <boxGeometry args={[w, h, w]} />
        <meshStandardMaterial color={S.glassDark} roughness={0.15} metalness={0.6} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position-y={1.9 + i * 2.1}>
          <boxGeometry args={[w + 0.08, 0.16, w + 0.08]} />
          <meshStandardMaterial color={S.steel} roughness={0.5} metalness={0.5} />
        </mesh>
      ))}
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => (
        <mesh key={`${sx}${sz}`} position={[sx * w / 2, h / 2, sz * w / 2]}>
          <boxGeometry args={[0.16, h, 0.16]} />
          <meshStandardMaterial color={S.steel} roughness={0.5} metalness={0.5} />
        </mesh>
      )))}
      <mesh position={[0, 5.3, -w / 2 - 0.06]} rotation-y={Math.PI}>
        <planeGeometry args={[3.6, 3.6 * (218 / 1181)]} />
        <meshBasicMaterial map={sign} transparent toneMapped={false} />
      </mesh>
    </group>
  )
}

/** Aluminium bell pendants on long cables over the tables. */
function Bells() {
  const spots = useMemo(() => {
    const out: [number, number][] = []
    for (const x of [-4, 0, 4]) for (let z = Z0 + 3; z < Z0 + 22; z += 4.6) out.push([x, z])
    return out
  }, [])
  const y = FLOOR + 4.4
  return (
    <>
      {spots.map(([x, z]) => (
        <group key={`${x}:${z}`} position={[x, y, z]}>
          <mesh position-y={(TOP - y) / 2}>
            <cylinderGeometry args={[0.006, 0.006, TOP - y, 4]} />
            <meshStandardMaterial color={S.steel} />
          </mesh>
          <mesh position-y={0.55}>
            <cylinderGeometry args={[0.13, 0.13, 0.5, 20]} />
            <meshStandardMaterial color={S.chrome} metalness={0.8} roughness={0.35} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.13, 0.42, 0.6, 28, 1, true]} />
            <meshStandardMaterial color={S.chrome} metalness={0.8} roughness={0.35} side={THREE.DoubleSide} />
          </mesh>
          <mesh position-y={-0.29} rotation-x={Math.PI / 2}>
            <circleGeometry args={[0.4, 28]} />
            <meshBasicMaterial color={S.lamp} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </>
  )
}

/** White-clothed cocktail tables, instanced: cloth (lathe), pole, foot. */
const CLOTH = [
  [0, 1.1], [0.4, 1.1], [0.42, 1.09], [0.43, 1.0], [0.36, 0.78], [0.3, 0.62], [0.36, 0.42], [0.33, 0.4],
] as const
function CocktailTables() {
  const spots = useMemo(() => {
    const out: [number, number][] = []
    let k = 0
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        out.push([-4.8 + c * 3.2 + (hash(k) - 0.5) * 0.9, Z0 + 3.5 + r * 4.0 + (hash(k + 50) - 0.5) * 1.0])
        k++
      }
    }
    return out
  }, [])
  const cloth = useMemo(() => new THREE.LatheGeometry(CLOTH.map(([r, y]) => new THREE.Vector2(r, y)), 32), [])
  // Pole from the floor to the table top (instances are placed at floor level).
  const pole = useMemo(() => new THREE.CylinderGeometry(0.03, 0.03, 1.08, 10).translate(0, 0.54, 0), [])
  const refs = [useRef<THREE.InstancedMesh>(null), useRef<THREE.InstancedMesh>(null), useRef<THREE.InstancedMesh>(null)]
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    for (const ref of refs) {
      spots.forEach(([x, z], i) => {
        m.makeRotationY(hash(i + 7) * Math.PI).setPosition(x, FLOOR, z)
        ref.current!.setMatrixAt(i, m)
      })
      ref.current!.instanceMatrix.needsUpdate = true
      ref.current!.computeBoundingSphere()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spots])
  return (
    <group>
      <instancedMesh ref={refs[0]} args={[cloth, undefined, spots.length]}>
        <meshStandardMaterial color={S.paper} roughness={0.8} side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={refs[1]} args={[pole, undefined, spots.length]}>
        <meshStandardMaterial color={S.steel} roughness={0.4} metalness={0.5} />
      </instancedMesh>
      <instancedMesh ref={refs[2]} args={[undefined, undefined, spots.length]}>
        <boxGeometry args={[0.6, 0.02, 0.08]} />
        <meshStandardMaterial color={S.steel} roughness={0.4} metalness={0.5} />
      </instancedMesh>
    </group>
  )
}

/** A roll-up banner stand carrying any 1:2 artwork. */
function Banner({ map, x, z, yaw }: { map: THREE.Texture; x: number; z: number; yaw: number }) {
  const W = 1.0
  const H = 2.0
  return (
    <group position={[x, FLOOR, z]} rotation-y={yaw}>
      <mesh position-y={0.05}>
        <boxGeometry args={[W + 0.04, 0.1, 0.2]} />
        <meshStandardMaterial color={S.chrome} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position-y={0.1 + H / 2}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial map={map} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.1 + H / 2, -0.005]} rotation-y={Math.PI}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color={S.fabricBack} roughness={0.9} />
      </mesh>
    </group>
  )
}

function Table({ x, z, yaw, cloth, length = 2.2 }: { x: number; z: number; yaw: number; cloth: string; length?: number }) {
  return (
    <group position={[x, FLOOR, z]} rotation-y={yaw}>
      <mesh position-y={0.38}>
        <boxGeometry args={[length, 0.76, 0.8]} />
        <meshStandardMaterial color={cloth} roughness={0.9} />
      </mesh>
    </group>
  )
}

/** The sponsor booths, laid out as photographed. */
function Booths() {
  const logos = useSponsorLogos()
  const rollupArt = useTexture(ATRIUM_ASSETS.rollup)
  rollupArt.colorSpace = THREE.SRGBColorSpace
  const art = useMemo(() => ({
    namespace: namespaceWall(logos),
    studio: agRollup(logos, 'studio'),
    talk: agRollup(logos, 'talk'),
    prime: logoRollup(logos.primeui, S.clothBlack),
    copilot: logoRollup(logos['copilotkit-color'], S.paper),
  }), [logos])
  const wallZ = Z0 + L - 7.6
  return (
    <group>
      {/* namespace: blue wall in front of the lift tower, white counter. */}
      <group position={[-1.0, FLOOR, wallZ]}>
        <mesh position-y={1.3}>
          <boxGeometry args={[3.6, 2.5, 0.12]} />
          <meshStandardMaterial color={S.namespaceBlue} roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.3, -0.065]} rotation-y={Math.PI}>
          <planeGeometry args={[3.6, 2.5]} />
          <meshStandardMaterial map={art.namespace} roughness={0.8} />
        </mesh>
        <mesh position={[0.9, 0.5, -1.0]}>
          <boxGeometry args={[1.6, 1.0, 0.55]} />
          <meshStandardMaterial color={S.paper} roughness={0.45} />
        </mesh>
      </group>
      {/* AG Grid: black-clothed table under the left gallery, three roll-ups. */}
      <Table x={-8.8} z={Z0 + 16.2} yaw={Math.PI / 2} cloth={S.clothBlack} length={2.6} />
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[-8.6 + (i % 2) * 0.09, FLOOR + 0.86, Z0 + 16.6 + Math.floor(i / 2) * 0.08]}>
          <cylinderGeometry args={[0.03, 0.03, 0.2, 10]} />
          <meshStandardMaterial color={S.hotSauce} roughness={0.3} />
        </mesh>
      ))}
      {[15.4, 15.7].map((z) => (
        <mesh key={z} position={[-8.7, FLOOR + 0.79, Z0 + z]} rotation-y={0.3}>
          <boxGeometry args={[0.35, 0.04, 0.3]} />
          <meshStandardMaterial color={S.toteBlue} roughness={0.9} />
        </mesh>
      ))}
      <Banner map={art.studio} x={-10.4} z={Z0 + 14.6} yaw={Math.PI / 2} />
      <Banner map={art.talk} x={-10.4} z={Z0 + 17.6} yaw={Math.PI / 2} />
      <Banner map={art.studio} x={-7.6} z={Z0 + 18.4} yaw={Math.PI / 2 + 0.5} />
      {/* ZurichJS community roll-up beside it. */}
      <Banner map={rollupArt} x={-10.4} z={Z0 + 12.4} yaw={Math.PI / 2} />
      {/* PrimeUI and CopilotKit further along the left side. */}
      <Table x={-9.2} z={Z0 + 8.2} yaw={Math.PI / 2} cloth={S.paper} length={1.6} />
      <Banner map={art.prime} x={-10.6} z={Z0 + 7.2} yaw={Math.PI / 2} />
      <Banner map={art.prime} x={-10.6} z={Z0 + 9.2} yaw={Math.PI / 2} />
      <Table x={-9.2} z={Z0 + 4.4} yaw={Math.PI / 2} cloth={S.paper} length={1.6} />
      <Banner map={art.copilot} x={-10.6} z={Z0 + 4.4} yaw={Math.PI / 2} />
    </group>
  )
}

/** Daylight down the void and fill under the galleries; ranges stop short of the hall. */
function Lights() {
  return (
    <>
      {[6, 16, 26].map((dz) => (
        <pointLight key={dz} position={[0, FLOOR + 10, Z0 + dz]} color={LIGHTS.foyer} intensity={1.4} decay={0} distance={12 * M} />
      ))}
      {[-1, 1].map((side) => (
        <pointLight key={side} position={[side * 9, FLOOR + 3, Z0 + 14]} color={LIGHTS.foyer} intensity={0.9} decay={0} distance={10 * M} />
      ))}
    </>
  )
}

/**
 * Two weeks out (Nadja): the dressing was still on its way. Delivery boxes
 * stacked on the bare atrium floor, shown only while the venue is undressed.
 */
function Deliveries() {
  const boxes = useMemo(() => {
    const out: { p: [number, number, number]; s: [number, number, number]; r: number }[] = []
    const stacks = [[-6, 9], [-4.6, 10.2], [4.8, 8.5], [6.2, 12], [-1.2, 14], [1.6, 6.5], [-7.2, 15.5], [3.2, 16]] as const
    stacks.forEach(([x, z], k) => {
      let y = 0
      const n = 2 + Math.floor(hash(k + 401) * 3)
      for (let i = 0; i < n; i++) {
        const w = 0.5 + hash(k * 7 + i + 11) * 0.45
        const h = 0.35 + hash(k * 5 + i + 23) * 0.3
        out.push({ p: [x + (hash(k + i + 3) - 0.5) * 0.15, FLOOR + y + h / 2, Z0 + z + (hash(k + i + 9) - 0.5) * 0.15], s: [w, h, w * 0.8], r: (hash(k * 3 + i) - 0.5) * 0.5 })
        y += h
      }
    })
    return out
  }, [])
  const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: S.cardboard, roughness: 0.9 }), [])
  return (
    <group>
      {boxes.map((b, i) => <mesh key={i} geometry={geo} material={mat} position={b.p} scale={b.s} rotation-y={b.r} />)}
    </group>
  )
}

export function Atrium() {
  return (
    <group>
      <Shell />
      {/* Galleries are cutaway too: the map should show the booth floor plan. */}
      <Cutaway>
        <Galleries />
      </Cutaway>
      <Tower />
      <Cutaway>
        <Bells />
      </Cutaway>
      <Dressing order={0} invert><Deliveries /></Dressing>
      <Dressing order={3}><CocktailTables /></Dressing>
      <Dressing order={1}><Booths /></Dressing>
      <Lights />
    </group>
  )
}
