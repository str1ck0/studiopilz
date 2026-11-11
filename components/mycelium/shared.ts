import * as THREE from 'three'

/** how far idle cursor play can unravel the network before scrolling takes over */
export const MAX_INTERACT_GROWTH = 0.2
export const MUSHROOM_HEIGHT = 2.2
/** how far the top of the stalk swings per unit of bend */
export const BEND_REACH = 0.55

/** Mutable state shared between the DOM and the render loop (no re-renders). */
export interface SharedState {
  pointer: THREE.Vector2
  pointerWorld: THREE.Vector3
  lastPointerMove: number
  mouseStrength: number
  growth: number
  /** growth earned by moving the cursor around (0..MAX_INTERACT_GROWTH) */
  interact: number
  /** impulses waiting to be applied to the mushroom's springs */
  kickX: number
  kickZ: number
  kickSquash: number
  /** performance.now() of the last click — sends a pulse down the threads */
  burstAt: number
  /** the cap is being pulled */
  dragging: boolean
  dragStartX: number
  dragStartY: number
  /** current pose of the mushroom, so the threads inside it can follow */
  bendX: number
  bendZ: number
  stretch: number
  /** how far it has spun (radians) and how much the spin is flinging the cap outward */
  spin: number
  flare: number
  /** 0→1 as the mushroom pops up on arrival */
  pop: number
  reducedMotion: boolean
}

export function createSharedState(): SharedState {
  return {
    pointer: new THREE.Vector2(0, 0),
    pointerWorld: new THREE.Vector3(0, -100, 0),
    lastPointerMove: 0,
    mouseStrength: 0,
    growth: 0,
    interact: 0,
    kickX: 0,
    kickZ: 0,
    kickSquash: 0,
    burstAt: -1e9,
    dragging: false,
    dragStartX: 0,
    dragStartY: 0,
    bendX: 0,
    bendZ: 0,
    stretch: 1,
    spin: 0,
    flare: 0,
    pop: 0,
    reducedMotion: false,
  }
}

export interface Palette {
  thread: THREE.Color
  hot: THREE.Color
  opacity: number
  blending: THREE.Blending
  /** what the glass sees behind itself — matches the page background */
  backdrop: string
  halo: string
  haloStrength: number
}

export const PALETTES: Record<'dark' | 'light', Palette> = {
  dark: {
    thread: new THREE.Color('#f2e7d5'),
    hot: new THREE.Color('#ffb36b'),
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    backdrop: '#1a1a1a',
    halo: '#f2e7d5',
    haloStrength: 0.55,
  },
  light: {
    thread: new THREE.Color('#1a1a1a'),
    hot: new THREE.Color('#9a4a12'),
    opacity: 0.45,
    blending: THREE.NormalBlending,
    backdrop: '#f2e7d5',
    halo: '#ffffff',
    haloStrength: 0.8,
  },
}

/**
 * Where a point of the resting mushroom ends up once the stalk is bent and
 * stretched. The base stays put; the higher up, the further it swings.
 * The same maths runs in the thread shader (see bendStalk in MyceliumScene).
 */
export function bendPoint(
  x: number,
  y: number,
  z: number,
  bendX: number,
  bendZ: number,
  stretch: number,
  out: THREE.Vector3
) {
  const H = MUSHROOM_HEIGHT
  const k = y / H
  const k2 = k * k
  const bulge = 1 / Math.sqrt(stretch)
  const droop = (bendX * bendX + bendZ * bendZ) * H * 0.1
  return out.set(
    x * bulge + bendX * H * BEND_REACH * k2,
    y * stretch - droop * k2 - (x * bendX + z * bendZ) * 0.9 * k,
    z * bulge + bendZ * H * BEND_REACH * k2
  )
}
