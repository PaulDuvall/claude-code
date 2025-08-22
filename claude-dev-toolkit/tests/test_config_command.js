#!/usr/bin/env node

/**
 * RED PHASE: Config Command Test Suite
 * Tests for claude-commands config feature requirements
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

class ConfigCommandTests {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.testClaudeDir = path.join(os.tmpdir(), 'test-claude-config');
        this.originalHome = process.env.HOME;
    }

    setUp() {
        // Create temporary test directory
        if (fs.existsSync(this.testClaudeDir)) {
            fs.rmSync(this.testClaudeDir, { recursive: true, force: true });
        }
        fs.mkdirSync(this.testClaudeDir, { recursive: true });
        
        // Mock HOME environment to point to test directory
        process.env.HOME = path.dirname(this.testClaudeDir);
    }

    tearDown() {
        // Restore original HOME environment
        process.env.HOME = this.originalHome;
        
        // Clean up test directory
        if (fs.existsSync(this.testClaudeDir)) {
            fs.rmSync(this.testClaudeDir, { recursive: true, force: true });
        }
    }

    runTest(testName, testFn) {
        try {
            this.setUp();
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

    // RED PHASE: These tests should fail initially
    test_config_command_exists() {
        // Test that config command is available in claude-commands
        const binPath = path.join(__dirname, '..', 'bin', 'claude-commands');
        assert(fs.existsSync(binPath), 'claude-commands binary should exist');
        
        // This should fail initially - config command not implemented yet
        try {
            const output = execSync(`node "${binPath}" config --help`, { 
                encoding: 'utf8',
                stdio: 'pipe'
            });
            assert(output.includes('config'), 'Should include config command help');
        } catch (error) {
            // This is expected to fail in RED phase
            throw new Error('Config command not implemented yet');
        }
    }

    // REQ-CONFIG-001: List Templates
    test_list_templates() {
        const binPath = path.join(__dirname, '..', 'bin', 'claude-commands');
        
        try {
            const output = execSync(`node "${binPath}" config --list`, { 
                encoding: 'utf8',
                stdio: 'pipe'
            });
            
            // Should list the templates from templates/ directory
            assert(output.includes('basic-settings.json'), 'Should list basic-settings.json');
            assert(output.includes('comprehensive-settings.json'), 'Should list comprehensive-settings.json');
            assert(output.includes('security-focused-settings.json'), 'Should list security-focused-settings.json');
        } catch (error) {
            throw new Error('Config --list command not implemented yet');
        }
    }

    // REQ-CONFIG-002: Apply Template
    test_apply_template() {
        const binPath = path.join(__dirname, '..', 'bin', 'claude-commands');
        const claudeDir = path.join(process.env.HOME, '.claude');
        const settingsPath = path.join(claudeDir, 'settings.json');
        
        // Create .claude directory and ensure it's clean
        fs.mkdirSync(claudeDir, { recursive: true });
        
        // Remove any existing settings to ensure clean test
        if (fs.existsSync(settingsPath)) {
            fs.unlinkSync(settingsPath);
        }
        
        try {
            // Apply basic template
            execSync(`node "${binPath}" config --template basic-settings.json`, { 
                encoding: 'utf8',
                stdio: 'pipe',
                env: { ...process.env, HOME: process.env.HOME } // Ensure HOME is passed
            });
            
            // Check that settings.json was created
            assert(fs.existsSync(settingsPath), 'settings.json should be created');
            
            // Check that content matches template (compare parsed JSON, not raw text)
            const settingsContent = fs.readFileSync(settingsPath, 'utf8');
            const templatePath = path.join(__dirname, '..', 'templates', 'basic-settings.json');
            const templateContent = fs.readFileSync(templatePath, 'utf8');
            
            // Parse both and compare structure (comments will be stripped from template)
            const settingsJson = JSON.parse(settingsContent);
            
            // Use the parseJSONC function from config module
            try {
                const { parseJSONC } = require('../lib/config');
                const templateJson = parseJSONC(templateContent);
                
                assert.deepStrictEqual(settingsJson, templateJson, 'Settings should match template structure');
            } catch (parseError) {
                throw new Error(`Failed to parse template or settings: ${parseError.message}`);
            }
        } catch (error) {
            throw new Error(`Config --template test failed: ${error.message}`);
        }
    }

    // REQ-CONFIG-002: Backup existing settings
    test_backup_existing_settings() {
        const binPath = path.join(__dirname, '..', 'bin', 'claude-commands');
        const claudeDir = path.join(process.env.HOME, '.claude');
        const settingsPath = path.join(claudeDir, 'settings.json');
        
        // Create .claude directory and existing settings
        fs.mkdirSync(claudeDir, { recursive: true });
        const existingSettings = '{"existing": "settings"}';
        fs.writeFileSync(settingsPath, existingSettings);
        
        try {
            // Apply template
            execSync(`node "${binPath}" config --template basic-settings.json`, { 
                encoding: 'utf8',
                stdio: 'pipe'
            });
            
            // Check that backup was created
            const backupFiles = fs.readdirSync(claudeDir).filter(file => 
                file.startsWith('settings.json.backup.')
            );
            
            assert(backupFiles.length > 0, 'Backup file should be created');
            
            // Check backup content
            const backupPath = path.join(claudeDir, backupFiles[0]);
            const backupContent = fs.readFileSync(backupPath, 'utf8');
            assert.strictEqual(backupContent, existingSettings, 'Backup should contain original settings');
        } catch (error) {
            throw new Error('Backup functionality not implemented yet');
        }
    }

    // REQ-CONFIG-003: Show Help
    test_show_help() {
        const binPath = path.join(__dirname, '..', 'bin', 'claude-commands');
        
        try {
            const output = execSync(`node "${binPath}" config --help`, { 
                encoding: 'utf8',
                stdio: 'pipe'
            });
            
            // Should show usage information
            assert(output.includes('Usage:'), 'Should show usage information');
            assert(output.includes('--list'), 'Should show --list option');
            assert(output.includes('--template'), 'Should show --template option');
            assert(output.includes('--help'), 'Should show --help option');
        } catch (error) {
            throw new Error('Config --help command not implemented yet');
        }
    }

    // REQ-CONFIG-004: Handle Invalid Template
    test_handle_invalid_template() {
        const binPath = path.join(__dirname, '..', 'bin', 'claude-commands');
        
        try {
            const result = execSync(`node "${binPath}" config --template nonexistent.json 2>&1`, { 
                encoding: 'utf8',
                env: { ...process.env, HOME: process.env.HOME } // Ensure HOME is passed
            });
            
            // Should not reach here - command should fail
            throw new Error('Should have failed for invalid template');
        } catch (error) {
            // Capture both stdout and stderr combined
            const output = error.stdout || error.stderr || error.message;
            const hasNotFoundMessage = output.includes('not found') || output.includes('not exist');
            const hasTemplatesList = output.includes('available templates') || output.includes('Available Configuration Templates');
            
            assert(hasNotFoundMessage, 
                `Should show error about template not found. Got: ${output}`);
            assert(hasTemplatesList, 
                `Should list available templates. Got: ${output}`);
        }
    }

    test_template_directory_exists() {
        // Verify templates directory and files exist
        const templatesDir = path.join(__dirname, '..', 'templates');
        assert(fs.existsSync(templatesDir), 'Templates directory should exist');
        
        const expectedTemplates = [
            'basic-settings.json',
            'comprehensive-settings.json', 
            'security-focused-settings.json'
        ];
        
        for (const template of expectedTemplates) {
            const templatePath = path.join(templatesDir, template);
            assert(fs.existsSync(templatePath), `Template ${template} should exist`);
            
            // Verify it's valid JSON
            const content = fs.readFileSync(templatePath, 'utf8');
            try {
                JSON.parse(content);
            } catch (e) {
                throw new Error(`Template ${template} should contain valid JSON`);
            }
        }
    }

    runAllTests() {
        console.log('🔴 RED PHASE: Testing Config Command Requirements');
        console.log('================================================================');

        const tests = [
            ['Config command exists', this.test_config_command_exists],
            ['REQ-CONFIG-001: List templates', this.test_list_templates],
            ['REQ-CONFIG-002: Apply template', this.test_apply_template],
            ['REQ-CONFIG-002: Backup existing settings', this.test_backup_existing_settings],
            ['REQ-CONFIG-003: Show help', this.test_show_help],
            ['REQ-CONFIG-004: Handle invalid template', this.test_handle_invalid_template],
            ['Template directory exists', this.test_template_directory_exists]
        ];

        for (const [testName, testFn] of tests) {
            console.log(`🧪 Running: ${testName.toLowerCase().replace(/[^a-z0-9]/g, ' ')}`);
            this.runTest(testName, testFn);
        }

        console.log('\n📊 Test Results Summary:');
        console.log(`✅ Passed: ${this.passed}`);
        console.log(`❌ Failed: ${this.failed}`);
        console.log(`📈 Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);

        if (this.failed === 0) {
            console.log('\n🎉 All config command tests passed!');
        } else {
            console.log(`\n⚠️ ${this.failed} test(s) failed - this is expected in RED phase`);
        }

        return this.failed === 0;
    }
}

// Run tests if executed directly
if (require.main === module) {
    const tester = new ConfigCommandTests();
    const success = tester.runAllTests();
    process.exit(success ? 0 : 1);
}

module.exports = ConfigCommandTests;