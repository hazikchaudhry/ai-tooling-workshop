import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PALETTE } from './palette'
import { ISLAND_RADIUS } from './Island'

const ACCELERATION = 7
const BRAKE_ACCELERATION = 10
const FRICTION = 3
const MAX_SPEED = 8
const MAX_REVERSE_SPEED = 3
const TURN_SPEED = 2

const WHEEL_OFFSETS = [
  [-0.48, 0.55],
  [0.48, 0.55],
  [-0.48, -0.55],
  [0.48, -0.55],
]

// Simple arcade car controls: forward/back adjust speed with
// acceleration + friction, left/right steer the heading (scaled by
// current speed so the kart can't spin in place). Position and
// heading are written into shared refs each frame so the camera and
// orb-pickup checks in Scene can read them without extra re-renders.
export function Kart({ controlsRef, positionRef, headingRef, spawnPosition }) {
  const groupRef = useRef()
  const speedRef = useRef(0)

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return
    const controls = controlsRef.current

    if (controls.forward) {
      speedRef.current += ACCELERATION * delta 
    } else if (controls.backward) {
      speedRef.current -= BRAKE_ACCELERATION * delta
    } else if (speedRef.current > 0) {
      speedRef.current = Math.max(0, speedRef.current - FRICTION * delta)
    } else if (speedRef.current < 0) {
      speedRef.current = Math.min(0, speedRef.current + FRICTION * delta)
    }
    speedRef.current = Math.min(MAX_SPEED, Math.max(-MAX_REVERSE_SPEED, speedRef.current))

    const steerInput = (controls.left ? 1 : 0) - (controls.right ? 1 : 0)
    if (steerInput !== 0 && Math.abs(speedRef.current) > 0.05) {
      const speedFraction = Math.min(1, Math.abs(speedRef.current) / MAX_SPEED + 0.3)
      const direction = Math.sign(speedRef.current)
      headingRef.current += steerInput * TURN_SPEED * delta * direction * speedFraction
    }

    group.rotation.y = headingRef.current
    group.position.x += Math.sin(headingRef.current) * speedRef.current * delta
    group.position.z += Math.cos(headingRef.current) * speedRef.current * delta

    const distanceFromCenter = Math.hypot(group.position.x, group.position.z)
    if (distanceFromCenter > ISLAND_RADIUS - 0.5) {
      const scale = (ISLAND_RADIUS - 0.5) / distanceFromCenter
      group.position.x *= scale
      group.position.z *= scale
      speedRef.current *= 0.4
    }

    positionRef.current.copy(group.position)
  })

  return (
    <group ref={groupRef} position={[spawnPosition.x, spawnPosition.y, spawnPosition.z]}>
      {/* The body/trim/wheels are modeled facing the opposite way from
          the heading convention used by the movement code above (local
          +Z). Flipping the visual model 180° here, instead of touching
          the movement or camera math, lines the model up with the
          direction it actually drives without risking that math. */}
      <group rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 0.28, 0]} castShadow>
          <boxGeometry args={[0.85, 0.32, 1.55]} />
          <meshStandardMaterial color={PALETTE.object.kartBody} flatShading />
        </mesh>
        <mesh position={[0, 0.55, -0.05]} castShadow>
          <boxGeometry args={[0.6, 0.28, 0.7]} />
          <meshStandardMaterial color={PALETTE.accent.kartTrim} flatShading />
        </mesh>
        <mesh position={[0, 0.55, 0.75]} castShadow>
          <boxGeometry args={[0.9, 0.08, 0.12]} />
          <meshStandardMaterial color={PALETTE.accent.kartTrim} flatShading />
        </mesh>
        {WHEEL_OFFSETS.map(([x, z]) => (
          <mesh key={`${x}-${z}`} position={[x, 0.22, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.24, 8]} />
            <meshStandardMaterial color={PALETTE.object.tire} flatShading />
          </mesh>
        ))}
      </group>
    </group>
  )
}
