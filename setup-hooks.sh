#!/usr/bin/env bash
set -euo pipefail

# setup-hooks.sh -- Install Claude Code quality and security hooks
#
# Creates symlinks in ~/.claude/hooks/ and merges hook configuration
# into ~/.claude/settings.json without overwriting existing settings.
#
# Safe to run multiple times (idempotent).
# Backs up settings.json before any modification.
#
# Requirements: bash 4+, jq
# Usage: bash setup-hooks.sh [--dry-run] [--uninstall]

##################################
# Configuration
##################################
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOKS_SOURCE="$REPO_DIR/hooks"
HOOKS_TARGET="$HOME/.claude/hooks"
SETTINGS_FILE="$HOME/.claude/settings.json"
BACKUP_DIR="$HOME/.claude/backups"

# Python hook files to symlink (entry points + modules)
PYTHON_HOOKS=(
    check-complexity.py
    check-security.py
    check-commit-signing.py
    config.py
    suppression.py
    smell_types.py
    smell_python.py
    smell_javascript.py
    smell_checks.py
    smell_ruff.py
    security_checks.py
    security_secrets.py
    security_bandit.py
    security_trojan.py
)

# Shell scripts to symlink (non-hook utilities)
SHELL_SCRIPTS=(
    statusline.sh
)

# Hook configuration to merge into settings.json
read -r -d '' HOOKS_JSON << 'HOOKEOF' || true
{
    "PostToolUse": [
        {
            "matcher": "Write|Edit",
            "hooks": [
                {
                    "type": "command",
                    "command": "python3 $HOME/.claude/hooks/check-complexity.py"
                },
                {
                    "type": "command",
                    "command": "python3 $HOME/.claude/hooks/check-security.py"
                }
            ]
        }
    ],
    "PreToolUse": [
        {
            "matcher": "Bash",
            "hooks": [
                {
                    "type": "command",
                    "command": "python3 $HOME/.claude/hooks/check-commit-signing.py"
                }
            ]
        }
    ]
}
HOOKEOF

##################################
# Helpers
##################################
DRY_RUN=false
UNINSTALL=false

log_info()  { echo "  [INFO] $*"; }
log_ok()    { echo "  [OK]   $*"; }
log_skip()  { echo "  [SKIP] $*"; }
log_warn()  { echo "  [WARN] $*"; }
log_error() { echo "  [ERR]  $*" >&2; }

die() { log_error "$@"; exit 1; }

##################################
# Prerequisite Checks
##################################
check_prerequisites() {
    if ! command -v python3 &>/dev/null; then
        die "python3 is required but not found. Install Python 3.8+."
    fi

    local py_version
    py_version=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
    local py_major py_minor
    py_major=$(echo "$py_version" | cut -d. -f1)
    py_minor=$(echo "$py_version" | cut -d. -f2)
    if [[ "$py_major" -lt 3 ]] || { [[ "$py_major" -eq 3 ]] && [[ "$py_minor" -lt 8 ]]; }; then
        die "Python 3.8+ required (found $py_version). AST end_lineno needs 3.8+."
    fi

    if ! command -v jq &>/dev/null; then
        die "jq is required for settings.json merging. Install: brew install jq (macOS) or apt install jq (Linux)."
    fi

    if [[ ! -d "$HOOKS_SOURCE" ]]; then
        die "Hook source directory not found: $HOOKS_SOURCE"
    fi
}

##################################
# Symlink Management
##################################
create_symlinks() {
    echo ""
    echo "Creating symlinks in $HOOKS_TARGET ..."
    mkdir -p "$HOOKS_TARGET"

    local created=0 skipped=0
    for hook_file in "${PYTHON_HOOKS[@]}" "${SHELL_SCRIPTS[@]}"; do
        local source="$HOOKS_SOURCE/$hook_file"
        local target="$HOOKS_TARGET/$hook_file"

        if [[ ! -f "$source" ]]; then
            log_warn "Source file not found, skipping: $source"
            continue
        fi

        if [[ -L "$target" ]]; then
            local existing_target
            existing_target=$(readlink "$target")
            if [[ "$existing_target" == "$source" ]]; then
                log_skip "$hook_file (already linked)"
                ((skipped++))
                continue
            fi
            log_warn "$hook_file points to $existing_target -- relinking to $source"
        elif [[ -f "$target" ]]; then
            local backup="$target.pre-setup.bak"
            log_warn "$hook_file exists as regular file -- backing up to $backup"
            if [[ "$DRY_RUN" == false ]]; then
                cp "$target" "$backup"
            fi
        fi

        if [[ "$DRY_RUN" == false ]]; then
            ln -sf "$source" "$target"
        fi
        log_ok "$hook_file -> $source"
        ((created++))
    done

    echo "  Symlinks: $created created, $skipped already current"
}

remove_symlinks() {
    echo ""
    echo "Removing symlinks from $HOOKS_TARGET ..."

    local removed=0
    for hook_file in "${PYTHON_HOOKS[@]}" "${SHELL_SCRIPTS[@]}"; do
        local target="$HOOKS_TARGET/$hook_file"
        if [[ -L "$target" ]]; then
            local link_target
            link_target=$(readlink "$target")
            if [[ "$link_target" == "$HOOKS_SOURCE/$hook_file" ]]; then
                if [[ "$DRY_RUN" == false ]]; then
                    rm "$target"
                fi
                log_ok "Removed $hook_file"
                ((removed++))
            else
                log_skip "$hook_file (points elsewhere: $link_target)"
            fi
        fi
    done

    echo "  Removed: $removed symlinks"
}

##################################
# Settings Merge
##################################
backup_settings() {
    if [[ ! -f "$SETTINGS_FILE" ]]; then
        return
    fi
    mkdir -p "$BACKUP_DIR"
    local timestamp
    timestamp=$(date +%Y%m%d-%H%M%S)
    local backup="$BACKUP_DIR/settings.json.$timestamp.bak"
    cp "$SETTINGS_FILE" "$backup"
    log_ok "Backed up settings to $backup"
}

merge_hooks_into_settings() {
    echo ""
    echo "Merging hook configuration into $SETTINGS_FILE ..."

    # Create settings file if it doesn't exist
    if [[ ! -f "$SETTINGS_FILE" ]]; then
        mkdir -p "$(dirname "$SETTINGS_FILE")"
        echo '{}' > "$SETTINGS_FILE"
        log_info "Created new settings.json"
    fi

    # Validate existing JSON
    if ! jq empty "$SETTINGS_FILE" 2>/dev/null; then
        die "Existing settings.json is not valid JSON. Fix it manually before running setup."
    fi

    backup_settings

    # Merge strategy: append our hook entries to existing arrays,
    # skipping any that already reference our hook commands.
    # Also sets statusLine config if not already present.
    local merged
    merged=$(jq --argjson new_hooks "$HOOKS_JSON" '
        # Initialize .hooks if missing
        .hooks //= {} |

        # For each lifecycle event in the new hooks config
        reduce ($new_hooks | keys[]) as $event (
            .;
            # Initialize the array if missing
            .hooks[$event] //= [] |

            # Collect commands already present
            (.hooks[$event] | [.[].hooks[]?.command] ) as $existing_cmds |

            # For each new hook entry, append if its commands are not already present
            reduce ($new_hooks[$event] | .[]) as $entry (
                .;
                if ([$entry.hooks[].command] | all(. as $c | $existing_cmds | index($c) != null))
                then .
                else .hooks[$event] += [$entry]
                end
            )
        ) |

        # Add statusLine if not already configured
        if .statusLine == null then
            .statusLine = {"type": "command", "command": "~/.claude/hooks/statusline.sh"}
        else .
        end
    ' "$SETTINGS_FILE")

    if [[ "$DRY_RUN" == true ]]; then
        echo "  Would write:"
        echo "$merged" | jq '.hooks'
    else
        echo "$merged" | jq '.' > "$SETTINGS_FILE"
        log_ok "Hook configuration merged successfully"
    fi
}

remove_hooks_from_settings() {
    echo ""
    echo "Removing hook configuration from $SETTINGS_FILE ..."

    if [[ ! -f "$SETTINGS_FILE" ]]; then
        log_skip "No settings.json found"
        return
    fi

    backup_settings

    # Remove entries that reference our hook commands and statusLine config
    local cleaned
    cleaned=$(jq '
        .hooks.PostToolUse //= [] |
        .hooks.PreToolUse //= [] |
        .hooks.PostToolUse = [
            .hooks.PostToolUse[] |
            select(.hooks | map(.command) | any(contains("check-complexity.py") or contains("check-security.py")) | not)
        ] |
        .hooks.PreToolUse = [
            .hooks.PreToolUse[] |
            select(.hooks | map(.command) | any(contains("check-commit-signing.py")) | not)
        ] |
        if .statusLine.command == "~/.claude/hooks/statusline.sh" then
            del(.statusLine)
        else .
        end
    ' "$SETTINGS_FILE")

    if [[ "$DRY_RUN" == true ]]; then
        echo "  Would write:"
        echo "$cleaned" | jq '.hooks'
    else
        echo "$cleaned" | jq '.' > "$SETTINGS_FILE"
        log_ok "Hook configuration removed"
    fi
}

##################################
# Verification
##################################
verify_installation() {
    echo ""
    echo "Verifying installation ..."

    local errors=0

    # Check symlinks resolve
    for entry_point in check-complexity.py check-security.py check-commit-signing.py; do
        local target="$HOOKS_TARGET/$entry_point"
        if [[ ! -L "$target" ]] || [[ ! -f "$target" ]]; then
            log_error "Missing or broken symlink: $target"
            ((errors++))
        fi
    done

    # Check Python can import the modules
    if ! python3 -c "
import sys, os
sys.path.insert(0, '$HOOKS_TARGET')
from smell_types import MAX_COMPLEXITY
from config import DEFAULT_CONFIG
print(f'  Thresholds: complexity={MAX_COMPLEXITY}, lines={DEFAULT_CONFIG.max_function_lines}, nesting={DEFAULT_CONFIG.max_nesting_depth}, params={DEFAULT_CONFIG.max_parameters}')
" 2>/dev/null; then
        log_error "Python module import failed"
        ((errors++))
    fi

    # Check settings.json has hooks configured
    if [[ -f "$SETTINGS_FILE" ]]; then
        local post_count pre_count
        post_count=$(jq '.hooks.PostToolUse | length' "$SETTINGS_FILE" 2>/dev/null || echo 0)
        pre_count=$(jq '.hooks.PreToolUse | length' "$SETTINGS_FILE" 2>/dev/null || echo 0)
        log_info "Settings: $post_count PostToolUse entries, $pre_count PreToolUse entries"
    fi

    # Check optional dependencies
    if python3 -c "import lizard" 2>/dev/null; then
        log_ok "Lizard available (Go/Java/Rust/C analysis enabled)"
    else
        log_info "Lizard not installed. Install for multi-language support: pip install lizard"
    fi

    if command -v ruff &>/dev/null; then
        log_ok "Ruff available (auto-fix + lint enabled)"
    else
        log_info "Ruff not installed. Install for Python auto-formatting: pip install ruff"
    fi

    if [[ $errors -gt 0 ]]; then
        die "Verification failed with $errors error(s)"
    fi

    log_ok "All checks passed"
}

##################################
# Usage
##################################
print_usage() {
    cat <<'USAGE'
setup-hooks.sh -- Install Claude Code quality and security hooks

Usage:
    bash setup-hooks.sh              Install hooks (symlinks + settings merge)
    bash setup-hooks.sh --dry-run    Show what would be done without changes
    bash setup-hooks.sh --uninstall  Remove hooks and clean settings

What it does:
    1. Creates symlinks in ~/.claude/hooks/ pointing to this repo's hook files
    2. Merges PostToolUse and PreToolUse hook config into ~/.claude/settings.json
    3. Configures the status line (model name, directory, context usage)
    4. Backs up settings.json before any modification
    5. Verifies the installation works

Hooks installed:
    PostToolUse (fires after every Write/Edit):
      - check-complexity.py  Blocks on code smells: complexity, function length,
                             nesting depth, parameter count, file length, duplicates
      - check-security.py    Blocks on security issues: hardcoded secrets, unsafe
                             patterns (eval, shell=True, pickle), trojan source

    PreToolUse (fires before Bash commands):
      - check-commit-signing.py  Blocks unsigned git commits with setup guidance

Safe to run multiple times. Existing settings are preserved; hooks are appended.

Optional dependencies:
    pip install lizard    Multi-language analysis (Go, Java, Rust, C/C++)
    pip install ruff      Python auto-formatting and lint integration
USAGE
}

##################################
# Main
##################################
main() {
    for arg in "$@"; do
        case "$arg" in
            --dry-run)   DRY_RUN=true ;;
            --uninstall) UNINSTALL=true ;;
            --help|-h)   print_usage; exit 0 ;;
            *)           die "Unknown argument: $arg" ;;
        esac
    done

    echo "========================================"
    echo " Claude Code Hooks Setup"
    echo "========================================"

    if [[ "$DRY_RUN" == true ]]; then
        echo " Mode: DRY RUN (no changes will be made)"
    fi

    if [[ "$UNINSTALL" == true ]]; then
        echo " Mode: UNINSTALL"
        echo ""
        check_prerequisites
        remove_symlinks
        remove_hooks_from_settings
        echo ""
        echo "Uninstall complete. Backup in $BACKUP_DIR"
        exit 0
    fi

    check_prerequisites
    create_symlinks
    merge_hooks_into_settings

    if [[ "$DRY_RUN" == false ]]; then
        verify_installation
    fi

    echo ""
    echo "========================================"
    echo " Setup complete"
    echo "========================================"
    echo ""
    echo " Hooks are now active. On your next Claude Code session:"
    echo "   - Every Write/Edit will be checked for code smells and security issues"
    echo "   - Git commits will require signing configuration"
    echo "   - Status line shows model, directory, and context usage"
    echo ""
    echo " Customize thresholds by creating .smellrc.json in your project root:"
    echo '   {"thresholds": {"max_function_lines": 30, "max_complexity": 15}}'
    echo ""
    echo " Suppress individual violations with inline comments:"
    echo '   # smell: ignore[complexity,long_function]'
    echo '   # security: ignore[B101]'
    echo ""
}

main "$@"
