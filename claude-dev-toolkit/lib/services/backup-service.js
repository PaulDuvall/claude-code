/**
 * Backup Service
 * Focused service for creating backups of Claude Code configuration
 */

const path = require('path');
const fs = require('fs');
const FileSystemUtils = require('../utils/file-system-utils');
const ClaudePathConfig = require('../utils/claude-path-config');

class BackupService {
    constructor(config = null) {
        this.config = config || new ClaudePathConfig();
        this.backedUpCount = 0;
    }

    /**
     * Create a complete backup
     */
    async create(name = null) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
        const backupName = name || `backup-${timestamp}`;
        const backupPath = path.join(this.config.backupsDir, backupName);

        // Ensure backup directory exists
        FileSystemUtils.ensureDirectory(this.config.backupsDir);

        // Check if backup already exists
        if (fs.existsSync(backupPath)) {
            throw new Error(`Backup '${backupName}' already exists`);
        }

        // Create backup directory
        FileSystemUtils.ensureDirectory(backupPath);

        // Reset counter
        this.backedUpCount = 0;

        // Backup components
        const components = {};
        let totalFiles = 0;
        let totalSize = 0;

        // Backup settings
        if (FileSystemUtils.isReadable(this.config.settingsPath)) {
            await this.backupSettings(backupPath);
            components.settings = true;
            totalFiles++;
            const stats = FileSystemUtils.getStats(this.config.settingsPath);
            if (stats) totalSize += stats.size;
        }

        // Backup commands
        const commandsResult = await this.backupCommands(backupPath);
        if (commandsResult.count > 0) {
            components.commands = true;
            totalFiles += commandsResult.count;
            totalSize += commandsResult.size;
        }

        // Backup hooks
        const hooksResult = await this.backupHooks(backupPath);
        if (hooksResult.count > 0) {
            components.hooks = true;
            totalFiles += hooksResult.count;
            totalSize += hooksResult.size;
        }

        // Create metadata
        const metadata = this.createMetadata(backupName, components, totalFiles, totalSize);
        await this.saveMetadata(backupPath, metadata);

        return {
            name: backupName,
            path: backupPath,
            components,
            totalFiles,
            totalSize,
            metadata
        };
    }

    /**
     * Backup settings.json file
     */
    async backupSettings(backupPath) {
        if (!FileSystemUtils.isReadable(this.config.settingsPath)) {
            return false;
        }

        const destPath = path.join(backupPath, 'settings.json');
        const success = FileSystemUtils.copyFile(this.config.settingsPath, destPath);
        
        if (success) {
            this.backedUpCount++;
            console.log('✅ Backed up settings.json');
        }

        return success;
    }

    /**
     * Backup commands directory
     */
    async backupCommands(backupPath) {
        if (!fs.existsSync(this.config.commandsDir)) {
            return { count: 0, size: 0 };
        }

        const commandsBackupDir = path.join(backupPath, 'commands');
        FileSystemUtils.ensureDirectory(commandsBackupDir);

        let count = 0;
        let size = 0;

        try {
            const files = fs.readdirSync(this.config.commandsDir);
            
            for (const file of files) {
                if (file.endsWith('.md')) {
                    const sourcePath = path.join(this.config.commandsDir, file);
                    const destPath = path.join(commandsBackupDir, file);
                    
                    if (FileSystemUtils.copyFile(sourcePath, destPath)) {
                        count++;
                        const stats = FileSystemUtils.getStats(sourcePath);
                        if (stats) size += stats.size;
                        this.backedUpCount++;
                    }
                }
            }

            if (count > 0) {
                console.log(`✅ Backed up ${count} commands`);
            }
        } catch (error) {
            console.warn(`⚠️ Warning: Could not backup commands - ${error.message}`);
        }

        return { count, size };
    }

    /**
     * Backup hooks directory
     */
    async backupHooks(backupPath) {
        const hooksDir = this.config.hooksDir;
        
        if (!fs.existsSync(hooksDir)) {
            return { count: 0, size: 0 };
        }

        const hooksBackupDir = path.join(backupPath, 'hooks');
        FileSystemUtils.ensureDirectory(hooksBackupDir);

        let count = 0;
        let size = 0;

        try {
            const files = fs.readdirSync(hooksDir);
            
            for (const file of files) {
                const sourcePath = path.join(hooksDir, file);
                const stats = FileSystemUtils.getStats(sourcePath);
                
                if (stats && stats.isFile()) {
                    const destPath = path.join(hooksBackupDir, file);
                    
                    if (FileSystemUtils.copyFile(sourcePath, destPath)) {
                        count++;
                        size += stats.size;
                        this.backedUpCount++;
                    }
                }
            }

            if (count > 0) {
                console.log(`✅ Backed up ${count} hooks`);
            }
        } catch (error) {
            console.warn(`⚠️ Warning: Could not backup hooks - ${error.message}`);
        }

        return { count, size };
    }

    /**
     * Create backup metadata
     */
    createMetadata(name, components, totalFiles, totalSize) {
        return {
            name,
            timestamp: new Date().toISOString(),
            components,
            totalFiles,
            totalSize,
            claudeVersion: this.getClaudeVersion(),
            system: {
                platform: require('os').platform(),
                arch: require('os').arch(),
                nodeVersion: process.version
            }
        };
    }

    /**
     * Save metadata to backup directory
     */
    async saveMetadata(backupPath, metadata) {
        const metadataPath = path.join(backupPath, 'backup-metadata.json');
        const content = JSON.stringify(metadata, null, 2);
        
        return FileSystemUtils.writeFile(metadataPath, content);
    }

    /**
     * Get Claude Code version
     */
    getClaudeVersion() {
        try {
            const packagePath = path.join(__dirname, '..', '..', 'package.json');
            const packageData = JSON.parse(FileSystemUtils.readFile(packagePath) || '{}');
            return packageData.version || 'unknown';
        } catch (error) {
            return 'unknown';
        }
    }
}

module.exports = BackupService;