# Subagent-Hook Integration Guide

## Overview

The Subagent-Hook Integration system enables automatic invocation of specialized AI subagents during specific Claude Code events. This ensures that the right expertise is applied at the right time, providing security checks, quality gates, and specialized analysis automatically throughout your development workflow.

## Architecture

```
Claude Code Event → Hook System → subagent-trigger.sh → Subagent Execution
                                        ↓
                                  subagent-hooks.yaml
                                  (Event Mappings)
```

## Components

### 1. **Hook Script** (`hooks/subagent-trigger.sh`)
- Bridge between Claude Code hooks and subagents
- Discovers and validates subagents
- Gathers context for subagent execution
- Handles blocking/non-blocking behavior
- Manages temporary files and logging

### 2. **Configuration File** (`~/.claude/subagent-hooks.yaml`)
- Maps events to subagents
- Defines execution priorities
- Configures blocking behavior
- Sets timeout values
- Supports conditional triggering

### 3. **Settings Integration** (`~/.claude/settings.json`)
- Configures hooks in PreToolUse/PostToolUse
- Specifies matchers for tool events
- Sets blocking and timeout parameters

## Installation

### Step 1: Install the Hook Script

```bash
# Copy the hook script to your Claude Code hooks directory
cp hooks/subagent-trigger.sh ~/.claude/hooks/
chmod +x ~/.claude/hooks/subagent-trigger.sh
```

### Step 2: Configure Event Mappings

```bash
# Copy the configuration template
cp templates/subagent-hooks.yaml ~/.claude/

# Edit to customize your event mappings
nano ~/.claude/subagent-hooks.yaml
```

### Step 3: Update Claude Code Settings

Add hook configurations to your `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/subagent-trigger.sh security-auditor pre_write",
            "blocking": true,
            "timeout": 10000
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/subagent-trigger.sh documentation-curator post_write",
            "blocking": false,
            "timeout": 8000
          }
        ]
      }
    ]
  }
}
```

## Usage Examples

### Example 1: Security Check on File Write

When you edit or write a file, the security-auditor subagent automatically runs:

```bash
# In Claude Code
Edit file.py
# Triggers: security-auditor → checks for vulnerabilities
# If issues found: operation blocked with security report
```

### Example 2: Automatic Documentation Updates

After modifying code, documentation is automatically updated:

```bash
# In Claude Code
Write new_feature.js
# Triggers: documentation-curator → updates relevant docs
# Non-blocking: continues while docs update
```

### Example 3: Test Generation

When writing new code, tests are automatically suggested:

```bash
# In Claude Code
Write src/component.tsx
# Triggers: test-writer → generates test cases
# Provides: test suggestions in output
```

### Example 4: Error Diagnosis

When an error occurs, specialized debugging help is provided:

```bash
# In Claude Code
Bash npm test  # Test fails
# Triggers: debug-specialist → analyzes failure
# Provides: root cause analysis and fix suggestions
```

## Event Types

### Core Events

- **`pre_write`**: Before file modification
- **`post_write`**: After file modification
- **`pre_commit`**: Before git commit
- **`post_commit`**: After git commit
- **`pre_test`**: Before running tests
- **`post_test`**: After test execution
- **`on_error`**: When errors occur
- **`security_check`**: Security validation events

### Custom Events

You can define custom events in your configuration:

```yaml
custom_code_review:
  - code-review-assistant
  - requirements-reviewer
  - api-guardian
```

Then trigger them manually:

```bash
~/.claude/hooks/subagent-trigger.sh --event custom_code_review
```

## Configuration Reference

### Basic Event Mapping

```yaml
event_name:
  - subagent-1
  - subagent-2
```

### Priority Configuration

```yaml
priorities:
  security-auditor:
    priority: 1        # Execution order
    blocking: true     # Block if issues found
    timeout: 10000     # 10 seconds
```

### Conditional Triggering

```yaml
conditions:
  pre_write:
    file_patterns:
      - "*.py"
      - "*.js"
    exclude_patterns:
      - "*.test.*"
```

### Override Settings

```yaml
overrides:
  pre_deployment:
    deployment-strategist:
      timeout: 300
      tools: "Read, Grep, Glob"
      require_approval: true
```

## Available Subagents

### Security & Compliance
- **security-auditor**: Vulnerability scanning
- **license-compliance-guardian**: License verification
- **audit-trail-verifier**: Audit logging

### Code Quality
- **style-enforcer**: Code style checking
- **code-review-assistant**: Automated reviews
- **performance-guardian**: Performance analysis

### Testing
- **test-writer**: Test generation
- **contract-tester**: API contract testing
- **debug-specialist**: Error diagnosis

### Documentation
- **documentation-curator**: Doc updates
- **requirements-reviewer**: Requirements alignment

### DevOps
- **deployment-strategist**: Deployment planning
- **environment-guardian**: Environment validation
- **rollback-first-responder**: Recovery planning

## Troubleshooting

### Subagent Not Found

```bash
# Check subagent exists
ls ~/.claude/subagents/

# Validate subagent format
head ~/.claude/subagents/security-auditor.md
```

### Hook Not Triggering

```bash
# Check hook is executable
ls -la ~/.claude/hooks/subagent-trigger.sh

# Check settings.json configuration
cat ~/.claude/settings.json | grep -A5 hooks
```

### Viewing Logs

```bash
# Check hook logs
tail -f ~/.claude/logs/subagent-hooks.log

# Check specific violations
cat ~/.claude/logs/credential-violations.log
```

### Testing Integration

```bash
# Run integration tests
./tests/test_subagent_hook_integration.sh

# Test specific subagent
~/.claude/hooks/subagent-trigger.sh security-auditor test
```

## Best Practices

### 1. **Use Blocking Wisely**
- Security checks: blocking = true
- Documentation: blocking = false
- Performance checks: blocking = false

### 2. **Set Appropriate Timeouts**
- Quick checks: 5000ms
- Analysis tasks: 10000ms
- Complex operations: 30000ms

### 3. **Order Matters**
- Security first (priority: 1)
- Style/formatting second (priority: 2)
- Documentation last (priority: 10)

### 4. **Monitor Performance**
- Check logs for slow subagents
- Adjust timeouts as needed
- Disable non-critical subagents if needed

### 5. **Custom Events**
- Create project-specific event mappings
- Use for specialized workflows
- Document custom events clearly

## Advanced Features

### Running All Subagents for an Event

```bash
# Run all subagents configured for pre_write
~/.claude/hooks/subagent-trigger.sh --event pre_write
```

### Context Passing

The hook passes rich context to subagents:

```json
{
  "timestamp": "2025-08-22T09:30:00Z",
  "event_type": "pre_write",
  "subagent": "security-auditor",
  "tool": "Edit",
  "file": "src/main.py",
  "user": "developer",
  "working_directory": "/project",
  "git_branch": "feature-123"
}
```

### Emergency Override

For critical situations, you can bypass security hooks:

```bash
# Use with extreme caution!
export CLAUDE_SECURITY_OVERRIDE=true
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
- name: Run Security Subagent
  run: |
    ~/.claude/hooks/subagent-trigger.sh security-auditor pre_deployment
    
- name: Run Deployment Strategist
  run: |
    ~/.claude/hooks/subagent-trigger.sh deployment-strategist pre_deployment
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit
~/.claude/hooks/subagent-trigger.sh --event pre_commit || exit 1
```

## Contributing

To add new subagent integrations:

1. Create subagent in `~/.claude/subagents/`
2. Add event mapping in `subagent-hooks.yaml`
3. Configure hook in `settings.json`
4. Test with `test_subagent_hook_integration.sh`

## Security Considerations

- Subagents run with restricted tool access
- Blocking hooks prevent dangerous operations
- All actions are logged for audit
- Sensitive data is redacted in logs
- Emergency override requires explicit action

## Performance Impact

Typical overhead per subagent:
- Discovery: ~5ms
- Validation: ~10ms
- Context gathering: ~20ms
- Execution: 100-5000ms (depends on subagent)
- Total: ~150-5000ms per event

## Future Enhancements

- [ ] Parallel subagent execution
- [ ] Caching for repeated checks
- [ ] Web UI for configuration
- [ ] Metrics and analytics dashboard
- [ ] Integration with more CI/CD platforms
- [ ] Machine learning for event prediction

---

*For more information about Claude Code hooks, see the [Claude Code Hooks System](claude-code-hooks-system.md) documentation.*