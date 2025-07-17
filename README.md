# Claude Code Custom Commands

A comprehensive collection of custom slash commands for Claude Code that accelerate software development workflows through AI-powered automation.

## Overview

**This repository contains extensions FOR Claude Code, not Claude Code itself.** These custom commands extend the functionality of Anthropic's Claude Code CLI tool, providing intelligent automation for every stage of the software development lifecycle, from planning and architecture to deployment and monitoring. Each command leverages AI to analyze your codebase and provide contextual assistance.

### Project Structure

The repository is organized into three main categories:
- **`slash-commands/active/`** - 15 essential commands for daily development workflows
- **`slash-commands/experiments/`** - 38+ specialized commands for advanced use cases
- **`hooks/`** - Enterprise governance hooks for security, compliance, and workflow automation
- **`docs/`** - Comprehensive documentation including the complete hooks system specification

## Prerequisites

**You must have Claude Code installed and configured before using these custom commands.**

If you don't have Claude Code installed yet:

```bash
# Install Claude Code globally
npm install -g @anthropic-ai/claude-code

# Set your API key
export ANTHROPIC_API_KEY='sk-ant-...'
```

For detailed Claude Code installation and configuration, see [Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code).

## Quick Start

### 1. Deploy Custom Commands

Deploy the 15 essential commands to your Claude Code installation:

```bash
./deploy.sh
```

This copies essential command files from `slash-commands/active/` to `~/.claude/commands/`, making them available as slash commands in Claude Code.

### 2. Optional: Configure Claude Code (Convenience Script)

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

### 3. Enable Enterprise Hooks (Optional)

For enterprise-grade governance and security, enable the hooks system:

```bash
# Copy security hook to Claude Code hooks directory
cp hooks/prevent-credential-exposure.sh ~/.claude/hooks/

# Make executable
chmod +x ~/.claude/hooks/prevent-credential-exposure.sh

# Configure in ~/.claude/settings.json (see hooks/README.md for details)
```

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
- **`/xquality`** - Comprehensive code quality analysis with linting and type checking
- **`/xtdd`** - Test-driven development with automated test generation
- **`/xtest`** - Comprehensive testing with specification traceability
- **`/xdebug`** - Advanced debugging assistance and error analysis

### 🔒 Security & Compliance
- **`/xsecurity`** - Security vulnerability scanning and remediation

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
/xquality --ruff --mypy --fix

# Refactor code when needed
/xrefactor --analyze --bloaters --fix

# Debug issues as they arise
/xdebug --analyze --trace --fix
```

### 3. Security & Testing (Weekly)
```bash
# Run comprehensive security scans
/xsecurity --secrets --dependencies --code

# Execute comprehensive test suite
/xtest --coverage --integration --performance
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
Use: `/xquality`, `/xrefactor`, `/xtest`, `/xtdd`

### For Security-First Development
Essential: `/xsecurity`, `/xtest`, `/xquality`

### For DevOps Engineers
Focus on: `/xcicd`, `/xpipeline`, `/xrelease`, `/xconfig`

### For Product Teams
Utilize: `/xplanning`, `/xspec`, `/xarchitecture`

### For Daily Development
Core workflow: `/xacp`, `/xtest`, `/xquality`, `/xdebug`, `/xrefactor`

## Advanced Usage Patterns

### Continuous Integration Workflow
```bash
# In your CI pipeline
/xtest --coverage --report
/xquality --all --baseline
/xsecurity --scan --report
```

### Code Review Workflow
```bash
# Before code review
/xrefactor --analyze --recommendations
/xquality --check --report
/xdocs --update --api

# After feedback
/xtest --validate --requirements
```

### Production Deployment Workflow
```bash
# Pre-deployment checks
/xsecurity --final-scan
/xtest --integration --smoke
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

# Install and configure Claude Code
npm install -g @anthropic-ai/claude-code
export ANTHROPIC_API_KEY='sk-ant-...'

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
2. **Test locally** by running `./deploy.sh` and using the command in Claude Code
3. **Follow the established patterns** for command structure and documentation
4. **Commit and share** improvements with the team

### Command Structure
Each command follows this pattern:
- YAML frontmatter with description and tags
- Usage examples and parameter documentation
- Implementation logic with bash commands and AI prompts
- Integration points with other commands
- Output formatting and reporting

## Enterprise Hooks System

This repository includes a next-generation **Claude Code Hooks System** that transforms AI-assisted development into an enterprise-grade platform with comprehensive governance, security, and integration capabilities.

### Current Implementation

The `/hooks/` directory contains production-ready security hooks:

- **`prevent-credential-exposure.sh`**: Enterprise-grade security hook that prevents accidental credential exposure in AI-generated code
  - Detects 15+ credential patterns (API keys, tokens, passwords, private keys)
  - Blocks dangerous operations with detailed warnings and audit trails
  - Security team notifications via webhooks
  - Emergency override capability for authorized users

### Future Vision: Three-Tier Enterprise Platform

Our roadmap transforms Claude Code into a comprehensive enterprise AI development platform:

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

See [`docs/claude-code-hooks-system.md`](docs/claude-code-hooks-system.md) for the complete enterprise hooks system specification.

## Integration with Development Tools

These commands integrate seamlessly with:
- **Git** workflows and commit automation
- **CI/CD** pipelines (GitHub Actions, GitLab CI, Jenkins)
- **Testing** frameworks (pytest, Jest, etc.)
- **Code quality** tools (ruff, mypy, ESLint)
- **Security** scanners and compliance tools
- **Infrastructure** tools (Terraform, Kubernetes, Docker)
- **Monitoring** platforms (Prometheus, Grafana)
- **Enterprise Hooks**: Real-time governance and policy enforcement

## Contributing

1. **Add new commands** following the existing patterns
2. **Develop enterprise hooks** for governance and automation
3. **Update documentation** when adding new functionality
4. **Test thoroughly** before sharing
5. **Follow security best practices** for all defensive tooling

### Hook Development

Contributing to the hooks ecosystem:
1. **Security First**: All hooks must enhance security, never compromise it
2. **Enterprise Grade**: Focus on scalable, auditable, production-ready solutions
3. **Integration Patterns**: Ensure hooks work seamlessly with existing development tools
4. **Documentation**: Comprehensive docs with configuration examples and troubleshooting

## Vision: AI Development Governance Platform

This repository represents the future of AI-assisted development - a platform that combines the power of AI with enterprise-grade governance, security, and observability. By implementing the hooks system, organizations can:

- **Maintain Control**: Deterministic governance over AI development processes
- **Ensure Security**: Real-time protection against AI-generated security vulnerabilities
- **Enable Scale**: Automated workflows that grow with your organization
- **Provide Visibility**: Complete audit trails and analytics for AI development ROI

The command collection and hooks system together transform Claude Code into a comprehensive development platform that guides teams through best practices while automating repetitive tasks and ensuring consistent quality, security, and compliance across all projects.