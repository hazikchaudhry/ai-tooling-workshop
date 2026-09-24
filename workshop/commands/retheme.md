---
description: Reskin the whole game's color palette to a given theme
agent: build
---

Reskin the Isle of Orbs scene to match this theme: $ARGUMENTS

1. Load the color-palette skill first if it hasn't already loaded.
2. Rewrite the color values in `src/game/config/palette.js` to fit the theme,
   keeping every existing key name exactly as it is - only the hex
   values change, so every component that already imports them updates
   automatically with no other file edits.
3. Don't touch geometry, layout, or any other file - only
   `palette.js` should change.
4. Reply with a one-line summary of which keys you changed and to what.
