const readline = require('readline');

/**
 * Handles user interface interactions for the setup wizard
 * Extracted from InteractiveSetupWizard for better separation of concerns
 */
class SetupWizardUI {
    constructor() {
        this.rl = null;
    }

    /**
     * Create readline interface
     */
    createInterface() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    /**
     * Close readline interface
     */
    closeInterface() {
        if (this.rl) {
            this.rl.close();
            this.rl = null;
        }
    }

    /**
     * Display welcome message
     */
    showWelcome() {
        console.log('\n🚀 Claude Code Custom Commands Setup Wizard');
        console.log('='.repeat(50));
        console.log('Welcome to the interactive setup wizard!');
        console.log('This will guide you through configuring your Claude Code toolkit.\n');
    }

    /**
     * Display installation types menu
     * @param {Array} installationTypes - Available installation types
     */
    showInstallationTypes(installationTypes) {
        console.log('📦 Installation Types:');
        console.log('-'.repeat(25));
        installationTypes.forEach(type => {
            console.log(`${type.id}. ${type.name}`);
            console.log(`   ${type.description}`);
            console.log('');
        });
    }

    /**
     * Display command categories
     * @param {Object} commandCategories - Available command categories
     */
    showCommandCategories(commandCategories) {
        console.log('\n📋 Available Command Categories:');
        console.log('-'.repeat(35));
        Object.entries(commandCategories).forEach(([category, commands], index) => {
            console.log(`${index + 1}. ${category.charAt(0).toUpperCase() + category.slice(1)} (${commands.length} commands)`);
            console.log(`   Commands: ${commands.join(', ')}`);
        });
    }

    /**
     * Display available hooks
     * @param {Array} availableHooks - Available security hooks
     */
    showAvailableHooks(availableHooks) {
        console.log('\n🔒 Available Security Hooks:');
        console.log('-'.repeat(30));
        availableHooks.forEach((hook, index) => {
            console.log(`${index + 1}. ${hook.name}`);
            if (hook.description) {
                console.log(`   ${hook.description}`);
            }
        });
    }

    /**
     * Display configuration templates
     * @param {Array} templates - Available configuration templates
     */
    showConfigurationTemplates(templates) {
        console.log('\n⚙️ Configuration Templates:');
        console.log('-'.repeat(28));
        templates.forEach((template, index) => {
            console.log(`${index + 1}. ${template.name}`);
            console.log(`   ${template.description}`);
        });
    }

    /**
     * Prompt user for input
     * @param {string} question - Question to ask
     * @returns {Promise<string>} User's response
     */
    prompt(question) {
        return new Promise((resolve) => {
            this.rl.question(question, (answer) => {
                resolve(answer.trim());
            });
        });
    }

    /**
     * Prompt for yes/no confirmation
     * @param {string} question - Question to ask
     * @param {boolean} defaultValue - Default value if user just presses enter
     * @returns {Promise<boolean>} User's confirmation
     */
    async confirmPrompt(question, defaultValue = false) {
        const defaultText = defaultValue ? '[Y/n]' : '[y/N]';
        const answer = await this.prompt(`${question} ${defaultText}: `);
        
        if (answer === '') {
            return defaultValue;
        }
        
        return answer.toLowerCase().startsWith('y');
    }

    /**
     * Prompt for numeric choice
     * @param {string} question - Question to ask
     * @param {number} min - Minimum valid number
     * @param {number} max - Maximum valid number
     * @returns {Promise<number>} User's choice
     */
    async numericPrompt(question, min = 1, max = 10) {
        while (true) {
            const answer = await this.prompt(question);
            const num = parseInt(answer);
            
            if (!isNaN(num) && num >= min && num <= max) {
                return num;
            }
            
            console.log(`❌ Please enter a number between ${min} and ${max}`);
        }
    }

    /**
     * Prompt for multiple choices
     * @param {string} question - Question to ask
     * @param {Array} choices - Available choices
     * @returns {Promise<Array<number>>} User's choices
     */
    async multipleChoicePrompt(question, choices) {
        const answer = await this.prompt(`${question} (comma-separated numbers, or 'all'): `);
        
        if (answer.toLowerCase() === 'all') {
            return choices.map((_, index) => index + 1);
        }
        
        const selected = answer.split(',')
            .map(s => parseInt(s.trim()))
            .filter(n => !isNaN(n) && n >= 1 && n <= choices.length);
            
        return selected.length > 0 ? selected : [1]; // Default to first choice
    }

    /**
     * Display setup summary
     * @param {Object} config - Setup configuration
     */
    showSetupSummary(config) {
        console.log('\n📋 Setup Summary:');
        console.log('='.repeat(20));
        console.log(`Installation Type: ${config.installationType}`);
        console.log(`Commands: ${config.selectedCommands.length} selected`);
        console.log(`Security Hooks: ${config.securityHooks ? 'Yes' : 'No'}`);
        console.log(`Configuration Template: ${config.configTemplate || 'None'}`);
        console.log('');
    }

    /**
     * Display progress indicator
     * @param {string} step - Current step
     * @param {number} current - Current step number
     * @param {number} total - Total steps
     */
    showProgress(step, current, total) {
        const progress = '█'.repeat(Math.floor((current / total) * 20));
        const empty = '░'.repeat(20 - progress.length);
        console.log(`\n[${progress}${empty}] Step ${current}/${total}: ${step}`);
    }

    /**
     * Display completion message
     * @param {Object} result - Setup result
     */
    showCompletion(result) {
        console.log('\n🎉 Setup Complete!');
        console.log('='.repeat(20));
        
        if (result.success) {
            console.log('✅ Claude Code toolkit has been successfully configured!');
            console.log(`📦 Installed ${result.installedCount} commands`);
            if (result.hooksInstalled) {
                console.log('🔒 Security hooks installed');
            }
            if (result.configApplied) {
                console.log('⚙️ Configuration template applied');
            }
        } else {
            console.log('❌ Setup encountered issues:');
            result.errors.forEach(error => console.log(`   • ${error}`));
        }
    }

    /**
     * Display error message
     * @param {string} message - Error message
     * @param {Error} error - Optional error object
     */
    showError(message, error = null) {
        console.log(`\n❌ Error: ${message}`);
        if (error && error.message) {
            console.log(`   Details: ${error.message}`);
        }
    }

    /**
     * Display warning message
     * @param {string} message - Warning message
     */
    showWarning(message) {
        console.log(`\n⚠️ Warning: ${message}`);
    }

    /**
     * Display info message
     * @param {string} message - Info message
     */
    showInfo(message) {
        console.log(`\nℹ️ ${message}`);
    }
}

module.exports = SetupWizardUI;