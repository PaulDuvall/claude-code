# Claude Code Custom Commands

![GitHub Actions](https://github.com/PaulDuvall/claude-code/actions/workflows/test.yml/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/@paulduvall%2Fclaude-dev-toolkit.svg)](https://www.npmjs.com/package/@paulduvall/claude-dev-toolkit)
![Claude Code](https://img.shields.io/badge/Claude%20Code-compatible-blue)
![Active Commands](https://img.shields.io/badge/active%20commands-13-blue)
![Experimental Commands](https://img.shields.io/badge/experimental%20commands-45-orange)
![Total Commands](https://img.shields.io/badge/total%20commands-58-brightgreen)
![Sub-agents](https://img.shields.io/badge/sub--agents-25-purple)

**Transform Claude Code into a complete development platform** with 58 AI-powered commands that automate your entire software development workflow. Now with improved git identity management!

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

## Quick Start

### 🚀 Get Started in 30 Seconds (NPM Installation)

```bash
# 1. Install Claude Code (if you haven't already)
npm install -g @anthropic-ai/claude-code

# 2. Install Claude Dev Toolkit via NPM
npm install -g @paulduvall/claude-dev-toolkit

# 3. Deploy commands to Claude Code
claude-commands install --active    # Install 13 core commands
# OR
claude-commands install --all       # Install all 58 commands

# 4. Configure Claude Code settings (Recommended)
claude-commands config --list                        # List available templates
claude-commands config --template basic-settings.json   # Apply basic config
# OR
claude-commands config --template security-focused-settings.json  # Enhanced security
# OR  
claude-commands config --template comprehensive-settings.json     # Full features

# 5. Install AI subagents (Optional)
claude-commands subagents --install     # Install 25 specialized AI subagents

# 6. Start using AI-powered development commands
claude
/xtest          # Run all tests intelligently
/xquality       # Check and fix code quality issues
/xsecurity      # Scan for security vulnerabilities
/xgit           # Automated git workflow with smart commits
```

### 🔧 Alternative: Manual Installation (Development)

For contributing or customization:

```bash
# Clone and setup this repository
git clone https://github.com/PaulDuvall/claude-code.git
cd claude-code
./setup.sh

# Access debug specialist and experimental commands
@debug-specialist # Access AI debugging specialist
./deploy.sh --experiments # Enable 44 experimental commands
```

**That's it!** You now have 13 powerful AI development commands + intelligent subagents available in any project.

## Core Commands (Always Available)

Once installed, these 13 essential commands work in **any project** on your machine:

### 💻 **Daily Development**
- **`/xtest`** - Smart test runner (detects framework, runs all tests)
- **`/xquality`** - Code quality checks (format, lint, type-check)
- **`/xquality fix`** - Auto-fix common quality issues
- **`/xgit`** - Automated git workflow with AI-generated commit messages

### 🔒 **Security & Quality**
- **`/xsecurity`** - Comprehensive security scanning (secrets, vulnerabilities)
- **`/xrefactor`** - Intelligent code refactoring and smell detection
- **`/xdebug`** - AI-powered debugging assistant with persistent context

### 🏗️ **Architecture & Planning**
- **`/xarchitecture`** - System design and architecture analysis
- **`/xspec`** - Requirements and specification generation
- **`/xdocs`** - Documentation generation and maintenance

### 🚀 **DevOps & Deployment**
- **`/xpipeline`** - CI/CD pipeline optimization and management
- **`/xrelease`** - Release management and deployment automation
- **`/xconfig`** - Configuration management and environment setup


### ℹ️ **Getting Help**
Every command includes built-in help:
```bash
/xtest help         # Show all testing options
/xquality help      # Show quality check options
/xsecurity help     # Show security scanning options
/xconfig help       # Show configuration options
```

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

### 🔒 Hybrid Hook Architecture
**NEW**: Lightweight trigger scripts that delegate to AI subagents:

```bash
# Automatic security analysis before file changes
CLAUDE_TOOL="Edit" ./hooks/pre-write-security.sh

# Quality checks before git commits  
./hooks/pre-commit-quality.sh

# Automatic debugging assistance on errors
./hooks/on-error-debug.sh "ImportError: No module named 'requests'"
```

**Hybrid Approach Benefits:**
- **Immediate Response**: Lightweight bash triggers (30-150 lines each)
- **AI Intelligence**: Complex analysis delegated to specialized subagents
- **Simplified Maintenance**: Replaced 253-line monolithic script with focused triggers
- **Clear Delegation**: Structured context passed to appropriate subagents

**Available Trigger Scripts:**
```bash
hooks/pre-write-security.sh      # → security-auditor subagent
hooks/pre-commit-quality.sh      # → style-enforcer subagent  
hooks/on-error-debug.sh          # → debug-specialist subagent
hooks/subagent-trigger-simple.sh # → any subagent (flexible)
```

**Claude Code Integration:**
```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Edit|Write|MultiEdit",
      "hooks": [{
        "command": "~/.claude/hooks/pre-write-security.sh",
        "blocking": true
      }]
    }]
  }
}
```

**Architecture Foundation:**
- **8 Modular Libraries**: Shared utilities in `hooks/lib/` for consistency
- **Security First**: Input validation, credential detection, audit trails  
- **Production Ready**: Error recovery, comprehensive logging, timeout handling
- **Easy Extension**: Simple patterns for creating domain-specific triggers

### 📊 Experimental Commands (44 Additional)
Advanced commands for specialized workflows:
- **Planning & Analytics**: `/xplanning`, `/xanalytics`, `/xmetrics`
- **Infrastructure**: `/xinfra`, `/xmonitoring`, `/xaws`  
- **Compliance**: `/xcompliance`, `/xgovernance`, `/xpolicy`
- **Advanced Security**: `/xred`, `/xrisk`, `/xscan`
- **Performance**: `/xperformance`, `/xoptimize`

Deploy with: `./deploy.sh --experiments`

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
claude-commands install --active       # Install 13 core commands
claude-commands install --experimental # Install 44 experimental commands
claude-commands install --all          # Install all 58 commands

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
/xhelp    # List all available commands
```

**Quick one-liner without global install:**
```bash
npx @paulduvall/claude-dev-toolkit
```

**Uninstall:**
```bash
# Uninstall the package (removes everything)
npm uninstall -g @paulduvall/claude-dev-toolkit
```

### 🚀 **Development Setup (For Contributors)**
```bash
git clone https://github.com/PaulDuvall/claude-code.git
cd claude-code
./setup.sh                           # Basic setup with 13 core commands + subagents
./setup.sh --setup-type security     # Includes security hooks
./setup.sh --setup-type comprehensive # All commands + all subagents + security
./setup.sh --skip-subagents          # Skip subagent deployment
```

### ⚙️ **Manual Setup**
```bash
./deploy.sh                   # Deploy core commands only
./deploy.sh --experiments     # Deploy experimental commands  
./deploy.sh --all            # Deploy all 58 commands
./deploy-subagents.sh         # Deploy subagents separately
./deploy-subagents.sh --all   # Deploy all available subagents
```

### 🔧 **Troubleshooting**
```bash
./verify-setup.sh            # Diagnose installation issues
./validate-commands.sh       # Validate command integrity
ls ~/.claude/commands/x*.md  # List installed commands
```

**Common Issues:**
- Commands not recognized? Restart Claude Code: `claude`
- Permission errors? Re-run: `./setup.sh`
- Need help? Each command has built-in help: `/xtest help`

## Repository Structure

- **`slash-commands/active/`** - 13 production-ready commands (deployed by default)
- **`slash-commands/experiments/`** - 44 experimental/conceptual commands  
- **`sub-agents/`** - AI specialist subagents with persistent context
- **`hooks/`** - Hybrid hook architecture with lightweight triggers
  - **Lightweight Trigger Scripts** (30-150 lines each):
    - `pre-write-security.sh` - Security analysis → security-auditor subagent
    - `pre-commit-quality.sh` - Quality checks → style-enforcer subagent
    - `on-error-debug.sh` - Error analysis → debug-specialist subagent  
    - `subagent-trigger-simple.sh` - General-purpose subagent trigger
  - **`lib/`** - Modular foundation (8 specialized modules):
    - `config-constants.sh` - Configuration constants and validation
    - `file-utils.sh` - Secure file operations and path validation  
    - `error-handler.sh` - Standardized error handling and logging
    - `context-manager.sh` - Context gathering and management
    - `argument-parser.sh` - CLI argument parsing with validation
    - `subagent-discovery.sh` - Subagent discovery and enumeration
    - `subagent-validator.sh` - Comprehensive subagent validation
    - `execution-engine.sh` - Advanced execution patterns (for complex scenarios)
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

### Command Development
1. Create new commands in `slash-commands/active/` or `slash-commands/experiments/`
2. Validate with `./validate-commands.sh`
3. Test locally with `./deploy.sh --include yourcommand`
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
