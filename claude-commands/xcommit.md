---
description: Create commits linked to specifications with full traceability and coverage metrics
tags: [git, commit, traceability, tdd, specifications]
---

Create specification-driven commits with traceability based on the arguments provided in $ARGUMENTS.

First, check the current git status and recent commits:
!git status --porcelain
!git log --oneline -5
!git branch --show-current

Based on $ARGUMENTS, perform the appropriate commit operation:

## 1. TDD Cycle Commits

If committing TDD cycle (--tdd):
Analyze staged changes to determine if this follows TDD pattern:
!git diff --cached --name-only
!git diff --cached --stat

Check for test files and implementation files:
!git diff --cached | grep -E "(test_|_test\.py|\.test\.js|spec\.js)"

Generate commit message following TDD pattern:
- Red: Add failing test
- Green: Make test pass  
- Refactor: Improve code

## 2. Message Generation

If generating commit message (--message):
Analyze the changes to determine commit type:
!git diff --cached --name-only | head -10
!git diff --cached --numstat

Determine commit type based on files changed:
- src/ changes → feat/fix
- test/ changes → test
- docs/ changes → docs
- config files → chore

## 3. Traceability Information

If including traceability (--trace):
Look for specification references in the project:
@specs/ 2>/dev/null || echo "No specs directory found"
!find . -name "*.md" | grep -i spec | head -5

Include in commit:
- Specification ID reference
- Files modified
- Test coverage impact
- Related issues or tickets

## 4. Coverage Integration

If including coverage (--coverage):
!python -m pytest --cov=. --cov-report=term-missing 2>/dev/null || npm test -- --coverage 2>/dev/null || echo "No coverage tools found"

Calculate coverage metrics:
- Code coverage percentage
- Test coverage for specifications
- Lines added/modified

## 5. Authority and Compliance

If including authority (--authority):
Check specification authority level:
- system: Core system requirements
- platform: Platform-specific requirements  
- developer: Implementation details

Think step by step about the commit content and generate an appropriate commit message that includes:
- Conventional commit format (type: description)
- Specification reference if provided
- Coverage metrics if requested
- Authority level if specified
- Traceability information if requested

Execute the commit with the generated message:
!git add -A
!git commit -m "Generated commit message with traceability"

Provide a summary of what was committed and any recommendations for future commits.

## 6. Advanced Commit Features

For breaking changes detection:
!git diff --cached | grep -E "(BREAKING CHANGE|breaking change)" || echo "No breaking changes detected"

For co-author support:
If multiple contributors are detected, include co-author lines:
```
Co-authored-by: Name <email@example.com>
```

For dependency tracking:
!git diff --cached package.json requirements.txt 2>/dev/null | grep -E "(\+.*"|"-.*")"

## 7. Quality Gates

Before committing, verify quality gates:
!python -m pytest --tb=short 2>/dev/null || npm test 2>/dev/null || echo "No tests to run"
!python -m mypy . 2>/dev/null || npm run lint 2>/dev/null || echo "No linting configured"

Ensure commit meets quality standards:
- All tests pass
- Code coverage maintained or improved
- Linting passes
- No security vulnerabilities introduced

## 8. Specification Validation

If specification ID is provided, validate it exists:
!find . -name "*.md" -exec grep -l "$spec_id" {} \; 2>/dev/null

Verify specification authority and coverage requirements are met.

Generate final commit message with all requested components and execute the commit.

Report commit success and provide next steps or recommendations for the development workflow.