#!/usr/bin/env node

/**
 * OIDC Command Implementation
 * Provides GitHub Actions OIDC configuration with AWS through the toolkit's CLI framework
 */

const BaseCommand = require('./base/base-command');
const DependencyValidator = require('./dependency-validator');
const ErrorHandlerUtils = require('./error-handler-utils');

class OidcCommand extends BaseCommand {
    constructor() {
        super();
        this.dependencyValidator = new DependencyValidator();
        this.errorHandlerUtils = new ErrorHandlerUtils();
    }

    /**
     * Get required tools for OIDC functionality
     */
    getRequiredTools() {
        return [
            {
                name: 'aws',
                description: 'AWS CLI for AWS operations',
                required: true
            },
            {
                name: 'git',
                description: 'Git for repository operations', 
                required: true
            },
            {
                name: 'gh',
                description: 'GitHub CLI for GitHub operations',
                required: true
            }
        ];
    }

    /**
     * Validate required dependencies
     */
    async validateDependencies(options = {}) {
        const requiredTools = this.getRequiredTools();
        const result = this.dependencyValidator.checkDependencies(requiredTools);
        
        return result;
    }

    /**
     * Handle dependency errors with enhanced error information
     */
    handleDependencyError(error, context = {}) {
        const enhancedError = this.errorHandlerUtils.createEnhancedError(error, {
            operation: 'dependency validation',
            component: 'OIDC command',
            ...context
        });
        
        const suggestions = this.errorHandlerUtils.generateRecoverySuggestions(enhancedError);
        
        return {
            ...enhancedError,
            suggestions
        };
    }

    /**
     * Create context-aware error with operation details
     */
    createContextAwareError(error, context = {}) {
        return this.errorHandlerUtils.createEnhancedError(error, context);
    }

    /**
     * Process command arguments with defaults and validation
     */
    processArguments(options = {}) {
        const processed = {
            // Default values for common options
            region: options.region || 'us-east-1',
            dryRun: options.dryRun || false,
            verbose: options.verbose || false,
            help: options.help || false,
            
            // OIDC-specific options with defaults
            repositoryPath: options.repositoryPath || process.cwd(),
            stackName: options.stackName || 'github-oidc-stack',
            roleName: options.roleName || 'GitHubActionsRole',
            
            // Copy other options as-is
            ...options
        };

        // Special handling for help option
        if (processed.help) {
            processed.shouldShowHelp = true;
        }

        return processed;
    }

    /**
     * Validate argument constraints and requirements
     */
    validateArguments(options = {}) {
        const errors = [];
        const result = {
            valid: true,
            errors,
            warnings: []
        };

        // Validate region format
        if (options.region && !/^[a-z0-9-]+$/.test(options.region)) {
            errors.push('Region must contain only lowercase letters, numbers, and hyphens');
        }

        // Validate repository path if provided
        if (options.repositoryPath && typeof options.repositoryPath !== 'string') {
            errors.push('Repository path must be a string');
        }

        // Validate stack name format
        if (options.stackName && !/^[a-zA-Z0-9-]+$/.test(options.stackName)) {
            errors.push('Stack name must contain only letters, numbers, and hyphens');
        }

        // Update validation status
        result.valid = errors.length === 0;

        return result;
    }

    /**
     * Pre-execution validation
     */
    async preValidate(options = {}) {
        try {
            // Process and validate arguments first
            const processedOptions = this.processArguments(options);
            const argumentValidation = this.validateArguments(processedOptions);
            
            if (!argumentValidation.valid) {
                const error = new Error(`Invalid arguments: ${argumentValidation.errors.join(', ')}`);
                error.code = 'VALIDATION_ERROR';
                
                const enhancedError = this.createContextAwareError(error, {
                    operation: 'OIDC argument validation',
                    component: 'argument processor',
                    validationErrors: argumentValidation.errors
                });
                
                return {
                    success: false,
                    error: enhancedError.message,
                    enhancedError,
                    argumentValidation
                };
            }

            this.showProgress('Validating dependencies...', processedOptions);
            
            // Validate required tools are available
            const dependencyResult = await this.validateDependencies(processedOptions);
            
            if (!dependencyResult.valid) {
                const missingTools = dependencyResult.missing.map(tool => tool.name).join(', ');
                
                // Create enhanced error with context and recovery suggestions
                const error = new Error(`Missing required tools: ${missingTools}`);
                error.code = 'NOT_FOUND';
                
                const enhancedError = this.handleDependencyError(error, {
                    operation: 'OIDC pre-validation',
                    component: 'dependency check',
                    missingTools: dependencyResult.missing
                });
                
                return {
                    success: false,
                    error: enhancedError.message,
                    enhancedError,
                    dependencyResult
                };
            }
            
            this.showProgress('Dependencies validated successfully', processedOptions);
            return { 
                success: true, 
                processedOptions, 
                argumentValidation,
                dependencyResult 
            };
            
        } catch (error) {
            // Handle unexpected validation errors
            const enhancedError = this.createContextAwareError(error, {
                operation: 'OIDC pre-validation',
                component: 'validation system'
            });
            
            return {
                success: false,
                error: enhancedError.message,
                enhancedError
            };
        }
    }

    /**
     * Main command execution logic
     */
    async run(options = {}) {
        const { dryRun = false } = options;

        if (dryRun) {
            return this.showDryRun(options);
        }

        // Minimal implementation for current phase
        this.showProgress('Initializing OIDC command...', options);
        
        return { 
            message: 'OIDC command executed successfully' 
        };
    }

    /**
     * Show dry run preview
     */
    showDryRun(options) {
        console.log('🔍 Dry Run - Preview of OIDC configuration actions:\n');
        console.log('📋 OIDC Setup:');
        console.log('   • Detect GitHub repository context');
        console.log('   • Validate AWS credentials and permissions');
        console.log('   • Generate IAM policies and trust relationships');
        console.log('\n💡 This was a dry run - no changes were made');
        console.log('   Run without --dry-run to execute OIDC setup');
        
        return { dryRun: true, message: 'Dry run completed' };
    }

    /**
     * Get help text for OIDC command
     */
    getHelpText() {
        return `
Configure GitHub Actions OIDC integration with AWS.

This command provides comprehensive GitHub Actions OIDC configuration 
with AWS through the toolkit's CLI framework.

Usage:
  claude-commands oidc [options]

Options:
  --help               Show this help message

Examples:
  claude-commands oidc --help

This command enables secure GitHub Actions to AWS authentication using OIDC.
        `.trim();
    }
}

module.exports = OidcCommand;