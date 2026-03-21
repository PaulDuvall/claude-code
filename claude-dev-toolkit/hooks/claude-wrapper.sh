#!/bin/bash
# claude-wrapper.sh - Shell wrapper for claude that manages iTerm2 tab colors
#
# Source this file in ~/.zshrc:
#   source ~/Code/claude-code/hooks/claude-wrapper.sh
#
# Sets gray tab color on launch, red on non-zero exit, then resets.
# Mid-session colors (blue=working, green=done) are handled by Claude Code hooks.
# See ~/.claude/settings.json and tab-color.sh

CCDK_HOOKS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"

claude() {
  # Set initial tab color to gray (idle, no prompt running yet)
  "$CCDK_HOOKS_DIR/tab-color.sh" gray < /dev/null

  # Pass all args through to the real claude binary
  command claude "$@"
  local exit_code=$?

  if [ $exit_code -ne 0 ]; then
    "$CCDK_HOOKS_DIR/tab-color.sh" red < /dev/null
  fi

  # Reset tab color to default
  "$CCDK_HOOKS_DIR/tab-color.sh" reset < /dev/null

  return $exit_code
}
