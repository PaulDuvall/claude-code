/**
 * Platform Instruction Service
 * Handles platform-specific installation instructions
 */

const { DOWNLOAD_LINKS, PACKAGE_MANAGERS } = require('../config/constants');

class PlatformInstructionService {
    constructor() {
        this.downloadLinks = DOWNLOAD_LINKS;
        this.packageManagers = PACKAGE_MANAGERS;
    }

    /**
     * Generate platform-specific installation instructions
     * @param {string} platform - Target platform
     * @param {Object} dependency - Dependency information
     * @returns {Object} Platform-specific instructions
     */
    generatePlatformInstructions(platform, dependency) {
        const instructions = this._initializePlatformInstructions(platform);
        
        this._addPlatformPackageManagers(instructions, platform, dependency);
        this._setDefaultPackageManager(instructions, platform);
        this._addPlatformSpecificNotes(instructions, platform, dependency);
        
        return instructions;
    }

    /**
     * Initialize platform-specific instruction structure
     * @param {string} platform - Target platform
     * @returns {Object} Initialized instructions
     * @private
     */
    _initializePlatformInstructions(platform) {
        return {
            platform,
            packageManagerOptions: [],
            downloadLinks: this._getPlatformDownloadLinks(platform),
            notes: [],
            troubleshooting: []
        };
    }

    /**
     * Get download links for platform
     * @param {string} platform - Target platform
     * @returns {Object} Platform download links
     * @private
     */
    _getPlatformDownloadLinks(platform) {
        const links = {};
        
        Object.keys(this.downloadLinks).forEach(tool => {
            if (this.downloadLinks[tool][platform]) {
                links[tool] = this.downloadLinks[tool][platform];
            } else if (this.downloadLinks[tool].all) {
                links[tool] = this.downloadLinks[tool].all;
            }
        });
        
        return links;
    }

    /**
     * Add platform-specific package managers
     * @param {Object} instructions - Instructions object to modify
     * @param {string} platform - Target platform
     * @param {Object} dependency - Dependency information
     * @private
     */
    _addPlatformPackageManagers(instructions, platform, dependency) {
        const availableManagers = this._getAvailablePackageManagers(platform);
        
        availableManagers.forEach(manager => {
            const managerInfo = this.packageManagers[manager];
            if (this._isManagerSupportedOnPlatform(manager, platform)) {
                instructions.packageManagerOptions.push({
                    name: managerInfo.name,
                    command: this._buildInstallCommand(managerInfo, dependency),
                    checkCommand: managerInfo.checkCommand,
                    installUrl: managerInfo.installUrl,
                    global: dependency.global || false
                });
            }
        });
    }

    /**
     * Get available package managers for platform
     * @param {string} platform - Target platform
     * @returns {Array} Available package managers
     * @private
     */
    _getAvailablePackageManagers(platform) {
        const platformManagers = {
            linux: ['npm', 'yarn', 'pnpm', 'apt', 'yum'],
            darwin: ['npm', 'yarn', 'pnpm', 'brew'],
            win32: ['npm', 'yarn', 'pnpm', 'chocolatey', 'winget']
        };
        
        return platformManagers[platform] || ['npm', 'yarn', 'pnpm'];
    }

    /**
     * Check if package manager is supported on platform
     * @param {string} manager - Package manager name
     * @param {string} platform - Target platform
     * @returns {boolean} Is supported
     * @private
     */
    _isManagerSupportedOnPlatform(manager, platform) {
        const managerInfo = this.packageManagers[manager];
        if (!managerInfo) return false;
        
        if (managerInfo.platforms) {
            return managerInfo.platforms.includes(platform);
        }
        
        return true; // Universal managers like npm
    }

    /**
     * Build installation command for dependency
     * @param {Object} managerInfo - Package manager information
     * @param {Object} dependency - Dependency information
     * @returns {string} Installation command
     * @private
     */
    _buildInstallCommand(managerInfo, dependency) {
        const baseCommand = dependency.global ? managerInfo.globalInstall : managerInfo.install;
        const packageName = dependency.packageName || dependency.name;
        const version = dependency.version ? `@${dependency.version}` : '';
        
        return `${baseCommand} ${packageName}${version}`;
    }

    /**
     * Set default package manager based on platform
     * @param {Object} instructions - Instructions object to modify
     * @param {string} platform - Target platform
     * @private
     */
    _setDefaultPackageManager(instructions, platform) {
        if (instructions.packageManagerOptions.length === 0) return;
        
        const platformDefaults = {
            linux: 'apt',
            darwin: 'brew',
            win32: 'npm'
        };
        
        const defaultManager = platformDefaults[platform] || 'npm';
        const defaultOption = instructions.packageManagerOptions.find(opt => 
            opt.name.toLowerCase() === defaultManager
        ) || instructions.packageManagerOptions[0];
        
        if (defaultOption) {
            defaultOption.default = true;
        }
    }

    /**
     * Add platform-specific notes and warnings
     * @param {Object} instructions - Instructions object to modify
     * @param {string} platform - Target platform
     * @param {Object} dependency - Dependency information
     * @private
     */
    _addPlatformSpecificNotes(instructions, platform, dependency) {
        switch (platform) {
            case 'linux':
                instructions.notes.push('You may need to use sudo for system-wide installations');
                if (dependency.name === 'node') {
                    instructions.notes.push('Consider using a Node version manager like nvm');
                }
                break;
                
            case 'darwin':
                instructions.notes.push('Homebrew is the recommended package manager for macOS');
                if (dependency.name === 'python') {
                    instructions.notes.push('macOS comes with Python 2.7, but Python 3+ is recommended');
                }
                break;
                
            case 'win32':
                instructions.notes.push('Run PowerShell or Command Prompt as Administrator if needed');
                instructions.notes.push('Windows Subsystem for Linux (WSL) may provide better compatibility');
                break;
        }

        // Add dependency-specific notes
        this._addDependencySpecificNotes(instructions, dependency);
    }

    /**
     * Add dependency-specific notes
     * @param {Object} instructions - Instructions object to modify
     * @param {Object} dependency - Dependency information
     * @private
     */
    _addDependencySpecificNotes(instructions, dependency) {
        switch (dependency.name) {
            case 'git':
                instructions.notes.push('Git is required for version control operations');
                instructions.troubleshooting.push('If git command not found, add Git to your system PATH');
                break;
                
            case 'node':
                instructions.notes.push('Node.js includes npm package manager');
                instructions.troubleshooting.push('Use "node --version" to verify installation');
                break;
                
            case 'python':
                instructions.notes.push('Python 3.8+ is recommended for modern development');
                instructions.troubleshooting.push('Use "python3" instead of "python" on some systems');
                break;
                
            case 'docker':
                instructions.notes.push('Docker requires system virtualization to be enabled');
                instructions.troubleshooting.push('Restart your system after Docker installation');
                break;
        }
    }

    /**
     * Generate troubleshooting guide for platform
     * @param {string} platform - Target platform
     * @param {string} dependencyName - Dependency that failed
     * @returns {Array} Troubleshooting steps
     */
    generateTroubleshootingGuide(platform, dependencyName) {
        const guide = [];
        
        // Platform-specific troubleshooting
        switch (platform) {
            case 'linux':
                guide.push('Check if dependency is available in your distribution\'s package repository');
                guide.push('Update package lists: sudo apt update (Ubuntu/Debian) or sudo yum update (RHEL/CentOS)');
                guide.push('Verify PATH environment variable includes installation directory');
                break;
                
            case 'darwin':
                guide.push('Install Xcode Command Line Tools: xcode-select --install');
                guide.push('Update Homebrew: brew update && brew upgrade');
                guide.push('Check for conflicting installations in /usr/local/bin');
                break;
                
            case 'win32':
                guide.push('Run installation as Administrator');
                guide.push('Disable Windows Defender temporarily during installation');
                guide.push('Check Windows PATH environment variable');
                guide.push('Consider using Windows Subsystem for Linux (WSL)');
                break;
        }
        
        // Dependency-specific troubleshooting
        guide.push(...this._getDependencyTroubleshooting(dependencyName));
        
        return guide;
    }

    /**
     * Get dependency-specific troubleshooting steps
     * @param {string} dependencyName - Name of the dependency
     * @returns {Array} Troubleshooting steps
     * @private
     */
    _getDependencyTroubleshooting(dependencyName) {
        const troubleshooting = {
            git: [
                'Download from official Git website if package manager fails',
                'Configure Git after installation: git config --global user.name "Your Name"'
            ],
            node: [
                'Use Node Version Manager (nvm) for easier version management',
                'Clear npm cache: npm cache clean --force'
            ],
            python: [
                'Use pyenv for Python version management',
                'Install pip separately if not included: python -m ensurepip --upgrade'
            ],
            docker: [
                'Enable Hyper-V on Windows or ensure virtualization is enabled in BIOS',
                'Join docker group on Linux: sudo usermod -aG docker $USER'
            ]
        };
        
        return troubleshooting[dependencyName] || [];
    }
}

module.exports = PlatformInstructionService;