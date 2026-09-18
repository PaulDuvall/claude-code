# Claude Code Settings Templates

This directory contains example `settings.json` configurations for different use cases.

## Templates Available

### 1. `basic-settings.json`
**Use case**: Simple development setup
**Features**:
- Basic tool permissions for custom commands
- API key helper configuration
- Standard performance settings
- Minimal environment variables

**To use**:
```bash
cp templates/basic-settings.json ~/.claude/settings.json
```

### 2. `security-focused-settings.json` 
**Use case**: Security-conscious development
**Features**:
- All basic features plus:
- Security hooks enabled (credential exposure prevention)
- Restrictive tool permissions
- Security environment variables
- Slack/Teams webhook integration for alerts

**Prerequisites**: Install security hooks first
```bash
cp hooks/prevent-credential-exposure.sh ~/.claude/hooks/
chmod +x ~/.claude/hooks/prevent-credential-exposure.sh
```

**To use**:
```bash
cp templates/security-focused-settings.json ~/.claude/settings.json
# Edit SECURITY_WEBHOOK_URL to your actual webhook
```

### 3. `comprehensive-settings.json`
**Use case**: Comprehensive development with full governance
**Features**:
- All security features plus:
- Comprehensive audit logging
- Comprehensive permissions
- MCP server integration
- Enhanced performance settings
- Full monitoring and compliance

**Prerequisites**: 
- Install all security hooks
- Docker Desktop running (for MCP servers)
- Configure organizational webhooks

**To use**:
```bash
cp templates/comprehensive-settings.json ~/.claude/settings.json
# Configure webhooks and organizational settings
```

### 4. `global-claude.md`
**Use case**: Universal development standards for all projects
**Features**:
- Verification-before-action rules (prevent fabricated references)
- Zero-error test policy
- Platform-specific formatting guidelines (LinkedIn, Slack, GitHub, email)
- Code structure limits (function length, nesting, complexity)
- Security checklist (no hardcoded secrets, parameterized SQL, input validation)
- Session management and failure protocols

**To use**:
```bash
cp templates/global-claude.md ~/.claude/CLAUDE.md
```

### 5. Status Line (`statusline.sh`)
**Use case**: Show model name, project directory, and context usage in the Claude Code footer
**Features**:
- Displays active model (e.g., Claude Opus 4.6)
- Shows current project directory name
- Shows context window usage percentage
**Requires**: `jq` (`brew install jq` / `apt install jq`)

**To use** (automatic with `setup-hooks.sh`, or manual):
```bash
cp hooks/statusline.sh ~/.claude/hooks/
chmod +x ~/.claude/hooks/statusline.sh
```
Then add to `~/.claude/settings.json`:
```json
"statusLine": {
  "type": "command",
  "command": "~/.claude/hooks/statusline.sh"
}
```

**Output example**: `[Claude Opus 4.6] my-project | 42% context`

**Customization**: Edit `~/.claude/hooks/statusline.sh` directly. Common additions:
```bash
# Add git branch
BRANCH=$(git branch --show-current 2>/dev/null)
echo "[$MODEL] ${DIR##*/} ($BRANCH) | ${PCT}% context"
```

## Configuration Notes

### Settings Hierarchy
Settings are applied in this order (later overrides earlier):
1. User settings: `~/.claude/settings.json`
2. Project settings: `.claude/settings.json` 
3. Local settings: `.claude/settings.local.json`

### Security Considerations
- Always review webhook URLs before using
- Set appropriate file permissions: `chmod 600 ~/.claude/settings.json`
- Store sensitive settings in environment variables, not directly in JSON
- Use `.claude/settings.local.json` for personal settings in team projects

### Customization
These templates are starting points. Customize based on your needs:
- Add/remove allowed tools
- Adjust timeout values
- Configure additional hooks
- Set team-specific environment variables

### Validation
Use the validation script to check your configuration:
```bash
./validate-commands.sh --check-settings
```

## Troubleshooting

### Common Issues
1. **Commands not working**: Check `allowedTools` array includes required tools
2. **Hooks not running**: Verify executable permissions and file paths
3. **Timeouts**: Increase timeout values for slow operations
4. **Permissions errors**: Check file permissions on settings.json and hooks

### Getting Help
- Run `./verify-setup.sh` to diagnose issues
- Check Claude Code logs: `~/.claude/logs/`
- Review the main README.md troubleshooting section