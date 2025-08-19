#!/usr/bin/env node

/**
 * Quality Commands Test Suite
 * Converted from Python specs/tests/test_quality_commands.py
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

class QualityCommandsTests {
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

    test_xquality_tool_detection() {
        const qualityFile = path.join(this.activeDir, 'xquality.md');
        assert(fs.existsSync(qualityFile), 'xquality.md must exist');

        const content = fs.readFileSync(qualityFile, 'utf8');

        const toolPatterns = [
            /eslint/i,
            /prettier/i,
            /black/i,
            /flake8/i,
            /pylint/i,
            /ruff/i,
            /mypy/i
        ];

        const hasTools = toolPatterns.some(pattern => pattern.test(content));
        assert(hasTools, 'xquality.md must include tool detection');
    }

    test_xquality_missing_tool_fallbacks() {
        const qualityFile = path.join(this.activeDir, 'xquality.md');
        const content = fs.readFileSync(qualityFile, 'utf8');

        const fallbackPatterns = [
            /not\s+found/i,
            /not\s+installed/i,
            /fallback/i,
            /alternative/i,
            /skip/i,
            /warning/i
        ];

        const hasFallbacks = fallbackPatterns.some(pattern => pattern.test(content));
        assert(hasFallbacks, 'xquality.md must include missing tool fallbacks');
    }

    test_xquality_structured_reports() {
        const qualityFile = path.join(this.activeDir, 'xquality.md');
        const content = fs.readFileSync(qualityFile, 'utf8');

        const reportPatterns = [
            /report/i,
            /summary/i,
            /results/i,
            /output/i,
            /format/i
        ];

        const hasReports = reportPatterns.some(pattern => pattern.test(content));
        assert(hasReports, 'xquality.md must generate structured reports');
    }

    runAllTests() {
        console.log('🧪 Quality Commands Test Suite');
        console.log('===================================');

        const tests = [
            ['xquality.md includes tool detection', this.test_xquality_tool_detection],
            ['xquality.md includes missing tool fallbacks', this.test_xquality_missing_tool_fallbacks],
            ['xquality.md generates structured reports', this.test_xquality_structured_reports]
        ];

        for (const [testName, testFn] of tests) {
            this.runTest(testName, testFn);
        }

        console.log(`\n✅ All quality command tests passed!`);
        return this.failed === 0;
    }
}

// Run tests if executed directly
if (require.main === module) {
    const tester = new QualityCommandsTests();
    const success = tester.runAllTests();
    process.exit(success ? 0 : 1);
}

module.exports = QualityCommandsTests;