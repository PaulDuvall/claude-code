/**
 * Error Factory
 * 
 * Standardized error creation factory for consistent error handling across the application.
 * Works in conjunction with ErrorHandlerUtils to provide comprehensive error management.
 * 
 * Features:
 * - Standardized error creation methods
 * - Consistent error codes and structures
 * - Context-aware error generation
 * - Integration with error handling workflows
 */

const ErrorHandlerUtils = require('./error-handler-utils');

class ErrorFactory {
    constructor() {
        this.errorHandler = new ErrorHandlerUtils();
        this.config = {
            errorCodes: this.errorHandler.config.errorCodes,
            defaultContext: {
                timestamp: () => new Date().toISOString(),
                platform: process.platform,
                nodeVersion: process.version
            }
        };
    }
    
    /**
     * Create standardized error object
     * @param {string} code - Error code
     * @param {string} message - Error message
     * @param {Object} details - Additional error details
     * @param {Object} context - Error context
     * @returns {Error} Standardized error object
     */
    createStandardError(code, message, details = {}, context = {}) {
        const error = new Error(message);
        error.code = code;
        error.details = details;
        error.context = { ...this.config.defaultContext, ...context };
        error.timestamp = new Date().toISOString();
        return error;
    }
    
    /**
     * Create permission-related errors
     */
    createPermissionError(message, path, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.EACCES, 
            message, 
            { path, type: 'permission' }, 
            context
        );
    }
    
    createNotFoundError(message, path, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.ENOENT, 
            message, 
            { path, type: 'not_found' }, 
            context
        );
    }
    
    createPermissionDeniedError(operation, path, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.EPERM,
            `Permission denied for ${operation} on ${path}`,
            { operation, path, type: 'permission_denied' },
            context
        );
    }
    
    /**
     * Create validation-related errors
     */
    createValidationError(message, field, value, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.VALIDATION_ERROR, 
            message, 
            { field, value, type: 'validation' }, 
            context
        );
    }
    
    createInvalidInputError(message, input, expectedType = null, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.INVALID_INPUT, 
            message, 
            { input, expectedType, type: 'invalid_input' }, 
            context
        );
    }
    
    createConfigurationError(message, configPath, configData = null, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.INVALID_CONFIGURATION,
            message,
            { configPath, configData, type: 'configuration' },
            context
        );
    }
    
    createMissingRequiredFieldError(field, object, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.MISSING_REQUIRED_FIELD,
            `Missing required field: ${field}`,
            { field, object, type: 'missing_field' },
            context
        );
    }
    
    /**
     * Create dependency-related errors
     */
    createDependencyNotFoundError(dependency, details = {}, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.NOT_FOUND, 
            `Dependency not found: ${dependency}`, 
            { dependency, ...details, type: 'dependency_not_found' }, 
            context
        );
    }
    
    createVersionMismatchError(dependency, current, required, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.VERSION_MISMATCH, 
            `Version mismatch for ${dependency}: current ${current}, required ${required}`,
            { dependency, current, required, type: 'version_mismatch' },
            context
        );
    }
    
    createDependencyConflictError(dependency1, dependency2, reason, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.DEPENDENCY_CONFLICT,
            `Dependency conflict between ${dependency1} and ${dependency2}: ${reason}`,
            { dependency1, dependency2, reason, type: 'dependency_conflict' },
            context
        );
    }
    
    /**
     * Create system-related errors
     */
    createSystemError(message, details = {}, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.SYSTEM_FAILURE, 
            message, 
            { ...details, type: 'system' }, 
            context
        );
    }
    
    createInsufficientResourcesError(resource, available, required, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.INSUFFICIENT_RESOURCES,
            `Insufficient ${resource}: available ${available}, required ${required}`,
            { resource, available, required, type: 'insufficient_resources' },
            context
        );
    }
    
    createCorruptionError(target, details = {}, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.CORRUPTION,
            `Corruption detected in ${target}`,
            { target, ...details, type: 'corruption' },
            context
        );
    }
    
    /**
     * Create installation-related errors
     */
    createInstallationError(operation, details = {}, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.INSTALLATION_FAILED, 
            `Installation failed during ${operation}`, 
            { operation, ...details, type: 'installation' }, 
            context
        );
    }
    
    createBackupError(message, path, details = {}, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.BACKUP_FAILED, 
            message, 
            { path, ...details, type: 'backup' }, 
            context
        );
    }
    
    createRollbackError(message, operation, details = {}, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.ROLLBACK_FAILED, 
            message, 
            { operation, ...details, type: 'rollback' }, 
            context
        );
    }
    
    /**
     * Create network-related errors
     */
    createNetworkError(message, url, timeout = null, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.TIMEOUT, 
            message, 
            { url, timeout, type: 'network' }, 
            context
        );
    }
    
    createConnectionError(message, host, port = null, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.ECONNREFUSED, 
            message, 
            { host, port, type: 'connection' }, 
            context
        );
    }
    
    createDnsError(message, hostname, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.ENOTFOUND,
            message,
            { hostname, type: 'dns' },
            context
        );
    }
    
    /**
     * Create operation-related errors
     */
    createOperationFailedError(operation, reason, details = {}, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.OPERATION_FAILED,
            `Operation failed: ${operation} - ${reason}`,
            { operation, reason, ...details, type: 'operation' },
            context
        );
    }
    
    createUnknownError(message = 'An unknown error occurred', details = {}, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.UNKNOWN_ERROR,
            message,
            { ...details, type: 'unknown' },
            context
        );
    }
    
    /**
     * Wrap an existing error with enhanced context
     * @param {Error} originalError - Original error to wrap
     * @param {Object} additionalContext - Additional context to add
     * @returns {Error} Enhanced error
     */
    wrapError(originalError, additionalContext = {}) {
        if (!originalError) {
            return this.createUnknownError('No error provided', {}, additionalContext);
        }
        
        const enhanced = this.errorHandler.createEnhancedError(originalError, additionalContext);
        
        // Create new error with enhanced information
        const wrappedError = new Error(enhanced.message);
        wrappedError.code = enhanced.code;
        wrappedError.details = enhanced.details || {};
        wrappedError.context = enhanced.context;
        wrappedError.category = enhanced.category;
        wrappedError.severity = enhanced.severity;
        wrappedError.recoverable = enhanced.recoverable;
        wrappedError.originalError = originalError;
        wrappedError.timestamp = enhanced.timestamp;
        
        return wrappedError;
    }
    
    /**
     * Create error from string with automatic categorization
     * @param {string} errorString - Error string
     * @param {Object} context - Error context
     * @returns {Error} Categorized error
     */
    createFromString(errorString, context = {}) {
        if (!errorString || typeof errorString !== 'string') {
            return this.createInvalidInputError('Invalid error string provided', errorString, 'string', context);
        }
        
        // Try to detect error type from string content
        const lowerString = errorString.toLowerCase();
        
        if (lowerString.includes('permission') || lowerString.includes('access')) {
            return this.createPermissionError(errorString, null, context);
        }
        
        if (lowerString.includes('not found') || lowerString.includes('missing')) {
            return this.createNotFoundError(errorString, null, context);
        }
        
        if (lowerString.includes('network') || lowerString.includes('timeout')) {
            return this.createNetworkError(errorString, null, null, context);
        }
        
        if (lowerString.includes('validation') || lowerString.includes('invalid')) {
            return this.createValidationError(errorString, null, null, context);
        }
        
        // Default to generic error
        return this.createStandardError(
            this.config.errorCodes.STRING_ERROR,
            errorString,
            { originalString: errorString, type: 'string_error' },
            context
        );
    }
    
    /**
     * Create error with automatic retry configuration
     * @param {string} code - Error code
     * @param {string} message - Error message
     * @param {Object} details - Error details
     * @param {Object} retryConfig - Retry configuration
     * @param {Object} context - Error context
     * @returns {Error} Error with retry configuration
     */
    createRetryableError(code, message, details = {}, retryConfig = {}, context = {}) {
        const error = this.createStandardError(code, message, details, context);
        
        error.retryConfig = {
            maxAttempts: 3,
            delay: 1000,
            backoff: 'exponential',
            retryable: true,
            ...retryConfig
        };
        
        return error;
    }
    
    /**
     * Create contextual error for specific operations
     * @param {string} operation - Operation being performed
     * @param {Error|string} originalError - Original error or error message
     * @param {Object} operationContext - Operation-specific context
     * @returns {Error} Contextual error
     */
    createContextualError(operation, originalError, operationContext = {}) {
        const context = {
            operation,
            ...operationContext,
            timestamp: new Date().toISOString()
        };
        
        if (originalError instanceof Error) {
            return this.wrapError(originalError, context);
        } else if (typeof originalError === 'string') {
            return this.createFromString(originalError, context);
        } else {
            return this.createOperationFailedError(operation, 'Unknown error occurred', { originalError }, context);
        }
    }
    
    /**
     * Batch create multiple errors with consistent context
     * @param {Array} errorSpecs - Array of error specifications
     * @param {Object} sharedContext - Shared context for all errors
     * @returns {Array<Error>} Array of created errors
     */
    createBatch(errorSpecs, sharedContext = {}) {
        return errorSpecs.map(spec => {
            const { code, message, details = {}, context = {} } = spec;
            const combinedContext = { ...sharedContext, ...context };
            return this.createStandardError(code, message, details, combinedContext);
        });
    }
    
    /**
     * Get error factory instance (singleton pattern)
     * @returns {ErrorFactory} Error factory instance
     */
    static getInstance() {
        if (!ErrorFactory._instance) {
            ErrorFactory._instance = new ErrorFactory();
        }
        return ErrorFactory._instance;
    }
}

module.exports = ErrorFactory;