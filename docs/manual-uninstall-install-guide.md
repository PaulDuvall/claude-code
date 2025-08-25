# Manual Uninstall and Install Guide for Claude Code Custom Commands

## Background

This guide provides manual steps for uninstalling and installing the Claude Code Custom Commands NPM package. The toolkit provides a comprehensive collection of custom slash commands, hooks, and AI subagents for Claude Code that automate software development workflows.

## Prerequisites

- Claude Code installed: `npm install -g @anthropic-ai/claude-code`
- Node.js and npm installed on your system
- Terminal/command line access
- ANTHROPIC_API_KEY environment variable set

## Uninstall

To remove Claude Code Custom Commands:

```bash
npm uninstall -g @paulduvall/claude-dev-toolkit
```

**Optional cleanup** (if you want to remove all configuration):
```bash
rm -rf ~/.claude/commands ~/.claude/hooks ~/.claude/subagents
```

## Complete Installation Process

### NPM Package Installation

### Step 1: Install Claude Code (if not already installed)

```bash
# Install Claude Code globally
npm install -g @anthropic-ai/claude-code

# Verify installation
claude --version
```

### Step 2: Install Claude Dev Toolkit

```bash
# Install the Claude Dev Toolkit globally
npm install -g @paulduvall/claude-dev-toolkit

# Verify installation
claude-commands --version
```

### Step 3: Deploy Core Commands

```bash
# Install active/production-ready commands
claude-commands install --active

# This deploys 13 core commands:
# - xarchitecture, xconfig, xdebug, xdocs, xgit
# - xpipeline, xquality, xrefactor, xrelease
# - xsecurity, xspec, xtdd, xtest
```

### Step 4: Install AI Subagents (Optional)

```bash
# Install AI subagents for enhanced functionality
claude-commands subagents --install

# This installs specialized AI agents for:
# - Security analysis
# - Code review
# - Architectural guidance
```

### Step 5: Configure Settings

```bash
# View current configuration
claude-commands config

# Apply a configuration template (optional)
claude-commands config --template comprehensive-settings.json
```

### Step 6: Install Experimental Commands (Optional)

```bash
# Install experimental commands (44 additional commands)
claude-commands install --experiments

# Or install all commands (active + experimental)
claude-commands install --all
```

## Additional Configuration

### Create Project Context (CLAUDE.md)

Create a `CLAUDE.md` file in your project root to provide Claude with project-specific context:

```bash
# Navigate to your project directory
cd /path/to/your/project

# Create CLAUDE.md with project context
cat > CLAUDE.md << 'EOF'
# CLAUDE.md

## Project Overview
[Describe your project here]

## Core Philosophy
[Define your development principles]

## Development Guidelines
[Specify coding standards and practices]

## Security Considerations
[Define security requirements]
EOF
```

### Set Up Hooks (Optional)

```bash
# Create hooks directory
mkdir -p ~/.claude/hooks/
chmod 700 ~/.claude/hooks/

# Note: Hooks are currently installed manually
# The following hooks are included with the NPM package:
echo "Hooks installation is handled during package installation"
echo "Available hooks: file-logger, prevent-credential-exposure"
```

### Verify Installation

```bash
# Test that commands are available in Claude Code
claude --version

# Check custom commands are deployed  
ls ~/.claude/commands/x*.md

# List installed commands
claude-commands list
```

## Version Control Best Practices

To prevent losing customizations (as described in the original post):

### Backup Your Customizations

```bash
# Create backup repository
mkdir ~/my-claude-customizations
cd ~/my-claude-customizations
git init

# Copy current configuration
cp -r ~/.claude .claude

# Create directory structure
mkdir -p .claude/commands .claude/hooks .claude/subagents .claude/config

# Commit to version control
git add .
git commit -m "Initial Claude Code customization backup"

# Add remote and push
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

### Create Backup Script

```bash
# Create automated backup script
cat > backup-claude.sh << 'EOF'
#!/bin/bash
cp -r ~/.claude/* .claude/
git add .
git commit -m "Update Claude customizations $(date +%Y-%m-%d)"
git push
EOF

chmod +x backup-claude.sh
```

## Using Custom Commands

Once installed, use the commands in Claude Code:

### Core Development Commands

```bash
/xtest        # Run tests with coverage
/xquality     # Check code quality with linting  
/xsecurity    # Scan for vulnerabilities
/xgit         # Automated commit workflow
```

### Advanced Commands

```bash
/xpipeline    # CI/CD pipeline management
/xrelease     # Release management  
/xconfig      # Configuration management
/xarchitecture # System architecture design
/xrefactor    # Interactive code refactoring
/xdebug       # Advanced debugging assistance
```

## Troubleshooting

### Commands Not Appearing in Claude Code

```bash
# Restart Claude Code process
pkill -f claude-code

# Verify command installation
ls -la ~/.claude/commands/
```

### Permission Issues

```bash
# Fix permissions for Claude directories
chmod -R 755 ~/.claude
```

### Installation Issues

```bash
# Reinstall the package
npm uninstall -g @paulduvall/claude-dev-toolkit
npm install -g @paulduvall/claude-dev-toolkit
claude-commands install --active
```

## Important Notes

1. **NPM Package Installation**: Available as npm package (`@paulduvall/claude-dev-toolkit`)
2. **Customization Storage**: All customizations stored in `~/.claude/` (machine-wide) or `.claude/` (project-specific)  
3. **Version Control**: Always backup your `.claude/` directory to prevent loss
4. **CLAUDE.md**: Project context file essential for consistent behavior
5. **Command Prefix**: All custom commands use "x" prefix (e.g., `/xtest`, `/xgit`)
6. **NPM Package CLI**: Use `claude-commands` CLI after installing npm package

## Additional Resources

- NPM Package: https://www.npmjs.com/package/@paulduvall/claude-dev-toolkit
- Repository: https://github.com/PaulDuvall/claude-code
- Claude Code Documentation: https://docs.anthropic.com/en/docs/claude-code/
- Slash Commands Documentation: https://docs.anthropic.com/en/docs/claude-code/slash-commands
- Hooks Documentation: https://docs.anthropic.com/en/docs/claude-code/hooks
- Subagents Documentation: https://docs.anthropic.com/en/docs/claude-code/subagents

## Summary

This toolkit transforms Claude Code into a comprehensive development platform that:
- Automates repetitive tasks through 57 custom slash commands
- Enforces security and quality standards through hooks  
- Provides intelligent assistance through AI subagents
- Maintains project context through CLAUDE.md
- Easy installation via NPM package
- Supports backup and version control for persistence

**Key Installation Command**:
```bash
npm install -g @paulduvall/claude-dev-toolkit
claude-commands install --active
```