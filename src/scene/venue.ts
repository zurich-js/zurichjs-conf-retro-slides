import { FRAME } from '../brand/tokens'
import type { CameraCue } from '../engine/types'

/**
 * The venue, measured: Technopark Zürich Auditorium (318 m² per the fact
 * sheet). Everything else is estimated from the 2026 conference photos, using
 * the podium (~1.15 m), chairs (seat ~0.46 m) and people as rulers.
 *
 * The set is authored in METRES. One transform (`M`) maps metres to world
 * units, so the frame plane keeps its 16-unit width.
 *
 * Axes: origin = centre of the projected image on the screen plane. +x is
 * audience-right, +y is up, +z points from the screen toward the audience.
 */

/** The frame plane in world units: 16 wide, at the frame's aspect. */
export const SCREEN = { width: 16, height: 16 * (FRAME.height / FRAME.width) }

/** The projected image on the main screen, in metres. */
export const IMAGE = { width: 6, height: 6 * (FRAME.height / FRAME.width) }

/** World units per metre. */
export const M = SCREEN.width / IMAGE.width

/** Bottom edge of the projected image above the hall floor. */
const IMAGE_BOTTOM = 2.4

/** Hall floor height (the projected image's centre is y = 0). */
export const FLOOR = -(IMAGE_BOTTOM + IMAGE.height / 2)

/** 18 m × 17.7 m ≈ 318 m². The roof ridge runs front to back along x = 0. */
export const HALL = {
  width: 18,
  depth: 17.7,
  /** Inner face of the front (screen) wall. */
  front: -0.35,
  eave: 6.6,
  ridge: 9.6,
} as const
export const HALL_BACK = HALL.front + HALL.depth

export const STAGE = { width: 10.4, depth: 4.2, height: 0.45 } as const
export const STAGE_TOP = FLOOR + STAGE.height
export const STAGE_FRONT = HALL.front + STAGE.depth

/** The wooden step along the back of the stage, under the screen. */
export const BENCH = { width: 9.6, depth: 0.45, height: 0.45 } as const

/** The white projection surface, larger than the image it carries. */
export const SURFACE = { width: 7.2, bottom: FLOOR + 1.05, top: FLOOR + 6.3 } as const

/** Side screens either side of the curtains. Same slide, smaller. */
export const SIDE_SCREEN = { x: 6.9, y: FLOOR + 4.0, width: 3.0, height: 2.4, image: 2.8 } as const

/** The control booth: raised, behind the back wall, glazed toward the stage. */
export const BOOTH = {
  floor: FLOOR + 3.3,
  width: 9,
  depth: 3.4,
  wall: 0.3,
  window: { width: 8.4, sill: FLOOR + 4.15, top: FLOOR + 6.1 },
} as const

/**
 * The community roll-up banner, on the hall floor at the front-right corner,
 * angled toward the seats. The art is 1:2, so the panel is 1 m × 2 m.
 */
export const ROLLUP = { width: 1.0, height: 2.0, x: 6.9, z: 5.0, yaw: -0.6 } as const

/**
 * The foyer: the concrete hallway straight through the hall's two back doors
 * (210 m² per the fact sheet: 18 m × 11.7 m). Registration lives here. The
 * booth sits above its front part, so the ceiling is low with deep beams.
 */
export const FOYER = {
  width: 18,
  depth: 11.7,
  height: 3.2,
  start: HALL_BACK + BOOTH.wall,
} as const

/** The two double doors in the hall's back wall, propped open into the foyer. */
export const DOORS = { x: 5.5, width: 2.0, height: 2.6 } as const

/** The curved pop-up backdrop beside the left doors, angled toward the queue. */
export const BACKDROP = { arc: 3.1, height: 2.3, radius: 3.2, x: -7.6, z: FOYER.start + 2.6, yaw: 0.6 } as const

/** Registration: the check-in counter along the wall, queue in front. */
export const CHECKIN = { x0: -4.0, x1: 2.2, z: FOYER.start + 1.05, depth: 0.7, height: 1.05 } as const

/** The volunteer merch table against the right wall. */
export const MERCH = { x: 7.9, z: FOYER.start + 3.6, length: 2.0, depth: 0.8, height: 0.78 } as const

/**
 * The atrium beyond the foyer: Technopark's open hall, ground floor plus three
 * gallery levels around a central void, glass lift tower at the far end.
 * Sponsor booths and cocktail tables on the ground floor. Estimated from photos.
 */
export const ATRIUM = {
  start: FOYER.start + FOYER.depth,
  length: 32,
  void: 14,
  gallery: 4.5,
  storey: 4.2,
  levels: 3,
} as const
export const ATRIUM_HALF = ATRIUM.void / 2 + ATRIUM.gallery
export const ATRIUM_TOP = FLOOR + ATRIUM.storey * (ATRIUM.levels + 1)

/** Physical surfaces. Not brand colours: these are what the room is made of. */
export const SURFACES = {
  floor: '#3a3633',
  floorJoint: '#2a2725',
  wood: '#b98a52',
  woodDark: '#8a6235',
  woodSeam: '#6e4c28',
  post: '#2b2420',
  panel: '#8d8e90',
  panelSeam: '#6a6b6d',
  ceiling: '#6b4a2a',
  steel: '#1d1e20',
  duct: '#8c9196',
  carpet: '#4a4c4e',
  tape: '#d9dadb',
  skirt: '#141414',
  screen: '#e8e8e6',
  curtain: '#2a2c33',
  foam: '#f4f4f2',
  podium: '#f1f1ef',
  plastic: '#151515',
  chrome: '#c7c9cc',
  cushion: '#4b5058',
  desk: '#d6d3cc',
  mullion: '#b9b48e',
  booth: '#1c1c1e',
  glow: '#ffb35a',
  ink: '#111111',
  paper: '#f7f7f5',
  ui: '#0e1116',
  uiBlue: '#3b82f6',
  uiGreen: '#5bd16b',
  uiRed: '#ff4d4d',
  uiAmber: '#ffb020',
  bottleCap: '#e8742a',
  concrete: '#b9b7b2',
  fabricBack: '#2a2b30',
  daylight: '#e9eef2',
  lamp: '#fff4dc',
  cloth: '#efe7a8',
  runner: '#2f9bd8',
  belt: '#151515',
  doorWood: '#c58a4a',
  doorFrame: '#c9cbcc',
  mugBlue: '#6f9fb8',
  mugBlack: '#1b1b1c',
  mugYellow: '#e6dc8a',
  avatarSkin: '#b9a08c',
  avatarHair: '#2b2622',
  avatarTeeA: '#16171a',
  avatarTeeB: '#3a3d44',
  officeChair: '#222326',
  teamShirt: '#f3e39a',
  avatarPants: '#2a2d33',
  badgeOrange: '#ea561d',
  woodOrange: '#dfa03a',
  glassDark: '#1c2530',
  namespaceBlue: '#4b4fd6',
  namespaceTile: '#4247c6',
  agBlue: '#1838cc',
  agBlueDeep: '#0f2799',
  clothBlack: '#141416',
  hotSauce: '#c2461a',
  toteBlue: '#1f5fd6',
} as const

/** Light colours: warm stage wash, dim warm house, cool booth screens. */
export const LIGHTS = {
  wash: '#fff1de',
  houseSky: '#ffe2b8',
  houseGround: '#2a2420',
  booth: '#a9b8ff',
  foyer: '#fff6e8',
} as const

/**
 * Which room a cue is in. Rooms connect through portals (below); a cue change
 * flies the camera along the portal chain, never through a wall or slab.
 */
export type Space = 'hall' | 'booth' | 'foyer' | 'atrium' | 'map'

export interface CuePose {
  pos: readonly [number, number, number]
  target: readonly [number, number, number]
  fov: number
  /** Defaults to 'hall'. */
  space?: Space
}

/**
 * Camera cues in metres. `screen` is solved in the Stage renderer (the frame
 * exactly covers the viewport), so it is not listed here.
 */
export const CUES: Readonly<Record<Exclude<CameraCue, 'screen'>, CuePose>> = {
  /** Row 4, centre-right, tall seated eye height. Screen, podium, letters, rig. */
  stage: { pos: [0.8, FLOOR + 1.45, 9.4], target: [0, -0.6, 0], fov: 44 },
  /** Standing in the back-right corner: the whole hall. */
  room: { pos: [7.4, FLOOR + 2.6, 16.2], target: [-1.2, FLOOR + 2.4, 1.5], fov: 52 },
  /** Low on the stage floor, raking along the foam letters. */
  letters: { pos: [4.7, STAGE_TOP + 0.32, 2.7], target: [-1.2, STAGE_TOP + 0.5, 0.25], fov: 38 },
  /** Behind the podium, looking out at the seats and the booth window. */
  podium: { pos: [-4.8, STAGE_TOP + 1.7, 2.3], target: [-1.2, FLOOR + 2.4, 16], fov: 55 },
  /** Standing behind the two operators, looking down over the desk and through the glass. */
  booth: { pos: [0.4, BOOTH.floor + 1.85, HALL_BACK + 3.15], target: [0.1, FLOOR + 1.2, 6.5], fov: 60, space: 'booth' },
  /** Up in the trusses, past the numbered barn doors. */
  rig: { pos: [2.6, FLOOR + 7.4, 6.4], target: [-0.6, FLOOR + 0.8, 1.0], fov: 52 },
  /** Down the right-hand aisle, along the warm wood wall. */
  wall: { pos: [7.7, FLOOR + 1.7, 15.5], target: [5.2, FLOOR + 3.0, 2.0], fov: 46 },
  /** In the foyer: check-in, the doors, the backdrop. A cut from any hall cue. */
  /** Close on the check-in counter: badges by role, lanyards. */
  badges: { pos: [-2.75, FLOOR + 1.8, FOYER.start + 1.95], target: [-2.8, FLOOR + 1.05, FOYER.start + 1.1], fov: 40, space: 'foyer' },
  /**
   * The whole venue as a cutaway from above: roofs and ceilings are hidden
   * (layer `cutaway`) and each space is labelled (layer `map`). Its own space,
   * so arriving or leaving is always a cut.
   */
  map: { pos: [-40, FLOOR + 50, 4], target: [0, FLOOR, 29], fov: 42, space: 'map' },
  /** From the bridge above the atrium entrance, down the hall to the lift tower. */
  atrium: { pos: [0.5, FLOOR + 9.0, ATRIUM.start + 0.8], target: [0, FLOOR + 1.2, ATRIUM.start + 21], fov: 58, space: 'atrium' },
  /** Ground level among the cocktail tables, facing the AG Grid booth. */
  booths: { pos: [-2.6, FLOOR + 1.75, ATRIUM.start + 11.5], target: [-8.8, FLOOR + 1.3, ATRIUM.start + 16.2], fov: 56, space: 'atrium' },
  foyer: { pos: [3.4, FLOOR + 1.7, FOYER.start + 8.2], target: [-2.6, FLOOR + 1.3, FOYER.start + 1.2], fov: 56, space: 'foyer' },
  /** Close on the volunteer merch table: mugs and totes. */
  merch: { pos: [6.95, FLOOR + 1.12, FOYER.start + 3.05], target: [7.8, FLOOR + 0.84, FOYER.start + 3.45], fov: 38, space: 'foyer' },
}

type P3 = readonly [number, number, number]

/**
 * How the rooms connect: waypoints (metres) the camera threads when it moves
 * from space `a` to space `b` (reversed for b → a). The map connects from
 * high above each room; roofs stay hidden while flying to or from it.
 */
/** An attendee's eye height: walking routes run at this height. */
export const EYE = 1.65

export const PORTALS: readonly { a: Space; b: Space; via: readonly P3[] }[] = [
  // Walk to the back of the hall, then up to and through the booth window.
  { a: 'hall', b: 'booth', via: [[0.6, FLOOR + EYE, HALL_BACK - 5], [0.3, FLOOR + 4.9, HALL_BACK - 1.6], [0.3, FLOOR + 4.9, HALL_BACK + 1.2]] },
  // Down the right-hand aisle and out through the double door.
  { a: 'hall', b: 'foyer', via: [[DOORS.x, FLOOR + EYE, HALL_BACK - 3], [DOORS.x, FLOOR + EYE, FOYER.start + 2]] },
  // Along the hallway and out into the atrium.
  { a: 'foyer', b: 'atrium', via: [[0, FLOOR + EYE, FOYER.start + FOYER.depth - 2.5], [0, FLOOR + EYE, ATRIUM.start + 3]] },
  // The overview: a crane shot out of each room and up over the building.
  { a: 'map', b: 'hall', via: [[-14, FLOOR + 30, 10], [-2, FLOOR + 6, 12]] },
  { a: 'map', b: 'foyer', via: [[-14, FLOOR + 26, FOYER.start + 6], [2, FLOOR + 2.4, FOYER.start + 7]] },
  { a: 'map', b: 'atrium', via: [[-12, FLOOR + 32, ATRIUM.start + 12], [0, FLOOR + 11, ATRIUM.start + 6]] },
]

/** Waypoints from one space to another: breadth-first over the portals. */
export function routeBetween(from: Space, to: Space): P3[] {
  if (from === to) return []
  const prev = new Map<Space, { space: Space; via: readonly P3[] }>()
  const queue: Space[] = [from]
  const seen = new Set<Space>([from])
  while (queue.length) {
    const s = queue.shift()!
    for (const p of PORTALS) {
      const step = p.a === s ? { next: p.b, via: p.via } : p.b === s ? { next: p.a, via: [...p.via].reverse() } : null
      if (!step || seen.has(step.next)) continue
      seen.add(step.next)
      prev.set(step.next, { space: s, via: step.via })
      queue.push(step.next)
    }
  }
  const out: P3[] = []
  for (let s = to; s !== from;) {
    const p = prev.get(s)
    if (!p) return []
    out.unshift(...p.via)
    s = p.space
  }
  return out
}
