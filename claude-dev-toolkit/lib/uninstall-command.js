/**
 * Uninstall Command
 *
 * Removes all files installed by claude-dev-toolkit:
 * - ~/.claude/commands/*.md (slash commands)
 * - ~/.claude/hooks/*.sh (hook scripts)
 * - ~/.claude/sub-agents/*.md (subagent definitions)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const BaseCommand = require('./base/base-command');

const CLAUDE_DIR = path.join(os.homedir(), '.claude');

const TARGETS = [
    { dir: path.join(CLAUDE_DIR, 'commands'), pattern: /\.md$/, label: 'commands' },
    { dir: path.join(CLAUDE_DIR, 'hooks'), pattern: /\.sh$/, label: 'hooks' },
    { dir: path.join(CLAUDE_DIR, 'sub-agents'), pattern: /\.md$/, label: 'subagents' },
];

class UninstallCommand extends BaseCommand {
    constructor(config = null, logger = null) {
        super(config, logger);
    }

    async run(options = {}) {
        const { dryRun, keepSettings } = options;
        const prefix = dryRun ? '[DRY RUN] ' : '';

        console.log(`${prefix}Uninstalling claude-dev-toolkit files...\n`);

        const totalRemoved = this._removeAllTargets(dryRun);
        if (!keepSettings) this._handleSettingsCleanup(dryRun, prefix);
        this._printSummary(totalRemoved, dryRun);

        return { removed: totalRemoved, dryRun: !!dryRun };
    }

    _listFiles(dir, pattern) {
        if (!fs.existsSync(dir)) return [];
        return fs.readdirSync(dir)
            .filter(f => pattern.test(f))
            .map(f => path.join(dir, f));
    }

    _removeFiles(files, dryRun) {
        let removed = 0;
        for (const file of files) {
            if (dryRun) {
                console.log(`  Would remove: ${file}`);
            } else {
                fs.unlinkSync(file);
            }
            removed++;
        }
        return removed;
    }

    _removeAllTargets(dryRun) {
        const prefix = dryRun ? '[DRY RUN] ' : '';
        let totalRemoved = 0;

        for (const target of TARGETS) {
            const files = this._listFiles(target.dir, target.pattern);
            if (files.length === 0) continue;

            console.log(`${prefix}Removing ${files.length} ${target.label}:`);
            totalRemoved += this._removeFiles(files, dryRun);
            console.log('');
        }
        return totalRemoved;
    }

    _handleSettingsCleanup(dryRun, prefix) {
        const settingsPath = path.join(CLAUDE_DIR, 'settings.json');
        if (!fs.existsSync(settingsPath)) return;

        console.log(`${prefix}Cleaning settings.json (removing sub_agents key)`);
        if (dryRun) return;

        try {
            const raw = fs.readFileSync(settingsPath, 'utf8');
            const settings = JSON.parse(raw);
            delete settings.sub_agents;
            fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
        } catch (err) {
            console.log(`  Warning: could not clean settings.json: ${err.message}`);
        }
    }

    _printSummary(totalRemoved, dryRun) {
        if (totalRemoved === 0) {
            console.log('Nothing to remove. No installed files found.');
            return;
        }

        const action = dryRun ? 'Would remove' : 'Removed';
        console.log(`\n${action} ${totalRemoved} file(s).`);

        if (!dryRun) {
            console.log('\nTo fully uninstall the npm package:');
            console.log('  npm uninstall -g @paulduvall/claude-dev-toolkit');
        }
    }
}

// Backward-compatible functional export
const instance = new UninstallCommand();
module.exports = { execute: (options) => instance.execute(options) };
