'use client'

import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { MeshTransmissionMaterial, useGLTF } from '@react-three/drei'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { MUSHROOM_HEIGHT, bendPoint, type Palette, type SharedState } from './shared'

export const MODEL_URL = '/models/glass_pilz_v2.glb'

const CAP_Y = 1.6
const SPORE_COUNT = 420
const SPORES_PER_BURST = 70

function useMushroomGeometry() {
  const { scene } = useGLTF(MODEL_URL)
  return useMemo(() => {
    const parts: THREE.BufferGeometry[] = []
    scene.updateMatrixWorld(true)
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (mesh.isMesh) {
        const g = mesh.geometry.clone()
        g.applyMatrix4(mesh.matrixWorld)
        parts.push(g)
      }
    })
    const merged = mergeGeometries(parts) ?? parts[0]
    // stand it on the origin with a known height
    merged.computeBoundingBox()
    const box = merged.boundingBox!
    const center = box.getCenter(new THREE.Vector3())
    const k = MUSHROOM_HEIGHT / (box.max.y - box.min.y)
    merged.translate(-center.x, -box.min.y, -center.z)
    merged.scale(k, k, k)
    merged.computeVertexNormals()
    return merged
  }, [scene])
}

function drawGlow() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const c = canvas.getContext('2d')!
  const g = c.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.35)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  c.fillStyle = g
  c.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

const sporeVertex = /* glsl */ `
  attribute float aLife;
  varying float vLife;
  void main() {
    vLife = aLife;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (14.0 + 70.0 * aLife) / -mv.z * step(0.001, aLife);
    gl_Position = projectionMatrix * mv;
  }
`
const sporeFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uHot;
  varying float vLife;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float disk = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(mix(uColor, uHot, vLife), disk * disk * min(vLife * 2.0, 1.0));
  }
`

export default function Mushroom({
  shared,
  journeyRef,
  palette,
  small,
}: {
  shared: RefObject<SharedState>
  /** scroll position in viewport heights */
  journeyRef: RefObject<number>
  palette: Palette
  small: boolean
}) {
  const geometry = useMushroomGeometry()
  const group = useRef<THREE.Group>(null)
  const mesh = useRef<THREE.Mesh>(null)
  const glow = useRef<THREE.Sprite>(null)
  const spores = useRef<THREE.Points>(null)
  const backdrop = useMemo(() => new THREE.Color(palette.backdrop), [palette.backdrop])

  // rest shape, so the stalk can be bent from it every frame
  // The model is perfectly round, which would make a spin invisible — so the cap
  // gets a gently uneven, wavy edge and a slight tilt, like a real one.
  const rest = useMemo(() => {
    const out = Float32Array.from(geometry.attributes.position.array)
    for (let i = 0; i < out.length; i += 3) {
      const x = out[i]
      const y = out[i + 1]
      const z = out[i + 2]
      const cap = THREE.MathUtils.smoothstep(y, 1.05, 1.3)
      if (cap === 0) continue
      const r = Math.hypot(x, z)
      const a = Math.atan2(z, x)
      const rim = THREE.MathUtils.smoothstep(r, 0.15, 0.8) * cap
      const wave = Math.sin(a * 3 + 0.6) * 0.6 + Math.sin(a * 5 + 2.1) * 0.4
      const widen = 1 + rim * 0.1 * wave
      out[i] = x * widen
      out[i + 2] = z * widen
      out[i + 1] = y + rim * (0.07 * Math.sin(a * 3 + 2.0) + x * 0.09)
    }
    return out
  }, [geometry])

  const glowTexture = useMemo(() => drawGlow(), [])
  useEffect(() => () => glowTexture.dispose(), [glowTexture])

  const sporeGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SPORE_COUNT * 3), 3))
    g.setAttribute('aLife', new THREE.BufferAttribute(new Float32Array(SPORE_COUNT), 1))
    return g
  }, [])
  useEffect(() => () => sporeGeometry.dispose(), [sporeGeometry])
  const sporeUniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color() }, uHot: { value: new THREE.Color() } }),
    []
  )

  // everything that changes frame to frame
  const sim = useRef({
    // springs: bend sideways (x), bend in depth (z), stretch (s)
    x: 0,
    z: 0,
    s: 0,
    vx: 0,
    vz: 0,
    vs: 0,
    lastGrowth: 0,
    excite: 0,
    // spin: angle and speed, driven by scrolling like a flywheel
    angle: 0,
    omega: 0,
    lastU: 0,
    // arrival and idle life
    age: 0,
    nextHop: 3,
    hopFlare: 0,
    sporeDebt: 0,
    seenBurst: -1e9,
    nextSpore: 0,
    sporeVel: new Float32Array(SPORE_COUNT * 3),
    tmp: new THREE.Vector3(),
  })

  useFrame((state, delta) => {
    const m = mesh.current
    if (!m) return
    const t = state.clock.elapsedTime
    // never zero: the first frame can report no elapsed time
    const dt = THREE.MathUtils.clamp(delta, 1 / 240, 1 / 30)
    const sh = shared.current
    const sp = sim.current
    const still = sh.reducedMotion

    // ---- arrival: it pops up out of nothing with a bounce
    // real time, not frame count, so slow devices see the same arrival
    sp.age = t
    const arrive = Math.min(sp.age / 1.3, 1)
    const pop = still ? 1 : 1 + 2.7 * Math.pow(arrive - 1, 3) + 1.7 * Math.pow(arrive - 1, 2)
    if (group.current) group.current.scale.setScalar(Math.max(pop, 0.0001))

    // ---- spin: scrolling throws it round like a flywheel; it coasts, then idles
    const u = journeyRef.current ?? 0
    const du = u - sp.lastU
    sp.lastU = u
    const idleSpin = still ? 0 : 0.35
    if (!still) sp.omega = THREE.MathUtils.clamp(sp.omega + du * 26, -16, 16)
    sp.omega = THREE.MathUtils.damp(sp.omega, idleSpin, 0.9, dt)
    sp.angle += sp.omega * dt
    const speed = Math.abs(sp.omega)
    // the faster it spins, the more the cap is flung outward and flattened
    const flare = Math.min((speed * speed) / 140, 0.75)

    // ---- what the mushroom is being asked to do
    // scroll reaction: it stretches up and shivers while the network is unravelling
    const rate = Math.max(sh.growth - sp.lastGrowth, 0) / dt
    sp.lastGrowth = sh.growth
    sp.excite = THREE.MathUtils.damp(sp.excite, Math.min(rate * 2.5, 1), 5, dt)

    // left alone on the landing, it gets restless: a hop, a puff of spores, a flash
    sp.hopFlare = THREE.MathUtils.damp(sp.hopFlare, 0, 2.2, dt)
    let hop = false
    if (!still && !sh.dragging && u < 0.3 && sp.age > sp.nextHop) {
      sp.nextHop = sp.age + 3.5 + Math.random() * 3
      sp.vs += 2.6
      sp.vx += (Math.random() - 0.5) * 2.5
      sp.omega += 3 + Math.random() * 3
      sp.hopFlare = 1
      hop = true
    }

    let targetX: number
    let targetZ: number
    let targetS: number
    let stiffness = 38
    let damping = 4.2
    if (sh.dragging) {
      // pulled by the cap: follows the hand closely, stretching like rubber
      targetX = (sh.pointer.x - sh.dragStartX) * 2.6
      targetZ = 0
      targetS = THREE.MathUtils.clamp((sh.pointer.y - sh.dragStartY) * 1.3, -0.35, 0.7)
      stiffness = 110
      damping = 14
    } else {
      // leans toward the cursor; sways on its own when left alone
      const idle = still ? 0 : 1 - sh.mouseStrength
      targetX = sh.pointer.x * 1.2 * sh.mouseStrength + Math.sin(t * 0.9) * 0.22 * idle
      targetZ = -sh.pointer.y * 0.6 * sh.mouseStrength + Math.cos(t * 0.7) * 0.12 * idle
      targetS = still ? 0 : Math.sin(t * 1.6) * 0.035
      if (!still) {
        targetS += sp.excite * 0.22 - flare * 0.12
        targetX += Math.sin(t * 38) * 0.05 * sp.excite
        // a fast spin makes it wobble round its axis like a spinning top
        const wobble = Math.min(speed / 16, 1) * 0.28
        targetX += Math.sin(sp.angle * 0.5) * wobble
        targetZ += Math.cos(sp.angle * 0.5) * wobble
        // scrolling gives it a little shove up or down
        sp.vs += THREE.MathUtils.clamp(du * 9, -1.2, 1.2)
        // take the waiting knocks
        sp.vx += THREE.MathUtils.clamp(sh.kickX, -6, 6)
        sp.vz += THREE.MathUtils.clamp(sh.kickZ, -4, 4)
        sp.vs += sh.kickSquash
      }
    }

    // loose springs: they overshoot and wobble before settling
    sp.vx += (stiffness * (targetX - sp.x) - damping * sp.vx) * dt
    sp.vz += (stiffness * (targetZ - sp.z) - damping * sp.vz) * dt
    sp.vs += (130 * (targetS - sp.s) - (sh.dragging ? 16 : 7) * sp.vs) * dt
    sp.x = THREE.MathUtils.clamp(sp.x + sp.vx * dt, -1.6, 1.6)
    sp.z = THREE.MathUtils.clamp(sp.z + sp.vz * dt, -1.2, 1.2)
    sp.s = THREE.MathUtils.clamp(sp.s + sp.vs * dt, -0.45, 0.7)
    const stretch = 1 + sp.s
    Object.assign(sh, {
      kickX: 0,
      kickZ: 0,
      kickSquash: 0,
      bendX: sp.x,
      bendZ: sp.z,
      stretch,
      spin: sp.angle,
      flare,
      pop,
    })

    // ---- bend the glass
    const position = m.geometry.attributes.position as THREE.BufferAttribute
    const cs = Math.cos(sp.angle)
    const sn = Math.sin(sp.angle)
    for (let i = 0; i < position.count; i++) {
      const bx = rest[i * 3]
      const by = rest[i * 3 + 1]
      const bz = rest[i * 3 + 2]
      const k2 = (by / MUSHROOM_HEIGHT) ** 2
      const fl = 1 + flare * 0.5 * k2
      bendPoint(
        (bx * cs - bz * sn) * fl,
        by * (1 - flare * 0.12 * k2),
        (bx * sn + bz * cs) * fl,
        sp.x,
        sp.z,
        stretch,
        sp.tmp
      )
      position.setXYZ(i, sp.tmp.x, sp.tmp.y, sp.tmp.z)
    }
    position.needsUpdate = true
    m.geometry.computeVertexNormals()

    // ---- light inside the cap: warms as the cursor comes close, flares on a click
    const burstAge = (performance.now() - sh.burstAt) / 1000
    if (glow.current) {
      bendPoint(0, CAP_Y, 0, sp.x, sp.z, stretch, sp.tmp)
      glow.current.position.copy(sp.tmp)
      const near = Math.exp(-sp.tmp.distanceToSquared(sh.pointerWorld) / 5) * sh.mouseStrength
      const flash = Math.max(Math.exp(-burstAge * 2.2), sp.hopFlare * 0.7)
      const breathe = still ? 0 : Math.sin(t * 1.6) * 0.08
      glow.current.material.opacity =
        0.2 + breathe + near * 0.55 + flash * 0.9 + flare * 0.5 + (sh.dragging ? 0.4 : 0)
      glow.current.scale.setScalar(1.4 + flash * 0.8 + near * 0.3 + flare * 0.6)
    }

    // ---- spores: a puff from under the cap on every click
    const points = spores.current
    if (points) {
      const pos = points.geometry.attributes.position as THREE.BufferAttribute
      const life = points.geometry.attributes.aLife as THREE.BufferAttribute
      // puff = straight out from under the cap; fling = thrown off sideways by the spin
      const emit = (count: number, fling: number) => {
        for (let n = 0; n < count; n++) {
          const i = sp.nextSpore
          sp.nextSpore = (sp.nextSpore + 1) % SPORE_COUNT
          const a = Math.random() * Math.PI * 2
          const r = (0.45 + Math.random() * 0.35) * (1 + flare * 0.5)
          bendPoint(Math.cos(a) * r, 1.3 + Math.random() * 0.15, Math.sin(a) * r, sp.x, sp.z, stretch, sp.tmp)
          pos.setXYZ(i, sp.tmp.x, sp.tmp.y, sp.tmp.z)
          life.setX(i, 0.6 + Math.random() * 0.4)
          const out = 0.4 + Math.random() * 0.9
          sp.sporeVel[i * 3] = Math.cos(a) * out - Math.sin(a) * fling + sp.vx * 0.3
          sp.sporeVel[i * 3 + 1] = 0.2 + Math.random() * 0.9
          sp.sporeVel[i * 3 + 2] = Math.sin(a) * out + Math.cos(a) * fling
        }
      }
      if (sh.burstAt !== sp.seenBurst) {
        sp.seenBurst = sh.burstAt
        if (!still) emit(SPORES_PER_BURST, sp.omega * 0.2)
      }
      if (hop) emit(24, sp.omega * 0.2)
      // a fast spin sheds a steady trail
      if (!still && speed > 3) {
        sp.sporeDebt += (speed - 3) * 7 * dt
        const n = Math.floor(sp.sporeDebt)
        sp.sporeDebt -= n
        emit(n, sp.omega * 0.35)
      }
      for (let i = 0; i < SPORE_COUNT; i++) {
        const l = life.getX(i)
        if (l <= 0) continue
        const v = sp.sporeVel
        // light as dust: quick puff, then a slow swirling fall into the network
        v[i * 3] += Math.sin(t * 1.7 + i) * 0.25 * dt
        v[i * 3 + 1] -= 0.45 * dt
        v[i * 3 + 2] += Math.cos(t * 1.3 + i * 1.7) * 0.25 * dt
        const drag = Math.exp(-1.1 * dt)
        v[i * 3] *= drag
        v[i * 3 + 1] *= drag
        v[i * 3 + 2] *= drag
        pos.setXYZ(i, pos.getX(i) + v[i * 3] * dt, pos.getY(i) + v[i * 3 + 1] * dt, pos.getZ(i) + v[i * 3 + 2] * dt)
        life.setX(i, Math.max(l - dt / 4.5, 0))
      }
      pos.needsUpdate = true
      life.needsUpdate = true
      const material = points.material as THREE.ShaderMaterial
      material.uniforms.uColor.value.copy(palette.thread)
      material.uniforms.uHot.value.copy(palette.hot)
    }
  })

  // ---- drag to pull
  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const x = (e.nativeEvent.clientX / window.innerWidth) * 2 - 1
    const y = -(e.nativeEvent.clientY / window.innerHeight) * 2 + 1
    shared.current.pointer.set(x, y)
    Object.assign(shared.current, { dragging: true, dragStartX: x, dragStartY: y })
    document.body.style.cursor = 'grabbing'
  }
  const onPointerOver = () => {
    if (!shared.current.dragging) document.body.style.cursor = 'grab'
  }
  const onPointerOut = () => {
    if (!shared.current.dragging) document.body.style.cursor = ''
  }
  useEffect(
    () => () => {
      document.body.style.cursor = ''
    },
    []
  )

  return (
    <group ref={group}>
      <mesh
        ref={mesh}
        geometry={geometry}
        frustumCulled={false}
        onPointerDown={onPointerDown}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <MeshTransmissionMaterial
          background={backdrop}
          backside
          backsideThickness={0.5}
          thickness={1}
          samples={small ? 4 : 8}
          resolution={small ? 256 : 768}
          transmission={1}
          roughness={0.04}
          ior={1.45}
          chromaticAberration={0.03}
          anisotropicBlur={0.05}
          distortion={0}
          clearcoat={1}
          clearcoatRoughness={0.05}
          color="#ffffff"
        />
      </mesh>

      {/* sits inside the cap, so it is only ever seen through the glass */}
      <sprite ref={glow}>
        <spriteMaterial
          map={glowTexture}
          color={palette.hot}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>

      <points ref={spores} geometry={sporeGeometry} frustumCulled={false}>
        <shaderMaterial
          key={`s-${palette.blending}`}
          uniforms={sporeUniforms}
          vertexShader={sporeVertex}
          fragmentShader={sporeFragment}
          transparent
          depthWrite={false}
          blending={palette.blending}
        />
      </points>
    </group>
  )
}

useGLTF.preload(MODEL_URL)
