# Claude Code Custom Commands - Complete Setup Guide

This guide provides the complete workflow for setting up Claude Code with custom commands, security hooks, and enterprise-grade governance.

## Quick Setup (Recommended)

### 1. Prerequisites
```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Set API key
export ANTHROPIC_API_KEY='sk-ant-your-key-here'
```

### 2. One-Command Setup
```bash
# Preview what will be done
./setup.sh --dry-run

# Basic setup (custom commands only)
./setup.sh

# Security-focused setup (with hooks)
./setup.sh --setup-type security

# Full enterprise setup
./setup.sh --setup-type enterprise
```

### 3. Verify Installation
```bash
# Run comprehensive diagnostics
./verify-setup.sh

# Test a custom command
claude
/xtest
```

## What Gets Installed

### Basic Setup (`./setup.sh`)
- ✅ Claude Code configuration (~/.claude.json)
- ✅ API key helper script
- ✅ 14 custom commands (/xtest, /xquality, /xsecurity, etc.)
- ✅ Basic settings.json template
- ✅ Tool permissions and trust settings

### Security Setup (`./setup.sh --setup-type security`)
- ✅ Everything from basic setup
- ✅ Security hooks (credential exposure prevention)
- ✅ Restrictive permissions configuration
- ✅ Audit logging capabilities
- ✅ Webhook integration for alerts

### Enterprise Setup (`./setup.sh --setup-type enterprise`)
- ✅ Everything from security setup
- ✅ Comprehensive governance hooks
- ✅ Enterprise-grade permissions
- ✅ MCP server integration
- ✅ Enhanced monitoring and compliance

## Available Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `setup.sh` | Complete automated setup | `./setup.sh --setup-type security` |
| `verify-setup.sh` | Comprehensive diagnostics | `./verify-setup.sh --verbose` |
| `validate-commands.sh` | Validate commands and config | `./validate-commands.sh --check-integration` |
| `deploy.sh` | Deploy custom commands only | `./deploy.sh` |
| `configure-claude-code.sh` | Configure Claude Code only | `./configure-claude-code.sh --dry-run` |

## Settings Templates

| Template | Use Case | Features |
|----------|----------|----------|
| `templates/basic-settings.json` | Development | Basic tools, standard permissions |
| `templates/security-focused-settings.json` | Security-conscious | Hooks enabled, restrictive permissions |
| `templates/enterprise-settings.json` | Enterprise | Full governance, monitoring, compliance |

## Directory Structure

```
claude-code/
├── setup.sh                    # 🎯 Main setup script
├── verify-setup.sh             # 🔍 Diagnostics tool
├── validate-commands.sh        # ✅ Validation framework
├── deploy.sh                   # 📦 Deploy commands
├── configure-claude-code.sh    # ⚙️  Configure Claude Code
├── templates/                  # 📋 Settings.json templates
│   ├── basic-settings.json
│   ├── security-focused-settings.json
│   └── enterprise-settings.json
├── slash-commands/
│   ├── active/                 # 🚀 14 working commands
│   └── experiments/            # 🧪 40+ conceptual commands
├── hooks/                      # 🔒 Security hooks
├── specs/                      # 📝 Command specifications
└── docs/                       # 📚 Documentation
```

## Troubleshooting Quick Reference

### Common Issues

| Problem | Quick Fix |
|---------|-----------|
| Commands not available | `./deploy.sh` then restart Claude Code |
| Permission errors | `./configure-claude-code.sh` |
| Hooks not working | `./setup.sh --setup-type security` |
| Setup fails | `./setup.sh --dry-run` to see what's wrong |
| Need diagnostics | `./verify-setup.sh --verbose` |

### Reset to Clean State
```bash
# Remove all custom configuration
rm -rf ~/.claude/commands/x*.md ~/.claude/hooks/ ~/.claude/settings.json

# Start fresh
./setup.sh
```

## Advanced Usage

### Manual Setup (Step by Step)
```bash
# 1. Validate everything first
./validate-commands.sh --check-integration

# 2. Configure Claude Code
./configure-claude-code.sh --dry-run
./configure-claude-code.sh

# 3. Deploy custom commands
./deploy.sh

# 4. Install security hooks (optional)
cp hooks/prevent-credential-exposure.sh ~/.claude/hooks/
chmod +x ~/.claude/hooks/prevent-credential-exposure.sh

# 5. Apply settings template
cp templates/security-focused-settings.json ~/.claude/settings.json

# 6. Verify everything works
./verify-setup.sh
```

### Custom Configuration
```bash
# Use your own settings.json
cp templates/basic-settings.json ~/.claude/settings.json
# Edit ~/.claude/settings.json as needed

# Skip certain setup steps
./setup.sh --skip-configure  # Only deploy commands
./setup.sh --skip-hooks      # Skip security hooks
./setup.sh --skip-deploy     # Only configure Claude Code
```

## Support

### Getting Help
1. **Run diagnostics**: `./verify-setup.sh --verbose --output report.txt`
2. **Check validation**: `./validate-commands.sh --check-integration`
3. **Review logs**: `~/.claude/logs/`
4. **Read documentation**: 
   - Main guide: `README.md`
   - Security hooks: `hooks/README.md`
   - Settings templates: `templates/README.md`

### Reporting Issues
Include this information:
- Output from `./verify-setup.sh --verbose`
- Your OS and Node.js version
- Claude Code version: `claude --version`
- Error messages and steps to reproduce

## Next Steps

After successful setup:

1. **Learn the commands**: See [Simple Usage Patterns](README.md#simple-usage-patterns)
2. **Try the workflow**: Run `/xtest`, `/xquality`, `/xsecurity`
3. **Explore advanced features**: Check `slash-commands/experiments/`
4. **Set up CI/CD integration**: Use commands in your pipelines
5. **Configure team settings**: Share `.claude/settings.json` with your team

---

**🎉 Welcome to enterprise-grade AI-assisted development with Claude Code!**