#!/usr/bin/env bash
set -euo pipefail

# verify-setup.sh - Comprehensive diagnostic tool for Claude Code custom commands setup
# This script validates that all components are properly installed and configured

SCRIPT_VERSION="1.0.0"
VERBOSE=false
QUIET=false
OUTPUT_FILE=""

##################################
# Utility Functions
##################################
log() {
    if [[ "$QUIET" != "true" ]]; then
        echo "[$(date +'%H:%M:%S')] $*"
    fi
}

verbose() {
    if [[ "$VERBOSE" == "true" ]]; then
        echo "[VERBOSE] $*"
    fi
}

success() {
    echo "✅ $*"
}

warning() {
    echo "⚠️  $*"
}

error() {
    echo "❌ $*"
}

info() {
    echo "ℹ️  $*"
}

section() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔍 $*"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

##################################
# Parse Arguments
##################################
show_help() {
    cat << EOF
Claude Code Setup Verification Tool v${SCRIPT_VERSION}

USAGE:
    $0 [OPTIONS]

DESCRIPTION:
    Comprehensive diagnostic tool that validates Claude Code custom commands setup.
    Checks installation, configuration, permissions, and functionality.

OPTIONS:
    --verbose         Show detailed diagnostic information
    --quiet           Suppress informational messages (errors still shown)
    --output FILE     Save diagnostic report to file
    --help            Show this help message

EXAMPLES:
    $0                      # Run standard diagnostics
    $0 --verbose            # Show detailed information
    $0 --output report.txt  # Save results to file
    $0 --quiet --output log # Silent mode with file output

CHECKS PERFORMED:
    1. Prerequisites (Claude Code, Node.js, API key)
    2. Custom commands deployment
    3. Settings.json configuration
    4. Security hooks installation (if applicable)
    5. File permissions and ownership
    6. Integration testing
    7. Performance and functionality tests

EOF
}

while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose)
            VERBOSE=true
            shift
            ;;
        --quiet)
            QUIET=true
            shift
            ;;
        --output)
            OUTPUT_FILE="$2"
            shift 2
            ;;
        --help)
            show_help
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
# Redirect output if file specified
##################################
if [[ -n "$OUTPUT_FILE" ]]; then
    exec > >(tee "$OUTPUT_FILE")
    exec 2>&1
fi

##################################
# Global variables for tracking results
##################################
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

check_result() {
    local status="$1"
    local message="$2"
    
    ((TOTAL_CHECKS++))
    
    case "$status" in
        "pass")
            success "$message"
            ((PASSED_CHECKS++))
            ;;
        "fail")
            error "$message"
            ((FAILED_CHECKS++))
            ;;
        "warn")
            warning "$message"
            ((WARNING_CHECKS++))
            ;;
        "info")
            info "$message"
            # Info messages don't count as pass/fail/warn
            ((TOTAL_CHECKS--))  # Don't count info messages in totals
            ;;
    esac
}

##################################
# Check Functions
##################################

check_prerequisites() {
    section "Prerequisites Validation"
    
    # Check Claude Code installation
    if command -v claude &> /dev/null; then
        claude_path=$(which claude 2>/dev/null || echo "unknown")
        # Try to get version, but don't fail if it prompts for setup
        if claude_version=$(timeout 3s claude --version </dev/null 2>/dev/null); then
            check_result "pass" "Claude Code installed (version: $claude_version)"
        else
            check_result "pass" "Claude Code installed (may need initial setup)"
        fi
        verbose "Claude Code path: $claude_path"
    else
        check_result "fail" "Claude Code not installed - run: npm install -g @anthropic-ai/claude-code"
        return
    fi
    
    # Check Node.js
    if command -v node &> /dev/null; then
        node_version=$(node --version)
        check_result "pass" "Node.js installed ($node_version)"
        verbose "Node.js path: $(which node)"
    else
        check_result "fail" "Node.js not installed - install from: https://nodejs.org/"
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        npm_version=$(npm --version)
        check_result "pass" "npm installed ($npm_version)"
    else
        check_result "warn" "npm not found (usually comes with Node.js)"
    fi
    
    # Check API key (modern Claude Code uses web authentication by default)
    if [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
        if [[ "$ANTHROPIC_API_KEY" =~ ^sk-ant- ]]; then
            api_key_preview="${ANTHROPIC_API_KEY:0:10}...${ANTHROPIC_API_KEY: -4}"
            check_result "pass" "ANTHROPIC_API_KEY set ($api_key_preview) - using API key authentication"
            verbose "API key length: ${#ANTHROPIC_API_KEY} characters"
        else
            check_result "warn" "ANTHROPIC_API_KEY set but doesn't match expected format (sk-ant-...)"
        fi
    else
        check_result "pass" "Using web-based authentication (recommended) - no API key needed"
        verbose "Modern Claude Code defaults to browser-based authentication"
    fi
    
    # Check jq (used by setup scripts)
    if command -v jq &> /dev/null; then
        jq_version=$(jq --version)
        check_result "pass" "jq installed ($jq_version)"
    else
        check_result "warn" "jq not installed - may be needed for JSON processing"
    fi
}

check_claude_configuration() {
    section "Claude Code Configuration"
    
    # Check ~/.claude.json
    if [[ -f ~/.claude.json ]]; then
        if jq . ~/.claude.json > /dev/null 2>&1; then
            check_result "pass" "~/.claude.json exists and is valid JSON"
            verbose "Config file size: $(du -h ~/.claude.json | cut -f1)"
            
            # Check specific configurations
            if jq -e '.hasCompletedOnboarding' ~/.claude.json > /dev/null 2>&1; then
                check_result "pass" "Onboarding completed"
            else
                check_result "warn" "Onboarding not completed"
            fi
            
            if jq -e '.customApiKeyResponses.approved[]' ~/.claude.json > /dev/null 2>&1; then
                check_result "pass" "API key approved in configuration (API key mode)"
            else
                if [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
                    check_result "warn" "API key not approved in configuration (may need approval)"
                else
                    check_result "pass" "No API key approval needed (web authentication mode)"
                fi
            fi
            
        else
            check_result "fail" "~/.claude.json exists but contains invalid JSON"
        fi
    else
        check_result "warn" "~/.claude.json not found - run configure-claude-code.sh"
    fi
    
    # Check ~/.claude directory
    if [[ -d ~/.claude ]]; then
        check_result "pass" "~/.claude directory exists"
        
        # Check permissions
        claude_perms=$(stat -f "%Mp%Lp" ~/.claude 2>/dev/null || stat -c "%a" ~/.claude 2>/dev/null || echo "unknown")
        if [[ "$claude_perms" == "700" ]] || [[ "$claude_perms" == "drwx------" ]]; then
            check_result "pass" "~/.claude directory has secure permissions ($claude_perms)"
        else
            check_result "warn" "~/.claude directory permissions may be too open ($claude_perms)"
        fi
        
        verbose "Directory contents: $(ls -la ~/.claude/ 2>/dev/null | wc -l) items"
    else
        check_result "fail" "~/.claude directory not found"
    fi
    
    # Check API key helper (only needed for API key authentication)
    if [[ -f ~/.claude/anthropic_key_helper.sh ]]; then
        if [[ -x ~/.claude/anthropic_key_helper.sh ]]; then
            check_result "pass" "API key helper script exists and is executable"
            verbose "Helper script size: $(du -h ~/.claude/anthropic_key_helper.sh | cut -f1)"
        else
            check_result "warn" "API key helper script exists but is not executable"
        fi
    else
        if [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
            check_result "warn" "API key helper script not found (needed for API key mode)"
        else
            check_result "pass" "API key helper not needed (using web authentication)"
        fi
    fi
}

check_settings_json() {
    section "Settings.json Configuration"
    
    if [[ -f ~/.claude/settings.json ]]; then
        if jq . ~/.claude/settings.json > /dev/null 2>&1; then
            check_result "pass" "~/.claude/settings.json exists and is valid JSON"
            
            # Check allowed tools
            if jq -e '.allowedTools[]' ~/.claude/settings.json > /dev/null 2>&1; then
                allowed_tools=$(jq -r '.allowedTools[]' ~/.claude/settings.json | tr '\n' ', ' | sed 's/,$//')
                check_result "pass" "Allowed tools configured: $allowed_tools"
                
                # Check for required tools
                required_tools=("Edit" "Bash" "Read" "Write")
                for tool in "${required_tools[@]}"; do
                    if jq -e --arg tool "$tool" '.allowedTools[] | select(. == $tool)' ~/.claude/settings.json > /dev/null 2>&1; then
                        verbose "Required tool '$tool' is allowed"
                    else
                        check_result "warn" "Required tool '$tool' not in allowedTools"
                    fi
                done
            else
                check_result "warn" "No allowedTools configured in settings.json"
            fi
            
            # Check hooks configuration
            if jq -e '.hooks' ~/.claude/settings.json > /dev/null 2>&1; then
                hooks_count=$(jq '.hooks | to_entries | length' ~/.claude/settings.json)
                check_result "pass" "Hooks configured ($hooks_count hook types)"
                verbose "Hook configuration present"
            else
                check_result "info" "No hooks configured (basic setup)"
            fi
            
            # Check permissions configuration
            if jq -e '.permissions' ~/.claude/settings.json > /dev/null 2>&1; then
                check_result "pass" "Permissions configured"
                verbose "Permission rules present"
            else
                check_result "info" "No permission rules configured"
            fi
            
        else
            check_result "fail" "~/.claude/settings.json exists but contains invalid JSON"
        fi
    else
        check_result "fail" "~/.claude/settings.json not found"
    fi
    
    # Check for project-specific settings
    if [[ -f .claude/settings.json ]]; then
        check_result "info" "Project-specific settings.json found"
    fi
    
    if [[ -f .claude/settings.local.json ]]; then
        check_result "info" "Local project settings.json found"
    fi
}

check_custom_commands() {
    section "Custom Commands Deployment"
    
    if [[ -d ~/.claude/commands ]]; then
        check_result "pass" "~/.claude/commands directory exists"
        
        # Count custom commands
        x_commands=$(ls ~/.claude/commands/x*.md 2>/dev/null | wc -l)
        if [[ $x_commands -gt 0 ]]; then
            check_result "pass" "Custom commands deployed ($x_commands x-prefixed commands)"
            verbose "Commands found: $(ls ~/.claude/commands/x*.md 2>/dev/null | xargs -n1 basename | tr '\n' ', ' | sed 's/,$//')"
            
            # Check for key commands
            key_commands=("xtest.md" "xquality.md" "xsecurity.md" "xgit.md")
            for cmd in "${key_commands[@]}"; do
                if [[ -f ~/.claude/commands/$cmd ]]; then
                    verbose "Key command '$cmd' deployed"
                else
                    check_result "warn" "Key command '$cmd' not found"
                fi
            done
        else
            check_result "fail" "No x-prefixed custom commands found in ~/.claude/commands"
        fi
        
        # Check permissions
        for cmd_file in ~/.claude/commands/x*.md; do
            if [[ -f "$cmd_file" ]]; then
                if [[ -r "$cmd_file" ]]; then
                    verbose "Command file readable: $(basename "$cmd_file")"
                else
                    check_result "warn" "Command file not readable: $(basename "$cmd_file")"
                fi
            fi
        done
        
    else
        check_result "fail" "~/.claude/commands directory not found"
    fi
}

check_security_hooks() {
    section "Security Hooks"
    
    if [[ -d ~/.claude/hooks ]]; then
        check_result "pass" "~/.claude/hooks directory exists"
        
        # Count hooks
        hook_count=$(ls ~/.claude/hooks/*.sh 2>/dev/null | wc -l)
        if [[ $hook_count -gt 0 ]]; then
            check_result "pass" "Security hooks installed ($hook_count hooks)"
            
            # Check specific hooks
            if [[ -f ~/.claude/hooks/prevent-credential-exposure.sh ]]; then
                if [[ -x ~/.claude/hooks/prevent-credential-exposure.sh ]]; then
                    check_result "pass" "Credential exposure prevention hook installed and executable"
                else
                    check_result "warn" "Credential exposure prevention hook exists but not executable"
                fi
            else
                check_result "info" "Credential exposure prevention hook not installed (basic setup)"
            fi
            
            # Check hook permissions
            for hook in ~/.claude/hooks/*.sh; do
                if [[ -f "$hook" ]]; then
                    if [[ -x "$hook" ]]; then
                        verbose "Hook executable: $(basename "$hook")"
                    else
                        check_result "warn" "Hook not executable: $(basename "$hook")"
                    fi
                fi
            done
            
        else
            check_result "info" "No security hooks installed (basic setup)"
        fi
    else
        check_result "info" "~/.claude/hooks directory not found (basic setup)"
    fi
}

check_integration() {
    section "Integration Testing"
    
    # Test Claude Code basic functionality (non-interactive)
    if timeout 3s claude --version </dev/null > /dev/null 2>&1; then
        check_result "pass" "Claude Code responds to --version"
    else
        check_result "warn" "Claude Code may need authentication setup"
        verbose "Try running 'claude' interactively to complete setup"
    fi
    
    # Test settings loading (attempt to read config)
    verbose "Attempting to validate Claude Code can load configuration..."
    
    # Check if commands directory is accessible
    if [[ -d ~/.claude/commands ]] && [[ -r ~/.claude/commands ]]; then
        check_result "pass" "Commands directory is accessible"
    else
        check_result "warn" "Commands directory access issue"
    fi
    
    # Test JSON processing capability
    if command -v jq &> /dev/null; then
        if [[ -f ~/.claude/settings.json ]]; then
            if jq empty ~/.claude/settings.json 2>/dev/null; then
                check_result "pass" "Settings.json can be processed"
            else
                check_result "fail" "Settings.json processing failed"
            fi
        fi
    fi
}

check_logs_and_diagnostics() {
    section "Logs and Diagnostics"
    
    # Check logs directory
    if [[ -d ~/.claude/logs ]]; then
        check_result "pass" "Logs directory exists"
        
        log_count=$(find ~/.claude/logs -name "*.log" 2>/dev/null | wc -l)
        if [[ $log_count -gt 0 ]]; then
            check_result "pass" "Log files present ($log_count files)"
            verbose "Recent log activity detected"
        else
            check_result "info" "No log files found (normal for new installation)"
        fi
    else
        check_result "info" "Logs directory not found (will be created on first use)"
    fi
    
    # Check for common error indicators
    if [[ -f ~/.claude/logs/error.log ]]; then
        error_lines=$(wc -l < ~/.claude/logs/error.log 2>/dev/null || echo 0)
        if [[ $error_lines -gt 0 ]]; then
            check_result "warn" "Error log contains $error_lines lines - review for issues"
        else
            check_result "pass" "Error log is empty"
        fi
    fi
}

##################################
# Main Execution
##################################
main() {
    log "Starting Claude Code Setup Verification v${SCRIPT_VERSION}"
    log "Timestamp: $(date)"
    log "System: $(uname -s) $(uname -r)"
    
    if [[ -n "$OUTPUT_FILE" ]]; then
        log "Output will be saved to: $OUTPUT_FILE"
    fi
    
    # Run all check functions
    check_prerequisites
    check_claude_configuration
    check_settings_json
    check_custom_commands
    check_security_hooks
    check_integration
    check_logs_and_diagnostics
    
    # Final Summary
    section "Verification Summary"
    
    echo "📊 RESULTS:"
    echo "   ✅ Passed: $PASSED_CHECKS"
    echo "   ❌ Failed: $FAILED_CHECKS"
    echo "   ⚠️  Warnings: $WARNING_CHECKS"
    echo "   📝 Total Checks: $TOTAL_CHECKS"
    
    echo ""
    
    if [[ $FAILED_CHECKS -eq 0 ]]; then
        if [[ $WARNING_CHECKS -eq 0 ]]; then
            success "🎉 Perfect! All checks passed. Your Claude Code setup is complete and working."
        else
            warning "Setup is functional but has $WARNING_CHECKS warnings. Review above for improvements."
        fi
        
        echo ""
        echo "🚀 Ready to use:"
        echo "   • Start Claude Code: claude"
        echo "   • Try a custom command: /xtest"
        echo "   • List available commands: /help"
        
    else
        error "Setup has $FAILED_CHECKS critical issues that need attention."
        echo ""
        echo "🔧 Next steps:"
        echo "   1. Review failed checks above"
        echo "   2. Run setup script: ./setup.sh"
        echo "   3. Check troubleshooting guide in README.md"
        echo "   4. Run verification again: ./verify-setup.sh"
    fi
    
    echo ""
    echo "📚 Resources:"
    echo "   • Setup script: ./setup.sh --help"
    echo "   • Manual configuration: ./configure-claude-code.sh --help"
    echo "   • Deploy commands: ./deploy.sh"
    echo "   • Troubleshooting: README.md"
    
    if [[ -n "$OUTPUT_FILE" ]]; then
        echo ""
        echo "📄 Report saved to: $OUTPUT_FILE"
    fi
}

##################################
# Execute
##################################
main "$@"