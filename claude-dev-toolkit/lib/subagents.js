/**
 * Subagents Module - Async/Await Version (CommonJS)
 * Backward compatible with enhanced async support
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const os = require('os');
const { Result } = require('./result');
const { SubagentFormatter } = require('./subagent-formatter');

// Enhanced Result with async support
class AsyncResult extends Result {
    static async tryAsync(fn) {
        try {
            const result = await fn();
            return Result.ok(result);
        } catch (error) {
            return Result.err(error);
        }
    }

    async mapAsync(fn) {
        if (this.isError) return this;
        
        try {
            const result = await fn(this.value);
            return Result.ok(result);
        } catch (error) {
            return Result.err(error);
        }
    }

    async flatMapAsync(fn) {
        if (this.isError) return this;
        
        try {
            return await fn(this.value);
        } catch (error) {
            return Result.err(error);
        }
    }

    async matchAsync(okFn, errFn) {
        if (this.isOk) {
            return await okFn(this.value);
        } else {
            return await errFn(this.error);
        }
    }
}

// Constants
const CONSTANTS = {
    FILE_EXTENSION: '.md',
    CLAUDE_DIR: '.claude',
    SUBAGENTS_DIR: 'subagents'
};

/**
 * Async Core Service for subagent operations
 */
class AsyncSubagentsCoreService {
    constructor() {
        this.packageRoot = path.join(__dirname, '..');
        this.subagentsDir = path.join(this.packageRoot, CONSTANTS.SUBAGENTS_DIR);
        this.claudeDir = path.join(os.homedir(), CONSTANTS.CLAUDE_DIR);
        this.claudeSubagentsDir = path.join(this.claudeDir, CONSTANTS.SUBAGENTS_DIR);
    }

    /**
     * Get list of available subagent files (async)
     */
    async getAvailableSubagents() {
        return await AsyncResult.tryAsync(async () => {
            try {
                await fs.access(this.subagentsDir);
            } catch {
                return [];
            }

            const files = await fs.readdir(this.subagentsDir);
            return files
                .filter(f => f.endsWith(CONSTANTS.FILE_EXTENSION))
                .sort();
        });
    }

    /**
     * Get subagent names without file extensions (async)
     */
    async getSubagentNames() {
        const result = await this.getAvailableSubagents();
        return result.map(files => files.map(f => f.replace(CONSTANTS.FILE_EXTENSION, '')));
    }

    /**
     * Check if Claude directory structure exists (async)
     */
    async checkDirectoryStructure() {
        return await AsyncResult.tryAsync(async () => {
            const checkPromises = [
                fs.access(this.claudeDir).then(() => true).catch(() => false),
                fs.access(this.claudeSubagentsDir).then(() => true).catch(() => false)
            ];

            const [claudeDir, subagentsDir] = await Promise.all(checkPromises);

            return { claudeDir, subagentsDir };
        });
    }

    /**
     * Ensure Claude directory structure exists (async)
     */
    async ensureClaudeDirectory() {
        return await AsyncResult.tryAsync(async () => {
            let created = false;

            // Create base Claude directory
            await fs.mkdir(this.claudeDir, { recursive: true });
            
            // Check if subagents directory exists
            try {
                await fs.access(this.claudeSubagentsDir);
            } catch {
                // Create subagents directory if it doesn't exist
                await fs.mkdir(this.claudeSubagentsDir, { recursive: true });
                created = true;
            }

            return {
                created,
                path: this.claudeSubagentsDir
            };
        });
    }

    /**
     * Install a single subagent file (async)
     */
    async installSingleSubagent(filename) {
        return await AsyncResult.tryAsync(async () => {
            const sourcePath = path.join(this.subagentsDir, filename);
            const destPath = path.join(this.claudeSubagentsDir, filename);
            
            await fs.copyFile(sourcePath, destPath);
            
            return {
                filename,
                installed: true
            };
        });
    }

    /**
     * Install all available subagents with parallel processing (async)
     */
    async installAllSubagents() {
        // Get available subagents
        const subagentsResult = await this.getAvailableSubagents();
        if (subagentsResult.isError) {
            return subagentsResult;
        }

        const subagentFiles = subagentsResult.value;
        if (subagentFiles.length === 0) {
            return Result.err(new Error('No subagent files found to install'));
        }

        // Ensure directory exists
        const dirResult = await this.ensureClaudeDirectory();
        if (dirResult.isError) {
            return dirResult;
        }

        // Install all subagents in parallel for better performance
        const installPromises = subagentFiles.map(async (filename) => {
            const result = await this.installSingleSubagent(filename);
            return { filename, result };
        });

        const results = await Promise.allSettled(installPromises);
        
        const installed = [];
        const failed = [];

        results.forEach((promiseResult) => {
            if (promiseResult.status === 'fulfilled') {
                const { filename, result } = promiseResult.value;
                if (result.isOk) {
                    installed.push(filename);
                } else {
                    failed.push({
                        filename,
                        error: result.error.message
                    });
                }
            } else {
                // This should rarely happen as we're catching errors in installSingleSubagent
                failed.push({
                    filename: 'unknown',
                    error: promiseResult.reason.message || 'Unknown error'
                });
            }
        });

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
     * Validate subagent installation (async)
     */
    async validateInstallation() {
        return await AsyncResult.tryAsync(async () => {
            const issues = [];
            let installedCount = 0;

            // Check if directory exists
            try {
                await fs.access(this.claudeSubagentsDir);
            } catch {
                issues.push('Subagents directory does not exist');
                return { valid: false, installedCount: 0, issues };
            }

            // Count installed files
            const installedFiles = await fs.readdir(this.claudeSubagentsDir);
            const mdFiles = installedFiles.filter(f => f.endsWith(CONSTANTS.FILE_EXTENSION));
            installedCount = mdFiles.length;

            // Get available files for comparison
            const availableResult = await this.getAvailableSubagents();
            if (availableResult.isOk) {
                const availableFiles = availableResult.value;
                const missingFiles = availableFiles.filter(f => !mdFiles.includes(f));
                
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
     * Get installation status information (async)
     */
    async getInstallationStatus() {
        return await AsyncResult.tryAsync(async () => {
            const [availableResult, directoryResult] = await Promise.all([
                this.getAvailableSubagents(),
                this.checkDirectoryStructure()
            ]);

            const availableCount = availableResult.unwrapOr([]).length;
            const dirStatus = directoryResult.unwrapOr({
                claudeDir: false,
                subagentsDir: false
            });

            let installedCount = 0;
            if (dirStatus.subagentsDir) {
                try {
                    const installed = await fs.readdir(this.claudeSubagentsDir);
                    installedCount = installed.filter(f => f.endsWith(CONSTANTS.FILE_EXTENSION)).length;
                } catch {
                    installedCount = 0;
                }
            }

            return {
                available: availableCount,
                installed: installedCount,
                directories: dirStatus,
                paths: {
                    packageSubagents: this.subagentsDir,
                    claudeSubagents: this.claudeSubagentsDir
                }
            };
        });
    }
}

/**
 * Async Subagents Manager with backward-compatible interface
 */
class AsyncSubagentsManager {
    constructor() {
        this.coreService = new AsyncSubagentsCoreService();
    }

    // Async versions of all methods
    async listAvailableSubagentsAsync() {
        const result = await this.coreService.getSubagentNames();
        
        return await result.matchAsync(
            async (names) => {
                SubagentFormatter.displayList(names);
                return true;
            },
            async (error) => {
                SubagentFormatter.displayError(`Failed to list subagents: ${error.message}`);
                return false;
            }
        );
    }

    async installSubagentsAsync() {
        const result = await this.coreService.installAllSubagents();
        
        return await result.matchAsync(
            async (installationData) => {
                SubagentFormatter.displayInstallation({
                    subagents: [...installationData.installed, ...installationData.failed.map(f => f.filename)],
                    onProgress: (callback) => {
                        installationData.installed.forEach(filename => {
                            callback(filename, true, null);
                        });
                        
                        installationData.failed.forEach(failure => {
                            callback(failure.filename, false, failure.error);
                        });
                    },
                    onDirectoryCreated: (callback) => {
                        if (installationData.summary.directoryCreated) {
                            callback(installationData.summary.path);
                        }
                    },
                    summary: installationData.summary
                });
                
                return installationData.summary.installed > 0;
            },
            async (error) => {
                SubagentFormatter.displayError(`Installation failed: ${error.message}`);
                return false;
            }
        );
    }

    async showHelpAsync() {
        const countResult = await this.coreService.getAvailableSubagents();
        const count = countResult.unwrapOr([]).length;
        
        SubagentFormatter.displayHelp(count);
        return true;
    }

    async handleCommandAsync(options) {
        if (options.help) {
            return await this.showHelpAsync();
        }

        if (options.list) {
            return await this.listAvailableSubagentsAsync();
        }

        if (options.install) {
            return await this.installSubagentsAsync();
        }

        return await this.showHelpAsync();
    }

    // Backward compatible sync versions (using fallback)
    listAvailableSubagents() {
        // For sync compatibility, we fall back to the sync version
        // In a real scenario, you might want to use sync fs operations here
        console.warn('Using async method synchronously. Consider using the async version.');
        
        // Use the sync fallback from the original implementation
        const { SubagentsCoreService } = require('./subagents-core');
        const syncService = new SubagentsCoreService();
        const result = syncService.getSubagentNames();
        
        return result.match(
            (names) => {
                SubagentFormatter.displayList(names);
                return true;
            },
            (error) => {
                SubagentFormatter.displayError(`Failed to list subagents: ${error.message}`);
                return false;
            }
        );
    }

    installSubagents() {
        console.warn('Using async method synchronously. Consider using the async version.');
        
        const { SubagentsCoreService } = require('./subagents-core');
        const syncService = new SubagentsCoreService();
        const result = syncService.installAllSubagents();
        
        return result.match(
            (installationData) => {
                SubagentFormatter.displayInstallation({
                    subagents: [...installationData.installed, ...installationData.failed.map(f => f.filename)],
                    onProgress: (callback) => {
                        installationData.installed.forEach(filename => {
                            callback(filename, true, null);
                        });
                        
                        installationData.failed.forEach(failure => {
                            callback(failure.filename, false, failure.error);
                        });
                    },
                    onDirectoryCreated: (callback) => {
                        if (installationData.summary.directoryCreated) {
                            callback(installationData.summary.path);
                        }
                    },
                    summary: installationData.summary
                });
                
                return installationData.summary.installed > 0;
            },
            (error) => {
                SubagentFormatter.displayError(`Installation failed: ${error.message}`);
                return false;
            }
        );
    }

    showHelp() {
        const { SubagentsCoreService } = require('./subagents-core');
        const syncService = new SubagentsCoreService();
        const countResult = syncService.getAvailableSubagents();
        const count = countResult.unwrapOr([]).length;
        
        SubagentFormatter.displayHelp(count);
        return true;
    }

    handleCommand(options) {
        if (options.help) {
            return this.showHelp();
        }

        if (options.list) {
            return this.listAvailableSubagents();
        }

        if (options.install) {
            return this.installSubagents();
        }

        return this.showHelp();
    }

    // Pure async business logic methods
    async getStatusAsync() {
        return await this.coreService.getInstallationStatus();
    }

    async validateInstallationAsync() {
        return await this.coreService.validateInstallation();
    }

    async getAvailableSubagentsAsync() {
        return await this.coreService.getSubagentNames();
    }
}

// Create manager instance
const asyncSubagentsManager = new AsyncSubagentsManager();

module.exports = {
    // Legacy compatibility - sync interface
    handleCommand: (options) => asyncSubagentsManager.handleCommand(options),
    listAvailableSubagents: () => asyncSubagentsManager.listAvailableSubagents(),
    installSubagents: () => asyncSubagentsManager.installSubagents(),
    showHelp: () => asyncSubagentsManager.showHelp(),
    
    // New async interface (recommended)
    handleCommandAsync: (options) => asyncSubagentsManager.handleCommandAsync(options),
    listAvailableSubagentsAsync: () => asyncSubagentsManager.listAvailableSubagentsAsync(),
    installSubagentsAsync: () => asyncSubagentsManager.installSubagentsAsync(),
    showHelpAsync: () => asyncSubagentsManager.showHelpAsync(),
    
    // Pure business logic (async)
    getStatusAsync: () => asyncSubagentsManager.getStatusAsync(),
    validateInstallationAsync: () => asyncSubagentsManager.validateInstallationAsync(),
    getAvailableSubagentsAsync: () => asyncSubagentsManager.getAvailableSubagentsAsync(),
    
    // Export classes for advanced usage
    AsyncSubagentsManager,
    AsyncSubagentsCoreService,
    AsyncResult
};