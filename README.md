# Claude Code Custom Commands

A comprehensive collection of custom slash commands for Claude Code that accelerate software development workflows through AI-powered automation.

## Overview

**This repository contains extensions FOR Claude Code, not Claude Code itself.** These custom commands extend the functionality of Anthropic's Claude Code CLI tool, providing intelligent automation for every stage of the software development lifecycle, from planning and architecture to deployment and monitoring. Each command leverages AI to analyze your codebase and provide contextual assistance.

### Project Structure

The repository is organized into four main categories:
- **`slash-commands/active/`** - 15 essential commands for daily development workflows
- **`slash-commands/experiments/`** - 38+ specialized commands for advanced use cases
- **`hooks/`** - Security hooks for governance, compliance, and workflow automation
- **`specs/`** - Command specifications and validation framework
- **`docs/`** - Comprehensive documentation including the complete hooks system specification

## Prerequisites

**You must have Claude Code installed and configured before using these custom commands.**

### Install Claude Code

```bash
# Install Claude Code globally
npm install -g @anthropic-ai/claude-code
```

### Authentication Setup

Claude Code supports multiple authentication methods:

#### Option 1: Web-Based Authentication (Recommended)
Most users can authenticate through their browser:
1. Run `claude` for the first time
2. Follow the browser authentication prompts
3. If you're already logged into claude.ai (especially as a Pro user), it will automatically connect

#### Option 2: Manual API Key Setup
For programmatic use, CI/CD environments, or specific enterprise setups:
```bash
# Set your API key as an environment variable
export ANTHROPIC_API_KEY='sk-ant-...'
```

**Most users will use web-based authentication and won't need to manually set an API key.**

For detailed installation and configuration options, see [Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code).

## Quick Start

### 1. Validate Commands (Optional)

Validate command specifications and ensure quality standards:

```bash
./validate-commands.sh
```

This script creates a virtual environment, installs dependencies, and runs the command validation test suite to ensure all commands meet specifications.

### 2. Deploy Custom Commands

Deploy the 15 essential commands to your Claude Code installation:

```bash
./deploy.sh
```

This copies essential command files from `slash-commands/active/` to `~/.claude/commands/`, making them available as slash commands in Claude Code.

### 3. Optional: Configure Claude Code (Convenience Script)

This repository includes a convenience script for Claude Code configuration:

```bash
# Configure Claude Code for macOS/Windsurf (with security warnings)
./configure-claude-code.sh --dry-run  # Preview changes first
./configure-claude-code.sh             # Apply configuration
```

The `configure-claude-code.sh` script automates Claude Code setup with:
- ⚠️ **Security warnings** and backup mechanisms
- API key configuration and validation
- Windsurf IDE extension installation
- MCP server setup (Docker required)
- Trust settings and permissions
- Interactive mode with dry-run option

### 4. Enable Security Hooks (Optional)

For automated governance and security monitoring, enable the hooks system:

```bash
# Copy security hook to Claude Code hooks directory
cp hooks/prevent-credential-exposure.sh ~/.claude/hooks/

# Make executable
chmod +x ~/.claude/hooks/prevent-credential-exposure.sh

# Configure in ~/.claude/settings.json (see hooks/README.md for details)
```

**When Hooks Execute:**
- **Tool calls**: Triggered when Claude Code invokes tools like Bash, Edit, or Write
- **Code generation**: Activated when AI generates code that might contain sensitive information
- **File operations**: Executed before writing files or making changes to the codebase
- **Command execution**: Run when slash commands are invoked

The hooks system provides:
- 🔒 **Real-time Security**: Prevents credential exposure in AI-generated code
- 📊 **Audit Trails**: Complete logging of all AI actions and decisions
- 🛡️ **Policy Enforcement**: Automated compliance and governance
- 🔄 **Workflow Integration**: Seamless CI/CD and development tool integration

### Using Experimental Commands

**Note: Experimental commands are conceptual specifications, not fully implemented tools.**

The 38+ commands in `slash-commands/experiments/` are well-structured design documents that represent sophisticated frameworks for advanced development workflows. These are conceptual specifications that would require implementation to become functional commands.

To explore experimental commands:
- Review the `.md` files in `slash-commands/experiments/` to understand their potential capabilities
- Use them as blueprints for developing actual implementations
- Temporarily modify `deploy.sh` to use `slash-commands/experiments/` if you want to experiment with the conceptual frameworks

## Active Commands Reference

These 15 essential commands cover the core development workflow and are deployed by default:

### 🎯 Planning & Strategy
- **`/xplanning`** - AI-assisted project planning with roadmaps, estimation, and risk analysis

### 🏗️ Architecture & Design
- **`/xarchitecture`** - System architecture design and analysis with proven patterns

### 📋 Requirements & Specifications
- **`/xspec`** - Requirements specification with ATDD/BDD integration

### 💻 Development & Code Quality
- **`/xrefactor`** - Interactive code refactoring with smell detection
- **`/xquality`** - Code quality analysis with smart defaults (no parameters needed)
- **`/xtdd`** - Test-driven development with automated test generation
- **`/xtest`** - Test execution with intelligent defaults (runs all tests if no arguments)
- **`/xdebug`** - Advanced debugging assistance and error analysis

### 🔒 Security & Compliance
- **`/xsecurity`** - Security scanning with comprehensive defaults (no parameters needed)

### 🚀 CI/CD & Deployment
- **`/xacp`** - Automated Add, Commit, Push workflow with smart commit messages
- **`/xcicd`** - CI/CD pipeline setup and management
- **`/xpipeline`** - Build pipeline optimization and automation
- **`/xrelease`** - Release management and deployment automation

### 🛠️ Configuration & Setup
- **`/xconfig`** - Configuration management and environment setup

### 📚 Documentation & Knowledge
- **`/xdocs`** - Documentation generation and maintenance

### Additional Commands

38+ experimental and specialized commands are available in `slash-commands/experiments/` for advanced use cases including analytics, compliance, infrastructure, monitoring, and more.

**Important:** These experimental commands are conceptual specifications rather than working implementations. They represent sophisticated frameworks that would be valuable if implemented, but currently serve as design documents and blueprints for future development.

## Simple Usage Patterns

The active commands are designed with **smart defaults** and **simple usage patterns**:

### Basic Usage (No Parameters Needed)
```bash
/xquality    # Runs all quality checks (formatting, linting, type checking)
/xtest       # Runs all available tests
/xsecurity   # Runs comprehensive security scan
```

### Quick Actions (Single Word Arguments)
```bash
/xquality fix      # Auto-fix common quality issues
/xtest coverage    # Run tests with coverage analysis
/xtest unit        # Run unit tests only
/xsecurity secrets # Quick secret scan
/xsecurity deps    # Dependency vulnerability check
```

### Detailed Analysis (When You Need More Info)
```bash
/xquality report   # Detailed quality metrics and recommendations
```

**Design Philosophy:** Simple things should be simple, complex things should be possible. Most commands work perfectly with no parameters, while advanced options remain available when needed.

## Typical Builder Workflow

Here's a comprehensive workflow showing how builders can use the active commands throughout the development lifecycle:

### 1. Project Planning & Architecture
```bash
# Create project roadmap and estimates
/xplanning --roadmap --epic "user-authentication" --estimate

# Design system architecture
/xarchitecture --design --pattern microservices --database-per-service

# Create detailed specifications
/xspec --feature "user-login" --gherkin --acceptance-criteria
```

### 2. Development Workflow (Daily)
```bash
# Start with TDD approach
/xtdd --component AuthService --test-first

# Ensure code quality throughout development
/xquality         # Runs all quality checks by default
/xquality fix     # Auto-fix common issues

# Refactor code when needed
/xrefactor --analyze --bloaters --fix

# Debug issues as they arise
/xdebug --analyze --trace --fix
```

### 3. Security & Testing (Weekly)
```bash
# Run comprehensive security scans
/xsecurity        # Runs all security checks by default
/xsecurity secrets # Quick secret scan if needed

# Execute comprehensive test suite
/xtest            # Runs all available tests
/xtest coverage   # Include coverage analysis
```

### 4. Configuration & Documentation
```bash
# Manage project configuration
/xconfig --environment --secrets --validate

# Generate and update documentation
/xdocs --api --architecture --runbooks
```

### 5. CI/CD & Deployment (Per Release)
```bash
# Automated git workflow
/xacp  # Stages, commits with smart messages, and pushes

# Set up CI/CD pipeline
/xcicd --init github --stages "build,test,deploy"

# Deploy through pipeline
/xpipeline --deploy staging --promote production

# Manage releases
/xrelease --prepare --notes --deploy
```

## Command Categories by Use Case

### For New Developers
Start with: `/xconfig`, `/xdocs`, `/xplanning`

### For Code Quality Focus
Use: `/xquality`, `/xquality fix`, `/xrefactor`, `/xtest`, `/xtdd`

### For Security-First Development
Essential: `/xsecurity`, `/xtest coverage`, `/xquality`

### For DevOps Engineers
Focus on: `/xcicd`, `/xpipeline`, `/xrelease`, `/xconfig`

### For Product Teams
Utilize: `/xplanning`, `/xspec`, `/xarchitecture`

### For Daily Development
Core workflow: `/xacp`, `/xtest`, `/xquality`, `/xquality fix`, `/xdebug`, `/xrefactor`

## Advanced Usage Patterns

### Continuous Integration Workflow
```bash
# In your CI pipeline
/xtest coverage
/xquality report
/xsecurity
```

### Code Review Workflow
```bash
# Before code review
/xrefactor --analyze --recommendations
/xquality report
/xdocs --update --api

# After feedback
/xtest
```

### Production Deployment Workflow
```bash
# Pre-deployment checks
/xsecurity
/xtest
/xconfig --validate --production

# Deployment
/xpipeline --deploy production
/xrelease --finalize --notes
```

## Installation & Development

### Complete Setup

```bash
# Clone repository
git clone <repository>
cd claude-code-commands

# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Authenticate (web-based authentication will prompt automatically)
# Or set API key manually if needed: export ANTHROPIC_API_KEY='sk-ant-...'

# Validate commands (optional but recommended)
./validate-commands.sh

# Configure Claude Code (review script first!)
./configure-claude-code.sh --dry-run  # Preview changes
./configure-claude-code.sh             # Apply configuration

# Deploy custom commands
./deploy.sh
```

### Configuration Script Options

The `configure-claude-code.sh` script supports several modes:

```bash
# Safe preview mode (recommended first run)
./configure-claude-code.sh --dry-run

# Interactive mode with backups (default)
./configure-claude-code.sh

# Non-interactive with backups
./configure-claude-code.sh --non-interactive

# Force mode (skip all prompts - use with caution)
./configure-claude-code.sh --force

# Show help
./configure-claude-code.sh --help
```

**⚠️ Security Note:** Always review the configuration script before running it. It modifies system configurations and handles API keys.

### Development Workflow
1. **Create new commands** in the `slash-commands/active/` directory as `.md` files (for essential commands) or `slash-commands/experiments/` (for specialized commands)
2. **Validate commands** by running `./validate-commands.sh` to ensure compliance with specifications
3. **Test locally** by running `./deploy.sh` and using the command in Claude Code
4. **Follow the established patterns** for command structure and documentation
5. **Commit and share** improvements with the team

### Command Structure & Validation

Each command follows this pattern:
- YAML frontmatter with description and tags
- Usage examples and parameter documentation
- Implementation logic with bash commands and AI prompts
- Integration points with other commands
- Output formatting and reporting

Commands must comply with specifications defined in `specs/`:
- **`specs/command-specifications.md`** - Executable specifications with test traceability
- **`specs/custom-command-specifications.md`** - Comprehensive development guidelines
- **`specs/tests/test_command_validation.py`** - Automated validation test suite

Run `./validate-commands.sh` to ensure all commands meet quality and security standards.

## Security Hooks System

This repository includes a **Claude Code Hooks System** that adds automated governance, security monitoring, and integration capabilities to AI-assisted development workflows.

### Current Implementation

The `/hooks/` directory contains production-ready security hooks:

- **`prevent-credential-exposure.sh`**: Security hook that prevents accidental credential exposure in AI-generated code
  - Detects 15+ credential patterns (API keys, tokens, passwords, private keys)
  - Blocks dangerous operations with detailed warnings and audit trails
  - Security team notifications via webhooks
  - Emergency override capability for authorized users

### Future Vision: Three-Tier Development Platform

Our roadmap transforms Claude Code into a comprehensive AI development platform:

#### **Tier 1: AI Security & Governance**
- **AI Sandbox Enforcement**: Network isolation and credential protection
- **Prompt Injection Detection**: Real-time scanning and blocking of malicious prompts
- **Model Usage Governance**: Cost tracking, budget enforcement, usage analytics
- **Output Sanitization**: Comprehensive validation of AI-generated content
- **Bias Detection Framework**: Monitor AI outputs for bias patterns

#### **Tier 2: Development Workflow Integration**
- **Git Workflow Enforcement**: Branch naming, commit standards, PR requirements
- **CI/CD Pipeline Orchestration**: Automated build triggers and deployment gates
- **Issue Tracking Synchronization**: Link AI work to tickets, update project status
- **Environment Validation**: Ensure proper deployment targets and configurations
- **Compliance Policy Engine**: Automated GDPR, SOX, security policy enforcement

#### **Tier 3: Quality & Observability Framework**
- **Technical Debt Forecasting**: Analyze trends, predict maintenance costs
- **Atomic Task Validation**: Enforce 4-8 hour task sizing from AI development patterns
- **Specification-Driven Development**: Validate outputs against formal specifications
- **Observable AI Development**: Comprehensive logging, metrics, analytics
- **Progressive Enhancement Tracking**: Monitor incremental improvement patterns

### Business Value

- **Risk Reduction**: Automated security and compliance enforcement
- **Quality Improvement**: Consistent standards and automated validation
- **Cost Control**: Usage monitoring and budget enforcement
- **Productivity Gains**: Automated workflows and reduced manual processes
- **Audit Compliance**: Complete audit trails and governance documentation

See [`docs/claude-code-hooks-system.md`](docs/claude-code-hooks-system.md) for the complete hooks system specification.

## Integration with Development Tools

These commands integrate seamlessly with:
- **Git** workflows and commit automation
- **CI/CD** pipelines (GitHub Actions, GitLab CI, Jenkins)
- **Testing** frameworks (pytest, Jest, etc.)
- **Code quality** tools (ruff, mypy, ESLint)
- **Security** scanners and compliance tools
- **Infrastructure** tools (Terraform, Kubernetes, Docker)
- **Monitoring** platforms (Prometheus, Grafana)
- **Security Hooks**: Real-time governance and policy enforcement

## Contributing

1. **Add new commands** following the existing patterns
2. **Validate compliance** by running `./validate-commands.sh` before submitting
3. **Develop security hooks** for governance and automation
4. **Update documentation** when adding new functionality
5. **Test thoroughly** before sharing
6. **Follow security best practices** for all defensive tooling

### Hook Development

Contributing to the hooks ecosystem:
1. **Security First**: All hooks must enhance security, never compromise it
2. **Production Ready**: Focus on scalable, auditable, reliable solutions
3. **Integration Patterns**: Ensure hooks work seamlessly with existing development tools
4. **Documentation**: Comprehensive docs with configuration examples and troubleshooting

## Vision: AI Development Governance Platform

This repository represents the future of AI-assisted development - a platform that combines the power of AI with automated governance, security, and observability. By implementing the hooks system, organizations can:

- **Maintain Control**: Deterministic governance over AI development processes
- **Ensure Security**: Real-time protection against AI-generated security vulnerabilities
- **Enable Scale**: Automated workflows that grow with your organization
- **Provide Visibility**: Complete audit trails and analytics for AI development ROI

The command collection and hooks system together transform Claude Code into a comprehensive development platform that guides teams through best practices while automating repetitive tasks and ensuring consistent quality, security, and compliance across all projects.