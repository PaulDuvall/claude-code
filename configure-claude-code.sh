#!/usr/bin/env bash
set -euo pipefail

# ⚠️  SECURITY WARNING ⚠️ 
# DO NOT RUN THIS SCRIPT WITHOUT REVIEWING IT FIRST!
# This script modifies system configurations, handles API keys, and installs extensions.
# Always use --dry-run first to preview changes.
# Review the source code to understand what it does before executing.

# Script to automate Claude Code configuration across platforms and IDEs
# Based on Patrick Debois' original script: https://gist.github.com/jedi4ever/762ca6746ef22b064550ad7c04f3bd2f
# 
# This modular version provides:
# - Cross-platform support (macOS, Linux)
# - Multi-IDE support (Windsurf, VSCode, Cursor)
# - Configurable shell environment detection
# - Backup and recovery mechanisms
# - Interactive mode with dry-run option
# - Better error handling and validation
#
# Install Claude Code via: `npm install -g @anthropic-ai/claude-code`

##################################
# Get Script Directory
##################################
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

##################################
# Load Modules
##################################
source "$SCRIPT_DIR/lib/utils.sh"
source "$SCRIPT_DIR/lib/os-detection.sh"
source "$SCRIPT_DIR/lib/auth.sh"
source "$SCRIPT_DIR/lib/config.sh"
source "$SCRIPT_DIR/lib/ide.sh"
source "$SCRIPT_DIR/lib/mcp.sh"
source "$SCRIPT_DIR/lib/validation.sh"

##################################
# Help Function
##################################
show_help() {
    cat << 'EOF'
Claude Code Configuration Script

USAGE:
    ./configure-claude-code.sh [OPTIONS]

DESCRIPTION:
    Automates Claude Code setup with configurable OS and IDE support.
    Based on Patrick Debois' original work with cross-platform enhancements.

OPTIONS:
    -h, --help              Show this help message
    --dry-run              Preview changes without applying them
    --force                Skip all prompts and apply changes (use with caution)
    --non-interactive      Run without prompts but still create backups
    
    --os <OS>              Target operating system
                          Values: macos, linux, auto (default: auto-detect)
    
    --ide <IDE>            Target IDE/editor for extension installation
                          Values: windsurf, vscode, cursor, none (default: windsurf)
    
    --shell-config <FILE>  Shell configuration file to reference
                          Values: auto, ~/.zshrc, ~/.bashrc, ~/.bash_profile
                          (default: auto-detect based on shell)

EXAMPLES:
    # Interactive setup with auto-detection
    ./configure-claude-code.sh
    
    # Preview changes for Linux + VSCode
    ./configure-claude-code.sh --dry-run --os linux --ide vscode
    
    # Force setup for macOS + Cursor with custom shell config
    ./configure-claude-code.sh --force --os macos --ide cursor --shell-config ~/.bashrc
    
    # Skip IDE extension installation
    ./configure-claude-code.sh --ide none
    
    # Linux setup with bash configuration
    ./configure-claude-code.sh --os linux --ide vscode --shell-config ~/.bashrc

SUPPORTED PLATFORMS:
    Operating Systems: macOS, Linux
    IDEs: Windsurf, VSCode, Cursor
    Shells: zsh, bash, fish (auto-detected)

ENVIRONMENT VARIABLES:
    ANTHROPIC_API_KEY      Optional: Your Anthropic API key (sk-ant-...)
                          If not set, Claude Code will use web-based authentication
                          (recommended for most users)
    
SECURITY:
    - Always use --dry-run first to preview changes
    - Review script contents before execution
    - Backups are automatically created in ~/.claude-backups/
    - Configuration files get restricted permissions (600/700)

MORE INFO:
    Repository: https://github.com/PaulDuvall/claude-code
    Based on: https://gist.github.com/jedi4ever/762ca6746ef22b064550ad7c04f3bd2f
EOF
}

##################################
# Parse Command Line Arguments
##################################
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
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
            --os)
                TARGET_OS="$2"
                shift 2
                ;;
            --ide)
                TARGET_IDE="$2"
                shift 2
                ;;
            --shell-config)
                SHELL_CONFIG="$2"
                shift 2
                ;;
            *)
                echo "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
}

##################################
# Pre-flight Checks
##################################
run_preflight_checks() {
    log "Claude Code Configuration Script for Cross-Platform Setup"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "Running in DRY-RUN mode - no changes will be made"
    fi
    
    # Initialize backup directory
    init_backup_dir
    
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
    
    # Validate Claude installation
    validate_claude_installation
}

##################################
# Main Execution Flow
##################################
main() {
    parse_arguments "$@"
    run_preflight_checks
    detect_environment
    setup_authentication
    configure_claude
    configure_api_helper
    setup_mcp_servers
    setup_ide_extension
    show_final_summary
}

# Execute main function if script is run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi