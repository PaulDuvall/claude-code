#!/usr/bin/env python3
"""
Create NPM package structure for claude-dev-toolkit
Implementation for REQ-001: NPM Package Structure
"""

import os
import json
from pathlib import Path


def create_npm_package(root_path):
    """Create the NPM package structure"""
    package_root = Path(root_path) / "claude-dev-toolkit"
    package_root.mkdir(parents=True, exist_ok=True)
    
    # Create required directories
    directories = ['bin', 'lib', 'commands', 'templates', 'hooks']
    for dir_name in directories:
        (package_root / dir_name).mkdir(exist_ok=True)
    
    # Create commands subdirectories
    (package_root / "commands" / "active").mkdir(parents=True, exist_ok=True)
    (package_root / "commands" / "experimental").mkdir(parents=True, exist_ok=True)
    
    # Create package.json
    package_json = {
        "name": "claude-dev-toolkit",
        "version": "1.0.0",
        "description": "Custom commands toolkit for Claude Code",
        "author": "Paul Duvall",
        "license": "MIT",
        "bin": {
            "claude-commands": "./bin/claude-commands"
        },
        "scripts": {
            "postinstall": "node scripts/postinstall.js",
            "test": "echo \"Error: no test specified\" && exit 1"
        }
    }
    
    with open(package_root / "package.json", 'w') as f:
        json.dump(package_json, f, indent=2)
    
    # Create bin/claude-commands executable
    bin_file = package_root / "bin" / "claude-commands"
    bin_file.write_text("""#!/usr/bin/env node
console.log('Claude Commands CLI');
""")
    # Make it executable
    bin_file.chmod(0o755)
    
    # Create lib modules
    lib_files = {
        "utils.js": "// Utility functions\nmodule.exports = {};\n",
        "config.js": "// Configuration management\nmodule.exports = {};\n",
        "installer.js": "// Installation logic\nmodule.exports = {};\n"
    }
    
    for filename, content in lib_files.items():
        (package_root / "lib" / filename).write_text(content)
    
    # Create README.md
    readme_content = """# Claude Dev Toolkit

NPM package for Claude Code custom commands.

## Installation

```bash
npm install -g claude-dev-toolkit
```
"""
    (package_root / "README.md").write_text(readme_content)
    
    # Create .gitignore
    gitignore_content = """node_modules/
npm-debug.log
*.log
.DS_Store
*.swp
.env
dist/
build/
"""
    (package_root / ".gitignore").write_text(gitignore_content)
    
    return package_root


if __name__ == "__main__":
    # This will be called by the test
    import sys
    if len(sys.argv) > 1:
        create_npm_package(sys.argv[1])