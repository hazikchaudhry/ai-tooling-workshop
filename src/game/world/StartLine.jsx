import { PALETTE } from './palette'
import { START_SEGMENT, TRACK_Y } from './trackLayout'
import { Grandstand } from './TrackDecor'

const HALF_TRACK = START_SEGMENT.width / 2
const CHECKER_COUNT = 6
const CHECKER_SIZE = START_SEGMENT.width / CHECKER_COUNT
const POLE_HEIGHT = 2.4

// Everything here lives inside one group positioned at the start
// segment's midpoint and rotated to its heading, so local +Z runs
// along the track direction and local +X runs across it (radially,
// since the track is a loop) - every child below just places itself
// relative to that.

function CheckerLine() {
  return (
    <group position={[0, TRACK_Y + 0.06, 0]}>
      {Array.from({ length: CHECKER_COUNT }, (_, i) => {
        const offset = (i - (CHECKER_COUNT - 1) / 2) * CHECKER_SIZE
        const color = i % 2 === 0 ? PALETTE.accent.checkerDark : PALETTE.accent.checkerLight
        return (
          <mesh key={i} position={[offset, 0, 0]}>
            <boxGeometry args={[CHECKER_SIZE, 0.02, 0.4]} />
            <meshStandardMaterial color={color} flatShading />
          </mesh>
        )
      })}
    </group>
  )
}

function StartBanner() {
  const poleX = HALF_TRACK + 0.3
  return (
    <group>
      {[-poleX, poleX].map((x) => (
        <mesh key={x} position={[x, POLE_HEIGHT / 2, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, POLE_HEIGHT, 6]} />
          <meshStandardMaterial color={PALETTE.object.rock} flatShading />
        </mesh>
      ))}
      <mesh position={[0, POLE_HEIGHT, 0]} castShadow>
        <boxGeometry args={[poleX * 2 + 0.4, 0.5, 0.15]} />
        <meshStandardMaterial color={PALETTE.accent.kartTrim} flatShading />
      </mesh>
    </group>
  )
}

export function StartLine() {
  return (
    <group
      position={[START_SEGMENT.mid[0], 0, START_SEGMENT.mid[2]]}
      rotation={[0, START_SEGMENT.heading, 0]}
    >
      <CheckerLine />
      <StartBanner />
      <Grandstand side={-1} halfWidth={HALF_TRACK} />
      <Grandstand side={1} halfWidth={HALF_TRACK} />
    </group>
  )
}
