#!/usr/bin/env node

/**
 * Phase 1 Critical Commands Tests - TDD for setup and verify commands
 * Tests the missing commands needed to achieve 100% feature parity with repository scripts
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

class Phase1CriticalCommandsTests {
    constructor() {
        this.results = [];
        this.cliPath = path.join(__dirname, '..', 'bin', 'claude-commands');
        this.testHome = path.join(os.tmpdir(), 'claude-test-' + Date.now());
        this.originalHome = os.homedir();
    }

    /**
     * Setup test environment
     */
    setupTestEnvironment() {
        // Create temporary home directory for testing
        if (!fs.existsSync(this.testHome)) {
            fs.mkdirSync(this.testHome, { recursive: true });
        }
        
        // Mock HOME environment for tests
        process.env.TEST_HOME = this.testHome;
    }

    /**
     * Cleanup test environment  
     */
    cleanupTestEnvironment() {
        try {
            if (fs.existsSync(this.testHome)) {
                fs.rmSync(this.testHome, { recursive: true, force: true });
            }
        } catch (error) {
            console.warn(`Warning: Could not cleanup test environment: ${error.message}`);
        }
        delete process.env.TEST_HOME;
    }

    /**
     * Test claude-commands setup command
     */
    testSetupCommand() {
        console.log('🧪 Testing setup command...');
        
        const tests = [
            {
                name: 'setup command exists and responds to --help',
                test: () => {
                    try {
                        const output = execSync(`node "${this.cliPath}" setup --help`, { 
                            encoding: 'utf8',
                            timeout: 10000,
                            env: { ...process.env, HOME: this.testHome }
                        });
                        return { 
                            exists: true,
                            hasHelp: output.includes('Usage:') || output.includes('setup'),
                            hasOptions: output.includes('--type') || output.includes('options'),
                            output: output.substring(0, 300)
                        };
                    } catch (error) {
                        return { 
                            exists: false, 
                            error: error.message,
                            stderr: error.stderr?.toString() || ''
                        };
                    }
                },
                expected: (result) => result.exists && result.hasHelp
            },
            {
                name: 'setup command supports --type option',
                test: () => {
                    try {
                        const output = execSync(`node "${this.cliPath}" setup --help`, { 
                            encoding: 'utf8',
                            timeout: 10000,
                            env: { ...process.env, HOME: this.testHome }
                        });
                        const hasTypeOption = output.includes('--type') && 
                                             (output.includes('basic') || output.includes('comprehensive'));
                        return { hasTypeOption, output: output.substring(0, 300) };
                    } catch (error) {
                        return { hasTypeOption: false, error: error.message };
                    }
                },
                expected: (result) => result.hasTypeOption
            },
            {
                name: 'setup command supports --dry-run option',
                test: () => {
                    try {
                        const output = execSync(`node "${this.cliPath}" setup --help`, { 
                            encoding: 'utf8',
                            timeout: 10000,
                            env: { ...process.env, HOME: this.testHome }
                        });
                        return { 
                            hasDryRun: output.includes('--dry-run'),
                            output: output.substring(0, 300)
                        };
                    } catch (error) {
                        return { hasDryRun: false, error: error.message };
                    }
                },
                expected: (result) => result.hasDryRun
            },
            {
                name: 'setup --dry-run shows what would be done',
                test: () => {
                    try {
                        const output = execSync(`node "${this.cliPath}" setup --dry-run`, { 
                            encoding: 'utf8',
                            timeout: 10000,
                            env: { ...process.env, HOME: this.testHome }
                        });
                        const showsPreview = output.includes('would') || 
                                           output.includes('preview') ||
                                           output.includes('dry run');
                        return { showsPreview, output: output.substring(0, 300) };
                    } catch (error) {
                        return { showsPreview: false, error: error.message };
                    }
                },
                expected: (result) => result.showsPreview
            },
            {
                name: 'setup creates ~/.claude directory structure',
                test: () => {
                    try {
                        execSync(`node "${this.cliPath}" setup --type basic`, { 
                            encoding: 'utf8',
                            timeout: 30000,
                            env: { ...process.env, HOME: this.testHome }
                        });
                        
                        const claudeDir = path.join(this.testHome, '.claude');
                        const commandsDir = path.join(claudeDir, 'commands');
                        const configExists = fs.existsSync(path.join(claudeDir, 'settings.json')) ||
                                           fs.existsSync(claudeDir);
                        
                        return {
                            claudeDirExists: fs.existsSync(claudeDir),
                            commandsDirExists: fs.existsSync(commandsDir),
                            configExists,
                            testHome: this.testHome
                        };
                    } catch (error) {
                        return { 
                            claudeDirExists: false,
                            error: error.message,
                            stderr: error.stderr?.toString() || ''
                        };
                    }
                },
                expected: (result) => result.claudeDirExists
            }
        ];

        return this.runTests('setup Command', tests);
    }

    /**
     * Test claude-commands verify command
     */
    testVerifyCommand() {
        console.log('🧪 Testing verify command...');
        
        const tests = [
            {
                name: 'verify command exists and responds to --help',
                test: () => {
                    try {
                        const output = execSync(`node "${this.cliPath}" verify --help`, { 
                            encoding: 'utf8',
                            timeout: 10000,
                            env: { ...process.env, HOME: this.testHome }
                        });
                        return { 
                            exists: true,
                            hasHelp: output.includes('Usage:') || output.includes('verify'),
                            hasOptions: output.includes('--verbose') || output.includes('--fix'),
                            output: output.substring(0, 300)
                        };
                    } catch (error) {
                        return { 
                            exists: false, 
                            error: error.message 
                        };
                    }
                },
                expected: (result) => result.exists && result.hasHelp
            },
            {
                name: 'verify command supports --verbose option',
                test: () => {
                    try {
                        const output = execSync(`node "${this.cliPath}" verify --help`, { 
                            encoding: 'utf8',
                            timeout: 10000,
                            env: { ...process.env, HOME: this.testHome }
                        });
                        return { 
                            hasVerbose: output.includes('--verbose'),
                            output: output.substring(0, 300)
                        };
                    } catch (error) {
                        return { hasVerbose: false, error: error.message };
                    }
                },
                expected: (result) => result.hasVerbose
            },
            {
                name: 'verify command checks installation status',
                test: () => {
                    try {
                        const output = execSync(`node "${this.cliPath}" verify`, { 
                            encoding: 'utf8',
                            timeout: 10000,
                            env: { ...process.env, HOME: this.testHome }
                        });
                        const checksInstallation = output.includes('Claude') || 
                                                  output.includes('commands') ||
                                                  output.includes('installation') ||
                                                  output.includes('status');
                        return { checksInstallation, output: output.substring(0, 300) };
                    } catch (error) {
                        return { checksInstallation: false, error: error.message };
                    }
                },
                expected: (result) => result.checksInstallation
            },
            {
                name: 'verify command provides health check report',
                test: () => {
                    try {
                        const output = execSync(`node "${this.cliPath}" verify --verbose`, { 
                            encoding: 'utf8',
                            timeout: 10000,
                            env: { ...process.env, HOME: this.testHome }
                        });
                        const hasHealthReport = output.includes('health') || 
                                              output.includes('status') ||
                                              output.includes('check');
                        return { hasHealthReport, output: output.substring(0, 400) };
                    } catch (error) {
                        return { hasHealthReport: false, error: error.message };
                    }
                },
                expected: (result) => result.hasHealthReport
            }
        ];

        return this.runTests('verify Command', tests);
    }

    /**
     * Test Enhanced Configure Command
     */
    testEnhancedConfigureCommand() {
        console.log('🧪 Testing enhanced configure command...');
        
        const tests = [
            {
                name: 'configure command supports template application',
                test: () => {
                    try {
                        const output = execSync(`node "${this.cliPath}" config --list`, { 
                            encoding: 'utf8',
                            timeout: 10000,
                            env: { ...process.env, HOME: this.testHome }
                        });
                        const showsTemplates = output.includes('basic') || 
                                              output.includes('comprehensive') ||
                                              output.includes('template');
                        return { showsTemplates, output: output.substring(0, 300) };
                    } catch (error) {
                        return { showsTemplates: false, error: error.message };
                    }
                },
                expected: (result) => result.showsTemplates
            },
            {
                name: 'configure command can apply templates',
                test: () => {
                    try {
                        // Try to apply a template
                        const output = execSync(`node "${this.cliPath}" config --template basic`, { 
                            encoding: 'utf8',
                            timeout: 10000,
                            env: { ...process.env, HOME: this.testHome }
                        });
                        const appliesTemplate = output.includes('applied') || 
                                              output.includes('configuration') ||
                                              output.includes('template') ||
                                              !output.includes('error');
                        return { appliesTemplate, output: output.substring(0, 300) };
                    } catch (error) {
                        return { 
                            appliesTemplate: false, 
                            error: error.message,
                            stderr: error.stderr?.toString() || ''
                        };
                    }
                },
                expected: (result) => result.appliesTemplate
            }
        ];

        return this.runTests('Enhanced Configure', tests);
    }

    /**
     * Test Feature Parity with Repository Scripts
     */
    testFeatureParity() {
        console.log('🧪 Testing feature parity with repository scripts...');
        
        const tests = [
            {
                name: 'setup replaces setup.sh functionality',
                test: () => {
                    // Check that setup command covers the key functionality of setup.sh
                    try {
                        const helpOutput = execSync(`node "${this.cliPath}" setup --help`, { 
                            encoding: 'utf8',
                            timeout: 10000,
                            env: { ...process.env, HOME: this.testHome }
                        });
                        
                        const hasKeyFeatures = helpOutput.includes('--type') && // Configuration templates
                                              (helpOutput.includes('--commands') || helpOutput.includes('install')); // Command installation
                        
                        return { hasKeyFeatures, helpOutput: helpOutput.substring(0, 300) };
                    } catch (error) {
                        return { hasKeyFeatures: false, error: error.message };
                    }
                },
                expected: (result) => result.hasKeyFeatures
            },
            {
                name: 'verify replaces verify-setup.sh functionality',
                test: () => {
                    try {
                        const helpOutput = execSync(`node "${this.cliPath}" verify --help`, { 
                            encoding: 'utf8',
                            timeout: 10000,
                            env: { ...process.env, HOME: this.testHome }
                        });
                        
                        const hasKeyFeatures = helpOutput.includes('--verbose') || // Detailed checking
                                              helpOutput.includes('installation'); // Installation verification
                        
                        return { hasKeyFeatures, helpOutput: helpOutput.substring(0, 300) };
                    } catch (error) {
                        return { hasKeyFeatures: false, error: error.message };
                    }
                },
                expected: (result) => result.hasKeyFeatures
            },
            {
                name: 'All repository script functionality covered',
                test: () => {
                    try {
                        const mainHelp = execSync(`node "${this.cliPath}" --help`, { 
                            encoding: 'utf8',
                            timeout: 10000
                        });
                        
                        const hasAllCommands = ['setup', 'install', 'config', 'verify', 'list'].every(cmd => 
                            mainHelp.includes(cmd)
                        );
                        
                        return { hasAllCommands, mainHelp: mainHelp.substring(0, 400) };
                    } catch (error) {
                        return { hasAllCommands: false, error: error.message };
                    }
                },
                expected: (result) => result.hasAllCommands
            }
        ];

        return this.runTests('Feature Parity', tests);
    }

    /**
     * Run a set of tests
     */
    runTests(suiteName, tests) {
        const results = {
            suiteName,
            passed: 0,
            failed: 0,
            total: tests.length,
            details: []
        };

        tests.forEach(test => {
            try {
                const result = test.test();
                const passed = typeof test.expected === 'function' 
                    ? test.expected(result)
                    : JSON.stringify(result) === JSON.stringify(test.expected);

                if (passed) {
                    results.passed++;
                    results.details.push({
                        name: test.name,
                        status: 'PASS',
                        result
                    });
                } else {
                    results.failed++;
                    results.details.push({
                        name: test.name,
                        status: 'FAIL',
                        result,
                        expected: test.expected
                    });
                }
            } catch (error) {
                results.failed++;
                results.details.push({
                    name: test.name,
                    status: 'ERROR',
                    error: error.message
                });
            }
        });

        this.results.push(results);
        return results;
    }

    /**
     * Run all critical command tests
     */
    runAllTests() {
        console.log('🚀 Running Phase 1 Critical Commands Tests...\n');
        
        this.setupTestEnvironment();
        
        try {
            this.testSetupCommand();
            this.testVerifyCommand();
            this.testEnhancedConfigureCommand();
            this.testFeatureParity();
            
            this.generateReport();
        } finally {
            this.cleanupTestEnvironment();
        }
    }

    /**
     * Generate comprehensive test report
     */
    generateReport() {
        console.log('\n📊 Phase 1 Critical Commands Test Results');
        console.log('=' .repeat(55));
        
        let totalPassed = 0;
        let totalFailed = 0;
        let totalTests = 0;
        
        this.results.forEach(suite => {
            totalPassed += suite.passed;
            totalFailed += suite.failed;
            totalTests += suite.total;
            
            const status = suite.failed === 0 ? '✅' : '❌';
            console.log(`${status} ${suite.suiteName}: ${suite.passed}/${suite.total} passed`);
            
            // Show failures
            suite.details.forEach(detail => {
                if (detail.status === 'FAIL') {
                    console.log(`   ❌ ${detail.name}`);
                    if (detail.result && detail.result.error) {
                        console.log(`      Error: ${detail.result.error}`);
                    }
                } else if (detail.status === 'ERROR') {
                    console.log(`   💥 ${detail.name}: ${detail.error}`);
                }
            });
        });
        
        console.log('\n📈 Overall Results:');
        console.log(`   Total Tests: ${totalTests}`);
        console.log(`   Passed: ${totalPassed}`);
        console.log(`   Failed: ${totalFailed}`);
        console.log(`   Success Rate: ${Math.round((totalPassed / totalTests) * 100)}%`);
        
        if (totalFailed > 0) {
            console.log('\n❌ IMPLEMENTATION REQUIRED:');
            console.log('   Missing commands need to be implemented to achieve Phase 1 goals');
            console.log('   This is expected - tests are designed to fail until implementation is complete');
        } else {
            console.log('\n✅ PHASE 1 COMPLETE:');
            console.log('   All critical commands implemented with required functionality');
            console.log('   Ready to proceed to Phase 2 or begin repository script removal');
        }
        
        return totalFailed === 0;
    }
}

// Run tests if called directly
if (require.main === module) {
    const tests = new Phase1CriticalCommandsTests();
    tests.runAllTests();
}

module.exports = { Phase1CriticalCommandsTests };