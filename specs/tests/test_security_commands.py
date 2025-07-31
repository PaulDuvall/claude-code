#!/usr/bin/env python3
"""Tests for security analysis commands.

Implements specifications from specs/command-specifications.md
"""

import os
import sys
import re
from pathlib import Path


def test_defensive_security_only():
    """Test: Security commands focus exclusively on defensive security [^security1a]"""
    commands_dir = Path(__file__).parent.parent.parent / 'slash-commands' / 'active'
    security_commands = ['xsecurity.md']
    
    for cmd_file in security_commands:
        cmd_path = commands_dir / cmd_file
        if not cmd_path.exists():
            continue
            
        content = cmd_path.read_text().lower()
        
        # Check for defensive security patterns
        defensive_patterns = [
            'scan', 'detect', 'check', 'audit', 'analyze', 'review',
            'vulnerability', 'secure', 'protect', 'defend'
        ]
        has_defensive = any(pattern in content for pattern in defensive_patterns)
        
        assert has_defensive, f"{cmd_file} should focus on defensive security"
        print(f"✅ {cmd_file} focuses on defensive security")


def test_vulnerability_scanning():
    """Test: Security commands scan for common vulnerabilities [^security1b]"""
    commands_dir = Path(__file__).parent.parent.parent / 'slash-commands' / 'active'
    security_commands = ['xsecurity.md']
    
    for cmd_file in security_commands:
        cmd_path = commands_dir / cmd_file
        if not cmd_path.exists():
            continue
            
        content = cmd_path.read_text().lower()
        
        # Check for vulnerability scanning patterns
        vuln_patterns = [
            'vulnerabil', 'cve', 'secret', 'credential', 'password',
            'api key', 'token', 'dependency', 'audit', 'pip-audit'
        ]
        has_vuln_scan = any(pattern in content for pattern in vuln_patterns)
        
        assert has_vuln_scan, f"{cmd_file} should scan for vulnerabilities"
        print(f"✅ {cmd_file} includes vulnerability scanning")


def test_no_offensive_patterns():
    """Test: Security commands never include offensive security patterns [^security1c]"""
    commands_dir = Path(__file__).parent.parent.parent / 'slash-commands' / 'active'
    security_commands = ['xsecurity.md']
    
    for cmd_file in security_commands:
        cmd_path = commands_dir / cmd_file
        if not cmd_path.exists():
            continue
            
        content = cmd_path.read_text().lower()
        
        # Check for offensive security patterns (should NOT be present)
        offensive_patterns = [
            'exploit', 'attack', 'hack', 'penetrat', 'intrusion',
            'malicious', 'payload', 'injection', 'backdoor'
        ]
        
        for pattern in offensive_patterns:
            if pattern in content:
                # Allow defensive contexts like "prevent attacks" or "detect exploits"
                defensive_contexts = [
                    f'prevent {pattern}', f'detect {pattern}', f'avoid {pattern}',
                    f'protect against {pattern}', f'defend from {pattern}'
                ]
                
                is_defensive_context = any(context in content for context in defensive_contexts)
                
                if not is_defensive_context:
                    assert False, f"{cmd_file} contains offensive pattern: {pattern}"
        
        print(f"✅ {cmd_file} contains no offensive security patterns")


def main():
    """Run security command tests."""
    print("🧪 Security Commands Test Suite")
    print("=" * 36)
    
    try:
        test_defensive_security_only()
        test_vulnerability_scanning()
        test_no_offensive_patterns()
        
        print("\n✅ All security command tests passed!")
        return 0
        
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        return 1


if __name__ == '__main__':
    sys.exit(main())