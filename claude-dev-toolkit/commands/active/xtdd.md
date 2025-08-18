---
description: Complete Test-Driven Development workflow automation with Red-Green-Refactor-Commit cycle
tags: [tdd, testing, red-green-refactor, workflow, specifications, automation]
---

Execute complete TDD workflow automation based on the arguments provided in $ARGUMENTS.

## Usage Examples

**Basic TDD workflow:**
```
/xtdd
```

**Start RED phase:**
```
/xtdd --red ContactForm
```

**Implement GREEN phase:**
```
/xtdd --green
```

**Help and options:**
```
/xtdd --help
```

## Implementation

If $ARGUMENTS contains "help" or "--help":
Display this usage information and exit.

First, verify project structure and TDD readiness:
!ls -la specs/ 2>/dev/null || echo "No specs directory found"
!find specs/tests/ -name "*.py" | head -5 2>/dev/null || echo "No tests found"
!python -c "import pytest; print('pytest available')" 2>/dev/null || echo "pytest not available"

Based on $ARGUMENTS, perform the appropriate TDD phase:

## 1. RED Phase - Write Failing Test

If starting RED phase (--red):
!grep -r "#{#$spec_id" specs/specifications/ 2>/dev/null || echo "Specification not found"
!find specs/tests/ -name "*.py" -exec grep -l "$spec_id" {} \; 2>/dev/null | head -3

Create failing test for specification:
- Verify specification exists and is readable
- Analyze specification requirements and criteria
- Create test file if not exists
- Write test that exercises the requirement
- Ensure test fails (RED phase validation)

## 2. GREEN Phase - Minimal Implementation

If implementing GREEN phase (--green):
!python -m pytest specs/tests/ -x --tb=short 2>/dev/null || echo "Tests currently failing"
!find . -name "*.py" | grep -v test | head -5

Implement minimal passing code:
- Run tests to identify failures
- Implement simplest code to make tests pass
- Focus on meeting test requirements only
- Avoid over-engineering or premature optimization
- Verify all tests pass (GREEN phase validation)

## 3. REFACTOR Phase - Code Quality Improvement

If refactoring (--refactor):
!python -m pytest specs/tests/ -v 2>/dev/null || echo "Tests must pass before refactoring"
!python -c "import mypy" 2>/dev/null && echo "MyPy available" || echo "MyPy not available"
!python -c "import ruff" 2>/dev/null && echo "Ruff available" || echo "Ruff not available"

Improve code quality while maintaining tests:
- Verify tests pass before starting
- Run quality checks (type checking, linting)
- Apply code formatting and style improvements
- Remove duplication and improve naming
- Ensure tests still pass after changes

## 4. COMMIT Phase - Traceability Documentation

If committing changes (--commit):
!git status --porcelain
!grep -r "#{#$spec_id" specs/specifications/ 2>/dev/null | grep -o "authority=[^}]*"
!python -m pytest --cov=. --cov-report=term specs/tests/ 2>/dev/null | grep "TOTAL" || echo "Coverage not available"

Create commit with TDD traceability:
- Final test validation before commit
- Extract specification authority level
- Generate coverage metrics
- Stage all changes for commit
- Create detailed commit message with TDD cycle documentation

## 5. Workflow Validation and Guidance

If validating TDD state:
!find specs/tests/ -name "*.py" -exec grep -l "def test_" {} \; | wc -l
!python -m pytest specs/tests/ --collect-only 2>/dev/null | grep "test" | wc -l || echo "0"

Validate TDD workflow compliance:
- Check for existing tests and specifications
- Verify test-to-specification traceability
- Analyze current TDD cycle phase
- Provide next step recommendations
- Ensure proper TDD discipline

## 6. Quality Gates and Automation

If running quality checks:
!mypy . --ignore-missing-imports 2>/dev/null || echo "Type checking not available"
!ruff check . 2>/dev/null || echo "Linting not available" 
!ruff format . --check 2>/dev/null || echo "Formatting needed"

Automated quality validation:
- Type checking with MyPy
- Code linting with Ruff
- Style formatting validation
- Test coverage analysis
- Security and compliance checks

Think step by step about TDD workflow requirements and provide:

1. **Current TDD State Analysis**:
   - Active TDD phase identification
   - Test and implementation status
   - Specification traceability validation
   - Quality metrics assessment

2. **Phase-Specific Guidance**:
   - RED: Test creation and failure validation
   - GREEN: Minimal implementation strategy
   - REFACTOR: Quality improvement opportunities
   - COMMIT: Traceability and documentation

3. **Quality Assurance**:
   - Test coverage and effectiveness
   - Code quality metrics
   - Specification compliance
   - TDD discipline adherence

4. **Workflow Optimization**:
   - Cycle efficiency improvements
   - Automation opportunities
   - Quality gate enforcement
   - Team collaboration enhancement

Generate comprehensive TDD workflow automation with complete Red-Green-Refactor-Commit cycle, specification traceability, and quality assurance integration.

If no specific phase is provided, analyze current TDD state and recommend next appropriate action based on project status and requirements.