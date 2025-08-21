/**
 * Subagents Core Business Logic
 * Pure business logic without console output side effects
 * Uses Result pattern for error handling
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { Result } = require('./result');

// Business logic constants
const CORE_CONSTANTS = {
    FILE_EXTENSION: '.md',
    CLAUDE_DIR: '.claude',
    SUBAGENTS_DIR: 'subagents'
};

/**
 * Pure business logic for subagent operations
 * All methods return Result objects instead of boolean/throwing
 */
class SubagentsCoreService {
    constructor() {
        this.packageRoot = path.join(__dirname, '..');
        this.subagentsDir = path.join(this.packageRoot, CORE_CONSTANTS.SUBAGENTS_DIR);
        this.claudeDir = path.join(os.homedir(), CORE_CONSTANTS.CLAUDE_DIR);
        this.claudeSubagentsDir = path.join(this.claudeDir, CORE_CONSTANTS.SUBAGENTS_DIR);
    }

    /**
     * Get list of available subagent files
     * @returns {Result<string[]>} Array of subagent filenames or error
     */
    getAvailableSubagents() {
        return Result.try(() => {
            if (!fs.existsSync(this.subagentsDir)) {
                return [];
            }

            return fs.readdirSync(this.subagentsDir)
                .filter(f => f.endsWith(CORE_CONSTANTS.FILE_EXTENSION))
                .sort();
        });
    }

    /**
     * Get subagent names without file extensions
     * @returns {Result<string[]>} Array of subagent names or error
     */
    getSubagentNames() {
        return this.getAvailableSubagents()
            .map(files => files.map(f => f.replace(CORE_CONSTANTS.FILE_EXTENSION, '')));
    }

    /**
     * Check if Claude directory structure exists
     * @returns {Result<{claudeDir: boolean, subagentsDir: boolean}>} Directory existence status
     */
    checkDirectoryStructure() {
        return Result.try(() => ({
            claudeDir: fs.existsSync(this.claudeDir),
            subagentsDir: fs.existsSync(this.claudeSubagentsDir)
        }));
    }

    /**
     * Ensure Claude directory structure exists
     * @returns {Result<{created: boolean, path: string}>} Creation result
     */
    ensureClaudeDirectory() {
        return Result.try(() => {
            let created = false;

            if (!fs.existsSync(this.claudeDir)) {
                fs.mkdirSync(this.claudeDir, { recursive: true });
            }
            
            if (!fs.existsSync(this.claudeSubagentsDir)) {
                fs.mkdirSync(this.claudeSubagentsDir, { recursive: true });
                created = true;
            }

            return {
                created,
                path: this.claudeSubagentsDir
            };
        });
    }

    /**
     * Install a single subagent file
     * @param {string} filename - Subagent filename
     * @returns {Result<{filename: string, installed: boolean}>} Installation result
     */
    installSingleSubagent(filename) {
        return Result.try(() => {
            const sourcePath = path.join(this.subagentsDir, filename);
            const destPath = path.join(this.claudeSubagentsDir, filename);
            
            fs.copyFileSync(sourcePath, destPath);
            
            return {
                filename,
                installed: true
            };
        });
    }

    /**
     * Install all available subagents
     * @returns {Result<{installed: string[], failed: Array<{filename: string, error: string}>, summary: Object}>}
     */
    installAllSubagents() {
        // Get available subagents
        const subagentsResult = this.getAvailableSubagents();
        if (subagentsResult.isError) {
            return subagentsResult;
        }

        const subagentFiles = subagentsResult.value;
        if (subagentFiles.length === 0) {
            return Result.err(new Error('No subagent files found to install'));
        }

        // Ensure directory exists
        const dirResult = this.ensureClaudeDirectory();
        if (dirResult.isError) {
            return dirResult;
        }

        // Install each subagent
        const installed = [];
        const failed = [];

        for (const filename of subagentFiles) {
            const installResult = this.installSingleSubagent(filename);
            
            if (installResult.isOk) {
                installed.push(filename);
            } else {
                failed.push({
                    filename,
                    error: installResult.error.message
                });
            }
        }

        const summary = {
            installed: installed.length,
            failed: failed.length,
            path: this.claudeSubagentsDir,
            directoryCreated: dirResult.value.created
        };

        return Result.ok({
            installed,
            failed,
            summary
        });
    }

    /**
     * Validate subagent installation
     * @returns {Result<{valid: boolean, installedCount: number, issues: string[]}>}
     */
    validateInstallation() {
        return Result.try(() => {
            const issues = [];
            let installedCount = 0;

            // Check if directory exists
            if (!fs.existsSync(this.claudeSubagentsDir)) {
                issues.push('Subagents directory does not exist');
                return { valid: false, installedCount: 0, issues };
            }

            // Count installed files
            const installedFiles = fs.readdirSync(this.claudeSubagentsDir)
                .filter(f => f.endsWith(CORE_CONSTANTS.FILE_EXTENSION));
            
            installedCount = installedFiles.length;

            // Get available files for comparison
            const availableResult = this.getAvailableSubagents();
            if (availableResult.isOk) {
                const availableFiles = availableResult.value;
                const missingFiles = availableFiles.filter(f => !installedFiles.includes(f));
                
                if (missingFiles.length > 0) {
                    issues.push(`Missing files: ${missingFiles.join(', ')}`);
                }
            }

            return {
                valid: issues.length === 0,
                installedCount,
                issues
            };
        });
    }

    /**
     * Get installation status information
     * @returns {Result<Object>} Status information
     */
    getInstallationStatus() {
        return Result.try(() => {
            const available = this.getAvailableSubagents().unwrapOr([]);
            const directoryStatus = this.checkDirectoryStructure().unwrapOr({
                claudeDir: false,
                subagentsDir: false
            });

            let installed = [];
            if (directoryStatus.subagentsDir) {
                installed = fs.readdirSync(this.claudeSubagentsDir)
                    .filter(f => f.endsWith(CORE_CONSTANTS.FILE_EXTENSION));
            }

            return {
                available: available.length,
                installed: installed.length,
                directories: directoryStatus,
                paths: {
                    packageSubagents: this.subagentsDir,
                    claudeSubagents: this.claudeSubagentsDir
                }
            };
        });
    }
}

module.exports = {
    SubagentsCoreService,
    CORE_CONSTANTS
};