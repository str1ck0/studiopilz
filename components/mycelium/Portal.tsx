'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import { samplePortal, type Timeline } from './timeline'

// A full-screen layer drawn over the 3D world. It shows two scenes at once:
// the one we are in (A) and, through a growing wobbly hole, the next one (B).
// A scene is either a project image or "nothing" (transparent → the 3D world).

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragment = /* glsl */ `
  uniform sampler2D uTexA;
  uniform sampler2D uTexB;
  uniform float uHasA;
  uniform float uHasB;
  uniform float uMix;
  uniform float uZoomA;
  uniform float uZoomB;
  uniform float uAspectA;
  uniform float uAspectB;
  uniform float uViewAspect;
  uniform float uTime;
  uniform vec3 uHot;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }

  // centred coords → texture uv, filling the screen like CSS object-fit: cover
  vec2 cover(vec2 c, float texAspect, float zoom) {
    if (uViewAspect > texAspect) c.y *= texAspect / uViewAspect;
    else c.x *= uViewAspect / texAspect;
    return c / zoom + 0.5;
  }

  void main() {
    vec2 c = vUv - 0.5;
    vec2 pc = c * vec2(uViewAspect, 1.0);
    float d = length(pc);
    vec2 dir = d > 0.0 ? pc / d : vec2(0.0);
    float on = step(0.0001, uMix);
    float e = uMix * uMix * (3.0 - 2.0 * uMix);

    // the hole: a circle with an organic, slowly shifting edge
    float maxR = 0.5 * length(vec2(uViewAspect, 1.0)) * 1.3;
    float wob = noise(dir * 2.5 + uTime * 0.3) - 0.5;
    float R = e * maxR * (1.0 + 0.3 * wob * (1.0 - e));
    float edge = 0.004 + 0.02 * e;
    float inside = (1.0 - smoothstep(R - edge, R + edge, d)) * on;

    // scene A bends around the rim like thick glass, colours splitting slightly
    float rim = exp(-pow((d - R) / (0.06 + 0.1 * e), 2.0)) * on * (1.0 - e * 0.5);
    vec2 disp = dir / vec2(uViewAspect, 1.0) * rim * 0.07;
    vec3 colA = vec3(
      texture2D(uTexA, cover(c - disp * 1.3, uAspectA, uZoomA)).r,
      texture2D(uTexA, cover(c - disp, uAspectA, uZoomA)).g,
      texture2D(uTexA, cover(c - disp * 0.7, uAspectA, uZoomA)).b
    );

    // scene B is seen through the hole with a fisheye that relaxes as it opens
    float k = 1.0 + 0.35 * (1.0 - e) * clamp(d / max(R, 0.001), 0.0, 1.0);
    vec3 colB = texture2D(uTexB, cover(c * k, uAspectB, uZoomB)).rgb;

    vec3 col = mix(colA * uHasA, colB * uHasB, inside);
    float alpha = mix(uHasA, uHasB, inside);

    // glowing edge, strongest mid-transition
    float pulse = sin(3.14159 * uMix);
    float glow = (exp(-pow((d - R) / 0.008, 2.0)) + 0.3 * exp(-pow((d - R) / 0.05, 2.0))) * pulse * on;
    col += uHot * glow;
    alpha = clamp(alpha + glow, 0.0, 1.0);

    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`

interface Slot {
  texture: THREE.Texture
  aspect: number
}

function useProjectTextures(urls: string[]) {
  const placeholder = useMemo(() => {
    const t = new THREE.DataTexture(new Uint8Array([20, 20, 20, 255]), 1, 1)
    t.needsUpdate = true
    return t
  }, [])
  const [slots, setSlots] = useState<(Slot | null)[]>(() => urls.map(() => null))
  const maxAnisotropy = useThree((s) => s.gl.capabilities.getMaxAnisotropy())

  useEffect(() => {
    let cancelled = false
    const loaded: THREE.Texture[] = []
    const loader = new THREE.TextureLoader()
    urls.forEach((url, i) => {
      loader.load(url, (texture) => {
        if (cancelled) return texture.dispose()
        texture.colorSpace = THREE.SRGBColorSpace
        texture.anisotropy = Math.min(4, maxAnisotropy)
        loaded.push(texture)
        const aspect = texture.image.width / texture.image.height
        setSlots((prev) => prev.map((s, k) => (k === i ? { texture, aspect } : s)))
      })
    })
    return () => {
      cancelled = true
      loaded.forEach((t) => t.dispose())
    }
  }, [urls, maxAnisotropy])

  return { slots, placeholder }
}

export default function Portal({
  journeyRef,
  timeline,
  urls,
  hot,
}: {
  journeyRef: RefObject<number>
  timeline: Timeline
  urls: string[]
  hot: THREE.Color
}) {
  const { slots, placeholder } = useProjectTextures(urls)
  const mesh = useRef<THREE.Mesh>(null)
  const material = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTexA: { value: null as THREE.Texture | null },
      uTexB: { value: null as THREE.Texture | null },
      uHasA: { value: 0 },
      uHasB: { value: 0 },
      uMix: { value: 0 },
      uZoomA: { value: 1 },
      uZoomB: { value: 1 },
      uAspectA: { value: 1 },
      uAspectB: { value: 1 },
      uViewAspect: { value: 1 },
      uTime: { value: 0 },
      uHot: { value: new THREE.Color() },
    }),
    []
  )

  useFrame((state) => {
    const m = material.current
    if (!m || !mesh.current) return
    const n = timeline.count
    const { seg, mix, zoomA, zoomB } = samplePortal(timeline, journeyRef.current ?? 0)
    const a = seg - 1
    const b = seg
    const hasA = a >= 0 && a < n
    const hasB = b >= 0 && b < n
    // nothing to draw before the first portal or once the last one is fully open
    mesh.current.visible = seg >= 0 && (hasA || hasB) && !(seg === n && mix >= 1)
    if (!mesh.current.visible) return

    const u = m.uniforms
    const slotA = hasA ? slots[a] : null
    const slotB = hasB ? slots[b] : null
    u.uTexA.value = slotA?.texture ?? placeholder
    u.uTexB.value = slotB?.texture ?? placeholder
    u.uAspectA.value = slotA?.aspect ?? 1
    u.uAspectB.value = slotB?.aspect ?? 1
    u.uHasA.value = hasA ? 1 : 0
    u.uHasB.value = hasB ? 1 : 0
    u.uMix.value = mix
    u.uZoomA.value = zoomA
    u.uZoomB.value = zoomB
    u.uViewAspect.value = state.size.width / state.size.height
    u.uTime.value = state.clock.elapsedTime
    u.uHot.value.copy(hot)
  })

  return (
    <mesh ref={mesh} frustumCulled={false} renderOrder={10} visible={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
        transparent
        premultipliedAlpha
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}
