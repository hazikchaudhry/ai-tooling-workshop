// Single source of truth for the scene's low-poly color palette.
// Grouped by role so a future /retheme command can swap whole
// categories (background / object / accent) instead of guessing
// which hex belongs to what.
export const PALETTE = {
  background: {
    sky: '#a8dcf0',
    fog: '#bfe6ff',
  },
  object: {
    water: '#3aa0d1',
    sand: '#e3c288',
    grass: '#5cb85c',
    rock: '#8d8d99',
    trunk: '#7a5230',
    foliage: '#3f8f5f',
    kartBody: '#e8e8f0',
    asphalt: '#45454d',
    tire: '#2b2b30',
  },
  accent: {
    kartTrim: '#ff6b6b',
    kartBlue: '#5ec8ff',
    kartYellow: '#ffd23f',
    orbGlow: '#4be3d9',
    burst: '#fff3b0',
    checkerLight: '#f5f5f0',
    checkerDark: '#202024',
    umbrella: '#ff9d5c',
  },
}
