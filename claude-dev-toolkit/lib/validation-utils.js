/**
 * Validation Utilities
 * 
 * Shared validation patterns and error handling utilities to eliminate duplication
 * across DependencyValidator and PermissionErrorHandler classes.
 * 
 * Features:
 * - Common validation patterns
 * - Error result creation
 * - Context validation
 * - Version comparison utilities
 */

class ValidationUtils {
    constructor() {
        this.config = {
            errorCodes: {
                VALIDATION_ERROR: 'VALIDATION_ERROR',
                NOT_FOUND: 'NOT_FOUND',
                VERSION_MISMATCH: 'VERSION_MISMATCH',
                INVALID_INPUT: 'INVALID_INPUT'
            },
            versionPatterns: [
                /version\s+(\d+\.\d+\.\d+)/i,
                /v?(\d+\.\d+\.\d+)/,
                /(\d+\.\d+\.\d+)/
            ]
        };
    }
    
    /**
     * Create a standardized error result object
     * @param {string} code - Error code
     * @param {string} message - Error message
     * @param {Object} additionalInfo - Additional error information
     * @returns {Object} Standardized error result
     */
    createErrorResult(code, message, additionalInfo = {}) {
        return {
            error: {
                code,
                message,
                ...additionalInfo
            },
            success: false,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Create a standardized success result object
     * @param {Object} data - Success data
     * @param {string} message - Success message (optional)
     * @returns {Object} Standardized success result
     */
    createSuccessResult(data = {}, message = null) {
        return {
            success: true,
            data,
            message,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Validate required properties on an object
     * @param {Object} obj - Object to validate
     * @param {Array<string>} requiredProps - Required property names
     * @param {string} objectName - Name of object for error messages
     * @returns {Object} Validation result
     */
    validateRequiredProperties(obj, requiredProps, objectName = 'object') {
        if (!obj || typeof obj !== 'object') {
            return this.createErrorResult(
                this.config.errorCodes.INVALID_INPUT,
                `${objectName} must be a valid object`
            );
        }
        
        const missingProps = requiredProps.filter(prop => 
            !obj.hasOwnProperty(prop) || obj[prop] === undefined || obj[prop] === null
        );
        
        if (missingProps.length > 0) {
            return this.createErrorResult(
                this.config.errorCodes.INVALID_INPUT,
                `${objectName} missing required properties: ${missingProps.join(', ')}`
            );
        }
        
        return this.createSuccessResult();
    }
    
    /**
     * Validate that a value is not null or undefined
     * @param {*} value - Value to validate
     * @param {string} name - Name for error messages
     * @returns {Object} Validation result
     */
    validateNotEmpty(value, name = 'value') {
        if (value === null || value === undefined) {
            return this.createErrorResult(
                this.config.errorCodes.INVALID_INPUT,
                `${name} cannot be null or undefined`
            );
        }
        
        if (typeof value === 'string' && value.trim() === '') {
            return this.createErrorResult(
                this.config.errorCodes.INVALID_INPUT,
                `${name} cannot be empty`
            );
        }
        
        return this.createSuccessResult();
    }
    
    /**
     * Normalize version string for comparison
     * @param {string} version - Version string to normalize
     * @returns {Array<number>} Normalized version parts
     */
    normalizeVersion(version) {
        if (!version || typeof version !== 'string') {
            return [0, 0, 0];
        }
        
        return version.replace(/^v/, '').split('.').map(part => parseInt(part) || 0);
    }
    
    /**
     * Extract version from command output
     * @param {string} output - Command output containing version
     * @returns {string|null} Extracted version or null
     */
    extractVersionFromOutput(output) {
        if (!output || typeof output !== 'string') return null;
        
        for (const pattern of this.config.versionPatterns) {
            const match = output.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        
        return null;
    }
    
    /**
     * Parse version requirement string
     * @param {string} requirement - Version requirement (e.g., ">=18.0.0", "^2.1.0")
     * @returns {Object} Parsed requirement with operator and version
     */
    parseVersionRequirement(requirement) {
        if (!requirement || typeof requirement !== 'string') {
            return { operator: '=', version: [0, 0, 0] };
        }
        
        const operators = ['>=', '<=', '>', '<', '~', '^', '='];
        let operator = '=';
        let version = requirement;
        
        for (const op of operators) {
            if (requirement.startsWith(op)) {
                operator = op;
                version = requirement.slice(op.length).trim();
                break;
            }
        }
        
        return {
            operator,
            version: this.normalizeVersion(version)
        };
    }
    
    /**
     * Compare two version arrays
     * @param {Array<number>} current - Current version parts
     * @param {Array<number>} required - Required version parts
     * @param {string} operator - Comparison operator
     * @returns {boolean} Whether version satisfies requirement
     */
    compareVersions(current, required, operator = '=') {
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
        
        // Standard comparison operators
        const comparison = this._compareVersionArrays(current, required);
        
        switch (operator) {
            case '>': return comparison > 0;
            case '>=': return comparison >= 0;
            case '<': return comparison < 0;
            case '<=': return comparison <= 0;
            case '!=': return comparison !== 0;
            case '=':
            default: return comparison === 0;
        }
    }
    
    /**
     * Compare version arrays and return -1, 0, or 1
     * @param {Array<number>} a - First version
     * @param {Array<number>} b - Second version
     * @returns {number} Comparison result
     * @private
     */
    _compareVersionArrays(a, b) {
        for (let i = 0; i < Math.max(a.length, b.length); i++) {
            const aVal = a[i] || 0;
            const bVal = b[i] || 0;
            
            if (aVal > bVal) return 1;
            if (aVal < bVal) return -1;
        }
        return 0;
    }
    
    /**
     * Check if current version is greater or equal to required
     * @param {Array<number>} current - Current version parts
     * @param {Array<number>} required - Required version parts
     * @returns {boolean} Whether current >= required
     * @private
     */
    _isGreaterOrEqual(current, required) {
        return this._compareVersionArrays(current, required) >= 0;
    }
    
    /**
     * Create validation context with common properties
     * @param {Object} input - Input to validate
     * @param {Object} options - Validation options
     * @returns {Object} Validation context
     */
    createValidationContext(input, options = {}) {
        return {
            input,
            options: {
                strict: false,
                allowEmpty: false,
                ...options
            },
            timestamp: new Date().toISOString(),
            errors: [],
            warnings: []
        };
    }
    
    /**
     * Add error to validation context
     * @param {Object} context - Validation context
     * @param {string} code - Error code
     * @param {string} message - Error message
     * @param {Object} details - Additional error details
     */
    addContextError(context, code, message, details = {}) {
        context.errors.push({
            code,
            message,
            details,
            timestamp: new Date().toISOString()
        });
    }
    
    /**
     * Add warning to validation context  
     * @param {Object} context - Validation context
     * @param {string} message - Warning message
     * @param {Object} details - Additional warning details
     */
    addContextWarning(context, message, details = {}) {
        context.warnings.push({
            message,
            details,
            timestamp: new Date().toISOString()
        });
    }
    
    /**
     * Check if validation context has errors
     * @param {Object} context - Validation context
     * @returns {boolean} True if context has errors
     */
    hasContextErrors(context) {
        return context.errors && context.errors.length > 0;
    }
    
    /**
     * Get validation result from context
     * @param {Object} context - Validation context
     * @returns {Object} Validation result
     */
    getContextResult(context) {
        const hasErrors = this.hasContextErrors(context);
        
        return {
            success: !hasErrors,
            errors: context.errors,
            warnings: context.warnings,
            data: hasErrors ? null : context.input,
            timestamp: context.timestamp
        };
    }
}

module.exports = ValidationUtils;