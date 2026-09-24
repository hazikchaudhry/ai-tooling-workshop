import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PALETTE } from './palette'

export function Orb({ id, position }) {
  const bobRef = useRef()

  useFrame((state) => {
    if (!bobRef.current) return
    const t = state.clock.elapsedTime
    bobRef.current.position.y = 0.9 + Math.sin(t * 2 + id) * 0.15
    bobRef.current.rotation.y = t * 1.4
    bobRef.current.rotation.x = t * 0.7
  })

  return (
    <group position={position}>
      <group ref={bobRef}>
        <mesh castShadow>
          <icosahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial
            color={PALETTE.accent.orbGlow}
            emissive={PALETTE.accent.orbGlow}
            emissiveIntensity={1.8}
            flatShading
          />
        </mesh>
        <pointLight color={PALETTE.accent.orbGlow} intensity={1.4} distance={3.5} />
      </group>
    </group>
  )
}
