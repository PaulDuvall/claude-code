#!/usr/bin/env bash
set -uo pipefail

# Test Suite: lib/logging.sh
#
# Purpose: Validate the shared logging utilities
# Tests: Color output, file logging, log levels, structured formats

##################################
# Test Configuration
##################################
TEST_NAME="lib/logging.sh Test Suite"
TEST_DIR="/tmp/test-logging-$$"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOGGING_LIB="$SCRIPT_DIR/lib/logging.sh"

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
}

cleanup_test_environment() {
    echo "Cleaning up test environment..."
    rm -rf "$TEST_DIR"
}

reset_logging_vars() {
    # Reset logging variables to defaults
    unset LOG_FILE LOG_FORMAT LOG_LEVEL LOG_TIMESTAMPS LOG_SCRIPT_NAME LOG_NO_COLOR
}

##################################
# Test Utility Functions
##################################
run_test() {
    local test_name="$1"
    local test_function="$2"

    echo -n "Running: $test_name... "
    ((TESTS_RUN++))

    reset_logging_vars

    if $test_function; then
        echo -e "${GREEN}PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}FAILED${NC}"
        ((TESTS_FAILED++))
    fi
}

##################################
# Basic Functionality Tests
##################################
test_lib_exists() {
    [[ -f "$LOGGING_LIB" ]] && [[ -r "$LOGGING_LIB" ]]
}

test_lib_is_sourceable() {
    (source "$LOGGING_LIB" 2>/dev/null)
}

test_log_info_outputs() {
    source "$LOGGING_LIB"
    local output
    output=$(log_info "test message" 2>&1)
    [[ "$output" == *"INFO"* ]] && [[ "$output" == *"test message"* ]]
}

test_log_success_outputs() {
    source "$LOGGING_LIB"
    local output
    output=$(log_success "success message" 2>&1)
    [[ "$output" == *"SUCCESS"* ]] && [[ "$output" == *"success message"* ]]
}

test_log_warning_outputs() {
    source "$LOGGING_LIB"
    local output
    output=$(log_warning "warning message" 2>&1)
    [[ "$output" == *"WARNING"* ]] && [[ "$output" == *"warning message"* ]]
}

test_log_error_outputs() {
    source "$LOGGING_LIB"
    local output
    output=$(log_error "error message" 2>&1)
    [[ "$output" == *"ERROR"* ]] && [[ "$output" == *"error message"* ]]
}

##################################
# File Logging Tests
##################################
test_log_set_file() {
    source "$LOGGING_LIB"
    local log_file="$TEST_DIR/test.log"
    log_set_file "$log_file"
    [[ "$LOG_FILE" == "$log_file" ]]
}

test_log_writes_to_file() {
    source "$LOGGING_LIB"
    local log_file="$TEST_DIR/write_test.log"
    log_set_file "$log_file"

    log_info "file test message" > /dev/null 2>&1

    [[ -f "$log_file" ]] && grep -q "file test message" "$log_file"
}

test_log_file_contains_timestamp() {
    source "$LOGGING_LIB"
    local log_file="$TEST_DIR/timestamp_test.log"
    log_set_file "$log_file"

    log_info "timestamp test" > /dev/null 2>&1

    # Check for date pattern YYYY-MM-DD
    [[ -f "$log_file" ]] && grep -qE '\[[0-9]{4}-[0-9]{2}-[0-9]{2}' "$log_file"
}

test_log_creates_directory() {
    source "$LOGGING_LIB"
    local log_file="$TEST_DIR/subdir/nested/test.log"
    log_set_file "$log_file"

    log_info "nested dir test" > /dev/null 2>&1

    [[ -d "$TEST_DIR/subdir/nested" ]]
}

##################################
# Log Level Tests
##################################
test_log_level_filters_debug() {
    source "$LOGGING_LIB"
    export LOG_LEVEL="info"

    local output
    output=$(log_debug "debug message" 2>&1)

    # Debug should be filtered out when level is info
    [[ -z "$output" ]]
}

test_log_level_shows_debug_when_enabled() {
    source "$LOGGING_LIB"
    export LOG_LEVEL="debug"

    local output
    output=$(log_debug "debug message" 2>&1)

    [[ "$output" == *"DEBUG"* ]] && [[ "$output" == *"debug message"* ]]
}

test_log_level_error_shows_only_errors() {
    source "$LOGGING_LIB"
    export LOG_LEVEL="error"

    local info_output warn_output error_output
    info_output=$(log_info "info message" 2>&1)
    warn_output=$(log_warning "warn message" 2>&1)
    error_output=$(log_error "error message" 2>&1)

    [[ -z "$info_output" ]] && [[ -z "$warn_output" ]] && [[ -n "$error_output" ]]
}

##################################
# Format Tests
##################################
test_structured_format() {
    source "$LOGGING_LIB"
    local log_file="$TEST_DIR/structured.log"
    export LOG_FORMAT="structured"
    log_set_file "$log_file"

    log_info "structured test" > /dev/null 2>&1

    # Should have script name in brackets
    [[ -f "$log_file" ]] && grep -qE '\[.*\] \[INFO\]' "$log_file"
}

test_json_format() {
    source "$LOGGING_LIB"
    local log_file="$TEST_DIR/json.log"
    export LOG_FORMAT="json"
    log_set_file "$log_file"

    log_info "json test" > /dev/null 2>&1

    # Should be valid JSON-like
    [[ -f "$log_file" ]] && grep -q '"level":"INFO"' "$log_file" && grep -q '"message":"json test"' "$log_file"
}

##################################
# Color Tests
##################################
test_no_color_env_var() {
    source "$LOGGING_LIB"
    export LOG_NO_COLOR="true"

    local output
    output=$(log_info "no color test" 2>&1)

    # Should NOT contain ANSI escape codes
    ! echo "$output" | grep -q $'\033'
}

##################################
# Init and Section Tests
##################################
test_log_init_sets_script_name() {
    source "$LOGGING_LIB"
    local log_file="$TEST_DIR/init.log"
    export LOG_FORMAT="structured"
    log_set_file "$log_file"

    log_init "custom-script-name"
    log_info "init test" > /dev/null 2>&1

    [[ -f "$log_file" ]] && grep -q "custom-script-name" "$log_file"
}

test_log_section_outputs() {
    source "$LOGGING_LIB"
    export LOG_NO_COLOR="true"

    local output
    output=$(log_section "Test Section" 2>&1)

    [[ "$output" == *"Test Section"* ]] && [[ "$output" == *"="* ]]
}

test_log_critical_always_shown() {
    source "$LOGGING_LIB"
    export LOG_LEVEL="error"  # Even with error level

    local output
    output=$(log_critical "critical message" 2>&1)

    [[ "$output" == *"CRITICAL"* ]] && [[ "$output" == *"critical message"* ]]
}

##################################
# Compatibility Tests
##################################
test_log_warn_alias() {
    source "$LOGGING_LIB"
    local output
    output=$(log_warn "warn alias test" 2>&1)
    [[ "$output" == *"WARNING"* ]]
}

test_log_err_alias() {
    source "$LOGGING_LIB"
    local output
    output=$(log_err "error alias test" 2>&1)
    [[ "$output" == *"ERROR"* ]]
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

    echo "Basic Functionality Tests:"
    run_test "Library file exists" test_lib_exists
    run_test "Library is sourceable" test_lib_is_sourceable
    run_test "log_info outputs correctly" test_log_info_outputs
    run_test "log_success outputs correctly" test_log_success_outputs
    run_test "log_warning outputs correctly" test_log_warning_outputs
    run_test "log_error outputs correctly" test_log_error_outputs

    echo ""
    echo "File Logging Tests:"
    run_test "log_set_file sets path" test_log_set_file
    run_test "Logs write to file" test_log_writes_to_file
    run_test "File logs have timestamps" test_log_file_contains_timestamp
    run_test "Creates nested directories" test_log_creates_directory

    echo ""
    echo "Log Level Tests:"
    run_test "Info level filters debug" test_log_level_filters_debug
    run_test "Debug level shows debug" test_log_level_shows_debug_when_enabled
    run_test "Error level filters others" test_log_level_error_shows_only_errors

    echo ""
    echo "Format Tests:"
    run_test "Structured format works" test_structured_format
    run_test "JSON format works" test_json_format

    echo ""
    echo "Color Tests:"
    run_test "NO_COLOR disables colors" test_no_color_env_var

    echo ""
    echo "Init and Section Tests:"
    run_test "log_init sets script name" test_log_init_sets_script_name
    run_test "log_section outputs header" test_log_section_outputs
    run_test "log_critical always shown" test_log_critical_always_shown

    echo ""
    echo "Compatibility Tests:"
    run_test "log_warn alias works" test_log_warn_alias
    run_test "log_err alias works" test_log_err_alias

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
