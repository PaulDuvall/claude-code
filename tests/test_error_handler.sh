#!/usr/bin/env bash
set -uo pipefail

# Test Suite: hooks/lib/error-handler.sh
#
# Purpose: Validate error handling, logging, and recovery functions
# Tests: Logging functions, error handlers, recovery, cleanup, initialization

##################################
# Test Configuration
##################################
TEST_NAME="hooks/lib/error-handler.sh Test Suite"
TEST_DIR="/tmp/test-error-handler-$$"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LIB_DIR="$SCRIPT_DIR/hooks/lib"
source "$(dirname "$0")/lib/test-helpers.sh"

##################################
# Module Existence and Syntax Tests
##################################
test_lib_exists() {
    [[ -f "$LIB_DIR/error-handler.sh" ]] && [[ -r "$LIB_DIR/error-handler.sh" ]]
}

test_lib_syntax_valid() {
    bash -n "$LIB_DIR/error-handler.sh" 2>/dev/null
}

test_lib_is_sourceable() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
    )
}

##################################
# Include Guard Tests
##################################
test_include_guard_prevents_double_load() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        [[ "$_ERROR_HANDLER_LOADED" -eq 1 ]]
        # Source again - should return immediately via guard
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        [[ "$_ERROR_HANDLER_LOADED" -eq 1 ]]
    )
}

##################################
# Logging Function Existence Tests
##################################
test_log_info_exists() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        declare -f log_info >/dev/null 2>&1
    )
}

test_log_warning_exists() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        declare -f log_warning >/dev/null 2>&1
    )
}

test_log_error_exists() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        declare -f log_error >/dev/null 2>&1
    )
}

test_log_critical_exists() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        declare -f log_critical >/dev/null 2>&1
    )
}

test_log_debug_exists() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        declare -f log_debug >/dev/null 2>&1
    )
}

test_log_message_exists() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        declare -f log_message >/dev/null 2>&1
    )
}

test_log_violation_exists() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        declare -f log_violation >/dev/null 2>&1
    )
}

##################################
# Logging Behavior Tests
##################################
test_log_info_callable() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        log_info "test info message" >/dev/null 2>&1
    )
}

test_log_warning_callable() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        log_warning "test warning message" >/dev/null 2>&1
    )
}

test_log_error_callable() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        log_error "test error message" >/dev/null 2>&1
    )
}

test_log_debug_silent_by_default() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        unset DEBUG
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        local output
        output=$(log_debug "should not appear" 2>&1)
        [[ -z "$output" ]]
    )
}

test_log_debug_outputs_when_debug_true() {
    (
        export HOME="$TEST_DIR"
        export DEBUG="true"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        local output
        output=$(log_debug "debug visible" 2>&1)
        [[ "$output" == *"debug visible"* ]]
    )
}

##################################
# Error Handler Exit Code Tests
##################################
test_handle_missing_subagent_exit_code() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        handle_missing_subagent "nonexistent-agent" >/dev/null 2>&1
        local rc=$?
        [[ "$rc" -eq "$EXIT_SUBAGENT_NOT_FOUND" ]]
    )
}

test_handle_validation_failure_exit_code() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        handle_validation_failure "test-agent" "missing required field" >/dev/null 2>&1
        local rc=$?
        [[ "$rc" -eq "$EXIT_VALIDATION_FAILED" ]]
    )
}

test_handle_execution_failure_exit_code() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        handle_execution_failure "test-agent" "process crashed" >/dev/null 2>&1
        local rc=$?
        [[ "$rc" -eq "$EXIT_EXECUTION_FAILED" ]]
    )
}

test_handle_timeout_exit_code() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        handle_timeout "test-agent" "30" >/dev/null 2>&1
        local rc=$?
        [[ "$rc" -eq "$EXIT_TIMEOUT" ]]
    )
}

test_handle_security_violation_exit_code() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        handle_security_violation "path_traversal" "attempted escape" "/etc/passwd" >/dev/null 2>&1
        local rc=$?
        [[ "$rc" -eq "$EXIT_SECURITY_VIOLATION" ]]
    )
}

test_handle_filesystem_error_exit_code() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        handle_filesystem_error "read" "/nonexistent" "file not found" >/dev/null 2>&1
        local rc=$?
        [[ "$rc" -eq "$EXIT_GENERAL_ERROR" ]]
    )
}

##################################
# Recovery Function Tests
##################################
test_attempt_recovery_corrupted_config() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        attempt_recovery "corrupted_config" "test context" >/dev/null 2>&1
        local rc=$?
        [[ "$rc" -eq "$EXIT_SUCCESS" ]]
    )
}

test_attempt_recovery_unknown_type() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        attempt_recovery "unknown_error_type" "test context" >/dev/null 2>&1
        local rc=$?
        [[ "$rc" -eq "$EXIT_GENERAL_ERROR" ]]
    )
}

##################################
# Dependency Validation Tests
##################################
test_validate_error_handler_dependencies_succeeds() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        validate_error_handler_dependencies >/dev/null 2>&1
    )
}

##################################
# Initialization Tests
##################################
test_initialize_error_handling_succeeds() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        initialize_error_handling >/dev/null 2>&1
    )
}

##################################
# Error Handler Function Existence Tests
##################################
test_handle_missing_subagent_exists() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        declare -f handle_missing_subagent >/dev/null 2>&1
    )
}

test_handle_validation_failure_exists() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        declare -f handle_validation_failure >/dev/null 2>&1
    )
}

test_handle_execution_failure_exists() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        declare -f handle_execution_failure >/dev/null 2>&1
    )
}

test_handle_timeout_exists() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        declare -f handle_timeout >/dev/null 2>&1
    )
}

test_handle_security_violation_exists() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        declare -f handle_security_violation >/dev/null 2>&1
    )
}

test_emergency_cleanup_exists() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        declare -f emergency_cleanup >/dev/null 2>&1
    )
}

test_attempt_recovery_exists() {
    (
        export HOME="$TEST_DIR"
        unset _ERROR_HANDLER_LOADED
        unset _FILE_UTILS_LOADED
        unset CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/error-handler.sh" 2>/dev/null
        declare -f attempt_recovery >/dev/null 2>&1
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
    echo "Logging Function Existence Tests:"
    run_test "log_message function exists" test_log_message_exists
    run_test "log_info function exists" test_log_info_exists
    run_test "log_warning function exists" test_log_warning_exists
    run_test "log_error function exists" test_log_error_exists
    run_test "log_critical function exists" test_log_critical_exists
    run_test "log_debug function exists" test_log_debug_exists
    run_test "log_violation function exists" test_log_violation_exists

    echo ""
    echo "Logging Behavior Tests:"
    run_test "log_info is callable" test_log_info_callable
    run_test "log_warning is callable" test_log_warning_callable
    run_test "log_error is callable" test_log_error_callable
    run_test "log_debug silent when DEBUG unset" test_log_debug_silent_by_default
    run_test "log_debug outputs when DEBUG=true" test_log_debug_outputs_when_debug_true

    echo ""
    echo "Error Handler Function Existence Tests:"
    run_test "handle_missing_subagent exists" test_handle_missing_subagent_exists
    run_test "handle_validation_failure exists" test_handle_validation_failure_exists
    run_test "handle_execution_failure exists" test_handle_execution_failure_exists
    run_test "handle_timeout exists" test_handle_timeout_exists
    run_test "handle_security_violation exists" test_handle_security_violation_exists
    run_test "emergency_cleanup exists" test_emergency_cleanup_exists
    run_test "attempt_recovery exists" test_attempt_recovery_exists

    echo ""
    echo "Error Handler Exit Code Tests:"
    run_test "handle_missing_subagent returns EXIT_SUBAGENT_NOT_FOUND" test_handle_missing_subagent_exit_code
    run_test "handle_validation_failure returns EXIT_VALIDATION_FAILED" test_handle_validation_failure_exit_code
    run_test "handle_execution_failure returns EXIT_EXECUTION_FAILED" test_handle_execution_failure_exit_code
    run_test "handle_timeout returns EXIT_TIMEOUT" test_handle_timeout_exit_code
    run_test "handle_security_violation returns EXIT_SECURITY_VIOLATION" test_handle_security_violation_exit_code
    run_test "handle_filesystem_error returns EXIT_GENERAL_ERROR" test_handle_filesystem_error_exit_code

    echo ""
    echo "Recovery Function Tests:"
    run_test "attempt_recovery handles corrupted_config" test_attempt_recovery_corrupted_config
    run_test "attempt_recovery returns error for unknown type" test_attempt_recovery_unknown_type

    echo ""
    echo "Dependency and Initialization Tests:"
    run_test "validate_error_handler_dependencies succeeds" test_validate_error_handler_dependencies_succeeds
    run_test "initialize_error_handling succeeds" test_initialize_error_handling_succeeds

    cleanup_test_environment

    print_test_summary
}

setup_test_trap

main "$@"
