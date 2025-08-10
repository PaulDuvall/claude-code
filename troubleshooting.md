# Claude Code Troubleshooting Guide

## Authentication Issues

### Problem: API Key Error When Running `claude auth`

If you're getting API key errors when trying to authenticate with Claude Code, follow these troubleshooting steps:

## Quick Fixes

### 1. Update Claude Code
```bash
# Using npm
npm update -g @anthropic/claude-code

# Or using the built-in updater
claude update
```

### 2. Clear Existing Configuration
```bash
# Remove configuration files
rm ~/.claude.json
rm -rf ~/.claude/

# Clear any environment variables
unset ANTHROPIC_API_KEY
```

### 3. Retry Authentication
```bash
claude auth
```

## Alternative Authentication Methods

### Web Authentication
```bash
# Standard web auth
claude login

# Alternative syntax
claude auth login

# Explicit web flag (if available)
claude auth --web
```

### API Key Authentication
```bash
# If web auth fails, use API key
claude auth --api-key YOUR_KEY

# Or set as environment variable
export ANTHROPIC_API_KEY="your-api-key-here"
```

## Diagnostic Steps

### 1. Check Installation
```bash
# Verify Claude Code version
claude --version

# Check installation location
which claude

# Verify npm global packages
npm list -g @anthropic/claude-code
```

### 2. Check Configuration
```bash
# View current configuration
claude config show

# Check for config files
ls -la ~/.claude*
```

### 3. Test Connection
```bash
# Test Claude Code functionality
claude "Hello, are you working?"

# Check API status
curl -I https://api.anthropic.com/v1/health
```

## Complete Reinstallation

If issues persist, perform a clean reinstallation:

```bash
# 1. Uninstall Claude Code
npm uninstall -g @anthropic/claude-code

# 2. Clear all configuration
rm -rf ~/.claude*
rm -rf ~/.config/claude*

# 3. Clear npm cache
npm cache clean --force

# 4. Reinstall Claude Code
npm install -g @anthropic/claude-code

# 5. Authenticate
claude auth
```

## Platform-Specific Issues

### macOS
```bash
# Check for permission issues
sudo npm install -g @anthropic/claude-code

# Reset LaunchServices if command not found
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -kill -r -domain local -domain system -domain user
```

### Linux
```bash
# Install with proper permissions
sudo npm install -g @anthropic/claude-code

# Add to PATH if needed
echo 'export PATH="$PATH:$(npm prefix -g)/bin"' >> ~/.bashrc
source ~/.bashrc
```

### Windows
```powershell
# Run as Administrator
npm install -g @anthropic/claude-code

# Check PATH variable
echo $env:PATH

# Add npm global bin to PATH if missing
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Users\$env:USERNAME\AppData\Roaming\npm", [EnvironmentVariableTarget]::User)
```

## Common Error Messages

### "API key not found"
- Claude Code is defaulting to API key mode
- Try: `claude auth --web` or `claude login`

### "Command not found"
- Claude Code not in PATH
- Try: `npx @anthropic/claude-code auth`

### "Permission denied"
- Installation permission issue
- Try: `sudo npm install -g @anthropic/claude-code`

### "Network error"
- Check internet connection
- Check proxy settings: `npm config get proxy`
- Clear proxy if not needed: `npm config delete proxy`

## Environment Variables

Check and manage environment variables:

```bash
# View current API key setting
echo $ANTHROPIC_API_KEY

# Remove if causing conflicts
unset ANTHROPIC_API_KEY

# Set if using API key auth
export ANTHROPIC_API_KEY="sk-ant-..."
```

## Getting Help

### Official Resources
- Documentation: https://docs.anthropic.com/en/docs/claude-code
- API Console: https://console.anthropic.com
- GitHub Issues: https://github.com/anthropics/claude-code/issues

### Debug Mode
```bash
# Run with verbose output
claude --debug auth

# Check logs
claude logs
```

### Support Channels
1. Check the official documentation for updates
2. Search existing GitHub issues
3. Report new issues with:
   - Claude Code version (`claude --version`)
   - Operating system and version
   - Complete error message
   - Steps to reproduce

## Quick Setup Script

For automated setup and troubleshooting:

```bash
#!/bin/bash
# Save as fix-claude.sh and run with: bash fix-claude.sh

echo "Fixing Claude Code installation..."

# Update npm
npm update -g npm

# Reinstall Claude Code
npm uninstall -g @anthropic/claude-code
npm cache clean --force
npm install -g @anthropic/claude-code

# Clear old config
rm -rf ~/.claude*

# Test installation
claude --version

# Attempt authentication
claude auth

echo "Setup complete! If issues persist, try 'claude auth --api-key YOUR_KEY'"
```

## Notes

- Web authentication is the recommended method for most users
- API keys should be kept secure and never committed to version control
- Some corporate networks may require proxy configuration
- Version mismatches can cause authentication to default to API key mode

If problems persist after trying these solutions, consider reporting the issue with detailed information about your environment and the exact error messages you're encountering.