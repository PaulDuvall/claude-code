#!/usr/bin/env python3
"""Tests for Git workflow commands.

Implements specifications from specs/command-specifications.md
"""

import os
import sys
import subprocess
from pathlib import Path


def test_git_status_verification():
    """Test: Git automation commands verify repository status [^git1a]"""
    commands_dir = Path(__file__).parent.parent.parent / 'slash-commands' / 'active'
    git_commands = ['xgit.md']
    
    for cmd_file in git_commands:
        cmd_path = commands_dir / cmd_file
        if not cmd_path.exists():
            continue
            
        content = cmd_path.read_text()
        
        # Check for git status verification patterns
        status_patterns = ['git status', 'git diff', 'git branch']
        has_status_check = any(pattern in content for pattern in status_patterns)
        
        assert has_status_check, f"{cmd_file} should verify git status before operations"
        print(f"✅ {cmd_file} includes git status verification")


def test_conventional_commit_messages():
    """Test: Git commands generate conventional commit messages [^git1b]"""
    commands_dir = Path(__file__).parent.parent.parent / 'slash-commands' / 'active'
    git_commands = ['xgit.md']
    
    for cmd_file in git_commands:
        cmd_path = commands_dir / cmd_file
        if not cmd_path.exists():
            continue
            
        content = cmd_path.read_text()
        
        # Check for conventional commit patterns
        commit_patterns = ['feat:', 'fix:', 'docs:', 'style:', 'refactor:', 'test:', 'chore:']
        conventional_keywords = ['conventional', 'commit message', 'semantic']
        
        has_conventional = (
            any(pattern in content for pattern in commit_patterns) or
            any(keyword in content.lower() for keyword in conventional_keywords)
        )
        
        assert has_conventional, f"{cmd_file} should generate conventional commit messages"
        print(f"✅ {cmd_file} supports conventional commit messages")


def test_push_failure_handling():
    """Test: Git commands handle push failures gracefully [^git1c]"""
    commands_dir = Path(__file__).parent.parent.parent / 'slash-commands' / 'active'
    git_commands = ['xgit.md']
    
    for cmd_file in git_commands:
        cmd_path = commands_dir / cmd_file
        if not cmd_path.exists():
            continue
            
        content = cmd_path.read_text()
        
        # Check for error handling patterns
        error_patterns = ['error', 'fail', 'conflict', 'rejected', 'retry']
        has_error_handling = any(pattern in content.lower() for pattern in error_patterns)
        
        assert has_error_handling, f"{cmd_file} should handle push failures gracefully"
        print(f"✅ {cmd_file} includes push failure handling")


def main():
    """Run git command tests."""
    print("🧪 Git Commands Test Suite")
    print("=" * 30)
    
    try:
        test_git_status_verification()
        test_conventional_commit_messages()
        test_push_failure_handling()
        
        print("\n✅ All git command tests passed!")
        return 0
        
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        return 1


if __name__ == '__main__':
    sys.exit(main())