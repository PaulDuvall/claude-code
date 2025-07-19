# Claude Code: Advanced Tips Using Commands, Configuration, and Hooks

Eight weeks ago, I started using Claude Code. Today, I've transformed it into a comprehensive platform for AI-assisted development. Here's what I learned and built.

## Why Claude Code Is Different

Most AI coding tools live inside your IDE. Claude Code doesn't. It's a terminal application that works with your existing workflow. This flexibility is what makes it powerful—and what let me build something bigger.

## Getting Started Takes Minutes

```bash
npm install -g @anthropic-ai/claude-code
cd your-repo
claude
```

That's it. Now ask it questions:
- "What does this repo do?"
- "Find dead code"
- "What's the architecture here?"

But the real power comes from three concepts: Configuration, Slash Commands, and Hooks.

## The Three Concepts That Matter

### 1. Configuration: Control Everything

Claude Code's [configuration system](https://docs.anthropic.com/en/docs/claude-code/settings) determines what your AI can and can't do:

- **Trust Settings**: What Claude can access
- **File Permissions**: Read/write boundaries
- **Allowed Tools**: Enable specific capabilities
- **Authentication**: Web login (use this) or API keys for CI/CD

I started with ideas from [Patrick Debois](https://gist.github.com/jedi4ever/762ca6746ef22b064550ad7c04f3bd2f) and evolved them through real use.

### 2. Slash Commands: Automate Everything

Claude Code ships with 50+ built-in commands:
- `/init` - Project setup
- `/review` - Code feedback
- `/model` - Switch models for different tasks

But custom commands are where it gets interesting. These are markdown files in `.claude` directories. After losing work to filesystem issues, I now version control everything in my [Claude Code repository](https://github.com/PaulDuvall/claude-code).

### 3. Hooks: Govern Everything

Hooks are shell scripts that intercept Claude's operations before they execute. They examine the proposed action and can approve, modify, or block it. 

Example hook structure:
```bash
#!/usr/bin/env bash
set -euo pipefail

# File Logger Hook
HOOK_NAME="file-logger"
LOG_FILE="$HOME/.claude/logs/file-logger.log"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$HOOK_NAME] $*" | tee -a "$LOG_FILE"
}

main() {
    local tool_name="${CLAUDE_TOOL:-unknown}"
    local file_path="${CLAUDE_FILE:-unknown}"
    
    log "Hook triggered for tool: $tool_name on file: $file_path"
    
    # Always allow the operation to proceed
    exit 0
}

main "$@"
```

Place hooks in `.claude/hooks/` and they'll run automatically. They're your safety net—the difference between a toy and a production tool.

## My Implementation

I built [CLAUDE.md](https://github.com/PaulDuvall/claude-code/blob/main/CLAUDE.md) (inspired by [Paul Hammond](https://github.com/citypaul/.dotfiles/blob/main/claude/.claude/CLAUDE.md)) as Claude's reference guide. It contains:
- Project architecture
- Coding standards
- Team conventions
- Decision history

This context makes every AI suggestion better.

## 57 Custom Commands (And Counting)

I've built [14 active commands](https://github.com/PaulDuvall/claude-code/tree/main/slash-commands/active) for daily use, plus [43 experimental ones](https://github.com/PaulDuvall/claude-code/tree/main/slash-commands/experiments). I use an "x" prefix—it makes custom commands obvious at a glance. You can use whatever prefix works for you:

**Architecture & Design**
- `/xarchitecture` - System design with proven patterns

**Development & Quality**
- `/xtdd` - Test-driven development
- `/xquality` - Code analysis with smart defaults
- `/xrefactor` - Smell detection and fixes
- `/xdebug` - Advanced troubleshooting
- `/xtest` - Intelligent test automation
- `/xspec` - ATDD/BDD requirements

**Security & Compliance**
- `/xsecurity` - Vulnerability scanning

**DevOps & Automation**
- `/xcicd` - AWS reference architecture pipelines
- `/xpipeline` - Build optimization
- `/xrelease` - Release orchestration with rollback
- `/xacp` - Git workflow with smart commits

## Creating Your Own Slash Commands

Custom slash commands are just markdown files with a specific structure:

```markdown
---
name: xtest
description: Run intelligent tests
---

# System Prompt

You are a test automation expert. When the user runs /xtest:
1. Analyze the codebase for test coverage
2. Generate missing tests
3. Run test suite with appropriate flags

## Examples

When user types `/xtest coverage`, show coverage report.
When user types `/xtest generate`, create missing tests.
```

Save this in `.claude/commands/xtest.md` (local) or `~/.claude/commands/xtest.md` (global). Claude Code loads it automatically.

The key is clear instructions and examples. Claude follows what you write, so be specific about behavior.

## Deployment That Works

My deployment system copies custom commands to `~/.claude/commands/`, making them available in every project on your machine. Here's how it works:

```bash
# Deploy active commands (default) - copies to global directory
./deploy.sh

# Deploy experimental commands
./deploy.sh --experiments

# Deploy specific commands only
./deploy.sh --include xtest xquality

# Deploy everything
./deploy.sh --all
```

The script validates each command, backs up existing ones, and ensures proper permissions. Once deployed, these commands work in any repository—no per-project setup needed.

Example workflow:
```bash
# Test GitHub Actions locally before pushing
./deploy.sh --experiments --include xact
claude
/xact --install-deps  # Auto-install nektos/act and Docker
/xact                 # Test workflows locally
```

## Hooks That Demonstrate The System

My [file logger hook](https://github.com/PaulDuvall/claude-code/tree/main/hooks) shows how the hook system works by logging file operations:
- Logs all Edit, Write, MultiEdit operations
- Shows file information (size, lines, type)
- Never blocks operations - purely educational
- Perfect for understanding hook mechanics

When it runs:
1. Logs the operation details
2. Shows file metadata
3. Always allows the operation to proceed
4. Creates an audit trail

Real example:
```bash
# Edit any file - hook will log but never block:
echo "console.log('Hello World');" > test.js

# Hook output in ~/.claude/logs/file-logger.log:
# [2025-01-19 10:30:15] [file-logger] Hook triggered!
# [2025-01-19 10:30:15] [file-logger] Tool: Write
# [2025-01-19 10:30:15] [file-logger] File: test.js
# [2025-01-19 10:30:15] [file-logger] File size: 29 bytes
# [2025-01-19 10:30:15] [file-logger] Operation allowed - no blocking behavior
```

This hook is safe for any environment and helps you understand how hooks integrate with Claude Code's operation flow.

## Three Scripts That Do The Heavy Lifting

### [setup.sh](https://github.com/PaulDuvall/claude-code/blob/main/setup.sh) - One-Command Setup
```bash
./setup.sh                          # Basic
./setup.sh --setup-type demo        # With demo hooks
./setup.sh --setup-type enterprise  # Full governance
```

### [configure-claude-code.sh](https://github.com/PaulDuvall/claude-code/blob/main/configure-claude-code.sh) - Safe Configuration
```bash
./configure-claude-code.sh --dry-run  # Preview
./configure-claude-code.sh            # Apply with backups
```

### [deploy.sh](https://github.com/PaulDuvall/claude-code/blob/main/deploy.sh) - Smart Deployment
Seven deployment modes with validation and rollback.

All scripts include dry-run modes, automatic backups, and comprehensive validation. They're production-ready, not demos.

## Real Workflows That Save Time

### Daily Development
```bash
/xtdd --component UserAuth  # Generate tests and implementation
/xquality                   # Run quality checks
/xsecurity                  # Scan vulnerabilities
/xacp                      # Commit with smart message
```

### CI/CD Pipeline Generation
```bash
/xcicd --init github --stages "source,build,test,security,production"

# Creates complete pipeline with:
# - Fast feedback (< 30 minutes)
# - Security scanning
# - Blue/green deployment
# - Monitoring and alerts
```

### Test Before Push
```bash
/xact --install-deps  # Setup local testing
/xact                 # Run all workflows
/xact --job test      # Test specific job
```

## Implementation: Days, Not Weeks

Things move fast with Claude Code. I built all of this in a couple of weeks. Here's a practical approach:

1. **Day 1**: Install, explore built-in commands, create CLAUDE.md
2. **Day 2-3**: Review my custom commands, experiment with ones that fit your workflow
3. **Day 4-5**: Create your first custom command
4. **Week 2**: Add security hooks and automation scripts as needed

The key is to experiment. Review the commands I've created—they're documented and ready to adapt to your needs.

## Problems This Solves

### Governance Without Friction
- Enforces standards automatically
- Prevents vulnerabilities before commit
- Creates audit trails

### Works With What You Have
- Fits existing git workflows
- Integrates with current CI/CD
- Complements other tools

### Consistent Quality
- AI follows team patterns
- Same quality across developers
- Reduces technical debt automatically

## What I Learned

1. **Start Small**: Fix one workflow, then expand
2. **Version Everything**: Commands and hooks are code
3. **Test Scripts**: Automation needs testing
4. **Document Context**: CLAUDE.md improves suggestions dramatically
5. **Hook Integration**: Add file logging to understand operations before advanced features

## Results After Eight Weeks

- **14 active commands** for daily work
- **43 experimental commands** for advanced workflows

## Start Building Your Platform

1. Install: `npm install -g @anthropic-ai/claude-code`
2. Clone my repo: [github.com/PaulDuvall/claude-code](https://github.com/PaulDuvall/claude-code)
3. Create CLAUDE.md for your project
4. Build one command that fixes your biggest pain
5. Adapt scripts to your environment

## The Bottom Line

Claude Code isn't just another AI tool—it's a platform for building your own AI-assisted development environment. With custom commands, hooks, and automation, you get the benefits of AI without sacrificing control, security, or quality.

The key? Build incrementally. Understand what you need. Maintain governance. My implementation proves this works—delivering measurable improvements while enhancing security.

Start small. Think big. Ship code.

---

*Thanks to [Paul Hammond](https://github.com/citypaul/.dotfiles/blob/main/claude/.claude/CLAUDE.md) and [Patrick Debois](https://gist.github.com/jedi4ever/762ca6746ef22b064550ad7c04f3bd2f) for patterns that shaped this approach.*