#!/usr/bin/env bash

# Error Handling Module for Subagent-Hook Integration
# 
# This module provides standardized error handling, logging, and recovery
# mechanisms for the subagent-hook integration system.

# Source required modules
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config-constants.sh"
source "$SCRIPT_DIR/file-utils.sh"

##################################
# Logging Functions
##################################

log_message() {
    local level="$1"
    local message="$2"
    local timestamp
    
    timestamp="$(date +'%Y-%m-%d %H:%M:%S')"
    
    # Ensure log file exists
    ensure_log_files || return $?
    
    # Format log entry
    local log_entry="[$timestamp] [$HOOK_NAME] [$level] $message"
    
    # Write to log file and display to user
    echo "$log_entry" | tee -a "$LOG_FILE"
    
    return $EXIT_SUCCESS
}

log_info() {
    local message="$1"
    log_message "INFO" "$message"
}

log_warning() {
    local message="$1"
    log_message "WARN" "$message" >&2
}

log_error() {
    local message="$1"
    log_message "ERROR" "$message" >&2
}

log_critical() {
    local message="$1"
    log_message "CRITICAL" "$message" >&2
}

log_debug() {
    local message="$1"
    # Only log debug messages if debug mode is enabled
    if [[ "${DEBUG:-false}" == "true" ]]; then
        log_message "DEBUG" "$message"
    fi
}

##################################
# Violation Logging
##################################

log_violation() {
    local violation_type="$1"
    local details="$2"
    local timestamp
    
    timestamp="$(date +'%Y-%m-%d %H:%M:%S')"
    
    # Ensure violation log exists
    ensure_log_files || return $?
    
    local violation_entry="[$timestamp] VIOLATION: $violation_type - $details"
    
    # Write to both violation log and main log
    echo "$violation_entry" | tee -a "$VIOLATION_LOG" >> "$LOG_FILE"
    
    return $EXIT_SUCCESS
}

##################################
# Error Handler Functions
##################################

handle_missing_subagent() {
    local subagent_name="$1"
    
    log_error "Subagent not found: $subagent_name"
    
    # Provide helpful guidance
    echo "Available subagents:" >&2
    if [[ -d "$SUBAGENTS_DIR" ]]; then
        find "$SUBAGENTS_DIR" -name "*$SUBAGENT_FILE_EXTENSION" -type f 2>/dev/null | \
            sed "s|$SUBAGENTS_DIR/||g" | \
            sed "s|$SUBAGENT_FILE_EXTENSION||g" | \
            sed 's/^/  - /' >&2
    fi
    
    return $EXIT_SUBAGENT_NOT_FOUND
}

handle_validation_failure() {
    local subagent_name="$1"
    local reason="$2"
    
    log_error "Subagent validation failed: $subagent_name - $reason"
    
    echo "Validation failure details:" >&2
    echo "  Subagent: $subagent_name" >&2
    echo "  Reason: $reason" >&2
    echo "  Fix: Check subagent file format and required fields" >&2
    
    return $EXIT_VALIDATION_FAILED
}

handle_execution_failure() {
    local subagent_name="$1"
    local error_details="$2"
    
    log_error "Subagent execution failed: $subagent_name - $error_details"
    
    echo "Execution failure:" >&2
    echo "  Subagent: $subagent_name" >&2
    echo "  Error: $error_details" >&2
    
    return $EXIT_EXECUTION_FAILED
}

handle_timeout() {
    local subagent_name="$1"
    local timeout_seconds="$2"
    
    log_error "Subagent execution timeout: $subagent_name after ${timeout_seconds}s"
    
    echo "Timeout occurred:" >&2
    echo "  Subagent: $subagent_name" >&2
    echo "  Timeout: ${timeout_seconds}s" >&2
    echo "  Fix: Increase timeout or optimize subagent" >&2
    
    return $EXIT_TIMEOUT
}

handle_security_violation() {
    local violation_type="$1"
    local details="$2"
    local file_path="${3:-unknown}"
    
    log_critical "Security violation detected: $violation_type"
    log_violation "$violation_type" "$details (file: $file_path)"
    
    echo "🚨 SECURITY VIOLATION DETECTED!" >&2
    echo "Type: $violation_type" >&2
    echo "Details: $details" >&2
    echo "File: $file_path" >&2
    echo "" >&2
    echo "The operation has been BLOCKED for security reasons." >&2
    
    # Send notification if webhook is configured
    send_security_notification "$violation_type" "$details" "$file_path"
    
    return $EXIT_SECURITY_VIOLATION
}

handle_filesystem_error() {
    local operation="$1"
    local path="$2"
    local error_msg="$3"
    
    log_error "Filesystem operation failed: $operation on $path - $error_msg"
    
    echo "Filesystem error:" >&2
    echo "  Operation: $operation" >&2
    echo "  Path: $path" >&2
    echo "  Error: $error_msg" >&2
    
    return $EXIT_GENERAL_ERROR
}

##################################
# Recovery Functions
##################################

attempt_recovery() {
    local error_type="$1"
    local context="$2"
    
    log_info "Attempting recovery for error: $error_type"
    
    case "$error_type" in
        "missing_directories")
            ensure_required_directories
            return $?
            ;;
        "corrupted_config")
            log_warning "Config file appears corrupted, using defaults"
            return $EXIT_SUCCESS
            ;;
        "temp_file_cleanup")
            cleanup_temp_files
            return $EXIT_SUCCESS
            ;;
        *)
            log_warning "No recovery method available for: $error_type"
            return $EXIT_GENERAL_ERROR
            ;;
    esac
}

##################################
# Cleanup Functions
##################################

safe_exit() {
    local exit_code="$1"
    local cleanup_context="${2:-general}"
    
    log_debug "Initiating safe exit with code: $exit_code"
    
    # Cleanup temporary files
    cleanup_temp_files
    
    # Cleanup specific context files if provided
    if [[ -n "$CONTEXT_FILE" ]] && [[ -f "$CONTEXT_FILE" ]]; then
        cleanup_specific_temp_file "$CONTEXT_FILE"
    fi
    
    # Log exit
    if [[ "$exit_code" -eq "$EXIT_SUCCESS" ]]; then
        log_info "Operation completed successfully"
    else
        log_error "Operation failed with exit code: $exit_code"
    fi
    
    exit "$exit_code"
}

emergency_cleanup() {
    log_critical "Emergency cleanup initiated"
    
    # Remove all temporary files
    cleanup_temp_files
    
    # Kill any background processes if they exist
    local bg_processes
    bg_processes=$(jobs -p 2>/dev/null)
    if [[ -n "$bg_processes" ]]; then
        echo "$bg_processes" | xargs kill 2>/dev/null || true
    fi
    
    log_info "Emergency cleanup completed"
}

##################################
# Notification Functions
##################################

send_security_notification() {
    local violation_type="$1"
    local details="$2"
    local file_path="$3"
    local webhook_url="${SECURITY_WEBHOOK_URL:-}"
    
    if [[ -z "$webhook_url" ]]; then
        return $EXIT_SUCCESS
    fi
    
    local payload
    payload=$(cat <<EOF
{
    "text": "🚨 SECURITY ALERT: Subagent hook violation",
    "attachments": [{
        "color": "danger",
        "fields": [
            {"title": "Violation Type", "value": "$violation_type", "short": true},
            {"title": "File", "value": "$file_path", "short": true},
            {"title": "Details", "value": "$details", "short": false},
            {"title": "User", "value": "$USER", "short": true},
            {"title": "Timestamp", "value": "$(date)", "short": true},
            {"title": "Host", "value": "$(hostname)", "short": true}
        ]
    }]
}
EOF
    )
    
    # Send notification (don't fail if notification fails)
    if command -v curl >/dev/null 2>&1; then
        curl -s -X POST "$webhook_url" \
            -H "Content-Type: application/json" \
            -d "$payload" >/dev/null 2>&1 || true
    fi
    
    log_debug "Security notification sent"
    return $EXIT_SUCCESS
}

##################################
# Error Context Functions
##################################

get_error_context() {
    local error_type="$1"
    
    cat <<EOF
Error Context:
  Hook: $HOOK_NAME
  Version: $SUBAGENT_HOOK_VERSION
  User: $USER
  Working Directory: $(pwd)
  Git Branch: $(git branch --show-current 2>/dev/null || echo 'not-in-git')
  Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
  Process ID: $$
  Error Type: $error_type
  Environment:
    CLAUDE_TOOL: ${CLAUDE_TOOL:-unset}
    CLAUDE_FILE: ${CLAUDE_FILE:-unset}
    CLAUDE_HOOK_TRIGGER: ${CLAUDE_HOOK_TRIGGER:-unset}
EOF
}

log_error_with_context() {
    local error_message="$1"
    local error_type="${2:-general}"
    
    log_error "$error_message"
    log_debug "$(get_error_context "$error_type")"
}

##################################
# Trap Handlers
##################################

setup_error_traps() {
    # Set up error trapping
    trap 'handle_script_error $LINENO $? $BASH_COMMAND' ERR
    trap 'emergency_cleanup; safe_exit 130' INT TERM
    trap 'cleanup_temp_files' EXIT
}

handle_script_error() {
    local line_no="$1"
    local exit_code="$2"
    local failed_command="$3"
    
    log_critical "Script error at line $line_no: $failed_command (exit: $exit_code)"
    
    # Try to provide helpful context
    case "$failed_command" in
        *"mkdir"*|*"chmod"*|*"chown"*)
            handle_filesystem_error "permission_error" "unknown" "check file/directory permissions"
            ;;
        *"curl"*|*"wget"*)
            log_error "Network operation failed - check connectivity"
            ;;
        *)
            log_error "Unknown error occurred"
            ;;
    esac
    
    emergency_cleanup
    safe_exit "$exit_code"
}

##################################
# Validation Functions
##################################

validate_error_handler_dependencies() {
    local missing_commands=()
    
    # Check for required commands
    local required_commands=("date" "tee" "find" "sed" "hostname")
    
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            missing_commands+=("$cmd")
        fi
    done
    
    if [[ ${#missing_commands[@]} -gt 0 ]]; then
        echo "ERROR: Missing required commands: ${missing_commands[*]}" >&2
        return $EXIT_GENERAL_ERROR
    fi
    
    return $EXIT_SUCCESS
}

##################################
# Initialize Error Handling
##################################

initialize_error_handling() {
    # Validate dependencies
    validate_error_handler_dependencies || return $?
    
    # Ensure required directories exist
    ensure_required_directories || return $?
    
    # Ensure log files exist
    ensure_log_files || return $?
    
    # Set up error traps
    setup_error_traps
    
    log_debug "Error handling system initialized"
    return $EXIT_SUCCESS
}