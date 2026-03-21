#!/usr/bin/env bash
set -uo pipefail

# Field Validators Module
#
# Provides validation functions for individual subagent metadata fields
# (name, description, version, tools, tags).
# Extracted from subagent-validator.sh.

# Include guard
[[ -n "${_FIELD_VALIDATORS_LOADED:-}" ]] && return 0
_FIELD_VALIDATORS_LOADED=1

# Source required modules
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config-constants.sh"
source "$SCRIPT_DIR/error-handler.sh"

##################################
# Field Validation Functions
##################################

validate_subagent_name_field() {
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
        return $EXIT_VALIDATION_FAILED
    fi

    return $EXIT_SUCCESS
}

validate_description_field() {
    local description="$1"

    if [[ -z "$description" ]]; then
        log_error "Description cannot be empty"
        return $EXIT_VALIDATION_FAILED
    fi

    if [[ ${#description} -lt $MIN_DESCRIPTION_LENGTH ]]; then
        log_error "Description too short: ${#description} chars (min: $MIN_DESCRIPTION_LENGTH)"
        return $EXIT_VALIDATION_FAILED
    fi

    if [[ ${#description} -gt $MAX_DESCRIPTION_LENGTH ]]; then
        log_error "Description too long: ${#description} chars (max: $MAX_DESCRIPTION_LENGTH)"
        return $EXIT_VALIDATION_FAILED
    fi

    return $EXIT_SUCCESS
}

validate_version_field() {
    local version="$1"

    # Semantic versioning pattern
    if [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$ ]]; then
        return $EXIT_SUCCESS
    fi

    # Simple versioning pattern
    if [[ "$version" =~ ^[0-9]+(\.[0-9]+)*$ ]]; then
        return $EXIT_SUCCESS
    fi

    log_error "Invalid version format: $version"
    return $EXIT_VALIDATION_FAILED
}

validate_tools_field() {
    local tools="$1"

    # Tools can be comma-separated or a single word
    if [[ "$tools" =~ ^[a-zA-Z][a-zA-Z0-9_]*([[:space:]]*,[[:space:]]*[a-zA-Z][a-zA-Z0-9_]*)*$ ]]; then
        return $EXIT_SUCCESS
    fi

    log_error "Invalid tools format: $tools"
    return $EXIT_VALIDATION_FAILED
}

validate_tags_field() {
    local tags="$1"

    # Tags can be array format or comma-separated
    if [[ "$tags" =~ ^\[.*\]$ ]] || [[ "$tags" =~ ^[a-zA-Z][a-zA-Z0-9_,-\s]*$ ]]; then
        return $EXIT_SUCCESS
    fi

    log_error "Invalid tags format: $tags"
    return $EXIT_VALIDATION_FAILED
}
