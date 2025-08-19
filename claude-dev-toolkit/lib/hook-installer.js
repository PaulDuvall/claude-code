// Security Hook Installer for Claude Dev Toolkit
// Implements REQ-018: Security Hook Installation
const fs = require('fs');
const path = require('path');

// Installation log for tracking
let installationLog = [];

// Hook metadata cache for performance
let hookMetadataCache = null;

/**
 * Install security hooks to the specified directory
 * Implements REQ-018: Security Hook Installation
 * 
 * @param {string} targetHooksDir - Directory to install hooks to
 * @param {Array|string} hookNames - Array of hook names or single hook name to install
 * @param {Object} options - Installation options
 * @param {boolean} options.force - Force overwrite existing hooks
 * @param {boolean} options.validate - Validate hooks before installation
 * @param {boolean} options.backup - Create backup of existing hooks
 * @returns {Object} - Installation result with details
 */
function installSecurityHooks(targetHooksDir, hookNames, options = {}) {
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

        // Source hooks directory (relative to this module)
        const sourceHooksDir = getSourceHooksDirectory();
        
        // Check if source directory exists
        if (!fs.existsSync(sourceHooksDir)) {
            result.errors.push('Source hooks directory not found');
            return result;
        }

        // Create target directory if it doesn't exist
        ensureDirectoryExists(targetHooksDir);

        // Process each requested hook
        for (const hookName of hooksToInstall) {
            try {
                const installResult = installSingleHook(
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
            logInstallation(hookName, path.join(targetHooksDir, `${hookName}.sh`));
        }

        return result;

    } catch (error) {
        result.errors.push(error.message);
        return result;
    }
}

/**
 * Install a single security hook
 * @param {string} sourceHooksDir - Source directory containing hooks
 * @param {string} targetHooksDir - Target directory for installation
 * @param {string} hookName - Name of the hook to install
 * @param {Object} options - Installation options
 * @returns {Object} - Installation result for this hook
 */
function installSingleHook(sourceHooksDir, targetHooksDir, hookName, options) {
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
        if (options.validate && !validateHook(sourceHookPath)) {
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
        const enhancedContent = addInstallationMetadata(hookContent, hookName);
        
        fs.writeFileSync(targetHookPath, enhancedContent, { mode: 0o755 });
        
        result.success = true;
        return result;

    } catch (error) {
        result.error = error.message;
        return result;
    }
}

/**
 * Get the source hooks directory path
 * @returns {string} - Path to source hooks directory
 */
function getSourceHooksDirectory() {
    return path.join(__dirname, '../hooks');
}

/**
 * Ensure directory exists with proper permissions
 * @param {string} dirPath - Directory path to create
 */
function ensureDirectoryExists(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
}

/**
 * Add installation metadata to hook content
 * @param {string} content - Original hook content
 * @param {string} hookName - Name of the hook
 * @returns {string} - Enhanced content with metadata
 */
function addInstallationMetadata(content, hookName) {
    const metadata = [
        `# Installed by Claude Dev Toolkit`,
        `# Hook: ${hookName}`,
        `# Installation Date: ${new Date().toISOString()}`,
        `# Version: ${require('../package.json').version || '0.0.1-alpha.1'}`,
        ''
    ].join('\n');

    // Insert metadata after shebang line
    const lines = content.split('\n');
    const shebangLine = lines[0];
    const restContent = lines.slice(1).join('\n');
    
    return `${shebangLine}\n${metadata}${restContent}`;
}

/**
 * Log hook installation
 * @param {string} hookName - Name of installed hook
 * @param {string} targetPath - Path where hook was installed
 */
function logInstallation(hookName, targetPath) {
    installationLog.push({
        hook: hookName,
        timestamp: new Date().toISOString(),
        targetPath: targetPath,
        version: require('../package.json').version || '0.0.1-alpha.1'
    });
}

/**
 * Get available security hooks with caching for performance
 * @param {boolean} forceRefresh - Force refresh of the cache
 * @returns {Array} - Array of available hook information
 */
function getAvailableHooks(forceRefresh = false) {
    try {
        // Return cached data if available and not forcing refresh
        if (hookMetadataCache && !forceRefresh) {
            return hookMetadataCache;
        }

        const sourceHooksDir = getSourceHooksDirectory();
        
        if (!fs.existsSync(sourceHooksDir)) {
            hookMetadataCache = [];
            return hookMetadataCache;
        }

        const hookFiles = fs.readdirSync(sourceHooksDir).filter(f => f.endsWith('.sh'));
        
        hookMetadataCache = hookFiles.map(file => {
            const name = path.basename(file, '.sh');
            const hookPath = path.join(sourceHooksDir, file);
            
            return {
                name,
                filename: file,
                path: hookPath,
                description: getHookDescription(hookPath),
                metadata: getHookMetadata(hookPath),
                valid: validateHook(hookPath),
                size: getFileSize(hookPath)
            };
        }).sort((a, b) => a.name.localeCompare(b.name));

        return hookMetadataCache;
    } catch (error) {
        hookMetadataCache = [];
        return hookMetadataCache;
    }
}

/**
 * Get detailed metadata from hook file
 * @param {string} hookPath - Path to hook file
 * @returns {Object} - Hook metadata
 */
function getHookMetadata(hookPath) {
    const metadata = {
        trigger: 'PreToolUse',
        blocking: true,
        tools: [],
        author: 'Claude Dev Toolkit',
        version: '1.0.0',
        category: 'security'
    };

    try {
        const content = fs.readFileSync(hookPath, 'utf8');
        const lines = content.split('\n').slice(0, 20); // Check first 20 lines
        
        for (const line of lines) {
            const cleanLine = line.replace(/^#\s*/, '').trim();
            
            if (cleanLine.startsWith('Trigger:')) {
                metadata.trigger = cleanLine.replace('Trigger:', '').trim();
            } else if (cleanLine.startsWith('Blocking:')) {
                metadata.blocking = cleanLine.replace('Blocking:', '').trim().toLowerCase() === 'yes';
            } else if (cleanLine.startsWith('Tools:')) {
                const toolsStr = cleanLine.replace('Tools:', '').trim();
                metadata.tools = toolsStr.split(',').map(t => t.trim()).filter(Boolean);
            } else if (cleanLine.startsWith('Author:')) {
                metadata.author = cleanLine.replace('Author:', '').trim();
            } else if (cleanLine.startsWith('Version:')) {
                metadata.version = cleanLine.replace('Version:', '').trim();
            } else if (cleanLine.startsWith('Category:')) {
                metadata.category = cleanLine.replace('Category:', '').trim();
            }
        }
        
        return metadata;
    } catch (error) {
        return metadata;
    }
}

/**
 * Get file size in bytes
 * @param {string} filePath - Path to file
 * @returns {number} - File size in bytes
 */
function getFileSize(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return stats.size;
    } catch (error) {
        return 0;
    }
}

/**
 * Get description from hook file
 * @param {string} hookPath - Path to hook file
 * @returns {string} - Hook description
 */
function getHookDescription(hookPath) {
    try {
        const content = fs.readFileSync(hookPath, 'utf8');
        const lines = content.split('\n');
        
        // Look for description comment in first few lines
        for (const line of lines.slice(0, 10)) {
            if (line.includes('Description:') || line.includes('Purpose:')) {
                return line.replace(/^#\s*/, '').replace(/^Description:\s*/i, '').replace(/^Purpose:\s*/i, '');
            }
        }
        
        // Default description based on hook name
        const name = path.basename(hookPath, '.sh');
        return `${name.replace(/-/g, ' ')} security hook`;
    } catch (error) {
        return 'Security hook';
    }
}

/**
 * Validate a hook file
 * @param {string} hookPath - Path to hook file
 * @returns {boolean} - True if valid, false otherwise
 */
function validateHook(hookPath) {
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
 * Get installation log
 * @param {boolean} clear - Whether to clear the log after retrieving
 * @returns {Array} - Installation log entries
 */
function getInstallationLog(clear = false) {
    const log = [...installationLog];
    if (clear) {
        installationLog = [];
    }
    return log;
}

/**
 * Remove installed security hooks
 * @param {string} targetHooksDir - Directory containing installed hooks
 * @param {Array|string} hookNames - Array of hook names or single hook name to remove
 * @returns {Object} - Removal result with details
 */
function removeSecurityHooks(targetHooksDir, hookNames) {
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
 * Get hook installation summary
 * @returns {Object} - Summary of hook installations and system status
 */
function getHookInstallationSummary() {
    return {
        totalInstallations: installationLog.length,
        recentInstallations: installationLog.slice(-10),
        availableHooks: getAvailableHooks().length,
        validHooks: getAvailableHooks().filter(h => h.valid).length,
        lastInstallation: installationLog.length > 0 ? 
            installationLog[installationLog.length - 1] : null,
        systemInfo: {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            packageVersion: require('../package.json').version || '0.0.1-alpha.1'
        }
    };
}

/**
 * Clear hook metadata cache (useful for testing or after hook updates)
 */
function clearHookCache() {
    hookMetadataCache = null;
}

/**
 * Backward-compatible wrapper for installSecurityHooks
 * Returns boolean for simple cases, detailed object for complex cases
 */
function installSecurityHooksCompat(targetHooksDir, hookNames, options = {}) {
    const result = installSecurityHooks(targetHooksDir, hookNames, options);
    
    // For backward compatibility, return boolean if no options specified
    // Also handle the case where options is undefined or null
    if (!options || Object.keys(options).length === 0) {
        return result.success;
    }
    
    // Return full result object for advanced usage
    return result;
}

module.exports = {
    // Core functionality (REQ-018 implementation)
    installSecurityHooks: installSecurityHooksCompat,
    removeSecurityHooks,
    getAvailableHooks,
    validateHook,
    
    // Logging and monitoring
    getInstallationLog,
    getHookInstallationSummary,
    
    // Utility functions
    clearHookCache,
    
    // Internal functions exposed for testing
    getSourceHooksDirectory,
    ensureDirectoryExists,
    getHookMetadata,
    getFileSize,
    
    // Advanced API (returns detailed objects)
    installSecurityHooksDetailed: installSecurityHooks
};