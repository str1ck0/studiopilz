'use client'

import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF, Environment, Center } from '@react-three/drei'
import { useRef, useState, useEffect } from 'react'
import { Group, MathUtils } from 'three'
import { useFrame } from '@react-three/fiber'

function GlassMushroom() {
  const groupRef = useRef<Group>(null)
  const { scene } = useGLTF('/models/glass_pilz_v2.glb')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Make the material white/clear glass
  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.material.color.setHex(0xffffff) // Pure white
        child.material.opacity = 0.8
        child.material.transparent = true
        child.material.metalness = 0.1
        child.material.roughness = 0.1
      }
    })
  }, [scene])

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
      })
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        setMousePosition({
          x: (event.touches[0].clientX / window.innerWidth) * 2 - 1,
          y: -(event.touches[0].clientY / window.innerHeight) * 2 + 1
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])

  useFrame((state) => {
    if (groupRef.current) {
      // More responsive rotation based on mouse
      const targetRotationY = mousePosition.x * 1.2
      const targetRotationX = mousePosition.y * 0.8
      const targetRotationZ = mousePosition.x * 0.3 // Add tilt

      // Smoother lerp for more fluid movement
      groupRef.current.rotation.y = MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotationY + state.clock.getElapsedTime() * 0.1,
        0.1
      )

      groupRef.current.rotation.x = MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotationX,
        0.1
      )

      groupRef.current.rotation.z = MathUtils.lerp(
        groupRef.current.rotation.z,
        targetRotationZ,
        0.1
      )

      // Gentle float animation
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1
    }
  })

  return (
    <group ref={groupRef} scale={1}>
      <Center>
        <primitive object={scene.clone()} />
      </Center>
    </group>
  )
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} color="#ffffff" />
        <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} color="#e0e0e0" />
        <GlassMushroom />
      </Canvas>
    </div>
  )
}
