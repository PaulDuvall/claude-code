#!/usr/bin/env python3
"""
Command Organizer for Claude Dev Toolkit
Implementation for REQ-002: Command Organization
"""

import json
import shutil
from pathlib import Path
from typing import Dict, List


class CommandOrganizer:
    """Organizes commands into active and experimental categories"""
    
    # List of 13 active commands
    ACTIVE_COMMANDS = [
        'xarchitecture', 'xconfig', 'xdebug', 'xdocs', 'xgit',
        'xpipeline', 'xquality', 'xrefactor', 'xrelease',
        'xsecurity', 'xspec', 'xtdd', 'xtest'
    ]
    
    # List of 44 experimental commands
    EXPERIMENTAL_COMMANDS = [
        'xact', 'xanalytics', 'xapi', 'xaws', 'xcicd', 'xcompliance',
        'xconstraints', 'xcoverage', 'xdata', 'xdependencies', 'xdesign',
        'xdiagram', 'xdockerfile', 'xenv', 'xerrors', 'xfeature',
        'xfeedback', 'xhelp', 'xideas', 'xinfra', 'xintegration',
        'xlicense', 'xlog', 'xmetrics', 'xmigration', 'xmonitoring',
        'xnew', 'xoptimize', 'xpatterns', 'xperformance', 'xplanning',
        'xpolicy', 'xproduct', 'xproject', 'xred', 'xrequirements',
        'xresearch', 'xreview', 'xrisk', 'xscale', 'xstatus',
        'xtodo', 'xupgrade', 'xvalidation'
    ]
    
    def __init__(self, package_root: Path):
        """Initialize the command organizer
        
        Args:
            package_root: Root directory of the package
        """
        self.package_root = Path(package_root)
        self.commands_dir = self.package_root / "commands"
        self.active_dir = self.commands_dir / "active"
        self.experimental_dir = self.commands_dir / "experimental"
    
    def organize_commands(self):
        """Organize commands into active and experimental directories"""
        # Create directories
        self.active_dir.mkdir(parents=True, exist_ok=True)
        self.experimental_dir.mkdir(parents=True, exist_ok=True)
        
        # Create active commands
        for command_name in self.ACTIVE_COMMANDS:
            self._create_command_file(command_name, self.active_dir, is_experimental=False)
        
        # Create experimental commands
        for command_name in self.EXPERIMENTAL_COMMANDS:
            self._create_command_file(command_name, self.experimental_dir, is_experimental=True)
        
        # Create manifest
        self._create_manifest()
    
    def _create_command_file(self, name: str, directory: Path, is_experimental: bool):
        """Create a command file with proper structure
        
        Args:
            name: Command name (without extension)
            directory: Directory to create the file in
            is_experimental: Whether this is an experimental command
        """
        category = self._get_command_category(name)
        status = "experimental" if is_experimental else "active"
        
        content = f"""---
description: "{self._get_command_description(name)}"
tags: ["{category}", "{status}", "automation"]
status: "{status}"
---

# {name.upper()} Command

## Description

{self._get_command_description(name)}

{"**⚠️ EXPERIMENTAL**: This command is experimental and may change in future versions." if is_experimental else ""}

## Usage

```bash
/{name}
```

## Usage Examples

```
/{name} --help
/{name} --verbose
```

## Implementation

This command provides {category} automation for Claude Code.

### Features:
- Automated {category} workflows
- Integration with Claude Code environment
- Customizable parameters

### Requirements:
- Claude Code CLI installed
- Appropriate permissions
- Valid configuration

## Parameters

- `--help`: Display help information
- `--verbose`: Enable verbose output
- `--dry-run`: Preview changes without applying

## Examples

### Basic Usage:
```
/{name}
```

### With Options:
```
/{name} --verbose --dry-run
```

## Notes

{f"This is an experimental command. Use with caution in production environments." if is_experimental else "This is a production-ready command suitable for regular use."}
"""
        
        file_path = directory / f"{name}.md"
        file_path.write_text(content)
    
    def _get_command_description(self, name: str) -> str:
        """Get description for a command based on its name"""
        descriptions = {
            # Active commands
            'xarchitecture': 'System architecture design and analysis',
            'xconfig': 'Configuration management and setup',
            'xdebug': 'Advanced debugging and troubleshooting',
            'xdocs': 'Documentation generation and management',
            'xgit': 'Automated Git workflow and version control',
            'xpipeline': 'CI/CD pipeline management',
            'xquality': 'Code quality analysis and improvement',
            'xrefactor': 'Code refactoring automation',
            'xrelease': 'Release management and versioning',
            'xsecurity': 'Security scanning and vulnerability detection',
            'xspec': 'Specification generation and validation',
            'xtdd': 'Test-driven development automation',
            'xtest': 'Testing automation and management',
            
            # Experimental commands (sample)
            'xact': 'GitHub Actions automation',
            'xanalytics': 'Analytics and metrics collection',
            'xapi': 'API development and testing',
            'xaws': 'AWS cloud integration',
            'xcicd': 'Advanced CI/CD workflows',
            'xcompliance': 'Compliance checking and reporting',
            'xinfra': 'Infrastructure as Code management',
            'xmonitoring': 'Application monitoring setup',
            'xperformance': 'Performance optimization',
            'xplanning': 'Project planning and management',
            'xrisk': 'Risk assessment and mitigation',
        }
        return descriptions.get(name, f'{name.replace("x", "").title()} automation and management')
    
    def _get_command_category(self, name: str) -> str:
        """Get category for a command based on its name"""
        categories = {
            'xarchitecture': 'architecture',
            'xconfig': 'configuration',
            'xdebug': 'development',
            'xdocs': 'documentation',
            'xgit': 'version-control',
            'xpipeline': 'ci-cd',
            'xquality': 'quality',
            'xrefactor': 'development',
            'xrelease': 'deployment',
            'xsecurity': 'security',
            'xspec': 'planning',
            'xtdd': 'testing',
            'xtest': 'testing',
        }
        return categories.get(name, 'automation')
    
    def _create_manifest(self):
        """Create a manifest.json file listing all commands"""
        manifest = {
            "version": "1.0.0",
            "active": [],
            "experimental": [],
            "total_commands": 57
        }
        
        # Add active commands to manifest
        for command_name in self.ACTIVE_COMMANDS:
            manifest["active"].append({
                "name": command_name,
                "description": self._get_command_description(command_name),
                "category": self._get_command_category(command_name),
                "file": f"{command_name}.md"
            })
        
        # Add experimental commands to manifest
        for command_name in self.EXPERIMENTAL_COMMANDS:
            manifest["experimental"].append({
                "name": command_name,
                "description": self._get_command_description(command_name),
                "category": self._get_command_category(command_name),
                "file": f"{command_name}.md"
            })
        
        manifest_file = self.commands_dir / "manifest.json"
        with open(manifest_file, 'w') as f:
            json.dump(manifest, f, indent=2)
    
    def copy_from_source(self, source_path: Path) -> Dict:
        """Copy commands from source repository
        
        Args:
            source_path: Path to source slash-commands directory
            
        Returns:
            Dictionary with copy results
        """
        result = {
            "success": False,
            "active_count": 0,
            "experimental_count": 0,
            "errors": []
        }
        
        try:
            # Copy active commands
            source_active = source_path / "active"
            if source_active.exists():
                for command_file in source_active.glob("*.md"):
                    if command_file.stem in self.ACTIVE_COMMANDS:
                        shutil.copy2(command_file, self.active_dir)
                        result["active_count"] += 1
            
            # Copy experimental commands
            source_experimental = source_path / "experiments"
            if source_experimental.exists():
                for command_file in source_experimental.glob("*.md"):
                    if command_file.stem in self.EXPERIMENTAL_COMMANDS:
                        shutil.copy2(command_file, self.experimental_dir)
                        result["experimental_count"] += 1
            
            result["success"] = True
            
        except Exception as e:
            result["errors"].append(str(e))
        
        return result
    
    def validate_all_commands(self) -> Dict:
        """Validate all command files
        
        Returns:
            Dictionary with validation results
        """
        result = {
            "valid": True,
            "total_commands": 0,
            "errors": []
        }
        
        # Validate active commands
        for command_file in self.active_dir.glob("*.md"):
            if not self._validate_command_file(command_file):
                result["valid"] = False
                result["errors"].append(f"Invalid command file: {command_file.name}")
            result["total_commands"] += 1
        
        # Validate experimental commands
        for command_file in self.experimental_dir.glob("*.md"):
            if not self._validate_command_file(command_file):
                result["valid"] = False
                result["errors"].append(f"Invalid command file: {command_file.name}")
            result["total_commands"] += 1
        
        return result
    
    def _validate_command_file(self, file_path: Path) -> bool:
        """Validate a single command file
        
        Args:
            file_path: Path to command file
            
        Returns:
            True if valid, False otherwise
        """
        try:
            content = file_path.read_text()
            
            # Check for required sections
            required = ["---", "description:", "# ", "## Usage", "## Implementation"]
            for req in required:
                if req not in content:
                    return False
            
            return True
            
        except Exception:
            return False