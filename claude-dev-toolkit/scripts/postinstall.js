#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Check for skip flag
const skipSetup = process.env.CLAUDE_SKIP_SETUP === 'true' || 
                 process.argv.includes('--skip-setup');

console.log('🚀 Setting up Claude Custom Commands...');

async function runSetup() {
    try {
        // Get Claude Code directory
        const homeDir = os.homedir();
        const claudeDir = path.join(homeDir, '.claude');
        const commandsDir = path.join(claudeDir, 'commands');
        const hooksDir = path.join(claudeDir, 'hooks');
        
        // Ensure Claude directories exist
        if (!fs.existsSync(claudeDir)) {
            fs.mkdirSync(claudeDir, { recursive: true });
            console.log('✅ Created .claude directory');
        }
        
        if (!fs.existsSync(commandsDir)) {
            fs.mkdirSync(commandsDir, { recursive: true });
            console.log('✅ Created .claude/commands directory');
        }
        
        if (!fs.existsSync(hooksDir)) {
            fs.mkdirSync(hooksDir, { recursive: true });
            console.log('✅ Created .claude/hooks directory');
        }
        
        // Get package installation directory
        const packageDir = __dirname.replace('/scripts', '');
        
        // Check if we should run interactive setup
        if (!skipSetup && process.stdin.isTTY) {
            console.log('\n📋 Starting Interactive Setup Wizard...');
            console.log('(Use --skip-setup or set CLAUDE_SKIP_SETUP=true to skip)\n');
            
            const InteractiveSetupWizard = require('../lib/setup-wizard');
            const wizard = new InteractiveSetupWizard(claudeDir);
            
            // Validate environment first (REQ-006)
            const envCheck = wizard.validateEnvironment();
            if (!envCheck.valid) {
                console.error('❌ Environment validation failed:', envCheck.message);
                process.exit(1);
            }
            
            // Run interactive setup (REQ-007)
            const setupResult = await wizard.runInteractiveSetup();
            
            if (setupResult.completed) {
                const config = setupResult.configuration;
                
                // Install commands based on selection
                const sourceCommandsDir = path.join(packageDir, 'commands');
                if (fs.existsSync(sourceCommandsDir)) {
                    copySelectedCommands(sourceCommandsDir, commandsDir, config);
                }
                
                // Install security hooks if selected
                if (config.securityHooks) {
                    const sourceHooksDir = path.join(packageDir, 'hooks');
                    if (fs.existsSync(sourceHooksDir)) {
                        copySelectedHooks(sourceHooksDir, hooksDir, config.selectedHooks || []);
                    }
                }
                
                // Apply configuration template
                if (config.template) {
                    const templateFile = path.join(packageDir, 'templates', `${config.template}-settings.json`);
                    const targetFile = path.join(claudeDir, 'settings.json');
                    if (fs.existsSync(templateFile)) {
                        fs.copyFileSync(templateFile, targetFile);
                        console.log(`✅ Applied ${config.template} configuration template`);
                    }
                }
            }
        } else {
            // Non-interactive installation - install all commands by default
            console.log('Running non-interactive installation...');
            
            const sourceCommandsDir = path.join(packageDir, 'commands');
            if (fs.existsSync(sourceCommandsDir)) {
                copyCommandsFlat(sourceCommandsDir, commandsDir);
            }
        }
        
        // Count installed commands (now in flat structure)
        if (fs.existsSync(commandsDir)) {
            const installedCommands = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md')).length;
            console.log(`\n📦 Installed ${installedCommands} commands`);
        }
        
        console.log('\n🎉 Installation complete!');
        console.log('\nNext steps:');
        console.log('1. Run: claude-commands list');
        console.log('2. Try: claude-commands --help');
        console.log('3. Configure: claude-commands config');
        console.log('4. Explore commands in Claude Code using /xhelp\n');
        
    } catch (error) {
        console.error('❌ Installation failed:', error.message);
        process.exit(1);
    }
}

function copyAllCommands(sourceDir, targetDir) {
    const items = fs.readdirSync(sourceDir);
    for (const item of items) {
        const sourcePath = path.join(sourceDir, item);
        
        if (fs.statSync(sourcePath).isDirectory()) {
            // For subdirectories, copy their contents directly to targetDir (flat structure)
            copyAllCommands(sourcePath, targetDir);
        } else if (item.endsWith('.md')) {
            // Copy .md files directly to target directory
            const targetPath = path.join(targetDir, item);
            fs.copyFileSync(sourcePath, targetPath);
        }
    }
}

function copySelectedCommands(sourceDir, targetDir, config) {
    // Based on installation type, copy appropriate commands
    const installationType = config.installationType || 'standard';
    
    if (installationType === 'full' || !config.commandSets) {
        // Copy all commands in flat structure
        copyCommandsFlat(sourceDir, targetDir);
    } else {
        // Copy selected command sets
        const commandSets = config.commandSets || [];
        
        // Always copy active commands for standard installation (flat structure)
        if (installationType === 'standard' || commandSets.includes('development')) {
            const activeSource = path.join(sourceDir, 'active');
            if (fs.existsSync(activeSource)) {
                copyCommandsFlat(activeSource, targetDir);
            }
        }
        
        // Copy experimental if selected (flat structure to avoid namespace)
        if (commandSets.includes('experimental') || installationType === 'full') {
            const expSource = path.join(sourceDir, 'experiments');
            if (fs.existsSync(expSource)) {
                copyCommandsFlat(expSource, targetDir);
            }
        }
    }
}

function copyCommandsFlat(sourceDir, targetDir) {
    // Copy all .md files from sourceDir and subdirectories directly to targetDir (flat structure)
    if (!fs.existsSync(sourceDir)) return;
    
    const items = fs.readdirSync(sourceDir);
    for (const item of items) {
        const sourcePath = path.join(sourceDir, item);
        
        if (fs.statSync(sourcePath).isDirectory()) {
            // Recursively copy from subdirectories but maintain flat structure
            copyCommandsFlat(sourcePath, targetDir);
        } else if (item.endsWith('.md')) {
            const targetPath = path.join(targetDir, item);
            fs.copyFileSync(sourcePath, targetPath);
            console.log(`✅ Installed command: ${item}`);
        }
    }
}

function copySelectedHooks(sourceDir, targetDir, selectedHooks) {
    const items = fs.readdirSync(sourceDir);
    for (const item of items) {
        const sourcePath = path.join(sourceDir, item);
        
        // Copy hook if it's selected or if no specific selection (copy all)
        if (selectedHooks.length === 0 || selectedHooks.some(h => item.includes(h))) {
            const targetPath = path.join(targetDir, item);
            fs.copyFileSync(sourcePath, targetPath);
            
            // Make shell scripts executable
            if (item.endsWith('.sh')) {
                fs.chmodSync(targetPath, '755');
            }
            
            console.log(`✅ Installed hook: ${item}`);
        }
    }
}

// Run the setup
runSetup();