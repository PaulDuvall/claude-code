#!/usr/bin/env node

/**
 * Interactive Setup Wizard for REQ-007
 * GREEN phase - Minimal implementation to pass tests
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Import extracted classes for better separation of concerns
const SetupWizardUI = require('./setup-wizard-ui');
const InstallationConfiguration = require('./installation-configuration');
const CommandSelector = require('./command-selector');

class InteractiveSetupWizard {
    constructor(packageRoot) {
        this.packageRoot = packageRoot;
        
        // Import config module for template application
        const config = require('./config');
        this.applyConfigurationTemplate = config.applyConfigurationTemplate;
        
        // Import hook installer for security hooks
        const hookInstaller = require('./hook-installer');
        this.installSecurityHooks = hookInstaller.installSecurityHooks;
        this.getAvailableHooks = hookInstaller.getAvailableHooks;
        
        // Initialize extracted components
        this.ui = new SetupWizardUI();
        this.config = new InstallationConfiguration(packageRoot);
        this.commandSelector = new CommandSelector();
        
        // Legacy data for backward compatibility
        this.securityHooks = [
            {
                id: 1,
                name: 'credential-protection',
                description: 'Prevents credential exposure in commits',
                file: 'prevent-credential-exposure.sh'
            },
            {
                id: 2,
                name: 'file-logger',
                description: 'Logs file operations for audit trail',
                file: 'file-logger.sh'
            }
        ];
    }
    
    validateEnvironment() {
        try {
            // Check write permissions
            const testFile = path.join(this.packageRoot, '.test');
            fs.writeFileSync(testFile, 'test');
            fs.unlinkSync(testFile);
            
            return {
                valid: true,
                message: 'Environment validation passed'
            };
        } catch (error) {
            return {
                valid: false,
                message: `Environment validation failed: ${error.message}`
            };
        }
    }
    
    getInstallationTypes() {
        return this.config.getInstallationTypes();
    }
    
    selectInstallationType(optionId) {
        const selected = this.config.getInstallationTypeById(optionId);
        if (selected) {
            return {
                type: selected.name.toLowerCase().split(' ')[0],
                description: selected.description,
                commands: selected.commands
            };
        }
        return null;
    }
    
    getCommandCategories() {
        return this.commandSelector.getCommandCategories();
    }
    
    selectCommandSets(categories) {
        return this.commandSelector.selectCommandSets(categories);
    }
    
    getSecurityHooks() {
        return this.securityHooks;
    }
    
    selectSecurityHooks(hookIds) {
        const selected = hookIds.map(id => 
            this.securityHooks.find(h => h.id === id)
        ).filter(Boolean);
        
        return {
            enabled: selected.length > 0,
            selected: selected.map(h => h.name)
        };
    }
    
    getConfigurationTemplates() {
        return this.config.getConfigurationTemplates();
    }
    
    selectConfigurationTemplate(templateName) {
        const templates = this.config.getConfigurationTemplates();
        const template = templates.find(t => t.name === templateName);
        
        if (template) {
            return {
                template: template.name,
                file: template.filename,
                description: template.description
            };
        }
        return null;
    }
    
    runNonInteractiveSetup() {
        const defaultConfig = {
            installationType: 'standard',
            commandSets: ['development', 'planning'],
            securityHooks: true,
            selectedHooks: ['credential-protection'],
            template: 'basic'
        };
        
        this.saveConfiguration(defaultConfig);
        
        return {
            completed: true,
            configuration: defaultConfig
        };
    }
    
    async runNonInteractiveSetupAsync() {
        const defaultConfig = {
            installationType: 'standard',
            commandSets: ['development', 'planning'],
            securityHooks: true,
            selectedHooks: ['credential-protection'],
            template: 'basic'
        };
        
        await this.saveConfigurationAsync(defaultConfig);
        
        return {
            completed: true,
            configuration: defaultConfig
        };
    }
    
    saveConfiguration(configData) {
        const enhancedConfig = {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            ...configData
        };
        
        const success = this.config.saveConfiguration(enhancedConfig);
        return {
            saved: success,
            file: success ? this.config.getConfigurationPath() : null,
            error: success ? null : 'Failed to save configuration'
        };
    }
    
    async saveConfigurationAsync(configData) {
        const enhancedConfig = {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            ...configData
        };
        
        const success = await this.config.saveConfigurationAsync(enhancedConfig);
        return {
            saved: success,
            file: success ? this.config.getConfigurationPath() : null,
            error: success ? null : 'Failed to save configuration'
        };
    }
    
    loadConfiguration() {
        const configData = this.config.loadConfiguration();
        if (configData) {
            return {
                found: true,
                config: configData
            };
        }
        return {
            found: false
        };
    }
    
    async loadConfigurationAsync() {
        const configData = await this.config.loadConfigurationAsync();
        if (configData) {
            return {
                found: true,
                config: configData
            };
        }
        return {
            found: false
        };
    }
    
    applyPreset(presetName) {
        return this.commandSelector.applyPreset(presetName);
    }
    
    async runInteractiveSetup() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        const question = (prompt) => new Promise((resolve) => {
            rl.question(prompt, resolve);
        });
        
        console.log('\n🚀 Claude Dev Toolkit Interactive Setup Wizard');
        console.log('=' .repeat(50));
        
        const config = {};
        
        try {
            // Installation type
            console.log('\n📦 Installation Type:');
            this.installationTypes.forEach(type => {
                console.log(`${type.id}. ${type.name}`);
                console.log(`   ${type.description}`);
            });
            
            const typeChoice = await question('\nSelect installation type (1-3): ');
            const selectedType = this.selectInstallationType(parseInt(typeChoice));
            if (selectedType) {
                config.installationType = selectedType.type;
            }
            
            // Command sets
            console.log('\n🛠️  Command Sets:');
            const categories = Object.keys(this.commandCategories);
            categories.forEach((cat, i) => {
                console.log(`${i + 1}. ${cat} (${this.commandCategories[cat].length} commands)`);
            });
            
            const setChoice = await question('\nSelect command sets (comma-separated numbers): ');
            const selectedIndices = setChoice.split(',').map(s => parseInt(s.trim()) - 1);
            const selectedSets = selectedIndices.map(i => categories[i]).filter(Boolean);
            config.commandSets = selectedSets;
            
            // Security hooks
            const enableHooks = await question('\n🔒 Enable security hooks? (y/n): ');
            if (enableHooks.toLowerCase() === 'y') {
                console.log('\nAvailable hooks:');
                this.securityHooks.forEach(hook => {
                    console.log(`${hook.id}. ${hook.name}`);
                    console.log(`   ${hook.description}`);
                });
                
                const hookChoice = await question('\nSelect hooks (comma-separated numbers): ');
                const hookIds = hookChoice.split(',').map(h => parseInt(h.trim()));
                const selectedHooks = this.selectSecurityHooks(hookIds);
                config.securityHooks = selectedHooks.enabled;
                config.selectedHooks = selectedHooks.selected;
            } else {
                config.securityHooks = false;
                config.selectedHooks = [];
            }
            
            // Configuration template
            console.log('\n⚙️  Configuration Templates:');
            this.configurationTemplates.forEach(template => {
                console.log(`${template.id}. ${template.name}`);
                console.log(`   ${template.description}`);
            });
            
            const templateChoice = await question('\nSelect template (1-3): ');
            const templateId = parseInt(templateChoice);
            const selectedTemplate = this.configurationTemplates.find(t => t.id === templateId);
            if (selectedTemplate) {
                config.template = selectedTemplate.name;
            }
            
            // Save configuration
            await this.saveConfigurationAsync(config);
            
            // Apply selected configuration template (REQ-009 integration)
            if (selectedTemplate) {
                const templatesDir = path.join(this.packageRoot, 'templates');
                const templatePath = path.join(templatesDir, selectedTemplate.filename);
                const settingsPath = path.join(require('os').homedir(), '.claude', 'settings.json');
                
                console.log(`\n📋 Applying configuration template: ${selectedTemplate.name}`);
                const applied = this.applyConfigurationTemplate(templatePath, settingsPath);
                if (applied) {
                    console.log(`✅ Template applied to: ${settingsPath}`);
                    config.templateApplied = true;
                    config.settingsPath = settingsPath;
                } else {
                    console.log('⚠️  Template application failed, but setup will continue');
                    config.templateApplied = false;
                }
            }
            
            console.log('\n✅ Setup completed successfully!');
            console.log(`Configuration saved to: ${this.configFile}`);
            
            rl.close();
            
            return {
                completed: true,
                configuration: config
            };
            
        } catch (error) {
            rl.close();
            return {
                completed: false,
                error: error.message
            };
        }
    }
}

// Support for PostInstaller integration
class PostInstaller {
    constructor() {
        this.packageRoot = path.join(require('os').homedir(), '.claude');
    }
    
    runSetupWizard(options = {}) {
        if (options.skipSetup) {
            return { skipped: true };
        }
        
        const wizard = new InteractiveSetupWizard(this.packageRoot);
        return wizard.runNonInteractiveSetup();
    }
}

// Export both classes
module.exports = InteractiveSetupWizard;
module.exports.PostInstaller = PostInstaller;