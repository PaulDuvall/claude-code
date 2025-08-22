#!/usr/bin/env bash

# Argument Parser Module for Subagent-Hook Integration
# 
# This module provides command-line argument parsing and validation
# for the subagent-hook integration system.

# Source required modules
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config-constants.sh"
source "$SCRIPT_DIR/error-handler.sh"

##################################
# Argument Structure
##################################

# Global variables to store parsed arguments (compatible with older bash versions)
PARSED_SUBAGENT_NAME=""
PARSED_EVENT_TYPE=""
PARSED_ADDITIONAL_CONTEXT=""
PARSED_EXECUTION_MODE=""
PARSED_DEBUG_MODE=false
PARSED_DRY_RUN=false
PARSED_HELP_REQUESTED=false

##################################
# Usage Functions
##################################

show_usage() {
    cat <<EOF
Usage: subagent-trigger.sh [OPTIONS] <subagent-name> [event-type] [additional-context]
   OR: subagent-trigger.sh [OPTIONS] --event <event-type>

Trigger subagents based on Claude Code events for automated assistance.

ARGUMENTS:
  subagent-name         Name of the subagent to execute
  event-type            Type of event triggering the subagent (default: manual)
  additional-context    Additional context to pass to the subagent

SPECIAL MODES:
  --event <event-type>  Run all subagents configured for the specified event

OPTIONS:
  --debug               Enable debug logging and verbose output
  --dry-run            Show what would be executed without running
  --help, -h           Show this help message and exit
  --timeout <ms>       Override default timeout (max: $MAX_SUBAGENT_TIMEOUT ms)
  --non-blocking       Force non-blocking execution mode
  --blocking           Force blocking execution mode
  --config <file>      Use custom configuration file

SUPPORTED EVENTS:
EOF
    
    local event
    for event in "${SUPPORTED_EVENTS[@]}"; do
        echo "  - $event"
    done
    
    cat <<EOF

EXAMPLES:
  # Run security-auditor for pre-write event
  subagent-trigger.sh security-auditor pre_write

  # Run all subagents configured for pre_commit event
  subagent-trigger.sh --event pre_commit

  # Debug mode with custom timeout
  subagent-trigger.sh --debug --timeout 10000 style-enforcer pre_write

  # Dry run to see what would be executed
  subagent-trigger.sh --dry-run --event security_check

EXIT CODES:
  $EXIT_SUCCESS  - Success
  $EXIT_GENERAL_ERROR  - General error
  $EXIT_VALIDATION_FAILED  - Validation failed
  $EXIT_SUBAGENT_NOT_FOUND  - Subagent not found
  $EXIT_EXECUTION_FAILED  - Execution failed
  $EXIT_TIMEOUT  - Operation timed out
  $EXIT_SECURITY_VIOLATION  - Security violation detected

For more information, see: ~/.claude/logs/subagent-hooks.log
EOF
}

show_version() {
    cat <<EOF
Subagent Hook Trigger v$SUBAGENT_HOOK_VERSION
API Version: $API_VERSION
Compatible with Claude Code: $COMPATIBLE_CLAUDE_VERSION

Configuration:
  Subagents Directory: $SUBAGENTS_DIR
  Configuration File: $CONFIG_FILE
  Log File: $LOG_FILE

System Information:
  User: $USER
  Working Directory: $(pwd)
  Git Branch: $(git branch --show-current 2>/dev/null || echo 'not-in-git')
  Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
EOF
}

##################################
# Argument Validation Functions
##################################

validate_subagent_name() {
    local name="$1"
    
    if [[ -z "$name" ]]; then
        log_error "Subagent name cannot be empty"
        return $EXIT_VALIDATION_FAILED
    fi
    
    if [[ ${#name} -gt $MAX_SUBAGENT_NAME_LENGTH ]]; then
        log_error "Subagent name too long: ${#name} chars (max: $MAX_SUBAGENT_NAME_LENGTH)"
        return $EXIT_VALIDATION_FAILED
    fi
    
    if [[ ! "$name" =~ $SUBAGENT_NAME_PATTERN ]]; then
        log_error "Invalid subagent name format: $name"
        log_error "Name must match pattern: $SUBAGENT_NAME_PATTERN"
        return $EXIT_VALIDATION_FAILED
    fi
    
    return $EXIT_SUCCESS
}

validate_event_type() {
    local event="$1"
    
    if [[ -z "$event" ]]; then
        log_error "Event type cannot be empty"
        return $EXIT_VALIDATION_FAILED
    fi
    
    if [[ ! "$event" =~ $EVENT_NAME_PATTERN ]]; then
        log_error "Invalid event name format: $event"
        log_error "Event must match pattern: $EVENT_NAME_PATTERN"
        return $EXIT_VALIDATION_FAILED
    fi
    
    if ! is_supported_event "$event"; then
        log_error "Unsupported event type: $event"
        log_error "Supported events: ${SUPPORTED_EVENTS[*]}"
        return $EXIT_VALIDATION_FAILED
    fi
    
    return $EXIT_SUCCESS
}

validate_timeout_value() {
    local timeout="$1"
    
    if [[ ! "$timeout" =~ ^[0-9]+$ ]]; then
        log_error "Timeout must be a positive integer: $timeout"
        return $EXIT_VALIDATION_FAILED
    fi
    
    if [[ "$timeout" -gt "$MAX_SUBAGENT_TIMEOUT" ]]; then
        log_error "Timeout exceeds maximum: $timeout ms (max: $MAX_SUBAGENT_TIMEOUT ms)"
        return $EXIT_VALIDATION_FAILED
    fi
    
    if [[ "$timeout" -lt 100 ]]; then
        log_error "Timeout too small: $timeout ms (min: 100 ms)"
        return $EXIT_VALIDATION_FAILED
    fi
    
    return $EXIT_SUCCESS
}

validate_config_file() {
    local config_file="$1"
    
    if [[ ! -f "$config_file" ]]; then
        log_error "Configuration file not found: $config_file"
        return $EXIT_GENERAL_ERROR
    fi
    
    if [[ ! -r "$config_file" ]]; then
        log_error "Configuration file not readable: $config_file"
        return $EXIT_GENERAL_ERROR
    fi
    
    # Basic YAML validation
    if ! grep -q "^[a-z_][a-z0-9_-]*:" "$config_file"; then
        log_error "Configuration file appears to be invalid YAML: $config_file"
        return $EXIT_VALIDATION_FAILED
    fi
    
    return $EXIT_SUCCESS
}

##################################
# Argument Parsing Functions
##################################

parse_arguments() {
    local args=("$@")
    local arg_count=${#args[@]}
    local current_arg=0
    
    # Reset global variables
    PARSED_SUBAGENT_NAME=""
    PARSED_EVENT_TYPE="${CLAUDE_HOOK_TRIGGER:-manual}"
    PARSED_ADDITIONAL_CONTEXT=""
    PARSED_EXECUTION_MODE="auto"
    PARSED_DEBUG_MODE=false
    PARSED_DRY_RUN=false
    PARSED_HELP_REQUESTED=false
    
    # Handle no arguments
    if [[ $arg_count -eq 0 ]]; then
        log_error "No arguments provided"
        show_usage
        return $EXIT_VALIDATION_FAILED
    fi
    
    # Parse arguments
    while [[ $current_arg -lt $arg_count ]]; do
        local arg="${args[$current_arg]}"
        
        case "$arg" in
            --help|-h)
                PARSED_HELP_REQUESTED=true
                return $EXIT_SUCCESS
                ;;
            --version|-v)
                show_version
                return $EXIT_SUCCESS
                ;;
            --debug)
                PARSED_DEBUG_MODE=true
                export DEBUG=true
                log_debug "Debug mode enabled"
                ;;
            --dry-run)
                PARSED_DRY_RUN=true
                log_info "Dry run mode enabled"
                ;;
            --non-blocking)
                PARSED_EXECUTION_MODE="non-blocking"
                log_debug "Forced non-blocking execution mode"
                ;;
            --blocking)
                PARSED_EXECUTION_MODE="blocking"
                log_debug "Forced blocking execution mode"
                ;;
            --timeout)
                ((current_arg++))
                if [[ $current_arg -ge $arg_count ]]; then
                    log_error "--timeout requires a value"
                    return $EXIT_VALIDATION_FAILED
                fi
                local timeout_value="${args[$current_arg]}"
                if ! validate_timeout_value "$timeout_value"; then
                    return $EXIT_VALIDATION_FAILED
                fi
                export SUBAGENT_TIMEOUT="$timeout_value"
                log_debug "Custom timeout set: ${timeout_value}ms"
                ;;
            --config)
                ((current_arg++))
                if [[ $current_arg -ge $arg_count ]]; then
                    log_error "--config requires a file path"
                    return $EXIT_VALIDATION_FAILED
                fi
                local config_file="${args[$current_arg]}"
                if ! validate_config_file "$config_file"; then
                    return $EXIT_VALIDATION_FAILED
                fi
                export CONFIG_FILE="$config_file"
                log_debug "Custom config file: $config_file"
                ;;
            --event)
                ((current_arg++))
                if [[ $current_arg -ge $arg_count ]]; then
                    log_error "--event requires an event type"
                    return $EXIT_VALIDATION_FAILED
                fi
                PARSED_EXECUTION_MODE="event-based"
                PARSED_EVENT_TYPE="${args[$current_arg]}"
                if ! validate_event_type "$PARSED_EVENT_TYPE"; then
                    return $EXIT_VALIDATION_FAILED
                fi
                log_debug "Event-based execution for: $PARSED_EVENT_TYPE"
                ;;
            --*)
                log_error "Unknown option: $arg"
                return $EXIT_VALIDATION_FAILED
                ;;
            *)
                # Positional arguments
                if [[ -z "$PARSED_SUBAGENT_NAME" ]] && [[ "$PARSED_EXECUTION_MODE" != "event-based" ]]; then
                    PARSED_SUBAGENT_NAME="$arg"
                    if ! validate_subagent_name "$PARSED_SUBAGENT_NAME"; then
                        return $EXIT_VALIDATION_FAILED
                    fi
                elif [[ -z "$PARSED_EVENT_TYPE" ]] || [[ "$PARSED_EVENT_TYPE" == "manual" ]]; then
                    PARSED_EVENT_TYPE="$arg"
                    if ! validate_event_type "$PARSED_EVENT_TYPE"; then
                        return $EXIT_VALIDATION_FAILED
                    fi
                elif [[ -z "$PARSED_ADDITIONAL_CONTEXT" ]]; then
                    PARSED_ADDITIONAL_CONTEXT="$arg"
                else
                    log_error "Too many positional arguments: $arg"
                    return $EXIT_VALIDATION_FAILED
                fi
                ;;
        esac
        
        ((current_arg++))
    done
    
    # Validate required arguments based on execution mode
    if [[ "$PARSED_EXECUTION_MODE" == "event-based" ]]; then
        if [[ -z "$PARSED_EVENT_TYPE" ]]; then
            log_error "Event type is required for event-based execution"
            return $EXIT_VALIDATION_FAILED
        fi
    else
        if [[ -z "$PARSED_SUBAGENT_NAME" ]]; then
            log_error "Subagent name is required for direct execution"
            return $EXIT_VALIDATION_FAILED
        fi
    fi
    
    log_debug "Arguments parsed successfully:"
    log_debug "  Subagent: ${PARSED_SUBAGENT_NAME:-'(event-based)'}"
    log_debug "  Event: $PARSED_EVENT_TYPE"
    log_debug "  Context: ${PARSED_ADDITIONAL_CONTEXT:-'none'}"
    log_debug "  Mode: $PARSED_EXECUTION_MODE"
    
    return $EXIT_SUCCESS
}

##################################
# Argument Access Functions
##################################

get_parsed_subagent_name() {
    echo "$PARSED_SUBAGENT_NAME"
}

get_parsed_event_type() {
    echo "$PARSED_EVENT_TYPE"
}

get_parsed_additional_context() {
    echo "$PARSED_ADDITIONAL_CONTEXT"
}

get_parsed_execution_mode() {
    echo "$PARSED_EXECUTION_MODE"
}

is_debug_mode() {
    [[ "$PARSED_DEBUG_MODE" == true ]]
    return $?
}

is_dry_run() {
    [[ "$PARSED_DRY_RUN" == true ]]
    return $?
}

is_help_requested() {
    [[ "$PARSED_HELP_REQUESTED" == true ]]
    return $?
}

##################################
# Argument Logging
##################################

log_parsed_arguments() {
    log_info "Parsed Arguments:"
    log_info "  Execution Mode: $PARSED_EXECUTION_MODE"
    
    if [[ -n "$PARSED_SUBAGENT_NAME" ]]; then
        log_info "  Subagent Name: $PARSED_SUBAGENT_NAME"
    fi
    
    log_info "  Event Type: $PARSED_EVENT_TYPE"
    
    if [[ -n "$PARSED_ADDITIONAL_CONTEXT" ]]; then
        log_info "  Additional Context: $PARSED_ADDITIONAL_CONTEXT"
    fi
    
    if [[ "$PARSED_DEBUG_MODE" == true ]]; then
        log_info "  Debug Mode: enabled"
    fi
    
    if [[ "$PARSED_DRY_RUN" == true ]]; then
        log_info "  Dry Run: enabled"
    fi
    
    if [[ -n "${SUBAGENT_TIMEOUT:-}" ]]; then
        log_info "  Custom Timeout: ${SUBAGENT_TIMEOUT}ms"
    fi
    
    if [[ "${CONFIG_FILE:-$HOME/.claude/subagent-hooks.yaml}" != "$HOME/.claude/subagent-hooks.yaml" ]]; then
        log_info "  Custom Config: $CONFIG_FILE"
    fi
}

##################################
# Initialization
##################################

initialize_argument_parser() {
    log_debug "Argument parser module initialized"
    return $EXIT_SUCCESS
}