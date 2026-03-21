#!/usr/bin/env bash
set -uo pipefail

# Test Suite: hooks/lib/validation-reporter.sh
#
# Purpose: Validate batch validation and reporting functions for subagent definitions
# Tests: validate_all_subagents, generate_validation_report, generate_text_validation_report

##################################
# Test Configuration
##################################
TEST_NAME="hooks/lib/validation-reporter.sh Test Suite"
TEST_DIR="/tmp/test-validation-reporter-$$"
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

##################################
# Module Existence and Syntax Tests
##################################
test_lib_exists() {
    [[ -f "$LIB_DIR/validation-reporter.sh" ]] && [[ -r "$LIB_DIR/validation-reporter.sh" ]]
}

test_lib_syntax_valid() {
    bash -n "$LIB_DIR/validation-reporter.sh" 2>/dev/null
}

test_lib_is_sourceable() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED _FIELD_VALIDATORS_LOADED _SUBAGENT_VALIDATOR_LOADED _VALIDATION_REPORTER_LOADED _EXECUTION_ENGINE_LOADED _EXECUTION_RESULTS_LOADED _EXECUTION_SIMULATION_LOADED _SUBAGENT_DISCOVERY_LOADED _ARGUMENT_PARSER_LOADED
        source "$LIB_DIR/validation-reporter.sh" 2>/dev/null
    )
}

##################################
# Include Guard Tests
##################################
test_include_guard_prevents_double_load() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED _FIELD_VALIDATORS_LOADED _SUBAGENT_VALIDATOR_LOADED _VALIDATION_REPORTER_LOADED _EXECUTION_ENGINE_LOADED _EXECUTION_RESULTS_LOADED _EXECUTION_SIMULATION_LOADED _SUBAGENT_DISCOVERY_LOADED _ARGUMENT_PARSER_LOADED
        source "$LIB_DIR/validation-reporter.sh" 2>/dev/null
        [[ "$_VALIDATION_REPORTER_LOADED" -eq 1 ]]
        # Source again - should return immediately via guard
        source "$LIB_DIR/validation-reporter.sh" 2>/dev/null
        [[ "$_VALIDATION_REPORTER_LOADED" -eq 1 ]]
    )
}

##################################
# Function Existence Tests
##################################
test_validate_all_subagents_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED _FIELD_VALIDATORS_LOADED _SUBAGENT_VALIDATOR_LOADED _VALIDATION_REPORTER_LOADED _EXECUTION_ENGINE_LOADED _EXECUTION_RESULTS_LOADED _EXECUTION_SIMULATION_LOADED _SUBAGENT_DISCOVERY_LOADED _ARGUMENT_PARSER_LOADED
        source "$LIB_DIR/validation-reporter.sh" 2>/dev/null
        declare -f validate_all_subagents >/dev/null 2>&1
    )
}

test_generate_validation_report_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED _FIELD_VALIDATORS_LOADED _SUBAGENT_VALIDATOR_LOADED _VALIDATION_REPORTER_LOADED _EXECUTION_ENGINE_LOADED _EXECUTION_RESULTS_LOADED _EXECUTION_SIMULATION_LOADED _SUBAGENT_DISCOVERY_LOADED _ARGUMENT_PARSER_LOADED
        source "$LIB_DIR/validation-reporter.sh" 2>/dev/null
        declare -f generate_validation_report >/dev/null 2>&1
    )
}

test_generate_text_validation_report_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED _FIELD_VALIDATORS_LOADED _SUBAGENT_VALIDATOR_LOADED _VALIDATION_REPORTER_LOADED _EXECUTION_ENGINE_LOADED _EXECUTION_RESULTS_LOADED _EXECUTION_SIMULATION_LOADED _SUBAGENT_DISCOVERY_LOADED _ARGUMENT_PARSER_LOADED
        source "$LIB_DIR/validation-reporter.sh" 2>/dev/null
        declare -f generate_text_validation_report >/dev/null 2>&1
    )
}

##################################
# Behavioral Tests
##################################
test_generate_text_validation_report_outputs_header() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED _FIELD_VALIDATORS_LOADED _SUBAGENT_VALIDATOR_LOADED _VALIDATION_REPORTER_LOADED _EXECUTION_ENGINE_LOADED _EXECUTION_RESULTS_LOADED _EXECUTION_SIMULATION_LOADED _SUBAGENT_DISCOVERY_LOADED _ARGUMENT_PARSER_LOADED
        source "$LIB_DIR/validation-reporter.sh" 2>/dev/null
        local report_dir="$TEST_DIR/report-subagents"
        mkdir -p "$report_dir"
        local output
        output=$(generate_text_validation_report "$report_dir" 2>/dev/null)
        echo "$output" | grep -q "Subagent Validation Report"
    )
}

test_validate_all_subagents_fails_on_nonexistent_dir() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED _FIELD_VALIDATORS_LOADED _SUBAGENT_VALIDATOR_LOADED _VALIDATION_REPORTER_LOADED _EXECUTION_ENGINE_LOADED _EXECUTION_RESULTS_LOADED _EXECUTION_SIMULATION_LOADED _SUBAGENT_DISCOVERY_LOADED _ARGUMENT_PARSER_LOADED
        source "$LIB_DIR/validation-reporter.sh" 2>/dev/null
        if validate_all_subagents "$TEST_DIR/nonexistent-directory" >/dev/null 2>&1; then
            return 1  # Should have failed
        fi
        return 0
    )
}

test_module_sources_cleanly() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED _FIELD_VALIDATORS_LOADED _SUBAGENT_VALIDATOR_LOADED _VALIDATION_REPORTER_LOADED _EXECUTION_ENGINE_LOADED _EXECUTION_RESULTS_LOADED _EXECUTION_SIMULATION_LOADED _SUBAGENT_DISCOVERY_LOADED _ARGUMENT_PARSER_LOADED
        local output
        output=$(source "$LIB_DIR/validation-reporter.sh" 2>&1)
        # Should not produce error output on clean source
        ! echo "$output" | grep -qi "error\|fatal\|abort"
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
    run_test "validate_all_subagents function exists" test_validate_all_subagents_exists
    run_test "generate_validation_report function exists" test_generate_validation_report_exists
    run_test "generate_text_validation_report function exists" test_generate_text_validation_report_exists

    echo ""
    echo "Behavioral Tests:"
    run_test "generate_text_validation_report outputs header" test_generate_text_validation_report_outputs_header
    run_test "validate_all_subagents fails on nonexistent directory" test_validate_all_subagents_fails_on_nonexistent_dir
    run_test "Module sources cleanly without errors" test_module_sources_cleanly

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
