# Claude Dev Toolkit

[![npm version](https://badge.fury.io/js/%40paulduvall%2Fclaude-dev-toolkit.svg)](https://www.npmjs.com/package/@paulduvall/claude-dev-toolkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Test Status](https://img.shields.io/badge/tests-100%25%20passing-brightgreen)
![Active Commands](https://img.shields.io/badge/active%20commands-13-blue)
![Experimental Commands](https://img.shields.io/badge/experimental%20commands-45-orange)
![Total Commands](https://img.shields.io/badge/total%20commands-58-brightgreen)

**Transform Claude Code into a complete development platform** with 58 AI-powered custom commands that automate your entire software development workflow.

## 🚀 Quick Installation

```bash
# Install globally via NPM
npm install -g @paulduvall/claude-dev-toolkit

# Commands are immediately available in Claude Code
claude
/xhelp    # List all available commands
```

## 📦 What's Included

- **13 Active Commands**: Production-ready commands for immediate use
- **45 Experimental Commands**: Cutting-edge features for early adopters  
- **Security Hooks**: Automated security validation and governance
- **Configuration Templates**: Pre-configured settings for different workflows
- **Interactive Setup Wizard**: Guided installation with customization options
- **JavaScript Test Suite**: 100% test coverage with 10 comprehensive test suites

## 🎯 Quick Start

### Option 1: Automatic Setup (Recommended)
```bash
npm install -g @paulduvall/claude-dev-toolkit
# Interactive setup wizard runs automatically
```

### Option 2: Manual Command Installation
```bash
# Install specific command sets
claude-commands install --active        # Install 13 production commands
claude-commands install --experimental  # Install 45 experimental commands  
claude-commands install --all           # Install all 58 commands
```

### Option 3: Custom Installation
```bash
claude-commands list                     # See all available commands
claude-commands status                   # Check installation status
```

## 📋 Available Commands

### 🎯 **Daily Development** (Production Ready)
- **`/xtest`** - Smart test runner with coverage analysis
- **`/xquality`** - Code quality checks (format, lint, type-check)
- **`/xgit`** - Automated git workflow with AI-generated commits
- **`/xdebug`** - AI-powered debugging assistant

### 🔒 **Security & Quality**
- **`/xsecurity`** - Comprehensive vulnerability scanning
- **`/xrefactor`** - Intelligent code refactoring and smell detection

### 🏗️ **Architecture & Planning** 
- **`/xarchitecture`** - System design and architecture analysis
- **`/xspec`** - Requirements and specification generation
- **`/xdocs`** - Documentation generation and maintenance

### 🚀 **DevOps & Deployment**
- **`/xpipeline`** - CI/CD pipeline optimization
- **`/xrelease`** - Release management automation
- **`/xconfig`** - Configuration management
- **`/xtdd`** - Test-driven development automation

### 🧪 **Experimental Commands** (45 Additional)
Advanced commands for specialized workflows:
- **Planning & Analytics**: `/xplanning`, `/xanalytics`, `/xmetrics`
- **Infrastructure**: `/xinfra`, `/xmonitoring`, `/xaws`
- **Compliance**: `/xcompliance`, `/xgovernance`, `/xpolicy`
- **Advanced Security**: `/xred`, `/xrisk`, `/xscan`
- **Performance**: `/xperformance`, `/xoptimize`

## 🛠️ CLI Usage

```bash
# Management Commands
claude-commands list                    # List all available commands
claude-commands status                  # Show installation status
claude-commands install --active       # Install production commands
claude-commands install --experimental # Install experimental commands
claude-commands install --all          # Install all commands

# Configuration Management
claude-commands config --list          # List available templates
claude-commands config --template <name> # Apply configuration template
claude-commands config --help          # Show config command help

# Subagents Management
claude-commands subagents --list        # List available subagents
claude-commands subagents --install     # Install subagents to Claude Code
claude-commands subagents --help        # Show subagents command help

# In Claude Code
/xhelp                                 # Show command help
/xtest                                 # Run intelligent test suite
/xquality fix                          # Auto-fix code quality issues
/xsecurity --scan --report            # Comprehensive security scan
/xgit                                  # Automated git workflow
```

## 🔧 Configuration

### Configuration Management

Use the built-in config command to manage Claude Code settings:

```bash
# List available configuration templates
claude-commands config --list

# Apply a specific template
claude-commands config --template basic-settings.json
claude-commands config --template security-focused-settings.json  
claude-commands config --template comprehensive-settings.json

# Show help for config command
claude-commands config --help
```

### Installation Locations
- **Commands**: `~/.claude/commands/active/` and `~/.claude/commands/experiments/`
- **Configuration**: `~/.claude/settings.json`
- **Security Hooks**: `~/.claude/hooks/`
- **Templates**: Bundled with package installation

### Configuration Templates
The package includes three pre-configured templates:

1. **Basic** (`basic-settings.json`): Minimal setup for command functionality
2. **Security-Focused** (`security-focused-settings.json`): Enhanced security with hooks  
3. **Comprehensive** (`comprehensive-settings.json`): Full feature set with governance

Templates are applied via the config command with automatic backup of existing settings.

## 🧪 Development & Testing

### Running Tests
```bash
# Run all test suites (100% coverage)
npm test

# Run specific test suites
npm run test:commands     # Command validation
npm run test:workflow     # Core workflow tests
npm run test:security     # Security command tests
npm run test:config       # Configuration command tests
npm run test:subagents    # Subagents CLI command tests
npm run test:req007       # Interactive setup wizard
npm run test:req009       # Configuration templates
npm run test:req018       # Security hook installation

# Validation and linting
npm run validate          # Package validation
npm run lint             # Code linting
```

### Test Coverage
- **10 Test Suites**: 100% passing
- **Command Validation**: All 58 commands validated
- **Security Tests**: Comprehensive security pattern validation
- **Integration Tests**: End-to-end workflow testing
- **Configuration Tests**: Template and setup validation

### Architecture
- **Symlink Consolidation**: Single source of truth with root directory
- **JavaScript-Based**: Migrated from Python for better Node.js integration
- **Modular Design**: Separate installer, config, and validation modules
- **Cross-Platform**: Works on macOS, Linux, and Windows

## 🔒 Security Features

### Built-in Security Hooks
- **Credential Protection**: Prevents exposure of API keys and secrets
- **File Operation Logging**: Audits all AI-generated file changes
- **Governance Integration**: Policy enforcement and compliance checking

### Security Commands
- **`/xsecurity`**: Vulnerability scanning and dependency auditing
- **`/xred`**: Defensive security testing (experimental)
- **`/xcompliance`**: Automated compliance checking (experimental)

## 🚨 Troubleshooting

### Common Issues
```bash
# Commands not recognized?
claude-commands status                  # Check installation
claude-commands install --active       # Reinstall commands

# Permission errors?
chmod 755 ~/.claude/commands/*.md      # Fix permissions

# Missing experimental commands?
claude-commands install --experimental # Install experimental set

# Test failures?
npm test                               # Run full test suite
npm run validate                       # Validate package
```

### Validation Commands
```bash
# Repository validation (from main repo)
./validate-commands.sh                 # JavaScript-based validation
./verify-setup.sh                     # Complete setup verification

# Package validation
npm run validate                       # Package structure validation
npm test                              # Comprehensive test suite
```

## 📚 Documentation

### Complete Documentation
- **Main Repository**: [Claude Code Custom Commands](https://github.com/PaulDuvall/claude-code)
- **Command Reference**: [claude-custom-commands.md](https://github.com/PaulDuvall/claude-code/blob/main/docs/claude-custom-commands.md)
- **Security Hooks**: [claude-code-hooks-system.md](https://github.com/PaulDuvall/claude-code/blob/main/docs/claude-code-hooks-system.md)

### Quick Reference
Every command includes built-in help:
```bash
/xtest help         # Show all testing options
/xquality help      # Show quality check options  
/xsecurity help     # Show security scanning options
/xconfig help       # Show configuration options
```

## 🤝 Contributing

### Development Setup
```bash
# Clone main repository
git clone https://github.com/PaulDuvall/claude-code.git
cd claude-code

# NPM package is located in claude-dev-toolkit/
cd claude-dev-toolkit
npm install
npm test
```

### Adding Commands
1. Create command files in root `slash-commands/active/` or `slash-commands/experiments/`
2. Commands automatically sync to NPM package via symlinks
3. Validate with `npm run test:commands`
4. Follow existing patterns and security guidelines

### Testing
- **All changes must pass 100% of tests** before merging
- **JavaScript test suite** provides comprehensive validation
- **Security-first development** - only defensive tools allowed

## 🔄 Recent Updates

### Version 0.0.1-alpha.2
- ✅ **NPM Scoped Package**: Published as `@paulduvall/claude-dev-toolkit`
- ✅ **Configuration Command**: Built-in `config` command for template management
- ✅ **Workflow Reporting**: Comprehensive GitHub Actions reporting
- ✅ **Subagents Support**: Multi-agent coordination capabilities
- ✅ **Enhanced Documentation**: Updated installation and usage instructions

### Version 0.0.1-alpha.2
- ✅ **Symlink Consolidation**: Eliminated duplicate directories
- ✅ **JavaScript Migration**: Complete test suite migration from Python
- ✅ **Enhanced Templates**: Fixed configuration template issues
- ✅ **100% Test Coverage**: All 10 test suites passing
- ✅ **58 Total Commands**: 13 active + 45 experimental commands
- ✅ **Security Enhancements**: Comprehensive security hook system

## 📄 License

MIT © Paul Duvall

## 🙏 Acknowledgments

Built for the Claude Code community to accelerate AI-powered development workflows.

---

**Ready to transform your development workflow?** Install now and experience AI-powered automation for testing, security, quality, and deployment.