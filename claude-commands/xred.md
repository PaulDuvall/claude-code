# /xred — Write Failing Tests First

Write failing tests for specifications following TDD Red phase principles.

## What it does:
- **Creates** failing tests for specific requirements
- **Validates** test fails for the right reason
- **Links** tests to specifications with traceability
- **Ensures** proper test structure and format

## Usage:
```bash
/xred --spec <spec-id>       # Create test for specific requirement
/xred --component <name>     # Create test for new component
```

---

#!/bin/bash

# Custom Claude Code slash‑command for writing failing tests first (RED phase)
# Implements TDD Red phase with specification traceability

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[RED]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[RED]${NC} $1"
}

print_error() {
    echo -e "${RED}[RED]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[RED]${NC} $1"
}

print_red() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Check if we're in a project directory
if [ ! -d "specs" ]; then
    print_error "Not in a SpecDriven AI project (specs/ directory not found)"
    print_info "Run '/xsetup --env' to initialize project structure"
    exit 1
fi

# Ensure test directory exists
mkdir -p specs/tests

case "$1" in
    --spec)
        if [ -z "$2" ]; then
            print_error "Usage: /xred --spec <spec-id>"
            exit 1
        fi
        
        SPEC_ID="$2"
        print_status "Creating failing test for specification: $SPEC_ID"
        
        # Check if specification exists
        if ! grep -r "#{#$SPEC_ID" specs/specifications/ > /dev/null 2>&1; then
            print_error "Specification $SPEC_ID not found"
            print_info "Use '/xspec --read $SPEC_ID' to check available specifications"
            exit 1
        fi
        
        # Read specification details
        print_info "Reading specification $SPEC_ID..."
        SPEC_CONTENT=$(grep -A 20 -B 2 "#{#$SPEC_ID" specs/specifications/*)
        echo "$SPEC_CONTENT"
        
        # Determine component name from spec file
        SPEC_FILE=$(grep -l "#{#$SPEC_ID" specs/specifications/*)
        COMPONENT_NAME=$(basename "$SPEC_FILE" .md)
        TEST_FILE="specs/tests/test_${COMPONENT_NAME}.py"
        
        print_info "Creating test file: $TEST_FILE"
        
        # Check if test file already exists
        if [ -f "$TEST_FILE" ]; then
            print_warning "Test file already exists: $TEST_FILE"
            
            # Check if this specific spec is already tested
            if grep -q "$SPEC_ID" "$TEST_FILE"; then
                print_warning "Test for $SPEC_ID already exists in $TEST_FILE"
                print_info "Running existing test to verify it fails..."
                
                # Run the specific test
                if python -m pytest "$TEST_FILE" -v -k "$SPEC_ID"; then
                    print_error "Test is already passing! This violates RED phase."
                    print_info "Either remove the implementation or fix the test"
                    exit 1
                else
                    print_red "✓ Test fails as expected (RED phase satisfied)"
                fi
            else
                print_info "Adding test for $SPEC_ID to existing file"
                
                # Add test case to existing file
                echo "
# Test for specification $SPEC_ID
def test_${SPEC_ID}_requirement():
    \"\"\"
    Test for specification $SPEC_ID
    
    This test should fail initially (RED phase) and pass
    after implementation (GREEN phase).
    \"\"\"
    # TODO: Implement test based on specification requirements
    # This test should fail until implementation is complete
    assert False, \"Test not implemented for $SPEC_ID\"
" >> "$TEST_FILE"
                
                print_status "Added test case for $SPEC_ID to $TEST_FILE"
            fi
        else
            # Create new test file
            cat > "$TEST_FILE" << EOF
"""
Tests for $COMPONENT_NAME component

This file contains tests linked to specifications in specs/specifications/
Each test should reference its specification ID for traceability.
"""

import pytest


# Test for specification $SPEC_ID
def test_${SPEC_ID}_requirement():
    """
    Test for specification $SPEC_ID
    
    This test should fail initially (RED phase) and pass
    after implementation (GREEN phase).
    
    Specification Reference: specs/specifications/$COMPONENT_NAME.md#{#$SPEC_ID}
    """
    # TODO: Implement test based on specification requirements
    # This test should fail until implementation is complete
    assert False, "Test not implemented for $SPEC_ID"


# Add more tests for other specifications as needed
EOF
            
            print_status "Created new test file: $TEST_FILE"
        fi
        
        # Verify test fails
        print_status "Verifying test fails (RED phase)..."
        if python -m pytest "$TEST_FILE" -v -k "$SPEC_ID"; then
            print_error "Test passes when it should fail!"
            print_error "This violates TDD RED phase principles"
            exit 1
        else
            print_red "✓ Test fails as expected"
            print_status "RED phase complete for $SPEC_ID"
            print_info "Next step: Implement code to make test pass (/xtdd --green)"
        fi
        ;;
    --component)
        if [ -z "$2" ]; then
            print_error "Usage: /xred --component <name>"
            exit 1
        fi
        
        COMPONENT_NAME="$2"
        TEST_FILE="specs/tests/test_${COMPONENT_NAME}.py"
        
        print_status "Creating failing test for new component: $COMPONENT_NAME"
        
        if [ -f "$TEST_FILE" ]; then
            print_warning "Test file already exists: $TEST_FILE"
            print_info "Use '/xred --spec <spec-id>' to add specific requirement tests"
            exit 1
        fi
        
        # Create basic test structure for new component
        cat > "$TEST_FILE" << EOF
"""
Tests for $COMPONENT_NAME component

This file contains tests for the $COMPONENT_NAME component.
Each test should reference its specification ID for traceability.
"""

import pytest


def test_${COMPONENT_NAME}_exists():
    """
    Basic test to verify $COMPONENT_NAME component can be imported
    
    This test should fail initially (RED phase) until the component
    is created and properly structured.
    """
    try:
        # TODO: Import your component here
        # from your_module import $COMPONENT_NAME
        assert False, "$COMPONENT_NAME component not implemented yet"
    except ImportError:
        assert False, "$COMPONENT_NAME module not found"


def test_${COMPONENT_NAME}_basic_functionality():
    """
    Test basic functionality of $COMPONENT_NAME
    
    This test should fail initially and guide implementation.
    """
    # TODO: Add specific tests based on component requirements
    # Reference specification IDs in test names and docstrings
    assert False, "Basic functionality not implemented for $COMPONENT_NAME"


# Add more tests as you create specifications for this component
# Use pattern: test_<spec_id>_<description> for traceability
EOF
        
        print_status "Created test file: $TEST_FILE"
        
        # Verify tests fail
        print_status "Verifying tests fail (RED phase)..."
        if python -m pytest "$TEST_FILE" -v; then
            print_error "Tests pass when they should fail!"
            print_error "This violates TDD RED phase principles"
            exit 1
        else
            print_red "✓ Tests fail as expected"
            print_status "RED phase complete for component $COMPONENT_NAME"
            print_info "Next steps:"
            print_info "  1. Create specifications for $COMPONENT_NAME"
            print_info "  2. Add specific tests with '/xred --spec <spec-id>'"
            print_info "  3. Implement code to make tests pass"
        fi
        ;;
    *)
        print_error "Unknown option: $1"
        print_info "Available options:"
        print_info "  --spec <spec-id>     Create test for specific requirement"
        print_info "  --component <name>   Create test for new component"
        print_info ""
        print_info "TDD RED phase principles:"
        print_info "  1. Write test that describes desired behavior"
        print_info "  2. Test should fail initially"
        print_info "  3. Test should fail for the right reason"
        print_info "  4. Link test to specification for traceability"
        print_info ""
        print_info "Example workflow:"
        print_info "  1. /xred --spec cli1a        # Create failing test"
        print_info "  2. /xtdd --green             # Implement minimal code"
        print_info "  3. /xtdd --refactor          # Improve code quality"
        print_info "  4. /xtdd --commit cli1a      # Commit with traceability"
        exit 1
        ;;
esac