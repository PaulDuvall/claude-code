#!/usr/bin/env bash
# Authentication setup for Claude Code configuration

##################################
# Global Variables
##################################
USE_API_KEY=false

##################################
# Authentication Detection
##################################
detect_authentication_method() {
    if [ -z "${ANTHROPIC_API_KEY:-}" ]; then
        echo "No ANTHROPIC_API_KEY found - Claude Code will use web-based authentication"
        echo "This is the recommended method for most users (opens browser for login)"
        echo ""
        echo "API keys are only needed for:"
        echo "- CI/CD pipelines and automated environments"
        echo "- Corporate setups with specific API key management"
        echo "- Environments where browser authentication isn't possible"
        echo ""
        if ! confirm "Continue with web-based authentication?"; then
            echo "To use API key authentication instead:"
            echo "export ANTHROPIC_API_KEY='sk-ant-...'"
            echo "Then re-run this script"
            exit 1
        fi
        USE_API_KEY=false
        log "Using web-based authentication (no API key helper needed)"
    else
        # Validate API key format (basic check)
        if [[ ! "$ANTHROPIC_API_KEY" =~ ^sk-ant- ]]; then
            echo "Warning: API key doesn't match expected format (should start with 'sk-ant-')"
            if ! confirm "Continue anyway?"; then
                exit 1
            fi
        fi
        USE_API_KEY=true
        log "Using API key authentication"
    fi
}

##################################
# API Helper Script Setup
##################################
setup_api_helper() {
    if [[ "$USE_API_KEY" != "true" ]]; then
        log "Skipping API helper setup (using web-based authentication)"
        return
    fi

    local api_helper_content='#!/usr/bin/env bash
echo ${ANTHROPIC_API_KEY}'
    
    local api_helper_path="$HOME/.claude/anthropic_key_helper.sh"

    if [[ "$INTERACTIVE" == "true" ]] && [[ -f "$api_helper_path" ]]; then
        show_diff "$api_helper_path" "$api_helper_content"
        if ! confirm "Update API helper script?"; then
            log "Skipping API helper update"
        else
            apply_change "echo '$api_helper_content' > $api_helper_path && chmod +x $api_helper_path" \
                         "Creating API helper script"
        fi
    else
        apply_change "echo '$api_helper_content' > $api_helper_path && chmod +x $api_helper_path" \
                     "Creating API helper script"
    fi
}

##################################
# API Helper Configuration
##################################
configure_api_helper() {
    if [[ "$USE_API_KEY" != "true" ]]; then
        log "Skipping API helper configuration (using web-based authentication)"
        return
    fi

    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY-RUN] Would configure API helper in settings"
    else
        claude config set --global apiKeyHelper ~/.claude/anthropic_key_helper.sh
    fi
}

##################################
# Main Authentication Setup
##################################
setup_authentication() {
    detect_authentication_method
    setup_api_helper
}