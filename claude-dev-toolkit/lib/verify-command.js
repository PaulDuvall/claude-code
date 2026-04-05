#!/usr/bin/env node

/**
 * Verify Command Implementation
 * Replaces verify-setup.sh functionality with npm package equivalent
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const BaseCommand = require('./base/base-command');

class VerifyCommand extends BaseCommand {
    constructor(config = null, logger = null) {
        super(config, logger);
        this.homeDir = process.env.TEST_HOME || os.homedir();
        this.claudeDir = path.join(this.homeDir, '.claude');
        this.commandsDir = path.join(this.claudeDir, 'commands');
        this.settingsFile = path.join(this.claudeDir, 'settings.json');
        this.results = {
            overall: 'unknown',
            checks: [],
            issues: [],
            suggestions: []
        };
    }

    /**
     * Main command logic dispatched by BaseCommand.execute()
     */
    async run(options = {}) {
        const { verbose = false, fix = false } = options;

        console.log('🔍 Claude Dev Toolkit Verification\n');

        // Run all verification checks
        await this.checkSystemInformation(verbose);
        await this.checkClaudeCodeInstallation(verbose);
        await this.checkDirectoryStructure(verbose);
        await this.checkCommandInstallation(verbose);
        await this.checkConfiguration(verbose);
        await this.checkHooksInstallation(verbose);

        // Attempt fixes if requested
        if (fix && this.results.issues.length > 0) {
            await this.attemptFixes();
        }

        // Generate final report
        this.generateHealthReport(verbose);

        return this.results;
    }

    /**
     * Check system information
     */
    async checkSystemInformation(verbose) {
        if (verbose) {
            console.log('🖥️  System Information:');
        }
        
        const systemInfo = {
            platform: os.platform(),
            arch: os.arch(),
            nodeVersion: process.version,
            homeDir: this.homeDir
        };
        
        if (verbose) {
            console.log(`   Platform: ${systemInfo.platform} (${systemInfo.arch})`);
            console.log(`   Node.js: ${systemInfo.nodeVersion}`);
            console.log(`   Home: ${systemInfo.homeDir}`);
        }
        
        // Check npm version
        try {
            const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
            systemInfo.npmVersion = npmVersion;
            if (verbose) {
                console.log(`   npm: ${npmVersion}`);
            }
        } catch (error) {
            this.addIssue('npm not found in PATH', 'install Node.js and npm');
        }
        
        this.addCheck('System Information', 'pass', systemInfo);
        if (verbose) console.log('');
    }

    /**
     * Check Claude Code installation
     */
    async checkClaudeCodeInstallation(verbose) {
        if (verbose) {
            console.log('🤖 Claude Code Installation:');
        }
        
        try {
            const version = execSync('claude --version', { encoding: 'utf8' }).trim();
            this.addCheck('Claude Code Installation', 'pass', { version, found: true });
            if (verbose) {
                console.log(`   ✅ Claude Code detected: ${version}`);
            }
        } catch (error) {
            this.addCheck('Claude Code Installation', 'warning', { found: false });
            this.addIssue('Claude Code not found', 'install with: npm install -g @anthropic-ai/claude-code');
            if (verbose) {
                console.log('   ⚠️  Claude Code not detected (optional for toolkit functionality)');
            }
        }
        
        if (verbose) console.log('');
    }

    /**
     * Check directory structure
     */
    async checkDirectoryStructure(verbose) {
        if (verbose) {
            console.log('📁 Directory Structure:');
        }
        
        const directories = [
            { path: this.claudeDir, name: '.claude directory', critical: true },
            { path: this.commandsDir, name: 'commands directory', critical: true },
            { path: path.join(this.claudeDir, 'hooks'), name: 'hooks directory', critical: false },
            { path: path.join(this.claudeDir, 'subagents'), name: 'subagents directory', critical: false }
        ];
        
        let allCriticalExist = true;
        
        directories.forEach(dir => {
            const exists = fs.existsSync(dir.path);
            const status = exists ? 'pass' : (dir.critical ? 'fail' : 'warning');
            
            if (verbose) {
                const icon = exists ? '✅' : (dir.critical ? '❌' : '⚠️');
                console.log(`   ${icon} ${dir.name}: ${exists ? 'exists' : 'missing'}`);
            }
            
            this.addCheck(`Directory: ${dir.name}`, status, { path: dir.path, exists });
            
            if (!exists && dir.critical) {
                allCriticalExist = false;
                this.addIssue(`Missing ${dir.name}`, 'run: claude-commands setup');
            }
        });
        
        if (verbose) console.log('');
        return allCriticalExist;
    }

    /**
     * Check command installation
     */
    async checkCommandInstallation(verbose) {
        if (verbose) {
            console.log('📦 Command Installation:');
        }
        
        try {
            if (!fs.existsSync(this.commandsDir)) {
                this.addCheck('Commands Installation', 'fail', { count: 0, error: 'Commands directory missing' });
                this.addIssue('Commands directory missing', 'run: claude-commands setup');
                if (verbose) {
                    console.log('   ❌ Commands directory not found');
                }
                return;
            }
            
            const commands = fs.readdirSync(this.commandsDir).filter(f => f.endsWith('.md'));
            const commandCount = commands.length;
            
            if (commandCount === 0) {
                this.addCheck('Commands Installation', 'fail', { count: 0 });
                this.addIssue('No commands installed', 'run: claude-commands install --active');
                if (verbose) {
                    console.log('   ❌ No commands found');
                }
            } else {
                this.addCheck('Commands Installation', 'pass', { count: commandCount, commands: commands.slice(0, 5) });
                if (verbose) {
                    console.log(`   ✅ ${commandCount} commands installed`);
                    if (commandCount <= 10) {
                        commands.forEach(cmd => console.log(`      • ${cmd.replace('.md', '')}`));
                    } else {
                        commands.slice(0, 5).forEach(cmd => console.log(`      • ${cmd.replace('.md', '')}`));
                        console.log(`      • ... and ${commandCount - 5} more`);
                    }
                }
            }
        } catch (error) {
            this.addCheck('Commands Installation', 'error', { error: error.message });
            this.addIssue('Cannot read commands directory', 'check permissions and re-run setup');
            if (verbose) {
                console.log(`   💥 Error reading commands: ${error.message}`);
            }
        }
        
        if (verbose) console.log('');
    }

    /**
     * Check configuration
     */
    async checkConfiguration(verbose) {
        if (verbose) {
            console.log('⚙️  Configuration:');
        }
        
        if (fs.existsSync(this.settingsFile)) {
            try {
                const config = JSON.parse(fs.readFileSync(this.settingsFile, 'utf8'));
                const keys = Object.keys(config);
                
                this.addCheck('Configuration File', 'pass', { 
                    exists: true, 
                    keys: keys.length,
                    hasHooks: !!config.hooks,
                    hasPermissions: !!config.permissions 
                });
                
                if (verbose) {
                    console.log('   ✅ Configuration file found');
                    console.log(`   📋 ${keys.length} configuration keys`);
                    if (config.hooks) console.log('   🎣 Hooks configured');
                    if (config.permissions) console.log('   🔒 Permissions configured');
                }
            } catch (error) {
                this.addCheck('Configuration File', 'warning', { exists: true, error: 'Invalid JSON' });
                this.addIssue('Configuration file has invalid JSON', 'run: claude-commands config --reset');
                if (verbose) {
                    console.log('   ⚠️  Configuration file exists but has invalid JSON');
                }
            }
        } else {
            this.addCheck('Configuration File', 'warning', { exists: false });
            if (verbose) {
                console.log('   ⚠️  No configuration file (using defaults)');
                console.log('   💡 Create one with: claude-commands config --template basic');
            }
        }
        
        if (verbose) console.log('');
    }

    /**
     * Check hooks installation
     */
    async checkHooksInstallation(verbose) {
        if (verbose) {
            console.log('🎣 Hooks Installation:');
        }
        
        const hooksDir = path.join(this.claudeDir, 'hooks');
        
        if (fs.existsSync(hooksDir)) {
            try {
                const hooks = fs.readdirSync(hooksDir).filter(f => f.endsWith('.sh'));
                this.addCheck('Hooks Installation', 'pass', { count: hooks.length, hooks });
                if (verbose) {
                    console.log(`   ✅ ${hooks.length} hooks installed`);
                    hooks.forEach(hook => console.log(`      • ${hook}`));
                }
            } catch (error) {
                this.addCheck('Hooks Installation', 'warning', { error: error.message });
                if (verbose) {
                    console.log('   ⚠️  Hooks directory exists but cannot read contents');
                }
            }
        } else {
            this.addCheck('Hooks Installation', 'info', { installed: false });
            if (verbose) {
                console.log('   ℹ️  No hooks installed (optional)');
                console.log('   💡 Install with: claude-commands setup (without --skip-hooks)');
            }
        }
        
        if (verbose) console.log('');
    }

    /**
     * Attempt automatic fixes
     */
    async attemptFixes() {
        console.log('🔧 Attempting automatic fixes...\n');
        
        let fixesApplied = 0;
        
        for (const issue of this.results.issues) {
            try {
                if (issue.description.includes('Commands directory missing')) {
                    console.log('   🔧 Creating commands directory...');
                    fs.mkdirSync(this.commandsDir, { recursive: true });
                    console.log('   ✅ Commands directory created');
                    fixesApplied++;
                } else if (issue.description.includes('No commands installed')) {
                    console.log('   🔧 Installing active commands...');
                    const installer = require('./installer');
                    await installer.install({ active: true });
                    console.log('   ✅ Active commands installed');
                    fixesApplied++;
                }
            } catch (error) {
                console.log(`   ❌ Fix failed: ${error.message}`);
            }
        }
        
        if (fixesApplied > 0) {
            console.log(`\n✅ Applied ${fixesApplied} automatic fixes`);
            console.log('💡 Re-run verification to check results');
        } else {
            console.log('\n⚠️  No automatic fixes available');
            console.log('💡 See suggestions below for manual resolution');
        }
    }

    /**
     * Generate health report
     */
    generateHealthReport(verbose) {
        console.log('🏥 Health Check Report');
        console.log('=' .repeat(40));
        
        const passed = this.results.checks.filter(c => c.status === 'pass').length;
        const failed = this.results.checks.filter(c => c.status === 'fail').length;
        const warnings = this.results.checks.filter(c => c.status === 'warning').length;
        
        // Determine overall health
        if (failed === 0 && warnings === 0) {
            this.results.overall = 'healthy';
            console.log('🟢 Overall Status: HEALTHY');
        } else if (failed === 0) {
            this.results.overall = 'warning';
            console.log('🟡 Overall Status: MINOR ISSUES');
        } else {
            this.results.overall = 'critical';
            console.log('🔴 Overall Status: CRITICAL ISSUES');
        }
        
        console.log(`📊 Summary: ${passed} passed, ${warnings} warnings, ${failed} failed`);
        
        // Show issues and suggestions
        if (this.results.issues.length > 0) {
            console.log('\n❗ Issues Found:');
            this.results.issues.forEach(issue => {
                console.log(`   • ${issue.description}`);
                if (issue.suggestion) {
                    console.log(`     💡 ${issue.suggestion}`);
                }
            });
        }
        
        // Overall recommendations
        if (failed > 0) {
            console.log('\n🚨 Critical Issues Detected:');
            console.log('   Run: claude-commands setup --force');
            console.log('   Or: claude-commands verify --fix');
        } else if (warnings > 0) {
            console.log('\n💡 Recommendations:');
            console.log('   Consider running: claude-commands config --template comprehensive');
        } else {
            console.log('\n✅ Installation is healthy and ready to use!');
            console.log('   Try: /xhelp in Claude Code to see all available commands');
        }
    }

    /**
     * Add check result
     */
    addCheck(name, status, details) {
        this.results.checks.push({ name, status, details, timestamp: new Date().toISOString() });
    }

    /**
     * Add issue
     */
    addIssue(description, suggestion) {
        this.results.issues.push({ description, suggestion });
    }

    /**
     * Get help text for verify command
     */
    getHelpText() {
        return `
Verify the Claude Dev Toolkit installation status and health.

This command replaces the functionality of verify-setup.sh script, providing
comprehensive installation verification and health checking.

Usage:
  claude-commands verify [options]

Options:
  --verbose             Show detailed verification information
  --fix                Attempt to fix detected issues automatically

Examples:
  claude-commands verify
  claude-commands verify --verbose
  claude-commands verify --fix
  claude-commands verify --verbose --fix

The verify command checks:
  • System requirements and environment
  • Claude Code installation status  
  • Directory structure completeness
  • Command installation and count
  • Configuration file validity
  • Hooks installation status
  • Overall health score

Exit codes:
  0 - All checks passed (healthy)
  1 - Minor issues detected (warnings)
  2 - Critical issues detected (requires attention)
        `.trim();
    }
}

module.exports = VerifyCommand;