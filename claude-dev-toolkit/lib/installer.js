// Installation logic for Claude Dev Toolkit
const fs = require('fs');
const path = require('path');
const os = require('os');
const { ensureDirectory } = require('./utils');

module.exports = {
    install: async (options = {}) => {
        const claudeDir = path.join(os.homedir(), '.claude', 'commands');
        const packageDir = path.join(__dirname, '..');
        
        console.log('🚀 Installing Claude Custom Commands...\n');
        
        // Ensure directories exist
        ensureDirectory(claudeDir);
        ensureDirectory(path.join(claudeDir, 'active'));
        ensureDirectory(path.join(claudeDir, 'experimental'));
        
        let installedCount = 0;
        
        // Install active commands
        if (options.active || options.all || (!options.active && !options.experimental)) {
            const activeSource = path.join(packageDir, 'commands', 'active');
            const activeTarget = path.join(claudeDir, 'active');
            
            if (fs.existsSync(activeSource)) {
                const activeFiles = fs.readdirSync(activeSource).filter(f => f.endsWith('.md'));
                activeFiles.forEach(file => {
                    fs.copyFileSync(
                        path.join(activeSource, file),
                        path.join(activeTarget, file)
                    );
                });
                installedCount += activeFiles.length;
                console.log(`✅ Installed ${activeFiles.length} active commands`);
            }
        }
        
        // Install experimental commands
        if (options.experimental || options.all) {
            const expSource = path.join(packageDir, 'commands', 'experimental');
            const expTarget = path.join(claudeDir, 'experimental');
            
            if (fs.existsSync(expSource)) {
                const expFiles = fs.readdirSync(expSource).filter(f => f.endsWith('.md'));
                expFiles.forEach(file => {
                    fs.copyFileSync(
                        path.join(expSource, file),
                        path.join(expTarget, file)
                    );
                });
                installedCount += expFiles.length;
                console.log(`✅ Installed ${expFiles.length} experimental commands`);
            }
        }
        
        console.log(`\n🎉 Installation complete! ${installedCount} commands installed.`);
        console.log('\nNext steps:');
        console.log('• Try: claude-commands list');
        console.log('• Use commands in Claude Code: /xhelp');
        
        return { 
            success: true, 
            installedPath: claudeDir,
            commandsInstalled: installedCount
        };
    }
};
