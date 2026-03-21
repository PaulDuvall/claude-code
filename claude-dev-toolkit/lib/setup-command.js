#!/usr/bin/env node

/**
 * Setup Command Implementation
 * Replaces setup.sh functionality with npm package equivalent
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

class SetupCommand {
    constructor() {
        this.homeDir = process.env.TEST_HOME || os.homedir();
        this.claudeDir = path.join(this.homeDir, '.claude');
        this.commandsDir = path.join(this.claudeDir, 'commands');
        this.settingsFile = path.join(this.claudeDir, 'settings.json');
    }

    /**
     * Execute setup with options
     */
    async execute(options = {}) {
        console.log('🚀 Claude Dev Toolkit Setup\n');
        
        const {
            type = 'basic',
            commands = 'active',
            skipConfigure = false,
            skipHooks = false,
            force = false,
            dryRun = false
        } = options;

        if (dryRun) {
            return this.showDryRun(options);
        }

        try {
            // 1. Verify Claude Code availability (optional check)
            this.checkClaudeCode();

            // 2. Create directory structure
            await this.createDirectoryStructure(force);

            // 3. Install commands
            if (commands !== 'none') {
                await this.installCommands(commands);
            }

            // 4. Apply configuration template
            if (!skipConfigure) {
                await this.applyConfigurationTemplate(type);
            }

            // 5. Install hooks (if requested)
            if (!skipHooks) {
                await this.installHooks();
            }

            // 6. Verify installation
            await this.verifySetup();

            console.log('\n✅ Setup completed successfully!');
            console.log('\n💡 Next steps:');
            console.log('   • Run: claude-commands verify');
            console.log('   • Try: /xhelp in Claude Code to see all commands');

            return { success: true, message: 'Setup completed successfully' };

        } catch (error) {
            console.error(`\n❌ Setup failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Show dry run preview
     */
    showDryRun(options) {
        console.log('🔍 Dry Run - Preview of setup actions:\n');
        
        console.log('📁 Directory Structure:');
        console.log(`   • Create: ${this.claudeDir}`);
        console.log(`   • Create: ${this.commandsDir}`);
        
        if (!options.skipConfigure) {
            console.log('\n⚙️  Configuration:');
            console.log(`   • Apply template: ${options.type || 'basic'}`);
            console.log(`   • Create: ${this.settingsFile}`);
        }
        
        console.log('\n📦 Commands Installation:');
        const commandSet = options.commands || 'active';
        console.log(`   • Install: ${commandSet} command set`);
        
        if (!options.skipHooks) {
            console.log('\n🎣 Hooks:');
            console.log('   • Install security hooks');
            console.log('   • Configure file logging');
        }
        
        console.log('\n🔍 Verification:');
        console.log('   • Check installation completeness');
        console.log('   • Validate configuration');
        
        console.log('\n💡 This was a dry run - no changes were made');
        console.log('   Run without --dry-run to execute setup');
        
        return { success: true, dryRun: true };
    }

    /**
     * Check Claude Code availability
     */
    checkClaudeCode() {
        console.log('🔍 Checking Claude Code availability...');
        
        try {
            execSync('claude --version', { stdio: 'pipe' });
            console.log('   ✅ Claude Code detected');
        } catch (error) {
            console.log('   ⚠️  Claude Code not detected (optional)');
            console.log('   💡 Install with: npm install -g @anthropic-ai/claude-code');
        }
    }

    /**
     * Create directory structure
     */
    async createDirectoryStructure(force) {
        console.log('📁 Creating directory structure...');
        
        // Check if directories already exist
        if (fs.existsSync(this.claudeDir) && !force) {
            console.log('   ✅ ~/.claude directory already exists');
        } else {
            fs.mkdirSync(this.claudeDir, { recursive: true });
            console.log(`   ✅ Created: ${this.claudeDir}`);
        }
        
        if (!fs.existsSync(this.commandsDir)) {
            fs.mkdirSync(this.commandsDir, { recursive: true });
            console.log(`   ✅ Created: ${this.commandsDir}`);
        } else {
            console.log('   ✅ Commands directory already exists');
        }
    }

    /**
     * Install commands
     */
    async installCommands(commandSet) {
        console.log(`📦 Installing ${commandSet} commands...`);
        
        try {
            const installer = require('./installer');
            const options = {};
            
            switch (commandSet) {
                case 'active':
                    options.active = true;
                    break;
                case 'experiments':
                    options.experiments = true;
                    break;
                case 'all':
                    options.all = true;
                    break;
                default:
                    options.active = true;
            }
            
            await installer.install(options);
            console.log('   ✅ Commands installed successfully');
        } catch (error) {
            throw new Error(`Command installation failed: ${error.message}`);
        }
    }

    /**
     * Apply configuration template
     */
    async applyConfigurationTemplate(templateName) {
        console.log(`⚙️  Applying ${templateName} configuration template...`);
        
        try {
            const config = require('./config');
            await config.applyTemplate(templateName);
            console.log('   ✅ Configuration template applied');
        } catch (error) {
            console.log(`   ⚠️  Configuration template application failed: ${error.message}`);
            // Don't fail setup for configuration issues
        }
    }

    /**
     * Install hooks and their lib/ dependencies to ~/.claude/hooks/
     */
    async installHooks() {
        console.log('🎣 Installing hooks...');

        try {
            const hooksInstaller = require('./hook-installer');
            const targetHooksDir = path.join(this.claudeDir, 'hooks');
            const availableHooks = hooksInstaller.getAvailableHooks();
            const hookNames = availableHooks.map(h => h.name);

            const result = hooksInstaller.installSecurityHooks(
                targetHooksDir,
                hookNames,
                { force: true, backup: true }
            );

            if (result.success) {
                console.log(`   ✅ ${result.installed.length} hooks installed`);
            } else {
                console.log(`   ⚠️  Hook installation had issues: ${result.errors.join(', ')}`);
            }

            // Copy lib/ directory (shared modules required by most hooks)
            this._installHookLibs(targetHooksDir);

        } catch (error) {
            console.log(`   ⚠️  Hooks installation skipped: ${error.message}`);
        }
    }

    /**
     * Copy hooks/lib/ modules to target directory
     */
    _installHookLibs(targetHooksDir) {
        const sourceLibDir = path.join(__dirname, '..', 'hooks', 'lib');
        const targetLibDir = path.join(targetHooksDir, 'lib');

        if (!fs.existsSync(sourceLibDir)) {
            return;
        }

        fs.mkdirSync(targetLibDir, { recursive: true });

        const libFiles = fs.readdirSync(sourceLibDir).filter(f => f.endsWith('.sh'));
        for (const file of libFiles) {
            const content = fs.readFileSync(path.join(sourceLibDir, file), 'utf8');
            fs.writeFileSync(path.join(targetLibDir, file), content, { mode: 0o755 });
        }

        console.log(`   ✅ ${libFiles.length} lib modules installed`);
    }

    /**
     * Verify setup completion
     */
    async verifySetup() {
        console.log('🔍 Verifying setup...');
        
        const issues = [];
        
        // Check directory structure
        if (!fs.existsSync(this.claudeDir)) {
            issues.push('Claude directory not found');
        }
        
        if (!fs.existsSync(this.commandsDir)) {
            issues.push('Commands directory not found');
        }
        
        // Check command installation
        try {
            const commands = fs.readdirSync(this.commandsDir).filter(f => f.endsWith('.md'));
            if (commands.length === 0) {
                issues.push('No commands installed');
            } else {
                console.log(`   ✅ ${commands.length} commands installed`);
            }
        } catch (error) {
            issues.push('Cannot read commands directory');
        }
        
        // Check hooks installation
        const hooksDir = path.join(this.claudeDir, 'hooks');
        if (fs.existsSync(hooksDir)) {
            const hooks = fs.readdirSync(hooksDir).filter(f => f.endsWith('.sh'));
            if (hooks.length > 0) {
                console.log(`   ✅ ${hooks.length} hooks installed`);
            } else {
                issues.push('Hooks directory exists but no hooks found');
            }
        } else {
            issues.push('Hooks directory not found');
        }

        // Check configuration
        if (fs.existsSync(this.settingsFile)) {
            console.log('   ✅ Configuration file present');
        } else {
            console.log('   ⚠️  No configuration file (will use defaults)');
        }
        
        if (issues.length > 0) {
            console.log('   ⚠️  Issues detected:');
            issues.forEach(issue => console.log(`      • ${issue}`));
            throw new Error(`Setup verification failed: ${issues.join(', ')}`);
        }
        
        console.log('   ✅ Setup verification passed');
    }

    /**
     * Get available templates
     */
    getAvailableTemplates() {
        const templatesDir = path.join(__dirname, '..', 'templates');
        try {
            return fs.readdirSync(templatesDir)
                .filter(f => f.endsWith('.json'))
                .map(f => f.replace('.json', ''));
        } catch (error) {
            return ['basic', 'comprehensive', 'security-focused'];
        }
    }

    /**
     * Get help text for setup command
     */
    getHelpText() {
        return `
Setup the Claude Dev Toolkit with custom commands and configuration.

This command replaces the functionality of setup.sh script, providing
a complete installation and configuration of the Claude Code toolkit.

Usage:
  claude-commands setup [options]

Options:
  --type <template>         Configuration template to apply
                           (basic, comprehensive, security-focused)
  --commands <set>         Command set to install 
                           (active, experiments, all, none)
  --skip-configure         Skip configuration step
  --skip-hooks            Skip hooks installation  
  --force                 Overwrite existing installation
  --dry-run              Preview actions without executing

Examples:
  claude-commands setup
  claude-commands setup --type comprehensive --commands all
  claude-commands setup --dry-run
  claude-commands setup --type security-focused --skip-hooks

This command performs the equivalent of running setup.sh with intelligent
defaults and enhanced error handling.
        `.trim();
    }
}

module.exports = SetupCommand;