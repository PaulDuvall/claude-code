#!/bin/bash

# deploy.sh - Deploy custom Claude Code commands to local ~/.claude/commands directory

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="${SCRIPT_DIR}/slash-commands/active"
TARGET_DIR="${HOME}/.claude/commands"

# Default deployment mode
DEPLOY_MODE="active"
INCLUDE_COMMANDS=()
EXCLUDE_COMMANDS=()

# Function to show usage
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Deploy or manage custom Claude Code commands"
    echo ""
    echo "Deployment Options:"
    echo "  --source <dir>        Deploy from specific directory (active|experiments|path)"
    echo "  --experiments         Deploy experimental commands from slash-commands/experiments"
    echo "  --all                 Deploy both active and experimental commands"
    echo "  --include <cmd>       Include specific commands (can be used multiple times)"
    echo "  --exclude <cmd>       Exclude specific commands (can be used multiple times)"
    echo ""
    echo "Management Options:"
    echo "  -h, --help           Show this help message"
    echo "  -r, --remove         Remove all x-prefixed commands from ~/.claude/commands"
    echo "  --reset              Remove commands and exit Claude environment"
    echo "  --list               List available commands without deploying"
    echo "  --dry-run            Show what would be deployed without copying files"
    echo ""
    echo "Examples:"
    echo "  $0                          # Deploy active commands (default)"
    echo "  $0 --experiments            # Deploy experimental commands"
    echo "  $0 --all                    # Deploy both active and experimental"
    echo "  $0 --include xplanning      # Deploy only xplanning command from active"
    echo "  $0 --experiments --include xplanning --include xmetrics  # Deploy specific experimental commands"
    echo "  $0 --exclude xdebug         # Deploy all active except xdebug"
    echo "  $0 --source experiments     # Same as --experiments"
    echo "  $0 --dry-run --all          # Preview what would be deployed"
    echo "  $0 --list                   # List all available commands"
    echo "  $0 --remove                 # Remove x-prefixed commands"
    echo "  $0 --reset                  # Remove commands and reset environment"
}

# Function to remove x-prefixed commands
remove_commands() {
    echo "🗑️  Removing x-prefixed commands from $TARGET_DIR..."
    
    if [[ ! -d "$TARGET_DIR" ]]; then
        echo "⚠️  Directory $TARGET_DIR does not exist"
        return 0
    fi
    
    # Find and remove x-prefixed .md files
    removed=0
    for file in "$TARGET_DIR"/x*.md; do
        if [[ -f "$file" ]]; then
            filename=$(basename "$file")
            echo "  • Removing $filename"
            rm "$file"
            ((removed++))
        fi
    done
    
    if [[ $removed -eq 0 ]]; then
        echo "⚠️  No x-prefixed commands found to remove"
    else
        echo "✅ Successfully removed $removed x-prefixed command(s)"
    fi
}

# Function to reset Claude environment
reset_environment() {
    remove_commands
    echo ""
    echo "🔄 Resetting Claude environment..."
    echo "💡 Exiting current session. Run 'claude' to start fresh."
    exit 0
}

# Function to list available commands
list_commands() {
    echo "📋 Available Commands:"
    echo ""
    echo "🔵 Active Commands (slash-commands/active/):"
    if [[ -d "${SCRIPT_DIR}/slash-commands/active" ]]; then
        for file in "${SCRIPT_DIR}/slash-commands/active"/*.md; do
            if [[ -f "$file" ]]; then
                filename=$(basename "$file" .md)
                echo "  • /$filename"
            fi
        done
    else
        echo "  ⚠️  Directory not found"
    fi
    
    echo ""
    echo "🧪 Experimental Commands (slash-commands/experiments/):"
    if [[ -d "${SCRIPT_DIR}/slash-commands/experiments" ]]; then
        for file in "${SCRIPT_DIR}/slash-commands/experiments"/*.md; do
            if [[ -f "$file" ]]; then
                filename=$(basename "$file" .md)
                echo "  • /$filename"
            fi
        done
    else
        echo "  ⚠️  Directory not found"
    fi
    
    echo ""
    echo "💡 Use deployment options to install specific commands"
    exit 0
}

# Function to get source directories based on mode
get_source_dirs() {
    local dirs=()
    case "$DEPLOY_MODE" in
        "active")
            dirs=("${SCRIPT_DIR}/slash-commands/active")
            ;;
        "experiments")
            dirs=("${SCRIPT_DIR}/slash-commands/experiments")
            ;;
        "all")
            dirs=("${SCRIPT_DIR}/slash-commands/active" "${SCRIPT_DIR}/slash-commands/experiments")
            ;;
        *)
            # Custom path
            dirs=("$DEPLOY_MODE")
            ;;
    esac
    printf '%s\n' "${dirs[@]}"
}

# Function to check if command should be included
should_include_command() {
    local cmd="$1"
    local include_list=("${INCLUDE_COMMANDS[@]+"${INCLUDE_COMMANDS[@]}"}")
    local exclude_list=("${EXCLUDE_COMMANDS[@]+"${EXCLUDE_COMMANDS[@]}"}")
    
    # If include list is specified, only include commands in the list
    if [[ ${#include_list[@]} -gt 0 ]]; then
        for include_cmd in "${include_list[@]}"; do
            if [[ "$cmd" == "$include_cmd" ]]; then
                return 0
            fi
        done
        return 1
    fi
    
    # If exclude list is specified, exclude commands in the list
    if [[ ${#exclude_list[@]} -gt 0 ]]; then
        for exclude_cmd in "${exclude_list[@]}"; do
            if [[ "$cmd" == "$exclude_cmd" ]]; then
                return 1
            fi
        done
    fi
    
    return 0
}

# Parse command line arguments
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -r|--remove)
            remove_commands
            exit 0
            ;;
        --reset)
            reset_environment
            ;;
        --list)
            list_commands
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --experiments)
            DEPLOY_MODE="experiments"
            shift
            ;;
        --all)
            DEPLOY_MODE="all"
            shift
            ;;
        --source)
            if [[ -z "${2:-}" ]]; then
                echo "❌ Error: --source requires a directory argument"
                exit 1
            fi
            case "$2" in
                "active")
                    DEPLOY_MODE="active"
                    ;;
                "experiments")
                    DEPLOY_MODE="experiments"
                    ;;
                *)
                    # Custom path
                    if [[ ! -d "$2" ]]; then
                        echo "❌ Error: Directory '$2' does not exist"
                        exit 1
                    fi
                    DEPLOY_MODE="$2"
                    ;;
            esac
            shift 2
            ;;
        --include)
            if [[ -z "${2:-}" ]]; then
                echo "❌ Error: --include requires a command name"
                exit 1
            fi
            INCLUDE_COMMANDS+=("$2")
            shift 2
            ;;
        --exclude)
            if [[ -z "${2:-}" ]]; then
                echo "❌ Error: --exclude requires a command name"
                exit 1
            fi
            EXCLUDE_COMMANDS+=("$2")
            shift 2
            ;;
        "")
            # No arguments - proceed with deployment
            break
            ;;
        *)
            echo "❌ Error: Unknown option '$1'"
            echo ""
            show_help
            exit 1
            ;;
    esac
done

# Get source directories based on deployment mode
source_dirs=($(get_source_dirs))

# Validate source directories exist
for dir in "${source_dirs[@]}"; do
    if [[ ! -d "$dir" ]]; then
        echo "❌ Error: Source directory $dir not found"
        exit 1
    fi
done

# Show deployment mode
case "$DEPLOY_MODE" in
    "active")
        echo "🚀 Deploying active commands..."
        ;;
    "experiments")
        echo "🧪 Deploying experimental commands..."
        ;;
    "all")
        echo "🚀 Deploying all commands (active + experimental)..."
        ;;
    *)
        echo "🚀 Deploying commands from custom directory: $DEPLOY_MODE"
        ;;
esac

# Show filters if any
if [[ ${#INCLUDE_COMMANDS[@]} -gt 0 ]]; then
    echo "🎯 Including only: ${INCLUDE_COMMANDS[*]}"
fi
if [[ ${#EXCLUDE_COMMANDS[@]} -gt 0 ]]; then
    echo "🚫 Excluding: ${EXCLUDE_COMMANDS[*]}"
fi

# Create target directory if it doesn't exist (unless dry run)
if [[ ! -d "$TARGET_DIR" && "$DRY_RUN" == "false" ]]; then
    echo "📁 Creating directory: $TARGET_DIR"
    mkdir -p "$TARGET_DIR"
fi

# Process all source directories
total_copied=0
commands_to_deploy=()

echo ""
echo "📋 Scanning for commands to deploy:"

for source_dir in "${source_dirs[@]}"; do
    dir_name=$(basename "$source_dir")
    echo "  📂 $dir_name directory:"
    
    # Find all .md files in this directory
    found_files=false
    for file in "$source_dir"/*.md; do
        if [[ -f "$file" ]]; then
            found_files=true
            filename=$(basename "$file")
            command_name=$(basename "$file" .md)
            
            # Check if command should be included based on filters
            if should_include_command "$command_name"; then
                commands_to_deploy+=("$file")
                echo "    ✅ $filename"
            else
                echo "    ⏭️  $filename (filtered out)"
            fi
        fi
    done
    
    if [[ "$found_files" == "false" ]]; then
        echo "    ⚠️  No .md files found"
    fi
done

# Check if any commands to deploy
if [[ ${#commands_to_deploy[@]} -eq 0 ]]; then
    echo ""
    echo "⚠️  No commands selected for deployment"
    echo "💡 Use --list to see available commands or adjust your filters"
    exit 0
fi

echo ""
if [[ "$DRY_RUN" == "true" ]]; then
    echo "🔍 DRY RUN - Would deploy ${#commands_to_deploy[@]} command(s):"
    for file in "${commands_to_deploy[@]}"; do
        filename=$(basename "$file")
        echo "  • $filename"
    done
    echo ""
    echo "💡 Run without --dry-run to actually deploy these commands"
    exit 0
fi

# Actually deploy the commands
echo "📦 Deploying ${#commands_to_deploy[@]} command(s) to $TARGET_DIR:"

for file in "${commands_to_deploy[@]}"; do
    filename=$(basename "$file")
    echo "  • $filename"
    cp "$file" "$TARGET_DIR/"
    ((total_copied++))
done

echo ""
echo "✅ Successfully deployed $total_copied command(s) to ~/.claude/commands/"
echo "💡 Commands are now available as slash commands in Claude Code"

# List deployed commands
echo ""
echo "📝 Deployed commands:"
for file in "${commands_to_deploy[@]}"; do
    command_name=$(basename "$file" .md)
    echo "  • /$command_name"
done

echo ""
echo "🔄 To use the new commands, restart Claude Code:"
echo "  • Type 'exit' to quit the current session"
echo "  • Run 'claude' to start a new session with the updated commands"