---
description: Comprehensive validation ensuring project meets quality, security, and compliance standards
tags: [validation, quality, compliance]
---

Validate the project against quality, security, and compliance standards.

Parse validation options from $ARGUMENTS (--pre-commit, --pre-deploy, --quality, --security, etc.). Default to comprehensive validation if no arguments.

## 1. Project Structure Check

First, verify essential files exist:
!ls -la | grep -E "(README|LICENSE|.gitignore|requirements.txt|package.json)"

Check project structure:
!find . -type f -name "*.py" -o -name "*.js" -o -name "*.ts" | wc -l
!find . -type f -name "*test*" -o -name "*spec*" | wc -l

## 2. Code Quality Validation

Run linting and formatting checks:
!python -m black --check . 2>/dev/null || echo "Black not configured"
!python -m ruff check . 2>/dev/null || echo "Ruff not configured"
!npm run lint 2>/dev/null || echo "No lint script configured"

Check type annotations (Python):
!python -m mypy . --ignore-missing-imports 2>/dev/null || echo "Mypy not configured"

## 3. Test Coverage Validation

Run tests with coverage:
!python -m pytest --cov=. --cov-report=term-missing 2>/dev/null || npm test -- --coverage 2>/dev/null || echo "No test coverage available"

## 4. Security Validation

Quick security check:
!git grep -i "password.*=" --no-index | grep -v -E "(test|spec|example)" | head -5
!npm audit --audit-level=high 2>/dev/null || echo "No npm audit available"

## 5. Documentation Validation

Check documentation completeness:
!find . -name "*.py" -exec grep -L '"""' {} \; 2>/dev/null | head -10
!test -f README.md && echo "README.md exists" || echo "Missing README.md"

## 6. Configuration Validation

Check for required configuration:
!test -f .env.example && echo ".env.example exists" || echo "Missing .env.example"
!grep -E "TODO|FIXME|XXX" . -r --include="*.py" --include="*.js" | wc -l

Think step by step about validation results and provide:

1. Overall validation status (PASS/FAIL)
2. Specific issues that need fixing
3. Priority order for fixes
4. Commands to fix each issue

Generate validation report in this format:

```
📋 VALIDATION REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Status: [PASS/FAIL]
Validation Type: $ARGUMENTS

✅ PASSED CHECKS (X/Y)
────────────────────
✓ [Check name]: [Details]
✓ [Check name]: [Details]

❌ FAILED CHECKS (X/Y)
────────────────────
✗ [Check name]: [Details]
  Fix: [Specific command or action]
  
✗ [Check name]: [Details]
  Fix: [Specific command or action]

🔧 QUICK FIXES
─────────────
1. [Command to run]
2. [Command to run]
3. [Command to run]

📊 METRICS
─────────
- Code Coverage: X%
- Type Coverage: X%
- Documentation: X%
- Security Issues: X
```

If --fix is provided, attempt to auto-fix issues:
!python -m black . 2>/dev/null
!python -m ruff check --fix . 2>/dev/null

For pre-deployment validation (--pre-deploy), run additional checks:
- Performance benchmarks
- Integration tests
- Environment variable verification
- Database migration status

Return exit code 0 if validation passes, 1 if it fails (for CI/CD integration).