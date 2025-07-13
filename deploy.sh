#!/bin/bash

# deploy.sh - Deploy custom Claude Code commands to local ~/.claude/commands directory

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="${SCRIPT_DIR}/claude-commands"
TARGET_DIR="${HOME}/.claude/commands"

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