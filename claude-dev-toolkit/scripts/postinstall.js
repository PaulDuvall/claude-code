#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

console.log('🚀 Setting up Claude Custom Commands...');

try {
    // Get Claude Code directory
    const homeDir = os.homedir();
    const claudeDir = path.join(homeDir, '.claude');
    const commandsDir = path.join(claudeDir, 'commands');
    
    // Ensure Claude directories exist
    if (!fs.existsSync(claudeDir)) {
        fs.mkdirSync(claudeDir, { recursive: true });
        console.log('✅ Created .claude directory');
    }
    
    if (!fs.existsSync(commandsDir)) {
        fs.mkdirSync(commandsDir, { recursive: true });
        console.log('✅ Created .claude/commands directory');
    }
    
    // Get package installation directory
    const packageDir = __dirname.replace('/scripts', '');
    const sourceCommandsDir = path.join(packageDir, 'commands');
    
    if (fs.existsSync(sourceCommandsDir)) {
        // Copy commands to Claude directory
        const copyCommands = (sourceDir, targetDir) => {
            const items = fs.readdirSync(sourceDir);
            for (const item of items) {
                const sourcePath = path.join(sourceDir, item);
                const targetPath = path.join(targetDir, item);
                
                if (fs.statSync(sourcePath).isDirectory()) {
                    if (!fs.existsSync(targetPath)) {
                        fs.mkdirSync(targetPath, { recursive: true });
                    }
                    copyCommands(sourcePath, targetPath);
                } else if (item.endsWith('.md')) {
                    fs.copyFileSync(sourcePath, targetPath);
                }
            }
        };
        
        copyCommands(sourceCommandsDir, commandsDir);
        console.log('✅ Commands installed to ~/.claude/commands/');
        
        // Count installed commands
        const activeCommands = fs.readdirSync(path.join(commandsDir, 'active')).length;
        const experimentalCommands = fs.readdirSync(path.join(commandsDir, 'experimental')).length;
        
        console.log(`📦 Installed ${activeCommands} active commands`);
        console.log(`🧪 Installed ${experimentalCommands} experimental commands`);
    }
    
    console.log('');
    console.log('🎉 Installation complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: claude-commands list');
    console.log('2. Try: claude-commands --help');
    console.log('3. Explore commands in Claude Code using /xhelp');
    console.log('');
    
} catch (error) {
    console.error('❌ Installation failed:', error.message);
    process.exit(1);
}