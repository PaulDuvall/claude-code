/**
 * Base Command Pattern
 * Abstract base class for all CLI commands with standardized error handling
 */

const ClaudePathConfig = require('../utils/claude-path-config');
const FileSystemUtils = require('../utils/file-system-utils');
const LoggerService = require('../services/logger-service');

class BaseCommand {
    constructor(config = null, logger = null) {
        this.config = config || new ClaudePathConfig();
        this.logger = logger || new LoggerService();
        this.startTime = null;
        this.metrics = {
            filesProcessed: 0,
            operationsPerformed: 0,
            errorsEncountered: 0
        };
        
        // Set logger context for this command
        this.logger.setContext({ 
            command: this.constructor.name,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Main execution method with standardized error handling
     */
    async execute(options = {}) {
        this.startTime = Date.now();
        
        try {
            // Pre-execution validation
            const preValidation = await this.preValidate(options);
            if (!preValidation.success) {
                return this.createFailureResult(preValidation.error, preValidation);
            }

            // Execute the main command logic
            const result = await this.run(options);
            
            // Post-execution cleanup
            await this.postExecute(result, options);
            
            return this.createSuccessResult(result);

        } catch (error) {
            this.metrics.errorsEncountered++;
            return this.handleError(error, options);
        }
    }

    /**
     * Abstract method - must be implemented by subclasses
     */
    async run(options) {
        throw new Error('Subclasses must implement the run() method');
    }

    /**
     * Pre-execution validation hook
     */
    async preValidate(options) {
        // Default validation - can be overridden
        return { success: true };
    }

    /**
     * Post-execution cleanup hook
     */
    async postExecute(result, options) {
        // Default post-execution - can be overridden
        const duration = this.getDuration();
        
        if (process.env.NODE_ENV === 'development' || options.verbose) {
            console.log(`\n📊 Command completed in ${duration}s`);
            if (this.metrics.filesProcessed > 0) {
                console.log(`   Files processed: ${this.metrics.filesProcessed}`);
            }
            if (this.metrics.operationsPerformed > 0) {
                console.log(`   Operations: ${this.metrics.operationsPerformed}`);
            }
        }
    }

    /**
     * Standardized error handling
     */
    handleError(error, options = {}) {
        const errorDetails = this.analyzeError(error);
        
        // Log error appropriately
        if (options.verbose || process.env.NODE_ENV === 'development') {
            console.error(`💥 ${this.constructor.name} Error Details:`, error);
        } else {
            console.error(`❌ ${errorDetails.message}`);
        }

        // Provide helpful guidance
        if (errorDetails.suggestions.length > 0) {
            console.log('\n💡 Suggestions:');
            errorDetails.suggestions.forEach(suggestion => {
                console.log(`   • ${suggestion}`);
            });
        }

        return this.createFailureResult(errorDetails.message, {
            type: errorDetails.type,
            suggestions: errorDetails.suggestions,
            originalError: options.verbose ? error : undefined
        });
    }

    /**
     * Analyze error type and generate helpful suggestions
     */
    analyzeError(error) {
        const message = error.message || 'Unknown error occurred';
        const suggestions = [];
        let type = 'general';

        // File system errors
        if (message.includes('ENOENT') || message.includes('no such file')) {
            type = 'file_not_found';
            suggestions.push('Check that the file or directory exists');
            suggestions.push('Verify you have the correct path');
        } else if (message.includes('EACCES') || message.includes('permission denied')) {
            type = 'permission_error';
            suggestions.push('Check file/directory permissions');
            suggestions.push('Try running with appropriate permissions');
        } else if (message.includes('ENOTDIR') || message.includes('not a directory')) {
            type = 'path_error';
            suggestions.push('Verify the path is correct');
            suggestions.push('Check that parent directories exist');
        }
        // Network errors
        else if (message.includes('ECONNREFUSED') || message.includes('network')) {
            type = 'network_error';
            suggestions.push('Check your internet connection');
            suggestions.push('Verify proxy settings if applicable');
        }
        // Git errors
        else if (message.includes('git') || message.includes('Not a git repository')) {
            type = 'git_error';
            suggestions.push('Ensure you are in a git repository');
            suggestions.push('Run "git init" if needed');
        }
        // Claude Code errors
        else if (message.includes('claude') || message.includes('settings')) {
            type = 'claude_error';
            suggestions.push('Run "claude-commands verify" to check installation');
            suggestions.push('Try "claude-commands setup" to reconfigure');
        }

        return {
            message: this.sanitizeErrorMessage(message),
            type,
            suggestions
        };
    }

    /**
     * Sanitize error messages for user consumption
     */
    sanitizeErrorMessage(message) {
        // Remove internal paths and stack traces
        return message
            .replace(/\/Users\/[^\/]+\/[^\s]+/g, '~/<path>')
            .replace(/\s+at\s+.*/g, '')
            .replace(/Error:\s*/g, '')
            .trim();
    }

    /**
     * Create standardized success result
     */
    createSuccessResult(data = {}) {
        return {
            success: true,
            duration: this.getDuration(),
            metrics: { ...this.metrics },
            timestamp: new Date().toISOString(),
            ...data
        };
    }

    /**
     * Create standardized failure result
     */
    createFailureResult(message, data = {}) {
        return {
            success: false,
            error: message,
            duration: this.getDuration(),
            metrics: { ...this.metrics },
            timestamp: new Date().toISOString(),
            ...data
        };
    }

    /**
     * Get execution duration in seconds
     */
    getDuration() {
        if (!this.startTime) return 0;
        return ((Date.now() - this.startTime) / 1000).toFixed(2);
    }

    /**
     * Helper method to ensure directories exist
     */
    ensureDirectoryExists(dirPath) {
        FileSystemUtils.ensureDirectory(dirPath);
        this.metrics.operationsPerformed++;
    }

    /**
     * Helper method to safely read files
     */
    safeReadFile(filePath) {
        const content = FileSystemUtils.readFile(filePath);
        if (content !== null) {
            this.metrics.filesProcessed++;
        }
        return content;
    }

    /**
     * Helper method to safely write files
     */
    safeWriteFile(filePath, content, mode = 0o644) {
        const success = FileSystemUtils.writeFile(filePath, content, mode);
        if (success) {
            this.metrics.filesProcessed++;
            this.metrics.operationsPerformed++;
        }
        return success;
    }

    /**
     * Display progress if verbose mode enabled
     */
    showProgress(message, options = {}) {
        if (options.verbose || process.env.NODE_ENV === 'development') {
            console.log(`🔄 ${message}`);
        }
    }
}

module.exports = BaseCommand;