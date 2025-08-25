# NPM Consolidation Requirements Specification

## Document Information
- **Version:** 1.0.0
- **Date:** 2025-08-24
- **Author:** Paul Duvall
- **Status:** Draft

## Glossary
- **NPM Package**: `@paulduvall/claude-dev-toolkit` - the single installation method
- **Repository Scripts**: Legacy scripts in main repo (setup.sh, deploy.sh, etc.)
- **Command Installation**: Process of copying command files to `~/.claude/commands/`
- **Template Application**: Applying configuration templates to `~/.claude/settings.json`

## Core Installation Requirements

### REQ-INST-001: Single Installation Method
**Priority:** High
**THE SYSTEM SHALL** provide npm package as the only installation method for Claude Code toolkit functionality

**Rationale:** Eliminate dual installation complexity and maintenance overhead
**Acceptance Criteria:**
- npm install command works on all platforms
- No repository scripts required for installation
- Global CLI commands available after npm install

### REQ-INST-002: Repository Script Migration
**Priority:** High
**WHEN** the npm package is enhanced with all repository script functionality
**THE SYSTEM SHALL** allow removal of legacy scripts without functionality loss

**Rationale:** Consolidate duplicate functionality into single codebase
**Acceptance Criteria:**
- All setup.sh functionality available via npm package
- All deploy.sh functionality available via npm package
- All configure-claude-code.sh functionality available via npm package

## Command Management Requirements

### REQ-CMD-001: Command Installation
**Priority:** High
**WHEN** user runs `claude-commands install --active`
**THE SYSTEM SHALL** copy active commands from npm package to `~/.claude/commands/`

**Rationale:** Provide command installation without repository dependencies
**Acceptance Criteria:**
- Commands copied successfully to user directory
- File permissions set correctly
- Installation completes within 30 seconds

### REQ-CMD-002: Command Set Selection
**Priority:** High
**WHEN** user specifies command set via CLI options
**THE SYSTEM SHALL** install only the requested command subset

**Options:**
- `--active`: Install production-ready commands only
- `--experiments`: Install experimental commands only  
- `--all`: Install both active and experimental commands

**Rationale:** Allow users to choose appropriate command set for their needs
**Acceptance Criteria:**
- Active commands installed when --active specified
- Experimental commands installed when --experiments specified
- All commands installed when --all specified

### REQ-CMD-003: Command Update
**Priority:** Medium
**WHEN** user runs installation command on existing installation
**THE SYSTEM SHALL** update commands to latest versions from npm package

**Rationale:** Provide easy update mechanism for installed commands
**Acceptance Criteria:**
- Existing commands overwritten with new versions
- New commands added if available
- Removed commands cleaned up from user directory

## Configuration Management Requirements

### REQ-CFG-001: Template Application
**Priority:** High
**WHEN** user runs `claude-commands configure --template <name>`
**THE SYSTEM SHALL** apply the specified template to `~/.claude/settings.json`

**Rationale:** Provide configuration without repository template dependencies
**Acceptance Criteria:**
- Template loaded from npm package resources
- Configuration file created or updated correctly
- Previous configuration backed up before changes

### REQ-CFG-002: Interactive Configuration
**Priority:** Medium
**WHEN** user runs `claude-commands configure --interactive`
**THE SYSTEM SHALL** guide user through configuration setup with prompts

**Rationale:** Provide user-friendly configuration experience
**Acceptance Criteria:**
- Clear prompts for each configuration option
- Input validation with helpful error messages
- Generated configuration saved correctly

### REQ-CFG-003: Configuration Validation
**Priority:** Medium
**WHEN** user runs `claude-commands configure --validate`
**THE SYSTEM SHALL** check current configuration for errors and compatibility

**Rationale:** Help users identify and fix configuration issues
**Acceptance Criteria:**
- All configuration keys validated against schema
- Clear error messages for invalid configurations
- Warnings for deprecated or problematic settings

## Setup and Verification Requirements

### REQ-SETUP-001: Complete Setup
**Priority:** High
**WHEN** user runs `claude-commands setup`
**THE SYSTEM SHALL** perform complete toolkit installation and configuration

**Rationale:** Replace setup.sh functionality with npm package command
**Acceptance Criteria:**
- Claude Code presence verified or installation prompted
- Directory structure created in `~/.claude/`
- Commands installed based on default or user preference
- Configuration applied from template or interactive setup
- Installation verified and status reported

### REQ-SETUP-002: Setup Options
**Priority:** Medium
**WHERE** user provides setup options
**THE SYSTEM SHALL** customize setup behavior accordingly

**Options:**
- `--type <template>`: Use specific configuration template
- `--skip-configure`: Skip configuration step
- `--dry-run`: Show what would be done without executing

**Rationale:** Provide flexible setup experience for different user needs
**Acceptance Criteria:**
- Template option applied correctly
- Skip flags honored
- Dry-run shows accurate preview without changes

### REQ-VERIFY-001: Installation Verification
**Priority:** Medium
**WHEN** user runs `claude-commands verify`
**THE SYSTEM SHALL** check installation completeness and correctness

**Rationale:** Replace verify-setup.sh functionality with npm package command
**Acceptance Criteria:**
- Claude Code installation detected and version reported
- Command installation status checked
- Configuration validity verified
- Missing components identified with fix suggestions

## Cross-Platform Requirements

### REQ-PLAT-001: Platform Support
**Priority:** High
**THE SYSTEM SHALL** work consistently on Windows, macOS, and Linux platforms

**Rationale:** Ensure NPM package works for all developers regardless of platform
**Acceptance Criteria:**
- File operations work correctly on all platforms
- Path handling uses platform-appropriate separators
- Permissions set correctly per platform conventions

### REQ-PLAT-002: Shell Integration
**Priority:** Medium
**WHEN** installation affects shell configuration
**THE SYSTEM SHALL** detect and update appropriate shell profile files

**Rationale:** Ensure commands are available in user's shell environment
**Acceptance Criteria:**
- Bash, zsh, fish, and PowerShell profiles supported
- Profile updates are optional and prompted
- Existing profile content preserved

## Error Handling Requirements

### REQ-ERR-001: Installation Failures
**Priority:** High
**IF** installation fails due to permissions or missing dependencies, THEN
**THE SYSTEM SHALL** provide clear error messages with resolution steps

**Rationale:** Help users resolve common installation issues
**Acceptance Criteria:**
- Permission errors identified with sudo/admin guidance
- Missing dependencies identified with installation instructions
- Partial installations cleaned up appropriately

### REQ-ERR-002: Configuration Errors
**Priority:** Medium
**IF** configuration file is invalid or corrupted, THEN
**THE SYSTEM SHALL** offer to reset to working defaults

**Rationale:** Provide recovery mechanism for configuration problems
**Acceptance Criteria:**
- Invalid JSON detected and reported
- Reset option offered with backup of current file
- New configuration applied successfully

## Performance Requirements

### REQ-PERF-001: Installation Speed
**Priority:** Medium
**THE SYSTEM SHALL** complete full setup within 60 seconds on standard hardware

**Rationale:** Provide responsive installation experience
**Acceptance Criteria:**
- Command installation completes within 30 seconds
- Configuration setup completes within 15 seconds
- Total setup time under 60 seconds

### REQ-PERF-002: Package Size
**Priority:** Low
**THE SYSTEM SHALL** maintain npm package size under 10MB

**Rationale:** Minimize download time and storage requirements
**Acceptance Criteria:**
- Package tarball under 10MB
- No unnecessary dependencies included
- Commands and templates optimized for size

## Migration Requirements

### REQ-MIG-001: Legacy Script Compatibility
**Priority:** High
**WHILE** repository scripts still exist
**THE SYSTEM SHALL** provide equivalent functionality via npm package

**Rationale:** Support users during transition period
**Acceptance Criteria:**
- All script functionality available via claude-commands CLI
- Command line options map to npm package equivalents
- Same end result achieved regardless of installation method

### REQ-MIG-002: User Migration Support
**Priority:** Medium
**WHEN** user migrates from repository scripts to npm package
**THE SYSTEM SHALL** preserve existing configuration and customizations

**Rationale:** Smooth transition without data loss
**Acceptance Criteria:**
- Existing ~/.claude/ directory detected and preserved
- Custom commands and hooks maintained
- Configuration migrated to new format if needed

## Testing Requirements

### REQ-TEST-001: Automated Testing
**Priority:** High
**THE SYSTEM SHALL** include comprehensive test suite covering all functionality

**Rationale:** Ensure reliability and prevent regressions
**Acceptance Criteria:**
- Unit tests for all core functions
- Integration tests for command workflows
- Cross-platform tests for all supported OS

### REQ-TEST-002: Manual Test Validation
**Priority:** Medium
**THE SYSTEM SHALL** provide manual testing guide for release validation

**Rationale:** Verify functionality works correctly in real user environments
**Acceptance Criteria:**
- Step-by-step manual test procedures documented
- Common user scenarios covered
- Platform-specific test cases included

---

## Change Log
- 2025-08-24: Initial version - Core consolidation requirements identified