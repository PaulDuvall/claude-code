#!/usr/bin/env python3
"""
Test Suite for REQ-003: CLI Entry Point
Priority: High
Requirement: THE SYSTEM SHALL provide a global CLI command "claude-commands" 
accessible after npm installation via the bin/claude-commands executable
"""

import os
import subprocess
import unittest
from pathlib import Path
import tempfile
import shutil
import sys
import stat

# Add the npm-package directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../npm-package'))
from cli_entry_point import CLIEntryPoint


class TestCLIEntryPoint(unittest.TestCase):
    """Test cases for CLI entry point requirement"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment"""
        cls.test_dir = tempfile.mkdtemp(prefix="cli_entry_test_")
        cls.package_root = Path(cls.test_dir) / "claude-dev-toolkit"
        cls.package_root.mkdir(parents=True, exist_ok=True)
        
        # Create CLI entry point
        cls.cli = CLIEntryPoint(cls.package_root)
        cls.cli.create()
        
    @classmethod
    def tearDownClass(cls):
        """Clean up test environment"""
        if os.path.exists(cls.test_dir):
            shutil.rmtree(cls.test_dir)
    
    def test_bin_directory_exists(self):
        """Test that bin directory is created"""
        bin_dir = self.package_root / "bin"
        self.assertTrue(
            bin_dir.exists() and bin_dir.is_dir(),
            "bin/ directory must exist"
        )
    
    def test_cli_executable_exists(self):
        """Test that claude-commands executable exists"""
        cli_file = self.package_root / "bin" / "claude-commands"
        self.assertTrue(
            cli_file.exists(),
            "bin/claude-commands must exist"
        )
    
    def test_cli_is_executable(self):
        """Test that CLI file has executable permissions"""
        cli_file = self.package_root / "bin" / "claude-commands"
        
        # Check if file is executable (Unix-like systems)
        if os.name != 'nt':  # Not Windows
            file_stat = cli_file.stat()
            is_executable = bool(file_stat.st_mode & stat.S_IXUSR)
            self.assertTrue(
                is_executable,
                "bin/claude-commands must be executable"
            )
    
    def test_cli_has_shebang(self):
        """Test that CLI starts with proper shebang"""
        cli_file = self.package_root / "bin" / "claude-commands"
        content = cli_file.read_text()
        
        self.assertTrue(
            content.startswith("#!/usr/bin/env node"),
            "CLI must start with #!/usr/bin/env node"
        )
    
    def test_cli_responds_to_help(self):
        """Test that CLI responds to --help flag"""
        cli_file = self.package_root / "bin" / "claude-commands"
        
        # Make it executable first
        cli_file.chmod(0o755)
        
        # Try to run with --help (this would work if node is installed)
        try:
            result = subprocess.run(
                ["node", str(cli_file), "--help"],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            # Check that it doesn't error out
            self.assertIn(
                "claude-commands",
                result.stdout.lower() + result.stderr.lower(),
                "CLI should mention 'claude-commands' in help output"
            )
        except (subprocess.TimeoutExpired, FileNotFoundError):
            # Node might not be installed in test environment
            # Just check that the file has help handling code
            content = cli_file.read_text()
            self.assertIn("--help", content, "CLI code must handle --help flag")
    
    def test_cli_has_version_command(self):
        """Test that CLI has version command"""
        cli_file = self.package_root / "bin" / "claude-commands"
        content = cli_file.read_text()
        
        self.assertIn(
            "version",
            content.lower(),
            "CLI must have version command or option"
        )
    
    def test_cli_has_list_command(self):
        """Test that CLI has 'list' command"""
        cli_file = self.package_root / "bin" / "claude-commands"
        content = cli_file.read_text()
        
        self.assertIn(
            "list",
            content,
            "CLI must have 'list' command"
        )
    
    def test_cli_has_install_command(self):
        """Test that CLI has 'install' command"""
        cli_file = self.package_root / "bin" / "claude-commands"
        content = cli_file.read_text()
        
        self.assertIn(
            "install",
            content,
            "CLI must have 'install' command"
        )
    
    def test_cli_has_status_command(self):
        """Test that CLI has 'status' command"""
        cli_file = self.package_root / "bin" / "claude-commands"
        content = cli_file.read_text()
        
        self.assertIn(
            "status",
            content,
            "CLI must have 'status' command"
        )
    
    def test_cli_has_validate_command(self):
        """Test that CLI has 'validate' command"""
        cli_file = self.package_root / "bin" / "claude-commands"
        content = cli_file.read_text()
        
        self.assertIn(
            "validate",
            content,
            "CLI must have 'validate' command"
        )
    
    def test_cli_has_update_command(self):
        """Test that CLI has 'update' command"""
        cli_file = self.package_root / "bin" / "claude-commands"
        content = cli_file.read_text()
        
        self.assertIn(
            "update",
            content,
            "CLI must have 'update' command"
        )
    
    def test_cli_has_uninstall_command(self):
        """Test that CLI has 'uninstall' command"""
        cli_file = self.package_root / "bin" / "claude-commands"
        content = cli_file.read_text()
        
        self.assertIn(
            "uninstall",
            content,
            "CLI must have 'uninstall' command"
        )
    
    def test_package_json_bin_configuration(self):
        """Test that package.json correctly configures the bin field"""
        # Create a minimal package.json for testing
        package_json = {
            "name": "claude-dev-toolkit",
            "version": "1.0.0",
            "bin": self.cli.get_bin_config()
        }
        
        self.assertIn("claude-commands", package_json["bin"])
        self.assertEqual(
            package_json["bin"]["claude-commands"],
            "./bin/claude-commands",
            "bin configuration must point to ./bin/claude-commands"
        )
    
    def test_cli_imports_required_modules(self):
        """Test that CLI imports necessary Node.js modules"""
        cli_file = self.package_root / "bin" / "claude-commands"
        content = cli_file.read_text()
        
        # Check for common CLI framework imports
        self.assertTrue(
            "require(" in content or "import " in content,
            "CLI must import/require necessary modules"
        )
    
    def test_cli_handles_errors(self):
        """Test that CLI has error handling"""
        cli_file = self.package_root / "bin" / "claude-commands"
        content = cli_file.read_text()
        
        self.assertTrue(
            "catch" in content or "error" in content.lower(),
            "CLI must have error handling"
        )


if __name__ == '__main__':
    # Run the tests
    unittest.main(verbosity=2)