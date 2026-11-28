// The home page is one scroll-driven journey. Positions are measured in
// "units": one unit is one viewport height of scrolling.
//
//   0 ─ mushroom ─ threads unravel ─ dive ─ pull back out over the whole network ─ rest ─ into the mushroom (the menu opens)

/** mushroom → unravel → dive */
export const A_LEN = 2.4
/** pulling back out of the dive to see the whole network */
export const T = 0.7
/** resting on the network */
export const HOLD = 0.4
/** gliding into the glass mushroom, which is the way into the site */
export const ZOOM = 0.8

export interface Timeline {
  /** where the pull back out begins */
  endStart: number
  /** where the glide into the mushroom begins */
  doorStart: number
  total: number
}

export function makeTimeline(): Timeline {
  const endStart = A_LEN
  const doorStart = endStart + T + HOLD
  return { endStart, doorStart, total: doorStart + ZOOM }
}

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1)
const smooth = (t: number) => t * t * (3 - 2 * t)

/** 0 during the journey, easing to 1 as the camera settles over the whole network */
export function closingAt(tl: Timeline, u: number) {
  return smooth(clamp01((u - tl.endStart) / T))
}

/** 0 → 1 over the glide into the mushroom (linear: ease it where it's used) */
export function doorAt(tl: Timeline, u: number) {
  return clamp01((u - tl.doorStart) / ZOOM)
}

/** fade in over [a, a+f], hold, fade out over [b-f, b] */
export function fadeWindow(u: number, a: number, b: number, f = 0.18) {
  return clamp01((u - a) / f) * clamp01((b - u) / f)
}
