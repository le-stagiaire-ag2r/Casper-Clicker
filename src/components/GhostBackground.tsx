import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface GhostProps {
  position: [number, number, number]
  color: string
  size: number
  speed: number
  floatOffset: number
}

function Ghost({ position, color, size, speed, floatOffset }: GhostProps) {
  const meshRef = useRef<THREE.Sprite>(null)

  // Create ghost texture
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 160
    const ctx = canvas.getContext('2d')!

    const gradient = ctx.createRadialGradient(64, 60, 0, 64, 80, 80)
    gradient.addColorStop(0, color)
    gradient.addColorStop(0.5, color.replace('0.9', '0.5'))
    gradient.addColorStop(1, color.replace('0.9', '0'))

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(64, 50, 45, Math.PI, 0, false)
    ctx.lineTo(109, 120)
    ctx.quadraticCurveTo(95, 105, 85, 120)
    ctx.quadraticCurveTo(75, 135, 64, 120)
    ctx.quadraticCurveTo(53, 135, 43, 120)
    ctx.quadraticCurveTo(33, 105, 19, 120)
    ctx.lineTo(19, 50)
    ctx.closePath()
    ctx.fill()

    // Eyes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.beginPath()
    ctx.ellipse(48, 55, 10, 12, 0, 0, Math.PI * 2)
    ctx.ellipse(80, 55, 10, 12, 0, 0, Math.PI * 2)
    ctx.fill()

    // Pupils
    ctx.fillStyle = 'rgba(20, 10, 30, 0.9)'
    ctx.beginPath()
    ctx.arc(50, 57, 5, 0, Math.PI * 2)
    ctx.arc(82, 57, 5, 0, Math.PI * 2)
    ctx.fill()

    // Blush
    ctx.fillStyle = 'rgba(244, 114, 182, 0.4)'
    ctx.beginPath()
    ctx.ellipse(38, 72, 8, 5, 0, 0, Math.PI * 2)
    ctx.ellipse(90, 72, 8, 5, 0, 0, Math.PI * 2)
    ctx.fill()

    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [color])

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.elapsedTime

    // Float animation
    meshRef.current.position.y = position[1] + Math.sin(time * speed + floatOffset) * 0.5

    // Gentle drift
    meshRef.current.position.x += 0.002

    // Wrap around
    if (meshRef.current.position.x > 12) meshRef.current.position.x = -12

    // Pulse opacity
    const material = meshRef.current.material as THREE.SpriteMaterial
    material.opacity = 0.5 + Math.sin(time * 0.5 + floatOffset) * 0.2
  })

  return (
    <sprite ref={meshRef} position={position} scale={[size * 2, size * 2.5, 1]}>
      <spriteMaterial map={texture} transparent opacity={0.6} blending={THREE.AdditiveBlending} />
    </sprite>
  )
}

function Particles() {
  const particlesRef = useRef<THREE.Points>(null)

  const [positions, colors] = useMemo(() => {
    const count = 200
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)

    const purple = new THREE.Color('#8b5cf6')
    const cyan = new THREE.Color('#06b6d4')

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 3

      const c = Math.random() > 0.5 ? purple : cyan
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }

    return [pos, col]
  }, [])

  useFrame((state) => {
    if (!particlesRef.current) return
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < positions.length / 3; i++) {
      positions[i * 3 + 1] += 0.005
      if (positions[i * 3 + 1] > 10) {
        positions[i * 3 + 1] = -10
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true
    particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02
  })

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [positions, colors])

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.6} blending={THREE.AdditiveBlending} />
    </points>
  )
}

function Scene() {
  const ghosts = useMemo(() => {
    const colors = [
      'rgba(139, 92, 246, 0.9)',  // Purple
      'rgba(6, 182, 212, 0.9)',   // Cyan
      'rgba(168, 85, 247, 0.9)',  // Light purple
    ]

    return Array.from({ length: 20 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8 - 5,
      ] as [number, number, number],
      color: colors[i % 3],
      size: 0.3 + Math.random() * 0.5,
      speed: 0.5 + Math.random() * 1,
      floatOffset: Math.random() * Math.PI * 2,
    }))
  }, [])

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} color="#8b5cf6" intensity={0.5} />
      <pointLight position={[-10, -10, 5]} color="#06b6d4" intensity={0.3} />

      {ghosts.map((ghost, i) => (
        <Ghost key={i} {...ghost} />
      ))}

      <Particles />
    </>
  )
}

export default function GhostBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <Scene />
      </Canvas>
    </div>
  )
}
