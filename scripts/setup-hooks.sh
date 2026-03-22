#!/usr/bin/env bash
# setup-hooks.sh - Install Claude Code hooks and shell wrapper
#
# Creates symlinks from ~/.claude/hooks/ to this repo's hooks/
# and configures the claude wrapper function in ~/.zshrc.
#
# Usage: bash scripts/setup-hooks.sh [--dry-run] [--uninstall]
#
# Safe to run multiple times (idempotent).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCE_HOOKS_DIR="$REPO_DIR/hooks"
TARGET_HOOKS_DIR="$HOME/.claude/hooks"
ZSHRC="$HOME/.zshrc"
DRY_RUN=false
UNINSTALL=false

for arg in "$@"; do
    case "$arg" in
        --dry-run) DRY_RUN=true ;;
        --uninstall) UNINSTALL=true ;;
        --help|-h)
            echo "Usage: bash scripts/setup-hooks.sh [--dry-run] [--uninstall]"
            echo ""
            echo "Options:"
            echo "  --dry-run    Show what would be done without making changes"
            echo "  --uninstall  Remove installed symlinks and .zshrc wrapper"
            exit 0
            ;;
        *)
            echo "Unknown option: $arg"
            exit 1
            ;;
    esac
done

installed=0
skipped=0
failed=0

log_action() { echo "  $1"; }
log_skip()   { echo "  [skip] $1"; }
log_dry()    { echo "  [dry-run] would $1"; }

create_symlink() {
    local source_file="$1"
    local target_file="$2"
    local name
    name="$(basename "$source_file")"

    if [ ! -f "$source_file" ]; then
        log_action "WARN: source missing: $source_file"
        failed=$((failed + 1))
        return
    fi

    if [ -L "$target_file" ]; then
        local current_target
        current_target="$(readlink "$target_file")"
        if [ "$current_target" = "$source_file" ]; then
            log_skip "$name (already linked)"
            skipped=$((skipped + 1))
            return
        fi
        if $DRY_RUN; then
            log_dry "relink $name"
            installed=$((installed + 1))
            return
        fi
        ln -sf "$source_file" "$target_file"
        log_action "relinked $name"
        installed=$((installed + 1))
    elif [ -e "$target_file" ]; then
        log_skip "$name (regular file exists, not overwriting)"
        skipped=$((skipped + 1))
    else
        if $DRY_RUN; then
            log_dry "link $name"
            installed=$((installed + 1))
            return
        fi
        ln -s "$source_file" "$target_file"
        log_action "linked $name"
        installed=$((installed + 1))
    fi
}

remove_symlink() {
    local target_file="$1"
    local name
    name="$(basename "$target_file")"

    if [ -L "$target_file" ]; then
        local current_target
        current_target="$(readlink "$target_file")"
        if echo "$current_target" | grep -q "claude-code/hooks"; then
            if $DRY_RUN; then
                log_dry "remove $name"
                installed=$((installed + 1))
                return
            fi
            rm "$target_file"
            log_action "removed $name"
            installed=$((installed + 1))
        else
            log_skip "$name (not managed by claude-code)"
            skipped=$((skipped + 1))
        fi
    fi
}

# --- Uninstall mode ---
if $UNINSTALL; then
    echo "Removing Claude Code hooks..."

    if [ -d "$TARGET_HOOKS_DIR" ]; then
        for target_file in "$TARGET_HOOKS_DIR"/*; do
            [ -e "$target_file" ] || [ -L "$target_file" ] || continue
            remove_symlink "$target_file"
        done
    fi

    if [ -f "$ZSHRC" ] && grep -q "Code/claude-code/hooks/claude-wrapper.sh" "$ZSHRC"; then
        if $DRY_RUN; then
            log_dry "remove claude-wrapper.sh from .zshrc"
        else
            sed -i '' '/# >>> claude wrapper.*claude-code/,/# <<< claude wrapper/d' "$ZSHRC"
            log_action "removed claude-wrapper.sh from .zshrc"
        fi
    fi

    echo ""
    echo "Done. Removed $installed, skipped $skipped."
    exit 0
fi

# --- Install mode ---
echo "Installing Claude Code hooks..."
echo "  Source: $SOURCE_HOOKS_DIR"
echo "  Target: $TARGET_HOOKS_DIR"
echo ""

if [ ! -d "$SOURCE_HOOKS_DIR" ]; then
    echo "ERROR: Source hooks directory not found: $SOURCE_HOOKS_DIR"
    exit 1
fi

if [ ! -d "$TARGET_HOOKS_DIR" ]; then
    if $DRY_RUN; then
        log_dry "create $TARGET_HOOKS_DIR"
    else
        mkdir -p "$TARGET_HOOKS_DIR"
        log_action "created $TARGET_HOOKS_DIR"
    fi
fi

echo "Linking hook files..."
for source_file in "$SOURCE_HOOKS_DIR"/*.sh "$SOURCE_HOOKS_DIR"/*.py; do
    [ -f "$source_file" ] || continue
    name="$(basename "$source_file")"
    create_symlink "$source_file" "$TARGET_HOOKS_DIR/$name"
done

echo ""
echo "Configuring shell wrapper..."
WRAPPER_LINE="source \"\$HOME/Code/claude-code/hooks/claude-wrapper.sh\""
WRAPPER_BLOCK_START="# >>> claude wrapper"
WRAPPER_BLOCK_END="# <<< claude wrapper"

if [ ! -f "$ZSHRC" ]; then
    if $DRY_RUN; then
        log_dry "create .zshrc with claude wrapper"
    else
        cat >> "$ZSHRC" <<EOF

$WRAPPER_BLOCK_START: iTerm2 tab title + color (managed in claude-code) >>>
$WRAPPER_LINE
$WRAPPER_BLOCK_END <<<
EOF
        log_action "created .zshrc with claude wrapper"
        installed=$((installed + 1))
    fi
elif grep -q "$WRAPPER_BLOCK_START" "$ZSHRC"; then
    if grep -q "Code/claude-code/hooks/claude-wrapper.sh" "$ZSHRC"; then
        log_skip ".zshrc wrapper already configured"
        skipped=$((skipped + 1))
    else
        if $DRY_RUN; then
            log_dry "update .zshrc wrapper path"
        else
            sed -i '' "/$WRAPPER_BLOCK_START/,/$WRAPPER_BLOCK_END/c\\
$WRAPPER_BLOCK_START: iTerm2 tab title + color (managed in claude-code) >>>\\
$WRAPPER_LINE\\
$WRAPPER_BLOCK_END <<<" "$ZSHRC"
            log_action "updated .zshrc wrapper path"
            installed=$((installed + 1))
        fi
    fi
else
    if $DRY_RUN; then
        log_dry "add claude wrapper to .zshrc"
    else
        cat >> "$ZSHRC" <<EOF

$WRAPPER_BLOCK_START: iTerm2 tab title + color (managed in claude-code) >>>
$WRAPPER_LINE
$WRAPPER_BLOCK_END <<<
EOF
        log_action "added claude wrapper to .zshrc"
        installed=$((installed + 1))
    fi
fi

echo ""
if $DRY_RUN; then
    echo "Dry run complete. Would install $installed, skip $skipped."
else
    echo "Done. Installed $installed, skipped $skipped, failed $failed."
fi

if [ "$failed" -gt 0 ]; then
    echo "WARNING: $failed hooks failed. Check the output above."
    exit 1
fi
