---
name: orca-ai-team
version: 0.3.4

description: >-
  Open a multi-agent Orca team room in one worktree: one orchestrator plus
  workers (Claude/Grok/Pi/command-code/Codex) that talk through Orca
  orchestration mail. Use when the user wants agents to talk together, an
  orchestrator to coordinate other AIs, "ai team", "multi agent room", or
  `orca-team start`.
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
orca-team config init
orca-team config set --orchestrator claude-opus --workers claude-sonnet,grok,pi
orca-team start --objective "Ship feature X"
# defaults from ~/.config/orca-ai-team/config.json (else built-ins):
#   orchestrator = claude-opus
#   workers      = claude-sonnet,grok,pi
#   layout       = dual  (orch tab alone + workers tab)
#   (command-code is deferred — spawn via worker-start --agent command-code)
# per-run overrides: --orchestrator / --workers / --orchestrator-model / --worker-models
# persist this run's roster: --save-defaults

# Talk in the orchestrator tab (`ai-team:orch`) inside Orca.
orca-team status
orca-team usage                 # probe grok/claude remaining % before assign
orca-team route --spec "Implement X"   # rank workers (difficulty/risk/quota + learned); no dispatch
orca-team learn                        # ingest explicit worker_done --outcome into routingLearn
orca-team assign --spec "Implement X" --done "tests pass"   # omit --worker → auto-route
orca-team assign --worker pi --spec "Implement X" --done "tests pass"
# lean path: full worker role once per fresh pane; later tasks = short card (no fat --inject)
# assign refuses LOW-quota workers unless --ignore-quota; --exclude for cascade after failure
# learned bias needs explicit --outcome succeeded|failed (fluent text alone is ignored)
orca-team send --to run --subject "standup" --body "Status check"
orca-team stop   # writes AI-TEAM-HANDOFF.md + deletes watch log
# next start loads AI-TEAM-HANDOFF.md into the orchestrator automatically
```

Prefer `orca-team assign` for roster workers (send-once role + short `[orca-team lean-assign]` card). Omit `--worker` to let the scorer pick (easy→pi/grok, spare Sonnet, respect quota). Avoid re-pasting the full worker bible or `dispatch --inject` on primed panes.

`start` skips opening workers under `--min-remaining` (default 10%). Example: grok at 4% left is deferred (no pane) until quota recovers. Orchestrator must also run `orca-team usage` before dispatching.

Custom roster:

```bash
orca-team start \
  --orchestrator claude-opus \
  --workers claude-sonnet,grok,pi,command-code \
  --objective "Build auth"
```

### Layouts

| flag | tabs |
|------|------|
| `--layout dual` (default) / `--dual-tab` | `ai-team:orch` (orchestrator alone) + `ai-team:workers` (all workers split) |
| `--layout split` / `--same-tab` | one tab `ai-team` with every agent as panes |
| `--layout tabs` | one tab per agent |

```bash
orca-team start --objective "Ship feature X"                 # dual (default)
orca-team start --same-tab --objective "Ship feature X"      # everything in one tab
orca-team start --layout tabs --objective "Ship feature X"   # one tab each
```

### Swap orchestrator when someone hits a limit

Keeps the same Run; demotes the old orchestrator to standby (or closes it):

```bash
orca-team set-orchestrator --agent claude-sonnet --reason "opus rate limit"
orca-team set-orchestrator --agent grok --reason "claude limited" --fresh
orca-team set-orchestrator --agent claude-sonnet --reason "limit" --close-old
```

### Background watch (default on)

`start` launches a detached `orca-team watch` process that nudges idle/stale workers missing `worker_done`. `stop` kills it, **deletes** `.orca/ai-team-watch.log`, and writes **`AI-TEAM-HANDOFF.md`** in the worktree (objective, git snapshot, open tasks, recent `worker_done` / questions). The next `start` loads that file into the orchestrator prompt. Use `--no-handoff` on stop/start to skip.

```bash
orca-team start --objective "Ship feature X"          # watch on
orca-team start --no-watch --objective "Ship feature X" # disable
orca-team start --watch-interval 45 --watch-stale-minutes 10
orca-team status   # shows watch pid alive/dead + log path
```

By default `start` auto-opens the orchestrator tab **on the host Orca UI**:

1. `orca open` (ensure app/runtime)
2. rename tabs to stable titles (`ai-team:orch`, `ai-team:workers`)
3. `orca terminal switch` onto the orchestrator handle
4. best-effort raise of the host Orca desktop window (Hyprland/`xdotool`)
5. set the worktree card comment so remote viewers can find it

Pass `--no-open` to skip host focus. Anytime later:

```bash
orca-team open
```

### Remote Orca viewers (another machine)

`terminal switch` only focuses the **host** Orca window. Remote/shared-control clients do **not** automatically jump to that tab. From the remote machine:

1. Open the worktree card (comment mentions `ai-team:orch` / `ai-team:workers`)
2. Click **`ai-team:orch`** for the orchestrator, or **`ai-team:workers`** for the worker panes
3. Ignore leftover single tabs named `ai-team:claude` from older runs

### Orchestrator keeps coding instead of delegating

Role prompts forbid orchestrator implementation. If it drifts:

```bash
orca-team reinject --orchestrator-only
```

### Orchestrator parks workers “pending your approval”

Default is **dispatch without waiting**. If it invents an approval gate (“I’m the bottleneck”, “held T11–T13 for your OK”) while workers sit idle:

```bash
orca-team reinject --orchestrator-only
```

Then tell it: dispatch the pending tasks now — only pause when you explicitly ask for a review gate.

### Orchestrator ignores worker `ask`

Workers block on `ask` until the orchestrator `reply`s. If a worker is stuck waiting and mail shows unread `question`s, the orchestrator was not in its wait/reply loop — reinject and tell it:

```text
Answer pending questions first: check --peek --types question, then reply --id …. Do that before chatting with me.
```

### Keep work balanced (and spare Claude quota)

Opus + Sonnet share Claude usage. Prefer dispatching to **grok / pi / command-code**; use Sonnet only when needed (Claude skills / high-risk). Route with difficulty in mind (easy→pi/grok). Say so to the orchestrator, or reinject:

```text
Prefer grok and pi for implementation. Minimize sonnet — same Claude quota as the orchestrator. Use orca-team route / assign without --worker. Round-robin non-Claude workers.
```

### Worker failed — cascade, don’t code

On `worker_done --outcome failed`, reassign upward (exclude the failed agent) instead of implementing:

```bash
orca-team assign --spec "RETRY after <agent> failed: …" --exclude <failed-agent> --done "…"
```

### Learned routing

Successful/failed outcomes with an **explicit** `--outcome` are stored in `.orca/ai-team.json` (`routingLearn`) and bias later `route`/`assign` picks. Watch also ingests in the background.

```bash
orca-team learn --show
orca-team learn --reset          # wipe bad history
orca-team route --spec "…" --no-learned   # one-shot ignore bias
```

### Workers forget to send results back

Workers must always `worker_done` / `ask` / `result` — orchestrator cannot see their TUI.

`start` enables a background watch by default. Manual / extra monitors:

```bash
orca-team watch --once --idle-check
orca-team watch --interval 60 --stale-minutes 10 --idle-check
```

Or reinject role prompts:

```bash
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
| `command-code` | `command-code --yolo --trust --skip-onboarding` (see AGENTS.md: inject quirk after title rewrite) |
| `codex` | `codex --dangerously-bypass-approvals-and-sandbox` |
| `opencode` | `opencode --auto` |
| `pi` | `pi --approve` |

## What it does

1. Resolves Orca CLI (`ORCA_CLI_COMMAND` → `orca-ide` on Linux outside managed terminals → `orca`)
2. Requires current directory to be an Orca worktree
3. Creates orchestrator tab (`ai-team:orch` in dual layout) with skip-permission launch
4. `orchestration run-create --from <orchestrator>`
5. Creates worker panes (shared `ai-team:workers` tab in dual layout)
6. Injects role prompts from `references/role-prompts.md`
7. Writes `.orca/ai-team.json` and starts background watch (unless `--no-watch`)

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
