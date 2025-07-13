# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Code Custom Commands is a comprehensive collection of 50+ custom slash commands for Claude Code that accelerate software development workflows through AI-powered automation. These commands provide intelligent automation for every stage of the software development lifecycle, from planning and architecture to deployment and monitoring.

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
├── deploy.sh                          # Deployment script for commands
├── claude-custom-commands.md          # Command reference guide
├── docs/                              # Documentation directory
│   └── custom-command-specifications.md  # Command specifications
└── slash-commands/                    # Command implementations
    ├── xacp.md                        # Automated Add, Commit, Push
    ├── xarchitecture.md               # Architecture design and analysis
    ├── xcicd.md                       # CI/CD pipeline setup
    ├── xsecurity.md                   # Security scanning and analysis
    ├── xtest.md                       # Testing automation
    ├── xquality.md                    # Code quality analysis
    └── [40+ other command files...]   # Complete command collection
```

## Command Categories

### 🎯 Planning & Strategy
- `/xplanning` - Project planning with roadmaps and estimation
- `/xproduct` - Product management and feature planning
- `/xrisk` - Risk assessment and mitigation

### 🏗️ Architecture & Design
- `/xarchitecture` - System architecture design with proven patterns
- `/xdesign` - Software design patterns and decisions
- `/xconstraints` - Design constraint analysis

### 💻 Development & Code Quality
- `/xrefactor` - Interactive code refactoring
- `/xquality` - Code quality analysis with linting
- `/xtdd` - Test-driven development automation
- `/xtest` - Comprehensive testing with traceability
- `/xcoverage` - Code coverage analysis
- `/xdebug` - Advanced debugging assistance

### 🔒 Security & Compliance
- `/xsecurity` - Security vulnerability scanning
- `/xcompliance` - Compliance checking
- `/xpolicy` - Policy enforcement and governance

### 🚀 CI/CD & Deployment
- `/xacp` - Automated Add, Commit, Push workflow
- `/xcicd` - CI/CD pipeline management
- `/xpipeline` - Build pipeline optimization
- `/xrelease` - Release management

### 🏗️ Infrastructure & Operations
- `/xinfra` - Infrastructure as Code management
- `/xmonitoring` - Application monitoring setup
- `/xmetrics` - Performance metrics collection

## Development Guidelines

### Command Structure

Each command in `slash-commands/` follows this pattern:

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
- ✅ Security vulnerability scanning and detection
- ✅ Code quality analysis and improvement
- ✅ Compliance checking and governance
- ✅ Defensive security automation
- ❌ Never create offensive security tools
- ❌ Never assist with malicious code or attacks

### Command Development Standards

1. **Documentation First**: Every command must have comprehensive documentation
2. **Parameter Validation**: Validate all inputs and provide clear error messages
3. **Security Focused**: Implement security best practices in all automation
4. **Idempotent Operations**: Commands should be safe to run multiple times
5. **Clear Output**: Provide structured, actionable feedback to users

### Testing Commands

```bash
# Deploy all commands locally
./deploy.sh

# Test a specific command in Claude Code
/xtest --help

# Verify command functionality
/xquality --check --report
```

### Adding New Commands

1. **Create command file** in `slash-commands/` directory as `.md` file
2. **Follow naming convention**: Use `x` prefix (e.g., `xnewfeature.md`)
3. **Include proper documentation** with description, usage, and examples
4. **Test thoroughly** before committing
5. **Update README.md** to include the new command in appropriate category

### Deployment Process

```bash
# Deploy all commands to Claude Code
./deploy.sh

# Verify deployment
ls ~/.claude/commands/

# Test commands in Claude Code interface
/xhelp  # List available commands
```

## Integration Patterns

Commands are designed to work together in workflows:

### Development Workflow
```bash
/xspec --feature "user-auth"        # Create specifications
/xtdd --component AuthService       # Implement with TDD
/xquality --ruff --mypy --fix      # Check code quality
/xsecurity --scan --report         # Security analysis
/xacp                              # Automated commit workflow
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
/xred --defensive-testing         # Defensive security testing
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

- **Command files**: Store in `slash-commands/` directory with `.md` extension
- **Documentation**: Update both README.md and relevant docs/ files
- **Deployment**: Use `./deploy.sh` to install commands locally
- **Testing**: Test commands in actual Claude Code environment

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