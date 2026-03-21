> **EPHEMERAL DOCUMENT** - Delete this file after all tasks are completed
>
> **Purpose:** Single source of truth for Beads task execution loop
> **Lifecycle:** Created 2026-03-20, Delete after all tasks verified complete

# Execution Plan

**Status:** ALL COMPLETE | Generated: 2026-03-20T20:45:00-04:00
**Total tasks:** 9 | **Done:** 9 | **Remaining:** 0

## Task Queue

| # | Bead ID | Task Name | Status | Dependencies | Started | Completed |
|---|---------|-----------|--------|--------------|---------|-----------|
| 1 | claude-code-8g8 | Read npm sync rules (no code) | done | none | 2026-03-20 | 2026-03-20 |
| 2 | claude-code-d6g | Fix broken hook references (13 skeleton hooks) | done | #1 | 2026-03-20 | 2026-03-20 |
| 3 | claude-code-kxh | Add verification/zero-error rules to global CLAUDE.md | done | #1, #2 | 2026-03-20 | 2026-03-20 |
| 4 | claude-code-5mw | Create pre-commit test runner hook | done | #1, #2 | 2026-03-20 | 2026-03-20 |
| 5 | claude-code-3og | Create xcontinue slash command | done | #1, #3 | 2026-03-20 | 2026-03-20 |
| 6 | claude-code-6ck | Create xexplore slash command | done | #1 | 2026-03-20 | 2026-03-20 |
| 7 | claude-code-qji | Create verify-before-edit hook | done | #1, #2 | 2026-03-20 | 2026-03-20 |
| 8 | claude-code-vc3 | Update stale model ID in templates | done | #1, #2 | 2026-03-20 | 2026-03-20 |
| 9 | claude-code-p61 | Update postinstall.js and setup-wizard.js | done | #2, #4, #7 | 2026-03-20 | 2026-03-20 |

## Execution Phases

### Phase 1: Read-only prerequisite
- **#1 claude-code-8g8**: Read and acknowledge the 6 rules for dual-write, hook metadata, test counts, security keywords, env vars, and chmod. No code changes.

### Phase 2: Fix broken state
- **#2 claude-code-d6g**: Create 13 skeleton hook scripts referenced by settings templates but missing from disk. Copy all to claude-dev-toolkit/hooks/. Update test expectedHooks arrays. Update hooks/README.md.

### Phase 3: New features (sequential within context, but independent)
- **#3 claude-code-kxh**: Add 3 new sections (2.7, 2.8, 2.9) to templates/global-claude.md. Copy to claude-dev-toolkit/templates/. Update test expectedTemplates.
- **#4 claude-code-5mw**: Create hooks/pre-commit-test-runner.sh with auto-detect logic for 6 test frameworks. Dual-write. Update test hooks array. Add to settings templates.
- **#5 claude-code-3og**: Create slash-commands/active/xcontinue.md. Dual-write. Increment active command count in tests.
- **#6 claude-code-6ck**: Create slash-commands/active/xexplore.md. Dual-write. Increment active command count in tests.
- **#7 claude-code-qji**: Create hooks/verify-before-edit.sh (non-blocking, uses env vars). Dual-write. Update test hooks array. Add to settings templates.
- **#8 claude-code-vc3**: Update model ID from claude-3-5-sonnet-20241022 to claude-sonnet-4-6. Dual-write templates.

### Phase 4: Final wiring
- **#9 claude-code-p61**: Update setup-wizard.js securityHooks array with all new hooks. Fix postinstall.js to copy hooks/lib/. Final test count verification. Version bump to 0.0.1-alpha.13.

## Current Task Detail

_Will be populated when execution begins._

## Completed Work Log

- #1 claude-code-8g8: Read-only prerequisite — 6 dual-write rules acknowledged.
- #2 claude-code-d6g: Created 13 skeleton hooks, dual-written, tests refactored and passing.
- #3 claude-code-kxh: Added 3 sections (2.7, 2.8, 2.9) to global-claude.md, dual-written, tests updated.
- #4 claude-code-5mw: Created pre-commit-test-runner.sh with 6-framework auto-detect, added to templates.
- #5 claude-code-3og: Created xcontinue.md with plan discovery and session handoff protocol.
- #6 claude-code-6ck: Created xexplore.md with 5-step search and structured report output.
- #7 claude-code-qji: Created verify-before-edit.sh (non-blocking, env var input, placeholder detection).
- #8 claude-code-vc3: Updated model ID to claude-sonnet-4-6.
- #9 claude-code-p61: Updated installer (13 hooks, lib/ copy, version bump to 0.0.1-alpha.13).
