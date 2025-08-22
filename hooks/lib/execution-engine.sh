#!/usr/bin/env bash

# Execution Engine Module for Subagent-Hook Integration
# 
# This module provides functionality to execute subagents with proper
# timeout handling, blocking/non-blocking modes, and result processing.

# Source required modules
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config-constants.sh"
source "$SCRIPT_DIR/file-utils.sh"
source "$SCRIPT_DIR/error-handler.sh"

##################################
# Execution State Management
##################################

# Global variables for execution state (compatible with older bash versions)
EXECUTION_PID=""
EXECUTION_START_TIME=""
EXECUTION_OUTPUT_FILE=""
EXECUTION_ERROR_FILE=""
EXECUTION_RESULT=""

##################################
# Execution Mode Functions
##################################

determine_execution_mode() {
    local event_type="$1"
    local forced_mode="${2:-auto}"
    
    log_debug "Determining execution mode for event: $event_type (forced: $forced_mode)"
    
    # Check for forced mode from arguments
    if [[ "$forced_mode" != "auto" ]]; then
        echo "$forced_mode"
        log_debug "Using forced execution mode: $forced_mode"
        return $EXIT_SUCCESS
    fi
    
    # Determine based on event type
    local blocking_events=("pre_write" "pre_commit" "security_check")
    local event
    
    for event in "${blocking_events[@]}"; do
        if [[ "$event_type" == "$event" ]]; then
            echo "blocking"
            log_debug "Using blocking mode for event: $event_type"
            return $EXIT_SUCCESS
        fi
    done
    
    # Default to non-blocking
    echo "non-blocking"
    log_debug "Using non-blocking mode for event: $event_type"
    return $EXIT_SUCCESS
}

get_timeout_for_execution() {
    local event_type="$1"
    local subagent_name="$2"
    local custom_timeout="${SUBAGENT_TIMEOUT:-}"
    
    # Use custom timeout if provided
    if [[ -n "$custom_timeout" ]]; then
        echo "$custom_timeout"
        log_debug "Using custom timeout: ${custom_timeout}ms"
        return $EXIT_SUCCESS
    fi
    
    # Use event-specific timeout
    local timeout
    timeout=$(get_timeout_for_event "$event_type")
    echo "$timeout"
    log_debug "Using event-specific timeout: ${timeout}ms for $event_type"
    return $EXIT_SUCCESS
}

##################################
# Subagent Execution Functions
##################################

execute_subagent() {
    local subagent_file="$1"
    local context_file="$2"
    local execution_mode="${3:-non-blocking}"
    local timeout="${4:-$DEFAULT_TIMEOUT}"
    
    if [[ -z "$subagent_file" ]] || [[ -z "$context_file" ]]; then
        log_error "Subagent file and context file are required"
        return $EXIT_VALIDATION_FAILED
    fi
    
    local subagent_name
    subagent_name=$(basename "$subagent_file" "$SUBAGENT_FILE_EXTENSION")
    
    log_info "Executing subagent: $subagent_name (mode: $execution_mode, timeout: ${timeout}ms)"
    
    # Prepare execution environment
    if ! prepare_execution_environment "$subagent_name"; then
        log_error "Failed to prepare execution environment"
        return $EXIT_EXECUTION_FAILED
    fi
    
    # Execute based on mode
    case "$execution_mode" in
        "blocking")
            execute_subagent_blocking "$subagent_file" "$context_file" "$timeout"
            ;;
        "non-blocking")
            execute_subagent_non_blocking "$subagent_file" "$context_file" "$timeout"
            ;;
        "dry-run")
            execute_subagent_dry_run "$subagent_file" "$context_file"
            ;;
        *)
            log_error "Unknown execution mode: $execution_mode"
            return $EXIT_VALIDATION_FAILED
            ;;
    esac
}

execute_subagent_blocking() {
    local subagent_file="$1"
    local context_file="$2"
    local timeout="$3"
    
    local subagent_name
    subagent_name=$(basename "$subagent_file" "$SUBAGENT_FILE_EXTENSION")
    
    log_debug "Starting blocking execution of: $subagent_name"
    EXECUTION_START_TIME=$(date +%s)
    
    # In a real implementation, this would invoke Claude with the subagent
    # For now, we simulate the execution with a mock implementation
    if ! execute_subagent_simulation "$subagent_file" "$context_file" "$timeout"; then
        log_error "Subagent execution failed: $subagent_name"
        return $EXIT_EXECUTION_FAILED
    fi
    
    # Process execution results
    if ! process_execution_results "$subagent_name" "blocking"; then
        log_error "Failed to process execution results: $subagent_name"
        return $EXIT_EXECUTION_FAILED
    fi
    
    log_info "Blocking execution completed: $subagent_name"
    return $EXIT_SUCCESS
}

execute_subagent_non_blocking() {
    local subagent_file="$1"
    local context_file="$2"
    local timeout="$3"
    
    local subagent_name
    subagent_name=$(basename "$subagent_file" "$SUBAGENT_FILE_EXTENSION")
    
    log_debug "Starting non-blocking execution of: $subagent_name"
    EXECUTION_START_TIME=$(date +%s)
    
    # Execute in background
    (
        if ! execute_subagent_simulation "$subagent_file" "$context_file" "$timeout"; then
            log_error "Background subagent execution failed: $subagent_name"
            exit $EXIT_EXECUTION_FAILED
        fi
        exit $EXIT_SUCCESS
    ) &
    
    EXECUTION_PID=$!
    log_debug "Non-blocking execution started with PID: $EXECUTION_PID"
    
    # For non-blocking, we don't wait for completion
    log_info "Non-blocking execution initiated: $subagent_name (PID: $EXECUTION_PID)"
    return $EXIT_SUCCESS
}

execute_subagent_dry_run() {
    local subagent_file="$1"
    local context_file="$2"
    
    local subagent_name
    subagent_name=$(basename "$subagent_file" "$SUBAGENT_FILE_EXTENSION")
    
    log_info "DRY RUN: Would execute subagent: $subagent_name"
    
    # Show what would be executed
    cat <<EOF
Dry Run Execution Plan:
======================
Subagent: $subagent_name
File: $subagent_file
Context: $context_file
Output: $EXECUTION_OUTPUT_FILE
Error Log: $EXECUTION_ERROR_FILE

Context Summary:
$(head -10 "$context_file" 2>/dev/null || echo "Context file not readable")

Subagent Metadata:
$(extract_subagent_metadata "$subagent_file")

Execution would proceed with simulated Claude invocation.
EOF
    
    log_info "Dry run completed: $subagent_name"
    return $EXIT_SUCCESS
}

##################################
# Subagent Simulation Functions
##################################

execute_subagent_simulation() {
    local subagent_file="$1"
    local context_file="$2"
    local timeout="$3"
    
    local subagent_name
    subagent_name=$(basename "$subagent_file" "$SUBAGENT_FILE_EXTENSION")
    
    log_debug "Simulating subagent execution: $subagent_name"
    
    # Extract subagent configuration
    local tools description
    tools=$(extract_frontmatter_field "$subagent_file" "tools" false 2>/dev/null || echo "all")
    description=$(extract_frontmatter_field "$subagent_file" "description" false 2>/dev/null || echo "No description")
    
    # Create simulated output
    local simulation_output
    simulation_output=$(cat <<EOF
Subagent Execution Report
========================
Name: $subagent_name
Description: $description
Tools: ${tools:-all}
Execution Time: $(date)
Status: Executed successfully

Context Analysis:
$(analyze_context_for_simulation "$context_file")

Recommendations:
- Operation appears safe to proceed
- No security violations detected
- Code style conforms to standards
- Continue with planned action

Execution Summary:
- Analysis completed successfully
- No blocking issues found
- Ready for next step in workflow
EOF
    )
    
    # Write to output file
    if ! echo "$simulation_output" > "$EXECUTION_OUTPUT_FILE"; then
        log_error "Failed to write simulation output"
        return $EXIT_EXECUTION_FAILED
    fi
    
    # Simulate processing time (shorter for testing)
    sleep 1
    
    # Check for timeout simulation
    local execution_time=$(($(date +%s) - EXECUTION_START_TIME))
    local timeout_seconds=$((timeout / 1000))
    
    if [[ $execution_time -gt $timeout_seconds ]]; then
        log_error "Simulated timeout exceeded: ${execution_time}s > ${timeout_seconds}s"
        return $EXIT_TIMEOUT
    fi
    
    log_debug "Subagent simulation completed successfully: $subagent_name"
    return $EXIT_SUCCESS
}

analyze_context_for_simulation() {
    local context_file="$1"
    
    if [[ ! -f "$context_file" ]]; then
        echo "Context file not available"
        return
    fi
    
    # Extract key information from context
    local event_type file_path git_branch
    
    if command -v jq >/dev/null 2>&1; then
        event_type=$(jq -r '.event.type // "unknown"' "$context_file" 2>/dev/null)
        file_path=$(jq -r '.file.path // "none"' "$context_file" 2>/dev/null)
        git_branch=$(jq -r '.git.branch // "unknown"' "$context_file" 2>/dev/null)
    else
        event_type="unknown"
        file_path="none"
        git_branch="unknown"
    fi
    
    cat <<EOF
- Event Type: $event_type
- Target File: $file_path
- Git Branch: $git_branch
- Analysis: Standard workflow operation detected
EOF
}

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
            # In blocking mode, this should fail the hook
            display_blocking_message "$subagent_name" "$output_content"
            return $EXIT_EXECUTION_FAILED
        else
            # In non-blocking mode, just log the warning
            log_warning "Non-blocking mode: continuing despite blocking recommendation"
        fi
    fi
    
    # Log success
    log_info "Execution results processed successfully: $subagent_name"
    return $EXIT_SUCCESS
}

check_for_blocking_conditions() {
    local output_content="$1"
    
    # Look for blocking keywords in output
    local blocking_patterns=(
        "BLOCK"
        "SECURITY VIOLATION"
        "CRITICAL ERROR"
        "STOP EXECUTION"
        "ABORT"
    )
    
    local pattern
    for pattern in "${blocking_patterns[@]}"; do
        if echo "$output_content" | grep -qi "$pattern"; then
            log_debug "Blocking pattern found: $pattern"
            return $EXIT_SUCCESS  # Found blocking condition
        fi
    done
    
    return $EXIT_GENERAL_ERROR  # No blocking condition found
}

display_blocking_message() {
    local subagent_name="$1"
    local output_content="$2"
    
    echo "🚨 OPERATION BLOCKED by subagent: $subagent_name" >&2
    echo "" >&2
    echo "Reason:" >&2
    echo "$output_content" | head -20 >&2
    echo "" >&2
    echo "The operation has been blocked for safety. Please review the subagent's feedback above." >&2
}

##################################
# Multiple Subagent Execution
##################################

execute_multiple_subagents() {
    local event_type="$1"
    local context_file="$2"
    local execution_mode="${3:-auto}"
    
    log_info "Executing multiple subagents for event: $event_type"
    
    # Get subagents for the event
    local subagents
    if ! subagents=$(get_subagents_for_event "$event_type"); then
        log_error "Failed to get subagents for event: $event_type"
        return $EXIT_GENERAL_ERROR
    fi
    
    if [[ -z "$subagents" ]]; then
        log_info "No subagents configured for event: $event_type"
        return $EXIT_SUCCESS
    fi
    
    local any_failures=false
    local executed_count=0
    
    # Execute each subagent
    while IFS= read -r subagent_name; do
        [[ -z "$subagent_name" ]] && continue
        
        ((executed_count++))
        log_info "Executing subagent $executed_count: $subagent_name"
        
        # Find subagent file
        local subagent_file
        if ! subagent_file=$(find_subagent "$subagent_name"); then
            log_error "Subagent not found: $subagent_name"
            any_failures=true
            continue
        fi
        
        # Determine execution mode for this subagent
        local subagent_mode
        subagent_mode=$(determine_execution_mode "$event_type" "$execution_mode")
        
        # Get timeout for this execution
        local timeout
        timeout=$(get_timeout_for_execution "$event_type" "$subagent_name")
        
        # Execute the subagent
        if ! execute_subagent "$subagent_file" "$context_file" "$subagent_mode" "$timeout"; then
            log_error "Failed to execute subagent: $subagent_name"
            any_failures=true
            
            # In blocking mode, stop on first failure
            if [[ "$subagent_mode" == "blocking" ]]; then
                log_error "Blocking execution failed, stopping remaining subagents"
                break
            fi
        else
            log_info "Successfully executed subagent: $subagent_name"
        fi
    done <<< "$subagents"
    
    log_info "Multiple subagent execution completed (executed: $executed_count)"
    
    if [[ "$any_failures" == true ]]; then
        log_error "Some subagent executions failed"
        return $EXIT_EXECUTION_FAILED
    fi
    
    return $EXIT_SUCCESS
}

##################################
# Execution Environment Functions
##################################

prepare_execution_environment() {
    local subagent_name="$1"
    
    log_debug "Preparing execution environment for: $subagent_name"
    
    # Create output files
    EXECUTION_OUTPUT_FILE=$(create_temp_file "$OUTPUT_FILE_PREFIX" "$subagent_name-$$")
    if [[ $? -ne $EXIT_SUCCESS ]]; then
        log_error "Failed to create output file"
        return $EXIT_GENERAL_ERROR
    fi
    
    EXECUTION_ERROR_FILE="${EXECUTION_OUTPUT_FILE}.err"
    if ! touch "$EXECUTION_ERROR_FILE"; then
        log_error "Failed to create error file"
        return $EXIT_GENERAL_ERROR
    fi
    
    # Set secure permissions
    chmod "$SECURE_FILE_PERMISSIONS" "$EXECUTION_OUTPUT_FILE" "$EXECUTION_ERROR_FILE"
    
    log_debug "Execution environment prepared:"
    log_debug "  Output: $EXECUTION_OUTPUT_FILE"
    log_debug "  Error: $EXECUTION_ERROR_FILE"
    
    return $EXIT_SUCCESS
}

cleanup_execution_environment() {
    local keep_logs="${1:-false}"
    
    log_debug "Cleaning up execution environment"
    
    # Clean up output files unless keeping logs
    if [[ "$keep_logs" != true ]]; then
        [[ -n "$EXECUTION_OUTPUT_FILE" ]] && rm -f "$EXECUTION_OUTPUT_FILE"
        [[ -n "$EXECUTION_ERROR_FILE" ]] && rm -f "$EXECUTION_ERROR_FILE"
    fi
    
    # Kill background processes if any
    if [[ -n "$EXECUTION_PID" ]]; then
        if kill -0 "$EXECUTION_PID" 2>/dev/null; then
            log_debug "Terminating background execution: $EXECUTION_PID"
            kill "$EXECUTION_PID" 2>/dev/null || true
        fi
    fi
    
    # Reset global variables
    EXECUTION_PID=""
    EXECUTION_START_TIME=""
    EXECUTION_OUTPUT_FILE=""
    EXECUTION_ERROR_FILE=""
    EXECUTION_RESULT=""
    
    log_debug "Execution environment cleanup completed"
    return $EXIT_SUCCESS
}

##################################
# Execution Status Functions
##################################

get_execution_status() {
    if [[ -n "$EXECUTION_PID" ]]; then
        if kill -0 "$EXECUTION_PID" 2>/dev/null; then
            echo "running"
        else
            echo "completed"
        fi
    else
        echo "not_started"
    fi
}

wait_for_execution() {
    local timeout_seconds="${1:-30}"
    
    if [[ -z "$EXECUTION_PID" ]]; then
        log_debug "No execution to wait for"
        return $EXIT_SUCCESS
    fi
    
    log_debug "Waiting for execution to complete (timeout: ${timeout_seconds}s)"
    
    local waited=0
    while kill -0 "$EXECUTION_PID" 2>/dev/null; do
        sleep 1
        ((waited++))
        
        if [[ $waited -ge $timeout_seconds ]]; then
            log_warning "Execution timeout reached, terminating process"
            kill "$EXECUTION_PID" 2>/dev/null || true
            return $EXIT_TIMEOUT
        fi
    done
    
    # Get exit status
    wait "$EXECUTION_PID" 2>/dev/null
    local exit_status=$?
    
    log_debug "Execution completed with status: $exit_status"
    return $exit_status
}

##################################
# Utility Functions
##################################

extract_subagent_metadata() {
    local subagent_file="$1"
    
    if [[ ! -f "$subagent_file" ]]; then
        echo "File not found"
        return
    fi
    
    local name description version tools
    name=$(extract_frontmatter_field "$subagent_file" "name" false 2>/dev/null || echo "Unknown")
    description=$(extract_frontmatter_field "$subagent_file" "description" false 2>/dev/null || echo "No description")
    version=$(extract_frontmatter_field "$subagent_file" "version" false 2>/dev/null || echo "Unknown")
    tools=$(extract_frontmatter_field "$subagent_file" "tools" false 2>/dev/null || echo "All")
    
    cat <<EOF
Name: $name
Description: $description
Version: $version
Tools: $tools
EOF
}

##################################
# Initialization
##################################

initialize_execution_engine() {
    log_debug "Execution engine module initialized"
    
    # Set up signal handlers for cleanup
    trap 'cleanup_execution_environment' EXIT
    trap 'cleanup_execution_environment; exit 130' INT TERM
    
    return $EXIT_SUCCESS
}