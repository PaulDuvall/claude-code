/**
 * Restore Service  
 * Focused service for restoring Claude Code configuration from backups
 */

const path = require('path');
const fs = require('fs');
const FileSystemUtils = require('../utils/file-system-utils');
const ClaudePathConfig = require('../utils/claude-path-config');

class RestoreService {
    constructor(config = null) {
        this.config = config || new ClaudePathConfig();
        this.restoredCount = 0;
    }

    /**
     * Restore from a backup
     */
    async restore(backupName) {
        // Find backup path
        const backupPath = this.findBackupPath(backupName);
        if (!backupPath) {
            throw new Error(`Backup '${backupName}' not found`);
        }

        // Read metadata if available
        const metadata = await this.readMetadata(backupPath);
        if (metadata) {
            console.log(`📋 Backup created: ${new Date(metadata.timestamp).toLocaleString()}`);
        }

        // Reset counter
        this.restoredCount = 0;

        // Restore components
        const results = {};

        // Restore settings
        results.settings = await this.restoreSettings(backupPath);

        // Restore commands
        results.commands = await this.restoreCommands(backupPath);

        // Restore hooks
        results.hooks = await this.restoreHooks(backupPath);

        return {
            backupName,
            backupPath,
            restoredCount: this.restoredCount,
            results,
            metadata
        };
    }

    /**
     * Find backup path (compressed or directory)
     */
    findBackupPath(backupName) {
        // Try compressed backup first
        const compressedPath = path.join(this.config.backupsDir, `${backupName}.tar.gz`);
        if (fs.existsSync(compressedPath)) {
            // Would need to extract here in a real implementation
            // For now, look for directory version
        }

        // Try directory backup
        const directoryPath = path.join(this.config.backupsDir, backupName);
        if (fs.existsSync(directoryPath)) {
            return directoryPath;
        }

        return null;
    }

    /**
     * Read backup metadata
     */
    async readMetadata(backupPath) {
        const metadataPath = path.join(backupPath, 'backup-metadata.json');
        
        if (!FileSystemUtils.isReadable(metadataPath)) {
            return null;
        }

        try {
            const content = FileSystemUtils.readFile(metadataPath);
            return JSON.parse(content);
        } catch (error) {
            console.warn(`⚠️ Warning: Could not read backup metadata - ${error.message}`);
            return null;
        }
    }

    /**
     * Restore settings.json
     */
    async restoreSettings(backupPath) {
        const backupSettingsPath = path.join(backupPath, 'settings.json');
        
        if (!FileSystemUtils.isReadable(backupSettingsPath)) {
            return { restored: false, reason: 'No settings file in backup' };
        }

        // Ensure directory exists
        FileSystemUtils.ensureDirectory(this.config.claudeDir);

        // Copy settings file
        const success = FileSystemUtils.copyFile(backupSettingsPath, this.config.settingsPath);
        
        if (success) {
            this.restoredCount++;
            console.log('✅ Restored settings.json');
            return { restored: true };
        } else {
            return { restored: false, reason: 'Failed to copy settings file' };
        }
    }

    /**
     * Restore commands directory
     */
    async restoreCommands(backupPath) {
        const backupCommandsDir = path.join(backupPath, 'commands');
        
        if (!fs.existsSync(backupCommandsDir)) {
            return { restored: false, reason: 'No commands in backup', count: 0 };
        }

        // Ensure commands directory exists
        FileSystemUtils.ensureDirectory(this.config.commandsDir);

        // Clear existing commands (backup should be created by caller)
        try {
            const existingCommands = fs.readdirSync(this.config.commandsDir);
            existingCommands.forEach(file => {
                if (file.endsWith('.md')) {
                    const filePath = path.join(this.config.commandsDir, file);
                    FileSystemUtils.remove(filePath);
                }
            });
        } catch (error) {
            console.warn(`⚠️ Warning: Could not clear existing commands - ${error.message}`);
        }

        // Restore commands
        let restoredCount = 0;
        
        try {
            const commandFiles = fs.readdirSync(backupCommandsDir);
            
            for (const file of commandFiles) {
                if (file.endsWith('.md')) {
                    const sourcePath = path.join(backupCommandsDir, file);
                    const destPath = path.join(this.config.commandsDir, file);
                    
                    if (FileSystemUtils.copyFile(sourcePath, destPath)) {
                        restoredCount++;
                        this.restoredCount++;
                    }
                }
            }

            if (restoredCount > 0) {
                console.log(`✅ Restored ${restoredCount} commands`);
            }

            return { restored: true, count: restoredCount };
        } catch (error) {
            return { restored: false, reason: error.message, count: 0 };
        }
    }

    /**
     * Restore hooks directory
     */
    async restoreHooks(backupPath) {
        const backupHooksDir = path.join(backupPath, 'hooks');
        
        if (!fs.existsSync(backupHooksDir)) {
            return { restored: false, reason: 'No hooks in backup', count: 0 };
        }

        // Ensure hooks directory exists
        FileSystemUtils.ensureDirectory(this.config.hooksDir);

        let restoredCount = 0;

        try {
            const hookFiles = fs.readdirSync(backupHooksDir);
            
            for (const file of hookFiles) {
                const sourcePath = path.join(backupHooksDir, file);
                const destPath = path.join(this.config.hooksDir, file);
                
                // Set appropriate permissions for hooks
                let mode = 0o644;
                if (file.endsWith('.sh')) {
                    mode = 0o755; // Executable for shell scripts
                }
                
                if (FileSystemUtils.copyFile(sourcePath, destPath)) {
                    fs.chmodSync(destPath, mode);
                    restoredCount++;
                    this.restoredCount++;
                }
            }

            if (restoredCount > 0) {
                console.log(`✅ Restored ${restoredCount} hooks`);
            }

            return { restored: true, count: restoredCount };
        } catch (error) {
            return { restored: false, reason: error.message, count: 0 };
        }
    }
}

module.exports = RestoreService;