import * as THREE from 'three'

// Control points (angle as a fraction of a full turn, radius from the
// island's center) sketching a curvy circuit - a start/finish straight,
// a hairpin, a wide sweeper, and a chicane - instead of a straight-sided
// polygon. 'centripetal' keeps the spline from looping or overshooting
// where the radius jumps between points. Track, StartLine, Beach, and
// the kart's spawn point all derive their numbers from the resulting
// curve so they stay lined up as any of these points change.
const CONTROL_POINTS = [
  { turn: 0.0, radius: 15.4 },
  { turn: 0.09, radius: 15.8 },
  { turn: 0.18, radius: 13.2 },
  { turn: 0.26, radius: 8.2 },
  { turn: 0.34, radius: 11.0 },
  { turn: 0.44, radius: 16.3 },
  { turn: 0.53, radius: 11.8 },
  { turn: 0.6, radius: 15.1 },
  { turn: 0.7, radius: 10.1 },
  { turn: 0.8, radius: 13.7 },
  { turn: 0.9, radius: 16.1 },
  { turn: 0.96, radius: 15.6 },
]

function controlPoint({ turn, radius }) {
  const angle = turn * Math.PI * 2
  return new THREE.Vector3(Math.sin(angle) * radius, 0, Math.cos(angle) * radius)
}

const CENTERLINE = new THREE.CatmullRomCurve3(
  CONTROL_POINTS.map(controlPoint),
  true,
  'centripetal'
)

export const TRACK_SAMPLES = 260
export const TRACK_WIDTH = 2.8
export const TRACK_Y = 0.6
export const BEACH_RADIUS = 18.4

const SAMPLE_POINTS = CENTERLINE.getSpacedPoints(TRACK_SAMPLES).slice(0, TRACK_SAMPLES)

function wrap(index) {
  return ((index % TRACK_SAMPLES) + TRACK_SAMPLES) % TRACK_SAMPLES
}

export function trackVertex(index) {
  const p = SAMPLE_POINTS[wrap(index)]
  return [p.x, 0, p.z]
}

// Smoothly widens and narrows the ribbon around the loop (two offset
// sine waves) so straights read wider than hairpins - purely a visual
// variety pass, the kart isn't clipped to the road.
export function trackWidthAt(index) {
  const t = wrap(index) / TRACK_SAMPLES
  const wave =
    Math.sin(t * Math.PI * 2 * 2 + 0.6) * 0.7 + Math.sin(t * Math.PI * 2 * 5 - 1.1) * 0.3
  return TRACK_WIDTH + wave
}

export function trackSegment(index) {
  const start = trackVertex(index)
  const end = trackVertex(index + 1)
  const dx = end[0] - start[0]
  const dz = end[2] - start[2]
  return {
    start,
    end,
    mid: [(start[0] + end[0]) / 2, 0, (start[2] + end[2]) / 2],
    length: Math.hypot(dx, dz),
    heading: Math.atan2(dx, dz),
    width: trackWidthAt(index),
  }
}

export const START_SEGMENT_INDEX = 0
export const START_SEGMENT = trackSegment(START_SEGMENT_INDEX)
export const START_ANGLE = Math.atan2(START_SEGMENT.mid[0], START_SEGMENT.mid[2])

// Opposite point on the island from the start line.
export const BEACH_ANGLE = START_ANGLE + Math.PI

// Unit vector pointing "left" of the direction of travel at this sample
// - used to offset kerbs, barriers and grandstands out from the road
// edge instead of duplicating this tangent math at every call site.
export function trackNormalAt(index) {
  const prev = trackVertex(index - 1)
  const next = trackVertex(index + 1)
  const tangentX = next[0] - prev[0]
  const tangentZ = next[2] - prev[2]
  const length = Math.hypot(tangentX, tangentZ) || 1
  return [-tangentZ / length, tangentX / length]
}

// +1 where the road curves toward the left (the normal side) here, -1
// where it curves right - so barriers/stands can find the outside of a
// corner without anyone having to eyeball and hardcode which side that is.
export function trackCurvatureSign(index) {
  const spread = 4
  const before = trackSegment(index - spread).heading
  const after = trackSegment(index + spread).heading
  const twoPi = Math.PI * 2
  const diff = (((after - before + Math.PI) % twoPi) + twoPi) % twoPi - Math.PI
  return diff >= 0 ? 1 : -1
}

// Turn (0-1 fraction of a lap, matching CONTROL_POINTS) to a sample index.
export function sampleIndexForTurn(turn) {
  return Math.round(turn * TRACK_SAMPLES)
}
