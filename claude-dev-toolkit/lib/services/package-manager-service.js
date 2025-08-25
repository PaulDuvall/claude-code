/**
 * Package Manager Service
 * Handles package manager detection, validation, and instruction generation
 */

const { execSync } = require('child_process');
const { PACKAGE_MANAGERS } = require('../config/constants');

class PackageManagerService {
    constructor() {
        this.packageManagers = PACKAGE_MANAGERS;
        this.detectedManagers = null;
    }

    /**
     * Detect available package managers on the system
     * @returns {Array} Available package managers
     */
    detectAvailablePackageManagers() {
        if (this.detectedManagers) {
            return this.detectedManagers;
        }

        const available = [];
        
        Object.keys(this.packageManagers).forEach(manager => {
            if (this.isPackageManagerAvailable(manager)) {
                const managerInfo = this.packageManagers[manager];
                available.push({
                    name: manager,
                    displayName: managerInfo.name,
                    version: this.getPackageManagerVersion(manager),
                    installCommand: managerInfo.install,
                    globalInstallCommand: managerInfo.globalInstall,
                    updateCommand: managerInfo.update
                });
            }
        });

        this.detectedManagers = available;
        return available;
    }

    /**
     * Check if a package manager is available on the system
     * @param {string} manager - Package manager name
     * @returns {boolean} Is available
     */
    isPackageManagerAvailable(manager) {
        const managerInfo = this.packageManagers[manager];
        if (!managerInfo || !managerInfo.checkCommand) {
            return false;
        }

        // Check platform compatibility
        if (managerInfo.platforms && !managerInfo.platforms.includes(process.platform)) {
            return false;
        }

        try {
            execSync(managerInfo.checkCommand, { 
                stdio: 'pipe', 
                timeout: 5000,
                encoding: 'utf8'
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get version of a package manager
     * @param {string} manager - Package manager name
     * @returns {string|null} Version string or null if not available
     */
    getPackageManagerVersion(manager) {
        const managerInfo = this.packageManagers[manager];
        if (!managerInfo || !managerInfo.checkCommand) {
            return null;
        }

        try {
            const output = execSync(managerInfo.checkCommand, { 
                stdio: 'pipe', 
                timeout: 5000,
                encoding: 'utf8'
            });
            return output.trim();
        } catch (error) {
            return null;
        }
    }

    /**
     * Get recommended package manager for platform
     * @param {string} platform - Target platform
     * @returns {string} Recommended package manager name
     */
    getRecommendedPackageManager(platform = process.platform) {
        const platformRecommendations = {
            linux: 'apt',
            darwin: 'brew',
            win32: 'npm'
        };

        const recommended = platformRecommendations[platform] || 'npm';
        
        // Check if recommended manager is available
        if (this.isPackageManagerAvailable(recommended)) {
            return recommended;
        }

        // Fall back to any available manager
        const available = this.detectAvailablePackageManagers();
        return available.length > 0 ? available[0].name : 'npm';
    }

    /**
     * Generate installation instructions for multiple package managers
     * @param {string} packageName - Package to install
     * @param {Object} options - Installation options
     * @returns {Array} Installation instructions for different package managers
     */
    generateInstallationInstructions(packageName, options = {}) {
        const instructions = [];
        const availableManagers = this.detectAvailablePackageManagers();
        
        if (availableManagers.length === 0) {
            return [{
                manager: 'none',
                error: 'No package managers detected on this system',
                installUrl: this.packageManagers.npm.installUrl
            }];
        }

        availableManagers.forEach(manager => {
            const instruction = this._generateManagerInstruction(manager, packageName, options);
            if (instruction) {
                instructions.push(instruction);
            }
        });

        // Sort by recommendation (recommended first)
        const recommended = this.getRecommendedPackageManager();
        instructions.sort((a, b) => {
            if (a.manager === recommended) return -1;
            if (b.manager === recommended) return 1;
            return 0;
        });

        return instructions;
    }

    /**
     * Generate instruction for specific package manager
     * @param {Object} manager - Manager information
     * @param {string} packageName - Package to install
     * @param {Object} options - Installation options
     * @returns {Object} Installation instruction
     * @private
     */
    _generateManagerInstruction(manager, packageName, options) {
        const command = options.global ? 
            manager.globalInstallCommand || manager.installCommand : 
            manager.installCommand;

        const version = options.version ? `@${options.version}` : '';
        const fullPackageName = `${packageName}${version}`;
        
        return {
            manager: manager.name,
            displayName: manager.displayName,
            command: `${command} ${fullPackageName}`,
            version: manager.version,
            global: options.global || false,
            recommended: manager.name === this.getRecommendedPackageManager(),
            notes: this._getManagerSpecificNotes(manager.name, options)
        };
    }

    /**
     * Get manager-specific installation notes
     * @param {string} managerName - Package manager name
     * @param {Object} options - Installation options
     * @returns {Array} Installation notes
     * @private
     */
    _getManagerSpecificNotes(managerName, options) {
        const notes = [];
        
        switch (managerName) {
            case 'npm':
                if (options.global) {
                    notes.push('Global installation may require administrator privileges');
                }
                notes.push('Use "npm list" to verify installation');
                break;
                
            case 'yarn':
                if (options.global) {
                    notes.push('Yarn global installation location may not be in PATH');
                }
                notes.push('Yarn provides faster and more reliable dependency resolution');
                break;
                
            case 'pnpm':
                notes.push('pnpm saves disk space by using a content-addressable store');
                if (options.global) {
                    notes.push('pnpm global packages are stored in a separate location');
                }
                break;
                
            case 'brew':
                notes.push('Homebrew automatically handles dependencies');
                notes.push('Update Homebrew regularly: brew update && brew upgrade');
                break;
                
            case 'apt':
                notes.push('May require "sudo" for system-wide installation');
                notes.push('Update package lists first: sudo apt update');
                break;
                
            case 'chocolatey':
                notes.push('Run PowerShell as Administrator');
                notes.push('Chocolatey packages are community maintained');
                break;
                
            case 'winget':
                notes.push('winget is the official Windows package manager');
                notes.push('Available on Windows 10 1709+ and Windows 11');
                break;
        }
        
        return notes;
    }

    /**
     * Validate package manager installation
     * @param {string} manager - Package manager name
     * @returns {Object} Validation result
     */
    validatePackageManager(manager) {
        const managerInfo = this.packageManagers[manager];
        
        if (!managerInfo) {
            return {
                valid: false,
                error: `Unknown package manager: ${manager}`,
                suggestions: ['Use npm, yarn, or pnpm for Node.js packages']
            };
        }

        // Check platform compatibility
        if (managerInfo.platforms && !managerInfo.platforms.includes(process.platform)) {
            return {
                valid: false,
                error: `${managerInfo.name} is not available on ${process.platform}`,
                suggestions: [
                    `Try ${this.getRecommendedPackageManager()} instead`,
                    `Install ${managerInfo.name} from ${managerInfo.installUrl || 'official website'}`
                ]
            };
        }

        // Check if manager is available
        if (!this.isPackageManagerAvailable(manager)) {
            return {
                valid: false,
                error: `${managerInfo.name} is not installed or not in PATH`,
                installUrl: managerInfo.installUrl,
                suggestions: [
                    `Install ${managerInfo.name} from ${managerInfo.installUrl || 'official website'}`,
                    `Add ${managerInfo.name} to your system PATH`,
                    `Use alternative package manager: ${this.getRecommendedPackageManager()}`
                ]
            };
        }

        return {
            valid: true,
            manager: managerInfo.name,
            version: this.getPackageManagerVersion(manager),
            commands: {
                install: managerInfo.install,
                globalInstall: managerInfo.globalInstall,
                update: managerInfo.update
            }
        };
    }

    /**
     * Get installation command for specific package and manager
     * @param {string} manager - Package manager name
     * @param {string} packageName - Package to install
     * @param {Object} options - Installation options
     * @returns {string|null} Installation command
     */
    getInstallCommand(manager, packageName, options = {}) {
        const managerInfo = this.packageManagers[manager];
        if (!managerInfo) return null;

        const baseCommand = options.global ? 
            managerInfo.globalInstall || managerInfo.install : 
            managerInfo.install;

        const version = options.version ? `@${options.version}` : '';
        return `${baseCommand} ${packageName}${version}`;
    }

    /**
     * Clear detected managers cache
     */
    clearCache() {
        this.detectedManagers = null;
    }
}

module.exports = PackageManagerService;