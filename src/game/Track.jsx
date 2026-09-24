import { useMemo } from 'react'
import * as THREE from 'three'
import { PALETTE } from './palette'
import { TRACK_SAMPLES, TRACK_Y, trackNormalAt, trackVertex, trackWidthAt } from './trackLayout'

// Builds one continuous ribbon mesh that follows the track's spline,
// widening and narrowing per trackWidthAt, rather than a ring of flat
// boxes along polygon edges - this is what actually reads as a curvy
// track instead of a straight-sided loop.
export function Track() {
  const geometry = useMemo(() => {
    const positions = []
    const indices = []

    for (let i = 0; i <= TRACK_SAMPLES; i++) {
      const curr = trackVertex(i)
      const [normalX, normalZ] = trackNormalAt(i)
      const halfWidth = trackWidthAt(i) / 2

      positions.push(
        curr[0] + normalX * halfWidth,
        TRACK_Y,
        curr[2] + normalZ * halfWidth,
        curr[0] - normalX * halfWidth,
        TRACK_Y,
        curr[2] - normalZ * halfWidth
      )

      if (i < TRACK_SAMPLES) {
        const a = i * 2
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial color={PALETTE.object.asphalt} flatShading side={THREE.DoubleSide} />
    </mesh>
  )
}
