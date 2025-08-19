# Claude Code Custom Commands

![GitHub Actions](https://github.com/PaulDuvall/claude-code/actions/workflows/test.yml/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Claude Code](https://img.shields.io/badge/Claude%20Code-compatible-blue)
![Active Commands](https://img.shields.io/badge/active%20commands-13-blue)
![Experimental Commands](https://img.shields.io/badge/experimental%20commands-44-orange)
![Total Commands](https://img.shields.io/badge/total%20commands-57-brightgreen)
![Sub-agents](https://img.shields.io/badge/sub--agents-1-purple)

**Transform Claude Code into a complete development platform** with 57 AI-powered commands that automate your entire software development workflow.

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
npm install -g claude-dev-toolkit

# 3. Start using AI-powered development commands immediately
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

### 🔒 Security Hooks System
Automated governance and security enforcement:
- **Real-time Protection**: Prevents credential exposure in AI-generated code
- **Audit Trails**: Complete logging of all AI actions and decisions  
- **Policy Enforcement**: Automated compliance checking
- **Production Ready**: Enterprise-grade security monitoring

### 📊 Experimental Commands (44 Additional)
Advanced commands for specialized workflows:
- Planning & Analytics: `/xplanning`, `/xanalytics`, `/xmetrics`
- Infrastructure: `/xinfra`, `/xmonitoring`, `/xaws`  
- Compliance: `/xcompliance`, `/xgovernance`, `/xpolicy`

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
# Global installation - works everywhere
npm install -g claude-dev-toolkit

# Commands are immediately available in Claude Code
claude
/xhelp    # List all available commands
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
./deploy.sh --all            # Deploy all 57 commands
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
- **`hooks/`** - Security hooks for governance and compliance
- **`templates/`** - Configuration templates for different use cases
- **`specs/`** - Command specifications and validation framework

## Contributing

1. Create new commands in `slash-commands/active/` or `slash-commands/experiments/`
2. Validate with `./validate-commands.sh`
3. Test locally with `./deploy.sh --include yourcommand`
4. Follow existing patterns and security best practices

---

**Transform your development workflow with AI.** Get started in 2 minutes with intelligent automation for testing, quality, security, and deployment.
