# Subagent-Hook Integration Requirements Specification

## Document Information
- **Version:** 1.0.0
- **Date:** 2025-08-22
- **Author:** Claude
- **Status:** Draft (Created Post-Implementation for Documentation)
- **Purpose:** Define requirements for integrating subagents with Claude Code hooks for event-driven execution

## Executive Summary
This specification defines the requirements for a system that enables automatic invocation of specialized AI subagents during specific Claude Code events. The integration ensures appropriate expertise is applied automatically during development workflows through a hook-based event system.

## Glossary
- **Subagent**: A specialized Claude Code agent with focused expertise
- **Hook**: A script or command triggered by Claude Code events
- **Event**: A specific action or state change in Claude Code (e.g., file edit, test run)
- **Blocking Hook**: A hook that prevents further execution if it fails
- **Non-blocking Hook**: A hook that runs asynchronously without blocking operations
- **Context**: Environmental and event information passed to subagents

## Assumptions and Dependencies
- Claude Code hooks system is installed and configured
- Subagents are defined in `.md` format with YAML frontmatter
- Bash shell is available on the system
- File system supports Unix permissions
- YAML parser is available for configuration files

## Functional Requirements

### Event Detection and Triggering

#### REQ-HOOK-001: Event-Based Subagent Triggering
**Priority:** High  
WHEN a Claude Code tool event occurs that matches a configured pattern  
THE SYSTEM SHALL invoke the subagent-trigger hook with appropriate parameters  
**Rationale:** Enables automatic subagent execution based on development events  
**Acceptance Criteria:** Configured events reliably trigger associated subagents

#### REQ-HOOK-002: Tool Pattern Matching
**Priority:** High  
WHEN the Claude Code hook matcher includes tool patterns (e.g., "Edit|Write|MultiEdit")  
THE SYSTEM SHALL trigger hooks only for matching tool invocations  
**Rationale:** Provides granular control over when subagents are invoked  
**Acceptance Criteria:** Only specified tools trigger associated hooks

#### REQ-HOOK-003: Event Type Classification
**Priority:** High  
THE SYSTEM SHALL support classification of events into categories:
- pre_write, post_write
- pre_commit, post_commit  
- pre_test, post_test
- on_error
- security_check
- custom events  
**Rationale:** Enables organized event handling and configuration  
**Acceptance Criteria:** All event types are recognized and handled correctly

### Subagent Discovery and Validation

#### REQ-HOOK-004: Subagent Discovery
**Priority:** High  
WHEN a subagent is requested by name  
THE SYSTEM SHALL search for the subagent file in:
1. Project-level: `.claude/subagents/`
2. User-level: `~/.claude/subagents/`  
**Rationale:** Supports both project-specific and user-wide subagents  
**Acceptance Criteria:** Subagents are found in priority order (project > user)

#### REQ-HOOK-005: Subagent Validation
**Priority:** High  
WHEN a subagent file is discovered  
THE SYSTEM SHALL validate:
- File exists and is readable
- Contains valid YAML frontmatter
- Has required fields (name, description)  
**Rationale:** Ensures only valid subagents are executed  
**Acceptance Criteria:** Invalid subagents are rejected with clear error messages

#### REQ-HOOK-006: Missing Subagent Handling
**Priority:** Medium  
IF a requested subagent is not found, THEN  
THE SYSTEM SHALL log an error and exit with non-zero status  
**Rationale:** Prevents silent failures and aids debugging  
**Acceptance Criteria:** Missing subagents produce clear error messages

### Configuration Management

#### REQ-HOOK-007: Event Mapping Configuration
**Priority:** High  
WHERE a subagent-hooks.yaml file exists  
THE SYSTEM SHALL parse event-to-subagent mappings from the configuration  
**Rationale:** Provides declarative configuration of event handlers  
**Acceptance Criteria:** YAML configuration correctly maps events to subagents

#### REQ-HOOK-008: Priority Configuration
**Priority:** Medium  
WHERE priorities are defined in configuration  
THE SYSTEM SHALL execute subagents in priority order (lowest number first)  
**Rationale:** Ensures critical checks run before less important ones  
**Acceptance Criteria:** Execution order matches configured priorities

#### REQ-HOOK-009: Blocking Behavior Configuration
**Priority:** High  
WHERE a subagent is configured as blocking  
THE SYSTEM SHALL prevent further operations if the subagent fails  
**Rationale:** Critical checks can halt dangerous operations  
**Acceptance Criteria:** Blocking subagents stop execution on failure

### Context Gathering and Passing

#### REQ-HOOK-010: Context Information Gathering
**Priority:** High  
WHEN a subagent is invoked  
THE SYSTEM SHALL gather context including:
- Timestamp
- Event type
- Tool name
- File path
- User information
- Working directory
- Git branch  
**Rationale:** Provides subagents with necessary environmental information  
**Acceptance Criteria:** All context fields are populated when available

#### REQ-HOOK-011: Context File Generation
**Priority:** Medium  
WHEN context is gathered  
THE SYSTEM SHALL write it to a temporary JSON file  
**Rationale:** Enables structured data passing to subagents  
**Acceptance Criteria:** Valid JSON is generated with all context fields

#### REQ-HOOK-012: Context Cleanup
**Priority:** Medium  
WHEN subagent execution completes  
THE SYSTEM SHALL remove temporary context files  
**Rationale:** Prevents accumulation of temporary files  
**Acceptance Criteria:** No context files remain after execution

### Execution Control

#### REQ-HOOK-013: Timeout Enforcement
**Priority:** High  
WHERE a timeout is configured for a hook  
THE SYSTEM SHALL terminate the subagent if execution exceeds the timeout  
**Rationale:** Prevents hung processes from blocking operations  
**Acceptance Criteria:** Subagents are terminated at configured timeout

#### REQ-HOOK-014: Multiple Subagent Execution
**Priority:** Medium  
WHEN multiple subagents are configured for an event  
THE SYSTEM SHALL execute them sequentially in configured order  
**Rationale:** Enables comprehensive event handling  
**Acceptance Criteria:** All configured subagents run for their events

#### REQ-HOOK-015: Event-Wide Execution
**Priority:** Low  
WHEN invoked with --event flag  
THE SYSTEM SHALL execute all subagents configured for that event  
**Rationale:** Provides batch execution capability  
**Acceptance Criteria:** All event subagents are executed

### Error Handling and Recovery

#### REQ-HOOK-016: Error Logging
**Priority:** High  
IF an error occurs during subagent execution, THEN  
THE SYSTEM SHALL log the error with timestamp and context  
**Rationale:** Enables troubleshooting and debugging  
**Acceptance Criteria:** Errors are logged with sufficient detail

#### REQ-HOOK-017: Non-Blocking Failure Handling
**Priority:** Medium  
IF a non-blocking subagent fails, THEN  
THE SYSTEM SHALL log the failure but continue operation  
**Rationale:** Non-critical failures shouldn't stop workflow  
**Acceptance Criteria:** Operations continue after non-blocking failures

#### REQ-HOOK-018: Emergency Override
**Priority:** Low  
WHERE CLAUDE_SECURITY_OVERRIDE environment variable is set to true  
THE SYSTEM SHALL allow bypassing blocking security hooks  
**Rationale:** Provides escape hatch for critical situations  
**Acceptance Criteria:** Override works but logs warning

### Logging and Auditing

#### REQ-HOOK-019: Comprehensive Logging
**Priority:** High  
THE SYSTEM SHALL log all subagent invocations including:
- Trigger event
- Subagent name
- Execution status
- Duration
- Results  
**Rationale:** Provides audit trail and debugging information  
**Acceptance Criteria:** All executions are logged

#### REQ-HOOK-020: Log File Management
**Priority:** Medium  
THE SYSTEM SHALL write logs to ~/.claude/logs/subagent-hooks.log with:
- Restrictive permissions (600)
- Timestamp prefixes
- Structured format  
**Rationale:** Ensures secure and organized logging  
**Acceptance Criteria:** Logs are secure and well-formatted

### Security Requirements

#### REQ-HOOK-021: File Permission Validation
**Priority:** High  
WHEN accessing subagent files  
THE SYSTEM SHALL verify appropriate read permissions  
**Rationale:** Prevents unauthorized subagent execution  
**Acceptance Criteria:** Only readable files are executed

#### REQ-HOOK-022: Path Traversal Prevention
**Priority:** High  
WHEN resolving subagent paths  
THE SYSTEM SHALL validate paths to prevent directory traversal  
**Rationale:** Prevents malicious file access  
**Acceptance Criteria:** Path traversal attempts are blocked

#### REQ-HOOK-023: Secure Temporary Files
**Priority:** Medium  
WHEN creating temporary files  
THE SYSTEM SHALL use process-specific names and restrictive permissions  
**Rationale:** Prevents information leakage  
**Acceptance Criteria:** Temp files are secure and unique

### Performance Requirements

#### REQ-HOOK-024: Execution Performance
**Priority:** Medium  
THE SYSTEM SHALL complete subagent discovery and validation within 100ms  
**Rationale:** Minimizes impact on development workflow  
**Acceptance Criteria:** Discovery operations complete quickly

#### REQ-HOOK-025: Resource Cleanup
**Priority:** High  
THE SYSTEM SHALL clean up all temporary resources on exit  
**Rationale:** Prevents resource leaks  
**Acceptance Criteria:** No resources remain after execution

## Non-Functional Requirements

#### REQ-HOOK-026: Platform Compatibility
**Priority:** High  
THE SYSTEM SHALL operate on Linux, macOS, and WSL environments  
**Rationale:** Supports diverse development environments  
**Acceptance Criteria:** Works on all major platforms

#### REQ-HOOK-027: Backward Compatibility
**Priority:** Medium  
THE SYSTEM SHALL maintain compatibility with existing hook configurations  
**Rationale:** Protects existing installations  
**Acceptance Criteria:** Existing hooks continue to function

#### REQ-HOOK-028: Documentation
**Priority:** High  
THE SYSTEM SHALL provide comprehensive documentation including:
- Installation guide
- Configuration reference
- Troubleshooting guide
- Usage examples  
**Rationale:** Enables successful adoption  
**Acceptance Criteria:** Documentation is complete and accurate

## Test Requirements

#### REQ-HOOK-029: Unit Testing
**Priority:** High  
THE SYSTEM SHALL include unit tests for:
- Subagent discovery
- Validation logic
- Context gathering
- Event mapping  
**Rationale:** Ensures component reliability  
**Acceptance Criteria:** All unit tests pass

#### REQ-HOOK-030: Integration Testing
**Priority:** High  
THE SYSTEM SHALL include integration tests for:
- End-to-end event flows
- Multiple subagent execution
- Error handling scenarios  
**Rationale:** Validates system behavior  
**Acceptance Criteria:** Integration tests demonstrate full functionality

## Traceability Matrix

| Requirement | Implementation | Test | Status |
|-------------|---------------|------|--------|
| REQ-HOOK-001 | subagent-trigger.sh main() | test_subagent_discovery() | ✅ Implemented |
| REQ-HOOK-002 | settings.json matcher | Manual test | ✅ Implemented |
| REQ-HOOK-003 | Event type handling | test_event_mapping() | ✅ Implemented |
| REQ-HOOK-004 | find_subagent() | test_subagent_discovery() | ✅ Implemented |
| REQ-HOOK-005 | validate_subagent() | test_subagent_validation() | ✅ Implemented |
| REQ-HOOK-006 | Error handling | test_invalid_subagent_handling() | ✅ Implemented |
| REQ-HOOK-007 | get_subagents_for_event() | test_event_mapping() | ✅ Implemented |
| REQ-HOOK-008 | Priority config | Configuration only | ✅ Implemented |
| REQ-HOOK-009 | Blocking behavior | test_blocking_behavior() | ✅ Implemented |
| REQ-HOOK-010 | gather_context() | test_context_gathering() | ✅ Implemented |
| REQ-HOOK-011 | JSON context file | test_context_gathering() | ✅ Implemented |
| REQ-HOOK-012 | Cleanup trap | test_cleanup() | ✅ Implemented |
| REQ-HOOK-013 | Timeout in settings | Manual test | ✅ Implemented |
| REQ-HOOK-014 | Sequential execution | test_multiple_subagents() | ✅ Implemented |
| REQ-HOOK-015 | --event flag | test_multiple_subagents() | ✅ Implemented |
| REQ-HOOK-016 | log_error() | test_logging() | ✅ Implemented |
| REQ-HOOK-017 | Non-blocking handling | test_blocking_behavior() | ✅ Implemented |
| REQ-HOOK-018 | CLAUDE_SECURITY_OVERRIDE | Manual test | ✅ Implemented |
| REQ-HOOK-019 | Comprehensive logging | test_logging() | ✅ Implemented |
| REQ-HOOK-020 | Log file management | test_logging() | ✅ Implemented |
| REQ-HOOK-021 | Permission checks | validate_subagent() | ✅ Implemented |
| REQ-HOOK-022 | Path validation | Implicit in find_subagent() | ✅ Implemented |
| REQ-HOOK-023 | Secure temp files | Process-specific names | ✅ Implemented |
| REQ-HOOK-024 | Performance | Manual verification | ✅ Implemented |
| REQ-HOOK-025 | Resource cleanup | test_cleanup() | ✅ Implemented |
| REQ-HOOK-026 | Platform compatibility | Cross-platform bash | ✅ Implemented |
| REQ-HOOK-027 | Backward compatibility | Additive changes only | ✅ Implemented |
| REQ-HOOK-028 | Documentation | subagent-hook-integration.md | ✅ Implemented |
| REQ-HOOK-029 | Unit tests | test_subagent_hook_integration.sh | ✅ Implemented |
| REQ-HOOK-030 | Integration tests | Integration test suite | ✅ Implemented |

## RED-GREEN-REFACTOR Analysis

### What Should Have Been Done (TDD Approach)

#### 🔴 RED Phase (Should have been first)
1. Write this requirements specification
2. Create failing tests for each requirement
3. Run tests to confirm they fail

#### 🟢 GREEN Phase (Should have been second)
1. Implement minimal code to make tests pass
2. Focus on functionality, not optimization
3. Verify all tests pass

#### 🔵 REFACTOR Phase (Should have been third)
1. Clean up code structure
2. Extract common functions
3. Optimize performance
4. Ensure tests still pass

### What Actually Happened
We implemented the solution first, then created tests that passed immediately. This is the opposite of TDD and means:
- We didn't validate our requirements first
- Tests were written to match implementation rather than requirements
- We missed the opportunity to discover issues early
- The tests aren't truly testing our assumptions

### Lessons Learned
1. **Always start with requirements** - Use EARS format for clarity
2. **Write tests before code** - Tests should fail initially
3. **Requirements drive tests** - Each requirement should have corresponding tests
4. **Tests drive implementation** - Code should be written to make tests pass
5. **Documentation follows implementation** - Not the other way around

## Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-08-22 | Initial specification (post-implementation documentation) | Claude |

---

*Note: This specification was created after implementation as documentation. In proper TDD, this would have been created first, followed by failing tests, then implementation.*