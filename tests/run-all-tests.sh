#!/bin/bash

# Test Runner for Claude Code Tests
# Discovers and runs both shell and JavaScript test files
# Requires: bash, node

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Warn about bash version (many tests need bash 4+ for associative arrays)
if [[ "${BASH_VERSINFO[0]}" -lt 4 ]]; then
    echo "WARNING: bash ${BASH_VERSION} detected. Many tests require bash 4+."
    echo "         Install with: brew install bash"
    echo "         Tests that need bash 4+ will be skipped (not failed)."
    echo ""
fi

##################################
# Shell Tests
##################################
echo "Running shell tests..."

for test_file in test_*.sh; do
    [[ -f "$test_file" ]] || continue
    echo "Running: ./$test_file"
    echo "----------------------------------------"

    if timeout 300 bash "$test_file"; then
        echo "PASSED: ./$test_file"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo "FAILED: ./$test_file"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi

    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo "----------------------------------------"
    echo ""
done

##################################
# JavaScript Tests
##################################
echo "Running JavaScript tests..."

for test_file in *.js; do
    [[ -f "$test_file" ]] || continue
    echo "Running: ./$test_file"
    echo "----------------------------------------"

    if timeout 300 node "$test_file"; then
        echo "PASSED: ./$test_file"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo "FAILED: ./$test_file"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi

    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo "----------------------------------------"
    echo ""
done

##################################
# Summary
##################################
echo "Test Summary:"
echo "  Total: $TOTAL_TESTS"
echo "  Passed: $PASSED_TESTS"
echo "  Failed: $FAILED_TESTS"

if [[ $FAILED_TESTS -gt 0 ]]; then
    echo "Some tests failed"
    exit 1
else
    echo "All tests passed"
fi
