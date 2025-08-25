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
        this.logger.step('Creating backup of Claude Code configuration', { backupName: name });

        try {
            const result = await this.backupService.create(name);
            
            // Try to compress the backup
            const compressed = await this.compressBackup(result.path);
            
            this.logger.complete(`Backup '${result.name}' created successfully`, {
                files: result.totalFiles,
                size: FileSystemUtils.formatSize(result.totalSize),
                compressed: !!compressed
            });
            
            if (compressed) {
                this.logger.info(`Backup compressed and stored at: ${compressed.path}`, { 
                    compressionRatio: compressed.size / result.totalSize 
                });
            } else {
                this.logger.info(`Backup stored at: ${result.path}`);
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
        this.logger.step(`Restoring from backup: ${backupName}`, { backupName });

        try {
            // Create undo backup first
            this.logger.info('Creating undo backup for safety');
            const undoBackup = await this.backup('undo-before-restore');
            
            if (!undoBackup.success) {
                this.logger.warn('Could not create undo backup, continuing anyway', { 
                    risk: 'restore cannot be undone' 
                });
            }

            // Perform restore using service
            const result = await this.restoreService.restore(backupName);

            this.logger.complete(`Restore completed successfully`, {
                restoredCount: result.restoredCount,
                hasUndo: undoBackup.success
            });
            
            if (undoBackup.success) {
                this.logger.info(`To undo this restore, run: claude-commands restore ${undoBackup.name}`, {
                    undoCommand: `claude-commands restore ${undoBackup.name}`
                });
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