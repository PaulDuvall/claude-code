#!/usr/bin/env bash
set -uo pipefail

# Test Suite: hooks/lib/config-constants.sh
#
# Purpose: Validate configuration constants and utility functions
# Tests: Constants defined, event validation, tool detection, timeouts

##################################
# Test Configuration
##################################
TEST_NAME="hooks/lib/config-constants.sh Test Suite"
TEST_DIR="/tmp/test-config-constants-$$"
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
# Constants Definition Tests
##################################
test_lib_exists() {
    [[ -f "$LIB_DIR/config-constants.sh" ]] && [[ -r "$LIB_DIR/config-constants.sh" ]]
}

test_lib_is_sourceable() {
    (
        export HOME="$TEST_DIR"
        source "$LIB_DIR/config-constants.sh" 2>/dev/null
    )
}

test_exit_codes_defined() {
    (
        export HOME="$TEST_DIR"
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/config-constants.sh"
        [[ "$EXIT_SUCCESS" -eq 0 ]] &&
        [[ "$EXIT_GENERAL_ERROR" -eq 1 ]] &&
        [[ "$EXIT_VALIDATION_FAILED" -eq 2 ]] &&
        [[ "$EXIT_SUBAGENT_NOT_FOUND" -eq 3 ]] &&
        [[ "$EXIT_EXECUTION_FAILED" -eq 4 ]] &&
        [[ "$EXIT_TIMEOUT" -eq 5 ]] &&
        [[ "$EXIT_SECURITY_VIOLATION" -eq 6 ]]
    )
}

test_directory_constants_defined() {
    (
        export HOME="$TEST_DIR"
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/config-constants.sh"
        [[ -n "$CLAUDE_BASE_DIR" ]] &&
        [[ -n "$SUBAGENTS_DIR" ]] &&
        [[ -n "$LOGS_DIR" ]]
    )
}

test_permission_constants_defined() {
    (
        export HOME="$TEST_DIR"
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/config-constants.sh"
        [[ "$SECURE_DIR_PERMISSIONS" -eq 700 ]] &&
        [[ "$SECURE_FILE_PERMISSIONS" -eq 600 ]] &&
        [[ "$EXECUTABLE_PERMISSIONS" -eq 755 ]]
    )
}

test_timeout_constants_defined() {
    (
        export HOME="$TEST_DIR"
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/config-constants.sh"
        [[ "$DEFAULT_TIMEOUT" -gt 0 ]] &&
        [[ "$MAX_SUBAGENT_TIMEOUT" -gt "$DEFAULT_TIMEOUT" ]]
    )
}

test_version_defined() {
    (
        export HOME="$TEST_DIR"
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/config-constants.sh"
        [[ -n "$SUBAGENT_HOOK_VERSION" ]] &&
        [[ -n "$API_VERSION" ]]
    )
}

##################################
# Event Validation Tests
##################################
test_is_supported_event_valid() {
    (
        export HOME="$TEST_DIR"
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/config-constants.sh"
        is_supported_event "pre_write"
    )
}

test_is_supported_event_invalid() {
    (
        export HOME="$TEST_DIR"
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/config-constants.sh"
        ! is_supported_event "nonexistent_event"
    )
}

test_is_supported_event_security_check() {
    (
        export HOME="$TEST_DIR"
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/config-constants.sh"
        is_supported_event "security_check"
    )
}

test_is_supported_event_on_error() {
    (
        export HOME="$TEST_DIR"
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/config-constants.sh"
        is_supported_event "on_error"
    )
}

##################################
# Tool Detection Tests
##################################
test_is_file_modification_tool_edit() {
    (
        export HOME="$TEST_DIR"
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/config-constants.sh"
        is_file_modification_tool "Edit"
    )
}

test_is_file_modification_tool_write() {
    (
        export HOME="$TEST_DIR"
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/config-constants.sh"
        is_file_modification_tool "Write"
    )
}

test_is_file_modification_tool_multi_edit() {
    (
        export HOME="$TEST_DIR"
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/config-constants.sh"
        is_file_modification_tool "MultiEdit"
    )
}

test_is_file_modification_tool_bash_rejected() {
    (
        export HOME="$TEST_DIR"
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/config-constants.sh"
        ! is_file_modification_tool "Bash"
    )
}

test_is_file_modification_tool_read_rejected() {
    (
        export HOME="$TEST_DIR"
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/config-constants.sh"
        ! is_file_modification_tool "Read"
    )
}

##################################
# Timeout Function Tests
##################################
test_get_timeout_for_security_check() {
    (
        export HOME="$TEST_DIR"
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/config-constants.sh"
        local timeout
        timeout=$(get_timeout_for_event "security_check")
        [[ "$timeout" -eq "$SECURITY_CHECK_TIMEOUT" ]]
    )
}

test_get_timeout_for_on_error() {
    (
        export HOME="$TEST_DIR"
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/config-constants.sh"
        local timeout
        timeout=$(get_timeout_for_event "on_error")
        [[ "$timeout" -eq "$DEBUG_TIMEOUT" ]]
    )
}

test_get_timeout_for_unknown_event() {
    (
        export HOME="$TEST_DIR"
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/config-constants.sh"
        local timeout
        timeout=$(get_timeout_for_event "unknown_event")
        [[ "$timeout" -eq "$DEFAULT_TIMEOUT" ]]
    )
}

##################################
# Include Guard Tests
##################################
test_include_guard_prevents_double_load() {
    (
        export HOME="$TEST_DIR"
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/config-constants.sh"
        [[ "$CONFIG_CONSTANTS_LOADED" -eq 1 ]]
        # Source again - should return immediately
        source "$LIB_DIR/config-constants.sh"
        [[ "$CONFIG_CONSTANTS_LOADED" -eq 1 ]]
    )
}

##################################
# Regex Pattern Tests
##################################
test_subagent_name_pattern_valid() {
    (
        export HOME="$TEST_DIR"
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/config-constants.sh"
        [[ "security-auditor" =~ $SUBAGENT_NAME_PATTERN ]]
    )
}

test_subagent_name_pattern_rejects_uppercase() {
    (
        export HOME="$TEST_DIR"
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/config-constants.sh"
        ! [[ "Security-Auditor" =~ $SUBAGENT_NAME_PATTERN ]]
    )
}

test_subagent_name_pattern_rejects_leading_number() {
    (
        export HOME="$TEST_DIR"
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/config-constants.sh"
        ! [[ "1security" =~ $SUBAGENT_NAME_PATTERN ]]
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

    echo "Constants Definition Tests:"
    run_test "Library file exists" test_lib_exists
    run_test "Library is sourceable" test_lib_is_sourceable
    run_test "Exit codes defined correctly" test_exit_codes_defined
    run_test "Directory constants defined" test_directory_constants_defined
    run_test "Permission constants defined" test_permission_constants_defined
    run_test "Timeout constants defined" test_timeout_constants_defined
    run_test "Version info defined" test_version_defined

    echo ""
    echo "Event Validation Tests:"
    run_test "pre_write is supported event" test_is_supported_event_valid
    run_test "nonexistent_event is rejected" test_is_supported_event_invalid
    run_test "security_check is supported" test_is_supported_event_security_check
    run_test "on_error is supported" test_is_supported_event_on_error

    echo ""
    echo "Tool Detection Tests:"
    run_test "Edit is file mod tool" test_is_file_modification_tool_edit
    run_test "Write is file mod tool" test_is_file_modification_tool_write
    run_test "MultiEdit is file mod tool" test_is_file_modification_tool_multi_edit
    run_test "Bash is not file mod tool" test_is_file_modification_tool_bash_rejected
    run_test "Read is not file mod tool" test_is_file_modification_tool_read_rejected

    echo ""
    echo "Timeout Function Tests:"
    run_test "Security check gets correct timeout" test_get_timeout_for_security_check
    run_test "on_error gets debug timeout" test_get_timeout_for_on_error
    run_test "Unknown event gets default timeout" test_get_timeout_for_unknown_event

    echo ""
    echo "Include Guard Tests:"
    run_test "Include guard prevents double load" test_include_guard_prevents_double_load

    echo ""
    echo "Regex Pattern Tests:"
    run_test "Valid subagent name accepted" test_subagent_name_pattern_valid
    run_test "Uppercase subagent name rejected" test_subagent_name_pattern_rejects_uppercase
    run_test "Leading number rejected" test_subagent_name_pattern_rejects_leading_number

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
