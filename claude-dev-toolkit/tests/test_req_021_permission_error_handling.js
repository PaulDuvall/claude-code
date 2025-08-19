#!/usr/bin/env node

/**
 * 🔴 RED PHASE: REQ-021 Permission Error Handling Tests
 * 
 * Test Suite for Permission Error Detection and Resolution Guidance
 * Implements comprehensive testing for file permission errors during installation
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Test class for REQ-021 Permission Error Handling
class PermissionErrorHandlingTest {
    constructor() {
        this.testDir = path.join(os.tmpdir(), 'req021-test-' + Date.now());
        this.restrictedDir = path.join(this.testDir, 'restricted');
        this.readOnlyFile = path.join(this.testDir, 'readonly.txt');
        this.passed = 0;
        this.failed = 0;
        
        // Ensure we have a PermissionErrorHandler class to test
        try {
            const PermissionErrorHandler = require('../lib/permission-error-handler');
            this.handler = new PermissionErrorHandler();
        } catch (error) {
            this.handler = null; // Expected to fail in RED phase
        }
    }

    setUp() {
        // Create test directory structure
        fs.mkdirSync(this.testDir, { recursive: true });
        fs.mkdirSync(this.restrictedDir, { recursive: true });
        
        // Create a read-only file
        fs.writeFileSync(this.readOnlyFile, 'test content');
        
        // Make directory and file read-only (simulate permission errors)
        if (process.platform !== 'win32') {
            fs.chmodSync(this.restrictedDir, 0o444); // read-only
            fs.chmodSync(this.readOnlyFile, 0o444); // read-only
        }
    }

    tearDown() {
        try {
            // Restore permissions for cleanup
            if (process.platform !== 'win32') {
                if (fs.existsSync(this.restrictedDir)) {
                    fs.chmodSync(this.restrictedDir, 0o755);
                }
                if (fs.existsSync(this.readOnlyFile)) {
                    fs.chmodSync(this.readOnlyFile, 0o644);
                }
            }
            
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

    // Test 1: Permission Error Handler Module Exists
    test_permission_error_handler_exists() {
        if (!this.handler) {
            throw new Error('PermissionErrorHandler module must exist and be importable');
        }
        
        if (typeof this.handler.detectPermissionError !== 'function') {
            throw new Error('PermissionErrorHandler must have detectPermissionError method');
        }
        
        if (typeof this.handler.generateResolutionGuidance !== 'function') {
            throw new Error('PermissionErrorHandler must have generateResolutionGuidance method');
        }
        
        if (typeof this.handler.handlePermissionError !== 'function') {
            throw new Error('PermissionErrorHandler must have handlePermissionError method');
        }
    }

    // Test 2: Detects File Permission Errors
    test_detects_file_permission_errors() {
        // Simulate EACCES error
        const eaccesError = new Error('permission denied, open \'/restricted/file.txt\'');
        eaccesError.code = 'EACCES';
        eaccesError.errno = -13;
        eaccesError.path = '/restricted/file.txt';
        
        const result = this.handler.detectPermissionError(eaccesError);
        
        if (!result.isPermissionError) {
            throw new Error('Must detect EACCES error as permission error');
        }
        
        if (result.errorType !== 'file_access') {
            throw new Error('Must identify error type as file_access');
        }
        
        if (!result.affectedPath) {
            throw new Error('Must extract affected file path');
        }
    }

    // Test 3: Detects Directory Permission Errors
    test_detects_directory_permission_errors() {
        // Simulate EPERM error for directory
        const epermError = new Error('operation not permitted, mkdir \'/usr/local/restricted\'');
        epermError.code = 'EPERM';
        epermError.errno = -1;
        epermError.path = '/usr/local/restricted';
        
        const result = this.handler.detectPermissionError(epermError);
        
        if (!result.isPermissionError) {
            throw new Error('Must detect EPERM error as permission error');
        }
        
        if (result.errorType !== 'directory_access') {
            throw new Error('Must identify error type as directory_access');
        }
        
        if (!result.affectedPath.includes('/usr/local/restricted')) {
            throw new Error('Must extract affected directory path');
        }
    }

    // Test 4: Generates Resolution Guidance for File Errors
    test_generates_file_resolution_guidance() {
        const errorInfo = {
            isPermissionError: true,
            errorType: 'file_access',
            errorCode: 'EACCES',
            affectedPath: '/home/user/.claude/settings.json',
            operation: 'write'
        };
        
        const guidance = this.handler.generateResolutionGuidance(errorInfo);
        
        if (!guidance.summary) {
            throw new Error('Must provide resolution summary');
        }
        
        if (!Array.isArray(guidance.steps) || guidance.steps.length === 0) {
            throw new Error('Must provide step-by-step resolution instructions');
        }
        
        // Check for specific guidance elements
        const guidanceText = JSON.stringify(guidance).toLowerCase();
        if (!guidanceText.includes('chmod') && !guidanceText.includes('permission')) {
            throw new Error('Must include chmod or permission guidance');
        }
        
        if (!guidanceText.includes('sudo') && !guidanceText.includes('administrator')) {
            throw new Error('Must include escalation guidance (sudo/administrator)');
        }
    }

    // Test 5: Generates Resolution Guidance for Directory Errors
    test_generates_directory_resolution_guidance() {
        const errorInfo = {
            isPermissionError: true,
            errorType: 'directory_access',
            errorCode: 'EPERM',
            affectedPath: '/usr/local/lib/claude-commands',
            operation: 'create'
        };
        
        const guidance = this.handler.generateResolutionGuidance(errorInfo);
        
        if (!guidance.summary) {
            throw new Error('Must provide resolution summary for directory errors');
        }
        
        if (!guidance.commands || guidance.commands.length === 0) {
            throw new Error('Must provide specific commands to resolve directory permission issues');
        }
        
        // Check for directory-specific guidance
        const guidanceText = JSON.stringify(guidance).toLowerCase();
        if (!guidanceText.includes('mkdir') && !guidanceText.includes('directory')) {
            throw new Error('Must include directory creation guidance');
        }
    }

    // Test 6: Provides Platform-Specific Guidance
    test_provides_platform_specific_guidance() {
        const errorInfo = {
            isPermissionError: true,
            errorType: 'file_access',
            errorCode: 'EACCES',
            affectedPath: '/etc/claude/config',
            operation: 'write'
        };
        
        const unixGuidance = this.handler.generateResolutionGuidance(errorInfo, 'linux');
        const windowsGuidance = this.handler.generateResolutionGuidance(errorInfo, 'win32');
        
        // Unix/Linux guidance should include sudo
        const unixText = JSON.stringify(unixGuidance).toLowerCase();
        if (!unixText.includes('sudo') && !unixText.includes('chmod')) {
            throw new Error('Unix guidance must include sudo or chmod commands');
        }
        
        // Windows guidance should include different approach
        const windowsText = JSON.stringify(windowsGuidance).toLowerCase();
        if (!windowsText.includes('administrator') && !windowsText.includes('run as')) {
            throw new Error('Windows guidance must include administrator elevation instructions');
        }
    }

    // Test 7: Handles Permission Errors with Context
    test_handles_permission_errors_with_context() {
        const error = new Error('EACCES: permission denied, open \'/home/.claude/commands/xtest.md\'');
        error.code = 'EACCES';
        error.path = '/home/.claude/commands/xtest.md';
        
        const context = {
            operation: 'command_installation',
            targetDir: '/home/.claude/commands',
            commandName: 'xtest',
            userHome: '/home/user'
        };
        
        const result = this.handler.handlePermissionError(error, context);
        
        if (!result.handled) {
            throw new Error('Must indicate the error was handled');
        }
        
        if (!result.guidance) {
            throw new Error('Must provide guidance when handling permission errors');
        }
        
        if (!result.actionable) {
            throw new Error('Must provide actionable resolution steps');
        }
        
        if (!result.contextAware) {
            throw new Error('Must provide context-aware guidance based on operation type');
        }
    }

    // Test 8: Detects User vs System Permission Issues
    test_detects_user_vs_system_permission_issues() {
        // User directory permission issue
        const userError = new Error('EACCES: permission denied, mkdir \'/home/user/.claude\'');
        userError.code = 'EACCES';
        userError.path = '/home/user/.claude';
        
        const userResult = this.handler.detectPermissionError(userError);
        
        if (userResult.scope !== 'user') {
            throw new Error('Must identify user-level permission issues');
        }
        
        // System directory permission issue  
        const systemError = new Error('EPERM: operation not permitted, mkdir \'/usr/local/bin\'');
        systemError.code = 'EPERM';
        systemError.path = '/usr/local/bin';
        
        const systemResult = this.handler.detectPermissionError(systemError);
        
        if (systemResult.scope !== 'system') {
            throw new Error('Must identify system-level permission issues');
        }
    }

    // Test 9: Validates Error Message Quality
    test_validates_error_message_quality() {
        const errorInfo = {
            isPermissionError: true,
            errorType: 'file_access',
            errorCode: 'EACCES',
            affectedPath: '/restricted/settings.json',
            operation: 'write'
        };
        
        const guidance = this.handler.generateResolutionGuidance(errorInfo);
        
        // Check for actionable language
        const guidanceText = JSON.stringify(guidance);
        if (!guidanceText.includes('Try:') && !guidanceText.includes('Solution:')) {
            throw new Error('Must include actionable language (Try:/Solution:)');
        }
        
        // Check for troubleshooting keywords
        if (!guidanceText.includes('troubleshooting') && !guidanceText.includes('Next steps')) {
            throw new Error('Must include troubleshooting guidance');
        }
        
        // Check for sufficient detail (>100 characters)
        if (guidanceText.length < 100) {
            throw new Error('Must provide detailed guidance (>100 characters)');
        }
    }

    // Test 10: Handles Edge Cases
    test_handles_edge_cases() {
        // Test with null error
        try {
            const result = this.handler.detectPermissionError(null);
            if (result.isPermissionError) {
                throw new Error('Must handle null error gracefully');
            }
        } catch (error) {
            if (!error.message.includes('Invalid error')) {
                throw new Error('Must provide meaningful error for null input');
            }
        }
        
        // Test with non-permission error
        const networkError = new Error('ENOTFOUND: getaddrinfo ENOTFOUND example.com');
        networkError.code = 'ENOTFOUND';
        
        const networkResult = this.handler.detectPermissionError(networkError);
        if (networkResult.isPermissionError) {
            throw new Error('Must correctly identify non-permission errors');
        }
        
        // Test with malformed path
        const malformedError = new Error('EACCES: permission denied');
        malformedError.code = 'EACCES';
        // No path property
        
        const malformedResult = this.handler.detectPermissionError(malformedError);
        if (!malformedResult.isPermissionError) {
            throw new Error('Must handle errors without path information');
        }
    }

    // Run all tests
    runAllTests() {
        console.log('🔴 RED PHASE: Testing REQ-021 Permission Error Handling');
        console.log('================================================================');
        
        const tests = [
            'test_permission_error_handler_exists',
            'test_detects_file_permission_errors', 
            'test_detects_directory_permission_errors',
            'test_generates_file_resolution_guidance',
            'test_generates_directory_resolution_guidance', 
            'test_provides_platform_specific_guidance',
            'test_handles_permission_errors_with_context',
            'test_detects_user_vs_system_permission_issues',
            'test_validates_error_message_quality',
            'test_handles_edge_cases'
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
            console.log('✅ REQ-021 tests PASSED');
            return true;
        } else {
            console.log('❌ REQ-021 tests FAILED');
            return false;
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const test = new PermissionErrorHandlingTest();
    const success = test.runAllTests();
    process.exit(success ? 0 : 1);
}

module.exports = PermissionErrorHandlingTest;