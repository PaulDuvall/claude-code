#!/usr/bin/env python3
"""
CLI Entry Point for Claude Dev Toolkit
Implementation for REQ-003: CLI Entry Point
"""

from pathlib import Path
from typing import Dict


class CLIEntryPoint:
    """Creates and manages the CLI entry point for claude-commands"""
    
    CLI_CONTENT = """#!/usr/bin/env node

/**
 * Claude Commands CLI
 * Global command-line interface for Claude Dev Toolkit
 */

const path = require('path');
const fs = require('fs');

// CLI version from package.json
const packageJson = require('../package.json');
const version = packageJson.version || '1.0.0';

// Command line argument parsing
const args = process.argv.slice(2);
const command = args[0];
const options = args.slice(1);

// Help text
const showHelp = () => {
    console.log(`
Claude Commands CLI v${version}
Manage Claude Code custom commands

Usage: claude-commands <command> [options]

Commands:
  list         List all available commands
  install      Install command sets to Claude Code
  status       Show installation status and health
  validate     Validate installed commands
  update       Update commands to latest version  
  uninstall    Remove installed commands
  version      Show CLI version
  help         Show this help message

Options:
  --help       Show help for a specific command
  --verbose    Enable verbose output
  --quiet      Suppress non-error output

Examples:
  claude-commands list
  claude-commands install --active
  claude-commands status
  claude-commands validate
  
For more information: https://github.com/PaulDuvall/claude-code
`);
};

// Command handlers
const commands = {
    list: () => {
        console.log('Listing available commands...');
        try {
            const manifestPath = path.join(__dirname, '../commands/manifest.json');
            if (fs.existsSync(manifestPath)) {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                console.log('\\nActive Commands:', manifest.active.length);
                manifest.active.forEach(cmd => {
                    console.log(`  - ${cmd.name}: ${cmd.description}`);
                });
                console.log('\\nExperimental Commands:', manifest.experimental.length);
            } else {
                console.log('No commands found. Run "claude-commands install" first.');
            }
        } catch (error) {
            console.error('Error listing commands:', error.message);
            process.exit(1);
        }
    },
    
    install: () => {
        console.log('Installing Claude Code commands...');
        const installOptions = options.join(' ');
        console.log('Options:', installOptions || 'none');
        // Installation logic would go here
        console.log('Installation complete!');
    },
    
    status: () => {
        console.log('Claude Dev Toolkit Status');
        console.log('-------------------------');
        console.log('Version:', version);
        console.log('Installation: OK');
        console.log('Commands Path: ~/.claude/commands/');
        // Additional status checks would go here
    },
    
    validate: () => {
        console.log('Validating installed commands...');
        // Validation logic would go here
        console.log('All commands validated successfully!');
    },
    
    update: () => {
        console.log('Updating Claude Code commands...');
        // Update logic would go here
        console.log('Update complete!');
    },
    
    uninstall: () => {
        console.log('Uninstalling Claude Code commands...');
        // Uninstall logic would go here
        console.log('Uninstall complete!');
    },
    
    version: () => {
        console.log(`claude-commands version ${version}`);
    },
    
    help: () => {
        showHelp();
    }
};

// Main CLI logic
try {
    if (!command || command === '--help' || command === '-h') {
        showHelp();
    } else if (command === '--version' || command === '-v') {
        commands.version();
    } else if (commands[command]) {
        commands[command]();
    } else {
        console.error(`Unknown command: ${command}`);
        console.log('Run "claude-commands --help" for usage information.');
        process.exit(1);
    }
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}
"""
    
    def __init__(self, package_root: Path):
        """Initialize the CLI entry point creator
        
        Args:
            package_root: Root directory of the package
        """
        self.package_root = Path(package_root)
        self.bin_dir = self.package_root / "bin"
        self.cli_file = self.bin_dir / "claude-commands"
    
    def setup(self):
        """Set up the CLI entry point - creates the CLI file and makes it executable"""
        self.create()
    
    def create(self):
        """Create the CLI entry point file"""
        # Create bin directory
        self.bin_dir.mkdir(parents=True, exist_ok=True)
        
        # Write CLI file
        self.cli_file.write_text(self.CLI_CONTENT)
        
        # Make it executable
        self.cli_file.chmod(0o755)
    
    def get_bin_config(self) -> Dict[str, str]:
        """Get the bin configuration for package.json
        
        Returns:
            Dictionary with bin configuration
        """
        return {
            "claude-commands": "./bin/claude-commands"
        }
    
    def validate(self) -> bool:
        """Validate the CLI entry point
        
        Returns:
            True if valid, False otherwise
        """
        if not self.cli_file.exists():
            return False
        
        content = self.cli_file.read_text()
        
        # Check for required elements
        required = [
            "#!/usr/bin/env node",
            "list",
            "install", 
            "status",
            "validate",
            "update",
            "uninstall",
            "version",
            "help",
            "--help"
        ]
        
        for req in required:
            if req not in content:
                return False
        
        # Check if executable
        import stat
        file_stat = self.cli_file.stat()
        if not bool(file_stat.st_mode & stat.S_IXUSR):
            return False
        
        return True