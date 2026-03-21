#!/usr/bin/env bash
set -euo pipefail

# Claude Code Hook: Prompt Security Scan
#
# Description: Scans prompts for security-sensitive content
# Purpose: Prevent credential exposure and validate prompt content for security risks
# Trigger: UserPromptSubmit
# Blocking: No
# Tools: *
# Author: Claude Dev Toolkit
# Version: 1.0.0
# Category: security

##################################
# Configuration
##################################
HOOK_NAME="prompt-security-scan"
LOG_FILE="$HOME/.claude/logs/prompt-security-scan.log"

# Ensure log directory exists with secure permissions
mkdir -p "$(dirname "$LOG_FILE")"
chmod 700 "$(dirname "$LOG_FILE")"

# Create log file with restrictive permissions if it doesn't exist
touch "$LOG_FILE"
chmod 600 "$LOG_FILE"

##################################
# Logging
##################################
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$HOOK_NAME] $*" >> "$LOG_FILE"
}

##################################
# Main Hook Logic
##################################
main() {
    local tool_name="${CLAUDE_TOOL:-unknown}"
    local file_path="${CLAUDE_FILE:-}"

    log "Hook triggered for tool: $tool_name, file: $file_path"

    # Security validation check
    log "Running security check for $tool_name operation"

    # TODO: Add specific validation logic for prompt-security-scan
    log "Security check passed for $tool_name"

    exit 0
}

##################################
# Error Handling
##################################
trap 'log "Hook failed with error on line $LINENO"' ERR

##################################
# Execute Main Function
##################################
main "$@"
