#!/usr/bin/env bash
set -euo pipefail

# Claude Code Hook: Error Handling Trigger
# 
# Purpose: Lightweight trigger for automatic debugging assistance on errors
# Trigger: OnError events or manual invocation during debugging sessions
# Approach: Capture error context and delegate to debug-specialist subagent
#
# This hook provides immediate debugging help by gathering error context
# and connecting users with the debug-specialist subagent.

##################################
# Load Shared Libraries
##################################
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB_DIR="$SCRIPT_DIR/lib"

# Load essential modules for error context gathering
source "$LIB_DIR/config-constants.sh" 
source "$LIB_DIR/context-manager.sh"
source "$LIB_DIR/error-handler.sh"
source "$LIB_DIR/file-utils.sh"

##################################
# Error Context Gathering
##################################
gather_error_context() {
    local error_type="${1:-unknown}"
    local error_message="${2:-No error message provided}"
    local failed_command="${3:-unknown}"
    
    log_info "Gathering error context for debugging assistance"
    
    # Capture comprehensive error context
    local context_data
    context_data=$(cat <<EOF
{
  "trigger": "on_error_debug",
  "error_info": {
    "type": "$error_type",
    "message": "$error_message", 
    "failed_command": "$failed_command",
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  },
  "environment": {
    "tool": "${CLAUDE_TOOL:-unknown}",
    "file": "${CLAUDE_FILE:-none}",
    "working_directory": "$(pwd)",
    "user": "$USER",
    "shell": "${SHELL##*/}",
    "session_id": "${CLAUDE_SESSION_ID:-$$}"
  },
  "project_context": {
    "git_branch": "$(git branch --show-current 2>/dev/null || echo 'not-in-git')",
    "git_status": "$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ') modified files",
    "recent_files": $(find . -maxdepth 2 -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.go" -o -name "*.java" -o -name "*.md" | head -5 | jq -R -s 'split("\n")[:-1]')
  },
  "system_context": {
    "os": "$(uname -s)",
    "hostname": "$(hostname)", 
    "processes": "$(ps aux | wc -l | tr -d ' ') running processes"
  }
}
EOF
    )
    
    echo "$context_data"
}

##################################
# System Diagnostics
##################################
gather_diagnostic_info() {
    local diagnostic_info=""
    
    # Check recent error logs if available
    if [[ -f "$LOG_FILE" ]]; then
        local recent_errors
        recent_errors=$(tail -20 "$LOG_FILE" 2>/dev/null | grep -i error || echo "No recent errors in log")
        diagnostic_info+="\nRecent log errors:\n$recent_errors"
    fi
    
    # Check system resources
    if command -v df >/dev/null; then
        local disk_usage
        disk_usage=$(df -h . | tail -1 | awk '{print "Disk: " $4 " available"}')
        diagnostic_info+="\n\nSystem resources:\n$disk_usage"
    fi
    
    # Check for common environment issues
    if [[ -f "package.json" ]] && command -v npm >/dev/null; then
        diagnostic_info+="\nNode.js project detected"
        diagnostic_info+="\nNPM version: $(npm --version 2>/dev/null || echo 'npm not available')"
    fi
    
    if [[ -f "requirements.txt" ]] && command -v python >/dev/null; then
        diagnostic_info+="\nPython project detected"  
        diagnostic_info+="\nPython version: $(python --version 2>/dev/null || echo 'python not available')"
    fi
    
    echo "$diagnostic_info"
}

##################################
# Subagent Delegation  
##################################
delegate_to_debug_subagent() {
    local context="$1"
    local diagnostics="$2"
    local error_message="$3"
    
    log_info "Delegating error analysis to debug-specialist subagent"
    
    echo "🐛 ERROR DETECTED: Automatic debugging assistance activated"
    echo ""
    echo "Error Details:"
    echo "  Message: $error_message"
    echo "  Tool: ${CLAUDE_TOOL:-unknown}"
    echo "  File: ${CLAUDE_FILE:-none}"
    echo "  Time: $(date)"
    echo ""
    
    if [[ -n "$diagnostics" ]]; then
        echo "System Diagnostics:"
        echo "$diagnostics"
        echo ""
    fi
    
    echo "Context for debug-specialist subagent:"
    echo "$context" | jq . 2>/dev/null || echo "$context"
    echo ""
    echo "🔍 DEBUG REQUEST:"
    echo "Please analyze the error above and provide:"
    echo "- Root cause analysis"
    echo "- Step-by-step troubleshooting approach"  
    echo "- Specific commands or fixes to try"
    echo "- Prevention strategies for similar issues"
    echo ""
    echo "Type your analysis or questions about this error."
}

##################################
# Quick Error Classification
##################################
classify_error() {
    local error_message="$1"
    local error_type="general"
    
    # Basic error pattern matching for better context
    case "$error_message" in
        *"permission denied"*|*"Permission denied"*)
            error_type="permission_error"
            ;;
        *"command not found"*|*"Command not found"*)
            error_type="command_not_found"
            ;;
        *"No such file"*|*"cannot find"*)
            error_type="file_not_found" 
            ;;
        *"syntax error"*|*"Syntax error"*)
            error_type="syntax_error"
            ;;
        *"connection"*|*"network"*|*"timeout"*)
            error_type="network_error"
            ;;
        *"import"*|*"module"*|*"package"*)
            error_type="dependency_error"
            ;;
        *)
            error_type="general_error"
            ;;
    esac
    
    echo "$error_type"
}

##################################
# Main Hook Logic  
##################################
main() {
    # Initialize error handling (ironic for an error hook, but important!)
    initialize_error_handling || {
        echo "ERROR: Failed to initialize error handling in error hook" >&2
        exit 1
    }
    
    local error_message="${1:-Unknown error occurred}"
    local failed_command="${2:-unknown}"
    
    log_info "Error hook triggered: $error_message"
    
    # Classify the error type
    local error_type
    error_type=$(classify_error "$error_message")
    
    # Gather comprehensive error context
    local context
    context=$(gather_error_context "$error_type" "$error_message" "$failed_command")
    
    # Gather additional diagnostic information
    local diagnostics
    diagnostics=$(gather_diagnostic_info)
    
    # Delegate to debug-specialist subagent
    delegate_to_debug_subagent "$context" "$diagnostics" "$error_message"
    
    log_info "Debug delegation completed for error: $error_type"
}

##################################
# Execute Hook
##################################
# Handle both direct invocation and error trap scenarios
if [[ "${1:-}" == "--trap" ]]; then
    # Called from an error trap
    main "Script error at line ${2:-unknown}" "${3:-unknown command}"
else
    # Called directly with error information
    main "$@"
fi