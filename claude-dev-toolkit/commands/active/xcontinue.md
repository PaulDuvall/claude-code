---
description: Continue an execution plan from where it left off across sessions
tags: [workflow, execution-plan, session-continuity, automation]
---

# Execution Plan Continuation

Resume a multi-step execution plan, picking up at the next incomplete task.

## Usage Examples

**Resume the current plan:**
```
/xcontinue
```

**Help and options:**
```
/xcontinue help
/xcontinue --help
```

## Implementation

If $ARGUMENTS contains "help" or "--help":
Display this usage information and exit.

### Step 1: Find the Execution Plan

Search for execution plan files in the current directory:

```bash
find . -maxdepth 2 -iname "*plan*" -name "*.md" ! -path "*/node_modules/*" ! -path "*/.git/*" 2>/dev/null
```

- Common names: `EXECUTION_PLAN.md`, `PLAN.md`, `execution-plan.md`

If no plan file is found:
- Tell the user: "No execution plan found in this directory."
- Suggest creating one with a basic template:

```markdown
# Execution Plan

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | [First task] | [ ] pending | |
| 2 | [Second task] | [ ] pending | |
```

Stop and wait for user input.

### Step 2: Parse Plan Progress

Read the plan file and identify:
- **Completed tasks**: Lines with `[x]`, `done`, or checkmarks
- **Pending tasks**: Lines with `[ ]`, `pending`, or unchecked items
- **In-progress tasks**: Lines with `in-progress` or `in progress`

Display a progress summary:
```
Progress: X of Y tasks complete
Next task: [description of next pending task]
```

If all tasks are complete:
- Congratulate the user
- Summarize what was accomplished
- Suggest cleanup: "Consider deleting the plan file if work is done."
- Stop execution.

### Step 3: Execute Next Task

Pick the first task with status `pending` or `[ ]`:
1. Read the task description and any acceptance criteria
2. Implement the task fully
3. Proceed to Step 3.1 (Validation Gate)

### Step 3.1: Validation Gate

After implementing a task, run validation checks automatically:

1. **Detect project type** and determine the appropriate validation commands:
   - If `package.json` exists: `npm test`, `npm run lint` (if script exists)
   - If `go.mod` exists: `go test ./...`, `go vet ./...`
   - If `requirements.txt` or `pyproject.toml` exists: `pytest`, `ruff check .` or `flake8`
   - If `Makefile` exists with `test` target: `make test`
   - If `Cargo.toml` exists: `cargo test`, `cargo clippy`
   - Always check: files changed are syntactically valid

2. **Run validation** and capture results:

```
Validation Gate — Task #N
  Tests:  [PASS/FAIL]
  Linter: [PASS/FAIL/SKIP]
  Build:  [PASS/FAIL/SKIP]
```

If all checks pass: proceed to Step 3.2.
If any check fails: proceed to Step 3.3.

### Step 3.2: Complexity Check

After validation passes, check the changed code for quality violations:

- Functions over 20 lines
- Nesting depth over 3 levels
- Cyclomatic complexity over 10

If violations are found:
1. List each violation with file path and line number
2. Auto-refactor: apply Extract Method, guard clauses, or early returns to fix
3. Re-run Step 3.1 to validate the refactored code
4. If refactoring introduces new failures, revert and keep the pre-refactor version

If no violations: proceed to Step 4.

### Step 3.3: Self-Healing Retry Loop

When validation fails, attempt automatic recovery up to 3 times:

**Retry 1 — Targeted Fix:**
1. Read the error output from the failing check
2. Identify the root cause (test failure, lint error, type error, build error)
3. Apply a targeted fix to the specific issue
4. Re-run Step 3.1

**Retry 2 — Broader Fix:**
1. If the same check still fails, examine surrounding code for related issues
2. Apply a broader fix addressing the pattern, not just the symptom
3. Re-run Step 3.1

**Retry 3 — Minimal Revert:**
1. If still failing, revert to the state before this task started
2. Re-implement with a simpler approach (fewer changes, more conservative)
3. Re-run Step 3.1

**After 3 failed retries:**
1. Revert all changes for this task
2. Mark the task as `[!] blocked` in the plan with the error details
3. Log a diagnostic note in the plan:

```
Task #N BLOCKED — [error summary]
Attempts: 3 | Last error: [specific failure]
Manual intervention required.
```

4. Skip to the next independent task (one that doesn't depend on the blocked task)
5. If no independent tasks remain, stop and report

### Step 4: Update Plan and Handoff

After completing the task (with validation passing):
1. Update the plan file — mark the task as `[x] done` with a timestamp
2. Update any counters (Done/Remaining) in the plan header
3. Record validation results in the task notes:

```
Task #N: [description]
Status: [x] done (2026-03-22)
Validation: tests=pass, lint=pass
Retries: 0
```

4. Tell the user:

```
Task #N complete: [brief summary]
Validation: all checks passed
Run /clear then /xcontinue to proceed to the next task.
```

If any tasks were blocked during this session, also report:

```
Blocked tasks requiring attention:
- Task #M: [error summary]
```

This handoff protocol ensures context stays fresh across sessions.
