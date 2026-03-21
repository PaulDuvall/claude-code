#!/usr/bin/env bash
set -uo pipefail

# Validation Reporter Module
#
# Provides validation reporting and batch validation functions
# for subagent definitions.
# Extracted from subagent-validator.sh.

# Include guard
[[ -n "${_VALIDATION_REPORTER_LOADED:-}" ]] && return 0
_VALIDATION_REPORTER_LOADED=1

# Source required modules
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config-constants.sh"
source "$SCRIPT_DIR/error-handler.sh"

##################################
# Batch Validation Functions
##################################

validate_all_subagents() {
    local directory="${1:-$SUBAGENTS_DIR}"
    local validation_mode="${2:-strict}"
    local validation_results=()
    local total_count=0
    local passed_count=0
    local failed_count=0

    log_info "Validating all subagents in: $directory"

    if [[ ! -d "$directory" ]]; then
        log_error "Directory not found: $directory"
        return $EXIT_GENERAL_ERROR
    fi

    find "$directory" -name "*$SUBAGENT_FILE_EXTENSION" -type f 2>/dev/null | while read -r file; do
        ((total_count++))
        local filename
        filename=$(basename "$file")

        if validate_subagent_file "$file" "$validation_mode" 2>/dev/null; then
            ((passed_count++))
            validation_results+=("PASS: $filename")
            log_debug "Validation passed: $filename"
        else
            ((failed_count++))
            validation_results+=("FAIL: $filename")
            log_debug "Validation failed: $filename"
        fi
    done

    # Output results
    log_info "Validation Summary:"
    log_info "  Total subagents: $total_count"
    log_info "  Passed: $passed_count"
    log_info "  Failed: $failed_count"

    # Detailed results in debug mode
    if is_debug_mode 2>/dev/null; then
        for result in "${validation_results[@]}"; do
            log_debug "  $result"
        done
    fi

    if [[ $failed_count -gt 0 ]]; then
        return $EXIT_VALIDATION_FAILED
    fi

    return $EXIT_SUCCESS
}

##################################
# Validation Reporting Functions
##################################

generate_validation_report() {
    local directory="${1:-$SUBAGENTS_DIR}"
    local output_format="${2:-text}"

    log_info "Generating validation report for: $directory"

    case "$output_format" in
        "json")
            generate_json_validation_report "$directory"
            ;;
        "text"|*)
            generate_text_validation_report "$directory"
            ;;
    esac
}

generate_text_validation_report() {
    local directory="$1"

    echo "Subagent Validation Report"
    echo "========================="
    echo "Directory: $directory"
    echo "Generated: $(date)"
    echo ""

    local total=0 passed=0 failed=0

    find "$directory" -name "*$SUBAGENT_FILE_EXTENSION" -type f 2>/dev/null | while read -r file; do
        ((total++))
        local filename name
        filename=$(basename "$file")
        name=$(basename "$file" "$SUBAGENT_FILE_EXTENSION")

        echo -n "Validating $name... "

        if validate_subagent_file "$file" "strict" 2>/dev/null; then
            ((passed++))
            echo "PASSED"
        else
            ((failed++))
            echo "FAILED"
            validate_subagent_file "$file" "strict" 2>&1 | sed "s/^/  Error: /"
        fi
        echo ""
    done

    echo "Summary:"
    echo "  Total: $total"
    echo "  Passed: $passed"
    echo "  Failed: $failed"

    if [[ $failed -eq 0 ]]; then
        echo "  Status: ALL VALID"
    else
        echo "  Status: ISSUES FOUND"
    fi
}
