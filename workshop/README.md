# Workshop files

Every file you write during the workshop, finished and ready to copy. Each one goes to the path in the second column, starting from the root of this repo. OpenCode ignores this folder, so nothing here does anything until you copy it into place.

Step by step guide: https://claude.ai/artifact/EGXd9D2RmVW1EhWxb22wZ9

| File here | Copy it to | Step |
|---|---|---|
| `opencode.json` | `opencode.json` | 5, 9, 10 |
| `commands/retheme.md` | `.opencode/commands/retheme.md` | 6 |
| `skills/color-palette/SKILL.md` | `.opencode/skills/color-palette/SKILL.md` | 7 |
| `agents/reviewer.md` | `.opencode/agents/reviewer.md` | 8 |
| `plugin/hello.js` | `.opencode/plugin/hello.js` | 11 |

`opencode.json` here is the finished version. In the workshop you build it up in three passes: the basics in step 5, the `permission` block in step 9, and the `mcp` block in step 10. The guide shows the file at each stage.

It leaves out `model` on purpose. Pick any model you like inside OpenCode with `/models`. The ones named `opencode/...` are free and need no account.

To skip ahead and copy everything at once:

```bash
mkdir -p .opencode/commands .opencode/skills/color-palette .opencode/agents .opencode/plugin
cp workshop/opencode.json opencode.json
cp workshop/commands/retheme.md .opencode/commands/
cp workshop/skills/color-palette/SKILL.md .opencode/skills/color-palette/
cp workshop/agents/reviewer.md .opencode/agents/
cp workshop/plugin/hello.js .opencode/plugin/
```

Then quit and reopen OpenCode, because it only reads these files when it starts.
