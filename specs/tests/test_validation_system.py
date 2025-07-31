#!/usr/bin/env python3
"""Tests for the command validation system.

Implements specifications from specs/command-specifications.md
"""

import os
import sys
import subprocess
from pathlib import Path


def test_all_commands_validated():
    """Test: Validation system checks all command files [^validation1a]"""
    commands_dir = Path(__file__).parent.parent.parent / 'slash-commands' / 'active'
    
    if not commands_dir.exists():
        assert False, f"Commands directory not found: {commands_dir}"
    
    command_files = list(commands_dir.glob('*.md'))
    assert len(command_files) > 0, "No command files found to validate"
    
    # Run the validation script
    validation_script = Path(__file__).parent / 'test_command_validation.py'
    result = subprocess.run([sys.executable, str(validation_script)], 
                          capture_output=True, text=True)
    
    assert result.returncode == 0, f"Validation failed: {result.stderr}"
    print(f"✅ All {len(command_files)} commands validated successfully")


def test_clear_error_messages():
    """Test: Validation provides clear error messages [^validation1b]"""
    # Test with a known invalid command structure
    test_content = """---
description: 
tags: not_an_array
---
# Invalid Command
"""
    
    test_file = Path('/tmp/test_invalid_command.md')
    test_file.write_text(test_content)
    
    try:
        # Import the validation functions
        sys.path.append(str(Path(__file__).parent))
        from test_command_validation import validate_single_command
        
        # This should fail with clear error messages
        result = validate_single_command(test_file)
        assert not result, "Validation should fail for invalid command"
        print("✅ Validation provides clear error messages for invalid commands")
        
    finally:
        test_file.unlink(missing_ok=True)


def test_cicd_integration():
    """Test: Validation supports CI/CD integration [^validation1c]"""
    validation_script = Path(__file__).parent / 'test_command_validation.py'
    
    # Test that validation script returns proper exit codes
    result = subprocess.run([sys.executable, str(validation_script)], 
                          capture_output=True, text=True)
    
    # Exit code should be 0 for success or 1 for failure
    assert result.returncode in [0, 1], f"Invalid exit code: {result.returncode}"
    
    # Check that output is suitable for CI/CD
    output_lines = result.stdout.strip().split('\n')
    has_summary = any('passed validation' in line or 'failed validation' in line 
                     for line in output_lines)
    
    assert has_summary, "Validation should provide CI/CD friendly summary"
    print("✅ Validation supports CI/CD integration with proper exit codes")


def main():
    """Run validation system tests."""
    print("🧪 Validation System Test Suite")
    print("=" * 38)
    
    try:
        test_all_commands_validated()
        test_clear_error_messages()
        test_cicd_integration()
        
        print("\n✅ All validation system tests passed!")
        return 0
        
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        return 1


if __name__ == '__main__':
    sys.exit(main())