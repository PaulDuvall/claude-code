#!/bin/bash
# Simple validation script for Claude Code custom commands

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

# Deactivate virtual environment
echo "🔚 Deactivating virtual environment..."
deactivate

if [ $exit_code -eq 0 ]; then
    echo ""
    echo "🎉 All commands are valid!"
    echo ""
    echo "Next steps:"
    echo "  1. Deploy commands: ./deploy.sh"
    echo "  2. Test in Claude Code: /xhelp"
else
    echo ""
    echo "💡 Fix the validation errors above and run again"
fi

exit $exit_code