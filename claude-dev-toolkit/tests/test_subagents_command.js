#!/usr/bin/env node

/**
 * Subagents Command Test Suite
 * Tests for REQ-SUBAGENTS-001 through REQ-SUBAGENTS-004
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

class SubagentsCommandTests {
    constructor() {
        this.cliPath = path.join(__dirname, '../bin/claude-commands');
        this.subagentsDir = path.join(__dirname, '../subagents');
        this.claudeDir = path.join(os.homedir(), '.claude');
        this.claudeSubagentsDir = path.join(this.claudeDir, 'subagents');
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

    // REQ-SUBAGENTS-001: List Available Subagents
    test_list_available_subagents() {
        const output = execSync(`node "${this.cliPath}" subagents --list`, { encoding: 'utf8' });
        
        // Should display available subagents from subagents/ directory
        assert(output.includes('Available Subagents:'), 'Should show available subagents header');
        assert(output.includes('api-guardian'), 'Should list api-guardian subagent');
        assert(output.includes('security-auditor'), 'Should list security-auditor subagent');
        assert(output.match(/\d+ subagents available/), 'Should show count of available subagents');
    }

    // REQ-SUBAGENTS-002: Install Subagents
    test_install_subagents() {
        // Clean up any existing installation
        if (fs.existsSync(this.claudeSubagentsDir)) {
            fs.rmSync(this.claudeSubagentsDir, { recursive: true, force: true });
        }

        const output = execSync(`node "${this.cliPath}" subagents --install`, { encoding: 'utf8' });
        
        // Should copy all subagent files to Claude Code's subagents directory
        assert(fs.existsSync(this.claudeSubagentsDir), 'Should create ~/.claude/subagents/ directory');
        assert(output.includes('Installation Summary') || output.includes('Installed'), 'Should show installation success message');
        
        // Verify specific subagent files were copied
        assert(fs.existsSync(path.join(this.claudeSubagentsDir, 'api-guardian.md')), 'Should copy api-guardian.md');
        assert(fs.existsSync(path.join(this.claudeSubagentsDir, 'security-auditor.md')), 'Should copy security-auditor.md');
        
        // Count should match
        const sourceCount = fs.readdirSync(this.subagentsDir).filter(f => f.endsWith('.md')).length;
        const installedCount = fs.readdirSync(this.claudeSubagentsDir).filter(f => f.endsWith('.md')).length;
        assert(sourceCount === installedCount, `Should install all ${sourceCount} subagents`);
    }

    // REQ-SUBAGENTS-003: Show Help
    test_show_help() {
        const output = execSync(`node "${this.cliPath}" subagents --help`, { encoding: 'utf8' });
        
        // Should display usage information and available options
        assert(output.includes('Usage:'), 'Should show usage information');
        assert(output.includes('--list'), 'Should show --list option');
        assert(output.includes('--install'), 'Should show --install option');
        assert(output.includes('--help'), 'Should show --help option');
    }

    // REQ-SUBAGENTS-004: Handle Missing Directory
    test_handle_missing_directory() {
        // Remove the directory if it exists
        if (fs.existsSync(this.claudeSubagentsDir)) {
            fs.rmSync(this.claudeSubagentsDir, { recursive: true, force: true });
        }

        // Ensure parent .claude directory exists
        if (!fs.existsSync(this.claudeDir)) {
            fs.mkdirSync(this.claudeDir, { recursive: true });
        }

        const output = execSync(`node "${this.cliPath}" subagents --install`, { encoding: 'utf8' });
        
        // Should create the directory before installing subagents
        assert(fs.existsSync(this.claudeSubagentsDir), 'Should create ~/.claude/subagents/ directory if it doesn\'t exist');
        assert(output.includes('Created') || output.includes('directory'), 'Should show directory creation message');
        assert(output.includes('Installation Summary') || output.includes('Installed'), 'Should show installation success message');
    }

    // Test that subagents directory exists in package
    test_subagents_directory_exists() {
        assert(fs.existsSync(this.subagentsDir), 'Subagents directory must exist in package');
        
        const subagentFiles = fs.readdirSync(this.subagentsDir).filter(f => f.endsWith('.md'));
        assert(subagentFiles.length > 0, 'Must have subagent files');
        console.log(`📁 Found ${subagentFiles.length} subagent files`);
    }

    runAllTests() {
        console.log('🚀 Claude Commands Subagents Test Suite');
        console.log('==========================================');

        const tests = [
            ['Subagents directory exists', this.test_subagents_directory_exists],
            ['REQ-SUBAGENTS-003: Show help', this.test_show_help],
            ['REQ-SUBAGENTS-001: List available subagents', this.test_list_available_subagents],
            ['REQ-SUBAGENTS-004: Handle missing directory', this.test_handle_missing_directory],
            ['REQ-SUBAGENTS-002: Install subagents', this.test_install_subagents]
        ];

        for (const [testName, testFn] of tests) {
            this.runTest(testName, testFn);
        }

        console.log(`\n📊 Results: ${this.passed} passed, ${this.failed} failed`);
        return this.failed === 0;
    }
}

// Run tests if executed directly
if (require.main === module) {
    const tester = new SubagentsCommandTests();
    const success = tester.runAllTests();
    process.exit(success ? 0 : 1);
}

module.exports = SubagentsCommandTests;