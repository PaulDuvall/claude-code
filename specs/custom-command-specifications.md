# Claude Code Custom Command Specifications

## Overview
This document defines the specifications and guidelines that all Claude Code custom commands must adhere to for consistency, maintainability, and optimal user experience. These specifications incorporate official best practices from Anthropic's Claude Code documentation.

## Command Structure

### 1. Command Naming
- **Format**: Commands must use the `x` prefix followed by a descriptive name (e.g., `xtest`, `xdebug`, `xoptimize`)
- **Case**: Use lowercase letters only
- **Length**: Keep command names concise (typically 3-12 characters after the `x` prefix)
- **Clarity**: Names should clearly indicate the command's primary function

### 2. File Organization
Based on official Claude Code documentation, custom commands should follow these conventions:
- **Project-level commands**: Store in `.claude/commands/` directory (shown as "(project)" in help)
- **User-level commands**: Store in `~/.claude/commands/` directory (shown as "(user)" in help)
- **Filename**: Must match the command name exactly (e.g., `test.md` for the `/test` command)
- **Extension**: Always use `.md` extension
- **Namespacing**: Organize commands in subdirectories (e.g., `.claude/commands/frontend/component.md` creates `/frontend:component`)

### 3. Command Documentation Structure

Each command file should be a Markdown file that can include:

#### a. YAML Frontmatter (Optional)
```yaml
---
description: Brief description of the command
tags: [tag1, tag2]
---
```

#### b. Command Content
The main body should contain clear instructions for Claude Code. According to official documentation, you can include:
- **Bash Commands**: Prefix with `!` to execute (e.g., `!npm test`)
- **File References**: Use `@` to include file contents (e.g., `@src/config.js`)
- **Dynamic Arguments**: Use `$ARGUMENTS` to pass user-provided arguments to the command
- **Extended Thinking**: Include keywords like "think step by step" to trigger deeper analysis

#### c. Example Structure
```markdown
---
description: Run tests and analyze results
---

Analyze the test configuration in @package.json and run:
!npm test $ARGUMENTS

Think step by step about any test failures and suggest fixes.
```

## Command Behavior Guidelines

### 1. Scope and Responsibility
- **Single Purpose**: Each command should have one clear, well-defined purpose
- **Modularity**: Commands should be self-contained and not depend on other custom commands
- **Completeness**: Commands should handle the entire workflow for their designated task

### 2. Error Handling
- Commands must include instructions for handling common error scenarios
- Provide clear guidance on what Claude Code should do when encountering issues
- Include fallback strategies where appropriate

### 3. User Interaction
- **Clarity**: All user-facing messages should be clear and concise
- **Confirmation**: Include confirmation steps for destructive operations
- **Progress Updates**: For long-running operations, include instructions to provide status updates
- **Results**: Always include instructions to report results or completion status

### 4. Tool Usage
- Explicitly specify which Claude Code tools should be used (e.g., Task, Bash, Read, Edit)
- Include proper sequencing of tool operations
- Provide specific parameters or patterns for tool usage where applicable

### 5. Safety and Best Practices
- **Non-destructive by Default**: Commands should avoid modifying code unless explicitly intended
- **Validation**: Include validation steps before making changes
- **Rollback**: For commands that modify files, consider including rollback instructions
- **Security**: Never include instructions that could expose sensitive information

## Technical Requirements

### 1. Markdown Formatting
- Use proper markdown syntax
- Support YAML frontmatter for metadata
- Include code blocks with appropriate language identifiers
- Commands are pure Markdown files (.md extension)

### 2. Command Features (Official Claude Code Support)
- **Bash Execution**: Use `!` prefix to run bash commands
- **File Inclusion**: Use `@` prefix to include file contents
- **Dynamic Arguments**: Use `$ARGUMENTS` for user-provided parameters
- **MCP Integration**: Commands from Model Context Protocol servers follow `/mcp__<server>__<prompt>` pattern

### 3. Command Scope
- **Project Commands**: Located in `.claude/commands/` - shared with team
- **User Commands**: Located in `~/.claude/commands/` - personal across all projects
- **Namespacing**: Subdirectories create namespaced commands (e.g., `frontend:component`)

### 4. Dependencies
- Explicitly list any external tools or dependencies required
- Include instructions for checking if dependencies are available
- Provide fallback options when dependencies are missing

## Quality Standards

### 1. Clarity and Precision
- Instructions must be unambiguous
- Use specific, actionable language
- Avoid vague terms like "optimize" without defining what that means

### 2. Consistency
- Follow established patterns from existing commands
- Use consistent terminology across all commands
- Maintain consistent formatting and structure

### 3. Testability
- Commands should produce verifiable results
- Include success criteria in the instructions
- Design commands to be idempotent where possible

### 4. Performance
- Consider the efficiency of operations
- For potentially long-running tasks, include optimization strategies
- Batch operations where appropriate

## Examples of Well-Structured Commands

### Official Claude Code Command Example
```markdown
---
description: Analyze code for performance issues
---

Review the code in @src/main.js for performance bottlenecks.

!npm run benchmark $ARGUMENTS

Think step by step about optimization opportunities.
```

### Extended Example with Multiple Features
```markdown
---
description: Run comprehensive test suite with analysis
tags: [testing, quality]
---

First, check the test configuration:
@package.json

Run the test suite:
!npm test -- --coverage $ARGUMENTS

If any tests fail, analyze the error output and suggest fixes.
Provide a summary of:
- Total tests run
- Pass/fail counts
- Coverage percentages
- Suggested improvements
```

### Common Pitfalls to Avoid
- Vague instructions ("analyze the code" without specifics)
- Missing error handling scenarios
- Assuming specific project structures without verification
- Forgetting to report results to the user
- Including unnecessary file creation steps

## Maintenance and Updates

### Version Control
- Track all changes to custom commands in version control
- Include meaningful commit messages when updating commands
- Consider backward compatibility when modifying existing commands

### Documentation Updates
- Keep command documentation in sync with actual behavior
- Update examples when functionality changes
- Add notes about deprecated features or breaking changes

### Review Process
- Test commands thoroughly before deployment
- Consider edge cases and error scenarios
- Gather user feedback and iterate on command design

## Official Best Practices Summary

Based on Anthropic's Claude Code documentation:

### 1. Command Creation
- Keep commands focused and specific
- Use clear, concise descriptions
- Leverage bash commands (`!` prefix) and file references (`@` prefix) for context
- Consider using extended thinking keywords for complex analysis

### 2. Memory Integration
- Commands can reference project memories in `CLAUDE.md` files
- Use structured markdown for better organization
- Be specific with instructions

### 3. Command Discovery
- Built-in commands are always available
- Custom commands show their scope: "(project)" or "(user)"
- MCP commands are dynamically discovered from connected servers

### 4. Flexibility
- Support dynamic arguments with `$ARGUMENTS`
- Allow commands to work with piped input
- Design commands to be composable with other CLI features

## Conclusion

Following these specifications ensures that Claude Code custom commands provide a consistent, reliable, and efficient experience for users. Each command should be designed with clarity, safety, and effectiveness as primary goals, while leveraging the full capabilities of Claude Code's command system.