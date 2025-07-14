# Claude Code Custom Commands

A comprehensive collection of custom slash commands for Claude Code that accelerate software development workflows through AI-powered automation.

## Overview

These commands provide intelligent automation for every stage of the software development lifecycle, from planning and architecture to deployment and monitoring. Each command leverages AI to analyze your codebase and provide contextual assistance.

### Project Structure

Commands are organized into two categories:
- **`slash-commands/active/`** - 15 essential commands for daily development workflows
- **`slash-commands/experiments/`** - 38+ specialized commands for advanced use cases

## Quick Start

Deploy active commands locally:

```bash
./deploy.sh
```

This copies essential command files from `slash-commands/active/` to `~/.claude/commands/`, making them available as slash commands in Claude Code.

### Using Experimental Commands

To use experimental commands, temporarily modify `deploy.sh` to use `slash-commands/experiments/` or copy specific experimental commands manually to `~/.claude/commands/`.

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

### Quick Setup
```bash
git clone <repository>
cd claude-code-commands
./deploy.sh
```

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

## Integration with Development Tools

These commands integrate seamlessly with:
- **Git** workflows and commit automation
- **CI/CD** pipelines (GitHub Actions, GitLab CI, Jenkins)
- **Testing** frameworks (pytest, Jest, etc.)
- **Code quality** tools (ruff, mypy, ESLint)
- **Security** scanners and compliance tools
- **Infrastructure** tools (Terraform, Kubernetes, Docker)
- **Monitoring** platforms (Prometheus, Grafana)

## Contributing

1. **Add new commands** following the existing patterns
2. **Update documentation** when adding new functionality
3. **Test thoroughly** before sharing
4. **Follow security best practices** for all defensive tooling

This command collection transforms Claude Code into a comprehensive development platform that guides teams through best practices while automating repetitive tasks and ensuring consistent quality across all projects.