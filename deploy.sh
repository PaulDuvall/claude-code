#!/bin/bash

# deploy.sh - Deploy custom Claude Code commands to local ~/.claude/commands directory

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="${SCRIPT_DIR}/claude-commands"
TARGET_DIR="${HOME}/.claude/commands"

# Function to show usage
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Deploy or manage custom Claude Code commands"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -r, --remove   Remove all x-prefixed commands from ~/.claude/commands"
    echo "  --reset        Remove commands and exit Claude environment"
    echo "  (no options)   Deploy all commands from claude-commands directory"
    echo ""
    echo "Examples:"
    echo "  $0              # Deploy all commands"
    echo "  $0 --remove     # Remove x-prefixed commands"
    echo "  $0 --reset      # Remove commands and reset environment"
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

# Parse command line arguments
case "${1:-}" in
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
    "")
        # No arguments - proceed with deployment
        ;;
    *)
        echo "❌ Error: Unknown option '$1'"
        echo ""
        show_help
        exit 1
        ;;
esac

echo "🚀 Deploying Claude Code commands..."

# Check if source directory exists
if [[ ! -d "$SOURCE_DIR" ]]; then
    echo "❌ Error: Source directory $SOURCE_DIR not found"
    exit 1
fi

# Create target directory if it doesn't exist
if [[ ! -d "$TARGET_DIR" ]]; then
    echo "📁 Creating directory: $TARGET_DIR"
    mkdir -p "$TARGET_DIR"
fi

# Copy all .md files from source to target
echo "📋 Copying commands from $SOURCE_DIR to $TARGET_DIR"

# Count files to copy
file_count=$(find "$SOURCE_DIR" -name "*.md" | wc -l)
if [[ $file_count -eq 0 ]]; then
    echo "⚠️  No .md files found in $SOURCE_DIR"
    exit 0
fi

# Copy files
copied=0
for file in "$SOURCE_DIR"/*.md; do
    if [[ -f "$file" ]]; then
        filename=$(basename "$file")
        echo "  • $filename"
        cp "$file" "$TARGET_DIR/"
        ((copied++))
    fi
done

echo "✅ Successfully deployed $copied command(s) to ~/.claude/commands/"
echo "💡 Commands are now available as slash commands in Claude Code"

# List deployed commands
echo ""
echo "📝 Deployed commands:"
ls -la "$TARGET_DIR"/*.md 2>/dev/null | awk '{print "  •", $9}' | sed "s|$TARGET_DIR/||g"

echo ""
echo "🔄 To use the new commands, restart Claude Code:"
echo "  • Type 'exit' to quit the current session"
echo "  • Run 'claude' to start a new session with the updated commands"