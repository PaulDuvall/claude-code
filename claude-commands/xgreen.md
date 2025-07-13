# /xgreen — Make Tests Pass

Implement minimal code to make failing tests pass following TDD Green phase principles.

## What it does:
- **Implements** minimal code to make tests pass
- **Verifies** tests pass after implementation
- **Maintains** focus on simplicity over perfection
- **Prepares** for refactoring phase

## Usage:
```bash
/xgreen --minimal            # Implement just enough to pass
/xgreen --check              # Verify tests pass
```

---

#!/bin/bash

# Custom Claude Code slash‑command for making tests pass (GREEN phase)
# Implements TDD Green phase with minimal implementation focus

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[GREEN]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[GREEN]${NC} $1"
}

print_error() {
    echo -e "${RED}[GREEN]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[GREEN]${NC} $1"
}

print_green() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

# Check if we're in a project directory
if [ ! -d "specs" ]; then
    print_error "Not in a SpecDriven AI project (specs/ directory not found)"
    print_info "Run '/xsetup --env' to initialize project structure"
    exit 1
fi

case "$1" in
    --minimal)
        print_status "Starting GREEN phase - implementing minimal code to make tests pass"
        
        # Check if there are tests to run
        if [ ! -d "specs/tests" ] || [ -z "$(ls -A specs/tests/)" ]; then
            print_error "No tests found in specs/tests/"
            print_info "Run '/xred --spec <spec-id>' to create failing tests first"
            exit 1
        fi
        
        # Show current failing tests
        print_status "Checking current test status..."
        
        FAILING_TESTS=""
        if ! python -m pytest specs/tests/ --tb=no -q; then
            print_info "Found failing tests - this is expected for GREEN phase"
            
            # Show which tests are failing
            print_info "Failing tests:"
            python -m pytest specs/tests/ --tb=line -v | grep FAILED || true
            
            echo
            print_status "GREEN phase guidelines:"
            print_info "  1. ✓ Make tests pass with MINIMAL code"
            print_info "  2. ✓ Don't worry about code quality yet"
            print_info "  3. ✓ Hardcode values if necessary"
            print_info "  4. ✓ Focus on making tests green, not elegant code"
            print_info "  5. ✗ Don't add extra functionality"
            print_info "  6. ✗ Don't optimize or refactor yet"
            
            echo
            echo "Implement the minimal code needed to make tests pass..."
            echo "Focus on simple, direct solutions that satisfy the test requirements."
            echo
            echo "Press Enter when you've implemented code and want to verify tests pass..."
            read -r
            
            # Verify tests now pass
            print_status "Verifying tests pass after implementation..."
            if python -m pytest specs/tests/ -v; then
                print_green "✓ All tests passing!"
                print_status "GREEN phase complete"
                print_info "Next step: Run '/xtdd --refactor' to improve code quality"
            else
                print_error "Some tests still failing"
                print_info "Continue implementing until all tests pass"
                print_info "Remember: minimal implementation is the goal"
                exit 1
            fi
        else
            print_warning "All tests are already passing!"
            print_info "Either GREEN phase is already complete, or no failing tests exist"
            print_info "If starting TDD cycle, ensure you have failing tests first (/xred --spec <spec-id>)"
        fi
        ;;
    --check)
        print_status "Checking if tests pass (GREEN phase verification)"
        
        if [ ! -d "specs/tests" ] || [ -z "$(ls -A specs/tests/)" ]; then
            print_error "No tests found in specs/tests/"
            exit 1
        fi
        
        # Run tests with detailed output
        print_info "Running all tests..."
        
        if python -m pytest specs/tests/ -v; then
            print_green "✓ All tests passing!"
            print_status "GREEN phase requirements satisfied"
            
            # Show test coverage if available
            if command -v pytest > /dev/null 2>&1; then
                print_info "Generating coverage report..."
                python -m pytest specs/tests/ --cov=. --cov-report=term-missing 2>/dev/null || print_warning "Coverage report unavailable"
            fi
            
            print_info "Ready for next phase:"
            print_info "  - Run '/xtdd --refactor' to improve code quality"
            print_info "  - Or run '/xtdd --commit <spec-id>' to commit changes"
        else
            print_error "Tests are failing!"
            print_info "GREEN phase not complete - continue implementing code"
            
            # Show specific failures
            print_info "Failed tests:"
            python -m pytest specs/tests/ --tb=short | grep -E "(FAILED|ERROR)" || true
            
            exit 1
        fi
        ;;
    *)
        print_error "Unknown option: $1"
        print_info "Available options:"
        print_info "  --minimal            Implement just enough to pass tests"
        print_info "  --check              Verify tests pass"
        print_info ""
        print_info "TDD GREEN phase principles:"
        print_info "  1. Make tests pass as quickly as possible"
        print_info "  2. Use the simplest implementation that works"
        print_info "  3. Hardcode values if it makes tests pass"
        print_info "  4. Don't worry about code quality or elegance"
        print_info "  5. Focus only on making tests green"
        print_info "  6. Refactoring comes in the next phase"
        print_info ""
        print_info "Example workflow:"
        print_info "  1. /xred --spec cli1a        # RED: Create failing test"
        print_info "  2. /xgreen --minimal         # GREEN: Make test pass"
        print_info "  3. /xgreen --check           # Verify all tests pass"
        print_info "  4. /xtdd --refactor          # REFACTOR: Improve code"
        print_info "  5. /xtdd --commit cli1a      # Commit with traceability"
        exit 1
        ;;
esac