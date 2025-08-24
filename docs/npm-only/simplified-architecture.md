# Simplified Architecture: NPM-First Claude Code

## Overview

This document describes the simplified architecture after consolidating from dual installation methods to a single NPM-first approach.

## Architecture Principles

### Single Source of Truth
- **One Installation Method**: NPM package (`@paulduvall/claude-dev-toolkit`)
- **One Command Interface**: `claude-commands` CLI
- **One Configuration System**: `~/.claude/` directory structure
- **One Documentation Approach**: NPM-focused guides

### Standard Distribution Model
- **Industry Standard**: Follows Node.js ecosystem conventions
- **Global Installation**: `npm install -g` pattern
- **Semantic Versioning**: Standard npm version management
- **Dependency Management**: Automatic handling of dependencies

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     NPM Registry                            │
│              @paulduvall/claude-dev-toolkit                 │
└─────────────────────────────────┬───────────────────────────┘
                                  │ npm install -g
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   Global NPM Package                        │
│                  claude-commands CLI                        │
├─────────────────────────────────────────────────────────────┤
│  Commands:                                                  │
│  • claude-commands setup                                   │
│  • claude-commands install                                 │
│  • claude-commands configure                               │
│  • claude-commands verify                                  │
│  • claude-commands backup/restore                          │
└─────────────────────────────────┬───────────────────────────┘
                                  │ manages
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  User Environment                           │
│                   ~/.claude/                                │
├─────────────────────────────────────────────────────────────┤
│  Structure:                                                 │
│  • settings.json        # Configuration                    │
│  • commands/           # Installed commands                │
│  • hooks/             # Automation hooks                   │
│  • subagents/         # AI subagents                      │
│  • logs/              # Operation logs                     │
└─────────────────────────────────────────────────────────────┘
```

### Package Architecture

```
@paulduvall/claude-dev-toolkit/
├── bin/
│   └── claude-commands.js           # CLI Entry Point
├── lib/
│   ├── commands/                    # Command Implementations
│   │   ├── setup.js                # Setup orchestration
│   │   ├── install.js              # Command installation
│   │   ├── configure.js            # Configuration management
│   │   ├── verify.js               # System verification
│   │   ├── backup.js               # Backup/restore operations
│   │   └── utils.js                # Shared utilities
│   ├── config/                     # Configuration Management
│   │   ├── templates.js            # Template handling
│   │   ├── validator.js            # Configuration validation
│   │   └── migrator.js             # Configuration migration
│   ├── platform/                   # Platform-Specific Code
│   │   ├── windows.js              # Windows-specific operations
│   │   ├── unix.js                 # Unix/macOS operations
│   │   └── detector.js             # Platform detection
│   └── core/                       # Core Functionality
│       ├── installer.js            # Command installation logic
│       ├── downloader.js           # Asset downloading
│       ├── validator.js            # System validation
│       └── logger.js               # Logging system
├── templates/                      # Configuration Templates
│   ├── basic.json                  # Basic configuration
│   ├── comprehensive.json          # Full-featured config
│   └── security-focused.json       # Security-hardened config
├── assets/                         # Static Assets
│   ├── commands/                   # Command definitions
│   ├── hooks/                      # Hook scripts
│   └── subagents/                  # Subagent configurations
├── tests/                          # Test Suite
│   ├── unit/                       # Unit tests
│   ├── integration/                # Integration tests
│   └── e2e/                        # End-to-end tests
└── docs/                           # Package Documentation
    ├── CLI.md                      # CLI documentation
    └── API.md                      # Programmatic API
```

## Command Flow Architecture

### Setup Flow
```
claude-commands setup
         │
         ▼
   Check Prerequisites
         │
         ▼
   Detect Existing Install
         │
         ▼
   Install Claude Code
         │
         ▼
   Create ~/.claude Structure
         │
         ▼
   Deploy Configuration
         │
         ▼
   Install Core Commands
         │
         ▼
   Setup Hooks (optional)
         │
         ▼
   Verify Installation
```

### Install Flow
```
claude-commands install [options]
         │
         ▼
   Parse Options & Validate
         │
         ▼
   Create Backup (if requested)
         │
         ▼
   Download Command Definitions
         │
         ▼
   Filter Commands (active/experiments/all)
         │
         ▼
   Install to ~/.claude/commands/
         │
         ▼
   Update Registry/Index
         │
         ▼
   Verify Installation
```

### Configure Flow
```
claude-commands configure [options]
         │
         ▼
   Load Current Config
         │
         ▼
   Apply Template (if specified)
         │
         ▼
   Interactive Setup (if requested)
         │
         ▼
   Validate Configuration
         │
         ▼
   Write to ~/.claude/settings.json
         │
         ▼
   Backup Previous Config
```

## Data Architecture

### Configuration Structure
```json
{
  "// ~/.claude/settings.json": "Main configuration file",
  "apiKeyHelper": "Configuration for API key management",
  "env": {
    "ANTHROPIC_API_KEY": "user-api-key",
    "CLAUDE_PROJECT_DIR": "/path/to/project"
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": { "tool": "*" },
        "hooks": [
          { "type": "command", "command": "~/.claude/hooks/pre-tool.sh" }
        ]
      }
    ]
  },
  "permissions": {
    "allow": ["Bash(git:*)", "Read", "Write"],
    "ask": ["Bash(rm:*)", "Bash(sudo:*)"],
    "deny": ["Bash(format:*)"]
  },
  "enabledMcpjsonServers": ["server1", "server2"],
  "statusLine": {
    "enabled": true,
    "template": "custom"
  }
}
```

### Directory Structure
```
~/.claude/
├── settings.json                   # Main configuration
├── settings.json.backup.timestamp  # Automatic backups
├── commands/                       # Installed commands
│   ├── xtest.md                   # Test automation command
│   ├── xsecurity.md               # Security scanning command
│   ├── xquality.md                # Code quality command
│   └── ...                        # Other commands
├── hooks/                          # Automation hooks
│   ├── pre-tool.sh                # Pre-tool execution hook
│   └── post-tool.sh               # Post-tool execution hook
├── subagents/                      # AI subagents
│   ├── security-agent.yaml        # Security-focused subagent
│   └── test-agent.yaml            # Testing-focused subagent
├── logs/                           # Operation logs
│   ├── install.log                # Installation logs
│   └── error.log                  # Error logs
└── backups/                        # Named backups
    ├── pre-migration-20250824/     # Migration backup
    └── production-config/          # Production backup
```

## Integration Architecture

### Claude Code Integration
```
NPM Package (claude-commands)
         │
         ▼
   ~/.claude/ Directory
         │
         ▼
   Claude Code Application
         │
         ▼
   Commands Available in UI
```

### Cross-Platform Architecture
```
┌─────────────────┬─────────────────┬─────────────────┐
│     Windows     │      macOS      │      Linux      │
├─────────────────┼─────────────────┼─────────────────┤
│  PowerShell     │   bash/zsh      │   bash/zsh      │
│  Command Prompt │   Terminal      │   Terminal      │
│  Windows Term   │   iTerm         │   Various       │
├─────────────────┼─────────────────┼─────────────────┤
│           NPM Global Installation                   │
│         claude-commands (same interface)            │
├─────────────────┼─────────────────┼─────────────────┤
│         Platform-Specific Adapters                 │
│    (lib/platform/windows|unix.js)                  │
├─────────────────┼─────────────────┼─────────────────┤
│              ~/.claude/ Structure                  │
│         (adapted for platform conventions)         │
└─────────────────┴─────────────────┴─────────────────┘
```

## Security Architecture

### Permission Model
```
NPM Package
    │
    ▼ (restricted to ~/.claude/)
User Home Directory
    │
    ▼ (no system-wide changes)
Local Configuration
    │
    ▼ (user-controlled permissions)
Command Execution
```

### Security Boundaries
- **Package Isolation**: NPM package operates only in user space
- **Directory Isolation**: All operations confined to `~/.claude/`
- **Permission Control**: User controls command execution permissions
- **No System Changes**: No system-wide modifications required
- **User Ownership**: All files owned by installing user

## Performance Architecture

### Optimization Strategies

#### Installation Performance
```
┌─────────────────────────────────────────┐
│            Parallel Operations          │
├─────────────────────────────────────────┤
│  • Download commands concurrently      │
│  • Validate configurations in parallel │
│  • Create directories asynchronously   │
└─────────────────────────────────────────┘
```

#### Runtime Performance
```
┌─────────────────────────────────────────┐
│              Caching Strategy           │
├─────────────────────────────────────────┤
│  • Cache command definitions           │
│  • Cache configuration validation      │
│  • Cache platform detection           │
│  • Lazy load non-critical components  │
└─────────────────────────────────────────┘
```

#### Memory Management
```
┌─────────────────────────────────────────┐
│           Resource Management           │
├─────────────────────────────────────────┤
│  • Stream large file operations        │
│  • Release resources after operations  │
│  • Minimize memory footprint          │
│  • Use async patterns for I/O         │
└─────────────────────────────────────────┘
```

## Monitoring and Observability

### Logging Architecture
```
Operation Request
       │
       ▼
 Log Operation Start
       │
       ▼
 Execute Command
       │
   ┌───┼───┐
   ▼   │   ▼
Success │ Error
   │   │   │
   ▼   ▼   ▼
Log Result/Error
       │
       ▼
Write to ~/.claude/logs/
```

### Error Handling
```
┌─────────────────────────────────────────┐
│            Error Boundaries             │
├─────────────────────────────────────────┤
│  Command Level    │  Operation Level    │
│  • Input validation │ • File system    │
│  • Permission check │ • Network        │
│  • Dependency check │ • Process exec   │
└─────────────────────────────────────────┘
```

## Migration Architecture

### Transition Strategy
```
Current State (Dual)
       │
       ▼
 Deprecation Notice
       │
       ▼
 NPM Package Enhancement
       │
       ▼
 Migration Tools
       │
       ▼
 Repository Cleanup
       │
       ▼
 Documentation Update
       │
       ▼
Final State (NPM-Only)
```

### Compatibility Layer
During transition, maintain compatibility:
```
Repository Scripts (Legacy)
       │
       ▼ (wrapper)
 NPM Package (New)
       │
       ▼
 ~/.claude/ (Shared)
```

## Benefits of Simplified Architecture

### ✅ **Reduced Complexity**
- Single installation method
- One command interface
- Unified configuration system
- Simplified testing requirements

### ✅ **Better Maintainability**
- Single codebase for installation logic
- Standard npm package structure
- Conventional tooling and workflows
- Automated testing and deployment

### ✅ **Improved User Experience**
- Familiar npm installation pattern
- Consistent cross-platform behavior
- Standard update mechanisms
- Professional distribution model

### ✅ **Enhanced Reliability**
- Leverages npm's robust infrastructure
- Automatic dependency management
- Version consistency guarantees
- Rollback capabilities

## Future Architecture Considerations

### Extensibility
- Plugin architecture for custom commands
- API for programmatic access
- Template system for configurations
- Hook system for workflow integration

### Scalability
- Command registry system
- Distributed command sources
- Caching and CDN integration
- Performance monitoring

### Integration
- IDE integrations
- CI/CD pipeline plugins
- Third-party tool integrations
- Enterprise deployment options

---
*Document Version: 1.0*  
*Created: 2025-08-24*  
*Status: Architecture Documentation*