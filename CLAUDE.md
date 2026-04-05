# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Code Custom Commands is a comprehensive collection of 45 custom slash commands for Claude Code that accelerate software development workflows through AI-powered automation. These commands provide intelligent automation for every stage of the software development lifecycle, from planning and architecture to deployment and monitoring.

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
├── hooks/                             # Hook implementations (11 shell + 14 Python)
│   ├── file-logger.sh                # File operation logging
│   ├── on-error-debug.sh             # Error debugging hook
│   ├── pre-commit-quality.sh         # Pre-commit quality checks
│   ├── pre-commit-test-runner.sh     # Auto-detect and run tests
│   ├── pre-write-security.sh         # Pre-write security validation
│   ├── prevent-credential-exposure.sh # Credential exposure prevention
│   ├── subagent-trigger.sh           # Subagent trigger hook (--simple for lightweight mode)
│   ├── tab-color.sh                  # Terminal tab colorization
│   ├── verify-before-edit.sh         # Warn about fabricated references
│   ├── claude-wrapper.sh             # Claude wrapper script
│   └── lib/                           # Hook support libraries (14 modules)
│       ├── hook-helpers.sh           # Shared helpers for standalone hooks
│       ├── config-constants.sh        # Configuration constants
│       ├── file-utils.sh             # File utility functions
│       ├── error-handler.sh          # Error handling and logging
│       ├── argument-parser.sh        # CLI argument parsing
│       ├── context-manager.sh        # Context orchestrator (thin)
│       ├── context-gathering.sh      # Context data gathering
│       ├── context-file-ops.sh       # Context file I/O and validation
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
│   ├── active/                        # 17 production-ready commands
│   │   ├── xarchitecture.md          # Architecture design and analysis
│   │   ├── xconfig.md                # Configuration management
│   │   ├── xcontinue.md              # Execution plan continuation
│   │   ├── xdebug.md                 # Advanced debugging
│   │   ├── xdocs.md                  # Documentation generation
│   │   ├── xexplore.md               # Codebase exploration (read-only)
│   │   ├── xgit.md                   # Automated Git workflow
│   │   ├── xhelp.md                  # Built-in help system
│   │   ├── xpipeline.md              # CI/CD pipeline management
│   │   ├── xquality.md               # Code quality analysis
│   │   ├── xrefactor.md              # Code refactoring automation
│   │   ├── xrelease.md               # Release management
│   │   ├── xsecurity.md              # Security scanning and analysis
│   │   ├── xspec.md                  # Specification generation
│   │   ├── xtdd.md                   # Test-driven development
│   │   ├── xtest.md                  # Testing automation
│   │   └── xverify.md               # Reference verification
│   └── experiments/                   # 28 experimental commands
│       ├── xact.md                   # GitHub Actions testing
│       ├── xapi.md                   # API development tools
│       ├── xaws.md                   # AWS integration
│       ├── xcompliance.md            # Compliance checking
│       ├── xinfra.md                 # Infrastructure as Code
│       ├── xmetrics.md               # Metrics collection
│       ├── xplanning.md              # Project planning
│       ├── xpolicy.md                # Policy enforcement
│       ├── xproduct.md               # Product management
│       ├── xrisk.md                  # Risk assessment
│       └── [17 additional commands]  # Complete experimental collection
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

## Command Reference

> **Source of truth:** `slash-commands/active/` and `slash-commands/experiments/`
> Run `bash scripts/generate-command-docs.sh update` to regenerate this section.

### Active Commands

<!-- BEGIN:COMMANDS -->
| Command | Description |
|---------|-------------|
| `/xarchitecture` | Design, analyze, and evolve system architecture using Domain-Driven Design, 12-Factor App, and proven patterns |
| `/xconfig` | Manage project configuration files, environment variables, and application settings |
| `/xcontinue` | Continue an execution plan from where it left off across sessions |
| `/xdebug` | Interactive debugging support with error analysis and fix suggestions - integrates with Debug Specialist sub-agent for complex issues |
| `/xdocs` | Generate and maintain comprehensive documentation from code |
| `/xexplore` | Explore a codebase topic before making changes (read-only) |
| `/xgit` | Automate git workflow - stage, commit with smart messages, and push to specified branch |
| `/xhelp` | Command navigator that recommends the right slash commands for your task |
| `/xpipeline` | Advanced CI/CD pipeline configuration, build automation, deployment orchestration, and optimization |
| `/xquality` | Run code quality checks with maturity-aware thresholds and centralized-rules integration |
| `/xrefactor` | Interactive refactoring assistant based on Martin Fowler's catalog and project-specific rules for code smell detection |
| `/xrelease` | Comprehensive release management with planning, coordination, deployment automation, and monitoring |
| `/xsecurity` | Run security scans with maturity-aware checks and centralized-rules integration |
| `/xspec` | Machine-readable specifications with unique identifiers and authority levels for precise AI code generation |
| `/xtdd` | Complete Test-Driven Development workflow automation with Red-Green-Refactor-Commit cycle |
| `/xtest` | Run tests with smart defaults, maturity-aware thresholds, and centralized-rules integration |
| `/xverify` | Verify references before taking action — catch fabricated URLs, placeholder IDs, and unverified claims |

### Experimental Commands (28)

| Command | Description |
|---------|-------------|
| `/xact` | Local GitHub Actions testing with nektos/act for rapid development feedback |
| `/xapi` | Design, implement, test, and document APIs with comprehensive automation and best practices |
| `/xatomic` | Break complex tasks into 4-8 hour atomic units for efficient development workflow |
| `/xaws` | AWS integration for credentials, services, and IAM testing with moto mocking |
| `/xbaseline` | Establish and track quality, performance, and security baselines with regression detection |
| `/xchoice` | Generate multiple implementation options with trade-off analysis for informed decision-making |
| `/xcompliance` | Check project compliance with standards and generate audit documentation |
| `/xcoverage` | Comprehensive dual coverage analysis for code and specifications |
| `/xdb` | Comprehensive database management, migrations, and performance operations |
| `/xdevcontainer` | Set up Anthropic's official devcontainer for running Claude Code with --dangerously-skip-permissions safely |
| `/xgovernance` | Comprehensive development governance framework for policies, audits, and compliance |
| `/xiac` | Comprehensive Infrastructure as Code management with focus on AWS IAM, Terraform, CloudFormation, and infrastructure validation |
| `/ximagespec` | Generate specifications and code from visual artifacts — diagrams, mockups, and screenshots |
| `/xincident` | Incident response automation, post-mortem analysis, and system reliability improvement through SpecDriven AI methodology |
| `/xinfra` | Manage infrastructure operations, container orchestration, cloud resources, and deployment automation |
| `/xknowledge` | Manage organizational knowledge, facilitate team onboarding, and create training materials with SpecDriven AI methodology |
| `/xmaturity` | Assess and improve team's development maturity with actionable insights |
| `/xmetrics` | Advanced metrics collection and analysis for development process optimization and SpecDriven AI insights |
| `/xmultirepo` | Coordinate changes across multiple repositories with parallel agent orchestration |
| `/xnew` | Initialize a new project with comprehensive CLAUDE.md and specification framework |
| `/xoidc` | Automate AWS OIDC role creation for GitHub Actions with local policy discovery |
| `/xplanning` | AI-assisted project planning with roadmaps, estimation, and risk analysis |
| `/xpolicy` | Generate, validate, and test IAM policies with automated policy creation and best practices enforcement |
| `/xproduct` | Product management and strategic planning tools for feature development and product lifecycle management |
| `/xrisk` | Comprehensive risk assessment and mitigation across technical, security, and operational domains |
| `/xstakeholder-updates` | Generate stakeholder update emails from recently completed tasks in any supported issue tracker |
| `/xtrace` | Comprehensive traceability tracking and analysis for SpecDriven AI development with end-to-end requirement tracking |
| `/xux` | User experience optimization, frontend testing, and accessibility compliance with SpecDriven AI methodology integration |
<!-- END:COMMANDS -->

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
6. **Update documentation**: Run `bash scripts/generate-command-docs.sh update` to regenerate README.md and CLAUDE.md

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
