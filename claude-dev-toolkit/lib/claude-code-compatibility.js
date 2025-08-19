/**
 * 🟢 GREEN PHASE: REQ-023 Claude Code Compatibility
 * 
 * Detects Claude Code installation status and provides compatibility guidance.
 * Handles version validation and provides installation/upgrade instructions.
 * 
 * Features:
 * - Claude Code installation detection
 * - Version compatibility validation
 * - Platform-specific installation instructions
 * - Configuration validation
 * - Error handling integration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const PlatformUtils = require('./platform-utils');
const ErrorFactory = require('./error-factory');
const ErrorRecoverySystem = require('./error-recovery-system');

class ClaudeCodeCompatibility {
    constructor() {
        this.platformUtils = new PlatformUtils();
        this.errorFactory = new ErrorFactory();
        this.errorRecovery = new ErrorRecoverySystem();
        this.config = {
            minimumVersion: '0.1.0',
            recommendedVersion: '0.2.0',
            downloadUrls: {
                win32: 'https://claude.ai/download/windows',
                darwin: 'https://claude.ai/download/mac',
                linux: 'https://claude.ai/download/linux'
            },
            configPaths: {
                win32: path.join(os.homedir(), 'AppData', 'Roaming', 'claude', 'settings.json'),
                darwin: path.join(os.homedir(), '.config', 'claude', 'settings.json'),
                linux: path.join(os.homedir(), '.config', 'claude', 'settings.json')
            }
        };
    }

    /**
     * Check if Claude Code is installed
     * @returns {Object} Installation status and details
     */
    checkClaudeCodeInstallation() {
        try {
            const versionOutput = execSync('claude --version', { encoding: 'utf8', timeout: 5000 });
            const version = this._extractVersion(versionOutput);
            const installPath = this._getClaudeCodePath();
            
            return {
                installed: true,
                version: version,
                path: installPath
            };
        } catch (error) {
            return {
                installed: false,
                version: null,
                path: null,
                error: error.message
            };
        }
    }

    /**
     * Validate Claude Code version compatibility
     * @param {string} currentVersion - Current installed version
     * @param {string} minimumRequired - Minimum required version
     * @returns {Object} Compatibility validation result
     */
    validateClaudeCodeVersion(currentVersion, minimumRequired = this.config.minimumVersion) {
        const compatible = this._compareVersions(currentVersion, minimumRequired) >= 0;
        
        return {
            compatible: compatible,
            currentVersion: currentVersion,
            minimumRequired: minimumRequired,
            recommendedVersion: this.config.recommendedVersion
        };
    }

    /**
     * Generate installation instructions for missing Claude Code
     * @param {string} platform - Target platform
     * @returns {Object} Installation instructions
     */
    generateInstallationInstructions(platform = process.platform) {
        const instructions = {
            platform: platform,
            summary: `Install Claude Code for ${this.platformUtils.getPlatformName(platform)}`,
            downloadUrl: this.config.downloadUrls[platform],
            steps: [],
            verificationSteps: []
        };

        switch (platform) {
            case 'win32':
                instructions.steps = [
                    '1. Download Claude Code from the official website',
                    '2. Run the installer as Administrator',
                    '3. Follow the installation wizard',
                    '4. Restart your command prompt or PowerShell'
                ];
                instructions.verificationSteps = [
                    'Open Command Prompt or PowerShell',
                    'Run: claude --version',
                    'Verify version output is displayed'
                ];
                break;
            case 'darwin':
                instructions.steps = [
                    '1. Download Claude Code for Mac',
                    '2. Open the .dmg file',
                    '3. Drag Claude Code to Applications folder',
                    '4. Add to PATH: echo "export PATH=$PATH:/Applications/Claude.app/Contents/MacOS" >> ~/.zshrc'
                ];
                instructions.verificationSteps = [
                    'Open Terminal',
                    'Run: source ~/.zshrc',
                    'Run: claude --version',
                    'Verify installation is working'
                ];
                break;
            case 'linux':
                instructions.steps = [
                    '1. Download Claude Code for Linux',
                    '2. Extract the archive: tar -xzf claude-linux.tar.gz',
                    '3. Move to system directory: sudo mv claude /usr/local/bin/',
                    '4. Make executable: sudo chmod +x /usr/local/bin/claude'
                ];
                instructions.verificationSteps = [
                    'Open terminal',
                    'Run: which claude',
                    'Run: claude --version',
                    'Verify command is found and version displays'
                ];
                break;
        }

        return instructions;
    }

    /**
     * Generate upgrade instructions for incompatible versions
     * @param {string} currentVersion - Current version
     * @param {string} minimumRequired - Minimum required version
     * @param {string} platform - Target platform
     * @returns {Object} Upgrade instructions
     */
    generateUpgradeInstructions(currentVersion, minimumRequired, platform = process.platform) {
        return {
            summary: `Upgrade Claude Code from ${currentVersion} to ${minimumRequired} or higher`,
            currentVersion: currentVersion,
            targetVersion: minimumRequired,
            platform: platform,
            backupRecommendation: 'Backup your current Claude Code settings before upgrading',
            upgradeSteps: [
                '1. Download the latest version from the official website',
                '2. Close any running Claude Code instances',
                '3. Run the new installer/upgrade package',
                '4. Verify the upgrade was successful'
            ],
            verificationSteps: [
                'Run: claude --version',
                `Verify version is ${minimumRequired} or higher`,
                'Test basic Claude Code functionality'
            ]
        };
    }

    /**
     * Check Claude Code configuration
     * @param {Object} mockConfig - Mock configuration for testing
     * @returns {Object} Configuration validation result
     */
    checkClaudeCodeConfiguration(mockConfig = null) {
        if (mockConfig) {
            return {
                valid: mockConfig.configExists,
                issues: mockConfig.configExists ? [] : ['Configuration file not found'],
                configPath: mockConfig.configPath,
                recommendations: mockConfig.configExists ? [] : ['Run claude setup to create configuration']
            };
        }

        const configPath = this.config.configPaths[process.platform];
        const configExists = fs.existsSync(configPath);
        
        const issues = [];
        const recommendations = [];
        
        if (!configExists) {
            issues.push('Claude Code configuration file not found');
            recommendations.push('Run "claude setup" to initialize configuration');
        }
        
        return {
            valid: issues.length === 0,
            issues: issues,
            configPath: configPath,
            recommendations: recommendations
        };
    }

    /**
     * Get resolution guidance for installation issues
     * @param {string} issueType - Type of issue
     * @returns {Object} Resolution guidance
     */
    getResolutionGuidance(issueType) {
        const guidanceMap = {
            'not_installed': {
                issue: 'not_installed',
                description: 'Claude Code is not installed on this system',
                priority: 'high',
                solutions: [
                    'Try: Download and install Claude Code from the official website',
                    'Solution: Use your platform-specific package manager if available',
                    'Step: Follow the installation instructions for your operating system'
                ]
            },
            'version_incompatible': {
                issue: 'version_incompatible',
                description: 'Installed Claude Code version is incompatible',
                priority: 'high',
                solutions: [
                    'Try: Upgrade to the latest version of Claude Code',
                    'Solution: Download and install the recommended version',
                    'Step: Backup your settings before upgrading'
                ]
            },
            'path_not_found': {
                issue: 'path_not_found',
                description: 'Claude Code is installed but not in system PATH',
                priority: 'medium',
                solutions: [
                    'Try: Add Claude Code installation directory to your PATH',
                    'Solution: Restart your terminal or command prompt',
                    'Step: Verify PATH configuration in your shell profile'
                ]
            },
            'permission_denied': {
                issue: 'permission_denied',
                description: 'Permission denied when accessing Claude Code',
                priority: 'medium',
                solutions: [
                    'Try: Run as administrator or with sudo',
                    'Solution: Check file permissions on Claude Code executable',
                    'Step: Reinstall with proper permissions'
                ]
            },
            'corrupted_installation': {
                issue: 'corrupted_installation',
                description: 'Claude Code installation appears corrupted',
                priority: 'high',
                solutions: [
                    'Try: Reinstall Claude Code completely',
                    'Solution: Remove existing installation first',
                    'Step: Clear any cached configuration files'
                ]
            }
        };

        return guidanceMap[issueType] || {
            issue: issueType,
            description: 'Unknown Claude Code compatibility issue',
            priority: 'medium',
            solutions: ['Try: Check Claude Code documentation for troubleshooting']
        };
    }

    /**
     * Check for multiple Claude Code installations
     * @returns {Object} Multiple installation check result
     */
    checkMultipleInstallations() {
        // Simplified implementation for GREEN phase
        return {
            multipleFound: false,
            installations: [],
            recommended: null
        };
    }

    /**
     * Resolve multiple installations
     * @param {Array} installations - List of found installations
     * @returns {Object} Resolution recommendation
     */
    resolveMultipleInstallations(installations) {
        if (installations.length === 0) {
            return {
                recommended: null,
                reasoning: 'No installations found',
                cleanupSuggestions: []
            };
        }

        // Find the highest version installation
        let recommended = installations[0];
        for (const installation of installations) {
            if (this._compareVersions(installation.version, recommended.version) > 0) {
                recommended = installation;
            }
        }

        const others = installations.filter(inst => inst !== recommended);
        
        return {
            recommended: recommended,
            reasoning: `Recommended version ${recommended.version} at ${recommended.path}`,
            cleanupSuggestions: others.map(inst => 
                `Remove installation at ${inst.path} (version ${inst.version})`
            )
        };
    }

    /**
     * Validate Claude Code CLI access and permissions
     * @returns {Object} Access validation result
     */
    validateClaudeCodeAccess() {
        try {
            execSync('claude --help', { encoding: 'utf8', timeout: 5000 });
            
            return {
                accessible: true,
                executable: true,
                permissions: 'valid',
                pathIssues: false
            };
        } catch (error) {
            const resolutionSteps = [
                'Check if Claude Code is installed',
                'Verify PATH environment variable includes Claude Code',
                'Check file permissions on Claude Code executable'
            ];
            
            return {
                accessible: false,
                executable: false,
                permissions: 'invalid',
                pathIssues: true,
                resolutionSteps: resolutionSteps
            };
        }
    }

    /**
     * Handle installation errors with Claude Code specific guidance
     * @param {Error} error - Installation error
     * @returns {Object} Error handling result
     */
    handleInstallationError(error) {
        const enhancedError = this.errorFactory.wrapError(error, {
            component: 'claude-code-compatibility',
            operation: 'installation',
            claudeCodeSpecific: true
        });
        
        return {
            handled: true,
            claudeCodeSpecific: true,
            error: enhancedError,
            guidance: {
                summary: 'Claude Code installation error detected',
                errorCode: enhancedError.code,
                errorMessage: enhancedError.message,
                claudeSpecific: 'This error is related to Claude Code CLI installation'
            },
            nextSteps: [
                'Verify Claude Code is properly installed',
                'Check system PATH configuration',
                'Review Claude Code installation instructions'
            ]
        };
    }

    /**
     * Check system environment compatibility
     * @returns {Object} Environment compatibility result
     */
    checkSystemEnvironment() {
        const requirements = [
            {
                name: 'node',
                version: '>=16.0.0',
                satisfied: this._checkNodeVersion()
            },
            {
                name: 'npm',
                version: '>=7.0.0',
                satisfied: this._checkNpmVersion()
            }
        ];

        const issues = requirements.filter(req => !req.satisfied)
            .map(req => `${req.name} requirement not met: needs ${req.version}`);

        return {
            compatible: issues.length === 0,
            requirements: requirements,
            issues: issues,
            recommendations: issues.length > 0 ? [
                'Update Node.js to latest LTS version',
                'Update npm to latest version'
            ] : []
        };
    }

    /**
     * Generate comprehensive compatibility report
     * @returns {Object} Complete compatibility report
     */
    generateCompatibilityReport() {
        const installation = this.checkClaudeCodeInstallation();
        const configuration = this.checkClaudeCodeConfiguration();
        const environment = this.checkSystemEnvironment();
        const access = this.validateClaudeCodeAccess();
        
        const allIssues = [
            ...(installation.installed ? [] : ['Claude Code not installed']),
            ...configuration.issues,
            ...environment.issues,
            ...(access.accessible ? [] : ['Claude Code not accessible'])
        ];

        const recommendations = [
            ...configuration.recommendations,
            ...environment.recommendations,
            ...(access.resolutionSteps || [])
        ];

        const resolutionPlan = {
            steps: allIssues.length > 0 ? [
                'Address installation issues first',
                'Configure system environment',
                'Verify Claude Code accessibility',
                'Test basic functionality'
            ] : []
        };

        return {
            timestamp: new Date().toISOString(),
            installation: installation,
            version: installation.installed ? 
                this.validateClaudeCodeVersion(installation.version) : null,
            configuration: configuration,
            environment: environment,
            summary: {
                compatible: allIssues.length === 0,
                issues: allIssues,
                recommendations: recommendations
            },
            resolutionPlan: resolutionPlan
        };
    }

    /**
     * Extract version from command output
     * @param {string} output - Command output
     * @returns {string} Extracted version
     * @private
     */
    _extractVersion(output) {
        const versionMatch = output.match(/(\d+\.\d+\.\d+)/);
        return versionMatch ? versionMatch[1] : 'unknown';
    }

    /**
     * Get Claude Code installation path
     * @returns {string} Installation path
     * @private
     */
    _getClaudeCodePath() {
        try {
            const command = this.platformUtils.resolveCommand('which', process.platform) + ' claude';
            return execSync(command, { encoding: 'utf8', timeout: 3000 }).trim();
        } catch (error) {
            return 'unknown';
        }
    }

    /**
     * Compare version strings
     * @param {string} version1 - First version
     * @param {string} version2 - Second version
     * @returns {number} Comparison result (-1, 0, 1)
     * @private
     */
    _compareVersions(version1, version2) {
        const v1Parts = version1.split('.').map(Number);
        const v2Parts = version2.split('.').map(Number);
        
        for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
            const v1Part = v1Parts[i] || 0;
            const v2Part = v2Parts[i] || 0;
            
            if (v1Part > v2Part) return 1;
            if (v1Part < v2Part) return -1;
        }
        
        return 0;
    }


    /**
     * Check Node.js version requirement
     * @returns {boolean} Whether Node.js version is satisfied
     * @private
     */
    _checkNodeVersion() {
        try {
            const nodeVersion = process.version.substring(1); // Remove 'v' prefix
            return this._compareVersions(nodeVersion, '16.0.0') >= 0;
        } catch (error) {
            return false;
        }
    }

    /**
     * Check npm version requirement
     * @returns {boolean} Whether npm version is satisfied
     * @private
     */
    _checkNpmVersion() {
        try {
            const npmVersion = execSync('npm --version', { encoding: 'utf8', timeout: 5000 }).trim();
            return this._compareVersions(npmVersion, '7.0.0') >= 0;
        } catch (error) {
            return false;
        }
    }
}

module.exports = ClaudeCodeCompatibility;