#!/usr/bin/env node

/**
 * Command Validation Test Suite
 * Converted from Python specs/tests/test_command_validation.py
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class CommandValidationTests {
    constructor() {
        this.commandsDir = path.join(__dirname, '../commands/active');
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

    validateCommand(commandFile) {
        const content = fs.readFileSync(commandFile, 'utf8');
        const filename = path.basename(commandFile);

        console.log(`🔍 Validating ${filename}`);

        // Test .md extension
        assert(filename.endsWith('.md'), 'Must have .md extension');
        console.log('  ✅ Has .md extension');

        // Test naming convention (starts with 'x')
        assert(filename.startsWith('x'), 'Must follow naming convention (start with x)');
        console.log('  ✅ Follows naming convention');

        // Test YAML frontmatter
        const yamlMatch = content.match(/^---\s*\n(.*?)\n---/s);
        if (yamlMatch) {
            try {
                const frontmatter = yaml.load(yamlMatch[1]);
                assert(typeof frontmatter === 'object', 'YAML frontmatter must be valid');
                console.log('  ✅ Valid YAML frontmatter');

                // Test description
                if (frontmatter.description) {
                    assert(frontmatter.description.length >= 10, 'Description must be meaningful');
                    console.log('  ✅ Has meaningful description');
                }

                // Test tags
                if (frontmatter.tags) {
                    assert(Array.isArray(frontmatter.tags), 'Tags must be an array');
                    console.log('  ✅ Has valid tags array');
                }
            } catch (e) {
                throw new Error(`Invalid YAML frontmatter: ${e.message}`);
            }
        }

        // Test for executable commands (bash, npm, python, etc.)
        const executablePatterns = [
            /```bash\s*\n/i,
            /```sh\s*\n/i,
            /npm\s+/i,
            /python\s+/i,
            /node\s+/i,
            /git\s+/i
        ];

        const hasExecutableCommands = executablePatterns.some(pattern => pattern.test(content));
        assert(hasExecutableCommands, 'Must contain executable commands');
        console.log('  ✅ Contains executable commands');

        // Test defensive security focus (no offensive patterns)
        const offensivePatterns = [
            /exploit/i,
            /attack/i,
            /penetration/i,
            /hack/i,
            /breach/i
        ];

        const defensivePatterns = [
            /security/i,
            /validate/i,
            /check/i,
            /scan/i,
            /protect/i
        ];

        const hasOffensive = offensivePatterns.some(pattern => pattern.test(content));
        const hasDefensive = defensivePatterns.some(pattern => pattern.test(content));

        assert(!hasOffensive || hasDefensive, 'Must maintain defensive security focus');
        console.log('  ✅ Maintains defensive security focus');

        return true;
    }

    test_command_files_exist() {
        assert(fs.existsSync(this.commandsDir), 'Commands directory must exist');
        
        const commandFiles = fs.readdirSync(this.commandsDir)
            .filter(f => f.endsWith('.md'))
            .map(f => path.join(this.commandsDir, f));
        
        assert(commandFiles.length > 0, 'Must have command files');
        console.log(`📁 Found ${commandFiles.length} command files`);
    }

    test_all_commands_valid() {
        const commandFiles = fs.readdirSync(this.commandsDir)
            .filter(f => f.endsWith('.md'))
            .map(f => path.join(this.commandsDir, f));

        let validCommands = 0;
        for (const commandFile of commandFiles) {
            try {
                this.validateCommand(commandFile);
                validCommands++;
            } catch (error) {
                throw new Error(`Command ${path.basename(commandFile)} failed validation: ${error.message}`);
            }
        }

        assert(validCommands === commandFiles.length, 'All commands must be valid');
        console.log(`✅ All ${validCommands} commands passed validation!`);
    }

    runAllTests() {
        console.log('🚀 Claude Code Command Validation');
        console.log('========================================');

        const tests = [
            ['Command files exist', this.test_command_files_exist],
            ['All commands valid', this.test_all_commands_valid]
        ];

        for (const [testName, testFn] of tests) {
            this.runTest(testName, testFn);
        }

        console.log(`\n📊 Results: ${this.passed} passed, ${this.failed} failed`);
        return this.failed === 0;
    }
}

// Install js-yaml if not available
try {
    require('js-yaml');
} catch (e) {
    console.log('Installing js-yaml dependency...');
    require('child_process').execSync('npm install js-yaml', { cwd: __dirname + '/..' });
}

// Run tests if executed directly
if (require.main === module) {
    const tester = new CommandValidationTests();
    const success = tester.runAllTests();
    process.exit(success ? 0 : 1);
}

module.exports = CommandValidationTests;