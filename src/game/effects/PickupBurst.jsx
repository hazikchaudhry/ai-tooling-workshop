import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PALETTE } from '../config/palette'

const PARTICLE_COUNT = 10
const DURATION = 0.7

// One-shot low-poly burst: small cubes fly outward, arc down, and shrink
// to nothing. Calls onDone once the animation finishes so the parent can
// drop this instance from its list.
export function PickupBurst({ position, onDone }) {
  const groupRef = useRef()
  const startTimeRef = useRef(null)
  const doneRef = useRef(false)

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const angle = (i / PARTICLE_COUNT) * Math.PI * 2
        const upBias = 0.6 + Math.random() * 0.8
        return {
          dir: new THREE.Vector3(Math.cos(angle), upBias, Math.sin(angle)).normalize(),
          speed: 1.5 + Math.random() * 1.5,
        }
      }),
    []
  )

  useFrame((state) => {
    if (doneRef.current) return
    if (startTimeRef.current === null) startTimeRef.current = state.clock.elapsedTime
    const elapsed = state.clock.elapsedTime - startTimeRef.current
    const progress = Math.min(elapsed / DURATION, 1)

    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const particle = particles[i]
        const dist = particle.speed * progress
        child.position.set(
          particle.dir.x * dist,
          particle.dir.y * dist - progress * progress * 0.8,
          particle.dir.z * dist
        )
        child.scale.setScalar(Math.max(0, 1 - progress))
      })
    }

    if (progress >= 1) {
      doneRef.current = true
      onDone()
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {particles.map((_, i) => (
        <mesh key={i}>
          <boxGeometry args={[0.14, 0.14, 0.14]} />
          <meshStandardMaterial
            color={PALETTE.accent.burst}
            emissive={PALETTE.accent.burst}
            emissiveIntensity={2}
            flatShading
          />
        </mesh>
      ))}
    </group>
  )
}
