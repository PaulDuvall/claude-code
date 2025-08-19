/**
 * Installation Instruction Generator
 * 
 * Generates platform-specific installation instructions and recovery guidance.
 * Extracted from DependencyValidator as part of Phase 1 bloater refactoring.
 * 
 * Features:
 * - Cross-platform installation instructions
 * - Package manager integration
 * - Download link management
 * - Alternative installation methods
 * - Recovery and troubleshooting guidance
 */

const PackageManagerService = require('./package-manager-service');
const PlatformUtils = require('./platform-utils');

class InstallationInstructionGenerator {
    constructor() {
        this.packageManagerService = new PackageManagerService();
        this.platformUtils = new PlatformUtils();
        this.config = {
            downloadLinks: this._createDownloadLinks()
        };
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
        const context = this._createInstructionContext(dependency, platform);
        const instructions = this._initializeInstructions(platform);
        
        this._addPlatformPackageManagers(instructions, context);
        this._setDefaultPackageManager(instructions);
        this._handleNpmPackageSpecific(instructions, context);
        this._addAlternativeInstallationMethods(instructions, dependency, platform);

        return instructions;
    }
    
    /**
     * Generate recovery suggestions for failed dependencies
     * @param {Object} failedDependency - Dependency that failed validation
     * @returns {Object} Recovery suggestions
     */
    generateRecoverySuggestions(failedDependency) {
        const suggestions = {
            immediate: [],
            alternative: [],
            troubleshooting: []
        };

        if (failedDependency.error) {
            switch (failedDependency.error.code) {
                case 'NOT_FOUND':
                    suggestions.immediate.push(`Try: Install ${failedDependency.name} using your package manager`);
                    suggestions.immediate.push(`Solution: Add ${failedDependency.name} to your system PATH`);
                    suggestions.alternative.push(`Use portable version of ${failedDependency.name}`);
                    suggestions.alternative.push(`Install via different package manager`);
                    break;
                    
                case 'VERSION_MISMATCH':
                    suggestions.immediate.push(`Try: Update ${failedDependency.name} to newer version`);
                    suggestions.immediate.push(`Solution: Use version manager to install required version`);
                    suggestions.alternative.push(`Install specific version manually`);
                    break;
                    
                default:
                    suggestions.immediate.push(`Try: Reinstall ${failedDependency.name}`);
                    suggestions.immediate.push(`Solution: Check system configuration`);
            }
        }

        // Add general troubleshooting guidance
        suggestions.troubleshooting = [
            'Next steps for troubleshooting: Check system logs and package manager status',
            'Verify internet connectivity for downloads',
            'Try running commands with elevated privileges',
            'Check for conflicting software installations'
        ];

        return suggestions;
    }
    
    /**
     * Generate installation instructions for multiple dependencies
     * @param {Array} dependencies - List of dependencies to install
     * @param {string} platform - Target platform
     * @returns {Object} Batch installation instructions
     */
    generateBatchInstallationInstructions(dependencies, platform = process.platform) {
        const batchInstructions = {
            platform: platform,
            dependencies: dependencies.map(dep => dep.name),
            packageManagerOptions: [],
            bulkCommands: [],
            individualInstructions: []
        };
        
        // Generate individual instructions
        for (const dependency of dependencies) {
            const individualInstructions = this.generateInstallationInstructions(dependency, platform);
            batchInstructions.individualInstructions.push({
                dependency: dependency.name,
                instructions: individualInstructions
            });
        }
        
        // Generate bulk installation commands
        const packageManagers = this.packageManagerService.getPackageManagersForPlatform(platform);
        for (const pm of packageManagers) {
            const packages = dependencies.map(dep => 
                this.packageManagerService.getPackageName(dep.name, pm.name, platform)
            );
            
            if (packages.length > 0) {
                const bulkCommand = this._generateBulkInstallCommand(pm, packages);
                batchInstructions.bulkCommands.push({
                    packageManager: pm.name,
                    command: bulkCommand,
                    packages: packages
                });
            }
        }
        
        return batchInstructions;
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