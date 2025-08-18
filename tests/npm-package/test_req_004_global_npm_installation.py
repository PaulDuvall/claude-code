#!/usr/bin/env python3
"""
Test Suite for REQ-004: Global NPM Installation
Priority: High
Requirement: WHEN the user runs "npm install -g claude-dev-toolkit"
THE SYSTEM SHALL install the package globally and make the claude-commands CLI available
"""

import os
import subprocess
import unittest
from pathlib import Path
import tempfile
import shutil
import sys
import json

# Add the npm-package directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../npm-package'))
from global_npm_installer import GlobalNPMInstaller


class TestGlobalNPMInstallation(unittest.TestCase):
    """Test cases for global NPM installation requirement"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment"""
        cls.test_dir = tempfile.mkdtemp(prefix="global_npm_test_")
        cls.package_root = Path(cls.test_dir) / "claude-dev-toolkit"
        cls.package_root.mkdir(parents=True, exist_ok=True)
        
        # Create global installer
        cls.installer = GlobalNPMInstaller(cls.package_root)
        cls.installer.setup()
        
    @classmethod
    def tearDownClass(cls):
        """Clean up test environment"""
        if os.path.exists(cls.test_dir):
            shutil.rmtree(cls.test_dir)
    
    def test_package_json_has_proper_npm_configuration(self):
        """Test that package.json is configured for global installation"""
        package_json_path = self.package_root / "package.json"
        self.assertTrue(
            package_json_path.exists(),
            "package.json must exist for npm installation"
        )
        
        with open(package_json_path, 'r') as f:
            package_data = json.load(f)
        
        # Check required fields for npm publishing
        required_fields = ['name', 'version', 'bin', 'description', 'keywords', 'author', 'license']
        for field in required_fields:
            self.assertIn(field, package_data, f"package.json must have '{field}' for npm publishing")
        
        # Verify bin configuration for global installation
        self.assertIn('bin', package_data, "package.json must have 'bin' field")
        self.assertIn('claude-commands', package_data['bin'], "bin must contain 'claude-commands'")
    
    def test_package_json_publishable_structure(self):
        """Test that package.json has structure suitable for npm publish"""
        package_json_path = self.package_root / "package.json"
        
        with open(package_json_path, 'r') as f:
            package_data = json.load(f)
        
        # Check for npm registry requirements
        self.assertEqual(package_data['name'], 'claude-dev-toolkit', "Name must match expected package name")
        self.assertRegex(package_data['version'], r'^\d+\.\d+\.\d+', "Version must follow semver")
        self.assertIsInstance(package_data['keywords'], list, "Keywords must be a list")
        self.assertTrue(len(package_data['keywords']) > 0, "Must have keywords for discoverability")
    
    def test_bin_executable_is_properly_configured(self):
        """Test that the bin executable is configured for global access"""
        bin_file = self.package_root / "bin" / "claude-commands"
        self.assertTrue(bin_file.exists(), "bin/claude-commands must exist")
        
        # Check shebang for global execution
        content = bin_file.read_text()
        self.assertTrue(
            content.startswith("#!/usr/bin/env node"),
            "CLI must have proper shebang for global execution"
        )
        
        # Check executable permissions
        import stat
        file_stat = bin_file.stat()
        is_executable = bool(file_stat.st_mode & stat.S_IXUSR)
        self.assertTrue(is_executable, "bin/claude-commands must be executable")
    
    def test_package_has_all_required_files_for_publishing(self):
        """Test that all files required for npm publishing are present"""
        required_files = [
            "package.json",
            "README.md",
            "bin/claude-commands",
            "lib/utils.js",
            "lib/config.js",
            "lib/installer.js"
        ]
        
        for file_path in required_files:
            full_path = self.package_root / file_path
            self.assertTrue(
                full_path.exists(),
                f"Required file {file_path} must exist for npm publishing"
            )
    
    def test_package_json_files_field_configuration(self):
        """Test that package.json 'files' field includes necessary files"""
        package_json_path = self.package_root / "package.json"
        
        with open(package_json_path, 'r') as f:
            package_data = json.load(f)
        
        if 'files' in package_data:
            files_list = package_data['files']
            required_in_files = ['bin/', 'lib/', 'commands/', 'README.md']
            
            for required_item in required_in_files:
                self.assertIn(
                    required_item,
                    files_list,
                    f"'files' field must include {required_item}"
                )
    
    def test_npm_pack_simulation(self):
        """Test that package can be packed for npm (simulated)"""
        # Simulate npm pack by checking package structure
        result = self.installer.validate_for_publishing()
        
        self.assertTrue(result['valid'], f"Package must be valid for npm publishing: {result.get('errors', [])}")
        self.assertEqual(result['name'], 'claude-dev-toolkit', "Package name must be correct")
        self.assertIn('claude-commands', result['bin_commands'], "Must expose claude-commands binary")
    
    def test_global_installation_simulation(self):
        """Test simulation of global npm installation"""
        # Simulate what happens during npm install -g
        install_result = self.installer.simulate_global_install()
        
        self.assertTrue(install_result['success'], "Global installation simulation must succeed")
        self.assertIn('claude-commands', install_result['global_binaries'], "claude-commands must be globally available")
        self.assertTrue(install_result['bin_in_path'], "Binary must be accessible in PATH")
    
    def test_cli_availability_after_global_install(self):
        """Test that CLI would be available after global installation"""
        # Simulate checking if claude-commands would be in PATH
        cli_check = self.installer.check_cli_availability()
        
        self.assertTrue(cli_check['would_be_available'], "CLI must be available after global install")
        self.assertEqual(cli_check['command_name'], 'claude-commands', "Command name must be 'claude-commands'")
        self.assertTrue(cli_check['executable_exists'], "Executable file must exist")
    
    def test_package_dependencies_for_global_install(self):
        """Test that package has proper dependencies for global installation"""
        package_json_path = self.package_root / "package.json"
        
        with open(package_json_path, 'r') as f:
            package_data = json.load(f)
        
        # Check engines requirement
        if 'engines' in package_data:
            self.assertIn('node', package_data['engines'], "Must specify Node.js version requirement")
        
        # For a CLI tool, dependencies should be minimal or empty
        dependencies = package_data.get('dependencies', {})
        self.assertLessEqual(
            len(dependencies),
            5,
            "Global CLI tools should have minimal dependencies"
        )
    
    def test_post_install_script_configuration(self):
        """Test that post-install script is properly configured"""
        package_json_path = self.package_root / "package.json"
        
        with open(package_json_path, 'r') as f:
            package_data = json.load(f)
        
        scripts = package_data.get('scripts', {})
        if 'postinstall' in scripts:
            postinstall_script = scripts['postinstall']
            self.assertTrue(
                len(postinstall_script) > 0,
                "Post-install script must not be empty"
            )
            # Should reference a script file that exists
            if 'scripts/' in postinstall_script:
                # Extract script filename and check if it exists
                script_file = postinstall_script.split('scripts/')[-1].split()[0]
                script_path = self.package_root / "scripts" / script_file
                # Note: We'll create this in the implementation
    
    def test_npm_version_compatibility(self):
        """Test that package is compatible with npm installation"""
        # Check that package structure follows npm conventions
        validation = self.installer.validate_npm_compatibility()
        
        self.assertTrue(validation['npm_compatible'], "Package must be npm compatible")
        self.assertTrue(validation['semver_valid'], "Version must follow semantic versioning")
        self.assertTrue(validation['name_valid'], "Package name must be valid for npm")
    
    def test_global_uninstall_capability(self):
        """Test that package can be globally uninstalled"""
        # Ensure package can be cleanly uninstalled
        uninstall_info = self.installer.get_uninstall_info()
        
        self.assertIn('global_files', uninstall_info, "Must track files for uninstall")
        self.assertIn('claude-commands', uninstall_info['global_binaries'], "Must track global binaries")
        self.assertTrue(uninstall_info['clean_uninstall_possible'], "Must support clean uninstall")
    
    def test_installation_verification_command(self):
        """Test that installation can be verified after global install"""
        # Test verification that installation worked
        verification = self.installer.get_installation_verification()
        
        self.assertIn('verify_command', verification, "Must have verification command")
        self.assertEqual(
            verification['verify_command'], 
            'claude-commands --version',
            "Verification should use --version command"
        )
        self.assertTrue(verification['version_output_expected'], "Version command should work")


if __name__ == '__main__':
    # Run the tests
    unittest.main(verbosity=2)