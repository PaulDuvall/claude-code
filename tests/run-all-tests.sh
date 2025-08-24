#!/bin/bash

# Dynamic Test Runner for Claude Code Tests
# Automatically discovers and runs all test files in the tests directory

set -e

echo "🔍 Discovering test files in tests directory..."

# Find all test files (*.js files with test/spec/validator/tester/validate in name)
TEST_FILES=$(find . -maxdepth 1 -name "*.js" -type f | grep -E "(test|spec|validator|tester|validate)" | sort)

if [ -z "$TEST_FILES" ]; then
  echo "⚠️ No test files found matching pattern"
  exit 0
fi

echo "📋 Found test files:"
echo "$TEST_FILES" | while read file; do
  echo "  - $file"
done

echo ""
echo "🧪 Running discovered tests..."

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Run each test file and track results
for TEST_FILE in $TEST_FILES; do
  if [ -n "$TEST_FILE" ]; then
    echo "🔧 Running: $TEST_FILE"
    echo "----------------------------------------"
    
    # Handle security-validator.js which needs an install guide parameter
    if [[ "$TEST_FILE" == *"security-validator.js" ]]; then
      # Look for install guide in docs or root directory
      INSTALL_GUIDE=""
      if [ -f "../docs/install-guide.md" ]; then
        INSTALL_GUIDE="../docs/install-guide.md"
      elif [ -f "../README.md" ]; then
        INSTALL_GUIDE="../README.md"
      fi
      
      if [ -n "$INSTALL_GUIDE" ]; then
        if timeout 300 node "$TEST_FILE" "$INSTALL_GUIDE"; then
          echo "✅ PASSED: $TEST_FILE"
          PASSED_TESTS=$((PASSED_TESTS + 1))
        else
          echo "❌ FAILED: $TEST_FILE"
          FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
      else
        echo "⚠️ No install guide found for security-validator.js, skipping..."
        continue
      fi
    elif timeout 300 node "$TEST_FILE"; then
      echo "✅ PASSED: $TEST_FILE"
      PASSED_TESTS=$((PASSED_TESTS + 1))
    else
      echo "❌ FAILED: $TEST_FILE"
      FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo "----------------------------------------"
    echo ""
  fi
done

# Final summary
echo "📊 Test Summary:"
echo "  Total: $TOTAL_TESTS"
echo "  Passed: $PASSED_TESTS" 
echo "  Failed: $FAILED_TESTS"

# Exit with error if any tests failed
if [ $FAILED_TESTS -gt 0 ]; then
  echo "❌ Some tests failed"
  exit 1
else
  echo "✅ All tests passed"
fi