# Manual Uninstall and Install Guide for Claude Code Custom Commands

## Background

This guide provides manual steps for uninstalling and installing the Claude Code Custom Commands repository. The toolkit provides a comprehensive collection of custom slash commands, hooks, and AI subagents for Claude Code that automate software development workflows.

## Prerequisites

- Claude Code installed: `npm install -g @anthropic-ai/claude-code`
- Node.js and npm installed on your system
- Terminal/command line access
- Git for cloning the repository
- ANTHROPIC_API_KEY environment variable set

## Complete Uninstall Process

**Choose your uninstall method based on how you installed:**

## Method 1: NPM Package Uninstall

### Step 1: Uninstall the NPM Package

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
rm -rf ~/.claude/sub-agents/

# Remove project-specific subagents (if any)
rm -rf .claude/sub-agents/
```

### Step 5: Clean Configuration Files (Optional)

```bash
# Remove Claude Code configuration (optional - this removes ALL Claude Code settings)
# Be cautious with this step - only do this if you want to completely reset Claude Code
rm -rf ~/.claude/config/
```

## Method 2: Repository-Based Uninstall

**Note**: If you installed via repository method, you only need to clean up the deployed files:

### Step 1: Remove Custom Commands

```bash
# Remove machine-wide custom commands
rm -rf ~/.claude/commands/

# Remove project-specific commands (if any)
rm -rf .claude/commands/
```

### Step 2: Remove Hooks

```bash
# Remove machine-wide hooks
rm -rf ~/.claude/hooks/

# Remove project-specific hooks (if any)
rm -rf .claude/hooks/
```

### Step 3: Remove AI Subagents

```bash
# Remove installed subagents  
rm -rf ~/.claude/sub-agents/

# Remove project-specific subagents (if any)
rm -rf .claude/sub-agents/
```

### Step 4: Clean Configuration Files (Optional)

```bash
# Remove Claude Code configuration (optional - this removes ALL Claude Code settings)
# Be cautious with this step - only do this if you want to completely reset Claude Code
rm -rf ~/.claude/config/
```

### Step 5: Remove Repository (Optional)

```bash
# Remove the cloned repository if no longer needed
# Replace with your actual clone location
rm -rf ~/claude-code
```

## Complete Installation Process

**Choose your preferred installation method:**

## Method 1: NPM Package Installation (Recommended)

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
claude-commands install --experimental

# Or install all commands (active + experimental)
claude-commands install --all
```

## Method 2: Repository-Based Installation (Advanced)

### Step 1: Clone the Repository

```bash
# Clone the claude-code repository
git clone https://github.com/PaulDuvall/claude-code.git
cd claude-code
```

### Step 2: Set Environment Variables

```bash
# Set your Anthropic API key (replace with your actual key)
export ANTHROPIC_API_KEY=$YOUR_ACTUAL_API_KEY

# Add to your shell profile for persistence  
echo "export ANTHROPIC_API_KEY=\$YOUR_ACTUAL_API_KEY" >> ~/.zshrc
source ~/.zshrc
```

### Step 3: Run Complete Setup

```bash
# Run the complete setup script (installs everything)
./setup.sh

# Or preview what it will do first
./setup.sh --dry-run
```

**Alternative: Manual Repository Installation Steps**

### Step 4: Configure Claude Code

```bash
# Configure Claude Code with optimal settings
./configure-claude-code.sh
```

### Step 5: Deploy Custom Commands

```bash
# Deploy active/production-ready commands (13 core commands)
./deploy.sh

# Or deploy experimental commands (44 additional commands)
./deploy.sh --experimental

# Or deploy all commands (active + experimental)
./deploy.sh --all
```

### Step 6: Install AI Subagents

```bash
# Install AI subagents for enhanced functionality
./deploy-subagents.sh
```

## Common Steps (Both Methods)

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

**For NPM Package Installation:**
```bash
# Create hooks directory
mkdir -p ~/.claude/hooks/
chmod 700 ~/.claude/hooks/

# Note: Hooks are currently installed manually
# The following hooks are included with the NPM package:
echo "Hooks installation is handled during package installation"
echo "Available hooks: file-logger, prevent-credential-exposure"
```

**For Repository-Based Installation:**
```bash
# Create hooks directory
mkdir -p ~/.claude/hooks/
chmod 700 ~/.claude/hooks/

# Copy security hooks from the repository
cp hooks/prevent-credential-exposure.sh ~/.claude/hooks/
chmod +x ~/.claude/hooks/prevent-credential-exposure.sh

# Copy other hooks if desired
cp hooks/*.sh ~/.claude/hooks/
chmod +x ~/.claude/hooks/*.sh
```

### Verify Installation

**For NPM Package Installation:**
```bash
# Test that commands are available in Claude Code
claude --version

# Check custom commands are deployed  
ls ~/.claude/commands/x*.md

# List installed commands
claude-commands list
```

**For Repository-Based Installation:**
```bash
# Test that commands are available in Claude Code
claude --version

# Check custom commands are deployed
ls ~/.claude/commands/x*.md

# Run verification script
./verify-setup.sh --verbose

# Validate commands
./validate-commands.sh
```

## Setup Types

The `./setup.sh` script supports different setup types:

```bash
# Basic setup (default) - core commands only
./setup.sh --setup-type basic

# Security setup - includes security hooks  
./setup.sh --setup-type security

# Comprehensive setup - all features enabled
./setup.sh --setup-type comprehensive

# Force non-interactive installation
./setup.sh --force

# Skip specific components
./setup.sh --skip-configure --skip-hooks
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
mkdir -p .claude/commands .claude/hooks .claude/sub-agents .claude/config

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

# Check for syntax errors
./validate-commands.sh
```

### Permission Issues

```bash
# Fix permissions for Claude directories
chmod -R 755 ~/.claude
```

### Installation Issues

```bash
# Re-run setup script
./setup.sh --force

# Run diagnostics
./verify-setup.sh --verbose
```

## Important Notes

1. **Dual Installation Methods**: Available both as npm package (`@paulduvall/claude-dev-toolkit`) and repository-based installation
2. **Customization Storage**: All customizations stored in `~/.claude/` (machine-wide) or `.claude/` (project-specific)  
3. **Version Control**: Always backup your `.claude/` directory to prevent loss
4. **CLAUDE.md**: Project context file essential for consistent behavior
5. **Command Prefix**: All custom commands use "x" prefix (e.g., `/xtest`, `/xgit`)
6. **NPM Package**: Use `claude-commands` CLI after installing npm package
7. **Repository-Based**: Use shell scripts (`./setup.sh`, `./deploy.sh`, etc.) after cloning repository

## Additional Resources

- Repository: https://github.com/PaulDuvall/claude-code
- Claude Code Documentation: https://docs.anthropic.com/en/docs/claude-code/
- AI Development Patterns: https://github.com/PaulDuvall/ai-development-patterns
- Slash Commands Documentation: https://docs.anthropic.com/en/docs/claude-code/slash-commands
- Hooks Documentation: https://docs.anthropic.com/en/docs/claude-code/hooks
- Sub-Agents Documentation: https://docs.anthropic.com/en/docs/claude-code/sub-agents

## Summary

This toolkit transforms Claude Code into a comprehensive development platform that:
- Automates repetitive tasks through 57 custom slash commands
- Enforces security and quality standards through hooks  
- Provides intelligent assistance through AI subagents
- Maintains project context through CLAUDE.md
- Supports dual installation methods (npm package and repository-based)
- Supports backup and version control for persistence

**Key Installation Commands**:
- **NPM Package**: `npm install -g @paulduvall/claude-dev-toolkit`
- **Repository-Based**: `./setup.sh` (after cloning the repository)