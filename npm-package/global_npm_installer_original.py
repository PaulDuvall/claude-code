#!/usr/bin/env python3
"""
Global NPM Installer for Claude Dev Toolkit
Implementation for REQ-004: Global NPM Installation
"""

import json
import re
from pathlib import Path
from typing import Dict, List


class GlobalNPMInstaller:
    """Handles global NPM installation setup and validation"""
    
    def __init__(self, package_root: Path):
        """Initialize the global NPM installer
        
        Args:
            package_root: Root directory of the package
        """
        self.package_root = Path(package_root)
        self.package_json_path = self.package_root / "package.json"
        
    def setup(self):
        """Set up the package for global NPM installation"""
        # Ensure package structure exists
        self._ensure_package_structure()
        self._ensure_package_json()
        self._ensure_bin_executable()
        self._ensure_post_install_script()
        self._ensure_lib_modules()
        self._ensure_readme()
    
    def _ensure_package_structure(self):
        """Ensure basic package structure exists"""
        # Create package root
        self.package_root.mkdir(parents=True, exist_ok=True)
        
        # Create required directories
        directories = ['bin', 'lib', 'commands', 'scripts']
        for dir_name in directories:
            (self.package_root / dir_name).mkdir(exist_ok=True)
    
    def _ensure_package_json(self):
        """Ensure package.json exists with proper NPM configuration"""
        if not self.package_json_path.exists():
            # Create minimal package.json for npm publishing
            package_config = {
                "name": "claude-dev-toolkit",
                "version": "1.0.0",
                "description": "Custom commands toolkit for Claude Code - streamline your development workflow",
                "keywords": ["claude-code", "claude", "ai", "development", "automation", "commands"],
                "author": "Paul Duvall",
                "license": "MIT",
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
                    "postinstall": "node scripts/postinstall.js"
                },
                "engines": {
                    "node": ">=16.0.0"
                },
                "files": [
                    "bin/",
                    "lib/",
                    "commands/",
                    "scripts/",
                    "README.md"
                ]
            }
            
            with open(self.package_json_path, 'w') as f:
                json.dump(package_config, f, indent=2)
    
    def _ensure_bin_executable(self):
        """Ensure bin/claude-commands executable exists"""
        bin_file = self.package_root / "bin" / "claude-commands"
        
        if not bin_file.exists():
            cli_content = """#!/usr/bin/env node

/**
 * Claude Commands CLI
 * Global command-line interface for Claude Dev Toolkit
 */

const packageJson = require('../package.json');
const version = packageJson.version || '1.0.0';

console.log(`Claude Commands CLI v${version}`);
console.log('Global installation successful!');

// Show help if no arguments
if (process.argv.length <= 2) {
    console.log('');
    console.log('Usage: claude-commands <command> [options]');
    console.log('');
    console.log('Commands:');
    console.log('  list     List available commands');
    console.log('  install  Install commands');
    console.log('  status   Show status');
    console.log('  --version Show version');
    console.log('  --help    Show help');
}

// Handle version flag
if (process.argv.includes('--version') || process.argv.includes('-v')) {
    console.log(version);
    process.exit(0);
}
"""
            
            bin_file.write_text(cli_content)
            bin_file.chmod(0o755)
    
    def _ensure_post_install_script(self):
        """Ensure post-install script exists"""
        script_file = self.package_root / "scripts" / "postinstall.js"
        
        if not script_file.exists():
            postinstall_content = """#!/usr/bin/env node

/**
 * Post-install script for claude-dev-toolkit
 * Runs after npm install -g claude-dev-toolkit
 */

console.log('');
console.log('🎉 Claude Dev Toolkit installed successfully!');
console.log('');
console.log('Get started:');
console.log('  claude-commands --help');
console.log('  claude-commands list');
console.log('');
console.log('Documentation: https://github.com/PaulDuvall/claude-code');
console.log('');
"""
            
            script_file.write_text(postinstall_content)
            script_file.chmod(0o755)
    
    def _ensure_lib_modules(self):
        """Ensure basic lib modules exist"""
        modules = {
            'utils.js': '// Utility functions\nmodule.exports = {};',
            'config.js': '// Configuration\nmodule.exports = {};',
            'installer.js': '// Installer\nmodule.exports = {};'
        }
        
        lib_dir = self.package_root / "lib"
        for filename, content in modules.items():
            module_file = lib_dir / filename
            if not module_file.exists():
                module_file.write_text(content)
    
    def _ensure_readme(self):
        """Ensure README.md exists"""
        readme_file = self.package_root / "README.md"
        
        if not readme_file.exists():
            readme_content = """# Claude Dev Toolkit

Custom commands toolkit for Claude Code.

## Installation

```bash
npm install -g claude-dev-toolkit
```

## Usage

```bash
claude-commands --help
```
"""
            readme_file.write_text(readme_content)
    
    def validate_for_publishing(self) -> Dict:
        """Validate package for npm publishing
        
        Returns:
            Dictionary with validation results
        """
        result = {
            'valid': True,
            'errors': [],
            'name': None,
            'bin_commands': []
        }
        
        # Check package.json exists
        if not self.package_json_path.exists():
            result['valid'] = False
            result['errors'].append("package.json does not exist")
            return result
        
        try:
            with open(self.package_json_path, 'r') as f:
                package_data = json.load(f)
            
            # Validate required fields
            required_fields = ['name', 'version', 'description', 'author', 'license']
            for field in required_fields:
                if field not in package_data:
                    result['valid'] = False
                    result['errors'].append(f"Missing required field: {field}")
            
            result['name'] = package_data.get('name')
            
            # Validate bin configuration
            if 'bin' in package_data:
                for bin_name, bin_path in package_data['bin'].items():
                    result['bin_commands'].append(bin_name)
                    
                    # Check if bin file exists
                    full_bin_path = self.package_root / bin_path.lstrip('./')
                    if not full_bin_path.exists():
                        result['valid'] = False
                        result['errors'].append(f"Bin file does not exist: {bin_path}")
            
        except json.JSONDecodeError:
            result['valid'] = False
            result['errors'].append("Invalid package.json format")
        
        return result
    
    def simulate_global_install(self) -> Dict:
        """Simulate global npm installation
        
        Returns:
            Dictionary with simulation results
        """
        result = {
            'success': False,
            'global_binaries': [],
            'bin_in_path': False
        }
        
        try:
            with open(self.package_json_path, 'r') as f:
                package_data = json.load(f)
            
            # Simulate bin installation
            if 'bin' in package_data:
                for bin_name in package_data['bin'].keys():
                    result['global_binaries'].append(bin_name)
                
                # Check if bin would be available
                result['bin_in_path'] = 'claude-commands' in result['global_binaries']
                result['success'] = True
            
        except Exception:
            result['success'] = False
        
        return result
    
    def check_cli_availability(self) -> Dict:
        """Check if CLI would be available after installation
        
        Returns:
            Dictionary with availability check results
        """
        result = {
            'would_be_available': False,
            'command_name': 'claude-commands',
            'executable_exists': False
        }
        
        # Check if executable exists
        bin_file = self.package_root / "bin" / "claude-commands"
        result['executable_exists'] = bin_file.exists()
        
        # Check if package.json bin configuration exists
        try:
            with open(self.package_json_path, 'r') as f:
                package_data = json.load(f)
            
            if 'bin' in package_data and 'claude-commands' in package_data['bin']:
                result['would_be_available'] = result['executable_exists']
            
        except Exception:
            pass
        
        return result
    
    def validate_npm_compatibility(self) -> Dict:
        """Validate npm compatibility
        
        Returns:
            Dictionary with compatibility results
        """
        result = {
            'npm_compatible': True,
            'semver_valid': False,
            'name_valid': False
        }
        
        try:
            with open(self.package_json_path, 'r') as f:
                package_data = json.load(f)
            
            # Check semver
            version = package_data.get('version', '')
            semver_pattern = r'^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$'
            result['semver_valid'] = bool(re.match(semver_pattern, version))
            
            # Check name
            name = package_data.get('name', '')
            name_pattern = r'^[a-z0-9-]+$'
            result['name_valid'] = bool(re.match(name_pattern, name))
            
            result['npm_compatible'] = result['semver_valid'] and result['name_valid']
            
        except Exception:
            result['npm_compatible'] = False
        
        return result
    
    def get_uninstall_info(self) -> Dict:
        """Get uninstall information
        
        Returns:
            Dictionary with uninstall info
        """
        result = {
            'global_files': [],
            'global_binaries': [],
            'clean_uninstall_possible': True
        }
        
        try:
            with open(self.package_json_path, 'r') as f:
                package_data = json.load(f)
            
            # Track global binaries
            if 'bin' in package_data:
                result['global_binaries'] = list(package_data['bin'].keys())
            
            # Track files
            if 'files' in package_data:
                result['global_files'] = package_data['files']
            
        except Exception:
            result['clean_uninstall_possible'] = False
        
        return result
    
    def get_installation_verification(self) -> Dict:
        """Get installation verification info
        
        Returns:
            Dictionary with verification info
        """
        return {
            'verify_command': 'claude-commands --version',
            'version_output_expected': True,
            'help_command': 'claude-commands --help',
            'list_command': 'claude-commands list'
        }