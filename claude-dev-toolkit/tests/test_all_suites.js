#!/usr/bin/env node

/**
 * Master Test Suite Runner
 * Runs all test suites in the consolidated test directory
 */

const path = require('path');

const fs = require('fs');

// REQ tests have their own runners
const req007Test = path.join(__dirname, 'test_req_007_interactive_setup_wizard.js');
const req009Test = path.join(__dirname, 'test_req_009_configuration_template_application.js');
const req018Test = path.join(__dirname, 'test_req_018_security_hook_installation.js');
const req020Test = path.join(__dirname, 'test_req_020_installation_failure_recovery.js');
const req021Test = path.join(__dirname, 'test_req_021_permission_error_handling.js');
const req022Test = path.join(__dirname, 'test_req_022_dependency_validation.js');
const req023Test = path.join(__dirname, 'test_req_023_claude_code_compatibility.js');
const req053Test = path.join(__dirname, 'test_req_053_public_npm_publication.js');

async function runAllTests() {
    console.log('🧪 Running Comprehensive Test Suite');
    console.log('='.repeat(60));
    console.log(`Running from: ${__dirname}`);
    console.log('='.repeat(60));

    // Dynamically discover all test files
    const testFiles = fs.readdirSync(__dirname)
        .filter(file => file.startsWith('test_') && file.endsWith('.js') && 
                !file.includes('req_') && file !== 'test_all_suites.js')
        .sort();

    console.log(`📁 Discovered ${testFiles.length} test suites: ${testFiles.map(f => f.replace('.js', '')).join(', ')}`);

    const testSuites = [];
    
    // Load each test suite dynamically
    for (const testFile of testFiles) {
        try {
            const testModule = require(`./${testFile}`);
            const testName = testFile
                .replace('test_', '')
                .replace('.js', '')
                .replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
            
            testSuites.push({ 
                name: testName, 
                testClass: testModule,
                filename: testFile
            });
        } catch (error) {
            console.log(`⚠️  Failed to load test suite ${testFile}: ${error.message}`);
        }
    }

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

    // Run REQ-020 test
    console.log('\n📋 Running REQ-020 Installation Failure Recovery Tests');
    console.log('-'.repeat(50));
    try {
        const { execSync } = require('child_process');
        execSync(`node ${req020Test}`, { stdio: 'inherit', cwd: __dirname });
        console.log('✅ REQ-020 tests PASSED\n');
        results.push({ name: 'REQ-020 Installation Failure Recovery', status: 'PASSED' });
        totalPassed++;
    } catch (error) {
        console.log('❌ REQ-020 tests FAILED\n');
        results.push({ name: 'REQ-020 Installation Failure Recovery', status: 'FAILED' });
        totalFailed++;
    }

    // Run REQ-021 test
    console.log('\n📋 Running REQ-021 Permission Error Handling Tests');
    console.log('-'.repeat(50));
    try {
        const { execSync } = require('child_process');
        execSync(`node ${req021Test}`, { stdio: 'inherit', cwd: __dirname });
        console.log('✅ REQ-021 tests PASSED\n');
        results.push({ name: 'REQ-021 Permission Error Handling', status: 'PASSED' });
        totalPassed++;
    } catch (error) {
        console.log('❌ REQ-021 tests FAILED\n');
        results.push({ name: 'REQ-021 Permission Error Handling', status: 'FAILED' });
        totalFailed++;
    }

    // Run REQ-022 test
    console.log('\n📋 Running REQ-022 Dependency Validation Tests');
    console.log('-'.repeat(50));
    try {
        const { execSync } = require('child_process');
        execSync(`node ${req022Test}`, { stdio: 'inherit', cwd: __dirname });
        console.log('✅ REQ-022 tests PASSED\n');
        results.push({ name: 'REQ-022 Dependency Validation', status: 'PASSED' });
        totalPassed++;
    } catch (error) {
        console.log('❌ REQ-022 tests FAILED\n');
        results.push({ name: 'REQ-022 Dependency Validation', status: 'FAILED' });
        totalFailed++;
    }

    // Run REQ-023 test
    console.log('\n📋 Running REQ-023 Claude Code Compatibility Tests');
    console.log('-'.repeat(50));
    try {
        const { execSync } = require('child_process');
        execSync(`node ${req023Test}`, { stdio: 'inherit', cwd: __dirname });
        console.log('✅ REQ-023 tests PASSED\n');
        results.push({ name: 'REQ-023 Claude Code Compatibility', status: 'PASSED' });
        totalPassed++;
    } catch (error) {
        console.log('❌ REQ-023 tests FAILED\n');
        results.push({ name: 'REQ-023 Claude Code Compatibility', status: 'FAILED' });
        totalFailed++;
    }

    // Run REQ-053 test
    console.log('\n📋 Running REQ-053 Public NPM Registry Publication Tests');
    console.log('-'.repeat(50));
    try {
        const { execSync } = require('child_process');
        execSync(`node ${req053Test}`, { stdio: 'inherit', cwd: __dirname });
        console.log('✅ REQ-053 tests PASSED\n');
        results.push({ name: 'REQ-053 Public NPM Registry Publication', status: 'PASSED' });
        totalPassed++;
    } catch (error) {
        console.log('❌ REQ-053 tests FAILED\n');
        results.push({ name: 'REQ-053 Public NPM Registry Publication', status: 'FAILED' });
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