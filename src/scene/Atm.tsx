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
import { atmKeypad, atmLabel, atmSign, franc100, zurichCard } from './textures'

/**
 * A Zürcher Kantonalbank (ZKB) cash machine in Foifi, where the AI-pressure screens play.
 * The live frame is its screen. Its card and cash follow the slides:
 *   before the ATM slides   the card waits in front of the slot
 *   `step: 'insert'`        the card slides in
 *   the screens after it    the card is inside
 *   `step: 'dispense'`      the card comes back out, then the cash
 *   after the ATM slides    card and cash stay out
 * Local frame: origin on the floor at the machine's centre, +z out of the
 * fascia, y up. Built once; navigation only moves two groups.
 */

// The pillar and its recessed cave (metres, local frame).
const W = 1.0
const H = 2.25
const FRONT = ATM.depth / 2
const FASCIA = FRONT - 0.13 // the cave's back wall
const CAVE = { x: 0.39, y0: 0.93, y1: 1.72 }
const SHELF = { y: 0.95, depth: 0.15 }
const SLOT = { x: 0.3, y: 1.27 } // card reader, right column
const DISPENSER = { y: 1.06 } // cash shutter, centred under the screen
const CARD = { w: 0.054, l: 0.0856 }
const NOTE = { w: 0.144, l: 0.07 } // CHF 100, 9th series

/** Slide index → the ATM visual on it, if any (computed once). */
const atmAt = slides.map((s) => {
  const v = (VISUALS as Record<string, Visual>)[s.steps[0]!]
  return v?.kind === 'atm' ? v : null
})
const first = atmAt.findIndex(Boolean)
const last = atmAt.length - 1 - [...atmAt].reverse().findIndex(Boolean)

const ease = (x: number) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t) }

export function Atm({ frame }: { frame: THREE.Material }) {
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: S.atmSteel, roughness: 0.38, metalness: 0.75 }), [])
  const fascia = useMemo(() => new THREE.MeshStandardMaterial({ color: S.atmFascia, roughness: 0.5, metalness: 0.2 }), [])
  const shade = useMemo(() => new THREE.MeshStandardMaterial({ color: S.atmShade, roughness: 0.5, metalness: 0.3 }), [])
  const dark = useMemo(() => new THREE.MeshStandardMaterial({ color: S.ink, roughness: 0.3 }), [])
  const green = useMemo(() => new THREE.MeshBasicMaterial({ color: S.atmGreen, toneMapped: false }), [])
  const ledStrip = useMemo(() => new THREE.MeshBasicMaterial({ color: S.lamp, toneMapped: false }), [])
  const sign = useMemo(atmSign, [])
  const keypad = useMemo(atmKeypad, [])
  const labels = useMemo(() => ({ geld: atmLabel('GELD'), karte: atmLabel('KARTE'), quittung: atmLabel('QUITTUNG') }), [])
  const cardTex = useMemo(zurichCard, [])
  const note = useMemo(franc100, [])

  const card = useRef<THREE.Group>(null)
  const cash = useRef<THREE.Group>(null)

  useFrame(() => {
    const index = useDeck.getState().index
    // In step with the slide's draw-in, which starts once the camera has turned to the machine.
    const t = STILL ? 99 : (performance.now() - revealedAt()) / 1000
    const v = atmAt[index]
    // Card: 0 = held in front of the reader, 1 = inside. Cash: 0 = inside, 1 = presented.
    let c = 0
    let m = 0
    if (first < 0 || index < first) { c = 0; m = 0 }
    else if (index > last) { c = 0; m = 1 }
    else if (v?.step === 'insert') c = ease((t - 0.9) / 1.2)
    else if (v?.step === 'dispense') { c = 1 - ease((t - 0.6) / 1.0); m = ease((t - 1.9) / 1.4) }
    else c = 1
    if (card.current) {
      card.current.position.z = FASCIA + 0.13 - c * 0.13
      card.current.visible = c < 0.999
    }
    if (cash.current) {
      cash.current.position.z = FASCIA + 0.0 + m * 0.11
      cash.current.visible = m > 0.001
    }
  })

  const sw = ATM.screen.width
  const sh = (sw * 9) / 16
  const caveH = CAVE.y1 - CAVE.y0
  const [px, py, pz] = foifi(ATM.x, 0, ATM.z)
  const label = (map: THREE.Texture, x: number, y: number, w: number) => (
    <mesh position={[x, y, FASCIA + 0.006]}>
      <planeGeometry args={[w, w * (48 / 256)]} />
      <meshBasicMaterial map={map} toneMapped={false} />
    </mesh>
  )
  return (
    <group position={[px, py, pz]} rotation-y={-Math.PI / 2}>
      {/* Brushed-steel pillar with a cave cut into its front: built as the frame round the opening. */}
      <mesh position={[0, CAVE.y0 / 2, 0]} material={steel}><boxGeometry args={[W, CAVE.y0, ATM.depth]} /></mesh>
      <mesh position={[0, (CAVE.y1 + H) / 2, 0]} material={steel}><boxGeometry args={[W, H - CAVE.y1, ATM.depth]} /></mesh>
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * (CAVE.x + (W / 2 - CAVE.x) / 2), (CAVE.y0 + CAVE.y1) / 2, 0]} material={steel}>
          <boxGeometry args={[W / 2 - CAVE.x, caveH, ATM.depth]} />
        </mesh>
      ))}
      {/* The cave: fascia at the back, shaded sides, hood sloping down and back with its LED strip and mirror dome. */}
      <mesh position={[0, (CAVE.y0 + CAVE.y1) / 2, FASCIA - 0.01]} material={fascia}><boxGeometry args={[CAVE.x * 2, caveH, 0.02]} /></mesh>
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * CAVE.x, (CAVE.y0 + CAVE.y1) / 2, (FASCIA + FRONT) / 2]} rotation-y={sx * Math.PI / 2} material={shade}>
          <planeGeometry args={[FRONT - FASCIA, caveH]} />
        </mesh>
      ))}
      <group position={[0, CAVE.y1 - 0.06, (FASCIA + FRONT) / 2]} rotation-x={0.55}>
        <mesh material={steel}><boxGeometry args={[CAVE.x * 2, 0.02, 0.17]} /></mesh>
        <mesh position={[0, -0.012, 0.04]} material={ledStrip}><boxGeometry args={[CAVE.x * 1.4, 0.004, 0.012]} /></mesh>
        <mesh position={[-0.26, -0.02, -0.02]} material={dark}><sphereGeometry args={[0.025, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
      </group>
      {/* ZKB blue band round the top of the pillar. */}
      <mesh position={[0, H - 0.09, 0]}>
        <boxGeometry args={[W + 0.004, 0.18, ATM.depth + 0.004]} />
        <meshStandardMaterial color={S.zkbBlue} roughness={0.5} />
      </mesh>
      {/* Lit header box above the cave. */}
      <mesh position={[0, CAVE.y1 + 0.13, FRONT + 0.012]} material={steel}><boxGeometry args={[0.66, 0.2, 0.024]} /></mesh>
      <mesh position={[0, CAVE.y1 + 0.13, FRONT + 0.025]}>
        <planeGeometry args={[0.62, 0.16]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      {/* Touch screen in a grey bezel, tilted back. */}
      <group position={[-0.04, ATM.screen.y, FASCIA + 0.05]} rotation-x={-ATM.screen.tilt}>
        <mesh position-z={-0.01} material={shade}><boxGeometry args={[sw + 0.06, sh + 0.06, 0.03]} /></mesh>
        {/* 1 cm proud of the bezel: never coplanar. */}
        <mesh position-z={0.01} material={frame}><planeGeometry args={[sw, sh]} /></mesh>
      </group>
      {/* Right column: receipt slot, card reader with its green throat, anti-skim pad; labels above each. */}
      {label(labels.quittung, SLOT.x, 1.5, 0.11)}
      <mesh position={[SLOT.x, 1.45, FASCIA + 0.008]} material={dark}><boxGeometry args={[0.09, 0.012, 0.016]} /></mesh>
      {label(labels.karte, SLOT.x, SLOT.y + 0.05, 0.09)}
      <mesh position={[SLOT.x, SLOT.y, FASCIA + 0.02]} material={dark}><boxGeometry args={[0.075, 0.045, 0.04]} /></mesh>
      <mesh position={[SLOT.x, SLOT.y, FASCIA + 0.041]} material={green}><planeGeometry args={[0.06, 0.006]} /></mesh>
      <mesh position={[SLOT.x, SLOT.y - 0.12, FASCIA + 0.01]} material={shade}><boxGeometry args={[0.08, 0.1, 0.02]} /></mesh>
      {/* Cash shutter centred under the screen, its label above. */}
      {label(labels.geld, -0.04, DISPENSER.y + 0.045, 0.08)}
      <mesh position={[-0.04, DISPENSER.y, FASCIA + 0.015]} material={dark}><boxGeometry args={[0.28, 0.03, 0.03]} /></mesh>
      <mesh position={[-0.04, DISPENSER.y - 0.02, FASCIA + 0.03]} material={steel}><boxGeometry args={[0.3, 0.008, 0.035]} /></mesh>
      {/* The shelf, the PIN pad under its U-shaped privacy hood, the blue contactless sticker. */}
      <mesh position={[0, SHELF.y - 0.015, FASCIA + SHELF.depth / 2]} material={fascia}><boxGeometry args={[CAVE.x * 2, 0.03, SHELF.depth]} /></mesh>
      <group position={[0.06, SHELF.y + 0.002, FASCIA + 0.09]} rotation-x={-Math.PI / 2 + 0.14}>
        <mesh>
          <planeGeometry args={[0.15, 0.11]} />
          <meshStandardMaterial map={keypad} roughness={0.4} metalness={0.3} />
        </mesh>
      </group>
      <mesh position={[0.06, SHELF.y + 0.045, FASCIA + 0.025]} material={fascia}><boxGeometry args={[0.18, 0.09, 0.01]} /></mesh>
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[0.06 + sx * 0.09, SHELF.y + 0.03, FASCIA + 0.075]} material={fascia}><boxGeometry args={[0.01, 0.06, 0.11]} /></mesh>
      ))}
      <mesh position={[-0.2, SHELF.y + 0.001, FASCIA + 0.09]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.07, 0.05]} />
        <meshBasicMaterial color={S.atmContactless} />
      </mesh>
      {/* The card, held flat in front of the reader. */}
      <group ref={card} position={[SLOT.x, SLOT.y, FASCIA + 0.13]}>
        <mesh rotation-x={-Math.PI / 2}>
          <planeGeometry args={[CARD.w, CARD.l]} />
          <meshStandardMaterial map={cardTex} roughness={0.4} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* The cash: a stack of CHF 100 notes, presented out of the shutter, tilted up. */}
      <group ref={cash} position={[-0.04, DISPENSER.y + 0.004, FASCIA]} rotation-x={0.3}>
        {[0, 1, 2, 3, 4].map((k) => (
          <mesh key={k} position={[(k - 2) * 0.004, k * 0.0015, k * 0.004]} rotation={[-Math.PI / 2, 0, (k - 2) * 0.03]}>
            <planeGeometry args={[NOTE.w, NOTE.l]} />
            <meshStandardMaterial map={note} roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
      <pointLight position={[0, CAVE.y1 - 0.08, FRONT + 0.3]} color={S.lamp} intensity={0.45} decay={0} distance={2.2 * M} />
    </group>
  )
}
