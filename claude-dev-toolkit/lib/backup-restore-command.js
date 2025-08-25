/**
 * Backup and Restore Commands Implementation - Phase 2
 * Provides backup and restore functionality for Claude Code settings and commands
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

class BackupRestoreCommand {
    constructor() {
        this.claudeDir = path.join(os.homedir(), '.claude');
        this.backupsDir = path.join(this.claudeDir, 'backups');
        this.commandsDir = path.join(this.claudeDir, 'commands');
        this.settingsPath = path.join(this.claudeDir, 'settings.json');
    }

    /**
     * Create a backup of the entire .claude directory
     */
    async backup(name = null) {
        console.log('📦 Creating backup of Claude Code configuration...\n');

        try {
            // Ensure backup directory exists
            if (!fs.existsSync(this.backupsDir)) {
                fs.mkdirSync(this.backupsDir, { recursive: true });
            }

            // Generate backup name with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
            const backupName = name || `backup-${timestamp}`;
            const backupPath = path.join(this.backupsDir, backupName);

            // Check if backup already exists
            if (fs.existsSync(backupPath)) {
                console.error(`❌ Backup '${backupName}' already exists`);
                console.log('💡 Use a different name or let the system generate one');
                return { success: false, error: 'Backup already exists' };
            }

            // Create backup directory
            fs.mkdirSync(backupPath, { recursive: true });

            // Backup components
            const components = {
                settings: false,
                commands: false,
                hooks: false,
                templates: false
            };

            let totalFiles = 0;
            let totalSize = 0;

            // Backup settings.json if exists
            if (fs.existsSync(this.settingsPath)) {
                const destPath = path.join(backupPath, 'settings.json');
                fs.copyFileSync(this.settingsPath, destPath);
                components.settings = true;
                totalFiles++;
                totalSize += fs.statSync(this.settingsPath).size;
                console.log('✅ Backed up settings.json');
            }

            // Backup commands directory
            if (fs.existsSync(this.commandsDir)) {
                const commandsBackupDir = path.join(backupPath, 'commands');
                fs.mkdirSync(commandsBackupDir, { recursive: true });
                
                const files = fs.readdirSync(this.commandsDir);
                files.forEach(file => {
                    if (file.endsWith('.md')) {
                        fs.copyFileSync(
                            path.join(this.commandsDir, file),
                            path.join(commandsBackupDir, file)
                        );
                        totalFiles++;
                        totalSize += fs.statSync(path.join(this.commandsDir, file)).size;
                    }
                });
                
                if (files.length > 0) {
                    components.commands = true;
                    console.log(`✅ Backed up ${files.filter(f => f.endsWith('.md')).length} commands`);
                }
            }

            // Backup hooks directory if exists
            const hooksDir = path.join(this.claudeDir, 'hooks');
            if (fs.existsSync(hooksDir)) {
                const hooksBackupDir = path.join(backupPath, 'hooks');
                fs.mkdirSync(hooksBackupDir, { recursive: true });
                
                const hookFiles = fs.readdirSync(hooksDir);
                hookFiles.forEach(file => {
                    const sourcePath = path.join(hooksDir, file);
                    const destPath = path.join(hooksBackupDir, file);
                    
                    if (fs.statSync(sourcePath).isFile()) {
                        fs.copyFileSync(sourcePath, destPath);
                        totalFiles++;
                        totalSize += fs.statSync(sourcePath).size;
                    }
                });
                
                if (hookFiles.length > 0) {
                    components.hooks = true;
                    console.log(`✅ Backed up ${hookFiles.length} hooks`);
                }
            }

            // Create backup metadata
            const metadata = {
                name: backupName,
                timestamp: new Date().toISOString(),
                components,
                totalFiles,
                totalSize,
                claudeVersion: this.getClaudeVersion(),
                system: {
                    platform: os.platform(),
                    arch: os.arch(),
                    nodeVersion: process.version
                }
            };

            // Save metadata
            fs.writeFileSync(
                path.join(backupPath, 'backup-metadata.json'),
                JSON.stringify(metadata, null, 2)
            );

            // Create compressed archive if tar is available
            try {
                const tarPath = `${backupPath}.tar.gz`;
                execSync(`tar -czf "${tarPath}" -C "${this.backupsDir}" "${backupName}"`, {
                    encoding: 'utf8',
                    stdio: 'pipe'
                });
                
                // Remove uncompressed backup
                fs.rmSync(backupPath, { recursive: true, force: true });
                
                const compressedSize = fs.statSync(tarPath).size;
                console.log(`\n📦 Backup compressed: ${this.formatSize(compressedSize)}`);
                console.log(`📍 Location: ${tarPath}`);
            } catch (error) {
                // Compression failed, keep uncompressed backup
                console.log(`\n📦 Backup created (uncompressed)`);
                console.log(`📍 Location: ${backupPath}`);
            }

            console.log(`\n🎉 Backup '${backupName}' created successfully`);
            console.log(`   Files: ${totalFiles}`);
            console.log(`   Size: ${this.formatSize(totalSize)}`);
            
            return {
                success: true,
                name: backupName,
                path: backupPath,
                metadata
            };

        } catch (error) {
            console.error(`❌ Backup failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Restore from a backup
     */
    async restore(backupName) {
        console.log(`🔄 Restoring from backup: ${backupName}\n`);

        try {
            // Find backup (try compressed first, then directory)
            let backupPath = path.join(this.backupsDir, `${backupName}.tar.gz`);
            let isCompressed = true;
            
            if (!fs.existsSync(backupPath)) {
                backupPath = path.join(this.backupsDir, backupName);
                isCompressed = false;
                
                if (!fs.existsSync(backupPath)) {
                    console.error(`❌ Backup '${backupName}' not found`);
                    this.listBackups();
                    return { success: false, error: 'Backup not found' };
                }
            }

            // Extract if compressed
            let extractedPath = backupPath;
            if (isCompressed) {
                try {
                    console.log('📦 Extracting backup...');
                    execSync(`tar -xzf "${backupPath}" -C "${this.backupsDir}"`, {
                        encoding: 'utf8',
                        stdio: 'pipe'
                    });
                    extractedPath = path.join(this.backupsDir, backupName);
                } catch (error) {
                    console.error('❌ Failed to extract backup');
                    return { success: false, error: 'Extraction failed' };
                }
            }

            // Read metadata
            const metadataPath = path.join(extractedPath, 'backup-metadata.json');
            let metadata = {};
            
            if (fs.existsSync(metadataPath)) {
                metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
                console.log(`📋 Backup created: ${new Date(metadata.timestamp).toLocaleString()}`);
            }

            // Create undo backup before restore
            console.log('💾 Creating undo backup...');
            const undoBackup = await this.backup('undo-before-restore');
            
            if (!undoBackup.success) {
                console.warn('⚠️  Could not create undo backup, continuing anyway...');
            }

            // Restore components
            let restoredCount = 0;

            // Restore settings.json
            const backupSettingsPath = path.join(extractedPath, 'settings.json');
            if (fs.existsSync(backupSettingsPath)) {
                fs.copyFileSync(backupSettingsPath, this.settingsPath);
                console.log('✅ Restored settings.json');
                restoredCount++;
            }

            // Restore commands
            const backupCommandsDir = path.join(extractedPath, 'commands');
            if (fs.existsSync(backupCommandsDir)) {
                // Clear existing commands
                if (fs.existsSync(this.commandsDir)) {
                    const existingCommands = fs.readdirSync(this.commandsDir);
                    existingCommands.forEach(file => {
                        if (file.endsWith('.md')) {
                            fs.unlinkSync(path.join(this.commandsDir, file));
                        }
                    });
                } else {
                    fs.mkdirSync(this.commandsDir, { recursive: true });
                }

                // Copy backed up commands
                const commandFiles = fs.readdirSync(backupCommandsDir);
                commandFiles.forEach(file => {
                    if (file.endsWith('.md')) {
                        fs.copyFileSync(
                            path.join(backupCommandsDir, file),
                            path.join(this.commandsDir, file)
                        );
                        restoredCount++;
                    }
                });
                
                console.log(`✅ Restored ${commandFiles.filter(f => f.endsWith('.md')).length} commands`);
            }

            // Restore hooks
            const backupHooksDir = path.join(extractedPath, 'hooks');
            if (fs.existsSync(backupHooksDir)) {
                const hooksDir = path.join(this.claudeDir, 'hooks');
                
                if (!fs.existsSync(hooksDir)) {
                    fs.mkdirSync(hooksDir, { recursive: true });
                }

                const hookFiles = fs.readdirSync(backupHooksDir);
                hookFiles.forEach(file => {
                    fs.copyFileSync(
                        path.join(backupHooksDir, file),
                        path.join(hooksDir, file)
                    );
                    
                    // Restore execute permissions for shell scripts
                    if (file.endsWith('.sh')) {
                        fs.chmodSync(path.join(hooksDir, file), 0o755);
                    }
                    restoredCount++;
                });
                
                console.log(`✅ Restored ${hookFiles.length} hooks`);
            }

            // Clean up extracted files if we extracted from archive
            if (isCompressed && fs.existsSync(extractedPath)) {
                fs.rmSync(extractedPath, { recursive: true, force: true });
            }

            console.log(`\n🎉 Restore completed successfully`);
            console.log(`   Restored ${restoredCount} items`);
            
            if (undoBackup.success) {
                console.log(`\n💡 To undo this restore, run:`);
                console.log(`   claude-commands restore ${undoBackup.name}`);
            }

            return {
                success: true,
                restoredCount,
                undoBackup: undoBackup.name
            };

        } catch (error) {
            console.error(`❌ Restore failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * List available backups
     */
    listBackups() {
        console.log('📦 Available Backups:\n');

        if (!fs.existsSync(this.backupsDir)) {
            console.log('No backups found');
            return [];
        }

        try {
            const entries = fs.readdirSync(this.backupsDir);
            const backups = [];

            entries.forEach(entry => {
                const fullPath = path.join(this.backupsDir, entry);
                const stats = fs.statSync(fullPath);
                
                // Check for compressed backups
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
                // Check for directory backups
                else if (stats.isDirectory() && !entry.startsWith('.')) {
                    // Try to read metadata
                    let metadata = null;
                    const metadataPath = path.join(fullPath, 'backup-metadata.json');
                    if (fs.existsSync(metadataPath)) {
                        try {
                            metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
                        } catch (e) {
                            // Ignore parse errors
                        }
                    }

                    backups.push({
                        name: entry,
                        type: 'directory',
                        size: this.getDirectorySize(fullPath),
                        modified: stats.mtime,
                        path: fullPath,
                        metadata
                    });
                }
            });

            // Sort by modification time (newest first)
            backups.sort((a, b) => b.modified - a.modified);

            // Display backups
            if (backups.length === 0) {
                console.log('No backups found');
            } else {
                backups.forEach(backup => {
                    const date = backup.modified.toLocaleString();
                    const size = this.formatSize(backup.size);
                    const type = backup.type === 'compressed' ? '📦' : '📁';
                    
                    console.log(`${type} ${backup.name}`);
                    console.log(`   Date: ${date}`);
                    console.log(`   Size: ${size}`);
                    
                    if (backup.metadata) {
                        console.log(`   Files: ${backup.metadata.totalFiles}`);
                    }
                    console.log('');
                });

                console.log(`Total: ${backups.length} backup(s)`);
                console.log('\n💡 To restore a backup, run:');
                console.log('   claude-commands restore <backup-name>');
            }

            return backups;

        } catch (error) {
            console.error(`❌ Error listing backups: ${error.message}`);
            return [];
        }
    }

    /**
     * Get Claude Code version if available
     */
    getClaudeVersion() {
        try {
            const packagePath = path.join(__dirname, '..', 'package.json');
            const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            return packageData.version || 'unknown';
        } catch (error) {
            return 'unknown';
        }
    }

    /**
     * Calculate directory size recursively
     */
    getDirectorySize(dirPath) {
        let size = 0;
        
        try {
            const entries = fs.readdirSync(dirPath);
            entries.forEach(entry => {
                const fullPath = path.join(dirPath, entry);
                const stats = fs.statSync(fullPath);
                
                if (stats.isDirectory()) {
                    size += this.getDirectorySize(fullPath);
                } else {
                    size += stats.size;
                }
            });
        } catch (error) {
            // Ignore errors
        }
        
        return size;
    }

    /**
     * Format file size for display
     */
    formatSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }
}

module.exports = BackupRestoreCommand;