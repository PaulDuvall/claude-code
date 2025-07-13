---
description: Write failing tests first following TDD Red phase principles with specification traceability
tags: [tdd, testing, red-phase, specifications, traceability]
---

# /xred — Write Failing Tests First

Write failing tests for specifications following TDD Red phase principles.

Think step by step:
1. Check for SpecDriven AI project structure (specs/ directory)
2. Validate specification existence when using --spec option
3. Create failing tests with proper traceability to specifications
4. Verify tests fail for the right reason before proceeding

## Usage

```bash
/xred --spec <spec-id>       # Create test for specific requirement
/xred --component <name>     # Create test for new component
```

## Implementation Steps

When creating failing tests:

1. **For specification-based tests (--spec)**:
   - Check if SpecDriven AI project structure exists (specs/ directory)
   - If not found, suggest running `!xsetup --env` to initialize
   - Validate that the specified requirement exists in @specs/specifications/
   - Read specification content to understand requirements
   - Create or update test file with failing test linked to specification
   - Verify test fails for correct reason (not due to syntax errors)

2. **For component tests (--component)**:
   - Create basic test structure for new component
   - Include import test and basic functionality test
   - Ensure tests fail initially to satisfy TDD Red phase
   - Provide guidance for next steps in TDD cycle

3. **Error handling**:
   - Validate all required arguments are provided
   - Check for existing tests to avoid duplicates
   - Ensure proper test file structure and naming conventions
   - Verify Python test execution environment is available

## Expected Outputs

- Test files in specs/tests/ directory with proper structure
- Failing tests that guide implementation requirements
- Clear traceability between tests and specifications
- Verification that tests fail for the right reasons
- Guidance for next steps in TDD workflow

Use $ARGUMENTS to handle command-line parameters and `!` prefix for any system commands needed for test execution verification.