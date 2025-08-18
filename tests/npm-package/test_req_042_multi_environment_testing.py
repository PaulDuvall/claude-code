#!/usr/bin/env python3
"""
Test Suite for REQ-042: Multi-Environment Testing Framework
Priority: Medium
Requirement: THE SYSTEM SHALL provide Docker-based testing environments for validating 
package installation across multiple Node.js versions (16, 18, 20+) and operating systems 
(Linux amd64, Linux arm64, macOS, Windows)
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


class TestMultiEnvironmentTesting(unittest.TestCase):
    """Test cases for multi-environment testing framework requirement"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment"""
        cls.test_dir = tempfile.mkdtemp(prefix="multi_env_test_")
        cls.package_root = Path(cls.test_dir) / "claude-dev-toolkit"
        cls.package_root.mkdir(parents=True, exist_ok=True)
        
    @classmethod
    def tearDownClass(cls):
        """Clean up test environment"""
        if os.path.exists(cls.test_dir):
            shutil.rmtree(cls.test_dir)
    
    def test_multi_environment_framework_exists(self):
        """Test that multi-environment testing framework can be instantiated"""
        from multi_environment_tester import MultiEnvironmentTester
        tester = MultiEnvironmentTester(self.package_root)
        self.assertIsNotNone(tester, "MultiEnvironmentTester must be instantiable")
    
    def test_docker_based_testing_environments(self):
        """Test Docker-based testing environment support"""
        from multi_environment_tester import MultiEnvironmentTester
        tester = MultiEnvironmentTester(self.package_root)
        
        # Test Docker environment support
        environments = tester.get_supported_environments()
        
        self.assertIn('docker', environments, "Must support Docker environments")
        self.assertIn('local', environments, "Must support local environments")
        self.assertIsInstance(environments['docker'], dict, "Docker config must be dictionary")
        
        # Docker environments should include multiple configurations
        docker_config = environments['docker']
        self.assertIn('images', docker_config, "Must provide Docker images")
        self.assertIn('platforms', docker_config, "Must support multiple platforms")
        self.assertIn('node_versions', docker_config, "Must support multiple Node versions")
    
    def test_multiple_nodejs_version_support(self):
        """Test support for multiple Node.js versions"""
        from multi_environment_tester import MultiEnvironmentTester
        tester = MultiEnvironmentTester(self.package_root)
        
        # Test Node.js version support
        node_versions = tester.get_supported_node_versions()
        
        self.assertIn('16', node_versions, "Must support Node.js 16")
        self.assertIn('18', node_versions, "Must support Node.js 18")
        self.assertIn('20', node_versions, "Must support Node.js 20")
        
        # Verify versions are properly configured
        for version in ['16', '18', '20']:
            config = tester.get_node_version_config(version)
            self.assertIn('docker_image', config, f"Node {version} must have Docker image")
            self.assertIn('npm_version', config, f"Node {version} must specify npm version")
    
    def test_multiple_operating_system_support(self):
        """Test support for multiple operating systems"""
        from multi_environment_tester import MultiEnvironmentTester
        tester = MultiEnvironmentTester(self.package_root)
        
        # Test OS platform support
        platforms = tester.get_supported_platforms()
        
        self.assertIn('linux/amd64', platforms, "Must support Linux amd64")
        self.assertIn('linux/arm64', platforms, "Must support Linux arm64")
        self.assertIn('darwin', platforms, "Must support macOS")
        self.assertIn('windows', platforms, "Must support Windows")
        
        # Verify platform configurations
        for platform in platforms:
            config = tester.get_platform_config(platform)
            self.assertIn('docker_platform', config, f"Platform {platform} must have Docker config")
            self.assertIn('base_images', config, f"Platform {platform} must have base images")
    
    def test_docker_container_management(self):
        """Test Docker container creation and management"""
        from multi_environment_tester import MultiEnvironmentTester
        tester = MultiEnvironmentTester(self.package_root)
        
        # Test container management capabilities
        container_mgmt = tester.get_container_management_capabilities()
        
        self.assertIn('create_container', container_mgmt, "Must support container creation")
        self.assertIn('run_tests_in_container', container_mgmt, "Must run tests in containers")
        self.assertIn('cleanup_containers', container_mgmt, "Must cleanup containers")
        self.assertIn('volume_mounting', container_mgmt, "Must support volume mounting")
        self.assertIn('network_isolation', container_mgmt, "Must support network isolation")
    
    def test_package_installation_validation_across_environments(self):
        """Test package installation validation in multiple environments"""
        from multi_environment_tester import MultiEnvironmentTester
        tester = MultiEnvironmentTester(self.package_root)
        
        # Test installation validation
        test_environments = [
            {'platform': 'linux/amd64', 'node_version': '18'},
            {'platform': 'linux/arm64', 'node_version': '20'},
            {'platform': 'darwin', 'node_version': '16'}
        ]
        
        results = tester.validate_installation_across_environments(test_environments)
        
        self.assertIn('validation_results', results, "Must provide validation results")
        self.assertIn('environments_tested', results, "Must list tested environments")
        self.assertIn('success_rate', results, "Must calculate success rate")
        self.assertIn('failed_environments', results, "Must identify failed environments")
        
        # Results should include each test environment
        for env in test_environments:
            env_key = f"{env['platform']}-node{env['node_version']}"
            self.assertIn(env_key, results['validation_results'], f"Must test {env_key}")
    
    def test_environment_matrix_testing(self):
        """Test comprehensive environment matrix testing"""
        from multi_environment_tester import MultiEnvironmentTester
        tester = MultiEnvironmentTester(self.package_root)
        
        # Test matrix testing
        matrix_result = tester.run_environment_matrix_tests()
        
        self.assertIn('matrix_tested', matrix_result, "Must run matrix tests")
        self.assertIn('total_combinations', matrix_result, "Must report total combinations")
        self.assertIn('successful_combinations', matrix_result, "Must report successful combinations")
        self.assertIn('failed_combinations', matrix_result, "Must report failed combinations")
        self.assertIn('matrix_results', matrix_result, "Must provide detailed matrix results")
        
        # Matrix should test multiple combinations
        matrix_results = matrix_result['matrix_results']
        self.assertGreater(len(matrix_results), 3, "Must test multiple environment combinations")
        
        # Each result should have platform and node version info
        for result in matrix_results:
            self.assertIn('platform', result, "Each result must specify platform")
            self.assertIn('node_version', result, "Each result must specify node version")
            self.assertIn('test_passed', result, "Each result must indicate pass/fail")
    
    def test_docker_image_management(self):
        """Test Docker image management and caching"""
        from multi_environment_tester import MultiEnvironmentTester
        tester = MultiEnvironmentTester(self.package_root)
        
        # Test image management
        image_mgmt = tester.get_docker_image_management()
        
        self.assertIn('available_images', image_mgmt, "Must list available images")
        self.assertIn('image_pulling', image_mgmt, "Must support image pulling")
        self.assertIn('image_caching', image_mgmt, "Must support image caching")
        self.assertIn('cleanup_old_images', image_mgmt, "Must support image cleanup")
        
        # Test image preparation
        node_versions = ['16', '18', '20']
        preparation_result = tester.prepare_docker_images(node_versions)
        
        self.assertIn('images_prepared', preparation_result, "Must prepare images")
        self.assertIn('preparation_status', preparation_result, "Must report preparation status")
        for version in node_versions:
            self.assertIn(f"node:{version}", preparation_result['preparation_status'], 
                         f"Must prepare Node {version} image")
    
    def test_test_execution_in_containers(self):
        """Test test execution within Docker containers"""
        from multi_environment_tester import MultiEnvironmentTester
        tester = MultiEnvironmentTester(self.package_root)
        
        # Test container execution
        test_config = {
            'platform': 'linux/amd64',
            'node_version': '18',
            'tests_to_run': ['installation', 'cli_functionality', 'permissions']
        }
        
        execution_result = tester.execute_tests_in_container(test_config)
        
        self.assertIn('container_created', execution_result, "Must create container")
        self.assertIn('tests_executed', execution_result, "Must execute tests")
        self.assertIn('test_results', execution_result, "Must provide test results")
        self.assertIn('container_cleanup', execution_result, "Must cleanup container")
        self.assertIn('execution_time', execution_result, "Must report execution time")
        
        # Test results should include all requested tests
        test_results = execution_result['test_results']
        for test_name in test_config['tests_to_run']:
            self.assertIn(test_name, test_results, f"Must execute {test_name} test")
    
    def test_parallel_environment_testing(self):
        """Test parallel testing across multiple environments"""
        from multi_environment_tester import MultiEnvironmentTester
        tester = MultiEnvironmentTester(self.package_root)
        
        # Test parallel execution
        environments = [
            {'platform': 'linux/amd64', 'node_version': '16'},
            {'platform': 'linux/amd64', 'node_version': '18'},
            {'platform': 'linux/arm64', 'node_version': '20'}
        ]
        
        parallel_result = tester.run_parallel_environment_tests(environments)
        
        self.assertIn('parallel_execution', parallel_result, "Must support parallel execution")
        self.assertIn('worker_count', parallel_result, "Must report worker count")
        self.assertIn('total_execution_time', parallel_result, "Must report total time")
        self.assertIn('individual_results', parallel_result, "Must provide individual results")
        self.assertIn('performance_improvement', parallel_result, "Must show performance improvement")
        
        # Should have results for each environment
        individual_results = parallel_result['individual_results']
        self.assertEqual(len(individual_results), len(environments), 
                        "Must have result for each environment")
    
    def test_environment_isolation_and_cleanup(self):
        """Test environment isolation and cleanup mechanisms"""
        from multi_environment_tester import MultiEnvironmentTester
        tester = MultiEnvironmentTester(self.package_root)
        
        # Test isolation mechanisms
        isolation_config = tester.get_isolation_configuration()
        
        self.assertIn('container_isolation', isolation_config, "Must provide container isolation")
        self.assertIn('network_isolation', isolation_config, "Must provide network isolation")
        self.assertIn('filesystem_isolation', isolation_config, "Must provide filesystem isolation")
        self.assertIn('cleanup_strategy', isolation_config, "Must define cleanup strategy")
        
        # Test cleanup execution
        cleanup_result = tester.cleanup_test_environments()
        
        self.assertIn('cleanup_performed', cleanup_result, "Must perform cleanup")
        self.assertIn('containers_removed', cleanup_result, "Must remove containers")
        self.assertIn('networks_cleaned', cleanup_result, "Must clean networks")
        self.assertIn('volumes_removed', cleanup_result, "Must remove volumes")
        self.assertIn('images_pruned', cleanup_result, "Must prune unused images")
    
    def test_test_result_aggregation(self):
        """Test aggregation of test results across environments"""
        from multi_environment_tester import MultiEnvironmentTester
        tester = MultiEnvironmentTester(self.package_root)
        
        # Test result aggregation
        mock_results = [
            {'environment': 'linux/amd64-node16', 'passed': True, 'tests': 10},
            {'environment': 'linux/amd64-node18', 'passed': True, 'tests': 10},
            {'environment': 'linux/arm64-node20', 'passed': False, 'tests': 10, 'failures': 2}
        ]
        
        aggregation_result = tester.aggregate_test_results(mock_results)
        
        self.assertIn('total_environments', aggregation_result, "Must count total environments")
        self.assertIn('passing_environments', aggregation_result, "Must count passing environments")
        self.assertIn('failing_environments', aggregation_result, "Must count failing environments")
        self.assertIn('overall_success_rate', aggregation_result, "Must calculate success rate")
        self.assertIn('detailed_breakdown', aggregation_result, "Must provide detailed breakdown")
        
        # Verify calculations
        self.assertEqual(aggregation_result['total_environments'], 3, "Must count all environments")
        self.assertEqual(aggregation_result['passing_environments'], 2, "Must count passing correctly")
        self.assertEqual(aggregation_result['failing_environments'], 1, "Must count failing correctly")
    
    def test_cross_platform_compatibility_validation(self):
        """Test cross-platform compatibility validation"""
        from multi_environment_tester import MultiEnvironmentTester
        tester = MultiEnvironmentTester(self.package_root)
        
        # Test compatibility validation
        compatibility_result = tester.validate_cross_platform_compatibility()
        
        self.assertIn('compatibility_validated', compatibility_result, "Must validate compatibility")
        self.assertIn('supported_platforms', compatibility_result, "Must list supported platforms")
        self.assertIn('platform_specific_issues', compatibility_result, "Must identify platform issues")
        self.assertIn('compatibility_matrix', compatibility_result, "Must provide compatibility matrix")
        self.assertIn('recommendations', compatibility_result, "Must provide recommendations")
        
        # Compatibility matrix should cover key platforms
        matrix = compatibility_result['compatibility_matrix']
        expected_platforms = ['linux/amd64', 'linux/arm64', 'darwin']
        for platform in expected_platforms:
            self.assertIn(platform, matrix, f"Must test {platform} compatibility")
    
    def test_environment_configuration_management(self):
        """Test environment configuration management"""
        from multi_environment_tester import MultiEnvironmentTester
        tester = MultiEnvironmentTester(self.package_root)
        
        # Test configuration management
        config = tester.get_environment_configuration()
        
        self.assertIn('default_environments', config, "Must define default environments")
        self.assertIn('custom_environments', config, "Must support custom environments")
        self.assertIn('timeout_settings', config, "Must define timeout settings")
        self.assertIn('resource_limits', config, "Must define resource limits")
        self.assertIn('retry_policies', config, "Must define retry policies")
        
        # Test configuration updates
        new_config = {
            'timeout_settings': {'container_start': 60, 'test_execution': 300},
            'resource_limits': {'memory': '1G', 'cpu': '1'}
        }
        
        update_result = tester.update_environment_configuration(new_config)
        self.assertTrue(update_result['updated'], "Must allow configuration updates")
    
    def test_docker_prerequisite_validation(self):
        """Test Docker prerequisite validation"""
        from multi_environment_tester import MultiEnvironmentTester
        tester = MultiEnvironmentTester(self.package_root)
        
        # Test Docker prerequisites
        prereq_result = tester.validate_docker_prerequisites()
        
        self.assertIn('docker_available', prereq_result, "Must check Docker availability")
        self.assertIn('docker_version', prereq_result, "Must check Docker version")
        self.assertIn('docker_compose_available', prereq_result, "Must check Docker Compose")
        self.assertIn('platform_support', prereq_result, "Must check platform support")
        self.assertIn('permission_check', prereq_result, "Must check Docker permissions")
        self.assertIn('missing_requirements', prereq_result, "Must list missing requirements")
    
    def test_environment_performance_monitoring(self):
        """Test environment performance monitoring"""
        from multi_environment_tester import MultiEnvironmentTester
        tester = MultiEnvironmentTester(self.package_root)
        
        # Test performance monitoring
        monitoring_result = tester.monitor_environment_performance()
        
        self.assertIn('performance_monitored', monitoring_result, "Must monitor performance")
        self.assertIn('resource_usage', monitoring_result, "Must track resource usage")
        self.assertIn('execution_times', monitoring_result, "Must track execution times")
        self.assertIn('bottlenecks_identified', monitoring_result, "Must identify bottlenecks")
        self.assertIn('optimization_suggestions', monitoring_result, "Must suggest optimizations")
        
        # Resource usage should include key metrics
        resource_usage = monitoring_result['resource_usage']
        self.assertIn('cpu_usage', resource_usage, "Must track CPU usage")
        self.assertIn('memory_usage', resource_usage, "Must track memory usage")
        self.assertIn('disk_io', resource_usage, "Must track disk I/O")
    
    def test_ci_cd_integration_support(self):
        """Test CI/CD integration support for multi-environment testing"""
        from multi_environment_tester import MultiEnvironmentTester
        tester = MultiEnvironmentTester(self.package_root)
        
        # Test CI/CD integration
        ci_config = tester.get_ci_integration_configuration()
        
        self.assertIn('github_actions', ci_config, "Must support GitHub Actions")
        self.assertIn('gitlab_ci', ci_config, "Must support GitLab CI")
        self.assertIn('jenkins', ci_config, "Must support Jenkins")
        self.assertIn('azure_pipelines', ci_config, "Must support Azure Pipelines")
        
        # GitHub Actions config should be comprehensive
        github_config = ci_config['github_actions']
        self.assertIn('workflow_matrix', github_config, "Must provide workflow matrix")
        self.assertIn('docker_setup', github_config, "Must include Docker setup")
        self.assertIn('parallel_jobs', github_config, "Must support parallel jobs")


if __name__ == '__main__':
    # Run the tests
    unittest.main(verbosity=2)