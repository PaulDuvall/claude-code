#!/usr/bin/env bash
set -uo pipefail

# Test Suite: hooks/lib/subagent-discovery.sh
#
# Purpose: Validate subagent discovery, location, and enumeration functions
# Tests: find_subagent, discover_available_subagents, event-based discovery, initialization

##################################
# Test Configuration
##################################
TEST_NAME="hooks/lib/subagent-discovery.sh Test Suite"
TEST_DIR="/tmp/test-subagent-discovery-$$"
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
    [[ -f "$LIB_DIR/subagent-discovery.sh" ]] && [[ -r "$LIB_DIR/subagent-discovery.sh" ]]
}

test_lib_syntax_valid() {
    bash -n "$LIB_DIR/subagent-discovery.sh" 2>/dev/null
}

test_lib_is_sourceable() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED _FIELD_VALIDATORS_LOADED _SUBAGENT_VALIDATOR_LOADED _VALIDATION_REPORTER_LOADED _EXECUTION_ENGINE_LOADED _EXECUTION_RESULTS_LOADED _EXECUTION_SIMULATION_LOADED _SUBAGENT_DISCOVERY_LOADED _ARGUMENT_PARSER_LOADED
        source "$LIB_DIR/subagent-discovery.sh" 2>/dev/null
    )
}

##################################
# Include Guard Tests
##################################
test_include_guard_prevents_double_load() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED _FIELD_VALIDATORS_LOADED _SUBAGENT_VALIDATOR_LOADED _VALIDATION_REPORTER_LOADED _EXECUTION_ENGINE_LOADED _EXECUTION_RESULTS_LOADED _EXECUTION_SIMULATION_LOADED _SUBAGENT_DISCOVERY_LOADED _ARGUMENT_PARSER_LOADED
        source "$LIB_DIR/subagent-discovery.sh" 2>/dev/null
        [[ "$_SUBAGENT_DISCOVERY_LOADED" -eq 1 ]]
        # Source again - should return immediately via guard
        source "$LIB_DIR/subagent-discovery.sh" 2>/dev/null
        [[ "$_SUBAGENT_DISCOVERY_LOADED" -eq 1 ]]
    )
}

##################################
# Function Existence Tests
##################################
test_find_subagent_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED _FIELD_VALIDATORS_LOADED _SUBAGENT_VALIDATOR_LOADED _VALIDATION_REPORTER_LOADED _EXECUTION_ENGINE_LOADED _EXECUTION_RESULTS_LOADED _EXECUTION_SIMULATION_LOADED _SUBAGENT_DISCOVERY_LOADED _ARGUMENT_PARSER_LOADED
        source "$LIB_DIR/subagent-discovery.sh" 2>/dev/null
        declare -f find_subagent >/dev/null 2>&1
    )
}

test_discover_available_subagents_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED _FIELD_VALIDATORS_LOADED _SUBAGENT_VALIDATOR_LOADED _VALIDATION_REPORTER_LOADED _EXECUTION_ENGINE_LOADED _EXECUTION_RESULTS_LOADED _EXECUTION_SIMULATION_LOADED _SUBAGENT_DISCOVERY_LOADED _ARGUMENT_PARSER_LOADED
        source "$LIB_DIR/subagent-discovery.sh" 2>/dev/null
        declare -f discover_available_subagents >/dev/null 2>&1
    )
}

test_get_all_available_subagents_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED _FIELD_VALIDATORS_LOADED _SUBAGENT_VALIDATOR_LOADED _VALIDATION_REPORTER_LOADED _EXECUTION_ENGINE_LOADED _EXECUTION_RESULTS_LOADED _EXECUTION_SIMULATION_LOADED _SUBAGENT_DISCOVERY_LOADED _ARGUMENT_PARSER_LOADED
        source "$LIB_DIR/subagent-discovery.sh" 2>/dev/null
        declare -f get_all_available_subagents >/dev/null 2>&1
    )
}

test_get_subagent_info_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED _FIELD_VALIDATORS_LOADED _SUBAGENT_VALIDATOR_LOADED _VALIDATION_REPORTER_LOADED _EXECUTION_ENGINE_LOADED _EXECUTION_RESULTS_LOADED _EXECUTION_SIMULATION_LOADED _SUBAGENT_DISCOVERY_LOADED _ARGUMENT_PARSER_LOADED
        source "$LIB_DIR/subagent-discovery.sh" 2>/dev/null
        declare -f get_subagent_info >/dev/null 2>&1
    )
}

test_list_subagents_with_info_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED _FIELD_VALIDATORS_LOADED _SUBAGENT_VALIDATOR_LOADED _VALIDATION_REPORTER_LOADED _EXECUTION_ENGINE_LOADED _EXECUTION_RESULTS_LOADED _EXECUTION_SIMULATION_LOADED _SUBAGENT_DISCOVERY_LOADED _ARGUMENT_PARSER_LOADED
        source "$LIB_DIR/subagent-discovery.sh" 2>/dev/null
        declare -f list_subagents_with_info >/dev/null 2>&1
    )
}

test_get_subagents_for_event_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED _FIELD_VALIDATORS_LOADED _SUBAGENT_VALIDATOR_LOADED _VALIDATION_REPORTER_LOADED _EXECUTION_ENGINE_LOADED _EXECUTION_RESULTS_LOADED _EXECUTION_SIMULATION_LOADED _SUBAGENT_DISCOVERY_LOADED _ARGUMENT_PARSER_LOADED
        source "$LIB_DIR/subagent-discovery.sh" 2>/dev/null
        declare -f get_subagents_for_event >/dev/null 2>&1
    )
}

test_get_priority_for_subagent_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED _FIELD_VALIDATORS_LOADED _SUBAGENT_VALIDATOR_LOADED _VALIDATION_REPORTER_LOADED _EXECUTION_ENGINE_LOADED _EXECUTION_RESULTS_LOADED _EXECUTION_SIMULATION_LOADED _SUBAGENT_DISCOVERY_LOADED _ARGUMENT_PARSER_LOADED
        source "$LIB_DIR/subagent-discovery.sh" 2>/dev/null
        declare -f get_priority_for_subagent >/dev/null 2>&1
    )
}

test_validate_discovery_environment_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED _FIELD_VALIDATORS_LOADED _SUBAGENT_VALIDATOR_LOADED _VALIDATION_REPORTER_LOADED _EXECUTION_ENGINE_LOADED _EXECUTION_RESULTS_LOADED _EXECUTION_SIMULATION_LOADED _SUBAGENT_DISCOVERY_LOADED _ARGUMENT_PARSER_LOADED
        source "$LIB_DIR/subagent-discovery.sh" 2>/dev/null
        declare -f validate_discovery_environment >/dev/null 2>&1
    )
}

test_initialize_subagent_discovery_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED _FIELD_VALIDATORS_LOADED _SUBAGENT_VALIDATOR_LOADED _VALIDATION_REPORTER_LOADED _EXECUTION_ENGINE_LOADED _EXECUTION_RESULTS_LOADED _EXECUTION_SIMULATION_LOADED _SUBAGENT_DISCOVERY_LOADED _ARGUMENT_PARSER_LOADED
        source "$LIB_DIR/subagent-discovery.sh" 2>/dev/null
        declare -f initialize_subagent_discovery >/dev/null 2>&1
    )
}

##################################
# Behavioral Tests
##################################
test_find_subagent_fails_for_nonexistent() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED _FIELD_VALIDATORS_LOADED _SUBAGENT_VALIDATOR_LOADED _VALIDATION_REPORTER_LOADED _EXECUTION_ENGINE_LOADED _EXECUTION_RESULTS_LOADED _EXECUTION_SIMULATION_LOADED _SUBAGENT_DISCOVERY_LOADED _ARGUMENT_PARSER_LOADED
        source "$LIB_DIR/subagent-discovery.sh" 2>/dev/null
        # Should fail for a subagent that does not exist
        if find_subagent "nonexistent-subagent-xyz" >/dev/null 2>&1; then
            return 1  # Should have failed
        fi
        return 0
    )
}

test_discover_available_subagents_empty_dir() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED _FIELD_VALIDATORS_LOADED _SUBAGENT_VALIDATOR_LOADED _VALIDATION_REPORTER_LOADED _EXECUTION_ENGINE_LOADED _EXECUTION_RESULTS_LOADED _EXECUTION_SIMULATION_LOADED _SUBAGENT_DISCOVERY_LOADED _ARGUMENT_PARSER_LOADED
        source "$LIB_DIR/subagent-discovery.sh" 2>/dev/null
        local empty_dir="$TEST_DIR/empty-subagents"
        mkdir -p "$empty_dir"
        # Should return success even with no subagents
        discover_available_subagents "$empty_dir" >/dev/null 2>&1
    )
}

test_get_subagents_for_event_no_config() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED _FIELD_VALIDATORS_LOADED _SUBAGENT_VALIDATOR_LOADED _VALIDATION_REPORTER_LOADED _EXECUTION_ENGINE_LOADED _EXECUTION_RESULTS_LOADED _EXECUTION_SIMULATION_LOADED _SUBAGENT_DISCOVERY_LOADED _ARGUMENT_PARSER_LOADED
        source "$LIB_DIR/subagent-discovery.sh" 2>/dev/null
        # Should return success even with no config file present
        get_subagents_for_event "pre_write" "$TEST_DIR/nonexistent-config.yaml" >/dev/null 2>&1
    )
}

test_get_priority_for_subagent_default_when_no_config() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED _FIELD_VALIDATORS_LOADED _SUBAGENT_VALIDATOR_LOADED _VALIDATION_REPORTER_LOADED _EXECUTION_ENGINE_LOADED _EXECUTION_RESULTS_LOADED _EXECUTION_SIMULATION_LOADED _SUBAGENT_DISCOVERY_LOADED _ARGUMENT_PARSER_LOADED
        source "$LIB_DIR/subagent-discovery.sh" 2>/dev/null
        local priority
        priority=$(get_priority_for_subagent "some-agent" "$TEST_DIR/nonexistent-config.yaml" 2>/dev/null)
        # Should return default priority (5) when no config file exists
        [[ "$priority" -eq 5 ]]
    )
}

test_initialize_subagent_discovery_succeeds() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED _FIELD_VALIDATORS_LOADED _SUBAGENT_VALIDATOR_LOADED _VALIDATION_REPORTER_LOADED _EXECUTION_ENGINE_LOADED _EXECUTION_RESULTS_LOADED _EXECUTION_SIMULATION_LOADED _SUBAGENT_DISCOVERY_LOADED _ARGUMENT_PARSER_LOADED
        source "$LIB_DIR/subagent-discovery.sh" 2>/dev/null
        initialize_subagent_discovery >/dev/null 2>&1
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
    run_test "find_subagent function exists" test_find_subagent_exists
    run_test "discover_available_subagents function exists" test_discover_available_subagents_exists
    run_test "get_all_available_subagents function exists" test_get_all_available_subagents_exists
    run_test "get_subagent_info function exists" test_get_subagent_info_exists
    run_test "list_subagents_with_info function exists" test_list_subagents_with_info_exists
    run_test "get_subagents_for_event function exists" test_get_subagents_for_event_exists
    run_test "get_priority_for_subagent function exists" test_get_priority_for_subagent_exists
    run_test "validate_discovery_environment function exists" test_validate_discovery_environment_exists
    run_test "initialize_subagent_discovery function exists" test_initialize_subagent_discovery_exists

    echo ""
    echo "Behavioral Tests:"
    run_test "find_subagent fails for nonexistent subagent" test_find_subagent_fails_for_nonexistent
    run_test "discover_available_subagents returns success on empty dir" test_discover_available_subagents_empty_dir
    run_test "get_subagents_for_event returns success with no config" test_get_subagents_for_event_no_config
    run_test "get_priority_for_subagent returns default when no config" test_get_priority_for_subagent_default_when_no_config
    run_test "initialize_subagent_discovery succeeds" test_initialize_subagent_discovery_succeeds

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
