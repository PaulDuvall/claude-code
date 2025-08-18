#!/usr/bin/env python3
"""
Test Suite for REQ-006: Environment Validation
Priority: High
Requirement: WHEN the post-install script executes
THE SYSTEM SHALL verify Claude Code installation, Node.js version compatibility, and required system dependencies
"""

import os
import subprocess
import unittest
from pathlib import Path
import tempfile
import shutil
import sys
import json
from unittest.mock import patch, MagicMock

# Add the npm-package directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../npm-package'))
from environment_validation import EnvironmentValidator


class TestEnvironmentValidation(unittest.TestCase):
    """Test cases for environment validation requirement"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment"""
        cls.test_dir = tempfile.mkdtemp(prefix="env_validation_test_")
        cls.package_root = Path(cls.test_dir) / "claude-dev-toolkit"
        cls.package_root.mkdir(parents=True, exist_ok=True)
        
        # Create environment validator instance
        cls.validator = EnvironmentValidator(cls.package_root)
        cls.validator.setup()
        
    @classmethod
    def tearDownClass(cls):
        """Clean up test environment"""
        if os.path.exists(cls.test_dir):
            shutil.rmtree(cls.test_dir)
    
    def test_environment_validator_exists(self):
        """Test that environment validator can be instantiated"""
        validator = EnvironmentValidator(self.package_root)
        self.assertIsNotNone(validator, "EnvironmentValidator must be instantiable")
    
    def test_node_js_version_validation(self):
        """Test that Node.js version is validated"""
        result = self.validator.validate_nodejs_version()
        
        self.assertIn('version_valid', result, "Must check Node.js version validity")
        self.assertIn('current_version', result, "Must report current Node.js version")
        self.assertIn('required_version', result, "Must specify required Node.js version")
        self.assertIn('error_message', result, "Must provide error message if invalid")
    
    def test_claude_code_installation_check(self):
        """Test that Claude Code installation is validated"""
        result = self.validator.validate_claude_code_installation()
        
        self.assertIn('installed', result, "Must check if Claude Code is installed")
        self.assertIn('version', result, "Must report Claude Code version if available")
        self.assertIn('installation_path', result, "Must report installation path")
        self.assertIn('error_message', result, "Must provide error message if not installed")
    
    def test_system_dependencies_validation(self):
        """Test that system dependencies are validated"""
        result = self.validator.validate_system_dependencies()
        
        self.assertIn('all_dependencies_met', result, "Must check if all dependencies are met")
        self.assertIn('missing_dependencies', result, "Must list missing dependencies")
        self.assertIn('dependency_details', result, "Must provide details for each dependency")
        self.assertTrue(isinstance(result['missing_dependencies'], list), "Missing dependencies must be a list")
    
    def test_comprehensive_environment_validation(self):
        """Test comprehensive validation of entire environment"""
        result = self.validator.validate_environment()
        
        self.assertIn('overall_valid', result, "Must provide overall validation status")
        self.assertIn('nodejs_validation', result, "Must include Node.js validation results")
        self.assertIn('claude_code_validation', result, "Must include Claude Code validation results")
        self.assertIn('dependencies_validation', result, "Must include dependencies validation results")
        self.assertIn('errors', result, "Must provide list of validation errors")
        self.assertIn('warnings', result, "Must provide list of validation warnings")
    
    def test_validation_error_messages_are_helpful(self):
        """Test that validation error messages are clear and actionable"""
        # Simulate missing Claude Code
        original_testing = os.environ.get('TESTING')
        try:
            os.environ['TESTING'] = 'true'
            os.environ['CLAUDE_CODE_AVAILABLE'] = 'false'
            
            # Clear cache to ensure fresh validation
            self.validator.cache.clear()
            result = self.validator.validate_claude_code_installation()
            
            error_msg = result['error_message']
            self.assertIn('Claude Code', error_msg, "Error message must mention Claude Code")
            self.assertTrue(len(error_msg) > 20, "Error message must be descriptive")
        finally:
            if original_testing:
                os.environ['TESTING'] = original_testing
            else:
                os.environ.pop('TESTING', None)
            os.environ.pop('CLAUDE_CODE_AVAILABLE', None)
    
    def test_nodejs_minimum_version_requirement(self):
        """Test that Node.js minimum version requirement is enforced"""
        # Test with various Node.js versions
        test_versions = ['v14.0.0', 'v16.0.0', 'v18.0.0', 'v20.0.0']
        
        original_testing = os.environ.get('TESTING')
        try:
            os.environ['TESTING'] = 'true'
            
            for version in test_versions:
                os.environ['NODEJS_AVAILABLE'] = 'true'
                os.environ['NODEJS_VERSION'] = version
                
                # Clear cache to ensure fresh validation
                self.validator.cache.clear()
                result = self.validator.validate_nodejs_version()
                
                # Should validate against minimum required version (v16.0.0)
                def parse_version(v):
                    import re
                    match = re.search(r'v?(\d+)\.(\d+)\.(\d+)', v)
                    if match:
                        return tuple(map(int, match.groups()))
                    return (0, 0, 0)
                expected_valid = parse_version(version) >= parse_version('v16.0.0')
                if expected_valid:
                    self.assertTrue(result['version_valid'], f"Version {version} should be valid")
                else:
                    self.assertFalse(result['version_valid'], f"Version {version} should be invalid")
        finally:
            if original_testing:
                os.environ['TESTING'] = original_testing
            else:
                os.environ.pop('TESTING', None)
            os.environ.pop('NODEJS_AVAILABLE', None)
            os.environ.pop('NODEJS_VERSION', None)
    
    def test_os_platform_detection(self):
        """Test that operating system platform is detected"""
        result = self.validator.detect_platform()
        
        self.assertIn('platform', result, "Must detect operating system platform")
        self.assertIn('supported', result, "Must indicate if platform is supported")
        self.assertIn('platform_specific_notes', result, "Must provide platform-specific notes")
        
        # Should detect common platforms
        valid_platforms = ['darwin', 'linux', 'win32']
        self.assertIn(result['platform'], valid_platforms, "Must detect standard platforms")
    
    def test_path_environment_validation(self):
        """Test that PATH environment variable is validated"""
        result = self.validator.validate_path_environment()
        
        self.assertIn('node_in_path', result, "Must check if Node.js is in PATH")
        self.assertIn('npm_in_path', result, "Must check if npm is in PATH")
        self.assertIn('path_issues', result, "Must identify PATH-related issues")
    
    def test_permission_validation(self):
        """Test that file system permissions are validated"""
        result = self.validator.validate_permissions()
        
        self.assertIn('can_write_global', result, "Must check global npm directory write permissions")
        self.assertIn('can_execute_commands', result, "Must check command execution permissions")
        self.assertIn('permission_issues', result, "Must identify permission issues")
    
    def test_claude_code_version_compatibility(self):
        """Test that Claude Code version compatibility is checked"""
        # Simulate different Claude Code versions
        test_versions = ['1.0.0', '1.5.0', '2.0.0']
        
        original_testing = os.environ.get('TESTING')
        try:
            os.environ['TESTING'] = 'true'
            os.environ['CLAUDE_CODE_AVAILABLE'] = 'true'
            
            for version in test_versions:
                os.environ['CLAUDE_CODE_VERSION'] = version
                
                # Clear cache to ensure fresh validation
                self.validator.cache.clear()
                result = self.validator.validate_claude_code_installation()
                
                self.assertIn('version_compatible', result, "Must check version compatibility")
                # Version should be detected (format may vary)
                self.assertIsNotNone(result['version'], "Must report detected version")
        finally:
            if original_testing:
                os.environ['TESTING'] = original_testing
            else:
                os.environ.pop('TESTING', None)
            os.environ.pop('CLAUDE_CODE_AVAILABLE', None)
            os.environ.pop('CLAUDE_CODE_VERSION', None)
    
    def test_network_connectivity_validation(self):
        """Test that network connectivity for npm is validated"""
        result = self.validator.validate_network_connectivity()
        
        self.assertIn('npm_registry_accessible', result, "Must check npm registry accessibility")
        self.assertIn('internet_connection', result, "Must check internet connection")
        self.assertIn('proxy_configuration', result, "Must check proxy configuration")
    
    def test_validation_generates_installation_report(self):
        """Test that validation generates a comprehensive installation report"""
        report = self.validator.generate_validation_report()
        
        self.assertIn('environment_status', report, "Report must include environment status")
        self.assertIn('validation_timestamp', report, "Report must include timestamp")
        self.assertIn('system_information', report, "Report must include system information")
        self.assertIn('recommendations', report, "Report must include recommendations")
        self.assertIn('next_steps', report, "Report must include next steps")
    
    def test_validation_with_missing_nodejs(self):
        """Test validation behavior when Node.js is missing"""
        original_testing = os.environ.get('TESTING')
        try:
            os.environ['TESTING'] = 'true'
            os.environ['NODEJS_AVAILABLE'] = 'false'
            
            # Clear cache to ensure fresh validation
            self.validator.cache.clear()
            result = self.validator.validate_nodejs_version()
            
            self.assertFalse(result['version_valid'], "Must report invalid when Node.js missing")
            self.assertIn('not found', result['error_message'].lower(), "Error must mention Node.js not found")
        finally:
            if original_testing:
                os.environ['TESTING'] = original_testing
            else:
                os.environ.pop('TESTING', None)
            os.environ.pop('NODEJS_AVAILABLE', None)
    
    def test_validation_with_incompatible_nodejs(self):
        """Test validation behavior with incompatible Node.js version"""
        original_testing = os.environ.get('TESTING')
        try:
            os.environ['TESTING'] = 'true'
            os.environ['NODEJS_AVAILABLE'] = 'true'
            os.environ['NODEJS_VERSION'] = 'v12.0.0'  # Below minimum requirement
            
            # Clear cache to ensure fresh validation
            self.validator.cache.clear()
            result = self.validator.validate_nodejs_version()
            
            self.assertFalse(result['version_valid'], "Must report invalid for old Node.js version")
            self.assertIn('upgrade', result['error_message'].lower(), "Error must suggest upgrade")
        finally:
            if original_testing:
                os.environ['TESTING'] = original_testing
            else:
                os.environ.pop('TESTING', None)
            os.environ.pop('NODEJS_AVAILABLE', None)
            os.environ.pop('NODEJS_VERSION', None)
    
    def test_validation_provides_installation_instructions(self):
        """Test that validation provides installation instructions for missing components"""
        # Test missing Claude Code scenario
        original_testing = os.environ.get('TESTING')
        try:
            os.environ['TESTING'] = 'true'
            os.environ['CLAUDE_CODE_AVAILABLE'] = 'false'
            
            # Clear cache to ensure fresh validation
            self.validator.cache.clear()
            result = self.validator.validate_claude_code_installation()
            
            self.assertIn('installation_instructions', result, "Must provide installation instructions")
            instructions = result['installation_instructions']
            self.assertIn('install', instructions.lower(), "Instructions must mention installation")
        finally:
            if original_testing:
                os.environ['TESTING'] = original_testing
            else:
                os.environ.pop('TESTING', None)
            os.environ.pop('CLAUDE_CODE_AVAILABLE', None)
    
    def test_validation_detects_common_issues(self):
        """Test that validation detects common environment issues"""
        issues = self.validator.detect_common_issues()
        
        self.assertIn('outdated_npm', issues, "Must check for outdated npm")
        self.assertIn('missing_build_tools', issues, "Must check for missing build tools")
        self.assertIn('path_conflicts', issues, "Must check for PATH conflicts")
        self.assertIn('permission_denied', issues, "Must check for permission issues")
    
    def test_validation_caching(self):
        """Test that validation results can be cached for performance"""
        # First validation
        result1 = self.validator.validate_environment()
        
        # Second validation (should use cache if available)
        result2 = self.validator.validate_environment()
        
        self.assertEqual(result1['nodejs_validation']['current_version'], 
                        result2['nodejs_validation']['current_version'], 
                        "Cached results should be consistent")
    
    def test_validation_configuration(self):
        """Test that environment validation can be configured"""
        config = self.validator.get_validation_config()
        
        self.assertIn('strict_mode', config, "Must support strict validation mode")
        self.assertIn('required_nodejs_version', config, "Must specify required Node.js version")
        self.assertIn('claude_code_required', config, "Must specify if Claude Code is required")
        self.assertIn('network_checks_enabled', config, "Must allow disabling network checks")
    
    def test_validation_exit_codes(self):
        """Test that validation provides appropriate exit codes"""
        result = self.validator.validate_environment()
        
        self.assertIn('exit_code', result, "Must provide exit code")
        exit_code = result['exit_code']
        self.assertIn(exit_code, [0, 1, 2], "Exit code must be 0 (success), 1 (warnings), or 2 (errors)")
    
    def test_post_install_integration(self):
        """Test that environment validation integrates with post-install process"""
        from post_install_automation import PostInstallAutomation
        
        # Create post-install automation with environment validation
        post_install = PostInstallAutomation(self.package_root)
        
        # Simulate post-install execution that includes environment validation
        result = post_install.simulate_post_install_execution()
        
        # Should include environment validation in the process
        self.assertTrue(result['executed'], "Post-install should execute")
        
        # Environment validation should be part of the setup process
        output = result['output']
        environment_keywords = ['environment', 'validation', 'checking', 'requirements']
        has_env_validation = any(keyword in output.lower() for keyword in environment_keywords)
        self.assertTrue(has_env_validation, "Post-install should mention environment validation")


if __name__ == '__main__':
    # Run the tests
    unittest.main(verbosity=2)