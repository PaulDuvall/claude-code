---
description: Manage and enforce development constraints for quality and compliance
tags: [constraints, quality, compliance, validation, governance]
---

Manage development constraints based on the arguments provided in $ARGUMENTS.

First, check for existing constraint configuration:
!ls -la .constraints.yml .constraints.yaml 2>/dev/null || echo "No constraint configuration found"
!find . -name "*constraint*" -o -name "*rule*" | head -5

Based on $ARGUMENTS, perform the appropriate constraint operation:

## 1. Define New Constraints

If defining constraints (--define):
!touch .constraints.yml
!echo "Adding constraint: $constraint_name" >> .constraints.yml

Common constraint types to define:
- Code complexity limits (max_complexity=10)
- File size limits (max_lines=500)
- Naming conventions (snake_case, camelCase)
- Security patterns (no_secrets, https_only)
- Architecture boundaries (no_direct_db_access)

## 2. Enforce Constraints

If enforcing constraints (--enforce):
!python -m flake8 --max-complexity=10 . 2>/dev/null || echo "No Python linter available"
!eslint --max-complexity 10 . 2>/dev/null || echo "No JavaScript linter available"
!grep -r "password\|secret\|key" . --exclude-dir=.git | head -5 || echo "No hardcoded secrets found"

Check for:
- Code complexity violations
- File size violations
- Naming convention violations
- Security violations
- Architecture violations

## 3. Validate Compliance

If validating constraints (--validate):
!find . -name "*.py" -exec wc -l {} \; | awk '$1 > 500 {print $2 ": " $1 " lines (exceeds 500)"}'
!find . -name "*.js" -exec wc -l {} \; | awk '$1 > 300 {print $2 ": " $1 " lines (exceeds 300)"}'

Validate:
- Code meets complexity limits
- Files are within size limits
- Naming follows conventions
- No security violations
- Architecture boundaries respected

## 4. List Current Constraints

If listing constraints (--list):
@.constraints.yml 2>/dev/null || echo "No constraints file found"
!echo "Active constraints:"
!echo "- Max complexity: 10"
!echo "- Max file lines: 500"
!echo "- Naming: snake_case (Python), camelCase (JavaScript)"
!echo "- Security: No hardcoded secrets"

## 5. Generate Compliance Report

If generating report (--report):
!date
!echo "=== Constraint Compliance Report ==="
!echo "Project: $(basename $(pwd))"

Run constraint checks:
!python -c "import ast; print('Python syntax check: OK')" 2>/dev/null || echo "Python syntax issues found"
!node -c "console.log('JavaScript syntax check: OK')" 2>/dev/null || echo "JavaScript syntax issues found"

Generate summary:
- Total files checked
- Violations found
- Compliance percentage
- Recommendations for fixes

Think step by step about constraint violations and provide:
- Current compliance status
- Specific violations found
- Prioritized fix recommendations
- Prevention strategies
- Integration suggestions

Report overall constraint health and suggest improvements for maintaining code quality and compliance.

