#!/usr/bin/env bash
set -uo pipefail

# Test Suite: hooks/lib/context-manager.sh
#
# Purpose: Validate context gathering, management, validation, and cleanup functions
# Tests: Context creation, validation, cleanup, accessors, initialization

##################################
# Test Configuration
##################################
TEST_NAME="hooks/lib/context-manager.sh Test Suite"
TEST_DIR="/tmp/test-context-manager-$$"
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
    [[ -f "$LIB_DIR/context-manager.sh" ]] && [[ -r "$LIB_DIR/context-manager.sh" ]]
}

test_lib_syntax_valid() {
    bash -n "$LIB_DIR/context-manager.sh" 2>/dev/null
}

test_lib_is_sourceable() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
    )
}

##################################
# Include Guard Tests
##################################
test_include_guard_prevents_double_load() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        [[ "$_CONTEXT_MANAGER_LOADED" -eq 1 ]]
        # Source again - should return immediately via guard
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        [[ "$_CONTEXT_MANAGER_LOADED" -eq 1 ]]
    )
}

##################################
# Function Existence Tests
##################################
test_gather_basic_context_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        declare -f gather_basic_context >/dev/null 2>&1
    )
}

test_gather_claude_context_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        declare -f gather_claude_context >/dev/null 2>&1
    )
}

test_gather_git_context_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        declare -f gather_git_context >/dev/null 2>&1
    )
}

test_gather_file_context_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        declare -f gather_file_context >/dev/null 2>&1
    )
}

test_gather_system_context_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        declare -f gather_system_context >/dev/null 2>&1
    )
}

test_create_context_file_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        declare -f create_context_file >/dev/null 2>&1
    )
}

test_write_context_to_file_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        declare -f write_context_to_file >/dev/null 2>&1
    )
}

test_gather_complete_context_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        declare -f gather_complete_context >/dev/null 2>&1
    )
}

test_add_additional_context_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        declare -f add_additional_context >/dev/null 2>&1
    )
}

test_validate_context_data_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        declare -f validate_context_data >/dev/null 2>&1
    )
}

test_validate_context_file_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        declare -f validate_context_file >/dev/null 2>&1
    )
}

test_cleanup_context_file_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        declare -f cleanup_context_file >/dev/null 2>&1
    )
}

test_cleanup_all_context_files_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        declare -f cleanup_all_context_files >/dev/null 2>&1
    )
}

test_get_context_file_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        declare -f get_context_file >/dev/null 2>&1
    )
}

test_get_context_data_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        declare -f get_context_data >/dev/null 2>&1
    )
}

test_get_context_field_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        declare -f get_context_field >/dev/null 2>&1
    )
}

test_dump_context_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        declare -f dump_context >/dev/null 2>&1
    )
}

test_initialize_context_manager_exists() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        declare -f initialize_context_manager >/dev/null 2>&1
    )
}

##################################
# Context Gathering Behavior Tests
##################################
test_gather_basic_context_returns_json() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        gather_basic_context "pre_write" "test-agent" "" >/dev/null 2>&1
        local rc=$?
        [[ "$rc" -eq 0 ]] || return 1
        # Verify CONTEXT_DATA contains expected JSON structure
        [[ "$CONTEXT_DATA" == *'"metadata"'* ]] || return 1
        [[ "$CONTEXT_DATA" == *'"event"'* ]] || return 1
        [[ "$CONTEXT_DATA" == *'"environment"'* ]] || return 1
    )
}

test_gather_basic_context_sets_context_data() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        # CONTEXT_DATA should start empty
        [[ -z "$CONTEXT_DATA" ]] || return 1
        gather_basic_context "pre_write" "test-agent" "" >/dev/null 2>&1
        # After gathering, CONTEXT_DATA should be non-empty
        [[ -n "$CONTEXT_DATA" ]] || return 1
    )
}

test_gather_basic_context_contains_event_type() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        gather_basic_context "security_check" "my-agent" "" >/dev/null 2>&1
        [[ "$CONTEXT_DATA" == *'"type": "security_check"'* ]] || return 1
    )
}

test_gather_basic_context_contains_subagent_name() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        gather_basic_context "pre_write" "my-test-agent" "" >/dev/null 2>&1
        [[ "$CONTEXT_DATA" == *'"subagent": "my-test-agent"'* ]] || return 1
    )
}

##################################
# Context Validation Tests
##################################
test_validate_context_data_fails_on_empty() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        validate_context_data "" >/dev/null 2>&1
        local rc=$?
        [[ "$rc" -eq "$EXIT_VALIDATION_FAILED" ]]
    )
}

test_validate_context_data_succeeds_on_valid_json() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        gather_basic_context "pre_write" "test-agent" "" >/dev/null 2>&1
        validate_context_data "$CONTEXT_DATA" >/dev/null 2>&1
    )
}

##################################
# Context Cleanup Tests
##################################
test_cleanup_context_file_resets_globals() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        # Set some context data
        gather_basic_context "pre_write" "test-agent" "" >/dev/null 2>&1
        [[ -n "$CONTEXT_DATA" ]] || return 1
        # Cleanup should reset globals
        cleanup_context_file >/dev/null 2>&1
        [[ -z "$CONTEXT_FILE" ]] || return 1
        [[ -z "$CONTEXT_DATA" ]] || return 1
    )
}

##################################
# Context Accessor Tests
##################################
test_get_context_file_returns_empty_initially() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        local result
        result=$(get_context_file)
        [[ -z "$result" ]]
    )
}

test_get_context_data_returns_empty_initially() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        local result
        result=$(get_context_data)
        [[ -z "$result" ]]
    )
}

##################################
# Initialization Tests
##################################
test_initialize_context_manager_succeeds() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        initialize_context_manager >/dev/null 2>&1
    )
}

##################################
# Context Dump Tests
##################################
test_dump_context_outputs_data() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        gather_basic_context "pre_write" "test-agent" "" >/dev/null 2>&1
        local output
        output=$(dump_context "json" "$CONTEXT_DATA" 2>/dev/null)
        [[ -n "$output" ]]
    )
}

test_dump_context_text_format() {
    (
        export HOME="$TEST_DIR"
        unset _CONTEXT_MANAGER_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/context-manager.sh" 2>/dev/null
        gather_basic_context "pre_write" "test-agent" "" >/dev/null 2>&1
        local output
        output=$(dump_context "text" "$CONTEXT_DATA" 2>/dev/null)
        [[ "$output" == *"Context Summary"* ]]
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
    run_test "gather_basic_context exists" test_gather_basic_context_exists
    run_test "gather_claude_context exists" test_gather_claude_context_exists
    run_test "gather_git_context exists" test_gather_git_context_exists
    run_test "gather_file_context exists" test_gather_file_context_exists
    run_test "gather_system_context exists" test_gather_system_context_exists
    run_test "create_context_file exists" test_create_context_file_exists
    run_test "write_context_to_file exists" test_write_context_to_file_exists
    run_test "gather_complete_context exists" test_gather_complete_context_exists
    run_test "add_additional_context exists" test_add_additional_context_exists
    run_test "validate_context_data exists" test_validate_context_data_exists
    run_test "validate_context_file exists" test_validate_context_file_exists
    run_test "cleanup_context_file exists" test_cleanup_context_file_exists
    run_test "cleanup_all_context_files exists" test_cleanup_all_context_files_exists
    run_test "get_context_file exists" test_get_context_file_exists
    run_test "get_context_data exists" test_get_context_data_exists
    run_test "get_context_field exists" test_get_context_field_exists
    run_test "dump_context exists" test_dump_context_exists
    run_test "initialize_context_manager exists" test_initialize_context_manager_exists

    echo ""
    echo "Context Gathering Behavior Tests:"
    run_test "gather_basic_context returns JSON with expected structure" test_gather_basic_context_returns_json
    run_test "gather_basic_context sets CONTEXT_DATA" test_gather_basic_context_sets_context_data
    run_test "gather_basic_context contains event type" test_gather_basic_context_contains_event_type
    run_test "gather_basic_context contains subagent name" test_gather_basic_context_contains_subagent_name

    echo ""
    echo "Context Validation Tests:"
    run_test "validate_context_data fails on empty input" test_validate_context_data_fails_on_empty
    run_test "validate_context_data succeeds on valid JSON" test_validate_context_data_succeeds_on_valid_json

    echo ""
    echo "Context Cleanup Tests:"
    run_test "cleanup_context_file resets globals" test_cleanup_context_file_resets_globals

    echo ""
    echo "Context Accessor Tests:"
    run_test "get_context_file returns empty initially" test_get_context_file_returns_empty_initially
    run_test "get_context_data returns empty initially" test_get_context_data_returns_empty_initially

    echo ""
    echo "Initialization Tests:"
    run_test "initialize_context_manager succeeds" test_initialize_context_manager_succeeds

    echo ""
    echo "Context Dump Tests:"
    run_test "dump_context outputs data" test_dump_context_outputs_data
    run_test "dump_context text format includes summary header" test_dump_context_text_format

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
