---
name: color-palette
description: Rules for this project's low-poly color palette in src/game/config/palette.js. Load whenever the user asks to recolor, retheme, or reskin anything in the Isle of Orbs scene - the kart, the island, the track, the beach, all of it.
---

# Color palette

`src/game/config/palette.js` is the single source of truth for every color in
the scene, grouped into three categories:

- `background` - sky, fog
- `object` - terrain and props (grass, sand, water, kart body, ...)
- `accent` - glow/emissive/trim details (orb glow, kart trim, ...)

Every component imports its colors from `PALETTE` there instead of
hardcoding a hex value, which is what makes a full reskin possible by
editing one file.

Rules:
- Never hardcode a hex color in a component - always import `PALETTE`
  and reference a key.
- Keep materials flat-shaded; accent colors are the only ones used as
  `emissive`.
- When reskinning a theme, keep every existing key name unchanged and
  only change the hex values, so every component that already imports
  them updates for free - no other file needs to change.
- The kart specifically pulls from `object.kartBody`, `accent.kartTrim`,
  `accent.kartBlue`, and `accent.kartYellow` (the last two are shared
  with the decorative parked karts at the beach, and `kartTrim` is also
  reused by the track kerbs).
