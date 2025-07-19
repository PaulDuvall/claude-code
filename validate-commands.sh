#!/bin/bash
# Enhanced validation script for Claude Code custom commands and configuration

# Parse arguments
CHECK_SETTINGS=false
CHECK_INTEGRATION=false
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
            echo "  --verbose           Show detailed output"
            echo "  --help              Show this help"
            echo ""
            echo "Examples:"
            echo "  $0                           # Basic command validation"
            echo "  $0 --check-settings          # Include settings validation"
            echo "  $0 --check-integration       # Run full integration tests"
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

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install Python 3.11 in venv (note: venv inherits Python version from system)
echo "🐍 Using Python version: $(python --version)"

# Install dependencies
echo "📥 Installing dependencies..."
pip install PyYAML

# Run the validation
echo "🔍 Running command validation..."
python specs/tests/test_command_validation.py

exit_code=$?

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

# Deactivate virtual environment
echo "🔚 Deactivating virtual environment..."
deactivate

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