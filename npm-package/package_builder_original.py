#!/usr/bin/env python3
"""
NPM Package Builder for Claude Dev Toolkit
Refactored implementation for REQ-001: NPM Package Structure
"""

import os
import json
from pathlib import Path
from typing import Dict, List, Optional


class NPMPackageBuilder:
    """Builder class for creating NPM package structure"""
    
    PACKAGE_NAME = "claude-dev-toolkit"
    VERSION = "1.0.0"
    
    # Directory structure constants
    REQUIRED_DIRS = ['bin', 'lib', 'commands', 'templates', 'hooks']
    COMMAND_SUBDIRS = ['active', 'experimental']
    
    # Library module templates
    LIB_MODULES = {
        "utils.js": """// Utility functions for Claude Dev Toolkit
const path = require('path');
const fs = require('fs');

module.exports = {
    ensureDirectory: (dirPath) => {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    },
    
    isValidCommand: (commandName) => {
        return /^[a-z][a-z0-9-]*$/.test(commandName);
    }
};
""",
        "config.js": """// Configuration management for Claude Dev Toolkit
const path = require('path');
const os = require('os');

module.exports = {
    getConfigPath: () => {
        return path.join(os.homedir(), '.claude', 'commands');
    },
    
    defaultConfig: {
        commandsPath: './commands',
        hooksEnabled: true,
        colorOutput: true
    }
};
""",
        "installer.js": """// Installation logic for Claude Dev Toolkit
const fs = require('fs');
const path = require('path');
const { ensureDirectory } = require('./utils');

module.exports = {
    install: async (options = {}) => {
        const targetDir = options.targetDir || path.join(os.homedir(), '.claude', 'commands');
        ensureDirectory(targetDir);
        
        // Installation logic here
        console.log(`Installing commands to ${targetDir}`);
        
        return { success: true, installedPath: targetDir };
    }
};
"""
    }
    
    def __init__(self, root_path: str):
        """Initialize the package builder
        
        Args:
            root_path: The root directory where the package will be created
        """
        self.root_path = Path(root_path)
        self.package_root = self.root_path / self.PACKAGE_NAME
        
    def build(self) -> Path:
        """Build the complete NPM package structure
        
        Returns:
            Path to the created package root
        """
        self._create_directory_structure()
        self._create_package_json()
        self._create_executable()
        self._create_lib_modules()
        self._create_documentation()
        self._create_gitignore()
        
        return self.package_root
    
    def _create_directory_structure(self):
        """Create all required directories"""
        # Create package root
        self.package_root.mkdir(parents=True, exist_ok=True)
        
        # Create main directories
        for dir_name in self.REQUIRED_DIRS:
            (self.package_root / dir_name).mkdir(exist_ok=True)
        
        # Create command subdirectories
        commands_dir = self.package_root / "commands"
        for subdir in self.COMMAND_SUBDIRS:
            (commands_dir / subdir).mkdir(parents=True, exist_ok=True)
    
    def _create_package_json(self):
        """Create package.json with all required fields"""
        package_config = {
            "name": self.PACKAGE_NAME,
            "version": self.VERSION,
            "description": "Custom commands toolkit for Claude Code - streamline your development workflow",
            "author": "Paul Duvall",
            "license": "MIT",
            "keywords": [
                "claude-code",
                "claude",
                "ai",
                "development",
                "automation",
                "commands"
            ],
            "repository": {
                "type": "git",
                "url": "https://github.com/PaulDuvall/claude-code.git"
            },
            "bugs": {
                "url": "https://github.com/PaulDuvall/claude-code/issues"
            },
            "homepage": "https://github.com/PaulDuvall/claude-code#readme",
            "bin": {
                "claude-commands": "./bin/claude-commands"
            },
            "scripts": {
                "postinstall": "node scripts/postinstall.js",
                "test": "npm run test:unit && npm run test:integration",
                "test:unit": "jest --testPathPattern=tests/unit",
                "test:integration": "jest --testPathPattern=tests/integration",
                "lint": "eslint lib/**/*.js bin/**/*.js",
                "validate": "node scripts/validate.js"
            },
            "dependencies": {},
            "devDependencies": {
                "jest": "^29.0.0",
                "eslint": "^8.0.0"
            },
            "engines": {
                "node": ">=16.0.0"
            },
            "files": [
                "bin/",
                "lib/",
                "commands/",
                "templates/",
                "hooks/",
                "scripts/",
                "README.md",
                "LICENSE"
            ]
        }
        
        package_json_path = self.package_root / "package.json"
        with open(package_json_path, 'w') as f:
            json.dump(package_config, f, indent=2)
            f.write('\n')  # Add trailing newline
    
    def _create_executable(self):
        """Create the main CLI executable"""
        executable_content = """#!/usr/bin/env node

/**
 * Claude Commands CLI
 * Main entry point for the claude-dev-toolkit
 */

const path = require('path');
const fs = require('fs');
const { program } = require('commander');
const { version, description } = require('../package.json');

program
    .name('claude-commands')
    .description(description)
    .version(version);

program
    .command('list')
    .description('List all available commands')
    .option('-a, --active', 'Show only active commands')
    .option('-e, --experimental', 'Show only experimental commands')
    .action((options) => {
        console.log('Available commands:');
        // Implementation to list commands
    });

program
    .command('install')
    .description('Install command sets')
    .option('--active', 'Install active commands only')
    .option('--experimental', 'Install experimental commands')
    .option('--all', 'Install all commands')
    .action((options) => {
        const installer = require('../lib/installer');
        installer.install(options);
    });

program
    .command('status')
    .description('Show installation status')
    .action(() => {
        console.log('Claude Dev Toolkit Status');
        // Implementation to show status
    });

program.parse(process.argv);
"""
        
        bin_file = self.package_root / "bin" / "claude-commands"
        bin_file.write_text(executable_content)
        # Make it executable
        bin_file.chmod(0o755)
    
    def _create_lib_modules(self):
        """Create library modules with proper implementations"""
        lib_dir = self.package_root / "lib"
        
        for filename, content in self.LIB_MODULES.items():
            module_path = lib_dir / filename
            module_path.write_text(content)
    
    def _create_documentation(self):
        """Create README and other documentation"""
        readme_content = """# Claude Dev Toolkit

[![npm version](https://badge.fury.io/js/claude-dev-toolkit.svg)](https://www.npmjs.com/package/claude-dev-toolkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

NPM package for Claude Code custom commands - accelerate your development workflow with AI-powered automation.

## 🚀 Installation

```bash
npm install -g claude-dev-toolkit
```

## 📦 What's Included

- **13 Active Commands**: Production-ready commands for immediate use
- **44 Experimental Commands**: Cutting-edge features for early adopters
- **Security Hooks**: Automated security validation
- **Configuration Templates**: Pre-configured settings for different workflows

## 🎯 Quick Start

After installation, run the setup wizard:

```bash
claude-commands install --active
```

This will install all active commands to your Claude Code configuration.

## 📋 Available Commands

### Active Commands (Production Ready)
- `/xarchitecture` - System architecture design
- `/xconfig` - Configuration management
- `/xdebug` - Advanced debugging assistance
- `/xdocs` - Documentation generation
- `/xgit` - Automated Git workflow
- `/xpipeline` - CI/CD pipeline management
- `/xquality` - Code quality analysis
- `/xrefactor` - Code refactoring automation
- `/xrelease` - Release management
- `/xsecurity` - Security scanning
- `/xspec` - Specification generation
- `/xtdd` - Test-driven development
- `/xtest` - Testing automation

### Experimental Commands
44 additional commands for advanced workflows and experimentation.

## 🛠️ CLI Usage

```bash
# List all available commands
claude-commands list

# Install specific command sets
claude-commands install --active        # Active commands only
claude-commands install --experimental  # Experimental commands
claude-commands install --all          # Everything

# Check installation status
claude-commands status

# Validate installation
claude-commands validate

# Update commands
claude-commands update

# Uninstall
claude-commands uninstall
```

## 🔧 Configuration

Commands are installed to `~/.claude/commands/` by default.

## 📚 Documentation

For detailed documentation, visit [GitHub Repository](https://github.com/PaulDuvall/claude-code)

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

## 📄 License

MIT © Paul Duvall

## 🙏 Acknowledgments

Built for the Claude Code community.
"""
        
        (self.package_root / "README.md").write_text(readme_content)
    
    def _create_gitignore(self):
        """Create comprehensive .gitignore file"""
        gitignore_content = """# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# Testing
coverage/
.nyc_output/

# Production
dist/
build/

# Environment
.env
.env.local
.env.*.local

# OS Files
.DS_Store
Thumbs.db
*.swp
*.swo
*~

# IDE
.vscode/
.idea/
*.sublime-project
*.sublime-workspace

# Logs
logs/
*.log

# Cache
.npm/
.eslintcache
"""
        
        (self.package_root / ".gitignore").write_text(gitignore_content)


def create_npm_package(root_path: str) -> Path:
    """Convenience function to create NPM package
    
    Args:
        root_path: The root directory where the package will be created
        
    Returns:
        Path to the created package root
    """
    builder = NPMPackageBuilder(root_path)
    return builder.build()


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        package_path = create_npm_package(sys.argv[1])
        print(f"Package created at: {package_path}")