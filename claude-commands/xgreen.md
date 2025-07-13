---
description: Make failing tests pass following TDD Green phase principles with minimal implementation
tags: [tdd, testing, green-phase, minimal-implementation, specifications]
---

# /xgreen — Make Tests Pass

Implement minimal code to make failing tests pass following TDD Green phase principles.

Think step by step:
1. Check for SpecDriven AI project structure and existing tests
2. Identify currently failing tests and their requirements
3. Guide minimal implementation to make tests pass
4. Verify all tests pass before proceeding to refactor phase

## Usage

```bash
/xgreen --minimal            # Implement just enough to pass
/xgreen --check              # Verify tests pass
```

## Implementation Steps

When implementing code to make tests pass:

1. **For minimal implementation (--minimal)**:
   - Check if SpecDriven AI project structure exists (specs/ directory)
   - If not found, suggest running `!xsetup --env` to initialize
   - Verify that failing tests exist in @specs/tests/
   - If no tests found, suggest creating tests first with `/xred --spec <spec-id>`
   - Run test suite to identify failing tests and their requirements
   - Provide guidance on GREEN phase principles for minimal implementation
   - After implementation, verify tests pass with detailed output

2. **For verification (--check)**:
   - Run comprehensive test suite with detailed reporting
   - Show test coverage information if available
   - Provide clear pass/fail status for GREEN phase completion
   - Guide next steps in TDD workflow based on results

3. **Error handling**:
   - Validate project structure and test environment
   - Handle cases where tests are already passing
   - Provide clear feedback on test failures and requirements
   - Suggest appropriate next steps based on current state

## GREEN Phase Principles

Guide implementation following these principles:
- Make tests pass with MINIMAL code only
- Don't worry about code quality or elegance yet
- Hardcode values if necessary to make tests pass
- Focus on making tests green, not perfect code
- Avoid adding extra functionality beyond test requirements
- Save optimization and refactoring for the next phase

## Expected Outputs

- Clear identification of failing tests and requirements
- Guidance for minimal implementation strategies
- Verification that all tests pass after implementation
- Test coverage reporting when available
- Next steps in TDD workflow (refactor or commit)

Use $ARGUMENTS to handle command-line parameters and `!` prefix for running test commands and coverage analysis.