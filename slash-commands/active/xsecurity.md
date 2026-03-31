---
description: Run security scans with maturity-aware checks and centralized-rules integration
tags: [security, vulnerabilities, scanning, owasp, secrets, dependencies]
---

# Security Analysis

Perform comprehensive security scanning aligned to centralized-rules security principles. No parameters needed for basic usage.

## Usage Examples

**Basic usage (runs all security checks):**
```
/xsecurity
```

**Quick secret scan:**
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

If $ARGUMENTS contains "help" or "--help":
Display this usage information and exit.

### Step 1: Detect Project Context

Detect project type and available security tools:
!ls -la | grep -E "(package.json|requirements.txt|go.mod|Gemfile|pom.xml|composer.json|Cargo.toml)"
!find . -name ".env*" -not -name ".env.example" | head -5

### Step 2: Apply Maturity-Aware Requirements

Per centralized-rules/base/security-principles, requirements vary by maturity:

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

### Step 3: Execute Based on Mode

**Mode 1: Comprehensive Scan (no arguments or "all")**
If $ARGUMENTS is empty or contains "all":

Run complete security analysis covering all centralized-rules principles:

1. **Secret Detection**: Scan for exposed credentials and API keys
!git grep -i -E "(api[_-]?key|secret[_-]?key|password|token|credential|private[_-]?key)" --no-index 2>/dev/null | grep -v -E "(test|spec|mock|example|\.md)" | head -15 || echo "No secrets found in code"
!find . -name ".env" -not -name ".env.example" -exec echo "WARNING: .env file found: {}" \; 2>/dev/null

2. **Dependency Vulnerabilities**: Check for known CVEs
!pip-audit 2>/dev/null || npm audit --audit-level=high 2>/dev/null || echo "Install pip-audit or use npm for dependency checks"

3. **Dangerous Code Patterns**: Look for injection risks
!grep -r -n -E "(eval\(|exec\(|system\(|__import__\(|subprocess\.call\(.*shell=True)" . --include="*.py" 2>/dev/null | head -10
!grep -r -n -E "(innerHTML|dangerouslySetInnerHTML|document\.write)" . --include="*.js" --include="*.ts" --include="*.tsx" 2>/dev/null | head -10

4. **SQL Injection**: Check for string-interpolated queries
!grep -r -n -E "(f\".*SELECT|f\".*INSERT|f\".*UPDATE|f\".*DELETE|\.format\(.*SELECT)" . --include="*.py" 2>/dev/null | head -10
!grep -r -n -E "(\`.*SELECT.*\$\{|\`.*INSERT.*\$\{)" . --include="*.js" --include="*.ts" 2>/dev/null | head -10

5. **Configuration Review**: Check for insecure settings
!grep -r -n -E "(DEBUG\s*=\s*True|CORS_ALLOW_ALL|verify\s*=\s*False|SSL_VERIFY.*false)" . --include="*.py" --include="*.js" --include="*.ts" --include="*.yml" --include="*.yaml" 2>/dev/null | head -10

**Mode 2: Secret Scan Only (argument: "secrets")**
If $ARGUMENTS contains "secrets":

Focus on credential exposure per centralized-rules principle #1 (Never Hardcode Secrets):
!git grep -i -E "(api[_-]?key|secret|password|token|credential|private[_-]?key|aws_access)" --no-index 2>/dev/null | grep -v -E "(test|spec|mock|example|\.md|\.lock)" | head -20
!git log -p --all -S"api_key" --pickaxe-all 2>/dev/null | grep -E "^\+.*api_key" | head -5 || echo "No secrets in git history"
!find . -name "*.pem" -o -name "*.key" -o -name "*.p12" 2>/dev/null | head -5

Verify proper secret management:
- Environment variables used for secrets
- `.env` files are gitignored
- No secrets in committed configuration files

**Mode 3: Dependency Check (argument: "deps")**
If $ARGUMENTS contains "deps":

Per centralized-rules principle #7 (Dependency Management):
!pip-audit --format=columns 2>/dev/null || npm audit 2>/dev/null || echo "Checking dependencies..."
!pip list --outdated 2>/dev/null | head -15 || npm outdated 2>/dev/null | head -15

Check:
- Known CVEs in dependencies
- Outdated packages with security patches
- Unused dependencies (attack surface reduction)
- Lock file integrity

**Mode 4: OWASP Top 10 Review (argument: "owasp")**
If $ARGUMENTS contains "owasp":

Review code against OWASP Top 10 categories:

1. **Injection** (A03): Check parameterized queries, input sanitization
2. **Broken Auth** (A07): Check password hashing (bcrypt/Argon2), session management
3. **Sensitive Data Exposure** (A02): Check encryption at rest/transit, error messages
4. **XSS** (A03): Check output encoding, CSP headers
5. **CSRF** (A01): Check CSRF tokens, SameSite cookies
6. **Security Misconfiguration** (A05): Check default credentials, debug mode
7. **Vulnerable Components** (A06): Check dependency versions

For each category, report: found/not-found/not-applicable with file locations.

**Mode 5: Security Checklist Audit (argument: "checklist")**
If $ARGUMENTS contains "checklist":

Run the complete centralized-rules secure development checklist:
- [ ] No hardcoded secrets or credentials
- [ ] All user input validated and sanitized
- [ ] Authentication and authorization implemented
- [ ] Sensitive data encrypted (at rest and in transit)
- [ ] HTTPS used for all communication
- [ ] Error messages don't leak internal details
- [ ] Dependencies scanned for vulnerabilities
- [ ] Security tests passing
- [ ] Security events logged (without secrets in logs)
- [ ] Principle of least privilege applied
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options)
- [ ] Rate limiting implemented

Report pass/fail for each item with file locations for any issues.

## Security Analysis Results

Categorize findings by severity (per centralized-rules incident response levels):
- **Critical**: Active exploitation risk or data breach potential (fix immediately)
- **High**: Serious vulnerability (fix within days)
- **Medium**: Important issue (fix in next release)
- **Low**: Minor issue (fix when convenient)

Provide:
1. **Security Status**: Overall posture assessment
2. **Critical Issues**: Problems requiring immediate attention with file:line locations
3. **Recommended Actions**: Priority-ordered fix list with specific remediation
4. **Prevention Tips**: How to avoid similar issues

Keep output focused on actionable findings with concrete remediation steps.