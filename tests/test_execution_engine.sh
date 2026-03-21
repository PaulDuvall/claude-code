#!/usr/bin/env bash
set -uo pipefail

# Test Suite: hooks/lib/execution-engine.sh
#
# Purpose: Validate execution engine functions for subagent execution
# Tests: Module loading, execution modes, environment management, status, initialization

##################################
# Test Configuration
##################################
TEST_NAME="hooks/lib/execution-engine.sh Test Suite"
TEST_DIR="/tmp/test-execution-engine-$$"
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
    [[ -f "$LIB_DIR/execution-engine.sh" ]] && [[ -r "$LIB_DIR/execution-engine.sh" ]]
}

test_lib_syntax_valid() {
    bash -n "$LIB_DIR/execution-engine.sh" 2>/dev/null
}

test_lib_is_sourceable() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-engine.sh" 2>/dev/null
    )
}

##################################
# Include Guard Tests
##################################
test_include_guard_prevents_double_load() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-engine.sh" 2>/dev/null
        [[ "$_EXECUTION_ENGINE_LOADED" -eq 1 ]]
        # Source again - should return immediately via guard
        source "$LIB_DIR/execution-engine.sh" 2>/dev/null
        [[ "$_EXECUTION_ENGINE_LOADED" -eq 1 ]]
    )
}

##################################
# Function Existence Tests
##################################
test_determine_execution_mode_exists() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-engine.sh" 2>/dev/null
        declare -f determine_execution_mode >/dev/null 2>&1
    )
}

test_get_timeout_for_execution_exists() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-engine.sh" 2>/dev/null
        declare -f get_timeout_for_execution >/dev/null 2>&1
    )
}

test_execute_subagent_exists() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-engine.sh" 2>/dev/null
        declare -f execute_subagent >/dev/null 2>&1
    )
}

test_execute_subagent_blocking_exists() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-engine.sh" 2>/dev/null
        declare -f execute_subagent_blocking >/dev/null 2>&1
    )
}

test_execute_subagent_non_blocking_exists() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-engine.sh" 2>/dev/null
        declare -f execute_subagent_non_blocking >/dev/null 2>&1
    )
}

test_execute_subagent_dry_run_exists() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-engine.sh" 2>/dev/null
        declare -f execute_subagent_dry_run >/dev/null 2>&1
    )
}

test_execute_multiple_subagents_exists() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-engine.sh" 2>/dev/null
        declare -f execute_multiple_subagents >/dev/null 2>&1
    )
}

test_prepare_execution_environment_exists() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-engine.sh" 2>/dev/null
        declare -f prepare_execution_environment >/dev/null 2>&1
    )
}

test_cleanup_execution_environment_exists() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-engine.sh" 2>/dev/null
        declare -f cleanup_execution_environment >/dev/null 2>&1
    )
}

test_get_execution_status_exists() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-engine.sh" 2>/dev/null
        declare -f get_execution_status >/dev/null 2>&1
    )
}

test_wait_for_execution_exists() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-engine.sh" 2>/dev/null
        declare -f wait_for_execution >/dev/null 2>&1
    )
}

test_extract_subagent_metadata_exists() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-engine.sh" 2>/dev/null
        declare -f extract_subagent_metadata >/dev/null 2>&1
    )
}

test_initialize_execution_engine_exists() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-engine.sh" 2>/dev/null
        declare -f initialize_execution_engine >/dev/null 2>&1
    )
}

##################################
# determine_execution_mode Tests
##################################
test_determine_execution_mode_blocking_for_pre_write() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-engine.sh" 2>/dev/null
        local result
        result=$(determine_execution_mode "pre_write" "auto" 2>/dev/null)
        [[ "$result" == "blocking" ]]
    )
}

test_determine_execution_mode_non_blocking_for_post_write() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-engine.sh" 2>/dev/null
        local result
        result=$(determine_execution_mode "post_write" "auto" 2>/dev/null)
        [[ "$result" == "non-blocking" ]]
    )
}

test_determine_execution_mode_uses_forced_mode() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-engine.sh" 2>/dev/null
        local result
        result=$(determine_execution_mode "post_write" "blocking" 2>/dev/null)
        [[ "$result" == "blocking" ]]
    )
}

##################################
# get_execution_status Tests
##################################
test_get_execution_status_not_started() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-engine.sh" 2>/dev/null
        EXECUTION_PID=""
        local result
        result=$(get_execution_status 2>/dev/null)
        [[ "$result" == "not_started" ]]
    )
}

##################################
# prepare_execution_environment Tests
##################################
test_prepare_execution_environment_creates_files() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-engine.sh" 2>/dev/null
        prepare_execution_environment "test-agent" >/dev/null 2>&1
        [[ -n "$EXECUTION_OUTPUT_FILE" ]] && [[ -f "$EXECUTION_OUTPUT_FILE" ]]
    )
}

##################################
# cleanup_execution_environment Tests
##################################
test_cleanup_execution_environment_resets_globals() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-engine.sh" 2>/dev/null
        # Set some globals
        EXECUTION_PID="12345"
        EXECUTION_START_TIME="1000"
        EXECUTION_OUTPUT_FILE="/tmp/test-output"
        EXECUTION_ERROR_FILE="/tmp/test-error"
        EXECUTION_RESULT="some result"
        cleanup_execution_environment >/dev/null 2>&1
        [[ -z "$EXECUTION_PID" ]] && \
        [[ -z "$EXECUTION_START_TIME" ]] && \
        [[ -z "$EXECUTION_OUTPUT_FILE" ]] && \
        [[ -z "$EXECUTION_ERROR_FILE" ]] && \
        [[ -z "$EXECUTION_RESULT" ]]
    )
}

##################################
# initialize_execution_engine Tests
##################################
test_initialize_execution_engine_succeeds() {
    (
        export HOME="$TEST_DIR"
        unset_all_guards
        source "$LIB_DIR/execution-engine.sh" 2>/dev/null
        initialize_execution_engine >/dev/null 2>&1
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
    run_test "determine_execution_mode exists" test_determine_execution_mode_exists
    run_test "get_timeout_for_execution exists" test_get_timeout_for_execution_exists
    run_test "execute_subagent exists" test_execute_subagent_exists
    run_test "execute_subagent_blocking exists" test_execute_subagent_blocking_exists
    run_test "execute_subagent_non_blocking exists" test_execute_subagent_non_blocking_exists
    run_test "execute_subagent_dry_run exists" test_execute_subagent_dry_run_exists
    run_test "execute_multiple_subagents exists" test_execute_multiple_subagents_exists
    run_test "prepare_execution_environment exists" test_prepare_execution_environment_exists
    run_test "cleanup_execution_environment exists" test_cleanup_execution_environment_exists
    run_test "get_execution_status exists" test_get_execution_status_exists
    run_test "wait_for_execution exists" test_wait_for_execution_exists
    run_test "extract_subagent_metadata exists" test_extract_subagent_metadata_exists
    run_test "initialize_execution_engine exists" test_initialize_execution_engine_exists

    echo ""
    echo "determine_execution_mode Tests:"
    run_test "Returns blocking for pre_write" test_determine_execution_mode_blocking_for_pre_write
    run_test "Returns non-blocking for post_write" test_determine_execution_mode_non_blocking_for_post_write
    run_test "Uses forced mode when not auto" test_determine_execution_mode_uses_forced_mode

    echo ""
    echo "get_execution_status Tests:"
    run_test "Returns not_started when no PID" test_get_execution_status_not_started

    echo ""
    echo "Execution Environment Tests:"
    run_test "prepare_execution_environment creates output files" test_prepare_execution_environment_creates_files
    run_test "cleanup_execution_environment resets globals" test_cleanup_execution_environment_resets_globals

    echo ""
    echo "Initialization Tests:"
    run_test "initialize_execution_engine succeeds" test_initialize_execution_engine_succeeds

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
