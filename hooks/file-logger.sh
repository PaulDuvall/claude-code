#!/usr/bin/env bash
set -euo pipefail

# Claude Code Hook: File Logger
# 
# Purpose: Simple demonstration of hook functionality
# Trigger: PreToolUse for Edit, Write, MultiEdit tools
# Blocking: No - just logs activity
#
# This hook demonstrates basic hook functionality by logging file operations


##################################
# Configuration
##################################
HOOK_NAME="file-logger"
LOG_FILE="$HOME/.claude/logs/file-logger.log"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

##################################
# Logging Functions
##################################
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$HOOK_NAME] $*" | tee -a "$LOG_FILE"
}

##################################
# Main Hook Logic
##################################
main() {
    local tool_name="${CLAUDE_TOOL:-unknown}"
    local file_path="${CLAUDE_FILE:-unknown}"
    
    log "Hook triggered!"
    log "Tool: $tool_name"
    log "File: $file_path"
    
    # Only process file modification tools
    case "$tool_name" in
        "Edit"|"Write"|"MultiEdit")
            log "Processing file modification tool: $tool_name"
            ;;
        *)
            log "Skipping non-file tool: $tool_name"
            exit 0
            ;;
    esac
    
    # Get basic file info if file exists
    if [[ -n "$file_path" ]] && [[ "$file_path" != "unknown" ]] && [[ -f "$file_path" ]]; then
        local file_size=$(wc -c < "$file_path" 2>/dev/null || echo "0")
        local file_lines=$(wc -l < "$file_path" 2>/dev/null || echo "0")
        
        log "File size: $file_size bytes"
        log "File lines: $file_lines"
        log "File type: $(file -b "$file_path" 2>/dev/null || echo "unknown")"
    else
        log "File does not exist yet or path unknown"
    fi
    
    # Always allow the operation to proceed
    log "Operation allowed - no blocking behavior"
    exit 0
}

##################################
# Execute Main Function
##################################
main "$@"