# AGENTS.md — orca-ai-team

Instructions for AI coding agents working in or on this repository.

## What this repo is

Thin **Orca multi-agent team room** launcher + skill. It does **not** invent a messaging bus. Coordination uses native Orca orchestration:

- `orca orchestration run-create|run-use|send|check|ask|reply`
- `orca orchestration task-create` + `worker-start` / `dispatch --inject`

One **orchestrator** plans and dispatches; **workers** implement.

## Layout

```text
SKILL.md                      # Agent skill frontmatter + human docs
AGENTS.md                     # This file — for AIs
README.md                     # Install / quick start
scripts/orca-team             # CLI (Python 3, no deps beyond stdlib)
references/role-prompts.md    # Orchestrator + worker prompt templates
```

Installed as:

- CLI: `~/.local/bin/orca-team` → `scripts/orca-team`
- Skill: `~/.agents/skills/orca-ai-team` (and often `~/.grok/skills/orca-ai-team`)

## When to use this tool

Use `orca-team` when the user wants multiple coding agents (Claude / Grok / Pi / command-code / …) in one Orca worktree to talk and coordinate, with one agent điều phối (orchestrating) the others.

Do **not** invent parallel chat paste between terminals. Prefer Orca mail + task dispatch.

## Preconditions

1. Orca app runtime ready (`orca status --json` / `orca-ide` on Linux if needed)
2. Settings → Experimental → **orchestration** enabled
3. Current directory is an **Orca-managed worktree**
4. Agent binaries on PATH

On Linux outside Orca-managed terminals, prefer `~/.local/bin/orca` (shim) over bare `/usr/bin/orca` (GNOME screen reader) or flaky `orca-ide` single-instance launches. The CLI resolves this automatically.

## Defaults

| Role | Agent id | Launch |
|------|----------|--------|
| Orchestrator | `claude-opus` | `claude --dangerously-skip-permissions --model opus` |
| Workers | `claude-sonnet`, `grok`, `pi`, `command-code` | see `SKILL.md` |

Aliases: `opus` → claude-opus; `sonnet` / `claude` → claude-sonnet.

## Common commands

From inside an Orca worktree:

```bash
orca-team doctor
orca-team start --same-tab --objective "<goal>"
orca-team status
orca-team open                 # host focus + remote-viewer hints
orca-team reinject             # re-send role prompts
orca-team reinject --orchestrator-only
orca-team set-orchestrator --agent claude-sonnet --reason "opus rate limit"
orca-team send --to run --subject "..." --body "..."
orca-team stop
```

### Layout

- `--same-tab` / `--layout split` — all agents as panes in one tab titled `ai-team` (recommended)
- `--layout tabs` — one tab per agent (default historically; prefer split)

Never pass `terminal create --focus` for auto-open; it can time out. Create, then `terminal switch`.

### Remote Orca viewers

`terminal switch` focuses the **host** UI only. Remote clients must manually open the worktree card and click tab **`ai-team`**. Card comment is set to `ai-team LIVE — open terminal tab "ai-team"`.

## Role contract (critical)

Source of truth: `references/role-prompts.md`.

### Orchestrator

- **Plans, splits, dispatches, answers `ask`, synthesizes.**
- **Must not** implement product code / “just quickly fix it”.
- Assign with `task-create` + `worker-start --terminal <worker>` or `dispatch --inject`.
- Wait with `check --wait --types worker_done,escalation,question`.

If the orchestrator drifts into coding:

```bash
orca-team reinject --orchestrator-only
```

### Workers

- Implement assigned scope only.
- `ask` when blocked; one `worker_done` with `--outcome succeeded|failed` per dispatch.
- Do not create competing runs or become orchestrator unless told via `set-orchestrator`.

## Rate limits / swap orchestrator

Keep the same Run; demote or close the old orchestrator:

```bash
orca-team set-orchestrator --agent claude-sonnet --reason "opus rate limit"
orca-team set-orchestrator --agent grok --reason "claude limited" --fresh
orca-team set-orchestrator --agent claude-sonnet --reason "limit" --close-old
```

State + history live in the **target worktree**: `.orca/ai-team.json` (not in this skill repo).

## Editing this repo

- Keep `scripts/orca-team` dependency-free (stdlib only).
- Update `references/role-prompts.md` when changing agent behavior; `start` / `reinject` load it at runtime.
- Keep `SKILL.md` frontmatter description accurate (skill discovery).
- Do not commit secrets, PATs, or worktree `.orca/ai-team.json` files.
- After meaningful changes: commit and push to `origin/main` on `tungnguyentu/orca-ai-team` (private).

## Related Orca skills

Load version-matched guides from the binary when operating Orca:

```bash
orca skills get orca-cli
orca skills get orchestration
```

Prefer `--json` for agent-driven calls.
