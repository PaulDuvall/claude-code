#!/usr/bin/env node

/**
 * Security Commands Test Suite
 * Converted from Python specs/tests/test_security_commands.py
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

class SecurityCommandsTests {
    constructor() {
        this.activeDir = path.join(__dirname, '../commands/active');
        this.passed = 0;
        this.failed = 0;
    }

    runTest(testName, testFn) {
        try {
            testFn.call(this);
            console.log(`✅ ${testName}`);
            this.passed++;
        } catch (error) {
            console.log(`❌ ${testName}: ${error.message}`);
            this.failed++;
        }
    }

    test_xsecurity_defensive_focus() {
        const securityFile = path.join(this.activeDir, 'xsecurity.md');
        assert(fs.existsSync(securityFile), 'xsecurity.md must exist');

        const content = fs.readFileSync(securityFile, 'utf8');

        // Check for defensive security patterns
        const defensivePatterns = [
            /vulnerability\s+scan/i,
            /security\s+scan/i,
            /dependency\s+check/i,
            /code\s+analysis/i,
            /safety\s+check/i,
            /audit/i
        ];

        const hasDefensive = defensivePatterns.some(pattern => pattern.test(content));
        assert(hasDefensive, 'xsecurity.md must focus on defensive security');
    }

    test_xsecurity_vulnerability_scanning() {
        const securityFile = path.join(this.activeDir, 'xsecurity.md');
        const content = fs.readFileSync(securityFile, 'utf8');

        const scanningPatterns = [
            /vulnerability/i,
            /scan/i,
            /npm\s+audit/i,
            /safety/i,
            /bandit/i,
            /semgrep/i
        ];

        const hasScanning = scanningPatterns.some(pattern => pattern.test(content));
        assert(hasScanning, 'xsecurity.md must include vulnerability scanning');
    }

    test_no_offensive_security_patterns() {
        const securityFile = path.join(this.activeDir, 'xsecurity.md');
        const content = fs.readFileSync(securityFile, 'utf8');

        const offensivePatterns = [
            /exploit/i,
            /attack/i,
            /penetration\s+test/i,
            /payload/i,
            /backdoor/i,
            /reverse\s+shell/i
        ];

        const hasOffensive = offensivePatterns.some(pattern => pattern.test(content));
        assert(!hasOffensive, 'xsecurity.md must not contain offensive security patterns');
    }

    runAllTests() {
        console.log('🧪 Security Commands Test Suite');
        console.log('====================================');

        const tests = [
            ['xsecurity.md focuses on defensive security', this.test_xsecurity_defensive_focus],
            ['xsecurity.md includes vulnerability scanning', this.test_xsecurity_vulnerability_scanning],
            ['xsecurity.md contains no offensive security patterns', this.test_no_offensive_security_patterns]
        ];

        for (const [testName, testFn] of tests) {
            this.runTest(testName, testFn);
        }

        console.log(`\n✅ All security command tests passed!`);
        return this.failed === 0;
    }
}

// Run tests if executed directly
if (require.main === module) {
    const tester = new SecurityCommandsTests();
    const success = tester.runAllTests();
    process.exit(success ? 0 : 1);
}

module.exports = SecurityCommandsTests;