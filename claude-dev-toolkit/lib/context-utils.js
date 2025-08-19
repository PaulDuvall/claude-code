/**
 * Context Utilities
 * 
 * Shared context creation patterns to eliminate duplication and provide
 * consistent context objects across the application.
 * 
 * Features:
 * - Standardized context object creation
 * - Context validation and enhancement
 * - Operation context tracking
 * - Context-aware processing patterns
 */

class ContextUtils {
    constructor() {
        this.config = {
            contextTypes: {
                VALIDATION: 'validation',
                OPERATION: 'operation',
                ERROR_HANDLING: 'error_handling',
                INSTALLATION: 'installation',
                SYSTEM: 'system'
            },
            operationTypes: {
                COMMAND_INSTALLATION: 'command_installation',
                DEPENDENCY_CHECK: 'dependency_check',
                PERMISSION_CHECK: 'permission_check',
                SYSTEM_VALIDATION: 'system_validation',
                CONFIGURATION: 'configuration'
            }
        };
    }
    
    /**
     * Create base context object with common properties
     * @param {string} type - Context type
     * @param {Object} data - Context data
     * @param {Object} options - Additional options
     * @returns {Object} Base context object
     */
    createBaseContext(type, data = {}, options = {}) {
        return {
            type,
            timestamp: new Date().toISOString(),
            id: this._generateContextId(),
            data,
            metadata: {
                version: '1.0.0',
                source: 'context-utils',
                ...options.metadata
            },
            ...options
        };
    }
    
    /**
     * Create operation context for tracking operations
     * @param {string} operation - Operation name
     * @param {Object} parameters - Operation parameters
     * @param {Object} environment - Environment information
     * @returns {Object} Operation context
     */
    createOperationContext(operation, parameters = {}, environment = {}) {
        return this.createBaseContext(this.config.contextTypes.OPERATION, {
            operation,
            parameters,
            environment: {
                platform: process.platform,
                nodeVersion: process.version,
                workingDirectory: process.cwd(),
                ...environment
            },
            status: 'initialized',
            startTime: new Date().toISOString(),
            progress: {
                current: 0,
                total: 1,
                steps: []
            }
        });\n    }\n    \n    /**\n     * Create validation context for input validation\n     * @param {*} input - Input to validate\n     * @param {Object} rules - Validation rules\n     * @param {Object} options - Validation options\n     * @returns {Object} Validation context\n     */\n    createValidationContext(input, rules = {}, options = {}) {\n        return this.createBaseContext(this.config.contextTypes.VALIDATION, {\n            input,\n            rules,\n            options: {\n                strict: false,\n                allowEmpty: false,\n                transformInput: false,\n                ...options\n            },\n            results: {\n                valid: null,\n                errors: [],\n                warnings: [],\n                transformed: null\n            }\n        });\n    }\n    \n    /**\n     * Create error handling context\n     * @param {Error} error - Error to handle\n     * @param {Object} operation - Operation context where error occurred\n     * @param {Object} recovery - Recovery options\n     * @returns {Object} Error handling context\n     */\n    createErrorHandlingContext(error, operation = {}, recovery = {}) {\n        return this.createBaseContext(this.config.contextTypes.ERROR_HANDLING, {\n            error: {\n                original: error,\n                code: error?.code,\n                message: error?.message,\n                type: error?.constructor?.name,\n                stack: error?.stack\n            },\n            operation,\n            recovery: {\n                attempted: false,\n                strategies: [],\n                successful: false,\n                ...recovery\n            },\n            handling: {\n                strategy: null,\n                handled: false,\n                escalated: false\n            }\n        });\n    }\n    \n    /**\n     * Create installation context for tracking installations\n     * @param {string} target - Installation target (command, dependency, etc.)\n     * @param {Object} configuration - Installation configuration\n     * @param {Object} environment - Environment details\n     * @returns {Object} Installation context\n     */\n    createInstallationContext(target, configuration = {}, environment = {}) {\n        return this.createBaseContext(this.config.contextTypes.INSTALLATION, {\n            target,\n            configuration,\n            environment: {\n                platform: process.platform,\n                arch: process.arch,\n                userHome: require('os').homedir(),\n                ...environment\n            },\n            installation: {\n                phase: 'preparation',\n                steps: [],\n                backup: null,\n                rollback: null\n            },\n            validation: {\n                preInstall: null,\n                postInstall: null\n            }\n        });\n    }\n    \n    /**\n     * Create system context for system operations\n     * @param {Object} systemInfo - System information\n     * @param {Object} requirements - System requirements\n     * @returns {Object} System context\n     */\n    createSystemContext(systemInfo = {}, requirements = {}) {\n        const os = require('os');\n        \n        return this.createBaseContext(this.config.contextTypes.SYSTEM, {\n            system: {\n                platform: process.platform,\n                arch: process.arch,\n                nodeVersion: process.version,\n                totalMemory: os.totalmem(),\n                freeMemory: os.freemem(),\n                homeDir: os.homedir(),\n                tempDir: os.tmpdir(),\n                ...systemInfo\n            },\n            requirements,\n            compatibility: {\n                checked: false,\n                compatible: null,\n                issues: []\n            }\n        });\n    }\n    \n    /**\n     * Enhance existing context with additional data\n     * @param {Object} context - Existing context to enhance\n     * @param {Object} enhancement - Enhancement data\n     * @returns {Object} Enhanced context\n     */\n    enhanceContext(context, enhancement) {\n        if (!context || typeof context !== 'object') {\n            throw new Error('Context must be a valid object');\n        }\n        \n        return {\n            ...context,\n            ...enhancement,\n            metadata: {\n                ...context.metadata,\n                ...enhancement.metadata,\n                enhanced: true,\n                enhancedAt: new Date().toISOString()\n            }\n        };\n    }\n    \n    /**\n     * Update operation context progress\n     * @param {Object} context - Operation context to update\n     * @param {number} current - Current step\n     * @param {number} total - Total steps (optional)\n     * @param {string} step - Current step description\n     * @returns {Object} Updated context\n     */\n    updateOperationProgress(context, current, total = null, step = null) {\n        if (!this.isOperationContext(context)) {\n            throw new Error('Context must be an operation context');\n        }\n        \n        const updatedContext = { ...context };\n        updatedContext.data.progress.current = current;\n        \n        if (total !== null) {\n            updatedContext.data.progress.total = total;\n        }\n        \n        if (step !== null) {\n            updatedContext.data.progress.steps.push({\n                step,\n                timestamp: new Date().toISOString(),\n                index: current\n            });\n        }\n        \n        // Update status based on progress\n        if (current >= updatedContext.data.progress.total) {\n            updatedContext.data.status = 'completed';\n            updatedContext.data.endTime = new Date().toISOString();\n        } else {\n            updatedContext.data.status = 'in_progress';\n        }\n        \n        return updatedContext;\n    }\n    \n    /**\n     * Mark operation context as failed\n     * @param {Object} context - Operation context to mark as failed\n     * @param {Error} error - Error that caused failure\n     * @returns {Object} Updated context\n     */\n    markOperationFailed(context, error) {\n        if (!this.isOperationContext(context)) {\n            throw new Error('Context must be an operation context');\n        }\n        \n        return {\n            ...context,\n            data: {\n                ...context.data,\n                status: 'failed',\n                endTime: new Date().toISOString(),\n                error: {\n                    code: error?.code,\n                    message: error?.message,\n                    type: error?.constructor?.name\n                }\n            }\n        };\n    }\n    \n    /**\n     * Check if context is of specific type\n     * @param {Object} context - Context to check\n     * @param {string} type - Expected type\n     * @returns {boolean} True if context is of expected type\n     */\n    isContextType(context, type) {\n        return context && context.type === type;\n    }\n    \n    /**\n     * Check if context is an operation context\n     * @param {Object} context - Context to check\n     * @returns {boolean} True if operation context\n     */\n    isOperationContext(context) {\n        return this.isContextType(context, this.config.contextTypes.OPERATION);\n    }\n    \n    /**\n     * Check if context is a validation context\n     * @param {Object} context - Context to check\n     * @returns {boolean} True if validation context\n     */\n    isValidationContext(context) {\n        return this.isContextType(context, this.config.contextTypes.VALIDATION);\n    }\n    \n    /**\n     * Extract summary information from context\n     * @param {Object} context - Context to summarize\n     * @returns {Object} Context summary\n     */\n    getContextSummary(context) {\n        if (!context || typeof context !== 'object') {\n            return { valid: false, error: 'Invalid context' };\n        }\n        \n        const summary = {\n            type: context.type,\n            id: context.id,\n            timestamp: context.timestamp,\n            valid: true\n        };\n        \n        // Add type-specific summary information\n        if (this.isOperationContext(context)) {\n            summary.operation = {\n                name: context.data?.operation,\n                status: context.data?.status,\n                progress: `${context.data?.progress?.current || 0}/${context.data?.progress?.total || 1}`\n            };\n        } else if (this.isValidationContext(context)) {\n            summary.validation = {\n                valid: context.data?.results?.valid,\n                errors: context.data?.results?.errors?.length || 0,\n                warnings: context.data?.results?.warnings?.length || 0\n            };\n        }\n        \n        return summary;\n    }\n    \n    /**\n     * Generate unique context ID\n     * @returns {string} Unique context ID\n     * @private\n     */\n    _generateContextId() {\n        return `ctx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;\n    }\n}\n\nmodule.exports = ContextUtils;