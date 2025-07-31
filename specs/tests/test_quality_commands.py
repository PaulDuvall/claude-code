#!/usr/bin/env python3
"""Tests for quality check commands.

Implements specifications from specs/command-specifications.md
"""

import os
import sys
from pathlib import Path


def test_tool_detection():
    """Test: Quality commands detect available tools before execution [^quality1a]"""
    commands_dir = Path(__file__).parent.parent.parent / 'slash-commands' / 'active'
    quality_commands = ['xquality.md']
    
    for cmd_file in quality_commands:
        cmd_path = commands_dir / cmd_file
        if not cmd_path.exists():
            continue
            
        content = cmd_path.read_text()
        
        # Check for tool detection patterns
        detection_patterns = [
            'which ', 'command -v', 'import ', 'available', 'installed', 
            'pip install', 'npm install', 'brew install'
        ]
        has_detection = any(pattern in content for pattern in detection_patterns)
        
        assert has_detection, f"{cmd_file} should detect available tools"
        print(f"✅ {cmd_file} includes tool detection")


def test_missing_tool_fallback():
    """Test: Quality commands provide fallback when tools are missing [^quality1b]"""
    commands_dir = Path(__file__).parent.parent.parent / 'slash-commands' / 'active'
    quality_commands = ['xquality.md']
    
    for cmd_file in quality_commands:
        cmd_path = commands_dir / cmd_file
        if not cmd_path.exists():
            continue
            
        content = cmd_path.read_text()
        
        # Check for fallback patterns
        fallback_patterns = [
            'not available', 'not found', 'install with', 'alternative',
            'fallback', 'or echo', '|| echo', 'skipped'
        ]
        has_fallback = any(pattern in content.lower() for pattern in fallback_patterns)
        
        assert has_fallback, f"{cmd_file} should provide fallback when tools are missing"
        print(f"✅ {cmd_file} includes missing tool fallbacks")


def test_structured_reports():
    """Test: Quality commands generate structured reports [^quality1c]"""
    commands_dir = Path(__file__).parent.parent.parent / 'slash-commands' / 'active'
    quality_commands = ['xquality.md']
    
    for cmd_file in quality_commands:
        cmd_path = commands_dir / cmd_file
        if not cmd_path.exists():
            continue
            
        content = cmd_path.read_text()
        
        # Check for report structure patterns
        report_patterns = [
            'report', 'summary', 'results', 'analysis', 'metrics',
            'statistics', 'score', 'rating', 'findings'
        ]
        has_reporting = any(pattern in content.lower() for pattern in report_patterns)
        
        assert has_reporting, f"{cmd_file} should generate structured reports"
        print(f"✅ {cmd_file} generates structured reports")


def main():
    """Run quality command tests."""
    print("🧪 Quality Commands Test Suite")
    print("=" * 35)
    
    try:
        test_tool_detection()
        test_missing_tool_fallback()
        test_structured_reports()
        
        print("\n✅ All quality command tests passed!")
        return 0
        
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        return 1


if __name__ == '__main__':
    sys.exit(main())