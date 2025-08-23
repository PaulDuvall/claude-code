---
description: Comprehensive dual coverage analysis for code and specifications
tags: [coverage, testing, specifications, quality, metrics]
---

Perform dual coverage analysis based on the arguments provided in $ARGUMENTS.

First, examine the project structure for test files and coverage tools:
!find . -name "*test*" -o -name "*spec*" | grep -E "\.(py|js|ts)$" | head -10
!ls -la | grep -E "(pytest|jest|coverage|nyc)"
!which pytest 2>/dev/null || which npm 2>/dev/null || echo "No test runners found"

Based on $ARGUMENTS, perform the appropriate coverage analysis:

## 1. HTML Coverage Report Generation

If generating HTML report (--html):
!python -m pytest --cov=. --cov-report=html 2>/dev/null || npm test -- --coverage 2>/dev/null || echo "No coverage tools configured"
!ls htmlcov/ 2>/dev/null && echo "HTML report generated in htmlcov/" || echo "No HTML coverage report found"

## 2. Missing Coverage Analysis

If checking missing coverage (--missing):
!python -m pytest --cov=. --cov-report=term-missing 2>/dev/null || echo "Python coverage not available"
!npm test -- --coverage --verbose 2>/dev/null || echo "JavaScript coverage not available"

Show uncovered lines and specifications that need attention.

## 3. Specification Coverage Analysis

If checking specific specification (--spec):
@specs/ 2>/dev/null || echo "No specs directory found"
!find . -name "*test*" -exec grep -l "$spec_id" {} \; 2>/dev/null

Analyze:
- Tests linked to the specification
- Code coverage for specification implementation
- Traceability from spec to test to code

## 4. Dual Coverage Metrics

If showing dual coverage (--dual):
!python -m pytest --cov=. --cov-report=term 2>/dev/null | grep "TOTAL" || echo "Code coverage not available"
!find specs/ -name "*.md" 2>/dev/null | wc -l | xargs echo "Total specifications:"
!find . -name "*test*" 2>/dev/null | wc -l | xargs echo "Total test files:"

Calculate:
- Code coverage percentage
- Specification coverage percentage
- Traceability coverage percentage
- Combined dual coverage score

## 5. Authority Level Coverage

If checking by authority (--authority):
!grep -r "authority=$authority_level" specs/ 2>/dev/null || echo "No authority specifications found"

Break down coverage by:
- System level specifications
- Platform level specifications  
- Developer level specifications

## 6. Coverage Gaps Analysis

If identifying gaps (--gaps):
!find specs/ -name "*.md" -exec basename {} \; 2>/dev/null | sed 's/\.md$//' > /tmp/specs.txt
!find . -name "*test*" -exec grep -l "spec" {} \; 2>/dev/null | xargs grep -o "spec[0-9a-zA-Z]*" | sort -u > /tmp/tested_specs.txt
!comm -23 <(sort /tmp/specs.txt) <(sort /tmp/tested_specs.txt) 2>/dev/null || echo "Gap analysis not available"

Identify:
- Specifications without tests
- Code without specification coverage
- Missing traceability links

## 7. Comprehensive Metrics Dashboard

If generating metrics (--metrics):
!uptime
!date

Think step by step about coverage analysis and provide:
- Current code coverage percentage
- Specification coverage percentage
- Traceability coverage percentage
- Gap analysis summary
- Recommendations for improvement
- Coverage trends and targets

Generate a comprehensive coverage report with actionable insights and recommendations.

