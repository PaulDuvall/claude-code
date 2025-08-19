/**
 * Version Validator Service
 * 
 * Handles version validation, comparison, and requirement checking.
 * Extracted from DependencyValidator as part of Phase 1 bloater refactoring.
 * 
 * Features:
 * - Semantic version comparison
 * - Version requirement parsing
 * - Version extraction from command output
 * - Cross-platform version validation
 */

class VersionValidatorService {
    constructor() {
        this.config = {
            versionPatterns: this._createVersionPatterns()
        };
    }
    
    /**
     * Create version detection patterns
     * @returns {Array} Version extraction patterns
     * @private
     */
    _createVersionPatterns() {
        return [
            /version\s+(\d+\.\d+\.\d+)/i,
            /v?(\d+\.\d+\.\d+)/,
            /(\d+\.\d+\.\d+)/
        ];
    }
    
    /**
     * Validate version requirement against current version
     * @param {string} requirement - Version requirement (e.g., ">=18.0.0")
     * @param {string} currentVersion - Current installed version
     * @returns {Object} Version validation result
     */
    validateVersionRequirement(requirement, currentVersion) {
        const result = {
            satisfies: false,
            requirement: requirement,
            current: currentVersion,
            message: ''
        };

        try {
            // Simple version comparison implementation
            const normalizedCurrent = this._normalizeVersion(currentVersion);
            const parsedRequirement = this._parseVersionRequirement(requirement);
            
            result.satisfies = this._compareVersions(normalizedCurrent, parsedRequirement);
            result.message = result.satisfies ? 
                `Version ${currentVersion} satisfies requirement ${requirement}` :
                `Version ${currentVersion} does not satisfy requirement ${requirement}`;

        } catch (error) {
            result.message = `Version validation error: ${error.message}`;
        }

        return result;
    }
    
    /**
     * Extract version number from command output
     * @param {string} output - Command output
     * @returns {string} Extracted version
     */
    extractVersionFromOutput(output) {
        for (const pattern of this.config.versionPatterns) {
            const match = output.match(pattern);
            if (match) {
                return match[1];
            }
        }
        return 'Unknown';
    }
    
    /**
     * Compare two version strings
     * @param {string} version1 - First version
     * @param {string} version2 - Second version
     * @returns {number} Comparison result (-1, 0, 1)
     */
    compareVersionStrings(version1, version2) {
        const v1Parts = this._normalizeVersion(version1);
        const v2Parts = this._normalizeVersion(version2);
        
        // Pad arrays to same length
        while (v1Parts.length < v2Parts.length) v1Parts.push(0);
        while (v2Parts.length < v1Parts.length) v2Parts.push(0);
        
        for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
            const v1Part = v1Parts[i] || 0;
            const v2Part = v2Parts[i] || 0;
            
            if (v1Part > v2Part) return 1;
            if (v1Part < v2Part) return -1;
        }
        
        return 0;
    }
    
    /**
     * Check if a version satisfies a requirement
     * @param {string} version - Version to check
     * @param {string} requirement - Version requirement
     * @returns {boolean} Whether version satisfies requirement
     */
    satisfiesRequirement(version, requirement) {
        const normalizedVersion = this._normalizeVersion(version);
        const parsedRequirement = this._parseVersionRequirement(requirement);
        
        return this._compareVersions(normalizedVersion, parsedRequirement);
    }
    
    /**
     * Parse a version requirement string
     * @param {string} requirement - Version requirement string (e.g., ">=1.0.0")
     * @returns {Object} Parsed requirement with operator and version
     */
    parseVersionRequirement(requirement) {
        return this._parseVersionRequirement(requirement);
    }
    
    /**
     * Normalize a version string to version parts array
     * @param {string} version - Version string
     * @returns {Array<number>} Normalized version parts
     */
    normalizeVersion(version) {
        return this._normalizeVersion(version);
    }
    
    /**
     * Check if version is greater or equal to another version
     * @param {string} version - Version to check
     * @param {string} minimumVersion - Minimum required version
     * @returns {boolean} Whether version >= minimumVersion
     */
    isGreaterOrEqual(version, minimumVersion) {
        const current = this._normalizeVersion(version);
        const required = this._normalizeVersion(minimumVersion);
        
        return this._isGreaterOrEqual(current, required);
    }
    
    /**
     * Get the higher of two versions
     * @param {string} version1 - First version
     * @param {string} version2 - Second version
     * @returns {string} Higher version
     */
    getHigherVersion(version1, version2) {
        const comparison = this.compareVersionStrings(version1, version2);
        return comparison >= 0 ? version1 : version2;
    }
    
    /**
     * Validate multiple version requirements
     * @param {string} version - Version to validate
     * @param {Array<string>} requirements - Array of requirements
     * @returns {Object} Validation result for all requirements
     */
    validateMultipleRequirements(version, requirements) {
        const results = [];
        let allSatisfied = true;
        
        for (const requirement of requirements) {
            const result = this.validateVersionRequirement(requirement, version);
            results.push(result);
            if (!result.satisfies) {
                allSatisfied = false;
            }
        }
        
        return {
            version: version,
            allSatisfied: allSatisfied,
            results: results,
            failedRequirements: results.filter(r => !r.satisfies).map(r => r.requirement)
        };
    }
    
    /**
     * Check if a version string is valid
     * @param {string} version - Version string to validate
     * @returns {boolean} Whether version string is valid
     */
    isValidVersionString(version) {
        try {
            const normalized = this._normalizeVersion(version);
            return normalized.length >= 1 && normalized.every(part => typeof part === 'number' && part >= 0);
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Generate version requirement suggestions
     * @param {string} currentVersion - Current version
     * @param {string} targetVersion - Target version
     * @returns {Object} Version requirement suggestions
     */
    generateVersionRequirementSuggestions(currentVersion, targetVersion) {
        const comparison = this.compareVersionStrings(currentVersion, targetVersion);
        const suggestions = [];
        
        if (comparison < 0) {
            suggestions.push(`Upgrade from ${currentVersion} to ${targetVersion} or higher`);
            suggestions.push(`Use version requirement: ">=${targetVersion}"`);
        } else if (comparison === 0) {
            suggestions.push(`Current version ${currentVersion} matches target ${targetVersion}`);
            suggestions.push(`Use version requirement: "=${targetVersion}"`);
        } else {
            suggestions.push(`Current version ${currentVersion} is higher than target ${targetVersion}`);
            suggestions.push(`Consider using: "^${targetVersion}" for compatibility`);
        }
        
        return {
            currentVersion: currentVersion,
            targetVersion: targetVersion,
            comparison: comparison,
            suggestions: suggestions,
            recommended: comparison < 0 ? `>=${targetVersion}` : `^${targetVersion}`
        };
    }
    
    /**
     * Normalize version string for comparison (private)
     * @param {string} version - Version string
     * @returns {Array<number>} Normalized version parts
     * @private
     */
    _normalizeVersion(version) {
        return version.replace(/^v/, '').split('.').map(part => parseInt(part) || 0);
    }

    /**
     * Parse version requirement (private)
     * @param {string} requirement - Version requirement string
     * @returns {Object} Parsed requirement
     * @private
     */
    _parseVersionRequirement(requirement) {
        const operators = ['>=', '<=', '>', '<', '~', '^', '='];
        let operator = '=';
        let version = requirement;

        for (const op of operators) {
            if (requirement.startsWith(op)) {
                operator = op;
                version = requirement.slice(op.length);
                break;
            }
        }

        return {
            operator: operator,
            version: this._normalizeVersion(version)
        };
    }

    /**
     * Compare versions according to requirement (private)
     * @param {Array<number>} current - Current version parts
     * @param {Object} requirement - Parsed requirement
     * @returns {boolean} Whether version satisfies requirement
     * @private
     */
    _compareVersions(current, requirement) {
        const required = requirement.version;
        const operator = requirement.operator;

        // Pad arrays to same length
        while (current.length < required.length) current.push(0);
        while (required.length < current.length) required.push(0);

        // Handle semver operators
        if (operator === '^') {
            // Caret: compatible within same major version
            if (current[0] !== required[0]) return false;
            return this._isGreaterOrEqual(current, required);
        } else if (operator === '~') {
            // Tilde: compatible within same minor version
            if (current[0] !== required[0] || current[1] !== required[1]) return false;
            return this._isGreaterOrEqual(current, required);
        }

        // Compare version parts for other operators
        for (let i = 0; i < Math.max(current.length, required.length); i++) {
            const curr = current[i] || 0;
            const req = required[i] || 0;

            if (curr > req) {
                return ['>', '>=', '!='].includes(operator);
            } else if (curr < req) {
                return ['<', '<=', '!='].includes(operator);
            }
        }

        // Versions are equal
        return ['=', '>=', '<=', '~', '^'].includes(operator);
    }
    
    /**
     * Check if current version is greater or equal to required (private)
     * @param {Array<number>} current - Current version parts
     * @param {Array<number>} required - Required version parts
     * @returns {boolean} Whether current >= required
     * @private
     */
    _isGreaterOrEqual(current, required) {
        for (let i = 0; i < Math.max(current.length, required.length); i++) {
            const curr = current[i] || 0;
            const req = required[i] || 0;
            
            if (curr > req) return true;
            if (curr < req) return false;
        }
        return true; // Equal
    }
}

module.exports = VersionValidatorService;