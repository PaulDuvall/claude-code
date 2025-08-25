/**
 * Backup List Service
 * Service for listing and managing backup inventory
 */

const path = require('path');
const fs = require('fs');
const FileSystemUtils = require('../utils/file-system-utils');
const ClaudePathConfig = require('../utils/claude-path-config');

class BackupListService {
    constructor(config = null) {
        this.config = config || new ClaudePathConfig();
    }

    /**
     * List all available backups
     */
    async list() {
        if (!fs.existsSync(this.config.backupsDir)) {
            return [];
        }

        const backups = [];
        
        try {
            const entries = fs.readdirSync(this.config.backupsDir);
            
            for (const entry of entries) {
                const fullPath = path.join(this.config.backupsDir, entry);
                const stats = FileSystemUtils.getStats(fullPath);
                
                if (!stats) continue;

                // Compressed backups
                if (entry.endsWith('.tar.gz')) {
                    const name = entry.replace('.tar.gz', '');
                    backups.push({
                        name,
                        type: 'compressed',
                        size: stats.size,
                        modified: stats.mtime,
                        path: fullPath
                    });
                }
                // Directory backups
                else if (stats.isDirectory() && !entry.startsWith('.')) {
                    const metadata = await this.readBackupMetadata(fullPath);
                    
                    backups.push({
                        name: entry,
                        type: 'directory',
                        size: FileSystemUtils.getDirectorySize(fullPath),
                        modified: stats.mtime,
                        path: fullPath,
                        metadata
                    });
                }
            }

            // Sort by modification time (newest first)
            backups.sort((a, b) => b.modified - a.modified);

            return backups;
        } catch (error) {
            throw new Error(`Failed to list backups: ${error.message}`);
        }
    }

    /**
     * Display backups in user-friendly format
     */
    async display() {
        console.log('📦 Available Backups:\n');

        const backups = await this.list();

        if (backups.length === 0) {
            console.log('No backups found');
            return [];
        }

        backups.forEach(backup => {
            const date = backup.modified.toLocaleString();
            const size = FileSystemUtils.formatSize(backup.size);
            const type = backup.type === 'compressed' ? '📦' : '📁';
            
            console.log(`${type} ${backup.name}`);
            console.log(`   Date: ${date}`);
            console.log(`   Size: ${size}`);
            
            if (backup.metadata) {
                console.log(`   Files: ${backup.metadata.totalFiles}`);
                if (backup.metadata.components) {
                    const components = Object.keys(backup.metadata.components).filter(k => backup.metadata.components[k]);
                    if (components.length > 0) {
                        console.log(`   Contains: ${components.join(', ')}`);
                    }
                }
            }
            console.log('');
        });

        console.log(`Total: ${backups.length} backup(s)`);
        console.log('\n💡 To restore a backup, run:');
        console.log('   claude-commands restore <backup-name>');

        return backups;
    }

    /**
     * Find a specific backup by name
     */
    async findBackup(name) {
        const backups = await this.list();
        return backups.find(backup => backup.name === name);
    }

    /**
     * Get backup details
     */
    async getBackupDetails(name) {
        const backup = await this.findBackup(name);
        
        if (!backup) {
            throw new Error(`Backup '${name}' not found`);
        }

        const details = {
            ...backup,
            exists: fs.existsSync(backup.path),
            readable: FileSystemUtils.isReadable(backup.path)
        };

        // Add component details if metadata available
        if (backup.metadata && backup.metadata.components) {
            details.components = backup.metadata.components;
        }

        return details;
    }

    /**
     * Read backup metadata if available
     */
    async readBackupMetadata(backupPath) {
        const metadataPath = path.join(backupPath, 'backup-metadata.json');
        
        if (!FileSystemUtils.isReadable(metadataPath)) {
            return null;
        }

        try {
            const content = FileSystemUtils.readFile(metadataPath);
            return JSON.parse(content);
        } catch (error) {
            // Return null for invalid metadata
            return null;
        }
    }

    /**
     * Clean up old backups (keep only N most recent)
     */
    async cleanup(keepCount = 10) {
        const backups = await this.list();
        
        if (backups.length <= keepCount) {
            return { cleaned: 0, kept: backups.length };
        }

        const toRemove = backups.slice(keepCount);
        let cleanedCount = 0;

        for (const backup of toRemove) {
            try {
                if (FileSystemUtils.remove(backup.path)) {
                    cleanedCount++;
                }
            } catch (error) {
                console.warn(`⚠️ Warning: Could not remove backup ${backup.name} - ${error.message}`);
            }
        }

        return {
            cleaned: cleanedCount,
            kept: backups.length - cleanedCount
        };
    }

    /**
     * Get backup statistics
     */
    async getStats() {
        const backups = await this.list();
        
        let totalSize = 0;
        let oldestDate = null;
        let newestDate = null;
        const types = { compressed: 0, directory: 0 };

        backups.forEach(backup => {
            totalSize += backup.size;
            types[backup.type]++;
            
            if (!oldestDate || backup.modified < oldestDate) {
                oldestDate = backup.modified;
            }
            if (!newestDate || backup.modified > newestDate) {
                newestDate = backup.modified;
            }
        });

        return {
            count: backups.length,
            totalSize,
            formattedSize: FileSystemUtils.formatSize(totalSize),
            types,
            oldestDate,
            newestDate,
            averageSize: backups.length > 0 ? totalSize / backups.length : 0
        };
    }
}

module.exports = BackupListService;