#!/usr/bin/env bash
set -uo pipefail

# Test Suite: subagent definition validation
#
# Purpose: Validate all subagent definitions have proper structure
# Tests: Frontmatter, required fields, naming conventions

##################################
# Test Configuration
##################################
TEST_NAME="Subagent Definition Validation Test Suite"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SUBAGENTS_DIR="$SCRIPT_DIR/subagents"
source "$(dirname "$0")/lib/test-helpers.sh"

##################################
# Directory Tests
##################################
test_subagents_dir_exists() {
    [[ -d "$SUBAGENTS_DIR" ]]
}

test_subagents_not_empty() {
    local count
    count=$(find "$SUBAGENTS_DIR" -name "*.md" -type f ! -name "README.md" ! -name "TEMPLATE.md" 2>/dev/null | wc -l)
    [[ "$count" -gt 0 ]]
}

##################################
# Naming Convention Tests
##################################
test_lowercase_filenames() {
    local bad=0
    while IFS= read -r file; do
        local basename
        basename=$(basename "$file" .md)
        if [[ "$basename" =~ [A-Z] ]]; then
            echo "  Uppercase in filename: $basename" >&2
            ((bad++))
        fi
    done < <(find "$SUBAGENTS_DIR" -name "*.md" -type f ! -name "README.md" ! -name "TEMPLATE.md" 2>/dev/null)
    [[ "$bad" -eq 0 ]]
}

test_kebab_case_filenames() {
    local bad=0
    while IFS= read -r file; do
        local basename
        basename=$(basename "$file" .md)
        if [[ "$basename" =~ [_\ ] ]]; then
            echo "  Non-kebab-case: $basename" >&2
            ((bad++))
        fi
    done < <(find "$SUBAGENTS_DIR" -name "*.md" -type f ! -name "README.md" ! -name "TEMPLATE.md" 2>/dev/null)
    [[ "$bad" -eq 0 ]]
}

test_md_extension() {
    local non_md
    non_md=$(find "$SUBAGENTS_DIR" -maxdepth 1 -type f ! -name "*.md" 2>/dev/null | wc -l)
    [[ "$non_md" -eq 0 ]]
}

##################################
# Frontmatter Tests
##################################
test_all_have_frontmatter() {
    local missing=0
    while IFS= read -r file; do
        local first_line
        first_line=$(head -1 "$file")
        if [[ "$first_line" != "---" ]]; then
            echo "  Missing frontmatter: $(basename "$file")" >&2
            ((missing++))
        fi
    done < <(find "$SUBAGENTS_DIR" -name "*.md" -type f ! -name "README.md" ! -name "TEMPLATE.md" 2>/dev/null)
    [[ "$missing" -eq 0 ]]
}

test_frontmatter_closed() {
    local unclosed=0
    while IFS= read -r file; do
        local first_line
        first_line=$(head -1 "$file")
        if [[ "$first_line" == "---" ]]; then
            local dashes
            dashes=$(grep -c "^---$" "$file" 2>/dev/null)
            if [[ "$dashes" -lt 2 ]]; then
                echo "  Unclosed frontmatter: $(basename "$file")" >&2
                ((unclosed++))
            fi
        fi
    done < <(find "$SUBAGENTS_DIR" -name "*.md" -type f ! -name "README.md" ! -name "TEMPLATE.md" 2>/dev/null)
    [[ "$unclosed" -eq 0 ]]
}

test_all_have_name_field() {
    local missing=0
    while IFS= read -r file; do
        if ! grep -q "^name:" "$file" 2>/dev/null; then
            echo "  Missing name: $(basename "$file")" >&2
            ((missing++))
        fi
    done < <(find "$SUBAGENTS_DIR" -name "*.md" -type f ! -name "README.md" ! -name "TEMPLATE.md" 2>/dev/null)
    [[ "$missing" -eq 0 ]]
}

test_all_have_description_field() {
    local missing=0
    while IFS= read -r file; do
        if ! grep -q "^description:" "$file" 2>/dev/null; then
            echo "  Missing description: $(basename "$file")" >&2
            ((missing++))
        fi
    done < <(find "$SUBAGENTS_DIR" -name "*.md" -type f ! -name "README.md" ! -name "TEMPLATE.md" 2>/dev/null)
    [[ "$missing" -eq 0 ]]
}

test_all_have_tools_field() {
    local missing=0
    while IFS= read -r file; do
        if ! grep -q "^tools:" "$file" 2>/dev/null; then
            echo "  Missing tools: $(basename "$file")" >&2
            ((missing++))
        fi
    done < <(find "$SUBAGENTS_DIR" -name "*.md" -type f ! -name "README.md" ! -name "TEMPLATE.md" 2>/dev/null)
    [[ "$missing" -eq 0 ]]
}

##################################
# Name Consistency Tests
##################################
test_name_matches_filename() {
    local mismatch=0
    while IFS= read -r file; do
        local basename
        basename=$(basename "$file" .md)
        local name_field
        name_field=$(grep "^name:" "$file" 2>/dev/null | head -1 | sed 's/^name:[[:space:]]*//')
        if [[ -n "$name_field" ]] && [[ "$name_field" != "$basename" ]]; then
            echo "  Mismatch: file=$basename name=$name_field" >&2
            ((mismatch++))
        fi
    done < <(find "$SUBAGENTS_DIR" -name "*.md" -type f ! -name "README.md" ! -name "TEMPLATE.md" 2>/dev/null)
    [[ "$mismatch" -eq 0 ]]
}

##################################
# Content Quality Tests
##################################
test_descriptions_not_empty() {
    local empty=0
    while IFS= read -r file; do
        local desc
        desc=$(grep "^description:" "$file" 2>/dev/null | head -1 | sed 's/^description:\s*//')
        if [[ -z "$desc" ]] || [[ ${#desc} -lt 10 ]]; then
            echo "  Short/empty description: $(basename "$file")" >&2
            ((empty++))
        fi
    done < <(find "$SUBAGENTS_DIR" -name "*.md" -type f ! -name "README.md" ! -name "TEMPLATE.md" 2>/dev/null)
    [[ "$empty" -eq 0 ]]
}

test_content_after_frontmatter() {
    local empty=0
    while IFS= read -r file; do
        # Count lines after frontmatter
        local total_lines
        total_lines=$(wc -l < "$file")
        if [[ "$total_lines" -lt 8 ]]; then
            echo "  Too short (<8 lines): $(basename "$file")" >&2
            ((empty++))
        fi
    done < <(find "$SUBAGENTS_DIR" -name "*.md" -type f ! -name "README.md" ! -name "TEMPLATE.md" 2>/dev/null)
    [[ "$empty" -eq 0 ]]
}

test_no_binary_content() {
    local binary=0
    while IFS= read -r file; do
        if file "$file" 2>/dev/null | grep -q "binary"; then
            echo "  Binary content: $(basename "$file")" >&2
            ((binary++))
        fi
    done < <(find "$SUBAGENTS_DIR" -name "*.md" -type f ! -name "README.md" ! -name "TEMPLATE.md" 2>/dev/null)
    [[ "$binary" -eq 0 ]]
}

##################################
# Core Subagents Exist Tests
##################################
test_security_auditor_exists() {
    [[ -f "$SUBAGENTS_DIR/security-auditor.md" ]]
}

test_debug_specialist_exists() {
    [[ -f "$SUBAGENTS_DIR/debug-specialist.md" ]]
}

test_style_enforcer_exists() {
    [[ -f "$SUBAGENTS_DIR/style-enforcer.md" ]]
}

test_test_writer_exists() {
    [[ -f "$SUBAGENTS_DIR/test-writer.md" ]]
}

test_code_review_assistant_exists() {
    [[ -f "$SUBAGENTS_DIR/code-review-assistant.md" ]]
}

##################################
# Main Test Execution
##################################
main() {
    print_test_header

    echo "Directory Tests:"
    run_test "Subagents directory exists" test_subagents_dir_exists
    run_test "Subagents not empty" test_subagents_not_empty

    echo ""
    echo "Naming Convention Tests:"
    run_test "Lowercase filenames" test_lowercase_filenames
    run_test "Kebab-case filenames" test_kebab_case_filenames
    run_test "All .md extension" test_md_extension

    echo ""
    echo "Frontmatter Tests:"
    run_test "All have frontmatter" test_all_have_frontmatter
    run_test "Frontmatter properly closed" test_frontmatter_closed
    run_test "All have name field" test_all_have_name_field
    run_test "All have description field" test_all_have_description_field
    run_test "All have tools field" test_all_have_tools_field

    echo ""
    echo "Name Consistency Tests:"
    run_test "Name matches filename" test_name_matches_filename

    echo ""
    echo "Content Quality Tests:"
    run_test "Descriptions not empty" test_descriptions_not_empty
    run_test "Content after frontmatter" test_content_after_frontmatter
    run_test "No binary content" test_no_binary_content

    echo ""
    echo "Core Subagents Exist Tests:"
    run_test "security-auditor exists" test_security_auditor_exists
    run_test "debug-specialist exists" test_debug_specialist_exists
    run_test "style-enforcer exists" test_style_enforcer_exists
    run_test "test-writer exists" test_test_writer_exists
    run_test "code-review-assistant exists" test_code_review_assistant_exists

    print_test_summary
}

main "$@"
