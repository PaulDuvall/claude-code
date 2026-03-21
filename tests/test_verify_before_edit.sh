#!/usr/bin/env bash
set -uo pipefail

# Test Suite: hooks/verify-before-edit.sh
#
# Purpose: Functional tests for verify-before-edit hook
# Tests: Placeholder detection, fabricated ID detection, file skipping

##################################
# Test Configuration
##################################
TEST_NAME="hooks/verify-before-edit.sh Test Suite"
TEST_DIR="/tmp/vbe-check-$$"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HOOK_PATH="$SCRIPT_DIR/hooks/verify-before-edit.sh"

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
    mkdir -p "$TEST_DIR/.claude/logs"
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

##################################
# Tool Filtering Tests
##################################
test_skips_bash_tool() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Bash"
        export CLAUDE_FILE=""
        export CLAUDE_CONTENT=""
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_skips_read_tool() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Read"
        export CLAUDE_FILE=""
        export CLAUDE_CONTENT=""
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_processes_edit_tool() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Edit"
        export CLAUDE_FILE=""
        export CLAUDE_CONTENT="clean content"
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_processes_write_tool() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Write"
        export CLAUDE_FILE=""
        export CLAUDE_CONTENT="clean content"
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

##################################
# File Skipping Tests
##################################
test_skips_test_file() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Edit"
        export CLAUDE_FILE="src/test_something.py"
        export CLAUDE_CONTENT="your-api-key-here"
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_skips_spec_file() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Edit"
        export CLAUDE_FILE="components/Button.spec.tsx"
        export CLAUDE_CONTENT="REPLACE_ME"
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_skips_example_file() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Edit"
        export CLAUDE_FILE="docs/example_config.py"
        export CLAUDE_CONTENT="placeholder value"
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_skips_fixture_file() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Edit"
        export CLAUDE_FILE="tests/fixtures/data.json"
        export CLAUDE_CONTENT="000000"
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_skips_mock_file() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Edit"
        export CLAUDE_FILE="src/mock_service.py"
        export CLAUDE_CONTENT="123456"
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

##################################
# Placeholder Detection Tests
##################################
test_detects_api_key_placeholder() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Edit"
        export CLAUDE_FILE="$TEST_DIR/config.py"
        echo 'API_KEY = "your-api-key-here"' > "$TEST_DIR/config.py"
        export CLAUDE_CONTENT=""
        local output
        output=$(bash "$HOOK_PATH" 2>&1)
        echo "$output" | grep -qi "placeholder\|suspicious"
    )
}

test_detects_replace_me() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Write"
        export CLAUDE_FILE="$TEST_DIR/settings.json"
        echo '{"key": "REPLACE_ME"}' > "$TEST_DIR/settings.json"
        export CLAUDE_CONTENT=""
        local output
        output=$(bash "$HOOK_PATH" 2>&1)
        echo "$output" | grep -qi "placeholder\|suspicious\|REPLACE"
    )
}

test_detects_insert_placeholder() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Edit"
        export CLAUDE_FILE="$TEST_DIR/template.yml"
        echo 'value: <INSERT>' > "$TEST_DIR/template.yml"
        export CLAUDE_CONTENT=""
        local output
        output=$(bash "$HOOK_PATH" 2>&1)
        echo "$output" | grep -qi "placeholder\|suspicious\|INSERT"
    )
}

test_detects_placeholder_keyword() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Edit"
        export CLAUDE_CONTENT="token = placeholder_value"
        export CLAUDE_FILE="$TEST_DIR/app.conf"
        echo "$CLAUDE_CONTENT" > "$TEST_DIR/app.conf"
        local output
        output=$(bash "$HOOK_PATH" 2>&1)
        echo "$output" | grep -qi "placeholder\|suspicious"
    )
}

##################################
# Fabricated ID Detection Tests
##################################
test_detects_sequential_zeros() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Edit"
        export CLAUDE_FILE="$TEST_DIR/ids.json"
        echo '{"account_id": "000000"}' > "$TEST_DIR/ids.json"
        export CLAUDE_CONTENT=""
        local output
        output=$(bash "$HOOK_PATH" 2>&1)
        echo "$output" | grep -qi "sequential\|zero\|ID\|check"
    )
}

test_detects_sequential_numbers() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Edit"
        export CLAUDE_FILE="$TEST_DIR/data.json"
        echo '{"user_id": "123456"}' > "$TEST_DIR/data.json"
        export CLAUDE_CONTENT=""
        local output
        output=$(bash "$HOOK_PATH" 2>&1)
        echo "$output" | grep -qi "sequential\|zero\|ID\|check"
    )
}

##################################
# Clean Content Tests
##################################
test_allows_clean_content() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Edit"
        export CLAUDE_FILE="$TEST_DIR/clean.py"
        cat > "$TEST_DIR/clean.py" <<'CONTENT'
def calculate_total(items):
    return sum(item.price for item in items)
CONTENT
        export CLAUDE_CONTENT=""
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_allows_empty_content() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Edit"
        export CLAUDE_FILE=""
        export CLAUDE_CONTENT=""
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

##################################
# Exit Code Tests
##################################
test_always_exits_zero() {
    # This hook is non-blocking, so it should always exit 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Edit"
        export CLAUDE_FILE="$TEST_DIR/placeholder.py"
        echo 'KEY = "your-api-key-here"' > "$TEST_DIR/placeholder.py"
        export CLAUDE_CONTENT=""
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

##################################
# Logging Tests
##################################
test_creates_log_file() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Edit"
        export CLAUDE_FILE=""
        export CLAUDE_CONTENT="clean"
        bash "$HOOK_PATH" > /dev/null 2>&1
        [[ -f "$TEST_DIR/.claude/logs/verify-before-edit.log" ]]
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

    echo "Hook Existence Tests:"
    run_test "Hook file exists" test_hook_exists
    run_test "Hook syntax is valid" test_hook_syntax_valid

    echo ""
    echo "Tool Filtering Tests:"
    run_test "Skips Bash tool" test_skips_bash_tool
    run_test "Skips Read tool" test_skips_read_tool
    run_test "Processes Edit tool" test_processes_edit_tool
    run_test "Processes Write tool" test_processes_write_tool

    echo ""
    echo "File Skipping Tests:"
    run_test "Skips test files" test_skips_test_file
    run_test "Skips spec files" test_skips_spec_file
    run_test "Skips example files" test_skips_example_file
    run_test "Skips fixture files" test_skips_fixture_file
    run_test "Skips mock files" test_skips_mock_file

    echo ""
    echo "Placeholder Detection Tests:"
    run_test "Detects api-key-here" test_detects_api_key_placeholder
    run_test "Detects REPLACE_ME" test_detects_replace_me
    run_test "Detects INSERT tag" test_detects_insert_placeholder
    run_test "Detects placeholder keyword" test_detects_placeholder_keyword

    echo ""
    echo "Fabricated ID Detection Tests:"
    run_test "Detects sequential zeros" test_detects_sequential_zeros
    run_test "Detects sequential numbers" test_detects_sequential_numbers

    echo ""
    echo "Clean Content Tests:"
    run_test "Allows clean code" test_allows_clean_content
    run_test "Allows empty content" test_allows_empty_content

    echo ""
    echo "Exit Code Tests:"
    run_test "Non-blocking (exits 0)" test_always_exits_zero

    echo ""
    echo "Logging Tests:"
    run_test "Creates log file" test_creates_log_file

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
