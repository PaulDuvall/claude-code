#!/usr/bin/env bash
set -uo pipefail

# Test Suite: hooks/subagent-trigger.sh
#
# Purpose: Functional tests for the subagent event trigger hook (full + simple modes)
# Tests: File existence, syntax, help flags, argument parsing, simple mode

##################################
# Test Configuration
##################################
TEST_NAME="hooks/subagent-trigger.sh Test Suite"
TEST_DIR="/tmp/test-subagent-trigger-$$"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HOOK_PATH="$SCRIPT_DIR/hooks/subagent-trigger.sh"

source "$(dirname "$0")/lib/test-helpers.sh"

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

test_hook_is_parseable() {
    bash -n "$HOOK_PATH"
}

##################################
# Full Mode: Help Flag Tests
##################################
test_help_long_flag() {
    requires_bash4 && return 0
    local output exit_code
    output=$(bash "$HOOK_PATH" --help 2>&1)
    exit_code=$?
    [[ $exit_code -eq 0 ]] && echo "$output" | grep -qi "usage\|subagent-trigger"
}

test_help_short_flag() {
    requires_bash4 && return 0
    bash "$HOOK_PATH" -h >/dev/null 2>&1
}

##################################
# Full Mode: Argument Parsing Tests
##################################
test_no_args_exits_nonzero() {
    requires_bash4 && return 0
    bash "$HOOK_PATH" >/dev/null 2>&1
    [[ $? -ne 0 ]]
}

test_no_args_shows_usage() {
    requires_bash4 && return 0
    local output
    output=$(bash "$HOOK_PATH" 2>&1)
    echo "$output" | grep -qi "usage\|subagent\|error\|argument"
}

##################################
# Simple Mode: Help Tests
##################################
test_simple_help_flag() {
    requires_bash4 && return 0
    local output exit_code
    output=$(bash "$HOOK_PATH" --simple --help 2>&1)
    exit_code=$?
    [[ $exit_code -eq 0 ]] && echo "$output" | grep -qi "usage"
}

test_simple_no_args_shows_usage() {
    requires_bash4 && return 0
    local exit_code
    bash "$HOOK_PATH" --simple >/dev/null 2>&1
    exit_code=$?
    [[ $exit_code -eq 0 ]]
}

##################################
# Simple Mode: Invocation Tests
##################################
test_simple_runs_with_known_subagent() {
    requires_bash4 && return 0
    bash "$HOOK_PATH" --simple "security-auditor" >/dev/null 2>&1
}

test_simple_runs_with_event_type() {
    requires_bash4 && return 0
    bash "$HOOK_PATH" --simple "security-auditor" "pre_write" >/dev/null 2>&1
}

##################################
# Simple Mode: Output Tests
##################################
test_simple_output_contains_trigger() {
    requires_bash4 && return 0
    local output
    output=$(bash "$HOOK_PATH" --simple "security-auditor" 2>&1)
    echo "$output" | grep -q "SUBAGENT TRIGGER"
}

test_simple_output_mentions_subagent() {
    requires_bash4 && return 0
    local output
    output=$(bash "$HOOK_PATH" --simple "security-auditor" 2>&1)
    echo "$output" | grep -q "security-auditor"
}

##################################
# Main Test Execution
##################################
main() {
    print_test_header

    setup_test_environment

    echo "Hook Existence Tests:"
    run_test "Hook file exists" test_hook_exists
    run_test "Hook syntax is valid" test_hook_syntax_valid
    run_test "Hook is parseable" test_hook_is_parseable

    echo ""
    echo "Full Mode - Help Flag Tests:"
    run_test "Shows help with --help flag" test_help_long_flag
    run_test "Shows help with -h flag" test_help_short_flag

    echo ""
    echo "Full Mode - Argument Parsing Tests:"
    run_test "Exits non-zero with no arguments" test_no_args_exits_nonzero
    run_test "Shows usage info on error" test_no_args_shows_usage

    echo ""
    echo "Simple Mode - Help Tests:"
    run_test "Shows help with --simple --help" test_simple_help_flag
    run_test "Shows usage with --simple and no args" test_simple_no_args_shows_usage

    echo ""
    echo "Simple Mode - Invocation Tests:"
    run_test "Runs with --simple and known subagent" test_simple_runs_with_known_subagent
    run_test "Runs with --simple and event type" test_simple_runs_with_event_type

    echo ""
    echo "Simple Mode - Output Tests:"
    run_test "Output contains SUBAGENT TRIGGER" test_simple_output_contains_trigger
    run_test "Output mentions subagent name" test_simple_output_mentions_subagent

    cleanup_test_environment

    print_test_summary
}

setup_test_trap

main "$@"
