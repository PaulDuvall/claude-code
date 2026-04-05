#!/usr/bin/env bash
set -euo pipefail

# Sync source-of-truth files from repo root to claude-dev-toolkit/
# Run before publishing npm package to ensure no drift.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CDT_DIR="$REPO_ROOT/claude-dev-toolkit"

sync_dir() {
    local src="$1"
    local dst="$2"
    local pattern="${3:-*}"

    mkdir -p "$dst"
    # Remove old files in destination, then copy fresh
    find "$dst" -maxdepth 1 -name "$pattern" -type f -delete
    find "$src" -maxdepth 1 -name "$pattern" -type f \
        -exec cp {} "$dst/" \;
}

echo "Syncing hooks (shell)..."
sync_dir "$REPO_ROOT/hooks" "$CDT_DIR/hooks" "*.sh"

echo "Syncing hooks (python)..."
sync_dir "$REPO_ROOT/hooks" "$CDT_DIR/hooks" "*.py"

echo "Syncing hooks (config)..."
for f in "$REPO_ROOT/hooks/"*.json "$REPO_ROOT/hooks/.smellrc.example.json"; do
    [ -f "$f" ] && cp "$f" "$CDT_DIR/hooks/"
done

echo "Syncing hooks/lib..."
sync_dir "$REPO_ROOT/hooks/lib" "$CDT_DIR/hooks/lib" "*.sh"

echo "Syncing subagents..."
sync_dir "$REPO_ROOT/subagents" "$CDT_DIR/subagents" "*.md"
# Remove non-subagent files (TEMPLATE.md and README.md are references, not subagents)
rm -f "$CDT_DIR/subagents/TEMPLATE.md" "$CDT_DIR/subagents/README.md"

echo "Syncing commands/active..."
mkdir -p "$CDT_DIR/commands/active"
sync_dir "$REPO_ROOT/slash-commands/active" \
    "$CDT_DIR/commands/active" "*.md"

echo "Syncing commands/experiments..."
mkdir -p "$CDT_DIR/commands/experiments"
sync_dir "$REPO_ROOT/slash-commands/experiments" \
    "$CDT_DIR/commands/experiments" "*.md"

echo "Syncing templates..."
sync_dir "$REPO_ROOT/templates" "$CDT_DIR/templates" "*.json"
sync_dir "$REPO_ROOT/templates" "$CDT_DIR/templates" "*.md"
sync_dir "$REPO_ROOT/templates" "$CDT_DIR/templates" "*.yaml"

# Copy hooks README
if [[ -f "$REPO_ROOT/hooks/README.md" ]]; then
    cp "$REPO_ROOT/hooks/README.md" "$CDT_DIR/hooks/README.md"
fi

echo "Sync complete. Files are ready for npm publish."
