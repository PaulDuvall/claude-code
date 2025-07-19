---
description: Run security scans with smart defaults (scans all areas if no arguments)
tags: [security, vulnerabilities, scanning]
---

# Security Analysis

Perform comprehensive security scanning with intelligent defaults. No parameters needed for basic usage.

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

## Implementation

Start by detecting project type and available security tools:
!ls -la | grep -E "(package.json|requirements.txt|go.mod|Gemfile|pom.xml|composer.json)"

Determine scan scope based on $ARGUMENTS (default to comprehensive scan):

**Mode 1: Comprehensive Scan (no arguments or "all")**
If $ARGUMENTS is empty or contains "all":

Run complete security analysis:
1. **Secret Detection**: Scan for exposed credentials and API keys
2. **Dependency Check**: Check for known vulnerable dependencies  
3. **Code Analysis**: Look for common security anti-patterns
4. **Configuration Review**: Check for insecure settings

!git grep -i -E "(api[_-]?key|secret|password|token)" --no-index 2>/dev/null | grep -v -E "(test|spec|mock|example)" | head -10 || echo "✓ No secrets found in code"
!pip-audit 2>/dev/null || npm audit --audit-level=high 2>/dev/null || echo "Dependency scan: install pip-audit or npm for dependency checks"
!grep -r -E "(eval\(|exec\(|system\()" . --include="*.py" --include="*.js" 2>/dev/null | head -5 || echo "✓ No dangerous code patterns found"

**Mode 2: Secret Scan Only (argument: "secrets")**
If $ARGUMENTS contains "secrets":
!git grep -i -E "(api[_-]?key|secret|password|token|credential)" --no-index 2>/dev/null | grep -v -E "(test|spec|mock|example)" | head -15
!git log -p --all -S"api_key" --pickaxe-all 2>/dev/null | grep -E "^\+.*api_key" | head -5 || echo "✓ No secrets in git history"

Focus on credential exposure:
- Scan current files for hardcoded secrets
- Check git history for accidentally committed credentials
- Identify potential credential leaks
- Provide immediate remediation steps

**Mode 3: Dependency Check (argument: "deps")**
If $ARGUMENTS contains "deps":
!pip-audit --format=json 2>/dev/null || npm audit --json 2>/dev/null || echo "Checking dependencies..."

Analyze dependency vulnerabilities:
- Check for known security issues in dependencies
- Identify outdated packages with vulnerabilities
- Suggest version updates and fixes
- Report critical vs non-critical issues

## Security Analysis Results

Think step by step about the security findings and provide:

1. **Security Status**: Overall security posture assessment
2. **Critical Issues**: Problems requiring immediate attention 
3. **Recommended Actions**: Priority-ordered fix list
4. **Prevention Tips**: How to avoid similar issues

Generate a clear security report showing:
- 🔴 Critical vulnerabilities (fix immediately)
- 🟡 Important issues (fix soon)
- ✅ Areas that look secure
- 🛡️ Recommended security improvements

Keep output focused on actionable findings rather than overwhelming technical details. Provide specific file locations and concrete remediation steps for any issues found.