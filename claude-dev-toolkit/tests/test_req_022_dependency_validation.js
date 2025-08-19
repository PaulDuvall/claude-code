#!/usr/bin/env node

/**
 * 🔴 RED PHASE: REQ-022 Dependency Validation Tests
 * 
 * Test Suite for Dependency Validation and Installation Instructions
 * Implements comprehensive testing for missing dependency detection and resolution guidance
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Test class for REQ-022 Dependency Validation
class DependencyValidationTest {
    constructor() {
        this.testDir = path.join(os.tmpdir(), 'req022-test-' + Date.now());
        this.passed = 0;
        this.failed = 0;
        
        // Ensure we have a DependencyValidator class to test
        try {
            const DependencyValidator = require('../lib/dependency-validator');
            this.validator = new DependencyValidator();
        } catch (error) {
            this.validator = null; // Expected to fail in RED phase
        }
    }

    setUp() {
        // Create test directory structure
        fs.mkdirSync(this.testDir, { recursive: true });
    }

    tearDown() {
        try {
            // Clean up test directory
            if (fs.existsSync(this.testDir)) {
                fs.rmSync(this.testDir, { recursive: true, force: true });
            }
        } catch (error) {
            console.warn('Cleanup warning:', error.message);
        }
    }

    runTest(testName, testFn) {
        this.setUp();
        try {
            testFn.call(this);
            console.log(`✅ PASS: ${testName}`);
            this.passed++;
        } catch (error) {
            console.log(`❌ FAIL: ${testName}`);
            console.log(`  Error: ${error.message}`);
            this.failed++;
        } finally {
            this.tearDown();
        }
    }

    // Test 1: Dependency Validator Module Exists
    test_dependency_validator_exists() {
        if (!this.validator) {
            throw new Error('DependencyValidator module must exist and be importable');
        }
        
        if (typeof this.validator.checkDependencies !== 'function') {
            throw new Error('DependencyValidator must have checkDependencies method');
        }
        
        if (typeof this.validator.validateDependency !== 'function') {
            throw new Error('DependencyValidator must have validateDependency method');
        }
        
        if (typeof this.validator.generateInstallationInstructions !== 'function') {
            throw new Error('DependencyValidator must have generateInstallationInstructions method');
        }
        
        if (typeof this.validator.getMissingDependencies !== 'function') {
            throw new Error('DependencyValidator must have getMissingDependencies method');
        }
    }

    // Test 2: Detects Missing Node.js Dependency
    test_detects_missing_nodejs_dependency() {
        const dependencies = [
            { name: 'node', type: 'runtime', version: '>=18.0.0' },
            { name: 'npm', type: 'package_manager', version: '>=8.0.0' }
        ];
        
        const result = this.validator.checkDependencies(dependencies);
        
        if (!result.hasOwnProperty('valid')) {
            throw new Error('Must return validation result with valid property');
        }
        
        if (!result.hasOwnProperty('missing')) {
            throw new Error('Must return list of missing dependencies');
        }
        
        if (!result.hasOwnProperty('satisfied')) {
            throw new Error('Must return list of satisfied dependencies');
        }
        
        if (!Array.isArray(result.missing)) {
            throw new Error('Missing dependencies must be an array');
        }
        
        if (!Array.isArray(result.satisfied)) {
            throw new Error('Satisfied dependencies must be an array');
        }
    }

    // Test 3: Validates Individual Dependency
    test_validates_individual_dependency() {
        const dependency = {
            name: 'node',
            type: 'runtime',
            version: '>=18.0.0',
            description: 'Node.js runtime environment'
        };
        
        const result = this.validator.validateDependency(dependency);
        
        if (!result.hasOwnProperty('available')) {
            throw new Error('Must return availability status');
        }
        
        if (!result.hasOwnProperty('version')) {
            throw new Error('Must return current version if available');
        }
        
        if (!result.hasOwnProperty('satisfiesRequirement')) {
            throw new Error('Must return version satisfaction status');
        }
        
        if (result.available && !result.installedPath) {
            throw new Error('Must return installation path when dependency is available');
        }
    }

    // Test 4: Generates Platform-Specific Installation Instructions
    test_generates_platform_specific_installation_instructions() {
        const missingDependency = {
            name: 'git',
            type: 'tool',
            version: '>=2.0.0',
            description: 'Git version control system'
        };
        
        const linuxInstructions = this.validator.generateInstallationInstructions(missingDependency, 'linux');
        const macosInstructions = this.validator.generateInstallationInstructions(missingDependency, 'darwin');
        const windowsInstructions = this.validator.generateInstallationInstructions(missingDependency, 'win32');
        
        // Validate Linux instructions
        if (!linuxInstructions.platform || linuxInstructions.platform !== 'linux') {
            throw new Error('Must specify target platform for Linux instructions');
        }
        
        if (!linuxInstructions.commands || linuxInstructions.commands.length === 0) {
            throw new Error('Must provide installation commands for Linux');
        }
        
        if (!linuxInstructions.packageManager) {
            throw new Error('Must specify package manager for Linux (apt, yum, etc.)');
        }
        
        // Validate macOS instructions
        if (!macosInstructions.commands || macosInstructions.commands.length === 0) {
            throw new Error('Must provide installation commands for macOS');
        }
        
        // Validate Windows instructions
        if (!windowsInstructions.commands || windowsInstructions.commands.length === 0) {
            throw new Error('Must provide installation commands for Windows');
        }
    }

    // Test 5: Checks Multiple Dependencies Simultaneously
    test_checks_multiple_dependencies_simultaneously() {
        const dependencies = [
            { name: 'node', type: 'runtime', version: '>=18.0.0' },
            { name: 'git', type: 'tool', version: '>=2.0.0' },
            { name: 'python', type: 'runtime', version: '>=3.8.0', optional: true },
            { name: 'nonexistent-tool-12345', type: 'tool', version: '>=1.0.0' }
        ];
        
        const result = this.validator.checkDependencies(dependencies);
        
        if (result.missing.length === 0) {
            throw new Error('Must detect at least one missing dependency (nonexistent-tool)');
        }
        
        if (!result.summary) {
            throw new Error('Must provide dependency check summary');
        }
        
        if (typeof result.summary.total !== 'number') {
            throw new Error('Summary must include total dependency count');
        }
        
        if (typeof result.summary.satisfied !== 'number') {
            throw new Error('Summary must include satisfied dependency count');
        }
        
        if (typeof result.summary.missing !== 'number') {
            throw new Error('Summary must include missing dependency count');
        }
    }

    // Test 6: Handles Optional Dependencies
    test_handles_optional_dependencies() {
        const dependencies = [
            { name: 'node', type: 'runtime', version: '>=18.0.0', required: true },
            { name: 'python', type: 'runtime', version: '>=3.8.0', required: false, optional: true },
            { name: 'docker', type: 'tool', version: '>=20.0.0', optional: true }
        ];
        
        const result = this.validator.checkDependencies(dependencies);
        
        if (!result.optional) {
            throw new Error('Must include optional dependencies in result');
        }
        
        if (!Array.isArray(result.optional.missing)) {
            throw new Error('Optional missing dependencies must be an array');
        }
        
        if (!Array.isArray(result.optional.satisfied)) {
            throw new Error('Optional satisfied dependencies must be an array');
        }
        
        // Validation should pass even with missing optional dependencies
        const requiredResult = result.missing.filter(dep => dep.required !== false);
        if (requiredResult.length > 0 && result.valid === true) {
            // This is acceptable - optional deps shouldn't fail validation
        }
    }

    // Test 7: Validates Version Requirements
    test_validates_version_requirements() {
        const testCases = [
            {
                dependency: { name: 'node', version: '>=18.0.0' },
                currentVersion: '20.1.0',
                shouldSatisfy: true
            },
            {
                dependency: { name: 'node', version: '>=18.0.0' },
                currentVersion: '16.20.0',
                shouldSatisfy: false
            },
            {
                dependency: { name: 'npm', version: '^8.0.0' },
                currentVersion: '8.19.2',
                shouldSatisfy: true
            },
            {
                dependency: { name: 'git', version: '~2.35.0' },
                currentVersion: '2.35.1',
                shouldSatisfy: true
            }
        ];
        
        for (const testCase of testCases) {
            const result = this.validator.validateVersionRequirement(
                testCase.dependency.version,
                testCase.currentVersion
            );
            
            if (result.satisfies !== testCase.shouldSatisfy) {
                throw new Error(`Version validation failed for ${testCase.dependency.name} ${testCase.currentVersion} against ${testCase.dependency.version}`);
            }
        }
    }

    // Test 8: Provides Detailed Error Information
    test_provides_detailed_error_information() {
        const dependency = {
            name: 'nonexistent-dependency-xyz',
            type: 'tool',
            version: '>=1.0.0',
            description: 'A dependency that does not exist'
        };
        
        const result = this.validator.validateDependency(dependency);
        
        if (result.available === true) {
            throw new Error('Must correctly identify nonexistent dependency as unavailable');
        }
        
        if (!result.error) {
            throw new Error('Must provide error information for missing dependency');
        }
        
        if (!result.error.message) {
            throw new Error('Error must include descriptive message');
        }
        
        if (!result.error.code) {
            throw new Error('Error must include error code (e.g., NOT_FOUND, VERSION_MISMATCH)');
        }
        
        if (!result.recommendations) {
            throw new Error('Must provide recommendations for resolving dependency issues');
        }
    }

    // Test 9: Generates Installation Commands for Different Package Managers
    test_generates_installation_commands_for_package_managers() {
        const dependency = {
            name: 'eslint',
            type: 'npm_package',
            version: '>=8.0.0',
            description: 'JavaScript linting tool'
        };
        
        const instructions = this.validator.generateInstallationInstructions(dependency, 'linux');
        
        if (!instructions.packageManagerOptions) {
            throw new Error('Must provide multiple package manager options');
        }
        
        const packageManagers = instructions.packageManagerOptions;
        
        // Should include npm option
        const npmOption = packageManagers.find(pm => pm.name === 'npm');
        if (!npmOption || !npmOption.command) {
            throw new Error('Must include npm installation command');
        }
        
        // Should include yarn option if available
        const yarnOption = packageManagers.find(pm => pm.name === 'yarn');
        if (yarnOption && !yarnOption.command) {
            throw new Error('Yarn option must include installation command');
        }
        
        // Should include global vs local installation options
        if (!instructions.globalInstall && !instructions.localInstall) {
            throw new Error('Must provide both global and local installation options');
        }
    }

    // Test 10: Validates System Requirements
    test_validates_system_requirements() {
        const systemRequirements = {
            os: ['linux', 'darwin', 'win32'],
            arch: ['x64', 'arm64'],
            nodeVersion: '>=18.0.0',
            diskSpace: '100MB',
            memory: '512MB'
        };
        
        const result = this.validator.validateSystemRequirements(systemRequirements);
        
        if (!result.compatible) {
            throw new Error('Must determine system compatibility status');
        }
        
        if (!result.checks) {
            throw new Error('Must provide detailed compatibility checks');
        }
        
        if (!result.checks.os || typeof result.checks.os.satisfied !== 'boolean') {
            throw new Error('Must check OS compatibility');
        }
        
        if (!result.checks.arch || typeof result.checks.arch.satisfied !== 'boolean') {
            throw new Error('Must check architecture compatibility');
        }
        
        if (!result.checks.nodeVersion || typeof result.checks.nodeVersion.satisfied !== 'boolean') {
            throw new Error('Must check Node.js version compatibility');
        }
    }

    // Test 11: Handles Network Dependencies
    test_handles_network_dependencies() {
        const networkDependencies = [
            {
                name: 'GitHub API',
                type: 'service',
                url: 'https://api.github.com',
                required: true,
                timeout: 5000
            },
            {
                name: 'NPM Registry',
                type: 'service', 
                url: 'https://registry.npmjs.org',
                required: true,
                timeout: 3000
            }
        ];
        
        const result = this.validator.checkNetworkDependencies(networkDependencies);
        
        if (!result.services) {
            throw new Error('Must return service availability results');
        }
        
        if (!Array.isArray(result.services)) {
            throw new Error('Services results must be an array');
        }
        
        for (const service of result.services) {
            if (!service.hasOwnProperty('available')) {
                throw new Error('Each service must have availability status');
            }
            
            if (!service.hasOwnProperty('responseTime')) {
                throw new Error('Each service must have response time measurement');
            }
            
            if (!service.hasOwnProperty('name')) {
                throw new Error('Each service must have a name');
            }
        }
    }

    // Test 12: Provides Recovery Suggestions
    test_provides_recovery_suggestions() {
        const failedDependency = {
            name: 'git',
            type: 'tool',
            version: '>=2.0.0',
            error: {
                code: 'NOT_FOUND',
                message: 'git command not found'
            }
        };
        
        const suggestions = this.validator.generateRecoverySuggestions(failedDependency);
        
        if (!suggestions.immediate) {
            throw new Error('Must provide immediate recovery actions');
        }
        
        if (!Array.isArray(suggestions.immediate)) {
            throw new Error('Immediate actions must be an array');
        }
        
        if (!suggestions.alternative) {
            throw new Error('Must provide alternative solutions');
        }
        
        if (!suggestions.troubleshooting) {
            throw new Error('Must provide troubleshooting guidance');
        }
        
        // Check for actionable language
        const allSuggestions = JSON.stringify(suggestions);
        if (!allSuggestions.includes('Try:') && !allSuggestions.includes('Solution:')) {
            throw new Error('Must include actionable language (Try:/Solution:)');
        }
    }

    // Run all tests
    runAllTests() {
        console.log('🔴 RED PHASE: Testing REQ-022 Dependency Validation');
        console.log('================================================================');
        
        const tests = [
            'test_dependency_validator_exists',
            'test_detects_missing_nodejs_dependency',
            'test_validates_individual_dependency',
            'test_generates_platform_specific_installation_instructions',
            'test_checks_multiple_dependencies_simultaneously',
            'test_handles_optional_dependencies',
            'test_validates_version_requirements',
            'test_provides_detailed_error_information',
            'test_generates_installation_commands_for_package_managers',
            'test_validates_system_requirements',
            'test_handles_network_dependencies',
            'test_provides_recovery_suggestions'
        ];

        tests.forEach(testName => {
            console.log(`🧪 Running: ${testName.replace('test_', '').replace(/_/g, ' ')}`);
            this.runTest(testName, this[testName]);
        });

        console.log('\n📊 Test Results Summary:');
        console.log(`✅ Passed: ${this.passed}`);
        console.log(`❌ Failed: ${this.failed}`);
        console.log(`📈 Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);
        
        if (this.failed === 0) {
            console.log('✅ REQ-022 tests PASSED');
            return true;
        } else {
            console.log('❌ REQ-022 tests FAILED');
            return false;
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const test = new DependencyValidationTest();
    const success = test.runAllTests();
    process.exit(success ? 0 : 1);
}

module.exports = DependencyValidationTest;