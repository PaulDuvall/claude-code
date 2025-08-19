#!/bin/bash
# Enhanced validation script for Claude Code custom commands and configuration

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source utility functions for dependency validation
source "$SCRIPT_DIR/lib/utils.sh" 2>/dev/null || {
    # Fallback basic dependency check if utils.sh not available
    check_dependency() {
        local cmd="$1"
        if ! command -v "$cmd" &> /dev/null; then
            echo "❌ Error: Required dependency '$cmd' not found"
            return 1
        fi
        return 0
    }
}

# Parse arguments
CHECK_SETTINGS=false
CHECK_INTEGRATION=false
CHECK_SECURITY=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --check-settings)
            CHECK_SETTINGS=true
            shift
            ;;
        --check-integration)
            CHECK_INTEGRATION=true
            shift
            ;;
        --check-security)
            CHECK_SECURITY=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --check-settings     Also validate settings.json files"
            echo "  --check-integration  Run integration tests"
            echo "  --check-security     Validate security improvements"
            echo "  --verbose           Show detailed output"
            echo "  --help              Show this help"
            echo ""
            echo "Examples:"
            echo "  $0                           # Basic command validation"
            echo "  $0 --check-settings          # Include settings validation"
            echo "  $0 --check-security          # Validate security improvements"
            echo "  $0 --check-integration       # Full integration testing"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo "🚀 Claude Code Command Validation"
echo "================================="

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed"
    exit 1
fi

echo "🟢 Using Node.js version: $(node --version)"

# Run the validation using JavaScript tests
echo "🔍 Running command validation..."
if [ -d "claude-dev-toolkit/tests" ]; then
    echo "📥 Installing NPM dependencies..."
    cd claude-dev-toolkit
    npm install --silent > /dev/null 2>&1
    npm run test:commands
    exit_code=$?
    cd ..
else
    echo "❌ No JavaScript test suite found"
    exit_code=1
fi

# Additional validations if requested
if [ "$CHECK_SETTINGS" = true ]; then
    echo ""
    echo "🔍 Validating settings.json templates..."
    
    # Check each template file
    for template in templates/*.json; do
        if [ -f "$template" ]; then
            echo "  📋 Checking $(basename "$template")..."
            # Remove JSON comments and validate
            if grep -v '^\s*//' "$template" | python -m json.tool > /dev/null 2>&1; then
                echo "    ✅ Valid JSON structure"
            else
                echo "    ❌ Invalid JSON in $template"
                exit_code=1
            fi
        fi
    done
    
    # Check user's settings.json if it exists
    if [ -f ~/.claude/settings.json ]; then
        echo "  📋 Checking user's ~/.claude/settings.json..."
        if python -m json.tool ~/.claude/settings.json > /dev/null 2>&1; then
            echo "    ✅ User settings.json is valid"
        else
            echo "    ❌ User settings.json has syntax errors"
            exit_code=1
        fi
    fi
fi

if [ "$CHECK_INTEGRATION" = true ]; then
    echo ""
    echo "🔍 Running integration tests..."
    
    # Test that required scripts exist and are executable
    scripts=("setup.sh" "deploy.sh" "configure-claude-code.sh" "verify-setup.sh")
    for script in "${scripts[@]}"; do
        if [ -f "$script" ] && [ -x "$script" ]; then
            echo "  ✅ $script exists and is executable"
        else
            echo "  ❌ $script missing or not executable"
            exit_code=1
        fi
    done
    
    # Test directory structure
    required_dirs=("slash-commands/active" "templates" "specs" "hooks")
    for dir in "${required_dirs[@]}"; do
        if [ -d "$dir" ]; then
            echo "  ✅ Directory $dir exists"
        else
            echo "  ❌ Directory $dir missing"
            exit_code=1
        fi
    done
    
    # Test that key files exist
    key_files=("templates/basic-settings.json" "hooks/prevent-credential-exposure.sh" "specs/command-specifications.md")
    for file in "${key_files[@]}"; do
        if [ -f "$file" ]; then
            echo "  ✅ Key file $file exists"
        else
            echo "  ❌ Key file $file missing"
            exit_code=1
        fi
    done
    
    # Test setup script dry-run (if Claude Code is installed)
    if command -v claude &> /dev/null; then
        echo "  🧪 Testing setup script dry-run..."
        if ./setup.sh --dry-run > /dev/null 2>&1; then
            echo "    ✅ Setup script dry-run successful"
        else
            echo "    ⚠️  Setup script dry-run had issues (check manually)"
        fi
    else
        echo "  ⚠️  Claude Code not installed - skipping setup script test"
    fi
fi

# Security validation
if [ "$CHECK_SECURITY" = true ]; then
    echo ""
    echo "🔒 Security Validation"
    echo "===================="
    
    # Check dependency validation system
    echo -n "  Dependency validation system: "
    if [[ -f "$SCRIPT_DIR/dependencies.txt" ]]; then
        echo "✅ Available"
        
        # Test dependency validation
        if validate_dependencies "$SCRIPT_DIR/dependencies.txt" >/dev/null 2>&1; then
            echo "    ✅ All required dependencies satisfied"
        else
            echo "    ⚠️  Some dependencies missing"
            exit_code=1
        fi
    else
        echo "❌ Dependencies config missing"
        exit_code=1
    fi
    
    # Check hooks have dependency validation
    echo -n "  Security hooks validation: "
    hooks_with_validation=0
    total_hooks=0
    
    for hook in hooks/*.sh; do
        if [[ -f "$hook" ]]; then
            ((total_hooks++))
            if grep -q "validate.*dependencies\|check_dependency" "$hook" 2>/dev/null; then
                ((hooks_with_validation++))
            fi
        fi
    done
    
    if [[ $total_hooks -eq 0 ]]; then
        echo "⚠️  No hooks found"
    elif [[ $hooks_with_validation -eq $total_hooks ]]; then
        echo "✅ All $total_hooks hooks have dependency validation"
    else
        echo "⚠️  Only $hooks_with_validation/$total_hooks hooks have dependency validation"
        exit_code=1
    fi
    
    # Check main scripts have dependency validation
    echo -n "  Main scripts validation: "
    scripts_with_validation=0
    main_scripts=("setup.sh" "deploy.sh")
    
    for script in "${main_scripts[@]}"; do
        if [[ -f "$script" ]]; then
            if grep -q "validate_dependencies\|check_dependency" "$script" 2>/dev/null; then
                ((scripts_with_validation++))
            fi
        fi
    done
    
    if [[ $scripts_with_validation -eq ${#main_scripts[@]} ]]; then
        echo "✅ All main scripts have dependency validation"
    else
        echo "⚠️  Only $scripts_with_validation/${#main_scripts[@]} main scripts have dependency validation"
        exit_code=1
    fi
    
    # Check file permission settings in scripts
    echo -n "  Secure permissions in scripts: "
    scripts_with_perms=0
    
    for script in "${main_scripts[@]}" hooks/*.sh; do
        if [[ -f "$script" ]]; then
            if grep -q "chmod.*[67]00\|chmod.*600" "$script" 2>/dev/null; then
                ((scripts_with_perms++))
            fi
        fi
    done
    
    if [[ $scripts_with_perms -gt 0 ]]; then
        echo "✅ Scripts implement secure permissions"
    else
        echo "⚠️  Scripts may not set secure permissions"
        exit_code=1
    fi
fi

# Clean up
echo "🧹 Validation complete..."

if [ $exit_code -eq 0 ]; then
    echo ""
    echo "🎉 All validations passed!"
    echo ""
    echo "Next steps:"
    if [ "$CHECK_SETTINGS" = true ] || [ "$CHECK_INTEGRATION" = true ]; then
        echo "  1. Run complete setup: ./setup.sh --dry-run"
        echo "  2. Deploy with: ./setup.sh"
        echo "  3. Verify setup: ./verify-setup.sh"
    else
        echo "  1. Deploy commands: ./deploy.sh"
        echo "  2. Test in Claude Code: /xhelp"
        echo "  3. Run full validation: $0 --check-integration"
    fi
else
    echo ""
    echo "💡 Fix the validation errors above and run again"
fi

exit $exit_code