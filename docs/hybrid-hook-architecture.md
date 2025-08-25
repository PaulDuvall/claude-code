# Hybrid Hook Architecture

## Overview

Claude Code Custom Commands implements a hybrid architecture that combines lightweight shell scripts with intelligent AI subagent orchestration. This architecture provides optimal performance, maintainability, and AI-powered automation capabilities.

## Architecture Components

### 1. Lightweight Trigger Scripts

**Location**: `hooks/`

Core trigger scripts that handle specific Claude Code events:

- **`pre-write-security.sh`** - Security validation before file writes
- **`pre-commit-quality.sh`** - Code quality checks before commits  
- **`on-error-debug.sh`** - Debug assistance when errors occur
- **`subagent-trigger-simple.sh`** - Simplified subagent orchestration

Each script is optimized for:
- ⚡ **Fast execution** (< 100ms response time)
- 🔧 **Simple logic** (30-100 lines per script)
- 🛡️ **Error resilience** (graceful failure handling)

### 2. Modular Library System

**Location**: `hooks/lib/`

Shared utility modules that provide common functionality:

- **`argument-parser.sh`** - Command-line argument processing
- **`config-constants.sh`** - Configuration constants and defaults
- **`context-manager.sh`** - Context gathering and management
- **`error-handler.sh`** - Centralized error handling
- **`execution-engine.sh`** - Command execution management
- **`file-utils.sh`** - File system utilities
- **`subagent-discovery.sh`** - AI subagent discovery and validation
- **`subagent-validator.sh`** - Subagent configuration validation

### 3. AI Subagent Integration

**Location**: `subagents/`

Specialized AI assistants for complex analysis tasks:

- **Security Analysis**: `security-auditor.md`, `api-guardian.md`
- **Code Quality**: `style-enforcer.md`, `code-review-assistant.md`
- **Debugging**: `debug-specialist.md`, `debug-context.md`
- **Testing**: `test-writer.md`, `contract-tester.md`
- **Documentation**: `documentation-curator.md`

## Event Flow

### 1. Trigger Event
```mermaid
Claude Code Event → Trigger Script → Library Functions → AI Subagent (if needed)
```

### 2. Processing Pipeline
1. **Event Detection** - Claude Code triggers appropriate hook
2. **Context Gathering** - Collect relevant file and project context
3. **Rule Evaluation** - Apply configuration-based rules
4. **AI Delegation** - Complex analysis delegated to specialized subagents
5. **Result Processing** - Format and return actionable feedback

## Configuration

### Template Files

- **`templates/hybrid-hook-config.yaml`** - Main configuration template
- **`templates/subagent-hooks.yaml`** - Subagent-specific configuration

### Configuration Options

```yaml
# Event-based triggers
hooks:
  pre_write:
    enabled: true
    subagents: ["security-auditor", "style-enforcer"]
    
  pre_commit:
    enabled: true
    subagents: ["code-review-assistant"]
    
  on_error:
    enabled: true
    subagents: ["debug-specialist"]

# Performance settings
performance:
  timeout: 10000  # 10 seconds
  max_parallel: 3
  cache_enabled: true
```

## Benefits

### ✅ **Performance**
- Trigger scripts execute in < 100ms
- AI subagents run asynchronously when needed
- Minimal impact on Claude Code responsiveness

### ✅ **Maintainability** 
- Modular design with clear separation of concerns
- Shared libraries reduce code duplication
- Easy to add new triggers or subagents

### ✅ **Intelligence**
- AI subagents provide sophisticated analysis
- Context-aware recommendations
- Continuous learning from user interactions

### ✅ **Reliability**
- Graceful degradation when subagents unavailable
- Comprehensive error handling
- Fallback mechanisms for all operations

## Installation

The hybrid architecture is automatically installed with the Claude Code Custom Commands package:

```bash
# Install the NPM package
npm install -g @paulduvall/claude-dev-toolkit

# Deploy hooks to Claude Code
claude-commands install --hooks

# Configure hybrid architecture
claude-commands config --template hybrid-hook-config.yaml
```

## Development

### Adding New Triggers

1. Create trigger script in `hooks/`
2. Use modular libraries from `hooks/lib/`
3. Add configuration to template files
4. Test with `claude-commands verify`

### Adding New Subagents

1. Create subagent definition in `subagents/`
2. Update trigger scripts to reference new subagent
3. Test integration with sample events

## Troubleshooting

### Common Issues

1. **Permission Errors**: Ensure all `hooks/` scripts are executable
2. **Missing Dependencies**: Run `claude-commands verify` to check setup
3. **Configuration Issues**: Validate YAML syntax in template files

### Debug Mode

Enable verbose logging for troubleshooting:

```bash
export CLAUDE_HOOK_DEBUG=1
claude-commands verify --verbose
```

## Architecture Evolution

This hybrid approach evolved from earlier monolithic designs to provide:

- **Faster Response** - Lightweight triggers vs heavy orchestration
- **Better Maintainability** - Modular design vs monolithic scripts  
- **AI Integration** - Specialized subagents vs generic automation
- **Scalability** - Event-driven architecture vs polling-based systems

The architecture continues to evolve based on user feedback and performance metrics.