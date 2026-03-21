#!/usr/bin/env bash
set -uo pipefail

# Test Suite: hooks/subagent-trigger.sh
#
# Purpose: Functional tests for the full subagent event trigger hook
# Tests: File existence, syntax, help flags, argument parsing

##################################
# Test Configuration
##################################
TEST_NAME="hooks/subagent-trigger.sh Test Suite"
TEST_DIR="/tmp/test-subagent-trigger-$$"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HOOK_PATH="$SCRIPT_DIR/hooks/subagent-trigger.sh"

# Colors for test output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

##################################
# Bash Version Check
##################################
has_bash4() { [[ "${BASH_VERSINFO[0]}" -ge 4 ]]; }
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
# Hook Existence Tests
##################################
test_hook_exists() {
    [[ -f "$HOOK_PATH" ]] && [[ -r "$HOOK_PATH" ]]
}

test_hook_syntax_valid() {
    bash -n "$HOOK_PATH" 2>/dev/null
}

test_hook_is_parseable() {
    bash -n "$HOOK_PATH"
}

##################################
# Help Flag Tests
##################################
test_help_long_flag() {
    requires_bash4 && return 0
    local output exit_code
    output=$(bash "$HOOK_PATH" --help 2>&1)
    exit_code=$?
    [[ $exit_code -eq 0 ]] && echo "$output" | grep -qi "usage\|subagent-trigger"
}

test_help_short_flag() {
    requires_bash4 && return 0
    bash "$HOOK_PATH" -h >/dev/null 2>&1
}

##################################
# Argument Parsing Tests
##################################
test_no_args_exits_nonzero() {
    requires_bash4 && return 0
    bash "$HOOK_PATH" >/dev/null 2>&1
    [[ $? -ne 0 ]]
}

test_no_args_shows_usage() {
    requires_bash4 && return 0
    local output
    output=$(bash "$HOOK_PATH" 2>&1)
    echo "$output" | grep -qi "usage\|subagent\|error\|argument"
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

    echo "Hook Existence Tests:"
    run_test "Hook file exists" test_hook_exists
    run_test "Hook syntax is valid" test_hook_syntax_valid
    run_test "Hook is parseable" test_hook_is_parseable

    echo ""
    echo "Help Flag Tests:"
    run_test "Shows help with --help flag" test_help_long_flag
    run_test "Shows help with -h flag" test_help_short_flag

    echo ""
    echo "Argument Parsing Tests:"
    run_test "Exits non-zero with no arguments" test_no_args_exits_nonzero
    run_test "Shows usage info on error" test_no_args_shows_usage

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
