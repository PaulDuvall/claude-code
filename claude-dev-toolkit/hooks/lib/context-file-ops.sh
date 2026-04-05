#!/usr/bin/env bash
set -uo pipefail

# Context File Operations Module for Subagent-Hook Integration
#
# Provides functions to create, write, validate, and clean up context files
# used to pass context data to subagents during hook execution.

# Include guard
[[ -n "${_CONTEXT_FILE_OPS_LOADED:-}" ]] && return 0
_CONTEXT_FILE_OPS_LOADED=1

# Source required modules
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config-constants.sh"
source "$SCRIPT_DIR/file-utils.sh"
source "$SCRIPT_DIR/error-handler.sh"

##################################
# Context File Management
##################################

create_context_file() {
    local subagent_name="${1:-unknown}"
    local event_type="${2:-unknown}"

    log_debug "Creating context file for $subagent_name"

    local temp_file
    if ! temp_file=$(create_temp_file "$CONTEXT_FILE_PREFIX" "${subagent_name}-${event_type}-$$"); then
        log_error "Failed to create context temp file"
        return $EXIT_GENERAL_ERROR
    fi

    CONTEXT_FILE="$temp_file"
    log_debug "Context file created: $CONTEXT_FILE"
    return $EXIT_SUCCESS
}

write_context_to_file() {
    local context_file="${1:-$CONTEXT_FILE}"
    local context_data="${2:-$CONTEXT_DATA}"

    if [[ -z "$context_file" ]]; then
        log_error "Context file path not specified"
        return $EXIT_GENERAL_ERROR
    fi

    if [[ -z "$context_data" ]]; then
        log_error "No context data to write"
        return $EXIT_GENERAL_ERROR
    fi

    log_debug "Writing context data to file: $context_file"

    if command -v jq >/dev/null 2>&1; then
        if ! echo "$context_data" | jq . >/dev/null 2>&1; then
            log_warning "Context data is not valid JSON, writing as-is"
        fi
    fi

    if ! echo "$context_data" > "$context_file" 2>/dev/null; then
        log_error "Failed to write context data to file: $context_file"
        return $EXIT_GENERAL_ERROR
    fi

    log_debug "Context data written successfully: $context_file"
    return $EXIT_SUCCESS
}

##################################
# Context Validation Functions
##################################

validate_context_data() {
    local context_data="${1:-$CONTEXT_DATA}"

    if [[ -z "$context_data" ]]; then
        log_error "No context data to validate"
        return $EXIT_VALIDATION_FAILED
    fi

    log_debug "Validating context data"

    if command -v jq >/dev/null 2>&1; then
        if ! echo "$context_data" | jq . >/dev/null 2>&1; then
            log_error "Context data is not valid JSON"
            return $EXIT_VALIDATION_FAILED
        fi
    fi

    local required_fields=("metadata" "event" "environment")
    local field

    for field in "${required_fields[@]}"; do
        if command -v jq >/dev/null 2>&1; then
            if ! echo "$context_data" | jq -e ".$field" >/dev/null 2>&1; then
                log_error "Required context field missing: $field"
                return $EXIT_VALIDATION_FAILED
            fi
        else
            if ! echo "$context_data" | grep -q "\"$field\""; then
                log_error "Required context field missing: $field"
                return $EXIT_VALIDATION_FAILED
            fi
        fi
    done

    log_debug "Context data validation passed"
    return $EXIT_SUCCESS
}

validate_context_file() {
    local context_file="${1:-$CONTEXT_FILE}"

    if [[ -z "$context_file" ]]; then
        log_error "No context file specified"
        return $EXIT_VALIDATION_FAILED
    fi

    if ! file_exists_and_readable "$context_file"; then
        log_error "Context file not accessible: $context_file"
        return $EXIT_VALIDATION_FAILED
    fi

    local content
    if ! content=$(read_file_safely "$context_file"); then
        log_error "Failed to read context file: $context_file"
        return $EXIT_VALIDATION_FAILED
    fi

    if ! validate_context_data "$content"; then
        log_error "Context file contains invalid data: $context_file"
        return $EXIT_VALIDATION_FAILED
    fi

    log_debug "Context file validation passed: $context_file"
    return $EXIT_SUCCESS
}

##################################
# Context Cleanup Functions
##################################

cleanup_context_file() {
    local context_file="${1:-$CONTEXT_FILE}"

    if [[ -n "$context_file" ]] && [[ -f "$context_file" ]]; then
        log_debug "Cleaning up context file: $context_file"
        cleanup_specific_temp_file "$context_file"
    fi

    CONTEXT_FILE=""
    CONTEXT_DATA=""

    return $EXIT_SUCCESS
}

cleanup_all_context_files() {
    log_debug "Cleaning up all context files"
    cleanup_temp_files "$CONTEXT_FILE_PREFIX*"
    return $EXIT_SUCCESS
}
