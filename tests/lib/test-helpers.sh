#!/usr/bin/env bash
# Shared test helpers for all test suites
#
# Usage: source this file after setting TEST_NAME and TEST_DIR
#
#   TEST_NAME="My Test Suite"
#   TEST_DIR="/tmp/test-my-module-$$"
#   SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
#   LIB_DIR="$SCRIPT_DIR/hooks/lib"
#   source "$(dirname "$0")/lib/test-helpers.sh"

# Guard against double-sourcing
[[ -n "${_TEST_HELPERS_LOADED:-}" ]] && return 0
_TEST_HELPERS_LOADED=1

##################################
# Colors for test output
##################################
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

##################################
# Test counters
##################################
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

##################################
# Test runner
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

skip_test() {
    local test_name="$1"
    local reason="${2:-bash < 4}"

    echo -n "Running: $test_name... "
    echo -e "(skipped: $reason) ${GREEN}PASSED${NC}"
    ((TESTS_RUN++))
    ((TESTS_SKIPPED++))
    ((TESTS_PASSED++))
}

##################################
# Bash version check
##################################
has_bash4() {
    [[ "${BASH_VERSINFO[0]}" -ge 4 ]]
}

##################################
# Default setup/cleanup
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
# Test header and summary
##################################
print_test_header() {
    echo "========================================="
    echo "$TEST_NAME"
    echo "========================================="
    echo ""
}

print_test_summary() {
    echo ""
    echo "========================================="
    echo "Test Summary"
    echo "========================================="
    echo "Tests Run: $TESTS_RUN"
    echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
    if [[ $TESTS_SKIPPED -gt 0 ]]; then
        echo "Tests Skipped: $TESTS_SKIPPED (bash 4+ required; install with: brew install bash)"
    fi

    if [[ $TESTS_FAILED -gt 0 ]]; then
        echo -e "\n${RED}Some tests failed!${NC}"
        exit 1
    elif [[ $TESTS_SKIPPED -gt 0 ]]; then
        echo -e "\n${GREEN}All executed tests passed${NC} ($TESTS_SKIPPED skipped)"
        exit 0
    else
        echo -e "\n${GREEN}All tests passed!${NC}"
        exit 0
    fi
}

##################################
# Parameterized library checks
##################################
test_lib_file_exists() {
    local lib_file="$1"
    [[ -f "$lib_file" ]] && [[ -r "$lib_file" ]]
}

test_lib_file_syntax_valid() {
    local lib_file="$1"
    bash -n "$lib_file" 2>/dev/null
}

test_lib_file_sourceable() {
    local lib_file="$1"
    shift
    (
        export HOME="$TEST_DIR"
        for var in "$@"; do
            unset "$var"
        done
        source "$lib_file" 2>/dev/null
    )
}

##################################
# Trap setup
##################################
setup_test_trap() {
    trap cleanup_test_environment EXIT INT TERM
}
