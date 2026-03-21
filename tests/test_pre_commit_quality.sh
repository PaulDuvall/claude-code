#!/usr/bin/env bash
set -uo pipefail

# Test Suite: hooks/pre-commit-quality.sh
#
# Purpose: Functional tests for pre-commit quality check hook
# Tests: Hook existence, syntax, git context handling, staged changes behavior

##################################
# Test Configuration
##################################
TEST_NAME="hooks/pre-commit-quality.sh Test Suite"
TEST_DIR="/tmp/test-pre-commit-quality-$$"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HOOK_PATH="$SCRIPT_DIR/hooks/pre-commit-quality.sh"

# Colors for test output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

##################################
# Bash 4+ Guard
##################################
has_bash4() {
    [[ "${BASH_VERSINFO[0]}" -ge 4 ]]
}

requires_bash4() {
    if ! has_bash4; then
        echo -n "(skipped: bash < 4) "
        return 0
    fi
    return 1
}

##################################
# Test Setup
##################################
setup_test_environment() {
    echo "Setting up test environment..."
    mkdir -p "$TEST_DIR"
    export HOME="$TEST_DIR"
    mkdir -p "$TEST_DIR/.claude/logs"
}

cleanup_test_environment() {
    echo "Cleaning up test environment..."
    rm -rf "$TEST_DIR"
}

##################################
# Test Utility Functions
##################################
run_test() {
    local test_name="$1"
    local test_function="$2"

    echo -n "Running: $test_name... "
    ((TESTS_RUN++))

    if $test_function; then
        echo -e "${GREEN}PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}FAILED${NC}"
        ((TESTS_FAILED++))
    fi
}

##################################
# Hook Existence Tests
##################################
test_hook_exists() {
    [[ -f "$HOOK_PATH" ]] && [[ -r "$HOOK_PATH" ]]
}

test_hook_syntax_valid() {
    bash -n "$HOOK_PATH" 2>/dev/null
}

test_hook_is_parseable() {
    bash -n "$HOOK_PATH"
}

##################################
# Non-Git Context Tests
##################################
test_exits_zero_outside_git_repo() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        local non_git_dir="$TEST_DIR/not-a-repo"
        mkdir -p "$non_git_dir"
        cd "$non_git_dir"
        bash "$HOOK_PATH" >/dev/null 2>&1
    )
}

##################################
# Git Context Tests
##################################
test_exits_zero_no_staged_changes() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        local git_dir="$TEST_DIR/empty-repo"
        mkdir -p "$git_dir"
        cd "$git_dir"
        git init >/dev/null 2>&1
        git config user.email "test@test.com" 2>/dev/null
        git config user.name "Test" 2>/dev/null
        # Create initial commit so repo is valid
        touch .gitkeep
        git add .gitkeep >/dev/null 2>&1
        git commit -m "init" >/dev/null 2>&1
        # Now there are no staged changes
        bash "$HOOK_PATH" >/dev/null 2>&1
    )
}

test_produces_output_with_staged_changes() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        local git_dir="$TEST_DIR/staged-repo"
        mkdir -p "$git_dir"
        cd "$git_dir"
        git init >/dev/null 2>&1
        git config user.email "test@test.com" 2>/dev/null
        git config user.name "Test" 2>/dev/null
        # Create initial commit
        touch .gitkeep
        git add .gitkeep >/dev/null 2>&1
        git commit -m "init" >/dev/null 2>&1
        # Stage a new file
        echo "some content" > testfile.txt
        git add testfile.txt >/dev/null 2>&1
        local output
        output=$(bash "$HOOK_PATH" 2>&1)
        [[ -n "$output" ]]
    )
}

test_output_contains_quality_check() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        local git_dir="$TEST_DIR/quality-repo"
        mkdir -p "$git_dir"
        cd "$git_dir"
        git init >/dev/null 2>&1
        git config user.email "test@test.com" 2>/dev/null
        git config user.name "Test" 2>/dev/null
        touch .gitkeep
        git add .gitkeep >/dev/null 2>&1
        git commit -m "init" >/dev/null 2>&1
        echo "code here" > sample.py
        git add sample.py >/dev/null 2>&1
        local output
        output=$(bash "$HOOK_PATH" 2>&1)
        [[ "$output" == *"QUALITY CHECK"* ]]
    )
}

test_output_lists_staged_files() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        local git_dir="$TEST_DIR/list-repo"
        mkdir -p "$git_dir"
        cd "$git_dir"
        git init >/dev/null 2>&1
        git config user.email "test@test.com" 2>/dev/null
        git config user.name "Test" 2>/dev/null
        touch .gitkeep
        git add .gitkeep >/dev/null 2>&1
        git commit -m "init" >/dev/null 2>&1
        echo "content" > myfile.js
        git add myfile.js >/dev/null 2>&1
        local output
        output=$(bash "$HOOK_PATH" 2>&1)
        [[ "$output" == *"myfile.js"* ]]
    )
}

##################################
# Exit Code Tests
##################################
test_exits_zero_with_staged_changes() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        local git_dir="$TEST_DIR/exit-repo"
        mkdir -p "$git_dir"
        cd "$git_dir"
        git init >/dev/null 2>&1
        git config user.email "test@test.com" 2>/dev/null
        git config user.name "Test" 2>/dev/null
        touch .gitkeep
        git add .gitkeep >/dev/null 2>&1
        git commit -m "init" >/dev/null 2>&1
        echo "valid content" > clean.txt
        git add clean.txt >/dev/null 2>&1
        bash "$HOOK_PATH" >/dev/null 2>&1
    )
}

test_no_output_without_staged_changes() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        local git_dir="$TEST_DIR/silent-repo"
        mkdir -p "$git_dir"
        cd "$git_dir"
        git init >/dev/null 2>&1
        git config user.email "test@test.com" 2>/dev/null
        git config user.name "Test" 2>/dev/null
        touch .gitkeep
        git add .gitkeep >/dev/null 2>&1
        git commit -m "init" >/dev/null 2>&1
        # No staged changes - stdout should be empty (logs go to stderr/file)
        local output
        output=$(bash "$HOOK_PATH" 2>/dev/null)
        [[ -z "$output" ]]
    )
}

##################################
# Missing Git Tests
##################################
test_handles_missing_git_gracefully() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        local no_git_dir="$TEST_DIR/no-git-dir"
        mkdir -p "$no_git_dir"
        cd "$no_git_dir"
        # Run from a non-git directory; hook should exit 0
        bash "$HOOK_PATH" >/dev/null 2>&1
    )
}

##################################
# Main Test Execution
##################################
main() {
    echo "========================================="
    echo "$TEST_NAME"
    echo "========================================="
    echo ""

    if ! has_bash4; then
        echo "NOTE: bash 4+ required for arrays (declare -A)."
        echo "Hook execution tests will be skipped on bash 3.x."
        echo ""
    fi

    setup_test_environment

    echo "Hook Existence Tests:"
    run_test "Hook file exists" test_hook_exists
    run_test "Hook syntax is valid" test_hook_syntax_valid
    run_test "Hook is parseable" test_hook_is_parseable

    echo ""
    echo "Non-Git Context Tests:"
    run_test "Exits 0 outside git repository" test_exits_zero_outside_git_repo
    run_test "Handles missing git gracefully" test_handles_missing_git_gracefully

    echo ""
    echo "Git Context Tests:"
    run_test "Exits 0 with no staged changes" test_exits_zero_no_staged_changes
    run_test "Produces output with staged changes" test_produces_output_with_staged_changes
    run_test "Output contains QUALITY CHECK" test_output_contains_quality_check
    run_test "Output lists staged file names" test_output_lists_staged_files

    echo ""
    echo "Exit Code Tests:"
    run_test "Exits 0 with staged changes" test_exits_zero_with_staged_changes
    run_test "No stdout output without staged changes" test_no_output_without_staged_changes

    cleanup_test_environment

    echo ""
    echo "========================================="
    echo "Test Summary"
    echo "========================================="
    echo "Tests Run: $TESTS_RUN"
    echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo -e "\n${GREEN}All tests passed!${NC}"
        exit 0
    else
        echo -e "\n${RED}Some tests failed!${NC}"
        exit 1
    fi
}

trap cleanup_test_environment EXIT INT TERM

main "$@"
