/**
 * Backup and Restore Commands Implementation - Refactored
 * Orchestrator for backup and restore operations using focused services
 */

const BackupService = require('./services/backup-service');
const RestoreService = require('./services/restore-service');
const BackupListService = require('./services/backup-list-service');
const BaseCommand = require('./base/base-command');
const FileSystemUtils = require('./utils/file-system-utils');
const { execSync } = require('child_process');

class BackupRestoreCommand extends BaseCommand {
    constructor(config = null) {
        super(config);
        this.backupService = new BackupService(this.config);
        this.restoreService = new RestoreService(this.config);
        this.listService = new BackupListService(this.config);
    }

    /**
     * Create a backup of the entire .claude directory
     */
    async backup(name = null) {
        console.log('📦 Creating backup of Claude Code configuration...\n');

        try {
            const result = await this.backupService.create(name);
            
            // Try to compress the backup
            const compressed = await this.compressBackup(result.path);
            
            console.log(`\n🎉 Backup '${result.name}' created successfully`);
            console.log(`   Files: ${result.totalFiles}`);
            console.log(`   Size: ${FileSystemUtils.formatSize(result.totalSize)}`);
            
            if (compressed) {
                console.log(`📦 Backup compressed and stored at: ${compressed.path}`);
            } else {
                console.log(`📁 Backup stored at: ${result.path}`);
            }
            
            return {
                success: true,
                name: result.name,
                path: compressed ? compressed.path : result.path,
                metadata: result.metadata
            };

        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Try to compress a backup using tar
     */
    async compressBackup(backupPath) {
        try {
            const backupName = require('path').basename(backupPath);
            const tarPath = `${backupPath}.tar.gz`;
            
            execSync(`tar -czf "${tarPath}" -C "${this.config.backupsDir}" "${backupName}"`, {
                encoding: 'utf8',
                stdio: 'pipe'
            });
            
            // Remove uncompressed backup
            FileSystemUtils.remove(backupPath);
            
            const compressedSize = FileSystemUtils.getStats(tarPath).size;
            return { 
                path: tarPath, 
                size: compressedSize 
            };
        } catch (error) {
            // Compression failed, keep uncompressed backup
            return null;
        }
    }

    /**
     * Restore from a backup
     */
    async restore(backupName) {
        console.log(`🔄 Restoring from backup: ${backupName}\n`);

        try {
            // Create undo backup first
            console.log('💾 Creating undo backup...');
            const undoBackup = await this.backup('undo-before-restore');
            
            if (!undoBackup.success) {
                console.warn('⚠️  Could not create undo backup, continuing anyway...');
            }

            // Perform restore using service
            const result = await this.restoreService.restore(backupName);

            console.log(`\n🎉 Restore completed successfully`);
            console.log(`   Restored ${result.restoredCount} items`);
            
            if (undoBackup.success) {
                console.log(`\n💡 To undo this restore, run:`);
                console.log(`   claude-commands restore ${undoBackup.name}`);
            }

            return {
                success: true,
                restoredCount: result.restoredCount,
                undoBackup: undoBackup.success ? undoBackup.name : null
            };

        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * List available backups
     */
    async listBackups() {
        try {
            return await this.listService.display();
        } catch (error) {
            return this.handleError(error);
        }
    }
}

module.exports = BackupRestoreCommand;