#!/usr/bin/env bash
# Claude Code configuration management

##################################
# Generate Claude Configuration
##################################
generate_claude_config() {
    local claude_config_content
    
    if [[ "$USE_API_KEY" == "true" ]]; then
        local anthropic_api_key_last_20_chars=${ANTHROPIC_API_KEY: -20}
        # Configuration with API key approval
        claude_config_content='{
        "customApiKeyResponses": {
            "approved": [ "'$anthropic_api_key_last_20_chars'"],
            "rejected": [  ]
        },
        "shiftEnterKeyBindingInstalled": true,
        "theme": "dark" ,
        "hasCompletedOnboarding": true
    }'
    else
        # Web authentication config (no API key approval needed)
        claude_config_content='{
        "shiftEnterKeyBindingInstalled": true,
        "theme": "dark" ,
        "hasCompletedOnboarding": true
    }'
    fi
    
    echo "$claude_config_content"
}

##################################
# Apply Claude Configuration
##################################
apply_claude_config() {
    local claude_config_content
    claude_config_content=$(generate_claude_config)

    if [[ "$INTERACTIVE" == "true" ]] && [[ -f "$HOME/.claude.json" ]]; then
        show_diff "$HOME/.claude.json" "$claude_config_content"
        if ! confirm "Update Claude configuration?"; then
            log "Skipping Claude configuration update"
        else
            apply_change "echo '$claude_config_content' > ~/.claude.json && chmod 600 ~/.claude.json" \
                         "Creating Claude configuration"
        fi
    else
        apply_change "echo '$claude_config_content' > ~/.claude.json && chmod 600 ~/.claude.json" \
                     "Creating Claude configuration"
    fi
}

##################################
# Configure Trust Settings
##################################
configure_trust_settings() {
    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY-RUN] Would configure trust settings"
    else
        claude config set hasTrustDialogAccepted true
        claude config set hasCompletedProjectOnboarding true
    fi
}

##################################
# Configure Permissions
##################################
configure_permissions() {
    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY-RUN] Would configure allowed tools"
    else
        claude config add allowedTools "Edit,Bash"
    fi
}

##################################
# Configure Advanced Settings
##################################
configure_advanced_settings() {
    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY-RUN] Would configure parallel tasks count"
    else
        claude config set --global parallelTasksCount 3
    fi
}

##################################
# Set Secure Permissions
##################################
set_secure_permissions() {
    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY-RUN] Would set secure permissions on ~/.claude directory"
    else
        chmod 700 ~/.claude
    fi
}

##################################
# Create Claude Directory
##################################
create_claude_directory() {
    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY-RUN] Would create ~/.claude directory"
    else
        mkdir -p ~/.claude
    fi
}

##################################
# Main Configuration Setup
##################################
configure_claude() {
    create_claude_directory
    apply_claude_config
    configure_trust_settings
    configure_permissions
    configure_advanced_settings
    set_secure_permissions
}