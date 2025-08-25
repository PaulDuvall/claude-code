/**
 * Installation Instruction Generator (Refactored)
 * 
 * Lightweight orchestrator for generating platform-specific installation instructions and recovery guidance.
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
                individualInstructions: []
            };
            
            // Generate individual instructions for each dependency
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
     * Generate upgrade instructions for outdated dependency
     * @param {Object} dependency - Dependency to upgrade
     * @param {string} platform - Target platform
     * @returns {Object} Upgrade instructions
     */
    generateUpgradeInstructions(dependency, platform = process.platform) {
        this.logger.debug('Generating upgrade instructions', { 
            dependency: dependency.name,
            currentVersion: dependency.currentVersion,
            targetVersion: dependency.targetVersion
        });

        try {
            // Generate upgrade-specific instructions
            const upgradeOptions = {
                global: dependency.global,
                version: dependency.targetVersion,
                currentVersion: dependency.currentVersion
            };

            const packageManagerInstructions = this.packageManagerService.generateInstallationInstructions(
                dependency.packageName || dependency.name,
                upgradeOptions
            );

            const instructions = {
                dependency: dependency.name,
                platform,
                currentVersion: dependency.currentVersion,
                targetVersion: dependency.targetVersion,
                packageManagers: packageManagerInstructions,
                notes: [`Upgrading from ${dependency.currentVersion} to ${dependency.targetVersion}`]
            };

            this.logger.debug('Generated upgrade instructions', { 
                managersCount: packageManagerInstructions.length
            });

            return instructions;
        } catch (error) {
            this.logger.error('Failed to generate upgrade instructions', error, { 
                dependency: dependency.name 
            });
            throw error;
        }
    }

    /**
     * Generate recovery instructions for multiple failed dependencies
     * @param {Array} failedDependencies - Array of failed dependencies
     * @returns {Object} Consolidated recovery instructions
     */
    generateBulkRecoveryInstructions(failedDependencies) {
        this.logger.info('Generating bulk recovery instructions', { 
            count: failedDependencies.length 
        });

        try {
            const bulkRecovery = this.recoveryService.generateBulkRecoveryInstructions(failedDependencies);
            
            this.logger.debug('Generated bulk recovery instructions', {
                immediate: bulkRecovery.immediate.length,
                alternative: bulkRecovery.alternative.length,
                troubleshooting: bulkRecovery.troubleshooting.length
            });
            
            return bulkRecovery;
        } catch (error) {
            this.logger.error('Failed to generate bulk recovery instructions', error, { 
                dependencyCount: failedDependencies.length 
            });
            throw error;
        }
    }

    /**
     * Generate step-by-step recovery guide
     * @param {Object} failedDependency - Failed dependency information
     * @returns {Array} Step-by-step recovery instructions
     */
    generateStepByStepGuide(failedDependency) {
        this.logger.debug('Generating step-by-step guide', { 
            dependency: failedDependency.name 
        });

        try {
            const guide = this.recoveryService.generateStepByStepGuide(failedDependency);
            
            this.logger.debug('Generated step-by-step guide', { 
                steps: guide.length 
            });
            
            return guide;
        } catch (error) {
            this.logger.error('Failed to generate step-by-step guide', error, { 
                dependency: failedDependency.name 
            });
            throw error;
        }
    }

    /**
     * Get recommended package manager for platform
     * @param {string} platform - Target platform
     * @returns {string} Recommended package manager
     */
    getRecommendedPackageManager(platform = process.platform) {
        try {
            return this.packageManagerService.getRecommendedPackageManager(platform);
        } catch (error) {
            this.logger.error('Failed to get recommended package manager', error, { platform });
            return 'npm'; // Safe fallback
        }
    }

    /**
     * Validate package manager availability
     * @param {string} manager - Package manager name
     * @returns {Object} Validation result
     */
    validatePackageManager(manager) {
        try {
            return this.packageManagerService.validatePackageManager(manager);
        } catch (error) {
            this.logger.error('Failed to validate package manager', error, { manager });
            return {
                valid: false,
                error: 'Validation failed',
                suggestions: ['Try using npm as fallback']
            };
        }
    }
}

module.exports = InstallationInstructionGenerator;