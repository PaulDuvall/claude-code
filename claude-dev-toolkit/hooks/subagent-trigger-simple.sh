#!/usr/bin/env bash
set -euo pipefail

# Claude Code Hook: Simple Subagent Trigger  
# 
# Purpose: Lightweight trigger for delegating to any subagent
# Usage: subagent-trigger-simple.sh <subagent-name> [event-type] [context]
# Approach: Minimal orchestration - gather context and delegate to subagents
#
# This is the simplified version of the original 253-line subagent-trigger.sh,
# focusing on clean delegation rather than complex orchestration.

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
# Usage Information
##################################
show_usage() {
    cat <<EOF
Usage: subagent-trigger-simple.sh <subagent-name> [event-type] [additional-context]

Lightweight subagent trigger for event-driven AI assistance.

Arguments:
  subagent-name     Name of the subagent to invoke (required)
  event-type        Type of event (default: manual)  
  additional-context Additional context information (optional)

Examples:
  subagent-trigger-simple.sh security-auditor pre_write
  subagent-trigger-simple.sh style-enforcer pre_commit "Check Python files"
  subagent-trigger-simple.sh debug-specialist on_error "ImportError in main.py"

Available Events: ${SUPPORTED_EVENTS[*]}
EOF
}

##################################
# Simple Context Gathering
##################################
gather_simple_context() {
    local subagent_name="$1"
    local event_type="$2" 
    local additional_context="$3"
    
    # Create lightweight context - much simpler than the original
    local context_data
    context_data=$(cat <<EOF
{
  "trigger": "simple_subagent_trigger",
  "subagent": "$subagent_name",
  "event": "$event_type",
  "additional_context": "$additional_context",
  "environment": {
    "tool": "${CLAUDE_TOOL:-unknown}",
    "file": "${CLAUDE_FILE:-none}", 
    "user": "$USER",
    "working_directory": "$(pwd)",
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "session_id": "${CLAUDE_SESSION_ID:-$$}"
  },
  "project": {
    "git_branch": "$(git branch --show-current 2>/dev/null || echo 'not-in-git')"
  }
}
EOF
    )
    
    echo "$context_data"
}

##################################
# Subagent Validation
##################################
validate_subagent_exists() {
    local subagent_name="$1"
    
    # Simple existence check - leverage the existing validation if needed
    local common_subagents=("security-auditor" "style-enforcer" "debug-specialist" "test-writer")
    
    for known_subagent in "${common_subagents[@]}"; do
        if [[ "$subagent_name" == "$known_subagent" ]]; then
            return 0
        fi
    done
    
    # If not a known subagent, still allow but warn
    log_warning "Subagent '$subagent_name' not in known list, proceeding anyway"
    return 0
}

##################################
# Simple Delegation
##################################
delegate_to_subagent() {
    local subagent_name="$1"
    local event_type="$2"
    local context="$3"
    
    log_info "Delegating to subagent: $subagent_name for event: $event_type"
    
    echo "🤖 SUBAGENT TRIGGER: Invoking $subagent_name"
    echo ""
    echo "Event: $event_type" 
    echo "Triggered by: ${CLAUDE_TOOL:-manual}"
    echo "Target: ${CLAUDE_FILE:-general}"
    echo "Time: $(date)"
    echo ""
    echo "Context for $subagent_name:"
    echo "$context" | jq . 2>/dev/null || echo "$context"
    echo ""
    echo "🎯 REQUEST:"
    echo "Please handle this $event_type event with your specialized expertise."
    echo "Analyze the context above and provide appropriate assistance."
}

##################################
# Input Validation
##################################
validate_arguments() {
    local subagent_name="$1"
    local event_type="$2"
    
    # Basic argument validation
    if [[ -z "$subagent_name" ]]; then
        echo "ERROR: Subagent name is required" >&2
        show_usage >&2
        return 1
    fi
    
    # Validate event type if provided
    if [[ -n "$event_type" ]] && [[ "$event_type" != "manual" ]]; then
        if ! is_supported_event "$event_type"; then
            log_warning "Event type '$event_type' not in supported list"
            log_info "Supported events: ${SUPPORTED_EVENTS[*]}"
        fi
    fi
    
    return 0
}

##################################
# Main Logic (Simplified)
##################################
main() {
    local subagent_name="${1:-}"
    local event_type="${2:-manual}"
    local additional_context="${3:-}"
    
    # Handle help request
    if [[ "$subagent_name" == "--help" ]] || [[ "$subagent_name" == "-h" ]] || [[ -z "$subagent_name" ]]; then
        show_usage
        exit 0
    fi
    
    # Initialize minimal error handling  
    initialize_error_handling || {
        echo "ERROR: Failed to initialize error handling" >&2
        exit 1
    }
    
    # Validate input arguments
    if ! validate_arguments "$subagent_name" "$event_type"; then
        exit 1
    fi
    
    # Validate subagent exists (lenient check)
    validate_subagent_exists "$subagent_name"
    
    # Gather context (much simpler than original)
    local context
    context=$(gather_simple_context "$subagent_name" "$event_type" "$additional_context")
    
    # Delegate to subagent (no complex execution engine needed)
    delegate_to_subagent "$subagent_name" "$event_type" "$context"
    
    log_info "Simple trigger completed for: $subagent_name"
    exit 0
}

##################################
# Execute (Clean and Simple)
##################################
main "$@"