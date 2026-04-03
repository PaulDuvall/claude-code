#!/usr/bin/env bash
set -uo pipefail

# Test Suite: hooks/lib/execution-results.sh
#
# Purpose: Validate execution result processing and blocking condition detection
# Tests: Module loading, function existence, blocking condition checks, display

##################################
# Test Configuration
##################################
TEST_NAME="hooks/lib/execution-results.sh Test Suite"
TEST_DIR="/tmp/test-execution-results-$$"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LIB_DIR="$SCRIPT_DIR/hooks/lib"
source "$(dirname "$0")/lib/test-helpers.sh"

# Helper to unset all include guards before sourcing
unset_all_guards() {
    unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED
    unset CONFIG_CONSTANTS_LOADED _FIELD_VALIDATORS_LOADED _SUBAGENT_VALIDATOR_LOADED
    unset _VALIDATION_REPORTER_LOADED _EXECUTION_ENGINE_LOADED _EXECUTION_RESULTS_LOADED
    unset _EXECUTION_SIMULATION_LOADED _SUBAGENT_DISCOVERY_LOADED _ARGUMENT_PARSER_LOADED
}

##################################
# Module Existence and Syntax Tests
##################################
test_lib_exists() {
    [[ -f "$LIB_DIR/execution-results.sh" ]] && [[ -r "$LIB_DIR/execution-results.sh" ]]
}

test_lib_syntax_valid() {
    bash -n "$LIB_DIR/execution-results.sh" 2>/dev/null
}

test_lib_is_sourceable() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-results.sh" 2>/dev/null
    )
}

##################################
# Include Guard Tests
##################################
test_include_guard_prevents_double_load() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-results.sh" 2>/dev/null
        [[ "$_EXECUTION_RESULTS_LOADED" -eq 1 ]]
        # Source again - should return immediately via guard
        source "$LIB_DIR/execution-results.sh" 2>/dev/null
        [[ "$_EXECUTION_RESULTS_LOADED" -eq 1 ]]
    )
}

##################################
# Function Existence Tests
##################################
test_process_execution_results_exists() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-results.sh" 2>/dev/null
        declare -f process_execution_results >/dev/null 2>&1
    )
}

test_check_for_blocking_conditions_exists() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-results.sh" 2>/dev/null
        declare -f check_for_blocking_conditions >/dev/null 2>&1
    )
}

test_display_blocking_message_exists() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-results.sh" 2>/dev/null
        declare -f display_blocking_message >/dev/null 2>&1
    )
}

##################################
# check_for_blocking_conditions Tests
##################################
test_blocking_returns_nonzero_for_safe_content() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-results.sh" 2>/dev/null
        ! check_for_blocking_conditions "Operation appears safe to proceed" >/dev/null 2>&1
    )
}

test_blocking_returns_zero_for_violation() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-results.sh" 2>/dev/null
        check_for_blocking_conditions "SECURITY VIOLATION DETECTED" >/dev/null 2>&1
    )
}

test_blocking_returns_nonzero_for_neutral_content() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-results.sh" 2>/dev/null
        ! check_for_blocking_conditions "Just some regular output text" >/dev/null 2>&1
    )
}

##################################
# display_blocking_message Tests
##################################
test_display_blocking_message_callable() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-results.sh" 2>/dev/null
        display_blocking_message "test-agent" "test blocking output" >/dev/null 2>&1
    )
}

##################################
# Main Test Execution
##################################
main() {
    print_test_header

    setup_test_environment

    echo "Module Existence and Syntax Tests:"
    run_test "Library file exists" test_lib_exists
    run_test "Library syntax is valid" test_lib_syntax_valid

    if ! has_bash4; then
        echo ""
        echo "NOTE: Remaining tests require bash 4+ (found ${BASH_VERSION})"
        echo "Skipping source-dependent tests on bash 3.x."
        cleanup_test_environment
        print_test_summary
    fi

    run_test "Library is sourceable" test_lib_is_sourceable

    echo ""
    echo "Include Guard Tests:"
    run_test "Include guard prevents double load" test_include_guard_prevents_double_load

    echo ""
    echo "Function Existence Tests:"
    run_test "process_execution_results exists" test_process_execution_results_exists
    run_test "check_for_blocking_conditions exists" test_check_for_blocking_conditions_exists
    run_test "display_blocking_message exists" test_display_blocking_message_exists

    echo ""
    echo "check_for_blocking_conditions Tests:"
    run_test "Returns non-zero for safe content" test_blocking_returns_nonzero_for_safe_content
    run_test "Returns 0 for SECURITY VIOLATION DETECTED" test_blocking_returns_zero_for_violation
    run_test "Returns non-zero for neutral content" test_blocking_returns_nonzero_for_neutral_content

    echo ""
    echo "display_blocking_message Tests:"
    run_test "display_blocking_message is callable" test_display_blocking_message_callable

    cleanup_test_environment

    print_test_summary
}

setup_test_trap

main "$@"
