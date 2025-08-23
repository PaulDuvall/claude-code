# Manual Uninstall and Install Guide for Claude Dev Toolkit

## Background

This guide provides manual steps for uninstalling and installing the Claude Dev Toolkit (`@paulduvall/claude-dev-toolkit`) via npm. The toolkit provides a comprehensive collection of custom slash commands, hooks, and AI subagents for Claude Code that automate software development workflows.

## Prerequisites

- Node.js and npm installed on your system
- Terminal/command line access
- (Optional) Git for cloning the repository

## Complete Uninstall Process

### Step 1: Uninstall the npm Package

```bash
# Uninstall the Claude Dev Toolkit globally
npm uninstall -g @paulduvall/claude-dev-toolkit

# Verify removal
npm list -g @paulduvall/claude-dev-toolkit
# Should show: (empty)
```

### Step 2: Remove Custom Commands

```bash
# Remove machine-wide custom commands
rm -rf ~/.claude/commands/

# Remove project-specific commands (if any)
# Navigate to your project directory first
rm -rf .claude/commands/
```

### Step 3: Remove Hooks

```bash
# Remove machine-wide hooks
rm -rf ~/.claude/hooks/

# Remove project-specific hooks (if any)
# Navigate to your project directory first
rm -rf .claude/hooks/
```

### Step 4: Remove AI Subagents

```bash
# Remove installed subagents
rm -rf ~/.claude/subagents/

# Remove project-specific subagents (if any)
rm -rf .claude/subagents/
```

### Step 5: Clean Configuration Files

```bash
# Remove Claude Code configuration (optional - this removes ALL Claude Code settings)
# Be cautious with this step
rm -rf ~/.claude/config/
```

### Step 6: Clear npm Cache (Optional)

```bash
# Clear npm cache to ensure clean installation
npm cache clean --force
```

## Complete Installation Process

### Step 1: Install Claude Code (if not already installed)

```bash
# Install Claude Code globally
npm install -g @anthropic-ai/claude-code

# Verify installation
claude-code --version
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
# - xarchitecture (Architecture design and analysis)
# - xconfig (Configuration management)
# - xdebug (Advanced debugging)
# - xdocs (Documentation generation)
# - xgit (Automated Git workflow)
# - xpipeline (CI/CD pipeline management)
# - xquality (Code quality analysis)
# - xrefactor (Code refactoring automation)
# - xrelease (Release management)
# - xsecurity (Security scanning and analysis)
# - xspec (Specification generation)
# - xtdd (Test-driven development)
# - xtest (Testing automation)
```

### Step 4: Install AI Subagents (Optional but Recommended)

```bash
# Install AI subagents for enhanced functionality
claude-commands subagents --install

# This installs specialized AI agents for:
# - Security analysis
# - Code review
# - Architectural guidance
# - Persistent context management
```

### Step 5: Configure Settings

```bash
# View current configuration
claude-commands config

# Apply a specific configuration template (optional)
# Options: basic, comprehensive, security-focused
claude-commands config --template comprehensive
```

### Step 6: Install Experimental Commands (Optional)

```bash
# If you want to try experimental commands (44 additional commands)
claude-commands install --experiments

# Or install all commands (active + experimental)
claude-commands install --all
```

### Step 7: Create Project Context (CLAUDE.md)

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

### Step 8: Set Up Hooks (Optional)

Install security and logging hooks:

```bash
# Install file logger hook
claude-commands hooks --install file-logger

# Install credential exposure prevention hook
claude-commands hooks --install prevent-credential-exposure
```

### Step 9: Verify Installation

```bash
# Test that commands are available in Claude Code
# Open Claude Code and try:
# /xhelp - List available commands
# /xtest --help - Get help for a specific command

# Verify deployment from command line
claude-commands list

# Run verification script (if cloned from repository)
# ./verify-setup.sh --verbose
```

## Alternative: Installation from Repository

For advanced users or custom modifications:

```bash
# Clone the repository
git clone https://github.com/PaulDuvall/claude-code.git
cd claude-code

# Run the one-command setup script
./setup.sh

# Or manually deploy commands
./deploy.sh           # Deploy active commands
./deploy.sh --experiments  # Deploy experimental commands
./deploy.sh --all     # Deploy all commands

# Validate commands
./validate-commands.sh

# Verify setup
./verify-setup.sh --verbose
```

## Version Control Best Practices

To prevent losing customizations (as described in the original post):

### Step 1: Initialize Version Control for Customizations

```bash
# Create a dedicated repository for your Claude customizations
mkdir ~/my-claude-customizations
cd ~/my-claude-customizations
git init

# Copy your Claude configuration
cp -r ~/.claude .claude
```

### Step 2: Create Directory Structure

```bash
# Create organized structure
mkdir -p .claude/commands
mkdir -p .claude/hooks
mkdir -p .claude/subagents
mkdir -p .claude/config
```

### Step 3: Add to Version Control

```bash
# Add all customizations
git add .
git commit -m "Initial Claude Code customization backup"

# Push to remote repository (GitHub, GitLab, etc.)
git remote add origin <your-repository-url>
git push -u origin main
```

### Step 4: Create Backup Script

```bash
# Create a backup script
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

### Daily Development Workflow

```bash
/xtest       # Run tests with coverage
/xquality    # Check code quality with linting
/xsecurity   # Scan for vulnerabilities
/xgit        # Automated commit workflow
```

### CI/CD Integration

```bash
/xpipeline --deploy staging  # Deploy pipeline
/xrelease                    # Release management
/xconfig                     # Configuration management
```

### Architecture and Design

```bash
/xarchitecture  # System architecture design
/xrefactor      # Interactive code refactoring
/xdebug         # Advanced debugging assistance
```

## Troubleshooting

### Commands Not Appearing in Claude Code

```bash
# Restart Claude Code
pkill -f claude-code
claude-code

# Verify command installation location
ls -la ~/.claude/commands/

# Check for syntax errors in custom commands
claude-commands validate
```

### Permission Issues

```bash
# Fix permissions for Claude directories
chmod -R 755 ~/.claude
```

### NPM Installation Failures

```bash
# Clear npm cache
npm cache clean --force

# Try with different registry
npm install -g @paulduvall/claude-dev-toolkit --registry https://registry.npmjs.org/
```

## Important Notes

1. **Customization Persistence**: All customizations are stored in `~/.claude/` (machine-wide) or `.claude/` (project-specific)
2. **Version Control**: Always version control your `.claude/` directory to prevent loss
3. **CLAUDE.md**: This file provides project context and is essential for consistent behavior
4. **Command Prefix**: All custom commands use the "x" prefix (e.g., `/xtest`, `/xgit`)
5. **Portability**: Commands are portable across projects, machines, and teams when properly version controlled

## Additional Resources

- Repository: https://github.com/PaulDuvall/claude-code
- Claude Code Documentation: https://docs.anthropic.com/en/docs/claude-code/
- AI Development Patterns: https://github.com/PaulDuvall/ai-development-patterns
- Slash Commands Documentation: https://docs.anthropic.com/en/docs/claude-code/slash-commands
- Hooks Documentation: https://docs.anthropic.com/en/docs/claude-code/hooks
- Sub-Agents Documentation: https://docs.anthropic.com/en/docs/claude-code/sub-agents

## Summary

This toolkit transforms Claude Code into a comprehensive development platform that:
- Automates repetitive tasks through custom slash commands
- Enforces security and quality standards through hooks
- Provides intelligent assistance through AI subagents
- Maintains project context through CLAUDE.md
- Survives project switches and machine changes through version control

Remember: "Customization lets you focus on architecture and problem-solving, but only if it survives. Start small, build systematically, version control everything."