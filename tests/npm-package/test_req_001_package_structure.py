#!/usr/bin/env python3
"""
Test Suite for REQ-001: NPM Package Structure
Priority: High
Requirement: THE SYSTEM SHALL create an npm package named "claude-dev-toolkit" 
with a standardized directory structure including bin/, lib/, commands/, 
templates/, hooks/, and configuration files
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
# Use the refactored implementation
from package_builder import create_npm_package


class TestNPMPackageStructure(unittest.TestCase):
    """Test cases for NPM package structure requirement"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment"""
        cls.test_dir = tempfile.mkdtemp(prefix="npm_package_test_")
        # Create the package structure using our implementation
        cls.package_root = create_npm_package(cls.test_dir)
        
    @classmethod
    def tearDownClass(cls):
        """Clean up test environment"""
        if os.path.exists(cls.test_dir):
            shutil.rmtree(cls.test_dir)
    
    def test_package_json_exists(self):
        """Test that package.json exists with correct name"""
        package_json_path = self.package_root / "package.json"
        self.assertTrue(
            package_json_path.exists(), 
            "package.json must exist in package root"
        )
        
        with open(package_json_path, 'r') as f:
            package_data = json.load(f)
            
        self.assertEqual(
            package_data.get('name'), 
            'claude-dev-toolkit',
            "Package name must be 'claude-dev-toolkit'"
        )
    
    def test_required_directories_exist(self):
        """Test that all required directories exist"""
        required_dirs = ['bin', 'lib', 'commands', 'templates', 'hooks']
        
        for dir_name in required_dirs:
            dir_path = self.package_root / dir_name
            self.assertTrue(
                dir_path.exists() and dir_path.is_dir(),
                f"Directory '{dir_name}/' must exist in package root"
            )
    
    def test_bin_directory_has_executable(self):
        """Test that bin directory contains the claude-commands executable"""
        bin_path = self.package_root / "bin" / "claude-commands"
        self.assertTrue(
            bin_path.exists(),
            "bin/claude-commands executable must exist"
        )
        
        # Check if file is executable (Unix-like systems)
        if os.name != 'nt':  # Not Windows
            self.assertTrue(
                os.access(bin_path, os.X_OK),
                "bin/claude-commands must be executable"
            )
    
    def test_commands_directory_structure(self):
        """Test that commands directory has active and experimental subdirectories"""
        commands_dir = self.package_root / "commands"
        active_dir = commands_dir / "active"
        experimental_dir = commands_dir / "experimental"
        
        self.assertTrue(
            active_dir.exists() and active_dir.is_dir(),
            "commands/active/ directory must exist"
        )
        self.assertTrue(
            experimental_dir.exists() and experimental_dir.is_dir(),
            "commands/experimental/ directory must exist"
        )
    
    def test_package_json_has_required_fields(self):
        """Test that package.json has all required npm fields"""
        package_json_path = self.package_root / "package.json"
        
        with open(package_json_path, 'r') as f:
            package_data = json.load(f)
        
        # Check for required fields and their types
        required_fields = ['name', 'version', 'description', 'author', 'license', 'bin', 'scripts']
        
        for field in required_fields:
            self.assertIn(field, package_data, f"package.json must have '{field}' field")
        
        # Check specific field types
        self.assertIsInstance(package_data['name'], str, "'name' must be a string")
        self.assertIsInstance(package_data['version'], str, "'version' must be a string")
        self.assertIsInstance(package_data['description'], str, "'description' must be a string")
        self.assertIsInstance(package_data['author'], str, "'author' must be a string")
        self.assertIsInstance(package_data['license'], str, "'license' must be a string")
        self.assertIsInstance(package_data['bin'], dict, "'bin' must be a dictionary")
        self.assertIsInstance(package_data['scripts'], dict, "'scripts' must be a dictionary")
        
        # Verify the name is correct
        self.assertEqual(package_data['name'], 'claude-dev-toolkit', "Package name must be 'claude-dev-toolkit'")
    
    def test_bin_configuration_in_package_json(self):
        """Test that package.json correctly configures the bin executable"""
        package_json_path = self.package_root / "package.json"
        
        with open(package_json_path, 'r') as f:
            package_data = json.load(f)
        
        self.assertIn('bin', package_data, "package.json must have 'bin' field")
        self.assertIn(
            'claude-commands', 
            package_data['bin'],
            "bin field must contain 'claude-commands' entry"
        )
        self.assertEqual(
            package_data['bin']['claude-commands'],
            './bin/claude-commands',
            "claude-commands must point to ./bin/claude-commands"
        )
    
    def test_readme_exists(self):
        """Test that README.md exists in package root"""
        readme_path = self.package_root / "README.md"
        self.assertTrue(
            readme_path.exists(),
            "README.md must exist in package root"
        )
    
    def test_gitignore_exists(self):
        """Test that .gitignore exists with npm-specific patterns"""
        gitignore_path = self.package_root / ".gitignore"
        self.assertTrue(
            gitignore_path.exists(),
            ".gitignore must exist in package root"
        )
        
        with open(gitignore_path, 'r') as f:
            gitignore_content = f.read()
        
        # Check for essential npm ignore patterns
        essential_patterns = ['node_modules/', 'npm-debug.log', '*.log']
        for pattern in essential_patterns:
            self.assertIn(
                pattern,
                gitignore_content,
                f".gitignore must contain '{pattern}' pattern"
            )
    
    def test_lib_directory_has_core_modules(self):
        """Test that lib directory contains core utility modules"""
        lib_dir = self.package_root / "lib"
        expected_modules = ['utils.js', 'config.js', 'installer.js']
        
        for module in expected_modules:
            module_path = lib_dir / module
            self.assertTrue(
                module_path.exists(),
                f"lib/{module} must exist"
            )


if __name__ == '__main__':
    # Run the tests
    unittest.main(verbosity=2)