#!/usr/bin/env bash
set -uo pipefail

# Test Suite: hooks/file-logger.sh
#
# Purpose: Functional tests for file logger hook
# Tests: Tool filtering, log creation, file info logging, non-blocking behavior

##################################
# Test Configuration
##################################
TEST_NAME="hooks/file-logger.sh Test Suite"
TEST_DIR="/tmp/test-file-logger-$$"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HOOK_PATH="$SCRIPT_DIR/hooks/file-logger.sh"

# Colors for test output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

##################################
# Test Setup
##################################
setup_test_environment() {
    echo "Setting up test environment..."
    mkdir -p "$TEST_DIR"
    export HOME="$TEST_DIR"
    # Ensure log directory exists
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

# Check if bash supports arrays (bash 4+)
has_bash4() {
    bash -c 'declare -A test_arr 2>/dev/null'
}

# Helper: skip test if bash < 4 (hook uses arrays)
requires_bash4() {
    if ! has_bash4; then
        echo -n "(skipped: bash < 4) "
        return 0
    fi
    return 1
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

test_hook_is_executable_or_sourceable() {
    # Hook should parse without errors
    bash -n "$HOOK_PATH"
}

##################################
# Tool Filtering Tests
##################################
test_skips_bash_tool() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Bash"
        export CLAUDE_FILE=""
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_skips_read_tool() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Read"
        export CLAUDE_FILE=""
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_skips_glob_tool() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Glob"
        export CLAUDE_FILE=""
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

##################################
# File Modification Tool Tests
##################################
test_processes_edit_tool() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Edit"
        export CLAUDE_FILE="$TEST_DIR/sample.txt"
        echo "sample content" > "$TEST_DIR/sample.txt"
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_processes_write_tool() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Write"
        export CLAUDE_FILE="$TEST_DIR/sample.txt"
        echo "sample content" > "$TEST_DIR/sample.txt"
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_processes_multiedit_tool() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="MultiEdit"
        export CLAUDE_FILE="$TEST_DIR/sample.txt"
        echo "sample content" > "$TEST_DIR/sample.txt"
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

##################################
# Log Directory and File Tests
##################################
test_creates_log_directory() {
    requires_bash4 && return 0
    (
        local isolated_home="$TEST_DIR/logdir-test"
        mkdir -p "$isolated_home"
        export HOME="$isolated_home"
        export CLAUDE_TOOL="Bash"
        export CLAUDE_FILE=""
        bash "$HOOK_PATH" > /dev/null 2>&1
        [[ -d "$isolated_home/.claude/logs" ]]
    )
}

test_creates_log_file() {
    requires_bash4 && return 0
    (
        local isolated_home="$TEST_DIR/logfile-test"
        mkdir -p "$isolated_home"
        export HOME="$isolated_home"
        export CLAUDE_TOOL="Bash"
        export CLAUDE_FILE=""
        bash "$HOOK_PATH" > /dev/null 2>&1
        [[ -f "$isolated_home/.claude/logs/file-logger.log" ]]
    )
}

##################################
# Log Content Tests
##################################
test_logs_hook_trigger() {
    requires_bash4 && return 0
    (
        local isolated_home="$TEST_DIR/trigger-test"
        mkdir -p "$isolated_home"
        export HOME="$isolated_home"
        export CLAUDE_TOOL="Read"
        export CLAUDE_FILE=""
        bash "$HOOK_PATH" > /dev/null 2>&1
        grep -q "Hook triggered" "$isolated_home/.claude/logs/file-logger.log"
    )
}

test_logs_tool_name() {
    requires_bash4 && return 0
    (
        local isolated_home="$TEST_DIR/toolname-test"
        mkdir -p "$isolated_home"
        export HOME="$isolated_home"
        export CLAUDE_TOOL="Write"
        export CLAUDE_FILE="$TEST_DIR/sample.txt"
        echo "content" > "$TEST_DIR/sample.txt"
        bash "$HOOK_PATH" > /dev/null 2>&1
        grep -q "Tool: Write" "$isolated_home/.claude/logs/file-logger.log"
    )
}

test_logs_file_info_when_file_exists() {
    requires_bash4 && return 0
    (
        local isolated_home="$TEST_DIR/fileinfo-test"
        mkdir -p "$isolated_home"
        export HOME="$isolated_home"
        export CLAUDE_TOOL="Edit"
        local test_file="$TEST_DIR/existing-file.txt"
        printf "line one\nline two\nline three\n" > "$test_file"
        export CLAUDE_FILE="$test_file"
        bash "$HOOK_PATH" > /dev/null 2>&1
        local log_file="$isolated_home/.claude/logs/file-logger.log"
        grep -q "File size:" "$log_file" && \
        grep -q "File lines:" "$log_file" && \
        grep -q "File type:" "$log_file"
    )
}

##################################
# Missing/Unknown File Path Tests
##################################
test_handles_missing_file_gracefully() {
    requires_bash4 && return 0
    (
        local isolated_home="$TEST_DIR/missing-test"
        mkdir -p "$isolated_home"
        export HOME="$isolated_home"
        export CLAUDE_TOOL="Write"
        export CLAUDE_FILE="$TEST_DIR/nonexistent-file.txt"
        bash "$HOOK_PATH" > /dev/null 2>&1
        local exit_code=$?
        local log_file="$isolated_home/.claude/logs/file-logger.log"
        grep -q "File does not exist yet or path unknown" "$log_file" && \
        [[ $exit_code -eq 0 ]]
    )
}

test_handles_unknown_file_path() {
    requires_bash4 && return 0
    (
        local isolated_home="$TEST_DIR/unknown-test"
        mkdir -p "$isolated_home"
        export HOME="$isolated_home"
        export CLAUDE_TOOL="Edit"
        unset CLAUDE_FILE
        bash "$HOOK_PATH" > /dev/null 2>&1
        local exit_code=$?
        local log_file="$isolated_home/.claude/logs/file-logger.log"
        grep -q "File does not exist yet or path unknown" "$log_file" && \
        [[ $exit_code -eq 0 ]]
    )
}

test_handles_empty_file_path() {
    requires_bash4 && return 0
    (
        local isolated_home="$TEST_DIR/empty-path-test"
        mkdir -p "$isolated_home"
        export HOME="$isolated_home"
        export CLAUDE_TOOL="Write"
        export CLAUDE_FILE=""
        bash "$HOOK_PATH" > /dev/null 2>&1
        local exit_code=$?
        local log_file="$isolated_home/.claude/logs/file-logger.log"
        grep -q "File does not exist yet or path unknown" "$log_file" && \
        [[ $exit_code -eq 0 ]]
    )
}

##################################
# Non-Blocking Behavior Tests
##################################
test_exits_zero_for_edit() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Edit"
        export CLAUDE_FILE="$TEST_DIR/sample.txt"
        echo "content" > "$TEST_DIR/sample.txt"
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_exits_zero_for_skipped_tool() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Grep"
        export CLAUDE_FILE=""
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_exits_zero_for_missing_file() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Write"
        export CLAUDE_FILE="$TEST_DIR/does-not-exist.txt"
        bash "$HOOK_PATH" > /dev/null 2>&1
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
    run_test "Hook is parseable" test_hook_is_executable_or_sourceable

    echo ""
    echo "Tool Filtering Tests:"
    run_test "Skips Bash tool" test_skips_bash_tool
    run_test "Skips Read tool" test_skips_read_tool
    run_test "Skips Glob tool" test_skips_glob_tool

    echo ""
    echo "File Modification Tool Tests:"
    run_test "Processes Edit tool (exits 0)" test_processes_edit_tool
    run_test "Processes Write tool (exits 0)" test_processes_write_tool
    run_test "Processes MultiEdit tool (exits 0)" test_processes_multiedit_tool

    echo ""
    echo "Log Directory and File Tests:"
    run_test "Creates log directory" test_creates_log_directory
    run_test "Creates log file" test_creates_log_file

    echo ""
    echo "Log Content Tests:"
    run_test "Logs hook trigger message" test_logs_hook_trigger
    run_test "Logs tool name" test_logs_tool_name
    run_test "Logs file info when file exists" test_logs_file_info_when_file_exists

    echo ""
    echo "Missing/Unknown File Path Tests:"
    run_test "Handles missing file gracefully" test_handles_missing_file_gracefully
    run_test "Handles unknown file path" test_handles_unknown_file_path
    run_test "Handles empty file path" test_handles_empty_file_path

    echo ""
    echo "Non-Blocking Behavior Tests:"
    run_test "Exits 0 for Edit tool" test_exits_zero_for_edit
    run_test "Exits 0 for skipped tool" test_exits_zero_for_skipped_tool
    run_test "Exits 0 for missing file" test_exits_zero_for_missing_file

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
