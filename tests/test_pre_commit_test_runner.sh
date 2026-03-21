#!/usr/bin/env bash
set -uo pipefail

# Test Suite: hooks/pre-commit-test-runner.sh
#
# Purpose: Functional tests for pre-commit test runner hook
# Tests: Commit detection, framework detection, tool filtering, logging

##################################
# Test Configuration
##################################
TEST_NAME="hooks/pre-commit-test-runner.sh Test Suite"
TEST_DIR="/tmp/test-pre-commit-test-runner-$$"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HOOK_PATH="$SCRIPT_DIR/hooks/pre-commit-test-runner.sh"

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
    bash -n "$HOOK_PATH"
}

##################################
# Tool Filtering Tests
##################################
test_skips_write_tool() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Write"
        export CLAUDE_CONTENT=""
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_skips_read_tool() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Read"
        export CLAUDE_CONTENT=""
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_skips_edit_tool() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Edit"
        export CLAUDE_CONTENT=""
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_skips_glob_tool() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Glob"
        export CLAUDE_CONTENT=""
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

##################################
# Non-Commit Bash Command Tests
##################################
test_skips_ls_command() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Bash"
        export CLAUDE_CONTENT="ls -la"
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_skips_cat_command() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Bash"
        export CLAUDE_CONTENT="cat README.md"
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_skips_git_status() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Bash"
        export CLAUDE_CONTENT="git status"
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_skips_git_diff() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Bash"
        export CLAUDE_CONTENT="git diff --staged"
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

##################################
# Commit Detection Tests
##################################
test_detects_git_commit() {
    # With CLAUDE_TOOL=Bash and git commit content, the hook should
    # pass the is_commit_command check, then detect no framework
    # in TEST_DIR (no project files), and exit 0
    (
        cd "$TEST_DIR" && \
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Bash"
        export CLAUDE_CONTENT="git commit -m test"
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_detects_git_commit_with_flags() {
    (
        cd "$TEST_DIR" && \
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Bash"
        export CLAUDE_CONTENT="git commit -am 'fix: update tests'"
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

test_detects_git_commit_multiword() {
    (
        cd "$TEST_DIR" && \
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Bash"
        export CLAUDE_CONTENT='git  commit -m "multi word message"'
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

##################################
# No Framework Detection Tests
##################################
test_no_framework_empty_dir() {
    # Empty TEST_DIR should detect no framework, exit 0
    (
        cd "$TEST_DIR" && \
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Bash"
        export CLAUDE_CONTENT="git commit -m test"
        bash "$HOOK_PATH" > /dev/null 2>&1
    )
}

##################################
# Framework Detection Tests
##################################
test_detects_pytest_framework() {
    (
        cd "$TEST_DIR" && \
        cat > pyproject.toml <<'EOF'
[tool.pytest.ini_options]
testpaths = ["tests"]
EOF
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Bash"
        export CLAUDE_CONTENT="git commit -m test"
        bash "$HOOK_PATH" > /dev/null 2>&1
        # Verify the hook detected the pytest framework via log
        grep -q "Detected framework: pytest" "$TEST_DIR/.claude/logs/pre-commit-test-runner.log"
    )
}

test_detects_npm_test_framework() {
    (
        cd "$TEST_DIR" && \
        cat > package.json <<'EOF'
{
  "name": "test-project",
  "scripts": {
    "test": "echo 'test'"
  }
}
EOF
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Bash"
        export CLAUDE_CONTENT="git commit -m test"
        bash "$HOOK_PATH" > /dev/null 2>&1
        # Verify the hook detected the npm-test framework via log
        grep -q "Detected framework: npm-test" "$TEST_DIR/.claude/logs/pre-commit-test-runner.log"
    )
}

test_detects_go_test_framework() {
    (
        cd "$TEST_DIR" && \
        cat > go.mod <<'EOF'
module example.com/test
go 1.21
EOF
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Bash"
        export CLAUDE_CONTENT="git commit -m test"
        bash "$HOOK_PATH" > /dev/null 2>&1 || true
        # Verify the hook detected the go-test framework via log
        grep -q "Detected framework: go-test" "$TEST_DIR/.claude/logs/pre-commit-test-runner.log"
    )
}

test_detects_cargo_test_framework() {
    (
        cd "$TEST_DIR" && \
        cat > Cargo.toml <<'EOF'
[package]
name = "test-project"
version = "0.1.0"
EOF
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Bash"
        export CLAUDE_CONTENT="git commit -m test"
        bash "$HOOK_PATH" > /dev/null 2>&1 || true
        # Verify the hook detected the cargo-test framework via log
        grep -q "Detected framework: cargo-test" "$TEST_DIR/.claude/logs/pre-commit-test-runner.log"
    )
}

test_detects_mix_test_framework() {
    (
        cd "$TEST_DIR" && \
        touch mix.exs
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Bash"
        export CLAUDE_CONTENT="git commit -m test"
        bash "$HOOK_PATH" > /dev/null 2>&1 || true
        # Verify the hook detected the mix-test framework via log
        grep -q "Detected framework: mix-test" "$TEST_DIR/.claude/logs/pre-commit-test-runner.log"
    )
}

##################################
# Logging Tests
##################################
test_creates_log_directory() {
    (
        # Use a fresh HOME to verify log dir creation
        local fresh_home="$TEST_DIR/fresh-home"
        mkdir -p "$fresh_home"
        export HOME="$fresh_home"
        export CLAUDE_TOOL="Read"
        export CLAUDE_CONTENT=""
        bash "$HOOK_PATH" > /dev/null 2>&1
        [[ -d "$fresh_home/.claude/logs" ]]
    )
}

test_creates_log_file() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Read"
        export CLAUDE_CONTENT=""
        bash "$HOOK_PATH" > /dev/null 2>&1
        [[ -f "$TEST_DIR/.claude/logs/pre-commit-test-runner.log" ]]
    )
}

test_logs_hook_activity() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Bash"
        export CLAUDE_CONTENT="ls -la"
        bash "$HOOK_PATH" > /dev/null 2>&1
        grep -q "pre-commit-test-runner" "$TEST_DIR/.claude/logs/pre-commit-test-runner.log"
    )
}

test_logs_skip_message() {
    (
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Write"
        export CLAUDE_CONTENT=""
        bash "$HOOK_PATH" > /dev/null 2>&1
        grep -q "Not a commit command, skipping" "$TEST_DIR/.claude/logs/pre-commit-test-runner.log"
    )
}

test_logs_no_framework_message() {
    (
        cd "$TEST_DIR" && \
        export HOME="$TEST_DIR"
        export CLAUDE_TOOL="Bash"
        export CLAUDE_CONTENT="git commit -m test"
        bash "$HOOK_PATH" > /dev/null 2>&1
        grep -q "No test framework detected" "$TEST_DIR/.claude/logs/pre-commit-test-runner.log"
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
    run_test "Hook is parseable" test_hook_is_executable_or_sourceable

    echo ""
    echo "Tool Filtering Tests (non-Bash tools skip):"
    run_test "Skips Write tool" test_skips_write_tool
    run_test "Skips Read tool" test_skips_read_tool
    run_test "Skips Edit tool" test_skips_edit_tool
    run_test "Skips Glob tool" test_skips_glob_tool

    echo ""
    echo "Non-Commit Bash Command Tests:"
    run_test "Skips ls command" test_skips_ls_command
    run_test "Skips cat command" test_skips_cat_command
    run_test "Skips git status" test_skips_git_status
    run_test "Skips git diff" test_skips_git_diff

    echo ""
    echo "Commit Detection Tests:"
    run_test "Detects git commit" test_detects_git_commit
    run_test "Detects git commit with flags" test_detects_git_commit_with_flags
    run_test "Detects git commit multi-word msg" test_detects_git_commit_multiword

    echo ""
    echo "No Framework Detection Tests:"
    run_test "No framework in empty dir" test_no_framework_empty_dir

    # Clean up framework files and log between tests
    echo ""
    echo "Framework Detection Tests:"
    rm -f "$TEST_DIR/pytest.ini" "$TEST_DIR/pyproject.toml" "$TEST_DIR/package.json" \
          "$TEST_DIR/go.mod" "$TEST_DIR/Cargo.toml" "$TEST_DIR/mix.exs"

    > "$TEST_DIR/.claude/logs/pre-commit-test-runner.log"
    run_test "Detects pytest framework" test_detects_pytest_framework
    rm -f "$TEST_DIR/pytest.ini" "$TEST_DIR/pyproject.toml"

    > "$TEST_DIR/.claude/logs/pre-commit-test-runner.log"
    run_test "Detects npm-test framework" test_detects_npm_test_framework
    rm -f "$TEST_DIR/package.json"

    > "$TEST_DIR/.claude/logs/pre-commit-test-runner.log"
    run_test "Detects go-test framework" test_detects_go_test_framework
    rm -f "$TEST_DIR/go.mod"

    > "$TEST_DIR/.claude/logs/pre-commit-test-runner.log"
    run_test "Detects cargo-test framework" test_detects_cargo_test_framework
    rm -f "$TEST_DIR/Cargo.toml"

    > "$TEST_DIR/.claude/logs/pre-commit-test-runner.log"
    run_test "Detects mix-test framework" test_detects_mix_test_framework
    rm -f "$TEST_DIR/mix.exs"

    echo ""
    echo "Logging Tests:"
    run_test "Creates log directory" test_creates_log_directory
    run_test "Creates log file" test_creates_log_file
    run_test "Logs hook activity" test_logs_hook_activity
    run_test "Logs skip message" test_logs_skip_message
    run_test "Logs no framework message" test_logs_no_framework_message

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
