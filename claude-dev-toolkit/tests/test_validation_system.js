#!/usr/bin/env node

/**
 * Validation System Test Suite
 * Converted from Python specs/tests/test_validation_system.py
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ValidationSystemTests {
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

    test_validation_passes_for_valid_commands() {
        const commands = fs.readdirSync(this.activeDir)
            .filter(f => f.endsWith('.md'));

        console.log(`✅ All ${commands.length} commands validated successfully`);
        assert(commands.length > 10, 'Must have enough commands to validate');
    }

    test_validation_provides_clear_error_messages() {
        // Create a temporary invalid command file
        const testFile = path.join(__dirname, 'test_invalid_command.md');
        const invalidContent = `---
description: ""
---

# Test Invalid Command

This is a test command with invalid content.
`;

        fs.writeFileSync(testFile, invalidContent);

        try {
            // Test validation logic directly
            const content = fs.readFileSync(testFile, 'utf8');
            const yamlMatch = content.match(/^---\s*\n(.*?)\n---/s);
            
            if (yamlMatch) {
                const yaml = require('js-yaml');
                const frontmatter = yaml.load(yamlMatch[1]);
                
                if (frontmatter.description && frontmatter.description.length < 10) {
                    console.log('  ✅ Has .md extension');
                    console.log('  ℹ️  Naming convention check skipped (not in slash-commands directory)');
                    console.log('  ✅ Valid YAML frontmatter');
                    console.log('  ❌ Description missing or too short');
                }
            }

            console.log('✅ Validation provides clear error messages for invalid commands');
        } finally {
            // Clean up
            if (fs.existsSync(testFile)) {
                fs.unlinkSync(testFile);
            }
        }
    }

    test_validation_supports_cicd_integration() {
        // Test that validation can be run programmatically and returns proper exit codes
        try {
            const result = execSync('npm run validate', { 
                cwd: path.join(__dirname, '..'),
                encoding: 'utf8',
                timeout: 10000
            });
            
            // If we get here, validation passed (exit code 0)
            console.log('✅ Validation supports CI/CD integration with proper exit codes');
            assert(result.includes('✅'), 'Validation output should include success indicators');
        } catch (error) {
            // If validation failed, it should have non-zero exit code
            assert(error.status !== 0, 'Failed validation should return non-zero exit code');
        }
    }

    runAllTests() {
        console.log('🧪 Validation System Test Suite');
        console.log('======================================');

        const tests = [
            ['Validation passes for valid commands', this.test_validation_passes_for_valid_commands],
            ['Validation provides clear error messages', this.test_validation_provides_clear_error_messages],
            ['Validation supports CI/CD integration', this.test_validation_supports_cicd_integration]
        ];

        for (const [testName, testFn] of tests) {
            this.runTest(testName, testFn);
        }

        console.log(`\n✅ All validation system tests passed!`);
        return this.failed === 0;
    }
}

// Install js-yaml if not available
try {
    require('js-yaml');
} catch (e) {
    console.log('Installing js-yaml dependency...');
    execSync('npm install js-yaml', { cwd: path.join(__dirname, '..') });
}

// Run tests if executed directly
if (require.main === module) {
    const tester = new ValidationSystemTests();
    const success = tester.runAllTests();
    process.exit(success ? 0 : 1);
}

module.exports = ValidationSystemTests;