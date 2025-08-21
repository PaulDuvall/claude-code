#!/usr/bin/env node

/**
 * Dynamic Test Runner
 * Automatically discovers and runs all test files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const testsDir = path.join(__dirname, '../tests');

function discoverTests() {
    console.log('🔍 Discovering test files...\n');
    
    const testFiles = fs.readdirSync(testsDir)
        .filter(file => file.startsWith('test_') && file.endsWith('.js'))
        .sort();
    
    const categories = {
        req: testFiles.filter(f => f.includes('req_')),
        suites: testFiles.filter(f => !f.includes('req_') && f !== 'test_all_suites.js'),
        main: testFiles.filter(f => f === 'test_all_suites.js')
    };
    
    return categories;
}

function runTestCategory(categoryName, testFiles, description) {
    console.log(`\n📋 ${description}`);
    console.log('='.repeat(50));
    
    let passed = 0;
    let failed = 0;
    const results = [];
    
    for (const testFile of testFiles) {
        const testPath = path.join(testsDir, testFile);
        const testName = testFile.replace('.js', '').replace('test_', '').replace(/_/g, ' ');
        
        try {
            console.log(`\n▶️  Running ${testName}...`);
            execSync(`node "${testPath}"`, { stdio: 'inherit', cwd: testsDir });
            console.log(`✅ ${testName}: PASSED`);
            passed++;
            results.push({ name: testName, status: 'PASSED' });
        } catch (error) {
            console.log(`❌ ${testName}: FAILED`);
            failed++;
            results.push({ name: testName, status: 'FAILED' });
        }
    }
    
    return { passed, failed, results };
}

function main() {
    console.log('🧪 Dynamic Test Suite Runner');
    console.log('==============================');
    
    const testCategories = discoverTests();
    const allResults = [];
    let totalPassed = 0;
    let totalFailed = 0;
    
    // Run REQ tests
    if (testCategories.req.length > 0) {
        const reqResults = runTestCategory('REQ Tests', testCategories.req, 
            `Requirements Tests (${testCategories.req.length} tests)`);
        allResults.push(...reqResults.results);
        totalPassed += reqResults.passed;
        totalFailed += reqResults.failed;
    }
    
    // Run test suites individually for better error isolation
    if (testCategories.suites.length > 0) {
        const suiteResults = runTestCategory('Test Suites', testCategories.suites, 
            `Individual Test Suites (${testCategories.suites.length} suites)`);
        allResults.push(...suiteResults.results);
        totalPassed += suiteResults.passed;
        totalFailed += suiteResults.failed;
    }
    
    // Run comprehensive test suite
    if (testCategories.main.length > 0) {
        const mainResults = runTestCategory('Comprehensive Suite', testCategories.main, 
            'Comprehensive Test Suite (All Tests Combined)');
        allResults.push(...mainResults.results);
        totalPassed += mainResults.passed;
        totalFailed += mainResults.failed;
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    allResults.forEach(result => {
        const icon = result.status === 'PASSED' ? '✅' : '❌';
        console.log(`${icon} ${result.name}: ${result.status}`);
    });
    
    console.log('\n' + '-'.repeat(60));
    console.log(`Total Tests: ${totalPassed + totalFailed}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalFailed}`);
    console.log(`Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
    
    if (totalFailed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! Package is ready for publication.');
    } else {
        console.log(`\n❌ ${totalFailed} test(s) failed. Please fix before proceeding.`);
        process.exit(1);
    }
    
    console.log('='.repeat(60));
}

if (require.main === module) {
    main();
}

module.exports = { discoverTests, runTestCategory };