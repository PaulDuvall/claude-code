# Hybrid Hook Architecture Guide

## Overview

The Claude Code custom commands project has evolved from a complex monolithic hook system to a **Hybrid Architecture** that combines lightweight bash triggers with intelligent AI subagent delegation. This approach provides the best balance of immediate response, maintainability, and AI-powered analysis.

## Architecture Comparison

### Before: Monolithic Approach
- **`subagent-trigger.sh`**: 253-line complex orchestration script
- **Issues**: God function antipattern, high complexity, difficult maintenance
- **Approach**: All logic implemented in bash with complex execution engine

### After: Hybrid Approach  
- **4 lightweight trigger scripts**: 30-100 lines each
- **8 modular libraries**: Shared utilities in `hooks/lib/`
- **AI delegation**: Complex logic handled by specialized subagents
- **Benefits**: Simplified maintenance, better error handling, AI-driven intelligence

## New Architecture Components

### 1. Lightweight Trigger Scripts

#### `hooks/pre-write-security.sh` (87 lines)
**Purpose**: Security analysis before file modifications  
**Delegates to**: `security-auditor` subagent  
**Trigger**: PreToolUse for Edit, Write, MultiEdit tools

**Key Features**:
- Lightweight context gathering (tool, file, user, timestamp)
- Security-focused analysis delegation
- Immediate feedback with clear prompts
- Integration with shared libraries

**Example Usage**:
```bash
# Automatic trigger via Claude Code hooks
CLAUDE_TOOL="Edit" CLAUDE_FILE="main.py" ./hooks/pre-write-security.sh

# Output: Security analysis delegation to security-auditor subagent
```

#### `hooks/pre-commit-quality.sh` (134 lines)
**Purpose**: Code quality validation before git commits  
**Delegates to**: `style-enforcer` subagent  
**Trigger**: Custom hook for pre-commit operations

**Key Features**:
- Git integration (staged files analysis)
- Basic file integrity checks (JSON, YAML, shell syntax)
- Quick credential exposure scanning
- Comprehensive quality context gathering

**Example Usage**:
```bash
# Git pre-commit hook integration
./hooks/pre-commit-quality.sh

# Output: Quality analysis with staged files context
```

#### `hooks/on-error-debug.sh` (147 lines)  
**Purpose**: Automatic debugging assistance on errors  
**Delegates to**: `debug-specialist` subagent  
**Trigger**: OnError events or manual error analysis

**Key Features**:
- Error classification (permission, syntax, network, dependency)
- System diagnostics gathering
- Comprehensive error context
- Environment-specific analysis

**Example Usage**:
```bash
# Automatic error handling
./hooks/on-error-debug.sh "ImportError: No module named 'requests'" "python main.py"

# Output: Debugging analysis with system context
```

#### `hooks/subagent-trigger-simple.sh` (115 lines)
**Purpose**: General-purpose lightweight subagent trigger  
**Delegates to**: Any subagent (specified as argument)  
**Trigger**: Manual invocation or custom event handling

**Key Features**:
- Flexible subagent selection
- Event type validation 
- Minimal context gathering
- Help system integration

**Example Usage**:
```bash
# Manual subagent invocation
./hooks/subagent-trigger-simple.sh security-auditor pre_write
./hooks/subagent-trigger-simple.sh style-enforcer pre_commit "Check Python files"
./hooks/subagent-trigger-simple.sh debug-specialist on_error "ImportError"
```

### 2. Shared Library System (`hooks/lib/`)

The modular library system is **preserved and enhanced** to support both trigger scripts and subagents:

#### Core Modules
- **`config-constants.sh`** (230 lines): Shared constants, validation, supported events
- **`context-manager.sh`** (549 lines): Context gathering, JSON generation, validation  
- **`error-handler.sh`** (412 lines): Standardized logging, error recovery, security notifications
- **`file-utils.sh`** (375 lines): Secure file operations, path validation, permission checks

#### Extended Modules  
- **`argument-parser.sh`** (422 lines): CLI parsing, validation, help system
- **`subagent-discovery.sh`** (465 lines): Subagent enumeration, event mapping
- **`subagent-validator.sh`** (596 lines): Comprehensive validation, reporting
- **`execution-engine.sh`** (607 lines): Advanced execution patterns (for complex scenarios)

**Benefits of Shared Libraries**:
- ✅ Code reuse across all trigger scripts  
- ✅ Consistent error handling and logging
- ✅ Standardized security practices
- ✅ Easy maintenance and updates
- ✅ Available to both hooks and subagents

### 3. Subagent Delegation Pattern

Each trigger script follows a consistent pattern:

1. **Load Essential Libraries**: Only what's needed for lightweight operation
2. **Gather Relevant Context**: Focused context for the specific use case
3. **Validate Input**: Basic validation with helpful error messages
4. **Delegate to Subagent**: Clear delegation with structured context
5. **Provide User Guidance**: Clear prompts for next steps

**Delegation Benefits**:
- **AI Intelligence**: Complex analysis handled by Claude's reasoning
- **Context Preservation**: Rich context passed to subagents
- **User Interaction**: Natural conversation with specialized experts
- **Maintainability**: Logic changes don't require bash script updates

## Configuration and Integration

### Claude Code Settings Integration

Add trigger scripts to your `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "command": "~/.claude/hooks/pre-write-security.sh",
            "blocking": true,
            "description": "Security analysis via security-auditor subagent"
          }
        ]
      }
    ],
    "OnError": [
      {
        "hooks": [
          {
            "command": "~/.claude/hooks/on-error-debug.sh",
            "blocking": false,
            "description": "Automatic debugging via debug-specialist subagent"
          }
        ]
      }
    ],
    "custom": {
      "pre-commit": {
        "command": "~/.claude/hooks/pre-commit-quality.sh",
        "description": "Quality checks via style-enforcer subagent"
      }
    }
  }
}
```

### Git Integration

For git workflow integration:

```bash
# Add to .git/hooks/pre-commit
#!/usr/bin/env bash  
~/.claude/hooks/pre-commit-quality.sh
```

### Manual Usage

All trigger scripts support direct invocation for testing and manual use:

```bash
# Test security analysis
CLAUDE_TOOL="Edit" CLAUDE_FILE="app.py" ./hooks/pre-write-security.sh

# Test quality checks
./hooks/pre-commit-quality.sh

# Test error debugging  
./hooks/on-error-debug.sh "Syntax Error" "python script.py"

# General subagent invocation
./hooks/subagent-trigger-simple.sh debug-specialist manual "Help with performance issue"
```

## Migration Guide

### From Complex to Hybrid

**Step 1: Preserve the Foundation**
- Keep `hooks/lib/` directory (excellent modular foundation)
- Update shared libraries for compatibility

**Step 2: Replace Complex Scripts**  
- Replace `hooks/subagent-trigger.sh` (253 lines) with appropriate lightweight triggers
- Update Claude Code settings.json to use new trigger scripts

**Step 3: Update Configuration**
- Use `templates/hybrid-hook-config.yaml` as reference
- Test trigger scripts individually before integration

**Step 4: Validate Migration**
- Test each trigger script manually
- Verify subagent delegation works correctly  
- Check error handling and logging

### Benefits Realized

**Maintainability**:
- 253-line complex script → 4 focused scripts (30-150 lines each)
- Clear separation of concerns
- Easier debugging and testing

**User Experience**:
- Immediate feedback from trigger scripts
- Clear delegation to appropriate subagents  
- Better error messages and guidance

**Developer Experience**:
- Simplified hook development
- Reusable library components
- AI-driven logic instead of bash complexity

## Best Practices

### Trigger Script Development

1. **Keep It Simple**: 30-150 lines maximum per trigger script
2. **Focus on Context**: Gather only relevant context for the use case  
3. **Clear Delegation**: Provide clear instructions to subagents
4. **Error Handling**: Use shared error handling libraries
5. **Testing**: Support manual testing with environment variables

### Library Usage

1. **Selective Loading**: Only load necessary libraries for performance
2. **Consistent Patterns**: Use established patterns from existing triggers
3. **Error Recovery**: Implement graceful degradation
4. **Security**: Always validate inputs and paths

### Subagent Integration  

1. **Structured Context**: Use JSON for structured data exchange
2. **Clear Instructions**: Provide specific guidance to subagents
3. **Feedback Loop**: Design for iterative conversation
4. **Fallback**: Handle cases where subagents aren't available

## Troubleshooting

### Common Issues

**Readonly Variable Errors**:
```bash
# Issue: Variable already defined in config-constants.sh
# Solution: Don't redeclare readonly variables in other modules
```

**Module Loading Conflicts**:
```bash  
# Issue: Multiple module loading
# Solution: Use module loading guards in config-constants.sh
```

**Permission Issues**:
```bash
# Fix: Ensure scripts are executable
chmod +x hooks/*.sh
```

### Testing Commands

```bash
# Test individual triggers
./hooks/pre-write-security.sh
./hooks/pre-commit-quality.sh  
./hooks/on-error-debug.sh "test error"
./hooks/subagent-trigger-simple.sh --help

# Test with environment context
CLAUDE_TOOL="Edit" CLAUDE_FILE="test.py" ./hooks/pre-write-security.sh

# Check shared libraries
bash -n hooks/lib/*.sh  # Syntax check
```

## Future Enhancements  

### Planned Improvements

1. **Async Triggers**: Non-blocking subagent invocation for some use cases
2. **Context Caching**: Cache context between related operations
3. **Trigger Templates**: Templates for creating new domain-specific triggers  
4. **Integration Testing**: Automated testing of trigger-subagent workflows
5. **Performance Metrics**: Monitoring and optimization of trigger performance

### Community Contributions

The hybrid architecture makes it easy to contribute new trigger scripts:

1. Create focused trigger script (30-150 lines)
2. Use shared libraries from `hooks/lib/`
3. Follow delegation patterns from existing triggers
4. Add configuration examples
5. Include testing and documentation

This hybrid approach successfully balances the immediate responsiveness of bash hooks with the intelligent analysis capabilities of AI subagents, creating a maintainable and powerful development workflow automation system.