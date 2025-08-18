#!/usr/bin/env python3
"""
Test Suite for REQ-002: Command Organization
Priority: High
Requirement: THE SYSTEM SHALL organize custom commands into two directories: 
commands/active/ containing 13 production commands and 
commands/experimental/ containing 44 experimental commands
"""

import os
import json
import unittest
from pathlib import Path
import tempfile
import shutil
import sys

# Add the npm-package directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../npm-package'))
from command_organizer import CommandOrganizer


class TestCommandOrganization(unittest.TestCase):
    """Test cases for command organization requirement"""
    
    # Expected active commands (13 total)
    ACTIVE_COMMANDS = [
        'xarchitecture', 'xconfig', 'xdebug', 'xdocs', 'xgit',
        'xpipeline', 'xquality', 'xrefactor', 'xrelease',
        'xsecurity', 'xspec', 'xtdd', 'xtest'
    ]
    
    # Sample of experimental commands (should be 44 total)
    EXPERIMENTAL_COMMANDS_SAMPLE = [
        'xact', 'xanalytics', 'xapi', 'xaws', 'xcicd',
        'xcompliance', 'xinfra', 'xmonitoring', 'xperformance',
        'xplanning', 'xrisk'
    ]
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment"""
        cls.test_dir = tempfile.mkdtemp(prefix="command_org_test_")
        cls.package_root = Path(cls.test_dir) / "claude-dev-toolkit"
        cls.package_root.mkdir(parents=True, exist_ok=True)
        
        # Create command organizer instance
        cls.organizer = CommandOrganizer(cls.package_root)
        
    @classmethod
    def tearDownClass(cls):
        """Clean up test environment"""
        if os.path.exists(cls.test_dir):
            shutil.rmtree(cls.test_dir)
    
    def test_active_commands_directory_exists(self):
        """Test that active commands directory is properly created"""
        self.organizer.organize_commands()
        active_dir = self.package_root / "commands" / "active"
        
        self.assertTrue(
            active_dir.exists() and active_dir.is_dir(),
            "commands/active/ directory must exist"
        )
    
    def test_experimental_commands_directory_exists(self):
        """Test that experimental commands directory is properly created"""
        self.organizer.organize_commands()
        experimental_dir = self.package_root / "commands" / "experimental"
        
        self.assertTrue(
            experimental_dir.exists() and experimental_dir.is_dir(),
            "commands/experimental/ directory must exist"
        )
    
    def test_thirteen_active_commands_present(self):
        """Test that exactly 13 active commands are present"""
        self.organizer.organize_commands()
        active_dir = self.package_root / "commands" / "active"
        
        # Count .md files in active directory
        active_commands = list(active_dir.glob("*.md"))
        
        self.assertEqual(
            len(active_commands),
            13,
            f"Expected 13 active commands, found {len(active_commands)}"
        )
    
    def test_all_required_active_commands_exist(self):
        """Test that all required active commands are present"""
        self.organizer.organize_commands()
        active_dir = self.package_root / "commands" / "active"
        
        for command_name in self.ACTIVE_COMMANDS:
            command_file = active_dir / f"{command_name}.md"
            self.assertTrue(
                command_file.exists(),
                f"Active command '{command_name}.md' must exist"
            )
    
    def test_active_command_structure(self):
        """Test that active commands have proper structure"""
        self.organizer.organize_commands()
        active_dir = self.package_root / "commands" / "active"
        
        # Check first active command for proper structure
        test_command = active_dir / "xtest.md"
        self.assertTrue(test_command.exists())
        
        content = test_command.read_text()
        
        # Check for required sections
        self.assertIn("---", content, "Command must have frontmatter")
        self.assertIn("description:", content, "Command must have description")
        self.assertIn("# ", content, "Command must have a heading")
        self.assertIn("## Usage", content, "Command must have Usage section")
        self.assertIn("## Implementation", content, "Command must have Implementation section")
    
    def test_fortyfour_experimental_commands_present(self):
        """Test that exactly 44 experimental commands are present"""
        self.organizer.organize_commands()
        experimental_dir = self.package_root / "commands" / "experimental"
        
        # Count .md files in experimental directory
        experimental_commands = list(experimental_dir.glob("*.md"))
        
        self.assertEqual(
            len(experimental_commands),
            44,
            f"Expected 44 experimental commands, found {len(experimental_commands)}"
        )
    
    def test_experimental_commands_have_warning(self):
        """Test that experimental commands have warning notice"""
        self.organizer.organize_commands()
        experimental_dir = self.package_root / "commands" / "experimental"
        
        # Get first experimental command
        experimental_commands = list(experimental_dir.glob("*.md"))
        if experimental_commands:
            content = experimental_commands[0].read_text()
            self.assertIn(
                "experimental",
                content.lower(),
                "Experimental commands must indicate their experimental status"
            )
    
    def test_command_manifest_created(self):
        """Test that a manifest file is created listing all commands"""
        self.organizer.organize_commands()
        manifest_file = self.package_root / "commands" / "manifest.json"
        
        self.assertTrue(
            manifest_file.exists(),
            "commands/manifest.json must exist"
        )
        
        with open(manifest_file, 'r') as f:
            manifest = json.load(f)
        
        self.assertIn("active", manifest, "Manifest must have 'active' section")
        self.assertIn("experimental", manifest, "Manifest must have 'experimental' section")
        self.assertEqual(len(manifest["active"]), 13, "Manifest must list 13 active commands")
        self.assertEqual(len(manifest["experimental"]), 44, "Manifest must list 44 experimental commands")
    
    def test_no_duplicate_commands(self):
        """Test that no command appears in both active and experimental"""
        self.organizer.organize_commands()
        
        active_dir = self.package_root / "commands" / "active"
        experimental_dir = self.package_root / "commands" / "experimental"
        
        active_names = {f.stem for f in active_dir.glob("*.md")}
        experimental_names = {f.stem for f in experimental_dir.glob("*.md")}
        
        duplicates = active_names & experimental_names
        
        self.assertEqual(
            len(duplicates),
            0,
            f"Commands found in both active and experimental: {duplicates}"
        )
    
    def test_copy_commands_from_source(self):
        """Test that commands can be copied from source repository"""
        # This tests the ability to copy commands from the main repo
        source_path = Path(__file__).parent.parent.parent / "slash-commands"
        
        if source_path.exists():
            result = self.organizer.copy_from_source(source_path)
            self.assertTrue(
                result["success"],
                "Should successfully copy commands from source"
            )
            self.assertEqual(
                result["active_count"],
                13,
                "Should copy 13 active commands"
            )
    
    def test_command_categories_in_manifest(self):
        """Test that manifest includes command categories"""
        self.organizer.organize_commands()
        manifest_file = self.package_root / "commands" / "manifest.json"
        
        with open(manifest_file, 'r') as f:
            manifest = json.load(f)
        
        # Check that active commands have categories
        for command in manifest["active"]:
            self.assertIn("name", command, "Command must have name")
            self.assertIn("description", command, "Command must have description")
            self.assertIn("category", command, "Command must have category")
    
    def test_command_validation(self):
        """Test that command files are validated for required structure"""
        self.organizer.organize_commands()
        
        # Validate all commands
        validation_result = self.organizer.validate_all_commands()
        
        self.assertTrue(
            validation_result["valid"],
            f"All commands should be valid. Errors: {validation_result.get('errors', [])}"
        )
        
        self.assertEqual(
            validation_result["total_commands"],
            57,
            "Should validate 57 total commands (13 active + 44 experimental)"
        )


if __name__ == '__main__':
    # Run the tests
    unittest.main(verbosity=2)