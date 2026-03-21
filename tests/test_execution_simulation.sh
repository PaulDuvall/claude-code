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
    echo "========================================="
    echo "$TEST_NAME"
    echo "========================================="
    echo ""

    setup_test_environment

    echo "Module Existence and Syntax Tests:"
    run_test "Library file exists" test_lib_exists
    run_test "Library syntax is valid" test_lib_syntax_valid

    if ! has_bash4; then
        echo ""
        echo "NOTE: Remaining tests require bash 4+ (found ${BASH_VERSION})"
        echo "Skipping source-dependent tests on bash 3.x."
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
