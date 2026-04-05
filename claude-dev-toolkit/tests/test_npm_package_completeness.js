#!/usr/bin/env node

/**
 * Test: NPM Package Completeness
 *
 * Ensures the npm package includes all required directories and files,
 * preventing symlink issues that caused functionality to fail.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Shared constants — single source of truth for expected counts and files
const EXPECTED = {
    activeCommandCount: 17,
    experimentalCommandCount: 28,
    subagentCount: 25,
    templates: [
        'basic-settings.json',
        'comprehensive-settings.json',
        'security-focused-settings.json',
        'global-claude.md',
        'headless-examples.md'
    ],
    hooks: [
        'file-logger.sh',
        'on-error-debug.sh',
        'pre-commit-quality.sh',
        'pre-commit-test-runner.sh',
        'pre-write-security.sh',
        'prevent-credential-exposure.sh',
        'subagent-trigger.sh',
        'verify-before-edit.sh'
    ],
    requiredDirs: ['commands/', 'templates/', 'hooks/', 'subagents/']
};

const PACKAGE_ROOT = path.join(__dirname, '..');

class PackageCompletenessTest {
    constructor() {
        this.results = [];
        this.passed = 0;
        this.failed = 0;
    }

    log(message, type = 'info') {
        const prefix = { error: 'x', success: 'v', info: 'i' }[type] || 'i';
        console.log(`[${prefix}] ${message}`);
    }

    test(description, testFn) {
        try {
            const result = testFn();
            this.passed += result ? 1 : 0;
            this.failed += result ? 0 : 1;
            this.log(`${result ? 'PASS' : 'FAIL'}: ${description}`, result ? 'success' : 'error');
            this.results.push({ test: description, status: result ? 'PASS' : 'FAIL' });
        } catch (error) {
            this.log(`FAIL: ${description} - ${error.message}`, 'error');
            this.failed++;
            this.results.push({ test: description, status: 'FAIL', error: error.message });
        }
    }

    printSummary(label) {
        this.log(`\n${label}:`);
        this.log(`Passed: ${this.passed}, Failed: ${this.failed}, Total: ${this.passed + this.failed}`);
        const allPassed = this.failed === 0;
        this.log(allPassed ? 'All tests passed!' : 'Some tests failed.', allPassed ? 'success' : 'error');
        return allPassed;
    }

    resolveDir(subpath) {
        return path.join(PACKAGE_ROOT, subpath);
    }

    dirExistsAndNotSymlink(subpath) {
        const full = this.resolveDir(subpath);
        return fs.existsSync(full) && !fs.lstatSync(full).isSymbolicLink();
    }

    countMdFiles(subpath) {
        const dir = this.resolveDir(subpath);
        if (!fs.existsSync(dir)) return 0;
        return fs.readdirSync(dir).filter(f => f.endsWith('.md')).length;
    }

    allFilesExist(dir, filenames) {
        const base = this.resolveDir(dir);
        if (!fs.existsSync(base)) return false;
        return filenames.every(f => fs.existsSync(path.join(base, f)));
    }

    getPackOutput() {
        return execSync('npm pack --dry-run 2>&1', {
            encoding: 'utf-8',
            cwd: PACKAGE_ROOT,
            timeout: 30000
        });
    }

    runPackDirectoryTests(packOutput) {
        const dirs = ['commands/active/', 'commands/experiments/', 'templates/', 'hooks/', 'subagents/'];
        dirs.forEach(dir => {
            this.test(`npm pack includes ${dir}`, () => packOutput.includes(dir));
        });
    }

    runPackFileCountTests(packOutput) {
        this.test(`npm pack includes exactly ${EXPECTED.activeCommandCount} active commands`, () => {
            return (packOutput.match(/commands\/active\/.*\.md/g) || []).length === EXPECTED.activeCommandCount;
        });
        this.test(`npm pack includes exactly ${EXPECTED.experimentalCommandCount} experimental commands`, () => {
            return (packOutput.match(/commands\/experiments\/.*\.md/g) || []).length === EXPECTED.experimentalCommandCount;
        });
        this.test(`npm pack includes exactly ${EXPECTED.subagentCount} subagent files`, () => {
            return (packOutput.match(/subagents\/.*\.md/g) || []).length === EXPECTED.subagentCount;
        });
    }

    runPackExpectedFilesTests(packOutput) {
        this.test('npm pack includes expected templates', () => {
            return EXPECTED.templates.every(t => packOutput.includes(`templates/${t}`));
        });
        this.test('npm pack includes expected hooks', () => {
            return EXPECTED.hooks.every(h => packOutput.includes(`hooks/${h}`));
        });
    }

    runPackSymlinkTests() {
        ['commands', 'templates', 'hooks'].forEach(dir => {
            this.test(`${dir} directory is not a symlink`, () => this.dirExistsAndNotSymlink(dir));
        });
    }

    runPackSizeTests(packOutput) {
        this.test('Package builds without errors', () => {
            try {
                execSync('npm pack --silent 2>&1', { encoding: 'utf-8', cwd: PACKAGE_ROOT, timeout: 30000 });
                return true;
            } catch (_) {
                return false;
            }
        });
        this.test('Package size > 200KB', () => {
            const match = packOutput.match(/package size:\s*([0-9.]+)\s*kB/);
            return match ? parseFloat(match[1]) > 200 : false;
        });
        this.test('Package total files > 140', () => {
            const match = packOutput.match(/total files:\s*(\d+)/);
            return match ? parseInt(match[1]) > 140 : false;
        });
    }

    runAllTests() {
        this.log('Starting NPM Package Completeness Tests');

        let packOutput;
        try {
            packOutput = this.getPackOutput();
        } catch (_) {
            this.log('npm pack failed, falling back to filesystem checks.');
            this.runFileSystemTests();
            return this.failed === 0;
        }

        this.runPackDirectoryTests(packOutput);
        this.runPackFileCountTests(packOutput);
        this.runPackExpectedFilesTests(packOutput);
        this.runPackSymlinkTests();
        this.runPackSizeTests(packOutput);

        return this.printSummary('NPM Pack Test Summary');
    }

    runFsDirTests() {
        ['commands', 'templates', 'hooks'].forEach(dir => {
            this.test(`${dir} exists and is not a symlink`, () => this.dirExistsAndNotSymlink(dir));
        });
        this.test('subagents directory exists', () => fs.existsSync(this.resolveDir('subagents')));
    }

    runFsFileCountTests() {
        this.test(`commands/active contains ${EXPECTED.activeCommandCount} files`, () => {
            return this.countMdFiles('commands/active') === EXPECTED.activeCommandCount;
        });
        this.test(`commands/experiments contains ${EXPECTED.experimentalCommandCount} files`, () => {
            return this.countMdFiles('commands/experiments') === EXPECTED.experimentalCommandCount;
        });
        this.test(`subagents contains ${EXPECTED.subagentCount} files`, () => {
            return this.countMdFiles('subagents') === EXPECTED.subagentCount;
        });
        this.test('templates contains expected files', () => this.allFilesExist('templates', EXPECTED.templates));
        this.test('hooks contains expected files', () => this.allFilesExist('hooks', EXPECTED.hooks));
    }

    runFsPackageJsonTest() {
        this.test('package.json files array includes required dirs', () => {
            const pkgPath = path.join(PACKAGE_ROOT, 'package.json');
            if (!fs.existsSync(pkgPath)) return false;
            const files = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')).files || [];
            return EXPECTED.requiredDirs.every(d => files.includes(d));
        });
    }

    runFileSystemTests() {
        this.log('Running file system based tests (npm pack unavailable)');
        this.runFsDirTests();
        this.runFsFileCountTests();
        this.runFsPackageJsonTest();
        return this.printSummary('File System Test Summary');
    }
}

if (require.main === module) {
    const tester = new PackageCompletenessTest();
    const success = tester.runAllTests();
    process.exit(success ? 0 : 1);
}

module.exports = PackageCompletenessTest;
