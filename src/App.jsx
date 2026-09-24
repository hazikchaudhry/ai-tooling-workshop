import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene } from './game/Scene'
import { HUD } from './game/HUD'

const TOTAL_ORBS = 6

export default function App() {
  const [collected, setCollected] = useState(0)

  return (
    <div className="relative h-screen w-screen">
      <Canvas shadows="percentage" camera={{ position: [0, 6, 8], fov: 50 }}>
        <Scene onCollect={() => setCollected((count) => count + 1)} />
      </Canvas>
      <HUD collected={collected} total={TOTAL_ORBS} />
    </div>
  )
}
