'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { MENU_SHAPES, getSporeOverride, subscribeSpores, type MenuShape, type SporeForm } from '@/lib/spores'

/**
 * One cloud of spores for the whole site, never thrown away. They rest in the logo
 * and only come out for a few moments:
 *
 *   home   they stay in the logo: the glass mushroom has spores of its own, and the
 *          opening scene is busy enough
 *   work   drifting slowly behind the page (scrolling stirs them), never over the pictures
 *   shop   a slow spore-fall behind the page
 *   menu   set loose over it; they gather into a shape behind the word you reach for
 *          (all turning in 3D: a pyramid for home, a starfish for work, a shell spiral for
 *          the studio, a mushroom for the shop, a dove for contact), and the word you
 *          pick draws them in and absorbs them
 *
 * Whenever they're done they fly home into the logo and dissolve into it. Outside the
 * menu and the home page they always stay behind the page's content.
 */

type Shape = { pts: Float32Array; aspect: number | null; z?: Float32Array }
type Box = { x: number; y: number; w: number; h: number }

const LOGO_ASPECT = 618.45 / 381.69

// small seeded random, so the forms are the same every visit
const rng = (seed: number) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const TAU = Math.PI * 2

/**
 * The menu shapes, all in 3D, centred on the middle of a unit cube: grains mostly along
 * edges and rims, some over surfaces, so they read at a glance and turn convincingly.
 */
function menuShape(form: MenuShape, n: number): Shape {
  const r = rng(n + form.length * 131)
  const pts = new Float32Array(n * 2)
  const z = new Float32Array(n)
  const j = (s = 0.006) => (r() - 0.5) * s
  const put = (i: number, x: number, y: number, d: number) => {
    pts[i * 2] = 0.5 + x + j()
    pts[i * 2 + 1] = 0.5 + y + j()
    z[i] = d + j()
  }
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t

  if (form === 'pyramid') {
    // square-based: grains along its eight edges, a few on its sides
    const apex = [0, -0.42, 0]
    const base = [
      [-0.36, 0.3, -0.36],
      [0.36, 0.3, -0.36],
      [0.36, 0.3, 0.36],
      [-0.36, 0.3, 0.36],
    ]
    const edges = [...base.map((q) => [apex, q]), ...base.map((q, k) => [q, base[(k + 1) % 4]])]
    for (let i = 0; i < n; i++) {
      if (r() < 0.82) {
        const [a, b] = edges[Math.floor(r() * edges.length)]
        const t = r()
        put(i, lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t))
      } else {
        let u = r()
        let v = r()
        if (u + v > 1) {
          u = 1 - u
          v = 1 - v
        }
        const k = Math.floor(r() * 4)
        const [b0, b1] = [base[k], base[(k + 1) % 4]]
        const c = [0, 1, 2].map((d) => apex[d] + (b0[d] - apex[d]) * u + (b1[d] - apex[d]) * v)
        put(i, c[0], c[1], c[2])
      }
    }
  } else if (form === 'mushroom') {
    // drawn like the pyramid, as lines: a wide, low cap with lines running over it to a
    // rim that curls under a little, gills beneath, and a sturdy stem with a ring top and foot
    const R = 0.46
    const capH = 0.28
    const capBase = 0.0
    const profile = (rho: number) => capBase - capH * Math.pow(Math.max(1 - rho * rho, 0), 0.55) + 0.035 * Math.pow(rho, 8)
    const stem = (t: number) => lerp(0.1, 0.125, t * t)
    for (let i = 0; i < n; i++) {
      const k = r()
      if (k < 0.36) {
        // a line over the cap
        const az = Math.floor(r() * 10) * (TAU / 10)
        const rho = Math.sqrt(r())
        put(i, Math.cos(az) * rho * R, profile(rho), Math.sin(az) * rho * R)
      } else if (k < 0.54) {
        // the rim, and a ring part-way up
        const th = r() * TAU
        const rho = r() < 0.7 ? 1 : 0.62
        put(i, Math.cos(th) * rho * R, profile(rho), Math.sin(th) * rho * R)
      } else if (k < 0.64) {
        // gills underneath
        const g = Math.floor(r() * 12) * (TAU / 12)
        const rho = lerp(0.12 / R, 0.98, r())
        put(i, Math.cos(g) * rho * R, capBase + 0.03 - 0.01 * rho, Math.sin(g) * rho * R)
      } else if (k < 0.78) {
        // rings round the stem, top and foot
        const th = r() * TAU
        const t = r() < 0.5 ? 0 : 1
        put(i, Math.cos(th) * stem(t), lerp(capBase + 0.03, 0.4, t), Math.sin(th) * stem(t))
      } else {
        // lines down the stem
        const th = Math.floor(r() * 8) * (TAU / 8)
        const t = r()
        put(i, Math.cos(th) * stem(t), lerp(capBase + 0.03, 0.4, t), Math.sin(th) * stem(t))
      }
    }
  } else if (form === 'star') {
    // a starfish: five soft, rounded arms, puffed up in the middle
    const reach = (th: number) => 0.17 + 0.31 * Math.pow((1 + Math.cos(5 * (th + Math.PI / 2))) / 2, 1.6)
    for (let i = 0; i < n; i++) {
      const th = r() * TAU
      const edge = reach(th)
      if (r() < 0.5) {
        put(i, Math.cos(th) * edge, Math.sin(th) * edge, j(0.03))
      } else {
        const t = Math.sqrt(r())
        const puff = 0.1 * Math.sqrt(Math.max(1 - t * t, 0)) * (0.6 + 0.4 * (edge / 0.48))
        put(i, Math.cos(th) * edge * t, Math.sin(th) * edge * t, r() < 0.75 ? -puff : puff)
      }
    }
  } else if (form === 'spiral') {
    // a shell: three turns winding out and down, like a cone seen from above
    for (let i = 0; i < n; i++) {
      const t = Math.sqrt(r())
      const a = t * 3 * TAU
      const rad = 0.04 + t * 0.44 + j(0.01 + t * 0.035)
      put(i, Math.cos(a) * rad, Math.sin(a) * rad, 0.22 - t * 0.44)
    }
  } else {
    // a peace dove, facing right: a plump body, a small round head with a short beak,
    // a fanned tail, and wings swept high over its back. the wings are kept flat here, their
    // depth stored past ±1 (see WING), and raised in the frame loop
    for (let i = 0; i < n; i++) {
      const k = r()
      if (k < 0.42) {
        // a wing, as its feathers: the arm along the front, then long feathers fanning back
        // and out from it, each a little longer toward the tip, the tips rounded off
        const side = r() < 0.5 ? -1 : 1
        const q = r()
        let x: number
        let sp: number
        if (q < 0.16) {
          const t = r()
          x = lerp(0.08, 0.0, t)
          sp = t * 0.22
        } else {
          const f = Math.floor(r() * 11) / 10
          const t = r()
          const bx = lerp(0.08, 0.0, Math.min(f * 1.4, 1))
          const bs = Math.min(f * 1.4, 1) * 0.22
          const ang = lerp(-1.45, -0.25, f)
          const len = lerp(0.2, 0.3, Math.sin(f * Math.PI * 0.85))
          x = bx + Math.sin(ang) * len * t
          sp = bs + Math.cos(ang) * len * t
          x += (r() - 0.5) * 0.01
        }
        pts[i * 2] = 0.5 + x + j(0.004)
        pts[i * 2 + 1] = 0.5 + 0.0 + j(0.004)
        z[i] = side * (WING + Math.max(sp, 0) * 0.95)
        continue
      }
      if (k < 0.7) {
        // the body: a plump teardrop, fullest at the breast
        const u = r() * 2 - 1
        const th = r() * TAU
        const x = u * 0.22
        const fat = Math.sqrt(1 - u * u) * (1 + 0.25 * u)
        put(i, x, 0.06 + Math.cos(th) * fat * 0.095, Math.sin(th) * fat * 0.07)
      } else if (k < 0.78) {
        // the head, small and round, up at the front
        const u = r() * 2 - 1
        const th = r() * TAU
        const q = Math.sqrt(1 - u * u) * 0.058
        put(i, 0.25 + u * 0.058, -0.03 + Math.cos(th) * q, Math.sin(th) * q)
      } else if (k < 0.81) {
        // a short beak
        const t = r()
        put(i, 0.3 + t * 0.025, -0.022 + t * 0.006, j(0.008 * (1 - t)))
      } else {
        // the tail, fanned and rounded at its end
        const f = r() * 2 - 1
        const t = Math.sqrt(r())
        const len = 0.17 * (1 - 0.15 * f * f)
        put(i, -0.19 - t * len, 0.08 + t * 0.06, f * (0.012 + t * 0.06))
      }
    }
  }
  return { pts, aspect: null, z }
}

/** wing grains are stored this far out in depth, so the frame loop can find and flap them */
const WING = 1

/** how each shape turns: round its own axis (roll), round the vertical (yaw, or a sway), tipped toward you (tilt) */
const MOTION: Record<
  MenuShape,
  { roll: number; yaw: number; sway: number; tilt: number; yaw0?: number; scale?: number; lift?: number }
> = {
  pyramid: { roll: 0, yaw: 0.0005, sway: 0, tilt: 0.38 },
  star: { roll: 0.00015, yaw: 0.0006, sway: 0.65, tilt: 0.3 },
  spiral: { roll: 0, yaw: 0.0005, sway: 0, tilt: 0.6 },
  // smaller, and lifted so its stem ends at the word instead of spilling over what's below
  mushroom: { roll: 0, yaw: 0.0004, sway: 0, tilt: 0.32, scale: 0.8, lift: 0.2 },
  // seen three-quarter, swaying a little; drawn larger, since a bird fills less of its box
  // than a pyramid does
  dove: { roll: 0, yaw: 0.0006, sway: 0.2, tilt: 0.18, yaw0: -0.62, scale: 1.35 },
}

async function buildShape(form: SporeForm, n: number): Promise<Shape> {
  const r = rng(n + form.length * 31)
  if ((MENU_SHAPES as string[]).includes(form)) return menuShape(form as MenuShape, n)
  const pts = new Float32Array(n * 2)
  if (form === 'logo') {
    // every spore lands somewhere inside the letters
    const w = 360
    const h = Math.round(w / LOGO_ASPECT)
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const ctx = c.getContext('2d', { willReadFrequently: true })!
    const img = new Image()
    img.src = '/studiopilz_logo.svg'
    await img.decode()
    ctx.drawImage(img, 0, 0, w, h)
    const data = ctx.getImageData(0, 0, w, h).data
    const solid: number[] = []
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 90) solid.push(x, y)
    for (let i = 0; i < n && solid.length; i++) {
      const k = Math.floor(r() * (solid.length / 2)) * 2
      pts[i * 2] = (solid[k] + r() - 0.5) / w
      pts[i * 2 + 1] = (solid[k + 1] + r() - 0.5) / h
    }
    return { pts, aspect: LOGO_ASPECT }
  }
  // drift: anywhere on screen
  for (let i = 0; i < pts.length; i++) pts[i] = r()
  return { pts, aspect: null }
}

/** every spore lands somewhere inside the letters of a word on the page, as it's drawn */
function wordShape(el: Element, n: number): Shape {
  const r = rng(n + 7)
  const pts = new Float32Array(n * 2)
  const b = el.getBoundingClientRect()
  const cs = getComputedStyle(el)
  let text = (el.textContent || '').trim()
  if (cs.textTransform === 'lowercase') text = text.toLowerCase()
  if (cs.textTransform === 'uppercase') text = text.toUpperCase()
  const w = Math.max(Math.round(b.width), 1)
  const h = Math.max(Math.round(b.height), 1)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = cs.letterSpacing
  ctx.textBaseline = 'middle'
  ctx.fillText(text, parseFloat(cs.paddingLeft) || 0, h / 2)
  const data = ctx.getImageData(0, 0, w, h).data
  const solid: number[] = []
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (data[(y * w + x) * 4 + 3] > 120) solid.push(x, y)
  for (let i = 0; i < n; i++) {
    if (!solid.length) {
      pts[i * 2] = r()
      pts[i * 2 + 1] = r()
      continue
    }
    const k = Math.floor(r() * (solid.length / 2)) * 2
    pts[i * 2] = (solid[k] + r() * 2 - 1) / w
    pts[i * 2 + 1] = (solid[k + 1] + r() * 2 - 1) / h
  }
  return { pts, aspect: null }
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export default function Spores() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pathname = usePathname()
  const pathRef = useRef(pathname)
  const retargetRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    pathRef.current = pathname
    retargetRef.current?.()
  }, [pathname])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let W = window.innerWidth
    let H = window.innerHeight
    let dpr = 1
    const N = W < 768 ? 650 : 1100
    const x = new Float32Array(N)
    const y = new Float32Array(N)
    const sx = new Float32Array(N)
    const sy = new Float32Array(N)
    const cx = new Float32Array(N)
    const cy = new Float32Array(N)
    // where each spore belongs, as a fraction of the form's box (which may move)
    const ru = new Float32Array(N)
    const rv = new Float32Array(N)
    // and how deep, for the shapes that turn in 3D
    const rw = new Float32Array(N)
    const ox = new Float32Array(N)
    const oy = new Float32Array(N)
    const t0 = new Float32Array(N)
    const dur = new Float32Array(N)
    const seed = new Float32Array(N)
    const r = rng(42)
    for (let i = 0; i < N; i++) {
      x[i] = sx[i] = cx[i] = r() * W
      y[i] = sy[i] = cy[i] = r() * H
      ru[i] = x[i] / W
      rv[i] = y[i] / H
      seed[i] = r() * 1000
    }

    const shapes = new Map<SporeForm, Promise<Shape>>()
    const shape = (f: SporeForm) => {
      let s = shapes.get(f)
      if (!s) shapes.set(f, (s = buildShape(f, N)))
      return s
    }

    let form: SporeForm | null = null
    let anchor: Element | null = null
    let aspect: number | null = null
    let inMenu = false
    let token = 0
    let settleUntil = 0
    let fadeTimer = 0
    let raf = 0
    let mx = -1e4
    let my = -1e4
    let brush = false
    let lastScroll = window.scrollY
    let lastNow = performance.now()

    // the box a form fills right now; anchored forms follow their element
    const boxFor = (f: SporeForm | null, el: Element | null, a: number | null): Box => {
      const b = el?.getBoundingClientRect()
      if (!b || b.width === 0) return { x: W * 0.03, y: H * 0.05, w: W * 0.94, h: H * 0.9 }
      if (f && (MENU_SHAPES as string[]).includes(f)) {
        // every shape the same size, whatever the word's size, centred behind it
        const side = Math.min(Math.max(H * 0.34, 160), 330, W * 0.75)
        const lift = (MOTION[f as MenuShape].lift ?? 0) * side
        return { x: b.left + b.width / 2 - side / 2, y: b.top + b.height / 2 - side / 2 - lift, w: side, h: side }
      }
      if (!a) return { x: b.left, y: b.top, w: b.width, h: b.height }
      let fw = b.width
      let fh = b.height
      if (fw / fh > a) fw = fh * a
      else fh = fw / a
      // the logo sits at the left of its box, like the mark it stands in for
      return { x: b.left, y: b.top + (b.height - fh) / 2, w: fw, h: fh }
    }

    const setOpacity = (o: number) => {
      canvas.style.opacity = String(o)
    }

    /** what the spores should be doing right now */
    const decide = (): { f: SporeForm; el: Element | null } => {
      const o = getSporeOverride()
      if (o) return { f: o.form, el: o.anchor ? document.querySelector(o.anchor) : null }
      const path = pathRef.current
      if (path === '/work') return { f: 'drift', el: null }
      if (path === '/shop') return { f: 'fall', el: null }
      return { f: 'logo', el: document.querySelector('[data-spore-logo]') }
    }

    const retarget = async (snap = false) => {
      const { f: next, el } = decide()
      const run = ++token
      const s = next === 'word' && el ? wordShape(el, N) : await shape(next)
      if (run !== token) return
      const menu = !!getSporeOverride()
      const changed = next !== form || el !== anchor || menu !== inMenu
      const wasHidden = canvas.style.opacity === '0'
      form = next
      anchor = el
      aspect = s.aspect
      inMenu = menu
      // over the page only in the menu (whose words sit on a layer above them) and on the
      // home page, where they're part of the opening scene. everywhere else they stay
      // behind the text and pictures, even while flying home to the logo after a click
      canvas.style.zIndex = menu || pathRef.current === '/' ? '45' : '-1'

      const now = performance.now()
      // already out of sight and heading home: just go, nobody needs to see that
      const quiet = snap || reduced || (wasHidden && (next === 'logo' || !changed))
      let latest = now

      if (next !== 'fall') {
        const box = boxFor(next, el, aspect)
        // pair spores and targets top to bottom (loosely), so they flow rather than criss-cross
        const jitter = H * 0.08
        const from = Array.from({ length: N }, (_, i) => i).sort((a, b) => y[a] + (seed[a] % jitter) - (y[b] + (seed[b] % jitter)))
        const to = Array.from({ length: N }, (_, i) => i).sort(
          (a, b) => s.pts[a * 2 + 1] - s.pts[b * 2 + 1] + ((seed[a] % 100) - (seed[b] % 100)) * 0.0008,
        )
        for (let k = 0; k < N; k++) {
          const i = from[k]
          const j = to[k]
          ru[i] = s.pts[j * 2]
          rv[i] = s.pts[j * 2 + 1]
          rw[i] = s.z ? s.z[j] : 0
          const nx = box.x + ru[i] * box.w
          const ny = box.y + rv[i] * box.h
          sx[i] = x[i]
          sy[i] = y[i]
          if (quiet || !changed) {
            cx[i] = (sx[i] + nx) / 2
            cy[i] = (sy[i] + ny) / 2
            t0[i] = now
            dur[i] = quiet ? 0 : 500
          } else {
            // a curved path, bowed sideways like a thread finding its way
            const dx = nx - sx[i]
            const dy = ny - sy[i]
            const bow = (r() - 0.5) * 0.9
            cx[i] = (sx[i] + nx) / 2 - dy * bow
            cy[i] = (sy[i] + ny) / 2 + dx * bow - Math.abs(dx) * 0.1
            if (next === 'logo') {
              // gathering in: the far ones set off first, so they all arrive together
              const far = Math.min(Math.hypot(dx, dy) / Math.max(W, H), 1)
              t0[i] = now + (1 - far) * 300 + r() * 200
              dur[i] = 900 + r() * 500
            } else if (next === 'word') {
              // drawn in quickly, so the word fills as they arrive
              t0[i] = now + r() * 150
              dur[i] = 420 + r() * 380
            } else {
              t0[i] = now + (1 - rv[i]) * 300 + r() * 200
              dur[i] = 700 + r() * 600
            }
          }
          latest = Math.max(latest, t0[i] + dur[i])
        }
      }
      settleUntil = latest + 300

      // visible while they're out; once they've flown home, they dissolve into the logo
      window.clearTimeout(fadeTimer)
      if (next === 'logo') {
        if (quiet) setOpacity(0)
        else {
          setOpacity(1)
          fadeTimer = window.setTimeout(() => setOpacity(0), settleUntil - now)
        }
      } else {
        setOpacity(next === 'drift' ? (menu ? 0.85 : 0.5) : next === 'fall' ? 0.45 : 0.95)
      }
      if (!raf) raf = requestAnimationFrame(frame)
    }

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min((now - lastNow) / 16.7, 3)
      lastNow = now
      const dark = document.documentElement.classList.contains('dark')
      const falling = form === 'fall'
      const moving = now < settleUntil
      // while they travel, the last frames linger as thin threads; once settled, wipe clean
      if (moving && !falling && !reduced) {
        ctx.globalCompositeOperation = 'destination-out'
        ctx.fillStyle = 'rgba(0,0,0,0.22)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.globalCompositeOperation = 'source-over'
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }

      const box = falling ? null : boxFor(form, anchor, aspect)
      const amp = reduced ? 0 : form === 'drift' ? 16 : form && (MENU_SHAPES as string[]).includes(form) ? 1 : 0
      // a menu shape turns in 3D
      const mo = form && form in MOTION ? MOTION[form as MenuShape] : null
      const roll = mo && !reduced ? now * mo.roll : 0
      const yaw = (mo?.yaw0 ?? 0) + (!mo || reduced ? 0.5 : mo.sway ? Math.sin(now * mo.yaw) * mo.sway : now * mo.yaw)
      const cosR = Math.cos(roll)
      const sinR = Math.sin(roll)
      const cosY = Math.cos(yaw)
      const sinY = Math.sin(yaw)
      // the dove's wings, swept high over its back and beating gently
      const beat = 1.15 + (reduced ? 0 : Math.sin(now * 0.0035) * 0.3)
      const cosB = Math.cos(beat)
      const sinB = Math.sin(beat)
      const cosL = Math.cos(mo?.tilt ?? 0)
      const sinL = Math.sin(mo?.tilt ?? 0)
      // scrolling stirs loose spores, each by its own amount
      const scroll = window.scrollY
      const stir = form === 'drift' && !inMenu ? Math.max(-60, Math.min(60, scroll - lastScroll)) : 0
      lastScroll = scroll
      const R = 90
      const size = 1.5 * dpr
      const plain = dark ? 'rgb(196,87,59)' : 'rgb(154,59,27)'
      const bright = dark ? 'rgb(232,160,132)' : 'rgb(120,40,14)'

      for (let i = 0; i < N; i++) {
        const s = seed[i]
        let px: number
        let py: number
        if (falling) {
          // drifting down, swaying, and starting over at the top
          y[i] += (0.25 + (s % 1) * 0.55) * dt
          x[i] += Math.sin(now * 0.0007 + s) * 0.35 * dt
          if (y[i] > H + 10) {
            y[i] = -10
            x[i] = ((s * 7.31 + now * 0.01) % 1) * W
          }
          px = x[i]
          py = y[i]
        } else {
          const p = dur[i] === 0 ? 1 : Math.min(Math.max((now - t0[i]) / dur[i], 0), 1)
          const e = easeInOut(p)
          const u = 1 - e
          let u0 = ru[i]
          let v0 = rv[i]
          if (mo) {
            let ax = u0 - 0.5
            let ay = v0 - 0.5
            if (roll) [ax, ay] = [ax * cosR - ay * sinR, ax * sinR + ay * cosR]
            let az = rw[i]
            if (az >= WING || az <= -WING) {
              // a wing grain: hinge it up from the shoulder
              const out = Math.abs(az) - WING
              ay -= out * sinB
              az = Math.sign(az) * (0.05 + out * cosB)
            }
            const x1 = ax * cosY + az * sinY
            const z1 = -ax * sinY + az * cosY
            const y2 = ay * cosL - z1 * sinL
            const z2 = ay * sinL + z1 * cosL
            const persp = (1 / (1 + z2 * 0.35)) * (mo.scale ?? 1)
            u0 = 0.5 + x1 * persp
            v0 = 0.5 + y2 * persp
          }
          const tx = box!.x + u0 * box!.w
          const ty = box!.y + v0 * box!.h
          px = u * u * sx[i] + 2 * u * e * cx[i] + e * e * tx
          py = u * u * sy[i] + 2 * u * e * cy[i] + e * e * ty
          if (amp) {
            px += Math.sin(now * 0.0004 + s) * amp + Math.sin(now * 0.0011 + s * 1.7) * amp * 0.3
            py += Math.cos(now * 0.00035 + s * 1.3) * amp
          }
          if (!reduced) {
            if (stir) oy[i] -= stir * (0.4 + (s % 1) * 0.8)
            // brush them aside with the mouse; they ease back on their own
            const dx = px + ox[i] - mx
            const dy = py + oy[i] - my
            if (brush && form === 'drift' && dx * dx + dy * dy < R * R) {
              const d = Math.hypot(dx, dy) || 1
              const push = (R - d) * 0.6
              ox[i] += ((dx / d) * push - ox[i]) * 0.18
              oy[i] += ((dy / d) * push - oy[i]) * 0.18
            } else {
              ox[i] *= 0.94
              oy[i] *= 0.94
            }
            px += ox[i]
            py += oy[i]
          }
          // remember where it was drawn: that's where its next flight starts
          x[i] = px
          y[i] = py
          // flying home, each spore melts into the logo as it lands; in the menu, into the word
          if ((form === 'logo' && p > 0.85) || (form === 'word' && p > 0.92)) continue
        }
        // every ninth grain is a little bigger and brighter
        ctx.fillStyle = i % 9 ? plain : bright
        const sz = i % 9 ? size : size * 1.45
        ctx.fillRect(px * dpr, py * dpr, sz, sz)
      }

      // resting out of sight: stop drawing until something changes
      const idle = form === 'logo' && now >= settleUntil && canvas.style.opacity === '0'
      if (idle || (reduced && !moving && !falling)) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }

    let resizeTimer = 0
    const resize = () => {
      W = window.innerWidth
      H = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
    }
    const onResize = () => {
      resize()
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => retarget(true), 120)
    }
    const onMove = (e: PointerEvent) => {
      mx = e.clientX
      my = e.clientY
      brush = e.pointerType === 'mouse'
    }
    const onLeave = () => {
      mx = my = -1e4
    }

    resize()
    retargetRef.current = () => void retarget()
    const unsubscribe = subscribeSpores(() => void retarget())
    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    void retarget()

    return () => {
      token++
      cancelAnimationFrame(raf)
      window.clearTimeout(fadeTimer)
      window.clearTimeout(resizeTimer)
      unsubscribe()
      retargetRef.current = null
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 h-full w-full transition-opacity duration-700"
      style={{ zIndex: -1, opacity: 0 }}
    />
  )
}
