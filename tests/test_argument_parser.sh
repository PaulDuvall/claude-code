#!/usr/bin/env bash
set -uo pipefail

# Test Suite: hooks/lib/argument-parser.sh
#
# Purpose: Validate argument parsing, validation, and accessor functions
# Tests: Module loading, name/event/timeout validation, parse_arguments, accessors

##################################
# Test Configuration
##################################
TEST_NAME="hooks/lib/argument-parser.sh Test Suite"
TEST_DIR="/tmp/test-argument-parser-$$"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LIB_DIR="$SCRIPT_DIR/hooks/lib"
source "$(dirname "$0")/lib/test-helpers.sh"

##################################
# Test Setup (custom — overrides helper defaults)
##################################
setup_test_environment() {
    echo "Setting up test environment..."
    mkdir -p "$TEST_DIR/.claude/logs"
    export HOME="$TEST_DIR"
}

cleanup_test_environment() {
    echo "Cleaning up test environment..."
    rm -rf "$TEST_DIR"
}

##################################
# Module Existence and Loading Tests
##################################
test_lib_exists() {
    [[ -f "$LIB_DIR/argument-parser.sh" ]] && [[ -r "$LIB_DIR/argument-parser.sh" ]]
}

test_lib_syntax_valid() {
    bash -n "$LIB_DIR/argument-parser.sh" 2>/dev/null
}

test_lib_is_sourceable() {
    (
        export HOME="$TEST_DIR"
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
    )
}

test_include_guard_prevents_double_load() {
    (
        export HOME="$TEST_DIR"
        unset _ARGUMENT_PARSER_LOADED
        unset CONFIG_CONSTANTS_LOADED
        unset _ERROR_HANDLER_LOADED
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
        [[ "$_ARGUMENT_PARSER_LOADED" -eq 1 ]]
        # Source again - should return immediately
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
        [[ "$_ARGUMENT_PARSER_LOADED" -eq 1 ]]
    )
}

##################################
# validate_subagent_name Tests
##################################
test_validate_subagent_name_rejects_empty() {
    (
        export HOME="$TEST_DIR"
        unset _ARGUMENT_PARSER_LOADED
        unset CONFIG_CONSTANTS_LOADED
        unset _ERROR_HANDLER_LOADED
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
        ! validate_subagent_name "" 2>/dev/null
    )
}

test_validate_subagent_name_rejects_too_long() {
    (
        export HOME="$TEST_DIR"
        unset _ARGUMENT_PARSER_LOADED
        unset CONFIG_CONSTANTS_LOADED
        unset _ERROR_HANDLER_LOADED
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
        local long_name
        long_name=$(printf 'a%.0s' {1..51})
        ! validate_subagent_name "$long_name" 2>/dev/null
    )
}

test_validate_subagent_name_rejects_uppercase() {
    (
        export HOME="$TEST_DIR"
        unset _ARGUMENT_PARSER_LOADED
        unset CONFIG_CONSTANTS_LOADED
        unset _ERROR_HANDLER_LOADED
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
        ! validate_subagent_name "Security-Auditor" 2>/dev/null
    )
}

test_validate_subagent_name_rejects_leading_number() {
    (
        export HOME="$TEST_DIR"
        unset _ARGUMENT_PARSER_LOADED
        unset CONFIG_CONSTANTS_LOADED
        unset _ERROR_HANDLER_LOADED
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
        ! validate_subagent_name "1security" 2>/dev/null
    )
}

test_validate_subagent_name_accepts_valid() {
    (
        export HOME="$TEST_DIR"
        unset _ARGUMENT_PARSER_LOADED
        unset CONFIG_CONSTANTS_LOADED
        unset _ERROR_HANDLER_LOADED
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
        validate_subagent_name "security-auditor" 2>/dev/null
    )
}

##################################
# validate_event_type Tests
##################################
test_validate_event_type_rejects_empty() {
    (
        export HOME="$TEST_DIR"
        unset _ARGUMENT_PARSER_LOADED
        unset CONFIG_CONSTANTS_LOADED
        unset _ERROR_HANDLER_LOADED
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
        ! validate_event_type "" 2>/dev/null
    )
}

test_validate_event_type_rejects_unsupported() {
    (
        export HOME="$TEST_DIR"
        unset _ARGUMENT_PARSER_LOADED
        unset CONFIG_CONSTANTS_LOADED
        unset _ERROR_HANDLER_LOADED
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
        ! validate_event_type "nonexistent_event" 2>/dev/null
    )
}

test_validate_event_type_accepts_pre_write() {
    (
        export HOME="$TEST_DIR"
        unset _ARGUMENT_PARSER_LOADED
        unset CONFIG_CONSTANTS_LOADED
        unset _ERROR_HANDLER_LOADED
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
        validate_event_type "pre_write" 2>/dev/null
    )
}

test_validate_event_type_accepts_on_error() {
    (
        export HOME="$TEST_DIR"
        unset _ARGUMENT_PARSER_LOADED
        unset CONFIG_CONSTANTS_LOADED
        unset _ERROR_HANDLER_LOADED
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
        validate_event_type "on_error" 2>/dev/null
    )
}

test_validate_event_type_accepts_security_check() {
    (
        export HOME="$TEST_DIR"
        unset _ARGUMENT_PARSER_LOADED
        unset CONFIG_CONSTANTS_LOADED
        unset _ERROR_HANDLER_LOADED
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
        validate_event_type "security_check" 2>/dev/null
    )
}

##################################
# validate_timeout_value Tests
##################################
test_validate_timeout_rejects_non_numeric() {
    (
        export HOME="$TEST_DIR"
        unset _ARGUMENT_PARSER_LOADED
        unset CONFIG_CONSTANTS_LOADED
        unset _ERROR_HANDLER_LOADED
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
        ! validate_timeout_value "abc" 2>/dev/null
    )
}

test_validate_timeout_rejects_over_max() {
    (
        export HOME="$TEST_DIR"
        unset _ARGUMENT_PARSER_LOADED
        unset CONFIG_CONSTANTS_LOADED
        unset _ERROR_HANDLER_LOADED
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
        ! validate_timeout_value "99999" 2>/dev/null
    )
}

test_validate_timeout_rejects_under_100() {
    (
        export HOME="$TEST_DIR"
        unset _ARGUMENT_PARSER_LOADED
        unset CONFIG_CONSTANTS_LOADED
        unset _ERROR_HANDLER_LOADED
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
        ! validate_timeout_value "50" 2>/dev/null
    )
}

test_validate_timeout_accepts_valid() {
    (
        export HOME="$TEST_DIR"
        unset _ARGUMENT_PARSER_LOADED
        unset CONFIG_CONSTANTS_LOADED
        unset _ERROR_HANDLER_LOADED
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
        validate_timeout_value "5000" 2>/dev/null
    )
}

##################################
# parse_arguments Tests
##################################
test_parse_arguments_help_sets_flag() {
    (
        export HOME="$TEST_DIR"
        unset _ARGUMENT_PARSER_LOADED
        unset CONFIG_CONSTANTS_LOADED
        unset _ERROR_HANDLER_LOADED
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
        parse_arguments --help >/dev/null 2>&1
        [[ "$PARSED_HELP_REQUESTED" == true ]]
    )
}

test_parse_arguments_debug_enables() {
    (
        export HOME="$TEST_DIR"
        unset _ARGUMENT_PARSER_LOADED
        unset CONFIG_CONSTANTS_LOADED
        unset _ERROR_HANDLER_LOADED
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
        parse_arguments --debug security-auditor >/dev/null 2>&1
        [[ "$PARSED_DEBUG_MODE" == true ]]
    )
}

test_parse_arguments_dry_run_enables() {
    (
        export HOME="$TEST_DIR"
        unset _ARGUMENT_PARSER_LOADED
        unset CONFIG_CONSTANTS_LOADED
        unset _ERROR_HANDLER_LOADED
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
        parse_arguments --dry-run security-auditor >/dev/null 2>&1
        [[ "$PARSED_DRY_RUN" == true ]]
    )
}

test_parse_arguments_rejects_unknown_option() {
    (
        export HOME="$TEST_DIR"
        unset _ARGUMENT_PARSER_LOADED
        unset CONFIG_CONSTANTS_LOADED
        unset _ERROR_HANDLER_LOADED
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
        ! parse_arguments --bogus-flag 2>/dev/null
    )
}

test_parse_arguments_no_args_fails() {
    (
        export HOME="$TEST_DIR"
        unset _ARGUMENT_PARSER_LOADED
        unset CONFIG_CONSTANTS_LOADED
        unset _ERROR_HANDLER_LOADED
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
        ! parse_arguments 2>/dev/null
    )
}

##################################
# Accessor Function Tests
##################################
test_get_parsed_subagent_name() {
    (
        export HOME="$TEST_DIR"
        unset _ARGUMENT_PARSER_LOADED
        unset CONFIG_CONSTANTS_LOADED
        unset _ERROR_HANDLER_LOADED
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
        parse_arguments security-auditor >/dev/null 2>&1
        local name
        name=$(get_parsed_subagent_name)
        [[ "$name" == "security-auditor" ]]
    )
}

test_get_parsed_event_type() {
    (
        export HOME="$TEST_DIR"
        unset _ARGUMENT_PARSER_LOADED
        unset CONFIG_CONSTANTS_LOADED
        unset _ERROR_HANDLER_LOADED
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
        parse_arguments --event pre_write >/dev/null 2>&1
        local event
        event=$(get_parsed_event_type)
        [[ "$event" == "pre_write" ]]
    )
}

test_is_debug_mode_false_by_default() {
    (
        export HOME="$TEST_DIR"
        unset _ARGUMENT_PARSER_LOADED
        unset CONFIG_CONSTANTS_LOADED
        unset _ERROR_HANDLER_LOADED
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
        parse_arguments security-auditor >/dev/null 2>&1
        ! is_debug_mode
    )
}

test_is_dry_run_false_by_default() {
    (
        export HOME="$TEST_DIR"
        unset _ARGUMENT_PARSER_LOADED
        unset CONFIG_CONSTANTS_LOADED
        unset _ERROR_HANDLER_LOADED
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
        parse_arguments security-auditor >/dev/null 2>&1
        ! is_dry_run
    )
}

test_is_help_requested_false_by_default() {
    (
        export HOME="$TEST_DIR"
        unset _ARGUMENT_PARSER_LOADED
        unset CONFIG_CONSTANTS_LOADED
        unset _ERROR_HANDLER_LOADED
        source "$LIB_DIR/argument-parser.sh" 2>/dev/null
        parse_arguments security-auditor >/dev/null 2>&1
        ! is_help_requested
    )
}

##################################
# Main Test Execution
##################################
main() {
    print_test_header

    setup_test_environment

    echo "Module Existence and Loading Tests:"
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
    run_test "Include guard prevents double load" test_include_guard_prevents_double_load

    echo ""
    echo "validate_subagent_name Tests:"
    run_test "Rejects empty name" test_validate_subagent_name_rejects_empty
    run_test "Rejects name too long" test_validate_subagent_name_rejects_too_long
    run_test "Rejects uppercase name" test_validate_subagent_name_rejects_uppercase
    run_test "Rejects leading number" test_validate_subagent_name_rejects_leading_number
    run_test "Accepts valid kebab-case name" test_validate_subagent_name_accepts_valid

    echo ""
    echo "validate_event_type Tests:"
    run_test "Rejects empty event" test_validate_event_type_rejects_empty
    run_test "Rejects unsupported event" test_validate_event_type_rejects_unsupported
    run_test "Accepts pre_write event" test_validate_event_type_accepts_pre_write
    run_test "Accepts on_error event" test_validate_event_type_accepts_on_error
    run_test "Accepts security_check event" test_validate_event_type_accepts_security_check

    echo ""
    echo "validate_timeout_value Tests:"
    run_test "Rejects non-numeric value" test_validate_timeout_rejects_non_numeric
    run_test "Rejects value over max" test_validate_timeout_rejects_over_max
    run_test "Rejects value under 100" test_validate_timeout_rejects_under_100
    run_test "Accepts valid timeout" test_validate_timeout_accepts_valid

    echo ""
    echo "parse_arguments Tests:"
    run_test "--help sets help flag" test_parse_arguments_help_sets_flag
    run_test "--debug enables debug mode" test_parse_arguments_debug_enables
    run_test "--dry-run enables dry run" test_parse_arguments_dry_run_enables
    run_test "Rejects unknown options" test_parse_arguments_rejects_unknown_option
    run_test "No args fails" test_parse_arguments_no_args_fails

    echo ""
    echo "Accessor Function Tests:"
    run_test "get_parsed_subagent_name returns name" test_get_parsed_subagent_name
    run_test "get_parsed_event_type returns event" test_get_parsed_event_type
    run_test "is_debug_mode false by default" test_is_debug_mode_false_by_default
    run_test "is_dry_run false by default" test_is_dry_run_false_by_default
    run_test "is_help_requested false by default" test_is_help_requested_false_by_default

    cleanup_test_environment

    print_test_summary
}

setup_test_trap

main "$@"
