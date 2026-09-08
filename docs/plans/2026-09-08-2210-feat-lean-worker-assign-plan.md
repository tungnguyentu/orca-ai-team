---
title: Lean Worker Assign - Plan
type: feat
date: 2026-09-08
topic: lean-worker-assign
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-brainstorm
execution: code
---

# Lean Worker Assign - Plan

## Goal Capsule

- **Objective:** After a worker pane is primed once, each new task arrives as a short task card — not a full worker bible or fat platform inject — so team runs burn less usage while workers still report `worker_done` / `ask`.
- **Means:** `orca-team assign` with send-once role markers + `dispatch` without `--inject` + short card `terminal send` (KTD1, KTD2).
- **Product authority:** This plan owns worker send-once + short per-task assign. Broader usage budget, lean orchestrator prompts, provider prompt-cache, and dedicated report-back watchdog product are surrounding areas, not active scope.
- **Open blockers:** None.
- **Product Contract preservation:** restructured, no scope change: Outstanding Questions (Deferred to Planning) → resolved as KTD1–KTD4; Sources updated with plan research path.

## Product Contract

### Summary

Ship a lean **worker assign** path: full worker role once per fresh pane; every later task goes through an assign helper that avoids fat Orca inject and sends a short task card (goal/paths, done criteria, ids, `worker_done`/`ask` one-liner).

### Problem Frame

Today every new task effectively re-dumps the full worker role into the pane (and often rides a fat `dispatch --inject` / `worker-start` preamble). Operators see the same long inject stacked on each assignment. That burns quota, buries the actual task, and still does not guarantee report-back. orca-team has start/reinject of full templates and a post-facto watch nudge, but no send-once assign path.

### Key Decisions

- **Focus this plan on lean worker prompts + send-once** over provider-cache-first or a whole-team usage redesign. (session-settled: user-directed — chosen over report-back-primary / whole-budget / one-package: primary pain is every-task full worker resend)
- **Send-once locally** — role once per fresh pane; later tasks are short cards only. (session-settled: user-directed — chosen over provider prompt-cache or both-layers-first)
- **Shrink both** the orca-team role dump and the fat Orca task preamble, via workarounds if Orca cannot change. (session-settled: user-directed — chosen over role-only or task-text-only)
- **Work around Orca inject** rather than requiring an upstream inject redesign for v1. (session-settled: user-directed — chosen over must-change-Orca)
- **Full worker role re-send only on a fresh pane.** (session-settled: user-directed — chosen over also-on-reinject / also-after-idle / never-even-on-fresh)
- **Workers only in v1** — orchestrator keeps the fuller prompt. (session-settled: user-directed — chosen over workers+orch / orch-first)
- **Enforce via an assign helper (Approach B)**, not convention alone. (session-settled: user-approved — chosen over task-card-only convention or standing-rules-file-first)
- **v1 success signals:** shorter per-task injects, noticeably lower usage, and still-reliable `worker_done`/`ask`. (session-settled: user-directed — A/B/C over also requiring orch anti-drift as a must-have)

Governs R1, R2, R3, R4, R5, R6, R7.

### How This Work Fits Together

<!-- ce-section: work-relationships -->

This plan owns **lean worker assign / send-once**. The broader request also mentioned usage burn, output quality, and forgotten report-back; those stay contextual:

- **Lean orchestrator prompt** — Can proceed independently of this plan; deferred
- **Provider prompt-cache APIs** — Can proceed independently; deferred
- **Upstream Orca inject redesign** — Depends on platform owners; this plan workarounds instead
- **Dedicated report-back / watchdog product** — Shares the need that cards keep a `worker_done`/`ask` one-liner (R4); fuller reliability work can proceed independently later

### Actors

- A1. **Operator** — human running `orca-team`; wants shorter injects and lower burn
- A2. **Orchestrator agent** — must prefer the lean assign path for workers
- A3. **Worker agent** — receives role once, then short cards; must still finish with `worker_done` / `ask`
- A4. **orca-team CLI** — owns send-once state and the assign helper

### Requirements

**Send-once lifecycle**

- R1. On team start (and whenever a **new** worker pane is created), orca-team may inject the full worker role prompt **once** into that pane.
- R2. After a pane has received its one-time role, assigning another task to that pane must **not** re-send the full worker role template.
- R3. If a worker pane is replaced (crash / closed / new `worker-start` terminal), treat it as fresh: one full role inject is allowed again before short cards resume.

**Lean assign helper**

- R4. orca-team exposes an assign path (command or equivalent operator/orch-facing entry) that gives a live worker the next task as a **short task card** containing at least: goal + in/out-of-scope paths; done criteria; exact `worker_done` / `ask` one-liner; run id + task/dispatch ids.
- R5. That assign path must **avoid** Orca’s fat `dispatch --inject` / equivalent full preamble for the common case (workaround acceptable).
- R6. Orchestrator guidance for this product must steer assignment through the lean assign path for roster workers, not through “paste full worker bible again” or default fat inject.

**Observability / success**

- R7. An operator can tell that a given assignment used the lean card path (not a full role dump), sufficiently to judge A/B success on a typical run.

### Key Flows

- F1. **Fresh worker then first task**
  - **Trigger:** start opens a worker pane, or a new pane is spawned for a worker.
  - **Steps:** inject full worker role once → assign first task via lean helper → worker receives short card only for the task payload.
  - **Covers R1, R3, R4, R5.**

- F2. **Second task on same pane**
  - **Trigger:** orchestrator assigns another task to a worker whose pane already had the role.
  - **Steps:** lean helper creates/binds work without fat inject → sends short card → does not re-send full role.
  - **Covers R2, R4, R5.**

- F3. **Pane death / replace**
  - **Trigger:** worker terminal exited; work continues on a new pane.
  - **Steps:** new pane counts as fresh → one full role inject → subsequent tasks lean again.
  - **Covers R3.**

### Acceptance Examples

- AE1. **When** a worker pane already received the start role and gets a second task via the lean assign path, **then** the second inject is a short card (R4 fields) and does **not** include the full worker role template. **Covers R2, R4.**
- AE2. **When** assignment would previously have used fat `dispatch --inject`, **then** the lean path still delivers task ids + done criteria + report-back one-liner without that fat preamble in the common case. **Covers R5, R4.**
- AE3. **When** a worker pane is replaced and work continues, **then** exactly one full role inject is allowed on the new pane before short cards resume. **Covers R3.**
- AE4. **When** an operator inspects a lean assignment, **then** they can distinguish it from a full role dump. **Covers R7.**

### Success Criteria

- Per-task worker injects are visibly short cards, not full role + fat preamble stacks.
- A typical multi-task team run shows noticeably lower usage than today’s every-task full resend pattern.
- Workers still emit `worker_done` or `ask` often enough that silent completion is not the common failure mode under the shorter card (card must carry the one-liner per R4).

### Scope Boundaries

**In scope**

- Worker send-once role lifecycle
- Lean assign helper + short task card contract
- Orchestrator guidance to use that path
- Workarounds that avoid fat Orca inject for the common case

**Deferred for later**

- Lean orchestrator prompt rewrite
- Provider prompt-cache APIs
- Upstream Orca inject redesign
- Broader usage-budget product (roster/model policy beyond this assign path)
- New watchdog / report-back product beyond the card’s `worker_done`/`ask` one-liner

**Outside this plan’s identity**

- Redesigning Orca orchestration mail itself
- Changing non-worker agents’ product UX outside orca-team

### Dependencies / Assumptions

- Orca continues to support task create, worker terminals, and `terminal send` without requiring fat inject for every assignment.
- A “fresh pane” can be detected reliably enough (new handle / new spawn) for R1/R3.
- Assumption: short cards that include R4’s report-back one-liner are sufficient for v1 reliability; dedicated watchdog work remains deferred.

### Outstanding Questions

None blocking. Prior deferred-to-planning items resolved as KTD1–KTD4.

### Sources / Research

- Plan research brief: grounding for inject/dispatch shapes (see Planning Contract Sources).
- Confirmed in-repo: start injects full worker template via `terminal send`; no assign/short-card command today; `reinject` resends full templates; no send-once lifecycle; `watch` nudges missing `worker_done` but does not stop full role resends on new tasks (`scripts/orca-team`, `references/role-prompts.md`).
- Orca: `dispatch --inject` is **opt-in**; omit it to avoid fat preamble. `worker-start` always injects task input — avoid for primed panes.

## Planning Contract

### Key Technical Decisions

- KTD1. **Common assign path = `task-create` → `dispatch` without `--inject` → `terminal send` short card.** Do not use `worker-start` for primed roster panes (it always injects). (session-settled: user-approved — chosen over worker-start-reuse: fat inject unavoidable on that path) — Governs R5, R4.
- KTD2. **CLI surface = `orca-team assign`.** Args at minimum: `--worker <agentId|handle>`, `--spec <text>` (or structured goal/paths/done flags), optional `--task-id`, `--force-role`, `--dry-run`, `--json`. — Governs R4, R7.
- KTD3. **Send-once markers on each worker member in `.orca/ai-team.json`:** store `roleInjectedHandle` (+ optional `roleInjectedAt`). Fresh when handle missing/dead, deferred, or `roleInjectedHandle !=` current handle. Start sets markers after first role inject. — Governs R1, R2, R3.
- KTD4. **`reinject` for workers becomes lean-safe:** default worker target gets a short “role already loaded / follow standing rules + report-back” reminder (or skip), not the full Worker template. Full worker role only on fresh pane or `--force-role`. Orchestrator reinject may remain full. — Governs R2, R6.
- KTD5. **R7 marker:** every lean card and CLI output includes a stable tag such as `[orca-team lean-assign]` plus `mode=lean|role-once` so operators can tell paths apart without noisy logs.

### High-Level Technical Design

```text
Operator/Orch
    │
    ▼
orca-team assign
    │
    ├─ resolve member + orch + runId (ai-team.json)
    ├─ freshness check (handle live? roleInjectedHandle?)
    │     ├─ fresh → build_role_prompt(worker) → terminal_send → set markers
    │     └─ primed → skip role
    ├─ task-create (unless --task-id)
    ├─ dispatch --task --to <handle> --from <orch> --run <runId>   # NO --inject
    └─ terminal_send(short card with [orca-team lean-assign])
```

Fresh spawn (deferred / dead pane): spawn via `worker-start --agent` (accept one platform inject) **or** create terminal then role-once + lean dispatch; prefer documenting the simpler spawn-then-marker path in U3.

### Assumptions

- Omitting `--inject` on `dispatch` is sufficient to avoid the fat platform preamble in current Orca.
- `terminal list` / handle status is enough to detect dead panes for freshness.
- Orchestrator will follow updated role-prompts that prefer `orca-team assign` once documented.

### Implementation Constraints

- Prefer extending `scripts/orca-team` over new packages.
- Keep worker role text in `references/role-prompts.md`; do not hardcode long prompts in assign.
- Version bump + SKILL/AGENTS/README docs in the same change set as the CLI.

### Sequencing

1. U1 markers + freshness helpers  
2. U2 short card builder + dry-run  
3. U3 `assign` command (dispatch sans inject)  
4. U4 start marker write + reinject lean-safe for workers  
5. U5 orchestrator prompt / docs steer to `assign`  
6. U6 smoke / VERSION

### Sources / Research (planning)

- `scripts/orca-team`: start inject ~1848–1880; `build_role_prompt` ~2112–2153; `reinject_roles` ~2292–2354; `terminal_send` ~1227–1253; supervise worker-start ~1882–1992; `load_state`/`save_state` ~758–772.
- Orca CLI: `orchestration dispatch` optional `--inject`; `worker-start` has no skip-inject flag.
- Research brief path used during planning: `/tmp/compound-engineering-1000/ce-plan/lean-worker-assign/research.md` (ephemeral).

## Implementation Units

### U1. Send-once freshness helpers + state fields

- **Goal:** Persist and evaluate whether a worker pane still needs a full role inject.
- **Requirements:** R1, R2, R3 — KTD3
- **Files:** `scripts/orca-team`
- **Approach:** Add member fields `roleInjectedHandle` / `roleInjectedAt`. Helpers: `member_needs_role_inject(member, live_handles)`, `mark_role_injected(member, handle)`, clear markers when handle goes missing. Reuse patterns from `cmd_status` live-handle checks.
- **Dependencies:** none
- **Test scenarios:**
  - Happy: member with matching `roleInjectedHandle` → needs_role=false
  - Edge: handle changed / not in live list → needs_role=true
  - Edge: deferred / no handle → needs_role=true when a handle appears
  - Error: malformed member dict → safe default needs_role=true
- **Verification:** unit-level pure function checks (or `--dry-run` introspection); `python -m py_compile scripts/orca-team`

### U2. Short task card builder

- **Goal:** Build the R4 card text with stable lean marker (KTD5).
- **Requirements:** R4, R7 — KTD5
- **Files:** `scripts/orca-team`
- **Approach:** Function `build_lean_task_card(...)` requiring goal/paths, done criteria, runId, taskId, dispatchId, worker_done/ask one-liners. Prefix `[orca-team lean-assign]`. Keep under a small char budget (implementation chooses a soft cap; fail loud if missing required fields).
- **Dependencies:** none (can land with U1)
- **Test scenarios:**
  - Happy: all fields present → card contains marker, ids, worker_done one-liner
  - Edge: missing done criteria → error before send
  - Edge: card must not contain full Worker template body
- **Verification:** pure assertions on returned string; py_compile

### U3. `orca-team assign` command

- **Goal:** Operator/orch entry that assigns without fat inject on primed panes.
- **Requirements:** R4, R5, R7 — KTD1, KTD2, KTD5
- **Files:** `scripts/orca-team`, `SKILL.md`, `AGENTS.md`, `README.md`
- **Approach:** Subcommand `assign` per KTD2. Flow: load running state → resolve worker → optional role-once (U1) → task-create unless `--task-id` → `dispatch` **without** `--inject` → `terminal_send` card (U2) → save state (`lastAssignMode`, `lastTaskId` optional). `--dry-run` prints planned actions without send. For deferred/dead: spawn path then mark fresh; document that first spawn may still see one platform inject from `worker-start`.
- **Dependencies:** U1, U2
- **Test scenarios:**
  - Happy: primed worker → dry-run shows no role inject, dispatch without `--inject`, card send
  - Happy: fresh worker → dry-run shows role inject then lean card
  - Error: no running team / unknown worker → clear TeamError
  - Integration: after real assign, CLI output includes `mode=lean` or `mode=role-once` (R7)
- **Verification:** `orca-team assign --help`; dry-run against a fixture state if practical; py_compile; manual smoke on a live team when available

### U4. Start writes markers; reinject lean-safe for workers

- **Goal:** Align start/reinject with send-once so ops paths do not re-bible workers.
- **Requirements:** R1, R2 — KTD3, KTD4
- **Files:** `scripts/orca-team`
- **Approach:** After successful start worker role `terminal_send`, call `mark_role_injected`. Change `reinject_roles` / `cmd_reinject`: for worker members, send short reminder unless `--force-role` or needs_role; orchestrator path unchanged (full template + correction prefix OK).
- **Dependencies:** U1
- **Test scenarios:**
  - Happy: start leaves `roleInjectedHandle` set for each injected worker
  - Happy: `reinject` without force does not send full Worker section to primed workers
  - Edge: `--force-role` (or equivalent) restores full worker template
- **Verification:** dry-run/reinject behavior checks; py_compile

### U5. Orchestrator guidance prefers `orca-team assign`

- **Goal:** Stop teaching fat inject as the default for roster workers.
- **Requirements:** R6 — KTD1, KTD2
- **Files:** `references/role-prompts.md`, `AGENTS.md`, `SKILL.md`
- **Approach:** In Orchestrator “How to coordinate”, prefer `orca-team assign --worker … --spec …` for roster workers. Keep `worker-start --agent` for deferred/fresh spawn only. Mention send-once: do not paste full worker role on later tasks. Mirror in AGENTS/SKILL briefly.
- **Dependencies:** U3 (command exists)
- **Test scenarios:**
  - Happy: role-prompts mention `orca-team assign` and omit recommending `--inject` as the default for primed workers
  - Edge: deferred/command-code still documents fresh `worker-start --agent`
- **Verification:** grep/doc review; reinject orch to pick up prompts on next team

### U6. Version, doctor/status hints, smoke

- **Goal:** Ship discoverability and a minimal confidence gate.
- **Requirements:** R7
- **Files:** `VERSION`, `scripts/orca-team`, `SKILL.md`
- **Approach:** Bump VERSION. `status` may show per-worker `roleInjected` / last assign mode. `doctor` notes assign availability. Document in SKILL how-to.
- **Dependencies:** U3–U5
- **Test scenarios:**
  - Happy: `orca-team --version` reflects bump; `assign` listed in help
  - Smoke: `python -m py_compile scripts/orca-team`
- **Verification:** version + help + compile

## Verification Contract

- `python -m py_compile scripts/orca-team`
- `orca-team assign --help` (after U3)
- Prefer pure helper tests or `--dry-run` fixtures for U1–U3; no mandatory live multi-agent CI for v1
- Manual smoke when a team is available: start → assign twice to same worker → confirm second send is short card only; `reinject` does not full-bible workers

## Definition of Done

- All U1–U6 landed; Product Contract R1–R7 satisfied
- Primed second assign does not resend full Worker template (AE1)
- Common path does not use `dispatch --inject` (AE2)
- Fresh/replaced pane allows one role inject then lean again (AE3)
- Operators can see lean vs role-once via marker/output (AE4)
- Docs steer orchestrator to `orca-team assign` (R6)
- Abandoned experiment code removed; VERSION bumped
