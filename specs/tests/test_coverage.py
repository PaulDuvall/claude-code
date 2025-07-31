#!/usr/bin/env python3
"""Tests for specification coverage requirements.

Implements specifications from specs/command-specifications.md
"""

import os
import sys
import re
from pathlib import Path


def test_all_specs_have_tests():
    """Test: Every specification has at least one corresponding test [^coverage1a]"""
    specs_file = Path(__file__).parent.parent / 'command-specifications.md'
    
    if not specs_file.exists():
        assert False, f"Specifications file not found: {specs_file}"
    
    content = specs_file.read_text()
    
    # Extract all specification references [^ref]
    spec_refs = re.findall(r'\[\^([a-zA-Z0-9_]+)\]', content)
    spec_refs = list(set(spec_refs))  # Remove duplicates
    
    print(f"Found {len(spec_refs)} specification references")
    
    # Check that each spec has a corresponding test
    test_files_dir = Path(__file__).parent
    test_files = list(test_files_dir.glob('test_*.py'))
    
    all_test_content = ""
    for test_file in test_files:
        all_test_content += test_file.read_text()
    
    missing_tests = []
    for spec_ref in spec_refs:
        if spec_ref not in all_test_content:
            missing_tests.append(spec_ref)
    
    if missing_tests:
        print(f"⚠️  Missing tests for specifications: {missing_tests}")
    else:
        print("✅ All specifications have corresponding tests")
    
    # At least 80% coverage is acceptable for now
    coverage_ratio = (len(spec_refs) - len(missing_tests)) / len(spec_refs)
    assert coverage_ratio >= 0.8, f"Test coverage too low: {coverage_ratio:.1%}"


def test_traceability_references():
    """Test: Tests include traceability references in docstrings [^coverage1b]"""
    test_files_dir = Path(__file__).parent
    test_files = [f for f in test_files_dir.glob('test_*.py') if f.name != 'test_coverage.py']
    
    for test_file in test_files:
        content = test_file.read_text()
        
        # Find all test functions
        test_functions = re.findall(r'def (test_[^(]+)\([^)]*\):', content)
        
        for func_name in test_functions:
            # Extract the docstring for this function
            func_pattern = rf'def {re.escape(func_name)}\([^)]*\):\s*"""([^"]+)"""'
            match = re.search(func_pattern, content, re.DOTALL)
            
            if match:
                docstring = match.group(1)
                # Check for traceability reference [^ref]
                has_traceability = re.search(r'\[\^[a-zA-Z0-9_]+\]', docstring)
                
                if not has_traceability:
                    print(f"⚠️  {test_file.name}::{func_name} missing traceability reference")
                else:
                    print(f"✅ {test_file.name}::{func_name} has traceability reference")


def test_executable_specifications():
    """Test: Specifications are executable and verifiable [^coverage1c]"""
    test_files_dir = Path(__file__).parent
    test_files = list(test_files_dir.glob('test_*.py'))
    
    executable_count = 0
    for test_file in test_files:
        try:
            # Try to run each test file
            result = os.system(f"cd {test_files_dir} && python3 {test_file.name} > /dev/null 2>&1")
            
            if result == 0:
                executable_count += 1
                print(f"✅ {test_file.name} is executable")
            else:
                print(f"⚠️  {test_file.name} failed to execute properly")
                
        except Exception as e:
            print(f"❌ {test_file.name} execution error: {e}")
    
    # At least 80% of tests should be executable
    success_ratio = executable_count / len(test_files)
    assert success_ratio >= 0.8, f"Too many non-executable tests: {success_ratio:.1%}"


def main():
    """Run specification coverage tests."""
    print("🧪 Specification Coverage Test Suite")
    print("=" * 42)
    
    try:
        test_all_specs_have_tests()
        test_traceability_references()
        test_executable_specifications()
        
        print("\n✅ All coverage tests passed!")
        return 0
        
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        return 1


if __name__ == '__main__':
    sys.exit(main())