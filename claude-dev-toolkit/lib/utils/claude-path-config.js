/**
 * Claude Path Configuration
 * Centralized path management for Claude Code directories
 */

const path = require('path');
const os = require('os');

class ClaudePathConfig {
    constructor(homeDir = os.homedir()) {
        this.homeDir = homeDir;
    }

    /**
     * Main Claude directory
     */
    get claudeDir() {
        return path.join(this.homeDir, '.claude');
    }

    /**
     * Commands directory
     */
    get commandsDir() {
        return path.join(this.claudeDir, 'commands');
    }

    /**
     * Settings file path
     */
    get settingsPath() {
        return path.join(this.claudeDir, 'settings.json');
    }

    /**
     * Backups directory
     */
    get backupsDir() {
        return path.join(this.claudeDir, 'backups');
    }

    /**
     * Settings backups directory
     */
    get settingsBackupsDir() {
        return path.join(this.backupsDir, 'settings');
    }

    /**
     * Commands backups directory
     */
    get commandsBackupsDir() {
        return path.join(this.backupsDir, 'commands');
    }

    /**
     * Hooks directory
     */
    get hooksDir() {
        return path.join(this.claudeDir, 'hooks');
    }

    /**
     * Subagents directory
     */
    get subagentsDir() {
        return path.join(this.claudeDir, 'subagents');
    }

    /**
     * Templates directory (in package)
     */
    get templatesDir() {
        return path.join(__dirname, '..', '..', 'templates');
    }

    /**
     * Package commands directory (active)
     */
    get packageActiveCommandsDir() {
        return path.join(__dirname, '..', '..', 'commands', 'active');
    }

    /**
     * Package commands directory (experiments)
     */
    get packageExperimentalCommandsDir() {
        return path.join(__dirname, '..', '..', 'commands', 'experiments');
    }

    /**
     * Package hooks directory
     */
    get packageHooksDir() {
        return path.join(__dirname, '..', '..', 'hooks');
    }

    /**
     * Package subagents directory
     */
    get packageSubagentsDir() {
        return path.join(__dirname, '..', '..', 'subagents');
    }

    /**
     * Get all user directories that might need creation
     */
    getUserDirectories() {
        return [
            this.claudeDir,
            this.commandsDir,
            this.backupsDir,
            this.settingsBackupsDir,
            this.commandsBackupsDir,
            this.hooksDir,
            this.subagentsDir
        ];
    }

    /**
     * Get all package directories for validation
     */
    getPackageDirectories() {
        return [
            this.templatesDir,
            this.packageActiveCommandsDir,
            this.packageExperimentalCommandsDir,
            this.packageHooksDir,
            this.packageSubagentsDir
        ];
    }

    /**
     * Create a backup path with timestamp
     */
    createBackupPath(name, type = 'general') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
        const backupName = name || `backup-${timestamp}`;
        
        switch (type) {
            case 'settings':
                return path.join(this.settingsBackupsDir, `${backupName}.json`);
            case 'commands':
                return path.join(this.commandsBackupsDir, backupName);
            default:
                return path.join(this.backupsDir, backupName);
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

        // Common aliases
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
            const fs = require('fs');
            if (fs.existsSync(fullPath)) {
                return fullPath;
            }
        }

        return null;
    }
}

module.exports = ClaudePathConfig;