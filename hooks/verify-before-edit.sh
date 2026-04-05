#!/usr/bin/env bash
set -euo pipefail

# Claude Code Hook: Verify Before Edit
#
# Description: Warns about potentially fabricated references in file edits
# Purpose: Prevent use of fabricated URLs, account IDs, or asset paths by validating references
# Trigger: PreToolUse
# Blocking: No
# Tools: Edit, Write, MultiEdit
# Author: Claude Dev Toolkit
# Version: 1.0.0
# Category: security
#
# This hook checks for placeholder or fabricated identifiers to prevent
# accidental use of invalid references in code and configuration files.

##################################
# Configuration
##################################
HOOK_NAME="verify-before-edit"
LOG_FILE="$HOME/.claude/logs/verify-before-edit.log"
source "$(dirname "$0")/lib/hook-helpers.sh"
ensure_log_setup "$LOG_FILE"
setup_hook_traps

##################################
# Skip Checks
##################################
should_skip_file() {
    local file="$1"
    case "$file" in
        *test*|*spec*|*example*|*fixture*|*mock*|*stub*)
            return 0 ;;
        *)
            return 1 ;;
    esac
}

##################################
# Pattern Scanning
##################################
scan_for_placeholders() {
    local content="$1"

    local patterns=(
        'your-api-key-here'
        'REPLACE_ME'
        '<INSERT>'
        'your-.*-here'
        'xxx-.*-xxx'
        'TODO:.*http'
        'placeholder'
    )

    for pattern in "${patterns[@]}"; do
        if echo "$content" | grep -qiE "$pattern"; then
            warn "Suspicious placeholder detected: $pattern"
        fi
    done
}

scan_for_fabricated_ids() {
    local content="$1"

    if echo "$content" | grep -qE '000000|123456|111111'; then
        warn "Sequential/zero ID detected — check if valid"
    fi

    if echo "$content" | grep -qE 'G-[A-Z0-9]{10}|UA-[0-9]{9}' 2>/dev/null; then
        warn "Analytics ID found — validate against project config"
    fi
}

##################################
# Main Hook Logic
##################################
main() {
    local tool_name="${CLAUDE_TOOL:-unknown}"
    local file_path="${CLAUDE_FILE:-}"
    local content="${CLAUDE_CONTENT:-}"

    log "Hook triggered for tool: $tool_name, file: $file_path"

    case "$tool_name" in
        "Edit"|"Write"|"MultiEdit") ;;
        *)
            log "Skipping non-edit tool: $tool_name"
            exit 0 ;;
    esac

    if should_skip_file "$file_path"; then
        log "Skipping check for test/example file: $file_path"
        exit 0
    fi

    if [[ -z "$content" ]] && [[ -n "$file_path" ]] && [[ -f "$file_path" ]]; then
        content=$(cat "$file_path" 2>/dev/null || echo "")
    fi

    if [[ -z "$content" ]]; then
        log "No content to validate"
        exit 0
    fi

    scan_for_placeholders "$content"
    scan_for_fabricated_ids "$content"

    log "Security validation complete for $file_path"
    exit 0
}

##################################
# Execute
##################################
main "$@"
