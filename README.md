# orca-ai-team

**Version:** `0.1.5` (see [`VERSION`](./VERSION))

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
orca-team start --objective "Ship feature X"
# defaults: orchestrator=claude-opus, workers=claude-sonnet,grok,pi
# layout=dual → tab ai-team:orch + tab ai-team:workers
# command-code is deferred (spawn on demand via worker-start --agent command-code)
# --same-tab = everything in one tab; --layout tabs = one tab per agent

orca-team status
orca-team open
# start already runs background watch by default; --no-watch to disable
orca-team watch --once --idle-check   # extra one-shot nudge
orca-team reinject --orchestrator-only
orca-team set-orchestrator --agent claude-sonnet --reason "opus rate limit"
orca-team stop   # closes tabs + deletes .orca/ai-team-watch.log
```

Requires Orca runtime with Experimental → orchestration enabled.

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
