#!/usr/bin/env bash
set -euo pipefail

# ⚠️  COMPLETE CLAUDE CODE SETUP ⚠️ 
# This script provides a complete setup workflow for Claude Code custom commands
# It orchestrates configure-claude-code.sh, deploy.sh, and hook installation
# Always use --dry-run first to preview changes

# Version and metadata
SETUP_VERSION="1.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Configuration
DRY_RUN=false
INTERACTIVE=true
FORCE=false
SKIP_CONFIGURE=false
SKIP_DEPLOY=false
SKIP_HOOKS=false
SETUP_TYPE="basic"  # basic, security, comprehensive

##################################
# Parse command line arguments
##################################
show_help() {
    cat << EOF
Claude Code Complete Setup Script v${SETUP_VERSION}

USAGE:
    $0 [OPTIONS]

DESCRIPTION:
    Orchestrates complete Claude Code setup including configuration, 
    custom commands deployment, and security hooks installation.

OPTIONS:
    --setup-type TYPE     Setup type: basic, security, comprehensive (default: basic)
    --dry-run            Show what would be done without making changes
    --force              Skip all prompts and apply all changes
    --non-interactive    Run without prompts but still create backups
    --skip-configure     Skip Claude Code configuration step
    --skip-deploy        Skip custom commands deployment step  
    --skip-hooks         Skip security hooks installation step
    --help               Show this help message

SETUP TYPES:
    basic        Basic custom commands setup (default)
    security     Includes security hooks and restrictive permissions
    comprehensive Full setup with governance, monitoring, and advanced features

EXAMPLES:
    $0                           # Interactive basic setup
    $0 --dry-run                 # Preview all changes without applying
    $0 --setup-type security     # Security-focused setup
    $0 --setup-type comprehensive # Full comprehensive setup
    $0 --skip-configure          # Only deploy commands and hooks
    $0 --force                   # Apply all changes without prompts

PREREQUISITES:
    - Claude Code installed: npm install -g @anthropic-ai/claude-code
    - ANTHROPIC_API_KEY environment variable set
    - macOS (script optimized for macOS, may work on other systems)

WORKFLOW:
    1. Validate prerequisites and environment
    2. Run configure-claude-code.sh (sets up Claude Code)
    3. Run deploy.sh (installs custom commands)
    4. Install security hooks (if requested)
    5. Apply appropriate settings.json template
    6. Validate complete setup

EOF
}

##################################
# Utility Functions
##################################
log() {
    echo "[$(date +'%H:%M:%S')] $*"
}

error() {
    echo "[ERROR] $*" >&2
}

success() {
    echo "[SUCCESS] $*"
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

check_prerequisite() {
    local cmd="$1"
    local install_msg="$2"
    
    if ! command -v "$cmd" &> /dev/null; then
        error "$cmd is not installed or not in PATH"
        echo "$install_msg"
        return 1
    fi
    return 0
}

##################################
# Parse Arguments
##################################
while [[ $# -gt 0 ]]; do
    case $1 in
        --setup-type)
            SETUP_TYPE="$2"
            if [[ ! "$SETUP_TYPE" =~ ^(basic|security|comprehensive)$ ]]; then
                error "Invalid setup type: $SETUP_TYPE. Must be: basic, security, comprehensive"
                exit 1
            fi
            shift 2
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
        --skip-configure)
            SKIP_CONFIGURE=true
            shift
            ;;
        --skip-deploy)
            SKIP_DEPLOY=true
            shift
            ;;
        --skip-hooks)
            SKIP_HOOKS=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

##################################
# Main Setup Logic
##################################
main() {
    log "Claude Code Complete Setup v${SETUP_VERSION}"
    log "Setup type: $SETUP_TYPE"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "Running in DRY-RUN mode - no changes will be made"
    fi
    
    # Step 1: Validate Prerequisites
    log "Step 1: Validating prerequisites..."
    
    if ! check_prerequisite "claude" "Install with: npm install -g @anthropic-ai/claude-code"; then
        exit 1
    fi
    
    if ! check_prerequisite "node" "Install Node.js from: https://nodejs.org/"; then
        exit 1
    fi
    
    if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
        error "ANTHROPIC_API_KEY environment variable is not set"
        echo "Set it with: export ANTHROPIC_API_KEY='sk-ant-...'"
        exit 1
    fi
    
    success "Prerequisites validated"
    
    # Step 2: Configure Claude Code
    if [[ "$SKIP_CONFIGURE" != "true" ]]; then
        log "Step 2: Configuring Claude Code..."
        
        if [[ ! -f "$SCRIPT_DIR/configure-claude-code.sh" ]]; then
            error "configure-claude-code.sh not found in $SCRIPT_DIR"
            exit 1
        fi
        
        configure_args=""
        if [[ "$DRY_RUN" == "true" ]]; then
            configure_args="--dry-run"
        elif [[ "$FORCE" == "true" ]]; then
            configure_args="--force"
        elif [[ "$INTERACTIVE" == "false" ]]; then
            configure_args="--non-interactive"
        fi
        
        if [[ "$DRY_RUN" == "true" ]]; then
            log "[DRY-RUN] Would run: ./configure-claude-code.sh $configure_args"
        else
            log "Running Claude Code configuration..."
            if ! "$SCRIPT_DIR/configure-claude-code.sh" $configure_args; then
                error "Claude Code configuration failed"
                exit 1
            fi
        fi
        
        success "Claude Code configured"
    else
        log "Step 2: Skipping Claude Code configuration"
    fi
    
    # Step 3: Deploy Custom Commands
    if [[ "$SKIP_DEPLOY" != "true" ]]; then
        log "Step 3: Deploying custom commands..."
        
        if [[ ! -f "$SCRIPT_DIR/deploy.sh" ]]; then
            error "deploy.sh not found in $SCRIPT_DIR"
            exit 1
        fi
        
        if [[ "$DRY_RUN" == "true" ]]; then
            log "[DRY-RUN] Would run: ./deploy.sh"
            log "[DRY-RUN] Would deploy custom commands from slash-commands/active/"
        else
            log "Deploying custom commands..."
            if ! "$SCRIPT_DIR/deploy.sh"; then
                error "Custom commands deployment failed"
                exit 1
            fi
        fi
        
        success "Custom commands deployed"
    else
        log "Step 3: Skipping custom commands deployment"
    fi
    
    # Step 4: Install Security Hooks (if requested)
    if [[ "$SKIP_HOOKS" != "true" ]] && [[ "$SETUP_TYPE" != "basic" ]]; then
        log "Step 4: Installing security hooks..."
        
        if [[ "$DRY_RUN" == "true" ]]; then
            log "[DRY-RUN] Would create ~/.claude/hooks/ directory"
            log "[DRY-RUN] Would copy security hooks from hooks/ directory"
            log "[DRY-RUN] Would set executable permissions on hooks"
        else
            log "Installing security hooks..."
            mkdir -p ~/.claude/hooks/
            
            if [[ -f "$SCRIPT_DIR/hooks/prevent-credential-exposure.sh" ]]; then
                cp "$SCRIPT_DIR/hooks/prevent-credential-exposure.sh" ~/.claude/hooks/
                chmod +x ~/.claude/hooks/prevent-credential-exposure.sh
                log "Installed: prevent-credential-exposure.sh"
            fi
            
            # Copy any other hooks in the hooks directory
            for hook in "$SCRIPT_DIR/hooks"/*.sh; do
                if [[ -f "$hook" ]] && [[ "$hook" != *"prevent-credential-exposure.sh" ]]; then
                    hook_name=$(basename "$hook")
                    cp "$hook" ~/.claude/hooks/
                    chmod +x ~/.claude/hooks/"$hook_name"
                    log "Installed: $hook_name"
                fi
            done
        fi
        
        success "Security hooks installed"
    else
        if [[ "$SETUP_TYPE" == "basic" ]]; then
            log "Step 4: Skipping security hooks (basic setup)"
        else
            log "Step 4: Skipping security hooks installation"
        fi
    fi
    
    # Step 5: Apply Settings Template
    log "Step 5: Applying settings template..."
    
    template_file=""
    case "$SETUP_TYPE" in
        basic)
            template_file="$SCRIPT_DIR/templates/basic-settings.json"
            ;;
        security)
            template_file="$SCRIPT_DIR/templates/security-focused-settings.json"
            ;;
        comprehensive)
            template_file="$SCRIPT_DIR/templates/comprehensive-settings.json"
            ;;
    esac
    
    if [[ ! -f "$template_file" ]]; then
        error "Template file not found: $template_file"
        exit 1
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY-RUN] Would apply settings template: $template_file"
        log "[DRY-RUN] Would backup existing ~/.claude/settings.json if it exists"
    else
        # Backup existing settings if they exist
        if [[ -f ~/.claude/settings.json ]]; then
            backup_file=~/.claude/settings.json.backup.$(date +%Y%m%d_%H%M%S)
            cp ~/.claude/settings.json "$backup_file"
            log "Backed up existing settings to: $backup_file"
        fi
        
        # Apply template (remove JSON comments first)
        log "Applying $SETUP_TYPE settings template..."
        grep -v '^\s*//' "$template_file" | jq '.' > ~/.claude/settings.json
        chmod 600 ~/.claude/settings.json
    fi
    
    success "Settings template applied"
    
    # Step 6: Validate Setup
    log "Step 6: Validating setup..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY-RUN] Would run validation checks"
    else
        validation_passed=true
        
        # Check Claude Code
        if ! claude --version > /dev/null 2>&1; then
            error "Claude Code validation failed"
            validation_passed=false
        else
            log "✓ Claude Code working"
        fi
        
        # Check custom commands deployed
        if [[ -d ~/.claude/commands ]] && [[ $(ls ~/.claude/commands/x*.md 2>/dev/null | wc -l) -gt 0 ]]; then
            log "✓ Custom commands deployed ($(ls ~/.claude/commands/x*.md | wc -l) commands)"
        else
            error "Custom commands not found in ~/.claude/commands"
            validation_passed=false
        fi
        
        # Check settings.json
        if [[ -f ~/.claude/settings.json ]] && jq . ~/.claude/settings.json > /dev/null 2>&1; then
            log "✓ Settings.json valid"
        else
            error "Settings.json missing or invalid"
            validation_passed=false
        fi
        
        # Check hooks (if applicable)
        if [[ "$SETUP_TYPE" != "basic" ]] && [[ "$SKIP_HOOKS" != "true" ]]; then
            if [[ -f ~/.claude/hooks/prevent-credential-exposure.sh ]] && [[ -x ~/.claude/hooks/prevent-credential-exposure.sh ]]; then
                log "✓ Security hooks installed"
            else
                error "Security hooks not properly installed"
                validation_passed=false
            fi
        fi
        
        if [[ "$validation_passed" == "true" ]]; then
            success "All validation checks passed"
        else
            error "Some validation checks failed"
            exit 1
        fi
    fi
    
    # Final Summary
    echo ""
    echo "============================"
    echo "🎉 SETUP COMPLETE!"
    echo "============================"
    echo ""
    echo "Setup type: $SETUP_TYPE"
    echo "Commands deployed: $(ls ~/.claude/commands/x*.md 2>/dev/null | wc -l) custom commands"
    if [[ "$SETUP_TYPE" != "basic" ]] && [[ "$SKIP_HOOKS" != "true" ]]; then
        echo "Security hooks: Enabled"
    fi
    echo ""
    echo "Next steps:"
    echo "1. Restart your terminal: source ~/.zshrc"
    echo "2. Test the setup: claude"
    echo "3. Try a custom command: /xtest"
    echo "4. Check available commands: /help"
    echo ""
    echo "📚 Documentation:"
    echo "- Custom commands: README.md"
    echo "- Security hooks: hooks/README.md" 
    echo "- Settings templates: templates/README.md"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "- Run diagnostics: ./verify-setup.sh"
    echo "- Validate configuration: ./validate-commands.sh"
    echo ""
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "=== DRY-RUN COMPLETE ==="
        echo "No changes were made. Run without --dry-run to apply changes."
    fi
}

##################################
# Execute Main Function
##################################
main "$@"