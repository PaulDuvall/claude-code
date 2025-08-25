# Migration Guide: Repository Scripts → NPM Package

⚠️ **IMPORTANT**: The repository-based installation method has been deprecated and removed in favor of the streamlined NPM package approach.

## Quick Migration (30 seconds)

If you currently have the repository cloned:

```bash
# 1. Install the NPM package
npm install -g @paulduvall/claude-dev-toolkit

# 2. Run the new setup command
claude-commands setup

# 3. Verify everything is working
claude-commands verify

# 4. (Optional) Remove the old repository
rm -rf ~/path/to/your/claude-code/
```

## Command Mapping

All your familiar commands now work through the `claude-commands` CLI:

| **Old Command** | **New Command** | **Notes** |
|------------------|------------------|-----------|
| `./setup.sh` | `claude-commands setup` | One-time setup with templates |
| `./deploy.sh` | `claude-commands install --active` | Install production commands |
| `./deploy.sh --experiments` | `claude-commands install --experiments` | Install experimental commands |
| `./deploy.sh --all` | `claude-commands install --all` | Install all commands |
| `./configure-claude-code.sh` | `claude-commands configure --template <name>` | Apply configuration templates |
| `./verify-setup.sh` | `claude-commands verify` | Health check and validation |
| `./validate-commands.sh` | Built into install process | Automatic validation |

## Benefits of Migration

✅ **Simpler**: Single `npm install` command  
✅ **Faster**: No repository cloning required  
✅ **Cleaner**: No shell scripts cluttering your system  
✅ **Reliable**: Version management through NPM  
✅ **Cross-platform**: Better Windows/Linux/macOS support  
✅ **Updates**: Easy updates with `npm update -g`  

## New Features Available

The NPM package includes several improvements over the repository scripts:

### Enhanced Commands
```bash
# Backup before installing
claude-commands install --backup

# Dry run to preview changes
claude-commands install --dry-run

# Interactive configuration wizard
claude-commands configure --interactive

# Advanced filtering
claude-commands install --include "xtest,xquality" --exclude "xexperimental*"
```

### Comprehensive Help System
```bash
claude-commands --help                    # Main help
claude-commands install --help            # Command-specific help
claude-commands configure --help          # Configuration options
```

### Backup & Restore
```bash
claude-commands backup                    # Create backup
claude-commands restore <backup-name>    # Restore from backup
```

## Troubleshooting

### "Command not found: claude-commands"
Make sure NPM global bin directory is in your PATH:
```bash
npm config get prefix
# Add the bin subdirectory to your PATH
```

### "Previous installation conflicts"
Clean up any previous installation:
```bash
# Remove old commands directory
rm -rf ~/.claude/commands/

# Fresh install
claude-commands setup
```

### "Missing commands after migration"
Reinstall commands:
```bash
claude-commands install --all --force
claude-commands verify
```

## Support

- **Issues**: [GitHub Issues](https://github.com/PaulDuvall/claude-code/issues)
- **Documentation**: See updated README.md for current installation method
- **Package Info**: `claude-commands --version` and `npm list -g @paulduvall/claude-dev-toolkit`

## Timeline

- **✅ Phase 1-2 Complete**: NPM package now has 100% feature parity
- **✅ Phase 3 Complete**: Repository scripts removed, documentation updated
- **🎯 Ongoing**: NPM package is the only supported installation method

The repository will continue to be maintained for command development, but all user installations should use the NPM package.

---

**Ready to migrate?** Run `npm install -g @paulduvall/claude-dev-toolkit && claude-commands setup` and you'll be up and running in 30 seconds!