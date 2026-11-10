import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { isAwake, keepAwake, setContinuous } from '../engine/activity'
import { showSpaces, showVenues } from '../scene/venues'
import { GROUNDS } from '../brand/tokens'
import { createFrameCanvas, paintCurrent, setHoldPolicy } from '../engine/frame'
import { useDeck } from '../engine/store'
import { CUE, DEBUG, STILL } from '../engine/params'
import { slides } from '../content/slides'
import { CAMERA_CUES, type CameraCue } from '../engine/types'
import { Set } from '../scene/Set'
import { CUES, FLOOR, FOIFI_IMAGE, GATE_IMAGE, PHONE_IMAGE, PHONE_TURN_SECS, SEAT_IMAGE, HALL, PROJECTOR_PANEL, M, routeBetween, SCREEN, type SolvedCue, type Space } from '../scene/venue'
import { MASK } from '../scene/layers'

export { SCREEN }

/** ?cue= override, validated against the closed list. */
const FORCED: CameraCue | undefined = CAMERA_CUES.find((c) => c === CUE)

/**
 * Distance at which the screen exactly COVERS the viewport at any aspect —
 * so 'screen' slides look like a plain projector feed, no visible edge.
 */
function coverDistance(fovDeg: number, aspect: number, width = SCREEN.width) {
  const t = Math.tan(THREE.MathUtils.degToRad(fovDeg) / 2)
  const height = width * (SCREEN.height / SCREEN.width)
  // Wider than the frame: cover (crop a sliver top and bottom). Narrower (portrait phones): stay at the
  // 16:9 distance and widen the lens instead (solvedFov), so the camera never backs into the room and
  // nothing (seats, people, the booth) can come between it and the screen.
  if (aspect >= SCREEN.width / SCREEN.height) return Math.min(height / (2 * t), width / (2 * t * aspect))
  return height / (2 * t)
}

/** The lens for a solved cue: its own fov down to 16:9, wider below so the whole frame fits. */
const solvedFov = (fov: number, aspect: number) => fovFor(fov, aspect)

/** Keep a pose's horizontal view on screens narrower than 16:9: widen the vertical fov (capped). */
function fovFor(fov: number, aspect: number) {
  const wide = SCREEN.width / SCREEN.height
  if (aspect >= wide) return fov
  const t = Math.tan(THREE.MathUtils.degToRad(fov) / 2) * (wide / aspect)
  return Math.min(100, THREE.MathUtils.radToDeg(2 * Math.atan(t)))
}

/** Seconds a choreographed entrance takes unless its cue says otherwise. */
const REVEAL = 4.6

/** Resolved poses in world units, built once (navigation allocates nothing). */
const POSES = Object.fromEntries(
  Object.entries(CUES).map(([name, c]) => [
    name,
    {
      pos: new THREE.Vector3(...c.pos).multiplyScalar(M),
      target: new THREE.Vector3(...c.target).multiplyScalar(M),
      fov: c.fov,
      base: c.fov,
      space: c.space ?? 'hall',
      enter: c.enter && { from: c.enter.from, follow: !!c.enter.follow, seconds: c.enter.seconds ?? REVEAL, watch: c.enter.watch && new THREE.Vector3(...c.enter.watch).multiplyScalar(M), turn: c.enter.turn ?? ([0.35, 0.95] as const), via: c.enter.via.map((w) => new THREE.Vector3(...w).multiplyScalar(M)) },
    },
  ]),
) as Record<Exclude<CameraCue, SolvedCue>, Pose>
const SCREEN_POSE: Pose = { pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 35, space: 'hall' }

interface Pose { pos: THREE.Vector3; target: THREE.Vector3; fov: number; base?: number; space: Space; enter?: { from: CameraCue; via: THREE.Vector3[]; follow: boolean; watch?: THREE.Vector3; seconds: number; turn: readonly [number, number] } }

/** 'screen' is solved per aspect; every other cue is a measured pose in the venue. */
const PROJECTOR_POSE: Pose = { pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 35, space: 'foifi' }
const FOIFI_FULL: Pose = { pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 35, space: 'foifi' }

const GATE_FULL: Pose = { pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 35, space: 'gate' }
const SEAT_FULL: Pose = { pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 35, space: 'plane' }
// From the phone in his hand: a slow close-in while the phone turns landscape (Caller.tsx).
const PHONE_FULL: Pose = { pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 35, space: 'foifi', enter: { from: 'phone', via: [], follow: false, seconds: PHONE_TURN_SECS, turn: [0, 1] } }

/** Fill the viewport with an image facing +z (facing = 1) or −z (facing = −1). */
function fill(pose: Pose, img: { width: number; centre: readonly [number, number, number] }, facing: 1 | -1, aspect: number) {
  pose.fov = solvedFov(35, aspect)
  pose.target.set(...img.centre).multiplyScalar(M)
  pose.pos.copy(pose.target)
  pose.pos.z += facing * coverDistance(35, aspect, img.width * M)
  return pose
}

function cue(name: CameraCue, aspect: number) {
  // The departures board faces into the lounge (+z).
  if (name === 'gate-full') return fill(GATE_FULL, GATE_IMAGE, 1, aspect)
  // The seat-back screen in front of 15C faces back down the cabin (−z), toward us.
  if (name === 'seat-full') return fill(SEAT_FULL, SEAT_IMAGE, -1, aspect)
  // Faris's phone, held landscape, its screen facing him (+z).
  if (name === 'phone-full') return fill(PHONE_FULL, PHONE_IMAGE, 1, aspect)
  if (name === 'foifi-full') {
    // Foifi's projector screen fills the viewport, like 'screen' does in the hall.
    const [x, y, z] = FOIFI_IMAGE.centre
    FOIFI_FULL.target.set(x, y, z).multiplyScalar(M)
    FOIFI_FULL.pos.copy(FOIFI_FULL.target)
    FOIFI_FULL.pos.z += coverDistance(35, aspect, FOIFI_IMAGE.width * M)
    FOIFI_FULL.fov = solvedFov(35, aspect)
    return FOIFI_FULL
  }
  if (name === 'projector') {
    // Looking into Foifi's projector lens: the panel inside fills the viewport.
    const [x, y, z] = PROJECTOR_PANEL.centre
    PROJECTOR_POSE.target.set(x, y, z).multiplyScalar(M)
    PROJECTOR_POSE.pos.copy(PROJECTOR_POSE.target)
    PROJECTOR_POSE.pos.z -= coverDistance(35, aspect, PROJECTOR_PANEL.width * M)
    PROJECTOR_POSE.fov = solvedFov(35, aspect)
    return PROJECTOR_POSE
  }
  if (name !== 'screen') {
    const p = POSES[name]
    p.fov = fovFor(p.base ?? p.fov, aspect)
    return p
  }
  SCREEN_POSE.pos.set(0, 0, coverDistance(35, aspect))
  SCREEN_POSE.fov = solvedFov(35, aspect)
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
      if (state.animating) keepAwake(120)
    }
    const target = slides[useDeck.getState().index]?.effect ?? 0
    uniforms.uEffect.value = THREE.MathUtils.damp(uniforms.uEffect.value, target, 4, dt)
    if (Math.abs(uniforms.uEffect.value - target) > 0.002) keepAwake(120)
  })

  return useMemo(
    () => new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms, toneMapped: false }),
    [uniforms],
  )
}

/**
 * Draw only while something moves: a requestAnimationFrame loop asks R3F for a
 * frame while the stage is awake (navigation, camera moves, draw-ins, props).
 * A settled slide costs nothing.
 */
function Pump() {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    keepAwake(3000)
    const unsub = useDeck.subscribe(() => keepAwake(9000))
    let raf = 0
    const tick = (now: number) => {
      if (isAwake(now)) invalidate()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); unsub() }
  }, [invalidate])
  return null
}

/**
 * Compile every venue combination's shaders up front. Hiding a venue hides its
 * lights, which changes the light count three.js compiles for; doing it here
 * means no program is ever compiled mid-move.
 */
function Prewarm() {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    if (DEBUG) (window as unknown as { __deck: unknown }).__deck = { gl, scene, camera }
    const id = setTimeout(() => {
      // The only combinations a move can show: one venue (walks inside it), Technopark + airport (the city view), or all three (crane shots).
      for (const [t, f, a] of [[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1]] as const) {
        showVenues(!!t, !!f, !!a)
        gl.compile(scene, camera)
      }
      const index = useDeck.getState().index
    const name = FORCED ?? slides[index]?.camera ?? 'screen'
      showSpaces(spaceOf(name))
      keepAwake(500)
    }, 0)
    return () => clearTimeout(id)
  }, [gl, scene, camera])
  return null
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
      <Pump />
      <Prewarm />
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
const spaceOf = (name: CameraCue): Space =>
  name === 'screen' ? 'hall'
  : name === 'projector' || name === 'foifi-full' ? 'foifi'
  : name === 'gate-full' ? 'gate'
  : name === 'seat-full' ? 'plane'
  : name === 'phone-full' ? 'foifi'
  : (CUES[name].space ?? 'hall')
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
  reveal: boolean
  curtain: boolean
  fromLook: THREE.Vector3
  fromFov: number
  /** Arrived: only the destination venue is drawn. */
  settled: boolean
}

function heightAt(m: Move, s: number) {
  for (let k = 1; k < m.ss.length; k++) {
    if (s <= m.ss[k]! || k === m.ss.length - 1) {
      return THREE.MathUtils.lerp(m.hs[k - 1]!, m.hs[k]!, smooth(m.ss[k - 1]!, m.ss[k]!, s))
    }
  }
  return m.hs[m.hs.length - 1]!
}

/** A curtain: fade to black, cut, fade back in (seconds, whole thing). */
const CURTAIN = 1.1
/** The black overlay the curtain fades; mutated in the frame loop, never re-rendered. */
const curtainEl: { current: HTMLDivElement | null } = { current: null }

/** How long a move lasts, from its route (metres) and kind. One formula for the rig and the hand-off. */
const moveDuration = (metres: number, crane: boolean) =>
  Math.min(crane ? 5.5 : 5, Math.max(1.6, 1.2 + metres / 5.5))

/** Seconds the camera takes from cue a's pose to cue b's (same plan as the rig, from a's resting pose). */
function moveSeconds(a: CameraCue, b: CameraCue, aspect: number, curtain = false) {
  if (a === b) return 0
  if (curtain) return CURTAIN
  const pa = cue(a, aspect).pos.clone()
  const cb = cue(b, aspect)
  const fromSpace = spaceOf(a)
  if (cb.enter?.from === a) return cb.enter.seconds
  const via = routeBetween(fromSpace, cb.space).map((w) => new THREE.Vector3(...w).multiplyScalar(M))
  const pts = [pa, ...via, cb.pos.clone()]
  let acc = 0
  for (let k = 1; k < pts.length; k++) {
    acc += Math.hypot(pts[k]!.x - pts[k - 1]!.x, pts[k]!.z - pts[k - 1]!.z) + Math.abs(pts[k]!.y - pts[k - 1]!.y) * 0.5
  }
  const crane = fromSpace === 'map' || cb.space === 'map' || fromSpace === 'city' || cb.space === 'city' || pts.some((p) => p.y > (FLOOR + 12) * M)
  return moveDuration(acc / M, crane)
}

/**
 * While the camera turns away from a screen, that screen keeps the previous
 * slide: the new one appears halfway through the move, never while the old
 * view is still in shot.
 */
const HOLD = 0.5
const cueOf = (i: number): CameraCue => FORCED ?? slides[i]?.camera ?? 'screen'

function CameraRig() {
  const { camera, size } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  const tmp = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), walkLook: new THREE.Vector3() }), [])
  const mv = useMemo<Move>(() => ({
    name: '', xz: null, hs: [], ss: [], t0: 0, dur: 0, walk: false, crane: false, reveal: false, curtain: false, fromLook: new THREE.Vector3(), fromFov: 35, settled: false,
  }), [])
  useFrame(() => {
    const index = useDeck.getState().index
    const name = FORCED ?? slides[index]?.camera ?? 'screen'
    const c = cue(name, size.width / size.height)
    const cam = camera as THREE.PerspectiveCamera
    const now = performance.now() / 1000

    if (name !== mv.name) {
      const first = mv.name === ''
      const from = first ? c.space : spaceOf(mv.name as CameraCue)
      mv.reveal = !first && c.enter?.from === mv.name
      const via = mv.reveal ? c.enter!.via : routeBetween(from, c.space).map((w) => new THREE.Vector3(...w).multiplyScalar(M))
      const pts = [cam.position.clone(), ...via, c.pos.clone()]
      // Plan route on the floor plane; height rides separately.
      const flat = pts.map((p) => new THREE.Vector3(p.x, 0, p.z))
      let acc = 0
      const lens = [0]
      for (let k = 1; k < flat.length; k++) { acc += flat[k]!.distanceTo(flat[k - 1]!) + Math.abs(pts[k]!.y - pts[k - 1]!.y) * 0.5; lens.push(acc) }
      mv.ss = lens.map((l) => (acc > 0 ? l / acc : 1))
      mv.hs = pts.map((p) => p.y)
      mv.xz = acc > 1e-6 ? new THREE.CatmullRomCurve3(flat, false, 'centripetal') : null
      const metres = acc / M
      // A crane shot whenever the route leaves the rooftops (to/from the map, or Foifi ↔ Technopark).
      mv.crane = from === 'map' || c.space === 'map' || from === 'city' || c.space === 'city' || pts.some((p) => p.y > (FLOOR + 12) * M)
      mv.walk = !mv.reveal && !mv.crane && (pts.length > 2 || metres > 8)
      mv.curtain = !first && !STILL && slides[index]?.transition === 'curtain'
      mv.dur = first || STILL ? 0 : mv.curtain ? CURTAIN : mv.reveal ? c.enter!.seconds : moveDuration(metres, mv.crane)
      mv.fromLook.copy(first ? c.target : look)
      mv.fromFov = first ? c.fov : cam.fov
      mv.t0 = now
      mv.name = name
      mv.settled = false
      // Draw where we are and where we are going; a crane shot passes over everything.
      if (mv.crane) showVenues(true, true, true)
      else showSpaces(from, c.space)
      setContinuous(name === 'lanyards' || name === 'badges' || name === 'foyer')
    }

    const t = mv.dur > 0 ? Math.min(1, (now - mv.t0) / mv.dur) : 1
    if (t < 1) keepAwake(120)
    else if (!mv.settled) { mv.settled = true; showSpaces(c.space) }
    // Curtain: black by a third of the way, the cut at half, lifted by the end.
    if (curtainEl.current) curtainEl.current.style.opacity = mv.curtain && t < 1 ? String(t < 0.5 ? smooth(0, 0.35, t) : 1 - smooth(0.6, 1, t)) : '0'
    if (mv.curtain && t >= 0.5 && !mv.settled) { mv.settled = true; showSpaces(c.space) }
    if (t >= 1 || !mv.xz || (mv.curtain && t >= 0.5)) {
      cam.position.copy(c.pos)
      look.copy(c.target)
      cam.fov = c.fov
    } else if (mv.curtain) {
      // Behind the curtain's first half the camera holds still.
    } else {
      const e = sine(t)
      mv.xz.getPointAt(e, tmp.a)
      cam.position.set(tmp.a.x, heightAt(mv, e), tmp.a.z)
      if (mv.reveal && c.enter?.follow) {
        // Following someone: look down the route ahead of us, then turn to the subject.
        mv.xz.getPointAt(Math.min(1, e + 0.12), tmp.b)
        if (tmp.b.distanceToSquared(tmp.a) < 1e-6) tmp.b.copy(c.target)
        tmp.walkLook.set(tmp.b.x, cam.position.y - 0.05 * M, tmp.b.z)
        tmp.b.lerpVectors(mv.fromLook, tmp.walkLook, smooth(0, 0.2, e))
        look.lerpVectors(tmp.b, c.target, smooth(0.7, 1, e))
      } else if (mv.reveal) {
        // Keep watching what we came out of, then flip round to the subject.
        const [t0, t1] = c.enter!.turn
        if (c.enter!.watch) {
          // Find someone first, keep them in view, then turn to the subject.
          tmp.b.lerpVectors(mv.fromLook, c.enter!.watch, smooth(0, Math.min(0.25, t0), e))
          look.lerpVectors(tmp.b, c.target, smooth(t0, t1, e))
        } else look.lerpVectors(mv.fromLook, c.target, smooth(t0, t1, e))
      } else if (mv.walk) {
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
    // Arriving at the birds-eye view keeps the roofs on: it is the outside we came to see.
    cam.layers.mask = name === 'map' && t >= 1 ? MASK.map : mv.crane && above && name !== 'aerial' && name !== 'shuttle' ? MASK.travel : MASK.normal
  })
  return null
}

export function Stage() {
  useEffect(() => {
    setHoldPolicy((from, to) => moveSeconds(cueOf(from), cueOf(to), window.innerWidth / window.innerHeight, !FORCED && !STILL && slides[to]?.transition === 'curtain') * HOLD * 1000)
    return () => setHoldPolicy(null)
  }, [])
  return (
    <>
    <Canvas
      dpr={[1, 1.5]}
      frameloop="demand"
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 20], fov: 35, near: 0.1, far: 1400 }}
      flat
      onCreated={({ gl }) => { gl.localClippingEnabled = true }}
    >
      <color attach="background" args={[GROUNDS.dark.bg]} />
      <Scene />
    </Canvas>
    <div ref={(el) => { curtainEl.current = el }} style={{ position: 'fixed', inset: 0, background: GROUNDS.dark.bg, opacity: 0, pointerEvents: 'none' }} />
    </>
  )
}
