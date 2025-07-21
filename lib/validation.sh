#!/usr/bin/env bash
# Validation and final checks for Claude Code configuration

##################################
# Validate Claude Installation
##################################
validate_claude_installation() {
    if ! command -v claude &> /dev/null; then
        echo "Claude Code is not installed. Please install it first:"
        echo "npm install -g @anthropic-ai/claude-code"
        exit 1
    fi
    log "✓ Claude Code is installed"
}

##################################
# Final System Validation
##################################
run_final_validation() {
    if [[ "$DRY_RUN" == "true" ]]; then
        return
    fi
    
    echo "Validating installation..."
    
    # Check Claude Code installation
    if claude --version > /dev/null 2>&1; then
        echo "✓ Claude Code is properly installed"
    else
        echo "✗ Claude Code installation check failed"
    fi

    # Check configuration files
    if [[ "$USE_API_KEY" == "true" ]]; then
        if [ -f ~/.claude.json ] && [ -f ~/.claude/anthropic_key_helper.sh ]; then
            echo "✓ Configuration files created successfully (API key mode)"
        else
            echo "✗ Configuration files missing"
        fi
    else
        if [ -f ~/.claude.json ]; then
            echo "✓ Configuration files created successfully (web authentication mode)"
        else
            echo "✗ Configuration files missing"
        fi
    fi
}

##################################
# Show Environment Variables
##################################
show_environment_variables() {
    echo ""
    echo "Environment variables to add to your $SHELL_CONFIG:"
    echo ""
    
    if [[ "$USE_API_KEY" == "true" ]]; then
        echo "# Claude Code Environment Variables (API Key Mode)"
        echo "export ANTHROPIC_API_KEY='your-api-key-here'"
        echo ""
    else
        echo "# Claude Code Environment Variables (Web Authentication Mode)"
        echo "# No API key needed - Claude Code will use browser authentication"
        echo ""
    fi
    
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
    echo "Don't forget to restart your terminal or run: source $SHELL_CONFIG"
    echo ""
}

##################################
# Show Backup Information
##################################
show_backup_info() {
    if [[ -d "$BACKUP_DIR" ]] && [[ "$DRY_RUN" != "true" ]]; then
        echo "Configuration backed up to: $BACKUP_DIR"
        echo ""
        echo "To restore previous configuration:"
        echo "  cp $BACKUP_DIR/.claude.json ~/"
        echo "  cp -r $BACKUP_DIR/.claude ~/"
        echo ""
    fi
}

##################################
# Show Security Reminder
##################################
show_security_reminder() {
    echo "🔐 Security Reminder:"
    if [[ "$USE_API_KEY" == "true" ]]; then
        echo "- Your API key is stored in ~/.claude/anthropic_key_helper.sh"
    else
        echo "- Using web-based authentication (no API key stored locally)"
    fi
    echo "- Configuration files have restricted permissions (600/700)"
    echo "- Review backup files in $BACKUP_DIR if needed"
    echo "- Consider adding CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=true to your shell profile"
}

##################################
# Show Final Summary
##################################
show_final_summary() {
    echo ""
    echo "=== Setup Complete ==="
    echo ""
    
    show_backup_info
    show_environment_variables
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "=== DRY-RUN COMPLETE ==="
        echo "No changes were made. Run without --dry-run to apply changes."
    else
        run_final_validation
    fi

    echo ""
    if [[ "$TARGET_IDE" != "none" ]]; then
        echo "Setup complete! You may need to restart $TARGET_IDE for the extension to take effect."
    else
        echo "Setup complete!"
    fi
    echo ""
    
    show_security_reminder
}