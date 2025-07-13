---
description: Machine-readable specifications with unique identifiers and authority levels for precise AI code generation
tags: [specifications, traceability, ai-generation, coverage, requirements, authority]
---

Manage SpecDriven AI specifications based on the arguments provided in $ARGUMENTS.

First, verify SpecDriven AI project structure:
!ls -la specs/ 2>/dev/null || echo "No specs directory found"
!find specs/specifications/ -name "*.md" 2>/dev/null | head -5 || echo "No specifications found"
!find specs/tests/ -name "*.py" 2>/dev/null | head -5 || echo "No tests found"

Based on $ARGUMENTS, perform the appropriate specification operation:

## 1. Specification Reading and Discovery

If reading specifications (--read, --find):
!grep -r "#{#" specs/specifications/ | head -10 2>/dev/null || echo "No specification IDs found"
!find specs/specifications/ -name "*.md" -exec grep -l "authority=" {} \; 2>/dev/null | head -5

Read and analyze specifications:
- Parse specification IDs and authority levels
- Extract requirement descriptions and criteria
- Identify implementation dependencies
- Display specification content and metadata
- Cross-reference related specifications

## 2. Traceability Analysis

If tracing specifications (--trace):
!grep -r "$spec_id" specs/tests/ 2>/dev/null || echo "No tests found for specification"
!grep -r "$spec_id" . --exclude-dir=specs --exclude-dir=.git 2>/dev/null | head -5

Analyze specification traceability:
- Find tests implementing the specification
- Locate code referencing specification ID
- Map requirement-to-implementation relationships
- Validate traceability completeness
- Generate traceability reports

## 3. Specification Validation

If validating specifications (--validate, --machine-readable):
!grep -r "#{#[a-z]{3}[0-9][a-z] authority=" specs/specifications/ 2>/dev/null || echo "Invalid specification format"
!find specs/specifications/ -name "*.md" -exec grep -E "authority=(system|platform|developer)" {} \; | wc -l

Validate specification compliance:
- Check ID format (3 letters + 1 digit + 1 letter)
- Verify authority levels (system/platform/developer)
- Validate specification structure
- Ensure machine-readable format compliance
- Report format violations

## 4. Specification Creation

If creating new specifications (--new):
!find specs/specifications/ -name "*.md" -exec grep -o "#{#[a-z]*[0-9][a-z]" {} \; | sort | tail -5
!mkdir -p specs/specifications specs/tests

Create new specification with proper format:
- Generate unique specification ID
- Apply appropriate authority level
- Create specification template
- Include acceptance criteria
- Add traceability placeholders

## 5. Coverage Analysis

If analyzing coverage (--coverage, --dual-coverage):
!grep -r "#{#" specs/specifications/ | wc -l
!grep -r "#{#" specs/tests/ | wc -l
!python -m pytest --cov=. --cov-report=term-missing specs/tests/ 2>/dev/null || echo "Code coverage not available"

Analyze dual coverage metrics:
- Specification coverage (tests exist for requirements)
- Code coverage (tests execute relevant code)
- Traceability coverage (links maintained)
- Gap analysis and recommendations
- Coverage trend reporting

## 6. AI Code Generation

If generating from specifications (--generate-test, --ai-implement):
@specs/specifications/$spec_file 2>/dev/null || echo "Specification file not found"
!find specs/tests/ -name "*test*" | grep "$component" | head -3

Generate AI implementation:
- Extract requirements from specification
- Generate test cases covering all criteria
- Create minimal implementation code
- Ensure specification traceability
- Validate generated code compliance

## 7. Authority Management

If filtering by authority (--authority):
!grep -r "authority=$authority_level" specs/specifications/ 2>/dev/null || echo "No specifications with authority level found"

Manage specification authority:
- system: Critical system requirements (highest priority)
- platform: Infrastructure/framework requirements
- developer: Application/feature requirements (lowest priority)
- Authority-based filtering and prioritization
- Compliance validation by authority level

## 8. Gap Analysis

If identifying gaps (--gaps):
!find specs/specifications/ -name "*.md" -exec grep -o "#{#[a-z]{3}[0-9][a-z]" {} \; | sort | uniq > /tmp/spec_ids
!find specs/tests/ -name "*.py" -exec grep -o "#{#[a-z]{3}[0-9][a-z]" {} \; | sort | uniq > /tmp/test_ids || touch /tmp/test_ids

Identify specification gaps:
- Specifications without corresponding tests
- Tests without specification references
- Missing implementation coverage
- Broken traceability links
- Prioritized gap remediation

Think step by step about specification management and provide:

1. **Specification Analysis**:
   - Current specification inventory
   - Authority level distribution
   - Format compliance status
   - Coverage metrics and gaps

2. **Traceability Assessment**:
   - Requirement-to-test mapping completeness
   - Implementation traceability status
   - Broken or missing links
   - Cross-reference validation

3. **Quality Metrics**:
   - Specification coverage percentage
   - Code coverage achieved by tests
   - Authority level compliance
   - Format standardization status

4. **Improvement Recommendations**:
   - Missing specifications to create
   - Tests requiring implementation
   - Traceability links to establish
   - Coverage improvement opportunities

Generate comprehensive specification management report with dual coverage analysis, traceability validation, and actionable recommendations for improving SpecDriven AI development practices.

If no specific operation is provided, analyze current specification state and suggest priorities for improvement.