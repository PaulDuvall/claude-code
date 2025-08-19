const fs = require('fs');
const path = require('path');

/**
 * Core hook installation functionality
 * Extracted from hook-installer.js for better separation of concerns
 */
class HookInstaller {
    constructor() {
        this.installationLog = [];
    }

    /**
     * Install security hooks to the specified directory
     * @param {string} targetHooksDir - Directory to install hooks to
     * @param {Array|string} hookNames - Hook names to install
     * @param {Object} options - Installation options
     * @returns {Object} Installation result with details
     */
    installSecurityHooks(targetHooksDir, hookNames, options = {}) {
        const result = {
            success: false,
            installed: [],
            failed: [],
            backed_up: [],
            errors: []
        };

        try {
            // Normalize hookNames to array
            const hooksToInstall = Array.isArray(hookNames) ? hookNames : [hookNames];
            
            // Validate inputs
            if (!targetHooksDir || hooksToInstall.length === 0) {
                result.errors.push('Invalid input parameters');
                return result;
            }

            // Source hooks directory
            const sourceHooksDir = this.getSourceHooksDirectory();
            
            // Check if source directory exists
            if (!fs.existsSync(sourceHooksDir)) {
                result.errors.push('Source hooks directory not found');
                return result;
            }

            // Create target directory if it doesn't exist
            this._ensureDirectoryExists(targetHooksDir);

            // Process each requested hook
            for (const hookName of hooksToInstall) {
                try {
                    const installResult = this._installSingleHook(
                        sourceHooksDir, 
                        targetHooksDir, 
                        hookName, 
                        options
                    );

                    if (installResult.success) {
                        result.installed.push(hookName);
                        if (installResult.backed_up) {
                            result.backed_up.push(hookName);
                        }
                    } else {
                        result.failed.push({ hook: hookName, error: installResult.error });
                    }
                } catch (error) {
                    result.failed.push({ hook: hookName, error: error.message });
                }
            }

            // Overall success if at least one hook installed successfully
            result.success = result.installed.length > 0;

            // Log successful installations
            for (const hookName of result.installed) {
                this._logInstallation(hookName, path.join(targetHooksDir, `${hookName}.sh`));
            }

            return result;

        } catch (error) {
            result.errors.push(error.message);
            return result;
        }
    }

    /**
     * Remove installed security hooks
     * @param {string} targetHooksDir - Directory containing installed hooks
     * @param {Array|string} hookNames - Hook names to remove
     * @returns {Object} Removal result with details
     */
    removeSecurityHooks(targetHooksDir, hookNames) {
        const result = {
            success: false,
            removed: [],
            failed: [],
            errors: []
        };

        try {
            const hooksToRemove = Array.isArray(hookNames) ? hookNames : [hookNames];
            
            if (!targetHooksDir || hooksToRemove.length === 0) {
                result.errors.push('Invalid input parameters');
                return result;
            }

            for (const hookName of hooksToRemove) {
                const hookPath = path.join(targetHooksDir, `${hookName}.sh`);
                
                try {
                    if (fs.existsSync(hookPath)) {
                        fs.unlinkSync(hookPath);
                        result.removed.push(hookName);
                    } else {
                        result.failed.push({ hook: hookName, error: 'Hook file not found' });
                    }
                } catch (error) {
                    result.failed.push({ hook: hookName, error: error.message });
                }
            }

            result.success = result.removed.length > 0;
            return result;

        } catch (error) {
            result.errors.push(error.message);
            return result;
        }
    }

    /**
     * Get the source hooks directory path
     * @returns {string} Path to source hooks directory
     */
    getSourceHooksDirectory() {
        return path.join(__dirname, '../hooks');
    }

    /**
     * Get installation log
     * @param {boolean} clear - Whether to clear the log after retrieving
     * @returns {Array} Installation log entries
     */
    getInstallationLog(clear = false) {
        const log = [...this.installationLog];
        if (clear) {
            this.installationLog = [];
        }
        return log;
    }

    /**
     * Get hook installation summary
     * @returns {Object} Summary of hook installations and system status
     */
    getHookInstallationSummary() {
        return {
            totalInstallations: this.installationLog.length,
            recentInstallations: this.installationLog.slice(-10),
            lastInstallation: this.installationLog.length > 0 ? 
                this.installationLog[this.installationLog.length - 1] : null,
            systemInfo: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                packageVersion: this._getPackageVersion()
            }
        };
    }

    /**
     * Install a single security hook (private method)
     * @param {string} sourceHooksDir - Source directory containing hooks
     * @param {string} targetHooksDir - Target directory for installation
     * @param {string} hookName - Name of the hook to install
     * @param {Object} options - Installation options
     * @returns {Object} Installation result for this hook
     * @private
     */
    _installSingleHook(sourceHooksDir, targetHooksDir, hookName, options) {
        const result = { success: false, backed_up: false, error: null };

        try {
            const sourceHookPath = path.join(sourceHooksDir, `${hookName}.sh`);
            const targetHookPath = path.join(targetHooksDir, `${hookName}.sh`);

            // Check if source hook exists
            if (!fs.existsSync(sourceHookPath)) {
                result.error = 'Hook file not found';
                return result;
            }

            // Validate hook if requested
            if (options.validate && !this._validateHook(sourceHookPath)) {
                result.error = 'Hook failed validation';
                return result;
            }

            // Handle existing hook files
            if (fs.existsSync(targetHookPath)) {
                if (!options.force) {
                    result.error = 'Hook already exists (use force option to overwrite)';
                    return result;
                }

                // Create backup if requested
                if (options.backup) {
                    const backupPath = `${targetHookPath}.backup.${Date.now()}`;
                    fs.copyFileSync(targetHookPath, backupPath);
                    result.backed_up = true;
                }
            }

            // Copy hook file with enhanced metadata
            const hookContent = fs.readFileSync(sourceHookPath, 'utf8');
            const enhancedContent = this._addInstallationMetadata(hookContent, hookName);
            
            fs.writeFileSync(targetHookPath, enhancedContent, { mode: 0o755 });
            
            result.success = true;
            return result;

        } catch (error) {
            result.error = error.message;
            return result;
        }
    }

    /**
     * Ensure directory exists with proper permissions (private method)
     * @param {string} dirPath - Directory path to create
     * @private
     */
    _ensureDirectoryExists(dirPath) {
        fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
    }

    /**
     * Add installation metadata to hook content (private method)
     * @param {string} content - Original hook content
     * @param {string} hookName - Name of the hook
     * @returns {string} Enhanced content with metadata
     * @private
     */
    _addInstallationMetadata(content, hookName) {
        const metadata = [
            `# Installed by Claude Dev Toolkit`,
            `# Hook: ${hookName}`,
            `# Installation Date: ${new Date().toISOString()}`,
            `# Version: ${this._getPackageVersion()}`,
            ''
        ].join('\n');

        // Insert metadata after shebang line
        const lines = content.split('\n');
        const shebangLine = lines[0];
        const restContent = lines.slice(1).join('\n');
        
        return `${shebangLine}\n${metadata}${restContent}`;
    }

    /**
     * Log hook installation (private method)
     * @param {string} hookName - Name of installed hook
     * @param {string} targetPath - Path where hook was installed
     * @private
     */
    _logInstallation(hookName, targetPath) {
        this.installationLog.push({
            hook: hookName,
            timestamp: new Date().toISOString(),
            targetPath: targetPath,
            version: this._getPackageVersion()
        });
    }

    /**
     * Validate a hook file (private method)
     * @param {string} hookPath - Path to hook file
     * @returns {boolean} True if valid, false otherwise
     * @private
     */
    _validateHook(hookPath) {
        try {
            if (!fs.existsSync(hookPath)) {
                return false;
            }

            const content = fs.readFileSync(hookPath, 'utf8');
            
            // Basic validation: should have shebang and be executable
            const validShebangs = ['#!/bin/bash', '#!/bin/sh', '#!/usr/bin/env bash', '#!/usr/bin/env sh'];
            const hasValidShebang = validShebangs.some(shebang => content.startsWith(shebang));
            
            if (!hasValidShebang) {
                return false;
            }

            // Should contain some defensive security patterns
            const securityKeywords = ['credential', 'security', 'validate', 'check', 'prevent'];
            const hasSecurityContent = securityKeywords.some(keyword => 
                content.toLowerCase().includes(keyword)
            );

            return hasSecurityContent;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get package version (private method)
     * @returns {string} Package version
     * @private
     */
    _getPackageVersion() {
        try {
            return require('../package.json').version || '0.0.1-alpha.1';
        } catch (error) {
            return '0.0.1-alpha.1';
        }
    }
}

module.exports = HookInstaller;