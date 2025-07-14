#!/usr/bin/env bash
set -euo pipefail

# Claude Code Hook: Prevent Credential Exposure
# 
# Purpose: Scan for exposed credentials before any file write/edit operations
# Trigger: PreToolUse for Edit, Write, MultiEdit tools
# Blocking: Yes - prevents credential exposure
#
# This hook implements enterprise-grade security by detecting and preventing
# accidental credential exposure in AI-generated or AI-modified code.

##################################
# Configuration
##################################
HOOK_NAME="prevent-credential-exposure"
LOG_FILE="$HOME/.claude/logs/security-hooks.log"
VIOLATION_LOG="$HOME/.claude/logs/credential-violations.log"
NOTIFICATION_WEBHOOK="${SECURITY_WEBHOOK_URL:-}"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

##################################
# Logging Functions
##################################
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$HOOK_NAME] $*" | tee -a "$LOG_FILE"
}

log_violation() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] VIOLATION: $*" | tee -a "$VIOLATION_LOG"
}

##################################
# Notification Functions
##################################
notify_security_team() {
    local violation_type="$1"
    local file_path="$2"
    local pattern="$3"
    
    if [[ -n "$NOTIFICATION_WEBHOOK" ]]; then
        curl -s -X POST "$NOTIFICATION_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{
                \"text\": \"🚨 SECURITY ALERT: Credential exposure prevented\",
                \"attachments\": [{
                    \"color\": \"danger\",
                    \"fields\": [
                        {\"title\": \"Violation Type\", \"value\": \"$violation_type\", \"short\": true},
                        {\"title\": \"File\", \"value\": \"$file_path\", \"short\": true},
                        {\"title\": \"Pattern\", \"value\": \"$pattern\", \"short\": false},
                        {\"title\": \"User\", \"value\": \"$USER\", \"short\": true},
                        {\"title\": \"Timestamp\", \"value\": \"$(date)\", \"short\": true}
                    ]
                }]
            }" 2>/dev/null || log "Failed to send security notification"
    fi
}

##################################
# Credential Detection Patterns
##################################
# High-confidence patterns for common credential types
declare -A CREDENTIAL_PATTERNS=(
    # API Keys
    ["anthropic_api_key"]='sk-ant-[a-zA-Z0-9]{95}'
    ["openai_api_key"]='sk-[a-zA-Z0-9]{32,}'
    ["github_token"]='gh[po]_[a-zA-Z0-9]{36}'
    ["aws_access_key"]='AKIA[0-9A-Z]{16}'
    ["azure_key"]='[a-zA-Z0-9/+]{86}=='
    
    # Database URLs with credentials
    ["database_url_with_password"]='(mysql|postgresql|mongodb)://[^:]+:[^@]+@'
    
    # Generic high-entropy patterns
    ["generic_api_key"]='["\']?[a-zA-Z0-9_-]*[aA][pP][iI][_-]?[kK][eE][yY]["\']?\s*[:=]\s*["\'][a-zA-Z0-9+/=]{20,}["\']'
    ["generic_secret"]='["\']?[a-zA-Z0-9_-]*[sS][eE][cC][rR][eE][tT]["\']?\s*[:=]\s*["\'][a-zA-Z0-9+/=]{20,}["\']'
    ["generic_password"]='["\']?[a-zA-Z0-9_-]*[pP][aA][sS][sS][wW][oO][rR][dD]["\']?\s*[:=]\s*["\'][^"\']{8,}["\']'
    
    # JWT Tokens
    ["jwt_token"]='eyJ[a-zA-Z0-9+/=]{20,}\.[a-zA-Z0-9+/=]{20,}\.[a-zA-Z0-9+/=_-]{20,}'
    
    # Private Keys
    ["private_key"]='-----BEGIN [A-Z ]*PRIVATE KEY-----'
    ["ssh_private_key"]='-----BEGIN OPENSSH PRIVATE KEY-----'
    
    # Cloud Provider Specific
    ["gcp_service_account_key"]='"type":\s*"service_account"'
    ["slack_webhook"]='hooks\.slack\.com/services/[A-Z0-9]{9}/[A-Z0-9]{11}/[a-zA-Z0-9]{24}'
)

##################################
# Content Analysis Functions
##################################
scan_file_content() {
    local file_path="$1"
    local content="$2"
    local violations=()
    
    # Skip if file doesn't exist or is binary
    if [[ ! -f "$file_path" ]] || file "$file_path" | grep -q "binary"; then
        return 0
    fi
    
    log "Scanning file: $file_path"
    
    # Check each credential pattern
    for pattern_name in "${!CREDENTIAL_PATTERNS[@]}"; do
        local pattern="${CREDENTIAL_PATTERNS[$pattern_name]}"
        
        if echo "$content" | grep -qiP "$pattern"; then
            log_violation "$pattern_name detected in $file_path"
            violations+=("$pattern_name")
            
            # Extract the matched content for logging (but redact it)
            local matched_line=$(echo "$content" | grep -iP "$pattern" | head -1)
            local redacted_line=$(echo "$matched_line" | sed 's/[a-zA-Z0-9+/=]\{10,\}/[REDACTED]/g')
            
            log_violation "Pattern: $pattern_name, Line: $redacted_line"
            
            # Notify security team
            notify_security_team "$pattern_name" "$file_path" "$redacted_line"
        fi
    done
    
    # Return violation count
    echo "${#violations[@]}"
}

check_environment_leakage() {
    local content="$1"
    local violations=0
    
    # Check for environment variable exposure patterns
    if echo "$content" | grep -qiP 'process\.env\.[A-Z_]*(?:KEY|SECRET|PASSWORD|TOKEN)'; then
        log_violation "Environment variable credential exposure detected"
        ((violations++))
    fi
    
    # Check for hardcoded production URLs with credentials
    if echo "$content" | grep -qiP 'https?://[^:]+:[^@]+@[^/]+'; then
        log_violation "URL with embedded credentials detected"
        ((violations++))
    fi
    
    echo "$violations"
}

##################################
# Main Hook Logic
##################################
main() {
    local tool_name="${CLAUDE_TOOL:-unknown}"
    local file_path="${CLAUDE_FILE:-}"
    local content=""
    
    log "Hook triggered for tool: $tool_name"
    
    # Only process file modification tools
    case "$tool_name" in
        "Edit"|"Write"|"MultiEdit")
            ;;
        *)
            log "Skipping non-file tool: $tool_name"
            exit 0
            ;;
    esac
    
    # Get file content to analyze
    if [[ -n "$file_path" ]] && [[ -f "$file_path" ]]; then
        content=$(cat "$file_path" 2>/dev/null || echo "")
    elif [[ -n "$CLAUDE_CONTENT" ]]; then
        content="$CLAUDE_CONTENT"
        file_path="${file_path:-stdin}"
    else
        log "No content to analyze"
        exit 0
    fi
    
    # Perform security scans
    local credential_violations
    local env_violations
    
    credential_violations=$(scan_file_content "$file_path" "$content")
    env_violations=$(check_environment_leakage "$content")
    
    local total_violations=$((credential_violations + env_violations))
    
    # Block if violations found
    if [[ $total_violations -gt 0 ]]; then
        echo "🚨 SECURITY VIOLATION: Credential exposure detected!"
        echo "File: $file_path"
        echo "Violations: $total_violations"
        echo ""
        echo "The operation has been BLOCKED to prevent credential exposure."
        echo "Please review the file and remove any exposed credentials before proceeding."
        echo ""
        echo "Common fixes:"
        echo "- Move credentials to environment variables"
        echo "- Use a secrets management system"
        echo "- Add files to .gitignore if they contain test data"
        echo "- Use placeholder values in examples"
        echo ""
        echo "For emergency override (NOT RECOMMENDED):"
        echo "export CLAUDE_SECURITY_OVERRIDE=true"
        
        log_violation "BLOCKED: $total_violations violations in $file_path"
        
        # Check for emergency override
        if [[ "${CLAUDE_SECURITY_OVERRIDE:-false}" == "true" ]]; then
            log "WARNING: Security override used - allowing dangerous operation"
            echo "⚠️  WARNING: Security override enabled - proceeding with credential exposure risk"
            exit 0
        fi
        
        exit 1
    fi
    
    log "Security scan passed for $file_path"
    exit 0
}

##################################
# Error Handling
##################################
trap 'log "Hook failed with error on line $LINENO"' ERR

##################################
# Execute Main Function
##################################
main "$@"