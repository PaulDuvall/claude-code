#!/usr/bin/env bash

# Context Management Module for Subagent-Hook Integration
# 
# This module provides functionality to gather, manage, and pass context
# information to subagents during hook execution.

# Source required modules
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config-constants.sh"
source "$SCRIPT_DIR/file-utils.sh"
source "$SCRIPT_DIR/error-handler.sh"

##################################
# Context Structure
##################################

# Global variables for context management (compatible with older bash versions)
CONTEXT_FILE=""
CONTEXT_TIMEOUT="$CONTEXT_TIMEOUT"
CONTEXT_DATA=""

##################################
# Context Gathering Functions
##################################

gather_basic_context() {
    local event_type="${1:-unknown}"
    local subagent_name="${2:-unknown}"
    local additional_context="${3:-}"
    
    log_debug "Gathering basic context for $subagent_name (event: $event_type)"
    
    # Create base context structure
    local context_json
    context_json=$(cat <<EOF
{
  "metadata": {
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "hook_version": "$SUBAGENT_HOOK_VERSION",
    "api_version": "$API_VERSION"
  },
  "event": {
    "type": "$event_type",
    "trigger": "${CLAUDE_HOOK_TRIGGER:-manual}",
    "subagent": "$subagent_name"
  },
  "environment": {
    "user": "$USER",
    "working_directory": "$(pwd)",
    "process_id": $$,
    "session_id": "${CLAUDE_SESSION_ID:-$$}"
  }
}
EOF
    )
    
    CONTEXT_DATA="$context_json"
    log_debug "Basic context gathered successfully"
    return $EXIT_SUCCESS
}

gather_claude_context() {
    local current_context="$CONTEXT_DATA"
    
    log_debug "Gathering Claude-specific context"
    
    # Extract Claude environment variables
    local claude_context
    claude_context=$(cat <<EOF
{
  "claude": {
    "tool": "${CLAUDE_TOOL:-unknown}",
    "file": "${CLAUDE_FILE:-none}",
    "content": "${CLAUDE_CONTENT:-none}",
    "version": "${CLAUDE_VERSION:-unknown}",
    "project": "${CLAUDE_PROJECT:-unknown}",
    "security_override": "${CLAUDE_SECURITY_OVERRIDE:-false}"
  }
}
EOF
    )
    
    # Merge with existing context
    CONTEXT_DATA=$(echo "$current_context" | jq --argjson claude "$(echo "$claude_context" | jq '.claude')" '. + {claude: $claude}' 2>/dev/null) || {
        log_warning "Failed to merge Claude context with jq, using concatenation"
        CONTEXT_DATA="$current_context,$claude_context"
    }
    
    log_debug "Claude context gathered successfully"
    return $EXIT_SUCCESS
}

gather_git_context() {
    local current_context="$CONTEXT_DATA"
    
    log_debug "Gathering Git context"
    
    local git_branch git_commit git_status git_remote
    git_branch=$(git branch --show-current 2>/dev/null || echo "not-in-git")
    git_commit=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    git_remote=$(git remote get-url origin 2>/dev/null || echo "none")
    
    # Get git status in a safe way
    local git_changes="clean"
    if git status --porcelain 2>/dev/null | grep -q .; then
        git_changes="modified"
    fi
    
    local git_context
    git_context=$(cat <<EOF
{
  "git": {
    "branch": "$git_branch",
    "commit": "${git_commit:0:8}",
    "status": "$git_changes",
    "remote": "$git_remote",
    "in_repo": $(if [[ "$git_branch" != "not-in-git" ]]; then echo "true"; else echo "false"; fi)
  }
}
EOF
    )
    
    # Merge with existing context
    CONTEXT_DATA=$(echo "$current_context" | jq --argjson git "$(echo "$git_context" | jq '.git')" '. + {git: $git}' 2>/dev/null) || {
        log_warning "Failed to merge Git context with jq, using concatenation"
        CONTEXT_DATA="$current_context,$git_context"
    }
    
    log_debug "Git context gathered successfully"
    return $EXIT_SUCCESS
}

gather_file_context() {
    local file_path="${CLAUDE_FILE:-}"
    local current_context="$CONTEXT_DATA"
    
    if [[ -z "$file_path" ]] || [[ "$file_path" == "none" ]]; then
        log_debug "No file context to gather"
        return $EXIT_SUCCESS
    fi
    
    log_debug "Gathering file context for: $file_path"
    
    local file_info=""
    local file_type="unknown"
    local file_size="0"
    local file_permissions="unknown"
    
    if [[ -f "$file_path" ]]; then
        file_type=$(file -b "$file_path" 2>/dev/null || echo "unknown")
        file_size=$(stat -f%z "$file_path" 2>/dev/null || stat -c%s "$file_path" 2>/dev/null || echo "0")
        file_permissions=$(stat -f%A "$file_path" 2>/dev/null || stat -c%a "$file_path" 2>/dev/null || echo "unknown")
        
        # Get file extension
        local file_ext="${file_path##*.}"
        [[ "$file_ext" == "$file_path" ]] && file_ext="none"
        
        file_info="exists"
    elif [[ -d "$file_path" ]]; then
        file_info="directory"
        file_type="directory"
    else
        file_info="not_found"
    fi
    
    local file_context
    file_context=$(cat <<EOF
{
  "file": {
    "path": "$file_path",
    "name": "$(basename "$file_path")",
    "directory": "$(dirname "$file_path")",
    "extension": "${file_ext:-none}",
    "type": "$file_type",
    "size": $file_size,
    "permissions": "$file_permissions",
    "status": "$file_info"
  }
}
EOF
    )
    
    # Merge with existing context
    CONTEXT_DATA=$(echo "$current_context" | jq --argjson file "$(echo "$file_context" | jq '.file')" '. + {file: $file}' 2>/dev/null) || {
        log_warning "Failed to merge file context with jq, using concatenation"
        CONTEXT_DATA="$current_context,$file_context"
    }
    
    log_debug "File context gathered successfully"
    return $EXIT_SUCCESS
}

gather_system_context() {
    local current_context="$CONTEXT_DATA"
    
    log_debug "Gathering system context"
    
    local system_context
    system_context=$(cat <<EOF
{
  "system": {
    "hostname": "$(hostname 2>/dev/null || echo 'unknown')",
    "os": "$(uname -s 2>/dev/null || echo 'unknown')",
    "architecture": "$(uname -m 2>/dev/null || echo 'unknown')",
    "shell": "${SHELL##*/}",
    "term": "${TERM:-unknown}",
    "lang": "${LANG:-unknown}",
    "timezone": "$(date +%Z 2>/dev/null || echo 'unknown')",
    "uptime": "$(uptime 2>/dev/null | cut -d',' -f1 | sed 's/.*up //' || echo 'unknown')"
  }
}
EOF
    )
    
    # Merge with existing context
    CONTEXT_DATA=$(echo "$current_context" | jq --argjson system "$(echo "$system_context" | jq '.system')" '. + {system: $system}' 2>/dev/null) || {
        log_warning "Failed to merge system context with jq, using concatenation"
        CONTEXT_DATA="$current_context,$system_context"
    }
    
    log_debug "System context gathered successfully"
    return $EXIT_SUCCESS
}

##################################
# Context File Management
##################################

create_context_file() {
    local subagent_name="${1:-unknown}"
    local event_type="${2:-unknown}"
    
    log_debug "Creating context file for $subagent_name"
    
    # Generate unique context file name
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
    
    # Validate JSON format if possible
    if command -v jq >/dev/null 2>&1; then
        if ! echo "$context_data" | jq . >/dev/null 2>&1; then
            log_warning "Context data is not valid JSON, writing as-is"
        fi
    fi
    
    # Write context data
    if ! write_context_file "$context_data" "$context_file"; then
        log_error "Failed to write context data to file: $context_file"
        return $EXIT_GENERAL_ERROR
    fi
    
    log_debug "Context data written successfully: $context_file"
    return $EXIT_SUCCESS
}

##################################
# Complete Context Gathering
##################################

gather_complete_context() {
    local event_type="${1:-unknown}"
    local subagent_name="${2:-unknown}"
    local additional_context="${3:-}"
    local include_system="${4:-false}"
    
    log_info "Gathering complete context for subagent: $subagent_name"
    
    # Gather all context components
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
    
    # Add additional context if provided
    if [[ -n "$additional_context" ]]; then
        add_additional_context "$additional_context"
    fi
    
    log_info "Complete context gathering finished"
    return $EXIT_SUCCESS
}

add_additional_context() {
    local additional_context="$1"
    local current_context="$CONTEXT_DATA"
    
    if [[ -z "$additional_context" ]]; then
        return $EXIT_SUCCESS
    fi
    
    log_debug "Adding additional context"
    
    local additional_json
    additional_json=$(cat <<EOF
{
  "additional": {
    "user_provided": "$additional_context",
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  }
}
EOF
    )
    
    # Merge with existing context
    CONTEXT_DATA=$(echo "$current_context" | jq --argjson additional "$(echo "$additional_json" | jq '.additional')" '. + {additional: $additional}' 2>/dev/null) || {
        log_warning "Failed to merge additional context with jq"
        CONTEXT_DATA="$current_context,$additional_json"
    }
    
    log_debug "Additional context added successfully"
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
    
    # Check if it's valid JSON
    if command -v jq >/dev/null 2>&1; then
        if ! echo "$context_data" | jq . >/dev/null 2>&1; then
            log_error "Context data is not valid JSON"
            return $EXIT_VALIDATION_FAILED
        fi
    fi
    
    # Check for required fields
    local required_fields=("metadata" "event" "environment")
    local field
    
    for field in "${required_fields[@]}"; do
        if command -v jq >/dev/null 2>&1; then
            if ! echo "$context_data" | jq -e ".$field" >/dev/null 2>&1; then
                log_error "Required context field missing: $field"
                return $EXIT_VALIDATION_FAILED
            fi
        else
            # Fallback validation without jq
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
    
    # Read and validate content
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
    
    # Reset global variables
    CONTEXT_FILE=""
    CONTEXT_DATA=""
    
    return $EXIT_SUCCESS
}

cleanup_all_context_files() {
    log_debug "Cleaning up all context files"
    
    # Clean up temporary context files
    cleanup_temp_files "$CONTEXT_FILE_PREFIX*"
    
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
    
    # Set default context timeout
    CONTEXT_TIMEOUT="${CONTEXT_TIMEOUT:-$DEFAULT_TIMEOUT}"
    
    # Ensure temp directory is available
    if [[ ! -d "/tmp" ]]; then
        log_error "Temporary directory not available"
        return $EXIT_GENERAL_ERROR
    fi
    
    return $EXIT_SUCCESS
}