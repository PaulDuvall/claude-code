#!/usr/bin/env bash
set -euo pipefail

# Claude Code Hook: Subagent Event Trigger
#
# Purpose: Bridge between Claude Code hooks and subagents, enabling event-driven subagent execution
# Usage: subagent-trigger.sh [OPTIONS] <subagent-name> [event-type] [additional-context]
#        subagent-trigger.sh [OPTIONS] --event <event-type>
#        subagent-trigger.sh --simple <subagent-name> [event-type] [additional-context]
# Trigger: Can be used in PreToolUse, PostToolUse, or custom hook configurations
#
# --simple mode provides lightweight delegation without the full execution engine,
# loading only essential modules for minimal overhead.

##################################
# Script Location
##################################
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB_DIR="$SCRIPT_DIR/lib"

##################################
# Simple Mode Detection
##################################
_SIMPLE_MODE=false
if [[ "${1:-}" == "--simple" ]]; then
    _SIMPLE_MODE=true
    shift
fi

##################################
# Module Loading
##################################
# Core modules always loaded
source "$LIB_DIR/config-constants.sh"
source "$LIB_DIR/file-utils.sh"
source "$LIB_DIR/error-handler.sh"

if [[ "$_SIMPLE_MODE" == true ]]; then
    # Simple mode: only load context-manager for json_escape
    source "$LIB_DIR/context-manager.sh"
else
    # Full mode: load all orchestration modules
    source "$LIB_DIR/argument-parser.sh"
    source "$LIB_DIR/subagent-discovery.sh"
    source "$LIB_DIR/subagent-validator.sh"
    source "$LIB_DIR/context-manager.sh"
    source "$LIB_DIR/execution-engine.sh"
fi

##################################
# Simple Mode Functions
##################################
show_simple_usage() {
    cat <<EOF
Usage: subagent-trigger.sh --simple <subagent-name> [event-type] [additional-context]

Lightweight subagent trigger for event-driven AI assistance.

Arguments:
  subagent-name     Name of the subagent to invoke (required)
  event-type        Type of event (default: manual)
  additional-context Additional context information (optional)

Examples:
  subagent-trigger.sh --simple security-auditor pre_write
  subagent-trigger.sh --simple style-enforcer pre_commit "Check Python files"
  subagent-trigger.sh --simple debug-specialist on_error "ImportError in main.py"

Available Events: ${SUPPORTED_EVENTS[*]}
EOF
}

gather_simple_context() {
    local subagent_name="$1"
    local event_type="$2"
    local additional_context="$3"

    local safe_name safe_event safe_ctx safe_user safe_wd safe_branch
    safe_name=$(json_escape "$subagent_name")
    safe_event=$(json_escape "$event_type")
    safe_ctx=$(json_escape "$additional_context")
    safe_user=$(json_escape "$USER")
    safe_wd=$(json_escape "$(pwd)")
    safe_branch=$(json_escape "$(git branch --show-current 2>/dev/null || echo 'not-in-git')")

    cat <<EOF
{
  "trigger": "simple_subagent_trigger",
  "subagent": "$safe_name",
  "event": "$safe_event",
  "additional_context": "$safe_ctx",
  "environment": {
    "tool": "${CLAUDE_TOOL:-unknown}",
    "file": "${CLAUDE_FILE:-none}",
    "user": "$safe_user",
    "working_directory": "$safe_wd",
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "session_id": "${CLAUDE_SESSION_ID:-$$}"
  },
  "project": {
    "git_branch": "$safe_branch"
  }
}
EOF
}

validate_simple_arguments() {
    local subagent_name="$1"
    local event_type="$2"

    if [[ -z "$subagent_name" ]]; then
        echo "ERROR: Subagent name is required" >&2
        show_simple_usage >&2
        return 1
    fi

    if [[ -n "$event_type" ]] && [[ "$event_type" != "manual" ]]; then
        if ! is_supported_event "$event_type"; then
            log_warning "Event type '$event_type' not in supported list"
            log_info "Supported events: ${SUPPORTED_EVENTS[*]}"
        fi
    fi

    return 0
}

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

run_simple_mode() {
    local subagent_name="${1:-}"
    local event_type="${2:-manual}"
    local additional_context="${3:-}"

    # Handle help request
    if [[ "$subagent_name" == "--help" ]] || [[ "$subagent_name" == "-h" ]] || [[ -z "$subagent_name" ]]; then
        show_simple_usage
        exit 0
    fi

    # Initialize minimal error handling
    initialize_error_handling || {
        echo "ERROR: Failed to initialize error handling" >&2
        exit 1
    }

    # Validate input arguments
    if ! validate_simple_arguments "$subagent_name" "$event_type"; then
        exit 1
    fi

    # Gather context
    local context
    context=$(gather_simple_context "$subagent_name" "$event_type" "$additional_context")

    # Delegate to subagent
    delegate_to_subagent "$subagent_name" "$event_type" "$context"

    log_info "Simple trigger completed for: $subagent_name"
    exit 0
}

##################################
# Full Mode: Initialization
##################################
initialize_all_modules() {
    log_debug "Initializing all modules"

    initialize_error_handling || {
        echo "FATAL: Error handling initialization failed" >&2
        exit $EXIT_GENERAL_ERROR
    }

    initialize_argument_parser || {
        log_error "Argument parser initialization failed"
        return $EXIT_GENERAL_ERROR
    }

    initialize_subagent_discovery || {
        log_error "Subagent discovery initialization failed"
        return $EXIT_GENERAL_ERROR
    }

    initialize_subagent_validator || {
        log_error "Subagent validator initialization failed"
        return $EXIT_GENERAL_ERROR
    }

    initialize_context_manager || {
        log_error "Context manager initialization failed"
        return $EXIT_GENERAL_ERROR
    }

    initialize_execution_engine || {
        log_error "Execution engine initialization failed"
        return $EXIT_GENERAL_ERROR
    }

    log_debug "All modules initialized successfully"
    return $EXIT_SUCCESS
}

##################################
# Full Mode: Core Workflow
##################################
execute_single_subagent() {
    local subagent_name="$1"
    local event_type="$2"
    local additional_context="$3"

    log_info "Executing single subagent: $subagent_name for event: $event_type"

    local subagent_file
    if ! subagent_file=$(find_subagent "$subagent_name"); then
        handle_missing_subagent "$subagent_name"
        return $EXIT_SUBAGENT_NOT_FOUND
    fi

    log_debug "Found subagent file: $subagent_file"

    if ! validate_subagent_file "$subagent_file" "strict"; then
        handle_validation_failure "$subagent_name" "file validation failed"
        return $EXIT_VALIDATION_FAILED
    fi

    if ! create_context_file "$subagent_name" "$event_type"; then
        log_error "Failed to create context file"
        return $EXIT_GENERAL_ERROR
    fi

    local context_file
    context_file=$(get_context_file)

    if ! gather_complete_context "$event_type" "$subagent_name" "$additional_context" "false"; then
        log_error "Failed to gather context"
        cleanup_context_file
        return $EXIT_GENERAL_ERROR
    fi

    if ! write_context_to_file "$context_file"; then
        log_error "Failed to write context to file"
        cleanup_context_file
        return $EXIT_GENERAL_ERROR
    fi

    local execution_mode timeout
    execution_mode=$(determine_execution_mode "$event_type" "$(get_parsed_execution_mode)")
    timeout=$(get_timeout_for_execution "$event_type" "$subagent_name")

    if is_dry_run; then
        execution_mode="dry-run"
    fi

    if ! execute_subagent "$subagent_file" "$context_file" "$execution_mode" "$timeout"; then
        log_error "Subagent execution failed: $subagent_name"
        cleanup_context_file
        return $EXIT_EXECUTION_FAILED
    fi

    cleanup_context_file

    log_info "Single subagent execution completed successfully: $subagent_name"
    return $EXIT_SUCCESS
}

execute_event_based_subagents() {
    local event_type="$1"
    local additional_context="$2"

    log_info "Executing event-based subagents for event: $event_type"

    if ! create_context_file "event-$event_type" "$event_type"; then
        log_error "Failed to create context file for event execution"
        return $EXIT_GENERAL_ERROR
    fi

    local context_file
    context_file=$(get_context_file)

    if ! gather_complete_context "$event_type" "event-based" "$additional_context" "false"; then
        log_error "Failed to gather context for event execution"
        cleanup_context_file
        return $EXIT_GENERAL_ERROR
    fi

    if ! write_context_to_file "$context_file"; then
        log_error "Failed to write context to file for event execution"
        cleanup_context_file
        return $EXIT_GENERAL_ERROR
    fi

    local execution_mode
    execution_mode=$(determine_execution_mode "$event_type" "$(get_parsed_execution_mode)")

    if ! execute_multiple_subagents "$event_type" "$context_file" "$execution_mode"; then
        log_error "Event-based subagent execution failed for event: $event_type"
        cleanup_context_file
        return $EXIT_EXECUTION_FAILED
    fi

    cleanup_context_file

    log_info "Event-based subagent execution completed successfully: $event_type"
    return $EXIT_SUCCESS
}

##################################
# Main Hook Logic
##################################
main() {
    # Route to simple mode if flag was detected
    if [[ "$_SIMPLE_MODE" == true ]]; then
        run_simple_mode "$@"
        return
    fi

    # Full mode: initialize all modules
    if ! initialize_all_modules; then
        echo "FATAL: Module initialization failed" >&2
        exit $EXIT_GENERAL_ERROR
    fi

    if ! parse_arguments "$@"; then
        safe_exit $EXIT_VALIDATION_FAILED
    fi

    if is_help_requested; then
        show_usage
        safe_exit $EXIT_SUCCESS
    fi

    if is_debug_mode; then
        log_parsed_arguments
    fi

    local subagent_name event_type additional_context execution_mode
    subagent_name=$(get_parsed_subagent_name)
    event_type=$(get_parsed_event_type)
    additional_context=$(get_parsed_additional_context)
    execution_mode=$(get_parsed_execution_mode)

    log_info "Starting subagent hook execution"
    log_info "Mode: $execution_mode, Event: $event_type"

    local exit_code
    case "$execution_mode" in
        "event-based")
            execute_event_based_subagents "$event_type" "$additional_context"
            exit_code=$?
            ;;
        *)
            execute_single_subagent "$subagent_name" "$event_type" "$additional_context"
            exit_code=$?
            ;;
    esac

    if [[ $exit_code -eq $EXIT_SUCCESS ]]; then
        log_info "Subagent hook completed successfully"
    else
        log_error "Subagent hook failed with exit code: $exit_code"
    fi

    safe_exit $exit_code
}

##################################
# Execute Main Function
##################################
main "$@"
