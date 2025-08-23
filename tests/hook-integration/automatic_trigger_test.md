# Automatic Hook Trigger Test

Testing if automatic hook triggering works after fixing the invalid `OnError` configuration.

Expected behavior:
1. ✅ PreToolUse: prevent-credential-exposure.sh should log to security-hooks.log
2. ✅ PreToolUse: security-auditor subagent should trigger for Write operations  
3. ✅ PostToolUse: documentation-curator subagent should trigger after Write
4. ✅ PostToolUse: log-all-operations.sh should log tool usage

If this file creation triggers hooks, we'll see entries in:
- ~/.claude/logs/security-hooks.log
- ~/.claude/logs/subagent-hooks.log
- ~/.claude/logs/tool-operations.log

Test performed at: $(date)