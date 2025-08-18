#!/usr/bin/env python3
"""
Test Suite for REQ-005: Post-Install Automation
Priority: High
Requirement: WHEN the npm package installation completes
THE SYSTEM SHALL automatically execute the post-install script to begin setup process
with option to skip via --skip-setup flag
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
from post_install_automation import PostInstallAutomation


class TestPostInstallAutomation(unittest.TestCase):
    """Test cases for post-install automation requirement"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment"""
        cls.test_dir = tempfile.mkdtemp(prefix="post_install_test_")
        cls.package_root = Path(cls.test_dir) / "claude-dev-toolkit"
        cls.package_root.mkdir(parents=True, exist_ok=True)
        
        # Create post-install automation instance
        cls.automation = PostInstallAutomation(cls.package_root)
        cls.automation.setup()
        
    @classmethod
    def tearDownClass(cls):
        """Clean up test environment"""
        if os.path.exists(cls.test_dir):
            shutil.rmtree(cls.test_dir)
    
    def test_post_install_script_exists(self):
        """Test that post-install script is created"""
        script_path = self.package_root / "scripts" / "postinstall.js"
        self.assertTrue(
            script_path.exists(),
            "Post-install script must exist at scripts/postinstall.js"
        )
    
    def test_post_install_script_is_executable(self):
        """Test that post-install script has executable permissions"""
        script_path = self.package_root / "scripts" / "postinstall.js"
        
        import stat
        file_stat = script_path.stat()
        is_executable = bool(file_stat.st_mode & stat.S_IXUSR)
        self.assertTrue(
            is_executable,
            "Post-install script must be executable"
        )
    
    def test_post_install_script_has_proper_shebang(self):
        """Test that post-install script starts with node shebang"""
        script_path = self.package_root / "scripts" / "postinstall.js"
        content = script_path.read_text()
        
        self.assertTrue(
            content.startswith("#!/usr/bin/env node"),
            "Post-install script must start with #!/usr/bin/env node"
        )
    
    def test_package_json_references_post_install_script(self):
        """Test that package.json correctly references the post-install script"""
        package_json_path = self.package_root / "package.json"
        self.assertTrue(package_json_path.exists(), "package.json must exist")
        
        with open(package_json_path, 'r') as f:
            package_data = json.load(f)
        
        self.assertIn('scripts', package_data, "package.json must have 'scripts' section")
        self.assertIn('postinstall', package_data['scripts'], "Must have 'postinstall' script")
        self.assertEqual(
            package_data['scripts']['postinstall'],
            "node scripts/postinstall.js",
            "Post-install script must point to correct file"
        )
    
    def test_post_install_script_handles_skip_setup_flag(self):
        """Test that post-install script supports --skip-setup flag"""
        script_path = self.package_root / "scripts" / "postinstall.js"
        content = script_path.read_text()
        
        self.assertIn(
            "--skip-setup",
            content,
            "Post-install script must handle --skip-setup flag"
        )
        self.assertIn(
            "process.argv",
            content,
            "Post-install script must check command line arguments"
        )
    
    def test_post_install_script_runs_setup_by_default(self):
        """Test that post-install script runs setup process by default"""
        # Simulate running the post-install script
        result = self.automation.simulate_post_install_execution()
        
        self.assertTrue(result['executed'], "Post-install script must execute")
        self.assertTrue(result['setup_initiated'], "Setup process must be initiated by default")
        self.assertFalse(result['skipped'], "Setup must not be skipped by default")
    
    def test_post_install_script_skips_setup_with_flag(self):
        """Test that post-install script skips setup when --skip-setup flag is provided"""
        # Simulate running with --skip-setup flag
        result = self.automation.simulate_post_install_execution(args=['--skip-setup'])
        
        self.assertTrue(result['executed'], "Post-install script must execute")
        self.assertFalse(result['setup_initiated'], "Setup process must be skipped with flag")
        self.assertTrue(result['skipped'], "Setup must be skipped with --skip-setup flag")
    
    def test_post_install_script_displays_welcome_message(self):
        """Test that post-install script displays welcome message"""
        result = self.automation.simulate_post_install_execution()
        
        self.assertIn('output', result, "Must capture script output")
        output = result['output']
        self.assertIn('Claude Dev Toolkit', output, "Must display toolkit name")
        self.assertIn('installed', output.lower(), "Must indicate successful installation")
    
    def test_post_install_script_provides_next_steps(self):
        """Test that post-install script provides next steps to user"""
        result = self.automation.simulate_post_install_execution()
        
        output = result['output']
        self.assertTrue(
            any(command in output for command in ['claude-commands', 'help', 'list']),
            "Must provide next steps with command examples"
        )
    
    def test_post_install_script_handles_errors_gracefully(self):
        """Test that post-install script handles errors without failing npm install"""
        # Test error handling
        error_result = self.automation.simulate_post_install_with_error()
        
        self.assertTrue(error_result['handled_gracefully'], "Errors must be handled gracefully")
        self.assertEqual(error_result['exit_code'], 0, "Must exit with code 0 even on errors")
        self.assertIn('error', error_result['output'].lower(), "Must log error message")
    
    def test_post_install_script_checks_environment(self):
        """Test that post-install script checks environment requirements"""
        script_path = self.package_root / "scripts" / "postinstall.js"
        content = script_path.read_text()
        
        # Should check for Node.js version or other requirements
        self.assertTrue(
            any(check in content for check in ['version', 'require', 'process']),
            "Post-install script should check environment requirements"
        )
    
    def test_post_install_creates_initial_configuration(self):
        """Test that post-install script creates initial configuration if needed"""
        result = self.automation.simulate_post_install_execution()
        
        self.assertTrue(
            result['config_created'],
            "Post-install should create initial configuration"
        )
    
    def test_post_install_script_logs_to_npm(self):
        """Test that post-install script outputs messages visible during npm install"""
        result = self.automation.simulate_post_install_execution()
        
        # Messages should be appropriate for npm install output
        output = result['output']
        self.assertNotIn('DEBUG', output.upper(), "Should not show debug messages")
        self.assertTrue(len(output.split('\n')) <= 10, "Output should be concise for npm")
    
    def test_post_install_script_is_idempotent(self):
        """Test that post-install script can be run multiple times safely"""
        # Run twice
        result1 = self.automation.simulate_post_install_execution()
        result2 = self.automation.simulate_post_install_execution()
        
        self.assertTrue(result1['executed'], "First run must succeed")
        self.assertTrue(result2['executed'], "Second run must succeed")
        self.assertEqual(result1['config_created'], result2['config_created'], "Must be idempotent")
    
    def test_post_install_script_validates_installation(self):
        """Test that post-install script validates the installation"""
        result = self.automation.simulate_post_install_execution()
        
        self.assertTrue(
            result['validation_performed'],
            "Post-install should validate installation"
        )
        self.assertTrue(
            result['validation_passed'],
            "Installation validation should pass"
        )
    
    def test_post_install_script_handles_permission_errors(self):
        """Test that post-install script handles permission errors gracefully"""
        # Simulate permission error scenario
        permission_result = self.automation.simulate_post_install_with_permission_error()
        
        self.assertTrue(
            permission_result['handled_gracefully'],
            "Permission errors must be handled gracefully"
        )
        self.assertIn(
            'permission',
            permission_result['output'].lower(),
            "Must provide helpful permission error message"
        )
    
    def test_post_install_automation_configuration(self):
        """Test that automation can be configured for different scenarios"""
        config = self.automation.get_automation_config()
        
        self.assertIn('skip_setup_supported', config, "Must support skip setup configuration")
        self.assertIn('validation_enabled', config, "Must support validation configuration")
        self.assertIn('output_level', config, "Must support output level configuration")
        
        self.assertTrue(config['skip_setup_supported'], "Skip setup must be supported")
        self.assertTrue(config['validation_enabled'], "Validation must be enabled")
    
    def test_post_install_creates_scripts_directory(self):
        """Test that scripts directory is created if it doesn't exist"""
        scripts_dir = self.package_root / "scripts"
        self.assertTrue(
            scripts_dir.exists() and scripts_dir.is_dir(),
            "scripts/ directory must be created"
        )


if __name__ == '__main__':
    # Run the tests
    unittest.main(verbosity=2)