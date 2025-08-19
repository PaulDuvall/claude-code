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
                        description: data['// Description'] || `${file} template`,
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

module.exports = {
    getConfigPath: () => {
        return path.join(os.homedir(), '.claude', 'commands');
    },
    
    defaultConfig: {
        commandsPath: './commands',
        hooksEnabled: true,
        colorOutput: true
    },

    // REQ-009 Implementation
    applyConfigurationTemplate,
    getAvailableTemplates,
    
    // Utility functions (exposed for testing)
    parseJSONC,
    deepMerge
};
