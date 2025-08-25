/**
 * Command Installer Service
 * Focused service for installing commands from the NPM package
 */

const fs = require('fs');
const path = require('path');
const FileSystemUtils = require('../utils/file-system-utils');
const ClaudePathConfig = require('../utils/claude-path-config');

class CommandInstallerService {
    constructor(config = null) {
        this.config = config || new ClaudePathConfig();
        this.installedCount = 0;
        this.skippedCount = 0;
    }

    /**
     * Install commands based on options
     */
    async install(options = {}) {
        // Reset counters
        this.installedCount = 0;
        this.skippedCount = 0;

        // Ensure commands directory exists
        FileSystemUtils.ensureDirectory(this.config.commandsDir);

        // Get commands to install
        const commandsToInstall = this.getCommandsToInstall(options);

        // Install commands
        const installResults = {
            active: 0,
            experimental: 0
        };

        for (const cmd of commandsToInstall) {
            const sourcePath = path.join(cmd.source, cmd.file);
            const destPath = path.join(this.config.commandsDir, cmd.file);
            
            if (FileSystemUtils.copyFile(sourcePath, destPath, 0o644)) {
                this.installedCount++;
                installResults[cmd.type]++;
            } else {
                console.error(`⚠️  Failed to install ${cmd.file}`);
                this.skippedCount++;
            }
        }

        return {
            installedCount: this.installedCount,
            skippedCount: this.skippedCount,
            results: installResults,
            commands: commandsToInstall
        };
    }

    /**
     * Get list of commands to install based on options
     */
    getCommandsToInstall(options) {
        const commands = [];
        
        // Determine which command sets to install
        const installActive = options.active || options.all || 
                            (!options.active && !options.experiments && !options.all);
        const installExperiments = options.experiments || options.all;

        // Collect active commands
        if (installActive) {
            const activeCommands = this.getCommandsFromDirectory(
                this.config.packageActiveCommandsDir, 
                'active'
            );
            commands.push(...activeCommands);
        }

        // Collect experimental commands
        if (installExperiments) {
            const experimentalCommands = this.getCommandsFromDirectory(
                this.config.packageExperimentalCommandsDir, 
                'experimental'
            );
            commands.push(...experimentalCommands);
        }

        // Apply include/exclude filters
        return this.applyFilters(commands, options);
    }

    /**
     * Get commands from a specific directory
     */
    getCommandsFromDirectory(dirPath, type) {
        if (!fs.existsSync(dirPath)) {
            return [];
        }

        try {
            return fs.readdirSync(dirPath)
                .filter(f => f.endsWith('.md'))
                .map(f => ({ 
                    file: f, 
                    source: dirPath, 
                    type: type 
                }));
        } catch (error) {
            console.warn(`⚠️ Warning: Could not read ${type} commands directory - ${error.message}`);
            return [];
        }
    }

    /**
     * Apply include/exclude filters to command list
     */
    applyFilters(commands, options) {
        let filteredCommands = commands;
        
        // Apply include filter
        if (options.include) {
            const patterns = Array.isArray(options.include) ? options.include : [options.include];
            filteredCommands = filteredCommands.filter(cmd => 
                patterns.some(pattern => this.matchesPattern(cmd.file, pattern))
            );
        }

        // Apply exclude filter
        if (options.exclude) {
            const patterns = Array.isArray(options.exclude) ? options.exclude : [options.exclude];
            filteredCommands = filteredCommands.filter(cmd => 
                !patterns.some(pattern => this.matchesPattern(cmd.file, pattern))
            );
        }

        return filteredCommands;
    }

    /**
     * Check if a command matches a pattern
     */
    matchesPattern(filename, pattern) {
        // Simple pattern matching with wildcard support
        if (pattern.includes('*')) {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            return regex.test(filename);
        }
        return filename.includes(pattern);
    }

    /**
     * Get preview of what would be installed (dry run)
     */
    getDryRunPreview(options) {
        const commandsToInstall = this.getCommandsToInstall(options);
        
        const byType = {
            active: commandsToInstall.filter(c => c.type === 'active'),
            experimental: commandsToInstall.filter(c => c.type === 'experimental')
        };

        return {
            total: commandsToInstall.length,
            byType,
            destination: this.config.commandsDir
        };
    }

    /**
     * Validate installation requirements
     */
    validateInstallation() {
        const issues = [];
        
        // Check if package directories exist
        if (!fs.existsSync(this.config.packageActiveCommandsDir)) {
            issues.push('Active commands directory not found in package');
        }
        
        if (!fs.existsSync(this.config.packageExperimentalCommandsDir)) {
            issues.push('Experimental commands directory not found in package');
        }

        // Check if destination parent directory exists and is writable
        const claudeDir = this.config.claudeDir;
        try {
            // Try to ensure the directory exists first
            FileSystemUtils.ensureDirectory(claudeDir);
            
            // Then check if it's writable
            if (fs.existsSync(claudeDir) && !FileSystemUtils.isWritable(claudeDir)) {
                issues.push('Cannot write to Claude directory - check permissions');
            }
        } catch (error) {
            // If we can't create the directory, that's a permission issue
            issues.push(`Cannot create Claude directory: ${error.message}`);
        }

        return {
            valid: issues.length === 0,
            issues
        };
    }

    /**
     * Get installation statistics
     */
    getStats() {
        return {
            installed: this.installedCount,
            skipped: this.skippedCount,
            total: this.installedCount + this.skippedCount
        };
    }
}

module.exports = CommandInstallerService;