---
description: Comprehensive security analysis for defensive development
tags: [security, vulnerabilities, scanning]
---

Perform comprehensive security analysis to identify vulnerabilities and provide remediation guidance.

Start by checking the project type and dependencies:
!ls -la | grep -E "(package.json|requirements.txt|go.mod|Gemfile|pom.xml)"

Based on $ARGUMENTS, focus the security scan on specific areas (--secrets, --dependencies, --code, or run all if no arguments).

## 1. Secret Detection

Scan for exposed secrets and credentials:
!git grep -i -E "(api[_-]?key|secret|password|token|credential)" --no-index 2>/dev/null | grep -v -E "(test|spec|mock)" | head -20

Check git history for accidentally committed secrets:
!git log -p -S"api_key" --no-merges | grep -E "^\+.*api_key" | head -10 2>/dev/null

## 2. Dependency Vulnerabilities

For Python projects:
!pip-audit 2>/dev/null || safety check 2>/dev/null || echo "Install pip-audit or safety for dependency scanning"

For Node.js projects:
!npm audit 2>/dev/null || echo "npm audit not available"

For other ecosystems, check for known vulnerability scanning tools.

## 3. Code Security Analysis

Look for common security vulnerabilities:
- SQL injection patterns
- Command injection risks
- Path traversal vulnerabilities
- Insecure cryptography usage
- Missing authentication/authorization

!grep -r -n -E "(exec\(|eval\(|system\(|SELECT.*FROM.*WHERE.*\+|os\.system)" . --include="*.py" --include="*.js" 2>/dev/null | head -20

## 4. Configuration Security

Check for insecure configurations:
!find . -name "*.yml" -o -name "*.yaml" -o -name "*.env" | xargs grep -l -E "(0.0.0.0|debug.*true|verify.*false)" 2>/dev/null

Think step by step about the security findings and provide:

1. Severity assessment for each finding
2. Specific remediation steps with code examples
3. Priority order for fixes
4. Prevention strategies

Generate a security report in this format:

```
🔒 SECURITY SCAN REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scan Date: [Current date/time]
Total Issues: X (Critical: X, High: X, Medium: X, Low: X)

🔴 CRITICAL ISSUES
────────────────
1. [Issue description]
   File: [path:line]
   Fix: [Specific remediation]
   Reference: [CWE/CVE if applicable]

🟡 HIGH PRIORITY
──────────────
1. [Issue description]
   File: [path:line]
   Fix: [Specific remediation]

🟠 MEDIUM PRIORITY
────────────────
[Similar format]

✅ NEXT STEPS
───────────
1. [Prioritized action item]
2. [Prioritized action item]
3. [Prioritized action item]
```

For any critical findings, provide immediate remediation code examples.

If --fix argument is provided, suggest specific code changes for each issue found.