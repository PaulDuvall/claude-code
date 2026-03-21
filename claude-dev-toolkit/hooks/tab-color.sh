#!/bin/bash
# tab-color.sh - Sets iTerm2 tab color for Claude Code hook events
# Usage: tab-color.sh [gray|blue|green|red|reset]
#
# gray  = session idle (no prompt running)
# blue  = prompt in progress (working)
# green = prompt complete (done) -- decays to gray after 3 minutes
# red   = error
# reset = restore default tab color
#
# Tab TITLE (directory name) is set by claude-wrapper.sh at launch.
# This script only manages COLOR -- Claude Code overrides mid-session title changes.

DECAY_SECONDS=180

# Consume stdin (hook protocol sends JSON on stdin)
cat > /dev/null

# Per-session state file to prevent decay timer from overwriting blue
get_state_file() {
    local tty_id
    tty_id=$(tty < /dev/tty 2>/dev/null | tr '/' '_' || echo "unknown")
    echo "/tmp/claude-tab-state${tty_id}"
}

set_tab_color() {
    printf "\033]6;1;bg;red;brightness;%s\a" "$1" > /dev/tty 2>/dev/null
    printf "\033]6;1;bg;green;brightness;%s\a" "$2" > /dev/tty 2>/dev/null
    printf "\033]6;1;bg;blue;brightness;%s\a" "$3" > /dev/tty 2>/dev/null
}

STATE_FILE=$(get_state_file)

case "${1:-blue}" in
    gray)
        echo "gray" > "$STATE_FILE" 2>/dev/null
        set_tab_color 130 130 130
        ;;
    blue)
        echo "blue" > "$STATE_FILE" 2>/dev/null
        set_tab_color 20 80 255
        ;;
    green)
        echo "green" > "$STATE_FILE" 2>/dev/null
        set_tab_color 0 255 0
        # Ring terminal bell -- triggers iTerm2 notification for background tabs
        printf "\a" > /dev/tty 2>/dev/null
        # Auto-decay to gray after 3 minutes (only if still green)
        # Fully detach: redirect all fds so Claude Code doesn't wait for child
        nohup bash -c "
            sleep $DECAY_SECONDS
            state_file='$STATE_FILE'
            if [[ -f \"\$state_file\" && \"\$(cat \"\$state_file\" 2>/dev/null)\" == 'green' ]]; then
                echo 'gray' > \"\$state_file\"
                printf '\033]6;1;bg;red;brightness;130\a' > /dev/tty 2>/dev/null
                printf '\033]6;1;bg;green;brightness;130\a' > /dev/tty 2>/dev/null
                printf '\033]6;1;bg;blue;brightness;130\a' > /dev/tty 2>/dev/null
            fi
        " </dev/null >/dev/null 2>&1 &
        ;;
    red)
        echo "red" > "$STATE_FILE" 2>/dev/null
        set_tab_color 220 0 0
        printf "\a" > /dev/tty 2>/dev/null
        ;;
    reset)
        rm -f "$STATE_FILE" 2>/dev/null
        printf "\033]6;1;bg;*;default\a" > /dev/tty 2>/dev/null
        ;;
esac
