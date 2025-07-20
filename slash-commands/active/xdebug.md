---
description: Interactive debugging support with error analysis and fix suggestions
tags: [debugging, troubleshooting, errors]
---

Debug and analyze errors with root cause identification and fix suggestions.

## Usage Examples

**Analyze recent errors:**
```
/xdebug
```

**Debug specific error:**
```
/xdebug "ImportError: No module named 'requests'"
```

**Debug failing test:**
```
/xdebug test_user_login
```

**Help and debugging options:**
```
/xdebug --help
```

## Implementation

If $ARGUMENTS contains "help" or "--help":
Display this usage information and exit.

Parse the error or issue from $ARGUMENTS. If no specific error is provided, check for recent errors:
!tail -50 *.log 2>/dev/null | grep -i "error\|exception\|failed" || echo "No recent errors in log files"

Based on the error context, perform the following debugging steps:

1. **Error Classification**:
   - Identify the error type (syntax, runtime, logic, configuration)
   - Determine the severity and impact
   - Check if this is a known issue pattern

2. **Root Cause Analysis**:
   - Trace the error back to its source
   - Examine the stack trace if available
   - Check related code sections using @<relevant_file> references
   - Look for similar patterns in the codebase

3. **Environmental Factors**:
   - Check environment variables and configuration
   - Verify dependencies are installed correctly
   - Look for version mismatches

4. **Test Isolation**:
   - Identify which tests are failing
   - Check if the error is reproducible
   - Determine if it's environment-specific

For Python errors, gather additional context:
!python --version
!pip list | grep -E "(package1|package2)" 2>/dev/null

For JavaScript/Node errors:
!node --version
!npm list --depth=0 2>/dev/null

Think step by step about the debugging process:

1. What is the exact error message and where does it occur?
2. What are the possible causes based on the error type?
3. What code changes or environmental factors might have triggered this?
4. What are the most likely solutions?

Provide debugging assistance in this format:

```
🔍 DEBUG ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Error: [Error type and message]
Location: [File:line or component]

📍 ROOT CAUSE
[Detailed explanation of why this error occurs]

🔧 SUGGESTED FIX
[Step-by-step fix with code examples]

📋 VERIFICATION
[Commands or steps to verify the fix works]

💡 PREVENTION
[How to prevent this error in the future]
```

If the error involves a specific file mentioned in the error message, examine it:
@<error_file_path>

For test failures, run relevant tests:
!python -m pytest <test_file> -v 2>/dev/null || npm test <test_file> 2>/dev/null

Provide specific, actionable debugging steps rather than generic advice.