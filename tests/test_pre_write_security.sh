#!/usr/bin/env bash
set -uo pipefail

# Test Suite: hooks/pre-write-security.sh
#
# Purpose: Functional tests for pre-write security check hook
# Tests: Hook existence, syntax, tool filtering, security check output

##################################
# Test Configuration
##################################
TEST_NAME="hooks/pre-write-security.sh Test Suite"
TEST_DIR="/tmp/test-pre-write-security-$$"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HOOK_PATH="$SCRIPT_DIR/hooks/pre-write-security.sh"

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
# Non-Security Tool Tests (should exit 0 silently)
##################################
test_exits_zero_for_bash_tool() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Bash"
        export CLAUDE_FILE=""
        bash "$HOOK_PATH" >/dev/null 2>&1
    )
}

test_exits_zero_for_read_tool() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Read"
        export CLAUDE_FILE=""
        bash "$HOOK_PATH" >/dev/null 2>&1
    )
}

test_exits_zero_for_glob_tool() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Glob"
        export CLAUDE_FILE=""
        bash "$HOOK_PATH" >/dev/null 2>&1
    )
}

test_exits_zero_for_grep_tool() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Grep"
        export CLAUDE_FILE=""
        bash "$HOOK_PATH" >/dev/null 2>&1
    )
}

##################################
# Security-Relevant Tool Tests (should produce output)
##################################
test_produces_output_for_edit_tool() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Edit"
        export CLAUDE_FILE="$TEST_DIR/somefile.py"
        echo "content" > "$TEST_DIR/somefile.py"
        local output
        output=$(bash "$HOOK_PATH" 2>&1)
        [[ -n "$output" ]]
    )
}

test_produces_output_for_write_tool() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Write"
        export CLAUDE_FILE="$TEST_DIR/newfile.js"
        local output
        output=$(bash "$HOOK_PATH" 2>&1)
        [[ -n "$output" ]]
    )
}

test_produces_output_for_multiedit_tool() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="MultiEdit"
        export CLAUDE_FILE="$TEST_DIR/edited.rb"
        local output
        output=$(bash "$HOOK_PATH" 2>&1)
        [[ -n "$output" ]]
    )
}

##################################
# Output Content Tests
##################################
test_output_contains_security_check() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Edit"
        export CLAUDE_FILE="$TEST_DIR/target.py"
        echo "code" > "$TEST_DIR/target.py"
        local output
        output=$(bash "$HOOK_PATH" 2>&1)
        [[ "$output" == *"SECURITY CHECK"* ]]
    )
}

test_output_mentions_tool_name() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Write"
        export CLAUDE_FILE="$TEST_DIR/file.txt"
        local output
        output=$(bash "$HOOK_PATH" 2>&1)
        [[ "$output" == *"Write"* ]]
    )
}

test_output_mentions_file_path() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Edit"
        export CLAUDE_FILE="$TEST_DIR/important.cfg"
        echo "config" > "$TEST_DIR/important.cfg"
        local output
        output=$(bash "$HOOK_PATH" 2>&1)
        [[ "$output" == *"important.cfg"* ]]
    )
}

##################################
# Exit Code Tests
##################################
test_exits_zero_for_edit() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Edit"
        export CLAUDE_FILE="$TEST_DIR/file.txt"
        echo "data" > "$TEST_DIR/file.txt"
        bash "$HOOK_PATH" >/dev/null 2>&1
    )
}

test_exits_zero_for_write() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Write"
        export CLAUDE_FILE="$TEST_DIR/file.txt"
        bash "$HOOK_PATH" >/dev/null 2>&1
    )
}

test_exits_zero_for_non_security_tool() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Bash"
        export CLAUDE_FILE=""
        bash "$HOOK_PATH" >/dev/null 2>&1
    )
}

##################################
# Edge Case Tests
##################################
test_handles_unset_tool_env() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        unset CLAUDE_TOOL
        unset CLAUDE_FILE
        bash "$HOOK_PATH" >/dev/null 2>&1
    )
}

test_handles_empty_file_path() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Edit"
        export CLAUDE_FILE=""
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
    echo "Non-Security Tool Tests:"
    run_test "Exits 0 for Bash tool" test_exits_zero_for_bash_tool
    run_test "Exits 0 for Read tool" test_exits_zero_for_read_tool
    run_test "Exits 0 for Glob tool" test_exits_zero_for_glob_tool
    run_test "Exits 0 for Grep tool" test_exits_zero_for_grep_tool

    echo ""
    echo "Security-Relevant Tool Tests:"
    run_test "Produces output for Edit tool" test_produces_output_for_edit_tool
    run_test "Produces output for Write tool" test_produces_output_for_write_tool
    run_test "Produces output for MultiEdit tool" test_produces_output_for_multiedit_tool

    echo ""
    echo "Output Content Tests:"
    run_test "Output contains SECURITY CHECK" test_output_contains_security_check
    run_test "Output mentions tool name" test_output_mentions_tool_name
    run_test "Output mentions file path" test_output_mentions_file_path

    echo ""
    echo "Exit Code Tests:"
    run_test "Exits 0 for Edit tool" test_exits_zero_for_edit
    run_test "Exits 0 for Write tool" test_exits_zero_for_write
    run_test "Exits 0 for non-security tool" test_exits_zero_for_non_security_tool

    echo ""
    echo "Edge Case Tests:"
    run_test "Handles unset CLAUDE_TOOL" test_handles_unset_tool_env
    run_test "Handles empty CLAUDE_FILE" test_handles_empty_file_path

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
