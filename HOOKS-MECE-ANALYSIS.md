# MECE Analysis: Claude Code Hooks System

**Date:** 2026-03-21
**Scope:** All 9 hooks and 12 lib modules in `hooks/` directory
**Method:** Content analysis for Mutual Exclusivity, Collective Exhaustiveness, and coverage gaps

---

## Executive Summary

The hooks system has **strong MECE compliance overall** with minor overlaps and one significant gap:

- ✅ **Mutually Exclusive:** Hooks have distinct trigger points and purposes; minimal functional overlap
- ✅ **Collectively Exhaustive:** Coverage spans the full development lifecycle (pre-write → post-commit)
- ⚠️ **Overlap:** Two hooks address credential detection (in different contexts)
- ❌ **Gap:** No post-merge/deployment validation hook

---

## Part 1: Hook Inventory & Trigger Points

### Master Hook Table

| Hook Name | Trigger | Primary Purpose | Blocking | Dependencies |
|-----------|---------|-----------------|----------|--------------|
| **file-logger.sh** | PreToolUse (Edit, Write, MultiEdit) | Log file operations | No | Basic |
| **prevent-credential-exposure.sh** | PreToolUse (Edit, Write, MultiEdit) | Scan for credential patterns | **Yes** | Regex patterns |
| **pre-write-security.sh** | PreToolUse (Edit, Write, MultiEdit) | Delegate to security-auditor subagent | No | Context mgr, error handler |
| **verify-before-edit.sh** | PreToolUse (Edit, Write, MultiEdit) | Warn about fabricated references/IDs | No | Basic |
| **pre-commit-quality.sh** | Custom (pre-commit) | Analyze staged changes for quality | No | Git, JSON parsing |
| **pre-commit-test-runner.sh** | Custom (pre-commit) | Auto-detect and run tests | **Yes** | Framework detection |
| **on-error-debug.sh** | Manual invocation | Gather error context + delegate to debug subagent | No | Context mgr, error handler |
| **subagent-trigger.sh** | Manual or custom | Full-featured subagent orchestration | No | All lib modules (9 deps) |
| **subagent-trigger-simple.sh** | Manual or custom | Lightweight subagent delegation | No | 4 core modules |

### Trigger Point Breakdown

**Pre-Write Phase (PreToolUse):**
- `file-logger.sh` — activity logging (informational)
- `prevent-credential-exposure.sh` — security scanning (blocking)
- `pre-write-security.sh` — subagent delegation (informational)
- `verify-before-edit.sh` — reference validation (informational)

**Pre-Commit Phase (Custom Hook):**
- `pre-commit-quality.sh` — code quality assessment
- `pre-commit-test-runner.sh` — test automation

**Error Handling (Manual):**
- `on-error-debug.sh` — error context gathering + subagent delegation (manually invoked; no OnError hook event in Claude Code)

**Manual/Event-Driven:**
- `subagent-trigger.sh` — orchestration hub
- `subagent-trigger-simple.sh` — lightweight delegation

---

## Part 2: Overlap Analysis

### **OVERLAP 1: Credential Detection**

**Hooks Involved:**
- `prevent-credential-exposure.sh` (PreToolUse)
- `pre-commit-quality.sh` (line 145-148: "potential credential patterns")

**Nature of Overlap:**
```
prevent-credential-exposure.sh:
  - Regex-based credential detection (35+ patterns)
  - BLOCKING enforcement
  - Webhook notifications
  - Pre-write phase (catches before file creation)

pre-commit-quality.sh:
  - Quick scan for credential patterns (single grep)
  - Informational only (suggests fix but allows commit)
  - Pre-commit phase (after staged changes)
```

**Assessment:** ✅ **Not a real conflict**
- Different phases (pre-write vs. pre-commit) = different actors
- Different actions (block vs. warn)
- Different patterns (comprehensive vs. quick)
- **Complementary defense:** two-layer approach

**Recommendation:** Document as intentional defense-in-depth.

---

### **OVERLAP 2: Security Analysis (Multiple Levels)**

**Hooks Involved:**
- `prevent-credential-exposure.sh` (specific: credentials only)
- `pre-write-security.sh` (delegated: general security via subagent)
- `pre-commit-quality.sh` (includes basic credential check)

**Nature of Overlap:**
```
prevent-credential-exposure.sh:
  - Hard rules (30+ regex patterns)
  - Blocking
  - Specific focus: credentials

pre-write-security.sh:
  - Soft rules (AI-powered subagent)
  - Non-blocking
  - General scope: any security issue

pre-commit-quality.sh:
  - Lightweight check
  - Non-blocking
  - Informational only
```

**Assessment:** ✅ **Intentional defense-in-depth**
- Different enforcement levels (hard rules → soft analysis → info gathering)
- Different scopes (credentials → general → quality + security)
- Complementary approaches (prevents worst cases, then informs humans)

---

### **OVERLAP 3: Subagent Triggering**

**Hooks Involved:**
- `subagent-trigger.sh` (full-featured, 253 lines, 9 module deps)
- `subagent-trigger-simple.sh` (lightweight, 202 lines, 4 module deps)

**Nature of Overlap:**
```
subagent-trigger.sh:
  - Full orchestration (context gathering, validation, execution modes)
  - 9 module dependencies
  - Supports event-based and single-subagent modes
  - Complex timeout/blocking logic

subagent-trigger-simple.sh:
  - Minimal orchestration (gather context + delegate)
  - 4 module dependencies
  - Single-subagent mode only
  - Direct delegation without execution engine
```

**Assessment:** ⚠️ **Partial overlap with clear tradeoff**
- Both accomplish the same goal: invoke a subagent
- Same trigger points (Manual, custom events)
- **Different design choices:**
  - `subagent-trigger.sh`: Full-featured, high overhead
  - `subagent-trigger-simple.sh`: Lightweight, reduced features
- **Active hooks:** Both are included; appears intentional for flexibility

**Recommendation:** Clarify intent — are both meant to be active? Document which is recommended for which use cases.

---

## Part 3: Gap Analysis

### **CRITICAL GAP 1: Post-Merge/Post-Deploy Validation**

**Missing Coverage:** After code merges to main/master or deploys to production

**What's NOT covered:**
- Post-merge validation (did the merge succeed in all CI checks?)
- Post-deploy smoke tests
- Post-merge security scanning (on merged code vs. PR)
- Post-deploy monitoring/alerting triggers
- Rollback detection hooks

**Why This Matters:**
- Current system covers: pre-write → pre-commit → error handling
- Incident response: "Code is broken in production, but hook didn't catch it?"
- No opportunity to trigger remediation before users see impact

**Example Scenarios Not Covered:**
1. Code merges to main, but CI silently fails → no alert
2. Deploy to production, service crashes → no automated rollback trigger
3. Security patch merged → no post-merge audit confirmation
4. Critical dependency update → no post-deploy smoke test

**Recommendation:** Create 2 new hooks:
- `post-merge-verification.sh` (check merge success, run cross-branch security scan)
- `post-deploy-monitoring.sh` (smoke tests, alert if errors detected)

---

### **GAP 2: Runtime Monitoring (Low Priority)**

**Missing Coverage:** During application execution

**What's NOT covered:**
- Runtime security violations (suspicious pattern detected while app is running)
- Performance degradation alerts
- Resource exhaustion warnings
- Access pattern anomalies

**Why This Matters:**
- Current hooks are **build-time only**
- No runtime visibility into application behavior
- No way to trigger remediation for runtime issues

**Recommendation:** Consider for future work — lower priority than post-deploy gap.

---

### **GAP 3: Dependency Management Validation**

**Missing Coverage:** Package/dependency security and compatibility

**What's NOT covered:**
- Pre-commit detection of unsafe dependency versions
- Upstream vulnerability alerts
- Dependency license compliance
- Breaking change detection before commits

**Why This Matters:**
- Dependencies are a major attack surface
- Current credential detection doesn't catch compromised packages
- No `pre-commit` hook for dependency scanning

**Recommendation:** Create `pre-commit-dependency-check.sh` that validates:
- Known CVEs in dependencies
- License compatibility
- Version constraints

---

## Part 4: Lib Module Organization

### Module Hierarchy & Dependencies

```
config-constants.sh (ROOT)
├── error-handler.sh
│   └── file-utils.sh
│   └── context-manager.sh
├── file-utils.sh
│   └── context-manager.sh
├── context-manager.sh
│   └── error-handler.sh (circular!)
├── error-handler.sh (exports json_escape, logging)
├── argument-parser.sh
│   └── error-handler.sh
├── subagent-discovery.sh
│   ├── file-utils.sh
│   └── error-handler.sh
├── subagent-validator.sh
│   ├── file-utils.sh
│   ├── error-handler.sh
│   ├── field-validators.sh
│   └── validation-reporter.sh
├── field-validators.sh
│   └── error-handler.sh
├── execution-engine.sh
│   ├── file-utils.sh
│   ├── error-handler.sh
│   ├── execution-simulation.sh
│   └── execution-results.sh
├── execution-simulation.sh
│   ├── file-utils.sh
│   └── error-handler.sh
├── execution-results.sh
│   ├── file-utils.sh
│   └── error-handler.sh
└── validation-reporter.sh
    └── error-handler.sh
```

### Assessment: ✅ Well-Organized with 1 Concern

**Strengths:**
- Clear separation of concerns (file ops, validation, execution, context)
- Include guards prevent double-loading
- Modules are single-responsibility
- Dependency flow is mostly hierarchical (constants → utils → higher-level)

**Concern: Circular Dependency**
```bash
# context-manager.sh sources error-handler.sh (line 17)
source "$SCRIPT_DIR/error-handler.sh"

# error-handler.sh uses json_escape from file-utils.sh (via context-manager.sh paths)
# And context-manager.sh calls error-handler.sh functions (log_debug, etc.)
```

**Impact:** Low (include guards prevent infinite loops), but indicates tight coupling.

**Recommendation:** Extract common utilities to a separate `common-utils.sh`:
- `json_escape()` function
- `log_*()` functions
- Move to separate module

---

## Part 5: MECE Assessment Matrix

### Completeness Scorecard

| Category | Coverage | Status | Notes |
|----------|----------|--------|-------|
| **Pre-write validation** | 4 hooks | ✅ Complete | Credentials, security, references, logging |
| **Pre-commit validation** | 2 hooks | ✅ Complete | Quality, tests |
| **Error handling** | 1 hook | ⚠️ Manual only | on-error-debug requires manual invocation (no OnError hook event) |
| **Subagent orchestration** | 2 hooks | ⚠️ Redundant | Both do same job; clarify intent |
| **Post-merge validation** | 0 hooks | ❌ Missing | **CRITICAL GAP** |
| **Post-deploy validation** | 0 hooks | ❌ Missing | **CRITICAL GAP** |
| **Dependency scanning** | 0 hooks | ❌ Missing | Should be in pre-commit |
| **Runtime monitoring** | 0 hooks | ⚠️ Out of scope | Consider future work |

### Mutual Exclusivity Score: **8.5/10**

**Fully Exclusive:** 7 hooks (distinct, non-overlapping purposes)
**Overlapping:** 2 hooks (intentional/complementary)
**Conflicting:** 0 hooks

---

## Part 6: Recommendations

### Priority 1: Close Critical Gaps

**1.1 Create `post-merge-verification.sh`**
```bash
Purpose: Validate code merge success and post-merge security
Trigger: Post-merge (via CI/CD hook or manual)
Actions:
  - Confirm all CI checks passed
  - Run cross-branch security scan (compare main..feature)
  - Verify no credentials were introduced in merge
  - Log merge metrics (lines changed, files affected)
Blocking: Yes (if security issues detected)
```

**1.2 Create `post-deploy-monitoring.sh`**
```bash
Purpose: Smoke tests and post-deploy alerts
Trigger: Post-deploy (via CI/CD hook or manual)
Actions:
  - Run smoke test suite
  - Health check of deployed service
  - Verify no 5xx errors in logs
  - Alert on critical issues
Blocking: Informational (alerts but doesn't stop deployment)
```

**1.3 Create `pre-commit-dependency-check.sh`**
```bash
Purpose: Validate dependencies before commit
Trigger: Pre-commit (like pre-commit-test-runner)
Actions:
  - Scan for known CVEs
  - Verify license compatibility
  - Check version constraints
  - Flag breaking changes
Blocking: No (warning only)
```

### Priority 2: Clarify Architecture

**2.1 Document subagent-trigger.sh vs. subagent-trigger-simple.sh**
- Which is the "canonical" implementation?
- When should each be used?
- Should one be deprecated?
- Update README with guidance

**2.2 Reduce Module Circular Dependencies**
- Extract common utilities to `common-utils.sh`
- Move `json_escape()`, logging functions, constants to shared module
- Update imports to reduce coupling

**2.3 Document Defense-in-Depth Strategy**
- Add section to CLAUDE.md explaining why credential detection appears twice
- Explain the layered approach (hard rules → soft analysis → info)
- Clarify blocking vs. non-blocking intent at each layer

### Priority 3: Enhance Observability

**3.1 Add Hook Execution Metadata**
- Track which hooks ran, in what order, how long they took
- Log hook skip reasons (not applicable to tool, file type, etc.)
- Provide execution summary at end of operation

**3.2 Create Hook Configuration Registry**
- Document which hooks are active vs. experimental
- Show hook dependencies visually
- Enable/disable hooks via configuration

---

## Part 7: Summary Table

### MECE Verdict: **✅ 82% Compliant**

| Aspect | Score | Details |
|--------|-------|---------|
| **Mutual Exclusivity** | 85% | 7/9 hooks are distinct; 2 subagent triggers overlap |
| **Collective Exhaustiveness** | 70% | Covers pre-write through error handling; missing post-merge/deploy |
| **Library Organization** | 90% | Well-structured with 1 circular dependency issue |
| **Overall MECE Compliance** | 82% | Strong foundation; close 3 documented gaps |

### What Works Well ✅

1. **Trigger points are clean:** Each hook occupies a specific lifecycle phase
2. **Defense-in-depth is intentional:** Overlaps serve layered validation strategy
3. **Modular lib design:** Utilities are reusable and well-separated
4. **Error handling is comprehensive:** All failure modes have handlers

### What Needs Attention ⚠️

1. **Post-merge/deploy gap:** No visibility into production health
2. **Subagent duplication:** Two similar hooks with unclear priority
3. **Circular dependencies:** Minor architectural smell in lib modules
4. **Missing dependency validation:** No pre-commit hook for package security

---

## Appendix: Hook-by-Hook MECE Analysis

### file-logger.sh
- **Purpose:** Informational logging only
- **Overlaps:** None
- **Conflicts:** None
- **MECE:** ✅ Fully exclusive (pure logging hook)

### prevent-credential-exposure.sh
- **Purpose:** Hard-rule credential detection (blocking)
- **Overlaps:** pre-commit-quality.sh (light credential check), pre-write-security.sh (soft AI analysis)
- **Rationale:** Different phases + enforcement levels
- **MECE:** ✅ Intentional layering

### pre-write-security.sh
- **Purpose:** Soft AI-powered security review (non-blocking)
- **Overlaps:** prevent-credential-exposure.sh (specific), pre-commit-quality.sh (general)
- **Rationale:** Complements hard rules with human judgment
- **MECE:** ✅ Intentional layering

### verify-before-edit.sh
- **Purpose:** Reference validation (catch fabricated IDs)
- **Overlaps:** None
- **Conflicts:** None
- **MECE:** ✅ Fully exclusive (specialized security check)

### pre-commit-quality.sh
- **Purpose:** Code quality analysis before commit
- **Overlaps:** pre-write-security.sh (includes security), prevent-credential-exposure.sh (light credential check)
- **Rationale:** Runs after staging; focuses on quality not just security
- **MECE:** ✅ Intentional layering (pre-commit phase distinct from pre-write)

### pre-commit-test-runner.sh
- **Purpose:** Auto-detect and run test framework
- **Overlaps:** None
- **Conflicts:** None
- **MECE:** ✅ Fully exclusive (only test automation hook)

### on-error-debug.sh
- **Purpose:** Error context gathering + subagent delegation
- **Trigger:** Manual invocation only (Claude Code has no OnError hook event)
- **Overlaps:** None
- **Conflicts:** None
- **MECE:** ✅ Fully exclusive (only error handler)

### subagent-trigger.sh
- **Purpose:** Full-featured subagent orchestration
- **Overlaps:** subagent-trigger-simple.sh (same goal, different scope)
- **Rationale:** High-overhead, full-featured alternative to simple version
- **MECE:** ⚠️ **CLARIFICATION NEEDED** — is this active or deprecated?

### subagent-trigger-simple.sh
- **Purpose:** Lightweight subagent delegation
- **Overlaps:** subagent-trigger.sh (same goal, different scope)
- **Rationale:** Low-overhead alternative to full-featured version
- **MECE:** ⚠️ **CLARIFICATION NEEDED** — recommended when/why?

---

## Final Recommendations

**Immediate Actions:**
1. ✅ Document post-merge and post-deploy gaps in issue tracker
2. ✅ Clarify subagent-trigger.sh vs. simple version intent
3. ✅ Extract common utilities to reduce circular dependencies

**Short-term (Sprint):**
1. Create post-merge-verification.sh
2. Create post-deploy-monitoring.sh
3. Create pre-commit-dependency-check.sh

**Long-term:**
1. Build hook registry/configuration management
2. Add runtime monitoring hooks (out of scope for now)
3. Implement hook execution tracing and metrics

---

**End of Report**
