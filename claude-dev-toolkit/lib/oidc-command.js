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
        
        // Generate specific recovery suggestions for OIDC dependencies
        const oidcSuggestions = this.generateOIDCRecoverySuggestions(context.missingTools || []);
        const suggestions = this.errorHandlerUtils.generateRecoverySuggestions(enhancedError);
        
        return {
            ...enhancedError,
            suggestions: [...oidcSuggestions, ...Array.from(suggestions || [])],
            message: this.enhanceErrorMessage(enhancedError.message, context.missingTools || [])
        };
    }

    /**
     * Generate OIDC-specific recovery suggestions
     */
    generateOIDCRecoverySuggestions(missingTools) {
        const suggestions = [
            "📋 OIDC Setup requires these prerequisites:",
            "   Run 'claude-commands oidc --help' for complete setup guide",
            ""
        ];

        missingTools.forEach(tool => {
            switch (tool.name) {
                case 'aws':
                    suggestions.push(
                        "🔧 Install AWS CLI:",
                        "   • macOS: brew install awscli",
                        "   • Linux: curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip' && unzip awscliv2.zip && sudo ./aws/install",
                        "   • Windows: Download from https://aws.amazon.com/cli/",
                        "   • Configure: aws configure (requires Access Key ID and Secret)",
                        ""
                    );
                    break;
                case 'gh':
                    suggestions.push(
                        "🔧 Install GitHub CLI:",
                        "   • macOS: brew install gh",
                        "   • Linux: curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg",
                        "   • Windows: Download from https://github.com/cli/cli/releases",
                        "   • Authenticate: gh auth login",
                        ""
                    );
                    break;
                case 'git':
                    suggestions.push(
                        "🔧 Install Git:",
                        "   • macOS: brew install git (or use Xcode Command Line Tools)",
                        "   • Linux: sudo apt-get install git (Ubuntu/Debian) or sudo yum install git (RHEL/CentOS)",
                        "   • Windows: Download from https://git-scm.com/download/win",
                        "   • Ensure your repository has a GitHub remote origin",
                        ""
                    );
                    break;
            }
        });

        suggestions.push(
            "✅ After installation, verify with:",
            "   • aws --version && aws sts get-caller-identity",
            "   • gh --version && gh auth status", 
            "   • git --version && git remote -v",
            "",
            "📖 For detailed setup instructions:",
            "   claude-commands oidc --help"
        );

        return suggestions;
    }

    /**
     * Enhance error message with context
     */
    enhanceErrorMessage(originalMessage, missingTools) {
        if (missingTools.length === 0) return originalMessage;
        
        const toolNames = missingTools.map(t => t.name).join(', ');
        return `${originalMessage}

🎯 OIDC Setup Prerequisites Missing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Missing tools: ${toolNames}

The OIDC command requires AWS CLI, GitHub CLI, and Git to be installed and configured.
These tools enable secure authentication between GitHub Actions and AWS.

Run 'claude-commands oidc --help' for complete setup requirements.`;
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
            this.showDryRun(options);
            return { 
                message: '✅ Dry run completed successfully',
                dryRun: true 
            };
        }

        // Show progress to user
        this.showProgress('🚀 Initializing OIDC command...', options);
        
        // For now, this is a minimal implementation placeholder
        console.log('📋 OIDC Setup Status: Command structure implemented');
        console.log('⚠️  Full OIDC implementation is in development');
        console.log('💡 Use --dry-run to preview planned functionality');
        
        return { 
            message: '✅ OIDC command executed successfully (minimal implementation)' 
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
        console.log('   • Create AWS OIDC Identity Provider for GitHub');
        console.log('   • Create IAM role with trust policy for GitHub Actions');
        console.log('   • Set up GitHub repository variables (AWS_DEPLOYMENT_ROLE, AWS_REGION)');
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

This command creates AWS OIDC identity provider, IAM role with trust policy,
and configures GitHub repository variables for secure passwordless authentication.

Usage:
  claude-commands oidc [options]

Options:
  --region <region>        AWS region (default: us-east-1)
  --role-name <name>       IAM role name (default: GitHubActionsRole)
  --repository-path <path> Repository path (default: current directory)
  --dry-run               Preview actions without making changes
  --verbose               Show detailed output
  --help                  Show this help message

Examples:
  claude-commands oidc --help
  claude-commands oidc --dry-run
  claude-commands oidc --region us-west-2 --role-name MyGitHubRole

This command creates direct IAM resources without CloudFormation.
        `.trim();
    }
}

module.exports = OidcCommand;