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
        console.log('🚀 Installing Claude Custom Commands...\n');
        
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
                console.log('📦 Creating backup before installation...');
                const backupResult = await this.backupService.create(`pre-install-${Date.now()}`);
                console.log(`   Backup created: ${backupResult.name}\n`);
            }

            // Install commands using service
            const result = await this.installerService.install(options);

            // Report results
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            
            if (result.results.active > 0) {
                console.log(`✅ Installed ${result.results.active} active commands`);
            }
            if (result.results.experimental > 0) {
                console.log(`✅ Installed ${result.results.experimental} experimental commands`);
            }
            if (result.skippedCount > 0) {
                console.log(`⚠️  Skipped ${result.skippedCount} commands due to errors`);
            }

            console.log(`\n🎉 Installation complete! ${result.installedCount} commands installed.`);
            console.log(`⏱️  Time taken: ${duration}s`);
            
            // Performance check
            if (parseFloat(duration) > 30) {
                console.log('⚠️  Installation took longer than expected (>30s)');
            }

            console.log('\nNext steps:');
            console.log('• Verify: claude-commands verify');
            console.log('• List: claude-commands list');
            console.log('• Use in Claude Code: /xhelp');
            
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
        console.log('🔍 DRY RUN MODE - No changes will be made\n');

        const preview = this.installerService.getDryRunPreview(options);
        
        console.log('📋 Would install the following commands:');
        console.log(`   Destination: ${preview.destination}\n`);

        if (preview.byType.active.length > 0) {
            console.log(`📦 Active Commands (${preview.byType.active.length}):`);
            preview.byType.active.forEach(cmd => console.log(`   • ${cmd.file}`));
        }

        if (preview.byType.experimental.length > 0) {
            console.log(`\n🧪 Experimental Commands (${preview.byType.experimental.length}):`);
            preview.byType.experimental.forEach(cmd => console.log(`   • ${cmd.file}`));
        }

        if (options.backup) {
            console.log('\n📦 Would create backup before installation');
        }

        console.log(`\n📊 Total commands to install: ${preview.total}`);
        
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