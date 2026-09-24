# Workshop — Isle of Orbs

Everything for the AI Tooling workshop, in one file: the game setup,
the color-palette convention the recolor demos rely on, getting
OpenCode running, and the full feature tour — what to say, how it's
built in this repo, and the exact command to run, in the order you're
presenting it. The "confirmed" notes below were run against OpenCode's
free `opencode/` models; the config itself doesn't pin a model, so
you and every attendee can pick whichever one you like.

**Attendee guide:** https://claude.ai/artifact/EGXd9D2RmVW1EhWxb22wZ9
is the same workshop written for the room, step by step with copy
buttons. It's private until you share it from the page's Share menu,
so share it before the session.

This folder is the **starting state** — no `opencode.json`, no
`.opencode/`. Every file in §2–3 below gets created live, from
scratch, during the session; that's the point, the payoff is watching
each one come alive as you write it, not inspecting one that already
works.

Every file you write is also sitting finished in `workshop/`, with a
README mapping each one to where it goes. That's your in-repo cheat
sheet: copy from it if a live edit goes sideways, and attendees who
fall behind can copy from it to catch up. OpenCode ignores that
folder, so it doesn't spoil anything. A full copy of the finished
repo also lives in the sibling `ai-tooling-workshop-completed/`
folder, for diffing a whole working setup against a broken one.

## 0. Before you start — run the game (5 min)

```bash
npm install
npm run dev
```

Open the game, confirm it loads, drive around once. Then skim
`src/game/`:

- `config/trackLayout.js` — the track's spline, width, and all the derived
  numbers (`trackVertex`, `trackWidthAt`, `BEACH_ANGLE`, …) everything
  else is built from
- `world/Island.jsx` — the island terrain plus its `Tree`/`Rock` decorations
- `objects/Kart.jsx` — the player kart, its controls, and its colors
- `world/Beach.jsx`, `world/TrackDecor.jsx`, `world/StartLine.jsx` — other
  scene pieces, same conventions
- `config/palette.js` — every color in the game. No component hardcodes a hex
  value; they all import from here.

## 1. The color palette convention (5 min)

`src/game/config/palette.js` is the single source of truth for every color
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

If you get `command not found: opencode`, the install almost
certainly worked and the terminal just hasn't picked up the new PATH.
The installer adds `export PATH=$HOME/.opencode/bin:$PATH` to
`~/.zshrc`, but a terminal that was already open before the install
never reads that line. Open a new terminal tab, or run
`source ~/.zshrc`, then try `opencode --version` again. To confirm the
binary is really there, `ls ~/.opencode/bin` should show `opencode`.

**Don't reach for Homebrew as a fallback on a Mac.** Installing via
`brew install anomalyco/tap/opencode-v2` downloaded fine on my test
machine and then refused to install with `Your Xcode (26.6) at
/Applications/Xcode.app is too outdated. Please update to Xcode 27.0
(or delete it).` That's a multi-gigabyte App Store update, not
something to fix mid-session. Anyone with Xcode installed but not
current will hit this. Stick with the curl installer above.

### 2.2 First look at the TUI

```bash
cd path/to/this/repo
opencode
```

You should see the OpenCode logo, an "Ask anything" box, and the
current agent/model name at the bottom of that box. `/exit` or ctrl+c
to leave. If you get a blank screen instead, see §5 (Troubleshooting).

### 2.3 Pick a model — any one you like

The config deliberately doesn't name a model, so everyone picks their
own. Inside the TUI:

```
/models
```

Pick anything from the list. The ones named `opencode/...` are
OpenCode's own free hosted models (OpenCode Zen): no signup, no key,
so they're the easy default for a room. Anyone with their own
Anthropic, OpenAI or OpenRouter key can run `opencode auth login` and
pick one of those instead; nothing else in this workshop depends on
which model answers.

To see the full list from a plain terminal, and to test that a model
answers without opening the TUI (swap in any name from the list):

```bash
opencode models
opencode run "say hello in exactly 3 words" --model opencode/big-pickle
```

**Confirmed** — short reply comes back from the free models, no auth
needed.

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

Create `opencode.json` in the repo root. This first pass is the base
harness; §3.4 adds a `permission` block to it and §3.5 adds `mcp`
(the finished file is in §4 and in `workshop/opencode.json`):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "default_agent": "build",
  "autoupdate": "notify",
  "share": "disabled",
  "watcher": {
    "ignore": ["node_modules/**", "dist/**"]
  }
}
```

Walk through it line by line — every field is here for a reason a
room will understand:

- **`$schema`** — your editor now autocompletes and underlines typos.
  Worth it, because OpenCode refuses to start on an invalid field.
- **`default_agent: "build"`** — start in the agent that can actually
  make changes (`plan` is the read-only alternative).
- **No `model` line** — on purpose. Everyone picks their own with
  `/models` (§2.3), and nobody's config is tied to one model that
  might get renamed or retired.
- **`autoupdate: "notify"`** — OpenCode normally updates itself on
  startup. For a workshop you want every machine on the same version
  for the whole session, so it just tells you an update exists
  instead.
- **`share: "disabled"`** — no conversation can accidentally become a
  public share link. Sensible default anywhere, especially on a room
  full of laptops.
- **`watcher.ignore`** — stops OpenCode watching `node_modules` and
  the build output, which churn constantly and have nothing it needs.

Restart OpenCode, then check what it actually loaded:

```bash
opencode debug config
```

Every field above should show in the output. This is the best command
to lean on live if anyone asks "did that config change actually take
effect." (Every field here was checked against OpenCode's published
schema at https://opencode.ai/config.json.)

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
2. Rewrite the color values in `src/game/config/palette.js` to fit the theme,
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
**One thing to remember:** by default a sub agent cannot call another
sub agent. Only a primary agent (like the default `build` agent) can
call one in — one level of delegation, no infinite chains. That limit
is a setting, `subagent_depth` in `opencode.json`, and it defaults to
`1`: set it to `2` to allow one more level of nesting, or `0` to turn
sub agents off entirely. This is usually the first question someone
asks, so get ahead of it.

Where it lives: `.opencode/agents/reviewer.md`. The filename becomes
the agent's name, so `reviewer.md` gives you an agent called
`reviewer`.

```markdown
---
description: A pirate code reviewer. Reviews code for bugs, risky logic, and missing tests. Use when the user asks for a code review or asks for the reviewer.
mode: subagent
---

You are a strict code reviewer who talks like a pirate.

Stay in character for your whole reply: pirate slang throughout, and end every sentence with "arr".

When you're given code or a file to review:
1. Read the actual code before judging it.
2. Point out real bugs, risky logic, and anything that's missing tests, naming the file and line for each.
3. If the code looks fine, say so plainly instead of inventing problems.
4. Finish with a one-line verdict: shipshape, or needs work.
```

Two frontmatter fields matter. `description` is required, and it's
what the main agent reads to decide when to call this one in, so say
plainly what it does and when to use it. `mode: subagent` marks it as
something other agents call in, rather than something you switch into
yourself. The pirate voice is there on purpose: when the reply comes
back talking like a pirate, the room can see at a glance that it was
the subagent answering and not the main agent.

**Gotcha worth showing:** put instructions *outside* any quoted text.
An earlier draft said `reply with exactly: "Reviewer subagent is
active. Respond like you are a pirate..."`, and the agent just recited
that whole sentence back word for word, because anything inside
"reply with exactly" is text to repeat, not an instruction to follow.

Confirm it was picked up:

```bash
opencode agent list
```

You should see `reviewer (subagent)` alongside the built-in agents.

**How a subagent actually gets called.** There are three ways, and
the difference matters live:

1. **@mention (use this one in the demo).** Type `@reviewer` at the
   start of your message. It calls that agent directly, every time:

   ```
   @reviewer review src/game/objects/Kart.jsx
   ```

   Typing `@` also pops up an autocomplete list of agents. If
   `reviewer` isn't in that list, OpenCode didn't load the file, so
   quit and restart it.
2. **Automatic.** Say "use the reviewer to review Kart.jsx" in plain
   English and the main agent *may* hand it off, based on the
   `description`. That's the model's call, not yours, and the free
   model often just does the review itself instead. This is the most
   common reason people think their subagent "isn't working".
3. **The Task tool.** This is what automatic delegation uses under the
   hood. A `task` entry in the `permission` block controls which
   subagents the main agent may call. It's allowed by default, and
   setting it to `deny` for an agent hides that agent from the main
   agent entirely.

**Where the answer shows up.** A subagent runs in its own child
session, so the main conversation may only show a step like
"Reviewer Agent ✓" and a short summary, not the full pirate review.
To read what the subagent actually said, press `ctrl+x` then the down
arrow to jump into its session. The up arrow takes you back to the
main conversation, and left/right cycle between child sessions if
there's more than one. Show this live; it's the second most common
"it didn't work" moment.

For a quick check from a plain terminal, an older version of this
agent (one that replied with a fixed line when pinged) was tested
end to end on the free tier with:

```bash
opencode run --auto "call the reviewer subagent right now with the message 'ping' and tell me exactly what it replied"
```

The primary agent picked `reviewer` as a step and came back with its
reply, no key needed.

> **One nuance, not a bug:** once §3.4 is done, `opencode.json` makes
> most shell commands "ask" first (deliberately). If a subagent
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

Add this `permission` block to `opencode.json`, right after
`watcher` (mind the comma after the closing `}` of `watcher`):

```json
"permission": {
  "edit": "ask",
  "bash": {
    "*": "ask",
    "git status*": "allow",
    "git diff*": "allow",
    "npm run lint*": "allow",
    "rm *": "deny"
  },
  "webfetch": "allow"
}
```

Each value is `allow`, `ask`, or `deny`. `edit` and `webfetch` take
one value for everything; `bash` here is split per command. Rules are
checked in order and the last one that matches wins, so the broad
`"*": "ask"` goes first and the exceptions after it. Read it out loud
to the room as a sentence: "ask me before any shell command, except
look-only git commands and the linter, which are fine, and never
delete anything."

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

Add this `mcp` block to `opencode.json`, after `permission` (mind the
comma again). This server needs no account or key:

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

By the end of the session, `opencode.json` looks like this (the same
file is in `workshop/opencode.json`):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "default_agent": "build",
  "autoupdate": "notify",
  "share": "disabled",
  "watcher": {
    "ignore": ["node_modules/**", "dist/**"]
  },
  "permission": {
    "edit": "ask",
    "bash": {
      "*": "ask",
      "git status*": "allow",
      "git diff*": "allow",
      "npm run lint*": "allow",
      "rm *": "deny"
    },
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

Plus these files alongside it, each also finished in `workshop/`:

```
.opencode/skills/color-palette/SKILL.md   ← workshop/skills/color-palette/SKILL.md
.opencode/commands/retheme.md             ← workshop/commands/retheme.md
.opencode/agents/reviewer.md              ← workshop/agents/reviewer.md
.opencode/plugin/hello.js                 ← workshop/plugin/hello.js
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
src/
  App.jsx                    canvas + HUD wiring
  ui/HUD.jsx                 on-screen score/overlay
  hooks/useKeyboardControls.js
  game/
    Scene.jsx                puts everything together, game loop
    config/
      trackLayout.js         track spline + derived geometry, single source of truth
      palette.js             every color in the game
    world/
      Track.jsx              the road surface mesh
      TrackDecor.jsx         kerbs + corner grandstands
      StartLine.jsx          start/finish banner and grandstand
      Island.jsx             island terrain + Tree/Rock decorations
      Beach.jsx              beach props + parked decorative karts
    objects/
      Kart.jsx               player kart: controls, physics, model
      Orb.jsx                collectible orb
    effects/
      PickupBurst.jsx        orb pickup particles
    camera/
      CameraRig.jsx          chase camera

opencode.json                          harness config, §2.4 (you create it)
.opencode/commands/retheme.md          §3.1 slash command (you create it)
.opencode/skills/color-palette/SKILL.md   §3.2 skill (you create it)
.opencode/agents/reviewer.md           §3.3 sub agent (you create it)
.opencode/plugin/hello.js              §3.6 plugin (you create it)

workshop/                              every file above, finished, ready to copy
  README.md                            which file goes where
```
