const path = require('path');

/**
 * Manages command selection and categorization
 * Extracted from InteractiveSetupWizard for better separation of concerns
 */
class CommandSelector {
    constructor() {
        this.commandCategories = {
            'planning': ['xplanning', 'xspec', 'xarchitecture'],
            'development': ['xgit', 'xtest', 'xquality', 'xrefactor', 'xtdd'],
            'security': ['xsecurity', 'xpolicy', 'xcompliance'],
            'deployment': ['xrelease', 'xpipeline', 'xinfra'],
            'documentation': ['xdocs']
        };

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

    /**
     * Get available command categories
     * @returns {Object} Command categories with commands
     */
    getCommandCategories() {
        return this.commandCategories;
    }

    /**
     * Get category names
     * @returns {Array<string>} Category names
     */
    getCategoryNames() {
        return Object.keys(this.commandCategories);
    }

    /**
     * Get commands for a specific category
     * @param {string} category - Category name
     * @returns {Array<string>} Commands in category
     */
    getCommandsForCategory(category) {
        return this.commandCategories[category] || [];
    }

    /**
     * Select command sets based on categories
     * @param {Array<string>} categories - Selected categories
     * @returns {Object} Selection result with commands
     */
    selectCommandSets(categories) {
        const validCategories = categories.filter(cat => 
            this.commandCategories.hasOwnProperty(cat)
        );

        return {
            selected: validCategories,
            commands: validCategories.flatMap(cat => this.commandCategories[cat] || []),
            invalid: categories.filter(cat => !this.commandCategories.hasOwnProperty(cat))
        };
    }

    /**
     * Get all available commands
     * @returns {Array<string>} All commands across categories
     */
    getAllCommands() {
        return Object.values(this.commandCategories).flat();
    }

    /**
     * Get command count for each category
     * @returns {Object} Category names mapped to command counts
     */
    getCategoryCommandCounts() {
        const counts = {};
        Object.entries(this.commandCategories).forEach(([category, commands]) => {
            counts[category] = commands.length;
        });
        return counts;
    }

    /**
     * Find category for a specific command
     * @param {string} command - Command name
     * @returns {string|null} Category name or null if not found
     */
    findCategoryForCommand(command) {
        for (const [category, commands] of Object.entries(this.commandCategories)) {
            if (commands.includes(command)) {
                return category;
            }
        }
        return null;
    }

    /**
     * Get available presets
     * @returns {Object} Available presets
     */
    getPresets() {
        return this.presets;
    }

    /**
     * Get preset names
     * @returns {Array<string>} Preset names
     */
    getPresetNames() {
        return Object.keys(this.presets);
    }

    /**
     * Apply a preset configuration
     * @param {string} presetName - Name of preset to apply
     * @returns {Object|null} Preset configuration or null if not found
     */
    applyPreset(presetName) {
        return this.presets[presetName] || null;
    }

    /**
     * Validate command selection
     * @param {Array<string>} commands - Commands to validate
     * @returns {Object} Validation result
     */
    validateCommandSelection(commands) {
        const allCommands = this.getAllCommands();
        const valid = commands.filter(cmd => allCommands.includes(cmd));
        const invalid = commands.filter(cmd => !allCommands.includes(cmd));

        return {
            valid: invalid.length === 0,
            validCommands: valid,
            invalidCommands: invalid,
            errors: invalid.length > 0 ? [`Invalid commands: ${invalid.join(', ')}`] : []
        };
    }

    /**
     * Get command statistics
     * @returns {Object} Statistics about commands and categories
     */
    getCommandStats() {
        const totalCommands = this.getAllCommands().length;
        const categoryCount = Object.keys(this.commandCategories).length;
        const presetCount = Object.keys(this.presets).length;

        return {
            totalCommands,
            categoryCount,
            presetCount,
            averageCommandsPerCategory: Math.round(totalCommands / categoryCount),
            categoriesWithCounts: this.getCategoryCommandCounts()
        };
    }

    /**
     * Add new command category
     * @param {string} category - Category name
     * @param {Array<string>} commands - Commands in category
     * @returns {boolean} Success status
     */
    addCommandCategory(category, commands) {
        if (this.commandCategories.hasOwnProperty(category)) {
            return false; // Category already exists
        }

        this.commandCategories[category] = [...commands];
        return true;
    }

    /**
     * Remove command category
     * @param {string} category - Category name to remove
     * @returns {boolean} Success status
     */
    removeCommandCategory(category) {
        if (!this.commandCategories.hasOwnProperty(category)) {
            return false; // Category doesn't exist
        }

        delete this.commandCategories[category];
        return true;
    }

    /**
     * Add command to existing category
     * @param {string} category - Category name
     * @param {string} command - Command to add
     * @returns {boolean} Success status
     */
    addCommandToCategory(category, command) {
        if (!this.commandCategories.hasOwnProperty(category)) {
            return false; // Category doesn't exist
        }

        if (this.commandCategories[category].includes(command)) {
            return false; // Command already exists in category
        }

        this.commandCategories[category].push(command);
        return true;
    }

    /**
     * Remove command from category
     * @param {string} category - Category name
     * @param {string} command - Command to remove
     * @returns {boolean} Success status
     */
    removeCommandFromCategory(category, command) {
        if (!this.commandCategories.hasOwnProperty(category)) {
            return false; // Category doesn't exist
        }

        const index = this.commandCategories[category].indexOf(command);
        if (index === -1) {
            return false; // Command not in category
        }

        this.commandCategories[category].splice(index, 1);
        return true;
    }
}

module.exports = CommandSelector;