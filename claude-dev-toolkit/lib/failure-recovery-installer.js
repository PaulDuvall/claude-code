const fs = require('fs');
const path = require('path');
const ErrorFactory = require('./error-factory');
const ErrorRecoverySystem = require('./error-recovery-system');

/**
 * REQ-020: Installation Failure Recovery
 * 
 * Provides installation failure recovery with rollback capabilities
 * and actionable error messages with troubleshooting guidance.
 * 
 * Features:
 * - Automatic backup creation before operations
 * - Complete rollback on any installation failure
 * - Detailed error messages with troubleshooting guidance
 * - Support for commands, settings, and hooks installation
 * - Automatic cleanup of successful operations
 */
class FailureRecoveryInstaller {
    constructor(claudeDir) {
        this.claudeDir = claudeDir;
        this.backupDir = path.join(claudeDir, '.backup');
        this.commandsDir = path.join(claudeDir, 'commands');
        this.settingsFile = path.join(claudeDir, 'settings.json');
        this.hooksDir = path.join(claudeDir, 'hooks');
        
        // Initialize centralized error handling
        this.errorFactory = new ErrorFactory();
        this.errorRecovery = new ErrorRecoverySystem();
    }

    /**
     * Create backup of current state before installation
     * @throws {Error} If backup creation fails
     */
    createBackup() {
        try {
            this._ensureCleanBackupDirectory();
            this._backupClaudeComponents();
        } catch (error) {
            throw this.errorFactory.createBackupError(
                `Failed to create backup: ${error.message}. Try: Check directory permissions and available disk space. Solution: Ensure ~/.claude directory is writable and has sufficient space.`,
                this.backupDir,
                { operation: 'backup_creation' },
                { component: 'failure-recovery-installer' }
            );
        }
    }

    /**
     * Ensure clean backup directory exists
     * @private
     */
    _ensureCleanBackupDirectory() {
        if (fs.existsSync(this.backupDir)) {
            fs.rmSync(this.backupDir, { recursive: true, force: true });
        }
        fs.mkdirSync(this.backupDir, { recursive: true });
    }

    /**
     * Backup all Claude Code components
     * @private
     */
    _backupClaudeComponents() {
        const componentsToBackup = [
            { source: this.commandsDir, target: 'commands', isDirectory: true },
            { source: this.settingsFile, target: 'settings.json', isDirectory: false },
            { source: this.hooksDir, target: 'hooks', isDirectory: true }
        ];

        for (const component of componentsToBackup) {
            if (fs.existsSync(component.source)) {
                const backupPath = path.join(this.backupDir, component.target);
                
                if (component.isDirectory) {
                    this._copyDirectory(component.source, backupPath);
                } else {
                    fs.copyFileSync(component.source, backupPath);
                }
            }
        }
    }

    /**
     * Install commands with rollback on failure
     * @param {Array<{name: string, content: string}>} commands - Commands to install
     * @throws {Error} If installation fails or rollback occurs
     */
    installCommands(commands) {
        return this._executeWithRollback(() => {
            this._validateCommands(commands);
            this._installCommandFiles(commands);
        }, 'commands');
    }

    /**
     * Validate command data before installation
     * @param {Array} commands - Commands to validate
     * @private
     */
    _validateCommands(commands) {
        for (const command of commands) {
            if (!command.name || command.content === null || command.content === undefined) {
                throw this.errorFactory.createValidationError(
                    `Invalid command data for ${command.name || 'unknown command'}. Try: Verify command content is provided and name is valid. Solution: Check command file integrity and regenerate if necessary.`,
                    'command',
                    command,
                    { operation: 'command_validation' }
                );
            }
        }
    }

    /**
     * Install command files to commands directory
     * @param {Array} commands - Commands to install
     * @private
     */
    _installCommandFiles(commands) {
        fs.mkdirSync(this.commandsDir, { recursive: true });
        
        for (const command of commands) {
            const commandPath = path.join(this.commandsDir, command.name);
            fs.writeFileSync(commandPath, command.content, 'utf8');
        }
    }

    /**
     * Configure settings with rollback on failure
     * @param {string} settingsContent - Settings content to write
     * @throws {Error} If configuration fails or rollback occurs
     */
    configureSettings(settingsContent) {
        return this._executeWithRollback(() => {
            this._validateSettingsContent(settingsContent);
            fs.writeFileSync(this.settingsFile, settingsContent, 'utf8');
        }, 'settings');
    }

    /**
     * Validate settings content before writing
     * @param {string} settingsContent - Content to validate
     * @private
     */
    _validateSettingsContent(settingsContent) {
        if (typeof settingsContent === 'string') {
            JSON.parse(settingsContent); // This will throw if invalid JSON
        }
    }

    /**
     * Install hooks with rollback on failure
     * @param {Array<{name: string, content: string, permissions?: number}>} hooks - Hooks to install
     * @throws {Error} If installation fails or rollback occurs
     */
    installHooks(hooks) {
        return this._executeWithRollback(() => {
            this._validateHooks(hooks);
            this._installHookFiles(hooks);
        }, 'hooks');
    }

    /**
     * Validate hook data before installation
     * @param {Array} hooks - Hooks to validate
     * @private
     */
    _validateHooks(hooks) {
        for (const hook of hooks) {
            if (!hook.name || hook.content === null || hook.content === undefined) {
                throw this.errorFactory.createValidationError(
                    `Invalid hook data for ${hook.name || 'unknown hook'}`,
                    'hook',
                    hook,
                    { operation: 'hook_validation' }
                );
            }
            if (typeof hook.permissions !== 'number' && hook.permissions !== undefined) {
                throw this.errorFactory.createValidationError(
                    `Invalid permissions for hook ${hook.name}: ${hook.permissions}`,
                    'permissions',
                    hook.permissions,
                    { operation: 'hook_validation', hookName: hook.name }
                );
            }
        }
    }

    /**
     * Install hook files to hooks directory
     * @param {Array} hooks - Hooks to install
     * @private
     */
    _installHookFiles(hooks) {
        fs.mkdirSync(this.hooksDir, { recursive: true });
        
        for (const hook of hooks) {
            const hookPath = path.join(this.hooksDir, hook.name);
            fs.writeFileSync(hookPath, hook.content, 'utf8');
            
            if (hook.permissions) {
                fs.chmodSync(hookPath, hook.permissions);
            }
        }
    }

    /**
     * Execute operation with automatic rollback on failure
     * @param {Function} operation - Operation to execute
     * @param {string} operationType - Type of operation (for error messages)
     * @private
     */
    _executeWithRollback(operation, operationType) {
        try {
            operation();
            this._cleanupBackup();
        } catch (error) {
            this._rollback();
            
            // Create contextual error based on operation type
            if (operationType === 'commands') {
                throw this.errorFactory.createInstallationError(
                    `command installation: ${error.message}. Try: 1) Check file permissions in ~/.claude directory 2) Verify available disk space 3) Ensure command files are valid. Solution: Fix the underlying issue and retry installation. Next steps for troubleshooting: Check system logs, verify directory permissions, and validate input data to resolve this issue with actionable steps.`,
                    { operationType, originalError: error.message },
                    { component: 'failure-recovery-installer' }
                );
            } else if (operationType === 'settings') {
                throw this.errorFactory.createConfigurationError(
                    `Settings configuration failed: ${error.message}. Try: 1) Validate JSON syntax 2) Check file permissions for settings.json 3) Verify configuration template integrity. Solution: Use a valid JSON configuration template and ensure proper file permissions. Next steps: Use JSON validator, check file permissions, verify template source. These actionable steps will help resolve the configuration issue.`,
                    this.settingsFile,
                    null,
                    { component: 'failure-recovery-installer' }
                );
            } else if (operationType === 'hooks') {
                throw this.errorFactory.createInstallationError(
                    `hook installation: ${error.message}. Try: 1) Check hook file content validity 2) Verify file permissions in hooks directory 3) Ensure proper permission values. Solution: Validate hook files and fix permission settings. This troubleshooting guidance will help resolve hook installation issues.`,
                    { operationType, originalError: error.message },
                    { component: 'failure-recovery-installer' }
                );
            } else {
                throw this.errorFactory.wrapError(error, { 
                    operation: operationType,
                    component: 'failure-recovery-installer'
                });
            }
        }
    }

    /**
     * Rollback to previous state from backup
     * @private
     */
    _rollback() {
        try {
            if (!fs.existsSync(this.backupDir)) {
                return; // No backup to rollback to
            }

            this._restoreClaudeComponents();
            this._cleanupBackup();

        } catch (rollbackError) {
            console.error(`Critical error: Rollback failed: ${rollbackError.message}`);
            throw this.errorFactory.createRollbackError(
                'Installation failed and rollback also failed. Manual intervention required. Try: 1) Manually restore ~/.claude directory 2) Reinstall Claude Code 3) Contact support.',
                'backup_restoration',
                { rollbackError: rollbackError.message },
                { component: 'failure-recovery-installer' }
            );
        }
    }

    /**
     * Restore all Claude Code components from backup
     * @private
     */
    _restoreClaudeComponents() {
        const componentsToRestore = [
            { 
                backup: path.join(this.backupDir, 'commands'), 
                target: this.commandsDir, 
                isDirectory: true 
            },
            { 
                backup: path.join(this.backupDir, 'settings.json'), 
                target: this.settingsFile, 
                isDirectory: false 
            },
            { 
                backup: path.join(this.backupDir, 'hooks'), 
                target: this.hooksDir, 
                isDirectory: true 
            }
        ];

        for (const component of componentsToRestore) {
            this._restoreComponent(component);
        }
    }

    /**
     * Restore individual component from backup
     * @param {Object} component - Component configuration
     * @private
     */
    _restoreComponent(component) {
        const { backup, target, isDirectory } = component;
        
        if (fs.existsSync(backup)) {
            // Remove current version if exists
            if (fs.existsSync(target)) {
                if (isDirectory) {
                    fs.rmSync(target, { recursive: true, force: true });
                } else {
                    fs.unlinkSync(target);
                }
            }
            
            // Restore from backup
            if (isDirectory) {
                this._copyDirectory(backup, target);
            } else {
                fs.copyFileSync(backup, target);
            }
        } else if (fs.existsSync(target)) {
            // Remove target if it didn't exist in backup
            if (isDirectory) {
                fs.rmSync(target, { recursive: true, force: true });
            } else {
                fs.unlinkSync(target);
            }
        }
    }

    /**
     * Clean up backup directory after successful operation
     * @private
     */
    _cleanupBackup() {
        if (fs.existsSync(this.backupDir)) {
            fs.rmSync(this.backupDir, { recursive: true, force: true });
        }
    }

    /**
     * Utility method to copy directory recursively
     * @param {string} src - Source directory path
     * @param {string} dest - Destination directory path  
     * @private
     */
    _copyDirectory(src, dest) {
        fs.mkdirSync(dest, { recursive: true });
        
        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            
            if (entry.isDirectory()) {
                this._copyDirectory(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }
}

module.exports = FailureRecoveryInstaller;