#!/usr/bin/env node

/**
 * Interactive Setup Wizard for REQ-007
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const SetupWizardUI = require('./setup-wizard-ui');
const InstallationConfiguration = require('./installation-configuration');
const CommandSelector = require('./command-selector');

function getDefaultConfig() {
    return {
        installationType: 'standard',
        commandSets: ['development', 'planning'],
        securityHooks: true,
        selectedHooks: ['credential-protection'],
        template: 'basic'
    };
}

function buildConfigResult(success, configPath) {
    return {
        saved: success,
        file: success ? configPath : null,
        error: success ? null : 'Failed to save configuration'
    };
}

function buildSecurityHooksList() {
    return [
        { id: 1, name: 'credential-protection', description: 'Prevents credential exposure in commits', file: 'prevent-credential-exposure.sh' },
        { id: 2, name: 'file-logger', description: 'Logs file operations for audit trail', file: 'file-logger.sh' },
        { id: 3, name: 'pre-commit-quality', description: 'Code quality checks before commits', file: 'pre-commit-quality.sh' },
        { id: 4, name: 'pre-write-security', description: 'Security scan before file writes', file: 'pre-write-security.sh' },
        { id: 5, name: 'pre-commit-test-runner', description: 'Auto-detects and runs project tests before commits', file: 'pre-commit-test-runner.sh' },
        { id: 6, name: 'verify-before-edit', description: 'Warns about fabricated references in edits', file: 'verify-before-edit.sh' },
        { id: 7, name: 'audit-bash-commands', description: 'Logs shell commands for security audit', file: 'audit-bash-commands.sh' },
        { id: 8, name: 'log-all-operations', description: 'Audit trail for all tool usage', file: 'log-all-operations.sh' },
        { id: 9, name: 'validate-changes', description: 'Post-edit validation of changes', file: 'validate-changes.sh' },
        { id: 10, name: 'backup-before-edit', description: 'Preserves file state before modifications', file: 'backup-before-edit.sh' },
        { id: 11, name: 'session-init', description: 'Validates environment at session start', file: 'session-init.sh' },
        { id: 12, name: 'session-cleanup', description: 'End-of-session security cleanup', file: 'session-cleanup.sh' },
        { id: 13, name: 'prompt-security-scan', description: 'Scans prompts for credential exposure risks', file: 'prompt-security-scan.sh' }
    ];
}

function enhanceConfig(configData) {
    return { timestamp: new Date().toISOString(), version: '1.0.0', ...configData };
}

class InteractiveSetupWizard {
    constructor(packageRoot) {
        this.packageRoot = packageRoot;

        const config = require('./config');
        this.applyConfigurationTemplate = config.applyConfigurationTemplate;

        const hookInstaller = require('./hook-installer');
        this.installSecurityHooks = hookInstaller.installSecurityHooks;
        this.getAvailableHooks = hookInstaller.getAvailableHooks;

        this.ui = new SetupWizardUI();
        this.config = new InstallationConfiguration(packageRoot);
        this.commandSelector = new CommandSelector();
        this.securityHooks = buildSecurityHooksList();
    }

    validateEnvironment() {
        try {
            const testFile = path.join(this.packageRoot, '.test');
            fs.writeFileSync(testFile, 'test');
            fs.unlinkSync(testFile);
            return { valid: true, message: 'Environment validation passed' };
        } catch (error) {
            return { valid: false, message: `Environment validation failed: ${error.message}` };
        }
    }

    getInstallationTypes() {
        return this.config.getInstallationTypes();
    }

    selectInstallationType(optionId) {
        const selected = this.config.getInstallationTypeById(optionId);
        if (!selected) return null;
        return { type: selected.name.toLowerCase().split(' ')[0], description: selected.description, commands: selected.commands };
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
        const selected = hookIds.map(id => this.securityHooks.find(h => h.id === id)).filter(Boolean);
        return { enabled: selected.length > 0, selected: selected.map(h => h.name) };
    }

    getConfigurationTemplates() {
        return this.config.getConfigurationTemplates();
    }

    selectConfigurationTemplate(templateName) {
        const template = this.config.getConfigurationTemplates().find(t => t.name === templateName);
        if (!template) return null;
        return { template: template.name, file: template.filename, description: template.description };
    }

    runNonInteractiveSetup() {
        const cfg = getDefaultConfig();
        this.saveConfiguration(cfg);
        return { completed: true, configuration: cfg };
    }

    async runNonInteractiveSetupAsync() {
        const cfg = getDefaultConfig();
        await this.saveConfigurationAsync(cfg);
        return { completed: true, configuration: cfg };
    }

    saveConfiguration(configData) {
        const success = this.config.saveConfiguration(enhanceConfig(configData));
        return buildConfigResult(success, this.config.getConfigurationPath());
    }

    async saveConfigurationAsync(configData) {
        const success = await this.config.saveConfigurationAsync(enhanceConfig(configData));
        return buildConfigResult(success, this.config.getConfigurationPath());
    }

    loadConfiguration() {
        const data = this.config.loadConfiguration();
        return data ? { found: true, config: data } : { found: false };
    }

    async loadConfigurationAsync() {
        const data = await this.config.loadConfigurationAsync();
        return data ? { found: true, config: data } : { found: false };
    }

    applyPreset(presetName) {
        return this.commandSelector.applyPreset(presetName);
    }

    async promptInstallationType(ask) {
        console.log('\n📦 Installation Type:');
        this.installationTypes.forEach(t => console.log(`${t.id}. ${t.name}\n   ${t.description}`));
        const choice = await ask('\nSelect installation type (1-3): ');
        return this.selectInstallationType(parseInt(choice));
    }

    async promptCommandSets(ask) {
        console.log('\n🛠️  Command Sets:');
        const cats = Object.keys(this.commandCategories);
        cats.forEach((c, i) => console.log(`${i + 1}. ${c} (${this.commandCategories[c].length} commands)`));
        const choice = await ask('\nSelect command sets (comma-separated numbers): ');
        return choice.split(',').map(s => cats[parseInt(s.trim()) - 1]).filter(Boolean);
    }

    async promptSecurityHooks(ask, config) {
        const enable = await ask('\n🔒 Enable security hooks? (y/n): ');
        if (enable.toLowerCase() !== 'y') {
            config.securityHooks = false;
            config.selectedHooks = [];
            return;
        }
        console.log('\nAvailable hooks:');
        this.securityHooks.forEach(h => console.log(`${h.id}. ${h.name}\n   ${h.description}`));
        const choice = await ask('\nSelect hooks (comma-separated numbers): ');
        const ids = choice.split(',').map(h => parseInt(h.trim()));
        const selected = this.selectSecurityHooks(ids);
        config.securityHooks = selected.enabled;
        config.selectedHooks = selected.selected;
    }

    async promptAndApplyTemplate(ask, config) {
        console.log('\n⚙️  Configuration Templates:');
        this.configurationTemplates.forEach(t => console.log(`${t.id}. ${t.name}\n   ${t.description}`));
        const choice = await ask('\nSelect template (1-3): ');
        const tpl = this.configurationTemplates.find(t => t.id === parseInt(choice));
        if (!tpl) return;
        config.template = tpl.name;
        await this.saveConfigurationAsync(config);
        const tplPath = path.join(this.packageRoot, 'templates', tpl.filename);
        const settingsPath = path.join(require('os').homedir(), '.claude', 'settings.json');
        console.log(`\n📋 Applying configuration template: ${tpl.name}`);
        const applied = this.applyConfigurationTemplate(tplPath, settingsPath);
        config.templateApplied = applied;
        if (applied) {
            config.settingsPath = settingsPath;
            console.log(`✅ Template applied to: ${settingsPath}`);
        } else {
            console.log('⚠️  Template application failed, but setup will continue');
        }
    }

    async collectSetupChoices(ask) {
        const config = {};
        const selectedType = await this.promptInstallationType(ask);
        if (selectedType) config.installationType = selectedType.type;
        config.commandSets = await this.promptCommandSets(ask);
        await this.promptSecurityHooks(ask, config);
        await this.promptAndApplyTemplate(ask, config);
        return config;
    }

    async runInteractiveSetup() {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const ask = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));
        console.log('\n🚀 Claude Dev Toolkit Interactive Setup Wizard');
        console.log('='.repeat(50));
        try {
            const config = await this.collectSetupChoices(ask);
            console.log('\n✅ Setup completed successfully!');
            rl.close();
            return { completed: true, configuration: config };
        } catch (error) {
            rl.close();
            return { completed: false, error: error.message };
        }
    }
}

class PostInstaller {
    constructor() {
        this.packageRoot = path.join(require('os').homedir(), '.claude');
    }

    runSetupWizard(options = {}) {
        if (options.skipSetup) return { skipped: true };
        const wizard = new InteractiveSetupWizard(this.packageRoot);
        return wizard.runNonInteractiveSetup();
    }
}

module.exports = InteractiveSetupWizard;
module.exports.PostInstaller = PostInstaller;
