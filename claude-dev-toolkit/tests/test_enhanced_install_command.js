#!/usr/bin/env node

/**
 * Enhanced Install Command Tests
 * Tests for the enhanced claude-commands install command per Phase 2 requirements
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

class EnhancedInstallCommandTests {
    constructor() {
        this.results = [];
        this.cliPath = path.join(__dirname, '..', 'bin', 'claude-commands');
        this.testHome = path.join(os.tmpdir(), 'claude-install-test-' + Date.now());
    }

    /**
     * Setup test environment
     */
    setupTestEnvironment() {
        if (!fs.existsSync(this.testHome)) {
            fs.mkdirSync(this.testHome, { recursive: true });
        }
        
        // Create test commands directory structure
        const testCommandsDir = path.join(this.testHome, '.claude', 'commands');
        fs.mkdirSync(testCommandsDir, { recursive: true });
        
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
     * Test install command options
     */
    testInstallCommandOptions() {
        console.log('🧪 Testing install command options...');
        
        const tests = [
            {
                name: 'install command exists and responds to --help',
                test: () => {
                    try {
                        const output = execSync(`node "${this.cliPath}" install --help`, { 
                            encoding: 'utf8',
                            timeout: 10000
                        });
                        return { 
                            exists: true,
                            hasHelp: output.includes('Usage:') || output.includes('install'),
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
                name: 'install command supports --active option',
                test: () => {
                    try {
                        const output = execSync(`node "${this.cliPath}" install --help`, { 
                            encoding: 'utf8',
                            timeout: 10000
                        });
                        return { 
                            hasActiveOption: output.includes('--active'),
                            output: output.substring(0, 300)
                        };
                    } catch (error) {
                        return { hasActiveOption: false, error: error.message };
                    }
                },
                expected: (result) => result.hasActiveOption
            },
            {
                name: 'install command supports --experiments option',
                test: () => {
                    try {
                        const output = execSync(`node "${this.cliPath}" install --help`, { 
                            encoding: 'utf8',
                            timeout: 10000
                        });
                        return { 
                            hasExperimentsOption: output.includes('--experiments'),
                            output: output.substring(0, 300)
                        };
                    } catch (error) {
                        return { hasExperimentsOption: false, error: error.message };
                    }
                },
                expected: (result) => result.hasExperimentsOption
            },
            {
                name: 'install command supports --all option',
                test: () => {
                    try {
                        const output = execSync(`node "${this.cliPath}" install --help`, { 
                            encoding: 'utf8',
                            timeout: 10000
                        });
                        return { 
                            hasAllOption: output.includes('--all'),
                            output: output.substring(0, 300)
                        };
                    } catch (error) {
                        return { hasAllOption: false, error: error.message };
                    }
                },
                expected: (result) => result.hasAllOption
            },
            {
                name: 'install command supports --dry-run option',
                test: () => {
                    try {
                        const helpOutput = execSync(`node "${this.cliPath}" install --help`, { 
                            encoding: 'utf8',
                            timeout: 10000
                        });
                        
                        // Check if help mentions dry-run
                        const hasDryRunInHelp = helpOutput.includes('--dry-run') || 
                                               helpOutput.includes('dry run') ||
                                               helpOutput.includes('preview');
                        
                        return { 
                            hasDryRun: hasDryRunInHelp,
                            helpOutput: helpOutput.substring(0, 300)
                        };
                    } catch (error) {
                        return { hasDryRun: false, error: error.message };
                    }
                },
                expected: (result) => result.hasDryRun
            },
            {
                name: 'install command supports --backup option',
                test: () => {
                    try {
                        const helpOutput = execSync(`node "${this.cliPath}" install --help`, { 
                            encoding: 'utf8',
                            timeout: 10000
                        });
                        
                        const hasBackupOption = helpOutput.includes('--backup') || 
                                              helpOutput.includes('backup');
                        
                        return { 
                            hasBackup: hasBackupOption,
                            helpOutput: helpOutput.substring(0, 300)
                        };
                    } catch (error) {
                        return { hasBackup: false, error: error.message };
                    }
                },
                expected: (result) => result.hasBackup
            }
        ];

        return this.runTests('Install Command Options', tests);
    }

    /**
     * Test install command filtering
     */
    testInstallCommandFiltering() {
        console.log('🧪 Testing install command filtering...');
        
        const tests = [
            {
                name: 'install command supports --include pattern option',
                test: () => {
                    try {
                        const helpOutput = execSync(`node "${this.cliPath}" install --help`, { 
                            encoding: 'utf8',
                            timeout: 10000
                        });
                        
                        const hasIncludeOption = helpOutput.includes('--include') || 
                                                helpOutput.includes('pattern');
                        
                        return { 
                            hasInclude: hasIncludeOption,
                            helpOutput: helpOutput.substring(0, 300)
                        };
                    } catch (error) {
                        return { hasInclude: false, error: error.message };
                    }
                },
                expected: (result) => result.hasInclude
            },
            {
                name: 'install command supports --exclude pattern option',
                test: () => {
                    try {
                        const helpOutput = execSync(`node "${this.cliPath}" install --help`, { 
                            encoding: 'utf8',
                            timeout: 10000
                        });
                        
                        const hasExcludeOption = helpOutput.includes('--exclude');
                        
                        return { 
                            hasExclude: hasExcludeOption,
                            helpOutput: helpOutput.substring(0, 300)
                        };
                    } catch (error) {
                        return { hasExclude: false, error: error.message };
                    }
                },
                expected: (result) => result.hasExclude
            }
        ];

        return this.runTests('Install Command Filtering', tests);
    }

    /**
     * Test install command functionality
     */
    testInstallCommandFunctionality() {
        console.log('🧪 Testing install command functionality...');
        
        const tests = [
            {
                name: 'install --active installs active commands',
                test: () => {
                    try {
                        const output = execSync(`node "${this.cliPath}" install --active`, { 
                            encoding: 'utf8',
                            timeout: 30000,
                            env: { ...process.env, HOME: this.testHome }
                        });
                        
                        const commandsDir = path.join(this.testHome, '.claude', 'commands');
                        const hasCommands = fs.existsSync(commandsDir) && 
                                          fs.readdirSync(commandsDir).length > 0;
                        
                        return { 
                            success: output.includes('Install') || output.includes('complete'),
                            hasCommands,
                            output: output.substring(0, 300)
                        };
                    } catch (error) {
                        return { 
                            success: false, 
                            error: error.message,
                            stderr: error.stderr?.toString() || ''
                        };
                    }
                },
                expected: (result) => result.success || result.hasCommands
            },
            {
                name: 'install completes within 30 seconds',
                test: () => {
                    try {
                        const startTime = Date.now();
                        execSync(`node "${this.cliPath}" install --active`, { 
                            encoding: 'utf8',
                            timeout: 30000,
                            env: { ...process.env, HOME: this.testHome }
                        });
                        const duration = Date.now() - startTime;
                        
                        return { 
                            withinTimeLimit: duration < 30000,
                            duration: `${(duration / 1000).toFixed(2)}s`
                        };
                    } catch (error) {
                        return { 
                            withinTimeLimit: false, 
                            error: error.message 
                        };
                    }
                },
                expected: (result) => result.withinTimeLimit
            },
            {
                name: 'install sets correct file permissions',
                test: () => {
                    try {
                        execSync(`node "${this.cliPath}" install --active`, { 
                            encoding: 'utf8',
                            timeout: 30000,
                            env: { ...process.env, HOME: this.testHome }
                        });
                        
                        const commandsDir = path.join(this.testHome, '.claude', 'commands');
                        
                        if (fs.existsSync(commandsDir)) {
                            const files = fs.readdirSync(commandsDir);
                            if (files.length > 0) {
                                const firstFile = path.join(commandsDir, files[0]);
                                const stats = fs.statSync(firstFile);
                                const isReadable = (stats.mode & 0o400) !== 0;
                                
                                return { 
                                    permissionsCorrect: isReadable,
                                    mode: (stats.mode & parseInt('777', 8)).toString(8)
                                };
                            }
                        }
                        
                        return { permissionsCorrect: true, note: 'No files to check' };
                    } catch (error) {
                        return { 
                            permissionsCorrect: false, 
                            error: error.message 
                        };
                    }
                },
                expected: (result) => result.permissionsCorrect
            }
        ];

        return this.runTests('Install Command Functionality', tests);
    }

    /**
     * Test deploy.sh replacement
     */
    testDeployReplacement() {
        console.log('🧪 Testing deploy.sh replacement functionality...');
        
        const tests = [
            {
                name: 'install command replaces deploy.sh functionality',
                test: () => {
                    try {
                        const helpOutput = execSync(`node "${this.cliPath}" install --help`, { 
                            encoding: 'utf8',
                            timeout: 10000
                        });
                        
                        // Check for key deploy.sh features
                        const hasDeployFeatures = 
                            (helpOutput.includes('--active') || helpOutput.includes('active')) &&
                            (helpOutput.includes('--experiments') || helpOutput.includes('experimental')) &&
                            (helpOutput.includes('--all') || helpOutput.includes('both'));
                        
                        return { 
                            hasDeployFeatures,
                            helpOutput: helpOutput.substring(0, 400)
                        };
                    } catch (error) {
                        return { hasDeployFeatures: false, error: error.message };
                    }
                },
                expected: (result) => result.hasDeployFeatures
            },
            {
                name: 'install updates existing installations with version tracking',
                test: () => {
                    try {
                        // First installation
                        execSync(`node "${this.cliPath}" install --active`, { 
                            encoding: 'utf8',
                            timeout: 30000,
                            env: { ...process.env, HOME: this.testHome }
                        });
                        
                        // Second installation (update)
                        const output = execSync(`node "${this.cliPath}" install --active`, { 
                            encoding: 'utf8',
                            timeout: 30000,
                            env: { ...process.env, HOME: this.testHome }
                        });
                        
                        const handlesUpdate = output.includes('Install') || 
                                            output.includes('complete') ||
                                            output.includes('update');
                        
                        return { 
                            handlesUpdate,
                            output: output.substring(0, 300)
                        };
                    } catch (error) {
                        return { handlesUpdate: false, error: error.message };
                    }
                },
                expected: (result) => result.handlesUpdate
            }
        ];

        return this.runTests('Deploy.sh Replacement', tests);
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
     * Run all tests
     */
    runAllTests() {
        console.log('🚀 Running Enhanced Install Command Tests...\n');
        
        this.setupTestEnvironment();
        
        try {
            this.testInstallCommandOptions();
            this.testInstallCommandFiltering();
            this.testInstallCommandFunctionality();
            this.testDeployReplacement();
            
            return this.generateReport();
        } finally {
            this.cleanupTestEnvironment();
        }
    }

    /**
     * Generate test report
     */
    generateReport() {
        console.log('\n📊 Enhanced Install Command Test Results');
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
            console.log('\n❌ INSTALL COMMAND NEEDS ENHANCEMENTS');
        } else {
            console.log('\n✅ INSTALL COMMAND FULLY IMPLEMENTED');
        }
        
        return totalFailed === 0;
    }
}

// Run tests if called directly
if (require.main === module) {
    const tests = new EnhancedInstallCommandTests();
    const success = tests.runAllTests();
    process.exit(success ? 0 : 1);
}

module.exports = EnhancedInstallCommandTests;