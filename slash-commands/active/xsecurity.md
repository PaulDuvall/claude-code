---
description: Run security scans via AWS Automated Security Helper (ASH) with maturity-aware thresholds and centralized-rules integration
tags: [security, vulnerabilities, scanning, ash, secrets, dependencies, sast]
---

# Security Analysis

Run comprehensive security scanning through **AWS Automated Security Helper
(ASH, pinned v3.2.6)**, aligned to centralized-rules security principles. ASH
bundles Bandit, Semgrep, detect-secrets, Checkov, cfn-nag, Grype, and npm-audit
under one CLI and emits unified SARIF/JSON. No parameters needed for basic usage.

This command **shells out to ASH** (deterministic and CI-portable); it does
**not** depend on the ASH MCP server. The agent-mediated MCP path lives in the
security-auditor subagent — see the role split below.

## Usage Examples

**Basic usage (full ASH scan, all applicable scanners):**
```
/xsecurity
```

**Quick secret scan (standalone, no ASH/uvx required):**
```
/xsecurity secrets
```

**Dependency vulnerability check:**
```
/xsecurity deps
```

**OWASP Top 10 code review:**
```
/xsecurity owasp
```

**Security checklist audit:**
```
/xsecurity checklist
```

**Help and options:**
```
/xsecurity help
/xsecurity --help
```

## Implementation

ASH is pinned to an **immutable commit SHA** (not the mutable `v3.2.6` tag) so
runs are reproducible. This is the single recorded pin, kept consistent with
`.ash/ash.yaml`, `docs/ash-integration.md`, and the pre-push/CI jobs:

```
ASH_REF=1dca6b3d10ff274115a159d869bdff8b98624b62   # == tag v3.2.6
ASH="uvx --from git+https://github.com/awslabs/automated-security-helper@${ASH_REF} ash"
```

If $ARGUMENTS contains "help" or "--help":
Display this usage information, including the ASH scanner bundle, the three-role
split (this command = on-demand shell-out; hooks = fast deterministic gate;
security-auditor subagent = agent-mediated MCP), and exit.

### Step 1: Detect Project Context and ASH Availability

Detect project type and confirm ASH can run (uvx present). If ASH is
unavailable, fall back to the lightweight standalone checks (secrets mode) and
tell the user how to enable the full scan.

!ls -la | grep -E "(package.json|requirements.txt|go.mod|Gemfile|pom.xml|composer.json|Cargo.toml|\.tf$)" 2>/dev/null
!command -v uvx >/dev/null 2>&1 && echo "uvx available: full ASH scan enabled" || echo "uvx NOT found: install uv (https://docs.astral.sh/uv/) for full ASH scans; secrets mode still works"
!find . -name ".env" -not -name ".env.example" -not -path "*/node_modules/*" 2>/dev/null | head -5

### Step 2: Apply Maturity-Aware Requirements

Per centralized-rules/base/security-principles, requirements vary by maturity.
These thresholds govern what **blocks** vs what is **reported**:

| Practice | MVP/POC | Pre-Production | Production |
|----------|---------|----------------|------------|
| No hardcoded secrets | Required | Required | Required |
| Input validation | Recommended | Required | Required |
| Authentication | Optional | Required | Required |
| RBAC authorization | Optional | Recommended | Required |
| Security headers | Optional | Recommended | Required |
| HTTPS enforcement | Optional | Required | Required |
| Rate limiting | Not needed | Recommended | Required |
| SAST scanning | Not needed | Recommended | Required |
| Dependency scanning | Optional | Required | Required |
| Secret scanning | Optional | Required | Required |

**Severity gate by maturity** (applied to ASH findings):
- **MVP/POC**: block only on CRITICAL and any secret; report everything else.
- **Pre-Production**: block on HIGH+ and any secret; report MEDIUM/LOW.
- **Production**: block on MEDIUM+ and any secret; report LOW/INFO.

Secrets always block at every maturity level.

### Step 3: Execute Based on Mode

**Mode 1: Comprehensive ASH Scan (no arguments or "all")**
If $ARGUMENTS is empty or contains "all":

Run ASH in local mode. `--mode local` uses host scanners via UV tool isolation
(no container/Docker needed) and honors `.ash/ash.yaml` (severity_threshold
MEDIUM, cdk-nag disabled). Results land in `.ash/ash_output/`.

!ASH_REF=1dca6b3d10ff274115a159d869bdff8b98624b62; uvx --from git+https://github.com/awslabs/automated-security-helper@${ASH_REF} ash --mode local 2>&1 | tail -20 || echo "ASH run finished with findings or an error; parsing results below"

Then parse `.ash/ash_output/ash_aggregated_results.json` and present results.
Read these keys (schema: AshAggregatedResults at the pinned ref):

- **Per-finding detail** — `sarif.runs[].results[]`: each has `ruleId`,
  `level`, `message.text`, `properties` (scanner name + severity), and
  `locations[0].physicalLocation.artifactLocation.uri` +
  `...region.startLine`.
- **Per-scanner counts** — `scanner_results[<scanner>]` carry a
  `ScannerSeverityCount` (`critical/high/medium/low/info/suppressed`).
- **Severity values** are the ASH `Severity` enum:
  `critical, high, medium, low, info, none, unknown`.

!test -f .ash/ash_output/ash_aggregated_results.json && echo "FOUND results" || echo "No aggregated results file — ASH may not have produced output; report the run output above"

Present a **severity-grouped summary table** (count per severity), then list the
actionable findings (CRITICAL → HIGH → MEDIUM → LOW) with
`scanner · ruleId · file:line · message`. Apply the Step 2 severity gate for the
detected maturity to decide which findings **block** vs are **reported only**.
Note any suppressed findings (from `.ash/ash.yaml` suppressions) separately.

**Mode 2: Secret Scan Only (argument: "secrets") — standalone, no ASH required**
If $ARGUMENTS contains "secrets":

A fast, dependency-free credential sweep that works even without uvx/ASH. (The
full ASH scan also runs detect-secrets; this mode is the standalone equivalent.)
Per centralized-rules principle #1 (Never Hardcode Secrets):

!git grep -i -E "(api[_-]?key|secret|password|token|credential|private[_-]?key|aws_access)" -- ':!*.md' ':!*.lock' 2>/dev/null | grep -v -E "(test|spec|mock|example|placeholder)" | head -20 || echo "No obvious secrets in tracked files"
!git log -p --all -S"api_key" --pickaxe-all 2>/dev/null | grep -E "^\+.*api_key" | head -5 || echo "No secrets in git history"
!find . -name "*.pem" -o -name "*.key" -o -name "*.p12" 2>/dev/null | grep -v node_modules | head -5

Verify: environment variables used for secrets; `.env` gitignored; no secrets in
committed config. Secrets always block regardless of maturity.

**Mode 3: Dependency Check (argument: "deps")**
If $ARGUMENTS contains "deps":

ASH covers dependencies via Grype (SCA) and npm-audit. Run the full scan and
filter to dependency findings, or use the native tools directly:

!ASH_REF=1dca6b3d10ff274115a159d869bdff8b98624b62; uvx --from git+https://github.com/awslabs/automated-security-helper@${ASH_REF} ash --mode local 2>&1 | tail -10 || pip-audit 2>/dev/null || npm audit 2>/dev/null || echo "Install uv for ASH, or pip-audit/npm for native dependency checks"

Report known CVEs, outdated packages with security patches, and lock-file
integrity from `scanner_results.grype` / `scanner_results["npm-audit"]`.

**Mode 4: OWASP Top 10 Review (argument: "owasp")**
If $ARGUMENTS contains "owasp":

Map ASH's Bandit/Semgrep/Checkov findings to OWASP Top 10 categories, then review
code for gaps the scanners cannot see:

1. **Injection** (A03): parameterized queries, input sanitization
2. **Broken Auth** (A07): password hashing (bcrypt/Argon2), session management
3. **Sensitive Data Exposure** (A02): encryption at rest/transit, error messages
4. **XSS** (A03): output encoding, CSP headers
5. **CSRF** (A01): CSRF tokens, SameSite cookies
6. **Security Misconfiguration** (A05): default credentials, debug mode
7. **Vulnerable Components** (A06): dependency versions (Grype/npm-audit)

For each category, report: found/not-found/not-applicable with file locations.

**Mode 5: Security Checklist Audit (argument: "checklist")**
If $ARGUMENTS contains "checklist":

Run the complete centralized-rules secure development checklist, using ASH
findings as evidence where applicable:
- [ ] No hardcoded secrets or credentials
- [ ] All user input validated and sanitized
- [ ] Authentication and authorization implemented
- [ ] Sensitive data encrypted (at rest and in transit)
- [ ] HTTPS used for all communication
- [ ] Error messages don't leak internal details
- [ ] Dependencies scanned for vulnerabilities (ASH: Grype/npm-audit)
- [ ] Security tests passing
- [ ] Security events logged (without secrets in logs)
- [ ] Principle of least privilege applied
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options)
- [ ] Rate limiting implemented

Report pass/fail for each item with file locations for any issues.

## Security Analysis Results

Categorize findings by the ASH severity enum (per centralized-rules incident
response levels):
- **Critical**: high-risk vulnerability or data-breach potential (fix immediately)
- **High**: serious vulnerability (fix within days)
- **Medium**: important issue (fix in next release)
- **Low / Info**: minor issue (fix when convenient)

Provide:
1. **Security Status**: overall posture and the severity-grouped summary table
2. **Blocking Issues**: findings that exceed the maturity severity gate, with
   `scanner · ruleId · file:line`
3. **Reported (non-blocking) Issues**: findings below the gate
4. **Recommended Actions**: priority-ordered fix list with concrete remediation
5. **Suppressed**: findings excluded via `.ash/ash.yaml`, shown for transparency

Keep output focused on actionable findings with concrete remediation steps.
