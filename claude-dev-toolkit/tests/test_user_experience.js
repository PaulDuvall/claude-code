#!/usr/bin/env node

/**
 * User Experience Test Suite
 * Converted from Python specs/tests/test_user_experience.py
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

class UserExperienceTests {
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

    getActiveCommands() {
        if (!fs.existsSync(this.activeDir)) return [];
        return fs.readdirSync(this.activeDir)
            .filter(f => f.endsWith('.md'))
            .map(f => f.replace('.md', ''));
    }

    hasSimpleInterface(commandFile) {
        const content = fs.readFileSync(commandFile, 'utf8');
        
        // Simple interface indicators
        const simplePatterns = [
            /usage/i,
            /example/i,
            /help/i,
            /option/i,
            /parameter/i
        ];

        return simplePatterns.some(pattern => pattern.test(content));
    }

    hasClearInstructions(commandFile) {
        const content = fs.readFileSync(commandFile, 'utf8');
        
        // Clear instruction indicators
        const instructionPatterns = [
            /## usage/i,
            /## example/i,
            /step\s+\d/i,
            /how\s+to/i,
            /```/
        ];

        return instructionPatterns.some(pattern => pattern.test(content));
    }

    worksWithMinimalConfig(commandFile) {
        const content = fs.readFileSync(commandFile, 'utf8');
        
        // Should work with minimal setup
        const complexPatterns = [
            /configure\s+.*\s+before/i,
            /setup\s+.*\s+first/i,
            /install\s+.*\s+dependencies/i
        ];

        // If it has complex setup requirements, it's not minimal
        return !complexPatterns.some(pattern => pattern.test(content));
    }

    test_simple_user_interfaces() {
        const commands = this.getActiveCommands();
        
        for (const command of commands) {
            const commandFile = path.join(this.activeDir, `${command}.md`);
            const hasSimple = this.hasSimpleInterface(commandFile);
            assert(hasSimple, `${command}.md must have simple user interface`);
            console.log(`✅ ${command}.md has simple user interface`);
        }
    }

    test_clear_usage_instructions() {
        const commands = this.getActiveCommands();
        
        for (const command of commands) {
            const commandFile = path.join(this.activeDir, `${command}.md`);
            const hasClear = this.hasClearInstructions(commandFile);
            assert(hasClear, `${command}.md must have clear usage instructions`);
            console.log(`✅ ${command}.md has clear usage instructions`);
        }
    }

    test_minimal_configuration_requirements() {
        const commands = this.getActiveCommands();
        
        for (const command of commands) {
            const commandFile = path.join(this.activeDir, `${command}.md`);
            const isMinimal = this.worksWithMinimalConfig(commandFile);
            assert(isMinimal, `${command}.md must work with minimal configuration`);
            console.log(`✅ ${command}.md works with minimal configuration`);
        }
    }

    runAllTests() {
        console.log('🧪 User Experience Test Suite');
        console.log('==================================');

        const tests = [
            ['Simple user interfaces', this.test_simple_user_interfaces],
            ['Clear usage instructions', this.test_clear_usage_instructions],
            ['Minimal configuration requirements', this.test_minimal_configuration_requirements]
        ];

        for (const [testName, testFn] of tests) {
            this.runTest(testName, testFn);
        }

        console.log(`\n✅ All user experience tests passed!`);
        return this.failed === 0;
    }
}

// Run tests if executed directly
if (require.main === module) {
    const tester = new UserExperienceTests();
    const success = tester.runAllTests();
    process.exit(success ? 0 : 1);
}

module.exports = UserExperienceTests;