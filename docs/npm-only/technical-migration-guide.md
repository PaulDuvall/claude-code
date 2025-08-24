# Technical Migration Guide: NPM-First Architecture

## Overview

This document provides detailed technical implementation guidance for migrating from the dual installation approach to a single NPM-first architecture.

## Current Architecture Analysis

### Repository Scripts Inventory

#### `setup.sh` Functionality:
```bash
# Core features to migrate:
- Claude Code installation detection/installation
- NPM package installation (@paulduvall/claude-dev-toolkit)
- Environment setup and validation
- Configuration template deployment
- Hook installation
- Subagent deployment
- Comprehensive setup validation
```

#### `deploy.sh` Functionality:
```bash
# Core features to migrate:
- Command deployment (--active, --experiments, --all)
- Dry-run capabilities
- Include/exclude filtering
- Directory structure validation
- Backup creation
- Rollback capabilities
```

#### `configure-claude-code.sh` Functionality:
```bash
# Core features to migrate:
- Interactive configuration setup
- Template-based configuration
- Settings validation
- Backup and restore
- Environment variable management
```

### Symlink Analysis

#### Current Symlinks to Remove:
```
claude-code/
├── setup.sh -> scripts/setup.sh
├── deploy.sh -> scripts/deploy.sh
├── configure-claude-code.sh -> scripts/configure-claude-code.sh
└── verify-setup.sh -> scripts/verify-setup.sh
```

**Issue**: These create platform-specific dependencies and maintenance overhead.

## NPM Package Enhancement Plan

### Enhanced CLI Interface Design

#### Primary Command Structure:
```bash
claude-commands <command> [options]
```

#### Commands to Implement:

##### 1. Setup Command
```bash
# Replace setup.sh functionality
claude-commands setup [options]

Options:
  --type basic|security|comprehensive  # Template type
  --force                              # Force reinstall
  --dry-run                           # Preview actions
  --skip-configure                    # Skip configuration step
  --skip-hooks                        # Skip hooks installation
  --verbose                           # Detailed output
```

##### 2. Install Command (Enhanced)
```bash
# Replace deploy.sh functionality
claude-commands install [options]

Options:
  --active                           # Install active commands
  --experiments                      # Install experimental commands
  --all                             # Install all commands
  --include <pattern>               # Include specific commands
  --exclude <pattern>               # Exclude specific commands
  --dry-run                         # Preview installation
  --backup                          # Create backup before install
  --rollback                        # Rollback to previous version
```

##### 3. Configure Command (Enhanced)
```bash
# Replace configure-claude-code.sh functionality
claude-commands configure [options]

Options:
  --interactive                     # Interactive configuration wizard
  --template <name>                 # Use specific template
  --reset                          # Reset to defaults
  --backup                         # Backup current config
  --restore <backup>               # Restore from backup
  --validate                       # Validate current configuration
```

##### 4. New Utility Commands
```bash
# Additional useful commands
claude-commands verify [--verbose]        # System verification
claude-commands update                     # Update to latest version
claude-commands uninstall [--complete]    # Clean uninstallation
claude-commands backup <name>             # Create named backup
claude-commands restore <name>            # Restore named backup
claude-commands list [--installed]        # List available/installed commands
```

### Implementation Architecture

#### Package Structure:
```javascript
@paulduvall/claude-dev-toolkit/
├── bin/
│   └── claude-commands.js           # Main CLI entry point
├── lib/
│   ├── commands/
│   │   ├── setup.js                # Setup command implementation
│   │   ├── install.js              # Install command implementation
│   │   ├── configure.js            # Configure command implementation
│   │   ├── verify.js               # Verify command implementation
│   │   └── utils.js                # Shared utilities
│   ├── templates/                  # Configuration templates
│   ├── validators/                 # Configuration validators
│   └── platform/                   # Platform-specific handling
├── templates/                      # Default templates
├── tests/                         # Comprehensive test suite
└── package.json                   # NPM package configuration
```

#### Cross-Platform Considerations:

##### File System Operations:
```javascript
// Use path.join for cross-platform paths
const claudeDir = path.join(os.homedir(), '.claude');

// Use fs promises for async operations
const fs = require('fs').promises;

// Handle Windows/Unix permissions differently
const isWindows = process.platform === 'win32';
const permissions = isWindows ? undefined : 0o755;
```

##### Shell Command Execution:
```javascript
// Use spawn instead of exec for better cross-platform support
const { spawn } = require('child_process');

// Detect shell environment
const shell = process.env.SHELL || (process.platform === 'win32' ? 'cmd' : 'bash');
```

##### Environment Variables:
```javascript
// Handle different shell configurations
const profileFiles = {
  bash: '.bashrc',
  zsh: '.zshrc',
  fish: '.config/fish/config.fish',
  powershell: 'WindowsPowerShell/Microsoft.PowerShell_profile.ps1'
};
```

### Migration Implementation Steps

#### Step 1: Core Functionality Migration

##### Setup Command Implementation:
```javascript
// lib/commands/setup.js
class SetupCommand {
  async execute(options) {
    // 1. Detect existing installation
    await this.detectExistingInstall();
    
    // 2. Install Claude Code if needed
    await this.ensureClaudeCodeInstalled();
    
    // 3. Create directory structure
    await this.createDirectoryStructure();
    
    // 4. Deploy configuration templates
    await this.deployConfigurationTemplates(options.type);
    
    // 5. Install hooks
    if (!options.skipHooks) {
      await this.installHooks();
    }
    
    // 6. Deploy commands
    await this.deployCommands(options);
    
    // 7. Verify installation
    await this.verifyInstallation(options.verbose);
  }
}
```

##### Install Command Implementation:
```javascript
// lib/commands/install.js
class InstallCommand {
  async execute(options) {
    // 1. Validate options
    await this.validateOptions(options);
    
    // 2. Create backup if requested
    if (options.backup) {
      await this.createBackup();
    }
    
    // 3. Get command list based on options
    const commands = await this.getCommandList(options);
    
    // 4. Install commands
    if (options.dryRun) {
      await this.previewInstallation(commands);
    } else {
      await this.installCommands(commands);
    }
    
    // 5. Verify installation
    await this.verifyCommandInstallation(commands);
  }
}
```

#### Step 2: Configuration Management

##### Template System:
```javascript
// lib/templates/index.js
class TemplateManager {
  static getAvailableTemplates() {
    return ['basic', 'comprehensive', 'security-focused'];
  }
  
  static async loadTemplate(name) {
    const templatePath = path.join(__dirname, '../../templates', `${name}.json`);
    return JSON.parse(await fs.readFile(templatePath, 'utf8'));
  }
  
  static async validateTemplate(config) {
    // Comprehensive validation logic
  }
}
```

#### Step 3: Platform-Specific Handling

##### Windows Support:
```javascript
// lib/platform/windows.js
class WindowsPlatform {
  static async setupEnvironment() {
    // Handle Windows-specific setup
    // PowerShell profile configuration
    // Windows Terminal configuration
    // Path management
  }
}
```

##### Unix Support:
```javascript
// lib/platform/unix.js
class UnixPlatform {
  static async setupEnvironment() {
    // Handle Unix-specific setup
    // Shell profile configuration
    // Permissions management
    // Symlink handling
  }
}
```

### Testing Strategy

#### Unit Tests:
```javascript
// tests/commands/setup.test.js
describe('SetupCommand', () => {
  test('should detect existing installation', async () => {
    // Mock existing installation
    // Test detection logic
  });
  
  test('should handle fresh installation', async () => {
    // Mock clean environment
    // Test full setup process
  });
});
```

#### Integration Tests:
```javascript
// tests/integration/full-setup.test.js
describe('Full Setup Integration', () => {
  test('should complete full setup process', async () => {
    // Test end-to-end setup
    // Validate all components installed
  });
});
```

#### Cross-Platform Tests:
```javascript
// tests/platform/cross-platform.test.js
describe('Cross-Platform Compatibility', () => {
  test.each(['win32', 'darwin', 'linux'])('should work on %s', async (platform) => {
    // Mock platform
    // Test platform-specific functionality
  });
});
```

## Repository Cleanup Implementation

### Files to Remove:

#### Scripts Directory:
```bash
# Remove these files
rm -rf scripts/
rm setup.sh deploy.sh configure-claude-code.sh verify-setup.sh
rm validate-commands.sh  # Functionality moves to NPM package
```

#### Lib Directory Cleanup:
```bash
# Evaluate these files for migration vs removal
lib/
├── auth.sh          # → Migrate to NPM package
├── config.sh        # → Migrate to NPM package  
├── ide.sh           # → Evaluate necessity
├── mcp.sh           # → Migrate to NPM package
├── os-detection.sh  # → Migrate to NPM package
├── utils.sh         # → Migrate to NPM package
└── validation.sh    # → Migrate to NPM package
```

#### Directory Structure Post-Cleanup:
```
claude-code/
├── docs/                    # Enhanced documentation
│   ├── consolidation-strategy.md
│   ├── technical-migration-guide.md
│   └── user-migration-guide.md
├── templates/              # Configuration templates only
├── tests/                  # Simplified testing
├── .github/workflows/      # Updated CI/CD
├── package.json           # Development dependencies
├── README.md              # Simplified instructions
└── CLAUDE.md              # Updated project guidance
```

## CI/CD Pipeline Updates

### GitHub Actions Workflow Changes:

#### Before (Dual Testing):
```yaml
# .github/workflows/install-guide-testing.yml
- name: Test repository installation
  run: ./setup.sh --dry-run

- name: Test NPM installation  
  run: npm install -g @paulduvall/claude-dev-toolkit
```

#### After (NPM-Only Testing):
```yaml
# .github/workflows/install-guide-testing.yml
- name: Test NPM installation
  run: npm install -g @paulduvall/claude-dev-toolkit
  
- name: Test setup command
  run: claude-commands setup --dry-run --verbose
  
- name: Test install commands
  run: claude-commands install --active --dry-run
```

### Simplified Test Matrix:
```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node-version: [18.x, 20.x]
    installation-type: [fresh-install, update-install]
```

## Validation and Testing Plan

### Pre-Migration Testing:
1. **Functionality Audit**
   - Document all repository script capabilities
   - Create test cases for each feature
   - Validate NPM package equivalent functionality

2. **Cross-Platform Validation**
   - Test repository scripts on all platforms
   - Document platform-specific behaviors
   - Plan NPM package platform handling

### Post-Migration Testing:
1. **Feature Parity Validation**
   - Verify NPM package performs all previous functions
   - Test edge cases and error conditions
   - Validate configuration and template handling

2. **Migration Testing**
   - Test transition from repository scripts to NPM
   - Validate cleanup procedures
   - Test rollback capabilities

### Performance Considerations:

#### Installation Speed:
```bash
# Before: Repository scripts
time ./setup.sh  # ~30-60 seconds

# After: NPM package  
time npm install -g @paulduvall/claude-dev-toolkit  # ~10-20 seconds
time claude-commands setup  # ~15-30 seconds
```

#### Disk Usage:
```bash
# Before: Repository + NPM package duplication
# After: Single NPM package installation
```

## Rollback Plan

### Emergency Rollback Strategy:

#### If Migration Fails:
1. **Restore Repository Scripts**
   - Keep backup of removed scripts in separate branch
   - Quick restoration process documented
   - Revert documentation changes

2. **NPM Package Rollback**
   - Publish rollback version if needed
   - Document rollback procedures for users
   - Provide clear communication about issues

#### Version Management:
```bash
# Tag before migration
git tag v1.2.0-pre-consolidation

# Tag after successful migration  
git tag v2.0.0-consolidated

# Emergency rollback capability
git checkout v1.2.0-pre-consolidation
```

## Success Metrics

### Technical Success Indicators:

1. **Functionality Parity**: 100% of repository script functionality available in NPM package
2. **Cross-Platform Support**: Works on Windows, macOS, Linux
3. **Performance**: Installation time improved by >30%
4. **Maintainability**: Single codebase, reduced complexity
5. **User Experience**: Single command installation, consistent behavior

### Migration Completion Checklist:

- [ ] NPM package contains all repository script functionality
- [ ] Cross-platform testing completed successfully
- [ ] Repository scripts removed and cleanup completed
- [ ] Documentation updated to single installation method
- [ ] CI/CD pipelines updated and tested
- [ ] User migration guide created and tested
- [ ] Rollback plan tested and documented
- [ ] Performance benchmarks met or exceeded

---
*Document Version: 1.0*  
*Created: 2025-08-24*  
*Status: Technical Implementation Guide*