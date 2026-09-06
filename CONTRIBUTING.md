# Contributing to orca-ai-team

Thanks for helping improve the multi-agent Orca team room skill.

## Ways to contribute

- Bug reports and Command Code / inject edge cases
- Better role prompts (`references/role-prompts.md`)
- CLI improvements (`scripts/orca-team`)
- Docs (`README.md`, `AGENTS.md`, `DISTRIBUTE.md`)
- Experimental desktop plugin (`orca-plugin.json`, `plugin/`)

## Development setup

```bash
git clone https://github.com/tungnguyentu/orca-ai-team.git
cd orca-ai-team
ln -sfn "$PWD/scripts/orca-team" ~/.local/bin/orca-team
mkdir -p ~/.agents/skills && ln -sfn "$PWD" ~/.agents/skills/orca-ai-team
```

Requirements for manual testing:

- Orca desktop with Experimental → orchestration enabled
- An Orca-managed worktree
- Agent CLIs you care about (`claude`, `grok`, `pi`, …)

## Versioning

This project uses **semver** (`MAJOR.MINOR.PATCH`).

| File | Role |
|------|------|
| `VERSION` | Canonical package version |
| `orca-plugin.json` → `version` | Must match `VERSION` |
| `scripts/orca-team` | Prints `VERSION` via `orca-team --version` |

Bump rules of thumb:

- **PATCH** — bugfixes, prompt wording, docs
- **MINOR** — new commands/flags, new deferred agents, plugin UX
- **MAJOR** — breaking CLI/skill contract changes

When releasing:

1. Update `VERSION` and `orca-plugin.json` `version` to the same value
2. Update the Version section in `README.md` if needed
3. Commit: `Release vX.Y.Z`
4. Tag: `git tag -a vX.Y.Z -m "vX.Y.Z"` and push tags

## Pull requests

1. Fork and branch from `main` (`feature/…` or `fix/…`)
2. Keep changes focused; prefer small PRs
3. Do not commit secrets, PATs, or worktree `.orca/ai-team.json` state
4. Run a quick sanity check when CLI changes:

```bash
python3 -m py_compile scripts/orca-team
orca-team --version
orca-team --help
```

5. Describe what changed and how you tested (even “docs only” is fine)

## Code style

- `scripts/orca-team`: stdlib Python only (no new runtime deps)
- Keep agent-facing docs in **English**
- Prefer updating `references/role-prompts.md` over hardcoding long prompts in the CLI

## Conduct

Be respectful. Assume good intent. Prefer clear, reversible changes.
