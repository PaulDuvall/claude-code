#!/usr/bin/env node

/**
 * Interactive Setup Wizard for REQ-007
 * GREEN phase - Minimal implementation to pass tests
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class InteractiveSetupWizard {
    constructor(packageRoot) {
        this.packageRoot = packageRoot;
        this.configFile = path.join(packageRoot, 'setup-config.json');
        
        // Import config module for template application
        const config = require('./config');
        this.applyConfigurationTemplate = config.applyConfigurationTemplate;
        
        // Import hook installer for security hooks
        const hookInstaller = require('./hook-installer');
        this.installSecurityHooks = hookInstaller.installSecurityHooks;
        this.getAvailableHooks = hookInstaller.getAvailableHooks;
        
        // Initialize data
        this.installationTypes = [
            {
                id: 1,
                name: 'Minimal Installation',
                description: 'Essential commands only - lightweight setup',
                commands: ['xhelp', 'xversion', 'xstatus']
            },
            {
                id: 2,
                name: 'Standard Installation',
                description: 'Recommended commands for most developers',
                commands: ['xgit', 'xtest', 'xquality', 'xdocs', 'xsecurity']
            },
            {
                id: 3,
                name: 'Full Installation',
                description: 'All available commands - complete toolkit',
                commands: ['all']
            }
        ];
        
        this.commandCategories = {
            'planning': ['xplanning', 'xspec', 'xarchitecture'],
            'development': ['xgit', 'xtest', 'xquality', 'xrefactor', 'xtdd'],
            'security': ['xsecurity', 'xpolicy', 'xcompliance'],
            'deployment': ['xrelease', 'xpipeline', 'xinfra'],
            'documentation': ['xdocs']
        };
        
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
        
        this.configurationTemplates = [
            {
                id: 1,
                name: 'basic',
                description: 'Basic Claude Code configuration',
                file: 'basic-settings.json'
            },
            {
                id: 2,
                name: 'security-focused',
                description: 'Security-focused configuration with enhanced hooks',
                file: 'security-focused-settings.json'
            },
            {
                id: 3,
                name: 'comprehensive',
                description: 'Comprehensive configuration with all features',
                file: 'comprehensive-settings.json'
            }
        ];
        
        this.presets = {
            'developer': {
                installationType: 'standard',
                commandSets: ['development', 'planning'],
                securityHooks: true,
                template: 'basic'
            },
            'security-focused': {
                installationType: 'full',
                commandSets: ['security', 'development'],
                securityHooks: true,
                template: 'security-focused'
            },
            'minimal': {
                installationType: 'minimal',
                commandSets: [],
                securityHooks: false,
                template: 'basic'
            }
        };
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
        return this.installationTypes;
    }
    
    selectInstallationType(optionId) {
        const selected = this.installationTypes.find(t => t.id === optionId);
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
        return this.commandCategories;
    }
    
    selectCommandSets(categories) {
        return {
            selected: categories,
            commands: categories.flatMap(cat => this.commandCategories[cat] || [])
        };
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
        return this.configurationTemplates;
    }
    
    selectConfigurationTemplate(templateName) {
        const template = this.configurationTemplates.find(
            t => t.name === templateName
        );
        
        if (template) {
            return {
                template: template.name,
                file: template.file,
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
    
    saveConfiguration(config) {
        try {
            const configDir = path.dirname(this.configFile);
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }
            
            const configData = {
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                ...config
            };
            
            fs.writeFileSync(this.configFile, JSON.stringify(configData, null, 2));
            
            return {
                saved: true,
                file: this.configFile
            };
        } catch (error) {
            return {
                saved: false,
                error: error.message
            };
        }
    }
    
    loadConfiguration() {
        try {
            if (fs.existsSync(this.configFile)) {
                const data = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
                return {
                    found: true,
                    config: data
                };
            }
            return {
                found: false
            };
        } catch (error) {
            return {
                found: false,
                error: error.message
            };
        }
    }
    
    applyPreset(presetName) {
        if (this.presets[presetName]) {
            return this.presets[presetName];
        }
        return null;
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
            this.saveConfiguration(config);
            
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