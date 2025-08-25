// Enhanced Installation logic for Claude Dev Toolkit - Refactored
const BaseCommand = require('./base/base-command');
const CommandInstallerService = require('./services/command-installer-service');
const BackupService = require('./services/backup-service');
const FileSystemUtils = require('./utils/file-system-utils');

class CommandInstaller extends BaseCommand {
    constructor(config = null) {
        super(config);
        this.installerService = new CommandInstallerService(this.config);
        this.backupService = new BackupService(this.config);
    }

    /**
     * Main install method with enhanced options
     */
    async install(options = {}) {
        this.logger.step('Installing Claude Custom Commands', { options });
        
        const startTime = Date.now();

        try {
            // Handle dry-run mode
            if (options['dry-run'] || options.dryRun) {
                return await this.dryRun(options);
            }

            // Validate installation requirements
            const validation = this.installerService.validateInstallation();
            if (!validation.valid) {
                throw new Error(`Installation validation failed: ${validation.issues.join(', ')}`);
            }

            // Create backup if requested
            if (options.backup) {
                this.logger.step('Creating backup before installation');
                const backupResult = await this.backupService.create(`pre-install-${Date.now()}`);
                this.logger.success(`Backup created: ${backupResult.name}`);
            }

            // Install commands using service
            const result = await this.installerService.install(options);

            // Report results
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            
            const installContext = {
                activeCommands: result.results.active,
                experimentalCommands: result.results.experimental,
                skippedCommands: result.skippedCount,
                totalInstalled: result.installedCount,
                duration: parseFloat(duration)
            };

            if (result.results.active > 0) {
                this.logger.success(`Installed ${result.results.active} active commands`);
            }
            if (result.results.experimental > 0) {
                this.logger.success(`Installed ${result.results.experimental} experimental commands`);
            }
            if (result.skippedCount > 0) {
                this.logger.warn(`Skipped ${result.skippedCount} commands due to errors`);
            }

            this.logger.complete(`Installation complete! ${result.installedCount} commands installed`, installContext);
            
            // Performance check
            if (parseFloat(duration) > 30) {
                this.logger.warn('Installation took longer than expected (>30s)', { 
                    actualDuration: duration,
                    expectedMaxDuration: 30 
                });
            }

            this.logger.info('Next steps:', {
                nextSteps: [
                    'Verify: claude-commands verify',
                    'List: claude-commands list', 
                    'Use in Claude Code: /xhelp'
                ]
            });
            
            return { 
                success: true, 
                installedPath: this.config.commandsDir,
                commandsInstalled: result.installedCount,
                skipped: result.skippedCount,
                duration: duration,
                backupPath: options.backup ? this.config.backupsDir : null
            };

        } catch (error) {
            return this.handleError(error, options);
        }
    }

    /**
     * Dry run mode - show what would be installed
     */
    async dryRun(options) {
        this.logger.info('DRY RUN MODE - No changes will be made', { options });

        const preview = this.installerService.getDryRunPreview(options);
        
        this.logger.info('Would install the following commands:', {
            destination: preview.destination,
            totalCommands: preview.total
        });

        if (preview.byType.active.length > 0) {
            this.logger.info(`Active Commands (${preview.byType.active.length}):`, {
                activeCommands: preview.byType.active.map(cmd => cmd.file)
            });
        }

        if (preview.byType.experimental.length > 0) {
            this.logger.info(`Experimental Commands (${preview.byType.experimental.length}):`, {
                experimentalCommands: preview.byType.experimental.map(cmd => cmd.file)
            });
        }

        if (options.backup) {
            this.logger.info('Would create backup before installation');
        }

        this.logger.success(`Total commands to install: ${preview.total}`, {
            summary: preview.byType,
            dryRun: true
        });
        
        return {
            success: true,
            dryRun: true,
            wouldInstall: preview.total,
            details: preview.byType
        };
    }
}

// Export as function for backward compatibility
module.exports = {
    install: async (options = {}) => {
        const installer = new CommandInstaller();
        return installer.install(options);
    }
};