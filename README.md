# Claude Code Custom Commands

![GitHub Actions](https://github.com/PaulDuvall/claude-code/actions/workflows/test.yml/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/@paulduvall%2Fclaude-dev-toolkit.svg)](https://www.npmjs.com/package/@paulduvall/claude-dev-toolkit)
![Claude Code](https://img.shields.io/badge/Claude%20Code-compatible-blue)
![Active Commands](https://img.shields.io/badge/active%20commands-17-blue)
![Experimental Commands](https://img.shields.io/badge/experimental%20commands-28-orange)
![Total Commands](https://img.shields.io/badge/total%20commands-45-brightgreen)
![Sub-agents](https://img.shields.io/badge/sub--agents-25-purple)

**Transform Claude Code into a complete development platform** with 45 AI-powered commands that automate your entire software development workflow. Now with improved git identity management!

## What This Does

This repository extends [Claude Code](https://claude.ai/code) with **custom slash commands** that provide intelligent automation for:

- ⚡ **Testing**: `/xtest` - Run tests, generate coverage reports, create test cases
- 🔍 **Code Quality**: `/xquality` - Format, lint, type-check with auto-fixes
- 🔒 **Security**: `/xsecurity` - Scan for vulnerabilities, secrets, security issues  
- 🏗️ **Architecture**: `/xarchitecture` - Design systems, analyze patterns
- 🚀 **Git Workflow**: `/xgit` - Automated commits with smart messages
- 🐛 **Debugging**: `/xdebug` - AI debugging assistant with persistent context
- 📚 **Documentation**: `/xdocs` - Generate and maintain documentation
- 🔧 **Refactoring**: `/xrefactor` - Intelligent code improvements

**Think of it like VS Code extensions** - but for Claude Code. These commands give Claude deep knowledge of development workflows and tools.

## 🔒 **Security Notice - Please Review Before Use**

**⚠️ IMPORTANT**: This is an open source tool that will execute commands on your system. For your security:

### **Before Installation:**
1. **🔍 Review the source code** - Examine the files you'll be running:
   - **NPM package source**: [`claude-dev-toolkit/`](./claude-dev-toolkit/) - The published package code
   - **Commands directory**: [`slash-commands/active/`](./slash-commands/active/) - All command implementations
   - **Hook scripts**: [`hooks/`](./hooks/) - Scripts that integrate with Claude Code events

2. **🛡️ Understand what runs**: Commands will:
   - Execute bash/shell commands on your system
   - Read and modify files in your projects  
   - Make git commits and pushes
   - Install dependencies and tools
   - Run tests and linting tools

3. **🔐 Verify authenticity**: 
   - Check the [commit history](https://github.com/PaulDuvall/claude-code/commits/main)
   - Review [GitHub Actions tests](https://github.com/PaulDuvall/claude-code/actions) 
   - Examine the [MIT License](./LICENSE)

### **Recommended Security Practices:**
- Start with individual commands, not bulk installation
- Test in a disposable/sandbox environment first
- Review any command with `/x[name] help` before using
- Monitor what files are created/modified
- Keep your git history clean for easy rollback

### **🐳 Devcontainer for Safe Autonomous Execution**

Want to run Claude with `--dangerously-skip-permissions` safely? Use Anthropic's official devcontainer approach:

```bash
# Set up devcontainer with network firewall and security isolation
./setup-devcontainer.sh

# Or use the slash command
/xdevcontainer

# Start container and run Claude with full autonomy (safe inside container)
devcontainer up --workspace-folder .
devcontainer exec --workspace-folder . claude --dangerously-skip-permissions
```

**Security features included:**
- **Network firewall**: Only allows api.anthropic.com, github.com, npmjs.org, pypi.org
- **Dropped capabilities**: `--cap-drop=ALL` prevents privileged operations
- **No privilege escalation**: `--security-opt=no-new-privileges`
- **Isolated filesystem**: No host mounts by default

**Setup options:**
```bash
./setup-devcontainer.sh --help              # Show all options
./setup-devcontainer.sh --dry-run           # Preview without creating files
./setup-devcontainer.sh --minimal           # Minimal tooling (Node, Git only)
./setup-devcontainer.sh --strict            # CI mode - fail if prerequisites missing
./setup-devcontainer.sh --allow-domain X    # Add custom domain to firewall allowlist
```

**Enterprise support:**
```bash
# Add private registries via environment variable
DEVCONTAINER_EXTRA_DOMAINS="npm.company.com,registry.internal" ./setup-devcontainer.sh
```

See our [Devcontainer Guide](./docs/devcontainer-guide.md) for complete documentation, or [Anthropic's official docs](https://docs.anthropic.com/en/docs/claude-code/devcontainer).

**This tool is provided as-is under MIT License. Use at your own discretion.**

## Quick Start

### 🚀 Get Started in 30 Seconds (NPM Installation)

> **Security First**: Review the [Security Notice](#-security-notice---please-review-before-use) above before installation

```bash
# 1. Install Claude Code (if you haven't already)
npm install -g @anthropic-ai/claude-code

# 2. Install Claude Dev Toolkit via NPM (review source first!)
npm install -g @paulduvall/claude-dev-toolkit

# 3. Deploy commands to Claude Code
claude-commands install --active    # Install 17 core commands
# OR
claude-commands install --all       # Install all 45 commands

# 4. Configure OIDC for GitHub Actions to AWS (NEW!)
claude-commands oidc --help         # Show OIDC configuration options
claude-commands oidc --dry-run      # Preview OIDC setup actions
claude-commands oidc --region us-west-2 --stack-name my-oidc  # Configure AWS OIDC

# 5. Configure Claude Code settings (Recommended)
claude-commands config --list                        # List available templates
claude-commands config --template basic-settings.json   # Apply basic config
# OR
claude-commands config --template security-focused-settings.json  # Enhanced security
# OR  
claude-commands config --template comprehensive-settings.json     # Full features

# 6. Install AI subagents (Optional)
claude-commands subagents --install     # Install 25 specialized AI subagents

# 7. Start using AI-powered development commands
claude
/xtest          # Run all tests intelligently
/xquality       # Check and fix code quality issues
/xsecurity      # Scan for security vulnerabilities
/xgit           # Automated git workflow with smart commits
```

### 🔧 Development and Customization

For contributing or accessing experimental features (⚠️ **Review source code first**!):

```bash
# Install development version with experimental commands
npm install -g @paulduvall/claude-dev-toolkit

# Install experimental commands (29 additional commands)
claude-commands install --experiments    # Experimental features
claude-commands install --all            # All 46 commands

# Access AI subagents for specialized tasks
claude-commands subagents --install      # 25 specialized AI assistants
```

**That's it!** You now have 17 powerful AI development commands + intelligent subagents available in any project.

## Core Commands (Always Available)

Once installed, these essential commands work in **any project** on your machine:

> **Source of truth:** [`slash-commands/active/`](./slash-commands/active/) — run `bash scripts/generate-command-docs.sh update` to regenerate.

<!-- BEGIN:ACTIVE_COMMANDS -->
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
<!-- END:ACTIVE_COMMANDS -->

Every command includes built-in help: `/xtest help`, `/xquality help`, etc.

## Real-World Usage Examples

### Daily Development Workflow
```bash
# Check code quality and fix issues
/xquality           # Run all quality checks
/xquality fix       # Auto-fix formatting, imports, etc.

# Run tests with intelligent defaults  
/xtest              # Runs all tests automatically
/xtest coverage     # Include coverage analysis
/xtest unit         # Run only unit tests

# Security scanning
/xsecurity          # Comprehensive security scan
/xsecurity secrets  # Quick check for exposed credentials

# Automated git workflow
/xgit               # Stage, commit with AI message, and push
```

### Weekly Code Review Prep
```bash
# Comprehensive analysis before code review
/xrefactor --analyze         # Find code smells and improvement opportunities
/xquality report            # Detailed quality metrics
/xsecurity                  # Security vulnerability scan
/xdocs --update             # Update documentation
/xgit                       # Commit improvements
```

### Architecture and Planning
```bash
# Design system architecture
/xarchitecture --design --pattern microservices

# Create specifications
/xspec --feature "user-authentication" --gherkin

# Generate documentation
/xdocs --api --architecture
```

## Prerequisites

**You need Claude Code installed first:**

```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Authenticate (opens browser automatically)
claude
```

Most users authenticate via browser (no API key needed). See [Claude Code docs](https://docs.anthropic.com/en/docs/claude-code) for details.

## Advanced Features

### 🤖 AI Sub-Agents
**Debug Specialist** - Persistent debugging assistant for complex issues:
```bash
# Simple debugging handled by /xdebug command
/xdebug "ImportError: No module named 'requests'"

# Complex issues automatically route to specialist sub-agent  
@debug-specialist analyze this intermittent memory leak
@debug-specialist continuing our investigation from yesterday
```

**Features:**
- **Persistent Context**: Remembers previous debugging sessions
- **Root Cause Analysis**: Systematic investigation methodology
- **Multi-Language Support**: Python, JavaScript, Java, Go, and more
- **Performance Debugging**: Memory leaks, bottlenecks, optimization

### 🔒 Code Quality & Security Hooks

PostToolUse hooks that **block Claude from proceeding** when code violates quality or security thresholds. Claude fixes violations immediately, then continues. Based on the approach described in [Code Quality Gates: Using Claude Code Hooks to Block Code Smells on Every Write](https://www.paulmduvall.com/claude-code-hooks-code-quality-guardrails/).

#### Quick Setup

```bash
# Automated: creates symlinks, merges settings, verifies installation
bash setup-hooks.sh

# Preview what it will do (no changes made)
bash setup-hooks.sh --dry-run

# Remove hooks cleanly
bash setup-hooks.sh --uninstall
```

Requires Python 3.8+ and jq. Backs up `~/.claude/settings.json` before modifying.

#### What Gets Checked

**Code Smells** (PostToolUse on every Write/Edit via `check-complexity.py`):

| Metric | Default Limit | What It Catches |
|--------|--------------|-----------------|
| Cyclomatic complexity | 10 | Too many decision paths in a function |
| Function length | 20 lines | Functions doing too much |
| Nesting depth | 3 levels | Deep nesting that obscures control flow |
| Parameters per function | 4 | Functions that need decomposition |
| File length | 300 lines | Files that should be split |
| Duplicate blocks | 4+ lines, 2+ occurrences | Copy-paste code that belongs in a helper |

Language support:
- **Python**: Full AST analysis (all 6 checks) + ruff auto-fix
- **JavaScript/TypeScript**: Native token-based parser (all 6 checks, zero dependencies)
- **Go, Java, Rust, C/C++**: Via [Lizard](https://github.com/terryyin/lizard) (complexity, length, params)

**Security** (PostToolUse on every Write/Edit via `check-security.py`):
- **Secrets detection**: AWS keys, GitHub tokens, Stripe keys, OpenAI keys, private keys, credential URLs
- **Bandit-style checks** (Python): `eval`/`exec`, `shell=True`, pickle, hardcoded passwords, bare `except: pass`
- **Trojan source**: Unicode bidi overrides and zero-width characters (CVE-2021-42574)

**Commit Signing** (PreToolUse on Bash via `check-commit-signing.py`):
- Blocks unsigned `git commit` commands
- Provides GPG and SSH signing setup instructions

#### How It Works

When Claude writes or edits a file, the hook:
1. Parses the file using language-specific analysis (AST for Python, token parser for JS/TS)
2. Checks against thresholds
3. If violations found: returns `{"decision": "block", "reason": "..."}` with specific fix instructions
4. Claude refactors the code and retries -- the hook fires again on the new version
5. Once clean, Claude continues normally

#### Customizing Thresholds

Create `.smellrc.json` in your project root to override defaults per-project:

```json
{
  "thresholds": {
    "max_complexity": 15,
    "max_function_lines": 30,
    "max_nesting_depth": 4,
    "max_parameters": 5,
    "max_file_lines": 500,
    "duplicate_min_lines": 6
  },
  "security": {
    "enabled": true,
    "trojan_enabled": true
  },
  "suppress_files": ["*_test.py", "conftest.py", "migrations/*.py"]
}
```

#### Inline Suppression

Suppress specific violations on individual lines:

```python
# smell: ignore[complexity,long_function]
def necessarily_complex_state_machine():
    ...

# security: ignore[B101]
assert condition, "This assert is intentional"
```

Suppressions apply to the annotated line and the line immediately following.

#### Manual Setup (Alternative to setup-hooks.sh)

If you prefer to configure manually, add to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "python3 $HOME/.claude/hooks/check-complexity.py"
          },
          {
            "type": "command",
            "command": "python3 $HOME/.claude/hooks/check-security.py"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "python3 $HOME/.claude/hooks/check-commit-signing.py"
          }
        ]
      }
    ]
  }
}
```

Then symlink the hook files:

```bash
mkdir -p ~/.claude/hooks
for f in check-complexity.py check-security.py check-commit-signing.py \
         config.py suppression.py smell_types.py smell_python.py \
         smell_javascript.py smell_checks.py smell_ruff.py \
         security_checks.py security_secrets.py security_bandit.py \
         security_trojan.py; do
    ln -sf /path/to/claude-code/hooks/$f ~/.claude/hooks/$f
done
```

#### Subagent-Based Hooks (Additional)

Lightweight bash hooks that delegate analysis to AI subagents:

```bash
hooks/pre-write-security.sh      # Security analysis via subagent
hooks/pre-commit-quality.sh      # Quality analysis via subagent
hooks/on-error-debug.sh          # Debugging assistance via subagent
hooks/pre-commit-test-runner.sh  # Auto-detect and run tests before commits
hooks/verify-before-edit.sh      # Warn about placeholder/fabricated references
hooks/prevent-credential-exposure.sh  # Credential pattern scanning
```

### Experimental Commands

> **Source of truth:** [`slash-commands/experiments/`](./slash-commands/experiments/)

<!-- BEGIN:EXPERIMENTAL_COMMANDS -->
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
<!-- END:EXPERIMENTAL_COMMANDS -->

Deploy with: `claude-commands install --experiments`

## Why Use This?

### ⚡ **Instant Productivity**
- **Zero Configuration**: Commands work intelligently with any project
- **Smart Defaults**: No parameters needed for common tasks
- **Context Aware**: AI understands your codebase and suggests improvements

### 🧠 **AI-Powered Intelligence**  
- **Learns Your Patterns**: Adapts to your coding style and preferences
- **Cross-Language**: Works with Python, JavaScript, Go, Java, and more
- **Contextual Help**: Provides relevant suggestions based on your code

### 🔄 **Complete Workflow Integration**
- **Git Automation**: Smart commit messages, automated workflows
- **CI/CD Ready**: Commands integrate seamlessly with pipelines  
- **Security First**: Built-in security scanning and governance

### 🎯 **Enterprise Ready**
- **Compliance**: Automated policy enforcement and audit trails
- **Security Hooks**: Real-time protection against vulnerabilities
- **Scalable**: Works for individual developers and large teams

## Installation Options

### 📦 **NPM Installation (Recommended)**
```bash
# Install the toolkit globally
npm install -g @paulduvall/claude-dev-toolkit

# Install command sets
claude-commands install --active       # Install 17 core commands
claude-commands install --experiments # Install 28 experimental commands
claude-commands install --all          # Install all 45 commands

# Configuration management
claude-commands config --list          # List available templates
claude-commands config --template <name> # Apply configuration template
claude-commands config --help          # Show config command help

# Subagents management
claude-commands subagents --list        # List available subagents
claude-commands subagents --install     # Install subagents to Claude Code
claude-commands subagents --help        # Show subagents command help

# Check what's available
claude-commands list                   # List all available commands
claude-commands list --active          # List only active commands
claude-commands list --experimental    # List only experimental commands

# Check installation status
claude-commands status

# Commands are now available in Claude Code
claude
claude-commands list   # List all available commands
```

**Quick one-liner without global install:**
```bash
npx @paulduvall/claude-dev-toolkit install --all
```

**Uninstall:**
```bash
# Uninstall the package (removes everything)
npm uninstall -g @paulduvall/claude-dev-toolkit
```

### Development Setup (For Contributors)
```bash
git clone https://github.com/PaulDuvall/claude-code.git
cd claude-code/claude-dev-toolkit
npm install                          # Install dependencies
npm test                             # Run all tests
```

### Manual Setup
```bash
bash scripts/sync-to-npm.sh          # Sync source files to npm package
bash scripts/deploy-subagents.sh --all  # Deploy all subagents
```

### Troubleshooting
```bash
cd claude-dev-toolkit && npm test     # Validate package integrity
ls ~/.claude/commands/x*.md           # List installed commands
```

**Common Issues:**
- Commands not recognized? Restart Claude Code: `claude`
- Need help? Each command has built-in help: `/xtest help`

## Repository Structure

- **`slash-commands/active/`** - 17 production-ready commands (deployed by default)
- **`slash-commands/experiments/`** - 28 experimental commands  
- **`subagents/`** - AI specialist subagents with persistent context
- **`hooks/`** - Hybrid hook architecture with lightweight triggers
  - **Lightweight Trigger Scripts** (30-150 lines each):
    - `pre-write-security.sh` - Security analysis → security-auditor subagent
    - `pre-commit-quality.sh` - Quality checks → style-enforcer subagent
    - `on-error-debug.sh` - Error analysis → debug-specialist subagent  
    - `subagent-trigger.sh --simple` - General-purpose lightweight trigger
  - **`lib/`** - Modular foundation (12 specialized modules):
    - `config-constants.sh` - Configuration constants and validation
    - `file-utils.sh` - Secure file operations and path validation  
    - `error-handler.sh` - Standardized error handling and logging
    - `context-manager.sh` - Context gathering and management
    - `argument-parser.sh` - CLI argument parsing with validation
    - `subagent-discovery.sh` - Subagent discovery and enumeration
    - `subagent-validator.sh` - Comprehensive subagent validation
    - `execution-engine.sh` - Advanced execution patterns
    - `execution-simulation.sh` - Execution simulation
    - `execution-results.sh` - Result processing
    - `field-validators.sh` - Field validation
    - `validation-reporter.sh` - Validation reporting
- **`templates/`** - Configuration templates for different use cases
  - `subagent-hooks.yaml` - Event mapping configuration template
  - `hybrid-hook-config.yaml` - Hybrid architecture configuration guide
- **`tests/`** - Integration test suite for hook system
- **`specs/`** - Command specifications and validation framework
- **`docs/`** - Complete documentation including hook integration guide

## Technical Architecture

### Hybrid Hook Architecture
The hook system has evolved through two major architectural improvements:

**Phase 1: Monolithic → Modular (v1.0)**
- 333-line monolithic script → 8 specialized modules
- Eliminated god function antipattern and code smells
- Enhanced CLI, security, and error handling

**Phase 2: Complex → Hybrid (v2.0)**
- 253-line complex orchestration script → 4 lightweight trigger scripts  
- Bash complexity → AI-driven intelligence via subagent delegation
- Heavy orchestration → Simple context gathering and delegation

**Current Hybrid Architecture:**
- **4 lightweight triggers** (30-150 lines each) replacing complex bash logic
- **AI delegation** for complex analysis via specialized subagents
- **Preserved modular foundation** with 8 shared library modules
- **Immediate response** with intelligent analysis
- **Simplified maintenance** and easy extensibility

**Key Quality Improvements:**
- ✅ **Simplified Architecture**: 253-line complex script → 4 focused triggers (30-150 lines each)
- ✅ **AI-Driven Logic**: Replaced bash complexity with intelligent subagent delegation  
- ✅ **Immediate Response**: Lightweight triggers with structured context gathering
- ✅ **Preserved Foundation**: 8 modular libraries for consistency and reuse
- ✅ **Enhanced Security**: Comprehensive validation, credential detection, audit trails
- ✅ **Production Ready**: Error recovery, logging, timeout handling, compatibility
- ✅ **Easy Extension**: Simple patterns for creating domain-specific triggers

## Contributing

We welcome contributions! Key guidelines:

- **Conventional Commits**: We use semantic versioning with automated releases
- **Development Workflow**: Fork, branch, test, and submit PRs
- **Testing Requirements**: 100% of tests must pass before merging
- **Code Standards**: Security-first development practices

### Quick Contribution Steps

1. **Fork and clone** the repository
2. **Create a feature branch**: `git checkout -b feat/your-feature`
3. **Make changes** following existing command development patterns
4. **Write tests** for your changes
5. **Use conventional commits**: `git commit -m "feat(xcommand): add new feature"`
6. **Push and create PR** targeting the `main` branch

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/) for automated releases:

```bash
# New features (minor version bump)
git commit -m "feat(xapi): add REST API testing command"

# Bug fixes (patch version bump)
git commit -m "fix(xtest): correct coverage report path"

# Breaking changes (major version bump)
git commit -m "feat(core)!: change command parameter structure

BREAKING CHANGE: All commands now use --parameter format"
```

**Supported types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

### Automated Release Process

Releases are fully automated when commits are merged to `main`:

1. **Semantic-release** analyzes commit messages
2. **Version bump** determined automatically from commit types
3. **CHANGELOG.md** generated from commits
4. **GitHub release** created with release notes
5. **NPM package** published automatically
6. **Git tags** created for version tracking

Currently in **alpha** (0.0.x-alpha.y) until v1.0.0 production release.

### Command Development
1. Create new commands in `slash-commands/active/` or `slash-commands/experiments/`
2. Sync to npm: `bash scripts/sync-to-npm.sh`
3. Run tests: `cd claude-dev-toolkit && npm test`
4. Follow existing patterns and security best practices

### Hybrid Hook Development
1. **Lightweight Triggers**: Create focused trigger scripts (30-150 lines) following existing patterns
2. **Use Shared Libraries**: Leverage `hooks/lib/` modules for consistency and security
3. **AI Delegation**: Structure context and delegate complex logic to appropriate subagents
4. **Testing**: Support manual testing with environment variables (`CLAUDE_TOOL`, `CLAUDE_FILE`)
5. **Documentation**: Include usage examples and Claude Code integration patterns

**Example New Trigger**:
```bash
# hooks/my-custom-trigger.sh
source "$(dirname "$0")/lib/config-constants.sh"
source "$(dirname "$0")/lib/context-manager.sh"
# Gather context, delegate to subagent, provide clear user guidance
```

---

**Transform your development workflow with AI.** Get started in 2 minutes with intelligent automation for testing, quality, security, and deployment.
