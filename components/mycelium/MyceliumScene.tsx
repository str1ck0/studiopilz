'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { useTheme } from 'next-themes'
import * as THREE from 'three'
import { generateNetwork } from './generateNetwork'
import Mushroom from './Mushroom'
import Portal from './Portal'
import {
  BEND_REACH,
  MAX_INTERACT_GROWTH,
  MUSHROOM_HEIGHT,
  PALETTES,
  createSharedState,
  type Palette,
  type SharedState,
} from './shared'
import { A_LEN, T, samplePortal, type Timeline } from './timeline'

// ---------------------------------------------------------------- shaders

const commonVertex = /* glsl */ `
  uniform float uTime;
  uniform vec3 uMouse;
  uniform float uMouseStrength;
  uniform vec2 uBend;
  uniform float uStretch;
  uniform float uSpin;
  uniform float uFlare;
  uniform float uPop;
  attribute float aBirth;
  attribute float aVein;
  attribute float aDepth;
  varying float vBirth;
  varying float vDepth;
  varying float vMouse;

  // threads inside the mushroom bend with its stalk (same maths as bendPoint in shared.ts)
  vec3 bendStalk(vec3 p) {
    float k = p.y / ${MUSHROOM_HEIGHT.toFixed(2)};
    float k2 = k * k;
    // spin with the glass, flung outward a little when it spins fast
    float cs = cos(uSpin), sn = sin(uSpin);
    float fl = 1.0 + uFlare * 0.5 * k2;
    p = vec3((p.x * cs - p.z * sn) * fl, p.y * (1.0 - uFlare * 0.12 * k2), (p.x * sn + p.z * cs) * fl);
    float bulge = inversesqrt(uStretch);
    float droop = dot(uBend, uBend) * ${(MUSHROOM_HEIGHT * 0.1).toFixed(3)};
    float reach = ${(MUSHROOM_HEIGHT * BEND_REACH).toFixed(3)};
    return vec3(
      p.x * bulge + uBend.x * reach * k2,
      p.y * uStretch - droop * k2 - (p.x * uBend.x + p.z * uBend.y) * 0.9 * k,
      p.z * bulge + uBend.y * reach * k2
    ) * uPop;
  }

  vec3 displace(vec3 p) {
    if (aVein > 0.5) {
      vMouse = 0.0;
      return bendStalk(p);
    }
    vec3 q = p;
    // slow breathing
    q.x += sin(uTime * 0.35 + p.y * 1.3 + p.z * 0.7) * 0.03;
    q.y += sin(uTime * 0.5 + p.x * 0.9) * 0.03;
    // hyphae reach toward the cursor
    vec3 toM = uMouse - q;
    float infl = exp(-dot(toM, toM) / 4.5) * uMouseStrength;
    q += toM * infl * 0.22;
    vMouse = infl;
    return q;
  }
`

const commonFragment = /* glsl */ `
  uniform float uTime;
  uniform float uGrowth;
  uniform vec3 uColor;
  uniform vec3 uHot;
  uniform float uOpacity;
  uniform float uBurst;
  varying float vBirth;
  varying float vDepth;
  varying float vMouse;

  // returns (alpha, heat)
  vec2 shade() {
    float age = uGrowth - vBirth;
    if (age < 0.0) discard;
    float front = 1.0 - smoothstep(0.0, 0.035, age);
    // signals pulse outward along the network
    float sig = pow(0.5 + 0.5 * sin(vBirth * 55.0 - uTime * 1.8), 28.0);
    sig += pow(0.5 + 0.5 * sin(vBirth * 23.0 - uTime * 0.9 + 1.7), 40.0) * 0.7;
    sig *= smoothstep(0.0, 0.15, age);
    // a click sends one bright pulse outward from the mushroom
    float burst = exp(-pow((vBirth - uBurst * 0.3) / 0.025, 2.0)) * (1.0 - smoothstep(1.5, 3.5, uBurst));
    float heat = clamp(front + sig * 0.8 + vMouse * 0.9 + burst * 1.5, 0.0, 1.0);
    float base = uOpacity * mix(1.0, 0.35, vDepth);
    return vec2(clamp(base + heat * 0.9, 0.0, 1.0), heat);
  }
`

const lineVertex = /* glsl */ `
  ${commonVertex}
  void main() {
    vBirth = aBirth;
    vDepth = aDepth;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displace(position), 1.0);
  }
`

const lineFragment = /* glsl */ `
  ${commonFragment}
  void main() {
    vec2 s = shade();
    gl_FragColor = vec4(mix(uColor, uHot, s.y), s.x);
  }
`

const pointVertex = /* glsl */ `
  ${commonVertex}
  uniform float uPixelRatio;
  uniform float uSize;
  void main() {
    vBirth = aBirth;
    vDepth = aDepth;
    vec4 mv = modelViewMatrix * vec4(displace(position), 1.0);
    gl_PointSize = uSize * uPixelRatio * (1.0 - aDepth * 0.5) * (8.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`

const pointFragment = /* glsl */ `
  ${commonFragment}
  void main() {
    vec2 s = shade();
    float d = length(gl_PointCoord - 0.5);
    float disk = smoothstep(0.5, 0.0, d);
    disk *= disk;
    // nodes are mostly dark; they light up with heat
    float a = disk * (0.15 + s.y * 0.85) * s.x;
    gl_FragColor = vec4(mix(uColor, uHot, s.y), a);
  }
`

// ---------------------------------------------------------------- network

function Mycelium({
  shared,
  palette,
  network,
}: {
  shared: RefObject<SharedState>
  palette: Palette
  network: ReturnType<typeof generateNetwork>
}) {
  const gl = useThree((s) => s.gl)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uGrowth: { value: 0 },
      uMouse: { value: new THREE.Vector3(0, -100, 0) },
      uMouseStrength: { value: 0 },
      uBurst: { value: 100 },
      uBend: { value: new THREE.Vector2() },
      uStretch: { value: 1 },
      uSpin: { value: 0 },
      uFlare: { value: 0 },
      uPop: { value: 0 },
      uColor: { value: palette.thread.clone() },
      uHot: { value: palette.hot.clone() },
      uOpacity: { value: palette.opacity },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
      uSize: { value: 9 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useEffect(() => {
    uniforms.uColor.value.copy(palette.thread)
    uniforms.uHot.value.copy(palette.hot)
    uniforms.uOpacity.value = palette.opacity
  }, [palette, uniforms])

  const lineGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(network.positions, 3))
    g.setAttribute('aBirth', new THREE.BufferAttribute(network.births, 1))
    g.setAttribute('aDepth', new THREE.BufferAttribute(network.depths, 1))
    g.setAttribute('aVein', new THREE.BufferAttribute(network.veins, 1))
    return g
  }, [network])

  const pointGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(network.nodePositions, 3))
    g.setAttribute('aBirth', new THREE.BufferAttribute(network.nodeBirths, 1))
    g.setAttribute('aDepth', new THREE.BufferAttribute(network.nodeDepths, 1))
    g.setAttribute('aVein', new THREE.BufferAttribute(network.nodeVeins, 1))
    return g
  }, [network])

  useEffect(
    () => () => {
      lineGeometry.dispose()
      pointGeometry.dispose()
    },
    [lineGeometry, pointGeometry]
  )

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime * (shared.current.reducedMotion ? 0.2 : 1)
    uniforms.uGrowth.value = shared.current.growth
    uniforms.uMouse.value.copy(shared.current.pointerWorld)
    uniforms.uMouseStrength.value = shared.current.mouseStrength
    uniforms.uBurst.value = (performance.now() - shared.current.burstAt) / 1000
    uniforms.uBend.value.set(shared.current.bendX, shared.current.bendZ)
    uniforms.uStretch.value = shared.current.stretch
    uniforms.uSpin.value = shared.current.spin
    uniforms.uFlare.value = shared.current.flare
    uniforms.uPop.value = shared.current.pop
  })

  return (
    <>
      <lineSegments geometry={lineGeometry} frustumCulled={false}>
        <shaderMaterial
          key={`l-${palette.blending}`}
          uniforms={uniforms}
          vertexShader={lineVertex}
          fragmentShader={lineFragment}
          transparent
          depthWrite={false}
          blending={palette.blending}
        />
      </lineSegments>
      <points geometry={pointGeometry} frustumCulled={false}>
        <shaderMaterial
          key={`p-${palette.blending}`}
          uniforms={uniforms}
          vertexShader={pointVertex}
          fragmentShader={pointFragment}
          transparent
          depthWrite={false}
          blending={palette.blending}
        />
      </points>
    </>
  )
}

// ---------------------------------------------------------------- halo

// soft light behind the mushroom — gives the glass something bright to bend
const haloVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const haloFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uStrength;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = pow(clamp(1.0 - d, 0.0, 1.0), 2.2) * uStrength;
    gl_FragColor = vec4(uColor, a);
  }
`

function Halo({ shared, palette }: { shared: RefObject<SharedState>; palette: Palette }) {
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color() }, uStrength: { value: 0 } }),
    []
  )
  useEffect(() => {
    uniforms.uColor.value.set(palette.halo)
  }, [palette, uniforms])
  const material = useRef<THREE.ShaderMaterial>(null)
  useFrame(() => {
    if (!material.current) return
    // bright on the landing, fades as the network takes over
    material.current.uniforms.uStrength.value =
      palette.haloStrength * (1 - Math.min(shared.current.growth * 1.6, 0.85))
  })
  return (
    <mesh position={[0, 1.3, -3]} renderOrder={-1}>
      <planeGeometry args={[11, 11]} />
      <shaderMaterial
        ref={material}
        key={`h-${palette.blending}`}
        uniforms={uniforms}
        vertexShader={haloVertex}
        fragmentShader={haloFragment}
        transparent
        depthWrite={false}
        blending={palette.blending}
      />
    </mesh>
  )
}

// ---------------------------------------------------------------- camera / input

// camera path over the first chapter: close on the mushroom → pull back as the
// network spreads → dive in. WIDE is also where the journey ends.
const WIDE = { pos: new THREE.Vector3(0, 1.6, 13), look: new THREE.Vector3(0, -1.6, 0) }
const KEYS = [
  { at: 0, pos: new THREE.Vector3(0, 1.25, 7), look: new THREE.Vector3(0, 1.05, 0) },
  { at: 0.45, ...WIDE },
  { at: 1, pos: new THREE.Vector3(0, -5.2, 3.2), look: new THREE.Vector3(0, -4.6, -3) },
]

function setVisible(object: THREE.Object3D | null, visible: boolean) {
  if (object) object.visible = visible
}

function sampleKeys(p: number, outPos: THREE.Vector3, outLook: THREE.Vector3) {
  let i = 0
  while (i < KEYS.length - 2 && p > KEYS[i + 1].at) i++
  const a = KEYS[i]
  const b = KEYS[i + 1]
  const u = THREE.MathUtils.clamp((p - a.at) / (b.at - a.at), 0, 1)
  const e = u * u * (3 - 2 * u)
  outPos.lerpVectors(a.pos, b.pos, e)
  outLook.lerpVectors(a.look, b.look, e)
}

function Rig({
  shared,
  journeyRef,
  timeline,
  world,
  mushroom,
}: {
  shared: RefObject<SharedState>
  journeyRef: RefObject<number>
  timeline: Timeline
  world: RefObject<THREE.Group | null>
  mushroom: RefObject<THREE.Group | null>
}) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const look = useRef(KEYS[0].look.clone())
  const tmp = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      target: new THREE.Vector3(),
      ray: new THREE.Raycaster(),
      plane: new THREE.Plane(),
      normal: new THREE.Vector3(),
      hit: new THREE.Vector3(),
    }),
    []
  )

  useFrame((_, delta) => {
    const u = journeyRef.current ?? 0
    const p = Math.min(u / A_LEN, 1)
    // once the first project covers the screen, quietly move to the closing shot
    const closing = u > timeline.portalStart + T

    // the network unravels with scroll, or a little with cursor play
    const scrollGrowth = THREE.MathUtils.smoothstep(p, 0.02, 0.8)
    const target = Math.max(shared.current.interact, scrollGrowth)
    const growth = THREE.MathUtils.damp(shared.current.growth, target, 2.2, delta)

    // cursor influence fades in while moving, out when idle
    const active = performance.now() - shared.current.lastPointerMove < 2500 ? 1 : 0
    const mouseStrength = THREE.MathUtils.damp(shared.current.mouseStrength, active, 2.5, delta)
    Object.assign(shared.current, { growth, mouseStrength })

    // skip drawing the 3D world while a project fills the screen
    const { seg, mix } = samplePortal(timeline, u)
    const n = timeline.count
    const covered = (seg >= 1 && seg < n) || (seg === 0 && mix >= 1)
    setVisible(world.current, !covered)
    setVisible(mushroom.current, !closing ? p < 0.9 : seg === n)

    // camera
    if (closing) {
      tmp.pos.copy(WIDE.pos)
      tmp.target.copy(WIDE.look)
    } else {
      sampleKeys(p, tmp.pos, tmp.target)
    }
    const aspect = size.width / size.height
    const pullAmount = closing ? 0 : THREE.MathUtils.smoothstep(p, 0.45, 1)
    const pull = THREE.MathUtils.lerp(Math.max(1, 0.85 / aspect), 1, pullAmount)
    tmp.pos.set(
      tmp.pos.x + shared.current.pointer.x * 0.5,
      tmp.pos.y + shared.current.pointer.y * 0.3,
      tmp.pos.z * pull
    )
    camera.position.lerp(tmp.pos, 1 - Math.exp(-delta * 3))
    look.current.lerp(tmp.target, 1 - Math.exp(-delta * 3))
    camera.lookAt(look.current)

    // project cursor onto a plane through the look target
    tmp.ray.setFromCamera(shared.current.pointer, camera)
    camera.getWorldDirection(tmp.normal).negate()
    tmp.plane.setFromNormalAndCoplanarPoint(tmp.normal, look.current)
    if (tmp.ray.ray.intersectPlane(tmp.plane, tmp.hit)) {
      shared.current.pointerWorld.lerp(tmp.hit, 1 - Math.exp(-delta * 8))
    }
  })

  return null
}

// ---------------------------------------------------------------- root

export default function MyceliumScene({
  journeyRef,
  timeline,
  imageUrls,
}: {
  /** scroll position in viewport heights */
  journeyRef: RefObject<number>
  timeline: Timeline
  imageUrls: string[]
}) {
  const { resolvedTheme } = useTheme()
  const palette = PALETTES[resolvedTheme === 'light' ? 'light' : 'dark']
  const containerRef = useRef<HTMLDivElement>(null)
  const world = useRef<THREE.Group>(null)
  const mushroom = useRef<THREE.Group>(null)
  const [visible, setVisible] = useState(true)
  const [small] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)

  const shared = useRef<SharedState>(createSharedState())

  const network = useMemo(
    () => generateNetwork({ maxSegments: small ? 5000 : 9000, maxFruits: 0, origin: [0, 0, 0] }),
    [small]
  )

  useEffect(() => {
    const s = shared.current
    s.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -(e.clientY / window.innerHeight) * 2 + 1
      // every bit of cursor travel coaxes a few more threads out
      const travel = Math.hypot(x - s.pointer.x, y - s.pointer.y)
      s.interact = Math.min(s.interact + travel * 0.012, MAX_INTERACT_GROWTH)
      // fast swipes knock the mushroom
      if (s.lastPointerMove > 0 && !s.dragging) {
        s.kickX += (x - s.pointer.x) * 7
        s.kickZ -= (y - s.pointer.y) * 4
      }
      s.pointer.set(x, y)
      s.lastPointerMove = performance.now()
    }
    // click / tap: the mushroom squashes and a pulse runs down the threads
    const onClick = () => {
      s.kickSquash -= 3.2
      s.kickX += (Math.random() - 0.5) * 3
      s.burstAt = performance.now()
      s.interact = Math.min(s.interact + 0.06, MAX_INTERACT_GROWTH)
    }
    // letting go of the cap: it snaps back and wobbles
    const onRelease = () => {
      if (!s.dragging) return
      s.dragging = false
      document.body.style.cursor = ''
    }
    // dev only: ?pointer=0.8,0.2 holds a fake cursor there and ?click=1 clicks once,
    // so screenshots can show the mushroom reacting
    let fake: ReturnType<typeof setInterval> | undefined
    if (process.env.NODE_ENV === 'development') {
      const params = new URLSearchParams(window.location.search)
      const at = params.get('pointer')?.split(',').map(Number)
      if (at?.length === 2) {
        fake = setInterval(() => {
          s.pointer.set(at[0], at[1])
          s.lastPointerMove = performance.now()
        }, 100)
      }
      if (params.get('click')) setTimeout(onClick, 1200)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('click', onClick)
    window.addEventListener('pointerup', onRelease)
    window.addEventListener('pointercancel', onRelease)
    return () => {
      if (fake) clearInterval(fake)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('click', onClick)
      window.removeEventListener('pointerup', onRelease)
      window.removeEventListener('pointercancel', onRelease)
    }
  }, [])

  // stop rendering when the journey is off screen
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: KEYS[0].pos.toArray(), fov: 40, near: 0.1, far: 100 }}
        style={{ background: 'transparent' }}
      >
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={4} position={[0, 5, 4]} scale={[10, 2, 1]} />
          <Lightformer form="rect" intensity={2.5} position={[-5, 1, 2]} rotation-y={Math.PI / 3} scale={[2, 6, 1]} />
          <Lightformer form="rect" intensity={2.5} position={[5, 2, -1]} rotation-y={-Math.PI / 3} scale={[2, 6, 1]} />
          <Lightformer form="rect" intensity={1} position={[0, 1, -5]} scale={[8, 4, 1]} />
        </Environment>
        <Rig
          shared={shared}
          journeyRef={journeyRef}
          timeline={timeline}
          world={world}
          mushroom={mushroom}
        />
        <group ref={world}>
          <Halo shared={shared} palette={palette} />
          <Mycelium shared={shared} palette={palette} network={network} />
          <group ref={mushroom}>
            <Suspense fallback={null}>
              <Mushroom shared={shared} journeyRef={journeyRef} palette={palette} small={small} />
            </Suspense>
          </group>
        </group>
        <Portal journeyRef={journeyRef} timeline={timeline} urls={imageUrls} hot={palette.hot} />
      </Canvas>
    </div>
  )
}

