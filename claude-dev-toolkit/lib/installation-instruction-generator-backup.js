/**
 * Installation Instruction Generator
 * 
 * Orchestrator for generating platform-specific installation instructions and recovery guidance.
 * Refactored to use focused services following Single Responsibility Principle.
 * 
 * Features:
 * - Cross-platform installation instructions via PlatformInstructionService
 * - Package manager integration via PackageManagerService  
 * - Recovery and troubleshooting guidance via RecoveryInstructionService
 */

const PlatformInstructionService = require('./services/platform-instruction-service');
const PackageManagerService = require('./services/package-manager-service');
const RecoveryInstructionService = require('./services/recovery-instruction-service');
const LoggerService = require('./services/logger-service');

class InstallationInstructionGenerator {
    constructor(logger = null) {
        this.platformService = new PlatformInstructionService();
        this.packageManagerService = new PackageManagerService();
        this.recoveryService = new RecoveryInstructionService();
        this.logger = logger || new LoggerService();
    }
    
    /**
     * Create download links for common tools
     * @returns {Object} Download links by tool and platform
     * @private
     */
    _createDownloadLinks() {
        return {
            git: {
                linux: 'https://git-scm.com/download/linux',
                darwin: 'https://git-scm.com/download/mac',
                win32: 'https://git-scm.com/download/win'
            },
            node: {
                all: 'https://nodejs.org/en/download/'
            },
            python: {
                all: 'https://www.python.org/downloads/'
            },
            docker: {
                linux: 'https://docs.docker.com/engine/install/',
                darwin: 'https://docs.docker.com/desktop/install/mac-install/',
                win32: 'https://docs.docker.com/desktop/install/windows-install/'
            }
        };
    }
    
    /**
     * Generate installation instructions for missing dependency
     * @param {Object} dependency - Missing dependency
     * @param {string} platform - Target platform (optional)
     * @returns {Object} Installation instructions
     */
    generateInstallationInstructions(dependency, platform = process.platform) {
        this.logger.debug('Generating installation instructions', { 
            dependency: dependency.name, 
            platform 
        });

        try {
            // Get platform-specific instructions
            const platformInstructions = this.platformService.generatePlatformInstructions(platform, dependency);
            
            // Get package manager instructions  
            const packageManagerInstructions = this.packageManagerService.generateInstallationInstructions(
                dependency.packageName || dependency.name, 
                { 
                    global: dependency.global,
                    version: dependency.version 
                }
            );

            // Combine instructions
            const instructions = {
                dependency: dependency.name,
                platform,
                packageManagers: packageManagerInstructions,
                downloadLinks: platformInstructions.downloadLinks,
                notes: platformInstructions.notes,
                troubleshooting: platformInstructions.troubleshooting
            };

            this.logger.debug('Generated installation instructions', { 
                managersCount: packageManagerInstructions.length,
                notesCount: instructions.notes.length
            });

            return instructions;
        } catch (error) {
            this.logger.error('Failed to generate installation instructions', error, { 
                dependency: dependency.name, 
                platform 
            });
            throw error;
        }
    }
    
    /**
     * Generate recovery suggestions for failed dependencies
     * @param {Object} failedDependency - Dependency that failed validation
     * @returns {Object} Recovery suggestions
     */
    generateRecoverySuggestions(failedDependency) {
        this.logger.debug('Generating recovery suggestions', { 
            dependency: failedDependency.name,
            errorCode: failedDependency.error?.code 
        });

        try {
            const suggestions = this.recoveryService.generateRecoverySuggestions(failedDependency);
            
            this.logger.debug('Generated recovery suggestions', {
                immediate: suggestions.immediate.length,
                alternative: suggestions.alternative.length, 
                troubleshooting: suggestions.troubleshooting.length
            });
            
            return suggestions;
        } catch (error) {
            this.logger.error('Failed to generate recovery suggestions', error, { 
                dependency: failedDependency.name 
            });
            throw error;
        }
    }
    
    /**
     * Generate installation instructions for multiple dependencies
     * @param {Array} dependencies - List of dependencies to install
     * @param {string} platform - Target platform
     * @returns {Object} Batch installation instructions
     */
    generateBatchInstallationInstructions(dependencies, platform = process.platform) {
        this.logger.info('Generating batch installation instructions', { 
            count: dependencies.length, 
            platform 
        });

        try {
            const batchInstructions = {
                platform,
                dependencies: dependencies.map(dep => dep.name),
                individualInstructions: [],
                bulkRecovery: null
            };
            
            // Generate individual instructions
            for (const dependency of dependencies) {
                const instructions = this.generateInstallationInstructions(dependency, platform);
                batchInstructions.individualInstructions.push({
                    dependency: dependency.name,
                    instructions
                });
            }
            
            this.logger.debug('Generated batch instructions', { 
                processedCount: batchInstructions.individualInstructions.length 
            });
            
            return batchInstructions;
        } catch (error) {
            this.logger.error('Failed to generate batch installation instructions', error, { 
                dependencyCount: dependencies.length, 
                platform 
            });
            throw error;
        }
    }
    
    /**
     * Generate upgrade instructions for outdated dependencies
     * @param {Object} dependency - Dependency to upgrade
     * @param {string} currentVersion - Current version
     * @param {string} targetVersion - Target version
     * @param {string} platform - Target platform
     * @returns {Object} Upgrade instructions
     */
    generateUpgradeInstructions(dependency, currentVersion, targetVersion, platform = process.platform) {
        const upgradeInstructions = {
            dependency: dependency.name,
            currentVersion: currentVersion,
            targetVersion: targetVersion,
            platform: platform,
            upgradeSteps: [],
            verificationSteps: [],
            backupRecommendations: [],
            troubleshootingTips: []
        };
        
        // Add backup recommendations
        upgradeInstructions.backupRecommendations = [
            `Backup current ${dependency.name} configuration if applicable`,
            'Document current working setup before upgrading',
            'Ensure you can rollback if needed'
        ];
        
        // Generate upgrade commands
        const packageManagers = this.packageManagerService.getAvailablePackageManagers(platform);
        for (const pm of packageManagers) {
            const upgradeCommand = this._generateUpgradeCommand(pm, dependency.name, platform);
            if (upgradeCommand) {
                upgradeInstructions.upgradeSteps.push({
                    packageManager: pm.name,
                    command: upgradeCommand,
                    description: `Upgrade ${dependency.name} using ${pm.name}`
                });
            }
        }
        
        // Add verification steps
        upgradeInstructions.verificationSteps = [
            `Run: ${dependency.name} --version`,
            `Verify version shows ${targetVersion} or higher`,
            'Test basic functionality to ensure upgrade was successful'
        ];
        
        // Add troubleshooting tips
        upgradeInstructions.troubleshootingTips = [
            'Clear package manager cache if upgrade fails',
            'Check for dependency conflicts',
            'Restart terminal/shell after upgrade',
            'Verify PATH environment variable is correct'
        ];
        
        return upgradeInstructions;
    }
    
    /**
     * Generate platform-specific installation guidance
     * @param {string} platform - Target platform
     * @returns {Object} Platform-specific guidance
     */
    generatePlatformGuidance(platform) {
        const guidance = {
            platform: platform,
            platformName: this.platformUtils.getPlatformName(platform),
            packageManagers: [],
            commonIssues: [],
            bestPractices: [],
            systemRequirements: {}
        };
        
        // Get package managers for platform
        guidance.packageManagers = this.packageManagerService.getPackageManagersForPlatform(platform)
            .map(pm => ({
                name: pm.name,
                description: this._getPackageManagerDescription(pm.name),
                installationUrl: this._getPackageManagerInstallUrl(pm.name, platform)
            }));
        
        // Platform-specific guidance
        switch (platform) {
            case 'win32':
                guidance.commonIssues = [
                    'PATH environment variable not updated',
                    'PowerShell execution policy restrictions',
                    'Windows Defender blocking downloads',
                    'Missing Visual C++ redistributables'
                ];
                guidance.bestPractices = [
                    'Run commands as Administrator when necessary',
                    'Use PowerShell instead of Command Prompt',
                    'Install package manager first (Chocolatey, Winget)',
                    'Check Windows version compatibility'
                ];
                break;
                
            case 'darwin':
                guidance.commonIssues = [
                    'Xcode Command Line Tools missing',
                    'System Integrity Protection (SIP) restrictions',
                    'Homebrew not installed or outdated',
                    'Architecture mismatch (Intel vs Apple Silicon)'
                ];
                guidance.bestPractices = [
                    'Install Xcode Command Line Tools first',
                    'Use Homebrew for package management',
                    'Check architecture compatibility (x86_64 vs arm64)',
                    'Update shell profile (.zshrc) for PATH changes'
                ];
                break;
                
            case 'linux':
                guidance.commonIssues = [
                    'Missing package repositories',
                    'Insufficient permissions',
                    'Outdated package lists',
                    'Missing dependencies'
                ];
                guidance.bestPractices = [
                    'Update package lists before installing',
                    'Use distribution-specific package manager',
                    'Install development tools if compiling from source',
                    'Check distribution version compatibility'
                ];
                break;
        }
        
        return guidance;
    }
    
    /**
     * Create instruction generation context
     * @param {Object} dependency - Dependency information
     * @param {string} platform - Target platform
     * @returns {Object} Instruction context
     * @private
     */
    _createInstructionContext(dependency, platform) {
        return {
            dependency,
            platform,
            platformManagers: this.packageManagerService.getPackageManagersForPlatform(platform),
            dependencyMapping: this.packageManagerService.config.dependencyMappings[dependency.name]
        };
    }
    
    /**
     * Initialize empty instructions object
     * @param {string} platform - Target platform
     * @returns {Object} Empty instructions object
     * @private
     */
    _initializeInstructions(platform) {
        return {
            platform: platform,
            packageManager: null,
            commands: [],
            packageManagerOptions: [],
            globalInstall: null,
            localInstall: null,
            alternativeOptions: []
        };
    }
    
    /**
     * Add platform-specific package managers to instructions
     * @param {Object} instructions - Instructions object to modify
     * @param {Object} context - Instruction context
     * @private
     */
    _addPlatformPackageManagers(instructions, context) {
        for (const pm of context.platformManagers) {
            const packageName = this._resolvePackageName(pm, context);
            const packageManagerOption = this._createPackageManagerOption(pm, packageName);
            instructions.packageManagerOptions.push(packageManagerOption);
        }
    }
    
    /**
     * Resolve package name for specific package manager
     * @param {Object} pm - Package manager configuration
     * @param {Object} context - Instruction context
     * @returns {string} Resolved package name
     * @private
     */
    _resolvePackageName(pm, context) {
        const { dependency, platform, dependencyMapping } = context;
        
        if (dependencyMapping && dependencyMapping[platform] && dependencyMapping[platform][pm.name]) {
            return dependencyMapping[platform][pm.name];
        }
        
        return dependency.name;
    }
    
    /**
     * Create package manager option object
     * @param {Object} pm - Package manager configuration
     * @param {string} packageName - Resolved package name
     * @returns {Object} Package manager option
     * @private
     */
    _createPackageManagerOption(pm, packageName) {
        return {
            name: pm.name,
            command: pm.install.replace('{package}', packageName),
            check: pm.check.replace('{package}', packageName),
            packageName: packageName
        };
    }
    
    /**
     * Set default package manager from available options
     * @param {Object} instructions - Instructions object to modify
     * @private
     */
    _setDefaultPackageManager(instructions) {
        if (instructions.packageManagerOptions.length > 0) {
            const defaultPM = instructions.packageManagerOptions[0];
            instructions.packageManager = defaultPM.name;
            instructions.commands.push(defaultPM.command);
        }
    }
    
    /**
     * Handle npm package-specific instructions
     * @param {Object} instructions - Instructions object to modify
     * @param {Object} context - Instruction context
     * @private
     */
    _handleNpmPackageSpecific(instructions, context) {
        if (context.dependency.type !== 'npm_package') return;
        
        this._addNpmInstallOptions(instructions, context.dependency.name);
        this._ensureNpmInOptions(instructions, context.dependency.name);
        this._addNpmAlternatives(instructions, context.dependency.name);
    }
    
    /**
     * Add npm install options (global/local)
     * @param {Object} instructions - Instructions object to modify
     * @param {string} packageName - Package name
     * @private
     */
    _addNpmInstallOptions(instructions, packageName) {
        instructions.globalInstall = `npm install -g ${packageName}`;
        instructions.localInstall = `npm install ${packageName}`;
    }
    
    /**
     * Ensure npm is in package manager options
     * @param {Object} instructions - Instructions object to modify
     * @param {string} packageName - Package name
     * @private
     */
    _ensureNpmInOptions(instructions, packageName) {
        const hasNpm = instructions.packageManagerOptions.some(pm => pm.name === 'npm');
        if (!hasNpm) {
            instructions.packageManagerOptions.unshift({
                name: 'npm',
                command: `npm install -g ${packageName}`
            });
        }
    }
    
    /**
     * Add npm alternatives (yarn, pnpm)
     * @param {Object} instructions - Instructions object to modify
     * @param {string} packageName - Package name
     * @private
     */
    _addNpmAlternatives(instructions, packageName) {
        instructions.packageManagerOptions.push(
            { name: 'yarn', command: `yarn global add ${packageName}` },
            { name: 'pnpm', command: `pnpm add -g ${packageName}` }
        );
    }
    
    /**
     * Add alternative installation methods (private)
     * @param {Object} instructions - Instructions to enhance
     * @param {Object} dependency - Dependency information
     * @param {string} platform - Target platform
     * @private
     */
    _addAlternativeInstallationMethods(instructions, dependency, platform) {
        this._addDownloadLinks(instructions, dependency, platform);
        this._addDockerAlternative(instructions, dependency);
    }
    
    /**
     * Add download links for dependencies (private)
     * @param {Object} instructions - Instructions to enhance
     * @param {Object} dependency - Dependency information
     * @param {string} platform - Target platform
     * @private
     */
    _addDownloadLinks(instructions, dependency, platform) {
        const links = this.config.downloadLinks[dependency.name];
        if (!links) return;
        
        if (links.all) {
            instructions.alternativeOptions.push(`Download from: ${links.all}`);
        } else if (links[platform]) {
            instructions.alternativeOptions.push(`Download from: ${links[platform]}`);
        }
    }
    
    /**
     * Add Docker alternative for tools (private)
     * @param {Object} instructions - Instructions to enhance
     * @param {Object} dependency - Dependency information
     * @private
     */
    _addDockerAlternative(instructions, dependency) {
        if (dependency.type === 'tool') {
            instructions.alternativeOptions.push(`Use Docker container with ${dependency.name} pre-installed`);
        }
    }
    
    /**
     * Generate bulk install command for multiple packages
     * @param {Object} packageManager - Package manager configuration
     * @param {Array<string>} packages - List of packages
     * @returns {string} Bulk install command
     * @private
     */
    _generateBulkInstallCommand(packageManager, packages) {
        const packageList = packages.join(' ');
        return packageManager.install.replace('{package}', packageList);
    }
    
    /**
     * Generate upgrade command for a specific package
     * @param {Object} packageManager - Package manager configuration
     * @param {string} packageName - Package to upgrade
     * @param {string} platform - Target platform
     * @returns {string} Upgrade command
     * @private
     */
    _generateUpgradeCommand(packageManager, packageName, platform) {
        const resolvedName = this.packageManagerService.getPackageName(packageName, packageManager.name, platform);
        
        // Map package manager to upgrade commands
        const upgradeCommands = {
            'apt': `sudo apt-get update && sudo apt-get upgrade ${resolvedName}`,
            'yum': `sudo yum update ${resolvedName}`,
            'dnf': `sudo dnf update ${resolvedName}`,
            'pacman': `sudo pacman -S ${resolvedName}`,
            'brew': `brew upgrade ${resolvedName}`,
            'chocolatey': `choco upgrade ${resolvedName}`,
            'winget': `winget upgrade ${resolvedName}`,
            'npm': `npm update -g ${resolvedName}`,
            'yarn': `yarn global upgrade ${resolvedName}`,
            'pnpm': `pnpm update -g ${resolvedName}`
        };
        
        return upgradeCommands[packageManager.name] || null;
    }
    
    
    /**
     * Get package manager description
     * @param {string} packageManagerName - Package manager name
     * @returns {string} Description
     * @private
     */
    _getPackageManagerDescription(packageManagerName) {
        const descriptions = {
            'apt': 'Advanced Package Tool - Debian/Ubuntu package manager',
            'yum': 'Yellowdog Updater Modified - Red Hat package manager',
            'dnf': 'Dandified YUM - Modern Red Hat package manager',
            'pacman': 'Package Manager - Arch Linux package manager',
            'brew': 'Homebrew - macOS package manager',
            'chocolatey': 'Chocolatey - Windows package manager',
            'winget': 'Windows Package Manager - Microsoft package manager',
            'npm': 'Node Package Manager - JavaScript package manager',
            'yarn': 'Yarn - Fast JavaScript package manager',
            'pnpm': 'pnpm - Efficient JavaScript package manager'
        };
        return descriptions[packageManagerName] || `${packageManagerName} package manager`;
    }
    
    /**
     * Get package manager installation URL
     * @param {string} packageManagerName - Package manager name
     * @param {string} platform - Target platform
     * @returns {string} Installation URL
     * @private
     */
    _getPackageManagerInstallUrl(packageManagerName, platform) {
        const installUrls = {
            'brew': 'https://brew.sh/',
            'chocolatey': 'https://chocolatey.org/install',
            'winget': 'https://docs.microsoft.com/en-us/windows/package-manager/winget/',
            'npm': 'https://nodejs.org/en/download/',
            'yarn': 'https://yarnpkg.com/getting-started/install',
            'pnpm': 'https://pnpm.io/installation'
        };
        return installUrls[packageManagerName] || null;
    }
}

module.exports = InstallationInstructionGenerator;