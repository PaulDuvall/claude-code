#!/usr/bin/env node

/**
 * REQ-009: Configuration Template Application Test Suite
 * Tests configuration template application functionality using RED->GREEN->REFACTOR
 * 
 * Requirements:
 * - WHEN the user selects a configuration template
 * - THE SYSTEM SHALL apply the chosen template to ~/.claude/settings.json
 * - Settings file is created/updated with template values
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

class REQ009ConfigurationTemplateTests {
    constructor() {
        this.testDir = path.join(os.tmpdir(), `claude-test-${Date.now()}`);
        this.mockClaudeDir = path.join(this.testDir, '.claude');
        this.mockSettingsFile = path.join(this.mockClaudeDir, 'settings.json');
        this.templatesDir = path.join(__dirname, '../templates');
        this.passed = 0;
        this.failed = 0;
        
        // Setup test environment
        this.setupTestEnvironment();
    }

    setupTestEnvironment() {
        // Create test directories
        fs.mkdirSync(this.testDir, { recursive: true });
        fs.mkdirSync(this.mockClaudeDir, { recursive: true });
    }

    cleanup() {
        // Clean up test environment
        try {
            fs.rmSync(this.testDir, { recursive: true, force: true });
        } catch (error) {
            // Ignore cleanup errors
        }
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

    // Test 1: Template Application Module Exists
    test_configuration_template_application_module_exists() {
        const configModule = require('../lib/config');
        assert(typeof configModule.applyConfigurationTemplate === 'function',
            'applyConfigurationTemplate function must exist');
    }

    // Test 2: Basic Template Application
    test_applies_basic_template() {
        const { applyConfigurationTemplate } = require('../lib/config');
        
        const basicTemplatePath = path.join(this.templatesDir, 'basic-settings.json');
        
        // This should fail initially (RED phase)
        const result = applyConfigurationTemplate(basicTemplatePath, this.mockSettingsFile);
        
        assert(result === true, 'Template application should return true on success');
        assert(fs.existsSync(this.mockSettingsFile), 'Settings file should be created');
        
        const settings = JSON.parse(fs.readFileSync(this.mockSettingsFile, 'utf8'));
        assert(settings.hooks !== undefined, 'Settings should contain hooks configuration');
    }

    // Test 3: Security-Focused Template Application
    test_applies_security_focused_template() {
        const { applyConfigurationTemplate } = require('../lib/config');
        
        const securityTemplatePath = path.join(this.templatesDir, 'security-focused-settings.json');
        
        const result = applyConfigurationTemplate(securityTemplatePath, this.mockSettingsFile);
        
        assert(result === true, 'Security template application should succeed');
        assert(fs.existsSync(this.mockSettingsFile), 'Settings file should be created');
        
        const settings = JSON.parse(fs.readFileSync(this.mockSettingsFile, 'utf8'));
        assert(settings.hooks !== undefined, 'Security template should include hooks configuration');
    }

    // Test 4: Comprehensive Template Application
    test_applies_comprehensive_template() {
        const { applyConfigurationTemplate } = require('../lib/config');
        
        const comprehensiveTemplatePath = path.join(this.templatesDir, 'comprehensive-settings.json');
        
        const result = applyConfigurationTemplate(comprehensiveTemplatePath, this.mockSettingsFile);
        
        assert(result === true, 'Comprehensive template application should succeed');
        assert(fs.existsSync(this.mockSettingsFile), 'Settings file should be created');
        
        const settings = JSON.parse(fs.readFileSync(this.mockSettingsFile, 'utf8'));
        assert(settings.tools !== undefined, 'Comprehensive template should include tools configuration');
    }

    // Test 5: Updates Existing Settings File
    test_updates_existing_settings_file() {
        const { applyConfigurationTemplate } = require('../lib/config');
        
        // Create existing settings
        const existingSettings = {
            "customSetting": "preserve-me",
            "hooks": []
        };
        fs.writeFileSync(this.mockSettingsFile, JSON.stringify(existingSettings, null, 2));
        
        const basicTemplatePath = path.join(this.templatesDir, 'basic-settings.json');
        const result = applyConfigurationTemplate(basicTemplatePath, this.mockSettingsFile);
        
        assert(result === true, 'Template application should update existing file');
        
        const updatedSettings = JSON.parse(fs.readFileSync(this.mockSettingsFile, 'utf8'));
        assert(updatedSettings.customSetting === 'preserve-me', 'Existing settings should be preserved');
        assert(updatedSettings.hooks !== undefined, 'Template settings should be applied');
    }

    // Test 6: Handles Invalid Template Path
    test_handles_invalid_template_path() {
        const { applyConfigurationTemplate } = require('../lib/config');
        
        const invalidPath = path.join(this.templatesDir, 'nonexistent-template.json');
        
        const result = applyConfigurationTemplate(invalidPath, this.mockSettingsFile);
        assert(result === false, 'Invalid template path should return false');
    }

    // Test 7: Handles Invalid JSON in Template
    test_handles_invalid_json_template() {
        const { applyConfigurationTemplate } = require('../lib/config');
        
        // Create invalid JSON template
        const invalidTemplatePath = path.join(this.testDir, 'invalid-template.json');
        fs.writeFileSync(invalidTemplatePath, '{ invalid json }');
        
        const result = applyConfigurationTemplate(invalidTemplatePath, this.mockSettingsFile);
        assert(result === false, 'Invalid JSON template should return false');
    }

    // Test 8: Sets Correct File Permissions
    test_sets_correct_file_permissions() {
        const { applyConfigurationTemplate } = require('../lib/config');
        
        const basicTemplatePath = path.join(this.templatesDir, 'basic-settings.json');
        const result = applyConfigurationTemplate(basicTemplatePath, this.mockSettingsFile);
        
        assert(result === true, 'Template application should succeed');
        
        const stats = fs.statSync(this.mockSettingsFile);
        const permissions = stats.mode & parseInt('777', 8);
        
        // Should be 644 (owner read/write, group/other read)
        assert(permissions === parseInt('644', 8), 
            `Settings file should have 644 permissions, got ${permissions.toString(8)}`);
    }

    // Test 9: Preserves Comments in JSON Templates
    test_preserves_template_structure() {
        const { applyConfigurationTemplate } = require('../lib/config');
        
        const basicTemplatePath = path.join(this.templatesDir, 'basic-settings.json');
        
        // Read original template to verify it has expected structure
        assert(fs.existsSync(basicTemplatePath), 'Basic template must exist');
        
        const result = applyConfigurationTemplate(basicTemplatePath, this.mockSettingsFile);
        assert(result === true, 'Template application should succeed');
        
        const appliedSettings = JSON.parse(fs.readFileSync(this.mockSettingsFile, 'utf8'));
        
        // Verify structure is applied correctly
        assert(typeof appliedSettings === 'object', 'Applied settings should be an object');
        assert(appliedSettings !== null, 'Applied settings should not be null');
    }

    // Test 10: Integration with Setup Wizard
    test_integrates_with_setup_wizard() {
        const SetupWizard = require('../lib/setup-wizard');
        const wizard = new SetupWizard(path.join(__dirname, '..'));
        
        // This should integrate with existing wizard functionality
        assert(typeof wizard.applyConfigurationTemplate === 'function',
            'Setup wizard should have applyConfigurationTemplate method');
    }

    // Test 11: Deep Merge Functionality
    test_deep_merge_functionality() {
        const { deepMerge } = require('../lib/config');
        
        const existing = {
            hooks: [],
            tools: { enabled: false },
            custom: 'preserve-me'
        };
        
        const template = {
            hooks: { PreToolUse: [] },
            tools: { enabled: true, timeout: 5000 }
        };
        
        const merged = deepMerge(existing, template);
        
        assert(merged.custom === 'preserve-me', 'Should preserve existing values');
        assert(merged.tools.enabled === true, 'Should apply template values');
        assert(merged.tools.timeout === 5000, 'Should merge nested objects');
    }

    // Test 12: JSONC Parsing
    test_jsonc_parsing() {
        const { parseJSONC } = require('../lib/config');
        
        const jsoncContent = `{
            "// This is a comment": "value",
            "validKey": "validValue",
            "nested": {
                "// Another comment": "",
                "actualValue": 42
            }
        }`;
        
        const parsed = parseJSONC(jsoncContent);
        
        assert(parsed.validKey === 'validValue', 'Should parse valid keys');
        assert(parsed.nested.actualValue === 42, 'Should parse nested objects');
        assert(parsed['// This is a comment'] === undefined, 'Should remove comment keys');
    }

    // Test 13: Available Templates Discovery
    test_available_templates_discovery() {
        const { getAvailableTemplates } = require('../lib/config');
        
        const templates = getAvailableTemplates(this.templatesDir);
        
        assert(Array.isArray(templates), 'Should return array of templates');
        assert(templates.length >= 3, 'Should find at least 3 templates');
        
        const basicTemplate = templates.find(t => t.id === 'basic-settings');
        assert(basicTemplate !== undefined, 'Should find basic template');
        assert(basicTemplate.features > 0, 'Should count template features');
    }

    runAllTests() {
        console.log('🧪 REQ-009: Configuration Template Application Test Suite');
        console.log('=========================================================');
        
        const tests = [
            ['Configuration template application module exists', this.test_configuration_template_application_module_exists],
            ['Applies basic template', this.test_applies_basic_template],
            ['Applies security-focused template', this.test_applies_security_focused_template],
            ['Applies comprehensive template', this.test_applies_comprehensive_template],
            ['Updates existing settings file', this.test_updates_existing_settings_file],
            ['Handles invalid template path', this.test_handles_invalid_template_path],
            ['Handles invalid JSON template', this.test_handles_invalid_json_template],
            ['Sets correct file permissions', this.test_sets_correct_file_permissions],
            ['Preserves template structure', this.test_preserves_template_structure],
            ['Integrates with setup wizard', this.test_integrates_with_setup_wizard],
            ['Deep merge functionality', this.test_deep_merge_functionality],
            ['JSONC parsing', this.test_jsonc_parsing],
            ['Available templates discovery', this.test_available_templates_discovery]
        ];

        for (const [testName, testFn] of tests) {
            this.runTest(testName, testFn);
        }

        console.log('');
        console.log('📊 REQ-009 Test Results:');
        console.log(`✅ Passed: ${this.passed}`);
        console.log(`❌ Failed: ${this.failed}`);
        console.log(`📈 Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);

        // Cleanup
        this.cleanup();
        
        return this.failed === 0;
    }
}

// Run tests if executed directly
if (require.main === module) {
    const tester = new REQ009ConfigurationTemplateTests();
    const success = tester.runAllTests();
    process.exit(success ? 0 : 1);
}

module.exports = REQ009ConfigurationTemplateTests;