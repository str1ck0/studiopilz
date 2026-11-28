/** the springy jiggle of the home-page mushroom, shared by the logo, menu words and project titles */
export const WOBBLE = {
  scaleX: [1, 1.12, 0.95, 1.03, 1],
  scaleY: [1, 0.84, 1.08, 0.98, 1],
  rotate: [0, -2, 1.5, -0.5, 0],
}

export const WOBBLE_TIMING = { duration: 0.7, ease: 'easeOut' } as const
