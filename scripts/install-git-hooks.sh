#!/usr/bin/env bash
# install-git-hooks.sh — install chained git hooks for the tiered scanner spine.
#
# Installs thin shims at .git/hooks/<hook> that run this repo's tracked logic
# (hooks/git/<hook>) and then CHAIN any pre-existing hook (e.g. the beads
# pre-commit), which is preserved as .git/hooks/<hook>.chained. Git's default
# hooks directory is retained — no core.hooksPath override — so existing hooks
# keep working untouched.
#
# Usage: bash scripts/install-git-hooks.sh [--uninstall]
# Idempotent and safe to run multiple times.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TEMPLATE="$REPO_DIR/hooks/git/shim.template"
MARKER="claude-code-managed chained hook"
UNINSTALL=false
[ "${1:-}" = "--uninstall" ] && UNINSTALL=true

# Resolve the absolute hooks directory for this repo (worktree-safe).
GIT_DIR="$(git -C "$REPO_DIR" rev-parse --git-dir 2>/dev/null || true)"
if [ -z "$GIT_DIR" ]; then
    echo "Not a git repository; skipping git-hook install."
    exit 0
fi
case "$GIT_DIR" in
    /*) ;;
    *) GIT_DIR="$REPO_DIR/$GIT_DIR" ;;
esac
HOOKS_DIR="$GIT_DIR/hooks"
mkdir -p "$HOOKS_DIR"

is_managed() { grep -q "$MARKER" "$1" 2>/dev/null; }

uninstall_one() {
    local hook="$1" target="$HOOKS_DIR/$1"
    if [ -f "$target" ] && is_managed "$target"; then
        rm -f "$target"
        if [ -f "$target.chained" ]; then
            mv "$target.chained" "$target"
            echo "  removed $hook shim (restored chained hook)"
        else
            echo "  removed $hook shim"
        fi
    fi
}

install_one() {
    local hook="$1" target="$HOOKS_DIR/$1"
    # Preserve a pre-existing, non-managed hook by chaining it.
    if [ -f "$target" ] && ! is_managed "$target"; then
        mv "$target" "$target.chained"
        chmod +x "$target.chained" 2>/dev/null || true
        echo "  preserved existing $hook -> $hook.chained"
    fi
    sed "s/HOOKNAME/$hook/g" "$TEMPLATE" > "$target"
    chmod +x "$target"
    echo "  installed $hook (chained)"
}

echo "Installing chained git hooks into $HOOKS_DIR"
for hook in pre-commit pre-push; do
    [ -f "$REPO_DIR/hooks/git/$hook" ] || continue
    if $UNINSTALL; then
        uninstall_one "$hook"
    else
        install_one "$hook"
    fi
done
echo "Done."
