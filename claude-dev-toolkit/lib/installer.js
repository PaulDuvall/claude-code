// Enhanced Installation logic for Claude Dev Toolkit - Phase 2 Implementation
const fs = require('fs');
const path = require('path');
const os = require('os');
const { ensureDirectory } = require('./utils');

class CommandInstaller {
    constructor() {
        this.claudeDir = path.join(os.homedir(), '.claude', 'commands');
        this.backupDir = path.join(os.homedir(), '.claude', 'backups');
        this.packageDir = path.join(__dirname, '..');
        this.installedCount = 0;
        this.skippedCount = 0;
        this.backedUpCount = 0;
    }

    /**
     * Create backup of existing commands
     */
    async createBackup() {
        if (!fs.existsSync(this.claudeDir)) {
            return null;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(this.backupDir, `commands-backup-${timestamp}`);
        
        ensureDirectory(backupPath);
        
        const files = fs.readdirSync(this.claudeDir).filter(f => f.endsWith('.md'));
        files.forEach(file => {
            fs.copyFileSync(
                path.join(this.claudeDir, file),
                path.join(backupPath, file)
            );
            this.backedUpCount++;
        });

        return backupPath;
    }

    /**
     * Check if a command matches include/exclude patterns
     */
    matchesPattern(filename, pattern) {
        // Simple pattern matching - can be enhanced with glob patterns
        if (pattern.includes('*')) {
            const regex = new RegExp(pattern.replace('*', '.*'));
            return regex.test(filename);
        }
        return filename.includes(pattern);
    }

    /**
     * Get list of commands to install based on options
     */
    getCommandsToInstall(options) {
        const commands = [];
        
        // Determine which command sets to install
        const installActive = options.active || options.all || 
                            (!options.active && !options.experiments && !options.all);
        const installExperiments = options.experiments || options.all;

        // Collect active commands
        if (installActive) {
            const activeSource = path.join(this.packageDir, 'commands', 'active');
            if (fs.existsSync(activeSource)) {
                const activeFiles = fs.readdirSync(activeSource)
                    .filter(f => f.endsWith('.md'))
                    .map(f => ({ file: f, source: activeSource, type: 'active' }));
                commands.push(...activeFiles);
            }
        }

        // Collect experimental commands
        if (installExperiments) {
            const expSource = path.join(this.packageDir, 'commands', 'experiments');
            if (fs.existsSync(expSource)) {
                const expFiles = fs.readdirSync(expSource)
                    .filter(f => f.endsWith('.md'))
                    .map(f => ({ file: f, source: expSource, type: 'experimental' }));
                commands.push(...expFiles);
            }
        }

        // Apply include/exclude filters
        let filteredCommands = commands;
        
        if (options.include) {
            const patterns = Array.isArray(options.include) ? options.include : [options.include];
            filteredCommands = filteredCommands.filter(cmd => 
                patterns.some(pattern => this.matchesPattern(cmd.file, pattern))
            );
        }

        if (options.exclude) {
            const patterns = Array.isArray(options.exclude) ? options.exclude : [options.exclude];
            filteredCommands = filteredCommands.filter(cmd => 
                !patterns.some(pattern => this.matchesPattern(cmd.file, pattern))
            );
        }

        return filteredCommands;
    }

    /**
     * Main install method with enhanced options
     */
    async install(options = {}) {
        console.log('🚀 Installing Claude Custom Commands...\n');
        
        const startTime = Date.now();

        // Handle dry-run mode
        if (options['dry-run'] || options.dryRun) {
            return this.dryRun(options);
        }

        // Create backup if requested
        if (options.backup) {
            const backupPath = await this.createBackup();
            if (backupPath && this.backedUpCount > 0) {
                console.log(`📦 Created backup of ${this.backedUpCount} commands`);
                console.log(`   Location: ${backupPath}\n`);
            }
        }

        // Ensure main commands directory exists
        ensureDirectory(this.claudeDir);

        // Get commands to install
        const commandsToInstall = this.getCommandsToInstall(options);

        // Install commands
        const installResults = {
            active: 0,
            experimental: 0
        };

        commandsToInstall.forEach(cmd => {
            const sourcePath = path.join(cmd.source, cmd.file);
            const destPath = path.join(this.claudeDir, cmd.file);
            
            try {
                fs.copyFileSync(sourcePath, destPath);
                
                // Set proper permissions (readable)
                fs.chmodSync(destPath, 0o644);
                
                this.installedCount++;
                installResults[cmd.type]++;
            } catch (error) {
                console.error(`⚠️  Failed to install ${cmd.file}: ${error.message}`);
                this.skippedCount++;
            }
        });

        // Report results
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        if (installResults.active > 0) {
            console.log(`✅ Installed ${installResults.active} active commands`);
        }
        if (installResults.experimental > 0) {
            console.log(`✅ Installed ${installResults.experimental} experimental commands`);
        }
        if (this.skippedCount > 0) {
            console.log(`⚠️  Skipped ${this.skippedCount} commands due to errors`);
        }

        console.log(`\n🎉 Installation complete! ${this.installedCount} commands installed.`);
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
            installedPath: this.claudeDir,
            commandsInstalled: this.installedCount,
            skipped: this.skippedCount,
            duration: duration,
            backupPath: options.backup ? this.backupDir : null
        };
    }

    /**
     * Dry run mode - show what would be installed
     */
    async dryRun(options) {
        console.log('🔍 DRY RUN MODE - No changes will be made\n');

        const commandsToInstall = this.getCommandsToInstall(options);
        
        console.log('📋 Would install the following commands:');
        console.log(`   Destination: ${this.claudeDir}\n`);

        const byType = {
            active: commandsToInstall.filter(c => c.type === 'active'),
            experimental: commandsToInstall.filter(c => c.type === 'experimental')
        };

        if (byType.active.length > 0) {
            console.log(`📦 Active Commands (${byType.active.length}):`);
            byType.active.forEach(cmd => console.log(`   • ${cmd.file}`));
        }

        if (byType.experimental.length > 0) {
            console.log(`\n🧪 Experimental Commands (${byType.experimental.length}):`);
            byType.experimental.forEach(cmd => console.log(`   • ${cmd.file}`));
        }

        if (options.backup) {
            console.log('\n📦 Would create backup before installation');
        }

        console.log(`\n📊 Total commands to install: ${commandsToInstall.length}`);
        
        return {
            success: true,
            dryRun: true,
            wouldInstall: commandsToInstall.length,
            details: byType
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
