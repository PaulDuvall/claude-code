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
# Initialization
##################################
init_backup_dir() {
    BACKUP_DIR="$HOME/.claude-backups/$(date +%Y%m%d_%H%M%S)"
}