#!/usr/bin/env bash
set -euo pipefail

# Claude Code Hook: Subagent Event Trigger
# 
# Purpose: Bridge between Claude Code hooks and subagents, enabling event-driven subagent execution
# Usage: subagent-trigger.sh [OPTIONS] <subagent-name> [event-type] [additional-context]
#        subagent-trigger.sh [OPTIONS] --event <event-type>
# Trigger: Can be used in PreToolUse, PostToolUse, or custom hook configurations
#
# This hook enables automatic invocation of specialized subagents based on
# specific events, ensuring the right expertise is applied at the right time.

##################################
# Module Loading
##################################
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB_DIR="$SCRIPT_DIR/lib"

# Source all required modules in dependency order
source "$LIB_DIR/config-constants.sh"
source "$LIB_DIR/file-utils.sh" 
source "$LIB_DIR/error-handler.sh"
source "$LIB_DIR/argument-parser.sh"
source "$LIB_DIR/subagent-discovery.sh"
source "$LIB_DIR/subagent-validator.sh"
source "$LIB_DIR/context-manager.sh"
source "$LIB_DIR/execution-engine.sh"

##################################
# Initialization
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
# Core Workflow Functions
##################################
execute_single_subagent() {
    local subagent_name="$1"
    local event_type="$2"
    local additional_context="$3"
    
    log_info "Executing single subagent: $subagent_name for event: $event_type"
    
    # Find the subagent file
    local subagent_file
    if ! subagent_file=$(find_subagent "$subagent_name"); then
        handle_missing_subagent "$subagent_name"
        return $EXIT_SUBAGENT_NOT_FOUND
    fi
    
    log_debug "Found subagent file: $subagent_file"
    
    # Validate the subagent
    if ! validate_subagent_file "$subagent_file" "strict"; then
        handle_validation_failure "$subagent_name" "file validation failed"
        return $EXIT_VALIDATION_FAILED
    fi
    
    # Create context file
    if ! create_context_file "$subagent_name" "$event_type"; then
        log_error "Failed to create context file"
        return $EXIT_GENERAL_ERROR
    fi
    
    local context_file
    context_file=$(get_context_file)
    
    # Gather context information
    if ! gather_complete_context "$event_type" "$subagent_name" "$additional_context" "false"; then
        log_error "Failed to gather context"
        cleanup_context_file
        return $EXIT_GENERAL_ERROR
    fi
    
    # Write context to file
    if ! write_context_to_file "$context_file"; then
        log_error "Failed to write context to file"
        cleanup_context_file
        return $EXIT_GENERAL_ERROR
    fi
    
    # Determine execution mode and timeout
    local execution_mode timeout
    execution_mode=$(determine_execution_mode "$event_type" "$(get_parsed_execution_mode)")
    timeout=$(get_timeout_for_execution "$event_type" "$subagent_name")
    
    # Check for dry run mode
    if is_dry_run; then
        execution_mode="dry-run"
    fi
    
    # Execute the subagent
    local execution_result
    if ! execute_subagent "$subagent_file" "$context_file" "$execution_mode" "$timeout"; then
        log_error "Subagent execution failed: $subagent_name"
        cleanup_context_file
        return $EXIT_EXECUTION_FAILED
    fi
    
    # Clean up context file
    cleanup_context_file
    
    log_info "Single subagent execution completed successfully: $subagent_name"
    return $EXIT_SUCCESS
}

execute_event_based_subagents() {
    local event_type="$1"
    local additional_context="$2"
    
    log_info "Executing event-based subagents for event: $event_type"
    
    # Create shared context file for all subagents
    if ! create_context_file "event-$event_type" "$event_type"; then
        log_error "Failed to create context file for event execution"
        return $EXIT_GENERAL_ERROR
    fi
    
    local context_file
    context_file=$(get_context_file)
    
    # Gather context information
    if ! gather_complete_context "$event_type" "event-based" "$additional_context" "false"; then
        log_error "Failed to gather context for event execution"
        cleanup_context_file
        return $EXIT_GENERAL_ERROR
    fi
    
    # Write context to file
    if ! write_context_to_file "$context_file"; then
        log_error "Failed to write context to file for event execution"
        cleanup_context_file  
        return $EXIT_GENERAL_ERROR
    fi
    
    # Determine execution mode
    local execution_mode
    execution_mode=$(determine_execution_mode "$event_type" "$(get_parsed_execution_mode)")
    
    # Execute all subagents for this event
    local execution_result
    if ! execute_multiple_subagents "$event_type" "$context_file" "$execution_mode"; then
        log_error "Event-based subagent execution failed for event: $event_type"
        cleanup_context_file
        return $EXIT_EXECUTION_FAILED
    fi
    
    # Clean up context file
    cleanup_context_file
    
    log_info "Event-based subagent execution completed successfully: $event_type"
    return $EXIT_SUCCESS
}

##################################
# Main Hook Logic
##################################
main() {
    # Initialize all modules
    if ! initialize_all_modules; then
        echo "FATAL: Module initialization failed" >&2
        exit $EXIT_GENERAL_ERROR
    fi
    
    # Parse arguments
    if ! parse_arguments "$@"; then
        # Error messages already logged by parser
        safe_exit $EXIT_VALIDATION_FAILED
    fi
    
    # Handle help request
    if is_help_requested; then
        show_usage
        safe_exit $EXIT_SUCCESS
    fi
    
    # Log parsed arguments in debug mode
    if is_debug_mode; then
        log_parsed_arguments
    fi
    
    # Get execution parameters
    local subagent_name event_type additional_context execution_mode
    subagent_name=$(get_parsed_subagent_name)
    event_type=$(get_parsed_event_type)
    additional_context=$(get_parsed_additional_context)
    execution_mode=$(get_parsed_execution_mode)
    
    log_info "Starting subagent hook execution"
    log_info "Mode: $execution_mode, Event: $event_type"
    
    # Execute based on mode
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