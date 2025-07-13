---
description: Execute tests with traceability to specifications and comprehensive coverage reporting
tags: [testing, specifications, coverage, tdd, quality]
---

Execute comprehensive test suites based on the arguments provided in $ARGUMENTS.

First, examine the project structure and testing setup:
!ls -la | grep -E "(test|spec)"
!find . -name "*test*" -o -name "*spec*" | head -10
!python -c "import pytest; print('pytest available')" 2>/dev/null || npm test --version 2>/dev/null || echo "No test framework detected"

Based on $ARGUMENTS, perform the appropriate test execution:

## 1. Specification Tests

If running specification tests (--spec):
!find specs/tests/ -name "*.py" -exec grep -l "#{#" {} \; 2>/dev/null | head -10
!find specs/tests/ -name "*.js" -exec grep -l "spec.*:" {} \; 2>/dev/null | head -5

Execute specification-linked tests:
- Find tests with specification traceability IDs
- Run tests that reference specification requirements
- Validate requirement coverage
- Report traceability metrics

## 2. Unit Testing

If running unit tests (--unit):
!python -m pytest specs/tests/ -v -m "not integration" --tb=short 2>/dev/null || npm test -- --testNamePattern="unit" 2>/dev/null || echo "No unit test configuration"

Execute unit test suite:
- Run isolated unit tests
- Exclude integration and e2e tests
- Report test results and failures
- Generate unit test coverage

## 3. Integration Testing

If running integration tests (--integration):
!python -m pytest specs/tests/ -v -m "integration" --tb=short 2>/dev/null || npm test -- --testNamePattern="integration" 2>/dev/null || echo "No integration test configuration"

Execute integration test suite:
- Run tests with mocked external dependencies
- Test component interactions
- Validate API contracts
- Check integration points

## 4. Coverage Analysis

If running with coverage (--coverage):
!python -m pytest specs/tests/ --cov=. --cov-report=html --cov-report=term-missing -v 2>/dev/null || npm test -- --coverage 2>/dev/null || echo "No coverage configuration"

Generate comprehensive coverage:
- Code coverage percentage
- Line coverage analysis
- Branch coverage metrics
- Specification coverage validation

## 5. Component Testing

If testing specific component (--component):
!find specs/tests/ -name "*$component*" -o -name "test_$component.py" 2>/dev/null | head -5
!grep -r "$component" specs/tests/ --include="*.py" --include="*.js" | head -3

Execute component-specific tests:
- Find tests for specified component
- Run component test suite
- Report component coverage
- Validate component requirements

## 6. Test Quality Assessment

If assessing test quality (--quality):
!find specs/tests/ -name "*.py" -exec grep -c "def test_" {} \; | awk '{sum+=$1} END {print "Total tests:", sum}'
!find . -name "*.py" -exec grep -c "assert" {} \; | awk '{sum+=$1} END {print "Total assertions:", sum}'

Analyze test quality metrics:
- Test count and distribution
- Assertion density
- Test naming conventions
- Test documentation coverage

## 7. Performance Testing

If running performance tests (--performance):
!python -m pytest specs/tests/ -v -m "performance" --tb=short 2>/dev/null || echo "No performance tests configured"
!find specs/tests/ -name "*performance*" -o -name "*load*" | head -3

Execute performance test suite:
- Load testing scenarios
- Response time validation
- Throughput measurements
- Performance regression detection

Think step by step about test execution and provide:

1. **Test Strategy Analysis**:
   - Available test frameworks and configuration
   - Test organization and structure
   - Coverage goals and requirements
   - Quality metrics and standards

2. **Execution Results**:
   - Test pass/fail summary
   - Coverage percentages achieved
   - Performance metrics collected
   - Specification traceability status

3. **Quality Assessment**:
   - Test coverage gaps identified
   - Failed tests and error analysis
   - Performance bottlenecks found
   - Improvement recommendations

4. **Traceability Report**:
   - Specification requirements tested
   - Untested requirements identified
   - Test-to-requirement mapping
   - Coverage improvement opportunities

Generate comprehensive test execution report with detailed metrics, coverage analysis, and actionable recommendations for improving test quality and coverage.