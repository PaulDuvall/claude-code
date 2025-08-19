#!/usr/bin/env node

/**
 * REQ-020: Installation Failure Recovery Tests
 * 
 * Requirements:
 * - IF installation fails at any step, THEN THE SYSTEM SHALL rollback changes 
 * - AND provide clear error messages with troubleshooting guidance
 * - System state is restored and error messages include actionable steps
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Test utilities
class TestEnvironment {
    constructor() {
        this.testDir = path.join(os.tmpdir(), `claude-test-${Date.now()}`);
        this.claudeDir = path.join(this.testDir, '.claude');
        this.commandsDir = path.join(this.claudeDir, 'commands');
        this.backupDir = path.join(this.claudeDir, '.backup');
        this.originalState = null;
    }

    setup() {
        fs.mkdirSync(this.testDir, { recursive: true });
        fs.mkdirSync(this.claudeDir, { recursive: true });
        fs.mkdirSync(this.commandsDir, { recursive: true });
        
        // Create some existing state to test rollback
        fs.writeFileSync(path.join(this.commandsDir, 'existing.md'), 'existing command');
        fs.writeFileSync(path.join(this.claudeDir, 'settings.json'), '{"existing": true}');
        
        this.originalState = this.captureState();
    }

    captureState() {
        const state = {
            commands: fs.readdirSync(this.commandsDir),
            settings: fs.existsSync(path.join(this.claudeDir, 'settings.json')) ? 
                      fs.readFileSync(path.join(this.claudeDir, 'settings.json'), 'utf8') : null,
            hasBackup: fs.existsSync(this.backupDir)
        };
        return state;
    }

    cleanup() {
        if (fs.existsSync(this.testDir)) {
            fs.rmSync(this.testDir, { recursive: true, force: true });
        }
    }
}

// Import the installer that we need to create
let FailureRecoveryInstaller;
try {
    FailureRecoveryInstaller = require('../lib/failure-recovery-installer.js');
} catch (error) {
    console.log('⚠️  failure-recovery-installer.js not found - will be created in GREEN phase');
    FailureRecoveryInstaller = null;
}

// Test Suite
class REQ020TestSuite {
    constructor() {
        this.testsPassed = 0;
        this.testsFailed = 0;
        this.testResults = [];
    }

    runTest(testName, testFn) {
        const env = new TestEnvironment();
        try {
            env.setup();
            console.log(`🧪 Running: ${testName}`);
            
            const result = testFn(env);
            if (result) {
                console.log(`✅ PASS: ${testName}`);
                this.testsPassed++;
                this.testResults.push({ test: testName, status: 'PASS', error: null });
            } else {
                console.log(`❌ FAIL: ${testName}`);
                this.testsFailed++;
                this.testResults.push({ test: testName, status: 'FAIL', error: 'Test returned false' });
            }
        } catch (error) {
            console.log(`❌ FAIL: ${testName} - ${error.message}`);
            this.testsFailed++;
            this.testResults.push({ test: testName, status: 'FAIL', error: error.message });
        } finally {
            env.cleanup();
        }
    }

    // TEST 1: System creates backup before installation
    testBackupCreation(env) {
        if (!FailureRecoveryInstaller) {
            throw new Error('FailureRecoveryInstaller not implemented yet');
        }

        const installer = new FailureRecoveryInstaller(env.claudeDir);
        installer.createBackup();
        
        // Should create backup directory with original state
        const backupExists = fs.existsSync(env.backupDir);
        const backupHasCommands = fs.existsSync(path.join(env.backupDir, 'commands'));
        const backupHasSettings = fs.existsSync(path.join(env.backupDir, 'settings.json'));
        
        return backupExists && backupHasCommands && backupHasSettings;
    }

    // TEST 2: System rolls back on command installation failure
    testCommandInstallationRollback(env) {
        if (!FailureRecoveryInstaller) {
            throw new Error('FailureRecoveryInstaller not implemented yet');
        }

        const installer = new FailureRecoveryInstaller(env.claudeDir);
        installer.createBackup();
        
        // Simulate command installation failure
        try {
            installer.installCommands([
                { name: 'valid.md', content: 'valid command' },
                { name: 'invalid.md', content: null } // This should cause failure
            ]);
        } catch (error) {
            // Installation should fail and rollback should occur
            const currentState = env.captureState();
            const stateRestored = JSON.stringify(currentState.commands.sort()) === JSON.stringify(env.originalState.commands.sort());
            const hasTroubleshooting = error.message.includes('troubleshooting') || 
                                     error.message.includes('Try:') || 
                                     error.message.includes('Solution:');
            
            console.log(`  Debug: State restored: ${stateRestored}, Has troubleshooting: ${hasTroubleshooting}`);
            console.log(`  Debug: Error message: ${error.message.substring(0, 100)}...`);
            
            return stateRestored && hasTroubleshooting;
        }
        
        return false; // Should have thrown error
    }

    // TEST 3: System rolls back on settings configuration failure  
    testSettingsConfigurationRollback(env) {
        if (!FailureRecoveryInstaller) {
            throw new Error('FailureRecoveryInstaller not implemented yet');
        }

        const installer = new FailureRecoveryInstaller(env.claudeDir);
        installer.createBackup();
        
        // Simulate settings configuration failure
        try {
            installer.configureSettings('invalid-json-content{{{');
        } catch (error) {
            const currentState = env.captureState();
            const stateRestored = JSON.stringify(currentState) === JSON.stringify(env.originalState);
            return stateRestored && error.message.includes('actionable steps');
        }
        
        return false;
    }

    // TEST 4: System rolls back on hook installation failure
    testHookInstallationRollback(env) {
        if (!FailureRecoveryInstaller) {
            throw new Error('FailureRecoveryInstaller not implemented yet');
        }

        const installer = new FailureRecoveryInstaller(env.claudeDir);
        installer.createBackup();
        
        // Create hooks directory in test environment
        const hooksDir = path.join(env.claudeDir, 'hooks');
        fs.mkdirSync(hooksDir, { recursive: true });
        
        try {
            installer.installHooks([
                { name: 'valid-hook.sh', content: '#!/bin/bash\necho "valid"', permissions: 0o755 },
                { name: 'invalid-hook.sh', content: null, permissions: 'invalid' }
            ]);
        } catch (error) {
            const currentState = env.captureState();
            const stateRestored = JSON.stringify(currentState) === JSON.stringify(env.originalState);
            return stateRestored && error.message.includes('troubleshooting guidance');
        }
        
        return false;
    }

    // TEST 5: Error messages include actionable troubleshooting steps
    testErrorMessageQuality(env) {
        if (!FailureRecoveryInstaller) {
            throw new Error('FailureRecoveryInstaller not implemented yet');
        }

        const installer = new FailureRecoveryInstaller(env.claudeDir);
        installer.createBackup(); // Need backup for rollback to work
        
        try {
            installer.installCommands([{ name: 'test.md', content: null }]);
        } catch (error) {
            const hasActionableSteps = error.message.includes('Try:') || 
                                     error.message.includes('Solution:') ||
                                     error.message.includes('Next steps:');
            const hasTroubleshooting = error.message.includes('troubleshooting') ||
                                     error.message.includes('resolve') ||
                                     error.message.includes('fix');
            const isDetailed = error.message.length > 50;
            
            console.log(`  Debug: Has actionable steps: ${hasActionableSteps}`);
            console.log(`  Debug: Has troubleshooting: ${hasTroubleshooting}`);
            console.log(`  Debug: Is detailed (>50 chars): ${isDetailed} (${error.message.length} chars)`);
            console.log(`  Debug: Error message: ${error.message.substring(0, 150)}...`);
            
            return hasActionableSteps && hasTroubleshooting && isDetailed;
        }
        
        return false;
    }

    // TEST 6: System handles partial installation gracefully
    testPartialInstallationRecovery(env) {
        if (!FailureRecoveryInstaller) {
            throw new Error('FailureRecoveryInstaller not implemented yet');
        }

        const installer = new FailureRecoveryInstaller(env.claudeDir);
        installer.createBackup();
        
        // Install some commands successfully, then fail
        const commands = [
            { name: 'success1.md', content: 'command 1' },
            { name: 'success2.md', content: 'command 2' },
            { name: 'failure.md', content: null } // This will fail
        ];
        
        try {
            installer.installCommands(commands);
        } catch (error) {
            // Check that even successfully installed commands are rolled back
            const commandFiles = fs.readdirSync(env.commandsDir);
            const noPartialInstall = !commandFiles.includes('success1.md') && 
                                   !commandFiles.includes('success2.md');
            const originalStateRestored = commandFiles.includes('existing.md');
            
            return noPartialInstall && originalStateRestored;
        }
        
        return false;
    }

    // TEST 7: Backup cleanup after successful installation
    testBackupCleanupAfterSuccess(env) {
        if (!FailureRecoveryInstaller) {
            throw new Error('FailureRecoveryInstaller not implemented yet');
        }

        const installer = new FailureRecoveryInstaller(env.claudeDir);
        installer.createBackup();
        
        // Successful installation should clean up backup
        installer.installCommands([{ name: 'new-command.md', content: 'new command content' }]);
        
        const backupCleaned = !fs.existsSync(env.backupDir);
        const commandInstalled = fs.existsSync(path.join(env.commandsDir, 'new-command.md'));
        
        return backupCleaned && commandInstalled;
    }

    runAllTests() {
        console.log('🔴 RED PHASE: Testing REQ-020 Installation Failure Recovery');
        console.log('================================================================');
        
        this.runTest('Backup Creation', (env) => this.testBackupCreation(env));
        this.runTest('Command Installation Rollback', (env) => this.testCommandInstallationRollback(env));
        this.runTest('Settings Configuration Rollback', (env) => this.testSettingsConfigurationRollback(env));
        this.runTest('Hook Installation Rollback', (env) => this.testHookInstallationRollback(env));
        this.runTest('Error Message Quality', (env) => this.testErrorMessageQuality(env));
        this.runTest('Partial Installation Recovery', (env) => this.testPartialInstallationRecovery(env));
        this.runTest('Backup Cleanup After Success', (env) => this.testBackupCleanupAfterSuccess(env));
        
        console.log('\n📊 Test Results Summary:');
        console.log(`✅ Passed: ${this.testsPassed}`);
        console.log(`❌ Failed: ${this.testsFailed}`);
        console.log(`📈 Success Rate: ${((this.testsPassed / (this.testsPassed + this.testsFailed)) * 100).toFixed(1)}%`);
        
        if (this.testsFailed > 0) {
            console.log('\n🔍 Failed Tests:');
            this.testResults.filter(r => r.status === 'FAIL').forEach(result => {
                console.log(`   • ${result.test}: ${result.error}`);
            });
        }
        
        return {
            passed: this.testsPassed,
            failed: this.testsFailed,
            successRate: (this.testsPassed / (this.testsPassed + this.testsFailed)) * 100
        };
    }
}

// Run tests if called directly
if (require.main === module) {
    const testSuite = new REQ020TestSuite();
    const results = testSuite.runAllTests();
    
    process.exit(results.failed > 0 ? 1 : 0);
}

module.exports = REQ020TestSuite;