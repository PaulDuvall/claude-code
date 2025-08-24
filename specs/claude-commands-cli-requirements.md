# Claude Commands CLI Requirements Specification

## Document Information
- **Version:** 1.0.0
- **Date:** 2025-08-24
- **Author:** Paul Duvall
- **Status:** Draft

## Glossary
- **CLI**: Command Line Interface accessible globally as `claude-commands`
- **Active Commands**: Production-ready commands in commands/active/
- **Experimental Commands**: Beta commands in commands/experiments/
- **Configuration Template**: Predefined settings.json configurations

## Core CLI Requirements

### REQ-CLI-001: Global Command Availability
**Priority:** Critical
**WHEN** npm package is installed globally
**THE SYSTEM SHALL** provide `claude-commands` command accessible from any directory

**Rationale:** Replace repository-specific scripts with global tool
**Acceptance Criteria:**
- `claude-commands` executable available in system PATH
- Command works from any working directory
- No dependency on repository being present

### REQ-CLI-002: Command Help System
**Priority:** High
**WHEN** user runs `claude-commands --help` or `claude-commands <subcommand> --help`
**THE SYSTEM SHALL** display comprehensive usage information

**Rationale:** Provide self-documenting interface
**Acceptance Criteria:**
- Main help shows all available subcommands
- Subcommand help shows options and examples
- Examples demonstrate common usage patterns

## Setup Command Requirements

### REQ-CLI-SETUP-001: Basic Setup
**Priority:** Critical
**WHEN** user runs `claude-commands setup`
**THE SYSTEM SHALL** perform complete toolkit installation equivalent to ./setup.sh

**Rationale:** Replace setup.sh with npm package functionality
**Acceptance Criteria:**
- Creates ~/.claude/ directory structure
- Installs active commands by default
- Applies basic configuration template
- Verifies Claude Code availability

### REQ-CLI-SETUP-002: Setup with Options
**Priority:** High
**WHEN** user runs setup with options
**THE SYSTEM SHALL** customize installation behavior accordingly

**Command Format:**
```bash
claude-commands setup [options]
```

**Options:**
- `--type <basic|comprehensive|security>`: Configuration template to apply
- `--commands <active|experiments|all>`: Command set to install
- `--skip-configure`: Skip configuration step
- `--skip-hooks`: Skip hooks installation
- `--force`: Overwrite existing installation
- `--dry-run`: Preview actions without executing

**Rationale:** Provide flexible setup matching setup.sh options
**Acceptance Criteria:**
- Each option modifies behavior as specified
- Options can be combined appropriately
- Invalid option combinations are rejected with helpful error

## Install Command Requirements

### REQ-CLI-INSTALL-001: Command Installation
**Priority:** Critical
**WHEN** user runs `claude-commands install [options]`
**THE SYSTEM SHALL** install specified command set equivalent to ./deploy.sh

**Command Format:**
```bash
claude-commands install [options]
```

**Options:**
- `--active`: Install production-ready commands (default)
- `--experiments`: Install experimental commands only
- `--all`: Install both active and experimental commands
- `--include <pattern>`: Include specific commands matching pattern
- `--exclude <pattern>`: Exclude commands matching pattern
- `--dry-run`: Show what would be installed without executing
- `--backup`: Create backup before installation

**Rationale:** Replace deploy.sh functionality with enhanced options
**Acceptance Criteria:**
- Commands copied from npm package to ~/.claude/commands/
- File permissions set correctly (readable/executable)
- Previous installation backed up if --backup specified
- Installation completed within 30 seconds

### REQ-CLI-INSTALL-002: Update Existing Installation
**Priority:** High
**WHEN** commands already exist in ~/.claude/commands/
**THE SYSTEM SHALL** update to latest versions from npm package

**Rationale:** Provide update mechanism for installed commands
**Acceptance Criteria:**
- Existing commands overwritten with new versions
- New commands added if available in selected set
- Obsolete commands removed if no longer in set
- Update operation logged for troubleshooting

## Configure Command Requirements

### REQ-CLI-CONFIG-001: Template Configuration
**Priority:** High
**WHEN** user runs `claude-commands configure --template <name>`
**THE SYSTEM SHALL** apply specified configuration template

**Command Format:**
```bash
claude-commands configure [options]
```

**Options:**
- `--template <name>`: Apply named template (basic, comprehensive, security-focused)
- `--interactive`: Launch interactive configuration wizard
- `--validate`: Validate current configuration
- `--reset`: Reset to default configuration
- `--backup`: Create backup before changes

**Rationale:** Replace configure-claude-code.sh with template support
**Acceptance Criteria:**
- Template loaded from npm package templates directory
- Settings.json created or updated correctly
- Previous configuration backed up automatically
- Invalid template names rejected with available options

### REQ-CLI-CONFIG-002: Interactive Configuration
**Priority:** Medium
**WHEN** user runs `claude-commands configure --interactive`
**THE SYSTEM SHALL** guide user through configuration with prompts

**Rationale:** Provide user-friendly alternative to manual config editing
**Acceptance Criteria:**
- Clear prompts for each major configuration section
- Current values displayed as defaults
- Input validation with retry for invalid entries
- Final configuration preview before saving

### REQ-CLI-CONFIG-003: Configuration Validation
**Priority:** Medium
**WHEN** user runs `claude-commands configure --validate`
**THE SYSTEM SHALL** check current configuration for errors

**Rationale:** Help users identify and fix configuration problems
**Acceptance Criteria:**
- JSON syntax validation
- Required fields presence check
- Value format validation (emails, paths, etc.)
- Clear error messages with line numbers if applicable
- Suggestions for common fixes

## Verify Command Requirements

### REQ-CLI-VERIFY-001: Installation Verification
**Priority:** High
**WHEN** user runs `claude-commands verify`
**THE SYSTEM SHALL** check installation status equivalent to ./verify-setup.sh

**Command Format:**
```bash
claude-commands verify [options]
```

**Options:**
- `--verbose`: Show detailed verification information
- `--fix`: Attempt to fix detected issues automatically

**Rationale:** Replace verify-setup.sh with enhanced verification
**Acceptance Criteria:**
- Claude Code installation detected and version reported
- Command installation status checked (count, versions)
- Configuration validity verified
- Missing or corrupted components identified
- Fix suggestions provided for each issue

### REQ-CLI-VERIFY-002: Health Check Report
**Priority:** Medium
**WHEN** verification completes
**THE SYSTEM SHALL** generate comprehensive health check report

**Rationale:** Provide diagnostic information for troubleshooting
**Acceptance Criteria:**
- System information (OS, Node.js version, npm version)
- Claude Code version and installation path
- Installed command count and versions
- Configuration status and key settings
- Hook installation status
- Overall health score (green/yellow/red)

## List Command Requirements

### REQ-CLI-LIST-001: Available Commands
**Priority:** Medium
**WHEN** user runs `claude-commands list`
**THE SYSTEM SHALL** show available commands from npm package

**Command Format:**
```bash
claude-commands list [options]
```

**Options:**
- `--installed`: Show only installed commands
- `--available`: Show all available commands (default)
- `--active`: Filter to active commands only
- `--experiments`: Filter to experimental commands only
- `--format <table|json>`: Output format

**Rationale:** Provide visibility into available and installed commands
**Acceptance Criteria:**
- Commands listed with name, category, and description
- Installation status indicated for each command
- Output formatted appropriately for specified format
- Command count summary provided

## Backup and Restore Requirements

### REQ-CLI-BACKUP-001: Configuration Backup
**Priority:** Medium
**WHEN** user runs `claude-commands backup [name]`
**THE SYSTEM SHALL** create named backup of current configuration

**Rationale:** Provide configuration backup and restore capability
**Acceptance Criteria:**
- Entire ~/.claude/ directory backed up
- Backup stored with timestamp and optional name
- Backup location reported to user
- Backup compression used to save space

### REQ-CLI-BACKUP-002: Configuration Restore
**Priority:** Medium
**WHEN** user runs `claude-commands restore <name>`
**THE SYSTEM SHALL** restore configuration from specified backup

**Rationale:** Enable recovery from backup
**Acceptance Criteria:**
- Available backups listed if no name specified
- Specified backup restored to ~/.claude/
- Current configuration backed up before restore
- Restore operation can be undone

## Update Command Requirements

### REQ-CLI-UPDATE-001: Package Update Check
**Priority:** Low
**WHEN** user runs `claude-commands update`
**THE SYSTEM SHALL** check for npm package updates and guide user through update

**Rationale:** Help users keep toolkit current
**Acceptance Criteria:**
- Current version compared against npm registry
- Update available notification with version details
- Instructions provided for npm update process
- Breaking changes highlighted if applicable

## Error Handling Requirements

### REQ-CLI-ERR-001: Command Validation
**Priority:** High
**IF** user provides invalid command or options, THEN
**THE SYSTEM SHALL** display helpful error message with usage guidance

**Rationale:** Guide users to correct usage
**Acceptance Criteria:**
- Invalid commands show available commands
- Invalid options show valid options for command
- Typos detected with suggestions (did you mean?)
- Help command suggested for complex cases

### REQ-CLI-ERR-002: Execution Errors
**Priority:** High
**IF** command execution fails due to system issues, THEN
**THE SYSTEM SHALL** provide clear error message with resolution steps

**Rationale:** Help users resolve common issues
**Acceptance Criteria:**
- Permission errors identified with resolution steps
- Missing dependencies identified with install instructions
- Network errors handled gracefully with retry suggestions
- Partial operations cleaned up appropriately

### REQ-CLI-ERR-003: Graceful Degradation
**Priority:** Medium
**IF** Claude Code is not installed, THEN
**THE SYSTEM SHALL** continue to provide toolkit functionality where possible

**Rationale:** Allow toolkit use for development even without Claude Code
**Acceptance Criteria:**
- Command installation works without Claude Code
- Configuration management works independently
- Warnings shown for features requiring Claude Code
- Installation guidance provided for Claude Code

## Cross-Platform Requirements

### REQ-CLI-PLAT-001: Path Handling
**Priority:** High
**THE SYSTEM SHALL** handle file paths correctly on Windows, macOS, and Linux

**Rationale:** Ensure consistent behavior across platforms
**Acceptance Criteria:**
- Home directory detection works on all platforms
- Path separators appropriate for platform
- File permissions set correctly per platform
- Long path support on Windows

### REQ-CLI-PLAT-002: Shell Integration
**Priority:** Medium
**WHEN** npm package installation affects shell configuration
**THE SYSTEM SHALL** provide platform-appropriate guidance

**Rationale:** Help users complete installation on their platform
**Acceptance Criteria:**
- Shell profile detection (bash, zsh, fish, PowerShell)
- Platform-specific PATH modification guidance
- Optional automatic profile updates with user consent

---

## Change Log
- 2025-08-24: Initial version - Core CLI requirements for consolidation