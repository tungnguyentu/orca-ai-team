# Distributing orca-ai-team to other users

Orca has **two different packaging ideas**. For this repo, the practical path is an **agent skill**, not an Electron UI plugin.

## 1. Agent skill (recommended for orca-ai-team)

What we already are: a folder with `SKILL.md` (+ scripts/references) that coding agents discover.

### Install from GitHub (others)

```bash
# Global install into detected agents + shared .agents/skills
npx skills add tungnguyentu/orca-ai-team --skill orca-ai-team -g -y

# Or pin agents explicitly
npx skills add tungnguyentu/orca-ai-team --skill orca-ai-team -g -y \
  --agent claude-code,codex,universal
```

Via Orca CLI (same underlying `npx skills add`):

```bash
orca skills install --skill orca-ai-team   # only works for *bundled* registry names
# For a third-party GitHub skill, prefer `npx skills add ...` above.
```

**Private repo note:** recipients need GitHub access (collaborator) or a token that can clone the repo. For widest sharing, either:

- invite users as collaborators, or
- publish via **Orca skill share link** (below), or
- maintain a public mirror of the skill (no secrets).

After install, users still need:

1. `orca-team` on PATH — symlink the skill’s `scripts/orca-team` (or document that agents run it via absolute path from the skill dir)
2. Orca runtime + Experimental → orchestration
3. Agent binaries (claude, grok, pi, …)

### Share inside Orca (unlisted link)

Official flow: [Share and install agent skills](https://github.com/stablyai/orca/blob/main/docs/reference/sharing-agent-skills.md)

1. Skill must be **installed/discovered** (`orca skills installed` shows `orca-ai-team`).
2. In the desktop app: **Settings → Share Skills** — enable sharing (and optionally “Allow agents and the Orca CLI to publish skill links”).
3. **Skills → Share skills** → select `orca-ai-team` → publish → copy unlisted link.
4. Or CLI (after permission is on):

```bash
orca skills installed --json
orca skills share --skill orca-ai-team --bundle-name "Orca AI Team" --json
```

Recipients: **Skills → Install from link** (or paste the URL). They can install globally or per-workspace, including remote/WSL/SSH hosts.

Treat the link like a credential; revoke anytime in Settings → Share Skills.

### Symlink CLI for humans

Skills install `SKILL.md` for agents; the `orca-team` binary still needs a PATH entry:

```bash
# After skills install, find the skill dir then:
ln -sfn ~/.agents/skills/orca-ai-team/scripts/orca-team ~/.local/bin/orca-team
```

(Exact path may vary by agent provider; `universal` / `.agents/skills` is the shared location.)

---

## 2. Orca desktop plugin (`orca-plugin.json`)

Separate system for **app UI contributions** (experimental). Upstream references:

- Example worker+panel: [`stablyai/orca` → `examples/plugins/hello-orca`](https://github.com/stablyai/orca/tree/main/examples/plugins/hello-orca)
- Official catalog: [`stablyai/orca-plugins`](https://github.com/stablyai/orca-plugins)

### How a worker + panel plugin is built (from `hello-orca`)

| Piece | Role |
|-------|------|
| `orca-plugin.json` | Manifest: `id`, `publisher`, `name`, `version`, `engines.orca`, `pluginApi: 1`, `main`, `contributes`, `capabilities` |
| `main.mjs` | Out-of-process Node worker. `export default function activate(orca) { … }`. Registers commands/events; calls `orca.host.call('<method>', params)` |
| `panel.html` | Sandboxed iframe. Host bridge only via `postMessage({ type: 'orca-panel-action', action, params })` |

Host methods used by samples (capability-gated):

| Method | Capability | Available in panel? |
|--------|------------|---------------------|
| `workspace.readContext` | `workspace:read` | yes |
| `terminal.sendText` | `terminal:send` | yes |
| `notifications.show` | `notifications:show` | yes |
| `storage.*` | `storage` | no (worker only) |
| event subscriptions | `events:subscribe` | via `contributes.events` + worker |

`hello-orca` declares `workspace:read` and builds a terminal `<select>` from `workspace.readContext` before calling `terminal.sendText`. Many official marketplace plugins use **empty** `capabilities` (themes, keybinding `action` aliases, VM recipes) and display-case names — those are first-party/`stablyai` paths.

### Third-party rules (Git/folder, publisher ≠ `stablyai`)

Orca treats this repo as **third-party / untrusted**. Observed install gates:

1. **`id` must not start with `orca-`** — that prefix is reserved for official plugins. This plugin uses `ai-team`.
2. **`workspace:read` is rejected** — *not allowed for third-party plugins*. You cannot copy `hello-orca`’s terminal picker unchanged.
3. Keep capabilities minimal: `terminal:send`, `notifications:show`, `storage`, `events:subscribe`.

So this plugin’s panel **pastes a terminal id** from `orca terminal list --json` instead of calling `workspace.readContext`.

```json
{
  "manifestVersion": 1,
  "id": "ai-team",
  "publisher": "tungnguyentu",
  "name": "Orca AI Team",
  "version": "0.3.5",
  "engines": { "orca": ">=1.4.0" },
  "pluginApi": 1,
  "main": "plugin/main.mjs",
  "capabilities": [
    { "kind": "terminal:send" },
    { "kind": "notifications:show" },
    { "kind": "storage" },
    { "kind": "events:subscribe" }
  ]
}
```

**Conclusion:** distribute the **skill + CLI** first; keep the desktop plugin as a Start convenience that stays third-party-safe.

---

## 3. Desktop plugin (scaffolded in this repo)

Same roles as `hello-orca`, files under `plugin/`:

- `orca-plugin.json` — manifest identity `tungnguyentu.ai-team`
- `plugin/main.mjs` — worker types `orca-team start …` via `terminal.sendText`; stores last terminal id
- `plugin/panel.html` — paste terminal id + optional objective → send

**Can:** palette commands, `Mod+Alt+A`, panel Start.  
**Cannot (third-party):** auto-list terminals, create terminals. Needs `orca-team` on PATH.

### Troubleshooting

If Orca only says “Plugin installation failed” after fetching this repository, check the manifest `id`. Orca reserves IDs beginning with `orca-` for official plugins, so the former `orca-ai-team` ID was rejected for this third-party source. Version `v0.3.5` fixes this with the unreserved `ai-team` ID.

### Install

**Important:** use **v0.3.5+**. Earlier versions used the reserved `orca-ai-team` plugin id and Orca rejects that identity for third-party sources. Prefer ref `v0.3.5` or branch `main`.

**As a marketplace** (matches the “Add Marketplace” dialog):

1. Orca → **Plugins** → Add Marketplace  
2. URL: `https://github.com/tungnguyentu/orca-ai-team` (repo root has `orca-marketplace.json` pinning `ref: v0.3.5`)
3. Install the listed **tungnguyentu.ai-team** plugin and consent to terminal send / notifications / storage / events

**As a single plugin (folder / git):**

1. Install from folder (this checkout) **or** git with ref `main` / `v0.3.5`
2. Same consent list  

Then: `orca terminal list --json` → paste id in **AI Team** panel → Start (shortcut reuses stored id).

---

## Recommended plan for “other users can use this”

| Step | Action |
|------|--------|
| 1 | Keep repo as skill package (`npx skills add …`) |
| 2 | Document install in README + this file |
| 3 | Symlink `scripts/orca-team` onto PATH |
| 4 | Share via Orca **Skills → Share skills** link for private distribution |
| 5 | Optional: public GitHub mirror for frictionless `npx skills add` |
| 6 | Install desktop plugin (`orca-plugin.json`) for Start button / shortcut |

---

## Trust / privacy

A skill can change agent behavior and may include scripts. Recipients should install only from people they trust. Orca validates packages but does not execute skill contents during install.
