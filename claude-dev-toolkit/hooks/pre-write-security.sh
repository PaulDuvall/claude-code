#!/usr/bin/env bash
set -euo pipefail

# Claude Code Hook: Pre-Write Security Check
# 
# Purpose: Lightweight trigger for security scanning before file modifications
# Trigger: PreToolUse for Edit, Write, MultiEdit tools
# Approach: Gather context and delegate complex logic to security-auditor subagent
#
# This hook provides immediate security feedback by leveraging AI reasoning
# rather than complex bash pattern matching.

##################################
# Load Shared Libraries
##################################
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB_DIR="$SCRIPT_DIR/lib"

# Load only essential modules for lightweight operation
source "$LIB_DIR/config-constants.sh"
source "$LIB_DIR/context-manager.sh" 
source "$LIB_DIR/error-handler.sh"

##################################
# Simple Context Gathering
##################################
gather_security_context() {
    local tool="${CLAUDE_TOOL:-unknown}"
    local file="${CLAUDE_FILE:-none}"
    
    log_info "Pre-write security check triggered for: $tool on $file"
    
    # Create lightweight context for subagent
    local context_data
    context_data=$(cat <<EOF
{
  "trigger": "pre_write_security",
  "tool": "$tool",
  "file": "$file", 
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "user": "$USER",
  "working_directory": "$(pwd)",
  "git_branch": "$(git branch --show-current 2>/dev/null || echo 'not-in-git')",
  "session_id": "${CLAUDE_SESSION_ID:-$$}"
}
EOF
    )
    
    echo "$context_data"
}

##################################
# Subagent Delegation
##################################
delegate_to_security_subagent() {
    local context="$1"
    
    # Log the delegation
    log_info "Delegating security analysis to security-auditor subagent"
    
    # In the hybrid approach, we provide context and let Claude Code 
    # handle the subagent execution through its native mechanisms
    echo "🔒 SECURITY CHECK: Analyzing $CLAUDE_TOOL operation on $CLAUDE_FILE"
    echo ""
    echo "Context for security-auditor subagent:"
    echo "$context" | jq . 2>/dev/null || echo "$context"
    echo ""
    echo "Please review the operation above for:"
    echo "- Credential exposure (API keys, passwords, tokens)" 
    echo "- Security vulnerabilities (SQL injection, XSS, etc.)"
    echo "- Sensitive data handling"
    echo "- Access control issues"
    echo ""
    echo "Type 'continue' if the operation is secure, or provide specific security concerns."
}

##################################
# Main Hook Logic
##################################
main() {
    # Initialize error handling
    initialize_error_handling || {
        echo "ERROR: Failed to initialize error handling" >&2
        exit 1
    }
    
    # Gather context for security analysis
    local context
    context=$(gather_security_context)
    
    # Check if this is a security-relevant operation
    case "${CLAUDE_TOOL:-}" in
        Edit|Write|MultiEdit)
            log_debug "Security-relevant tool detected: $CLAUDE_TOOL"
            delegate_to_security_subagent "$context"
            ;;
        *)
            log_debug "Non-security-relevant tool: ${CLAUDE_TOOL:-unknown}"
            exit 0
            ;;
    esac
}

##################################
# Execute Hook
##################################
main "$@"