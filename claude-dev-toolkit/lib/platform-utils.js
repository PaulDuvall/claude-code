/**
 * Platform Utilities
 * 
 * Shared platform detection and handling utilities to eliminate duplication
 * across DependencyValidator and PermissionErrorHandler classes.
 * 
 * Features:
 * - Platform detection and normalization
 * - Platform-specific command resolution
 * - System path detection
 * - Cross-platform compatibility helpers
 */

const os = require('os');

class PlatformUtils {
    constructor() {
        this.config = {
            platforms: {
                WIN32: 'win32',
                DARWIN: 'darwin', 
                LINUX: 'linux'
            },
            systemDirectories: this._initializeSystemDirectories(),
            commandLookup: this._initializeCommandLookup()
        };
    }
    
    /**
     * Initialize system directories by platform
     * @returns {Object} System directories configuration
     * @private
     */
    _initializeSystemDirectories() {
        return {
            unix: [
                '/usr', '/usr/local', '/usr/bin', '/usr/local/bin',
                '/etc', '/opt', '/var', '/System', '/Applications'
            ],
            windows: [
                'C:\\Program Files', 'C:\\Windows', 'C:\\ProgramData',
                'C:\\Program Files (x86)'
            ]
        };
    }
    
    /**
     * Initialize command lookup utilities
     * @returns {Object} Command lookup configuration
     * @private
     */
    _initializeCommandLookup() {
        return {
            pathCommand: {
                win32: 'where',
                unix: 'which'
            },
            elevationMethod: {
                win32: 'administrator',
                unix: 'sudo'
            }
        };
    }
    
    /**
     * Get current platform
     * @returns {string} Current platform identifier
     */
    getCurrentPlatform() {
        return process.platform;
    }
    
    /**
     * Check if current platform is Windows
     * @returns {boolean} True if Windows
     */
    isWindows() {
        return this.getCurrentPlatform() === this.config.platforms.WIN32;
    }
    
    /**
     * Check if current platform is macOS
     * @returns {boolean} True if macOS  
     */
    isDarwin() {
        return this.getCurrentPlatform() === this.config.platforms.DARWIN;
    }
    
    /**
     * Check if current platform is Linux
     * @returns {boolean} True if Linux
     */
    isLinux() {
        return this.getCurrentPlatform() === this.config.platforms.LINUX;
    }
    
    /**
     * Check if current platform is Unix-like (Linux or macOS)
     * @returns {boolean} True if Unix-like
     */
    isUnix() {
        return this.isLinux() || this.isDarwin();
    }
    
    /**
     * Get platform category (windows or unix)
     * @param {string} platform - Platform identifier (optional, defaults to current)
     * @returns {string} Platform category
     */
    getPlatformCategory(platform = this.getCurrentPlatform()) {
        return platform === this.config.platforms.WIN32 ? 'windows' : 'unix';
    }
    
    /**
     * Get system directories for platform
     * @param {string} platform - Platform identifier (optional, defaults to current)
     * @returns {Array<string>} System directories
     */
    getSystemDirectories(platform = this.getCurrentPlatform()) {
        const category = this.getPlatformCategory(platform);
        return this.config.systemDirectories[category] || [];
    }
    
    /**
     * Check if path is a system-level path
     * @param {string} path - Path to check
     * @param {string} platform - Platform identifier (optional, defaults to current)
     * @returns {boolean} True if system path
     */
    isSystemPath(path, platform = this.getCurrentPlatform()) {
        if (!path) return false;
        
        const systemDirs = this.getSystemDirectories(platform);
        return systemDirs.some(sysDir => path.startsWith(sysDir));
    }
    
    /**
     * Check if path is a user-level path
     * @param {string} path - Path to check
     * @returns {boolean} True if user path
     */
    isUserPath(path) {
        if (!path) return false;
        
        const homeDir = os.homedir();
        return path.startsWith(homeDir);
    }
    
    /**
     * Get appropriate command for finding executable paths
     * @param {string} platform - Platform identifier (optional, defaults to current)
     * @returns {string} Path command (where/which)
     */
    getPathCommand(platform = this.getCurrentPlatform()) {
        return platform === this.config.platforms.WIN32 ? 
            this.config.commandLookup.pathCommand.win32 : 
            this.config.commandLookup.pathCommand.unix;
    }
    
    /**
     * Get appropriate elevation method
     * @param {string} platform - Platform identifier (optional, defaults to current)
     * @returns {string} Elevation method (administrator/sudo)
     */
    getElevationMethod(platform = this.getCurrentPlatform()) {
        return platform === this.config.platforms.WIN32 ?
            this.config.commandLookup.elevationMethod.win32 :
            this.config.commandLookup.elevationMethod.unix;
    }
    
    /**
     * Get user home directory
     * @returns {string} Home directory path
     */
    getHomeDirectory() {
        return os.homedir();
    }
    
    /**
     * Get system temporary directory
     * @returns {string} Temporary directory path
     */
    getTempDirectory() {
        return os.tmpdir();
    }
    
    /**
     * Get system information
     * @returns {Object} System information object
     */
    getSystemInfo() {
        return {
            platform: this.getCurrentPlatform(),
            arch: process.arch,
            nodeVersion: process.version,
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            homeDir: this.getHomeDirectory(),
            tempDir: this.getTempDirectory(),
            platformCategory: this.getPlatformCategory()
        };
    }
    
    /**
     * Normalize platform-specific paths
     * @param {string} path - Path to normalize
     * @param {string} platform - Target platform (optional, defaults to current)
     * @returns {string} Normalized path
     */
    normalizePath(path, platform = this.getCurrentPlatform()) {
        if (!path) return path;
        
        if (platform === this.config.platforms.WIN32) {
            // Convert forward slashes to backslashes for Windows
            return path.replace(/\//g, '\\');
        } else {
            // Convert backslashes to forward slashes for Unix-like
            return path.replace(/\\/g, '/');
        }
    }
    
    /**
     * Create platform-specific context object
     * @param {string} platform - Platform identifier (optional, defaults to current)
     * @returns {Object} Platform context
     */
    createPlatformContext(platform = this.getCurrentPlatform()) {
        return {
            platform,
            category: this.getPlatformCategory(platform),
            isWindows: platform === this.config.platforms.WIN32,
            isUnix: platform !== this.config.platforms.WIN32,
            systemDirectories: this.getSystemDirectories(platform),
            pathCommand: this.getPathCommand(platform),
            elevationMethod: this.getElevationMethod(platform),
            systemInfo: platform === this.getCurrentPlatform() ? this.getSystemInfo() : null
        };
    }
    
    /**
     * Get human-readable platform name
     * @param {string} platform - Platform identifier (optional, defaults to current)
     * @returns {string} Human-readable platform name
     */
    getPlatformName(platform = this.getCurrentPlatform()) {
        const names = {
            'win32': 'Windows',
            'darwin': 'macOS',
            'linux': 'Linux',
            'freebsd': 'FreeBSD',
            'openbsd': 'OpenBSD',
            'sunos': 'SunOS',
            'aix': 'AIX'
        };
        return names[platform] || platform;
    }
    
    /**
     * Get supported platforms list
     * @returns {Array<string>} List of supported platform identifiers
     */
    getSupportedPlatforms() {
        return [
            this.config.platforms.WIN32,
            this.config.platforms.DARWIN,
            this.config.platforms.LINUX
        ];
    }
    
    /**
     * Check if platform is supported
     * @param {string} platform - Platform identifier to check
     * @returns {boolean} True if platform is supported
     */
    isPlatformSupported(platform) {
        return this.getSupportedPlatforms().includes(platform);
    }
    
    /**
     * Get platform-specific configuration paths
     * @param {string} platform - Platform identifier (optional, defaults to current)
     * @returns {Object} Configuration paths for the platform
     */
    getPlatformConfigPaths(platform = this.getCurrentPlatform()) {
        const homeDir = this.getHomeDirectory();
        
        switch (platform) {
            case this.config.platforms.WIN32:
                return {
                    config: `${homeDir}\\AppData\\Roaming`,
                    localConfig: `${homeDir}\\AppData\\Local`,
                    cache: `${homeDir}\\AppData\\Local\\Temp`,
                    data: `${homeDir}\\AppData\\Roaming`
                };
            case this.config.platforms.DARWIN:
                return {
                    config: `${homeDir}/.config`,
                    localConfig: `${homeDir}/.config`,
                    cache: `${homeDir}/Library/Caches`,
                    data: `${homeDir}/Library/Application Support`
                };
            default: // Linux and other Unix-like
                return {
                    config: `${homeDir}/.config`,
                    localConfig: `${homeDir}/.config`,
                    cache: `${homeDir}/.cache`,
                    data: `${homeDir}/.local/share`
                };
        }
    }
    
    /**
     * Get platform-specific executable file extension
     * @param {string} platform - Platform identifier (optional, defaults to current)
     * @returns {string} Executable file extension (including dot)
     */
    getExecutableExtension(platform = this.getCurrentPlatform()) {
        return platform === this.config.platforms.WIN32 ? '.exe' : '';
    }
    
    /**
     * Get platform-specific shell executable
     * @param {string} platform - Platform identifier (optional, defaults to current)
     * @returns {string} Default shell executable name
     */
    getDefaultShell(platform = this.getCurrentPlatform()) {
        switch (platform) {
            case this.config.platforms.WIN32:
                return 'cmd.exe';
            case this.config.platforms.DARWIN:
                return 'zsh'; // Modern macOS default
            default:
                return 'bash'; // Most Linux distributions
        }
    }
    
    /**
     * Get platform-specific path separator
     * @param {string} platform - Platform identifier (optional, defaults to current)
     * @returns {string} Path separator character
     */
    getPathSeparator(platform = this.getCurrentPlatform()) {
        return platform === this.config.platforms.WIN32 ? '\\' : '/';
    }
    
    /**
     * Get platform-specific PATH environment variable separator
     * @param {string} platform - Platform identifier (optional, defaults to current)
     * @returns {string} PATH separator character
     */
    getPathEnvSeparator(platform = this.getCurrentPlatform()) {
        return platform === this.config.platforms.WIN32 ? ';' : ':';
    }
    
    /**
     * Get platform-specific line ending
     * @param {string} platform - Platform identifier (optional, defaults to current)
     * @returns {string} Line ending characters
     */
    getLineEnding(platform = this.getCurrentPlatform()) {
        return platform === this.config.platforms.WIN32 ? '\r\n' : '\n';
    }
    
    /**
     * Get platform-specific package manager preference order
     * @param {string} platform - Platform identifier (optional, defaults to current)
     * @returns {Array<string>} Ordered list of preferred package managers
     */
    getPreferredPackageManagers(platform = this.getCurrentPlatform()) {
        switch (platform) {
            case this.config.platforms.WIN32:
                return ['winget', 'chocolatey', 'scoop', 'npm'];
            case this.config.platforms.DARWIN:
                return ['brew', 'port', 'npm'];
            case this.config.platforms.LINUX:
                return ['apt', 'dnf', 'yum', 'pacman', 'snap', 'npm'];
            default:
                return ['npm'];
        }
    }
    
    /**
     * Resolve platform-specific command
     * @param {string} command - Base command name
     * @param {string} platform - Platform identifier (optional, defaults to current)
     * @returns {string} Platform-specific command
     */
    resolveCommand(command, platform = this.getCurrentPlatform()) {
        // Special cases for platform-specific commands
        const commandMap = {
            'where': platform === this.config.platforms.WIN32 ? 'where' : 'which',
            'which': platform === this.config.platforms.WIN32 ? 'where' : 'which',
            'copy': platform === this.config.platforms.WIN32 ? 'copy' : 'cp',
            'move': platform === this.config.platforms.WIN32 ? 'move' : 'mv',
            'delete': platform === this.config.platforms.WIN32 ? 'del' : 'rm',
            'list': platform === this.config.platforms.WIN32 ? 'dir' : 'ls',
            'type': platform === this.config.platforms.WIN32 ? 'type' : 'cat'
        };
        
        return commandMap[command] || command + this.getExecutableExtension(platform);
    }
    
    /**
     * Check if path requires elevation/sudo access
     * @param {string} path - Path to check
     * @param {string} platform - Platform identifier (optional, defaults to current)
     * @returns {boolean} True if path requires elevation
     */
    requiresElevation(path, platform = this.getCurrentPlatform()) {
        if (!path) return false;
        
        // System paths generally require elevation
        if (this.isSystemPath(path, platform)) {
            return true;
        }
        
        // Platform-specific elevation requirements
        const elevationPaths = {
            [this.config.platforms.WIN32]: [
                'C:\\Windows', 'C:\\Program Files', 'C:\\Program Files (x86)'
            ],
            [this.config.platforms.DARWIN]: [
                '/usr', '/System', '/Library', '/Applications'
            ],
            [this.config.platforms.LINUX]: [
                '/usr', '/etc', '/opt', '/var', '/sys', '/proc'
            ]
        };
        
        const platformPaths = elevationPaths[platform] || [];
        return platformPaths.some(elevationPath => path.startsWith(elevationPath));
    }
    
    /**
     * Generate platform compatibility report
     * @param {Array<string>} requiredPlatforms - Platforms required for compatibility
     * @returns {Object} Platform compatibility report
     */
    generateCompatibilityReport(requiredPlatforms = []) {
        const currentPlatform = this.getCurrentPlatform();
        const supportedPlatforms = this.getSupportedPlatforms();
        
        return {
            current: {
                platform: currentPlatform,
                name: this.getPlatformName(currentPlatform),
                category: this.getPlatformCategory(currentPlatform),
                supported: this.isPlatformSupported(currentPlatform)
            },
            requirements: {
                platforms: requiredPlatforms,
                satisfied: requiredPlatforms.length === 0 || requiredPlatforms.includes(currentPlatform),
                missing: requiredPlatforms.filter(p => !supportedPlatforms.includes(p))
            },
            capabilities: {
                supportedPlatforms: supportedPlatforms.map(platform => ({
                    platform,
                    name: this.getPlatformName(platform),
                    category: this.getPlatformCategory(platform)
                })),
                currentCapabilities: this.createPlatformContext(currentPlatform)
            },
            recommendations: this._generatePlatformRecommendations(requiredPlatforms, currentPlatform)
        };
    }
    
    /**
     * Generate platform-specific recommendations
     * @param {Array<string>} requiredPlatforms - Required platforms
     * @param {string} currentPlatform - Current platform
     * @returns {Array<string>} Platform recommendations
     * @private
     */
    _generatePlatformRecommendations(requiredPlatforms, currentPlatform) {
        const recommendations = [];
        
        if (requiredPlatforms.length > 0 && !requiredPlatforms.includes(currentPlatform)) {
            recommendations.push(`Current platform ${this.getPlatformName(currentPlatform)} is not in required platforms: ${requiredPlatforms.map(p => this.getPlatformName(p)).join(', ')}`);
            recommendations.push('Consider using a supported platform or updating compatibility requirements');
        }
        
        if (!this.isPlatformSupported(currentPlatform)) {
            recommendations.push(`Platform ${this.getPlatformName(currentPlatform)} may have limited support`);
            recommendations.push(`Consider using one of the fully supported platforms: ${this.getSupportedPlatforms().map(p => this.getPlatformName(p)).join(', ')}`);
        }
        
        return recommendations;
    }
}

module.exports = PlatformUtils;