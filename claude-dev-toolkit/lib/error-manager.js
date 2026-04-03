/**
 * Error Manager
 *
 * Unified error handling: creation, categorization, recovery suggestions,
 * formatting, and logging. Replaces error-handler-utils.js + error-factory.js.
 */

class ErrorManager {
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
                EACCES: 'EACCES',
                EPERM: 'EPERM',
                ENOENT: 'ENOENT',
                VALIDATION_ERROR: 'VALIDATION_ERROR',
                INVALID_INPUT: 'INVALID_INPUT',
                INVALID_CONFIGURATION: 'INVALID_CONFIGURATION',
                MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
                NOT_FOUND: 'NOT_FOUND',
                VERSION_MISMATCH: 'VERSION_MISMATCH',
                DEPENDENCY_CONFLICT: 'DEPENDENCY_CONFLICT',
                ENOTFOUND: 'ENOTFOUND',
                TIMEOUT: 'TIMEOUT',
                ECONNREFUSED: 'ECONNREFUSED',
                SYSTEM_FAILURE: 'SYSTEM_FAILURE',
                CORRUPTION: 'CORRUPTION',
                INSUFFICIENT_RESOURCES: 'INSUFFICIENT_RESOURCES',
                INSTALLATION_FAILED: 'INSTALLATION_FAILED',
                BACKUP_FAILED: 'BACKUP_FAILED',
                ROLLBACK_FAILED: 'ROLLBACK_FAILED',
                UNKNOWN_ERROR: 'UNKNOWN_ERROR',
                OPERATION_FAILED: 'OPERATION_FAILED',
                STRING_ERROR: 'STRING_ERROR'
            },
            recoverySuggestionTemplates: {
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
            },
            defaultContext: {
                timestamp: () => new Date().toISOString(),
                platform: process.platform,
                nodeVersion: process.version
            }
        };
    }

    // ── Error Creation ──────────────────────────────────

    createStandardError(code, message, details = {}, context = {}) {
        const error = new Error(message);
        error.code = code;
        error.details = details;
        error.context = { ...this.config.defaultContext, ...context };
        error.timestamp = new Date().toISOString();
        return error;
    }

    createPermissionError(message, path, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.EACCES, message,
            { path, type: 'permission' }, context
        );
    }

    createNotFoundError(message, path, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.ENOENT, message,
            { path, type: 'not_found' }, context
        );
    }

    createPermissionDeniedError(operation, path, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.EPERM,
            `Permission denied for ${operation} on ${path}`,
            { operation, path, type: 'permission_denied' }, context
        );
    }

    createValidationError(message, field, value, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.VALIDATION_ERROR, message,
            { field, value, type: 'validation' }, context
        );
    }

    createInvalidInputError(message, input, expectedType = null, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.INVALID_INPUT, message,
            { input, expectedType, type: 'invalid_input' }, context
        );
    }

    createConfigurationError(message, configPath, configData = null, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.INVALID_CONFIGURATION, message,
            { configPath, configData, type: 'configuration' }, context
        );
    }

    createMissingRequiredFieldError(field, object, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.MISSING_REQUIRED_FIELD,
            `Missing required field: ${field}`,
            { field, object, type: 'missing_field' }, context
        );
    }

    createDependencyNotFoundError(dependency, details = {}, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.NOT_FOUND,
            `Dependency not found: ${dependency}`,
            { dependency, ...details, type: 'dependency_not_found' }, context
        );
    }

    createVersionMismatchError(dependency, current, required, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.VERSION_MISMATCH,
            `Version mismatch for ${dependency}: current ${current}, required ${required}`,
            { dependency, current, required, type: 'version_mismatch' }, context
        );
    }

    createDependencyConflictError(dep1, dep2, reason, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.DEPENDENCY_CONFLICT,
            `Dependency conflict between ${dep1} and ${dep2}: ${reason}`,
            { dependency1: dep1, dependency2: dep2, reason, type: 'dependency_conflict' }, context
        );
    }

    createSystemError(message, details = {}, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.SYSTEM_FAILURE, message,
            { ...details, type: 'system' }, context
        );
    }

    createInsufficientResourcesError(resource, available, required, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.INSUFFICIENT_RESOURCES,
            `Insufficient ${resource}: available ${available}, required ${required}`,
            { resource, available, required, type: 'insufficient_resources' }, context
        );
    }

    createCorruptionError(target, details = {}, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.CORRUPTION,
            `Corruption detected in ${target}`,
            { target, ...details, type: 'corruption' }, context
        );
    }

    createInstallationError(operation, details = {}, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.INSTALLATION_FAILED,
            `Installation failed during ${operation}`,
            { operation, ...details, type: 'installation' }, context
        );
    }

    createBackupError(message, path, details = {}, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.BACKUP_FAILED, message,
            { path, ...details, type: 'backup' }, context
        );
    }

    createRollbackError(message, operation, details = {}, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.ROLLBACK_FAILED, message,
            { operation, ...details, type: 'rollback' }, context
        );
    }

    createNetworkError(message, url, timeout = null, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.TIMEOUT, message,
            { url, timeout, type: 'network' }, context
        );
    }

    createConnectionError(message, host, port = null, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.ECONNREFUSED, message,
            { host, port, type: 'connection' }, context
        );
    }

    createDnsError(message, hostname, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.ENOTFOUND, message,
            { hostname, type: 'dns' }, context
        );
    }

    createOperationFailedError(operation, reason, details = {}, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.OPERATION_FAILED,
            `Operation failed: ${operation} - ${reason}`,
            { operation, reason, ...details, type: 'operation' }, context
        );
    }

    createUnknownError(message = 'An unknown error occurred', details = {}, context = {}) {
        return this.createStandardError(
            this.config.errorCodes.UNKNOWN_ERROR, message,
            { ...details, type: 'unknown' }, context
        );
    }

    createRetryableError(code, message, details = {}, retryConfig = {}, context = {}) {
        const error = this.createStandardError(code, message, details, context);
        error.retryConfig = {
            maxAttempts: 3, delay: 1000, backoff: 'exponential', retryable: true,
            ...retryConfig
        };
        return error;
    }

    // ── Error Enhancement & Wrapping ────────────────────

    createEnhancedError(originalError, context = {}) {
        const baseError = this._extractBaseErrorInfo(originalError);
        return {
            ...baseError,
            category: this._categorizeError(baseError),
            context,
            timestamp: new Date().toISOString(),
            handled: false,
            recoverable: this._isRecoverableError(baseError),
            severity: this._determineSeverity(baseError, context)
        };
    }

    wrapError(originalError, additionalContext = {}) {
        if (!originalError) {
            return this.createUnknownError('No error provided', {}, additionalContext);
        }
        const enhanced = this.createEnhancedError(originalError, additionalContext);
        const wrapped = new Error(enhanced.message);
        wrapped.code = enhanced.code;
        wrapped.details = enhanced.details || {};
        wrapped.context = enhanced.context;
        wrapped.category = enhanced.category;
        wrapped.severity = enhanced.severity;
        wrapped.recoverable = enhanced.recoverable;
        wrapped.originalError = originalError;
        wrapped.timestamp = enhanced.timestamp;
        return wrapped;
    }

    createFromString(errorString, context = {}) {
        if (!errorString || typeof errorString !== 'string') {
            return this.createInvalidInputError(
                'Invalid error string provided', errorString, 'string', context
            );
        }
        const lower = errorString.toLowerCase();
        if (lower.includes('permission') || lower.includes('access')) {
            return this.createPermissionError(errorString, null, context);
        }
        if (lower.includes('not found') || lower.includes('missing')) {
            return this.createNotFoundError(errorString, null, context);
        }
        if (lower.includes('network') || lower.includes('timeout')) {
            return this.createNetworkError(errorString, null, null, context);
        }
        if (lower.includes('validation') || lower.includes('invalid')) {
            return this.createValidationError(errorString, null, null, context);
        }
        return this.createStandardError(
            this.config.errorCodes.STRING_ERROR, errorString,
            { originalString: errorString, type: 'string_error' }, context
        );
    }

    createContextualError(operation, originalError, operationContext = {}) {
        const context = { operation, ...operationContext, timestamp: new Date().toISOString() };
        if (originalError instanceof Error) return this.wrapError(originalError, context);
        if (typeof originalError === 'string') return this.createFromString(originalError, context);
        return this.createOperationFailedError(
            operation, 'Unknown error occurred', { originalError }, context
        );
    }

    createBatch(errorSpecs, sharedContext = {}) {
        return errorSpecs.map(spec => {
            const { code, message, details = {}, context = {} } = spec;
            return this.createStandardError(code, message, details, { ...sharedContext, ...context });
        });
    }

    // ── Categorization & Classification ─────────────────

    _extractBaseErrorInfo(error) {
        if (!error) {
            return { code: this.config.errorCodes.INVALID_INPUT, message: 'Unknown error occurred', type: 'unknown' };
        }
        if (error instanceof Error) {
            return { code: error.code || 'UNKNOWN_ERROR', message: error.message, type: error.constructor.name, stack: error.stack, path: error.path, errno: error.errno };
        }
        if (typeof error === 'object') {
            return { code: error.code || 'UNKNOWN_ERROR', message: error.message || 'Unknown error occurred', type: error.type || 'object', ...error };
        }
        return { code: 'STRING_ERROR', message: String(error), type: 'string' };
    }

    _categorizeError(errorInfo) {
        const code = errorInfo.code;
        if (['EACCES', 'EPERM', 'ENOENT'].includes(code)) return this.config.errorCategories.PERMISSION;
        if (['ENOTFOUND', 'TIMEOUT', 'ECONNREFUSED'].includes(code)) return this.config.errorCategories.NETWORK;
        if (['VALIDATION_ERROR', 'INVALID_INPUT'].includes(code)) return this.config.errorCategories.VALIDATION;
        if (['NOT_FOUND', 'VERSION_MISMATCH'].includes(code)) return this.config.errorCategories.DEPENDENCY;
        return this.config.errorCategories.SYSTEM;
    }

    _isRecoverableError(errorInfo) {
        return ['EACCES', 'EPERM', 'NOT_FOUND', 'VERSION_MISMATCH', 'TIMEOUT', 'VALIDATION_ERROR'].includes(errorInfo.code);
    }

    _determineSeverity(errorInfo, context) {
        if (['SYSTEM_FAILURE', 'CORRUPTION'].includes(errorInfo.code)) return 'critical';
        if (context.scope === 'system' || ['EPERM', 'EACCES'].includes(errorInfo.code)) return 'high';
        if (['NOT_FOUND', 'VERSION_MISMATCH', 'VALIDATION_ERROR'].includes(errorInfo.code)) return 'medium';
        return 'low';
    }

    // ── Recovery Suggestions ────────────────────────────

    generateRecoverySuggestions(enhancedError) {
        const template = this.config.recoverySuggestionTemplates[enhancedError.category] ||
                         this.config.recoverySuggestionTemplates.validation;
        const suggestions = {
            immediate: [...template.immediate],
            alternative: [...template.alternative],
            troubleshooting: [...template.troubleshooting]
        };
        if (enhancedError.path) {
            suggestions.immediate.push(`Check permissions for path: ${enhancedError.path}`);
        }
        if (enhancedError.context?.operation) {
            suggestions.alternative.push(`Retry ${enhancedError.context.operation} with different parameters`);
        }
        if (enhancedError.context?.dependency) {
            suggestions.immediate.push(`Install dependency: ${enhancedError.context.dependency}`);
        }
        if (enhancedError.context?.command) {
            suggestions.troubleshooting.push(`Debug command: ${enhancedError.context.command}`);
        }
        return suggestions;
    }

    // ── Display & Matching ──────────────────────────────

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

    formatErrorForDisplay(enhancedError, options = {}) {
        const { includeCode = true, includeContext = true, includeStack = false, maxLength = 200 } = options;
        let message = enhancedError.message;
        if (includeCode && enhancedError.code) message = `[${enhancedError.code}] ${message}`;
        if (includeContext && enhancedError.context?.operation) message = `${message} (during ${enhancedError.context.operation})`;
        if (includeStack && enhancedError.stack) message += `\n\nStack trace:\n${enhancedError.stack}`;
        if (message.length > maxLength) message = message.substring(0, maxLength - 3) + '...';
        return message;
    }

    matchesErrorCriteria(enhancedError, criteria) {
        const { code, category, severity, recoverable, contextOperation } = criteria;
        if (code && enhancedError.code !== code) return false;
        if (category && enhancedError.category !== category) return false;
        if (severity && enhancedError.severity !== severity) return false;
        if (recoverable !== undefined && enhancedError.recoverable !== recoverable) return false;
        if (contextOperation && enhancedError.context?.operation !== contextOperation) return false;
        return true;
    }

    logError(enhancedError, context = {}) {
        const logLevel = this._getLogLevel(enhancedError.severity);
        const logMessage = this.formatErrorForDisplay(enhancedError, { includeCode: true, includeContext: true });
        console[logLevel](`[${enhancedError.category}] ${logMessage}`);
        if (context.attempt) console.warn(`  Attempt ${context.attempt}/${context.maxAttempts || 'unknown'}`);
        if (context.operationId) console.debug(`  Operation ID: ${context.operationId}`);
    }

    _getLogLevel(severity) {
        if (severity === 'critical' || severity === 'high') return 'error';
        if (severity === 'medium') return 'warn';
        if (severity === 'low') return 'info';
        return 'log';
    }

    // ── Singleton ───────────────────────────────────────

    static getInstance() {
        if (!ErrorManager._instance) {
            ErrorManager._instance = new ErrorManager();
        }
        return ErrorManager._instance;
    }
}

module.exports = ErrorManager;
