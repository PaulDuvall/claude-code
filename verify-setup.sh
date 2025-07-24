#!/usr/bin/env bash
set -euo pipefail

# Simple Claude Code Setup Verification
echo "🔍 Claude Code Setup Verification"
echo "================================="
echo ""

# Check Claude Code
echo -n "Claude Code: "
if command -v claude &> /dev/null; then
    if version=$(timeout 3s claude --version </dev/null 2>/dev/null); then
        echo "✅ Installed ($version)"
    else
        echo "✅ Installed (may need setup)"
    fi
else
    echo "❌ Not installed"
fi

# Check Node.js  
echo -n "Node.js: "
if command -v node &> /dev/null; then
    version=$(node --version 2>/dev/null || echo "unknown")
    echo "✅ Installed ($version)"
else
    echo "❌ Not installed"
fi

# Check npm
echo -n "npm: "  
if command -v npm &> /dev/null; then
    version=$(npm --version 2>/dev/null || echo "unknown")
    echo "✅ Installed ($version)"
else
    echo "⚠️  Not found"
fi

# Check authentication
echo -n "Authentication: "
if [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
    if [[ "$ANTHROPIC_API_KEY" =~ ^sk-ant- ]]; then
        echo "✅ API key configured"
    else
        echo "⚠️  API key format invalid"
    fi
else
    echo "✅ Web-based (recommended)"
fi

# Check configuration files
echo -n "Configuration: "
if [[ -f ~/.claude.json ]]; then
    if command -v jq &> /dev/null && jq . ~/.claude.json > /dev/null 2>&1; then
        echo "✅ Valid configuration found"
    else
        echo "⚠️  Configuration exists but may be invalid"
    fi
else
    echo "⚠️  No configuration file found"
fi

# Check custom commands
echo -n "Custom Commands: "
if [[ -d ~/.claude/commands ]]; then
    count=$(ls ~/.claude/commands/x*.md 2>/dev/null | wc -l | tr -d ' ')
    if [[ $count -gt 0 ]]; then
        echo "✅ $count deployed"
    else
        echo "⚠️  Directory exists but no commands found"
    fi
else
    echo "⚠️  Commands directory not found"
fi

# Check hooks
echo -n "Security Hooks: "
if [[ -d ~/.claude/hooks ]]; then
    count=$(ls ~/.claude/hooks/*.sh 2>/dev/null | wc -l | tr -d ' ')
    if [[ $count -gt 0 ]]; then
        echo "✅ $count installed"
    else
        echo "ℹ️  Directory exists but no hooks found"
    fi
else
    echo "ℹ️  No hooks directory (basic setup)"
fi

# Check file permissions on sensitive files
echo -n "File Permissions: "
if [[ -f ~/.claude.json ]]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        perms=$(stat -f %A ~/.claude.json 2>/dev/null)
    else
        perms=$(stat -c %a ~/.claude.json 2>/dev/null)
    fi
    if [[ "$perms" == "600" ]]; then
        echo "✅ Secure (600)"
    else
        echo "⚠️  Insecure ($perms) - should be 600"
    fi
else
    echo "ℹ️  No config file to check"
fi

# Check for credential exposure in environment
echo -n "Environment Security: "
if env | grep -q "ANTHROPIC.*=" 2>/dev/null; then
    echo "⚠️  API credentials visible in environment"
else
    echo "✅ No exposed credentials"
fi

# Check Claude Code settings validation
echo -n "Settings Validation: "
if timeout 3s claude config list > /dev/null 2>&1; then
    echo "✅ Settings accessible"
else
    echo "⚠️  Settings may be corrupted"
fi

# Check trust settings
echo -n "Trust Configuration: "
if claude config get hasTrustDialogAccepted 2>/dev/null | grep -q "true"; then
    echo "✅ Trust configured"
else
    echo "ℹ️  Trust dialog not accepted"
fi

# Test basic Claude Code functionality
echo -n "Basic Functionality: "
if timeout 5s claude --help > /dev/null 2>&1; then
    echo "✅ Help accessible"
else
    echo "⚠️  May have startup issues"
fi

# Test custom command accessibility
echo -n "Command Integration: "
if [[ -d ~/.claude/commands ]] && [[ $(ls ~/.claude/commands/x*.md 2>/dev/null | wc -l) -gt 0 ]]; then
    # Try to validate a command file structure
    if head -1 ~/.claude/commands/x*.md 2>/dev/null | grep -q "^---"; then
        echo "✅ Commands properly formatted"
    else
        echo "⚠️  Command format may be invalid"
    fi
else
    echo "ℹ️  No commands to test"
fi

# Check for Git (required for /xgit command)
echo -n "Git Integration: "
if command -v git &> /dev/null; then
    if git --version > /dev/null 2>&1; then
        echo "✅ Available ($(git --version | cut -d' ' -f3))"
    else
        echo "⚠️  Git installed but not working"
    fi
else
    echo "⚠️  Not installed (needed for /xgit)"
fi

# Check for Docker (required for MCP servers)
echo -n "Docker Support: "
if command -v docker &> /dev/null; then
    if docker info > /dev/null 2>&1; then
        echo "✅ Running (MCP servers available)"
    else
        echo "ℹ️  Installed but not running"
    fi
else
    echo "ℹ️  Not installed (MCP servers unavailable)"
fi

# Check Node.js compatibility
echo -n "Node.js Compatibility: "
if command -v node &> /dev/null; then
    version=$(node --version | cut -c2-)
    major=$(echo "$version" | cut -d. -f1)
    if [[ $major -ge 18 ]]; then
        echo "✅ Compatible (v$version)"
    else
        echo "⚠️  May be too old (v$version, need 18+)"
    fi
else
    echo "❌ Not available"
fi

# Check available disk space
echo -n "Disk Space: "
if command -v df &> /dev/null; then
    available=$(df -h ~/.claude 2>/dev/null | tail -1 | awk '{print $4}' || echo "unknown")
    echo "ℹ️  $available available"
else
    echo "ℹ️  Cannot determine"
fi

# Check for backup directory
echo -n "Backup System: "
if [[ -d ~/.claude-backups ]]; then
    count=$(ls ~/.claude-backups/ 2>/dev/null | wc -l | tr -d ' ')
    echo "ℹ️  $count backup(s) available"
else
    echo "ℹ️  No backups found"
fi

echo ""
echo "🚀 To get started:"
echo "   • Run setup: ./setup.sh"
echo "   • Deploy commands: ./deploy.sh" 
echo "   • Configure system: ./configure-claude-code.sh"
echo ""