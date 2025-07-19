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

### 3. `enterprise-settings.json`
**Use case**: Enterprise development with full governance
**Features**:
- All security features plus:
- Comprehensive audit logging
- Enterprise-grade permissions
- MCP server integration
- Enhanced performance settings
- Full monitoring and compliance

**Prerequisites**: 
- Install all security hooks
- Docker Desktop running (for MCP servers)
- Configure enterprise webhooks

**To use**:
```bash
cp templates/enterprise-settings.json ~/.claude/settings.json
# Configure webhooks and enterprise-specific settings
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