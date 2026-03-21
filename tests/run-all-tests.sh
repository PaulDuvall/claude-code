#!/bin/bash

# Dynamic Test Runner for Claude Code Tests
# Discovers and runs both JavaScript and shell test files

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

##################################
# Shell Test Runner
##################################
echo "Discovering shell test files..."

SHELL_TEST_FILES=$(find . -maxdepth 1 -name "test_*.sh" -type f | sort)

if [ -n "$SHELL_TEST_FILES" ]; then
    echo "Found shell test files:"
    echo "$SHELL_TEST_FILES" | while read -r file; do
        echo "  - $file"
    done
    echo ""

    for TEST_FILE in $SHELL_TEST_FILES; do
        if [ -n "$TEST_FILE" ]; then
            echo "Running: $TEST_FILE"
            echo "----------------------------------------"

            if timeout 300 bash "$TEST_FILE"; then
                echo "PASSED: $TEST_FILE"
                PASSED_TESTS=$((PASSED_TESTS + 1))
            else
                echo "FAILED: $TEST_FILE"
                FAILED_TESTS=$((FAILED_TESTS + 1))
            fi

            TOTAL_TESTS=$((TOTAL_TESTS + 1))
            echo "----------------------------------------"
            echo ""
        fi
    done
fi

##################################
# JavaScript Test Runner
##################################
echo "Discovering JavaScript test files..."

JS_TEST_FILES=$(find . -maxdepth 1 -name "*.js" -type f | grep -E "(test|spec|validator|tester|validate)" | sort)

# Add customization guide parser test
if [ -f "./customization-guide-parser.js" ]; then
    JS_TEST_FILES="$JS_TEST_FILES ./customization-guide-parser.js"
fi

if [ -n "$JS_TEST_FILES" ]; then
    echo "Found JavaScript test files:"
    echo "$JS_TEST_FILES" | while read -r file; do
        echo "  - $file"
    done
    echo ""

    for TEST_FILE in $JS_TEST_FILES; do
        if [ -n "$TEST_FILE" ]; then
            echo "Running: $TEST_FILE"
            echo "----------------------------------------"

            if [[ "$TEST_FILE" == *"security-validator.js" ]]; then
                INSTALL_GUIDE=""
                if [ -f "../docs/install-guide.md" ]; then
                    INSTALL_GUIDE="../docs/install-guide.md"
                elif [ -f "../README.md" ]; then
                    INSTALL_GUIDE="../README.md"
                fi

                if [ -n "$INSTALL_GUIDE" ]; then
                    if timeout 300 node "$TEST_FILE" "$INSTALL_GUIDE"; then
                        echo "PASSED: $TEST_FILE"
                        PASSED_TESTS=$((PASSED_TESTS + 1))
                    else
                        echo "FAILED: $TEST_FILE"
                        FAILED_TESTS=$((FAILED_TESTS + 1))
                    fi
                else
                    echo "Skipped: no install guide for security-validator.js"
                    continue
                fi
            elif timeout 300 node "$TEST_FILE"; then
                echo "PASSED: $TEST_FILE"
                PASSED_TESTS=$((PASSED_TESTS + 1))
            else
                echo "FAILED: $TEST_FILE"
                FAILED_TESTS=$((FAILED_TESTS + 1))
            fi

            TOTAL_TESTS=$((TOTAL_TESTS + 1))
            echo "----------------------------------------"
            echo ""
        fi
    done
fi

##################################
# Summary
##################################
echo "Test Summary:"
echo "  Total: $TOTAL_TESTS"
echo "  Passed: $PASSED_TESTS"
echo "  Failed: $FAILED_TESTS"

if [ $FAILED_TESTS -gt 0 ]; then
    echo "Some tests failed"
    exit 1
else
    echo "All tests passed"
fi