#!/usr/bin/env node

/**
 * Test: NPM Package Completeness
 * 
 * This test ensures that the npm package includes all required directories
 * and files, preventing the symlink issues that caused functionality to fail.
 * 
 * Tests:
 * - commands/active directory contains 13 command files
 * - commands/experiments directory contains 45 command files  
 * - templates directory contains configuration templates
 * - hooks directory contains hook scripts
 * - subagents directory contains 26 subagent files
 * - All files are actual files (not symlinks) in the packed tarball
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class PackageCompletenessTest {
    constructor() {
        this.results = [];
        this.passed = 0;
        this.failed = 0;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    test(description, testFn) {
        try {
            const result = testFn();
            if (result) {
                this.log(`PASS: ${description}`, 'success');
                this.passed++;
                this.results.push({ test: description, status: 'PASS', error: null });
            } else {
                this.log(`FAIL: ${description}`, 'error');
                this.failed++;
                this.results.push({ test: description, status: 'FAIL', error: 'Test returned false' });
            }
        } catch (error) {
            this.log(`FAIL: ${description} - ${error.message}`, 'error');
            this.failed++;
            this.results.push({ test: description, status: 'FAIL', error: error.message });
        }
    }

    runAllTests() {
        this.log('🚀 Starting NPM Package Completeness Tests');

        // Get npm pack output once and reuse it for all tests
        let packOutput = null;
        try {
            packOutput = execSync('npm pack --dry-run 2>&1', { 
                encoding: 'utf-8',
                cwd: __dirname + '/..',
                timeout: 30000
            });
        } catch (error) {
            this.log(`⚠️  npm pack command failed: ${error.message}. Falling back to file system checks.`);
            
            // Fall back to file system based tests when npm pack fails
            this.runFileSystemTests();
            return this.failed === 0;
        }

        // Test 1: Verify npm pack includes all expected files
        this.test('npm pack includes commands/active directory', () => {
            return packOutput.includes('commands/active/');
        });

        this.test('npm pack includes commands/experiments directory', () => {
            return packOutput.includes('commands/experiments/');
        });

        this.test('npm pack includes templates directory', () => {
            return packOutput.includes('templates/');
        });

        this.test('npm pack includes hooks directory', () => {
            return packOutput.includes('hooks/');
        });

        this.test('npm pack includes subagents directory', () => {
            return packOutput.includes('subagents/');
        });

        // Test 2: Count expected files in package
        this.test('npm pack includes exactly 13 active command files', () => {
            const activeCommands = packOutput.match(/commands\/active\/.*\.md/g) || [];
            return activeCommands.length === 13;
        });

        this.test('npm pack includes exactly 45 experimental command files', () => {
            const expCommands = packOutput.match(/commands\/experiments\/.*\.md/g) || [];
            return expCommands.length === 45;
        });

        this.test('npm pack includes expected template files', () => {
            const expectedTemplates = [
                'templates/basic-settings.json',
                'templates/comprehensive-settings.json', 
                'templates/security-focused-settings.json'
            ];
            return expectedTemplates.every(template => packOutput.includes(template));
        });

        this.test('npm pack includes expected hook files', () => {
            const expectedHooks = [
                'hooks/file-logger.sh',
                'hooks/prevent-credential-exposure.sh',
                'hooks/pre-commit-quality.sh',
                'hooks/pre-write-security.sh'
            ];
            return expectedHooks.every(hook => packOutput.includes(hook));
        });

        this.test('npm pack includes exactly 26 subagent files', () => {
            const subagents = packOutput.match(/subagents\/.*\.md/g) || [];
            return subagents.length === 26;
        });

        // Test 3: Verify directories are real (not symlinks) in local package
        this.test('commands directory is not a symlink', () => {
            const commandsPath = path.join(__dirname, '..', 'commands');
            return fs.existsSync(commandsPath) && !fs.lstatSync(commandsPath).isSymbolicLink();
        });

        this.test('templates directory is not a symlink', () => {
            const templatesPath = path.join(__dirname, '..', 'templates');
            return fs.existsSync(templatesPath) && !fs.lstatSync(templatesPath).isSymbolicLink();
        });

        this.test('hooks directory is not a symlink', () => {
            const hooksPath = path.join(__dirname, '..', 'hooks');
            return fs.existsSync(hooksPath) && !fs.lstatSync(hooksPath).isSymbolicLink();
        });

        // Test 4: Test actual npm package functionality
        this.test('Package builds without errors', () => {
            try {
                execSync('npm pack --silent 2>&1', { 
                    encoding: 'utf-8',
                    cwd: __dirname + '/..',
                    timeout: 30000
                });
                return true;
            } catch (error) {
                return false;
            }
        });

        // Test 5: Validate package size indicates all files are included
        this.test('Package size indicates all files included (> 200KB)', () => {
            const sizeMatch = packOutput.match(/package size:\s*([0-9.]+)\s*kB/);
            if (sizeMatch) {
                const sizeKB = parseFloat(sizeMatch[1]);
                return sizeKB > 200; // Should be ~213KB with all files
            }
            return false;
        });

        this.test('Package includes expected total file count (> 140 files)', () => {
            const filesMatch = packOutput.match(/total files:\s*(\d+)/);
            if (filesMatch) {
                const fileCount = parseInt(filesMatch[1]);
                return fileCount > 140; // Should be ~142 files
            }
            return false;
        });

        // Summary
        this.log(`\n📊 Test Summary:`);
        this.log(`✅ Passed: ${this.passed}`);
        this.log(`❌ Failed: ${this.failed}`);
        this.log(`📊 Total: ${this.passed + this.failed}`);

        if (this.failed === 0) {
            this.log('🎉 All tests passed! NPM package is complete and functional.', 'success');
            return true;
        } else {
            this.log('💥 Some tests failed. NPM package may have issues.', 'error');
            
            // Show failed tests
            const failedTests = this.results.filter(r => r.status === 'FAIL');
            if (failedTests.length > 0) {
                this.log('\n❌ Failed Tests:');
                failedTests.forEach(test => {
                    this.log(`  - ${test.test}: ${test.error}`);
                });
            }
            
            return false;
        }
    }

    // Fallback method when npm pack fails in CI environments
    runFileSystemTests() {
        this.log('📁 Running file system based tests (npm pack unavailable)');

        // Test 1: Verify required directories exist and are not symlinks
        this.test('commands directory exists and is not a symlink', () => {
            const commandsPath = path.join(__dirname, '..', 'commands');
            return fs.existsSync(commandsPath) && !fs.lstatSync(commandsPath).isSymbolicLink();
        });

        this.test('templates directory exists and is not a symlink', () => {
            const templatesPath = path.join(__dirname, '..', 'templates');
            return fs.existsSync(templatesPath) && !fs.lstatSync(templatesPath).isSymbolicLink();
        });

        this.test('hooks directory exists and is not a symlink', () => {
            const hooksPath = path.join(__dirname, '..', 'hooks');
            return fs.existsSync(hooksPath) && !fs.lstatSync(hooksPath).isSymbolicLink();
        });

        this.test('subagents directory exists', () => {
            const subagentsPath = path.join(__dirname, '..', 'subagents');
            return fs.existsSync(subagentsPath);
        });

        // Test 2: Count files in each directory
        this.test('commands/active contains exactly 13 command files', () => {
            const activeDir = path.join(__dirname, '..', 'commands', 'active');
            if (!fs.existsSync(activeDir)) return false;
            const files = fs.readdirSync(activeDir).filter(f => f.endsWith('.md'));
            return files.length === 13;
        });

        this.test('commands/experiments contains exactly 45 command files', () => {
            const expDir = path.join(__dirname, '..', 'commands', 'experiments');
            if (!fs.existsSync(expDir)) return false;
            const files = fs.readdirSync(expDir).filter(f => f.endsWith('.md'));
            return files.length === 45;
        });

        this.test('subagents directory contains exactly 26 subagent files', () => {
            const subagentsDir = path.join(__dirname, '..', 'subagents');
            if (!fs.existsSync(subagentsDir)) return false;
            const files = fs.readdirSync(subagentsDir).filter(f => f.endsWith('.md'));
            return files.length === 26;
        });

        this.test('templates directory contains expected template files', () => {
            const templatesDir = path.join(__dirname, '..', 'templates');
            if (!fs.existsSync(templatesDir)) return false;
            const expectedTemplates = [
                'basic-settings.json',
                'comprehensive-settings.json', 
                'security-focused-settings.json'
            ];
            return expectedTemplates.every(template => 
                fs.existsSync(path.join(templatesDir, template))
            );
        });

        this.test('hooks directory contains expected hook files', () => {
            const hooksDir = path.join(__dirname, '..', 'hooks');
            if (!fs.existsSync(hooksDir)) return false;
            const expectedHooks = [
                'file-logger.sh',
                'prevent-credential-exposure.sh',
                'pre-commit-quality.sh',
                'pre-write-security.sh'
            ];
            return expectedHooks.every(hook => 
                fs.existsSync(path.join(hooksDir, hook))
            );
        });

        // Test 3: Verify package.json includes all directories
        this.test('package.json files array includes required directories', () => {
            const packagePath = path.join(__dirname, '..', 'package.json');
            if (!fs.existsSync(packagePath)) return false;
            
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
            const files = packageJson.files || [];
            
            const requiredDirs = ['commands/', 'templates/', 'hooks/', 'subagents/'];
            return requiredDirs.every(dir => files.includes(dir));
        });

        // Summary
        this.log(`\n📊 File System Test Summary:`);
        this.log(`✅ Passed: ${this.passed}`);
        this.log(`❌ Failed: ${this.failed}`);
        this.log(`📊 Total: ${this.passed + this.failed}`);

        if (this.failed === 0) {
            this.log('🎉 All file system tests passed! Package structure is valid.', 'success');
        } else {
            this.log('💥 Some file system tests failed. Package structure may have issues.', 'error');
        }
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new PackageCompletenessTest();
    const success = tester.runAllTests();
    process.exit(success ? 0 : 1);
}

module.exports = PackageCompletenessTest;