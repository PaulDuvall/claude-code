#!/usr/bin/env bash
set -uo pipefail

# Context Management Module for Subagent-Hook Integration
#
# Thin orchestrator that coordinates context gathering, file operations,
# and provides accessors for context data.

# Include guard
[[ -n "${_CONTEXT_MANAGER_LOADED:-}" ]] && return 0
_CONTEXT_MANAGER_LOADED=1

# Source sub-modules
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config-constants.sh"
source "$SCRIPT_DIR/file-utils.sh"
source "$SCRIPT_DIR/error-handler.sh"
source "$SCRIPT_DIR/context-gathering.sh"
source "$SCRIPT_DIR/context-file-ops.sh"

##################################
# Context Structure
##################################

# Global variables for context management
CONTEXT_FILE=""
CONTEXT_DATA=""

##################################
# Complete Context Gathering
##################################

gather_complete_context() {
    local event_type="${1:-unknown}"
    local subagent_name="${2:-unknown}"
    local additional_context="${3:-}"
    local include_system="${4:-false}"

    log_info "Gathering complete context for subagent: $subagent_name"

    if ! gather_basic_context "$event_type" "$subagent_name" "$additional_context"; then
        log_error "Failed to gather basic context"
        return $EXIT_GENERAL_ERROR
    fi

    if ! gather_claude_context; then
        log_error "Failed to gather Claude context"
        return $EXIT_GENERAL_ERROR
    fi

    if ! gather_git_context; then
        log_warning "Failed to gather Git context (continuing)"
    fi

    if ! gather_file_context; then
        log_warning "Failed to gather file context (continuing)"
    fi

    if [[ "$include_system" == true ]]; then
        if ! gather_system_context; then
            log_warning "Failed to gather system context (continuing)"
        fi
    fi

    if [[ -n "$additional_context" ]]; then
        add_additional_context "$additional_context"
    fi

    log_info "Complete context gathering finished"
    return $EXIT_SUCCESS
}

##################################
# Context Access Functions
##################################

get_context_file() {
    echo "$CONTEXT_FILE"
}

get_context_data() {
    echo "$CONTEXT_DATA"
}

get_context_field() {
    local field_path="$1"
    local context_data="${2:-$CONTEXT_DATA}"

    if [[ -z "$field_path" ]]; then
        log_error "Field path is required"
        return $EXIT_VALIDATION_FAILED
    fi

    if command -v jq >/dev/null 2>&1; then
        echo "$context_data" | jq -r "$field_path" 2>/dev/null || echo ""
    else
        log_warning "jq not available, cannot extract field: $field_path"
        return $EXIT_GENERAL_ERROR
    fi
}

##################################
# Context Debugging Functions
##################################

dump_context() {
    local format="${1:-json}"
    local context_data="${2:-$CONTEXT_DATA}"

    log_info "Dumping context (format: $format)"

    case "$format" in
        "json")
            if command -v jq >/dev/null 2>&1; then
                echo "$context_data" | jq .
            else
                echo "$context_data"
            fi
            ;;
        "yaml")
            if command -v yq >/dev/null 2>&1; then
                echo "$context_data" | yq .
            else
                log_warning "yq not available, falling back to JSON"
                dump_context "json" "$context_data"
            fi
            ;;
        "text"|*)
            echo "Context Summary:"
            echo "==============="
            if command -v jq >/dev/null 2>&1; then
                echo "Event: $(echo "$context_data" | jq -r '.event.type // "unknown"')"
                echo "Subagent: $(echo "$context_data" | jq -r '.event.subagent // "unknown"')"
                echo "User: $(echo "$context_data" | jq -r '.environment.user // "unknown"')"
                echo "Working Directory: $(echo "$context_data" | jq -r '.environment.working_directory // "unknown"')"
                echo "Timestamp: $(echo "$context_data" | jq -r '.metadata.timestamp // "unknown"')"
            else
                echo "Raw context data:"
                echo "$context_data"
            fi
            ;;
    esac
}

##################################
# Initialization
##################################

initialize_context_manager() {
    log_debug "Context manager module initialized"

    if [[ ! -d "/tmp" ]]; then
        log_error "Temporary directory not available"
        return $EXIT_GENERAL_ERROR
    fi

    return $EXIT_SUCCESS
}
