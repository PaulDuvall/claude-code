#!/bin/bash
# claude-wrapper.sh - Shell wrapper for claude that manages iTerm2 tab colors
#
# Source this file in ~/.zshrc:
#   source ~/Code/claude-code/hooks/claude-wrapper.sh
#
# Sets gray tab color on launch, red on non-zero exit, then resets.
# Mid-session colors (blue=working, green=done) are handled by Claude Code hooks.
# See ~/.claude/settings.json and tab-color.sh

# Exported so child shells inherit it. Claude Code snapshots shell functions into
# the shells it runs tools in, but does not carry unexported variables — so this
# function ran there with an empty CCDK_HOOKS_DIR and printed
# "no such file or directory: /tab-color.sh" on every single claude invocation.
CCDK_HOOKS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
export CCDK_HOOKS_DIR

claude() {
  # Resolved inside the function, with a fallback, so a snapshot that restores
  # this definition without the variable still finds the script. Deliberately
  # not a helper function: the snapshot may not carry that either.
  local tab="${CCDK_HOOKS_DIR:-$HOME/Code/claude-code/hooks}/tab-color.sh"

  # Colouring the tab is decoration. If the script is missing — moved checkout,
  # lost variable — do nothing rather than fail loudly on a command run dozens
  # of times a day.
  [ -x "$tab" ] && "$tab" gray < /dev/null

  # Pass all args through to the real claude binary
  command claude "$@"
  local exit_code=$?

  if [ $exit_code -ne 0 ]; then
    [ -x "$tab" ] && "$tab" red < /dev/null
  fi

  [ -x "$tab" ] && "$tab" reset < /dev/null

  return $exit_code
}
