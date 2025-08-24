# User Migration Guide: From Repository Scripts to NPM Package

## Overview

This guide helps existing users migrate from the repository-based installation scripts to the new simplified NPM package approach. 

**New Installation Method**: `npm install -g @paulduvall/claude-dev-toolkit`

## Why This Change?

Claude Code previously supported two installation methods, which created confusion and maintenance complexity:
- ❌ **Old**: Repository scripts (`./setup.sh`, `./deploy.sh`, etc.)
- ✅ **New**: Single NPM package (`@paulduvall/claude-dev-toolkit`)

The NPM approach provides:
- **Simpler Installation**: One command instead of multiple scripts
- **Better Updates**: Standard `npm update` process
- **Cross-Platform**: Works consistently on Windows, macOS, Linux
- **Global Access**: Commands available from any directory

## Migration Steps

### Step 1: Check Current Installation Method

First, determine which installation method you're currently using:

```bash
# Check if you have repository scripts
ls -la setup.sh deploy.sh configure-claude-code.sh
# If these files exist, you're using repository scripts

# Check if NPM package is installed
npm list -g @paulduvall/claude-dev-toolkit
# If installed, you might have both methods
```

### Step 2: Backup Current Configuration

**Important**: Always backup your configuration before migrating.

```bash
# Create backup directory
mkdir ~/claude-code-backup-$(date +%Y%m%d)

# Backup your Claude Code settings
cp -r ~/.claude ~/claude-code-backup-$(date +%Y%m%d)/

# Backup any custom commands you've created
find ~/.claude/commands -name "*.md" -type f > ~/claude-code-backup-$(date +%Y%m%d)/custom-commands-list.txt
```

### Step 3: Install NPM Package

Install the new NPM package globally:

```bash
# Install the NPM package
npm install -g @paulduvall/claude-dev-toolkit

# Verify installation
claude-commands --version
```

### Step 4: Migrate Configuration

The NPM package can work with your existing configuration, but you may want to validate and update it:

```bash
# Validate your current configuration
claude-commands configure --validate

# If validation fails, you can reset to a template
claude-commands configure --template comprehensive

# Or run interactive configuration
claude-commands configure --interactive
```

### Step 5: Update Commands

Reinstall your commands using the NPM package:

```bash
# Install active commands (recommended set)
claude-commands install --active

# Or install experimental commands too
claude-commands install --all

# Verify commands are working
claude-commands list --installed
```

### Step 6: Clean Up Repository Scripts (Optional)

If everything is working with the NPM package, you can clean up the old repository scripts:

```bash
# Remove repository scripts (if you cloned the repo)
rm -f setup.sh deploy.sh configure-claude-code.sh verify-setup.sh

# You can keep the repository for reference, but scripts are no longer needed
```

## Command Mapping

Here's how old repository script commands map to new NPM commands:

### Setup Commands
```bash
# Old way
./setup.sh

# New way  
claude-commands setup

# With options
./setup.sh --setup-type comprehensive --force
claude-commands setup --type comprehensive --force
```

### Deploy/Install Commands
```bash
# Old way
./deploy.sh
./deploy.sh --experiments
./deploy.sh --all --dry-run

# New way
claude-commands install --active
claude-commands install --experiments  
claude-commands install --all --dry-run
```

### Configuration Commands
```bash
# Old way
./configure-claude-code.sh
./configure-claude-code.sh --template security-focused

# New way
claude-commands configure --interactive
claude-commands configure --template security-focused
```

### Verification Commands
```bash
# Old way
./verify-setup.sh --verbose

# New way
claude-commands verify --verbose
```

## New Commands Available

The NPM package provides additional commands not available in repository scripts:

### Update Commands
```bash
# Update the toolkit itself
npm update -g @paulduvall/claude-dev-toolkit

# Update installed commands
claude-commands install --active  # Reinstalls latest versions
```

### Backup and Restore
```bash
# Create named backup
claude-commands backup production-config

# List available backups
claude-commands backup --list

# Restore from backup
claude-commands restore production-config
```

### Utility Commands
```bash
# List all available commands
claude-commands list

# List only installed commands
claude-commands list --installed

# Get help for any command
claude-commands setup --help
claude-commands install --help
```

## Troubleshooting

### Common Migration Issues

#### Issue: `claude-commands: command not found`
**Solution**: 
```bash
# Reinstall NPM package
npm install -g @paulduvall/claude-dev-toolkit

# Check npm global path
npm config get prefix
echo $PATH

# Add npm global path to your shell profile if needed
echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

#### Issue: Configuration validation fails
**Solution**:
```bash
# Check what's wrong
claude-commands configure --validate --verbose

# Reset to default template
claude-commands configure --template basic --reset

# Or start fresh with interactive setup
claude-commands configure --interactive
```

#### Issue: Commands not appearing in Claude Code
**Solution**:
```bash
# Verify commands are installed
claude-commands list --installed

# Reinstall commands
claude-commands install --active --force

# Check Claude Code configuration
claude-commands configure --validate

# Restart Claude Code application
```

#### Issue: Permission errors on macOS/Linux
**Solution**:
```bash
# Fix npm permissions (recommended approach)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Then reinstall
npm install -g @paulduvall/claude-dev-toolkit
```

### Getting Help

If you encounter issues during migration:

1. **Check the documentation**: All commands have built-in help
   ```bash
   claude-commands --help
   claude-commands setup --help
   ```

2. **Validate your setup**: Use the verification command
   ```bash
   claude-commands verify --verbose
   ```

3. **Create an issue**: If you find bugs or have questions
   - Repository: https://github.com/PaulDuvall/claude-code
   - Include your OS, Node.js version, and error messages

## Advantages After Migration

Once you've successfully migrated, you'll enjoy these benefits:

### ✅ **Simplified Workflow**
```bash
# One command to install everything
npm install -g @paulduvall/claude-dev-toolkit
claude-commands setup

# Easy updates
npm update -g @paulduvall/claude-dev-toolkit
```

### ✅ **Better Command Management**
```bash
# See what's installed
claude-commands list --installed

# Update just the commands
claude-commands install --active

# Backup before changes
claude-commands backup before-update
```

### ✅ **Cross-Platform Consistency**
- Same commands work on Windows, macOS, Linux
- No more shell-specific issues
- Consistent path handling

### ✅ **Professional Distribution**
- Standard NPM package management
- Semantic versioning
- Automated updates
- Better dependency handling

## FAQ

### Q: Can I use both methods during transition?
**A**: Yes, but it's not recommended long-term. The NPM package is designed to be the single installation method. You can run both temporarily during migration, but clean up repository scripts once you verify NPM package works for you.

### Q: Will my existing custom commands be affected?
**A**: No, your custom commands in `~/.claude/commands/` are preserved. The migration only affects how core commands are installed, not your personal customizations.

### Q: What about my hooks and configuration?
**A**: All existing hooks and configuration files are preserved. The NPM package works with your existing `~/.claude/` directory structure.

### Q: Can I rollback if something goes wrong?
**A**: Yes, if you've created backups:
```bash
# Restore your configuration
cp -r ~/claude-code-backup-20250824/.claude ~/

# The repository scripts should still work if you haven't deleted them
```

### Q: How do I get the latest experimental commands?
**A**: 
```bash
# Install experimental commands
claude-commands install --experiments

# Or install everything
claude-commands install --all
```

### Q: Is there a difference in functionality?
**A**: The NPM package provides the same functionality as repository scripts, plus additional features like backup/restore, better validation, and improved cross-platform support.

---

## Quick Migration Checklist

- [ ] Backup current configuration: `cp -r ~/.claude ~/claude-backup-$(date +%Y%m%d)`
- [ ] Install NPM package: `npm install -g @paulduvall/claude-dev-toolkit`
- [ ] Verify installation: `claude-commands --version`
- [ ] Validate configuration: `claude-commands configure --validate`
- [ ] Reinstall commands: `claude-commands install --active`
- [ ] Test commands work: `claude-commands list --installed`
- [ ] Clean up old scripts (optional): `rm setup.sh deploy.sh configure-claude-code.sh`

**Estimated Migration Time**: 5-10 minutes

---
*Document Version: 1.0*  
*Created: 2025-08-24*  
*Status: User Migration Guide*