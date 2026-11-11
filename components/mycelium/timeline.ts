// The home page is one scroll-driven journey. Positions are measured in
// "units" — one unit is one viewport height of scrolling.
//
//   0 ─ mushroom ─ threads unravel ─ dive ─▶ portal ─ project 1 ─ portal ─ project 2 … ─ portal ─ mushroom again
//
// Scenes: -1 = the 3D world, 0..n-1 = projects, n = the 3D world again.

/** mushroom → unravel → dive */
export const A_LEN = 2.4
/** a portal opening from one scene into the next */
export const T = 0.9
/** resting on a project */
export const H = 0.8
/** resting on the final scene */
export const END_HOLD = 1.2

export const STEP = T + H

export interface Timeline {
  count: number
  /** where the first portal starts to open */
  portalStart: number
  /** where the last portal (back to the mushroom) starts to open */
  endStart: number
  total: number
}

export function makeTimeline(count: number): Timeline {
  const portalStart = A_LEN - 0.3
  const endStart = portalStart + count * STEP
  return { count, portalStart, endStart, total: endStart + T + END_HOLD }
}

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1)

/** slow drift while a scene is on screen, then a rush as we fly into it */
function zoomAt(age: number) {
  if (age < T) {
    const t = age / T
    return 1.25 - 0.25 * (1 - Math.pow(1 - t, 3))
  }
  if (age < STEP) return 1 + 0.06 * ((age - T) / H)
  const t = clamp01((age - STEP) / T)
  return 1.06 + 2.2 * t * t
}

export interface PortalState {
  /** scene being revealed (the one before it is seg - 1); -1 = no portal yet */
  seg: number
  /** how far the portal has opened, 0..1 */
  mix: number
  zoomA: number
  zoomB: number
}

export function samplePortal(tl: Timeline, u: number): PortalState {
  const q = u - tl.portalStart
  if (q < 0) return { seg: -1, mix: 0, zoomA: 1, zoomB: 1 }
  const seg = Math.min(Math.floor(q / STEP), tl.count)
  const local = q - seg * STEP
  return {
    seg,
    mix: clamp01(local / T),
    zoomA: zoomAt(local + STEP),
    zoomB: zoomAt(local),
  }
}

/** 0..1 visibility of project i's caption */
export function projectOpacity(tl: Timeline, i: number, u: number) {
  const { seg, mix } = samplePortal(tl, u)
  if (seg === i) return clamp01((mix - 0.7) / 0.3)
  if (seg === i + 1) return clamp01(1 - mix / 0.2)
  return 0
}

/** fade in over [a, a+f], hold, fade out over [b-f, b] */
export function fadeWindow(u: number, a: number, b: number, f = 0.18) {
  return clamp01((u - a) / f) * clamp01((b - u) / f)
}
