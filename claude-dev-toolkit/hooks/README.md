# Claude Code Hooks Collection

This directory contains security and workflow hooks for Claude Code that provide enterprise-grade governance and automation.

## Available Hooks

### `file-logger.sh`
**Purpose**: Simple demonstration of hook functionality without security implications.

**Features**:
- ✅ Logs file operations (Edit, Write, MultiEdit tools)
- ✅ Shows file information (size, lines, type)
- ✅ Non-blocking - always allows operations to proceed
- ✅ Perfect for learning how hooks work

**Configuration**:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "./hooks/file-logger.sh",
            "blocking": false,
            "timeout": 5000
          }
        ]
      }
    ]
  }
}
```

**Log Location**: `~/.claude/logs/file-logger.log`

### `prevent-credential-exposure.sh`
**Purpose**: Prevents accidental credential exposure in AI-generated or AI-modified code.

**Features**:
- ✅ Detects 15+ credential patterns (API keys, tokens, passwords, private keys)
- ✅ Blocks dangerous operations with detailed warnings
- ✅ Comprehensive logging and audit trails
- ✅ Security team notifications via webhooks
- ✅ Emergency override capability for authorized users
- ✅ Environment variable and URL credential detection

**Configuration**:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "./hooks/prevent-credential-exposure.sh",
            "blocking": true,
            "timeout": 10000
          }
        ]
      }
    ]
  }
}
```

**Environment Variables**:
- `SECURITY_WEBHOOK_URL`: Optional Slack/Teams webhook for security alerts
- `CLAUDE_SECURITY_OVERRIDE`: Emergency override (use with extreme caution)

### Lifecycle & Event Hooks

The following hooks provide logging, validation, and cleanup at various Claude Code lifecycle events. All are non-blocking and log to `~/.claude/logs/`.

| Hook | Event | Purpose |
|------|-------|---------|
| `backup-before-edit.sh` | PreToolUse (Edit/Write) | Preserves file state before modifications |
| `audit-bash-commands.sh` | PreToolUse (Bash) | Logs shell commands for security audit trail |
| `log-all-operations.sh` | PostToolUse (*) | Audit trail for all tool usage |
| `validate-changes.sh` | PostToolUse (Edit/Write) | Post-edit validation of changes |
| `handle-notifications.sh` | Notification | Security event notification logging |
| `prompt-analysis.sh` | UserPromptSubmit | Validates prompts for security concerns |
| `prompt-security-scan.sh` | UserPromptSubmit | Scans prompts for credential exposure risks |
| `cleanup-on-stop.sh` | Stop | Cleans temporary state on execution stop |
| `subagent-cleanup.sh` | SubagentStop | Cleans subagent resources on completion |
| `session-cleanup.sh` | SessionEnd | End-of-session security cleanup |
| `pre-compact-backup.sh` | PreCompact | Checkpoint before context compaction |
| `session-init.sh` | SessionStart | Validates environment at session start |
| `security-session-init.sh` | SessionStart | Enhanced security posture validation |

### Quality & Workflow Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| `pre-commit-quality.sh` | PreToolUse (Bash) | Code quality checks before commits |
| `pre-commit-test-runner.sh` | PreToolUse (Bash) | Auto-detects test framework, blocks commits on failure |
| `pre-write-security.sh` | PreToolUse (Write) | Security scan before file writes |
| `verify-before-edit.sh` | PreToolUse (Edit/Write) | Warns about fabricated references (non-blocking) |
| `on-error-debug.sh` | Manual invocation | Debug context capture on errors |
| `subagent-trigger.sh` | PostToolUse (*) | Triggers subagent workflows (use --simple for lightweight mode) |

## Hook Installation

### Option 1: Global Installation (Recommended)
```bash
# Copy to Claude Code hooks directory
cp hooks/file-logger.sh ~/.claude/hooks/

# Make executable
chmod +x ~/.claude/hooks/file-logger.sh

# Configure in ~/.claude/settings.json
```

### Option 2: Project-Specific Installation
```bash
# Use relative path in project settings
# Add to .claude/settings.json in your project
```

## Configuration Examples

### Basic Security Configuration
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/file-logger.sh",
            "blocking": false
          }
        ]
      }
    ]
  }
}
```

### Enhanced Configuration with Notifications
```bash
# Set webhook for security alerts
export SECURITY_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"

# Add to your shell profile for persistence
echo 'export SECURITY_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"' >> ~/.zshrc
```

## Testing the Hook

### Test 1: Basic Credential Detection
```bash
# Create a test file with a fake API key
echo 'API_KEY="sk-ant-1234567890abcdef"' > test-credentials.txt

# Try to edit with Claude Code - should be blocked
claude edit test-credentials.txt
```

### Test 2: Environment Variable Exposure
```bash
# Create a test file with environment exposure
echo 'const apiKey = process.env.SECRET_API_KEY;' > test-env.js

# Try to edit with Claude Code - should be blocked
claude edit test-env.js
```

### Test 3: Emergency Override
```bash
# Enable override (use sparingly!)
export CLAUDE_SECURITY_OVERRIDE=true

# Now the operation will proceed with warnings
claude edit test-credentials.txt

# Disable override immediately after
unset CLAUDE_SECURITY_OVERRIDE
```

## Security Patterns Detected

The hook detects these credential patterns:
- **Anthropic API Keys**: `sk-ant-...`
- **OpenAI API Keys**: `sk-...`
- **GitHub Tokens**: `ghp_...`, `gho_...`
- **AWS Access Keys**: `AKIA...`
- **Database URLs**: `postgres://user:pass@host`
- **JWT Tokens**: `eyJ...`
- **Private Keys**: `-----BEGIN PRIVATE KEY-----`
- **Generic API Keys**: Pattern-based detection
- **Environment Variable Exposure**: `process.env.SECRET_*`

## Logs and Monitoring

### Log Locations
- **General Hook Logs**: `~/.claude/logs/security-hooks.log`
- **Security Violations**: `~/.claude/logs/credential-violations.log`

### Monitoring Commands
```bash
# View recent security events
tail -f ~/.claude/logs/security-hooks.log

# Check for violations
cat ~/.claude/logs/credential-violations.log

# Count violations by type
grep "VIOLATION:" ~/.claude/logs/credential-violations.log | cut -d: -f3 | sort | uniq -c
```

## Best Practices

1. **Always Review**: Examine the detected pattern before overriding
2. **Use Environment Variables**: Store credentials in environment variables
3. **Secrets Management**: Use proper secrets management systems (1Password, HashiCorp Vault, etc.)
4. **Emergency Override**: Only use `CLAUDE_SECURITY_OVERRIDE` in genuine emergencies
5. **Regular Audits**: Review violation logs regularly for patterns
6. **Team Training**: Educate team on secure coding practices

## Troubleshooting

### Hook Not Running
- Verify executable permissions: `ls -la ~/.claude/hooks/`
- Check Claude Code settings: `cat ~/.claude/settings.json`
- Review hook logs: `tail ~/.claude/logs/security-hooks.log`

### False Positives
- Review the detected pattern in logs
- Consider if the pattern is actually a security risk
- Use environment variables instead of hardcoded values
- Add file to `.gitignore` if it's test data

### Performance Issues
- The hook runs quickly but can be optimized for large files
- Consider adding file size limits if needed
- Use async execution for non-blocking notifications

## Contributing

To add new credential patterns or improve detection:

1. Add new patterns to the `CREDENTIAL_PATTERNS` array
2. Test with realistic examples
3. Update documentation
4. Submit changes for review

## Security Notice

This hook is designed to prevent accidental credential exposure. It should be part of a comprehensive security strategy that includes:
- Proper secrets management
- Regular security training
- Code review processes
- Automated security scanning in CI/CD
- Incident response procedures