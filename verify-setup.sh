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

echo ""
echo "🚀 To get started:"
echo "   • Run setup: ./setup.sh"
echo "   • Deploy commands: ./deploy.sh" 
echo "   • Configure system: ./configure-claude-code.sh"
echo ""