#!/usr/bin/env bash

# File Utilities Module for Subagent-Hook Integration
# 
# This module provides standardized file operations with proper error handling,
# security checks, and logging for the subagent-hook integration system.

# Source required modules
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config-constants.sh"

##################################
# Directory Operations
##################################

ensure_directory_exists() {
    local dir_path="$1"
    local permissions="${2:-$SECURE_DIR_PERMISSIONS}"
    
    if [[ -z "$dir_path" ]]; then
        return $EXIT_GENERAL_ERROR
    fi
    
    if [[ ! -d "$dir_path" ]]; then
        if ! mkdir -p "$dir_path" 2>/dev/null; then
            return $EXIT_GENERAL_ERROR
        fi
    fi
    
    if ! chmod "$permissions" "$dir_path" 2>/dev/null; then
        return $EXIT_GENERAL_ERROR
    fi
    
    return $EXIT_SUCCESS
}

ensure_required_directories() {
    ensure_directory_exists "$CLAUDE_BASE_DIR" "$SECURE_DIR_PERMISSIONS" || return $?
    ensure_directory_exists "$SUBAGENTS_DIR" "$SECURE_DIR_PERMISSIONS" || return $?
    ensure_directory_exists "$LOGS_DIR" "$SECURE_DIR_PERMISSIONS" || return $?
    
    return $EXIT_SUCCESS
}

##################################
# File Reading Operations
##################################

read_file_safely() {
    local file_path="$1"
    
    if [[ -z "$file_path" ]]; then
        return $EXIT_GENERAL_ERROR
    fi
    
    if [[ ! -f "$file_path" ]]; then
        return $EXIT_GENERAL_ERROR
    fi
    
    if [[ ! -r "$file_path" ]]; then
        return $EXIT_GENERAL_ERROR
    fi
    
    # Check if file is binary (avoid reading binary files)
    if file "$file_path" 2>/dev/null | grep -q "binary"; then
        return $EXIT_GENERAL_ERROR
    fi
    
    cat "$file_path" 2>/dev/null
    return $?
}

read_file_with_size_limit() {
    local file_path="$1"
    local max_size="${2:-$MAX_CONTEXT_FILE_SIZE}"
    
    if [[ -z "$file_path" ]]; then
        return $EXIT_GENERAL_ERROR
    fi
    
    # Check file size
    if [[ -f "$file_path" ]]; then
        local file_size
        file_size=$(stat -f%z "$file_path" 2>/dev/null || stat -c%s "$file_path" 2>/dev/null)
        
        if [[ "$file_size" -gt "$max_size" ]]; then
            return $EXIT_GENERAL_ERROR
        fi
    fi
    
    read_file_safely "$file_path"
    return $?
}

##################################
# File Writing Operations
##################################

write_file_safely() {
    local file_path="$1"
    local content="$2"
    local permissions="${3:-$SECURE_FILE_PERMISSIONS}"
    
    if [[ -z "$file_path" ]]; then
        return $EXIT_GENERAL_ERROR
    fi
    
    # Ensure parent directory exists
    local parent_dir
    parent_dir="$(dirname "$file_path")"
    if ! ensure_directory_exists "$parent_dir"; then
        return $EXIT_GENERAL_ERROR
    fi
    
    # Write content
    if ! echo "$content" > "$file_path" 2>/dev/null; then
        return $EXIT_GENERAL_ERROR
    fi
    
    # Set permissions
    if ! chmod "$permissions" "$file_path" 2>/dev/null; then
        return $EXIT_GENERAL_ERROR
    fi
    
    return $EXIT_SUCCESS
}

create_temp_file() {
    local prefix="${1:-$CONTEXT_FILE_PREFIX}"
    local suffix="${2:-$$}"
    
    local temp_file="${prefix}-${suffix}.tmp"
    
    # Create empty temp file with secure permissions
    if ! touch "$temp_file" 2>/dev/null; then
        return $EXIT_GENERAL_ERROR
    fi
    
    if ! chmod "$SECURE_FILE_PERMISSIONS" "$temp_file" 2>/dev/null; then
        rm -f "$temp_file" 2>/dev/null
        return $EXIT_GENERAL_ERROR
    fi
    
    echo "$temp_file"
    return $EXIT_SUCCESS
}

write_context_file() {
    local context_data="$1"
    local temp_file="$2"
    
    if [[ -z "$context_data" ]] || [[ -z "$temp_file" ]]; then
        return $EXIT_GENERAL_ERROR
    fi
    
    write_file_safely "$temp_file" "$context_data" "$SECURE_FILE_PERMISSIONS"
    return $?
}

##################################
# File Validation Operations
##################################

file_exists_and_readable() {
    local file_path="$1"
    
    [[ -n "$file_path" ]] && [[ -f "$file_path" ]] && [[ -r "$file_path" ]]
    return $?
}

file_has_extension() {
    local file_path="$1"
    local expected_extension="$2"
    
    if [[ -z "$file_path" ]] || [[ -z "$expected_extension" ]]; then
        return $EXIT_GENERAL_ERROR
    fi
    
    [[ "$file_path" == *"$expected_extension" ]]
    return $?
}

is_valid_subagent_file() {
    local file_path="$1"
    
    # Check file exists and is readable
    if ! file_exists_and_readable "$file_path"; then
        return $EXIT_GENERAL_ERROR
    fi
    
    # Check file extension
    if ! file_has_extension "$file_path" "$SUBAGENT_FILE_EXTENSION"; then
        return $EXIT_GENERAL_ERROR
    fi
    
    # Check file size
    local file_content
    if ! file_content=$(read_file_with_size_limit "$file_path"); then
        return $EXIT_GENERAL_ERROR
    fi
    
    # Basic YAML frontmatter validation
    if ! echo "$file_content" | head -1 | grep -q "$YAML_FRONTMATTER_START"; then
        return $EXIT_GENERAL_ERROR
    fi
    
    return $EXIT_SUCCESS
}

##################################
# File Cleanup Operations
##################################

cleanup_temp_files() {
    local pattern="${1:-$TEMP_FILE_PATTERN}"
    local max_age_minutes="${2:-60}"
    
    # Find and remove old temp files
    find /tmp -name "$pattern" -type f -mmin +$max_age_minutes -delete 2>/dev/null || true
    
    return $EXIT_SUCCESS
}

cleanup_specific_temp_file() {
    local temp_file="$1"
    
    if [[ -n "$temp_file" ]] && [[ -f "$temp_file" ]]; then
        rm -f "$temp_file" 2>/dev/null || true
    fi
    
    return $EXIT_SUCCESS
}

##################################
# File Path Operations
##################################

resolve_subagent_path() {
    local subagent_name="$1"
    
    if [[ -z "$subagent_name" ]]; then
        return $EXIT_GENERAL_ERROR
    fi
    
    local subagent_file="${subagent_name}${SUBAGENT_FILE_EXTENSION}"
    
    # Check project-level subagents first (higher priority)
    local project_path="${PROJECT_SUBAGENTS_DIR}/${subagent_file}"
    if file_exists_and_readable "$project_path"; then
        echo "$project_path"
        return $EXIT_SUCCESS
    fi
    
    # Check user-level subagents
    local user_path="${SUBAGENTS_DIR}/${subagent_file}"
    if file_exists_and_readable "$user_path"; then
        echo "$user_path"
        return $EXIT_SUCCESS
    fi
    
    return $EXIT_SUBAGENT_NOT_FOUND
}

get_absolute_path() {
    local path="$1"
    
    if [[ -z "$path" ]]; then
        return $EXIT_GENERAL_ERROR
    fi
    
    # Convert to absolute path
    if [[ "$path" = /* ]]; then
        echo "$path"
    else
        echo "$(pwd)/$path"
    fi
    
    return $EXIT_SUCCESS
}

##################################
# File Permission Operations
##################################

validate_file_permissions() {
    local file_path="$1"
    
    if [[ -z "$file_path" ]] || [[ ! -f "$file_path" ]]; then
        return $EXIT_GENERAL_ERROR
    fi
    
    # Check if file is world-writable (security risk)
    local permissions
    permissions=$(stat -f%A "$file_path" 2>/dev/null || stat -c%a "$file_path" 2>/dev/null)
    
    if [[ -z "$permissions" ]]; then
        return $EXIT_GENERAL_ERROR
    fi
    
    # Check if world-writable (last digit should not be writable)
    local world_perms=$((permissions % 10))
    if [[ $((world_perms & 2)) -eq 2 ]]; then
        return $EXIT_SECURITY_VIOLATION
    fi
    
    return $EXIT_SUCCESS
}

set_secure_permissions() {
    local file_path="$1"
    local permissions="${2:-$SECURE_FILE_PERMISSIONS}"
    
    if [[ -z "$file_path" ]] || [[ ! -f "$file_path" ]]; then
        return $EXIT_GENERAL_ERROR
    fi
    
    chmod "$permissions" "$file_path" 2>/dev/null
    return $?
}

##################################
# Logging File Operations
##################################

ensure_log_files() {
    # Create log files with secure permissions if they don't exist
    if [[ ! -f "$LOG_FILE" ]]; then
        write_file_safely "$LOG_FILE" "" "$SECURE_FILE_PERMISSIONS" || return $?
    fi
    
    if [[ ! -f "$VIOLATION_LOG" ]]; then
        write_file_safely "$VIOLATION_LOG" "" "$SECURE_FILE_PERMISSIONS" || return $?
    fi
    
    return $EXIT_SUCCESS
}

##################################
# Path Validation (Security)
##################################

validate_path_safety() {
    local path="$1"
    
    if [[ -z "$path" ]]; then
        return $EXIT_GENERAL_ERROR
    fi
    
    # Check for path traversal attempts
    if [[ "$path" == *".."* ]] || [[ "$path" == *"/./"* ]]; then
        return $EXIT_SECURITY_VIOLATION
    fi
    
    # Check for absolute paths outside allowed directories
    if [[ "$path" = /* ]]; then
        # Allow paths within Claude base directory
        if [[ "$path" == "$CLAUDE_BASE_DIR"* ]]; then
            return $EXIT_SUCCESS
        fi
        
        # Allow paths within project directory
        if [[ "$path" == "$(pwd)"* ]]; then
            return $EXIT_SUCCESS
        fi
        
        # Allow temp files
        if [[ "$path" == "/tmp/claude-subagent"* ]]; then
            return $EXIT_SUCCESS
        fi
        
        return $EXIT_SECURITY_VIOLATION
    fi
    
    return $EXIT_SUCCESS
}