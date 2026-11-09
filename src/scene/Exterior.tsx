import { useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { Cutaway } from './layers'
import { ATRIUM, ATRIUM_TOP, FLOOR, M, SURFACES as S, TP } from './venue'
import { corrugated, fingerFacade, hash, sawtoothRoof, streetAsphalt, technoparkLetters } from './textures'

/**
 * Technopark Zürich from outside, at night: the comb of six office fingers,
 * the spine across them (with the main entrance on Technoparkstrasse), the
 * corrugated Werkhallen between the fingers with their glazed sawtooth roofs,
 * and the streets round it (tram on Pfingstweidstrasse). Built round the
 * existing rooms: the auditorium, booth and foyer sit inside the first north
 * Werkhalle, the atrium inside the spine. Anything over a room the map shows
 * from above goes in <Cutaway>.
 *
 * Plan from OpenStreetMap and the 1993 drawings; dimensions in venue.ts (TP).
 * Built once, nothing changes on navigation.
 */

const merge = (parts: THREE.BufferGeometry[]) => { const g = mergeGeometries(parts)!; parts.forEach((q) => q.dispose()); return g }
/** A box from min/max corners (metres, y from the floor). */
const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
  new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)

/** A block whose faces carry a façade texture with UVs in metres (u along the face, v up). */
function facadeBlock(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, tileW: number, tileH: number) {
  const g = box(x0, x1, y0, y1, z0, z1)
  const pos = g.attributes.position!
  const nor = g.attributes.normal!
  const uv = g.attributes.uv!
  for (let i = 0; i < pos.count; i++) {
    const nx = Math.abs(nor.getX(i)), ny = Math.abs(nor.getY(i))
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
    if (ny > 0.5) uv.setXY(i, x / tileW, z / tileW)
    else if (nx > 0.5) uv.setXY(i, z / tileW, (y - y0) / tileH)
    else uv.setXY(i, x / tileW, (y - y0) / tileH)
  }
  return g
}

const SN = TP.spine
const fingerZ = { north: [TP.north.z0, SN.z0] as const, south: [SN.z1, TP.south.z1] as const }

function Fingers() {
  const facade = useMemo(() => { const t = fingerFacade(); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t }, [])
  const tin = useMemo(() => corrugated([1, 1]), [])
  const mats = useMemo(() => ({
    facade: new THREE.MeshStandardMaterial({ map: facade, roughness: 0.75, emissive: '#ffffff', emissiveMap: facade, emissiveIntensity: 0.25 }),
    tin: new THREE.MeshStandardMaterial({ map: tin, roughness: 0.4, metalness: 0.6 }),
    roof: new THREE.MeshStandardMaterial({ color: S.terminal, roughness: 0.9 }),
    zinc: new THREE.MeshStandardMaterial({ color: S.zinc, roughness: 0.5, metalness: 0.5 }),
    gallery: new THREE.MeshStandardMaterial({ color: S.glassMullion, roughness: 0.5, metalness: 0.4 }),
  }), [facade, tin])

  // Upper storeys (façade), the roof storey (set back, zinc), the ground floor (tin), galleries along the long sides.
  const geo = useMemo(() => {
    const body: THREE.BufferGeometry[] = []
    const zinc: THREE.BufferGeometry[] = []
    const ground: THREE.BufferGeometry[] = []
    const gal: THREE.BufferGeometry[] = []
    const heads: THREE.BufferGeometry[] = []
    for (const [x0, x1] of TP.bands) {
      for (const [z0, z1] of [fingerZ.north, fingerZ.south]) {
        const south = z0 === SN.z1
        // The south ends stand on columns over the delivery road for the last stretch.
        const zg1 = south ? z1 - TP.south.cantilever : z1
        ground.push(box(x0, x1, 0, TP.ground, z0, zg1))
        body.push(facadeBlock(x0, x1, TP.ground, TP.eave, z0, z1, 10, TP.storey))
        zinc.push(box(x0 + 1.2, x1 - 1.2, TP.eave, TP.roof, z0 + 1.2, z1 - 1.2))
        if (south) for (const cx of [x0 + 2, (x0 + x1) / 2, x1 - 2]) ground.push(new THREE.CylinderGeometry(0.35, 0.35, TP.ground, 10).translate(cx, TP.ground / 2, z1 - 1.5))
        for (let k = 1; k <= TP.storeys; k++) {
          const y = TP.ground + (k - 1) * TP.storey
          for (const [gx0, gx1] of [[x0 - 1.2, x0], [x1, x1 + 1.2]] as const) gal.push(box(gx0, gx1, y - 0.15, y, z0 + 2, z1 - 2))
        }
        // The stepped head at the outer end: each storey a little further out (an upside-down ziggurat).
        const end = south ? z1 : z0
        const dir = south ? 1 : -1
        for (let k = 0; k <= TP.storeys; k++) {
          const y = k === 0 ? 0 : TP.ground + (k - 1) * TP.storey
          const h = k === 0 ? TP.ground : TP.storey
          const out = k * 0.45
          heads.push(box(x0 + 0.5, x1 - 0.5, y, y + h, Math.min(end, end + dir * out), Math.max(end, end + dir * out) + (south ? 0 : 0)))
        }
      }
    }
    return { body: merge(body), zinc: merge(zinc), ground: merge(ground), gal: merge(gal), heads: merge(heads) }
  }, [])
  const letters = useMemo(() => technoparkLetters(), [])
  return (
    <group>
      <mesh geometry={geo.body} material={mats.facade} />
      <mesh geometry={geo.zinc} material={mats.zinc} />
      <mesh geometry={geo.ground} material={mats.tin} />
      <mesh geometry={geo.gal} material={mats.gallery} />
      <mesh geometry={geo.heads} material={mats.tin} />
      {/* TECHNOPARK on the north finger heads, toward Giessereistrasse. */}
      {TP.bands.map(([x0, x1]) => (
        <mesh key={x0} position={[(x0 + x1) / 2, TP.eave - 1.6, TP.north.z0 - TP.storeys * 0.45 - 0.05]} rotation-y={Math.PI}>
          <planeGeometry args={[(x1 - x0) * 0.8, (x1 - x0) * 0.8 * (160 / 1024)]} />
          <meshBasicMaterial map={letters} transparent toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

/** The low halls between the fingers: tin walls on a concrete plinth, glazed sawtooth roofs. */
function Werkhallen() {
  const tin = useMemo(() => corrugated([8, 1]), [])
  const roofTex = useMemo(() => sawtoothRoof([6, 8]), [])
  const halls = useMemo(() => {
    const out: [number, number, number, number][] = []
    const gaps = [[TP.bands[0][1], TP.bands[1][0]], [TP.bands[1][1], TP.bands[2][0]]] as const
    for (const [x0, x1] of gaps) {
      out.push([x0, x1, TP.north.z0, SN.z0])
      out.push([x0, x1, TP.werkSouth.z0, TP.werkSouth.z1])
    }
    return out
  }, [])
  // The auditorium's hall (first gap, north) is hollow: rooms inside. The others are solid.
  const auditorium = halls[0]!
  const walls = useMemo(() => merge(halls.flatMap(([x0, x1, z0, z1], i) => {
    if (i === 0) return [box(x0, x1, 0, TP.werk, z0, z0 + 0.3)] // just the gable toward the street
    return [box(x0, x1, 0, TP.werk, z0, z1)]
  })), [halls])
  const roofs = useMemo(() => {
    const parts: THREE.BufferGeometry[] = []
    halls.forEach(([x0, x1, z0, z1]) => {
      // Sawtooth teeth across x, every 4 m along z.
      for (let z = z0; z < z1 - 0.1; z += 4) {
        const g = new THREE.BufferGeometry()
        const v = new Float32Array([
          x0, TP.werk, z, x1, TP.werk, z, x1, TP.werk + 1.6, z + 0.6,
          x0, TP.werk, z, x1, TP.werk + 1.6, z + 0.6, x0, TP.werk + 1.6, z + 0.6,
          x0, TP.werk + 1.6, z + 0.6, x1, TP.werk + 1.6, z + 0.6, x1, TP.werk, Math.min(z1, z + 4),
          x0, TP.werk + 1.6, z + 0.6, x1, TP.werk, Math.min(z1, z + 4), x0, TP.werk, Math.min(z1, z + 4),
        ])
        g.setAttribute('position', new THREE.BufferAttribute(v, 3))
        const uv = new Float32Array(v.length / 3 * 2)
        for (let i = 0; i < v.length / 3; i++) { uv[i * 2] = v[i * 3]! / 10; uv[i * 2 + 1] = v[i * 3 + 2]! / 10 }
        g.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
        g.computeVertexNormals()
        parts.push(g)
      }
    })
    return merge(parts)
  }, [halls])
  const letters = useMemo(() => technoparkLetters(), [])
  const [ax0, ax1, az0] = auditorium
  return (
    <group>
      <mesh geometry={walls}>
        <meshStandardMaterial map={tin} roughness={0.4} metalness={0.6} />
      </mesh>
      <Cutaway>
        <mesh geometry={roofs}>
          <meshStandardMaterial map={roofTex} roughness={0.3} metalness={0.4} emissive={'#ffcf8a'} emissiveIntensity={0.08} side={THREE.DoubleSide} />
        </mesh>
      </Cutaway>
      {/* The gable over the auditorium: big door, glass canopy, TECHNOPARK. */}
      <mesh position={[(ax0 + ax1) / 2, TP.werk - 2.2, az0 - 0.02]} rotation-y={Math.PI}>
        <planeGeometry args={[(ax1 - ax0) * 0.7, (ax1 - ax0) * 0.7 * (160 / 1024)]} />
        <meshBasicMaterial map={letters} transparent toneMapped={false} />
      </mesh>
      <mesh position={[(ax0 + ax1) / 2, 2.5, az0 - 0.05]} rotation-y={Math.PI}>
        <planeGeometry args={[6, 5]} />
        <meshStandardMaterial color={S.terminal} roughness={0.7} />
      </mesh>
      <mesh position={[(ax0 + ax1) / 2, 5.2, az0 - 1.6]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[8, 3]} />
        <meshStandardMaterial color={S.glass} transparent opacity={0.35} roughness={0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  )
}

/** The spine: solid either side of the atrium, its roof and upper ends over it (cutaway), the entrance and roof sign on Technoparkstrasse. */
function Spine() {
  const facade = useMemo(() => { const t = fingerFacade(); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t }, [])
  const ax = ATRIUM.void / 2 + ATRIUM.gallery + 0.2
  const top = ATRIUM_TOP - FLOOR
  const solid = useMemo(() => merge([
    facadeBlock(SN.x0, -ax, 0, TP.roof, SN.z0, SN.z1, 10, TP.storey),
    facadeBlock(ax, SN.head, 0, TP.roof, SN.z0, SN.z1, 10, TP.storey),
    facadeBlock(SN.head, SN.x1, 0, TP.headRoof, SN.z0, SN.z1, 10, TP.storey),
  ]), [ax])
  const over = useMemo(() => merge([
    box(-ax, ax, TP.roof - 0.4, TP.roof, SN.z0, SN.z1),
    box(-ax, ax, top, TP.roof, SN.z0, SN.z0 + 0.3),
    box(-ax, ax, top, TP.roof, SN.z1 - 0.3, SN.z1),
  ]), [ax, top])
  const sign = useMemo(() => technoparkLetters('#f4f4f2'), [])
  const letters = useMemo(() => technoparkLetters('#d9dcdf'), [])
  const zc = (SN.z0 + SN.z1) / 2
  const stacks = useMemo(() => merge([10, 18, 92, 104].flatMap((z) => [0, 1.3, 2.6].map((dz) => new THREE.CylinderGeometry(0.5, 0.5, 4.5, 16).translate(SN.x1 + 3, 2.25, z + dz)))), [])
  return (
    <group>
      <mesh geometry={solid}>
        <meshStandardMaterial map={facade} roughness={0.75} emissive={'#ffffff'} emissiveMap={facade} emissiveIntensity={0.25} />
      </mesh>
      <Cutaway>
        <mesh geometry={over}>
          <meshStandardMaterial color={S.terminal} roughness={0.85} />
        </mesh>
      </Cutaway>
      {/* Main entrance: a glazed, lit lobby across the ground floor, a glass canopy on tie-rods, two revolving drums. */}
      <mesh position={[SN.x1 + 0.02, TP.ground / 2, zc]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[18, TP.ground - 0.4]} />
        <meshBasicMaterial color={S.lamp} toneMapped={false} />
      </mesh>
      <mesh position={[SN.x1 + 1.6, 4.5, zc]} rotation-z={Math.PI / 2} rotation-y={Math.PI / 2}>
        <planeGeometry args={[18, 3]} />
        <meshStandardMaterial color={S.glass} transparent opacity={0.35} roughness={0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* The rotunda (aftermovie): a curved canopy over the revolving door, TECHNOPARK in silver letters along its edge. */}
      <group position={[SN.x1, 0, zc]}>
        <mesh position-y={3.55} rotation-y={Math.PI / 2}>
          <cylinderGeometry args={[3.4, 3.4, 0.5, 40, 1, true, -Math.PI / 2, Math.PI]} />
          <meshStandardMaterial color={S.chrome} roughness={0.4} metalness={0.6} side={THREE.DoubleSide} />
        </mesh>
        <mesh position-y={3.3} rotation-x={-Math.PI / 2} rotation-z={Math.PI / 2}>
          <circleGeometry args={[3.4, 40, 0, Math.PI]} />
          <meshStandardMaterial color={S.paper} roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        <mesh position-y={4.25} rotation-y={Math.PI / 2}>
          <cylinderGeometry args={[3.42, 3.42, 0.9, 40, 1, true, -Math.PI / 2.6, Math.PI / 1.3]} />
          <meshBasicMaterial map={letters} transparent toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {[-4, 4].map((dz) => (
        <mesh key={dz} position={[SN.x1 + 0.9, 1.25, zc + dz]}>
          <cylinderGeometry args={[1.1, 1.1, 2.5, 24, 1, true]} />
          <meshStandardMaterial color={S.glass} transparent opacity={0.45} roughness={0.05} metalness={0.4} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
      {/* The roof sign: TECHNOPARK, lit, on a frame above the spine head. */}
      <mesh position={[SN.x1 - 1, TP.headRoof + 1.6, zc]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[16, 16 * (160 / 1024)]} />
        <meshBasicMaterial map={sign} transparent toneMapped={false} />
      </mesh>
      <mesh geometry={stacks}>
        <meshStandardMaterial color={S.chrome} roughness={0.35} metalness={0.8} />
      </mesh>
      <pointLight position={[SN.x1 + 6, 6, zc]} color={S.lamp} intensity={1.2} decay={0} distance={30 * M} />
    </group>
  )
}

/** Streets: Technoparkstrasse along the entrance side, Pfingstweidstrasse (with the tram) and Giessereistrasse across the ends; street lamps. */
function Streets() {
  const along = useMemo(() => streetAsphalt([2, 30]), [])
  const across = useMemo(() => { const t = streetAsphalt([2, 30]); t.rotation = Math.PI / 2; return t }, [])
  const rails = useMemo(() => merge([-3.2, -1.8, 1.8, 3.2].map((dz) => box(-70, 110, 0.03, 0.06, TP.streets.pfingstweid + dz - 0.04, TP.streets.pfingstweid + dz + 0.04))), [])
  const lamps = useMemo(() => {
    const poles: THREE.BufferGeometry[] = []
    const heads: THREE.BufferGeometry[] = []
    for (let z = -20; z < 150; z += 18) { poles.push(box(TP.streets.technopark - 6.4, TP.streets.technopark - 6.2, 0, 8, z, z + 0.2)); heads.push(box(TP.streets.technopark - 7.4, TP.streets.technopark - 5.2, 7.9, 8.1, z - 0.2, z + 0.4)) }
    for (let x = -60; x < 100; x += 20) for (const z of [TP.streets.pfingstweid - 9, TP.streets.pfingstweid + 9]) { poles.push(box(x, x + 0.2, 0, 8, z, z + 0.2)); heads.push(box(x - 0.6, x + 0.8, 7.9, 8.1, z - 0.3, z + 0.5)) }
    return { poles: merge(poles), heads: merge(heads) }
  }, [])
  const trees = useMemo(() => merge(Array.from({ length: 26 }, (_, i) => {
    const x = TP.streets.technopark + 8 + hash(i) * 6
    const z = -10 + i * 6 + hash(i + 50) * 2
    return new THREE.SphereGeometry(2 + hash(i + 9) * 0.8, 10, 8).translate(x, 6 + hash(i + 3), z)
  })), [])
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[TP.streets.technopark, 0.02, 60]}>
        <planeGeometry args={[11, 200]} />
        <meshStandardMaterial map={along} roughness={0.9} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} rotation-z={Math.PI / 2} position={[20, 0.02, TP.streets.pfingstweid]}>
        <planeGeometry args={[18, 180]} />
        <meshStandardMaterial map={across} roughness={0.9} />
      </mesh>
      {/* Grass tram corridor down the middle of Pfingstweidstrasse, rails on it. */}
      <mesh rotation-x={-Math.PI / 2} position={[20, 0.025, TP.streets.pfingstweid]}>
        <planeGeometry args={[180, 8.4]} />
        <meshStandardMaterial color={S.leafDark} roughness={1} />
      </mesh>
      <mesh geometry={rails}>
        <meshStandardMaterial color={S.chrome} metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} rotation-z={Math.PI / 2} position={[20, 0.02, TP.streets.giesserei]}>
        <planeGeometry args={[9, 180]} />
        <meshStandardMaterial map={across} roughness={0.9} />
      </mesh>
      <mesh geometry={lamps.poles}>
        <meshStandardMaterial color={S.terminal} roughness={0.6} />
      </mesh>
      <mesh geometry={lamps.heads}>
        <meshBasicMaterial color={S.lamp} toneMapped={false} />
      </mesh>
      <mesh geometry={trees}>
        <meshStandardMaterial color={S.leafDark} roughness={1} />
      </mesh>
    </group>
  )
}

export function Exterior() {
  return (
    <group position={[0, FLOOR, 0]}>
      <Fingers />
      <Werkhallen />
      <Spine />
      <Streets />
    </group>
  )
}
