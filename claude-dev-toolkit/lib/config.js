// Configuration management for Claude Dev Toolkit
const path = require('path');
const os = require('os');
const fs = require('fs');

/**
 * Parse JSONC (JSON with Comments) format
 * Handles comment key-value pairs and block comments
 * @param {string} content - Raw JSONC content
 * @returns {Object} - Parsed JSON object
 * @throws {Error} - If JSON parsing fails
 */
function parseJSONC(content) {
    const lines = content.split('\n');
    const cleanedLines = [];
    
    for (const line of lines) {
        // Skip lines that are comment key-value pairs like '"// comment": "value",'
        if (line.trim().match(/^"\/\/[^"]*":\s*"[^"]*",?\s*$/)) {
            continue;
        }
        // Skip pure comment lines
        if (line.trim().startsWith('//')) {
            continue;
        }
        cleanedLines.push(line);
    }
    
    const cleanedContent = cleanedLines.join('\n')
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
        .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
    
    return JSON.parse(cleanedContent);
}

/**
 * Deep merge two objects, with second object taking precedence
 * @param {Object} target - Target object to merge into
 * @param {Object} source - Source object to merge from
 * @returns {Object} - Merged object
 */
function deepMerge(target, source) {
    const result = { ...target };
    
    for (const [key, value] of Object.entries(source)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            result[key] = deepMerge(result[key] || {}, value);
        } else {
            result[key] = value;
        }
    }
    
    return result;
}

/**
 * Apply a configuration template to Claude Code settings
 * Implements REQ-009: Configuration Template Application
 * 
 * @param {string} templatePath - Path to the template file
 * @param {string} settingsPath - Path to the settings file to create/update  
 * @returns {boolean} - True if successful, false otherwise
 */
function applyConfigurationTemplate(templatePath, settingsPath) {
    try {
        // Validate inputs
        if (!templatePath || !settingsPath) {
            return false;
        }

        // Check if template exists
        if (!fs.existsSync(templatePath)) {
            return false;
        }

        // Read and parse template (handle JSONC with comments)
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        let templateData;
        
        try {
            templateData = parseJSONC(templateContent);
        } catch (parseError) {
            // Invalid JSON/JSONC format
            return false;
        }

        // Validate template data
        if (!templateData || typeof templateData !== 'object') {
            return false;
        }

        // Read existing settings if they exist
        let existingSettings = {};
        if (fs.existsSync(settingsPath)) {
            try {
                const existingContent = fs.readFileSync(settingsPath, 'utf8');
                existingSettings = JSON.parse(existingContent);
            } catch (parseError) {
                // If existing settings are invalid, start fresh but log the issue
                existingSettings = {};
            }
        }

        // Deep merge template with existing settings (template takes precedence)
        const mergedSettings = deepMerge(existingSettings, templateData);

        // Ensure target directory exists with correct permissions
        const settingsDir = path.dirname(settingsPath);
        fs.mkdirSync(settingsDir, { recursive: true, mode: 0o755 });

        // Write merged settings with formatted output
        const settingsJson = JSON.stringify(mergedSettings, null, 2);
        fs.writeFileSync(settingsPath, settingsJson, { mode: 0o644 });

        // Verify file was created successfully
        return fs.existsSync(settingsPath);

    } catch (error) {
        // Log error in development but don't expose details
        if (process.env.NODE_ENV === 'development') {
            console.error('Configuration template application error:', error);
        }
        return false;
    }
}

/**
 * Get available configuration templates
 * @param {string} templatesDir - Directory containing templates
 * @returns {Array} - List of available templates with metadata
 */
function getAvailableTemplates(templatesDir) {
    try {
        const templates = [];
        const files = fs.readdirSync(templatesDir);
        
        for (const file of files) {
            if (file.endsWith('.json')) {
                const templatePath = path.join(templatesDir, file);
                try {
                    const content = fs.readFileSync(templatePath, 'utf8');
                    const data = parseJSONC(content);
                    
                    templates.push({
                        id: path.basename(file, '.json'),
                        name: file,
                        path: templatePath,
                        description: getTemplateDescription(file, data),
                        features: Object.keys(data).filter(key => !key.startsWith('//')).length
                    });
                } catch (error) {
                    // Skip invalid templates
                    continue;
                }
            }
        }
        
        return templates;
    } catch (error) {
        return [];
    }
}

/**
 * Get human-readable description for a template
 * @param {string} filename - Template filename
 * @param {Object} data - Parsed template data
 * @returns {string} - Human-readable description
 */
function getTemplateDescription(filename, data) {
    // Check for explicit description in template
    if (data['// Description']) {
        return data['// Description'];
    }
    
    // Generate description based on filename
    const basename = path.basename(filename, '.json');
    switch (basename) {
        case 'basic-settings':
            return 'Minimal configuration for getting started with Claude Code';
        case 'comprehensive-settings':
            return 'Full-featured configuration with all available options';
        case 'security-focused-settings':
            return 'Security-enhanced configuration with additional protections';
        default:
            return `Configuration template: ${basename}`;
    }
}

/**
 * GREEN PHASE: Config Command CLI Handler
 * Implements claude-commands config feature requirements
 */
class ConfigManager {
    constructor() {
        this.templatesDir = path.join(__dirname, '..', 'templates');
        this.claudeDir = path.join(os.homedir(), '.claude');
        this.settingsPath = path.join(this.claudeDir, 'settings.json');
    }

    // REQ-CONFIG-001: List Templates
    listTemplates() {
        console.log('📋 Available Configuration Templates:\n');
        
        try {
            if (!fs.existsSync(this.templatesDir)) {
                console.log('❌ Templates directory not found');
                return;
            }

            const templates = getAvailableTemplates(this.templatesDir);

            if (templates.length === 0) {
                console.log('No configuration templates found');
                return;
            }

            templates.forEach(template => {
                console.log(`  📄 ${template.name}`);
                console.log(`     ${template.description}`);
            });

            console.log(`\n💡 Usage: claude-commands config --template <name>`);
        } catch (error) {
            console.error('❌ Error listing templates:', error.message);
        }
    }

    // REQ-CONFIG-002: Apply Template
    applyTemplate(templateName) {
        try {
            // Resolve template name to full filename
            const resolvedTemplate = this.resolveTemplateName(templateName);
            if (!resolvedTemplate) {
                this.handleTemplateNotFound(templateName);
                return false;
            }

            const templatePath = path.join(this.templatesDir, resolvedTemplate);
            if (!fs.existsSync(templatePath)) {
                this.handleTemplateNotFound(templateName);
                return false;
            }

            // Ensure Claude directory exists
            this.ensureClaudeDirectory();

            // Backup existing settings if present
            this.backupExistingSettings();

            // Apply template using existing function
            const success = applyConfigurationTemplate(templatePath, this.settingsPath);
            
            if (success) {
                console.log(`✅ Successfully applied template '${templateName}' (${resolvedTemplate})`);
                console.log(`📝 Configuration saved to: ${this.settingsPath}`);
                return true;
            } else {
                console.error(`❌ Failed to apply template '${templateName}'`);
                return false;
            }
        } catch (error) {
            console.error('❌ Error applying template:', error.message);
            return false;
        }
    }

    // Helper method to resolve template names (supports short names)
    resolveTemplateName(templateName) {
        // Return as-is if it already has .json extension
        if (templateName.endsWith('.json')) {
            return templateName;
        }

        // Map short names to full filenames
        const templateMap = {
            'basic': 'basic-settings.json',
            'comprehensive': 'comprehensive-settings.json',
            'security-focused': 'security-focused-settings.json',
            'security': 'security-focused-settings.json'
        };

        // Check if it's a known short name
        if (templateMap[templateName]) {
            return templateMap[templateName];
        }

        // Try adding .json extension
        const withExtension = `${templateName}.json`;
        if (fs.existsSync(path.join(this.templatesDir, withExtension))) {
            return withExtension;
        }

        // Try adding -settings.json extension
        const withSettingsExtension = `${templateName}-settings.json`;
        if (fs.existsSync(path.join(this.templatesDir, withSettingsExtension))) {
            return withSettingsExtension;
        }

        return null;
    }

    // Helper method for template not found error
    handleTemplateNotFound(templateName) {
        console.error(`❌ Template '${templateName}' not found.`);
        this.listTemplates();
    }

    // Helper method to ensure Claude directory exists
    ensureClaudeDirectory() {
        if (!fs.existsSync(this.claudeDir)) {
            fs.mkdirSync(this.claudeDir, { recursive: true });
            console.log(`📁 Created directory: ${this.claudeDir}`);
        }
    }

    // Helper method to backup existing settings
    backupExistingSettings() {
        if (fs.existsSync(this.settingsPath)) {
            const backupPath = this.createBackup();
            console.log(`💾 Backed up existing settings to: ${backupPath}`);
        }
    }

    // REQ-CONFIG-002: Backup functionality
    createBackup() {
        const timestamp = new Date().toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '-')
            .split('.')[0]; // YYYY-MM-DD-HHMMSS format
        
        const backupPath = `${this.settingsPath}.backup.${timestamp}`;
        fs.copyFileSync(this.settingsPath, backupPath);
        return backupPath;
    }

    // REQ-CONFIG-003: Show Help
    showHelp() {
        console.log('🔧 Claude Commands Config Tool\n');
        console.log('Usage:');
        console.log('  claude-commands config [options]\n');
        console.log('Options:');
        console.log('  -l, --list                List available configuration templates');
        console.log('  -t, --template <name>     Apply configuration template');
        console.log('  -h, --help                Show this help message\n');
        console.log('Examples:');
        console.log('  claude-commands config --list                    # Show available templates');
        console.log('  claude-commands config --template comprehensive  # Apply comprehensive template');
        console.log('  claude-commands config --template basic          # Apply basic template');
        console.log('  claude-commands config --help                    # Show this help\n');
        console.log('Description:');
        console.log('  Manage Claude Code configuration templates. Templates are applied');
        console.log('  to ~/.claude/settings.json with automatic backup of existing settings.');
    }

    // Main command handler
    handleCommand(options) {
        // REQ-CONFIG-003: Show help when no options or explicit help
        if (!options.list && !options.template) {
            this.showHelp();
            return;
        }

        // REQ-CONFIG-001: List templates
        if (options.list) {
            this.listTemplates();
            return;
        }

        // REQ-CONFIG-002: Apply template
        if (options.template) {
            const success = this.applyTemplate(options.template);
            if (!success) {
                process.exit(1);
            }
            return;
        }
    }
}

// Create config manager instance
const configManager = new ConfigManager();

module.exports = {
    getConfigPath: () => {
        return path.join(os.homedir(), '.claude', 'commands');
    },
    
    defaultConfig: {
        commandsPath: './commands',
        hooksEnabled: true,
        colorOutput: true
    },

    // REQ-009 Implementation (existing)
    applyConfigurationTemplate,
    getAvailableTemplates,
    
    // Utility functions (exposed for testing)
    parseJSONC,
    deepMerge,
    getTemplateDescription,

    // CLI command handler (new)
    handleCommand: (options) => configManager.handleCommand(options),
    ConfigManager
};
