#!/usr/bin/env bash
# lib/logging.sh - Shared logging utilities for Claude Code project
#
# This module provides standardized logging functions supporting both:
# - Colored terminal output for interactive use
# - Structured file logging for CI/CD and debugging
#
# Usage:
#   source "$(dirname "$0")/lib/logging.sh"
#   log_init "my-script"  # Optional: set script name for structured logging
#   log_info "Starting process..."
#   log_success "Task completed"
#   log_warning "Deprecation notice"
#   log_error "Something failed"

##################################
# Configuration
##################################

# Colors for terminal output
LOG_COLOR_RED='\033[0;31m'
LOG_COLOR_GREEN='\033[0;32m'
LOG_COLOR_YELLOW='\033[1;33m'
LOG_COLOR_BLUE='\033[0;34m'
LOG_COLOR_NC='\033[0m' # No Color

# Logging settings (can be overridden by calling script)
LOG_SCRIPT_NAME="${LOG_SCRIPT_NAME:-$(basename "$0")}"
LOG_FILE="${LOG_FILE:-}"  # Empty = no file logging
LOG_FORMAT="${LOG_FORMAT:-pretty}"  # pretty | structured | json
LOG_LEVEL="${LOG_LEVEL:-info}"  # debug | info | warn | error
LOG_TIMESTAMPS="${LOG_TIMESTAMPS:-false}"  # true | false for terminal output

##################################
# Initialization
##################################

# Initialize logging with optional script name
log_init() {
    local script_name="${1:-}"
    if [[ -n "$script_name" ]]; then
        LOG_SCRIPT_NAME="$script_name"
    fi
}

# Set log file for file-based logging
log_set_file() {
    local file_path="$1"
    LOG_FILE="$file_path"

    # Create log directory if needed
    local log_dir
    log_dir="$(dirname "$file_path")"
    if [[ -n "$log_dir" ]] && [[ ! -d "$log_dir" ]]; then
        mkdir -p "$log_dir" 2>/dev/null || true
    fi
}

##################################
# Internal Helper Functions
##################################

# Check if we should use colors (only if terminal is interactive)
_log_use_colors() {
    [[ -t 1 ]] && [[ "${NO_COLOR:-}" != "1" ]] && [[ "${LOG_NO_COLOR:-}" != "true" ]]
}

# Get current timestamp
_log_timestamp() {
    date +'%Y-%m-%d %H:%M:%S'
}

# Get log level numeric value for comparison
_log_level_value() {
    local level="$1"
    case "$level" in
        debug) echo 0 ;;
        info)  echo 1 ;;
        warn)  echo 2 ;;
        error) echo 3 ;;
        *)     echo 1 ;;
    esac
}

# Check if message should be logged based on LOG_LEVEL
_log_should_log() {
    local msg_level="$1"
    local threshold
    threshold=$(_log_level_value "$LOG_LEVEL")
    local msg_value
    msg_value=$(_log_level_value "$msg_level")
    [[ "$msg_value" -ge "$threshold" ]]
}

# Format message for terminal output
_log_format_terminal() {
    local level="$1"
    local message="$2"
    local color="$3"
    local prefix="$4"

    local timestamp_part=""
    if [[ "$LOG_TIMESTAMPS" == "true" ]]; then
        timestamp_part="[$(_log_timestamp)] "
    fi

    if _log_use_colors; then
        echo -e "${timestamp_part}${color}${prefix}:${LOG_COLOR_NC} ${message}"
    else
        echo "${timestamp_part}${prefix}: ${message}"
    fi
}

# Format message for file output
_log_format_file() {
    local level="$1"
    local message="$2"

    case "$LOG_FORMAT" in
        json)
            printf '{"timestamp":"%s","level":"%s","script":"%s","message":"%s"}\n' \
                "$(_log_timestamp)" "$level" "$LOG_SCRIPT_NAME" "$message"
            ;;
        structured)
            printf '[%s] [%s] [%s] %s\n' \
                "$(_log_timestamp)" "$LOG_SCRIPT_NAME" "$level" "$message"
            ;;
        *)  # pretty or default
            printf '[%s] [%s] %s\n' "$(_log_timestamp)" "$level" "$message"
            ;;
    esac
}

# Write to log file if configured
_log_write_file() {
    local level="$1"
    local message="$2"

    if [[ -n "$LOG_FILE" ]]; then
        _log_format_file "$level" "$message" >> "$LOG_FILE" 2>/dev/null || true
    fi
}

##################################
# Public Logging Functions
##################################

# Log informational message
log_info() {
    local message="$1"
    _log_should_log "info" || return 0
    _log_format_terminal "INFO" "$message" "$LOG_COLOR_BLUE" "INFO"
    _log_write_file "INFO" "$message"
}

# Log success message
log_success() {
    local message="$1"
    _log_should_log "info" || return 0
    _log_format_terminal "SUCCESS" "$message" "$LOG_COLOR_GREEN" "SUCCESS"
    _log_write_file "SUCCESS" "$message"
}

# Log warning message (to stderr)
log_warning() {
    local message="$1"
    _log_should_log "warn" || return 0
    _log_format_terminal "WARN" "$message" "$LOG_COLOR_YELLOW" "WARNING" >&2
    _log_write_file "WARN" "$message"
}

# Log error message (to stderr)
log_error() {
    local message="$1"
    _log_should_log "error" || return 0
    _log_format_terminal "ERROR" "$message" "$LOG_COLOR_RED" "ERROR" >&2
    _log_write_file "ERROR" "$message"
}

# Log debug message (only when LOG_LEVEL=debug)
log_debug() {
    local message="$1"
    _log_should_log "debug" || return 0
    _log_format_terminal "DEBUG" "$message" "$LOG_COLOR_NC" "DEBUG"
    _log_write_file "DEBUG" "$message"
}

# Log critical message (always shown, to stderr)
log_critical() {
    local message="$1"
    _log_format_terminal "CRITICAL" "$message" "$LOG_COLOR_RED" "CRITICAL" >&2
    _log_write_file "CRITICAL" "$message"
}

##################################
# Compatibility Aliases
##################################

# For backward compatibility with scripts using different naming
log_warn() { log_warning "$@"; }
log_err() { log_error "$@"; }

##################################
# Structured Logging Helpers
##################################

# Log with custom key-value pairs (for structured formats)
log_structured() {
    local level="$1"
    local message="$2"
    shift 2

    # Build extra fields for JSON format
    if [[ "$LOG_FORMAT" == "json" ]] && [[ -n "$LOG_FILE" ]]; then
        local extra_fields=""
        while [[ $# -ge 2 ]]; do
            extra_fields+=",\"$1\":\"$2\""
            shift 2
        done

        printf '{"timestamp":"%s","level":"%s","script":"%s","message":"%s"%s}\n' \
            "$(_log_timestamp)" "$level" "$LOG_SCRIPT_NAME" "$message" "$extra_fields" \
            >> "$LOG_FILE" 2>/dev/null || true
    fi

    # Also log to terminal
    case "$level" in
        INFO)     log_info "$message" ;;
        SUCCESS)  log_success "$message" ;;
        WARN)     log_warning "$message" ;;
        ERROR)    log_error "$message" ;;
        DEBUG)    log_debug "$message" ;;
        CRITICAL) log_critical "$message" ;;
        *)        log_info "$message" ;;
    esac
}

##################################
# Log Section Helpers
##################################

# Print a section header
log_section() {
    local title="$1"
    local width="${2:-50}"

    if _log_use_colors; then
        echo -e "\n${LOG_COLOR_BLUE}$(printf '=%.0s' $(seq 1 "$width"))${LOG_COLOR_NC}"
        echo -e "${LOG_COLOR_BLUE}  ${title}${LOG_COLOR_NC}"
        echo -e "${LOG_COLOR_BLUE}$(printf '=%.0s' $(seq 1 "$width"))${LOG_COLOR_NC}\n"
    else
        echo ""
        printf '=%.0s' $(seq 1 "$width")
        echo ""
        echo "  ${title}"
        printf '=%.0s' $(seq 1 "$width")
        echo -e "\n"
    fi
}

# Print a subsection divider
log_divider() {
    local width="${1:-40}"
    if _log_use_colors; then
        echo -e "${LOG_COLOR_BLUE}$(printf '-%.0s' $(seq 1 "$width"))${LOG_COLOR_NC}"
    else
        printf '-%.0s' $(seq 1 "$width")
        echo ""
    fi
}
