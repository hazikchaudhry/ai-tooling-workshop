import { PALETTE } from '../config/palette'
import { BEACH_ANGLE, BEACH_RADIUS } from '../config/trackLayout'

const FROND_COUNT = 5

function PalmTree({ position, tilt = 0.15, scale = 1 }) {
  return (
    <group position={position} scale={scale} rotation={[0, 0, tilt]}>
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 2, 6]} />
        <meshStandardMaterial color={PALETTE.object.trunk} flatShading />
      </mesh>
      <group position={[0, 2, 0]} rotation={[0, 0, -tilt]}>
        {Array.from({ length: FROND_COUNT }, (_, i) => (
          <mesh
            key={i}
            position={[0, 0.1, 0]}
            rotation={[0.9, (i / FROND_COUNT) * Math.PI * 2, 0]}
            castShadow
          >
            <coneGeometry args={[0.18, 1.1, 4]} />
            <meshStandardMaterial color={PALETTE.object.foliage} flatShading />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Umbrella({ position, color = PALETTE.accent.umbrella }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 1.4, 6]} />
        <meshStandardMaterial color={PALETTE.object.rock} flatShading />
      </mesh>
      <mesh position={[0, 1.3, 0]} castShadow>
        <coneGeometry args={[0.75, 0.5, 8]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
    </group>
  )
}

function Towel({ position, rotationY = 0, color = PALETTE.accent.kartTrim }) {
  return (
    <mesh position={position} rotation={[0, rotationY, 0]}>
      <boxGeometry args={[0.9, 0.03, 0.5]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  )
}

function BeachBall({ position }) {
  return (
    <mesh position={position} castShadow>
      <icosahedronGeometry args={[0.22, 0]} />
      <meshStandardMaterial color={PALETTE.accent.checkerLight} flatShading />
    </mesh>
  )
}

function DriftwoodLog({ position, rotationY = 0 }) {
  return (
    <mesh position={position} rotation={[0, rotationY, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.09, 0.12, 1.4, 6]} />
      <meshStandardMaterial color={PALETTE.object.trunk} flatShading />
    </mesh>
  )
}

function TikiTorch({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 1.1, 6]} />
        <meshStandardMaterial color={PALETTE.object.trunk} flatShading />
      </mesh>
      <mesh position={[0, 1.15, 0]} castShadow>
        <coneGeometry args={[0.12, 0.22, 6]} />
        <meshStandardMaterial color={PALETTE.accent.burst} flatShading />
      </mesh>
    </group>
  )
}

const KART_WHEEL_OFFSETS = [
  [-0.48, 0.55],
  [0.48, 0.55],
  [-0.48, -0.55],
  [0.48, -0.55],
]

// A small, static stand-in for the player's kart - parked on the sand
// rather than driveable, so it reads like a couple of beachgoers rode
// in and left their karts by the umbrellas.
function ParkedKart({ position, rotationY = 0, bodyColor }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={0.85}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[0.85, 0.32, 1.55]} />
        <meshStandardMaterial color={bodyColor} flatShading />
      </mesh>
      <mesh position={[0, 0.55, -0.05]} castShadow>
        <boxGeometry args={[0.6, 0.28, 0.7]} />
        <meshStandardMaterial color={PALETTE.accent.kartTrim} flatShading />
      </mesh>
      {KART_WHEEL_OFFSETS.map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.22, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.24, 8]} />
          <meshStandardMaterial color={PALETTE.object.tire} flatShading />
        </mesh>
      ))}
    </group>
  )
}

// The island and track grew a lot bigger than the props below were
// originally sized for, which made the whole area read as tiny,
// hard-to-spot clutter. Scaling the group up keeps every prop's size
// and spacing proportional to each other while matching the bigger
// island.
const BEACH_SCALE = 1.45

// Positioned at the shoreline point opposite the start line, rotated
// so local +Z points radially outward (toward the water) and local
// +X runs along the shore - lets every prop below be placed with
// plain, small local offsets spread along the coastline instead of
// one tight cluster.
export function Beach() {
  const position = [
    Math.sin(BEACH_ANGLE) * BEACH_RADIUS,
    0,
    Math.cos(BEACH_ANGLE) * BEACH_RADIUS,
  ]

  return (
    <group position={position} rotation={[0, BEACH_ANGLE, 0]}>
      <group scale={BEACH_SCALE}>
        {/* Lounge spot: palms, umbrella, towel, ball, well clear of the umbrella canopy */}
        <PalmTree position={[-4.6, 0, -0.3]} tilt={0.2} />
        <PalmTree position={[-3.6, 0, 0.7]} tilt={-0.12} scale={0.85} />
        <Umbrella position={[-2.9, 0, 0.1]} />
        <Towel position={[-2.5, 0.02, 0.65]} rotationY={0.3} />
        <BeachBall position={[-2.0, 0.22, 0.85]} />
        <TikiTorch position={[-4.9, 0, 1.0]} />

        {/* Second lounge spot, spaced apart so nothing overlaps */}
        <PalmTree position={[1.8, 0, -0.4]} tilt={-0.18} scale={1.05} />
        <Umbrella position={[0.8, 0, 0.25]} color={PALETTE.accent.checkerLight} />
        <Towel position={[0.35, 0.02, 0.7]} rotationY={-0.4} color={PALETTE.accent.orbGlow} />
        <DriftwoodLog position={[1.5, 0.1, 1.0]} rotationY={0.5} />

        {/* Kart valet, set apart from the lounge area and off the line the
            player drives in on, so the player's own kart doesn't end up
            parked on top of these and hiding them */}
        <TikiTorch position={[3.6, 0, -0.7]} />
        <ParkedKart position={[4.4, 0, -1.1]} rotationY={2.4} bodyColor={PALETTE.accent.kartBlue} />
        <ParkedKart position={[5.5, 0, -1.35]} rotationY={2.0} bodyColor={PALETTE.accent.kartYellow} />
      </group>
    </group>
  )
}
