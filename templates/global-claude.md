# Global CLAUDE.md Template

> **Installation**: Copy this file to `~/.claude/CLAUDE.md` to apply these standards to all your projects.
>
> ```bash
> cp templates/global-claude.md ~/.claude/CLAUDE.md
> ```

---

# Universal Development Protocol

This file governs all development work. Follow it automatically.

---

## PHASE 1: PREFLIGHT (Before Any Implementation)

### 1.1 Clarifying Questions — MANDATORY

**STOP. Do not write code yet.**

Present clarifying questions for ANY ambiguous aspect:

```
### Before I proceed, I need to understand:

**[Category]:**
- [ ] **Option A**: [description] ← Recommended: [reason]
- [ ] **Option B**: [description]

Please respond with your choices.
```

Cover as needed: architecture, data layer, auth, API style, testing approach, deployment target.

**Do not proceed until the user responds.**

### 1.2 Beads Task Check

```bash
bd ready --json
```

- If a task exists for this work → reference it, update status to `in_progress`
- If no task exists → create one before implementing:

```bash
bd create "TITLE" -t TYPE -p PRIORITY -d "DESCRIPTION with acceptance criteria" --json
```

### 1.3 Context Detection

Identify: What language? What framework? What's already in the codebase?

Adapt standards to match existing patterns unless explicitly asked to refactor.

---

## PHASE 2: IMPLEMENTATION STANDARDS

Apply these gates to ALL code. Non-negotiable.

### 2.1 Code Structure

| Rule | Limit |
|------|-------|
| Function length | ≤20 lines |
| Class length | ≤250 lines |
| Nesting depth | ≤3 levels |
| Cyclomatic complexity | ≤10 per function |

**Fix with:** Extract Method, Extract Class, guard clauses, early returns.

### 2.2 Security — Never Compromise

- [ ] **No hardcoded secrets** — use environment variables
- [ ] **Parameterized SQL** — never string interpolation
- [ ] **Validate all inputs** — type, range, format
- [ ] **Encode outputs** — HTML escape, JSON encode
- [ ] **Generic error messages** — no stack traces, no internal paths
- [ ] **Timing-safe comparisons** — for tokens and passwords
- [ ] **Bcrypt/Argon2** — for password hashing

### 2.3 Testing

| Scope | Coverage |
|-------|----------|
| Overall | ≥80% |
| Critical paths (auth, payments, security) | 100% |

Include:
- Unit tests for isolated logic
- Integration tests for component interactions
- Edge cases: empty, null, boundaries, errors

**Never delete passing tests. Never skip tests to ship faster.**

### 2.4 Performance

- [ ] No N+1 queries — use eager loading
- [ ] Paginate all list endpoints
- [ ] API response target: <200ms
- [ ] Use appropriate data structures (dict for lookup, set for membership)

### 2.5 Documentation

- [ ] Docstrings on all public functions (params, returns, raises)
- [ ] Inline comments explain **why**, not what
- [ ] Keep docs current with code

### 2.6 Naming

- Functions: `verb_noun()` — `calculate_total()`, `validate_email()`
- Booleans: `is_`, `has_`, `can_`, `should_`
- Classes: Nouns — `OrderProcessor`, `UserRepository`
- No abbreviations, no single letters (except `i`, `j` in loops)

---

## PHASE 3: BOOTSTRAP & DEVEX (When Applicable)

If the task involves setup, installation, or onboarding:

### Poka-Yoke Principles

- [ ] **Single entry point** — one command to set up everything
- [ ] **Idempotent** — safe to run multiple times
- [ ] **Detect existing state** — skip what's already done
- [ ] **Validate prerequisites** — with actionable remediation messages
- [ ] **Platform detection** — handle macOS/Linux/Windows differences
- [ ] **Progress feedback** — show what's happening
- [ ] **Fail fast** — clear errors, not silent failures

---

## PHASE 4: COMPLETION CHECKLIST

Before finishing ANY response that includes code:

- [ ] Tests included or mentioned?
- [ ] Security checklist passed?
- [ ] Functions under 20 lines?
- [ ] Task to close? → `bd close ID --reason "..."`
- [ ] New issues discovered? → Create Beads tasks for them
- [ ] Commit ready? → `type(scope): description [bd-xxx]`

---

## PHASE 5: CI/CD VERIFICATION

Before declaring work complete:

- [ ] Would `lint` pass?
- [ ] Would `test` pass?
- [ ] Would `build` pass?

If uncertain, remind user to run locally or in CI before merging.

---

## PHASE 6: SESSION END

When the user indicates they're done, or before a long pause:

### Remind the user:

1. **Sync Beads:** `bd sync`
2. **Commit work:** `git add . && git commit -m "type(scope): description [bd-xxx]"`
3. **Push:** `git push`
4. **PR if ready:** Create with task IDs in description

### Provide:

- Summary of what was accomplished
- List of open Beads tasks
- Suggested next task or action

---

## FAILURE PROTOCOL

### Three Strikes Rule

If the same test/build fails **3 times in a row**:

1. **STOP** — do not keep trying the same approach
2. **Revert** — `git checkout .` or restore last working state
3. **Create HANDOFF.md:**

```markdown
# HANDOFF

## What Was Attempted
[Description of the goal]

## What Failed
[Specific error or failure]

## Attempts Made
1. [First approach and result]
2. [Second approach and result]
3. [Third approach and result]

## Reproduction Steps
[How to reproduce the failure]

## Suggested Next Steps
[What to try differently]

## Relevant Files
[List of files involved]
```

4. **Create Beads task** for the blocker if one doesn't exist

### Scope Overflow

If a single task would require >400 lines changed:
- Stop
- Propose a smaller "tracer bullet" slice
- Break into multiple Beads tasks

---

## RALPH WIGGUM LOOPS

For autonomous work spanning multiple iterations:

### When to Suggest Ralph

- Large implementation tasks with clear acceptance criteria
- Batch operations (refactoring, test coverage, migrations)
- Tasks with objective completion signals (tests pass, lint clean)

### Format

```bash
caffeinate -i /ralph-loop "PROMPT" \
  --max-iterations 20 \
  --completion-promise "COMPLETE"
```

### Prompt Should Include

- Clear acceptance criteria
- What to do if stuck
- The completion signal to output

### In Ralph Loops

- Check for previous user answers before re-asking questions
- Output `<promise>AWAITING_INPUT</promise>` if questions are unanswered
- Track iteration count, be aware of token costs

---

## BEADS QUICK REFERENCE

```bash
# See what's ready to work on
bd ready --json

# Create a task
bd create "Title" -t task -p 1 -d "Description" -l "labels" --json

# Start work
bd update ID --status in_progress

# Add dependency (B blocks A)
bd dep add A B --type blocks

# Link discovered issue
bd dep add NEW PARENT --type discovered-from

# Complete task
bd close ID --reason "Completed"

# Sync with git
bd sync
```

### Task Types
`epic`, `feature`, `bug`, `task`, `chore`

### Priorities
`0` Critical, `1` High, `2` Medium, `3` Low, `4` Backlog

---

## COMMIT FORMAT

```
type(scope): description [bd-xxx]

body (optional)
```

**Types:** `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

**Examples:**
```
feat(auth): implement JWT refresh tokens [bd-a1b2]
fix(api): prevent N+1 query in orders list [bd-f14c]
test(users): add integration tests for registration [bd-3e7a]
```

---

## THE ONE THING

If you remember nothing else:

> **Ask questions first. Create Beads tasks. Follow the checklists. Sync before ending.**

Everything else flows from that.
