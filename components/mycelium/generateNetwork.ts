// Procedural mycelium network.
// Hyphae grow from a few underground roots, wander, branch, and some
// turn upward — where they reach the surface (y = 0) a mushroom fruits.
// Every vertex carries a normalised "birth" (path length from its root),
// which the shaders use to animate growth and travelling signals.

export interface Fruit {
  position: [number, number, number]
  birth: number
  scale: number
  rotation: number
}

export interface Network {
  /** LineSegments positions (pairs of xyz) */
  positions: Float32Array
  births: Float32Array
  depths: Float32Array
  /** Sparse glowing nodes along the network */
  nodePositions: Float32Array
  nodeBirths: Float32Array
  nodeDepths: Float32Array
  fruits: Fruit[]
}

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type V3 = [number, number, number]

interface Tip {
  pos: V3
  dir: V3
  birth: number
  depth: number
  life: number
  upward: boolean
}

const MAX_DEPTH = 7
const STEP = 0.16
const SURFACE = 0
const FLOOR = -7.5
const X_LIMIT = 11
const Z_MIN = -6
const Z_MAX = 3

function normalize(v: V3): V3 {
  const l = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / l, v[1] / l, v[2] / l]
}

export function generateNetwork({
  seed = 11,
  maxSegments = 9000,
  maxFruits = 9,
  origin,
}: {
  seed?: number
  maxSegments?: number
  maxFruits?: number
  /** grow the whole network out of this one point */
  origin?: V3
} = {}): Network {
  const rng = mulberry32(seed)
  const r = (min: number, max: number) => min + rng() * (max - min)

  const segPos: number[] = []
  const segBirth: number[] = []
  const segDepth: number[] = []
  const nodePos: number[] = []
  const nodeBirth: number[] = []
  const nodeDepth: number[] = []
  const fruits: Fruit[] = []

  const queue: Tip[] = []

  if (origin) {
    // everything unravels from a single point (the base of the mushroom)
    const arms = 12
    for (let k = 0; k < arms; k++) {
      const a = (k / arms) * Math.PI * 2 + r(-0.25, 0.25)
      queue.push({
        pos: [...origin],
        dir: normalize([Math.cos(a), r(-0.9, -0.3), Math.sin(a) * 0.6]),
        birth: r(0, 0.3),
        depth: 0,
        life: Math.floor(r(140, 220)),
        upward: false,
      })
    }
  } else {
    // a few roots spread underground
    const rootCount = 6
    for (let i = 0; i < rootCount; i++) {
      const x = ((i + 0.5) / rootCount - 0.5) * 14 + r(-1, 1)
      const pos: V3 = [x, r(-4.5, -2.5), r(-2.5, 1)]
      const birthOffset = r(0, 1.5)
      const arms = 3 + Math.floor(rng() * 3)
      for (let k = 0; k < arms; k++) {
        const a = (k / arms) * Math.PI * 2 + r(-0.4, 0.4)
        queue.push({
          pos: [...pos],
          dir: normalize([Math.cos(a), r(-0.4, 0.4), Math.sin(a) * 0.6]),
          birth: birthOffset,
          depth: 0,
          life: Math.floor(r(70, 130)),
          upward: false,
        })
      }
    }
  }

  let head = 0
  let segCount = 0

  while (head < queue.length && segCount < maxSegments) {
    const tip = queue[head++]
    let { pos, dir, birth } = tip
    const { depth, upward } = tip
    const depthN = depth / MAX_DEPTH

    for (let s = 0; s < tip.life && segCount < maxSegments; s++) {
      // wander
      const jitter = 0.55 - depthN * 0.15
      let d: V3 = [
        dir[0] + (rng() - 0.5) * jitter,
        dir[1] + (rng() - 0.5) * jitter * 0.6,
        dir[2] + (rng() - 0.5) * jitter,
      ]
      if (upward) d[1] += 0.14

      // steer within the slab
      if (!upward && pos[1] > SURFACE - 0.5) d[1] -= 0.35
      if (pos[1] < FLOOR) d[1] += 0.3
      if (Math.abs(pos[0]) > X_LIMIT) d[0] -= Math.sign(pos[0]) * 0.3
      if (pos[2] < Z_MIN) d[2] += 0.3
      if (pos[2] > Z_MAX) d[2] -= 0.3
      d = normalize(d)

      const next: V3 = [pos[0] + d[0] * STEP, pos[1] + d[1] * STEP, pos[2] + d[2] * STEP]
      const nextBirth = birth + STEP

      segPos.push(...pos, ...next)
      segBirth.push(birth, nextBirth)
      segDepth.push(depthN, depthN)
      segCount++

      if (rng() < 0.3) {
        nodePos.push(...next)
        nodeBirth.push(nextBirth)
        nodeDepth.push(depthN)
      }

      pos = next
      dir = d
      birth = nextBirth

      // reached the surface → fruit
      if (upward && pos[1] >= SURFACE - 0.05) {
        const fx = pos[0]
        const fz = pos[2]
        const visible = Math.abs(fx) < 6.5 && fz > -2.5 && fz < 2.5
        const spaced = fruits.every(
          (f) => Math.hypot(f.position[0] - fx, f.position[2] - fz) > 1.3
        )
        if (visible && spaced && fruits.length < maxFruits) {
          fruits.push({
            position: [fx, SURFACE, fz],
            birth,
            scale: r(0.55, 1.15),
            rotation: r(0, Math.PI * 2),
          })
        }
        break
      }

      // branch
      const branchChance = 0.07 * (1 - depthN * 0.6)
      if (depth < MAX_DEPTH && rng() < branchChance) {
        const side: V3 = normalize([
          d[0] + (rng() - 0.5) * 2.4,
          d[1] + (rng() - 0.5) * 1.2,
          d[2] + (rng() - 0.5) * 2.4,
        ])
        const goUp = !upward && fruits.length < maxFruits && pos[1] > -5 && rng() < 0.3
        queue.push({
          pos: [...pos],
          dir: side,
          birth,
          depth: depth + 1,
          life: Math.floor(r(25, 80) * Math.pow(0.82, depth)) + (goUp ? 60 : 0),
          upward: goUp,
        })
      }
    }
  }

  // normalise births to 0..1
  let maxBirth = 0
  for (const b of segBirth) if (b > maxBirth) maxBirth = b
  const norm = (arr: number[]) => Float32Array.from(arr, (b) => b / maxBirth)
  for (const f of fruits) f.birth /= maxBirth

  return {
    positions: Float32Array.from(segPos),
    births: norm(segBirth),
    depths: Float32Array.from(segDepth),
    nodePositions: Float32Array.from(nodePos),
    nodeBirths: norm(nodeBirth),
    nodeDepths: Float32Array.from(nodeDepth),
    fruits,
  }
}
