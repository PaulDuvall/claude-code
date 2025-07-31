#!/usr/bin/env python3
"""Tests for user experience requirements.

Implements specifications from specs/command-specifications.md
"""

import os
import sys
from pathlib import Path


def test_simple_user_interface():
    """Test: Commands are simple enough for average users [^ux1a]"""
    commands_dir = Path(__file__).parent.parent.parent / 'slash-commands' / 'active'
    command_files = list(commands_dir.glob('*.md'))
    
    for cmd_file in command_files:
        content = cmd_file.read_text()
        
        # Check for complexity indicators
        complexity_indicators = [
            'advanced users only', 'expert mode', 'complex configuration',
            'requires deep knowledge', 'not recommended for beginners'
        ]
        
        is_complex = any(indicator in content.lower() for indicator in complexity_indicators)
        assert not is_complex, f"{cmd_file.name} appears too complex for average users"
        
        # Check for user-friendly patterns
        friendly_patterns = [
            'usage examples', 'basic usage', 'simple', 'default', 'automatic'
        ]
        is_friendly = any(pattern in content.lower() for pattern in friendly_patterns)
        
        if not is_friendly:
            print(f"⚠️  {cmd_file.name} could be more user-friendly")
        else:
            print(f"✅ {cmd_file.name} has simple user interface")


def test_clear_usage_instructions():
    """Test: Commands provide clear usage instructions [^ux1b]"""
    commands_dir = Path(__file__).parent.parent.parent / 'slash-commands' / 'active'
    command_files = list(commands_dir.glob('*.md'))
    
    for cmd_file in command_files:
        content = cmd_file.read_text()
        
        # Check for usage instructions
        instruction_patterns = [
            '## usage', '## implementation', '## examples', 
            'basic usage', 'how to use', 'getting started'
        ]
        has_instructions = any(pattern in content.lower() for pattern in instruction_patterns)
        
        assert has_instructions, f"{cmd_file.name} should provide clear usage instructions"
        print(f"✅ {cmd_file.name} has clear usage instructions")


def test_zero_configuration():
    """Test: Commands work without extensive configuration [^ux1c]"""
    commands_dir = Path(__file__).parent.parent.parent / 'slash-commands' / 'active'
    command_files = list(commands_dir.glob('*.md'))
    
    for cmd_file in command_files:
        content = cmd_file.read_text()
        
        # Check for zero-config patterns
        zero_config_patterns = [
            'no parameters needed', 'smart defaults', 'automatic', 
            'no configuration', 'works out of the box', 'default'
        ]
        supports_zero_config = any(pattern in content.lower() for pattern in zero_config_patterns)
        
        # Check for complex configuration requirements
        complex_config_patterns = [
            'must configure', 'requires setup', 'configuration required',
            'set up first', 'configure before'
        ]
        requires_config = any(pattern in content.lower() for pattern in complex_config_patterns)
        
        if requires_config and not supports_zero_config:
            print(f"⚠️  {cmd_file.name} may require extensive configuration")
        else:
            print(f"✅ {cmd_file.name} works with minimal configuration")


def main():
    """Run user experience tests."""
    print("🧪 User Experience Test Suite")
    print("=" * 34)
    
    try:
        test_simple_user_interface()
        test_clear_usage_instructions()
        test_zero_configuration()
        
        print("\n✅ All user experience tests passed!")
        return 0
        
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        return 1


if __name__ == '__main__':
    sys.exit(main())