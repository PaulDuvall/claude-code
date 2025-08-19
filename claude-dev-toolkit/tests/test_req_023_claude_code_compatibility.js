#!/usr/bin/env node

/**
 * 🔴 RED PHASE: REQ-023 Claude Code Compatibility Tests
 * 
 * Test Suite for Claude Code Compatibility Detection and Resolution Guidance
 * Implements comprehensive testing for Claude Code installation detection and upgrade instructions
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Test class for REQ-023 Claude Code Compatibility
class ClaudeCodeCompatibilityTest {
    constructor() {
        this.testDir = path.join(os.tmpdir(), 'req023-test-' + Date.now());
        this.passed = 0;
        this.failed = 0;
        
        // Ensure we have a ClaudeCodeCompatibility class to test
        try {
            const ClaudeCodeCompatibility = require('../lib/claude-code-compatibility');
            this.compatibility = new ClaudeCodeCompatibility();
        } catch (error) {
            this.compatibility = null; // Expected to fail in RED phase
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

    // Test 1: Claude Code Compatibility Module Exists
    test_claude_code_compatibility_exists() {
        if (!this.compatibility) {
            throw new Error('ClaudeCodeCompatibility module must exist and be importable');
        }
        
        if (typeof this.compatibility.checkClaudeCodeInstallation !== 'function') {
            throw new Error('ClaudeCodeCompatibility must have checkClaudeCodeInstallation method');
        }
        
        if (typeof this.compatibility.validateClaudeCodeVersion !== 'function') {
            throw new Error('ClaudeCodeCompatibility must have validateClaudeCodeVersion method');
        }
        
        if (typeof this.compatibility.generateInstallationInstructions !== 'function') {
            throw new Error('ClaudeCodeCompatibility must have generateInstallationInstructions method');
        }
        
        if (typeof this.compatibility.generateUpgradeInstructions !== 'function') {
            throw new Error('ClaudeCodeCompatibility must have generateUpgradeInstructions method');
        }
    }

    // Test 2: Detects Claude Code Installation Status
    test_detects_claude_code_installation_status() {
        const installationResult = this.compatibility.checkClaudeCodeInstallation();
        
        if (!installationResult.hasOwnProperty('installed')) {
            throw new Error('Must return installation status');
        }
        
        if (!installationResult.hasOwnProperty('version')) {
            throw new Error('Must return version information');
        }
        
        if (!installationResult.hasOwnProperty('path')) {
            throw new Error('Must return installation path');
        }
        
        if (installationResult.installed && !installationResult.version) {
            throw new Error('If installed, must provide version');
        }
        
        if (installationResult.installed && !installationResult.path) {
            throw new Error('If installed, must provide installation path');
        }
    }

    // Test 3: Validates Claude Code Version Compatibility
    test_validates_claude_code_version_compatibility() {
        const testCases = [
            {
                currentVersion: '0.1.0',
                minimumRequired: '0.1.0',
                shouldBeCompatible: true
            },
            {
                currentVersion: '0.2.0',
                minimumRequired: '0.1.0',
                shouldBeCompatible: true
            },
            {
                currentVersion: '0.0.9',
                minimumRequired: '0.1.0',
                shouldBeCompatible: false
            },
            {
                currentVersion: '1.0.0',
                minimumRequired: '0.1.0',
                shouldBeCompatible: true
            }
        ];
        
        for (const testCase of testCases) {
            const result = this.compatibility.validateClaudeCodeVersion(
                testCase.currentVersion,
                testCase.minimumRequired
            );
            
            if (!result.hasOwnProperty('compatible')) {
                throw new Error('Must return compatibility status');
            }
            
            if (!result.hasOwnProperty('currentVersion')) {
                throw new Error('Must return current version');
            }
            
            if (!result.hasOwnProperty('minimumRequired')) {
                throw new Error('Must return minimum required version');
            }
            
            if (result.compatible !== testCase.shouldBeCompatible) {
                throw new Error(`Version compatibility check failed for ${testCase.currentVersion} vs ${testCase.minimumRequired}`);
            }
        }
    }

    // Test 4: Generates Installation Instructions for Missing Claude Code
    test_generates_installation_instructions_for_missing_claude_code() {
        const platformInstructions = {
            'win32': this.compatibility.generateInstallationInstructions('win32'),
            'darwin': this.compatibility.generateInstallationInstructions('darwin'),
            'linux': this.compatibility.generateInstallationInstructions('linux')
        };
        
        for (const [platform, instructions] of Object.entries(platformInstructions)) {
            if (!instructions.platform || instructions.platform !== platform) {
                throw new Error(`Must specify target platform for ${platform} instructions`);
            }
            
            if (!instructions.summary) {
                throw new Error(`Must provide installation summary for ${platform}`);
            }
            
            if (!instructions.steps || !Array.isArray(instructions.steps) || instructions.steps.length === 0) {
                throw new Error(`Must provide installation steps for ${platform}`);
            }
            
            if (!instructions.downloadUrl) {
                throw new Error(`Must provide download URL for ${platform}`);
            }
            
            if (!instructions.verificationSteps) {
                throw new Error(`Must provide verification steps for ${platform}`);
            }
            
            // Check for platform-specific content
            const instructionsText = JSON.stringify(instructions).toLowerCase();
            if (platform === 'win32' && !instructionsText.includes('windows')) {
                throw new Error('Windows instructions should include Windows-specific content');
            } else if (platform === 'darwin' && !instructionsText.includes('mac')) {
                throw new Error('macOS instructions should include Mac-specific content');
            } else if (platform === 'linux' && !instructionsText.includes('linux')) {
                throw new Error('Linux instructions should include Linux-specific content');
            }
        }
    }

    // Test 5: Generates Upgrade Instructions for Incompatible Versions
    test_generates_upgrade_instructions_for_incompatible_versions() {
        const upgradeScenarios = [
            {
                currentVersion: '0.0.5',
                minimumRequired: '0.1.0',
                platform: 'darwin'
            },
            {
                currentVersion: '0.1.0',
                minimumRequired: '0.2.0',
                platform: 'win32'
            },
            {
                currentVersion: '1.0.0',
                minimumRequired: '2.0.0',
                platform: 'linux'
            }
        ];
        
        for (const scenario of upgradeScenarios) {
            const instructions = this.compatibility.generateUpgradeInstructions(
                scenario.currentVersion,
                scenario.minimumRequired,
                scenario.platform
            );
            
            if (!instructions.summary) {
                throw new Error('Upgrade instructions must include summary');
            }
            
            if (!instructions.currentVersion || instructions.currentVersion !== scenario.currentVersion) {
                throw new Error('Must include current version in upgrade instructions');
            }
            
            if (!instructions.targetVersion || instructions.targetVersion !== scenario.minimumRequired) {
                throw new Error('Must include target version in upgrade instructions');
            }
            
            if (!instructions.upgradeSteps || instructions.upgradeSteps.length === 0) {
                throw new Error('Must provide upgrade steps');
            }
            
            if (!instructions.backupRecommendation) {
                throw new Error('Must recommend backing up existing installation');
            }
            
            if (!instructions.verificationSteps) {
                throw new Error('Must provide verification steps for upgrade');
            }
        }
    }

    // Test 6: Detects Claude Code Configuration Issues
    test_detects_claude_code_configuration_issues() {
        const configCheck = this.compatibility.checkClaudeCodeConfiguration();
        
        if (!configCheck.hasOwnProperty('valid')) {
            throw new Error('Must return configuration validity status');
        }
        
        if (!configCheck.hasOwnProperty('issues')) {
            throw new Error('Must return list of configuration issues');
        }
        
        if (!Array.isArray(configCheck.issues)) {
            throw new Error('Configuration issues must be an array');
        }
        
        if (!configCheck.hasOwnProperty('configPath')) {
            throw new Error('Must return configuration file path');
        }
        
        if (!configCheck.hasOwnProperty('recommendations')) {
            throw new Error('Must provide configuration recommendations');
        }
        
        // Test with mock invalid configuration
        const mockInvalidConfig = {
            configExists: false,
            configPath: null
        };
        
        const invalidConfigResult = this.compatibility.checkClaudeCodeConfiguration(mockInvalidConfig);
        
        if (invalidConfigResult.valid !== false) {
            throw new Error('Should detect invalid configuration');
        }
        
        if (invalidConfigResult.issues.length === 0) {
            throw new Error('Should identify configuration issues');
        }
    }

    // Test 7: Provides Resolution Guidance for Installation Issues
    test_provides_resolution_guidance_for_installation_issues() {
        const issueTypes = [
            'not_installed',
            'version_incompatible',
            'path_not_found',
            'permission_denied',
            'corrupted_installation'
        ];
        
        for (const issueType of issueTypes) {
            const guidance = this.compatibility.getResolutionGuidance(issueType);
            
            if (!guidance.issue || guidance.issue !== issueType) {
                throw new Error(`Must identify issue type: ${issueType}`);
            }
            
            if (!guidance.description) {
                throw new Error(`Must provide description for ${issueType}`);
            }
            
            if (!guidance.solutions || guidance.solutions.length === 0) {
                throw new Error(`Must provide solutions for ${issueType}`);
            }
            
            if (!guidance.priority) {
                throw new Error(`Must specify priority for ${issueType}`);
            }
            
            // Check for actionable language
            const solutionsText = JSON.stringify(guidance.solutions);
            if (!solutionsText.includes('Try:') && !solutionsText.includes('Solution:') && !solutionsText.includes('Step')) {
                throw new Error(`Solutions for ${issueType} must include actionable language`);
            }
        }
    }

    // Test 8: Handles Multiple Claude Code Installations
    test_handles_multiple_claude_code_installations() {
        const multiInstallCheck = this.compatibility.checkMultipleInstallations();
        
        if (!multiInstallCheck.hasOwnProperty('multipleFound')) {
            throw new Error('Must indicate if multiple installations found');
        }
        
        if (!multiInstallCheck.hasOwnProperty('installations')) {
            throw new Error('Must list all found installations');
        }
        
        if (!Array.isArray(multiInstallCheck.installations)) {
            throw new Error('Installations list must be an array');
        }
        
        if (!multiInstallCheck.hasOwnProperty('recommended')) {
            throw new Error('Must recommend which installation to use');
        }
        
        // Test with mock multiple installations
        const mockInstallations = [
            { path: '/usr/local/bin/claude', version: '0.1.0' },
            { path: '/opt/claude/bin/claude', version: '0.2.0' },
            { path: '~/.local/bin/claude', version: '0.1.5' }
        ];
        
        const result = this.compatibility.resolveMultipleInstallations(mockInstallations);
        
        if (!result.recommended) {
            throw new Error('Must recommend installation to use');
        }
        
        if (!result.reasoning) {
            throw new Error('Must provide reasoning for recommendation');
        }
        
        if (!result.cleanupSuggestions) {
            throw new Error('Must suggest cleanup for unused installations');
        }
    }

    // Test 9: Validates Claude Code CLI Access and Permissions
    test_validates_claude_code_cli_access_and_permissions() {
        const accessCheck = this.compatibility.validateClaudeCodeAccess();
        
        if (!accessCheck.hasOwnProperty('accessible')) {
            throw new Error('Must indicate if Claude Code CLI is accessible');
        }
        
        if (!accessCheck.hasOwnProperty('executable')) {
            throw new Error('Must indicate if Claude Code CLI is executable');
        }
        
        if (!accessCheck.hasOwnProperty('permissions')) {
            throw new Error('Must provide permission details');
        }
        
        if (!accessCheck.hasOwnProperty('pathIssues')) {
            throw new Error('Must check for PATH issues');
        }
        
        // Test permission resolution
        if (!accessCheck.accessible || !accessCheck.executable) {
            if (!accessCheck.resolutionSteps) {
                throw new Error('Must provide resolution steps for access issues');
            }
            
            if (!accessCheck.resolutionSteps.length) {
                throw new Error('Resolution steps must not be empty');
            }
        }
    }

    // Test 10: Integrates with Existing Error Handling System
    test_integrates_with_existing_error_handling_system() {
        // Test integration with PermissionErrorHandler
        const permissionError = new Error('EACCES: permission denied, access \'/usr/local/bin/claude\'');
        permissionError.code = 'EACCES';
        permissionError.path = '/usr/local/bin/claude';
        
        const integrationResult = this.compatibility.handleInstallationError(permissionError);
        
        if (!integrationResult.handled) {
            throw new Error('Must handle Claude Code installation errors');
        }
        
        if (!integrationResult.claudeCodeSpecific) {
            throw new Error('Must provide Claude Code specific error handling');
        }
        
        if (!integrationResult.guidance) {
            throw new Error('Must provide installation-specific guidance');
        }
        
        if (!integrationResult.nextSteps) {
            throw new Error('Must provide next steps for resolution');
        }
        
        // Check for Claude Code specific guidance
        const guidanceText = JSON.stringify(integrationResult.guidance);
        if (!guidanceText.includes('Claude Code') && !guidanceText.includes('claude')) {
            throw new Error('Guidance must be specific to Claude Code installation');
        }
    }

    // Test 11: Provides System Environment Compatibility Check
    test_provides_system_environment_compatibility_check() {
        const envCheck = this.compatibility.checkSystemEnvironment();
        
        if (!envCheck.hasOwnProperty('compatible')) {
            throw new Error('Must indicate system compatibility');
        }
        
        if (!envCheck.hasOwnProperty('requirements')) {
            throw new Error('Must list system requirements');
        }
        
        if (!envCheck.hasOwnProperty('issues')) {
            throw new Error('Must list environment issues');
        }
        
        if (!Array.isArray(envCheck.requirements)) {
            throw new Error('Requirements must be an array');
        }
        
        if (!Array.isArray(envCheck.issues)) {
            throw new Error('Issues must be an array');
        }
        
        // Check for specific environment requirements
        const requirementNames = envCheck.requirements.map(req => req.name);
        
        if (!requirementNames.includes('node')) {
            throw new Error('Must check Node.js requirement');
        }
        
        if (!requirementNames.includes('npm') && !requirementNames.includes('package_manager')) {
            throw new Error('Must check package manager requirement');
        }
        
        if (!envCheck.hasOwnProperty('recommendations')) {
            throw new Error('Must provide environment setup recommendations');
        }
    }

    // Test 12: Generates Comprehensive Compatibility Report
    test_generates_comprehensive_compatibility_report() {
        const report = this.compatibility.generateCompatibilityReport();
        
        if (!report.timestamp) {
            throw new Error('Report must include timestamp');
        }
        
        if (!report.installation) {
            throw new Error('Report must include installation status');
        }
        
        if (!report.version) {
            throw new Error('Report must include version information');
        }
        
        if (!report.configuration) {
            throw new Error('Report must include configuration status');
        }
        
        if (!report.environment) {
            throw new Error('Report must include environment check');
        }
        
        if (!report.summary) {
            throw new Error('Report must include summary');
        }
        
        if (!report.summary.hasOwnProperty('compatible')) {
            throw new Error('Summary must indicate overall compatibility');
        }
        
        if (!report.summary.issues || !Array.isArray(report.summary.issues)) {
            throw new Error('Summary must list all issues');
        }
        
        if (!report.summary.recommendations || !Array.isArray(report.summary.recommendations)) {
            throw new Error('Summary must provide recommendations');
        }
        
        if (!report.resolutionPlan) {
            throw new Error('Report must include resolution plan');
        }
        
        if (report.summary.issues.length > 0 && !report.resolutionPlan.steps) {
            throw new Error('Must provide resolution steps when issues are found');
        }
    }

    // Run all tests
    runAllTests() {
        console.log('🔴 RED PHASE: Testing REQ-023 Claude Code Compatibility');
        console.log('================================================================');
        
        const tests = [
            'test_claude_code_compatibility_exists',
            'test_detects_claude_code_installation_status',
            'test_validates_claude_code_version_compatibility',
            'test_generates_installation_instructions_for_missing_claude_code',
            'test_generates_upgrade_instructions_for_incompatible_versions',
            'test_detects_claude_code_configuration_issues',
            'test_provides_resolution_guidance_for_installation_issues',
            'test_handles_multiple_claude_code_installations',
            'test_validates_claude_code_cli_access_and_permissions',
            'test_integrates_with_existing_error_handling_system',
            'test_provides_system_environment_compatibility_check',
            'test_generates_comprehensive_compatibility_report'
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
            console.log('✅ REQ-023 tests PASSED');
            return true;
        } else {
            console.log('❌ REQ-023 tests FAILED');
            return false;
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const test = new ClaudeCodeCompatibilityTest();
    const success = test.runAllTests();
    process.exit(success ? 0 : 1);
}

module.exports = ClaudeCodeCompatibilityTest;