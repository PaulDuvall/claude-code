# Repository Cleanup Requirements Specification

## Document Information
- **Version:** 1.0.0
- **Date:** 2025-08-24
- **Author:** Paul Duvall
- **Status:** Draft

## Glossary
- **Repository Scripts**: Legacy installation scripts (setup.sh, deploy.sh, etc.)
- **Symlinks**: File system links pointing between duplicate codebases
- **lib/ Directory**: Shared shell utilities used by repository scripts
- **NPM Package**: Self-contained `claude-dev-toolkit/` directory

## Repository Script Removal Requirements

### REQ-CLEANUP-001: Legacy Script Removal
**Priority:** Critical
**WHEN** npm package functionality is complete and tested
**THE SYSTEM SHALL** allow safe removal of repository installation scripts

**Scripts to Remove:**
- setup.sh
- deploy.sh
- configure-claude-code.sh
- verify-setup.sh
- validate-commands.sh

**Rationale:** Eliminate duplicate functionality and maintenance overhead
**Acceptance Criteria:**
- All script functionality available via npm package
- No references to scripts in documentation
- CI/CD updated to use npm package only

### REQ-CLEANUP-002: Symlink Elimination
**Priority:** High
**WHEN** repository scripts are removed
**THE SYSTEM SHALL** eliminate all symlinks between duplicated functionality

**Rationale:** Remove fragile file system dependencies
**Acceptance Criteria:**
- No symlinks pointing to removed scripts
- No symlinks between main repo and claude-dev-toolkit
- Repository structure simplified

### REQ-CLEANUP-003: lib/ Directory Assessment
**Priority:** Medium
**WHEN** repository scripts are removed
**THE SYSTEM SHALL** evaluate lib/ directory contents for retention or migration

**Files in lib/:**
- auth.sh → Evaluate for npm package migration
- config.sh → Migrate configuration logic to npm package
- ide.sh → Evaluate necessity for npm package
- mcp.sh → Migrate MCP functionality to npm package
- os-detection.sh → Migrate platform detection to npm package
- utils.sh → Migrate useful utilities to npm package
- validation.sh → Migrate validation logic to npm package

**Rationale:** Preserve useful functionality while eliminating duplication
**Acceptance Criteria:**
- Essential functionality migrated to npm package
- Obsolete functionality removed
- No dependencies on shell utilities from npm package

## Documentation Update Requirements

### REQ-CLEANUP-DOC-001: Installation Guide Updates
**Priority:** Critical
**WHEN** repository cleanup is complete
**THE SYSTEM SHALL** update all documentation to reference only npm package

**Documentation to Update:**
- README.md → Single installation method
- docs/publish/install-guide.md → NPM-only instructions
- docs/publish/and-customizing-claude-code.md → Remove dual methods
- CLAUDE.md → Update setup references

**Rationale:** Eliminate user confusion with consistent documentation
**Acceptance Criteria:**
- All references to repository scripts removed
- Single installation method documented
- Migration guide provided for existing users

### REQ-CLEANUP-DOC-002: Reference Cleanup
**Priority:** High
**WHEN** documentation is updated
**THE SYSTEM SHALL** remove all references to "Method 1 vs Method 2" installation

**Rationale:** Simplify user decision-making process
**Acceptance Criteria:**
- No mention of alternative installation methods
- Clear single path to installation
- Examples use npm package commands only

## Testing Infrastructure Updates

### REQ-CLEANUP-TEST-001: CI/CD Pipeline Updates
**Priority:** Critical
**WHEN** repository scripts are removed
**THE SYSTEM SHALL** update GitHub Actions workflows to test only npm package

**Workflow Changes:**
- .github/workflows/install-guide-testing.yml → Test npm installation only
- Remove tests for repository scripts
- Update customization guide tests to use npm commands
- Simplify test matrix (remove dual method testing)

**Rationale:** Eliminate unnecessary test complexity
**Acceptance Criteria:**
- All workflows test npm package functionality
- No tests for removed repository scripts
- Test execution time reduced
- Test maintenance simplified

### REQ-CLEANUP-TEST-002: Test Script Updates
**Priority:** High
**WHEN** testing infrastructure is updated
**THE SYSTEM SHALL** update test scripts to use npm package commands

**Scripts to Update:**
- tests/run-all-tests.sh → Use npm package for setup
- tests/customization-guide-tester.js → Test npm commands
- tests/install-guide-tester.js → Test npm installation

**Rationale:** Ensure tests validate actual user experience
**Acceptance Criteria:**
- Tests use same commands as documented for users
- Test results reflect npm package functionality
- No dependency on repository scripts for testing

## Migration Support Requirements

### REQ-CLEANUP-MIG-001: User Migration Documentation
**Priority:** High
**THE SYSTEM SHALL** provide clear migration guide for users transitioning from repository scripts

**Migration Guide Contents:**
- Command mapping (old script → new npm command)
- Configuration preservation steps
- Troubleshooting common migration issues
- Rollback instructions if needed

**Rationale:** Support users during transition period
**Acceptance Criteria:**
- Step-by-step migration instructions
- All common scenarios covered
- Clear troubleshooting guidance
- Validation steps to confirm successful migration

### REQ-CLEANUP-MIG-002: Backward Compatibility Warning
**Priority:** Medium
**WHILE** migration period is active
**THE SYSTEM SHALL** provide clear warnings about repository script deprecation

**Warning Locations:**
- Repository README.md
- Script execution output (if temporarily maintained)
- Documentation headers

**Rationale:** Give users advance notice of breaking changes
**Acceptance Criteria:**
- Deprecation warnings clearly visible
- Timeline for removal communicated
- Migration path highlighted
- Support contacts provided

## Validation Requirements

### REQ-CLEANUP-VAL-001: Functionality Validation
**Priority:** Critical
**BEFORE** repository script removal
**THE SYSTEM SHALL** validate all functionality is available via npm package

**Validation Steps:**
- Fresh installation via npm package
- All setup scenarios tested
- Configuration management verified
- Command installation confirmed
- Cross-platform testing completed

**Rationale:** Prevent functionality loss during consolidation
**Acceptance Criteria:**
- 100% functionality parity achieved
- All test cases passing
- User acceptance testing completed
- Cross-platform compatibility confirmed

### REQ-CLEANUP-VAL-002: Documentation Accuracy
**Priority:** High
**WHEN** documentation is updated
**THE SYSTEM SHALL** validate all instructions work correctly

**Validation Requirements:**
- All commands in documentation tested
- Code examples execute successfully
- Links and references updated
- Screenshots and output examples current

**Rationale:** Ensure documentation matches implementation
**Acceptance Criteria:**
- All documented commands work as shown
- No broken links or references
- Examples produce expected output
- Screenshots reflect current interface

## Rollback Requirements

### REQ-CLEANUP-ROLL-001: Emergency Rollback Plan
**Priority:** High
**IF** npm package consolidation fails or introduces critical issues, THEN
**THE SYSTEM SHALL** support rollback to previous state

**Rollback Components:**
- Repository scripts restoration from git history
- Documentation reversion
- CI/CD pipeline restoration
- User communication plan

**Rationale:** Minimize risk during major architectural change
**Acceptance Criteria:**
- Rollback procedure documented and tested
- Previous functionality can be restored within 1 hour
- Users notified of rollback if needed
- Root cause analysis conducted

### REQ-CLEANUP-ROLL-002: Partial Rollback Support
**Priority:** Medium
**IF** specific components of consolidation fail, THEN
**THE SYSTEM SHALL** support selective rollback of affected components

**Rationale:** Allow gradual rollback without full system reversion
**Acceptance Criteria:**
- Individual components can be rolled back independently
- Dependencies between components identified and managed
- Partial rollback maintains system stability
- Clear communication about rollback scope

## Success Metrics

### REQ-CLEANUP-METRIC-001: Complexity Reduction
**Priority:** Medium
**WHEN** consolidation is complete
**THE SYSTEM SHALL** demonstrate measurable complexity reduction

**Metrics:**
- Lines of code reduced by elimination of duplication
- Number of installation methods reduced from 2 to 1
- Documentation pages simplified
- CI/CD pipeline steps reduced
- Support tickets related to installation method confusion eliminated

**Rationale:** Validate consolidation objectives achieved
**Acceptance Criteria:**
- At least 50% reduction in installation-related code duplication
- Single installation method in all documentation
- CI/CD execution time improved by at least 25%
- Zero support tickets about installation method choice

---

## Change Log
- 2025-08-24: Initial version - Repository cleanup requirements for NPM consolidation