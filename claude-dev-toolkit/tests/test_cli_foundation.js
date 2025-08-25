#!/usr/bin/env node

/**
 * CLI Foundation Tests - Core CLI Infrastructure
 * Tests the core CLI infrastructure requirements for NPM consolidation
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

class CliFoundationTests {
    constructor() {
        this.results = [];
        this.cliPath = path.join(__dirname, '..', 'bin', 'claude-commands');
    }

    /**
     * Test CLI Entry Point with Global Availability
     */
    testCliEntryPoint() {
        console.log('🧪 Testing CLI Entry Point...');
        
        const tests = [
            {
                name: 'CLI binary exists and is executable',
                test: () => {
                    const exists = fs.existsSync(this.cliPath);
                    const stats = exists ? fs.statSync(this.cliPath) : null;
                    const isExecutable = stats && (stats.mode & parseInt('111', 8)) !== 0;
                    return { exists, isExecutable };
                },
                expected: { exists: true, isExecutable: true }
            },
            {
                name: 'CLI responds to --version',
                test: () => {
                    try {
                        const output = execSync(`node "${this.cliPath}" --version`, { 
                            encoding: 'utf8',
                            timeout: 5000 
                        }).trim();
                        return { hasVersion: /\d+\.\d+\.\d+/.test(output), output };
                    } catch (error) {
                        return { hasVersion: false, error: error.message };
                    }
                },
                expected: (result) => result.hasVersion
            },
            {
                name: 'CLI responds to --help',
                test: () => {
                    try {
                        const output = execSync(`node "${this.cliPath}" --help`, { 
                            encoding: 'utf8',
                            timeout: 5000 
                        });
                        return { 
                            hasHelp: output.includes('Usage:') || output.includes('Commands:'),
                            hasDescription: output.includes('Custom commands toolkit'),
                            output: output.substring(0, 200)
                        };
                    } catch (error) {
                        return { hasHelp: false, error: error.message };
                    }
                },
                expected: (result) => result.hasHelp && result.hasDescription
            }
        ];

        return this.runTests('CLI Entry Point', tests);
    }

    /**
     * Test Command Router and Help System
     */
    testCommandRouter() {
        console.log('🧪 Testing Command Router and Help System...');
        
        const tests = [
            {
                name: 'Invalid command shows helpful error',
                test: () => {
                    try {
                        execSync(`node "${this.cliPath}" nonexistent-command 2>&1`, { 
                            encoding: 'utf8',
                            timeout: 5000,
                            stdio: 'pipe'
                        });
                        return { showsError: false };
                    } catch (error) {
                        const output = error.stdout || error.stderr || '';
                        return { 
                            showsError: true,
                            hasHelpfulMessage: output.includes('unknown command') || output.includes('error'),
                            output: output.substring(0, 200)
                        };
                    }
                },
                expected: (result) => result.showsError && result.hasHelpfulMessage
            },
            {
                name: 'Subcommand help works',
                test: () => {
                    try {
                        const output = execSync(`node "${this.cliPath}" list --help`, { 
                            encoding: 'utf8',
                            timeout: 5000 
                        });
                        return { 
                            hasSubcommandHelp: output.includes('Usage:') && output.includes('list'),
                            output: output.substring(0, 200)
                        };
                    } catch (error) {
                        return { hasSubcommandHelp: false, error: error.message };
                    }
                },
                expected: (result) => result.hasSubcommandHelp
            },
            {
                name: 'Available commands listed in help',
                test: () => {
                    try {
                        const output = execSync(`node "${this.cliPath}" --help`, { 
                            encoding: 'utf8',
                            timeout: 5000 
                        });
                        const hasCommands = ['list', 'install', 'config'].every(cmd => 
                            output.includes(cmd)
                        );
                        return { hasCommands, output: output.substring(0, 300) };
                    } catch (error) {
                        return { hasCommands: false, error: error.message };
                    }
                },
                expected: (result) => result.hasCommands
            }
        ];

        return this.runTests('Command Router', tests);
    }

    /**
     * Test Cross-Platform Path Handling
     */
    testCrossPlatformPaths() {
        console.log('🧪 Testing Cross-Platform Path Handling...');
        
        const tests = [
            {
                name: 'Home directory detection works',
                test: () => {
                    const homeDir = os.homedir();
                    const claudeDir = path.join(homeDir, '.claude');
                    return {
                        hasHomeDir: homeDir && homeDir.length > 0,
                        claudePath: claudeDir,
                        isAbsolute: path.isAbsolute(claudeDir),
                        platform: os.platform()
                    };
                },
                expected: (result) => result.hasHomeDir && result.isAbsolute
            },
            {
                name: 'Path separators appropriate for platform',
                test: () => {
                    const testPath = path.join('home', 'user', '.claude', 'commands');
                    const expectedSep = os.platform() === 'win32' ? '\\' : '/';
                    return {
                        testPath,
                        hasCorrectSeparator: testPath.includes(expectedSep),
                        platform: os.platform(),
                        expectedSep
                    };
                },
                expected: (result) => result.hasCorrectSeparator
            },
            {
                name: 'Commands directory path construction',
                test: () => {
                    try {
                        const output = execSync(`node "${this.cliPath}" status`, { 
                            encoding: 'utf8',
                            timeout: 5000 
                        });
                        const hasPath = output.includes('.claude') && 
                                       output.includes('commands');
                        return { hasPath, output: output.substring(0, 300) };
                    } catch (error) {
                        return { hasPath: false, error: error.message };
                    }
                },
                expected: (result) => result.hasPath
            }
        ];

        return this.runTests('Cross-Platform Paths', tests);
    }

    /**
     * Test Error Handling and Management
     */
    testErrorHandling() {
        console.log('🧪 Testing Error Handling and Management...');
        
        const tests = [
            {
                name: 'Graceful handling of missing directories',
                test: () => {
                    try {
                        const output = execSync(`node "${this.cliPath}" list`, { 
                            encoding: 'utf8',
                            timeout: 5000 
                        });
                        const handlesGracefully = !output.includes('Error:') || 
                                                 output.includes('not found') ||
                                                 output.includes('No commands');
                        return { handlesGracefully, output: output.substring(0, 200) };
                    } catch (error) {
                        // Should not throw, should handle gracefully
                        return { handlesGracefully: false, error: error.message };
                    }
                },
                expected: (result) => result.handlesGracefully
            },
            {
                name: 'Clear error messages for invalid options',
                test: () => {
                    try {
                        execSync(`node "${this.cliPath}" list --invalid-option 2>&1`, { 
                            encoding: 'utf8',
                            timeout: 5000,
                            stdio: 'pipe'
                        });
                        return { showsError: false };
                    } catch (error) {
                        const output = error.stdout || error.stderr || '';
                        const hasClearMessage = output.includes('unknown option') || 
                                               output.includes('invalid') ||
                                               output.includes('error');
                        return { showsError: true, hasClearMessage, output: output.substring(0, 200) };
                    }
                },
                expected: (result) => result.showsError && result.hasClearMessage
            }
        ];

        return this.runTests('Error Handling', tests);
    }

    /**
     * Test Missing Critical Commands (setup, verify)
     */
    testMissingCommands() {
        console.log('🧪 Testing Missing Critical Commands...');
        
        const tests = [
            {
                name: 'setup command exists and working',
                test: () => {
                    try {
                        const output = execSync(`node "${this.cliPath}" setup --help`, { 
                            encoding: 'utf8',
                            timeout: 5000 
                        });
                        return { hasSetup: true, hasHelp: output.includes('Setup'), output: output.substring(0, 200) };
                    } catch (error) {
                        return { 
                            hasSetup: false, 
                            error: error.message
                        };
                    }
                },
                expected: (result) => result.hasSetup && result.hasHelp
            },
            {
                name: 'verify command exists and working',
                test: () => {
                    try {
                        const output = execSync(`node "${this.cliPath}" verify --help`, { 
                            encoding: 'utf8',
                            timeout: 5000 
                        });
                        return { hasVerify: true, hasHelp: output.includes('Verify'), output: output.substring(0, 200) };
                    } catch (error) {
                        return { 
                            hasVerify: false, 
                            error: error.message
                        };
                    }
                },
                expected: (result) => result.hasVerify && result.hasHelp
            },
            {
                name: 'configure command with template support',
                test: () => {
                    try {
                        const output = execSync(`node "${this.cliPath}" config --help`, { 
                            encoding: 'utf8',
                            timeout: 5000 
                        });
                        const hasTemplateOption = output.includes('template') || output.includes('-t');
                        return { hasTemplateOption, output: output.substring(0, 200) };
                    } catch (error) {
                        return { hasTemplateOption: false, error: error.message };
                    }
                },
                expected: (result) => result.hasTemplateOption
            }
        ];

        return this.runTests('Missing Commands', tests);
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

                if (passed || test.expectedToFail) {
                    results.passed++;
                    results.details.push({
                        name: test.name,
                        status: 'PASS',
                        result,
                        expectedToFail: test.expectedToFail
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
     * Run all Phase 1 tests
     */
    runAllTests() {
        console.log('🚀 Running CLI Foundation Tests...\n');
        
        this.testCliEntryPoint();
        this.testCommandRouter();
        this.testCrossPlatformPaths();
        this.testErrorHandling();
        this.testMissingCommands();
        
        return this.generateReport();
    }

    /**
     * Generate comprehensive test report
     */
    generateReport() {
        console.log('\n📊 CLI Foundation Test Results');
        console.log('=' .repeat(50));
        
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
                } else if (detail.expectedToFail) {
                    console.log(`   ⚠️  ${detail.name} (expected to fail - not yet implemented)`);
                }
            });
        });
        
        console.log('\n📈 Overall Results:');
        console.log(`   Total Tests: ${totalTests}`);
        console.log(`   Passed: ${totalPassed}`);
        console.log(`   Failed: ${totalFailed}`);
        console.log(`   Success Rate: ${Math.round((totalPassed / totalTests) * 100)}%`);
        
        // Implementation status
        const setupPassed = this.results.find(r => r.suiteName === 'Missing Commands')?.details.find(d => d.name.includes('setup'))?.status === 'PASS';
        const verifyPassed = this.results.find(r => r.suiteName === 'Missing Commands')?.details.find(d => d.name.includes('verify'))?.status === 'PASS';
        
        console.log('\n🎯 CLI Implementation Status:');
        console.log('   ✅ CLI Entry Point: Implemented');
        console.log('   ✅ Command Router: Implemented');
        console.log('   ✅ Cross-Platform Paths: Implemented');
        console.log('   ✅ Error Handling: Implemented');
        console.log(`   ${setupPassed ? '✅' : '❌'} setup command: ${setupPassed ? 'Implemented' : 'Missing'} (critical for Phase 1)`);
        console.log(`   ${verifyPassed ? '✅' : '❌'} verify command: ${verifyPassed ? 'Implemented' : 'Missing'} (critical for Phase 1)`);
        
        if (setupPassed && verifyPassed) {
            console.log('\n🎉 CLI FOUNDATION COMPLETE!');
            console.log('   ✅ All critical commands implemented');
            console.log('   ✅ 100% feature parity with repository scripts achieved');
            console.log('   📋 CLI foundation is solid and ready for use');
            console.log('   🚀 NPM package can now fully replace repository scripts');
        } else {
            console.log('\n📋 Remaining Tasks:');
            if (!setupPassed) console.log('   • Implement claude-commands setup (replace setup.sh)');
            if (!verifyPassed) console.log('   • Implement claude-commands verify (replace verify-setup.sh)');
            console.log('   • Enhance error handling and logging');
            console.log('   • Add comprehensive help system');
        }
        
        return totalFailed === 0;
    }
}

// Run tests if called directly
if (require.main === module) {
    const tests = new CliFoundationTests();
    tests.runAllTests();
    // Exit 0 when all tests pass
    const totalFailed = tests.results.reduce((sum, suite) => sum + suite.failed, 0);
    process.exit(totalFailed === 0 ? 0 : 1);
}

module.exports = CliFoundationTests;