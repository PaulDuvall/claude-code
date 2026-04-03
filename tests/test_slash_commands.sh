#!/usr/bin/env bash
set -uo pipefail

# Test Suite: slash-commands structural validation
#
# Purpose: Behavioral tests verifying slash command files have proper structure
# Tests: Frontmatter, required sections, naming conventions, file integrity

##################################
# Test Configuration
##################################
TEST_NAME="Slash Commands Structural Test Suite"
TEST_DIR="/tmp/test-slash-commands-$$"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ACTIVE_DIR="$SCRIPT_DIR/slash-commands/active"
EXPERIMENTS_DIR="$SCRIPT_DIR/slash-commands/experiments"
source "$(dirname "$0")/lib/test-helpers.sh"

##################################
# Directory Structure Tests
##################################
test_active_dir_exists() {
    [[ -d "$ACTIVE_DIR" ]]
}

test_experiments_dir_exists() {
    [[ -d "$EXPERIMENTS_DIR" ]]
}

test_active_commands_exist() {
    local count
    count=$(find "$ACTIVE_DIR" -name "*.md" -type f 2>/dev/null | wc -l)
    [[ "$count" -gt 0 ]]
}

test_experiments_commands_exist() {
    local count
    count=$(find "$EXPERIMENTS_DIR" -name "*.md" -type f 2>/dev/null | wc -l)
    [[ "$count" -gt 0 ]]
}

##################################
# Naming Convention Tests
##################################
test_active_commands_x_prefix() {
    local bad_files=0
    while IFS= read -r file; do
        local basename
        basename=$(basename "$file")
        if [[ ! "$basename" =~ ^x ]]; then
            echo "  Missing x prefix: $basename" >&2
            ((bad_files++))
        fi
    done < <(find "$ACTIVE_DIR" -name "*.md" -type f 2>/dev/null)
    [[ "$bad_files" -eq 0 ]]
}

test_active_commands_md_extension() {
    local non_md
    non_md=$(find "$ACTIVE_DIR" -type f ! -name "*.md" 2>/dev/null | wc -l)
    [[ "$non_md" -eq 0 ]]
}

test_experiments_commands_x_prefix() {
    local bad_files=0
    while IFS= read -r file; do
        local basename
        basename=$(basename "$file")
        if [[ ! "$basename" =~ ^x ]]; then
            echo "  Missing x prefix: $basename" >&2
            ((bad_files++))
        fi
    done < <(find "$EXPERIMENTS_DIR" -name "*.md" -type f 2>/dev/null)
    [[ "$bad_files" -eq 0 ]]
}

##################################
# Frontmatter Tests
##################################
test_active_commands_have_frontmatter() {
    local missing=0
    while IFS= read -r file; do
        local first_line
        first_line=$(head -1 "$file")
        if [[ "$first_line" != "---" ]]; then
            echo "  Missing frontmatter: $(basename "$file")" >&2
            ((missing++))
        fi
    done < <(find "$ACTIVE_DIR" -name "*.md" -type f 2>/dev/null)
    [[ "$missing" -eq 0 ]]
}

test_active_commands_have_description() {
    local missing=0
    while IFS= read -r file; do
        if ! grep -q "^description:" "$file" 2>/dev/null; then
            echo "  Missing description: $(basename "$file")" >&2
            ((missing++))
        fi
    done < <(find "$ACTIVE_DIR" -name "*.md" -type f 2>/dev/null)
    [[ "$missing" -eq 0 ]]
}

test_active_commands_frontmatter_closed() {
    local unclosed=0
    while IFS= read -r file; do
        local first_line
        first_line=$(head -1 "$file")
        if [[ "$first_line" == "---" ]]; then
            # Count --- lines; should be at least 2 (open and close)
            local dashes
            dashes=$(grep -c "^---$" "$file" 2>/dev/null)
            if [[ "$dashes" -lt 2 ]]; then
                echo "  Unclosed frontmatter: $(basename "$file")" >&2
                ((unclosed++))
            fi
        fi
    done < <(find "$ACTIVE_DIR" -name "*.md" -type f 2>/dev/null)
    [[ "$unclosed" -eq 0 ]]
}

##################################
# Content Structure Tests
##################################
test_active_commands_have_heading() {
    local missing=0
    while IFS= read -r file; do
        if ! grep -q "^#" "$file" 2>/dev/null; then
            echo "  No heading found: $(basename "$file")" >&2
            ((missing++))
        fi
    done < <(find "$ACTIVE_DIR" -name "*.md" -type f 2>/dev/null)
    [[ "$missing" -eq 0 ]]
}

test_active_commands_not_empty() {
    local empty=0
    while IFS= read -r file; do
        local lines
        lines=$(wc -l < "$file")
        if [[ "$lines" -lt 10 ]]; then
            echo "  Too short (<10 lines): $(basename "$file")" >&2
            ((empty++))
        fi
    done < <(find "$ACTIVE_DIR" -name "*.md" -type f 2>/dev/null)
    [[ "$empty" -eq 0 ]]
}

test_commands_no_binary_content() {
    local binary=0
    while IFS= read -r file; do
        if file "$file" 2>/dev/null | grep -q "binary"; then
            echo "  Binary content: $(basename "$file")" >&2
            ((binary++))
        fi
    done < <(find "$ACTIVE_DIR" "$EXPERIMENTS_DIR" -name "*.md" -type f 2>/dev/null)
    [[ "$binary" -eq 0 ]]
}

##################################
# Core Commands Exist Tests
##################################
test_xsecurity_exists() {
    [[ -f "$ACTIVE_DIR/xsecurity.md" ]]
}

test_xtest_exists() {
    [[ -f "$ACTIVE_DIR/xtest.md" ]]
}

test_xquality_exists() {
    [[ -f "$ACTIVE_DIR/xquality.md" ]]
}

test_xgit_exists() {
    [[ -f "$ACTIVE_DIR/xgit.md" ]]
}

test_xdebug_exists() {
    [[ -f "$ACTIVE_DIR/xdebug.md" ]]
}

test_xrefactor_exists() {
    [[ -f "$ACTIVE_DIR/xrefactor.md" ]]
}

test_xverify_exists() {
    [[ -f "$ACTIVE_DIR/xverify.md" ]]
}

##################################
# Security-Sensitive Content Tests
##################################
test_no_hardcoded_secrets_in_commands() {
    local found=0
    while IFS= read -r file; do
        # Check for real secrets but exclude documentation placeholders (e.g. sk-ant-...)
        if grep -E '(sk-ant-|sk-[a-zA-Z0-9]{32}|AKIA[0-9A-Z]{16})' "$file" 2>/dev/null | grep -qvE '(\.\.\.|\.\.\.|xxx|EXAMPLE|placeholder|your-)'; then
            echo "  Possible secret: $(basename "$file")" >&2
            ((found++))
        fi
    done < <(find "$ACTIVE_DIR" "$EXPERIMENTS_DIR" -name "*.md" -type f 2>/dev/null)
    [[ "$found" -eq 0 ]]
}

##################################
# Main Test Execution
##################################
main() {
    print_test_header

    setup_test_environment

    echo "Directory Structure Tests:"
    run_test "Active directory exists" test_active_dir_exists
    run_test "Experiments directory exists" test_experiments_dir_exists
    run_test "Active commands exist" test_active_commands_exist
    run_test "Experimental commands exist" test_experiments_commands_exist

    echo ""
    echo "Naming Convention Tests:"
    run_test "Active commands have x prefix" test_active_commands_x_prefix
    run_test "Active dir has only .md files" test_active_commands_md_extension
    run_test "Experimental commands have x prefix" test_experiments_commands_x_prefix

    echo ""
    echo "Frontmatter Tests:"
    run_test "Active commands have frontmatter" test_active_commands_have_frontmatter
    run_test "Active commands have description" test_active_commands_have_description
    run_test "Frontmatter is properly closed" test_active_commands_frontmatter_closed

    echo ""
    echo "Content Structure Tests:"
    run_test "Commands have headings" test_active_commands_have_heading
    run_test "Commands are not empty" test_active_commands_not_empty
    run_test "No binary content in commands" test_commands_no_binary_content

    echo ""
    echo "Core Commands Exist Tests:"
    run_test "xsecurity.md exists" test_xsecurity_exists
    run_test "xtest.md exists" test_xtest_exists
    run_test "xquality.md exists" test_xquality_exists
    run_test "xgit.md exists" test_xgit_exists
    run_test "xdebug.md exists" test_xdebug_exists
    run_test "xrefactor.md exists" test_xrefactor_exists
    run_test "xverify.md exists" test_xverify_exists

    echo ""
    echo "Security Tests:"
    run_test "No secrets in commands" test_no_hardcoded_secrets_in_commands

    cleanup_test_environment

    print_test_summary
}

setup_test_trap

main "$@"
