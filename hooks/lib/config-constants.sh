#!/usr/bin/env bash

# Configuration Constants for Subagent-Hook Integration
# 
# This module defines all configuration constants used throughout the
# subagent-hook integration system to ensure consistency and maintainability.

# Prevent multiple loading of this module
if [[ -n "${CONFIG_CONSTANTS_LOADED:-}" ]]; then
    return 0
fi
CONFIG_CONSTANTS_LOADED=1

##################################
# File and Directory Constants
##################################
readonly HOOK_NAME="subagent-trigger"
readonly SUBAGENT_FILE_EXTENSION=".md"
readonly CONFIG_FILE_NAME="subagent-hooks.yaml"
readonly LOG_FILE_NAME="subagent-hooks.log"
readonly VIOLATION_LOG_NAME="credential-violations.log"

##################################
# Directory Structure Constants
##################################
readonly CLAUDE_BASE_DIR="${HOME}/.claude"
readonly SUBAGENTS_DIR="${CLAUDE_BASE_DIR}/subagents"
readonly LOGS_DIR="${CLAUDE_BASE_DIR}/logs"
readonly CONFIG_DIR="${CLAUDE_BASE_DIR}"
readonly PROJECT_SUBAGENTS_DIR=".claude/subagents"

##################################
# File Path Constants
##################################
readonly CONFIG_FILE="${CONFIG_DIR}/${CONFIG_FILE_NAME}"
readonly LOG_FILE="${LOGS_DIR}/${LOG_FILE_NAME}"
readonly VIOLATION_LOG="${LOGS_DIR}/${VIOLATION_LOG_NAME}"

##################################
# Timeout Constants (in milliseconds)
##################################
readonly DEFAULT_TIMEOUT=5000
readonly SECURITY_CHECK_TIMEOUT=10000
readonly DEBUG_TIMEOUT=15000
readonly MAX_SUBAGENT_TIMEOUT=30000
readonly CONTEXT_TIMEOUT=2000

##################################
# File Permission Constants
##################################
readonly SECURE_DIR_PERMISSIONS=700
readonly SECURE_FILE_PERMISSIONS=600
readonly EXECUTABLE_PERMISSIONS=755

##################################
# Validation Constants
##################################
readonly MAX_FUNCTION_LENGTH=30
readonly MAX_SUBAGENT_NAME_LENGTH=50
readonly MIN_DESCRIPTION_LENGTH=10
readonly MAX_DESCRIPTION_LENGTH=200
readonly MAX_CONTEXT_FILE_SIZE=1048576  # 1MB

##################################
# Event Type Constants
##################################
readonly -a SUPPORTED_EVENTS=(
    "pre_write"
    "post_write" 
    "pre_commit"
    "post_commit"
    "pre_test"
    "post_test"
    "on_error"
    "security_check"
    "code_review"
    "deployment"
)

##################################
# Tool Pattern Constants
##################################
readonly -a FILE_MODIFICATION_TOOLS=(
    "Edit"
    "Write" 
    "MultiEdit"
)

readonly -a SECURITY_RELEVANT_TOOLS=(
    "Edit"
    "Write"
    "MultiEdit"
    "Bash"
)

##################################
# Temporary File Constants
##################################
readonly CONTEXT_FILE_PREFIX="/tmp/claude-subagent-context"
readonly OUTPUT_FILE_PREFIX="/tmp/claude-subagent-output"
readonly TEMP_FILE_PATTERN="claude-subagent-*"

##################################
# Logging Level Constants
##################################
readonly LOG_LEVEL_DEBUG=0
readonly LOG_LEVEL_INFO=1
readonly LOG_LEVEL_WARN=2
readonly LOG_LEVEL_ERROR=3
readonly LOG_LEVEL_CRITICAL=4

##################################
# Exit Code Constants
##################################
readonly EXIT_SUCCESS=0
readonly EXIT_GENERAL_ERROR=1
readonly EXIT_VALIDATION_FAILED=2
readonly EXIT_SUBAGENT_NOT_FOUND=3
readonly EXIT_EXECUTION_FAILED=4
readonly EXIT_TIMEOUT=5
readonly EXIT_SECURITY_VIOLATION=6

##################################
# Regular Expression Constants
##################################
readonly SUBAGENT_NAME_PATTERN='^[a-z][a-z0-9-]{0,49}$'
readonly EVENT_NAME_PATTERN='^[a-z][a-z0-9_-]*$'
readonly YAML_FRONTMATTER_START='^---$'
readonly YAML_FRONTMATTER_END='^---$'

##################################
# Priority Constants
##################################
readonly DEFAULT_PRIORITY=5
readonly HIGH_PRIORITY=1
readonly MEDIUM_PRIORITY=3
readonly LOW_PRIORITY=7

##################################
# Boolean Constants
##################################
readonly TRUE=1
readonly FALSE=0

##################################
# Configuration Validation
##################################
validate_constants() {
    # Validate that required directories can be created
    if ! mkdir -p "$CLAUDE_BASE_DIR" "$SUBAGENTS_DIR" "$LOGS_DIR" 2>/dev/null; then
        echo "ERROR: Cannot create required directories" >&2
        return $EXIT_GENERAL_ERROR
    fi
    
    # Validate timeout values
    if [[ $DEFAULT_TIMEOUT -gt $MAX_SUBAGENT_TIMEOUT ]]; then
        echo "ERROR: Default timeout exceeds maximum" >&2
        return $EXIT_GENERAL_ERROR
    fi
    
    return $EXIT_SUCCESS
}

##################################
# Utility Functions for Constants
##################################
is_supported_event() {
    local event="$1"
    local supported_event
    
    for supported_event in "${SUPPORTED_EVENTS[@]}"; do
        if [[ "$event" == "$supported_event" ]]; then
            return $TRUE
        fi
    done
    
    return $FALSE
}

is_file_modification_tool() {
    local tool="$1"
    local file_tool
    
    for file_tool in "${FILE_MODIFICATION_TOOLS[@]}"; do
        if [[ "$tool" == "$file_tool" ]]; then
            return $TRUE
        fi
    done
    
    return $FALSE
}

get_timeout_for_event() {
    local event="$1"
    
    case "$event" in
        "security_check"|"pre_write")
            echo $SECURITY_CHECK_TIMEOUT
            ;;
        "on_error"|"debug")
            echo $DEBUG_TIMEOUT
            ;;
        *)
            echo $DEFAULT_TIMEOUT
            ;;
    esac
}

##################################
# Environment Variable Defaults
##################################
export CLAUDE_HOOK_TRIGGER="${CLAUDE_HOOK_TRIGGER:-manual}"
export CLAUDE_TOOL="${CLAUDE_TOOL:-unknown}"
export CLAUDE_FILE="${CLAUDE_FILE:-}"
export CLAUDE_CONTENT="${CLAUDE_CONTENT:-}"
export CLAUDE_SESSION_ID="${CLAUDE_SESSION_ID:-$$}"
export CLAUDE_SECURITY_OVERRIDE="${CLAUDE_SECURITY_OVERRIDE:-false}"

##################################
# Version Information
##################################
readonly SUBAGENT_HOOK_VERSION="1.0.0"
readonly COMPATIBLE_CLAUDE_VERSION=">=1.0.0"
readonly API_VERSION="v1"

# Validate constants on load
if ! validate_constants; then
    echo "FATAL: Configuration constants validation failed" >&2
    exit $EXIT_GENERAL_ERROR
fi