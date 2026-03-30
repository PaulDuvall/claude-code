# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Code Custom Commands is a comprehensive collection of 42 custom slash commands for Claude Code that accelerate software development workflows through AI-powered automation. These commands provide intelligent automation for every stage of the software development lifecycle, from planning and architecture to deployment and monitoring.

## Core Philosophy

This project focuses on creating defensive security tools and development workflow automation. Each command leverages AI to analyze codebases and provide contextual assistance while maintaining security best practices.

### Key Principles:

1. **Security-First**: All commands focus on defensive security and safe development practices
2. **Workflow Automation**: Streamline repetitive development tasks with intelligent automation
3. **Comprehensive Coverage**: Support the entire software development lifecycle
4. **Quality Assurance**: Maintain high code quality through automated checks and validations
5. **Documentation-Driven**: Every command is thoroughly documented with usage examples

All commands are designed to enhance developer productivity while maintaining security and quality standards.

## Repository Structure

```
claude-code/
├── CLAUDE.md                           # This file - project guidance
├── README.md                           # Main project documentation
├── setup-devcontainer.sh               # Devcontainer setup script
├── claude-dev-toolkit/                 # NPM package (distributable toolkit)
│   ├── package.json                   # NPM package manifest
│   ├── bin/claude-commands            # CLI entry point
│   ├── lib/                           # JavaScript modules
│   ├── scripts/                       # Install/publish scripts
│   ├── commands/                      # Synced command copies for npm
│   ├── hooks/                         # Synced hook copies for npm
│   ├── subagents/                     # Synced subagent copies for npm
│   ├── templates/                     # Synced template copies for npm
│   └── tests/                         # NPM package tests
├── docs/                              # Documentation directory
│   ├── claude-custom-commands.md      # Command reference guide
│   ├── claude-code-hooks-system.md    # Hooks documentation
│   ├── devcontainer-guide.md          # Devcontainer guide
│   └── subagent-hook-integration.md   # Subagent integration docs
├── hooks/                             # Hook implementations (9 hooks)
│   ├── file-logger.sh                # File operation logging
│   ├── on-error-debug.sh             # Error debugging hook
│   ├── pre-commit-quality.sh         # Pre-commit quality checks
│   ├── pre-commit-test-runner.sh     # Auto-detect and run tests
│   ├── pre-write-security.sh         # Pre-write security validation
│   ├── prevent-credential-exposure.sh # Credential exposure prevention
│   ├── subagent-trigger.sh           # Subagent trigger hook
│   ├── subagent-trigger-simple.sh    # Simple subagent trigger
│   ├── verify-before-edit.sh         # Warn about fabricated references
│   └── lib/                           # Hook support libraries (12 modules)
│       ├── config-constants.sh        # Configuration constants
│       ├── file-utils.sh             # File utility functions
│       ├── error-handler.sh          # Error handling and logging
│       ├── argument-parser.sh        # CLI argument parsing
│       ├── context-manager.sh        # Context management
│       ├── execution-engine.sh       # Subagent execution engine
│       ├── execution-simulation.sh   # Execution simulation
│       ├── execution-results.sh      # Result processing
│       ├── subagent-discovery.sh     # Subagent discovery
│       ├── subagent-validator.sh     # Subagent validation
│       ├── field-validators.sh       # Field validation
│       └── validation-reporter.sh    # Validation reporting
├── lib/                               # Shared utility libraries
│   └── logging.sh                    # Logging utilities
├── scripts/                           # Build and deployment scripts
│   ├── sync-to-npm.sh               # Sync source files to npm package
│   ├── deploy-subagents.sh          # Subagent deployment
│   └── update-subagent-settings.py  # Settings updater
├── slash-commands/                    # Command implementations (source of truth)
│   ├── active/                        # 16 production-ready commands
│   │   ├── xarchitecture.md          # Architecture design and analysis
│   │   ├── xconfig.md                # Configuration management
│   │   ├── xcontinue.md              # Execution plan continuation
│   │   ├── xdebug.md                 # Advanced debugging
│   │   ├── xdocs.md                  # Documentation generation
│   │   ├── xexplore.md               # Codebase exploration (read-only)
│   │   ├── xgit.md                   # Automated Git workflow
│   │   ├── xpipeline.md              # CI/CD pipeline management
│   │   ├── xquality.md               # Code quality analysis
│   │   ├── xrefactor.md              # Code refactoring automation
│   │   ├── xrelease.md               # Release management
│   │   ├── xsecurity.md              # Security scanning and analysis
│   │   ├── xspec.md                  # Specification generation
│   │   ├── xtdd.md                   # Test-driven development
│   │   └── xtest.md                  # Testing automation
│   └── experiments/                   # 25 experimental commands
│       ├── xact.md                   # GitHub Actions testing
│       ├── xanalytics.md             # Analytics and metrics
│       ├── xapi.md                   # API development tools
│       ├── xaws.md                   # AWS integration
│       ├── xcicd.md                  # Advanced CI/CD
│       ├── xcompliance.md            # Compliance checking
│       ├── xinfra.md                 # Infrastructure as Code
│       ├── xmonitoring.md            # Application monitoring
│       ├── xperformance.md           # Performance optimization
│       ├── xplanning.md              # Project planning
│       ├── xrisk.md                  # Risk assessment
│       └── [35 additional commands]  # Complete experimental collection
├── subagents/                         # 25 subagent definitions
├── specs/                             # Command specifications
│   ├── command-specifications.md      # Command development specs
│   ├── custom-command-specifications.md # Custom command guidelines
│   └── help-functionality-specification.md # Help system specs
├── templates/                         # Configuration templates
│   ├── basic-settings.json           # Basic Claude Code settings
│   ├── comprehensive-settings.json   # Advanced settings
│   ├── security-focused-settings.json # Security-focused config
│   └── global-claude.md              # Global CLAUDE.md instructions template
└── tests/                             # Shell-based test suites
    ├── test_setup_devcontainer.sh    # Devcontainer tests
    ├── test_devcontainer_advanced.sh # Advanced devcontainer tests
    ├── test_logging.sh               # Logging tests
    └── test_subagent_hook_integration.sh # Integration tests
```

## Command Categories

### Planning & Strategy
- `/xplanning` - Project planning with roadmaps and estimation
- `/xproduct` - Product management and feature planning
- `/xrisk` - Risk assessment and mitigation

### Architecture & Design
- `/xarchitecture` - System architecture design with proven patterns
- `/xdesign` - Software design patterns and decisions
- `/xconstraints` - Design constraint analysis

### Development & Code Quality
- `/xrefactor` - Interactive code refactoring
- `/xquality` - Code quality analysis with linting
- `/xtdd` - Test-driven development automation
- `/xtest` - Comprehensive testing with traceability
- `/xcoverage` - Code coverage analysis
- `/xdebug` - Advanced debugging assistance
- `/xcontinue` - Execution plan continuation across sessions
- `/xexplore` - Codebase exploration before changes (read-only)

### Security & Compliance
- `/xsecurity` - Security vulnerability scanning
- `/xcompliance` - Compliance checking
- `/xpolicy` - Policy enforcement and governance

### CI/CD & Deployment
- `/xgit` - Automated Git workflow
- `/xcicd` - CI/CD pipeline management
- `/xpipeline` - Build pipeline optimization
- `/xrelease` - Release management

### Infrastructure & Operations
- `/xinfra` - Infrastructure as Code management
- `/xmonitoring` - Application monitoring setup
- `/xmetrics` - Performance metrics collection

## Development Guidelines

### Command Structure

Each command in `slash-commands/active/` and `slash-commands/experiments/` follows this pattern:

```markdown
---
description: "Brief command description"
tags: ["category", "workflow", "automation"]
---

# Command Name

## Description
Detailed explanation of what the command does.

## Usage
Examples of how to use the command with parameters.

## Implementation
The actual command logic and automation steps.
```

### Security Requirements

**CRITICAL**: This repository only supports defensive security tools and analysis:
- Security vulnerability scanning and detection
- Code quality analysis and improvement
- Compliance checking and governance
- Defensive security automation
- Never create offensive security tools
- Never assist with malicious code or attacks

### Command Development Standards

1. **Documentation First**: Every command must have comprehensive documentation
2. **Parameter Validation**: Validate all inputs and provide clear error messages
3. **Security Focused**: Implement security best practices in all automation
4. **Idempotent Operations**: Commands should be safe to run multiple times
5. **Clear Output**: Provide structured, actionable feedback to users

### Testing

```bash
# Run NPM package tests
cd claude-dev-toolkit && npm test

# Run shell-based tests
bash tests/test_setup_devcontainer.sh
bash tests/test_devcontainer_advanced.sh

# Sync source files to npm package before publishing
bash scripts/sync-to-npm.sh
```

### Adding New Commands

1. **Create command file** in `slash-commands/active/` (production) or `slash-commands/experiments/` (testing) directory as `.md` file
2. **Follow naming convention**: Use `x` prefix (e.g., `xnewfeature.md`)
3. **Include proper documentation** with description, usage, and examples
4. **Run sync**: `bash scripts/sync-to-npm.sh` to copy to npm package
5. **Test thoroughly**: Deploy and test in actual Claude Code environment
6. **Update documentation**: Add to appropriate category in README.md and documentation

### NPM Package Deployment

```bash
# Sync source files to npm package
bash scripts/sync-to-npm.sh

# Run npm package tests
cd claude-dev-toolkit && npm test

# Install globally from npm
npm install -g claude-dev-toolkit

# Use the CLI
claude-commands install
claude-commands list
```

## Integration Patterns

Commands are designed to work together in workflows:

### Development Workflow
```bash
/xspec --feature "user-auth"        # Create specifications
/xtdd --component AuthService       # Implement with TDD
/xquality --ruff --mypy --fix      # Check code quality
/xsecurity --scan --report         # Security analysis
/xgit                              # Automated commit workflow
```

### CI/CD Integration
```bash
/xtest --coverage --report         # Run comprehensive tests
/xquality --all --baseline        # Quality baseline
/xsecurity --scan --report        # Security scan
/xpipeline --deploy staging       # Deploy pipeline
```

### Security-First Development
```bash
/xsecurity --dependencies --code   # Security scanning
/xcompliance --gdpr --audit       # Compliance check
/xpolicy --review --access        # Policy review
```

## Working with Claude Code

### Command Expectations

When working with this repository:

1. **Focus on defensive security** - Only create tools that help developers build secure software
2. **Maintain documentation** - Keep all command documentation current and comprehensive
3. **Test thoroughly** - Verify commands work correctly before deployment
4. **Follow security principles** - Never compromise on security best practices
5. **Enhance productivity** - Commands should genuinely improve developer workflows

### File Management

- **Active commands**: Store production-ready commands in `slash-commands/active/` directory with `.md` extension
- **Experimental commands**: Store experimental commands in `slash-commands/experiments/` directory
- **Documentation**: Update README.md and relevant docs/ files
- **Hooks**: Store in `hooks/` directory for security and governance automation
- **Configuration templates**: Use templates in `templates/` directory for different setup scenarios
- **NPM sync**: Run `bash scripts/sync-to-npm.sh` to sync source files to the npm package

### Quality Standards

- **Code Style**: Follow markdown formatting standards for command files
- **Documentation**: Include usage examples and parameter descriptions
- **Security**: Implement input validation and secure practices
- **Performance**: Commands should execute efficiently
- **Reliability**: Handle errors gracefully with helpful messages

## Security Considerations

- **Input Validation**: All commands must validate inputs and sanitize parameters
- **Secure Defaults**: Use secure defaults for all configuration options
- **Error Handling**: Never expose sensitive information in error messages
- **Access Control**: Respect file permissions and user access rights
- **Audit Trail**: Maintain logs of security-relevant actions

This repository transforms Claude Code into a comprehensive development platform that guides teams through best practices while automating repetitive tasks and ensuring consistent quality and security across all projects.
- It's unacceptable to have any failing tests. 100% need to be passing before moving onto the next work
