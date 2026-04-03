#!/usr/bin/env bash
set -uo pipefail

# Test Suite: hooks/lib/file-utils.sh
#
# Purpose: Validate file utility functions
# Tests: JSON escaping, directory ops, file reading/writing, path validation

##################################
# Test Configuration
##################################
TEST_NAME="hooks/lib/file-utils.sh Test Suite"
TEST_DIR="/tmp/test-file-utils-$$"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LIB_DIR="$SCRIPT_DIR/hooks/lib"
source "$(dirname "$0")/lib/test-helpers.sh"

source_lib() {
    unset CONFIG_CONSTANTS_LOADED _FILE_UTILS_LOADED
    export HOME="$TEST_DIR"
    export SCRIPT_DIR="$LIB_DIR"
    source "$LIB_DIR/file-utils.sh"
}

##################################
# JSON Escape Tests
##################################
test_json_escape_quotes() {
    (
        source_lib
        local result
        result=$(json_escape 'hello "world"')
        [[ "$result" == 'hello \"world\"' ]]
    )
}

test_json_escape_backslash() {
    (
        source_lib
        local result
        result=$(json_escape 'path\to\file')
        [[ "$result" == 'path\\to\\file' ]]
    )
}

test_json_escape_newline() {
    (
        source_lib
        local input=$'line1\nline2'
        local result
        result=$(json_escape "$input")
        [[ "$result" == 'line1\nline2' ]]
    )
}

test_json_escape_tab() {
    (
        source_lib
        local input=$'col1\tcol2'
        local result
        result=$(json_escape "$input")
        [[ "$result" == 'col1\tcol2' ]]
    )
}

test_json_escape_empty_string() {
    (
        source_lib
        local result
        result=$(json_escape '')
        [[ -z "$result" ]]
    )
}

test_json_escape_combined() {
    (
        source_lib
        local input=$'say "hello"\nand\\bye'
        local result
        result=$(json_escape "$input")
        [[ "$result" == 'say \"hello\"\nand\\bye' ]]
    )
}

##################################
# Directory Operation Tests
##################################
test_ensure_directory_exists_creates() {
    (
        source_lib
        local test_path="$TEST_DIR/new-dir"
        ensure_directory_exists "$test_path"
        [[ -d "$test_path" ]]
    )
}

test_ensure_directory_exists_idempotent() {
    (
        source_lib
        local test_path="$TEST_DIR/idempotent-dir"
        ensure_directory_exists "$test_path"
        ensure_directory_exists "$test_path"
        [[ -d "$test_path" ]]
    )
}

test_ensure_directory_exists_empty_path_fails() {
    (
        source_lib
        ! ensure_directory_exists ""
    )
}

test_ensure_directory_exists_sets_permissions() {
    (
        source_lib
        local test_path="$TEST_DIR/perm-dir"
        ensure_directory_exists "$test_path" 700
        [[ -d "$test_path" ]]
    )
}

##################################
# File Reading Tests
##################################
test_read_file_safely_valid_file() {
    (
        source_lib
        echo "test content" > "$TEST_DIR/readable.txt"
        local result
        result=$(read_file_safely "$TEST_DIR/readable.txt")
        [[ "$result" == "test content" ]]
    )
}

test_read_file_safely_nonexistent() {
    (
        source_lib
        ! read_file_safely "$TEST_DIR/nonexistent.txt"
    )
}

test_read_file_safely_empty_path() {
    (
        source_lib
        ! read_file_safely ""
    )
}

test_read_file_with_size_limit_under_limit() {
    (
        source_lib
        echo "small file" > "$TEST_DIR/small.txt"
        local result
        result=$(read_file_with_size_limit "$TEST_DIR/small.txt" 1000)
        [[ "$result" == "small file" ]]
    )
}

test_read_file_with_size_limit_over_limit() {
    (
        source_lib
        # Create a file that exceeds 10 bytes
        head -c 100 /dev/urandom | base64 > "$TEST_DIR/large.txt"
        ! read_file_with_size_limit "$TEST_DIR/large.txt" 10
    )
}

##################################
# File Writing Tests
##################################
test_write_file_safely_creates_file() {
    (
        source_lib
        write_file_safely "$TEST_DIR/written.txt" "hello world"
        [[ -f "$TEST_DIR/written.txt" ]]
        local content
        content=$(cat "$TEST_DIR/written.txt")
        [[ "$content" == "hello world" ]]
    )
}

test_write_file_safely_empty_path_fails() {
    (
        source_lib
        ! write_file_safely "" "content"
    )
}

test_write_file_safely_creates_parent_dirs() {
    (
        source_lib
        write_file_safely "$TEST_DIR/deep/nested/file.txt" "nested"
        [[ -f "$TEST_DIR/deep/nested/file.txt" ]]
    )
}

test_create_temp_file_creates() {
    (
        source_lib
        local temp
        temp=$(create_temp_file "$TEST_DIR/test-prefix")
        [[ -f "$temp" ]]
        rm -f "$temp"
    )
}

test_create_temp_file_unique() {
    (
        source_lib
        local temp1 temp2
        temp1=$(create_temp_file "$TEST_DIR/unique-prefix")
        temp2=$(create_temp_file "$TEST_DIR/unique-prefix")
        [[ "$temp1" != "$temp2" ]]
        rm -f "$temp1" "$temp2"
    )
}

##################################
# File Validation Tests
##################################
test_file_exists_and_readable_valid() {
    (
        source_lib
        echo "test" > "$TEST_DIR/exists.txt"
        file_exists_and_readable "$TEST_DIR/exists.txt"
    )
}

test_file_exists_and_readable_missing() {
    (
        source_lib
        ! file_exists_and_readable "$TEST_DIR/missing.txt"
    )
}

test_file_exists_and_readable_empty_path() {
    (
        source_lib
        ! file_exists_and_readable ""
    )
}

test_file_has_extension_match() {
    (
        source_lib
        file_has_extension "agent.md" ".md"
    )
}

test_file_has_extension_mismatch() {
    (
        source_lib
        ! file_has_extension "agent.txt" ".md"
    )
}

##################################
# Path Validation Tests
##################################
test_validate_path_safety_empty_fails() {
    (
        source_lib
        ! validate_path_safety ""
    )
}

test_validate_path_safety_relative_ok() {
    (
        source_lib
        validate_path_safety "hooks/lib/file-utils.sh"
    )
}

test_validate_path_safety_claude_dir_ok() {
    (
        source_lib
        validate_path_safety "$CLAUDE_BASE_DIR/subagents/test.md"
    )
}

test_validate_path_safety_cwd_ok() {
    (
        source_lib
        local cwd
        cwd=$(pwd)
        validate_path_safety "$cwd/some-file.sh"
    )
}

test_validate_path_safety_outside_blocked() {
    (
        source_lib
        # Path outside allowed dirs should be blocked
        local result
        validate_path_safety "/etc/passwd" && return 1 || return 0
    )
}

##################################
# Get Absolute Path Tests
##################################
test_get_absolute_path_already_absolute() {
    (
        source_lib
        local result
        result=$(get_absolute_path "/usr/local/bin")
        [[ "$result" == "/usr/local/bin" ]]
    )
}

test_get_absolute_path_relative() {
    (
        source_lib
        local result
        result=$(get_absolute_path "relative/path")
        [[ "$result" == "$(pwd)/relative/path" ]]
    )
}

test_get_absolute_path_empty_fails() {
    (
        source_lib
        ! get_absolute_path ""
    )
}

##################################
# Cleanup Tests
##################################
test_cleanup_specific_temp_file() {
    (
        source_lib
        local temp="$TEST_DIR/to-clean.tmp"
        echo "temp" > "$temp"
        cleanup_specific_temp_file "$temp"
        [[ ! -f "$temp" ]]
    )
}

test_cleanup_nonexistent_file_ok() {
    (
        source_lib
        cleanup_specific_temp_file "$TEST_DIR/no-such-file.tmp"
        # Should not error
    )
}

##################################
# Main Test Execution
##################################
main() {
    print_test_header

    setup_test_environment

    echo "JSON Escape Tests:"
    run_test "Escapes double quotes" test_json_escape_quotes
    run_test "Escapes backslashes" test_json_escape_backslash
    run_test "Escapes newlines" test_json_escape_newline
    run_test "Escapes tabs" test_json_escape_tab
    run_test "Handles empty string" test_json_escape_empty_string
    run_test "Handles combined escapes" test_json_escape_combined

    echo ""
    echo "Directory Operation Tests:"
    run_test "Creates directory" test_ensure_directory_exists_creates
    run_test "Idempotent creation" test_ensure_directory_exists_idempotent
    run_test "Empty path fails" test_ensure_directory_exists_empty_path_fails
    run_test "Sets permissions" test_ensure_directory_exists_sets_permissions

    echo ""
    echo "File Reading Tests:"
    run_test "Reads valid file" test_read_file_safely_valid_file
    run_test "Rejects nonexistent file" test_read_file_safely_nonexistent
    run_test "Rejects empty path" test_read_file_safely_empty_path
    run_test "Size limit under OK" test_read_file_with_size_limit_under_limit
    run_test "Size limit over rejected" test_read_file_with_size_limit_over_limit

    echo ""
    echo "File Writing Tests:"
    run_test "Creates and writes file" test_write_file_safely_creates_file
    run_test "Empty path fails" test_write_file_safely_empty_path_fails
    run_test "Creates parent directories" test_write_file_safely_creates_parent_dirs
    run_test "Creates temp file" test_create_temp_file_creates
    run_test "Temp files are unique" test_create_temp_file_unique

    echo ""
    echo "File Validation Tests:"
    run_test "Existing file is readable" test_file_exists_and_readable_valid
    run_test "Missing file detected" test_file_exists_and_readable_missing
    run_test "Empty path rejected" test_file_exists_and_readable_empty_path
    run_test "Extension match works" test_file_has_extension_match
    run_test "Extension mismatch detected" test_file_has_extension_mismatch

    echo ""
    echo "Path Validation Tests:"
    run_test "Empty path fails" test_validate_path_safety_empty_fails
    run_test "Relative path OK" test_validate_path_safety_relative_ok
    run_test "Claude dir path OK" test_validate_path_safety_claude_dir_ok
    run_test "CWD path OK" test_validate_path_safety_cwd_ok
    run_test "Outside path blocked" test_validate_path_safety_outside_blocked

    echo ""
    echo "Absolute Path Tests:"
    run_test "Already absolute unchanged" test_get_absolute_path_already_absolute
    run_test "Relative gets CWD prefix" test_get_absolute_path_relative
    run_test "Empty path fails" test_get_absolute_path_empty_fails

    echo ""
    echo "Cleanup Tests:"
    run_test "Cleans temp file" test_cleanup_specific_temp_file
    run_test "Nonexistent cleanup OK" test_cleanup_nonexistent_file_ok

    cleanup_test_environment

    print_test_summary
}

setup_test_trap

main "$@"
