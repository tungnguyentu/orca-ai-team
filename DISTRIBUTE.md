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

Separate system for **app UI contributions**:

| Can contribute today (examples) | Not the right fit for us |
|---------------------------------|---------------------------|
| Commands / keybindings | Packaging a CLI + agent skill |
| Panels (HTML) | Marketplace “skills” category currently unsupported |
| Language packs | |
| VM recipes | |

Example shape (bundled plugins under `/usr/lib/orca-ide/plugins/launch/*/orca-plugin.json`):

```json
{
  "manifestVersion": 1,
  "id": "orca-ai-team",
  "publisher": "your-publisher",
  "name": "Orca AI Team",
  "version": "1.0.0",
  "description": "...",
  "repository": "https://github.com/tungnguyentu/orca-ai-team",
  "engines": { "orca": ">=1.4.0" },
  "pluginApi": 1,
  "contributes": { },
  "capabilities": []
}
```

Official marketplace lives at `stablyai/orca-plugins`. Listings that declare unsupported categories (including **skills**) are hidden from install until the marketplace catches up.

**Conclusion:** do **not** block on becoming an Orca marketplace plugin for distribution. Ship as a **skill** (+ optional later UI plugin if we add a panel).

---

## Recommended plan for “other users can use this”

| Step | Action |
|------|--------|
| 1 | Keep repo as skill package (already works: `npx skills add … -l` finds `orca-ai-team`) |
| 2 | Document install in README (done via this file) |
| 3 | Ensure `scripts/orca-team` is executable and PATH instructions are clear |
| 4 | Share via Orca **Skills → Share skills** link for private distribution |
| 5 | Optional: public GitHub mirror or make repo public for frictionless `npx skills add` |
| 6 | Optional later: thin `orca-plugin.json` with a “Start AI Team” command that shells to `orca-team start` |

---

## Trust / privacy

A skill can change agent behavior and may include scripts. Recipients should install only from people they trust. Orca validates packages but does not execute skill contents during install.
