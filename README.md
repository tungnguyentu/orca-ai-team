# orca-ai-team

Orca multi-agent team room launcher + skill.

Open one orchestrator plus workers (Claude Opus/Sonnet, Grok, Pi, command-code, …) in an Orca worktree so they can coordinate through `orca orchestration` mail.

**AI agents:** read [`AGENTS.md`](./AGENTS.md) first.  
**Sharing with others:** see [`DISTRIBUTE.md`](./DISTRIBUTE.md) (Orca skill share vs desktop plugins).

## Install

### For other users (recommended)

```bash
npx skills add tungnguyentu/orca-ai-team --skill orca-ai-team -g -y
ln -sfn ~/.agents/skills/orca-ai-team/scripts/orca-team ~/.local/bin/orca-team
```

Private repo: grant GitHub access, or share via Orca **Skills → Share skills** (unlisted link). See `DISTRIBUTE.md`.

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
orca-team start --same-tab --objective "Ship feature X"
# defaults: orchestrator=claude-opus, workers=claude-sonnet,grok,pi
# command-code is deferred (spawn on demand via worker-start --agent command-code)

orca-team status
orca-team open
orca-team reinject --orchestrator-only
orca-team set-orchestrator --agent claude-sonnet --reason "opus rate limit"
orca-team stop
```

Requires Orca runtime with Experimental → orchestration enabled.
