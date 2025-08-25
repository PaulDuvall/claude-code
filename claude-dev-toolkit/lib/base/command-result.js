/**
 * Command Result Value Object
 * Standardized result structure for all command operations
 */

class CommandResult {
    constructor(success, data = {}) {
        this.success = success;
        this.timestamp = new Date().toISOString();
        
        // Merge provided data
        Object.assign(this, data);
    }

    /**
     * Create successful result
     */
    static success(data = {}) {
        return new CommandResult(true, data);
    }

    /**
     * Create failure result
     */
    static failure(error, data = {}) {
        return new CommandResult(false, {
            error: typeof error === 'string' ? error : error.message,
            originalError: typeof error === 'object' ? error : undefined,
            ...data
        });
    }

    /**
     * Create result from boolean
     */
    static fromBoolean(isSuccess, successData = {}, failureData = {}) {
        return isSuccess 
            ? CommandResult.success(successData)
            : CommandResult.failure('Operation failed', failureData);
    }

    /**
     * Check if result indicates success
     */
    isSuccess() {
        return this.success === true;
    }

    /**
     * Check if result indicates failure
     */
    isFailure() {
        return this.success === false;
    }

    /**
     * Get error message if failure
     */
    getError() {
        return this.success ? null : (this.error || 'Unknown error');
    }

    /**
     * Get data payload
     */
    getData(key = null) {
        if (key) {
            return this[key];
        }
        
        // Return all data except control properties
        const { success, timestamp, error, originalError, ...data } = this;
        return data;
    }

    /**
     * Transform result with a function
     */
    map(transform) {
        if (this.isFailure()) {
            return this; // Return unchanged failure
        }
        
        try {
            const transformedData = transform(this.getData());
            return CommandResult.success(transformedData);
        } catch (error) {
            return CommandResult.failure(error);
        }
    }

    /**
     * Chain operations that might fail
     */
    flatMap(operation) {
        if (this.isFailure()) {
            return this; // Return unchanged failure
        }
        
        try {
            const result = operation(this.getData());
            return result instanceof CommandResult ? result : CommandResult.success(result);
        } catch (error) {
            return CommandResult.failure(error);
        }
    }

    /**
     * Provide fallback value for failures
     */
    orElse(fallback) {
        return this.isSuccess() ? this.getData() : fallback;
    }

    /**
     * Convert to JSON for serialization
     */
    toJSON() {
        return {
            success: this.success,
            timestamp: this.timestamp,
            ...(this.success ? this.getData() : { error: this.getError() })
        };
    }

    /**
     * Convert to human-readable string
     */
    toString() {
        if (this.success) {
            const data = this.getData();
            const keys = Object.keys(data);
            
            if (keys.length === 0) {
                return '✅ Success';
            } else if (keys.length === 1) {
                return `✅ Success: ${keys[0]} = ${data[keys[0]]}`;
            } else {
                return `✅ Success (${keys.length} properties)`;
            }
        } else {
            return `❌ Failure: ${this.getError()}`;
        }
    }

    /**
     * Merge with another result (for combining operations)
     */
    merge(otherResult) {
        if (this.isFailure()) return this;
        if (otherResult.isFailure()) return otherResult;
        
        return CommandResult.success({
            ...this.getData(),
            ...otherResult.getData()
        });
    }

    /**
     * Add metrics to the result
     */
    withMetrics(metrics) {
        this.metrics = metrics;
        return this;
    }

    /**
     * Add duration to the result
     */
    withDuration(duration) {
        this.duration = typeof duration === 'number' ? `${duration.toFixed(2)}s` : duration;
        return this;
    }

    /**
     * Add context information
     */
    withContext(context) {
        this.context = context;
        return this;
    }
}

module.exports = CommandResult;