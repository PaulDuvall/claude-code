# Claude Code Custom Commands - Specifications

## Overview
This document defines executable specifications for Claude Code custom commands following specification-driven development principles.

## Command Structure Specifications

### Command File Format {#cmd_format authority=system}
Custom command files MUST:
- Use `.md` extension [^cmd1a]
- Include valid YAML frontmatter with description and tags [^cmd1b]
- Follow `x{name}` naming convention [^cmd1c]

[^cmd1a]: specs/tests/test_command_validation.py::test_command_files_have_md_extension
[^cmd1b]: specs/tests/test_command_validation.py::test_yaml_frontmatter_valid
[^cmd1c]: specs/tests/test_command_validation.py::test_command_naming_convention

### YAML Frontmatter {#yaml_frontmatter authority=system}
Command frontmatter MUST:
- Include `description` field with meaningful text [^yaml1a]
- Include `tags` field as array of valid tags [^yaml1b]
- Use valid YAML syntax [^yaml1c]

[^yaml1a]: specs/tests/test_command_validation.py::test_description_meaningful
[^yaml1b]: specs/tests/test_command_validation.py::test_tags_valid_array
[^yaml1c]: specs/tests/test_command_validation.py::test_yaml_syntax_valid

### Command Content {#cmd_content authority=platform}
Command content SHOULD:
- Include executable bash commands with `!` prefix [^content1a]
- Use `$ARGUMENTS` for dynamic user input [^content1b]
- Focus on defensive security practices only [^content1c]

[^content1a]: specs/tests/test_command_validation.py::test_executable_commands_present
[^content1b]: specs/tests/test_command_validation.py::test_arguments_usage
[^content1c]: specs/tests/test_command_validation.py::test_defensive_security_focus

## Command Behavior Specifications

### Git Workflow Commands {#git_workflow authority=platform}
Git automation commands MUST:
- Verify git repository status before operations [^git1a]
- Generate conventional commit messages [^git1b]
- Handle push failures gracefully [^git1c]

[^git1a]: specs/tests/test_git_commands.py::test_git_status_verification
[^git1b]: specs/tests/test_git_commands.py::test_conventional_commit_messages
[^git1c]: specs/tests/test_git_commands.py::test_push_failure_handling

### Quality Check Commands {#quality_checks authority=platform}
Quality analysis commands MUST:
- Detect available tools before execution [^quality1a]
- Provide fallback when tools are missing [^quality1b]
- Generate structured reports [^quality1c]

[^quality1a]: specs/tests/test_quality_commands.py::test_tool_detection
[^quality1b]: specs/tests/test_quality_commands.py::test_missing_tool_fallback
[^quality1c]: specs/tests/test_quality_commands.py::test_structured_reports

### Security Commands {#security_commands authority=system}
Security analysis commands MUST:
- Focus exclusively on defensive security [^security1a]
- Scan for common vulnerabilities [^security1b]
- Never include offensive security patterns [^security1c]

[^security1a]: specs/tests/test_security_commands.py::test_defensive_security_only
[^security1b]: specs/tests/test_security_commands.py::test_vulnerability_scanning
[^security1c]: specs/tests/test_security_commands.py::test_no_offensive_patterns

## Implementation Requirements

### Command Validation {#cmd_validation authority=developer}
The validation system MUST:
- Check all command files for specification compliance [^validation1a]
- Report clear error messages for violations [^validation1b]
- Support automated validation in CI/CD [^validation1c]

[^validation1a]: specs/tests/test_validation_system.py::test_all_commands_validated
[^validation1b]: specs/tests/test_validation_system.py::test_clear_error_messages
[^validation1c]: specs/tests/test_validation_system.py::test_cicd_integration

### User Experience {#user_experience authority=platform}
Commands MUST:
- Be simple enough for average users [^ux1a]
- Provide clear usage instructions [^ux1b]
- Work without extensive configuration [^ux1c]

[^ux1a]: specs/tests/test_user_experience.py::test_simple_user_interface
[^ux1b]: specs/tests/test_user_experience.py::test_clear_usage_instructions
[^ux1c]: specs/tests/test_user_experience.py::test_zero_configuration

## Test Coverage Requirements

### Specification Coverage {#spec_coverage authority=system}
Every specification MUST:
- Have at least one corresponding test [^coverage1a]
- Include traceability reference in test docstring [^coverage1b]
- Be executable and verifiable [^coverage1c]

[^coverage1a]: specs/tests/test_coverage.py::test_all_specs_have_tests
[^coverage1b]: specs/tests/test_coverage.py::test_traceability_references
[^coverage1c]: specs/tests/test_coverage.py::test_executable_specifications