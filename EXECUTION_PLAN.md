> ⚠️ **EPHEMERAL DOCUMENT** - Delete this file after all tasks are completed
>
> **Purpose:** Single source of truth for Beads task execution loop
> **Lifecycle:** Created 2026-03-20, Delete after all tasks verified complete

# Execution Plan

**Status:** 🔄 IN PROGRESS | Generated: 2026-03-20T23:00:00-04:00
**Total tasks:** 24 | **Done:** 9 | **Remaining:** 15

## Context Saturation Protocol

After completing each task:

1. **Above 50% context remaining** → automatically continue to the next pending task.
2. **Below 50% context remaining** → **STOP immediately**. Do not start another task. Instead:
   - Update this file (mark completed tasks, update counters)
   - Commit all work
   - Tell the user: _"Tasks X–Y are done. Context is at ~Z% capacity. Run `/clear` then say **'Read EXECUTION_PLAN.md and continue'** to resume."_
   - **Wait.** Do not proceed until the user clears context and restarts.

**Resume protocol:** When the user says "Read EXECUTION_PLAN.md and continue", read this file, find the first `⏳ pending` task, and resume the loop.

## Task Queue

| # | Bead ID | Task Name | Status | Dependencies | Started | Completed |
|---|---------|-----------|--------|--------------|---------|-----------|
| 1 | 8mf | Re-enable security validation in subagent-validator.sh | ✅ done | none | 2026-03-20 | 2026-03-20 |
| 2 | zms | Fix credential scanner bypass: replace CLAUDE_SECURITY_OVERRIDE | ✅ done | none | 2026-03-20 | 2026-03-20 |
| 3 | 06j | Fix ShellCheck parse errors in prevent-credential-exposure.sh | ✅ done | #2 | 2026-03-20 | 2026-03-20 |
| 4 | 1lz | Fix JSON injection in webhook notification payloads | ✅ done | none | 2026-03-20 | 2026-03-20 |
| 5 | 21m | Fix CI/CD security: pin actions, guard badge-update, fix counts | ✅ done | none | 2026-03-20 | 2026-03-20 |
| 6 | 5je | Fix devcontainer firewall: add lifecycle hook and NET_ADMIN | ✅ done | none | 2026-03-20 | 2026-03-20 |
| 7 | anl | Eliminate duplicate file maintenance between repo root and npm package | ⏳ pending | none | | |
| 8 | m27 | Reduce oversized files and remove dead code | ⏳ pending | #7 | | |
| 9 | 4zj | Remove or implement 13 stub hooks, clean security templates | ⏳ pending | #1 ✅ | | |
| 10 | mpf | Harden hooks/lib: mktemp, realpath, set -e, include guards | ⏳ pending | #7, #9 | | |
| 11 | 7bt | Fix security anti-patterns in documentation and templates | ✅ done | none | 2026-03-20 | 2026-03-20 |
| 12 | 5rg | Fix critical documentation drift: CLAUDE.md, README.md, /xhelp | ⏳ pending | #7, #8, #9 | | |
| 13 | 1g3 | Create CONTRIBUTING.md or remove all references | ⏳ pending | #12 | | |
| 14 | b9v | Implement uninstall mechanism for claude-dev-toolkit | ⏳ pending | #7 | | |
| 15 | x51 | Add functional tests for hooks, hooks/lib, and slash commands | ⏳ pending | #1 ✅, #2 ✅, #3 ✅, #4 ✅, #7, #9 | | |
| 16 | coh | Fix test claims, subagent validation, CLI flags, Windows support claim | ⏳ pending | #15 | | |
| 17 | fr2 | Standardize subagent and slash command definition formats | ⏳ pending | #7, #9 | | |
| 18 | di4 | Clean up NPM package: remove backups, add LICENSE, drop Jest | ⏳ pending | #7 | | |
| 19 | 7wz | Create xverify slash command for pre-action verification | ⏳ pending | #7 | | |
| 20 | lop | Repo hygiene: remove empty files, binaries, .DS_Store, -OLD templates | ✅ done | none | 2026-03-20 | 2026-03-20 |
| 21 | asd | Fix shell minor issues: $* quoting, hostname leak, unwired tests | ⏳ pending | #9 | | |
| 22 | 9ad | Fix dependencies.txt wrong package name | ✅ done | none | 2026-03-20 | 2026-03-20 |
| 23 | rit | Fix ShellCheck warnings and shell hygiene across scripts | ⏳ pending | #8, #10 | | |
| 24 | 74h | Improve CLI UX: subcommand help examples and error messages | ⏳ pending | none | | |

---

## Task Details

### Task 1: Re-enable security validation in subagent-validator.sh [bd-8mf]
**Priority:** P0 | **Type:** bug | **Phase:** 1 - Security

**Description:** hooks/lib/subagent-validator.sh:326-333 has content security validation commented out with "Temporarily disable security validation for debugging". Re-enable the validation and restore strict regex patterns.

**Steps:**
1. Read hooks/lib/subagent-validator.sh around lines 326-333
2. Uncomment the `validate_content_security` call and remove the debug bypass
3. Remove the "Content security validation temporarily disabled" log line
4. Verify the `validate_content_security` function exists and works correctly
5. Run `bash -n hooks/lib/subagent-validator.sh` to verify syntax

**Acceptance Criteria:**
- [ ] Security validation is no longer commented out
- [ ] Debug bypass log line is removed
- [ ] `bash -n` passes without errors

**Files in scope:** `hooks/lib/subagent-validator.sh`

---

### Task 2: Fix credential scanner bypass [bd-zms]
**Priority:** P1 | **Type:** bug | **Phase:** 1 - Security

**Description:** hooks/prevent-credential-exposure.sh:244-248 allows bypassing all credential scanning via CLAUDE_SECURITY_OVERRIDE=true env var. Remove the persistent override mechanism.

**Steps:**
1. Read hooks/prevent-credential-exposure.sh
2. Remove the CLAUDE_SECURITY_OVERRIDE check block (lines ~244-248)
3. Remove any references to CLAUDE_SECURITY_OVERRIDE from config-constants.sh
4. Remove bypass instruction printing from stdout (line ~239)
5. Run `bash -n hooks/prevent-credential-exposure.sh` to verify syntax

**Acceptance Criteria:**
- [ ] CLAUDE_SECURITY_OVERRIDE env var check is removed
- [ ] No bypass instructions printed to stdout
- [ ] References removed from config-constants.sh
- [ ] `bash -n` passes

**Files in scope:** `hooks/prevent-credential-exposure.sh`, `hooks/lib/config-constants.sh`

---

### Task 3: Fix ShellCheck parse errors in prevent-credential-exposure.sh [bd-06j]
**Priority:** P1 | **Type:** bug | **Phase:** 1 - Security

**Description:** SC1073/SC1078/SC1083 errors on the `declare -A CREDENTIAL_PATTERNS` associative array at lines 71-96. Regex patterns inside single-quoted values confuse ShellCheck.

**Steps:**
1. Read the CREDENTIAL_PATTERNS declaration (lines 71-96)
2. Refactor to avoid ShellCheck parse errors — use separate declare and assignment, or individual assignments
3. Run `shellcheck hooks/prevent-credential-exposure.sh` to verify
4. Run `bash -n` for syntax check

**Acceptance Criteria:**
- [ ] ShellCheck no longer reports SC1073/SC1078/SC1083
- [ ] All credential patterns still function correctly
- [ ] `bash -n` passes

**Files in scope:** `hooks/prevent-credential-exposure.sh`

---

### Task 4: Fix JSON injection in webhook notification payloads [bd-1lz]
**Priority:** P1 | **Type:** bug | **Phase:** 1 - Security

**Description:** Multiple hooks build JSON via heredocs with unescaped variable interpolation. Create `json_escape()` in hooks/lib/file-utils.sh and apply across all affected files.

**Steps:**
1. Create `json_escape()` function in hooks/lib/file-utils.sh
2. Apply json_escape() in: hooks/prevent-credential-exposure.sh (lines 49-63), hooks/lib/error-handler.sh (lines 273-289), hooks/pre-write-security.sh (lines 36-46), hooks/subagent-trigger-simple.sh (lines 57-76), hooks/on-error-debug.sh (lines 37-65), hooks/lib/context-manager.sh (lines 36-56)
3. Test with adversarial inputs (quotes, backslashes, newlines)
4. Run `bash -n` on all modified files

**Acceptance Criteria:**
- [ ] json_escape() function exists in hooks/lib/file-utils.sh
- [ ] All JSON payload construction uses json_escape() for variable values
- [ ] `bash -n` passes on all modified files

**Files in scope:** `hooks/lib/file-utils.sh`, `hooks/prevent-credential-exposure.sh`, `hooks/lib/error-handler.sh`, `hooks/pre-write-security.sh`, `hooks/subagent-trigger-simple.sh`, `hooks/on-error-debug.sh`, `hooks/lib/context-manager.sh`

---

### Task 5: Fix CI/CD security [bd-21m]
**Priority:** P1 | **Type:** bug | **Phase:** 1 - Security

**Description:** Pin GitHub Actions to full commit SHAs, add event guard on badge-update step, fix hardcoded command counts.

**Steps:**
1. Read all .github/workflows/*.yml files
2. Replace tag-based action refs (e.g., `actions/checkout@v4`) with full SHA pins
3. Add event guard to badge-update step: `if: github.event_name == 'push' && github.ref == 'refs/heads/main'`
4. Update or dynamize hardcoded command counts in npm-package-validation.yml

**Acceptance Criteria:**
- [ ] All action refs use full commit SHAs
- [ ] Badge-update step has event guard
- [ ] Command counts are correct or dynamically generated

**Files in scope:** `.github/workflows/*.yml`

---

### Task 6: Fix devcontainer firewall [bd-5je]
**Priority:** P1 | **Type:** bug | **Phase:** 1 - Security

**Description:** setup-devcontainer.sh generates firewall script but nothing invokes it. No postStartCommand, and --cap-drop=ALL prevents iptables.

**Steps:**
1. Read setup-devcontainer.sh
2. Add postStartCommand to run setup-firewall.sh in generated devcontainer.json
3. Add --cap-add=NET_ADMIN to runArgs
4. Document ANTHROPIC_API_KEY env var requirement
5. Replace domain-name iptables rules with IP range approach (or document limitation)

**Acceptance Criteria:**
- [ ] Generated devcontainer.json includes postStartCommand for firewall
- [ ] NET_ADMIN capability is added to runArgs
- [ ] ANTHROPIC_API_KEY requirement documented
- [ ] `bash -n` passes

**Files in scope:** `setup-devcontainer.sh`

---

### Task 7: Eliminate duplicate file maintenance [bd-anl]
**Priority:** P1 | **Type:** task | **Phase:** 2 - Structural

**Description:** Every hook, lib module, and subagent is duplicated between repo root and claude-dev-toolkit/. Establish single source of truth via build step.

**Steps:**
1. Audit differences between repo root and claude-dev-toolkit/ copies
2. Determine which copy is authoritative for each diverged file
3. Implement a build/sync script that copies from source of truth to npm package
4. Remove duplicated source files from claude-dev-toolkit/ (keep only npm-specific files)
5. Update npm `files` array or add prepublish/build step
6. Update postinstall.js if needed

**Acceptance Criteria:**
- [ ] Single source of truth for hooks, lib, subagents, and commands
- [ ] Build/sync mechanism to populate npm package
- [ ] No diverged copies

**Files in scope:** `hooks/`, `claude-dev-toolkit/hooks/`, `subagents/`, `claude-dev-toolkit/subagents/`, `claude-dev-toolkit/package.json`

---

### Task 8: Reduce oversized files and remove dead code [bd-m27]
**Priority:** P1 | **Type:** task | **Phase:** 2 - Structural

**Description:** Delete dead code (orphaned package-manager-service.js, backup files). Decompose files over 500 lines.

**Steps:**
1. Delete claude-dev-toolkit/lib/package-manager-service.js (orphaned old copy)
2. Delete installation-instruction-generator-backup.js (pre-refactor snapshot)
3. Identify files over 500 lines and decompose using Extract Class/Module
4. Target: deploy-subagents.sh (669), test_setup_devcontainer.sh (639), execution-engine.sh (626), subagent-validator.sh (596)
5. Run existing tests to verify nothing breaks

**Acceptance Criteria:**
- [ ] Dead code files deleted
- [ ] No file exceeds 500 lines (or has a documented reason)
- [ ] Existing tests pass

**Files in scope:** Multiple — see description

---

### Task 9: Remove or implement 13 stub hooks [bd-4zj]
**Priority:** P2 | **Type:** task | **Phase:** 2 - Structural

**Description:** 13 of 22 hooks are identical 62-line stubs. Security-named stubs create false audit trail in security-focused template. Remove stubs and clean templates.

**Steps:**
1. Delete the 13 stub hooks (audit-bash-commands.sh, backup-before-edit.sh, cleanup-on-stop.sh, handle-notifications.sh, log-all-operations.sh, pre-compact-backup.sh, prompt-analysis.sh, prompt-security-scan.sh, security-session-init.sh, session-cleanup.sh, session-init.sh, subagent-cleanup.sh, validate-changes.sh)
2. Remove references from templates/security-focused-settings.json
3. Remove references from other templates
4. Update any hook counts or lists
5. Remove corresponding copies from claude-dev-toolkit/hooks/ (if task 7 hasn't already)

**Acceptance Criteria:**
- [ ] 13 stub hooks deleted
- [ ] Templates updated to remove stub references
- [ ] No security-named stubs in security template

**Files in scope:** `hooks/*.sh` (13 stubs), `templates/*.json`

---

### Task 10: Harden hooks/lib [bd-mpf]
**Priority:** P2 | **Type:** task | **Phase:** 3 - Hardening

**Description:** Replace predictable temp paths with mktemp, fix path traversal gaps with realpath, add include guards, add set -euo pipefail, remove eval, remove unused variables.

**Steps:**
1. Replace temp file paths in config-constants.sh and file-utils.sh with mktemp
2. Fix validate_path_safety() in file-utils.sh to use realpath
3. Add include guards to all 7 unguarded hooks/lib modules
4. Add set -euo pipefail to all hooks/lib modules
5. Replace eval in manual-test-suite.sh with safer dispatch
6. Remove unused ShellCheck-flagged variables
7. Run `bash -n` on all modified files

**Acceptance Criteria:**
- [ ] No predictable temp file paths
- [ ] validate_path_safety uses realpath
- [ ] Include guards on all lib modules
- [ ] set -euo pipefail in all modules
- [ ] No eval usage
- [ ] `bash -n` passes on all files

**Files in scope:** `hooks/lib/*.sh`

---

### Task 11: Fix security anti-patterns in docs/templates [bd-7bt]
**Priority:** P2 | **Type:** bug | **Phase:** 3 - Hardening

**Description:** Replace curl|bash pattern in devcontainer-guide.md. Fix placeholder API key in comprehensive-settings.json.

**Steps:**
1. Replace `curl -sL ... | bash` in docs/devcontainer-guide.md with download-verify-execute
2. Replace `your-api-key-here` in templates/comprehensive-settings.json with env var reference and DO NOT COMMIT warning

**Acceptance Criteria:**
- [ ] No curl|bash patterns in documentation
- [ ] No placeholder API keys that could be committed with real values

**Files in scope:** `docs/devcontainer-guide.md`, `templates/comprehensive-settings.json`

---

### Task 12: Fix critical documentation drift [bd-5rg]
**Priority:** P0 | **Type:** bug | **Phase:** 4 - Documentation

**Description:** Remove references to nonexistent scripts, fix CLAUDE.md lib/ listing, create or update /xhelp, fix command counts, add missing dirs to structure.

**Steps:**
1. Remove/update 20+ references to nonexistent root scripts in CLAUDE.md and README.md
2. Rewrite CLAUDE.md lib/ listing to reflect actual files
3. Create slash-commands/active/xhelp.md OR remove all references
4. Add missing dirs to CLAUDE.md structure (claude-dev-toolkit/, subagents/, scripts/, etc.)
5. Fix command counts across README.md and docs/
6. Reconcile time claims

**Acceptance Criteria:**
- [ ] No references to nonexistent files
- [ ] CLAUDE.md accurately reflects repo structure
- [ ] Command counts are correct
- [ ] /xhelp either exists or references removed

**Files in scope:** `CLAUDE.md`, `README.md`, `docs/*.md`

---

### Task 13: Create CONTRIBUTING.md or remove references [bd-1g3]
**Priority:** P1 | **Type:** task | **Phase:** 4 - Documentation

**Description:** README.md links to ./docs/CONTRIBUTING.md in multiple places but file doesn't exist.

**Steps:**
1. Decide: create CONTRIBUTING.md or remove references
2. If creating: write docs/CONTRIBUTING.md with contribution guidelines
3. If removing: delete all references from README.md

**Acceptance Criteria:**
- [ ] No broken references to CONTRIBUTING.md

**Files in scope:** `README.md`, `docs/CONTRIBUTING.md` (if creating)

---

### Task 14: Implement uninstall mechanism [bd-b9v]
**Priority:** P1 | **Type:** feature | **Phase:** 4 - Documentation

**Description:** npm uninstall leaves behind ~/.claude/commands/, hooks/, subagents/, settings.json changes. Implement `claude-commands uninstall` command and preuninstall hook.

**Steps:**
1. Create uninstall command in claude-dev-toolkit/bin/ or as subcommand
2. Implement preuninstall npm hook in package.json
3. Clean up: ~/.claude/commands/, ~/.claude/hooks/, ~/.claude/subagents/
4. Restore settings.json to pre-install state (use backup)
5. Update README.md claims

**Acceptance Criteria:**
- [ ] `claude-commands uninstall` removes all installed files
- [ ] npm preuninstall hook triggers cleanup
- [ ] README accurately describes uninstall behavior

**Files in scope:** `claude-dev-toolkit/bin/claude-commands`, `claude-dev-toolkit/package.json`, `claude-dev-toolkit/scripts/`

---

### Task 15: Add functional tests [bd-x51]
**Priority:** P1 | **Type:** task | **Phase:** 5 - Testing

**Description:** 22 hooks have zero functional tests. 8 hooks/lib modules have zero unit tests. 15 active slash commands have zero behavioral tests. ~80+ REQ-xxx requirements with only ~10% test coverage.

**Steps:**
1. Create tests for security-critical hooks (prevent-credential-exposure.sh, pre-write-security.sh)
2. Add unit tests for hooks/lib modules (file-utils.sh, config-constants.sh, etc.)
3. Add behavioral tests for core slash commands
4. Create traceability matrix for spec-to-test coverage
5. Run all tests to verify

**Acceptance Criteria:**
- [ ] Security-critical hooks have functional tests
- [ ] hooks/lib modules have unit tests
- [ ] All tests pass

**Files in scope:** `tests/`, `hooks/`, `hooks/lib/`, `slash-commands/active/`

---

### Task 16: Fix test claims and CLI flags [bd-coh]
**Priority:** P2 | **Type:** task | **Phase:** 5 - Testing

**Description:** Fix misleading "100% pass" claim, add subagent definition validation, implement --active/--experiments CLI filter flags, fix Windows path separator.

**Steps:**
1. Update test documentation to acknowledge test depth
2. Add validation tests for subagent definitions
3. Implement --active/--experiments filtering in CLI list command
4. Fix Unix-specific path separator in postinstall.js or add platform disclaimer

**Acceptance Criteria:**
- [ ] Test claims are accurate
- [ ] Subagent definitions validated
- [ ] CLI flags work correctly
- [ ] Path handling is cross-platform or documented

**Files in scope:** `claude-dev-toolkit/bin/claude-commands`, `claude-dev-toolkit/scripts/postinstall.js`, `tests/`

---

### Task 17: Standardize definition formats [bd-fr2]
**Priority:** P2 | **Type:** task | **Phase:** 6 - Cleanup

**Description:** Standardize subagent definitions (debug-context.md has no frontmatter, inconsistent formats). Add frontmatter to xnew.md.

**Steps:**
1. Audit all 26 subagent definitions in subagents/
2. Move debug-context.md to docs/
3. Standardize all subagent definitions to consistent format
4. Add YAML frontmatter to slash-commands/experiments/xnew.md

**Acceptance Criteria:**
- [ ] All subagent definitions have consistent format
- [ ] debug-context.md moved to docs/
- [ ] xnew.md has standard frontmatter

**Files in scope:** `subagents/*.md`, `slash-commands/experiments/xnew.md`

---

### Task 18: Clean up NPM package [bd-di4]
**Priority:** P2 | **Type:** task | **Phase:** 6 - Cleanup

**Description:** Remove stale backup dirs, add LICENSE to npm package, drop unused Jest dependency.

**Steps:**
1. Delete hooks.backup/, commands.backup/, templates.backup/ from claude-dev-toolkit/
2. Add to .npmignore
3. Copy LICENSE to claude-dev-toolkit/ or reference in package.json files
4. Remove Jest from dependencies (tests/package.json and claude-dev-toolkit/package.json)

**Acceptance Criteria:**
- [ ] No backup directories in npm package
- [ ] LICENSE included in npm package
- [ ] Jest removed from dependencies

**Files in scope:** `claude-dev-toolkit/`, `tests/package.json`

---

### Task 19: Create xverify slash command [bd-7wz]
**Priority:** P2 | **Type:** feature | **Phase:** 6 - Cleanup

**Description:** Create pre-action verification command that scans for fabricated URLs, placeholder IDs, and unverified references.

**Steps:**
1. Create slash-commands/active/xverify.md with standard frontmatter
2. Implement verification logic for URLs, file paths, IDs, API endpoints
3. Create corresponding file in claude-dev-toolkit/commands/active/
4. Update test counts in test_npm_package_completeness.js

**Acceptance Criteria:**
- [ ] xverify.md exists in both locations with standard frontmatter
- [ ] Test counts updated
- [ ] npm tests pass

**Files in scope:** `slash-commands/active/xverify.md`, `claude-dev-toolkit/commands/active/xverify.md`, `claude-dev-toolkit/tests/test_npm_package_completeness.js`

---

### Task 20: Repo hygiene [bd-lop]
**Priority:** P3 | **Type:** chore | **Phase:** 6 - Cleanup

**Description:** Remove empty files, binaries, .DS_Store, -OLD templates, pycache.

**Steps:**
1. Delete empty test-suite.json at root
2. Remove ubuntu-test-results.zip, add *.zip to .gitignore
3. Remove .DS_Store, add to .gitignore
4. Delete 3 -OLD template files
5. Add __pycache__/ to .gitignore
6. Add tests/test-results/ to .gitignore

**Acceptance Criteria:**
- [ ] All cleanup items removed
- [ ] .gitignore updated

**Files in scope:** Root files, `templates/`, `.gitignore`

---

### Task 21: Fix shell minor issues [bd-asd]
**Priority:** P3 | **Type:** bug | **Phase:** 6 - Cleanup

**Description:** Fix $* quoting to "$@", remove hostname leak in webhook payloads, wire test_logging.sh and test_setup_devcontainer.sh into CI.

**Steps:**
1. Replace `$*` with `"$@"` in surviving hooks
2. Remove/redact $(hostname) from error-handler.sh webhook payloads
3. Update run-all-tests.sh to discover .sh test files

**Acceptance Criteria:**
- [ ] No unquoted $* usage
- [ ] No hostname in external payloads
- [ ] Shell tests wired into CI

**Files in scope:** `hooks/*.sh`, `hooks/lib/error-handler.sh`, test runner scripts

---

### Task 22: Fix dependencies.txt wrong package name [bd-9ad]
**Priority:** P3 | **Type:** bug | **Phase:** 6 - Cleanup

**Description:** Line 16 has `@anthropic/claude-code` but should be `@anthropic-ai/claude-code`.

**Steps:**
1. Fix line 16 in dependencies.txt

**Acceptance Criteria:**
- [ ] Package name is `@anthropic-ai/claude-code`

**Files in scope:** `dependencies.txt`

---

### Task 23: Fix ShellCheck warnings across scripts [bd-rit]
**Priority:** P3 | **Type:** chore | **Phase:** 6 - Cleanup

**Description:** Fix SC2155 (declare and assign separately), SC2207 (use mapfile), upgrade publishing scripts to set -euo pipefail.

**Steps:**
1. Split `local var=$(cmd)` into `local var; var=$(cmd)` in flagged files
2. Use mapfile in subagent-discovery.sh
3. Upgrade publishing scripts to set -euo pipefail

**Acceptance Criteria:**
- [ ] SC2155 and SC2207 warnings resolved
- [ ] Publishing scripts use set -euo pipefail

**Files in scope:** `hooks/file-logger.sh`, `hooks/lib/subagent-validator.sh`, `hooks/lib/subagent-discovery.sh`, `scripts/deploy-subagents.sh`, publishing scripts

---

### Task 24: Improve CLI UX [bd-74h]
**Priority:** P4 | **Type:** chore | **Phase:** 6 - Cleanup

**Description:** Add help examples to Commander.js subcommands. Improve postinstall.js error messages with troubleshooting guidance.

**Steps:**
1. Add .addHelpText('after', ...) with usage examples to key subcommands
2. Improve error messages in postinstall.js with troubleshooting guidance

**Acceptance Criteria:**
- [ ] Subcommands have help examples
- [ ] Error messages include troubleshooting steps

**Files in scope:** `claude-dev-toolkit/bin/claude-commands`, `claude-dev-toolkit/scripts/postinstall.js`

---

## Current Task Detail

_Will be populated when execution begins._

## Completed Work Log

_No tasks completed yet._
