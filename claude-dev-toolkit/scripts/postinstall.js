#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const skipSetup = process.env.CLAUDE_SKIP_SETUP === 'true' ||
                  process.argv.includes('--skip-setup');

console.log('Setting up Claude Custom Commands...');

// --- Directory helpers ---

function ensureDir(dirPath, label) {
    if (fs.existsSync(dirPath)) return;
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`  Created ${label}`);
}

function getClaudeDirs() {
    const homeDir = os.homedir();
    const claudeDir = path.join(homeDir, '.claude');
    return {
        claudeDir,
        commandsDir: path.join(claudeDir, 'commands'),
        hooksDir: path.join(claudeDir, 'hooks')
    };
}

// --- Command copying ---

function copyCommandsFlat(sourceDir, targetDir) {
    if (!fs.existsSync(sourceDir)) return;
    for (const item of fs.readdirSync(sourceDir)) {
        const src = path.join(sourceDir, item);
        if (fs.statSync(src).isDirectory()) {
            copyCommandsFlat(src, targetDir);
        } else if (item.endsWith('.md')) {
            fs.copyFileSync(src, path.join(targetDir, item));
            console.log(`  Installed command: ${item}`);
        }
    }
}

function copyCommandSubdir(sourceDir, subdir, targetDir) {
    const sub = path.join(sourceDir, subdir);
    if (fs.existsSync(sub)) copyCommandsFlat(sub, targetDir);
}

function shouldCopyActive(type, sets) {
    return type === 'standard' || sets.includes('development');
}

function shouldCopyExperimental(type, sets) {
    return type === 'full' || sets.includes('experimental');
}

function copySelectedCommands(sourceDir, targetDir, config) {
    const type = config.installationType || 'standard';
    if (type === 'full' || !config.commandSets) {
        copyCommandsFlat(sourceDir, targetDir);
        return;
    }
    const sets = config.commandSets || [];
    if (shouldCopyActive(type, sets)) copyCommandSubdir(sourceDir, 'active', targetDir);
    if (shouldCopyExperimental(type, sets)) copyCommandSubdir(sourceDir, 'experiments', targetDir);
}

// --- Hook copying ---

function copyHookFile(src, dest, label) {
    fs.copyFileSync(src, dest);
    if (label.endsWith('.sh')) fs.chmodSync(dest, '755');
    console.log(`  Installed hook: ${label}`);
}

function copyHooksLibDir(sourceDir, targetDir) {
    const libSrc = path.join(sourceDir, 'lib');
    if (!fs.existsSync(libSrc)) return;
    const libDest = path.join(targetDir, 'lib');
    ensureDir(libDest, 'hooks/lib');
    for (const f of fs.readdirSync(libSrc)) {
        const src = path.join(libSrc, f);
        if (fs.statSync(src).isFile()) {
            copyHookFile(src, path.join(libDest, f), `lib/${f}`);
        }
    }
}

function copySelectedHooks(sourceDir, targetDir, selectedHooks) {
    for (const item of fs.readdirSync(sourceDir)) {
        const src = path.join(sourceDir, item);
        if (fs.statSync(src).isDirectory()) continue;
        const match = selectedHooks.length === 0 || selectedHooks.some(h => item.includes(h));
        if (match) copyHookFile(src, path.join(targetDir, item), item);
    }
    copyHooksLibDir(sourceDir, targetDir);
}

// --- Template application ---

function applyTemplate(packageDir, claudeDir, templateName) {
    const src = path.join(packageDir, 'templates', `${templateName}-settings.json`);
    if (!fs.existsSync(src)) return;
    const dest = path.join(claudeDir, 'settings.json');
    fs.copyFileSync(src, dest);
    console.log(`  Applied ${templateName} configuration template`);
}

// --- Interactive setup ---

function installFromConfig(packageDir, dirs, config) {
    const cmdSrc = path.join(packageDir, 'commands');
    if (fs.existsSync(cmdSrc)) copySelectedCommands(cmdSrc, dirs.commandsDir, config);
    if (config.securityHooks) {
        const hookSrc = path.join(packageDir, 'hooks');
        if (fs.existsSync(hookSrc)) copySelectedHooks(hookSrc, dirs.hooksDir, config.selectedHooks || []);
    }
    if (config.template) applyTemplate(packageDir, dirs.claudeDir, config.template);
}

async function runInteractiveInstall(packageDir, dirs) {
    console.log('\nStarting Interactive Setup Wizard...');
    console.log('(Use --skip-setup or set CLAUDE_SKIP_SETUP=true to skip)\n');
    const Wizard = require('../lib/setup-wizard');
    const wizard = new Wizard(dirs.claudeDir);
    const envCheck = wizard.validateEnvironment();
    if (!envCheck.valid) {
        console.error('Environment validation failed:', envCheck.message);
        console.error('\nTroubleshooting:');
        console.error('  - Ensure Node.js >= 18 is installed');
        console.error('  - Check write permissions on ~/.claude/');
        console.error('  - Try: claude-commands setup --dry-run');
        process.exit(1);
    }
    const result = await wizard.runInteractiveSetup();
    if (!result.completed) return;
    installFromConfig(packageDir, dirs, result.configuration);
}

// --- Non-interactive setup ---

function runNonInteractiveInstall(packageDir, dirs) {
    console.log('Running non-interactive installation...');
    const cmdSrc = path.join(packageDir, 'commands');
    if (fs.existsSync(cmdSrc)) copyCommandsFlat(cmdSrc, dirs.commandsDir);
}

// --- Main ---

function printSummary(commandsDir) {
    if (fs.existsSync(commandsDir)) {
        const count = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md')).length;
        console.log(`\nInstalled ${count} commands`);
    }
    console.log('\nInstallation complete!');
    console.log('\nNext steps:');
    console.log('1. Run: claude-commands list');
    console.log('2. Try: claude-commands --help');
    console.log('3. Configure: claude-commands config');
    console.log('4. Explore commands in Claude Code using /xhelp\n');
}

function printInstallError(error) {
    console.error('Installation failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  - Check write permissions: ls -la ~/.claude/');
    console.error('  - Try manual install: claude-commands install --all');
    console.error('  - Report issues: https://github.com/PaulDuvall/claude-code/issues');
}

function initDirs() {
    const dirs = getClaudeDirs();
    ensureDir(dirs.claudeDir, '.claude');
    ensureDir(dirs.commandsDir, '.claude/commands');
    ensureDir(dirs.hooksDir, '.claude/hooks');
    return dirs;
}

async function runSetup() {
    try {
        const dirs = initDirs();
        const packageDir = path.dirname(__dirname);

        if (!skipSetup && process.stdin.isTTY) {
            await runInteractiveInstall(packageDir, dirs);
        } else {
            runNonInteractiveInstall(packageDir, dirs);
        }
        printSummary(dirs.commandsDir);
    } catch (error) {
        printInstallError(error);
        process.exit(1);
    }
}

runSetup();
