#!/usr/bin/env bash
# Utility functions for Claude Code configuration
# Common logging, prompting, and file operations

##################################
# Global Variables
##################################
BACKUP_DIR=""
DRY_RUN=false
INTERACTIVE=true
FORCE=false

##################################
# Logging Functions
##################################
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

error() {
    echo "[ERROR] $*" >&2
}

##################################
# User Interaction
##################################
confirm() {
    if [[ "$FORCE" == "true" ]]; then
        return 0
    fi
    
    if [[ "$INTERACTIVE" == "true" ]]; then
        echo -n "$1 (y/n) "
        read -r response
        [[ "$response" == "y" ]]
    else
        return 0
    fi
}

##################################
# File Operations
##################################
backup_file() {
    local file="$1"
    if [[ -f "$file" ]]; then
        if [[ "$DRY_RUN" == "true" ]]; then
            log "[DRY-RUN] Would backup $file to $BACKUP_DIR/"
        else
            mkdir -p "$BACKUP_DIR"
            cp -p "$file" "$BACKUP_DIR/"
            log "Backed up $file to $BACKUP_DIR/"
        fi
    fi
}

backup_directory() {
    local dir="$1"
    if [[ -d "$dir" ]]; then
        if [[ "$DRY_RUN" == "true" ]]; then
            log "[DRY-RUN] Would backup directory $dir to $BACKUP_DIR/"
        else
            mkdir -p "$BACKUP_DIR"
            cp -rp "$dir" "$BACKUP_DIR/"
            log "Backed up directory $dir to $BACKUP_DIR/"
        fi
    fi
}

show_diff() {
    local file="$1"
    local new_content="$2"
    
    if [[ -f "$file" ]]; then
        echo "=== Changes to $file ==="
        if command -v diff &> /dev/null; then
            echo "$new_content" | diff -u "$file" - || true
        else
            echo "Current file exists. New content would replace it."
        fi
        echo "==================="
    else
        echo "=== New file: $file ==="
        echo "$new_content"
        echo "==================="
    fi
}

##################################
# Configuration Management
##################################
apply_change() {
    local action="$1"
    local description="$2"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY-RUN] Would: $description"
    else
        log "Applying: $description"
        if ! eval "$action"; then
            error "Failed to execute: $description"
            exit 1
        fi
    fi
}

##################################
# Dependency Validation
##################################
check_dependency() {
    local cmd="$1"
    local install_msg="${2:-Install $cmd}"
    local required="${3:-true}"
    
    if ! command -v "$cmd" &> /dev/null; then
        if [[ "$required" == "true" ]]; then
            error "Required dependency '$cmd' not found"
            echo "  $install_msg"
            return 1
        else
            log "Optional dependency '$cmd' not found - some features may be limited"
            echo "  $install_msg"
            return 2
        fi
    fi
    return 0
}

validate_dependencies() {
    local deps_file="$1"
    local failed_deps=()
    local missing_optional=()
    
    if [[ ! -f "$deps_file" ]]; then
        log "No dependency file specified, skipping validation"
        return 0
    fi
    
    log "Validating dependencies from $deps_file..."
    
    # Read dependencies file (format: command|install_message|required)
    while IFS='|' read -r cmd install_msg required; do
        # Skip comments and empty lines
        [[ "$cmd" =~ ^#.*$ ]] || [[ -z "$cmd" ]] && continue
        
        case $(check_dependency "$cmd" "$install_msg" "$required") in
            1) failed_deps+=("$cmd") ;;
            2) missing_optional+=("$cmd") ;;
        esac
    done < "$deps_file"
    
    if [[ ${#failed_deps[@]} -gt 0 ]]; then
        error "Missing ${#failed_deps[@]} required dependencies: ${failed_deps[*]}"
        return 1
    fi
    
    if [[ ${#missing_optional[@]} -gt 0 ]]; then
        log "Missing ${#missing_optional[@]} optional dependencies: ${missing_optional[*]}"
    fi
    
    log "Dependency validation completed successfully"
    return 0
}

##################################
# Initialization
##################################
init_backup_dir() {
    BACKUP_DIR="$HOME/.claude-backups/$(date +%Y%m%d_%H%M%S)"
}