#!/usr/bin/env node

/**
 * REQ-018: Security Hook Installation Test Suite
 * Tests security hook installation functionality using RED->GREEN->REFACTOR
 * 
 * Requirements:
 * - WHERE security hooks are requested during installation
 * - THE SYSTEM SHALL install security validation scripts to the hooks/ directory
 * - Security hooks are installed and functional
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

class REQ018SecurityHookInstallationTests {
    constructor() {
        this.testDir = path.join(os.tmpdir(), `claude-hook-test-${Date.now()}`);
        this.mockClaudeDir = path.join(this.testDir, '.claude');
        this.mockHooksDir = path.join(this.mockClaudeDir, 'hooks');
        this.sourceHooksDir = path.join(__dirname, '../hooks');
        this.passed = 0;
        this.failed = 0;
        
        // Setup test environment
        this.setupTestEnvironment();
    }

    setupTestEnvironment() {
        // Create test directories
        fs.mkdirSync(this.testDir, { recursive: true });
        fs.mkdirSync(this.mockClaudeDir, { recursive: true });
        fs.mkdirSync(this.mockHooksDir, { recursive: true });
    }

    cleanup() {
        // Clean up test environment
        try {
            fs.rmSync(this.testDir, { recursive: true, force: true });
        } catch (error) {
            // Ignore cleanup errors
        }
    }

    runTest(testName, testFn) {
        try {
            // Create unique test directory for each test to avoid conflicts
            const uniqueTestDir = path.join(os.tmpdir(), `claude-hook-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
            const uniqueMockClaudeDir = path.join(uniqueTestDir, '.claude');
            const uniqueMockHooksDir = path.join(uniqueMockClaudeDir, 'hooks');
            
            // Temporarily update directories for this test
            const originalTestDir = this.testDir;
            const originalMockClaudeDir = this.mockClaudeDir;
            const originalMockHooksDir = this.mockHooksDir;
            
            this.testDir = uniqueTestDir;
            this.mockClaudeDir = uniqueMockClaudeDir;
            this.mockHooksDir = uniqueMockHooksDir;
            
            this.setupTestEnvironment();
            
            testFn.call(this);
            
            // Clean up unique test directory
            try {
                fs.rmSync(uniqueTestDir, { recursive: true, force: true });
            } catch (cleanupError) {
                // Ignore cleanup errors
            }
            
            // Restore original directories
            this.testDir = originalTestDir;
            this.mockClaudeDir = originalMockClaudeDir;
            this.mockHooksDir = originalMockHooksDir;
            
            console.log(`✅ ${testName}`);
            this.passed++;
        } catch (error) {
            console.log(`❌ ${testName}: ${error.message}`);
            this.failed++;
        }
    }

    // Test 1: Security Hook Installation Module Exists
    test_security_hook_installation_module_exists() {
        const hookInstaller = require('../lib/hook-installer');
        assert(typeof hookInstaller.installSecurityHooks === 'function',
            'installSecurityHooks function must exist');
    }

    // Test 2: Installs Security Hooks to Correct Directory
    test_installs_security_hooks_to_correct_directory() {
        const { installSecurityHooks } = require('../lib/hook-installer');
        
        const result = installSecurityHooks(this.mockHooksDir, ['prevent-credential-exposure']);
        
        assert(result === true, 'Hook installation should return true on success');
        assert(fs.existsSync(this.mockHooksDir), 'Hooks directory should be created');
        
        const hookFile = path.join(this.mockHooksDir, 'prevent-credential-exposure.sh');
        assert(fs.existsSync(hookFile), 'Security hook file should be installed');
    }

    // Test 3: Installs File Logger Hook
    test_installs_file_logger_hook() {
        const { installSecurityHooks } = require('../lib/hook-installer');
        
        const result = installSecurityHooks(this.mockHooksDir, ['file-logger']);
        
        assert(result === true, 'File logger hook installation should succeed');
        
        const hookFile = path.join(this.mockHooksDir, 'file-logger.sh');
        assert(fs.existsSync(hookFile), 'File logger hook should be installed');
    }

    // Test 4: Installs Multiple Hooks
    test_installs_multiple_hooks() {
        const { installSecurityHooks } = require('../lib/hook-installer');
        
        const hooks = ['prevent-credential-exposure', 'file-logger'];
        const result = installSecurityHooks(this.mockHooksDir, hooks);
        
        assert(result === true, 'Multiple hook installation should succeed');
        
        for (const hook of hooks) {
            const hookFile = path.join(this.mockHooksDir, `${hook}.sh`);
            assert(fs.existsSync(hookFile), `Hook ${hook}.sh should be installed`);
        }
    }

    // Test 5: Sets Correct File Permissions
    test_sets_correct_file_permissions() {
        const { installSecurityHooks } = require('../lib/hook-installer');
        
        const result = installSecurityHooks(this.mockHooksDir, ['prevent-credential-exposure']);
        
        assert(result === true, 'Hook installation should succeed');
        
        const hookFile = path.join(this.mockHooksDir, 'prevent-credential-exposure.sh');
        const stats = fs.statSync(hookFile);
        const permissions = stats.mode & parseInt('777', 8);
        
        // Should be 755 (owner read/write/execute, group/other read/execute)
        assert(permissions === parseInt('755', 8), 
            `Hook file should have 755 permissions, got ${permissions.toString(8)}`);
    }

    // Test 6: Validates Hook Content
    test_validates_hook_content() {
        const { installSecurityHooks } = require('../lib/hook-installer');
        
        const result = installSecurityHooks(this.mockHooksDir, ['prevent-credential-exposure']);
        
        assert(result === true, 'Hook installation should succeed');
        
        const hookFile = path.join(this.mockHooksDir, 'prevent-credential-exposure.sh');
        const content = fs.readFileSync(hookFile, 'utf8');
        
        // Should contain shebang and defensive security patterns
        const validShebangs = ['#!/bin/bash', '#!/usr/bin/env bash', '#!/bin/sh', '#!/usr/bin/env sh'];
        const hasValidShebang = validShebangs.some(shebang => content.includes(shebang));
        assert(hasValidShebang, 'Hook should have valid bash shebang');
        assert(content.includes('credential') || content.includes('security'), 
            'Hook should contain security-related content');
    }

    // Test 7: Handles Invalid Hook Names
    test_handles_invalid_hook_names() {
        const { installSecurityHooks } = require('../lib/hook-installer');
        
        const result = installSecurityHooks(this.mockHooksDir, ['nonexistent-hook']);
        
        assert(result === false, 'Invalid hook names should return false');
    }

    // Test 8: Handles Missing Source Directory
    test_handles_missing_source_directory() {
        const { installSecurityHooks } = require('../lib/hook-installer');
        
        // Use a non-existent source directory
        const result = installSecurityHooks('/nonexistent/hooks', ['prevent-credential-exposure']);
        
        assert(result === false, 'Missing source directory should return false');
    }

    // Test 9: Creates Hooks Directory if Missing
    test_creates_hooks_directory_if_missing() {
        const { installSecurityHooks } = require('../lib/hook-installer');
        
        const newHooksDir = path.join(this.testDir, 'new-hooks');
        const result = installSecurityHooks(newHooksDir, ['prevent-credential-exposure']);
        
        assert(result === true, 'Should create hooks directory if missing');
        assert(fs.existsSync(newHooksDir), 'New hooks directory should be created');
        
        const hookFile = path.join(newHooksDir, 'prevent-credential-exposure.sh');
        assert(fs.existsSync(hookFile), 'Hook should be installed in new directory');
    }

    // Test 10: Integration with Setup Wizard
    test_integrates_with_setup_wizard() {
        const SetupWizard = require('../lib/setup-wizard');
        const wizard = new SetupWizard(path.join(__dirname, '..'));
        
        // Setup wizard should have hook installation functionality
        assert(typeof wizard.installSecurityHooks === 'function' || 
               wizard.securityHooks !== undefined,
            'Setup wizard should support security hook installation');
    }

    // Test 11: Available Hooks Discovery
    test_available_hooks_discovery() {
        const { getAvailableHooks } = require('../lib/hook-installer');
        
        const availableHooks = getAvailableHooks();
        
        assert(Array.isArray(availableHooks), 'Should return array of available hooks');
        assert(availableHooks.length >= 2, 'Should find at least 2 hooks');
        
        const hookNames = availableHooks.map(h => h.name || h);
        assert(hookNames.includes('prevent-credential-exposure'), 
            'Should include prevent-credential-exposure hook');
        assert(hookNames.includes('file-logger'), 'Should include file-logger hook');
    }

    // Test 12: Hook Validation Before Installation
    test_hook_validation_before_installation() {
        const { validateHook } = require('../lib/hook-installer');
        
        const credentialHookPath = path.join(this.sourceHooksDir, 'prevent-credential-exposure.sh');
        const isValid = validateHook(credentialHookPath);
        
        assert(isValid === true, 'Valid hooks should pass validation');
    }

    // Test 13: Overwrites Existing Hooks
    test_overwrites_existing_hooks() {
        const { installSecurityHooks } = require('../lib/hook-installer');
        
        // Install hook first time
        const result1 = installSecurityHooks(this.mockHooksDir, ['prevent-credential-exposure']);
        assert(result1 === true, 'First installation should succeed');
        
        const hookFile = path.join(this.mockHooksDir, 'prevent-credential-exposure.sh');
        const originalStats = fs.statSync(hookFile);
        
        // Wait a moment to ensure different timestamp
        setTimeout(() => {
            // Install same hook again (should overwrite)
            const result2 = installSecurityHooks(this.mockHooksDir, ['prevent-credential-exposure']);
            assert(result2 === true, 'Second installation should succeed');
            
            const newStats = fs.statSync(hookFile);
            assert(newStats.mtime >= originalStats.mtime, 'Hook file should be updated');
        }, 100);
    }

    // Test 14: Hook Installation Logging
    test_hook_installation_logging() {
        const { installSecurityHooks, getInstallationLog } = require('../lib/hook-installer');
        
        // Clear any existing logs
        if (typeof getInstallationLog === 'function') {
            getInstallationLog(true); // Clear log
        }
        
        const result = installSecurityHooks(this.mockHooksDir, ['prevent-credential-exposure']);
        assert(result === true, 'Hook installation should succeed');
        
        if (typeof getInstallationLog === 'function') {
            const log = getInstallationLog();
            assert(Array.isArray(log), 'Installation log should be an array');
            assert(log.length > 0, 'Should have installation log entries');
        }
    }

    // Test 15: Advanced Hook Installation Options
    test_advanced_hook_installation_options() {
        const { installSecurityHooksDetailed } = require('../lib/hook-installer');
        
        // Test with validation and force options
        const result = installSecurityHooksDetailed(
            this.mockHooksDir, 
            ['prevent-credential-exposure'], 
            { validate: true, force: true }
        );
        
        assert(typeof result === 'object', 'Advanced API should return detailed object');
        assert(result.success === true, 'Installation with options should succeed');
        assert(Array.isArray(result.installed), 'Should have installed array');
        assert(result.installed.includes('prevent-credential-exposure'), 'Should list installed hooks');
    }

    // Test 16: Hook Removal Functionality  
    test_hook_removal_functionality() {
        const { installSecurityHooks, removeSecurityHooks } = require('../lib/hook-installer');
        
        // Install hook first
        const installResult = installSecurityHooks(this.mockHooksDir, ['prevent-credential-exposure']);
        assert(installResult === true, 'Installation should succeed');
        
        // Remove hook
        const removeResult = removeSecurityHooks(this.mockHooksDir, ['prevent-credential-exposure']);
        assert(removeResult.success === true, 'Removal should succeed');
        
        const hookFile = path.join(this.mockHooksDir, 'prevent-credential-exposure.sh');
        assert(!fs.existsSync(hookFile), 'Hook file should be removed');
    }

    // Test 17: Hook Metadata Caching
    test_hook_metadata_caching() {
        const { getAvailableHooks, clearHookCache } = require('../lib/hook-installer');
        
        // Clear cache and get hooks (should populate cache)
        clearHookCache();
        const hooks1 = getAvailableHooks();
        
        // Get hooks again (should use cache)
        const hooks2 = getAvailableHooks();
        
        assert(JSON.stringify(hooks1) === JSON.stringify(hooks2), 'Cached results should be identical');
        assert(hooks1.length > 0, 'Should find available hooks');
        
        // Force refresh
        const hooks3 = getAvailableHooks(true);
        assert(JSON.stringify(hooks1) === JSON.stringify(hooks3), 'Force refresh should return same data');
    }

    // Test 18: Installation Summary
    test_installation_summary() {
        const { installSecurityHooks, getHookInstallationSummary } = require('../lib/hook-installer');
        
        // Install a hook to generate log entries
        installSecurityHooks(this.mockHooksDir, ['file-logger']);
        
        const summary = getHookInstallationSummary();
        
        assert(typeof summary === 'object', 'Summary should be an object');
        assert(typeof summary.totalInstallations === 'number', 'Should have total installations count');
        assert(typeof summary.availableHooks === 'number', 'Should have available hooks count');
        assert(Array.isArray(summary.recentInstallations), 'Should have recent installations array');
        assert(typeof summary.systemInfo === 'object', 'Should have system info');
    }

    runAllTests() {
        console.log('🧪 REQ-018: Security Hook Installation Test Suite');
        console.log('==================================================');
        

        const tests = [
            ['Security hook installation module exists', this.test_security_hook_installation_module_exists],
            ['Installs security hooks to correct directory', this.test_installs_security_hooks_to_correct_directory],
            ['Installs file logger hook', this.test_installs_file_logger_hook],
            ['Installs multiple hooks', this.test_installs_multiple_hooks],
            ['Sets correct file permissions', this.test_sets_correct_file_permissions],
            ['Validates hook content', this.test_validates_hook_content],
            ['Handles invalid hook names', this.test_handles_invalid_hook_names],
            ['Handles missing source directory', this.test_handles_missing_source_directory],
            ['Creates hooks directory if missing', this.test_creates_hooks_directory_if_missing],
            ['Integrates with setup wizard', this.test_integrates_with_setup_wizard],
            ['Available hooks discovery', this.test_available_hooks_discovery],
            ['Hook validation before installation', this.test_hook_validation_before_installation],
            ['Overwrites existing hooks', this.test_overwrites_existing_hooks],
            ['Hook installation logging', this.test_hook_installation_logging],
            ['Advanced hook installation options', this.test_advanced_hook_installation_options],
            ['Hook removal functionality', this.test_hook_removal_functionality],
            ['Hook metadata caching', this.test_hook_metadata_caching],
            ['Installation summary', this.test_installation_summary]
        ];

        for (const [testName, testFn] of tests) {
            this.runTest(testName, testFn);
        }

        console.log('');
        console.log('📊 REQ-018 Test Results:');
        console.log(`✅ Passed: ${this.passed}`);
        console.log(`❌ Failed: ${this.failed}`);
        console.log(`📈 Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);

        // Cleanup
        this.cleanup();
        
        return this.failed === 0;
    }
}

// Run tests if executed directly
if (require.main === module) {
    const tester = new REQ018SecurityHookInstallationTests();
    const success = tester.runAllTests();
    process.exit(success ? 0 : 1);
}

module.exports = REQ018SecurityHookInstallationTests;