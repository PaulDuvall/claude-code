#!/bin/bash
# statusline.sh - Claude Code status line showing model, directory, and context usage
# Usage: Configure in ~/.claude/settings.json:
#   "statusLine": {"type": "command", "command": "~/.claude/hooks/statusline.sh"}
#
# Claude Code sends JSON to stdin with model, workspace, and context_window data.
# Requires: jq (brew install jq / apt install jq)

input=$(cat)

MODEL=$(echo "$input" | jq -r '.model.display_name')
DIR=$(echo "$input" | jq -r '.workspace.current_dir')
PCT=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)

echo "[$MODEL] ${DIR##*/} | ${PCT}% context"
