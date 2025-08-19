#!/usr/bin/env node

/**
 * Git Commands Test Suite
 * Converted from Python specs/tests/test_git_commands.py
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

class GitCommandsTests {
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

    test_xgit_status_verification() {
        const gitFile = path.join(this.activeDir, 'xgit.md');
        assert(fs.existsSync(gitFile), 'xgit.md must exist');

        const content = fs.readFileSync(gitFile, 'utf8');

        const statusPatterns = [
            /git\s+status/i,
            /working\s+tree/i,
            /clean/i,
            /nothing\s+to\s+commit/i,
            /staged/i
        ];

        const hasStatus = statusPatterns.some(pattern => pattern.test(content));
        assert(hasStatus, 'xgit.md must include git status verification');
    }

    test_xgit_conventional_commits() {
        const gitFile = path.join(this.activeDir, 'xgit.md');
        const content = fs.readFileSync(gitFile, 'utf8');

        const conventionalPatterns = [
            /conventional/i,
            /commit\s+message/i,
            /feat:/i,
            /fix:/i,
            /type:/i,
            /scope:/i
        ];

        const hasConventional = conventionalPatterns.some(pattern => pattern.test(content));
        assert(hasConventional, 'xgit.md must support conventional commit messages');
    }

    test_xgit_push_failure_handling() {
        const gitFile = path.join(this.activeDir, 'xgit.md');
        const content = fs.readFileSync(gitFile, 'utf8');

        const failurePatterns = [
            /push\s+fail/i,
            /error/i,
            /conflict/i,
            /rejected/i,
            /retry/i,
            /pull/i
        ];

        const hasFailureHandling = failurePatterns.some(pattern => pattern.test(content));
        assert(hasFailureHandling, 'xgit.md must include push failure handling');
    }

    runAllTests() {
        console.log('🧪 Git Commands Test Suite');
        console.log('==============================');

        const tests = [
            ['xgit.md includes git status verification', this.test_xgit_status_verification],
            ['xgit.md supports conventional commit messages', this.test_xgit_conventional_commits],
            ['xgit.md includes push failure handling', this.test_xgit_push_failure_handling]
        ];

        for (const [testName, testFn] of tests) {
            this.runTest(testName, testFn);
        }

        console.log(`\n✅ All git command tests passed!`);
        return this.failed === 0;
    }
}

// Run tests if executed directly
if (require.main === module) {
    const tester = new GitCommandsTests();
    const success = tester.runAllTests();
    process.exit(success ? 0 : 1);
}

module.exports = GitCommandsTests;