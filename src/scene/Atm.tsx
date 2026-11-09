import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useDeck } from '../engine/store'
import { STILL } from '../engine/params'
import { revealedAt } from '../engine/frame'
import { slides } from '../content/slides'
import { VISUALS } from '../content/visuals'
import type { Visual } from '../engine/types'
import { ATM, foifi, M, SURFACES as S } from './venue'
import { atmKeypad, atmSign, franc100, zurichCard } from './textures'

/**
 * A free-standing cash machine in Foifi, where the AI-pressure screens play.
 * The live frame is its screen. Its card and cash follow the slides:
 *   before the ATM slides   the card waits in front of the slot
 *   `step: 'insert'`        the card slides in
 *   the screens after it    the card is inside
 *   `step: 'dispense'`      the card comes back out, then the cash
 *   after the ATM slides    card and cash stay out
 * Local frame: origin on the floor at the machine's centre, +z out of the
 * fascia, y up. Built once; navigation only moves two groups.
 */

const W = 0.78
const H = 1.78
const FRONT = ATM.depth / 2
const SLOT = { x: 0.3, y: 1.19 } // card slot, right of the keypad's top
const DISPENSER = { y: 0.82 } // cash slot, under the keypad
const CARD = { w: 0.054, l: 0.0856 }

/** Slide index → the ATM visual on it, if any (computed once). */
const atmAt = slides.map((s) => {
  const v = (VISUALS as Record<string, Visual>)[s.steps[0]!]
  return v?.kind === 'atm' ? v : null
})
const first = atmAt.findIndex(Boolean)
const last = atmAt.length - 1 - [...atmAt].reverse().findIndex(Boolean)

const ease = (x: number) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t) }

export function Atm({ frame }: { frame: THREE.Material }) {
  const body = useMemo(() => new THREE.MeshStandardMaterial({ color: S.booth, roughness: 0.5, metalness: 0.3 }), [])
  const fascia = useMemo(() => new THREE.MeshStandardMaterial({ color: S.panel, roughness: 0.4, metalness: 0.5 }), [])
  const dark = useMemo(() => new THREE.MeshStandardMaterial({ color: S.ink, roughness: 0.3 }), [])
  const led = useMemo(() => new THREE.MeshBasicMaterial({ color: S.uiGreen, toneMapped: false }), [])
  const sign = useMemo(atmSign, [])
  const keypad = useMemo(atmKeypad, [])
  const cardTex = useMemo(zurichCard, [])
  const note = useMemo(franc100, [])

  const card = useRef<THREE.Group>(null)
  const cash = useRef<THREE.Group>(null)

  useFrame(() => {
    const index = useDeck.getState().index
    // In step with the slide's draw-in, which starts once the camera has turned to the machine.
    const t = STILL ? 99 : (performance.now() - revealedAt()) / 1000
    const v = atmAt[index]
    // Card: 0 = held in front of the slot, 1 = inside. Cash: 0 = inside, 1 = out.
    let c = 0
    let m = 0
    if (first < 0 || index < first) { c = 0; m = 0 }
    else if (index > last) { c = 0; m = 1 }
    else if (v?.step === 'insert') c = ease((t - 0.9) / 1.2)
    else if (v?.step === 'dispense') { c = 1 - ease((t - 0.6) / 1.0); m = ease((t - 1.9) / 1.4) }
    else c = 1
    if (card.current) {
      card.current.position.z = FRONT + 0.11 - c * 0.15
      card.current.visible = c < 0.999
    }
    if (cash.current) {
      cash.current.position.z = FRONT - 0.07 + m * 0.15
      cash.current.visible = m > 0.001
    }
  })

  const sw = ATM.screen.width
  const sh = (sw * 9) / 16
  const [px, py, pz] = foifi(ATM.x, 0, ATM.z)
  return (
    <group position={[px, py, pz]} rotation-y={-Math.PI / 2}>
      {/* Body and the lighter fascia. */}
      <mesh position={[0, H / 2, 0]} material={body}><boxGeometry args={[W, H, ATM.depth]} /></mesh>
      <mesh position={[0, 1.1, FRONT + 0.01]} material={fascia}><boxGeometry args={[W - 0.08, 1.05, 0.02]} /></mesh>
      {/* Lit header sign. */}
      <mesh position={[0, H - 0.1, FRONT + 0.012]}>
        <planeGeometry args={[W - 0.1, 0.13]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      {/* Hood and the screen, tilted back a little; soft keys either side. */}
      <mesh position={[0, ATM.screen.y + sh / 2 + 0.085, FRONT + 0.035]} material={body}><boxGeometry args={[W - 0.06, 0.025, 0.07]} /></mesh>
      <group position={[0, ATM.screen.y, FRONT + 0.055]} rotation-x={-ATM.screen.tilt}>
        <mesh position-z={-0.004} material={dark}><boxGeometry args={[sw + 0.05, sh + 0.05, 0.01]} /></mesh>
        {/* 6 mm proud of the bezel: never coplanar. */}
        <mesh position-z={0.006} material={frame}><planeGeometry args={[sw, sh]} /></mesh>
        {[-1, 1].flatMap((side) => [0.055, -0.055].map((dy) => (
          <mesh key={`${side}${dy}`} position={[side * (sw / 2 + 0.05), dy, 0.006]} material={fascia}>
            <boxGeometry args={[0.035, 0.03, 0.02]} />
          </mesh>
        )))}
      </group>
      {/* Card slot with its green light. */}
      <mesh position={[SLOT.x, SLOT.y, FRONT + 0.03]} material={dark}><boxGeometry args={[0.08, 0.03, 0.04]} /></mesh>
      <mesh position={[SLOT.x, SLOT.y + 0.03, FRONT + 0.051]} material={led}><planeGeometry args={[0.08, 0.008]} /></mesh>
      {/* Keypad shelf, sloped toward the user. */}
      <group position={[-0.04, 1.08, FRONT + 0.08]} rotation-x={-1.0}>
        <mesh material={fascia}><boxGeometry args={[0.36, 0.26, 0.04]} /></mesh>
        <mesh position-z={0.021}>
          <planeGeometry args={[0.3, 0.22]} />
          <meshStandardMaterial map={keypad} roughness={0.5} />
        </mesh>
      </group>
      {/* Cash slot, with its lip. */}
      <mesh position={[0, DISPENSER.y, FRONT + 0.03]} material={dark}><boxGeometry args={[0.24, 0.035, 0.05]} /></mesh>
      {/* The card. */}
      <group ref={card} position={[SLOT.x, SLOT.y, FRONT + 0.11]}>
        <mesh rotation-x={-Math.PI / 2}>
          <planeGeometry args={[CARD.w, CARD.l]} />
          <meshStandardMaterial map={cardTex} roughness={0.4} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* The cash: a few CHF 100 notes, fanned slightly. */}
      <group ref={cash} position={[0, DISPENSER.y + 0.004, FRONT - 0.07]} rotation-x={0.35}>
        {[0, 1, 2, 3, 4].map((k) => (
          <mesh key={k} position={[(k - 2) * 0.006, k * 0.002, k * 0.006]} rotation={[-Math.PI / 2, 0, (k - 2) * 0.035]}>
            <planeGeometry args={[0.15, 0.074]} />
            <meshStandardMaterial map={note} roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
      <pointLight position={[0, 1.9, FRONT + 0.6]} color={S.lamp} intensity={0.5} decay={0} distance={2.5 * M} />
    </group>
  )
}
