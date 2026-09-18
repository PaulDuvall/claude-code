# Manual Testing Guide

This guide explains how to run comprehensive manual tests for the claude-dev-toolkit NPM package.

## Quick Start

### Run Complete Manual Test Suite

```bash
# From the package directory
npm run test:manual

# Or run directly
./scripts/publishing/manual-test-suite.sh
```

This single command runs all 10 test steps automatically:

1. **Environment Cleanup** - Removes existing installations
2. **Test Directory Setup** - Creates clean test environment  
3. **Dependency Installation** - Installs package dependencies
4. **Global Package Installation** - Installs package globally
5. **CLI Command Testing** - Tests all CLI commands
6. **Package Validation** - Runs package validation
7. **File Structure Verification** - Checks installed files
8. **Command Structure Testing** - Validates command format
9. **Comprehensive Test Suite** - Runs all automated tests
10. **Claude Code Integration Check** - Verifies Claude Code setup

## Manual Step-by-Step Process

If you prefer to run each step manually:

### 1. Clean Environment
```bash
npm uninstall -g @paulduvall/claude-dev-toolkit 2>/dev/null || true
rm -rf ~/claude-toolkit-test
rm -rf ~/.claude/commands/ ~/.claude/hooks/
npm cache clean --force
```

### 2. Setup Test Directory
```bash
mkdir ~/claude-toolkit-test
cd ~/claude-toolkit-test
git clone https://github.com/PaulDuvall/claude-code.git
cd claude-code/claude-dev-toolkit
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Install Package Globally
```bash
npm install -g .
```

### 5. Test CLI Commands
```bash
claude-commands --version
claude-commands --help
claude-commands list
claude-commands status
```

### 6. Run Package Tests
```bash
npm test
npm run validate
```

### 7. Verify Installation
```bash
ls ~/.claude/commands/active/     # Should show 13 commands
ls ~/.claude/commands/experiments/ # Should show 45 commands
```

### 8. Test in Claude Code
```bash
# Open Claude Code and try:
/xhelp
/xtest --help
/xgit --help
```

## Expected Results

### ✅ Successful Test Run Output
```
🧪 Claude Dev Toolkit Manual Test Suite
========================================
Testing complete package installation and functionality

🗑️  Step 1: Environment Cleanup
✅ Environment cleaned

📁 Step 2: Test Directory Setup  
✅ Test directory created
✅ Package.json exists
✅ Binary exists

📦 Step 3: Dependency Installation
✅ Dependencies installed successfully

🌐 Step 4: Global Package Installation
✅ Global installation completed

⚡ Step 5: CLI Command Testing
✅ CLI binary is accessible
✅ Version command works
✅ Help command works
✅ List command works
✅ Status command works

✅ Step 6: Package Validation
✅ Package validation passes

📂 Step 7: File Structure Verification
✅ Claude directory exists
✅ Commands directory exists
✅ Active commands exist
✅ Experimental commands exist
✅ Active commands count correct (13)
✅ Experimental commands count correct (45)

🔍 Step 8: Command Structure Testing
✅ Sample command has YAML frontmatter
✅ Sample command has description
✅ Sample command has tags

🧪 Step 9: Comprehensive Test Suite
✅ All package tests passed
✅ 100% test success rate confirmed

🔗 Step 10: Claude Code Integration Check
✅ Claude Code is installed

📊 Final Results Summary
========================
Tests Passed: 20
Tests Failed: 0
Success Rate: 100%

🎉 ALL TESTS PASSED!
```

## Troubleshooting

### If Global Installation Fails
```bash
mkdir -p ~/.npm-global
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
npm install -g .
```

### If Commands Don't Work
```bash
which claude-commands
npm bin -g
ls $(npm bin -g) | grep claude
```

### If Claude Code Integration Fails
```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Restart Claude Code after installation
```

### If Tests Fail
```bash
# Check test logs
cat /tmp/test-results.log

# Run individual tests
npm run test:req007
npm run test:req009  
npm run test:req018
```

## Alternative Testing Methods

### Using Local Registry (Verdaccio)
```bash
./scripts/publishing/setup-local-registry.sh
npm publish --registry http://localhost:4873
npm install -g @paulduvall/claude-dev-toolkit --registry http://localhost:4873
```

### Using NPM Pack
```bash
npm pack
npm install -g ./claude-dev-toolkit-*.tgz
```

## Performance Expectations

- **Total test time**: ~2-3 minutes
- **Installation time**: ~30 seconds
- **Package validation**: ~5 seconds
- **Test suite execution**: ~30 seconds

## Integration with CI/CD

The manual test script is designed to also work in automated environments:

```yaml
- name: Run Manual Test Suite
  run: |
    cd claude-dev-toolkit
    npm run test:manual
```

## Next Steps After Successful Testing

1. Commands are available in Claude Code at `/x*`
2. Package is ready for NPM registry publication
3. All requirements (REQ-007, REQ-009, REQ-018) are validated
4. Security hooks and configuration templates are working

The manual testing validates the complete user installation experience from start to finish!