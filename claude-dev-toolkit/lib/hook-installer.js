// Security Hook Installer for Claude Dev Toolkit
// Implements REQ-018: Security Hook Installation
const fs = require('fs');
const path = require('path');

// Import modular components for better separation of concerns
const HookInstaller = require('./hook-installer-core');
const HookValidator = require('./hook-validator');
const HookMetadataService = require('./hook-metadata-service');

// Create singleton instances
const hookInstaller = new HookInstaller();
const hookValidator = new HookValidator();
const hookMetadataService = new HookMetadataService();

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
    return hookInstaller.installSecurityHooks(targetHooksDir, hookNames, options);
}

// Legacy functions maintained for backward compatibility

/**
 * Get the source hooks directory path
 * @returns {string} - Path to source hooks directory
 */
function getSourceHooksDirectory() {
    return hookInstaller.getSourceHooksDirectory();
}

/**
 * Get available security hooks with caching for performance
 * @param {boolean} forceRefresh - Force refresh of the cache
 * @returns {Array} - Array of available hook information
 */
function getAvailableHooks(forceRefresh = false) {
    return hookMetadataService.getAvailableHooks(forceRefresh);
}

// Legacy functions - delegated to metadata service for backward compatibility

/**
 * Get detailed metadata from hook file
 * @param {string} hookPath - Path to hook file
 * @returns {Object} - Hook metadata
 */
function getHookMetadata(hookPath) {
    const hooks = hookMetadataService.getAvailableHooks();
    const hookName = path.basename(hookPath, '.sh');
    const hook = hooks.find(h => h.name === hookName);
    return hook ? hook.metadata : {};
}

/**
 * Get file size in bytes
 * @param {string} filePath - Path to file
 * @returns {number} - File size in bytes
 */
function getFileSize(filePath) {
    const hooks = hookMetadataService.getAvailableHooks();
    const hookName = path.basename(filePath, '.sh');
    const hook = hooks.find(h => h.name === hookName);
    return hook ? hook.size : 0;
}

/**
 * Get description from hook file
 * @param {string} hookPath - Path to hook file
 * @returns {string} - Hook description
 */
function getHookDescription(hookPath) {
    const hooks = hookMetadataService.getAvailableHooks();
    const hookName = path.basename(hookPath, '.sh');
    const hook = hooks.find(h => h.name === hookName);
    return hook ? hook.description : 'Security hook';
}

/**
 * Validate a hook file
 * @param {string} hookPath - Path to hook file
 * @returns {boolean} - True if valid, false otherwise
 */
function validateHook(hookPath) {
    const result = hookValidator.validateHook(hookPath);
    return result.valid;
}

/**
 * Get installation log
 * @param {boolean} clear - Whether to clear the log after retrieving
 * @returns {Array} - Installation log entries
 */
function getInstallationLog(clear = false) {
    return hookInstaller.getInstallationLog(clear);
}

/**
 * Remove installed security hooks
 * @param {string} targetHooksDir - Directory containing installed hooks
 * @param {Array|string} hookNames - Array of hook names or single hook name to remove
 * @returns {Object} - Removal result with details
 */
function removeSecurityHooks(targetHooksDir, hookNames) {
    return hookInstaller.removeSecurityHooks(targetHooksDir, hookNames);
}

/**
 * Get hook installation summary
 * @returns {Object} - Summary of hook installations and system status
 */
function getHookInstallationSummary() {
    const installerSummary = hookInstaller.getHookInstallationSummary();
    const metadataStats = hookMetadataService.getHookStats();
    
    return {
        ...installerSummary,
        availableHooks: metadataStats.total,
        validHooks: metadataStats.valid
    };
}

/**
 * Clear hook metadata cache (useful for testing or after hook updates)
 */
function clearHookCache() {
    hookMetadataService.clearCache();
}

/**
 * Backward-compatible wrapper for installSecurityHooks
 * Returns boolean for simple cases, detailed object for complex cases
 */
function installSecurityHooksCompat(targetHooksDir, hookNames, options = {}) {
    const result = installSecurityHooks(targetHooksDir, hookNames, options);
    
    // For backward compatibility, return boolean if no options specified
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
    
    // Internal functions exposed for testing (legacy support)
    getSourceHooksDirectory,
    getHookMetadata,
    getFileSize,
    
    // Advanced API (returns detailed objects)
    installSecurityHooksDetailed: installSecurityHooks,
    
    // Access to modular components for advanced usage
    HookInstaller,
    HookValidator,
    HookMetadataService,
    
    // Component instances
    installer: hookInstaller,
    validator: hookValidator,
    metadataService: hookMetadataService
};