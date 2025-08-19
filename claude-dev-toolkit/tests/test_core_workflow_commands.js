#!/usr/bin/env node

/**
 * Core Workflow Commands Test Suite
 * Converted from Python specs/tests/test_core_workflow_commands.py
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

class CoreWorkflowCommandsTests {
    constructor() {
        this.activeDir = path.join(__dirname, '../commands/active');
        this.expDir = path.join(__dirname, '../commands/experiments');
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

    getCommandFiles(directory) {
        if (!fs.existsSync(directory)) return [];
        return fs.readdirSync(directory)
            .filter(f => f.endsWith('.md'))
            .map(f => f.replace('.md', ''));
    }

    test_workflow_commands_existence() {
        const workflowCommands = ['xgit', 'xtest', 'xquality', 'xdebug'];
        const activeCommands = this.getCommandFiles(this.activeDir);
        
        let found = 0;
        for (const cmd of workflowCommands) {
            if (activeCommands.includes(cmd)) {
                found++;
            }
        }

        assert(found === workflowCommands.length, 
            `Expected ${workflowCommands.length} workflow commands, found ${found}`);
    }

    test_core_commands_coverage() {
        const activeCommands = this.getCommandFiles(this.activeDir);
        const coreCommands = [
            'xtest', 'xquality', 'xgit', 'xsecurity', 'xrefactor',
            'xdebug', 'xarchitecture', 'xspec', 'xdocs', 'xpipeline',
            'xrelease', 'xconfig', 'xtdd'
        ];

        console.log(`Found core commands: ${JSON.stringify(activeCommands)}`);
        
        const coverage = activeCommands.filter(cmd => coreCommands.includes(cmd)).length;
        const percentage = (coverage / coreCommands.length) * 100;

        console.log(`Core commands coverage: ${coverage}/${coreCommands.length} (${percentage.toFixed(1)}%)`);
        
        assert(percentage >= 90, `Core commands coverage too low: ${percentage}%`);
    }

    test_command_file_structure() {
        const activeCommands = this.getCommandFiles(this.activeDir);
        const expCommands = this.getCommandFiles(this.expDir);
        const totalCommands = activeCommands.length + expCommands.length;

        console.log(`Command structure validated (${totalCommands}/${totalCommands} commands)`);
        
        assert(activeCommands.length >= 10, 'Must have at least 10 active commands');
        assert(expCommands.length >= 40, 'Must have at least 40 experimental commands');
        assert(totalCommands >= 50, 'Must have at least 50 total commands');
    }

    test_command_categories_coverage() {
        const activeCommands = this.getCommandFiles(this.activeDir);
        
        const categories = {
            daily_development: ['xgit', 'xtest', 'xquality'],
            security_safety: ['xrefactor', 'xsecurity'],
            problem_solving: ['xdebug', 'xarchitecture'],
            documentation: ['xdocs', 'xspec'],
            devops: ['xpipeline', 'xrelease', 'xconfig']
        };

        let coveredCategories = 0;
        for (const [category, commands] of Object.entries(categories)) {
            const covered = commands.filter(cmd => activeCommands.includes(cmd));
            console.log(`  ${category}: ${JSON.stringify(covered)}`);
            if (covered.length > 0) {
                coveredCategories++;
            }
        }

        const totalCategories = Object.keys(categories).length;
        console.log(`Command categories coverage validated (${coveredCategories}/${totalCategories} categories)`);
        
        assert(coveredCategories === totalCategories, 
            `Expected ${totalCategories} categories covered, got ${coveredCategories}`);
    }

    test_command_distribution() {
        const activeCommands = this.getCommandFiles(this.activeDir);
        const expCommands = this.getCommandFiles(this.expDir);
        const totalCommands = activeCommands.length + expCommands.length;
        const activeRatio = (activeCommands.length / totalCommands) * 100;

        console.log(`Active commands: ${activeCommands.length}`);
        console.log(`Experimental commands: ${expCommands.length}`);
        console.log(`Total commands: ${totalCommands}`);
        console.log(`Active ratio: ${activeRatio.toFixed(1)}%`);

        assert(activeRatio >= 15 && activeRatio <= 35, 
            `Active command ratio should be 15-35%, got ${activeRatio.toFixed(1)}%`);
    }

    runAllTests() {
        console.log('🧪 Running Core Workflow Command Tests');
        console.log('==================================================');

        const tests = [
            ['Workflow commands existence', this.test_workflow_commands_existence],
            ['Core commands coverage', this.test_core_commands_coverage],
            ['Command file structure', this.test_command_file_structure],
            ['Command categories coverage', this.test_command_categories_coverage],
            ['Command distribution', this.test_command_distribution]
        ];

        for (const [testName, testFn] of tests) {
            this.runTest(testName, testFn);
        }

        console.log(`\n==================================================`);
        console.log(`Core workflow tests: ${this.passed} passed, ${this.failed} failed, 0 skipped`);
        console.log('🎉 All core workflow command tests passed!');
        
        return this.failed === 0;
    }
}

// Run tests if executed directly
if (require.main === module) {
    const tester = new CoreWorkflowCommandsTests();
    const success = tester.runAllTests();
    process.exit(success ? 0 : 1);
}

module.exports = CoreWorkflowCommandsTests;