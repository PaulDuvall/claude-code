#!/usr/bin/env python3
"""
Test Suite for REQ-040: Pre-Publication Package Testing
Priority: High
Requirement: BEFORE publishing the package to the npm registry
THE SYSTEM SHALL provide comprehensive testing mechanisms including local package installation testing, 
multi-platform compatibility verification, and automated test suites to validate package integrity and functionality
"""

import os
import subprocess
import unittest
from pathlib import Path
import tempfile
import shutil
import sys
import json
import tarfile
from unittest.mock import patch, MagicMock

# Add the npm-package directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../npm-package'))


class TestPrePublicationTesting(unittest.TestCase):
    """Test cases for pre-publication package testing requirement"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment"""
        cls.test_dir = tempfile.mkdtemp(prefix="pre_publication_test_")
        cls.package_root = Path(cls.test_dir) / "claude-dev-toolkit"
        cls.package_root.mkdir(parents=True, exist_ok=True)
        
        # We'll import and create the tester after ensuring it exists
        
    @classmethod
    def tearDownClass(cls):
        """Clean up test environment"""
        if os.path.exists(cls.test_dir):
            shutil.rmtree(cls.test_dir)
    
    def test_pre_publication_tester_exists(self):
        """Test that pre-publication tester can be instantiated"""
        from pre_publication_tester import PrePublicationTester
        tester = PrePublicationTester(self.package_root)
        self.assertIsNotNone(tester, "PrePublicationTester must be instantiable")
    
    def test_comprehensive_testing_suite_available(self):
        """Test that comprehensive testing mechanisms are available"""
        from pre_publication_tester import PrePublicationTester
        tester = PrePublicationTester(self.package_root)
        
        # Test that testing suite provides required mechanisms
        mechanisms = tester.get_testing_mechanisms()
        
        self.assertIn('local_installation_testing', mechanisms, "Must provide local installation testing")
        self.assertIn('multi_platform_verification', mechanisms, "Must provide multi-platform verification")
        self.assertIn('automated_test_suites', mechanisms, "Must provide automated test suites")
        self.assertIn('package_integrity_validation', mechanisms, "Must provide package integrity validation")
        self.assertIn('functionality_verification', mechanisms, "Must provide functionality verification")
    
    def test_local_package_installation_testing(self):
        """Test local package installation testing capability"""
        from pre_publication_tester import PrePublicationTester
        tester = PrePublicationTester(self.package_root)
        
        # Test local installation testing
        result = tester.test_local_installation()
        
        self.assertIn('installation_tested', result, "Must test local installation")
        self.assertIn('package_tarball_created', result, "Must create package tarball")
        self.assertIn('global_install_simulation', result, "Must simulate global install")
        self.assertIn('cli_availability_verified', result, "Must verify CLI availability")
        self.assertIn('installation_success', result, "Must report installation success/failure")
    
    def test_multi_platform_compatibility_verification(self):
        """Test multi-platform compatibility verification"""
        from pre_publication_tester import PrePublicationTester
        tester = PrePublicationTester(self.package_root)
        
        # Test multi-platform verification
        result = tester.verify_multi_platform_compatibility()
        
        self.assertIn('platforms_tested', result, "Must test multiple platforms")
        self.assertIn('compatibility_results', result, "Must provide compatibility results")
        self.assertIn('supported_platforms', result, "Must list supported platforms")
        self.assertIn('node_versions_tested', result, "Must test multiple Node.js versions")
        
        # Should include common platforms
        platforms = result['platforms_tested']
        self.assertIn('linux', platforms, "Must test Linux compatibility")
        self.assertIn('darwin', platforms, "Must test macOS compatibility")
    
    def test_automated_test_suite_execution(self):
        """Test automated test suite execution"""
        from pre_publication_tester import PrePublicationTester
        tester = PrePublicationTester(self.package_root)
        
        # Test automated test suite
        result = tester.run_automated_test_suite()
        
        self.assertIn('test_suite_executed', result, "Must execute test suite")
        self.assertIn('test_results', result, "Must provide test results")
        self.assertIn('total_tests', result, "Must report total test count")
        self.assertIn('passed_tests', result, "Must report passed test count")
        self.assertIn('failed_tests', result, "Must report failed test count")
        self.assertIn('test_categories', result, "Must categorize tests")
        
        # Test categories should include key areas
        categories = result['test_categories']
        self.assertIn('cli_functionality', categories, "Must test CLI functionality")
        self.assertIn('installation', categories, "Must test installation")
        self.assertIn('permissions', categories, "Must test permissions")
        self.assertIn('integration', categories, "Must test integration")
    
    def test_package_integrity_validation(self):
        """Test package integrity validation"""
        from pre_publication_tester import PrePublicationTester
        tester = PrePublicationTester(self.package_root)
        
        # Test package integrity validation
        result = tester.validate_package_integrity()
        
        self.assertIn('integrity_validated', result, "Must validate integrity")
        self.assertIn('file_checksums', result, "Must verify file checksums")
        self.assertIn('package_structure', result, "Must verify package structure")
        self.assertIn('required_files_present', result, "Must check required files")
        self.assertIn('permissions_correct', result, "Must verify permissions")
        self.assertIn('no_sensitive_files', result, "Must check for sensitive files")
    
    def test_functionality_verification(self):
        """Test functionality verification"""
        from pre_publication_tester import PrePublicationTester
        tester = PrePublicationTester(self.package_root)
        
        # Test functionality verification
        result = tester.verify_functionality()
        
        self.assertIn('functionality_verified', result, "Must verify functionality")
        self.assertIn('cli_commands_working', result, "Must verify CLI commands work")
        self.assertIn('help_system_functional', result, "Must verify help system")
        self.assertIn('error_handling_tested', result, "Must test error handling")
        self.assertIn('expected_outputs_verified', result, "Must verify expected outputs")
    
    def test_publication_readiness_assessment(self):
        """Test overall publication readiness assessment"""
        from pre_publication_tester import PrePublicationTester
        tester = PrePublicationTester(self.package_root)
        
        # Test publication readiness
        result = tester.assess_publication_readiness()
        
        self.assertIn('ready_for_publication', result, "Must assess readiness")
        self.assertIn('all_tests_passed', result, "Must verify all tests passed")
        self.assertIn('critical_issues', result, "Must identify critical issues")
        self.assertIn('warnings', result, "Must identify warnings")
        self.assertIn('blocking_issues', result, "Must identify blocking issues")
        self.assertIn('recommendations', result, "Must provide recommendations")
    
    def test_test_report_generation(self):
        """Test comprehensive test report generation"""
        from pre_publication_tester import PrePublicationTester
        tester = PrePublicationTester(self.package_root)
        
        # Test report generation
        result = tester.generate_test_report()
        
        self.assertIn('report_generated', result, "Must generate test report")
        self.assertIn('report_file', result, "Must create report file")
        self.assertIn('summary', result, "Must include summary")
        self.assertIn('detailed_results', result, "Must include detailed results")
        self.assertIn('timestamp', result, "Must include timestamp")
        
        # Verify report file exists if generated
        if result['report_generated']:
            report_file = Path(result['report_file'])
            self.assertTrue(report_file.exists(), "Report file must exist")
    
    def test_testing_configuration_management(self):
        """Test testing configuration management"""
        from pre_publication_tester import PrePublicationTester
        tester = PrePublicationTester(self.package_root)
        
        # Test configuration management
        config = tester.get_testing_configuration()
        
        self.assertIn('test_environments', config, "Must configure test environments")
        self.assertIn('node_versions', config, "Must specify Node.js versions to test")
        self.assertIn('platforms', config, "Must specify platforms to test")
        self.assertIn('test_timeout', config, "Must specify test timeout")
        self.assertIn('required_tests', config, "Must specify required tests")
        
        # Test configuration updating
        new_config = {
            'test_environments': ['docker', 'local'],
            'node_versions': ['16', '18', '20'],
            'strict_mode': True
        }
        update_result = tester.update_testing_configuration(new_config)
        self.assertTrue(update_result['updated'], "Must allow configuration updates")
    
    def test_testing_prerequisites_validation(self):
        """Test testing prerequisites validation"""
        from pre_publication_tester import PrePublicationTester
        tester = PrePublicationTester(self.package_root)
        
        # Test prerequisites validation
        result = tester.validate_testing_prerequisites()
        
        self.assertIn('prerequisites_met', result, "Must validate prerequisites")
        self.assertIn('docker_available', result, "Must check Docker availability")
        self.assertIn('node_available', result, "Must check Node.js availability")
        self.assertIn('npm_available', result, "Must check npm availability")
        self.assertIn('package_buildable', result, "Must check package can be built")
        self.assertIn('missing_requirements', result, "Must list missing requirements")
    
    def test_parallel_testing_execution(self):
        """Test parallel testing execution capability"""
        from pre_publication_tester import PrePublicationTester
        tester = PrePublicationTester(self.package_root)
        
        # Test parallel execution
        result = tester.run_parallel_tests()
        
        self.assertIn('parallel_execution', result, "Must support parallel execution")
        self.assertIn('worker_count', result, "Must report worker count")
        self.assertIn('execution_time', result, "Must report execution time")
        self.assertIn('test_results_by_worker', result, "Must provide per-worker results")
    
    def test_testing_cleanup_and_isolation(self):
        """Test testing cleanup and isolation"""
        from pre_publication_tester import PrePublicationTester
        tester = PrePublicationTester(self.package_root)
        
        # Test cleanup capabilities
        result = tester.cleanup_test_environment()
        
        self.assertIn('cleanup_performed', result, "Must perform cleanup")
        self.assertIn('temporary_files_removed', result, "Must remove temporary files")
        self.assertIn('test_installations_removed', result, "Must remove test installations")
        self.assertIn('isolation_verified', result, "Must verify test isolation")
    
    def test_continuous_testing_integration(self):
        """Test continuous testing integration capabilities"""
        from pre_publication_tester import PrePublicationTester
        tester = PrePublicationTester(self.package_root)
        
        # Test CI integration
        result = tester.get_ci_integration_config()
        
        self.assertIn('ci_compatible', result, "Must be CI compatible")
        self.assertIn('github_actions_config', result, "Must provide GitHub Actions config")
        self.assertIn('exit_codes', result, "Must provide appropriate exit codes")
        self.assertIn('artifact_generation', result, "Must support artifact generation")
    
    def test_publication_blocking_mechanism(self):
        """Test mechanism to block publication on test failures"""
        from pre_publication_tester import PrePublicationTester
        tester = PrePublicationTester(self.package_root)
        
        # Test publication blocking
        result = tester.check_publication_blockers()
        
        self.assertIn('publication_allowed', result, "Must determine if publication allowed")
        self.assertIn('blocking_issues', result, "Must identify blocking issues")
        self.assertIn('severity_levels', result, "Must categorize issue severity")
        
        # Test with simulated failures by directly adding failing results
        from pre_publication_tester import TestResult, TestCategory, TestSeverity
        
        # Clear existing results and add a failing one
        tester.test_results = [
            TestResult(
                name="failing_test",
                category=TestCategory.CLI_FUNCTIONALITY,
                passed=False,
                message="Test failed",
                severity=TestSeverity.CRITICAL,
                execution_time=0.1,
                details={}
            )
        ]
        result = tester.check_publication_blockers()
        self.assertFalse(result['publication_allowed'], "Must block publication on test failures")
    
    def test_testing_metrics_collection(self):
        """Test testing metrics collection and reporting"""
        from pre_publication_tester import PrePublicationTester
        tester = PrePublicationTester(self.package_root)
        
        # Test metrics collection
        result = tester.collect_testing_metrics()
        
        self.assertIn('metrics_collected', result, "Must collect testing metrics")
        self.assertIn('test_coverage', result, "Must report test coverage")
        self.assertIn('execution_time', result, "Must report execution time")
        self.assertIn('resource_usage', result, "Must report resource usage")
        self.assertIn('success_rate', result, "Must report success rate")
        self.assertIn('performance_benchmarks', result, "Must provide performance benchmarks")


if __name__ == '__main__':
    # Run the tests
    unittest.main(verbosity=2)