#!/usr/bin/env bash
set -uo pipefail

# Execution Results Module
#
# Provides result processing, blocking condition detection,
# and output handling for subagent executions.
# Extracted from execution-engine.sh.

# Include guard
[[ -n "${_EXECUTION_RESULTS_LOADED:-}" ]] && return 0
_EXECUTION_RESULTS_LOADED=1

# Source required modules
SCRIPT_DIR="${SCRIPT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
source "$SCRIPT_DIR/config-constants.sh"
source "$SCRIPT_DIR/file-utils.sh"
source "$SCRIPT_DIR/error-handler.sh"

##################################
# Result Processing Functions
##################################

process_execution_results() {
    local subagent_name="$1"
    local execution_mode="$2"

    log_debug "Processing execution results for: $subagent_name"

    if [[ ! -f "$EXECUTION_OUTPUT_FILE" ]]; then
        log_error "Execution output file not found: $EXECUTION_OUTPUT_FILE"
        return $EXIT_EXECUTION_FAILED
    fi

    # Read execution output
    local output_content
    if ! output_content=$(read_file_safely "$EXECUTION_OUTPUT_FILE"); then
        log_error "Failed to read execution output"
        return $EXIT_EXECUTION_FAILED
    fi

    EXECUTION_RESULT="$output_content"

    # Check for blocking conditions in output
    if check_for_blocking_conditions "$output_content"; then
        log_warning "Subagent $subagent_name recommends BLOCKING the operation"

        if [[ "$execution_mode" == "blocking" ]]; then
            display_blocking_message "$subagent_name" "$output_content"
            return $EXIT_EXECUTION_FAILED
        else
            log_warning "Non-blocking mode: continuing despite blocking recommendation"
        fi
    fi

    log_info "Execution results processed successfully: $subagent_name"
    return $EXIT_SUCCESS
}

check_for_blocking_conditions() {
    local output_content="$1"

    # First check for positive/safe patterns - these override blocking
    local safe_patterns=(
        "Operation appears safe to proceed"
        "Continue with planned action"
        "No security violations detected"
        "Status: Executed successfully"
        "safe to proceed"
        "continue with"
    )

    local pattern
    for pattern in "${safe_patterns[@]}"; do
        if echo "$output_content" | grep -qi "$pattern"; then
            log_debug "Safe operation pattern found: $pattern"
            return $EXIT_GENERAL_ERROR  # No blocking condition
        fi
    done

    # Look for explicit blocking directives only
    local blocking_patterns=(
        "OPERATION MUST BE BLOCKED"
        "SECURITY VIOLATION DETECTED"
        "CRITICAL ERROR - STOP"
        "STOP EXECUTION IMMEDIATELY"
        "ABORT OPERATION"
        "BLOCK THIS OPERATION"
    )

    for pattern in "${blocking_patterns[@]}"; do
        if echo "$output_content" | grep -qi "$pattern"; then
            log_debug "Blocking pattern found: $pattern"
            return $EXIT_SUCCESS  # Found blocking condition
        fi
    done

    # Default: allow operation
    log_debug "No explicit blocking conditions found, allowing operation"
    return $EXIT_GENERAL_ERROR
}

display_blocking_message() {
    local subagent_name="$1"
    local output_content="$2"

    echo "OPERATION BLOCKED by subagent: $subagent_name" >&2
    echo "" >&2
    echo "Reason:" >&2
    echo "$output_content" | head -20 >&2
    echo "" >&2
    echo "The operation has been blocked for safety. Please review the subagent's feedback above." >&2
}
