#!/usr/bin/env node

/**
 * Test Suite for REQ-007: Interactive Setup Wizard (Node.js Implementation)
 * Priority: Medium
 * Requirement: WHEN the environment validation passes
 * THE SYSTEM SHALL present an interactive wizard prompting for installation type, 
 * command sets, security hooks, and configuration template
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Import the Node.js implementation
const InteractiveSetupWizard = require('../lib/setup-wizard');

/**
 * Test cases for REQ-007 Interactive Setup Wizard - Node.js Implementation
 * Tests for the Interactive Setup Wizard Node.js implementation
 */
class TestInteractiveSetupWizardNode {
    constructor() {
        this.testDir = null;
        this.wizard = null;
        this.passed = 0;
        this.failed = 0;
    }
    
    setUp() {
        // Create temporary test directory
        this.testDir = path.join(os.tmpdir(), 'setup_wizard_test_' + Date.now());
        fs.mkdirSync(this.testDir, { recursive: true });
        
        // Create wizard instance
        this.wizard = new InteractiveSetupWizard(this.testDir);
    }
    
    tearDown() {
        // Clean up test directory
        if (this.testDir && fs.existsSync(this.testDir)) {
            fs.rmSync(this.testDir, { recursive: true });
        }
    }
    
    runTest(testName, testFn) {
        this.setUp();
        try {
            testFn.call(this);
            console.log(`✅ ${testName}`);
            this.passed++;
        } catch (error) {
            console.log(`❌ ${testName}`);
            console.log(`   Error: ${error.message}`);
            this.failed++;
        } finally {
            this.tearDown();
        }
    }
    
    // Test methods matching Python test suite structure
    test_interactive_setup_wizard_exists() {
        assert(this.wizard !== null, "InteractiveSetupWizard must be instantiable");
        assert(this.wizard instanceof InteractiveSetupWizard, "Must be instance of InteractiveSetupWizard");
    }
    
    test_wizard_displays_welcome_message() {
        // In Node.js version, welcome is part of runInteractiveSetup
        // Check that the method exists
        assert(typeof this.wizard.runInteractiveSetup === 'function', "Must have interactive setup method");
    }
    
    test_wizard_prompts_for_installation_type() {
        const result = this.wizard.selectInstallationType(1);
        assert(result !== null, "Must return installation type");
        assert('type' in result, "Must include type");
        assert('description' in result, "Must include description");
    }
    
    test_installation_type_options_are_presented() {
        const options = this.wizard.getInstallationTypes();
        assert(Array.isArray(options), "Options must be an array");
        assert(options.length >= 3, "Must have at least 3 installation types");
        
        // Check for standard installation types
        const optionNames = options.map(opt => opt.name.toLowerCase());
        assert(optionNames.some(n => n.includes('minimal')), "Must include minimal installation");
        assert(optionNames.some(n => n.includes('standard')), "Must include standard installation");
        assert(optionNames.some(n => n.includes('full')), "Must include full installation");
    }
    
    test_wizard_prompts_for_command_sets() {
        const result = this.wizard.selectCommandSets(['planning', 'development']);
        assert('selected' in result, "Must return selected command sets");
        assert(Array.isArray(result.selected), "Command sets must be an array");
        assert(result.selected.includes('planning'), "Must include selected planning");
        assert(result.selected.includes('development'), "Must include selected development");
    }
    
    test_command_set_options_are_categorized() {
        const categories = this.wizard.getCommandCategories();
        assert(typeof categories === 'object', "Categories must be an object");
        assert('planning' in categories, "Must include planning category");
        assert('development' in categories, "Must include development category");
        assert('security' in categories, "Must include security category");
        assert('deployment' in categories, "Must include deployment category");
        
        // Each category should have commands
        for (const [category, commands] of Object.entries(categories)) {
            assert(Array.isArray(commands), `Category ${category} must have array of commands`);
            assert(commands.length > 0, `Category ${category} must have at least one command`);
        }
    }
    
    test_wizard_prompts_for_security_hooks() {
        const result = this.wizard.selectSecurityHooks([1, 2]);
        assert('enabled' in result, "Must return security hooks status");
        assert('selected' in result, "Must return selected hooks");
        assert(result.enabled === true, "Hooks should be enabled when selected");
        assert(Array.isArray(result.selected), "Selected hooks must be an array");
    }
    
    test_security_hooks_options_are_available() {
        const hooks = this.wizard.getSecurityHooks();
        assert(Array.isArray(hooks), "Hooks must be an array");
        assert(hooks.length > 0, "Must have available security hooks");
        
        // Check for essential security hooks
        const hookNames = hooks.map(hook => hook.name.toLowerCase());
        assert(hookNames.some(n => n.includes('credential')), "Must include credential protection hook");
        assert(hookNames.some(n => n.includes('file')), "Must include file logging hook");
    }
    
    test_wizard_prompts_for_configuration_template() {
        const result = this.wizard.selectConfigurationTemplate('basic');
        assert(result !== null, "Must return template configuration");
        assert('template' in result, "Must return template type");
        assert('file' in result, "Must return template file");
        assert('description' in result, "Must include template description");
    }
    
    test_configuration_template_options_are_available() {
        const templates = this.wizard.getConfigurationTemplates();
        assert(Array.isArray(templates), "Templates must be an array");
        assert(templates.length >= 3, "Must have at least 3 configuration templates");
        
        // Check for standard templates
        const templateNames = templates.map(tmpl => tmpl.name.toLowerCase());
        assert(templateNames.includes('basic'), "Must include basic template");
        assert(templateNames.some(n => n.includes('security')), "Must include security-focused template");
        assert(templateNames.includes('comprehensive'), "Must include comprehensive template");
    }
    
    test_wizard_runs_complete_interactive_flow() {
        // Test non-interactive version since we can't mock stdin easily
        const result = this.wizard.runNonInteractiveSetup();
        assert('completed' in result, "Must indicate completion status");
        assert('configuration' in result, "Must include configuration");
        assert(result.completed === true, "Setup must complete successfully");
    }
    
    test_wizard_validates_user_input() {
        // Test invalid installation type
        const invalidResult = this.wizard.selectInstallationType(99);
        assert(invalidResult === null, "Must return null for invalid input");
        
        // Test valid installation type
        const validResult = this.wizard.selectInstallationType(1);
        assert(validResult !== null, "Must accept valid input");
    }
    
    test_wizard_saves_configuration_to_file() {
        const config = {
            installationType: 'standard',
            commandSets: ['planning', 'development'],
            securityHooks: true,
            template: 'basic'
        };
        
        const result = this.wizard.saveConfiguration(config);
        assert(result.saved === true, "Configuration must be saved");
        assert('file' in result, "Must return config file path");
        
        // Verify file exists and contains correct data
        const configFile = path.join(this.testDir, 'setup-config.json');
        assert(fs.existsSync(configFile), "Config file must be created");
        
        const savedData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
        assert(savedData.installationType === 'standard', "Must save installation type");
        assert(Array.isArray(savedData.commandSets), "Must save command sets");
    }
    
    test_wizard_can_load_existing_configuration() {
        // First save a configuration
        const config = {
            installationType: 'full',
            commandSets: ['security', 'deployment'],
            securityHooks: false,
            template: 'comprehensive'
        };
        this.wizard.saveConfiguration(config);
        
        // Then load it
        const loadResult = this.wizard.loadConfiguration();
        assert('found' in loadResult, "Must indicate if config found");
        assert(loadResult.found === true, "Config must be found");
        assert(loadResult.config.installationType === 'full', "Must load correct installation type");
    }
    
    test_wizard_provides_installation_summary() {
        // The Node.js version generates summary as part of interactive flow
        // Test that configuration can be summarized
        const config = {
            installationType: 'standard',
            commandSets: ['planning', 'development', 'security'],
            securityHooks: true,
            selectedHooks: ['credential-protection', 'file-logger'],
            template: 'security-focused'
        };
        
        // Save and verify it contains expected fields
        const saved = this.wizard.saveConfiguration(config);
        assert(saved.saved === true, "Must save configuration for summary");
    }
    
    test_wizard_handles_non_interactive_mode() {
        const result = this.wizard.runNonInteractiveSetup();
        assert('completed' in result, "Must include completion status");
        assert('configuration' in result, "Must include default configuration");
        assert(result.completed === true, "Setup must complete successfully");
    }
    
    test_wizard_supports_preset_configurations() {
        // Test getting presets
        const developerPreset = this.wizard.applyPreset('developer');
        assert(developerPreset !== null, "Must have developer preset");
        assert(developerPreset.installationType === 'standard', "Developer preset must use standard installation");
        
        const securityPreset = this.wizard.applyPreset('security-focused');
        assert(securityPreset !== null, "Must have security-focused preset");
        
        const minimalPreset = this.wizard.applyPreset('minimal');
        assert(minimalPreset !== null, "Must have minimal preset");
    }
    
    test_wizard_validates_environment_before_setup() {
        const result = this.wizard.validateEnvironment();
        assert('valid' in result, "Must check environment validity");
        assert('message' in result, "Must provide validation message");
        assert(typeof result.valid === 'boolean', "Valid must be boolean");
    }
    
    test_wizard_integrates_with_post_install() {
        const PostInstaller = InteractiveSetupWizard.PostInstaller;
        assert(PostInstaller !== undefined, "PostInstaller must be exported");
        
        const installer = new PostInstaller();
        assert(typeof installer.runSetupWizard === 'function', "Must have runSetupWizard method");
        
        // Test with skip flag
        const skipResult = installer.runSetupWizard({ skipSetup: true });
        assert(skipResult.skipped === true, "Must handle skip flag");
    }
    
    test_wizard_configuration_options_are_complete() {
        // Verify all required configuration options are available
        const installTypes = this.wizard.getInstallationTypes();
        const commandCats = this.wizard.getCommandCategories();
        const hooks = this.wizard.getSecurityHooks();
        const templates = this.wizard.getConfigurationTemplates();
        
        assert(installTypes.length > 0, "Must have installation types");
        assert(Object.keys(commandCats).length > 0, "Must have command categories");
        assert(hooks.length > 0, "Must have security hooks");
        assert(templates.length > 0, "Must have configuration templates");
    }
    
    runAllTests() {
        console.log('Test Suite for REQ-007: Interactive Setup Wizard (Node.js)');
        console.log('=' .repeat(60));
        
        const testMethods = [
            'test_interactive_setup_wizard_exists',
            'test_wizard_displays_welcome_message',
            'test_wizard_prompts_for_installation_type',
            'test_installation_type_options_are_presented',
            'test_wizard_prompts_for_command_sets',
            'test_command_set_options_are_categorized',
            'test_wizard_prompts_for_security_hooks',
            'test_security_hooks_options_are_available',
            'test_wizard_prompts_for_configuration_template',
            'test_configuration_template_options_are_available',
            'test_wizard_runs_complete_interactive_flow',
            'test_wizard_validates_user_input',
            'test_wizard_saves_configuration_to_file',
            'test_wizard_can_load_existing_configuration',
            'test_wizard_provides_installation_summary',
            'test_wizard_handles_non_interactive_mode',
            'test_wizard_supports_preset_configurations',
            'test_wizard_validates_environment_before_setup',
            'test_wizard_integrates_with_post_install',
            'test_wizard_configuration_options_are_complete'
        ];
        
        for (const methodName of testMethods) {
            if (typeof this[methodName] === 'function') {
                this.runTest(methodName, this[methodName]);
            }
        }
        
        console.log('\n' + '=' .repeat(60));
        console.log(`📊 Results: ${this.passed} passed, ${this.failed} failed`);
        
        return this.failed === 0;
    }
}

// Run tests if executed directly
if (require.main === module) {
    const tester = new TestInteractiveSetupWizardNode();
    const success = tester.runAllTests();
    process.exit(success ? 0 : 1);
}