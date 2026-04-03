#!/usr/bin/env bash
set -uo pipefail

# Test Suite: setup-devcontainer.sh (Advanced Tests)
#
# Purpose: Additional tests for strict mode, custom domains,
# environment variables, and output messages.
# Split from test_setup_devcontainer.sh for maintainability.

##################################
# Test Configuration
##################################
TEST_NAME="setup-devcontainer.sh Advanced Test Suite"
TEST_DIR="/tmp/test-setup-devcontainer-adv-$$"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SCRIPT_PATH="$SCRIPT_DIR/setup-devcontainer.sh"
source "$(dirname "$0")/lib/test-helpers.sh"

reset_test_dir() {
    rm -rf "$TEST_DIR/.devcontainer"
}

# Override setup/cleanup to cd into test dir (required by devcontainer tests)
setup_test_environment() {
    echo "Setting up test environment..."
    mkdir -p "$TEST_DIR"
    cd "$TEST_DIR" || exit 1
}

cleanup_test_environment() {
    echo "Cleaning up test environment..."
    cd "$SCRIPT_DIR" || true
    rm -rf "$TEST_DIR"
}

# Override run_test to reset .devcontainer between tests
run_test() {
    local test_name="$1"
    local test_function="$2"
    echo -n "Running: $test_name... "
    ((TESTS_RUN++))
    reset_test_dir
    if $test_function; then
        echo -e "${GREEN}PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}FAILED${NC}"
        ((TESTS_FAILED++))
    fi
}

##################################
# Strict Mode Tests
##################################
test_strict_flag_accepted() {
    local output
    output=$("$SCRIPT_PATH" --strict --help 2>&1)
    echo "$output" | grep -q "Usage:"
}

test_strict_without_api_key_fails() {
    local original_key="${ANTHROPIC_API_KEY:-}"
    unset ANTHROPIC_API_KEY

    local output
    output=$("$SCRIPT_PATH" --strict 2>&1 || true)

    if [[ -n "$original_key" ]]; then
        export ANTHROPIC_API_KEY="$original_key"
    fi

    echo "$output" | grep -qi "ANTHROPIC_API_KEY"
}

test_strict_with_api_key_proceeds() {
    export ANTHROPIC_API_KEY="test-key-for-testing"
    local output
    output=$("$SCRIPT_PATH" --strict 2>&1 || true)
    echo "$output" | grep -q "ANTHROPIC_API_KEY is set"
}

##################################
# Custom Domain Tests
##################################
test_allow_domain_flag() {
    "$SCRIPT_PATH" --allow-domain custom.example.com > /dev/null 2>&1
    grep -q "custom.example.com" ".devcontainer/Dockerfile"
}

test_allow_domain_multiple() {
    "$SCRIPT_PATH" --allow-domain one.example.com --allow-domain two.example.com > /dev/null 2>&1
    grep -q "one.example.com" ".devcontainer/Dockerfile" && \
    grep -q "two.example.com" ".devcontainer/Dockerfile"
}

test_allow_domain_env_var() {
    DEVCONTAINER_EXTRA_DOMAINS="envvar.example.com" "$SCRIPT_PATH" > /dev/null 2>&1
    grep -q "envvar.example.com" ".devcontainer/Dockerfile"
}

test_allow_domain_env_var_comma_separated() {
    DEVCONTAINER_EXTRA_DOMAINS="first.example.com,second.example.com" "$SCRIPT_PATH" > /dev/null 2>&1
    grep -q "first.example.com" ".devcontainer/Dockerfile" && \
    grep -q "second.example.com" ".devcontainer/Dockerfile"
}

test_allow_domain_missing_arg_error() {
    local output
    output=$("$SCRIPT_PATH" --allow-domain 2>&1 || true)
    echo "$output" | grep -q "requires a domain argument"
}

test_default_domains_present() {
    "$SCRIPT_PATH" --allow-domain custom.example.com > /dev/null 2>&1
    grep -q "api.anthropic.com" ".devcontainer/Dockerfile" && \
    grep -q "github.com" ".devcontainer/Dockerfile" && \
    grep -q "custom.example.com" ".devcontainer/Dockerfile"
}

##################################
# Environment Variable Tests
##################################
test_anthropic_api_key_in_config() {
    "$SCRIPT_PATH" > /dev/null 2>&1
    grep -q "ANTHROPIC_API_KEY" ".devcontainer/devcontainer.json"
}

test_github_token_in_config() {
    "$SCRIPT_PATH" > /dev/null 2>&1
    grep -q "GITHUB_TOKEN" ".devcontainer/devcontainer.json"
}

test_aws_credentials_in_config() {
    "$SCRIPT_PATH" > /dev/null 2>&1
    grep -q "AWS_ACCESS_KEY_ID" ".devcontainer/devcontainer.json" && \
    grep -q "AWS_SECRET_ACCESS_KEY" ".devcontainer/devcontainer.json"
}

##################################
# Output Message Tests
##################################
test_success_message_shown() {
    local output
    output=$("$SCRIPT_PATH" 2>&1)
    echo "$output" | grep -qi "success"
}

test_next_steps_shown() {
    local output
    output=$("$SCRIPT_PATH" 2>&1)
    echo "$output" | grep -q "Next steps"
}

test_shows_configuration_summary() {
    local output
    output=$("$SCRIPT_PATH" 2>&1)
    echo "$output" | grep -q "Configuration:" && \
    echo "$output" | grep -q "Network firewall:"
}

##################################
# Main Test Execution
##################################
main() {
    print_test_header

    setup_test_environment

    echo "Strict Mode Tests:"
    run_test "Strict flag accepted" test_strict_flag_accepted
    run_test "Strict mode checks API key" test_strict_without_api_key_fails
    run_test "Strict mode with API key set" test_strict_with_api_key_proceeds

    echo ""
    echo "Custom Domain Tests:"
    run_test "Allow domain flag works" test_allow_domain_flag
    run_test "Multiple allow-domain flags" test_allow_domain_multiple
    run_test "Extra domains env var" test_allow_domain_env_var
    run_test "Comma-separated env var domains" test_allow_domain_env_var_comma_separated
    run_test "Missing domain arg error" test_allow_domain_missing_arg_error
    run_test "Default domains preserved" test_default_domains_present

    echo ""
    echo "Environment Variable Tests:"
    run_test "ANTHROPIC_API_KEY in config" test_anthropic_api_key_in_config
    run_test "GITHUB_TOKEN in config" test_github_token_in_config
    run_test "AWS credentials in config" test_aws_credentials_in_config

    echo ""
    echo "Output Message Tests:"
    run_test "Success message shown" test_success_message_shown
    run_test "Next steps shown" test_next_steps_shown
    run_test "Configuration summary shown" test_shows_configuration_summary

    cleanup_test_environment

    print_test_summary
}

setup_test_trap
main "$@"
