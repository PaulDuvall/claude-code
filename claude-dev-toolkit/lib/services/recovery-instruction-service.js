/**
 * Recovery Instruction Service
 * Generates recovery and troubleshooting instructions for failed installations
 */

const { ERROR_MESSAGES } = require('../config/constants');

class RecoveryInstructionService {
    constructor() {
        this.errorMessages = ERROR_MESSAGES;
        this.commonRecoverySteps = this._initializeCommonRecoverySteps();
    }

    /**
     * Generate recovery suggestions for failed dependency
     * @param {Object} failedDependency - Dependency that failed validation
     * @returns {Object} Recovery suggestions
     */
    generateRecoverySuggestions(failedDependency) {
        const suggestions = {
            immediate: [],
            alternative: [],
            troubleshooting: [],
            additionalResources: []
        };

        if (!failedDependency || !failedDependency.error) {
            return this._getGenericRecoverySuggestions(failedDependency);
        }

        // Generate error-specific suggestions
        this._addErrorSpecificSuggestions(suggestions, failedDependency);
        
        // Add dependency-specific suggestions
        this._addDependencySpecificSuggestions(suggestions, failedDependency);
        
        // Add platform-specific suggestions
        this._addPlatformSpecificSuggestions(suggestions, failedDependency);
        
        // Add general troubleshooting steps
        this._addGeneralTroubleshootingSteps(suggestions);

        return suggestions;
    }

    /**
     * Initialize common recovery steps
     * @returns {Object} Common recovery steps by category
     * @private
     */
    _initializeCommonRecoverySteps() {
        return {
            permissions: [
                'Run command prompt or terminal as administrator/sudo',
                'Check file and directory permissions',
                'Ensure user has installation privileges'
            ],
            network: [
                'Check internet connection',
                'Try using a different network or VPN',
                'Configure proxy settings if behind corporate firewall',
                'Clear DNS cache: ipconfig /flushdns (Windows) or sudo dscacheutil -flushcache (macOS)'
            ],
            cache: [
                'Clear package manager cache',
                'Remove temporary installation files',
                'Reset package manager configuration'
            ],
            environment: [
                'Check system PATH environment variable',
                'Verify required environment variables are set',
                'Restart terminal/command prompt after installation',
                'Reboot system if necessary'
            ]
        };
    }

    /**
     * Add error-specific recovery suggestions
     * @param {Object} suggestions - Suggestions object to modify
     * @param {Object} failedDependency - Failed dependency information
     * @private
     */
    _addErrorSpecificSuggestions(suggestions, failedDependency) {
        const errorCode = failedDependency.error.code || 'UNKNOWN';
        
        switch (errorCode) {
            case 'NOT_FOUND':
                suggestions.immediate.push(`Install ${failedDependency.name} using your system package manager`);
                suggestions.immediate.push(`Add ${failedDependency.name} to your system PATH`);
                suggestions.alternative.push(`Download and install ${failedDependency.name} manually`);
                suggestions.alternative.push(`Use portable version of ${failedDependency.name}`);
                suggestions.troubleshooting.push(`Verify ${failedDependency.name} installation directory`);
                suggestions.troubleshooting.push(`Check if ${failedDependency.name} was installed with different name`);
                break;
                
            case 'VERSION_MISMATCH':
                suggestions.immediate.push(`Update ${failedDependency.name} to version ${failedDependency.requiredVersion || 'latest'}`);
                suggestions.immediate.push(`Use version manager to install specific version`);
                suggestions.alternative.push(`Install required version manually`);
                suggestions.alternative.push(`Use Docker container with required version`);
                suggestions.troubleshooting.push(`Check if multiple versions are installed`);
                suggestions.troubleshooting.push(`Verify which version is in PATH`);
                break;
                
            case 'PERMISSION_DENIED':
                suggestions.immediate.push(...this.commonRecoverySteps.permissions);
                suggestions.alternative.push(`Install to user directory instead of system-wide`);
                suggestions.alternative.push(`Use package manager that doesn't require admin rights`);
                break;
                
            case 'NETWORK_ERROR':
                suggestions.immediate.push(...this.commonRecoverySteps.network);
                suggestions.alternative.push(`Download installation files manually`);
                suggestions.alternative.push(`Use offline installer if available`);
                break;
                
            case 'DISK_SPACE':
                suggestions.immediate.push('Free up disk space by removing unnecessary files');
                suggestions.immediate.push('Clean temporary files and caches');
                suggestions.alternative.push('Install to different drive with more space');
                suggestions.alternative.push('Use symbolic links to move installation');
                break;
                
            case 'CORRUPTED_DOWNLOAD':
                suggestions.immediate.push('Clear download cache and retry');
                suggestions.immediate.push('Download from different mirror or source');
                suggestions.alternative.push('Verify download integrity with checksums');
                suggestions.alternative.push('Use different download method');
                break;
                
            default:
                suggestions.immediate.push(`Reinstall ${failedDependency.name} from scratch`);
                suggestions.immediate.push('Check system logs for more details');
                suggestions.troubleshooting.push('Run installation in verbose mode');
                suggestions.troubleshooting.push('Check for conflicting software');
        }
    }

    /**
     * Add dependency-specific recovery suggestions
     * @param {Object} suggestions - Suggestions object to modify
     * @param {Object} failedDependency - Failed dependency information
     * @private
     */
    _addDependencySpecificSuggestions(suggestions, failedDependency) {
        const dependencyName = failedDependency.name.toLowerCase();
        
        switch (dependencyName) {
            case 'node':
            case 'nodejs':
                suggestions.immediate.push('Install Node.js from official website: https://nodejs.org');
                suggestions.alternative.push('Use Node Version Manager (nvm) for easier management');
                suggestions.alternative.push('Install via package manager: brew install node (macOS)');
                suggestions.troubleshooting.push('Check if Node.js is installed as "nodejs" instead of "node"');
                suggestions.additionalResources.push('https://nodejs.org/en/download/package-manager/');
                break;
                
            case 'npm':
                suggestions.immediate.push('npm comes with Node.js - install Node.js first');
                suggestions.alternative.push('Install npm separately: npm install -g npm@latest');
                suggestions.troubleshooting.push('Check npm configuration: npm config list');
                suggestions.troubleshooting.push('Reset npm to defaults: npm config delete prefix');
                break;
                
            case 'git':
                suggestions.immediate.push('Install Git from official website: https://git-scm.com');
                suggestions.alternative.push('Install via package manager based on your OS');
                suggestions.troubleshooting.push('Configure Git after installation with user name and email');
                suggestions.additionalResources.push('https://git-scm.com/book/en/v2/Getting-Started-Installing-Git');
                break;
                
            case 'python':
            case 'python3':
                suggestions.immediate.push('Install Python from official website: https://python.org');
                suggestions.alternative.push('Use Python version manager like pyenv');
                suggestions.alternative.push('Install Anaconda for scientific computing');
                suggestions.troubleshooting.push('Check if python3 command is available instead of python');
                suggestions.troubleshooting.push('Verify pip is installed: python -m ensurepip');
                suggestions.additionalResources.push('https://docs.python.org/3/using/index.html');
                break;
                
            case 'docker':
                suggestions.immediate.push('Install Docker Desktop from official website');
                suggestions.alternative.push('Use Docker CE for server installations');
                suggestions.troubleshooting.push('Enable virtualization in BIOS settings');
                suggestions.troubleshooting.push('Restart Docker service after installation');
                suggestions.additionalResources.push('https://docs.docker.com/get-docker/');
                break;
        }
    }

    /**
     * Add platform-specific recovery suggestions
     * @param {Object} suggestions - Suggestions object to modify
     * @param {Object} failedDependency - Failed dependency information
     * @private
     */
    _addPlatformSpecificSuggestions(suggestions, failedDependency) {
        const platform = process.platform;
        
        switch (platform) {
            case 'win32':
                suggestions.troubleshooting.push('Try Windows Subsystem for Linux (WSL) for better compatibility');
                suggestions.troubleshooting.push('Use PowerShell instead of Command Prompt');
                suggestions.troubleshooting.push('Temporarily disable Windows Defender during installation');
                suggestions.alternative.push('Use Chocolatey package manager: https://chocolatey.org');
                suggestions.alternative.push('Use winget package manager if available');
                break;
                
            case 'darwin':
                suggestions.alternative.push('Use Homebrew package manager: https://brew.sh');
                suggestions.troubleshooting.push('Install Xcode Command Line Tools: xcode-select --install');
                suggestions.troubleshooting.push('Check for conflicting installations in /usr/local');
                break;
                
            case 'linux':
                suggestions.alternative.push('Use distribution package manager (apt, yum, pacman, etc.)');
                suggestions.troubleshooting.push('Update package lists before installation');
                suggestions.troubleshooting.push('Check if package is available in distribution repositories');
                suggestions.troubleshooting.push('Consider using Snap or Flatpak for universal packages');
                break;
        }
    }

    /**
     * Add general troubleshooting steps
     * @param {Object} suggestions - Suggestions object to modify
     * @private
     */
    _addGeneralTroubleshootingSteps(suggestions) {
        suggestions.troubleshooting.push(...this.commonRecoverySteps.environment);
        suggestions.troubleshooting.push('Check system logs for error details');
        suggestions.troubleshooting.push('Try installation in safe mode or clean environment');
        suggestions.troubleshooting.push('Verify system meets minimum requirements');
    }

    /**
     * Get generic recovery suggestions when error details are not available
     * @param {Object} failedDependency - Failed dependency information
     * @returns {Object} Generic recovery suggestions
     * @private
     */
    _getGenericRecoverySuggestions(failedDependency) {
        const name = failedDependency?.name || 'dependency';
        
        return {
            immediate: [
                `Try reinstalling ${name}`,
                `Check if ${name} is in your system PATH`,
                'Restart your terminal or command prompt'
            ],
            alternative: [
                `Install ${name} using different package manager`,
                `Download ${name} manually from official website`,
                `Use portable version of ${name}`
            ],
            troubleshooting: [
                'Check system requirements',
                'Verify internet connection',
                'Run installation as administrator if needed',
                'Check for system updates'
            ],
            additionalResources: []
        };
    }

    /**
     * Generate step-by-step recovery guide
     * @param {Object} failedDependency - Failed dependency information
     * @returns {Array} Step-by-step recovery instructions
     */
    generateStepByStepGuide(failedDependency) {
        const guide = [];
        const suggestions = this.generateRecoverySuggestions(failedDependency);
        
        // Step 1: Immediate actions
        if (suggestions.immediate.length > 0) {
            guide.push({
                step: 1,
                title: 'Try these immediate solutions first:',
                actions: suggestions.immediate.slice(0, 3) // Top 3 immediate suggestions
            });
        }
        
        // Step 2: Alternative approaches
        if (suggestions.alternative.length > 0) {
            guide.push({
                step: 2,
                title: 'If immediate solutions don\'t work, try these alternatives:',
                actions: suggestions.alternative.slice(0, 3) // Top 3 alternatives
            });
        }
        
        // Step 3: Troubleshooting
        if (suggestions.troubleshooting.length > 0) {
            guide.push({
                step: 3,
                title: 'For advanced troubleshooting:',
                actions: suggestions.troubleshooting.slice(0, 3) // Top 3 troubleshooting steps
            });
        }
        
        // Step 4: Additional resources
        if (suggestions.additionalResources.length > 0) {
            guide.push({
                step: 4,
                title: 'Additional resources:',
                actions: suggestions.additionalResources
            });
        }
        
        return guide;
    }

    /**
     * Generate recovery instructions for multiple failed dependencies
     * @param {Array} failedDependencies - Array of failed dependencies
     * @returns {Object} Consolidated recovery instructions
     */
    generateBulkRecoveryInstructions(failedDependencies) {
        const consolidated = {
            immediate: new Set(),
            alternative: new Set(),
            troubleshooting: new Set(),
            additionalResources: new Set()
        };
        
        failedDependencies.forEach(dependency => {
            const suggestions = this.generateRecoverySuggestions(dependency);
            
            suggestions.immediate.forEach(item => consolidated.immediate.add(item));
            suggestions.alternative.forEach(item => consolidated.alternative.add(item));
            suggestions.troubleshooting.forEach(item => consolidated.troubleshooting.add(item));
            suggestions.additionalResources.forEach(item => consolidated.additionalResources.add(item));
        });
        
        return {
            immediate: Array.from(consolidated.immediate),
            alternative: Array.from(consolidated.alternative),
            troubleshooting: Array.from(consolidated.troubleshooting),
            additionalResources: Array.from(consolidated.additionalResources),
            affectedDependencies: failedDependencies.map(dep => dep.name)
        };
    }
}

module.exports = RecoveryInstructionService;