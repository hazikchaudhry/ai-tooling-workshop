import { useCallback, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Island } from './world/Island'
import { Track } from './world/Track'
import { TrackDecor } from './world/TrackDecor'
import { StartLine } from './world/StartLine'
import { Beach } from './world/Beach'
import { Kart } from './objects/Kart'
import { Orb } from './objects/Orb'
import { PickupBurst } from './effects/PickupBurst'
import { CameraRig } from './camera/CameraRig'
import { useKeyboardControls } from '../hooks/useKeyboardControls'
import { PALETTE } from './config/palette'
import { START_SEGMENT, TRACK_Y } from './config/trackLayout'

const ORB_POSITIONS = [
  [7.2, 0, -9.6],
  [-9.6, 0, -7.2],
  [12, 0, 7.2],
  [-13.2, 0, 9.6],
  [1.2, 0, -16.8],
  [15.6, 0, 3.6],
]

const PICKUP_RADIUS = 1

// Spawn a little behind the checkered line, facing down the track. The
// track surface sits at TRACK_Y (not ground level 0), so the kart has
// to spawn there too or it renders half-buried under the road.
const SPAWN_SETBACK = 1.5
const SPAWN_POSITION = new THREE.Vector3(
  START_SEGMENT.mid[0] - Math.sin(START_SEGMENT.heading) * SPAWN_SETBACK,
  TRACK_Y,
  START_SEGMENT.mid[2] - Math.cos(START_SEGMENT.heading) * SPAWN_SETBACK
)

export function Scene({ onCollect }) {
  const controlsRef = useKeyboardControls()
  const kartPosition = useRef(SPAWN_POSITION.clone())
  const kartHeading = useRef(START_SEGMENT.heading)

  const [orbs, setOrbs] = useState(() =>
    ORB_POSITIONS.map((position, id) => ({ id, position }))
  )
  const [bursts, setBursts] = useState([])

  useFrame(() => {
    if (orbs.length === 0) return
    const kart = kartPosition.current
    for (const orb of orbs) {
      const dx = kart.x - orb.position[0]
      const dz = kart.z - orb.position[2]
      if (Math.hypot(dx, dz) < PICKUP_RADIUS) {
        setOrbs((prev) => prev.filter((o) => o.id !== orb.id))
        setBursts((prev) => [...prev, { id: orb.id, position: orb.position }])
        onCollect()
        break
      }
    }
  })

  const removeBurst = useCallback((id) => {
    setBursts((prev) => prev.filter((burst) => burst.id !== id))
  }, [])

  return (
    <>
      <color attach="background" args={[PALETTE.background.sky]} />
      <fog attach="fog" args={[PALETTE.background.fog, 34, 100]} />

      <ambientLight intensity={0.75} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.3}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      <Island />
      <Track />
      <TrackDecor />
      <StartLine />
      <Beach />
      <Kart
        controlsRef={controlsRef}
        positionRef={kartPosition}
        headingRef={kartHeading}
        spawnPosition={SPAWN_POSITION}
      />

      {orbs.map((orb) => (
        <Orb key={orb.id} id={orb.id} position={orb.position} />
      ))}

      {bursts.map((burst) => (
        <PickupBurst
          key={burst.id}
          position={burst.position}
          onDone={() => removeBurst(burst.id)}
        />
      ))}

      <CameraRig targetRef={kartPosition} headingRef={kartHeading} />
    </>
  )
}
