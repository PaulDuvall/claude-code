#!/usr/bin/env bash
# Hook Helpers — shared utilities for standalone hooks
#
# Usage: source this at the top of any hook after setting HOOK_NAME and LOG_FILE.
#   HOOK_NAME="my-hook"
#   LOG_FILE="$HOME/.claude/logs/my-hook.log"
#   source "$(dirname "$0")/lib/hook-helpers.sh"

# Include guard
[[ -n "${_HOOK_HELPERS_LOADED:-}" ]] && return 0
_HOOK_HELPERS_LOADED=1

##################################
# Log Setup
##################################

ensure_log_setup() {
    local log_file="${1:-$LOG_FILE}"
    mkdir -p "$(dirname "$log_file")"
    chmod 700 "$(dirname "$log_file")"
    touch "$log_file"
    chmod 600 "$log_file"
}

##################################
# Logging
##################################

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$HOOK_NAME] $*" >> "$LOG_FILE"
}

log_tee() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$HOOK_NAME] $*" | tee -a "$LOG_FILE"
}

warn() {
    echo "[WARN] $*" >&2
    log "WARNING: $*"
}

##################################
# Error Traps
##################################

setup_hook_traps() {
    trap '_hook_err_handler $LINENO' ERR
    trap 'exit 130' INT TERM
}

_hook_err_handler() {
    local line="$1"
    log "ERROR at line $line (exit $?)"
}

##################################
# JSON Utilities
##################################

json_escape() {
    local input="$1"
    input="${input//\\/\\\\}"
    input="${input//\"/\\\"}"
    input="${input//$'\n'/\\n}"
    input="${input//$'\r'/\\r}"
    input="${input//$'\t'/\\t}"
    printf '%s' "$input"
}
