#!/usr/bin/env node

/**
 * REQ-053: Public NPM Registry Publication Test Suite
 * Tests for automated public npm publish workflow with version tagging
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PublicNpmPublicationTests {
    constructor() {
        this.scriptsDir = path.join(__dirname, '../scripts/publishing');
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

    test_publish_public_script_exists() {
        const scriptPath = path.join(this.scriptsDir, 'publish-public.sh');
        assert(fs.existsSync(scriptPath), 'publish-public.sh script must exist');
        
        // Check script is executable
        const stats = fs.statSync(scriptPath);
        assert(stats.mode & 0o111, 'publish-public.sh must be executable');
    }

    test_publish_public_script_has_proper_structure() {
        const scriptPath = path.join(this.scriptsDir, 'publish-public.sh');
        const content = fs.readFileSync(scriptPath, 'utf8');
        
        // Check for required components
        assert(content.includes('#!/bin/bash'), 'Script must have proper shebang');
        assert(content.includes('set -e'), 'Script must have error handling');
        assert(content.includes('npmjs.org'), 'Script must reference public npm registry');
        assert(content.includes('npm publish'), 'Script must include npm publish command');
        assert(content.includes('git tag'), 'Script must include git tagging');
    }

    test_automated_public_workflow_exists() {
        const workflowPath = path.join(__dirname, '../../.github/workflows/npm-publish-simple.yml');
        assert(fs.existsSync(workflowPath), 'GitHub Actions workflow for NPM publishing must exist');
        
        const content = fs.readFileSync(workflowPath, 'utf8');
        assert(content.includes('npm publish'), 'Workflow must include npm publish step');
        assert(content.includes('registry.npmjs.org'), 'Workflow must target public npm registry');
        assert(content.includes('workflow_dispatch'), 'Workflow must be manually triggerable');
        assert(content.includes('npm_token'), 'Workflow must have NPM token input');
    }

    test_version_tagging_automation() {
        const scriptPath = path.join(this.scriptsDir, 'publish-public.sh');
        const content = fs.readFileSync(scriptPath, 'utf8');
        
        // Check for version extraction and tagging
        assert(content.includes('git tag'), 'Script must create git tags');
        assert(content.includes('git push'), 'Script must push tags to remote');
        assert(content.includes('$(cat package.json'), 'Script must extract version from package.json');
    }

    test_public_registry_authentication_setup() {
        const scriptPath = path.join(this.scriptsDir, 'publish-public.sh');
        const content = fs.readFileSync(scriptPath, 'utf8');
        
        // Check for NPM authentication handling
        assert(content.includes('npm whoami'), 'Script must check authentication status');
        assert(content.includes('registry.npmjs.org'), 'Script must reference public registry');
        assert(content.includes('NPM_TOKEN') || content.includes('npm login'), 'Script must handle authentication');
    }

    test_package_preparation_for_public_registry() {
        const scriptPath = path.join(this.scriptsDir, 'publish-public.sh');
        const content = fs.readFileSync(scriptPath, 'utf8');
        
        // Check package.json is properly configured for public registry
        assert(content.includes('publishConfig'), 'Script must configure publishConfig for public registry');
        assert(content.includes('claude-dev-toolkit'), 'Script must use correct package name for public registry');
    }

    test_validation_before_public_publish() {
        const scriptPath = path.join(this.scriptsDir, 'publish-public.sh');
        const content = fs.readFileSync(scriptPath, 'utf8');
        
        // Check that validation runs before publishing
        assert(content.includes('npm run validate'), 'Script must run validation before publishing');
        assert(content.includes('npm pack'), 'Script must verify package creation');
    }

    test_rollback_capability_exists() {
        const scriptPath = path.join(this.scriptsDir, 'publish-public.sh');
        const content = fs.readFileSync(scriptPath, 'utf8');
        
        // Check for error handling and rollback
        assert(content.includes('trap') && content.includes('cleanup'), 'Script must have cleanup/rollback mechanism with trap');
        assert(content.includes('package.json.backup'), 'Script must backup package.json for rollback');
    }

    test_publishing_documentation_exists() {
        const docPath = path.join(this.scriptsDir, 'README-PUBLISHING.md');
        assert(fs.existsSync(docPath), 'Publishing documentation must exist');
        
        const content = fs.readFileSync(docPath, 'utf8');
        assert(content.includes('Authentication Setup'), 'Documentation must include authentication setup');
        assert(content.includes('Publishing Workflow'), 'Documentation must include publishing workflow');
        assert(content.includes('Security Best Practices'), 'Documentation must include security practices');
    }

    test_authentication_setup_script_exists() {
        const authPath = path.join(this.scriptsDir, 'setup-public-auth.sh');
        assert(fs.existsSync(authPath), 'Authentication setup script must exist');
        
        const stats = fs.statSync(authPath);
        assert(stats.mode & 0o111, 'setup-public-auth.sh must be executable');
        
        const content = fs.readFileSync(authPath, 'utf8');
        assert(content.includes('npm login'), 'Auth script must support interactive login');
        assert(content.includes('NPM_TOKEN'), 'Auth script must support token authentication');
    }

    runAllTests() {
        console.log('🧪 REQ-053: Public NPM Registry Publication Test Suite');
        console.log('=======================================================');

        const tests = [
            ['publish-public.sh script exists', this.test_publish_public_script_exists],
            ['publish-public.sh has proper structure', this.test_publish_public_script_has_proper_structure],
            ['Automated public workflow exists', this.test_automated_public_workflow_exists],
            ['Version tagging automation', this.test_version_tagging_automation],
            ['Public registry authentication setup', this.test_public_registry_authentication_setup],
            ['Package preparation for public registry', this.test_package_preparation_for_public_registry],
            ['Validation before public publish', this.test_validation_before_public_publish],
            ['Rollback capability exists', this.test_rollback_capability_exists],
            ['Publishing documentation exists', this.test_publishing_documentation_exists],
            ['Authentication setup script exists', this.test_authentication_setup_script_exists]
        ];

        for (const [testName, testFn] of tests) {
            this.runTest(testName, testFn);
        }

        console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
        
        if (this.failed > 0) {
            console.log('\n🔴 REQ-053: Public NPM Registry Publication tests FAILED');
            console.log('Missing features need to be implemented:');
            console.log('  - Public NPM registry publication script');
            console.log('  - Automated public npm publish workflow');
            console.log('  - Version tagging automation');
            console.log('  - Public registry authentication setup');
            return false;
        }
        
        console.log('\n✅ All REQ-053 tests passed!');
        return true;
    }
}

// Run tests if executed directly
if (require.main === module) {
    const tester = new PublicNpmPublicationTests();
    const success = tester.runAllTests();
    process.exit(success ? 0 : 1);
}

module.exports = PublicNpmPublicationTests;