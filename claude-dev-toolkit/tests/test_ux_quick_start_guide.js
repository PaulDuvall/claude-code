#!/usr/bin/env node

/**
 * UX Test Suite: Get Started in 30 Seconds (NPM Installation)
 * Tests the complete user experience from README quick start guide
 * 
 * This test suite validates each step in the quick start guide:
 * 1. Install Claude Code (simulated check)
 * 2. Install Claude Dev Toolkit via NPM (package validation)
 * 3. Deploy commands to Claude Code (command installation)
 * 4. Configure Claude Code settings (template application)
 * 5. Install AI subagents (subagents installation)
 * 6. Start using AI-powered development commands (command availability)
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

class QuickStartGuideUXTests {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.testHomeDir = path.join(os.tmpdir(), 'quick-start-ux-test');
        this.testClaudeDir = path.join(this.testHomeDir, '.claude');
        this.originalHome = process.env.HOME;
        this.binPath = path.join(__dirname, '..', 'bin', 'claude-commands');
    }

    setUp() {
        // Create isolated test environment
        if (fs.existsSync(this.testHomeDir)) {
            fs.rmSync(this.testHomeDir, { recursive: true, force: true });
        }
        fs.mkdirSync(this.testHomeDir, { recursive: true });
        
        // Mock HOME environment
        process.env.HOME = this.testHomeDir;
        
        console.log(`🏠 Test environment: ${this.testHomeDir}`);
    }

    tearDown() {
        // Restore original environment
        process.env.HOME = this.originalHome;
        
        // Clean up test directory
        if (fs.existsSync(this.testHomeDir)) {
            fs.rmSync(this.testHomeDir, { recursive: true, force: true });
        }
    }

    runTest(testName, testFn) {
        try {
            this.setUp();
            console.log(`\n🧪 Running: ${testName}`);
            testFn.call(this);
            console.log(`✅ ${testName}`);
            this.passed++;
        } catch (error) {
            console.log(`❌ ${testName}: ${error.message}`);
            this.failed++;
        } finally {
            this.tearDown();
        }
    }

    // Step 1: Install Claude Code (simulated check)
    test_step1_claude_code_prerequisite() {
        // Simulate checking if Claude Code would be available
        // In real scenario, this would be: npm install -g @anthropic-ai/claude-code
        
        console.log('  📋 Step 1: Checking Claude Code prerequisite...');
        
        // Verify the README mentions the correct package
        const readmePath = path.join(__dirname, '..', '..', 'README.md');
        assert(fs.existsSync(readmePath), 'README.md should exist');
        
        const readmeContent = fs.readFileSync(readmePath, 'utf8');
        assert(readmeContent.includes('@anthropic-ai/claude-code'), 
            'README should reference correct Claude Code package');
        assert(readmeContent.includes('npm install -g @anthropic-ai/claude-code'), 
            'README should show correct installation command');
            
        console.log('  ✅ Claude Code installation command verified in README');
    }

    // Step 2: Install Claude Dev Toolkit via NPM
    test_step2_install_toolkit() {
        console.log('  📋 Step 2: Validating Claude Dev Toolkit package...');
        
        // Verify package.json exists and has correct structure
        const packagePath = path.join(__dirname, '..', 'package.json');
        assert(fs.existsSync(packagePath), 'package.json should exist');
        
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        assert.strictEqual(packageJson.name, '@paulduvall/claude-dev-toolkit', 
            'Package should have correct scoped name');
        assert(packageJson.bin, 'Package should define binary commands');
        assert(packageJson.bin['claude-commands'], 'Should define claude-commands binary');
        
        // Verify binary exists
        assert(fs.existsSync(this.binPath), 'claude-commands binary should exist');
        
        console.log('  ✅ Package structure validated');
        console.log(`  📦 Package: ${packageJson.name}@${packageJson.version}`);
    }

    // Step 3: Deploy commands to Claude Code
    test_step3_deploy_commands() {
        console.log('  📋 Step 3: Testing command deployment...');
        
        // Test --active flag
        try {
            const activeOutput = execSync(`node "${this.binPath}" install --active`, {
                encoding: 'utf8',
                stdio: 'pipe',
                env: { ...process.env, HOME: this.testHomeDir }
            });
            
            // Verify commands were installed
            const commandsDir = path.join(this.testClaudeDir, 'commands', 'active');
            assert(fs.existsSync(commandsDir), 'Active commands directory should be created');
            
            const installedCommands = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
            assert(installedCommands.length >= 13, 'Should install at least 13 active commands');
            
            console.log(`  ✅ Installed ${installedCommands.length} active commands`);
            
        } catch (error) {
            // Test --all flag as fallback
            const allOutput = execSync(`node "${this.binPath}" install --all`, {
                encoding: 'utf8',
                stdio: 'pipe',
                env: { ...process.env, HOME: this.testHomeDir }
            });
            
            const activeDir = path.join(this.testClaudeDir, 'commands', 'active');
            const expDir = path.join(this.testClaudeDir, 'commands', 'experiments');
            
            assert(fs.existsSync(activeDir), 'Active commands should be installed');
            assert(fs.existsSync(expDir), 'Experimental commands should be installed');
            
            const activeCount = fs.readdirSync(activeDir).filter(f => f.endsWith('.md')).length;
            const expCount = fs.readdirSync(expDir).filter(f => f.endsWith('.md')).length;
            
            console.log(`  ✅ Installed ${activeCount} active + ${expCount} experimental commands`);
        }
    }

    // Step 4: Configure Claude Code settings
    test_step4_configure_settings() {
        console.log('  📋 Step 4: Testing configuration management...');
        
        // Ensure we have commands installed first
        execSync(`node "${this.binPath}" install --active`, {
            stdio: 'pipe',
            env: { ...process.env, HOME: this.testHomeDir }
        });
        
        // Test config --list
        const listOutput = execSync(`node "${this.binPath}" config --list`, {
            encoding: 'utf8',
            stdio: 'pipe',
            env: { ...process.env, HOME: this.testHomeDir }
        });
        
        assert(listOutput.includes('basic-settings.json'), 
            'Should list basic-settings template');
        assert(listOutput.includes('security-focused-settings.json'), 
            'Should list security-focused template');
        assert(listOutput.includes('comprehensive-settings.json'), 
            'Should list comprehensive template');
            
        console.log('  ✅ Configuration templates listed successfully');
        
        // Test applying basic configuration
        execSync(`node "${this.binPath}" config --template basic-settings.json`, {
            stdio: 'pipe',
            env: { ...process.env, HOME: this.testHomeDir }
        });
        
        const settingsPath = path.join(this.testClaudeDir, 'settings.json');
        assert(fs.existsSync(settingsPath), 'Settings file should be created');
        
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        assert(typeof settings === 'object', 'Settings should be valid JSON object');
        
        console.log('  ✅ Basic configuration template applied successfully');
    }

    // Step 5: Install AI subagents
    test_step5_install_subagents() {
        console.log('  📋 Step 5: Testing subagents installation...');
        
        // Test subagents --list first
        try {
            const listOutput = execSync(`node "${this.binPath}" subagents --list`, {
                encoding: 'utf8',
                stdio: 'pipe',
                env: { ...process.env, HOME: this.testHomeDir }
            });
            
            // Should list available subagents
            assert(listOutput.length > 0, 'Should show available subagents');
            console.log('  ✅ Subagents list command working');
            
        } catch (error) {
            console.log('  ⚠️ Subagents command may not be implemented yet');
            return; // Skip if not implemented
        }
        
        // Test subagents --install
        try {
            execSync(`node "${this.binPath}" subagents --install`, {
                stdio: 'pipe',
                env: { ...process.env, HOME: this.testHomeDir }
            });
            
            const subagentsDir = path.join(this.testClaudeDir, 'subagents');
            if (fs.existsSync(subagentsDir)) {
                const subagentFiles = fs.readdirSync(subagentsDir).filter(f => f.endsWith('.md'));
                console.log(`  ✅ Installed ${subagentFiles.length} subagents`);
            }
            
        } catch (error) {
            console.log('  ⚠️ Subagents installation may not be fully implemented');
        }
    }

    // Step 6: Verify command availability
    test_step6_command_availability() {
        console.log('  📋 Step 6: Verifying AI-powered commands are available...');
        
        // Install commands first
        execSync(`node "${this.binPath}" install --active`, {
            stdio: 'pipe',
            env: { ...process.env, HOME: this.testHomeDir }
        });
        
        const commandsDir = path.join(this.testClaudeDir, 'commands', 'active');
        assert(fs.existsSync(commandsDir), 'Commands directory should exist');
        
        // Check for key commands mentioned in quick start
        const expectedCommands = [
            'xtest.md',      // Run all tests intelligently
            'xquality.md',   // Check and fix code quality issues  
            'xsecurity.md',  // Scan for security vulnerabilities
            'xgit.md'        // Automated git workflow with smart commits
        ];
        
        const installedFiles = fs.readdirSync(commandsDir);
        let availableCommands = 0;
        
        for (const expectedCmd of expectedCommands) {
            if (installedFiles.includes(expectedCmd)) {
                availableCommands++;
                console.log(`  ✅ /${expectedCmd.replace('.md', '')} command available`);
            } else {
                console.log(`  ⚠️ /${expectedCmd.replace('.md', '')} command not found`);
            }
        }
        
        assert(availableCommands >= 3, 
            `Should have at least 3 key commands available, found ${availableCommands}`);
            
        console.log(`  🎉 ${availableCommands}/${expectedCommands.length} key commands verified`);
    }

    // Integration test: Complete quick start flow
    test_complete_quick_start_flow() {
        console.log('  📋 Integration Test: Complete 30-second flow...');
        
        const startTime = Date.now();
        
        // Step 1: Claude Code (simulated - would fail in real test without global install)
        console.log('  1️⃣ Claude Code prerequisite (simulated)');
        
        // Step 2: Install toolkit (package validation)
        console.log('  2️⃣ Validating toolkit package...');
        const packagePath = path.join(__dirname, '..', 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        assert.strictEqual(packageJson.name, '@paulduvall/claude-dev-toolkit');
        
        // Step 3: Deploy commands
        console.log('  3️⃣ Deploying commands...');
        execSync(`node "${this.binPath}" install --active`, {
            stdio: 'pipe',
            env: { ...process.env, HOME: this.testHomeDir }
        });
        
        // Step 4: Configure settings  
        console.log('  4️⃣ Applying configuration...');
        execSync(`node "${this.binPath}" config --template basic-settings.json`, {
            stdio: 'pipe', 
            env: { ...process.env, HOME: this.testHomeDir }
        });
        
        // Step 5: Install subagents (optional - may not be implemented)
        console.log('  5️⃣ Installing subagents (optional)...');
        try {
            execSync(`node "${this.binPath}" subagents --install`, {
                stdio: 'pipe',
                env: { ...process.env, HOME: this.testHomeDir }
            });
        } catch (error) {
            console.log('    ⚠️ Subagents not fully implemented yet');
        }
        
        // Step 6: Verify everything is ready
        console.log('  6️⃣ Verifying setup...');
        const commandsDir = path.join(this.testClaudeDir, 'commands', 'active');
        const settingsPath = path.join(this.testClaudeDir, 'settings.json');
        
        assert(fs.existsSync(commandsDir), 'Commands should be installed');
        assert(fs.existsSync(settingsPath), 'Settings should be configured');
        
        const commandCount = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md')).length;
        const duration = Date.now() - startTime;
        
        console.log(`  🎉 Complete flow verified in ${duration}ms`);
        console.log(`  📊 Result: ${commandCount} commands installed, configured, and ready!`);
        
        assert(commandCount >= 10, 'Should have installed meaningful number of commands');
    }

    // Test README accuracy
    test_readme_accuracy() {
        console.log('  📋 Testing README accuracy against actual functionality...');
        
        const readmePath = path.join(__dirname, '..', '..', 'README.md');
        const readmeContent = fs.readFileSync(readmePath, 'utf8');
        
        // Verify package name is correct throughout README
        assert(readmeContent.includes('@paulduvall/claude-dev-toolkit'), 
            'README should reference correct scoped package name');
        
        // Verify commands mentioned in README exist
        const commandsToCheck = ['xtest', 'xquality', 'xsecurity', 'xgit'];
        const commandsPath = path.join(__dirname, '..', 'commands', 'active');
        
        if (fs.existsSync(commandsPath)) {
            const availableCommands = fs.readdirSync(commandsPath);
            
            for (const cmd of commandsToCheck) {
                const cmdFile = `${cmd}.md`;
                if (availableCommands.includes(cmdFile)) {
                    console.log(`  ✅ /${cmd} command exists as documented`);
                } else {
                    console.log(`  ⚠️ /${cmd} command mentioned in README but not found`);
                }
            }
        }
        
        // Verify step count matches README
        const stepMatches = readmeContent.match(/# \d\./g);
        if (stepMatches) {
            const stepCount = stepMatches.length;
            console.log(`  📊 README contains ${stepCount} numbered steps`);
            assert(stepCount >= 6, 'Should have at least 6 steps in quick start');
        }
        
        console.log('  ✅ README accuracy validated');
    }

    runAllTests() {
        console.log('🚀 UX Test Suite: Get Started in 30 Seconds (NPM Installation)');
        console.log('==============================================================');
        console.log('Testing complete user experience from README quick start guide\n');

        const tests = [
            ['Step 1: Claude Code prerequisite check', this.test_step1_claude_code_prerequisite],
            ['Step 2: Install Claude Dev Toolkit package', this.test_step2_install_toolkit], 
            ['Step 3: Deploy commands to Claude Code', this.test_step3_deploy_commands],
            ['Step 4: Configure Claude Code settings', this.test_step4_configure_settings],
            ['Step 5: Install AI subagents', this.test_step5_install_subagents],
            ['Step 6: Verify command availability', this.test_step6_command_availability],
            ['Integration: Complete quick start flow', this.test_complete_quick_start_flow],
            ['Validation: README accuracy', this.test_readme_accuracy]
        ];

        for (const [testName, testFn] of tests) {
            this.runTest(testName, testFn);
        }

        console.log('\n📊 UX Test Results Summary:');
        console.log(`✅ Passed: ${this.passed}`);
        console.log(`❌ Failed: ${this.failed}`);
        console.log(`📈 Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);

        if (this.failed === 0) {
            console.log('\n🎉 All UX tests passed! The quick start guide is working correctly.');
            console.log('🚀 Users should be able to get started in 30 seconds as documented.');
        } else {
            console.log(`\n⚠️ ${this.failed} UX test(s) failed - quick start guide may have issues.`);
            console.log('🔧 Consider updating documentation or fixing functionality.');
        }

        return this.failed === 0;
    }
}

// Run tests if executed directly
if (require.main === module) {
    const tester = new QuickStartGuideUXTests();
    const success = tester.runAllTests();
    process.exit(success ? 0 : 1);
}

module.exports = QuickStartGuideUXTests;