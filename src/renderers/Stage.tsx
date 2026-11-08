import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { GROUNDS } from '../brand/tokens'
import { createFrameCanvas, paintCurrent } from '../engine/frame'
import { useDeck } from '../engine/store'
import { CUE, STILL } from '../engine/params'
import { slides } from '../content/slides'
import { CAMERA_CUES, type CameraCue } from '../engine/types'
import { Set } from '../scene/Set'
import { CUES, FLOOR, HALL, M, routeBetween, SCREEN, type Space } from '../scene/venue'
import { MASK } from '../scene/layers'

export { SCREEN }

/** ?cue= override, validated against the closed list. */
const FORCED: CameraCue | undefined = CAMERA_CUES.find((c) => c === CUE)

/**
 * Distance at which the screen exactly COVERS the viewport at any aspect —
 * so 'screen' slides look like a plain projector feed, no visible edge.
 */
function coverDistance(fovDeg: number, aspect: number) {
  const t = Math.tan(THREE.MathUtils.degToRad(fovDeg) / 2)
  return Math.min(SCREEN.height / (2 * t), SCREEN.width / (2 * t * aspect))
}

/** Resolved poses in world units, built once (navigation allocates nothing). */
const POSES = Object.fromEntries(
  Object.entries(CUES).map(([name, c]) => [
    name,
    {
      pos: new THREE.Vector3(...c.pos).multiplyScalar(M),
      target: new THREE.Vector3(...c.target).multiplyScalar(M),
      fov: c.fov,
      space: c.space ?? 'hall',
    },
  ]),
) as Record<Exclude<CameraCue, 'screen'>, Pose>
const SCREEN_POSE: Pose = { pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 35, space: 'hall' }

interface Pose { pos: THREE.Vector3; target: THREE.Vector3; fov: number; space: Space }

/** 'screen' is solved per aspect; every other cue is a measured pose in the venue. */
function cue(name: CameraCue, aspect: number) {
  if (name !== 'screen') return POSES[name]
  SCREEN_POSE.pos.set(0, 0, coverDistance(SCREEN_POSE.fov, aspect))
  return SCREEN_POSE
}

/**
 * Medium: the main projection screen. `uEffect` 0 = bit-exact passthrough;
 * 1 = projected light in a dim hall: lifted blacks (a projector cannot make
 * black, only less light), a soft hotspot and edge falloff, a touch of warmth.
 */
const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`
const fragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uEffect;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(uMap, vUv);
    if (uEffect > 0.0) {
      vec2 d = (vUv - 0.5) * vec2(1.0, 0.5625);
      float hotspot = 1.04 - 0.55 * dot(d, d) * 4.0;
      vec3 p = mix(vec3(0.085, 0.082, 0.078), vec3(1.0, 0.985, 0.95), c.rgb) * hotspot;
      c.rgb = mix(c.rgb, p, uEffect);
    }
    gl_FragColor = c;
    #include <colorspace_fragment>
  }
`

/** The frame canvas, its texture and the one medium material every live surface shares. */
function useFrameMaterial() {
  const canvas = useMemo(createFrameCanvas, [])
  const ctx = useMemo(() => canvas.getContext('2d')!, [canvas])
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return t
  }, [canvas])
  const uniforms = useMemo(() => ({ uMap: { value: texture }, uEffect: { value: 0 } }), [texture])
  const state = useMemo(() => ({ animating: true }), [])

  useEffect(() => useDeck.subscribe(() => { state.animating = true }), [state])

  useFrame((_, dt) => {
    if (state.animating) {
      state.animating = paintCurrent(ctx, performance.now())
      texture.needsUpdate = true
    }
    const target = slides[useDeck.getState().index]?.effect ?? 0
    uniforms.uEffect.value = THREE.MathUtils.damp(uniforms.uEffect.value, target, 4, dt)
  })

  return useMemo(
    () => new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms, toneMapped: false }),
    [uniforms],
  )
}

function Scene() {
  const frame = useFrameMaterial()
  return (
    <>
      <mesh material={frame}>
        <planeGeometry args={[SCREEN.width, SCREEN.height]} />
      </mesh>
      <Set frame={frame} />
      <CameraRig />
    </>
  )
}

/**
 * POV camera: every cue change is one walk (or, to and from the map, one
 * crane shot). The route threads the portals at eye height; height is a
 * separate, monotone ramp between control points, so the camera never bobs.
 * While walking it looks level, straight ahead; it turns to the subject as
 * it arrives. Short moves inside a room just glide and re-aim. ?still lands
 * instantly. Starting a move builds a small CPU curve; nothing GPU-side.
 */
const sine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const spaceOf = (name: CameraCue): Space => (name === 'screen' ? 'hall' : (CUES[name].space ?? 'hall'))
const ROOF = (FLOOR + HALL.ridge + 0.3) * M

interface Move {
  name: CameraCue | ''
  xz: THREE.CatmullRomCurve3 | null
  /** Height at each control point and its arc-length position (0..1). */
  hs: number[]
  ss: number[]
  t0: number
  dur: number
  walk: boolean
  crane: boolean
  fromLook: THREE.Vector3
  fromFov: number
}

function heightAt(m: Move, s: number) {
  for (let k = 1; k < m.ss.length; k++) {
    if (s <= m.ss[k]! || k === m.ss.length - 1) {
      return THREE.MathUtils.lerp(m.hs[k - 1]!, m.hs[k]!, smooth(m.ss[k - 1]!, m.ss[k]!, s))
    }
  }
  return m.hs[m.hs.length - 1]!
}

function CameraRig() {
  const { camera, size } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  const tmp = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), walkLook: new THREE.Vector3() }), [])
  const mv = useMemo<Move>(() => ({
    name: '', xz: null, hs: [], ss: [], t0: 0, dur: 0, walk: false, crane: false, fromLook: new THREE.Vector3(), fromFov: 35,
  }), [])
  useFrame(() => {
    const name = FORCED ?? slides[useDeck.getState().index]?.camera ?? 'screen'
    const c = cue(name, size.width / size.height)
    const cam = camera as THREE.PerspectiveCamera
    const now = performance.now() / 1000

    if (name !== mv.name) {
      const first = mv.name === ''
      const from = first ? c.space : spaceOf(mv.name as CameraCue)
      const pts = [cam.position.clone(), ...routeBetween(from, c.space).map((w) => new THREE.Vector3(...w).multiplyScalar(M)), c.pos.clone()]
      // Plan route on the floor plane; height rides separately.
      const flat = pts.map((p) => new THREE.Vector3(p.x, 0, p.z))
      let acc = 0
      const lens = [0]
      for (let k = 1; k < flat.length; k++) { acc += flat[k]!.distanceTo(flat[k - 1]!) + Math.abs(pts[k]!.y - pts[k - 1]!.y) * 0.5; lens.push(acc) }
      mv.ss = lens.map((l) => (acc > 0 ? l / acc : 1))
      mv.hs = pts.map((p) => p.y)
      mv.xz = acc > 1e-6 ? new THREE.CatmullRomCurve3(flat, false, 'centripetal') : null
      const metres = acc / M
      mv.crane = from === 'map' || c.space === 'map'
      mv.walk = !mv.crane && (pts.length > 2 || metres > 8)
      mv.dur = first || STILL ? 0 : Math.min(mv.crane ? 5.5 : 5, Math.max(1.6, 1.2 + metres / 5.5))
      mv.fromLook.copy(first ? c.target : look)
      mv.fromFov = first ? c.fov : cam.fov
      mv.t0 = now
      mv.name = name
    }

    const t = mv.dur > 0 ? Math.min(1, (now - mv.t0) / mv.dur) : 1
    if (t >= 1 || !mv.xz) {
      cam.position.copy(c.pos)
      look.copy(c.target)
      cam.fov = c.fov
    } else {
      const e = sine(t)
      mv.xz.getPointAt(e, tmp.a)
      cam.position.set(tmp.a.x, heightAt(mv, e), tmp.a.z)
      if (mv.walk) {
        // Eyes level, looking down the route, then turning to the subject.
        mv.xz.getPointAt(Math.min(1, e + 0.1), tmp.b)
        if (tmp.b.distanceToSquared(tmp.a) < 1e-6) tmp.b.copy(c.target)
        tmp.walkLook.set(tmp.b.x, cam.position.y, tmp.b.z)
        tmp.b.lerpVectors(mv.fromLook, tmp.walkLook, smooth(0, 0.25, e))
        look.lerpVectors(tmp.b, c.target, smooth(0.6, 1, e))
      } else {
        // Glides and crane shots keep their eyes on the subject throughout.
        look.lerpVectors(mv.fromLook, c.target, smooth(0, mv.crane ? 0.7 : 1, e))
      }
      cam.fov = THREE.MathUtils.lerp(mv.fromFov, c.fov, smooth(0, 1, e))
    }
    cam.updateProjectionMatrix()
    cam.lookAt(look)
    // Roofs vanish only once the camera is above them (crane shots to and from the map).
    const above = cam.position.y > ROOF
    cam.layers.mask = name === 'map' && t >= 1 ? MASK.map : mv.crane && above ? MASK.travel : MASK.normal
  })
  return null
}

export function Stage() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 20], fov: 35, near: 0.1, far: 500 }}
      flat
    >
      <color attach="background" args={[GROUNDS.dark.bg]} />
      <Scene />
    </Canvas>
  )
}
