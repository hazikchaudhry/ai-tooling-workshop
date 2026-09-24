import { useMemo } from 'react'
import { PALETTE } from '../config/palette'
import { TRACK_SAMPLES, trackVertex, trackWidthAt } from '../config/trackLayout'

// Deterministic pseudo-random so decoration layout is stable across renders.
function seededRandom(seed) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

// The track is a curvy loop, not a simple circle, so a random point at
// a "safe" radius from the island's center can still land right on the
// road. Nudge it away from the nearest track sample until it clears the
// road by a margin, instead of just checking distance from the center.
// The margin has to clear the kerb (0.5 beyond the road edge, see
// TrackDecor) plus a tree's own foliage radius (up to ~0.9), not just
// the bare road - trees were ending up planted right on the kerb.
const TRACK_CLEARANCE = 2.2

function keepClearOfTrack(x, z) {
  let px = x
  let pz = z
  for (let attempt = 0; attempt < 20; attempt++) {
    let nearestDist = Infinity
    let nearestWidth = 0
    let nearestX = 0
    let nearestZ = 0
    for (let i = 0; i < TRACK_SAMPLES; i++) {
      const [tx, , tz] = trackVertex(i)
      const dist = Math.hypot(px - tx, pz - tz)
      if (dist < nearestDist) {
        nearestDist = dist
        nearestWidth = trackWidthAt(i)
        nearestX = tx
        nearestZ = tz
      }
    }
    const clearance = nearestDist - nearestWidth / 2
    if (clearance >= TRACK_CLEARANCE) return [px, pz]

    const dx = px - nearestX
    const dz = pz - nearestZ
    const length = Math.hypot(dx, dz) || 1
    const pushDistance = TRACK_CLEARANCE - clearance + 0.3
    px += (dx / length) * pushDistance
    pz += (dz / length) * pushDistance
  }
  return [px, pz]
}

function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 0.8, 6]} />
        <meshStandardMaterial color={PALETTE.object.trunk} flatShading />
      </mesh>
      <mesh position={[0, 1.3, 0]} castShadow>
        <coneGeometry args={[0.7, 1.4, 6]} />
        <meshStandardMaterial color={PALETTE.object.foliage} flatShading />
      </mesh>
      <mesh position={[0, 1.9, 0]} castShadow>
        <coneGeometry args={[0.5, 1, 6]} />
        <meshStandardMaterial color={PALETTE.object.foliage} flatShading />
      </mesh>
    </group>
  )
}

function Rock({ position, scale = 1, rotation = 0 }) {
  return (
    <mesh position={position} scale={scale} rotation={[0, rotation, 0]} castShadow>
      <boxGeometry args={[0.6, 0.5, 0.6]} />
      <meshStandardMaterial color={PALETTE.object.rock} flatShading />
    </mesh>
  )
}

export const ISLAND_RADIUS = 20.5

export function Island() {
  const decorations = useMemo(() => {
    const rand = seededRandom(42)
    // Kept inside the track loop's inner edge (~8.2) so the forest
    // doesn't clutter the track, grandstand, or beach.
    const trees = Array.from({ length: 14 }, (_, i) => {
      const angle = (i / 14) * Math.PI * 2 + rand() * 0.5
      const radius = 3.2 + rand() * 7.7
      const [x, z] = keepClearOfTrack(Math.cos(angle) * radius, Math.sin(angle) * radius)
      return {
        key: `tree-${i}`,
        position: [x, 0, z],
        scale: 0.8 + rand() * 0.5,
      }
    })
    const rocks = Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2 + rand() * 0.8
      const radius = 2.9 + rand() * 8
      const [x, z] = keepClearOfTrack(Math.cos(angle) * radius, Math.sin(angle) * radius)
      return {
        key: `rock-${i}`,
        position: [x, 0.2, z],
        scale: 0.5 + rand() * 0.7,
        rotation: rand() * Math.PI,
      }
    })
    return { trees, rocks }
  }, [])

  return (
    <group>
      {/* water */}
      <mesh position={[0, -0.55, 0]} receiveShadow>
        <cylinderGeometry args={[60, 60, 0.6, 8]} />
        <meshStandardMaterial color={PALETTE.object.water} flatShading />
      </mesh>

      {/* sand base */}
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <cylinderGeometry args={[ISLAND_RADIUS + 1, ISLAND_RADIUS + 2, 0.9, 9]} />
        <meshStandardMaterial color={PALETTE.object.sand} flatShading />
      </mesh>

      {/* grass top */}
      <mesh position={[0, 0.28, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[ISLAND_RADIUS, ISLAND_RADIUS + 0.6, 0.55, 9]} />
        <meshStandardMaterial color={PALETTE.object.grass} flatShading />
      </mesh>

      {decorations.trees.map((tree) => (
        <Tree key={tree.key} position={tree.position} scale={tree.scale} />
      ))}
      {decorations.rocks.map((rock) => (
        <Rock
          key={rock.key}
          position={rock.position}
          scale={rock.scale}
          rotation={rock.rotation}
        />
      ))}
    </group>
  )
}
