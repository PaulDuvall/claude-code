# Claude Code Custom Commands

A comprehensive collection of 50+ custom slash commands for Claude Code that accelerate software development workflows through AI-powered automation.

## Overview

These commands provide intelligent automation for every stage of the software development lifecycle, from planning and architecture to deployment and monitoring. Each command leverages AI to analyze your codebase and provide contextual assistance.

## Quick Start

Deploy all commands locally:

```bash
./deploy.sh
```

This copies all command files from `claude-commands/` to `~/.claude/commands/`, making them available as slash commands in Claude Code.

## Complete Command Reference

### 🎯 Planning & Strategy
- **`/xplanning`** - AI-assisted project planning with roadmaps, estimation, and risk analysis
- **`/xproduct`** - Product management with feature planning and user story generation
- **`/xrisk`** - Risk assessment and mitigation planning

### 🏗️ Architecture & Design
- **`/xarchitecture`** - System architecture design and analysis with proven patterns
- **`/xdesign`** - Software design patterns and architectural decisions
- **`/xconstraints`** - Design constraint analysis and trade-off evaluation

### 📋 Requirements & Specifications
- **`/xspec`** - Requirements specification with ATDD/BDD integration
- **`/xatomic`** - Atomic task decomposition and user story breakdown
- **`/xvalidate`** - Specification validation and requirement traceability

### 💻 Development & Code Quality
- **`/xrefactor`** - Interactive code refactoring with smell detection
- **`/xquality`** - Comprehensive code quality analysis with linting and type checking
- **`/xtdd`** - Test-driven development with automated test generation
- **`/xtest`** - Comprehensive testing with specification traceability
- **`/xcoverage`** - Code coverage analysis and reporting
- **`/xdebug`** - Advanced debugging assistance and error analysis
- **`/xtrace`** - Code tracing and execution flow analysis

### 🔌 API & Integration
- **`/xapi`** - REST/GraphQL API design, implementation, and testing
- **`/xdb`** - Database design, optimization, and migration management
- **`/xaws`** - AWS services integration and cloud architecture

### 🔒 Security & Compliance
- **`/xsecurity`** - Security vulnerability scanning and remediation
- **`/xcompliance`** - Compliance checking and regulatory requirements
- **`/xpolicy`** - Policy enforcement and governance automation

### 🚀 CI/CD & Deployment
- **`/xacp`** - Automated Add, Commit, Push workflow with smart commit messages
- **`/xcicd`** - CI/CD pipeline setup and management
- **`/xpipeline`** - Build pipeline optimization and automation
- **`/xrelease`** - Release management and deployment automation
- **`/xworkflow`** - Workflow automation and process optimization

### 🏗️ Infrastructure & Operations
- **`/xinfra`** - Infrastructure as Code with Terraform/K8s management
- **`/xiac`** - Infrastructure automation and provisioning
- **`/xmonitoring`** - Application monitoring and observability setup
- **`/xobservable`** - Observability stack configuration
- **`/xmetrics`** - Performance metrics collection and analysis

### 🛠️ Configuration & Setup
- **`/xconfig`** - Configuration management and environment setup
- **`/xsetup`** - Project initialization and tooling setup
- **`/xtemplate`** - Code template generation and scaffolding
- **`/xgenerate`** - Automated code generation and boilerplate

### 📊 Analysis & Optimization
- **`/xanalyze`** - Codebase analysis and technical debt assessment
- **`/xperformance`** - Performance profiling and optimization
- **`/xoptimize`** - Code and system optimization recommendations
- **`/xanalytics`** - Development analytics and insights

### 📚 Documentation & Knowledge
- **`/xdocs`** - Documentation generation and maintenance
- **`/xknowledge`** - Knowledge base creation and management
- **`/xfootnote`** - Documentation footnotes and references

### 🎨 User Experience & Interface
- **`/xux`** - User experience analysis and design recommendations
- **`/xdesign`** - UI/UX design patterns and best practices

### 🔄 Development Workflow
- **`/xcommit`** - Smart commit message generation
- **`/xsandbox`** - Isolated development environment setup
- **`/xgovernance`** - Development governance and standards
- **`/xmaturity`** - Process maturity assessment and improvement

### 🚨 Incident & Operations
- **`/xincident`** - Incident response and troubleshooting
- **`/xreadiness`** - Production readiness assessment
- **`/xred`** - Red team security testing
- **`/xgreen`** - Green deployment and environment management

### 🔍 Code Intelligence
- **`/xscan`** - Comprehensive codebase scanning and analysis
- **`/xrules`** - Custom rule definition and enforcement
- **`/xevaluate`** - Code evaluation and quality scoring

## Typical Builder Workflow

Here's a comprehensive workflow showing how builders can use these commands throughout the development lifecycle:

### 1. Project Initialization (New Project)
```bash
# Set up new project structure and tooling
/xsetup --project-type web-app --framework react-typescript

# Generate project templates and boilerplate
/xtemplate --type fullstack --database postgresql

# Initialize CI/CD pipeline
/xcicd --init github --stages "build,test,deploy"
```

### 2. Planning & Architecture (Every Sprint/Feature)
```bash
# Create project roadmap and estimates
/xplanning --roadmap --epic "user-authentication" --estimate

# Design system architecture
/xarchitecture --design --pattern microservices --database-per-service

# Create detailed specifications
/xspec --feature "user-login" --gherkin --acceptance-criteria
```

### 3. Development Workflow (Daily)
```bash
# Start with TDD approach
/xtdd --component AuthService --test-first

# Implement APIs with full documentation
/xapi --design --openapi --generate --test

# Ensure code quality throughout development
/xquality --ruff --mypy --fix

# Refactor code when needed
/xrefactor --analyze --bloaters --fix
```

### 4. Security & Compliance (Weekly)
```bash
# Run comprehensive security scans
/xsecurity --secrets --dependencies --code

# Check compliance requirements
/xcompliance --gdpr --sox --audit

# Review security policies
/xpolicy --security --access-control --review
```

### 5. Testing & Validation (Before Each Release)
```bash
# Execute comprehensive test suite
/xtest --coverage --integration --performance

# Validate against specifications
/xvalidate --requirements --traceability

# Analyze test coverage gaps
/xcoverage --report --gaps --improve
```

### 6. Performance & Optimization (Monthly)
```bash
# Profile application performance
/xperformance --profile --bottlenecks --database

# Optimize code and infrastructure
/xoptimize --code --database --infrastructure

# Monitor system metrics
/xmetrics --dashboard --alerts --trends
```

### 7. Deployment & Operations (Per Release)
```bash
# Automated git workflow
/xacp  # Stages, commits with smart messages, and pushes

# Deploy through pipeline
/xpipeline --deploy staging --promote production

# Set up monitoring and observability
/xmonitoring --setup --alerts --dashboards

# Verify production readiness
/xreadiness --checklist --smoke-tests
```

### 8. Maintenance & Improvement (Ongoing)
```bash
# Analyze technical debt
/xanalyze --debt --complexity --dependencies

# Generate and update documentation
/xdocs --api --architecture --runbooks

# Assess process maturity
/xmaturity --devops --security --quality
```

## Command Categories by Use Case

### For New Developers
Start with: `/xsetup`, `/xtemplate`, `/xdocs`, `/xknowledge`

### For Code Quality Focus
Use: `/xquality`, `/xrefactor`, `/xcoverage`, `/xtest`, `/xvalidate`

### For Security-First Development
Essential: `/xsecurity`, `/xcompliance`, `/xpolicy`, `/xred`

### For Performance-Critical Applications
Leverage: `/xperformance`, `/xoptimize`, `/xmetrics`, `/xmonitoring`

### For DevOps Engineers
Focus on: `/xcicd`, `/xinfra`, `/xpipeline`, `/xrelease`, `/xobservable`

### For Product Teams
Utilize: `/xplanning`, `/xproduct`, `/xux`, `/xanalytics`

## Advanced Usage Patterns

### Continuous Integration Workflow
```bash
# In your CI pipeline
/xtest --coverage --report
/xquality --all --baseline
/xsecurity --scan --report
/xcompliance --validate --audit
```

### Code Review Workflow
```bash
# Before code review
/xrefactor --analyze --recommendations
/xquality --check --report
/xdocs --update --api

# After feedback
/xvalidate --requirements --traceability
```

### Production Deployment Workflow
```bash
# Pre-deployment checks
/xreadiness --production --checklist
/xsecurity --final-scan
/xperformance --load-test

# Post-deployment
/xmonitoring --verify --alerts
/xmetrics --baseline --dashboard
```

## Installation & Development

### Quick Setup
```bash
git clone <repository>
cd claude-code-commands
./deploy.sh
```

### Development Workflow
1. **Create new commands** in the `claude-commands/` directory as `.md` files
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