#!/usr/bin/env node

/**
 * Master Test Suite Runner
 * Runs all test suites in the consolidated test directory
 */

const path = require('path');

// Import all test suites
const CommandValidationTests = require('./test_command_validation');
const CoreWorkflowCommandsTests = require('./test_core_workflow_commands');
const SecurityCommandsTests = require('./test_security_commands');
const QualityCommandsTests = require('./test_quality_commands');
const GitCommandsTests = require('./test_git_commands');
const UserExperienceTests = require('./test_user_experience');
const ValidationSystemTests = require('./test_validation_system');

// REQ tests have their own runners
const req007Test = path.join(__dirname, 'test_req_007_interactive_setup_wizard.js');
const req009Test = path.join(__dirname, 'test_req_009_configuration_template_application.js');
const req018Test = path.join(__dirname, 'test_req_018_security_hook_installation.js');

async function runAllTests() {
    console.log('🧪 Running Comprehensive Test Suite');
    console.log('='.repeat(60));
    console.log(`Running from: ${__dirname}`);
    console.log('='.repeat(60));

    const testSuites = [
        { name: 'Command Validation', testClass: CommandValidationTests },
        { name: 'Core Workflow Commands', testClass: CoreWorkflowCommandsTests },
        { name: 'Security Commands', testClass: SecurityCommandsTests },
        { name: 'Quality Commands', testClass: QualityCommandsTests },
        { name: 'Git Commands', testClass: GitCommandsTests },
        { name: 'User Experience', testClass: UserExperienceTests },
        { name: 'Validation System', testClass: ValidationSystemTests }
    ];

    let totalPassed = 0;
    let totalFailed = 0;
    const results = [];

    // Run REQ-007 test first
    console.log('\n📋 Running REQ-007 Interactive Setup Wizard Tests');
    console.log('-'.repeat(50));
    try {
        const { execSync } = require('child_process');
        execSync(`node ${req007Test}`, { stdio: 'inherit', cwd: __dirname });
        console.log('✅ REQ-007 tests PASSED\n');
        results.push({ name: 'REQ-007 Interactive Setup Wizard', status: 'PASSED' });
        totalPassed++;
    } catch (error) {
        console.log('❌ REQ-007 tests FAILED\n');
        results.push({ name: 'REQ-007 Interactive Setup Wizard', status: 'FAILED' });
        totalFailed++;
    }

    // Run REQ-009 test
    console.log('\n📋 Running REQ-009 Configuration Template Application Tests');
    console.log('-'.repeat(50));
    try {
        const { execSync } = require('child_process');
        execSync(`node ${req009Test}`, { stdio: 'inherit', cwd: __dirname });
        console.log('✅ REQ-009 tests PASSED\n');
        results.push({ name: 'REQ-009 Configuration Template Application', status: 'PASSED' });
        totalPassed++;
    } catch (error) {
        console.log('❌ REQ-009 tests FAILED\n');
        results.push({ name: 'REQ-009 Configuration Template Application', status: 'FAILED' });
        totalFailed++;
    }

    // Run REQ-018 test
    console.log('\n📋 Running REQ-018 Security Hook Installation Tests');
    console.log('-'.repeat(50));
    try {
        const { execSync } = require('child_process');
        execSync(`node ${req018Test}`, { stdio: 'inherit', cwd: __dirname });
        console.log('✅ REQ-018 tests PASSED\n');
        results.push({ name: 'REQ-018 Security Hook Installation', status: 'PASSED' });
        totalPassed++;
    } catch (error) {
        console.log('❌ REQ-018 tests FAILED\n');
        results.push({ name: 'REQ-018 Security Hook Installation', status: 'FAILED' });
        totalFailed++;
    }

    // Run all other test suites
    for (const { name, testClass } of testSuites) {
        console.log(`\n📋 Running ${name} Tests`);
        console.log('-'.repeat(50));
        
        try {
            const tester = new testClass();
            const success = tester.runAllTests();
            
            if (success) {
                results.push({ name, status: 'PASSED' });
                totalPassed++;
            } else {
                results.push({ name, status: 'FAILED' });
                totalFailed++;
            }
        } catch (error) {
            console.log(`❌ ${name} tests ERROR: ${error.message}`);
            results.push({ name, status: 'ERROR' });
            totalFailed++;
        }
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE TEST RESULTS SUMMARY');
    console.log('='.repeat(60));

    for (const result of results) {
        const status = result.status === 'PASSED' ? '✅' : 
                      result.status === 'FAILED' ? '❌' : '🔥';
        console.log(`${status} ${result.name}: ${result.status}`);
    }

    console.log('\n' + '-'.repeat(60));
    console.log(`Total Test Suites: ${totalPassed + totalFailed}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalFailed}`);
    console.log(`Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);

    if (totalFailed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! Package is ready for publication.');
    } else {
        console.log(`\n⚠️  ${totalFailed} test suite(s) failed. Review failures before publication.`);
    }

    console.log('='.repeat(60));
    return totalFailed === 0;
}

// Run tests if executed directly
if (require.main === module) {
    runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Test runner error:', error);
        process.exit(1);
    });
}

module.exports = { runAllTests };