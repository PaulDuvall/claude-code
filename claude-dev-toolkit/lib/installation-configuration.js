const fs = require('fs');
const path = require('path');

/**
 * Manages installation configuration and validation
 * Extracted from InteractiveSetupWizard for better separation of concerns
 */
class InstallationConfiguration {
    constructor(packageRoot) {
        this.packageRoot = packageRoot;
        this.configFile = path.join(packageRoot, 'setup-config.json');
        
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

        this.configurationTemplates = [
            {
                id: 1,
                name: 'basic',
                description: 'Minimal settings for basic usage',
                filename: 'basic-settings.json'
            },
            {
                id: 2,
                name: 'comprehensive',
                description: 'Optimized for active development',
                filename: 'comprehensive-settings.json'
            },
            {
                id: 3,
                name: 'security-focused',
                description: 'Enhanced security settings',
                filename: 'security-focused-settings.json'
            }
        ];
    }

    /**
     * Get available installation types
     * @returns {Array} Installation types
     */
    getInstallationTypes() {
        return this.installationTypes;
    }

    /**
     * Get installation type by ID
     * @param {number} id - Installation type ID
     * @returns {Object|null} Installation type or null if not found
     */
    getInstallationTypeById(id) {
        return this.installationTypes.find(type => type.id === id) || null;
    }

    /**
     * Get available configuration templates
     * @returns {Array} Configuration templates
     */
    getConfigurationTemplates() {
        return this.configurationTemplates;
    }

    /**
     * Get configuration template by ID
     * @param {number} id - Template ID
     * @returns {Object|null} Template or null if not found
     */
    getConfigurationTemplateById(id) {
        return this.configurationTemplates.find(template => template.id === id) || null;
    }

    /**
     * Validate installation configuration
     * @param {Object} config - Configuration to validate
     * @returns {Object} Validation result with errors if any
     */
    validateConfiguration(config) {
        const result = {
            valid: true,
            errors: []
        };

        // Validate installation type
        if (!config.installationType) {
            result.errors.push('Installation type is required');
            result.valid = false;
        } else {
            // Handle both string names and numeric IDs
            let type;
            if (typeof config.installationType === 'number') {
                type = this.getInstallationTypeById(config.installationType);
            } else {
                // Find by name for backward compatibility
                const typeName = config.installationType.toLowerCase();
                type = this.installationTypes.find(t => 
                    t.name.toLowerCase().includes(typeName)
                );
            }
            if (!type) {
                result.errors.push('Invalid installation type');
                result.valid = false;
            }
        }

        // Validate selected commands (handle both array and string formats)
        if (config.selectedCommands) {
            if (!Array.isArray(config.selectedCommands)) {
                result.errors.push('Selected commands must be an array');
                result.valid = false;
            } else if (config.selectedCommands.length === 0) {
                result.errors.push('At least one command must be selected');
                result.valid = false;
            }
        } else if (config.commandSets && Array.isArray(config.commandSets)) {
            // Accept commandSets as an alternative to selectedCommands
            if (config.commandSets.length === 0) {
                result.errors.push('At least one command set must be selected');
                result.valid = false;
            }
        } else {
            result.errors.push('Selected commands or command sets must be provided');
            result.valid = false;
        }

        // Validate configuration template if provided
        if (config.configTemplate || config.template) {
            const templateValue = config.configTemplate || config.template;
            let template;
            
            if (typeof templateValue === 'number') {
                template = this.getConfigurationTemplateById(templateValue);
            } else {
                // Find by name for backward compatibility
                const lowerTemplateValue = templateValue.toLowerCase();
                template = this.configurationTemplates.find(t => 
                    t.name.toLowerCase().includes(lowerTemplateValue) ||
                    t.filename === templateValue ||
                    t.name.toLowerCase() === lowerTemplateValue
                );
            }
            
            if (!template) {
                result.errors.push('Invalid configuration template');
                result.valid = false;
            }
        }

        // Validate security hooks setting
        if (config.securityHooks !== undefined && typeof config.securityHooks !== 'boolean') {
            result.errors.push('Security hooks setting must be boolean');
            result.valid = false;
        }

        return result;
    }

    /**
     * Create default configuration
     * @returns {Object} Default configuration
     */
    createDefaultConfiguration() {
        return {
            installationType: 2, // Standard installation
            selectedCommands: this.installationTypes[1].commands,
            securityHooks: true,
            configTemplate: 2, // Development configuration
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        };
    }

    /**
     * Save configuration to file (supports both sync and async)
     * @param {Object} config - Configuration to save
     * @returns {boolean|Promise<boolean>} Success status
     */
    saveConfiguration(config) {
        try {
            const validation = this.validateConfiguration(config);
            if (!validation.valid) {
                throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
            }

            const configData = {
                ...config,
                savedAt: new Date().toISOString(),
                packageRoot: this.packageRoot
            };

            // Synchronous operation for backward compatibility
            fs.writeFileSync(
                this.configFile,
                JSON.stringify(configData, null, 2),
                'utf8'
            );

            return true;
        } catch (error) {
            console.error('Failed to save configuration:', error.message);
            return false;
        }
    }
    
    /**
     * Save configuration to file (async version)
     * @param {Object} config - Configuration to save
     * @returns {Promise<boolean>} Success status
     */
    async saveConfigurationAsync(config) {
        try {
            const validation = this.validateConfiguration(config);
            if (!validation.valid) {
                throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
            }

            const configData = {
                ...config,
                savedAt: new Date().toISOString(),
                packageRoot: this.packageRoot
            };

            await fs.promises.writeFile(
                this.configFile,
                JSON.stringify(configData, null, 2),
                'utf8'
            );

            return true;
        } catch (error) {
            console.error('Failed to save configuration:', error.message);
            return false;
        }
    }

    /**
     * Load configuration from file (supports both sync and async)
     * @returns {Object|null} Loaded configuration or null if not found
     */
    loadConfiguration() {
        try {
            if (!fs.existsSync(this.configFile)) {
                return null;
            }

            const data = fs.readFileSync(this.configFile, 'utf8');
            const config = JSON.parse(data);

            // Validate loaded configuration
            const validation = this.validateConfiguration(config);
            if (!validation.valid) {
                console.warn('Loaded configuration is invalid:', validation.errors);
                return null;
            }

            return config;
        } catch (error) {
            console.error('Failed to load configuration:', error.message);
            return null;
        }
    }
    
    /**
     * Load configuration from file (async version)
     * @returns {Promise<Object|null>} Loaded configuration or null if not found
     */
    async loadConfigurationAsync() {
        try {
            if (!fs.existsSync(this.configFile)) {
                return null;
            }

            const data = await fs.promises.readFile(this.configFile, 'utf8');
            const config = JSON.parse(data);

            // Validate loaded configuration
            const validation = this.validateConfiguration(config);
            if (!validation.valid) {
                console.warn('Loaded configuration is invalid:', validation.errors);
                return null;
            }

            return config;
        } catch (error) {
            console.error('Failed to load configuration:', error.message);
            return null;
        }
    }

    /**
     * Check if configuration file exists
     * @returns {boolean} True if configuration file exists
     */
    hasExistingConfiguration() {
        return fs.existsSync(this.configFile);
    }

    /**
     * Delete configuration file
     * @returns {Promise<boolean>} Success status
     */
    async deleteConfiguration() {
        try {
            if (fs.existsSync(this.configFile)) {
                await fs.promises.unlink(this.configFile);
            }
            return true;
        } catch (error) {
            console.error('Failed to delete configuration:', error.message);
            return false;
        }
    }

    /**
     * Get configuration file path
     * @returns {string} Configuration file path
     */
    getConfigurationPath() {
        return this.configFile;
    }

    /**
     * Create configuration backup
     * @returns {Promise<string|null>} Backup file path or null if failed
     */
    async createConfigurationBackup() {
        try {
            if (!fs.existsSync(this.configFile)) {
                return null;
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = `${this.configFile}.backup-${timestamp}`;
            
            await fs.promises.copyFile(this.configFile, backupPath);
            return backupPath;
        } catch (error) {
            console.error('Failed to create configuration backup:', error.message);
            return null;
        }
    }

    /**
     * Restore configuration from backup
     * @param {string} backupPath - Path to backup file
     * @returns {Promise<boolean>} Success status
     */
    async restoreConfigurationFromBackup(backupPath) {
        try {
            if (!fs.existsSync(backupPath)) {
                throw new Error('Backup file not found');
            }

            await fs.promises.copyFile(backupPath, this.configFile);
            return true;
        } catch (error) {
            console.error('Failed to restore configuration from backup:', error.message);
            return false;
        }
    }
}

module.exports = InstallationConfiguration;