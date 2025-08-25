/**
 * Centralized Logger Service
 * Provides consistent logging across the entire application with context support
 */

class LoggerService {
    constructor(options = {}) {
        this.options = {
            timestamp: options.timestamp ?? true,
            context: options.context ?? true,
            colors: options.colors ?? true,
            level: options.level ?? 'info' // debug, info, warn, error
        };
        this.contextData = {};
    }

    /**
     * Set persistent context data for all log messages
     */
    setContext(context) {
        this.contextData = { ...this.contextData, ...context };
    }

    /**
     * Clear all context data
     */
    clearContext() {
        this.contextData = {};
    }

    /**
     * Success message logging
     */
    success(message, context = {}) {
        this._log('success', '✅', message, context);
    }

    /**
     * Information message logging
     */
    info(message, context = {}) {
        this._log('info', 'ℹ️', message, context);
    }

    /**
     * Warning message logging
     */
    warn(message, context = {}) {
        this._log('warn', '⚠️', message, context);
    }

    /**
     * Error message logging
     */
    error(message, error = null, context = {}) {
        const errorContext = error ? { error: this._serializeError(error), ...context } : context;
        this._log('error', '❌', message, errorContext);
    }

    /**
     * Debug message logging
     */
    debug(message, context = {}) {
        if (this.options.level === 'debug') {
            this._log('debug', '🔍', message, context);
        }
    }

    /**
     * Step progress logging
     */
    step(message, context = {}) {
        this._log('step', '🔄', message, context);
    }

    /**
     * Completion logging
     */
    complete(message, context = {}) {
        this._log('complete', '🎉', message, context);
    }

    /**
     * Progress logging with metrics
     */
    progress(message, current, total, context = {}) {
        const progressContext = { current, total, percentage: Math.round((current / total) * 100), ...context };
        this._log('progress', '📊', message, progressContext);
    }

    /**
     * Internal logging method
     */
    _log(level, icon, message, context = {}) {
        const timestamp = this.options.timestamp ? `[${new Date().toISOString()}]` : '';
        const fullContext = { ...this.contextData, ...context };
        
        let logMessage = `${timestamp} ${icon} ${message}`;
        
        // Add context if enabled and present
        if (this.options.context && Object.keys(fullContext).length > 0) {
            const contextStr = this._formatContext(fullContext);
            if (contextStr) {
                logMessage += ` ${contextStr}`;
            }
        }

        // Route to appropriate console method
        switch (level) {
            case 'error':
                console.error(logMessage);
                break;
            case 'warn':
                console.warn(logMessage);
                break;
            case 'debug':
                console.debug(logMessage);
                break;
            default:
                console.log(logMessage);
        }
    }

    /**
     * Format context data for display
     */
    _formatContext(context) {
        try {
            // Filter out complex objects and functions
            const filteredContext = {};
            for (const [key, value] of Object.entries(context)) {
                if (value !== null && value !== undefined) {
                    if (typeof value === 'object' && !Array.isArray(value)) {
                        // Include only simple object properties
                        if (Object.keys(value).length < 5) {
                            filteredContext[key] = value;
                        } else {
                            filteredContext[key] = `[Object with ${Object.keys(value).length} keys]`;
                        }
                    } else if (typeof value !== 'function') {
                        filteredContext[key] = value;
                    }
                }
            }

            if (Object.keys(filteredContext).length === 0) {
                return '';
            }

            return JSON.stringify(filteredContext);
        } catch (error) {
            return `[Context formatting error: ${error.message}]`;
        }
    }

    /**
     * Serialize error objects for logging
     */
    _serializeError(error) {
        if (!error) return null;
        
        return {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack?.split('\n').slice(0, 3).join('\n') // First 3 lines of stack
        };
    }

    /**
     * Create a scoped logger with persistent context
     */
    scope(scopeName, context = {}) {
        const scopedLogger = new LoggerService(this.options);
        scopedLogger.setContext({ scope: scopeName, ...this.contextData, ...context });
        return scopedLogger;
    }

    /**
     * Performance timing utilities
     */
    time(label) {
        console.time(`⏱️  ${label}`);
    }

    timeEnd(label) {
        console.timeEnd(`⏱️  ${label}`);
    }

    /**
     * Table logging for structured data
     */
    table(data, message = '') {
        if (message) {
            this.info(message);
        }
        console.table(data);
    }
}

module.exports = LoggerService;