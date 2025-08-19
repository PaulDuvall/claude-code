# EARS Format Specification

## Overview
EARS (Easy Approach to Requirements Syntax) is a structured natural language format for writing clear, unambiguous software requirements. Developed by Alistair Mavin and colleagues at Rolls-Royce, it provides consistent templates that eliminate common ambiguities in requirements documentation while maintaining readability for both technical and non-technical stakeholders.

## Quick Reference Card

| Pattern | Template | Use Case |
|---------|----------|----------|
| **Ubiquitous** | THE SYSTEM SHALL [requirement] | Always active requirements |
| **Event-Driven** | WHEN [trigger] THE SYSTEM SHALL [response] | Response to specific events |
| **State-Driven** | WHILE [state] THE SYSTEM SHALL [response] | Active during specific states |
| **Optional** | WHERE [feature] THE SYSTEM SHALL [response] | Optional feature requirements |
| **Unwanted** | IF [condition] THEN THE SYSTEM SHALL [response] | Error handling/prevention |
| **Complex** | Combination of above patterns | Multiple conditions |

## EARS Pattern Details

### 1. Ubiquitous Requirements
For requirements that are always active without specific triggers:
```
THE SYSTEM SHALL <requirement>
```

**Example:**
```
THE SYSTEM SHALL maintain an audit log of all user actions
```

**When to Use:**
- Global system properties
- Continuous monitoring requirements
- Always-on features

### 2. Event-Driven Requirements
For requirements that trigger when something happens:
```
WHEN <trigger event>
THE SYSTEM SHALL <system response>
```

**Example:**
```
WHEN the user clicks the submit button
THE SYSTEM SHALL validate all form fields and display error messages for invalid inputs
```

**When to Use:**
- User interactions
- System events
- External triggers
- Scheduled events

### 3. State-Driven Requirements
For requirements that apply when the system is in a specific state:
```
WHILE <system state>
THE SYSTEM SHALL <system response>
```

**Example:**
```
WHILE the circuit breaker is in open state
THE SYSTEM SHALL reject all requests and return cached responses
```

**When to Use:**
- Mode-dependent behavior
- Status-based operations
- Conditional system states

### 4. Optional Feature Requirements
For features that may or may not be included:
```
WHERE <feature is included>
THE SYSTEM SHALL <system response>
```

**Example:**
```
WHERE admin logging is enabled
THE SYSTEM SHALL record all administrative actions with timestamps and user identification
```

**When to Use:**
- Configurable features
- Premium/tiered functionality
- Environment-specific requirements

### 5. Unwanted Behavior Requirements
For requirements that prevent or handle unwanted situations:
```
IF <unwanted condition>, THEN
THE SYSTEM SHALL <system response>
```

**Example:**
```
IF the API response time exceeds 5 seconds, THEN
THE SYSTEM SHALL timeout the request and return an error message
```

**When to Use:**
- Error conditions
- Exception handling
- Boundary violations
- Safety constraints

### 6. Complex Requirements
For requirements with multiple conditions:

**Pattern A: Multiple Triggers**
```
WHEN <trigger1> AND <trigger2>
THE SYSTEM SHALL <response>
```

**Pattern B: State + Event**
```
WHILE <state>
WHEN <trigger>
THE SYSTEM SHALL <response>
```

**Pattern C: Optional + Event**
```
WHERE <feature>
WHEN <trigger>
THE SYSTEM SHALL <response>
```

**Example:**
```
WHILE the system is in administrator mode
WHEN the user attempts to delete a critical resource
THE SYSTEM SHALL require two-factor authentication before proceeding
```

## Writing Guidelines

### The EARS Hierarchy
1. **Determine the primary pattern** (choose the most specific applicable pattern)
2. **Add qualifiers if needed** (combine patterns for complex scenarios)
3. **Ensure atomicity** (one requirement per statement)

### Modal Verbs Usage
| Modal | Meaning | Usage |
|-------|---------|-------|
| **SHALL** | Mandatory requirement | Use for all contractual requirements |
| **SHOULD** | Strongly recommended | Use for best practices (avoid in critical systems) |
| **MAY** | Optional/permissible | Use for truly optional behaviors |
| **WILL** | Declaration of fact | Use for describing external behavior |
| **CAN** | Capability statement | Use for describing possibilities |

### Precision Guidelines

#### Quantifiable Terms
Replace vague terms with measurable criteria:

| Avoid | Use Instead |
|-------|-------------|
| "fast" | "within 2 seconds" |
| "user-friendly" | specific UI requirements |
| "secure" | specific security measures |
| "efficient" | "using less than 100MB RAM" |
| "frequently" | "every 5 minutes" |
| "recently" | "within the last 24 hours" |
| "large" | "exceeding 10MB" |

#### Time Specifications
- Use absolute values: "within 500 milliseconds"
- Specify time zones when relevant: "at 00:00 UTC"
- Define time windows: "between 2:00 AM and 4:00 AM EST"

### Common Pitfalls and Solutions

#### Pitfall 1: Passive Voice
❌ **Poor:** "Validation shall be performed by the system"
✅ **Better:** "THE SYSTEM SHALL validate the input"

#### Pitfall 2: Multiple Requirements
❌ **Poor:** "THE SYSTEM SHALL validate, save, and notify"
✅ **Better:** Write three separate requirements:
```
WHEN the user submits valid data
THE SYSTEM SHALL validate the input format

WHEN the input validation passes
THE SYSTEM SHALL save the data to the database

WHEN the data is successfully saved
THE SYSTEM SHALL send a confirmation notification
```

#### Pitfall 3: Implementation Coupling
❌ **Poor:** "THE SYSTEM SHALL use PostgreSQL to store user data"
✅ **Better:** "THE SYSTEM SHALL persist user data with ACID compliance"

#### Pitfall 4: Ambiguous Pronouns
❌ **Poor:** "WHEN it receives a request, THE SYSTEM SHALL process it"
✅ **Better:** "WHEN the API receives a request, THE SYSTEM SHALL process the request payload"

## Document Structure Template

```markdown
# [System/Feature Name] Requirements Specification

## Document Information
- **Version:** 1.0.0
- **Date:** YYYY-MM-DD
- **Author:** [Name]
- **Status:** [Draft/Review/Approved]

## Glossary
Define all domain-specific terms used in requirements.

## Assumptions and Dependencies
List any assumptions made and external dependencies.

## Functional Requirements

### [Category 1] Requirements

#### REQ-001: [Requirement Title]
**Priority:** [High/Medium/Low]
**WHEN** <condition>
**THE SYSTEM SHALL** <response>
**Rationale:** Brief explanation of why this requirement exists
**Acceptance Criteria:** Specific testable criteria

### Performance Requirements

### Security Requirements

### Interface Requirements

## Non-Functional Requirements

## Traceability Matrix
Link requirements to business objectives and test cases.

## Change Log
Document all changes to requirements over time.
```

## Testing Integration

### Test Naming Conventions

#### Standard Test Name Format
```
test_<REQ-ID>_<scenario>_<expected_outcome>
```

#### Examples:
```python
# For REQ-AUTH-001: User login validation
test_REQ_AUTH_001_valid_credentials_successful_login()
test_REQ_AUTH_001_invalid_password_error_displayed()
test_REQ_AUTH_001_empty_username_validation_error()

# For REQ-PERF-002: Response time requirement
test_REQ_PERF_002_api_response_under_2_seconds()
test_REQ_PERF_002_high_load_maintains_performance()
```

#### Test Class Naming
```python
class TestREQ_AUTH_001_UserAuthentication:
    """Test suite for REQ-AUTH-001: User Authentication requirement"""
    
    def test_valid_login_succeeds(self):
        """Verify successful login with valid credentials"""
        pass
    
    def test_invalid_login_fails(self):
        """Verify login failure with invalid credentials"""
        pass
```

### Test Directory Structure

```
project-root/
├── requirements/
│   ├── functional/
│   │   ├── REQ-AUTH-001.md
│   │   ├── REQ-AUTH-002.md
│   │   └── REQ-DATA-001.md
│   ├── non-functional/
│   │   ├── REQ-PERF-001.md
│   │   └── REQ-SEC-001.md
│   └── requirements-matrix.csv
├── src/
│   ├── authentication/
│   │   ├── login.py
│   │   └── logout.py
│   └── data/
│       └── validation.py
├── tests/
│   ├── unit/
│   │   ├── authentication/
│   │   │   ├── test_REQ_AUTH_001_login.py
│   │   │   └── test_REQ_AUTH_002_logout.py
│   │   └── data/
│   │       └── test_REQ_DATA_001_validation.py
│   ├── integration/
│   │   ├── test_REQ_INT_001_api_flow.py
│   │   └── test_REQ_INT_002_database.py
│   ├── performance/
│   │   ├── test_REQ_PERF_001_response_time.py
│   │   └── test_REQ_PERF_002_throughput.py
│   └── e2e/
│       ├── test_REQ_E2E_001_user_journey.py
│       └── test_REQ_E2E_002_checkout_flow.py
└── docs/
    └── traceability-matrix.md
```

### Test File Organization

#### Test File Header Template
```python
"""
Test Suite: REQ-AUTH-001 - User Authentication
Requirement: WHEN the user enters valid credentials
            THE SYSTEM SHALL authenticate and create a session
            
Created: 2024-01-15
Author: John Developer
Last Modified: 2024-02-20

Related Requirements: REQ-SEC-001, REQ-AUDIT-003
Implementation Files: src/authentication/login.py
"""

import pytest
from datetime import datetime

class TestREQ_AUTH_001:
    """Test cases for requirement REQ-AUTH-001"""
    
    @pytest.mark.requirement("REQ-AUTH-001")
    @pytest.mark.priority("high")
    def test_REQ_AUTH_001_valid_login(self):
        """
        Test ID: TC-REQ-AUTH-001-01
        Scenario: Valid credentials provided
        Expected: Successful authentication and session creation
        """
        # Test implementation
        pass
```

### From EARS to Test Cases

Each EARS requirement directly maps to test scenarios:

**Requirement:**
```
REQ-VAL-001:
WHEN the user enters an invalid email format
THE SYSTEM SHALL display "Please enter a valid email address"
```

**Generated Test Cases:**
```python
class TestREQ_VAL_001_EmailValidation:
    """Test suite for email validation requirement REQ-VAL-001"""
    
    def test_REQ_VAL_001_invalid_format_shows_error(self):
        """TC-REQ-VAL-001-01: Invalid email triggers error message"""
        # Arrange
        invalid_emails = ["notanemail", "@example.com", "user@", "user..name@example.com"]
        
        # Act & Assert
        for email in invalid_emails:
            result = validate_email(email)
            assert result.error_message == "Please enter a valid email address"
    
    def test_REQ_VAL_001_valid_format_no_error(self):
        """TC-REQ-VAL-001-02: Valid email does not trigger error"""
        # Arrange
        valid_emails = ["user@example.com", "user.name@example.co.uk"]
        
        # Act & Assert
        for email in valid_emails:
            result = validate_email(email)
            assert result.error_message is None
    
    def test_REQ_VAL_001_boundary_cases(self):
        """TC-REQ-VAL-001-03: Boundary and edge cases"""
        # Test empty, null, special characters, max length, etc.
        pass
```

### Test Coverage Matrix

| EARS Pattern | Test Strategy | Test Types Required |
|--------------|---------------|---------------------|
| Ubiquitous | Continuous verification tests | Unit, Integration, Monitoring |
| Event-Driven | Event simulation tests | Unit, Integration, E2E |
| State-Driven | State transition tests | Unit, Integration, State-based |
| Optional | Feature toggle tests | Unit, Configuration |
| Unwanted | Exception/error tests | Unit, Error injection, Chaos |

## Requirements Traceability Matrix (RTM)

### RTM Structure

The Requirements Traceability Matrix links requirements through their entire lifecycle:

```csv
Requirement ID,Requirement Text,Priority,Source,Implementation Files,Test Cases,Test Status,Coverage %,Release Version
REQ-AUTH-001,"WHEN user enters credentials THE SYSTEM SHALL authenticate",High,Business Req BR-023,"src/auth/login.py, src/auth/session.py","TC-REQ-AUTH-001-01, TC-REQ-AUTH-001-02, TC-REQ-AUTH-001-03",Passed,100%,v1.2.0
REQ-AUTH-002,"WHILE user session is active THE SYSTEM SHALL maintain authentication",High,Security Policy SP-001,src/auth/session.py,"TC-REQ-AUTH-002-01, TC-REQ-AUTH-002-02",In Progress,75%,v1.3.0
REQ-PERF-001,"THE SYSTEM SHALL respond within 2 seconds",Medium,SLA-2024,src/api/middleware.py,TC-REQ-PERF-001-01,Passed,100%,v1.1.0
```

### Bidirectional Traceability

#### Forward Traceability (Requirements → Implementation → Tests)
```yaml
requirement:
  id: REQ-AUTH-001
  text: "WHEN user enters valid credentials THE SYSTEM SHALL authenticate"
  traces_to:
    implementation:
      - file: src/authentication/login.py
        functions: [authenticate_user, validate_credentials]
      - file: src/authentication/session.py
        functions: [create_session]
    tests:
      - test_file: tests/unit/test_REQ_AUTH_001_login.py
        test_cases: 
          - TC-REQ-AUTH-001-01
          - TC-REQ-AUTH-001-02
      - test_file: tests/integration/test_REQ_AUTH_001_flow.py
        test_cases:
          - TC-REQ-AUTH-001-03
```

#### Backward Traceability (Tests → Implementation → Requirements)
```yaml
test_case:
  id: TC-REQ-AUTH-001-01
  name: test_valid_credentials_successful_login
  verifies:
    requirement: REQ-AUTH-001
    implementation:
      - src/authentication/login.py#authenticate_user
    acceptance_criteria:
      - Valid credentials accepted
      - Session token generated
      - User redirected to dashboard
```

### Traceability Matrix Generation

#### Automated Generation Script
```python
"""
traceability_generator.py
Generates RTM from code annotations and test markers
"""

import ast
import re
from pathlib import Path
import pandas as pd

class TraceabilityGenerator:
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.requirements = {}
        self.implementations = {}
        self.tests = {}
    
    def scan_requirements(self):
        """Extract requirements from markdown files"""
        req_pattern = r'(REQ-\w+-\d+):\s*(.*?)(?=REQ-|\Z)'
        # Implementation to parse requirements
        pass
    
    def scan_implementation(self):
        """Extract requirement references from source code"""
        for py_file in self.project_root.glob('src/**/*.py'):
            with open(py_file) as f:
                content = f.read()
                # Look for comments like: # Implements: REQ-AUTH-001
                req_refs = re.findall(r'#\s*Implements:\s*(REQ-\w+-\d+)', content)
                # Store mapping
                pass
    
    def scan_tests(self):
        """Extract test-requirement mappings"""
        for test_file in self.project_root.glob('tests/**/*.py'):
            # Parse test decorators and docstrings
            pass
    
    def generate_matrix(self):
        """Generate the complete traceability matrix"""
        # Combine all mappings into DataFrame
        df = pd.DataFrame({
            'Requirement_ID': list(self.requirements.keys()),
            'Implementation': [...],
            'Tests': [...],
            'Coverage': [...]
        })
        return df
```

### Implementation Annotations

#### Source Code Requirement Tracking
```python
# src/authentication/login.py

def authenticate_user(username: str, password: str) -> AuthResult:
    """
    Authenticate user with provided credentials.
    
    Implements: REQ-AUTH-001
    Related: REQ-SEC-001, REQ-AUDIT-003
    """
    # @requirement REQ-AUTH-001.1: Validate input format
    if not username or not password:
        raise ValidationError("Credentials required")
    
    # @requirement REQ-AUTH-001.2: Check credentials
    user = verify_credentials(username, password)
    
    # @requirement REQ-AUTH-001.3: Create session
    if user:
        session = create_session(user)
        # @requirement REQ-AUDIT-003: Log authentication
        audit_log.record("login", user.id)
        return AuthResult(success=True, session=session)
    
    return AuthResult(success=False)
```

### Test Result Integration

#### Test Report with Requirement Coverage
```xml
<!-- test-results.xml -->
<testsuites>
  <testsuite name="Authentication Requirements">
    <testcase classname="TestREQ_AUTH_001" 
              name="test_valid_login" 
              time="0.023">
      <requirement>REQ-AUTH-001</requirement>
      <implementation>src/authentication/login.py#authenticate_user</implementation>
      <status>passed</status>
    </testcase>
    <testcase classname="TestREQ_AUTH_001" 
              name="test_invalid_login" 
              time="0.019">
      <requirement>REQ-AUTH-001</requirement>
      <implementation>src/authentication/login.py#authenticate_user</implementation>
      <status>passed</status>
    </testcase>
  </testsuite>
</testsuites>
```

### Coverage Metrics

#### Requirement Coverage Calculation
```python
def calculate_coverage(requirement_id: str) -> dict:
    """Calculate test coverage for a specific requirement"""
    
    coverage = {
        'requirement_id': requirement_id,
        'total_scenarios': 0,
        'tested_scenarios': 0,
        'passed_tests': 0,
        'failed_tests': 0,
        'coverage_percentage': 0.0,
        'implementation_coverage': 0.0
    }
    
    # Get all test scenarios for requirement
    scenarios = get_test_scenarios(requirement_id)
    coverage['total_scenarios'] = len(scenarios)
    
    # Count tested scenarios
    tested = [s for s in scenarios if s.has_test]
    coverage['tested_scenarios'] = len(tested)
    
    # Calculate percentage
    if coverage['total_scenarios'] > 0:
        coverage['coverage_percentage'] = (
            coverage['tested_scenarios'] / coverage['total_scenarios'] * 100
        )
    
    return coverage
```

### Continuous Integration Integration

#### CI Pipeline Configuration
```yaml
# .github/workflows/requirements-validation.yml
name: Requirements Validation and Coverage

on: [push, pull_request]

jobs:
  validate-requirements:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Validate EARS Format
        run: |
          python scripts/validate_ears.py requirements/
      
      - name: Check Requirement Coverage
        run: |
          python scripts/check_coverage.py --min-coverage 80
      
      - name: Generate Traceability Matrix
        run: |
          python scripts/generate_rtm.py --output docs/rtm.html
      
      - name: Upload Coverage Report
        uses: actions/upload-artifact@v2
        with:
          name: requirements-coverage
          path: docs/rtm.html
```

## Advanced Patterns

### Temporal Requirements
```
WHEN <event> occurs
THE SYSTEM SHALL <response> WITHIN <time constraint>
```

**Example:**
```
WHEN the emergency stop button is pressed
THE SYSTEM SHALL halt all operations WITHIN 100 milliseconds
```

### Conditional Responses
```
WHEN <trigger>
IF <condition1> THE SYSTEM SHALL <response1>
ELSE IF <condition2> THE SYSTEM SHALL <response2>
ELSE THE SYSTEM SHALL <response3>
```

### Sequenced Requirements
```
WHEN <initial trigger>
THE SYSTEM SHALL <action1>
THEN THE SYSTEM SHALL <action2>
THEN THE SYSTEM SHALL <action3>
```

## Domain-Specific Examples

### Web Application
```
WHEN the user's session expires
THE SYSTEM SHALL redirect to the login page and preserve the intended destination

WHILE the user is editing a document
THE SYSTEM SHALL auto-save changes every 30 seconds

IF the browser loses network connectivity, THEN
THE SYSTEM SHALL switch to offline mode and queue changes for synchronization
```

### IoT/Embedded Systems
```
WHEN the temperature sensor reads above 75°C
THE SYSTEM SHALL activate the cooling fan and log the event

WHILE the device is in power-saving mode
THE SYSTEM SHALL poll sensors every 60 seconds instead of continuously

IF the sensor reading is outside the valid range [-40°C to 125°C], THEN
THE SYSTEM SHALL mark the sensor as faulty and use the last known good value
```

### API Services
```
WHEN the API receives a request without authentication headers
THE SYSTEM SHALL return HTTP 401 with error message "Authentication required"

WHILE the rate limit is exceeded for a client
THE SYSTEM SHALL return HTTP 429 with retry-after header

WHERE API versioning is enabled
THE SYSTEM SHALL route requests based on the version header or URL parameter
```

## Quality Metrics

### Requirement Quality Indicators
- **Completeness:** All scenarios covered (happy path, errors, edge cases)
- **Consistency:** No conflicting requirements
- **Testability:** Clear pass/fail criteria
- **Feasibility:** Technically implementable
- **Clarity:** Unambiguous to all stakeholders
- **Atomicity:** One requirement per statement
- **Traceability:** Linked to business needs

### Review Checklist
- [ ] Uses correct EARS pattern
- [ ] Contains measurable criteria
- [ ] Free of implementation details
- [ ] No ambiguous terms
- [ ] Includes all necessary context
- [ ] Defines complete system response
- [ ] Has clear acceptance criteria
- [ ] Reviewed by stakeholder
- [ ] Technically feasible
- [ ] Testable by QA
- [ ] Has unique requirement ID
- [ ] Linked to source (business requirement, user story, etc.)
- [ ] Test cases defined
- [ ] Implementation approach identified

## Tools and Automation

### EARS Validation Tools
- **Syntax checkers:** Validate EARS format compliance
- **Ambiguity detectors:** Flag vague terms
- **Consistency checkers:** Find conflicting requirements
- **Coverage analyzers:** Identify missing scenarios
- **Traceability generators:** Auto-generate RTM from code

### Integration Points
- **Requirements management tools:** DOORS, Jira, Azure DevOps
- **Test management:** Link requirements to test cases
- **Documentation generators:** Auto-generate specs
- **Traceability tools:** Maintain requirement lineage
- **CI/CD pipelines:** Automated validation and coverage checks

### Tool Configuration Examples

#### Pytest Configuration for Requirement Tracking
```ini
# pytest.ini
[pytest]
markers =
    requirement(id): Mark test with requirement ID
    priority(level): Mark test priority (high, medium, low)
    acceptance: Mark as acceptance test

testpaths = tests
python_files = test_REQ_*.py
python_classes = TestREQ*
python_functions = test_REQ_*

# Generate requirement coverage report
addopts = 
    --requirement-coverage
    --requirement-report=docs/requirement-coverage.html
```

#### Jest Configuration for JavaScript Testing
```javascript
// jest.config.js
module.exports = {
  testMatch: [
    '**/tests/**/test_REQ_*.js',
    '**/tests/**/test_REQ_*.ts'
  ],
  reporters: [
    'default',
    ['./requirement-reporter', {
      outputPath: 'docs/requirement-coverage.json'
    }]
  ],
  setupFilesAfterEnv: ['./jest.requirements.setup.js']
};
```

## Migration Guide

### Converting Existing Requirements to EARS

**Traditional Requirement:**
"The system must validate user input and show appropriate errors"

**EARS Conversion Process:**
1. Identify the trigger (user input)
2. Specify the condition (validation)
3. Define the response (error display)
4. Assign unique ID
5. Create test scenarios

**EARS Result:**
```
REQ-VAL-001:
WHEN the user submits input data
THE SYSTEM SHALL validate against defined rules

REQ-VAL-002:
WHEN validation fails
THE SYSTEM SHALL display field-specific error messages
```

## Best Practices Summary

### Do's
- ✅ Use active voice
- ✅ Be specific and measurable
- ✅ One requirement per statement
- ✅ Include rationale when helpful
- ✅ Link to acceptance criteria
- ✅ Version control requirements
- ✅ Regular stakeholder reviews
- ✅ Maintain bidirectional traceability
- ✅ Use consistent naming conventions
- ✅ Automate coverage tracking

### Don'ts
- ❌ Mix multiple requirements
- ❌ Include implementation details
- ❌ Use ambiguous terms
- ❌ Forget edge cases
- ❌ Assume context
- ❌ Skip validation
- ❌ Ignore testability
- ❌ Break traceability chain
- ❌ Use duplicate requirement IDs
- ❌ Forget to update RTM

## References and Resources

- Mavin, A., et al. (2009). "Easy Approach to Requirements Syntax (EARS)"
- IEEE 830-1998: Recommended Practice for Software Requirements Specifications
- ISO/IEC/IEEE 29148:2018: Systems and software engineering — Life cycle processes — Requirements engineering
- ISTQB Test Management Body of Knowledge
- Requirements Engineering and Management for Software Development Projects (2013)

## Appendix A: EARS Pattern Decision Tree

```
Is the requirement always active?
├─ Yes → Use UBIQUITOUS pattern
└─ No → Does it depend on a trigger?
    ├─ Yes → Is it an error/unwanted condition?
    │   ├─ Yes → Use UNWANTED pattern (IF...THEN)
    │   └─ No → Use EVENT-DRIVEN pattern (WHEN)
    └─ No → Does it depend on system state?
        ├─ Yes → Use STATE-DRIVEN pattern (WHILE)
        └─ No → Is it an optional feature?
            ├─ Yes → Use OPTIONAL pattern (WHERE)
            └─ No → Combine patterns for COMPLEX requirement
```

## Appendix B: Requirement ID Naming Convention

### Standard Format
```
REQ-<CATEGORY>-<NUMBER>
```

### Category Codes
- **AUTH**: Authentication & Authorization
- **DATA**: Data Management
- **UI**: User Interface
- **API**: API Requirements
- **PERF**: Performance
- **SEC**: Security
- **INT**: Integration
- **E2E**: End-to-End flows
- **NFR**: Non-Functional Requirements

### Examples:
- REQ-AUTH-001: First authentication requirement
- REQ-PERF-010: Tenth performance requirement
- REQ-API-023: Twenty-third API requirement

---

*This specification provides a complete guide to writing requirements in EARS format with comprehensive testing integration and traceability. Regular updates ensure alignment with industry best practices and emerging patterns.*