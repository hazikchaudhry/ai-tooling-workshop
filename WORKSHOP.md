# Workshop — Isle of Orbs

Everything for the AI Tooling workshop, in one file: the game setup,
the color-palette convention the recolor demos rely on, getting
OpenCode running, and the full feature tour — what to say, how it's
built in this repo, and the exact command to run, in the order you're
presenting it. Every command and every "confirmed" note below was
actually run against this repo's free zero-config model before being
written down.

This folder is the **starting state** — no `opencode.json`, no
`.opencode/`. Every file in §2–3 below gets created live, from
scratch, during the session; that's the point, the payoff is watching
each one come alive as you write it, not inspecting one that already
works. A fully built, pre-tested copy of everything (including the
final `opencode.json` and `.opencode/`) lives in the sibling
`ai-tooling-workshop-completed/` folder — don't open it in front of
the room, but it's there to copy-paste from if a live edit goes
sideways, or to diff against if something isn't behaving.

## 0. Before you start — run the game (5 min)

```bash
npm install
npm run dev
```

Open the game, confirm it loads, drive around once. Then skim
`src/game/`:

- `trackLayout.js` — the track's spline, width, and all the derived
  numbers (`trackVertex`, `trackWidthAt`, `BEACH_ANGLE`, …) everything
  else is built from
- `Island.jsx` — the island terrain plus its `Tree`/`Rock` decorations
- `Kart.jsx` — the player kart, its controls, and its colors
- `Beach.jsx`, `TrackDecor.jsx`, `StartLine.jsx` — other scene pieces,
  same conventions
- `palette.js` — every color in the game. No component hardcodes a hex
  value; they all import from here.

## 1. The color palette convention (5 min)

`src/game/palette.js` is the single source of truth for every color
in the scene, grouped into three categories:

- `background` — sky, fog
- `object` — terrain and props (grass, sand, water, kart body, …)
- `accent` — glow/emissive/trim details (orb glow, kart trim, …)

The kart itself pulls from four of those keys: `object.kartBody`,
`accent.kartTrim`, `accent.kartBlue`, `accent.kartYellow` (the last
two are shared with the decorative parked karts at the beach, and
`kartTrim` is also reused by the track kerbs). Because nothing
hardcodes a hex value, recoloring anything is just editing keys in
this one file — every component that imports them updates
automatically, no other file needs to change.

Try it by hand first: open `palette.js`, change `kartBody` and
`kartTrim` to a couple of new hex values, save, watch the game
hot-reload with the new paint job. This convention is exactly what
makes §3.1 (the `/retheme` command) and §3.2 (the `color-palette`
skill) possible later — worth doing this manual edit before showing
the automated version, so the room sees there's no magic in it.

## 2. Get OpenCode running (10 min)

### 2.1 Install

```bash
curl -fsSL https://opencode.ai/install | bash
```

This installs to `$HOME/.opencode/bin` — no sudo, no system path,
works regardless of npm's global config. **Prefer this over
`npm install -g opencode-ai`** for a room of mixed machines: the `-g`
install failed on my own test machine with an `EACCES` permission
error (a locked-down global npm prefix), which is a realistic risk on
a student laptop too. If someone's stuck without either working, the
zero-install fallback is `npx opencode-ai@latest <command>` in place
of a bare `opencode` — slower on a bad connection with a full room
downloading at once, but it needs nothing installed at all (it's what
I used for every test in this doc).

Confirm it installed:

```bash
opencode --version
```

If nothing prints, close and reopen the terminal so PATH refreshes,
then try again.

### 2.2 First look at the TUI

```bash
cd path/to/this/repo
opencode
```

You should see the OpenCode logo, an "Ask anything" box, and the
current agent/model name at the bottom of that box. `/exit` or ctrl+c
to leave. If you get a blank screen instead, see §5 (Troubleshooting).

### 2.3 Pick a model — free tier, zero key

```bash
opencode models
```

OpenCode ships its own free hosted models under the `opencode/`
provider (OpenCode Zen) — zero signup, zero key. This repo's config
already points at `opencode/nemotron-3-ultra-free`. Confirm a model
actually responds without opening the full TUI:

```bash
opencode run "say hello in exactly 3 words" --model opencode/nemotron-3-ultra-free
```

**Confirmed** — short reply comes back, no auth needed.

### 2.4 The harness config file — `opencode.json`

**Plain language:** the master settings file for the whole tool. It
decides which model answers by default and which agent personality is
active when you first open it.
**Why it matters:** it's the foundation everything else sits on — you
can't demo permissions or MCP without this file existing first.
**Analogy:** a `settings.json` for VS Code, but for your AI agent
instead of your editor.
**One thing to remember:** OpenCode reads this file once, at startup.
Change it, and you have to restart OpenCode to see the change — call
this out early, it trips people up the first time.

This repo's `opencode.json` is already the full quick-reference
version (see §4) — model, default agent, permissions, and the MCP
server all in one place. To sanity-check what actually loaded at any
point:

```bash
opencode debug config
```

**Confirmed** — prints the fully merged config; I verified every
field (model, `default_agent`, `permission`, `mcp`, plus the
`reviewer` subagent and `retheme` command, both auto-discovered from
`.opencode/`) shows up correctly in one shot. This is the best command
to lean on live if anyone asks "did that config change actually take
effect."

## 3. The feature tour

Presenting order: **slash commands → skills → sub agents → permissions
(live demo) → MCP → plugins.** (Harness config, above, comes first —
nothing else works without it.)

### 3.1 Slash commands — `/retheme`

**Plain language:** a saved prompt you trigger by typing a short name
instead of writing the whole request every time.
**Why it matters:** turns something you'd type every day into one
word.
**Analogy:** a saved reply in an email client, or a text-expander
snippet.
**One thing to remember:** this is the easiest one to demo live —
typing a few characters and getting a full instruction (and here, a
whole game reskin) back is visually satisfying and immediately makes
sense to a non-technical audience.

Where it lives: `.opencode/commands/retheme.md`.

```markdown
---
description: Reskin the whole game's color palette to a given theme
agent: build
---

Reskin the Isle of Orbs scene to match this theme: $ARGUMENTS

1. Load the color-palette skill first if it hasn't already loaded.
2. Rewrite the color values in `src/game/palette.js` to fit the theme,
   keeping every existing key name exactly as it is - only the hex
   values change, so every component that already imports them updates
   automatically with no other file edits.
3. Don't touch geometry, layout, or any other file - only
   `palette.js` should change.
4. Reply with a one-line summary of which keys you changed and to what.
```

`$ARGUMENTS` is whatever text follows the command name. Inside the TUI
that's `/retheme synthwave neon`. From a plain terminal:

```bash
opencode run --command retheme "synthwave neon"
```

**Confirmed live** — this is the best demo in the whole tour. It
loaded the `color-palette` skill, read and rewrote every color in
`palette.js` to a full neon theme, and the running game visibly
transformed: bright cyan sky, neon-green grass, magenta kerbs and kart
trim. Have `npm run dev` open in a browser tab before you run this
live — the payoff is watching the game change color in front of the
room.

### 3.2 Skills — `color-palette`

**Plain language:** a folder of instructions OpenCode reads and
follows only when the topic actually comes up — loaded on demand,
based on a description you write, not loaded all the time.
**Why it matters:** it lets you teach the agent a specific process
without stuffing it into every prompt.
**Analogy:** giving a new employee a reference document they only pull
off the shelf when the situation calls for it, instead of memorizing
it up front.
**One thing to remember:** the `description` field is doing all the
work. Vague description, the skill never triggers when you expect it
to — specific beats clever here.

Where it lives: `.opencode/skills/color-palette/SKILL.md`.

```markdown
---
name: color-palette
description: Rules for this project's low-poly color palette in src/game/palette.js. Load whenever the user asks to recolor, retheme, or reskin anything in the Isle of Orbs scene - the kart, the island, the track, the beach, all of it.
---

# Color palette

`src/game/palette.js` is the single source of truth for every color in
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
```

Unlike the command above, don't type anything special to trigger this
— just ask in plain language:

```bash
opencode run "recolor the kart to a sunset theme"
```

**Confirmed** — the skill loaded on its own (no `@mention`, no slash
command), and it correctly scoped the change to just the four
kart-related keys rather than the whole scene, because the request
only mentioned the kart. This is the natural side-by-side comparison
to make live: **the skill reads intent and scopes itself; the
`/retheme` command always does the whole scene** because that's what
its fixed instructions say to do. `opencode debug skill` lists it
alongside OpenCode's own built-in skills if anyone wants to see it
recognized.

### 3.3 Sub agents — `reviewer`

**Plain language:** a named specialist the main agent can call in for
one job, with its own instructions and its own restrictions, separate
from the main conversation.
**Why it matters:** it's how you split up responsibility — the main
agent stays a generalist and hands off a specific task to something
purpose-built for it.
**Analogy:** calling in a specialist consultant for one question,
rather than making your generalist do everything themselves.
**One thing to remember:** a sub agent cannot call another sub agent.
Only a primary agent (like the default `build` agent) can call one in
— one level of delegation, full stop, no infinite chains. This is
usually the first question someone asks, so get ahead of it.

Where it lives: `.opencode/agents/reviewer.md`.

```markdown
---
description: Reviews code for bugs and missing tests.
mode: subagent
---

You are a strict code reviewer. When asked to review something, reply with exactly: "Reviewer subagent is active."
```

`mode: subagent` is what marks this as something other agents can
call in, rather than something you switch into directly. Confirm it
was picked up:

```bash
opencode agent list
```

You should see `reviewer (subagent)` alongside the built-in agents.
To see it in action:

```bash
opencode run --auto "call the reviewer subagent right now with the message 'ping' and tell me exactly what it replied"
```

**Confirmed clean end-to-end** — the primary agent picked `reviewer`
as a step and it came back with its reply, free tier, no key.

> **One nuance, not a bug:** this repo's `opencode.json` sets
> `"bash": "ask"` project-wide (deliberately, for §3.4). If a subagent
> needs `bash` and you're testing via `opencode run` *without*
> `--auto` and with nobody there to answer a prompt, that "ask"
> auto-rejects instead of pausing, and the subagent call fails — the
> non-interactive CLI has no one to ask, delegation isn't actually
> broken. It doesn't come up with `--auto` (as above) or in the real
> interactive TUI, which is where you'll be for the live demo anyway.
>
> For the room: if a subagent call ever does fail with the exact
> message `"OpenCode's free tier can only be used from within
> OpenCode"`, that's a known, separate, open upstream bug
> ([opencode#49723](https://github.com/anomalyco/opencode/issues/49723)),
> not your config. It didn't come up in testing this exact setup —
> just worth recognizing the message if it ever appears. Re-running
> the same request is the fastest recovery.

### 3.4 Permissions — `opencode.json`'s `permission` block

**Plain language:** the on/off/ask-first switch for whether the agent
can edit files, run commands, or reach the internet without you
approving it each time.
**Why it matters:** the trust-and-safety layer — the difference
between an agent that quietly does anything and one that checks with
you first.
**Analogy:** app permissions on your phone — this app can see your
location, this one can't, this one has to ask every time.
**One thing to remember:** this is the best one to demo live, full
stop. Flip a setting, trigger the action, everyone in the room watches
it stop and ask for approval in real time. Nothing else on this list
is as visually convincing.

This repo's config already has it set up:

```json
"permission": {
  "edit": "ask",
  "bash": "ask",
  "webfetch": "allow"
}
```

Each value is `allow`, `ask`, or `deny`. You can also target specific
commands — `"bash": { "git *": "allow", "rm *": "deny", "*": "ask" }`
— checked in order, last matching rule wins, so put the broad rule
first and exceptions after it.

```bash
opencode
# then, inside the interactive TUI: ask it to edit a file or run a shell command
```

**Confirmed** — in the real interactive TUI this pauses and visibly
asks for approval, exactly the moment to demo live. **Do this one in
the TUI, not with `opencode run`** — as noted in §3.3, the
non-interactive CLI auto-rejects "ask" instead of pausing (nobody
there to answer), so it *looks* broken outside the real TUI when it
isn't.

### 3.5 MCP (Model Context Protocol) — the `memory` server

**Plain language:** a way to plug an outside tool into the agent, so
it can do something it couldn't out of the box.
**Why it matters:** how you extend the agent past its built-in
abilities without writing custom code — someone else already built the
connector.
**Analogy:** installing a browser extension — the browser itself
didn't change, but it can now do something new.
**One thing to remember:** every connected tool adds to what the model
reads on every turn. More tools isn't automatically better; for a demo
pick one small server, not something large like a full GitHub
integration.

This repo's config already has one wired up, needing no account or
key:

```json
"mcp": {
  "memory": {
    "type": "local",
    "command": ["npx", "-y", "@modelcontextprotocol/server-memory"],
    "enabled": true
  }
}
```

```bash
opencode mcp list
```

**Confirmed** — `memory ✓ connected`. For a remote server instead of a
local command, the shape is `"type": "remote", "url": "https://..."`
with an optional `headers` object for auth tokens.

### 3.6 Plugins — `.opencode/plugin/hello.js`

**Plain language:** a small script that hooks into OpenCode itself and
changes its behavior — running a check before every tool call, or
adding a brand-new tool.
**Why it matters:** the escape hatch for anything config alone can't
do. If skills and commands are what you tell the agent, plugins are
how you change how the agent itself runs.
**Analogy:** a browser extension that doesn't just add a button, but
intercepts and modifies what the page does before it loads.
**One thing to remember:** the most technical topic on the list,
aimed at developers specifically — fine to spend less time here if the
audience is mixed, and a natural closing note for anyone who wants to
go further after the session.

No config entry needed — dropping a file in `.opencode/plugin/` is
enough:

```javascript
export default async ({ client, project, directory, $ }) => {
  return {}
}
```

```bash
opencode debug config
```

**Confirmed** — look for `plugin_origins` pointing at
`.opencode/plugin/hello.js`; that's OpenCode auto-discovering the file
with zero config entry. From here, the returned object would carry
real hooks, e.g. `"tool.execute.before"` to intercept a tool call. To
install a real published plugin from npm instead, add it as a string
to a `plugin` array in `opencode.json` — it installs automatically the
next time OpenCode starts.

## 4. Quick reference

By the end of the session, `opencode.json` looks like this (already in
place in this repo):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "opencode/nemotron-3-ultra-free",
  "default_agent": "build",
  "permission": {
    "edit": "ask",
    "bash": "ask",
    "webfetch": "allow"
  },
  "mcp": {
    "memory": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-memory"],
      "enabled": true
    }
  }
}
```

Plus these files alongside it:

```
.opencode/skills/color-palette/SKILL.md
.opencode/commands/retheme.md
.opencode/agents/reviewer.md
.opencode/plugin/hello.js
```

Useful commands while you work:

- `opencode debug config` — shows exactly what loaded; best friend
  when something doesn't seem to take effect.
- `opencode debug skill` — lists every skill OpenCode can currently
  see.
- `opencode agent list` — lists every agent, primary and subagent, and
  where each came from.
- `opencode mcp list` — shows whether each configured MCP server
  actually connected.
- `opencode run "your message"` — runs one message without opening the
  full TUI, useful for quick tests (add `--auto` to bypass "ask"
  permissions when nobody's there to answer).

## 5. Troubleshooting — blank screen on startup

If `opencode` opens a totally blank screen instead of the interface,
work through these in order:

1. **Update first** — `npm install -g opencode-ai@latest` (or rerun
   the curl install), then retry. Fast-moving projects like this patch
   rendering bugs quickly.
2. Make sure you're in a real terminal (not piping/redirecting output)
   and the window isn't tiny.
3. Check `echo $TERM` — should say something like `xterm-256color`. If
   it says `xterm` or `dumb`, run `export TERM=xterm-256color` first.
4. Move `opencode.json` out of the folder for a moment and run
   `opencode` plain. If it renders now, the problem is in the config —
   add fields back one at a time until you find the one that broke it.
5. If you also have the OpenCode Desktop app installed, don't run both
   at once — they can share the same local database, and a
   newer-than-terminal desktop build can leave the terminal version
   unable to read it, showing blank instead of an error. Close the
   desktop app fully, then reset the local database:

   ```bash
   opencode db path
   ```

   Take the path it prints, close OpenCode completely, move that file
   (and any `-shm`/`-wal` files next to it) elsewhere rather than
   deleting them, then run `opencode` again — it rebuilds a fresh
   database automatically. You lose local OpenCode chat history;
   nothing about your project files is touched.
6. Check the real error in the log file — `opencode debug paths` finds
   the log folder for your machine; open the newest file in it.

## Appendix: repo map

```
src/game/
  trackLayout.js   track spline + derived geometry, single source of truth
  Track.jsx        the road surface mesh
  TrackDecor.jsx   kerbs + corner grandstands
  StartLine.jsx    start/finish banner and grandstand
  Island.jsx       island terrain + Tree/Rock decorations
  Beach.jsx        beach props + parked decorative karts
  Kart.jsx         player kart: controls, physics, model
  Orb.jsx, PickupBurst.jsx   collectibles
  CameraRig.jsx    chase camera
  palette.js       every color in the game

opencode.json                          harness config, §2.4
.opencode/commands/retheme.md          §3.1 slash command
.opencode/skills/color-palette/SKILL.md   §3.2 skill
.opencode/agents/reviewer.md           §3.3 sub agent
.opencode/plugin/hello.js              §3.6 plugin
```
