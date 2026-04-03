#!/usr/bin/env bash
set -uo pipefail

# Test Suite: hooks/on-error-debug.sh
#
# Purpose: Functional tests for error debugging hook
# Tests: Hook existence, syntax, invocation, output patterns, --trap flag

##################################
# Test Configuration
##################################
TEST_NAME="hooks/on-error-debug.sh Test Suite"
TEST_DIR="/tmp/test-on-error-debug-$$"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HOOK_PATH="$SCRIPT_DIR/hooks/on-error-debug.sh"
source "$(dirname "$0")/lib/test-helpers.sh"

requires_bash4() {
    if ! has_bash4; then
        echo -n "(skipped: bash < 4) "
        return 0
    fi
    return 1
}

##################################
# Test Setup (custom — overrides helper defaults)
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
# Basic Invocation Tests
##################################
test_hook_runs_with_error_message() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        local output
        output=$(bash "$HOOK_PATH" "test error message" "test command" 2>&1)
        local rc=$?
        [[ $rc -eq 0 ]] && [[ "$output" == *"ERROR DETECTED"* ]]
    )
}

test_hook_runs_with_trap_flag() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        bash "$HOOK_PATH" --trap 42 "failed-cmd" >/dev/null 2>&1
    )
}

##################################
# Output Content Tests
##################################
test_output_contains_debug_request() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        local output
        output=$(bash "$HOOK_PATH" "something went wrong" "bad-command" 2>&1)
        [[ "$output" == *"DEBUG REQUEST"* ]]
    )
}

test_output_contains_root_cause() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        local output
        output=$(bash "$HOOK_PATH" "test failure" "test-cmd" 2>&1)
        [[ "$output" == *"Root cause"* ]]
    )
}

test_output_contains_error_message_arg() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        local output
        output=$(bash "$HOOK_PATH" "unique error xyz123" "some-command" 2>&1)
        [[ "$output" == *"unique error xyz123"* ]]
    )
}

test_output_mentions_tool_when_set() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Bash"
        local output
        output=$(bash "$HOOK_PATH" "tool error" "failing-cmd" 2>&1)
        [[ "$output" == *"Bash"* ]]
    )
}

##################################
# Trap Flag Tests
##################################
test_trap_flag_exits_zero() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        bash "$HOOK_PATH" --trap 99 "crashed-cmd" >/dev/null 2>&1
        local rc=$?
        [[ $rc -eq 0 ]]
    )
}

test_trap_flag_output_contains_error_detected() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        local output
        output=$(bash "$HOOK_PATH" --trap 10 "some-cmd" 2>&1)
        [[ "$output" == *"ERROR DETECTED"* ]]
    )
}

##################################
# Edge Case Tests
##################################
test_hook_handles_empty_args() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        bash "$HOOK_PATH" "" "" >/dev/null 2>&1
    )
}

test_hook_handles_no_args() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        bash "$HOOK_PATH" >/dev/null 2>&1
    )
}

##################################
# Main Test Execution
##################################
main() {
    print_test_header

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
    echo "Basic Invocation Tests:"
    run_test "Hook runs with error message (exits 0, output has ERROR DETECTED)" test_hook_runs_with_error_message
    run_test "Hook runs with --trap flag (exits 0)" test_hook_runs_with_trap_flag

    echo ""
    echo "Output Content Tests:"
    run_test "Output contains DEBUG REQUEST" test_output_contains_debug_request
    run_test "Output contains Root cause guidance" test_output_contains_root_cause
    run_test "Output contains error message passed as arg" test_output_contains_error_message_arg
    run_test "Output mentions CLAUDE_TOOL when set" test_output_mentions_tool_when_set

    echo ""
    echo "Trap Flag Tests:"
    run_test "Trap flag invocation exits 0" test_trap_flag_exits_zero
    run_test "Trap flag output contains ERROR DETECTED" test_trap_flag_output_contains_error_detected

    echo ""
    echo "Edge Case Tests:"
    run_test "Handles empty arguments" test_hook_handles_empty_args
    run_test "Handles no arguments" test_hook_handles_no_args

    cleanup_test_environment

    print_test_summary
}

setup_test_trap

main "$@"
