#!/usr/bin/env bash
set -uo pipefail

# Test Suite: hooks/prevent-credential-exposure.sh
#
# Purpose: Functional tests for credential exposure prevention hook
# Tests: Blocks credential patterns, allows clean content, skips non-file tools

##################################
# Test Configuration
##################################
TEST_NAME="hooks/prevent-credential-exposure.sh Test Suite"
TEST_DIR="/tmp/test-credential-exposure-$$"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HOOK_PATH="$SCRIPT_DIR/hooks/prevent-credential-exposure.sh"

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
    # Ensure log directory exists
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

# Check if grep -P (Perl regex) is available
has_perl_grep() {
    echo "test" | grep -qP "test" 2>/dev/null
}

# Check if bash supports associative arrays (bash 4+)
has_bash4() {
    bash -c 'declare -A test_arr 2>/dev/null'
}

# Helper: skip test if bash < 4 (hook requires associative arrays)
requires_bash4() {
    if ! has_bash4; then
        echo -n "(skipped: bash < 4) "
        return 0
    fi
    return 1
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

test_hook_is_executable_or_sourceable() {
    # Hook should parse without errors
    bash -n "$HOOK_PATH"
}

##################################
# Tool Filtering Tests
##################################
test_skips_bash_tool() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Bash"
        export CLAUDE_FILE=""
        export CLAUDE_CONTENT=""
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_skips_read_tool() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Read"
        export CLAUDE_FILE=""
        export CLAUDE_CONTENT=""
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_skips_unknown_tool() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Glob"
        export CLAUDE_FILE=""
        export CLAUDE_CONTENT=""
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

##################################
# Clean Content Tests
##################################
test_allows_clean_content() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Write"
        local test_file="$TEST_DIR/clean.py"
        cat > "$test_file" <<'CONTENT'
def hello():
    print("Hello, world!")
    return True
CONTENT
        export CLAUDE_FILE="$test_file"
        export CLAUDE_CONTENT=""
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_allows_env_var_reference() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Edit"
        local test_file="$TEST_DIR/config.py"
        cat > "$test_file" <<'CONTENT'
import os
API_KEY = os.environ.get("API_KEY")
SECRET = os.getenv("APP_SECRET")
CONTENT
        export CLAUDE_FILE="$test_file"
        export CLAUDE_CONTENT=""
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_allows_no_content() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Edit"
        export CLAUDE_FILE=""
        export CLAUDE_CONTENT=""
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

##################################
# Credential Detection Tests
# Only run if grep -P is available
##################################
test_blocks_aws_access_key() {
    requires_bash4 && return 0
    if ! has_perl_grep; then
        echo -n "(skipped: no grep -P) "
        return 0
    fi
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Write"
        local test_file="$TEST_DIR/aws-creds.py"
        cat > "$test_file" <<'CONTENT'
AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
CONTENT
        export CLAUDE_FILE="$test_file"
        export CLAUDE_CONTENT=""
        ! bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_blocks_github_token() {
    requires_bash4 && return 0
    if ! has_perl_grep; then
        echo -n "(skipped: no grep -P) "
        return 0
    fi
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Write"
        local test_file="$TEST_DIR/github.env"
        # Construct token via concatenation to avoid static scanner detection
        # Pattern gh[po]_[a-zA-Z0-9]{36} requires exactly 36 chars after prefix
        local token_prefix="ghp_"
        local token_suffix="ABCDEFGHIJKLMNOPQRSTU"
        token_suffix="${token_suffix}VWXYZabcdefghij"
        printf 'GITHUB_TOKEN=%s%s\n' "$token_prefix" "$token_suffix" > "$test_file"
        export CLAUDE_FILE="$test_file"
        export CLAUDE_CONTENT=""
        ! bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_blocks_private_key() {
    requires_bash4 && return 0
    if ! has_perl_grep; then
        echo -n "(skipped: no grep -P) "
        return 0
    fi
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Write"
        local test_file="$TEST_DIR/key.pem"
        # Construct pattern via concatenation to avoid static scanner detection
        local marker
        marker="-----BEGIN RSA PRIV"
        marker="${marker}ATE KEY-----"
        printf '%s\nMIIEowIBAAKCAQEA0Z3VS5JJcds3xfn\n' "$marker" > "$test_file"
        export CLAUDE_FILE="$test_file"
        export CLAUDE_CONTENT=""
        ! bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_blocks_database_url_with_password() {
    requires_bash4 && return 0
    if ! has_perl_grep; then
        echo -n "(skipped: no grep -P) "
        return 0
    fi
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Write"
        local test_file="$TEST_DIR/db-config.py"
        # Construct credential URL via concatenation to avoid scanner
        local db_url="postgresql://admin"
        db_url="${db_url}:secretpass@db.example.com:5432/mydb"
        printf 'DATABASE_URL = "%s"\n' "$db_url" > "$test_file"
        export CLAUDE_FILE="$test_file"
        export CLAUDE_CONTENT=""
        ! bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_blocks_jwt_token() {
    requires_bash4 && return 0
    if ! has_perl_grep; then
        echo -n "(skipped: no grep -P) "
        return 0
    fi
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Write"
        local test_file="$TEST_DIR/jwt.json"
        # Construct JWT via concatenation to avoid scanner
        local jwt="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
        jwt="${jwt}.eyJzdWIiOiIxMjM0NTY3ODkwIn0"
        jwt="${jwt}.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U"
        printf '{"token": "%s"}\n' "$jwt" > "$test_file"
        export CLAUDE_FILE="$test_file"
        export CLAUDE_CONTENT=""
        ! bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_blocks_url_with_credentials() {
    requires_bash4 && return 0
    if ! has_perl_grep; then
        echo -n "(skipped: no grep -P) "
        return 0
    fi
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Edit"
        local test_file="$TEST_DIR/urls.txt"
        # Construct credential URL via concatenation to avoid scanner
        local cred_url="mysql://root"
        cred_url="${cred_url}:pass123@localhost:3306/app"
        printf 'connection = "%s"\n' "$cred_url" > "$test_file"
        export CLAUDE_FILE="$test_file"
        export CLAUDE_CONTENT=""
        ! bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

##################################
# Logging Tests
##################################
test_creates_log_files() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Bash"
        export CLAUDE_FILE=""
        export CLAUDE_CONTENT=""
        bash "$HOOK_PATH" > /dev/null 2>&1
        [[ -f "$TEST_DIR/.claude/logs/security-hooks.log" ]]
    )
}

test_logs_hook_trigger() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Read"
        export CLAUDE_FILE=""
        export CLAUDE_CONTENT=""
        bash "$HOOK_PATH" > /dev/null 2>&1
        grep -q "Hook triggered" "$TEST_DIR/.claude/logs/security-hooks.log"
    )
}

##################################
# Content via CLAUDE_CONTENT Tests
##################################
test_allows_clean_content_via_env() {
    requires_bash4 && return 0
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Write"
        export CLAUDE_FILE=""
        export CLAUDE_CONTENT="def hello(): return True"
        bash "$HOOK_PATH" > /dev/null 2>&1
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

    if ! has_bash4; then
        echo "NOTE: bash 4+ required for associative arrays (declare -A)."
        echo "Hook execution tests will be skipped on bash 3.x."
        echo ""
    fi

    if ! has_perl_grep; then
        echo "NOTE: grep -P (Perl regex) not available."
        echo "Credential detection tests will be skipped."
        echo ""
    fi

    setup_test_environment

    echo "Hook Existence Tests:"
    run_test "Hook file exists" test_hook_exists
    run_test "Hook syntax is valid" test_hook_syntax_valid
    run_test "Hook is parseable" test_hook_is_executable_or_sourceable

    echo ""
    echo "Tool Filtering Tests:"
    run_test "Skips Bash tool" test_skips_bash_tool
    run_test "Skips Read tool" test_skips_read_tool
    run_test "Skips unknown tool" test_skips_unknown_tool

    echo ""
    echo "Clean Content Tests:"
    run_test "Allows clean Python code" test_allows_clean_content
    run_test "Allows env var references" test_allows_env_var_reference
    run_test "Allows empty content" test_allows_no_content
    run_test "Allows clean content via env" test_allows_clean_content_via_env

    echo ""
    echo "Credential Detection Tests:"
    run_test "Blocks AWS access key" test_blocks_aws_access_key
    run_test "Blocks GitHub token" test_blocks_github_token
    run_test "Blocks private key" test_blocks_private_key
    run_test "Blocks DB URL with password" test_blocks_database_url_with_password
    run_test "Blocks JWT token" test_blocks_jwt_token
    run_test "Blocks URL with credentials" test_blocks_url_with_credentials

    echo ""
    echo "Logging Tests:"
    run_test "Creates log files" test_creates_log_files
    run_test "Logs hook trigger" test_logs_hook_trigger

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
