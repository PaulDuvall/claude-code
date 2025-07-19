---
description: Run tests with smart defaults (runs all tests if no arguments)
tags: [testing, coverage, quality]
---

# Test Execution

Run tests with intelligent defaults. No parameters needed for basic usage.

## Usage Examples

**Basic usage (runs all available tests):**
```
/xtest
```

**Run with coverage report:**
```
/xtest coverage
```

**Quick unit tests only:**
```
/xtest unit
```

## Implementation

First, examine the project structure and detect testing framework:
!ls -la | grep -E "(test|spec|__tests__|\.test\.|\.spec\.)"
!find . -name "*test*" -o -name "*spec*" -o -name "__tests__" | head -5
!python -c "import pytest; print('✓ pytest available')" 2>/dev/null || npm test --version 2>/dev/null || echo "Detecting test framework..."

Determine testing approach based on $ARGUMENTS (default to running all tests):

**Mode 1: Default Test Run (no arguments)**
If $ARGUMENTS is empty or contains "all":

Auto-detect and run available tests:
- **Python projects**: Run pytest with sensible defaults
- **Node.js projects**: Run npm test or jest
- **Other frameworks**: Detect and run appropriately

!python -m pytest -v --tb=short 2>/dev/null || npm test 2>/dev/null || echo "No standard test configuration found"

**Mode 2: Unit Tests Only (argument: "unit")**
If $ARGUMENTS contains "unit":
!python -m pytest -v -k "unit" --tb=short 2>/dev/null || npm test -- --testNamePattern="unit" 2>/dev/null || echo "Running unit tests..."

Focus on fast, isolated tests:
- Skip integration and e2e tests
- Quick feedback on core logic
- Fast execution for frequent testing

**Mode 3: Coverage Analysis (argument: "coverage")**
If $ARGUMENTS contains "coverage":
!python -m pytest --cov=. --cov-report=term-missing -v 2>/dev/null || npm test -- --coverage 2>/dev/null || echo "Coverage analysis..."

Generate coverage report:
- Show percentage of code tested
- Identify untested code areas
- Highlight coverage gaps
- Suggest areas for additional testing

## Test Results Analysis

Think step by step about test execution and provide:

1. **Test Summary**: Clear pass/fail status with count of tests run
2. **Failed Tests**: List any failures with concise explanations  
3. **Coverage Status**: Coverage percentage if available
4. **Next Steps**: Specific actions to improve test quality

Generate a focused test report showing:
- ✅ Tests passed
- ❌ Tests failed (with brief error summaries)
- 📊 Coverage percentage (if requested)
- 🔧 Recommended improvements

Keep output concise and actionable, focusing on what developers need to know immediately.