---
description: Run tests with smart defaults, maturity-aware thresholds, and centralized-rules integration
tags: [testing, coverage, quality, tdd, property-based]
---

# Test Execution

Run tests with intelligent defaults aligned to centralized-rules testing standards. No parameters needed for basic usage.

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

**Run tests for changed files only:**
```
/xtest changed
```

**Property-based testing:**
```
/xtest property
```

**Help and options:**
```
/xtest help
/xtest --help
```

## Implementation

If $ARGUMENTS contains "help" or "--help":
Display this usage information and exit.

### Step 1: Detect Project Context

Examine the project structure, detect language, framework, and maturity level:
!ls -la | grep -E "(pyproject.toml|setup.py|requirements.txt|package.json|go.mod|Cargo.toml|pom.xml)"
!find . -name "*test*" -o -name "*spec*" -o -name "__tests__" | head -5
!python -c "import pytest; print('pytest available')" 2>/dev/null || npm test --version 2>/dev/null || echo "Detecting test framework..."

### Step 2: Determine Maturity Level

Assess project maturity to set appropriate thresholds (per centralized-rules/base/testing-philosophy):

| Practice | MVP/POC | Pre-Production | Production |
|----------|---------|----------------|------------|
| Unit tests | Recommended | Required | Required |
| Integration tests | Optional | Recommended | Required |
| Coverage threshold | 40%+ | 60%+ | 80%+ |
| TDD | Optional | Recommended | Required |

Detect maturity signals:
- Has CI/CD config? (`.github/workflows/`, `Jenkinsfile`, etc.)
- Has coverage config? (`.coveragerc`, `jest.config`)
- Has multiple test types? (unit/, integration/, e2e/)

### Step 3: Execute Based on Mode

**Mode 1: Default Test Run (no arguments)**
If $ARGUMENTS is empty or contains "all":

Auto-detect and run available tests:
- **Python**: `python -m pytest -v --tb=short`
- **Node.js**: `npm test` or `npx jest`
- **Go**: `go test ./...`
- **Rust**: `cargo test`

!python -m pytest -v --tb=short 2>/dev/null || npm test 2>/dev/null || go test ./... 2>/dev/null || echo "No standard test configuration found"

**Mode 2: Unit Tests Only (argument: "unit")**
If $ARGUMENTS contains "unit":

Run fast, isolated tests only (target: <100ms each per testing-philosophy):
!python -m pytest -v -k "unit" --tb=short -x 2>/dev/null || npm test -- --testNamePattern="unit" 2>/dev/null

**Mode 3: Coverage Analysis (argument: "coverage")**
If $ARGUMENTS contains "coverage":

Run with coverage and apply maturity-appropriate threshold:
!python -m pytest --cov=. --cov-report=term-missing -v 2>/dev/null || npm test -- --coverage 2>/dev/null

Report against centralized-rules thresholds:
- MVP/POC: 40%+ minimum
- Pre-Production: 60%+ minimum
- Production: 80%+ minimum

**Mode 4: Changed Files Only (argument: "changed")**
If $ARGUMENTS contains "changed":

Run tests only for files changed since last commit:
!git diff --name-only HEAD~1 | grep -E "\.(py|js|ts|go|rs)$" | head -20

Map changed source files to their test files and run only those:
- `src/foo.py` -> `tests/test_foo.py`
- `src/foo.ts` -> `src/foo.test.ts` or `__tests__/foo.test.ts`

**Mode 5: Property-Based Testing (argument: "property")**
If $ARGUMENTS contains "property":

Scan for existing property-based tests and run them:
!grep -r "hypothesis\|fast-check\|gopter\|proptest" . --include="*.py" --include="*.ts" --include="*.go" -l 2>/dev/null

If none found, suggest property-based test candidates by identifying:
- Pure functions (no side effects)
- Data transformations (encode/decode, serialize/deserialize)
- Mathematical operations
- Validation/parsing logic

Per centralized-rules testing-philosophy, property patterns include:
- Inverse operations: `decode(encode(x)) == x`
- Invariants: `sorted(x)[i] <= sorted(x)[i+1]`
- Idempotency: `normalize(normalize(x)) == normalize(x)`

## Test Results Analysis

Follow the testing pyramid (centralized-rules standard):
- 70% unit tests (fast, focused)
- 20% integration tests (moderate speed)
- 10% E2E tests (few, high confidence)

Provide:

1. **Test Summary**: Pass/fail status with counts
2. **Failed Tests**: Failures with concise explanations
3. **Coverage Status**: Percentage vs maturity-appropriate threshold
4. **Testing Pyramid Balance**: Current ratio of unit/integration/e2e
5. **Next Steps**: Specific actions to improve test quality

Report format:
- Tests passed
- Tests failed (with brief error summaries)
- Coverage percentage vs target threshold
- Recommended improvements

Keep output concise and actionable.