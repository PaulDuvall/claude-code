#!/usr/bin/env bash
set -uo pipefail

# Context Gathering Module for Subagent-Hook Integration
#
# Provides functions to gather context from various sources (basic, Claude,
# git, file, system) and merge into a single JSON context structure.

# Include guard
[[ -n "${_CONTEXT_GATHERING_LOADED:-}" ]] && return 0
_CONTEXT_GATHERING_LOADED=1

# Source required modules
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config-constants.sh"
source "$SCRIPT_DIR/file-utils.sh"
source "$SCRIPT_DIR/error-handler.sh"

##################################
# Context Gathering Functions
##################################

gather_basic_context() {
    local event_type="${1:-unknown}"
    local subagent_name="${2:-unknown}"
    local additional_context="${3:-}"

    log_debug "Gathering basic context for $subagent_name (event: $event_type)"

    local safe_event safe_name safe_user safe_wd
    safe_event=$(json_escape "$event_type")
    safe_name=$(json_escape "$subagent_name")
    safe_user=$(json_escape "$USER")
    safe_wd=$(json_escape "$(pwd)")

    CONTEXT_DATA=$(cat <<EOF
{
  "metadata": {
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "hook_version": "$SUBAGENT_HOOK_VERSION",
    "api_version": "$API_VERSION"
  },
  "event": {
    "type": "$safe_event",
    "trigger": "${CLAUDE_HOOK_TRIGGER:-manual}",
    "subagent": "$safe_name"
  },
  "environment": {
    "user": "$safe_user",
    "working_directory": "$safe_wd",
    "process_id": $$,
    "session_id": "${CLAUDE_SESSION_ID:-$$}"
  }
}
EOF
    )

    log_debug "Basic context gathered successfully"
    return $EXIT_SUCCESS
}

gather_claude_context() {
    local current_context="$CONTEXT_DATA"

    log_debug "Gathering Claude-specific context"

    local claude_context
    claude_context=$(cat <<EOF
{
  "claude": {
    "tool": "${CLAUDE_TOOL:-unknown}",
    "file": "${CLAUDE_FILE:-none}",
    "content": "${CLAUDE_CONTENT:-none}",
    "version": "${CLAUDE_VERSION:-unknown}",
    "project": "${CLAUDE_PROJECT:-unknown}",
    "security_override": "disabled"
  }
}
EOF
    )

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

    local git_branch git_commit git_remote
    git_branch=$(git branch --show-current 2>/dev/null || echo "not-in-git")
    git_commit=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    git_remote=$(git remote get-url origin 2>/dev/null || echo "none")

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

    local file_info="not_found"
    local file_type="unknown"
    local file_size="0"
    local file_permissions="unknown"
    local file_ext="none"

    if [[ -f "$file_path" ]]; then
        file_type=$(file -b "$file_path" 2>/dev/null || echo "unknown")
        file_size=$(stat -f%z "$file_path" 2>/dev/null || stat -c%s "$file_path" 2>/dev/null || echo "0")
        file_permissions=$(stat -f%A "$file_path" 2>/dev/null || stat -c%a "$file_path" 2>/dev/null || echo "unknown")
        file_ext="${file_path##*.}"
        [[ "$file_ext" == "$file_path" ]] && file_ext="none"
        file_info="exists"
    elif [[ -d "$file_path" ]]; then
        file_info="directory"
        file_type="directory"
    fi

    local file_context
    file_context=$(cat <<EOF
{
  "file": {
    "path": "$file_path",
    "name": "$(basename "$file_path")",
    "directory": "$(dirname "$file_path")",
    "extension": "$file_ext",
    "type": "$file_type",
    "size": $file_size,
    "permissions": "$file_permissions",
    "status": "$file_info"
  }
}
EOF
    )

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
    "hostname": "redacted",
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

    CONTEXT_DATA=$(echo "$current_context" | jq --argjson system "$(echo "$system_context" | jq '.system')" '. + {system: $system}' 2>/dev/null) || {
        log_warning "Failed to merge system context with jq, using concatenation"
        CONTEXT_DATA="$current_context,$system_context"
    }

    log_debug "System context gathered successfully"
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

    CONTEXT_DATA=$(echo "$current_context" | jq --argjson additional "$(echo "$additional_json" | jq '.additional')" '. + {additional: $additional}' 2>/dev/null) || {
        log_warning "Failed to merge additional context with jq"
        CONTEXT_DATA="$current_context,$additional_json"
    }

    log_debug "Additional context added successfully"
    return $EXIT_SUCCESS
}
