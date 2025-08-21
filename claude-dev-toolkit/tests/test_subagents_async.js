#!/usr/bin/env node

/**
 * Async Subagents Test Suite
 * Tests for the new async functionality
 */

const assert = require('assert');
const path = require('path');
const { AsyncSubagentsManager, AsyncSubagentsCoreService } = require('../lib/subagents');

class AsyncSubagentsTests {
    constructor() {
        this.manager = new AsyncSubagentsManager();
        this.coreService = new AsyncSubagentsCoreService();
        this.passed = 0;
        this.failed = 0;
    }

    async runTest(testName, testFn) {
        try {
            await testFn.call(this);
            console.log(`✅ ${testName}`);
            this.passed++;
        } catch (error) {
            console.log(`❌ ${testName}: ${error.message}`);
            this.failed++;
        }
    }

    async test_async_get_available_subagents() {
        const result = await this.coreService.getAvailableSubagents();
        
        assert(result.isOk, 'Should successfully get available subagents');
        assert(Array.isArray(result.value), 'Should return an array');
        assert(result.value.length > 0, 'Should have subagents available');
        assert(result.value.every(f => f.endsWith('.md')), 'All files should be .md files');
    }

    async test_async_get_subagent_names() {
        const result = await this.coreService.getSubagentNames();
        
        assert(result.isOk, 'Should successfully get subagent names');
        assert(Array.isArray(result.value), 'Should return an array');
        assert(result.value.length > 0, 'Should have subagent names');
        assert(!result.value.some(name => name.includes('.md')), 'Names should not include .md extension');
    }

    async test_async_check_directory_structure() {
        const result = await this.coreService.checkDirectoryStructure();
        
        assert(result.isOk, 'Should successfully check directory structure');
        assert(typeof result.value === 'object', 'Should return an object');
        assert(typeof result.value.claudeDir === 'boolean', 'Should have claudeDir boolean');
        assert(typeof result.value.subagentsDir === 'boolean', 'Should have subagentsDir boolean');
    }

    async test_async_ensure_claude_directory() {
        const result = await this.coreService.ensureClaudeDirectory();
        
        assert(result.isOk, 'Should successfully ensure directory exists');
        assert(typeof result.value === 'object', 'Should return an object');
        assert(typeof result.value.created === 'boolean', 'Should have created boolean');
        assert(typeof result.value.path === 'string', 'Should have path string');
    }

    async test_async_installation_status() {
        const result = await this.coreService.getInstallationStatus();
        
        assert(result.isOk, 'Should successfully get installation status');
        assert(typeof result.value === 'object', 'Should return status object');
        assert(typeof result.value.available === 'number', 'Should have available count');
        assert(typeof result.value.installed === 'number', 'Should have installed count');
        assert(typeof result.value.directories === 'object', 'Should have directories object');
        assert(typeof result.value.paths === 'object', 'Should have paths object');
    }

    async test_async_validation() {
        // Ensure something is installed first
        await this.coreService.ensureClaudeDirectory();
        
        const result = await this.coreService.validateInstallation();
        
        assert(result.isOk, 'Should successfully validate installation');
        assert(typeof result.value === 'object', 'Should return validation object');
        assert(typeof result.value.valid === 'boolean', 'Should have valid boolean');
        assert(typeof result.value.installedCount === 'number', 'Should have installed count');
        assert(Array.isArray(result.value.issues), 'Should have issues array');
    }

    async test_manager_async_methods() {
        // Test that async methods are available and callable
        assert(typeof this.manager.getStatusAsync === 'function', 'Should have getStatusAsync method');
        assert(typeof this.manager.validateInstallationAsync === 'function', 'Should have validateInstallationAsync method');
        assert(typeof this.manager.getAvailableSubagentsAsync === 'function', 'Should have getAvailableSubagentsAsync method');
        
        // Test that they return promises
        const statusPromise = this.manager.getStatusAsync();
        assert(statusPromise instanceof Promise, 'getStatusAsync should return a Promise');
        
        const status = await statusPromise;
        assert(status.isOk || status.isError, 'Should return a Result object');
    }

    async test_backward_compatibility() {
        // Test that sync methods still work
        assert(typeof this.manager.handleCommand === 'function', 'Should have sync handleCommand');
        assert(typeof this.manager.listAvailableSubagents === 'function', 'Should have sync listAvailableSubagents');
        assert(typeof this.manager.installSubagents === 'function', 'Should have sync installSubagents');
        assert(typeof this.manager.showHelp === 'function', 'Should have sync showHelp');
        
        // Test that help works (doesn't throw)
        const helpResult = this.manager.showHelp();
        assert(typeof helpResult === 'boolean', 'showHelp should return boolean');
    }

    async runAllTests() {
        console.log('🚀 Async Subagents Test Suite');
        console.log('===============================');

        const tests = [
            ['Async get available subagents', this.test_async_get_available_subagents],
            ['Async get subagent names', this.test_async_get_subagent_names],
            ['Async check directory structure', this.test_async_check_directory_structure],
            ['Async ensure Claude directory', this.test_async_ensure_claude_directory],
            ['Async installation status', this.test_async_installation_status],
            ['Async validation', this.test_async_validation],
            ['Manager async methods', this.test_manager_async_methods],
            ['Backward compatibility', this.test_backward_compatibility]
        ];

        for (const [testName, testFn] of tests) {
            await this.runTest(testName, testFn);
        }

        console.log(`\n📊 Results: ${this.passed} passed, ${this.failed} failed`);
        return this.failed === 0;
    }
}

// Run tests if executed directly
if (require.main === module) {
    (async () => {
        const tester = new AsyncSubagentsTests();
        const success = await tester.runAllTests();
        process.exit(success ? 0 : 1);
    })();
}

module.exports = AsyncSubagentsTests;