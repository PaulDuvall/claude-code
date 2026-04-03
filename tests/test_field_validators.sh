#!/usr/bin/env bash
set -uo pipefail

# Test Suite: hooks/lib/field-validators.sh
#
# Purpose: Validate field validation functions for subagent metadata
# Tests: Name, description, version, tools, and tags validation

##################################
# Test Configuration
##################################
TEST_NAME="hooks/lib/field-validators.sh Test Suite"
TEST_DIR="/tmp/test-field-validators-$$"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LIB_DIR="$SCRIPT_DIR/hooks/lib"
source "$(dirname "$0")/lib/test-helpers.sh"

##################################
# Module Existence and Syntax Tests
##################################
test_lib_exists() {
    [[ -f "$LIB_DIR/field-validators.sh" ]] && [[ -r "$LIB_DIR/field-validators.sh" ]]
}

test_lib_syntax_valid() {
    bash -n "$LIB_DIR/field-validators.sh" 2>/dev/null
}

test_lib_is_sourceable() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
    )
}

##################################
# Include Guard Tests
##################################
test_include_guard_prevents_double_load() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        [[ "$_FIELD_VALIDATORS_LOADED" -eq 1 ]]
        # Source again - should return immediately via guard
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        [[ "$_FIELD_VALIDATORS_LOADED" -eq 1 ]]
    )
}

##################################
# Function Existence Tests
##################################
test_validate_subagent_name_field_exists() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        declare -f validate_subagent_name_field >/dev/null 2>&1
    )
}

test_validate_description_field_exists() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        declare -f validate_description_field >/dev/null 2>&1
    )
}

test_validate_version_field_exists() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        declare -f validate_version_field >/dev/null 2>&1
    )
}

test_validate_tools_field_exists() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        declare -f validate_tools_field >/dev/null 2>&1
    )
}

test_validate_tags_field_exists() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        declare -f validate_tags_field >/dev/null 2>&1
    )
}

##################################
# Name Validation Tests
##################################
test_valid_name_passes() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        validate_subagent_name_field "my-agent" >/dev/null 2>&1
    )
}

test_valid_name_with_numbers_passes() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        validate_subagent_name_field "agent123" >/dev/null 2>&1
    )
}

test_empty_name_fails() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        validate_subagent_name_field "" >/dev/null 2>&1
        local rc=$?
        [[ "$rc" -eq "$EXIT_VALIDATION_FAILED" ]]
    )
}

test_uppercase_name_fails() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        validate_subagent_name_field "MyAgent" >/dev/null 2>&1
        local rc=$?
        [[ "$rc" -eq "$EXIT_VALIDATION_FAILED" ]]
    )
}

test_name_starting_with_number_fails() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        validate_subagent_name_field "123agent" >/dev/null 2>&1
        local rc=$?
        [[ "$rc" -eq "$EXIT_VALIDATION_FAILED" ]]
    )
}

##################################
# Description Validation Tests
##################################
test_valid_description_passes() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        validate_description_field "This is a valid description for the subagent" >/dev/null 2>&1
    )
}

test_empty_description_fails() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        validate_description_field "" >/dev/null 2>&1
        local rc=$?
        [[ "$rc" -eq "$EXIT_VALIDATION_FAILED" ]]
    )
}

test_short_description_fails() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        # MIN_DESCRIPTION_LENGTH is 10, so "short" (5 chars) should fail
        validate_description_field "short" >/dev/null 2>&1
        local rc=$?
        [[ "$rc" -eq "$EXIT_VALIDATION_FAILED" ]]
    )
}

##################################
# Version Validation Tests
##################################
test_semver_version_passes() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        validate_version_field "1.0.0" >/dev/null 2>&1
    )
}

test_semver_with_prerelease_passes() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        validate_version_field "2.1.0-beta.1" >/dev/null 2>&1
    )
}

test_simple_version_passes() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        validate_version_field "1.0" >/dev/null 2>&1
    )
}

test_single_number_version_passes() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        validate_version_field "3" >/dev/null 2>&1
    )
}

test_invalid_version_fails() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        validate_version_field "abc" >/dev/null 2>&1
        local rc=$?
        [[ "$rc" -eq "$EXIT_VALIDATION_FAILED" ]]
    )
}

test_version_with_v_prefix_fails() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        validate_version_field "v1.0.0" >/dev/null 2>&1
        local rc=$?
        [[ "$rc" -eq "$EXIT_VALIDATION_FAILED" ]]
    )
}

##################################
# Tools Validation Tests
##################################
test_valid_tools_comma_separated_passes() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        validate_tools_field "Read,Write" >/dev/null 2>&1
    )
}

test_valid_single_tool_passes() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        validate_tools_field "Bash" >/dev/null 2>&1
    )
}

test_valid_tools_with_underscore_passes() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        validate_tools_field "Read,Write,Multi_Edit" >/dev/null 2>&1
    )
}

test_invalid_tools_starting_with_number_fails() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        validate_tools_field "123Tool" >/dev/null 2>&1
        local rc=$?
        [[ "$rc" -eq "$EXIT_VALIDATION_FAILED" ]]
    )
}

##################################
# Tags Validation Tests
##################################
test_tags_array_format_passes() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        validate_tags_field "[tag1,tag2]" >/dev/null 2>&1
    )
}

test_tags_comma_separated_passes() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        validate_tags_field "security,quality" >/dev/null 2>&1
    )
}

test_tags_single_value_passes() {
    (
        export HOME="$TEST_DIR"
        unset _FIELD_VALIDATORS_LOADED _ERROR_HANDLER_LOADED _FILE_UTILS_LOADED CONFIG_CONSTANTS_LOADED
        source "$LIB_DIR/field-validators.sh" 2>/dev/null
        validate_tags_field "security" >/dev/null 2>&1
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
    echo "Function Existence Tests:"
    run_test "validate_subagent_name_field exists" test_validate_subagent_name_field_exists
    run_test "validate_description_field exists" test_validate_description_field_exists
    run_test "validate_version_field exists" test_validate_version_field_exists
    run_test "validate_tools_field exists" test_validate_tools_field_exists
    run_test "validate_tags_field exists" test_validate_tags_field_exists

    echo ""
    echo "Name Validation Tests:"
    run_test "Valid lowercase name passes" test_valid_name_passes
    run_test "Valid name with numbers passes" test_valid_name_with_numbers_passes
    run_test "Empty name fails" test_empty_name_fails
    run_test "Uppercase name fails" test_uppercase_name_fails
    run_test "Name starting with number fails" test_name_starting_with_number_fails

    echo ""
    echo "Description Validation Tests:"
    run_test "Valid description passes" test_valid_description_passes
    run_test "Empty description fails" test_empty_description_fails
    run_test "Short description fails" test_short_description_fails

    echo ""
    echo "Version Validation Tests:"
    run_test "Semver 1.0.0 passes" test_semver_version_passes
    run_test "Semver with prerelease passes" test_semver_with_prerelease_passes
    run_test "Simple version 1.0 passes" test_simple_version_passes
    run_test "Single number version passes" test_single_number_version_passes
    run_test "Invalid version 'abc' fails" test_invalid_version_fails
    run_test "Version with v prefix fails" test_version_with_v_prefix_fails

    echo ""
    echo "Tools Validation Tests:"
    run_test "Comma-separated tools passes" test_valid_tools_comma_separated_passes
    run_test "Single tool passes" test_valid_single_tool_passes
    run_test "Tools with underscore passes" test_valid_tools_with_underscore_passes
    run_test "Tools starting with number fails" test_invalid_tools_starting_with_number_fails

    echo ""
    echo "Tags Validation Tests:"
    run_test "Array format tags passes" test_tags_array_format_passes
    run_test "Comma-separated tags passes" test_tags_comma_separated_passes
    run_test "Single tag passes" test_tags_single_value_passes

    cleanup_test_environment

    print_test_summary
}

setup_test_trap

main "$@"
