#!/usr/bin/env bash
set -uo pipefail

# Test Suite: hooks/subagent-trigger-simple.sh
#
# Purpose: Functional tests for the simplified subagent trigger hook
# Tests: File existence, syntax, help flags, invocation, output content

##################################
# Test Configuration
##################################
TEST_NAME="hooks/subagent-trigger-simple.sh Test Suite"
TEST_DIR="/tmp/test-subagent-trigger-simple-$$"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HOOK_PATH="$SCRIPT_DIR/hooks/subagent-trigger-simple.sh"

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
# Help Flag Tests
##################################
test_help_long_flag() {
    requires_bash4 && return 0
    local output exit_code
    output=$(bash "$HOOK_PATH" --help 2>&1)
    exit_code=$?
    [[ $exit_code -eq 0 ]] && echo "$output" | grep -qi "usage"
}

test_help_short_flag() {
    requires_bash4 && return 0
    bash "$HOOK_PATH" -h >/dev/null 2>&1
}

test_no_args_shows_usage() {
    requires_bash4 && return 0
    local exit_code
    bash "$HOOK_PATH" >/dev/null 2>&1
    exit_code=$?
    [[ $exit_code -eq 0 ]]
}

##################################
# Invocation Tests
##################################
test_runs_with_known_subagent() {
    requires_bash4 && return 0
    bash "$HOOK_PATH" "security-auditor" >/dev/null 2>&1
}

test_runs_with_event_type() {
    requires_bash4 && return 0
    bash "$HOOK_PATH" "security-auditor" "pre_write" >/dev/null 2>&1
}

##################################
# Output Content Tests
##################################
test_output_contains_subagent_trigger() {
    requires_bash4 && return 0
    local output
    output=$(bash "$HOOK_PATH" "security-auditor" 2>&1)
    echo "$output" | grep -q "SUBAGENT TRIGGER"
}

test_output_mentions_subagent_name() {
    requires_bash4 && return 0
    local output
    output=$(bash "$HOOK_PATH" "security-auditor" 2>&1)
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
    echo "Help Flag Tests:"
    run_test "Shows help with --help flag" test_help_long_flag
    run_test "Shows help with -h flag" test_help_short_flag
    run_test "Shows help with no args" test_no_args_shows_usage

    echo ""
    echo "Invocation Tests:"
    run_test "Runs with known subagent name" test_runs_with_known_subagent
    run_test "Runs with event type argument" test_runs_with_event_type

    echo ""
    echo "Output Content Tests:"
    run_test "Output contains SUBAGENT TRIGGER" test_output_contains_subagent_trigger
    run_test "Output mentions subagent name" test_output_mentions_subagent_name

    cleanup_test_environment

    print_test_summary
}

setup_test_trap

main "$@"
