#!/usr/bin/env bash
set -uo pipefail  # Remove -e to prevent early exit on test failures

# Test Suite: setup-devcontainer.sh
#
# Purpose: Validate the devcontainer setup script functionality
# Tests: Argument parsing, file generation, configuration options, and output
#
# Testing Philosophy:
# - Focus on FUNCTIONAL OUTCOMES rather than exact log messages
# - Test file generation and content correctness
# - Validate security configurations are properly applied
# - Test both default and customized configurations

##################################
# Test Configuration
##################################
TEST_NAME="setup-devcontainer.sh Test Suite"
TEST_DIR="/tmp/test-setup-devcontainer-$$"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SCRIPT_PATH="$SCRIPT_DIR/setup-devcontainer.sh"
source "$(dirname "$0")/lib/test-helpers.sh"

reset_test_dir() {
    # Reset test directory for a fresh test
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
# Basic Functionality Tests
##################################
test_script_exists() {
    [[ -f "$SCRIPT_PATH" ]] && [[ -x "$SCRIPT_PATH" ]]
}

test_help_flag() {
    # Test --help displays usage and exits successfully
    local output
    output=$("$SCRIPT_PATH" --help 2>&1)
    local exit_code=$?

    [[ $exit_code -eq 0 ]] && \
    echo "$output" | grep -q "Usage:" && \
    echo "$output" | grep -q "OPTIONS:"
}

test_help_short_flag() {
    # Test -h displays usage
    local output
    output=$("$SCRIPT_PATH" -h 2>&1)

    echo "$output" | grep -q "Usage:"
}

test_unknown_option() {
    # Test unknown option shows error
    local output
    output=$("$SCRIPT_PATH" --unknown-option 2>&1 || true)

    echo "$output" | grep -q "Unknown option"
}

##################################
# Dry Run Tests
##################################
test_dry_run_no_files_created() {
    # Test --dry-run doesn't create any files
    "$SCRIPT_PATH" --dry-run > /dev/null 2>&1

    # .devcontainer directory should NOT exist
    [[ ! -d ".devcontainer" ]]
}

test_dry_run_shows_content() {
    # Test --dry-run shows what would be created
    local output
    output=$("$SCRIPT_PATH" --dry-run 2>&1)

    echo "$output" | grep -q "DRY RUN" && \
    echo "$output" | grep -q "devcontainer.json" && \
    echo "$output" | grep -q "Dockerfile"
}

##################################
# File Generation Tests
##################################
test_creates_devcontainer_directory() {
    # Test that running creates .devcontainer directory
    "$SCRIPT_PATH" > /dev/null 2>&1

    [[ -d ".devcontainer" ]]
}

test_creates_devcontainer_json() {
    # Test that devcontainer.json is created
    "$SCRIPT_PATH" > /dev/null 2>&1

    [[ -f ".devcontainer/devcontainer.json" ]]
}

test_creates_dockerfile() {
    # Test that Dockerfile is created
    "$SCRIPT_PATH" > /dev/null 2>&1

    [[ -f ".devcontainer/Dockerfile" ]]
}

test_devcontainer_json_valid_json() {
    # Test that devcontainer.json is valid JSON
    "$SCRIPT_PATH" > /dev/null 2>&1

    # Try to parse with python (widely available)
    if command -v python3 &> /dev/null; then
        python3 -c "import json; json.load(open('.devcontainer/devcontainer.json'))" 2>/dev/null
    elif command -v python &> /dev/null; then
        python -c "import json; json.load(open('.devcontainer/devcontainer.json'))" 2>/dev/null
    else
        # If no python, just check file exists and has content
        [[ -s ".devcontainer/devcontainer.json" ]]
    fi
}

##################################
# Security Configuration Tests
##################################
test_default_has_cap_drop() {
    # Test default config includes --cap-drop=ALL
    "$SCRIPT_PATH" > /dev/null 2>&1

    grep -q "cap-drop=ALL" ".devcontainer/devcontainer.json"
}

test_default_has_no_new_privileges() {
    # Test default config includes no-new-privileges
    "$SCRIPT_PATH" > /dev/null 2>&1

    grep -q "no-new-privileges" ".devcontainer/devcontainer.json"
}

test_default_has_firewall_rules() {
    # Test default Dockerfile includes firewall rules
    "$SCRIPT_PATH" > /dev/null 2>&1

    grep -q "iptables" ".devcontainer/Dockerfile"
}

test_default_has_allowed_domains() {
    # Test Dockerfile includes allowed domains
    "$SCRIPT_PATH" > /dev/null 2>&1

    grep -q "api.anthropic.com" ".devcontainer/Dockerfile" && \
    grep -q "github.com" ".devcontainer/Dockerfile"
}

##################################
# Configuration Option Tests
##################################
test_minimal_flag() {
    # Test --minimal creates minimal configuration
    "$SCRIPT_PATH" --minimal > /dev/null 2>&1

    # Minimal should NOT include python and aws-cli
    ! grep -q "aws-cli" ".devcontainer/devcontainer.json" && \
    ! grep -q "python:1" ".devcontainer/devcontainer.json"
}

test_minimal_has_node() {
    # Test --minimal still includes node
    "$SCRIPT_PATH" --minimal > /dev/null 2>&1

    grep -q "node:1" ".devcontainer/devcontainer.json"
}

test_no_network_firewall_flag() {
    # Test --no-network-firewall disables firewall
    "$SCRIPT_PATH" --no-network-firewall > /dev/null 2>&1

    # Should have comment about firewall being disabled
    grep -q "firewall disabled" ".devcontainer/Dockerfile"
}

test_no_network_firewall_no_iptables_rules() {
    # Test --no-network-firewall doesn't have iptables DROP rules
    "$SCRIPT_PATH" --no-network-firewall > /dev/null 2>&1

    # Should NOT have the firewall setup script
    ! grep -q "setup-firewall.sh" ".devcontainer/Dockerfile"
}

##################################
# Full Tooling Tests
##################################
test_full_tooling_includes_python() {
    # Test full tooling (default) includes python
    "$SCRIPT_PATH" > /dev/null 2>&1

    grep -q "python:1" ".devcontainer/devcontainer.json"
}

test_full_tooling_includes_aws_cli() {
    # Test full tooling includes aws-cli
    "$SCRIPT_PATH" > /dev/null 2>&1

    grep -q "aws-cli:1" ".devcontainer/devcontainer.json"
}

test_full_tooling_includes_docker_in_docker() {
    # Test full tooling includes docker-in-docker
    "$SCRIPT_PATH" > /dev/null 2>&1

    grep -q "docker-in-docker:1" ".devcontainer/devcontainer.json"
}

##################################
# Force Flag Tests
##################################
test_existing_config_error() {
    # Test that existing config causes error without --force
    "$SCRIPT_PATH" > /dev/null 2>&1

    # Second run should fail
    local output
    output=$("$SCRIPT_PATH" 2>&1 || true)

    echo "$output" | grep -q "already exists"
}

test_force_overwrites() {
    # Test --force overwrites existing config
    "$SCRIPT_PATH" > /dev/null 2>&1

    # Second run with --force should succeed
    "$SCRIPT_PATH" --force > /dev/null 2>&1
    local exit_code=$?

    [[ $exit_code -eq 0 ]] && [[ -f ".devcontainer/devcontainer.json" ]]
}

##################################
# Environment Variable Tests
# (see test_devcontainer_advanced.sh for full env var tests)
##################################

##################################
# Dockerfile Content Tests
##################################
test_dockerfile_base_image() {
    # Test Dockerfile uses correct base image
    "$SCRIPT_PATH" > /dev/null 2>&1

    grep -q "mcr.microsoft.com/devcontainers/base:ubuntu" ".devcontainer/Dockerfile"
}

test_dockerfile_has_healthcheck() {
    # Test Dockerfile includes healthcheck
    "$SCRIPT_PATH" > /dev/null 2>&1

    grep -q "HEALTHCHECK" ".devcontainer/Dockerfile"
}

test_dockerfile_non_root_user() {
    # Test Dockerfile uses non-root user
    "$SCRIPT_PATH" > /dev/null 2>&1

    grep -q "USER vscode" ".devcontainer/Dockerfile"
}

test_dockerfile_workspace_created() {
    # Test Dockerfile creates workspace
    "$SCRIPT_PATH" > /dev/null 2>&1

    grep -q "WORKDIR /workspace" ".devcontainer/Dockerfile"
}

##################################
# Post Create Command Tests
##################################
test_post_create_installs_claude() {
    # Test post create command installs claude-code
    "$SCRIPT_PATH" > /dev/null 2>&1

    grep -q "@anthropic-ai/claude-code" ".devcontainer/devcontainer.json"
}

test_full_post_create_installs_pip_packages() {
    # Test full tooling installs pip packages
    "$SCRIPT_PATH" > /dev/null 2>&1

    grep -q "boto3" ".devcontainer/devcontainer.json" && \
    grep -q "requests" ".devcontainer/devcontainer.json"
}

test_minimal_post_create_no_pip() {
    # Test minimal doesn't install pip packages
    "$SCRIPT_PATH" --minimal > /dev/null 2>&1

    ! grep -q "boto3" ".devcontainer/devcontainer.json"
}

##################################
# VSCode Customization Tests
##################################
test_vscode_extension_included() {
    # Test Claude extension is configured for VSCode
    "$SCRIPT_PATH" > /dev/null 2>&1

    grep -q "anthropic.claude-code" ".devcontainer/devcontainer.json"
}

##################################
# Combined Flag Tests
##################################
test_minimal_and_no_firewall() {
    # Test combining --minimal and --no-network-firewall
    "$SCRIPT_PATH" --minimal --no-network-firewall > /dev/null 2>&1

    # Should be minimal
    ! grep -q "python:1" ".devcontainer/devcontainer.json" && \
    # And no firewall
    grep -q "firewall disabled" ".devcontainer/Dockerfile"
}

##################################
# Advanced Tests
# (strict mode, custom domains, output messages)
# See: test_devcontainer_advanced.sh
##################################

##################################
# Main Test Execution
##################################
main() {
    print_test_header

    # Setup
    setup_test_environment

    # Run tests
    echo "Basic Functionality Tests:"
    run_test "Script exists and is executable" test_script_exists
    run_test "Help flag displays usage" test_help_flag
    run_test "Short help flag works" test_help_short_flag
    run_test "Unknown option shows error" test_unknown_option

    echo ""
    echo "Dry Run Tests:"
    run_test "Dry run creates no files" test_dry_run_no_files_created
    run_test "Dry run shows content preview" test_dry_run_shows_content

    echo ""
    echo "File Generation Tests:"
    run_test "Creates .devcontainer directory" test_creates_devcontainer_directory
    run_test "Creates devcontainer.json" test_creates_devcontainer_json
    run_test "Creates Dockerfile" test_creates_dockerfile
    run_test "devcontainer.json is valid JSON" test_devcontainer_json_valid_json

    echo ""
    echo "Security Configuration Tests:"
    run_test "Default has cap-drop=ALL" test_default_has_cap_drop
    run_test "Default has no-new-privileges" test_default_has_no_new_privileges
    run_test "Default has firewall rules" test_default_has_firewall_rules
    run_test "Default has allowed domains" test_default_has_allowed_domains

    echo ""
    echo "Configuration Option Tests:"
    run_test "Minimal flag excludes python/aws" test_minimal_flag
    run_test "Minimal still includes node" test_minimal_has_node
    run_test "No-network-firewall disables firewall" test_no_network_firewall_flag
    run_test "No-network-firewall has no iptables rules" test_no_network_firewall_no_iptables_rules

    echo ""
    echo "Full Tooling Tests:"
    run_test "Full tooling includes python" test_full_tooling_includes_python
    run_test "Full tooling includes aws-cli" test_full_tooling_includes_aws_cli
    run_test "Full tooling includes docker-in-docker" test_full_tooling_includes_docker_in_docker

    echo ""
    echo "Force Flag Tests:"
    run_test "Existing config causes error" test_existing_config_error
    run_test "Force flag overwrites config" test_force_overwrites

    echo ""
    echo "Dockerfile Content Tests:"
    run_test "Correct base image" test_dockerfile_base_image
    run_test "Has healthcheck" test_dockerfile_has_healthcheck
    run_test "Uses non-root user" test_dockerfile_non_root_user
    run_test "Creates workspace" test_dockerfile_workspace_created

    echo ""
    echo "Post Create Command Tests:"
    run_test "Installs claude-code" test_post_create_installs_claude
    run_test "Full installs pip packages" test_full_post_create_installs_pip_packages
    run_test "Minimal no pip packages" test_minimal_post_create_no_pip

    echo ""
    echo "VSCode Customization Tests:"
    run_test "Claude extension configured" test_vscode_extension_included

    echo ""
    echo "Combined Flag Tests:"
    run_test "Minimal and no-firewall together" test_minimal_and_no_firewall

    echo ""
    echo "(Advanced tests in test_devcontainer_advanced.sh)"

    # Cleanup
    cleanup_test_environment

    print_test_summary
}

setup_test_trap

# Run main function
main "$@"
