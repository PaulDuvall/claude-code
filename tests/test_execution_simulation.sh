#!/usr/bin/env bash
set -uo pipefail

# Test Suite: hooks/lib/execution-simulation.sh
#
# Purpose: Validate subagent simulation and context analysis functions
# Tests: Module loading, function existence, context analysis behavior

##################################
# Test Configuration
##################################
TEST_NAME="hooks/lib/execution-simulation.sh Test Suite"
TEST_DIR="/tmp/test-execution-simulation-$$"
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
    [[ -f "$LIB_DIR/execution-simulation.sh" ]] && [[ -r "$LIB_DIR/execution-simulation.sh" ]]
}

test_lib_syntax_valid() {
    bash -n "$LIB_DIR/execution-simulation.sh" 2>/dev/null
}

test_lib_is_sourceable() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-simulation.sh" 2>/dev/null
    )
}

##################################
# Include Guard Tests
##################################
test_include_guard_prevents_double_load() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-simulation.sh" 2>/dev/null
        [[ "$_EXECUTION_SIMULATION_LOADED" -eq 1 ]]
        # Source again - should return immediately via guard
        source "$LIB_DIR/execution-simulation.sh" 2>/dev/null
        [[ "$_EXECUTION_SIMULATION_LOADED" -eq 1 ]]
    )
}

##################################
# Function Existence Tests
##################################
test_execute_subagent_simulation_exists() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-simulation.sh" 2>/dev/null
        declare -f execute_subagent_simulation >/dev/null 2>&1
    )
}

test_analyze_context_for_simulation_exists() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-simulation.sh" 2>/dev/null
        declare -f analyze_context_for_simulation >/dev/null 2>&1
    )
}

##################################
# analyze_context_for_simulation Tests
##################################
test_analyze_context_missing_file() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-simulation.sh" 2>/dev/null
        local result
        result=$(analyze_context_for_simulation "/nonexistent/file.json" 2>/dev/null)
        [[ "$result" == *"Context file not available"* ]]
    )
}

test_analyze_context_callable_with_existing_file() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-simulation.sh" 2>/dev/null
        local context_file="$TEST_DIR/test-context.json"
        echo '{"event": {"type": "test"}}' > "$context_file"
        analyze_context_for_simulation "$context_file" >/dev/null 2>&1
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
    run_test "execute_subagent_simulation exists" test_execute_subagent_simulation_exists
    run_test "analyze_context_for_simulation exists" test_analyze_context_for_simulation_exists

    echo ""
    echo "analyze_context_for_simulation Tests:"
    run_test "Outputs 'Context file not available' for missing file" test_analyze_context_missing_file
    run_test "Callable with existing context file" test_analyze_context_callable_with_existing_file

    cleanup_test_environment

    print_test_summary
}

setup_test_trap

main "$@"
