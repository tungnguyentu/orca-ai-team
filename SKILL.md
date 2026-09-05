---
name: orca-ai-team
description: >-
  Open a multi-agent Orca team room in one worktree: one orchestrator plus
  workers (Claude/Grok/Pi/command-code/Codex) that talk through Orca
  orchestration mail. Use when the user wants agents to talk together, an
  orchestrator to điều phối / coordinate other AIs, "ai team", "multi agent
  room", or `orca-team start`.
---

# Orca AI Team

Thin launcher + skill on top of native `orca orchestration`. Does **not** invent a new bus.

## Install

CLI entrypoint:

```bash
~/.agents/skills/orca-ai-team/scripts/orca-team
# usually symlinked as:
orca-team
```

## How to use

From inside an Orca-managed worktree:

```bash
orca-team doctor
orca-team start --objective "Ship feature X"
# defaults:
#   orchestrator = claude-opus
#   workers      = claude-sonnet,grok,pi,command-code

# Talk in the orchestrator tab inside Orca.
orca-team status
orca-team send --to run --subject "standup" --body "Status check"
orca-team stop
```

Custom roster:

```bash
orca-team start \
  --orchestrator claude-opus \
  --workers claude-sonnet,grok,pi,command-code \
  --objective "Build auth"
```

### Swap orchestrator when someone hits a limit

Keeps the same Run; demotes the old orchestrator to standby (or closes it):

```bash
orca-team set-orchestrator --agent claude-sonnet --reason "opus rate limit"
orca-team set-orchestrator --agent grok --reason "claude limited" --fresh
orca-team set-orchestrator --agent claude-sonnet --reason "limit" --close-old
```

Same tab (panes / splits instead of one tab per agent):

```bash
orca-team start --same-tab --objective "Ship feature X"
# or: --layout split --split-direction horizontal
```

By default `start` auto-opens the team tab **on the host Orca UI**:

1. `orca open` (ensure app/runtime)
2. rename tab to stable title `ai-team` (agents overwrite titles otherwise)
3. `orca terminal switch` onto the orchestrator handle
4. best-effort raise of the host Orca desktop window (Hyprland/`xdotool`)
5. set the worktree card comment so remote viewers can find it

Pass `--no-open` to skip host focus. Anytime later:

```bash
orca-team open
```

### Remote Orca viewers (another machine)

`terminal switch` only focuses the **host** Orca window. Remote/shared-control clients do **not** automatically jump to that tab. From the remote machine:

1. Open the worktree card (comment says `ai-team LIVE — open terminal tab "ai-team"`)
2. Click the terminal tab titled exactly **`ai-team`**
3. You should see the split panes (orchestrator + workers)

Ignore leftover single tabs named `ai-team:claude` from older runs.

### Orchestrator keeps coding instead of delegating

Role prompts now forbid orchestrator implementation. If Claude still does the work itself on a live team:

```bash
orca-team reinject --orchestrator-only
# or reinject everyone:
orca-team reinject
```

Supervised mode (creates a task + `worker-start` per worker after the room opens):

```bash
orca-team start --mode supervise --task "Implement the agreed plan" --objective "Ship feature X"
```

## Launch commands (permission-skip)

| id | command |
|----|---------|
| `claude-opus` / `opus` | `claude --dangerously-skip-permissions --model opus` (**default orchestrator**) |
| `claude-sonnet` / `sonnet` / `claude` | `claude --dangerously-skip-permissions --model sonnet` (**default worker**) |
| `grok` | `grok --always-approve` |
| `command-code` | `command-code --yolo` |
| `codex` | `codex --dangerously-bypass-approvals-and-sandbox` |
| `opencode` | `opencode --auto` |
| `pi` | `pi --approve` |

## What it does

1. Resolves Orca CLI (`ORCA_CLI_COMMAND` → `orca-ide` on Linux outside managed terminals → `orca`)
2. Requires current directory to be an Orca worktree
3. Creates `orchestrator:<agent>` terminal with skip-permission launch
4. `orchestration run-create --from <orchestrator>`
5. Creates each `worker:<agent>` terminal
6. Injects role prompts from `references/role-prompts.md`
7. Writes `.orca/ai-team.json`

Agents coordinate with:

- `orca orchestration send|check|ask|reply`
- `orca orchestration task-create` + `worker-start` / `dispatch --inject`

## Preconditions

- Orca app runtime ready
- Settings → Experimental → orchestration enabled
- Agent binaries on PATH

## Notes

- On Linux this CLI prefers `~/.local/bin/orca` (runtime shim) over `orca-ide` when available.
- Claude workspace trust for the worktree path is pre-accepted in `~/.claude.json` when needed.
- First-run “Do you trust this directory?” dialogs (Grok/others) are auto-accepted with `y`.
- Team state lives at `.orca/ai-team.json` inside the worktree.

## Related skills

- `orchestration` — full coordination grammar
- `orca-cli` — worktrees, terminals, handoffs
