import { useEffect, useRef } from 'react'

const KEY_MAP = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'backward',
  ArrowDown: 'backward',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
}

// Tracks WASD / arrow key state in a ref so movement can be read inside
// useFrame without triggering React re-renders every keystroke.
export function useKeyboardControls() {
  const controls = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  })

  useEffect(() => {
    const handleKeyDown = (event) => {
      const action = KEY_MAP[event.code]
      if (action) controls.current[action] = true
    }
    const handleKeyUp = (event) => {
      const action = KEY_MAP[event.code]
      if (action) controls.current[action] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return controls
}
