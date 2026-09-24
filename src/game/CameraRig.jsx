import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const CAMERA_DISTANCE = 6.5
const CAMERA_HEIGHT = 3.2
const desiredPosition = new THREE.Vector3()
const lookTarget = new THREE.Vector3()

// Chase camera: stays behind the kart relative to its current heading
// (not a fixed world-space offset), so it swings around as the kart
// turns, like a typical arcade racer camera.
export function CameraRig({ targetRef, headingRef }) {
  const { camera } = useThree()

  useFrame((_, delta) => {
    const target = targetRef.current
    const heading = headingRef.current

    desiredPosition.set(
      target.x - Math.sin(heading) * CAMERA_DISTANCE,
      target.y + CAMERA_HEIGHT,
      target.z - Math.cos(heading) * CAMERA_DISTANCE
    )
    camera.position.lerp(desiredPosition, Math.min(1, delta * 4))

    lookTarget.set(target.x, target.y + 0.6, target.z)
    camera.lookAt(lookTarget)
  })

  return null
}
