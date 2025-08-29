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
            await this.showDryRunWithDetection(options);
            return { 
                message: '✅ Dry run completed successfully',
                dryRun: true 
            };
        }

        // Phase 2: Auto-detect configuration
        this.showProgress('🚀 Initializing OIDC command...', options);
        
        const configResult = await this.autoDetectConfiguration(options);
        if (!configResult.success) {
            console.log(`❌ Configuration detection failed: ${configResult.error}`);
            if (configResult.suggestions) {
                configResult.suggestions.forEach(suggestion => console.log(suggestion));
            }
            return {
                message: '❌ OIDC setup failed during configuration detection',
                error: configResult.error
            };
        }
        
        // Display detected configuration
        console.log('✅ Configuration detected successfully:');
        console.log(`   📂 Repository: ${configResult.git.owner}/${configResult.git.repo}`);
        console.log(`   🌍 AWS Region: ${configResult.aws.region} (${configResult.aws.source})`);
        console.log(`   🎭 IAM Role: ${configResult.roleName}`);
        console.log('');
        
        // For now, show that detection is working but full implementation is still in development
        console.log('📋 OIDC Setup Status: Auto-detection implemented ✅');
        console.log('⚠️  AWS resource creation is in development (Phase 3)');
        console.log('💡 Use --dry-run to preview complete functionality');
        
        return { 
            message: '✅ OIDC command executed successfully (Phase 2: Detection completed)',
            configuration: configResult
        };
    }

    /**
     * Show dry run preview with Phase 2 detection
     */
    async showDryRunWithDetection(options) {
        console.log('🔍 Dry Run - Preview of OIDC configuration actions:\n');
        
        // Show what detection would find
        console.log('📋 Phase 2: Auto-Detection Preview:');
        try {
            const configResult = await this.autoDetectConfiguration(options);
            if (configResult.success) {
                console.log(`   ✅ Repository: ${configResult.git.owner}/${configResult.git.repo}`);
                console.log(`   ✅ AWS Region: ${configResult.aws.region} (${configResult.aws.source})`);
                console.log(`   ✅ IAM Role: ${configResult.roleName}`);
                console.log(`   ✅ Policy Template: ${configResult.policyTemplate.name}`);
            } else {
                console.log(`   ❌ Configuration detection would fail: ${configResult.error}`);
            }
        } catch (error) {
            console.log(`   ❌ Detection error: ${error.message}`);
        }
        
        console.log('\n📋 Phase 3: AWS Resource Creation (Planned):');
        console.log('   • Create AWS OIDC Identity Provider for GitHub');
        console.log('   • Create IAM role with trust policy for GitHub Actions');
        console.log('   • Attach permission policies to IAM role');
        console.log('   • Set up GitHub repository variables (AWS_DEPLOYMENT_ROLE, AWS_REGION)');
        console.log('\n💡 This was a dry run - no changes were made');
        console.log('   Run without --dry-run to execute OIDC setup (Phase 2 detection only)');
        
        return { dryRun: true, message: 'Dry run completed' };
    }

    /**
     * Show dry run preview (legacy method)
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
     * REQ-DETECT-001: Git Repository Detection
     * Auto-detect GitHub org/repo from git remote
     */
    async detectGitRepository(options = {}) {
        try {
            const { execSync } = require('child_process');
            
            // Get git remotes
            const remotesOutput = execSync('git remote -v', { 
                encoding: 'utf8',
                cwd: options.repositoryPath || process.cwd()
            });
            
            const remotes = this.parseGitRemotes(remotesOutput);
            const selectedRemote = this.selectPreferredRemote(remotes);
            
            if (!selectedRemote) {
                throw new Error('No GitHub remote found. Please add a GitHub remote origin.');
            }
            
            const repoInfo = this.parseGitRemote(selectedRemote.url);
            return {
                success: true,
                owner: repoInfo.owner,
                repo: repoInfo.repo,
                remote: selectedRemote.name,
                url: selectedRemote.url
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                suggestions: [
                    '🔧 Ensure you are in a git repository',
                    '🔗 Add a GitHub remote: git remote add origin <github-url>',
                    '✅ Verify remote: git remote -v'
                ]
            };
        }
    }

    /**
     * Parse git remotes output into structured format
     */
    parseGitRemotes(remotesOutput) {
        const remotes = [];
        const lines = remotesOutput.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
            const match = line.match(/^(\w+)\s+(.+?)\s+\((fetch|push)\)$/);
            if (match && match[3] === 'fetch') { // Only use fetch URLs
                const [, name, url] = match;
                if (url.includes('github.com')) {
                    remotes.push({ name, url });
                }
            }
        });
        
        return remotes;
    }

    /**
     * Select preferred remote (prioritize 'origin')
     */
    selectPreferredRemote(remotes) {
        if (remotes.length === 0) return null;
        
        // Prefer 'origin' remote
        const origin = remotes.find(remote => remote.name === 'origin');
        if (origin) return origin;
        
        // Fall back to first GitHub remote
        return remotes[0];
    }

    /**
     * Parse git remote URL to extract owner/repo
     * Supports both SSH and HTTPS formats
     */
    parseGitRemote(url) {
        // SSH format: git@github.com:owner/repo.git
        const sshMatch = url.match(/^git@github\.com:([^\/]+)\/(.+?)(?:\.git)?$/);
        if (sshMatch) {
            return {
                owner: sshMatch[1],
                repo: sshMatch[2]
            };
        }
        
        // HTTPS format: https://github.com/owner/repo.git
        const httpsMatch = url.match(/^https:\/\/github\.com\/([^\/]+)\/(.+?)(?:\.git)?$/);
        if (httpsMatch) {
            return {
                owner: httpsMatch[1],
                repo: httpsMatch[2]
            };
        }
        
        throw new Error(`Unsupported git remote URL format: ${url}`);
    }

    /**
     * REQ-DETECT-002: AWS Configuration Detection
     * Read AWS CLI config and environment variables
     */
    async detectAWSConfiguration(options = {}) {
        try {
            const fs = require('fs');
            const path = require('path');
            const os = require('os');
            
            let region = null;
            let profile = 'default';
            
            // 1. Check environment variable first (highest priority)
            region = this.getAWSRegionFromEnvironment();
            
            // 2. If no env var, try to read from AWS config files
            if (!region) {
                const awsConfigResult = this.readAWSConfigFiles();
                region = awsConfigResult.region;
                profile = awsConfigResult.profile;
            }
            
            // 3. Default to us-east-1 if nothing found
            if (!region) {
                region = 'us-east-1';
            }
            
            // 4. Validate region
            const regionValid = this.validateAWSRegion(region);
            
            return {
                success: true,
                region: region,
                profile: profile,
                source: region === this.getAWSRegionFromEnvironment() ? 'environment' : 
                        region === 'us-east-1' ? 'default' : 'config-file',
                valid: regionValid
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                region: 'us-east-1', // Fallback
                suggestions: [
                    '🔧 Set AWS region: export AWS_DEFAULT_REGION=us-east-1',
                    '⚙️ Configure AWS CLI: aws configure',
                    '✅ Verify config: aws configure list'
                ]
            };
        }
    }

    /**
     * Get AWS region from environment variables
     */
    getAWSRegionFromEnvironment() {
        return process.env.AWS_DEFAULT_REGION || process.env.AWS_REGION || null;
    }

    /**
     * Read AWS CLI config files (~/.aws/config and ~/.aws/credentials)
     */
    readAWSConfigFiles() {
        const fs = require('fs');
        const path = require('path');
        const os = require('os');
        
        const awsDir = path.join(os.homedir(), '.aws');
        const configPath = path.join(awsDir, 'config');
        const credentialsPath = path.join(awsDir, 'credentials');
        
        let region = null;
        let profile = 'default';
        
        // Try to read config file first
        try {
            if (fs.existsSync(configPath)) {
                const configContent = fs.readFileSync(configPath, 'utf8');
                const regionMatch = configContent.match(/^\s*region\s*=\s*(.+)$/m);
                if (regionMatch) {
                    region = regionMatch[1].trim();
                }
            }
        } catch (error) {
            // Ignore config file read errors
        }
        
        return { region, profile };
    }

    /**
     * Validate AWS region format and existence
     */
    validateAWSRegion(region) {
        if (!region) return false;
        
        // Basic format validation: region should be like us-east-1, eu-west-1, etc.
        const regionPattern = /^[a-z]{2,3}-[a-z]+-\d+$/;
        if (!regionPattern.test(region)) {
            return false;
        }
        
        // List of valid AWS regions (simplified list for validation)
        const validRegions = [
            'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
            'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1',
            'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
            'sa-east-1', 'ca-central-1', 'ap-south-1'
        ];
        
        return validRegions.includes(region);
    }

    /**
     * REQ-CLI-003: Zero Configuration Mode
     * Combine git detection + AWS detection for zero-config experience
     */
    async autoDetectConfiguration(options = {}) {
        try {
            this.showProgress('🔍 Auto-detecting project configuration...', options);
            
            // Detect Git repository information
            const gitResult = await this.detectGitRepository(options);
            if (!gitResult.success) {
                return {
                    success: false,
                    error: 'Git repository detection failed',
                    details: gitResult,
                    suggestions: gitResult.suggestions
                };
            }
            
            // Detect AWS configuration
            const awsResult = await this.detectAWSConfiguration(options);
            if (!awsResult.success) {
                return {
                    success: false,
                    error: 'AWS configuration detection failed',
                    details: awsResult,
                    suggestions: awsResult.suggestions
                };
            }
            
            // Generate role name based on repository
            const roleName = this.generateRoleName(gitResult.owner, gitResult.repo, options);
            
            // Get default policy template
            const policyTemplate = this.getDefaultPolicyTemplate();
            
            return {
                success: true,
                git: gitResult,
                aws: awsResult,
                roleName: roleName,
                policyTemplate: policyTemplate,
                zeroConfig: true
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                suggestions: [
                    '🔧 Ensure you are in a git repository with GitHub remote',
                    '⚙️ Configure AWS CLI or set AWS_DEFAULT_REGION',
                    '✅ Run with --dry-run to see what would be configured'
                ]
            };
        }
    }

    /**
     * Auto-generate role name based on repository
     */
    generateRoleName(owner, repo, options = {}) {
        // Use provided role name if specified
        if (options.roleName && options.roleName !== 'GitHubActionsRole') {
            return options.roleName;
        }
        
        // Generate role name: GitHubActions-owner-repo
        const safeName = `GitHubActions-${owner}-${repo}`.replace(/[^a-zA-Z0-9-]/g, '-');
        
        // Ensure it meets IAM role name requirements (max 64 chars, alphanumeric + hyphens)
        if (safeName.length > 64) {
            return `GitHubActions-${owner}`.substring(0, 64);
        }
        
        return safeName;
    }

    /**
     * Get default policy template for standard use cases
     */
    getDefaultPolicyTemplate() {
        return {
            name: 'standard',
            description: 'Standard permissions for common GitHub Actions workflows',
            policies: [
                {
                    name: 'GitHubActionsBasePolicy',
                    document: {
                        Version: '2012-10-17',
                        Statement: [
                            {
                                Effect: 'Allow',
                                Action: [
                                    'sts:GetCallerIdentity',
                                    'sts:TagSession'
                                ],
                                Resource: '*'
                            }
                        ]
                    }
                }
            ]
        };
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