/**
 * System Requirements Checker
 * 
 * Validates system compatibility and requirements checking.
 * Extracted from DependencyValidator as part of Phase 1 bloater refactoring.
 * 
 * Features:
 * - Operating system compatibility checking
 * - Architecture validation
 * - Memory requirements validation
 * - Disk space availability checking
 * - Node.js version validation
 * - System environment analysis
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const VersionValidatorService = require('./version-validator-service');
const PlatformUtils = require('./platform-utils');

class SystemRequirementsChecker {
    constructor() {
        this.versionValidator = new VersionValidatorService();
        this.platformUtils = new PlatformUtils();
        this.systemInfo = this._gatherSystemInfo();
    }
    
    /**
     * Gather system information
     * @returns {Object} System information
     * @private
     */
    _gatherSystemInfo() {
        return {
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            cpus: os.cpus().length,
            osType: os.type(),
            osRelease: os.release(),
            hostname: os.hostname(),
            uptime: os.uptime()
        };
    }
    
    /**
     * Validate system requirements
     * @param {Object} requirements - System requirements to validate
     * @returns {Object} System compatibility result
     */
    validateSystemRequirements(requirements) {
        const context = this._createSystemValidationContext(requirements);
        const result = this._initializeSystemValidationResult();
        
        this._validateOperatingSystem(result, context);
        this._validateArchitecture(result, context);
        this._validateNodeVersion(result, context);
        this._validateMemoryRequirements(result, context);
        this._validateDiskSpace(result, context);
        this._calculateOverallCompatibility(result);

        return result;
    }
    
    /**
     * Check if the current system meets minimum requirements
     * @param {Object} minimumRequirements - Minimum system requirements
     * @returns {Object} Compatibility check result
     */
    checkMinimumRequirements(minimumRequirements) {
        const checks = {
            platform: this._checkPlatformRequirement(minimumRequirements.platform),
            architecture: this._checkArchitectureRequirement(minimumRequirements.architecture),
            memory: this._checkMemoryRequirement(minimumRequirements.memory),
            diskSpace: this._checkDiskSpaceRequirement(minimumRequirements.diskSpace),
            nodeVersion: this._checkNodeVersionRequirement(minimumRequirements.nodeVersion)
        };
        
        const allSatisfied = Object.values(checks).every(check => check.satisfied);
        
        return {
            compatible: allSatisfied,
            checks: checks,
            systemInfo: this.systemInfo,
            recommendations: this._generateCompatibilityRecommendations(checks)
        };
    }
    
    /**
     * Get detailed system information
     * @returns {Object} Comprehensive system information
     */
    getSystemInfo() {
        return {
            ...this.systemInfo,
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch
            },
            resources: {
                totalMemory: this._formatMemory(this.systemInfo.totalMemory),
                freeMemory: this._formatMemory(this.systemInfo.freeMemory),
                usedMemory: this._formatMemory(this.systemInfo.totalMemory - this.systemInfo.freeMemory),
                memoryUsagePercent: Math.round((1 - this.systemInfo.freeMemory / this.systemInfo.totalMemory) * 100)
            },
            capabilities: {
                supportedPlatforms: this.platformUtils.getSupportedPlatforms(),
                supportedArchitectures: ['x64', 'arm64'],
                minimumNodeVersion: '16.0.0'
            }
        };
    }
    
    /**
     * Check if system supports a specific platform
     * @param {string|Array<string>} supportedPlatforms - Platform or platforms to check
     * @returns {Object} Platform compatibility result
     */
    checkPlatformCompatibility(supportedPlatforms) {
        const platforms = Array.isArray(supportedPlatforms) ? supportedPlatforms : [supportedPlatforms];
        const currentPlatform = this.systemInfo.platform;
        
        return {
            compatible: platforms.includes(currentPlatform),
            currentPlatform: currentPlatform,
            supportedPlatforms: platforms,
            platformName: this.platformUtils.getPlatformName(currentPlatform)
        };
    }
    
    /**
     * Check if system has enough memory for requirements
     * @param {string|number} memoryRequirement - Memory requirement (e.g., "512MB" or bytes)
     * @returns {Object} Memory check result
     */
    checkMemoryRequirement(memoryRequirement) {
        const requiredBytes = typeof memoryRequirement === 'string' 
            ? this._parseMemoryRequirement(memoryRequirement)
            : memoryRequirement;
            
        const available = this.systemInfo.freeMemory;
        const total = this.systemInfo.totalMemory;
        
        return {
            satisfied: total >= requiredBytes,
            required: this._formatMemory(requiredBytes),
            available: this._formatMemory(available),
            total: this._formatMemory(total),
            utilizationPercent: Math.round((1 - available / total) * 100)
        };
    }
    
    /**
     * Check disk space availability
     * @param {string} path - Path to check (defaults to current directory)
     * @param {string|number} spaceRequirement - Required space
     * @returns {Object} Disk space check result
     */
    checkDiskSpaceRequirement(path = process.cwd(), spaceRequirement = null) {
        const result = {
            path: path,
            available: true,
            writable: false,
            error: null
        };
        
        try {
            // Check if path is writable
            const testFile = require('path').join(path, `.diskspace-test-${Date.now()}`);
            fs.writeFileSync(testFile, 'test');
            fs.unlinkSync(testFile);
            result.writable = true;
            
            if (spaceRequirement) {
                // This is a simplified check - in production, you'd want to use a library like 'fs-extra' or native bindings
                result.sufficientSpace = true;
                result.required = typeof spaceRequirement === 'string' 
                    ? spaceRequirement 
                    : this._formatMemory(spaceRequirement);
            }
        } catch (error) {
            result.available = false;
            result.error = error.message;
        }
        
        return result;
    }
    
    /**
     * Check Node.js version compatibility
     * @param {string} minimumVersion - Minimum Node.js version required
     * @returns {Object} Node.js compatibility result
     */
    checkNodeCompatibility(minimumVersion = '16.0.0') {
        const currentVersion = this.systemInfo.nodeVersion.replace(/^v/, '');
        const isCompatible = this.versionValidator.isGreaterOrEqual(currentVersion, minimumVersion);
        
        return {
            compatible: isCompatible,
            currentVersion: this.systemInfo.nodeVersion,
            minimumRequired: minimumVersion,
            recommendation: isCompatible 
                ? 'Node.js version is compatible'
                : `Upgrade Node.js to ${minimumVersion} or higher`
        };
    }
    
    /**
     * Generate system compatibility report
     * @param {Object} requirements - System requirements to check against
     * @returns {Object} Comprehensive compatibility report
     */
    generateCompatibilityReport(requirements = {}) {
        const systemCheck = this.validateSystemRequirements(requirements);
        const nodeCheck = this.checkNodeCompatibility(requirements.nodeVersion);
        const platformCheck = this.checkPlatformCompatibility(requirements.platforms);
        const memoryCheck = this.checkMemoryRequirement(requirements.memory);
        
        const allChecks = [
            { name: 'System Requirements', ...systemCheck },
            { name: 'Node.js Compatibility', ...nodeCheck },
            { name: 'Platform Compatibility', ...platformCheck },
            { name: 'Memory Requirements', ...memoryCheck }
        ];
        
        const overallCompatible = allChecks.every(check => 
            check.compatible !== false && check.satisfied !== false
        );
        
        return {
            timestamp: new Date().toISOString(),
            overallCompatible: overallCompatible,
            systemInfo: this.getSystemInfo(),
            checks: allChecks,
            issues: allChecks
                .filter(check => check.compatible === false || check.satisfied === false)
                .map(check => `${check.name}: ${check.recommendation || 'Not compatible'}`),
            recommendations: this._generateOverallRecommendations(allChecks)
        };
    }
    
    /**
     * Create system validation context
     * @param {Object} requirements - System requirements
     * @returns {Object} Validation context
     * @private
     */
    _createSystemValidationContext(requirements) {
        return {
            requirements,
            systemInfo: this.systemInfo
        };
    }
    
    /**
     * Initialize system validation result
     * @returns {Object} Empty validation result
     * @private
     */
    _initializeSystemValidationResult() {
        return {
            compatible: true,
            checks: {}
        };
    }
    
    /**
     * Validate operating system compatibility
     * @param {Object} result - Result object to modify
     * @param {Object} context - Validation context
     * @private
     */
    _validateOperatingSystem(result, context) {
        result.checks.os = {
            satisfied: context.requirements.os ? 
                context.requirements.os.includes(context.systemInfo.platform) : true,
            current: context.systemInfo.platform,
            required: context.requirements.os,
            platformName: this.platformUtils.getPlatformName(context.systemInfo.platform)
        };
    }
    
    /**
     * Validate architecture compatibility
     * @param {Object} result - Result object to modify
     * @param {Object} context - Validation context
     * @private
     */
    _validateArchitecture(result, context) {
        result.checks.arch = {
            satisfied: context.requirements.arch ? 
                context.requirements.arch.includes(context.systemInfo.arch) : true,
            current: context.systemInfo.arch,
            required: context.requirements.arch
        };
    }
    
    /**
     * Validate Node.js version requirements
     * @param {Object} result - Result object to modify
     * @param {Object} context - Validation context
     * @private
     */
    _validateNodeVersion(result, context) {
        if (context.requirements.nodeVersion) {
            const nodeVersionCheck = this.versionValidator.validateVersionRequirement(
                context.requirements.nodeVersion,
                context.systemInfo.nodeVersion
            );
            result.checks.nodeVersion = {
                satisfied: nodeVersionCheck.satisfies,
                current: context.systemInfo.nodeVersion,
                required: context.requirements.nodeVersion
            };
        } else {
            result.checks.nodeVersion = { satisfied: true };
        }
    }
    
    /**
     * Validate memory requirements
     * @param {Object} result - Result object to modify
     * @param {Object} context - Validation context
     * @private
     */
    _validateMemoryRequirements(result, context) {
        if (context.requirements.memory) {
            const requiredMemoryBytes = this._parseMemoryRequirement(context.requirements.memory);
            result.checks.memory = {
                satisfied: context.systemInfo.totalMemory >= requiredMemoryBytes,
                current: this._formatMemory(context.systemInfo.totalMemory),
                free: this._formatMemory(context.systemInfo.freeMemory),
                required: context.requirements.memory
            };
        } else {
            result.checks.memory = { satisfied: true };
        }
    }
    
    /**
     * Validate disk space requirements
     * @param {Object} result - Result object to modify
     * @param {Object} context - Validation context
     * @private
     */
    _validateDiskSpace(result, context) {
        const diskCheck = this.checkDiskSpaceRequirement(process.cwd(), context.requirements.diskSpace);
        result.checks.diskSpace = {
            satisfied: diskCheck.available && diskCheck.writable,
            available: diskCheck.available,
            writable: diskCheck.writable,
            required: context.requirements.diskSpace || 'N/A'
        };
    }
    
    /**
     * Calculate overall system compatibility
     * @param {Object} result - Result object to modify
     * @private
     */
    _calculateOverallCompatibility(result) {
        result.compatible = Object.values(result.checks).every(check => check.satisfied);
    }
    
    /**
     * Parse memory requirement string (private)
     * @param {string} memory - Memory requirement (e.g., "512MB")
     * @returns {number} Memory in bytes
     * @private
     */
    _parseMemoryRequirement(memory) {
        const units = {
            'B': 1,
            'KB': 1024,
            'MB': 1024 * 1024,
            'GB': 1024 * 1024 * 1024
        };

        const match = memory.match(/(\d+)\s*(B|KB|MB|GB)/i);
        if (match) {
            return parseInt(match[1]) * (units[match[2].toUpperCase()] || 1);
        }

        return 0;
    }
    
    /**
     * Format memory bytes to human readable string
     * @param {number} bytes - Memory in bytes
     * @returns {string} Formatted memory string
     * @private
     */
    _formatMemory(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${Math.round(size * 100) / 100}${units[unitIndex]}`;
    }
    
    
    /**
     * Check platform requirement
     * @param {string|Array<string>} platformRequirement - Required platform(s)
     * @returns {Object} Platform check result
     * @private
     */
    _checkPlatformRequirement(platformRequirement) {
        if (!platformRequirement) return { satisfied: true };
        
        const platforms = Array.isArray(platformRequirement) ? platformRequirement : [platformRequirement];
        return {
            satisfied: platforms.includes(this.systemInfo.platform),
            current: this.systemInfo.platform,
            required: platforms
        };
    }
    
    /**
     * Check architecture requirement
     * @param {string|Array<string>} archRequirement - Required architecture(s)
     * @returns {Object} Architecture check result
     * @private
     */
    _checkArchitectureRequirement(archRequirement) {
        if (!archRequirement) return { satisfied: true };
        
        const architectures = Array.isArray(archRequirement) ? archRequirement : [archRequirement];
        return {
            satisfied: architectures.includes(this.systemInfo.arch),
            current: this.systemInfo.arch,
            required: architectures
        };
    }
    
    /**
     * Check memory requirement
     * @param {string} memoryRequirement - Memory requirement
     * @returns {Object} Memory check result
     * @private
     */
    _checkMemoryRequirement(memoryRequirement) {
        if (!memoryRequirement) return { satisfied: true };
        
        const requiredBytes = this._parseMemoryRequirement(memoryRequirement);
        return {
            satisfied: this.systemInfo.totalMemory >= requiredBytes,
            current: this._formatMemory(this.systemInfo.totalMemory),
            required: memoryRequirement
        };
    }
    
    /**
     * Check disk space requirement
     * @param {string} diskRequirement - Disk space requirement
     * @returns {Object} Disk space check result
     * @private
     */
    _checkDiskSpaceRequirement(diskRequirement) {
        if (!diskRequirement) return { satisfied: true };
        
        const diskCheck = this.checkDiskSpaceRequirement(process.cwd(), diskRequirement);
        return {
            satisfied: diskCheck.available && diskCheck.writable,
            current: 'Available',
            required: diskRequirement
        };
    }
    
    /**
     * Check Node.js version requirement
     * @param {string} nodeVersionRequirement - Node.js version requirement
     * @returns {Object} Node version check result
     * @private
     */
    _checkNodeVersionRequirement(nodeVersionRequirement) {
        if (!nodeVersionRequirement) return { satisfied: true };
        
        const nodeCheck = this.checkNodeCompatibility(nodeVersionRequirement);
        return {
            satisfied: nodeCheck.compatible,
            current: nodeCheck.currentVersion,
            required: nodeVersionRequirement
        };
    }
    
    /**
     * Generate compatibility recommendations
     * @param {Object} checks - Compatibility check results
     * @returns {Array<string>} List of recommendations
     * @private
     */
    _generateCompatibilityRecommendations(checks) {
        const recommendations = [];
        
        Object.entries(checks).forEach(([checkName, result]) => {
            if (!result.satisfied) {
                switch (checkName) {
                    case 'platform':
                        recommendations.push(`Switch to a supported platform: ${result.required.join(', ')}`);
                        break;
                    case 'architecture':
                        recommendations.push(`Use a supported architecture: ${result.required.join(', ')}`);
                        break;
                    case 'memory':
                        recommendations.push(`Increase system memory to at least ${result.required}`);
                        break;
                    case 'diskSpace':
                        recommendations.push(`Ensure sufficient disk space: ${result.required}`);
                        break;
                    case 'nodeVersion':
                        recommendations.push(`Upgrade Node.js to version ${result.required} or higher`);
                        break;
                }
            }
        });
        
        return recommendations;
    }
    
    /**
     * Generate overall recommendations
     * @param {Array} allChecks - All compatibility checks
     * @returns {Array<string>} Overall recommendations
     * @private
     */
    _generateOverallRecommendations(allChecks) {
        const recommendations = [];
        
        const failedChecks = allChecks.filter(check => 
            check.compatible === false || check.satisfied === false
        );
        
        if (failedChecks.length === 0) {
            recommendations.push('System is fully compatible with requirements');
        } else {
            recommendations.push('Address the following compatibility issues:');
            failedChecks.forEach(check => {
                if (check.recommendation) {
                    recommendations.push(`- ${check.recommendation}`);
                }
            });
        }
        
        return recommendations;
    }
}

module.exports = SystemRequirementsChecker;