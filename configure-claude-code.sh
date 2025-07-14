#!/usr/bin/env bash
set -euo pipefail

# ⚠️  SECURITY WARNING ⚠️ 
# DO NOT RUN THIS SCRIPT WITHOUT REVIEWING IT FIRST!
# This script modifies system configurations, handles API keys, and installs extensions.
# Always use --dry-run first to preview changes.
# Review the source code to understand what it does before executing.

# Script to automate Claude Code after installation on macOS with Windsurf
# Based on Patrick Debois' original script: https://gist.github.com/jedi4ever/762ca6746ef22b064550ad7c04f3bd2f
# 
# This version adds:
# - macOS and Windsurf specific adaptations
# - Backup and recovery mechanisms
# - Interactive mode with dry-run option
# - Better error handling and validation
#
# Install Claude Code via: `npm install -g @anthropic-ai/claude-code`

# Key features:
# - Backs up existing configuration before making changes
# - Interactive mode to preview changes
# - Dry-run option to see what would be changed
# - Configure API keys, trust directory, MCP servers, permissions
# - macOS and Windsurf specific configurations

##################################
# Configuration and Constants
##################################
BACKUP_DIR="$HOME/.claude-backups/$(date +%Y%m%d_%H%M%S)"
DRY_RUN=false
INTERACTIVE=true
FORCE=false

##################################
# Parse command line arguments
##################################
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --force)
            FORCE=true
            INTERACTIVE=false
            shift
            ;;
        --non-interactive)
            INTERACTIVE=false
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --dry-run          Show what would be changed without making changes"
            echo "  --force            Skip all prompts and backup checks (use with caution)"
            echo "  --non-interactive  Run without prompts (but still create backups)"
            echo "  --help             Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                 # Interactive mode with backups"
            echo "  $0 --dry-run       # Preview changes without applying"
            echo "  $0 --force         # Apply all changes without prompts"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

##################################
# Utility Functions
##################################
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

error() {
    echo "[ERROR] $*" >&2
}

confirm() {
    if [[ "$FORCE" == "true" ]]; then
        return 0
    fi
    
    if [[ "$INTERACTIVE" == "true" ]]; then
        echo -n "$1 (y/n) "
        read -r response
        [[ "$response" == "y" ]]
    else
        return 0
    fi
}

backup_file() {
    local file="$1"
    if [[ -f "$file" ]]; then
        if [[ "$DRY_RUN" == "true" ]]; then
            log "[DRY-RUN] Would backup $file to $BACKUP_DIR/"
        else
            mkdir -p "$BACKUP_DIR"
            cp -p "$file" "$BACKUP_DIR/"
            log "Backed up $file to $BACKUP_DIR/"
        fi
    fi
}

backup_directory() {
    local dir="$1"
    if [[ -d "$dir" ]]; then
        if [[ "$DRY_RUN" == "true" ]]; then
            log "[DRY-RUN] Would backup directory $dir to $BACKUP_DIR/"
        else
            mkdir -p "$BACKUP_DIR"
            cp -rp "$dir" "$BACKUP_DIR/"
            log "Backed up directory $dir to $BACKUP_DIR/"
        fi
    fi
}

show_diff() {
    local file="$1"
    local new_content="$2"
    
    if [[ -f "$file" ]]; then
        echo "=== Changes to $file ==="
        if command -v diff &> /dev/null; then
            echo "$new_content" | diff -u "$file" - || true
        else
            echo "Current file exists. New content would replace it."
        fi
        echo "=================="
    else
        echo "=== New file: $file ==="
        echo "$new_content"
        echo "=================="
    fi
}

##################################
# Pre-flight checks
##################################
log "Claude Code Configuration Script for macOS + Windsurf"

if [[ "$DRY_RUN" == "true" ]]; then
    log "Running in DRY-RUN mode - no changes will be made"
fi

# Check for existing configuration
if [[ -f "$HOME/.claude.json" ]] || [[ -d "$HOME/.claude" ]]; then
    log "Existing Claude configuration detected!"
    
    if [[ "$INTERACTIVE" == "true" ]] && [[ "$FORCE" != "true" ]]; then
        echo ""
        echo "The following files/directories will be modified:"
        [[ -f "$HOME/.claude.json" ]] && echo "  - ~/.claude.json"
        [[ -d "$HOME/.claude" ]] && echo "  - ~/.claude/"
        echo ""
        
        if ! confirm "Do you want to backup existing configuration and continue?"; then
            log "Aborted by user"
            exit 0
        fi
    fi
    
    # Create backups
    backup_file "$HOME/.claude.json"
    backup_directory "$HOME/.claude"
fi

##################################
# Detect OS and validate environment
##################################
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "This script is configured for macOS. Detected OS: $OSTYPE"
    if ! confirm "Continue anyway?"; then
        exit 1
    fi
fi

# Check if claude is installed
if ! command -v claude &> /dev/null; then
    echo "Claude Code is not installed. Please install it first:"
    echo "npm install -g @anthropic-ai/claude-code"
    exit 1
fi

# Check if ANTHROPIC_API_KEY is set
if [ -z "${ANTHROPIC_API_KEY:-}" ]; then
    echo "ANTHROPIC_API_KEY environment variable is not set"
    echo "Please export your API key first"
    echo "Example: export ANTHROPIC_API_KEY='sk-ant-...'"
    exit 1
fi

# Validate API key format (basic check)
if [[ ! "$ANTHROPIC_API_KEY" =~ ^sk-ant- ]]; then
    echo "Warning: API key doesn't match expected format (should start with 'sk-ant-')"
    if ! confirm "Continue anyway?"; then
        exit 1
    fi
fi

##################################
# Configuration Management
##################################
apply_change() {
    local action="$1"
    local description="$2"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY-RUN] Would: $description"
    else
        log "Applying: $description"
        if ! eval "$action"; then
            error "Failed to execute: $description"
            exit 1
        fi
    fi
}

##################################
# Create claude directory if needed
##################################
if [[ "$DRY_RUN" == "true" ]]; then
    log "[DRY-RUN] Would create ~/.claude directory"
else
    mkdir -p ~/.claude
fi

##################################
# Setting up the API access :
# - claude code has two modes : either via Claude Max or using an API
# - claude max opens an oauth flow, which we can't use
# - we can just use the ANTHROPIC_API_KEY , but it will stil ask for approval
# - we found another way of providing the API by using a shell script that provides that key
# - this is useful for example if you want to fetch from somewhere else like 1password or so
# idea via https://www.reddit.com/r/ClaudeAI/comments/1jwvssa/claude_code_with_api_key/
##################################
# Setup API helper
##################################
API_HELPER_CONTENT='#!/usr/bin/env bash
echo ${ANTHROPIC_API_KEY}'

API_HELPER_PATH="$HOME/.claude/anthropic_key_helper.sh"

if [[ "$INTERACTIVE" == "true" ]] && [[ -f "$API_HELPER_PATH" ]]; then
    show_diff "$API_HELPER_PATH" "$API_HELPER_CONTENT"
    if ! confirm "Update API helper script?"; then
        log "Skipping API helper update"
    else
        apply_change "echo '$API_HELPER_CONTENT' > $API_HELPER_PATH && chmod +x $API_HELPER_PATH" \
                     "Creating API helper script"
    fi
else
    apply_change "echo '$API_HELPER_CONTENT' > $API_HELPER_PATH && chmod +x $API_HELPER_PATH" \
                 "Creating API helper script"
fi

##################################
# Configuring claude code
##################################
# - on the one hand claude code wants us to use claude config
# - but for example I was not able to configure the theme using it:
# the command executed with no errors, but kept asking for the theme
# also see https://github.com/anthropics/claude-code/issues/434
# and https://github.com/anthropics/claude-code/issues/441

# 
# - https://docs.anthropic.com/en/docs/claude-code/settings#settings-files
# - on the other hand the docs mentions it'd deprecating that command
# - we resort to creating a skeleton json file
#
# - shiftEnterKeyBindingInstalled configures the ask for terminal install
# - hasCompletedOnboarding indicates configuration is done
# - set the theme to dark here
#
# for the API key it's not enough to setup the apiKeyHelper
# - you have to mark it as approved
# - for refer to that key is uses the last 20 chars of the key it seems
# - here we assume you have ANTHROPIC_API_KEY configured as env var
##################################
ANTHROPIC_API_KEY_LAST_20_CHARS=${ANTHROPIC_API_KEY: -20}

# We write the global config to ~/.claude.json
# Warning this overwrites your existing
CLAUDE_CONFIG_CONTENT='{
    "customApiKeyResponses": {
        "approved": [ "'$ANTHROPIC_API_KEY_LAST_20_CHARS'"],
        "rejected": [  ]
    },
    "shiftEnterKeyBindingInstalled": true,
    "theme": "dark" ,
    "hasCompletedOnboarding": true
}'

if [[ "$INTERACTIVE" == "true" ]] && [[ -f "$HOME/.claude.json" ]]; then
    show_diff "$HOME/.claude.json" "$CLAUDE_CONFIG_CONTENT"
    if ! confirm "Update Claude configuration?"; then
        log "Skipping Claude configuration update"
    else
        apply_change "echo '$CLAUDE_CONFIG_CONTENT' > ~/.claude.json && chmod 600 ~/.claude.json" \
                     "Creating Claude configuration"
    fi
else
    apply_change "echo '$CLAUDE_CONFIG_CONTENT' > ~/.claude.json && chmod 600 ~/.claude.json" \
                 "Creating Claude configuration"
fi

# to configure the API helper goes into the .claude/settings.json file
if [[ "$DRY_RUN" == "true" ]]; then
    log "[DRY-RUN] Would configure API helper in settings"
else
    claude config set --global apiKeyHelper ~/.claude/anthropic_key_helper.sh
fi

##################################
# Trust the current dir/project
##################################
if [[ "$DRY_RUN" == "true" ]]; then
    log "[DRY-RUN] Would configure trust settings"
else
    claude config set hasTrustDialogAccepted true
    claude config set hasCompletedProjectOnboarding true
fi

#################################
# Configuring MCP servers
# - it has an claude mcp subcommand
# - I prefer to add it through the json command at is has more options
# - also beware that the env vars you set are visible using the claude mcp 
# - ideally you limit the read access to the .claude.json or ~/.claude with umask or similar
#################################

# Check if Docker Desktop is running on macOS
if command -v docker &> /dev/null && docker info > /dev/null 2>&1; then
    echo "Docker is available, setting up MCP servers..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY-RUN] Would pull Docker image and configure MCP server"
    else
        # claude code install doesn't give much output during install
        # therefore I pull the container typically seperate
        docker pull mcp/puppeteer

        # example that generates the config into the MCP_JSON var
        read -r -d '' MCP_JSON <<'EOF'
{
      "command": "docker",
      "args": ["run", "-i", "--rm", "--init", "-e", "DOCKER_CONTAINER=true", "mcp/puppeteer"]
}
EOF

        # then add it
        claude mcp add-json puppeteer "$MCP_JSON"
        # listing the server
        claude mcp list
    fi
else
    echo "Docker Desktop is not running. Skipping MCP server setup."
    echo "To use MCP servers, please start Docker Desktop and re-run this section."
fi

#################################
# Setting up permissions
# - we can config it using claude config add
# - though it says that's soon deprecated
# - we use add instead of set because it's an array
# - it writes the settings to ~/.claude/settings.json
# - mcp servers use the mcp__ prefix in the settings
# https://docs.anthropic.com/en/docs/claude-code/settings
#################################
if [[ "$DRY_RUN" == "true" ]]; then
    log "[DRY-RUN] Would configure allowed tools"
else
    claude config add allowedTools "Edit,Bash"
fi

#################################
# IDE extension for Windsurf:
# - Claude code comes with a VSCODE/Cursor extension
# - this extension is not available through the marketplace
# - it is part of the npm package
# - Note: this only works in an IDE terminal , not in postcreate commands , I set it in my .bashrc
#################################
# set the IDE code for Windsurf
IDE_CMD=windsurf

# Check if Windsurf command exists
if ! command -v $IDE_CMD &> /dev/null; then
    echo "Windsurf command not found. Please ensure Windsurf is installed and the command-line tool is available."
    echo "You may need to install the Windsurf command-line tool from within the IDE."
    echo "Skipping extension installation..."
else
    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY-RUN] Would install Claude Code extension for Windsurf"
    else
        # Do this in a tempdir (macOS compatible)
        tempdir=$(mktemp -d -t claude-install)
        cd "$tempdir"

        # downloads the package
        if ! npm pack @anthropic-ai/claude-code; then
            error "Failed to download Claude Code package"
            exit 1
        fi
        
        if ! tar -xzvf anthropic-ai-claude-code-*.tgz; then
            error "Failed to extract Claude Code package"
            exit 1
        fi
        
        # Install the extension
        # requires a reload of the editor
        echo "Installing Claude Code extension for Windsurf..."
        if ! $IDE_CMD --install-extension package/vendor/claude-code.vsix; then
            error "Failed to install Claude Code extension for Windsurf"
            echo "You may need to install it manually later"
        else
            echo "✓ Extension installed successfully"
        fi
        
        # Cleanup
        cd - > /dev/null
        rm -rf "$tempdir"
    fi
fi

#################################
# Interesting (undocumented settings)
#################################
# found via https://github.com/Helmi/claude-simone?tab=readme-ov-file#enabling-parallel-task-execution
if [[ "$DRY_RUN" == "true" ]]; then
    log "[DRY-RUN] Would configure parallel tasks count"
else
    claude config set --global parallelTasksCount 3
fi

#################################
# macOS Specific Security
#################################
# Restrict permissions on Claude directory
if [[ "$DRY_RUN" == "true" ]]; then
    log "[DRY-RUN] Would set secure permissions on ~/.claude directory"
else
    chmod 700 ~/.claude
fi

#################################
# Final validation and recovery info
#################################
echo ""
echo "=== Setup Complete ==="
echo ""

# Show backup location if backups were created
if [[ -d "$BACKUP_DIR" ]] && [[ "$DRY_RUN" != "true" ]]; then
    echo "Configuration backed up to: $BACKUP_DIR"
    echo ""
    echo "To restore previous configuration:"
    echo "  cp $BACKUP_DIR/.claude.json ~/"
    echo "  cp -r $BACKUP_DIR/.claude ~/"
    echo ""
fi

echo "To use the following environment variables, add them to your ~/.zshrc or ~/.bash_profile:"
echo ""
echo "# Claude Code Environment Variables"
echo "export ANTHROPIC_API_KEY='your-api-key-here'"
echo ""
echo "# Optional: enable debug logging"
echo "# export ANTHROPIC_LOG=debug"
echo ""
echo "# Recommended: disable non-essential traffic and telemetry for privacy"
echo "export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=true"
echo ""
echo "# Optional: increase timeouts for long-running commands"
echo "# export BASH_DEFAULT_TIMEOUT_MS=300000  # 5 minutes"
echo "# export MCP_TIMEOUT=60000  # 1 minute"
echo ""
echo "Don't forget to restart your terminal or run: source ~/.zshrc"
echo ""

if [[ "$DRY_RUN" == "true" ]]; then
    echo "=== DRY-RUN COMPLETE ==="
    echo "No changes were made. Run without --dry-run to apply changes."
else
    #################################
    # Final validation
    #################################
    echo "Validating installation..."
    if claude --version > /dev/null 2>&1; then
        echo "✓ Claude Code is properly installed"
    else
        echo "✗ Claude Code installation check failed"
    fi

    if [ -f ~/.claude.json ] && [ -f ~/.claude/anthropic_key_helper.sh ]; then
        echo "✓ Configuration files created successfully"
    else
        echo "✗ Configuration files missing"
    fi
fi

echo ""
echo "Setup complete! You may need to restart Windsurf for the extension to take effect."
echo ""
echo "🔐 Security Reminder:"
echo "- Your API key is stored in ~/.claude/anthropic_key_helper.sh"
echo "- Configuration files have restricted permissions (600/700)"
echo "- Review backup files in $BACKUP_DIR if needed"
echo "- Consider adding CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=true to your shell profile"