#!/usr/bin/env python3
"""
Refactored NPM Package Builder for Claude Dev Toolkit
Applies Extract Class, Extract Method, and Replace Magic Literals patterns
"""

import json
from pathlib import Path
from typing import Dict
from abc import ABC, abstractmethod


class FileContentProvider(ABC):
    """Abstract base for providing file content"""
    
    @abstractmethod
    def get_content(self) -> str:
        pass


class PackageJsonBuilder:
    """Responsible for building package.json content"""
    
    PACKAGE_NAME = "claude-dev-toolkit"
    VERSION = "1.0.0"
    
    def build(self) -> Dict:
        """Build package.json configuration"""
        return {
            "name": self.PACKAGE_NAME,
            "version": self.VERSION,
            "description": self._get_description(),
            "author": "Paul Duvall",
            "license": "MIT",
            "keywords": self._get_keywords(),
            "repository": self._get_repository(),
            "bugs": self._get_bugs(),
            "homepage": self._get_homepage(),
            "bin": self._get_bin_config(),
            "scripts": self._get_scripts(),
            "dependencies": {},
            "devDependencies": self._get_dev_dependencies(),
            "engines": self._get_engines(),
            "files": self._get_files()
        }
    
    def _get_description(self) -> str:
        return "Custom commands toolkit for Claude Code - streamline your development workflow"
    
    def _get_keywords(self) -> list:
        return ["claude-code", "claude", "ai", "development", "automation", "commands"]
    
    def _get_repository(self) -> Dict:
        return {
            "type": "git",
            "url": "https://github.com/PaulDuvall/claude-code.git"
        }
    
    def _get_bugs(self) -> Dict:
        return {"url": "https://github.com/PaulDuvall/claude-code/issues"}
    
    def _get_homepage(self) -> str:
        return "https://github.com/PaulDuvall/claude-code#readme"
    
    def _get_bin_config(self) -> Dict:
        return {"claude-commands": "./bin/claude-commands"}
    
    def _get_scripts(self) -> Dict:
        return {
            "postinstall": "node scripts/postinstall.js",
            "test": "npm run test:unit && npm run test:integration",
            "test:unit": "jest --testPathPattern=tests/unit",
            "test:integration": "jest --testPathPattern=tests/integration",
            "lint": "eslint lib/**/*.js bin/**/*.js",
            "validate": "node scripts/validate.js"
        }
    
    def _get_dev_dependencies(self) -> Dict:
        return {
            "jest": "^29.0.0",
            "eslint": "^8.0.0"
        }
    
    def _get_engines(self) -> Dict:
        return {"node": ">=16.0.0"}
    
    def _get_files(self) -> list:
        return [
            "bin/", "lib/", "commands/", "templates/",
            "hooks/", "scripts/", "README.md", "LICENSE"
        ]


class CLIExecutableBuilder(FileContentProvider):
    """Builds CLI executable content"""
    
    def get_content(self) -> str:
        return self._generate_header() + self._generate_imports() + \
               self._generate_commands() + self._generate_main()
    
    def _generate_header(self) -> str:
        return """#!/usr/bin/env node

/**
 * Claude Commands CLI
 * Main entry point for the claude-dev-toolkit
 */

"""
    
    def _generate_imports(self) -> str:
        return """const path = require('path');
const fs = require('fs');
const { program } = require('commander');
const { version, description } = require('../package.json');

"""
    
    def _generate_commands(self) -> str:
        return """program
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
    });

"""
    
    def _generate_main(self) -> str:
        return "program.parse(process.argv);\n"


class LibraryModuleFactory:
    """Factory for creating library module content"""
    
    @staticmethod
    def create_utils() -> str:
        return """// Utility functions for Claude Dev Toolkit
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
"""
    
    @staticmethod
    def create_config() -> str:
        return """// Configuration management for Claude Dev Toolkit
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
"""
    
    @staticmethod
    def create_installer() -> str:
        return """// Installation logic for Claude Dev Toolkit
const fs = require('fs');
const path = require('path');
const { ensureDirectory } = require('./utils');

module.exports = {
    install: async (options = {}) => {
        const targetDir = options.targetDir || path.join(os.homedir(), '.claude', 'commands');
        ensureDirectory(targetDir);
        console.log(`Installing commands to ${targetDir}`);
        return { success: true, installedPath: targetDir };
    }
};
"""


class DocumentationBuilder(FileContentProvider):
    """Builds documentation content"""
    
    def get_content(self) -> str:
        sections = [
            self._header(),
            self._badges(),
            self._description(),
            self._installation(),
            self._whats_included(),
            self._quick_start(),
            self._available_commands(),
            self._cli_usage(),
            self._configuration(),
            self._documentation_links(),
            self._contributing(),
            self._license(),
            self._acknowledgments()
        ]
        return '\n\n'.join(sections)
    
    def _header(self) -> str:
        return "# Claude Dev Toolkit"
    
    def _badges(self) -> str:
        return """[![npm version](https://badge.fury.io/js/claude-dev-toolkit.svg)](https://www.npmjs.com/package/claude-dev-toolkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)"""
    
    def _description(self) -> str:
        return "NPM package for Claude Code custom commands - accelerate your development workflow with AI-powered automation."
    
    def _installation(self) -> str:
        return """## 🚀 Installation

```bash
npm install -g claude-dev-toolkit
```"""
    
    def _whats_included(self) -> str:
        return """## 📦 What's Included

- **13 Active Commands**: Production-ready commands for immediate use
- **44 Experimental Commands**: Cutting-edge features for early adopters
- **Security Hooks**: Automated security validation
- **Configuration Templates**: Pre-configured settings for different workflows"""
    
    def _quick_start(self) -> str:
        return """## 🎯 Quick Start

After installation, run the setup wizard:

```bash
claude-commands install --active
```

This will install all active commands to your Claude Code configuration."""
    
    def _available_commands(self) -> str:
        return """## 📋 Available Commands

### Active Commands (Production Ready)
- `/xarchitecture` - System architecture design
- `/xconfig` - Configuration management
- [... more commands ...]"""
    
    def _cli_usage(self) -> str:
        return """## 🛠️ CLI Usage

```bash
# List all available commands
claude-commands list

# Install specific command sets
claude-commands install --active
```"""
    
    def _configuration(self) -> str:
        return "## 🔧 Configuration\n\nCommands are installed to `~/.claude/commands/` by default."
    
    def _documentation_links(self) -> str:
        return "## 📚 Documentation\n\nFor detailed documentation, visit [GitHub Repository](https://github.com/PaulDuvall/claude-code)"
    
    def _contributing(self) -> str:
        return "## 🤝 Contributing\n\nContributions are welcome! Please read our contributing guidelines."
    
    def _license(self) -> str:
        return "## 📄 License\n\nMIT © Paul Duvall"
    
    def _acknowledgments(self) -> str:
        return "## 🙏 Acknowledgments\n\nBuilt for the Claude Code community."


class DirectoryStructureBuilder:
    """Manages directory structure creation"""
    
    REQUIRED_DIRS = ['bin', 'lib', 'commands', 'templates', 'hooks']
    COMMAND_SUBDIRS = ['active', 'experimental']
    
    def __init__(self, package_root: Path):
        self.package_root = package_root
    
    def create_all(self):
        """Create all required directories"""
        self.package_root.mkdir(parents=True, exist_ok=True)
        
        for dir_name in self.REQUIRED_DIRS:
            (self.package_root / dir_name).mkdir(exist_ok=True)
        
        commands_dir = self.package_root / "commands"
        for subdir in self.COMMAND_SUBDIRS:
            (commands_dir / subdir).mkdir(parents=True, exist_ok=True)


class NPMPackageBuilder:
    """Main builder orchestrating package creation - refactored"""
    
    def __init__(self, root_path: str):
        self.root_path = Path(root_path)
        self.package_root = self.root_path / "claude-dev-toolkit"
        
        # Compose with specialized builders
        self.directory_builder = DirectoryStructureBuilder(self.package_root)
        self.package_json_builder = PackageJsonBuilder()
        self.cli_builder = CLIExecutableBuilder()
        self.doc_builder = DocumentationBuilder()
        self.module_factory = LibraryModuleFactory()
    
    def build(self) -> Path:
        """Build the complete NPM package structure"""
        self.directory_builder.create_all()
        self._create_package_json()
        self._create_executable()
        self._create_lib_modules()
        self._create_documentation()
        self._create_gitignore()
        
        return self.package_root
    
    def _create_package_json(self):
        """Create package.json file"""
        package_config = self.package_json_builder.build()
        
        with open(self.package_root / "package.json", 'w') as f:
            json.dump(package_config, f, indent=2)
            f.write('\n')
    
    def _create_executable(self):
        """Create the main CLI executable"""
        cli_file = self.package_root / "bin" / "claude-commands"
        cli_file.write_text(self.cli_builder.get_content())
        cli_file.chmod(0o755)
    
    def _create_lib_modules(self):
        """Create library modules"""
        lib_dir = self.package_root / "lib"
        
        modules = {
            "utils.js": self.module_factory.create_utils(),
            "config.js": self.module_factory.create_config(),
            "installer.js": self.module_factory.create_installer()
        }
        
        for filename, content in modules.items():
            (lib_dir / filename).write_text(content)
    
    def _create_documentation(self):
        """Create README"""
        readme_path = self.package_root / "README.md"
        readme_path.write_text(self.doc_builder.get_content())
    
    def _create_gitignore(self):
        """Create .gitignore file"""
        gitignore_content = self._get_gitignore_content()
        (self.package_root / ".gitignore").write_text(gitignore_content)
    
    def _get_gitignore_content(self) -> str:
        """Get gitignore content - extracted for clarity"""
        return """# Dependencies
node_modules/
npm-debug.log*

# Testing
coverage/
.nyc_output/

# Production
dist/
build/

# Environment
.env
.env.local

# OS Files
.DS_Store
*.swp

# IDE
.vscode/
.idea/

# Logs
logs/
*.log

# Cache
.npm/
.eslintcache
"""


def create_npm_package(root_path: str) -> Path:
    """Convenience function to create NPM package"""
    builder = NPMPackageBuilder(root_path)
    return builder.build()


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        package_path = create_npm_package(sys.argv[1])
        print(f"Package created at: {package_path}")