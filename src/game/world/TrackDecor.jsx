import { useMemo } from 'react'
import * as THREE from 'three'
import { PALETTE } from '../config/palette'
import {
  TRACK_SAMPLES,
  TRACK_Y,
  sampleIndexForTurn,
  trackCurvatureSign,
  trackNormalAt,
  trackSegment,
  trackVertex,
  trackWidthAt,
} from '../config/trackLayout'

// Shared bleacher-block shape used both at the start line and at the
// corners below - a group placed at a track point and rotated to its
// heading, so `side` (+1/-1) is just "which way is outward" from there.
export function Grandstand({ side, halfWidth }) {
  const base = halfWidth + 0.6
  const tiers = [
    { out: 0, y: 0.15, depth: 1.6 },
    { out: 0.5, y: 0.45, depth: 1.4 },
    { out: 1.0, y: 0.75, depth: 1.2 },
  ]
  return (
    <group>
      {tiers.map((tier, i) => (
        <mesh key={i} position={[side * (base + tier.out), tier.y, 0]} castShadow>
          <boxGeometry args={[0.8, 0.3, tier.depth]} />
          <meshStandardMaterial color={PALETTE.object.rock} flatShading />
        </mesh>
      ))}
      <mesh position={[side * base, 0.32, tiers[0].depth / 2 + 0.02]} castShadow>
        <boxGeometry args={[0.85, 0.06, 0.1]} />
        <meshStandardMaterial color={PALETTE.accent.kartTrim} flatShading />
      </mesh>
    </group>
  )
}

// Red/white kerb along both edges of the whole track, like F1 curbing.
// Built as one continuous ribbon per edge (same technique as the road
// itself) instead of a row of overlapping boxes - overlapping coplanar
// boxes were the cause of the flickering (z-fighting) at every seam.
// Each stripe gets its own, non-shared pair of vertices at its
// boundary so the color changes stay sharp instead of blending.
const KERB_STEP = 4
const KERB_WIDTH = 0.5
const KERB_RED = new THREE.Color(PALETTE.accent.kartTrim)
const KERB_WHITE = new THREE.Color(PALETTE.accent.checkerLight)

function buildKerbGeometry(side) {
  const positions = []
  const colors = []
  const indices = []
  let vertCount = 0

  for (let stripe = 0; stripe < TRACK_SAMPLES; stripe += KERB_STEP) {
    const color = (stripe / KERB_STEP) % 2 === 0 ? KERB_RED : KERB_WHITE
    for (let s = 0; s <= KERB_STEP; s++) {
      const i = stripe + s
      const mid = trackVertex(i)
      const [nx, nz] = trackNormalAt(i)
      const halfWidth = trackWidthAt(i) / 2
      const innerOffset = halfWidth * side
      const outerOffset = (halfWidth + KERB_WIDTH) * side

      positions.push(mid[0] + nx * innerOffset, TRACK_Y + 0.02, mid[2] + nz * innerOffset)
      colors.push(color.r, color.g, color.b)
      positions.push(mid[0] + nx * outerOffset, TRACK_Y + 0.02, mid[2] + nz * outerOffset)
      colors.push(color.r, color.g, color.b)

      if (s < KERB_STEP) {
        const a = vertCount
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
      }
      vertCount += 2
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

function Kerbs() {
  const leftGeometry = useMemo(() => buildKerbGeometry(1), [])
  const rightGeometry = useMemo(() => buildKerbGeometry(-1), [])

  return (
    <group>
      <mesh geometry={leftGeometry} receiveShadow>
        <meshStandardMaterial vertexColors flatShading side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={rightGeometry} receiveShadow>
        <meshStandardMaterial vertexColors flatShading side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// A couple of grandstands overlooking corners.
const GRANDSTAND_TURNS = [0.44, 0.8]

function CornerGrandstands() {
  const stands = useMemo(
    () =>
      GRANDSTAND_TURNS.map((turn) => {
        const i = sampleIndexForTurn(turn)
        const mid = trackVertex(i)
        return {
          key: turn,
          position: [mid[0], 0, mid[2]],
          heading: trackSegment(i).heading,
          side: -trackCurvatureSign(i),
          halfWidth: trackWidthAt(i) / 2,
        }
      }),
    []
  )

  return (
    <group>
      {stands.map((stand) => (
        <group key={stand.key} position={stand.position} rotation={[0, stand.heading, 0]}>
          <Grandstand side={stand.side} halfWidth={stand.halfWidth} />
        </group>
      ))}
    </group>
  )
}

export function TrackDecor() {
  return (
    <>
      <Kerbs />
      <CornerGrandstands />
    </>
  )
}
