#!/usr/bin/env bash
set -euo pipefail

# Claude Code Hook: Pre-Commit Test Runner
#
# Description: Auto-detects test framework and runs tests before commits
# Purpose: Prevent commits with failing tests by validating the full test suite
# Trigger: PreToolUse
# Blocking: Yes
# Tools: Bash
# Author: Claude Dev Toolkit
# Version: 1.0.0
# Category: security
#
# This hook validates code quality by running the project's test suite
# before allowing commit operations to proceed.

##################################
# Configuration
##################################
HOOK_NAME="pre-commit-test-runner"
LOG_FILE="$HOME/.claude/logs/pre-commit-test-runner.log"
source "$(dirname "$0")/lib/hook-helpers.sh"
ensure_log_setup "$LOG_FILE"
setup_hook_traps

##################################
# Commit Detection
##################################
is_commit_command() {
    local tool="${CLAUDE_TOOL:-}"
    local content="${CLAUDE_CONTENT:-}"

    if [[ "$tool" != "Bash" ]]; then
        return 1
    fi

    echo "$content" | grep -qE 'git\s+commit' || return 1
}

##################################
# Framework Detection
##################################
detect_framework() {
    if [[ -f "pytest.ini" ]] || { [[ -f "pyproject.toml" ]] && grep -q '\[tool.pytest' pyproject.toml 2>/dev/null; }; then
        echo "pytest"
    elif [[ -f "package.json" ]] && grep -q '"test"' package.json 2>/dev/null; then
        if grep -qE '"(jest|vitest)' package.json 2>/dev/null; then
            echo "jest"
        else
            echo "npm-test"
        fi
    elif [[ -f "go.mod" ]]; then
        echo "go-test"
    elif [[ -f "Cargo.toml" ]]; then
        echo "cargo-test"
    elif [[ -f "mix.exs" ]]; then
        echo "mix-test"
    else
        echo "none"
    fi
}

##################################
# Test Execution
##################################
run_tests() {
    local framework="$1"
    log "Running tests with framework: $framework"

    case "$framework" in
        pytest)     python -m pytest --tb=short 2>&1 ;;
        jest)       npx jest --ci 2>&1 ;;
        npm-test)   npm test 2>&1 ;;
        go-test)    go test ./... 2>&1 ;;
        cargo-test) cargo test 2>&1 ;;
        mix-test)   mix test 2>&1 ;;
        *)          echo "No test framework detected" ;;
    esac
}

##################################
# Main Hook Logic
##################################
main() {
    if ! is_commit_command; then
        log "Not a commit command, skipping"
        exit 0
    fi

    log "Commit detected, checking for test framework"
    local framework
    framework=$(detect_framework)

    if [[ "$framework" == "none" ]]; then
        log "No test framework detected, allowing commit"
        exit 0
    fi

    log "Detected framework: $framework"
    local output
    output=$(run_tests "$framework") || {
        local exit_code=$?
        echo "Test validation failed — commit blocked"
        echo "Framework: $framework"
        echo "$output" | tail -10
        log "Tests FAILED (exit $exit_code)"
        exit 1
    }

    log "Security check passed — all tests green"
    exit 0
}

##################################
# Execute
##################################
main "$@"
