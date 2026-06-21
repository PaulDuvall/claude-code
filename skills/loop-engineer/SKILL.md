---
name: loop-engineer
description: Design, build, and debug multi-agent loops and orchestrations — coordinator loops that supervise worker loops. Use this skill whenever Paul is building or reasoning about an agent workflow, a fan-out/fan-in, a Claude Code Workflow script, a coordinator/worker or drafter/grader setup, a standing or scheduled "guardian" loop, or anything that runs subagents in parallel or on a schedule. Trigger on phrases like "build a workflow", "fan out agents", "orchestrate", "agent team", "coordinator loop", "supervise subagents", "run this on a schedule", "loop until done", "self-healing/standing loop", or when a task is large enough to decompose across many subagents. Also trigger when a loop is misbehaving — workers racing on files, audits that won't converge, daemon/git conflicts, runaway cost. Provides a failure-mode checklist (the seams where loops break) plus four battle-tested templates (detect / fix / guardian / deterministic-guard) to start from instead of a blank file.
---

# Loop Engineer

Build agent loops that supervise other loops. **The unit of work is the LOOP, not the task** — you write partitions, completion conditions, and supervision logic, not one-shot prompts. And **most of the engineering is at the SEAMS** (where workers, git, daemons, and convergence meet), not the happy path. The agent work usually "just works"; the orchestration around it is the craft.

## Use this when
- Designing a Claude Code Workflow that fans out subagents (`pipeline()` / `parallel()`).
- Building a coordinator that spawns and grades worker loops.
- Setting up a standing / scheduled "guardian" that detects and repairs drift.
- Debugging a loop that's racing, not converging, or fighting your tooling.

## The failure-mode checklist (where loops actually break)

**Partitioning / isolation**
- [ ] **Canonicalize each work-item key BEFORE grouping.** Mixed absolute/relative paths (or any aliasing) silently split one resource into two buckets → two writers race on one file. Enforce **one writer per resource** in the partition, not by hope.
- [ ] **Right-size before reaching for worktrees.** Sequential-on-one-branch beats parallel worktrees when items are *few or overlapping* (no merge step, no collisions). Worktrees earn their cost only when workers are *many AND independent*.

**Verification quality**
- [ ] **Producer ≠ grader.** The agent that writes a change must never grade it. Spawn an independent evaluator and instruct it to **default to REJECT when unsure**.
- [ ] **Add a review-AFTER-apply stage.** It catches fabrication / over-correction the producer is blind to. Reconcile reviewer verdicts — reviewers can read *stale state* mid-race.
- [ ] **Include a "what's missing" worker**, not just per-item checkers. Coverage-gap finders surface what isn't there.

**Convergence / determinism**
- [ ] **LLM loops don't converge in one pass, and they re-churn on re-run.** Plan for loop-until-dry, a residue + human pass, or just accept some lateral diff.
- [ ] **Pair every probabilistic loop with a CHEAP DETERMINISTIC GUARD** that encodes the high-value invariants, wired into tests + CI. Agents discover and repair; code prevents regression and runs free on every commit. *Detect with agents, guard with code.*
- [ ] **Define "done" as a checkable invariant** the coordinator evaluates (e.g. "report clean AND suite green AND re-verify clean") so the loop can stop or return early.

**Safety / supervision**
- [ ] **Classify findings: mechanical (auto-fix) vs needs-decision (PARK, never guess).** A behavior change is *never* mechanical. Capture the human's decisions as **durable inputs** (issue tracker / `args`) so the next run is fully unattended.
- [ ] **Never auto-merge to main.** Know your integration side effects (deploy triggers, etc.); land on a branch, open a PR, or use `[skip ci]` for no-op-runtime changes.

**State / tooling hazards**
- [ ] **State lives in the issue tracker + git + files, NEVER the context window.** Commit at phase boundaries; rely on resume + file checkpoints so a crash or a 20-minute background run can't lose the thread.
- [ ] **Background daemons / auto-committers race your orchestration's git.** Use the tool's *own* commit path; expect incremental-sync watermarks to desync (keep a `--force` escape hatch); know **which worktree owns which branch** before automating around it.

**Treat the loop as software**
- [ ] **When the loop reveals its own bug, fix the loop's CODE** — not just the symptom it produced.
- [ ] **Dogfood:** a loop that re-runs on its own output and reports "clean" is the real acceptance test.

## Templates (start here, don't start blank)

Copy a template, swap the **work-list + per-item prompts + invariants**, keep the structure — it encodes the checklist above.

**Install before you run.** The `.workflow.js` templates call each other by name (`guardian` invokes `workflow('fan-out-audit')` and `workflow('drafter-grader')`). For those to resolve, save each template into the repo's `.claude/workflows/` directory and keep its `meta.name` matching the `workflow('<name>')` call. Copy a template standalone and the cross-references throw "unknown workflow name."

- `templates/fan-out-audit.workflow.js` — **DETECT.** Fan out auditors over a work-list, adversarially cross-check each finding, apply, review-after-apply, report. (spec↔code audit, code review, migration discovery, research sweep.)
- `templates/drafter-grader.workflow.js` — **FIX.** Per item, a drafter implements and a *separate* grader scores it against a rubric; lands on a review branch only.
- `templates/guardian.workflow.js` — **COORDINATE.** Standing loop: detect → triage (mechanical vs park) → fix mechanical → re-verify. Never merges to main.
- `templates/deterministic_guard.py` — **GUARD.** The cheap, no-LLM invariant-checker pattern + how to wire it into pytest / CI. The Python is illustrative — it's a *pattern*: in a JS repo encode the same invariant as a vitest/jest test, in a shell repo as a bats assertion in your suite runner.

Reference implementations (a real, shipped instance of all four): the `fin` repo's `.claude/workflows/verify-specs.js`, `fix-spec-findings.js`, `spec-sync-guardian.js`, and `scripts/check_spec_invariants.py`.

## Quick decision guide
- **One well-scoped fan-out?** → a single Workflow with `pipeline()` (verify → adversarial-verify per item).
- **Fix N findings?** → drafter-grader; sequential if few/overlapping, worktree-parallel if many/independent.
- **Want it self-healing?** → guardian on a schedule / CI trigger, plus a deterministic guard for regressions.
- **Unsure when it's done?** → write the invariant first; the coordinator stops when it holds.
