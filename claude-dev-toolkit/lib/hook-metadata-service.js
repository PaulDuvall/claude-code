const fs = require('fs');
const path = require('path');

/**
 * Manages hook metadata and discovery
 * Extracted from hook-installer.js for better separation of concerns
 */
class HookMetadataService {
    constructor() {
        this.metadataCache = null;
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.lastCacheUpdate = null;
    }

    /**
     * Get available security hooks with caching for performance
     * @param {boolean} forceRefresh - Force refresh of the cache
     * @returns {Array} Array of available hook information
     */
    getAvailableHooks(forceRefresh = false) {
        try {
            // Return cached data if available and not forcing refresh
            if (this._isCacheValid() && !forceRefresh) {
                return this.metadataCache;
            }

            const sourceHooksDir = this._getSourceHooksDirectory();
            
            if (!fs.existsSync(sourceHooksDir)) {
                this.metadataCache = [];
                this.lastCacheUpdate = Date.now();
                return this.metadataCache;
            }

            const hookFiles = fs.readdirSync(sourceHooksDir).filter(f => f.endsWith('.sh'));
            
            this.metadataCache = hookFiles.map(file => {
                const name = path.basename(file, '.sh');
                const hookPath = path.join(sourceHooksDir, file);
                
                return {
                    name,
                    filename: file,
                    path: hookPath,
                    description: this._getHookDescription(hookPath),
                    metadata: this._getHookMetadata(hookPath),
                    valid: this._isHookValid(hookPath),
                    size: this._getFileSize(hookPath),
                    lastModified: this._getLastModified(hookPath),
                    checksum: this._calculateChecksum(hookPath)
                };
            }).sort((a, b) => a.name.localeCompare(b.name));

            this.lastCacheUpdate = Date.now();
            return this.metadataCache;
        } catch (error) {
            this.metadataCache = [];
            this.lastCacheUpdate = Date.now();
            return this.metadataCache;
        }
    }

    /**
     * Get metadata for a specific hook
     * @param {string} hookName - Name of the hook
     * @returns {Object|null} Hook metadata or null if not found
     */
    getHookMetadata(hookName) {
        const hooks = this.getAvailableHooks();
        return hooks.find(hook => hook.name === hookName) || null;
    }

    /**
     * Search hooks by criteria
     * @param {Object} criteria - Search criteria
     * @param {string} criteria.name - Hook name pattern
     * @param {string} criteria.category - Hook category
     * @param {boolean} criteria.valid - Only valid hooks
     * @param {Array<string>} criteria.tools - Required tools
     * @returns {Array} Matching hooks
     */
    searchHooks(criteria = {}) {
        let hooks = this.getAvailableHooks();

        if (criteria.name) {
            const namePattern = new RegExp(criteria.name, 'i');
            hooks = hooks.filter(hook => namePattern.test(hook.name));
        }

        if (criteria.category) {
            hooks = hooks.filter(hook => 
                hook.metadata.category === criteria.category
            );
        }

        if (criteria.valid !== undefined) {
            hooks = hooks.filter(hook => hook.valid === criteria.valid);
        }

        if (criteria.tools && criteria.tools.length > 0) {
            hooks = hooks.filter(hook =>
                criteria.tools.some(tool => hook.metadata.tools.includes(tool))
            );
        }

        return hooks;
    }

    /**
     * Get hook categories with counts
     * @returns {Object} Categories mapped to hook counts
     */
    getHookCategories() {
        const hooks = this.getAvailableHooks();
        const categories = {};

        hooks.forEach(hook => {
            const category = hook.metadata.category || 'uncategorized';
            categories[category] = (categories[category] || 0) + 1;
        });

        return categories;
    }

    /**
     * Get hooks statistics
     * @returns {Object} Statistics about available hooks
     */
    getHookStats() {
        const hooks = this.getAvailableHooks();
        const validHooks = hooks.filter(hook => hook.valid);
        const categories = this.getHookCategories();

        return {
            total: hooks.length,
            valid: validHooks.length,
            invalid: hooks.length - validHooks.length,
            categories: Object.keys(categories).length,
            categoryBreakdown: categories,
            averageSize: hooks.length > 0 ? 
                Math.round(hooks.reduce((sum, hook) => sum + hook.size, 0) / hooks.length) : 0,
            lastUpdated: this.lastCacheUpdate,
            cacheStatus: this._isCacheValid() ? 'valid' : 'expired'
        };
    }

    /**
     * Validate hook file content
     * @param {string} hookPath - Path to hook file
     * @returns {boolean} True if valid, false otherwise
     */
    validateHook(hookPath) {
        return this._isHookValid(hookPath);
    }

    /**
     * Clear metadata cache
     */
    clearCache() {
        this.metadataCache = null;
        this.lastCacheUpdate = null;
    }

    /**
     * Export hook metadata to JSON
     * @returns {string} JSON representation of all hook metadata
     */
    exportMetadata() {
        const metadata = {
            generated: new Date().toISOString(),
            stats: this.getHookStats(),
            hooks: this.getAvailableHooks()
        };

        return JSON.stringify(metadata, null, 2);
    }

    /**
     * Check if cache is valid (private method)
     * @returns {boolean} True if cache is valid
     * @private
     */
    _isCacheValid() {
        if (!this.metadataCache || !this.lastCacheUpdate) {
            return false;
        }

        return (Date.now() - this.lastCacheUpdate) < this.cacheTimeout;
    }

    /**
     * Get source hooks directory (private method)
     * @returns {string} Path to source hooks directory
     * @private
     */
    _getSourceHooksDirectory() {
        return path.join(__dirname, '../hooks');
    }

    /**
     * Get detailed metadata from hook file (private method)
     * @param {string} hookPath - Path to hook file
     * @returns {Object} Hook metadata
     * @private
     */
    _getHookMetadata(hookPath) {
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
     * Get description from hook file (private method)
     * @param {string} hookPath - Path to hook file
     * @returns {string} Hook description
     * @private
     */
    _getHookDescription(hookPath) {
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
     * Get file size in bytes (private method)
     * @param {string} filePath - Path to file
     * @returns {number} File size in bytes
     * @private
     */
    _getFileSize(filePath) {
        try {
            const stats = fs.statSync(filePath);
            return stats.size;
        } catch (error) {
            return 0;
        }
    }

    /**
     * Get file last modified time (private method)
     * @param {string} filePath - Path to file
     * @returns {Date|null} Last modified time or null
     * @private
     */
    _getLastModified(filePath) {
        try {
            const stats = fs.statSync(filePath);
            return stats.mtime;
        } catch (error) {
            return null;
        }
    }

    /**
     * Calculate file checksum (private method)
     * @param {string} filePath - Path to file
     * @returns {string} MD5 checksum or empty string
     * @private
     */
    _calculateChecksum(filePath) {
        try {
            const crypto = require('crypto');
            const content = fs.readFileSync(filePath);
            return crypto.createHash('md5').update(content).digest('hex');
        } catch (error) {
            return '';
        }
    }

    /**
     * Check if hook is valid (private method)
     * @param {string} hookPath - Path to hook file
     * @returns {boolean} True if valid, false otherwise
     * @private
     */
    _isHookValid(hookPath) {
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
}

module.exports = HookMetadataService;