/**
 * Error Recovery System
 * 
 * Comprehensive error recovery and retry mechanism for resilient operation handling.
 * Provides automated error recovery strategies and context-aware retry logic.
 * 
 * Features:
 * - Intelligent retry strategies with backoff
 * - Context-aware recovery actions
 * - Fallback mechanism support
 * - Recovery metrics and monitoring
 * - Integration with error handling workflow
 */

const ErrorHandlerUtils = require('./error-handler-utils');
const ErrorFactory = require('./error-factory');

class ErrorRecoverySystem {
    constructor() {
        this.errorHandler = new ErrorHandlerUtils();
        this.errorFactory = new ErrorFactory();
        
        this.config = {
            defaultRetryConfig: {
                maxAttempts: 3,
                baseDelay: 1000,
                maxDelay: 30000,
                backoffMultiplier: 2,
                jitter: true
            },
            recoveryStrategies: this._initializeRecoveryStrategies(),
            recoverableErrorCodes: new Set([
                'EACCES', 'EPERM', 'ENOENT', 'TIMEOUT', 'ECONNREFUSED', 
                'NOT_FOUND', 'VERSION_MISMATCH', 'VALIDATION_ERROR'
            ])
        };
        
        this.metrics = {
            attempts: new Map(),
            successes: new Map(),
            failures: new Map(),
            recoveries: new Map()
        };
    }
    
    /**
     * Initialize recovery strategies
     * @returns {Object} Recovery strategies by error category
     * @private
     */
    _initializeRecoveryStrategies() {
        return {
            permission: {
                strategies: [
                    'check_permissions',
                    'attempt_elevation',
                    'try_alternative_location',
                    'request_manual_intervention'
                ],
                autoRecoverable: true,
                estimatedTime: 30000, // 30 seconds
                priority: 'high'
            },
            
            dependency: {
                strategies: [
                    'check_package_manager',
                    'update_package_lists',
                    'install_missing_dependency',
                    'try_alternative_package_manager',
                    'manual_installation_guide'
                ],
                autoRecoverable: true,
                estimatedTime: 120000, // 2 minutes
                priority: 'high'
            },
            
            network: {
                strategies: [
                    'check_connectivity',
                    'retry_with_backoff',
                    'try_alternative_endpoint',
                    'use_cached_data',
                    'offline_mode'
                ],
                autoRecoverable: true,
                estimatedTime: 60000, // 1 minute
                priority: 'medium'
            },
            
            validation: {
                strategies: [
                    'analyze_validation_failure',
                    'apply_automatic_fixes',
                    'use_default_values',
                    'request_user_correction',
                    'skip_validation'
                ],
                autoRecoverable: true,
                estimatedTime: 15000, // 15 seconds
                priority: 'medium'
            },
            
            system: {
                strategies: [
                    'check_system_resources',
                    'cleanup_temporary_files',
                    'restart_services',
                    'escalate_to_administrator'
                ],
                autoRecoverable: false,
                estimatedTime: 300000, // 5 minutes
                priority: 'critical'
            }
        };
    }
    
    /**
     * Wrap function with comprehensive error recovery
     * @param {Function} fn - Function to wrap
     * @param {Object} options - Recovery options
     * @returns {Function} Wrapped function with recovery
     */
    wrapWithRecovery(fn, options = {}) {
        const {
            retryConfig = this.config.defaultRetryConfig,
            context = {},
            fallbacks = [],
            enableAutoRecovery = true,
            recordMetrics = true
        } = options;
        
        return async (...args) => {
            const operationId = this._generateOperationId();
            const startTime = Date.now();
            
            if (recordMetrics) {
                this._recordAttempt(operationId, context);
            }
            
            let lastError = null;
            let recoveryAttempted = false;
            
            for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
                try {
                    const result = await fn(...args);
                    
                    if (recordMetrics) {
                        this._recordSuccess(operationId, attempt, Date.now() - startTime);
                    }
                    
                    return result;
                    
                } catch (error) {
                    lastError = error;
                    const enhancedError = this.errorHandler.createEnhancedError(error, {
                        ...context,
                        attempt,
                        operationId
                    });
                    
                    // Log the error
                    this.errorHandler.logError(enhancedError, {
                        attempt,
                        maxAttempts: retryConfig.maxAttempts,
                        operationId
                    });
                    
                    // Check if error is recoverable
                    if (!this._isRecoverable(enhancedError)) {
                        break;
                    }
                    
                    // Attempt automatic recovery if enabled and not already attempted
                    if (enableAutoRecovery && !recoveryAttempted && this._shouldAttemptRecovery(enhancedError)) {
                        const recoveryResult = await this.attemptRecovery(enhancedError, context);
                        recoveryAttempted = true;
                        
                        if (recoveryResult.success) {
                            // Retry immediately after successful recovery
                            continue;
                        }
                    }
                    
                    // Don't retry if this is the last attempt
                    if (attempt === retryConfig.maxAttempts) {
                        break;
                    }
                    
                    // Calculate delay with backoff and jitter
                    const delay = this._calculateDelay(attempt, retryConfig);
                    await this._sleep(delay);
                }
            }
            
            // Try fallback functions
            for (const fallback of fallbacks) {
                try {
                    const fallbackResult = await fallback(lastError, ...args);
                    
                    if (recordMetrics) {
                        this._recordSuccess(operationId, 'fallback', Date.now() - startTime);
                    }
                    
                    return fallbackResult;
                    
                } catch (fallbackError) {
                    this.errorHandler.logError(
                        this.errorHandler.createEnhancedError(fallbackError, {
                            ...context,
                            fallback: true,
                            operationId
                        })
                    );
                }
            }
            
            // Record final failure
            if (recordMetrics) {
                this._recordFailure(operationId, lastError, Date.now() - startTime);
            }
            
            throw lastError;
        };
    }
    
    /**
     * Attempt automatic error recovery
     * @param {Object} enhancedError - Enhanced error object
     * @param {Object} context - Recovery context
     * @returns {Promise<Object>} Recovery result
     */
    async attemptRecovery(enhancedError, context = {}) {
        const strategy = this._getRecoveryStrategy(enhancedError);
        if (!strategy) {
            return { success: false, reason: 'No recovery strategy available' };
        }
        
        const recoveryId = this._generateRecoveryId();
        const startTime = Date.now();
        
        try {
            const result = await this._executeRecoveryStrategy(enhancedError, strategy, {
                ...context,
                recoveryId
            });
            
            this._recordRecovery(recoveryId, enhancedError, result, Date.now() - startTime);
            
            return result;
            
        } catch (recoveryError) {
            const failureResult = {
                success: false,
                error: recoveryError,
                reason: 'Recovery strategy failed'
            };
            
            this._recordRecovery(recoveryId, enhancedError, failureResult, Date.now() - startTime);
            
            return failureResult;
        }
    }
    
    /**
     * Execute specific recovery strategy
     * @param {Object} enhancedError - Enhanced error object
     * @param {Object} strategy - Recovery strategy
     * @param {Object} context - Recovery context
     * @returns {Promise<Object>} Strategy execution result
     * @private
     */
    async _executeRecoveryStrategy(enhancedError, strategy, context) {
        const result = {
            success: false,
            actions: [],
            duration: 0,
            strategy: strategy
        };
        
        const startTime = Date.now();
        
        for (const strategyStep of strategy.strategies) {
            const stepResult = await this._executeRecoveryStep(strategyStep, enhancedError, context);
            
            result.actions.push({
                step: strategyStep,
                result: stepResult,
                timestamp: new Date().toISOString()
            });
            
            // If step succeeds, we can potentially stop
            if (stepResult.success && stepResult.recoveryComplete) {
                result.success = true;
                break;
            }
            
            // If step indicates fatal failure, stop recovery
            if (stepResult.fatal) {
                result.reason = stepResult.reason || 'Fatal error during recovery';
                break;
            }
        }
        
        result.duration = Date.now() - startTime;
        
        return result;
    }
    
    /**
     * Execute individual recovery step
     * @param {string} step - Recovery step name
     * @param {Object} enhancedError - Enhanced error object
     * @param {Object} context - Recovery context
     * @returns {Promise<Object>} Step execution result
     * @private
     */
    async _executeRecoveryStep(step, enhancedError, context) {
        const stepResult = {
            success: false,
            recoveryComplete: false,
            fatal: false,
            details: {},
            reason: null
        };
        
        try {
            switch (step) {
                case 'check_permissions':
                    stepResult.success = await this._checkPermissions(enhancedError.path);
                    stepResult.details.permissions = 'checked';
                    break;
                    
                case 'attempt_elevation':
                    stepResult.success = await this._attemptElevation(context);
                    stepResult.details.elevation = 'attempted';
                    break;
                    
                case 'check_connectivity':
                    stepResult.success = await this._checkNetworkConnectivity();
                    stepResult.details.connectivity = 'checked';
                    break;
                    
                case 'retry_with_backoff':
                    // This is handled by the main retry logic
                    stepResult.success = true;
                    stepResult.details.backoff = 'applied';
                    break;
                    
                case 'check_package_manager':
                    stepResult.success = await this._checkPackageManager();
                    stepResult.details.packageManager = 'checked';
                    break;
                    
                case 'analyze_validation_failure':
                    stepResult.success = await this._analyzeValidationFailure(enhancedError);
                    stepResult.details.analysis = 'completed';
                    break;
                    
                case 'use_default_values':
                    stepResult.success = true;
                    stepResult.recoveryComplete = true;
                    stepResult.details.defaults = 'applied';
                    break;
                    
                default:
                    stepResult.success = false;
                    stepResult.reason = `Unknown recovery step: ${step}`;
            }
            
        } catch (stepError) {
            stepResult.success = false;
            stepResult.fatal = this._isStepFatal(stepError);
            stepResult.reason = stepError.message;
        }
        
        return stepResult;
    }
    
    /**
     * Check if error is recoverable
     * @param {Object} enhancedError - Enhanced error object
     * @returns {boolean} True if recoverable
     * @private
     */
    _isRecoverable(enhancedError) {
        return this.config.recoverableErrorCodes.has(enhancedError.code) || 
               enhancedError.recoverable === true;
    }
    
    /**
     * Check if automatic recovery should be attempted
     * @param {Object} enhancedError - Enhanced error object
     * @returns {boolean} True if recovery should be attempted
     * @private
     */
    _shouldAttemptRecovery(enhancedError) {
        const strategy = this._getRecoveryStrategy(enhancedError);
        return strategy && strategy.autoRecoverable;
    }
    
    /**
     * Get recovery strategy for error
     * @param {Object} enhancedError - Enhanced error object
     * @returns {Object|null} Recovery strategy or null
     * @private
     */
    _getRecoveryStrategy(enhancedError) {
        return this.config.recoveryStrategies[enhancedError.category] || null;
    }
    
    /**
     * Calculate retry delay with backoff and jitter
     * @param {number} attempt - Current attempt number
     * @param {Object} retryConfig - Retry configuration
     * @returns {number} Delay in milliseconds
     * @private
     */
    _calculateDelay(attempt, retryConfig) {
        let delay = retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1);
        
        // Apply maximum delay limit
        delay = Math.min(delay, retryConfig.maxDelay);
        
        // Add jitter if enabled
        if (retryConfig.jitter) {
            delay = delay * (0.5 + Math.random() * 0.5);
        }
        
        return Math.floor(delay);
    }
    
    /**
     * Sleep for specified duration
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise} Sleep promise
     * @private
     */
    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Simple recovery step implementations (would be more sophisticated in practice)
     */
    async _checkPermissions(path) {
        // Simplified permission check
        return true;
    }
    
    async _attemptElevation(context) {
        // Simplified elevation attempt
        return false; // Cannot actually elevate in this context
    }
    
    async _checkNetworkConnectivity() {
        // Simplified network check
        return true;
    }
    
    async _checkPackageManager() {
        // Simplified package manager check
        return true;
    }
    
    async _analyzeValidationFailure(enhancedError) {
        // Simplified validation analysis
        return true;
    }
    
    /**
     * Check if step error is fatal
     * @param {Error} error - Step error
     * @returns {boolean} True if fatal
     * @private
     */
    _isStepFatal(error) {
        const fatalCodes = ['SYSTEM_FAILURE', 'CORRUPTION'];
        return fatalCodes.includes(error.code);
    }
    
    /**
     * Metrics and monitoring methods
     */
    _generateOperationId() {
        return `op_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    
    _generateRecoveryId() {
        return `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    
    _recordAttempt(operationId, context) {
        this.metrics.attempts.set(operationId, {
            timestamp: new Date().toISOString(),
            context
        });
    }
    
    _recordSuccess(operationId, attempt, duration) {
        this.metrics.successes.set(operationId, {
            attempt,
            duration,
            timestamp: new Date().toISOString()
        });
    }
    
    _recordFailure(operationId, error, duration) {
        this.metrics.failures.set(operationId, {
            error: error.code || error.message,
            duration,
            timestamp: new Date().toISOString()
        });
    }
    
    _recordRecovery(recoveryId, error, result, duration) {
        this.metrics.recoveries.set(recoveryId, {
            errorCode: error.code,
            success: result.success,
            duration,
            timestamp: new Date().toISOString()
        });
    }
    
    /**
     * Get recovery system metrics
     * @returns {Object} System metrics
     */
    getMetrics() {
        return {
            attempts: this.metrics.attempts.size,
            successes: this.metrics.successes.size,
            failures: this.metrics.failures.size,
            recoveries: this.metrics.recoveries.size,
            successRate: this.metrics.successes.size / Math.max(this.metrics.attempts.size, 1),
            recoveryRate: Array.from(this.metrics.recoveries.values())
                .filter(r => r.success).length / Math.max(this.metrics.recoveries.size, 1)
        };
    }
    
    /**
     * Clear metrics (useful for testing)
     */
    clearMetrics() {
        this.metrics.attempts.clear();
        this.metrics.successes.clear();
        this.metrics.failures.clear();
        this.metrics.recoveries.clear();
    }
    
    /**
     * Get singleton instance
     * @returns {ErrorRecoverySystem} Recovery system instance
     */
    static getInstance() {
        if (!ErrorRecoverySystem._instance) {
            ErrorRecoverySystem._instance = new ErrorRecoverySystem();
        }
        return ErrorRecoverySystem._instance;
    }
}

module.exports = ErrorRecoverySystem;