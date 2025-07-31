#!/usr/bin/env python3
"""Simple validation tests for Claude Code custom commands.

Implements specifications from specs/command-specifications.md
"""

import os
import sys
import re
from pathlib import Path

# Try to import yaml, provide fallback if not available
try:
    import yaml
except ImportError:
    print("❌ PyYAML not available. Install with:")
    print("   pip3 install --user PyYAML")
    print("   or: brew install python-yq")
    sys.exit(1)


def validate_command_files():
    """Validate all command files meet basic requirements."""
    script_dir = Path(__file__).parent.parent.parent
    commands_dir = script_dir / 'slash-commands' / 'active'
    
    if not commands_dir.exists():
        print(f"❌ Commands directory not found: {commands_dir}")
        return False
    
    command_files = list(commands_dir.glob('*.md'))
    if not command_files:
        print(f"❌ No command files found in {commands_dir}")
        return False
    
    print(f"📁 Found {len(command_files)} command files")
    
    all_valid = True
    for cmd_file in command_files:
        if not validate_single_command(cmd_file):
            all_valid = False
    
    return all_valid


def validate_single_command(cmd_file):
    """Validate a single command file."""
    print(f"\n🔍 Validating {cmd_file.name}")
    
    # Test: Command files have .md extension [^cmd1a]
    if not cmd_file.name.endswith('.md'):
        print(f"  ❌ File must have .md extension")
        return False
    print(f"  ✅ Has .md extension")
    
    # Test: Command naming convention [^cmd1c] - only for files in slash-commands directory
    if 'slash-commands' in str(cmd_file.parent):
        name_part = cmd_file.name.replace('.md', '')
        if not re.match(r'^x[a-z0-9\-]+$', name_part):
            print(f"  ❌ File name must follow x{{name}} convention (lowercase)")
            return False
        print(f"  ✅ Follows naming convention")
    else:
        print(f"  ℹ️  Naming convention check skipped (not in slash-commands directory)")
    
    try:
        content = cmd_file.read_text()
    except Exception as e:
        print(f"  ❌ Cannot read file: {e}")
        return False
    
    # Test: YAML frontmatter valid [^cmd1b, ^yaml1c]
    if not content.startswith('---'):
        print(f"  ❌ Missing YAML frontmatter")
        return False
    
    # Extract YAML frontmatter
    lines = content.split('\n')
    yaml_end = None
    for i, line in enumerate(lines[1:], 1):
        if line.strip() == '---':
            yaml_end = i
            break
    
    if yaml_end is None:
        print(f"  ❌ Invalid YAML frontmatter (missing end marker)")
        return False
    
    yaml_content = '\n'.join(lines[1:yaml_end])
    
    try:
        frontmatter = yaml.safe_load(yaml_content)
    except yaml.YAMLError as e:
        print(f"  ❌ Invalid YAML syntax: {e}")
        return False
    print(f"  ✅ Valid YAML frontmatter")
    
    # Test: Description meaningful [^yaml1a]
    description = frontmatter.get('description', '')
    if not description or len(description) < 10:
        print(f"  ❌ Description missing or too short")
        return False
    print(f"  ✅ Has meaningful description")
    
    # Test: Tags valid array [^yaml1b]
    tags = frontmatter.get('tags')
    if not isinstance(tags, list) or not tags:
        print(f"  ❌ Tags must be a non-empty array")
        return False
    print(f"  ✅ Has valid tags array")
    
    # Test: Executable commands present [^content1a]
    markdown_content = '\n'.join(lines[yaml_end + 1:])
    bash_patterns = [r'![\w\s\-\.]+', r'grep\s+', r'find\s+', r'git\s+']
    has_executable = any(re.search(pattern, markdown_content) for pattern in bash_patterns)
    
    if not has_executable:
        print(f"  ⚠️  No executable commands detected (may be intentional)")
    else:
        print(f"  ✅ Contains executable commands")
    
    # Test: Defensive security focus [^content1c]
    offensive_patterns = [r'exploit', r'hack', r'attack', r'malicious']
    content_lower = content.lower()
    for pattern in offensive_patterns:
        if re.search(pattern, content_lower):
            print(f"  ❌ Contains offensive security pattern: {pattern}")
            return False
    print(f"  ✅ Maintains defensive security focus")
    
    return True


def main():
    """Run command validation."""
    print("🚀 Claude Code Command Validation")
    print("=" * 40)
    
    if validate_command_files():
        print("\n✅ All commands passed validation!")
        return 0
    else:
        print("\n❌ Some commands failed validation")
        return 1


if __name__ == '__main__':
    sys.exit(main())