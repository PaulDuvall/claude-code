#!/usr/bin/env python3
"""
Refactored Global NPM Installer for Claude Dev Toolkit
Implementation for REQ-004: Global NPM Installation - Refactored
"""

import json
import re
from pathlib import Path
from typing import Dict, List
from abc import ABC, abstractmethod


class FileTemplate(ABC):
    """Abstract base class for file templates"""
    
    @abstractmethod
    def get_content(self) -> str:
        pass
    
    @abstractmethod
    def get_permissions(self) -> int:
        return 0o644


class ExecutableTemplate(FileTemplate):
    """Template for executable files"""
    
    def get_permissions(self) -> int:
        return 0o755


class CLIExecutableTemplate(ExecutableTemplate):
    """Template for CLI executable"""
    
    def get_content(self) -> str:
        return """#!/usr/bin/env node

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


class PostInstallScriptTemplate(ExecutableTemplate):
    """Template for post-install script"""
    
    def get_content(self) -> str:
        return """#!/usr/bin/env node

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


class ReadmeTemplate(FileTemplate):
    """Template for README.md"""
    
    def get_content(self) -> str:
        return """# Claude Dev Toolkit

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
    
    def get_permissions(self) -> int:
        return 0o644


class PackageJsonBuilder:
    """Builder for package.json configuration"""
    
    PACKAGE_NAME = "claude-dev-toolkit"
    VERSION = "1.0.0"
    
    def build(self) -> Dict:
        """Build complete package.json configuration"""
        return {
            "name": self.PACKAGE_NAME,
            "version": self.VERSION,
            "description": self._get_description(),
            "keywords": self._get_keywords(),
            "author": "Paul Duvall",
            "license": "MIT",
            "repository": self._get_repository(),
            "bugs": self._get_bugs(),
            "homepage": self._get_homepage(),
            "bin": self._get_bin_config(),
            "scripts": self._get_scripts(),
            "engines": self._get_engines(),
            "files": self._get_files()
        }
    
    def _get_description(self) -> str:
        return "Custom commands toolkit for Claude Code - streamline your development workflow"
    
    def _get_keywords(self) -> List[str]:
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
        return {"postinstall": "node scripts/postinstall.js"}
    
    def _get_engines(self) -> Dict:
        return {"node": ">=16.0.0"}
    
    def _get_files(self) -> List[str]:
        return ["bin/", "lib/", "commands/", "scripts/", "README.md"]


class LibraryModuleFactory:
    """Factory for creating library modules"""
    
    @staticmethod
    def create_module(module_name: str) -> str:
        """Create a library module based on name"""
        modules = {
            'utils.js': '// Utility functions\nmodule.exports = {};',
            'config.js': '// Configuration\nmodule.exports = {};',
            'installer.js': '// Installer\nmodule.exports = {};'
        }
        return modules.get(module_name, f'// {module_name}\nmodule.exports = {{}};')


class NPMValidator:
    """Validates NPM package requirements"""
    
    def __init__(self, package_root: Path):
        self.package_root = package_root
        self.package_json_path = package_root / "package.json"
    
    def validate_for_publishing(self) -> Dict:
        """Validate package for npm publishing"""
        result = {
            'valid': True,
            'errors': [],
            'name': None,
            'bin_commands': []
        }
        
        if not self.package_json_path.exists():
            result['valid'] = False
            result['errors'].append("package.json does not exist")
            return result
        
        try:
            package_data = self._load_package_json()
            self._validate_required_fields(package_data, result)
            self._validate_bin_configuration(package_data, result)
            
        except json.JSONDecodeError:
            result['valid'] = False
            result['errors'].append("Invalid package.json format")
        
        return result
    
    def validate_npm_compatibility(self) -> Dict:
        """Validate npm compatibility"""
        result = {
            'npm_compatible': True,
            'semver_valid': False,
            'name_valid': False
        }
        
        try:
            package_data = self._load_package_json()
            result['semver_valid'] = self._validate_semver(package_data.get('version', ''))
            result['name_valid'] = self._validate_name(package_data.get('name', ''))
            result['npm_compatible'] = result['semver_valid'] and result['name_valid']
            
        except Exception:
            result['npm_compatible'] = False
        
        return result
    
    def _load_package_json(self) -> Dict:
        """Load and parse package.json"""
        with open(self.package_json_path, 'r') as f:
            return json.load(f)
    
    def _validate_required_fields(self, package_data: Dict, result: Dict):
        """Validate required package.json fields"""
        required_fields = ['name', 'version', 'description', 'author', 'license']
        for field in required_fields:
            if field not in package_data:
                result['valid'] = False
                result['errors'].append(f"Missing required field: {field}")
        
        result['name'] = package_data.get('name')
    
    def _validate_bin_configuration(self, package_data: Dict, result: Dict):
        """Validate bin configuration"""
        if 'bin' in package_data:
            for bin_name, bin_path in package_data['bin'].items():
                result['bin_commands'].append(bin_name)
                
                full_bin_path = self.package_root / bin_path.lstrip('./')
                if not full_bin_path.exists():
                    result['valid'] = False
                    result['errors'].append(f"Bin file does not exist: {bin_path}")
    
    def _validate_semver(self, version: str) -> bool:
        """Validate semantic versioning"""
        semver_pattern = r'^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$'
        return bool(re.match(semver_pattern, version))
    
    def _validate_name(self, name: str) -> bool:
        """Validate package name"""
        name_pattern = r'^[a-z0-9-]+$'
        return bool(re.match(name_pattern, name))


class InstallationSimulator:
    """Simulates npm installation processes"""
    
    def __init__(self, package_root: Path):
        self.package_root = package_root
        self.package_json_path = package_root / "package.json"
    
    def simulate_global_install(self) -> Dict:
        """Simulate global npm installation"""
        result = {
            'success': False,
            'global_binaries': [],
            'bin_in_path': False
        }
        
        try:
            with open(self.package_json_path, 'r') as f:
                package_data = json.load(f)
            
            if 'bin' in package_data:
                result['global_binaries'] = list(package_data['bin'].keys())
                result['bin_in_path'] = 'claude-commands' in result['global_binaries']
                result['success'] = True
            
        except Exception:
            result['success'] = False
        
        return result
    
    def check_cli_availability(self) -> Dict:
        """Check CLI availability after installation"""
        result = {
            'would_be_available': False,
            'command_name': 'claude-commands',
            'executable_exists': False
        }
        
        bin_file = self.package_root / "bin" / "claude-commands"
        result['executable_exists'] = bin_file.exists()
        
        try:
            with open(self.package_json_path, 'r') as f:
                package_data = json.load(f)
            
            if 'bin' in package_data and 'claude-commands' in package_data['bin']:
                result['would_be_available'] = result['executable_exists']
            
        except Exception:
            pass
        
        return result


class FileManager:
    """Manages file creation and permissions"""
    
    def __init__(self, package_root: Path):
        self.package_root = package_root
    
    def create_file_from_template(self, file_path: Path, template: FileTemplate):
        """Create a file from a template"""
        file_path.write_text(template.get_content())
        file_path.chmod(template.get_permissions())
    
    def ensure_directory_structure(self):
        """Ensure basic directory structure exists"""
        self.package_root.mkdir(parents=True, exist_ok=True)
        
        directories = ['bin', 'lib', 'commands', 'scripts']
        for dir_name in directories:
            (self.package_root / dir_name).mkdir(exist_ok=True)
    
    def create_lib_modules(self):
        """Create library modules"""
        lib_dir = self.package_root / "lib"
        modules = ['utils.js', 'config.js', 'installer.js']
        
        for module_name in modules:
            module_file = lib_dir / module_name
            if not module_file.exists():
                content = LibraryModuleFactory.create_module(module_name)
                module_file.write_text(content)


class GlobalNPMInstaller:
    """Main class for handling global NPM installation - refactored"""
    
    def __init__(self, package_root: Path):
        """Initialize the global NPM installer"""
        self.package_root = Path(package_root)
        
        # Composition with specialized components
        self.package_json_builder = PackageJsonBuilder()
        self.validator = NPMValidator(self.package_root)
        self.simulator = InstallationSimulator(self.package_root)
        self.file_manager = FileManager(self.package_root)
        
        # Templates
        self.cli_template = CLIExecutableTemplate()
        self.postinstall_template = PostInstallScriptTemplate()
        self.readme_template = ReadmeTemplate()
    
    def setup(self):
        """Set up the package for global NPM installation"""
        self.file_manager.ensure_directory_structure()
        self._ensure_package_json()
        self._ensure_bin_executable()
        self._ensure_post_install_script()
        self.file_manager.create_lib_modules()
        self._ensure_readme()
    
    def _ensure_package_json(self):
        """Ensure package.json exists with proper NPM configuration"""
        package_json_path = self.package_root / "package.json"
        
        if not package_json_path.exists():
            package_config = self.package_json_builder.build()
            
            with open(package_json_path, 'w') as f:
                json.dump(package_config, f, indent=2)
    
    def _ensure_bin_executable(self):
        """Ensure bin/claude-commands executable exists"""
        bin_file = self.package_root / "bin" / "claude-commands"
        
        if not bin_file.exists():
            self.file_manager.create_file_from_template(bin_file, self.cli_template)
    
    def _ensure_post_install_script(self):
        """Ensure post-install script exists"""
        script_file = self.package_root / "scripts" / "postinstall.js"
        
        if not script_file.exists():
            self.file_manager.create_file_from_template(script_file, self.postinstall_template)
    
    def _ensure_readme(self):
        """Ensure README.md exists"""
        readme_file = self.package_root / "README.md"
        
        if not readme_file.exists():
            self.file_manager.create_file_from_template(readme_file, self.readme_template)
    
    # Delegate validation and simulation to specialized classes
    def validate_for_publishing(self) -> Dict:
        """Validate package for npm publishing"""
        return self.validator.validate_for_publishing()
    
    def simulate_global_install(self) -> Dict:
        """Simulate global npm installation"""
        return self.simulator.simulate_global_install()
    
    def check_cli_availability(self) -> Dict:
        """Check CLI availability after installation"""
        return self.simulator.check_cli_availability()
    
    def validate_npm_compatibility(self) -> Dict:
        """Validate npm compatibility"""
        return self.validator.validate_npm_compatibility()
    
    def get_uninstall_info(self) -> Dict:
        """Get uninstall information"""
        result = {
            'global_files': [],
            'global_binaries': [],
            'clean_uninstall_possible': True
        }
        
        try:
            package_json_path = self.package_root / "package.json"
            with open(package_json_path, 'r') as f:
                package_data = json.load(f)
            
            if 'bin' in package_data:
                result['global_binaries'] = list(package_data['bin'].keys())
            
            if 'files' in package_data:
                result['global_files'] = package_data['files']
            
        except Exception:
            result['clean_uninstall_possible'] = False
        
        return result
    
    def get_installation_verification(self) -> Dict:
        """Get installation verification info"""
        return {
            'verify_command': 'claude-commands --version',
            'version_output_expected': True,
            'help_command': 'claude-commands --help',
            'list_command': 'claude-commands list'
        }