# @paulduvall/claude-dev-toolkit - Published Package Guide

🎉 **Successfully Published to NPM!**

Your package is now available at: https://www.npmjs.com/package/@paulduvall/claude-dev-toolkit

## Installation

Users can now install your Claude Code toolkit using npm:

```bash
# Global installation (recommended)
npm install -g @paulduvall/claude-dev-toolkit

# Or using npx without installing globally (a subcommand is required)
npx @paulduvall/claude-dev-toolkit setup

# Local project installation
npm install @paulduvall/claude-dev-toolkit
```

## What Users Get

When users install `@paulduvall/claude-dev-toolkit`, they receive:

### 1. **Claude Commands CLI**
A command-line tool that helps set up custom slash commands for Claude Code:

```bash
# Run setup (applies defaults: basic template, active commands, hooks)
claude-commands setup

# Preview what setup would do, without changing anything
claude-commands setup --dry-run

# See every available subcommand
claude-commands --help
```

`claude-commands` with no subcommand prints help and exits 1; it does not start
a setup flow. `setup` is not interactive either -- it applies its defaults
straight through, so use `--dry-run` first or pass `--type` and `--commands`.

### 2. **45 Custom Slash Commands**
The toolkit includes production-ready and experimental commands:

#### Active Commands (17)
- `/xarchitecture` - Architecture design and analysis
- `/xconfig` - Configuration management
- `/xcontinue` - Execution plan continuation
- `/xdebug` - Advanced debugging
- `/xdocs` - Documentation generation
- `/xexplore` - Codebase exploration (read-only)
- `/xgit` - Automated Git workflow
- `/xhelp` - Command navigator
- `/xpipeline` - CI/CD pipeline management
- `/xquality` - Code quality analysis
- `/xrefactor` - Code refactoring automation
- `/xrelease` - Release management
- `/xsecurity` - Security scanning and analysis
- `/xspec` - Specification generation
- `/xtdd` - Test-driven development
- `/xtest` - Testing automation
- `/xverify` - Reference verification

#### Experimental Commands (28)
Including analytics, API tools, AWS integration, monitoring, performance optimization, and more.

### 3. **Configuration Templates**
Pre-configured settings for different use cases:
- Basic settings
- Comprehensive settings
- Security-focused settings

### 4. **Security Hooks**
Built-in hooks for:
- File operation logging
- Credential exposure prevention

## Usage Instructions for End Users

### Quick Start

1. **Install the package globally:**
   ```bash
   npm install -g @paulduvall/claude-dev-toolkit
   ```

2. **Run setup:**
   ```bash
   claude-commands setup
   ```

3. **What setup does** (non-interactive; defaults shown):
   - Applies a configuration template to `~/.claude/settings.json` (`--type basic`)
   - Installs a command set to `~/.claude/commands/` (`--commands active`)
   - Installs the security hooks (`--skip-hooks` to opt out)
   - Verifies the result

   Preview it first with `claude-commands setup --dry-run`.

### Manual Setup

Users can also manually set up specific components:

```bash
# Install only active commands
claude-commands install --active

# Install experimental commands
claude-commands install --experiments

# Install both sets
claude-commands install --all

# Apply a specific configuration template
claude-commands config --template security

# List the available templates
claude-commands config --list
```

Hooks are installed by `claude-commands setup`; there is no separate `hooks`
subcommand. Run `claude-commands --help` for the full list of subcommands.

## Package Details

- **Package Name:** `@paulduvall/claude-dev-toolkit`
- **Current version:** see the registry -- `npm view @paulduvall/claude-dev-toolkit version`
- **Registry:** https://registry.npmjs.org
- **License:** MIT
- **Author:** Paul Duvall

## Features

### 🎯 Command Categories

- **Planning & Strategy:** Project planning, risk assessment
- **Architecture & Design:** System design with proven patterns
- **Development:** Refactoring, quality analysis, TDD
- **Security & Compliance:** Vulnerability scanning, compliance checking
- **CI/CD & Deployment:** Git workflows, pipeline management
- **Infrastructure:** IaC management, monitoring setup

### 🔧 Installation Features

- **Interactive Setup Wizard:** Guided configuration process
- **Error Recovery:** Automatic fallback mechanisms
- **Cross-Platform:** Works on macOS and Linux (Windows via WSL)
- **Claude Code Compatibility:** Checks for Claude Code installation
- **Permission Handling:** Manages file permissions automatically

## Sharing and Promotion

### For GitHub README

Add this badge to your README:
```markdown
[![npm version](https://badge.fury.io/js/@paulduvall%2Fclaude-dev-toolkit.svg)](https://www.npmjs.com/package/@paulduvall/claude-dev-toolkit)
```

### Installation Instructions for Users

Share this with users:

```markdown
## Install Claude Dev Toolkit

Enhance your Claude Code experience with 45 custom commands:

\`\`\`bash
npm install -g @paulduvall/claude-dev-toolkit
claude-commands
\`\`\`

Visit [npm](https://www.npmjs.com/package/@paulduvall/claude-dev-toolkit) for more details.
```

## Updating the Package

When you need to publish updates:

1. **Update version in package.json:**
   ```bash
   cd claude-dev-toolkit
   npm version patch  # or minor/major
   ```

2. **Run the GitHub Action:**
   - Go to Actions → NPM Publish
   - Run workflow with your NPM token

3. **Or publish locally:**
   ```bash
   npm publish --access public
   ```

## Support and Documentation

- **NPM Package Page:** https://www.npmjs.com/package/@paulduvall/claude-dev-toolkit
- **GitHub Repository:** https://github.com/PaulDuvall/claude-code
- **Issues:** https://github.com/PaulDuvall/claude-code/issues

## Next Steps

1. ✅ Package is live on NPM
2. 📢 Share with the Claude Code community
3. 📝 Add the NPM badge to your GitHub README
4. 🔄 Set up automated releases with semantic versioning
5. 📊 Monitor download statistics on NPM

## Troubleshooting for Users

If users encounter issues:

```bash
# Clear npm cache
npm cache clean --force

# Reinstall
npm uninstall -g @paulduvall/claude-dev-toolkit
npm install -g @paulduvall/claude-dev-toolkit

# Check installation
which claude-commands

# Run with verbose output
claude-commands --verbose
```

---

🎊 **Congratulations on publishing your first NPM package!**

Your Claude Code toolkit is now available to developers worldwide. Users can enhance their Claude Code experience with your comprehensive collection of custom commands and automation tools.