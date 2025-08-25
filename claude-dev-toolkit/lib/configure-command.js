/**
 * Configure Command Implementation - Phase 2
 * Replaces configure-claude-code.sh functionality
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const inquirer = require('inquirer');
const { applyConfigurationTemplate, parseJSONC } = require('./config');

class ConfigureCommand {
    constructor() {
        this.claudeDir = path.join(os.homedir(), '.claude');
        this.settingsPath = path.join(this.claudeDir, 'settings.json');
        this.templatesDir = path.join(__dirname, '..', 'templates');
        this.backupsDir = path.join(this.claudeDir, 'backups', 'settings');
    }

    /**
     * Execute the configure command with given options
     */
    async execute(options = {}) {
        try {
            // Handle template application
            if (options.template) {
                return await this.applyTemplate(options.template, options);
            }

            // Handle interactive mode
            if (options.interactive) {
                return await this.interactiveConfiguration();
            }

            // Handle validation
            if (options.validate) {
                return await this.validateConfiguration();
            }

            // Handle reset
            if (options.reset) {
                return await this.resetConfiguration(options);
            }

            // Default: show current configuration
            return await this.showCurrentConfiguration();

        } catch (error) {
            console.error(`❌ Configuration failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Apply a configuration template
     */
    async applyTemplate(templateName, options = {}) {
        console.log(`🔧 Applying configuration template: ${templateName}\n`);

        // Create backup if requested or by default
        if (options.backup !== false) {
            await this.backupCurrentSettings();
        }

        // Resolve template path
        const templatePath = this.resolveTemplatePath(templateName);
        if (!templatePath) {
            console.error(`❌ Template '${templateName}' not found`);
            this.listAvailableTemplates();
            return { success: false, error: 'Template not found' };
        }

        // Apply the template
        const success = applyConfigurationTemplate(templatePath, this.settingsPath);
        
        if (success) {
            console.log(`✅ Successfully applied template: ${templateName}`);
            console.log(`📝 Configuration saved to: ${this.settingsPath}`);
            
            // Validate the new configuration
            if (!options.skipValidation) {
                await this.validateConfiguration();
            }

            return { success: true, template: templateName };
        } else {
            console.error(`❌ Failed to apply template: ${templateName}`);
            return { success: false, error: 'Template application failed' };
        }
    }

    /**
     * Interactive configuration wizard
     */
    async interactiveConfiguration() {
        console.log('🧙 Interactive Configuration Wizard\n');
        console.log('This wizard will help you configure Claude Code settings.\n');

        const questions = [
            {
                type: 'list',
                name: 'template',
                message: 'Select a base configuration template:',
                choices: [
                    { name: 'Basic - Minimal setup for getting started', value: 'basic' },
                    { name: 'Comprehensive - Full-featured configuration', value: 'comprehensive' },
                    { name: 'Security-Focused - Enhanced security settings', value: 'security-focused' },
                    { name: 'Custom - Start from scratch', value: 'custom' }
                ]
            },
            {
                type: 'confirm',
                name: 'autoUpdate',
                message: 'Enable automatic updates?',
                default: true,
                when: (answers) => answers.template === 'custom'
            },
            {
                type: 'confirm',
                name: 'telemetry',
                message: 'Enable telemetry to help improve Claude Code?',
                default: false,
                when: (answers) => answers.template === 'custom'
            },
            {
                type: 'list',
                name: 'theme',
                message: 'Select a theme:',
                choices: ['light', 'dark', 'auto'],
                default: 'auto',
                when: (answers) => answers.template === 'custom'
            },
            {
                type: 'confirm',
                name: 'hooks',
                message: 'Enable hooks for automation?',
                default: true,
                when: (answers) => answers.template === 'custom'
            },
            {
                type: 'confirm',
                name: 'backup',
                message: 'Create backup before applying changes?',
                default: true
            }
        ];

        try {
            const answers = await inquirer.prompt(questions);

            // Create backup if requested
            if (answers.backup) {
                await this.backupCurrentSettings();
            }

            // Apply template or custom configuration
            if (answers.template !== 'custom') {
                return await this.applyTemplate(answers.template, { backup: false });
            } else {
                // Build custom configuration
                const customConfig = this.buildCustomConfiguration(answers);
                return await this.saveConfiguration(customConfig);
            }

        } catch (error) {
            if (error.isTtyError) {
                console.error('❌ Interactive mode not available in this environment');
                console.log('💡 Use --template option instead');
            } else {
                console.error(`❌ Configuration wizard failed: ${error.message}`);
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * Build custom configuration from wizard answers
     */
    buildCustomConfiguration(answers) {
        const config = {
            version: '1.0.0',
            lastModified: new Date().toISOString()
        };

        if (answers.autoUpdate !== undefined) {
            config.autoUpdate = answers.autoUpdate;
        }

        if (answers.telemetry !== undefined) {
            config.telemetry = { enabled: answers.telemetry };
        }

        if (answers.theme) {
            config.appearance = { theme: answers.theme };
        }

        if (answers.hooks !== undefined) {
            config.hooks = { enabled: answers.hooks };
        }

        return config;
    }

    /**
     * Validate current configuration
     */
    async validateConfiguration() {
        console.log('🔍 Validating configuration...\n');

        const issues = [];
        const warnings = [];

        // Check if settings file exists
        if (!fs.existsSync(this.settingsPath)) {
            issues.push('Settings file not found');
            console.log(`❌ Settings file not found at: ${this.settingsPath}`);
            return { success: false, issues, warnings };
        }

        try {
            // Read and parse settings
            const content = fs.readFileSync(this.settingsPath, 'utf8');
            let settings;
            
            try {
                settings = parseJSONC(content);
            } catch (parseError) {
                issues.push('Invalid JSON format in settings file');
                console.log('❌ Settings file contains invalid JSON');
                return { success: false, issues, warnings };
            }

            // Validate structure
            if (typeof settings !== 'object' || settings === null) {
                issues.push('Settings must be a JSON object');
            }

            // Check for recommended settings
            if (!settings.version) {
                warnings.push('Missing version field');
            }

            // Check permissions
            const stats = fs.statSync(this.settingsPath);
            const mode = (stats.mode & parseInt('777', 8)).toString(8);
            if (mode !== '644' && mode !== '600') {
                warnings.push(`Permissions ${mode} may be too permissive (recommend 644)`);
            }

            // Report results
            if (issues.length === 0) {
                console.log('✅ Configuration is valid');
                
                if (warnings.length > 0) {
                    console.log('\n⚠️  Warnings:');
                    warnings.forEach(w => console.log(`   • ${w}`));
                }

                return { success: true, valid: true, warnings };
            } else {
                console.log('❌ Configuration has issues:');
                issues.forEach(i => console.log(`   • ${i}`));
                
                if (warnings.length > 0) {
                    console.log('\n⚠️  Warnings:');
                    warnings.forEach(w => console.log(`   • ${w}`));
                }

                return { success: false, valid: false, issues, warnings };
            }

        } catch (error) {
            issues.push(`Error reading settings: ${error.message}`);
            console.log(`❌ Error validating configuration: ${error.message}`);
            return { success: false, issues, warnings };
        }
    }

    /**
     * Reset configuration to defaults
     */
    async resetConfiguration(options = {}) {
        console.log('🔄 Resetting configuration to defaults...\n');

        // Create backup unless explicitly skipped
        if (options.backup !== false) {
            await this.backupCurrentSettings();
        }

        // Apply basic template as default
        const templateName = options.template || 'basic';
        console.log(`Applying default template: ${templateName}`);
        
        return await this.applyTemplate(templateName, { backup: false });
    }

    /**
     * Show current configuration
     */
    async showCurrentConfiguration() {
        console.log('📋 Current Configuration\n');

        if (!fs.existsSync(this.settingsPath)) {
            console.log('❌ No configuration found');
            console.log(`💡 Run 'claude-commands configure --template basic' to create one`);
            return { success: false, error: 'No configuration found' };
        }

        try {
            const content = fs.readFileSync(this.settingsPath, 'utf8');
            const settings = parseJSONC(content);
            
            console.log(`Location: ${this.settingsPath}`);
            console.log(`Size: ${content.length} bytes`);
            
            const stats = fs.statSync(this.settingsPath);
            console.log(`Modified: ${stats.mtime.toLocaleString()}`);
            console.log(`\nSettings:`);
            console.log(JSON.stringify(settings, null, 2));

            return { success: true, settings };

        } catch (error) {
            console.error(`❌ Error reading configuration: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Backup current settings
     */
    async backupCurrentSettings() {
        if (!fs.existsSync(this.settingsPath)) {
            return null;
        }

        // Ensure backup directory exists
        if (!fs.existsSync(this.backupsDir)) {
            fs.mkdirSync(this.backupsDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(this.backupsDir, `settings-${timestamp}.json`);
        
        fs.copyFileSync(this.settingsPath, backupPath);
        console.log(`💾 Backed up current settings to: ${backupPath}`);
        
        return backupPath;
    }

    /**
     * Save configuration to file
     */
    async saveConfiguration(config) {
        try {
            // Ensure directory exists
            if (!fs.existsSync(this.claudeDir)) {
                fs.mkdirSync(this.claudeDir, { recursive: true });
            }

            // Write configuration
            const content = JSON.stringify(config, null, 2);
            fs.writeFileSync(this.settingsPath, content, { mode: 0o644 });

            console.log(`✅ Configuration saved to: ${this.settingsPath}`);
            return { success: true, path: this.settingsPath };

        } catch (error) {
            console.error(`❌ Failed to save configuration: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Resolve template path from name
     */
    resolveTemplatePath(templateName) {
        const variations = [
            templateName,
            `${templateName}.json`,
            `${templateName}-settings.json`
        ];

        // Map common aliases
        const aliases = {
            'basic': 'basic-settings.json',
            'comprehensive': 'comprehensive-settings.json',
            'security': 'security-focused-settings.json',
            'security-focused': 'security-focused-settings.json'
        };

        if (aliases[templateName]) {
            variations.unshift(aliases[templateName]);
        }

        for (const variant of variations) {
            const fullPath = path.join(this.templatesDir, variant);
            if (fs.existsSync(fullPath)) {
                return fullPath;
            }
        }

        return null;
    }

    /**
     * List available templates
     */
    listAvailableTemplates() {
        console.log('\n📋 Available templates:');
        
        try {
            const files = fs.readdirSync(this.templatesDir);
            const templates = files.filter(f => f.endsWith('.json'));
            
            templates.forEach(template => {
                const name = template.replace('.json', '').replace('-settings', '');
                console.log(`   • ${name}`);
            });

            console.log(`\n💡 Use: claude-commands configure --template <name>`);
        } catch (error) {
            console.error('Could not list templates');
        }
    }
}

module.exports = ConfigureCommand;