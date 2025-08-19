/**
 * Error Handler Utilities
 * 
 * Shared error handling utilities to eliminate duplication and provide
 * consistent error handling across the application.
 * 
 * Features:
 * - Standardized error creation and formatting
 * - Error categorization and classification  
 * - Recovery suggestion generation
 * - Error context enhancement
 */

class ErrorHandlerUtils {
    constructor() {
        this.config = {
            errorCategories: {
                PERMISSION: 'permission',
                VALIDATION: 'validation', 
                NETWORK: 'network',
                SYSTEM: 'system',
                DEPENDENCY: 'dependency',
                CONFIGURATION: 'configuration'
            },
            errorCodes: {
                // Permission errors
                EACCES: 'EACCES',
                EPERM: 'EPERM',
                ENOENT: 'ENOENT',
                
                // Validation errors
                VALIDATION_ERROR: 'VALIDATION_ERROR',
                INVALID_INPUT: 'INVALID_INPUT',
                INVALID_CONFIGURATION: 'INVALID_CONFIGURATION',
                MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
                
                // Dependency errors
                NOT_FOUND: 'NOT_FOUND',
                VERSION_MISMATCH: 'VERSION_MISMATCH',
                DEPENDENCY_CONFLICT: 'DEPENDENCY_CONFLICT',
                
                // Network errors
                ENOTFOUND: 'ENOTFOUND',
                TIMEOUT: 'TIMEOUT',
                ECONNREFUSED: 'ECONNREFUSED',
                
                // System errors
                SYSTEM_FAILURE: 'SYSTEM_FAILURE',
                CORRUPTION: 'CORRUPTION',
                INSUFFICIENT_RESOURCES: 'INSUFFICIENT_RESOURCES',
                
                // Installation errors
                INSTALLATION_FAILED: 'INSTALLATION_FAILED',
                BACKUP_FAILED: 'BACKUP_FAILED',
                ROLLBACK_FAILED: 'ROLLBACK_FAILED',
                
                // Generic errors
                UNKNOWN_ERROR: 'UNKNOWN_ERROR',
                OPERATION_FAILED: 'OPERATION_FAILED',
                STRING_ERROR: 'STRING_ERROR'
            },
            recoverySuggestionTemplates: this._createRecoverySuggestionTemplates()
        };
    }
    
    /**
     * Create recovery suggestion templates
     * @returns {Object} Recovery suggestion templates
     * @private
     */
    _createRecoverySuggestionTemplates() {
        return {
            permission: {
                immediate: [
                    'Try: Check file and directory permissions',
                    'Solution: Run command with elevated privileges'
                ],
                alternative: [
                    'Use alternative installation location',
                    'Install to user directory instead of system'
                ],
                troubleshooting: [
                    'Check system logs for permission issues',
                    'Verify user has necessary access rights',
                    'Contact system administrator if needed'
                ]
            },
            dependency: {
                immediate: [
                    'Try: Install missing dependency',
                    'Solution: Update system package manager'
                ],
                alternative: [
                    'Use alternative package manager',
                    'Download and install manually'
                ],
                troubleshooting: [
                    'Check internet connectivity',
                    'Verify package repository configuration',
                    'Clear package manager cache'
                ]
            },
            validation: {
                immediate: [
                    'Try: Verify input parameters',
                    'Solution: Check data format and types'
                ],
                alternative: [
                    'Use default values where applicable',
                    'Regenerate configuration if corrupted'
                ],
                troubleshooting: [
                    'Enable debug mode for detailed errors',
                    'Check application logs',
                    'Review input validation requirements'
                ]
            }
        };
    }
    
    /**
     * Create enhanced error object with additional context
     * @param {Error|Object} originalError - Original error or error-like object
     * @param {Object} context - Additional context information
     * @returns {Object} Enhanced error object
     */
    createEnhancedError(originalError, context = {}) {
        const baseError = this._extractBaseErrorInfo(originalError);
        
        return {
            ...baseError,
            category: this._categorizeError(baseError),
            context: context,
            timestamp: new Date().toISOString(),
            handled: false,
            recoverable: this._isRecoverableError(baseError),
            severity: this._determineSeverity(baseError, context)
        };
    }
    
    /**
     * Extract base error information from various error types
     * @param {Error|Object} error - Error to extract from
     * @returns {Object} Base error information
     * @private
     */
    _extractBaseErrorInfo(error) {
        if (!error) {
            return {
                code: this.config.errorCodes.INVALID_INPUT,
                message: 'Unknown error occurred',
                type: 'unknown'
            };
        }
        
        // Handle Error objects
        if (error instanceof Error) {
            return {
                code: error.code || 'UNKNOWN_ERROR',
                message: error.message,
                type: error.constructor.name,
                stack: error.stack,
                path: error.path,
                errno: error.errno
            };
        }
        
        // Handle error-like objects
        if (typeof error === 'object') {
            return {
                code: error.code || 'UNKNOWN_ERROR',
                message: error.message || 'Unknown error occurred',
                type: error.type || 'object',
                ...error
            };
        }
        
        // Handle string errors
        return {
            code: 'STRING_ERROR',
            message: String(error),
            type: 'string'
        };
    }
    
    /**
     * Categorize error based on code and type
     * @param {Object} errorInfo - Error information
     * @returns {string} Error category
     * @private
     */
    _categorizeError(errorInfo) {
        const code = errorInfo.code;
        
        // Permission errors
        if (['EACCES', 'EPERM', 'ENOENT'].includes(code)) {
            return this.config.errorCategories.PERMISSION;
        }
        
        // Network errors
        if (['ENOTFOUND', 'TIMEOUT', 'ECONNREFUSED'].includes(code)) {
            return this.config.errorCategories.NETWORK;
        }
        
        // Validation errors
        if (['VALIDATION_ERROR', 'INVALID_INPUT'].includes(code)) {
            return this.config.errorCategories.VALIDATION;
        }
        
        // Dependency errors
        if (['NOT_FOUND', 'VERSION_MISMATCH'].includes(code)) {
            return this.config.errorCategories.DEPENDENCY;
        }
        
        return this.config.errorCategories.SYSTEM;
    }
    
    /**
     * Determine if error is recoverable
     * @param {Object} errorInfo - Error information
     * @returns {boolean} True if error is recoverable
     * @private
     */
    _isRecoverableError(errorInfo) {
        const recoverableCodes = [
            'EACCES', 'EPERM', 'NOT_FOUND', 'VERSION_MISMATCH',
            'TIMEOUT', 'VALIDATION_ERROR'
        ];
        
        return recoverableCodes.includes(errorInfo.code);
    }
    
    /**
     * Determine error severity
     * @param {Object} errorInfo - Error information  
     * @param {Object} context - Error context
     * @returns {string} Severity level (low, medium, high, critical)
     * @private
     */
    _determineSeverity(errorInfo, context) {
        // Critical errors that prevent core functionality
        if (['SYSTEM_FAILURE', 'CORRUPTION'].includes(errorInfo.code)) {
            return 'critical';
        }
        
        // High severity for system-level issues
        if (context.scope === 'system' || ['EPERM', 'EACCES'].includes(errorInfo.code)) {
            return 'high';
        }
        
        // Medium severity for dependency and validation issues
        if (['NOT_FOUND', 'VERSION_MISMATCH', 'VALIDATION_ERROR'].includes(errorInfo.code)) {
            return 'medium';
        }
        
        // Low severity for non-blocking issues
        return 'low';
    }
    
    /**
     * Generate recovery suggestions for error
     * @param {Object} enhancedError - Enhanced error object
     * @returns {Object} Recovery suggestions
     */
    generateRecoverySuggestions(enhancedError) {
        const category = enhancedError.category;
        const template = this.config.recoverySuggestionTemplates[category] || 
                        this.config.recoverySuggestionTemplates.validation;
        
        const suggestions = {
            immediate: [...template.immediate],
            alternative: [...template.alternative], 
            troubleshooting: [...template.troubleshooting]
        };
        
        // Add context-specific suggestions
        this._addContextSpecificSuggestions(suggestions, enhancedError);
        
        return suggestions;
    }
    
    /**
     * Add context-specific suggestions to recovery options
     * @param {Object} suggestions - Suggestions object to modify
     * @param {Object} enhancedError - Enhanced error object
     * @private
     */
    _addContextSpecificSuggestions(suggestions, enhancedError) {
        const { context, code } = enhancedError;
        
        // Add path-specific suggestions
        if (enhancedError.path) {
            suggestions.immediate.push(`Check permissions for path: ${enhancedError.path}`);
        }
        
        // Add operation-specific suggestions
        if (context.operation) {
            suggestions.alternative.push(`Retry ${context.operation} with different parameters`);
        }
        
        // Add dependency-specific suggestions
        if (context.dependency) {
            suggestions.immediate.push(`Install dependency: ${context.dependency}`);
        }
        
        // Add command-specific suggestions
        if (context.command) {
            suggestions.troubleshooting.push(`Debug command: ${context.command}`);
        }
    }
    
    /**
     * Create error handling result object
     * @param {Object} enhancedError - Enhanced error object
     * @param {boolean} handled - Whether error was handled
     * @param {Object} recovery - Recovery information
     * @returns {Object} Error handling result
     */
    createErrorHandlingResult(enhancedError, handled = false, recovery = null) {
        return {
            error: enhancedError,
            handled,
            recovery,
            suggestions: this.generateRecoverySuggestions(enhancedError),
            timestamp: new Date().toISOString(),
            actionable: enhancedError.recoverable,
            contextAware: Boolean(enhancedError.context && Object.keys(enhancedError.context).length > 0)
        };
    }
    
    /**
     * Format error for user display
     * @param {Object} enhancedError - Enhanced error object
     * @param {Object} options - Formatting options
     * @returns {string} Formatted error message
     */
    formatErrorForDisplay(enhancedError, options = {}) {
        const {
            includeCode = true,
            includeContext = true,
            includeStack = false,
            maxLength = 200
        } = options;
        
        let message = enhancedError.message;
        
        if (includeCode && enhancedError.code) {
            message = `[${enhancedError.code}] ${message}`;
        }
        
        if (includeContext && enhancedError.context && enhancedError.context.operation) {
            message = `${message} (during ${enhancedError.context.operation})`;
        }
        
        if (includeStack && enhancedError.stack) {
            message += `\n\nStack trace:\n${enhancedError.stack}`;
        }
        
        // Truncate if too long
        if (message.length > maxLength) {
            message = message.substring(0, maxLength - 3) + '...';
        }
        
        return message;
    }
    
    /**
     * Check if error matches specific criteria
     * @param {Object} enhancedError - Enhanced error object
     * @param {Object} criteria - Matching criteria
     * @returns {boolean} True if error matches criteria
     */
    matchesErrorCriteria(enhancedError, criteria) {
        const {
            code,
            category,
            severity,
            recoverable,
            contextOperation
        } = criteria;
        
        if (code && enhancedError.code !== code) return false;
        if (category && enhancedError.category !== category) return false;
        if (severity && enhancedError.severity !== severity) return false;
        if (recoverable !== undefined && enhancedError.recoverable !== recoverable) return false;
        if (contextOperation && enhancedError.context?.operation !== contextOperation) return false;
        
        return true;
    }
    
    /**
     * Log error with context information
     * @param {Object} enhancedError - Enhanced error object
     * @param {Object} context - Additional logging context
     */
    logError(enhancedError, context = {}) {
        const logLevel = this._getLogLevel(enhancedError.severity);
        const logMessage = this.formatErrorForDisplay(enhancedError, {
            includeCode: true,
            includeContext: true,
            includeStack: false
        });
        
        console[logLevel](`[${enhancedError.category}] ${logMessage}`);
        
        if (context.attempt) {
            console.warn(`  Attempt ${context.attempt}/${context.maxAttempts || 'unknown'}`);
        }
        
        if (context.operationId) {
            console.debug(`  Operation ID: ${context.operationId}`);
        }
    }
    
    /**
     * Get appropriate console log level for error severity
     * @param {string} severity - Error severity level
     * @returns {string} Console method name
     * @private
     */
    _getLogLevel(severity) {
        switch (severity) {
            case 'critical': return 'error';
            case 'high': return 'error';
            case 'medium': return 'warn';
            case 'low': return 'info';
            default: return 'log';
        }
    }
}

module.exports = ErrorHandlerUtils;