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

### From EARS to Test Cases

Each EARS requirement directly maps to test scenarios:

**Requirement:**
```
WHEN the user enters an invalid email format
THE SYSTEM SHALL display "Please enter a valid email address"
```

**Test Cases:**
1. **Positive Test:** Enter invalid email → Verify error message appears
2. **Negative Test:** Enter valid email → Verify no error message
3. **Boundary Test:** Test edge cases (empty, special characters, etc.)

### Test Coverage Matrix

| EARS Pattern | Test Strategy |
|--------------|---------------|
| Ubiquitous | Continuous verification tests |
| Event-Driven | Event simulation tests |
| State-Driven | State transition tests |
| Optional | Feature toggle tests |
| Unwanted | Exception/error tests |

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

## Tools and Automation

### EARS Validation Tools
- **Syntax checkers:** Validate EARS format compliance
- **Ambiguity detectors:** Flag vague terms
- **Consistency checkers:** Find conflicting requirements
- **Coverage analyzers:** Identify missing scenarios

### Integration Points
- **Requirements management tools:** DOORS, Jira, Azure DevOps
- **Test management:** Link requirements to test cases
- **Documentation generators:** Auto-generate specs
- **Traceability tools:** Maintain requirement lineage

## Migration Guide

### Converting Existing Requirements to EARS

**Traditional Requirement:**
"The system must validate user input and show appropriate errors"

**EARS Conversion Process:**
1. Identify the trigger (user input)
2. Specify the condition (validation)
3. Define the response (error display)

**EARS Result:**
```
WHEN the user submits input data
THE SYSTEM SHALL validate against defined rules

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

### Don'ts
- ❌ Mix multiple requirements
- ❌ Include implementation details
- ❌ Use ambiguous terms
- ❌ Forget edge cases
- ❌ Assume context
- ❌ Skip validation
- ❌ Ignore testability

## References and Resources

- Mavin, A., et al. (2009). "Easy Approach to Requirements Syntax (EARS)"
- IEEE 830-1998: Recommended Practice for Software Requirements Specifications
- ISO/IEC/IEEE 29148:2018: Systems and software engineering — Life cycle processes — Requirements engineering

## Appendix: EARS Pattern Decision Tree

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

---

*This specification provides a complete guide to writing requirements in EARS format. Regular updates ensure alignment with industry best practices and emerging patterns.*