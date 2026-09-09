# orca-ai-team

**Version:** `0.3.2` (see [`VERSION`](./VERSION))

Orca multi-agent team room launcher + skill.

Open one orchestrator plus workers (Claude Opus/Sonnet, Grok, Pi, command-code, …) in an Orca worktree so they can coordinate through `orca orchestration` mail.

**AI agents:** read [`AGENTS.md`](./AGENTS.md) first.  
**Sharing with others:** see [`DISTRIBUTE.md`](./DISTRIBUTE.md) (skill install + Orca desktop plugin).  
**Contributing:** see [`CONTRIBUTING.md`](./CONTRIBUTING.md).

### Orca desktop plugin

This repo includes an experimental `orca-plugin.json` + `plugin/` panel/commands that type `orca-team start` into a worktree terminal (requires `orca-team` on PATH and an open shell tab). Install via Orca **Plugins** (from Git / folder). See `DISTRIBUTE.md`.

## Install

### For other users (recommended)

```bash
npx skills add tungnguyentu/orca-ai-team --skill orca-ai-team -g -y
ln -sfn ~/.agents/skills/orca-ai-team/scripts/orca-team ~/.local/bin/orca-team
orca-team --version
```

Optional private distribution via Orca **Skills → Share skills** (unlisted link) is documented in `DISTRIBUTE.md`.

### From a local checkout

```bash
# CLI
ln -sfn "$PWD/scripts/orca-team" ~/.local/bin/orca-team

# Skill discovery (Claude / agents)
mkdir -p ~/.agents/skills
ln -sfn "$PWD" ~/.agents/skills/orca-ai-team

# Grok
mkdir -p ~/.grok/skills
ln -sfn "$PWD" ~/.grok/skills/orca-ai-team
```

## Usage

```bash
cd /path/to/orca-managed-worktree
orca-team doctor
orca-team config init           # ~/.config/orca-ai-team/config.json
orca-team config set --orchestrator grok --workers pi,claude-sonnet --model pi=openai/gpt-4o
orca-team start --objective "Ship feature X"
# defaults from config (else built-ins: orch=claude-opus, workers=claude-sonnet,grok,pi)
# layout=dual → tab ai-team:orch + tab ai-team:workers
# command-code is deferred (spawn on demand via worker-start --agent command-code)
# --same-tab = everything in one tab; --layout tabs = one tab per agent
# --orchestrator-model / --worker-models agent=model / --save-defaults

orca-team status                # roster, watch, learned outcome summary
orca-team usage                 # skip assign if grok/claude remaining is low
orca-team route --spec "Implement X"   # rank workers (no dispatch)
orca-team learn                 # ingest explicit worker_done --outcome into routingLearn
orca-team learn --show          # print stored success/fail stats
orca-team assign --spec "Implement X" --done "tests pass"  # auto-route (or pass --worker)
# lean: full worker role once per fresh pane; later tasks = short card (no fat --inject)
# assign refuses LOW quota unless --ignore-quota
orca-team open
# start already runs background watch by default; --no-watch to disable
# start skips workers below --min-remaining (default 10%)
orca-team watch --once --idle-check   # extra one-shot nudge (also ingests learn outcomes)
orca-team reinject --orchestrator-only
orca-team set-orchestrator --agent claude-sonnet --reason "opus rate limit"
orca-team stop   # closes tabs, deletes watch log, writes AI-TEAM-HANDOFF.md
# next start auto-loads AI-TEAM-HANDOFF.md into the orchestrator
```

Requires Orca runtime with Experimental → orchestration enabled.

## Smart worker routing

Route each task to the **cheapest adequate worker** instead of always using Sonnet/Opus. The orchestrator prompt policy and the CLI share the same idea; the CLI can also enforce quota and apply learned bias.

| Class | Examples | Prefer |
|-------|----------|--------|
| **EASY** | typo, rename, extract, format, narrow docs/lint | `pi`, `grok` |
| **MEDIUM** | feature slice, ordinary tests, moderate refactor | `grok`, `pi`, `command-code` |
| **HARD** | architecture, multi-file redesign, tricky root-cause | stronger non-Claude first |
| **HIGH RISK** | auth, billing, security, secrets | capable worker; Sonnet OK for Claude skills (Clerk/Auth0/…) |

```bash
# Rank only (prints reasons + learned bias):
orca-team route --spec "fix typo in README"
orca-team route --spec "wire Clerk auth" --difficulty medium --risk high

# Dispatch with auto-pick (omit --worker):
orca-team assign --spec "fix typo in README" --done "docs ok"

# Explicit worker still allowed; LOW quota is refused unless --ignore-quota:
orca-team assign --worker pi --spec "…" --done "…"

# After worker_done --outcome failed, cascade upward (exclude the failed agent):
orca-team assign --spec "RETRY after pi failed: …" --exclude pi --done "…"
```

Useful flags on `route` / `assign`: `--difficulty`, `--risk`, `--exclude`, `--min-remaining`, `--ignore-quota`, `--no-learned`, `--json`.

### Learned routing

Explicit `worker_done --outcome succeeded|failed` messages are ingested into `.orca/ai-team.json` (`routingLearn`) and bias later rankings (per agent + difficulty; ambiguous “looks done” text is ignored).

| Command | What it does |
|---------|----------------|
| `orca-team learn` | Scan inbox and update stats |
| `orca-team learn --show` | Print stored success/fail counts |
| `orca-team learn --reset` | Clear `routingLearn` + pending assign tags |
| `route` / `assign` / `watch` | Auto-ingest before ranking or on each watch tick |
| `orca-team status` | Shows a short learned summary |

Workers must always set `--outcome` on `worker_done` so history stays honest. Role prompts and lean assign cards already require this.

Orchestrator guidance lives in [`references/role-prompts.md`](./references/role-prompts.md) and [`AGENTS.md`](./AGENTS.md).

## Version

Canonical version lives in [`VERSION`](./VERSION) (semver). The desktop plugin (`orca-plugin.json`) and `orca-team --version` must stay in sync. Release process: see [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Contributing

Bug reports, prompt improvements, CLI fixes, and docs PRs are welcome.

1. Fork and branch from `main`
2. Keep changes focused; no secrets in commits
3. Open a PR describing what changed and how you tested

Full guidelines: [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## License

No license file is declared yet. If you need an explicit open-source license for downstream use, open an issue or PR proposing one (MIT/Apache-2.0 preferred).
