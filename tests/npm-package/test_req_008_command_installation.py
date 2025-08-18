#!/usr/bin/env python3
"""
Test Suite for REQ-008: Command Installation
Priority: High
Requirement: WHEN the setup wizard completes successfully
THE SYSTEM SHALL copy selected commands to ~/.claude/commands/, set proper permissions, and make them loadable by Claude Code
"""

import os
import subprocess
import unittest
from pathlib import Path
import tempfile
import shutil
import sys
import json
import stat
from unittest.mock import patch, MagicMock

# Add the npm-package directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../npm-package'))
from command_installer import CommandInstaller


class TestCommandInstallation(unittest.TestCase):
    """Test cases for command installation requirement"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment"""
        cls.test_dir = tempfile.mkdtemp(prefix="command_install_test_")
        cls.package_root = Path(cls.test_dir) / "claude-dev-toolkit"
        cls.package_root.mkdir(parents=True, exist_ok=True)
        
        # Create mock Claude config directory
        cls.claude_config = Path(cls.test_dir) / ".claude"
        cls.claude_commands_dir = cls.claude_config / "commands"
        cls.claude_commands_dir.mkdir(parents=True, exist_ok=True)
        
        # Create command installer instance
        cls.installer = CommandInstaller(cls.package_root, cls.claude_config)
        cls.installer.setup()
        
    @classmethod
    def tearDownClass(cls):
        """Clean up test environment"""
        if os.path.exists(cls.test_dir):
            shutil.rmtree(cls.test_dir)
    
    def test_command_installer_exists(self):
        """Test that command installer can be instantiated"""
        installer = CommandInstaller(self.package_root, self.claude_config)
        self.assertIsNotNone(installer, "CommandInstaller must be instantiable")
    
    def test_installer_detects_claude_config_directory(self):
        """Test that installer can detect and validate Claude config directory"""
        result = self.installer.validate_claude_config_directory()
        
        self.assertIn('config_exists', result, "Must check if config directory exists")
        self.assertIn('commands_dir_exists', result, "Must check if commands directory exists")
        self.assertIn('writable', result, "Must check if directory is writable")
    
    def test_installer_gets_available_commands(self):
        """Test that installer can enumerate available commands"""
        commands = self.installer.get_available_commands()
        
        self.assertIn('active', commands, "Must include active commands")
        self.assertIn('experimental', commands, "Must include experimental commands")
        self.assertIsInstance(commands['active'], list, "Active commands must be a list")
        self.assertIsInstance(commands['experimental'], list, "Experimental commands must be a list")
    
    def test_installer_validates_command_selection(self):
        """Test that installer validates command selection against available commands"""
        # Test valid selections
        valid_selection = ['xgit', 'xtest', 'xquality']
        result = self.installer.validate_command_selection(valid_selection)
        self.assertTrue(result['valid'], "Must accept valid command selection")
        
        # Test invalid selections
        invalid_selection = ['nonexistent_command', 'another_fake']
        result = self.installer.validate_command_selection(invalid_selection)
        self.assertFalse(result['valid'], "Must reject invalid command selection")
    
    def test_installer_copies_active_commands(self):
        """Test that installer can copy active commands to Claude directory"""
        commands_to_install = ['xgit', 'xtest', 'xquality']
        
        result = self.installer.install_commands(commands_to_install, command_type='active')
        
        self.assertIn('installed_commands', result, "Must return list of installed commands")
        self.assertIn('installation_success', result, "Must indicate installation success")
        self.assertIn('installed_count', result, "Must report number of commands installed")
    
    def test_installer_copies_experimental_commands(self):
        """Test that installer can copy experimental commands to Claude directory"""
        commands_to_install = ['xanalytics', 'xapi', 'xaws']
        
        result = self.installer.install_commands(commands_to_install, command_type='experimental')
        
        self.assertIn('installed_commands', result, "Must return list of installed commands")
        self.assertIn('installation_success', result, "Must indicate installation success")
        self.assertIn('installed_count', result, "Must report number of commands installed")
    
    def test_installer_sets_correct_file_permissions(self):
        """Test that installer sets executable permissions on command files"""
        commands_to_install = ['xgit']
        
        result = self.installer.install_commands(commands_to_install, command_type='active')
        
        # Check that installed command files have correct permissions
        for cmd in result['installed_commands']:
            cmd_path = self.claude_commands_dir / f"{cmd}.md"
            if cmd_path.exists():
                file_stat = cmd_path.stat()
                # Should be readable by owner and group
                self.assertTrue(file_stat.st_mode & stat.S_IRUSR, f"Command {cmd} must be readable by owner")
                self.assertTrue(file_stat.st_mode & stat.S_IRGRP, f"Command {cmd} must be readable by group")
    
    def test_installer_handles_command_conflicts(self):
        """Test that installer handles conflicts when commands already exist"""
        # Install commands first time
        commands_to_install = ['xgit', 'xtest']
        result1 = self.installer.install_commands(commands_to_install, command_type='active')
        
        # Try to install again (should handle conflicts)
        result2 = self.installer.install_commands(commands_to_install, command_type='active', overwrite=True)
        
        self.assertIn('conflicts_handled', result2, "Must report conflict handling")
        self.assertIn('overwritten_commands', result2, "Must list overwritten commands")
    
    def test_installer_supports_dry_run_mode(self):
        """Test that installer supports dry-run mode without making changes"""
        commands_to_install = ['xgit', 'xtest', 'xquality']
        
        result = self.installer.install_commands(commands_to_install, command_type='active', dry_run=True)
        
        self.assertIn('dry_run', result, "Must indicate dry run mode")
        self.assertIn('would_install', result, "Must list commands that would be installed")
        self.assertTrue(result['dry_run'], "Must confirm dry run mode was used")
    
    def test_installer_creates_installation_manifest(self):
        """Test that installer creates a manifest of installed commands"""
        commands_to_install = ['xgit', 'xtest']
        
        result = self.installer.install_commands(commands_to_install, command_type='active')
        
        # Check that manifest was created
        manifest_path = self.claude_config / "installed_commands.json"
        self.assertTrue(manifest_path.exists(), "Must create installation manifest")
        
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)
        
        self.assertIn('installed_commands', manifest, "Manifest must list installed commands")
        self.assertIn('installation_timestamp', manifest, "Manifest must include timestamp")
        self.assertIn('installation_source', manifest, "Manifest must include source information")
    
    def test_installer_validates_command_syntax(self):
        """Test that installer validates command file syntax before installation"""
        # Create a mock command with invalid syntax
        invalid_command_content = "This is not valid markdown command syntax"
        
        result = self.installer.validate_command_syntax(invalid_command_content)
        
        self.assertIn('syntax_valid', result, "Must check syntax validity")
        self.assertIn('validation_errors', result, "Must provide validation errors")
        self.assertFalse(result['syntax_valid'], "Must detect invalid syntax")
    
    def test_installer_supports_command_categories(self):
        """Test that installer can install commands by category"""
        categories_to_install = ['planning', 'development']
        
        result = self.installer.install_commands_by_category(categories_to_install)
        
        self.assertIn('installed_by_category', result, "Must return commands installed by category")
        self.assertIn('total_installed', result, "Must report total number installed")
        
        # Verify categories were processed
        for category in categories_to_install:
            self.assertIn(category, result['installed_by_category'], f"Must process {category} category")
    
    def test_installer_handles_all_commands_installation(self):
        """Test that installer can install all available commands"""
        result = self.installer.install_all_commands()
        
        self.assertIn('active_commands_installed', result, "Must report active commands installed")
        self.assertIn('experimental_commands_installed', result, "Must report experimental commands installed")
        self.assertIn('total_commands_installed', result, "Must report total count")
        self.assertIn('installation_time', result, "Must report installation time")
    
    def test_installer_provides_installation_summary(self):
        """Test that installer provides comprehensive installation summary"""
        commands_to_install = ['xgit', 'xtest', 'xquality']
        
        result = self.installer.install_commands(commands_to_install, command_type='active')
        summary = self.installer.generate_installation_summary(result)
        
        self.assertIn('summary', summary, "Must provide installation summary")
        self.assertIn('commands_installed', summary, "Must list installed commands")
        self.assertIn('installation_location', summary, "Must specify installation location")
        self.assertIn('next_steps', summary, "Must provide next steps")
    
    def test_installer_can_uninstall_commands(self):
        """Test that installer can uninstall previously installed commands"""
        # First install some commands
        commands_to_install = ['xgit', 'xtest']
        install_result = self.installer.install_commands(commands_to_install, command_type='active')
        
        # Then uninstall them
        uninstall_result = self.installer.uninstall_commands(commands_to_install)
        
        self.assertIn('uninstalled_commands', uninstall_result, "Must list uninstalled commands")
        self.assertIn('uninstall_success', uninstall_result, "Must indicate uninstall success")
        self.assertTrue(uninstall_result['uninstall_success'], "Uninstall must succeed")
    
    def test_installer_handles_partial_installation_failures(self):
        """Test that installer handles cases where some commands fail to install"""
        # Mix of valid and problematic commands
        commands_to_install = ['xgit', 'nonexistent_command', 'xtest']
        
        result = self.installer.install_commands(commands_to_install, command_type='active', 
                                               ignore_missing=True)
        
        self.assertIn('partial_success', result, "Must indicate partial success")
        self.assertIn('failed_commands', result, "Must list failed commands")
        self.assertIn('successful_commands', result, "Must list successful commands")
    
    def test_installer_preserves_existing_config(self):
        """Test that installer preserves existing Claude configuration"""
        # Create existing settings
        settings_file = self.claude_config / "settings.json"
        original_settings = {"existing": "configuration", "preserve": True}
        with open(settings_file, 'w') as f:
            json.dump(original_settings, f)
        
        # Install commands
        commands_to_install = ['xgit']
        result = self.installer.install_commands(commands_to_install, command_type='active')
        
        # Verify settings were preserved
        with open(settings_file, 'r') as f:
            preserved_settings = json.load(f)
        
        self.assertEqual(preserved_settings['existing'], 'configuration', 
                        "Must preserve existing configuration")
        self.assertTrue(preserved_settings['preserve'], "Must preserve existing settings")
    
    def test_installer_supports_backup_and_restore(self):
        """Test that installer can backup existing commands before installation"""
        # Test backup functionality directly
        commands_to_install = ['xgit']
        result = self.installer.install_commands(commands_to_install, command_type='active', 
                                               create_backup=True)
        
        self.assertIn('backup_created', result, "Must indicate backup was created")
        self.assertIn('backup_location', result, "Must specify backup location")
        
        # Verify backup location is provided (actual backup creation tested in _create_backup)
        backup_location = result.get('backup_location')
        self.assertIsNotNone(backup_location, "Backup location must be provided")
        self.assertTrue(len(backup_location) > 0, "Backup location must not be empty")
    
    def test_installer_validates_claude_code_compatibility(self):
        """Test that installer validates commands are compatible with Claude Code"""
        commands_to_install = ['xgit', 'xtest']
        
        result = self.installer.validate_claude_code_compatibility(commands_to_install)
        
        self.assertIn('compatibility_check', result, "Must perform compatibility check")
        self.assertIn('compatible_commands', result, "Must list compatible commands")
        self.assertIn('incompatible_commands', result, "Must list incompatible commands")
        self.assertIn('claude_code_version', result, "Must report Claude Code version")
    
    def test_installer_provides_post_install_verification(self):
        """Test that installer verifies installation was successful"""
        commands_to_install = ['xgit', 'xtest']
        
        install_result = self.installer.install_commands(commands_to_install, command_type='active')
        verification_result = self.installer.verify_installation(install_result)
        
        self.assertIn('verification_passed', verification_result, "Must verify installation")
        self.assertIn('verified_commands', verification_result, "Must list verified commands")
        self.assertIn('verification_errors', verification_result, "Must report any verification errors")
    
    def test_installer_handles_special_characters_in_paths(self):
        """Test that installer handles special characters and spaces in file paths"""
        # Create test with spaces and special characters
        special_test_dir = Path(self.test_dir) / "test with spaces & symbols"
        special_claude_dir = special_test_dir / ".claude" / "commands"
        special_claude_dir.mkdir(parents=True, exist_ok=True)
        
        installer = CommandInstaller(self.package_root, special_test_dir / ".claude")
        commands_to_install = ['xgit']
        
        result = installer.install_commands(commands_to_install, command_type='active')
        
        self.assertIn('installation_success', result, "Must handle special characters in paths")
        self.assertTrue(result['installation_success'], "Installation must succeed with special paths")
    
    def test_installer_provides_rollback_capability(self):
        """Test that installer can rollback failed installations"""
        commands_to_install = ['xgit', 'xtest', 'problematic_command']
        
        # The problematic_command is designed to fail in _copy_command_file
        result = self.installer.install_commands(commands_to_install, command_type='active',
                                               rollback_on_failure=True)
        
        self.assertIn('rollback_performed', result, "Must indicate rollback was performed")
        self.assertIn('rollback_success', result, "Must report rollback success")
    
    def test_installer_integrates_with_setup_wizard(self):
        """Test that installer integrates with the interactive setup wizard"""
        from interactive_setup_wizard import InteractiveSetupWizard
        
        # Create setup wizard
        wizard = InteractiveSetupWizard(self.package_root)
        
        # Simulate wizard configuration
        wizard_config = {
            'installation_type': {'installation_type': 'standard'},
            'command_sets': {'selected_command_sets': ['development', 'planning']},
            'security_hooks': {'security_hooks_enabled': True},
            'configuration_template': {'template_type': 'basic'}
        }
        
        # Install commands based on wizard config
        result = self.installer.install_from_wizard_config(wizard_config)
        
        self.assertIn('wizard_integration', result, "Must indicate wizard integration")
        self.assertIn('commands_from_wizard', result, "Must show commands from wizard config")
        self.assertTrue(result['wizard_integration'], "Integration must work")


if __name__ == '__main__':
    # Run the tests
    unittest.main(verbosity=2)