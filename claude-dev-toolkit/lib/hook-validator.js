const fs = require('fs');
const path = require('path');

/**
 * Validates security hooks and their metadata
 * Extracted from hook-installer.js for better separation of concerns
 */
class HookValidator {
    constructor() {
        this.validationRules = {
            shebangs: ['#!/bin/bash', '#!/bin/sh', '#!/usr/bin/env bash', '#!/usr/bin/env sh'],
            securityKeywords: ['credential', 'security', 'validate', 'check', 'prevent'],
            requiredMetadata: ['Description', 'Purpose', 'Trigger'],
            maxFileSize: 100 * 1024 // 100KB
        };
    }

    /**
     * Validate a hook file
     * @param {string} hookPath - Path to hook file
     * @returns {Object} Validation result with details
     */
    validateHook(hookPath) {
        const result = {
            valid: false,
            errors: [],
            warnings: [],
            metadata: {}
        };

        try {
            // Check if file exists
            if (!fs.existsSync(hookPath)) {
                result.errors.push('Hook file not found');
                return result;
            }

            // Check file size
            const stats = fs.statSync(hookPath);
            if (stats.size > this.validationRules.maxFileSize) {
                result.warnings.push(`File size (${stats.size} bytes) exceeds recommended maximum (${this.validationRules.maxFileSize} bytes)`);
            }

            // Read and validate content
            const content = fs.readFileSync(hookPath, 'utf8');
            
            // Validate shebang
            const shebangValid = this._validateShebang(content);
            if (!shebangValid.valid) {
                result.errors.push(shebangValid.error);
            }

            // Validate security content
            const securityValid = this._validateSecurityContent(content);
            if (!securityValid.valid) {
                result.errors.push(securityValid.error);
            }

            // Extract and validate metadata
            result.metadata = this._extractMetadata(content);
            const metadataValid = this._validateMetadata(result.metadata);
            if (!metadataValid.valid) {
                result.warnings.push(...metadataValid.warnings);
            }

            // Check for executable permissions
            const executableValid = this._validateExecutablePermissions(hookPath);
            if (!executableValid.valid) {
                result.warnings.push(executableValid.warning);
            }

            // Overall validation
            result.valid = result.errors.length === 0;

            return result;

        } catch (error) {
            result.errors.push(`Validation failed: ${error.message}`);
            return result;
        }
    }

    /**
     * Validate multiple hooks in a directory
     * @param {string} hooksDir - Directory containing hooks
     * @returns {Object} Validation results for all hooks
     */
    validateHooksDirectory(hooksDir) {
        const result = {
            valid: true,
            totalHooks: 0,
            validHooks: 0,
            invalidHooks: 0,
            results: {}
        };

        try {
            if (!fs.existsSync(hooksDir)) {
                result.valid = false;
                result.error = 'Hooks directory not found';
                return result;
            }

            const hookFiles = fs.readdirSync(hooksDir).filter(f => f.endsWith('.sh'));
            result.totalHooks = hookFiles.length;

            for (const hookFile of hookFiles) {
                const hookPath = path.join(hooksDir, hookFile);
                const hookName = path.basename(hookFile, '.sh');
                const validation = this.validateHook(hookPath);

                result.results[hookName] = validation;

                if (validation.valid) {
                    result.validHooks++;
                } else {
                    result.invalidHooks++;
                }
            }

            result.valid = result.invalidHooks === 0;

            return result;

        } catch (error) {
            result.valid = false;
            result.error = `Directory validation failed: ${error.message}`;
            return result;
        }
    }

    /**
     * Get validation summary for a set of hooks
     * @param {Array<string>} hookPaths - Array of hook file paths
     * @returns {Object} Validation summary
     */
    getValidationSummary(hookPaths) {
        const summary = {
            total: hookPaths.length,
            valid: 0,
            invalid: 0,
            warnings: 0,
            commonIssues: {},
            recommendations: []
        };

        const allResults = hookPaths.map(hookPath => {
            const hookName = path.basename(hookPath, '.sh');
            return {
                name: hookName,
                result: this.validateHook(hookPath)
            };
        });

        // Aggregate results
        for (const { result } of allResults) {
            if (result.valid) {
                summary.valid++;
            } else {
                summary.invalid++;
            }

            summary.warnings += result.warnings.length;

            // Track common issues
            for (const error of result.errors) {
                summary.commonIssues[error] = (summary.commonIssues[error] || 0) + 1;
            }
        }

        // Generate recommendations
        summary.recommendations = this._generateRecommendations(summary.commonIssues);

        return summary;
    }

    /**
     * Validate hook shebang (private method)
     * @param {string} content - Hook file content
     * @returns {Object} Validation result
     * @private
     */
    _validateShebang(content) {
        const lines = content.split('\n');
        const firstLine = lines[0];

        const hasValidShebang = this.validationRules.shebangs.some(shebang => 
            firstLine.startsWith(shebang)
        );

        return {
            valid: hasValidShebang,
            error: hasValidShebang ? null : `Invalid or missing shebang. Expected one of: ${this.validationRules.shebangs.join(', ')}`
        };
    }

    /**
     * Validate security content (private method)
     * @param {string} content - Hook file content
     * @returns {Object} Validation result
     * @private
     */
    _validateSecurityContent(content) {
        const lowerContent = content.toLowerCase();
        const hasSecurityContent = this.validationRules.securityKeywords.some(keyword => 
            lowerContent.includes(keyword)
        );

        return {
            valid: hasSecurityContent,
            error: hasSecurityContent ? null : `Hook does not appear to contain security-related functionality. Expected keywords: ${this.validationRules.securityKeywords.join(', ')}`
        };
    }

    /**
     * Extract metadata from hook content (private method)
     * @param {string} content - Hook file content
     * @returns {Object} Extracted metadata
     * @private
     */
    _extractMetadata(content) {
        const metadata = {
            trigger: 'PreToolUse',
            blocking: true,
            tools: [],
            author: 'Claude Dev Toolkit',
            version: '1.0.0',
            category: 'security',
            description: null,
            purpose: null
        };

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
            } else if (cleanLine.startsWith('Description:')) {
                metadata.description = cleanLine.replace('Description:', '').trim();
            } else if (cleanLine.startsWith('Purpose:')) {
                metadata.purpose = cleanLine.replace('Purpose:', '').trim();
            }
        }
        
        return metadata;
    }

    /**
     * Validate hook metadata (private method)
     * @param {Object} metadata - Extracted metadata
     * @returns {Object} Validation result
     * @private
     */
    _validateMetadata(metadata) {
        const result = {
            valid: true,
            warnings: []
        };

        // Check for required metadata
        if (!metadata.description && !metadata.purpose) {
            result.warnings.push('Hook missing description or purpose metadata');
        }

        if (!metadata.version || metadata.version === '1.0.0') {
            result.warnings.push('Hook should specify a version number');
        }

        if (!metadata.author || metadata.author === 'Claude Dev Toolkit') {
            result.warnings.push('Hook should specify an author');
        }

        if (metadata.tools.length === 0) {
            result.warnings.push('Hook does not specify which tools it applies to');
        }

        return result;
    }

    /**
     * Validate executable permissions (private method)
     * @param {string} hookPath - Path to hook file
     * @returns {Object} Validation result
     * @private
     */
    _validateExecutablePermissions(hookPath) {
        try {
            const stats = fs.statSync(hookPath);
            const isExecutable = (stats.mode & parseInt('111', 8)) !== 0;

            return {
                valid: isExecutable,
                warning: isExecutable ? null : 'Hook file is not executable (should have execute permissions)'
            };
        } catch (error) {
            return {
                valid: false,
                warning: `Cannot check executable permissions: ${error.message}`
            };
        }
    }

    /**
     * Generate recommendations based on common issues (private method)
     * @param {Object} commonIssues - Map of issues to their frequency
     * @returns {Array<string>} List of recommendations
     * @private
     */
    _generateRecommendations(commonIssues) {
        const recommendations = [];
        const sortedIssues = Object.entries(commonIssues).sort((a, b) => b[1] - a[1]);

        for (const [issue, count] of sortedIssues.slice(0, 5)) { // Top 5 issues
            if (issue.includes('shebang')) {
                recommendations.push('Add proper shebang line (#!/bin/bash) to hook files');
            } else if (issue.includes('security')) {
                recommendations.push('Include security-related keywords and functionality in hooks');
            } else if (issue.includes('executable')) {
                recommendations.push('Make hook files executable with chmod +x');
            } else if (issue.includes('metadata')) {
                recommendations.push('Add descriptive metadata comments to hooks');
            }
        }

        return recommendations;
    }

    /**
     * Get validation rules
     * @returns {Object} Current validation rules
     */
    getValidationRules() {
        return { ...this.validationRules };
    }

    /**
     * Update validation rules
     * @param {Object} newRules - New rules to merge with existing ones
     */
    updateValidationRules(newRules) {
        this.validationRules = { ...this.validationRules, ...newRules };
    }
}

module.exports = HookValidator;