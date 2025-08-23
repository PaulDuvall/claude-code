# NPM Distribution Plan for Claude Code Custom Commands

## Overview

Transform the existing Claude Code Custom Commands repository into an npm package that provides a streamlined installation experience. Instead of manual git cloning and script execution, users will be able to install with a simple `npm install -g claude-dev-toolkit` command.

## Current State Analysis

### Existing Installation Process
Currently users must:
1. Install Claude Code manually: `npm install -g @anthropic-ai/claude-code`
2. Clone the repository: `git clone https://github.com/PaulDuvall/claude-code.git`
3. Run setup script: `./setup.sh`
4. Navigate complex options for different installation types

### Repository Structure
The repository contains:
- **13 active commands** in `slash-commands/active/`
- **44 experimental commands** in `slash-commands/experiments/`
- **Setup automation** via `setup.sh`, `deploy.sh`, `configure-claude-code.sh`
- **Security hooks** in `hooks/` directory
- **Configuration templates** in `templates/` directory
- **Utility libraries** in `lib/` directory
- **Validation systems** via `validate-commands.sh`, `verify-setup.sh`

## Proposed NPM Package Structure

### Main Package: `claude-dev-toolkit`

```
claude-dev-toolkit/
├── package.json                    # Main package configuration
├── bin/
│   └── claude-commands            # Main CLI entry point (#!/usr/bin/env node)
├── lib/
│   ├── index.js                   # Main library entry
│   ├── installer.js               # Command installation logic
│   ├── validator.js               # Command validation
│   ├── config.js                  # Configuration management
│   └── utils.js                   # Utility functions (from existing lib/)
├── commands/
│   ├── active/                    # 13 production commands (from slash-commands/active/)
│   └── experimental/              # 44 experimental commands (from slash-commands/experiments/)
├── templates/                     # Configuration templates (existing)
├── hooks/                         # Security hooks (existing)
├── install.js                    # Post-install setup script
├── uninstall.js                  # Clean uninstall script
└── README.md                      # Updated installation instructions
```

### Package.json Configuration

```json
{
  "name": "claude-dev-toolkit",
  "version": "1.0.0",
  "description": "57 AI-powered custom commands for Claude Code - Transform your development workflow",
  "main": "lib/index.js",
  "bin": {
    "claude-commands": "bin/claude-commands"
  },
  "scripts": {
    "postinstall": "node install.js",
    "preuninstall": "node uninstall.js",
    "test": "npm run validate",
    "validate": "node lib/validator.js",
    "lint": "echo 'Linting commands...' && node lib/validator.js --lint"
  },
  "keywords": [
    "claude-code",
    "ai",
    "development",
    "cli",
    "automation",
    "workflow",
    "commands",
    "slash-commands"
  ],
  "dependencies": {
    "commander": "^11.0.0",
    "chalk": "^5.3.0",
    "inquirer": "^9.2.0",
    "fs-extra": "^11.1.0"
  },
  "engines": {
    "node": ">=16.0.0"
  },
  "files": [
    "bin/",
    "lib/",
    "commands/",
    "templates/",
    "hooks/",
    "install.js",
    "uninstall.js"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/PaulDuvall/claude-code.git"
  },
  "author": "Paul Duvall",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/PaulDuvall/claude-code/issues"
  },
  "homepage": "https://github.com/PaulDuvall/claude-code#readme"
}
```

## CLI Interface Design

### Primary Command: `claude-commands`

The package will provide these global commands after installation:

```bash
# Installation commands
claude-commands install              # Interactive installation wizard
claude-commands install --active    # Install 13 core commands only
claude-commands install --experiments  # Install experimental commands only
claude-commands install --all       # Install all 57 commands
claude-commands install --security  # Install with security hooks

# Management commands
claude-commands uninstall           # Remove all installed commands
claude-commands uninstall --commands  # Remove only commands, keep settings
claude-commands update              # Update installed commands to latest

# Information commands
claude-commands list                # Show available commands
claude-commands list --installed   # Show currently installed commands
claude-commands status             # Show installation status and health check
claude-commands validate           # Validate installed commands

# Configuration commands
claude-commands config              # Interactive configuration wizard
claude-commands config --template basic|security|comprehensive
claude-commands hooks --install    # Install security hooks
claude-commands hooks --remove     # Remove security hooks
```

### Command Help System

```bash
claude-commands --help
claude-commands install --help
claude-commands config --help
```

## Installation Workflow

### 1. Global NPM Installation

```bash
npm install -g claude-dev-toolkit
```

### 2. Automatic Post-Install Process

The `install.js` script will:

1. **Environment Check**
   - Verify Claude Code is installed
   - Check Node.js version compatibility
   - Validate required dependencies (bash, jq, curl, git)

2. **Interactive Setup** (unless `--silent` flag used)
   - Prompt for installation type (basic/security/comprehensive)
   - Ask which command sets to install
   - Confirm security hooks installation
   - Select configuration template

3. **Installation Execution**
   - Create `~/.claude/commands/` directory
   - Copy selected command files
   - Apply chosen settings template to `~/.claude/settings.json`
   - Install security hooks if requested
   - Set appropriate file permissions

4. **Validation**
   - Verify all commands copied correctly
   - Test Claude Code can load new commands
   - Provide installation summary

### 3. Manual Management

Users can modify their installation after initial setup:

```bash
# Add experimental commands later
claude-commands install --experiments

# Switch to comprehensive configuration
claude-commands config --template comprehensive

# Add security hooks
claude-commands hooks --install
```

## Implementation Phases

### Phase 1: Core Package Structure (Week 1)

**Tasks:**
1. Create main CLI entry point (`bin/claude-commands`)
2. Build core installer system (`lib/installer.js`)
3. Create package.json with proper bin configuration
4. Implement basic command structure with commander.js
5. Test local installation with `npm link`

**Deliverables:**
- Working CLI that can list available commands
- Basic install/uninstall functionality
- Proper npm package structure

### Phase 2: Installation System (Week 2)

**Tasks:**
1. Implement post-install automation (`install.js`)
2. Create interactive installation wizard with inquirer.js
3. Build command deployment logic (based on existing `deploy.sh`)
4. Add configuration template application
5. Implement validation system

**Deliverables:**
- Fully automated installation process
- Interactive setup wizard
- Command validation and health checks

### Phase 3: Advanced Features (Week 3)

**Tasks:**
1. Add security hooks installation
2. Implement update mechanism
3. Create comprehensive error handling
4. Add uninstall cleanup system
5. Build status and diagnostic commands

**Deliverables:**
- Complete feature set matching current setup.sh capabilities
- Robust error handling and recovery
- Clean uninstall process

### Phase 4: Testing & Publishing (Week 4)

**Tasks:**
1. Comprehensive testing on multiple platforms
2. Create automated tests for installation/uninstall
3. Update documentation and README
4. Prepare npm package for publishing
5. Test publishing to npm registry

**Deliverables:**
- Published npm package
- Updated documentation
- Installation guides and examples

## Technical Implementation Details

### Dependencies Management

**Core Dependencies:**
```json
{
  "commander": "^11.0.0",    // CLI framework
  "chalk": "^5.3.0",         // Terminal colors
  "inquirer": "^9.2.0",      // Interactive prompts
  "fs-extra": "^11.1.0"      // Enhanced file operations
}
```

**System Dependencies Validation:**
- Leverage existing `dependencies.txt` format
- Use existing `lib/utils.sh` validation logic converted to Node.js
- Provide clear installation instructions for missing dependencies

### File Operations

**Command Installation:**
```javascript
// Copy commands from package to ~/.claude/commands/
const commands = await fs.readdir(path.join(__dirname, 'commands', commandSet));
for (const command of commands) {
  await fs.copy(
    path.join(__dirname, 'commands', commandSet, command),
    path.join(os.homedir(), '.claude', 'commands', command)
  );
}
```

**Configuration Templates:**
```javascript
// Apply selected template to ~/.claude/settings.json
const template = await fs.readJson(path.join(__dirname, 'templates', `${templateType}-settings.json`));
await fs.writeJson(path.join(os.homedir(), '.claude', 'settings.json'), template, { spaces: 2 });
```

### Cross-Platform Compatibility

- Use Node.js path operations for cross-platform file handling
- Leverage fs-extra for robust file operations
- Maintain compatibility with existing bash-based tools
- Test on Windows, macOS, and Linux

### Error Handling

```javascript
try {
  await installCommands(options);
} catch (error) {
  console.error(chalk.red('Installation failed:'), error.message);
  console.log(chalk.yellow('Troubleshooting:'));
  console.log('1. Ensure Claude Code is installed: npm install -g @anthropic-ai/claude-code');
  console.log('2. Check permissions: ' + path.join(os.homedir(), '.claude'));
  console.log('3. Run with --verbose for detailed logs');
  process.exit(1);
}
```

## Migration Strategy

### Backward Compatibility

- Maintain existing `setup.sh` for users who prefer manual installation
- Keep existing repository structure unchanged
- Provide migration guide for existing users
- Support both installation methods simultaneously

### User Migration Path

**For New Users:**
```bash
npm install -g claude-dev-toolkit
# Automatic setup via post-install
```

**For Existing Users:**
```bash
# Option 1: Clean install
claude-commands uninstall  # Remove existing setup
npm install -g claude-dev-toolkit

# Option 2: Migrate in place
npm install -g claude-dev-toolkit
claude-commands migrate     # Detect and preserve existing configuration
```

## Benefits Analysis

### User Experience Improvements

**Before (Manual Installation):**
- 4-step process requiring git clone
- Need to understand bash scripts
- Manual dependency management
- Complex setup options
- No easy uninstall

**After (NPM Installation):**
- 1-step installation: `npm install -g claude-dev-toolkit`
- Automatic dependency validation
- Interactive setup wizard
- Standard npm update/uninstall
- Cross-platform compatibility

### Developer Benefits

**Maintenance:**
- Standard npm publishing workflow
- Automated testing and CI/CD
- Version management with semantic versioning
- Issue tracking through npm registry

**Distribution:**
- Global reach through npm registry
- Download statistics and usage metrics
- Dependency management handled by npm
- Automatic security vulnerability scanning

### Technical Benefits

**Installation Reliability:**
- Atomic installations (success or rollback)
- Proper error handling and recovery
- Validation at each step
- Comprehensive logging

**Management:**
- Easy updates with `npm update`
- Clean uninstalls with `npm uninstall`
- Status checking and health validation
- Configuration management

## Risk Assessment

### Potential Issues

1. **NPM Registry Dependencies**
   - Risk: NPM service unavailability
   - Mitigation: Maintain GitHub releases as backup

2. **Node.js Version Compatibility**
   - Risk: Incompatibility with older Node.js versions
   - Mitigation: Set minimum Node.js version, provide upgrade guidance

3. **File Permission Issues**
   - Risk: Installation failures due to permissions
   - Mitigation: Clear error messages, permission checking

4. **Claude Code Compatibility**
   - Risk: Breaking changes in Claude Code affecting commands
   - Mitigation: Version pinning, compatibility testing

### Mitigation Strategies

- Comprehensive testing on multiple platforms
- Clear error messages with troubleshooting steps
- Fallback to manual installation if needed
- Regular compatibility testing with Claude Code updates

## Success Metrics

### Adoption Metrics
- NPM download statistics
- GitHub star/fork growth
- User feedback and issue reports
- Community contributions

### Technical Metrics
- Installation success rate
- Error rates by platform
- Support ticket volume
- Update adoption rate

## Conclusion

This NPM distribution plan transforms Claude Code Custom Commands from a developer-focused tool requiring manual setup into a mainstream npm package with professional installation experience. The plan maintains all existing functionality while dramatically improving user experience and providing standard package management capabilities.

The phased implementation approach ensures steady progress while maintaining stability, and the backward compatibility strategy protects existing users during the transition.

Upon completion, users will experience a modern, reliable installation process that matches the quality and professionalism of the custom commands themselves.