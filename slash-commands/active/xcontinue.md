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
- Look for files matching: `*plan*`, `*PLAN*`, `EXECUTION-PLAN*`, `*execution*plan*`
- Common names: `EXECUTION_PLAN.md`, `PLAN.md`, `execution-plan.md`
- Exclude: `node_modules/`, `.git/`, `vendor/`

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
3. Run validation if applicable (tests, lint, build)
4. Verify acceptance criteria pass

### Step 4: Update Plan and Handoff

After completing the task:
1. Update the plan file — mark the task as `[x] done` with a timestamp
2. Update any counters (Done/Remaining) in the plan header
3. Tell the user:

```
Task #N complete: [brief summary]
Run /clear then /xcontinue to proceed to the next task.
```

This handoff protocol ensures context stays fresh across sessions.
