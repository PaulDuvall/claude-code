# Claude Code Subagent Format Requirements Specification

## Document Information
- **Version:** 1.0.0
- **Date:** 2025-08-19
- **Author:** Claude
- **Status:** Draft
- **Purpose:** Define the standard format and structure requirements for Claude Code subagents

## Glossary
- **Subagent**: A specialized Claude Code agent with a focused task-specific role and custom system prompt
- **YAML Frontmatter**: Metadata section at the beginning of a file enclosed by `---` delimiters
- **System Prompt**: Instructions that define the subagent's behavior, capabilities, and constraints
- **Tool Access**: The set of tools (Read, Write, Bash, etc.) available to a subagent
- **MCP**: Model Context Protocol for extended tool capabilities
- **Agent Registry**: The system that discovers and loads available subagents
- **Project-level Subagent**: Subagent defined in `.claude/agents/` within a project
- **User-level Subagent**: Subagent defined in `~/.claude/agents/` for user-wide access
- **Tool Inheritance**: Default behavior where subagents inherit all tools from the main thread

## Assumptions and Dependencies
- Claude Code is installed and configured
- File system supports UTF-8 encoded text files
- YAML parser is available for frontmatter processing
- Markdown parser is available for content processing
- User has appropriate file permissions for subagent directories
- Subagent files are trusted and not malicious

## Functional Requirements

### File Structure Requirements

#### REQ-SUB-001: File Format Specification
**Priority:** High  
WHEN a subagent file is created  
THE SYSTEM SHALL require the file to use Markdown format with `.md` extension and UTF-8 encoding  
**Rationale:** Ensures consistent file format for parsing and human readability  
**Acceptance Criteria:** All subagent files have `.md` extension and valid UTF-8 content

#### REQ-SUB-002: YAML Frontmatter Structure
**Priority:** High  
WHEN a subagent file is parsed  
THE SYSTEM SHALL require valid YAML frontmatter enclosed by `---` delimiters as the first content in the file  
**Rationale:** Provides structured metadata that can be reliably parsed  
**Acceptance Criteria:** YAML frontmatter is present, properly delimited, and syntactically valid

#### REQ-SUB-003: Required Frontmatter Fields
**Priority:** High  
WHEN YAML frontmatter is validated  
THE SYSTEM SHALL require the presence of `name` and `description` fields with non-empty string values  
**Rationale:** Essential metadata for subagent identification and discovery  
**Acceptance Criteria:** Both fields present with meaningful content

#### REQ-SUB-004: Subagent Name Format
**Priority:** High  
WHEN the `name` field is validated  
THE SYSTEM SHALL require lowercase letters, numbers, and hyphens only, starting with a letter, maximum 50 characters  
**Rationale:** Ensures consistent, URL-safe naming convention  
**Acceptance Criteria:** Name matches regex pattern `^[a-z][a-z0-9-]{0,49}$`

#### REQ-SUB-005: Description Field Requirements
**Priority:** High  
WHEN the `description` field is validated  
THE SYSTEM SHALL require a string between 10 and 200 characters describing the subagent's purpose  
**Rationale:** Provides meaningful context for users selecting subagents  
**Acceptance Criteria:** Description is informative and within character limits

### Tool Configuration Requirements

#### REQ-SUB-006: Tool Access Specification
**Priority:** Medium  
WHERE the `tools` field is present in frontmatter  
THE SYSTEM SHALL parse it as a comma-separated list of tool names to restrict subagent access  
**Rationale:** Allows security-conscious tool restriction for specialized subagents  
**Acceptance Criteria:** Tool list is parsed correctly and only specified tools are accessible

#### REQ-SUB-007: Tool Inheritance Default
**Priority:** Medium  
WHERE the `tools` field is absent from frontmatter  
THE SYSTEM SHALL grant the subagent access to all tools available in the main thread  
**Rationale:** Provides convenient default behavior for full-capability subagents  
**Acceptance Criteria:** Subagent inherits complete tool set when tools field is omitted

#### REQ-SUB-008: Valid Tool Names
**Priority:** High  
WHEN tool names are specified  
THE SYSTEM SHALL validate each tool name against the allowed set: Read, Write, Edit, Bash, Grep, Glob, LS, WebFetch, WebSearch, TodoWrite, NotebookEdit, BashOutput, KillBash, and MCP server tools  
**Rationale:** Prevents invalid tool configurations and runtime errors  
**Acceptance Criteria:** Only valid tool names are accepted; invalid names cause validation failure

#### REQ-SUB-009: MCP Tool Integration
**Priority:** Low  
WHERE MCP server tools are configured  
THE SYSTEM SHALL allow referencing MCP tools using the format `mcp__<server>__<tool>`  
**Rationale:** Enables extended capabilities through Model Context Protocol  
**Acceptance Criteria:** MCP tool references are correctly parsed and validated

### System Prompt Requirements

#### REQ-SUB-010: System Prompt Presence
**Priority:** High  
WHEN a subagent file is validated  
THE SYSTEM SHALL require Markdown content after the frontmatter to serve as the system prompt  
**Rationale:** System prompt defines the subagent's behavior and capabilities  
**Acceptance Criteria:** Non-empty Markdown content exists after frontmatter

#### REQ-SUB-011: System Prompt Structure
**Priority:** Medium  
WHEN the system prompt is validated  
THE SYSTEM SHALL require sections defining: role, capabilities, methodology, communication style, and constraints  
**Rationale:** Ensures comprehensive and well-structured agent instructions  
**Acceptance Criteria:** All required sections are present and contain relevant content

#### REQ-SUB-012: System Prompt Length
**Priority:** Medium  
WHEN the system prompt is validated  
THE SYSTEM SHALL require the content to be between 100 and 10,000 characters  
**Rationale:** Ensures meaningful instructions without excessive token usage  
**Acceptance Criteria:** System prompt length is within specified bounds

#### REQ-SUB-013: Prompt Markdown Formatting
**Priority:** Low  
WHEN the system prompt is processed  
THE SYSTEM SHALL support standard Markdown formatting including headers, lists, code blocks, and emphasis  
**Rationale:** Enables clear, structured, and readable agent instructions  
**Acceptance Criteria:** Markdown elements are correctly parsed and preserved

### File Location Requirements

#### REQ-SUB-014: Project-Level Storage
**Priority:** High  
WHERE project-specific subagents are defined  
THE SYSTEM SHALL store them in the `.claude/agents/` directory within the project root  
**Rationale:** Enables project-specific agent configurations  
**Acceptance Criteria:** Files in project `.claude/agents/` are discovered and loaded

#### REQ-SUB-015: User-Level Storage
**Priority:** High  
WHERE user-wide subagents are defined  
THE SYSTEM SHALL store them in the `~/.claude/agents/` directory  
**Rationale:** Allows personal subagent library across projects  
**Acceptance Criteria:** Files in user home `~/.claude/agents/` are discovered and loaded

#### REQ-SUB-016: Precedence Rules
**Priority:** High  
WHEN duplicate subagent names exist  
THE SYSTEM SHALL prioritize project-level subagents over user-level subagents  
**Rationale:** Allows project-specific overrides of general subagents  
**Acceptance Criteria:** Project subagents override user subagents with same name

#### REQ-SUB-017: Directory Creation
**Priority:** Medium  
WHEN subagents are installed  
THE SYSTEM SHALL create the required directories if they do not exist with appropriate permissions (755)  
**Rationale:** Simplifies installation process and ensures proper structure  
**Acceptance Criteria:** Directories are created with correct permissions

### Validation Requirements

#### REQ-SUB-018: Syntax Validation
**Priority:** High  
WHEN a subagent file is loaded  
THE SYSTEM SHALL validate YAML syntax, required fields, and Markdown structure before activation  
**Rationale:** Prevents runtime errors from malformed subagent definitions  
**Acceptance Criteria:** Invalid files are rejected with specific error messages

#### REQ-SUB-019: Unique Name Enforcement
**Priority:** High  
WHEN subagents are registered  
THE SYSTEM SHALL ensure each subagent name is unique within its scope (project or user level)  
**Rationale:** Prevents naming conflicts and ambiguous references  
**Acceptance Criteria:** Duplicate names are detected and reported as errors

#### REQ-SUB-020: Content Security Validation
**Priority:** High  
WHEN subagent content is processed  
THE SYSTEM SHALL validate that the content does not contain malicious patterns or security risks  
**Rationale:** Protects against injection attacks and malicious instructions  
**Acceptance Criteria:** Suspicious patterns are detected and subagent loading is blocked

### Metadata Requirements

#### REQ-SUB-021: Optional Metadata Fields
**Priority:** Low  
WHERE additional metadata is needed  
THE SYSTEM SHALL support optional frontmatter fields: `version`, `author`, `tags`, `created`, `modified`  
**Rationale:** Enables richer metadata for subagent management  
**Acceptance Criteria:** Optional fields are parsed when present but not required

#### REQ-SUB-022: Version Field Format
**Priority:** Low  
WHERE the `version` field is present  
THE SYSTEM SHALL validate it follows semantic versioning format (MAJOR.MINOR.PATCH)  
**Rationale:** Enables version tracking and compatibility management  
**Acceptance Criteria:** Version strings match semver pattern or validation fails

#### REQ-SUB-023: Tags Field Format
**Priority:** Low  
WHERE the `tags` field is present  
THE SYSTEM SHALL parse it as an array of strings for categorization  
**Rationale:** Enables subagent discovery and filtering by category  
**Acceptance Criteria:** Tags are parsed as string array and stored for search

### Discovery and Loading Requirements

#### REQ-SUB-024: Subagent Discovery
**Priority:** High  
WHEN Claude Code starts or refreshes  
THE SYSTEM SHALL scan both user and project agent directories for valid `.md` files  
**Rationale:** Automatically discovers available subagents  
**Acceptance Criteria:** All valid subagent files are discovered and registered

#### REQ-SUB-025: Lazy Loading
**Priority:** Medium  
WHEN a subagent is referenced but not yet loaded  
THE SYSTEM SHALL load and validate the subagent file on-demand  
**Rationale:** Optimizes startup time and memory usage  
**Acceptance Criteria:** Subagents are loaded only when needed

#### REQ-SUB-026: Hot Reload Support
**Priority:** Low  
WHILE Claude Code is running  
WHEN a subagent file is modified  
THE SYSTEM SHALL detect changes and reload the subagent definition  
**Rationale:** Enables iterative subagent development without restart  
**Acceptance Criteria:** File changes trigger automatic reload

### Error Handling Requirements

#### REQ-SUB-027: Validation Error Messages
**Priority:** High  
IF subagent validation fails, THEN  
THE SYSTEM SHALL provide specific error messages indicating the validation failure reason and location  
**Rationale:** Enables quick problem resolution for subagent authors  
**Acceptance Criteria:** Error messages identify specific issues and line numbers

#### REQ-SUB-028: Graceful Failure Handling
**Priority:** High  
IF a subagent fails to load, THEN  
THE SYSTEM SHALL log the error and continue operation without the failed subagent  
**Rationale:** Prevents single subagent issues from breaking the entire system  
**Acceptance Criteria:** System remains operational despite individual subagent failures

#### REQ-SUB-029: Fallback Behavior
**Priority:** Medium  
IF a requested subagent is unavailable, THEN  
THE SYSTEM SHALL notify the user and offer to use the main Claude Code agent instead  
**Rationale:** Provides continuity of service when specific subagents fail  
**Acceptance Criteria:** Users receive clear notification and alternative option

### Documentation Requirements

#### REQ-SUB-030: Inline Documentation
**Priority:** Medium  
WHEN a subagent file includes comments  
THE SYSTEM SHALL support YAML comments in frontmatter and Markdown comments in the prompt section  
**Rationale:** Enables self-documenting subagent definitions  
**Acceptance Criteria:** Comments are preserved but excluded from active configuration

#### REQ-SUB-031: Usage Examples
**Priority:** Low  
WHERE the subagent includes a `## Usage Examples` section  
THE SYSTEM SHALL parse and display these examples in subagent help information  
**Rationale:** Provides guidance for effective subagent utilization  
**Acceptance Criteria:** Usage examples are extracted and made available to users

## Performance Requirements

#### REQ-SUB-032: Load Time Performance
**Priority:** Medium  
WHEN a subagent file is loaded  
THE SYSTEM SHALL complete parsing and validation within 100 milliseconds  
**Rationale:** Ensures responsive subagent activation  
**Acceptance Criteria:** Load time is measured and stays within threshold

#### REQ-SUB-033: Memory Efficiency
**Priority:** Medium  
WHILE subagents are loaded in memory  
THE SYSTEM SHALL limit each subagent's memory footprint to 1MB maximum  
**Rationale:** Prevents memory exhaustion with many subagents  
**Acceptance Criteria:** Memory usage per subagent is monitored and constrained

## Security Requirements

#### REQ-SUB-034: File Permission Validation
**Priority:** High  
WHEN subagent files are accessed  
THE SYSTEM SHALL verify read permissions and reject world-writable files  
**Rationale:** Prevents unauthorized modification of subagent definitions  
**Acceptance Criteria:** Only properly secured files are loaded

#### REQ-SUB-035: Path Traversal Prevention
**Priority:** High  
WHEN file paths are processed  
THE SYSTEM SHALL validate paths to prevent directory traversal attacks  
**Rationale:** Protects against malicious file access attempts  
**Acceptance Criteria:** Path validation blocks traversal patterns

#### REQ-SUB-036: Content Sanitization
**Priority:** High  
WHEN system prompts are processed  
THE SYSTEM SHALL sanitize content to prevent prompt injection attacks  
**Rationale:** Maintains security of the AI system  
**Acceptance Criteria:** Malicious prompt patterns are detected and neutralized

## Interface Requirements

#### REQ-SUB-037: Command Line Interface
**Priority:** Medium  
WHEN users interact with subagents via CLI  
THE SYSTEM SHALL provide commands to list, validate, and test subagent files  
**Rationale:** Enables subagent management from command line  
**Acceptance Criteria:** CLI commands work correctly for subagent operations

#### REQ-SUB-038: Error Reporting Interface
**Priority:** Medium  
WHEN validation errors occur  
THE SYSTEM SHALL output errors in a structured format suitable for both human and machine parsing  
**Rationale:** Supports both manual debugging and automated validation  
**Acceptance Criteria:** Errors follow consistent JSON or YAML structure

## Non-Functional Requirements

#### REQ-SUB-039: Backward Compatibility
**Priority:** High  
WHEN the subagent format is updated  
THE SYSTEM SHALL maintain compatibility with previous format versions through migration or dual support  
**Rationale:** Protects existing subagent investments  
**Acceptance Criteria:** Older format subagents continue to function

#### REQ-SUB-040: Platform Independence
**Priority:** High  
WHEN subagent files are created  
THE SYSTEM SHALL ensure format compatibility across Windows, macOS, and Linux platforms  
**Rationale:** Enables cross-platform subagent sharing  
**Acceptance Criteria:** Subagents work identically on all platforms

## Example Compliant Subagent File

```markdown
---
name: code-reviewer
description: Expert code review specialist focusing on best practices, security, and performance
version: 1.0.0
author: Development Team
tags: [code-quality, review, security]
tools: Read, Grep, Glob, Bash
created: 2025-01-15
modified: 2025-01-20
---

# Code Review Specialist Sub-Agent

## Role
You are a Code Review Specialist, an expert in analyzing code for quality, security, and maintainability issues across multiple programming languages.

## Capabilities
- **Code Quality Analysis**: Identify code smells, anti-patterns, and improvement opportunities
- **Security Review**: Detect potential vulnerabilities and security best practices violations
- **Performance Analysis**: Spot performance bottlenecks and optimization opportunities
- **Style Consistency**: Ensure adherence to coding standards and conventions
- **Documentation Review**: Verify adequate comments and documentation
- **Test Coverage**: Assess test completeness and quality

## Methodology
1. **Initial Assessment**: Understand code purpose and architecture
2. **Systematic Review**: Examine code section by section
3. **Issue Identification**: Flag problems with severity levels
4. **Solution Proposal**: Suggest specific improvements
5. **Knowledge Sharing**: Explain the reasoning behind recommendations

## Communication Style
- Provide constructive, specific feedback
- Prioritize issues by severity and impact
- Include code examples for suggested improvements
- Balance criticism with recognition of good practices
- Maintain a respectful, educational tone

## Constraints
- Focus on objective, measurable improvements
- Avoid personal preferences without technical justification
- Consider the project's existing patterns and constraints
- Respect performance and compatibility requirements

## Usage Examples

**Example 1: Security-focused review**
User: Review this authentication module for security issues
Response: Analyze authentication flow, identify vulnerabilities, suggest hardening measures

**Example 2: Performance optimization**
User: Check this data processing pipeline for performance issues
Response: Profile code paths, identify bottlenecks, recommend optimizations
```

## Traceability Matrix

| Requirement | Business Objective | Test Case | Priority |
|-------------|-------------------|-----------|----------|
| REQ-SUB-001 | Consistent file format | TC-SUB-001: File extension validation | High |
| REQ-SUB-002 | Structured metadata | TC-SUB-002: YAML frontmatter parsing | High |
| REQ-SUB-003 | Required metadata | TC-SUB-003: Required field validation | High |
| REQ-SUB-004 | Name standardization | TC-SUB-004: Name format validation | High |
| REQ-SUB-005 | Meaningful descriptions | TC-SUB-005: Description validation | High |
| REQ-SUB-006 | Tool restriction | TC-SUB-006: Tool list parsing | Medium |
| REQ-SUB-007 | Tool inheritance | TC-SUB-007: Default tool access | Medium |
| REQ-SUB-008 | Valid tool names | TC-SUB-008: Tool name validation | High |
| REQ-SUB-009 | MCP integration | TC-SUB-009: MCP tool references | Low |
| REQ-SUB-010 | System prompt required | TC-SUB-010: Prompt presence check | High |
| REQ-SUB-011 | Structured prompts | TC-SUB-011: Prompt section validation | Medium |
| REQ-SUB-012 | Prompt length limits | TC-SUB-012: Character count validation | Medium |
| REQ-SUB-013 | Markdown support | TC-SUB-013: Markdown parsing | Low |
| REQ-SUB-014 | Project storage | TC-SUB-014: Project directory scan | High |
| REQ-SUB-015 | User storage | TC-SUB-015: User directory scan | High |
| REQ-SUB-016 | Precedence rules | TC-SUB-016: Override behavior | High |
| REQ-SUB-017 | Directory creation | TC-SUB-017: Auto-creation test | Medium |
| REQ-SUB-018 | Syntax validation | TC-SUB-018: Comprehensive validation | High |
| REQ-SUB-019 | Unique names | TC-SUB-019: Duplicate detection | High |
| REQ-SUB-020 | Security validation | TC-SUB-020: Malicious pattern detection | High |
| REQ-SUB-027 | Error messages | TC-SUB-027: Error message quality | High |
| REQ-SUB-028 | Graceful failure | TC-SUB-028: Failure recovery | High |
| REQ-SUB-034 | File permissions | TC-SUB-034: Permission checks | High |
| REQ-SUB-035 | Path traversal | TC-SUB-035: Path validation | High |
| REQ-SUB-036 | Content sanitization | TC-SUB-036: Injection prevention | High |
| REQ-SUB-039 | Backward compatibility | TC-SUB-039: Version migration | High |
| REQ-SUB-040 | Platform independence | TC-SUB-040: Cross-platform test | High |

## User Acceptance Testing Scenarios

### Scenario 1: Creating a New Subagent
**Given:** A developer wanting to create a custom debugging subagent  
**When:** They create a new file following the format specification  
**Then:**
- The file validates successfully
- The subagent appears in the available agents list
- The subagent can be invoked with specified tools
- The system prompt guides the agent's behavior correctly

### Scenario 2: Tool Restriction
**Given:** A subagent that should only read files, not modify them  
**When:** The subagent is configured with `tools: Read, Grep, Glob`  
**Then:**
- The subagent can read and search files
- Write, Edit, and Bash tools are not accessible
- Attempts to use restricted tools fail gracefully

### Scenario 3: Project Override
**Given:** A user-level subagent and project-level subagent with the same name  
**When:** The subagent is invoked within the project  
**Then:**
- The project-level version is used
- The user-level version is shadowed but not deleted
- Outside the project, the user-level version is available

### Scenario 4: Invalid Format Handling
**Given:** A subagent file with invalid YAML or missing required fields  
**When:** The system attempts to load the subagent  
**Then:**
- A clear error message identifies the specific problem
- The error includes the file path and line number
- The system continues operating without the invalid subagent
- Guidance for fixing the issue is provided

## Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-08-19 | Initial specification following EARS format | Claude |

---

*This requirements specification follows the EARS (Easy Approach to Requirements Syntax) format to ensure clarity, testability, and unambiguous subagent format definition.*