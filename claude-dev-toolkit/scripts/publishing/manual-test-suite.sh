#!/bin/bash

# Claude Dev Toolkit Manual Test Suite
# Comprehensive test script for manual installation and validation

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Test function wrapper
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    log_info "Running: $test_name"
    if eval "$test_command" > /dev/null 2>&1; then
        log_success "$test_name"
    else
        log_error "$test_name"
        return 1
    fi
}

echo "🧪 Claude Dev Toolkit Manual Test Suite"
echo "========================================"
echo "Testing complete package installation and functionality"
echo ""

# Step 1: Environment Cleanup
echo "🗑️  Step 1: Environment Cleanup"
echo "--------------------------------"

log_info "Removing existing installations"
npm uninstall -g claude-dev-toolkit 2>/dev/null || true
rm -rf ~/claude-toolkit-test 2>/dev/null || true
rm -rf ~/.claude/commands/ ~/.claude/hooks/ 2>/dev/null || true
npm cache clean --force > /dev/null 2>&1
log_success "Environment cleaned"

# Step 2: Test Directory Setup
echo ""
echo "📁 Step 2: Test Directory Setup"
echo "--------------------------------"

mkdir -p ~/claude-toolkit-test
cd ~/claude-toolkit-test
log_success "Test directory created"

# Check if we're in the source repo already
if [[ -d "$(pwd)/claude-dev-toolkit" ]]; then
    log_info "Using existing claude-dev-toolkit source"
    cd claude-dev-toolkit
else
    log_info "Cloning source repository"
    git clone https://github.com/PaulDuvall/claude-code.git
    cd claude-code/claude-dev-toolkit
fi

run_test "Package.json exists" "test -f package.json"
run_test "Binary exists" "test -f bin/claude-commands"

# Step 3: Dependency Installation
echo ""
echo "📦 Step 3: Dependency Installation"
echo "-----------------------------------"

log_info "Installing package dependencies"
npm cache clean --force > /dev/null 2>&1
rm -rf node_modules package-lock.json 2>/dev/null || true

if npm install --silent; then
    log_success "Dependencies installed successfully"
    log_info "Post-install script created commands structure"
else
    log_error "Dependency installation failed"
    exit 1
fi

# Step 4: Global Package Installation
echo ""
echo "🌐 Step 4: Global Package Installation"
echo "--------------------------------------"

log_info "Installing package globally"
if npm install -g . > /dev/null 2>&1; then
    log_success "Global installation completed"
else
    log_error "Global installation failed"
    exit 1
fi

# Step 5: CLI Command Testing
echo ""
echo "⚡ Step 5: CLI Command Testing"
echo "------------------------------"

run_test "CLI binary is accessible" "which claude-commands"
run_test "Version command works" "claude-commands --version"
run_test "Help command works" "claude-commands --help"
run_test "List command works" "claude-commands list"
run_test "Status command works" "claude-commands status"

# Step 6: Package Validation
echo ""
echo "✅ Step 6: Package Validation"
echo "------------------------------"

run_test "Package validation passes" "npm run validate"

# Step 7: File Structure Verification
echo ""
echo "📂 Step 7: File Structure Verification"
echo "---------------------------------------"

run_test "Claude directory exists" "test -d ~/.claude"
run_test "Commands directory exists" "test -d ~/.claude/commands"
run_test "Active commands exist" "test -d ~/.claude/commands/active"
run_test "Experimental commands exist" "test -d ~/.claude/commands/experiments"

# Count installed commands
ACTIVE_COUNT=$(ls ~/.claude/commands/active/ 2>/dev/null | wc -l | xargs)
EXPERIMENTAL_COUNT=$(ls ~/.claude/commands/experiments/ 2>/dev/null | wc -l | xargs)

if [[ "$ACTIVE_COUNT" -eq 13 ]]; then
    log_success "Active commands count correct ($ACTIVE_COUNT)"
else
    log_error "Active commands count incorrect (expected 13, got $ACTIVE_COUNT)"
fi

if [[ "$EXPERIMENTAL_COUNT" -eq 45 ]]; then
    log_success "Experimental commands count correct ($EXPERIMENTAL_COUNT)"
else
    log_error "Experimental commands count incorrect (expected 45, got $EXPERIMENTAL_COUNT)"
fi

# Step 8: Command Structure Testing
echo ""
echo "🔍 Step 8: Command Structure Testing"
echo "------------------------------------"

run_test "Sample command has YAML frontmatter" "head -1 ~/.claude/commands/active/xtest.md | grep -q '^---'"
run_test "Sample command has description" "grep -q 'description:' ~/.claude/commands/active/xtest.md"
run_test "Sample command has tags" "grep -q 'tags:' ~/.claude/commands/active/xtest.md"

# Step 9: Comprehensive Test Suite
echo ""
echo "🧪 Step 9: Comprehensive Test Suite"
echo "-----------------------------------"

log_info "Running full test suite (this may take a moment)"
if npm test > /tmp/test-results.log 2>&1; then
    log_success "All package tests passed"
    # Show summary from test results
    if grep -q "Success Rate: 100.0%" /tmp/test-results.log; then
        log_success "100% test success rate confirmed"
    fi
else
    log_error "Package tests failed"
    log_warning "Check /tmp/test-results.log for details"
fi

# Step 10: Claude Code Integration Check
echo ""
echo "🔗 Step 10: Claude Code Integration Check"  
echo "-----------------------------------------"

# Check for Claude Code installation
if which claude > /dev/null 2>&1; then
    log_success "Claude Code is installed"
    log_info "Commands should be available in Claude Code interface"
    log_info "Try: /xhelp, /xtest --help, /xgit --help"
else
    log_warning "Claude Code not installed - cannot test integration"
    log_info "Install with: npm install -g @anthropic-ai/claude-code"
fi

# Final Results Summary
echo ""
echo "📊 Final Results Summary"
echo "========================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
if [[ $TOTAL_TESTS -gt 0 ]]; then
    SUCCESS_RATE=$(( (TESTS_PASSED * 100) / TOTAL_TESTS ))
    echo "Success Rate: $SUCCESS_RATE%"
fi

echo ""
if [[ $TESTS_FAILED -eq 0 ]]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo "The claude-dev-toolkit package is working correctly."
    echo ""
    echo "Next Steps:"
    echo "1. Open Claude Code interface"
    echo "2. Try: /xhelp"
    echo "3. Try: /xtest --help"
    echo "4. Try: /xgit --help"
    echo ""
    echo "Package is ready for production use!"
    exit 0
else
    echo -e "${RED}❌ Some tests failed.${NC}"
    echo "Please review the errors above and fix issues before proceeding."
    exit 1
fi