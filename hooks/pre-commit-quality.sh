#!/usr/bin/env bash
set -euo pipefail

# Claude Code Hook: Pre-Commit Quality Check
# 
# Purpose: Lightweight trigger for code quality validation before git commits
# Trigger: Custom hook for pre-commit operations
# Approach: Quick validation with style-enforcer subagent delegation
#
# This hook ensures code quality by leveraging AI analysis rather than 
# running multiple linting tools manually.

##################################
# Load Shared Libraries  
##################################
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB_DIR="$SCRIPT_DIR/lib"

# Load essential modules for lightweight operation
source "$LIB_DIR/config-constants.sh"
source "$LIB_DIR/context-manager.sh"
source "$LIB_DIR/error-handler.sh"
source "$LIB_DIR/file-utils.sh"

##################################
# Git Context Analysis
##################################
analyze_staged_changes() {
    log_info "Analyzing staged changes for quality check"
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir >/dev/null 2>&1; then
        log_debug "Not in a git repository, skipping pre-commit quality check"
        return 0
    fi
    
    # Get staged files
    local staged_files
    staged_files=$(git diff --cached --name-only 2>/dev/null || echo "")
    
    if [[ -z "$staged_files" ]]; then
        log_info "No staged changes found, skipping quality check"
        return 0  
    fi
    
    echo "$staged_files"
}

##################################
# Quality Context Gathering
##################################
gather_quality_context() {
    local staged_files="$1"
    
    # Create context for quality analysis
    local context_data
    context_data=$(cat <<EOF
{
  "trigger": "pre_commit_quality",
  "staged_files": [$(echo "$staged_files" | sed 's/.*/"&"/' | paste -sd ',' -)],
  "git_info": {
    "branch": "$(git branch --show-current 2>/dev/null || echo 'unknown')",
    "commit_hash": "$(git rev-parse HEAD 2>/dev/null || echo 'initial')",
    "status": "$(git status --porcelain --cached | wc -l | tr -d ' ') files staged"
  },
  "project_info": {
    "working_directory": "$(pwd)",
    "user": "$USER", 
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  },
  "file_analysis": {
    "total_files": $(echo "$staged_files" | wc -l | tr -d ' '),
    "file_types": $(echo "$staged_files" | sed 's/.*\.//' | sort | uniq -c | jq -R -s 'split("\n")[:-1] | map(split(" ")[-1]) | unique')
  }
}
EOF
    )
    
    echo "$context_data"
}

##################################
# Subagent Delegation
##################################
delegate_to_quality_subagent() {
    local context="$1" 
    local staged_files="$2"
    
    log_info "Delegating quality analysis to style-enforcer subagent"
    
    echo "📊 QUALITY CHECK: Analyzing staged changes before commit"
    echo ""
    echo "Staged files for analysis:"
    echo "$staged_files" | sed 's/^/  - /'
    echo ""
    echo "Context for style-enforcer subagent:"
    echo "$context" | jq . 2>/dev/null || echo "$context"
    echo ""
    echo "Please analyze the staged changes for:"
    echo "- Code formatting and style consistency"
    echo "- Import organization and unused imports" 
    echo "- Type annotations and documentation"
    echo "- Best practices and code patterns"
    echo "- Performance considerations"
    echo ""
    echo "Provide specific feedback or type 'approved' if quality standards are met."
}

##################################
# Quick File Validation
##################################
validate_basic_file_integrity() {
    local staged_files="$1"
    
    log_debug "Performing basic file integrity checks"
    
    # Check for common issues that can be caught quickly
    local issues=()
    
    while IFS= read -r file; do
        [[ -z "$file" ]] && continue
        
        # Skip non-existent files (deletions)
        [[ ! -f "$file" ]] && continue
        
        # Check for basic syntax issues in common file types
        case "$file" in
            *.json)
                if ! jq . "$file" >/dev/null 2>&1; then
                    issues+=("Invalid JSON syntax: $file")
                fi
                ;;
            *.yml|*.yaml) 
                if command -v yq >/dev/null && ! yq . "$file" >/dev/null 2>&1; then
                    issues+=("Invalid YAML syntax: $file") 
                fi
                ;;
            *.sh)
                if ! bash -n "$file" 2>/dev/null; then
                    issues+=("Invalid shell syntax: $file")
                fi
                ;;
        esac
        
        # Check for potential credential patterns (quick scan)
        if grep -qE "(password|api_key|secret|token)\s*[:=]\s*['\"][^'\"]+['\"]" "$file" 2>/dev/null; then
            issues+=("Potential credential exposure: $file")
        fi
        
    done <<< "$staged_files"
    
    # Report immediate issues
    if [[ ${#issues[@]} -gt 0 ]]; then
        echo "⚠️  IMMEDIATE ISSUES FOUND:"
        printf '%s\n' "${issues[@]}" | sed 's/^/  - /'
        echo ""
        echo "Please fix these issues before committing."
        return 1
    fi
    
    return 0
}

##################################
# Main Hook Logic
##################################
main() {
    # Initialize error handling
    initialize_error_handling || {
        echo "ERROR: Failed to initialize error handling" >&2
        exit 1
    }
    
    log_info "Pre-commit quality check initiated"
    
    # Analyze what's being committed
    local staged_files
    staged_files=$(analyze_staged_changes)
    
    # Exit early if no staged changes
    if [[ -z "$staged_files" ]]; then
        exit 0
    fi
    
    # Perform quick validation checks
    if ! validate_basic_file_integrity "$staged_files"; then
        log_error "Basic file integrity checks failed"
        exit 1
    fi
    
    # Gather context for subagent analysis
    local context
    context=$(gather_quality_context "$staged_files")
    
    # Delegate to quality subagent for comprehensive analysis
    delegate_to_quality_subagent "$context" "$staged_files"
    
    log_info "Quality check delegation completed"
}

##################################
# Execute Hook
##################################
main "$@"