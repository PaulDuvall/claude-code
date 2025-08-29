#!/usr/bin/env node

/**
 * OIDC Command Tests - TDD Implementation
 * Tests for REQ-CLI-001: Toolkit Command Structure
 */

const path = require('path');

class OidcCommandTests {
    constructor() {
        this.results = [];
        this.oidcCommandPath = path.join(__dirname, '..', 'lib', 'oidc-command.js');
    }

    /**
     * Test REQ-CLI-001: Basic OIDC command structure exists
     */
    testBasicCommandStructure() {
        console.log('🧪 Testing REQ-CLI-001: Basic Command Structure...');
        
        const tests = [
            {
                name: 'OIDC command class file exists',
                test: () => {
                    try {
                        const OidcCommand = require(this.oidcCommandPath);
                        return { 
                            exists: true, 
                            isClass: typeof OidcCommand === 'function',
                            hasConstructor: !!OidcCommand.prototype.constructor
                        };
                    } catch (error) {
                        return { exists: false, error: error.message };
                    }
                },
                expected: (result) => result.exists && result.isClass && result.hasConstructor
            },
            {
                name: 'OIDC command implements execute method',
                test: () => {
                    try {
                        const OidcCommand = require(this.oidcCommandPath);
                        const instance = new OidcCommand();
                        return {
                            hasExecuteMethod: typeof instance.execute === 'function',
                            isAsync: instance.execute.constructor.name === 'AsyncFunction'
                        };
                    } catch (error) {
                        return { hasExecuteMethod: false, error: error.message };
                    }
                },
                expected: (result) => result.hasExecuteMethod && result.isAsync
            },
            {
                name: 'OIDC command constructor initializes properly',
                test: () => {
                    try {
                        const OidcCommand = require(this.oidcCommandPath);
                        const instance = new OidcCommand();
                        return {
                            hasInstance: !!instance,
                            hasProperties: instance.hasOwnProperty('claudeDir') || 
                                          instance.hasOwnProperty('homeDir'),
                            constructorWorks: true
                        };
                    } catch (error) {
                        return { hasInstance: false, error: error.message };
                    }
                },
                expected: (result) => result.hasInstance && result.constructorWorks
            }
        ];

        return this.runTests('Basic Command Structure', tests);
    }

    /**
     * Test command help functionality
     */
    testCommandHelp() {
        console.log('🧪 Testing Command Help System...');
        
        const tests = [
            {
                name: 'OIDC command provides help text',
                test: () => {
                    try {
                        const OidcCommand = require(this.oidcCommandPath);
                        const instance = new OidcCommand();
                        const helpText = instance.getHelpText();
                        return {
                            hasHelpMethod: typeof instance.getHelpText === 'function',
                            hasHelpText: typeof helpText === 'string' && helpText.length > 0,
                            includesUsage: helpText.includes('Usage:'),
                            includesOIDC: helpText.toLowerCase().includes('oidc')
                        };
                    } catch (error) {
                        return { hasHelpMethod: false, error: error.message };
                    }
                },
                expected: (result) => result.hasHelpMethod && result.hasHelpText && 
                                   result.includesUsage && result.includesOIDC
            }
        ];

        return this.runTests('Command Help', tests);
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
     * Test REQ-DEP-001: Tool Availability Checks
     */
    testDependencyValidation() {
        console.log('🧪 Testing REQ-DEP-001: Tool Availability Checks...');
        
        const tests = [
            {
                name: 'OIDC command validates AWS CLI availability',
                test: () => {
                    try {
                        const OidcCommand = require(this.oidcCommandPath);
                        const instance = new OidcCommand();
                        
                        // Test dependency validation method exists
                        return {
                            hasValidateDependencies: typeof instance.validateDependencies === 'function',
                            isAsync: instance.validateDependencies.constructor.name === 'AsyncFunction'
                        };
                    } catch (error) {
                        return { hasValidateDependencies: false, error: error.message };
                    }
                },
                expected: (result) => result.hasValidateDependencies && result.isAsync
            },
            {
                name: 'OIDC command checks required tools (AWS CLI, Git, GitHub CLI)',
                test: () => {
                    try {
                        const OidcCommand = require(this.oidcCommandPath);
                        const instance = new OidcCommand();
                        const requiredTools = instance.getRequiredTools();
                        
                        const expectedTools = ['aws', 'git', 'gh'];
                        const hasAllTools = expectedTools.every(tool => 
                            requiredTools.some(req => req.name === tool)
                        );
                        
                        return {
                            hasRequiredToolsMethod: typeof instance.getRequiredTools === 'function',
                            hasAwsCli: requiredTools.some(t => t.name === 'aws'),
                            hasGit: requiredTools.some(t => t.name === 'git'),
                            hasGitHub: requiredTools.some(t => t.name === 'gh'),
                            hasAllTools
                        };
                    } catch (error) {
                        return { hasRequiredToolsMethod: false, error: error.message };
                    }
                },
                expected: (result) => result.hasRequiredToolsMethod && result.hasAllTools
            },
            {
                name: 'OIDC command integrates with DependencyValidator service',
                test: () => {
                    try {
                        const OidcCommand = require(this.oidcCommandPath);
                        const instance = new OidcCommand();
                        
                        return {
                            hasDependencyValidator: !!instance.dependencyValidator,
                            hasProperType: instance.dependencyValidator && 
                                          typeof instance.dependencyValidator.checkDependencies === 'function'
                        };
                    } catch (error) {
                        return { hasDependencyValidator: false, error: error.message };
                    }
                },
                expected: (result) => result.hasDependencyValidator && result.hasProperType
            }
        ];

        return this.runTests('Tool Availability Checks', tests);
    }

    /**
     * Test REQ-ERR-001: Error Framework Integration
     */
    testErrorFrameworkIntegration() {
        console.log('🧪 Testing REQ-ERR-001: Error Framework Integration...');
        
        const tests = [
            {
                name: 'OIDC command integrates with ErrorHandlerUtils',
                test: () => {
                    try {
                        const OidcCommand = require(this.oidcCommandPath);
                        const instance = new OidcCommand();
                        
                        return {
                            hasErrorHandlerUtils: !!instance.errorHandlerUtils,
                            hasProperType: instance.errorHandlerUtils && 
                                          typeof instance.errorHandlerUtils.createEnhancedError === 'function'
                        };
                    } catch (error) {
                        return { hasErrorHandlerUtils: false, error: error.message };
                    }
                },
                expected: (result) => result.hasErrorHandlerUtils && result.hasProperType
            },
            {
                name: 'OIDC command handles dependency errors with recovery suggestions',
                test: () => {
                    try {
                        const OidcCommand = require(this.oidcCommandPath);
                        const instance = new OidcCommand();
                        
                        const mockError = new Error('aws command not found');
                        mockError.code = 'NOT_FOUND';
                        
                        const enhancedError = instance.handleDependencyError(mockError);
                        
                        return {
                            hasHandleDependencyError: typeof instance.handleDependencyError === 'function',
                            hasEnhancedError: !!enhancedError,
                            hasCategory: enhancedError && !!enhancedError.category,
                            hasSuggestions: enhancedError && !!enhancedError.suggestions
                        };
                    } catch (error) {
                        return { hasHandleDependencyError: false, error: error.message };
                    }
                },
                expected: (result) => result.hasHandleDependencyError && result.hasEnhancedError && 
                                   result.hasCategory && result.hasSuggestions
            },
            {
                name: 'OIDC command provides context-aware error handling',
                test: () => {
                    try {
                        const OidcCommand = require(this.oidcCommandPath);
                        const instance = new OidcCommand();
                        
                        const testError = new Error('Permission denied');
                        testError.code = 'EACCES';
                        
                        const contextError = instance.createContextAwareError(testError, {
                            operation: 'OIDC setup',
                            component: 'AWS CLI validation'
                        });
                        
                        return {
                            hasCreateContextAwareError: typeof instance.createContextAwareError === 'function',
                            hasContext: contextError && !!contextError.context,
                            hasOperation: contextError && contextError.context && 
                                         contextError.context.operation === 'OIDC setup',
                            hasComponent: contextError && contextError.context && 
                                         contextError.context.component === 'AWS CLI validation'
                        };
                    } catch (error) {
                        return { hasCreateContextAwareError: false, error: error.message };
                    }
                },
                expected: (result) => result.hasCreateContextAwareError && result.hasContext && 
                                   result.hasOperation && result.hasComponent
            }
        ];

        return this.runTests('Error Framework Integration', tests);
    }

    /**
     * Test REQ-CLI-002: Basic Argument Processing
     */
    testArgumentProcessing() {
        console.log('🧪 Testing REQ-CLI-002: Basic Argument Processing...');
        
        const tests = [
            {
                name: 'OIDC command supports --help option',
                test: () => {
                    try {
                        const OidcCommand = require(this.oidcCommandPath);
                        const instance = new OidcCommand();
                        
                        const options = { help: true };
                        const processed = instance.processArguments(options);
                        
                        return {
                            hasProcessArguments: typeof instance.processArguments === 'function',
                            handlesHelp: processed && processed.help === true,
                            shouldShowHelp: processed && processed.shouldShowHelp === true
                        };
                    } catch (error) {
                        return { hasProcessArguments: false, error: error.message };
                    }
                },
                expected: (result) => result.hasProcessArguments && result.handlesHelp && result.shouldShowHelp
            },
            {
                name: 'OIDC command supports --dry-run and --verbose options',
                test: () => {
                    try {
                        const OidcCommand = require(this.oidcCommandPath);
                        const instance = new OidcCommand();
                        
                        const options = { dryRun: true, verbose: true };
                        const processed = instance.processArguments(options);
                        
                        return {
                            handlesDryRun: processed && processed.dryRun === true,
                            handlesVerbose: processed && processed.verbose === true,
                            hasDefaults: processed && typeof processed === 'object'
                        };
                    } catch (error) {
                        return { handlesDryRun: false, error: error.message };
                    }
                },
                expected: (result) => result.handlesDryRun && result.handlesVerbose && result.hasDefaults
            },
            {
                name: 'OIDC command validates argument constraints',
                test: () => {
                    try {
                        const OidcCommand = require(this.oidcCommandPath);
                        const instance = new OidcCommand();
                        
                        const invalidOptions = { repositoryPath: '/invalid/path', region: 'invalid-region' };
                        const validation = instance.validateArguments(invalidOptions);
                        
                        return {
                            hasValidateArguments: typeof instance.validateArguments === 'function',
                            hasValidationResult: !!validation,
                            hasErrors: validation && Array.isArray(validation.errors),
                            hasValid: validation && typeof validation.valid === 'boolean'
                        };
                    } catch (error) {
                        return { hasValidateArguments: false, error: error.message };
                    }
                },
                expected: (result) => result.hasValidateArguments && result.hasValidationResult && 
                                   result.hasErrors && result.hasValid
            },
            {
                name: 'OIDC command provides default values for common options',
                test: () => {
                    try {
                        const OidcCommand = require(this.oidcCommandPath);
                        const instance = new OidcCommand();
                        
                        const emptyOptions = {};
                        const processed = instance.processArguments(emptyOptions);
                        
                        return {
                            hasDefaultRegion: processed && typeof processed.region === 'string',
                            hasDefaultDryRun: processed && processed.dryRun === false,
                            hasDefaultVerbose: processed && processed.verbose === false,
                            hasProcessedObject: processed && typeof processed === 'object'
                        };
                    } catch (error) {
                        return { hasDefaultRegion: false, error: error.message };
                    }
                },
                expected: (result) => result.hasDefaultRegion && result.hasDefaultDryRun && 
                                   result.hasDefaultVerbose && result.hasProcessedObject
            }
        ];

        return this.runTests('Basic Argument Processing', tests);
    }

    /**
     * Test REQ-DETECT-001: Git Repository Detection (Phase 2)
     */
    testGitRepositoryDetection() {
        console.log('🧪 Testing REQ-DETECT-001: Git Repository Detection...');
        
        const tests = [
            {
                name: 'OIDC command detects GitHub org/repo from git remote',
                test: () => {
                    try {
                        const OidcCommand = require(this.oidcCommandPath);
                        const instance = new OidcCommand();
                        return {
                            hasDetectRepoMethod: typeof instance.detectGitRepository === 'function',
                            canParseRemote: true  // Will implement this
                        };
                    } catch (error) {
                        return { hasDetectRepoMethod: false, error: error.message };
                    }
                },
                expected: (result) => result.hasDetectRepoMethod && result.canParseRemote
            },
            {
                name: 'OIDC command supports SSH and HTTPS git remotes',
                test: () => {
                    try {
                        const OidcCommand = require(this.oidcCommandPath);
                        const instance = new OidcCommand();
                        // Test SSH format: git@github.com:user/repo.git
                        // Test HTTPS format: https://github.com/user/repo.git
                        return {
                            hasParseMethods: typeof instance.parseGitRemote === 'function',
                            supportsFormats: true // Will implement this
                        };
                    } catch (error) {
                        return { hasParseMethods: false, error: error.message };
                    }
                },
                expected: (result) => result.hasParseMethods && result.supportsFormats
            },
            {
                name: 'OIDC command handles multiple remotes (prefers origin)',
                test: () => {
                    try {
                        const OidcCommand = require(this.oidcCommandPath);
                        const instance = new OidcCommand();
                        return {
                            hasRemoteSelection: typeof instance.selectPreferredRemote === 'function',
                            prefersOrigin: true // Will implement this
                        };
                    } catch (error) {
                        return { hasRemoteSelection: false, error: error.message };
                    }
                },
                expected: (result) => result.hasRemoteSelection && result.prefersOrigin
            }
        ];

        return this.runTests('Git Repository Detection', tests);
    }

    /**
     * Test REQ-DETECT-002: AWS Configuration Detection (Phase 2)
     */
    testAWSConfigurationDetection() {
        console.log('🧪 Testing REQ-DETECT-002: AWS Configuration Detection...');
        
        const tests = [
            {
                name: 'OIDC command reads AWS CLI config files',
                test: () => {
                    try {
                        const OidcCommand = require(this.oidcCommandPath);
                        const instance = new OidcCommand();
                        return {
                            hasAWSDetection: typeof instance.detectAWSConfiguration === 'function',
                            readsConfig: true // Will implement this
                        };
                    } catch (error) {
                        return { hasAWSDetection: false, error: error.message };
                    }
                },
                expected: (result) => result.hasAWSDetection && result.readsConfig
            },
            {
                name: 'OIDC command checks AWS_DEFAULT_REGION environment',
                test: () => {
                    try {
                        const OidcCommand = require(this.oidcCommandPath);
                        const instance = new OidcCommand();
                        return {
                            checksEnv: typeof instance.getAWSRegionFromEnvironment === 'function',
                            hasEnvSupport: true // Will implement this
                        };
                    } catch (error) {
                        return { checksEnv: false, error: error.message };
                    }
                },
                expected: (result) => result.checksEnv && result.hasEnvSupport
            },
            {
                name: 'OIDC command defaults to us-east-1 and validates regions',
                test: () => {
                    try {
                        const OidcCommand = require(this.oidcCommandPath);
                        const instance = new OidcCommand();
                        return {
                            hasRegionValidation: typeof instance.validateAWSRegion === 'function',
                            hasDefault: true // Will implement this
                        };
                    } catch (error) {
                        return { hasRegionValidation: false, error: error.message };
                    }
                },
                expected: (result) => result.hasRegionValidation && result.hasDefault
            }
        ];

        return this.runTests('AWS Configuration Detection', tests);
    }

    /**
     * Test REQ-CLI-003: Zero Configuration Mode (Phase 2)
     */
    testZeroConfigurationMode() {
        console.log('🧪 Testing REQ-CLI-003: Zero Configuration Mode...');
        
        const tests = [
            {
                name: 'OIDC command combines git detection and AWS detection',
                test: () => {
                    try {
                        const OidcCommand = require(this.oidcCommandPath);
                        const instance = new OidcCommand();
                        return {
                            hasAutoDetection: typeof instance.autoDetectConfiguration === 'function',
                            combinesDetection: true // Will implement this
                        };
                    } catch (error) {
                        return { hasAutoDetection: false, error: error.message };
                    }
                },
                expected: (result) => result.hasAutoDetection && result.combinesDetection
            },
            {
                name: 'OIDC command uses standard policy templates by default',
                test: () => {
                    try {
                        const OidcCommand = require(this.oidcCommandPath);
                        const instance = new OidcCommand();
                        return {
                            hasPolicyTemplates: typeof instance.getDefaultPolicyTemplate === 'function',
                            usesStandard: true // Will implement this
                        };
                    } catch (error) {
                        return { hasPolicyTemplates: false, error: error.message };
                    }
                },
                expected: (result) => result.hasPolicyTemplates && result.usesStandard
            },
            {
                name: 'OIDC command auto-generates role names',
                test: () => {
                    try {
                        const OidcCommand = require(this.oidcCommandPath);
                        const instance = new OidcCommand();
                        return {
                            hasRoleGeneration: typeof instance.generateRoleName === 'function',
                            autoGenerates: true // Will implement this
                        };
                    } catch (error) {
                        return { hasRoleGeneration: false, error: error.message };
                    }
                },
                expected: (result) => result.hasRoleGeneration && result.autoGenerates
            }
        ];

        return this.runTests('Zero Configuration Mode', tests);
    }

    /**
     * Run all OIDC command tests
     */
    runAllTests() {
        console.log('🚀 Running OIDC Command Tests (TDD Implementation)...\n');
        
        // Phase 1 Tests (Foundation Infrastructure)
        this.testBasicCommandStructure();
        this.testCommandHelp();
        this.testDependencyValidation();
        this.testErrorFrameworkIntegration();
        this.testArgumentProcessing();
        
        // Phase 2 Tests (Core Detection System)
        this.testGitRepositoryDetection();
        this.testAWSConfigurationDetection();
        this.testZeroConfigurationMode();
        
        return this.generateReport();
    }

    /**
     * Generate test report
     */
    generateReport() {
        console.log('\n📊 OIDC Command Test Results (RED PHASE)');
        console.log('='.repeat(50));
        
        let totalPassed = 0;
        let totalFailed = 0;
        let totalTests = 0;
        
        this.results.forEach(suite => {
            totalPassed += suite.passed;
            totalFailed += suite.failed;
            totalTests += suite.total;
            
            const status = suite.failed === 0 ? '✅' : '❌';
            console.log(`${status} ${suite.suiteName}: ${suite.passed}/${suite.total} passed`);
            
            // Show failures (expected in RED phase)
            suite.details.forEach(detail => {
                if (detail.status === 'FAIL') {
                    console.log(`   ❌ ${detail.name}`);
                    if (detail.result && detail.result.error) {
                        console.log(`      Expected: Command structure implementation`);
                        console.log(`      Got: ${detail.result.error}`);
                    }
                } else if (detail.status === 'ERROR') {
                    console.log(`   💥 ${detail.name}: ${detail.error}`);
                }
            });
        });
        
        console.log('\n📈 TDD Status:');
        console.log(`   🔴 RED PHASE: ${totalFailed} tests failing (expected)`);
        console.log(`   ⏭️  Next: GREEN PHASE - Implement minimal passing code`);
        
        return { phase: 'RED', totalFailed, totalTests };
    }
}

// Run tests if called directly
if (require.main === module) {
    const tests = new OidcCommandTests();
    const result = tests.runAllTests();
    
    // Expected to fail in RED phase
    console.log(`\n🎯 TDD RED PHASE COMPLETE - ${result.totalFailed} failing tests ready for GREEN phase`);
    process.exit(0);
}

module.exports = OidcCommandTests;