/**
 * Package Manager Service
 * 
 * Handles cross-platform package manager operations and configurations.
 * Extracted from DependencyValidator as part of Phase 1 bloater refactoring.
 * 
 * Features:
 * - Multi-platform package manager support
 * - Package name mapping across different managers
 * - Command generation for install/check operations
 * - Platform-specific package manager detection
 */

const { execSync } = require('child_process');
const PlatformUtils = require('./platform-utils');

class PackageManagerService {
    constructor() {
        this.platformUtils = new PlatformUtils();
        this.config = {
            packageManagers: this._createPackageManagersConfig(),
            dependencyMappings: this._createDependencyMappings()
        };
    }
    
    /**
     * Create package managers configuration by platform
     * @returns {Object} Package managers by platform
     * @private
     */
    _createPackageManagersConfig() {
        return {
            linux: [
                { name: 'apt', install: 'sudo apt-get install {package}', check: 'dpkg -l {package}' },
                { name: 'yum', install: 'sudo yum install {package}', check: 'rpm -q {package}' },
                { name: 'dnf', install: 'sudo dnf install {package}', check: 'rpm -q {package}' },
                { name: 'pacman', install: 'sudo pacman -S {package}', check: 'pacman -Q {package}' },
                { name: 'snap', install: 'sudo snap install {package}', check: 'snap list {package}' }
            ],
            darwin: [
                { name: 'brew', install: 'brew install {package}', check: 'brew list {package}' },
                { name: 'port', install: 'sudo port install {package}', check: 'port installed {package}' },
                { name: 'npm', install: 'npm install -g {package}', check: 'npm list -g {package}' }
            ],
            win32: [
                { name: 'chocolatey', install: 'choco install {package}', check: 'choco list --local-only {package}' },
                { name: 'winget', install: 'winget install {package}', check: 'winget list {package}' },
                { name: 'npm', install: 'npm install -g {package}', check: 'npm list -g {package}' },
                { name: 'scoop', install: 'scoop install {package}', check: 'scoop list {package}' }
            ]
        };
    }
    
    /**
     * Create dependency mappings for package managers
     * @returns {Object} Dependency mappings by tool and platform
     * @private
     */
    _createDependencyMappings() {
        return {
            git: {
                linux: { apt: 'git', yum: 'git', dnf: 'git', pacman: 'git' },
                darwin: { brew: 'git' },
                win32: { chocolatey: 'git', winget: 'Git.Git' }
            },
            python: {
                linux: { apt: 'python3', yum: 'python3', dnf: 'python3' },
                darwin: { brew: 'python@3.11' },
                win32: { chocolatey: 'python', winget: 'Python.Python.3' }
            },
            docker: {
                linux: { apt: 'docker.io', snap: 'docker' },
                darwin: { brew: 'docker' },
                win32: { chocolatey: 'docker-desktop' }
            }
        };
    }
    
    /**
     * Get package managers for a specific platform
     * @param {string} platform - Platform identifier (optional, defaults to current)
     * @returns {Array<Object>} List of package managers for the platform
     */
    getPackageManagersForPlatform(platform = this.platformUtils.getCurrentPlatform()) {
        return this.config.packageManagers[platform] || [];
    }
    
    /**
     * Get package name for a specific dependency and package manager
     * @param {string} dependencyName - Name of the dependency
     * @param {string} packageManagerName - Name of the package manager
     * @param {string} platform - Platform identifier (optional, defaults to current)
     * @returns {string} Mapped package name or original dependency name
     */
    getPackageName(dependencyName, packageManagerName, platform = this.platformUtils.getCurrentPlatform()) {
        const dependencyMapping = this.config.dependencyMappings[dependencyName];
        
        if (dependencyMapping && dependencyMapping[platform] && dependencyMapping[platform][packageManagerName]) {
            return dependencyMapping[platform][packageManagerName];
        }
        
        return dependencyName;
    }
    
    /**
     * Generate install command for a package
     * @param {string} dependencyName - Name of the dependency
     * @param {string} packageManagerName - Name of the package manager
     * @param {string} platform - Platform identifier (optional, defaults to current)
     * @returns {string|null} Install command or null if package manager not found
     */
    generateInstallCommand(dependencyName, packageManagerName, platform = this.platformUtils.getCurrentPlatform()) {
        const packageManagers = this.getPackageManagersForPlatform(platform);
        const packageManager = packageManagers.find(pm => pm.name === packageManagerName);
        
        if (!packageManager) {
            return null;
        }
        
        const packageName = this.getPackageName(dependencyName, packageManagerName, platform);
        return packageManager.install.replace('{package}', packageName);
    }
    
    /**
     * Generate check command for a package
     * @param {string} dependencyName - Name of the dependency
     * @param {string} packageManagerName - Name of the package manager
     * @param {string} platform - Platform identifier (optional, defaults to current)
     * @returns {string|null} Check command or null if package manager not found
     */
    generateCheckCommand(dependencyName, packageManagerName, platform = this.platformUtils.getCurrentPlatform()) {
        const packageManagers = this.getPackageManagersForPlatform(platform);
        const packageManager = packageManagers.find(pm => pm.name === packageManagerName);
        
        if (!packageManager) {
            return null;
        }
        
        const packageName = this.getPackageName(dependencyName, packageManagerName, platform);
        return packageManager.check.replace('{package}', packageName);
    }
    
    /**
     * Check if a package manager is available on the system
     * @param {string} packageManagerName - Name of the package manager
     * @returns {boolean} True if package manager is available
     */
    isPackageManagerAvailable(packageManagerName) {
        try {
            const command = this.platformUtils.getPathCommand();
            execSync(`${command} ${packageManagerName}`, {
                encoding: 'utf8',
                timeout: 3000,
                stdio: 'pipe'
            });
            return true;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Get available package managers for the current platform
     * @param {string} platform - Platform identifier (optional, defaults to current)
     * @returns {Array<Object>} List of available package managers
     */
    getAvailablePackageManagers(platform = this.platformUtils.getCurrentPlatform()) {
        const allManagers = this.getPackageManagersForPlatform(platform);
        return allManagers.filter(pm => this.isPackageManagerAvailable(pm.name));
    }
    
    /**
     * Get the best available package manager for a platform
     * @param {string} platform - Platform identifier (optional, defaults to current)
     * @returns {Object|null} Best available package manager or null
     */
    getBestAvailablePackageManager(platform = this.platformUtils.getCurrentPlatform()) {
        const availableManagers = this.getAvailablePackageManagers(platform);
        
        // Return the first available manager (they're ordered by preference)
        return availableManagers.length > 0 ? availableManagers[0] : null;
    }
    
    /**
     * Generate package manager options for installation instructions
     * @param {string} dependencyName - Name of the dependency
     * @param {string} platform - Platform identifier (optional, defaults to current)
     * @returns {Array<Object>} List of package manager options
     */
    generatePackageManagerOptions(dependencyName, platform = this.platformUtils.getCurrentPlatform()) {
        const packageManagers = this.getPackageManagersForPlatform(platform);
        const options = [];
        
        for (const pm of packageManagers) {
            const packageName = this.getPackageName(dependencyName, pm.name, platform);
            const installCommand = pm.install.replace('{package}', packageName);
            const checkCommand = pm.check.replace('{package}', packageName);
            
            options.push({
                name: pm.name,
                command: installCommand,
                check: checkCommand,
                packageName: packageName,
                available: this.isPackageManagerAvailable(pm.name)
            });
        }
        
        return options;
    }
    
    /**
     * Check if a specific package is installed
     * @param {string} dependencyName - Name of the dependency
     * @param {string} packageManagerName - Name of the package manager
     * @param {string} platform - Platform identifier (optional, defaults to current)
     * @returns {boolean} True if package is installed
     */
    isPackageInstalled(dependencyName, packageManagerName, platform = this.platformUtils.getCurrentPlatform()) {
        const checkCommand = this.generateCheckCommand(dependencyName, packageManagerName, platform);
        
        if (!checkCommand) {
            return false;
        }
        
        try {
            execSync(checkCommand, {
                encoding: 'utf8',
                timeout: 5000,
                stdio: 'pipe'
            });
            return true;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Execute a package manager command safely
     * @param {string} command - Command to execute
     * @param {Object} options - Execution options
     * @returns {Object} Execution result
     */
    executePackageManagerCommand(command, options = {}) {
        const defaultOptions = {
            encoding: 'utf8',
            timeout: 30000, // 30 seconds for package operations
            stdio: 'pipe'
        };
        
        const execOptions = { ...defaultOptions, ...options };
        
        try {
            const output = execSync(command, execOptions);
            return {
                success: true,
                output: output.toString(),
                command: command
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                command: command,
                exitCode: error.status
            };
        }
    }
}

module.exports = PackageManagerService;